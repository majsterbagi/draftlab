class AppFooter extends HTMLElement {
    connectedCallback() {
        const year = new Date().getFullYear();
        this.innerHTML = `
            <footer class="w-full border-t border-tech-gray bg-tech-bg py-8 mt-auto relative z-10">
                <div class="max-w-7xl mx-auto px-4 text-center">
                    <p class="text-tech-dim text-xs font-mono mb-2">DRAFTLAB.PL SYSTEM © ${year}</p>
                    <div class="text-[10px] text-tech-dim/50 font-mono">
                        STATUS: <span class="text-tech-green">ONLINE</span> | VERSION: 1.0.2
                    </div>
                </div>
            </footer>
        `;
    }
}
customElements.define('dl-footer', AppFooter);