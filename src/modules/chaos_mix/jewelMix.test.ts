import { beforeEach, describe, expect, it, vi } from 'vitest';
import { runInAction } from 'mobx';
import type { Item } from '@/ecs/world';

vi.hoisted(() => {
  const g = globalThis as Record<string, unknown>;
  g.location ??= { href: 'http://localhost/', search: '', hostname: 'localhost', protocol: 'http:' };
});

// Skills first: they keep the app import cycle in order (versions/shared/skills/readme.md).
await import('@versions/shared/skills/skillVisuals');
const { JewelMix, bundleSizeFor, hasRoomFor, looseCount, packedJewels, singleCount } = await import('./jewelMix');
const { Economy } = await import('@/modules/economy/economy');
const { Hero } = await import('@/modules/hero');
const { Session } = await import('@/modules/session');
const { Social } = await import('@/modules/social/social');
const { t } = await import('@/i18n');

const sent: number[][] = [];
vi.spyOn(Session, 'sendToGS').mockImplementation(b => void sent.push([...new Uint8Array(b.buffer)]));
const errors = vi.spyOn(Social, 'errorMessage').mockImplementation(() => {});

const BLESS: Item = { group: 14, num: 13 };
const PACKED_SOUL_20: Item = { group: 12, num: 31, lvl: 1 };
/** C1 BC (LahapJewelMixRequest) and C1 31 (CloseNpcRequest), as sent. */
const CLOSE_NPC = 0x31;

function bag(fill: Record<number, Item>) {
  runInAction(() => {
    Hero.items = new Array<Item | null>(236).fill(null);
    for (const [slot, item] of Object.entries(fill)) Hero.items[Number(slot)] = item;
  });
}

const blesses = (n: number) => Object.fromEntries(Array.from({ length: n }, (_, i) => [12 + i, BLESS]));

/** Right click: the query goes out, the server answers on; then the old checks and the box run. */
const asked = (ask: () => boolean): boolean => {
  const r = ask();
  JewelMix.packingReply(true);
  return r;
};

beforeEach(() => {
  JewelMix.packingReply(false);
  errors.mockClear();
  runInAction(() => (Session.isOffline = false));
  sent.length = 0;
  errors.mockClear();
});

// CComGem.cpp: FindWantedList and CheckMyInvValid walk MAX_EQUIPMENT_INDEX..MAX_MY_INVENTORY_EX_INDEX.
describe('the bag Lahap looks at', () => {
  it('lists the packed jewels past the equipment and before the personal store', () => {
    bag({ 8: PACKED_SOUL_20, 20: PACKED_SOUL_20, 90: { group: 12, num: 141 }, 210: PACKED_SOUL_20, 30: BLESS });
    expect(packedJewels(Hero.items)).toEqual([
      { slot: 20, jewel: 1, level: 1 },
      { slot: 90, jewel: 7, level: 0 },
    ]);
  });

  it('counts single jewels up to the stack asked for', () => {
    bag({ ...blesses(25), 3: BLESS });
    expect(singleCount(Hero.items, 0, 20)).toBe(20);
    expect(singleCount(Hero.items, 0, 30)).toBe(25);
    expect(singleCount(Hero.items, 1, 10)).toBe(0);
  });
});

describe('combining jewels', () => {
  it('asks for 10 Jewels of Bless at 500,000 zen, sends Mix and closes Lahap', () => {
    bag(blesses(10));
    JewelMix.open();
    JewelMix.chooseCombine();
    JewelMix.chooseJewel(0);
    JewelMix.chooseSize(0);
    expect(JewelMix.box).toBe('combineCheck');
    expect(JewelMix.zen).toBe(500_000);

    JewelMix.confirm();
    expect(sent).toEqual([[0xc1, 7, 0xbc, 0, 0, 0, 0], [0xc1, 3, CLOSE_NPC]]);
    expect(JewelMix.box).toBeNull();
  });

  it('goes back to the jewel buttons when the bag is short (COMERROR_NOTALLOWED)', () => {
    bag(blesses(19));
    JewelMix.open();
    JewelMix.chooseCombine();
    JewelMix.chooseJewel(0);
    JewelMix.chooseSize(1);
    expect(errors).toHaveBeenCalledWith(t('jewelMix.lacking'));
    expect(JewelMix.box).toBe('combine');
    expect(JewelMix.jewel).toBe(-1);
    expect(sent).toEqual([]);
  });
});

