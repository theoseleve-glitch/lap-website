import { defineConfig, fontProviders } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import robotsTxt from 'astro-robots-txt';

export default defineConfig({
  site: 'https://lap-coach.racing',
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
    ],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
