// ENGINEERING — a pure technical portfolio. Lab-notebook dialect: grid
// paper, graphite + muted blue, monospace. No handwriting, no blush, no
// hand-drawn art anywhere on this page. Projects first.
//
// Placeholder project entries are marked `placeholder: true` — replace them
// with real repos (name, one-liner, stack, links) as they ship.
import { motion } from "framer-motion";

const EASE = [0.22, 1, 0.36, 1];

// snappy, technical reveal — the engineering side moves faster than design
const reveal = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.45, ease: EASE },
};

const projects = [
  {
    id: "es-proj-portfolio",
    path: "~/projects/mri-portfolio",
    name: "mri-portfolio",
    blurb: "This site. Hand-rolled portfolio engine — custom hash router, route transitions, scroll-triggered reveals, zero UI libraries.",
    stack: ["React 18", "Vite", "Framer Motion", "CSS"],
    repo: "#",
    demo: "/",
  },
  {
    id: "es-proj-2",
    placeholder: true,
    path: "~/projects/…",
    name: "[ project_two ]",
    blurb: "One line: what it does, for whom, and the hard part you solved.",
    stack: ["stack", "goes", "here"],
  },
  {
    id: "es-proj-3",
    placeholder: true,
    path: "~/projects/…",
    name: "[ project_three ]",
    blurb: "Ship it, then describe it. Numbers beat adjectives.",
    stack: ["stack", "goes", "here"],
  },
];

const experience = [
  {
    id: "es-exp-nextg",
    date: "JUN 2026 – JUL 2026",
    title: "Design Engineer (Freelance)",
    org: "NextG Apex",
    note: "// add scope: what you built, stack, what shipped",
  },
];

const skills = [
  { group: "Languages", items: ["JavaScript (ES6+)", "HTML", "CSS"] },
  { group: "Frameworks & Libraries", items: ["React.js", "Tailwind CSS", "Framer Motion", "GSAP"] },
  { group: "Tools & Practice", items: ["Git & GitHub", "Vite", "VS Code", "Responsive Design"] },
];

const NAV = [
  { id: "es-projects", label: "projects" },
  { id: "es-experience", label: "experience" },
  { id: "es-skills", label: "skills" },
  { id: "es-education", label: "education" },
  { id: "es-contact", label: "contact" },
];

export default function EngineeringSide({ onNav }) {
  return (
    <div className="es">
      <header className="es-top">
        <a className="es-mark" href="#" aria-label="Back to cover">mb</a>
        <nav className="es-nav" aria-label="Sections">
          {NAV.map((n) => (
            <button key={n.id} type="button" onClick={() => onNav(n.id)}>
              {n.label}
            </button>
          ))}
        </nav>
      </header>

      <section className="es-intro">
        <h2>mrinali bhardwaj</h2>
        <p className="es-intro-line">software &middot; systems &middot; front-of-the-frontend</p>
        <p className="es-intro-sub">computer science undergrad at VIT ('27). I build for the web and ship what I build.</p>

        <div className="es-term" aria-hidden="true">
          <div className="es-term-bar"><span /><span /><span /></div>
          <pre className="es-term-body">
<span className="es-term-prompt">$</span> whoami{"\n"}mrinali — builds interfaces, reads error messages calmly{"\n"}
<span className="es-term-prompt">$</span> ls ./now{"\n"}learning/  shipping/  vit-cse-2027.md<span className="es-cursor" />
          </pre>
        </div>
      </section>

      {/* ============ PROJECTS ============ */}
      <motion.section className="es-section" id="es-projects" aria-label="Projects" {...reveal}>
        <h2 className="es-head">projects</h2>
        <div className="es-proj-grid">
          {projects.map((p, i) => (
            <motion.article
              className={`es-proj${p.placeholder ? " es-proj--placeholder" : ""}`}
              key={p.id}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.4, ease: EASE, delay: i * 0.05 }}
            >
              <p className="es-proj-path">{p.path}</p>
              <h3 className="es-proj-name">{p.name}</h3>
              <p className="es-proj-blurb">{p.blurb}</p>
              <ul className="es-chips">
                {p.stack.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
              <div className="es-proj-links">
                {p.repo ? <a href={p.repo}>repo &rarr;</a> : <span className="es-mut">repo —</span>}
                {p.demo ? <a href={p.demo}>live &rarr;</a> : <span className="es-mut">live —</span>}
              </div>
            </motion.article>
          ))}
        </div>
      </motion.section>

      {/* ============ EXPERIENCE ============ */}
      <motion.section className="es-section" id="es-experience" aria-label="Experience" {...reveal}>
        <h2 className="es-head">experience</h2>
        {experience.map((e) => (
          <div className="es-exp" key={e.id}>
            <p className="es-exp-date">{e.date}</p>
            <div>
              <h3 className="es-exp-title">{e.title}</h3>
              <p className="es-exp-org">{e.org}</p>
              <p className="es-exp-note">{e.note}</p>
            </div>
          </div>
        ))}
      </motion.section>

      {/* ============ SKILLS ============ */}
      <motion.section className="es-section" id="es-skills" aria-label="Skills" {...reveal}>
        <h2 className="es-head">skills</h2>
        <div className="es-skill-grid">
          {skills.map((g) => (
            <div key={g.group}>
              <h3 className="es-skill-group">{g.group}</h3>
              <ul className="es-chips">
                {g.items.map((s) => (
                  <li key={s}>{s}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </motion.section>

      {/* ============ EDUCATION ============ */}
      <motion.section className="es-section" id="es-education" aria-label="Education" {...reveal}>
        <h2 className="es-head">education</h2>
        <div className="es-edu">
          <h3>B.Tech, Computer Science and Engineering</h3>
          <p>Vellore Institute of Technology &middot; 2023 &ndash; 2027</p>
        </div>
      </motion.section>

      {/* ============ CONTACT ============ */}
      <footer className="es-foot" id="es-contact">
        <p className="es-status">// status: open to work</p>
        <div className="es-foot-links">
          <a href="/resume-engineering.pdf" download>resume.pdf &darr;</a>
          <a href="mailto:mrinalibhardwaj0705@gmail.com">mrinalibhardwaj0705@gmail.com</a>
          <a href="#">github &rarr;</a>
        </div>
      </footer>
    </div>
  );
}
