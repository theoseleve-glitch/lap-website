import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import SessionProof from '../../components/rooms/SessionProof.astro';

const render = async () =>
  (await AstroContainer.create()).renderToString(SessionProof);

describe('SessionProof · accent + tick-up', () => {
  test('section + sector wiring', async () => {
    const html = await render();
    expect(html).toMatch(/data-sector-id="session-proof"/);
    expect(html).toMatch(/data-accent="red"/);
  });

  test('eyebrow + monument headline', async () => {
    const html = await render();
    expect(html).toMatch(/02 \/ POST-RACE WRAP/);
    expect(html).toMatch(/<h2[^>]*class="[^"]*font-monument[^"]*"/);
    expect(html).toMatch(/Every session ends with a clear next step/);
  });

  test('three beam-cards with the 3 mantras', async () => {
    const html = await render();
    expect(html).toContain('YOUR SCORE');
    expect(html).toContain('YOUR DEBRIEF');
    expect(html).toContain('YOUR PROGRESSION');
    const beam = html.match(/beam-card/g) ?? [];
    expect(beam.length).toBeGreaterThanOrEqual(3);
  });

  test('debrief loss tagged with data-tick-target for the 41 (cs)', async () => {
    const html = await render();
    expect(html).toMatch(/data-tick-target="41"/);
  });

  test('compressed body copy ≤ 90 words', async () => {
    const html = await render();
    const text = html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ');
    const words = text.split(/\s+/).filter(Boolean).length;
    expect(words).toBeLessThan(90);
  });

  test('no AI/LLM language', async () => {
    const html = (await render()).toLowerCase();
    expect(html).not.toMatch(/\bai coach\b/);
    expect(html).not.toMatch(/\bllm\b/);
  });
});
