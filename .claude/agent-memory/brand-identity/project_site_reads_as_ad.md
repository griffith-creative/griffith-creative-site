---
name: griffith-site-reads-as-ad
description: Owner verdict 2026-08-12 that the Griffith site design reads as an advertisement rather than a statement piece, plus the confirmed structural causes
metadata:
  type: project
---

On 2026-08-12 the owner's verdict on griffithcreative.co was "the whole site feels like the design is an advertisement, not a statement piece." A render-based audit at 1440px confirmed the causes are structural, not identity-level. Identity (dark ink ground, gold #c9a84c) is locked and is NOT the problem.

Confirmed causes, in order of impact:
1. No display typeface — `--font-display` is bound to Inter in `src/styles/global.css`; Archivo 800 is loaded but used only for the wordmark. Every headline is Inter Bold, the default SaaS landing-page face.
2. Nothing full-bleed — every section wrapper is `max-w-6xl` (1152px), so nothing ever touches the viewport edge on any page.
3. The work is the smallest thing on the site — 6 thumbnails at 345x215px, all on /work, which is the shortest page (1827px vs /enterprise at 4292px). No case studies. Five of six pages have zero imagery.
4. Uniform rhythm — every content section is `py-24` (96px) with alternating #0a0a0a / #141414 stripes, so no section outranks another.
5. Gold overloaded — on /home gold does 8 jobs at once (eyebrow, half the H1, card headings, step numbers, list borders, inline link, 3 buttons).
6. Three repeating section units cycled across every page, and an identical centered "big question + subhead + one gold pill" closing block on all six pages.

**Why:** Griffith is pitching Premier Boxing Champions (see [[griffith-enterprise-positioning]]); the site has to read like a studio with a point of view, not a lead-gen funnel.

**How to apply:** Treat these as the standing brief for any Griffith site work. Reference genre is editorial/statement studio sites: large display type, asymmetric grids, one CTA, restraint. Do not propose a rebrand — the palette and wordmark are locked. Worst offender pages are /services then /enterprise.
