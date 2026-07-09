// TECH WORLD: phosphor dark. Green-black, JetBrains Mono, hairline modules,
// fast snappy motion. The wide Archivo display type is the only thread shared
// with the design world: one identity, different reality.
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import FileTree from "./FileTree.jsx";

const EASE = [0.22, 1, 0.36, 1];
const EMAIL = "mrinalibhardwaj0705@gmail.com";

// the explorer sidebar is the page's navigation: each file maps to a real
// section id already used by the header nav (plus "intro", newly given one
// below so the sidebar can reach it too)
const FILE_TREE = [
  {
    name: "portfolio",
    type: "folder",
    children: [
      { name: "about.tsx", type: "file", extension: "tsx", sectionId: "tw-intro" },
      { name: "projects.tsx", type: "file", extension: "tsx", sectionId: "tw-projects" },
      { name: "stack.ts", type: "file", extension: "ts", sectionId: "tw-stack" },
      { name: "log.md", type: "file", extension: "md", sectionId: "tw-log" },
      { name: "contact.tsx", type: "file", extension: "tsx", sectionId: "tw-contact" },
    ],
  },
];

const SECTION_IDS = FILE_TREE[0].children.map((f) => f.sectionId);

const reveal = {
  initial: { opacity: 0, y: 12 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.35, ease: EASE },
};

const stack = [
  { group: "languages", items: ["JavaScript (ES6+)", "HTML", "CSS"] },
  {
    group: "frameworks",
    items: ["React", "Tailwind CSS", "Framer Motion", "GSAP"],
  },
  { group: "tools", items: ["Git & GitHub", "Vite", "VS Code"] },
];

const log = [
  {
    id: "nextg",
    date: "Jun - Jul 2026",
    what: "Design engineer (freelance), NextG Apex",
    note: "Scope notes land here once written.",
  },
  {
    id: "vit",
    date: "2023 - 2027",
    what: "B.Tech, Computer Science and Engineering, VIT",
    note: "Vellore Institute of Technology, class of 2027.",
  },
];

const NAV = [
  { id: "tw-projects", label: "projects" },
  { id: "tw-stack", label: "stack" },
  { id: "tw-log", label: "log" },
  { id: "tw-contact", label: "contact" },
];

function jumpTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

