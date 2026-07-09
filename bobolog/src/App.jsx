import { useEffect, useState, useCallback } from 'react';
import { Milk, MoonStar, Droplets, ChartLine, History as HistoryIcon, Home, Settings as SettingsIcon, Trash2, Sun, Moon, Users, ChevronDown, Scale, Syringe, Star, Camera, Bell, Settings2, Eye, EyeOff, ArrowUp, ArrowDown, RotateCcw } from 'lucide-react';
import Logo from './components/Logo.jsx';
import QuickAdd from './components/QuickAdd.jsx';
import InsightsSection from './components/InsightsSection.jsx';
import PregnancyDashboard from './components/PregnancyDashboard.jsx';
import InviteScreen from './screens/InviteScreen.jsx';
import VaccineScreen from './screens/VaccineScreen.jsx';
import StatsScreen from './screens/StatsScreen.jsx';
import MilestonesScreen from './screens/MilestonesScreen.jsx';
import MemoriesScreen from './screens/MemoriesScreen.jsx';
import { useApp } from './contexts/AppContext.jsx';
import { listEntries as listEntriesReal, addEntry as addEntryReal, removeEntry as removeEntryReal, getSettings, saveSettings, updateChild, bulkImportEntries, flushPendingEntries, pendingCount } from './data/store.js';
import { parseMyBabyCsv } from './utils/importMyBaby.js';
import { pushSupported, isPushEnabled, enablePush, disablePush } from './utils/push.js';
import { listEntries as listEntriesDemo, addEntry as addEntryDemo, removeEntry as removeEntryDemo } from './data/demoStore.js';
import { timeAgo, clock, dayLabel, duration, instrumental } from './utils/time.js';

const TYPE_META = {
    feed:   { label: 'Karmienie', Icon: Milk,     tile: 'bg-bb-primary' },
    sleep:  { label: 'Sen',       Icon: MoonStar,  tile: 'bg-bb-accent'  },
    diaper: { label: 'Pielucha',  Icon: Droplets,  tile: 'bg-bb-accent2' },
    weight: { label: 'Pomiar',    Icon: Scale,     tile: 'bg-bb-soft'    },
    mood:   { label: 'Nastrój',   Icon: Star,      tile: 'bg-bb-soft'    },
};

const KIND_LABELS = {
    'piers-l': 'pierś lewa', 'piers-p': 'pierś prawa', butelka: 'butelka', stale: 'posiłek stały',
    mokra: 'mokra', kupa: 'kupa', 'pelny-serwis': 'mokra + kupa',
};

function entryDetails(e) {
    const d = e.data || {};
    const parts = [];
    if (d.kind)        parts.push(KIND_LABELS[d.kind] || d.kind);
    if (d.amountMl)   parts.push(`${d.amountMl} ml`);
    if (d.durationMin) parts.push(`${d.durationMin} min`);
    if (d.start)       parts.push(duration(d.start, e.at));
    if (d.weightKg)   parts.push(`${d.weightKg} kg`);
    if (d.heightCm)   parts.push(`${d.heightCm} cm`);
    if (d.note)     parts.push(`„${d.note}"`);
    return parts.join(' · ');
}

// --- Motywy wg płci ---
const GENDER_THEME = { girl: 'blush', boy: 'sky', neutral: 'mint' };

// --- Dashboard personalizacja ---
const DASH_PREFS_KEY = 'bobolog.dashPrefs';
const DASH_SECTION_META = [
    ['summary',  'Ostatnie aktywności'],
    ['insights', 'Prognoza i analityka'],
    ['quickadd', 'Szybki wpis'],
];
function loadDashPrefs() {
    try { return JSON.parse(localStorage.getItem(DASH_PREFS_KEY)) ?? {}; } catch { return {}; }
}

