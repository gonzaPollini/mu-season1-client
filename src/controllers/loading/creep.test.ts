import { describe, expect, it } from 'vitest';
import { CREEP_CAP, creepTarget, creepTransition } from './creep';

describe('the creeping load bar', () => {
  it('heads past the real value, short of the cap, and only forward', () => {
    expect(creepTarget(0)).toBeCloseTo(CREEP_CAP * 0.2);
    expect(creepTarget(0.12)).toBeLessThan(0.3);
    expect(creepTarget(0.5)).toBeGreaterThan(0.5);
    expect(creepTarget(0.96)).toBeLessThan(CREEP_CAP);
    expect(creepTarget(0.98)).toBe(0.98);
    for (let p = 0; p < 1; p += 0.05) expect(creepTarget(p + 0.05)).toBeGreaterThanOrEqual(creepTarget(p));
  });

  it('fills at once when done, and survives bad input', () => {
    expect(creepTarget(1)).toBe(1);
    expect(creepTarget(Number.NaN)).toBeCloseTo(CREEP_CAP * 0.2);
    expect(creepTransition(1)).toMatch(/^transform 0\.25s/);
    expect(creepTransition(0.3, 'left')).toMatch(/^left 10s/);
  });
});
