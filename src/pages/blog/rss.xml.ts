// T196 — RSS endpoint at /blog/rss.xml. Astro endpoint
// that calls the buildRssXml utility against BLOG_INDEX
// and returns the XML with the application/rss+xml
// content-type so feed readers handle it correctly.

import type { APIRoute } from 'astro';
import { buildRssXml } from '../../utils/rss';
import { BLOG_INDEX } from '../../data/blog-index';

const FEED_TITLE = 'LAP — coaching, doctrine, and what we are building';
const FEED_DESCRIPTION =
  'Long-form pillar guides, technique deep-dives drawn from coaching rules, and founder notes on what we are building. Twelve articles in the cluster, organised so each section serves a distinct reading intent.';

export const GET: APIRoute = ({ site }) => {
  const siteUrl = (site ?? new URL('https://lap-coach.racing/')).toString();
  const xml = buildRssXml(
    {
      siteUrl,
      title: FEED_TITLE,
      description: FEED_DESCRIPTION,
      feedUrl: `${siteUrl}blog/rss.xml`,
      language: 'en',
    },
    BLOG_INDEX,
  );
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/rss+xml; charset=utf-8',
    },
  });
};
