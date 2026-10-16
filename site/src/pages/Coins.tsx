import { useState } from 'react';
import { createCoinOrder, getCoinBalance, getCoinPacks, session } from '../api';
import { useAsync } from '../lib/hooks';
import { useT } from '../i18n';
import { CoinIcon, ErrorBox, Loading, Reveal, SectionTitle } from '../components/ui';
import { apiError } from './Register';

export function Coins() {
  const { t, locale, fmtNumber } = useT();
  const logged = !!session.get();
  const balance = useAsync(getCoinBalance);
  const packs = useAsync(getCoinPacks);
  const [busy, setBusy] = useState<string | null>(null);
  const [notice, setNotice] = useState<{ id: string; text: string } | null>(null);
  const ars = new Intl.NumberFormat(locale, { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 });

  if (!logged) {
    return (
      <section className="wrap section narrow"><div className="card glass center">
        <CoinIcon />
        <h2>{t('coins.needLogin')}</h2><p>{t('coins.needLoginText')}</p>
        <a href="#/login?next=recargar" className="btn btn-gold">{t('nav.login')}</a>
      </div></section>
    );
  }

  async function pay(id: string) {
    setNotice(null);
    setBusy(id);
    try {
      const r = await createCoinOrder(id);
      if (r.ok) window.location.href = r.checkoutUrl; // init_point de Mercado Pago (backend real)
      else setNotice({ id, text: t(apiError(r.error)) });
    } catch {
      setNotice({ id, text: t('err.network') });
    } finally { setBusy(null); }
  }

  return (
    <section className="wrap section">
      <SectionTitle eyebrow={t('coins.eyebrow')} title={t('coins.title')}>{t('coins.subtitle')}</SectionTitle>
      <div className="card glass coin-card">
        <CoinIcon />
        <div><span>{t('coins.balance')}</span><b className="gold-num">{balance.data ? fmtNumber(balance.data.balance) : '…'}</b></div>
      </div>
      {packs.loading && !packs.data && <Loading />}
      {packs.error && <ErrorBox onRetry={packs.reload} />}
      <div className="packs">
        {(packs.data ?? []).map((p, i) => (
          <Reveal key={p.id} delay={i * 60}>
            <article className={`card glass pack ${p.bonus ? 'has-bonus' : ''}`}>
              {p.bonus > 0 && <span className="tag tag-gold">{t('coins.bonus', { n: fmtNumber(p.bonus) })}</span>}
              <CoinIcon />
              <b className="gold-num">{fmtNumber(p.coins)}</b>
              <span className="pack-unit">MU Coins</span>
              <strong className="pack-price">{ars.format(p.priceArs)}</strong>
              <button className="btn btn-gold btn-sm btn-block" disabled={busy !== null} onClick={() => pay(p.id)}>
                {busy === p.id ? t('coins.paying') : t('coins.pay')}
              </button>
              {notice?.id === p.id && <p className="form-error" role="alert">{notice.text}</p>}
            </article>
          </Reveal>
        ))}
      </div>
      <p className="muted center coins-note">{t('coins.note')} <a href="#/terminos">{t('coins.terms')}</a></p>
    </section>
  );
}
