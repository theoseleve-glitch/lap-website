// T196 — contract test for the RSS 2.0 builder + the
// /blog/rss.xml endpoint. Builder utility is decoupled from
// the Astro endpoint so the XML structure is unit-testable
// without invoking Astro's runtime.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';
import { buildRssXml } from '../utils/rss';
import { BLOG_INDEX } from '../data/blog-index';

const ENDPOINT_PATH = join(
  process.cwd(),
  'src',
  'pages',
  'blog',
  'rss.xml.ts',
);

const SITE = 'https://lap-coach.racing/';
const FEED_TITLE = 'LAP — coaching, doctrine, and what we are building';
const FEED_DESCRIPTION =
  'Long-form pillar guides, technique deep-dives, and founder notes.';

const sampleConfig = {
  siteUrl: SITE,
  title: FEED_TITLE,
  description: FEED_DESCRIPTION,
  feedUrl: `${SITE}blog/rss.xml`,
};

describe('T196: RSS 2.0 builder utility', () => {
  test('exports buildRssXml function', () => {
    expect(typeof buildRssXml).toBe('function');
  });

  test('returns a non-empty string', () => {
    const xml = buildRssXml(sampleConfig, BLOG_INDEX);
    expect(typeof xml).toBe('string');
    expect(xml.length).toBeGreaterThan(0);
  });

  test('starts with the XML declaration and uses UTF-8', () => {
    const xml = buildRssXml(sampleConfig, BLOG_INDEX);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
  });

  test('uses RSS 2.0 with atom xmlns for self-link', () => {
    const xml = buildRssXml(sampleConfig, BLOG_INDEX);
    expect(xml).toMatch(/<rss\s+[^>]*version="2\.0"/);
    expect(xml).toMatch(/xmlns:atom="http:\/\/www\.w3\.org\/2005\/Atom"/);
  });

  test('has a <channel> with required title, link, description', () => {
    const xml = buildRssXml(sampleConfig, BLOG_INDEX);
    expect(xml).toMatch(/<channel>/);
    expect(xml).toMatch(new RegExp(`<title>${FEED_TITLE}</title>`));
    expect(xml).toMatch(new RegExp(`<link>${SITE.replace(/\//g, '\\/')}</link>`));
    expect(xml).toMatch(/<description>/);
  });

  test('has an atom:link self-reference pointing at the feed URL', () => {
    const xml = buildRssXml(sampleConfig, BLOG_INDEX);
    expect(xml).toMatch(/<atom:link[^>]*rel="self"/);
    expect(xml).toMatch(/blog\/rss\.xml/);
  });

  test('emits one <item> per post in BLOG_INDEX', () => {
    const xml = buildRssXml(sampleConfig, BLOG_INDEX);
    const itemCount = (xml.match(/<item>/g) ?? []).length;
    expect(itemCount).toBe(BLOG_INDEX.length);
  });

  test('every <item> has title, link, description, pubDate, guid', () => {
    const xml = buildRssXml(sampleConfig, BLOG_INDEX);
    // For every post, find the item block and verify required
    // sub-elements are present.
    for (const post of BLOG_INDEX) {
      const escapedTitle = post.title.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const itemRe = new RegExp(
        `<item>[\\s\\S]*?<title>${escapedTitle}</title>[\\s\\S]*?</item>`,
        'm',
      );
      const match = xml.match(itemRe);
      expect(match, `RSS missing <item> for "${post.slug}"`).not.toBeNull();
      const block = match![0];
      expect(block).toMatch(/<link>[^<]+<\/link>/);
      expect(block).toMatch(/<description>/);
      expect(block).toMatch(/<pubDate>/);
      expect(block).toMatch(/<guid/);
    }
  });

  test('item links point at the absolute /blog/<slug> URL on the site', () => {
    const xml = buildRssXml(sampleConfig, BLOG_INDEX);
    for (const post of BLOG_INDEX) {
      const expectedLink = `${SITE}blog/${post.slug}`;
      expect(xml).toContain(`<link>${expectedLink}</link>`);
    }
  });

  test('item pubDates are in RFC 822 format (RSS spec requirement)', () => {
    const xml = buildRssXml(sampleConfig, BLOG_INDEX);
    const pubDates = xml.match(/<pubDate>([^<]+)<\/pubDate>/g) ?? [];
    expect(pubDates.length).toBeGreaterThan(0);
    // RFC 822: "Sun, 26 Apr 2026 00:00:00 GMT"
    const rfc822Re = /<pubDate>(?:Sun|Mon|Tue|Wed|Thu|Fri|Sat),\s+\d{2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{4}\s+\d{2}:\d{2}:\d{2}\s+(?:GMT|\+\d{4})<\/pubDate>/;
    for (const pd of pubDates) {
      expect(pd, `pubDate not RFC 822: ${pd}`).toMatch(rfc822Re);
    }
  });

  test('escapes XML special characters in title/description content', () => {
    // Synthetic test: a post with & and < in its title must
    // produce escaped output (no raw & or < in the rendered
    // <title> content).
    const synthetic = [
      {
        slug: 'test-escape',
        title: 'Tag & ampersand <bracket>',
        description: 'Desc with "quotes" & special <chars>',
        category: 'pillar' as const,
        tags: ['braking' as const],
        datePublished: '2026-04-26',
      },
    ];
    const xml = buildRssXml(sampleConfig, synthetic);
    expect(xml).toContain('Tag &amp; ampersand &lt;bracket&gt;');
    expect(xml).not.toContain('Tag & ampersand <bracket>');
  });

  test('XML respects ADR-004 + Pillar 2/3/4 forbidden vocab (across all titles + descriptions)', () => {
    const xml = buildRssXml(sampleConfig, BLOG_INDEX).toLowerCase();
    // ADR-004 (asymmetric — spelled-out language-model
    // permitted in description)
    expect(xml).not.toMatch(/\bai\s+coach\b/);
    expect(xml).not.toMatch(/\bllm\b/);
    expect(xml).not.toMatch(/\bgenerative\b/);
    expect(xml).not.toMatch(/\bneural\b/);
    expect(xml).not.toMatch(/\brealistic\b/);
    // Pillar 2/3/4
    expect(xml).not.toMatch(/\bmagic\b/);
    expect(xml).not.toMatch(/\bsecret\b/);
    expect(xml).not.toMatch(/\boutdated\b/);
    expect(xml).not.toMatch(/\bbloated\b/);
    expect(xml).not.toMatch(/\bguru\b/);
    expect(xml).not.toMatch(/\bshortcut\b/);
    expect(xml).not.toMatch(/\bovernight\b/);
    expect(xml).not.toMatch(/\bhack\b/);
  });
});

describe('T196: RSS endpoint at /blog/rss.xml', () => {
  test('endpoint file exists at src/pages/blog/rss.xml.ts', () => {
    expect(() => readFileSync(ENDPOINT_PATH, 'utf8')).not.toThrow();
  });

  test('endpoint exports GET handler', () => {
    const src = readFileSync(ENDPOINT_PATH, 'utf8');
    expect(src).toMatch(/export\s+const\s+GET/);
  });

  test('endpoint imports buildRssXml + BLOG_INDEX', () => {
    const src = readFileSync(ENDPOINT_PATH, 'utf8');
    expect(src).toMatch(/buildRssXml/);
    expect(src).toMatch(/BLOG_INDEX/);
  });

  test('endpoint sets RSS content-type on the response', () => {
    const src = readFileSync(ENDPOINT_PATH, 'utf8');
    expect(src).toMatch(/application\/rss\+xml/);
  });
});
