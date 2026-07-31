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
import { GitHubMark } from "./BrandIcons.jsx";
import TextMorph from "./TextMorph.jsx";
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
  // hold the name invisible until Ballet has actually loaded — its fallback
  // (Segoe Script) is close enough in metrics that font-display:swap flashed
  // the wrong script on every cold load. The timeout covers a hung font fetch.
  const [fontReady, setFontReady] = useState(false);
  const heroRef = useRef(null);
  const nameRef = useRef(null);

  useEffect(() => {
    let alive = true;
    document.fonts
      .load('400 1em "Ballet Variable"')
      .then(() => alive && setFontReady(true))
      .catch(() => alive && setFontReady(true));
    const t = setTimeout(() => alive && setFontReady(true), 2500);
    return () => {
      alive = false;
      clearTimeout(t);
    };
  }, []);

  // Pin the "a design engineer" caption under "rinali": CSS % anchors drift
  // with viewport size (the hero's fixed padding doesn't scale with the
  // script), so measure the ACTUAL rendered glyph run — chars 1–7 of the
  // name's text node — and drop the caption at its left edge, just below its
  // baseline. Re-measured on resize; exact at any dimension by construction.
  useEffect(() => {
    if (!fontReady) return;
    const hero = heroRef.current;
    const name = nameRef.current;
    if (!hero || !name || !name.firstChild) return;
    const place = () => {
      const range = document.createRange();
      range.setStart(name.firstChild, 1);
      range.setEnd(name.firstChild, 7); // "rinali"
      const g = range.getBoundingClientRect();
      const h = hero.getBoundingClientRect();
      // Vertical anchor is the BASELINE of rinali's line, not the glyph
      // run's ink bottom — Ballet's swash tails descend far below the
      // baseline, which pushed the caption under the viewport fold (the
      // stage clips overflow). Baseline = line-box top + half-leading +
      // ascent, with Ballet's font-box ratios (measured via canvas
      // TextMetrics: ascent 1.134em, descent 0.768em).
      const cs = getComputedStyle(name);
      const fs = parseFloat(cs.fontSize);
      const lh = parseFloat(cs.lineHeight);
      const halfLeading = (lh - (1.134 + 0.768) * fs) / 2;
      const nameBox = name.getBoundingClientRect();
      const baseline = nameBox.top + halfLeading + 1.134 * fs;
      hero.style.setProperty("--cap-x", `${g.left - h.left}px`);
      hero.style.setProperty("--cap-y", `${baseline - h.top + fs * 0.06}px`);
    };
    place();
    // Two re-measure paths, both needed:
    // - ResizeObserver fires after layout settles, catching the 719px
    //   media-query rewrap and any other reflow of the name's box.
    // - The resize listener's deferred second pass covers environments where
    //   RO callbacks (paint-coupled) are throttled, and the immediate call
    //   can race the media-query relayout.
    let tid = 0;
    const onResize = () => {
      place();
      clearTimeout(tid);
      tid = setTimeout(place, 120);
    };
    const ro = new ResizeObserver(place);
    ro.observe(name);
    ro.observe(hero);
    window.addEventListener("resize", onResize);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", onResize);
      clearTimeout(tid);
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
      // where it persists across routes) surfaces
      onSettledChange?.(nextSettled);
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
        // ease-out the scrub: the sequence's head is the clip's static "fully
        // open, holding" tail, so a linear map left the flower frozen for the
        // first stretch of scroll. Doubling the initial rate makes it start
        // folding the moment the scroll starts; endpoints unchanged.
        const r = Math.min(1, progressRef.current / SCRUB_END);
        return r * (2 - r);
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
              on the cover (already home) it lifts you back to the top. The
              world links that used to sit here were a third path into the
              disciplines — the Explore CTAs below and the dock already carry
              that, so they're gone. */}
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
        <div className="cover-social">
          <a
            className="cover-social-logo"
            href="https://github.com/MrinaliBhardwaj"
            target="_blank"
            rel="noreferrer"
            aria-label="GitHub"
          >
            <GitHubMark size={18} aria-hidden="true" />
          </a>
          <a href="mailto:mrinalibhardwaj0705@gmail.com" aria-label="Email">
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

          {/* beat 1: the name. Nothing renders until Ballet has loaded (no
              fallback-font flash); then the script writes itself on via a
              mask wipe (see .is-inked) and the eyebrow settles in above it. */}
          <motion.div
            className="cover-hero-inner"
            ref={heroRef}
            style={{ opacity: nameOpacity, y: nameLift }}
          >
            {/* "a design engineer" — small Helvetica oblique caption pinned
                just below the name, under "rinali" at the edge of the M. Its
                position (--cap-x/--cap-y) is measured off the real glyphs in
                the effect above, so it holds at any dimension. */}
            <motion.p
              className="cover-eyebrow-arc"
              initial={{ opacity: 0 }}
              animate={fontReady ? { opacity: 1 } : {}}
              transition={{ duration: 0.9, ease: EASE, delay: 1.3 }}
            >
              a design engineer
            </motion.p>
            <h1
              ref={nameRef}
              className={`cover-name-script${fontReady ? " is-inked" : ""}`}
            >
              Mrinali Bhardwaj
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
              <span className="cover-aside-rule" />
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
              <span className="cover-aside-rule" />
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
