// THE PHONE IS AN iPHONE — not the Mac desktop with its furniture pushed in.
//
// The cover's metaphor is a MacBook: a menu bar, a wallpaper, files scattered
// across a desk, a dock. None of that is what a phone is. Squeezed into 390px
// the desk kept its shape and lost its meaning — six files became four, the
// dock became a rail down the left edge, and the whole composition read as a
// picture of a Mac rather than a machine you are holding.
//
// So on a phone the metaphor SWITCHES (12 Sep 2026, on her brief): this is an
// iPhone home screen. Status bar, Dynamic Island, an iOS grid of icons and
// widgets, a page indicator, a dock, and two pages you swipe between. The
// desktop is untouched — everything here lives behind `(max-width: 640px)`.
//
// THE ART IS HERS, UNCHANGED. Every tile is a piece of the same Figma desk the
// Mac lays out (DESK in DesktopFiles.jsx), at the same file, with the same
// label and the same destination. Nothing was redrawn for the phone and no
// placeholder exists: a folder here opens exactly what the same folder opens
// there. What the phone brings is the GRID, not new pictures.
//
// WHAT IS LIVE AND WHAT IS PAINT is the desk's rule, carried over: every folder
// opens something, and the artwork is `aria-hidden` and untouchable. A tile
// that looks like a file and does nothing is the one thing this composition
// has never allowed.
//
// THE CEREMONY STILL RUNS. The lotus and her name are the hero on a phone
// exactly as on the Mac — the same 320vh track, the same scrub — and this
// screen is what the bloom SETTLES INTO, faded in on the same signal the desk
// uses. It is mounted throughout, so its art is decoded long before it shows;
// while the bloom is running it is transparent and untouchable, and the page
// scrolls straight through it.
import { useEffect, useRef, useState } from "react";
import { DESK, windowHref } from "./DesktopFiles.jsx";
import {
  FigmaMarkColor,
  GooglePhotosMarkColor,
  VSCodeMark,
  GitHubMark,
  LinkedInMarkColor,
  GmailMark,
  InstagramMark,
} from "./BrandIcons.jsx";
import FroggieMark from "./FroggieMark.jsx";
import { GITHUB, LINKEDIN, INSTAGRAM, EMAIL } from "./links.js";

/**
 * One tile, built from the desk's own piece: `span` is [columns, rows] on the
 * iOS grid, and anything after it overrides what the desk says.
 * @param {string} key
 * @param {[number, number]} span
 * @param {object} [over]
 */
const tile = (key, span, over = {}) => ({ ...DESK[key], span, ...over });

// ---------------------------------------------------------------------------
// PAGE ONE — the work.
//
// Read as an iOS home screen: the four case studies are app icons in the first
// two rows, the jewel case is a 2x2 widget beside them, the bloom is the wide
// widget across the middle, and the two résumés sit either side of the frog.
// Auto-placement runs in this order, which is what puts each piece in the slot
// the reference composition has it in.
const PAGE_ONE = [
  tile("folder-green", [1, 1]), // Meal Maestro
  tile("futurepreneurs", [1, 1]),
  tile("cd-case", [2, 2]),
  tile("folder-floral", [1, 1]), // Layover
  tile("folder-scenery", [1, 1]), // NextG Apex
  // ABOUT ME GOES TO THE WORLD ON A PHONE, not to the window. The scrapbook's
  // copy is baked into 1673px-wide artwork; in a window on a 390px screen that
  // is 23% and unreadable, while #/notes carries the rotate-to-read gate that
  // was built for exactly this. Same folder, same art, the honest door.
  tile("about-me", [1, 1], {
    opensNote: undefined,
    href: "#/notes",
    aria: "About Me — the scrapbook",
  }),
  tile("folder-horse", [1, 1]), // untitled folder
  tile("card-karma", [2, 1]),
  // THE BLOOM IS THE WALLPAPER, so the grid leaves it a hole rather than
  // carrying a picture of it. The flower behind this screen is the real one —
  // the canvas the ceremony just scrubbed, still on the stage underneath —
  // and it lands in exactly this band on a portrait phone (the measurement is
  // in DesktopFiles.jsx: y 27-68%). A tile here would be a second flower on
  // top of the first.
  { key: "bloom-gap", span: [4, 2], spacer: true },
  tile("frog-jar", [2, 2]),
  tile("resume-design", [1, 1]),
  tile("resume-tech", [1, 1]),
  tile("crowd", [2, 1]),
];

