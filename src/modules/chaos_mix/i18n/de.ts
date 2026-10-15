/** German text of the `chaos_mix` module. */

import type en from './en';

export default {
  'jewelMix.lacking': 'Für die Kombination fehlen Gegenstände.',
  'jewelMix.cannotDismantle': 'Kann nicht zerlegt werden.',
  'jewelMix.cannotBundle': 'Du kannst nicht bündeln',
  'jewelMix.noRoom': 'Im Inventar ist kein Platz',
  'jewelMix.disabled': 'Das Bündeln von Juwelen ist vorübergehend deaktiviert',
} satisfies Partial<Record<keyof typeof en, string>>;
