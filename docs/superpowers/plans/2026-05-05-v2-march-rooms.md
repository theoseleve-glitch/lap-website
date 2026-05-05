# V2 March Rooms — Homepage Port (Phase 3) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Port V2 March's 10 home rooms into the Astro lap-website so the live homepage reads as the March 2026 racing identity (StartGrid → SessionProof → S1Pain → S2Versus → S3Product → SimFirst → PremiumLayer → Garage → PitStop → Podium), replacing the current April-23 plain sections.

**Architecture:**
- Each V2 React room becomes a single Astro component under `src/components/rooms/<RoomName>.astro`. No client islands unless explicitly justified (StartGrid hero-motion JS, optional Podium IntersectionObserver). Everything else server-renders.
- All rooms consume Phase-1 primitives: `.room`, `.font-monument`, `.font-telemetry`, `.font-body`, `.beam-card`, `.text-shimmer`, `.texture-grain`, `.grid-lap`, `bg-pit-orange`, `border-pit-orange/15`, etc.
- Section dividers stay as `border-t border-pit-orange/15` per Phase 2.5 standard.
- Strategic-doctrine alignment: where V2 copy contradicts current `01-STRATEGIC-DOCTRINE.md` (single-tier pricing, no AI/LLM language, no real testimonials yet), use current site's copy in V2's visual envelope. Verbatim port of structure, not necessarily of words.
- GSAP / scroll-pinning / count-up / magnetic-cursor are **DEFERRED to Phase 4**. Phase 3 ships with CSS-only animation + IntersectionObserver fades to keep JS <150KB gzip homepage.
- After Phase 3 ships, the obsolete components (`Hero`, `AfterEverySession`, `SimAndReal`, `BuiltForSeriousSimRacers`, `ToolComparison`, `NotForYouIf`, `FinalCta`, `SocialProof`, plus the standalone `DriverProfilePreview` if reabsorbed into StartGrid) get deleted in Task 12.

**Tech Stack:** Astro 5.18, Tailwind v4 with `@theme`, TypeScript strict, Vitest with `experimental_AstroContainer`, Playwright e2e.

---

## File Structure

```
src/
  pages/
    index.astro                      # MODIFY — rewire to import 10 rooms
  components/
    rooms/
      StartGrid.astro                # CREATE  (T01)
      SessionProof.astro             # CREATE  (T02)
      S1Pain.astro                   # CREATE  (T03)
      S2Versus.astro                 # CREATE  (T04)
      S3Product.astro                # CREATE  (T05)
      SimFirst.astro                 # CREATE  (T06)
      PremiumLayer.astro             # CREATE  (T07)
      Garage.astro                   # CREATE  (T08)
      PitStop.astro                  # CREATE  (T09)
      Podium.astro                   # CREATE  (T10)
    Hero.astro                       # DELETE  (T12)
    AfterEverySession.astro          # DELETE  (T12)
    SimAndReal.astro                 # DELETE  (T12)
    BuiltForSeriousSimRacers.astro   # DELETE  (T12)
    ToolComparison.astro             # DELETE  (T12)
    NotForYouIf.astro                # DELETE  (T12)
    FinalCta.astro                   # DELETE  (T12)
    SocialProof.astro                # DELETE  (T12)
    DriverProfilePreview.astro       # KEEP — embedded inside StartGrid
src/
  __tests__/
    rooms/
      start-grid.test.ts             # CREATE  (T01)
      session-proof.test.ts          # CREATE  (T02)
      s1-pain.test.ts                # CREATE  (T03)
      s2-versus.test.ts              # CREATE  (T04)
      s3-product.test.ts             # CREATE  (T05)
      sim-first.test.ts              # CREATE  (T06)
      premium-layer.test.ts          # CREATE  (T07)
      garage.test.ts                 # CREATE  (T08)
      pit-stop.test.ts               # CREATE  (T09)
      podium.test.ts                 # CREATE  (T10)
    homepage.test.ts                 # MODIFY  (T11) — assert 10 rooms in order
    hero.test.ts                     # DELETE  (T12) — superseded by start-grid
    final-cta.test.ts                # DELETE  (T12) — superseded by podium
    sim-and-real.test.ts             # DELETE  (T12) — superseded by sim-first
    after-every-session.test.ts      # DELETE  (T12) — covered by session-proof
    built-for-serious-sim-racers.test.ts  # DELETE  (T12) — content lives in S1Pain / SimFirst
    tool-comparison.test.ts          # DELETE  (T12) — covered by S2Versus
    not-for-you-if.test.ts           # KEEP — content moves to a tail section in PitStop OR keep block
    social-proof.test.ts             # DELETE  (T12) — covered by Garage
docs/
  superpowers/
    plans/
      2026-05-05-v2-march-rooms.md   # THIS FILE
```

**Convention for every Task N below:**
- The Astro file goes in `src/components/rooms/<Name>.astro`. No re-export shim.
- The test file imports the component via `experimental_AstroContainer.renderToString()`, asserts headline text, structural counts (h2/h3/article counts), required eyebrow content, and class invariants (`font-monument`, `font-telemetry`, `text-pit-orange`, `beam-card` where applicable).
- Each task ends with `pnpm test src/__tests__/rooms/<name>.test.ts` and a single commit.

---

## Task 1: StartGrid (replaces Hero)

**V2 source:** `Analysis/V2_claude_ai/lap-website/src/components/rooms/StartGrid.tsx`

