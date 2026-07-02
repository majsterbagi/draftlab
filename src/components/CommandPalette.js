// src/components/CommandPalette.js
// Paleta poleceń (Cmd+K / Ctrl+K) — szybka nawigacja po stronach i aplikacjach.

import { SITE_DATA } from '../data/db.js';
import { i18n } from '../utils/i18n.js';

class CommandPalette extends HTMLElement {

    connectedCallback() {
        this.isOpen = false;
        this.activeIndex = 0;

        this.render();

        this.keyHandler = (e) => {
            if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
                e.preventDefault();
                this.toggle();
            } else if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        };
        document.addEventListener('keydown', this.keyHandler);

        this.openHandler = () => this.open();
        document.addEventListener('dl:open-palette', this.openHandler);

        this.langListener = () => this.render();
        i18n.subscribe(this.langListener);
    }

    disconnectedCallback() {
        document.removeEventListener('keydown', this.keyHandler);
        document.removeEventListener('dl:open-palette', this.openHandler);
        if (this.langListener) i18n.unsubscribe(this.langListener);
    }

    getItems() {
        const isSubdir = window.location.pathname.includes('/apps/');
        const prefix = isSubdir ? '../' : '';
        const lang = i18n.lang;

        const pages = SITE_DATA.menu.map(m => ({
            group: 'pages',
            title: lang === 'pl' ? m.name : (m.name_en || m.name),
            icon: 'file-terminal',
            url: prefix + m.url,
        }));

        pages.push({
            group: 'pages',
            title: i18n.t('ui.legacy'),
            icon: 'history',
            url: prefix + 'legacy/index.html',
        });

        const apps = SITE_DATA.projects
            .filter(p => p.active && p.url && p.url !== '#')
            .map(p => ({
                group: 'apps',
                title: lang === 'pl' ? p.title : (p.title_en || p.title),
                desc: lang === 'pl' ? p.desc : (p.desc_en || p.desc),
                icon: p.icon || 'box',
                url: prefix + p.url,
            }));

        return [...pages, ...apps];
    }

    filterItems(query) {
        const items = this.getItems();
        if (!query) return items;
        const q = query.toLowerCase();
        return items.filter(i =>
            i.title.toLowerCase().includes(q) || (i.desc || '').toLowerCase().includes(q)
        );
    }

    render() {
        this.innerHTML = `
            <div id="palette-overlay" class="fixed inset-0 z-[10001] hidden items-start justify-center pt-[18vh] px-4 bg-black/60 backdrop-blur-sm">
                <div id="palette-box" class="glass w-full max-w-lg rounded-card shadow-card overflow-hidden" role="dialog" aria-modal="true" aria-label="Command palette">
                    <div class="flex items-center gap-3 px-4 py-3 border-b border-white/10">
                        <i data-lucide="search" class="w-4 h-4 text-tech-green shrink-0"></i>
                        <input id="palette-input" type="text" autocomplete="off" spellcheck="false"
                            placeholder="${i18n.t('palette.placeholder')}"
                            class="bg-transparent w-full text-sm text-white placeholder:text-tech-dim outline-none border-none focus:ring-0" />
                        <span class="kbd">ESC</span>
                    </div>
                    <ul id="palette-list" class="max-h-[45vh] overflow-y-auto py-2 px-2"></ul>
                    <div class="flex items-center gap-4 px-4 py-2 border-t border-white/10 text-[10px] text-tech-dim">
                        <span><span class="kbd">↑↓</span> ${i18n.t('palette.hint')}</span>
                        <span><span class="kbd">↵</span> ${i18n.t('palette.hint_select')}</span>
                        <span><span class="kbd">ESC</span> ${i18n.t('palette.hint_close')}</span>
                    </div>
                </div>
            </div>
        `;

        this.overlay = this.querySelector('#palette-overlay');
        this.input = this.querySelector('#palette-input');
        this.list = this.querySelector('#palette-list');

        this.overlay.addEventListener('mousedown', (e) => {
            if (e.target === this.overlay) this.close();
        });

        this.input.addEventListener('input', () => {
            this.activeIndex = 0;
            this.renderList();
        });

        this.input.addEventListener('keydown', (e) => {
            const max = this.currentItems.length - 1;
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                this.activeIndex = Math.min(this.activeIndex + 1, max);
                this.renderList();
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                this.activeIndex = Math.max(this.activeIndex - 1, 0);
                this.renderList();
            } else if (e.key === 'Enter') {
                e.preventDefault();
                const item = this.currentItems[this.activeIndex];
                if (item) window.location.href = item.url;
            }
        });

        if (this.isOpen) this.openInternal();
    }

    renderList() {
        this.currentItems = this.filterItems(this.input.value);

        if (this.currentItems.length === 0) {
            this.list.innerHTML = `<li class="px-4 py-6 text-center text-xs text-tech-dim">${i18n.t('palette.empty')}</li>`;
            return;
        }

        let html = '';
        let lastGroup = null;
        this.currentItems.forEach((item, idx) => {
            if (item.group !== lastGroup) {
                lastGroup = item.group;
                const label = item.group === 'pages' ? i18n.t('palette.pages') : i18n.t('palette.apps');
                html += `<li class="px-3 pt-3 pb-1 text-[9px] tracking-widest text-tech-dim/70 select-none">${label}</li>`;
            }
            const active = idx === this.activeIndex;
            html += `
                <li>
                    <a href="${item.url}" data-idx="${idx}"
                       class="palette-item flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${active ? 'bg-tech-green/10 text-tech-green' : 'text-white hover:bg-white/5'}">
                        <i data-lucide="${item.icon}" class="w-4 h-4 shrink-0 ${active ? 'text-tech-green' : 'text-tech-dim'}"></i>
                        <span class="font-bold">${item.title}</span>
                        ${item.desc ? `<span class="text-[10px] text-tech-dim truncate hidden sm:inline">${item.desc}</span>` : ''}
                    </a>
                </li>`;
        });
        this.list.innerHTML = html;

        this.list.querySelectorAll('.palette-item').forEach(el => {
            el.addEventListener('mousemove', () => {
                const idx = parseInt(el.dataset.idx, 10);
                if (idx !== this.activeIndex) {
                    this.activeIndex = idx;
                    this.renderList();
                }
            });
        });

        const activeEl = this.list.querySelector(`[data-idx="${this.activeIndex}"]`);
        if (activeEl) activeEl.scrollIntoView({ block: 'nearest' });

        if (window.lucide) window.lucide.createIcons({ root: this.list, nameAttr: 'data-lucide' });
    }

    open() {
        this.isOpen = true;
        this.openInternal();
    }

    openInternal() {
        this.overlay.classList.remove('hidden');
        this.overlay.classList.add('flex');
        this.input.value = '';
        this.activeIndex = 0;
        this.renderList();
        document.body.style.overflow = 'hidden';
        requestAnimationFrame(() => this.input.focus());
    }

    close() {
        this.isOpen = false;
        this.overlay.classList.add('hidden');
        this.overlay.classList.remove('flex');
        document.body.style.overflow = '';
    }

    toggle() {
        this.isOpen ? this.close() : this.open();
    }
}

customElements.define('dl-command-palette', CommandPalette);
