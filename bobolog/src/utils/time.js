export function timeAgo(iso) {
    const mins = Math.round((Date.now() - new Date(iso)) / 60000);
    if (mins < 1) return 'przed chwilą';
    if (mins < 60) return `${mins} min temu`;
    const h = Math.floor(mins / 60);
    if (h < 24) return `${h} godz. ${mins % 60 ? `${mins % 60} min ` : ''}temu`;
    const d = Math.floor(h / 24);
    return d === 1 ? 'wczoraj' : `${d} dni temu`;
}

export function clock(iso) {
    return new Date(iso).toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

export function dayLabel(iso) {
    const date = new Date(iso);
    const today = new Date();
    const yesterday = new Date(Date.now() - 86400000);
    const same = (a, b) => a.toDateString() === b.toDateString();
    if (same(date, today)) return 'Dziś';
    if (same(date, yesterday)) return 'Wczoraj';
    return date.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });
}

export function instrumental(name) {
    if (!name) return '';
    if (name.endsWith('a')) return name.slice(0, -1) + 'ą';
    return name;
}

// Wiek dziecka w danym momencie: "3 dni", "5 mies. 12 dni", "1 rok 2 mies."
export function ageAt(birthDate, atIso) {
    if (!birthDate) return '';
    const b = new Date(birthDate + 'T12:00:00');
    const a = new Date(atIso);
    let months = (a.getFullYear() - b.getFullYear()) * 12 + (a.getMonth() - b.getMonth());
    let days = a.getDate() - b.getDate();
    if (days < 0) { months--; days += new Date(a.getFullYear(), a.getMonth(), 0).getDate(); }
    if (months < 0) return '';
    if (months === 0) return `${days} dni`;
    const y = Math.floor(months / 12), m = months % 12;
    if (y === 0) return `${m} mies.${days ? ` ${days} dni` : ''}`;
    const yl = y === 1 ? 'rok' : y < 5 ? 'lata' : 'lat';
    return `${y} ${yl}${m ? ` ${m} mies.` : ''}`;
}

export function duration(fromIso, toIso) {
    const mins = Math.max(0, Math.round((new Date(toIso) - new Date(fromIso)) / 60000));
    const h = Math.floor(mins / 60);
    return h ? `${h} godz. ${mins % 60} min` : `${mins} min`;
}
