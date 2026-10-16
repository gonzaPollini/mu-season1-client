import { useEffect, useRef, useState, type ReactNode } from 'react';
import { session } from '../api';
import { LANGS, useT, type Key } from '../i18n';
import { Logo } from './ui';

const NAV: { to: string; label: Key }[] = [
  { to: '', label: 'nav.home' },
  { to: 'rankings', label: 'nav.rankings' },
  { to: 'info', label: 'nav.info' },
  { to: 'registro', label: 'nav.register' },
];

/** Botón compacto con el código (ES/EN/PT) y desplegable con el nombre del idioma. */
function LangSwitch({ onPick }: { onPick: () => void }) {
  const { lang, setLang, t } = useT();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = LANGS.find((l) => l.code === lang)!;

  useEffect(() => {
    if (!open) return;
    const away = (e: Event) => { if (!ref.current?.contains(e.target as Node)) setOpen(false); };
    const esc = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', away);
    document.addEventListener('keydown', esc);
    return () => { document.removeEventListener('pointerdown', away); document.removeEventListener('keydown', esc); };
  }, [open]);

  return (
    <div className="lang" ref={ref}>
      <button className="lang-btn" aria-haspopup="menu" aria-expanded={open} aria-label={t('nav.language')} onClick={() => setOpen(!open)}>
        <span>{current.short}</span>
        <svg viewBox="0 0 10 10" fill="currentColor" aria-hidden="true"><path d="M1 3h8L5 8Z" /></svg>
      </button>
      {open && (
        <ul className="lang-menu" role="menu">
          {LANGS.map((l) => (
            <li key={l.code} role="none">
              <button role="menuitemradio" aria-checked={l.code === lang} onClick={() => { setLang(l.code); setOpen(false); onPick(); }}>
                {l.name}<b>{l.short}</b>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function Layout({ route, children }: { route: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const { t } = useT();
  const logged = !!session.get();
  const close = () => setOpen(false);

  return (
    <>
      <div className="bg" aria-hidden="true"><i className="orb o1" /><i className="orb o2" /><i className="orb o3" /><i className="grain" /></div>
      <header className="topbar">
        <div className="wrap topbar-in">
          <a href="#/" className="brand" onClick={close}><Logo /></a>
          <button className="burger" aria-label={t('nav.menu')} aria-expanded={open} onClick={() => setOpen(!open)}><i /><i /><i /></button>
          <nav className={`nav ${open ? 'open' : ''}`}>
            {NAV.map((n) => (
              <a key={n.to} href={`#/${n.to}`} className={route === n.to ? 'active' : ''} onClick={close}>{t(n.label)}</a>
            ))}
            <a href="#/recargar" className={`nav-coins ${route === 'recargar' ? 'active' : ''}`} onClick={close}>{t('nav.coins')}</a>
            <a href={logged ? '#/panel' : '#/login'} className={route === 'login' || route === 'panel' ? 'active' : ''} onClick={close}>{logged ? t('nav.account') : t('nav.login')}</a>
            <LangSwitch onPick={close} />
            <a href="/play" className="btn btn-gold btn-sm nav-cta pulse"><span>{t('nav.play')}</span><small>{t('nav.playSub')}</small></a>
          </nav>
        </div>
      </header>
      <main key={route} className="page">{children}</main>
      <footer className="footer">
        <div className="wrap footer-in">
          <Logo />
          <p>{t('footer.tagline', { exp: 250 })}</p>
          <nav>
            <a href="#/info">{t('nav.info')}</a><a href="#/terminos">{t('terms.title')}</a><a href="#/rankings">{t('nav.rankings')}</a>
          </nav>
          <small>{t('footer.disclaimer')}</small>
        </div>
      </footer>
    </>
  );
}
