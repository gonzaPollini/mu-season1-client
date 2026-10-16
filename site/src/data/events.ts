/**
 * Eventos programados. Horarios de EJEMPLO, en hora de Argentina (UTC-3, sin
 * horario de verano). El server real los define en sus plugins/config; cuando
 * `getEvents()` pase a fetch, esto es sólo el mock.
 */
export type EventDef = {
  id: string;
  name: string;
  /** Qué es, en una línea. */
  desc: string;
  /** Horarios HH:MM (Argentina). */
  times: string[];
  /** Días de la semana (0 = domingo ... 6 = sábado). Vacío = todos. */
  days: number[];
  accent: 'gold' | 'cyan' | 'red' | 'violet';
};

export const EVENTS: EventDef[] = [
  { id: 'bc', name: 'Blood Castle', desc: 'Rompé la puerta, matá al Archangel y llevá el arma.', times: ['10:00', '13:00', '16:00', '19:00', '22:00'], days: [], accent: 'red' },
  { id: 'ds', name: 'Devil Square', desc: 'Oleadas de monstruos y puntaje para el ranking.', times: ['11:30', '14:30', '17:30', '20:30', '23:30'], days: [], accent: 'violet' },
  { id: 'cc', name: 'Chaos Castle', desc: 'Último en pie. Sin pociones de más.', times: ['12:00', '18:00', '21:00'], days: [], accent: 'cyan' },
  { id: 'golden', name: 'Invasión Golden', desc: 'Golden Titan, Goblin y compañía con drops dorados.', times: ['15:00', '21:30'], days: [], accent: 'gold' },
  { id: 'cs', name: 'Castle Siege', desc: 'Guerra de guilds por el castillo. Cada sábado.', times: ['20:00'], days: [6], accent: 'red' },
];
