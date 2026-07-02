// src/components/NeuralTerminal.js
// DRAFTLAB CORE — interaktywny terminal z siecią neuronową (canvas).
// Wow-efekt + praktyczna nawigacja: help, apps, open <app>, stats, matrix, legacy...

import { SITE_DATA } from '../data/db.js';
import { GIT_LOG_DATA } from '../data/git_log_data.js';
import { i18n } from '../utils/i18n.js';

const REDUCED_MOTION = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

class NeuralTerminal extends HTMLElement {

    connectedCallback() {
        this.history = [];
        this.historyIdx = -1;
        this.mode = 'neural'; // 'neural' | 'matrix'
        this.booted = false;

        this.render();
        this.initCanvas();
        this.boot();

        this.langListener = () => {
            const hint = this.querySelector('#term-hint');
            if (hint) hint.textContent = i18n.t('term.hint');
        };
        i18n.subscribe(this.langListener);
    }

    disconnectedCallback() {
        if (this.langListener) i18n.unsubscribe(this.langListener);
        if (this.raf) cancelAnimationFrame(this.raf);
        if (this.io) this.io.disconnect();
        if (this.resizeObs) this.resizeObs.disconnect();
    }

    render() {
        this.innerHTML = `
            <div class="relative rounded-card overflow-hidden border border-white/10 bg-black/40" id="term-section">
                <canvas id="neural-canvas" class="absolute inset-0 w-full h-full" aria-hidden="true"></canvas>

                <div class="relative z-10 p-4 md:p-10 flex justify-center">
                    <div class="glass rounded-card shadow-card w-full max-w-2xl overflow-hidden">
                        <!-- Title bar -->
                        <div class="flex items-center gap-2 px-4 py-2.5 border-b border-white/10 bg-black/40">
                            <span class="w-3 h-3 rounded-full bg-red-500/70"></span>
                            <span class="w-3 h-3 rounded-full bg-yellow-500/70"></span>
                            <span class="w-3 h-3 rounded-full bg-tech-green/70"></span>
                            <span class="ml-3 text-[11px] text-tech-dim tracking-widest select-none">draftlab://core — v2.0</span>
                            <span class="ml-auto flex items-center gap-1.5 text-[10px] text-tech-green/70">
                                <span class="w-1.5 h-1.5 rounded-full bg-tech-green animate-pulse"></span>LIVE
                            </span>
                        </div>

                        <!-- Output -->
                        <div id="term-out" class="px-4 py-3 h-56 md:h-64 overflow-y-auto text-[12px] md:text-[13px] leading-relaxed font-mono text-white/85 whitespace-pre-wrap break-words" aria-live="polite"></div>

                        <!-- Input -->
                        <div class="flex items-center gap-2 px-4 py-3 border-t border-white/10 bg-black/30 cursor-text" id="term-input-row">
                            <span class="text-tech-green text-[13px] select-none shrink-0">guest@draftlab:~$</span>
                            <input id="term-input" type="text" autocomplete="off" autocapitalize="off" spellcheck="false"
                                class="bg-transparent flex-grow text-[13px] text-white outline-none border-none focus:ring-0 min-w-0"
                                aria-label="Terminal input" />
                        </div>

                        <!-- Quick commands -->
                        <div class="flex flex-wrap gap-2 px-4 py-3 border-t border-white/5 bg-black/20">
                            ${['help', 'apps', 'stats', 'matrix', 'legacy'].map(c =>
                                `<button data-cmd="${c}" class="term-chip px-2.5 py-1 rounded-md border border-tech-green/25 bg-tech-green/5 text-tech-green text-[10px] tracking-wider hover:bg-tech-green hover:text-black transition-colors">${c}</button>`
                            ).join('')}
                            <span id="term-hint" class="ml-auto self-center text-[10px] text-tech-dim/60 hidden sm:inline">${i18n.t('term.hint')}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        this.out = this.querySelector('#term-out');
        this.input = this.querySelector('#term-input');

        this.querySelector('#term-input-row').addEventListener('click', () => this.input.focus());

        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const cmd = this.input.value.trim();
                this.input.value = '';
                if (cmd) {
                    this.history.push(cmd);
                    this.historyIdx = this.history.length;
                    this.echo(`<span class="text-tech-green">guest@draftlab:~$</span> ${this.escape(cmd)}`);
                    this.exec(cmd);
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (this.historyIdx > 0) {
                    this.historyIdx--;
                    this.input.value = this.history[this.historyIdx];
                }
            } else if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (this.historyIdx < this.history.length - 1) {
                    this.historyIdx++;
                    this.input.value = this.history[this.historyIdx];
                } else {
                    this.historyIdx = this.history.length;
                    this.input.value = '';
                }
            }
        });

        this.querySelectorAll('.term-chip').forEach(btn => {
            btn.addEventListener('click', () => {
                const cmd = btn.dataset.cmd;
                this.echo(`<span class="text-tech-green">guest@draftlab:~$</span> ${cmd}`);
                this.exec(cmd);
                this.input.focus();
            });
        });
    }

    escape(s) {
        return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    echo(html, cls = '') {
        const line = document.createElement('div');
        if (cls) line.className = cls;
        line.innerHTML = html;
        this.out.appendChild(line);
        this.out.scrollTop = this.out.scrollHeight;
    }

    async typeLine(text, cls = 'text-tech-dim', speed = 14) {
        const line = document.createElement('div');
        line.className = cls;
        this.out.appendChild(line);
        if (REDUCED_MOTION) {
            line.textContent = text;
        } else {
            for (let i = 0; i <= text.length; i++) {
                line.textContent = text.slice(0, i);
                this.out.scrollTop = this.out.scrollHeight;
                await new Promise(r => setTimeout(r, speed));
            }
        }
        this.out.scrollTop = this.out.scrollHeight;
    }

    async boot() {
        if (this.booted) return;
        this.booted = true;
        await this.typeLine('DRAFTLAB CORE v2.0 — neural interface', 'text-tech-green font-bold');
        await this.typeLine(i18n.t('term.boot1'), 'text-tech-dim', 6);
        await this.typeLine(i18n.t('term.boot2'), 'text-tech-dim', 6);
        this.echo(`<span class="text-white/70">${i18n.t('term.boot3')}</span>`);
        this.echo('&nbsp;');
    }

    getApps() {
        return SITE_DATA.projects.filter(p => p.active && p.url && p.url !== '#');
    }

    exec(raw) {
        const [cmd, ...args] = raw.toLowerCase().split(/\s+/);
        const arg = args.join(' ');

        switch (cmd) {
            case 'help':
                this.echo([
                    `<span class="text-tech-green">help</span>      — ${i18n.t('term.cmd.help')}`,
                    `<span class="text-tech-green">apps</span>      — ${i18n.t('term.cmd.apps')}`,
                    `<span class="text-tech-green">open</span> &lt;app&gt; — ${i18n.t('term.cmd.open')}`,
                    `<span class="text-tech-green">stats</span>     — ${i18n.t('term.cmd.stats')}`,
                    `<span class="text-tech-green">whoami</span>    — ${i18n.t('term.cmd.whoami')}`,
                    `<span class="text-tech-green">legacy</span>    — ${i18n.t('term.cmd.legacy')}`,
                    `<span class="text-tech-green">lang</span> pl|en — ${i18n.t('term.cmd.lang')}`,
                    `<span class="text-tech-green">matrix</span>    — ${i18n.t('term.cmd.matrix')}`,
                    `<span class="text-tech-green">clear</span>     — ${i18n.t('term.cmd.clear')}`,
                ].join('<br>'));
                break;

            case 'apps': {
                const lang = i18n.lang;
                this.echo(this.getApps().map(p => {
                    const desc = lang === 'pl' ? p.desc : (p.desc_en || p.desc);
                    return `<a href="${p.url}" class="text-tech-green underline underline-offset-2 hover:text-white">${p.title}</a> <span class="text-tech-dim">— ${desc}</span>`;
                }).join('<br>'));
                break;
            }

            case 'open': {
                if (!arg) { this.echo(`<span class="text-yellow-400">${i18n.t('term.open_usage')}</span>`); break; }
                const app = this.getApps().find(p =>
                    p.id.includes(arg) || p.title.toLowerCase().includes(arg)
                );
                if (app) {
                    this.echo(`<span class="text-tech-dim">${i18n.t('term.opening')} ${app.title}...</span>`);
                    setTimeout(() => { window.location.href = app.url; }, 500);
                } else {
                    this.echo(`<span class="text-red-400">${i18n.t('term.not_found')}: ${this.escape(arg)}</span>`);
                }
                break;
            }

            case 'stats': {
                const last = GIT_LOG_DATA[0];
                this.echo([
                    `${i18n.t('hero.stat.apps')}: <span class="text-white">${this.getApps().length}</span>`,
                    `${i18n.t('hero.stat.commits')}: <span class="text-white">${GIT_LOG_DATA.length}</span>`,
                    `${i18n.t('term.last_update')}: <span class="text-white">${last ? last.date : '—'}</span>`,
                    `${i18n.t('term.stack')}: <span class="text-white">Vite · Tailwind · Web Components</span>`,
                ].join('<br>'));
                break;
            }

            case 'whoami':
            case 'about':
                this.echo(`<span class="text-white">Kamil</span> <span class="text-tech-dim">— ${i18n.t('term.whoami_desc')}</span> <a href="about.html" class="text-tech-green underline underline-offset-2">about.html</a>`);
                break;

            case 'contact':
                this.echo(`<a href="mailto:pasnik.k@gmail.com" class="text-tech-green underline underline-offset-2">pasnik.k@gmail.com</a>`);
                break;

            case 'legacy':
                this.echo(`<span class="text-tech-dim">${i18n.t('term.time_travel')}</span>`);
                setTimeout(() => { window.location.href = 'legacy/index.html'; }, 600);
                break;

            case 'lang':
                if (arg === 'pl' || arg === 'en') {
                    i18n.setLang(arg);
                    this.echo(`<span class="text-tech-green">OK — ${arg.toUpperCase()}</span>`);
                } else {
                    this.echo(`<span class="text-yellow-400">lang pl | lang en</span>`);
                }
                break;

            case 'matrix':
                this.mode = this.mode === 'matrix' ? 'neural' : 'matrix';
                this.echo(`<span class="text-tech-green">${this.mode === 'matrix' ? i18n.t('term.matrix_on') : i18n.t('term.matrix_off')}</span>`);
                break;

            case 'clear':
                this.out.innerHTML = '';
                break;

            case 'sudo':
                this.echo(`<span class="text-red-400">${i18n.t('term.sudo')}</span>`);
                break;

            case 'ls':
                this.echo(this.getApps().map(p => p.id).join('  '));
                break;

            default:
                this.echo(`<span class="text-red-400">${i18n.t('term.unknown')}: ${this.escape(cmd)}</span> <span class="text-tech-dim">(${i18n.t('term.try_help')})</span>`);
        }
    }

    // ---------- CANVAS: neural network / matrix rain ----------

    initCanvas() {
        const canvas = this.querySelector('#neural-canvas');
        const ctx = canvas.getContext('2d');
        const section = this.querySelector('#term-section');

        let w = 0, h = 0, dpr = Math.min(window.devicePixelRatio || 1, 2);
        let particles = [];
        let drops = [];
        const mouse = { x: -9999, y: -9999 };
        const GLYPHS = 'アイウエオカキクケコサシスセソタチツテト0123456789';

        const resize = () => {
            const rect = section.getBoundingClientRect();
            w = rect.width; h = rect.height;
            canvas.width = w * dpr;
            canvas.height = h * dpr;
            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
            initParticles();
            initDrops();
        };

        const initParticles = () => {
            const count = Math.min(Math.floor((w * h) / 16000), 90);
            particles = Array.from({ length: count }, () => ({
                x: Math.random() * w,
                y: Math.random() * h,
                vx: (Math.random() - 0.5) * 0.35,
                vy: (Math.random() - 0.5) * 0.35,
                r: Math.random() * 1.6 + 0.6,
            }));
        };

        const initDrops = () => {
            const cols = Math.floor(w / 16);
            drops = Array.from({ length: cols }, () => Math.random() * -h);
        };

        section.addEventListener('pointermove', (e) => {
            const rect = section.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });
        section.addEventListener('pointerleave', () => { mouse.x = -9999; mouse.y = -9999; });

        const drawNeural = () => {
            ctx.clearRect(0, 0, w, h);
            const linkDist = 110;

            for (const p of particles) {
                // Motion + gentle mouse attraction
                const dxm = mouse.x - p.x, dym = mouse.y - p.y;
                const dm = Math.hypot(dxm, dym);
                if (dm < 160 && dm > 0.01) {
                    p.vx += (dxm / dm) * 0.012;
                    p.vy += (dym / dm) * 0.012;
                }
                p.vx = Math.max(-0.6, Math.min(0.6, p.vx));
                p.vy = Math.max(-0.6, Math.min(0.6, p.vy));
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;
            }

            // Links
            ctx.lineWidth = 0.6;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const a = particles[i], b = particles[j];
                    const d = Math.hypot(a.x - b.x, a.y - b.y);
                    if (d < linkDist) {
                        ctx.strokeStyle = `rgba(0, 255, 157, ${(1 - d / linkDist) * 0.22})`;
                        ctx.beginPath();
                        ctx.moveTo(a.x, a.y);
                        ctx.lineTo(b.x, b.y);
                        ctx.stroke();
                    }
                }
                // Link to mouse
                const p = particles[i];
                const dm = Math.hypot(p.x - mouse.x, p.y - mouse.y);
                if (dm < 150) {
                    ctx.strokeStyle = `rgba(34, 211, 238, ${(1 - dm / 150) * 0.35})`;
                    ctx.beginPath();
                    ctx.moveTo(p.x, p.y);
                    ctx.lineTo(mouse.x, mouse.y);
                    ctx.stroke();
                }
            }

            // Nodes
            for (const p of particles) {
                ctx.fillStyle = 'rgba(0, 255, 157, 0.55)';
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx.fill();
            }
        };

        const drawMatrix = () => {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
            ctx.fillRect(0, 0, w, h);
            ctx.font = '13px "JetBrains Mono", monospace';
            for (let i = 0; i < drops.length; i++) {
                const char = GLYPHS[Math.floor(Math.random() * GLYPHS.length)];
                ctx.fillStyle = Math.random() > 0.975 ? '#ffffff' : '#00ff9d';
                ctx.fillText(char, i * 16, drops[i]);
                drops[i] += 14;
                if (drops[i] > h && Math.random() > 0.975) drops[i] = 0;
            }
        };

        let visible = true;
        this.io = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
        }, { threshold: 0.05 });
        this.io.observe(section);

        const loop = () => {
            if (visible) {
                if (this.mode === 'matrix') drawMatrix();
                else drawNeural();
            }
            this.raf = requestAnimationFrame(loop);
        };

        resize();
        this.resizeObs = new ResizeObserver(resize);
        this.resizeObs.observe(section);

        if (REDUCED_MOTION) {
            drawNeural(); // one static frame
        } else {
            loop();
        }
    }
}

customElements.define('dl-terminal', NeuralTerminal);
