import{i as o,S as c}from"./main-BKeL_FdE.js";/* empty css              */import{G as h}from"./git_log_data-Bh3yA43S.js";document.addEventListener("DOMContentLoaded",()=>{o.updateStaticElements(),o.subscribe(()=>{o.updateStaticElements(),document.documentElement.lang=o.lang})});class b extends HTMLElement{constructor(){super(),this.filter="ALL",this.combinedLogs=[]}connectedCallback(){this.prepareData(),this.render()}prepareData(){const s=[];c&&c.projects&&c.projects.forEach(t=>{t.changes&&t.changes.forEach(r=>{s.push({source:"APP",date:r.date,type:r.type,desc:r.desc,component:t.title.toUpperCase(),projectColor:t.color,raw:r})})});const n=h.map(t=>({source:"SYSTEM",date:t.date,type:t.type,desc:t.desc,component:(t.component||"SYS").toUpperCase(),hash:t.hash,raw:t})),i=[...s,...n],a=new Set,e=i.filter(t=>{const r=t.desc;return a.has(r)?!1:(a.add(r),!0)});this.combinedLogs=e.sort((t,r)=>new Date(r.date)-new Date(t.date))}setFilter(s){this.filter=s,this.render()}render(){let s=this.combinedLogs;this.filter==="APPS"&&(s=this.combinedLogs.filter(e=>e.source==="APP")),this.filter==="SYSTEM"&&(s=this.combinedLogs.filter(e=>e.source==="SYSTEM"));const n=s.slice(0,3),i=e=>{const t="px-4 py-2 text-[10px] font-bold uppercase tracking-widest border transition-all cursor-pointer";return this.filter===e?`${t} bg-tech-green text-black border-tech-green`:`${t} bg-transparent text-tech-dim border-tech-gray hover:text-white hover:border-white`},a=n.map(e=>{let t="text-tech-dim",r="bg-tech-dim/10";(e.type==="FEAT"||e.type==="FEATURE"||e.type==="INIT")&&(t="text-tech-green",r="bg-tech-green/10"),(e.type==="MAJOR"||e.type==="CORE")&&(t="text-yellow-400",r="bg-yellow-400/10"),(e.type==="FIX"||e.type==="HOTFIX")&&(t="text-blue-400",r="bg-blue-400/10"),(e.type==="STYLE"||e.type==="VISUAL")&&(t="text-purple-400",r="bg-purple-400/10"),e.type==="REVERT"&&(t="text-red-400",r="bg-red-400/10");const d=e.date.split(" "),p=d[0]||e.date,l=d[1]||"";return`
            <tr class="hover:bg-white/[0.02] transition-colors group">
                <td class="py-3 px-6 border-r border-tech-gray/10 text-tech-dim">
                    <div class="flex flex-col">
                        <span class="font-bold text-white/70 group-hover:text-white transition-colors">${p}</span>
                        <span class="text-[10px] opacity-50">${l}</span>
                    </div>
                </td>
                <td class="py-3 px-4 border-r border-tech-gray/10 text-center">
                    <span class="text-[10px] font-bold tracking-wider text-white bg-white/5 px-2 py-1 rounded border border-white/5 group-hover:border-white/20 transition-colors">
                        ${e.component}
                    </span>
                </td>
                <td class="py-3 px-4 border-r border-tech-gray/10 text-center">
                     <span class="text-[10px] font-bold px-2 py-1 rounded border border-transparent ${t} ${r}">
                        ${e.type}
                     </span>
                </td>
                <td class="py-3 px-6">
                    <p class="text-white/80 leading-relaxed max-w-2xl group-hover:text-white transition-colors">
                        ${e.desc}
                    </p>
                    ${e.hash?`<span class="text-[10px] text-tech-dim/30 mt-1 block">SHA: ${e.hash}</span>`:""}
                </td>
            </tr>
            `}).join("");this.innerHTML=`
            <div class="bg-[#0f0f0f] border border-tech-gray p-0 relative overflow-hidden">
                <!-- Toolbar -->
                <div class="border-b border-tech-gray p-4 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/[0.02]">
                    <div class="flex items-center gap-3">
                        <i data-lucide="layers" class="text-tech-green"></i>
                        <h3 class="text-white font-bold uppercase tracking-widest text-sm">Dziennik Zmian</h3>
                    </div>
                    
                    <div class="flex gap-2">
                        <button id="btn-all" class="${i("ALL")}">Wszystkie</button>
                        <button id="btn-apps" class="${i("APPS")}">Aplikacje</button>
                        <button id="btn-system" class="${i("SYSTEM")}">System</button>
                    </div>
                </div>

                <!-- Content -->
                <div class="p-0 overflow-x-auto">
                    <table class="w-full text-left border-collapse">
                        <thead class="bg-white/5 text-[10px] uppercase tracking-widest text-tech-dim font-bold border-b border-tech-gray">
                            <tr>
                                <th class="py-3 px-6 w-32 border-r border-tech-gray/30">Data</th>
                                <th class="py-3 px-4 w-24 border-r border-tech-gray/30 text-center">Moduł</th>
                                <th class="py-3 px-4 w-20 border-r border-tech-gray/30 text-center">Typ</th>
                                <th class="py-3 px-6">Opis Zmiany</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-tech-gray/20 font-mono text-xs">
                            ${a.length>0?a:'<tr><td colspan="4" class="text-center py-8 text-tech-dim">Brak wpisów.</td></tr>'}
                        </tbody>
                    </table>
                </div>

                <!-- Footer -->
                <div class="border-t border-tech-gray/30 p-4 bg-white/[0.02] flex justify-center">
                     <a href="./apps/system-log.html" class="w-full text-center px-4 py-3 bg-white/5 border border-tech-gray/50 hover:bg-tech-green hover:text-black hover:border-tech-green transition-all text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 group">
                        Pełny Rejestr Systemowy
                        <i data-lucide="arrow-right" width="14" class="group-hover:translate-x-1 transition-transform"></i>
                     </a>
                </div>
            </div>
        `,this.querySelector("#btn-all").addEventListener("click",()=>this.setFilter("ALL")),this.querySelector("#btn-apps").addEventListener("click",()=>this.setFilter("APPS")),this.querySelector("#btn-system").addEventListener("click",()=>this.setFilter("SYSTEM")),window.lucide&&window.lucide.createIcons()}}customElements.define("dl-unified-log",b);
