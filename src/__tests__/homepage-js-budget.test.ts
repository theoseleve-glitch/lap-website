import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { gzipSync } from 'node:zlib';
import { expect, test } from 'vitest';

// Homepage JS budget contract, per CLAUDE.md "Total JS per page <150KB
// gzip". After the June-8 rebuild the homepage is static-only: the GSAP
// scroll-pins, the StartGrid hero-motion chunk, sector-progress/tick-up/
// magnetic-cursor and the whole rooms layer are gone. The only script
// the browser fetches on first load is the global BaseLayout analytics
// bundle (Sentry + PostHog cookieless + marketing-events). So the real
// budget headroom is enormous — the assertion below mainly guards
// against a regression that reintroduces a heavy per-page bundle.
//
// The test parses dist/index.html for the <script src=...> refs the
// browser will actually fetch on first load, gzips each file (zlib
// level 9 to match Vite's reported gzip size), and sums. Anything
// inline in <script>…</script> or loaded async post-LCP is
// intentionally out of scope — this budget is "bytes the browser
// must parse before LCP".

const DIST_DIR = resolve(process.cwd(), 'dist');
const INDEX_HTML = resolve(DIST_DIR, 'index.html');
const JS_BUDGET_BYTES = 150_000; // CLAUDE.md per-page budget, gzip level 9

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

test('homepage ships <150 kB of gzipped JS on first load', () => {
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

test('homepage ships only the global BaseLayout analytics bundle (no per-page JS)', () => {
  // Sanity check on the parser AND on the rendering posture. The June-8
  // homepage is static — the only first-load script ref must be the
  // global BaseLayout bundle (PostHog / Sentry / marketing-events). If
  // that disappears, the budget measurement above is silently empty; if
  // a per-page chunk reappears, the page is no longer JS-free.
  const scripts = homepageJsFiles();

  // The global analytics bundle is present (so the budget isn't measuring nothing).
  expect(scripts.some((s) => /BaseLayout\.astro/.test(s))).toBe(true);

  // No per-page homepage JS: the retired rooms / motion scripts must not
  // reappear in the first-load script refs.
  const removedChunks =
    /(StartGrid|SessionProof|ThePain|Versus|Pipeline|Garage|Podium|FiveRedLights|SectorRibbon|home-pins|gsap-loader|sector-progress|tick-up|magnetic-cursor|hero-motion)/;
  expect(scripts.some((s) => removedChunks.test(s))).toBe(false);

  // The homepage now ships a single first-load script: the BaseLayout bundle.
  expect(scripts.length).toBe(1);
});
