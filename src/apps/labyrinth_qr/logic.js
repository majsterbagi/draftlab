// Logic for LabyrinthQR
// Uses qr-code-styling library (loaded globally via script tag)

// State
const state = {
    content: "Witam w LabyrinthQR",
    type: "text", // text, url, wifi, vcard
    style: {
        width: 250,
        height: 250,
        type: "svg", // or canvas, but svg is sharper for preview? library uses canvas mostly for download
        data: "",
        image: "",
        dotsOptions: {
            color: "#00ff41",
            type: "square"
        },
        backgroundOptions: {
            color: "#000000",
        },
        imageOptions: {
            crossOrigin: "anonymous",
            margin: 10
        },
        cornersSquareOptions: {
            color: "#00ff41", // Sync with primary for now
            type: "square"
        },
        cornersDotOptions: {
            color: "#00ff41",
            type: "square"
        }
    },
    wifi: { ssid: "", pass: "", encryption: "WPA" },
    vcard: { name: "", phone: "", email: "" },
    page: { text: "", imgUrl: "" }
};

let qrCode;

// Initialization
document.addEventListener("DOMContentLoaded", () => {
    initQR();
    setupInputs();
    setupStyleControls();
    updateQR();
});

function initQR() {
    // Check if lib is loaded
    if (typeof QRCodeStyling === 'undefined') {
        console.error("QRCodeStyling lib not found!");
        return;
    }

    qrCode = new QRCodeStyling(state.style);
    qrCode.append(document.getElementById("qr-canvas"));
}

function updateQR() {
    if (!qrCode) return;

    // Build Data String based on Type
    let dataStr = "";
    if (state.type === 'text') {
        dataStr = document.getElementById('inp-text') ? document.getElementById('inp-text').value : state.content;
    } else if (state.type === 'page') {
        const baseUrl = "https://draftlab.pl/apps/view.html";

        const txt = document.getElementById('inp-page-text') ? document.getElementById('inp-page-text').value : state.page.text;
        const img = state.page.imgUrl;

        const params = [];
        if (txt && txt.trim() !== '') params.push(`text=${encodeURIComponent(txt)}`);
        if (img && img.trim() !== '') params.push(`img=${encodeURIComponent(img)}`);

        if (params.length > 0) {
            dataStr = `${baseUrl}?${params.join('&')}`;
        } else {
            // Default if empty
            dataStr = baseUrl;
        }
    } else if (state.type === 'url') {
        dataStr = document.getElementById('inp-url') ? document.getElementById('inp-url').value : state.content;
    } else if (state.type === 'wifi') {
        const ssid = document.getElementById('inp-wifi-ssid').value;
        const pass = document.getElementById('inp-wifi-pass').value;
        const enc = document.getElementById('inp-wifi-enc').value;
        dataStr = `WIFI:T:${enc};S:${ssid};P:${pass};;`;
    } else if (state.type === 'vcard') {
        const n = document.getElementById('inp-vcard-name').value;
        const p = document.getElementById('inp-vcard-phone').value;
        const e = document.getElementById('inp-vcard-email').value;
        dataStr = `BEGIN:VCARD\nVERSION:3.0\nN:${n}\nTEL:${p}\nEMAIL:${e}\nEND:VCARD`;
    }

    // Apply State
    qrCode.update({
        width: state.style.width,
        height: state.style.height,
        data: dataStr,
        dotsOptions: {
            color: state.style.dotsOptions.color,
            type: state.style.dotsOptions.type
        },
        backgroundOptions: {
            color: state.style.backgroundOptions.color,
        },
        image: state.style.image,
        cornersSquareOptions: {
            color: state.style.dotsOptions.color, // Sync with primary for now
            type: state.style.dotsOptions.type === 'rounded' ? 'extra-rounded' : 'square'
        },
        cornersDotOptions: {
            color: state.style.dotsOptions.color,
            type: state.style.dotsOptions.type === 'rounded' ? 'dot' : 'square'
        }
    });
}

function setupInputs() {
    const inputContainer = document.getElementById('input-container');
    const typeBtns = {
        text: document.getElementById('type-text'),
        page: document.getElementById('type-page'),
        url: document.getElementById('type-url'),
        wifi: document.getElementById('type-wifi'),
        vcard: document.getElementById('type-card')
    };

    const activateType = (type) => {
        state.type = type;

        // UI Tabs
        Object.values(typeBtns).forEach(btn => {
            btn.className = "flex-1 px-3 py-1 text-xs text-tech-dim hover:text-white transition-all whitespace-nowrap";
            btn.style.backgroundColor = "transparent";
            btn.style.borderColor = "transparent";
        });
        typeBtns[type].className = "flex-1 px-3 py-1 text-xs text-tech-green bg-tech-green/20 border border-tech-green rounded transition-all whitespace-nowrap";

        // Render Inputs
        renderInputFields(type);
        updateQR();
    };

    typeBtns.text.onclick = () => activateType('text');
    typeBtns.page.onclick = () => activateType('page');
    typeBtns.url.onclick = () => activateType('url');
    typeBtns.wifi.onclick = () => activateType('wifi');
    typeBtns.vcard.onclick = () => activateType('vcard');

    renderInputFields('text'); // Init with Text
}

