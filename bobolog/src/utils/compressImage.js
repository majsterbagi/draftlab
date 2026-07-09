// Kompresja zdjęć w przeglądarce (canvas, bez zależności).
// Cel: max 1200px dłuższy bok, JPEG, ~250 KB — 1 GB Supabase Storage ≈ 4000 zdjęć.

const MAX_SIDE = 1200;
const TARGET_BYTES = 300 * 1024;

function loadImage(file) {
    return new Promise((resolve, reject) => {
        const url = URL.createObjectURL(file);
        const img = new Image();
        img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
        img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('Nie udało się wczytać zdjęcia')); };
        img.src = url;
    });
}

function toBlob(canvas, quality) {
    return new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', quality));
}

export async function compressImage(file) {
    const img = await loadImage(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height));
    const canvas = document.createElement('canvas');
    canvas.width  = Math.round(img.width * scale);
    canvas.height = Math.round(img.height * scale);
    canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);

    let quality = 0.82;
    let blob = await toBlob(canvas, quality);
    while (blob && blob.size > TARGET_BYTES && quality > 0.4) {
        quality -= 0.12;
        blob = await toBlob(canvas, quality);
    }
    if (!blob) throw new Error('Kompresja nie powiodła się');
    return blob;
}
