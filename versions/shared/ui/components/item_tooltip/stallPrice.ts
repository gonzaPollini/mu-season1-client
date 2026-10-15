/** A stall price's colour: red from 10M, yellow from 1M, green from 100k, else white (ZzzInventory.cpp:1947-1954). */
export function stallPriceColor(price: number): 'red' | 'yellow' | 'green' | 'white' {
  if (price >= 10_000_000) return 'red';
  if (price >= 1_000_000) return 'yellow';
  if (price >= 100_000) return 'green';
  return 'white';
}
