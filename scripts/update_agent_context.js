import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const AGENTS_FILE = path.join(ROOT, 'AGENTS.md');

const ignoredTopLevel = new Set(['.git', '.claude', 'node_modules', 'dist']);
const ignoredDirectories = new Set(['.git', '.claude', 'node_modules', 'dist', 'public']);

function cell(value) {
    return String(value ?? '—').replace(/[|\n\r]/g, ' ').trim() || '—';
}

function table(headers, rows) {
    const output = [
        `| ${headers.join(' | ')} |`,
        `| ${headers.map(() => '---').join(' | ')} |`
    ];

    for (const row of rows) {
        output.push(`| ${row.map(cell).join(' | ')} |`);
    }

    return output.join('\n');
}

function readJson(file) {
    try {
        return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch {
        return null;
    }
}

function walkHtml(dir, relativeDir) {
    if (!fs.existsSync(dir)) return [];

    const files = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const absolute = path.join(dir, entry.name);
        const relative = `${relativeDir}/${entry.name}`;

        if (entry.isDirectory()) {
            files.push(...walkHtml(absolute, relative));
        } else if (entry.name.endsWith('.html')) {
            files.push(relative.replace(/\\/g, '/'));
        }
    }
    return files.sort();
}

function findPackages(dir, relativeDir = '.') {
    if (!fs.existsSync(dir)) return [];

    const packages = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const absolute = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            if (!ignoredDirectories.has(entry.name)) {
                const childRelative = relativeDir === '.'
                    ? entry.name
                    : `${relativeDir}/${entry.name}`;
                packages.push(...findPackages(absolute, childRelative));
            }
        } else if (entry.name === 'package.json') {
            packages.push({
                relative: relativeDir,
                file: absolute
            });
        }
    }
    return packages;
}

function packageKind(pkg) {
    const dependencies = {
        ...(pkg.dependencies ?? {}),
        ...(pkg.devDependencies ?? {})
    };

    if (dependencies.react) return 'React';
    if (dependencies.vue) return 'Vue';
    if (dependencies.svelte) return 'Svelte';
    if (dependencies.vite) return 'Vite / JS';
    return 'Node';
}

const { SITE_DATA } = await import(
    pathToFileURL(path.join(ROOT, 'src/data/db.js')).href
);

const topLevelDirs = fs.readdirSync(ROOT, { withFileTypes: true })
    .filter(entry => entry.isDirectory() && !entry.name.startsWith('.') && !ignoredTopLevel.has(entry.name))
    .map(entry => entry.name)
    .sort();

const packageLocations = findPackages(ROOT).sort((a, b) => a.relative.localeCompare(b.relative));

const packages = packageLocations.map(entry => {
    const pkg = readJson(entry.file) ?? {};
    return {
        path: entry.relative,
        name: pkg.name ?? entry.relative,
        kind: packageKind(pkg),
        build: entry.relative === '.' ? 'npm run build' : `npm run build --prefix ${entry.relative}`
    };
});

const siteProjects = (SITE_DATA?.projects ?? []).map(project => [
    project.title ?? project.id,
    project.id,
    project.url ?? '—',
    project.active ? 'active' : 'inactive'
]);

const htmlEntries = walkHtml(path.join(ROOT, 'apps'), 'apps');
const areaRows = topLevelDirs.map(name => [
    name,
    name === 'apps' ? 'główne wejścia HTML' : name === 'src' ? 'kod głównej strony' : 'obszar projektu / narzędzia'
]);

const section = `<!-- BEGIN AUTO:PROJECT-INVENTORY -->
## Automatycznie wykryty inwentarz projektu

Ta sekcja jest generowana przez \`npm run agent:update\`. Nowe wpisy pojawią się po dodaniu katalogu, pakietu \`package.json\`, strony w \`apps/\` albo projektu w \`src/data/db.js\`.

### Projekty zarejestrowane w DraftLab

${table(['Nazwa', 'ID', 'URL', 'Status'], siteProjects)}

### Pakiety Node

${table(['Ścieżka', 'Pakiet', 'Technologia', 'Build'], packages.map(pkg => [pkg.path, pkg.name, pkg.kind, pkg.build]))}

### Strony HTML głównego MPA

${htmlEntries.length ? htmlEntries.map(entry => `- \`${entry}\``).join('\n') : '- brak'}

### Katalogi główne

${table(['Katalog', 'Rola'], areaRows)}
<!-- END AUTO:PROJECT-INVENTORY -->`;

const source = fs.readFileSync(AGENTS_FILE, 'utf8');
const marker = /<!-- BEGIN AUTO:PROJECT-INVENTORY -->[\s\S]*?<!-- END AUTO:PROJECT-INVENTORY -->/;
const updated = marker.test(source)
    ? source.replace(marker, section)
    : source.replace('\n## Zasady bezpieczeństwa pracy', `\n${section}\n\n## Zasady bezpieczeństwa pracy`);

if (updated !== source) {
    fs.writeFileSync(AGENTS_FILE, updated);
    console.log('✅ AGENTS.md: inwentarz projektu zaktualizowany.');
} else {
    console.log('✅ AGENTS.md: inwentarz projektu jest aktualny.');
}
