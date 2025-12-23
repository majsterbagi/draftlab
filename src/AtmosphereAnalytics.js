/**
 * Atmosphere Analytics - Interactive Range-Based Charts
 * Supports Week, Month, Year ranges with dynamic statistics.
 */

document.addEventListener('DOMContentLoaded', () => {
    initAnalytics();
});

const API_URL = '../api/atmosphere.php';
let globalData = [];
let currentRange = 'week'; // 'week', 'month', 'year'
let chartInstance = null;

async function initAnalytics() {
    const loader = document.getElementById('chart-loader');

    // Range button handlers
    document.querySelectorAll('.range-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentRange = btn.dataset.range;
            updateView();
        });
    });

    try {
        const response = await fetch(API_URL);
        const data = await response.json();

        if (Array.isArray(data) && data.length > 0) {
            globalData = data.sort((a, b) => a.timestamp - b.timestamp);
            updateView();
        } else {
            console.warn('No data received');
            showEmptyState();
        }

    } catch (error) {
        console.error('Error fetching data:', error);
        showEmptyState();
    } finally {
        if (loader) loader.classList.remove('active');
    }

    // Fix for sticky tooltips on mobile
    // Close tooltip when clicking anywhere outside the chart
    document.addEventListener('touchstart', (e) => {
        if (chartInstance && e.target !== chartInstance.canvas) {
            chartInstance.setActiveElements([]);
            chartInstance.tooltip.setActiveElements([], { x: 0, y: 0 });
            chartInstance.update();
        }
    }, { passive: true });
}

function showEmptyState() {
    document.getElementById('range-min').textContent = '--';
    document.getElementById('range-max').textContent = '--';
    document.getElementById('range-avg-temp').textContent = '--';
    document.getElementById('range-avg-hum').textContent = '--';
    document.getElementById('data-count').textContent = 'Brak danych';
}

function updateView() {
    const now = new Date();
    let startDate;

    // Calculate start date based on range
    switch (currentRange) {
        case 'week':
            startDate = new Date(now);
            startDate.setDate(startDate.getDate() - 7);
            break;
        case 'month':
            startDate = new Date(now);
            startDate.setMonth(startDate.getMonth() - 1);
            break;
        case 'year':
            startDate = new Date(now);
            startDate.setFullYear(startDate.getFullYear() - 1);
            break;
    }

    // Filter data for the range
    const rangeData = globalData.filter(entry => {
        const entryDate = new Date(entry.timestamp * 1000);
        return entryDate >= startDate && entryDate <= now;
    });

    // Update UI
    updateChartTitle();
    updateSummaryStats(rangeData);
    updateTimeOfDayAverages(rangeData);
    updateSeasonalAverages(rangeData);
    renderChart(rangeData);
}

function updateChartTitle() {
    const titles = {
        'week': 'Wykres - Ostatni Tydzień',
        'month': 'Wykres - Ostatni Miesiąc',
        'year': 'Wykres - Ostatni Rok'
    };
    document.getElementById('chart-title').textContent = titles[currentRange];
}

function updateSummaryStats(data) {
    const minEl = document.getElementById('range-min');
    const maxEl = document.getElementById('range-max');
    const avgTempEl = document.getElementById('range-avg-temp');
    const avgHumEl = document.getElementById('range-avg-hum');
    const countEl = document.getElementById('data-count');

    if (data.length === 0) {
        [minEl, maxEl, avgTempEl, avgHumEl].forEach(el => el.textContent = '--');
        countEl.textContent = 'Brak danych';
        return;
    }

    const temps = data.map(d => d.temp);
    const hums = data.map(d => d.humidity);

    const minTemp = Math.min(...temps);
    const maxTemp = Math.max(...temps);
    const avgTemp = temps.reduce((a, b) => a + b, 0) / temps.length;
    const avgHum = hums.reduce((a, b) => a + b, 0) / hums.length;

    minEl.textContent = minTemp.toFixed(1);
    maxEl.textContent = maxTemp.toFixed(1);
    avgTempEl.textContent = avgTemp.toFixed(1);
    avgHumEl.textContent = avgHum.toFixed(0);
    countEl.textContent = `${data.length} pomiarów`;
}

