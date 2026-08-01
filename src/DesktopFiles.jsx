// The desktop files: the second half of the cover is a MacBook screen, and a
// desktop with a dock but no files on it is a screenshot, not a machine. Three
// icons fly up from the bottom edge alongside the dock and settle into place —
// the two résumés as documents and GitHub as a folder.
//
// They live INSIDE .cover-stage rather than beside the dock in App, for two
// reasons: the stage is `overflow: hidden` and pinned to the viewport, so the
// files launching from below the fold are clipped by the screen edge exactly
// the way they should be; and they leave with the cover's own fade instead of
// popping out the instant a world opens. The dock is the one thing that
// genuinely outlives the route — these belong to the cover.
//
// Icons are inline SVG, not image files, for the same reason BrandIcons.jsx
// exists: no extra requests, no remote origin, and they stay sharp at whatever
// size the clamp lands on.
import { motion } from "framer-motion";
import { GitHubMark } from "./BrandIcons.jsx";

const EASE = [0.22, 1, 0.36, 1];

// A macOS-style document sheet: rounded page, folded top-right corner, two
// lines of "content", and a coloured band carrying the extension. One shape for
// both documents — only the band's colour and label differ.
function DocIcon({ ext, accent, gradient }) {
  return (
    <svg viewBox="0 0 56 70" className="dfile-art" aria-hidden="true">
      <defs>
        <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#fbfbfd" />
          <stop offset="1" stopColor="#dededf" />
        </linearGradient>
      </defs>
      {/* the page */}
      <path
        d="M6 2h28l20 20v42a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V6a4 4 0 0 1 4-4z"
        fill={`url(#${gradient})`}
      />
      {/* the turned corner, a shade darker so the fold reads */}
      <path d="M34 2l20 20H38a4 4 0 0 1-4-4V2z" fill="#c3c3ca" />
      {/* a suggestion of text on the page */}
      <rect x="12" y="31" width="32" height="3" rx="1.5" fill="#c9c9d2" />
      <rect x="12" y="39" width="23" height="3" rx="1.5" fill="#d5d5dd" />
      {/* the type band */}
      <rect x="8" y="47" width="40" height="15" rx="3.5" fill={accent} />
      <text
        x="28"
        y="54.9"
        textAnchor="middle"
        dominantBaseline="middle"
        className="dfile-ext"
        fill="#fff"
      >
        {ext}
      </text>
    </svg>
  );
}

// The classic two-tone folder — back panel with the tab, lighter front panel
// over it — carrying the GitHub mark, so it reads as "my code" and not as an
// empty folder someone forgot to name.
function FolderIcon() {
  return (
    <svg viewBox="0 0 64 54" className="dfile-art" aria-hidden="true">
      <defs>
        <linearGradient id="dfile-folder-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#7ec8f2" />
          <stop offset="1" stopColor="#4f9fd8" />
        </linearGradient>
        <linearGradient id="dfile-folder-front" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8fd4fa" />
          <stop offset="1" stopColor="#57ade6" />
        </linearGradient>
      </defs>
      <path
        d="M3 10a4 4 0 0 1 4-4h15.4a4 4 0 0 1 2.83 1.17L29 11h28a4 4 0 0 1 4 4v31a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4z"
        fill="url(#dfile-folder-back)"
      />
      <path
        d="M7 17h50a4 4 0 0 1 4 4v25a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V21a4 4 0 0 1 4-4z"
        fill="url(#dfile-folder-front)"
      />
      <GitHubMark x={21} y={22} size={22} fill="rgba(255,255,255,0.94)" />
    </svg>
  );
}

