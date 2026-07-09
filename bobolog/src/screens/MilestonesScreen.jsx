import { useState, useEffect } from 'react';
import { MILESTONES, CATEGORIES } from '../data/milestones.js';
import { listMilestoneRecords, markMilestoneDone, unmarkMilestoneDone } from '../data/store.js';

function ageLabel(weekMin, weekMax) {
    const toMonths = w => Math.round(w * 7 / 30.44);
    const minM = toMonths(weekMin);
    const maxM = toMonths(weekMax);
    if (minM === maxM) return `~${minM} mies.`;
    return `${minM}–${maxM} mies.`;
}

function ageWeeks(birthDate) {
    if (!birthDate) return null;
    return Math.floor((Date.now() - new Date(birthDate)) / (7 * 86400000));
}

function groupByAge(milestones) {
    const buckets = [
        { label: '0–3 miesiące',  max: 13 },
        { label: '3–6 miesięcy',  max: 26 },
        { label: '6–12 miesięcy', max: 52 },
        { label: '12–18 miesięcy', max: 78 },
        { label: '18–24 miesiące', max: 104 },
        { label: '2–3 lata',       max: 999 },
    ];
    return buckets.map(b => ({
        label: b.label,
        items: milestones.filter(m => m.weekMin <= b.max && m.weekMax > (b.max === 999 ? 104 : (buckets[buckets.findIndex(x => x === b) - 1]?.max ?? 0))),
    })).filter(b => b.items.length > 0);
}

export default function MilestonesScreen({ activeChild, isDemo }) {
    const [records, setRecords] = useState([]);
    const [filter, setFilter]   = useState('all');
    const [loading, setLoading] = useState(true);

    const ageW = ageWeeks(activeChild?.birth_date);
    const doneIds = new Set(records.map(r => r.milestone_id));

    useEffect(() => {
        if (isDemo || !activeChild) { setLoading(false); return; }
        listMilestoneRecords(activeChild.id).then(r => { setRecords(r); setLoading(false); });
    }, [activeChild?.id, isDemo]);

    async function toggle(m) {
        if (isDemo) return;
        if (doneIds.has(m.id)) {
            await unmarkMilestoneDone(activeChild.id, m.id);
            setRecords(prev => prev.filter(r => r.milestone_id !== m.id));
        } else {
            const today = new Date().toISOString().slice(0, 10);
            await markMilestoneDone(activeChild.id, activeChild.family_id ?? records[0]?.family_id, m.id, today);
            setRecords(prev => [...prev, { milestone_id: m.id, done_date: today }]);
        }
    }

    const filtered = MILESTONES.filter(m => {
        if (filter === 'done')    return doneIds.has(m.id);
        if (filter === 'upcoming') return !doneIds.has(m.id) && ageW !== null && m.weekMin <= ageW + 8;
        return true;
    });

    const doneCount = MILESTONES.filter(m => doneIds.has(m.id)).length;
    const progress  = Math.round((doneCount / MILESTONES.length) * 100);

    if (loading) return <div className="text-center py-12 text-bb-muted">Ładowanie…</div>;

    return (
        <div className="space-y-5">
            <h1 className="font-display text-2xl font-bold">Kamienie milowe</h1>

            {/* Progress bar */}
            <div className="bg-bb-card rounded-2xl p-4 space-y-2">
                <div className="flex justify-between text-sm">
                    <span className="font-semibold text-bb-text">{doneCount} / {MILESTONES.length} osiągniętych</span>
                    <span className="text-bb-muted font-bold">{progress}%</span>
                </div>
                <div className="h-2.5 bg-bb-soft rounded-full overflow-hidden">
                    <div className="h-full bg-bb-accent rounded-full transition-all duration-500"
                        style={{ width: `${progress}%` }} />
                </div>
                {ageW !== null && (
                    <p className="text-xs text-bb-muted">
                        {activeChild.name} ma teraz <strong>{Math.floor(ageW / 4.33).toFixed(0)} mies.</strong> ({ageW} tyg.)
                    </p>
                )}
            </div>

            {/* Kategorie legend */}
            <div className="flex flex-wrap gap-1.5">
                {Object.entries(CATEGORIES).map(([key, cat]) => (
                    <span key={key} className="text-xs font-semibold px-2 py-0.5 rounded-full text-gray-700"
                        style={{ background: cat.color + '55', border: `1px solid ${cat.color}` }}>
                        {cat.label}
                    </span>
                ))}
            </div>

            {/* Filtry */}
            <div className="flex bg-bb-soft rounded-2xl p-1 gap-1">
                {[['all', 'Wszystkie'], ['upcoming', 'Nadchodzące'], ['done', 'Osiągnięte']].map(([v, l]) => (
                    <button key={v} onClick={() => setFilter(v)}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold transition-colors
                            ${filter === v ? 'bg-bb-card text-bb-text' : 'text-bb-muted'}`}>
                        {l}
                    </button>
                ))}
            </div>

            {isDemo && (
                <p className="text-center text-sm text-bb-muted bg-bb-soft rounded-2xl px-4 py-3">
                    Tryb demo – zaloguj się, by zapisywać kamienie milowe
                </p>
            )}

            {/* Lista */}
            <div className="space-y-2">
                {filtered.map(m => {
                    const done = doneIds.has(m.id);
                    const cat  = CATEGORIES[m.category];
                    const inRange = ageW !== null && ageW >= m.weekMin - 2 && ageW <= m.weekMax + 4;
                    return (
                        <button key={m.id} onClick={() => toggle(m)}
                            className={`w-full flex items-start gap-3 p-3.5 rounded-2xl text-left transition-all
                                ${done ? 'bg-bb-soft opacity-70' : 'bg-bb-card'}
                                ${inRange && !done ? 'ring-2 ring-bb-accent/40' : ''}`}>
                            <div className={`w-6 h-6 rounded-full border-2 flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors
                                ${done ? 'bg-bb-accent border-bb-accent' : 'border-bb-muted/40'}`}>
                                {done && <span className="text-white text-xs font-bold">✓</span>}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-semibold leading-snug ${done ? 'line-through text-bb-muted' : 'text-bb-text'}`}>
                                    {m.label}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-xs text-bb-muted">{ageLabel(m.weekMin, m.weekMax)}</span>
                                    <span className="text-xs font-semibold px-1.5 py-0.5 rounded-full"
                                        style={{ background: cat.color + '44', color: '#444' }}>
                                        {cat.label}
                                    </span>
                                    {inRange && !done && (
                                        <span className="text-xs font-semibold text-bb-accent">← teraz</span>
                                    )}
                                </div>
                            </div>
                        </button>
                    );
                })}
                {filtered.length === 0 && (
                    <p className="text-center py-8 text-bb-muted text-sm">Brak kamieni milowych w tym filtrze</p>
                )}
            </div>
        </div>
    );
}
