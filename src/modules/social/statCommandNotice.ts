import { reaction } from 'mobx';
import { t } from '../../i18n';
import { Hero } from '../hero';
import { addNotification } from '../chat/notify';

/**
 * Ours: OpenMU answers `/addstr 100` (and `/add str 100`, `/fuerza 100`) without a line of text, so the client
 * says it: once the hero's free points drop after such a command, how many went into which stat.
 */

type Stat = 'str' | 'agi' | 'vit' | 'ene' | 'cmd';

const COMMAND = /^\/(?:add\s*(str|agi|vit|ene|cmd)|(fuerza|agilidad|vitalidad|energia|comando))\s+\d+/i;
/** The server's Spanish aliases (mu-season1-server `StatChatCommands.cs`). */
const ALIAS: Record<string, Stat> = { fuerza: 'str', agilidad: 'agi', vitalidad: 'vit', energia: 'ene', comando: 'cmd' };
/** The server's answer is a warp for more than one point: give it time. */
const WAIT_MS = 15000;

/** The points come back one +1 answer at a time (or as one warp): report once they settle. */
const SETTLE_MS = 400;

let pending: { stat: Stat; before: number; until: number } | null = null;
let settle: ReturnType<typeof setTimeout> | undefined;

reaction(
  () => Hero.points,
  () => {
    if (!pending || performance.now() > pending.until) return;
    clearTimeout(settle);
    settle = setTimeout(report, SETTLE_MS);
  }
);

function report(): void {
  if (!pending) return;
  const added = pending.before - Hero.points;
  if (added <= 0) return;
  addNotification(t('stats.added', { amount: added, stat: t(`stats.name.${pending.stat}`) }));
  pending = null;
}

/** Called with every line `sendChat` sends: remembers a stat command until its answer. */
export function watchStatCommand(text: string): void {
  const match = COMMAND.exec(text.trim());
  if (!match) return;
  const stat = match[1] ? (match[1].toLowerCase() as Stat) : ALIAS[match[2].toLowerCase()];
  pending = { stat, before: Hero.points, until: performance.now() + WAIT_MS };
}
