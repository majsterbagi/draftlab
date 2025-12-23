/**
 * Nucleus.js - The Core of DraftLab Apps
 * Handles common UI elements, shared styles, and navigation via Web Components.
 */

import '../components/OverlayHeader.js';

const NUCLEUS_CONFIG = {
    styles: `
        /* --- NUCLEUS SHARED STYLES --- */
        dl-overlay-header {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            box-sizing: border-box;
            padding: 15px 20px;
            padding-top: max(15px, env(safe-area-inset-top));
            z-index: 1000;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), transparent);
            pointer-events: none;
            font-family: 'JetBrains Mono', monospace;
        }

        .draftlab-logo {
            font-weight: 700;
            color: #fff;
            text-decoration: none;
            font-size: 18px;
            display: flex;
            align-items: center;
            gap: 8px;
            pointer-events: auto;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
            transition: opacity 0.2s;
        }
        
        .draftlab-logo:hover {
            opacity: 0.8;
        }

        .back-btn {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            background: rgba(255, 255, 255, 0.1);
            padding: 6px 12px;
            border-radius: 4px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            pointer-events: auto;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .back-btn:hover {
            background: rgba(255, 255, 255, 0.25);
            color: #fff;
            border-color: #00ff9d;
        }
    `
};

/**
 * Injects the shared styles into the document head.
 */
function injectStyles() {
    const styleEl = document.createElement('style');
    styleEl.id = 'draftlab-nucleus-styles';
    styleEl.textContent = NUCLEUS_CONFIG.styles;
    document.head.appendChild(styleEl);
}

/**
 * Renders the global header using Web Component.
 */
function renderHeader() {
    if (document.querySelector('dl-overlay-header')) return;
    const header = document.createElement('dl-overlay-header');
    document.body.prepend(header);
}

/**
 * Main initialization function.
 */
export function init() {
    console.log('[Nucleus] Initializing environment (Web Components Mode)...');
    injectStyles();
    // renderHeader(); // Disabled - using explicit <dl-header>
    console.log('[Nucleus] Ready.');
}
