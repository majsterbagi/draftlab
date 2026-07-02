import{S as H,i as g}from"../main-BKeL_FdE.js";/* empty css               */import{i as S}from"../Nucleus-GSbBhqLp.js";S();const M=new URLSearchParams(window.location.search),y=M.get("id"),t=H.projects.find(h=>h.id===y),v=()=>{if(!t){document.body.innerHTML="<div class='text-white p-10'>PROJECT NOT FOUND</div>";return}const o=g.lang==="en",x=(e,r)=>o&&e[r+"_en"]||e[r],w=()=>o&&t.details_en||t.details,c=x(t,"title"),b=x(t,"desc"),a=w(),$=t.icon?`<i data-lucide="${t.icon}" class="text-tech-green mr-3 md:mr-5 inline-block align-middle mb-1" style="width: 0.9em; height: 0.9em;"></i>`:"";document.getElementById("p-title").innerHTML=`${$}${c}`,document.getElementById("p-ver").innerText=t.version,document.getElementById("p-about").innerText=a?.about||b,document.title=`${c} - Changelog | DraftLab.pl`;let i=document.querySelector('meta[name="description"]');i||(i=document.createElement("meta"),i.name="description",document.getElementsByTagName("head")[0].appendChild(i)),i.content=`Changelog: ${c}. ${b}`;const u=document.getElementById("p-features");if(a?.features?u.innerHTML=a.features.map(e=>`
                    <div class="bg-[#0f0f0f]/50 border border-tech-gray/50 p-4 hover:border-tech-green/30 transition-colors group">
                        <h4 class="text-white text-xs font-bold mb-1 group-hover:text-tech-green">${e.title}</h4>
                        <p class="text-tech-dim text-xs leading-relaxed">${e.desc}</p>
                    </div>
                `).join(""):u.innerHTML=`<div class="text-tech-dim text-xs">${o?"No feature data.":"Brak danych o funkcjach."}</div>`,y==="suntrack"){const e=document.getElementById("prototypes-section"),r=document.getElementById("p-prototypes"),m=[{version:"v2.0",date:"2025-12-18",desc:"Dynamiczne krajobrazy (wieś, miasteczko, metropolia), nocne światła, proceduralnie generowane budynki.",url:"prototypes/suntrack-v2.html"},{version:"v1.0",date:"2025-12-17",desc:"Pierwszy prototyp z glassmorphism UI, chmurami i ptakami.",url:"prototypes/suntrack-v1.html"}];e.classList.remove("hidden"),r.innerHTML=m.map(d=>`
                    <a href="${d.url}" class="bg-[#0f0f0f]/50 border border-tech-gray/50 p-4 hover:border-yellow-500/50 transition-colors group block no-underline">
                        <div class="flex items-center justify-between mb-2">
                            <span class="text-yellow-400 text-xs font-bold">PROTOTYP ${d.version}</span>
                            <span class="text-[10px] text-tech-dim font-mono">${d.date}</span>
                        </div>
                        <p class="text-tech-dim text-xs leading-relaxed">${d.desc}</p>
                        <div class="mt-3 flex items-center gap-2 text-[10px] text-tech-green font-bold uppercase tracking-widest group-hover:underline">
                            <i data-lucide="play" width="10"></i> ${o?"Launch Demo":"Uruchom Demo"}
                        </div>
                    </a>
                `).join("")}const E=document.getElementById("p-stack");a?.techStack&&(E.innerHTML=a.techStack.map(e=>`
                    <span class="text-[10px] border border-tech-gray text-tech-dim px-2 py-1 bg-black">${e}</span>
                `).join(""));const T=document.getElementById("p-roadmap");a?.roadmap&&(T.innerHTML=a.roadmap.map(e=>`
                    <li class="flex items-start gap-3">
                        <div class="mt-0.5 w-3 h-3 border border-tech-gray flex items-center justify-center ${e.done?"bg-tech-green border-tech-green":""}">
                            ${e.done?'<i data-lucide="check" class="text-black" width="8"></i>':""}
                        </div>
                        <span class="${e.done?"text-tech-dim line-through":"text-gray-300"}">${e.task}</span>
                    </li>
                `).join(""));const f=document.getElementById("p-changelog"),l=5;let s=1;const p=()=>{if(!t.changes||t.changes.length===0){f.innerHTML=`<div class="text-tech-dim text-xs">${o?"No changes.":"Brak zmian."}</div>`;return}const e=Math.ceil(t.changes.length/l),r=(s-1)*l,m=r+l,k=t.changes.slice(r,m).map(n=>{let z=n.type==="CORE"||n.type==="INIT"?"text-blue-400":n.type==="FEAT"?"text-tech-green":"text-tech-dim";return`
                    <div class="timeline-item relative pl-6 pb-8 group">
                        <div class="timeline-line"></div>
                        <div class="absolute left-0 top-1.5 w-3 h-3 rounded-full bg-tech-bg border border-tech-gray group-hover:border-white transition-colors z-10"></div>
                        
                        <div class="flex items-baseline gap-3 mb-1">
                            <span class="text-white font-bold text-sm">${n.version}</span>
                            <span class="text-[10px] font-mono text-tech-dim">${n.date}</span>
                            <span class="text-[9px] font-bold border border-white/10 px-1 rounded ${z}">${n.type}</span>
                        </div>
                        <p class="text-tech-dim text-xs leading-relaxed max-w-prose">
                            ${n.desc}
                        </p>
                        ${n.details?`
                        <div class="mt-3 pt-3 border-t border-dashed border-tech-gray/30">
                            <span class="text-[9px] uppercase tracking-widest text-tech-dim/50 block mb-1">Szczegóły Techniczne:</span>
                            <div class="font-mono text-[10px] text-tech-dim/80 whitespace-pre-wrap">${n.details}</div>
                        </div>
                        `:""}
                    </div>
                    `}).join(""),I=o?"Newer":"Nowsze",B=o?"Older":"Starsze",L=o?"PAGE":"STRONA",j=e>1?`
                    <div class="flex justify-between items-center mt-4 pt-6 border-t border-tech-gray border-dashed">
                        <button id="prev-page" class="flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-tech-green border border-transparent hover:border-tech-green transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-transparent" ${s===1?"disabled":""}>
                            <i data-lucide="arrow-left" width="14"></i> ${I}
                        </button>
                        <span class="text-[10px] text-tech-dim font-mono">${L} ${s} / ${e}</span>
                        <button id="next-page" class="flex items-center gap-2 px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-tech-green border border-transparent hover:border-tech-green transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-transparent" ${s===e?"disabled":""}>
                            ${B} <i data-lucide="arrow-right" width="14"></i>
                        </button>
                    </div>
                `:"";f.innerHTML=k+j,e>1&&(document.getElementById("prev-page")?.addEventListener("click",()=>{s>1&&(s--,p(),window.scrollTo({top:document.getElementById("p-changelog").offsetTop-100,behavior:"smooth"}))}),document.getElementById("next-page")?.addEventListener("click",()=>{s<e&&(s++,p(),window.scrollTo({top:document.getElementById("p-changelog").offsetTop-100,behavior:"smooth"}))})),lucide.createIcons()};p(),g.updateStaticElements(),lucide.createIcons()};t&&(v(),g.subscribe(()=>{v()}));
