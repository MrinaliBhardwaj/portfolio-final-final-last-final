# Design decisions

Decisions that survive rebuilds. Append, don't rewrite history.

## 2026-07-19 — The cover lotus is a FRAME SEQUENCE, never a video again

The hero stuttered on first scroll and only smoothed out after several seconds
of scrolling. Root cause, measured not guessed: **`lotus-bloom.mp4` has exactly
one keyframe for all 241 frames** (`ffprobe -select_streams v:0
-show_entries packet=flags` → a single `K`; GOP = the whole clip, B-pyramid
depth 5, 4 reference frames), and its `moov` box was last in the file. No seek
point after t=0 means seeking mid-clip decodes every preceding frame and
seeking backwards restarts from zero; `moov`-last means nothing could seek
until all 6 MB had landed.

- **Do NOT reintroduce `<video>` scrubbing here.** Codecs are built for
  sequential forward playback; random access is their worst case, and scroll
  scrubbing requests it every frame. This is also why Apple's scroll-driven
  product pages use numbered image sequences on canvas, and why Stripe/Linear
  keep scroll work on transform/opacity + WebGL and let video *play*, never
  scrub. Re-encoding all-intra would have fixed the seeks but kept the 6 MB
  download-before-anything problem and the Safari seek risk.
- **The frames are built, not decoded at runtime.**
  `scripts/build_lotus_frames.py` (ffmpeg + PIL) writes `public/lotus/`. ffmpeg
  is needed THERE and nowhere else — not at build, not at runtime. The source
  clip moved to `assets-src/lotus-bloom.mp4` so it stays regenerable but never
  deploys. Re-run the script if the clip ever changes; don't hand-edit frames.
- **Two tiers, and the atlas is the whole point.** `atlas.webp` (209 KB, all 40
  frames at 480×270) is preloaded in `index.html` so it arrives during HTML
  parse; the instant it decodes the ENTIRE timeline is scrubbable. Full-size
  1600×900 frames stream in behind it and swap per index. Because the atlas
  covers every index from the start there is never a missing frame — which is
  why the old nearest-captured `below()`/`above()` search is gone.
- **Frames are reversed on disk.** `f00` is the top-of-page resting pose,
  pixel-identical to the `lotus-still.webp` poster, so the poster→canvas
  handoff is invisible and there is no `reverse` flag anywhere.
- **Numbers:** payload 5.99 MB → 1.52 MB; bitmap residency 427 MB → 220 MB;
  paint 0.477 ms/frame (2.9 % of a 16.7 ms budget); atlas 63 ms.
  Frame count/resolution are the two memory dials, both constants at the top of
  the script and mirrored in `lotus.js` — **keep them in sync**.
- **The scrub's head boost must not flatten its tail.** The map from scroll
  progress to frame index is eased, because the sequence's head is the source
  clip's static "fully open, holding" tail and a linear map left the flower
  frozen for the first stretch of scroll. The first fix was `r * (2 - r)`, whose
  slope is `2(1-r)` — **zero at the end**. The last of the 40 frames was
  therefore reached at progress 0.887 and held flat for the remaining 11%, which
  on a 320vh track is ~224px: a quarter of a screen of scrolling against a dead
  flower. Fixing the head had quietly relocated the stall to the bottom.
  The boost is now carried by `(1-r)²` — `r + 1.2·r·(1-r)²` — whose value *and*
  slope both vanish at `r = 1`. Head rate is 2.2× (a shade faster than the old
  2×), the tail runs at exactly linear rate, and the final frame lands on the
  final pixel of the track. Verified by hashing the painted canvas while
  walking the last 20%: frames still change at every 2% step to the very bottom,
  last change at y=1980 of 1980 — **zero dead scroll**. Head unchanged: frames
  4/8/14 at 5/10/20% vs the old curve's 4/7/14.
  **Any future easing here needs a non-zero end slope**, or the stall comes back.
- **The name is scaled to fit whatever font ACTUALLY rendered (`--name-fit`).**
  Every number tuning the cover name — the 13vw size, the measured 13.79vw ink
  ceiling, the em-based drop — is tuned to Ballet + Pinyon, and the moment a
  different face renders those numbers are wrong. The failure is silent and
  ugly: the name is `white-space: nowrap` inside a stage that is
  `overflow: hidden`, so text that is too wide is not wrapped or scaled, it is
  **sheared at the viewport edge**. Segoe Script — the fallback that paints
  while the webfonts load, and permanently if they fail — lays out ~30% wider
  and overflowed at **every** width from 1024 to 1600; at 1366 it ran 241px
  past the budget and cut 204px off "hardwaj", taking the j and its dot with it.
  `Cover.jsx` now measures the rendered name and sets `--name-fit`, a multiplier
  on `--name-fs`. Verified: real font holds `--name-fit: 1` and byte-identical
  font-sizes (185.25px at 1440, 131.17px at 1024) so the tuned design is
  untouched; the fallback scales to ~0.85 and clears both edges by 23px at every
  width; the value returns to 1 when the real font lands, so it cannot compound.
  **The budget is the STAGE minus the hero's padding, never the h1's own box** —
  the hero is `width: fit-content`, so the h1 shrink-wraps its own text and its
  `clientWidth` *is* the ink width by definition; comparing those two can only
  come out equal and lets rounding decide, which spuriously shrank the name by
  0.55% before this was corrected.
  **Measure TRUE GLYPH INK, never the layout boxes.** These faces do not stay
  inside their advance: at 185px the M paints 128px past its own advance and
  "hardwaj" 19px past its. `getBoundingClientRect()`/Range report the boxes, and
  said the name cleared the stage by 89px when the ink cleared it by 57px — a
  32px lie, in the direction that hides a clip. Canvas `measureText`'s
  `actualBoundingBoxLeft/Right` is the only thing here that reports where paint
  actually lands, and it resolves against the real loaded face. The fit also
  solves about the **centre**, not the width: the ink is asymmetric (the M leads
  with a swash, the j trails with one), so a name that fits on width can still
  push one end through an edge.
  Note this also means **`<img>`-loaded SVG is useless for measuring this** — that
  is a separate document with no access to the page's `@font-face`, so it
  silently rasterises the fallback. It reported an 8.71x ink ratio (Segoe's)
  where the real face is 6.73x. That false measurement is what cleared the ink
  mask of blame the first time round; the mask was in fact the culprit (below).
- **The name carries `padding-inline: 0.5em` / `margin-inline: -0.5em` so the
  ink mask has something to cover.** The `.is-inked` mask clips to the h1's box,
  and these faces paint outside theirs — the M's leading swash starts ~5px left
  of the box, the j's trailing flourish runs ~21px past its right edge (at
  font-size 185px, and both are underestimates). The mask erased exactly those
  two ends: `mask-repeat` is `repeat`, so paint left of the box samples the
  PREVIOUS tile's transparent tail and the M's swash tip vanished outright,
  while the opaque run reaches only 101.2% of the box (46% of a 220% tile) so
  the j's flourish faded out past x = box.left + 1.012·width.
  Padding grows the mask box (`mask-origin` is border-box); the matching
  negative margin keeps layout identical, parent shrink-to-fit included, since
  the margin box is `width + 0.5em − 0.5em`. Verified: font-size, hero position
  and every ink coordinate are unchanged, only the mask box moved (89.2 → −3.4
  on the left, opaque edge 1350.4 → 1445.3 against ink ending at 1356.3).
  **This is a clipping bug that no amount of resizing reveals** — it is fixed to
  the element's own box, so it reproduces identically at every width. Do not
  chase it with `--name-fs` or `--name-drop`.
- **The skills frame carries a pointer-reactive halftone field**
  (`InteractiveDots.jsx`, adapted from a Next/Tailwind/TS snippet). Skills was
  the one frame that is just a word list; the field gives it something to do
  without adding copy. Pink, the design world's own accent. Four changes were
  required to make the snippet safe here, none cosmetic:
  it is **scoped to its own box** (the original sized to `window.innerWidth/
  Height` and read `clientX/clientY` as canvas coordinates — correct only for a
  full-viewport hero, wrong size AND offset by the frame's page position here);
  it **cancels its rAF** (the original's cleanup never did, so every mount
  leaked a permanent loop, and the design world unmounts on every route change);
  it **pauses off screen** via IntersectionObserver; and it honours
  `prefers-reduced-motion` with one static field. The noise also advances on
  SECONDS rather than frame count, which otherwise ran twice as fast on a 120Hz
  screen. Clipping is a wrapper, not `overflow: hidden` on `.cvf-body` — the
  frame's handles sit outside that box, the same trap `#dw-contact` documents.
- **Latent bug found while verifying:** if layout hasn't run when the effect
  commits (hidden tab, or a commit before first layout) both cover canvases
  sized to 0×0 and only a later window resize rescued them. Both now size via
  `ResizeObserver` with a zero-size guard. A `resize` listener alone cannot
  catch this.
- **The cover runs ONE rAF.** The starfield used to own a second, competing
  loop; it now exposes `step(dt)` and the scrub loop drives it. It also honours
  DPR (it built from `innerWidth`, so dots were drawn at 1× and stretched) and
  batches into one fill per opacity bucket. Honest result: frame time is
  unchanged at ~0.43 ms — the batching win was spent on 2.2× the pixels, i.e.
  sharpness, not speed.
- **The Dock's `backdrop-filter` was investigated and deliberately left alone.**
  The suspicion was a mid-scroll layer promotion when it surfaces at progress
  0.77, but the Dock is always mounted (`initial={false}`, animated via
  transform/opacity, never unmounted), so there is nothing to promote. A
  permanent `will-change: backdrop-filter` would cost more than it saves.
- **Verifying the cover needs a harness.** The preview pane is hidden, so vsync
  `requestAnimationFrame` never fires and CSS transitions never advance there —
  a canvas will read `opacity: 0` and blank pixels even when the code is
  correct. Shim `requestAnimationFrame` onto a timer, import the real module,
  drive it, and read pixels back. See [[reports-need-proof]].

## 2026-07-19 — Engagement pass on experience/work (follow-up, same day)

She asked for more visual life in the two frames (via /ui-ux-pro-max; its CLI
database isn't installed, so its inline rules were applied: 60ms stagger,
transform/opacity-only motion, hover as enhancement). All inside the approved
slate/cream/pink system — no new colors, no new type:

- **The thread's dots are now Figma VECTOR ANCHORS** — 8px white squares with a
  slate stroke, the newest role pink-filled (the "selected" anchor). The
  timeline literally reads as a pen-tool path in her file.
- **Work panels are layered fields, not flat slate**: diagonal slate gradient +
  the canvas's dot-grid motif + a soft pink corner glow (corner varies per card
  for rhythm). Hover deepens via a `::after` overlay at z1 (multi-backgrounds
  can't transition); chip/name/arrow sit at z2 so they stay crisp.
- **Each panel carries a faint wireframe GHOST** (`PanelSketch` in
  DesignWorld.jsx, cream strokes at 14%): web+mobile pair for Public Pulse, a
  phone for Meal Maestro, mark+wordmark+component-diamond for Futurepreneurs.
  Ghosts drift ~5px on hover. When real case-study shots arrive they replace
  the ghosts, not the chip/name/arrow.
- Entries and cards stagger in at 60ms via whileInView (matches the codebase's
  existing Frame reveal; MotionConfig reducedMotion="user" covers it).
- VERIFICATION GOTCHA (pane, not code): the hidden Browser pane suspends
  IntersectionObserver entirely — whileInView content stays at opacity 0 there.
  Force `style.opacity=1` on `.dw-card/.dw-exp` to screenshot these frames
  headlessly.

## 2026-07-19 — Experience/work rebuilt in the approved voice; one type system

Her brief: she's satisfied with the DESIGN of profile, skills, leadership and
contact, and the TYPOGRAPHY of profile + contact. Align experience +
selected-work to those, make them engaging, unify type everywhere, and make
every work clickable.

**The shared type system** (anchor: the profile poster + contact card):
- Frame headings (`.dw-h2`): **Inter Light 300, sentence case** — the poster's
  "Experience"/"Skill Set" heads scaled up. The Archivo-850-UPPERCASE heads are
  DEAD; don't bring back uppercase tracking.
- Entries: **Helvetica stack (`--hv`, now defined on `.dw`** — moved up from
  `.dwh` so every frame shares it): bold 700 titles, light 300 metadata.
- Body: Inter ~380 at 0.86rem/1.62.
- Ink on light frames: the profile's **slate `#4a4a58`** (scoped via
  `#dw-exp/#dw-work .cvf-body`), not the near-black board ink.
- Accent: **pink only** (`--dw-pink`); the kpi chip text is `#b0447c` (pink
  deepened to hold AA on cream). Vermilion no longer appears in these frames.
- Skills/leadership DESIGNS untouched — only their type aligned (chips → 400,
  leadership h3 → Helvetica 700).

**Experience = "the thread":** one hairline across the frame with a dot per
role, newest first, the newest dot pink — the profile poster's rule-connector
motif at frame scale. On mobile the thread turns vertical down the left margin
(dots beside entries). Pure CSS (`::before` on grid + entries).

**Selected work = clickable artboards:** each card is ONE `<a>`
(`target=_blank`): slate `#4a4a58` visual panel with the project name in the
contact card's display voice (Archivo 900, lowercase), pink tag chip pinned
top-left, hover deepens the panel + slides in the ↗ + lifts the name 3px;
below, Helvetica name/meta + Inter blurb + a "View project" hairline-underline
row (the contact card's link gesture). Focus ring is Figma selection blue
(on-fiction). **All three hrefs are her Behance PROFILE as placeholders — she
still owes the real per-project URLs** (swap them in the `work` array's `href`
field in `DesignWorld.jsx`). When real case-study shots arrive, the name-panel
keeps the tag/arrow and gains the image.

## 2026-07-19 — Design hero asset-extraction gotchas (fixing the first pass)

The first hero pass shipped three wrong assets; she caught them. All three were
extraction mistakes, not layout mistakes (the `--u` geometry was already exact).
Recorded so the next Figma port doesn't repeat them:

- **The background was the WRONG IMAGE** — I pasted the bg asset URL from my
  FIRST `get_design_context` call (node `4:3`, the "Rasyad Alfin" moodboard
  screenshot) instead of the one from the real frame's call. The correct bg is
  node `208:259` (the painterly water-lily pond). Lesson: never carry an asset
  URL across `get_design_context` calls; each call's URLs belong to THAT node.
  `download_assets` on `208:259` returns it frame-clipped to 1316×741, so it's
  placed at `(0,0,1316,741)`, not the node's raw `(-372,0,1696,950)`.
- **`download_assets` composites node exports over the frame's fill (#4A4A58).**
  So the "as placed" exports of the folder icon and the software strip came back
  with an opaque dark-slate background — the "logos have a background" bug. Two
  fixes by asset type: the **folder** is opaque, so key out the slate by colour
  distance and re-composite over the sheet cream (`out = P + (cream−slate)·(1−α)`,
  α = dist/85) → sharp 257px folder-on-cream, reused ×3, seamless on the sheet.
  The **software tiles are semi-transparent** (they pick up the backdrop), so
  keying can't reconstruct them — instead crop them straight from the full-frame
  render (`get_screenshot` of 208:260), where Figma already composited them over
  cream. Same trick for the **tab** (crop at its exact spot; the painting baked
  into the crop realigns with the real painting). Anything sitting on a known
  flat backdrop can be cropped-in-place from the render and dropped back
  seamlessly. The "Softwares" label is part of that crop now (no separate span).

## 2026-07-19 — The design hero IS her real Figma frame (PROFILE.DOC)

Her brief: copy the Figma "profile" frame EXACTLY into code, and make it replace
the design world's old hero ("Designs it in Figma. Ships it in code."). The
fiction tightens — the design world is "her portfolio as an open Figma file,"
so the hero is now literally one of her frames.

- **Source:** file `drda7TnqoM3fEpbibCDIc2`, node `208:260` ("Frame 19"), a
  fixed **1316×741** poster. Pulled via the Figma MCP (`get_design_context` +
  `get_metadata`). NOTE: her first link pointed at node `4:3`, which is a
  moodboard screenshot of *someone else's* portfolio ("Rasyad Alfin") on the
  file's one page ("inspo") — not her design. The real frame is `208:260`.
- **Figma connector auth:** she's on a **student Full seat** (her own team
  `mrinali.bhardwaj2023's team`); `whoami` confirms it. Code Connect is gated
  (needs org/enterprise) but `get_design_context` / `download_assets` work.
