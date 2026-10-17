import { useT, type Key } from '../i18n';
import { SectionTitle } from '../components/ui';
import { SERVER } from '../data/server';

const N = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14] as const;

export function Terms() {
  const { t } = useT();
  return (
    <section className="wrap section narrow">
      <SectionTitle eyebrow={t('terms.eyebrow')} title={t('terms.title')} />
      <div className="card glass prose">
        {N.map((n) => (<div key={n}><h3>{t(`terms.${n}.t` as Key)}</h3><p>{t(`terms.${n}.p` as Key)}</p>{n === 7 && <p>{SERVER.discordTradeUrl ? <a href={SERVER.discordTradeUrl} target="_blank" rel="noopener noreferrer">{t('terms.7.link')}</a> : <>{t('terms.7.link')} {t('terms.7.soon')}</>}</p>}</div>))}
      </div>
    </section>
  );
}
