import './components/AppHeader.js';
import './components/AppFooter.js';
import './components/ProjectGrid.js';
import './components/SystemLog.js';
import './components/TechStack.js';
import './components/DlReturn.js';
import './components/CommandPalette.js';
import './components/NeuralTerminal.js';
import './components/UnifiedLog.js';
import './utils/reveal.js';
import { i18n } from './utils/i18n.js';
import { SITE_DATA } from './data/db.js';
import { GIT_LOG_DATA } from './data/git_log_data.js';

// i18n init
document.addEventListener('DOMContentLoaded', () => {
    i18n.updateStaticElements();
    i18n.subscribe(() => {
        i18n.updateStaticElements();
        document.documentElement.lang = i18n.lang;
    });
});

// Hero stats — animowany licznik
const animateCount = (el, target) => {
    const duration = 900;
    const start = performance.now();
    const tick = (now) => {
        const p = Math.min((now - start) / duration, 1);
        el.textContent = Math.round(target * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
};

document.addEventListener('DOMContentLoaded', () => {
    const appsCount = SITE_DATA.projects.filter(p => p.active && p.url && p.url !== '#').length;
    const statApps = document.getElementById('stat-apps');
    const statCommits = document.getElementById('stat-commits');
    if (statApps) animateCount(statApps, appsCount);
    if (statCommits) animateCount(statCommits, GIT_LOG_DATA.length);

    // Hero fade-in
    const heroText = document.getElementById('hero-init-text');
    if (heroText) {
        setTimeout(() => heroText.classList.add('fade-in'), 200);
    }
});

// Automatyczny montaż palety poleceń (Cmd+K) na każdej stronie z main.js
const mountPalette = () => {
    if (!document.querySelector('dl-command-palette')) {
        document.body.appendChild(document.createElement('dl-command-palette'));
    }
};
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mountPalette);
} else {
    mountPalette();
}

// Log diagnostyczny - zobaczysz go w konsoli (F12)
console.log("%c DraftLab System v2.0: All Modules Loaded. ", "background: #00ff9d; color: #000; font-weight: bold;");
