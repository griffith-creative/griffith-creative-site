---
name: griffith-site-render-traps
description: Two non-obvious render traps in the Griffith site (lazy /work images killing the fade-in reveal, and oversized wordmark type overflowing on mobile) plus the fluid-type pattern used to fix them
metadata:
  type: project
---

Two defects found in the 2026-08-12 render QA of the statement-piece redesign. Both are invisible in code review and only show up in a real browser, so re-check them after any layout change.

**1. `/work` images must keep `width`/`height` attributes.** Without them the six project images (`public/work/*.webp`, all 1440x900) reserve no space, so the page grows as they lazy-load. The `.fade-in` IntersectionObserver in `Base.astro` then fires against a shifting layout and the blocks below the first one never get `.visible` — the page renders as one project followed by a multi-thousand-pixel void. The reveal looks broken but the real cause is the missing intrinsic size.

**2. Oversized display type needs `clamp()`, not breakpoint steps.** `hello@griffithcreative.co` in `font-wordmark` measures ~12.2px of width per 1px of font-size; the hero headlines measure ~11.1px per 1px. Fixed `text-3xl md:text-5xl` / `text-5xl md:text-7xl lg:text-8xl` steps overflow or orphan in the gaps between breakpoints. The pattern that works: pick a `clamp()` whose min equals the intended mobile step and whose max equals the intended desktop step, so mobile and desktop render byte-identical to the locked scale and only the in-between widths change. Currently `clamp(1.25rem,6.4vw,3rem)` for the footer email and `clamp(3rem,8vw,6rem)` for the `/` and `/enterprise` heroes.

**Why:** The site is the PBC pitch surface (see [[griffith-enterprise-positioning]]), and `/work` is the page that carries the proof. A blank portfolio page or a clipped footer address on a phone reads as a broken site, not a statement piece (see [[griffith-site-reads-as-ad]]).

**How to apply:** Verify layout changes in a real browser at 360 / 390 / 768 / 1024 / 1440, not just at the Tailwind breakpoints — 1024 and the 700-900 band are where this system breaks first. When sweeping `/work`, scroll the full page slowly enough that lazy images finish loading before judging the reveal. Known remaining limitation: the work webp assets are only 1440px wide but render at ~1100 CSS px, so they upscale on 2x displays; the root fix is re-capturing them at 2880 via `npm run capture-screenshots`, not shrinking the layout.
