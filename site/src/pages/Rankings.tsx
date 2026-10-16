import { useEffect, useMemo, useState } from 'react';
import { getRankings, type CharRow, type GuildRow, type RankingType } from '../api';
import { useAsync } from '../lib/hooks';
import { useT, type Key } from '../i18n';
import { ErrorBox, Loading, SectionTitle } from '../components/ui';

const TABS: RankingType[] = ['resets', 'level', 'killers', 'hours', 'guilds'];
const PAGE = 15;

export function Rankings() {
  const { t, locale, fmtNumber } = useT();
  const [tab, setTab] = useState<RankingType>('resets');
  const [q, setQ] = useState('');
  const [page, setPage] = useState(0);
  const { data, error, loading, reload } = useAsync(() => getRankings(tab), [tab]);

  useEffect(() => setPage(0), [tab, q]);

  const rows = useMemo(() => {
    if (!data) return [];
    const term = q.trim().toLowerCase();
    return (data.rows as (CharRow | GuildRow)[]).filter((r) => !term || r.name.toLowerCase().includes(term));
  }, [data, q]);

  const pages = Math.max(1, Math.ceil(rows.length / PAGE));
  const slice = rows.slice(page * PAGE, page * PAGE + PAGE);
  const updated = data ? new Intl.DateTimeFormat(locale, { hour: '2-digit', minute: '2-digit', timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date(data.updatedAt)) : null;

  return (
    <section className="wrap section">
      <SectionTitle eyebrow={t('rank.eyebrow')} title={t('rank.title')}>
        {updated ? t('rank.subtitleUpdated', { time: updated }) : t('rank.subtitle')}
      </SectionTitle>
      <div className="card glass">
        <div className="tabs" role="tablist">
          {TABS.map((id) => (
            <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => setTab(id)}>{t(`tab.${id}` as Key)}</button>
          ))}
        </div>
        <input className="search" type="search" placeholder={tab === 'guilds' ? t('search.guild') : t('search.char')} value={q} onChange={(e) => setQ(e.target.value)} />
        {loading && !data && <Loading />}
        {error && <ErrorBox onRetry={reload} />}
        {data && (
          <div className="table-wrap">
            <table className="table">
              {data.type === 'guilds' ? (
                <>
                  <thead><tr><th>#</th><th>{t('col.guild')}</th><th>{t('col.master')}</th><th className="r">{t('col.members')}</th><th className="r">{t('col.points')}</th></tr></thead>
                  <tbody>{(slice as GuildRow[]).map((g) => (
                    <tr key={g.name}><td><Rank n={g.rank} /></td><td><strong>{g.name}</strong></td><td>{g.master}</td><td className="r">{g.members}</td><td className="r">{fmtNumber(g.score)}</td></tr>
                  ))}</tbody>
                </>
              ) : (
                <>
                  <thead><tr><th>#</th><th>{t('col.char')}</th><th className="hide-sm">{t('col.class')}</th><th className="hide-sm">{t('col.guild')}</th><th className="r">{t('col.level')}</th><th className="r">{tab === 'killers' ? t('col.kills') : tab === 'hours' ? t('col.hours') : t('col.resets')}</th></tr></thead>
                  <tbody>{(slice as CharRow[]).map((c) => (
                    <tr key={c.name}>
                      <td><Rank n={c.rank} /></td>
                      <td><strong>{c.name}</strong>{c.online && <span className="pill ok">{t('rank.online')}</span>}</td>
                      <td className="hide-sm">{c.class}</td><td className="hide-sm">{c.guild ?? '-'}</td>
                      <td className="r">{c.level}</td><td className="r"><b>{tab === 'killers' ? c.kills : tab === 'hours' ? `${fmtNumber(c.hours ?? 0)} h` : c.resets}</b></td>
                    </tr>
                  ))}</tbody>
                </>
              )}
            </table>
            {!rows.length && <p className="muted center pad">{t('rank.noResults', { q })}</p>}
          </div>
        )}
        <div className="pager">
          <button className="btn btn-ghost btn-sm" disabled={page === 0} onClick={() => setPage(page - 1)}>{t('page.prev')}</button>
          <span>{t('page.of', { p: page + 1, n: pages })}</span>
          <button className="btn btn-ghost btn-sm" disabled={page + 1 >= pages} onClick={() => setPage(page + 1)}>{t('page.next')}</button>
        </div>
      </div>
    </section>
  );
}

function Rank({ n }: { n: number }) {
  return <span className={`medal ${n <= 3 ? `m${n}` : ''}`}>{n}</span>;
}
