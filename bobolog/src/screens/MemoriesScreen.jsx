import { useEffect, useMemo, useState } from 'react';
import { Camera, Cake, X, Trash2, Clock } from 'lucide-react';
import { uploadMemoryPhoto, getPhotoUrls, removeMemory, addEntry } from '../data/store.js';
import { compressImage } from '../utils/compressImage.js';
import { nextMonthiversary } from '../utils/insights.js';
import { ageAt } from '../utils/time.js';

function monthLabel(iso) {
    return new Date(iso).toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
}

// Wspomnienia sprzed ~miesiąca i ~roku (± 4 dni)
function fromThisPeriod(memories, now = new Date()) {
    const hits = [];
    const DAY = 86400000;
    memories.forEach(m => {
        const t = new Date(m.at);
        [[1, 'miesiąc temu'], [12, 'rok temu']].forEach(([months, label]) => {
            const ref = new Date(now);
            ref.setMonth(ref.getMonth() - months);
            if (Math.abs(ref - t) <= 4 * DAY) hits.push({ ...m, periodLabel: label });
        });
    });
    return hits;
}

function AddMemorySheet({ file, activeChild, family, onSaved, onClose }) {
    const [caption, setCaption] = useState('');
    const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const previewUrl = useMemo(() => URL.createObjectURL(file), [file]);
    useEffect(() => () => URL.revokeObjectURL(previewUrl), [previewUrl]);

    async function save() {
        setSaving(true); setError('');
        try {
            const blob = await compressImage(file);
            const path = await uploadMemoryPhoto(family.id, activeChild.id, blob);
            if (!path) throw new Error('Upload nie powiódł się');
            const at = new Date(date + 'T12:00:00').toISOString();
            const saved = await addEntry(activeChild.id, family.id, 'memory', { photoPath: path, caption: caption.trim() || null, at });
            if (!saved) throw new Error('Nie udało się zapisać wpisu (sprawdź SQL v0.6 w Supabase)');
            onSaved();
        } catch (err) {
            console.error(err);
            setError(err.message || 'Coś poszło nie tak');
            setSaving(false);
        }
    }

    return (
        <div className="fixed inset-0 bg-black/40 flex items-end justify-center z-50" onClick={onClose}>
            <div className="bg-bb-card rounded-t-3xl p-5 w-full max-w-lg space-y-4" onClick={e => e.stopPropagation()}>
                <div className="flex items-center justify-between">
                    <h2 className="font-display text-lg font-bold">Nowa chwila</h2>
                    <button onClick={onClose} aria-label="Zamknij" className="p-2 rounded-full hover:bg-bb-soft"><X size={18} /></button>
                </div>
                <img src={previewUrl} alt="" className="w-full max-h-64 object-cover rounded-2xl" />
                <input value={caption} onChange={e => setCaption(e.target.value)} placeholder="Podpis (opcjonalnie)"
                    className="w-full px-4 py-3 rounded-2xl border-2 border-bb-border bg-bb-card outline-none focus:border-bb-text/30 font-body" />
                <label className="block">
                    <span className="text-xs text-bb-muted font-semibold">Data</span>
                    <input type="date" value={date} onChange={e => setDate(e.target.value)}
                        max={new Date().toISOString().slice(0, 10)}
                        className="mt-1 w-auto px-4 py-2.5 rounded-2xl border-2 border-bb-border bg-bb-card outline-none font-body" />
                </label>
                {error && <p className="text-sm text-red-500 font-semibold">{error}</p>}
                <button onClick={save} disabled={saving}
                    className="w-full py-3.5 rounded-bubble bg-bb-primary font-display font-semibold text-lg disabled:opacity-50">
                    {saving ? 'Zapisuję…' : 'Zapisz wspomnienie'}
                </button>
            </div>
        </div>
    );
}

