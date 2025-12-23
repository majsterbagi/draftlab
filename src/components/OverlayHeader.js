import { SITE_DATA } from '../data/db.js';

class OverlayHeader extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const title = SITE_DATA.config.title;

        // Inteligentne wykrywanie ścieżki głównej
        const isSubdir = window.location.pathname.includes('/apps/');
        const homeUrl = isSubdir ? '../index.html' : 'index.html';

        this.innerHTML = `
            <a href="${homeUrl}" class="draftlab-logo flex items-center gap-2 group text-white hover:text-tech-green transition-colors">
                <i data-lucide="flask-conical" class="text-tech-green w-5 h-5 stroke-[2.5] fill-tech-green/20 group-hover:fill-tech-green transition-colors"></i>
                <span class="font-bold tracking-tight">${title}</span>
            </a>
            <a href="${homeUrl}" class="back-btn">
                <i data-lucide="arrow-left" width="12"></i> POWRÓT
            </a>
        `;

        // Render icons efficiently if Lucide is loaded
        if (window.lucide) {
            window.lucide.createIcons({
                root: this,
                nameAttr: 'data-lucide'
            });
        }
    }
}

customElements.define('dl-overlay-header', OverlayHeader);
