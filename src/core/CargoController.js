/**
 * CargoController v4.0 - Base64 Upload
 * Encodes file chunks as Base64 text to bypass tmp folder issues
 */
export class CargoController {
    constructor(options) {
        this.options = options;
        // Smaller chunks because Base64 increases size by ~33%
        this.CHUNK_SIZE = 3 * 1024 * 1024; // 3MB chunks (becomes ~4MB as Base64)
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

        for (let i = 0; i < totalChunks; i++) {
            const start = i * this.CHUNK_SIZE;
            const end = Math.min(file.size, start + this.CHUNK_SIZE);
            const chunk = file.slice(start, end);

            try {
                await this.uploadChunk(chunk, i, totalChunks, fileId, file.name);
                const progress = ((i + 1) / totalChunks) * 100;
                this.options.onProgress(progress, end, file.size);
            } catch (err) {
                this.options.onError(`Błąd transmisji: ${err.message || 'Nieznany błąd'}`);
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
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    async uploadChunk(chunk, index, total, id, name) {
        // Convert chunk to Base64
        const base64Data = await this.blobToBase64(chunk);

        // Send as regular POST data (not as file upload!)
        const params = new URLSearchParams();
        params.append('chunkData', base64Data);
        params.append('chunkIndex', index);
        params.append('totalChunks', total);
        params.append('fileId', id);
        params.append('fileName', name);

        const response = await fetch('../api/upload.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            body: params.toString()
        });

        if (!response.ok) {
            throw new Error(`Serwer zwrócił kod ${response.status}`);
        }

        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        if (result.fileUrl) this.options.onSuccess(result.fileUrl);
    }
}
