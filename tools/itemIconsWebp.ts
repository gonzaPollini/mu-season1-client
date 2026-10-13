// Ours: rewrites the built item icons (`dist/items/*.png`) as WebP at quality 90 and drops the PNGs,
// about a third of the bytes. `public/items` keeps the PNGs (the dev server serves those), and the
// client asks for `.webp` only in a build (`itemIconPack.ts`).
//
// Runs in `bun run build` after the Vite build, before the gzip sidecars and the assets index.
// Usage: bun run tools/itemIconsWebp.ts [--root dist]

import { readdirSync, statSync, unlinkSync } from 'fs';
import { join, resolve } from 'path';
import sharp from 'sharp';

const rootArg = process.argv.indexOf('--root');
const root = resolve(rootArg >= 0 ? process.argv[rootArg + 1] : 'dist');
const dir = join(root, 'items');

const files = readdirSync(dir).filter(f => f.endsWith('.png'));
let before = 0;
let after = 0;
const CONCURRENCY = 8;
let next = 0;

async function worker() {
  for (;;) {
    const i = next++;
    if (i >= files.length) return;
    const png = join(dir, files[i]);
    const webp = png.replace(/\.png$/, '.webp');
    before += statSync(png).size;
    await sharp(png).webp({ quality: 90, alphaQuality: 100, effort: 6 }).toFile(webp);
    after += statSync(webp).size;
    unlinkSync(png);
  }
}

await Promise.all(Array.from({ length: CONCURRENCY }, worker));
const mb = (n: number) => (n / 1e6).toFixed(1);
console.log(`item icons: ${files.length} PNG ${mb(before)} MB -> WebP ${mb(after)} MB`);
