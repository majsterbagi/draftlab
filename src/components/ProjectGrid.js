// src/components/ProjectGrid.js

import { SITE_DATA } from '../data/db.js';

class ProjectGrid extends HTMLElement {
    connectedCallback() {
        const grid = document.createElement('div');
        grid.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8";

        grid.innerHTML = SITE_DATA.projects.map(p => {
            const baseClass = "group border transition-all duration-300 relative overflow-hidden flex flex-col h-full";
            const activeClass = p.active
                ? "border-tech-gray bg-[#0f0f0f] hover:border-tech-green"
                : "border-tech-gray/30 bg-[#0f0f0f]/50 opacity-60 border-dashed";

            // Dynamic colors based on project
            const colorMap = {
                yellow: { gradient: 'from-orange-500 to-yellow-500', icon: 'text-yellow-500 group-hover:text-yellow-400', border: 'group-hover:border-yellow-500/50' },
                blue: { gradient: 'from-blue-500 to-cyan-500', icon: 'text-blue-500 group-hover:text-blue-400', border: 'group-hover:border-blue-500/50' },
                gray: { gradient: 'from-gray-500 to-white', icon: 'text-tech-dim', border: '' }
            };
            const colors = colorMap[p.color] || colorMap.gray;
            const iconName = p.icon || (p.active ? 'box' : 'box');

            // LOGIKA PRZYCISKÓW (ZMIANA)
            const actionButtons = p.active
                ? `
                <div class="mt-auto flex gap-2 pt-6">
                    <a href="${p.url}" class="flex-grow py-2 bg-tech-gray text-center text-sm font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-colors border border-transparent group-hover:border-white/20">
                        Uruchom
                    </a>
                    ${p.changelogUrl ? `
                    <a href="${p.changelogUrl}" class="px-3 py-2 border border-tech-gray text-tech-dim hover:text-tech-green hover:border-tech-green transition-colors flex items-center justify-center" title="Historia zmian / Readme">
                        <i data-lucide="file-clock" width="18"></i>
                    </a>
                    ` : ''}
                </div>`
                : `<div class="text-xs text-tech-dim text-center py-2 border border-tech-gray/30 mt-4 border-dashed mt-auto">OFFLINE</div>`;

            return `
            <article class="${baseClass} ${activeClass} min-h-[300px]">
                ${p.active ? `<div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colors.gradient} opacity-70"></div>` : ''}
                
                <div class="p-6 flex flex-col h-full">
                    <div class="flex justify-between items-start mb-4">
                        <div class="w-12 h-12 bg-tech-gray/30 rounded flex items-center justify-center ${colors.icon} border border-tech-gray ${colors.border} transition-colors">
                            <i data-lucide="${iconName}" width="24"></i>
                        </div>
                        <span class="px-2 py-1 text-[10px] uppercase border border-tech-dim text-tech-dim rounded">${p.version}</span>
                    </div>
                    
                    <h3 class="text-xl font-bold mb-2 ${p.active ? 'group-hover:text-white' : 'text-tech-dim'} transition-colors">${p.title}</h3>
                    <p class="text-tech-dim text-sm mb-2 flex-grow leading-relaxed">${p.desc}</p>

                    <div class="flex flex-wrap gap-2 mb-6">
                        ${p.tags.map(t => `<span class="text-[10px] text-tech-green bg-tech-green/10 px-2 py-1 rounded border border-tech-green/20">${t}</span>`).join('')}
                    </div>

                    ${actionButtons}
                </div>
            </article>
            `;
        }).join('');

        this.appendChild(grid);
        if (window.lucide) window.lucide.createIcons();
    }
}
customElements.define('dl-projects', ProjectGrid);