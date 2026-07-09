import { useState } from 'react';
import { X } from 'lucide-react';

const FEED_KINDS = [
    { id: 'piers-l', label: 'Pierś lewa' },
    { id: 'piers-p', label: 'Pierś prawa' },
    { id: 'butelka', label: 'Butelka' },
    { id: 'stale', label: 'Posiłek stały' }
];

const DIAPER_KINDS = [
    { id: 'mokra', label: 'Mokra' },
    { id: 'kupa', label: 'Kupa' },
    { id: 'pelny-serwis', label: 'Mokra + kupa' }
];

const TITLES = { feed: 'Karmienie', sleep: 'Sen', diaper: 'Pielucha', weight: 'Pomiar', mood: 'Nastrój dnia' };

const MOOD_EMOJI = score =>
    score >= 9 ? '😄' : score >= 7 ? '😊' : score >= 5 ? '😐' : score >= 3 ? '😟' : '😢';

const MOOD_LABEL = score =>
    score >= 9 ? 'Świetny dzień!' : score >= 7 ? 'Dobry dzień' : score >= 5 ? 'Przeciętny' : score >= 3 ? 'Trudny dzień' : 'Bardzo ciężki';

function Chip({ active, onClick, children }) {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`px-4 py-2.5 rounded-full font-semibold text-sm transition-colors border-2 ${
                active
                    ? 'bg-bb-primary border-bb-text/30'
                    : 'bg-bb-card border-bb-border hover:border-bb-text/20'
            }`}
        >
            {children}
        </button>
    );
}

