/** Portuguese text of the `chaos_mix` module. */

import type en from './en';

export default {
  'jewelMix.lacking': 'Faltam itens para a combinação.',
  'jewelMix.cannotDismantle': 'Não pode ser desmontado.',
  'jewelMix.cannotBundle': 'Você não pode empacotar',
  'jewelMix.noRoom': 'Não há espaço no inventário',
  'jewelMix.disabled': 'O empacotamento de joias está temporariamente desativado',
} satisfies Partial<Record<keyof typeof en, string>>;
