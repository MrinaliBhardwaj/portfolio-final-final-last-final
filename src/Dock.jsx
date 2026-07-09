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
// tech world; Gallery / Claude / Game respond but don't navigate yet.
import { motion } from "framer-motion";
import { Code2 } from "lucide-react";

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
function DockItem({ app }) {
  return (
    <button
      type="button"
      className={`dock-item${app.action ? "" : " is-placeholder"}`}
      onClick={app.action || undefined}
      aria-label={app.label}
    >
      <span className="dock-item-glyph">{app.node}</span>
    </button>
  );
}

export default function Dock({ visible, onChoose }) {
  // real brand marks via Simple Icons (same CDN pattern as the nav's GitHub
  // logo) — a single monochrome tint keeps them from reading as "colorful
  // app icons" and closer to a quiet, premium glass surface. VS Code has no
  // entry in Simple Icons (Microsoft's mark is trademark-restricted there,
  // the same reason lucide-react dropped it too), so it keeps a line glyph.
  const apps = [
    {
      key: "figma",
      label: "Figma — enter the design world",
      action: () => onChoose("design"),
      node: (
        <img
          className="dock-item-icon"
          src="https://cdn.simpleicons.org/figma/e8e8ec"
          alt=""
          aria-hidden="true"
        />
      ),
    },
    {
      key: "vscode",
      label: "VS Code — enter the tech world",
      action: () => onChoose("tech"),
      node: <Code2 className="dock-item-icon dock-item-icon--glyph" strokeWidth={1.4} aria-hidden="true" />,
    },
    {
      key: "gallery",
      label: "Gallery (coming soon)",
      action: null,
      node: (
        <img
          className="dock-item-icon"
          src="https://cdn.simpleicons.org/googlephotos/e8e8ec"
          alt=""
          aria-hidden="true"
        />
      ),
    },
    {
      key: "claude",
      label: "Claude (coming soon)",
      action: null,
      node: (
        <img
          className="dock-item-icon"
          src="https://cdn.simpleicons.org/claude/e8e8ec"
          alt=""
          aria-hidden="true"
        />
      ),
    },
    {
      key: "game",
      label: "Game (coming soon)",
      action: null,
      node: (
        <img
          className="dock-item-icon"
          src="https://cdn.simpleicons.org/steam/e8e8ec"
          alt=""
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
            <DockItem key={a.key} app={a} />
          ))}
        </div>
      </div>
      <GlassFilter />
    </motion.div>
  );
}