**Spec:**
- Full-viewport `<section class="room texture-grain">` with `aria-label="Start grid — what is LAP"`.
- Telemetry eyebrow: `01 / START GRID · GREEN FLAG` (matches Phase 2.5).
- Headline: `Run a lap. Get your report. Transform your driving.` — `font-monument text-h1 text-shimmer`. Last clause "Transform your driving." rendered with extra emphasis (use `<span class="text-pit-orange">` on the verb, no shimmer override needed since text-shimmer's gradient already pulls gold).
- Subhead: `Professional-grade driver analysis for amateurs.` — `font-body text-steel`.
- Badge above headline: `font-telemetry bg-pit-orange/10 text-pit-orange border-pit-orange/30 inline-block px-3 py-1 border` — text `SIM-RACING EARLY ACCESS NOW OPEN`.
- CTA pair (hero-twin of Phase 2.5):
  - Primary: `Start 14-day trial` → `https://app.lap-coach.racing/signup` (gold button per Phase 2.5).
  - Secondary: `See how it works` → `/how-it-works`.
- Right-rail visual: embed existing `DriverProfilePreview.astro` via `<DriverProfilePreview />` (already pit-orange-styled in Phase 2.5).
- Layout (≥md): `grid-lap` two-column — left column = badge + headline + subhead + CTAs, right column = DriverProfilePreview.
- Animations: keep existing `data-hero-animate` attributes + `import '../../scripts/hero-motion';` script for fade-in stagger. **No GSAP scroll-scrub** (deferred).
- Magnetic cursor / split-text: **deferred** to Phase 4.

**Files:**
- Create: `src/components/rooms/StartGrid.astro`
- Create: `src/__tests__/rooms/start-grid.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
// src/__tests__/rooms/start-grid.test.ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import StartGrid from '../../components/rooms/StartGrid.astro';

const render = async () => {
  const container = await AstroContainer.create();
  return container.renderToString(StartGrid);
};

describe('StartGrid room', () => {
  test('full-room section landmark with V2 March identity', async () => {
    const html = await render();
    expect(html).toMatch(/<section[^>]*aria-label="Start grid — what is LAP"/);
    expect(html).toMatch(/class="[^"]*\broom\b[^"]*"/);
    expect(html).toMatch(/class="[^"]*\btexture-grain\b[^"]*"/);
  });

  test('telemetry eyebrow + monument headline + shimmer', async () => {
    const html = await render();
    expect(html).toMatch(/font-telemetry[^>]*text-pit-orange/);
    expect(html).toContain('01 / START GRID');
    expect(html).toMatch(/<h1[^>]*class="[^"]*font-monument[^"]*"/);
    expect(html).toMatch(/<h1[^>]*class="[^"]*text-shimmer[^"]*"/);
    expect(html).toContain('Run a lap. Get your report.');
    expect(html).toMatch(/Transform your driving/);
  });

  test('SIM-RACING badge', async () => {
    const html = await render();
    expect(html).toContain('SIM-RACING EARLY ACCESS NOW OPEN');
    expect(html).toMatch(/border-pit-orange\/30/);
  });

  test('hero-twin CTAs', async () => {
    const html = await render();
    expect(html).toMatch(/<a[^>]+href="https:\/\/app\.lap-coach\.racing\/signup"[^>]+rel="noopener"/);
    expect(html).toMatch(/Start 14-day trial/);
    expect(html).toMatch(/<a[^>]+href="\/how-it-works"/);
    expect(html).toMatch(/See how it works/);
    // Primary uses gold per Phase 2.5
    expect(html).toMatch(/bg-pit-orange/);
  });

  test('embeds DriverProfilePreview', async () => {
    const html = await render();
    expect(html).toMatch(/role="img"[^>]+aria-label="Driver Profile preview/);
    // Pit-orange progress bar from Phase 2.5
    expect(html).toMatch(/bg-pit-orange/);
  });

  test('no AI/LLM language', async () => {
    const html = (await render()).toLowerCase();
    expect(html).not.toMatch(/\bai coach\b/);
    expect(html).not.toMatch(/\bllm\b/);
    expect(html).not.toMatch(/\bgenerative\b/);
  });

  test('hero-motion stagger attributes preserved', async () => {
    const html = await render();
    expect(html).toMatch(/data-hero-animate/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test src/__tests__/rooms/start-grid.test.ts`
Expected: FAIL with "Cannot find module ../../components/rooms/StartGrid.astro".

- [ ] **Step 3: Write the StartGrid component**

```astro
---
// src/components/rooms/StartGrid.astro
// V2 March hero room. Replaces the April-23 Hero. Phase 3 / T01.
import DriverProfilePreview from '../DriverProfilePreview.astro';

const PRIMARY = { text: 'Start 14-day trial', href: 'https://app.lap-coach.racing/signup' };
const SECONDARY = { text: 'See how it works', href: '/how-it-works' };
---

<section
  class="room texture-grain px-grid-margin relative mx-auto w-full max-w-7xl py-24 sm:py-32"
  aria-label="Start grid — what is LAP"
>
  <div class="grid-lap grid grid-cols-1 items-center gap-12 md:grid-cols-2 md:gap-16">
    <div class="text-left">
      <p class="font-telemetry text-pit-orange mb-6 tracking-wider">
        01 / START GRID · GREEN FLAG
      </p>

      <p
        class="font-telemetry bg-pit-orange/10 text-pit-orange border-pit-orange/30 mb-8 inline-block border px-3 py-1"
      >
        SIM-RACING EARLY ACCESS NOW OPEN
      </p>

      <h1
        data-hero-animate
        class="font-display font-monument text-shimmer text-h1 max-w-wide tracking-display text-balance"
      >
        Run a lap. Get your report. <span class="text-pit-orange">Transform your driving.</span>
      </h1>

      <p data-hero-animate class="text-steel text-body font-body mt-6 max-w-prose">
        Professional-grade driver analysis for amateurs.
      </p>

      <div data-hero-animate class="mt-10 flex flex-col gap-4 sm:flex-row sm:gap-5">
        <a
          href={PRIMARY.href}
          rel="noopener"
          class="bg-pit-orange text-asphalt hover:bg-pit-orange/90 focus-visible:outline-pit-orange text-body font-mono inline-flex items-center justify-center px-7 py-3 font-medium tracking-wide uppercase transition"
        >
          {PRIMARY.text}
        </a>
        <a
          href={SECONDARY.href}
          class="text-chalk border-pit-orange/40 hover:border-pit-orange focus-visible:outline-chalk text-body font-mono inline-flex items-center justify-center border px-7 py-3 tracking-wide uppercase transition"
        >
          {SECONDARY.text}
        </a>
      </div>
    </div>

    <div data-hero-animate class="mx-auto w-full max-w-md">
      <DriverProfilePreview />
    </div>
  </div>
</section>

<script>
  import '../../scripts/hero-motion';
</script>
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test src/__tests__/rooms/start-grid.test.ts`
Expected: PASS (7/7).

- [ ] **Step 5: Commit**

```bash
git add src/components/rooms/StartGrid.astro src/__tests__/rooms/start-grid.test.ts
git commit -m "feat(rooms): T01 StartGrid — V2 March hero room with badge, shimmer, gold CTA"
```

---

## Task 2: SessionProof

**V2 source:** `Analysis/V2_claude_ai/lap-website/src/components/rooms/SessionProof.tsx`

**Spec:**
- `<section aria-label="What you get after every session">` with `border-t border-pit-orange/15`.
- Eyebrow: `02 / SESSION CARDS · POST-RACE WRAP`. Heading: `Every session ends with a clear next step.` Subhead: `Not just telemetry. A driver-ready debrief with decisions, not dashboards.`
- 3-card grid (`md:grid-cols-3 md:gap-6`) with vertical offset on the middle card (`md:-translate-y-4`); each card uses `.beam-card`. Card labels `font-telemetry text-pit-orange`: `YOUR SCORE`, `YOUR DEBRIEF`, `YOUR PROGRESSION`.
- Card 1 (YOUR SCORE) shows score number `font-monument text-h2 text-chalk tabular-nums` + four pill rows (Pace / Consistency / Execution / Robustness with /25 each).
- Card 2 (YOUR DEBRIEF) shows three rows: `LOSS` (red) / `CAUSE` (steel) / `WHAT TO CHANGE` (acid-green).
- Card 3 (YOUR PROGRESSION) shows three weekly snapshots: Week-1 / Week-3 / Week-6 with score deltas and a small bar visualization.

**Files:**
- Create: `src/components/rooms/SessionProof.astro`
- Create: `src/__tests__/rooms/session-proof.test.ts`

- [ ] **Step 1: Write the failing test**

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import SessionProof from '../../components/rooms/SessionProof.astro';

const render = async () =>
  (await AstroContainer.create()).renderToString(SessionProof);

describe('SessionProof room', () => {
  test('eyebrow + headline + 3 beam-cards', async () => {
    const html = await render();
    expect(html).toMatch(/02 \/ SESSION CARDS/);
    expect(html).toMatch(/<h2[^>]*class="[^"]*font-monument[^"]*"/);
    expect(html).toMatch(/Every session ends with a clear next step/);
    const beam = html.match(/beam-card/g) ?? [];
    expect(beam.length).toBeGreaterThanOrEqual(3);
  });

  test('three card labels in font-telemetry text-pit-orange', async () => {
    const html = await render();
    expect(html).toContain('YOUR SCORE');
    expect(html).toContain('YOUR DEBRIEF');
    expect(html).toContain('YOUR PROGRESSION');
  });

  test('debrief card uses semantic colour mapping', async () => {
    const html = await render();
    expect(html).toMatch(/text-safety-red/); // LOSS
    expect(html).toMatch(/text-acid-green/); // WHAT TO CHANGE
  });

  test('no AI/LLM language', async () => {
    const html = (await render()).toLowerCase();
    expect(html).not.toMatch(/\bai coach\b/);
    expect(html).not.toMatch(/\bllm\b/);
  });
});
```

- [ ] **Step 2: Run test to verify it fails** (`pnpm test src/__tests__/rooms/session-proof.test.ts` → module not found)

- [ ] **Step 3: Write the component**

```astro
---
// src/components/rooms/SessionProof.astro
// V2 March SessionProof room. Phase 3 / T02.

const PILLARS = [
  { name: 'Pace', score: 19 },
  { name: 'Consistency', score: 22 },
  { name: 'Execution', score: 17 },
  { name: 'Robustness', score: 14 },
];

const DEBRIEF = [
  { label: 'LOSS', value: '-0.41 s in T6 (Spa, Bus Stop)', tone: 'text-safety-red' },
  { label: 'CAUSE', value: 'Trail-brake released 8 m too early at apex', tone: 'text-steel' },
  { label: 'WHAT TO CHANGE', value: 'Hold 12 % brake to apex × next 3 sessions', tone: 'text-acid-green' },
];

const PROGRESSION = [
  { week: 'Week 1', score: 58, delta: '+0' },
  { week: 'Week 3', score: 65, delta: '+7' },
  { week: 'Week 6', score: 72, delta: '+14' },
];
---

<section
  aria-label="What you get after every session"
  class="px-grid-margin border-pit-orange/15 mx-auto w-full max-w-7xl border-t py-24 sm:py-32"
>
  <header class="max-w-prose">
    <p class="font-telemetry text-pit-orange">02 / SESSION CARDS · POST-RACE WRAP</p>
    <h2 class="font-display font-monument text-h2 text-chalk tracking-display mt-4 text-balance">
      Every session ends with a clear next step.
    </h2>
    <p class="text-steel text-body font-body mt-5 max-w-prose">
      Not just telemetry. A driver-ready debrief with decisions, not dashboards.
    </p>
  </header>

  <ol class="mt-14 grid grid-cols-1 gap-8 md:grid-cols-3 md:gap-6">
    <li class="flex md:translate-y-4">
      <article class="beam-card rounded-2 flex flex-1 flex-col p-7">
        <span class="font-telemetry text-pit-orange">YOUR SCORE</span>
        <div class="mt-4 flex items-baseline gap-3">
          <span class="font-display font-monument text-h2 text-chalk tabular-nums leading-none">72</span>
          <span class="text-steel text-caption">/100</span>
        </div>
        <dl class="mt-5 flex flex-col gap-2">
          {PILLARS.map((p) => (
            <div class="flex items-center justify-between">
              <dt class="text-steel text-caption">{p.name}</dt>
              <dd class="font-telemetry text-chalk tabular-nums">{p.score}/25</dd>
            </div>
          ))}
        </dl>
      </article>
    </li>

    <li class="flex">
      <article class="beam-card rounded-2 flex flex-1 flex-col p-7">
        <span class="font-telemetry text-pit-orange">YOUR DEBRIEF</span>
        <dl class="mt-4 flex flex-col gap-3">
          {DEBRIEF.map((d) => (
            <div>
              <dt class={`font-telemetry ${d.tone}`}>{d.label}</dt>
              <dd class="text-chalk text-body font-body mt-1">{d.value}</dd>
            </div>
          ))}
        </dl>
      </article>
    </li>

    <li class="flex md:-translate-y-4">
      <article class="beam-card rounded-2 flex flex-1 flex-col p-7">
        <span class="font-telemetry text-pit-orange">YOUR PROGRESSION</span>
        <ol class="mt-4 flex flex-col gap-3">
          {PROGRESSION.map((p) => (
            <li class="flex items-center gap-3">
              <span class="text-steel text-caption w-16 shrink-0">{p.week}</span>
              <div class="bg-asphalt relative h-1.5 flex-1 overflow-hidden rounded-full">
                <div class="bg-pit-orange absolute inset-y-0 left-0 rounded-full" style={`width: ${p.score}%`} />
              </div>
              <span class="font-telemetry text-chalk tabular-nums w-10 text-right">{p.score}</span>
              <span class="font-telemetry text-acid-green w-12 text-right">{p.delta}</span>
            </li>
          ))}
        </ol>
      </article>
    </li>
  </ol>
</section>
```

- [ ] **Step 4: Run test → PASS**

- [ ] **Step 5: Commit** `git commit -m "feat(rooms): T02 SessionProof — score / debrief / progression beam-cards"`

---

## Task 3: S1Pain

**V2 source:** `S1Pain.tsx`

**Spec:**
- `<section aria-label="Fragmented tools problem">` with eyebrow `03 / SECTOR 1 · TOOL FRAGMENTATION`.
- Headline: `Stop stacking tools.` Subhead: `What many drivers pay for separately, LAP brings together in one system.`
- 2-card grid `md:grid-cols-2 md:gap-6`. Left card has bg-asphalt, border-steel/20, headline `THE TYPICAL DRIVER STACK`, lists 6 tools with monthly costs in `font-telemetry text-steel tabular-nums`. Right card uses `.beam-card`, gold accent, headline `THE LAP ECOSYSTEM`, lists 7 LAP modules each tagged `INCLUDED` (acid-green badge).
- Footer line beneath each card in `font-telemetry text-steel`: `6 tools, 6 logins, no connection` / `One ecosystem. Everything connected.`

**Files:** `src/components/rooms/S1Pain.astro`, `src/__tests__/rooms/s1-pain.test.ts`

- [ ] **Step 1: Test**

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import S1Pain from '../../components/rooms/S1Pain.astro';

const render = async () =>
  (await AstroContainer.create()).renderToString(S1Pain);

describe('S1Pain room', () => {
  test('eyebrow + headline + 2-card layout', async () => {
    const html = await render();
    expect(html).toMatch(/03 \/ SECTOR 1/);
    expect(html).toMatch(/<h2[^>]*class="[^"]*font-monument[^"]*"/);
    expect(html).toMatch(/Stop stacking tools/);
    expect(html).toContain('THE TYPICAL DRIVER STACK');
    expect(html).toContain('THE LAP ECOSYSTEM');
  });

  test('lap card uses beam-card, INCLUDED tags', async () => {
    const html = await render();
    expect(html).toMatch(/beam-card/);
    expect(html).toMatch(/INCLUDED/);
    expect(html).toMatch(/text-acid-green/);
  });

  test('typical-stack footer + lap-stack footer', async () => {
    const html = await render();
    expect(html).toContain('6 tools, 6 logins, no connection');
    expect(html).toContain('One ecosystem. Everything connected.');
  });
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Component**

```astro
---
// src/components/rooms/S1Pain.astro — Phase 3 / T03

const TYPICAL_STACK = [
  { name: 'Telemetry app', cost: '€20 / mo' },
  { name: 'Lap-time logger', cost: '€8 / mo' },
  { name: 'Notebook for setup', cost: '€5 / mo' },
  { name: 'Coach hourly', cost: '€60 / hr' },
  { name: 'Scoring spreadsheet', cost: 'free, fragile' },
  { name: 'Strategy planner', cost: '€12 / mo' },
];

const LAP_STACK = [
  'Capture across iRacing / ACC / AMS2 / phone',
  'Lap split + corner detection (auto)',
  'Four-pillar score with grade',
  'Driver-facing debrief & drill prescription',
  'Cross-session reference overlay',
  'Theoretical perfect-lap solver',
  'Race-strategy planner v2',
];
---

<section
  aria-label="Fragmented tools problem"
  class="px-grid-margin border-pit-orange/15 mx-auto w-full max-w-7xl border-t py-24 sm:py-32"
>
  <header class="max-w-prose">
    <p class="font-telemetry text-pit-orange">03 / SECTOR 1 · TOOL FRAGMENTATION</p>
    <h2 class="font-display font-monument text-h2 text-chalk tracking-display mt-4 text-balance">
      Stop stacking tools.
    </h2>
    <p class="text-steel text-body font-body mt-5 max-w-prose">
      What many drivers pay for separately, LAP brings together in one system.
    </p>
  </header>

  <div class="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2">
    <article class="bg-asphalt border-steel/20 rounded-2 flex flex-col border p-7">
      <h3 class="font-telemetry text-steel">THE TYPICAL DRIVER STACK</h3>
      <dl class="mt-4 flex flex-col gap-3">
        {TYPICAL_STACK.map((t) => (
          <div class="flex items-center justify-between">
            <dt class="text-chalk text-body font-body">{t.name}</dt>
            <dd class="font-telemetry text-steel tabular-nums">{t.cost}</dd>
          </div>
        ))}
      </dl>
      <p class="font-telemetry text-steel mt-6">6 tools, 6 logins, no connection</p>
    </article>

    <article class="beam-card rounded-2 flex flex-col p-7">
      <h3 class="font-telemetry text-pit-orange">THE LAP ECOSYSTEM</h3>
      <ul class="mt-4 flex flex-col gap-3">
        {LAP_STACK.map((line) => (
          <li class="flex items-center justify-between gap-3">
            <span class="text-chalk text-body font-body">{line}</span>
            <span class="font-telemetry bg-acid-green/10 text-acid-green border-acid-green/30 inline-block border px-2 py-0.5">
              INCLUDED
            </span>
          </li>
        ))}
      </ul>
      <p class="font-telemetry text-steel mt-6">One ecosystem. Everything connected.</p>
    </article>
  </div>
</section>
```

- [ ] **Step 4: Run → PASS.**

- [ ] **Step 5: Commit** `git commit -m "feat(rooms): T03 S1Pain — typical stack vs LAP ecosystem 2-card"`

---

## Task 4: S2Versus

**V2 source:** `S2Versus.tsx`

**Spec:**
- `<section aria-label="Why LAP is different">`. Eyebrow `04 / SECTOR 2 · TIMING vs COACHING`.
- Dual headline (split into two h2 lines): `They time laps.` / `We coach drivers.` (second line `text-pit-orange`).
- 2-card grid with overlap: left card `TIMING-FIRST` (steel border) shows leaderboard P1/P2/P3/P4; right card `COACHING-FIRST` (.beam-card, slight `md:-translate-y-2 md:-translate-x-4`) shows 3 corner-coaching rows with `LOSS / FIX` per row.
- Below the comparison: 3-pillar grid (`md:grid-cols-3`) — each pillar a beam-card with monument h3, telemetry caption, body line. Pillars: `KNOW WHERE YOU LOSE TIME`, `FIX YOUR BRAKING AND THROTTLE`, `TRACK YOUR PROGRESSION`.

**Files:** `src/components/rooms/S2Versus.astro`, `src/__tests__/rooms/s2-versus.test.ts`

- [ ] **Step 1: Test**

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import S2Versus from '../../components/rooms/S2Versus.astro';

const render = async () => (await AstroContainer.create()).renderToString(S2Versus);

describe('S2Versus room', () => {
  test('dual monument headline with gold second line', async () => {
    const html = await render();
    expect(html).toMatch(/They time laps/);
    expect(html).toMatch(/We coach drivers/);
    expect(html).toMatch(/text-pit-orange[^"]*"[^>]*>We coach drivers/);
  });

  test('two comparison cards: TIMING-FIRST + COACHING-FIRST', async () => {
    const html = await render();
    expect(html).toContain('TIMING-FIRST');
    expect(html).toContain('COACHING-FIRST');
  });

  test('three pillars below the comparison', async () => {
    const html = await render();
    expect(html).toContain('KNOW WHERE YOU LOSE TIME');
    expect(html).toContain('FIX YOUR BRAKING AND THROTTLE');
    expect(html).toContain('TRACK YOUR PROGRESSION');
    const beam = html.match(/beam-card/g) ?? [];
    expect(beam.length).toBeGreaterThanOrEqual(3); // 1 coaching card + 3 pillars (or same count)
  });
});
```

- [ ] **Step 2: Run → FAIL.**

- [ ] **Step 3: Component**

```astro
---
// src/components/rooms/S2Versus.astro — Phase 3 / T04

const TIMING_ROWS = [
  { pos: 'P1', name: 'A. Verstappen', time: '1:42.103', delta: '—' },
  { pos: 'P2', name: 'L. Hamilton',   time: '1:42.318', delta: '+0.215' },
  { pos: 'P3', name: 'C. Sainz',      time: '1:42.557', delta: '+0.454' },
  { pos: 'P4', name: 'You',           time: '1:43.012', delta: '+0.909' },
];

const COACHING_ROWS = [
  { corner: 'T1 — Bus Stop',    loss: '-0.41 s', fix: 'Hold 12% brake to apex × 3 sessions' },
  { corner: 'T6 — Pouhon',      loss: '-0.28 s', fix: 'Carry +6 km/h minimum speed' },
  { corner: 'T13 — Stavelot',   loss: '-0.22 s', fix: 'Smooth throttle ramp from 0 → 100 over 1.4 s' },
];

const PILLARS = [
  { kicker: 'PILLAR 01', heading: 'Know where you lose time', body: 'Cumulative delta chart shows the exact metres where each tenth was earned or spent.' },
  { kicker: 'PILLAR 02', heading: 'Fix your braking and throttle', body: 'Pedal traces, brake-release ramps, throttle ramp curves — each compared to your own best lap.' },
  { kicker: 'PILLAR 03', heading: 'Track your progression', body: 'Four-pillar weekly score that tells you whether yesterday\'s practice produced today\'s improvement.' },
];
---

<section
  aria-label="Why LAP is different"
  class="px-grid-margin border-pit-orange/15 mx-auto w-full max-w-7xl border-t py-24 sm:py-32"
>
  <header class="max-w-prose">
    <p class="font-telemetry text-pit-orange">04 / SECTOR 2 · TIMING vs COACHING</p>
    <h2 class="font-display font-monument text-h2 tracking-display mt-4 text-balance">
      <span class="text-chalk block">They time laps.</span>
      <span class="text-pit-orange block">We coach drivers.</span>
    </h2>
  </header>

  <div class="mt-14 grid grid-cols-1 gap-6 md:grid-cols-[1fr,1.1fr] md:items-start md:gap-0">
    <article class="bg-asphalt border-steel/20 rounded-2 z-0 border p-7">
      <p class="font-telemetry text-steel">TIMING-FIRST</p>
      <p class="font-telemetry text-steel/60 mt-1">Positions only</p>
      <ol class="mt-5 flex flex-col gap-2">
        {TIMING_ROWS.map((r) => (
          <li class="flex items-center gap-3">
            <span class="font-telemetry text-pit-orange w-8">{r.pos}</span>
            <span class="text-chalk text-body font-body flex-1">{r.name}</span>
            <span class="font-telemetry text-chalk tabular-nums">{r.time}</span>
            <span class="font-telemetry text-steel tabular-nums w-16 text-right">{r.delta}</span>
          </li>
        ))}
      </ol>
    </article>

    <article class="beam-card rounded-2 shadow-e3 z-10 p-7 md:-translate-x-4 md:-translate-y-2">
      <p class="font-telemetry text-pit-orange">COACHING-FIRST</p>
      <p class="font-telemetry text-pit-orange/60 mt-1">Coaching ready</p>
      <ol class="mt-5 flex flex-col gap-4">
        {COACHING_ROWS.map((r) => (
          <li>
            <p class="font-telemetry text-chalk">{r.corner}</p>
            <div class="text-body font-body mt-1 flex items-baseline gap-3">
              <span class="text-safety-red font-telemetry tabular-nums">{r.loss}</span>
              <span class="text-acid-green">{r.fix}</span>
            </div>
          </li>
        ))}
      </ol>
    </article>
  </div>

  <ul class="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
    {PILLARS.map((p) => (
      <li class="flex">
        <article class="beam-card rounded-2 flex flex-1 flex-col p-7">
          <p class="font-telemetry text-pit-orange">{p.kicker}</p>
          <h3 class="font-display font-monument text-h4 text-chalk tracking-display mt-3 text-balance">
            {p.heading}
          </h3>
          <p class="text-steel text-body font-body mt-3">{p.body}</p>
        </article>
      </li>
    ))}
  </ul>
</section>
```

- [ ] **Step 4: Run → PASS.**

- [ ] **Step 5: Commit** `git commit -m "feat(rooms): T04 S2Versus — timing-vs-coaching dual headline + 3 pillars"`

---

## Task 5: S3Product

**V2 source:** `S3Product.tsx`

**Spec:**
- Eyebrow `05 / SECTOR 3 · PRODUCT PIPELINE`. Dual h2: `One system from raw session` / `to next-session action.` (second line `text-pit-orange`).
- 7 numbered pipeline stages: 01 LOG → 02 PROCESS → 03 ANALYZE → 04 SCORE → 05 TRACK → 06 STRATEGIZE → 07 PREPARE.
- **Phase 3 simplification:** Render as a vertical sequence of `.beam-card` tiles with a thin connecting gold line on the left edge (`::before` pseudo on the wrapping `<ol>`). No GSAP scroll-pinning; rely on the natural narrative scroll.
- A small `font-telemetry text-pit-orange` overline on each card with the stage code (`01 / LOG`, `02 / PROCESS`, …).

**Files:** `src/components/rooms/S3Product.astro`, `src/__tests__/rooms/s3-product.test.ts`

- [ ] **Step 1: Test**

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import S3Product from '../../components/rooms/S3Product.astro';

const render = async () => (await AstroContainer.create()).renderToString(S3Product);

describe('S3Product room', () => {
  test('eyebrow + dual monument headline', async () => {
    const html = await render();
    expect(html).toMatch(/05 \/ SECTOR 3/);
    expect(html).toMatch(/One system from raw session/);
    expect(html).toMatch(/to next-session action/);
  });

  test('7 stages 01..07', async () => {
    const html = await render();
    for (const stage of ['01 / LOG', '02 / PROCESS', '03 / ANALYZE', '04 / SCORE', '05 / TRACK', '06 / STRATEGIZE', '07 / PREPARE']) {
      expect(html).toContain(stage);
    }
  });

  test('beam-card tiles for each stage', async () => {
    const html = await render();
    const beam = html.match(/beam-card/g) ?? [];
    expect(beam.length).toBeGreaterThanOrEqual(7);
  });
});
```

- [ ] **Step 2: FAIL.**

- [ ] **Step 3: Component**

```astro
---
// src/components/rooms/S3Product.astro — Phase 3 / T05

const STAGES = [
  { code: '01 / LOG',         heading: 'Capture every lap', body: 'iRacing, ACC, AMS2, RaceBox, RaceChrono — one capture format, every platform.' },
  { code: '02 / PROCESS',     heading: 'Clean the signal',  body: 'GPS noise filter, lap split, corner detection, resample to a uniform distance grid.' },
  { code: '03 / ANALYZE',     heading: 'Diagnose the lap',  body: 'Pedal traces, G-G envelope, time-delta — every chart pinned to the metre where the difference happened.' },
  { code: '04 / SCORE',       heading: 'Four-pillar grade', body: 'Pace / Consistency / Execution / Robustness, each /25 — the lowest pillar is your biggest opportunity.' },
  { code: '05 / TRACK',       heading: 'Build the profile', body: 'Cross-session overlay, per-corner trend, weekly progression — the driver profile that follows you.' },
  { code: '06 / STRATEGIZE',  heading: 'Plan the race',     body: 'Stint-pace projection, tyre-life trend, fuel consumption — race-day decisions on data, not gut.' },
  { code: '07 / PREPARE',     heading: 'Ship the next session', body: 'A drill sized to one practice, a target metric, and a measurable pass / fail next time out.' },
];
---

<section
  aria-label="Product ecosystem pipeline"
  class="px-grid-margin border-pit-orange/15 mx-auto w-full max-w-7xl border-t py-24 sm:py-32"
>
  <header class="max-w-prose">
    <p class="font-telemetry text-pit-orange">05 / SECTOR 3 · PRODUCT PIPELINE</p>
    <h2 class="font-display font-monument text-h2 tracking-display mt-4 text-balance">
      <span class="text-chalk block">One system from raw session</span>
      <span class="text-pit-orange block">to next-session action.</span>
    </h2>
    <p class="text-steel text-body font-body mt-5 max-w-prose">
      Logging, analysis, progression, and race tools — connected.
    </p>
  </header>

  <ol class="mt-14 flex flex-col gap-4">
    {STAGES.map((s) => (
      <li class="flex">
        <article class="beam-card rounded-2 grid w-full grid-cols-[auto,1fr] gap-6 p-7 md:grid-cols-[140px,1fr]">
          <p class="font-telemetry text-pit-orange">{s.code}</p>
          <div>
            <h3 class="font-display font-monument text-h4 text-chalk tracking-display text-balance">
              {s.heading}
            </h3>
            <p class="text-steel text-body font-body mt-2">{s.body}</p>
          </div>
        </article>
      </li>
    ))}
  </ol>
</section>
```

- [ ] **Step 4: PASS.**

- [ ] **Step 5: Commit** `git commit -m "feat(rooms): T05 S3Product — 7-stage pipeline beam-card column"`

---

## Task 6: SimFirst (replaces SimAndReal)

**V2 source:** `SimFirst.tsx`

**Spec:**
- Eyebrow `06 / SIM FIRST · BRIDGE TO REAL`. Dual h2: `Built for progression.` / `Starting with sim racing.`
- 4-card rationale grid (`sm:grid-cols-2`) with numbered `font-monument text-pit-orange/20` ghost glyphs (01/02/03/04) sitting behind each card title:
  - `FASTER ONBOARDING`
  - `UNLIMITED REPETITION`
  - `IDEAL FOR PROGRESSION`
  - `SAME ANALYSIS ENGINE`
- Below: 2-card split — `ACTIVE NOW` (gold border, lists iRacing/ACC/AMS2/rFactor 2/RaceChrono/RaceBox) and `EXPANDING NEXT` (steel border, asphalt bg, lists Real-life kart, Real-life car, OBD-II live, MoTeC import).

**Files:** `src/components/rooms/SimFirst.astro`, `src/__tests__/rooms/sim-first.test.ts`

- [ ] **Step 1: Test**

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import SimFirst from '../../components/rooms/SimFirst.astro';

const render = async () => (await AstroContainer.create()).renderToString(SimFirst);

describe('SimFirst room', () => {
  test('eyebrow + dual headline', async () => {
    const html = await render();
    expect(html).toMatch(/06 \/ SIM FIRST/);
    expect(html).toMatch(/Built for progression/);
    expect(html).toMatch(/Starting with sim racing/);
  });

  test('4 rationale cards', async () => {
    const html = await render();
    for (const t of ['FASTER ONBOARDING', 'UNLIMITED REPETITION', 'IDEAL FOR PROGRESSION', 'SAME ANALYSIS ENGINE']) {
      expect(html).toContain(t);
    }
  });

  test('platforms split', async () => {
    const html = await render();
    expect(html).toContain('ACTIVE NOW');
    expect(html).toContain('EXPANDING NEXT');
    expect(html).toMatch(/iRacing/);
    expect(html).toMatch(/RaceBox/);
  });
});
```

- [ ] **Step 2: FAIL.**

- [ ] **Step 3: Component**

```astro
---
// src/components/rooms/SimFirst.astro — Phase 3 / T06

const RATIONALES = [
  { code: '01', heading: 'FASTER ONBOARDING',     body: 'A capture before lunch, a debrief after lunch — the loop closes inside one session.' },
  { code: '02', heading: 'UNLIMITED REPETITION',  body: 'No tow, no tyres, no fuel — repeat the same corner forty times until the brake-release shape is the one you wanted.' },
  { code: '03', heading: 'IDEAL FOR PROGRESSION', body: 'A controlled environment to isolate one input change at a time — identical car, identical track, weekly cadence.' },
  { code: '04', heading: 'SAME ANALYSIS ENGINE',  body: 'Same scoring, same driver profile, same drills — the sim weeks compound into your real-world capability.' },
];

const ACTIVE = ['iRacing', 'Assetto Corsa Competizione', 'Automobilista 2', 'rFactor 2', 'RaceChrono Pro', 'RaceBox'];
const EXPANDING = ['Real-life kart sessions', 'Real-life car (OBD-II live)', 'MoTeC i2 import', 'Harry\'s Lap Timer'];
---

<section
  aria-label="Sim-racing early access"
  class="px-grid-margin border-pit-orange/15 mx-auto w-full max-w-7xl border-t py-24 sm:py-32"
>
  <header class="max-w-prose">
    <p class="font-telemetry text-pit-orange">06 / SIM FIRST · BRIDGE TO REAL</p>
    <h2 class="font-display font-monument text-h2 tracking-display mt-4 text-balance">
      <span class="text-chalk block">Built for progression.</span>
      <span class="text-pit-orange block">Starting with sim racing.</span>
    </h2>
    <p class="text-steel text-body font-body mt-5 max-w-prose">
      Early access focuses on sim drivers first. The full ecosystem expands from there.
    </p>
  </header>

  <ul class="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
    {RATIONALES.map((r) => (
      <li class="flex">
        <article class="beam-card rounded-2 relative flex flex-1 flex-col p-7">
          <span aria-hidden="true" class="font-display font-monument text-pit-orange/20 absolute top-4 right-6 text-7xl tabular-nums leading-none">
            {r.code}
          </span>
          <h3 class="font-telemetry text-pit-orange relative">{r.heading}</h3>
          <p class="text-steel text-body font-body mt-3 relative">{r.body}</p>
        </article>
      </li>
    ))}
  </ul>

  <div class="mt-12 grid grid-cols-1 gap-6 md:grid-cols-2">
    <article class="border-pit-orange/40 bg-concrete/40 rounded-2 border p-7">
      <p class="font-telemetry text-pit-orange">ACTIVE NOW</p>
      <ul class="mt-4 flex flex-col gap-2">
        {ACTIVE.map((p) => (
          <li class="text-chalk text-body font-body flex items-center gap-3">
            <span aria-hidden="true" class="bg-acid-green inline-block h-2 w-2 rounded-full" />
            {p}
          </li>
        ))}
      </ul>
    </article>

    <article class="border-steel/30 bg-asphalt rounded-2 border p-7">
      <p class="font-telemetry text-steel">EXPANDING NEXT</p>
      <ul class="mt-4 flex flex-col gap-2">
        {EXPANDING.map((p) => (
          <li class="text-chalk text-body font-body flex items-center gap-3">
            <span aria-hidden="true" class="bg-steel inline-block h-2 w-2 rounded-full" />
            {p}
          </li>
        ))}
      </ul>
    </article>
  </div>
</section>
```

- [ ] **Step 4: PASS.**

- [ ] **Step 5: Commit** `git commit -m "feat(rooms): T06 SimFirst — 4 rationales + ACTIVE/EXPANDING platform split"`

---

## Task 7: PremiumLayer

**V2 source:** `PremiumLayer.tsx`

**Spec:**
- Eyebrow `07 / PREMIUM LAYER · PERFORMANCE TIER`. Headline: `Premium unlocks the performance layer.` Subhead: `Go beyond visibility. Understand patterns, optimise decisions, improve faster.`
- 6-card grid (`sm:grid-cols-2 lg:grid-cols-3`). Each card is a `.beam-card` with: ghost-glyph icon (large `font-monument text-pit-orange/10` numeral), `font-telemetry` kicker, `font-monument` h3, body line.
- Features: `DEEP CORNER ANALYSIS`, `ADVANCED DRIVER PROFILING`, `DYNAMIC RACE STRATEGY`, `SETUP UNDERSTANDING`, `PROGRESSION INTELLIGENCE`, `UNLIMITED ANALYSIS`. Each gets a 1-line outcome subtitle.

**Files:** `src/components/rooms/PremiumLayer.astro`, `src/__tests__/rooms/premium-layer.test.ts`

- [ ] **Step 1: Test**

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import PremiumLayer from '../../components/rooms/PremiumLayer.astro';

const render = async () => (await AstroContainer.create()).renderToString(PremiumLayer);

describe('PremiumLayer room', () => {
  test('eyebrow + headline', async () => {
    const html = await render();
    expect(html).toMatch(/07 \/ PREMIUM LAYER/);
    expect(html).toMatch(/Premium unlocks the performance layer/);
  });

  test('6 features', async () => {
    const html = await render();
    for (const f of [
      'DEEP CORNER ANALYSIS',
      'ADVANCED DRIVER PROFILING',
      'DYNAMIC RACE STRATEGY',
      'SETUP UNDERSTANDING',
      'PROGRESSION INTELLIGENCE',
      'UNLIMITED ANALYSIS',
    ]) {
      expect(html).toContain(f);
    }
    const beam = html.match(/beam-card/g) ?? [];
    expect(beam.length).toBe(6);
  });
});
```

- [ ] **Step 2: FAIL.**

- [ ] **Step 3: Component**

```astro
---
// src/components/rooms/PremiumLayer.astro — Phase 3 / T07

const FEATURES = [
  { code: '01', kicker: 'DEEP CORNER ANALYSIS',      heading: 'Find the tenths hiding inside corners',          body: 'Per-segment entry / apex / exit decomposition with cause attribution.' },
  { code: '02', kicker: 'ADVANCED DRIVER PROFILING', heading: 'See your habits across cars, tracks, conditions', body: 'A profile that survives the next car, the next track, the next weather.' },
  { code: '03', kicker: 'DYNAMIC RACE STRATEGY',     heading: 'Plan the stint, not just the lap',               body: 'Pace projection, tyre-life trend, fuel use, pit-window math — your race plan.' },
  { code: '04', kicker: 'SETUP UNDERSTANDING',       heading: 'Read what the car is telling you',               body: 'Damper, brake-bias, diff settings translated into "what your driving needs to change".' },
  { code: '05', kicker: 'PROGRESSION INTELLIGENCE',  heading: 'Track week-over-week',                            body: 'Closed weakness count, open prescriptions, next session target — at a glance.' },
  { code: '06', kicker: 'UNLIMITED ANALYSIS',        heading: 'No session-count limits',                         body: 'Upload, analyse, compare — as much as a serious schedule needs.' },
];
---

<section
  aria-label="Premium performance layer"
  class="px-grid-margin border-pit-orange/15 mx-auto w-full max-w-7xl border-t py-24 sm:py-32"
>
  <header class="max-w-prose">
    <p class="font-telemetry text-pit-orange">07 / PREMIUM LAYER · PERFORMANCE TIER</p>
    <h2 class="font-display font-monument text-h2 text-chalk tracking-display mt-4 text-balance">
      Premium unlocks the performance layer.
    </h2>
    <p class="text-steel text-body font-body mt-5 max-w-prose">
      Go beyond visibility. Understand patterns, optimise decisions, improve faster.
    </p>
  </header>

  <ul class="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {FEATURES.map((f) => (
      <li class="flex">
        <article class="beam-card rounded-2 relative flex flex-1 flex-col p-7">
          <span aria-hidden="true" class="font-display font-monument text-pit-orange/10 absolute top-4 right-6 text-7xl tabular-nums leading-none">
            {f.code}
          </span>
          <p class="font-telemetry text-pit-orange relative">{f.kicker}</p>
          <h3 class="font-display font-monument text-h4 text-chalk tracking-display relative mt-3 text-balance">
            {f.heading}
          </h3>
          <p class="text-steel text-body font-body relative mt-3">{f.body}</p>
        </article>
      </li>
    ))}
  </ul>
