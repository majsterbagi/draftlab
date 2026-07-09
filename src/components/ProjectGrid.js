// src/components/ProjectGrid.js

import { SITE_DATA } from '../data/db.js';
import { i18n } from '../utils/i18n.js';
import { observeReveals } from '../utils/reveal.js';

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
        grid.className = "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
        grid.id = "projects-grid";

        // Filter active projects
        const activeProjects = SITE_DATA.projects.filter(p => p.active);
        const inactiveProjects = SITE_DATA.projects.filter(p => !p.active);

        const renderProject = (p, index = 0, isHidden = false) => {
            const baseClass = "group border rounded-card transition-all duration-300 relative overflow-hidden flex flex-col h-full";
            // Determine visual state: Active ONLY if active=true AND url is not hash
            const isLive = p.active && p.url && p.url !== '#';

            const activeClass = isLive
                ? "spotlight-card border-white/10 bg-tech-card shadow-card hover:border-tech-green/50 hover:shadow-glow-sm hover:-translate-y-1"
                : "border-tech-gray/30 bg-tech-card/50 opacity-60 border-dashed";
            const hiddenClass = isHidden ? "empty-slot hidden" : "";

            // Dynamic colors based on project
            // All apps use green gradient, but keep colorful icons
            const iconColorMap = {
                yellow: 'text-yellow-500 group-hover:text-yellow-400',
                blue: 'text-blue-500 group-hover:text-blue-400',
                green: 'text-green-500 group-hover:text-green-400',
                teal: 'text-teal-500 group-hover:text-teal-400',
                violet: 'text-violet-500 group-hover:text-violet-400',
                amber: 'text-amber-500 group-hover:text-amber-400',
                pink: 'text-pink-400 group-hover:text-pink-300',
            };

            const greenGradient = 'from-green-500 to-emerald-500';
            const greenBorder = 'group-hover:border-green-500/50';
            const iconColor = iconColorMap[p.color] || 'text-green-500 group-hover:text-green-400';

            const A = p.icon || 'box';

            // Translations
            const title = lang === 'pl' ? p.title : (p.title_en || p.title);
            const desc = lang === 'pl' ? p.desc : (p.desc_en || p.desc);
            const btnRun = i18n.t('ui.run');
            const txtOffline = i18n.t('ui.offline');
            const titleClass = p.id === 'pixel-kart'
                ? 'text-lg sm:text-xl whitespace-nowrap'
                : 'text-xl';

            const statusBadge = isLive
                ? `<span class="flex items-center gap-1.5 px-2 py-1 text-[10px] uppercase rounded-full border border-tech-green/30 bg-tech-green/10 text-tech-green">
                        <span class="w-1.5 h-1.5 rounded-full bg-tech-green animate-pulse"></span>${p.version}
                   </span>`
                : `<span class="px-2 py-1 text-[10px] uppercase border border-tech-dim/40 text-tech-dim rounded-full">${p.version}</span>`;

            // Action buttons
            const actionButtons = isLive
                ? `
                <div class="mt-auto flex gap-2 pt-2 relative z-[2]">
                    <a href="${p.url}"${p.external ? ' target="_blank" rel="noopener noreferrer"' : ''} class="flex-grow py-2.5 rounded-lg bg-tech-green/10 border border-tech-green/30 text-tech-green text-center text-sm font-bold uppercase tracking-wider hover:bg-tech-green hover:text-black hover:shadow-glow-sm transition-all">
                        ${btnRun}
                    </a>
                    ${p.changelogUrl ? `
                    <a href="${p.changelogUrl}" class="px-3 py-2 rounded-lg border border-white/10 text-tech-dim hover:text-tech-green hover:border-tech-green/40 transition-colors flex items-center justify-center" title="Historia zmian / Readme">
                        <i data-lucide="file-clock" width="18"></i>
                    </a>
                    ` : ''}
                </div>`
                : `<div class="text-xs text-tech-dim text-center py-2 rounded-lg border border-tech-gray/30 border-dashed mt-auto">${txtOffline}</div>`;

            return `
            <article class="${baseClass} ${activeClass} ${hiddenClass} min-h-[300px]" data-reveal style="--reveal-delay: ${Math.min(index * 70, 350)}ms">
                ${isLive ? `<div class="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r ${greenGradient} opacity-60 group-hover:opacity-100 transition-opacity"></div>` : ''}

                <div class="p-6 flex flex-col h-full">
                    <div class="mb-3">
                        <div class="flex items-center justify-between gap-2">
                            <div class="flex min-w-0 items-center gap-3 sm:gap-4">
                            <div class="w-12 h-12 min-w-[3rem] bg-white/5 rounded-xl flex items-center justify-center ${iconColor} border border-white/10 ${greenBorder} transition-colors">
                                <i data-lucide="${A}" width="24"></i>
                            </div>
                            <h3 class="${titleClass} font-bold ${isLive ? 'group-hover:text-white' : 'text-tech-dim'} transition-colors">${title}</h3>
                            </div>
                            ${statusBadge}
                        </div>
                    </div>

                    <p class="text-tech-dim text-sm mb-2 flex-grow leading-relaxed">${desc}</p>

                    <div class="flex flex-wrap gap-2 mb-2">
                        ${p.tags.map(t => `<span class="text-[10px] text-tech-green bg-tech-green/10 px-2 py-1 rounded-full border border-tech-green/20">${t}</span>`).join('')}
                    </div>

                    ${actionButtons}
                </div>
            </article>
            `;
        };

        // Render active projects first
        const mappedProjects = activeProjects.map((p, idx) => renderProject(p, idx, false));

        // Render inactive projects (hidden by default)
        inactiveProjects.forEach((p, idx) => {
            mappedProjects.push(renderProject(p, activeProjects.length + idx, !showEmpty));
        });

        // Calculate missing phantom slots
        const totalItems = SITE_DATA.projects.length;
        const remainder = totalItems % 3;
        const missing = remainder === 0 ? 0 : 3 - remainder;

        if (missing > 0) {
            for (let i = 0; i < missing; i++) {
                const nextNum = String(totalItems + i + 1).padStart(2, '0');

                const title = `Slot_${nextNum}: Empty`;
                const desc = lang === 'pl' ? "Miejsce na kolejny projekt..." : "Place for the next project...";
                const txtTbd = i18n.t('ui.tbd');
                const txtOffline = i18n.t('ui.offline');

                const phantomSlot = `
                <article class="empty-slot ${showEmpty ? 'md:flex' : 'hidden'} group border rounded-card transition-all duration-300 relative overflow-hidden flex-col h-full border-tech-gray/30 bg-tech-card/50 opacity-30 border-dashed min-h-[300px]">
                    <div class="p-6 flex flex-col h-full">
                        <div class="flex justify-between items-start mb-4">
                            <div class="flex items-center gap-4">
                                <div class="w-12 h-12 min-w-[3rem] bg-white/5 rounded-xl flex items-center justify-center text-tech-dim border border-white/10 transition-colors">
                                    <i data-lucide="box" width="24"></i>
                                </div>
                                <h3 class="text-xl font-bold text-tech-dim transition-colors">${title}</h3>
                            </div>
                            <span class="px-2 py-1 text-[10px] uppercase border border-tech-dim/40 text-tech-dim rounded-full">${txtTbd}</span>
                        </div>

                        <p class="text-tech-dim text-sm mb-2 flex-grow leading-relaxed">${desc}</p>

                        <div class="flex flex-wrap gap-2 mb-6">
                        </div>

                        <div class="text-xs text-tech-dim text-center py-2 rounded-lg border border-tech-gray/30 border-dashed mt-auto">${txtOffline}</div>
                    </div>
                </article>
                `;
                mappedProjects.push(phantomSlot);
            }
        }

        grid.innerHTML = mappedProjects.join('');

        // Toggle button
        const toggleBtn = document.createElement('button');
        toggleBtn.className = "mt-6 mx-auto block text-xs text-tech-dim hover:text-tech-green transition-colors cursor-pointer";
        toggleBtn.id = "toggle-empty-slots";

        const txtShow = i18n.t('ui.show_empty');
        const txtHide = i18n.t('ui.hide_empty');

        toggleBtn.innerHTML = showEmpty
            ? `<i data-lucide="eye-off" width="14" class="inline mr-1"></i> ${txtHide}`
            : `<i data-lucide="eye" width="14" class="inline mr-1"></i> ${txtShow}`;

        toggleBtn.addEventListener('click', () => {
            const newState = !showEmpty;
            localStorage.setItem('draftlab_show_empty', newState);
            this.render(); // Re-render with new state
        });

        wrapper.appendChild(grid);
        wrapper.appendChild(toggleBtn);
        this.appendChild(wrapper);

        // Mouse-tracking spotlight on live cards
        grid.querySelectorAll('.spotlight-card').forEach(card => {
            card.addEventListener('pointermove', (e) => {
                const rect = card.getBoundingClientRect();
                card.style.setProperty('--mx', `${e.clientX - rect.left}px`);
                card.style.setProperty('--my', `${e.clientY - rect.top}px`);
            });
        });

        // Entrance animations
        observeReveals(this);

        if (window.lucide) window.lucide.createIcons();
    }
}
customElements.define('dl-projects', ProjectGrid);
