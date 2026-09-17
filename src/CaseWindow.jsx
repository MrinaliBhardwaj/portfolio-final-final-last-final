// A CASE STUDY, AS A WINDOW ON THE DESKTOP.
//
// Tapping a project file used to navigate to #/design/<slug> — you left the
// desktop to read about the work. In the reference the case study opens as a
// macOS window ON the desktop instead: the wallpaper, the files and the dock all
// stay put behind it, several can be open at once, and you drag them around.
// That is the difference between a site that looks like a desktop and one that
// behaves like one, so the window is what a project file opens now.
//
// IT IS A FINDER-SHAPED APP NOW (1 Sep 2026), not a scroller. The window held
// one thing — an exported artboard, 1400x22306 for Meal Maestro — under a short
// preamble. That is a PDF viewer wearing a Mac window: the study could not
// reflow, could not be read on a phone, could not be searched or selected or
// scanned, and moving between projects meant two chevrons that never said what
// was on either side of you.
//
// So the window has a SIDEBAR and a DOCUMENT. The sidebar is the whole body of
// work, always visible, current project lit — how a hiring manager sees that
// there are four of these and jumps between them without closing anything.
//
// AND THE DOCUMENT IS THE PROJECT'S OWN PAGE NOW (17 Sep 2026). It used to be
// generic sections — hero, overview, "the work" — with the last of those
// rendering the project's entire Behance board as 20,000px of stacked slices.
// Identical for all four projects, and a layout none of them chose. The
// document is case/ProjectPage.jsx: one art-directed page per project, built
// out of the board rather than being it, with the board folded away at the
// foot. THIS FILE OWNS THE WINDOW AND NOTHING INSIDE IT — the chrome, the
// lights, the sidebar, the fold, the page lock. Everything below the title bar
// belongs to the project.
//
// LIGHT, on a dark site, deliberately: a Mac window is a light panel and this
// one is quoting a Mac window. The DOCUMENT inside it may be any colour it
// likes (Layover's is near-black) — a Mac app in dark content mode looks
// exactly like that.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useDragControls } from "framer-motion";
import { ChevronLeft, ChevronRight, ChevronDown, Folder } from "lucide-react";
import { PROJECTS } from "./projects.js";
import ProjectPage from "./case/ProjectPage.jsx";
import "./case-window.css";

// HOW MANY FULL-SCREEN WINDOWS ARE OPEN. A count rather than a boolean because
// several case windows can be open at once: if each one just set and cleared the
// lock, the first to close would unlock the page while another was still filling
// the screen, and the desktop's scrollbar would come back underneath it.
let fullCount = 0;

function lockPage(on) {
  const root = document.documentElement;
  const was = fullCount;
  fullCount = Math.max(0, fullCount + (on ? 1 : -1));
  if (fullCount > 0 && was === 0) {
    // MEASURE THE BAR BEFORE TAKING IT AWAY. `scrollbar-gutter: stable` was
    // supposed to hold the gutter open through the lock and does not — html
    // carries `overflow-x: clip`, which stops it being a scroll container the
    // moment the other axis goes hidden, and the reserved 15px collapses with
    // it. The page then jumped 15px right as the window opened. This reads the
    // real width of the bar while it is still there and pays it back as
    // padding. On macOS the bar is an overlay, the gap measures 0, and this
    // whole branch costs nothing.
    const gap = window.innerWidth - root.clientWidth;
    root.style.setProperty("--page-lock-gap", `${gap}px`);
    root.classList.add("has-fullwin");
  } else if (fullCount === 0 && was > 0) {
    root.classList.remove("has-fullwin");
    root.style.removeProperty("--page-lock-gap");
  }
}

// ---- the fold ----
// Past FOLD_AT the sidebar folds into its Projects bar; back within AT_TOP of the
// top it opens again. The distance between the two is what stops the fold's own
// reflow from flipping it straight back.
const FOLD_AT = 40;
const AT_TOP = 4;

/**
 * The fold's duration, read from the stylesheet (`--cw-fold-t`), so the script
 * holding the reader's place and the transitions it holds against can never
 * run on two different clocks.
 * @param {Element} el
 */
function foldMs(el) {
  const v = getComputedStyle(el).getPropertyValue("--cw-fold-t").trim();
  const n = parseFloat(v) || 0;
  return v.endsWith("ms") ? n : n * 1000;
}

