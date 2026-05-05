import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { expect, test } from 'vitest';

// Homepage JS budget contract, per T037 / CLAUDE.md "Total JS per
// page <150KB gzip" (this locks the tighter homepage-specific 100KB
// target from the sprint task).
//
// The test parses dist/index.html for the <script src=...> refs the
// browser will actually fetch on first load, gzips each file (zlib
// level 9 to match Vite's reported gzip size), and sums. Anything
// inline in <script>…</script> or loaded async post-LCP is
// intentionally out of scope — this budget is "bytes the browser
// must parse before LCP".

const DIST_DIR = resolve(process.cwd(), 'dist');
const INDEX_HTML = resolve(DIST_DIR, 'index.html');
const JS_BUDGET_BYTES = 100_000; // T037 sprint target, gzip level 9

function homepageJsFiles(): string[] {
  if (!existsSync(INDEX_HTML)) {
    throw new Error(
      `dist/index.html not found — run \`pnpm build\` before \`pnpm test\`. ` +
        `The CI workflow does this automatically (verify.build → verify.test).`,
    );
  }
  const html = readFileSync(INDEX_HTML, 'utf8');
  const matches = [...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)];
  return matches.map((m) => m[1]);
}

function gzipBytes(distRelPath: string): number {
  const absPath = resolve(DIST_DIR, distRelPath.replace(/^\//, ''));
  const raw = readFileSync(absPath);
  return gzipSync(raw, { level: 9 }).length;
}

test('T037: homepage ships <100 kB of gzipped JS on first load', () => {
  const scripts = homepageJsFiles();
  expect(scripts.length).toBeGreaterThan(0);

  const sizes = scripts.map((src) => ({ src, gzip: gzipBytes(src) }));
  const total = sizes.reduce((sum, s) => sum + s.gzip, 0);

  // If this fails, the failure message names which chunks contributed
  // the regression so a reviewer can decide whether to code-split,
  // defer, or lazy-load the offender.
  const breakdown = sizes.map((s) => `${s.src} (${s.gzip} B)`).join('\n  ');
  const message = `Homepage gzipped JS = ${total} B (budget ${JS_BUDGET_BYTES} B).\n  ${breakdown}`;

  expect(total, message).toBeLessThan(JS_BUDGET_BYTES);
});

test('T037: homepage bundles at least the StartGrid + BaseLayout chunks', () => {
  // Sanity check on the parser: the index.html should reference the
  // StartGrid animation script (Phase 3 / T01 — same hero-motion JS that
  // T027's Hero used to import) and the BaseLayout script (which holds
  // the PostHog / Sentry client bridge). If either disappears from the
  // script refs, something upstream has changed the rendering posture
  // and the budget measurement would be silently incomplete.
  const scripts = homepageJsFiles();
  expect(scripts.some((s) => /StartGrid\.astro/.test(s))).toBe(true);
  expect(scripts.some((s) => /BaseLayout\.astro/.test(s))).toBe(true);
});
