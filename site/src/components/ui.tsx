import type { ReactNode } from 'react';
import { useCountUp, useInView } from '../lib/hooks';
import { useT } from '../i18n';

/** Logo tipográfico: emblema SVG + «ARGONMU» en dorado + «ONLINE» espaciado en cian. */
export function Logo({ size = 'md' }: { size?: 'md' | 'lg' }) {
  return (
    <span className={`logo logo-${size}`} aria-label="ARGONMU ONLINE">
      <svg className="logo-mark" viewBox="0 0 48 48" aria-hidden="true">
        <defs>
          <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffe3a0" />
            <stop offset="0.55" stopColor="#e8a93a" />
            <stop offset="1" stopColor="#9b5e12" />
          </linearGradient>
        </defs>
        <path d="M24 2 44 13.500v21L24 46 4 34.500v-21Z" fill="#0b0d14" stroke="url(#lg1)" strokeWidth="2" />
        <path d="M24 10 36 36h-5.200l-2.200-5.200H19.400L17.200 36H12Zm0 9.600-3 7.200h6Z" fill="url(#lg1)" fillRule="evenodd" />
        <path d="M24 2v4M24 42v4" stroke="#4fd8e6" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <span className="logo-text">
        <span className="logo-main">ARGONMU</span>
        <span className="logo-sub">ONLINE</span>
      </span>
    </span>
  );
}

/** Aparece con un fade + subida al entrar en pantalla. */
export function Reveal({ children, delay = 0, className = '' }: { children: ReactNode; delay?: number; className?: string }) {
  const [ref, visible] = useInView<HTMLDivElement>();
  return (
    <div ref={ref} className={`reveal ${visible ? 'in' : ''} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}

/** Número que cuenta hasta su valor al entrar en pantalla. */
export function Counter({ value, suffix = '', prefix = '' }: { value: number; suffix?: string; prefix?: string }) {
  const [ref, visible] = useInView<HTMLSpanElement>();
  const v = useCountUp(value, visible);
  const { fmtNumber } = useT();
  return <span ref={ref}>{prefix}{fmtNumber(v)}{suffix}</span>;
}

export function SectionTitle({ eyebrow, title, children }: { eyebrow: string; title: string; children?: ReactNode }) {
  return (
    <header className="section-title">
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {children && <p>{children}</p>}
    </header>
  );
}

export function Loading() {
  const { t } = useT();
  return <div className="loading" role="status"><span className="spinner" />{t('state.loading')}</div>;
}

export function ErrorBox({ onRetry }: { onRetry?: () => void }) {
  const { t } = useT();
  return (
    <div className="errorbox" role="alert">
      <strong>{t('state.errorTitle')}</strong>
      <span>{t('err.network')}</span>
      {onRetry && <button className="btn btn-ghost btn-sm" onClick={onRetry}>{t('state.retry')}</button>}
    </div>
  );
}

const ICONS = {
  web: <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm0 2c.9 1 1.7 2.800 2.100 5H9.900C10.300 6.800 11.100 5 12 4ZM4.300 14a8 8 0 0 1 0-4h3.600a15 15 0 0 0 0 4Zm.9 2h3c.3 1.500.8 2.800 1.400 3.800A8 8 0 0 1 5.200 16Zm3-8h-3a8 8 0 0 1 4.400-3.800C9 5.200 8.500 6.500 8.200 8Zm1.700 8h4.200c-.4 2.200-1.200 4-2.100 5-.9-1-1.700-2.800-2.100-5Zm.2-2a13 13 0 0 1 0-4h3.800a13 13 0 0 1 0 4Zm5.300 5.800c.6-1 1.100-2.300 1.400-3.800h3a8 8 0 0 1-4.400 3.800ZM16.100 14a15 15 0 0 0 0-4h3.600a8 8 0 0 1 0 4Zm-.3-6c-.3-1.500-.8-2.800-1.400-3.800A8 8 0 0 1 18.800 8Z" />,
  windows: <path d="M3 5.500 10.500 4.500v7H3Zm8.500-1.100L21 3v8.500h-9.500ZM3 12.500h7.500v7L3 18.500Zm8.500 0H21V21l-9.500-1.400Z" />,
  android: <path d="M6 9h12v8a1 1 0 0 1-1 1h-1v3a1.200 1.200 0 0 1-2.400 0v-3h-3.200v3A1.200 1.200 0 0 1 8 21v-3H7a1 1 0 0 1-1-1Zm-2.200 0a1.200 1.200 0 0 1 2.400 0v5a1.200 1.200 0 0 1-2.400 0Zm16 0a1.200 1.200 0 0 1 2.400 0v5a1.200 1.200 0 0 1-2.400 0ZM7 8a5 5 0 0 1 2.300-4L8.300 2.300l.7-.4 1.100 1.800a5.600 5.600 0 0 1 3.800 0L15 1.900l.7.400-1 1.700A5 5 0 0 1 17 8Zm3-2.500a.6.600 0 1 0 0 1.200.6.600 0 0 0 0-1.200Zm4 0a.6.600 0 1 0 0 1.200.6.600 0 0 0 0-1.200Z" />,
  mac: <path d="M16.400 12.600c0-2.400 2-3.500 2-3.600-1.100-1.600-2.800-1.800-3.400-1.800-1.400-.1-2.800.9-3.500.9s-1.800-.8-3-.8c-1.500 0-3 .9-3.800 2.300-1.600 2.800-.4 7 1.200 9.300.8 1.100 1.700 2.400 2.900 2.300 1.200 0 1.600-.7 3-.7s1.800.7 3 .7c1.300 0 2.100-1.100 2.800-2.200.9-1.300 1.300-2.500 1.300-2.600-.1 0-2.500-1-2.500-3.800ZM14.200 5.500c.6-.8 1.100-1.900.9-3-1 0-2.100.6-2.800 1.400-.6.700-1.100 1.800-1 2.900 1.100.1 2.200-.5 2.900-1.300Z" />,
};

/** Cuatro botones de plataforma: sólo el navegador está activo por ahora. */
export function PlatformButtons() {
  const { t } = useT();
  const items: { id: keyof typeof ICONS; label: string; href?: string }[] = [
    { id: 'web', label: t('plat.browser'), href: '/play' },
    { id: 'windows', label: t('plat.windows') },
    { id: 'android', label: t('plat.android') },
    { id: 'mac', label: t('plat.mac') },
  ];
  return (
    <div className="platforms">
      {items.map((p) => {
        const inner = (
          <>
            <svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">{ICONS[p.id]}</svg>
            <span>{p.label}</span>
            {!p.href && <em className="soon-badge">{t('plat.soon')}</em>}
          </>
        );
        return p.href
          ? <a key={p.id} href={p.href} className="plat plat-on pulse">{inner}</a>
          : <span key={p.id} className="plat" aria-disabled="true">{inner}</span>;
      })}
    </div>
  );
}
