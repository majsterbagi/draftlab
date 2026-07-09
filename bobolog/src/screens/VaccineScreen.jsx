import { useEffect, useState, useCallback } from 'react';
import { Check, Clock, Plus, ChevronLeft, ChevronRight, X, Calendar, List } from 'lucide-react';
import { PSO_VACCINES } from '../data/pso_vaccines.js';
import { listVaccineRecords, markVaccineDone, unmarkVaccineDone, addCustomVaccine, generateVaccineSchedule } from '../data/store.js';
import { useApp } from '../contexts/AppContext.jsx';

const TODAY = new Date().toISOString().slice(0, 10);

function vaccineLabel(r) {
    if (r.vaccine_id === 'custom') return r.custom_name || 'Własne szczepienie';
    return PSO_VACCINES.find(v => v.id === r.vaccine_id)?.name || r.vaccine_id;
}

function vaccineShort(r) {
    if (r.vaccine_id === 'custom') return '💉';
    return PSO_VACCINES.find(v => v.id === r.vaccine_id)?.shortName || '?';
}

function formatDate(d) {
    return new Date(d).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short', year: 'numeric' });
}

// --- Modal: oznacz jako wykonane ---
function DoneModal({ record, onSave, onClose }) {
    const [doneDate, setDoneDate] = useState(TODAY);
    const [batch, setBatch] = useState('');
    const [notes, setNotes] = useState(record.notes || '');
    const [loading, setLoading] = useState(false);

    async function save() {
        setLoading(true);
        await onSave(record.id, { doneDate, batchNumber: batch, notes });
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />
            <div className="relative w-full sm:max-w-md bg-bb-card rounded-t-bubble sm:rounded-bubble p-6 pb-8 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-display font-semibold text-lg">Oznacz jako wykonane</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-bb-soft"><X size={18} /></button>
                </div>
                <p className="text-sm font-semibold text-bb-muted">{vaccineLabel(record)}</p>
                <label className="block">
                    <span className="text-sm text-bb-muted font-semibold">Data wykonania</span>
                    <input type="date" value={doneDate} onChange={e => setDoneDate(e.target.value)} max={TODAY}
                        className="mt-1 w-full px-4 py-3 rounded-2xl border-2 border-bb-border bg-bb-bg outline-none focus:border-bb-text/30" />
                </label>
                <label className="block">
                    <span className="text-sm text-bb-muted font-semibold">Numer serii (opcjonalnie)</span>
                    <input value={batch} onChange={e => setBatch(e.target.value)} placeholder="np. AB1234"
                        className="mt-1 w-full px-4 py-3 rounded-2xl border-2 border-bb-border bg-bb-bg outline-none focus:border-bb-text/30" />
                </label>
                <label className="block">
                    <span className="text-sm text-bb-muted font-semibold">Notatka (opcjonalnie)</span>
                    <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="np. bez reakcji"
                        className="mt-1 w-full px-4 py-3 rounded-2xl border-2 border-bb-border bg-bb-bg outline-none focus:border-bb-text/30" />
                </label>
                <button onClick={save} disabled={loading || !doneDate}
                    className="w-full py-3.5 rounded-bubble bg-bb-primary font-display font-semibold text-lg disabled:opacity-50">
                    {loading ? 'Zapisuję…' : 'Zapisz'}
                </button>
            </div>
        </div>
    );
}

