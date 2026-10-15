/** Vietnamese text of the `chaos_mix` module. */

import type en from './en';

export default {
  'jewelMix.lacking': 'Thiếu vật phẩm để kết hợp.',
  'jewelMix.cannotDismantle': 'Không thể tách.',
  'jewelMix.cannotBundle': 'Bạn không thể đóng gói',
  'jewelMix.noRoom': 'Không còn chỗ trong túi đồ',
} satisfies Partial<Record<keyof typeof en, string>>;
