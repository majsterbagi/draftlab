// In-memory store dla trybu demo — dane świeże per sesja, bez Supabase.

function hoursAgo(h) {
    return new Date(Date.now() - h * 3600000).toISOString();
}
function minutesAgo(m) {
    return new Date(Date.now() - m * 60000).toISOString();
}

let entries = [
    { id: 'demo-1', type: 'feed',   at: minutesAgo(28),  data: { kind: 'piers-l', durationMin: 14 } },
    { id: 'demo-2', type: 'diaper', at: minutesAgo(65),  data: { kind: 'mokra' } },
    { id: 'demo-3', type: 'sleep',  at: hoursAgo(2.5),   data: { start: hoursAgo(4) } },
    { id: 'demo-4', type: 'feed',   at: hoursAgo(3.5),   data: { kind: 'butelka', amountMl: 120 } },
    { id: 'demo-5', type: 'diaper', at: hoursAgo(4),     data: { kind: 'pelny-serwis' } },
    { id: 'demo-6', type: 'feed',   at: hoursAgo(6.5),   data: { kind: 'piers-p', durationMin: 11 } },
    { id: 'demo-7', type: 'sleep',  at: hoursAgo(6),     data: { start: hoursAgo(7.5) } },
    { id: 'demo-8', type: 'diaper', at: hoursAgo(7.2),   data: { kind: 'mokra' } },
    { id: 'demo-9', type: 'feed',   at: hoursAgo(9),     data: { kind: 'piers-l', durationMin: 16 } },
];

export async function listEntries(_childId) {
    return [...entries].sort((a, b) => b.at.localeCompare(a.at));
}

export async function addEntry(_childId, _familyId, type, data = {}) {
    const entry = {
        id: 'demo-' + Date.now(),
        type,
        at: data.at || new Date().toISOString(),
        data: { ...data },
    };
    delete entry.data.at;
    entries = [entry, ...entries];
    return entry;
}

export async function removeEntry(id) {
    entries = entries.filter(e => e.id !== id);
}

export async function lastEntry(_childId, type) {
    return [...entries].sort((a, b) => b.at.localeCompare(a.at)).find(e => e.type === type) || null;
}
