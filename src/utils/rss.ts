// T196 — RSS 2.0 builder. Hand-rolled (no @astrojs/rss
// dependency) because the cluster is small and bounded
// (≤30 entries for the foreseeable future) and the
// hand-rolled output is easier to test deterministically.
//
// Spec: https://www.rssboard.org/rss-specification
//   * <rss version="2.0"> with xmlns:atom for the self-link
//     element
//   * <channel> with required title, link, description
//   * <atom:link rel="self" href="..."> for feed-discovery
//     compatibility
//   * <item> per post with title, link, description,
//     pubDate (RFC 822), guid

import type { BlogPostIndexEntry } from '../data/blog-index';

export interface RssConfig {
  /** Site origin including trailing slash, e.g. "https://lap-coach.racing/". */
  readonly siteUrl: string;
  /** Feed title (channel title). */
  readonly title: string;
  /** Feed description (channel description). */
  readonly description: string;
  /** Absolute feed URL — used in atom:link self-reference. */
  readonly feedUrl: string;
  /** Optional language code, e.g. "en". Defaults to "en". */
  readonly language?: string;
}

const escapeXml = (s: string): string =>
  s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const formatRfc822 = (isoDate: string): string => {
  // ISO 8601 "YYYY-MM-DD" → RFC 822 "Sun, 26 Apr 2026 00:00:00 GMT"
  const date = new Date(`${isoDate}T00:00:00Z`);
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const months = [
    'Jan',
    'Feb',
    'Mar',
    'Apr',
    'May',
    'Jun',
    'Jul',
    'Aug',
    'Sep',
    'Oct',
    'Nov',
    'Dec',
  ];
  const day = days[date.getUTCDay()];
  const dd = String(date.getUTCDate()).padStart(2, '0');
  const mon = months[date.getUTCMonth()];
  const yyyy = date.getUTCFullYear();
  const hh = String(date.getUTCHours()).padStart(2, '0');
  const mm = String(date.getUTCMinutes()).padStart(2, '0');
  const ss = String(date.getUTCSeconds()).padStart(2, '0');
  return `${day}, ${dd} ${mon} ${yyyy} ${hh}:${mm}:${ss} GMT`;
};

export const buildRssXml = (
  config: RssConfig,
  posts: ReadonlyArray<BlogPostIndexEntry>,
): string => {
  const language = config.language ?? 'en';
  const lastBuildDate = formatRfc822(
    posts.map((p) => p.datePublished).sort().reverse()[0] ?? '2026-04-26',
  );

  const items = posts
    .map((post) => {
      const link = `${config.siteUrl}blog/${post.slug}`;
      return `    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${escapeXml(link)}</link>
      <description>${escapeXml(post.description)}</description>
      <pubDate>${formatRfc822(post.datePublished)}</pubDate>
      <guid isPermaLink="true">${escapeXml(link)}</guid>
    </item>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(config.title)}</title>
    <link>${escapeXml(config.siteUrl)}</link>
    <description>${escapeXml(config.description)}</description>
    <language>${escapeXml(language)}</language>
    <lastBuildDate>${lastBuildDate}</lastBuildDate>
    <atom:link href="${escapeXml(config.feedUrl)}" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
};