describe('dismantling a packed jewel', () => {
  it('quotes 1,000,000 zen and sends Unmix with the bundle level and slot', () => {
    bag({ 40: PACKED_SOUL_20 });
    JewelMix.open();
    JewelMix.chooseDismantle();
    expect(JewelMix.box).toBe('dismantle');
    JewelMix.select(0);
    JewelMix.dismantle();
    expect(JewelMix.box).toBe('dismantleCheck');
    expect(JewelMix.zen).toBe(1_000_000);

    JewelMix.confirm();
    expect(sent).toEqual([[0xc1, 7, 0xbc, 1, 1, 1, 40], [0xc1, 3, CLOSE_NPC]]);
  });

  it('stays on the menu with nothing to dismantle', () => {
    bag(blesses(30));
    JewelMix.open();
    JewelMix.chooseDismantle();
    expect(errors).toHaveBeenCalledWith(t('jewelMix.cannotDismantle'));
    expect(JewelMix.box).toBe('menu');
  });

  it('Cancel on the check goes back to the same list', () => {
    bag({ 40: PACKED_SOUL_20 });
    JewelMix.open();
    JewelMix.chooseDismantle();
    JewelMix.select(0);
    JewelMix.dismantle();
    JewelMix.cancelCheck();
    expect(JewelMix.box).toBe('dismantle');
    expect(JewelMix.selected).toBe(0);
  });
});

describe('Close', () => {
  it('tells the server Lahap is closed', () => {
    JewelMix.open();
    JewelMix.exit();
    expect(JewelMix.box).toBeNull();
    expect(sent).toEqual([[0xc1, 3, CLOSE_NPC]]);
  });
});

// The right click on a jewel in the bag (Season1 improvement, not in the original).
describe('bundling from the bag', () => {
  const SOUL: Item = { group: 14, num: 14 };
  const souls = (n: number) => Object.fromEntries(Array.from({ length: n }, (_, i) => [12 + i, SOUL]));

  beforeEach(() => runInAction(() => (Economy.prompt = null)));

  it('takes the biggest of 10, 20 and 30 the loose count allows', () => {
    expect([0, 9, 10, 19, 20, 25, 29, 30, 40].map(bundleSizeFor)).toEqual([0, 0, 10, 10, 20, 20, 20, 30, 30]);
  });

  it('counts only loose level 0 jewels of that kind', () => {
    bag({ ...souls(3), 30: { ...SOUL, lvl: 1 }, 31: BLESS, 32: { group: 12, num: 31 } });
    expect(looseCount(Hero.items, 1)).toBe(3);
  });

  it('says it cannot bundle under 10 and asks nothing', () => {
    bag(souls(9));
    expect(asked(() => JewelMix.askBundle(12))).toBe(true);
    expect(errors).toHaveBeenCalledWith(t('jewelMix.cannotBundle'));
    expect(Economy.prompt).toBeNull();
  });

  it('asks to bundle 20 with 25 jewels', () => {
    bag(souls(25));
    expect(asked(() => JewelMix.askBundle(12))).toBe(true);
    expect(Economy.prompt).toEqual({ kind: 'jewel-bundle', jewel: 1, size: 20 });
    expect(errors).not.toHaveBeenCalled();
  });

  it('ignores what is not a loose jewel', () => {
    bag({ 12: { ...SOUL, lvl: 1 }, 13: { group: 12, num: 31 }, 14: { group: 0, num: 1 } });
    expect([12, 13, 14, 15].map(slot => JewelMix.askBundle(slot))).toEqual([false, false, false, false]);
    expect(errors).not.toHaveBeenCalled();
  });

  it('sends Mix with the size and no close, without Lahap open', () => {
    bag(souls(30));
    JewelMix.bundle(1, 20);
    expect(sent).toEqual([[0xc1, 7, 0xbc, 0, 1, 1, 0]]);
    expect(JewelMix.box).toBeNull();
  });

  it('refuses at the confirm when the bag no longer has them', () => {
    bag(souls(15));
    JewelMix.bundle(1, 20);
    expect(sent).toEqual([]);
    expect(errors).toHaveBeenCalledWith(t('jewelMix.cannotBundle'));
  });
});

