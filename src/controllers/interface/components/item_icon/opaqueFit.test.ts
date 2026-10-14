import { describe, expect, it } from 'vitest';
import { opaqueBox, opaqueFit } from './opaqueFit';

const picture = (w: number, h: number, box: [number, number, number, number]) => {
  const px = new Uint8ClampedArray(w * h * 4);
  const [x0, y0, x1, y1] = box;
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) px[(y * w + x) * 4 + 3] = 255;
  return px;
};

describe('opaqueFit (ours)', () => {
  it('measures the opaque box as shares of the picture', () => {
    expect(opaqueBox(picture(100, 100, [40, 30, 59, 69]), 100, 100)).toEqual({ w: 0.2, h: 0.4, cx: 0.5, cy: 0.5 });
    expect(opaqueBox(new Uint8ClampedArray(400), 10, 10)).toBeNull();
  });

  it('brings a model to the still icon height, centred', () => {
    // 20% tall -> 80% tall: four times.
    expect(opaqueFit(picture(100, 100, [40, 40, 59, 59]), 100, 100, 0.8)).toBe('scale(4) translate(0%, 0%)');
    expect(opaqueFit(picture(100, 100, [0, 0, 19, 19]), 100, 100, 0.2)).toBe('scale(1) translate(40%, 40%)');
  });

  it('shrinks a model drawn taller than the still', () => {
    expect(opaqueFit(picture(10, 10, [0, 0, 9, 9]), 10, 10, 0.5)).toBe('scale(0.5) translate(0%, 0%)');
  });
});
