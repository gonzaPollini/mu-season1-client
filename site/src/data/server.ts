/** Datos fijos del server. Un solo lugar: la home, Información y Términos leen de acá. */
export const SERVER = {
  name: 'ARGONMU ONLINE',
  season: 'Season 6',
  exp: 320,
  resetLevel: 400,
  /** Puntos libres = pointsPerReset × cantidad de resets (acumulativo). */
  pointsPerReset: 400,
  resetLimit: 'Sin límite',
  vip: false,
  helper: true,
  platform: 'Navegador',
  /**
   * A donde van «Navegador» y «JUGAR AHORA»: el cliente, que con `?direct` entra directo al login
   * de este server (sin lista de mundos). Local: Caddy en :4173 con los endpoints por defecto del
   * build (proxy 127.0.0.1:3000, connect 44405). Producción: 'https://play.<dominio>/?direct'
   * (el build ya trae `VITE_WS_HOST`/`VITE_CS_HOST`; si no, sumar `&cs=<host>:44405&ws=wss://ws.<dominio>`).
   */
  playUrl: 'http://127.0.0.1:4173/?direct',
  timezone: 'America/Argentina/Buenos_Aires',
  timezoneLabel: 'hora de Argentina (UTC-3)',
  /** Canal de Discord para comercio por dinero real entre jugadores (términos, punto 7). Vacío = todavía no existe. */
  discordTradeUrl: '',
} as const;
