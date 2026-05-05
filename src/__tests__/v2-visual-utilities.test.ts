import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';

const GLOBAL_CSS = readFileSync(
  resolve(process.cwd(), 'src/styles/global.css'),
  'utf8',
);

// Utility: extract the body of a CSS rule by selector. Returns null if the
// rule isn't found. We do this because regex-matching the whole rule with
// arbitrary inner content is brittle — better to grab the body and assert
// its declarations individually.
function ruleBody(css: string, selector: string): string | null {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const re = new RegExp(`${escaped}\\s*\\{([^}]*)\\}`);
  const m = css.match(re);
  return m ? m[1] : null;
}

describe('V2 March visual utilities — font-monument', () => {
  const body = ruleBody(GLOBAL_CSS, '.font-monument');
  test('class exists', () => {
    expect(body).not.toBeNull();
  });
  test('uses display font stack', () => {
    expect(body).toMatch(/font-family\s*:\s*var\(--font-display\)/);
  });
  test('weight 700', () => {
    expect(body).toMatch(/font-weight\s*:\s*700/);
  });
  test('uppercase', () => {
    expect(body).toMatch(/text-transform\s*:\s*uppercase/);
  });
  test('display letter-spacing token', () => {
    expect(body).toMatch(/letter-spacing\s*:\s*var\(--ls-display\)/);
  });
  test('display line-height token', () => {
    expect(body).toMatch(/line-height\s*:\s*var\(--lh-display\)/);
  });
});

describe('V2 March visual utilities — font-telemetry', () => {
  const body = ruleBody(GLOBAL_CSS, '.font-telemetry');
  test('class exists', () => {
    expect(body).not.toBeNull();
  });
  test('uses mono font stack', () => {
    expect(body).toMatch(/font-family\s*:\s*var\(--font-mono\)/);
  });
  test('weight 400', () => {
    expect(body).toMatch(/font-weight\s*:\s*400/);
  });
  test('uppercase', () => {
    expect(body).toMatch(/text-transform\s*:\s*uppercase/);
  });
  test('wide letter-spacing token', () => {
    expect(body).toMatch(/letter-spacing\s*:\s*var\(--ls-wide\)/);
  });
  test('telemetry size token', () => {
    expect(body).toMatch(/font-size\s*:\s*var\(--text-telemetry\)/);
  });
});

describe('V2 March visual utilities — font-body', () => {
  const body = ruleBody(GLOBAL_CSS, '.font-body');
  test('class exists', () => {
    expect(body).not.toBeNull();
  });
  test('uses body font stack', () => {
    expect(body).toMatch(/font-family\s*:\s*var\(--font-body\)/);
  });
  test('weight 400', () => {
    expect(body).toMatch(/font-weight\s*:\s*400/);
  });
  test('body line-height token', () => {
    expect(body).toMatch(/line-height\s*:\s*var\(--lh-body\)/);
  });
});

describe('V2 March visual utilities — layout primitives', () => {
  test('.prose-max enforces 65ch via --max-prose token', () => {
    const body = ruleBody(GLOBAL_CSS, '.prose-max');
    expect(body).not.toBeNull();
    expect(body).toMatch(/max-width\s*:\s*var\(--max-prose\)/);
  });
  test('.tabular-nums uses mono font + tabular-nums', () => {
    const body = ruleBody(GLOBAL_CSS, '.tabular-nums');
    expect(body).not.toBeNull();
    expect(body).toMatch(/font-family\s*:\s*var\(--font-mono\)/);
    expect(body).toMatch(/font-variant-numeric\s*:\s*tabular-nums/);
  });
  test('.cta-nowrap pins min-width and prevents wrap', () => {
    const body = ruleBody(GLOBAL_CSS, '.cta-nowrap');
    expect(body).not.toBeNull();
    expect(body).toMatch(/white-space\s*:\s*nowrap/);
    expect(body).toMatch(/min-width\s*:\s*8rem/);
  });
});

describe('V2 March visual utilities — section containers', () => {
  test('.grid-lap renders a 12-col grid with token gutters/margins', () => {
    const body = ruleBody(GLOBAL_CSS, '.grid-lap');
    expect(body).not.toBeNull();
    expect(body).toMatch(/display\s*:\s*grid/);
    expect(body).toMatch(
      /grid-template-columns\s*:\s*repeat\(var\(--grid-columns\),\s*1fr\)/,
    );
    expect(body).toMatch(/gap\s*:\s*var\(--grid-gutter\)/);
    expect(body).toMatch(/padding-inline\s*:\s*var\(--grid-margin\)/);
  });
  test('.room is a full-viewport scroll-pin container', () => {
    const body = ruleBody(GLOBAL_CSS, '.room');
    expect(body).not.toBeNull();
    expect(body).toMatch(/position\s*:\s*relative/);
    expect(body).toMatch(/min-height\s*:\s*100vh/);
    expect(body).toMatch(/display\s*:\s*flex/);
    expect(body).toMatch(/flex-direction\s*:\s*column/);
    expect(body).toMatch(/justify-content\s*:\s*center/);
    expect(body).toMatch(/overflow\s*:\s*hidden/);
  });
});
