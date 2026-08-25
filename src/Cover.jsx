// The cover: the lotus is a PINNED stage, not part of the flow. A tall scroll
// track holds a sticky viewport-filling stage; scroll progress scrubs the
// bloom (see lotus.js) while the lotus stays fixed on screen.
//
// The narrative runs in one pinned stage, in three beats driven by scroll:
//   1. the name "Mrinali Bhardwaj" (one identity) rises and fades away
//   2. the bloomed lotus holds alone for a beat
//   3. the identity DIVERGES — and what reveals is the DESKTOP: the dock
//      surfaces, and her work scatters across the screen as files. The two
//      discipline cards that used to fill this beat were deleted on
//      18 Aug 2026; see the note where .cover-split used to be rendered.
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { ChevronDown } from "lucide-react";
import MenuBar from "./MenuBar.jsx";
import CaseWindow from "./CaseWindow.jsx";
import CodeWindow from "./CodeWindow.jsx";
import NoteWindow from "./NoteWindow.jsx";
import EmptyWindow from "./EmptyWindow.jsx";
import { PROJECTS } from "./projects.js";
import { TECH_PROJECTS } from "./tech-projects.js";
import TextMorph from "./TextMorph.jsx";
import DesktopFiles from "./DesktopFiles.jsx";
import NameMark from "./NameMark.jsx";
import { createParticles } from "./particles.js";
import { createLotusScrubber } from "./lotus.js";

// The two margin notes flanking the name — the roles behind each discipline.
// Module constants, not inline literals: TextMorph keys its interval effect on
// this array, and a fresh one each render would restart the timer mid-cycle.
const DESIGN_ROLES = [
  "UI/UX Designer",
  "Product Designer",
  "Visual Storyteller",
  "Interaction Designer",
  "Systems Thinker",
];

const TECH_ROLES = [
  "Software Developer",
  "Frontend Engineer",
  "Creative Coder",
  "Problem Solver",
];

// the resting pose as a small preloaded still — on screen from the very first
// paint, and pixel-identical to lotus frame 0, so the handoff to the canvas is
// invisible (see index.html preload)
const POSTER_URL = "/lotus-still.webp";

// The bloom is a pre-decoded frame sequence (see lotus.js and
// scripts/build_lotus_frames.py), already stored in scroll order: frame 0 is
// the resting pose at the top of the page. The source clip's arc was
// open → closes to a bud (~T5) → rotates and re-blooms (~T7) → fully open
// (~T10); the frames are reversed on disk, so across the track that reads as
// fully open at the top → folds closed (~progress 0.3) → the bud turns
// (0.3–0.5) → blooms back open toward the bottom. The arc spans the WHOLE
// track (0 → 1) so there's no frozen held frame at the end. Beat timings below
// are unchanged: the name is gone while the flower is closed; the desktop
// settles as it re-opens past progress ~0.77.
const SCRUB_END = 1;

const EASE = [0.22, 1, 0.36, 1];

// HOME IS A PLACE, NOT A CORRIDOR (2026-08-18). The scrub is the front door,
// not the hallway to every room: once a visitor has seen the ceremony, every
// later arrival at #/ lands directly ON the settled desktop — the bloom's end
// frame as the wallpaper, dock up, files out. sessionStorage on purpose: a
// fresh session gets the ceremony again; tab-hopping within one doesn't.
const INTRO_SEEN = "mb-intro-seen";

// exported: App's route effect needs the same answer (see App.jsx — its
// scroll-to-top and dock retraction are first-visit behaviours)
export const hasSeenIntro = () => {
  try {
    return sessionStorage.getItem(INTRO_SEEN) === "1";
  } catch {
    return false;
  }
};

const markIntroSeen = () => {
  try {
    sessionStorage.setItem(INTRO_SEEN, "1");
  } catch {
    /* private mode without storage: the ceremony replays, nothing breaks */
  }
};

