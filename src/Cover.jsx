// The cover: the lotus is a PINNED stage, not part of the flow. A tall scroll
// track holds a sticky viewport-filling stage; scroll progress scrubs the
// bloom (see lotus.js) while the lotus stays fixed on screen.
//
// The narrative runs in one pinned stage, in three beats driven by scroll:
//   1. the name "Mrinali Bhardwaj" (one identity) rises and fades away
//   2. the bloomed lotus holds alone for a beat
//   3. the identity DIVERGES — Design (left, pink) and Tech (right, blue)
//      reveal on either side of the still lotus, and the nav labels brighten
//      to their side colors. The two "Explore" CTAs enter each world.
import { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "framer-motion";
import { ChevronDown, Mail, ArrowUpRight } from "lucide-react";
import { LinkedInMark } from "./BrandIcons.jsx";
import { EMAIL, LINKEDIN } from "./links.js";
import TextMorph from "./TextMorph.jsx";
import DesktopFiles from "./DesktopFiles.jsx";
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
// are unchanged: the name is gone while the flower is closed; the split text
// reveals as it re-opens past progress ~0.5.
const SCRUB_END = 1;

const EASE = [0.22, 1, 0.36, 1];

// px of breathing room kept between the name's outermost ink and the stage edge
// (see the fit effect). Small on purpose: it is a guard against the swash
// touching the edge, not a margin in the design sense.
const SIDE_GUARD = 8;

// The menu bar's items. Every one of the six dock apps that is a real
// destination, in the dock's own order, so the two surfaces agree. Claude is
// absent because it navigates nowhere — a named menu item that does nothing is
// worse than no item.
const WORLDS = [
  ["design", "Design"],
  ["tech", "Tech"],
  ["notes", "Notes"],
  ["gallery", "Gallery"],
  ["pond", "Game"],
];

export default function Cover({ onChoose, onSettledChange }) {
  const particlesRef = useRef(null);
  const trackRef = useRef(null);
  const canvasRef = useRef(null);
  const heroRef = useRef(null);
  const nameRef = useRef(null);
  // one reusable 2D context for the ink measurement below — allocating a canvas
  // per resize tick would be the expensive part of an otherwise cheap effect
  const fitCtx = useRef(null);
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

  // The name's SAFETY NET. Every number in cover.css — the 13vw size, the
  // measured 13.79vw ink ceiling, the em-based drop — is tuned to Ballet +
  // Pinyon. The instant a different face renders the name those numbers are
  // wrong, and the failure is silent and ugly: the name is `white-space: nowrap`
  // inside a stage that is `overflow: hidden`, so anything too wide is not
  // wrapped or scaled, it is SHEARED at the viewport edge.
  //
  // That is not hypothetical. Segoe Script — the fallback that paints while the
  // webfonts load, and permanently if they fail — lays out ~30% wider and
  // overflowed at every width tested (1024 through 1600). At 1366 it ran 241px
  // past the available width and 204px of "hardwaj" was cut off, taking the j
  // and its dot with it.
  //
  // So: measure what actually rendered and scale to fit, rather than trusting
  // that the intended font is the one on screen. Re-run whenever the fonts
  // settle (both the `fontReady` gate below AND document.fonts.ready, since the
  // real faces can land after that gate's 2.5s timeout has already given up)
  // and on resize, because the budget is a vw. Measurement is synchronous
  // against a reset value so it never compounds on itself.
  useEffect(() => {
    const hero = heroRef.current;
    const name = nameRef.current;
    if (!hero || !name) return;

    const fit = () => {
      hero.style.setProperty("--name-fit", "1");
      // flush the reset so the measurement below sees the unscaled name
      void name.offsetWidth;

      // TRUE GLYPH INK, not the advance boxes. This distinction is the whole
      // point: `getBoundingClientRect()`/Range return layout boxes, and these
      // faces do not stay inside theirs — Ballet's M paints 128px past its own
      // advance at 185px, and "hardwaj" 19px past its. Measuring boxes said the
      // name cleared the stage by 89px when the ink cleared it by 57px. Canvas
      // `actualBoundingBox*` is the only thing here that reports where the paint
      // actually lands, and it uses the real loaded face.
      const ctx = (fitCtx.current ||= document
        .createElement("canvas")
        .getContext("2d"));
      let inkL = Infinity;
      let inkR = -Infinity;
      for (const run of name.children) {
        const k = getComputedStyle(run);
        // first family only: this is the face that actually rendered
        const family = k.fontFamily.split(",")[0].trim();
        ctx.font = `${k.fontStyle} ${k.fontWeight} ${parseFloat(k.fontSize)}px ${family}`;
        const m = ctx.measureText(run.textContent);
        const box = run.getBoundingClientRect();
        inkL = Math.min(inkL, box.left - m.actualBoundingBoxLeft);
        inkR = Math.max(inkR, box.left + m.actualBoundingBoxRight);
      }
      if (!Number.isFinite(inkL) || !Number.isFinite(inkR)) return;

      // Solve about the CENTRE, not the width. The name is centred but its ink
      // is not symmetric (the M leads with a swash, the j trails with one), so
      // a name that fits on width can still put one end through the edge. Both
      // halves scale with the font, so the binding constraint is simply the
      // longer of the two.
      const sb = hero.parentElement.getBoundingClientRect();
      const pad = getComputedStyle(hero);
      const padX =
        (parseFloat(pad.paddingLeft) || 0) + (parseFloat(pad.paddingRight) || 0);
      const centre = sb.left + sb.width / 2;
      const halfNeeded = Math.max(centre - inkL, inkR - centre);
      // SIDE_GUARD keeps the outermost swash off the edge rather than exactly on
      // it, so subpixel rounding can never shave it
      const halfAvail = (sb.width - padX) / 2 - SIDE_GUARD;

      if (halfNeeded > halfAvail && halfNeeded > 0 && halfAvail > 0) {
        hero.style.setProperty(
          "--name-fit",
          (halfAvail / halfNeeded).toFixed(4)
        );
      }
    };

    fit();
    window.addEventListener("resize", fit);
    let alive = true;
    document.fonts?.ready.then(() => alive && fit());
    return () => {
      alive = false;
      window.removeEventListener("resize", fit);
    };
  }, [fontReady]);

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
      // where it persists across routes) surfaces — and the desktop files fly
      // up onto the screen alongside it
      onSettledChange?.(nextSettled);
      setSettled(nextSettled);
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

  // beat 3: ~0.5s after the name is gone, as the flower STARTS re-blooming
  // (~T5.1, progress ~0.51), the two disciplines drift in from their sides —
  // tech a touch after design — settling as the bloom opens. The flower keeps
  // opening past the settle point to full bloom at the very bottom.
  const designOpacity = useTransform(scrollYProgress, [0.51, 0.67], [0, 1]);
  const designX = useTransform(scrollYProgress, [0.51, 0.74], [-40, 0]);
  const techOpacity = useTransform(scrollYProgress, [0.55, 0.71], [0, 1]);
  const techX = useTransform(scrollYProgress, [0.55, 0.78], [40, 0]);

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

  const choose = (side) => (e) => {
    e.preventDefault();
    onChoose(side);
  };

  return (
    <div className="cover">
      {/* starfield spans the whole cover as ambient connective tissue */}
      <canvas ref={particlesRef} className="cover-particles" aria-hidden="true" />

      <header className={`cover-nav${split ? " is-split" : ""}`}>
        <div className="cover-nav-left">
          {/* the monogram is the one home gesture, shared with every world:
              on the cover (already home) it lifts you back to the top. */}
          <button
            type="button"
            className="cover-mark"
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                  .matches
                  ? "auto"
                  : "smooth",
              })
            }
            aria-label="Mrinali Bhardwaj — back to top"
          >
            mb
          </button>
        </div>

        {/* THE MENU BAR, and it is the header's OWN child rather than part of
            the left group — that is what lets the grid centre it on the
            viewport instead of parking it next to the monogram.

            World links used to sit here and were deleted in July as "a
            redundant third path" — the Explore CTAs plus the dock were held to
            cover it. They didn't:
              · the CTAs reach design and tech only, and sit below the fold
              · the dock is HIDDEN on the cover until the scrub settles
                (App.jsx: visible={route === "" ? coverSettled : true})
              · gallery, notes and the game appear in no other navigation at all
            So until you scrolled, the cover offered a monogram, GitHub and an
            email address. This is the fix, and it is a MENU BAR rather than a
            website nav on purpose: a desktop has both a dock and a menu bar, so
            it belongs to the same fiction instead of arguing with it.

            It calls the same `onChoose` the CTAs and the dock do — App turns
            that into a hash change for any of the five, so there is no second
            navigation path here, just a second surface for the one that
            exists. */}
        <nav className="cover-menu" aria-label="Worlds">
          {WORLDS.map(([world, label]) => (
            <button
              key={world}
              type="button"
              className="cover-menu-item"
              onClick={() => onChoose(world)}
            >
              {label}
            </button>
          ))}
        </nav>

        {/* LinkedIn, not GitHub (5 Aug 2026, by request). The code still has a
            front door — the desktop `github` folder sits on the cover itself and
            the tech world's contact block links it — so this corner goes to the
            professional profile instead, which is the one a recruiter looks for
            first and the only one that was reachable nowhere on the cover. */}
        <div className="cover-social">
          <a
            className="cover-social-logo"
            href={LINKEDIN}
            target="_blank"
            rel="noreferrer"
            aria-label="LinkedIn"
          >
            <LinkedInMark size={18} aria-hidden="true" />
          </a>
          <a href={`mailto:${EMAIL}`} aria-label="Email">
            <Mail size={19} strokeWidth={1.75} />
          </a>
        </div>
      </header>

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

          {/* beat 1: the name, alone. Nothing renders until Ballet has loaded
              (no fallback-font flash); then the script writes itself on via a
              mask wipe (see .is-inked). The "a design engineer" caption that
              used to sit under it is gone — the two margin notes below now
              carry the roles, and they say it in far more detail. */}
          <motion.div
            ref={heroRef}
            className="cover-hero-inner"
            style={{ opacity: nameOpacity, y: nameLift }}
          >
            {/* Two scripts, split at the capitals: the M and B stay Ballet —
                its swashed capitals are the whole reason that face is here —
                while the lowercase runs are set in Pinyon Script, the same
                face as the monogram. Kept as separate spans rather than one
                string because the split is per-glyph-run, and the mask wipe
                on .is-inked still sweeps the h1 as a single box. */}
            <h1
              ref={nameRef}
              className={`cover-name-script${fontReady ? " is-inked" : ""}`}
            >
              <span className="cover-name-cap">M</span>
              <span className="cover-name-rest">rinali</span>{" "}
              <span className="cover-name-cap">B</span>
              <span className="cover-name-rest">hardwaj</span>
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

          {/* beat 3: the split — one identity diverging into two disciplines */}
          <div
            className="cover-split"
            style={{ pointerEvents: split ? "auto" : "none" }}
          >
            <motion.div
              className="cover-side cover-side--design"
              style={{ opacity: designOpacity, x: designX }}
            >
              <p className="cover-side-label">Design</p>
              <h2 className="cover-side-title">What blooms in sight</h2>
              <p className="cover-side-body">
                Design is how ideas breathe—through motion, typography, and
                interaction.
              </p>
              <a
                className="cover-side-cta"
                href="#/design"
                onClick={choose("design")}
              >
                Explore Design
                <ArrowUpRight size={15} strokeWidth={1.5} aria-hidden="true" />
              </a>
            </motion.div>

            <motion.div
              className="cover-side cover-side--tech"
              style={{ opacity: techOpacity, x: techX }}
            >
              <p className="cover-side-label">Tech</p>
              <h2 className="cover-side-title">What roots beneath</h2>
              <p className="cover-side-body">
                Engineering gives form to possibility—through systems,
                structure, and reason.
              </p>
              <a
                className="cover-side-cta"
                href="#/tech"
                onClick={choose("tech")}
              >
                Explore Tech
                <ArrowUpRight size={15} strokeWidth={1.5} aria-hidden="true" />
              </a>
            </motion.div>
          </div>

          {/* the screen's own files, arriving with the dock: this half of the
              cover is a desktop, and a desktop with a dock but nothing on it is
              a screenshot. Two résumés and GitHub, scattered into the corners
              the split text doesn't claim. */}
          <DesktopFiles visible={settled} />

          <motion.div
            className="cover-scroll"
            style={{ opacity: chevronOpacity, animationPlayState: chevronPlay }}
            aria-hidden="true"
          >
            <ChevronDown size={24} strokeWidth={2} />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
