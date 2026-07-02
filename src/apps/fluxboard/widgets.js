/**
 * FluxBoard - Widget Factory
 */

import { SITE_DATA } from '../../data/db.js';

export function createWidget(config) {
    const el = document.createElement('div');
    el.className = 'relative rounded-xl p-4 flex flex-col group overflow-hidden border border-cyan-500/15 bg-gradient-to-br from-cyan-950/40 via-black/30 to-black/50 backdrop-blur-md hover:border-cyan-400/40 hover:shadow-[0_0_18px_rgba(34,211,238,0.15)] hover:-translate-y-0.5 transition-all duration-300';
    el.dataset.id = config.id;
    el.dataset.type = config.type;

    // Header (hidden by default, visible on hover/edit)
    const header = document.createElement('div');
    header.className = 'absolute top-0 left-0 w-full p-2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-gradient-to-b from-black/80 to-transparent pointer-events-none';
    header.innerHTML = `
        <span class="text-[10px] uppercase text-cyan-700 tracking-wider font-bold ml-2">${config.type}</span>
        <button class="pointer-events-auto text-cyan-900 hover:text-red-500 transition-colors btn-delete" title="Remove Widget">
            <i data-lucide="x" class="w-4 h-4"></i>
        </button>
    `;
    el.appendChild(header);

    // Bind delete event here or bubble up
    header.querySelector('.btn-delete').addEventListener('click', (e) => {
        e.stopPropagation(); // prevent drag start if clicking delete
        const event = new CustomEvent('widget-delete', {
            detail: { id: config.id },
            bubbles: true
        });
        el.dispatchEvent(event);
    });

    // Content based on type
    let content;
    switch (config.type) {
        case 'clock':
            content = createClock(config);
            break;
        case 'weather':
            content = createWeather(config);
            break;
        case 'atmosphere':
            content = createAtmosphere(config);
            break;
        case 'notes':
            content = createNotes(config);
            break;
        case 'system':
            content = createSystem(config);
            break;
        default:
            content = document.createElement('div');
            content.textContent = 'Unknown Widget';
    }

    content.className = 'flex-1 w-full h-full';
    el.appendChild(content);

    return el;
}

// --- WIDGET IMPLEMENTATIONS ---

function createAtmosphere(config) {
    const container = document.createElement('div');
    container.className = 'flex flex-col h-full justify-between';

    // Initial State
    container.innerHTML = `<div class="text-cyan-800 text-xs animate-pulse">HOME.POD...</div>`;

    // Fetch Data
    const API_URL = '../api/atmosphere.php';

    fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            if (Array.isArray(data) && data.length > 0) {
                // Get latest
                const latest = data[data.length - 1];

                container.innerHTML = `
                    <div class="flex items-start justify-between">
                        <i data-lucide="home" class="w-6 h-6 text-cyan-600"></i>
                        <span class="text-[10px] text-cyan-800 uppercase tracking-wider text-right">Inside<br><span class="text-cyan-600">HomePod</span></span>
                    </div>
                    <div class="mt-2">
                        <div class="text-3xl font-bold text-cyan-400">${latest.temp.toFixed(1)}°</div>
                        <div class="text-xs text-cyan-600">Indoor Temp</div>
                    </div>
                    <div>
                        <div class="text-lg text-cyan-500/80">${latest.humidity}%</div>
                        <div class="text-[10px] text-cyan-700 uppercase">Humidity</div>
                    </div>
                `;
                if (window.lucide) window.lucide.createIcons({ root: container });
            } else {
                container.innerHTML = `<div class="text-red-500 text-xs">NO DATA</div>`;
            }
        })
        .catch(err => {
            container.innerHTML = `<div class="text-red-500 text-[10px]">ERR: ${err.message}</div>`;
        });

    return container;
}

function createClock(config) {
    const container = document.createElement('div');
    container.className = 'flex flex-col items-center justify-center h-full text-cyan-400';

    const timeEl = document.createElement('div');
    timeEl.className = 'text-3xl md:text-4xl font-bold tracking-widest leading-none mb-1';

    const dateEl = document.createElement('div');
    dateEl.className = 'text-xs text-cyan-700 uppercase tracking-[0.2em]';

    const update = () => {
        const now = new Date();
        timeEl.textContent = now.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
        dateEl.textContent = now.toLocaleDateString('pl-PL', { weekday: 'long', day: 'numeric', month: 'long' });
    };

    update();
    setInterval(update, 1000);

    container.appendChild(timeEl);
    container.appendChild(dateEl);
    return container;
}

