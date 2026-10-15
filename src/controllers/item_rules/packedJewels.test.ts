import { describe, expect, it } from 'vitest';
import { isPackedJewel, stackCount } from './packedJewels';

describe('stackCount (GetStackCount, InventoryCtrl.cpp:1015-1026)', () => {
  it("counts a pack's jewels by its level", () => {
    expect([0, 1, 2].map(lvl => stackCount({ group: 12, num: 31, lvl }))).toEqual([10, 20, 30]);
    expect(stackCount({ group: 12, num: 141 })).toBe(10);
  });

  it('counts potion pieces and nothing else', () => {
    expect(stackCount({ group: 14, num: 3, durability: 7 })).toBe(7);
    expect(stackCount({ group: 14, num: 14, lvl: 2 })).toBe(0);
    expect(stackCount({ group: 12, num: 15 })).toBe(0);
  });

  it('knows the ten packs', () => {
    expect([30, 31, 136, 143].every(n => isPackedJewel(12, n))).toBe(true);
    expect(isPackedJewel(12, 32) || isPackedJewel(14, 31)).toBe(false);
  });
});
