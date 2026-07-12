# Design decisions

Decisions that survive rebuilds. Append, don't rewrite history.

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
