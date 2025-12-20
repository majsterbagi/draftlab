import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const OUTPUT_FILE_SYS = path.join(process.cwd(), 'src/data/git_log_data.js');
const OUTPUT_FILE_APPS = path.join(process.cwd(), 'src/data/auto_changelogs.js');

// Config
const MAX_LOGS = 100;
const DELIMITER = '---PF---'; // Field separator
const ENTRY_SEPARATOR = '===EE==='; // Entry separator

// Project Mapping (Commit Scope -> DB ID)
const SCOPE_TO_PROJECT = {
    'ATMOSPHERE': 'atmosphere',
    'SUNTRACK': 'suntrack',
    'CARGO': 'draftcargo',
    'DRAFTCARGO': 'draftcargo',
    'NUCLEUS': 'nucleus'
};

// git log format: hash|date|subject|body
const GIT_COMMAND = `git log -n ${MAX_LOGS} --date=format:"%Y-%m-%d %H:%M" --pretty=format:"%h${DELIMITER}%ad${DELIMITER}%s${DELIMITER}%b${ENTRY_SEPARATOR}"`;

console.log('🔄 Generowanie dzienników zmian z Git...');

exec(GIT_COMMAND, (error, stdout, stderr) => {
    if (error) {
        console.error(`❌ Błąd git log: ${error.message}`);
        return;
    }

    const rawEntries = stdout.split(ENTRY_SEPARATOR).filter(e => e.trim() !== '');

    // 1. Parse all logs
    const allLogs = rawEntries.map(entry => {
        const parts = entry.split(DELIMITER);
        if (parts.length < 3) return null;

        const hash = parts[0].trim();
        const date = parts[1].trim();
        const subject = parts[2].trim();
        const bodyRaw = parts.slice(3).join(DELIMITER).trim();

        let type = 'UPDATE';
        let component = 'SYS';
        let desc = subject;

        const conventionalRegex = /^([a-zA-Z]+)(?:\(([^)]+)\))?:\s*(.+)$/;
        const match = subject.match(conventionalRegex);

        if (match) {
            type = match[1].toUpperCase();
            if (match[2]) component = match[2].toUpperCase();
            desc = match[3];
        } else {
            const upper = subject.toUpperCase();
            if (upper.includes('FIX')) type = 'FIX';
            if (upper.includes('FEAT')) type = 'FEAT';
            if (upper.includes('STYLE')) type = 'STYLE';
        }

        const typeMap = { 'FEATURE': 'FEAT', 'BUGFIX': 'FIX', 'HOTFIX': 'FIX', 'REFACTOR': 'STYLE', 'CHORE': 'SYS', 'DOCS': 'DOCS' };
        if (typeMap[type]) type = typeMap[type];

        return {
            hash,
            date,
            type,
            component,
            desc: desc.charAt(0).toUpperCase() + desc.slice(1),
            details: bodyRaw.length > 0 ? bodyRaw : null
        };
    }).filter(l => l !== null);

    // 2. Generate System Log Data (Top 50)
    const systemLogs = allLogs.slice(0, 50);
    const sysFileContent = `export const GIT_LOG_DATA = ${JSON.stringify(systemLogs, null, 4)};`;

    fs.writeFileSync(OUTPUT_FILE_SYS, sysFileContent);
    console.log(`✅ System Log: ${systemLogs.length} wpisów.`);

    // 3. Generate App Changelogs
    const appChangelogs = {};

    allLogs.forEach(log => {
        const projectId = SCOPE_TO_PROJECT[log.component];
        if (projectId) {
            if (!appChangelogs[projectId]) appChangelogs[projectId] = [];

            appChangelogs[projectId].push({
                date: log.date,
                version: "GIT",
                type: log.type,
                desc: log.desc,
                details: log.details
            });
        }
    });

    const appFileContent = `export const PROJECT_CHANGES = ${JSON.stringify(appChangelogs, null, 4)};`;
    fs.writeFileSync(OUTPUT_FILE_APPS, appFileContent);
    console.log(`✅ Auto Changelogs: ${Object.keys(appChangelogs).length} projektów zsynchronizowanych.`);
});
