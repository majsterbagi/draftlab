import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const OUTPUT_FILE = path.join(process.cwd(), 'src/data/git_log_data.js');

// Config
const MAX_LOGS = 50;
const GIT_COMMAND = `git log -n ${MAX_LOGS} --pretty=format:"%h|%as|%s"`; // hash|date|subject

console.log('🔄 Generowanie dziennika zmian z Git...');

exec(GIT_COMMAND, (error, stdout, stderr) => {
    if (error) {
        console.error(`❌ Błąd podczas wykonywania git log: ${error.message}`);
        return;
    }
    if (stderr) {
        console.warn(`⚠️ Git stderr: ${stderr}`);
    }

    const rawLines = stdout.split('\n').filter(line => line.trim() !== '');

    const logs = rawLines.map(line => {
        const [hash, date, subject] = line.split('|');

        // Parse Subject for Type and Component if available
        // Expected format: "TYPE(Component): desc" or "TYPE: desc" or just "desc"

        let type = 'UPDATE';
        let component = 'SYS';
        let desc = subject;
        let details = null; // Can be enhanced later to read body

        // Try to detect conventional commits
        const conventionalRegex = /^([a-zA-Z]+)(?:\(([^)]+)\))?:\s*(.+)$/; // feat(ui): message
        const match = subject.match(conventionalRegex);

        if (match) {
            type = match[1].toUpperCase();
            if (match[2]) component = match[2].toUpperCase();
            desc = match[3];
        } else {
            // Heuristics for simple messages
            const upperSubject = subject.toUpperCase();
            if (upperSubject.includes('FIX') || upperSubject.includes('NAPRAWA')) type = 'FIX';
            if (upperSubject.includes('FEAT') || upperSubject.includes('DODANIE')) type = 'FEAT';
            if (upperSubject.includes('STYLE') || upperSubject.includes('STYL')) type = 'STYLE';
            if (upperSubject.includes('DOCS')) type = 'DOCS';
        }

        // Normalize Types
        const typeMap = {
            'FEATURE': 'FEAT',
            'BUGFIX': 'FIX',
            'HOTFIX': 'FIX',
            'REFACTOR': 'STYLE',
            'CHORE': 'SYS'
        };
        if (typeMap[type]) type = typeMap[type];

        return {
            hash,
            date,
            type,
            component,
            desc: desc.charAt(0).toUpperCase() + desc.slice(1), // Capitalize first letter
            details // Optional placeholder
        };
    });

    const fileContent = `export const GIT_LOG_DATA = ${JSON.stringify(logs, null, 4)};`;

    fs.writeFile(OUTPUT_FILE, fileContent, (err) => {
        if (err) {
            console.error('❌ Błąd zapisu pliku:', err);
        } else {
            console.log(`✅ Pomyślnie wygenerowano src/data/git_log_data.js (${logs.length} wpisów)`);
        }
    });
});