// ---------------------------------------------------------------------------
// PAGE TWO — the contacts, which is where the Mac dock's second group went.
//
// On the Mac the dock holds four apps, a divider, and her four profiles. A
// phone dock holds four things, full stop — so the profiles move here, as the
// app icons they always looked like, and the dock keeps the apps.
const SOCIALS = [
  {
    key: "github",
    label: "GitHub",
    aria: "GitHub — mrinali's code",
    href: GITHUB,
    newTab: true,
    mark: <GitHubMark className="ph-mark-glyph" aria-hidden="true" />,
    mono: true,
  },
  {
    key: "linkedin",
    label: "LinkedIn",
    aria: "LinkedIn — mrinali's profile",
    href: LINKEDIN,
    newTab: true,
    mark: <LinkedInMarkColor className="ph-mark-glyph" aria-hidden="true" />,
  },
  {
    key: "email",
    label: "Mail",
    aria: "Email mrinali",
    href: `mailto:${EMAIL}`,
    mark: <GmailMark className="ph-mark-glyph" aria-hidden="true" />,
  },
  {
    key: "instagram",
    label: "Instagram",
    aria: "Instagram — @mrinalii._",
    href: INSTAGRAM,
    newTab: true,
    mark: <InstagramMark className="ph-mark-glyph" aria-hidden="true" />,
  },
];

// TWO OBJECTS, NOT A DRAWER OF THEM (12 Sep 2026, her call). It also carried
// the relief, her drawn name, the pin and the two sparkles; they made a page
// out of leftovers. The four profiles sit as a square on the left and the
// dragonfly answers it on the right — which is the whole page, and reads as
// one deliberate row rather than as everything that did not fit on page one.
//
// The order is the auto-placement: two icons, then the widget takes columns
// 3-4 of both rows, then the last two icons fall in under the first two.
const PAGE_TWO = [
  { ...SOCIALS[0], span: [1, 1] },
  { ...SOCIALS[1], span: [1, 1] },
  tile("dragonfly", [2, 2]),
  { ...SOCIALS[2], span: [1, 1] },
  { ...SOCIALS[3], span: [1, 1] },
];

// The dock: the Mac's four apps, in the Mac's order. Real links, so a long
// press offers "open in new tab" the way every other tile here does.
const DOCK = [
  {
    key: "figma",
    aria: "Figma — enter the design world",
    href: "#/design",
    mark: <FigmaMarkColor className="ph-mark-glyph" aria-hidden="true" />,
  },
  {
    key: "vscode",
    aria: "VS Code — enter the tech world",
    href: "#/tech",
    mark: <VSCodeMark className="ph-mark-glyph" aria-hidden="true" />,
  },
  {
    key: "gallery",
    aria: "Gallery — open the dome gallery",
    href: "#/gallery",
    mark: <GooglePhotosMarkColor className="ph-mark-glyph" aria-hidden="true" />,
  },
  {
    key: "pond",
    aria: "Game — the Lotus Pond, catch coding bugs with a pixel frog",
    href: "#/pond",
    mark: <FroggieMark className="ph-mark-glyph" aria-hidden="true" />,
  },
];