function renderInputFields(type) {
    const container = document.getElementById('input-container');
    container.innerHTML = "";

    if (type === 'text') {
        container.innerHTML = `
            <div class="input-group">
                <label class="block text-xs text-tech-dim mb-1">Dowolny Tekst</label>
                <textarea id="inp-text" rows="3" class="dl-input" placeholder="Wpisz tekst tutaj...">${state.content}</textarea>
            </div>
        `;
        document.getElementById('inp-text').addEventListener('input', (e) => { state.content = e.target.value; updateQR(); });
    }

    else if (type === 'page') {
        container.innerHTML = `
            <div class="input-group mb-4">
                <label class="block text-xs text-tech-dim mb-1">Tekst na stronie</label>
                <textarea id="inp-page-text" rows="3" class="dl-input" placeholder="Wiadomość do wyświetlenia...">${state.page.text}</textarea>
            </div>
            
            <div class="input-group p-3 border border-tech-gray border-dashed bg-tech-green/5">
                <label class="block text-xs text-tech-dim mb-2 flex justify-between items-center">
                    <span>Dołącz Zdjęcie (Opcjonalnie)</span>
                    <i data-lucide="image" class="w-3 h-3 text-tech-green"></i>
                </label>
                
                <input type="file" id="inp-page-file" accept="image/*" class="w-full text-xs text-tech-dim file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-tech-green/10 file:text-tech-green hover:file:bg-tech-green/20 mb-2 cursor-pointer">
                
                <div id="upload-status" class="text-[10px] text-tech-dim h-4 flex items-center gap-2">
                    ${state.page.imgUrl ? '<span class="text-tech-green flex items-center gap-1"><i data-lucide="check" class="w-3 h-3"></i> Obraz dołączony.</span>' : 'Brak zdjęcia.'}
                </div>
            </div>
        `;

        // Listeners
        document.getElementById('inp-page-text').addEventListener('input', (e) => {
            state.page.text = e.target.value;
            updateQR();
        });

        document.getElementById('inp-page-file').addEventListener('change', (e) => {
            handlePageFileUpload(e).then(() => {
                // Refresh icons after upload status change if needed, but innerHTML replace inside handlePageFileUpload might kill icons if we used Lucide there, 
                // but handlePageFileUpload writes raw HTML strings so it's fine.
                // Actually handlePageFileUpload relies on "upload-status" ID.
            });
        });

        lucide.createIcons();
    }

    else if (type === 'url') {
        container.innerHTML = `
            <div class="input-group">
                <label class="block text-xs text-tech-dim mb-1">Adres URL</label>
                <input type="text" id="inp-url" class="dl-input" placeholder="https://..." value="${state.content.startsWith('http') ? state.content : 'https://draftlab.pl'}">
            </div>
        `;
        document.getElementById('inp-url').addEventListener('input', (e) => { state.content = e.target.value; updateQR(); });
    }

    else if (type === 'wifi') {
        container.innerHTML = `
            <div class="input-group">
                <label class="block text-xs text-tech-dim mb-1">Nazwa Sieci (SSID)</label>
                <input type="text" id="inp-wifi-ssid" class="dl-input" placeholder="MyWiFi" value="${state.wifi.ssid}">
            </div>
            <div class="input-group">
                <label class="block text-xs text-tech-dim mb-1">Hasło</label>
                <input type="password" id="inp-wifi-pass" class="dl-input" placeholder="***" value="${state.wifi.pass}">
            </div>
             <div class="input-group">
                <label class="block text-xs text-tech-dim mb-1">Typ</label>
                <select id="inp-wifi-enc" class="dl-input bg-black">
                    <option value="WPA">WPA/WPA2</option>
                    <option value="WEP">WEP</option>
                    <option value="nopass">Otwarte</option>
                </select>
            </div>
        `;
        // Listeners
        ['ssid', 'pass', 'enc'].forEach(key => {
            document.getElementById(`inp-wifi-${key}`).addEventListener('input', updateQR);
        });
    }

    else if (type === 'vcard') {
        container.innerHTML = `
            <div class="input-group">
                <label class="block text-xs text-tech-dim mb-1">Imię i Nazwisko</label>
                <input type="text" id="inp-vcard-name" class="dl-input" placeholder="Kamil Bagi" value="${state.vcard.name}">
            </div>
            <div class="input-group">
                <label class="block text-xs text-tech-dim mb-1">Telefon</label>
                <input type="text" id="inp-vcard-phone" class="dl-input" placeholder="+48..." value="${state.vcard.phone}">
            </div>
            <div class="input-group">
                <label class="block text-xs text-tech-dim mb-1">Email</label>
                <input type="email" id="inp-vcard-email" class="dl-input" placeholder="email@example.com" value="${state.vcard.email}">
            </div>
        `;
        // Listeners
        ['name', 'phone', 'email'].forEach(key => {
            document.getElementById(`inp-vcard-name`).addEventListener('input', updateQR);
            document.getElementById(`inp-vcard-phone`).addEventListener('input', updateQR);
            document.getElementById(`inp-vcard-email`).addEventListener('input', updateQR);
        });
    }

    // Common styling for inputs
    document.querySelectorAll('.dl-input').forEach(el => {
        el.className = "w-full bg-black border border-tech-gray text-white text-sm p-2 focus:border-tech-green focus:outline-none transition-colors placeholder-white/20";
    });
}

