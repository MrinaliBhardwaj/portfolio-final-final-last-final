// THE MENU BAR — a macOS system layer, not a website navbar.
//
// The distinction is the whole brief: this bar should read as the operating
// system the desktop is running on, so it carries what a Mac menu bar carries
// (an Apple mark, the frontmost app's name, its menus, and the status items)
// rather than a row of site sections. The centred DESIGN / TECH / NOTES /
// GALLERY / GAME strip that used to live here is gone.
//
// NAVIGATION DID NOT GO WITH IT, and that mattered: gallery, notes and the
// game are reachable in no other navigation, and the dock is hidden on the
// cover until the scrub settles. macOS already has the right drawer for this —
// the GO menu is where a Mac keeps its locations — so the five worlds live
// there. That is more authentic than the strip was, not a compromise.
//
// EVERY MENU ITEM DOES SOMETHING REAL. A menu that opens on a list of dead
// words is the same defect as the Claude dock tile removed on 4 Aug: File
// opens the two worlds and GitHub, Edit copies her email to the clipboard,
// View drives real fullscreen and replays the intro, Go navigates, Window
// returns to the desktop, Help opens mail and LinkedIn.
//
// The four STATUS icons are the exception and are deliberately inert: Wi-Fi,
// Spotlight, Control Centre and the battery are set dressing, and building a
// fake Wi-Fi panel is the "unnecessary functionality" the brief rules out.
// They are aria-hidden for that reason — a screen reader is not told there are
// four buttons here, because there aren't. They keep a hover state because the
// brief asks for one, and because a Mac's do.
import { useEffect, useRef, useState } from "react";
import { Battery, Search, Wifi } from "lucide-react";
import { EMAIL, GITHUB, LINKEDIN } from "./links.js";
import { toggleFullscreen } from "./WindowLights.jsx";

// Apple's mark, path data from Simple Icons (CC0). The trademark is Apple's
// and inlining does not change that — this is the same nominative use as the
// Figma and GitHub marks in BrandIcons.jsx, naming the system this interface
// is impersonating.
const APPLE =
  "M12.152 6.896c-.948 0-2.415-1.078-3.96-1.04-2.04.027-3.91 1.183-4.961 3.014-2.117 3.675-.546 9.103 1.519 12.09 1.013 1.454 2.208 3.09 3.792 3.039 1.52-.065 2.09-.987 3.935-.987 1.831 0 2.35.987 3.96.948 1.637-.026 2.676-1.48 3.676-2.948 1.156-1.688 1.636-3.325 1.662-3.415-.039-.013-3.182-1.221-3.22-4.857-.026-3.04 2.48-4.494 2.597-4.559-1.429-2.09-3.623-2.324-4.39-2.376-2-.156-3.675 1.09-4.61 1.09zM15.53 3.83c.843-1.012 1.4-2.427 1.245-3.83-1.207.052-2.662.805-3.532 1.818-.78.896-1.454 2.338-1.273 3.714 1.338.104 2.715-.688 3.559-1.701";

// Control Centre's two-slider glyph, drawn rather than borrowed: lucide's
// nearest equivalent reads as a mixing desk at 14px, and this one is four
// shapes.
const ControlCentre = (props) => (
  <svg viewBox="0 0 16 16" width="14" height="14" fill="none" {...props}>
    <rect x="1.6" y="2.4" width="12.8" height="4.6" rx="2.3" stroke="currentColor" strokeWidth="1.2" />
    <rect x="1.6" y="9" width="12.8" height="4.6" rx="2.3" stroke="currentColor" strokeWidth="1.2" />
    <circle cx="10.9" cy="4.7" r="1.15" fill="currentColor" />
    <circle cx="5.1" cy="11.3" r="1.15" fill="currentColor" />
  </svg>
);

// macOS's own menu-bar clock format — "Tue 18 Aug 11:24 AM". Intl rather than
// a date library: two calls against the platform formatter, no dependency, and
// the weekday and month localise themselves.
//
// It ticks on the MINUTE BOUNDARY, not on a 60s interval: a naive interval
// drifts off the real minute and the displayed time lags by up to a minute.
// Each tick schedules the next for the top of the following one.
function Clock() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    let timer;
    const tick = () => {
      const d = new Date();
      setNow(d);
      timer = setTimeout(
        tick,
        60000 - (d.getSeconds() * 1000 + d.getMilliseconds()) + 50
      );
    };
    tick();
    return () => clearTimeout(timer);
  }, []);

  const day = now.toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });
  const time = now.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });

  // aria-hidden: a clock that re-renders every minute is noise to a screen
  // reader and says nothing about the portfolio. Set dressing stays quiet.
  return (
    <span className="mb-clock" aria-hidden="true">
      {day} {time}
    </span>
  );
}

