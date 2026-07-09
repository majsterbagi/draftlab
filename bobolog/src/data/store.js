// Warstwa danych BoboLog — Supabase.
// UI korzysta wyłącznie z tych funkcji; nigdy nie importuje supabase.js bezpośrednio.

import { supabase } from './supabase.js';

// --- Ustawienia UI (localStorage, nie Supabase) ---

const SETTINGS_KEY = 'bobolog.settings';

function readLS(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
}

export function getSettings() {
    return readLS(SETTINGS_KEY, { mode: 'day', childName: 'Bobo' });
}

export function saveSettings(patch) {
    const next = { ...getSettings(), ...patch };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
    return next;
}

// --- Kolejka offline ---
// Wpisy dodane bez internetu lądują w localStorage i są wysyłane po powrocie online
// (strategia: ostatni zapis wygrywa — wpisy są append-only, konflikty praktycznie nie występują).

const PENDING_KEY = 'bobolog.pendingEntries';
const CACHE_KEY = childId => `bobolog.cache.entries.${childId}`;

function readPending() { return readLS(PENDING_KEY, []); }
function writePending(list) { localStorage.setItem(PENDING_KEY, JSON.stringify(list)); }

export function pendingCount(childId) {
    return readPending().filter(p => !childId || p.child_id === childId).length;
}

// Wyślij zaległe wpisy; zwraca liczbę wysłanych.
export async function flushPendingEntries() {
    const pending = readPending();
    if (!pending.length) return 0;
    let sent = 0;
    const remaining = [];
    for (const p of pending) {
        const { id, ...row } = p;
        const { error } = await supabase.from('entries').insert(row);
        if (error) { remaining.push(p); } else { sent++; }
    }
    writePending(remaining);
    return sent;
}

// --- Wpisy dziennika ---

export async function listEntries(childId) {
    const PAGE = 1000;
    let all = [], from = 0, failed = false;
    while (true) {
        let res;
        try {
            res = await supabase
                .from('entries')
                .select('*')
                .eq('child_id', childId)
                .order('at', { ascending: false })
                .range(from, from + PAGE - 1);
        } catch { res = { data: null, error: { message: 'offline' } }; }
        const { data, error } = res;
        if (error) { console.error('listEntries', error); failed = from === 0; break; }
        if (data?.length) all = all.concat(data);
        if (!data?.length || data.length < PAGE) break;
        from += PAGE;
    }

    if (failed) {
        // offline → ostatnia znana lista z cache
        all = readLS(CACHE_KEY(childId), []);
    } else {
        // cache na wypadek utraty połączenia (najnowsze 500 wpisów)
        try { localStorage.setItem(CACHE_KEY(childId), JSON.stringify(all.slice(0, 500))); } catch { /* quota — trudno */ }
    }

    // domieszaj zaległe wpisy z kolejki offline
    const pending = readPending().filter(p => p.child_id === childId);
    if (pending.length) {
        all = [...pending, ...all].sort((a, b) => b.at.localeCompare(a.at));
    }
    return all;
}

export async function addEntry(childId, familyId, type, data = {}) {
    let userId = null;
    try { userId = (await supabase.auth.getUser()).data.user?.id ?? null; } catch { /* offline */ }
    const entry = {
        child_id: childId,
        family_id: familyId,
        type,
        data: { ...data },
        at: data.at || new Date().toISOString(),
        created_by: userId,
    };
    // usuń 'at' z pola data — przechowujemy je na poziomie rekordu
    delete entry.data.at;

    let res;
    try {
        res = await supabase.from('entries').insert(entry).select().single();
    } catch { res = { data: null, error: { message: 'offline' } }; }

    if (res.error) {
        // brak sieci → do kolejki (id tymczasowe, zniknie po flushu)
        console.warn('addEntry → kolejka offline', res.error.message);
        const queued = { id: `pending-${crypto.randomUUID()}`, ...entry };
        writePending([...readPending(), queued]);
        return queued;
    }
    return res.data;
}

export async function removeEntry(id) {
    // wpis z kolejki offline — usuń lokalnie
    if (String(id).startsWith('pending-')) {
        writePending(readPending().filter(p => p.id !== id));
        return;
    }
    const { error } = await supabase.from('entries').delete().eq('id', id);
    if (error) console.error('removeEntry', error);
}

export async function lastEntry(childId, type) {
    const { data } = await supabase
        .from('entries')
        .select('*')
        .eq('child_id', childId)
        .eq('type', type)
        .order('at', { ascending: false })
        .limit(1)
        .single();
    return data || null;
}