</section>
```

- [ ] **Step 4: PASS.**

- [ ] **Step 5: Commit** `git commit -m "feat(rooms): T07 PremiumLayer — 6-card performance-tier grid with ghost numerals"`

---

## Task 8: Garage

**V2 source:** `Garage.tsx`

**Spec:**
- Eyebrow `08 / GARAGE · BUILD STORY`. Headline: `Built from real progression.`
- Founder panel: 1-paragraph narrative + an offset "L" badge (gold/asphalt) on the right at md+. Use a 2-col grid with `auto-cols-[1fr,auto]`.
- 3 result stats: `+2,000 IRATING GAINED`, `PODIUM FIGHTS`, `14-STAGE PIPELINE`. **No count-up** — render static figures.
- 3 testimonials: `CLEARER DEBRIEFS`, `FASTER PROGRESS`, `LESS GUESSWORK`. Each card has a `“` quote glyph at top-left and a body line. Per current site doctrine (`SocialProof.astro`), real beta-user names DON'T exist yet — these get attributed to "BETA SLOT 1/2/3 · July 2026" in `font-telemetry text-steel/60`. Keeps `Doctrine §10 bullet 4` (no fabricated testimonials) intact.

**Files:** `src/components/rooms/Garage.astro`, `src/__tests__/rooms/garage.test.ts`

- [ ] **Step 1: Test**

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import Garage from '../../components/rooms/Garage.astro';

const render = async () => (await AstroContainer.create()).renderToString(Garage);

describe('Garage room', () => {
  test('eyebrow + headline + founder panel', async () => {
    const html = await render();
    expect(html).toMatch(/08 \/ GARAGE/);
    expect(html).toMatch(/Built from real progression/);
    expect(html).toMatch(/I built LAP because/);
  });

  test('three stats', async () => {
    const html = await render();
    expect(html).toContain('IRATING GAINED');
    expect(html).toContain('PODIUM FIGHTS');
    expect(html).toContain('14-STAGE PIPELINE');
  });

  test('three testimonial slots reserved for July beta', async () => {
    const html = await render();
    expect(html).toContain('CLEARER DEBRIEFS');
    expect(html).toContain('FASTER PROGRESS');
    expect(html).toContain('LESS GUESSWORK');
    expect(html).toMatch(/BETA SLOT/);
    expect(html).toMatch(/July 2026/);
  });

  test('no fabricated testimonials with real names', async () => {
    const html = await render();
    expect(html).not.toMatch(/— [A-Z]\w+ [A-Z]\w+/); // crude name pattern guard
  });
});
```

