import type { EventDef } from '../data/events';

/** Argentina no tiene horario de verano: siempre UTC-3. */
const AR_OFFSET_H = 3;

/** Próximas `n` ocurrencias (a partir de ahora) de un evento, como fechas reales. */
export function nextOccurrences(ev: Pick<EventDef, 'times' | 'days'>, n: number, from = new Date()): Date[] {
  const out: Date[] = [];
  const base = new Date(from.getTime() - AR_OFFSET_H * 3600_000); // «reloj de pared» argentino en campos UTC
  for (let d = 0; d < 15 && out.length < n; d++) {
    const day = new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), base.getUTCDate() + d));
    if (ev.days.length && !ev.days.includes(day.getUTCDay())) continue;
    for (const t of [...ev.times].sort()) {
      const [h = 0, m = 0] = t.split(':').map(Number);
      const when = new Date(day.getTime() + (h + AR_OFFSET_H) * 3600_000 + m * 60_000);
      if (when.getTime() > from.getTime() && out.length < n) out.push(when);
    }
  }
  return out;
}

export function splitRemaining(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

export const pad = (n: number) => String(n).padStart(2, '0');

/** «sáb 20:00» / «Sat 20:00» en hora de Argentina, según el idioma. */
export function arLabel(d: Date, locale: string): string {
  return new Intl.DateTimeFormat(locale, { weekday: 'short', hour: '2-digit', minute: '2-digit', hourCycle: "h23", timeZone: 'America/Argentina/Buenos_Aires' }).format(d);
}

export function arDate(iso: string, locale: string): string {
  return new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date(iso + 'T12:00:00Z'));
}
