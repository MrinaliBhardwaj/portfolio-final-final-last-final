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
import { createParticles } from "./particles.js";
import { createLotusScrubber } from "./lotus.js";

// vendored locally at build time; see public/lotus-bloom.mp4
const VIDEO_URL = "/lotus-bloom.mp4";

// The clip is scrubbed IN REVERSE (see the `reverse` option on the scrubber).
// The file's arc is: open → closes to a bud (~T5) → rotates and re-blooms
// (~T7) → fully open (~T10). Played backwards across the track that becomes:
// fully open at the top → folds closed (~progress 0.3) → the bud turns
// (0.3–0.5) → blooms back open toward the bottom. The arc spans the WHOLE
// track (0 → 1) so there's no frozen held frame at the end. Beat timings
// below still hold under reversal: the name is gone while the flower is
// closed; the split text reveals as it re-opens past progress ~0.5.
const SCRUB_END = 1;

const EASE = [0.22, 1, 0.36, 1];

export default function Cover({ onChoose, onSettledChange }) {
  const particlesRef = useRef(null);
  const trackRef = useRef(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const progressRef = useRef(0);
  const [split, setSplit] = useState(false);

  useEffect(() => {
    const p = createParticles(particlesRef.current);
    return () => p.destroy();
  }, []);

  // scroll progress across the tall track drives everything on the stage
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });
  useMotionValueEvent(scrollYProgress, "change", (v) => {
    progressRef.current = v;
    // the identity diverges as the re-bloom starts — brighten the nav labels
    setSplit(v > 0.5);
    // once the divergence scene has fully settled, the dock (owned by App,
    // where it persists across routes) surfaces
    onSettledChange?.(v > 0.77);
  });

  // beat 1: the name rises and is gone by the time the flower closes (~T5,
  // progress ~0.5 now that the bloom spans the whole track)
  const rise =
    typeof window !== "undefined" ? window.innerHeight * 0.55 : 440;
  const nameOpacity = useTransform(scrollYProgress, [0.06, 0.47], [1, 0]);
  const nameLift = useTransform(scrollYProgress, [0, 0.47], [0, -rise]);
  const chevronOpacity = useTransform(scrollYProgress, [0, 0.12], [1, 0]);

  // beat 3: ~0.5s after the name is gone, as the flower STARTS re-blooming
  // (~T5.1, progress ~0.51), the two disciplines drift in from their sides —
  // tech a touch after design — settling as the bloom opens. The flower keeps
  // opening past the settle point to full bloom at the very bottom.
  const designOpacity = useTransform(scrollYProgress, [0.51, 0.67], [0, 1]);
  const designX = useTransform(scrollYProgress, [0.51, 0.74], [-40, 0]);
  const techOpacity = useTransform(scrollYProgress, [0.55, 0.71], [0, 1]);
  const techX = useTransform(scrollYProgress, [0.55, 0.78], [40, 0]);

  // decode the clip to frames once, then paint the frame matching scroll
  // progress to the canvas (smooth at any scroll speed)
  useEffect(() => {
    const scrubber = createLotusScrubber(
      canvasRef.current,
      videoRef.current,
      () => Math.min(1, progressRef.current / SCRUB_END),
      VIDEO_URL,
      { reverse: true }
    );
    return () => scrubber.destroy();
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
          <span className="cover-mark" aria-label="Mrinali Bhardwaj">
            mb
          </span>
          <nav className="cover-links" aria-label="Worlds">
            <a
              className="cover-link cover-link--design"
              href="#/design"
              onClick={choose("design")}
            >
              design
            </a>
            <a
              className="cover-link cover-link--tech"
              href="#/tech"
              onClick={choose("tech")}
            >
              tech
            </a>
          </nav>
        </div>
        <div className="cover-social">
          {/* TODO: real GitHub profile URL */}
          <a
            className="cover-social-logo"
            href="#"
            aria-label="GitHub"
            onClick={(e) => e.preventDefault()}
          >
            <img
              src="https://cdn.simpleicons.org/github/ffffff"
              alt=""
              width="18"
              height="18"
            />
          </a>
          <a href="mailto:mrinalibhardwaj0705@gmail.com" aria-label="Email">
            <Mail size={19} strokeWidth={1.75} />
          </a>
        </div>
      </header>

      {/* one pinned stage carries the whole cover narrative */}
      <section className="cover-track" ref={trackRef} aria-label="Intro">
        <div className="cover-stage">
          <video
            ref={videoRef}
            className="cover-video"
            src={VIDEO_URL}
            muted
            playsInline
            preload="auto"
          />
          {/* frame-cache canvas fades in over the video once decoding is done */}
          <canvas
            ref={canvasRef}
            className="cover-video-canvas"
            aria-hidden="true"
          />
          <div className="cover-video-overlay" />

          {/* beat 1: the name */}
          <motion.div
            className="cover-hero-inner"
            style={{ opacity: nameOpacity, y: nameLift }}
          >
            <motion.h1
              className="cover-name-script"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1.2, ease: EASE, delay: 0.35 }}
            >
              Mrinali Bhardwaj
            </motion.h1>
          </motion.div>

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
            style={{ opacity: chevronOpacity }}
            aria-hidden="true"
          >
            <ChevronDown size={24} strokeWidth={2} />
          </motion.div>
        </div>
      </section>
    </div>
  );
}
