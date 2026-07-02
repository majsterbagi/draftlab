import { SITE_DATA } from '../data/db.js';
import { i18n } from '../utils/i18n.js';

class AppHeader extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        // Ensure the custom element itself takes full width and sticks to top
        this.style.display = 'block';
        this.style.width = '100%';
        this.style.position = 'sticky';
        this.style.top = '0';
        this.style.zIndex = '9999';

        this.render();

        // Listen for language changes and re-render
        this.langListener = () => {
            this.render();
        };
        i18n.subscribe(this.langListener);

        // Scroll progress bar
        this.scrollListener = () => {
            const bar = this.querySelector('.scroll-progress');
            if (!bar) return;
            const max = document.documentElement.scrollHeight - window.innerHeight;
            const p = max > 0 ? window.scrollY / max : 0;
            bar.style.transform = `scaleX(${Math.min(Math.max(p, 0), 1)})`;
        };
        window.addEventListener('scroll', this.scrollListener, { passive: true });
    }

    disconnectedCallback() {
        if (this.langListener) {
            i18n.unsubscribe(this.langListener);
        }
        if (this.scrollListener) {
            window.removeEventListener('scroll', this.scrollListener);
        }
    }

    render() {
        const currentPath = window.location.pathname;
        const isSubdir = window.location.pathname.includes('/apps/');
        const basePrefix = isSubdir ? '../' : '';
        const lang = i18n.lang; // 'pl' or 'en'

        // Helper to get translated name
        const getMenuName = (link) => {
            return lang === 'pl' ? link.name : (link.name_en || link.name);
        };

        // Linki Desktop
        const desktopLinks = SITE_DATA.menu.map(link => {
            const isActive = currentPath.includes(link.url) || (link.url === 'index.html' && (currentPath === '/' || currentPath === '/index.html'));
            const finalUrl = basePrefix + link.url;
            return `
                <a href="${finalUrl}" class="text-sm tracking-widest hover:text-tech-green transition-colors ${isActive ? 'text-tech-green font-bold' : 'text-tech-dim'}">
                    ${isActive ? '<span class="animate-pulse">></span> ' : ''}${getMenuName(link)}
                </a>
            `;
        }).join('');

        // Linki Mobile
        const mobileLinks = SITE_DATA.menu.map(link => {
            const isActive = currentPath.includes(link.url) || (link.url === 'index.html' && (currentPath === '/' || currentPath === '/index.html'));
            const finalUrl = basePrefix + link.url;
            return `
                <a href="${finalUrl}" class="block text-2xl font-bold tracking-widest py-6 border-b border-tech-gray/20 hover:text-tech-green transition-colors w-full text-center ${isActive ? 'text-tech-green' : 'text-white'}">
                    ${isActive ? '> ' : ''}${getMenuName(link)}
                </a>
            `;
        }).join('');

        // Language Toggle Logic
        // Flag SVGs
        const plFlag = `<svg viewBox="0 0 32 24" class="w-4 h-auto block pointer-events-none"><rect width="32" height="24" fill="#fff"/><rect y="12" width="32" height="12" fill="#dc143c"/></svg>`;
        const enFlag = `<svg viewBox="0 0 32 24" class="w-4 h-auto block pointer-events-none"><rect width="32" height="24" fill="#012169"/><path d="M0,0 L32,24 M32,0 L0,24" stroke="#fff" stroke-width="4"/><path d="M0,0 L32,24 M32,0 L0,24" stroke="#c8102e" stroke-width="2"/><path d="M16,0 L16,24 M0,12 L32,12" stroke="#fff" stroke-width="6"/><path d="M16,0 L16,24 M0,12 L32,12" stroke="#c8102e" stroke-width="4"/></svg>`;

        const langToggle = `
            <div class="flex items-center gap-4 ml-4 md:ml-6 border-l border-dashed border-tech-gray pl-4 md:pl-6">
                <button class="lang-btn opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 ${lang === 'pl' ? 'opacity-100 grayscale-0 scale-110' : ''}" data-lang="pl" aria-label="Polish">
                    ${plFlag}
                </button>
                <button class="lang-btn opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 ${lang === 'en' ? 'opacity-100 grayscale-0 scale-110' : ''}" data-lang="en" aria-label="English">
                    ${enFlag}
                </button>
            </div>
        `;

        // Search trigger (Command Palette)
        const searchBtn = `
            <button id="palette-btn" title="${i18n.t('ui.search')} (Cmd+K)"
                class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-tech-dim hover:text-tech-green hover:border-tech-green/40 transition-colors text-xs">
                <i data-lucide="search" class="w-3.5 h-3.5"></i>
                <span>${i18n.t('ui.search')}</span>
                <span class="kbd ml-1">⌘K</span>
            </button>
        `;

        // Legacy version link
        const legacyLink = `
            <a href="${basePrefix}legacy/index.html" title="${i18n.t('ui.legacy_title')}"
                class="hidden lg:flex items-center gap-1.5 text-[10px] uppercase tracking-wider text-tech-dim hover:text-tech-green transition-colors">
                <i data-lucide="history" class="w-3.5 h-3.5"></i>
                v1.0
            </a>
        `;

        this.innerHTML = `
            <header class="w-full glass border-b-0 relative">
                <div class="max-w-7xl mx-auto px-4 py-3.5 flex justify-between items-center">
                    <div class="flex items-center">
                        <a href="${basePrefix}index.html" class="draftlab-logo flex items-center gap-2 group mr-8">
                            <i data-lucide="flask-conical" class="text-tech-green w-6 h-6 stroke-[2.5] fill-tech-green/20 group-hover:fill-tech-green group-hover:drop-shadow-[0_0_6px_rgba(0,255,157,0.8)] transition-all"></i>
                            <span class="text-lg font-bold tracking-tight text-white group-hover:text-tech-green transition-colors">DraftLab.pl</span>
                        </a>

                        <!-- Desktop Menu -->
                        <nav class="hidden md:flex gap-8 items-center">
                            ${desktopLinks}
                        </nav>
                    </div>

                    <div class="flex items-center gap-4">
                        ${searchBtn}
                        ${legacyLink}
                         <!-- Lang Toggle Desktop -->
                        <div class="hidden md:block">
                            ${langToggle}
                        </div>

                        <!-- Mobile Menu Button -->
                        <button id="mobile-menu-btn" class="md:hidden text-white hover:text-tech-green transition-colors" aria-label="Menu">
                            <i data-lucide="menu" width="24"></i>
                        </button>
                    </div>
                </div>
                <div class="scroll-progress"></div>

                 <!-- Mobile Menu Overlay -->
                <div id="mobile-menu" class="fixed inset-0 bg-tech-bg/95 backdrop-blur-md z-50 flex flex-col justify-center items-center gap-8 opacity-0 pointer-events-none transition-all duration-300">
                    <button id="close-menu-btn" class="absolute top-6 right-6 text-white hover:text-tech-green" aria-label="Zamknij menu">
                        <i data-lucide="x" width="32"></i>
                    </button>
                    <nav class="flex flex-col gap-4 text-center items-center w-full">
                        ${mobileLinks}
                        <a href="${basePrefix}legacy/index.html" class="flex items-center gap-2 text-sm uppercase tracking-widest text-tech-dim hover:text-tech-green transition-colors py-4">
                            <i data-lucide="history" class="w-4 h-4"></i> ${i18n.t('ui.legacy')}
                        </a>
                        <div class="mt-4">
                             ${langToggle}
                        </div>
                    </nav>
                </div>
            </header>
        `;

        // Logic
        const openBtn = this.querySelector('#mobile-menu-btn');
        const closeBtn = this.querySelector('#close-menu-btn');
        const menu = this.querySelector('#mobile-menu');
        const langBtns = this.querySelectorAll('.lang-btn');
        const paletteBtn = this.querySelector('#palette-btn');

        const toggleMenu = (show) => {
            if (show) {
                menu.classList.remove('opacity-0', 'pointer-events-none');
                menu.classList.add('opacity-100', 'pointer-events-auto');
                document.body.style.overflow = 'hidden';
            } else {
                menu.classList.add('opacity-0', 'pointer-events-none');
                menu.classList.remove('opacity-100', 'pointer-events-auto');
                document.body.style.overflow = '';
            }
        };

        if (openBtn) openBtn.addEventListener('click', () => toggleMenu(true));
        if (closeBtn) closeBtn.addEventListener('click', () => toggleMenu(false));
        if (paletteBtn) paletteBtn.addEventListener('click', () => {
            document.dispatchEvent(new CustomEvent('dl:open-palette'));
        });

        // Lang Switch Listeners
        langBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const newLang = e.currentTarget.getAttribute('data-lang');
                if (newLang) {
                    i18n.setLang(newLang);
                }
                if (menu.classList.contains('opacity-100')) {
                    toggleMenu(false);
                }
            });
        });

        // Render icons
        if (window.lucide) {
            window.lucide.createIcons({
                root: this,
                nameAttr: 'data-lucide'
            });
        }
    }
}
customElements.define('dl-header', AppHeader);
