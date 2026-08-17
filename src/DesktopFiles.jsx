// The desktop files: the second half of the cover is a MacBook screen, and a
// desktop with a dock but no files on it is a screenshot, not a machine.
//
// SCATTERED PROJECT ART, not a grid of generic icons (18 Aug 2026, by request,
// after the macOS-folio reference). Two passes ago these were an art-directed
// scatter of three doc icons; one pass ago a tidy top-right grid column. Both
// were the same mistake in opposite directions: the files were CHROME. In the
// reference the scattered files ARE the portfolio — each one is a thumbnail of
// the actual work, framed like a macOS image file, and opening one opens the
// project. So the desktop now carries her real covers from projects.js, and
// clicking a project opens its case-study page.
//
// The résumés and the folders keep drawn icons — a PDF is not a picture, and a
// folder that showed a preview would stop reading as a folder.
//
// THE LOTUS OWNS THE MIDDLE. Every position below is outside a measured no-go
// box; see NO_GO. Nothing here may drift into it.
//
// They live INSIDE .cover-stage rather than beside the dock in App: they leave
// with the cover's own fade instead of popping out the instant a world opens.
// The dock is the one thing that genuinely outlives the route — these belong
// to the cover.
import { motion } from "framer-motion";
import { GitHubMark } from "./BrandIcons.jsx";
import { PROJECTS } from "./projects.js";
import { GITHUB } from "./links.js";

// The wallpaper is the bloom's LAST frame, and its painted mass was measured
// off public/lotus/f39.webp at a luminance threshold of 130, binned into 5%
// columns and rows: the flower occupies x 40–65%, y 30–65%, and everything
// outside that is under 80 stray pixels per bin (starfield, petal tips).
// Padded to x 36–69 / y 26–69 here, which is the box no file may enter.
// Re-measure if the frame sequence is ever re-rendered.
const NO_GO = { x0: 36, x1: 69, y0: 26, y1: 69 };

const clears = (left, top) =>
  left < NO_GO.x0 || left > NO_GO.x1 || top < NO_GO.y0 || top > NO_GO.y1;

// A macOS-style document sheet: rounded page, folded top-right corner, two
// lines of "content", and a coloured band carrying the extension. One shape for
// both résumés — only the band's colour and label differ.
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
// over it. `mark` rides on the front panel when the folder needs to say what
// is in it (GitHub); the work folder is left plain, the way a real one is.
function FolderIcon({ mark = null }) {
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
      {mark}
    </svg>
  );
}

// A project's cover, framed the way macOS frames an image file: a white border
// with the picture inside and a real drop shadow under the whole card. This is
// the piece that makes the desktop read as a portfolio rather than as a folder
// of documents — it is her actual work, on the screen, at a glance.
function ShotIcon({ src, alt }) {
  return (
    <span className="dfile-shot dfile-art">
      <img src={src} alt={alt} loading="lazy" decoding="async" />
    </span>
  );
}

// `left`/`top` are the ICON'S CENTRE as a percentage of the stage, so the
// arrangement holds its proportions on any width; the CSS pulls each tile back
// by half its own box. Placed by eye into the quiet bands the lotus leaves —
// a left column and a right column — and every one of them is asserted against
// NO_GO below, so a future nudge into the flower fails loudly in the console
// instead of quietly looking wrong.
const byslug = (s) => PROJECTS.find((p) => p.slug === s);

const FILES = [
  // ---- her work, down the left ----
  ...[
    ["meal-maestro", 13, 21],
    ["layover", 26, 44],
    ["futurepreneurs", 11, 67],
  ].map(([slug, left, top]) => {
    const p = byslug(slug);
    return {
      key: slug,
      label: p.name,
      aria: `${p.name} — ${p.what}, open the case study`,
      href: `#/design/${slug}`,
      external: false,
      newTab: false,
      art: <ShotIcon src={p.cover} alt="" />,
      wide: true,
      left,
      top,
    };
  }),

  // ---- the papers and the folders, down the right ----
  {
    key: "design",
    label: "design.fig",
    // The name is the joke, the aria is the truth: what actually opens is a
    // PDF, and that is what a screen reader has to be told.
    aria: "Design resume — PDF, opens in a new tab",
    href: "/resume-design.pdf",
    external: false,
    newTab: true,
    art: <DocIcon ext="FIG" accent="#f24e1e" gradient="dfile-sheet-fig" />,
    // `wide` is only true for the project thumbnails, but every entry declares
    // it: checkJs infers the array's type from its members, and a field present
    // on some of them and absent on others is a union it will not let us read.
    wide: false,
    left: 76,
    top: 20,
  },
  {
    key: "tech",
    label: "tech.ts",
    aria: "Tech resume — PDF, opens in a new tab",
    href: "/resume-tech.pdf",
    external: false,
    newTab: true,
    // .ts because this is the engineering half of the same person — the file
    // on disk is a PDF, the icon is the joke.
    art: <DocIcon ext="TS" accent="#3178c6" gradient="dfile-sheet-ts" />,
    wide: false,
    left: 89,
    top: 38,
  },
  {
    key: "work",
    label: "Selected Work",
    aria: "Selected work — open the design file",
    href: "#/design",
    external: false,
    newTab: false,
    art: <FolderIcon />,
    wide: false,
    left: 74,
    top: 61,
  },
  {
    key: "github",
    label: "github",
    aria: "GitHub — opens in a new tab",
    href: GITHUB,
    external: true,
    newTab: true,
    art: (
      <FolderIcon
        mark={<GitHubMark x={21} y={22} size={22} fill="rgba(255,255,255,0.94)" />}
      />
    ),
    wide: false,
    left: 88,
    top: 77,
  },
];

// Dev-only guard. The scatter is hand-placed and the lotus is the one thing on
// this screen that cannot be sat on; a silent overlap is exactly the kind of
// regression that survives a redesign because nobody re-measures the flower.
if (import.meta.env.DEV) {
  const bad = FILES.filter((f) => !clears(f.left, f.top));
  if (bad.length) {
    console.error(
      "[DesktopFiles] these sit on the lotus:",
      bad.map((f) => `${f.key} (${f.left}%, ${f.top}%)`).join(", ")
    );
  }
}

export default function DesktopFiles({ visible }) {
  return (
    <div className="cover-desktop" aria-hidden={!visible}>
      {FILES.map((f, i) => (
        <motion.a
          key={f.key}
          className={`dfile${f.wide ? " dfile--wide" : ""}`}
          style={{
            left: `${f.left}%`,
            top: `${f.top}%`,
            pointerEvents: visible ? "auto" : "none",
          }}
          href={f.href}
          target={f.newTab ? "_blank" : undefined}
          rel={f.external ? "noreferrer" : undefined}
          aria-label={f.aria}
          tabIndex={visible ? 0 : -1}
          initial={false}
          // No flight. A desktop's files don't arrive, they're there when the
          // screen is — a short fade in place, faintly staggered, is all the
          // entrance a machine that was already on gets.
          animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.97 }}
          transition={{
            duration: 0.45,
            ease: "easeOut",
            delay: visible ? 0.1 + i * 0.06 : 0,
          }}
        >
          <span className="dfile-icon">{f.art}</span>
          <span className="dfile-label">{f.label}</span>
        </motion.a>
      ))}
    </div>
  );
}
