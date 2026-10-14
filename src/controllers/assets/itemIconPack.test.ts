import { describe, expect, it } from 'vitest';
import { itemIconPackChain } from './itemIconPack';

const RING_OF_FIRE = (lvl: number) => ({ group: 13, num: 21, lvl });

// Ours (Season1): the pack draws the common rings and pendants only up to +4.
describe('the icon pack chain for rings and pendants', () => {
  it('uses the pack picture while one exists at the level', () => {
    expect(itemIconPackChain(RING_OF_FIRE(0))[0]).toMatch(/item_13_21_0\./);
    expect(itemIconPackChain(RING_OF_FIRE(3))[0]).toMatch(/item_13_21_3\./);
  });

  it('draws a +5 or higher from the model, not the bright +0 picture', () => {
    expect(itemIconPackChain(RING_OF_FIRE(5))).toEqual([]);
    expect(itemIconPackChain(RING_OF_FIRE(13))).toEqual([]);
  });

  it('leaves weapons on their tinted pictures', () => {
    expect(itemIconPackChain({ group: 0, num: 5, lvl: 5 })[0]).toMatch(/item_0_5_5\./);
  });
});
