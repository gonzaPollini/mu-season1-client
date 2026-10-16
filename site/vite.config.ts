import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

/**
 * La web pública del server (ARGONMU ONLINE) es su propia app Vite, igual que
 * `register/`: no arrastra Babylon ni los assets del juego. Comparte con el
 * cliente sólo `modules/servers/registerRules` (las reglas de cuenta).
 *
 * Dev:    bun run dev:site    -> http://127.0.0.1:5176
 * Build:  bun run build:site  -> ../dist-site
 */

const root = fileURLToPath(new URL('.', import.meta.url));
const repoRoot = fileURLToPath(new URL('..', import.meta.url));

export default defineConfig({
  root,
  base: './',
  plugins: [react()],
  resolve: {
    alias: [{ find: /^@\//, replacement: fileURLToPath(new URL('../src/', import.meta.url)) }],
  },
  build: {
    target: 'es2022',
    outDir: fileURLToPath(new URL('../dist-site', import.meta.url)),
    emptyOutDir: true,
  },
  server: {
    host: '127.0.0.1',
    port: 5176,
    strictPort: true,
    fs: { allow: [repoRoot] },
  },
});
