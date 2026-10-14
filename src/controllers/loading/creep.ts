/**
 * Ours: a load bar that never stands still. Each real report sends the bar, as a compositor
 * transition, toward a point past it (`creepTarget`) over `creepSeconds`, so it keeps moving while
 * the main thread is busy building the map; the next report retargets it. Done goes straight to 1.
 */

/** A stalled bar stops short of this. */
export const CREEP_CAP = 0.97;

const CREEP_SECONDS = 10;
/** The share of what is left the bar creeps into: enough to keep moving, not to run ahead of the text. */
const CREEP_SHARE = 0.2;
const DONE_SECONDS = 0.25;

const clamp01 = (value: number) =>
  Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));

/** Where the bar heads from `progress`: `CREEP_SHARE` of the way to `CREEP_CAP`, never behind the real value. */
export function creepTarget(progress: number): number {
  const p = clamp01(progress);
  return p >= 1 ? 1 : Math.max(p, p + (CREEP_CAP - p) * CREEP_SHARE);
}

/** The CSS transition that carries the bar there. */
export function creepTransition(
  progress: number,
  property = 'transform'
): string {
  return clamp01(progress) >= 1
    ? `${property} ${DONE_SECONDS}s ease-out`
    : `${property} ${CREEP_SECONDS}s cubic-bezier(0.2, 0.6, 0.35, 1)`;
}