// --- Modal: dodaj własne szczepienie ---
function CustomModal({ onSave, onClose }) {
    const [name, setName] = useState('');
    const [scheduledDate, setScheduledDate] = useState(TODAY);
    const [notes, setNotes] = useState('');
    const [loading, setLoading] = useState(false);

    async function save() {
        if (!name.trim()) return;
        setLoading(true);
        await onSave({ name: name.trim(), scheduledDate, notes });
        onClose();
    }

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
            <div className="absolute inset-0 bg-black/30" onClick={onClose} />
            <div className="relative w-full sm:max-w-md bg-bb-card rounded-t-bubble sm:rounded-bubble p-6 pb-8 shadow-xl space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="font-display font-semibold text-lg">Dodaj własne szczepienie</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-bb-soft"><X size={18} /></button>
                </div>
                <label className="block">
                    <span className="text-sm text-bb-muted font-semibold">Nazwa szczepionki</span>
                    <input value={name} onChange={e => setName(e.target.value)} placeholder="np. Meningokoki B"
                        className="mt-1 w-full px-4 py-3 rounded-2xl border-2 border-bb-border bg-bb-bg outline-none focus:border-bb-text/30" />
                </label>
                <label className="block">
                    <span className="text-sm text-bb-muted font-semibold">Planowana data</span>
                    <input type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)}
                        className="mt-1 w-full px-4 py-3 rounded-2xl border-2 border-bb-border bg-bb-bg outline-none focus:border-bb-text/30" />
                </label>
                <label className="block">
                    <span className="text-sm text-bb-muted font-semibold">Notatka (opcjonalnie)</span>
                    <input value={notes} onChange={e => setNotes(e.target.value)} placeholder="opcjonalnie"
                        className="mt-1 w-full px-4 py-3 rounded-2xl border-2 border-bb-border bg-bb-bg outline-none focus:border-bb-text/30" />
                </label>
                <button onClick={save} disabled={loading || !name.trim()}
                    className="w-full py-3.5 rounded-bubble bg-bb-primary font-display font-semibold text-lg disabled:opacity-50">
                    {loading ? 'Zapisuję…' : 'Dodaj'}
                </button>
            </div>
        </div>
    );
}

