import { makeObservable, observable, runInAction } from 'mobx';
import { t } from '@/i18n';
import { InventoryConstants } from '@/core/inventoryConstants';
import type { Item } from '@/ecs/world';
import { Hero } from '../hero';
import { Session } from '../session';
import { Economy } from '../economy/economy';
import { Social } from '../social/social';
import { itemSize } from '../inventory';
import { findFreeSlot } from '../inventory/inventoryFit';
import {
  CloseNpcRequestPacket,
  LahapJewelMixRequestItemTypeEnum,
  LahapJewelMixRequestMixTypeEnum,
  LahapJewelMixRequestPacket,
} from '@versions/shared/packets/ClientToServerPackets';

/**
 * Lahap's jewel packing, the original's `COMGEM` (GameLogic/Items/CComGem.cpp) and its message boxes
 * (`CGemIntegration*MsgBox`, NewUICustomMessageBox.cpp:1112-2160, NewUICommonMessageBox.cpp:1593-1720).
 * The window is versions/shared/ui/windows/lahap; the readme says what OpenMU answers.
 */

/** The ten jewels in `eGEMTYPE` order (_enum.h:3770-3805): the single one, the packed one (group 12). */
export const JEWELS: readonly { readonly single: readonly [number, number]; readonly packed: number }[] = [
  { single: [14, 13], packed: 30 }, // Bless
  { single: [14, 14], packed: 31 }, // Soul
  { single: [14, 16], packed: 136 }, // Life
  { single: [14, 22], packed: 137 }, // Creation
  { single: [14, 31], packed: 138 }, // Guardian
  { single: [14, 41], packed: 139 }, // Gemstone
  { single: [14, 42], packed: 140 }, // Harmony
  { single: [12, 15], packed: 141 }, // Chaos
  { single: [14, 43], packed: 142 }, // Lower Refine Stone
  { single: [14, 44], packed: 143 }, // Higher Refine Stone
];

/** `FIRST`, `SECOND`, `THIRD`: the stack sizes of the three combine buttons. */
export const STACK_SIZES = [10, 20, 30] as const;
/** `kDetachUnitValue` per jewel combined, `kAttachValue` to dismantle (CComGem.cpp:25-26, `CalcGen`). */
const COMBINE_ZEN_PER_JEWEL = 50_000;
const DISMANTLE_ZEN = 1_000_000;

/** Season1: the query is a Mix of this jewel number, which the real client never sends (0 to 9). */
const QUERY_JEWEL = 0xff;
const QUERY_TIMEOUT_MS = 2000;

/** The zen to combine `size` jewels, on the count buttons and in the check. */
export const combineZen = (size: number): number => size * COMBINE_ZEN_PER_JEWEL;

/** `Check_Jewel_Unit`: which of the ten a single jewel is, or -1. */
export function singleJewel(item: Pick<Item, 'group' | 'num'>): number {
  return JEWELS.findIndex(j => j.single[0] === item.group && j.single[1] === item.num);
}

/** `Check_Jewel_Com`: which of the ten a packed jewel is, or -1. */
export function packedJewel(item: Pick<Item, 'group' | 'num'>): number {
  return item.group === 12 ? JEWELS.findIndex(j => j.packed === item.num) : -1;
}

/** The bag slots `COMGEM` searches: past the equipment, up to the personal store (MAX_MY_INVENTORY_EX_INDEX). */
function bagSlots(items: readonly (Item | null)[]): { slot: number; item: Item }[] {
  const out: { slot: number; item: Item }[] = [];
  const end = Math.min(items.length, InventoryConstants.FirstStoreItemSlotIndex);
  for (let slot = InventoryConstants.EquippableSlotsCount; slot < end; slot++) {
    const item = items[slot];
    if (item) out.push({ slot, item });
  }
  return out;
}

/** `FindWantedList`: every packed jewel in the bag, by slot. Its level is its size (+0 is 10). */
export function packedJewels(items: readonly (Item | null)[]): { slot: number; jewel: number; level: number }[] {
  return bagSlots(items)
    .map(({ slot, item }) => ({ slot, jewel: packedJewel(item), level: item.lvl ?? 0 }))
    .filter(entry => entry.jewel >= 0);
}

/** `CheckMyInvValid` (ATTACH): how many of the jewel the bag holds, counting up to `size`. */
export function singleCount(items: readonly (Item | null)[], jewel: number, size: number): number {
  let count = 0;
  for (const { item } of bagSlots(items)) {
    if (singleJewel(item) === jewel && ++count === size) break;
  }
  return count;
}

/** Season1: the biggest stack of 10, 20 or 30 that `count` loose jewels fill, 0 under 10. */
export function bundleSizeFor(count: number): number {
  return [...STACK_SIZES].reverse().find(size => count >= size) ?? 0;
}

