# griffithcreative.co

Marketing site for Griffith Creative. Astro, Tailwind v4, deployed on Vercel.

## Stack

- Astro (static output) with `@astrojs/vercel` for the one server route
- Tailwind v4 via `@tailwindcss/vite`, tokens in `src/styles/global.css`
- Fonts self-hosted from `public/fonts` (Archivo 800, Inter 400 to 700, IBM Plex Mono 400 and 500)
- Contact form posts to `src/pages/api/contact.ts`, which sends via Resend
- Sitemap from `@astrojs/sitemap`, SEO tags from `astro-seo`

## Environment

Set in Vercel, never committed:

- `RESEND_API_KEY`
- `CONTACT_TO_ADDRESS` (inbox that receives inquiries)
- `CONTACT_FROM_ADDRESS` (verified sender on griffithcreative.co)

## Commands

```
npm install
npm run dev
npm run build
```

## Deploy

Pushes to `main` deploy to production through the Vercel Git integration.

## Layout

- `src/layouts/Base.astro`: head, nav, footer, JSON-LD
- `src/pages/`: one file per route
- `src/assets/work/`: site thumbnails, optimised at build time
- `public/`: icons, fonts, robots, llms.txt
