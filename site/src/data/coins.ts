/**
 * Paquetes de MU Coins: valores de EJEMPLO (precios en ARS). El backend real
 * es el que manda (`GET /api/coins/packs`); esto sólo alimenta el mock.
 */
export type CoinPack = { id: string; coins: number; bonus: number; priceArs: number };

export const COIN_PACKS: CoinPack[] = [
  { id: 'p500', coins: 500, bonus: 0, priceArs: 2500 },
  { id: 'p1000', coins: 1000, bonus: 0, priceArs: 4500 },
  { id: 'p2500', coins: 2500, bonus: 150, priceArs: 10000 },
  { id: 'p5000', coins: 5000, bonus: 500, priceArs: 18000 },
  { id: 'p10000', coins: 10000, bonus: 1500, priceArs: 32000 },
];
