/** Romanian text of the `chaos_mix` module. */

import type en from './en';

export default {
  'jewelMix.lacking': 'Lipsesc obiecte pentru combinație.',
  'jewelMix.cannotDismantle': 'Nu poate fi dezmembrat.',
  'jewelMix.cannotBundle': 'Nu poți împacheta',
  'jewelMix.noRoom': 'Nu este loc în inventar',
} satisfies Partial<Record<keyof typeof en, string>>;
