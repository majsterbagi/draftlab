/**
 * FluxBoard - Core Logic
 * Handles Grid Layout, Widget State, and Drag & Drop (Future).
 */

import { createWidget } from './widgets.js';

const STORAGE_KEY = 'fluxboard_state_v1';
const GRID_CONTAINER = document.getElementById('dashboard-grid');

// Default Layout
const DEFAULT_LAYOUT = [
    { type: 'clock', x: 0, y: 0, w: 2, h: 2, id: 'clock-1' },
    { type: 'weather', x: 2, y: 0, w: 2, h: 2, id: 'weather-1' },
    { type: 'system', x: 4, y: 0, w: 2, h: 2, id: 'system-1' },
    { type: 'notes', x: 0, y: 2, w: 4, h: 2, id: 'notes-1', content: 'Tasks:\n- Check server status\n- Update system logs' }
];

let currentLayout = [];

export function init() {
    console.log('[FluxBoard] Initializing...');

    // Load State
    loadState();

    // Render Grid
    renderGrid();

    // Event Listeners
    setupEventListeners();

    // Listen for widget updates (Notes, etc.)
    document.addEventListener('widget-update', (e) => {
        const { id, content } = e.detail;
        const widgetIndex = currentLayout.findIndex(w => w.id === id);
        if (widgetIndex > -1) {
            currentLayout[widgetIndex].content = content;
            saveState();
        }
    });

    // Listen for widget deletion
    document.addEventListener('widget-delete', (e) => {
        const { id } = e.detail;
        if (confirm('Delete this module?')) {
            currentLayout = currentLayout.filter(w => w.id !== id);
            saveState();
            renderGrid();
        }
    });
}

function loadState() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        try {
            currentLayout = JSON.parse(saved);
        } catch (e) {
            console.error('[FluxBoard] Error parsing state:', e);
            currentLayout = DEFAULT_LAYOUT;
        }
    } else {
        currentLayout = DEFAULT_LAYOUT;
    }
}

function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentLayout));
    console.log('[FluxBoard] State saved.');
}

function renderGrid() {
    GRID_CONTAINER.innerHTML = '';

    currentLayout.forEach((config, index) => {
        const widgetEl = createWidget(config);

        // Add container wrapper for Grid item logic
        // Actually createWidget returns the container. Let's add class here.
        widgetEl.classList.add('widget-item');
        if (document.body.classList.contains('edit-mode')) {
            widgetEl.draggable = true;
        }

        // Apply Grid Position
        widgetEl.style.gridColumn = `span ${config.w}`;
        widgetEl.style.gridRow = `span ${config.h}`;
        widgetEl.dataset.index = index; // Store index for reordering

        // Drag Events
        addDragHandlers(widgetEl);

        GRID_CONTAINER.appendChild(widgetEl);
    });

    // Refresh Icons
    if (window.lucide) {
        window.lucide.createIcons();
    }
}

// DRAG & DROP LOGIC
let draggedItem = null;

function addDragHandlers(el) {
    el.addEventListener('dragstart', (e) => {
        draggedItem = el;
        e.dataTransfer.effectAllowed = 'move';
        el.classList.add('opacity-50');
    });

    el.addEventListener('dragend', () => {
        draggedItem = null;
        el.classList.remove('opacity-50');
        document.querySelectorAll('.widget-item').forEach(item => item.classList.remove('border-cyan-400', 'border-2'));
    });

    el.addEventListener('dragover', (e) => {
        e.preventDefault(); // Allow drop
        e.dataTransfer.dropEffect = 'move';
        el.classList.add('border-cyan-400', 'border-2');
    });

    el.addEventListener('dragleave', () => {
        el.classList.remove('border-cyan-400', 'border-2');
    });

    el.addEventListener('drop', (e) => {
        e.preventDefault();
        el.classList.remove('border-cyan-400', 'border-2');

        if (draggedItem !== el) {
            const fromIndex = parseInt(draggedItem.dataset.index);
            const toIndex = parseInt(el.dataset.index);

            swapWidgets(fromIndex, toIndex);
        }
    });
}

function swapWidgets(from, to) {
    // Simple array swap for now. 
    // In a real grid, this changes the DOM order, but CSS Grid might layout them differently if distinct x/y were used.
    // Since we use auto-flow (x/y in config are mostly ignored by simple grid-flow unless explicit stats), changing array order works.

    const temp = currentLayout[from];
    currentLayout[from] = currentLayout[to];
    currentLayout[to] = temp;

    saveState();
    renderGrid();
}


function setupEventListeners() {
    document.getElementById('btn-add-widget').addEventListener('click', () => {
        document.getElementById('widget-modal').showModal();
    });

    document.getElementById('close-modal').addEventListener('click', () => {
        document.getElementById('widget-modal').close();
    });

    // Edit Mode Toggle
    const btnEdit = document.getElementById('btn-edit-mode');
    btnEdit.addEventListener('click', () => {
        document.body.classList.toggle('edit-mode');
        const isEdit = document.body.classList.contains('edit-mode');
        btnEdit.classList.toggle('text-cyan-400', isEdit);
        btnEdit.classList.toggle('text-cyan-700', !isEdit);

        // Enable/Disable Drag properties
        document.querySelectorAll('.widget-item').forEach(el => {
            el.draggable = isEdit;
        });
    });

    // Theme Toggle
    const themes = ['', 'theme-green', 'theme-amber', 'theme-purple', 'theme-red'];
    let currentThemeIndex = 0;

    // Load Theme
    const savedTheme = localStorage.getItem('fluxboard_theme');
    if (savedTheme && themes.includes(savedTheme)) {
        document.body.classList.add(savedTheme);
        currentThemeIndex = themes.indexOf(savedTheme);
    }

    document.getElementById('btn-theme').addEventListener('click', () => {
        // Remove current
        if (themes[currentThemeIndex]) document.body.classList.remove(themes[currentThemeIndex]);

        // Next
        currentThemeIndex = (currentThemeIndex + 1) % themes.length;

        // Add new
        if (themes[currentThemeIndex]) document.body.classList.add(themes[currentThemeIndex]);

        // Save
        localStorage.setItem('fluxboard_theme', themes[currentThemeIndex]);
    });

    // Inject styles for better drag handling
    const style = document.createElement('style');
    style.innerHTML = `
        .edit-mode .widget-item * { pointer-events: none !important; }
        .edit-mode .widget-item .btn-delete { pointer-events: auto !important; }
        .widget-item.opacity-50 { opacity: 0.5; }
        .widget-item.border-2 { border-width: 2px !important; }
    `;
    document.head.appendChild(style);

    document.querySelectorAll('.widget-opt').forEach(btn => {
        btn.addEventListener('click', () => {
            const type = btn.dataset.type;
            addWidget(type);
            document.getElementById('widget-modal').close();
        });
    });
}

function addWidget(type) {
    const id = `${type}-${Date.now()}`;
    const newWidget = {
        type: type,
        x: 0, y: 0, // Auto-flow handles this for now
        w: 2, h: 2,
        id: id,
        content: ''
    };

    if (type === 'notes') newWidget.w = 2; // Default size adj

    currentLayout.push(newWidget);
    saveState();
    renderGrid();
}

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
