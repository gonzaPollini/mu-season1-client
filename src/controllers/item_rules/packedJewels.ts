/** MODEL_PACKED_JEWEL_OF_* (_enum.h:1855-1856, :1923-1930): group 12, 30-31 and 136-143. */
const NUMBERS: ReadonlySet<number> = new Set([30, 31, 136, 137, 138, 139, 140, 141, 142, 143]);

export function isPackedJewel(group: number, num: number): boolean {
  return group === 12 && NUMBERS.has(num);
}

/** The loose jewels a pack holds: `(Level + 1) * 10` (`CalcCompiledCount`, CComGem.cpp:250-255). */
export function packedJewelCount(level: number): number {
  return (level + 1) * 10;
}