export default function QuickAdd({ type, sleepStartedAt, onSave, onSleepStart, onSleepStop, onClose }) {
    const [feedKind, setFeedKind] = useState('piers-l');
    const [amount, setAmount] = useState('');
    const [durationMin, setDurationMin] = useState('');
    const [diaperKind, setDiaperKind] = useState('mokra');
    const [weightKg, setWeightKg] = useState('');
    const [heightCm, setHeightCm] = useState('');
    const [headCm, setHeadCm] = useState('');
    const [note, setNote] = useState('');
    const [manualFrom, setManualFrom] = useState('');
    const [manualTo, setManualTo] = useState('');
    const [moodScore, setMoodScore] = useState(7);

    const save = () => {
        if (type === 'feed') {
            onSave('feed', {
                kind: feedKind,
                amountMl: feedKind === 'butelka' ? Number(amount) || null : null,
                durationMin: (feedKind === 'piers-l' || feedKind === 'piers-p') ? Number(durationMin) || null : null,
                note,
            });
        } else if (type === 'diaper') {
            onSave('diaper', { kind: diaperKind, note });
        } else if (type === 'weight') {
            onSave('weight', {
                weightKg: weightKg ? Number(weightKg) : null,
                heightCm: heightCm ? Number(heightCm) : null,
                headCm:   headCm   ? Number(headCm)   : null,
                note,
            });
        } else if (type === 'sleep' && manualFrom && manualTo) {
            const today = new Date().toISOString().slice(0, 10);
            onSave('sleep', { start: `${today}T${manualFrom}`, at: `${today}T${manualTo}`, note });
        } else if (type === 'mood') {
            onSave('mood', { score: moodScore, note });
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-40 flex items-end sm:items-center sm:justify-center" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />
            <div className="relative w-full sm:max-w-md bg-bb-card rounded-t-bubble sm:rounded-bubble p-6 pb-8 shadow-xl">
                <div className="flex items-center justify-between mb-5">
                    <h2 className="font-display text-xl font-semibold">{TITLES[type]}</h2>
                    <button onClick={onClose} aria-label="Zamknij" className="p-2 rounded-full hover:bg-bb-soft">
                        <X size={20} />
                    </button>
                </div>

                {type === 'feed' && (
                    <div className="space-y-4">
                        <div className="flex flex-wrap gap-2">
                            {FEED_KINDS.map((k) => (
                                <Chip key={k.id} active={feedKind === k.id} onClick={() => setFeedKind(k.id)}>
                                    {k.label}
                                </Chip>
                            ))}
                        </div>
                        {feedKind === 'butelka' && (
                            <label className="block">
                                <span className="text-sm text-bb-muted font-semibold">Ilość (ml)</span>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="120"
                                    className="mt-1 w-full rounded-2xl border-2 border-bb-border bg-bb-bg px-4 py-2.5 outline-none focus:border-bb-text/30"
                                />
                            </label>
                        )}
                        {(feedKind === 'piers-l' || feedKind === 'piers-p') && (
                            <label className="block">
                                <span className="text-sm text-bb-muted font-semibold">Czas karmienia (min)</span>
                                <input
                                    type="number"
                                    inputMode="numeric"
                                    value={durationMin}
                                    onChange={(e) => setDurationMin(e.target.value)}
                                    placeholder="15"
                                    className="mt-1 w-full rounded-2xl border-2 border-bb-border bg-bb-bg px-4 py-2.5 outline-none focus:border-bb-text/30"
                                />
                            </label>
                        )}
                    </div>
                )}

                {type === 'diaper' && (
                    <div className="flex flex-wrap gap-2">
                        {DIAPER_KINDS.map((k) => (
                            <Chip key={k.id} active={diaperKind === k.id} onClick={() => setDiaperKind(k.id)}>
                                {k.label}
                            </Chip>
                        ))}
                    </div>
                )}

                {type === 'weight' && (
                    <div className="space-y-3">
                        <p className="text-xs text-bb-muted font-semibold">Wszystkie pola opcjonalne – wpisz tylko to, co mierzysz.</p>
                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { label: 'Waga (kg)', value: weightKg, set: setWeightKg, placeholder: '7.35', step: '0.01' },
                                { label: 'Wzrost (cm)', value: heightCm, set: setHeightCm, placeholder: '67.0', step: '0.5' },
                                { label: 'Głowa (cm)', value: headCm, set: setHeadCm, placeholder: '43.5', step: '0.5' },
                            ].map(f => (
                                <label key={f.label} className="block">
                                    <span className="text-xs text-bb-muted font-semibold">{f.label}</span>
                                    <input type="number" inputMode="decimal" step={f.step}
                                        value={f.value} onChange={e => f.set(e.target.value)} placeholder={f.placeholder}
                                        className="mt-1 w-full rounded-2xl border-2 border-bb-border bg-bb-bg px-3 py-2.5 outline-none focus:border-bb-text/30 text-sm" />
                                </label>
                            ))}
                        </div>
                    </div>
                )}

                {type === 'sleep' && (
                    <div className="space-y-4">
                        {sleepStartedAt ? (
                            <button
                                onClick={() => { onSleepStop(); onClose(); }}
                                className="w-full py-3.5 rounded-bubble bg-bb-accent font-display font-semibold text-lg"
                            >
                                Zakończ sen i zapisz
                            </button>
                        ) : (
                            <button
                                onClick={() => { onSleepStart(); onClose(); }}
                                className="w-full py-3.5 rounded-bubble bg-bb-primary font-display font-semibold text-lg"
                            >
                                Bobo zasypia – start timera
                            </button>
                        )}
                        <div className="flex items-center gap-3 text-bb-muted text-sm font-semibold">
                            <span className="flex-1 border-t border-bb-border" />lub wpisz ręcznie<span className="flex-1 border-t border-bb-border" />
                        </div>
                        <div className="flex gap-3">
                            <label className="flex-1">
                                <span className="text-sm text-bb-muted font-semibold">Od</span>
                                <input type="time" value={manualFrom} onChange={(e) => setManualFrom(e.target.value)}
                                    className="mt-1 w-full rounded-2xl border-2 border-bb-border bg-bb-bg px-3 py-2.5 outline-none focus:border-bb-text/30" />
                            </label>
                            <label className="flex-1">
                                <span className="text-sm text-bb-muted font-semibold">Do</span>
                                <input type="time" value={manualTo} onChange={(e) => setManualTo(e.target.value)}
                                    className="mt-1 w-full rounded-2xl border-2 border-bb-border bg-bb-bg px-3 py-2.5 outline-none focus:border-bb-text/30" />
                            </label>
                        </div>
                    </div>
                )}

                {type === 'mood' && (
                    <div className="space-y-5">
                        <div className="text-center space-y-1">
                            <p className="text-6xl">{MOOD_EMOJI(moodScore)}</p>
                            <p className="font-display font-bold text-3xl">{moodScore}<span className="text-bb-muted font-normal text-lg">/10</span></p>
                            <p className="text-sm font-semibold text-bb-muted">{MOOD_LABEL(moodScore)}</p>
                        </div>
                        <div className="space-y-2">
                            <input type="range" min="1" max="10" value={moodScore}
                                onChange={e => setMoodScore(Number(e.target.value))}
                                className="w-full accent-bb-primary" />
                            <div className="flex justify-between text-xs text-bb-muted font-semibold">
                                <span>😢 Ciężki</span>
                                <span>😄 Świetny</span>
                            </div>
                        </div>
                    </div>
                )}

                {(type !== 'sleep' || (manualFrom && manualTo)) ? (
                    <div className="mt-5 space-y-4">
                        <input
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Notatka (opcjonalnie)"
                            className="w-full rounded-2xl border-2 border-bb-border bg-bb-bg px-4 py-2.5 outline-none focus:border-bb-text/30"
                        />
                        <button onClick={save}
                            disabled={type === 'weight' && !weightKg && !heightCm && !headCm}
                            className="w-full py-3.5 rounded-bubble bg-bb-primary font-display font-semibold text-lg disabled:opacity-50">
                            Zapisz
                        </button>
                    </div>
                ) : null}
            </div>
        </div>
    );
}
