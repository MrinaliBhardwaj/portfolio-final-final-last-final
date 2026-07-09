# Design decisions

Decisions that survive rebuilds. Append, don't rewrite history.

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
