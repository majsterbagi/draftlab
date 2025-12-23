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
            <a href="${homeUrl}" class="draftlab-logo">
                <span style="width:8px; height:8px; background:#00ff9d; border-radius:50%; display:inline-block;"></span>
                ${title}
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