describe('unbundling from the bag', () => {
  const SOUL: Item = { group: 14, num: 14 };
  const fill = (from: number, n: number) => Object.fromEntries(Array.from({ length: n }, (_, i) => [from + i, SOUL]));

  beforeEach(() => runInAction(() => (Economy.prompt = null)));

  it('counts the free squares, the bundle still in place', () => {
    bag({ 12: PACKED_SOUL_20, ...fill(13, 63) });
    expect(hasRoomFor(Hero.items, 1)).toBe(false);
    bag({ 12: PACKED_SOUL_20, ...fill(14, 52) });
    expect(hasRoomFor(Hero.items, 11)).toBe(true);
    expect(hasRoomFor(Hero.items, 12)).toBe(false);
  });

  it('says there is no room in red and asks nothing', () => {
    bag({ 12: PACKED_SOUL_20, ...fill(13, 51) });
    expect(asked(() => JewelMix.askUnbundle(12))).toBe(true);
    expect(errors).toHaveBeenCalledWith(t('jewelMix.noRoom'));
    expect(Economy.prompt).toBeNull();
  });

  it('asks to unbundle the size of the level', () => {
    bag({ 12: PACKED_SOUL_20, 13: { group: 12, num: 31 }, 14: { group: 12, num: 31, lvl: 2 } });
    expect([12, 13, 14].map(slot => asked(() => JewelMix.askUnbundle(slot)))).toEqual([true, true, true]);
    expect(Economy.prompt).toEqual({ kind: 'jewel-unbundle', jewel: 1, size: 30, slot: 14 });
    asked(() => JewelMix.askUnbundle(13));
    expect(Economy.prompt).toEqual({ kind: 'jewel-unbundle', jewel: 1, size: 10, slot: 13 });
    expect(errors).not.toHaveBeenCalled();
  });

  it('ignores what is not a packed jewel', () => {
    bag({ 12: SOUL, 13: { group: 0, num: 1 } });
    expect([12, 13, 14].map(slot => JewelMix.askUnbundle(slot))).toEqual([false, false, false]);
  });

  it('sends Unmix with the jewel, level and slot, no close', () => {
    bag({ 20: PACKED_SOUL_20 });
    JewelMix.unbundle(20, 1);
    expect(sent).toEqual([[0xc1, 7, 0xbc, 1, 1, 1, 20]]);
    expect(JewelMix.box).toBeNull();
  });

  it('refuses at the confirm when the bundle moved or the room is gone', () => {
    bag({ 20: PACKED_SOUL_20 });
    JewelMix.unbundle(21, 1);
    expect(errors).toHaveBeenCalledWith(t('jewelMix.cannotDismantle'));
    bag({ 12: PACKED_SOUL_20, ...fill(13, 51) });
    JewelMix.unbundle(12, 1);
    expect(errors).toHaveBeenCalledWith(t('jewelMix.noRoom'));
    expect(sent).toEqual([]);
  });
});

describe('the packing switch of the server', () => {
  const SOUL: Item = { group: 14, num: 14 };
  const QUERY = [0xc1, 7, 0xbc, 0, 0xff, 0, 0];
  const souls = (n: number) => Object.fromEntries(Array.from({ length: n }, (_, i) => [12 + i, SOUL]));

  beforeEach(() => runInAction(() => (Economy.prompt = null)));

  it('asks the server first and opens nothing until it answers', () => {
    bag(souls(25));
    expect(JewelMix.askBundle(12)).toBe(true);
    expect(sent).toEqual([QUERY]);
    expect(Economy.prompt).toBeNull();
    JewelMix.packingReply(true);
    expect(Economy.prompt).toEqual({ kind: 'jewel-bundle', jewel: 1, size: 20 });
  });

  it('shows the disabled line in red on off, with no box', () => {
    bag({ 12: PACKED_SOUL_20 });
    JewelMix.askUnbundle(12);
    JewelMix.packingReply(false);
    expect(errors).toHaveBeenCalledWith(t('jewelMix.disabled'));
    expect(Economy.prompt).toBeNull();
  });

  it('does nothing when the answer never comes', () => {
    vi.useFakeTimers();
    bag(souls(25));
    JewelMix.askBundle(12);
    vi.advanceTimersByTime(2500);
    JewelMix.packingReply(true);
    vi.useRealTimers();
    expect(Economy.prompt).toBeNull();
    expect(errors).not.toHaveBeenCalled();
  });

  it('shows the red line when the server refuses a real request', () => {
    JewelMix.packingReply(false);
    expect(errors).toHaveBeenCalledWith(t('jewelMix.disabled'));
  });

  it('skips the query offline', () => {
    runInAction(() => (Session.isOffline = true));
    bag(souls(25));
    JewelMix.askBundle(12);
    expect(sent).toEqual([]);
    expect(Economy.prompt).toEqual({ kind: 'jewel-bundle', jewel: 1, size: 20 });
  });
});
