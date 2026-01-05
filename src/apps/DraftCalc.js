
import { i18n } from '../utils/i18n.js';

class DraftCalc {
    constructor() {
        this.state = {
            mode: 'change', // change, percent-of, what-percent, add-sub
            valA: 0,
            valB: 0,
            hasInput: false,
            history: []
        };

        this.elements = {};
        this.init();
    }

    init() {
        this.cacheDOM();
        this.loadHistory();
        this.bindEvents();
        this.updateUI(); // Set labels for initial mode

        // Subscribe to language changes
        i18n.subscribe(() => {
            this.updateUI();
            this.renderHistory();
        });

        // Lucide
        if (window.lucide) window.lucide.createIcons();
    }

    cacheDOM() {
        this.elements = {
            tabs: document.querySelectorAll('.nav-tab'),
            inputA: document.getElementById('input-a'),
            inputB: document.getElementById('input-b'),
            labelA: document.getElementById('label-a'),
            labelB: document.getElementById('label-b'),
            resultContainer: document.getElementById('result-container'),
            resultValue: document.getElementById('result-value'),
            resultDesc: document.getElementById('result-desc'),
            emptyState: document.getElementById('empty-state'),
            visualizer: document.getElementById('visualizer'),
            historyList: document.getElementById('history-list'),
            clearHistoryBtn: document.getElementById('clear-history'),
            sidebar: document.getElementById('sidebar'),
            sidebarOverlay: document.getElementById('sidebar-overlay'),
            toggleHistory: document.getElementById('toggle-history'),
            copyTrigger: document.getElementById('copy-trigger'),
            modeDesc: document.getElementById('mode-desc'),
            operationToggle: document.getElementById('operation-toggle'),
            operationRadios: document.querySelectorAll('input[name="operation"]')
        };
    }

    bindEvents() {
        // Navigation
        this.elements.tabs.forEach(tab => {
            tab.addEventListener('click', () => {
                this.setMode(tab.dataset.mode);
            });
        });

        // Inputs
        ['inputA', 'inputB'].forEach(key => {
            this.elements[key].addEventListener('input', () => this.handleInput());
        });

        // History
        this.elements.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        this.elements.toggleHistory.addEventListener('click', () => this.toggleSidebar(true));
        this.elements.sidebarOverlay.addEventListener('click', () => this.toggleSidebar(false));

        // Copy
        this.elements.copyTrigger.addEventListener('click', () => {
            const val = this.elements.resultValue.textContent;
            navigator.clipboard.writeText(val);
            // Visual feedback
            this.elements.resultValue.style.opacity = '0.5';
            setTimeout(() => this.elements.resultValue.style.opacity = '1', 200);
        });

        // Operation toggle
        this.elements.operationRadios.forEach(radio => {
            radio.addEventListener('change', () => this.calculate());
        });
    }

    setMode(newMode) {
        this.state.mode = newMode;

        // Update Tabs
        this.elements.tabs.forEach(tab => {
            if (tab.dataset.mode === newMode) tab.classList.add('active');
            else tab.classList.remove('active');
        });

        // Reset Inputs
        this.elements.inputA.value = '';
        this.elements.inputB.value = '';
        this.state.valA = 0;
        this.state.valB = 0;
        this.state.hasInput = false;

        // Show/hide operation toggle
        if (newMode === 'add-sub') {
            this.elements.operationToggle.classList.remove('hidden');
        } else {
            this.elements.operationToggle.classList.add('hidden');
        }

        this.updateUI();
        this.calculate();
    }

    updateUI() {
        const labels = {
            'change': [i18n.t('calc.label.old_val'), i18n.t('calc.label.new_val')],
            'percent-of': [i18n.t('calc.label.percent'), i18n.t('calc.label.from_num')],
            'what-percent': [i18n.t('calc.label.part'), i18n.t('calc.label.whole')],
            'add-sub': [i18n.t('calc.label.num'), i18n.t('calc.label.percent')]
        };

        const currentLabels = labels[this.state.mode];
        this.elements.labelA.textContent = currentLabels[0];
        this.elements.labelB.textContent = currentLabels[1];

        // Update Mode Description (no title)
        const modeKey = `calc.mode.${this.state.mode.replace('-', '_')}`;
        this.elements.modeDesc.textContent = i18n.t(`${modeKey}.desc`);

        // Re-translate static elements if lang changed
        i18n.updateStaticElements();
    }

    formatNum(num, decimals = 2) {
        if (typeof num !== 'number') return num;
        return Number.isInteger(num) ? num.toString() : parseFloat(num.toFixed(decimals)).toString();
    }

