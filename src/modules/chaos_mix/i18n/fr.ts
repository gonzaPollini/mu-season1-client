/** French text of the `chaos_mix` module. */

import type en from './en';

export default {
  'jewelMix.lacking': 'Il manque des objets pour la combinaison.',
  'jewelMix.cannotDismantle': 'Impossible à démonter.',
  'jewelMix.cannotBundle': 'Vous ne pouvez pas empaqueter',
  'jewelMix.noRoom': "Il n'y a pas de place dans l'inventaire",
} satisfies Partial<Record<keyof typeof en, string>>;
