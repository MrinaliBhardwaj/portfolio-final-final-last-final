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
// there are three of these and jumps between them without closing anything. The
// document is HTML sections at a ~1100px measure: hero, the numbers, the
// overview, the screens. The export is not gone — it is folded away at the foot
// of the study, where it is an archive rather than the page.
//
// LIGHT, on a dark site, deliberately: a Mac window is a light panel and this
// one is quoting a Mac window. Notes is already a light world, so the vocabulary
// exists in the project.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { motion, useDragControls } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowUpRight,
  Folder,
  User,
  Calendar,
  Trophy,
  Layers,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { PROJECTS } from "./projects.js";

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

/** the artboard's own pixel width, so a wide window can't blow it up past 1:1 */
function nativeWidth(shot) {
  if (shot.sliceSize) return `${shot.sliceSize[0]}px`;
  const w = shot.dims && parseInt(shot.dims, 10);
  return w ? `${w}px` : undefined;
}

// The meta row under the title reads as facts rather than a definition list only
// because each fact carries a mark. `facts` is authored as free-text pairs, so
// this matches on the label rather than demanding a fixed schema — anything
// unrecognised still renders, just with the neutral mark.
// (Objects rather than pairs: a `[RegExp, Icon]` tuple widens to
// `(RegExp | Icon)[]` under checkJs, and the icon then can't be used as a
// component. Named fields keep both types intact.)
const FACT_ICONS = [
  { re: /role|design|craft/i, icon: User },
  { re: /time|when|date|dur/i, icon: Calendar },
  { re: /recog|award|place|prize/i, icon: Trophy },
  { re: /surface|deliver|scope|platform/i, icon: Layers },
  { re: /reach|result|impact|metric/i, icon: TrendingUp },
];

function factIcon(label) {
  return FACT_ICONS.find((f) => f.re.test(label))?.icon || Sparkles;
}

