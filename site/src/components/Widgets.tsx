import { getEvents, getRankings, getStatus } from '../api';
import { useAsync } from '../lib/hooks';
import { arDate, arLabel } from '../lib/time';
import { SERVER } from '../data/server';
import { NEWS } from '../data/news';
import { useT } from '../i18n';
import { ErrorBox, Loading } from './ui';
import { Countdown } from './Countdown';

export function EventsWidget({ limit = 5 }: { limit?: number }) {
  const { t, locale } = useT();
  const { data, error, loading, reload } = useAsync(getEvents);
  const list = (data ?? [])
    .map((e) => ({ ...e, first: e.next[0] ?? '' }))
    .filter((e) => e.first)
    .sort((a, b) => a.first.localeCompare(b.first))
    .slice(0, limit);
  return (
    <div className="card glass">
      <h3 className="card-title">{t('events.title')} <small>{t('events.tz')}</small></h3>
      {loading && !data && <Loading />}
      {error && <ErrorBox onRetry={reload} />}
      <ul className="events">
        {list.map((e, i) => (
          <li key={e.id} className={i === 0 ? 'first' : ''}>
            <div><strong>{e.name}</strong><span>{arLabel(new Date(e.first), locale)}</span></div>
            <Countdown target={e.first} />
          </li>
        ))}
      </ul>
    </div>
  );
}

export function TopResets() {
  const { t } = useT();
  const { data, error, loading, reload } = useAsync(() => getRankings('resets'));
  const rows = data && data.type !== 'guilds' ? data.rows.slice(0, 5) : [];
  return (
    <div className="card glass">
      <h3 className="card-title">{t('top.title')} <a href="#/rankings" className="more">{t('top.all')}</a></h3>
      {loading && !data && <Loading />}
      {error && <ErrorBox onRetry={reload} />}
      <ol className="top5">
        {rows.map((r) => (
          <li key={r.name}>
            <span className={`medal m${r.rank}`}>{r.rank}</span>
            <div><strong>{r.name}</strong><span>{r.class} · <i className={`st ${r.online ? 'on' : 'off'}`}>{t(r.online ? 'rank.online' : 'rank.offline')}</i></span></div>
            <b>{r.resets}<small> {t('top.short')}</small></b>
          </li>
        ))}
      </ol>
    </div>
  );
}

const I = {
  users: <path d="M16 11a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm-8 0a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm0 2c-2.300 0-7 1.200-7 3.500V19h14v-2.500C15 14.200 10.300 13 8 13Zm8 0c-.3 0-.6 0-1 .1 1.200.8 2 2 2 3.400V19h6v-2.500c0-2.300-4.700-3.500-7-3.500Z" />,
  bolt: <path d="M13 2 4 14h6l-1 8 9-12h-6Z" />,
  crown: <path d="M3 18 2 7l5 4 5-7 5 7 5-4-1 11Zm0 2h18v2H3Z" />,
  plus: <path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7Z" />,
  scale: <path d="M11 3h2v2.100l5.500 1.400.5-1 1.800.9-.6 1.200L23 13a4 4 0 0 1-8 0l2.700-5.100L13 6.700V19h4v2H7v-2h4V6.700L6.300 7.900 9 13a4 4 0 0 1-8 0l2.800-5.400-.6-1.200 1.800-.9.5 1L11 5.100Zm-6 5.700L3.100 12.500h3.800Zm14 0-1.900 3.800h3.800Z" />,
  freeToPlay: <path d="M11.8 10.9c-2.270-.590-3-1.200-3-2.150 0-1.090 1-1.850 2.700-1.850 1.800 0 2.400.850 2.500 2.100h2.200c-.070-1.700-1.100-3.300-3.200-3.800V3h-3v2.200C8.100 5.600 6.500 6.800 6.500 8.800c0 2.300 1.900 3.500 4.700 4.100 2.500.600 3 1.500 3 2.400 0 .700-.500 1.800-2.700 1.800-2.100 0-2.900-.900-3-2.100H6.300c.100 2.200 1.800 3.400 3.700 3.800V21h3v-2.200c1.900-.400 3.500-1.500 3.500-3.500 0-2.800-2.400-3.800-4.700-4.400Z" />,
};

/** Franja de stats a todo el ancho: online (en vivo) + reglas clave del server. */
export function StatsBar() {
  const { t, fmtNumber } = useT();
  const { data } = useAsync(getStatus);
  const items: { icon: keyof typeof I; value: string | number; label: string }[] = [
    { icon: 'bolt', value: `${SERVER.exp}x`, label: t('stats.exp') },
    { icon: 'crown', value: SERVER.resetLevel, label: t('stats.maxLevel') },
    { icon: 'plus', value: t('stats.pointsValue', { n: SERVER.pointsPerReset }), label: t('stats.resetPoints') },
    { icon: 'scale', value: t('stats.pvpPvm'), label: t('stats.mode') },
    { icon: 'freeToPlay', value: t('stats.noVip'), label: t('stats.noVipLabel') },
  ];
  return (
    <div className="statsbar" role="list">
      <div className="stat" role="listitem">
        <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{I.users}</svg>
        <div>
          <b>{data ? <><i className={`dot ${data.online ? '' : 'off'}`} />{fmtNumber(data.totalPlayers)}</> : '…'}</b>
          <span>{data && !data.online ? t('stats.offline') : t('stats.online')}</span>
        </div>
      </div>
      {items.map((s) => (
        <div className="stat" role="listitem" key={s.label}>
          <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">{I[s.icon]}</svg>
          <div><b>{s.value}</b><span>{s.label}</span></div>
        </div>
      ))}
    </div>
  );
}

export function NewsWidget() {
  const { t, locale } = useT();
  return (
    <div className="card glass">
      <h3 className="card-title">{t('news.title')}</h3>
      <ul className="newslist">
        {NEWS.map((n) => (
          <li key={n.id}><time dateTime={n.date}>{arDate(n.date, locale)}</time><strong>{t(n.title)}</strong></li>
        ))}
      </ul>
    </div>
  );
}
