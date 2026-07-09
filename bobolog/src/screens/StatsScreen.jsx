import { useState, useMemo } from 'react';
import { Fragment } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    ComposedChart, Line, ReferenceLine, CartesianGrid,
} from 'recharts';
import { Settings2, Eye, EyeOff, ArrowUp, ArrowDown, RotateCcw, Info, AlertTriangle, X } from 'lucide-react';
import CentileChart from '../components/CentileChart.jsx';
import { exportToCsv } from '../utils/exportCsv.js';
import { exportToPdf } from '../utils/exportPdf.js';

// ── Date helpers ─────────────────────────────────────────────────────────────

function toLocalDate(iso) {
    const d = new Date(iso);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function todayStr() { return toLocalDate(new Date().toISOString()); }

function shiftDate(dateStr, days) {
    const d = new Date(dateStr + 'T12:00:00');
    d.setDate(d.getDate() + days);
    return toLocalDate(d.toISOString());
}

function daysInRange(from, to) {
    const result = []; let cur = from;
    while (cur <= to) { result.push(cur); cur = shiftDate(cur, 1); }
    return result;
}

function fmtShort(dateStr) {
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
}

function fmtAxisLabel(dateStr, totalDays) {
    const d = new Date(dateStr + 'T12:00:00');
    if (totalDays <= 14) return `${d.getDate()}.${d.getMonth() + 1}`;
    if (totalDays <= 45) return String(d.getDate());
    return fmtShort(dateStr);
}

function fmtMin(min) {
    if (!min && min !== 0) return '–';
    const h = Math.floor(Math.abs(min) / 60), m = Math.round(Math.abs(min) % 60);
    return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

function pctDelta(cur, prv) {
    if (!prv || prv < 0.01) return null;
    return Math.round(((cur - prv) / prv) * 100);
}

function getPeriodLabel(days) {
    if (days === 7) return 'poprz. tydzień';
    if (days === 30) return 'poprz. miesiąc';
    if (days === 90) return 'poprz. 3 mies.';
    return `poprz. ${days} dni`;
}

// ── Stat calculations ────────────────────────────────────────────────────────

function calcFeedStats(entries, from, to) {
    const days = daysInRange(from, to);
    const n    = days.length || 1;
    const feeds = entries.filter(e => {
        const d = toLocalDate(e.at);
        return e.type === 'feed' && d >= from && d <= to;
    });

    const byDay = days.map(d => {
        const df = feeds.filter(e => toLocalDate(e.at) === d);
        return {
            date: d, label: fmtAxisLabel(d, days.length),
            total:       df.length,
            breastL:     df.filter(e => e.data?.kind === 'piers-l').length,
            breastP:     df.filter(e => e.data?.kind === 'piers-p').length,
            bottle:      df.filter(e => e.data?.kind === 'butelka').length,
            solid:       df.filter(e => e.data?.kind === 'stale').length,
            durationMin: df.reduce((s, e) => s + (e.data?.durationMin || 0), 0),
            amountMl:    df.reduce((s, e) => s + (e.data?.amountMl || 0), 0),
        };
    });

    const avgFeeds   = feeds.length / n;
    const avgDur     = feeds.reduce((s, e) => s + (e.data?.durationMin || 0), 0) / n;
    const avgMl      = feeds.reduce((s, e) => s + (e.data?.amountMl || 0), 0) / n;

    const sorted = [...feeds].sort((a, b) => a.at.localeCompare(b.at));
    let gapSum = 0, gapCnt = 0;
    for (let i = 1; i < sorted.length; i++) {
        const g = (new Date(sorted[i].at) - new Date(sorted[i - 1].at)) / 60000;
        if (g > 5 && g < 480) { gapSum += g; gapCnt++; }
    }
    const avgGap = gapCnt > 0 ? gapSum / gapCnt : null;

    const hourly = Array.from({ length: 24 }, (_, h) => ({
        h, count: feeds.filter(e => new Date(e.at).getHours() === h).length,
    }));

    return { byDay, avgFeeds, avgDur, avgMl, avgGap, hourly, total: feeds.length };
}

function calcSleepStats(entries, from, to) {
    const days = daysInRange(from, to);
    const n    = days.length || 1;
    const sleeps = entries.filter(e => {
        const d = toLocalDate(e.at);
        return e.type === 'sleep' && e.data?.start && d >= from && d <= to;
    });

    const byDay = days.map(d => {
        const ds = sleeps.filter(e => toLocalDate(e.at) === d);
        const totalMin = ds.reduce((s, e) => s + Math.max(0, (new Date(e.at) - new Date(e.data.start)) / 60000), 0);
        const nightMin = ds.reduce((s, e) => {
            const h = new Date(e.data.start).getHours();
            const dur = Math.max(0, (new Date(e.at) - new Date(e.data.start)) / 60000);
            return s + ((h >= 20 || h < 8) ? dur : 0);
        }, 0);
        const longestMin = ds.reduce((mx, e) => Math.max(mx, Math.max(0, (new Date(e.at) - new Date(e.data.start)) / 60000)), 0);
        return {
            date: d, label: fmtAxisLabel(d, days.length),
            totalMin:   Math.round(totalMin),
            nightMin:   Math.round(nightMin),
            dayMin:     Math.round(totalMin - nightMin),
            count:      ds.length,
            longestMin: Math.round(longestMin),
        };
    });

    const avgTotal   = byDay.reduce((s, d) => s + d.totalMin, 0) / n;
    const avgLongest = byDay.reduce((s, d) => s + d.longestMin, 0) / n;
    const avgCount   = byDay.reduce((s, d) => s + d.count, 0) / n;
    return { byDay, avgTotal, avgLongest, avgCount, total: sleeps.length };
}

function calcDiaperStats(entries, from, to) {
    const days = daysInRange(from, to);
    const n    = days.length || 1;
    const diapers = entries.filter(e => {
        const d = toLocalDate(e.at);
        return e.type === 'diaper' && d >= from && d <= to;
    });

    const byDay = days.map(d => {
        const dd = diapers.filter(e => toLocalDate(e.at) === d);
        return {
            date: d, label: fmtAxisLabel(d, days.length),
            total: dd.length,
            wet:   dd.filter(e => e.data?.kind === 'mokra').length,
            dirty: dd.filter(e => e.data?.kind === 'kupa').length,
            mixed: dd.filter(e => e.data?.kind === 'pelny-serwis').length,
        };
    });

    const wet   = diapers.filter(e => e.data?.kind === 'mokra').length;
    const dirty = diapers.filter(e => e.data?.kind === 'kupa').length;
    const mixed = diapers.filter(e => e.data?.kind === 'pelny-serwis').length;
    const pctWet = diapers.length > 0 ? Math.round((wet / diapers.length) * 100) : 0;
    return { byDay, avgTotal: diapers.length / n, wet, dirty, mixed, pctWet, total: diapers.length };
}

// ── Alert computation ────────────────────────────────────────────────────────

function computeAlerts(entries) {
    const alerts = [];
    if (!entries.length) return alerts;

    const today = todayStr();

    // 1. No dirty diaper in 3+ days
    const last3 = daysInRange(shiftDate(today, -2), today);
    const hasDiapersAtAll = entries.some(e => e.type === 'diaper');
    const hasDirtyLast3 = entries.some(e => {
        const d = toLocalDate(e.at);
        return e.type === 'diaper' && last3.includes(d) &&
            (e.data?.kind === 'kupa' || e.data?.kind === 'pelny-serwis');
    });
    if (hasDiapersAtAll && !hasDirtyLast3) {
        alerts.push({
            level: 'warn',
            emoji: '💩',
            text: 'Brak zabrudzonych pieluch od ponad 3 dni',
            sub: 'U niemowląt (szczególnie karmionych piersią) może to być normalne, ale warto obserwować.',
        });
    }

    // 2. Sleep decreased significantly (>25%) vs previous week
    const thisWeek = calcSleepStats(entries, shiftDate(today, -6), today);
    const prevWeek = calcSleepStats(entries, shiftDate(today, -13), shiftDate(today, -7));
    if (prevWeek.avgTotal > 60 && thisWeek.avgTotal > 0 &&
        thisWeek.avgTotal < prevWeek.avgTotal * 0.75) {
        const drop = Math.round((1 - thisWeek.avgTotal / prevWeek.avgTotal) * 100);
        alerts.push({
            level: 'warn',
            emoji: '😴',
            text: `Sen skrócił się o ${drop}% w tym tygodniu`,
            sub: `Śr. ${fmtMin(Math.round(thisWeek.avgTotal))} vs ${fmtMin(Math.round(prevWeek.avgTotal))} tydzień temu. Obserwuj przez kolejny dzień.`,
        });
    }

    // 3. Feeding intervals growing significantly (>40% longer in recent 3 vs previous 3)
    const recentFeeds = entries
        .filter(e => e.type === 'feed')
        .sort((a, b) => b.at.localeCompare(a.at));

    if (recentFeeds.length >= 7) {
        let recentGap = 0, oldGap = 0;
        for (let i = 1; i < 4; i++) {
            recentGap += (new Date(recentFeeds[i - 1].at) - new Date(recentFeeds[i].at)) / 60000;
        }
        for (let i = 4; i < 7; i++) {
            oldGap += (new Date(recentFeeds[i - 1].at) - new Date(recentFeeds[i].at)) / 60000;
        }
        const recentAvg = recentGap / 3;
        const oldAvg = oldGap / 3;
        if (oldAvg > 45 && recentAvg > oldAvg * 1.4) {
            alerts.push({
                level: 'info',
                emoji: '🍼',
                text: 'Przerwy między karmieniami się wydłużają',
                sub: `Ostatnio śr. ${fmtMin(Math.round(recentAvg))} – może oznaczać skok wzrostowy lub zmianę rytmu.`,
            });
        }
    }

    return alerts;
}

// ── Shared UI ────────────────────────────────────────────────────────────────

const C = {
    breastL: '#86C5A5', breastP: '#B5D9C8', bottle: '#7BAED4', solid: '#F0C89A',
    sleep: '#8B9ED4',   night: '#6B7FC4',   day: '#B0BEE8',
    wet: '#7BAED4',     dirty: '#F0C89A',   mixed: '#C8A0D8',
    avg: '#E86B6B',     prev: '#9BA8C0',    mood: '#C8A0D8',
};

const TT = {
    contentStyle: { background: 'var(--bb-card)', border: '2px solid var(--bb-border)', borderRadius: 12, fontSize: 12 },
    itemStyle: { padding: '1px 0' },
    cursor: { fill: 'var(--bb-soft)' },
};

// sense: 'pos' = więcej to dobrze, 'neg' = więcej to źle, 'neutral' = kontekstowe
const NEUTRAL_HINTS = {
    'Karmień/dzień':    d => d > 0 ? 'Skok wzrostowy lub regresja snu – obserwuj pattern.' : 'Mniej karmień – sprawdź nawodnienie.',
    'Sesji/dzień':      d => d > 0 ? 'Więcej krótkich drzemek – możliwe zaburzenia łączenia cykli snu.' : 'Drzemki mogą się konsolidować – to naturalny etap.',
    'ml butelki/dzień': d => d > 0 ? 'Wzrost ilości mleka – możliwy skok wzrostowy.' : 'Spadek ilości mleka – obserwuj masę ciała.',
    'Pieluch/dzień':    () => 'Liczba pieluch waha się zależnie od diety i nawodnienia.',
    'Zabrudzonych':     d => d > 0 ? 'Więcej zanieczyszczeń – zmiany w diecie lub normalny wzrost.' : 'Mniej zanieczyszczeń – obserwuj przez 2–3 dni.',
};

function KpiCard({ label, value, unit, delta, periodLabel, sense = 'pos', sub }) {
    const isPos = delta > 0, isNeg = delta < 0;
    let colorClass, isNeutral = false;

    if (delta !== null && delta !== undefined && delta !== 0) {
        if (sense === 'neutral') {
            colorClass = 'text-amber-500';
            isNeutral = true;
        } else if ((sense === 'pos' && isPos) || (sense === 'neg' && isNeg)) {
            colorClass = 'text-emerald-500';
        } else {
            colorClass = 'text-rose-400';
        }
    } else {
        colorClass = 'text-bb-muted';
    }

    const hint = isNeutral && NEUTRAL_HINTS[label] ? NEUTRAL_HINTS[label](delta) : null;

    return (
        <div className="bg-bb-card rounded-2xl p-4 space-y-0.5">
            <p className="text-xs text-bb-muted font-semibold truncate">{label}</p>
            <p className="font-display text-xl font-bold leading-tight">
                {value}
                {unit ? <span className="text-sm font-normal text-bb-muted ml-1">{unit}</span> : null}
            </p>
            {delta !== null && delta !== undefined && (
                <p className={`text-xs font-semibold flex items-center gap-1 flex-wrap ${colorClass}`}>
                    {isNeutral && <Info size={10} className="shrink-0" />}
                    <span>{isPos ? '+' : ''}{delta}%</span>
                    {periodLabel && <span className="font-normal text-bb-muted">vs {periodLabel}</span>}
                </p>
            )}
            {hint && <p className="text-[10px] text-amber-600 leading-tight">{hint}</p>}
            {sub && <p className="text-xs text-bb-muted">{sub}</p>}
        </div>
    );
}

function Legend({ items }) {
    return (
        <div className="flex flex-wrap gap-3">
            {items.map(([label, color]) => (
                <span key={label} className="flex items-center gap-1.5 text-xs text-bb-muted">
                    <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: color }} />
                    {label}
                </span>
            ))}
        </div>
    );
}

