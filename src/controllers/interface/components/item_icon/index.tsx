import { memo, useEffect, useRef, useState, type ReactNode } from 'react';
import { observer } from 'mobx-react-lite';
import type { Item } from '@/ecs/world';
import { itemIconKey, itemIconPackChain, jewelryFrameUrl } from '@/controllers/assets/itemIconPack';
import { ITEM_ICON_FIT } from '@/controllers/interface/item_icons/itemIconFit';
import { liveItemIcon, liveItemIconKey, spinLiveItemIcon } from '@/controllers/interface/item_icons/liveItemIcon';
import { isCommonJewelry, isJewel, isPackedJewel, itemDef, itemLevelLook } from '@/controllers/item_rules';
import { opaqueBox, opaqueFit } from './opaqueFit';

/**
 * `<img fetchpriority>` is not a React 18 prop (it arrives with React 19), so
 * it goes to the DOM as a plain lowercase attribute. High: an icon is what the
 * player is waiting on; the world's model / texture fetches are already high
 * and would otherwise starve it (see itemIconPack.ts).
 */
const IMG_PRIORITY = { fetchpriority: 'high' } as const;

/**
 * The pack renders every item at one world scale into a canvas sized by its
 * inventory footprint, so a small item covers a small part of its own PNG and
 * fitting that canvas to the square left a jewel a few pixels across. The
 * measured zoom (tools/itemIconFit.ts) blows the opaque box back up to the
 * square; the translate takes off the render's drift off centre first, since
 * the zoom is about the canvas centre and would scale that drift too.
 *
 * The zoom never overflows: it is capped by the canvas, and the canvas is
 * what `max-width/height: 100%` has already fitted into the box.
 */
function fitTransform(item: Item): string | undefined {
  const key = `${item.group}_${item.num}`;
  const levelKey = itemLevelLook(item.group, item.num, item.lvl) ? `${key}_${item.lvl}` : key;
  const fit = ITEM_ICON_FIT[levelKey];
  if (!fit) return undefined;
  const [zoom, dx, dy] = fit;
  return `scale(${zoom}) translate(${dx * 100}%, ${dy * 100}%)`;
}

/**
 * Ours (Season1): a jewel's turning model is framed smaller than its fitted still, so hovering
 * shrank it. Under the cursor it now turns at the height its still icon has, which is also its size
 * when picked up (`Spin` with `fill`, `stillBox`, `opaqueFit.ts`).
 */

/**
 * Ours: how a pack picture shows in its square once fitted - its opaque part's height and its
 * centre off the square's, as shares of the square.
 */
type StillBox = { h: number; x: number; y: number };
const stillBoxes = new Map<string, Promise<StillBox | null>>();
function stillBox(url: string, fit: readonly number[] | undefined): Promise<StillBox | null> {
  const [zoom = 1, dx = 0, dy = 0] = fit ?? [];
  const key = `${url}|${zoom}|${dx}|${dy}`;
  let found = stillBoxes.get(key);
  if (!found) {
    found = new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const context = canvas.getContext('2d');
        context?.drawImage(img, 0, 0);
        const data = context?.getImageData(0, 0, canvas.width, canvas.height);
        const box = data && opaqueBox(data.data, data.width, data.height);
        const side = Math.max(img.naturalWidth, img.naturalHeight);
        const w = img.naturalWidth / side;
        const h = img.naturalHeight / side;
        resolve(box ? { h: box.h * h * zoom, x: zoom * (box.cx - 0.5 + dx) * w, y: zoom * (box.cy - 0.5 + dy) * h } : null);
      };
      img.onerror = () => resolve(null);
      img.src = url;
    });
    stillBoxes.set(key, found);
  }
  return found;
}

/** Ours: the CSS transform that frames a drawn picture like the pack picture `frame`. */
function useFrameFit(frame: string | undefined, fit: readonly number[] | undefined) {
  const [transform, setTransform] = useState<string | null>(null);
  const frameTo = (image: ImageData) => {
    if (!frame) return;
    void stillBox(frame, fit).then(box => {
      if (box) setTransform(opaqueFit(image.data, image.width, image.height, box.h, box));
    });
  };
  return [transform, frameTo, () => setTransform(null)] as const;
}

function fitOf(item: Item): readonly number[] | undefined {
  const key = `${item.group}_${item.num}`;
  const levelKey = itemLevelLook(item.group, item.num, item.lvl) ? `${key}_${item.lvl}` : key;
  return ITEM_ICON_FIT[levelKey];
}

/**
 * Ours (Season1): rings and pendants sit in a 28 equipment slot but a 20 bag square, so they read 1.4
 * times bigger when worn; in the bag and when picked up they are blown up to that size.
 */
const JEWELRY_GROW = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transform: `scale(${28 / 20})`,
} as const;

/** Ours: the skill orbs (group 12), which keep their size turning too. */
const ORB_NUMBERS: ReadonlySet<number> = new Set([7, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 44, 45, 46, 47]);

