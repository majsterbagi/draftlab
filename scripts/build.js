import { copyFileSync, cpSync, mkdirSync, readdirSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function run(command, args, cwd = ROOT) {
    const result = spawnSync(command, args, { cwd, stdio: 'inherit', shell: false });
    if (result.error) throw result.error;
    if (result.status !== 0) process.exit(result.status ?? 1);
}

function publish(projectDir, publicDir) {
    const source = resolve(ROOT, projectDir, 'dist');
    const destination = resolve(ROOT, 'public', publicDir);

    rmSync(destination, { recursive: true, force: true });
    cpSync(source, destination, { recursive: true });
}

function publishPhpApi() {
    const source = resolve(ROOT, 'api');
    const destination = resolve(ROOT, 'public', 'api');

    rmSync(destination, { recursive: true, force: true });
    mkdirSync(destination, { recursive: true });

    for (const file of readdirSync(source)) {
        if (file.endsWith('.php')) {
            copyFileSync(resolve(source, file), resolve(destination, file));
        }
    }
}

run(process.execPath, ['scripts/update_agent_context.js']);
run(process.execPath, ['scripts/generate_git_log.js']);
publishPhpApi();
run(npm, ['run', 'build'], resolve(ROOT, 'bobolog'));
publish('bobolog', 'bobolog');
run(npm, ['run', 'build'], resolve(ROOT, 'neon-quiz-86'));
publish('neon-quiz-86', 'neonquiz');
run(npm, ['run', 'build'], resolve(ROOT, 'pixel-kart-gp'));
publish('pixel-kart-gp', 'pixelkart');
run(npm, ['run', 'build'], resolve(ROOT, 'gamerlab'));
publish('gamerlab', 'gamerlab');
