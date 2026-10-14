/**
 * Ours (Season1): the opaque box of an RGBA picture, as shares of its size, or null when it is empty.
 */
export function opaqueBox(pixels: Uint8ClampedArray, width: number, height: number): { w: number; h: number; cx: number; cy: number } | null {
  let minX = width;
  let minY = height;
  let maxX = -1;
  let maxY = -1;
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      if (pixels[(y * width + x) * 4 + 3] <= 8) continue;
      if (x < minX) minX = x;
      if (x > maxX) maxX = x;
      if (y < minY) minY = y;
      if (y > maxY) maxY = y;
    }
  }
  if (maxX < 0) return null;
  return {
    w: (maxX - minX + 1) / width,
    h: (maxY - minY + 1) / height,
    cx: (minX + maxX + 1) / 2 / width,
    cy: (minY + maxY + 1) / 2 / height,
  };
}

/**
 * Ours (Season1): the CSS transform that brings the opaque part of a turning item's picture to
 * `targetHeight` (a share of its box), centred: a hovered jewel turns at the height its still icon
 * has, which is the size it has when picked up too.
 */
export function opaqueFit(pixels: Uint8ClampedArray, width: number, height: number, targetHeight: number): string | null {
  const box = opaqueBox(pixels, width, height);
  if (!box) return null;
  const r = (n: number) => Math.round(n * 1000) / 1000;
  return `scale(${r(targetHeight / box.h)}) translate(${r((0.5 - box.cx) * 100)}%, ${r((0.5 - box.cy) * 100)}%)`;
}
