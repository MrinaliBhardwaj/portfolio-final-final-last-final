// The open-pages tab strip: on desktop the two flagship worlds read as
// documents open inside the world's own app — VS Code editor tabs on tech,
// Figma file tabs on design. This bar is also the worlds' shared title bar,
// so it carries the two wayfinding gestures every world agrees on:
//   · the "mb" home badge (left) → back to the void, like clicking a logo
//   · one close × (right) → quit the app, back to the void
// The TABS only switch design ↔ tech. They no longer close anything: closing a
// document shouldn't eject you from the editor, so the per-tab × is gone and
// the single app-close × owns that job. Hidden on mobile, where the dock alone
// carries switching and each world's own mobile header carries home.
import { Code2 } from "lucide-react";
import { FigmaMark } from "./BrandIcons.jsx";
import WindowLights from "./WindowLights.jsx";

// file-flavoured labels in BOTH chromes now — the filenames are the charm, and
// keeping them identical kills the old "design.fig here, plain 'design' there"
// split the two tab systems used to have
const LABELS = { design: "design.fig", tech: "tech.jsx" };

// The figma mark is tinted to each chrome's foreground (greenish-grey on the
// tech tab bar, light grey on the Figma dark toolbar). That used to be a
// FIGMA_TINT map templated into a CDN URL — so the same icon was fetched twice,
// once per colour. It's `color` on .wt--code / .wt--figma in world-tabs.css now.

export default function WorldTabs({ world }) {
  const chrome = world === "tech" ? "code" : "figma";

  const go = (w) => {
    if (w !== world) window.location.hash = "/" + w;
  };

  const tabs = [
    {
      world: "design",
      icon: <FigmaMark className="wt-tab-icon" aria-hidden="true" />,
    },
    {
      world: "tech",
      icon: (
        <Code2 className="wt-tab-icon" strokeWidth={1.6} aria-hidden="true" />
      ),
    },
  ];

  return (
    <nav className={`wt wt--${chrome}`} aria-label="Open pages">
      {/* The lights own the top-LEFT corner alone, the way a Mac window's do —
          nothing else shares that end of the bar. The monogram used to sit
          immediately after them and now sits at the far right (18 Aug 2026, by
          request): it is the identity mark, not a window control, and the two
          reading as one cluster was what made the corner feel crowded. */}
      <WindowLights world={world} label={LABELS[world]} />

      {tabs.map((t) => {
        const isActive = t.world === world;
        return (
          <button
            key={t.world}
            type="button"
            className={`wt-tab${isActive ? " is-active" : ""}`}
            onClick={() => go(t.world)}
            aria-current={isActive ? "page" : undefined}
          >
            {t.icon}
            <span>{LABELS[t.world]}</span>
          </button>
        );
      })}

      {/* home, now at the FAR RIGHT — `margin-left: auto` in world-tabs.css is
          what pushes it there, the same trick the old close × used to hold that
          end. The span is the optical-centring hook: Pinyon sits low in its em
          box and needs a nudge, but transforming the anchor would drag its
          hover background along with it. */}
      <a className="wt-home" href="#/" aria-label="Mrinali Bhardwaj — home">
        <span>mb</span>
      </a>
    </nav>
  );
}
