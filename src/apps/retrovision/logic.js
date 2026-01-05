/**
 * RetroVision - Core Logic
 * Handles Camera access and ASCII rendering pipeline.
 */

import { i18n } from '../../utils/i18n.js';

const SETTINGS = {
    charset: 'matrix', // matrix, binary, ascii
    density: 12,       // px per character (font size)
    color: 'green',    // green, amber, white
    running: false
};

const CHARSETS = {
    // Standard density map (High -> Low brightness)
    ascii: ' .:-=+*#%@',
    // Matrix-style (Katakana subset)
    matrix: 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍｦｲｸｺ',
    // Binary
    binary: '01'
};

const PALETTES = {
    green: '#00ff41',
    amber: '#ffb000',
    white: '#ffffff'
};

// DOM Elements
let video, canvas, ctx;
let btnStart, overlay;
let densitySlider, densityVal;
let charsetBtns, colorBtns;
let btnSnapshot;

// State
let stream = null;
let animationId = null;

// Offscreen buffer for pixel reading
const bufferCanvas = document.createElement('canvas');
const bufferCtx = bufferCanvas.getContext('2d', { willReadFrequently: true });

/**
 * Initialize the application
 */
export function init() {
    console.log('[RetroVision] Initializing...');

    // Init i18n
    i18n.updateStaticElements();

    // Bind DOM
    video = document.getElementById('video-source');
    canvas = document.getElementById('ascii-canvas');
    ctx = canvas.getContext('2d', { alpha: false }); // Optimization

    btnStart = document.getElementById('btn-start');
    overlay = document.getElementById('permission-overlay');

    // UI Binds
    bindControls();

    // Event Listeners
    btnStart.addEventListener('click', startCamera);
    window.addEventListener('resize', resizeCanvas);

    // Initial resize to fit screen
    resizeCanvas();
}

/**
 * Bind UI Controls
 */
function bindControls() {
    // Density Slider
    densitySlider = document.getElementById('density-slider');
    densityVal = document.getElementById('density-val');

    densitySlider.addEventListener('input', (e) => {
        SETTINGS.density = parseInt(e.target.value);
        densityVal.textContent = `${SETTINGS.density} px`;
        // Force font update
        ctx.font = `${SETTINGS.density}px "JetBrains Mono", monospace`;
    });

    // Charset Buttons
    charsetBtns = document.querySelectorAll('[data-charset]');
    charsetBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            SETTINGS.charset = btn.dataset.charset;

            // Set default density based on charset
            if (SETTINGS.charset === 'matrix') {
                SETTINGS.density = 14;
            } else if (SETTINGS.charset === 'binary') {
                SETTINGS.density = 8;
            } else {
                SETTINGS.density = 12; // Default for others
            }

            // Update Slider & UI
            if (densitySlider) densitySlider.value = SETTINGS.density;
            if (densityVal) densityVal.textContent = `${SETTINGS.density}px`;

            // Force font update
            ctx.font = `${SETTINGS.density}px "JetBrains Mono", monospace`;

            // Update UI active state
            charsetBtns.forEach(b => {
                b.classList.remove('active-mode', 'text-green-400');
                b.classList.add('text-gray-400');
            });
            btn.classList.add('active-mode', 'text-green-400');
            btn.classList.remove('text-gray-400');
        });
    });

    // Color Buttons
    colorBtns = document.querySelectorAll('[data-color]');
    colorBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            SETTINGS.color = btn.dataset.color;
            // Update UI ring
            colorBtns.forEach(b => b.classList.remove('ring-2', 'ring-green-900'));
            btn.classList.add('ring-2', 'ring-green-900');
        });
    });

    // Snapshot
    btnSnapshot = document.getElementById('btn-snapshot');
    // Toggle UI Logic
    const uiPanel = document.getElementById('ui-panel');
    const btnCloseUi = document.getElementById('btn-close-ui');
    const btnOpenUi = document.getElementById('btn-open-ui');

    function toggleUi() {
        // Check current state
        const isVisible = uiPanel.getAttribute('data-visible') === 'true';

        if (isVisible) {
            // Hide
            uiPanel.setAttribute('data-visible', 'false');
            btnOpenUi.classList.remove('text-black', 'bg-green-500');
            btnOpenUi.classList.add('text-green-500', 'bg-black/50');
        } else {
            // Show
            uiPanel.setAttribute('data-visible', 'true');
            btnOpenUi.classList.add('text-black', 'bg-green-500'); // Highlight active
            btnOpenUi.classList.remove('text-green-500', 'bg-black/50');
        }
    }

    if (btnCloseUi) btnCloseUi.addEventListener('click', toggleUi); // Close button inside panel
    if (btnOpenUi) btnOpenUi.addEventListener('click', toggleUi);   // Toggle button in bar

    // Init state (Closed by default on mobile?)
    // No, keep closed by default as per HTML state
}


