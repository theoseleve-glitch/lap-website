// T219 — PostHog conversion funnel dashboards configuration spec.
// Dashboards live in the PostHog UI (not in code — PostHog free
// tier has no dashboards-as-code API), so the deliverable is a
// markdown spec the founder copies into the PostHog dashboard
// creator + funnel builder on launch-prep day.
//
// This test file locks the spec for completeness: canonical event
// vocabulary (T103 + T128 + T218) named, ≥3 dashboards defined,
// ≥3 funnels named, GDPR-friendly cookieless framing references
// CLAUDE.md mandate, acceptance criteria as a checkbox list so
// the founder can verify each panel works once provisioned.

import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

const FILE_PATH = join(
  process.cwd(),
  'docs',
  'marketing',
  'posthog-funnel-dashboards.md',
);

const loadFile = (): string => readFileSync(FILE_PATH, 'utf8');

const CANONICAL_EVENTS = [
  'signup_clicked',
  'demo_viewed',
  'pricing_viewed',
  'waitlist_submitted',
  'waitlist_confirmed',
  'download_clicked',
] as const;

describe('T219: file artefact on disk', () => {
  test('docs/marketing/posthog-funnel-dashboards.md exists', () => {
    expect(existsSync(FILE_PATH)).toBe(true);
  });

  test('file has a single H1 (overview heading)', () => {
    const md = loadFile();
    const h1Lines = md.match(/^#\s+/gm) ?? [];
    expect(h1Lines.length).toBe(1);
  });

  test('file has at least 3 H2 sections', () => {
    const md = loadFile();
    const h2 = md.match(/^##\s+/gm) ?? [];
    expect(h2.length).toBeGreaterThanOrEqual(3);
  });
});

describe('T219: dashboard definitions (≥3)', () => {
  test('file defines ≥3 dashboards (heading "## Dashboard N — ...")', () => {
    const md = loadFile();
    const dashboards = md.match(/^##\s+Dashboard\s+\d+/gm) ?? [];
    expect(
      dashboards.length,
      `spec needs ≥3 dashboards; got ${dashboards.length}`,
    ).toBeGreaterThanOrEqual(3);
  });
});

describe('T219: funnel definitions (≥3 named funnels)', () => {
  test('file references ≥3 named funnels (e.g. "Funnel A", "Funnel B", "Funnel C")', () => {
    const md = loadFile();
    // Match "Funnel <Capital>" followed by space, em/en-dash, or
    // colon. Excludes "Funnel definition" (lowercase d).
    const funnelMentions = md.match(/\bFunnel\s+[A-Z](?:\s|—|–|:)/g) ?? [];
    // Distinct funnel labels: count unique [A-Z] suffixes.
    const labels = new Set(
      funnelMentions.map((m) => {
        const match = m.match(/Funnel\s+([A-Z])/);
        return match ? match[1] : '';
      }),
    );
    labels.delete('');
    expect(
      labels.size,
      `spec needs ≥3 distinct named funnels (Funnel A/B/C…); got ${labels.size}`,
    ).toBeGreaterThanOrEqual(3);
  });
});

describe('T219: canonical event vocabulary (T103 + T128 + T218)', () => {
  test.each(CANONICAL_EVENTS)(
    'event "%s" is named in the dashboard spec',
    (event) => {
      const md = loadFile();
      expect(
        md,
        `event ${event} must appear in dashboard config`,
      ).toMatch(new RegExp(`\\b${event}\\b`));
    },
  );
});

describe('T219: GDPR-friendly + cookieless framing (CLAUDE.md mandate)', () => {
  test('mentions PostHog', () => {
    expect(loadFile().toLowerCase()).toMatch(/\bposthog\b/);
  });

  test('mentions cookieless persistence (CLAUDE.md GDPR-friendly mandate)', () => {
    const lower = loadFile().toLowerCase();
    expect(lower).toMatch(
      /\bcookieless|persistence:\s*['"]?memory|memory[- ]only persistence|gdpr/,
    );
  });

  test('references ADR-019 (PostHog choice) OR CLAUDE.md', () => {
    const md = loadFile();
    expect(md).toMatch(/ADR-019|CLAUDE\.md/i);
  });
});

describe('T219: acceptance criteria checklist (≥3 items)', () => {
  test('file has an acceptance criteria section with ≥3 checkbox items', () => {
    // Lock the spec into a verifiable contract: the founder
    // ticks each item once they can answer it from the PostHog
    // UI. Pure documentation without measurable acceptance
    // criteria gets ignored, so the checklist is non-optional.
    const md = loadFile();
    const checkboxes = md.match(/^\s*-\s+\[\s\]\s+\S+/gm) ?? [];
    expect(
      checkboxes.length,
      `acceptance section needs ≥3 checkbox items; got ${checkboxes.length}`,
    ).toBeGreaterThanOrEqual(3);
  });
});

describe('T219: cross-references to events-source files', () => {
  test('references at least one events-source TS file', () => {
    const md = loadFile();
    expect(md).toMatch(
      /marketing-events\.ts|waitlist-events\.ts|download-events\.ts/,
    );
  });
});

describe('T219: ADR-004 vocab discipline', () => {
  test('no bare "AI coach" / "LLM" / "generative" / "neural" / "realistic"', () => {
    const lower = loadFile().toLowerCase();
    expect(lower).not.toMatch(/\bai coach\b/);
    expect(lower).not.toMatch(/\bllm\b/);
    expect(lower).not.toMatch(/\bgenerative\b/);
    expect(lower).not.toMatch(/\bneural\b/);
    expect(lower).not.toMatch(/\brealistic\b/);
  });
});