    handleInput() {
        const rawA = this.elements.inputA.value.replace(',', '.');
        const rawB = this.elements.inputB.value.replace(',', '.');

        if (rawA === '' && rawB === '') {
            this.state.hasInput = false;
        } else {
            this.state.hasInput = true;
            this.state.valA = parseFloat(rawA);
            this.state.valB = parseFloat(rawB);
        }

        this.calculate();
    }

    calculate() {
        if (!this.state.hasInput || isNaN(this.state.valA) || isNaN(this.state.valB)) {
            this.renderEmpty();
            return;
        }

        const { mode, valA: a, valB: b } = this.state;
        let result = 0;
        let formatted = '';
        let desc = '';
        let type = 'neutral';
        let historyDesc = '';

        switch (mode) {
            case 'change':
                if (a === 0) {
                    this.renderResult('∞', 'Nie można dzielić przez zero.', 'neutral');
                    return;
                }
                const diff = b - a;
                result = (diff / a) * 100;
                type = result > 0 ? 'positive' : (result < 0 ? 'negative' : 'neutral');
                formatted = (result > 0 ? '+' : '') + this.formatNum(result) + '%';
                desc = result > 0
                    ? `Wzrost o ${this.formatNum(Math.abs(diff))}`
                    : (result < 0 ? `Spadek o ${this.formatNum(Math.abs(diff))}` : 'Brak zmiany');
                historyDesc = `${this.formatNum(a)} ➝ ${this.formatNum(b)}`;
                break;

            case 'percent-of':
                result = (a / 100) * b;
                formatted = this.formatNum(result);
                desc = `${this.formatNum(a)}% z liczby ${this.formatNum(b)} wynosi ${formatted}`;
                historyDesc = `${this.formatNum(a)}% z ${this.formatNum(b)}`;
                break;

            case 'what-percent':
                if (b === 0) {
                    this.renderResult('Err', 'Dzielenie przez zero', 'neutral');
                    return;
                }
                result = (a / b) * 100;
                formatted = this.formatNum(result) + '%';
                desc = `${this.formatNum(a)} to ${formatted} liczby ${this.formatNum(b)}`;
                historyDesc = `${this.formatNum(a)} to ? z ${this.formatNum(b)}`;
                break;

            case 'add-sub':
                const selectedOperation = document.querySelector('input[name="operation"]:checked')?.value || 'add';
                const part = a * (b / 100);

                if (selectedOperation === 'add') {
                    result = a + part;
                    formatted = this.formatNum(result);
                    desc = `${this.formatNum(a)} + ${this.formatNum(b)}% = ${formatted}`;
                    historyDesc = `${this.formatNum(a)} + ${this.formatNum(b)}%`;
                } else {
                    result = a - part;
                    formatted = this.formatNum(result);
                    desc = `${this.formatNum(a)} - ${this.formatNum(b)}% = ${formatted}`;
                    historyDesc = `${this.formatNum(a)} - ${this.formatNum(b)}%`;
                }
                break;
        }

        this.renderResult(formatted, desc, type);
        this.renderVisuals(mode, a, b, result);

        // Debounce history add
        if (this.historyTimeout) clearTimeout(this.historyTimeout);
        this.historyTimeout = setTimeout(() => {
            this.addToHistory(formatted, historyDesc);
        }, 3000);
    }

    renderEmpty() {
        this.elements.resultContainer.classList.add('hidden');
        this.elements.emptyState.classList.remove('hidden');
        this.elements.visualizer.innerHTML = '<div class="vis-label"><i data-lucide="bar-chart-3" width="12"></i> Wizualizacja</div>';
        if (window.lucide) window.lucide.createIcons();
    }

    renderResult(value, desc, type) {
        this.elements.emptyState.classList.add('hidden');
        this.elements.resultContainer.classList.remove('hidden');

        const resEl = this.elements.resultValue;
        resEl.textContent = value;
        resEl.className = 'result-value-big';
        if (type !== 'neutral') resEl.classList.add(type);

        this.elements.resultDesc.textContent = desc;
    }

