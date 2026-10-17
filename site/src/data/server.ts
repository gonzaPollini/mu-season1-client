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
  timezone: 'America/Argentina/Buenos_Aires',
  timezoneLabel: 'hora de Argentina (UTC-3)',
  /** Canal de Discord para comercio por dinero real entre jugadores (términos, punto 7). Vacío = todavía no existe. */
  discordTradeUrl: '',
} as const;
