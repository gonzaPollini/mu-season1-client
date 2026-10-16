# site

Web del server (ARGONMU ONLINE): inicio, registro, login y panel, rankings, información y términos.
App Vite propia como `register/`, sin Babylon ni assets del juego. Idiomas en `src/i18n/` (es es la fuente;
en y pt tipados contra ella). Los datos pasan por `src/api/`: hoy son mock (`VITE_SITE_MOCK`), el contrato
JSON de cada endpoint está en `API.md`.

- Dev: `bun run dev:site` (http://127.0.0.1:5176)
- Build: `bun run build:site` -> `dist-site/`
- Fondos de la portada: `public/img/` (banners oficiales de MU Online).