// `left`/`top` are the ICON'S CENTRE, not the tile's corner — the tile is wider
// than the artwork (the label needs the room) and taller (the label sits under
// it), so corner anchoring made every position an offset puzzle. The CSS pulls
// the tile back by half its own box, which lets these read as the point each
// file sits on. Percentages, so the arrangement holds its proportions instead
// of drifting on a wider screen.
//
// The three points are art-directed: they sit inboard, in the quiet gaps around
// the lotus rather than jammed into the screen corners, which is what keeps the
// scatter from looking like a filed-away grid. Sides still match the worlds they
// belong to — the design résumé on the design half, the tech résumé on the tech
// half — and the tilt is a HOVER state now, so at rest they hang straight.
//
// Names echo the world tabs (`design.fig`, `tech.jsx`), so the extension is what
// tells you which half of the person a file belongs to. Short on purpose: at
// this icon size a long name is wider than the artwork and stops reading as a
// label. The aria strings below carry the full meaning.
const FILES = [
  {
    key: "design",
    label: "design.pdf",
    aria: "Design resume — PDF, opens in a new tab",
    href: "/resume-design.pdf",
    external: false,
    art: <DocIcon ext="PDF" accent="#d8544c" gradient="dfile-sheet-pdf" />,
    left: 30.1,
    top: 25.2,
    tilt: -7,
    delay: 0.24,
  },
  {
    key: "tech",
    label: "tech.ts",
    aria: "Tech resume — PDF, opens in a new tab",
    href: "/resume-tech.pdf",
    external: false,
    // .ts because this is the engineering half of the same person — the file on
    // disk is a PDF, the icon is the joke.
    art: <DocIcon ext="TS" accent="#3178c6" gradient="dfile-sheet-ts" />,
    left: 69.2,
    top: 35.2,
    tilt: 6,
    delay: 0.38,
  },
  {
    key: "github",
    label: "github",
    aria: "GitHub — opens in a new tab",
    href: "https://github.com/MrinaliBhardwaj",
    external: true,
    art: <FolderIcon />,
    left: 24.7,
    top: 74.9,
    tilt: -5,
    delay: 0.52,
  },
];

// Roughly a tile's worth of slack past the edge, so a file is fully clear of the
// screen before it launches rather than half-clipped at rest.
const TILE_H = 150;

export default function DesktopFiles({ visible }) {
  // How far below the bottom edge each file waits. A flat offset can't work:
  // the tiles rest at different heights, so one number either leaves the top
  // pair still on screen (they'd fade in place instead of flying up) or throws
  // the bottom one a screen and a half. Distance is per tile, measured from the
  // stage's own bottom — and since the stage is exactly 100dvh, the viewport IS
  // that measurement. Read at render, the way Cover.jsx reads it for the name's
  // rise; `visible` flipping is what re-renders this, which is also the only
  // moment the value is used.
  const vh = typeof window !== "undefined" ? window.innerHeight : 900;
  const riseFor = (top) => vh * (1 - top / 100) + TILE_H;

  return (
    <div className="cover-desktop" aria-hidden={!visible}>
      {FILES.map((f) => (
        <motion.a
          key={f.key}
          className="dfile"
          style={{
            top: `${f.top}%`,
            left: `${f.left}%`,
            // the resting lean, handed to CSS: Framer owns this element's
            // transform for the launch, so a hover tilt has to live on the
            // inner icon instead of fighting it
            "--tilt": `${f.tilt}deg`,
            pointerEvents: visible ? "auto" : "none",
          }}
          href={f.href}
          target="_blank"
          rel={f.external ? "noreferrer" : undefined}
          aria-label={f.aria}
          tabIndex={visible ? 0 : -1}
          initial={false}
          // They land STRAIGHT. The lean is what hovering one does to it.
          animate={
            visible
              ? { y: 0, opacity: 1, scale: 1 }
              : { y: riseFor(f.top), opacity: 0, scale: 0.88 }
          }
          // Equal durations over unequal distances, deliberately: the two up in
          // the corners have most of a screen to cross and the folder barely a
          // third, so they arrive together with the far ones moving faster —
          // which is what throwing three things at once actually looks like.
          // Opacity resolves early so the flight is watched rather than faded
          // through; the stage's overflow hides the wait below the edge anyway.
          // Delays sit under the dock's own 1.4s rise, so the files read as
          // arriving WITH it rather than after it.
          transition={{
            duration: 1.15,
            ease: EASE,
            delay: visible ? f.delay : 0,
            opacity: {
              duration: 0.35,
              ease: "easeOut",
              delay: visible ? f.delay : 0,
            },
          }}
        >
          <span className="dfile-icon">{f.art}</span>
          <span className="dfile-label">{f.label}</span>
        </motion.a>
      ))}
    </div>
  );
}
