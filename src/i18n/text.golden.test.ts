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

    expect(KEYS.length).toBe(2597);
    expect(hashes).toEqual({
      en: '366d9d92b47dae28',
      bg: '1404be2799efc608',
      zh: 'ed4ddf003863be89',
      fr: 'bc80a3f2e12c5c12',
      de: '4b72a2da4e06eade',
      it: '25fbf3e6c2cd3387',
      ja: '0e499c6618f2ffe1',
      ko: 'f84969cc25a5a639',
      pl: 'f6ee7f5e83cc61b8',
      pt: 'db452380a958445e',
      ro: '4a39586c2b2bde98',
      ru: '447965e9eb081903',
      es: 'd8c5ea1afd04332d',
      th: 'f1d1fcc2a11f4cbd',
      vi: '1915dff43bdfeb68',
    });
  });
});
