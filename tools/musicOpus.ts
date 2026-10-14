// Ours: re-encodes the built music (`Music/*.ogg`, Vorbis at ~95 kbps) as Opus at 48 kbps in the same
// Ogg container, keeping each file name, so URLs, the assets index and the cache worker see nothing
// new. Browsers that play Ogg Vorbis play Ogg Opus too. Halves the audio group (the largest one the
// player downloads after the essentials). Effects (`Sound/`) are short and stay as they are.
//
// Needs `ffmpeg` with libopus on the PATH; without it the step warns and leaves the music alone. A
// file already in Opus, one ffmpeg cannot read, or one whose Opus is not smaller is left as it was.
//
// Runs in `bun run build` after the Data copy, before the gzip sidecars and the assets index.
// Usage: bun run tools/musicOpus.ts [--root dist] [--bitrate 48k]

import { existsSync, readdirSync, readFileSync, renameSync, rmSync, statSync } from 'fs';
import { cpus } from 'os';
import { join, resolve } from 'path';

const arg = (name: string, fallback: string) => {
  const at = process.argv.indexOf(name);
  return at >= 0 ? process.argv[at + 1] : fallback;
};
const root = resolve(arg('--root', 'dist'));
const bitrate = arg('--bitrate', '48k');

if (Bun.spawnSync(['ffmpeg', '-hide_banner', '-encoders'], { stderr: 'ignore' }).stdout.toString().includes('libopus') === false) {
  console.warn('musicOpus: no ffmpeg with libopus on the PATH, music left as Vorbis');
  process.exit(0);
}

const files = ['game-assets', 'game-assets-v097d']
  .map(tree => join(root, tree, 'Music'))
  .filter(dir => existsSync(dir))
  .flatMap(dir => readdirSync(dir).filter(name => /\.ogg$/i.test(name)).map(name => join(dir, name)));

// An Ogg Opus stream starts its first packet with `OpusHead`, within the first page.
const isOpus = (path: string) => readFileSync(path).subarray(0, 512).includes(Buffer.from('OpusHead'));

let before = 0;
let after = 0;
let kept = 0;

async function convert(path: string) {
  const size = statSync(path).size;
  before += size;
  if (isOpus(path)) {
    after += size;
    return;
  }
  const tmp = `${path}.opus.tmp`;
  const ffmpeg = Bun.spawn(
    ['ffmpeg', '-v', 'error', '-y', '-i', path, '-map_metadata', '-1', '-c:a', 'libopus', '-b:a', bitrate, '-vbr', 'on', '-application', 'audio', '-f', 'ogg', tmp],
    { stderr: 'pipe' }
  );
  const ok = (await ffmpeg.exited) === 0 && existsSync(tmp) && statSync(tmp).size < size;
  if (ok) {
    renameSync(tmp, path);
    after += statSync(path).size;
  } else {
    rmSync(tmp, { force: true });
    after += size;
    kept++;
  }
}

let next = 0;
const worker = async () => {
  while (next < files.length) await convert(files[next++]);
};
await Promise.all(Array.from({ length: Math.max(1, cpus().length) }, worker));

const mb = (n: number) => (n / 1048576).toFixed(1);
console.log(`musicOpus: ${files.length} tracks at ${bitrate}, ${mb(before)} MB -> ${mb(after)} MB${kept ? `, ${kept} left as they were` : ''}`);
