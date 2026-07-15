# Design decisions

Decisions that survive rebuilds. Append, don't rewrite history.

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
