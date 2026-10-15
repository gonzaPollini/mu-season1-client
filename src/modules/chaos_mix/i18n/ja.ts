/** Japanese text of the `chaos_mix` module. */

import type en from './en';

export default {
  'jewelMix.lacking': '合成に必要なアイテムが足りません。',
  'jewelMix.cannotDismantle': '解体できません。',
  'jewelMix.cannotBundle': 'まとめることができません',
  'jewelMix.noRoom': 'インベントリに空きがありません',
} satisfies Partial<Record<keyof typeof en, string>>;
