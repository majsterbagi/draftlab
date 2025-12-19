import { SITE_DATA } from '../data/db.js';

class SystemLog extends HTMLElement {
    connectedCallback() {
        try {
            // 1. Aggregate all changes
            let allChanges = [];

            if (SITE_DATA && SITE_DATA.projects) {
                SITE_DATA.projects.forEach(project => {
                    if (project.changes) {
                        project.changes.forEach(change => {
                            allChanges.push({
                                ...change,
                                projectId: project.id,
                                projectTitle: project.title,
                                projectColor: project.color
                            });
                        });
                    }
                });
            }

            // 2. Sort by date (descending)
            allChanges.sort((a, b) => new Date(b.date) - new Date(a.date));

            // 3. Take top 4
            const recentLogs = allChanges.slice(0, 4);

            if (recentLogs.length === 0) {
                this.innerHTML = `<div class="p-4 text-tech-dim text-xs border border-tech-gray border-dashed">BRAK LOGÓW SYSTEMOWYCH</div>`;
                return;
            }

            // 4. Render
            const logHtml = recentLogs.map((log, index) => {
                // Color coding for change types
                let typeColor = 'text-tech-dim';
                if (log.type === 'FEATURE' || log.type === 'FEAT') typeColor = 'text-tech-green';
                if (log.type === 'FIX' || log.type === 'HOTFIX') typeColor = 'text-blue-400';
                if (log.type === 'INIT' || log.type === 'CORE') typeColor = 'text-yellow-500';

                return `
                <div class="group relative pl-6 pb-6 border-l border-tech-gray last:pb-0 last:border-0 cursor-pointer" onclick="this.querySelector('p').classList.toggle('line-clamp-2'); this.querySelector('p').classList.toggle('text-white');">
                    <div class="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-tech-gray border border-tech-bg group-hover:bg-tech-green transition-colors"></div>
                    
                    <div class="text-[10px] text-tech-dim font-mono mb-1 flex items-center gap-2">
                        <span>${log.date}</span>
                        <span class="text-tech-green/30">::</span>
                        <span class="text-white font-bold">${log.projectTitle.toUpperCase()}</span>
                        <span class="text-tech-green/30">::</span>
                        <span class="${typeColor} font-bold">${log.type}</span>
                    </div>
                    
                    <p class="text-tech-dim text-xs leading-relaxed max-w-prose line-clamp-2 transition-colors group-hover:text-tech-dim/80">
                        ${log.desc}
                    </p>
                </div>
                `;
            }).join('');

            this.innerHTML = `
                <div class="bg-[#0f0f0f] border border-tech-gray p-6 relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </div>
                    <div class="mt-2 relative z-10">
                        ${logHtml}
                    </div>
                    <div class="mt-8 pt-4 border-t border-tech-gray/30 text-[10px] text-tech-dim flex justify-between uppercase tracking-widest">
                        <span>System Status: ONLINE</span>
                        <span>Log count: ${allChanges.length}</span>
                    </div>
                </div>
            `;

        } catch (err) {
            console.error("SystemLog Error:", err);
            this.innerHTML = `<div class="text-red-500 text-xs">ERR: LOG_RENDER_FAIL</div>`;
        }
    }
}
customElements.define('dl-system-log', SystemLog);