/** The items that turn at their resting size under the cursor: jewels and their packs, orbs, rings and pendants. */
function isJewelItem(item: Item): boolean {
  if (item.group === 12 && ORB_NUMBERS.has(item.num)) return true;
  if (isCommonJewelry(item.group, item.num) || isPackedJewel(item.group, item.num)) return true;
  const def = itemDef(item.group, item.num);
  return !!def && isJewel(def);
}

/** The turning picture covers the item's squares, as the live still does. */
const SPIN_STYLE = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'contain' } as const;

/**
 * The item under the cursor turning on a canvas (`Select` in RenderObjectScreen,
 * ZzzInventory.cpp:8856-8859); the still picture shows until the first turned one is drawn.
 */
const Spin = observer(function Spin({ item, still, fill }: { item: Item; still: ReactNode; fill?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);
  const [fit, frameTo, unframe] = useFrameFit(fill, fill ? fitOf({ ...item, lvl: 0 }) : undefined);
  const look = liveItemIconKey(item);
  useEffect(() => {
    const target = canvas.current;
    if (!target) return undefined;
    const stop = spinLiveItemIcon(item, target, () => {
      // Ours: `fill` (the still's pack picture) brings the first turned picture to the still's size and place.
      const image = fill ? target.getContext('2d')?.getImageData(0, 0, target.width, target.height) : undefined;
      if (image) frameTo(image);
      setReady(true);
    });
    return () => {
      stop?.();
      setReady(false);
      unframe();
    };
    // The look is what the picture depends on; the item object may be rebuilt by a refresh.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [look]);
  return (
    <>
      {!ready && still}
      <canvas ref={canvas} className="item-icon" style={fit ? { ...SPIN_STYLE, transform: fit } : SPIN_STYLE} />
    </>
  );
});

/**
 * An item's icon from the pre-rendered pack (itemIconPack.ts), or drawn from its model when the
 * pack has no file for it (`item_icons/liveItemIcon.ts`; already framed, so no fit). `spin`: the
 * item is under the cursor, so its model turns over the still picture.
 *
 * An observer leaf taking the item itself: only the fields the file name
 * depends on (`itemIconKey`) are read here, so a durability tick or an
 * option change on one item re-renders nothing - the grid above passes the
 * same `item` reference and this memo skips. (The old `{...item}` spread
 * subscribed the whole grid to all fourteen fields of every item.)
 */
export const ItemIcon = memo(
  // Ours: `inSlot` - drawn in its equipment slot, already the size rings and pendants are shown at.
  observer(function ItemIcon({ item, spin = false, inSlot = false }: { item: Item; spin?: boolean; inSlot?: boolean }) {
    const key = itemIconKey(item);
    /** Which URL of the pack chain is showing; past the end = no file at all. */
    const [fallbackStep, setFallbackStep] = useState(0);
    useEffect(() => {
      setFallbackStep(0);
    }, [key]);
    const chain = itemIconPackChain(item);
    const jewel = isJewelItem(item);
    // Ours: a ring or pendant drawn from its model is framed like its +0 picture.
    const frame = jewelryFrameUrl(item) ?? undefined;
    const still = stillIcon(item, chain, fallbackStep, setFallbackStep, frame);
    const fill = frame ?? (jewel && fallbackStep < chain.length ? chain[fallbackStep] : undefined);
    const icon = spin ? <Spin item={item} still={still} fill={fill} /> : still;
    return !inSlot && isCommonJewelry(item.group, item.num) ? <div style={JEWELRY_GROW}>{icon}</div> : icon;
  })
);

/** The still picture: the pack's file, else the live one drawn from the model, else an empty square. */
function stillIcon(
  item: Item,
  chain: readonly string[],
  fallbackStep: number,
  setFallbackStep: (next: (step: number) => number) => void,
  frame?: string
): ReactNode {
  if (fallbackStep >= chain.length) {
    // No pack file: the original draws every icon from the model, so draw this one.
    const live = liveItemIcon(item);
    if (live && frame) return <FramedStill src={live} frame={frame} fit={fitOf({ ...item, lvl: 0 })} />;
    if (live) {
      return <img src={live} className="item-icon" alt="" draggable={false} decoding="async" />;
    }
    return (
      <div
        className="item-icon item-icon-missing"
        title={`item ${item.group}/${item.num}`}
      />
    );
  }

  return (
    <img
      src={chain[fallbackStep]}
      className="item-icon"
      style={{ transform: fitTransform(item) }}
      alt=""
      draggable={false}
      decoding="async"
      {...IMG_PRIORITY}
      onError={() => setFallbackStep(step => step + 1)}
    />
  );
}

/** Ours: a picture drawn from the model, framed like the pack picture `frame`. */
function FramedStill({ src, frame, fit }: { src: string; frame: string; fit: readonly number[] | undefined }) {
  const [transform, frameTo, unframe] = useFrameFit(frame, fit);
  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const context = canvas.getContext('2d');
      context?.drawImage(img, 0, 0);
      const data = context?.getImageData(0, 0, canvas.width, canvas.height);
      if (data) frameTo(data);
    };
    img.src = src;
    return unframe;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, frame]);
  return (
    <img
      src={src}
      className="item-icon"
      style={transform ? { transform, visibility: 'visible' } : { visibility: 'hidden' }}
      alt=""
      draggable={false}
      decoding="async"
    />
  );
}