- **Exact repro via `--u`, same as the scrapbook scenes.** `DesignHero.jsx`
  places every element at its real Figma-space pixel through `U(n) = calc(n *
  var(--u))`, `--u = 100cqw/1316` set on `.dwh`; the hero artboard
  (`.cvf--poster .cvf-body`) is a fixed-aspect query container. Verified in
  browser: sheet 55,67 1206×607, name 210,106, tab 7,0, tiger 922,318, etc. all
  land pixel-exact. DON'T hand-tune these numbers.
- **Assets vendored under `public/design-hero/`** (downloaded from the Figma
  asset API — the URLs expire in ~7 days, so the bytes are committed, never
  hot-linked): `bg-pond.png` (painted lotus-pond bg, bleeds + is clipped by the
  frame), `mini-mri.png` (childhood photo, bleeds off the sheet's lower-left),
  `tiger.png`, `flourish.png`, `softwares.png` (the four-tile strip, ONE image),
  `folder.png` (macOS folder, ONE export reused ×3), `profile-tab.png`.
  Re-fetch from the frame if she changes the design.
- **Two assets were re-exported "as placed" (nodes 208:267, 208:307)**, not as
  raw uploads: the tab's raw source is a 1024×683 image whose visible tab is a
  ~396×70 crop — placing the raw at the 396×109 node box distorted it. The
  placed-node export is already the trimmed 396×70 tab, bottom-aligned so it
  rests flush at the frame top (top ≈ 0). Softwares likewise re-exported to its
  exact 286×191 box. `softwares.png` was also downscaled (raw was 1536×1024,
  2.2MB → 91KB) for her slow machine.
- **KNOWN, flag to her: the tab reads "PROFTLE.DOC"** — a typo for
  "PROFILE.DOC", baked into her asset (same class as the "Thanke you" letter
  typo). Can't fix in code; alt text says the correct "PROFILE.DOC". Awaiting a
  corrected export if she wants it.
- **Fonts:** Inter (`--font-ui`, already loaded) for Meet/intro/headings/labels/
  download; **Pinyon Script** (already vendored) for the script name; a
  Helvetica→Arial stack for the experience/education entries (Helvetica renders
  as Arial on Windows anyway). No new font package needed.
- **The pinned Figma comment was removed from the hero** — it collided with the
  new "Download Resume" at the top-right, and "copy exactly" means her frame's
  content only. The Figma-file selection chrome (label/ring/handles/dims pill)
  still wraps the frame, and `FRAMES[0]` now reports 1316×741 / fill #4A4A58
  with layer children PROFILE.DOC / experience / skill-set / softwares /
  education — the layers + properties panels track the new hero automatically.
- **Old hero copy retired** (the Archivo "Designs it in Figma…" headline + stat
  chips). "Download Resume ↓" → `/resume-design.docx`.
- **NOT done (follow-up): true mobile reflow.** <768px the poster just scales
  down proportionally (via `--u`), so text gets small but nothing breaks or
  overflows. The planned stacked-column mobile layout is still open.

## 2026-07-18 — Contact envelope: one true-transparent PNG, bottom-centre

Final form of the contact art, superseding the two-cutout + 3-layer-tuck build
in the entry below. She supplied a single combined image (envelope + letter
already tucked) as a **true transparent PNG** — `public/contact-envelope.png`
(1351×902 after bbox-crop). No more separate letter, no CSS tuck, no keying:
it's one `<img class="dwc-env-photo">` floating on the cream.

- **`public/contact-letter.png` is deleted**; the `.dwc-letter` /
  `.dwc-envelope--front` layers and their front-pocket clip are gone. The note
  text is baked into the image → it lives in the `<img alt>`.
- **Positioned bottom-centre** (desktop poster): `left 452u / bottom 20u /
  width 786u` in the 1690×950 stage — horizontally centred, anchored to the
  floor, clearing the top-left contact cluster and "and that's", overlapping
  only "a wrap." (black type reads fine over the pink). Mobile: just an item in
  the stack.
- **GOTCHA that cost a round-trip: an earlier export of this image was a
  flattened transparency *preview*** — fully opaque with the grey/white
  checkerboard baked in as pixels. It's unkeyable: the white letter and the
  white/grey checker are the same brightness with no edge between, so any flood
  threshold that clears the checker also eats the letter's exposed top. The fix
  was to get a **real** transparent PNG (alpha 0 background), not a screenshot
  of the checkerboard preview. If a future asset shows a checker, check
  `getbbox`/alpha before trying to key — ask for a true-transparent or
  solid-non-white-background export instead.

## 2026-07-18 — Contact envelope is now REAL photo assets, not CSS

She supplied two of her own images — a pink opened envelope and a torn,
crumpled, ruled note with the sign-off already handwritten on it — and said
"use exactly these assets." So the whole CSS-drawn envelope + note (flap-seam
peak, torn-edge clip-path, Kalam ink) is **removed and superseded**; this
supersedes the Kalam half of the "Two handwriting voices" entry below —
**Kalam is uninstalled**; Caveat still stands alone for the `#/notes`
scrapbook. Details:

- **Assets live in `public/contact-envelope.png` + `public/contact-letter.png`**,
  keyed out of their solid-white backgrounds to transparent so they float on
  the cream. The keyer is `scratchpad/keyout.py` (Pillow, border-connected
  flood-fill only, sentinel-magenta → alpha 0, then bbox-crop) — envelope
  thresh 90, letter thresh 30 (white bg vs warm paper is a tiny delta; the
  torn-edge shadow stops the fill). Sources were the two newest
  `Downloads/ChatGPT Image Jul 18 …` PNGs. Re-run the script if she sends new
  versions; don't hand-edit the PNGs.
- **The letter tucks INTO the envelope via a 3rd layer**: the envelope image is
  drawn twice — full behind the letter (z1), and again `clip-path: inset(54% 0
  0 0)` above the letter (z3) so only its front pocket overlays the note's foot.
  Same image at the same box position, so the clip line is a seamless cut. The
  letter sits between (z2), tilted −2.5°.
- **The note text is baked into the image**, so it can't be selected — it lives
  in the letter `<img alt>` for accessibility/SEO. If the copy changes she must
  regenerate the image.
- **KNOWN, flagged to her: the letter image reads "Thanke you" (typo)** and
  "appreciate new opportunities". Baked into her asset; can't fix in code —
  awaiting a corrected image if she wants it.
- Layout mechanics unchanged: still the `--u` poster ≥768px / stacked <768px,
  `.dwc-env` just frames the two images (width%/height:auto keeps each aspect).

## 2026-07-18 — One navigation system: monogram = home, × = close, tabs only switch

An IA/UX audit (register: brand; snapshot in `.impeccable/critique/`) found the
worlds were strong but the connective tissue was fragmented — the site's real
weakness was wayfinding, not looks. Fixed the three P1s into ONE contract, the
same gesture-per-meaning in every world:

- **The `mb` monogram is home, everywhere.** Top-left, always a live control
  linking `#/` (on the cover it's a button that lifts you back to the top).
  It's SKINNED per world but never restyled at random: script Pinyon on the
  void/paper surfaces (cover, gallery, pond, notes), a plain UI `mb` in the two
  IDE title bars. Same letters, same corner, same destination. The satellites'
  monograms were decorative `<span>`s — now `<a href="#/">`. Don't turn any of
  them back into dead text; the logo-as-home is the through-line.
- **One `×` = close the app → the void.** `WorldTabs` gained a single close at
  the far right of the title bar, and the **per-tab `×` is gone**: closing a
  document shouldn't eject you from the editor. Satellites keep their own close.
- **Tabs only switch design ↔ tech.** `WorldTabs` is now the shared title bar
  in both flagship worlds: `[ mb ] [ design.fig ][ tech.jsx ] ...... [ × ]`.
  Labels are `design.fig` / `tech.jsx` in BOTH chromes now (the Figma bar used
  to say plain "design"/"tech") — the filenames are the charm, and matching
  them killed the "positioning of design.fig/tech.jsx changes between sections"
  complaint.
- **One switcher, not three.** `FigmaPanel`'s Pages list is **display-only**
  now (rendered as `<div>`s, no hover, no nav) — it says "one file, two pages"
  but doesn't compete with the tabs. Design → tech has a single in-fiction path
  (the tabs) plus the global dock. Don't re-wire the Pages list to navigate.
- **The cover has exactly two entry systems.** The redundant top-nav
  design/tech text links are **deleted**; the Explore CTAs are the narrative
  primary, the dock is the system layer. Also fixed the dead cover GitHub link
  (`href="#"` → github.com/MrinaliBhardwaj).
- **Desktop vs mobile home split (flagship worlds).** `WorldTabs` hides ≤768px,
  so on mobile each flagship's in-content header (`dw-top` / `tw-top`) carries
  the monogram home; on desktop the title-bar `mb` does, and `dw-mark` is
  `display:none` above 768 so there's never a double home. Keep the 768/769
  boundary aligned with the tab strip's.
- Removed the design world's THIRD home path (the footer "Back to the start").
- NOT done here (deferred P2/P3): the Claude dock icon still renders but does
  nothing (remove or wire it), no dock hover name-tags yet, gallery images are
  still Unsplash placeholders.

## 2026-07-18 — Two handwriting voices: Kalam (design) vs Caveat (Notes)

The design world's contact envelope was rebuilt to match her reference art
exactly (opened flap-seam peak behind the note, hand-torn top edge on the
lined paper, wrinkle-creases, the note pulled out of a brighter front pocket).

- **The note's hand is Kalam, not Caveat, on purpose.** The reference sign-off
  is an *upright print* handwriting; Caveat (the Notes scrapbook's pencil) is a
  looser slanted cursive and reads wrong for it. So the portfolio now runs two
  deliberately different handwriting faces: **Kalam = the design world's ink
  note**, **Caveat = the `#/notes` scrapbook**. Don't collapse them to one.
- **Kalam sets ~15% wider than Caveat**, so porting text between the two hands
  overflows — the envelope note had to grow and drop to ~3.05cqw to fit. If you
  ever re-flow that note, re-check it doesn't clip behind the front pocket
  (measure `scrollHeight > clientHeight`).
- Content stayed real (her email/links) and clean (mockup typos fixed) — only
  the drawing and the hand were copied from the reference. See the contact
  finale entry below for the poster/`--u` mechanics.

## 2026-07-17 — The Notes app: the scrapbook comes back from the dead

Her brief: a Notes app in the dock between VS Code and Photos, holding the
first-draft story — design side first, scrolling into the tech side.

- **What the content actually is.** My first pass filled Notes with
  `_archive/`'s `DesignSide.jsx`/`EngineeringSide.jsx` and she rejected it:
  she meant the **"meet mini mri" scrapbook** — page one, the design origin
  story (eleven years old, a camera, two polaroids, milestones from "first
  video" to "600 followers"); page two, the tech story desk collage. Different,
  earlier draft. `_archive/` never held it.
- **It was recovered from session transcripts, not rewritten.** `Scene.jsx`,
  `SceneTwo.jsx` + their CSS were written 25–26 June 2026 and deleted in the
  lotus rebuild BEFORE `git init` (9 July) — they appear in **no commit**;
  `git log --all` for those paths is empty. They were reconstructed by parsing
  `~/.claude/projects/**/*.jsonl`, replaying each file's Write→Edit chain in
  timestamp order, and checking the result against the full-file **Read
  snapshots** taken 1 July. Four of the files replayed byte-identical to their
  snapshot, which is why this is a restoration and not a guess. **The
  transcripts are the only copy — treat `Scene.jsx`/`SceneTwo.jsx` as
  artifacts.** Don't "improve" the art; the magic numbers are Figma-space
  coordinates on a fixed stage (`--u` converts them) and moving one drifts the
  collage. The recovery script pattern is worth repeating if anything else
  pre-git is ever wanted back.
- **`public/tech-discovery.png` survived on disk** and is page two's
  centerpiece (the pencil wireframe flow). `public/hero/` textures survived too.
- **Notes is the portfolio's one LIGHT world**, paper `#f4f1e8`. Every other
  world is dark; the scrapbook is paper and Apple Notes is paper, so the app
  and its contents agree rather than fight. Its wipe + `data-world` bg match.
- **The PROFILE tabs became real navigation.** `onOpen` used to open the
  retired `ArchivePanel` drawer. That profile is a real destination now, so
  page one's `PROFILE.TXT` + "pull for profile" open `#/design` and page two's
  `PROFILE.DOC` opens `#/tech` — the same gesture, and each story hands off to
  the world it grew into. The drawer itself was NOT restored.
- **GOTCHA — `DomeGallery.css` ships an UNSCOPED `.stage`** (`height:100%;
  display:grid; contain:layout paint size`). It is vendored verbatim and must
  not be edited, and it silently won here: my `.stage` rule never declared
  `display`/`contain`, so size containment collapsed the sheet to 0×0 and paint
  containment clipped the collage away — **a blank sheet of paper with the art
  laid out invisibly inside it**. Fixed by renaming mine to `.nw-stage`. Any
  future world must avoid the bare class names DomeGallery exports.
- **The dock forced the art's size.** These collages are fixed-aspect, so
  nothing can be padded clear of the floating dock from the inside — at rest
  the dock sat on the closing line of BOTH stories. Each stage is therefore
  capped at `available height x aspect` via `--nw-chrome: 172px` (toolbar 44 +
  pad 24 + dock strip 104). Keep `--nw-chrome`, the two aspect multipliers
  (1.7782 = 1700/956, 1.3814 = 1485/1075) and the sheet padding in step.
- **`@fontsource/caveat` added** — the whole scrapbook is handwriting, and
  without it `cursive` falls back to **Comic Sans** on Windows.

## 2026-07-16 — The cursor gets its name tag; the hero frame turns pink

Follow-up to the entry below, same day. Her brief: attach a rounded "Mrinali"
label to the cursor, delete the orange named cursor on the first frame, and
make that frame's accent pink instead of orange.

- **The file now has exactly ONE collaborator cursor: the visitor's.** The
  drifting vermilion `.dw-cur` on the hero is DELETED (markup, CSS, keyframes,
  and its mobile `display:none`). Once the real pointer wore the same arrow,
  a second one loitering nearby read as a duplicate rather than as company.
  Don't reintroduce it — if the file needs to feel populated, that's a
  different idea, not this one.
- **Only the LABEL is DOM (`DesignCursor.jsx`); the arrow stays a CSS
  cursor.** This split is the whole trick and it matters: the OS draws the
  arrow, so it can never lag the pointer and it survives with JS off. A DOM
  arrow would trail by a frame and feel broken. The tag is allowed to trail —
  it eases at 0.18/frame — because a real Figma name tag does exactly that.
  Do NOT "fix" the lag, and do NOT convert the arrow to DOM to match.
- **The rAF loop SLEEPS when the tag catches up** (< 0.05px), waking on
  pointermove. Her machine is slow; an always-on rAF behind an idle pointer
  on every design-world visit is not acceptable. Verified: converges exactly,
  43 frames, then zero queued frames.
- **`DesignCursor` is mounted by `App` beside the `Dock`, not by
  `DesignWorld`.** Two reasons: the cursor is world-scoped so it covers the
  dock, and its tag must too (z-index 70 vs dock's 60); and inside the route
  wrapper, AnimatePresence's opacity/will-change stacking context would trap
  the tag under the dock. Gated on `pointerType === "mouse"` — touch and pen
  leave no cursor to label.
- **The hero frame rebinds the token: `#dw-hero { --dw-accent: var(--dw-pink) }`.**
  Rebinding on the frame — not repainting each rule — means everything
  accented inside the hero follows automatically (the italic "code.", the
  comment pin's dot). Scoped to the FIRST frame only, per the brief: every
  other frame keeps vermilion, and the leadership frame is still a solid
  `--dw-accent` field. `--dw-pink` is a real token in `index.css` now, but the
  cursor SVGs still can't read it (see below) — keep them in sync by hand.

## 2026-07-16 — The design world has its own cursor: you are a collaborator

Her brief: replace the default cursor inside the Design section only, with
something inspired by Figma's cursor, in soft pink (`#F472B6`).

- **The conceit, not just the color.** The pointer wears the SAME arrow
  silhouette as the drifting `mrinali` collaborator cursor already on the
  canvas (`.dw-cur`, vermilion `--dw-accent`) — the path is literally the
  same geometry, scaled. The visitor is soft pink; she is vermilion. Two
  people in one Figma file, rather than a cursor plus an unrelated
  decoration. If the collaborator's arrow ever changes, change both.
- **Clickable things gain Figma's component diamond** — the app's own glyph
  for "this is an instance". It's a silhouette change, so it still reads at
  24px where a hue shift wouldn't. Deliberately not a hand: Figma's canvas
  has no hand cursor.
- **Prose keeps the arrow — no I-beam.** That's Figma canvas behavior and
  it's the point of the conceit. `::selection` is already styled, so text
  selection still gives feedback. Don't "fix" this.
- **Scoped to `html[data-world="design"]`, not `.dw`.** The dock is an OS
  layer rendered outside `.dw` by `App.jsx`; scoping to `.dw` would snap the
  cursor back to the system arrow the moment you crossed onto the dock,
  which reads as a bug. While the design world is open, you are a
  collaborator everywhere on screen. Other worlds are untouched (verified:
  tech/gallery/cover/pond all still `auto`/`pointer`, and the pond keeps its
  `cursor: none`).
- **Two inline SVG data URIs in `design-world.css`.** A cursor image can't
  reference a CSS var, so the pink is literal inside each URI (3 occurrences
  total) — retune there, not in a token. Each arrow is stroked TWICE: a dark
  contour under a white-rimmed pink body, because it has to survive the
  #1E1E1E canvas, the #F6F5F2 artboards AND the #E23A16 frame. On the light
  artboard the white rim vanishes and the dark contour carries it; on the
  dark canvas the reverse. Drop either stroke and it dies on one surface.
  Hotspot is `3 2` (the arrow tip) — wrong hotspot = every click misses.
- **Wrapped in `@media (pointer: fine)`**: touch ignores cursors anyway, and
  this keeps hybrid devices from loading it.

## 2026-07-15 — The Game app is the frog: Lotus Pond replaces The Pond

Mrinali's call: remove the existing game-section work and put the frog game
there. "The frog game" is **github.com/MrinaliBhardwaj/froggie** — *Lotus
Pond · Mrinali's Pet Frog*, a finished 5-phase pixel-art frog diorama (night
pond, a procedurally-drawn frog that hops lily-pad to lily-pad catching
*programmer*-bugs — Null Pointer, Memory Leak, Merge Conflict, Syntax
Beetle, 404, Infinite Loop — synthesised audio, no score/timer/failure).

- **STILL WATER is archived, not deleted** — branch `pond-still-water`
  (`e155dcb`) holds the parallel session's uncommitted WIP. The five Pond
  commits stay in main's history. Nothing was destroyed.
- **VENDORED, NOT PORTED.** froggie is 46 files / ~5k lines with **zero
  runtime deps and zero assets** (sprites are char grids, audio is
  synthesised). It lives at `src/froggie/`, dropped in whole. Do not rewrite
  its engine, scene or art.
- **TypeScript is a deliberate, scoped exception** to the no-TS decision.
  Vite transpiles `.ts` natively via esbuild — no plugin needed. froggie's
  own `tsconfig.json` is copied verbatim (strict, noUnusedLocals,
  verbatimModuleSyntax) but `include`d to `src/froggie` only, so the
  portfolio's own code stays plain JSX. `npm run typecheck` keeps the game's
  bar. Porting 5k working lines to JS to honour the rule *was* the rebuild.
- **The engine gained real teardown** — the one thing standalone froggie
  never needed (it owned the whole page). Mounted on a route it must let go:
  `Game.dispose()` (stops the loop + drops the `visibilitychange` listener,
  which would otherwise resurrect a detached canvas), `Renderer.dispose()` /
  `Input.dispose()` (window listeners), and `Ambience.suspend()` +
  `uninstallUnlock()`. **Without the audio teardown the ambient bed and
  cricket timers follow the visitor into #/tech.** This also makes the
  StrictMode double-mount safe. Keep all of it if froggie is ever re-synced.
- **React owns the info panel** (upstream it was static markup in froggie's
  `index.html`; `ui/Panel.ts` is dropped). It stays in sync with the in-game
  "m" mute key via the new `Ambience.onMuteChange` hook. Chrome follows the
  gallery convention: monogram left, 44px close right, no centre label —
  the panel already names the piece.
- **Headless verification convention restored**: `Game.stepOnce(dt)` +
  `window.__pond.step/snap` (dev-only) + the `/__pond-shot` vite middleware.
  A hidden browser tab never fires rAF, so the pond must be stepped by hand
  and read back. Corollary learned here: framer-motion's `AnimatePresence`
  exit is also rAF-driven, so **routes never unmount in a hidden pane** —
  test teardown against `dispose()` directly, not by navigating.
- Dropped **29.5 MB** of vendored MediaPipe wasm + `hand_landmarker.task`
  and the `@mediapipe/tasks-vision` dep. The frog needs no camera, so the
  consent ritual is gone too. Route/title = "Lotus Pond"; wipe + `data-world`
  bg moved to froggie's deep sky `#0b0f1e`.

## 2026-07-15 — Tech page: simulate the IDE, not the file

Mrinali's call: the literal-code page prioritized authenticity over
communication — everything had the same visual weight, recruiters had to
*parse* instead of scan. The fix keeps the VS Code fiction but uses the
editor's own reading aids as the typographic hierarchy ("this is code, but
it has been art-directed"):

- **README renders as Markdown preview** — real Inter typography, big H1,
  shields-style badges (gh/in/cv/@), gold blockquote CTA, and the
  `import { craft } from "../design"` joke as a fenced code block.
- **CodeLens headlines**: each entry gets a proportional Inter h3 on an
  un-numbered line (`.ln--lens`, `counter-increment: none`) — role · org +
  dim tag + date/repo right-aligned. Sticky at 61px (tabs 35 + crumbs 26)
  like VS Code sticky scroll; top: 0 on mobile.
- **Impact pills**: ONE gold inlay-hint chip per entry (`--tw-gold
  #e7d391`) — the buffer's only saturated accent. Stack = quiet teal chips,
  skills = neutral chips.
- **Syntax LOWLIGHTED**: `--syn-*` re-tinted so color tracks importance,
  not grammar — punctuation/quotes/keys/keywords whisper (#4b4f55 range),
  content strings bright (#e3cdb7). Quotes render as punctuation via the
  `Str` component. Never revert to full-salience Dark+.
- **Real code folds**: detail/proof bullets behind `detail: [ ⋯ ],` lines —
  gutter chevron appears on hover, ⋯ box toggles, expanded detail is a dim
  level (`.tk-s--dim`). Whole career fits one viewport collapsed.
- Identity lives in the lens; visible code lines carry only NEW info
  (impact / work / detail keys). education.md folded into the README lede.
- Status bar: `Portfolio Lens ✓` replaces Prettier — the fictional
  extension "rendering" the page.

## 2026-07-12 — Design & tech pages rebuilt as literal Figma / VS Code

Both world pages redesigned from resume content (design .docx + tech .pdf,
both vendored to `public/resume-design.docx` + `public/resume-tech.pdf`).

- **DESIGN = an open Figma FILE.** The page is the `#1E1E1E` dotted canvas;
  content lives on light `#F6F5F2` artboard **frames** (`.cvf`), each with a
  frame-name label. Scroll-spy / layer-click SELECTS a frame — real Figma
  selection chrome: `#0D99FF` ring, four corner handles, a dimension pill
  (`1440 × 640`). Left = layers panel (`FigmaPanel`), right = a NEW
  **properties panel** (`.dwp`, ≥1100px) showing X/Y/W/H + fill of the
  selected frame. A drifting collaborator cursor + a pinned comment sell it.
  Two special frames: one dark (`--dark`), one vermilion (`--accent`).
  Font: Inter (`--font-ui`) for chrome, Archivo display for the hero H1.
- **TECH = an open VS Code BUFFER.** The page IS the editor: activity bar
  (48px `#333`), explorer (`#252526`), editor tabs, breadcrumbs, a continuous
  line-number **gutter**, Dark+ syntax (`--syn-*`), and the `#007ACC` status
  bar with a **live `Ln N`** synced to the active section. Content reads as
  code: README.md intro, `experience.ts` / `projects.ts` as typed objects,
  `skills.json`, `education.md`, `.env` contact — links are clickable code.
  Font: JetBrains Mono buffer, Inter chrome. The phosphor-green terminal look
  is DEAD (tokens `--tw-*` flipped to VS Code Dark+; selection `#264F78`).
- **Shared:** both pages use `useSectionSpy` (unchanged hook; hardened so a
  click already-in-view can't freeze it — always-on timeout fallback beside
  scrollend). New font `@fontsource-variable/inter`. GitHub is real now:
  github.com/MrinaliBhardwaj.

## 2026-07-12 — Design world goes Figma DARK (light mode is dead)

- **The design side is authentic Figma dark UI now**: canvas `#1E1E1E`,
  panel/toolbar surfaces `#2C2C2C`, near-black panel divider `#1a1a1a`,
  selection `#0D99FF` at 25% with white text, light greys for chrome text
  (`#e5e5e5` / `#c4c4c4` / `#b3b3b3` / `#8c8c8c`). Tokens flipped in
  `index.css` (`--dw-*`, plus new `--dw-panel`, `--dw-panel-line`,
  `--dw-blue`); design entry wipe is `#1e1e1e`.
- **The gallery-light cream palette (`#f4f3f0`) is DEAD** — do not restore.
  The vermilion accent (`#e23a16`) survives as the *content's* accent — it's
  the design work living on the canvas; the chrome never uses it.
- **Canvas texture**: the paper grain overlay was removed; `.dw-content`
  carries Figma's subtle dot grid instead (24px radial-gradient dots,
  white @ 5%), scrolling with the content like a panning canvas.
- All Figma brand marks on the design side retinted `d0d0d0` for dark
  (tab bar app mark + tab icon, panel file row, Tools chip).

## 2026-07-12 — The Pond (Game app): UNDERTOW

- **The dock's Game icon is now The Pond**, `#/pond` (alias `#/game`) — an
  interactive installation, not a page. Concept: *agree with your reflection*.
  The lotus above the waterline is the design world (soft, lit); its
  reflection below is the tech world (phosphor wireframe) and disobeys — lags,
  wanders, glitches. One hand in each world held in true mirror symmetry
  raises sync; the waterline fills gold from the centre (the meter IS the
  waterline); ~4s of held agreement blooms both lotuses as one. Wins persist:
  `pond:agreements` tally + one floating mote per win (`pond:motes`, cap 48).
- **The lotus is 3D and fully procedural** (`src/pond/lotus3d.js`) — no asset,
  no three.js. Petals are parametric surfaces (arc-bent spine, cupped cross
  section, rippled edge, veins/crease/blush in the fragment shader) posed in
  the vertex shader, so bloom/sway/lean animate as uniforms. One buffer holds
  petals (4 rings), pod, stamens, stem, lily pad; redrawn smaller as a side
  bud and a far bud. Rendered twice per frame to small FBOs: lit + phosphor
  wireframe. A Sketchfab model was considered and rejected: static mesh
  (can't bloom), Fab-store licence, photoreal-asset-in-shader-world collage
  risk.
- **Renderer** (`src/pond/gl.js`): raw WebGL2, three passes — ripple
  heightfield (ping-pong RG16F, quarter-res), lotus scene, fullscreen
  composite (void + mist above; water + faithful dim reflection + disobedient
  wireframe below; waterline meter; persistent motes; hand/ghost reticles;
  grain/vignette). Tier ladder steps down (dpr, lotus FBO res, sim res, grain)
  when frame time slips; never steps back up. Pauses on hidden tab; dispose
  releases GL objects but must NOT loseContext() (React strict-mode remounts
  reuse the canvas).
- **Hand tracking**: MediaPipe HandLandmarker, vendored under
  `public/mediapipe/wasm` + `public/models/hand_landmarker.task` (no runtime
  external URLs, same rule as the lotus video), lazy-imported only after the
  visitor consents. The camera ask is staged as part of the piece ("the pond
  would like to see your hands" / "let it look" / "keep them hidden");
  decline or no camera falls back to pointer mode (cursor = dragonfly) with a
  synthesized mirror partner. The partner rewards slow *tracing*, not
  parking: a still hand bores it (wander grows), gentle movement lets it
  catch up. One-handed camera visitors get the synth partner after ~12s.
- **Dev verification**: `#/pond?sim` (+`?hud`) — no webcam needed. `w` (or
  `window.__pond.agree(true)`) forces a perfect mirror; `window.__pond`
  exposes `step(n)` / `snap()` because a hidden Browser-pane tab never fires
  rAF. `snap()` POSTs to the dev-only `/__pond-shot` vite middleware which
  writes `pond-shot.png` (gitignored) for headless screenshot review.
- **Template-literal GLSL rule**: never use backticks inside GLSL comments —
  they terminate the JS template string (cost two debugging rounds).
- **The scene is a mystical lake at night** (second pass, same day): moon
  (mottled disc + halo, upper right) laying a glitter path on the water,
  twinkling two-depth starfield, faint nebula, low treeline silhouette on the
  far shore (mirrored dark under the line), seven ambient fireflies, water
  micro-waves so it never sits dead-still, and depth-blurred (mip LOD)
  faithful reflections. All procedural in the composite shader — no textures.
- **The game is a three-act ritual** (one mechanic — mirroring — escalating):
  act I *meet it* (cover the pulsing gold ring below with your second self),
  act II *lead it* (cup the guide firefly in the upper hand and carry it home
  while staying mirrored; it settles on the lotus heart), act III *hold it*
  (the old hold, but the reflection throws two 1.6s "doubt surges" — glitch
  storms + trembling waterline — you hold through). The waterline meter fills
  one third per act. Long-idle resets to act I. `?sim` + `w` still walks all
  three acts automatically (forceMirror auto-cups the firefly).

## 2026-07-12 — The Pond, third pass: STILL WATER (the game is dead)

- **PIVOT (user brief): the pond is an art installation, not a game.** No
  instructions, HUDs, meters, objectives or win states anywhere on screen.
  Visitors should leave thinking they saw something magical, not that they
  played something. All prior act/meter/surge/caption/tally machinery was
  DELETED (do not resurrect). Dev HUD survives only behind `?hud`/`?sim`.
- **Photoreal hero via ASSET, not procedural** (user directive: "do not spend
  time generating flowers procedurally"): the filmed lotus-bloom clip
  (`public/lotus-bloom.mp4`, also the cover) IS the pond's flower.
  `src/pond/flower.js` decodes the clip's bloom segment (36%→97% — the clip
  is edited footage; the first third is a separate beauty shot) into ~44
  ImageBitmaps (same strided-seek trick as `src/lotus.js`) and serves the
  frame matching bloom progress as a GL texture. Luminance-keyed over the
  night (its blacks dissolve), border-faded so no rectangle ever shows,
  mirrored + ripple-bent + depth-smeared for the reflection. NOTE:
  `UNPACK_FLIP_Y_WEBGL` is ignored for ImageBitmap uploads — flip v in the
  shader.
- **Cinematic post pass is what killed the "PS2 demo" look**: scene renders
  to an FBO with mips, then post = mip-chain bloom (halation), horizontal
  anamorphic streaks, ACES-ish curve, teal-shadow/warm-highlight grade,
  vignette, grain. Also: fog-bank far shore (no hard cutouts), hazy moon
  behind slow cloud, moon glitter path on the water, water micro-waves.
- **Moments, not gameplay** (`src/pond/game.js` is now a presence engine):
  · the flower leans toward whoever is here; fireflies gather around hands
  · THE moment (user's pick): a lotus of pure light forms between two raised
    palms (`src/pond/spirit.js`, additive point cloud + palm-to-palm thread)
    — apart = elongates, together = condenses, wrists = rotation, crossing
    past a half-turn = petals fold inside-out
  · released, the light sinks into the water and the REAL flower opens one
    breath further (persisted at `pond:bloom`; every offering leaves a mote
    at the waterline, `pond:motes` — silent memory, never explained)
  · pointer fallback: press-and-hold gathers the same spirit at the cursor
  · long stillness: the reflection de-renders into phosphor for a breath
    (the tech-world whisper — subtle, centered, never full-screen static)
- Sim harness: `__pond.hands([{x,y},…])`, `__pond.hold(x,y,down)`,
  `__pond.step(n)`, `__pond.snap()`.

## 2026-07-12 — The Gallery app (dome)

- **The dock's Gallery icon is now a real destination**, `#/gallery`, wired
  exactly like Figma→design and VS Code→tech. It's a third dock "app," not a
  placeholder (Claude/Game remain placeholders).
- **It hosts React Bits' `DomeGallery`** (JS+CSS variant, `@use-gesture/react`)
  — a draggable 3D dome of image tiles, click-to-enlarge. The component
  (`DomeGallery.jsx` + `.css`) is dropped in **verbatim**; do not rewrite its
  interaction/enlarge logic. It's wrapped by `GalleryWorld.jsx` /
  `gallery-world.css`, which gives it a fixed full-viewport void-dark stage
  (`#05040a`), passes the same colour as `overlayBlurColor` so the dome's
  radial fade dissolves into the page edges, and adds minimal chrome
  (Pinyon "mb" monogram, "GALLERY" label, a 44px close → cover). Props follow
  the reference: minRadius 500, maxVerticalRotationDeg 20, segments 30,
  dragDampening 3.8, grayscale false.
- **Chrome-over-dome layering:** `.gw-stage` gets its own stacking context
  (`z-index:0`) so the dome's internal `z-index:9999` enlarge overlay stays
  contained; the gallery chrome sits above at `z-index:10`. The dock (App,
  fixed) still floats above everything as the OS layer.
- **Images are placeholders** (6 Unsplash) — TODO: swap for real work, ideally
  vendored to `public/` like the lotus video to drop the external-URL risk.

## 2026-07-10 — The OS-layer navigation model

- **The dock is persistent chrome, not a cover effect.** It lives in `App.jsx`
  above the routes: surfaces on the cover once the divergence settles
  (scroll progress > 0.66, reported by `Cover` via `onSettledChange`), and is
  always present inside both worlds. A macOS-style dot under Figma/VS Code
  marks the open world; clicking the open app scrolls to top; clicking the
  other app switches worlds directly (quick crossfade — the wipe ceremony is
  reserved for launching from the cover).
- **Worlds open like tabs on desktop.** Each world carries a native tab strip
  (`WorldTabs.jsx`): VS Code editor tabs on tech (sticky, in the content area,
  `design.fig` / `tech.jsx`, green top-accent on the active tab), Figma file
  tabs on design (fixed full-width bar above the panel, plain names). The ×
  on the active tab returns to the cover. Tabs are hidden ≤768px — the dock
  alone carries switching on mobile.
- **Each world's chrome speaks its own app; the content keeps the world's
  palette.** Tech chrome = VS Code (explorer sidebar, editor tabs). Design
  chrome = Figma (`FigmaPanel.jsx`: white panel, Pages list with the two
  worlds — current one checked — then the page's sections as Frame layers
  with text/image/component children). The panel deliberately uses Figma's
  own selection blue, not the vermilion accent: it's the app's chrome, not
  the portfolio's canvas.
- **One scroll-spy, shared.** `useSectionSpy.js` (top-line crossing +
  bottom-pin + click-hold) drives both the tech explorer and the design
  layers panel. Don't fork this logic again.
- **Tech's desktop header nav is hidden** (≥769px): the explorer + tabs are
  the navigation there; the button row returns on mobile where both are
  hidden.
- **Dock magnification is per-icon CSS scale in place** (1.35×, centred, the
  source component's elastic easing `cubic-bezier(0.175, 0.885, 0.32, 2.2)`
  kept verbatim per the reference) — no neighbor falloff, no lift, the bar
  never moves. Confirmed direction; don't reintroduce distance physics.

## Earlier (already established, recorded for inheritance)

- One void, two realities: lotus-video cover forks into `#/design` (gallery
  light) and `#/tech` (phosphor dark). Journal/book/tear concepts are dead.
- Plain React + Vite + hand-written CSS. No Tailwind, no shadcn, no
  TypeScript — pasted components get PORTED into this stack, preserving
  their behavior/filters, never installed alongside it.
- Lotus scrubbing = pre-decoded frame cache (`lotus.js`), never live
  `video.currentTime` seeking. `overflow-x: clip` (never `hidden`) on
  html/body or the sticky stage breaks.

## 2026-07-16 — The lotus plays in reverse; the cover paints in one frame

Her brief: reverse the blooming-lotus scrub, make first paint instant, and
keep it premium AND lightweight. All of it lives in the frame-cache scrubber
(`lotus.js`) — the mp4 file itself is untouched (no ffmpeg on this machine).

- **The scrub is REVERSED via the `reverse` option, not a re-encoded file.**
  Progress is mirrored (`1 - p`) before frame mapping, fallback seeks, and
  the reduced-motion pose. The cover now rests fully bloomed at the top,
  folds to a bud mid-scroll, and re-blooms into the Design/Tech split. The
  narrative beats in `Cover.jsx` survived reversal unchanged — don't retune
  them.
- **`public/lotus-still.webp` (50KB, 1920×1080) is the clip's FINAL frame,**
  captured in-browser from the mp4. It's preloaded in `index.html` and is the
  first thing painted — the lotus is on screen before a single video byte
  arrives. If the clip is ever replaced, REGENERATE this still from the new
  clip's last frame (seek to duration−0.05, canvas → WebP q0.85).
- **The clip crosses the network exactly ONCE.** The visible fallback
  `<video>` is srcless in JSX; `lotus.js` feeds it the same blob URL the
  extractor decodes. Don't put `src`/`preload` back on the JSX element —
  that doubles the 6.3MB download. The fetch aborts if the visitor leaves
  the cover mid-download.
- **The fallback video is HIDDEN until it sits on a frame that was actually
  requested** (its natural frame 0 is, reversed, the wrong end of the arc).
  Reveal happens only via `seeked` or an in-position check. Reduced-motion
  visitors get the poster only — no download, no decode.
- **Scrub smoothness = crossfade between adjacent cached frames** (two
  drawImage calls, GPU-cheap) plus the final frame captured in the FIRST
  strided pass (a stride walk from 0 never lands on index count−1 naturally;
  reversed, that frame is the resting pose everyone sees first).

## Design world: selected work is artboards ON the canvas (replaces the slate-panel cards)

She rejected the slate-panel card grid ("i dont like the design â€” be creative").
The replacement leans all the way into the file fiction:

- **The selected-work frame's body IS a window of Figma canvas** â€” same
  `#1E1E1E` + dot grid as the page (`#dw-work .cvf-body`). Each project sits
  on it as its own light `--dw-board` artboard, not a card.
- **Boards are labelled in her real file-naming voice** â€” `publicpulse-v12`,
  `meal-maestro-final`, `futurepreneurs-final-FINAL(2)` â€” the repo-name joke
  (`portfolio-final-final-last-final`) made canon. The layers panel lists the
  same filenames (FRAMES[2].children, icon "frame"; fill now #1E1E1E).
- **Awards are numbered Figma comment pins** (pink dot 1/2/3, sharp corner
  bottom-left, white note ALWAYS open â€” social proof is not a hover surprise).
  The old pink tag chip is gone.
- **Hover = selecting the board**: tilt (âˆ’1.1Â° / 1.6Â° / âˆ’0.6Â°, applied to
  `.dw-board-art` so framer-motion's transform on the <a> never conflicts)
  straightens to 0Â°, blue ring + corner handles + dims pill appear, label
  turns selection blue â€” identical chrome to the section frames.
- **Dims pills carry believable per-board dims** matching the real aspect:
  1440Ã—900 (16/10 lg), 1080Ã—1350 (4/5 sm portrait), 1920Ã—720 (8/3 wide).
- **Sketches are the artboard content now, not ghosts**: slate strokes at
  0.5 on cream, one pink element per board (CTA / card / component diamond +
  colour chips). Display name is Archivo 900 lowercase in slate; on the wide
  board it right-aligns to clear the left-side sketch.
- **Scatter, not grid**: lg cols 1-7, sm cols 9-12 dropped 3.5rem (col 8 of
  canvas stays empty), wide cols 2-11. Mobile: full-width stack, wide board
  relaxes to 16/10.
- Meta text under each board is the "annotation next to a frame" voice:
  Helvetica bold name, light meta, dim ink on canvas, "View project â†—".

### Refinement: selected work is a SECTION, comment pins expand on hover only

- **Selected-work is no longer a frame** â€” it's a bare `<section class="dw-work-section">`
  (transparent, `min-width:0`), so the three project artboards float directly
  on the page's own #1E1E1E canvas + dot grid. The outer artboard box, its
  frame-name label, and its own blue selection ring are gone. In Figma terms
  it's now a SECTION grouping three frames, not a frame-inside-a-frame. It
  keeps `id="dw-work"` so scroll-spy / nav / the layers + props panels still
  track it; only the on-canvas chrome was dropped.
- **Comment pins collapse by default** â€” only the numbered pink dot shows;
  the white note (`.dw-board-pin-note`, the award) expands on
  `.dw-board:hover/:focus-visible`, same reveal gesture as the hero `.cvf-pin`.
  Previously the notes were always-open; that read as permanent captions and
  cluttered the resting state.

## Worlds open like macOS app windows (retires the slide-wipe)

- Launching a world no longer plays the sliding colored **wipe** slab. That
  read as "sliding in," which isn't how an app opens. Instead each world
  **grows out of the dock icon that launched it**, macOS-style: it scales up
  from ~0.3 with its `transform-origin` set to the exact clicked point
  (captured on a capture-phase `pointerdown`), opacity resolving fast so it
  reads as a growing window, not a fade. Duration 0.42s, ease-out-expo.
- `choose()` is now plain navigation; the `entering`/`navigated`/`WIPE_BG`
  wipe machinery is gone. Cover CTAs and dock icons both just set the hash and
  let `WorldWindow`'s grow-open carry the transition.
- **The grow's pin is load-bearing.** While opening, `.world-window` is
  `position: fixed; inset: 0` so the worlds' `position: fixed` chrome (tab
  bar, tech sidebars/status bar, the fully-fixed gallery/pond stages) resolves
  against the viewport and scales as one pane. A transformed ancestor is the
  containing block for fixed descendants; unpinned they'd resolve against the
  document box and collapse. The pin (and any transform/will-change) is force-
  cleared in CSS the instant it settles — nothing that creates a containing
  block may survive, or every fixed element in the world breaks.
- **Never gate visibility on the animation.** The settled state is forced in
  CSS (`opacity:1 !important`) with a 700ms timeout fallback, so a tab that
  never fires rAF (backgrounded / headless) can't strand a world blank,
  pinned and unscrollable. Dock stays at `z-index:60`, in front of the grow.

## Design hero reflows on mobile (the poster only shrank)

- The profile hero is an exact 1316×741 Figma artboard placed in Figma-space
  coordinates via `--u` (= 100cqw/1316). Scaled to a phone that made every
  layer shrink together — body text rendered at ~4px, unreadable. A mobile
  audit of all six routes found this was the ONLY genuinely broken surface;
  cover / tech / gallery / notes / pond already adapt with no overflow.
- Fix: below 768px the CSS hides every poster layer (`.dwh > :not(.dwh-m)`)
  and shows `.dwh-m`, a flowed, readable version of the SAME content (shared
  `INTRO` const + the existing EXPERIENCE/EDUCATION/SKILLS arrays) on the
  poster's own cream sheet — photo, script name, intro, resume, then stacked
  Experience / Skill-set chips / Softwares crop / Education. The desktop
  poster is untouched; the two are a hard 768px swap, same pattern as the
  contact frame.
- Gotcha baked in: the poster's base rule `.dwh img { position:absolute }`
  also caught the reflow's images and pulled them out of flow — the mobile
  block resets `.dwh-m img { position: static }`.

## Phone view of the design world IS Figma mobile

- Below 768px the desktop chrome (fixed Figma tab bar, layers panel,
  properties panel) all disappeared, leaving the world's own header as two
  floating links — the world stopped reading as an app. It now reads as the
  Figma MOBILE app instead: `.dw-top` becomes a sticky 48px `--dw-panel`
  toolbar with the same hairline the panels use, carrying home ("mb"), the
  open file ("design.fig" behind the Figma glyph), a **Layers** button, and
  Say hello as an envelope icon. Desktop is untouched — every mobile part is
  `display:none` above 768 and the toolbar falls back to static/transparent.
- **The layers panel is now reachable on a phone.** Instead of
  `.fp { display:none }`, the same panel becomes a bottom SHEET: it slides up
  from the toolbar's Layers button over a scrim, with a grab-pill that doubles
  as its close button. Same tree, same scroll-spy, same tap-to-jump — and
  picking a layer dismisses the sheet (`pick` in FigmaPanel) so the tree never
  covers the frame you just chose. Escape and the scrim both close it.
  z-index: scrim 65, sheet 70 — over the dock (60).
- **Comment threads open on TAP.** They were hover-only, so on a phone the
  notes were simply `display:none` — the pins were decoration you couldn't
  read. `useTapNote` (DesignWorld) toggles an `.is-open` class, which is the
  tap twin of every `:hover` rule the pins already had. First tap opens and
  swallows the click; second tap follows the hero pin's mailto (its note says
  "say hello") but only CLOSES a board pin, since the board's own link would
  otherwise fling you to Behance mid-read. A pointerdown anywhere else closes.
  Both pins anchor to the frame's LEFT edge on mobile and the card is capped
  to `min(230px, 100vw - 6.5rem)` so it can't hang off the screen. Dots draw
  at 30–32px but take taps at 44 via an inset `::after`.
- **The monogram was in the wrong face.** `.dw-mark` was heavy Archivo caps
  ("MB") — Archivo is the DISPLAY type, which belongs to the content, not the
  chrome. This world's monogram is the one on its own title bar
  (`.wt-home`): Inter, 700, lowercase "mb". Same badge either way now.

## The tech world wears her ID badge (vendored Lanyard)

- The `lanyard` project (Downloads/lanyard, and on her GitHub) — rope physics
  in rapier + a meshline band + a GLB card — is vendored into the tech world
  per its own HANDOVER.md, NOT rebuilt. The physics tuning and the sizing math
  are the artifact: the card face is 1.6 x 2.25 world units and drei maps px to
  world as `px * distanceFactor / 400`, so the 320x450 overlay at
  `distanceFactor={2}` gives 320*2/400 = 1.6. Don't change one of those numbers
  without the other.
- **Placement**: fixed to the viewport's top-right, `z-index: 31` — UNDER the
  editor tab strip (35) and OVER the breadcrumbs (30). The band runs up off the
  top of frame and vanishes behind the chrome, so the badge reads as hooked
  over the editor rather than floating, and the tab strip's × stays clickable
  in the corner.
- **Pointer passthrough (the load-bearing bit).** A `<canvas>` eats every click
  in its box, and this box hangs over the buffer's right gutter — measured, it
  covered 9 real interactive elements at 1440px (the CodeLens `repo` links and
  the `detail:`/`proof:` expanders scrolling under it). So the canvas is
  `pointer-events: none` by default and the frame loop projects the card to
  screen space each frame, promoting it to `auto` ONLY while the cursor is
  actually over the card. Drag/fling are untouched; the rest of the gutter
  stays clickable. Do not "simplify" this away.
- **Gated hard** (TechLanyard.jsx): desktop only
  (`min-width:1280px and pointer:fine`), off under `prefers-reduced-motion` (a
  badge that never stops swaying is the exact thing that setting asks us not to
  do), lazy-loaded via `React.lazy` so the ~1MB-gzip three/rapier/drei chunk
  stays out of the entry bundle, and `frameloop="never"` while the tab is
  backgrounded so the rope sim isn't burning a core behind another window.
- ~~**No webcam.**~~ **Reversed 2026-07-25 — see the entry below.** (Original
  reasoning, kept for the record: a public portfolio firing a camera-permission
  prompt at a stranger is a bad first impression, and the filter is the single
  most expensive thing in the scene.)
- **Class names namespaced.** The source card used bare `.label`, `.value`,
  `.card-header`, `.card-body` — global names this project would collide with
  eventually (the DomeGallery `.stage` lesson). All `dvb-` prefixed now.
- Copy is her real tech identity ("SOFTWARE ENGINEER", matching README.md in
  the buffer behind it). The source card said "JUNIOR DEVELOPER", which
  contradicted her own page, and carried a fabricated ID number — both gone.

## The badge reflects you, and it's nailed to the page, not the screen (2026-07-25)

Three corrections to the lanyard, all hers.

- **The webcam is back on, and it's the point.** `DevBadge` requests
  `getUserMedia` on mount and pushes the feed through the
  feTurbulence/feDisplacementMap filter, so the card mirrors whoever is reading
  it. My earlier call to cut it was overruled. What keeps it defensible: the
  request only ever fires where `TechLanyard` mounts (`#/tech`, ≥1280px,
  motion allowed), refusal is a no-op (the dark base *is* the fallback), the
  capture is 320×240 because it lands under a 12px blur anyway, and the
  source's `glassDistortion` tail — erode → blur → a second displacement —
  is deleted, since it ran at `scale: 0` and produced no pixels for five
  filter primitives of cost.
- **The hook is pinned to the DOCUMENT, not the viewport.** Every frame the
  anchor is lifted by however far the page has scrolled
  (`scrolled / viewport.factor`), so the badge rides up and away with the
  buffer instead of hovering over it. The step is clamped to 0.8 world units
  per frame: a jump-to-top would otherwise hand rapier a velocity of several
  screens per frame and crack the card like a whip. The anchor is
  `kinematicPosition` rather than `fixed` so it can be driven — and rapier
  reading its implied velocity through the rope is *why the badge sways when
  you scroll*. That sway is a feature; don't damp it out.
- **The canvas is the whole viewport.** A canvas clips at its own edge, so the
  old 300×700 corner box amputated the card the moment you flung it. Where it
  hangs is now decided in world units inside the scene (`home` in Lanyard.jsx),
  not by CSS. Camera z went 20 → 25 to hold the rendered card at ~230px, since
  going full-screen would otherwise have doubled its size.
- **`pointer-events` needs `!important` and it needs the `*`.** This one bit.
  `pointer-events: none` on an ancestor does NOT protect a descendant that sets
  `auto` on itself — and `<Canvas>` renders two wrapper divs of its own, the
  outer one with `pointer-events: auto` written INLINE. Styling only
  `.lanyard-wrapper` left them live: measured, **27 of 33 interactive elements
  on the tech world were unclickable**. Fix is
  `.lanyard-wrapper, .lanyard-wrapper *:not(canvas) { pointer-events: none !important }`
  — the `:not(canvas)` is deliberate, so the frame loop's inline `auto` can
  still promote the canvas alone over the card. Verified: 20/20 on-screen
  targets clickable, 0 blocked. This was latent in the corner-box version too;
  full-screen just made it total. **Do not relax this rule.**

## The badge's camera survives StrictMode, and its veil is shaped, not flat (2026-07-27)

- **One camera, refcounted at module scope.** `<React.StrictMode>` runs every
  effect twice in dev (mount → cleanup → mount), so a per-component
  `getUserMedia` fires two calls whose tracks share one physical camera — and
  call one's cleanup stops a track call two is still displaying. Black card, dev
  only, nothing on screen explaining it. `CAM` in `DevBadge.jsx` is one shared
  promise with a refcount and a **500ms deferred release**, so the instant
  remount reuses the stream but leaving `#/tech` really does hand the camera
  back. Holding a webcam open after you navigate away is the creepy behaviour
  this feature exists to avoid. Proven against the shipped source: one prompt
  for a double-mount, track still live, released 500ms after real unmount.
- **`autoplay` is not enough.** It's unreliable when `srcObject` is attached
  *after* the element already ran its autoplay algorithm against no source. Call
  `play()` explicitly; muted playback needs no gesture.
- **Never swallow the camera error.** An empty `.catch()` makes a denied
  permission look identical to a bug. Dev logs `err.name`, which *is* the
  diagnosis: `NotAllowedError` = blocked (sticky per origin), `NotFoundError` =
  no camera, `NotReadableError` = another app holds it.
- **The veil over the feed is a gradient, and its stops are measured.** Flat
  alpha can't serve both jobs: white text over a bright-room feed needs alpha
  ≥ 0.55 for WCAG AA, but 0.55 crushes the reflection back to invisible — while
  the 0.1 that makes the mirror sing drops the text to **1.43:1**. So the scrim
  is dark only where text lives (header 6–14%, name/role 65–76%, footer 82–94%
  of the 450px card) and 0.12 across the open 26–52% band, which is where the
  reflection reads anyway. Every layer now measures ≥ 4.5:1 in a bright room
  while the window keeps 88% of the feed. `.dvb-role` 0.7 → 0.82 and `.dvb-k`
  0.6 → 0.76 are the *minimum* dimming that still passes at their sizes and
  positions. **If you move `.dvb-body`, move the gradient stops with it.**

## Notes runs full-bleed, and the scrapbook stops asking you to pull a tab (2026-07-27)

> **The first bullet is SUPERSEDED** — see "One sheet, one viewport" (2026-08-03)
> at the end of this file. The height cap it removes here has been restored, by
> request. The rest of this entry still stands.

- **The collages fill the page width.** They were capped twice over — by their
  native size *and* by `available height x aspect`, so each sheet would fit in
  exactly one viewport. Height won every time, because a fixed-aspect collage
  can only obey one master. Measured at 1425x900: page one rendered 1295px and
  page two **1006px, wasting 210px of page on each side**. The height term is
  gone; the px caps are now each scene's native size (1700 / 1485) so the art
  goes edge to edge on any normal screen and never upscales past 1:1.
  A sheet taller than the viewport just scrolls — which is what you were already
  doing between the two pages. The 104px bottom padding still clears the dock.
- **The PROFILE.TXT / PROFILE.DOC file tabs and both "pull for profile" pencil
  notes are removed.** This retires the hand-off recorded above (the scrapbook's
  tabs opening #/design and #/tech): the scrapbook is something you read now,
  and the dock is the way out of it. `onOpen` went with them — they were its
  only callers — as did `useTapNote`-style click plumbing in the scenes.
- **This edits `Scene.jsx` / `SceneTwo.jsx`, which are RECOVERED artifacts.**
  The standing rule is not to touch them; this was an explicit request, so it is
  logged here rather than done quietly. **Only the two openers were removed — no
  Figma-space coordinate was touched**, so the collage art is still the
  reconstructed original.

## The lanyard is born in the right place, and the badge stops blinking (2026-07-27)

- **Rapier reads a body's `position` only at creation, so the rig must not mount
  before it knows where the hook goes.** Two separate ways it was getting born
  wrong, both healing themselves *in view* via the anchor walk:
  1. `home` was computed WITHOUT the scroll term the frame loop's `target`
     carries, so on a page restored mid-scroll the rig started at the
     top-of-document anchor. Measured: scrollY 1200 = 8 world units = 10 frames
     of travel; scrollY 2600 = 22 frames.
  2. If `viewport.width` was still 0 on first render, every body was created at
     the world ORIGIN — screen centre — 5.88 units from home, 7 frames (~117ms).
  Fixes: `<BandWhenPlaced>` gates the rig on a measured viewport, and `home`
  now carries the scroll term. **The birth expression and the frame loop's
  target must stay textually identical** — there's a test that asserts exactly
  that by parsing both out of the file.
- **`history.scrollRestoration = "manual"`.** App force-scrolls to top on every
  route change, so the browser's own restore was both redundant and a race we
  lost: on back/forward it re-applied the old scroll *after* mount, which no
  amount of correct birth positioning can survive.
- **Never `occlude` a drei `<Html>` against the mesh it's glued to.** The badge
  face is a DOM plane 0.04 in front of the card, and `occlude={[cardMesh]}`
  raycast it against the card's own surface — a coin flip once the card tilts,
  so the badge blinked out mid-drag. It showed up on a RIGHTWARD pull because
  the hook sits at the right edge, so pulling that way swings the card through
  edge-on rather than just stretching the rope. Replaced with a dot product in
  the frame loop: the face shows while the card's local +Z points at the camera.
  Flips exactly once, and correctly at ~80 degrees rather than 90 — the badge
  hangs off-axis, so it turns edge-on to the *camera* first. That parallax is
  what the ray got wrong.

## Nothing that measures itself may mount during a world's zoom-open (2026-07-27)

- **The lanyard dropped in the wrong place when you NAVIGATED to #/tech, but was
  correct on reload.** That asymmetry was the whole clue. `WorldWindow` grows a
  world from `scale: 0.3` to 1 over 420ms, and — as App.jsx's own comment says —
  a transformed ancestor is the containing block for its fixed-position
  descendants. `.tw-lanyard` is `position: fixed; inset: 0`, so mid-zoom it
  measures the SCALED box. Measured directly in the browser: a fixed `inset: 0`
  child of an opening world window reports **0.30 of the viewport** (428px of
  1425px), which is the scale value exactly.
  Rapier reads a body's position only when it creates it, so a canvas measured
  mid-zoom nails the hook down permanently — and `viewport.factor` (px per world
  unit) comes out ~3.3x too small, multiplying any scroll offset baked into the
  anchor.
- **It hid on reload because the lanyard chunk is ~3MB and lazy.** On a cold load
  it arrives well after the 420ms zoom and measures a settled canvas. Navigate in
  from another world with the chunk cached and it mounts mid-zoom instead. Any
  bug whose repro depends on a network cache will look intermittent forever.
- **Fix: `WorldOpening` context (world-open.js), provided by WorldWindow.**
  TechLanyard renders nothing until the zoom lands, so the navigate path now
  takes the identical code path to the reload path she already confirmed correct.
  It also keeps the rope sim off the same 420ms as the zoom, which her machine
  will thank us for. Verified: mounted=false while OPENING, true once settled.
- **The general rule:** anything inside a world that measures its own box once
  and keeps the answer must wait for `useWorldOpening()` to go false. This is not
  lanyard-specific — it applies to any future canvas, chart, or virtualized list.

## No permission is ever requested without a gesture (2026-07-28)

- **Opening #/tech used to fire `getUserMedia` from a mount effect.** A visitor
  who had clicked nothing got an unexplained "wants to use your camera" bar,
  with nothing on screen accounting for it. That is the most alarming thing a
  page can do, and on a portfolio the reflex is to close the tab.
- **It also destroyed the feature it existed to show off.** `NotAllowedError` is
  sticky per origin. An unexplained prompt earns a reflex block, and that block
  is permanent — so most visitors would never see the badge's reflection on any
  visit, ever. Asking *after* a deliberate tap converts far better than asking
  before one. Being polite here is not a tax on the feature; it is the only way
  the feature ships at all.
- **Browsers punish the pattern independently.** Chrome escalates origins whose
  prompts are ignored or blocked to silent auto-blocking; Safari expects a user
  gesture. Auto-request-on-mount is precisely the shape both are built to
  suppress.
- **The tap had to ride the 3D card, not the card face.** The DOM face is
  `pointer-events: none` all the way down (lanyard.css) because the drag lives
  on the canvas underneath — a `<button>` painted on the badge renders perfectly
  and never receives a click. So `Lanyard` grew `onCardTap`, firing on a short
  stationary press (a fling must not count), and stays ignorant of what the tap
  is for. The hint on the face is a label, not a control.
- **`Permissions.query` is not a request** — it reads the stored decision and
  never prompts, so a returning visitor who already granted is armed silently
  with no second prompt. Every failure path in that check falls through to
  "ask", never to "request": Firefox has no `camera` descriptor and throws. **A
  missing API must never become an auto-request.**
- **The general rule:** any capability behind a browser permission — camera,
  mic, location, notifications, clipboard read — is requested from a gesture or
  not at all, and the refused state must be a finished design, not a fallback.
  The dark base was always the designed card; it is simply the default now.

## The mobile experience stays portrait; wide artwork pans (2026-07-28)

- **Asked whether the whole mobile site should be landscape**, so wide
  compositions could keep their true spacing. The answer is no, and it is worth
  recording so it doesn't get re-proposed.
- **Landscape cannot be forced on the web.** `screen.orientation.lock()` is
  unimplemented on iOS Safari and fullscreen-only on Chrome Android. It degrades
  to either a whole-page `rotate(90deg)` — which breaks the fixed dock, `dvh`
  sizing, scroll direction and text selection — or a "rotate your device" gate,
  which is where a recruiter arriving from a LinkedIn link leaves.
- **And most of the site is already correct in portrait**: design stacks its
  boards and turns the experience thread vertical, tech collapses the editor
  chrome (and is *text* — portrait is the right shape for it), gallery is a
  sphere, the pond is a full-bleed canvas. Rotating would have discarded all of
  that to fix one page.
- **Only #/notes was broken**, because both sheets are fixed-aspect wide artwork
  with the copy baked into the pixels — measured at 0.23x / 6.3px on a 390px
  phone. Landscape would have reached only 0.50x / ~14px: still squinting.
- **The instinct was right but belonged on the scroll axis, not the device.**
  Height drives the art, each sheet is its own horizontal scroll port, and page
  one lands at 0.919x native (~25px text) with the spacing exactly as drawn.
- **Three traps, all of which bit or would have:** `overscroll-behavior-x:
  contain` (or the swipe past the end becomes browser back-navigation);
  `justify-content: flex-start` (a *centred* flex container whose content
  overflows puts its own leading edge permanently out of reach); and
  `max-width: none` on the image (the global `img` reset capped it to the port
  width, squashing it AND collapsing the `max-content` stage so nothing
  scrolled). Note the third only hit page one — page two is a div.
- **`container-type: inline-size` and `width: max-content` are mutually
  exclusive**: inline-size containment means the box cannot be sized by its
  contents. Page two's `--u` is re-derived from height instead, which is
  equivalent only because its aspect ratio is fixed.

## Reversed: #/notes asks for landscape instead of panning (2026-07-30)

The pan approach above shipped, then turned out wrong in practice: a
horizontal scroll port is not "the entire width visible at once," which is
what was actually wanted. Overruling the 2026-07-28 entry, scoped to notes
only.

- **The four objections to a page-wide `rotate(90deg)`** (dock, `dvh` sizing,
  scroll direction, text selection) are all objections to *faking* landscape
  with a transform while the phone stays portrait. None of them apply to
  asking for the real thing: a phone actually turned sideways is a genuine
  landscape viewport, so the existing width-driven rules (already correct for
  desktop) just apply unchanged — no transform, no dock conflict, nothing
  special to maintain for landscape at all.
- **Portrait phones get a gate instead of a squeeze**: both sheets and the
  coda go `display: none`, replaced by `.nw-rotate-gate` — a `Smartphone` icon
  rotated 90° as the instruction itself, plus a line of Caveat asking the
  visitor to turn their phone. The `.nw-top` header (home link, close button)
  stays outside the gated content, so leaving Notes never requires rotating.
- **700px was kept as the breakpoint, `orientation: portrait` was added to
  it.** Landscape phones (667px on the smallest common case, an iPhone SE)
  clear 700px turned sideways and fall straight through to the unconditional
  desktop rules above — confirmed at 844×390: image renders 829×354 (0.495x),
  `documentElement.scrollWidth` (829) stays under the viewport (844), zero
  horizontal overflow.
- **Cost of the reversal, stated plainly:** panning reached ~0.92x/~26px text;
  landscape-without-scroll reaches ~0.50x/~14px. Smaller text, but no
  scrolling — matches what was actually asked for over what reads more sharply.
- **Bug caught in the same pass, worth recording:** the gate's base
  `display: none` and its media-query override started at equal specificity
  (0,1,0 each), and the base rule sat *after* the query in source — so it won
  regardless of viewport, and the gate never appeared. Fixed by ordering the
  unconditional rule first, override after. A media query adds a condition,
  not specificity; source order still decides ties.
- **`--nw-h`, `.nw-pan`, and the container-query workaround for page two's
  `--u`** are deleted outright rather than kept dark — nothing references them
  once panning is gone, and dead CSS answering a question no longer asked
  only misleads the next read.

## Page one's whitespace above "meet mini mri" (2026-07-30)

> **SUPERSEDED** — see "One sheet, one viewport" (2026-08-03) at the end of this
> file. `.sheet-one` is centred again; the whitespace this entry was fixing no
> longer occurs, because the art now grows to fill the room.

`.sheet-one` centred vertically (`align-items: center`) in a box at least
viewport-tall, but the artwork's rendered height is usually much shorter than
that box — on a normal desktop monitor the dead cream above the composition
matched the dead cream below it, and on a tall external display it read as
the page having not loaded. `.sheet-one` (only — `.sheet-two` untouched) is
now `align-items: flex-start`, so the only whitespace above the image is the
sheet's own 24px top padding that clears the fixed toolbar. Measured at
1440×900: 84px of top whitespace before, 24px after.

## No third-party origin serves navigation chrome (2026-07-29)

- **The dock, the tab strip and the cover no longer fetch their brand marks from
  cdn.simpleicons.org.** Seven call sites, four logos (Figma, Google Photos,
  Claude, GitHub), now inline SVG in `src/BrandIcons.jsx`. That host returned 200
  every time we checked, which is exactly the problem with depending on it: the
  failure is somebody else's downtime, an ad blocker (`cdn.*` is a common
  filter-list entry), or a corporate proxy — and the casualty is the dock, which
  is the only way out of most worlds. It also sent every visitor's IP and referer
  to a third party with no consent, and it was the last remote origin in a
  project that vendors everything else.
- **Path data is CC0** (Simple Icons), so vendoring is expressly allowed; the
  marks stay their owners' trademarks either way, which hotlinking never changed.
  **No `simple-icons` npm dependency** — that is ~3000 icons to ship four paths.
- **The tint is now CSS `color`, not a hex in a URL.** Every mark is
  `fill="currentColor"`. This deleted `FIGMA_TINT` from WorldTabs entirely, which
  had been templating a colour into a URL — the same glyph fetched twice, once
  per chrome.
- **It also woke a dead rule.** `.dock-item-icon` had always declared `color` and
  transitioned it, but on an `<img>` that does nothing — so the brand marks sat
  at 0.82 alpha while the lucide glyphs beside them sat at 0.82 x 0.82 = 0.67.
  Two rest brightnesses on one row of icons, invisible in the source. The colour
  is opaque now so `opacity` alone dims: brand marks unchanged, glyphs brightened
  to match. Size (48% vs 52%) is what keeps glyphs subordinate, as the comment
  there always claimed.
- **`npm run build` now runs `scripts/check-no-cdn.mjs` first.** It fails the
  build on a remote SUBRESOURCE under `src/` — `src=`, `url()`, `@import`,
  `<link href>`. Outbound `<a href>` links are deliberately not flagged; linking
  to GitHub, LinkedIn and Behance is the point of a portfolio. Verified it fails
  (exit 1) on a deliberately reintroduced CDN URL, not just that it passes.

## Canonical domain: mrinalibhardwaj.com

Confirmed 2026-07-29. Four absolute URLs in `index.html` depend on it —
`canonical`, `og:url`, `og:image`, `twitter:image`.

- **og:image cannot be relative.** LinkedIn and Facebook do not resolve a
  relative path; the card silently drops its image rather than erroring, so a
  wrong domain here fails invisibly and only on someone else's screen. That is
  why this is written down rather than left to be inferred.
- **If the site ever moves**, that domain is the one string to change, and
  moving to a GitHub Pages project URL would additionally need Vite's `base`
  set — every asset path currently assumes it is served from the root.
- **No sitemap.xml, deliberately.** The site is hash-routed, so `#/design`,
  `#/tech` and every project page collapse to `/` for a crawler. A sitemap
  could honestly list exactly one entry, which is what a crawler finds anyway.
  Deep-linkable, individually indexable routes would mean real paths and
  pre-rendering — a genuine architecture change, not a metadata one.

## The "mb" monogram is one mark everywhere (2026-07-29)

The badge in the top-left corner is Pinyon Script in every world, matching the
cover exactly. It had drifted into three different faces:

| Where | Was | Now |
| --- | --- | --- |
| Cover, gallery, pond, notes | Pinyon Script `mb` | unchanged |
| Design + tech desktop title bar (`.wt-home`) | Inter 700 `mb` | Pinyon `mb` |
| Design mobile header (`.dw-mark`) | Inter 700 `mb` | Pinyon `mb` |
| Tech mobile header (`.tw-mark`) | Archivo 900 caps `MB` | Pinyon `mb` |

- **Why it drifted:** the app-chrome worlds skin themselves to the UI they
  imitate — VS Code's tab bar, Figma's toolbar — and the monogram got skinned
  along with everything else. The reasoning was that a script face inside an
  editor tab bar breaks the app illusion.
- **Why it's overridden:** a logo does not re-set itself in the host
  application's font. Real software puts its own mark in its own chrome. The
  monogram is the one element that must NOT localise, because it is the thing
  telling you whose site you are in while everything around it changes costume.
- **The display face is content, not chrome.** Archivo caps belong to headings
  inside a world. `MB` in the tech header was the display face leaking into the
  chrome slot — the same mistake `.dw-mark` had already been corrected for once.
- **Two traps when setting Pinyon small:** it ships a SINGLE weight, so any
  `font-weight` above 400 gets synthesised and smears the hairlines; and its
  letters JOIN, so inherited `letter-spacing` snaps the joins open. Both were
  present in the rules being replaced.
- **Optical centring:** Pinyon hangs low in its em box, so flex centring lands
  it visibly below the middle of a title bar. Each mark carries a
  `translateY(-2px)`. On `.wt-home` that transform is on an inner `span`, not
  the anchor — the anchor owns the hover background, which must not move.
- `.nw-mark` also stopped hard-coding `"Pinyon Script", cursive` and now reads
  `var(--font-monogram)`, so the family has exactly one source.

## The world tab strip holds one position across both worlds (2026-07-29)

`.wt--code` is fixed full-width at the top of the tech world, matching
`.wt--figma`. It used to be `position: sticky` *inside* `.tw-content`, which
starts after 288px of left rails (activity bar + explorer).

- **The symptom:** the same two tabs sat flush left in design and inset by
  288px in tech, so switching between the worlds slid the bar sideways. The
  tabs are the control you use to switch — they can't move when you use them.
- **VS Code really does tuck its tab strip beside the explorer**, and that
  fidelity is what's being given up. It's the right trade: the strip is shared
  furniture between two worlds before it's an imitation of either one, and a
  control that relocates costs more than an accurate screenshot buys.
- The activity bar and explorer now start at `top: 35px`, beneath the strip.
  `.tw-content` reserves the same 35px, reset to 0 on mobile where the strip
  is hidden.
- **Bar HEIGHT is deliberately still per-app** — 35px on VS Code's strip, 44px
  on Figma's toolbar. Each is its own app's real chrome, and only the tabs'
  horizontal position was the continuity problem.
- **Latent bug this surfaced:** `FileTree` puts `.ft` on the same element as
  `.tw-sidebar`, and `.ft` sets `height: 100%`, which beat the fixed box's
  `top`/`bottom` pair and resolved against the viewport instead. It had been
  overshooting the bottom by exactly the status bar's 22px and hiding under it;
  adding a 35px top made the overshoot visible. `.tw-sidebar` now sets
  `height: auto` so top/bottom govern.

## The ID badge wears her monogram, not the demo's branding (2026-07-29)

The lanyard came from the `lanyard` sample project, and it arrived carrying that
project's identity in two places we had never replaced:

- **The strap** (`public/lanyard/lanyard.png`) was the **Atom editor logo**,
  repeated four times down the band.
- **The card** had the **reactbits.dev logo and wordmark** baked into the GLB's
  base colour map. That is the face you see when the badge flips, so the back of
  her ID was an advert for someone else's library.

Both are now the Pinyon Script `mb`, matching the monogram everywhere else.

- **The card map is overridden in code, not baked back into the GLB.**
  `Lanyard.jsx` loads `card-face.jpg` and passes it as the material's `map`.
  Rewriting the binary would have meant rebuilding buffer views by hand and
  would have left the artwork undiffable. As a plain image anyone can re-edit it.
- **The atlas layout is load-bearing.** The UVs are baked into the geometry:
  left half (u 0–0.5) is the FRONT face, right half (u 0.5–1) is the BACK. A
  replacement must keep that split or the faces show the wrong thing. Measured
  off the mesh, not guessed.
- **No mirroring is needed on the back**, which is not obvious: the back face's
  normals point −z, and its u runs 1.000 at local +x down to 0.501 at local −x.
  Viewed from behind, +x is on the viewer's LEFT, so left-to-right across the
  screen is u 0.501 → 1.000 — increasing, therefore upright.
- **The paper grain is the original card stock**, sampled from a blank corner of
  the GLB's own texture and tiled with alternate cells mirrored to kill the seam.
  A flat fill lost the material feel; the grain is what makes it read as card.
- **JPEG, not PNG.** The grain is high-frequency noise, so PNG could not compress
  it: 1.03 MB as PNG vs 181 KB as JPEG q0.92, replacing a 2.29 MB baked PNG. No
  alpha is needed, and at the size the card renders (~340px tall) q0.92 ringing
  is invisible.
- **`repeat` on the band material flipped from −4 to +4.** A negative repeat
  walks u backwards along the strap, which mirrors whatever is printed on it.
  That was invisible with the near-symmetric Atom mark but would have run the
  script backwards. The sign only chooses which way the repeat travels.
- **Verification note:** the card face was confirmed by reading pixels back out
  of the live WebGL buffer. The STRAP could not be confirmed the same way —
  driving the scene by hand (`__lanyard.advance`) feeds rapier synthetic deltas
  and NaNs the rope, so the band has no geometry to draw. The band's `uv` does
  run 0→1 along its length, which is the premise the repeat-sign fix rests on.

## The three work boards get real cover photos (2026-07-31)

The "Selected work" boards (design canvas) carried a decorative SVG sketch
per board — line-drawing placeholders, explicitly commented as such
("real case-study shots replace these when she supplies them"). Replaced with
real cover photos for all three: Meal Maestro, Layover, Futurepreneurs.

- **`.dw-board-display`, the large project-name text drawn over the empty
  cream, is deleted along with the sketch, not just the sketch alone.** It
  existed to compensate for the placeholder having no wordmark of its own —
  every supplied cover photo already carries the project's real branding baked
  in (Meal Maestro's wordmark, Layover's logo, the FUTUREPRENEURS headline), so
  redrawing the name a second time on top would double it up, not label it.
- **Layover's source was the wrong orientation for its board**, and this is
  the one worth remembering if a future cover swap looks wrong on arrival: the
  `sm` board is a 4/5 PORTRAIT slot, but the supplied export was a 1920x1080
  LANDSCAPE slide (a 3-mockup hero: laptop + two phones). A blind centre-crop
  to 4:5 lands almost entirely on the dark laptop panel and misses both
  phones. Cropped instead to the two-phone cluster on the right edge
  (x 1056–1920, full height) — checked by rendering the candidate crop box
  over the source and looking at it before cutting anything, not by
  computing coordinates blind.
- **Never upscale a crop past its native resolution.** Futurepreneurs'
  source screenshot is only 814px wide; the first pass resized every cover to
  a uniform 1200px width regardless, which stretched futurepreneurs 47% and
  visibly softened the laptop screen's text. Fixed by capping output width to
  `min(target, crop_width)` — meal-maestro and layover both have enough
  native resolution to hit the target size unscaled; futurepreneurs ships at
  its native 814px instead.
- **Crops are pre-baked (`scripts/build_project_covers.py`), not left to
  `object-fit: cover` on the raw file.** The raw files stay wherever she
  exported them; the script is the record of exactly where each crop lands
  and why, re-runnable if a source ever gets re-exported.
- **`.dw-board-art` deliberately does NOT get `overflow: hidden`**, even
  though a full-bleed photo is the kind of thing that usually wants it:
  `.dw-board-pin` sits at `top: -12px` and `.dw-board-dims` at
  `bottom: -22px`, both intentionally poking past the box edge (the "pinned
  to the top edge" and "dimension pill below" effects). Clipping would have
  cut both off — caught by checking their CSS before adding the rule, not by
  shipping it and noticing the pins had vanished.
- **`coverAlt` was written, then removed.** The instinct was to pair `cover`
  with real alt text the way `shots` pairs images with captions — but nothing
  reads it: the board's `<img>` correctly gets `alt=""` (the parent `<a>`'s
  own `aria-label` already names the project once; a screen reader would
  otherwise hear the same description twice for what is one link), and
  `ProjectPage.jsx` only ever renders `project.shots`, never `project.cover`.
  An unused field is exactly the kind of thing worth deleting on sight rather
  than leaving for "later."

## Layover's cover swapped to the billboard wordmark shot, and grows a column (2026-07-31)

Replaced the two-phone app screenshot with a different photo entirely — the
LayOver wordmark on a black billboard, tree-lined street — and widened the
board it sits in.

- **This board's width was never aspect-ratio-derived, unlike futurepreneurs'
  wide board.** `.dw-board-art` has no explicit width; it fills its
  grid-column track first, and `aspect-ratio` only ever set HEIGHT against
  that already-fixed width. So when asked to "increase width" here, loosening
  the ratio alone (the futurepreneurs move) would only have made the box
  *shorter* — width is entirely a grid-column question for this component.
  Worth remembering as the general rule: check whether a board's width comes
  from its grid span or its aspect-ratio before reaching for either fix.
- **Grew the grid span instead** — `.dw-board--sm` from `9 / span 4` to
  `8 / span 5`, reclaiming the column that used to sit empty between it and
  the lg board on purpose ("scattered, not stacked"). Column 8 is the most it
  can grow to without overlapping lg, which ends its own span there.
- **The crop only trims the source slide's own decorative frame** — flat
  cream and gold gradient bars either side of the photo, confirmed by
  scanning for colour-jump discontinuities (`scripts/build_project_covers.py`
  has the exact method) rather than eyeballing where they ended. Real photo
  content is exactly x 195–1725 of the 1920-wide slide; nothing above or
  below is cropped at all.
- **The board's aspect-ratio (17/12) is the crop's own ratio, not a rounder
  number the photo was then further cropped to hit.** 1530×1080, reduced,
  is 17/12 exactly — using it directly means the photo needed no additional
  cropping beyond trimming the frame bars.

## Cover: marginalia — the roles flank the name

The two disciplines were named on the cover only at beat 3, and only as
"Design" and "Tech". The actual roles now sit as **margin notes** in the
stage's left and right gutters, vertically centred, one word cycling in each:
"I am a" → the five design roles on the left, "as well as a" → the four
engineering roles on the right.

- **They belong to beat 1, not beat 3.** Beat 3's `.cover-split` claims those
  same two margins from progress ~0.51 with 25rem-wide blocks, which would sit
  straight on top of 160px marginalia. So they fade on the name's own ramp
  (0.02 → 0.22) and are measured at opacity 0 by 0.32 — well clear. They also
  carry `pointer-events: none` permanently, so they can never shadow the
  Explore CTAs even if that timing is ever changed.
- **Vertical centring is what keeps them off the script name**, for free: the
  stage is `justify-content: flex-end`, so `.cover-name-script` occupies the
  bottom third (measured top 458 at 1280×720) while these hold at 50% and end
  at y 393. No overlap at any width, because both scale with the viewport.
- **Hidden below 1024px, but the screen-reader line is not.** `display: none`
  is on `.cover-aside-inner` only; `.cover-aside-sr` — one plain sentence
  naming every role — stays in the accessibility tree at every width. The
  visible column is `aria-hidden`, because a word that swaps every 2.6s is not
  something a screen reader can follow.

### TextMorph is ported, not installed

The component arrived as a shadcn/Tailwind/TSX recipe importing `motion/react`.
This project is Vite + JSX + plain CSS with design tokens, and already depends
on `framer-motion` (same `AnimatePresence`/`motion` API). Adding Tailwind,
shadcn and the `motion` package to host one 11px label would have been a
toolchain rebuild for no gain, so `src/TextMorph.jsx` is the same idea on the
stack that exists. Two substantive changes, both forced by this placement:

- **It splits on words first, then characters.** The original laid every char
  out in a single flex row, which cannot wrap. Fine for "designer"; these roles
  ("INTERACTION DESIGNER") live in a 160px editorial column and must break
  across lines. Word groups wrap, and a flat char index keeps the stagger
  running continuously across the whole phrase rather than restarting per word.
- **It takes `paused` and honours `prefers-reduced-motion`.** `paused={split}`
  reuses Cover's existing scroll boolean, so the interval stops once the slot
  has faded rather than re-rendering forever behind an opacity 0 — no new state
  and no new render path. Reduced motion gets a plain crossfade with no blur.

The role slot reserves two lines (`min-height: calc(2 * 1.2 * 11px)`) so the
column does not jump between one- and two-line titles — which is also what
keeps `AnimatePresence`'s `popLayout` exit measuring against a stable box.

### Marginalia, settled: Inter 300 Light, one line per role

Tuned across six sessions (2026-07-28 to 2026-08-01) and now holds.

**The ship values** are:
- **Lead-in** (the role label above each column): Inter 300 at 10px, leading
  1.05, tracking **-0.04em**, pure white.
- **Role** (the cycling phrase): Inter 300 at 12px, leading 1.032, tracking
  -0.04em (same as lead-in).
- **Column width:** 148px (was 122px before lead-in and role sizes went up).

**Measured, not picked:** across all 125 adjacent character pairs in the nine
roles + both lead-ins at weight 300, the binding collision pair is **"WA"** in
SOFTWARE DEVELOPER at -0.0463em. That's the no-overlap floor. Previous -0.1em
had 17 of 125 pairs genuinely overlapping. Shipped -0.04em clears the floor by
0.0063em, verified in a cycle sample of 40 morphs.

- **Negative tracking lands on the SPACE characters too.** At the previous -0.1em
  it ate most of the word gap and "I AM A" set solid as "IAMA".
  `word-spacing: calc(-1 * var(--track))` cancels it back out on word breaks
  only, so the letter tracking stays exactly as specified while the words stay
  separable. Derived from `--track` so the two cannot drift.
- **That fix does not reach the roles**, because TextMorph renders each
  character as its own inline-block and the word break there is a flex gap, not
  a space. The gap is set directly to 0.26em — Inter's own space advance — so
  the word rhythm matches the lead-in's restored one instead of drifting wide.
- **Every role sits on ONE line, and the column width is the guarantee.**
  The nine roles at 12px/-0.04em measure 74–134px; longest is "INTERACTION
  DESIGNER" at 134.3px, so the column is 148px (~10% clear). `white-space:
  nowrap` is a belt on top, NOT the guarantee: if the width is ever too small,
  nowrap makes the text spill OUT of the column instead of wrapping. Re-measure
  on any change to the roles, size, tracking, weight or face.
- Because it is always one line, the slot reserves one, so the role box is a
  constant 12.384px (12px × 1.032) whatever is showing — no jump, and a stable
  box for AnimatePresence's popLayout to measure its exit against. Verified
  across a live 30-cycle morph: all one line, none spilling.
- Size, leading and tracking stay custom properties (`--role-fs`, `--role-lh`,
  `--track`) because three things derive from them: the one-line reserve, the
  word-spacing correction, and the right column's negative margin that cancels
  the trailing letter-space so the edge sits flush. That last one is
  sign-agnostic by construction and stayed correct when tracking went negative.

**Verifying this needed a workaround worth remembering.** The Browser pane's
native surface is ~615px, so a 1280px viewport composites at ~48% and 12px type
is unreadable in a screenshot; the pane also served stale frames that
contradicted the DOM. The fix was a temporary injected stylesheet scaling the
columns 4x with the morph frozen (`opacity`/`filter`/`transform` forced, all but
the last `.tm-phrase` hidden), screenshot, then removed. Layout facts came from
measurement, not from looking.

### The name runs two scripts; its tighter tracking cannot close the Pinyon joins (2026-08-01)

The capitals stay Ballet — its swashed M and B are why that face is here at all
— and "rinali"/"hardwaj" became Pinyon, the monogram's face. Split into spans so
the change is per-glyph-run while the `.is-inked` mask still sweeps the h1 as one
box and the font-load gate waits for both.

**Pinyon scaled down to 0.861em.** The correction runs opposite to the obvious
guess: Pinyon's lowercase is the *bigger* of the two faces, not smaller. Measured
on a no-ascender/no-descender run ("rn") at 200px: x-height is 0.395em in Pinyon
against 0.340em in Ballet, so it scales DOWN to bring the two x-heights level.

**The name's horizontal footprint expanded ~16%.** Pinyon lays out at 7.047×
font-size vs Ballet's 6.08×, so the width ceiling fell from 16.03vw to 13.79vw.
At the old 15vw this overflowed by 41px a side and the stage's `overflow:hidden`
sheared the swashes sideways — the wrong kind of spill. Dropped to 13vw, ~6% under
the new limit. **Not visually smaller for it:** 13vw × 7.047 fills the same ~92%
of width that 15vw × 6.08 did.

**Tracking tightened to -0.01em to close breaks in "rinali"/"hardwaj".** Scanning
the baseline join band at 300px, the number of interruptions is FIXED at 7 in
"rinali" and 11 in "hardwaj" at every spacing value from +0.01em to -0.01em.
Pinyon does not join those letter pairs at all — it's a script that looks
connected but isn't — so spacing only narrows the gaps, never removes them. This
move closes ~16% of their total width. Further tightening crashes the taller
strokes without closing anything.

### Cover margin notes sit further from the edges (2026-08-01)

Inset from edges changed `clamp(24px, 2.4vw, 40px)` → `clamp(40px, 4.5vw, 80px)`.
At 1440 this moves them 34px → 64px off the glass; at 1024 it's 45px. They were
close enough to the edge to read as pinned to it rather than placed. Held as one
`--aside-inset` CSS variable that both sides read so they cannot drift apart —
these are a mirrored pair and any asymmetry is visible.

Verified symmetric to within a pixel at 1024 and 1440, still clearing the name
vertically (150px at the tighter end), no overflow.

### "a design engineer" is gone

The caption under the name is removed, along with the glyph-measuring effect
that pinned it (a Range over chars 1–7 of the name's text node, plus a
ResizeObserver and a deferred resize pass, feeding `--cap-x`/`--cap-y`). The
margin notes say the same thing in far more detail, so the caption was
restating them in a place that cost ~55 lines of measurement code to hold.

### The name's drop is in em of itself, never vh; it is DELIBERATELY reversed (2026-08-01)

The earlier rule was **"zero clipping is the bar"** — hold the name's descenders
above the fold at `drop <= 0.099em`. That is now **deliberately overridden**. The
name now **bottoms out at the viewport edge and both the B and j are meant to run
off the screen**. The reason this rule reversal is load-bearing: the stage is a
sticky 100dvh box with `overflow: hidden`, so the viewport bottom is a hard clip,
and the clipping reads as a deliberate compositional choice only when it does NOT
look accidental.

**The geometry is size-invariant**, both sides measured in em of the name:

```
clip line below baseline = 0.621 - (--name-drop)
```

Current shipping value: `--name-drop: 0.32`. This puts the clip line at 0.301em.

- **Measured against two descenders** (after the script split where the j became
  Pinyon instead of Ballet): the B's flourish bottoms out at 0.286em and now
  clears the fold by 0.015em — the whole curve reads — while the j still runs
  0.034em past it. Neither value is approximate; both were measured via a
  zero-height inline-block probe for the baseline and per-glyph canvas metrics.
- **Why em, not vh.** `font-size` is `13vw`, so a descendant that must stay
  visible scales with viewport WIDTH while a vh margin scales with HEIGHT — the
  clipping amount would drift by aspect ratio instead of being a deliberate,
  consistent choice. Verified on two ratios (1280x800 and 1600x700): clip
  depths 0.099em and 0.342em measured identically both ways in em.
- **The usable window is tight.** Above ~0.34 the B's curve gets eaten again;
  below ~0.285 the j stops spilling at all. The 0.32 value sits 0.015em from
  the B ceiling and 0.034em from the j floor, leaving no headroom to tune.
- Previous: 0.44 (too low, fully clips the B's curve), then 0.08 (when the
  default was zero clipping). The steady-state is 0.32, recorded here so it
  doesn't regress.

## The cover's second half is a desktop, so it has files on it

The settled cover is a MacBook screen — dock, wallpaper, the lot. Three files
now launch from below the bottom edge alongside the dock's rise and settle into
place: `design.pdf` (the design résumé), `tech.ts` (the tech résumé — the file
on disk is a PDF, the extension is the joke) and `github` as a folder carrying
the GitHub mark.

They live **inside `.cover-stage`**, not beside the dock in `App`. The stage is
`overflow: hidden` and pinned to the viewport, so a file waiting below the fold
is clipped by the screen edge rather than hanging off the document; and they
leave with the cover's own fade instead of popping out the instant a world
opens. The dock is the one thing that genuinely outlives the route — these
belong to the cover, and `Cover` mirrors the 0.77 settle threshold into its own
state to drive them.

Icons are **inline SVG**, for the same reason `BrandIcons.jsx` exists: no extra
requests, no remote origin, sharp at whatever size the clamp lands on.

### Positions are the icon's CENTRE, not the tile's corner

The tile is wider than the artwork (the label needs the room) and taller (the
label sits under it). Anchoring by corner made every art-directed position an
offset puzzle — the first pass had the right icon reading 151px off its edge
against the left one's 120px, from the same nominal inset. The CSS now pulls the
box back by half of itself (`margin-left`/`margin-top`, **not** a transform —
Framer owns that for the launch), so the `left`/`top` in `DesktopFiles.jsx` are
the point the icon sits on.

### The scatter is placed against the lotus, and it is measured

The three points sit inboard, in the quiet gaps around the flower, rather than
jammed into the screen corners — corners read as a filed-away grid. Verified at
1440x900, 1280x720 and 1920x1080 against the **ink** of every neighbour (a
`Range` box, not the element box: both discipline blocks are 25rem wide with
their text aligned to the outer edge, so their boxes are far wider than what you
can see). No tile touches the nav, either block, or the dock; closest approach
44px; nothing truncates; no horizontal overflow.

Hidden below 900px wide. The two blocks already own every margin there, and
nothing is lost: GitHub is in the cover header at every width, and both résumés
are linked from inside their own worlds.

### The launch distance is per tile

One flat offset cannot work — the tiles rest at different heights, so a single
number either leaves the top pair on screen (they fade in place instead of
flying up) or throws the bottom one a screen and a half. Distance is measured
from the stage's own bottom, and since the stage is exactly `100dvh` the
viewport *is* that measurement (read at render, the way `Cover.jsx` reads it for
the name's rise). All three therefore wait on the same line just past the edge.
Measured at 1440×900: all three park at y≈1017, one line below the 900px fold,
regardless of where they rest.

Durations are equal over unequal distances, so they arrive together with the far
ones moving faster — which is what throwing three things at once looks like.

### They FLOAT in, they are not thrown

The launch does **not** use the project's `--ease-soft`. That curve front-loads
almost the whole distance into the first third, which at 1.15s read as three
things being flung at the glass and stopping dead. The launch has its own curve,
`cubic-bezier(0.16, 0.62, 0.2, 1)` over **2.15s**: it leaves the edge gently and
spends most of its time easing into the resting position. Measured travel shows
the intended long tail — the design sheet covers 14px in one 330ms stretch and
then just 3px in the following 213ms.

Two supporting changes, both necessary for it to read as floating rather than
slow: the entry scale starts at **0.96, not 0.88** (a big scale ramp over a slow
rise reads as zooming toward the glass, and these are rising *behind* it), and
opacity takes **0.75s** instead of 0.35s while still finishing well inside the
flight, so you watch them travel rather than watch them fade in. The stagger
widens to 0.2 / 0.42 / 0.64 so the three read as separate arrivals, and the whole
run still sits under the dock's own 1.4s rise.

`--ease-soft` still owns the hover, where snap is the entire point.

### design.pdf sits higher than tech.ts

Its centre is at **19.4%**, not 25.2%. Level with the tech sheet the pair read as
a row and the scatter stopped looking scattered. Re-measured at the new height:
tightest clearance is 96px (to the design side's title), nothing overlaps, and
`scrollWidth === clientWidth`.

### They rest straight and lean on hover

The tilt was a resting pose first, and three permanently crooked icons on an
otherwise precise stage read as sloppy rather than casual. As a hover state it
costs nothing until you point at one, and then it reads as picking the thing up.
It rides on the inner `.dfile-icon` because Framer owns the tile's transform —
which also leaves the label upright and readable. Each file leans its own way
and amount so pointing along the row isn't mechanical.

Labels carry **no plate at rest** (a dark pill under all three was three more
boxes on a stage that is mostly empty space); a tight text-shadow does the
legibility work, and the macOS selection plate arrives on hover. Names echo the
world tabs' own naming — `design.fig`/`tech.jsx` — so the extension is what
tells you which half of the person a file belongs to. Short on purpose: at this
icon size the full `resume-design.pdf` was 111px against an 81px box and
rendered as `resume-desig…`. The `aria-label`s carry the full meaning.

## One sheet, one viewport — at full size, not shrunk down (2026-08-03)

**Supersedes "Notes runs full-bleed…" (2026-07-27) and "Page one's whitespace
above 'meet mini mri'" (2026-07-30).** Both decided the opposite of this; read
them as history, not as rules.

Each scrapbook page is one composition with a beginning and an end baked into
the pixels — page one runs "meet mini mri" → "maybe this was half the game",
page two "for the other half" → "all ideas started feeling real". Reading either
in two scrolled pieces breaks the sentence. So each page fits one viewport,
centred in the room — **and fills the page's full width while doing it.**

**The first attempt at this got it wrong in an instructive way.** It capped each
sheet's width at `room × aspect`, which does make a fixed-aspect plate fit — by
shrinking it. Page two came out 1006px wide on a 1440px screen, 210px of waste
per side, pencil notes down at 8–10px. Fitting is not the goal; fitting *at
full size* is.

- **The conflict was in page two's COMPOSITION, not in the sizing.** Its plate
  was 1485×1075 — aspect 1.38, nearly square — in a viewport that is nearly 2:1.
  A fixed-aspect plate obeys width or height, never both. Page two has been
  re-composed (below) into something built to fit, so the height cap could go
  and both sheets are simply full-bleed under one shared 1673px max-width —
  identical margins on every screen.
- **Page one's dotted arrow starts at column 0 of `origin.webp`** (measured by
  ink scan). So page one is full-bleed by requirement, not by taste: any side
  padding cuts the arrow loose from the edge of the screen. The consistent side
  padding lives *inside* page two's composition, where it costs the artwork
  nothing.
- **`.sheet-one` is centred again.** The 2026-07-30 complaint (dead cream above
  the art on a tall display) is gone on its own now that the art runs edge to
  edge instead of sitting at its native height inside a taller box.

### Page two is three columns now, sized by height and laid out by edge

`SceneTwo.jsx` was a 1485×1075 stage of absolutely-placed Figma coordinates. It
is now `[ left margin ] [ the drawing ] [ right margin ]`, with the margins
pinned to the screen's edges at one shared `--t2-pad` and the drawing centred
between them.

- **`--u` is derived from the scene's HEIGHT, not its width** (`--t2-h / 714`).
  This is the whole trick: a wider window now moves the two columns apart
  instead of shrinking the type. 714 is the cap and it is page one's native
  height on purpose — the two sheets are then the same shape, and `--u` never
  exceeds 1 so nothing upscales on a tall display.
- **The columns are flex columns with `justify-content: space-between`**, and
  the groups they distribute are the original's own grouping. That rhythm
  survives any height; four hand-tuned y-coordinates only survived 1075.
- **The centrepiece is cropped to its measured ink.** `tech-discovery.webp` is
  1474×1067 but the pencil work only occupies **1011×845 at offset (252, 121)** —
  31% of its width and 21% of its height was blank cream, competing with the
  viewport for room. The plate IS that ink box and the image is scaled/offset
  inside it (`145.796%` / `-24.9258%` / `-14.3195%`, all derived from those
  numbers — note `top` resolves against height, so it is not the same ratio as
  `left`). Verified: the ink maps onto the plate to within **0.01px on all four
  sides**, so nothing is clipped and no cream shows. **Re-export the file and
  those four numbers are wrong — re-scan for ink bounds, don't nudge by eye.**
- **`--t2-col: 285`** is the narrowest column the left margin's content fits in
  with air between its groups. At 250 the opening copy ran to five lines and
  `space-between` had 8 units to spread across three gaps — the groups touched.
  Every unit here comes off the drawing, so re-measure rather than round up.
- **The closing line lost its authored `<br>`s.** They were tuned for ~500 units
  of run; the column is 285, so it wrapped anyway and the hard breaks only added
  ragged half-lines. `text-wrap: balance` keeps the three-beat shape.

**This edits `SceneTwo.jsx`, a RECOVERED artifact** (standing rule: don't touch
it). Explicit request — "reposition elements if necessary" — so it is logged
here rather than done quietly. Every element from the original is still present
and still in the margin it was drawn in.

### Measured

|  | 1366×768 | 1440×900 | 1920×1080 |
|---|---|---|---|
| page one | 1351×576 | 1425×608 | 1673×714 |
| page two | 1351×596 | 1425×714 | 1673×714 |
| the drawing | 634×530 | 711×594 | 760×635 |
| side padding L/R | 40/40 | 48/48 | 48/48 |
| gap col↔drawing L/R | 80/80 | 34/34 | 124/124 |
| smallest pencil note | 12.5px | 15px | 15px |

Both sheets fit the room at all three; margins match between the two sheets;
nothing overflows its column; `scrollWidth === clientWidth`. Against the
shrink-to-fit version the drawing is **larger** (711×594 vs 690×577 at 1440×900)
and the smallest note went 8.3px → 12.5px at 1366×768. Typecheck and build
clean.

### Page one is cropped at its first ink row

`origin.webp` carries **55 completely empty rows above the artwork** — the first
ink in the file is the "m" of "meet mini mri" at row 55. That cream was pushing
"maybe this was half the game" off the bottom of shorter desktop windows, so the
sheet's stage is now a crop window at `1673 / 659` and `.nw-origin-frame` (the
whole export) is pulled up out of it by `55/659 = 8.346%`.

- **Blank cream only.** There is no second helping to take from the top. The
  other 58 empty rows are at the BOTTOM, below "half the game", and are left
  alone deliberately — they are the only thing holding that line off the edge of
  its own frame.
- **No breathing room is lost.** The sheet centres the art in the room, so at
  1440×900 there are still ~80px of cream above the title.
- **The milestones moved into the frame, not onto the stage.** Their
  percentages were measured against the full 1673×714 export by pixel scan, and
  inside `.nw-origin-frame` they stay true — the crop cannot silently
  invalidate them. Verified: all three dots render at the identical pixel
  centres they did before the crop.

What it buys, measured: page one goes 608 → **561px** tall at 1440 wide, so the
window height it needs drops from 780 to **733**. At 1440×760 — where it used to
overflow — the title now clears the toolbar by 37px and the closing line ends
78px above the dock. The crop is exact: the first ink row lands at 0.00px from
the stage's top edge.

### Page two is stripped to the drawing and the two lines, in page one's type

Two changes on the same day, both by request, and the second one supersedes the
three-column layout described above.

**First: the copy is set in page one's typography, measured out of the pixels.**
Page one's copy is baked into `origin.webp`, so there was nothing to inherit
from and page two's had drifted into its own thing (20u / 1.5 / 0.1u tracking /
`#2c2823`). Fitting the seven lines of page one's copy against Inter at 100px
and solving for size and tracking together:

| | value | how |
|---|---|---|
| weight | 400 | 300 and 500 both fit worse |
| font-size | 28.01 source px | cross-checked: "By the time she was 12," is 27px cap-to-descender ÷ 0.967em = 27.9 |
| tracking | 0 | the 2-param fit wanted 0.03em, but zero fit the four clean lines to within 0.3px — the 0.03 was the apostrophe lines' error |
| line-height | 1.221 | line pitch 34.2px, uniform across both of page one's blocks |
| colour | `#000` | 2130 pure-black pixels against 478 for the runner-up — **not** `#2c2823` |

**Both the type and the padding are in `cqw`, not `--u`.** This is the load-
bearing part: page one's type and inset scale with the sheet's WIDTH, and `--u`
scales with height, so anything expressed in `--u` only agreed with page one at
one window size (48px against page one's 74px at 1440×900). `--t2-pad` is
`5.1303cqw` — the text box, i.e. the measured ink at 87 less the 2.2 sidebearing,
because it is the INK that has to line up. Verified rendered: ink-left, size and
pitch all match page one to **within 0.01px** at 1440×900.

**Second: every pencil mark is gone** — `const idea = reality`, `makeItReal()`,
the notes list, the reminder card, the tech-stack card, the terminal lines, the
ship note, and the `RoughBox`/`Underline` components that drew their frames.
They are in git from `7639232` back.

What is left is the drawing and two runs of narrative — page one's exact cast —
so page two takes page one's geometry too: opening copy top-left, artwork,
closing line bottom-right and right-aligned.

- **The line breaks are hers and nothing re-wraps them.** Each block is
  `nowrap`, pinned to an edge, sized by its own longest line. `--t2-plate-x` is
  derived from copy 1's widest line (419.7 source units, "the little one knew
  visuals alone") plus a 28-unit gap, so **changing a word means re-checking
  that the block still clears the drawing.**
- **The closing copy sits ON the drawing**, as her original composition did.
  That is only safe because the corner is blank, and it was checked against the
  pixels rather than the density grid: **115 ink pixels in 52,877, darkest 205
  against paper at 248** — texture, not a stroke.
- **The drawing is now 816×682** at 1440×900, against 676×565 before the strip
  and 690×577 originally. Removing the margin columns is what paid for it.

Verified at 1366×768, 1440×900 and 1920×1080: both sheets fit the room, sheet
margins match, padding symmetric, 6 and 3 lines with no re-wrap anywhere,
`scrollWidth === clientWidth`. Typecheck and build clean.

## Notes page three: the poster collage, and the light-world rule falls (2026-08-03)

Replicated from Figma — file `drda7TnqoM3fEpbibCDIc2`, node `272:515`
("Desktop - 16") — by request, exactly rather than reinterpreted.

- **This overturns "Notes is the portfolio's one LIGHT world on purpose"**
  (2026-07-17). That rule existed because the scrapbook is paper and Apple Notes
  is paper, so the app and its contents agreed. Page three is `#1e1516` dark,
  hot pink and yellow. Confirmed as intentional before building — the scrapbook
  now goes cream, cream, then poster.
- **THREE VIEWPORT PANELS, ONE POSTER.** The frame is ~3 screens tall and its
  sections do not separate: the ENGINEER banner crosses the first seam and the
  pink block overhangs the yellow band by 79 units. So this is one continuous
  poster shown through three windows, each one viewport, rather than three
  compositions. Anything crossing a seam continues across it — which only works
  because they are windows.
- **Seams at 854 / 1708.** 1708 is the yellow band's own top edge, so the second
  seam lands on a real boundary; that leaves panels one and two identical and
  the third within 17 units.
- **The poster is narrower than the two scrapbook pages, and that is the trade.**
  It is scaled so the tallest panel fits the room (1449/854 = 1.6967) — 1235px
  wide at 1440×900 against the scrapbook's full-bleed 1425. A fixed-aspect
  poster cannot be both full-width and one-viewport-tall; here the design is the
  thing being replicated, so fitting wins.
- **The poster renders three times, once per panel.** ~60 extra DOM nodes each,
  in exchange for exact continuity. The four bitmaps are the same four files in
  all three panels, so the browser decodes each once however many tags point at
  it; everything below panel one is `loading="lazy"`.
- **`subtract.svg` is one path filled `#FF54AD`** — a pink rectangle with "trust
  the process" / "and the artist" KNOCKED OUT, so the photograph behind is what
  you read the letters in. Its `alt` carries those words because they exist
  nowhere else in the DOM.
- **Figma's `-scale-y-100 rotate(175.42deg)` on the banners is a REFLECTION, not
  a rotation** (determinant −1). For an axis-symmetric rectangle the visible
  result is a plain rotation; solving the reflection axis gives **−4.58°** for
  ENGINEER and **+4.74°** for DESIGN, which is why they match the −4.56 / +4.66
  the type inside them carries. Written as the rotations they actually are.
- **Type substitutions, deliberate:** Helvetica → `--font-ui` (Inter), the
  project's grotesque — no webfont downloaded for four words. Times New Roman is
  named FIRST rather than using `--font-serif`, which leads with Cormorant
  Garamond; its high stroke contrast and small x-height would read as a
  different typeface entirely. मृणाली falls to `Nirmala UI` / `Devanagari Sangam
  MN` — no Times build carries Devanagari.
- **"ICON ICON ICON…" is kept verbatim**, including the two runs the design
  breaks mid-word ("ICICON", "ON ICON"). Confirmed: the repeated word is a type
  texture on the pink card, not placeholder copy.

**ONE THING IS NOT EXACT.** The front M's fill does not come out of Figma —
node `274:543` returns no colour at all, asked twice, which is what the exporter
does when a text fill is an image or gradient rather than a solid. The M in the
design is visibly textured. It is set to the same `#ffe991` as the layer behind
it: a made-up gradient would read as an intentional choice that is not hers, and
flat gold is honestly "the fill we know about" — the black layer behind still
supplies the offset edge. **To finish it, export `274:543` alone as a PNG and
swap it in;** the two layers behind are exact.

Assets live in `public/collage/` and were committed ahead of the build because
Figma's asset URLs are signed and expire in ~7 days.

Verified at 1366×768, 1440×900 and 1920×1080: all five sheets fit the room,
`scrollWidth === clientWidth`, 12 lotus tiles per panel, panel three's band
filling its window exactly. Typecheck and build clean.

### …and then the collage went full-bleed after all

The bullet above — "the poster is narrower than the two scrapbook pages, and
that is the trade" — is **reversed**. Width was the priority, not fitting.

`.cl-window` is now `min(100%, 1673px)`, the same cap the scrapbook stages use,
so **all five sheets render at exactly the same width and margin** on every
screen. The height term is gone.

**The dock's 104px reserve is dropped for these sheets**, which is what makes it
work. It is a *floating* dock and it already passes over the cover's artwork;
reserving a strip of a full-bleed poster was over-cautious on my part, and it
was costing 128px of height. With it back, a full-width panel still fits:

| | width | panel h | room (`100dvh − 44`) | fits |
|---|---|---|---|---|
| 1366×768 | 1351 | 796 / 796 / 780 | 724 | **no — over by ~72px** |
| 1440×900 | 1425 | 840 / 840 / 823 | 856 | yes |
| 1920×1080 | 1673 | 986 / 986 / 966 | 1036 | yes |

On a 16:9 laptop a panel is ~72px taller than the viewport and that sheet
scrolls by that much. That is the honest cost of edge-to-edge on a 1.71 poster,
and it was accepted knowingly.

**For any future panel, draw it at an aspect of 1.87 or wider** — e.g. 1440×770
each, a 1440×2310 frame for three — and it will be full-bleed *and*
one-viewport on every screen in that table, with no trade at all. This one is
1449×848 = 1.71, which is why there is one.

### The collage caps at 1449, its own native width — not at 1673

The full-bleed change above shipped with `min(100%, 1673px)`, and **1673 is page
one's native width, borrowed without thinking.** The collage's Figma frame is
1449 wide. So every screen wider than ~1464 was upscaling the whole poster past
1:1 — 1.03× at 1512, **1.15× at 1920** — blowing up the M, the banners and four
bitmaps together. That is what "the design has been made too large" was.

Now `min(100%, 1449px)`. Measured, the M against its 478.463-unit design size:

| | poster width | scale | M renders at | panel fits |
|---|---|---|---|---|
| 1366×768 | 1351 (full-bleed) | 0.93× | 446px | over by 72px |
| 1440×900 | 1425 (full-bleed) | 0.98× | 470px | yes |
| 1920×1080 | 1449 (228px margins) | **1.00×** | **478.5px** | yes |

The rule is the one page one already followed — "never upscales past 1:1" — and
the fix is simply that **each sheet caps at its OWN native width.** A consequence
worth knowing: above 1449 the collage is narrower than the two scrapbook pages
(1449 vs 1673), so the five sheets no longer share one margin on a large
monitor. That is correct. Past that point "full width" and "the size it was
drawn at" are different things, and the design wins.

The 1366×768 overflow is unchanged and is the aspect problem, not a scale one —
see the 1.87 note above.

### The collage tracks node 296:533, the resized frame — and it now fits everywhere

She resized every component in Figma to fit better heightwise, and that solved
the aspect problem the two entries above were working around. Re-read from
scratch rather than tweaked: **1449×2545 → 1449×2200.**

**Equal thirds is what the resize bought.** The old frame split 854/854/837 — a
1.70 aspect, and a fixed-aspect panel cannot be both full-bleed and one viewport
below about 1.87. 2200/3 = 733.33 gives **1449/733.33 = 1.976** for all three
panels: past the threshold, uniform, so the three sheets are the same size and
each one fits. The 72px overflow at 1366×768 is gone.

Two changes in that pass are decisions, not resizes:

- **The ground is cream.** `#1e1516` → `#f8f7f4`, which is exactly the Notes
  world's own `--paper`. This retires the conflict flagged when page three was
  first placed — a dark poster in the portfolio's one deliberately LIGHT world.
  It now agrees with it, and on a screen wider than 1449 the poster's margins
  blend into the page instead of cutting a dark band across it.
- **The yellow went `#ffe991` → `#ffdc51`**, and the role bar white → `#1e1516`
  to sit on the new ground.

Asset churn worth knowing: `subtract.svg` was **redrawn**, not just rescaled
(809.6×1060.1 → 841.9×794.0), `photo-top.png` was re-exported, `vector19` is
gone and **`vector21` is new** (the small star). All replaced in
`public/collage/`.

Measured after the change — full-bleed and fitting at every size, and never
upscaled past 1:1:

| | poster width | scale | panel h | room | over |
|---|---|---|---|---|---|
| 1366×768 | 1351 | 0.93× | 684 | 724 | **0** |
| 1440×900 | 1425 | 0.98× | 721 | 856 | **0** |
| 1920×1080 | 1449 | **1.00×** | 733 | 1036 | **0** |

The M renders at 436.5px against its 436.542-unit design size. All seven assets
load, no broken images, `scrollWidth === clientWidth`. Typecheck and build clean.

### Collage, third pass: a lotus behind the M and a photographic name panel

She kept editing 296:533, so this has now been re-read three times. **Treat the
node as authoritative and these numbers as a snapshot.** Frame 2200 → **2150**,
so the panels are 716.67 and the aspect is 2.022 — further past the 1.87
threshold than before, still uniform, still fitting everywhere.

Three real changes, on top of a general shift upward (the pink block, both
banners, both words and the yellow band all moved up 19–50 units):

- **A big lotus behind the M** (1079.8 units, rotated −16.65°) as the backmost
  layer. It has its own export, `lotus-big.png` — Figma ships *two different
  files* for the same flower here and the band's tile is the smaller one, which
  would visibly soften at this size.
  There is also a second node at the same size and rotation 8 units away
  (`280:8390`) **containing no image at all** — an empty duplicate. It paints
  nothing, so it is not reproduced.
- **The flat `#1e1516` rectangle became a photographic name panel**
  (`image68.png`, 420×290.5) with मृणाली set over it thirty times in white on
  `mix-blend-mode: overlay`. **`isolation: isolate` on that panel is
  load-bearing** — without it the blend's backdrop is the whole poster, so the
  type would take its contrast from the lotus band and tiles instead of from the
  photograph it is written on.
- **The Devanagari moved off the poem card into that panel**, and the card's
  first line gained a full stop. It reads in one place now instead of two.

Accessibility note: the thirty repetitions are `aria-hidden` and the panel
carries an `aria-label` instead. Read out, thirty copies of the same name is
noise; what a screen reader should get is what the panel *is*.

Verified: all nine assets load, no broken images, poster height 912 against 913
expected, aspect 2.022 on all three panels with zero overflow, and panels one
and three checked against the Figma render.

## The cover gets a menu bar, and the dock gets names (2026-08-04)

**Supersedes the 2026-07-18 bullet "the cover has exactly two entry systems"**,
which deleted the design/tech text links from the cover header on the grounds
that "the Explore CTAs are the narrative primary, the dock is the system layer".
That held for design and tech. It did not hold for the site.

The audit that prompted this:

- **Three of six destinations were dock-only.** Gallery, Notes and the Pond
  appeared in *no other navigation anywhere*.
- **The dock had no labels** — six unlabelled glyphs. Already logged in that
  same July entry as deferred: "no dock hover name-tags yet".
- **The cover had no navigation at all until the scroll-scrub settled.**
  `App.jsx` passes `visible={route === "" ? coverSettled : true}`. Land and
  don't scroll and you had a monogram, a GitHub icon and an email address.
- **`WorldTabs` covers 2 of 6.** It is a design↔tech switcher, not site nav.

### A menu bar, not a nav bar

A conventional top nav was rejected: the dock-as-navigation is a deliberate OS
conceit, and re-adding world links to the header re-creates exactly the
"redundant third path" July deleted. **A desktop has both a dock and a menu
bar**, so this belongs to the same fiction rather than arguing with it.

- It calls the **same `onChoose`** the Explore CTAs and the dock already use —
  `App` turns that into a hash change for any of the five worlds. No second
  navigation path, just a second surface for the one that exists.
- Styled from the header's existing vocabulary, not a new one: `--void-dim` →
  `--void-text` on the same 0.25s ease `.cover-social a` uses. Measured
  **7.55:1** against the cover's near-black — past AAA.
- **Claude is absent from the menu.** It navigates nowhere; a named menu item
  that does nothing is worse than no item. It keeps its dock tile, now labelled
  "Claude · soon" so the tag admits it.
- **The menu shrinks on mobile, it does not hide.** The dead
  `.cover-links { display: none }` rule that used to sit in the ≤768 block was
  the old links' leftover, and hiding would leave a phone with no navigation
  before the scrub — the exact problem being fixed.
- **The dock's reveal is unchanged.** It still surfaces at the divergence; with
  the menu bar present the cover is no longer navigation-less while it waits.

### The dock's name-tags cost `.dock-glass` its `overflow: hidden`

The tags hang above the tiles and the tiles live inside the slab, so they were
clipped to nothing. That `hidden` existed only to round the three glass layers
off to the slab's radius, so **each layer now carries `border-radius: inherit`**
(and the distortion layer keeps its own `overflow: hidden`, since a
`backdrop-filter` still has to be clipped) and the slab is `overflow: visible`.
**If the dock ever looks square-cornered again, that inherit is what went
missing.** Verified: all three layers compute 22.4px, and the tag's box clears
the slab's top edge.

Tags are `aria-hidden`; the button's existing `aria-label` stays the accessible
name and says more than the tag does. Same split `.nw-milestone` uses. They
respond to `:focus-visible` as well as `:hover`, because a keyboard user gets
the same guessing game and none of the hover.
