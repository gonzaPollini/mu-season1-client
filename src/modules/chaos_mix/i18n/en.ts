/** English text of the `chaos_mix` module. See src/i18n/readme.md. */

const en = {
  'jewelMix.lacking': 'Items for combination system is lacking.',
  'jewelMix.cannotDismantle': "Can't be dismantled.",
  'jewelMix.cannotBundle': "You can't bundle",
  'jewelMix.noRoom': 'There is no room in the inventory',
};

export default en;

declare module '@/i18n' {
  interface TextOwners {
    'src/modules/chaos_mix': typeof en;
  }
}
