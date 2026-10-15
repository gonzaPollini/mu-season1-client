/** Chinese text of the `chaos_mix` module. */

import type en from './en';

export default {
  'jewelMix.lacking': '合成所需的道具不足。',
  'jewelMix.cannotDismantle': '无法拆分。',
  'jewelMix.cannotBundle': '无法打包',
  'jewelMix.noRoom': '背包空间不足',
  'jewelMix.disabled': '宝石打包功能暂时关闭',
} satisfies Partial<Record<keyof typeof en, string>>;
