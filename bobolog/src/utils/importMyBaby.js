// Import CSV z aplikacji „Baby Tracker • My Baby" (Aleksei Neiman, iOS).
// Format (nagłówki PL): Data i godzina, Wydarzenie, Typ, Wartość,
// Wartość.Liczba, Początek, Koniec, Komentarze.
//
// Mapowanie na wpisy BoboLog:
//   Karmienie          → feed  { kind: piers-l/piers-p, durationMin }
//   Butelka            → feed  { kind: butelka, amountMl }
//   Sen                → sleep { start } (at = koniec)
//   Zmiana pieluchy    → diaper { kind: mokra/kupa/pelny-serwis }
//   Odciąganie pokarmu → pomijane (BoboLog nie ma tego typu)

// Prosty parser CSV z obsługą pól w cudzysłowach ("...", "" = escape)
function parseCsv(text) {
    const rows = [];
    let row = [], field = '', inQuotes = false;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (inQuotes) {
            if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
            else if (c === '"') inQuotes = false;
            else field += c;
        } else if (c === '"') {
            inQuotes = true;
        } else if (c === ',') {
            row.push(field); field = '';
        } else if (c === '\n' || c === '\r') {
            if (c === '\r' && text[i + 1] === '\n') i++;
            row.push(field); field = '';
            if (row.some(f => f !== '')) rows.push(row);
            row = [];
        } else {
            field += c;
        }
    }
    row.push(field);
    if (row.some(f => f !== '')) rows.push(row);
    return rows;
}

// "2026-04-23 04:33:00" (czas lokalny) → ISO
function toIso(s) {
    if (!s) return null;
    const d = new Date(s.trim().replace(' ', 'T'));
    return isNaN(d) ? null : d.toISOString();
}

// "1800, 1800" → 3600 (suma sekund z Wartość.Liczba)
function sumSeconds(s) {
    if (!s) return null;
    const total = s.split(',').reduce((acc, part) => acc + (Number(part.trim()) || 0), 0);
    return total > 0 ? total : null;
}

// "Lewa; Lewa" → 'piers-l'; "Obie" → strona z dopiskiem w notatce
function feedKind(typ) {
    const first = (typ || '').split(';')[0].trim().toLowerCase();
    if (first === 'lewa')  return { kind: 'piers-l', bothNote: null };
    if (first === 'prawa') return { kind: 'piers-p', bothNote: null };
    return { kind: 'piers-l', bothNote: 'obie piersi' };
}

const DIAPER_MAP = {
    'mokra':      'mokra',
    'brudna':     'kupa',
    'pomieszana': 'pelny-serwis',
    'czysta':     'mokra',   // BoboLog nie ma „czystej" — dopisek w notatce
};

export function parseMyBabyCsv(text) {
    const rows = parseCsv(text);
    if (rows.length < 2) return { entries: [], skipped: 0, errors: ['Plik jest pusty lub nie zawiera danych.'] };

    const header = rows[0].map(h => h.trim());
    if (header[0] !== 'Data i godzina' || header[1] !== 'Wydarzenie') {
        return { entries: [], skipped: 0, errors: ['Nieznany format — oczekiwano eksportu z aplikacji „Baby Tracker • My Baby" (nagłówki po polsku).'] };
    }

    const entries = [];
    let skipped = 0;
    const errors = [];

    for (const r of rows.slice(1)) {
        const [dateStr, event, typ, , countStr, startStr, endStr, comment] = r;
        const at = toIso(dateStr);
        if (!at) { skipped++; continue; }
        const note = (comment || '').trim();

        switch (event) {
            case 'Karmienie': {
                const { kind, bothNote } = feedKind(typ);
                const secs = sumSeconds(countStr);
                entries.push({
                    type: 'feed',
                    at: toIso(startStr) || at,
                    data: {
                        kind,
                        amountMl: null,
                        durationMin: secs ? Math.round(secs / 60) : null,
                        note: [bothNote, note].filter(Boolean).join('; ') || undefined,
                    },
                });
                break;
            }
            case 'Butelka': {
                const ml = Number((countStr || '').trim()) || null;
                const kindNote = typ === 'Mleko matki' ? 'mleko matki' : null;
                entries.push({
                    type: 'feed',
                    at,
                    data: {
                        kind: 'butelka',
                        amountMl: ml,
                        durationMin: null,
                        note: [kindNote, note].filter(Boolean).join('; ') || undefined,
                    },
                });
                break;
            }
            case 'Sen': {
                const start = toIso(startStr);
                const end = toIso(endStr);
                if (!start || !end) { skipped++; break; }
                entries.push({
                    type: 'sleep',
                    at: end,
                    data: { start, note: note || undefined },
                });
                break;
            }
            case 'Zmiana pieluchy': {
                const kind = DIAPER_MAP[(typ || '').trim().toLowerCase()];
                if (!kind) { skipped++; break; }
                const cleanNote = (typ || '').trim().toLowerCase() === 'czysta' ? 'czysta' : null;
                entries.push({
                    type: 'diaper',
                    at,
                    data: { kind, note: [cleanNote, note].filter(Boolean).join('; ') || undefined },
                });
                break;
            }
            default:
                skipped++;   // Odciąganie pokarmu i inne nieobsługiwane
        }
    }

    return { entries, skipped, errors };
}
