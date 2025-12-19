/**
 * Atmosphere App Logic
 * Fetches temperature/humidity data and renders chart.
 */

document.addEventListener('DOMContentLoaded', () => {
    initAtmosphere();
});

const API_URL = '../api/atmosphere.php';

async function initAtmosphere() {
    const loader = document.getElementById('chart-loader');

    try {
        // Fetch data
        const response = await fetch(API_URL);
        const data = await response.json();

        // Process Data
        if (Array.isArray(data) && data.length > 0) {
            updateCurrentStats(data);
            renderChart(data);
        } else {
            console.warn('No data received or empty array');
            updateCurrentStats([], true); // Show placeholders
        }

    } catch (error) {
        console.error('Error fetching data:', error);
    } finally {
        if (loader) loader.classList.remove('active');
    }
}

function updateCurrentStats(data, empty = false) {
    const tempEl = document.getElementById('current-temp');
    const humEl = document.getElementById('current-humidity');
    const updateEl = document.getElementById('last-update');

    if (empty || data.length === 0) {
        tempEl.innerHTML = '--<span class="stat-unit">°C</span>';
        humEl.innerHTML = '--<span class="stat-unit">%</span>';
        updateEl.textContent = 'NO DATA';
        return;
    }

    // Get latest entry (assuming data is appended chronologically)
    const latest = data[data.length - 1];

    // Format timestamp
    const date = new Date(latest.timestamp * 1000);
    const timeStr = date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });

    tempEl.innerHTML = `${latest.temp.toFixed(1)}<span class="stat-unit">°C</span>`;
    humEl.innerHTML = `${latest.humidity.toFixed(0)}<span class="stat-unit">%</span>`;
    updateEl.textContent = `${timeStr}`;
}

function renderChart(rawData) {
    const ctx = document.getElementById('atmosphereChart').getContext('2d');

    // Filter last 24h? For now take all, or slice last 24
    // Let's ensure we sort by timestamp just in case
    const sortedData = rawData.sort((a, b) => a.timestamp - b.timestamp);

    // Take last 24 points (assuming hourly) or just last N
    // Let's show last 12-24 entires for clarity
    const chartData = sortedData.slice(-24);

    const labels = chartData.map(entry => {
        const date = new Date(entry.timestamp * 1000);
        return date.toLocaleTimeString('pl-PL', { hour: '2-digit', minute: '2-digit' });
    });

    const temps = chartData.map(entry => entry.temp);
    const humidity = chartData.map(entry => entry.humidity);

    // Gradient for humidity
    const humGradient = ctx.createLinearGradient(0, 0, 0, 400);
    humGradient.addColorStop(0, 'rgba(0, 168, 255, 0.2)');
    humGradient.addColorStop(1, 'rgba(0, 168, 255, 0)');

    new Chart(ctx, {
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
                    tension: 0.4, // Smooth curves
                    yAxisID: 'y',
                    pointRadius: 0, // Clean look, dots on hover
                    pointHoverRadius: 4
                },
                {
                    label: 'Wilgotność (%)',
                    data: humidity,
                    borderColor: '#00a8ff',
                    backgroundColor: humGradient,
                    borderWidth: 1,
                    tension: 0.4,
                    fill: true,
                    yAxisID: 'y1',
                    pointRadius: 0,
                    pointHoverRadius: 4
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false, // Fill container
            interaction: {
                mode: 'index',
                intersect: false,
            },
            plugins: {
                legend: {
                    display: false // Minimalist look
                },
                tooltip: {
                    backgroundColor: 'rgba(15, 16, 18, 0.9)',
                    titleColor: '#888',
                    bodyFont: {
                        family: 'JetBrains Mono'
                    },
                    padding: 10,
                    cornerRadius: 8,
                    displayColors: true
                }
            },
            scales: {
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: 'rgba(255,255,255,0.3)',
                        font: {
                            size: 10,
                            family: 'JetBrains Mono'
                        },
                        maxTicksLimit: 6
                    }
                },
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    grid: {
                        color: 'rgba(255,255,255,0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: 'rgba(255,255,255,0.3)',
                        font: { size: 10 }
                    },
                    suggestedMin: 15, // Keep temp scale reasonable
                    suggestedMax: 30
                },
                y1: {
                    type: 'linear',
                    display: false, // Hide humidity axis to reduce clutter
                    position: 'right',
                    grid: {
                        drawOnChartArea: false,
                    },
                    min: 0,
                    max: 100
                }
            }
        }
    });
}
