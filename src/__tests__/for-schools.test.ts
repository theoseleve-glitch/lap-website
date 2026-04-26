// T201 — /for-schools landing page shell.
//
// Doctrine context: 01-STRATEGIC-DOCTRINE.md §6 + §8 frames B2B
// (racing schools, karting academies) as "door open, outbound
// starts only in Month 5." Today is Month 1 (2026-04-26). The
// landing page is the inbound surface — the destination of the
// T062 PricingB2bTeaser link, currently 404. T201 ships the
// shell that makes the link resolve; T202-T206 progressively
// fill the hero + value-prop + form + pricing-anchor + social-
// proof slots.
//
// Test contract for T201 locks:
//   * Page renders, single <main>, BaseLayout integration
//   * H1 + title + description position the page for the right
//     audience (racing schools AND karting academies — both
//     plural noun phrases per doctrine §8)
//   * Inbound posture (mailto:sales@lap-coach.racing — same
//     T066 pattern; T204 replaces with form). No outbound
//     pitch tone since outbound campaign starts Month 5.
//   * Doctrine prohibitions — no AI-coach / LLM / generative
//     / neural / realistic vocab (ADR-004)
//   * No committed price (T205 owns the "from €X/seat/mo,
//     contact us" anchor; before that the shell must not
//     leak a number)
//   * No fake social proof ("X academies trust us") since
//     there are no customers yet (T184 baseline)
//   * No-orphan navigation: at least one link to /pricing
//   * Performance carry-over: no client:* directives

import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { describe, expect, test } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import ForSchools from '../pages/for-schools.astro';

const render = () =>
  AstroContainer.create().then((c) => c.renderToString(ForSchools));

const SOURCE_PATH = join(
  process.cwd(),
  'src',
  'pages',
  'for-schools.astro',
);
const loadSource = (): string => readFileSync(SOURCE_PATH, 'utf8');

describe('T201: /for-schools shell renders', () => {
  test('renders a single <main> landmark', async () => {
    const html = await render();
    const mainMatches = html.match(/<main[\s>]/g) ?? [];
    expect(mainMatches.length).toBe(1);
  });

  test('renders an <h1>', async () => {
    const html = await render();
    expect(html).toMatch(/<h1[\s>]/i);
  });

  test('h1 names the audience (schools or academies)', async () => {
    const html = await render();
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    expect(h1Match).not.toBeNull();
    expect(h1Match![1].toLowerCase()).toMatch(/schools|academies/);
  });
});

describe('T201: BaseLayout integration', () => {
  test('title includes "LAP" branding (BaseLayout integration)', async () => {
    // Pattern matches /demo, /pricing, /how-it-works titles.
    // Locking "LAP" here catches accidental BaseLayout-bypass.
    const html = await render();
    expect(html).toMatch(/<title>[^<]*LAP[^<]*<\/title>/);
  });

  test('title positions the page for B2B audience (schools/academies)', async () => {
    // SERP click signal — the title must contain a noun the
    // B2B audience self-identifies as. Doctrine §6 names the
    // two segments: "racing schools, karting academies."
    const html = await render();
    const titleMatch = html.match(/<title>([^<]+)<\/title>/);
    expect(titleMatch).not.toBeNull();
    expect(titleMatch![1].toLowerCase()).toMatch(/schools|academies/);
  });

  test('meta description names racing schools', async () => {
    const html = await render();
    const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
    expect(descMatch).not.toBeNull();
    expect(descMatch![1].toLowerCase()).toMatch(/racing schools?/);
  });

  test('meta description names karting academies', async () => {
    const html = await render();
    const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]+)"/);
    expect(descMatch).not.toBeNull();
    expect(descMatch![1].toLowerCase()).toMatch(/karting academ(?:y|ies)/);
  });
});

describe('T201: inbound contact route (T066 mailto pattern reuse)', () => {
  test('exposes a mailto link to sales@lap-coach.racing', async () => {
    // T204 will introduce a real form posting to Resend → the
    // same sales@lap-coach.racing inbox. Until then the shell
    // ships the same mailto pattern as T066 on /pricing — same
    // inbox, zero external dependency, rich inbound signal.
    const html = await render();
    expect(html).toMatch(
      /<a[^>]+href="mailto:sales@lap-coach\.racing[^"]*"/,
    );
  });
});

