/** Japanese text of the `chaos_mix` module. */

import type en from './en';

export default {
  'jewelMix.lacking': '合成に必要なアイテムが足りません。',
  'jewelMix.cannotDismantle': '解体できません。',
  'jewelMix.cannotBundle': 'まとめることができません',
  'jewelMix.noRoom': 'インベントリに空きがありません',
  'jewelMix.disabled': 'ジュエルのまとめ機能は一時的に無効です',
} satisfies Partial<Record<keyof typeof en, string>>;
