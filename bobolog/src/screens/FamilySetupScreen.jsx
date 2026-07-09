import { useState } from 'react';
import { supabase } from '../data/supabase.js';
import { useApp } from '../contexts/AppContext.jsx';
import Logo from '../components/Logo.jsx';
import { generateVaccineSchedule } from '../data/store.js';

const GENDER_OPTIONS = [
    { id: 'girl', label: 'Dziewczynka', emoji: '🎀' },
    { id: 'boy', label: 'Chłopiec', emoji: '🚂' },
    { id: 'neutral', label: 'Nie podaję', emoji: '🌿' },
];

function Step({ n, active, done, label }) {
    return (
        <div className="flex items-center gap-2">
            <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold
                ${done ? 'bg-bb-primary' : active ? 'bg-bb-text text-bb-card' : 'bg-bb-border text-bb-muted'}`}>
                {done ? '✓' : n}
            </span>
            <span className={`text-sm font-semibold ${active ? 'text-bb-text' : 'text-bb-muted'}`}>{label}</span>
        </div>
    );
}

export default function FamilySetupScreen() {
    const { loadFamily, signOut } = useApp();
    const [step, setStep] = useState(1);
    const [familyName, setFamilyName] = useState('');
    const [familyId, setFamilyId] = useState(null);
    const [childName, setChildName] = useState('');
    const [gender, setGender] = useState('neutral');
    const [mode, setMode] = useState('born'); // 'born' | 'pregnant'
    const [birthDate, setBirthDate] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function createFamily(e) {
        e.preventDefault();
        if (!familyName.trim()) return;
        setLoading(true); setError('');
        const { data: { user } } = await supabase.auth.getUser();

        const newFamilyId = crypto.randomUUID();
        const { error: famErr } = await supabase
            .from('families')
            .insert({ id: newFamilyId, name: familyName.trim(), created_by: user.id });
        if (famErr) { console.error('createFamily error:', famErr); setError(`Błąd: ${famErr.message} (${famErr.code})`); setLoading(false); return; }

        const { error: memErr } = await supabase.from('family_members').insert({
            family_id: newFamilyId,
            user_id: user.id,
            role: 'admin'
        });
        if (memErr) { console.error('createMember error:', memErr); setError(`Błąd zapisu członka: ${memErr.message}`); setLoading(false); return; }

        setFamilyId(newFamilyId);
        setLoading(false);
        setStep(2);
    }

    async function createChild(e) {
        e.preventDefault();
        if (!childName.trim()) return;
        if (mode === 'born' && !birthDate) return;
        if (mode === 'pregnant' && !dueDate) return;
        setLoading(true); setError('');

        const { error: childErr } = await supabase.from('children').insert({
            family_id: familyId,
            name: childName.trim(),
            gender,
            birth_date: mode === 'born' ? birthDate : null,
            due_date: mode === 'pregnant' ? dueDate : null,
        });

        if (childErr) { setError('Błąd zapisu danych dziecka.'); setLoading(false); return; }

        // Generuj harmonogram PSO jeśli dziecko się już urodziło
        if (mode === 'born' && birthDate) {
            const { data: kids } = await supabase
                .from('children')
                .select('id')
                .eq('family_id', familyId)
                .eq('name', childName.trim())
                .order('created_at', { ascending: false })
                .limit(1)
                .single();
            if (kids?.id) {
                await generateVaccineSchedule(kids.id, familyId, birthDate);
            }
        }

        await loadFamily();
    }

    const today = new Date().toISOString().slice(0, 10);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-5 py-12">
            <div className="w-full max-w-sm space-y-6">

                <div className="text-center space-y-1">
                    <div className="flex justify-center"><Logo size={48} /></div>
                    <h1 className="font-display text-xl font-bold">Skonfiguruj BoboLab</h1>
                </div>

                {/* Progress */}
                <div className="flex items-center gap-3">
                    <Step n={1} active={step === 1} done={step > 1} label="Rodzina" />
                    <span className="flex-1 border-t border-bb-border" />
                    <Step n={2} active={step === 2} done={false} label="Dziecko" />
                </div>

                {error && <p className="text-red-500 text-sm font-semibold text-center">{error}</p>}

                {step === 1 && (
                    <form onSubmit={createFamily} className="space-y-4">
                        <div>
                            <p className="text-sm text-bb-muted font-semibold mb-1">Jak się nazywa Wasza rodzina?</p>
                            <input
                                value={familyName}
                                onChange={e => setFamilyName(e.target.value)}
                                placeholder="np. Rodzina Kowalskich"
                                className="w-full px-4 py-3 rounded-2xl border-2 border-bb-border bg-bb-card outline-none focus:border-bb-text/30 font-body"
                            />
                        </div>
                        <button type="submit" disabled={!familyName.trim() || loading}
                            className="w-full py-3.5 rounded-bubble bg-bb-primary font-display font-semibold text-lg disabled:opacity-50">
                            {loading ? 'Tworzę…' : 'Dalej →'}
                        </button>
                    </form>
                )}

                {step === 2 && (
                    <form onSubmit={createChild} className="space-y-4">
                        <div>
                            <p className="text-sm text-bb-muted font-semibold mb-1">Imię dziecka</p>
                            <input
                                value={childName}
                                onChange={e => setChildName(e.target.value)}
                                placeholder="np. Zosia"
                                className="w-full px-4 py-3 rounded-2xl border-2 border-bb-border bg-bb-card outline-none focus:border-bb-text/30 font-body"
                            />
                        </div>

                        <div>
                            <p className="text-sm text-bb-muted font-semibold mb-2">Płeć <span className="font-normal">(wybiera motyw kolorystyczny)</span></p>
                            <div className="grid grid-cols-3 gap-2">
                                {GENDER_OPTIONS.map(g => (
                                    <button key={g.id} type="button" onClick={() => setGender(g.id)}
                                        className={`py-3 rounded-2xl border-2 font-semibold text-sm flex flex-col items-center gap-1 transition-colors
                                            ${gender === g.id ? 'border-bb-text/30 bg-bb-primary' : 'border-bb-border bg-bb-card'}`}>
                                        <span className="text-xl">{g.emoji}</span>
                                        {g.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex bg-bb-soft rounded-2xl p-1">
                            {[['born','Już się urodziło'],['pregnant','Jeszcze w drodze']].map(([id, label]) => (
                                <button key={id} type="button" onClick={() => setMode(id)}
                                    className={`flex-1 py-2 rounded-xl font-semibold text-sm transition-colors ${mode === id ? 'bg-bb-card text-bb-text' : 'text-bb-muted'}`}>
                                    {label}
                                </button>
                            ))}
                        </div>

                        {mode === 'born' && (
                            <div>
                                <p className="text-sm text-bb-muted font-semibold mb-1">Data urodzenia</p>
                                <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)} max={today}
                                    className="w-full px-4 py-3 rounded-2xl border-2 border-bb-border bg-bb-card outline-none focus:border-bb-text/30 font-body" />
                            </div>
                        )}

                        {mode === 'pregnant' && (
                            <div>
                                <p className="text-sm text-bb-muted font-semibold mb-1">Przewidywana data porodu</p>
                                <input type="date" value={dueDate} onChange={e => setDueDate(e.target.value)} min={today}
                                    className="w-full px-4 py-3 rounded-2xl border-2 border-bb-border bg-bb-card outline-none focus:border-bb-text/30 font-body" />
                            </div>
                        )}

                        <button type="submit" disabled={loading || !childName.trim() || (mode === 'born' && !birthDate) || (mode === 'pregnant' && !dueDate)}
                            className="w-full py-3.5 rounded-bubble bg-bb-primary font-display font-semibold text-lg disabled:opacity-50">
                            {loading ? 'Zapisuję…' : 'Gotowe! Startujemy 🎉'}
                        </button>
                    </form>
                )}

                <button onClick={signOut} className="w-full text-center text-xs text-bb-muted hover:text-bb-text transition-colors">
                    Wyloguj się
                </button>
            </div>
        </div>
    );
}