// ---- windows are addressable ----
// #/?case=layover and #/?readme=regis. The query rides on the hash rather than
// on the real query string so it costs no server round-trip and so getRoute in
// App.jsx — which splits the hash on "?" already — keeps reading "" and keeps
// rendering the cover.
//
// One window in the address, not all of them: the URL names the FRONTMOST one,
// the way a window manager's title bar does. Reopening a shared link restores
// that window, not somebody else's whole session.
// keyed by WINDOW KIND, valued by URL param — the two differ for `empty`,
// whose address reads "folder=" because that is what the visitor opened
const WINDOW_PARAM = {
  case: "case",
  readme: "readme",
  note: "note",
  empty: "folder",
};

// The two covers with nothing behind them yet. Named, so the address is
// "#/?folder=horse" rather than an index that shifts the moment a piece is
// added, and validated below like every other id.
const EMPTY_FOLDERS = ["horse", "scenery"];

/** @returns {{kind: string, id: string}[]} */
function deepLinkedWindows() {
  if (typeof window === "undefined") return [];
  const query = window.location.hash.split("?")[1];
  if (!query) return [];
  const params = new URLSearchParams(query);
  const slug = params.get(WINDOW_PARAM.case);
  // Validated against the real lists. A stale or hand-typed id has to land on a
  // plain desktop, not on a window rendering `undefined`.
  if (slug && PROJECTS.some((p) => p.slug === slug))
    return [{ kind: "case", id: slug }];
  const key = params.get(WINDOW_PARAM.readme);
  if (key && TECH_PROJECTS.some((p) => p.key === key))
    return [{ kind: "readme", id: key }];
  // The scrapbook has exactly one note, so the id is checked against the one
  // value rather than a list — an unknown note is a plain desktop, same rule.
  if (params.get(WINDOW_PARAM.note) === "about")
    return [{ kind: "note", id: "about" }];
  const folder = params.get(WINDOW_PARAM.empty);
  if (folder && EMPTY_FOLDERS.includes(folder))
    return [{ kind: "empty", id: folder }];
  return [];
}

// The address of a window stack. replaceState, never location.hash: assigning
// to the hash fires hashchange, App re-runs its route effect, and on a first
// visit that effect scrolls the ceremony back to the top under the visitor.
// replaceState fires nothing and leaves the scroll alone.
function syncWindowAddress(windows) {
  const top = windows[windows.length - 1];
  const query = top ? `?${WINDOW_PARAM[top.kind]}=${top.id}` : "";
  try {
    history.replaceState(null, "", `#/${query}`);
  } catch {
    /* a sandboxed frame may refuse replaceState; the windows still work */
  }
}

