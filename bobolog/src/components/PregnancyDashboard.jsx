import { useState } from 'react';
import { Baby, Sparkles, PartyPopper } from 'lucide-react';
import { useApp } from '../contexts/AppContext.jsx';
import { updateChild, generateVaccineSchedule } from '../data/store.js';
import { weekInfo } from '../data/pregnancy_weeks.js';

const DAY = 86400000;
const TERM_DAYS = 280; // 40 tygodni

export default function PregnancyDashboard({ child }) {
    const { loadFamily, isAdmin, isDemo } = useApp();
    const [saving, setSaving] = useState(false);

    const due = new Date(child.due_date + 'T12:00:00');
    const today = new Date(); today.setHours(12, 0, 0, 0);
    const daysLeft = Math.round((due - today) / DAY);
    const daysIn = Math.min(TERM_DAYS + 14, TERM_DAYS - daysLeft);
    const week = Math.max(1, Math.min(42, Math.floor(daysIn / 7) + 1));
    const info = weekInfo(week);
    const progress = Math.max(0, Math.min(100, (daysIn / TERM_DAYS) * 100));
    const overdue = daysLeft < 0;

    async function babyIsHere() {
        setSaving(true);
        const birthDate = new Date().toISOString().slice(0, 10);
        const ok = await updateChild(child.id, { birth_date: birthDate, due_date: null });
        if (ok) {
            await generateVaccineSchedule(child.id, child.family_id, birthDate);
            await loadFamily();
        }
        setSaving(false);
    }

    return (
        <div className="space-y-5">
            <div className="bg-bb-primary rounded-bubble p-6 text-center space-y-2">
                <Baby size={36} className="mx-auto" aria-hidden="true" />
                <h1 className="font-display text-2xl font-bold">{child.name} jest w drodze!</h1>
                {overdue ? (
                    <p className="font-semibold text-bb-muted">Termin minął {-daysLeft} {-daysLeft === 1 ? 'dzień' : 'dni'} temu – trzymamy kciuki! 🤞</p>
                ) : (
                    <p className="font-semibold text-bb-muted">
                        Jeszcze <span className="text-bb-text font-bold text-3xl">{daysLeft}</span> {daysLeft === 1 ? 'dzień' : 'dni'}
                    </p>
                )}
                <p className="text-sm font-semibold text-bb-muted">{week}. tydzień ciąży</p>
            </div>

            {/* Pasek postępu 1–42 tyg. */}
            <div className="bg-bb-card rounded-bubble border-2 border-bb-border p-4 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-bb-muted">
                    <span>1 tydz.</span><span>{Math.round(progress)}%</span><span>40 tydz.</span>
                </div>
                <div className="h-3 bg-bb-soft rounded-full overflow-hidden">
                    <div className="h-full bg-bb-primary rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <div className="flex justify-between text-[10px] text-bb-muted">
                    <span>I trymestr</span><span>II trymestr</span><span>III trymestr</span>
                </div>
            </div>

            {info && (
                <div className="bg-bb-accent rounded-bubble p-5 space-y-2">
                    <p className="text-sm font-semibold flex items-center gap-1.5"><Sparkles size={15} /> Tydzień {info.week}</p>
                    <p className="font-display font-bold text-lg">Maluch jest teraz wielkości: {info.size}</p>
                    <p className="text-sm opacity-80">{info.fact}</p>
                </div>
            )}

            {(overdue || daysLeft <= 7) && isAdmin && !isDemo && (
                <div className="bg-bb-accent2 rounded-bubble p-5 text-center space-y-3">
                    <PartyPopper size={26} className="mx-auto" aria-hidden="true" />
                    <p className="font-display font-bold text-lg">Czy {child.name} jest już na świecie?</p>
                    <p className="text-sm text-bb-muted">Kliknięcie ustawi dzisiejszą datę urodzenia, uruchomi dziennik i wygeneruje kalendarz szczepień PSO. Datę można później poprawić w Ustawieniach.</p>
                    <button onClick={babyIsHere} disabled={saving}
                        className="w-full py-3.5 rounded-bubble bg-bb-card border-2 border-bb-border font-display font-semibold text-lg disabled:opacity-50">
                        {saving ? 'Chwileczkę…' : 'Tak – witaj na świecie! 🎉'}
                    </button>
                </div>
            )}

            <p className="text-center text-bb-muted text-sm">Dziennik uruchomi się automatycznie po narodzinach.</p>
        </div>
    );
}
