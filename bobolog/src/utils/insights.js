// Lokalna analityka BoboLog — wszystko liczone w przeglądarce, zero backendu.
// Wejście: entries z store.js (posortowane malejąco po `at`).

const MIN = 60000;
const DAY = 86400000;

function median(arr) {
    if (!arr.length) return null;
    const s = [...arr].sort((a, b) => a - b);
    const mid = Math.floor(s.length / 2);
    return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

function daysAgo(iso, now) {
    return (now - new Date(iso)) / DAY;
}

// ── Przewidywanie następnego karmienia ───────────────────────────────────────
// Mediana przerw między karmieniami z ostatnich 48h (fallback: ostatnie 10 karmień).

export function predictNextFeed(entries, now = Date.now()) {
    const feeds = entries.filter(e => e.type === 'feed').slice(0, 20);
    if (feeds.length < 3) return null;
    const gaps = [];
    for (let i = 1; i < feeds.length; i++) {
        const g = (new Date(feeds[i - 1].at) - new Date(feeds[i].at)) / MIN;
        if (g > 5 && g < 480) gaps.push(g);
    }
    const med = median(gaps);
    if (!med) return null;
    const lastAt = new Date(feeds[0].at).getTime();
    const at = lastAt + med * MIN;
    return { at, inMin: Math.round((at - now) / MIN), gapMin: Math.round(med), lastAt };
}

// ── Przewidywanie drzemki / pobudki ──────────────────────────────────────────
// Śpi → szacowana pobudka (mediana długości sesji z 14 dni).
// Nie śpi → szacowana następna drzemka (mediana "okna aktywności" między snami).

export function predictSleep(entries, sleepStartedAt, now = Date.now()) {
    const sleeps = entries
        .filter(e => e.type === 'sleep' && e.data?.start && daysAgo(e.at, now) <= 14)
        .slice(0, 40);
    if (sleeps.length < 3) return null;

    if (sleepStartedAt) {
        const durs = sleeps.map(e => (new Date(e.at) - new Date(e.data.start)) / MIN).filter(d => d > 5);
        const med = median(durs);
        if (!med) return null;
        const at = new Date(sleepStartedAt).getTime() + med * MIN;
        return { kind: 'wake', at, inMin: Math.round((at - now) / MIN), medianMin: Math.round(med) };
    }

    // okna aktywności: koniec snu → początek następnego (chronologicznie)
    const chrono = [...sleeps].reverse();
    const windows = [];
    for (let i = 1; i < chrono.length; i++) {
        const w = (new Date(chrono[i].data.start) - new Date(chrono[i - 1].at)) / MIN;
        if (w > 20 && w < 360) windows.push(w);
    }
    const med = median(windows);
    if (!med) return null;
    const lastEnd = new Date(chrono[chrono.length - 1].at).getTime();
    const at = lastEnd + med * MIN;
    return { kind: 'nap', at, inMin: Math.round((at - now) / MIN), medianMin: Math.round(med) };
}

// ── Rytm dnia ────────────────────────────────────────────────────────────────
// Profil 24h z ostatnich 14 dni: udział snu per godzina + liczba karmień per godzina.
// Zwraca też "typowe okna drzemek" (godziny 6–20 z udziałem snu ≥ 40%).

export function dayRhythm(entries, now = Date.now()) {
    const sleeps = entries.filter(e => e.type === 'sleep' && e.data?.start && daysAgo(e.at, now) <= 14);
    const feeds  = entries.filter(e => e.type === 'feed' && daysAgo(e.at, now) <= 14);
    if (sleeps.length < 3 && feeds.length < 5) return null;

    const daysCovered = Math.max(1, Math.min(14,
        Math.ceil(daysAgo([...sleeps, ...feeds].reduce((m, e) => e.at < m ? e.at : m, new Date(now).toISOString()), now))));

    const sleepMinPerHour = Array(24).fill(0);
    sleeps.forEach(e => {
        let t = new Date(e.data.start).getTime();
        const end = new Date(e.at).getTime();
        while (t < end) {
            const d = new Date(t);
            const hourEnd = new Date(d).setMinutes(60, 0, 0);
            sleepMinPerHour[d.getHours()] += (Math.min(end, hourEnd) - t) / MIN;
            t = hourEnd;
        }
    });

    const feedsPerHour = Array(24).fill(0);
    feeds.forEach(e => { feedsPerHour[new Date(e.at).getHours()]++; });

    const hourly = Array.from({ length: 24 }, (_, h) => ({
        h,
        sleepPct: Math.min(1, sleepMinPerHour[h] / (daysCovered * 60)),
        feeds: feedsPerHour[h],
    }));

    // typowe okna drzemek w ciągu dnia
    const napWindows = [];
    let cur = null;
    for (let h = 6; h <= 20; h++) {
        if (hourly[h].sleepPct >= 0.4) {
            cur ? (cur.toH = h + 1) : (cur = { fromH: h, toH: h + 1 });
        } else if (cur) { napWindows.push(cur); cur = null; }
    }
    if (cur) napWindows.push(cur);

    return { hourly, napWindows, daysCovered };
}

// ── Podsumowanie tygodnia ────────────────────────────────────────────────────

function rangeStats(entries, fromMs, toMs) {
    const inRange = entries.filter(e => {
        const t = new Date(e.at).getTime();
        return t >= fromMs && t < toMs;
    });
    const sleepMin = inRange
        .filter(e => e.type === 'sleep' && e.data?.start)
        .reduce((s, e) => s + Math.max(0, (new Date(e.at) - new Date(e.data.start)) / MIN), 0);
    return {
        feeds: inRange.filter(e => e.type === 'feed').length,
        diapers: inRange.filter(e => e.type === 'diaper').length,
        sleepMin: Math.round(sleepMin),
    };
}

export function weekSummary(entries, now = Date.now()) {
    const cur = rangeStats(entries, now - 7 * DAY, now);
    const prev = rangeStats(entries, now - 14 * DAY, now - 7 * DAY);
    if (cur.feeds + cur.diapers === 0 && cur.sleepMin === 0) return null;
    const pct = (c, p) => (p > 0 ? Math.round(((c - p) / p) * 100) : null);
    return {
        cur, prev,
        delta: {
            feeds: pct(cur.feeds, prev.feeds),
            diapers: pct(cur.diapers, prev.diapers),
            sleepMin: pct(cur.sleepMin, prev.sleepMin),
        },
    };
}

// ── Korelacja karmienia ↔ sen ────────────────────────────────────────────────
// Pearson r między liczbą karmień a sumą snu per dzień (ostatnie 21 dni, min 7 dni z danymi).

export function feedSleepCorrelation(entries, now = Date.now()) {
    const byDay = new Map();
    entries.forEach(e => {
        const age = daysAgo(e.at, now);
        if (age > 21 || age < 0) return;
        const key = new Date(e.at).toDateString();
        const d = byDay.get(key) || { feeds: 0, sleepMin: 0 };
        if (e.type === 'feed') d.feeds++;
        if (e.type === 'sleep' && e.data?.start)
            d.sleepMin += Math.max(0, (new Date(e.at) - new Date(e.data.start)) / MIN);
        byDay.set(key, d);
    });
    const days = [...byDay.values()].filter(d => d.feeds > 0 && d.sleepMin > 0);
    if (days.length < 7) return null;

    const xs = days.map(d => d.feeds), ys = days.map(d => d.sleepMin);
    const mx = xs.reduce((a, b) => a + b) / xs.length;
    const my = ys.reduce((a, b) => a + b) / ys.length;
    let num = 0, dx2 = 0, dy2 = 0;
    for (let i = 0; i < xs.length; i++) {
        num += (xs[i] - mx) * (ys[i] - my);
        dx2 += (xs[i] - mx) ** 2;
        dy2 += (ys[i] - my) ** 2;
    }
    if (!dx2 || !dy2) return null;
    const r = num / Math.sqrt(dx2 * dy2);
    if (Math.abs(r) < 0.45) return null;
    return { r: Math.round(r * 100) / 100, days: days.length, direction: r > 0 ? 'more' : 'less' };
}

// ── Miesięcznice ─────────────────────────────────────────────────────────────
// Zwraca najbliższą miesięcznicę (lub urodziny) w ciągu `horizon` dni: {months, date, inDays}.

export function nextMonthiversary(birthDate, now = new Date(), horizon = 7) {
    if (!birthDate) return null;
    const birth = new Date(birthDate + 'T12:00:00');
    const today = new Date(now); today.setHours(12, 0, 0, 0);

    const monthsSince = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    for (let m = Math.max(1, monthsSince); m <= monthsSince + 2; m++) {
        const d = new Date(birth);
        d.setMonth(birth.getMonth() + m);
        // dzień miesiąca może się "przekręcić" (31 → 1) — cofnij na koniec miesiąca
        if (d.getDate() !== birth.getDate()) d.setDate(0);
        const inDays = Math.round((d - today) / DAY);
        if (inDays >= 0 && inDays <= horizon) {
            return { months: m, date: d, inDays, isBirthday: m % 12 === 0, years: m / 12 };
        }
    }
    return null;
}

export function fmtMinShort(min) {
    const m = Math.round(Math.abs(min));
    const h = Math.floor(m / 60);
    return h > 0 ? `${h}h ${m % 60}m` : `${m} min`;
}
