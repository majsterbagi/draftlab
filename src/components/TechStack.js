import { SITE_DATA } from '../data/db.js';

class TechStack extends HTMLElement {
    constructor() {
        super();
    }

    connectedCallback() {
        const stack = SITE_DATA.config.techStack;

        const listItems = stack.map(item => `
            <li class="flex items-center gap-3">
                <span class="w-1.5 h-1.5 bg-tech-green rounded-full shadow-[0_0_5px_#00ff9d]"></span>
                <span class="text-white font-bold opacity-80 min-w-[60px] text-[10px] tracking-tighter uppercase">${item.label}:</span>
                <span>${item.value}</span>
            </li>
        `).join('');

        this.innerHTML = `
            <ul class="text-sm text-tech-dim space-y-3 border border-tech-gray/30 p-6 bg-[#0f0f0f]/30 border-dashed">
                ${listItems}
            </ul>
        `;
    }
}

customElements.define('dl-tech-stack', TechStack);