function updateTimeOfDayAverages(data) {
    const morningEl = document.getElementById('avg-morning');
    const noonEl = document.getElementById('avg-noon');
    const eveningEl = document.getElementById('avg-evening');
    const nightEl = document.getElementById('avg-night');

    // Reset all
    [morningEl, noonEl, eveningEl, nightEl].forEach(el => el.innerHTML = '--<span class="stat-unit">°C</span>');

    if (data.length === 0) return;

    // Group by time of day
    const morning = [], noon = [], evening = [], night = [];

    data.forEach(entry => {
        const hour = new Date(entry.timestamp * 1000).getHours();

        if (hour >= 5 && hour < 9) {
            morning.push(entry.temp);
        } else if (hour >= 11 && hour < 14) {
            noon.push(entry.temp);
        } else if (hour >= 17 && hour < 20) {
            evening.push(entry.temp);
        } else if (hour >= 23 || hour < 2) {
            night.push(entry.temp);
        }
    });

    const avg = arr => arr.length > 0 ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : '--';

    morningEl.innerHTML = `${avg(morning)}<span class="stat-unit">°C</span>`;
    noonEl.innerHTML = `${avg(noon)}<span class="stat-unit">°C</span>`;
    eveningEl.innerHTML = `${avg(evening)}<span class="stat-unit">°C</span>`;
    nightEl.innerHTML = `${avg(night)}<span class="stat-unit">°C</span>`;
}

function updateSeasonalAverages(data) {
    const springEl = document.getElementById('avg-spring');
    const summerEl = document.getElementById('avg-summer');
    const autumnEl = document.getElementById('avg-autumn');
    const winterEl = document.getElementById('avg-winter');

    // Reset all
    [springEl, summerEl, autumnEl, winterEl].forEach(el => el.innerHTML = '--<span class="stat-unit">°C</span>');

    if (data.length === 0) return;

    // Group by meteorological season
    // Wiosna: Mar (2), Apr (3), May (4)
    // Lato: Jun (5), Jul (6), Aug (7)
    // Jesień: Sep (8), Oct (9), Nov (10)
    // Zima: Dec (11), Jan (0), Feb (1)
    const spring = [], summer = [], autumn = [], winter = [];

    data.forEach(entry => {
        const month = new Date(entry.timestamp * 1000).getMonth();

        if (month >= 2 && month <= 4) {
            spring.push(entry.temp);
        } else if (month >= 5 && month <= 7) {
            summer.push(entry.temp);
        } else if (month >= 8 && month <= 10) {
            autumn.push(entry.temp);
        } else {
            winter.push(entry.temp); // Dec, Jan, Feb
        }
    });

    const avg = arr => arr.length > 0 ? (arr.reduce((a, b) => a + b, 0) / arr.length).toFixed(1) : '--';

    springEl.innerHTML = `${avg(spring)}<span class="stat-unit">°C</span>`;
    summerEl.innerHTML = `${avg(summer)}<span class="stat-unit">°C</span>`;
    autumnEl.innerHTML = `${avg(autumn)}<span class="stat-unit">°C</span>`;
    winterEl.innerHTML = `${avg(winter)}<span class="stat-unit">°C</span>`;
}