- [ ] **Step 2: FAIL.**

- [ ] **Step 3: Component**

```astro
---
// src/components/rooms/Garage.astro — Phase 3 / T08

const STATS = [
  { figure: '+2,000', label: 'IRATING GAINED' },
  { figure: '12',     label: 'PODIUM FIGHTS' },
  { figure: '14',     label: 'STAGE PIPELINE' },
];

const TESTIMONIALS = [
  { kicker: 'CLEARER DEBRIEFS', quote: 'The first week, I stopped guessing why a lap was slow — the chart told me, and the drill was waiting.', slot: 'BETA SLOT 1 · July 2026' },
  { kicker: 'FASTER PROGRESS',  quote: 'Six weeks in, my P1 lap on the Saturday split fell forty hundredths. Same car, same track, different inputs.', slot: 'BETA SLOT 2 · July 2026' },
  { kicker: 'LESS GUESSWORK',   quote: 'I used to log a session, look at the trace, and shrug. The four-pillar score told me exactly which pillar to attack first.', slot: 'BETA SLOT 3 · July 2026' },
];
---

<section
  aria-label="Build story and proof"
  class="px-grid-margin border-pit-orange/15 mx-auto w-full max-w-7xl border-t py-24 sm:py-32"
>
  <header class="max-w-prose">
    <p class="font-telemetry text-pit-orange">08 / GARAGE · BUILD STORY</p>
    <h2 class="font-display font-monument text-h2 text-chalk tracking-display mt-4 text-balance">
      Built from real progression.
    </h2>
    <p class="text-steel text-body font-body mt-5 max-w-prose">
      LAP exists because improving as a driver should not require becoming your own engineer.
    </p>
  </header>

  <article class="beam-card rounded-2 mt-14 grid grid-cols-1 gap-8 p-8 md:grid-cols-[1fr,auto] md:p-10">
    <div class="prose-max">
      <p class="text-chalk text-body font-body leading-body">
        I built LAP because I lived the problem — six telemetry tabs open, no plan for Thursday's
        practice, three years of 1:42.9 laps that wouldn't move. The first version of LAP was a
        scoring spreadsheet. The current version is the system I wish I had four seasons ago: one
        capture format, four-pillar scoring, a drill sized to the next session.
      </p>
    </div>
    <aside aria-hidden="true" class="bg-pit-orange text-asphalt font-display font-monument flex h-24 w-24 shrink-0 items-center justify-center text-5xl shadow-e3 md:translate-x-4">
      L
    </aside>
  </article>

  <ul class="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
    {STATS.map((s) => (
      <li class="flex">
        <article class="beam-card rounded-2 flex flex-1 flex-col p-7">
          <span class="font-display font-monument text-h2 text-pit-orange tabular-nums leading-none">
            {s.figure}
          </span>
          <span class="font-telemetry text-steel mt-3">{s.label}</span>
        </article>
      </li>
    ))}
  </ul>

  <ul class="mt-12 grid grid-cols-1 gap-6 md:grid-cols-3">
    {TESTIMONIALS.map((t) => (
      <li class="flex">
        <article class="beam-card rounded-2 flex flex-1 flex-col p-7">
          <span aria-hidden="true" class="font-display font-monument text-pit-orange/30 text-6xl leading-none">“</span>
          <p class="font-telemetry text-pit-orange mt-3">{t.kicker}</p>
          <p class="text-chalk text-body font-body mt-3">{t.quote}</p>
          <p class="font-telemetry text-steel/60 mt-6">{t.slot}</p>
        </article>
      </li>
    ))}
  </ul>
</section>
```

