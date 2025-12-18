import { SITE_DATA } from '../data/db.js';

class NewsFeed extends HTMLElement {
    connectedCallback() {
        console.log("NewsFeed: Inicjalizacja...");
        
        try {
            // Walidacja danych
            if (!SITE_DATA || !SITE_DATA.news || SITE_DATA.news.length === 0) {
                console.warn("NewsFeed: Brak danych w db.js");
                this.innerHTML = `<div class="p-4 text-tech-dim text-xs border border-tech-gray border-dashed">BRAK LOGÓW SYSTEMOWYCH</div>`;
                return;
            }

            const newsHtml = SITE_DATA.news.map((item, index) => `
                <div class="group relative pl-6 pb-8 border-l border-tech-gray last:pb-0 last:border-0">
                    <div class="absolute -left-[5px] top-0 w-2.5 h-2.5 rounded-full bg-tech-gray border border-tech-bg group-hover:bg-tech-green transition-colors"></div>
                    
                    <div class="text-xs text-tech-dim font-mono mb-1">
                        ${item.date} <span class="text-tech-green/50">:: LOG_0${SITE_DATA.news.length - index}</span>
                    </div>
                    
                    <h4 class="text-white font-bold text-sm mb-1 group-hover:text-tech-green transition-colors">${item.title}</h4>
                    <p class="text-tech-dim text-sm leading-relaxed max-w-prose">
                        ${item.content}
                    </p>
                </div>
            `).join('');

            this.innerHTML = `
                <div class="bg-[#0f0f0f] border border-tech-gray p-6 relative overflow-hidden">
                    <div class="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                        <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                    </div>
                    <div class="mt-2 relative z-10">
                        ${newsHtml}
                    </div>
                </div>
            `;
            console.log("NewsFeed: Załadowano pomyślnie.");
            
        } catch (err) {
            console.error("NewsFeed Error:", err);
            this.innerHTML = `<div class="text-red-500 text-xs">ERR: NEWS_RENDER_FAIL</div>`;
        }
    }
}
customElements.define('dl-news', NewsFeed);