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
// Mail and GitHubMark are unused RIGHT NOW and deliberately kept: they belong
// to the nav that is temporarily pulled (see the note in the markup below), and
// leaving them here is what makes restoring it a markup-only change. Delete
// them only if the nav is being removed for good.
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

// The lotus's meaning, set as the reference poster sets its concept copy: one
// dense uppercase block, printed TWICE in the top corners — left-aligned left,
// right-aligned right — and masked so it dissolves toward the bottom. In the
// reference this tier is texture rather than reading matter; the fade is what
// says so.
//
// Rendered as one string, not lines: the plate is a narrow measure and the
// reference's blocks wrap naturally on their own rag. Hard line breaks here
// would fight the column instead of filling it.
const LOTUS_PLATE =
  "मृणाली [mṛṇālī; one who belongs to the lotus] " +
  "The Lotus is born in water, yet untouched by it. " +
  "It rises from mud, yet carries no stain. " +
  "Its roots drink from darkness, but its face only knows light. " +
  "Is that what grace looks like? " +
  "To know darkness intimately, and simply refusing to carry it " +
  "into your heart.";

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

      {/* NAV TEMPORARILY REMOVED — the monogram "back to top" button and the
          GitHub/Mail links used to sit here, and they occupied exactly the two
          top corners the lotus plates below now claim. Pulled so the reference
          layout can be judged on its own. Everything it needs to come back is
          intact: .cover-nav / .cover-mark / .cover-social still have their
          styles in cover.css, and the `split` state that tinted it is still
          computed. Restoring is re-adding this markup, nothing more.
          NOTE while it is out, the cover has no route to GitHub or email. */}

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
            className="cover-hero-inner"
            style={{ opacity: nameOpacity, y: nameLift }}
          >
            <h1 className={`cover-name-script${fontReady ? " is-inked" : ""}`}>
              Mrinali Bhardwaj
            </h1>
          </motion.div>

          {/* the lotus plates: the same block printed in both top corners,
              mirrored, fading out downward — the reference's concept-copy
              device. Only the left one is exposed to assistive tech; the right
              is the identical string, so reading it twice would be noise. */}
          <motion.aside
            className="cover-plate cover-plate--left"
            style={{ opacity: asideOpacity }}
          >
            {LOTUS_PLATE}
          </motion.aside>
          <motion.aside
            className="cover-plate cover-plate--right"
            style={{ opacity: asideOpacity }}
            aria-hidden="true"
          >
            {LOTUS_PLATE}
          </motion.aside>

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