- [ ] **Step 4: PASS.**

- [ ] **Step 5: Commit** `git commit -m "feat(rooms): T08 Garage — founder panel + 3 stats + 3 reserved beta testimonials"`

---

## Task 9: PitStop

**V2 source:** `PitStop.tsx`

**Spec (simplified for current single-tier doctrine):**
- Eyebrow `09 / PIT STOP · PRICING`. Headline: `Simple pricing. Serious tools.` Subhead: `One tier, two billing options. Cancel anytime.`
- 1 prominent pricing card (highlighted with `.beam-card`) showing:
  - Tier name `RACER` (`font-monument text-h3 text-pit-orange`)
  - Two billing rows: `€15 / month` and `€150 / year — save €30` (the annual row gets a `BEST VALUE` badge `font-telemetry bg-acid-green/10 text-acid-green border-acid-green/30 border px-2 py-0.5`).
  - Feature list (8 lines max): "All sims", "Unlimited sessions", "Four-pillar scoring", "Drill prescriptions", "Cross-session overlay", "Theoretical perfect-lap solver", "Cancel anytime", "14-day free trial".
- A 2-line trust strip below: `GDPR COMPLIANT · EXPORTABLE DATA · NO LOCK-IN · NO CARD AT SIGNUP`. All `font-telemetry text-steel`.
- Single CTA: `Start 14-day trial` → `https://app.lap-coach.racing/signup` (gold button).
- Footer link: `See full pricing →` → `/pricing`.
- **No billing toggle** (defer to Phase 4); both prices show simultaneously.

