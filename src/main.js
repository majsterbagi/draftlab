import './components/AppHeader.js';
import './components/AppFooter.js';
import './components/ProjectGrid.js';
import './components/SystemLog.js';
import './components/TechStack.js';
import './components/DlReturn.js';
import './components/CommandPalette.js';
import './components/NeuralTerminal.js';
import './utils/reveal.js';

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