function SectionRender({ defs, sections }) {
    return (
        <div className="space-y-5">
            {sections.map(id => (defs[id] ? <Fragment key={id}>{defs[id]}</Fragment> : null))}
        </div>
    );
}

function CompareToggle({ on, onToggle }) {
    return (
        <button onClick={onToggle}
            className={`text-xs font-semibold px-3 py-1 rounded-full border transition-colors flex-shrink-0
                ${on ? 'bg-bb-soft border-bb-muted/50 text-bb-text' : 'border-bb-muted/30 text-bb-muted'}`}>
            {on ? '✓ ' : ''}Porównaj
        </button>
    );
}

function PeriodPicker({ days, endDate, onDays, onNav }) {
    const from = shiftDate(endDate, -(days - 1));
    const isLatest = endDate >= todayStr();
    const isPreset = [7, 30, 90].includes(days);
    const [showCustom, setShowCustom] = useState(!isPreset);
    const [custom, setCustom] = useState(isPreset ? '' : String(days));

    function applyCustom() {
        const n = Math.max(2, Math.min(365, parseInt(custom, 10) || 0));
        if (n >= 2) { setCustom(String(n)); onDays(n); }
    }

    return (
        <div className="space-y-2">
            <div className="flex bg-bb-soft rounded-2xl p-1 gap-1">
                {[7, 30, 90].map(d => (
                    <button key={d} onClick={() => { setShowCustom(false); onDays(d); }}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors
                            ${days === d && !showCustom ? 'bg-bb-card text-bb-text' : 'text-bb-muted'}`}>
                        {d === 7 ? 'Tydzień' : d === 30 ? 'Miesiąc' : '3 mies.'}
                    </button>
                ))}
                <button onClick={() => setShowCustom(true)}
                    className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors
                        ${showCustom ? 'bg-bb-card text-bb-text' : 'text-bb-muted'}`}>
                    Własny
                </button>
            </div>
            {showCustom && (
                <div className="flex items-center gap-2">
                    <input type="number" min="2" max="365" value={custom}
                        onChange={e => setCustom(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && applyCustom()}
                        placeholder="np. 14"
                        className="w-24 px-3 py-2 rounded-xl bg-bb-soft text-sm font-semibold outline-none" />
                    <span className="text-sm text-bb-muted font-semibold">dni (2–365)</span>
                    <button onClick={applyCustom}
                        className="ml-auto px-4 py-2 rounded-full bg-bb-primary text-xs font-bold">
                        Zastosuj
                    </button>
                </div>
            )}
            <div className="flex items-center gap-2">
                <button onClick={() => onNav(-1)}
                    className="w-10 h-10 rounded-full bg-bb-soft flex items-center justify-center text-xl font-bold text-bb-muted active:scale-90 transition-transform">
                    ‹
                </button>
                <span className="flex-1 text-center text-sm font-semibold">
                    {fmtShort(from)} – {fmtShort(endDate)}
                </span>
                <button onClick={() => onNav(1)} disabled={isLatest}
                    className="w-10 h-10 rounded-full bg-bb-soft flex items-center justify-center text-xl font-bold text-bb-muted active:scale-90 transition-transform disabled:opacity-30">
                    ›
                </button>
            </div>
        </div>
    );
}

// ── Alerts section ────────────────────────────────────────────────────────────

function AlertsSection({ entries }) {
    const [dismissed, setDismissed] = useState([]);
    const alerts = useMemo(() => computeAlerts(entries), [entries]);
    const visible = alerts.filter((_, i) => !dismissed.includes(i));
    if (!visible.length) return null;

    return (
        <div className="space-y-2">
            {alerts.map((a, i) => dismissed.includes(i) ? null : (
                <div key={i} className={`rounded-2xl px-4 py-3 flex items-start gap-3 border-2 ${
                    a.level === 'warn' ? 'bg-rose-500/10 border-rose-400/30' : 'bg-amber-500/10 border-amber-400/30'
                }`}>
                    <span className="text-lg shrink-0 mt-0.5">{a.emoji}</span>
                    <div className="flex-1 min-w-0">
                        <p className={`text-sm font-semibold ${a.level === 'warn' ? 'text-rose-600' : 'text-amber-600'}`}>
                            {a.text}
                        </p>
                        {a.sub && <p className="text-xs text-bb-muted mt-0.5 leading-relaxed">{a.sub}</p>}
                    </div>
                    <button onClick={() => setDismissed(d => [...d, i])} className="p-1 rounded-full text-bb-muted hover:bg-bb-soft shrink-0 mt-0.5">
                        <X size={14} />
                    </button>
                </div>
            ))}
        </div>
    );
}

// ── PDF modal ────────────────────────────────────────────────────────────────

function PdfExportModal({ entries, childName, onClose }) {
    const today    = new Date().toISOString().slice(0, 10);
    const monthAgo = new Date(Date.now() - 30 * 86400000).toISOString().slice(0, 10);
    const [from, setFrom] = useState(monthAgo);
    const [to, setTo]     = useState(today);
    return (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-bb-card rounded-3xl p-6 w-full max-w-sm space-y-4" onClick={e => e.stopPropagation()}>
                <h2 className="font-display text-lg font-bold">Eksport PDF</h2>
                <div className="space-y-3">
                    <label className="block text-sm font-semibold text-bb-muted">
                        Od
                        <input type="date" value={from} onChange={e => setFrom(e.target.value)}
                            className="block w-full mt-1 px-3 py-2 rounded-xl bg-bb-soft text-bb-text text-sm focus:outline-none" />
                    </label>
                    <label className="block text-sm font-semibold text-bb-muted">
                        Do
                        <input type="date" value={to} onChange={e => setTo(e.target.value)}
                            className="block w-full mt-1 px-3 py-2 rounded-xl bg-bb-soft text-bb-text text-sm focus:outline-none" />
                    </label>
                </div>
                <div className="flex gap-2">
                    <button onClick={onClose}
                        className="flex-1 py-2.5 rounded-full border border-bb-muted/30 text-sm font-semibold text-bb-muted">
                        Anuluj
                    </button>
                    <button onClick={() => { exportToPdf(entries, childName, from, to); onClose(); }}
                        className="flex-1 py-2.5 rounded-full bg-bb-accent text-white text-sm font-semibold">
                        Pobierz PDF
                    </button>
                </div>
            </div>
        </div>
    );
}

// ── Sleep heatmap ─────────────────────────────────────────────────────────────

function SleepHeatmap({ entries, referenceDate }) {
    const ref = referenceDate || todayStr();
    const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(ref + 'T12:00:00');
        d.setDate(d.getDate() - (6 - i));
        return d;
    });

    function isSleeping(day, hour) {
        return entries.some(e => {
            const start = new Date(e.data.start);
            const end   = new Date(e.at);
            const cell  = new Date(day);
            cell.setHours(hour, 0, 0, 0);
            return cell >= start && cell < end;
        });
    }

    return (
        <div className="overflow-x-auto">
            <div className="grid" style={{ gridTemplateColumns: 'auto repeat(24, 1fr)', gap: 2, minWidth: 340 }}>
                <div />
                {Array.from({ length: 24 }, (_, h) => (
                    <div key={h} className="text-center text-bb-muted" style={{ fontSize: 8 }}>
                        {h % 6 === 0 ? `${h}h` : ''}
                    </div>
                ))}
                {days.map((day, di) => (
                    <Fragment key={di}>
                        <div className="text-bb-muted pr-1 flex items-center justify-end" style={{ fontSize: 9 }}>
                            {day.toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric' })}
                        </div>
                        {Array.from({ length: 24 }, (_, h) => (
                            <div key={h}
                                className={`rounded-sm ${isSleeping(day, h) ? 'bg-bb-accent' : 'bg-bb-soft'}`}
                                style={{ height: 14 }} />
                        ))}
                    </Fragment>
                ))}
            </div>
        </div>
    );
}

// ── Mood helpers ──────────────────────────────────────────────────────────────

function moodEmoji(score) {
    if (score >= 9) return '😄';
    if (score >= 7) return '😊';
    if (score >= 5) return '😐';
    if (score >= 3) return '😟';
    return '😢';
}

// ── Day tab (hourly timeline) ─────────────────────────────────────────────────

function DayTab({ entries }) {
    const [date, setDate] = useState(todayStr);
    const today = todayStr();

    const dayEntries = useMemo(() =>
        entries.filter(e => toLocalDate(e.at) === date),
        [entries, date]
    );

    const totalFeeds   = dayEntries.filter(e => e.type === 'feed').length;
    const totalDiapers = dayEntries.filter(e => e.type === 'diaper').length;
    const totalSleepMin = dayEntries
        .filter(e => e.type === 'sleep' && e.data?.start)
        .reduce((s, e) => s + Math.max(0, (new Date(e.at) - new Date(e.data.start)) / 60000), 0);

    const moodEntries = dayEntries.filter(e => e.type === 'mood');
    const avgMood = moodEntries.length
        ? moodEntries.reduce((s, e) => s + (e.data?.score || 5), 0) / moodEntries.length
        : null;

    // Build timeline: only hours with activity
    const hoursWithActivity = Array.from({ length: 24 }, (_, h) => {
        const feedsH   = dayEntries.filter(e => e.type === 'feed'   && new Date(e.at).getHours() === h);
        const diapersH = dayEntries.filter(e => e.type === 'diaper' && new Date(e.at).getHours() === h);
        const moods    = dayEntries.filter(e => e.type === 'mood'   && new Date(e.at).getHours() === h);
        const sleepsH  = dayEntries.filter(e => {
            if (e.type !== 'sleep' || !e.data?.start) return false;
            const start = new Date(e.data.start);
            const end   = new Date(e.at);
            const hStart = new Date(date + `T${String(h).padStart(2, '0')}:00:00`);
            const hEnd   = new Date(date + `T${String(h).padStart(2, '0')}:59:59`);
            return start <= hEnd && end >= hStart;
        });
        return { h, feeds: feedsH, diapers: diapersH, sleeps: sleepsH, moods };
    }).filter(h => h.feeds.length || h.diapers.length || h.sleeps.length || h.moods.length);

    function feedLabel(e) {
        if (e.data?.kind === 'butelka')  return e.data.amountMl ? `${e.data.amountMl} ml` : 'but.';
        if (e.data?.kind === 'piers-l')  return `L${e.data.durationMin ? ` ${e.data.durationMin}m` : ''}`;
        if (e.data?.kind === 'piers-p')  return `P${e.data.durationMin ? ` ${e.data.durationMin}m` : ''}`;
        if (e.data?.kind === 'stale')    return 'stałe';
        return '?';
    }

    function diaperLabel(e) {
        if (e.data?.kind === 'kupa')          return '💩';
        if (e.data?.kind === 'pelny-serwis')  return '💧💩';
        return '💧';
    }

    return (
        <div className="space-y-4">
            {/* Date nav */}
            <div className="flex items-center gap-2">
                <button onClick={() => setDate(d => shiftDate(d, -1))}
                    className="w-10 h-10 rounded-full bg-bb-soft flex items-center justify-center text-xl font-bold text-bb-muted active:scale-90 transition-transform">
                    ‹
                </button>
                <span className="flex-1 text-center text-sm font-semibold">
                    {date === today ? 'Dziś' : new Date(date + 'T12:00:00').toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
                <button onClick={() => setDate(d => shiftDate(d, 1))} disabled={date >= today}
                    className="w-10 h-10 rounded-full bg-bb-soft flex items-center justify-center text-xl font-bold text-bb-muted active:scale-90 transition-transform disabled:opacity-30">
                    ›
                </button>
            </div>

            {/* Day summary */}
            <div className="grid grid-cols-3 gap-3">
                <div className="bg-bb-primary rounded-2xl p-4 text-center">
                    <p className="font-display font-bold text-xl">{totalFeeds}</p>
                    <p className="text-xs font-semibold text-bb-muted mt-0.5">karmień</p>
                </div>
                <div className="bg-bb-accent rounded-2xl p-4 text-center">
                    <p className="font-display font-bold text-xl">{fmtMin(Math.round(totalSleepMin))}</p>
                    <p className="text-xs font-semibold text-bb-muted mt-0.5">snu</p>
                </div>
                <div className="bg-bb-accent2 rounded-2xl p-4 text-center">
                    <p className="font-display font-bold text-xl">{totalDiapers}</p>
                    <p className="text-xs font-semibold text-bb-muted mt-0.5">pieluch</p>
                </div>
            </div>

            {/* Mood */}
            {avgMood !== null ? (
                <div className="bg-bb-card rounded-2xl p-4 flex items-center gap-3">
                    <span className="text-3xl">{moodEmoji(avgMood)}</span>
                    <div>
                        <p className="font-semibold">Nastrój dnia: {avgMood.toFixed(1)}/10</p>
                        <p className="text-xs text-bb-muted">{moodEntries.length} {moodEntries.length === 1 ? 'ocena' : 'oceny'}</p>
                    </div>
                </div>
            ) : (
                <div className="bg-bb-soft rounded-2xl px-4 py-3">
                    <p className="text-xs text-bb-muted text-center">Brak oceny nastroju – dodaj przez szybki wpis „Nastrój"</p>
                </div>
            )}

            {/* Hourly timeline */}
            <div className="bg-bb-card rounded-2xl p-4 space-y-3">
                <p className="text-sm font-semibold">Oś czasu dnia</p>
                {hoursWithActivity.length === 0 ? (
                    <p className="text-center text-bb-muted text-sm py-6">Brak wpisów na ten dzień</p>
                ) : (
                    <div className="space-y-2">
                        {hoursWithActivity.map(({ h, feeds, diapers, sleeps, moods }) => (
                            <div key={h} className="flex items-start gap-3">
                                <span className="text-xs text-bb-muted font-semibold w-9 shrink-0 pt-1.5 text-right tabular-nums">
                                    {String(h).padStart(2, '0')}:00
                                </span>
                                <div className="flex flex-wrap gap-1.5 flex-1 pt-1">
                                    {sleeps.map((e, i) => {
                                        const dur = Math.round((new Date(e.at) - new Date(e.data.start)) / 60000);
                                        return (
                                            <span key={`s${i}`} style={{ background: C.sleep }}
                                                className="text-xs font-semibold px-2.5 py-1 rounded-full text-white">
                                                💤 {fmtMin(dur)}
                                            </span>
                                        );
                                    })}
                                    {feeds.map((e, i) => (
                                        <span key={`f${i}`} style={{ background: C.breastL }}
                                            className="text-xs font-semibold px-2.5 py-1 rounded-full">
                                            🍼 {feedLabel(e)}
                                        </span>
                                    ))}
                                    {diapers.map((e, i) => (
                                        <span key={`d${i}`} style={{ background: C.bottle }}
                                            className="text-xs font-semibold px-2.5 py-1 rounded-full text-white">
                                            {diaperLabel(e)}
                                        </span>
                                    ))}
                                    {moods.map((e, i) => (
                                        <span key={`m${i}`} style={{ background: C.mood }}
                                            className="text-xs font-semibold px-2.5 py-1 rounded-full">
                                            {moodEmoji(e.data?.score || 5)} {e.data?.score}/10
                                        </span>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="flex gap-2">
                <button onClick={() => setDate(todayStr())} disabled={date === today}
                    className="flex-1 text-xs font-semibold text-bb-muted border border-bb-muted/30 rounded-full py-2 disabled:opacity-30">
                    Wróć do dziś
                </button>
            </div>
        </div>
    );
}

// ── Trend tab (long-term weekly) ──────────────────────────────────────────────

function TrendTab({ entries }) {
    if (entries.length < 10) {
        return (
            <div className="text-center py-10 text-bb-muted space-y-2">
                <p className="text-4xl">📈</p>
                <p className="font-semibold">Za mało danych</p>
                <p className="text-sm">Historia tygodniowa pojawi się po kilku tygodniach używania aplikacji.</p>
            </div>
        );
    }

    const weeks = new Map();
    entries.forEach(e => {
        const d   = new Date(e.at);
        const day = d.getDay() || 7;
        const mon = new Date(d);
        mon.setDate(d.getDate() - (day - 1));
        const key = toLocalDate(mon.toISOString());
        if (!weeks.has(key)) weeks.set(key, { key, feeds: 0, sleepMin: 0, diapers: 0, moods: [], days: new Set() });
        const w = weeks.get(key);
        w.days.add(toLocalDate(e.at));
        if (e.type === 'feed')   w.feeds++;
        if (e.type === 'sleep' && e.data?.start)
            w.sleepMin += Math.max(0, (new Date(e.at) - new Date(e.data.start)) / 60000);
        if (e.type === 'diaper') w.diapers++;
        if (e.type === 'mood' && e.data?.score) w.moods.push(e.data.score);
    });

    const weekData = [...weeks.entries()]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, w]) => {
            const n = Math.max(w.days.size, 1);
            return {
                label: fmtShort(w.key),
                avgFeeds:   +(w.feeds / n).toFixed(1),
                avgSleepMin: +(w.sleepMin / n).toFixed(0),
                avgDiapers:  +(w.diapers / n).toFixed(1),
                avgMood: w.moods.length ? +(w.moods.reduce((a, b) => a + b, 0) / w.moods.length).toFixed(1) : null,
            };
        });

    if (weekData.length < 2) {
        return <p className="text-center text-bb-muted py-8 text-sm">Jeszcze za mało tygodni – wróć za kilka dni.</p>;
    }

    return (
        <div className="space-y-5">
            <div className="bg-bb-card rounded-2xl p-4 space-y-3">
                <p className="text-sm font-semibold">Karmienia/dzień — trend tygodniowy</p>
                <ResponsiveContainer width="100%" height={160}>
                    <ComposedChart data={weekData} margin={{ top: 8, right: 8, bottom: 0, left: -14 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-border)" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                        <Tooltip {...TT} formatter={v => [v, 'Śr./dzień']} />
                        <Line type="monotone" dataKey="avgFeeds" stroke={C.breastL} strokeWidth={2.5} dot={{ r: 3, fill: C.breastL }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-bb-card rounded-2xl p-4 space-y-3">
                <p className="text-sm font-semibold">Sen/dzień — trend tygodniowy</p>
                <ResponsiveContainer width="100%" height={160}>
                    <ComposedChart data={weekData} margin={{ top: 8, right: 8, bottom: 0, left: -4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-border)" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={fmtMin} width={38} />
                        <Tooltip {...TT} formatter={v => [fmtMin(+v), 'Śr./dzień']} />
                        <Line type="monotone" dataKey="avgSleepMin" stroke={C.sleep} strokeWidth={2.5} dot={{ r: 3, fill: C.sleep }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            <div className="bg-bb-card rounded-2xl p-4 space-y-3">
                <p className="text-sm font-semibold">Pieluchy/dzień — trend tygodniowy</p>
                <ResponsiveContainer width="100%" height={140}>
                    <ComposedChart data={weekData} margin={{ top: 8, right: 8, bottom: 0, left: -14 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-border)" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                        <Tooltip {...TT} formatter={v => [v, 'Śr./dzień']} />
                        <Line type="monotone" dataKey="avgDiapers" stroke={C.wet} strokeWidth={2.5} dot={{ r: 3, fill: C.wet }} />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>

            {weekData.some(w => w.avgMood !== null) && (
                <div className="bg-bb-card rounded-2xl p-4 space-y-3">
                    <p className="text-sm font-semibold">Nastrój/tydzień — skala 1–10</p>
                    <ResponsiveContainer width="100%" height={140}>
                        <ComposedChart data={weekData} margin={{ top: 8, right: 8, bottom: 0, left: -14 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-border)" vertical={false} />
                            <XAxis dataKey="label" tick={{ fontSize: 9 }} interval="preserveStartEnd" />
                            <YAxis tick={{ fontSize: 10 }} domain={[0, 10]} />
                            <Tooltip {...TT} formatter={v => [v ?? '–', 'Śr. nastrój']} />
                            <ReferenceLine y={5} stroke="var(--bb-border)" strokeDasharray="4 2" />
                            <Line type="monotone" dataKey="avgMood" stroke={C.mood} strokeWidth={2.5}
                                dot={{ r: 3, fill: C.mood }} connectNulls />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>
            )}
        </div>
    );
}

// ── Feed tab ──────────────────────────────────────────────────────────────────

function FeedTab({ entries, from, to, prevFrom, prevTo, sections, periodLabel }) {
    const [compare, setCompare] = useState(false);

    const stats = useMemo(() => calcFeedStats(entries, from, to),         [entries, from, to]);
    const prev  = useMemo(() => calcFeedStats(entries, prevFrom, prevTo), [entries, prevFrom, prevTo]);

    const chartData = stats.byDay.map((d, i) => ({ ...d, prevTotal: prev.byDay[i]?.total ?? 0 }));
    const maxH = Math.max(...stats.hourly.map(h => h.count), 1);

    const recentFeeds = [...entries].filter(e => e.type === 'feed').sort((a, b) => b.at.localeCompare(a.at)).slice(0, 7);
    let gapSum = 0, gapCnt = 0;
    for (let i = 1; i < recentFeeds.length; i++) {
        const g = (new Date(recentFeeds[i - 1].at) - new Date(recentFeeds[i].at)) / 60000;
        if (g > 5 && g < 480) { gapSum += g; gapCnt++; }
    }
    const avgGapMs = gapCnt > 0 ? (gapSum / gapCnt) * 60000 : null;
    const lastFeed  = recentFeeds[0];
    const nextFeed  = lastFeed && avgGapMs ? new Date(new Date(lastFeed.at).getTime() + avgGapMs) : null;
    const nextInMs  = nextFeed ? nextFeed - Date.now() : null;

    const defs = {
        kpi: (
            <div className="grid grid-cols-2 gap-3">
                <KpiCard label="Karmień/dzień"     value={stats.avgFeeds.toFixed(1)}           periodLabel={periodLabel} sense="neutral" delta={pctDelta(stats.avgFeeds, prev.avgFeeds)} />
                <KpiCard label="Czas pierś/dzień"  value={fmtMin(Math.round(stats.avgDur))}    periodLabel={periodLabel} sense="pos"     delta={pctDelta(stats.avgDur, prev.avgDur)} />
                {stats.avgMl > 0.5 && (
                    <KpiCard label="ml butelki/dzień" value={Math.round(stats.avgMl)} unit="ml" periodLabel={periodLabel} sense="neutral" delta={pctDelta(stats.avgMl, prev.avgMl)} />
                )}
                {stats.avgGap && (
                    <KpiCard label="Śr. przerwa" value={fmtMin(Math.round(stats.avgGap))} sub="między karmieniami" />
                )}
            </div>
        ),
        forecast: nextFeed ? (
            <div className="bg-bb-soft rounded-2xl p-4">
                <p className="text-xs text-bb-muted font-semibold mb-1">Prognoza następnego karmienia</p>
                <p className="font-display font-bold text-xl">
                    {nextInMs > 0
                        ? `za ${fmtMin(Math.round(nextInMs / 60000))}`
                        : `ok. ${nextFeed.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}`}
                </p>
                <p className="text-xs text-bb-muted mt-0.5">
                    Śr. interwał: {fmtMin(Math.round(avgGapMs / 60000))} · ostatnie: {new Date(lastFeed.at).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' })}
                </p>
            </div>
        ) : null,
        daily: (
            <div className="bg-bb-card rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">Karmienia dziennie</p>
                    <CompareToggle on={compare} onToggle={() => setCompare(c => !c)} />
                </div>
                <ResponsiveContainer width="100%" height={190}>
                    <ComposedChart data={chartData} margin={{ top: 12, right: 8, bottom: 0, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-border)" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                        <Tooltip {...TT} formatter={(v, k) => [v, k === 'total' ? 'Ten okres' : 'Poprzedni']} />
                        <Bar dataKey="total" name="Ten okres" fill={C.breastL} radius={[4, 4, 0, 0]} maxBarSize={36} />
                        {compare && (
                            <Line type="monotone" dataKey="prevTotal" name="Poprzedni" stroke={C.prev}
                                strokeWidth={2} dot={false} strokeDasharray="5 3" />
                        )}
                        <ReferenceLine y={stats.avgFeeds} stroke={C.avg} strokeDasharray="6 3"
                            label={{ value: `śr. ${stats.avgFeeds.toFixed(1)}`, position: 'insideTopRight', fontSize: 10, fill: C.avg }} />
                    </ComposedChart>
                </ResponsiveContainer>
                {compare && (
                    <Legend items={[['Ten okres', C.breastL], ['Poprzedni', C.prev], ['Średnia', C.avg]]} />
                )}
            </div>
        ),
        split: (
            <div className="bg-bb-card rounded-2xl p-4 space-y-3">
                <p className="text-sm font-semibold">Podział: pierś vs butelka</p>
                <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={stats.byDay} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-border)" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                        <Tooltip {...TT} />
                        <Bar dataKey="breastL" name="Pierś L"  stackId="a" fill={C.breastL} />
                        <Bar dataKey="breastP" name="Pierś P"  stackId="a" fill={C.breastP} />
                        <Bar dataKey="bottle"  name="Butelka"  stackId="a" fill={C.bottle} />
                        {stats.byDay.some(d => d.solid > 0) && (
                            <Bar dataKey="solid" name="Stałe"  stackId="a" fill={C.solid} radius={[4, 4, 0, 0]} />
                        )}
                    </BarChart>
                </ResponsiveContainer>
                <Legend items={[['Pierś L', C.breastL], ['Pierś P', C.breastP], ['Butelka', C.bottle]]} />
            </div>
        ),
        duration: stats.byDay.some(d => d.durationMin > 0) ? (
            <div className="bg-bb-card rounded-2xl p-4 space-y-3">
                <p className="text-sm font-semibold">Czas karmienia pierś (min/dzień)</p>
                <ResponsiveContainer width="100%" height={150}>
                    <ComposedChart data={stats.byDay} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-border)" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}m`} />
                        <Tooltip {...TT} formatter={(v) => [`${v} min`, 'Czas']} />
                        <Bar dataKey="durationMin" name="min" fill={C.breastL} radius={[4, 4, 0, 0]} maxBarSize={36} />
                        <ReferenceLine y={Math.round(stats.avgDur)} stroke={C.avg} strokeDasharray="6 3" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        ) : null,
        ml: stats.byDay.some(d => d.amountMl > 0) ? (
            <div className="bg-bb-card rounded-2xl p-4 space-y-3">
                <p className="text-sm font-semibold">ml z butelki dziennie</p>
                <ResponsiveContainer width="100%" height={150}>
                    <ComposedChart data={stats.byDay} margin={{ top: 4, right: 8, bottom: 0, left: -8 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-border)" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={v => `${v}ml`} />
                        <Tooltip {...TT} formatter={(v) => [`${v} ml`, 'Ilość']} />
                        <Bar dataKey="amountMl" name="ml" fill={C.bottle} radius={[4, 4, 0, 0]} maxBarSize={36} />
                        <ReferenceLine y={Math.round(stats.avgMl)} stroke={C.avg} strokeDasharray="6 3" />
                    </ComposedChart>
                </ResponsiveContainer>
            </div>
        ) : null,
        hours: (
            <div className="bg-bb-card rounded-2xl p-4 space-y-3">
                <p className="text-sm font-semibold">Karmienia wg godziny</p>
                <div className="space-y-1.5">
                    {[stats.hourly.slice(0, 12), stats.hourly.slice(12)].map((row, ri) => (
                        <div key={ri} className="flex gap-0.5">
                            {row.map(({ h, count }) => (
                                <div key={h} className="flex-1 flex flex-col items-center gap-0.5">
                                    <div className="w-full rounded-sm"
                                        style={{ height: 32, background: `rgba(134,197,165,${count / maxH})`, minHeight: 2 }} />
                                    <span className="text-[8px] text-bb-muted leading-none">{h}</span>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
                <p className="text-[10px] text-bb-muted">Godziny 0–11 (górny rząd) i 12–23 (dolny). Ciemniejszy = częściej.</p>
            </div>
        ),
    };
    return <SectionRender defs={defs} sections={sections} />;
}

// ── Sleep tab ─────────────────────────────────────────────────────────────────

function SleepTab({ entries, from, to, prevFrom, prevTo, sleepStartedAt, sections, periodLabel }) {
    const [compare, setCompare] = useState(false);

    const stats = useMemo(() => calcSleepStats(entries, from, to),         [entries, from, to]);
    const prev  = useMemo(() => calcSleepStats(entries, prevFrom, prevTo), [entries, prevFrom, prevTo]);

    const chartData = stats.byDay.map((d, i) => ({ ...d, prevTotal: prev.byDay[i]?.totalMin ?? 0 }));

    const sleepEntries = entries.filter(e => e.type === 'sleep' && e.data?.start);
    const durations = sleepEntries.slice(0, 5).map(e => Math.max(0, new Date(e.at) - new Date(e.data.start)));
    const avgDurMs  = durations.length >= 2 ? durations.reduce((a, b) => a + b, 0) / durations.length : null;
    const wakeAt    = sleepStartedAt && avgDurMs ? new Date(new Date(sleepStartedAt).getTime() + avgDurMs) : null;
    const wakeInMs  = wakeAt ? wakeAt - Date.now() : null;

    const defs = {
        kpi: (
            <div className="grid grid-cols-2 gap-3">
                <KpiCard label="Sen/dzień"         value={fmtMin(Math.round(stats.avgTotal))}   periodLabel={periodLabel} sense="pos"     delta={pctDelta(stats.avgTotal, prev.avgTotal)} />
                <KpiCard label="Najdłuższa sesja"  value={fmtMin(Math.round(stats.avgLongest))} periodLabel={periodLabel} sense="pos"     delta={pctDelta(stats.avgLongest, prev.avgLongest)} />
                <KpiCard label="Sesji/dzień"       value={stats.avgCount.toFixed(1)}            periodLabel={periodLabel} sense="neutral" delta={pctDelta(stats.avgCount, prev.avgCount)} />
                {avgDurMs && (
                    <KpiCard label={wakeAt && wakeInMs > 0 ? 'Przebudzenie (est.)' : 'Śr. sesja snu'}
                        value={wakeAt && wakeInMs > 0 ? `za ${fmtMin(Math.round(wakeInMs / 60000))}` : fmtMin(Math.round(avgDurMs / 60000))}
                        sub={wakeAt ? `Śr. sesja: ${fmtMin(Math.round(avgDurMs / 60000))}` : 'ostatnie 5 sesji'} />
                )}
            </div>
        ),
        daily: (
            <div className="bg-bb-card rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-2">
                    <p className="text-sm font-semibold">Sen dzienny</p>
                    <CompareToggle on={compare} onToggle={() => setCompare(c => !c)} />
                </div>
                <ResponsiveContainer width="100%" height={190}>
                    <ComposedChart data={chartData} margin={{ top: 12, right: 8, bottom: 0, left: -4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-border)" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={fmtMin} width={38} />
                        <Tooltip {...TT} formatter={(v) => fmtMin(v)} />
                        <Bar dataKey="totalMin" name="Sen" fill={C.sleep} radius={[4, 4, 0, 0]} maxBarSize={36} />
                        {compare && (
                            <Line type="monotone" dataKey="prevTotal" name="Poprzedni" stroke={C.prev}
                                strokeWidth={2} dot={false} strokeDasharray="5 3" />
                        )}
                        <ReferenceLine y={stats.avgTotal} stroke={C.avg} strokeDasharray="6 3"
                            label={{ value: fmtMin(Math.round(stats.avgTotal)), position: 'insideTopRight', fontSize: 10, fill: C.avg }} />
                    </ComposedChart>
                </ResponsiveContainer>
                {compare && <Legend items={[['Ten okres', C.sleep], ['Poprzedni', C.prev]]} />}
            </div>
        ),
        nightday: (
            <div className="bg-bb-card rounded-2xl p-4 space-y-3">
                <p className="text-sm font-semibold">Nocny (20:00–08:00) vs dzienny</p>
                <ResponsiveContainer width="100%" height={160}>
                    <BarChart data={stats.byDay} margin={{ top: 4, right: 8, bottom: 0, left: -4 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-border)" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 10 }} tickFormatter={fmtMin} width={38} />
                        <Tooltip {...TT} formatter={(v) => fmtMin(v)} />
                        <Bar dataKey="nightMin" name="Nocny"   stackId="a" fill={C.night} />
                        <Bar dataKey="dayMin"   name="Dzienny" stackId="a" fill={C.day} radius={[4, 4, 0, 0]} maxBarSize={36} />
                    </BarChart>
                </ResponsiveContainer>
                <Legend items={[['Nocny', C.night], ['Dzienny', C.day]]} />
            </div>
        ),
        heatmap: (
            <div className="bg-bb-card rounded-2xl p-4 space-y-3">
                <p className="text-sm font-semibold">Heatmapa snu (ostatnie 7 dni okresu)</p>
                <SleepHeatmap entries={sleepEntries} referenceDate={to} />
            </div>
        ),
    };
    return <SectionRender defs={defs} sections={sections} />;
}

// ── Diaper tab ────────────────────────────────────────────────────────────────

function DiaperTab({ entries, from, to, prevFrom, prevTo, sections, periodLabel }) {
    const stats = useMemo(() => calcDiaperStats(entries, from, to),         [entries, from, to]);
    const prev  = useMemo(() => calcDiaperStats(entries, prevFrom, prevTo), [entries, prevFrom, prevTo]);

    const defs = {
        kpi: (
            <div className="grid grid-cols-2 gap-3">
                <KpiCard label="Pieluch/dzień"   value={stats.avgTotal.toFixed(1)}        periodLabel={periodLabel} sense="neutral" delta={pctDelta(stats.avgTotal, prev.avgTotal)} />
                <KpiCard label="Mokrych"         value={`${stats.pctWet}%`}               sub={`${stats.wet} szt. — wskaźnik nawodnienia`} />
                <KpiCard label="Zabrudzonych"    value={stats.dirty + stats.mixed} unit="szt."
                    sub={`${stats.dirty} kupa + ${stats.mixed} pełna`}
                    periodLabel={periodLabel} sense="neutral"
                    delta={pctDelta(stats.dirty + stats.mixed, prev.dirty + prev.mixed)} />
                <KpiCard label="Łącznie w okresie" value={stats.total} unit="szt." />
            </div>
        ),
        daily: (
            <div className="bg-bb-card rounded-2xl p-4 space-y-3">
                <p className="text-sm font-semibold">Pieluchy dziennie</p>
                <ResponsiveContainer width="100%" height={190}>
                    <BarChart data={stats.byDay} margin={{ top: 4, right: 8, bottom: 0, left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-border)" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 10 }} allowDecimals={false} />
                        <Tooltip {...TT} />
                        <Bar dataKey="wet"   name="Mokra"  stackId="a" fill={C.wet} />
                        <Bar dataKey="dirty" name="Kupa"   stackId="a" fill={C.dirty} />
                        <Bar dataKey="mixed" name="Pełna"  stackId="a" fill={C.mixed} radius={[4, 4, 0, 0]} maxBarSize={36} />
                    </BarChart>
                </ResponsiveContainer>
                <Legend items={[['Mokra', C.wet], ['Kupa', C.dirty], ['Mokra+kupa', C.mixed]]} />
            </div>
        ),
    };
    return <SectionRender defs={defs} sections={sections} />;
}

// ── Weight tab ────────────────────────────────────────────────────────────────

function WeightTab({ entries, activeChild, sections }) {
    const measurements = entries.filter(e => e.type === 'weight');
    if (!measurements.length) {
        return (
            <div className="text-center py-10 text-bb-muted space-y-2">
                <p className="text-4xl">⚖️</p>
                <p className="font-semibold">Brak pomiarów</p>
                <p className="text-sm">Dodaj pomiar wagi przez szybki wpis „Pomiar".</p>
            </div>
        );
    }
    const defs = {
        centile: (
            <CentileChart measurements={measurements} gender={activeChild?.gender} birthDate={activeChild?.birth_date} />
        ),
        history: (
            <div className="space-y-2">
                <p className="text-sm text-bb-muted font-semibold">Historia pomiarów</p>
                <ul className="space-y-2">
                    {measurements.slice(0, 10).map(e => (
                        <li key={e.id} className="bg-bb-card rounded-2xl border-2 border-bb-border px-4 py-3 flex justify-between items-center">
                            <div className="space-x-3">
                                {e.data.weightKg && <span className="font-bold">{e.data.weightKg} kg</span>}
                                {e.data.heightCm && <span className="text-bb-muted font-semibold">{e.data.heightCm} cm</span>}
                                {e.data.headCm   && <span className="text-bb-muted font-semibold">👶 {e.data.headCm} cm</span>}
                            </div>
                            <span className="text-xs text-bb-muted">{new Date(e.at).toLocaleDateString('pl-PL')}</span>
                        </li>
                    ))}
                </ul>
            </div>
        ),
    };
    return <SectionRender defs={defs} sections={sections} />;
}

// ── Mood stats ────────────────────────────────────────────────────────────────

function calcMoodStats(entries, from, to) {
    const days  = daysInRange(from, to);
    const moods = entries.filter(e => {
        const d = toLocalDate(e.at);
        return e.type === 'mood' && d >= from && d <= to;
    });
    if (!moods.length) return null;

    const byDay = days.map(d => {
        const dm  = moods.filter(e => toLocalDate(e.at) === d);
        const avg = dm.length ? dm.reduce((s, e) => s + (e.data?.score || 5), 0) / dm.length : null;
        return { date: d, label: fmtAxisLabel(d, days.length), score: avg };
    });

    const scored    = byDay.filter(d => d.score !== null);
    const avgScore  = scored.length ? scored.reduce((s, d) => s + d.score, 0) / scored.length : 0;
    const goodDays  = scored.filter(d => d.score >= 7).length;
    const hardDays  = scored.filter(d => d.score < 5).length;

    return { byDay, avgScore, goodDays, hardDays, daysWithMood: scored.length };
}

function MoodSection({ entries, from, to, prevFrom, prevTo, periodLabel }) {
    const stats = useMemo(() => calcMoodStats(entries, from, to),         [entries, from, to]);
    const prev  = useMemo(() => calcMoodStats(entries, prevFrom, prevTo), [entries, prevFrom, prevTo]);

    if (!stats) return null;

    const delta = prev ? pctDelta(stats.avgScore, prev.avgScore) : null;

    return (
        <div className="space-y-3 pt-2 border-t-2 border-bb-border">
            <div className="flex items-center gap-2">
                <p className="text-sm font-semibold">Nastrój okresu</p>
                <span className="text-xs text-bb-muted px-2 py-0.5 bg-bb-soft rounded-full">
                    {stats.daysWithMood} {stats.daysWithMood === 1 ? 'dzień z oceną' : 'dni z oceną'}
                </span>
            </div>

            <div className="grid grid-cols-3 gap-3">
                <div className="bg-bb-card rounded-2xl p-4 space-y-0.5 col-span-1">
                    <p className="text-xs text-bb-muted font-semibold">Śr. nastrój</p>
                    <p className="font-display text-xl font-bold leading-tight">
                        {moodEmoji(stats.avgScore)} {stats.avgScore.toFixed(1)}
                        <span className="text-sm font-normal text-bb-muted ml-0.5">/10</span>
                    </p>
                    {delta !== null && (
                        <p className={`text-xs font-semibold flex items-center gap-1 flex-wrap ${delta > 0 ? 'text-emerald-500' : delta < 0 ? 'text-rose-400' : 'text-bb-muted'}`}>
                            <span>{delta > 0 ? '+' : ''}{delta}%</span>
                            {periodLabel && <span className="font-normal text-bb-muted">vs {periodLabel}</span>}
                        </p>
                    )}
                </div>
                <div className="bg-bb-card rounded-2xl p-4 space-y-0.5">
                    <p className="text-xs text-bb-muted font-semibold">Dobre dni</p>
                    <p className="font-display text-xl font-bold">{stats.goodDays}</p>
                    <p className="text-xs text-bb-muted">nastrój ≥ 7</p>
                </div>
                <div className="bg-bb-card rounded-2xl p-4 space-y-0.5">
                    <p className="text-xs text-bb-muted font-semibold">Ciężkie dni</p>
                    <p className="font-display text-xl font-bold">{stats.hardDays}</p>
                    <p className="text-xs text-bb-muted">nastrój &lt; 5</p>
                </div>
            </div>

            <div className="bg-bb-card rounded-2xl p-4 space-y-3">
                <p className="text-sm font-semibold">Nastrój dzień po dniu</p>
                <ResponsiveContainer width="100%" height={130}>
                    <BarChart data={stats.byDay} margin={{ top: 4, right: 8, bottom: 0, left: -14 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="var(--bb-border)" vertical={false} />
                        <XAxis dataKey="label" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                        <YAxis tick={{ fontSize: 10 }} domain={[0, 10]} />
                        <Tooltip {...TT} formatter={v => [v !== null ? `${(+v).toFixed(1)}/10` : '–', 'Nastrój']} />
                        <ReferenceLine y={7} stroke={C.avg} strokeDasharray="4 2"
                            label={{ value: '7', position: 'insideTopRight', fontSize: 9, fill: C.avg }} />
                        <Bar dataKey="score" name="Nastrój" fill={C.mood} radius={[4, 4, 0, 0]} maxBarSize={36} />
                    </BarChart>
                </ResponsiveContainer>
                <p className="text-[10px] text-bb-muted">Linia przerywana = 7/10. Puste słupki = brak wpisu na ten dzień.</p>
            </div>
        </div>
    );
}

// ── Stats settings panel ──────────────────────────────────────────────────────

function StatsSettingsPanel({ statsPrefs, onUpdate, onDone }) {
    const compRef = statsPrefs.compRef || 'previousSame';
    const whoNorms = statsPrefs.whoNorms || false;
    const ageAdapt = statsPrefs.ageAdapt || false;

    return (
        <div className="space-y-5">
            <div className="space-y-2">
                <p className="text-sm font-semibold">Punkt odniesienia dla porównań</p>
                <p className="text-xs text-bb-muted">Wykresy KPI porównują aktualny okres z wybranym punktem.</p>
                <div className="space-y-1.5">
                    {[
                        { id: 'previousSame', label: 'Poprzedni okres tej samej długości', sub: 'Domyślne — np. dla tygodnia porównuje z poprzednim tygodniem' },
                        { id: '7d',           label: 'Zawsze poprzednie 7 dni',            sub: 'Stały punkt odniesienia niezależnie od wybranego okresu' },
                        { id: '30d',          label: 'Zawsze poprzednie 30 dni',           sub: 'Kontekst miesięczny dla wszystkich porównań' },
                    ].map(opt => (
                        <button key={opt.id} onClick={() => onUpdate({ compRef: opt.id })}
                            className={`w-full text-left rounded-2xl border-2 px-4 py-3 transition-colors ${
                                compRef === opt.id ? 'border-bb-text/30 bg-bb-card' : 'border-bb-border bg-bb-card/60'
                            }`}>
                            <p className="text-sm font-semibold">{opt.label}</p>
                            <p className="text-xs text-bb-muted mt-0.5">{opt.sub}</p>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                <p className="text-sm font-semibold">Opcje zaawansowane</p>
                {[
                    { key: 'whoNorms',  val: whoNorms,  label: 'Normy WHO na wykresach', sub: 'Pokaże zakres normy wiekowej jako szare tło (wkrótce)' },
                    { key: 'ageAdapt', val: ageAdapt,  label: 'Adaptacja widoku do wieku', sub: 'Eksponuje sekcje odpowiednie dla etapu rozwoju dziecka' },
                ].map(opt => (
                    <button key={opt.key} onClick={() => onUpdate({ [opt.key]: !opt.val })}
                        className="w-full flex items-center gap-3 bg-bb-card rounded-2xl border-2 border-bb-border px-4 py-3">
                        <div className="flex-1 text-left">
                            <p className="text-sm font-semibold">{opt.label}</p>
                            <p className="text-xs text-bb-muted">{opt.sub}</p>
                        </div>
                        <div className={`w-11 h-6 rounded-full transition-colors flex-shrink-0 flex items-center px-0.5 ${opt.val ? 'bg-bb-primary' : 'bg-bb-soft'}`}>
                            <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${opt.val ? 'translate-x-5' : ''}`} />
                        </div>
                    </button>
                ))}
            </div>

            <button onClick={onDone} className="w-full py-2.5 rounded-full bg-bb-primary text-sm font-bold">
                Gotowe
            </button>
        </div>
    );
}

// ── Customize panel ───────────────────────────────────────────────────────────

function CustomizePanel({ ids, hidden, labels, onMove, onToggle, onReset, onDone }) {
    return (
        <div className="space-y-2">
            <p className="text-xs text-bb-muted">
                Strzałki zmieniają kolejność, oko ukrywa sekcję. Ustawienia zapisują się na tym urządzeniu.
            </p>
            {ids.map((id, i) => {
                const isHidden = hidden.includes(id);
                return (
                    <div key={id}
                        className={`flex items-center gap-1.5 bg-bb-card rounded-2xl border-2 border-bb-border px-4 py-3 ${isHidden ? 'opacity-50' : ''}`}>
                        <span className="flex-1 text-sm font-semibold truncate">{labels[id]}</span>
                        <button onClick={() => onMove(id, -1)} disabled={i === 0} aria-label="Przesuń w górę"
                            className="p-2 rounded-full hover:bg-bb-soft disabled:opacity-30"><ArrowUp size={16} /></button>
                        <button onClick={() => onMove(id, 1)} disabled={i === ids.length - 1} aria-label="Przesuń w dół"
                            className="p-2 rounded-full hover:bg-bb-soft disabled:opacity-30"><ArrowDown size={16} /></button>
                        <button onClick={() => onToggle(id)} aria-label={isHidden ? 'Pokaż sekcję' : 'Ukryj sekcję'}
                            className="p-2 rounded-full hover:bg-bb-soft">
                            {isHidden ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                    </div>
                );
            })}
            <div className="flex gap-2 pt-1">
                <button onClick={onReset}
                    className="flex-1 py-2.5 rounded-full border border-bb-muted/30 text-sm font-semibold text-bb-muted flex items-center justify-center gap-1.5">
                    <RotateCcw size={14} /> Domyślne
                </button>
                <button onClick={onDone} className="flex-1 py-2.5 rounded-full bg-bb-primary text-sm font-bold">
                    Gotowe
                </button>
            </div>
        </div>
    );
}

// ── Main screen ───────────────────────────────────────────────────────────────

const STAT_TABS = ['Dziś', 'Karmienie', 'Sen', 'Pieluchy', 'Wzrost', 'Trend'];

const SECTION_META = {
    Karmienie: [
        ['kpi', 'Wskaźniki'], ['forecast', 'Prognoza karmienia'], ['daily', 'Karmienia dziennie'],
        ['split', 'Pierś vs butelka'], ['duration', 'Czas karmienia piersią'], ['ml', 'ml z butelki'],
        ['hours', 'Karmienia wg godziny'],
    ],
    Sen: [
        ['kpi', 'Wskaźniki'], ['daily', 'Sen dzienny'], ['nightday', 'Nocny vs dzienny'], ['heatmap', 'Heatmapa snu'],
    ],
    Pieluchy: [['kpi', 'Wskaźniki'], ['daily', 'Pieluchy dziennie']],
    Wzrost:   [['centile', 'Siatka centylowa'], ['history', 'Historia pomiarów']],
};

const PREFS_KEY       = 'bobolog.statsPrefs';
const HINT_KEY        = 'bobolog.statsHintSeen';
const STATS_PREFS_KEY = 'bobolog.statsGlobalPrefs';

function loadPrefs()       { try { return JSON.parse(localStorage.getItem(PREFS_KEY)) ?? {}; } catch { return {}; } }
function loadStatsPrefs()  { try { return JSON.parse(localStorage.getItem(STATS_PREFS_KEY)) ?? {}; } catch { return {}; } }

export default function StatsScreen({ entries, activeChild, sleepStartedAt }) {
    const [prefs,      setPrefs]      = useState(loadPrefs);
    const [statsPrefs, setStatsPrefs] = useState(loadStatsPrefs);
    const [tab,        setTab]        = useState('Karmienie');
    const [period,     setPeriod]     = useState(() => loadPrefs().days || 7);
    const [endDate,    setEnd]        = useState(todayStr);
    const [showPdf,    setShowPdf]    = useState(false);
    const [editing,    setEditing]    = useState(false);   // section order/visibility
    const [showSettings, setShowSettings] = useState(false); // global stats settings
    const [hintDismissed, setHintDismissed] = useState(() => !!localStorage.getItem(HINT_KEY));

    function dismissHint() {
        localStorage.setItem(HINT_KEY, '1');
        setHintDismissed(true);
    }

    function updatePrefs(patch) {
        setPrefs(p => {
            const next = { ...p, ...patch };
            localStorage.setItem(PREFS_KEY, JSON.stringify(next));
            return next;
        });
    }

    function updateStatsPrefs(patch) {
        setStatsPrefs(p => {
            const next = { ...p, ...patch };
            localStorage.setItem(STATS_PREFS_KEY, JSON.stringify(next));
            return next;
        });
    }

    function setDays(d) {
        setPeriod(d);
        setEnd(todayStr());
        updatePrefs({ days: d });
    }

    function orderedIds(t) {
        const all   = SECTION_META[t].map(([id]) => id);
        const saved = prefs.order?.[t] || [];
        return [...saved.filter(id => all.includes(id)), ...all.filter(id => !saved.includes(id))];
    }
    const hiddenIds  = t => prefs.hidden?.[t] || [];
    const visibleIds = t => orderedIds(t).filter(id => !hiddenIds(t).includes(id));

    function move(t, id, dir) {
        const ids = orderedIds(t);
        const i = ids.indexOf(id), j = i + dir;
        if (j < 0 || j >= ids.length) return;
        [ids[i], ids[j]] = [ids[j], ids[i]];
        updatePrefs({ order: { ...prefs.order, [t]: ids } });
    }

    function toggleVisible(t, id) {
        const hid = hiddenIds(t);
        updatePrefs({ hidden: { ...prefs.hidden, [t]: hid.includes(id) ? hid.filter(x => x !== id) : [...hid, id] } });
    }

    function resetTab(t) {
        updatePrefs({ order: { ...prefs.order, [t]: undefined }, hidden: { ...prefs.hidden, [t]: [] } });
    }

    const to      = endDate;
    const from    = shiftDate(to, -(period - 1));

    // Comparison period based on user setting
    const compRef = statsPrefs.compRef || 'previousSame';
    let prevTo, prevFrom;
    if (compRef === '7d') {
        prevTo   = shiftDate(todayStr(), -1);
        prevFrom = shiftDate(prevTo, -6);
    } else if (compRef === '30d') {
        prevTo   = shiftDate(todayStr(), -1);
        prevFrom = shiftDate(prevTo, -29);
    } else {
        prevTo   = shiftDate(from, -1);
        prevFrom = shiftDate(prevTo, -(period - 1));
    }

    const periodLabel = compRef === '7d' ? 'poprz. 7 dni'
        : compRef === '30d' ? 'poprz. 30 dni'
        : getPeriodLabel(period);

    function nav(dir) {
        const next = shiftDate(endDate, dir * period);
        setEnd(next > todayStr() ? todayStr() : next);
    }

    const hasTabSections = ['Karmienie', 'Sen', 'Pieluchy', 'Wzrost'].includes(tab);
    const labels = hasTabSections ? Object.fromEntries(SECTION_META[tab]) : {};

    return (
        <div className="space-y-5">
            {showPdf && (
                <PdfExportModal entries={entries} childName={activeChild?.name} onClose={() => setShowPdf(false)} />
            )}

            <div className="flex items-center justify-between">
                <h1 className="font-display text-2xl font-bold">Statystyki</h1>
                <div className="flex gap-1.5">
                    {entries.length > 0 && (
                        <>
                            <button onClick={() => exportToCsv(entries, activeChild?.name)}
                                className="text-xs font-semibold text-bb-muted border border-bb-muted/30 rounded-full px-3 py-1.5 hover:bg-bb-soft transition-colors">
                                ↓ CSV
                            </button>
                            <button onClick={() => setShowPdf(true)}
                                className="text-xs font-semibold text-bb-muted border border-bb-muted/30 rounded-full px-3 py-1.5 hover:bg-bb-soft transition-colors">
                                ↓ PDF
                            </button>
                        </>
                    )}
                    <button onClick={() => { setShowSettings(s => !s); setEditing(false); }}
                        className={`text-xs font-semibold rounded-full px-3 py-1.5 border transition-colors flex items-center gap-1
                            ${showSettings ? 'bg-bb-primary border-transparent text-bb-text' : 'text-bb-muted border-bb-muted/30 hover:bg-bb-soft'}`}>
                        <Info size={13} /> Opcje
                    </button>
                    {hasTabSections && (
                        <button onClick={() => { setEditing(e => !e); setShowSettings(false); }} aria-label="Dostosuj widok"
                            className={`text-xs font-semibold rounded-full px-3 py-1.5 border transition-colors flex items-center gap-1
                                ${editing ? 'bg-bb-primary border-transparent text-bb-text' : 'text-bb-muted border-bb-muted/30 hover:bg-bb-soft'}`}>
                            <Settings2 size={13} /> Sekcje
                        </button>
                    )}
                </div>
            </div>

            {/* First-visit hint */}
            {!hintDismissed && (
                <div className="bg-bb-soft rounded-2xl px-4 py-3 flex items-start gap-3">
                    <Info size={16} className="text-bb-muted shrink-0 mt-0.5" />
                    <p className="text-xs text-bb-muted flex-1">
                        Możesz przestawić i ukrywać sekcje przyciskiem <strong>Sekcje</strong>, a zmienić punkt odniesienia porównań i inne opcje przez <strong>Opcje</strong>.
                    </p>
                    <button onClick={dismissHint} className="text-bb-muted shrink-0">
                        <X size={14} />
                    </button>
                </div>
            )}

            {/* Global stats settings panel */}
            {showSettings && (
                <StatsSettingsPanel
                    statsPrefs={statsPrefs}
                    onUpdate={updateStatsPrefs}
                    onDone={() => setShowSettings(false)}
                />
            )}

            {/* Period picker — only for detail tabs */}
            {!showSettings && !editing && tab !== 'Dziś' && tab !== 'Trend' && (
                <PeriodPicker days={period} endDate={endDate} onDays={setDays} onNav={nav} />
            )}

            {/* Alerts */}
            {!showSettings && !editing && <AlertsSection entries={entries} />}

            {/* Tab bar */}
            <div className="overflow-x-auto -mx-0.5 px-0.5">
                <div className="flex bg-bb-soft rounded-2xl p-1 gap-0.5 min-w-max">
                    {STAT_TABS.map(t => (
                        <button key={t} onClick={() => { setTab(t); setEditing(false); setShowSettings(false); }}
                            className={`px-3 py-2 rounded-xl text-xs font-semibold transition-colors whitespace-nowrap
                                ${tab === t ? 'bg-bb-card text-bb-text' : 'text-bb-muted'}`}>
                            {t}
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            {editing && hasTabSections ? (
                <CustomizePanel
                    ids={orderedIds(tab)}
                    hidden={hiddenIds(tab)}
                    labels={labels}
                    onMove={(id, dir) => move(tab, id, dir)}
                    onToggle={id => toggleVisible(tab, id)}
                    onReset={() => resetTab(tab)}
                    onDone={() => setEditing(false)}
                />
            ) : (
                <>
                    {tab === 'Dziś' && <DayTab entries={entries} />}

                    {tab === 'Karmienie' && (
                        <>
                            {visibleIds(tab).length === 0 && <p className="text-center text-bb-muted text-sm py-8">Wszystkie sekcje ukryte.</p>}
                            <FeedTab entries={entries} from={from} to={to} prevFrom={prevFrom} prevTo={prevTo}
                                sections={visibleIds(tab)} periodLabel={periodLabel} />
                            <MoodSection entries={entries} from={from} to={to} prevFrom={prevFrom} prevTo={prevTo} periodLabel={periodLabel} />
                        </>
                    )}
                    {tab === 'Sen' && (
                        <>
                            {visibleIds(tab).length === 0 && <p className="text-center text-bb-muted text-sm py-8">Wszystkie sekcje ukryte.</p>}
                            <SleepTab entries={entries} from={from} to={to} prevFrom={prevFrom} prevTo={prevTo}
                                sleepStartedAt={sleepStartedAt} sections={visibleIds(tab)} periodLabel={periodLabel} />
                            <MoodSection entries={entries} from={from} to={to} prevFrom={prevFrom} prevTo={prevTo} periodLabel={periodLabel} />
                        </>
                    )}
                    {tab === 'Pieluchy' && (
                        <>
                            {visibleIds(tab).length === 0 && <p className="text-center text-bb-muted text-sm py-8">Wszystkie sekcje ukryte.</p>}
                            <DiaperTab entries={entries} from={from} to={to} prevFrom={prevFrom} prevTo={prevTo}
                                sections={visibleIds(tab)} periodLabel={periodLabel} />
                            <MoodSection entries={entries} from={from} to={to} prevFrom={prevFrom} prevTo={prevTo} periodLabel={periodLabel} />
                        </>
                    )}
                    {tab === 'Wzrost' && (
                        <WeightTab entries={entries} activeChild={activeChild} sections={visibleIds(tab)} />
                    )}
                    {tab === 'Trend' && <TrendTab entries={entries} />}
                </>
            )}
        </div>
    );
}
