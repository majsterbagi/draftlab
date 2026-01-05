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
        const year = new Date().getFullYear();

        // Determine correct path to API depending on where we are
        const isSubdir = window.location.pathname.includes('/apps/');
        const apiPath = isSubdir ? '../api/visit_counter.php' : 'api/visit_counter.php';

        const txtCopyright = i18n.t('footer.copyright');

        this.innerHTML = `
            <footer class="w-full border-t border-tech-gray bg-tech-bg py-8 mt-auto relative z-10">
                <div class="max-w-7xl mx-auto px-4 text-center">
                    <p class="text-tech-dim text-xs font-mono mb-2">${txtCopyright}</p>
                    <div class="text-[10px] text-tech-dim/50 font-mono flex justify-center gap-4">
                        <span>STATUS: <span class="text-tech-green">ONLINE</span></span>
                        <span>VERSION: 1.0.2</span>
                        <span id="visit-counter" class="hidden">VISITORS: <span class="text-white">...</span></span>
                    </div>
                </div>
            </footer>
        `;

        // Fetch visitor count with timeout and checks
        // Only fetch once or ensure it doesn't spam if re-rendering often?
        // Since footer is static mostly, it's fine.

        // Check if we already have the counter loaded to avoid refetching?
        // But since this.innerHTML wipes it, we need to refetch or store state.
        // Let's just refetch, it's cheap JSON. 

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
                .catch(err => {
                    clearTimeout(timeoutId);
                    // Silently fail - console.debug only
                    // console.debug('Counter API skipped:', err.message);
                });
        }
    }
}
customElements.define('dl-footer', AppFooter);