class AppFooter extends HTMLElement {
    connectedCallback() {
        const year = new Date().getFullYear();

        // Determine correct path to API depending on where we are
        const isSubdir = window.location.pathname.includes('/apps/');
        const apiPath = isSubdir ? '../api/visit_counter.php' : 'api/visit_counter.php';

        this.innerHTML = `
            <footer class="w-full border-t border-tech-gray bg-tech-bg py-8 mt-auto relative z-10">
                <div class="max-w-7xl mx-auto px-4 text-center">
                    <p class="text-tech-dim text-xs font-mono mb-2">DRAFTLAB.PL SYSTEM © ${year}</p>
                    <div class="text-[10px] text-tech-dim/50 font-mono flex justify-center gap-4">
                        <span>STATUS: <span class="text-tech-green">ONLINE</span></span>
                        <span>VERSION: 1.0.2</span>
                        <span id="visit-counter" class="hidden">VISITORS: <span class="text-white">...</span></span>
                    </div>
                </div>
            </footer>
        `;

        // Fetch visitor count
        fetch(apiPath)
            .then(response => response.json())
            .then(data => {
                const counterEl = this.querySelector('#visit-counter');
                if (counterEl && data.count) {
                    counterEl.querySelector('span').textContent = data.count;
                    counterEl.classList.remove('hidden');
                }
            })
            .catch(err => console.warn('Counter API unavailable locally or blocked'));
    }
}
customElements.define('dl-footer', AppFooter);