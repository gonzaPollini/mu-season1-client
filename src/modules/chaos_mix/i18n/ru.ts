/** Russian text of the `chaos_mix` module. */

import type en from './en';

export default {
  'jewelMix.lacking': 'Не хватает предметов для комбинации.',
  'jewelMix.cannotDismantle': 'Нельзя разделить.',
  'jewelMix.cannotBundle': 'Вы не можете упаковать',
  'jewelMix.noRoom': 'В инвентаре нет места',
} satisfies Partial<Record<keyof typeof en, string>>;