function DashCustomizePanel({ ids, hidden, onMove, onToggle, onReset, onDone }) {
    const labels = Object.fromEntries(DASH_SECTION_META);
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

// --- Podkomponenty ---

function SummaryCard({ type, entry }) {
    const { label, Icon, tile } = TYPE_META[type];
    return (
        <div className="bg-bb-card rounded-bubble border-2 border-bb-border p-4 flex items-center gap-3">
            <span className={`${tile} rounded-full p-2.5 shrink-0`} aria-hidden="true"><Icon size={20} /></span>
            <div className="min-w-0">
                <p className="text-sm font-semibold text-bb-muted">{label}</p>
                {entry
                    ? <p className="font-semibold truncate">{timeAgo(entry.at)}<span className="text-bb-muted font-normal"> · {entryDetails(entry) || clock(entry.at)}</span></p>
                    : <p className="text-bb-muted">Brak wpisów</p>}
            </div>
        </div>
    );
}

function Dashboard({ entries, activeChild, settings, sleepStartedAt, now, onOpen }) {
    const lastName   = activeChild?.name || settings.childName;
    const lastFeed   = entries.find(e => e.type === 'feed')   || null;
    const lastSleep  = entries.find(e => e.type === 'sleep')  || null;
    const lastDiaper = entries.find(e => e.type === 'diaper') || null;

    const [prefs,   setPrefs]   = useState(loadDashPrefs);
    const [editing, setEditing] = useState(false);

    if (activeChild?.due_date && !activeChild?.birth_date) {
        return <PregnancyDashboard child={activeChild} />;
    }

    const allIds = DASH_SECTION_META.map(([id]) => id);

    function updatePrefs(patch) {
        setPrefs(p => {
            const next = { ...p, ...patch };
            localStorage.setItem(DASH_PREFS_KEY, JSON.stringify(next));
            return next;
        });
    }

    function orderedIds() {
        const saved = prefs.order || [];
        return [...saved.filter(id => allIds.includes(id)), ...allIds.filter(id => !saved.includes(id))];
    }

    const hiddenIds  = () => prefs.hidden || [];
    const visibleIds = () => orderedIds().filter(id => !hiddenIds().includes(id));

    function move(id, dir) {
        const ids = orderedIds();
        const i = ids.indexOf(id), j = i + dir;
        if (j < 0 || j >= ids.length) return;
        [ids[i], ids[j]] = [ids[j], ids[i]];
        updatePrefs({ order: ids });
    }

    function toggleVisible(id) {
        const hid = hiddenIds();
        updatePrefs({ hidden: hid.includes(id) ? hid.filter(x => x !== id) : [...hid, id] });
    }

    const sectionDefs = {
        summary: (
            <div className="space-y-3">
                <SummaryCard type="feed"   entry={lastFeed}   />
                <SummaryCard type="sleep"  entry={lastSleep}  />
                <SummaryCard type="diaper" entry={lastDiaper} />
            </div>
        ),
        insights: (
            <InsightsSection entries={entries} activeChild={activeChild} sleepStartedAt={sleepStartedAt} now={now} />
        ),
        quickadd: (
            <div>
                <h2 className="font-display font-semibold text-lg mb-3">Szybki wpis</h2>
                <div className="grid grid-cols-2 gap-3">
                    {Object.entries(TYPE_META).map(([type, { label, Icon, tile }]) => (
                        <button key={type} onClick={() => onOpen(type)}
                            className={`${tile} rounded-bubble py-5 flex flex-col items-center gap-2 font-display font-semibold active:scale-95 transition-transform`}>
                            <Icon size={26} aria-hidden="true" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>
        ),
    };

    return (
        <div className="space-y-6">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <h1 className="font-display text-2xl font-bold">Cześć! 👋</h1>
                    <p className="text-bb-muted font-semibold">Dzień z {instrumental(lastName)} – wszystko pod kontrolą.</p>
                </div>
                <button onClick={() => setEditing(e => !e)} aria-label="Dostosuj dashboard"
                    className={`shrink-0 text-xs font-semibold rounded-full px-3 py-1.5 border transition-colors flex items-center gap-1 mt-1
                        ${editing ? 'bg-bb-primary border-transparent' : 'text-bb-muted border-bb-muted/30 hover:bg-bb-soft'}`}>
                    <Settings2 size={13} /> Dostosuj
                </button>
            </div>

            {sleepStartedAt && (
                <button onClick={() => onOpen('sleep')} className="w-full bg-bb-accent rounded-bubble p-5 flex items-center gap-4 text-left">
                    <MoonStar size={28} aria-hidden="true" />
                    <div>
                        <p className="font-display font-semibold text-lg">Bobo śpi… {duration(sleepStartedAt, now)}</p>
                        <p className="text-sm font-semibold opacity-70">Stuknij, aby zakończyć i zapisać</p>
                    </div>
                </button>
            )}

            {editing ? (
                <DashCustomizePanel
                    ids={orderedIds()}
                    hidden={hiddenIds()}
                    onMove={move}
                    onToggle={toggleVisible}
                    onReset={() => updatePrefs({ order: undefined, hidden: [] })}
                    onDone={() => setEditing(false)}
                />
            ) : (
                <>
                    {visibleIds().length === 0 && (
                        <p className="text-center text-bb-muted text-sm py-8">
                            Wszystkie sekcje ukryte – kliknij „Dostosuj", aby je przywrócić.
                        </p>
                    )}
                    {visibleIds().map(id => sectionDefs[id] ? <div key={id}>{sectionDefs[id]}</div> : null)}
                </>
            )}
        </div>
    );
}

function History({ entries, onRemove, isAdmin }) {
    if (!entries.length) return (
        <p className="text-center text-bb-muted font-semibold py-16">Historia jest pusta – dodaj pierwszy wpis z ekranu „Dziś".</p>
    );
    const groups = [];
    entries.forEach(e => {
        const label = dayLabel(e.at);
        const g = groups.find(x => x.label === label);
        g ? g.items.push(e) : groups.push({ label, items: [e] });
    });
    return (
        <div className="space-y-6">
            {groups.map(g => (
                <section key={g.label}>
                    <h2 className="font-display font-semibold text-lg mb-2 capitalize">{g.label}</h2>
                    <ul className="space-y-2">
                        {g.items.map(e => {
                            const { label, Icon, tile } = TYPE_META[e.type] || {};
                            if (!label) return null;
                            return (
                                <li key={e.id} className="bg-bb-card rounded-bubble border-2 border-bb-border p-3.5 flex items-center gap-3">
                                    <span className={`${tile} rounded-full p-2 shrink-0`} aria-hidden="true"><Icon size={18} /></span>
                                    <div className="min-w-0 flex-1">
                                        <p className="font-semibold">{label} <span className="text-bb-muted font-normal">{clock(e.at)}</span></p>
                                        {entryDetails(e) && <p className="text-sm text-bb-muted truncate">{entryDetails(e)}</p>}
                                    </div>
                                    {isAdmin && (
                                        <button onClick={() => onRemove(e.id)} aria-label="Usuń wpis" className="p-2 rounded-full text-bb-muted hover:bg-bb-soft">
                                            <Trash2 size={17} />
                                        </button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </section>
            ))}
        </div>
    );
}

function Stats({ entries }) {
    const today = entries.filter(e => dayLabel(e.at) === 'Dziś');
    const count = t => today.filter(e => e.type === t).length;
    const sleepMin = today.filter(e => e.type === 'sleep' && e.data?.start)
        .reduce((s, e) => s + (new Date(e.at) - new Date(e.data.start)) / 60000, 0);
    return (
        <div className="space-y-6">
            <h1 className="font-display text-2xl font-bold">Statystyki</h1>
            <div className="grid grid-cols-3 gap-3">
                {[['Karmienia', count('feed')], ['Pieluchy', count('diaper')], ['Sen', `${Math.floor(sleepMin / 60)}h ${Math.round(sleepMin % 60)}m`]].map(([l, v]) => (
                    <div key={l} className="bg-bb-card rounded-bubble border-2 border-bb-border p-4 text-center">
                        <p className="font-display text-2xl font-bold">{v}</p>
                        <p className="text-sm font-semibold text-bb-muted">{l} dziś</p>
                    </div>
                ))}
            </div>
            <div className="bg-bb-soft rounded-bubble p-5 text-center">
                <ChartLine className="mx-auto mb-2" aria-hidden="true" />
                <p className="font-semibold">Heatmapa snu, siatki centylowe i korelacje pojawią się wkrótce.</p>
            </div>
        </div>
    );
}

const GENDER_OPTIONS = [
    { id: 'girl',    label: 'Dziewczynka', emoji: '🌸' },
    { id: 'boy',     label: 'Chłopiec',    emoji: '💙' },
    { id: 'neutral', label: 'Neutralny',   emoji: '🌿' },
];

function ChildProfileSection({ isDemo }) {
    const { activeChild, loadFamily } = useApp();
    const [name,      setName]      = useState(activeChild?.name       || '');
    const [birthDate, setBirthDate] = useState(activeChild?.birth_date || '');
    const [gender,    setGender]    = useState(activeChild?.gender     || '');
    const [saving,    setSaving]    = useState(false);
    const [saved,     setSaved]     = useState(false);
    const origBirth  = activeChild?.birth_date || '';
    const origGender = activeChild?.gender     || '';

    if (isDemo || !activeChild) return null;

    const dirty = name !== activeChild.name || birthDate !== origBirth || gender !== origGender;

    async function save() {
        if (!name.trim()) return;
        setSaving(true);
        const ok = await updateChild(activeChild.id, {
            name:       name.trim(),
            birth_date: birthDate || null,
            gender:     gender    || null,
        });
        if (ok) {
            if (gender && gender !== origGender) {
                // Zaktualizuj motyw wg płci jeśli user go nie nadpisał ręcznie
                if (!localStorage.getItem('bobolog.themeOverride')) {
                    const themeMap = { girl: 'blush', boy: 'sky', neutral: 'mint' };
                    if (themeMap[gender]) document.documentElement.dataset.theme = themeMap[gender];
                }
            }
            await loadFamily();
            setSaved(true);
            setTimeout(() => setSaved(false), 2000);
        }
        setSaving(false);
    }

    return (
        <div className="space-y-3">
            <p className="text-sm text-bb-muted font-semibold">Profil dziecka</p>
            <label className="block">
                <span className="text-xs text-bb-muted font-semibold">Imię</span>
                <input value={name} onChange={e => setName(e.target.value)}
                    className="mt-1 w-full px-4 py-3 rounded-2xl border-2 border-bb-border bg-bb-card outline-none focus:border-bb-text/30 font-body" />
            </label>
            <label className="block">
                <span className="text-xs text-bb-muted font-semibold">Data urodzenia</span>
                <input type="date" value={birthDate} onChange={e => setBirthDate(e.target.value)}
                    max={new Date().toISOString().slice(0, 10)}
                    className="mt-1 w-auto px-4 py-3 rounded-2xl border-2 border-bb-border bg-bb-card outline-none focus:border-bb-text/30 font-body" />
            </label>
            <div>
                <span className="text-xs text-bb-muted font-semibold">Płeć / motyw</span>
                <div className="flex gap-2 mt-1">
                    {GENDER_OPTIONS.map(g => (
                        <button key={g.id} type="button" onClick={() => setGender(g.id)}
                            className={`flex-1 py-2.5 rounded-2xl text-sm font-semibold border-2 transition-colors flex flex-col items-center gap-0.5
                                ${gender === g.id ? 'border-bb-text/30 bg-bb-card' : 'border-bb-border bg-bb-card/60 text-bb-muted'}`}>
                            <span>{g.emoji}</span>
                            <span className="text-[11px]">{g.label}</span>
                        </button>
                    ))}
                </div>
                <p className="text-xs text-bb-muted mt-1.5">Zmienia motyw kolorystyczny aplikacji (można nadpisać ręcznie w sekcji Motyw).</p>
            </div>
            {birthDate !== origBirth && origBirth && (
                <p className="text-xs text-bb-muted bg-bb-soft rounded-2xl px-3 py-2">
                    Po zmianie daty urodzenia wejdź w Szczepienia i kliknij „Generuj harmonogram PSO" ponownie.
                </p>
            )}
            <button onClick={save} disabled={!dirty || saving || !name.trim()}
                className="w-full bg-bb-primary border-2 border-bb-border rounded-bubble py-3 font-semibold disabled:opacity-40 transition-opacity">
                {saved ? '✓ Zapisano' : saving ? 'Zapisuję…' : 'Zapisz zmiany'}
            </button>
        </div>
    );
}

function ImportSection({ isDemo, onImported }) {
    const { activeChild, family, isAdmin } = useApp();
    const [preview, setPreview] = useState(null);
    const [importing, setImporting] = useState(false);
    const [result, setResult] = useState(null);

    if (isDemo || !activeChild || !isAdmin) return null;

    async function handleFile(e) {
        const file = e.target.files?.[0];
        if (!file) return;
        const text = await file.text();
        setResult(null);
        setPreview(parseMyBabyCsv(text));
        e.target.value = '';
    }

    async function doImport() {
        setImporting(true);
        const { inserted, skippedDups, error } = await bulkImportEntries(activeChild.id, family.id, preview.entries);
        setResult(error
            ? `Błąd importu: ${error} (zapisano ${inserted} wpisów)`
            : `✓ Zaimportowano ${inserted} wpisów` + (skippedDups > 0 ? ` · pominięto ${skippedDups} duplikatów` : ''));
        setPreview(null);
        setImporting(false);
        if (!error) onImported?.();
    }

    const counts = preview?.entries.reduce((acc, e) => { acc[e.type] = (acc[e.type] || 0) + 1; return acc; }, {});
    const COUNT_LABELS = { feed: 'karmień', sleep: 'snów', diaper: 'pieluch', weight: 'pomiarów' };

    return (
        <div className="space-y-3">
            <p className="text-sm text-bb-muted font-semibold">Import danych</p>
            <p className="text-xs text-bb-muted">
                Wczytaj plik CSV wyeksportowany z aplikacji „Baby Tracker • My Baby" (iOS).
                Duplikaty są automatycznie pomijane.
            </p>
            <label className="block">
                <span className="w-full bg-bb-card border-2 border-bb-border rounded-bubble py-3 font-semibold flex items-center justify-center gap-2 cursor-pointer">
                    Wybierz plik CSV
                </span>
                <input type="file" accept=".csv,text/csv" onChange={handleFile} className="hidden" />
            </label>

            {preview?.errors?.length > 0 && (
                <p className="text-sm text-red-500 bg-red-500/10 rounded-2xl px-4 py-3">{preview.errors[0]}</p>
            )}

            {preview && preview.entries.length > 0 && (
                <div className="bg-bb-soft rounded-bubble p-4 space-y-3">
                    <p className="text-sm font-semibold">
                        Znaleziono {preview.entries.length} wpisów:{' '}
                        {Object.entries(counts).map(([t, n]) => `${n} ${COUNT_LABELS[t] ?? t}`).join(', ')}
                        {preview.skipped > 0 && <span className="text-bb-muted font-normal"> · pominięto {preview.skipped} (np. odciąganie pokarmu)</span>}
                    </p>
                    <div className="flex gap-2">
                        <button onClick={() => setPreview(null)} disabled={importing}
                            className="flex-1 py-2.5 rounded-full border border-bb-muted/30 text-sm font-semibold text-bb-muted">
                            Anuluj
                        </button>
                        <button onClick={doImport} disabled={importing}
                            className="flex-1 py-2.5 rounded-full bg-bb-primary text-sm font-bold disabled:opacity-60">
                            {importing ? 'Importuję…' : `Importuj do profilu: ${activeChild.name}`}
                        </button>
                    </div>
                </div>
            )}

            {result && <p className="text-sm font-semibold text-center">{result}</p>}
        </div>
    );
}

function PushSection({ isDemo }) {
    const { family } = useApp();
    const [enabled, setEnabled] = useState(false);
    const [busy, setBusy] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => { isPushEnabled().then(setEnabled); }, []);

    if (isDemo || !pushSupported()) return null;

    async function toggle() {
        setBusy(true); setError('');
        try {
            if (enabled) { await disablePush(); setEnabled(false); }
            else { await enablePush(family.id); setEnabled(true); }
        } catch (err) { setError(err.message); }
        setBusy(false);
    }

    return (
        <div className="space-y-2">
            <p className="text-sm text-bb-muted font-semibold">Powiadomienia push</p>
            <button onClick={toggle} disabled={busy}
                className="w-full bg-bb-card border-2 border-bb-border rounded-bubble py-3.5 font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
                <Bell size={18} aria-hidden="true" />
                {busy ? 'Chwileczkę…' : enabled ? 'Wyłącz powiadomienia' : 'Włącz powiadomienia'}
            </button>
            <p className="text-xs text-bb-muted">Przypomnienia o szczepieniach i miesięcznicach – na tym urządzeniu.</p>
            {error && <p className="text-xs text-red-500 font-semibold">{error}</p>}
        </div>
    );
}

function SettingsTab({ settings, onChange, onShowInvite, onSignOut, isDemo, onImported, navPrefs, onNavPrefsChange }) {
    const themes = [
        { id: 'mint',  label: 'Miętowy', dot: '#C9EBDB' },
        { id: 'blush', label: 'Różany',  dot: '#F7D9E4' },
        { id: 'sky',   label: 'Błękitny',dot: '#C6DFF5' },
    ];
    return (
        <div className="space-y-6">
            <h1 className="font-display text-2xl font-bold">Ustawienia</h1>
            <ChildProfileSection isDemo={isDemo} />
            <div>
                <p className="text-sm text-bb-muted font-semibold mb-2">Motyw</p>
                <div className="flex gap-2">
                    {themes.map(t => (
                        <button key={t.id} onClick={() => onChange({ theme: t.id })}
                            className={`flex-1 rounded-bubble border-2 py-3 font-semibold flex flex-col items-center gap-1.5
                                ${settings.theme === t.id ? 'border-bb-text/40 bg-bb-card' : 'border-bb-border bg-bb-card/60'}`}>
                            <span className="w-6 h-6 rounded-full border border-black/10" style={{ background: t.dot }} />
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>
            <button onClick={() => onChange({ mode: settings.mode === 'night' ? 'day' : 'night' })}
                className="w-full bg-bb-card border-2 border-bb-border rounded-bubble py-3.5 font-semibold flex items-center justify-center gap-2">
                {settings.mode === 'night' ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
                {settings.mode === 'night' ? 'Tryb dzienny' : 'Tryb nocny'}
            </button>
            {!isDemo && (
                <button onClick={onShowInvite}
                    className="w-full bg-bb-card border-2 border-bb-border rounded-bubble py-3.5 font-semibold flex items-center justify-center gap-2">
                    <Users size={18} aria-hidden="true" /> Zarządzaj rodziną
                </button>
            )}
            <div>
                <p className="text-sm text-bb-muted font-semibold mb-2">Pasek nawigacji</p>
                <NavCustomizePanel prefs={navPrefs} onUpdate={onNavPrefsChange} />
            </div>
            <PushSection isDemo={isDemo} />
            <ImportSection isDemo={isDemo} onImported={onImported} />
            <button onClick={onSignOut}
                className="w-full border-2 border-bb-border rounded-bubble py-3 text-bb-muted font-semibold hover:text-bb-text transition-colors">
                {isDemo ? 'Wyjdź z trybu demo' : 'Wyloguj się'}
            </button>
            <p className="text-center text-sm text-bb-muted pt-2">
                BoboLab v0.6 · powered by <a href="https://draftlab.pl" className="underline">draftlab.pl</a>
            </p>
        </div>
    );
}

// --- Selektor dziecka (gdy >1 dziecko) ---
function ChildSelector({ children, active, onSelect }) {
    const [open, setOpen] = useState(false);
    if (children.length <= 1) return null;
    return (
        <div className="relative">
            <button onClick={() => setOpen(o => !o)} className="flex items-center gap-1 font-display font-semibold text-sm bg-bb-soft px-3 py-1.5 rounded-full">
                {active?.name} <ChevronDown size={14} />
            </button>
            {open && (
                <div className="absolute top-full mt-1 right-0 bg-bb-card border-2 border-bb-border rounded-2xl overflow-hidden z-20 min-w-[140px]">
                    {children.map(c => (
                        <button key={c.id} onClick={() => { onSelect(c); setOpen(false); }}
                            className={`w-full px-4 py-2.5 text-left font-semibold text-sm hover:bg-bb-soft ${c.id === active?.id ? 'text-bb-text' : 'text-bb-muted'}`}>
                            {c.name}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}

const TABS = [
    { id: 'dzis',        label: 'Dziś',      Icon: Home        },
    { id: 'historia',    label: 'Historia',  Icon: HistoryIcon },
    { id: 'staty',       label: 'Wykresy',   Icon: ChartLine   },
    { id: 'chwile',      label: 'Chwile',    Icon: Camera      },
    { id: 'milestones',  label: 'Kroki',     Icon: Star        },
    { id: 'szczepienia', label: 'Szczep.',   Icon: Syringe     },
    { id: 'ustawienia',  label: 'Więcej',    Icon: SettingsIcon},
];

// --- Nawigacja personalizacja ---
const NAV_PREFS_KEY = 'bobolog.navPrefs';
const NAV_FIXED_START = 'dzis';
const NAV_FIXED_END   = 'ustawienia';
const NAV_CUSTOM = ['historia', 'staty', 'chwile', 'milestones', 'szczepienia'];
const TAB_MAP = Object.fromEntries(TABS.map(t => [t.id, t]));

function loadNavPrefs() {
    try { return JSON.parse(localStorage.getItem(NAV_PREFS_KEY)) ?? {}; } catch { return {}; }
}

function getVisibleTabs(prefs) {
    const saved   = (prefs.order ?? []).filter(id => NAV_CUSTOM.includes(id));
    const allOrd  = [...saved, ...NAV_CUSTOM.filter(id => !saved.includes(id))];
    const hidden  = prefs.hidden ?? [];
    const visible = allOrd.filter(id => !hidden.includes(id));
    return [TAB_MAP[NAV_FIXED_START], ...visible.map(id => TAB_MAP[id]), TAB_MAP[NAV_FIXED_END]];
}

function NavCustomizePanel({ prefs, onUpdate }) {
    const saved   = (prefs.order ?? []).filter(id => NAV_CUSTOM.includes(id));
    const allOrd  = [...saved, ...NAV_CUSTOM.filter(id => !saved.includes(id))];
    const hidden  = prefs.hidden ?? [];

    function move(id, dir) {
        const ids = [...allOrd];
        const i = ids.indexOf(id), j = i + dir;
        if (j < 0 || j >= ids.length) return;
        [ids[i], ids[j]] = [ids[j], ids[i]];
        onUpdate({ ...prefs, order: ids });
    }

    function toggle(id) {
        const h = hidden.includes(id) ? hidden.filter(x => x !== id) : [...hidden, id];
        onUpdate({ ...prefs, hidden: h });
    }

    return (
        <div className="space-y-2">
            <p className="text-xs text-bb-muted">
                „Dziś" i „Więcej" są zawsze widoczne. Pozostałe zakładki możesz ukryć lub przestawić.
            </p>
            {allOrd.map((id, i) => {
                const t = TAB_MAP[id];
                const isHidden = hidden.includes(id);
                return (
                    <div key={id} className={`flex items-center gap-1.5 bg-bb-soft rounded-2xl px-4 py-3 transition-opacity ${isHidden ? 'opacity-40' : ''}`}>
                        <t.Icon size={15} className="shrink-0 text-bb-muted" aria-hidden="true" />
                        <span className="flex-1 text-sm font-semibold">{t.label === 'Szczep.' ? 'Szczepienia' : t.label}</span>
                        <button onClick={() => move(id, -1)} disabled={i === 0}
                            className="p-2 rounded-full hover:bg-bb-card disabled:opacity-30" aria-label="Przesuń w górę"><ArrowUp size={15} /></button>
                        <button onClick={() => move(id, 1)} disabled={i === allOrd.length - 1}
                            className="p-2 rounded-full hover:bg-bb-card disabled:opacity-30" aria-label="Przesuń w dół"><ArrowDown size={15} /></button>
                        <button onClick={() => toggle(id)} aria-label={isHidden ? 'Pokaż zakładkę' : 'Ukryj zakładkę'}
                            className="p-2 rounded-full hover:bg-bb-card">
                            {isHidden ? <EyeOff size={15} /> : <Eye size={15} />}
                        </button>
                    </div>
                );
            })}
            <button onClick={() => onUpdate({ order: undefined, hidden: [] })}
                className="w-full py-2.5 rounded-full border border-bb-muted/30 text-sm font-semibold text-bb-muted flex items-center justify-center gap-1.5 mt-1">
                <RotateCcw size={14} /> Domyślne
            </button>
        </div>
    );
}

export default function App() {
    const { activeChild, setActiveChild, familyChildren, family, isAdmin, signOut, isDemo } = useApp();
    const listEntries = isDemo ? listEntriesDemo : listEntriesReal;
    const addEntry    = isDemo ? addEntryDemo    : addEntryReal;
    const removeEntry = isDemo ? removeEntryDemo : removeEntryReal;
    const [settings, setSettings] = useState(getSettings);
    const [entries, setEntries] = useState([]);
    const [tab, setTab] = useState('dzis');
    const [sheet, setSheet] = useState(null);
    const [showInvite, setShowInvite] = useState(false);
    const [now, setNow] = useState(() => new Date().toISOString());
    const [online, setOnline] = useState(() => navigator.onLine);
    const [navPrefs, setNavPrefs] = useState(loadNavPrefs);

    function updateNavPrefs(next) {
        localStorage.setItem(NAV_PREFS_KEY, JSON.stringify(next));
        setNavPrefs(next);
        // Jeśli aktywna zakładka stała się ukryta — wróć na Dziś
        const visible = getVisibleTabs(next).map(t => t.id);
        if (!visible.includes(tab)) setTab('dzis');
    }

    const visibleTabs = getVisibleTabs(navPrefs);

    // Temat wg płci dziecka (nadpisywalny ręcznie w ustawieniach)
    useEffect(() => {
        if (activeChild?.gender && !localStorage.getItem('bobolog.themeOverride')) {
            setSettings(s => ({ ...s, theme: GENDER_THEME[activeChild.gender] || 'mint' }));
        }
    }, [activeChild?.id]);

    useEffect(() => {
        document.documentElement.dataset.theme = settings.theme;
        document.documentElement.dataset.mode  = settings.mode;
    }, [settings.theme, settings.mode]);

    useEffect(() => {
        // tyka zawsze – przewidywania na dashboardzie muszą się odświeżać
        const t = setInterval(() => setNow(new Date().toISOString()), settings.sleepStartedAt ? 30000 : 60000);
        return () => clearInterval(t);
    }, [settings.sleepStartedAt]);

    const refresh = useCallback(async () => {
        if (!activeChild) return;
        setEntries(await listEntries(activeChild.id));
    }, [activeChild?.id]);

    useEffect(() => { refresh(); }, [refresh]);

    // Offline → online: wyślij kolejkę zaległych wpisów i odśwież
    useEffect(() => {
        const goOnline = async () => {
            setOnline(true);
            if (!isDemo && await flushPendingEntries() > 0) refresh();
        };
        const goOffline = () => setOnline(false);
        window.addEventListener('online', goOnline);
        window.addEventListener('offline', goOffline);
        if (navigator.onLine && !isDemo) flushPendingEntries().then(n => { if (n > 0) refresh(); });
        return () => { window.removeEventListener('online', goOnline); window.removeEventListener('offline', goOffline); };
    }, [isDemo, refresh]);

    const change = patch => {
        // Jeśli user ręcznie zmienia motyw – zapamiętaj override
        if (patch.theme) localStorage.setItem('bobolog.themeOverride', '1');
        setSettings(saveSettings(patch));
    };

    const handleSave = async (type, data) => {
        if (!activeChild || !family) return;
        await addEntry(activeChild.id, family.id, type, data);
        refresh();
    };

    const handleSleepStart = () => change({ sleepStartedAt: new Date().toISOString() });
    const handleSleepStop  = async () => {
        if (settings.sleepStartedAt) await addEntry(activeChild.id, family.id, 'sleep', { start: settings.sleepStartedAt });
        change({ sleepStartedAt: null });
        refresh();
    };

    const handleRemove = async id => {
        await removeEntry(id);
        refresh();
    };

    return (
        <div className="min-h-screen max-w-lg mx-auto flex flex-col">
            {!online && (
                <div className="bg-bb-accent border-b-2 border-bb-border px-5 py-2 text-sm font-semibold text-center">
                    Offline – wpisy zapisują się lokalnie{pendingCount() > 0 ? ` (${pendingCount()} w kolejce)` : ''} i zsynchronizują po powrocie sieci
                </div>
            )}
            {isDemo && (
                <div className="bg-bb-soft border-b-2 border-bb-border px-5 py-2 flex items-center justify-between text-sm font-semibold">
                    <span className="text-bb-muted">Tryb demo – dane nie są zapisywane</span>
                    <button onClick={signOut} className="text-bb-text underline underline-offset-2">Zarejestruj się</button>
                </div>
            )}
            <header className="flex items-center gap-1.5 px-5 pt-6 pb-4">
                <Logo size={42} />
                <span className="font-display text-xl font-bold flex-1">BoboLab</span>
                <ChildSelector children={familyChildren} active={activeChild} onSelect={c => { setActiveChild(c); localStorage.removeItem('bobolog.themeOverride'); }} />
            </header>

            <main className="flex-1 px-5 pb-28" style={{ paddingBottom: 'calc(7rem + env(safe-area-inset-bottom))' }}>
                {tab === 'dzis'        && <Dashboard entries={entries} activeChild={activeChild} settings={settings} sleepStartedAt={settings.sleepStartedAt} now={now} onOpen={setSheet} />}
                {tab === 'historia'    && <History   entries={entries} onRemove={handleRemove} isAdmin={isAdmin} />}
                {tab === 'staty'       && <StatsScreen entries={entries} activeChild={activeChild} sleepStartedAt={settings.sleepStartedAt} />}
                {tab === 'chwile'      && <MemoriesScreen entries={entries} activeChild={activeChild} family={family} isAdmin={isAdmin} isDemo={isDemo} onChanged={refresh} />}
                {tab === 'milestones'  && <MilestonesScreen activeChild={activeChild} isDemo={isDemo} />}
                {tab === 'szczepienia' && <VaccineScreen />}
                {tab === 'ustawienia'  && <SettingsTab settings={settings} onChange={change} onShowInvite={() => setShowInvite(true)} onSignOut={signOut} isDemo={isDemo} onImported={refresh} navPrefs={navPrefs} onNavPrefsChange={updateNavPrefs} />}
            </main>

            <nav className="fixed bottom-0 inset-x-0 bg-bb-card border-t-2 border-bb-border" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }} aria-label="Nawigacja główna">
                <div className="max-w-lg mx-auto grid" style={{ gridTemplateColumns: `repeat(${visibleTabs.length}, 1fr)` }}>
                    {visibleTabs.map(({ id, label, Icon }) => (
                        <button key={id} onClick={() => setTab(id)}
                            className={`py-3 flex flex-col items-center gap-1 text-[10px] font-semibold ${tab === id ? 'text-bb-text' : 'text-bb-muted'}`}>
                            <span className={`px-3 py-1 rounded-full ${tab === id ? 'bg-bb-primary' : ''}`}><Icon size={19} aria-hidden="true" /></span>
                            {label}
                        </button>
                    ))}
                </div>
            </nav>

            {sheet && (
                <QuickAdd
                    type={sheet}
                    sleepStartedAt={settings.sleepStartedAt}
                    onSave={handleSave}
                    onSleepStart={handleSleepStart}
                    onSleepStop={handleSleepStop}
                    onClose={() => setSheet(null)}
                />
            )}

            {showInvite && <InviteScreen onClose={() => setShowInvite(false)} />}
        </div>
    );
}
