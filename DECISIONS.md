# Design decisions

Decisions that survive rebuilds. Append, don't rewrite history.

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
