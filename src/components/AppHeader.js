import { SITE_DATA } from '../data/db.js';
import { i18n } from '../utils/i18n.js';

class AppHeader extends HTMLElement {
    constructor() {
        super();
        this.isMenuOpen = false;
        this.previousBodyOverflow = '';
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
        if (this.keydownListener) {
            document.removeEventListener('keydown', this.keydownListener);
        }
        if (this.isMenuOpen) {
            document.body.style.overflow = this.previousBodyOverflow;
            this.isMenuOpen = false;
        }
    }

    render() {
        // Language changes re-render the header. Close an open menu first so
        // the body never stays locked after the old DOM is replaced.
        if (this.isMenuOpen) {
            document.body.style.overflow = this.previousBodyOverflow;
            this.isMenuOpen = false;
        }
        if (this.keydownListener) {
            document.removeEventListener('keydown', this.keydownListener);
        }

        const currentPath = window.location.pathname;
        const isSubdir = window.location.pathname.includes('/apps/');
        const basePrefix = isSubdir ? '../' : '';
        const lang = i18n.lang; // 'pl' or 'en'
        const closeMenuLabel = lang === 'pl' ? 'Zamknij menu' : 'Close menu';

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
                <a href="${finalUrl}" class="block w-full max-w-md px-4 py-4 text-xl sm:text-2xl font-bold leading-tight tracking-widest border-b border-tech-gray/20 hover:text-tech-green transition-colors text-center ${isActive ? 'text-tech-green' : 'text-white'}">
                    ${isActive ? '> ' : ''}${getMenuName(link)}
                </a>
            `;
        }).join('');

        // Language Toggle Logic
        // Flag SVGs
        const plFlag = `<svg viewBox="0 0 32 24" class="w-4 h-auto block pointer-events-none"><rect width="32" height="24" fill="#fff"/><rect y="12" width="32" height="12" fill="#dc143c"/></svg>`;
        const enFlag = `<svg viewBox="0 0 32 24" class="w-4 h-auto block pointer-events-none"><rect width="32" height="24" fill="#012169"/><path d="M0,0 L32,24 M32,0 L0,24" stroke="#fff" stroke-width="4"/><path d="M0,0 L32,24 M32,0 L0,24" stroke="#c8102e" stroke-width="2"/><path d="M16,0 L16,24 M0,12 L32,12" stroke="#fff" stroke-width="6"/><path d="M16,0 L16,24 M0,12 L32,12" stroke="#c8102e" stroke-width="4"/></svg>`;

        const langToggle = (mobile = false) => `
            <div class="flex items-center gap-3 ${mobile ? 'rounded-full border border-dashed border-tech-gray/80 px-3 py-1.5' : 'ml-4 md:ml-6 border-l border-dashed border-tech-gray pl-4 md:pl-6'}">
                <button type="button" class="lang-btn inline-flex min-h-9 min-w-9 items-center justify-center rounded-md p-1 opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 ${lang === 'pl' ? 'opacity-100 grayscale-0 scale-110' : ''}" data-lang="pl" aria-label="Polish" aria-pressed="${lang === 'pl'}">
                    ${plFlag}
                </button>
                <button type="button" class="lang-btn inline-flex min-h-9 min-w-9 items-center justify-center rounded-md p-1 opacity-50 hover:opacity-100 transition-opacity grayscale hover:grayscale-0 ${lang === 'en' ? 'opacity-100 grayscale-0 scale-110' : ''}" data-lang="en" aria-label="English" aria-pressed="${lang === 'en'}">
                    ${enFlag}
                </button>
            </div>
        `;

        // Search trigger (Command Palette)
        const searchBtn = `
            <button type="button" id="palette-btn" title="${i18n.t('ui.search')} (Cmd+K)"
                class="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-tech-dim hover:text-tech-green hover:border-tech-green/40 transition-colors text-xs">
                <i data-lucide="search" class="w-3.5 h-3.5"></i>
                <span>${i18n.t('ui.search')}</span>
                <span class="kbd ml-1">⌘K</span>
            </button>
        `;

        const mobileSearchBtn = `
            <button type="button" id="mobile-palette-btn"
                class="flex w-full max-w-md items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm tracking-widest text-tech-dim hover:border-tech-green/40 hover:text-tech-green transition-colors">
                <i data-lucide="search" class="w-4 h-4"></i>
                ${i18n.t('ui.search')}
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
                            ${langToggle()}
                        </div>

                        <!-- Mobile Menu Button -->
                        <button type="button" id="mobile-menu-btn" class="md:hidden inline-flex min-h-10 min-w-10 items-center justify-center rounded-md text-white hover:text-tech-green transition-colors" aria-label="Menu" aria-controls="mobile-menu" aria-expanded="false">
                            <i data-lucide="menu" width="24"></i>
                        </button>
                    </div>
                </div>
                <div class="scroll-progress"></div>
            </header>

            <!-- Mobile Menu Overlay: kept outside the glass header so fixed positioning uses the viewport. -->
            <div id="mobile-menu" role="dialog" aria-modal="true" aria-label="Menu" aria-hidden="true" inert
                class="fixed inset-0 z-50 invisible pointer-events-none opacity-0 transition-[opacity,visibility] duration-300">
                <div class="absolute inset-0 bg-tech-bg/95 backdrop-blur-md"></div>
                <div class="relative flex min-h-[100dvh] max-h-[100dvh] w-full flex-col overflow-y-auto overscroll-contain px-5 pt-[max(5rem,env(safe-area-inset-top))] pb-[max(2rem,env(safe-area-inset-bottom))]">
                    <button type="button" id="close-menu-btn" class="absolute right-5 top-[max(1.25rem,env(safe-area-inset-top))] inline-flex min-h-11 min-w-11 items-center justify-center rounded-md text-white hover:text-tech-green" aria-label="${closeMenuLabel}">
                        <i data-lucide="x" width="32"></i>
                    </button>
                    <nav class="mx-auto flex w-full max-w-md flex-col items-center gap-3 text-center">
                        ${mobileLinks}
                        ${mobileSearchBtn}
                        <a href="${basePrefix}legacy/index.html" class="flex items-center gap-2 py-3 text-sm uppercase tracking-widest text-tech-dim hover:text-tech-green transition-colors">
                            <i data-lucide="history" class="w-4 h-4"></i> ${i18n.t('ui.legacy')}
                        </a>
                        <div class="mt-2 flex justify-center">
                            ${langToggle(true)}
                        </div>
                    </nav>
                </div>
            </div>
        `;

        // Logic
        const openBtn = this.querySelector('#mobile-menu-btn');
        const closeBtn = this.querySelector('#close-menu-btn');
        const menu = this.querySelector('#mobile-menu');
        const langBtns = this.querySelectorAll('.lang-btn');
        const paletteBtn = this.querySelector('#palette-btn');
        const mobilePaletteBtn = this.querySelector('#mobile-palette-btn');

        const toggleMenu = (show, restoreFocus = true) => {
            if (!menu) return;

            if (show) {
                if (!this.isMenuOpen) {
                    this.previousBodyOverflow = document.body.style.overflow;
                }
                this.isMenuOpen = true;
                openBtn?.setAttribute('aria-expanded', 'true');
                menu.setAttribute('aria-hidden', 'false');
                menu.removeAttribute('inert');
                menu.classList.remove('opacity-0', 'pointer-events-none', 'invisible');
                menu.classList.add('opacity-100', 'pointer-events-auto', 'visible');
                document.body.style.overflow = 'hidden';
                closeBtn?.focus();
            } else {
                this.isMenuOpen = false;
                openBtn?.setAttribute('aria-expanded', 'false');
                menu.setAttribute('aria-hidden', 'true');
                menu.setAttribute('inert', '');
                menu.classList.remove('opacity-0', 'pointer-events-none');
                menu.classList.remove('opacity-100', 'pointer-events-auto', 'visible');
                menu.classList.add('opacity-0', 'pointer-events-none', 'invisible');
                document.body.style.overflow = this.previousBodyOverflow;
                this.previousBodyOverflow = '';
                if (restoreFocus) openBtn?.focus();
            }
        };

        if (openBtn) openBtn.addEventListener('click', () => toggleMenu(true));
        if (closeBtn) closeBtn.addEventListener('click', () => toggleMenu(false));
        const openPalette = () => {
            if (this.isMenuOpen) toggleMenu(false, false);
            document.dispatchEvent(new CustomEvent('dl:open-palette'));
        };
        if (paletteBtn) paletteBtn.addEventListener('click', openPalette);
        if (mobilePaletteBtn) mobilePaletteBtn.addEventListener('click', openPalette);

        this.keydownListener = (event) => {
            if (event.key === 'Escape' && this.isMenuOpen) {
                toggleMenu(false);
            }
        };
        document.addEventListener('keydown', this.keydownListener);

        if (menu) {
            menu.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', () => toggleMenu(false, false));
            });
        }

        // Lang Switch Listeners
        langBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const newLang = e.currentTarget.getAttribute('data-lang');
                if (this.isMenuOpen) toggleMenu(false);
                if (newLang) {
                    i18n.setLang(newLang);
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
