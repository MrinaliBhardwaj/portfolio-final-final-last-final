// The desktop files: the second half of the cover is a MacBook screen, and a
// desktop with a dock but no files on it is a screenshot, not a machine.
//
// SCATTERED PROJECT ART, not a grid of generic icons. In the macOS-folio
// reference the scattered files ARE the portfolio — each one is a thumbnail of
// the actual work, framed like a macOS image file, and opening one opens the
// project. So the desktop carries her real covers from projects.js, and the
// résumés and READMEs keep drawn icons: a PDF is not a picture, and neither is
// a text file.
//
// BOTH DISCIPLINES ARE ON THE DESK. Design work opens as a light Mac window
// (CaseWindow.jsx), engineering work as an editor (CodeWindow.jsx) — the dock
// already establishes those two applications, so a file opens in the one that
// made it. Before 19 Aug 2026 the desk was three design covers and nothing at
// all for the code.
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
import { PROJECTS } from "./projects.js";
import { TECH_PROJECTS } from "./tech-projects.js";

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

// BOTH FOLDERS ARE GONE (19 Aug 2026). "Selected Work" and "github" were the
// two tiles here that opened somewhere ELSE rather than opening something — the
// first went to #/design, which the dock's Figma tile already does, and the
// second left the site entirely, which the dock's GitHub tile now does. A
// desktop file should open a thing, not act as a second navigation bar. With
// them went FolderIcon, its two gradients and the GitHubMark import, rather
// than being left in the file as dead shapes.
//
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
//     |         Meal Maestro    design.fig
//     |                             tech.ts
//     | dock  ~~~~~~ the bloom ~~~~~~~~~~~~
//     |             Layover
//     |                       Futurepreneurs
//     |              regis.md
//
// The dock is a full-height RAIL down the left edge now (see dock.css), so every
// file has to clear it. Meal Maestro moved from 29% to 34% for that: at 320px
// wide its tile reached x 53.8px while the rail ends at 63px, and the two only
// ever missed each other while the dock was a puck in the bottom corner.
//
// ONE README ON THE PHONE, NOT THREE, and nothing is lost by it. Three more
// tiles do not fit in the open air the bloom leaves, and picking one would
// normally mean hiding the other two — except the window that opens has working
// chevrons (see CodeWindow.jsx), so Lexa and Public Pulse are one tap away from
// the file that IS shown. Regis is the one on the desk because it is the
// largest of the three: 34 endpoints, 9 modules, 137 tests.
const byslug = (s) => PROJECTS.find((p) => p.slug === s);
const bykey = (k) => TECH_PROJECTS.find((p) => p.key === k);

const FILES = [
  // ---- her work ----
  // objects rather than tuples: checkJs widens a mixed `[string, number[]]`
  // to `(string | number[])[]`, and `key` then refuses the slug
  ...[
    { slug: "meal-maestro", at: [13, 21], phone: [34, 15] },
    { slug: "layover", at: [26, 44], phone: [44, 73] },
    { slug: "futurepreneurs", at: [11, 67], phone: [76, 80] },
  ].map(({ slug, at, phone }) => {
    const p = byslug(slug);
    return {
      key: slug,
      label: p.name,
      aria: `${p.name} — ${p.what}, open the case study`,
      // A PROJECT OPENS A WINDOW, not a page (see CaseWindow.jsx): the desktop
      // stays behind it. The href is a real link so middle-click, cmd-click and
      // "open in new tab" still work — and it now points at the window's own
      // address rather than at #/design/<slug>, because the window IS the case
      // study since 19 Aug 2026 and there is no second page behind it.
      href: `#/?case=${slug}`,
      opensWindow: slug,
      opensCode: null,
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
    // the résumés navigate; the project files open windows
    opensWindow: null,
    opensCode: null,
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
    // the résumés navigate; the project files open windows
    opensWindow: null,
    opensCode: null,
    at: [89, 38],
    phone: [85, 17],
  },

  // ---- the engineering work ----
  // The desk was half a portfolio: three design covers and nothing at all for
  // the code. These are READMEs, and they open in an EDITOR (CodeWindow.jsx)
  // rather than in the light Mac window her design work uses — the dock already
  // says this person works in two applications, so a file opens in the one that
  // made it.
  //
  // A plain graphite band, where the résumés get Figma orange and TypeScript
  // blue. That is the hierarchy stated in colour: those two are documents about
  // her, these are files from the work. It is also simply what a .md file is —
  // markdown has no brand colour, it has black text on a page.
  //
  // They occupy the two positions the folders vacated plus one below, so the
  // right side of the desk reads as a run of engineering files under the two
  // résumés, facing the design covers across the bloom.
  ...[
    { key: "regis", at: [74, 57], phone: [46, 88] },
    { key: "lexa", at: [88, 72], phone: null },
    { key: "publicPulse", at: [76, 86], phone: null },
  ].map(({ key, at, phone }) => {
    const p = bykey(key);
    return {
      key,
      label: p.file,
      aria: `${p.name} — ${p.what}, open the README`,
      href: `#/?readme=${key}`,
      opensWindow: null,
      opensCode: key,
      external: false,
      newTab: false,
      // Each sheet needs its OWN gradient id. Inlined SVGs share one global id
      // space, so three files all declaring `dfile-sheet-md` would leave two of
      // them painting with whichever one the browser resolved first — the same
      // collision the dock icons had (see BrandIcons.jsx).
      art: <DocIcon ext="MD" accent="#2f3437" gradient={`dfile-sheet-md-${key}`} />,
      wide: false,
      at,
      phone,
    };
  }),
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

export default function DesktopFiles({ visible, onOpenCase, onOpenCode }) {
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
            // Only a PLAIN left click opens a window. Modified clicks and the
            // middle button are how people open things in new tabs, and
            // swallowing those would break the one habit an anchor promises —
            // so they fall through to the href, which is that window's own
            // shareable address and lands on the desktop with it already open.
            onClick={(e) => {
              const open = f.opensWindow
                ? () => onOpenCase?.(f.opensWindow)
                : f.opensCode
                  ? () => onOpenCode?.(f.opensCode)
                  : null;
              if (!open) return;
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0)
                return;
              e.preventDefault();
              open();
            }}
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
