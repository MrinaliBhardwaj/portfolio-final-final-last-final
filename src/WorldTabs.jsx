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
import { Code2, X } from "lucide-react";

// file-flavoured labels in BOTH chromes now — the filenames are the charm, and
// keeping them identical kills the old "design.fig here, plain 'design' there"
// split the two tab systems used to have
const LABELS = { design: "design.fig", tech: "tech.jsx" };

// figma brand mark tinted to each chrome's foreground (greenish-grey on the
// tech tab bar, light grey on the Figma dark toolbar)
const FIGMA_TINT = { code: "7e8d82", figma: "d0d0d0" };

export default function WorldTabs({ world }) {
  const chrome = world === "tech" ? "code" : "figma";

  const go = (w) => {
    if (w !== world) window.location.hash = "/" + w;
  };
  const home = () => {
    window.location.hash = "/";
  };

  const tabs = [
    {
      world: "design",
      icon: (
        <img
          className="wt-tab-icon"
          src={`https://cdn.simpleicons.org/figma/${FIGMA_TINT[chrome]}`}
          alt=""
          aria-hidden="true"
        />
      ),
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
      {/* home: the same badge, same corner, same destination as every world */}
      <a className="wt-home" href="#/" aria-label="Mrinali Bhardwaj — home">
        mb
      </a>

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

      {/* one close for the whole app; sits at the far right of the title bar */}
      <button
        type="button"
        className="wt-close"
        onClick={home}
        aria-label="Close and return to the start"
      >
        <X size={14} strokeWidth={1.6} aria-hidden="true" />
      </button>
    </nav>
  );
}
