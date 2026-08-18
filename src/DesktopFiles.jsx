// The desktop files: the second half of the cover is a MacBook screen, and a
// desktop with a dock but no files on it is a screenshot, not a machine.
//
// SCATTERED PROJECT ART, not a grid of generic icons. In the macOS-folio
// reference the scattered files ARE the portfolio — each one is a thumbnail of
// the actual work, framed like a macOS image file, and opening one opens the
// project. So the desktop carries her real covers from projects.js, and the
// résumés and folders keep drawn icons: a PDF is not a picture, and a folder
// showing a preview stops reading as a folder.
//
// THE LOTUS OWNS THE MIDDLE, and it owns a DIFFERENT middle on a phone — see
// NO_GO. Nothing here may drift into it.
//
// They live INSIDE .cover-stage rather than beside the dock in App: they leave
// with the cover's own fade instead of popping out the instant a world opens.
// The dock is the one thing that genuinely outlives the route — these belong
// to the cover.
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GitHubMark } from "./BrandIcons.jsx";
import { PROJECTS } from "./projects.js";
import { GITHUB } from "./links.js";

// THE FLOWER'S FOOTPRINT, MEASURED — and it is not the same shape on a phone.
//
// The wallpaper is the bloom's LAST frame drawn with object-fit: cover (see
// coverDraw in lotus.js), so the crop — and therefore where the flower lands on
// screen — depends entirely on the viewport's aspect. public/lotus/f39.webp was
// profiled at luminance > 130, binned into 5% columns and rows, keeping bins
// holding more than 1% of the ink:
//
//   1440x900 (and every landscape ratio)   x 35-65%   y 30-65%
//   320x568 / 375x667 / 390x844 / 430x932  x 20-95%   y 30-65%
//
// A portrait phone crops hard into the flower's sides, so it stops being a
// central column and becomes a BAND ACROSS THE MIDDLE at essentially full
// width. That is why the phone composition puts files above it and below it and
// never beside it — there is no beside. Re-measure if the frames are re-rendered.
const NO_GO = {
  desktop: { x0: 36, x1: 69, y0: 26, y1: 69 },
  phone: { x0: -1, x1: 101, y0: 27, y1: 68 },
};

const clears = (box, left, top) =>
  left < box.x0 || left > box.x1 || top < box.y0 || top > box.y1;

// The phone treatment starts here. 640 rather than the 899 the files used to
// hide at: 641-899 is a tablet, it keeps the desktop composition, and the brief
// was explicit that the desktop breakpoint must not move.
const PHONE = "(max-width: 640px)";

function useIsPhone() {
  const [isPhone, setIsPhone] = useState(
    () => typeof window !== "undefined" && window.matchMedia(PHONE).matches
  );
  useEffect(() => {
    // Re-read the query FRESH each time rather than trusting a stored
    // MediaQueryList, and listen to `resize` as well as `change`. A held MQL
    // that never re-evaluates is not hypothetical — it is exactly what happens
    // under a devtools device-metrics override, where the width changes, a new
    // matchMedia() call reports the new answer, and the old object's `change`
    // never fires. Reading fresh costs nothing and cannot go stale.
    const sync = () => setIsPhone(window.matchMedia(PHONE).matches);
    const mq = window.matchMedia(PHONE);
    sync();
    mq.addEventListener("change", sync);
    window.addEventListener("resize", sync);
    return () => {
      mq.removeEventListener("change", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);
  return isPhone;
}

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

// `at` / `phone` are the ICON'S CENTRE as [left, top] percentages of the stage,
// so each arrangement holds its proportions on any screen; the CSS pulls the
// tile back by half its own box. `phone: null` means the file is not on the
// phone desktop at all.
//
// THE PHONE COMPOSITION is placed, not listed, and it is built around the band
// the flower occupies (y 27-68%). Three files sit in the open air above it and
// two below it, staggered rather than aligned so the arrangement reads as
// someone's desk instead of a column:
//
//     Meal Maestro           design.fig
//                                    tech.ts
//     ~~~~~~~~~~~~~ the bloom ~~~~~~~~~~~~~
//              Layover
//    [dock]                  Futurepreneurs
//
// TWO FILES ARE DROPPED ON THE PHONE, and neither loses a destination:
// "Selected Work" opens #/design, which is exactly what the dock's Figma tile
// already does — a duplicate is the first thing to cut when space is the
// constraint; and GitHub is linked from the tech world's own contact block.
const byslug = (s) => PROJECTS.find((p) => p.slug === s);

const FILES = [
  // ---- her work ----
  // objects rather than tuples: checkJs widens a mixed `[string, number[]]`
  // to `(string | number[])[]`, and `key` then refuses the slug
  ...[
    { slug: "meal-maestro", at: [13, 21], phone: [29, 15] },
    { slug: "layover", at: [26, 44], phone: [44, 73] },
    { slug: "futurepreneurs", at: [11, 67], phone: [76, 80] },
  ].map(({ slug, at, phone }) => {
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
      at,
      phone,
    };
  }),

  // ---- the papers and the folders ----
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
    at: [76, 20],
    phone: [67, 12],
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
    at: [89, 38],
    phone: [85, 17],
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
    at: [74, 61],
    phone: null,
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
    at: [88, 77],
    phone: null,
  },
];

// Dev-only guard, now covering BOTH compositions. The arrangements are
// hand-placed and the lotus is the one thing on this screen that cannot be sat
// on; a silent overlap is exactly the kind of regression that survives a
// redesign because nobody re-measures the flower — and the phone's no-go box is
// a different shape from the desktop's, which makes it twice as easy to miss.
if (import.meta.env.DEV) {
  const bad = [];
  for (const f of FILES) {
    if (!clears(NO_GO.desktop, f.at[0], f.at[1])) bad.push(`${f.key} (desktop)`);
    if (f.phone && !clears(NO_GO.phone, f.phone[0], f.phone[1]))
      bad.push(`${f.key} (phone)`);
  }
  if (bad.length) {
    console.error("[DesktopFiles] these sit on the lotus:", bad.join(", "));
  }
}

export default function DesktopFiles({ visible }) {
  const isPhone = useIsPhone();
  const shown = isPhone ? FILES.filter((f) => f.phone) : FILES;

  return (
    <div className={`cover-desktop${isPhone ? " is-phone" : ""}`} aria-hidden={!visible}>
      {shown.map((f, i) => {
        const [left, top] = isPhone ? f.phone : f.at;
        return (
          <motion.a
            key={f.key}
            className={`dfile${f.wide ? " dfile--wide" : ""}`}
            style={{
              left: `${left}%`,
              top: `${top}%`,
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
            // The press is the touch device's only feedback — there is no hover
            // to lean on — so it lives on the element Framer owns rather than in
            // CSS, where it would fight this transform.
            whileTap={{ scale: 0.93 }}
            transition={{
              duration: 0.45,
              ease: "easeOut",
              delay: visible ? 0.1 + i * 0.06 : 0,
            }}
          >
            <span className="dfile-icon">{f.art}</span>
            <span className="dfile-label">{f.label}</span>
          </motion.a>
        );
      })}
    </div>
  );
}