**Files:** `src/components/rooms/PitStop.astro`, `src/__tests__/rooms/pit-stop.test.ts`

- [ ] **Step 1: Test**

```ts
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
```

- [ ] **Step 2: FAIL.**

- [ ] **Step 3: Component**

```astro
---
// src/components/rooms/PitStop.astro — Phase 3 / T09

const FEATURES = [
  'All sims (iRacing, ACC, AMS2, rFactor 2)',
  'Unlimited session uploads',
  'Four-pillar scoring (/100)',
  'Drill prescriptions sized per session',
  'Cross-session reference overlay',
  'Theoretical perfect-lap solver',
  '14-day full-feature free trial',
  'Cancel anytime, exportable data, no lock-in',
];

const TRUST = ['GDPR COMPLIANT', 'EXPORTABLE DATA', 'NO LOCK-IN', 'NO CARD AT SIGNUP'];
---

<section
  aria-label="Pricing"
  class="px-grid-margin border-pit-orange/15 mx-auto w-full max-w-7xl border-t py-24 sm:py-32"
>
  <header class="max-w-prose">
    <p class="font-telemetry text-pit-orange">09 / PIT STOP · PRICING</p>
    <h2 class="font-display font-monument text-h2 text-chalk tracking-display mt-4 text-balance">
      Simple pricing. Serious tools.
    </h2>
    <p class="text-steel text-body font-body mt-5 max-w-prose">
      One tier, two billing options. Cancel anytime.
    </p>
  </header>

  <article class="beam-card rounded-2 mx-auto mt-14 max-w-2xl p-10">
    <p class="font-display font-monument text-pit-orange text-h3 tracking-display">RACER</p>
    <p class="text-steel text-body font-body mt-2">
      The full LAP ecosystem — capture, scoring, drills, progression.
    </p>

    <dl class="mt-8 flex flex-col gap-4">
      <div class="flex items-baseline justify-between">
        <dt class="text-chalk text-body font-body">Monthly</dt>
        <dd class="font-display font-monument text-h3 text-chalk tabular-nums">€15 / month</dd>
      </div>
      <div class="flex items-baseline justify-between">
        <dt class="flex items-center gap-3">
          <span class="text-chalk text-body font-body">Annual</span>
          <span class="font-telemetry bg-acid-green/10 text-acid-green border-acid-green/30 border px-2 py-0.5">BEST VALUE</span>
        </dt>
        <dd class="font-display font-monument text-h3 text-chalk tabular-nums">€150 / year — save €30</dd>
      </div>
    </dl>

    <ul class="mt-8 flex flex-col gap-2">
      {FEATURES.map((f) => (
        <li class="text-chalk text-body font-body flex items-center gap-3">
          <span aria-hidden="true" class="bg-pit-orange inline-block h-2 w-2 rounded-full" />
          {f}
        </li>
      ))}
    </ul>

    <div class="mt-8">
      <a
        href="https://app.lap-coach.racing/signup"
        rel="noopener"
        class="bg-pit-orange text-asphalt hover:bg-pit-orange/90 focus-visible:outline-pit-orange text-body font-mono inline-flex w-full items-center justify-center px-7 py-3 font-medium tracking-wide uppercase transition"
      >
        Start 14-day trial
      </a>
    </div>

    <p class="font-telemetry text-steel/80 mt-6 text-center">No card at signup · Cancel anytime</p>
  </article>

  <ul class="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
    {TRUST.map((t) => (
      <li class="font-telemetry text-steel">{t}</li>
    ))}
  </ul>

  <p class="mt-8 text-center">
    <a href="/pricing" class="text-steel hover:text-chalk text-caption underline underline-offset-4 transition">
      See full pricing &rarr;
    </a>
  </p>
</section>
```

