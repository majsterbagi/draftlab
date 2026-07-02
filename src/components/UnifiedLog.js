// src/components/UnifiedLog.js
// Kompaktowy dziennik zmian (v2) — slim pasek z ostatnią zmianą,
// rozwijany do listy 5 wpisów. Pełny rejestr: apps/system-log.html.

import { SITE_DATA } from '../data/db.js';
import { GIT_LOG_DATA } from '../data/git_log_data.js';
import { i18n } from '../utils/i18n.js';

class UnifiedLog extends HTMLElement {
    constructor() {
        super();
        this.expanded = false;
        this.combinedLogs = [];
    }

    connectedCallback() {
        this.prepareData();
        this.render();

        this.langListener = () => this.render();
        i18n.subscribe(this.langListener);
    }

    disconnectedCallback() {
        if (this.langListener) i18n.unsubscribe(this.langListener);
    }

    prepareData() {
        // 1. App Logs
        const appLogs = [];
        if (SITE_DATA && SITE_DATA.projects) {
            SITE_DATA.projects.forEach(project => {
                if (project.changes) {
                    project.changes.forEach(change => {
                        appLogs.push({
                            date: change.date,
                            type: change.type,
                            desc: change.desc,
                            component: project.title.toUpperCase(),
                        });
                    });
                }
            });
        }

        // 2. System Logs
        const sysLogs = GIT_LOG_DATA.map(log => ({
            date: log.date,
            type: log.type,
            desc: log.desc,
            component: (log.component || 'SYS').toUpperCase(),
            hash: log.hash,
        }));

        // 3. Combine, Deduplicate & Sort
        const combined = [...appLogs, ...sysLogs];
        const seen = new Set();
        const unique = combined.filter(log => {
            if (seen.has(log.desc)) return false;
            seen.add(log.desc);
            return true;
        });

        this.combinedLogs = unique.sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    typeColor(type) {
        if (['FEAT', 'FEATURE', 'INIT'].includes(type)) return 'text-tech-green bg-tech-green/10 border-tech-green/20';
        if (['MAJOR', 'CORE'].includes(type)) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20';
        if (['FIX', 'HOTFIX'].includes(type)) return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
        if (['STYLE', 'VISUAL', 'POLISH'].includes(type)) return 'text-purple-400 bg-purple-400/10 border-purple-400/20';
        if (type === 'REVERT') return 'text-red-400 bg-red-400/10 border-red-400/20';
        return 'text-tech-dim bg-tech-dim/10 border-tech-dim/20';
    }

    render() {
        const latest = this.combinedLogs[0];
        const rest = this.combinedLogs.slice(0, 5);

        const rows = rest.map(log => `
            <li class="flex items-baseline gap-3 py-2 border-b border-white/5 last:border-0 text-xs">
                <span class="text-tech-dim/60 shrink-0 w-20 tabular-nums">${(log.date || '').split(' ')[0]}</span>
                <span class="text-[9px] font-bold px-1.5 py-0.5 rounded border shrink-0 ${this.typeColor(log.type)}">${log.type}</span>
                <span class="text-white/50 shrink-0 hidden sm:inline text-[10px] tracking-wide">${log.component}</span>
                <span class="text-tech-dim truncate">${log.desc}</span>
            </li>
        `).join('');

        this.innerHTML = `
            <div class="rounded-xl border border-white/5 bg-white/[0.02] overflow-hidden text-xs">
                <!-- Slim bar -->
                <button id="log-toggle" class="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-white/[0.03] transition-colors text-left" aria-expanded="${this.expanded}">
                    <i data-lucide="git-commit-horizontal" class="w-3.5 h-3.5 text-tech-green/70 shrink-0"></i>
                    <span class="text-[10px] uppercase tracking-widest text-tech-dim shrink-0">${i18n.t('log.title')}</span>
                    ${latest ? `
                        <span class="hidden md:flex items-baseline gap-2 text-tech-dim/60 truncate min-w-0">
                            <span class="text-tech-dim/40">·</span>
                            <span class="tabular-nums shrink-0">${(latest.date || '').split(' ')[0]}</span>
                            <span class="truncate">${latest.desc}</span>
                        </span>` : ''}
                    <span class="ml-auto flex items-center gap-2 shrink-0 text-tech-dim/60">
                        <span class="hidden sm:inline text-[10px]">${this.expanded ? i18n.t('log.hide') : i18n.t('log.show')}</span>
                        <i data-lucide="chevron-${this.expanded ? 'up' : 'down'}" class="w-3.5 h-3.5"></i>
                    </span>
                </button>

                <!-- Expandable list -->
                <div id="log-body" class="${this.expanded ? '' : 'hidden'} px-4 pb-3 border-t border-white/5">
                    <ul>${rows}</ul>
                    <a href="./apps/system-log.html" class="inline-flex items-center gap-1.5 mt-2 text-[10px] uppercase tracking-widest text-tech-green/80 hover:text-tech-green transition-colors">
                        ${i18n.t('log.full')} <i data-lucide="arrow-right" class="w-3 h-3"></i>
                    </a>
                </div>
            </div>
        `;

        this.querySelector('#log-toggle').addEventListener('click', () => {
            this.expanded = !this.expanded;
            this.render();
        });

        if (window.lucide) window.lucide.createIcons({ root: this, nameAttr: 'data-lucide' });
    }
}

customElements.define('dl-unified-log', UnifiedLog);
