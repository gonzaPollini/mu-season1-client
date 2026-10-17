import { beforeEach, describe, expect, it, vi } from 'vitest';

const store = vi.hoisted(() => ({ done: false, blocking: false, chosen: 0, index: true as boolean, start: vi.fn() }));

vi.mock('./assetDownload', () => ({
  assetDownload: {
    get done() {
      return store.done;
    },
    get blocking() {
      return store.blocking;
    },
    set blocking(v: boolean) {
      store.blocking = v;
    },
    chooseOnly: (fn: (g: unknown) => boolean) => {
      if (fn({})) store.chosen++;
    },
  },
  loadAssetsIndex: async () => (store.index ? {} : null),
  startDownload: () => store.start(),
}));

import { preloadAll } from './preloadAll';

beforeEach(() => {
  store.done = false;
  store.blocking = false;
  store.chosen = 0;
  store.index = true;
  store.start.mockReset();
  vi.stubGlobal('BUILD_ID', 'b1');
});

describe('preloadAll', () => {
  it('skips when there is no assets index', async () => {
    store.index = false;
    expect(await preloadAll()).toBe('skipped');
    expect(store.start).not.toHaveBeenCalled();
  });

  it('chooses every group, downloads, and releases the render block', async () => {
    store.start.mockImplementation(async () => {
      expect(store.blocking).toBe(true);
      store.done = true;
    });
    expect(await preloadAll()).toBe('done');
    expect(store.chosen).toBe(1);
    expect(store.blocking).toBe(false);
  });

  it('reports a run that stopped before 100 %', async () => {
    store.start.mockResolvedValue(undefined);
    expect(await preloadAll()).toBe('failed');
    expect(store.blocking).toBe(false);
  });
});
