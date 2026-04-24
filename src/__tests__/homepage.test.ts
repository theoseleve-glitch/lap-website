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
