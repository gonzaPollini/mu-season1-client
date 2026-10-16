import { useState, type FormEvent } from 'react';
import { changePassword, getCoinBalance, getMyCharacters, login, session, USE_MOCK } from '../api';
import { useAsync } from '../lib/hooks';
import { useT } from '../i18n';
import { CoinIcon, ErrorBox, Loading, SectionTitle } from '../components/ui';
import { apiError } from './Register';
import { MAX_ACCOUNT_PASSWORD_LENGTH, MIN_ACCOUNT_PASSWORD_LENGTH } from '@/modules/servers/registerRules';

/** `#/login?next=recargar` vuelve a esa página después de ingresar (sólo rutas conocidas). */
function nextRoute(): string {
  const next = new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('next');
  return next === 'recargar' ? '#/recargar' : '#/panel';
}

export function Login() {
  const { t } = useT();
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    if (!u || !p) return setErr(t('login.empty'));
    setBusy(true);
    try {
      const r = await login(u, p);
      if (r.ok) { session.set(r.token); window.location.hash = nextRoute(); } else setErr(t(apiError(r.error)));
    } catch {
      setErr(t('err.network'));
    } finally { setBusy(false); }
  }

  return (
    <section className="wrap section narrow">
      <SectionTitle eyebrow={t('acct.eyebrow')} title={t('login.title')} />
      <form className="card glass form" onSubmit={submit}>
        <label>{t('login.user')}<input value={u} maxLength={10} autoComplete="username" onChange={(e) => setU(e.target.value)} /></label>
        <label>{t('login.pass')}<input type="password" value={p} maxLength={10} autoComplete="current-password" onChange={(e) => setP(e.target.value)} /></label>
        {err && <p className="form-error" role="alert">{err}</p>}
        <button className="btn btn-gold btn-block" disabled={busy}>{busy ? t('login.submitting') : t('login.submit')}</button>
        <p className="muted center">{t('login.noAccount')} <a href="#/registro">{t('login.noAccountLink')}</a></p>
      </form>
    </section>
  );
}

export function Panel() {
  const { t } = useT();
  const logged = !!session.get();
  const { data, error, loading, reload } = useAsync(getMyCharacters);
  const coins = useAsync(getCoinBalance);
  const { fmtNumber } = useT();
  const [old, setOld] = useState('');
  const [nw, setNw] = useState('');
  const [nw2, setNw2] = useState('');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  if (!logged) {
    return (
      <section className="wrap section narrow"><div className="card glass center">
        <h2>{t('panel.needLogin')}</h2><p>{t('panel.needLoginText')}</p>
        <a href="#/login" className="btn btn-gold">{t('nav.login')}</a>
      </div></section>
    );
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setMsg(null);
    if (nw.length < MIN_ACCOUNT_PASSWORD_LENGTH || nw.length > MAX_ACCOUNT_PASSWORD_LENGTH) return setMsg({ ok: false, text: t('panel.passRange', { min: MIN_ACCOUNT_PASSWORD_LENGTH, max: MAX_ACCOUNT_PASSWORD_LENGTH }) });
    if (!/^[!-~]+$/.test(nw)) return setMsg({ ok: false, text: t('panel.passChars') });
    if (nw !== nw2) return setMsg({ ok: false, text: t('panel.passMismatch') });
    setBusy(true);
    try {
      const r = await changePassword(old, nw);
      setMsg(r.ok ? { ok: true, text: t('panel.passOk') } : { ok: false, text: t(apiError(r.error)) });
      if (r.ok) { setOld(''); setNw(''); setNw2(''); }
    } catch {
      setMsg({ ok: false, text: t('err.network') });
    } finally { setBusy(false); }
  }

  return (
    <section className="wrap section">
      <SectionTitle eyebrow={t('acct.eyebrow')} title={t('panel.title')}>
        {USE_MOCK ? t('panel.mock') : undefined}
      </SectionTitle>
      <div className="card glass coin-card">
        <CoinIcon />
        <div><span>{t('panel.coinsTitle')}</span><b className="gold-num">{coins.data ? fmtNumber(coins.data.balance) : '…'}</b></div>
        <a href="#/recargar" className="btn btn-gold btn-sm">{t('panel.recharge')}</a>
      </div>
      <div className="grid g2-wide">
        <div className="card glass">
          <h3 className="card-title">{t('panel.chars')}</h3>
          {loading && !data && <Loading />}
          {error && <ErrorBox onRetry={reload} />}
          <ul className="chars">
            {(data ?? []).map((c) => (
              <li key={c.name}>
                <div><strong>{c.name}</strong>{c.online && <span className="pill ok">{t('panel.online')}</span>}<span>{c.class}{c.guild ? ` · ${c.guild}` : ''}</span></div>
                <div className="nums"><b>{c.level}</b><small>{t('panel.level')}</small></div>
                <div className="nums"><b>{c.resets}</b><small>{t('panel.resets')}</small></div>
              </li>
            ))}
          </ul>
          <div className="hero-cta"><a href="/play" className="btn btn-gold btn-sm">{t('nav.play')}</a>
            <button className="btn btn-ghost btn-sm" onClick={() => { session.set(null); window.location.hash = '#/'; }}>{t('panel.logout')}</button></div>
        </div>
        <form className="card glass form" onSubmit={submit}>
          <h3 className="card-title">{t('panel.changePass')}</h3>
          <label>{t('panel.oldPass')}<input type="password" value={old} maxLength={10} autoComplete="current-password" onChange={(e) => setOld(e.target.value)} /></label>
          <label>{t('panel.newPass')}<input type="password" value={nw} maxLength={10} autoComplete="new-password" onChange={(e) => setNw(e.target.value)} /></label>
          <label>{t('panel.newPass2')}<input type="password" value={nw2} maxLength={10} autoComplete="new-password" onChange={(e) => setNw2(e.target.value)} /></label>
          {msg && <p className={msg.ok ? 'form-ok' : 'form-error'} role="alert">{msg.text}</p>}
          <button className="btn btn-gold" disabled={busy || !old || !nw}>{busy ? t('panel.saving') : t('panel.save')}</button>
          <p className="muted">{t('panel.offlineOnly')}</p>
        </form>
      </div>
    </section>
  );
}
