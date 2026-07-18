# Design decisions

Decisions that survive rebuilds. Append, don't rewrite history.

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
