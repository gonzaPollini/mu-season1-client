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

    expect(KEYS.length).toBe(2605);
    expect(hashes).toEqual({
      en: '070ac65a7aa2ba3a',
      bg: '27adbf2dc20d3223',
      zh: '5e43c9a8a0e6acd6',
      fr: 'dff651f8bb9bfeb2',
      de: 'e906b629ffc2b54d',
      it: '00b18ceb8459a34e',
      ja: '0acb5465252de1ec',
      ko: 'a4b6207c2ecb87c2',
      pl: 'd9402f9b2c52ef62',
      pt: '9fa397528968594e',
      ro: 'b90787dc3d62b7bd',
      ru: 'ea7298434c4f6c39',
      es: '431b52874152daf9',
      th: 'e0eaa1df44258183',
      vi: 'd8ceb629dca47832',
    });
  });
});