function setupStyleControls() {
    // 1. Shapes
    const shapeBtns = document.querySelectorAll('.style-btn');
    shapeBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Reset active class
            shapeBtns.forEach(b => {
                b.className = "style-btn border border-tech-gray text-tech-dim text-xs py-2 hover:border-white hover:text-white";
                b.style.backgroundColor = "";
            });
            // Set active
            btn.className = "style-btn active border border-tech-green bg-tech-green/20 text-white text-xs py-2";

            state.style.dotsOptions.type = btn.dataset.dots;
            updateQR();
        });
    });

    // 2. Colors
    const colorPrimary = document.getElementById('color-primary');
    const hexPrimary = document.getElementById('hex-primary');

    const colorBg = document.getElementById('color-bg');
    const hexBg = document.getElementById('hex-bg');

    const updateColors = () => {
        state.style.dotsOptions.color = colorPrimary.value;
        hexPrimary.textContent = colorPrimary.value;

        state.style.backgroundOptions.color = colorBg.value;
        hexBg.textContent = colorBg.value;

        updateQR();
    };

    colorPrimary.addEventListener('input', updateColors);
    colorPrimary.addEventListener('change', updateColors);
    colorBg.addEventListener('input', updateColors);
    colorBg.addEventListener('change', updateColors);

    // 3. Logo
    const logoInput = document.getElementById('inp-logo');
    const clearLogo = document.getElementById('clear-logo');

    logoInput.addEventListener('change', () => {
        const file = logoInput.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                state.style.image = e.target.result;
                updateQR();
            };
            reader.readAsDataURL(file);
        }
    });

    // 4. Size
    const sizeInput = document.getElementById('inp-size');
    const sizeVal = document.getElementById('size-val');
    let debounceTimer;

    sizeInput.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        sizeVal.textContent = val + "px";

        state.style.width = val;
        state.style.height = val;

        // Debounce update for smooth sliding
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
            updateQR();
        }, 100);
    });

    // 5. Download & Print
    document.getElementById('btn-download').addEventListener('click', () => {
        qrCode.download({ name: "labyrinth-qr", extension: "png" });
    });

    document.getElementById('btn-print').addEventListener('click', () => {
        const qrContainer = document.getElementById('qr-canvas');
        if (!qrContainer) return;

        // Create a new window
        const win = window.open('', '', 'width=800,height=800');

        // Get SVG content
        const svgContent = qrContainer.innerHTML;

        win.document.write(`
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
                    ${svgContent}
                    <script>
                        setTimeout(() => {
                            window.print();
                            window.close();
                        }, 500);
                    </script>
                </body>
            </html>
        `);
        win.document.close();
    });
}

async function handlePageFileUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const statusEl = document.getElementById('upload-status');
    statusEl.innerHTML = '<span class="animate-pulse text-tech-green">Przesyłanie... 0%</span>';

    // Chunked Upload Logic tailored for DraftCargo API
    const CHUNK_SIZE = 1024 * 1024; // 1MB
    const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
    const fileId = Date.now().toString(36) + Math.random().toString(36).substr(2); // Unique ID based on time

    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
        const start = chunkIndex * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        // Convert chunk to Base64
        const base64Chunk = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result.split(',')[1]);
            reader.readAsDataURL(chunk);
        });

        const formData = new FormData();
        formData.append('chunkData', base64Chunk);
        formData.append('chunkIndex', chunkIndex);
        formData.append('totalChunks', totalChunks);
        formData.append('fileId', fileId);
        formData.append('fileName', file.name);

        try {
            const response = await fetch('../api/upload.php', {
                method: 'POST',
                body: formData
            });
            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error || "Upload failed");
            }

            if (result.fileUrl) {
                // Done
                state.page.imgUrl = result.fileUrl; // This is relative "api/download.php..."
                statusEl.innerHTML = '<span class="text-tech-green">✅ Wgrano pomyślnie!</span>';
                updateQR();
            } else {
                // Progress
                const percent = Math.round(((chunkIndex + 1) / totalChunks) * 100);
                statusEl.innerHTML = '<span class="animate-pulse text-tech-green">Przesyłanie... ' + percent + '%</span>';
            }

        } catch (err) {
            console.error(err);
            statusEl.innerHTML = '<span class="text-red-500">Błąd przesyłania.</span>';
            break;
        }
    }
}
