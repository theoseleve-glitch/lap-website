import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Home from '../pages/index.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(Home));

// Doctrine-locked copy
test('homepage carries T023 headline verbatim', async () => {
  const html = await render();
  expect(html).toContain('Every lap, one step better.');
});

test('forbids the alternative T023 option', async () => {
  const html = await render();
  expect(html).not.toContain('The Driver OS — Train. Race. Improve.');
});

test('font-display H1 is present', async () => {
  const html = await render();
  expect(html).toMatch(/<h1[^>]*class="[^"]*font-display[^"]*"/);
});

test('T024 subhead lives in StartGrid (post-absorption)', async () => {
  const html = await render();
  expect(html).toContain(
    'The cross-platform Driver OS that turns every sim and real-world session into measurable progress.',
  );
});

test('forbids AI / LLM / generative vocabulary (ADR-004 §4)', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
  expect(html.toLowerCase()).not.toMatch(/\bgenerative\b/);
});

test('T025 primary CTA links to signup with rel=noopener', async () => {
  const html = await render();
  expect(html).toMatch(/<a[^>]+href="https:\/\/app\.lap-coach\.racing\/signup"[^>]+rel="noopener"/);
});

test('T026 secondary CTA links to /how-it-works without rel=noopener', async () => {
  const html = await render();
  expect(html).toMatch(/<a[^>]+href="\/how-it-works"[^>]*>[\s\S]*See how it works/);
  expect(html).not.toMatch(/<a[^>]+href="\/how-it-works"[^>]+rel="noopener"/);
});

// Phase 4 · 7-room sequence
test('homepage mounts the 7 rooms in canonical order', async () => {
  const html = await render();
  const order = [
    '01 / START GRID',
    '02 / POST-RACE WRAP',
    '03 / SECTOR 1',
    '04 / SECTOR 2',
    '05 / SECTOR 3',
    '06 / GARAGE',
    '07 / CHEQUERED FLAG',
  ];
  let cursor = 0;
  for (const marker of order) {
    const idx = html.indexOf(marker, cursor);
    expect(idx, `expected "${marker}" at or after offset ${cursor}`).toBeGreaterThan(-1);
    cursor = idx + marker.length;
  }
});

test('every room exposes data-sector-id', async () => {
  const html = await render();
  for (const id of ['start-grid', 'session-proof', 'the-pain', 'versus', 'pipeline', 'garage', 'podium']) {
    expect(html).toMatch(new RegExp(`data-sector-id="${id}"`));
  }
});

test('MarqueeStrip with racing keywords sits between StartGrid and SessionProof', async () => {
  const html = await render();
  for (const k of ['TELEMETRY','LAP ANALYSIS','CORNER COACHING','PERFORMANCE SCORING','SESSION DEBRIEF','DATA ENGINEERING','TRACK MAPPING']) {
    expect(html).toMatch(new RegExp(k));
  }
  const startGridIdx = html.indexOf('01 / START GRID');
  const marqueeIdx = html.indexOf('TELEMETRY');
  const sessionProofIdx = html.indexOf('02 / POST-RACE WRAP');
  expect(marqueeIdx).toBeGreaterThan(startGridIdx);
  expect(sessionProofIdx).toBeGreaterThan(marqueeIdx);
});
