import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import PitStop from '../../components/rooms/PitStop.astro';

const render = async () => (await AstroContainer.create()).renderToString(PitStop);

describe('PitStop room', () => {
  test('eyebrow + headline + RACER tier', async () => {
    const html = await render();
    expect(html).toMatch(/09 \/ PIT STOP/);
    expect(html).toMatch(/Simple pricing\. Serious tools/);
    expect(html).toContain('RACER');
  });

  test('both prices, BEST VALUE on annual, gold CTA, see full pricing link', async () => {
    const html = await render();
    expect(html).toMatch(/€15 \/ month/);
    expect(html).toMatch(/€150 \/ year/);
    expect(html).toMatch(/BEST VALUE/);
    expect(html).toMatch(/<a[^>]+href="https:\/\/app\.lap-coach\.racing\/signup"/);
    expect(html).toMatch(/bg-pit-orange/);
    expect(html).toMatch(/<a[^>]+href="\/pricing"/);
  });

  test('trust strip', async () => {
    const html = await render();
    expect(html).toMatch(/GDPR COMPLIANT/);
    expect(html).toMatch(/EXPORTABLE DATA/);
    expect(html).toMatch(/NO LOCK-IN/);
  });

  test('strategic-doctrine guards', async () => {
    const html = (await render()).toLowerCase();
    expect(html).not.toMatch(/\bai coach\b/);
    expect(html).not.toMatch(/\bllm\b/);
    expect(html).not.toMatch(/\bgenerative\b/);
  });
});
