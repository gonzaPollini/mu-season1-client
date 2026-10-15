/** Korean text of the `chaos_mix` module. */

import type en from './en';

export default {
  'jewelMix.lacking': '조합에 필요한 아이템이 부족합니다.',
  'jewelMix.cannotDismantle': '해체할 수 없습니다.',
  'jewelMix.cannotBundle': '묶을 수 없습니다',
  'jewelMix.noRoom': '인벤토리에 공간이 없습니다',
} satisfies Partial<Record<keyof typeof en, string>>;
