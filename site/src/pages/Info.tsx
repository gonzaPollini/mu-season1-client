import { CLASES, COMMANDS, HELPER_POINTS, RESET_STEPS, RESET_TABLE, RULES } from '../data/info';
import { SERVER } from '../data/server';
import { useT, type Key } from '../i18n';
import { Reveal, SectionTitle } from '../components/ui';

export function Info() {
  const { t, fmtNumber } = useT();
  return (
    <section className="wrap section">
      <SectionTitle eyebrow={t('info.eyebrow')} title={t('info.title')}>{t('info.subtitle')}</SectionTitle>
      <nav className="chips">
        {(['rules', 'reset', 'helper', 'commands', 'classes'] as const).map((id) => (
          <a key={id} href="#/info" onClick={(e) => go(e, id)}>{t(`info.chip.${id}` as Key)}</a>
        ))}
      </nav>

      <Reveal><div className="card glass block" id="rules">
        <h3>{t('info.rulesTitle')}</h3>
        <ol className="rules">{RULES.map((r) => <li key={r}>{t(r)}</li>)}</ol>
      </div></Reveal>

      <Reveal><div className="card glass block" id="reset">
        <h3>{t('info.resetTitle')}</h3>
        <p>{t('info.resetIntro', { name: SERVER.name, level: SERVER.resetLevel, points: SERVER.pointsPerReset })}</p>
        <ol className="steps">{RESET_STEPS.map((s, i) => (
          <li key={s.title}><span>{i + 1}</span><div><strong>{t(s.title)}</strong><p>{t(s.text)}</p></div></li>
        ))}</ol>
        <div className="table-wrap"><table className="table">
          <thead><tr><th>{t('reset.table.resets')}</th><th className="r">{t('reset.table.points')}</th></tr></thead>
          <tbody>{RESET_TABLE.map((r) => (<tr key={r.resets}><td>{r.resets}</td><td className="r"><b>{fmtNumber(r.points)}</b></td></tr>))}</tbody>
        </table></div>
      </div></Reveal>

      <Reveal><div className="card glass block" id="helper">
        <h3>{t('info.helperTitle')}</h3>
        <ul className="bullets">{HELPER_POINTS.map((r) => <li key={r}>{t(r)}</li>)}</ul>
      </div></Reveal>

      <Reveal><div className="card glass block" id="commands">
        <h3>{t('info.commandsTitle')}</h3>
        <p>{t('info.commandsIntro')}</p>
        <div className="table-wrap"><table className="table">
          <thead><tr><th>{t('cmd.col.command')}</th><th>{t('cmd.col.alias')}</th><th>{t('cmd.col.what')}</th></tr></thead>
          <tbody>{COMMANDS.map((c) => (
            <tr key={c.cmd}><td><code>{c.cmd}</code></td><td>{c.alias ? <code>{c.alias}</code> : '-'}</td><td>{t(c.desc)}</td></tr>
          ))}</tbody>
        </table></div>
      </div></Reveal>

      <div id="classes" className="classes-head"><h3>{t('info.classesTitle')}</h3></div>
      <div className="grid g3">
        {CLASES.map((c, i) => (
          <Reveal key={c.id} delay={(i % 3) * 80}>
            <article className="card glass class">
              <h4>{c.name}</h4><span className="evo">{c.evo}</span>
              <p><b>{t('class.role')}:</b> {t(`class.${c.id}.role` as Key)}</p>
              <p><b>{t('class.stats')}:</b> {t(`class.${c.id}.stats` as Key)}</p>
              <p>{t(`class.${c.id}.tips` as Key)}</p>
            </article>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

/** Scroll a una sección sin tocar el hash (el router usa el hash). */
function go(e: React.MouseEvent, id: string) {
  e.preventDefault();
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
}