/** the picture that leads the study: a named hero, its first screen, else its cover */
function heroArt(p) {
  // `hero` exists because a project can have a full case-study BOARD and no
  // shots at all — and then the fallback was the folder cover, which is cropped
  // for a folder and not for a 16/10 hero.
  if (p.hero) return { src: p.hero, alt: "" };
  const shot = (p.shots || []).find((s) => s.src);
  return shot ? { src: shot.src, alt: shot.alt } : { src: p.cover, alt: "" };
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
  // the fold as of right now, for the scroll handler — it is bound once, and
  // would otherwise read the first render's `tucked` forever
  const tuckedNow = useRef(false);
  // WHY it last changed: "fold", "chip" or "top". The layout effect below holds
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
        pinned.current = false;
        want(false, "top");
      } else if (y > FOLD_AT && !pinned.current) {
        want(true, "fold");
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
  // and fold it again at once.
  useLayoutEffect(() => {
    const el = main.current;
    const why = cause.current;
    if (!el || !why) return undefined;
    const ms = foldMs(el);
    return why === "top"
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

  const hero = heroArt(p);
  const shots = p.shots || [];
  const boards = p.boards || [];

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

            It FOLDS INTO ITS OWN HEAD: the Projects row is the folded bar. The
            sheet closes in on that row and the row never moves, so there is no
            second element to hand off to and nothing to line up. See "the fold"
            in case-window.css. */}
        <nav className="cw-side" aria-label="Projects">
          <div className="cw-side-sheet">
            <p className="cw-side-title">Portfolio</p>
            <button
              type="button"
              className="cw-side-group"
              // a label while the list is open; the whole panel while it is not
              onClick={
                tucked
                  ? () => {
                      pinned.current = true;
                      want(false, "chip");
                    }
                  : undefined
              }
              tabIndex={tucked ? 0 : -1}
              aria-hidden={tucked ? undefined : "true"}
              aria-expanded={tucked ? false : undefined}
              aria-controls={tucked ? "cw-side-list" : undefined}
            >
              <ChevronDown size={12} strokeWidth={2.2} aria-hidden="true" />
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
          <article className="cw-doc">
            <header className="cw-hero">
              <div className="cw-hero-text">
                <p className="cw-eyebrow">
                  {p.what}
                  {p.when && <span className="cw-eyebrow-when">{p.when}</span>}
                </p>
                <h2>{p.name}</h2>
                {p.blurb && <p className="cw-lede">{p.blurb}</p>}
                {p.facts && (
                  <dl className="cw-meta">
                    {p.facts.slice(0, 3).map(([k, v]) => {
                      const Mark = factIcon(k);
                      return (
                        <div key={k}>
                          <Mark size={16} strokeWidth={1.6} aria-hidden="true" />
                          <div>
                            <dt>{k}</dt>
                            <dd>{v}</dd>
                          </div>
                        </div>
                      );
                    })}
                  </dl>
                )}
              </div>
              <div className="cw-hero-art">
                <img src={hero.src} alt={hero.alt} decoding="async" draggable="false" />
              </div>
            </header>

            {/* Overview and the numbers share a band, as in the reference: the
                prose says what it is, the figures say whether it worked, and a
                hiring manager reads the second one first. */}
            {/* only when there is something to say — a pending study has
                no overview yet, and a heading over nothing reads as broken */}
            {(p.summary || p.blurb || p.metrics?.length > 0) && (
              <section className="cw-band">
                <div className="cw-band-copy">
                  <h3 className="cw-kicker">Overview</h3>
                  <p>{p.summary || p.blurb}</p>
                </div>
                {p.metrics?.length > 0 && (
                  <div className="cw-band-stats">
                    <h3 className="cw-kicker">Key outcome</h3>
                    <dl className="cw-stats">
                      {p.metrics.map((m) => (
                        <div key={m.label}>
                          <dd>{m.value}</dd>
                          <dt>{m.label}</dt>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
              </section>
            )}

            {/* The written study. Empty until the rewritten copy lands, and it
                renders nothing at all rather than an empty heading — see the
                `sections` note in projects.js. */}
            {p.sections?.length > 0 && (
              <section className="cw-prose">
                {p.sections.map((s) => (
                  <div key={s.title}>
                    <h3 className="cw-kicker">{s.title}</h3>
                    <p>{s.body}</p>
                  </div>
                ))}
              </section>
            )}

            {p.contributions?.length > 0 && (
              <section className="cw-role">
                <h3 className="cw-kicker">What I did</h3>
                <ul>
                  {p.contributions.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </section>
            )}

            {p.facts?.length > 3 && (
              <section className="cw-detail">
                <h3 className="cw-kicker">Details</h3>
                <dl className="cw-facts">
                  {p.facts.slice(3).map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            <section className="cw-screens">
              <h3 className="cw-kicker">The work</h3>
              {boards.length > 0 ? (
                /* THE CASE STUDY AS SHE PRESENTED IT. Not the Meal Maestro
                   situation: that one is an artboard demoted to an appendix
                   because nothing had replaced it yet. This is the study, and it
                   is what the section is for. Each board is cut into slices (see
                   projects.js) and stacked seamlessly, and every slice carries
                   its real width and height so the browser reserves the space
                   before the image lands and the window's scroll never jumps.
                   `loading="lazy"` earns its keep here — unlike the Figma canvas,
                   a case window really does scroll.

                   PLURAL, because a project can have more than one: Futurepreneurs
                   arrived as two boards. They are drawn one after the other, each
                   captioned with its own size, rather than run together — two
                   decks concatenated would put a closing slide in the middle. */
                boards.map((b, bi) => (
                  <figure className="cw-board" key={b.node || bi}>
                    <div className="cw-strip">
                      {b.slices.map((sl, i) => (
                        <img
                          key={sl.src}
                          src={sl.src}
                          alt={i === 0 ? b.alt : ""}
                          aria-hidden={i === 0 ? undefined : "true"}
                          loading="lazy"
                          decoding="async"
                          width={sl.w}
                          height={sl.h}
                          draggable="false"
                        />
                      ))}
                    </div>
                    <figcaption>
                      {b.title || "The full case study"}
                      <span className="cw-board-dim">{b.dims}</span>
                    </figcaption>
                  </figure>
                ))
              ) : shots.length > 0 ? (
                <div className="cw-shots">
                  {shots.map((shot, i) => (
                    <figure
                      className={`cw-shot${shot.wide ? " is-wide" : ""}`}
                      key={shot.frame || shot.src}
                    >
                      <div
                        className="cw-shot-art"
                        // NEVER UPSCALE AN ARTBOARD. The window is 1240 wide and
                        // 1600 zoomed, and the image is `width: 100%` — without
                        // this a 1400px export renders at 1560 in a zoomed
                        // window, which is 11% of pure blur.
                        style={{ maxWidth: nativeWidth(shot) }}
                      >
                        <img
                          src={shot.src}
                          alt={shot.alt}
                          // every shot is lazy in here, including the first: a
                          // window opens over a desktop the visitor is already
                          // looking at, so nothing in it is above the fold at
                          // open time
                          loading="lazy"
                          decoding="async"
                          draggable="false"
                        />
                      </div>
                      <figcaption>
                        <span className="cw-shot-n" aria-hidden="true">
                          {i + 1}
                        </span>
                        <span>
                          {shot.frame && <b className="cw-shot-name">{shot.frame}</b>}
                          {shot.caption}
                        </span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              ) : (
                /* Honest rather than decorative: an empty frame would imply the
                   work doesn't exist. It does — the screens just aren't broken
                   out yet. */
                <p className="cw-empty">
                  {/* a project whose study has not arrived says so in its own
                      words (`pending`); one with an export but no screens
                      says that */}
                  {p.pending || (
                    <>
                      The screens for this one aren&rsquo;t broken out yet
                      {p.archive ? " — the full export is below." : "."}
                    </>
                  )}
                </p>
              )}
            </section>

            {/* THE EXPORT, DEMOTED. It used to be the page: 18 slices of one
                22,306px picture. Real work, but flat, unreflowable and unreadable
                on a phone, so it is an appendix you open rather than the thing
                you land on. Closed by default, and `loading="lazy"` inside a
                closed <details> means the browser fetches none of its 1.26 MB
                until someone asks for it. */}
            {p.archive && (
              <details className="cw-archive">
                <summary>
                  <ChevronRight size={14} strokeWidth={2} aria-hidden="true" />
                  The full case study, as exported from Figma
                  <span className="cw-archive-dim">{p.archive.dims}</span>
                </summary>
                <div className="cw-strip">
                  {p.archive.strip.map((src, s) => {
                    // the last slice is short — the source height rarely divides
                    // evenly — so it declares its own size
                    const [w, h] =
                      s === p.archive.strip.length - 1 && p.archive.lastSliceSize
                        ? p.archive.lastSliceSize
                        : p.archive.sliceSize;
                    return (
                      <img
                        key={src}
                        src={src}
                        alt={s === 0 ? p.archive.alt : ""}
                        aria-hidden={s === 0 ? undefined : "true"}
                        loading="lazy"
                        decoding="async"
                        width={w}
                        height={h}
                        draggable="false"
                      />
                    );
                  })}
                </div>
              </details>
            )}

            <div className="cw-actions">
              {p.live && (
                <a className="cw-open" href={p.live} target="_blank" rel="noreferrer">
                  Visit the live site
                  <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
                </a>
              )}
              {p.external && (
                <a
                  className="cw-open cw-open--quiet"
                  href={p.external}
                  target="_blank"
                  rel="noreferrer"
                >
                  Behance
                  <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
                </a>
              )}
            </div>
          </article>
        </div>
      </div>
    </motion.div>
  );
}
