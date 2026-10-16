import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { es } from './es';
import { en } from './en';
import { pt } from './pt';

/** i18n propio, sin librerías. `es` es la fuente de las claves. */
export type Key = keyof typeof es;
export type Dict = Record<Key, string>;
export type Lang = 'es' | 'en' | 'pt';

export const LANGS: { code: Lang; short: string; name: string; locale: string }[] = [
  { code: 'es', short: 'ES', name: 'Español', locale: 'es-AR' },
  { code: 'en', short: 'EN', name: 'English', locale: 'en-US' },
  { code: 'pt', short: 'PT', name: 'Português', locale: 'pt-BR' },
];

const DICTS: Record<Lang, Dict> = { es, en, pt };
const STORE_KEY = 'argonmu.lang';

export type TFn = (key: Key, vars?: Record<string, string | number>) => string;

function detect(): Lang {
  try {
    const saved = localStorage.getItem(STORE_KEY);
    if (saved === 'es' || saved === 'en' || saved === 'pt') return saved;
  } catch { /* sin storage */ }
  const nav = (typeof navigator !== 'undefined' ? navigator.language : 'es').toLowerCase();
  return nav.startsWith('pt') ? 'pt' : nav.startsWith('en') ? 'en' : 'es';
}

type Ctx = { lang: Lang; setLang: (l: Lang) => void; t: TFn; locale: string; fmtNumber: (n: number) => string };
const I18nContext = createContext<Ctx | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(detect);
  const value = useMemo<Ctx>(() => {
    const dict = DICTS[lang];
    const locale = LANGS.find((l) => l.code === lang)!.locale;
    const t: TFn = (key, vars) => {
      const raw = dict[key] ?? es[key] ?? key;
      return vars ? raw.replace(/\{(\w+)\}/g, (m, k: string) => (k in vars ? String(vars[k]) : m)) : raw;
    };
    return {
      lang, t, locale,
      setLang: (l) => { try { localStorage.setItem(STORE_KEY, l); } catch { /* sin storage */ } setLangState(l); },
      fmtNumber: (n) => n.toLocaleString(locale),
    };
  }, [lang]);

  // <html lang>, <title> y meta description siguen al idioma.
  useEffect(() => {
    document.documentElement.lang = lang;
    document.title = value.t('meta.title');
    document.querySelector('meta[name="description"]')?.setAttribute('content', value.t('meta.description'));
  }, [lang, value]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useT(): Ctx {
  const c = useContext(I18nContext);
  if (!c) throw new Error('useT fuera de <I18nProvider>');
  return c;
}
