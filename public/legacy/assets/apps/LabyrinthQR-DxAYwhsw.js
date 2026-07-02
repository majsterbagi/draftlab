import{i as a}from"../main-BKeL_FdE.js";/* empty css               */import{i as b}from"../Nucleus-GSbBhqLp.js";b();a.updateStaticElements();const e={content:"Witam w LabyrinthQR",type:"text",style:{width:250,height:250,type:"svg",data:"",image:"",dotsOptions:{color:"#00ff41",type:"square"},backgroundOptions:{color:"#000000"},imageOptions:{crossOrigin:"anonymous",margin:10},cornersSquareOptions:{color:"#00ff41",type:"square"},cornersDotOptions:{color:"#00ff41",type:"square"}},wifi:{ssid:"",pass:"",encryption:"WPA"},vcard:{name:"",phone:"",email:""},page:{text:"",imgUrl:""}};let h;document.addEventListener("DOMContentLoaded",()=>{E(),w(),I(),s(),a.subscribe(()=>{v(e.type),s()})});function E(){if(typeof QRCodeStyling>"u"){console.error("QRCodeStyling lib not found!");return}h=new QRCodeStyling(e.style),h.append(document.getElementById("qr-canvas"))}function s(){if(!h)return;let i="";if(e.type==="text")i=document.getElementById("inp-text")?document.getElementById("inp-text").value:e.content;else if(e.type==="page"){const n="https://draftlab.pl/apps/view.html",t=document.getElementById("inp-page-text")?document.getElementById("inp-page-text").value:e.page.text,l=e.page.imgUrl,d=[];t&&t.trim()!==""&&d.push(`text=${encodeURIComponent(t)}`),l&&l.trim()!==""&&d.push(`img=${encodeURIComponent(l)}`),d.length>0?i=`${n}?${d.join("&")}`:i=n}else if(e.type==="url")i=document.getElementById("inp-url")?document.getElementById("inp-url").value:e.content;else if(e.type==="wifi"){const n=document.getElementById("inp-wifi-ssid").value,t=document.getElementById("inp-wifi-pass").value;i=`WIFI:T:${document.getElementById("inp-wifi-enc").value};S:${n};P:${t};;`}else if(e.type==="vcard"){const n=document.getElementById("inp-vcard-name").value,t=document.getElementById("inp-vcard-phone").value,l=document.getElementById("inp-vcard-email").value;i=`BEGIN:VCARD
VERSION:3.0
N:${n}
TEL:${t}
EMAIL:${l}
END:VCARD`}h.update({width:e.style.width,height:e.style.height,data:i,dotsOptions:{color:e.style.dotsOptions.color,type:e.style.dotsOptions.type},backgroundOptions:{color:e.style.backgroundOptions.color},image:e.style.image,cornersSquareOptions:{color:e.style.dotsOptions.color,type:e.style.dotsOptions.type==="rounded"?"extra-rounded":"square"},cornersDotOptions:{color:e.style.dotsOptions.color,type:e.style.dotsOptions.type==="rounded"?"dot":"square"}})}function w(){document.getElementById("input-container");const i={text:document.getElementById("type-text"),page:document.getElementById("type-page"),url:document.getElementById("type-url"),wifi:document.getElementById("type-wifi"),vcard:document.getElementById("type-card")},n=t=>{e.type=t,Object.values(i).forEach(l=>{l.className="flex-1 px-3 py-1 text-xs text-tech-dim hover:text-white transition-all whitespace-nowrap",l.style.backgroundColor="transparent",l.style.borderColor="transparent"}),i[t].className="flex-1 px-3 py-1 text-xs text-tech-green bg-tech-green/20 border border-tech-green rounded transition-all whitespace-nowrap",v(t),s()};i.text.onclick=()=>n("text"),i.page.onclick=()=>n("page"),i.url.onclick=()=>n("url"),i.wifi.onclick=()=>n("wifi"),i.vcard.onclick=()=>n("vcard"),v("text")}function v(i){const n=document.getElementById("input-container");n.innerHTML="",i==="text"?(n.innerHTML=`
            <div class="input-group">
                <label class="block text-xs text-tech-dim mb-1">${a.t("qr.inp.text")}</label>
                <textarea id="inp-text" rows="3" class="dl-input" placeholder="${a.t("qr.inp.placeholder")}">${e.content}</textarea>
            </div>
        `,document.getElementById("inp-text").addEventListener("input",t=>{e.content=t.target.value,s()})):i==="page"?(n.innerHTML=`
            <div class="input-group mb-4">
                <label class="block text-xs text-tech-dim mb-1">${a.t("qr.inp.page_text")}</label>
                <textarea id="inp-page-text" rows="3" class="dl-input" placeholder="${a.t("qr.inp.page_placeholder")}">${e.page.text}</textarea>
            </div>
            
            <div class="input-group p-3 border border-tech-gray border-dashed bg-tech-green/5">
                <label class="block text-xs text-tech-dim mb-2 flex justify-between items-center">
                    <span>${a.t("qr.inp.img_label")}</span>
                    <i data-lucide="image" class="w-3 h-3 text-tech-green"></i>
                </label>
                
                <input type="file" id="inp-page-file" accept="image/*" class="w-full text-xs text-tech-dim file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-tech-green/10 file:text-tech-green hover:file:bg-tech-green/20 mb-2 cursor-pointer">
                
                <div id="upload-status" class="text-[10px] text-tech-dim h-4 flex items-center gap-2">
                    ${e.page.imgUrl?`<span class="text-tech-green flex items-center gap-1"><i data-lucide="check" class="w-3 h-3"></i> ${a.t("qr.inp.img_status_ok")}</span>`:a.t("qr.inp.img_status_none")}
                </div>
            </div>
        `,document.getElementById("inp-page-text").addEventListener("input",t=>{e.page.text=t.target.value,s()}),document.getElementById("inp-page-file").addEventListener("change",t=>{B(t).then(()=>{})}),lucide.createIcons()):i==="url"?(n.innerHTML=`
            <div class="input-group">
                <label class="block text-xs text-tech-dim mb-1">${a.t("qr.type.url")}</label>
                <input type="text" id="inp-url" class="dl-input" placeholder="https://..." value="${e.content.startsWith("http")?e.content:"https://draftlab.pl"}">
            </div>
        `,document.getElementById("inp-url").addEventListener("input",t=>{e.content=t.target.value,s()})):i==="wifi"?(n.innerHTML=`
            <div class="input-group">
                <label class="block text-xs text-tech-dim mb-1">${a.t("qr.inp.wifi_ssid")}</label>
                <input type="text" id="inp-wifi-ssid" class="dl-input" placeholder="MyWiFi" value="${e.wifi.ssid}">
            </div>
            <div class="input-group">
                <label class="block text-xs text-tech-dim mb-1">${a.t("qr.inp.wifi_pass")}</label>
                <input type="password" id="inp-wifi-pass" class="dl-input" placeholder="***" value="${e.wifi.pass}">
            </div>
             <div class="input-group">
                <label class="block text-xs text-tech-dim mb-1">${a.t("qr.inp.wifi_enc")}</label>
                <select id="inp-wifi-enc" class="dl-input bg-black">
                    <option value="WPA">WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">Otwarte</option>
                </select>
            </div>
        `,["ssid","pass","enc"].forEach(t=>{document.getElementById(`inp-wifi-${t}`).addEventListener("input",s)})):i==="vcard"&&(n.innerHTML=`
            <div class="input-group">
                <label class="block text-xs text-tech-dim mb-1">${a.t("qr.inp.vcard_name")}</label>
                <input type="text" id="inp-vcard-name" class="dl-input" placeholder="Kamil Bagi" value="${e.vcard.name}">
            </div>
            <div class="input-group">
                <label class="block text-xs text-tech-dim mb-1">${a.t("qr.inp.vcard_phone")}</label>
                <input type="text" id="inp-vcard-phone" class="dl-input" placeholder="+48..." value="${e.vcard.phone}">
            </div>
            <div class="input-group">
                <label class="block text-xs text-tech-dim mb-1">${a.t("qr.inp.vcard_email")}</label>
                <input type="email" id="inp-vcard-email" class="dl-input" placeholder="email@example.com" value="${e.vcard.email}">
            </div>
        `,["name","phone","email"].forEach(t=>{document.getElementById("inp-vcard-name").addEventListener("input",s),document.getElementById("inp-vcard-phone").addEventListener("input",s),document.getElementById("inp-vcard-email").addEventListener("input",s)})),document.querySelectorAll(".dl-input").forEach(t=>{t.className="w-full bg-black border border-tech-gray text-white text-sm p-2 focus:border-tech-green focus:outline-none transition-colors placeholder-white/20"})}function I(){const i=document.querySelectorAll(".style-btn");i.forEach(r=>{r.addEventListener("click",()=>{i.forEach(o=>{o.className="style-btn border border-tech-gray text-tech-dim text-xs py-2 hover:border-white hover:text-white",o.style.backgroundColor=""}),r.className="style-btn active border border-tech-green bg-tech-green/20 text-white text-xs py-2",e.style.dotsOptions.type=r.dataset.dots,s()})});const n=document.getElementById("color-primary"),t=document.getElementById("hex-primary"),l=document.getElementById("color-bg"),d=document.getElementById("hex-bg"),m=()=>{e.style.dotsOptions.color=n.value,t.textContent=n.value,e.style.backgroundOptions.color=l.value,d.textContent=l.value,s()};n.addEventListener("input",m),n.addEventListener("change",m),l.addEventListener("input",m),l.addEventListener("change",m);const c=document.getElementById("inp-logo");document.getElementById("clear-logo"),c.addEventListener("change",()=>{const r=c.files[0];if(r){const o=new FileReader;o.onload=p=>{e.style.image=p.target.result,s()},o.readAsDataURL(r)}});const y=document.getElementById("inp-size"),x=document.getElementById("size-val");let g;y.addEventListener("input",r=>{const o=parseInt(r.target.value);x.textContent=o+"px",e.style.width=o,e.style.height=o,g&&clearTimeout(g),g=setTimeout(()=>{s()},100)}),document.getElementById("btn-download").addEventListener("click",()=>{h.download({name:"labyrinth-qr",extension:"png"})}),document.getElementById("btn-print").addEventListener("click",()=>{const r=document.getElementById("qr-canvas");if(!r)return;const o=window.open("","","width=800,height=800"),p=r.innerHTML;o.document.write(`
            <html>
                <head>
                    <title>Print QR - LabyrinthQR</title>
                    <style>
                        body {
                            margin: 0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            height: 100vh;
                            background: white;
                        }
                        svg {
                            max-width: 90%;
                            max-height: 90%;
                            width: auto !important; /* Force auto to fit paper */
                            height: auto !important;
                        }
                    </style>
                </head>
                <body>
                    ${p}
                    <script>
                        setTimeout(() => {
                            window.print();
                            window.close();
                        }, 500);
                    <\/script>
                </body>
            </html>
        `),o.document.close()})}async function B(i){const n=i.target.files[0];if(!n)return;const t=document.getElementById("upload-status");t.innerHTML=`<span class="animate-pulse text-tech-green">${a.t("qr.uploading")} 0%</span>`;const l=1024*1024,d=Math.ceil(n.size/l),m=Date.now().toString(36)+Math.random().toString(36).substr(2);for(let c=0;c<d;c++){const y=c*l,x=Math.min(y+l,n.size),g=n.slice(y,x),r=await new Promise(p=>{const u=new FileReader;u.onload=f=>p(f.target.result.split(",")[1]),u.readAsDataURL(g)}),o=new FormData;o.append("chunkData",r),o.append("chunkIndex",c),o.append("totalChunks",d),o.append("fileId",m),o.append("fileName",n.name);try{const u=await(await fetch("../api/upload.php",{method:"POST",body:o})).json();if(!u.success)throw new Error(u.error||"Upload failed");if(u.fileUrl)e.page.imgUrl=u.fileUrl,t.innerHTML=`<span class="text-tech-green">✅ ${a.t("qr.uploaded")}</span>`,s();else{const f=Math.round((c+1)/d*100);t.innerHTML=`<span class="animate-pulse text-tech-green">${a.t("qr.uploading")} ${f}%</span>`}}catch(p){console.error(p),t.innerHTML=`<span class="text-red-500">${a.t("qr.upload_error")}</span>`;break}}}
