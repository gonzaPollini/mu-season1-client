import { useState, type FormEvent } from 'react';
import { register } from '../api';
import { SERVER } from '../data/server';
import { validateSignup } from '@/modules/servers/registerRules';
import { useT, type Key } from '../i18n';
import { SectionTitle } from '../components/ui';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Código de error de la API -> clave traducida (con respaldo genérico). */
export function apiError(code: string): Key {
  const k = `err.${code}` as Key;
  return (['err.userExists', 'err.badCredentials', 'err.badOldPassword', 'err.playerOnline', 'err.rateLimited', 'err.paymentsDisabled'] as Key[]).includes(k) ? k : 'err.generic';
}

export function Register() {
  const { t } = useT();
  const [f, setF] = useState({ username: '', password: '', confirm: '', email: '', adult: false, terms: false });
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const set = <K extends keyof typeof f>(k: K, v: (typeof f)[K]) => setF((s) => ({ ...s, [k]: v }));

  async function submit(e: FormEvent) {
    e.preventDefault();
    setErr(null);
    const problem = validateSignup(f);
    if (problem) return setErr(t(`problem.${problem}` as Key));
    if (f.username.length > 10) return setErr(t('reg.idLong'));
    if (f.password.length > 10) return setErr(t('reg.passLong'));
    if (!EMAIL_RE.test(f.email)) return setErr(t('reg.emailBad'));
    if (!f.adult) return setErr(t('reg.needAdult'));
    if (!f.terms) return setErr(t('reg.needTerms'));
    setBusy(true);
    try {
      const r = await register({ username: f.username, password: f.password, email: f.email });
      if (r.ok) setDone(true); else setErr(t(apiError(r.error)));
    } catch {
      setErr(t('err.network'));
    } finally {
      setBusy(false);
    }
  }

  if (done) {
    return (
      <section className="wrap section narrow">
        <div className="card glass center">
          <div className="check">✓</div>
          <h2>{t('reg.doneTitle')}</h2>
          <p>{t('reg.doneText', { user: f.username })}</p>
          <div className="hero-cta"><a href={SERVER.playUrl} className="btn btn-gold">{t('nav.play')}</a><a href="#/login" className="btn btn-ghost">{t('reg.doneLogin')}</a></div>
        </div>
      </section>
    );
  }

  return (
    <section className="wrap section narrow">
      <SectionTitle eyebrow={t('reg.eyebrow')} title={t('reg.title')}>{t('reg.subtitle')}</SectionTitle>
      <form className="card glass form" onSubmit={submit} noValidate>
        <label>{t('reg.user')}<input value={f.username} maxLength={10} autoComplete="username" onChange={(e) => set('username', e.target.value)} placeholder={t('reg.userPh')} /></label>
        <div className="row2">
          <label>{t('reg.pass')}<input type="password" value={f.password} maxLength={10} autoComplete="new-password" onChange={(e) => set('password', e.target.value)} placeholder={t('reg.passPh')} /></label>
          <label>{t('reg.confirm')}<input type="password" value={f.confirm} maxLength={10} autoComplete="new-password" onChange={(e) => set('confirm', e.target.value)} /></label>
        </div>
        <label>{t('reg.email')}<input type="email" value={f.email} autoComplete="email" onChange={(e) => set('email', e.target.value)} placeholder={t('reg.emailPh')} /></label>
        <label className="check-row"><input type="checkbox" checked={f.adult} onChange={(e) => set('adult', e.target.checked)} /><span>{t('reg.adult')}</span></label>
        <label className="check-row"><input type="checkbox" checked={f.terms} onChange={(e) => set('terms', e.target.checked)} /><span>{t('reg.termsPre')}<a href="#/terminos" target="_blank" rel="noreferrer">{t('reg.termsLink')}</a></span></label>
        {err && <p className="form-error" role="alert">{err}</p>}
        <button className="btn btn-gold btn-block" disabled={busy}>{busy ? t('reg.submitting') : t('reg.submit')}</button>
        <p className="muted center">{t('reg.haveAccount')} <a href="#/login">{t('reg.haveAccountLink')}</a></p>
      </form>
    </section>
  );
}