// --- Wiersz szczepienia ---
function VaccineRow({ record, isAdmin, onMarkDone, onUnmark }) {
    const done = !!record.done_date;
    const overdue = !done && record.scheduled_date < TODAY;

    return (
        <li className={`flex items-center gap-3 rounded-bubble border-2 px-4 py-3
            ${done ? 'bg-bb-card border-bb-border opacity-70'
              : overdue ? 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-900'
              : 'bg-bb-card border-bb-border'}`}>
            <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-xs font-bold
                ${done ? 'bg-green-100 text-green-700' : overdue ? 'bg-red-100 text-red-600' : 'bg-bb-primary'}`}>
                {done ? <Check size={16} /> : overdue ? <Clock size={16} /> : vaccineShort(record)}
            </div>
            <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm truncate">{vaccineLabel(record)}</p>
                <p className="text-xs text-bb-muted">
                    {done
                        ? `Wykonano ${formatDate(record.done_date)}${record.batch_number ? ` · seria ${record.batch_number}` : ''}`
                        : `Termin: ${formatDate(record.scheduled_date)}`}
                </p>
            </div>
            {isAdmin && (
                done
                    ? <button onClick={() => onUnmark(record.id)} className="text-xs text-bb-muted underline shrink-0">cofnij</button>
                    : <button onClick={() => onMarkDone(record)}
                        className="shrink-0 px-3 py-1.5 rounded-full bg-bb-primary text-xs font-semibold border border-bb-border">
                        Wykonane
                    </button>
            )}
        </li>
    );
}

// --- Widok kalendarza ---
function CalendarView({ records, onDayClick }) {
    const [month, setMonth] = useState(() => {
        const d = new Date(); d.setDate(1); return d;
    });

    const year = month.getFullYear();
    const m = month.getMonth();
    const firstDay = new Date(year, m, 1).getDay(); // 0=Sun
    const daysInMonth = new Date(year, m + 1, 0).getDate();
    // adjust: Mon=0
    const startOffset = (firstDay + 6) % 7;

    const byDate = {};
    records.forEach(r => {
        const key = r.done_date || r.scheduled_date;
        if (!byDate[key]) byDate[key] = [];
        byDate[key].push(r);
    });

    const cells = Array.from({ length: startOffset }, () => null)
        .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

    function dotColor(dayRecords) {
        const hasDone = dayRecords.some(r => r.done_date);
        const hasOverdue = dayRecords.some(r => !r.done_date && r.scheduled_date < TODAY);
        if (hasDone) return 'bg-green-500';
        if (hasOverdue) return 'bg-red-400';
        return 'bg-bb-primary';
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <button onClick={() => setMonth(new Date(year, m - 1, 1))} className="p-2 rounded-full hover:bg-bb-soft">
                    <ChevronLeft size={18} />
                </button>
                <p className="font-display font-semibold capitalize">
                    {month.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' })}
                </p>
                <button onClick={() => setMonth(new Date(year, m + 1, 1))} className="p-2 rounded-full hover:bg-bb-soft">
                    <ChevronRight size={18} />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs text-bb-muted font-semibold mb-1">
                {['Pn','Wt','Śr','Cz','Pt','So','Nd'].map(d => <div key={d}>{d}</div>)}
            </div>

            <div className="grid grid-cols-7 gap-1">
                {cells.map((day, i) => {
                    if (!day) return <div key={`e${i}`} />;
                    const dateStr = `${year}-${String(m + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                    const dayRecords = byDate[dateStr] || [];
                    const isToday = dateStr === TODAY;
                    return (
                        <button key={dateStr}
                            onClick={() => dayRecords.length && onDayClick(dayRecords)}
                            className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-0.5 text-xs font-semibold transition-colors
                                ${isToday ? 'border-2 border-bb-text/30' : ''}
                                ${dayRecords.length ? 'bg-bb-soft hover:bg-bb-primary/30 cursor-pointer' : 'cursor-default'}`}>
                            <span>{day}</span>
                            {dayRecords.length > 0 && (
                                <span className={`w-1.5 h-1.5 rounded-full ${dotColor(dayRecords)}`} />
                            )}
                        </button>
                    );
                })}
            </div>

            <div className="flex gap-4 text-xs font-semibold text-bb-muted justify-center pt-1">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-bb-primary" />Nadchodzące</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-400" />Zaległe</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500" />Wykonane</span>
            </div>
        </div>
    );
}

// --- Główny komponent ---
export default function VaccineScreen() {
    const { activeChild, family, isAdmin, isDemo } = useApp();
    const [records, setRecords] = useState([]);
    const [view, setView] = useState('list');
    const [doneModal, setDoneModal] = useState(null);
    const [customModal, setCustomModal] = useState(false);
    const [calDayRecords, setCalDayRecords] = useState(null);
    const [generating, setGenerating] = useState(false);

    const refresh = useCallback(async () => {
        if (!activeChild || isDemo) return;
        setRecords(await listVaccineRecords(activeChild.id));
    }, [activeChild?.id, isDemo]);

    useEffect(() => { refresh(); }, [refresh]);

    const overdue   = records.filter(r => !r.done_date && r.scheduled_date < TODAY);
    const upcoming  = records.filter(r => !r.done_date && r.scheduled_date >= TODAY);
    const done      = records.filter(r => !!r.done_date);

    async function handleMarkDone(id, data) {
        await markVaccineDone(id, data);
        refresh();
    }

    async function handleUnmark(id) {
        await unmarkVaccineDone(id);
        refresh();
    }

    async function handleAddCustom(data) {
        await addCustomVaccine(activeChild.id, family.id, data);
        refresh();
    }

    async function handleGenerate() {
        if (!activeChild?.birth_date) return;
        setGenerating(true);
        await generateVaccineSchedule(activeChild.id, family.id, activeChild.birth_date);
        await refresh();
        setGenerating(false);
    }

    if (isDemo) {
        return (
            <div className="text-center py-16 space-y-2">
                <p className="text-4xl">💉</p>
                <p className="font-semibold">Szczepienia dostępne po rejestracji</p>
                <p className="text-sm text-bb-muted">Harmonogram PSO generuje się automatycznie przy tworzeniu profilu dziecka.</p>
            </div>
        );
    }

    if (!records.length && !isDemo) {
        return (
            <div className="space-y-5">
                <div className="flex items-center justify-between">
                    <h1 className="font-display text-2xl font-bold">Szczepienia</h1>
                    {isAdmin && (
                        <button onClick={() => setCustomModal(true)}
                            className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-bb-soft text-sm font-semibold">
                            <Plus size={15} /> Dodaj własne
                        </button>
                    )}
                </div>
                <div className="text-center py-10 text-bb-muted space-y-4">
                    <p className="text-4xl">💉</p>
                    <p className="font-semibold">Brak harmonogramu szczepień</p>
                    {isAdmin && activeChild?.birth_date ? (
                        <>
                            <p className="text-sm">Wygeneruj harmonogram PSO 2024 na podstawie daty urodzenia dziecka.</p>
                            <button onClick={handleGenerate} disabled={generating}
                                className="mx-auto flex items-center gap-2 px-5 py-3 rounded-bubble bg-bb-primary font-display font-semibold disabled:opacity-50">
                                {generating ? 'Generuję…' : '✨ Generuj harmonogram PSO'}
                            </button>
                        </>
                    ) : (
                        <p className="text-sm">Harmonogram PSO generuje się automatycznie przy tworzeniu profilu dziecka. Możesz też dodać szczepienie ręcznie.</p>
                    )}
                </div>
                {customModal && <CustomModal onSave={handleAddCustom} onClose={() => setCustomModal(false)} />}
            </div>
        );
    }

    return (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h1 className="font-display text-2xl font-bold">Szczepienia</h1>
                {isAdmin && (
                    <button onClick={() => setCustomModal(true)}
                        className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-bb-soft text-sm font-semibold">
                        <Plus size={15} /> Dodaj własne
                    </button>
                )}
            </div>

            {/* Przełącznik widoku */}
            <div className="flex bg-bb-soft rounded-2xl p-1">
                <button onClick={() => setView('list')}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors
                        ${view === 'list' ? 'bg-bb-card text-bb-text' : 'text-bb-muted'}`}>
                    <List size={14} /> Lista
                </button>
                <button onClick={() => setView('calendar')}
                    className={`flex-1 py-2 rounded-xl text-sm font-semibold flex items-center justify-center gap-1.5 transition-colors
                        ${view === 'calendar' ? 'bg-bb-card text-bb-text' : 'text-bb-muted'}`}>
                    <Calendar size={14} /> Kalendarz
                </button>
            </div>

            {view === 'calendar' && (
                <CalendarView records={records} onDayClick={setCalDayRecords} />
            )}

            {view === 'list' && (
                <div className="space-y-5">
                    {overdue.length > 0 && (
                        <section>
                            <h2 className="text-sm font-semibold text-red-500 mb-2">Zaległe ({overdue.length})</h2>
                            <ul className="space-y-2">
                                {overdue.map(r => (
                                    <VaccineRow key={r.id} record={r} isAdmin={isAdmin}
                                        onMarkDone={setDoneModal} onUnmark={handleUnmark} />
                                ))}
                            </ul>
                        </section>
                    )}

                    {upcoming.length > 0 && (
                        <section>
                            <h2 className="text-sm font-semibold text-bb-muted mb-2">Nadchodzące ({upcoming.length})</h2>
                            <ul className="space-y-2">
                                {upcoming.slice(0, 10).map(r => (
                                    <VaccineRow key={r.id} record={r} isAdmin={isAdmin}
                                        onMarkDone={setDoneModal} onUnmark={handleUnmark} />
                                ))}
                                {upcoming.length > 10 && (
                                    <li className="text-center text-xs text-bb-muted py-1">
                                        + {upcoming.length - 10} kolejnych szczepień
                                    </li>
                                )}
                            </ul>
                        </section>
                    )}

                    {done.length > 0 && (
                        <section>
                            <h2 className="text-sm font-semibold text-bb-muted mb-2">Wykonane ({done.length})</h2>
                            <ul className="space-y-2">
                                {done.map(r => (
                                    <VaccineRow key={r.id} record={r} isAdmin={isAdmin}
                                        onMarkDone={setDoneModal} onUnmark={handleUnmark} />
                                ))}
                            </ul>
                        </section>
                    )}
                </div>
            )}

            {/* Modal: dzień w kalendarzu */}
            {calDayRecords && (
                <div className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-center">
                    <div className="absolute inset-0 bg-black/30" onClick={() => setCalDayRecords(null)} />
                    <div className="relative w-full sm:max-w-md bg-bb-card rounded-t-bubble sm:rounded-bubble p-6 pb-8 shadow-xl space-y-3">
                        <div className="flex items-center justify-between mb-2">
                            <h3 className="font-display font-semibold">
                                {formatDate(calDayRecords[0].done_date || calDayRecords[0].scheduled_date)}
                            </h3>
                            <button onClick={() => setCalDayRecords(null)} className="p-2 rounded-full hover:bg-bb-soft"><X size={18} /></button>
                        </div>
                        <ul className="space-y-2">
                            {calDayRecords.map(r => (
                                <VaccineRow key={r.id} record={r} isAdmin={isAdmin}
                                    onMarkDone={r2 => { setCalDayRecords(null); setDoneModal(r2); }}
                                    onUnmark={id => { handleUnmark(id); setCalDayRecords(null); }} />
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {doneModal && (
                <DoneModal record={doneModal}
                    onSave={handleMarkDone}
                    onClose={() => setDoneModal(null)} />
            )}

            {customModal && (
                <CustomModal onSave={handleAddCustom} onClose={() => setCustomModal(false)} />
            )}
        </div>
    );
}
