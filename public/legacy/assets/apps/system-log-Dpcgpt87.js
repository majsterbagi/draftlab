import{i as a}from"../main-BKeL_FdE.js";/* empty css               */import{G as o}from"../git_log_data-Bh3yA43S.js";let s=1;const c=10;let g="ALL",d=[];const u=["ATMOSPHERE","SUNTRACK","DRAFTCARGO","NUCLEUS"],f=document.getElementById("log-container"),T=document.getElementById("stat-total"),E=document.getElementById("stat-updates"),w=document.getElementById("detail-modal"),m=document.getElementById("modal-type"),v=document.getElementById("modal-component"),I=document.getElementById("modal-date"),L=document.getElementById("modal-hash"),S=document.getElementById("modal-desc"),A=document.getElementById("modal-details");window.openLogDetail=n=>{const e=o.find(p=>p.hash===n);if(!e)return;v.innerText=(e.component||"SYSTEM").toUpperCase(),I.innerText=e.date,L.innerText="#"+e.hash,S.innerText=e.desc,A.innerText=e.details||a.t("sys.modal.empty"),m.className="text-[10px] font-bold px-2 py-1 rounded border";let t="text-tech-dim bg-tech-dim/10 border-tech-dim/20";["FEAT","FEATURE","INIT"].includes(e.type)&&(t="text-tech-green bg-tech-green/10 border-tech-green/20"),["FIX","HOTFIX"].includes(e.type)&&(t="text-blue-400 bg-blue-400/10 border-blue-400/20"),["STYLE","VISUAL","STYL"].includes(e.type)&&(t="text-purple-400 bg-purple-400/10 border-purple-400/20"),["DOCS","DOKU"].includes(e.type)&&(t="text-yellow-400 bg-yellow-400/10 border-yellow-400/20"),m.classList.add(...t.split(" ")),m.innerText=e.type,w.showModal()};function x(){g==="ALL"?d=o:g==="APPS"?d=o.filter(n=>u.includes(n.component?.toUpperCase())):d=o.filter(n=>!u.includes(n.component?.toUpperCase()))}function l(){const n=(s-1)*c,e=n+c,t=d.slice(n,e);T.innerText=o.length,E.innerText=d.length,document.getElementById("page-current").innerText=s,document.getElementById("page-total").innerText=Math.max(1,Math.ceil(d.length/c)),document.getElementById("btn-prev").disabled=s===1,document.getElementById("btn-next").disabled=e>=d.length;const p=t.map(r=>{let i="text-tech-dim bg-tech-dim/10 border-tech-dim/20";["FEAT","FEATURE","INIT"].includes(r.type)&&(i="text-tech-green bg-tech-green/10 border-tech-green/20"),["FIX","HOTFIX"].includes(r.type)&&(i="text-blue-400 bg-blue-400/10 border-blue-400/20"),["STYLE","VISUAL","STYL"].includes(r.type)&&(i="text-purple-400 bg-purple-400/10 border-purple-400/20"),r.type==="REVERT"&&(i="text-red-400 bg-red-400/10 border-red-400/20");const[b,h]=r.date.split(" "),y=h?`<span class="text-tech-green/80 ml-1">${h}</span>`:"";return`
                <div onclick="window.openLogDetail('${r.hash}')" class="relative pl-8 md:pl-12 py-6 group hover:bg-white/[0.02] transition-colors pr-4 rounded-r-xl border-b border-tech-gray/30 last:border-0 cursor-pointer">
                    <div class="absolute -left-[5px] top-8 w-2.5 h-2.5 rounded-full bg-[#0f0f0f] border border-tech-gray group-hover:border-tech-green group-hover:scale-125 transition-all z-10"></div>
                    
                    <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                        <div class="flex items-center gap-3">
                            <span class="text-[10px] font-bold px-2 py-1 rounded border ${i}">${r.type}</span>
                            <span class="text-white font-bold text-sm tracking-wide">${(r.component||"SYSTEM").toUpperCase()}</span>
                        </div>
                        
                        <div class="flex items-center gap-4 text-xs font-mono text-tech-dim">
                            <span class="flex items-center gap-1.5">
                                <i data-lucide="calendar" width="12"></i>
                                ${b} ${y}
                            </span>
                            <span class="flex items-center gap-1.5 px-2 py-0.5 bg-white/5 rounded text-tech-dim/70">
                                <i data-lucide="hash" width="10"></i>
                                ${r.hash}
                            </span>
                        </div>
                    </div>
                    
                    <p class="text-tech-dim/90 text-sm leading-relaxed max-w-3xl group-hover:text-white transition-colors">
                        ${r.desc}
                    </p>
                    
                    ${r.details?`
                        <div class="mt-2 text-[10px] text-tech-dim uppercase tracking-widest flex items-center gap-2">
                             <i data-lucide="info" width="12"></i> ${a.t("sys.item.has_details")}
                        </div>
                    `:""}

                    <div class="mt-3 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] text-tech-green uppercase tracking-widest flex items-center gap-1">
                        ${a.t("sys.item.tech_details")} <i data-lucide="arrow-right" width="10"></i>
                    </div>
                </div>
                `}).join("");f.innerHTML=p,lucide.createIcons()}window.setFilter=n=>{g=n,s=1,document.querySelectorAll(".filter-btn").forEach(t=>{t.classList.remove("active"),t.classList.remove("bg-tech-green","text-black","border-tech-green"),t.classList.add("bg-transparent","text-tech-dim","border-tech-gray")});const e=document.getElementById(`filter-${n.toLowerCase()}`);e.classList.add("active","bg-tech-green","text-black","border-tech-green"),e.classList.remove("bg-transparent","text-tech-dim","border-tech-gray"),x(),l()};window.changePage=n=>{const e=Math.ceil(d.length/c),t=s+n;t>=1&&t<=e&&(s=t,l(),window.scrollTo({top:0,behavior:"smooth"}))};a.subscribe(()=>{a.updateStaticElements(),l()});a.updateStaticElements();x();l();
