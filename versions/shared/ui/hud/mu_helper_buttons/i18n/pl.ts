/** Polish text of the `mu_helper_buttons` HUD element. */

import type en from './en';

export default {
  'muHelperButtons.start': 'Uruchom helper',
  'muHelperButtons.stop': 'Zatrzymaj helper',
  'muHelperButtons.settings': 'Ustawienia helpera',
} satisfies Partial<Record<keyof typeof en, string>>;
