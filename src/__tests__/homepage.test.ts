import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Home from '../pages/index.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(Home));

// ── Doctrine-locked copy (T023 / T024) ─────────────────────────────────
// StartGrid still owns these strings post-Phase 3 — the V2 March visual
// envelope dresses doctrine copy, doesn't replace it.

test('homepage renders the chosen Option B headline verbatim', async () => {
  const html = await render();
  expect(html).toContain('Every lap, one step better.');
});

test('homepage forbids the other headline option at the HTML surface', async () => {
  const html = await render();
  expect(html).not.toContain('The Driver OS — Train. Race. Improve.');
});

test('homepage uses StartGrid (section landmark + font-display H1)', async () => {
  const html = await render();
  expect(html).toMatch(/<section[\s>]/);
  expect(html).toMatch(/<h1[^>]*class="[^"]*font-display[^"]*"/);
});

test('homepage renders the locked T024 subhead verbatim', async () => {
  const html = await render();
  expect(html).toContain(
    'The cross-platform Driver OS that turns every sim and real-world session into measurable progress.',
  );
});

test('homepage subhead carries the Driver OS category claim', async () => {
  const html = await render();
  expect(html).toMatch(/Driver OS/);
});

test('homepage subhead names the cross-platform ecosystem', async () => {
  const html = await render();
  expect(html).toMatch(/cross-platform/i);
  expect(html).toMatch(/sim and real-world/);
});

test('homepage copy forbids AI-coach / LLM vocabulary (ADR-004 §4)', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
});

// ── Hero-twin CTA contract (T025 / T026) ───────────────────────────────

test('T025 primary CTA: "Start 14-day trial" → https://app.lap-coach.racing/signup', async () => {
  const html = await render();
  expect(html).toMatch(
    /<a[^>]+href="https:\/\/app\.lap-coach\.racing\/signup"[^>]*>[\s\S]*Start 14-day trial[\s\S]*<\/a>/,
  );
});

test('T025 primary CTA carries rel="noopener" for the cross-origin hand-off', async () => {
  const html = await render();
  expect(html).toMatch(/<a[^>]+href="https:\/\/app\.lap-coach\.racing\/signup"[^>]+rel="noopener"/);
});

test('T026 secondary CTA: "See how it works" → /how-it-works (same-origin)', async () => {
  const html = await render();
  expect(html).toMatch(/<a[^>]+href="\/how-it-works"[^>]*>[\s\S]*See how it works[\s\S]*<\/a>/);
});

test('T026 secondary CTA omits rel="noopener" on same-origin href', async () => {
  const html = await render();
  expect(html).not.toMatch(/<a[^>]+href="\/how-it-works"[^>]+rel="noopener"/);
});

test('T028 renders the DriverProfilePreview inside the StartGrid', async () => {
  const html = await render();
  expect(html).toMatch(/role="img"[^>]+aria-label="Driver Profile preview/);
});

// ── Phase 3 V2 March room sequence ─────────────────────────────────────
// 10 rooms in canonical order, with MarqueeStrip mounted between
// StartGrid (room 01) and SessionProof (room 02).

test('homepage mounts the 10 V2 March rooms in canonical order', async () => {
  const html = await render();
  const order = [
    '01 / START GRID',
    '02 / SESSION CARDS',
    '03 / SECTOR 1',
    '04 / SECTOR 2',
    '05 / SECTOR 3',
    '06 / SIM FIRST',
    '07 / PREMIUM LAYER',
    '08 / GARAGE',
    '09 / PIT STOP',
    '10 / PODIUM',
  ];
  let cursor = 0;
  for (const marker of order) {
    const idx = html.indexOf(marker, cursor);
    expect(idx, `expected "${marker}" at or after offset ${cursor}`).toBeGreaterThan(-1);
    cursor = idx + marker.length;
  }
});

test('MarqueeStrip with racing keywords sits between StartGrid and SessionProof', async () => {
  const html = await render();
  const keywords = [
    'TELEMETRY',
    'LAP ANALYSIS',
    'CORNER COACHING',
    'PERFORMANCE SCORING',
    'SESSION DEBRIEF',
    'DATA ENGINEERING',
    'TRACK MAPPING',
  ];
  for (const k of keywords) expect(html).toMatch(new RegExp(k));

  const startGridIdx = html.indexOf('01 / START GRID');
  const marqueeIdx = html.indexOf('TELEMETRY');
  const sessionProofIdx = html.indexOf('02 / SESSION CARDS');
  expect(startGridIdx).toBeGreaterThan(-1);
  expect(marqueeIdx).toBeGreaterThan(startGridIdx);
  expect(sessionProofIdx).toBeGreaterThan(marqueeIdx);
});

// ── Phase 3 surface-level content guards ───────────────────────────────

test('homepage carries the V2 March SIM-RACING badge in StartGrid', async () => {
  const html = await render();
  expect(html).toContain('SIM-RACING EARLY ACCESS NOW OPEN');
});

test('homepage carries the SessionProof three-card mantras', async () => {
  const html = await render();
  expect(html).toContain('YOUR SCORE');
  expect(html).toContain('YOUR DEBRIEF');
  expect(html).toContain('YOUR PROGRESSION');
});

test('homepage carries the S2Versus dual-headline contrast', async () => {
  const html = await render();
  expect(html).toMatch(/They time laps/);
  expect(html).toMatch(/We coach drivers/);
});

test('homepage carries the PitStop pricing card with both billing options', async () => {
  const html = await render();
  expect(html).toMatch(/€15 \/ month/);
  expect(html).toMatch(/€150 \/ year/);
});

test('homepage closes with the Podium chequered-flag CTA', async () => {
  const html = await render();
  expect(html).toMatch(/Your driving deserves/);
  expect(html).toMatch(/Start free — try the demo dashboard/);
});