const copyEmail = () => {
  navigator.clipboard?.writeText(EMAIL).catch(() => {});
};

const backToDesktop = () => {
  window.location.hash = "/";
};

export default function MenuBar({ onChoose, onReplayIntro }) {
  // Which menu is open, by id. macOS opens on click and then TRACKS the
  // pointer across the other titles without another click — that is what the
  // onMouseEnter below reproduces, and it is the single detail that most makes
  // a menu bar feel native rather than like seven dropdowns.
  const [open, setOpen] = useState(null);
  const barRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (!barRef.current?.contains(e.target)) setOpen(null);
    };
    const onKey = (e) => e.key === "Escape" && setOpen(null);
    document.addEventListener("pointerdown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const go = (world) => () => onChoose(world);

  const MENUS = [
    {
      id: "app",
      label: "mb",
      app: true,
      items: [
        { label: "About This Portfolio", onSelect: go("notes") },
        { sep: true },
        { label: "Design Résumé", href: "/resume-design.pdf", blank: true },
        { label: "Tech Résumé", href: "/resume-tech.pdf", blank: true },
      ],
    },
    {
      id: "file",
      label: "File",
      items: [
        { label: "Open Design", onSelect: go("design") },
        { label: "Open Tech", onSelect: go("tech") },
        { sep: true },
        { label: "Open GitHub", href: GITHUB, blank: true },
      ],
    },
    {
      id: "edit",
      label: "Edit",
      items: [{ label: "Copy Email Address", onSelect: copyEmail }],
    },
    {
      id: "view",
      label: "View",
      items: [
        { label: "Enter Full Screen", onSelect: toggleFullscreen },
        { sep: true },
        { label: "Replay Intro", onSelect: onReplayIntro },
      ],
    },
    {
      id: "go",
      label: "Go",
      items: [
        { label: "Design", onSelect: go("design") },
        { label: "Tech", onSelect: go("tech") },
        { label: "Notes", onSelect: go("notes") },
        { label: "Gallery", onSelect: go("gallery") },
        { label: "Game", onSelect: go("pond") },
      ],
    },
    {
      id: "window",
      label: "Window",
      items: [{ label: "Back to Desktop", onSelect: backToDesktop }],
    },
    {
      id: "help",
      label: "Help",
      items: [
        { label: "Email Mrinali", href: `mailto:${EMAIL}` },
        { label: "LinkedIn", href: LINKEDIN, blank: true },
      ],
    },
  ];

  const renderItem = (it, i) => {
    if (it.sep) return <div key={`s${i}`} className="mb-sep" role="separator" />;
    if (it.href) {
      return (
        <a
          key={it.label}
          className="mb-item"
          role="menuitem"
          href={it.href}
          target={it.blank ? "_blank" : undefined}
          rel={it.blank ? "noreferrer" : undefined}
          onClick={() => setOpen(null)}
        >
          {it.label}
        </a>
      );
    }
    return (
      <button
        key={it.label}
        className="mb-item"
        role="menuitem"
        type="button"
        onClick={() => {
          setOpen(null);
          it.onSelect?.();
        }}
      >
        {it.label}
      </button>
    );
  };

  return (
    <header className="mb-bar" ref={barRef}>
      <div className="mb-left">
        <span className="mb-apple" aria-hidden="true">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="currentColor">
            <path d={APPLE} />
          </svg>
        </span>

        {MENUS.map((m) => (
          <div className="mb-menu" key={m.id}>
            <button
              type="button"
              className={`mb-title${m.app ? " mb-title--app" : ""}${
                open === m.id ? " is-open" : ""
              }`}
              aria-haspopup="true"
              aria-expanded={open === m.id}
              onClick={() => setOpen(open === m.id ? null : m.id)}
              onMouseEnter={() => open && setOpen(m.id)}
            >
              {m.label}
            </button>
            {open === m.id && (
              <div className="mb-drop" role="menu">
                {m.items.map(renderItem)}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="mb-right">
        {/* inert on purpose — see the note at the top of this file */}
        <span className="mb-status" aria-hidden="true">
          <Wifi size={14} strokeWidth={1.9} />
        </span>
        <span className="mb-status" aria-hidden="true">
          <Search size={13} strokeWidth={2} />
        </span>
        <span className="mb-status" aria-hidden="true">
          <ControlCentre />
        </span>
        <span className="mb-status" aria-hidden="true">
          <Battery size={16} strokeWidth={1.7} />
        </span>
        <Clock />
      </div>
    </header>
  );
}