export default function Cover({ onChoose, onSettledChange }) {
  const particlesRef = useRef(null);
  const trackRef = useRef(null);
  const canvasRef = useRef(null);
  const progressRef = useRef(0);
  // mirror the two scroll-driven booleans so we only enter React's scheduler
  // when one actually flips, not on every scroll tick (see below)
  const splitRef = useRef(false);
  const settledRef = useRef(false);
  const [split, setSplit] = useState(false);
  // the same threshold the dock surfaces on, mirrored into state because the
  // desktop files render inside the stage (see DesktopFiles.jsx). Same guarded
  // pattern as `split` below: two renders per scroll direction, not sixty.
  const [settled, setSettled] = useState(false);
  // Hold the name invisible until BOTH its scripts have actually loaded — the
  // capitals are Ballet and the lowercase is Pinyon, and each has a fallback
  // (Segoe Script) close enough in metrics that font-display:swap flashed the
  // wrong script on every cold load. Waiting on Ballet alone would still let
  // "rinali"/"hardwaj" pop from the fallback a beat later. allSettled, not all,
  // so one failed fetch cannot leave the name hidden behind the timeout.
  const [fontReady, setFontReady] = useState(false);

  // OPEN WINDOWS, in stacking order — the array IS the z-order, last is
  // frontmost, which is how a window manager actually works and saves carrying
  // a separate z per window. Opening one that is already open raises it instead
  // of adding a duplicate, exactly as clicking a dock icon does.
  //
  // ONE LIST FOR BOTH KINDS, not a list of case studies beside a list of
  // READMEs. There is a single desktop and therefore a single stack: a design
  // window has to be able to sit on top of an engineering one and vice versa,
  // and two arrays could only ever interleave by accident.
  const [windows, setWindows] = useState(deepLinkedWindows);

  const same = (a, kind, id) => a.kind === kind && a.id === id;
  const openWindow = (kind, id) =>
    setWindows((list) => [...list.filter((w) => !same(w, kind, id)), { kind, id }]);
  const closeWindow = (kind, id) =>
    setWindows((list) => list.filter((w) => !same(w, kind, id)));
  // switching with a window's own chevrons REPLACES the front window rather
  // than opening a second one — it is the same window looking at another project
  const switchWindow = (kind, from) => (to) =>
    setWindows((list) => [
      ...list.filter((w) => w.kind !== kind || (w.id !== from && w.id !== to)),
      { kind, id: to },
    ]);

  // the address follows the stack, so the front window is always the one a
  // copied URL will reopen
  useEffect(() => {
    syncWindowAddress(windows);
  }, [windows]);

  // …AND THE STACK FOLLOWS THE ADDRESS, which is the other half and was missing.
  // deepLinkedWindows() ran once, at mount, so a window could only ever be
  // opened by clicking its file. Anything that reached one by SETTING THE HASH
  // — the menu bar's "About Me", a link in another world, the back button, a
  // URL pasted into the tab that is already here — changed the address and
  // opened nothing.
  //
  // syncWindowAddress uses replaceState, which fires no hashchange, so the two
  // effects cannot chase each other: this only ever hears a navigation that
  // came from outside the stack.
  //
  // GUARDED ON THE ROUTE, and it has to be. Leaving for another world is a
  // hashchange as well, and answering that one here would set the stack empty,
  // which re-runs the effect above, which writes "#/" — cancelling the
  // navigation the visitor just asked for. "#/notes" survived exactly as long
  // as it took the listener to fire. The cover owns this address only while
  // the cover is the address.
  useEffect(() => {
    const onHash = () => {
      const path = window.location.hash.replace(/^#/, "").split("?")[0];
      if (path !== "" && path !== "/") return;
      setWindows(deepLinkedWindows());
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // The View menu's "Replay Intro". Forgetting the flag is only half of it —
  // the visitor is standing at the BOTTOM of the track on a settled desktop, so
  // the ceremony cannot start until they are back at the top. Scrolling there
  // is what actually replays it; clearing the flag is what stops the layout
  // effect from snapping them straight back down on the next arrival.
  const replayIntro = () => {
    try {
      sessionStorage.removeItem(INTRO_SEEN);
    } catch {
      /* nothing stored, nothing to forget */
    }
    window.scrollTo({
      top: 0,
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  useEffect(() => {
    let alive = true;
    Promise.allSettled([
      document.fonts.load('400 1em "Ballet Variable"'),
      document.fonts.load('400 1em "Pinyon Script"'),
    ]).then(() => alive && setFontReady(true));
    const t = setTimeout(() => alive && setFontReady(true), 2500);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, []);

  // THE FIT EFFECT IS GONE (2026-08-20). It measured whatever font actually
  // rendered the name and scaled it down to fit, because every number in
  // cover.css was tuned to Ballet + Pinyon and a fallback face (Segoe Script,
  // ~30% wider) sheared "hardwaj" off at the viewport edge. The name is vector
  // artwork now (NameMark.jsx): there is no font to substitute, its box IS its
  // ink box, and its width is a known constant in em. A safety net against a
  // hazard that no longer exists is just a moving part.


  // THE INSTA-LAND. If this session has already seen the ceremony, position
  // the page at the track's end BEFORE first paint — the stage shows the
  // bloom's final frame with the desktop assembled over it, which is her
  // stated vision for what home IS. Layout effect so the jump is invisible;
  // it also beats App's own scroll-to-top, which ran at route-commit time,
  // before this component existed (AnimatePresence mounts the cover only
  // after the old world's exit fade).
  //
  // Two continuity facts make the landing seamless rather than a jump:
  //   · the poster base layer is frame 0, the OPEN lotus, and the track's end
  //     frame is the re-bloomed OPEN lotus — so even before the frame atlas
  //     arrives, an open flower is on screen and the canvas paint that follows
  //     is a near-match, not a pop;
  //   · every scroll-driven transform (name gone, chevron gone, split in)
  //     computes from the same scroll position being set here, so the whole
  //     stage agrees about where it is.
  //
  // The settle signals are pushed by hand because useMotionValueEvent only
  // reports CHANGES — a page born at progress 1 never fires one, and the dock
  // and files would wait forever for a scroll that isn't coming. The refs are
  // set too, so the first real scroll event doesn't re-announce.
  useLayoutEffect(() => {
    // A DEEP-LINKED WINDOW SKIPS THE CEREMONY. Someone arriving at
    // #/?case=layover asked for that window, not for the bloom: leaving the
    // intro owed would open the window over a scrubbing lotus and put the
    // visitor at the TOP of the track, several screens above the desk it is
    // supposed to be sitting on. Marking it seen here (before the check below)
    // lands them on the settled desktop with the window on it.
    if (windows.length) markIntroSeen();
    if (!hasSeenIntro()) return;
    const track = trackRef.current;
    if (!track) return;
    window.scrollTo(
      0,
      track.offsetTop + track.offsetHeight - window.innerHeight
    );
    progressRef.current = 1;
    splitRef.current = true;
    settledRef.current = true;
    setSplit(true);
    setSettled(true);
    onSettledChange?.(true);
    // deps deliberately empty: this is a mount-time decision, and
    // onSettledChange is App's stable setter
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // scroll progress across the tall track drives everything on the stage
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progressRef.current = v;
    // Both of these are THRESHOLDS, but this callback fires on every scroll
    // tick. Calling the setters unconditionally entered React's dispatch path
    // ~60x/second during the scrub (React bails on an identical value, but only
    // after scheduling), and a genuine flip re-renders Cover AND App — which
    // re-renders the Dock and the whole AnimatePresence subtree. Guarding on a
    // ref means React hears about it exactly twice per scroll direction.
    const nextSplit = v > 0.5;
    if (nextSplit !== splitRef.current) {
      splitRef.current = nextSplit;
      // the identity diverges as the re-bloom starts — brighten the nav labels
      setSplit(nextSplit);
    }
    const nextSettled = v > 0.77;
    if (nextSettled !== settledRef.current) {
      settledRef.current = nextSettled;
      // once the divergence scene has fully settled, the dock (owned by App,
      // where it persists across routes) surfaces — and the desktop files
      // fade in alongside it
      onSettledChange?.(nextSettled);
      setSettled(nextSettled);
      // the ceremony has been seen to its end: from here on, #/ lands on the
      // settled desktop directly (see the layout effect above)
      if (nextSettled) markIntroSeen();
    }
  });

  // beat 1: the name rises and is fully gone by the time it reaches
  // mid-screen (~30vh into its 55vh rise), leaving the flower alone early
  const rise =
    typeof window !== "undefined" ? window.innerHeight * 0.55 : 440;
  const nameOpacity = useTransform(scrollYProgress, [0.05, 0.26], [1, 0]);
  const nameLift = useTransform(scrollYProgress, [0, 0.47], [0, -rise]);
  const chevronOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);
  // the margin notes annotate the name, so they leave with it — and they MUST
  // be gone before beat 3, which claims these same two margins at 0.51
  const asideOpacity = useTransform(scrollYProgress, [0.02, 0.22], [1, 0]);
  // the nudge keyframes are `infinite`, so once the chevron has faded out it
  // kept a composited layer ticking for the rest of the page. Park it. Driven
  // by a motion value, so this costs no React render.
  const chevronPlay = useTransform(scrollYProgress, (v) =>
    v > 0.14 ? "paused" : "running"
  );

  // Beat 3's four scroll-driven transforms (designOpacity/X, techOpacity/X)
  // went with the discipline cards they animated. `split` survives them: it
  // still pauses the two TextMorph columns at the divergence.

  // Paint the frame matching scroll progress, and drive the starfield from the
  // SAME loop — one requestAnimationFrame for the whole cover. Two independent
  // loops meant two wake-ups per frame with no ordering guarantee between the
  // scrub paint and the particle paint.
  useEffect(() => {
    const particles = createParticles(particlesRef.current);
    const scrubber = createLotusScrubber(
      canvasRef.current,
      () => {
        // Ease the scrub's HEAD without killing its TAIL. The sequence's head
        // is the clip's static "fully open, holding" tail, so a linear map left
        // the flower frozen for the first stretch of scroll — hence a boost.
        //
        // That boost used to be `r * (2 - r)`, whose slope is 2(1-r): it hits
        // ZERO at the end. The last of the 40 frames was therefore reached at
        // progress 0.887 and held for the remaining 11%, which at 320vh is
        // ~224px — a quarter of a screen of scrolling against a frozen flower.
        // Fixing the head had quietly moved the dead stretch to the bottom.
        //
        // The boost is now carried by (1-r)², whose value AND slope both vanish
        // at r = 1. Head rate is 2.2x (a touch faster than the old 2x), the tail
        // runs at exactly linear rate, and the final frame lands on the final
        // pixel of the track. The only flat spot left is the half-frame rounding
        // step every frame gets — ~25px, one twentieth of the old stall.
        const r = Math.min(1, progressRef.current / SCRUB_END);
        return r + 1.2 * r * (1 - r) * (1 - r);
      },
      { onStep: particles.step }
    );
    return () => {
      scrubber.destroy();
      particles.destroy();
    };
  }, []);


  return (
    <div className="cover">
      {/* starfield spans the whole cover as ambient connective tissue */}
      <canvas ref={particlesRef} className="cover-particles" aria-hidden="true" />

      {/* The macOS menu bar — a system layer, not a header. It replaced
          `.cover-nav` (monogram + centred DESIGN/TECH/NOTES/GALLERY/GAME strip
          + social icons) on 18 Aug 2026; see MenuBar.jsx for where the
          navigation went. */}
      <MenuBar onChoose={onChoose} onReplayIntro={replayIntro} />

      {/* one pinned stage carries the whole cover narrative */}
      <section className="cover-track" ref={trackRef} aria-label="Intro">
        <div className="cover-stage">
          {/* instant first paint: a small preloaded still of the resting pose.
              It NEVER fades on scroll — it's the permanent base of the stack,
              and the frame canvas simply paints over it. Fading it by scroll
              position opened a blank gap: scroll right after a refresh, before
              the frames arrive, and no layer was left holding the lotus. It is
              also pixel-identical to frame 0, so the handoff is invisible. */}
          <img
            className="cover-poster"
            src={POSTER_URL}
            alt=""
            fetchpriority="high"
            aria-hidden="true"
          />
          {/* the bloom itself: frames painted here, revealed once the atlas
              lands (~a few hundred ms). There is no <video> in this stack any
              more — see the header of lotus.js for why. */}
          <canvas
            ref={canvasRef}
            className="cover-video-canvas"
            aria-hidden="true"
          />
          <div className="cover-video-overlay" />

          {/* beat 1: the name, alone — then the script writes itself on via a
              mask wipe (see .is-inked). The "a design engineer" caption that
              used to sit under it is gone — the two margin notes below now
              carry the roles, and they say it in far more detail. */}
          <motion.div
            className="cover-hero-inner"
            style={{ opacity: nameOpacity, y: nameLift }}
          >
            {/* DRAWN, NOT SET (2026-08-20). This used to be four spans in two
                script faces — Ballet for the capitals, Pinyon for the lowercase
                — and Pinyon does not reliably join its letters: four pairs met
                at a tangent rather than an overlap and read as breaks. The
                outlines are kerned per pair now; see NameMark.jsx for the
                measurements and for why the two capitals are left apart.

                The wipe still sweeps the h1 as one box, and `fontReady` still
                gates it — not because the name needs a font any more, but
                because it is beat 1 of a sequence the margin notes below share.

                The visible artwork is aria-hidden and this line is the
                accessible name, the same split .cover-aside-sr uses: a screen
                reader gets the text, the screen gets the drawing. */}
            <h1 className={`cover-name-script${fontReady ? " is-inked" : ""}`}>
              <span className="cover-aside-sr">Mrinali Bhardwaj</span>
              <NameMark />
            </h1>
          </motion.div>

          {/* marginalia: the roles behind each discipline, pinned to the
              vertical centre of each edge. They annotate the name, so they
              arrive after it inks and fade out with it — long before beat 3
              takes these margins over. The visible column is aria-hidden (a
              word that swaps every 2.6s is unfollowable); the .cover-aside-sr
              line carries the same content to assistive tech at every width. */}
          <motion.aside
            className="cover-aside cover-aside--left"
            style={{ opacity: asideOpacity }}
          >
            <p className="cover-aside-sr">
              I am a UI/UX designer, product designer, visual storyteller,
              interaction designer and systems thinker.
            </p>
            <motion.div
              className="cover-aside-inner"
              aria-hidden="true"
              initial={{ opacity: 0, x: -8 }}
              animate={fontReady ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.9, ease: EASE, delay: 1.6 }}
            >
              <p className="cover-aside-lead">I am a</p>
              <TextMorph
                className="cover-aside-role"
                words={DESIGN_ROLES}
                interval={2600}
                paused={split}
              />
            </motion.div>
          </motion.aside>

          <motion.aside
            className="cover-aside cover-aside--right"
            style={{ opacity: asideOpacity }}
          >
            <p className="cover-aside-sr">
              As well as a software developer, frontend engineer, creative coder
              and problem solver.
            </p>
            <motion.div
              className="cover-aside-inner"
              aria-hidden="true"
              initial={{ opacity: 0, x: 8 }}
              animate={fontReady ? { opacity: 1, x: 0 } : {}}
              transition={{ duration: 0.9, ease: EASE, delay: 1.75 }}
            >
              <p className="cover-aside-lead">as well as a</p>
              <TextMorph
                className="cover-aside-role"
                words={TECH_ROLES}
                interval={2600}
                paused={split}
              />
            </motion.div>
          </motion.aside>

          {/* BEAT 3 IS NOW THE DESKTOP ITSELF. The two discipline cards that
              lived here — "Design / What blooms in sight / …" and "Tech / What
              roots beneath / …", with their two Explore CTAs — were deleted on
              18 Aug 2026 by request. They were the last of the landing-page
              fiction sitting on top of the machine one, and with the files
              scattered across the screen as the hero there is nothing for them
              to do but compete.

              Navigation lost nothing: design and tech are in the menu bar, in
              the dock, and on the desktop as design.fig / tech.ts. The whole
              `.cover-split` block, its scrims and its type styles are gone from
              cover.css too rather than left orphaned. */}
          <DesktopFiles
            visible={settled}
            onOpenCase={(slug) => openWindow("case", slug)}
            onOpenNote={(id) => openWindow("note", id)}
            onOpenEmpty={(id) => openWindow("empty", id)}
          />

          <motion.div
            className="cover-scroll"
            style={{ opacity: chevronOpacity, animationPlayState: chevronPlay }}
            aria-hidden="true"
          >
            <ChevronDown size={24} strokeWidth={2} />
          </motion.div>
        </div>
      </section>

      {/* THE OPEN WINDOWS, rendered OUTSIDE .cover-stage on purpose: the stage
          is `overflow: hidden`, and a window you can drag has to be able to
          leave the box it was born in. They sit above the files and below the
          dock, which is the macOS order. */}
      <AnimatePresence>
        {windows.map((w, i) => {
          // the array's own order is the stacking order — last is frontmost
          const shared = {
            index: i,
            z: 20 + i,
            onClose: () => closeWindow(w.kind, w.id),
            onFocus: () => openWindow(w.kind, w.id),
            onSwitch: switchWindow(w.kind, w.id),
          };
          if (w.kind === "case") {
            const p = PROJECTS.find((x) => x.slug === w.id);
            // key is prefixed by kind: the id spaces are separate lists and
            // nothing stops a slug and a project key from colliding one day
            return p ? <CaseWindow key={`case:${w.id}`} project={p} {...shared} /> : null;
          }
          // Neither of these browses a list, so neither takes onSwitch — the
          // chevrons that would carry it are not in their title bars.
          if (w.kind === "note") return <NoteWindow key="note:about" {...shared} />;
          if (w.kind === "empty")
            return <EmptyWindow key={`empty:${w.id}`} {...shared} />;
          const p = TECH_PROJECTS.find((x) => x.key === w.id);
          return p ? <CodeWindow key={`readme:${w.id}`} project={p} {...shared} /> : null;
        })}
      </AnimatePresence>
    </div>
  );
}