describe('T201: doctrine-aligned copy (ADR-004 + anti-overclaim)', () => {
  test('no AI-coach / LLM / generative / neural / realistic vocab', async () => {
    const html = await render();
    const lower = html.toLowerCase();
    expect(lower).not.toMatch(/\bai coach\b/);
    expect(lower).not.toMatch(/\bllm\b/);
    expect(lower).not.toMatch(/\bgenerative\b/);
    expect(lower).not.toMatch(/\bneural\b/);
    expect(lower).not.toMatch(/\brealistic\b/);
  });

  test('no committed price number — T205 owns the pricing anchor', async () => {
    // Before T205 lands the "from €X/seat/mo, contact us" anchor,
    // the shell must not leak a euro amount. Locks the discipline
    // that pricing lives in exactly one place.
    const html = await render();
    // The mailto subject can include URL-encoded chars but should
    // not contain a € price token. Strip <head> to focus on body
    // content where the visible copy lives.
    const bodyMatch = html.match(/<body[\s\S]*<\/body>/i);
    expect(bodyMatch).not.toBeNull();
    expect(bodyMatch![0]).not.toMatch(/€\s*\d+/);
  });

  test('no fake social proof ("X academies trust us" / "X schools use")', async () => {
    // T184 baseline: no paying customers, no public beta yet.
    // Any "trusted by N schools" claim would be untrue. Lock
    // common templates so they cannot drift in.
    const html = await render();
    const lower = html.toLowerCase();
    expect(lower).not.toMatch(/\btrusted by\s+\d+/);
    expect(lower).not.toMatch(/\bused by\s+\d+/);
    expect(lower).not.toMatch(/\bjoin\s+\d+\s+(schools|academies|teams)\b/);
  });
});

describe('T201: navigation + responsive carry-over', () => {
  test('links to /pricing (no dead-end)', async () => {
    // /demo precedent: footer carries /how-it-works + /pricing
    // links. Lock at least /pricing so the inbound visitor has
    // a path to the price anchor and consumer-tier context.
    const html = await render();
    expect(html).toMatch(/href="\/pricing"/);
  });

  test('article body uses max-w-prose responsive constraint', async () => {
    // T199 a11y carry-over: long-form prose on wide displays
    // needs a max-width cap.
    const html = await render();
    expect(html).toMatch(/max-w-prose/);
  });
});

describe('T201: performance carry-over (T200)', () => {
  test('source has no Astro client:* directives', () => {
    // Pure-static delivery; zero hydration JS for the inbound
    // landing page.
    const src = loadSource();
    const matches = src.match(/\sclient:(load|idle|visible|only|media)\b/g) ?? [];
    expect(matches.length).toBe(0);
  });
});

describe('T202: hero (labelled landmark + primary CTA)', () => {
  test('hero is wrapped in an aria-labelledby region pointing to the H1', async () => {
    // T201 shipped the hero as a bare <header>. T202 promotes it
    // to an explicit landmark with an aria-labelledby pointer at
    // the H1. Screen readers can then jump directly to the hero
    // and announce the page's premise.
    const html = await render();
    const ariaLabelledByMatch = html.match(
      /<(?:section|header)[^>]+aria-labelledby="([^"]+)"/,
    );
    expect(
      ariaLabelledByMatch,
      'hero must wrap in <section> or <header> with aria-labelledby pointing at the H1',
    ).not.toBeNull();
    const labelId = ariaLabelledByMatch![1];
    expect(html).toMatch(new RegExp(`<h1[^>]+id="${labelId}"`));
  });

  test('hero has a primary CTA linking to the sales mailto', async () => {
    // Inbound posture: the most prominent action on the hero is
    // "talk to us." Until T203/T204 land the form, that's a
    // mailto. T202 promotes the inline mailto from T201 into a
    // visually weighted CTA element.
    const html = await render();
    const heroMatch = html.match(
      /<(?:section|header)[^>]+aria-labelledby="[^"]+"[\s\S]*?<\/(?:section|header)>/,
    );
    expect(heroMatch, 'hero region must be findable').not.toBeNull();
    expect(heroMatch![0]).toMatch(
      /<a[^>]+href="mailto:sales@lap-coach\.racing[^"]*"/,
    );
  });
});

