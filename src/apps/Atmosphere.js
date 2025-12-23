/**
 * Atmosphere App Logic
 * Fetches temperature/humidity data, filters by date, and calculates analytics.
 */

import { SITE_DATA } from '../data/db.js';
import { i18n } from '../utils/i18n.js';

let globalData = [];
let currentDate = new Date(); // Start with "Today"
let chartInstance = null;

// Access API Endpoint from Central Config
const API_URL = SITE_DATA.config.apiEndpoints.atmosphere;

export async function init() {
    console.log('[Atmosphere] Inicjalizacja...');
    const loader = document.getElementById('chart-loader');

    // Button Handlers
    const prevBtn = document.getElementById('prev-date');
    const nextBtn = document.getElementById('next-date');

    if (prevBtn) prevBtn.addEventListener('click', () => changeDate(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => changeDate(1));

    // Subscribe to language changes
    i18n.subscribe(() => updateView());

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
            globalData = data.sort((a, b) => a.timestamp - b.timestamp);

            // Set current date to the date of the last reading (in case data is old)
            const lastEntry = globalData[globalData.length - 1];
            currentDate = new Date(lastEntry.timestamp * 1000); // Use last available data date

            updateView();
        } else {
            console.warn('[Atmosphere] No data received');
            updateCurrentStats([], true);
        }

    } catch (error) {
        console.error('[Atmosphere] Error fetching data:', error);
    } finally {
        if (loader) loader.classList.remove('active');
    }

    // Close chart tooltip when clicking outside
    const closeTooltip = (e) => {
        if (chartInstance && e.target.id !== 'atmosphereChart') {
            chartInstance.setActiveElements([]);
            chartInstance.tooltip.setActiveElements([], { x: 0, y: 0 });
            chartInstance.update();
        }
    };
    document.addEventListener('click', closeTooltip);
    document.addEventListener('touchstart', closeTooltip, { passive: true });
}

function changeDate(days) {
    currentDate.setDate(currentDate.getDate() + days);
    updateView();
}

function updateView() {
    // 1. Update Date Display
    const dateDisplay = document.getElementById('selected-date');
    if (!dateDisplay) return;

    const today = new Date();
    const isToday = isSameDay(currentDate, today);
    const locale = i18n.lang === 'en' ? 'en-US' : 'pl-PL';

    dateDisplay.textContent = isToday ? i18n.t('shared.today') : currentDate.toLocaleDateString(locale, { day: '2-digit', month: '2-digit', year: 'numeric' });

    // Disable "Next" if today (cannot predict future)
    const nextBtn = document.getElementById('next-date');
    if (nextBtn) nextBtn.disabled = isToday;

    // 2. Filter Data for selected day
    const dailyData = globalData.filter(entry => {
        const entryDate = new Date(entry.timestamp * 1000);
        return isSameDay(entryDate, currentDate);
    });

    // 3. Update Components
    updateCurrentStats(dailyData);
    updateDailyAnalytics(dailyData);
    updateTimeOfDayStats(dailyData);
    renderChart(dailyData);
}

function isSameDay(d1, d2) {
    return d1.getFullYear() === d2.getFullYear() &&
        d1.getMonth() === d2.getMonth() &&
        d1.getDate() === d2.getDate();
}

function updateCurrentStats(data, empty = false) {
    const tempEl = document.getElementById('current-temp');
    const humEl = document.getElementById('current-humidity');
    const updateEl = document.getElementById('last-update');
    const locale = i18n.lang === 'en' ? 'en-US' : 'pl-PL';

    if (!tempEl || !humEl || !updateEl) return;

    if (empty || data.length === 0) {
        tempEl.innerHTML = '--<span class="stat-unit">°C</span>';
        humEl.innerHTML = '--<span class="stat-unit">%</span>';
        updateEl.textContent = i18n.t('shared.no_data');
        return;
    }

    // Since 'data' is sorted, the last element is the latest for that day
    const latest = data[data.length - 1];
    const date = new Date(latest.timestamp * 1000);
    const timeStr = date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });

    tempEl.innerHTML = `${latest.temp.toFixed(1)}<span class="stat-unit">°C</span>`;
    humEl.innerHTML = `${latest.humidity.toFixed(0)}<span class="stat-unit">%</span>`;
    updateEl.textContent = `${i18n.t('atmo.last_update')}: ${timeStr}`;
}

