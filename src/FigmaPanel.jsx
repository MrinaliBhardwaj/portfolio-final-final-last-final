// The design world's left sidebar — the tech explorer's twin, restyled as
// Figma's layers panel: white panel, a Pages list up top (the two worlds as
// pages of one file, current one checked), then the page's sections as Frame
// layers with expandable text/image/component children. Same interaction
// contract as the explorer: expand/collapse, hover states, scroll-spy active
// row, click to jump. Selection reads Figma-blue on purpose — the panel is
// the app's chrome, not the portfolio's palette.
import { useState } from "react";
import { FigmaMark } from "./BrandIcons.jsx";
import { FIGMA_PAGES } from "./figma-pages.js";

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
  // Shapes — rectangles, ellipses, lines, vectors. Figma gives each its own
  // glyph; one honest "this is drawn geometry" mark is enough here, and
  // without it every rectangle in a real layer tree would read as a frame.
  vector: (
    <svg viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <path
        d="M2.2 8.6 6 2.4l3.8 6.2H2.2Z"
        stroke="currentColor"
        strokeWidth="1.1"
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
function FrameLayer({ frame, activeId, onSelect, startOpen = true }) {
  const [open, setOpen] = useState(startOpen);
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

      {/* A COLLAPSED ROW IS NOT A TAB STOP.
          `.fp-children.is-closed` is `opacity: 0; height: 0; overflow: hidden`
          — invisible, but every button inside stays focusable and stays in the
          accessibility tree. That cost nothing while every frame started open;
          the moment Layover's forty-five started closed it became 212
          invisible tab stops between the first layer and the canvas. So the
          subtree is taken out of the tab order and hidden from assistive tech
          while it is shut, which is what the zero height already means
          visually. */}
      {frame.children && (
        <div
          className={cx("fp-children", open ? "is-open" : "is-closed")}
          style={{ maxHeight: open ? `${frame.children.length * 40}px` : "0px" }}
          aria-hidden={open ? undefined : "true"}
        >
          {frame.children.map((child) => (
            <div className="fp-row fp-row--child" key={child.name}>
              <button
                type="button"
                className="fp-row-main"
                onClick={() => onSelect(frame.id)}
                tabIndex={open ? 0 : -1}
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
  pageSlug = "",
}) {
  // ONE PAGE, WHICH IS THE TRUTH ABOUT THIS FILE (19 Aug 2026).
  //
  // This list has been wrong twice in opposite directions. It first showed
  // "design" and "tech" as display-only text, which was two files pretending to
  // be two pages — the file tabs in the title bar (WorldTabs) already switch
  // those. It then listed one page per project, because #/design/<slug> really
  // did exist. Those pages are gone: the case study is a window on the desktop
  // now, and listing pages that resolve to a redirect would be the panel lying
  // about the file again.
  //
  // AND NOW IT HAS MORE THAN ONE, HONESTLY (2 Sep 2026). The pages after
  // "design" are the project pages — each one a real canvas of that project's
  // frames at the coordinates its Figma file gives them (figma-pages.js), not a
  // route that redirects somewhere else. The rule the two wrong versions broke
  // is the same rule this keeps: the list may only name pages that exist.
  const pages = [
    { name: "design", href: "#/design", slug: "" },
    ...FIGMA_PAGES.map((p) => ({ name: p.name, href: `#/design/${p.slug}`, slug: p.slug })),
  ].map((p) => ({ ...p, current: p.slug === pageSlug }));

  // A SHORT PAGE ARRIVES OPEN; A LONG ONE ARRIVES READABLE.
  //
  // Every frame used to start expanded, which is right for the design page's
  // nine and for Regis's twelve. Layover has forty-five, and once its frames
  // carried real layers that became about two hundred rows unfurled on
  // arrival — a scroll bar where a tree should be. Figma itself opens a file
  // with the tree collapsed for the same reason. The threshold is derived
  // from the data rather than passed in, so a frame added later is covered
  // without touching either call site.
  const startOpen = frames.length <= 12;

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
        <FigmaMark size={13} aria-hidden="true" />
        <span>mrinali &middot; portfolio</span>
      </div>

      <p className="fp-label">Pages</p>
      <div className="fp-pages">
        {pages.map((p) => (
          <a
            key={p.name}
            href={p.href}
            className={cx("fp-page", p.current && "is-current")}
            aria-current={p.current ? "page" : undefined}
            onClick={onClose}
          >
            <span className="fp-page-check">{p.current && ICONS.check}</span>
            {p.name}
          </a>
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
            startOpen={startOpen}
          />
        ))}
      </div>
    </aside>
  );
}