/**
 * HOLD THE READER'S LINE WHILE THE STUDY CHANGES WIDTH UNDER IT.
 *
 * Folding the sidebar gives the study 220px, and a wider study is a taller one:
 * every board above you grows by the same ratio, so the words you were reading
 * sink down the screen — tens of pixels near the top, hundreds eight screens
 * in. That is the jump. Chrome's scroll anchoring hides some of it and Safari
 * has none at all.
 *
 * So this anchors by hand, for exactly the fold's duration. It takes the point
 * on whatever sits on the reading line — a PROPORTIONAL point, so a board that
 * scales keeps the same pixel of itself on the line — and every frame moves the
 * scroll by however far layout moved that point. Only layout's share: the point
 * is measured in document space, so a wheel still turning mid-fold scrolls
 * normally on top of it. Sub-pixel remainders are carried, or twenty frames of
 * rounding add up to a visible creep.
 *
 * @param {HTMLElement} scroller
 * @param {number} ms
 * @param {number} floor never compensate above this (a fold that pulled the page
 *   back past FOLD_AT would unfold itself); a reader already above it is left be
 */
function holdReadingLine(scroller, ms, floor) {
  const box = scroller.getBoundingClientRect();
  const lineY = box.top + Math.min(box.height * 0.35, 320);
  let hit = document.elementFromPoint(box.left + box.width / 2, lineY);
  if (!hit || hit === scroller || !scroller.contains(hit)) hit = scroller.firstElementChild;
  if (!hit) return holdStill(scroller, ms);
  const anchor = hit;
  const r0 = anchor.getBoundingClientRect();
  const f = r0.height > 0 ? Math.min(1, Math.max(0, (lineY - r0.top) / r0.height)) : 0;
  const at = () => {
    const r = anchor.getBoundingClientRect();
    return r.top + f * r.height - scroller.getBoundingClientRect().top + scroller.scrollTop;
  };
  let prev = at();
  let owed = 0;
  const end = performance.now() + ms + 50; // a few frames past, so the last step lands
  scroller.style.overflowAnchor = "none"; // one anchor at a time; Chrome's would double it
  let id = requestAnimationFrame(function step(now) {
    const p = at();
    owed += p - prev;
    prev = p;
    if (owed) {
      const was = scroller.scrollTop;
      scroller.scrollTop = Math.max(Math.min(floor, was), was + owed);
      owed -= scroller.scrollTop - was;
      if (Math.abs(owed) >= 1) owed = 0; // held at an edge: drop it rather than lurch later
    }
    if (now < end) id = requestAnimationFrame(step);
    else scroller.style.overflowAnchor = "";
  });
  return () => {
    cancelAnimationFrame(id);
    scroller.style.overflowAnchor = "";
  };
}

/**
 * The top of the study, held: no anchoring of any kind while the fold runs.
 * @param {HTMLElement} scroller
 * @param {number} ms
 */
function holdStill(scroller, ms) {
  scroller.style.overflowAnchor = "none";
  const t = setTimeout(() => {
    scroller.style.overflowAnchor = "";
  }, ms + 50);
  return () => {
    clearTimeout(t);
    scroller.style.overflowAnchor = "";
  };
}