function createWeather(config) {
    const container = document.createElement('div');
    container.className = 'flex flex-col h-full justify-between cursor-pointer hover:bg-cyan-900/10 transition-colors rounded p-1 -m-1';
    container.title = "Click for Details";

    // Initial State
    container.innerHTML = `
        <div class="flex flex-col items-center justify-center h-full gap-2">
            <i data-lucide="loader" class="w-6 h-6 text-cyan-800 animate-spin"></i>
            <span class="text-[10px] text-cyan-800 uppercase tracking-widest">Scanning...</span>
        </div>
    `;

    // 1. Get Location
    if (!navigator.geolocation) {
        showError("Geo N/A");
        return container;
    }

    navigator.geolocation.getCurrentPosition(
        (pos) => {
            fetchWeather(pos.coords.latitude, pos.coords.longitude);
        },
        (err) => {
            console.warn("Geo Error", err);
            // Fallback to Warsaw
            fetchWeather(52.2297, 21.0122, "Warsaw (Default)");
        }
    );

    function fetchWeather(lat, lon, locationName = null) {
        // 1. Fetch City Name if not provided
        if (!locationName) {
            const geoUrl = `https://geocoding-api.open-meteo.com/v1/reverse?latitude=${lat}&longitude=${lon}&count=1&language=pl&format=json`;
            fetch(geoUrl)
                .then(res => res.json())
                .then(data => {
                    const place = data.results && data.results[0];
                    const name = place ? place.name : "Unknown Loc";
                    // 2. Fetch Weather Logic
                    getWeatherData(lat, lon, name);
                })
                .catch(err => {
                    console.warn("GeoCode API Error", err);
                    getWeatherData(lat, lon, "Local (Geo)");
                });
        } else {
            getWeatherData(lat, lon, locationName);
        }
    }

    function getWeatherData(lat, lon, name) {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;

        fetch(url)
            .then(res => res.json())
            .then(data => {
                renderWeather(data, name);
            })
            .catch(err => {
                showError("API Error");
            });
    }

    function renderWeather(data, locationName) {
        const current = data.current;
        const code = current.weather_code;
        const temp = current.temperature_2m;

        // Simple WMO code map
        let icon = "cloud";
        let label = "Cloudy";
        if (code === 0) { icon = "sun"; label = "Clear"; }
        else if (code >= 1 && code <= 3) { icon = "cloud-sun"; label = "Partly"; } // Shortened
        else if (code >= 51 && code <= 67) { icon = "cloud-drizzle"; label = "Rain"; }
        else if (code >= 71 && code <= 86) { icon = "snowflake"; label = "Snow"; }
        else if (code >= 95) { icon = "cloud-lightning"; label = "Storm"; }

        // Render
        container.innerHTML = `
             <div class="flex items-start justify-between">
                <i data-lucide="${icon}" class="w-6 h-6 text-cyan-500"></i>
                <div class="text-right">
                    <div class="text-xs text-cyan-400 font-bold uppercase tracking-wider leading-none mb-0.5">${locationName}</div>
                    <div class="text-[9px] text-cyan-700 uppercase leading-none">${label}</div>
                </div>
            </div>
            <div class="mt-1">
                <div class="text-3xl font-bold text-cyan-400">${temp.toFixed(1)}°</div>
            </div>
            <div class="flex justify-between items-end border-t border-cyan-900/30 pt-1 mt-1">
                <div>
                    <div class="text-xs text-cyan-500/80">${current.relative_humidity_2m}%</div>
                    <div class="text-[8px] text-cyan-800 uppercase">Hum</div>
                </div>
                <div class="text-right">
                    <div class="text-xs text-cyan-500/80">${current.wind_speed_10m} <span class="text-[8px]">km/h</span></div>
                    <div class="text-[8px] text-cyan-800 uppercase">Wind</div>
                </div>
            </div>
        `;

        // Detailed view
        container.onclick = () => {
            const daily = data.daily;
            alert(`Detailed Forecast for ${locationName}:\nMax: ${daily.temperature_2m_max[0]}°C\nMin: ${daily.temperature_2m_min[0]}°C\nWind: ${current.wind_speed_10m} km/h`);
        };

        if (window.lucide) window.lucide.createIcons({ root: container });
    }

    function showError(msg) {
        container.innerHTML = `<div class="text-red-500 text-xs font-bold text-center mt-4">${msg}</div>`;
    }

    return container;
}

function createNotes(config) {
    const container = document.createElement('textarea');
    container.className = 'w-full h-full bg-transparent resize-none border-none outline-none text-xs text-cyan-300 font-mono p-1 placeholder-cyan-900/50 focus:ring-0 appearance-none';
    container.style.backgroundColor = 'transparent'; // Force transparency
    container.style.color = '#67e8f9'; // Force cyan-300 hex equivalent
    container.placeholder = "// ENTER NOTES...";
    container.value = config.content || '';

    // Auto-save logic
    container.addEventListener('input', () => {
        // Custom event for state management
        const event = new CustomEvent('widget-update', {
            detail: { id: config.id, content: container.value },
            bubbles: true
        });
        container.dispatchEvent(event);
    });

    return container;
}

function createSystem(config) {
    const container = document.createElement('div');
    container.className = 'flex flex-col gap-2 h-full justify-center text-[10px] text-cyan-600 font-mono';

    // User Agent
    const browser = navigator.userAgent.match(/(chrome|safari|firefox|edge)/i)?.[0] || 'Unknown';
    const os = navigator.platform;

    // Screen
    const res = `${window.screen.width}x${window.screen.height}`;

    container.innerHTML = `
        <div class="border-b border-cyan-900/30 pb-1 flex justify-between">
            <span>SYS.OS</span>
            <span class="text-cyan-400">${os}</span>
        </div>
        <div class="border-b border-cyan-900/30 pb-1 flex justify-between">
            <span>BROWSER</span>
            <span class="text-cyan-400">${browser}</span>
        </div>
        <div class="flex justify-between">
            <span>RES</span>
            <span class="text-cyan-400">${res}</span>
        </div>
    `;

    return container;
}