// Hurtowy import wpisów (np. z CSV innej aplikacji) — partie po 500
export async function bulkImportEntries(childId, familyId, items) {
    // Pobierz istniejące wpisy (at + type) żeby wykryć duplikaty
    const PAGE = 1000;
    const existingKeys = new Set();
    let from = 0;
    while (true) {
        const { data, error } = await supabase
            .from('entries')
            .select('type,at')
            .eq('child_id', childId)
            .range(from, from + PAGE - 1);
        if (error) return { inserted: 0, skippedDups: 0, error: error.message };
        if (data?.length) data.forEach(r => existingKeys.add(`${r.type}|${r.at}`));
        if (!data?.length || data.length < PAGE) break;
        from += PAGE;
    }

    const { data: { user } } = await supabase.auth.getUser();
    let skippedDups = 0;
    const rows = items
        .filter(i => {
            if (existingKeys.has(`${i.type}|${i.at}`)) { skippedDups++; return false; }
            return true;
        })
        .map(i => ({ child_id: childId, family_id: familyId, type: i.type, data: i.data, at: i.at, created_by: user.id }));

    let inserted = 0;
    for (let off = 0; off < rows.length; off += 500) {
        const chunk = rows.slice(off, off + 500);
        const { error } = await supabase.from('entries').insert(chunk);
        if (error) {
            console.error('bulkImportEntries', error);
            return { inserted, skippedDups, error: error.message };
        }
        inserted += chunk.length;
    }
    return { inserted, skippedDups, error: null };
}

// --- Wspomnienia (zdjęcia w Supabase Storage, bucket: baby-photos) ---

const PHOTO_BUCKET = 'baby-photos';

// Upload skompresowanego zdjęcia; zwraca ścieżkę w buckecie albo null.
export async function uploadMemoryPhoto(familyId, childId, blob) {
    const path = `${familyId}/${childId}/${crypto.randomUUID()}.jpg`;
    const { error } = await supabase.storage.from(PHOTO_BUCKET)
        .upload(path, blob, { contentType: 'image/jpeg' });
    if (error) { console.error('uploadMemoryPhoto', error); return null; }
    return path;
}

// Podpisane URL-e dla listy ścieżek (bucket prywatny). Zwraca mapę path → url.
export async function getPhotoUrls(paths) {
    if (!paths.length) return {};
    const { data, error } = await supabase.storage.from(PHOTO_BUCKET)
        .createSignedUrls(paths, 3600);
    if (error) { console.error('getPhotoUrls', error); return {}; }
    const map = {};
    data.forEach(d => { if (d.signedUrl) map[d.path] = d.signedUrl; });
    return map;
}

// Usuń wpis-wspomnienie razem ze zdjęciem ze Storage.
export async function removeMemory(entry) {
    if (entry.data?.photoPath) {
        const { error } = await supabase.storage.from(PHOTO_BUCKET).remove([entry.data.photoPath]);
        if (error) console.error('removeMemory storage', error);
    }
    await removeEntry(entry.id);
}

// --- Profil dziecka ---

export async function updateChild(childId, data) {
    const { error } = await supabase.from('children').update(data).eq('id', childId);
    if (error) { console.error('updateChild', error); return false; }
    return true;
}

// --- Szczepienia ---

export async function listVaccineRecords(childId) {
    const { data, error } = await supabase
        .from('vaccine_records')
        .select('*')
        .eq('child_id', childId)
        .order('scheduled_date', { ascending: true });
    if (error) { console.error('listVaccineRecords', error); return []; }
    return data;
}

export async function markVaccineDone(id, { doneDate, batchNumber, notes }) {
    const { error } = await supabase
        .from('vaccine_records')
        .update({ done_date: doneDate, batch_number: batchNumber || null, notes: notes || null })
        .eq('id', id);
    if (error) console.error('markVaccineDone', error);
}

export async function unmarkVaccineDone(id) {
    const { error } = await supabase
        .from('vaccine_records')
        .update({ done_date: null, batch_number: null })
        .eq('id', id);
    if (error) console.error('unmarkVaccineDone', error);
}

export async function addCustomVaccine(childId, familyId, { name, scheduledDate, notes }) {
    const { error } = await supabase.from('vaccine_records').insert({
        child_id: childId,
        family_id: familyId,
        vaccine_id: 'custom',
        custom_name: name,
        scheduled_date: scheduledDate,
        notes: notes || null,
    });
    if (error) console.error('addCustomVaccine', error);
}

// --- Kamienie milowe ---

export async function listMilestoneRecords(childId) {
    const { data, error } = await supabase
        .from('milestone_records')
        .select('*')
        .eq('child_id', childId);
    if (error) { console.error('listMilestoneRecords', error); return []; }
    return data;
}

export async function markMilestoneDone(childId, familyId, milestoneId, doneDate) {
    const { error } = await supabase.from('milestone_records').upsert({
        child_id: childId,
        family_id: familyId,
        milestone_id: milestoneId,
        done_date: doneDate,
    }, { onConflict: 'child_id,milestone_id' });
    if (error) console.error('markMilestoneDone', error);
}

export async function unmarkMilestoneDone(childId, milestoneId) {
    const { error } = await supabase
        .from('milestone_records')
        .delete()
        .eq('child_id', childId)
        .eq('milestone_id', milestoneId);
    if (error) console.error('unmarkMilestoneDone', error);
}

export async function generateVaccineSchedule(childId, familyId, birthDate) {
    const { PSO_VACCINES, addDays } = await import('./pso_vaccines.js');
    const records = PSO_VACCINES.map(v => ({
        child_id: childId,
        family_id: familyId,
        vaccine_id: v.id,
        scheduled_date: addDays(birthDate, v.offsetDays),
    }));
    const { error } = await supabase.from('vaccine_records').insert(records);
    if (error) console.error('generateVaccineSchedule', error);
}