function renderChart(data) {
    const ctx = document.getElementById('analyticsChart').getContext('2d');

    if (chartInstance) {
        chartInstance.destroy();
    }

    if (data.length === 0) {
        return;
    }

    // Aggregate data based on range
    let aggregatedData;
    let labelFormat;

    switch (currentRange) {
        case 'week':
            // Show each data point
            aggregatedData = data;
            labelFormat = (ts) => {
                const d = new Date(ts * 1000);
                return d.toLocaleDateString('pl-PL', { weekday: 'short', day: 'numeric' }) + ' ' +
                    d.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
            };
            break;
        case 'month':
            // Aggregate by day
            aggregatedData = aggregateByDay(data);
            labelFormat = (ts) => new Date(ts * 1000).toLocaleDateString('pl-PL', { day: 'numeric', month: 'short' });
            break;
        case 'year':
            // Aggregate by week
            aggregatedData = aggregateByWeek(data);
            labelFormat = (ts) => {
                const d = new Date(ts * 1000);
                const weekNum = getWeekNumber(d);
                return `Tydz. ${weekNum}`;
            };
            break;
    }

    const labels = aggregatedData.map(entry => labelFormat(entry.timestamp));
    const temps = aggregatedData.map(entry => entry.temp);
    const humidity = aggregatedData.map(entry => entry.humidity);

    // Gradient for humidity
    const humGradient = ctx.createLinearGradient(0, 0, 0, 300);
    humGradient.addColorStop(0, 'rgba(0, 168, 255, 0.3)');
    humGradient.addColorStop(1, 'rgba(0, 168, 255, 0)');

    chartInstance = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Temperatura (°C)',
                    data: temps,
                    borderColor: '#00ff9d',
                    backgroundColor: '#00ff9d',
                    borderWidth: 2,
                    tension: 0.3,
                    yAxisID: 'y',
                    pointRadius: currentRange === 'week' ? 3 : 4,
                    pointHoverRadius: 6
                },
                {
                    label: 'Wilgotność (%)',
                    data: humidity,
                    borderColor: '#00a8ff',
                    backgroundColor: humGradient,
                    borderWidth: 1,
                    tension: 0.3,
                    fill: true,
                    yAxisID: 'y1',
                    pointRadius: currentRange === 'week' ? 2 : 3,
                    pointHoverRadius: 5
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
                    labels: {
                        color: 'rgba(255,255,255,0.6)',
                        font: { size: 10, family: 'JetBrains Mono' },
                        boxWidth: 12
                    }
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 16, 18, 0.95)',
                    titleColor: '#888',
                    bodyFont: { family: 'JetBrains Mono' },
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: true
                }
            },
            scales: {
                x: {
                    grid: { display: false, drawBorder: false },
                    ticks: {
                        color: 'rgba(255,255,255,0.3)',
                        font: { size: 9, family: 'JetBrains Mono' },
                        maxRotation: 45,
                        minRotation: 45,
                        maxTicksLimit: currentRange === 'year' ? 12 : (currentRange === 'month' ? 15 : 10)
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: { color: 'rgba(255,255,255,0.05)', drawBorder: false },
                    ticks: {
                        color: 'rgba(255,255,255,0.3)',
                        font: { size: 10 },
                        stepSize: 0.5
                    },
                    title: {
                        display: true,
                        text: '°C',
                        color: 'rgba(255,255,255,0.4)',
                        font: { size: 10 }
                    }
                },
                y1: {
                    type: 'linear',
                    display: true,
                    position: 'right',
                    min: 0,
                    max: 100,
                    grid: { display: false },
                    ticks: {
                        color: 'rgba(0, 168, 255, 0.5)',
                        font: { size: 10 }
                    },
                    title: {
                        display: true,
                        text: '%',
                        color: 'rgba(0, 168, 255, 0.5)',
                        font: { size: 10 }
                    }
                }
            }
        }
    });
}

// Helper: Aggregate data by day (average per day)
function aggregateByDay(data) {
    const days = {};

    data.forEach(entry => {
        const date = new Date(entry.timestamp * 1000);
        const dayKey = date.toISOString().split('T')[0];

        if (!days[dayKey]) {
            days[dayKey] = { temps: [], hums: [], timestamp: entry.timestamp };
        }
        days[dayKey].temps.push(entry.temp);
        days[dayKey].hums.push(entry.humidity);
    });

    return Object.values(days).map(day => ({
        timestamp: day.timestamp,
        temp: day.temps.reduce((a, b) => a + b, 0) / day.temps.length,
        humidity: day.hums.reduce((a, b) => a + b, 0) / day.hums.length
    }));
}

// Helper: Aggregate data by week (average per week)
function aggregateByWeek(data) {
    const weeks = {};

    data.forEach(entry => {
        const date = new Date(entry.timestamp * 1000);
        const weekKey = `${date.getFullYear()}-W${getWeekNumber(date)}`;

        if (!weeks[weekKey]) {
            weeks[weekKey] = { temps: [], hums: [], timestamp: entry.timestamp };
        }
        weeks[weekKey].temps.push(entry.temp);
        weeks[weekKey].hums.push(entry.humidity);
    });

    return Object.values(weeks).map(week => ({
        timestamp: week.timestamp,
        temp: week.temps.reduce((a, b) => a + b, 0) / week.temps.length,
        humidity: week.hums.reduce((a, b) => a + b, 0) / week.hums.length
    }));
}

// Helper: Get ISO week number
function getWeekNumber(date) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d - yearStart) / 86400000) + 1) / 7);
}
