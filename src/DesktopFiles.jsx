// The desktop files: the second half of the cover is a MacBook screen, and a
// desktop with a dock but no files on it is a screenshot, not a machine.
// The two résumés as documents and GitHub as a folder, in a macOS grid.
//
// THE GRID REPLACED THE SCATTER (2026-08-18). The three tiles used to sit at
// art-directed positions (30/19, 69/35, 24/74, tilted) and fly up from the
// bottom edge over two seconds — and that is exactly what read as "random
// floating files": a desktop's icons aren't scattered and they don't arrive,
// they hang in a column off the top-right edge and are simply THERE when the
// screen is. So: one right-edge column, macOS's own arrangement, appearing
// with a short fade when the desktop settles — a machine that was already on.
// The flight machinery (per-tile rise distances, the FLOAT curve, the resting
// tilt) is gone with the scatter.
//
// They live INSIDE .cover-stage rather than beside the dock in App: they leave
// with the cover's own fade instead of popping out the instant a world opens.
// The dock is the one thing that genuinely outlives the route — these belong
// to the cover.
//
// Icons are inline SVG, not image files, for the same reason BrandIcons.jsx
// exists: no extra requests, no remote origin, and they stay sharp at whatever
// size the clamp lands on.
import { motion } from "framer-motion";
import { GitHubMark } from "./BrandIcons.jsx";

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

// Order is grid order: top of the column to the bottom, hanging off the
// top-right edge the way macOS fills its desktop. The geometry (right inset,
// first row, pitch) lives in desktop-files.css as --dgrid-* custom props so
// the media queries that resize the tiles can retune the pitch beside them;
// the index into that grid is the only position data a file carries.
//
// Names echo the world tabs (`design.fig`, `tech.jsx`), so the extension is
// what tells you which half of the person a file belongs to. Short on purpose:
// at this icon size a long name is wider than the artwork and stops reading as
// a label. The aria strings below carry the full meaning.
const FILES = [
  {
    key: "design",
    label: "design.fig",
    // The name is the joke, the aria is the truth: what actually opens is a
    // PDF, and that is what a screen reader has to be told. Exactly the split
    // tech.ts already runs.
    aria: "Design resume — PDF, opens in a new tab",
    href: "/resume-design.pdf",
    external: false,
    // The BADGE follows the name, not the file — tech.ts sets the pattern that
    // the band matches the extension. #f24e1e is Figma's own brand orange.
    art: <DocIcon ext="FIG" accent="#f24e1e" gradient="dfile-sheet-fig" />,
  },
  {
    key: "tech",
    label: "tech.ts",
    aria: "Tech resume — PDF, opens in a new tab",
    href: "/resume-tech.pdf",
    external: false,
    // .ts because this is the engineering half of the same person — the file
    // on disk is a PDF, the icon is the joke.
    art: <DocIcon ext="TS" accent="#3178c6" gradient="dfile-sheet-ts" />,
  },
  {
    key: "github",
    label: "github",
    aria: "GitHub — opens in a new tab",
    href: "https://github.com/MrinaliBhardwaj",
    external: true,
    art: <FolderIcon />,
  },
];

export default function DesktopFiles({ visible }) {
  return (
    <div className="cover-desktop" aria-hidden={!visible}>
      {FILES.map((f, i) => (
        <motion.a
          key={f.key}
          className="dfile"
          style={{
            right: "var(--dgrid-right)",
            top: `calc(var(--dgrid-top) + ${i} * var(--dgrid-pitch))`,
            pointerEvents: visible ? "auto" : "none",
          }}
          href={f.href}
          target="_blank"
          rel={f.external ? "noreferrer" : undefined}
          aria-label={f.aria}
          tabIndex={visible ? 0 : -1}
          initial={false}
          // No flight. A desktop's files don't arrive, they're there when the
          // screen is — a short fade in place, faintly staggered down the
          // column, is all the entrance a machine that was already on gets.
          animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.97 }}
          transition={{
            duration: 0.45,
            ease: "easeOut",
            delay: visible ? 0.1 + i * 0.09 : 0,
          }}
        >
          <span className="dfile-icon">{f.art}</span>
          <span className="dfile-label">{f.label}</span>
        </motion.a>
      ))}
    </div>
  );
}
