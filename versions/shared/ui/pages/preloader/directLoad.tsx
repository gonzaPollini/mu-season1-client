import './directLoad.less';
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { observer } from 'mobx-react-lite';
import { assetDownload } from '@/controllers/assets/assetDownload';
import { preloadAll } from '@/controllers/assets/preloadAll';
import { Loading } from '@/controllers/loading';
import { useCreep } from '@/controllers/loading/useCreep';
import { setSceneCovered } from '@/controllers/render/sceneCover';
import { loadBrand, pickText, type Brand } from '@/modules/servers/brand';
import { Session } from '@/modules/session';
import { i18n, t } from '@/i18n';

/**
 * Ours: the preloader page for `?direct` (`DirectLogin.auto`). None of the client's own screens:
 * only a loading screen with the bar and its percentage while every asset group downloads to
 * 100 % (`preloadAll`), then the server select (`Session.playOnline`). A download that stops early
 * offers "Enter anyway" (the next visit resumes it). The look is the server's own
 * (`modules/servers/brand.ts`, `brand/brand.json`): logo, art, colors and rotating tips; with no
 * brand it is neutral (the client's art, no tips). Audio needs no Start press here:
 * `initializeSounds` unlocks it on the first click or key on the server select.
 */

const NEUTRAL_ART = '/backdrops/character-select.jpeg';
const NEUTRAL_LOGO = '/ui/world_select/logo.webp';

/** After the download, how long the login scene behind may still take before the page leaves anyway. */
const SCENE_WAIT_MS = 15000;
const TIP_MS = 5000;
const FADE_MS = 400;

const mb = (bytes: number) => (bytes / 1e6).toFixed(1);

function Logo({ brand }: { brand: Brand | null }) {
  if (!brand?.name) return <span className="dl-logo"><img className="dl-wide" src={NEUTRAL_LOGO} alt="" draggable={false} /></span>;
  return (
    <span className="dl-logo" aria-label={`${brand.name} ${brand.sub}`}>
      {brand.logo && <img className="dl-mark" src={brand.logo} alt="" draggable={false} />}
      <span className="dl-text">
        <span className="dl-name">{brand.name}</span>
        {brand.sub && <span className="dl-sub">{brand.sub}</span>}
      </span>
    </span>
  );
}

/** One tip at a time, swapped with a fade every `TIP_MS`. */
function Tips({ brand }: { brand: Brand }) {
  const [at, setAt] = useState(0);
  const [out, setOut] = useState(false);
  const count = brand.tips.length;

  useEffect(() => {
    if (count < 2) return;
    let swap = 0;
    const timer = window.setInterval(() => {
      setOut(true);
      swap = window.setTimeout(() => {
        setAt(n => (n + 1) % count);
        setOut(false);
      }, FADE_MS);
    }, TIP_MS);
    return () => {
      window.clearInterval(timer);
      window.clearTimeout(swap);
    };
  }, [count]);

  const tip = brand.tips[at % Math.max(count, 1)];
  if (!tip) return null;
  const lang = i18n.current.code;

  return (
    <div className={`dl-tip${out ? ' is-out' : ''}`} aria-live="polite">
      {tip.icon ? <img src={tip.icon} alt="" draggable={false} /> : <i className="dl-dot" />}
      <div>
        <b>{pickText(tip.title, lang)}</b>
        <span>{pickText(tip.text, lang)}</span>
      </div>
    </div>
  );
}

export const DirectLoadPage = observer(() => {
  const [failed, setFailed] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [brand, setBrand] = useState<Brand | null>(null);
  const left = useRef(false);

  useEffect(() => {
    setSceneCovered(true);
    return () => setSceneCovered(false);
  }, []);

  useEffect(() => {
    let alive = true;
    void loadBrand().then(b => {
      if (!alive || !b) return;
      setBrand(b);
      if (b.fontUrl && !document.querySelector(`link[href="${b.fontUrl}"]`)) {
        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = b.fontUrl;
        document.head.appendChild(link);
      }
    });
    void preloadAll().then(result => {
      if (!alive) return;
      if (result === 'failed') setFailed(true);
      else setDownloaded(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  // The server select draws over the login scene: leave once it is up (or after a while).
  const sceneReady = !Loading.sceneLoading;
  useEffect(() => {
    if (!downloaded || left.current) return;
    const go = () => {
      if (left.current) return;
      left.current = true;
      Session.playOnline();
    };
    if (sceneReady) {
      go();
      return;
    }
    const timer = window.setTimeout(go, SCENE_WAIT_MS);
    return () => window.clearTimeout(timer);
  }, [downloaded, sceneReady]);

  const progress = downloaded ? 1 : assetDownload.progress;
  const percent = Math.floor(progress * 100);
  const total = assetDownload.selectedTransfer;
  const { shown, transition } = useCreep(progress);

  const art = brand?.background ?? NEUTRAL_ART;
  const style = {
    '--dl-art': `url(${art})`,
    ...(brand?.gold && { '--dl-gold': brand.gold }),
    ...(brand?.goldHi && { '--dl-gold-hi': brand.goldHi }),
    ...(brand?.accent && { '--dl-accent': brand.accent }),
  } as CSSProperties;

  return (
    <div className="dl-screen" style={style}>
      <div className={`dl-art${brand?.mirror ? ' is-mirror' : ''}`} />
      <div className="dl-main">
        <Logo brand={brand} />
        <div className="dl-progress">
          <div className="dl-percent">{percent}%</div>
          <div className="dl-bar">
            <div className="dl-fill" style={{ transform: `scaleX(${shown})`, transition }} />
          </div>
          {total > 0 && (
            <div className="dl-amounts">
              <span>{t('autoDownload.received', { got: mb(total * progress), total: mb(total) })}</span>
              <span>{t('autoDownload.left', { left: mb(Math.max(0, total * (1 - progress))) })}</span>
            </div>
          )}
          {failed && (
            <button className="dl-skip" onClick={() => setDownloaded(true)}>
              {t('autoDownload.skip')}
            </button>
          )}
        </div>
        {brand && brand.tips.length > 0 && <Tips brand={brand} />}
      </div>
    </div>
  );
});
