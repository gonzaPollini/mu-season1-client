// Ours: packs each pre-download group into one file (`dist/bundles/<version>-<group>.bin`) and
// records it in the assets index as `bundle`, so the download screen fetches a handful of big
// files instead of thousands of small ones (13 000 for the essentials). The page stores a bundle
// whole (`assetDownload.ts`) and the cache worker slices each file out of it (`public/sw.js`).
//
// Format: `MUB1`, a u32 (little endian) header length, the header (JSON `[[key, size], ...]`),
// then the bodies in header order. A key is the URL the game asks for: the gzip sidecar wherever
// the index says sidecars ship and the file has one, the plain file otherwise.
//
// Runs LAST in `bun run build`, after `assets-index`.
// Usage: bun run tools/assetBundles.ts [--root dist]

import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync, createWriteStream } from 'fs';
import { join, resolve } from 'path';
import { COMPRESSED_SUFFIX, isCompressedAsset } from '../src/controllers/assets/compressedAssets';

type Group = { id: string; dirs: [string, [string, number][]][]; bundle?: { url: string; bytes: number } };

const rootArg = process.argv.indexOf('--root');
const root = resolve(rootArg >= 0 ? process.argv[rootArg + 1] : 'dist');
const outDir = join(root, 'bundles');
mkdirSync(outDir, { recursive: true });

const onDisk = (url: string) => join(root, url.replace(/^\.?\//, ''));

for (const name of readdirSync(root).filter(f => /^assets-index.*\.json$/.test(f))) {
  const indexPath = join(root, name);
  const index = JSON.parse(readFileSync(indexPath, 'utf8')) as { sidecars: boolean; groups: Group[] };
  const version = name.replace(/^assets-index-?/, '').replace(/\.json$/, '') || 'season6';
  let total = 0;

  for (const group of index.groups) {
    const entries: [string, string][] = [];
    for (const [dir, files] of group.dirs) {
      for (const [file] of files) {
        const url = dir + file;
        const sidecar = url + COMPRESSED_SUFFIX;
        const key = index.sidecars && isCompressedAsset(url) && existsSync(onDisk(sidecar)) ? sidecar : url;
        if (existsSync(onDisk(key))) entries.push([key, onDisk(key)]);
      }
    }

    const bodies = entries.map(([, path]) => readFileSync(path));
    const header = Buffer.from(JSON.stringify(entries.map(([key], i) => [key, bodies[i].length])));
    const head = Buffer.alloc(8);
    head.write('MUB1', 0, 'latin1');
    head.writeUInt32LE(header.length, 4);

    const file = `${version}-${group.id.replace(/[^a-z0-9]+/gi, '_')}.bin`;
    const out = createWriteStream(join(outDir, file));
    out.write(head);
    out.write(header);
    let bytes = head.length + header.length;
    for (const body of bodies) {
      out.write(body);
      bytes += body.length;
    }
    await new Promise<void>(done => out.end(done));

    group.bundle = { url: `./bundles/${file}`, bytes };
    total += bytes;
  }

  writeFileSync(indexPath, JSON.stringify(index));
  console.log(`assetBundles: ${version}, ${index.groups.length} bundles, ${(total / 1e6).toFixed(1)} MB`);
}