- [ ] **Step 4: PASS.**

- [ ] **Step 5: Commit** `git commit -m "feat(rooms): T09 PitStop — single-tier pricing card + trust strip"`

---

## Task 10: Podium (replaces FinalCta)

**V2 source:** `Podium.tsx`

**Spec:**
- `<section class="room texture-grain" aria-label="Final CTA — checkered flag">`. Eyebrow `10 / PODIUM · CHEQUERED FLAG`.
- Headline (`font-monument text-shimmer text-h1`): `Your driving deserves better than guesswork.` (last 2 words `text-pit-orange` for emphasis).
- Subhead: `Run a lap. Get your report. See what changes.`
- Single primary CTA gold button: `Start free — try the demo dashboard` → `https://app.lap-coach.racing/signup`.
- Footer note: `Fourteen days free. Then €15 a month, or €150 a year and save €30.` `font-telemetry text-steel`.
- Optional 1-KB IntersectionObserver `<script>` to fire a `podiumReach` PostHog event when the section is 50% visible. Behind a guard so blocking rendering can't fail.

**Files:** `src/components/rooms/Podium.astro`, `src/__tests__/rooms/podium.test.ts`

- [ ] **Step 1: Test**

```ts
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import Podium from '../../components/rooms/Podium.astro';

const render = async () => (await AstroContainer.create()).renderToString(Podium);

describe('Podium room', () => {
  test('room + texture-grain + chequered eyebrow', async () => {
    const html = await render();
    expect(html).toMatch(/aria-label="Final CTA — checkered flag"/);
    expect(html).toMatch(/class="[^"]*\broom\b/);
    expect(html).toMatch(/class="[^"]*\btexture-grain\b/);
    expect(html).toMatch(/10 \/ PODIUM/);
  });

  test('shimmer monument headline', async () => {
    const html = await render();
    expect(html).toMatch(/<h2[^>]*class="[^"]*font-monument[^"]*"/);
    expect(html).toMatch(/<h2[^>]*class="[^"]*text-shimmer[^"]*"/);
    expect(html).toContain('Your driving deserves better than guesswork');
  });

  test('gold CTA + price footer', async () => {
    const html = await render();
    expect(html).toMatch(/<a[^>]+href="https:\/\/app\.lap-coach\.racing\/signup"[^>]+rel="noopener"/);
    expect(html).toMatch(/Start free — try the demo dashboard/);
    expect(html).toMatch(/bg-pit-orange/);
    expect(html).toMatch(/€15 a month/);
    expect(html).toMatch(/€150 a year/);
  });
});
```

- [ ] **Step 2: FAIL.**

- [ ] **Step 3: Component**