/** the artwork inside a tile, with the desk's own treatments */
function Art({ p }) {
  const img = (
    <img
      className="ph-img"
      src={p.src}
      alt=""
      draggable="false"
      decoding="async"
      style={{
        objectFit: p.radius ? "cover" : "contain",
        objectPosition: p.focus,
        borderRadius: p.radius ? "var(--ph-tile-radius)" : undefined,
      }}
    />
  );
  // the dragonfly's glass plate and the frog's card, as on the desk
  if (p.glass) return <span className="ph-glass">{img}</span>;
  if (p.plate)
    return (
      <>
        <span className="ph-plate" aria-hidden="true" />
        {img}
      </>
    );
  return img;
}

/** one grid tile — a link if the desk says it opens something, paint if not */
function Tile({ p, visible, onOpenCase, onOpenNote, onOpenEmpty }) {
  const live = !!(p.opensCase || p.opensNote || p.opensEmpty || p.href);
  const style = { gridColumn: `span ${p.span[0]}`, gridRow: `span ${p.span[1]}` };

  const inner = (
    <>
      <span className={`ph-tile-art${p.mark ? " ph-mark" : ""}${p.mono ? " is-mono" : ""}`}>
        {p.mark ? p.mark : <Art p={p} />}
      </span>
      {/* ONE LINE, as an app icon gets. The desk's second "kind" line ("Case
          Study") does not come with it: two lines under a 70px icon is a
          caption, not a label. It is still in the link's own aria-label, in a
          fuller sentence, which is where a screen reader was reading it
          anyway. */}
      {p.label && <span className="ph-tile-label">{p.label}</span>}
    </>
  );

  // the hole the bloom shows through: it holds its cells and draws nothing
  if (p.spacer)
    return (
      <div className="ph-tile is-spacer" data-key={p.key} style={style} aria-hidden="true" />
    );

  if (!live)
    return (
      <div
        className="ph-tile is-art"
        data-key={p.key}
        style={style}
        aria-hidden="true"
      >
        {inner}
      </div>
    );

  return (
    <a
      className="ph-tile"
      data-key={p.key}
      style={style}
      href={p.href || windowHref(p)}
      target={p.newTab ? "_blank" : undefined}
      rel={p.newTab ? "noreferrer" : undefined}
      aria-label={p.aria}
      // nothing here is reachable by keyboard until the bloom has landed
      tabIndex={visible ? undefined : -1}
      onClick={(e) => {
        // Only a plain tap opens a window in place; everything else falls
        // through to the address, which is that window's own shareable link.
        if (p.href) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
        e.preventDefault();
        if (p.opensCase) onOpenCase?.(p.opensCase);
        else if (p.opensNote) onOpenNote?.(p.opensNote);
        else if (p.opensEmpty) onOpenEmpty?.(p.opensEmpty);
      }}
    >
      {inner}
    </a>
  );
}

/** iOS's own clock: the hour and minute, no seconds, no meridiem */
function useClock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    // tick on the minute, not every second — a home screen clock that repaints
    // sixty times a minute is sixty wake-ups for a number that did not change
    let id;
    const schedule = () => {
      id = setTimeout(() => {
        setNow(new Date());
        schedule();
      }, 60000 - (Date.now() % 60000));
    };
    schedule();
    return () => clearTimeout(id);
  }, []);
  return now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }).replace(/\s?[AP]M/i, "");
}

