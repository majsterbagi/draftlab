import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUTPUT_FILE_SYS = path.join(ROOT, 'src/data/git_log_data.js');
const OUTPUT_FILE_APPS = path.join(ROOT, 'src/data/auto_changelogs.js');

// Keep enough history for existing and future projects. The system view still shows only the latest 50.
const MAX_LOGS = 500;
const DELIMITER = '---PF---';
const RECORD_SEPARATOR = '\x1e';
const HEADER_SEPARATOR = '\x1f';

// Commit scopes remain supported for older commits, but file paths are now the source of truth.
const SCOPE_TO_PROJECT = {
    ATMOSPHERE: 'atmosphere',
    SUNTRACK: 'suntrack',
    CARGO: 'draftcargo',
    DRAFTCARGO: 'draftcargo',
    NUCLEUS: 'nucleus',
    GLYPHREACTOR: 'glyph-reactor'
};

// A single commit may touch several applications. It is then added to every matching changelog.
const PATH_PROJECT_RULES = [
    { id: 'bobolog', test: file => /^(bobolog\/|public\/bobolog\/|public\/bobolog-api\/)/i.test(file) },
    { id: 'neon-quiz', test: file => /^(neon-quiz-86\/|public\/neonquiz\/)/i.test(file) },
    { id: 'pixel-kart', test: file => /^(pixel-kart-gp\/|public\/pixelkart\/)/i.test(file) },
    { id: 'gamerlab', test: file => /^(gamerlab\/|public\/gamerlab\/)/i.test(file) },
    { id: 'labyrinth-qr', test: file => /(?:^|\/)(?:LabyrinthQR|labyrinth_qr|qr-code-styling)/i.test(file) },
    { id: 'draftcargo', test: file => /(?:^|\/)(?:DraftCargo|CargoController)|(?:^|\/)(?:upload|download|stats)\.php$/i.test(file) },
    { id: 'atmosphere', test: file => /(?:^|\/)(?:Atmosphere|atmosphere(?:_data)?\.json|atmosphere\.php)/i.test(file) },
    { id: 'suntrack', test: file => /(?:^|\/)(?:SunTrack|suntrack)/i.test(file) },
    { id: 'retrovision', test: file => /(?:^|\/)(?:RetroVision|retrovision)/i.test(file) },
    { id: 'draftcalc', test: file => /(?:^|\/)(?:DraftCalc|draftcalc)/i.test(file) },
    { id: 'fluxboard', test: file => /(?:^|\/)(?:FluxBoard|fluxboard)/i.test(file) }
];

const CORE_DIRS = new Set([
    'src', 'apps', 'api', 'public', 'scripts', 'dist', 'node_modules', '.git', '.claude'
]);
const NON_PROJECT_APP_ENTRIES = new Set(['changelog', 'system-log', 'view']);

function normalizeProjectId(value) {
    return value
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');
}

function inferProjectFromPath(file) {
    for (const rule of PATH_PROJECT_RULES) {
        if (rule.test(file)) return rule.id;
    }

    const parts = file.split('/');
    if (parts[0] === 'apps' && parts[1] === 'prototypes' && parts[2]) {
        return normalizeProjectId(parts[2]);
    }

    if (parts[0] === 'apps' && parts[1]) {
        const entry = parts[1].replace(/\.(html|js)$/i, '');
        if (!NON_PROJECT_APP_ENTRIES.has(entry.toLowerCase())) {
            return normalizeProjectId(entry);
        }
    }

    if (parts[0] === 'src' && parts[1] === 'apps' && parts[2]) {
        return normalizeProjectId(parts[2]);
    }

    // New top-level projects are automatically recognized by their directory name.
    const rootDir = file.split('/')[0];
    if (file.includes('/') && rootDir && !CORE_DIRS.has(rootDir) && !rootDir.startsWith('.')) {
        return normalizeProjectId(rootDir);
    }

    return null;
}

function parseType(subject) {
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

    const typeMap = {
        FEATURE: 'FEAT',
        BUGFIX: 'FIX',
        HOTFIX: 'FIX',
        REFACTOR: 'STYLE',
        CHORE: 'SYS',
        DOCS: 'DOCS'
    };

    return {
        type: typeMap[type] ?? type,
        component,
        desc: desc.charAt(0).toUpperCase() + desc.slice(1)
    };
}

console.log('🔄 Generowanie dzienników zmian z Git...');

try {
    const stdout = execFileSync('git', [
        'log',
        '-n', String(MAX_LOGS),
        '--date=format:%Y-%m-%d %H:%M',
        `--pretty=format:%x1e%h${DELIMITER}%ad${DELIMITER}%s${DELIMITER}%b%x1f`,
        '--name-only'
    ], { cwd: ROOT, encoding: 'utf8' });

    const commits = stdout
        .split(RECORD_SEPARATOR)
        .filter(record => record.trim() !== '')
        .map(record => {
            const [header, rawFiles = ''] = record.split(HEADER_SEPARATOR);
            const parts = header.split(DELIMITER);
            if (parts.length < 3) return null;

            const files = rawFiles
                .split(/\r?\n/)
                .map(file => file.trim())
                .filter(Boolean);
            const parsed = parseType(parts[2].trim());
            const bodyRaw = parts.slice(3).join(DELIMITER).trim();
            const projects = new Set(
                files.map(inferProjectFromPath).filter(Boolean)
            );

            const scopedProject = SCOPE_TO_PROJECT[parsed.component];
            if (scopedProject) projects.add(scopedProject);

            const projectIds = [...projects].sort();
            const component = projectIds[0]?.toUpperCase() ?? parsed.component;

            return {
                hash: parts[0].trim(),
                date: parts[1].trim(),
                type: parsed.type,
                component,
                projects: projectIds,
                desc: parsed.desc,
                details: bodyRaw.length > 0
                    ? bodyRaw.replace(/inspirowany Lumy|inspirowana Lumy|Lumy/gi, '').trim()
                    : null
            };
        })
        .filter(Boolean);

    const systemLogs = commits.slice(0, 50);
    fs.writeFileSync(
        OUTPUT_FILE_SYS,
        `export const GIT_LOG_DATA = ${JSON.stringify(systemLogs, null, 4)};\n`
    );
    console.log(`✅ System Log: ${systemLogs.length} wpisów.`);

    const appChangelogs = {};
    for (const log of commits) {
        for (const projectId of log.projects) {
            appChangelogs[projectId] ??= [];
            appChangelogs[projectId].push({
                date: log.date,
                version: `#${log.hash}`,
                type: log.type,
                desc: log.desc,
                details: log.details
            });
        }
    }

    fs.writeFileSync(
        OUTPUT_FILE_APPS,
        `export const PROJECT_CHANGES = ${JSON.stringify(appChangelogs, null, 4)};\n`
    );
    console.log(`✅ Auto Changelogs: ${Object.keys(appChangelogs).length} projektów zsynchronizowanych.`);
} catch (error) {
    console.error(`❌ Błąd git log: ${error.message}`);
    process.exitCode = 1;
}
