/**
 * Ours (Season1): the common rings and pendants (group 13): Ice, Poison, Lighting, Fire, Earth, Wind,
 * Magic, Water, Ability. The Season1 server levels them up past the original's +4 (mu-season1-server
 * `JewelryUpgrade.cs`, same list), so the client treats them like gear for jewels and icons.
 */
const NUMBERS: ReadonlySet<number> = new Set([8, 9, 12, 13, 21, 22, 23, 24, 25, 26, 27, 28]);

export function isCommonJewelry(group: number, num: number): boolean {
  return group === 13 && NUMBERS.has(num);
}
