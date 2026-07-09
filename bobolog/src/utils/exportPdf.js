// Eksport wpisów do PDF (jsPDF + autotable)

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { TYPE_LABELS, entryDetails } from './entryDetails.js';

function formatDate(iso) {
    const d = new Date(iso);
    return d.toLocaleDateString('pl-PL') + ' ' + d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
}

export function exportToPdf(entries, childName, dateFrom, dateTo) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    // Header
    doc.setFontSize(18);
    doc.setTextColor(30, 80, 60);
    doc.text('BoboLab — Dziennik rodzica', 14, 18);

    doc.setFontSize(10);
    doc.setTextColor(100);
    const name = childName || 'Dziecko';
    const range = dateFrom && dateTo
        ? ` · ${dateFrom} – ${dateTo}`
        : '';
    doc.text(`${name}${range}`, 14, 26);
    doc.text(`Wygenerowano: ${new Date().toLocaleDateString('pl-PL')}`, 14, 31);

    // Filter by date range
    let filtered = entries;
    if (dateFrom) filtered = filtered.filter(e => e.at >= dateFrom);
    if (dateTo)   filtered = filtered.filter(e => e.at <= dateTo + 'T23:59:59');

    const rows = filtered.map(e => [
        formatDate(e.at),
        TYPE_LABELS[e.type] ?? e.type,
        entryDetails(e),
    ]);

    autoTable(doc, {
        startY: 36,
        head: [['Data i godzina', 'Typ', 'Szczegóły']],
        body: rows,
        styles: { fontSize: 9, cellPadding: 2.5 },
        headStyles: { fillColor: [201, 235, 219], textColor: [26, 58, 42], fontStyle: 'bold' },
        alternateRowStyles: { fillColor: [240, 250, 245] },
        columnStyles: { 0: { cellWidth: 42 }, 1: { cellWidth: 28 } },
    });

    doc.save(`BoboLab_${name.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.pdf`);
}
