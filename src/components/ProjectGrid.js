// src/components/ProjectGrid.js

import { SITE_DATA } from '../data/db.js';
import { i18n } from '../utils/i18n.js';

class ProjectGrid extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        this.render();

        // Re-render on language change
        this.langListener = () => this.render();
        i18n.subscribe(this.langListener);
    }

    disconnectedCallback() {
        if (this.langListener) {
            i18n.unsubscribe(this.langListener);
        }
    }

    render() {
        // Check localStorage for show empty state
        const showEmpty = localStorage.getItem('draftlab_show_empty') === 'true';
        const lang = i18n.lang;

        // Clear existing content
        this.innerHTML = '';

        const wrapper = document.createElement('div');

        const grid = document.createElement('div');
        grid.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8";
        grid.id = "projects-grid";

        // Filter active projects
        const activeProjects = SITE_DATA.projects.filter(p => p.active);
        const inactiveProjects = SITE_DATA.projects.filter(p => !p.active);

        const renderProject = (p, isHidden = false) => {
            const baseClass = "group border transition-all duration-300 relative overflow-hidden flex flex-col h-full";
            // Determine visual state: Active ONLY if active=true AND url is not hash
            const isLive = p.active && p.url && p.url !== '#';

            const activeClass = isLive
                ? "border-tech-gray bg-[#0f0f0f] hover:border-tech-green"
                : "border-tech-gray/30 bg-[#0f0f0f]/50 opacity-60 border-dashed";
            const hiddenClass = isHidden ? "empty-slot hidden" : "";

            // Dynamic colors based on project
            const colorMap = {
                yellow: { gradient: 'from-orange-500 to-yellow-500', icon: 'text-yellow-500 group-hover:text-yellow-400', border: 'group-hover:border-yellow-500/50' },
                blue: { gradient: 'from-blue-500 to-cyan-500', icon: 'text-blue-500 group-hover:text-blue-400', border: 'group-hover:border-blue-500/50' },
                green: { gradient: 'from-green-500 to-emerald-500', icon: 'text-green-500 group-hover:text-green-400', border: 'group-hover:border-green-500/50' },
                gray: { gradient: 'from-gray-500 to-white', icon: 'text-tech-dim', border: '' }
            };
            const colors = colorMap[p.color] || colorMap.gray;
            const iconName = p.icon || 'box';

            // Translations
            const title = lang === 'pl' ? p.title : (p.title_en || p.title);
            const desc = lang === 'pl' ? p.desc : (p.desc_en || p.desc);
            const btnRun = i18n.t('ui.run');
            const txtOffline = i18n.t('ui.offline');

            // LOGIKA PRZYCISKÓW (ZMIANA)
            const actionButtons = isLive
                ? `
                <div class="mt-auto flex gap-2 pt-2">
                    <a href="${p.url}" class="flex-grow py-2 bg-tech-gray text-center text-sm font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-colors border border-transparent group-hover:border-white/20">
                        ${btnRun}
                    </a>
                    ${p.changelogUrl ? `
                    <a href="${p.changelogUrl}" class="px-3 py-2 border border-tech-gray text-tech-dim hover:text-tech-green hover:border-tech-green transition-colors flex items-center justify-center" title="Historia zmian / Readme">
                        <i data-lucide="file-clock" width="18"></i>
                    </a>
                    ` : ''}
                </div>`
                : `<div class="text-xs text-tech-dim text-center py-2 border border-tech-gray/30 mt-4 border-dashed mt-auto">${txtOffline}</div>`;

            return `
            <article class="${baseClass} ${activeClass} ${hiddenClass} min-h-[300px]">
                ${isLive ? `<div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${colors.gradient} opacity-70"></div>` : ''}
                
                <div class="p-6 flex flex-col h-full">
                    <div class="flex justify-between items-start mb-4">
                        <div class="flex items-center gap-4">
                            <div class="w-12 h-12 min-w-[3rem] bg-tech-gray/30 rounded flex items-center justify-center ${colors.icon} border border-tech-gray ${colors.border} transition-colors">
                                <i data-lucide="${iconName}" width="24"></i>
                            </div>
                            <h3 class="text-xl font-bold ${isLive ? 'group-hover:text-white' : 'text-tech-dim'} transition-colors">${title}</h3>
                        </div>
                        <span class="px-2 py-1 text-[10px] uppercase border border-tech-dim text-tech-dim rounded">${p.version}</span>
                    </div>
                    
                    <p class="text-tech-dim text-sm mb-2 flex-grow leading-relaxed">${desc}</p>

                    <div class="flex flex-wrap gap-2 mb-2">
                        ${p.tags.map(t => `<span class="text-[10px] text-tech-green bg-tech-green/10 px-2 py-1 rounded border border-tech-green/20">${t}</span>`).join('')}
                    </div>

                    ${actionButtons}
                </div>
            </article>
            `;
        };

        // Render active projects first
        const mappedProjects = activeProjects.map(p => renderProject(p, false));

        // Render inactive projects (hidden by default)
        inactiveProjects.forEach(p => {
            mappedProjects.push(renderProject(p, !showEmpty));
        });

        // Calculate missing phantom slots
        const totalItems = SITE_DATA.projects.length;
        const remainder = totalItems % 3;
        const missing = remainder === 0 ? 0 : 3 - remainder;

        if (missing > 0) {
            for (let i = 0; i < missing; i++) {
                const nextNum = String(totalItems + i + 1).padStart(2, '0');

                const title = lang === 'pl' ? `Slot_${nextNum}: Empty` : `Slot_${nextNum}: Empty`; // No translation needed really, or use map
                const desc = lang === 'pl' ? "Miejsce na kolejny projekt..." : "Place for the next project...";
                const txtTbd = i18n.t('ui.tbd');
                const txtOffline = i18n.t('ui.offline');

                const phantomSlot = `
                <article class="empty-slot ${showEmpty ? 'md:flex' : 'hidden'} group border transition-all duration-300 relative overflow-hidden flex-col h-full border-tech-gray/30 bg-[#0f0f0f]/50 opacity-30 border-dashed min-h-[300px]">
                    <div class="p-6 flex flex-col h-full">
                        <div class="flex justify-between items-start mb-4">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 min-w-[3rem] bg-tech-gray/30 rounded flex items-center justify-center text-tech-dim border border-tech-gray transition-colors">
                                    <i data-lucide="box" width="24"></i>
                                </div>
                                <h3 class="text-xl font-bold text-tech-dim transition-colors">${title}</h3>
                            </div>
                            <span class="px-2 py-1 text-[10px] uppercase border border-tech-dim text-tech-dim rounded">${txtTbd}</span>
                        </div>
                        
                        <p class="text-tech-dim text-sm mb-2 flex-grow leading-relaxed">${desc}</p>
    
                        <div class="flex flex-wrap gap-2 mb-6">
                        </div>
    
                        <div class="text-xs text-tech-dim text-center py-2 border border-tech-gray/30 mt-4 border-dashed mt-auto">${txtOffline}</div>
                    </div>
                </article>
                `;
                mappedProjects.push(phantomSlot);
            }
        }

        grid.innerHTML = mappedProjects.join('');

        // Toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = "mt-4 mx-auto block text-xs text-tech-dim hover:text-tech-green transition-colors cursor-pointer";
        toggleBtn.id = "toggle-empty-slots";

        const txtShow = i18n.t('ui.show_empty');
        const txtHide = i18n.t('ui.hide_empty');

        toggleBtn.innerHTML = showEmpty
            ? `<i data-lucide="eye-off" width="14" class="inline mr-1"></i> ${txtHide}`
            : `<i data-lucide="eye" width="14" class="inline mr-1"></i> ${txtShow}`;

        toggleBtn.addEventListener('click', () => {
            const emptySlots = grid.querySelectorAll('.empty-slot');
            const newState = !showEmpty;
            localStorage.setItem('draftlab_show_empty', newState);
            this.render(); // Re-render with new state
        });

        wrapper.appendChild(grid);
        wrapper.appendChild(toggleBtn);
        this.appendChild(wrapper);

        if (window.lucide) window.lucide.createIcons();
    }
}
customElements.define('dl-projects', ProjectGrid);