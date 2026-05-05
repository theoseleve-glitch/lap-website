import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { expect, test } from 'vitest';
import Home from '../pages/index.astro';

const render = () => AstroContainer.create().then((c) => c.renderToString(Home));

test('homepage renders the chosen Option B headline verbatim', async () => {
  // Decision: 01-STRATEGIC-DOCTRINE.md §2 offered two options; Option B
  // (this string) was picked in T023 because "lap" is viscerally
  // understood by the primary persona and the subhead can then carry
  // the "Driver OS" category framing. If that decision gets revisited,
  // this test fails — and that's the point.
  const html = await render();
  expect(html).toContain('Every lap, one step better.');
});

test('homepage forbids the other headline option at the HTML surface', async () => {
  // Makes the A/B choice explicit in the regression net — accidentally
  // shipping both headlines or flipping to Option A would fail here.
  const html = await render();
  expect(html).not.toContain('The Driver OS — Train. Race. Improve.');
});

test('homepage uses the Hero component (section landmark + font-display H1)', async () => {
  const html = await render();
  expect(html).toMatch(/<section[\s>]/);
  expect(html).toMatch(/<h1[^>]*class="[^"]*font-display[^"]*"/);
});

test('homepage renders the locked T024 subhead verbatim', async () => {
  // Decision: T024 picked this exact sentence as the "ecosystem pitch"
  // subhead. It stacks under the Option B headline and is responsible
  // for delivering the doctrine's category claim ("Driver OS") and
  // cross-platform promise. Copy drift here breaks the stacked
  // headline+subhead argument — flag at the CI gate.
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
  // The subhead is the ONLY place at this point in the sprint where the
  // cross-platform claim lands — the sim↔real bridge is a doctrine
  // cornerstone (ADR-005 §5.5 TransferLink, §4 principle 7). Any
  // accidental narrowing (e.g. dropping "sim and real-world") would
  // silently misrepresent the product.
  const html = await render();
  expect(html).toMatch(/cross-platform/i);
  expect(html).toMatch(/sim and real-world/);
});

test('homepage copy forbids AI-coach / LLM vocabulary (ADR-004 §4)', async () => {
  const html = await render();
  expect(html.toLowerCase()).not.toMatch(/\bai coach\b/);
  expect(html.toLowerCase()).not.toMatch(/\bllm\b/);
});

test('T025 primary CTA: "Start 14-day trial" → https://app.lap-coach.racing/signup', async () => {
  // Decision: the primary CTA is the single conversion surface on the
  // homepage; href and text are locked here so any drift (typo, domain
  // migration, A/B wrapper) trips CI before it ships. Text is per
  // 01-STRATEGIC-DOCTRINE.md §8 "14-day full-feature free trial".
  const html = await render();
  expect(html).toMatch(
    /<a[^>]+href="https:\/\/app\.lap-coach\.racing\/signup"[^>]*>[\s\S]*Start 14-day trial[\s\S]*<\/a>/,
  );
});

test('T025 primary CTA carries rel="noopener" for the cross-origin hand-off', async () => {
  // Cross-origin security posture. Hero.astro auto-derives this from the
  // http(s):// prefix; locking it at the homepage layer catches any
  // future change that accidentally strips the attribute.
  const html = await render();
  expect(html).toMatch(/<a[^>]+href="https:\/\/app\.lap-coach\.racing\/signup"[^>]+rel="noopener"/);
});

test('T026 secondary CTA: "See how it works" → /how-it-works (same-origin)', async () => {
  // The secondary CTA is the low-commitment path for visitors not yet
  // ready to start a trial. /how-it-works is built by T042 in block C;
  // locking the href here means T042 can land the page without having
  // to also rewire the homepage.
  const html = await render();
  expect(html).toMatch(/<a[^>]+href="\/how-it-works"[^>]*>[\s\S]*See how it works[\s\S]*<\/a>/);
});

test('T026 secondary CTA omits rel="noopener" on same-origin href', async () => {
  // Hero.astro's rel derivation only fires for absolute http(s):// URLs;
  // same-origin routes should render a clean <a> without rel, since the
  // attribute is only meaningful (and the performance/tab-focus cost
  // only justified) for cross-origin navigations.
  const html = await render();
  expect(html).not.toMatch(/<a[^>]+href="\/how-it-works"[^>]+rel="noopener"/);
});

test('T028 renders the DriverProfilePreview inside the hero visual slot', async () => {
  // Integration check: the Hero visual slot is filled by
  // DriverProfilePreview, which is the T028 above-the-fold visual.
  // Checking for the component's aria-label rather than specific
  // Tailwind classes keeps the test resilient to styling refactors.
  const html = await render();
  expect(html).toMatch(/role="img"[^>]+aria-label="Driver Profile preview/);
});

test('T029 "After every session" section lands below the hero', async () => {
  // Integration check: homepage includes the three-tile coaching-loop
  // section with its <h2> and the three beat headings.
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*After every session[\s\S]*<\/h2>/);
  expect(html).toMatch(/Weakness detected/);
  expect(html).toMatch(/Prescription issued/);
  expect(html).toMatch(/Outcome measured/);
});

