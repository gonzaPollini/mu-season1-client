/** Spanish text of the `chaos_mix` module. */

import type en from './en';

export default {
  'jewelMix.lacking': 'Faltan objetos para la combinación.',
  'jewelMix.cannotDismantle': 'No se puede desarmar.',
  'jewelMix.cannotBundle': 'No podés empaquetar',
  'jewelMix.noRoom': 'No hay espacio en el inventario',
  'jewelMix.disabled': 'El empaquetado de joyas está desactivado momentáneamente',
} satisfies Partial<Record<keyof typeof en, string>>;
