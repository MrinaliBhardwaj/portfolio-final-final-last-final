// DESIGN WORLD: gallery light. Off-white, ink, one vermilion accent, wide
// Archivo display type, slow soft motion. No mono type, no terminal dialect,
// nothing from the tech world leaks in here — the chrome around the page
// (tab strip, layers panel) speaks Figma instead, the way the tech world's
// chrome speaks VS Code.
import { motion } from "framer-motion";
import FigmaPanel from "./FigmaPanel.jsx";
import WorldTabs from "./WorldTabs.jsx";
import useSectionSpy from "./useSectionSpy.js";

const EASE = [0.22, 1, 0.36, 1];
const EMAIL = "mailto:mrinalibhardwaj0705@gmail.com";

const reveal = {
  initial: { opacity: 0, y: 26 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
  transition: { duration: 0.8, ease: EASE },
};

const work = [
  {
    id: "luma",
    org: "LUMA Technologies",
    role: "UI/UX Designer",
    meta: "Freelance · Jul - Oct 2025",
    blurb: "Interface and experience design, end to end.",
    size: "lg",
  },
  {
    id: "moon",
    org: "Moon Finance",
    role: "Graphic Designer",
    meta: "Internship · Jan - Jul 2025",
    blurb: "Brand and campaign graphics for a finance product.",
    size: "sm",
  },
  {
    id: "riviera",
    org: "Riviera'26",
    role: "Design Coordinator",
    meta: "Cultural fest · Feb 2026",
    blurb: "Design direction for VIT's cultural fest.",
    size: "sm",
  },
  {
    id: "ecell",
    org: "Entrepreneurship Cell",
    role: "Design Executive",
    meta: "Leadership · 2024 - 2025",
    blurb: "Design leadership across events and campaigns.",
    size: "lg",
  },
];

const capabilities = [
  "UI & UX design",
  "User research",
  "Wireframing",
  "Prototyping",
  "Design systems",
  "Visual design",
];

// the sections of this page, presented in the layers panel as Frames with
// their notable children — the design twin of the tech explorer's file map
const FRAMES = [
  {
    id: "dw-hero",
    name: "hero",
    children: [
      { icon: "text", name: "Design that lands" },
      { icon: "text", name: "intro" },
    ],
  },
  {
    id: "dw-work",
    name: "selected-work",
    children: [
      { icon: "image", name: "LUMA Technologies" },
      { icon: "image", name: "Moon Finance" },
      { icon: "image", name: "Riviera'26" },
      { icon: "image", name: "E-Cell" },
    ],
  },
  {
    id: "dw-what",
    name: "what-i-do",
    children: [
      { icon: "component", name: "capabilities" },
      { icon: "component", name: "tools" },
    ],
  },
  {
    id: "dw-about",
    name: "about",
    children: [
      { icon: "image", name: "portrait" },
      { icon: "text", name: "story" },
    ],
  },
  {
    id: "dw-contact",
    name: "contact",
    children: [{ icon: "text", name: "say-hello" }],
  },
];

const SECTION_IDS = FRAMES.map((f) => f.id);

export default function DesignWorld() {
  // scroll-spy + click-to-jump, shared with the tech world's explorer
  const [activeSection, selectFrame] = useSectionSpy(SECTION_IDS);

  return (
    <div className="dw">
      <div className="dw-grain" aria-hidden="true" />

      {/* the open-pages strip: this world and its sibling as Figma file tabs */}
      <WorldTabs world="design" />

      {/* the layers panel: this page's sections as Frames */}
      <FigmaPanel
        frames={FRAMES}
        activeId={activeSection}
        onSelect={selectFrame}
      />

      <div className="dw-content">
        <header className="dw-top">
          <a className="dw-mark" href="#" aria-label="Back to the start">
            MB
          </a>
          <a className="dw-hello" href={EMAIL}>
            Say hello
          </a>
        </header>

        {/* ============ statement hero ============ */}
        <section className="dw-hero" id="dw-hero" aria-label="Introduction">
          <motion.h1
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: EASE, delay: 0.1 }}
          >
            Design that <em>lands</em>
            <br />
            before the words do.
          </motion.h1>
          <motion.p
            className="dw-hero-sub"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.3 }}
          >
            Mrinali Bhardwaj. Product and visual design, from research to final
            pixel.
          </motion.p>
        </section>

        {/* ============ selected work ============ */}
        <section className="dw-section" id="dw-work" aria-label="Selected work">
          <motion.h2 className="dw-h2 display" {...reveal}>
            Selected work
          </motion.h2>
          <div className="dw-grid">
            {work.map((w, i) => (
              <motion.article
                className={`dw-card dw-card--${w.size}`}
                key={w.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.8, ease: EASE, delay: (i % 2) * 0.12 }}
              >
                <div className="dw-visual">
                  {/* TODO: replace with real case study visuals */}
                  <span>Case study visuals in progress</span>
                </div>
                <div className="dw-meta">
                  <div className="dw-meta-head">
                    <h3>{w.org}</h3>
                    <span className="dw-arrow" aria-hidden="true">
                      &rarr;
                    </span>
                  </div>
                  <p className="dw-role">{w.role}</p>
                  <p className="dw-blurb">{w.blurb}</p>
                  <p className="dw-date">{w.meta}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </section>

        {/* ============ capabilities ============ */}
        <section className="dw-section dw-cap" id="dw-what" aria-label="Capabilities">
          <div className="dw-cap-left">
            <motion.h2 className="dw-h2 display" {...reveal}>
              What I do
            </motion.h2>
            <ul className="dw-cap-list">
              {capabilities.map((c, i) => (
                <motion.li
                  key={c}
                  initial={{ opacity: 0, x: -18 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.6, ease: EASE, delay: i * 0.06 }}
                >
                  <span className="dw-cap-tick" aria-hidden="true" />
                  {c}
                </motion.li>
              ))}
            </ul>
          </div>
          <motion.div className="dw-cap-right" {...reveal}>
            <h3 className="dw-side-head">Tools</h3>
            <div className="dw-tools">
              <span className="dw-tool" title="Figma">
                <img
                  src="https://cdn.simpleicons.org/figma/1a1815"
                  alt="Figma"
                  width="22"
                  height="22"
                />
              </span>
              <span className="dw-tool" title="Adobe Photoshop">
                Ps
              </span>
              <span className="dw-tool" title="Adobe Illustrator">
                Ai
              </span>
              <span className="dw-tool" title="Adobe After Effects">
                Ae
              </span>
            </div>
            <h3 className="dw-side-head">Credential</h3>
            <p className="dw-cred">Google UX Design Certificate</p>
            <p className="dw-cred-sub">Coursera, 2025</p>
          </motion.div>
        </section>

        {/* ============ about ============ */}
        <section className="dw-section dw-about" id="dw-about" aria-label="About">
          <motion.div className="dw-portrait" {...reveal}>
            {/* TODO: replace with a real portrait */}
            <span>Portrait coming soon</span>
          </motion.div>
          <motion.div className="dw-about-copy" {...reveal}>
            <h2 className="dw-h2 display">About</h2>
            <p>
              It started at eleven, with a camera and an audience of six hundred
              before any formal training. The taste came first. The craft is
              what I keep sharpening.
            </p>
            <p>
              These days I study computer science at VIT and design like it is
              my job. Sometimes it is.
            </p>
          </motion.div>
        </section>

        {/* ============ contact ============ */}
        <footer className="dw-foot" id="dw-contact">
          <motion.a className="dw-foot-cta display" href={EMAIL} {...reveal}>
            Say hello <span aria-hidden="true">&rarr;</span>
          </motion.a>
          <div className="dw-foot-row">
            <a href="/resume-design.pdf" download>
              Design resume (PDF)
            </a>
            <a href="#">Back to the start</a>
          </div>
        </footer>
      </div>
    </div>
  );
}
