import { describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';

vi.stubGlobal('location', { search: '', hostname: 'localhost', href: 'http://localhost/' });
const { ItemIcon } = await import('.');

const BLADE = { group: 0, num: 5, lvl: 0 };

// RenderItem3D turns the item under the cursor (`Select`, ZzzInventory.cpp:8856-8859), pack icon or not.
describe('the item icon', () => {
  it('holds a canvas for the turning picture while hovered, over the still one until it draws', () => {
    const html = renderToStaticMarkup(<ItemIcon item={BLADE} spin />);
    expect(html).toContain('<canvas');
    expect(html).toContain('<img');
  });

  it('is the still picture alone otherwise', () => {
    expect(renderToStaticMarkup(<ItemIcon item={BLADE} />)).not.toContain('<canvas');
  });

  // Ours (Season1): a jewel rests small and grows to its full fit under the cursor, where it turns.
  it('draws a jewel smaller at rest and at its full size under the cursor, turning', () => {
    const BLESS = { group: 14, num: 13, lvl: 0 };
    const rest = renderToStaticMarkup(<ItemIcon item={BLESS} />);
    const hover = renderToStaticMarkup(<ItemIcon item={BLESS} spin />);
    const zoom = (html: string) => Number(/scale\(([0-9.]+)\)/.exec(html)?.[1]);
    expect(hover).toContain('<canvas');
    expect(zoom(rest)).toBeLessThan(zoom(hover));
    expect(zoom(hover)).toBeCloseTo(3.97);
  });
});
