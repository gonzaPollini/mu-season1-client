import { runInAction } from 'mobx';
import { assetDownload, loadAssetsIndex, startDownload } from './assetDownload';

/** Same key as `versions/shared/ui/hud/auto_download`: a finished full run marks this build done there too. */
const DONE_KEY = 'mu_auto_download_build';

const buildId = () => (typeof BUILD_ID === 'string' ? BUILD_ID : 'dev');

/**
 * Ours: the `?direct` loading screen's job. Downloads EVERY asset group into the cache worker
 * (files already cached are skipped, so a repeat visit ends at once).
 * `'skipped'`: there is no assets index (a dev server), nothing to fetch. `'failed'`: it stopped
 * before 100 % (network, cancel); calling again resumes where it stopped.
 */
export async function preloadAll(): Promise<'done' | 'skipped' | 'failed'> {
  if (!(await loadAssetsIndex())) return 'skipped';
  assetDownload.chooseOnly(() => true);
  runInAction(() => {
    assetDownload.blocking = true;
  });
  try {
    await startDownload();
  } finally {
    runInAction(() => {
      assetDownload.blocking = false;
    });
  }
  if (!assetDownload.done) return 'failed';
  try {
    localStorage.setItem(DONE_KEY, buildId());
  } catch {
    /* private window */
  }
  return 'done';
}
