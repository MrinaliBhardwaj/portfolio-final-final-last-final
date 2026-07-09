// DESIGN — a pure product & visual design portfolio. Everything on this
// page speaks the design dialect (cream paper, blush, serif, handwriting);
// no engineering voice appears anywhere. Work first, personality last.
import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

// gentle, editorial reveal — the design side moves softly
const reveal = {
  initial: { opacity: 0, y: 18 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.8, ease: EASE },
};

const work = [
  {
    id: "ds-moon",
    date: "JAN 2025 – JUL 2025",
    type: "Internship",
    title: "Graphic Designer",
    org: "Moon Finance",
    rotate: 1,
  },
  {
    id: "ds-luma",
    date: "JUL 2025 – OCT 2025",
    type: "Freelance",
    title: "UI/UX Designer",
    org: "LUMA Technologies",
    rotate: -1.2,
  },
  {
    id: "ds-riviera",
    date: "FEB 2026",
    type: "Committee",
    title: "Design Coordinator",
    org: "Riviera'26 (Cultural Fest)",
    rotate: 0.8,
  },
  {
    id: "ds-ecell",
    date: "JAN 2024 – JAN 2025",
    type: "Leadership",
    title: "Design Executive",
    org: "Entrepreneurship Cell",
    rotate: -0.7,
  },
];

const skills = ["UI/UX Design", "User Research", "Wireframing", "Prototyping", "Design Systems", "Visual Design"];

const software = [
  { kind: "icon", src: "https://cdn.simpleicons.org/figma/1c1a17", alt: "Figma" },
  { kind: "text", label: "Ps", alt: "Adobe Photoshop" },
  { kind: "text", label: "Ai", alt: "Adobe Illustrator" },
  { kind: "text", label: "Ae", alt: "Adobe After Effects" },
];

export default function DesignSide() {
  return (
    <div className="ds">
      <header className="ds-top">
        <a className="ds-mark" href="#" aria-label="Back to cover">MB</a>
        <p className="ds-role">product &amp; visual design</p>
      </header>

      {/* ============ OPENING STATEMENT ============ */}
      <motion.section className="ds-section ds-statement" aria-label="Statement" {...reveal}>
        <h2>
          Design, until it feels<br />
          <em>inevitable.</em>
        </h2>
        <p className="ds-statement-hand" aria-hidden="true">— opened straight to the good part</p>
      </motion.section>

      {/* ============ SELECTED WORK ============ */}
      <motion.section className="ds-section" aria-label="Selected work" {...reveal}>
        <h2 className="ds-head">selected work</h2>
        <p className="ds-note">swap these cards for full case studies — process shots, decisions, outcomes.</p>
        <div className="ds-work-grid">
          {work.map((w, i) => (
            <motion.article
              className="ds-card"
              style={{ "--r": `${w.rotate}deg` }}
              key={w.id}
              id={w.id}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.7, ease: EASE, delay: i * 0.09 }}
            >
              <span className="ds-card-num" aria-hidden="true">{String(i + 1).padStart(2, "0")}</span>
              <span className="ds-card-tape" />
              <p className="ds-card-date">{w.date}</p>
              <p className="ds-card-type">{w.type}</p>
              <h3 className="ds-card-title">{w.title}</h3>
              <p className="ds-card-org">{w.org}</p>
              <p className="ds-card-placeholder">[ project visuals + process notes ]</p>
            </motion.article>
          ))}
        </div>
      </motion.section>

      <div className="ds-tear-divider" aria-hidden="true" />

      {/* ============ CAPABILITIES ============ */}
      <motion.section className="ds-section ds-cap" aria-label="Capabilities" {...reveal}>
        <div className="ds-cap-col">
          <h2 className="ds-head">capabilities</h2>
          <ul className="ds-skill-list">
            {skills.map((s) => (
              <li key={s}><span className="ds-arrow">↗</span>{s}</li>
            ))}
          </ul>
        </div>
        <div className="ds-cap-col">
          <h2 className="ds-head">tools</h2>
          <div className="ds-tiles">
            {software.map((s) =>
              s.kind === "icon" ? (
                <div className="ds-tile" key={s.alt} title={s.alt}>
                  <img src={s.src} alt={s.alt} width="24" height="24" />
                </div>
              ) : (
                <div className="ds-tile" key={s.alt} title={s.alt}>
                  <span>{s.label}</span>
                </div>
              )
            )}
          </div>
          <h2 className="ds-head ds-head--edu">credentials</h2>
          <p className="ds-edu-title">Google UX Design Certificate</p>
          <p className="ds-edu-sub">Coursera ('25)</p>
        </div>
      </motion.section>

      {/* ============ ABOUT — the personal closer ============ */}
      <motion.section className="ds-section ds-about" aria-label="About" {...reveal}>
        <div className="ds-polaroid">
          <div className="ds-polaroid-slot">[ a photo of you ]</div>
        </div>
        <div className="ds-about-copy">
          <h2 className="ds-head">a little history</h2>
          <p>
            It started at eleven, with a camera and an eye for what looked right.
            An audience of six hundred came before any formal training did —
            <em> the taste came first; the craft followed.</em>
          </p>
          <p className="ds-hand">still chasing the version of a screen that feels inevitable.</p>
        </div>
      </motion.section>

      {/* ============ CONTACT ============ */}
      <footer className="ds-foot">
        <a href="/resume-design.pdf" download>
          DESIGN RESUME <span aria-hidden="true">↓</span>
        </a>
        <a href="mailto:mrinalibhardwaj0705@gmail.com">
          LET&rsquo;S WORK TOGETHER <span aria-hidden="true">↗</span>
        </a>
      </footer>
    </div>
  );
}
