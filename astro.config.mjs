// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

export default defineConfig({
  site: 'https://www.griffithcreative.co',
  output: 'static',
  // Canonical URLs and the sitemap have always been slashed; make it explicit so every
  // internal href points at the canonical form instead of a redirect-free non-canonical hit.
  trailingSlash: 'always',
  adapter: vercel(),
  integrations: [sitemap({ filter: (page) => !page.includes('/contact/thanks') })],
  vite: {
    plugins: [tailwindcss()],
  },
});