import { readFileSync } from 'fs';
import sharp from 'sharp';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __dir = dirname(fileURLToPath(import.meta.url));
const root  = resolve(__dir, '..');
const svg   = readFileSync(resolve(root, 'public/favicon.svg'));

await sharp(svg).resize(512, 512).png().toFile(resolve(root, 'public/icon-512.png'));
await sharp(svg).resize(192, 192).png().toFile(resolve(root, 'public/icon-192.png'));
await sharp(svg).resize(180, 180).png().toFile(resolve(root, 'public/apple-touch-icon.png'));

console.log('✓ icon-512.png, icon-192.png, apple-touch-icon.png wygenerowane');
