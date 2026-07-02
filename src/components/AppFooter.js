import { SITE_DATA } from '../data/db.js';
import { i18n } from '../utils/i18n.js';

class AppFooter extends HTMLElement {

    connectedCallback() {
        // Ensure the custom element itself takes full width
        this.style.display = 'block';
        this.style.width = '100%';

        this.render();
        i18n.subscribe(() => this.render());
    }

    render() {
        // Determine correct path to API depending on where we are
        const isSubdir = window.location.pathname.includes('/apps/');
        const basePrefix = isSubdir ? '../' : '';
        const apiPath = basePrefix + 'api/visit_counter.php';
        const lang = i18n.lang;

        const txtCopyright = i18n.t('footer.copyright');

        const navLinks = SITE_DATA.menu.map(link => {
            const name = lang === 'pl' ? link.name : (link.name_en || link.name);
            return `<a href="${basePrefix}${link.url}" class="block text-tech-dim hover:text-tech-green transition-colors py-1">${name}</a>`;
        }).join('');

        this.innerHTML = `
            <footer class="w-full border-t border-white/10 bg-tech-surface/60 backdrop-blur-sm mt-auto relative z-10">
                <div class="max-w-7xl mx-auto px-4 py-10">
                    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
                        <!-- Brand -->
                        <div>
                            <div class="flex items-center gap-2 mb-3">
                                <i data-lucide="flask-conical" class="text-tech-green w-5 h-5"></i>
                                <span class="font-bold text-white">DraftLab.pl</span>
                            </div>
                            <p class="text-xs text-tech-dim leading-relaxed max-w-xs">${i18n.t('hero.subtitle').replace(/<[^>]*>/g, ' ')}</p>
                        </div>

                        <!-- Navigation -->
                        <div>
                            <p class="text-[10px] tracking-widest text-tech-green/70 font-bold mb-3">${i18n.t('footer.nav')}</p>
                            <nav class="text-xs">
                                ${navLinks}
                                <a href="${basePrefix}legacy/index.html" title="${i18n.t('ui.legacy_title')}"
                                   class="flex items-center gap-1.5 text-tech-dim hover:text-tech-green transition-colors py-1">
                                    <i data-lucide="history" class="w-3.5 h-3.5"></i> ${i18n.t('ui.legacy')}
                                </a>
                            </nav>
                        </div>

                        <!-- System -->
                        <div>
                            <p class="text-[10px] tracking-widest text-tech-green/70 font-bold mb-3">${i18n.t('footer.system')}</p>
                            <div class="text-[11px] text-tech-dim space-y-1.5 font-mono">
                                <p>STATUS: <span class="text-tech-green">ONLINE</span> <span class="inline-block w-1.5 h-1.5 rounded-full bg-tech-green animate-pulse ml-1"></span></p>
                                <p>VERSION: <span class="text-white">2.0.0</span></p>
                                <p id="visit-counter" class="hidden">VISITORS: <span class="text-white">...</span></p>
                                <p class="pt-2 text-tech-dim/60">${i18n.t('footer.legacy_note')}
                                    <a href="${basePrefix}legacy/index.html" class="text-tech-green/80 hover:text-tech-green underline underline-offset-2">v1.0 →</a>
                                </p>
                            </div>
                        </div>
                    </div>

                    <div class="border-t border-white/5 pt-5 flex flex-col sm:flex-row justify-between items-center gap-3">
                        <p class="text-tech-dim text-xs font-mono">${txtCopyright} ${i18n.t('footer.rights')}</p>
                        <button id="back-to-top" class="flex items-center gap-1.5 text-[11px] text-tech-dim hover:text-tech-green transition-colors">
                            <i data-lucide="arrow-up" class="w-3.5 h-3.5"></i> ${i18n.t('footer.back_top')}
                        </button>
                    </div>
                </div>
            </footer>
        `;

        const topBtn = this.querySelector('#back-to-top');
        if (topBtn) {
            topBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
        }

        if (window.lucide) {
            window.lucide.createIcons({ root: this, nameAttr: 'data-lucide' });
        }

        // Fetch visitor count with timeout and checks
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 3000);

        if (navigator.onLine) {
            fetch(apiPath, { signal: controller.signal })
                .then(response => {
                    clearTimeout(timeoutId);
                    if (!response.ok) throw new Error('Network response was not ok');
                    const contentType = response.headers.get("content-type");
                    if (!contentType || !contentType.includes("application/json")) {
                        throw new Error("Not JSON response");
                    }
                    return response.json();
                })
                .then(data => {
                    const counterEl = this.querySelector('#visit-counter');
                    if (counterEl && data.count) {
                        counterEl.querySelector('span').textContent = data.count;
                        counterEl.classList.remove('hidden');
                    }
                })
                .catch(() => {
                    clearTimeout(timeoutId);
                    // Silently fail
                });
        }
    }
}
customElements.define('dl-footer', AppFooter);