test('C09 renders MarqueeStrip with racing keywords between Hero and AfterEverySession', async () => {
  // Integration check: the MarqueeStrip component (C09) is mounted between
  // Hero and AfterEverySession with seven racing-domain keywords that mirror
  // V2's MARQUEE_TOP array. The marquee is a CSS-only animation with no JS.
  // This test verifies: (1) all marquee items appear, (2) placement is correct
  // (after Hero, before AfterEverySession), and (3) the component renders
  // without breaking the homepage's DOM flow.
  const html = await render();
  // Sanity: all seven marquee items present
  expect(html).toMatch(/TELEMETRY/);
  expect(html).toMatch(/LAP ANALYSIS/);
  expect(html).toMatch(/CORNER COACHING/);
  expect(html).toMatch(/PERFORMANCE SCORING/);
  expect(html).toMatch(/SESSION DEBRIEF/);
  expect(html).toMatch(/DATA ENGINEERING/);
  expect(html).toMatch(/TRACK MAPPING/);
  // Order check: MarqueeStrip appears after Hero's headline
  const heroIdx = html.indexOf('Every lap, one step better');
  const marqueeIdx = html.indexOf('TELEMETRY');
  expect(marqueeIdx).toBeGreaterThan(heroIdx);
  // MarqueeStrip appears before AfterEverySession's heading
  const afterSessionIdx = html.indexOf('After every session');
  expect(afterSessionIdx).toBeGreaterThan(marqueeIdx);
});

test('T030 "Sim and real" bridge section lands on the homepage, after T029', async () => {
  // Integration check: homepage mounts the SimAndReal section with its
  // locked heading, both H3 sub-beats, and the shape-vs-intensity
  // framework vocabulary (ADR-005 §5.5 TransferLink). Also asserts the
  // T030 section appears AFTER the T029 "After every session" section
  // so the page flows hero → coaching loop → bridge, not bridge →
  // coaching loop.
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*Sim and real, one driver profile[\s\S]*<\/h2>/);
  expect(html).toMatch(/One session format/);
  expect(html).toMatch(/Shape vs intensity/);
  const t029Idx = html.indexOf('After every session');
  const t030Idx = html.indexOf('Sim and real, one driver profile');
  expect(t029Idx).toBeGreaterThan(-1);
  expect(t030Idx).toBeGreaterThan(t029Idx);
});

test('T031 "Built for serious sim racers" persona section lands after T030', async () => {
  // Integration check: persona-fit bullets follow the bridge narrative
  // so a reader who has just been told "sim and real are one profile"
  // arrives at "and here's why you, specifically, are the driver we're
  // building for." Ordering matters — the persona section before the
  // bridge would read as "here's who you are, now here's the product",
  // which inverts the product-first-then-persona narrative.
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*Built for serious sim racers[\s\S]*<\/h2>/);
  const t030Idx = html.indexOf('Sim and real, one driver profile');
  const t031Idx = html.indexOf('Built for serious sim racers');
  expect(t030Idx).toBeGreaterThan(-1);
  expect(t031Idx).toBeGreaterThan(t030Idx);
});

test('T032 "Coming from Garage61 or MoTeC" comparison lands after T031', async () => {
  // Integration check: the competitive comparison sits AFTER the
  // persona-fit affirmation. A reader who has already said "yes, that
  // sounds like me" arrives at "here's how this fits alongside the
  // tools you've tried." Placing T032 before T031 would have readers
  // evaluating competitors before they've been told this is for them
  // — a sequencing mistake that weakens both sections.
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*Coming from Garage61 or MoTeC[\s\S]*<\/h2>/);
  const t031Idx = html.indexOf('Built for serious sim racers');
  const t032Idx = html.indexOf('Coming from Garage61 or MoTeC');
  expect(t031Idx).toBeGreaterThan(-1);
  expect(t032Idx).toBeGreaterThan(t031Idx);
});

test('T033 "Not for you if" anti-persona disclosure lands after T032', async () => {
  // Integration check: the anti-persona disclosure closes the
  // qualification arc (persona-fit → competitive frame → mis-fit
  // disclosure) before the page hands off to the pricing CTA in T034.
  // Ordering matters — revealing who the product ISN'T for before
  // comparing to competitors would read defensively; after, it reads
  // as the honest close.
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*Not for you if[\s\S]*<\/h2>/);
  const t032Idx = html.indexOf('Coming from Garage61 or MoTeC');
  const t033Idx = html.indexOf('Not for you if');
  expect(t032Idx).toBeGreaterThan(-1);
  expect(t033Idx).toBeGreaterThan(t032Idx);
});

test('T034 final CTA section lands after T033', async () => {
  // Integration check: the pricing snippet + trial CTA follows T033's
  // anti-persona close. The qualification arc (T031-T033) lands in
  // T034's ask ("Ready to make your next session count?"). T035's
  // social-proof placeholder renders after it as a scaffolded
  // postscript.
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*Ready to make your next session count\?[\s\S]*<\/h2>/);
  const t033Idx = html.indexOf('Not for you if');
  const t034Idx = html.indexOf('Ready to make your next session count');
  expect(t033Idx).toBeGreaterThan(-1);
  expect(t034Idx).toBeGreaterThan(t033Idx);
});

test('T035 social-proof placeholder lands after T034 as a scaffolded postscript', async () => {
  // Integration check: the social-proof section is explicitly a
  // scaffold today (no real quotes exist pre-beta); landing it below
  // the T034 primary CTA keeps the conversion surface unblocked and
  // treats the placeholder as a trust postscript rather than a
  // testimony wall. When real quotes land, the section will likely
  // migrate above the CTA — this test documents the current
  // scaffolded position.
  const html = await render();
  expect(html).toMatch(/<h2[^>]*>[\s\S]*No testimonials until the beta opens[\s\S]*<\/h2>/);
  const t034Idx = html.indexOf('Ready to make your next session count');
  const t035Idx = html.indexOf('No testimonials until the beta opens');
  expect(t034Idx).toBeGreaterThan(-1);
  expect(t035Idx).toBeGreaterThan(t034Idx);
});
