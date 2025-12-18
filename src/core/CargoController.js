/**
 * CargoController v2.0 - RAW Upload Client
 * Sends binary data directly without FormData
 */
export class CargoController {
    constructor(options) {
        this.options = options;
        this.CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
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

    async uploadChunk(chunk, index, total, id, name) {
        // Send RAW binary data with metadata in headers
        const response = await fetch('../api/upload.php', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/octet-stream',
                'X-File-Id': id,
                'X-Chunk-Index': index.toString(),
                'X-Total-Chunks': total.toString(),
                'X-File-Name': name
            },
            body: chunk // Send Blob directly, not FormData
        });

        if (!response.ok) {
            throw new Error(`Serwer zwrócił kod ${response.status}`);
        }

        const result = await response.json();
        if (!result.success) throw new Error(result.error);
        if (result.fileUrl) this.options.onSuccess(result.fileUrl);
    }
}
