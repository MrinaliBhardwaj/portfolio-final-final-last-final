// A floating liquid-glass dock — adapted from the standalone liquid-glass
// component (its SVG refraction filter and layered-glass structure are
// preserved) into this project's plain-React + CSS stack. The full-screen
// demo wrapper, background image and moving-background logic are stripped; the
// dock inherits the portfolio's own background (the lotus/starfield refract
// through the glass).
//
// It surfaces at the divergence point like a hidden OS layer: rises from
// below, fades in, and its blur resolves to sharpness. Each icon enlarges in
// place on its own hover (plain CSS scale, centred, no neighbor effect and no
// lift) — matching the source component's `hover:scale-110` exactly, not a
// pointer-distance "magnetic" simulation. Figma → design world, VS Code →
// tech world, Notes → the archived first drafts, Gallery → the dome, Game →
// the Lotus Pond.
//
// EVERY TILE NAVIGATES. The Claude tile was removed on request (4 Aug 2026),
// which retires the "remove or wire it" note standing against it since July —
// it had rendered and responded to a click while going nowhere. With it gone
// nothing here is a placeholder, so the `is-placeholder` branch and its two CSS
// rules went too rather than sitting dead. `ClaudeMark` is still exported from
// BrandIcons if it ever comes back.
import { motion } from "framer-motion";
import { Code2, Flower2, NotebookPen } from "lucide-react";
import { FigmaMarkColor, GooglePhotosMarkColor } from "./BrandIcons.jsx";

const EASE = [0.22, 1, 0.36, 1];

// The refraction filter, preserved from the source component but with a gentler
// displacement scale suited to a small, thin dock.
function GlassFilter() {
  return (
    <svg className="dock-filter" aria-hidden="true">
      <filter
        id="dock-glass-distortion"
        x="0%"
        y="0%"
        width="100%"
        height="100%"
        filterUnits="objectBoundingBox"
      >
        <feTurbulence
          type="fractalNoise"
          baseFrequency="0.001 0.006"
          numOctaves="1"
          seed="17"
          result="turbulence"
        />
        <feComponentTransfer in="turbulence" result="mapped">
          <feFuncR type="gamma" amplitude="1" exponent="10" offset="0.5" />
          <feFuncG type="gamma" amplitude="0" exponent="1" offset="0" />
          <feFuncB type="gamma" amplitude="0" exponent="1" offset="0.5" />
        </feComponentTransfer>
        <feGaussianBlur in="turbulence" stdDeviation="3" result="softMap" />
        <feSpecularLighting
          in="softMap"
          surfaceScale="5"
          specularConstant="1"
          specularExponent="100"
          lightingColor="white"
          result="specLight"
        >
          <fePointLight x="-200" y="-200" z="300" />
        </feSpecularLighting>
        <feComposite
          in="specLight"
          operator="arithmetic"
          k1="0"
          k2="1"
          k3="1"
          k4="0"
          result="litImage"
        />
        <feDisplacementMap
          in="SourceGraphic"
          in2="softMap"
          scale="64"
          xChannelSelector="R"
          yChannelSelector="G"
        />
      </filter>
    </svg>
  );
}

// One dock app. The tile's layout box never changes size — the bar can't
// grow or shift, and no other icon is affected. The glyph itself just scales
// up, centred, on its own :hover — a plain CSS transition, no JS physics.
// A macOS-style dot beneath the icon marks the world currently open.
function DockItem({ app, active, minimised }) {
  // The dot means "open", which now covers two states: the world you are IN,
  // and a world you left with the yellow light — minimised, still open, its
  // icon still marked in the dock, exactly as macOS does it.
  const isOn =
    !!app.world && (app.world === active || minimised.includes(app.world));
  return (
    <button
      type="button"
      className={`dock-item${isOn ? " is-active" : ""}`}
      onClick={app.action}
      aria-label={app.label}
      aria-current={isOn ? "page" : undefined}
    >
      <span className="dock-item-glyph">{app.node}</span>
      {/* the name-tag, macOS-style, on hover and on keyboard focus.
          aria-hidden and visual-only: the button's own aria-label above is
          already the accessible name and carries more (it says what the world
          IS, not just what it is called), so announcing this too would just
          repeat a worse version of it. Same split the scrapbook's milestone
          dots use — see .nw-milestone in notes-world.css. */}
      <span className="dock-item-name" aria-hidden="true">
        {app.name}
      </span>
      <span className="dock-item-dot" aria-hidden="true" />
    </button>
  );
}

