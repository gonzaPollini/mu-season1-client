// Ours: rewrites the built game textures as WebP behind their original header, keeping each file name,
// so URLs, the assets index and the cache worker see nothing new; the readers sniff the payload
// (`src/core/imageBytes.ts`). OZJ: 24-byte header + JPEG; OZT: 4-byte header + TGA.
//
// World textures go to quality 90; `Interface/` (windows, buttons, fonts) stays lossless so the UI
// keeps its edges. A file whose WebP is not smaller, or that does not decode, is left as it was.
//
// Covers `Data/` and the converted tree `game-assets/` (and their 0.97d twins).
// Runs in `bun run build` after the Data copy, before the gzip sidecars and the assets index.
// Usage: bun run tools/texturesWebp.ts [--root dist]

import { readdirSync, readFileSync, statSync, writeFileSync } from 'fs';
import { join, resolve } from 'path';
import sharp from 'sharp';
import { decodeTGA } from '../src/controllers/assets/mu/tga';

const rootArg = process.argv.indexOf('--root');
const root = resolve(rootArg >= 0 ? process.argv[rootArg + 1] : 'dist');
const trees = ['Data', 'Data-v097d', 'game-assets', 'game-assets-v097d'].map(d => join(root, d)).filter(d => statSync(d, { throwIfNoEntry: false }));

function walk(dir: string, out: string[]) {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) walk(path, out);
    else if (/\.oz[jt]$/i.test(name)) out.push(path);
  }
}

const files: string[] = [];
for (const tree of trees) walk(tree, files);

const tag = (b: Uint8Array, at: number) => String.fromCharCode(b[at], b[at + 1], b[at + 2], b[at + 3]);
const isWebp = (b: Uint8Array) => b.length > 12 && tag(b, 0) === 'RIFF' && tag(b, 8) === 'WEBP';
const stats = { ozj: [0, 0, 0], ozt: [0, 0, 0], kept: 0 };

async function convert(path: string) {
  const raw = new Uint8Array(readFileSync(path));
  const ozt = /\.ozt$/i.test(path);
  const head = ozt ? 4 : 24;
  const payload = raw.subarray(head);
  const kind = ozt ? 'ozt' : 'ozj';
  if (isWebp(payload)) return;
  const lossless = /[\\/]Interface[\\/]/i.test(path);
  const options = lossless ? { lossless: true, effort: 6 } : { quality: 90, alphaQuality: 90, effort: 6 };

  let webp: Buffer;
  try {
    if (ozt) {
      const { width, height, pixels } = decodeTGA(path, payload);
      webp = await sharp(Buffer.from(pixels.buffer), { raw: { width, height, channels: 4 } }).webp(options).toBuffer();
    } else {
      webp = await sharp(payload).webp(options).toBuffer();
    }
  } catch {
    stats.kept++;
    return;
  }

  // gzip already shrinks a TGA a lot: compare against what it costs on the wire, roughly a third.
  const wire = ozt ? payload.length / 3 : payload.length;
  if (webp.length >= wire) {
    stats.kept++;
    return;
  }

  const out = new Uint8Array(head + webp.length);
  out.set(raw.subarray(0, head));
  out.set(webp, head);
  writeFileSync(path, out);
  stats[kind][0]++;
  stats[kind][1] += payload.length;
  stats[kind][2] += webp.length;
}

let next = 0;
await Promise.all(
  Array.from({ length: 8 }, async () => {
    for (;;) {
      const i = next++;
      if (i >= files.length) return;
      await convert(files[i]);
    }
  })
);

const mb = (n: number) => (n / 1e6).toFixed(1);
for (const kind of ['ozj', 'ozt'] as const) {
  const [n, before, after] = stats[kind];
  console.log(`textures ${kind}: ${n} to WebP, ${mb(before)} MB -> ${mb(after)} MB`);
}
console.log(`textures kept as they were: ${stats.kept}`);
