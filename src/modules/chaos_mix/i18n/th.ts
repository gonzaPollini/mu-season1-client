/** Thai text of the `chaos_mix` module. */

import type en from './en';

export default {
  'jewelMix.lacking': 'ไอเทมสำหรับผสมไม่ครบ',
  'jewelMix.cannotDismantle': 'ไม่สามารถแยกได้',
  'jewelMix.cannotBundle': 'คุณไม่สามารถรวมเป็นชุดได้',
  'jewelMix.noRoom': 'ไม่มีที่ว่างในช่องเก็บของ',
} satisfies Partial<Record<keyof typeof en, string>>;
