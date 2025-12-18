import { SITE_DATA } from '../data/db.js';

class AppHeader extends HTMLElement {
    connectedCallback() {
        const currentPath = window.location.pathname;
        
        // Linki Desktop
        const desktopLinks = SITE_DATA.menu.map(link => {
            const isActive = currentPath.includes(link.url) || (link.url === 'index.html' && currentPath.endsWith('/'));
            return `
                <a href="${link.url}" class="text-sm tracking-widest hover:text-tech-green transition-colors ${isActive ? 'text-tech-green font-bold' : 'text-tech-dim'}">
                    ${isActive ? '<span class="animate-pulse">></span> ' : ''}${link.name}
                </a>
            `;
        }).join('');

        // Linki Mobile (Poprawione stylowanie)
        const mobileLinks = SITE_DATA.menu.map(link => {
            const isActive = currentPath.includes(link.url) || (link.url === 'index.html' && currentPath.endsWith('/'));
            return `
                <a href="${link.url}" class="block text-2xl font-bold tracking-widest py-6 border-b border-tech-gray/20 hover:text-tech-green transition-colors w-full text-center ${isActive ? 'text-tech-green' : 'text-white'}">
                    ${isActive ? '> ' : ''}${link.name}
                </a>
            `;
        }).join('');

        this.innerHTML = `
            <header class="border-b border-tech-gray bg-tech-bg/95 backdrop-blur-sm sticky top-0 z-50">
                <div class="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center relative z-50 bg-tech-bg/95">
                    
                    <a href="index.html" class="flex items-center gap-2 group">
                        <div class="w-3 h-3 bg-tech-green rounded-full shadow-[0_0_10px_#00ff9d] group-hover:animate-pulse transition-colors"></div>
                        <span class="text-lg font-bold tracking-tighter text-white">DraftLab<span class="text-tech-dim">.pl</span></span>
                    </a>
                    
                    <nav class="hidden sm:flex gap-8">
                        ${desktopLinks}
                    </nav>
                    
                    <button id="menu-btn" class="sm:hidden text-tech-green text-xs font-bold tracking-widest border border-tech-green/50 px-4 py-2 hover:bg-tech-green hover:text-black transition-colors uppercase">
                        MENU
                    </button>
                </div>

                <div id="mobile-menu" class="fixed top-0 left-0 w-full h-[100dvh] bg-tech-bg z-40 flex flex-col items-center justify-start pt-32 opacity-0 pointer-events-none transition-all duration-300 transform translate-y-[-10px]">
                    <nav class="w-full px-8 max-w-sm flex flex-col gap-2">
                        ${mobileLinks}
                    </nav>
                    
                    <div class="mt-auto mb-12 text-center">
                        <p class="text-[10px] text-tech-dim font-mono">SYSTEM STATUS: <span class="text-tech-green">ONLINE</span></p>
                    </div>
                </div>
            </header>
        `;

        // Logika
        const btn = this.querySelector('#menu-btn');
        const menu = this.querySelector('#mobile-menu');
        let isOpen = false;

        btn.addEventListener('click', () => {
            isOpen = !isOpen;
            if (isOpen) {
                // Otwieranie
                menu.classList.remove('opacity-0', 'pointer-events-none', 'translate-y-[-10px]');
                menu.classList.add('opacity-100', 'pointer-events-auto', 'translate-y-0');
                
                // Zmiana przycisku
                btn.innerText = "CLOSE";
                btn.classList.add('bg-tech-green', 'text-black');
                
                // Blokada scrollowania tła
                document.body.style.overflow = 'hidden';
            } else {
                // Zamykanie
                menu.classList.add('opacity-0', 'pointer-events-none', 'translate-y-[-10px]');
                menu.classList.remove('opacity-100', 'pointer-events-auto', 'translate-y-0');
                
                btn.innerText = "MENU";
                btn.classList.remove('bg-tech-green', 'text-black');
                
                // Odblokowanie scrollowania
                document.body.style.overflow = '';
            }
        });
    }
}
customElements.define('dl-header', AppHeader);