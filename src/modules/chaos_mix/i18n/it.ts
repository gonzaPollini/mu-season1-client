/** Italian text of the `chaos_mix` module. */

import type en from './en';

export default {
  'jewelMix.lacking': 'Mancano oggetti per la combinazione.',
  'jewelMix.cannotDismantle': 'Non può essere smontato.',
  'jewelMix.cannotBundle': 'Non puoi impacchettare',
  'jewelMix.noRoom': "Non c'è spazio nell'inventario",
  'jewelMix.disabled': 'Il raggruppamento dei gioielli è temporaneamente disattivato',
} satisfies Partial<Record<keyof typeof en, string>>;