/**
 * Start Camera Stream
 */
async function startCamera() {
    try {
        btnStart.textContent = "INITIALIZING...";
        btnStart.disabled = true;

        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                width: { ideal: 640 }, // We don't need 4K for ASCII
                height: { ideal: 480 },
                facingMode: 'user'
            },
            audio: false
        });

        video.srcObject = stream;
        await video.play();

        // Hide overlay
        overlay.classList.add('hidden');
        SETTINGS.running = true;

        // Start Loop
        renderLoop();

        console.log('[RetroVision] Stream started.');

    } catch (err) {
        console.error('[RetroVision] Camera access denied:', err);
        btnStart.textContent = "ACCESS DENIED";
        alert("Camera access is required for this app to work. Please check permissions.");
    }
}

/**
 * Main Rendering Loop
 */
function renderLoop() {
    if (!SETTINGS.running) return;

    // 1. Draw video to buffer at low res
    // Calculate aspect ratio
    const w = canvas.width;
    const h = canvas.height;

    // We only need to scan pixels at 'density' steps.
    // So buffer can be smaller? No, keep it simple for now:
    // Actually, drawing the whole video to buffer is fast.
    if (video.readyState === video.HAVE_ENOUGH_DATA) {
        bufferCanvas.width = w;
        bufferCanvas.height = h;
        bufferCtx.drawImage(video, 0, 0, w, h);

        const frame = bufferCtx.getImageData(0, 0, w, h);
        const data = frame.data;

        // 2. Clear Main Canvas
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, w, h);

        // 3. Setup Font
        ctx.font = `${SETTINGS.density}px "JetBrains Mono", monospace`;
        ctx.textBaseline = 'top';
        ctx.fillStyle = PALETTES[SETTINGS.color];

        // 4. Loop through pixels
        const step = SETTINGS.density;
        const chars = CHARSETS[SETTINGS.charset];
        const charsLen = chars.length;

        let str = ""; // Optimization: batch strings? 
        // Actually canvas text is raster.
        // Drawing char by char is slow.
        // Ideally we would build a full string per line, but spacing is monospaced.

        for (let y = 0; y < h; y += step) {
            for (let x = 0; x < w; x += step) {
                // Get pixel color (center of the block)
                const offset = (y * w + x) * 4;
                const r = data[offset];
                const g = data[offset + 1];
                const b = data[offset + 2];

                // Luminance
                const brightness = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

                // Pick char
                // If Matrix/Binary: Random selection? No, map to brightness creates structure.
                // For Matrix, we usually just want random chars but let's use brightness for "shape".

                let charIndex = Math.floor(brightness * charsLen);
                if (charIndex >= charsLen) charIndex = charsLen - 1;

                const char = chars[charIndex]; // For standard ASCII this works (dark -> light?)
                // Actually standard standard is usually light -> dark if background is black
                // Let's invert for black background?
                // Bright pixel = Bright Char (e.g. '@' or full block)
                // Wait, '@' is dense (lots of white pixels), '.' is sparse.
                // So on black bg: High Brightness => Dense Char ('@').

                // Matrix/Binary: Just chars.

                ctx.fillText(char, x, y);
            }
        }
    }

    animationId = requestAnimationFrame(renderLoop);
}

/**
 * Handle Canvas Resize
 */
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

/**
 * Take Snapshot
 */
function takeSnapshot() {
    const link = document.createElement('a');
    link.download = `retrovision_${Date.now()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}

// Auto-init
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}
