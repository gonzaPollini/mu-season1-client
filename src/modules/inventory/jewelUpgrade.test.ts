import { describe, expect, it } from 'vitest';
import { InventoryConstants } from '@/core/inventoryConstants';
import { jewelTargetError } from './jewelUpgrade';

const IN_BAG = InventoryConstants.EquippableSlotsCount;
const jewel = (num: number) => ({ group: 14, num, lvl: 0 });
const BLESS = jewel(13);
const SOUL = jewel(14);
const LIFE = jewel(16);
const HARMONY = jewel(42);
const RING_OF_FIRE = { group: 13, num: 21, lvl: 0 };
const PENDANT_OF_ICE = { group: 13, num: 25, lvl: 7 };
const WIZARDS_RING = { group: 13, num: 20, lvl: 0 };

describe('dropping a jewel on gear', () => {
  it('lets a sword take Bless', () => {
    expect(jewelTargetError(BLESS, { group: 0, num: 5, lvl: 0 }, IN_BAG)).toBeNull();
  });

  // Ours (Season1): the server's own Bless / Soul take the common rings and pendants too.
  it('lets Bless, Soul and Life go on a ring or pendant, with the usual level limits', () => {
    expect(jewelTargetError(BLESS, RING_OF_FIRE, IN_BAG)).toBeNull();
    expect(jewelTargetError(SOUL, PENDANT_OF_ICE, IN_BAG)).toBeNull();
    expect(jewelTargetError(LIFE, RING_OF_FIRE, IN_BAG)).toBeNull();
    expect(jewelTargetError(BLESS, PENDANT_OF_ICE, IN_BAG)).not.toBeNull();
  });

  it('keeps other jewels and special rings off jewellery', () => {
    expect(jewelTargetError(HARMONY, RING_OF_FIRE, IN_BAG)).not.toBeNull();
    expect(jewelTargetError(BLESS, WIZARDS_RING, IN_BAG)).not.toBeNull();
  });
});
