/**
 * Ours: a server's own look for the `?direct` loading screen (`DirectLoadPage`). The client is
 * generic, so nothing about a world is in code: the server provides `brand/brand.json` and its
 * images beside the client (`public/brand/`), read relative to the page at boot. No file, a 404
 * page or a malformed one gives `null` and the screen keeps its neutral look (readme.md, Brand).
 */

export type Localized = Readonly<Record<string, string>>;

export type BrandTip = { icon?: string; title: Localized; text: Localized };

export type Brand = {
  name: string;
  sub: string;
  /** Image URLs, already resolved under `brand/`. */
  logo?: string;
  background?: string;
  mirror: boolean;
  fontUrl?: string;
  gold?: string;
  goldHi?: string;
  accent?: string;
  tips: BrandTip[];
};

const MAX_BYTES = 64 * 1024;
const COLOR = /^#[0-9a-f]{3,8}$/i;
const FILE = /^[\w.-]+$/;
const MAX_TIPS = 20;

const str = (v: unknown, max = 120) => (typeof v === 'string' ? v.trim().slice(0, max) : '');

function localized(v: unknown): Localized {
  const out: Record<string, string> = {};
  if (v && typeof v === 'object') {
    for (const [code, text] of Object.entries(v)) {
      const s = str(text, 200);
      if (s && /^[a-z]{2,3}(-[A-Za-z]+)?$/.test(code)) out[code] = s;
    }
  }
  return out;
}

/** What `lang` reads from `field`: its own language, then English, then whichever there is. */
export function pickText(field: Localized, lang: string): string {
  return field[lang] ?? field[lang.split('-')[0]] ?? field.en ?? Object.values(field)[0] ?? '';
}

/** A file name of the brand folder (no path, no scheme), or undefined. */
const asset = (base: string, v: unknown) => {
  const f = str(v, 80);
  return FILE.test(f) ? `${base}${f}` : undefined;
};

export function parseBrand(raw: unknown, base = './brand/'): Brand | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (r.version !== 1) return null;
  const colors = (r.colors && typeof r.colors === 'object' ? r.colors : {}) as Record<string, unknown>;
  const color = (v: unknown) => (typeof v === 'string' && COLOR.test(v) ? v : undefined);
  const font = str(r.fontUrl, 300);
  const tips: BrandTip[] = [];
  for (const t of Array.isArray(r.tips) ? r.tips.slice(0, MAX_TIPS) : []) {
    if (!t || typeof t !== 'object') continue;
    const tip = t as Record<string, unknown>;
    const title = localized(tip.title);
    const text = localized(tip.text);
    if (Object.keys(title).length || Object.keys(text).length) {
      tips.push({ icon: asset(base, tip.icon), title, text });
    }
  }
  return {
    name: str(r.name, 40),
    sub: str(r.sub, 40),
    logo: asset(base, r.logo),
    background: asset(base, r.background),
    mirror: r.mirror === true,
    // Only a Google Fonts stylesheet: the file is data, not a way to load arbitrary code.
    fontUrl: font.startsWith('https://fonts.googleapis.com/') ? font : undefined,
    gold: color(colors.gold),
    goldHi: color(colors.goldHi),
    accent: color(colors.accent),
    tips,
  };
}

/** `brand/brand.json` beside the page, or null for any failure. */
export async function loadBrand(): Promise<Brand | null> {
  const abort = new AbortController();
  const timer = setTimeout(() => abort.abort(), 4000);
  try {
    const res = await fetch('./brand/brand.json', { cache: 'no-cache', credentials: 'omit', signal: abort.signal });
    if (!res.ok) return null;
    const text = await res.text();
    return text.length > MAX_BYTES ? null : parseBrand(JSON.parse(text));
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }
}
