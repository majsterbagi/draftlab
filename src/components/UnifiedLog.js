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

        // 3. Combine, Deduplicate & Sort
        const combined = [...appLogs, ...sysLogs];

        // Deduplicate by desc (same message = same change)
        const seen = new Set();
        const unique = combined.filter(log => {
            const key = log.desc;
            if (seen.has(key)) return false;
            seen.add(key);
            return true;
        });

        this.combinedLogs = unique.sort((a, b) => new Date(b.date) - new Date(a.date));
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
            let typeBg = 'bg-tech-dim/10';

            if (log.type === 'FEAT' || log.type === 'FEATURE' || log.type === 'INIT') { typeColor = 'text-tech-green'; typeBg = 'bg-tech-green/10'; }
            if (log.type === 'MAJOR' || log.type === 'CORE') { typeColor = 'text-yellow-400'; typeBg = 'bg-yellow-400/10'; }
            if (log.type === 'FIX' || log.type === 'HOTFIX') { typeColor = 'text-blue-400'; typeBg = 'bg-blue-400/10'; }
            if (log.type === 'STYLE' || log.type === 'VISUAL') { typeColor = 'text-purple-400'; typeBg = 'bg-purple-400/10'; }
            if (log.type === 'REVERT') { typeColor = 'text-red-400'; typeBg = 'bg-red-400/10'; }

            // Format Date: "YYYY-MM-DD HH:MM" -> split
            const dateTime = log.date.split(' ');
            const dateStr = dateTime[0] || log.date;
            const timeStr = dateTime[1] || '';

            return `
            <tr class="hover:bg-white/[0.02] transition-colors group">
                <td class="py-3 px-6 border-r border-tech-gray/10 text-tech-dim">
                    <div class="flex flex-col">
                        <span class="font-bold text-white/70 group-hover:text-white transition-colors">${dateStr}</span>
                        <span class="text-[10px] opacity-50">${timeStr}</span>
                    </div>
                </td>
                <td class="py-3 px-4 border-r border-tech-gray/10 text-center">
                    <span class="text-[10px] font-bold tracking-wider text-white bg-white/5 px-2 py-1 rounded border border-white/5 group-hover:border-white/20 transition-colors">
                        ${log.component}
                    </span>
                </td>
                <td class="py-3 px-4 border-r border-tech-gray/10 text-center">
                     <span class="text-[10px] font-bold px-2 py-1 rounded border border-transparent ${typeColor} ${typeBg}">
                        ${log.type}
                     </span>
                </td>
                <td class="py-3 px-6">
                    <p class="text-white/80 leading-relaxed max-w-2xl group-hover:text-white transition-colors">
                        ${log.desc}
                    </p>
                    ${log.hash ? `<span class="text-[10px] text-tech-dim/30 mt-1 block">SHA: ${log.hash}</span>` : ''}
                </td>
            </tr>
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
                <div class="p-0 overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-white/5 text-[10px] uppercase tracking-widest text-tech-dim font-bold border-b border-tech-gray">
                            <tr>
                                <th class="py-3 px-6 w-32 border-r border-tech-gray/30">Data</th>
                                <th class="py-3 px-4 w-24 border-r border-tech-gray/30 text-center">Moduł</th>
                                <th class="py-3 px-4 w-20 border-r border-tech-gray/30 text-center">Typ</th>
                                <th class="py-3 px-6">Opis Zmiany</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-tech-gray/20 font-mono text-xs">
                            ${logsHtml.length > 0 ? logsHtml : '<tr><td colspan="4" class="text-center py-8 text-tech-dim">Brak wpisów.</td></tr>'}
                        </tbody>
                    </table>
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
