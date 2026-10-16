import { useNow } from '../lib/hooks';
import { useT } from '../i18n';
import { pad, splitRemaining } from '../lib/time';

/** Cuenta regresiva hacia `target` (ISO). Compacta: 02:14:09, o «1d 03:00:00». */
export function Countdown({ target }: { target: string }) {
  const now = useNow();
  const { t } = useT();
  const { d, h, m, s } = splitRemaining(new Date(target).getTime() - now);
  const soon = d === 0 && h === 0 && m < 5;
  return (
    <span className={`countdown ${soon ? 'soon' : ''}`} aria-label={t('events.remaining')}>
      {d > 0 && <b>{d}d</b>}
      <b>{pad(h)}</b><i>:</i><b>{pad(m)}</b><i>:</i><b>{pad(s)}</b>
    </span>
  );
}
