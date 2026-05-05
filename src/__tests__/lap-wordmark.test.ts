import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import LapWordmark from '../components/chrome/LapWordmark.astro';

const render = (props?: { href?: string; ariaLabel?: string }) =>
  AstroContainer.create().then((c) => c.renderToString(LapWordmark, { props: props ?? {} }));

describe('LapWordmark', () => {
  test('renders the literal text "LAP" inside an anchor', async () => {
    const html = await render();
    expect(html).toMatch(/<a[^>]*>[\s\S]*?LAP[\s\S]*?<\/a>/);
  });
  test('default href is "/" (home)', async () => {
    const html = await render();
    expect(html).toMatch(/<a[^>]*href="\/"/);
  });
  test('href can be overridden via prop (Phase-3 scroll-link to home StartGrid)', async () => {
    const html = await render({ href: '/#start-grid' });
    expect(html).toMatch(/<a[^>]*href="\/#start-grid"/);
  });
  test('uses font-monument class (display + 700 + uppercase + tight tracking from Phase 1)', async () => {
    const html = await render();
    expect(html).toMatch(/class="[^"]*font-monument[^"]*"/);
  });
  test('has aria-label for screen readers (default "LAP — home")', async () => {
    const html = await render();
    expect(html).toMatch(/aria-label="LAP\s*—\s*home"/);
  });
  test('aria-label is overridable', async () => {
    const html = await render({ ariaLabel: 'LAP — back to start' });
    expect(html).toMatch(/aria-label="LAP\s*—\s*back to start"/);
  });
});
