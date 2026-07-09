// Wspólne etykiety i opisy wpisów — używane przez eksport CSV i PDF.
// Kształty data: feed { kind, amountMl, durationMin, note },
// sleep { start, note } (at = koniec), diaper { kind, note },
// weight { weightKg, heightCm, headCm, note }.

export const TYPE_LABELS = {
    feed:   'Karmienie',
    sleep:  'Sen',
    diaper: 'Pielucha',
    weight: 'Pomiar',
    note:   'Notatka',
};

const FEED_KINDS = {
    'piers-l': 'Pierś lewa',
    'piers-p': 'Pierś prawa',
    'butelka': 'Butelka',
    'stale':   'Posiłek stały',
};

const DIAPER_KINDS = {
    'mokra':        'mokra',
    'kupa':         'kupa',
    'pelny-serwis': 'mokra + kupa',
};

export function entryDetails(entry) {
    const d = entry.data || {};
    switch (entry.type) {
        case 'feed': {
            const parts = [FEED_KINDS[d.kind] ?? d.kind];
            if (d.amountMl)    parts.push(`${d.amountMl} ml`);
            if (d.durationMin) parts.push(`${d.durationMin} min`);
            if (d.note)        parts.push(d.note);
            return parts.filter(Boolean).join(', ');
        }
        case 'sleep': {
            const parts = [];
            if (d.start) {
                const min = Math.round((new Date(entry.at) - new Date(d.start)) / 60000);
                if (min > 0) parts.push(min >= 60 ? `${Math.floor(min / 60)}h ${min % 60}m` : `${min} min`);
            }
            if (d.note) parts.push(d.note);
            return parts.join(', ');
        }
        case 'diaper':
            return [DIAPER_KINDS[d.kind] ?? d.kind, d.note].filter(Boolean).join(', ');
        case 'weight': {
            const parts = [];
            if (d.weightKg) parts.push(`${d.weightKg} kg`);
            if (d.heightCm) parts.push(`${d.heightCm} cm`);
            if (d.headCm)   parts.push(`głowa ${d.headCm} cm`);
            if (d.note)     parts.push(d.note);
            return parts.join(', ');
        }
        case 'note':
            return d.text ?? d.note ?? '';
        default:
            return '';
    }
}
