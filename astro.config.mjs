import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import robotsTxt from 'astro-robots-txt';

export default defineConfig({
  site: 'https://lap-coach.racing',
  // June-8 rebuild: consolidated IA. Removed pages 301 to the nearest surface
  // so inbound links keep working. (No B2B, no future-dated landings, one /product.)
  redirects: {
    '/for-schools': '/pricing',
    '/launch': '/',
    '/v1': '/',
    '/product/desktop': '/product',
    '/product/mobile': '/product',
    '/product/ios': '/product',
    '/product/bridge': '/product',
    '/product/coaching': '/product',
    '/product/driver-profile': '/product',
  },
  integrations: [sitemap(), robotsTxt()],
  experimental: {
    fonts: [
      {
        provider: fontProviders.google(),
        name: 'Inter',
        cssVariable: '--font-inter',
        weights: [400, 500, 600, 700],
        styles: ['normal'],
        subsets: ['latin'],
        fallbacks: ['system-ui', 'sans-serif'],
      },
      {
        provider: fontProviders.google(),
        name: 'Space Grotesk',
        cssVariable: '--font-space-grotesk',
        weights: [500, 700],
        styles: ['normal'],
        subsets: ['latin'],
        fallbacks: ['Arial Black', 'sans-serif'],
      },
      {
        provider: fontProviders.google(),
        name: 'JetBrains Mono',
        cssVariable: '--font-jetbrains-mono',
        weights: [400, 500],
        styles: ['normal'],
        subsets: ['latin'],
        fallbacks: ['ui-monospace', 'monospace'],
      },
      {
        provider: fontProviders.google(),
        name: 'Space Mono',
        cssVariable: '--font-space-mono',
        // Google Fonts ships Space Mono in 400 + 700 only. We keep 400 (default)
        // and 700 (used for emphasis); skip 500/600 (would auto-substitute).
        weights: [400, 700],
        styles: ['normal'],
        subsets: ['latin'],
        fallbacks: ['Space Mono', 'Fira Code', 'Courier New', 'monospace'],
      },
    ],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
