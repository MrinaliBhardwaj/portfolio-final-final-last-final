# Product

## Register

brand

## Users

Recruiters, hiring managers, and design/engineering leads — usually arriving on a
direct link (`#/design` sent with design applications, `#/tech` with engineering
ones), evaluating quickly, often on one visit. Secondary: peers and collaborators
exploring the whole "OS" out of curiosity.

## Product Purpose

Mrinali Bhardwaj's portfolio — one person, two practices. The conceit is "one
void, two realities": a lotus-video cover forks into a Design world (a literal
Figma file) and a Tech world (a literal VS Code buffer), with satellite apps
(Notes scrapbook, Photos dome, Lotus Pond game) on a persistent macOS-style
dock. The site itself is the flagship work sample: it must prove craft in both
disciplines simultaneously.

## Brand Personality

Premium, editorial, distinctive. Cinematic first, precise underneath. The
"apps as worlds" fiction is the voice: each world is art-directed as the tool
that made it, and the visitor is cast as a collaborator inside it.

## Anti-references

- The generic dark-SaaS template look (Linear/Stripe/Vercel clone aesthetics).
- Template portfolio grids (cards of thumbnails with hover zoom).
- Any pattern where the metaphor is decoration rather than load-bearing.

## Design Principles

1. **The metaphor serves the visitor.** App fictions may skin navigation, never
   hide it — wayfinding must survive the costume.
2. **One gesture per meaning.** Each navigation intent (go home, switch world,
   open app) has exactly one consistent affordance, identical in every world.
3. **Worlds diverge, chrome agrees.** Art direction per world is the voice;
   identity (monogram) and wayfinding stay uniform across them.
4. **Show, don't tell.** The site is the resume; every interaction is evidence.
5. **Degrade gracefully.** Reduced motion and weak hardware still get the whole
   story (poster fallbacks, teardown discipline, no rAF left running idle).

## Accessibility & Inclusion

Reduced motion is first-class (`MotionConfig reducedMotion="user"`, static
poster path on the cover, CSS fallbacks). 44px minimum tap targets are an
established convention in the codebase. Interactive elements carry aria-labels;
worlds are deep-linkable hash routes. Target: WCAG 2.1 AA contrast on all
chrome text.
