// @ts-check
import { defineConfig, fontProviders } from 'astro/config';

import tailwindcss from '@tailwindcss/vite';

import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://s.rafifmsn.com',
  vite: {
    plugins: [tailwindcss()]
  },
  fonts: [
      {
        provider: fontProviders.google(),
        name: 'Inter',
        cssVariable: '--font-sans',
        fallbacks: ['ui-sans-serif', 'system-ui', 'sans-serif'],
        display: 'swap',
      },
      {
        provider: fontProviders.google(),
        name: 'JetBrains Mono',
        cssVariable: '--font-mono',
        fallbacks: ['monospace'],
        display: 'swap',
      },
    ],
  integrations: [sitemap()],
  trailingSlash: 'never',
  build: {
    format: 'file',
  },
});