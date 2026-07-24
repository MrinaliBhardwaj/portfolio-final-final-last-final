// The design world's left sidebar — the tech explorer's twin, restyled as
// Figma's layers panel: white panel, a Pages list up top (the two worlds as
// pages of one file, current one checked), then the page's sections as Frame
// layers with expandable text/image/component children. Same interaction
// contract as the explorer: expand/collapse, hover states, scroll-spy active
// row, click to jump. Selection reads Figma-blue on purpose — the panel is
// the app's chrome, not the portfolio's palette.
import { useState } from "react";

function cx(...parts) {
  return parts.filter(Boolean).join(" ");
}

/* Figma's layer glyphs, redrawn as 12px strokes */
const ICONS = {
  frame: (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M4 1v10M8 1v10M1 4h10M1 8h10"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
      />
    </svg>
  ),
  text: (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2.5 3h7M6 3v6.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  ),
  image: (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <rect
        x="1.5"
        y="1.5"
        width="9"
        height="9"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.1"
      />
      <circle cx="4.4" cy="4.5" r="0.9" fill="currentColor" />
      <path
        d="M2.5 9l2.3-2.3 1.8 1.8L9 6l1.5 1.5"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  component: (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M6 1.4L10.6 6L6 10.6L1.4 6Z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  ),
  check: (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2.5 6.5l2.4 2.4L9.7 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
  chevron: (
    <svg viewBox="0 0 6 8" fill="none" aria-hidden="true">
      <path
        d="M1 1l4 3-4 3"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

// one section-frame with its expandable child layers
function FrameLayer({ frame, activeId, onSelect }) {
  const [open, setOpen] = useState(true);
  const isActive = frame.id === activeId;

  return (
    <div>
      <div className={cx("fp-row", isActive && "is-active")}>
        <button
          type="button"
          className={cx("fp-chevron", open && "is-open")}
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-label={`${open ? "Collapse" : "Expand"} ${frame.name}`}
        >
          {ICONS.chevron}
        </button>
        <button
          type="button"
          className="fp-row-main"
          onClick={() => onSelect(frame.id)}
          aria-current={isActive ? "true" : undefined}
        >
          <span className="fp-glyph">{ICONS.frame}</span>
          <span className="fp-name">{frame.name}</span>
        </button>
      </div>

      {frame.children && (
        <div
          className={cx("fp-children", open ? "is-open" : "is-closed")}
          style={{ maxHeight: open ? `${frame.children.length * 40}px` : "0px" }}
        >
          {frame.children.map((child) => (
            <div className="fp-row fp-row--child" key={child.name}>
              <button
                type="button"
                className="fp-row-main"
                onClick={() => onSelect(frame.id)}
              >
                <span className="fp-glyph">{ICONS[child.icon]}</span>
                <span className="fp-name">{child.name}</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function FigmaPanel({
  frames,
  activeId,
  onSelect,
  open = false,
  onClose,
}) {
  // Pages is display-only: it says "one portfolio file, two pages," but it is
  // NOT a switcher. Switching worlds has a single home — the file tabs in the
  // title bar (WorldTabs) — so the panel doesn't offer a competing second one.
  const pages = [
    { name: "design", current: true },
    { name: "tech", current: false },
  ];

  // On phones the panel is a bottom SHEET pulled up from the toolbar's Layers
  // button (Figma mobile's own gesture). Picking a layer jumps to the frame and
  // dismisses the sheet, so the tree never sits on top of what you just chose.
  const pick = (id) => {
    onSelect(id);
    onClose?.();
  };

  return (
    <aside
      className={cx("fp", open && "is-open")}
      id="dw-layers"
      aria-label="Pages and layers"
    >
      {/* sheet affordances — hidden on desktop, where .fp is a fixed sidebar */}
      <button
        type="button"
        className="fp-grab"
        onClick={onClose}
        aria-label="Close layers"
      >
        <span aria-hidden="true" />
      </button>

      <div className="fp-file">
        <img
          src="https://cdn.simpleicons.org/figma/d0d0d0"
          alt=""
          aria-hidden="true"
          width="13"
          height="13"
        />
        <span>mrinali &middot; portfolio</span>
      </div>

      <p className="fp-label">Pages</p>
      <div className="fp-pages">
        {pages.map((p) => (
          <div
            key={p.name}
            className={cx("fp-page", p.current && "is-current")}
            aria-current={p.current ? "page" : undefined}
          >
            <span className="fp-page-check">{p.current && ICONS.check}</span>
            {p.name}
          </div>
        ))}
      </div>

      <div className="fp-div" aria-hidden="true" />

      <p className="fp-label">Layers</p>
      <div className="fp-tree">
        {frames.map((f) => (
          <FrameLayer
            key={f.id}
            frame={f}
            activeId={activeId}
            onSelect={pick}
          />
        ))}
      </div>
    </aside>
  );
}
