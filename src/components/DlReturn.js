import { i18n } from '../utils/i18n.js';

class DlReturn extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        this.resizeListener = () => this.render();
        window.addEventListener('resize', this.resizeListener);

        // Listen for language changes
        this.langListener = () => this.render();
        i18n.subscribe(this.langListener);
    }

    disconnectedCallback() {
        if (this.langListener) i18n.unsubscribe(this.langListener);
        if (this.resizeListener) window.removeEventListener('resize', this.resizeListener);
    }

    render() {
        const href = this.getAttribute('href') || '../index.html';
        const position = this.getAttribute('position') || 'top-left'; // 'top-left', 'bottom-right', 'inline'

        // Styles
        const style = `
            <style>
                :host {
                    display: inline-block;
                    z-index: 999;
                }
                
                :host([position="top-left"]) {
                    position: absolute;
                    top: 100px; /* Below header approx */
                    left: 20px;
                }

                :host([position="bottom-right"]) {
                    position: fixed;
                    bottom: 30px;
                    right: 30px;
                }

                :host([position="top-right"]) {
                    position: absolute;
                    top: 70px;
                    right: max(20px, calc((100vw - 768px) / 2));
                }

                a {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    padding: 8px 16px;
                    background: rgba(0, 0, 0, 0.6);
                    border: 1px solid rgba(255, 255, 255, 0.2);
                    backdrop-filter: blur(8px);
                    color: rgba(255, 255, 255, 0.8);
                    text-decoration: none;
                    text-transform: uppercase;
                    font-family: 'JetBrains Mono', monospace;
                    font-size: 11px;
                    font-weight: 700;
                    letter-spacing: 1px;
                    border-radius: 8px;
                    transition: all 0.2s;
                }

                a:hover {
                    background: rgba(0, 255, 157, 0.1);
                    border-color: #00ff9d;
                    color: #fff;
                    transform: translateX(-2px);
                }

                svg {
                    width: 14px;
                    height: 14px;
                }

                @media (max-width: 768px) {
                    :host([position="top-left"]) {
                        top: 90px;
                        left: 16px;
                    }
                }
            </style>
        `;

        // Content
        this.shadowRoot.innerHTML = `
            ${style}
            <a href="${href}">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                ${i18n.t('shared.return')}
            </a>
        `;
    }
}

customElements.define('dl-return', DlReturn);
