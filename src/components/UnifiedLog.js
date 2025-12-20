import { SITE_DATA } from '../data/db.js';
import { GIT_LOG_DATA } from '../data/git_log_data.js';

class UnifiedLog extends HTMLElement {
    constructor() {
        super();
        this.filter = 'ALL'; // ALL, APPS, SYSTEM
        this.combinedLogs = [];
    }

    connectedCallback() {
        this.prepareData();
        this.render();
    }

    prepareData() {
        // 1. App Logs
        const appLogs = [];
        if (SITE_DATA && SITE_DATA.projects) {
            SITE_DATA.projects.forEach(project => {
                if (project.changes) {
                    project.changes.forEach(change => {
                        appLogs.push({
                            source: 'APP',
                            date: change.date,
                            type: change.type,
                            desc: change.desc,
                            component: project.title.toUpperCase(), // Project Name as component
                            projectColor: project.color,
                            raw: change
                        });
                    });
                }
            });
        }

        // 2. System Logs
        const sysLogs = GIT_LOG_DATA.map(log => ({
            source: 'SYSTEM',
            date: log.date,
            type: log.type,
            desc: log.desc,
            component: (log.component || 'SYS').toUpperCase(),
            hash: log.hash,
            raw: log
        }));

        // 3. Combine & Sort
        this.combinedLogs = [...appLogs, ...sysLogs].sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    setFilter(newFilter) {
        this.filter = newFilter;
        this.render();
    }

    render() {
        // Filter
        let displayLogs = this.combinedLogs;
        if (this.filter === 'APPS') displayLogs = this.combinedLogs.filter(l => l.source === 'APP');
        if (this.filter === 'SYSTEM') displayLogs = this.combinedLogs.filter(l => l.source === 'SYSTEM');

        // Slice (show top 3)
        const slicedLogs = displayLogs.slice(0, 3);

        // Header controls
        const getBtnClass = (f) => {
            const base = "px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all cursor-pointer";
            if (this.filter === f) return `${base} bg-tech-green text-black border-tech-green`;
            return `${base} bg-transparent text-tech-dim border-tech-gray hover:text-white hover:border-white`;
        };

        const logsHtml = slicedLogs.map(log => {
            let typeColor = 'text-tech-dim';
            if (log.type === 'FEAT' || log.type === 'FEATURE' || log.type === 'INIT') typeColor = 'text-tech-green';
            if (log.type === 'FIX' || log.type === 'HOTFIX') typeColor = 'text-blue-400';
            if (log.type === 'STYLE' || log.type === 'VISUAL') typeColor = 'text-purple-400';
            if (log.type === 'REVERT') typeColor = 'text-red-400';

            const icon = log.source === 'APP' ? 'database' : 'git-branch';
            const metaInfo = log.hash ? `#${log.hash}` : (log.source === 'APP' ? 'v' + (log.raw.version || '?') : '');

            return `
            <div class="group relative pl-6 pb-6 border-l border-tech-gray last:border-0 last:pb-0">
                <div class="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-[#0f0f0f] border border-tech-gray group-hover:border-tech-green group-hover:bg-tech-green transition-all"></div>
                
                <div class="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 mb-1">
                    <div class="flex items-center gap-3">
                        <span class="text-[10px] font-mono text-tech-dim opacity-70">${log.date}</span>
                        <div class="flex items-center gap-2">
                             <i data-lucide="${icon}" width="10" class="text-tech-dim/50"></i>
                             <span class="text-xs text-white font-bold tracking-wide">${log.component}</span>
                        </div>
                        <span class="text-[9px] font-bold px-1.5 py-0.5 border border-white/10 rounded ${typeColor}">${log.type}</span>
                    </div>
                     <span class="text-[9px] font-mono text-tech-dim/40 hidden sm:inline-block">${metaInfo}</span>
                </div>
                
                <p class="text-tech-dim text-xs leading-relaxed max-w-2xl group-hover:text-tech-dim/90 transition-colors">
                    ${log.desc}
                </p>
            </div>
            `;
        }).join('');

        this.innerHTML = `
            <div class="bg-[#0f0f0f] border border-tech-gray p-0 relative overflow-hidden">
                <!-- Toolbar -->
                <div class="border-b border-tech-gray p-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/[0.02]">
                    <div class="flex items-center gap-3">
                        <i data-lucide="layers" class="text-tech-green"></i>
                        <h3 class="text-white font-bold uppercase tracking-widest text-sm">Dziennik Zmian</h3>
                    </div>
                    
                    <div class="flex gap-2">
                        <button id="btn-all" class="${getBtnClass('ALL')}">Wszystkie</button>
                        <button id="btn-apps" class="${getBtnClass('APPS')}">Aplikacje</button>
                        <button id="btn-system" class="${getBtnClass('SYSTEM')}">System</button>
                    </div>
                </div>

                <!-- Content -->
                <div class="p-6 md:p-8">
                     ${logsHtml.length > 0 ? logsHtml : '<div class="text-center text-tech-dim text-xs py-8">Brak wpisów dla wybranych kryteriów.</div>'}
                </div>

                <!-- Footer -->
                <div class="border-t border-tech-gray/30 p-4 bg-white/[0.02] flex justify-center">
                     <a href="./apps/system-log.html" class="w-full text-center px-4 py-3 bg-white/5 border border-tech-gray/50 hover:bg-tech-green hover:text-black hover:border-tech-green transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 group">
                        Pełny Rejestr Systemowy
                        <i data-lucide="arrow-right" width="14" class="group-hover:translate-x-1 transition-transform"></i>
                     </a>
                </div>
            </div>
        `;

        // Bind events
        this.querySelector('#btn-all').addEventListener('click', () => this.setFilter('ALL'));
        this.querySelector('#btn-apps').addEventListener('click', () => this.setFilter('APPS'));
        this.querySelector('#btn-system').addEventListener('click', () => this.setFilter('SYSTEM'));

        if (window.lucide) window.lucide.createIcons();
    }
}

customElements.define('dl-unified-log', UnifiedLog);
