/** Datos fijos del server. Un solo lugar: la home, Información y Términos leen de acá. */
export const SERVER = {
  name: 'ARGONMU ONLINE',
  season: 'Season 6',
  exp: 250,
  resetLevel: 400,
  /** Puntos libres = pointsPerReset × cantidad de resets (acumulativo). */
  pointsPerReset: 400,
  resetLimit: 'Sin límite',
  vip: false,
  helper: true,
  platform: 'Navegador',
  timezone: 'America/Argentina/Buenos_Aires',
  timezoneLabel: 'hora de Argentina (UTC-3)',
} as const;
