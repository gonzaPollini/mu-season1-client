import './style.less';
import { useEffect, useState } from 'react';
import { observer } from 'mobx-react-lite';
import {
  assetDownload,
  cancelDownload,
  loadAssetsIndex,
  startDownload,
  type AssetGroup,
} from '@/controllers/assets/assetDownload';
import { AppState, UIState } from '@/controllers/interface/uiState';
import { t } from '@/i18n';

/**
 * What the screen waits for before the login (about 180 MB over the wire): the interface, the
 * characters and monsters, the item icons, the login scene and the main towns. The rest (other
 * maps, music) follows in the background. Map groups by their index id (`map:<world folder>`).
 */
const ESSENTIAL_MAPS = new Set(['map:1', 'map:3', 'map:4', 'map:52', 'map:74']);
const isEssential = (g: AssetGroup) => g.kind !== 'map' ? g.kind !== 'audio' : ESSENTIAL_MAPS.has(g.id);

/** The build this browser last finished a full download for: a new build checks its files again. */
const DONE_KEY = 'mu_auto_download_build';
const DONE_SHOWN_MS = 4000;

const buildId = () => (typeof BUILD_ID === 'string' ? BUILD_ID : 'dev');
let started = false;

const mb = (bytes: number) => (bytes / 1e6).toFixed(1);

/** Bytes over the wire (the index's `transfer`, gzip sidecars): progress runs on bytes on disk. */
function wireAmounts(): { got: number; total: number } {
  const total = assetDownload.selectedTransfer;
  return { got: total * assetDownload.progress, total };
}

const BACKDROP_ART = '/backdrops/character-select.jpeg';
const LOGO_ART = '/ui/world_select/logo.webp';

/** The group the run is in: `startDownload` fetches the groups in index order, so the bytes tell. */
function currentGroup(): AssetGroup | undefined {
  let bytes = 0;
  for (const group of assetDownload.groups) {
    if (!assetDownload.isChosen(group)) continue;
    bytes += group.bytes;
    if (assetDownload.received < bytes) return group;
  }
  return undefined;
}

function phaseText(group: AssetGroup | undefined): string {
  if (!group) return t('autoDownload.phase.core');
  return group.kind === 'map' ? t('autoDownload.phase.map', { name: group.name }) : t(`autoDownload.phase.${group.kind}`);
}

/**
 * Ours: from the Enter of the worlds page on (login, character select, the world), every asset
 * group (`assetDownload`, the preloader's Downloads tab) downloads in the background into the cache
 * worker, with a small progress panel on top. Mounted by `src/app/App.tsx`, not the HUD.
 */
export const AutoDownload = observer(() => {
  // Past the worlds page: its Enter moved the app to the login (or straight further).
  const entered = AppState.uiState >= UIState.Login;
  const [hidden, setHidden] = useState(false);
  // Until the player skips it, the download is a screen over the login and the character select.
  const [skipped, setSkipped] = useState(false);
  const [showDone, setShowDone] = useState(false);
  // `essential` runs behind the screen; `rest` runs behind the small panel.
  const [phase, setPhase] = useState<'essential' | 'rest'>('essential');

  useEffect(() => {
    if (!entered || started || localStorage.getItem(DONE_KEY) === buildId()) return;
    started = true;
    void (async () => {
      // A dev server has no index: nothing to download.
      if (!(await loadAssetsIndex())) return;
      assetDownload.chooseOnly(isEssential);
      await startDownload();
      if (!assetDownload.done) return;
      setPhase('rest');
      assetDownload.chooseOnly(() => true);
      // Already-cached files are skipped, so this fetches only what the first run left out.
      await startDownload();
      if (assetDownload.done) {
        localStorage.setItem(DONE_KEY, buildId());
        setShowDone(true);
        setTimeout(() => setShowDone(false), DONE_SHOWN_MS);
      }
    })();
  }, [entered]);

  if (!entered || hidden || !(assetDownload.running || showDone)) return null;

  const percent = Math.floor(assetDownload.progress * 100);
  const wire = wireAmounts();
  const amount = `${percent}% · ${mb(wire.got)} / ${mb(wire.total)} MB`;

  if (phase === 'essential' && !skipped && assetDownload.running) {
    const left = Math.max(0, wire.total - wire.got);
    return (
      <div className="auto-download-screen" style={{ backgroundImage: `url(${BACKDROP_ART})` }}>
        <div className="auto-download-panel">
          <img className="auto-download-logo" src={LOGO_ART} alt="OpenMU Babylon" draggable={false} />
          <div className="auto-download-heading">{t('autoDownload.screenTitle')}</div>
          <div className="auto-download-phase">
            <span>{phaseText(currentGroup())}</span>
            <span className="auto-download-percent">{percent}%</span>
          </div>
          <div className="auto-download-bar is-big">
            <div className="auto-download-fill" style={{ width: `${percent}%` }} />
          </div>
          <div className="auto-download-amounts">
            <span>{t('autoDownload.received', { got: mb(wire.got), total: mb(wire.total) })}</span>
            <span>{t('autoDownload.left', { left: mb(left) })}</span>
          </div>
          <div className="auto-download-rule" />
          <div className="auto-download-note">{t('autoDownload.screenText')}</div>
          <button className="auto-download-skip" onClick={() => setSkipped(true)}>
            {t('autoDownload.skip')}
          </button>
          <div className="auto-download-note is-small">{t('autoDownload.skipNote')}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="auto-download">
      <div className="auto-download-title">
        {showDone ? t('autoDownload.done') : t('autoDownload.title')}
        <button className="auto-download-close" onClick={() => setHidden(true)} title={t('autoDownload.hide')}>
          ×
        </button>
      </div>
      <div className="auto-download-bar">
        <div className="auto-download-fill" style={{ width: `${showDone ? 100 : percent}%` }} />
      </div>
      {!showDone && (
        <div className="auto-download-info">
          <span>{amount}</span>
          <button className="auto-download-cancel" onClick={cancelDownload}>
            {t('autoDownload.cancel')}
          </button>
        </div>
      )}
    </div>
  );
});
