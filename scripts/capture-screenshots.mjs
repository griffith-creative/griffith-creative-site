#!/usr/bin/env node

/**
 * Capture desktop screenshots of portfolio projects.
 * Usage: npm run capture-screenshots
 *
 * Requires puppeteer to be installed:
 *   npm install --save-dev puppeteer
 */

import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '..', 'public', 'work');

const projects = [
  { slug: 'd-space-studio', url: 'https://www.dspacestudio.com' },
  { slug: 'castle-11', url: 'https://castle11.com' },
  { slug: 'the-rapture', url: 'https://therapturemusic.com' },
  { slug: 'snaptoai', url: 'https://snaptoai.app' },
  { slug: 'nadia-tolar', url: 'https://nadiatolar.com' },
  { slug: 'ms-property-partners', url: 'https://mspropertypartners.com' },
  { slug: 'ca-accounting', url: 'https://ca-accounting-site.vercel.app/' },
  { slug: 'cresset-capital', url: 'https://cressetcapital.com' },
  { slug: 'sbld-lighting', url: 'https://sbld.vercel.app/' },
];

async function main() {
  let puppeteer;
  try {
    puppeteer = await import('puppeteer');
  } catch {
    console.error(
      'puppeteer is not installed. Run:\n  npm install --save-dev puppeteer\nThen re-run this script.'
    );
    process.exit(1);
  }

  await mkdir(outDir, { recursive: true });

  const browser = await puppeteer.default.launch({ headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 900 });

  for (const { slug, url } of projects) {
    const dest = join(outDir, `${slug}.webp`);
    console.log(`Capturing ${url} -> ${dest}`);
    try {
      await page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });
      // Brief pause to let hero images / animations settle
      await new Promise((r) => setTimeout(r, 2000));
      await page.screenshot({ path: dest, type: 'webp', quality: 85 });
      console.log(`  OK`);
    } catch (err) {
      console.error(`  FAILED: ${err.message}`);
    }
  }

  await browser.close();
  console.log('\nDone. Screenshots saved to public/work/');
}

main();