    renderVisuals(mode, a, b, res) {
        const container = this.elements.visualizer;

        if (mode === 'change' || mode === 'add-sub') {
            const startVal = Math.abs(a);
            const endVal = mode === 'change' ? Math.abs(b) : Math.abs(res);

            const max = Math.max(startVal, endVal) || 100;
            const hStart = Math.max((startVal / max) * 100, 4);
            const hEnd = Math.max((endVal / max) * 100, 4);

            const isGrowth = mode === 'change' ? (b >= a) : (res >= a);
            const endColor = isGrowth ? '#10b981' : '#f43f5e';
            const startColor = '#475569';

            container.innerHTML = `
                <div class="vis-label"><i data-lucide="bar-chart-3" width="12"></i> Wizualizacja</div>
                <div class="flex items-end justify-center gap-12 w-full h-full pb-6 pt-4">
                     <div class="flex flex-col items-center gap-2 group w-16 h-full justify-end">
                        <span class="text-[9px] text-tech-dim opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">${this.formatNum(a)}</span>
                        <div style="height: ${hStart}%; background-color: ${startColor};" class="w-full border border-white/10 rounded-t-sm transition-all duration-700"></div>
                        <span class="text-[10px] font-bold text-tech-dim uppercase tracking-tighter">Start</span>
                    </div>
                    <div class="flex flex-col items-center gap-2 group w-16 h-full justify-end">
                         <span class="text-[9px] text-tech-dim opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">${mode === 'change' ? this.formatNum(b) : this.formatNum(res)}</span>
                        <div style="height: ${hEnd}%; background-color: ${endColor}; box-shadow: 0 0 20px ${endColor}44;" class="w-full rounded-t-sm transition-all duration-700"></div>
                        <span class="text-[10px] font-bold text-tech-dim uppercase tracking-tighter">Wynik</span>
                    </div>
                </div>
            `;
        }
        else {
            let percent = mode === 'percent-of' ? a : (a / b * 100);
            const displayPercent = isNaN(percent) ? 0 : this.formatNum(percent, 1);
            const barWidth = Math.min(Math.max(parseFloat(displayPercent), 0), 100);

            container.innerHTML = `
                <div class="vis-label"><i data-lucide="bar-chart-3" width="12"></i> Wizualizacja</div>
                <div class="w-full max-w-[400px] flex flex-col items-center gap-4 mb-2">
                     <div class="text-3xl font-black text-white uppercase tracking-[0.2em]">${displayPercent}%</div>
                     <div class="w-full h-4 bg-white/5 rounded-full overflow-hidden p-1 border border-white/10">
                        <div style="width: ${barWidth}%; background: linear-gradient(90deg, #3b82f6, #06b6d4); box-shadow: 0 0 15px rgba(59,130,246,0.3);" class="h-full rounded-full transition-all duration-1000"></div>
                     </div>
                     <div class="flex justify-between w-full text-[10px] text-tech-dim font-mono opacity-50 px-1">
                        <span>0%</span>
                        <span>50%</span>
                        <span>MAX 100%</span>
                     </div>
                </div>
            `;
        }

        if (window.lucide) window.lucide.createIcons();
    }

    addToHistory(result, desc) {
        if (this.state.history.length > 0) {
            const last = this.state.history[0];
            if (last.result === result && last.desc === desc) return;
        }

        const item = {
            id: Date.now(),
            result,
            desc,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        this.state.history.unshift(item);
        if (this.state.history.length > 20) this.state.history.pop();

        this.saveHistory();
        this.renderHistory();
    }

    saveHistory() {
        localStorage.setItem('draftcalc_history', JSON.stringify(this.state.history));
    }

    loadHistory() {
        const saved = localStorage.getItem('draftcalc_history');
        if (saved) {
            this.state.history = JSON.parse(saved);
        }
        this.renderHistory();
    }

    renderHistory() {
        const list = this.elements.historyList;
        list.innerHTML = '';

        if (this.state.history.length === 0) {
            list.innerHTML = `<div class="p-4 text-center text-tech-dim opacity-50 text-xs">Brak historii działań.</div>`;
            return;
        }

        this.state.history.forEach(item => {
            const el = document.createElement('div');
            el.className = 'history-item group';
            el.innerHTML = `
                <div class="history-time">${item.time}</div>
                <div class="history-desc">${item.desc}</div>
                <div class="flex justify-between items-center">
                    <span class="history-res">${item.result}</span>
                    <i data-lucide="copy" width="12" class="opacity-0 group-hover:opacity-100 text-tech-dim hover:text-white transition-opacity"></i>
                </div>
            `;
            el.onclick = () => {
                navigator.clipboard.writeText(item.result);
                el.style.background = 'rgba(255,255,255,0.1)';
                setTimeout(() => el.style.background = '', 200);
            };
            list.appendChild(el);
        });

        if (window.lucide) window.lucide.createIcons();
    }

    clearHistory() {
        this.state.history = [];
        this.saveHistory();
        this.renderHistory();
    }

    toggleSidebar(show) {
        if (show) {
            this.elements.sidebar.classList.add('active');
            this.elements.sidebarOverlay.classList.add('active');
        } else {
            this.elements.sidebar.classList.remove('active');
            this.elements.sidebarOverlay.classList.remove('active');
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new DraftCalc();
});
