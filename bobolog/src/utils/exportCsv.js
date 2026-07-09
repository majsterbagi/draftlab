// Eksport wpisów do pliku CSV

import { TYPE_LABELS, entryDetails } from './entryDetails.js';

function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('pl-PL') + ' ' + d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

export function exportToCsv(entries, childName) {
    const header = ['Data i godzina', 'Typ', 'Szczegóły'];
    const rows = entries.map(e => [
        formatDate(e.at),
        TYPE_LABELS[e.type] ?? e.type,
        entryDetails(e),
    ]);

    const csv = [header, ...rows]
        .map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(','))
        .join('\r\n');

    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `BoboLab_${(childName || 'dziecko').toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
}
