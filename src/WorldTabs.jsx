// The open-pages tab strip: on desktop the two worlds read as documents open
// inside the world's own app — VS Code editor tabs on the tech page, Figma
// file tabs on the design page. Clicking the other tab switches worlds
// directly (a quick tab switch, not the cover's wipe ceremony); closing the
// active tab returns to the cover. Hidden on mobile, where the dock alone
// carries world switching.
import { Code2, X } from "lucide-react";

// per-chrome tab labels: file-flavoured in the editor, plain names in Figma
const LABELS = {
  code: { design: "design.fig", tech: "tech.jsx" },
  figma: { design: "design", tech: "tech" },
};

// figma brand mark tinted to each chrome's foreground (both dark UIs now:
// greenish-grey on the tech tab bar, light grey on the Figma dark toolbar)
const FIGMA_TINT = { code: "7e8d82", figma: "d0d0d0" };

export default function WorldTabs({ world }) {
  const chrome = world === "tech" ? "code" : "figma";

  const go = (w) => {
    if (w !== world) window.location.hash = "/" + w;
  };
  const close = () => {
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
      {chrome === "figma" && (
        <img
          className="wt-app-mark"
          src="https://cdn.simpleicons.org/figma/d0d0d0"
          alt=""
          aria-hidden="true"
        />
      )}
      {tabs.map((t) => {
        const isActive = t.world === world;
        return (
          <div
            key={t.world}
            className={`wt-tab${isActive ? " is-active" : ""}`}
          >
            <button
              type="button"
              className="wt-tab-main"
              onClick={() => go(t.world)}
              aria-current={isActive ? "page" : undefined}
            >
              {t.icon}
              <span>{LABELS[chrome][t.world]}</span>
            </button>
            {isActive && (
              <button
                type="button"
                className="wt-tab-close"
                onClick={close}
                aria-label="Close tab and return to the start"
              >
                <X size={13} strokeWidth={1.6} aria-hidden="true" />
              </button>
            )}
          </div>
        );
      })}
    </nav>
  );
}
