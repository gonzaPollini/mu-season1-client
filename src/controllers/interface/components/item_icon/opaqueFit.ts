/**
 * Ours (Season1): the CSS transform that blows the opaque part of an RGBA picture up to fill its
 * box, centred, as `fitTransform` does for a pack icon. Used on the first turned picture of a
 * hovered jewel, whose model the original frames smaller. `margin` leaves room for the turn.
 */
export function opaqueFit(
  pixels: Uint8ClampedArray,
  width: number,
  height: number,
  margin = 0.95
): string | null {
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
  const zoom = Math.max(
    1,
    Math.min(width / (maxX - minX + 1), height / (maxY - minY + 1)) * margin
  );
  const dx = (width / 2 - (minX + maxX + 1) / 2) / width;
  const dy = (height / 2 - (minY + maxY + 1) / 2) / height;
  const r = (n: number) => Math.round(n * 1000) / 1000;
  return `scale(${r(zoom)}) translate(${r(dx * 100)}%, ${r(dy * 100)}%)`;
}
