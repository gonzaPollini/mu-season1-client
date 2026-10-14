import { describe, expect, it } from 'vitest';
import { opaqueFit } from './opaqueFit';

const picture = (
  w: number,
  h: number,
  box: [number, number, number, number]
) => {
  const px = new Uint8ClampedArray(w * h * 4);
  const [x0, y0, x1, y1] = box;
  for (let y = y0; y <= y1; y++)
    for (let x = x0; x <= x1; x++) px[(y * w + x) * 4 + 3] = 255;
  return px;
};

describe('opaqueFit (ours)', () => {
  it('blows a small centred model up to the box, less the turning margin', () => {
    expect(opaqueFit(picture(100, 100, [40, 40, 59, 59]), 100, 100)).toBe(
      'scale(4.5) translate(0%, 0%)'
    );
  });

  it('centres an off-centre model', () => {
    expect(opaqueFit(picture(100, 100, [0, 0, 19, 19]), 100, 100, 1)).toBe(
      'scale(5) translate(40%, 40%)'
    );
  });

  it('never shrinks, and leaves an empty picture alone', () => {
    expect(opaqueFit(picture(10, 10, [0, 0, 9, 9]), 10, 10)).toBe(
      'scale(1) translate(0%, 0%)'
    );
    expect(opaqueFit(new Uint8ClampedArray(400), 10, 10)).toBeNull();
  });
});