export default function PhoneHome({ visible = true, onOpenCase, onOpenNote, onOpenEmpty }) {
  const pagesRef = useRef(null);
  const [page, setPage] = useState(0);
  const time = useClock();
  const pages = [PAGE_ONE, PAGE_TWO];

  // WHICH PAGE IS SHOWING, read from the scroller rather than owned by state.
  // The swipe is the browser's own scroll-snap — no drag maths, no inertia to
  // reimplement, and it stays right when the pages are resized mid-gesture.
  const onScroll = () => {
    const el = pagesRef.current;
    if (!el) return;
    const at = Math.round(el.scrollLeft / el.clientWidth);
    setPage((prev) => (prev === at ? prev : at));
  };

  const goTo = (i) => {
    const el = pagesRef.current;
    if (!el) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollTo({ left: i * el.clientWidth, behavior: reduced ? "auto" : "smooth" });
  };

  return (
    <div className={`ph${visible ? " is-on" : ""}`} aria-hidden={!visible}>
      {/* THE SCREEN'S OWN FRAME. On a phone this is the bezel you are already
          holding, so it costs 2px and reads as nothing; in a narrow desktop
          window it is what makes the composition read as a device. */}
      <div className="ph-frame">
        <div className="ph-status">
          <span className="ph-status-time">{time}</span>
          {/* the island is drawn INSIDE the status row so the time and the
              indicators sit either side of it, exactly as iOS lays them out */}
          <span className="ph-island" aria-hidden="true">
            <span className="ph-island-lens" />
          </span>
          <span className="ph-status-icons" aria-hidden="true">
            <svg viewBox="0 0 18 12" className="ph-status-glyph" role="presentation">
              <rect x="0" y="8" width="3" height="4" rx="1" />
              <rect x="5" y="5.5" width="3" height="6.5" rx="1" />
              <rect x="10" y="3" width="3" height="9" rx="1" />
              <rect x="15" y="0" width="3" height="12" rx="1" />
            </svg>
            <svg viewBox="0 0 16 12" className="ph-status-glyph" role="presentation">
              <path d="M8 10.6 5.9 8.4a3 3 0 0 1 4.2 0L8 10.6Z" />
              <path
                d="M3.2 5.6a7 7 0 0 1 9.6 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
              <path
                d="M5.6 8a3.6 3.6 0 0 1 4.8 0"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
              />
            </svg>
            <svg viewBox="0 0 26 12" className="ph-status-glyph ph-status-battery" role="presentation">
              <rect x="0.6" y="0.6" width="21" height="10.8" rx="3" fill="none" stroke="currentColor" strokeWidth="1.2" opacity="0.5" />
              <rect x="2.2" y="2.2" width="15" height="7.6" rx="1.8" />
              <path d="M23.4 4.2a2.6 2.6 0 0 1 0 3.6V4.2Z" opacity="0.5" />
            </svg>
          </span>
        </div>

        {/* the two home screens. `scroll-snap` is the whole swipe. */}
        <div className="ph-pages" ref={pagesRef} onScroll={onScroll}>
          {pages.map((items, i) => (
            <section
              key={i}
              className="ph-page"
              aria-label={`Home screen, page ${i + 1} of ${pages.length}`}
            >
              <div className="ph-grid">
                {items.map((p) => (
                  <Tile
                    key={p.key}
                    p={p}
                    visible={visible}
                    onOpenCase={onOpenCase}
                    onOpenNote={onOpenNote}
                    onOpenEmpty={onOpenEmpty}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="ph-dots" role="tablist" aria-label="Home screen pages">
          {pages.map((_, i) => (
            <button
              key={i}
              type="button"
              role="tab"
              className={`ph-dot${page === i ? " is-on" : ""}`}
              aria-selected={page === i}
              aria-label={`Page ${i + 1}`}
              tabIndex={visible ? 0 : -1}
              onClick={() => goTo(i)}
            />
          ))}
        </div>

        <nav className="ph-dock" aria-label="Dock">
          {DOCK.map((a) => (
            <a
              key={a.key}
              className="ph-dock-item"
              href={a.href}
              aria-label={a.aria}
              tabIndex={visible ? undefined : -1}
            >
              <span className="ph-mark">{a.mark}</span>
            </a>
          ))}
        </nav>

        {/* the home indicator — the one piece of iOS chrome that is purely a
            line, and the thing that tells you the dock is the bottom of a
            phone rather than the bottom of a page */}
        <span className="ph-home-bar" aria-hidden="true" />
      </div>
    </div>
  );
}
