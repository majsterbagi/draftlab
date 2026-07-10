import './components/AppHeader.js';
import './components/AppFooter.js';
import './components/ProjectGrid.js';
import './components/TechStack.js';
import './components/CommandPalette.js';
import './components/NeuralTerminal.js';
import './components/UnifiedLog.js';
import './utils/reveal.js';
import { i18n } from './utils/i18n.js';
import { SITE_DATA } from './data/db.js';
import { GIT_LOG_DATA } from './data/git_log_data.js';

// i18n init
document.addEventListener('DOMContentLoaded', () => {
    document.documentElement.lang = i18n.lang;
    i18n.updateStaticElements();
    if (typeof window.updateApp === 'function') window.updateApp();
    i18n.subscribe(() => {
        i18n.updateStaticElements();
        document.documentElement.lang = i18n.lang;
        if (typeof window.updateApp === 'function') window.updateApp();
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
    const releasesCount = SITE_DATA.projects.reduce((sum, p) => sum + (p.changes ? p.changes.length : 0), 0);
    const techCount = new Set(SITE_DATA.projects.flatMap(p => p.tags || [])).size;

    const statApps = document.getElementById('stat-apps');
    const statUpdate = document.getElementById('stat-update');
    const statReleases = document.getElementById('stat-releases');
    const statTech = document.getElementById('stat-tech');
    if (statApps) animateCount(statApps, appsCount);
    if (statUpdate && GIT_LOG_DATA.length) {
        const last = GIT_LOG_DATA[0];
        const [y, m, d] = last.date.split(' ')[0].split('-');
        statUpdate.textContent = `${d}.${m}.${y}`;

        const tip = document.getElementById('stat-update-tip');
        if (tip) {
            const tag = document.createElement('span');
            tag.className = 'text-tech-green font-bold';
            tag.textContent = `[${last.type}//${last.component}] `;
            tip.append(tag, last.desc);
        }
    }
    if (statReleases) animateCount(statReleases, releasesCount);
    if (statTech) animateCount(statTech, techCount);

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
