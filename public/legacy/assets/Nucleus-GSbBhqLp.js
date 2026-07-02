import{S as n}from"./main-BKeL_FdE.js";class a extends HTMLElement{constructor(){super()}connectedCallback(){const o=n.config.title,t=window.location.pathname.includes("/apps/")?"../index.html":"index.html";this.innerHTML=`
            <a href="${t}" class="draftlab-logo flex items-center gap-2 group text-white hover:text-tech-green transition-colors">
                <i data-lucide="flask-conical" class="text-tech-green w-5 h-5 stroke-[2.5] fill-tech-green/20 group-hover:fill-tech-green transition-colors"></i>
                <span class="font-bold tracking-tight">${o}</span>
            </a>
            <a href="${t}" class="back-btn">
                <i data-lucide="arrow-left" width="12"></i> POWRÓT
            </a>
        `,window.lucide&&window.lucide.createIcons({root:this,nameAttr:"data-lucide"})}}customElements.define("dl-overlay-header",a);const i={styles:`
        /* --- NUCLEUS SHARED STYLES --- */
        dl-overlay-header {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            box-sizing: border-box;
            padding: 15px 20px;
            padding-top: max(15px, env(safe-area-inset-top));
            z-index: 1000;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background: linear-gradient(to bottom, rgba(0, 0, 0, 0.6), transparent);
            pointer-events: none;
            font-family: 'JetBrains Mono', monospace;
        }

        .draftlab-logo {
            font-weight: 700;
            color: #fff;
            text-decoration: none;
            font-size: 18px;
            display: flex;
            align-items: center;
            gap: 8px;
            pointer-events: auto;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
            transition: opacity 0.2s;
        }
        
        .draftlab-logo:hover {
            opacity: 0.8;
        }

        .back-btn {
            font-size: 12px;
            color: rgba(255, 255, 255, 0.8);
            text-decoration: none;
            background: rgba(255, 255, 255, 0.1);
            padding: 6px 12px;
            border-radius: 4px;
            border: 1px solid rgba(255, 255, 255, 0.2);
            backdrop-filter: blur(4px);
            -webkit-backdrop-filter: blur(4px);
            pointer-events: auto;
            transition: all 0.2s;
            display: flex;
            align-items: center;
            gap: 6px;
        }

        .back-btn:hover {
            background: rgba(255, 255, 255, 0.25);
            color: #fff;
            border-color: #00ff9d;
        }
    `};function r(){const e=document.createElement("style");e.id="draftlab-nucleus-styles",e.textContent=i.styles,document.head.appendChild(e)}function c(){console.log("[Nucleus] Initializing environment (Web Components Mode)..."),r(),console.log("[Nucleus] Ready.")}export{c as i};
