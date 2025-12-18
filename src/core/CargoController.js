/**
 * CargoController v5.0 - Base64 Upload (Mobile-optimized)
 * Uses FormData instead of URLSearchParams for better mobile compatibility
 */
export class CargoController {
    constructor(options) {
        this.options = options;
        // Very small chunks for mobile compatibility
        // 512KB binary = ~700KB as Base64
        this.CHUNK_SIZE = 512 * 1024; // 512KB chunks
        this.init();
    }

    init() {
        const zone = document.getElementById(this.options.dropZone);
        const input = document.getElementById(this.options.fileInput);

        zone.addEventListener('click', () => input.click());

        zone.addEventListener('dragover', (e) => {
            e.preventDefault();
            zone.classList.add('border-tech-green');
        });

        zone.addEventListener('dragleave', () => {
            zone.classList.remove('border-tech-green');
        });

        zone.addEventListener('drop', (e) => {
            e.preventDefault();
            zone.classList.remove('border-tech-green');
            const files = e.dataTransfer.files;
            if (files.length) this.handleFiles(files[0]);
        });

        input.addEventListener('change', (e) => {
            if (e.target.files.length) this.handleFiles(e.target.files[0]);
        });
    }

    async handleFiles(file) {
        if (file.size > 1024 * 1024 * 1024) {
            this.options.onError("Plik za duży. Maksymalny rozmiar: 1GB.");
            return;
        }

        document.getElementById('file-name-display').innerText = file.name;
        const fileId = 'cargo_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        const totalChunks = Math.ceil(file.size / this.CHUNK_SIZE);

        console.log(`[Cargo] Starting upload: ${file.name}, ${totalChunks} chunks`);

        for (let i = 0; i < totalChunks; i++) {
            const start = i * this.CHUNK_SIZE;
            const end = Math.min(file.size, start + this.CHUNK_SIZE);
            const chunk = file.slice(start, end);

            try {
                await this.uploadChunk(chunk, i, totalChunks, fileId, file.name);
                const progress = ((i + 1) / totalChunks) * 100;
                this.options.onProgress(progress, end, file.size);
            } catch (err) {
                console.error(`[Cargo] Error on chunk ${i}:`, err);
                this.options.onError(`Błąd transmisji (chunk ${i + 1}/${totalChunks}): ${err.message || 'Nieznany błąd'}`);
                return;
            }
        }
    }

    // Convert Blob to Base64 string
    async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                // Remove the data:*/*;base64, prefix
                const result = reader.result;
                if (!result || typeof result !== 'string') {
                    reject(new Error('FileReader returned empty result'));
                    return;
                }
                const base64 = result.split(',')[1];
                if (!base64) {
                    reject(new Error('Could not extract Base64 data'));
                    return;
                }
                resolve(base64);
            };
            reader.onerror = () => reject(new Error('FileReader error'));
            reader.readAsDataURL(blob);
        });
    }

    async uploadChunk(chunk, index, total, id, name) {
        // Convert chunk to Base64
        const base64Data = await this.blobToBase64(chunk);

        if (!base64Data) {
            throw new Error('Base64 conversion failed');
        }

        console.log(`[Cargo] Sending chunk ${index}/${total}, base64 length: ${base64Data.length}`);

        // Use FormData for better mobile compatibility
        const formData = new FormData();
        formData.append('chunkData', base64Data);
        formData.append('chunkIndex', index.toString());
        formData.append('totalChunks', total.toString());
        formData.append('fileId', id);
        formData.append('fileName', name);

        const response = await fetch('../api/upload.php', {
            method: 'POST',
            body: formData // FormData sets Content-Type automatically
        });

        if (!response.ok) {
            const text = await response.text();
            console.error(`[Cargo] Server error ${response.status}:`, text);
            throw new Error(`Serwer zwrócił kod ${response.status}`);
        }

        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        if (result.fileUrl) this.options.onSuccess(result.fileUrl);
    }
}