export default function TechWorld() {
  const [activeSection, setActiveSection] = useState(SECTION_IDS[0]);
  // while a click-triggered smooth-scroll is in flight, scroll-spy defers to
  // the section the user actually chose — see the note below on why.
  const jumpingRef = useRef(false);
  const jumpTimeoutRef = useRef(null);

  // scroll-spy: the explorer highlights whichever section is currently in
  // view, the same way VS Code highlights the open file. The active section
  // is whichever one's top has most recently crossed a line near the top of
  // the viewport (the classic scrollspy approach), with the last section
  // pinned once the page is scrolled to the very bottom — this page is short
  // enough that the final section can sit fully visible without ever
  // reaching that line.
  useEffect(() => {
    const els = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      Boolean
    );
    let raf = null;

    const update = () => {
      raf = null;
      if (jumpingRef.current) return;

      const line = window.innerHeight * 0.3;
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;

      let current = els[0]?.id;
      for (const el of els) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
      }
      // only the bottom-pin can promote a section past what the line found —
      // never demote one the line already confirmed (e.g. a page short
      // enough that several sections sit stacked above the fold at once)
      if (atBottom) current = SECTION_IDS[SECTION_IDS.length - 1];
      if (current) setActiveSection(current);
    };

    const onScroll = () => {
      if (raf === null) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // a clicked file becomes active immediately and holds until its jump's
  // smooth-scroll settles — on a page this short, several sections can end
  // up simultaneously visible at max scroll, so scroll position alone can't
  // always tell which one the user meant
  const selectFile = (id) => {
    setActiveSection(id);
    jumpingRef.current = true;
    if (jumpTimeoutRef.current) clearTimeout(jumpTimeoutRef.current);
    jumpTo(id);

    const release = () => {
      jumpingRef.current = false;
    };
    if ("onscrollend" in window) {
      window.addEventListener("scrollend", release, { once: true });
    } else {
      jumpTimeoutRef.current = setTimeout(release, 900);
    }
  };

  return (
    <div className="tw">
      <div className="tw-scan" aria-hidden="true" />

      <FileTree
        className="tw-sidebar"
        data={FILE_TREE}
        onSelectFile={selectFile}
        activeId={activeSection}
      />

      <div className="tw-content">
        <header className="tw-top">
          <a className="tw-mark display" href="#" aria-label="Back to the start">
            MB
          </a>
          <nav className="tw-nav" aria-label="Sections">
            {NAV.map((n) => (
              <button key={n.id} type="button" onClick={() => selectFile(n.id)}>
                {n.label}
              </button>
            ))}
          </nav>
        </header>

        {/* ============ intro ============ */}
        <section className="tw-intro" id="tw-intro" aria-label="Introduction">
          <motion.p className="tw-path" {...reveal}>
            ~/mrinali
          </motion.p>
          <motion.h1
            className="tw-name display"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, ease: EASE, delay: 0.05 }}
          >
            Mrinali Bhardwaj
          </motion.h1>
          <motion.p
            className="tw-role"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: EASE, delay: 0.15 }}
          >
            Frontend engineer. CSE undergrad at VIT, class of 2027.
          </motion.p>
          <motion.p
            className="tw-status"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.35, ease: EASE, delay: 0.3 }}
          >
            <span className="tw-dot" aria-hidden="true" />
            open to internships
            <span className="tw-cursor" aria-hidden="true" />
          </motion.p>
        </section>

        {/* ============ projects ============ */}
        <motion.section
          className="tw-section"
          id="tw-projects"
          aria-label="Projects"
          {...reveal}
        >
          <h2 className="tw-h2">
            <span aria-hidden="true">//</span> projects
          </h2>

          <article className="tw-module">
            <p className="tw-mod-path">~/projects/portfolio</p>
            <h3 className="tw-mod-name">this website</h3>
            <p className="tw-mod-blurb">
              Hash router, scroll-scrubbed canvas scene, and route transitions,
              written from scratch. No UI libraries.
            </p>
            <ul className="tw-chips">
              {["React 18", "Vite", "Framer Motion", "Canvas 2D"].map((s) => (
                <li key={s}>{s}</li>
              ))}
            </ul>
            <div className="tw-mod-links">
              {/* TODO: add the real repo URL */}
              <a href="#" onClick={(e) => e.preventDefault()}>
                repo <span aria-hidden="true">&rarr;</span>
              </a>
              <a href="/">
                live <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </article>

          <div className="tw-module tw-module--todo">
            <p className="tw-mod-path">~/projects/next</p>
            <p className="tw-mod-blurb">
              Two more builds are in progress. They get listed here when they
              ship.
            </p>
          </div>
        </motion.section>

        {/* ============ stack ============ */}
        <motion.section
          className="tw-section"
          id="tw-stack"
          aria-label="Stack"
          {...reveal}
        >
          <h2 className="tw-h2">
            <span aria-hidden="true">//</span> stack
          </h2>
          <div className="tw-stack-grid">
            {stack.map((g) => (
              <div key={g.group}>
                <h3 className="tw-group">{g.group}</h3>
                <ul className="tw-chips">
                  {g.items.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ============ log ============ */}
        <motion.section
          className="tw-section"
          id="tw-log"
          aria-label="Experience and education"
          {...reveal}
        >
          <h2 className="tw-h2">
            <span aria-hidden="true">//</span> log
          </h2>
          <div className="tw-log">
            {log.map((e) => (
              <div className="tw-log-row" key={e.id}>
                <p className="tw-log-date">{e.date}</p>
                <div>
                  <h3 className="tw-log-what">{e.what}</h3>
                  <p className="tw-log-note">{e.note}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ============ contact ============ */}
        <motion.footer
          className="tw-section tw-foot"
          id="tw-contact"
          {...reveal}
        >
          <h2 className="tw-h2">
            <span aria-hidden="true">//</span> contact
          </h2>
          <a className="tw-mail" href={`mailto:${EMAIL}`}>
            {EMAIL}
          </a>
          <div className="tw-foot-row">
            <a href="/resume-engineering.pdf" download>
              resume.pdf <span aria-hidden="true">&darr;</span>
            </a>
            {/* TODO: add the real GitHub profile URL */}
            <a href="#" onClick={(e) => e.preventDefault()}>
              github <span aria-hidden="true">&rarr;</span>
            </a>
            <a href="#">back to the start</a>
          </div>
        </motion.footer>
      </div>
    </div>
  );
}
