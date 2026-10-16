import { useT, type Key } from '../i18n';
import { SectionTitle } from '../components/ui';

const N = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13] as const;

export function Terms() {
  const { t } = useT();
  return (
    <section className="wrap section narrow">
      <SectionTitle eyebrow={t('terms.eyebrow')} title={t('terms.title')} />
      <div className="card glass prose">
        {N.map((n) => (<div key={n}><h3>{t(`terms.${n}.t` as Key)}</h3><p>{t(`terms.${n}.p` as Key)}</p></div>))}
      </div>
    </section>
  );
}