function Lightbox({ memory, url, birthDate, isAdmin, onRemove, onClose }) {
    const age = ageAt(birthDate, memory.at);
    return (
        <div className="fixed inset-0 bg-black/80 z-50 flex flex-col" onClick={onClose}>
            <div className="flex justify-end p-3">
                <button onClick={onClose} aria-label="Zamknij" className="p-2 rounded-full bg-white/10 text-white"><X size={20} /></button>
            </div>
            <div className="flex-1 flex items-center justify-center px-3 min-h-0" onClick={e => e.stopPropagation()}>
                {url ? <img src={url} alt={memory.data?.caption || ''} className="max-h-full max-w-full rounded-2xl object-contain" /> : null}
            </div>
            <div className="p-5 text-white space-y-1" onClick={e => e.stopPropagation()}>
                {memory.data?.caption && <p className="font-display font-semibold text-lg">{memory.data.caption}</p>}
                <p className="text-sm opacity-70">
                    {new Date(memory.at).toLocaleDateString('pl-PL', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {age && <> · {age}</>}
                </p>
                {isAdmin && (
                    <button onClick={() => onRemove(memory)} className="flex items-center gap-1.5 text-sm text-rose-300 font-semibold pt-2">
                        <Trash2 size={15} /> Usuń wspomnienie
                    </button>
                )}
            </div>
        </div>
    );
}

export default function MemoriesScreen({ entries, activeChild, family, isAdmin, isDemo, onChanged }) {
    const memories = useMemo(() => entries.filter(e => e.type === 'memory'), [entries]);
    const [urls, setUrls] = useState({});
    const [pendingFile, setPendingFile] = useState(null);
    const [lightbox, setLightbox] = useState(null);

    const mversary = nextMonthiversary(activeChild?.birth_date, new Date(), 14);
    const flashback = useMemo(() => fromThisPeriod(memories), [memories]);

    useEffect(() => {
        const paths = memories.map(m => m.data?.photoPath).filter(Boolean);
        if (!paths.length) { setUrls({}); return; }
        let alive = true;
        getPhotoUrls(paths).then(map => { if (alive) setUrls(map); });
        return () => { alive = false; };
    }, [memories]);

    const groups = useMemo(() => {
        const g = [];
        memories.forEach(m => {
            const label = monthLabel(m.at);
            const grp = g.find(x => x.label === label);
            grp ? grp.items.push(m) : g.push({ label, items: [m] });
        });
        return g;
    }, [memories]);

    async function handleRemove(memory) {
        await removeMemory(memory);
        setLightbox(null);
        onChanged();
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="font-display text-2xl font-bold">Wspomnienia</h1>
                {!isDemo && activeChild && (
                    <label className="bg-bb-primary rounded-full px-4 py-2 font-semibold text-sm flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform">
                        <Camera size={16} aria-hidden="true" /> Dodaj chwilę
                        <input type="file" accept="image/*" className="hidden"
                            onChange={e => { const f = e.target.files?.[0]; if (f) setPendingFile(f); e.target.value = ''; }} />
                    </label>
                )}
            </div>

            {mversary && (
                <div className="bg-bb-accent2 rounded-bubble p-4 flex items-center gap-3">
                    <Cake size={22} className="shrink-0" aria-hidden="true" />
                    <p className="font-semibold text-sm">
                        {mversary.inDays === 0 ? 'Dziś' : `Za ${mversary.inDays} ${mversary.inDays === 1 ? 'dzień' : 'dni'}`}{' '}
                        {activeChild?.name} kończy{' '}
                        {mversary.isBirthday
                            ? `${mversary.years} ${mversary.years === 1 ? 'rok' : mversary.years < 5 ? 'lata' : 'lat'}`
                            : `${mversary.months} mies.`}{' '}
                        {mversary.inDays === 0 ? '🎉' : '– przygotuj aparat! 📸'}
                    </p>
                </div>
            )}

            {flashback.length > 0 && (
                <section className="space-y-2">
                    <h2 className="font-display font-semibold text-lg flex items-center gap-2"><Clock size={17} /> Z tego okresu</h2>
                    <div className="flex gap-2 overflow-x-auto pb-1">
                        {flashback.map(m => (
                            <button key={`${m.id}-${m.periodLabel}`} onClick={() => setLightbox(m)} className="shrink-0 relative">
                                {urls[m.data?.photoPath]
                                    ? <img src={urls[m.data.photoPath]} alt="" className="w-28 h-28 object-cover rounded-2xl" />
                                    : <div className="w-28 h-28 rounded-2xl bg-bb-soft" />}
                                <span className="absolute bottom-1 left-1 right-1 text-[10px] font-bold text-white bg-black/40 rounded-full px-2 py-0.5 text-center">
                                    {m.periodLabel}
                                </span>
                            </button>
                        ))}
                    </div>
                </section>
            )}

            {memories.length === 0 && (
                <div className="text-center py-14 text-bb-muted space-y-2">
                    <p className="text-4xl">📸</p>
                    <p className="font-semibold">Jeszcze tu pusto</p>
                    <p className="text-sm">Dodaj pierwsze zdjęcie – miesięcznice i „rok temu" pojawią się same.</p>
                </div>
            )}

            {groups.map(g => (
                <section key={g.label}>
                    <h2 className="font-display font-semibold text-lg mb-2 capitalize">{g.label}</h2>
                    <div className="grid grid-cols-3 gap-2">
                        {g.items.map(m => (
                            <button key={m.id} onClick={() => setLightbox(m)} className="relative aspect-square">
                                {urls[m.data?.photoPath]
                                    ? <img src={urls[m.data.photoPath]} alt={m.data?.caption || ''} className="w-full h-full object-cover rounded-2xl" />
                                    : <div className="w-full h-full rounded-2xl bg-bb-soft animate-pulse" />}
                                {m.data?.caption && (
                                    <span className="absolute bottom-1 left-1 right-1 text-[9px] text-white bg-black/40 rounded-full px-1.5 py-0.5 truncate">
                                        {m.data.caption}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </section>
            ))}

            {pendingFile && (
                <AddMemorySheet file={pendingFile} activeChild={activeChild} family={family}
                    onSaved={() => { setPendingFile(null); onChanged(); }}
                    onClose={() => setPendingFile(null)} />
            )}

            {lightbox && (
                <Lightbox memory={lightbox} url={urls[lightbox.data?.photoPath]}
                    birthDate={activeChild?.birth_date} isAdmin={isAdmin}
                    onRemove={handleRemove} onClose={() => setLightbox(null)} />
            )}
        </div>
    );
}
