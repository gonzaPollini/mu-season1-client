import { describe, expect, it } from 'vitest';
import { stallPriceColor } from './stallPrice';

describe('stallPriceColor (ZzzInventory.cpp:1947-1954)', () => {
  it('colours a stall price by its amount', () => {
    expect([99_999, 100_000, 999_999, 1_000_000, 9_999_999, 10_000_000].map(stallPriceColor)).toEqual([
      'white', 'green', 'green', 'yellow', 'yellow', 'red',
    ]);
  });
});
