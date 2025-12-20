import { GIT_LOG_DATA } from '../data/git_log_data.js';

class GitLog extends HTMLElement {
    connectedCallback() {
        try {
            // Use Git Log Data
            const recentLogs = GIT_LOG_DATA.slice(0, 5);

            if (recentLogs.length === 0) {
                this.innerHTML = `<div class="p-4 text-tech-dim text-xs border border-tech-gray border-dashed">BRAK LOGÓW SYSTEMOWYCH</div>`;
                return;
            }

            // Render
            const logHtml = recentLogs.map((log) => {
                // Color coding for change types
                let typeColor = 'text-tech-dim';
                if (log.type === 'FEAT' || log.type === 'FEATURE' || log.type === 'DOCS') typeColor = 'text-tech-green';
                if (log.type === 'FIX' || log.type === 'HOTFIX') typeColor = 'text-blue-400';
                if (log.type === 'STYLE') typeColor = 'text-purple-400';
                if (log.type === 'REVERT') typeColor = 'text-red-400';
                if (log.type === 'INIT' || log.type === 'CORE') typeColor = 'text-yellow-500';

                return `
                <div class="group relative pl-6 pb-6 border-l border-tech-gray last:pb-0 last:border-0 cursor-pointer" onclick="this.querySelector('p').classList.toggle('line-clamp-2'); this.querySelector('p').classList.toggle('text-white');">
                    <div class="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-tech-gray border border-tech-bg group-hover:bg-tech-green transition-colors"></div>
                    
                    <div class="text-[10px] text-tech-dim font-mono mb-1 flex items-center gap-2">
                        <span>${log.date}</span>
                        <span class="text-tech-green/30">::</span>
                        <span class="text-white font-bold">${log.component || 'SYS'}</span>
                        <span class="text-tech-green/30">::</span>
                        <span class="${typeColor} font-bold">${log.type}</span>
                        <span class="text-tech-dim/50 font-mono text-[9px] ml-auto">#${log.hash}</span>
                    </div>
                    
                    <p class="text-tech-dim text-xs leading-relaxed max-w-prose line-clamp-2 transition-colors group-hover:text-tech-dim/80">
                        ${log.desc}
                    </p>
                </div>
                `;
            }).join('');

            this.innerHTML = `
                <div class="bg-[#0f0f0f] border border-tech-gray p-6 relative overflow-hidden h-full">
                    <div class="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <i data-lucide="git-commit-horizontal" class="text-white" width="80" height="80"></i>
                    </div>
                    <div class="mt-2 relative z-10">
                        ${logHtml}
                    </div>
                    <div class="mt-8 pt-4 border-t border-tech-gray/30 flex flex-col gap-4">
                        <div class="flex justify-between text-[10px] text-tech-dim uppercase tracking-widest">
                            <span>Repositories: MAIN</span>
                            <span>Commits: ${GIT_LOG_DATA.length}</span>
                        </div>
                        
                        <a href="./apps/system-log.html" class="flex items-center justify-center gap-2 w-full py-3 border border-tech-gray/30 bg-white/5 hover:bg-tech-green hover:text-black hover:border-tech-green transition-all text-xs font-bold uppercase tracking-wider text-white group">
                            <i data-lucide="list-plus" width="14" class="group-hover:stroke-black"></i>
                            Pełny Rejestr
                        </a>
                    </div>
                </div>
            `;

            if (window.lucide) {
                window.lucide.createIcons();
            }

        } catch (err) {
            console.error("GitLog Error:", err);
            this.innerHTML = `<div class="text-red-500 text-xs">ERR: LOG_RENDER_FAIL</div>`;
        }
    }
}
customElements.define('dl-git-log', GitLog);
