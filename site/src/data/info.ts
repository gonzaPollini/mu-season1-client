import type { Key } from '../i18n';

/** Contenido de Información: sólo claves y datos; los textos viven en `i18n/*.ts`. */

export const RULES: Key[] = ['rule.1', 'rule.2', 'rule.3', 'rule.4', 'rule.5', 'rule.6', 'rule.7'];

export const RESET_STEPS: { title: Key; text: Key }[] = [
  { title: 'reset.s1.title', text: 'reset.s1.text' },
  { title: 'reset.s2.title', text: 'reset.s2.text' },
  { title: 'reset.s3.title', text: 'reset.s3.text' },
  { title: 'reset.s4.title', text: 'reset.s4.text' },
];

/** Tabla de ejemplo: puntos libres según resets (400 × resets). */
export const RESET_TABLE: { resets: number; points: number }[] = [1, 2, 3, 5, 10, 50].map((r) => ({ resets: r, points: 400 * r }));

export const HELPER_POINTS: Key[] = ['helper.1', 'helper.2', 'helper.3', 'helper.4'];

export type Comando = { cmd: string; alias?: string; desc: Key };

/** Los de stats están verificados contra `server/plugins/StatChatCommands.cs`. `/reset` es el comando oficial, plugin todavía sin escribir. */
export const COMMANDS: Comando[] = [
  { cmd: '/reset', desc: 'cmd.reset' },
  { cmd: '/addstr <n>', alias: '/fuerza <n>', desc: 'cmd.str' },
  { cmd: '/addagi <n>', alias: '/agilidad <n>', desc: 'cmd.agi' },
  { cmd: '/addvit <n>', alias: '/vitalidad <n>', desc: 'cmd.vit' },
  { cmd: '/addene <n>', alias: '/energia <n>', desc: 'cmd.ene' },
  { cmd: '/addcmd <n>', alias: '/comando <n>', desc: 'cmd.cmd' },
];

/** Nombres de clase y evoluciones no se traducen (son los del juego). */
export const CLASES: { id: 'dw' | 'dk' | 'elf' | 'mg' | 'dl' | 'sum' | 'rf'; name: string; evo: string }[] = [
  { id: 'dw', name: 'Dark Wizard', evo: 'Soul Master → Grand Master' },
  { id: 'dk', name: 'Dark Knight', evo: 'Blade Knight → Blade Master' },
  { id: 'elf', name: 'Fairy Elf', evo: 'Muse Elf → High Elf' },
  { id: 'mg', name: 'Magic Gladiator', evo: 'Duel Master' },
  { id: 'dl', name: 'Dark Lord', evo: 'Lord Emperor' },
  { id: 'sum', name: 'Summoner', evo: 'Bloody Summoner → Dimension Master' },
  { id: 'rf', name: 'Rage Fighter', evo: 'Fist Master' },
];