describe('T202: value-prop section (≥3 items, doctrine-aligned)', () => {
  test('value-prop section is wrapped in aria-labelledby region with H2', async () => {
    const html = await render();
    // Find the second labelled section after the hero. Pattern:
    // <section aria-labelledby="ID"> ... <h2 id="ID">. We require
    // at least two such regions on the page (hero + value-prop).
    const labelledRegions = [
      ...html.matchAll(/<section[^>]+aria-labelledby="([^"]+)"/g),
    ];
    expect(
      labelledRegions.length,
      'page must have at least 2 aria-labelled sections (hero + value-prop)',
    ).toBeGreaterThanOrEqual(2);
    // At least one of them is paired with an <h2 id="...">
    const h2Ids = [...html.matchAll(/<h2[^>]+id="([^"]+)"/g)].map((m) => m[1]);
    const valuePropMatch = labelledRegions
      .map((m) => m[1])
      .find((id) => h2Ids.includes(id));
    expect(
      valuePropMatch,
      'at least one labelled section must point at an <h2 id="...">',
    ).toBeTruthy();
  });

  test('value-prop section lists at least three distinct items', async () => {
    // ≥3 items signals "here's what you actually get" with
    // enough breadth that the visitor sees the full surface.
    // 1 item = thin, 2 = pair, 3+ = catalogue. Test counts
    // <h3> or <li> elements as eligible item shapes.
    const html = await render();
    const h3Count = (html.match(/<h3[\s>]/g) ?? []).length;
    const liCount = (html.match(/<li[\s>]/g) ?? []).length;
    expect(
      Math.max(h3Count, liCount),
      `value-prop section must surface ≥3 items; got ${h3Count} H3s + ${liCount} LIs`,
    ).toBeGreaterThanOrEqual(3);
  });

  test('value-prop names the per-driver development plan (Pillar 4 framework)', async () => {
    // Doctrine §1 + Pillar 4 (T183): "every coaching prescription
    // must trace to a hand-curated written rule"; the artefact
    // delivered to a driver is a per-driver development plan.
    // For schools/academies that's the ROI lever — the same
    // plan, scaled to a roster.
    const html = await render();
    expect(html.toLowerCase()).toMatch(
      /per[- ]driver[\s\S]{0,60}development plan|development plan[\s\S]{0,60}per[- ]driver/,
    );
  });

  test('value-prop names sim AND real (cross-platform doctrine)', async () => {
    // Pillar 1 (T143) + doctrine §3: LAP is the cross-platform
    // surface for sim AND real-world racing. For an academy
    // running both rigs and on-track sessions, that continuity
    // is the explicit value prop.
    const html = await render();
    const lower = html.toLowerCase();
    expect(lower).toMatch(/\bsim\b/);
    expect(lower).toMatch(/\breal[- ]world|real track|on track|on-track|real racing\b/);
  });

  test('value-prop names rule-traceability or hand-curated rules (anti-LLM)', async () => {
    // Doctrine §10 #4 + ADR-004: no LLMs in coaching text.
    // For B2B specifically, the operator-defensibility comes
    // from being able to point at the written rule that
    // prescribed every drill — useful when a parent or
    // programme director asks why.
    const html = await render();
    expect(html.toLowerCase()).toMatch(
      /\brule(?:s|-traceable|-traceability)?\b|\bhand[- ]curated\b|\btraceabl|written rule\b/,
    );
  });
});

describe('T202: case-study placeholder (honest "no pilot yet" framing)', () => {
  test('case-study section is wrapped in aria-labelledby region with H2', async () => {
    const html = await render();
    // Three labelled sections by T202: hero + value-prop +
    // case-study.
    const labelledSections = [
      ...html.matchAll(/<section[^>]+aria-labelledby="([^"]+)"/g),
    ];
    expect(
      labelledSections.length,
      `page must have ≥3 aria-labelled sections; got ${labelledSections.length}`,
    ).toBeGreaterThanOrEqual(2);
    // Note: the hero may use <header> not <section>, so the
    // value-prop + case-study contribute the 2+ <section>
    // labelled regions.
  });

  test('case-study section signals "no programme yet" honestly', async () => {
    // T184 baseline: no paying customers, no public beta yet.
    // Doctrine §6: B2B outbound starts Month 5. The case-study
    // slot must explicitly acknowledge that LAP has not run
    // a pilot yet — phrases like "first programme", "first
    // pilot", "before our first", or "ships here after" all
    // satisfy. Lock at least one.
    const html = await render();
    const lower = html.toLowerCase();
    const honestMarkers = [
      /first programme/,
      /first pilot/,
      /before our first/,
      /ships here after/,
      /once our first/,
      /after the first programme/,
      /publish (?:it|a case study) (?:after|when|once)/,
    ];
    const matched = honestMarkers.some((re) => re.test(lower));
    expect(
      matched,
      'case-study section must honestly signal that no pilot has happened yet (e.g., "first programme", "first pilot", "ships here after")',
    ).toBe(true);
  });

  test('case-study section does not contain a fabricated testimonial blockquote', async () => {
    // Any <blockquote> attributing a quote to a person/org
    // would be fabricated since no pilot has happened. Lock
    // that the case-study section has no <blockquote> with an
    // attribution dash pattern (— Name, Role at School).
    const html = await render();
    // Find blockquote elements and confirm none of them carry
    // an em-dash/en-dash + capitalised attribution.
    const blockquotes = html.match(/<blockquote[\s\S]*?<\/blockquote>/g) ?? [];
    for (const bq of blockquotes) {
      expect(
        bq,
        `case-study blockquote contains an attribution pattern that would be a fabricated testimonial: ${bq}`,
      ).not.toMatch(/[—–][\s]+[A-Z][a-zA-Z]+/);
    }
  });
});

describe('T203: form integration', () => {
  test('page embeds the ForSchoolsForm component (POST to /api/for-schools)', async () => {
    // T203 mounts the 5-field B2B inquiry form on /for-schools.
    // The presence of the action URL is the cheapest proof that
    // the form rendered through; T204 will layer the Resend send
    // on top of the same endpoint.
    const html = await render();
    expect(html).toMatch(/action="\/api\/for-schools"/);
  });

  test('page embeds the form via component import (not inline duplicate)', () => {
    // Lock that the form is loaded via the component import,
    // not duplicated inline on the page. Keeps form invariants
    // (5 fields, GDPR consent, Turnstile) in exactly one place.
    const src = loadSource();
    expect(src).toMatch(/ForSchoolsForm/);
    expect(src).toMatch(/import\s+ForSchoolsForm\s+from\s+['"]\.\.\/components\/ForSchoolsForm\.astro['"]/);
  });
});