export default function Dock({ visible, onChoose, active, minimised = [] }) {
  // COLORFUL, LIKE A REAL DOCK (2026-08-18). The single monochrome tint was a
  // deliberate premium-glass choice, and it is superseded: five same-grey
  // glyphs read as "icon row", and a dock reads as a dock because its icons
  // are colourful and distinct. The two brand marks use their real multicolor
  // geometry (FigmaMarkColor / GooglePhotosMarkColor in BrandIcons.jsx). The
  // lucide glyphs CANNOT become brand marks — VS Code's and Apple Notes' are
  // trademark-restricted, the same reason Simple Icons and lucide dropped
  // them — so they carry their brand's COLOUR instead, set per-icon in
  // dock.css (--code, --notes, --game modifiers).
  const apps = [
    {
      key: "figma",
      name: "Design",
      label: "Figma — enter the design world",
      world: "design",
      action: () => onChoose("design"),
      node: (
        <FigmaMarkColor className="dock-item-icon" aria-hidden="true" />
      ),
    },
    {
      key: "vscode",
      name: "Tech",
      label: "VS Code — enter the tech world",
      world: "tech",
      action: () => onChoose("tech"),
      node: (
        <Code2
          className="dock-item-icon dock-item-icon--glyph dock-item-icon--code"
          strokeWidth={1.4}
          aria-hidden="true"
        />
      ),
    },
    {
      key: "notes",
      name: "Notes",
      label: "Notes — the archived first drafts",
      world: "notes",
      action: () => onChoose("notes"),
      node: (
        <NotebookPen
          className="dock-item-icon dock-item-icon--glyph dock-item-icon--notes"
          strokeWidth={1.4}
          aria-hidden="true"
        />
      ),
    },
    {
      key: "gallery",
      name: "Gallery",
      label: "Gallery — open the dome gallery",
      world: "gallery",
      action: () => onChoose("gallery"),
      node: (
        <GooglePhotosMarkColor className="dock-item-icon" aria-hidden="true" />
      ),
    },
    {
      key: "game",
      name: "Game",
      // The visible tag is the accessible name's FIRST word on purpose. Voice
      // control matches what a user can see ("click Game"), so a label that
      // opened with "Lotus Pond" while the tag said "Game" would be unspeakable.
      label: "Game — the Lotus Pond, catch coding bugs with a pixel frog",
      world: "pond",
      action: () => onChoose("pond"),
      node: (
        <Flower2
          className="dock-item-icon dock-item-icon--glyph dock-item-icon--game"
          strokeWidth={1.4}
          aria-hidden="true"
        />
      ),
    },
  ];

  return (
    <motion.div
      className="dock"
      style={{ pointerEvents: visible ? "auto" : "none" }}
      initial={false}
      animate={
        visible
          ? { y: 0, opacity: 1, filter: "blur(0px)" }
          : { y: 150, opacity: 0, filter: "blur(14px)" }
      }
      transition={{ duration: 1.4, ease: EASE }}
      aria-hidden={!visible}
    >
      <div className="dock-glass">
        <div className="dock-glass-distortion" aria-hidden="true" />
        <div className="dock-glass-tint" aria-hidden="true" />
        <div className="dock-glass-bevel" aria-hidden="true" />
        <div className="dock-row">
          {apps.map((a) => (
            <DockItem key={a.key} app={a} active={active} minimised={minimised} />
          ))}
        </div>
      </div>
      <GlassFilter />
    </motion.div>
  );
}