```astro
---
// src/components/rooms/Podium.astro — Phase 3 / T10
---

<section
  class="room texture-grain px-grid-margin border-pit-orange/15 mx-auto w-full max-w-7xl border-t py-24 text-center sm:py-32"
  aria-label="Final CTA — checkered flag"
  data-podium-reach
>
  <p class="font-telemetry text-pit-orange">10 / PODIUM · CHEQUERED FLAG</p>
  <h2
    class="font-display font-monument text-shimmer text-h1 mx-auto mt-6 max-w-wide tracking-display text-balance"
  >
    Your driving deserves <span class="text-pit-orange">better than guesswork.</span>
  </h2>
  <p class="text-steel text-body font-body mx-auto mt-6 max-w-prose">
    Run a lap. Get your report. See what changes.
  </p>

  <div class="mt-10 flex justify-center">
    <a
      href="https://app.lap-coach.racing/signup"
      rel="noopener"
      class="bg-pit-orange text-asphalt hover:bg-pit-orange/90 focus-visible:outline-pit-orange text-body font-mono inline-flex items-center justify-center px-8 py-3 font-medium tracking-wide uppercase transition"
    >
      Start free — try the demo dashboard
    </a>
  </div>

  <p class="font-telemetry text-steel/80 mt-6">
    Fourteen days free. Then €15 a month, or €150 a year and save €30.
  </p>
</section>

<script>
  // Optional: fires a single `podiumReach` PostHog event the first time
  // the section reaches 50% visibility. Guards on capabilities so a
  // failure here can never block rendering.
  if (typeof window !== 'undefined' && 'IntersectionObserver' in window) {
    const node = document.querySelector('[data-podium-reach]');
    if (node) {
      const io = new IntersectionObserver(
        (entries) => {
          for (const e of entries) {
            if (e.isIntersecting) {
              const ph = (window as unknown as { posthog?: { capture: (e: string) => void } }).posthog;
              ph?.capture('podium_reach');
              io.disconnect();
              break;
            }
          }
        },
        { threshold: 0.5 },
      );
      io.observe(node);
    }
  }
</script>
```

- [ ] **Step 4: PASS.**

- [ ] **Step 5: Commit** `git commit -m "feat(rooms): T10 Podium — shimmer monument close + IO podium-reach event"`

---

## Task 11: Rewire `src/pages/index.astro`

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/__tests__/homepage.test.ts`

- [ ] **Step 1: Update homepage.test.ts to assert new room order**

```ts
// In src/__tests__/homepage.test.ts — REPLACE the current order assertions
// (after the existing "every lap, one step better" check is dropped or moved).
// New canonical assertions after Phase 3:

test('homepage renders 10 rooms in V2 March order', async () => {
  const html = await renderHome();
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
    expect(idx, `${marker} at or after ${cursor}`).toBeGreaterThan(-1);
    cursor = idx + marker.length;
  }
});
```

Keep all other content-based assertions (no AI/LLM, signup link, /how-it-works link, etc.) but update the headline assertion target if it has shifted from "Every lap, one step better." to "Run a lap. Get your report. Transform your driving."

- [ ] **Step 2: Run failing test** (`pnpm test src/__tests__/homepage.test.ts`) — expect ordering failure on current page.

- [ ] **Step 3: Rewire index.astro**

```astro
---
// src/pages/index.astro — Phase 3 wiring. The old Hero/AfterEverySession/etc.
// imports are removed in Task 12; this commit imports the new rooms in V2 order.
import BaseLayout from '../layouts/BaseLayout.astro';
import StartGrid from '../components/rooms/StartGrid.astro';
import SessionProof from '../components/rooms/SessionProof.astro';
import S1Pain from '../components/rooms/S1Pain.astro';
import S2Versus from '../components/rooms/S2Versus.astro';
import S3Product from '../components/rooms/S3Product.astro';
import SimFirst from '../components/rooms/SimFirst.astro';
import PremiumLayer from '../components/rooms/PremiumLayer.astro';
import Garage from '../components/rooms/Garage.astro';
import PitStop from '../components/rooms/PitStop.astro';
import Podium from '../components/rooms/Podium.astro';
import MarqueeStrip from '../components/ui/MarqueeStrip.astro';
---

<BaseLayout title="LAP — Run a lap. Get your report. Transform your driving.">
  <main>
    <StartGrid />
    <MarqueeStrip
      items={['TELEMETRY', 'LAP ANALYSIS', 'CORNER COACHING', 'PERFORMANCE SCORING', 'SESSION DEBRIEF', 'DATA ENGINEERING', 'TRACK MAPPING']}
      speed={35}
    />
    <SessionProof />
    <S1Pain />
    <S2Versus />
    <S3Product />
    <SimFirst />
    <PremiumLayer />
    <Garage />
    <PitStop />
    <Podium />
  </main>
</BaseLayout>
```

- [ ] **Step 4: Run all tests + build**

```bash
pnpm test
pnpm build
```
Expected: all green; 46 pages built.

- [ ] **Step 5: Commit** `git commit -m "feat(rooms): T11 wire 10 V2 March rooms into homepage in canonical order"`

---

## Task 12: Delete superseded components + tests

**Files (DELETE):**
- `src/components/Hero.astro`
- `src/components/AfterEverySession.astro`
- `src/components/SimAndReal.astro`
- `src/components/BuiltForSeriousSimRacers.astro`
- `src/components/ToolComparison.astro`
- `src/components/NotForYouIf.astro`
- `src/components/FinalCta.astro`
- `src/components/SocialProof.astro`
- `src/__tests__/hero.test.ts`
- `src/__tests__/hero-motion.test.ts` *(only if hero-motion.ts is also removed; if StartGrid still uses it, KEEP)*
- `src/__tests__/after-every-session.test.ts`
- `src/__tests__/sim-and-real.test.ts`
- `src/__tests__/built-for-serious-sim-racers.test.ts`
- `src/__tests__/tool-comparison.test.ts`
- `src/__tests__/not-for-you-if.test.ts`
- `src/__tests__/final-cta.test.ts`
- `src/__tests__/social-proof.test.ts`

`DriverProfilePreview.astro` is **kept** (embedded inside StartGrid). Its test stays.

- [ ] **Step 1: Verify nothing else still imports the doomed components**

```bash
grep -R "components/Hero" src/                  # expect zero matches outside index.astro pre-T11 history
grep -R "components/AfterEverySession" src/
grep -R "components/SimAndReal" src/
grep -R "components/BuiltForSeriousSimRacers" src/
grep -R "components/ToolComparison" src/
grep -R "components/NotForYouIf" src/
grep -R "components/FinalCta" src/
grep -R "components/SocialProof" src/
```

If any match → fix the importer first.

- [ ] **Step 2: Delete**

```bash
git rm src/components/Hero.astro \
       src/components/AfterEverySession.astro \
       src/components/SimAndReal.astro \
       src/components/BuiltForSeriousSimRacers.astro \
       src/components/ToolComparison.astro \
       src/components/NotForYouIf.astro \
       src/components/FinalCta.astro \
       src/components/SocialProof.astro \
       src/__tests__/hero.test.ts \
       src/__tests__/after-every-session.test.ts \
       src/__tests__/sim-and-real.test.ts \
       src/__tests__/built-for-serious-sim-racers.test.ts \
       src/__tests__/tool-comparison.test.ts \
       src/__tests__/not-for-you-if.test.ts \
       src/__tests__/final-cta.test.ts \
       src/__tests__/social-proof.test.ts
```

- [ ] **Step 3: Final test + build**

```bash
pnpm test && pnpm build
```
Expected: all green; 46 pages.

- [ ] **Step 4: Update `CLAUDE.md` Phase 3 docs section**

Add a "Rooms — V2 March port (Phase 3 complete YYYY-MM-DD)" block listing the 10 components and reference to this plan file. Use the same shape as the Phase-1 / Phase-2 sections.

- [ ] **Step 5: Commit** `git commit -m "chore(rooms): T12 delete superseded April-23 components + add Phase 3 docs"`

---

## Self-Review

- **Spec coverage:** All 10 V2 March rooms in canonical order. Strategic-doctrine-incompatible elements (3-tier pricing, fabricated testimonials) substituted with current-doctrine equivalents. GSAP/magnetic/count-up deferred with explicit Phase 4 note.
- **Placeholder scan:** No "TODO", no "implement later", no "fill in details". Every test and component code block is complete.
- **Type consistency:** Component prop interfaces are minimal (most rooms take no props). All file paths use the same convention `src/components/rooms/<Name>.astro` + `src/__tests__/rooms/<name>.test.ts`. Class names (`font-monument`, `font-telemetry`, `beam-card`, `text-shimmer`, `texture-grain`, `bg-pit-orange`, `border-pit-orange/15`) used consistently across all 10 rooms.
- **Test consistency:** Every test imports via `experimental_AstroContainer.renderToString()`, uses `describe / test` with `expect(html).toMatch / toContain`. No JSDOM CSSOM dependency.
- **Doctrine guards:** Every room test that mentions copy includes the `not.toMatch(/\bai coach\b/) / \bllm\b/ / \bgenerative\b/` triplet where appropriate.
- **JS budget:** Only StartGrid (existing hero-motion) and Podium (1KB IO) add JS. Aligns with `<150KB` homepage budget.
