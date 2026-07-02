import"../main-BKeL_FdE.js";/* empty css               */function E(t){const e=document.createElement("div");e.className="relative bg-cyan-900/10 border border-cyan-900/30 rounded p-4 flex flex-col group overflow-hidden hover:border-cyan-500/30 transition-colors",e.dataset.id=t.id,e.dataset.type=t.type;const n=document.createElement("div");n.className="absolute top-0 left-0 w-full p-2 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity z-10 bg-gradient-to-b from-black/80 to-transparent pointer-events-none",n.innerHTML=`
        <span class="text-[10px] uppercase text-cyan-700 tracking-wider font-bold ml-2">${t.type}</span>
        <button class="pointer-events-auto text-cyan-900 hover:text-red-500 transition-colors btn-delete" title="Remove Widget">
            <i data-lucide="x" class="w-4 h-4"></i>
        </button>
    `,e.appendChild(n),n.querySelector(".btn-delete").addEventListener("click",d=>{d.stopPropagation();const o=new CustomEvent("widget-delete",{detail:{id:t.id},bubbles:!0});e.dispatchEvent(o)});let a;switch(t.type){case"clock":a=k();break;case"weather":a=I();break;case"atmosphere":a=L();break;case"notes":a=_(t);break;case"system":a=$();break;default:a=document.createElement("div"),a.textContent="Unknown Widget"}return a.className="flex-1 w-full h-full",e.appendChild(a),e}function L(t){const e=document.createElement("div");return e.className="flex flex-col h-full justify-between",e.innerHTML='<div class="text-cyan-800 text-xs animate-pulse">HOME.POD...</div>',fetch("../api/atmosphere.php").then(a=>a.json()).then(a=>{if(Array.isArray(a)&&a.length>0){const d=a[a.length-1];e.innerHTML=`
                    <div class="flex items-start justify-between">
                        <i data-lucide="home" class="w-6 h-6 text-cyan-600"></i>
                        <span class="text-[10px] text-cyan-800 uppercase tracking-wider text-right">Inside<br><span class="text-cyan-600">HomePod</span></span>
                    </div>
                    <div class="mt-2">
                        <div class="text-3xl font-bold text-cyan-400">${d.temp.toFixed(1)}°</div>
                        <div class="text-xs text-cyan-600">Indoor Temp</div>
                    </div>
                    <div>
                        <div class="text-lg text-cyan-500/80">${d.humidity}%</div>
                        <div class="text-[10px] text-cyan-700 uppercase">Humidity</div>
                    </div>
                `,window.lucide&&window.lucide.createIcons({root:e})}else e.innerHTML='<div class="text-red-500 text-xs">NO DATA</div>'}).catch(a=>{e.innerHTML=`<div class="text-red-500 text-[10px]">ERR: ${a.message}</div>`}),e}function k(t){const e=document.createElement("div");e.className="flex flex-col items-center justify-center h-full text-cyan-400";const n=document.createElement("div");n.className="text-3xl md:text-4xl font-bold tracking-widest leading-none mb-1";const a=document.createElement("div");a.className="text-xs text-cyan-700 uppercase tracking-[0.2em]";const d=()=>{const o=new Date;n.textContent=o.toLocaleTimeString("pl-PL",{hour:"2-digit",minute:"2-digit"}),a.textContent=o.toLocaleDateString("pl-PL",{weekday:"long",day:"numeric",month:"long"})};return d(),setInterval(d,1e3),e.appendChild(n),e.appendChild(a),e}function I(t){const e=document.createElement("div");if(e.className="flex flex-col h-full justify-between cursor-pointer hover:bg-cyan-900/10 transition-colors rounded p-1 -m-1",e.title="Click for Details",e.innerHTML=`
        <div class="flex flex-col items-center justify-center h-full gap-2">
            <i data-lucide="loader" class="w-6 h-6 text-cyan-800 animate-spin"></i>
            <span class="text-[10px] text-cyan-800 uppercase tracking-widest">Scanning...</span>
        </div>
    `,!navigator.geolocation)return o("Geo N/A"),e;navigator.geolocation.getCurrentPosition(s=>{n(s.coords.latitude,s.coords.longitude)},s=>{console.warn("Geo Error",s),n(52.2297,21.0122,"Warsaw (Default)")});function n(s,m,l=null){if(l)a(s,m,l);else{const r=`https://geocoding-api.open-meteo.com/v1/reverse?latitude=${s}&longitude=${m}&count=1&language=pl&format=json`;fetch(r).then(c=>c.json()).then(c=>{const u=c.results&&c.results[0],p=u?u.name:"Unknown Loc";a(s,m,p)}).catch(c=>{console.warn("GeoCode API Error",c),a(s,m,"Local (Geo)")})}}function a(s,m,l){const r=`https://api.open-meteo.com/v1/forecast?latitude=${s}&longitude=${m}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;fetch(r).then(c=>c.json()).then(c=>{d(c,l)}).catch(c=>{o("API Error")})}function d(s,m){const l=s.current,r=l.weather_code,c=l.temperature_2m;let u="cloud",p="Cloudy";r===0?(u="sun",p="Clear"):r>=1&&r<=3?(u="cloud-sun",p="Partly"):r>=51&&r<=67?(u="cloud-drizzle",p="Rain"):r>=71&&r<=86?(u="snowflake",p="Snow"):r>=95&&(u="cloud-lightning",p="Storm"),e.innerHTML=`
             <div class="flex items-start justify-between">
                <i data-lucide="${u}" class="w-6 h-6 text-cyan-500"></i>
                <div class="text-right">
                    <div class="text-xs text-cyan-400 font-bold uppercase tracking-wider leading-none mb-0.5">${m}</div>
                    <div class="text-[9px] text-cyan-700 uppercase leading-none">${p}</div>
                </div>
            </div>
            <div class="mt-1">
                <div class="text-3xl font-bold text-cyan-400">${c.toFixed(1)}°</div>
            </div>
            <div class="flex justify-between items-end border-t border-cyan-900/30 pt-1 mt-1">
                <div>
                    <div class="text-xs text-cyan-500/80">${l.relative_humidity_2m}%</div>
                    <div class="text-[8px] text-cyan-800 uppercase">Hum</div>
                </div>
                <div class="text-right">
                    <div class="text-xs text-cyan-500/80">${l.wind_speed_10m} <span class="text-[8px]">km/h</span></div>
                    <div class="text-[8px] text-cyan-800 uppercase">Wind</div>
                </div>
            </div>
        `,e.onclick=()=>{const y=s.daily;alert(`Detailed Forecast for ${m}:
Max: ${y.temperature_2m_max[0]}°C
Min: ${y.temperature_2m_min[0]}°C
Wind: ${l.wind_speed_10m} km/h`)},window.lucide&&window.lucide.createIcons({root:e})}function o(s){e.innerHTML=`<div class="text-red-500 text-xs font-bold text-center mt-4">${s}</div>`}return e}function _(t){const e=document.createElement("textarea");return e.className="w-full h-full bg-transparent resize-none border-none outline-none text-xs text-cyan-300 font-mono p-1 placeholder-cyan-900/50 focus:ring-0 appearance-none",e.style.backgroundColor="transparent",e.style.color="#67e8f9",e.placeholder="// ENTER NOTES...",e.value=t.content||"",e.addEventListener("input",()=>{const n=new CustomEvent("widget-update",{detail:{id:t.id,content:e.value},bubbles:!0});e.dispatchEvent(n)}),e}function $(t){const e=document.createElement("div");e.className="flex flex-col gap-2 h-full justify-center text-[10px] text-cyan-600 font-mono";const n=navigator.userAgent.match(/(chrome|safari|firefox|edge)/i)?.[0]||"Unknown",a=navigator.platform,d=`${window.screen.width}x${window.screen.height}`;return e.innerHTML=`
        <div class="border-b border-cyan-900/30 pb-1 flex justify-between">
            <span>SYS.OS</span>
            <span class="text-cyan-400">${a}</span>
        </div>
        <div class="border-b border-cyan-900/30 pb-1 flex justify-between">
            <span>BROWSER</span>
            <span class="text-cyan-400">${n}</span>
        </div>
        <div class="flex justify-between">
            <span>RES</span>
            <span class="text-cyan-400">${d}</span>
        </div>
    `,e}const b="fluxboard_state_v1",g=document.getElementById("dashboard-grid"),h=[{type:"clock",x:0,y:0,w:2,h:2,id:"clock-1"},{type:"weather",x:2,y:0,w:2,h:2,id:"weather-1"},{type:"system",x:4,y:0,w:2,h:2,id:"system-1"},{type:"notes",x:0,y:2,w:4,h:2,id:"notes-1",content:`Tasks:
- Check server status
- Update system logs`}];let i=[];function w(){console.log("[FluxBoard] Initializing..."),S(),f(),A(),document.addEventListener("widget-update",t=>{const{id:e,content:n}=t.detail,a=i.findIndex(d=>d.id===e);a>-1&&(i[a].content=n,v())}),document.addEventListener("widget-delete",t=>{const{id:e}=t.detail;confirm("Delete this module?")&&(i=i.filter(n=>n.id!==e),v(),f())})}function S(){const t=localStorage.getItem(b);if(t)try{i=JSON.parse(t)}catch(e){console.error("[FluxBoard] Error parsing state:",e),i=h}else i=h}function v(){localStorage.setItem(b,JSON.stringify(i)),console.log("[FluxBoard] State saved.")}function f(){g.innerHTML="",i.forEach((t,e)=>{const n=E(t);n.classList.add("widget-item"),document.body.classList.contains("edit-mode")&&(n.draggable=!0),n.style.gridColumn=`span ${t.w}`,n.style.gridRow=`span ${t.h}`,n.dataset.index=e,T(n),g.appendChild(n)}),window.lucide&&window.lucide.createIcons()}let x=null;function T(t){t.addEventListener("dragstart",e=>{x=t,e.dataTransfer.effectAllowed="move",t.classList.add("opacity-50")}),t.addEventListener("dragend",()=>{x=null,t.classList.remove("opacity-50"),document.querySelectorAll(".widget-item").forEach(e=>e.classList.remove("border-cyan-400","border-2"))}),t.addEventListener("dragover",e=>{e.preventDefault(),e.dataTransfer.dropEffect="move",t.classList.add("border-cyan-400","border-2")}),t.addEventListener("dragleave",()=>{t.classList.remove("border-cyan-400","border-2")}),t.addEventListener("drop",e=>{if(e.preventDefault(),t.classList.remove("border-cyan-400","border-2"),x!==t){const n=parseInt(x.dataset.index),a=parseInt(t.dataset.index);C(n,a)}})}function C(t,e){const n=i[t];i[t]=i[e],i[e]=n,v(),f()}function A(){document.getElementById("btn-add-widget").addEventListener("click",()=>{document.getElementById("widget-modal").showModal()}),document.getElementById("close-modal").addEventListener("click",()=>{document.getElementById("widget-modal").close()});const t=document.getElementById("btn-edit-mode");t.addEventListener("click",()=>{document.body.classList.toggle("edit-mode");const o=document.body.classList.contains("edit-mode");t.classList.toggle("text-cyan-400",o),t.classList.toggle("text-cyan-700",!o),document.querySelectorAll(".widget-item").forEach(s=>{s.draggable=o})});const e=["","theme-green","theme-amber","theme-purple","theme-red"];let n=0;const a=localStorage.getItem("fluxboard_theme");a&&e.includes(a)&&(document.body.classList.add(a),n=e.indexOf(a)),document.getElementById("btn-theme").addEventListener("click",()=>{e[n]&&document.body.classList.remove(e[n]),n=(n+1)%e.length,e[n]&&document.body.classList.add(e[n]),localStorage.setItem("fluxboard_theme",e[n])});const d=document.createElement("style");d.innerHTML=`
        .edit-mode .widget-item * { pointer-events: none !important; }
        .edit-mode .widget-item .btn-delete { pointer-events: auto !important; }
        .widget-item.opacity-50 { opacity: 0.5; }
        .widget-item.border-2 { border-width: 2px !important; }
    `,document.head.appendChild(d),document.querySelectorAll(".widget-opt").forEach(o=>{o.addEventListener("click",()=>{const s=o.dataset.type;N(s),document.getElementById("widget-modal").close()})})}function N(t){const e=`${t}-${Date.now()}`,n={type:t,x:0,y:0,w:2,h:2,id:e,content:""};t==="notes"&&(n.w=2),i.push(n),v(),f()}document.readyState==="loading"?document.addEventListener("DOMContentLoaded",w):w();