/** Season1: how many loose (level 0) single jewels of the kind the bag holds. */
export function looseCount(items: readonly (Item | null)[], jewel: number): number {
  return bagSlots(items).filter(({ item }) => singleJewel(item) === jewel && !item.lvl).length;
}

/** Season1: whether the bag has `count` free single squares (the server's `FreeSlots`, the bundle still in place). */
export function hasRoomFor(items: readonly (Item | null)[], count: number): boolean {
  const occupied: { slot: number; width: number; height: number }[] = [];
  items.forEach((item, slot) => {
    if (!item || slot < InventoryConstants.EquippableSlotsCount) return;
    const { w, h } = itemSize(item);
    occupied.push({ slot, width: w, height: h });
  });
  for (let i = 0; i < count; i++) {
    const slot = findFreeSlot(occupied, InventoryConstants.InventoryRows, 1, 1);
    if (slot < 0) return false;
    occupied.push({ slot, width: 1, height: 1 });
  }
  return true;
}

/** Which of the original's boxes is up: the menu, combine, dismantle, or the OK / Cancel check of either. */
export type JewelMixBox = 'menu' | 'combine' | 'combineCheck' | 'dismantle' | 'dismantleCheck';

export const JewelMix = new (class _JewelMix {
  box: JewelMixBox | null = null;
  /** `m_cGemType / 2`: the jewel picked, -1 before. */
  jewel = -1;
  /** `m_cComType`: the stack size picked, 0 before. */
  size = 0;
  /** `m_iValue`: the zen the check box quotes. */
  zen = 0;
  /** `m_UnmixTarList`: the packed jewels found when Dismantle was pressed. */
  packed: { slot: number; jewel: number; level: number }[] = [];
  /** The list line picked (`SLGetSelectLine`), -1 for none. */
  selected = -1;

  constructor() {
    makeObservable(this, { box: observable, jewel: observable, size: observable, zen: observable, packed: observable, selected: observable });
  }

  /** `ReceiveTalk(INDEX_NPC_LAHAP)` (WSclient.cpp:6446-6454): `CGemIntegrationMsgBox`. */
  open(): void {
    this.init();
    runInAction(() => (this.box = 'menu'));
  }

  /** The menu's Jewel combination (`UnityBtnDown`). */
  chooseCombine(): void {
    runInAction(() => (this.box = 'combine'));
  }

  /** The menu's Dismantle jewel (`DisjointBtnDown`): only with a packed jewel in the bag. */
  chooseDismantle(): void {
    const packed = packedJewels(Hero.items);
    if (!packed.length) {
      Social.errorMessage(t('jewelMix.cannotDismantle'));
      return;
    }
    runInAction(() => {
      this.packed = packed;
      this.selected = -1;
      this.box = 'dismantle';
    });
  }

  /** A jewel button of the combine box (`SetGem(i * 2)`): the count buttons replace them. */
  chooseJewel(jewel: number): void {
    runInAction(() => (this.jewel = jewel));
  }

  /** A count button (`SelectMixBtnDown`): enough single jewels opens the check, else back to the jewels. */
  chooseSize(index: number): void {
    const size = STACK_SIZES[index];
    if (this.jewel < 0 || !size) return;
    if (singleCount(Hero.items, this.jewel, size) < size) {
      Social.errorMessage(t('jewelMix.lacking'));
      runInAction(() => (this.jewel = -1));
      return;
    }
    runInAction(() => {
      this.size = size;
      this.zen = combineZen(size);
      this.box = 'combineCheck';
    });
  }

  select(index: number): void {
    runInAction(() => (this.selected = index));
  }

  /** The dismantle box's Disband (`DisjointBtnDown` + `SelectFromList`). */
  dismantle(): void {
    const entry = this.packed[this.selected];
    if (!entry) return;
    const item = Hero.items[entry.slot];
    if (!item || packedJewel(item) !== entry.jewel) {
      Social.errorMessage(t('jewelMix.cannotDismantle'));
      return;
    }
    runInAction(() => {
      this.jewel = entry.jewel;
      this.zen = DISMANTLE_ZEN;
      this.box = 'dismantleCheck';
    });
  }

  /** OK on a check box: `ProcessCSAction`, then `Exit` closes Lahap (NewUICommonMessageBox.cpp:1609-1619). */
  confirm(): void {
    const packet = LahapJewelMixRequestPacket.createPacket();
    if (this.box === 'combineCheck') {
      packet.Operation = LahapJewelMixRequestMixTypeEnum.Mix;
      packet.Item = this.jewel;
      packet.MixingStackSize = this.size / 10 - 1;
    } else if (this.box === 'dismantleCheck') {
      const entry = this.packed[this.selected];
      if (!entry) return;
      packet.Operation = LahapJewelMixRequestMixTypeEnum.Unmix;
      packet.Item = entry.jewel;
      packet.MixingStackSize = entry.level;
      packet.UnmixingSourceSlot = entry.slot;
    } else {
      return;
    }
    if (!Session.isOffline) Session.sendToGS(packet.buffer);
    this.exit();
  }

  /** Cancel on a check box: `GetBack`, and the box it came from again (the jewel buttons, the same list). */
  cancelCheck(): void {
    runInAction(() => {
      this.jewel = -1;
      this.box = this.box === 'combineCheck' ? 'combine' : 'dismantle';
    });
  }

  /** Season1: the query waiting for the server's answer, and its timer. */
  private pending: (() => void) | null = null;
  private pendingTimer: ReturnType<typeof setTimeout> | undefined;

  /** Season1: asks the server whether packing is on; `run` goes on with `on`, nothing happens if no answer in 2 s. */
  private query(run: () => void): void {
    if (Session.isOffline) {
      run();
      return;
    }
    clearTimeout(this.pendingTimer);
    this.pending = run;
    this.pendingTimer = setTimeout(() => (this.pending = null), QUERY_TIMEOUT_MS);
    const packet = LahapJewelMixRequestPacket.createPacket();
    packet.Operation = LahapJewelMixRequestMixTypeEnum.Mix;
    packet.Item = QUERY_JEWEL as LahapJewelMixRequestItemTypeEnum;
    Session.sendToGS(packet.buffer);
  }

  /** Season1: the server's `#jewelpack:on|off`. Off is red, also for a refused real request; on runs the waiting click. */
  packingReply(on: boolean): void {
    const run = this.pending;
    this.pending = null;
    clearTimeout(this.pendingTimer);
    if (!on) Social.errorMessage(t('jewelMix.disabled'));
    else run?.();
  }

  /**
   * Season1, right click on a jewel in the bag: under 10 loose ones says so in red, else asks to
   * bundle the biggest stack. False when the item is not a loose jewel (the click goes on).
   */
  askBundle(slot: number): boolean {
    const item = Hero.items[slot];
    const jewel = item ? singleJewel(item) : -1;
    if (!item || jewel < 0 || item.lvl) return false;
    this.query(() => {
      const size = bundleSizeFor(looseCount(Hero.items, jewel));
      if (!size) Social.errorMessage(t('jewelMix.cannotBundle'));
      else Economy.openPrompt({ kind: 'jewel-bundle', jewel, size });
    });
    return true;
  }

  /**
   * Season1, right click on a packed jewel in the bag: with no room for its loose jewels says so in red,
   * else asks to unbundle. False when the item is not a packed jewel (the click goes on).
   */
  askUnbundle(slot: number): boolean {
    const item = Hero.items[slot];
    const jewel = item ? packedJewel(item) : -1;
    if (!item || jewel < 0) return false;
    this.query(() => {
      const level = Math.min(item.lvl ?? 0, STACK_SIZES.length - 1);
      const size = STACK_SIZES[level];
      if (!hasRoomFor(Hero.items, size)) Social.errorMessage(t('jewelMix.noRoom'));
      else Economy.openPrompt({ kind: 'jewel-unbundle', jewel, size, slot });
    });
    return true;
  }

  /** Season1: OK on the unbundle box. The same Unmix request, with no Lahap open and no close after. */
  unbundle(slot: number, jewel: number): void {
    const item = Hero.items[slot];
    if (!item || packedJewel(item) !== jewel) {
      Social.errorMessage(t('jewelMix.cannotDismantle'));
      return;
    }
    const level = Math.min(item.lvl ?? 0, STACK_SIZES.length - 1);
    if (!hasRoomFor(Hero.items, STACK_SIZES[level])) {
      Social.errorMessage(t('jewelMix.noRoom'));
      return;
    }
    const packet = LahapJewelMixRequestPacket.createPacket();
    packet.Operation = LahapJewelMixRequestMixTypeEnum.Unmix;
    packet.Item = jewel;
    packet.MixingStackSize = level;
    packet.UnmixingSourceSlot = slot;
    if (!Session.isOffline) Session.sendToGS(packet.buffer);
  }

  /** Season1: OK on the bundle box. The same Mix request, with no Lahap open and no close after. */
  bundle(jewel: number, size: number): void {
    if (looseCount(Hero.items, jewel) < size) {
      Social.errorMessage(t('jewelMix.cannotBundle'));
      return;
    }
    const packet = LahapJewelMixRequestPacket.createPacket();
    packet.Operation = LahapJewelMixRequestMixTypeEnum.Mix;
    packet.Item = jewel;
    packet.MixingStackSize = size / 10 - 1;
    if (!Session.isOffline) Session.sendToGS(packet.buffer);
  }

  /** `COMGEM::Exit`: every Close, and after a request. */
  exit(): void {
    this.init();
    if (!Session.isOffline) Session.sendToGS(CloseNpcRequestPacket.createPacket().buffer);
  }

  /** `COMGEM::Init`. */
  private init(): void {
    runInAction(() => {
      this.box = null;
      this.jewel = -1;
      this.size = 0;
      this.zen = 0;
    });
  }
})();
