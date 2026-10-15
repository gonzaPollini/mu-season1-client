import { createHash } from 'crypto';
import { describe, expect, it } from 'vitest';
import { EN_TEXT, i18n, t, type TextKey } from './index';

/**
 * Pins what `t(key)` returns for every key in every language, switching the
 * language through the engine, plus each language's selector metadata. Moving
 * text between files must leave every hash as it is.
 */

const KEYS = (Object.keys(EN_TEXT) as TextKey[]).sort();

function languageHash(code: string): string {
  i18n.setLanguage(code);
  expect(i18n.language).toBe(code);

  const layer = i18n.current;
  const pack = layer.dataPack;
  const hash = createHash('sha256');
  hash.update(
    JSON.stringify([
      layer.name, layer.code, layer.aliases ?? [], layer.label, layer.region, layer.font ?? '',
      pack ? [pack.folder, pack.suffix, pack.encoding ?? '', !!pack.repairs, !!pack.itemNames, !!pack.dialogPages] : null,
    ])
  );
  for (const key of KEYS) hash.update(`${key}\t${t(key)}\t${i18n.translated(key)}\n`);
  return hash.digest('hex').slice(0, 16);
}

describe('text golden', () => {
  it('every key reads the same line in every language', () => {
    const was = i18n.language;
    const hashes = Object.fromEntries(i18n.languages.map(l => [l.code, languageHash(l.code)]));
    i18n.setLanguage(was);

    expect(KEYS.length).toBe(2606);
    expect(hashes).toEqual({
      en: 'a4b339a595dc17e4',
      bg: '0faae7d19061b27a',
      zh: 'bc17bd833c4275cd',
      fr: 'a576afd5a6158251',
      de: '767f84fc6923c408',
      it: '5b40fed939c0cf03',
      ja: 'fdd3e73edf9c5e84',
      ko: 'e453c8b536c7736e',
      pl: '44eb6fa9a4c3e0d4',
      pt: '7a6dc3241d944470',
      ro: 'b67defb67fb9a2ad',
      ru: '5327430f3d7a8f8d',
      es: '034605863d237dd9',
      th: '02237dee67b3e447',
      vi: 'c3448194f88c3147',
    });
  });
});
