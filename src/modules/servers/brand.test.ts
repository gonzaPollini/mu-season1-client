import { describe, expect, it } from 'vitest';
import { parseBrand, pickText } from './brand';

const ok = {
  version: 1,
  name: 'MY MU',
  sub: 'ONLINE',
  logo: 'logo.svg',
  background: 'bg.jpg',
  mirror: true,
  fontUrl: 'https://fonts.googleapis.com/css2?family=Cinzel',
  colors: { gold: '#e8a93a', accent: 'red' },
  tips: [{ icon: 'a.svg', title: { es: 'Hola', en: 'Hi' }, text: { es: 'x' } }, { title: {}, text: {} }, 'bad'],
};

describe('parseBrand', () => {
  it('is null for anything that is not a version 1 object', () => {
    for (const raw of [null, 'x', 3, {}, { version: 2 }]) expect(parseBrand(raw)).toBeNull();
  });

  it('reads the fields, resolves files under the base and drops the bad ones', () => {
    const b = parseBrand(ok);
    expect(b).toMatchObject({ name: 'MY MU', sub: 'ONLINE', logo: './brand/logo.svg', background: './brand/bg.jpg', mirror: true });
    expect(b?.gold).toBe('#e8a93a');
    expect(b?.accent).toBeUndefined();
    expect(b?.tips).toHaveLength(1);
    expect(b?.tips[0].icon).toBe('./brand/a.svg');
  });

  it('refuses paths and foreign font hosts', () => {
    const b = parseBrand({ ...ok, logo: '../x.svg', background: 'http://evil/x.jpg', fontUrl: 'https://evil.com/x.css' });
    expect(b?.logo).toBeUndefined();
    expect(b?.background).toBeUndefined();
    expect(b?.fontUrl).toBeUndefined();
  });
});

describe('pickText', () => {
  it('prefers the language, then English, then any', () => {
    expect(pickText({ es: 'a', en: 'b' }, 'es')).toBe('a');
    expect(pickText({ en: 'b', pt: 'c' }, 'de')).toBe('b');
    expect(pickText({ pt: 'c' }, 'de')).toBe('c');
    expect(pickText({}, 'de')).toBe('');
  });
});
