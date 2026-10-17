import { useT, type Key } from '../i18n';
import { SectionTitle } from '../components/ui';

const STEPS = [1, 2, 3, 4] as const;

/** Guía de las recompensas por tiempo jugado: cada 1 h, tope por día, se elige cajita o Zen. */
export function Rewards() {
  const { t } = useT();
  return (
    <section className="wrap section narrow">
      <img className="reward-hero" src="/img/reward-box.svg" alt="" width="120" height="120" />
      <SectionTitle eyebrow={t('rewards.eyebrow')} title={t('rewards.title')}>{t('rewards.subtitle')}</SectionTitle>
      <div className="reward-facts">
        <div className="card glass"><b>1 h</b><span>{t('rewards.fact.every')}</span></div>
        <div className="card glass"><b>2</b><span>{t('rewards.fact.perDay')}</span></div>
        <div className="card glass"><b>{t('rewards.fact.choice')}</b><span>{t('rewards.fact.choiceText')}</span></div>
      </div>
      <ol className="reward-steps">
        {STEPS.map((n) => (
          <li key={n} className="card glass"><span className="step-n">{String(n).padStart(2, '0')}</span><div><h3>{t(`rewards.s${n}.t` as Key)}</h3><p>{t(`rewards.s${n}.p` as Key)}</p></div></li>
        ))}
      </ol>
      <p className="muted center small">{t('rewards.note')}</p>
    </section>
  );
}
