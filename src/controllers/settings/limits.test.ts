import { describe, expect, it } from 'vitest';
import { defaultGameOption, optionsFrom, season1Graphics } from './gameOptions';
import { CAMERA_FOV_DEG, CAMERA_FOV_MAX_DEG, CAMERA_FOV_MIN_DEG } from '../camera/recipes';
import { RENDER_DISTANCE_MAX } from '../render/renderDistance';
import { RENDER_SCALE_STEP_MAX } from '../render/renderScale';
import { FPS_LIMIT_MAX, FPS_LIMIT_STEPS } from '../render/fpsLimit';
import {
  LOW_VITAL_DEFAULT_PERCENT,
  LOW_VITAL_MAX_PERCENT,
  LOW_VITAL_MIN_PERCENT,
} from '@/modules/hero/lowVitals';
import type { GameOptions } from './gameOptions';

/** The clamp `optionsFrom` applies to one numeric option: [min, max]. */
function range(key: keyof GameOptions): [unknown, unknown] {
  return [optionsFrom({ [key]: -1e9 })[key], optionsFrom({ [key]: 1e9 })[key]];
}

// gameOptions.ts spells these as literals (naming the owners' constants would close a cycle).
describe('settings limits match their owners', () => {
  it('camera field of view', () => {
    expect(defaultGameOption('cameraFov')).toBe(CAMERA_FOV_DEG);
    expect(range('cameraFov')).toEqual([CAMERA_FOV_MIN_DEG, CAMERA_FOV_MAX_DEG]);
  });

  it('render distance and render scale', () => {
    expect(range('renderDistance')).toEqual([0, RENDER_DISTANCE_MAX]);
    expect(range('renderScale')).toEqual([0, RENDER_SCALE_STEP_MAX]);
  });

  it('FPS limit', () => {
    // Ours (Season1): 60 fps by default.
    expect(FPS_LIMIT_STEPS[defaultGameOption('fpsLimit')]).toBe(60);
    expect(range('fpsLimit')).toEqual([0, FPS_LIMIT_MAX]);
  });

  it('low health and mana thresholds', () => {
    for (const key of ['lowHealthPercent', 'lowManaPercent'] as const) {
      expect(defaultGameOption(key)).toBe(LOW_VITAL_DEFAULT_PERCENT);
      expect(range(key)).toEqual([LOW_VITAL_MIN_PERCENT, LOW_VITAL_MAX_PERCENT]);
    }
  });
});

describe('the Season1 graphics defaults (ours)', () => {
  it('go once over an older save and leave a later choice alone', () => {
    const old: Record<string, unknown> = { msaa: 2, renderScale: 0, fpsLimit: 0, lightingQuality: 1, effectLevel: 0, itemEffects: 1, volume: 3 };
    expect(season1Graphics(old)).toBe(true);
    const loaded = optionsFrom(old);
    expect([loaded.msaa, loaded.renderScale, loaded.fpsLimit, loaded.lightingQuality]).toEqual([0, 3, 3, 0]);
    expect([loaded.effectLevel, loaded.itemEffects, loaded.volume]).toEqual([4, 2, 3]);

    const later = { ...old, msaa: 2 };
    expect(season1Graphics(later)).toBe(false);
    expect(optionsFrom(later).msaa).toBe(2);
  });
});