export default function CaseWindow({ project, index, z, onClose, onFocus, onSwitch }) {
  const p = project;
  const layer = useRef(null);
  const main = useRef(null);
  // A window's own three lights, and all three do something REAL to the window —
  // the same rule the title-bar lights follow (see WindowLights.jsx): red quits
  // it, yellow rolls it up into just its title bar (the classic Mac window
  // shade, which is a genuine behaviour and not a stand-in), green toggles it
  // large. Nothing here is a painted circle that swallows a click.
  const [rolled, setRolled] = useState(false);
  // FULL SCREEN FROM THE FIRST FRAME. It used to open at 1240 and expand on the
  // first scroll, folding the sidebar away as it went — three state changes
  // nobody asked for, one of them mid-read. A case study is what the visitor
  // clicked; it gets the screen immediately and then holds still. The green
  // light can put it back in a window, which is the one size change left and the
  // only one a person asks for.
  const [full, setFull] = useState(true);
  // THE SIDEBAR GETS OUT OF THE WAY ONCE YOU START READING. At the top of a
  // study the whole body of work is the point — how many there are, which one
  // this is. A line into the reading it is 220px of the study's measure spent on
  // something already read, so it folds into its Projects bar and gives the
  // width back; coming back to the top opens it again, because that is where it
  // earns its keep. The WINDOW never changes size, only the panel inside it.
  const [tucked, setTucked] = useState(false);
  // A PANEL OPENED BY HAND STAYS OPEN. Folding it again on the next wheel notch
  // is arguing with someone who just said what they wanted. The pin clears at
  // the top, where open is the resting state anyway.
  const pinned = useRef(false);
  // AND ONE SHUT BY HAND STAYS SHUT. The Projects row is a disclosure header in
  // both states, so it can fold the panel at the top of a study too — where the
  // first wheel notch (y 1…4) would otherwise read as "back at the top" and
  // throw it open again. It stays shut until the reader has scrolled past
  // FOLD_AT; after that, coming back to the top opens it as usual.
  const shut = useRef(false);
  // the fold as of right now, for the scroll handler — it is bound once, and
  // would otherwise read the first render's `tucked` forever
  const tuckedNow = useRef(false);
  // WHY it last changed: "fold", "chip", "shut" or "top". The layout effect below holds
  // the page differently for each, and the state alone cannot say which.
  const cause = useRef("");
  const want = (next, why) => {
    if (tuckedNow.current === next) return;
    tuckedNow.current = next;
    cause.current = why;
    setTucked(next);
  };
  const controls = useDragControls();

  // browse the work without closing the window — this is what makes the
  // reference's back/forward chevrons real rather than decorative
  const at = PROJECTS.findIndex((x) => x.slug === p.slug);
  const step = (d) => () =>
    onSwitch(PROJECTS[(at + d + PROJECTS.length) % PROJECTS.length].slug);

  // Switching projects in place has to reset the reading position. Without it
  // you pick Layover from the sidebar while eight screens down Meal Maestro and
  // land eight screens down Layover, which reads as a broken click.
  useEffect(() => {
    main.current?.scrollTo({ top: 0 });
    pinned.current = false;
    shut.current = false;
    want(false, "top");
  }, [p.slug]);

  // TWO THRESHOLDS, NOT ONE. FOLD_AT down to fold, AT_TOP up to unfold. A single
  // threshold lets the reflow the fold itself causes cross back over it and the
  // panel flickers — the same feedback loop that once stopped the green light
  // shrinking the window, where a scroll handler undid the very thing that
  // caused the scroll.
  useEffect(() => {
    const el = main.current;
    if (!el) return undefined;
    const onScroll = () => {
      const y = el.scrollTop;
      if (y <= AT_TOP) {
        if (shut.current) return;
        pinned.current = false;
        want(false, "top");
      } else if (y > FOLD_AT) {
        shut.current = false;
        if (!pinned.current) want(true, "fold");
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  // THE STUDY CHANGES WIDTH UNDER THE READER, AND THE READER SHOULD NOT MOVE.
  // A layout effect, so the reading line is measured against the layout of the
  // fold's first frame — the transition has begun but has not moved anything.
  // Returning to the top is the exception: there the thing to hold is the top
  // itself, and following a line down would carry the page back past FOLD_AT
  // and fold it again at once. A fold by hand at the top holds the top for the
  // same reason.
  useLayoutEffect(() => {
    const el = main.current;
    const why = cause.current;
    if (!el || !why) return undefined;
    const ms = foldMs(el);
    return why === "top" || (why === "shut" && el.scrollTop <= AT_TOP)
      ? holdStill(el, ms)
      : holdReadingLine(el, ms, why === "fold" ? FOLD_AT + 1 : 0);
  }, [tucked]);

  // TWO SCROLLBARS IS ONE TOO MANY. A full-screen window covers the desktop
  // completely, but the desktop is 320vh of scroll-scrubbed cover underneath and
  // it kept its own scrollbar — so the screen showed the study's bar and the
  // page's bar side by side, and the wheel could still scrub the lotus behind
  // something you cannot see. The page stops scrolling while the window fills
  // it; `scrollbar-gutter: stable` on html (index.css) is what keeps this from
  // shifting the layout by the bar's width.
  useEffect(() => {
    if (!full) return undefined;
    lockPage(true);
    return () => lockPage(false);
  }, [full]);

  return (
    <motion.div
      ref={layer}
      className={`cw${full ? " is-full" : ""}${rolled ? " is-rolled" : ""}`}
      style={{ zIndex: z }}
      // No cascade offset. Windows used to open stepped down-and-right of each
      // other, which is right for panels floating on a desktop and meaningless
      // for one that opens full screen — it only ever left a gap at the top-left
      // corner, since `animate` never puts x/y back.
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.14 } }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      // Dragged by the TITLE BAR only, the way a real window is — grabbing the
      // body of a Mac window selects text, it doesn't move the window. Hence
      // dragListener={false} plus the controls started from the bar below.
      // a full-screen window has nowhere to be dragged to
      drag={!full}
      dragListener={false}
      dragControls={controls}
      dragMomentum={false}
      dragElastic={0}
      onPointerDownCapture={onFocus}
      role="dialog"
      aria-label={`Case study: ${p.name}`}
    >
      <div
        className="cw-bar"
        onPointerDown={(e) => controls.start(e)}
        onDoubleClick={() => setRolled((r) => !r)}
      >
        <div className="cw-lights">
          <button
            type="button"
            className="cw-light cw-light--close"
            onClick={onClose}
            aria-label={`Close ${p.name}`}
          />
          <button
            type="button"
            className="cw-light cw-light--min"
            onClick={() => setRolled((r) => !r)}
            aria-label={rolled ? "Unroll this window" : "Roll up this window"}
          />
          <button
            type="button"
            className="cw-light cw-light--max"
            onClick={() => setFull((f) => !f)}
            aria-label={full ? "Shrink this window" : "Fill the screen"}
          />
        </div>

        <div className="cw-nav">
          <button type="button" onClick={step(-1)} aria-label="Previous project">
            <ChevronLeft size={15} strokeWidth={2} aria-hidden="true" />
          </button>
          <button type="button" onClick={step(1)} aria-label="Next project">
            <ChevronRight size={15} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <span className="cw-title">{p.name}</span>
      </div>

      {/* `hidden` rather than unmounted while rolled up: the window keeps its
          scroll position and its images stay decoded, so rolling back down is
          instant instead of re-fetching everything. */}
      <div className={`cw-shell${tucked ? " is-tucked" : ""}`} hidden={rolled}>
        {/* ---- the sidebar ----
            Every project, always, with the current one lit. It answers "how much
            work is there, and how do I get to the rest of it" — which two
            chevrons on a title bar cannot, because they never say what is on
            either side of you.

            It FOLDS INTO ITS OWN HEAD: the Projects row is the sidebar's header
            and the folded bar is that header with the sheet pulled up to it.
            The row never moves and never restyles — only its disclosure chevron
            turns, the way a Finder group's does. See "the fold" in
            case-window.css. */}
        <nav className="cw-side" aria-label="Projects">
          <div className="cw-side-sheet">
            <button
              type="button"
              className="cw-side-group"
              // A DISCLOSURE HEADER IN BOTH STATES. It used to be a dead label
              // while open and a button only once folded — two different
              // objects that happened to look alike. Now it does what its
              // chevron says either way: fold the list, or open it.
              onClick={() => {
                if (tucked) {
                  pinned.current = true;
                  shut.current = false;
                  want(false, "chip");
                } else {
                  pinned.current = false;
                  shut.current = true;
                  want(true, "shut");
                }
              }}
              aria-expanded={!tucked}
              aria-controls="cw-side-list"
            >
              <ChevronDown className="cw-side-chev" size={12} strokeWidth={2.2} aria-hidden="true" />
              <Folder size={13} strokeWidth={1.7} aria-hidden="true" />
              Projects
            </button>
            <ul className="cw-side-list" id="cw-side-list">
              {PROJECTS.map((x) => {
                const here = x.slug === p.slug;
                return (
                  <li key={x.slug}>
                    <button
                      type="button"
                      className={`cw-side-item${here ? " is-current" : ""}`}
                      // The highlight is not the whole story: a screen reader has
                      // to be told which row it is on too, and `aria-current` is
                      // how a navigation list says so.
                      aria-current={here ? "true" : undefined}
                      onClick={() => !here && onSwitch(x.slug)}
                    >
                      <img className="cw-side-thumb" src={x.cover} alt="" />
                      <span className="cw-side-text">
                        <span className="cw-side-name">{x.name}</span>
                        <span className="cw-side-kind">{x.what}</span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className="cw-side-foot">© 2025 Mrinali Bhardwaj</p>
          </div>
        </nav>

        {/* ---- the study ---- */}
        <div className="cw-main" ref={main}>
          {/* ---- the study ----
              A PROJECT PAGE, not a preamble over an export. This used to be
              ~250 lines of hero / band / prose / "The work", the last of which
              rendered the project's whole 20,000px Behance board as stacked
              slices — identical furniture for all four projects, and a layout
              none of them chose.

              It is one component now, and it is per-project: see
              case/ProjectPage.jsx. The window keeps everything that makes it
              this portfolio (the chrome, the sidebar, the fold, the measure);
              the document inside it is allowed to be the project. */}
          <ProjectPage project={p} scrollerRef={main} />
        </div>
      </div>
    </motion.div>
  );
}
