import './style.less';
import { useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { Loading } from '../loadingState';

/** How long the still dissolves into the new map, as in `style.less`. */
const DISSOLVE_MS = 400;

/**
 * Ours: the loading look for a warp to another map from inside the world (`/move`, a gate). The
 * map being left stays on screen as a still (`Loading.warpSnapshot`, taken by boot on the warp's
 * first frame) while the new one loads under it, then dissolves into it once the scene gate lifts:
 * no black frame and no art.
 */
export const WarpFade = observer(() => {
  const snapshot = Loading.warpSnapshot;
  const covering = Loading.inWorldWarp && Loading.sceneLoading && !!snapshot;

  // Once dissolved, the still is dropped (and its blob URL revoked).
  useEffect(() => {
    if (covering || !snapshot) return;
    const timer = setTimeout(() => Loading.setWarpSnapshot(null), DISSOLVE_MS);
    return () => clearTimeout(timer);
  }, [covering, snapshot]);

  return (
    <div
      className={`warp-fade${covering ? ' is-covering' : ''}`}
      style={snapshot ? { backgroundImage: `url(${snapshot})` } : undefined}
    />
  );
});