function updateDailyAnalytics(data) {
    const minEl = document.getElementById('day-min');
    const maxEl = document.getElementById('day-max');
    const avgEl = document.getElementById('day-avg');
    const humAvgEl = document.getElementById('day-hum-avg');

    if (!minEl) return;

    if (data.length === 0) {
        [minEl, maxEl, avgEl, humAvgEl].forEach(el => {
            if (el) el.textContent = '--';
        });
        return;
    }

    // Min/Max Temp
    const temps = data.map(d => d.temp);
    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);

    // Avg Temp
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;

    // Avg Humidity
    const hums = data.map(d => d.humidity);
    const avgHum = hums.reduce((a, b) => a + b, 0) / hums.length;

    minEl.textContent = minTemp.toFixed(1);
    maxEl.textContent = maxTemp.toFixed(1);
    avgEl.textContent = avgTemp.toFixed(1);
    humAvgEl.textContent = avgHum.toFixed(0);
}

function updateTimeOfDayStats(data) {
    const morningEl = document.getElementById('time-morning');
    const noonEl = document.getElementById('time-noon');
    const eveningEl = document.getElementById('time-evening');
    const nightEl = document.getElementById('time-night');

    if (!morningEl) return;

    // Reset all
    [morningEl, noonEl, eveningEl, nightEl].forEach(el => {
        if (el) el.innerHTML = '--<span class="stat-unit">°C</span>';
    });

    if (data.length === 0) return;

    // Map hour to element: 6=morning, 12=noon, 18=evening, 0=night
    data.forEach(entry => {
        const date = new Date(entry.timestamp * 1000);
        const hour = date.getHours();
        const temp = entry.temp.toFixed(1);
        const html = `${temp}<span class="stat-unit">°C</span>`;

        if (hour >= 5 && hour < 9) {
            morningEl.innerHTML = html; // ~06:00
        } else if (hour >= 11 && hour < 14) {
            noonEl.innerHTML = html; // ~12:00
        } else if (hour >= 17 && hour < 20) {
            eveningEl.innerHTML = html; // ~18:00
        } else if (hour >= 23 || hour < 2) {
            nightEl.innerHTML = html; // ~00:00
        }
    });
}

function renderChart(dailyData) {
    const canvas = document.getElementById('atmosphereChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const locale = i18n.lang === 'en' ? 'en-US' : 'pl-PL';

    if (chartInstance) {
        chartInstance.destroy();
    }

    const labels = dailyData.map(entry => {
        const date = new Date(entry.timestamp * 1000);
        return date.toLocaleTimeString(locale, { hour: '2-digit', minute: '2-digit' });
    });

    const temps = dailyData.map(entry => entry.temp);
    const humidity = dailyData.map(entry => entry.humidity);

    // Gradient for humidity
    const humGradient = ctx.createLinearGradient(0, 0, 0, 400);
    humGradient.addColorStop(0, 'rgba(0, 168, 255, 0.2)');
    humGradient.addColorStop(1, 'rgba(0, 168, 255, 0)');

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: `${i18n.t('atmo.chart.temp')} (°C)`,
                    data: temps,
                    borderColor: '#00ff9d',
                    backgroundColor: '#00ff9d',
                    borderWidth: 2,
                    tension: 0.4,
                    yAxisID: 'y',
                    pointRadius: 2, // Visible dots for few data points
                    pointHoverRadius: 6
                },
                {
                    label: `${i18n.t('atmo.chart.hum')} (%)`,
                    data: humidity,
                    borderColor: '#00a8ff',
                    backgroundColor: humGradient,
                    borderWidth: 1,
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y1',
                    pointRadius: 2,
                    pointHoverRadius: 6
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    align: 'end',
                    labels: {
                        color: 'rgba(255,255,255,0.6)',
                        font: { size: 10, family: 'JetBrains Mono' },
                        boxWidth: 12,
                        padding: 15
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 16, 18, 0.9)',
                    titleColor: '#888',
                    bodyFont: { family: 'JetBrains Mono' },
                    padding: 10,
                    cornerRadius: 8,
                    displayColors: true
                }
            },
            scales: {
                x: {
                    grid: { display: false, drawBorder: false },
                    ticks: {
                        color: 'rgba(255,255,255,0.3)',
                        font: { size: 10, family: 'JetBrains Mono' },
                        maxTicksLimit: 6
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
                    ticks: {
                        color: 'rgba(255,255,255,0.3)',
                        font: { size: 10 }
                    },
                    suggestedMin: 18,
                    suggestedMax: 28
                },
                y1: {
                    type: 'linear',
                    display: false,
                    position: 'right',
                    min: 0,
                    max: 100
                }
            }
        }
    });
}
