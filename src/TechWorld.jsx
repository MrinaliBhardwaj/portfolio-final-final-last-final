// TECH WORLD: the portfolio as an open VS Code buffer. The page IS the
// editor — activity bar, explorer, breadcrumbs, a continuous line-number
// gutter, Dark+ syntax colours, and the blue status bar with a live Ln
// readout synced to scroll. Content reads as code: the intro is a README,
// experience and projects are typed objects, skills are JSON, contact is a
// .env. JetBrains Mono is the editor face; Inter carries the UI chrome.
import { Fragment, useEffect, useState } from "react";
import {
  ChevronRight,
  Files,
  GitBranch,
  Package,
  Search,
  Settings,
  Bug,
} from "lucide-react";
import FileTree from "./FileTree.jsx";
import WorldTabs from "./WorldTabs.jsx";
import useSectionSpy from "./useSectionSpy.js";

const EMAIL = "mrinalibhardwaj0705@gmail.com";
const GITHUB = "https://github.com/MrinaliBhardwaj";
const LINKEDIN = "https://www.linkedin.com/in/mrinali-bhardwaj-a340a3322/";

// the explorer maps files to sections of the buffer
const FILE_TREE = [
  {
    name: "portfolio",
    type: "folder",
    children: [
      { name: "README.md", type: "file", extension: "md", sectionId: "tw-about" },
      { name: "experience.ts", type: "file", extension: "ts", sectionId: "tw-exp" },
      { name: "projects.ts", type: "file", extension: "ts", sectionId: "tw-projects" },
      { name: "skills.json", type: "file", extension: "json", sectionId: "tw-skills" },
      { name: "education.md", type: "file", extension: "md", sectionId: "tw-edu" },
      { name: ".env", type: "file", sectionId: "tw-contact" },
    ],
  },
];

const SECTION_IDS = FILE_TREE[0].children.map((f) => f.sectionId);

const FILE_OF = {
  "tw-about": "README.md",
  "tw-exp": "experience.ts",
  "tw-projects": "projects.ts",
  "tw-skills": "skills.json",
  "tw-edu": "education.md",
  "tw-contact": ".env",
};

const NAV = [
  { id: "tw-about", label: "about" },
  { id: "tw-exp", label: "experience" },
  { id: "tw-projects", label: "projects" },
  { id: "tw-skills", label: "skills" },
  { id: "tw-contact", label: "contact" },
];

/* ---- editor primitives ---- */

// one soft-wrapped editor line: fixed gutter number, content indents in ch
function Ln({ ind = 0, blank = false, children }) {
  return (
    <div className="ln">
      <span
        className="ln-c"
        style={ind ? { paddingLeft: `${ind * 1.6}ch` } : undefined}
      >
        {blank ? " " : children}
      </span>
    </div>
  );
}

/* Dark+ tokens */
const K = (p) => <span className="tk-k" {...p} />; // keyword
const V = (p) => <span className="tk-v" {...p} />; // property / variable
const S = (p) => <span className="tk-s" {...p} />; // string
const P = (p) => <span className="tk-p" {...p} />; // punctuation
const C = (p) => <span className="tk-c" {...p} />; // comment
const F = (p) => <span className="tk-f" {...p} />; // function
const M = (p) => <span className="tk-m" {...p} />; // markdown heading

// a file boundary inside the buffer
function FileBreak({ name }) {
  return (
    <>
      <Ln blank />
      <Ln>
        <C>{"// ─── "}{name}{" ─────────────────────────────"}</C>
      </Ln>
      <Ln blank />
    </>
  );
}

/* ---- resume data ---- */

const experience = [
  {
    role: "Software Development Intern",
    org: "LTIMindtree — BPCL client project",
    when: "May – Jul 2026",
    work: [
      "YOLOv8 hazard & PPE detection over live CCTV feeds — 91% mAP@0.5",
      "curated + annotated 12,000+ frames across 25+ viewpoints; augmentation lifted small-object recall 14%",
      "multi-stream RTSP inference at 20+ FPS — manual monitoring effort down ~60%",
    ],
  },
  {
    role: "Frontend Developer",
    org: "NextG — retail-tech (phygital engine)",
    when: "Jun 2026",
    work: [
      "scroll-driven WebGL brand experience for an engine coordinating 500K+ outlets — cursor-reactive particle lattice, dependency-free vanilla JS",
      "owned creative direction through implementation: end-to-end landing prototypes in React, TypeScript, WebGL",
    ],
  },
  {
    role: "Project Intern",
    org: "Globally GI — computer vision & data",
    when: "Jan – Apr 2026",
    work: [
      "CVAT dataset expansion + annotation pipeline growing labeled data 3×; food-recognition model accuracy +9% over baseline",
    ],
  },
  {
    role: "Software Development Intern",
    org: "DIOnce Technology",
    when: "May – Jul 2025",
    work: [
      "full-stack Django apps — auth, order management, secure payments — serving live users; tested, documented PRs to an open-source text-analysis tool",
    ],
  },
];

const projects = [
  {
    key: "regis",
    what: "AI-assisted compliance platform for Indian NBFCs",
    stack: ["FastAPI", "PostgreSQL", "Next.js", "TypeScript"],
    proof: [
      "34 REST endpoints · 9 modules · 27 tables · multi-tenant isolation · maker-checker approvals",
      "5 rule engines over 106 obligation templates across 29 Indian laws — 367+ dated obligations from one profile in <2s",
      "137 automated tests at 84% coverage on CI · 98.4% AI evidence-classification",
    ],
    repo: "github.com/MrinaliBhardwaj/compliance-checker",
  },
  {
    key: "lexa",
    what: "large-document intelligence (RAG) for 500–1,000-page PDFs",
    stack: ["FastAPI", "PostgreSQL", "vector search", "Anthropic / OpenAI"],
    proof: [
      "citation-grounded Q&A, clause & risk extraction, semantic version diffs",
      "strict static typing — zero errors across 54 modules · 82% coverage · CI gate on every commit",
    ],
    repo: "github.com/MrinaliBhardwaj/Lotus",
  },
  {
    key: "publicPulse",
    what: "civic-issue reporting platform, cross-platform",
    stack: ["React Native (Expo)", "Express", "PostgreSQL", "LangGraph"],
    proof: [
      "camera-first capture, feeds, voting on Firebase auth + S3 media",
      "LangChain/LangGraph agent pipeline for AI triage of citizen reports · SIH national finalist",
    ],
    repo: "github.com/MrinaliBhardwaj/public-pulse",
  },
];

const skills = [
  ["languages", ["Python", "TypeScript", "JavaScript", "Java", "SQL", "R"]],
  ["backend", ["FastAPI", "Django", "Express", "PostgreSQL", "REST APIs"]],
  ["frontend", ["Next.js", "React", "React Native", "Tailwind", "WebGL"]],
  ["ai_ml", ["PyTorch", "OpenCV", "YOLOv8", "LangChain", "LangGraph", "RAG"]],
  ["tools", ["Git", "GitHub Actions", "Docker", "AWS", "CVAT", "Power BI"]],
];

export default function TechWorld() {
  const [activeSection, selectFile] = useSectionSpy(SECTION_IDS);
  const [line, setLine] = useState(1);

  // status bar Ln = the buffer line the active section starts on
  useEffect(() => {
    const sec = document.getElementById(activeSection);
    const first = sec?.querySelector(".ln");
    if (!first) return;
    const all = [...document.querySelectorAll(".tw-editor .ln")];
    setLine(all.indexOf(first) + 1);
  }, [activeSection]);

  return (
    <div className="tw">
      {/* activity bar — pure chrome, like the app's left rail */}
      <div className="tw-activity" aria-hidden="true">
        <span className="tw-act is-on"><Files size={20} strokeWidth={1.5} /></span>
        <span className="tw-act"><Search size={20} strokeWidth={1.5} /></span>
        <span className="tw-act"><GitBranch size={20} strokeWidth={1.5} /></span>
        <span className="tw-act"><Bug size={20} strokeWidth={1.5} /></span>
        <span className="tw-act"><Package size={20} strokeWidth={1.5} /></span>
        <span className="tw-act tw-act--end"><Settings size={20} strokeWidth={1.5} /></span>
      </div>

      <FileTree
        className="tw-sidebar"
        data={FILE_TREE}
        onSelectFile={selectFile}
        activeId={activeSection}
      />

      <div className="tw-content">
        <WorldTabs world="tech" />

        {/* breadcrumbs, tracking the section under the cursor */}
        <div className="tw-crumbs" aria-hidden="true">
          <span>portfolio</span>
          <ChevronRight size={11} strokeWidth={2} />
          <span>src</span>
          <ChevronRight size={11} strokeWidth={2} />
          <span className="tw-crumb-file">{FILE_OF[activeSection]}</span>
        </div>

        {/* mobile header: mark + section nav (the chrome above is desktop) */}
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

        {/* ============ the buffer ============ */}
        <div className="tw-editor">
          {/* ---- README.md ---- */}
          <section id="tw-about" className="ed-sec" aria-label="About">
            <Ln>
              <M># Mrinali Bhardwaj</M>
            </Ln>
            <Ln blank />
            <Ln>
              Software engineer — <strong>full-stack + applied AI</strong>.
            </Ln>
            <Ln>
              B.Tech CSE @ VIT · CGPA <span className="tk-n">8.34</span> ·
              class of <span className="tk-n">2027</span>.
            </Ln>
            <Ln>
              Now: SDE intern @ LTIMindtree, computer vision for BPCL.
            </Ln>
            <Ln blank />
            <Ln>
              <strong>Open to internships.</strong>
            </Ln>
            <Ln blank />
            <Ln>
              <K>import</K> <P>{"{ "}</P>
              <V>craft</V>
              <P>{" }"}</P> <K>from</K>{" "}
              <a className="tk-s ln-link" href="#/design">
                "../design"
              </a>
              <P>;</P> <C>{"// the other half of this portfolio"}</C>
            </Ln>
          </section>

          {/* ---- experience.ts ---- */}
          <section id="tw-exp" className="ed-sec" aria-label="Experience">
            <FileBreak name="experience.ts" />
            <Ln>
              <K>export const</K> <V>experience</V> <P>= [</P>
            </Ln>
            {experience.map((e) => (
              <Fragment key={e.org}>
                <Ln ind={1}>
                  <P>{"{"}</P>
                </Ln>
                <Ln ind={2}>
                  <V>role</V>
                  <P>: </P>
                  <S>"{e.role}"</S>
                  <P>,</P>
                </Ln>
                <Ln ind={2}>
                  <V>org</V>
                  <P>: </P>
                  <S>"{e.org}"</S>
                  <P>,</P>
                </Ln>
                <Ln ind={2}>
                  <V>when</V>
                  <P>: </P>
                  <S>"{e.when}"</S>
                  <P>,</P>
                </Ln>
                <Ln ind={2}>
                  <V>work</V>
                  <P>: [</P>
                </Ln>
                {e.work.map((w) => (
                  <Ln ind={3} key={w.slice(0, 20)}>
                    <S>"{w}"</S>
                    <P>,</P>
                  </Ln>
                ))}
                <Ln ind={2}>
                  <P>],</P>
                </Ln>
                <Ln ind={1}>
                  <P>{"},"}</P>
                </Ln>
              </Fragment>
            ))}
            <Ln>
              <P>];</P>
            </Ln>
          </section>

          {/* ---- projects.ts ---- */}
          <section id="tw-projects" className="ed-sec" aria-label="Projects">
            <FileBreak name="projects.ts" />
            <Ln>
              <K>export const</K> <V>projects</V> <P>= {"{"}</P>
            </Ln>
            {projects.map((pr) => (
              <Fragment key={pr.key}>
                <Ln ind={1}>
                  <F>{pr.key}</F>
                  <P>: {"{"}</P>
                </Ln>
                <Ln ind={2}>
                  <V>what</V>
                  <P>: </P>
                  <S>"{pr.what}"</S>
                  <P>,</P>
                </Ln>
                <Ln ind={2}>
                  <V>stack</V>
                  <P>: [</P>
                  {pr.stack.map((s, i) => (
                    <Fragment key={s}>
                      <span className="tk-t">"{s}"</span>
                      {i < pr.stack.length - 1 && <P>, </P>}
                    </Fragment>
                  ))}
                  <P>],</P>
                </Ln>
                {pr.proof.map((line2) => (
                  <Ln ind={2} key={line2.slice(0, 20)}>
                    <C>{"// "}{line2}</C>
                  </Ln>
                ))}
                <Ln ind={2}>
                  <V>repo</V>
                  <P>: </P>
                  <a
                    className="tk-s ln-link"
                    href={`https://${pr.repo}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    "{pr.repo}"
                  </a>
                  <P>,</P>
                </Ln>
                <Ln ind={1}>
                  <P>{"},"}</P>
                </Ln>
              </Fragment>
            ))}
            <Ln>
              <P>{"};"}</P>
            </Ln>
          </section>

          {/* ---- skills.json ---- */}
          <section id="tw-skills" className="ed-sec" aria-label="Skills">
            <FileBreak name="skills.json" />
            <Ln>
              <P>{"{"}</P>
            </Ln>
            {skills.map(([group, items], gi) => (
              <Ln ind={1} key={group}>
                <V>"{group}"</V>
                <P>: [</P>
                {items.map((it, i) => (
                  <Fragment key={it}>
                    <S>"{it}"</S>
                    {i < items.length - 1 && <P>, </P>}
                  </Fragment>
                ))}
                <P>]{gi < skills.length - 1 ? "," : ""}</P>
              </Ln>
            ))}
            <Ln>
              <P>{"}"}</P>
            </Ln>
          </section>

          {/* ---- education.md ---- */}
          <section id="tw-edu" className="ed-sec" aria-label="Education">
            <FileBreak name="education.md" />
            <Ln>
              <M># Education</M>
            </Ln>
            <Ln blank />
            <Ln>
              Vellore Institute of Technology — B.Tech CSE, CGPA{" "}
              <span className="tk-n">8.34</span> (2023 – 2027)
            </Ln>
            <Ln>
              <C>{"// before that: Class XII 73.2% · Class X 93.6%"}</C>
            </Ln>
          </section>

          {/* ---- .env ---- */}
          <section id="tw-contact" className="ed-sec" aria-label="Contact">
            <FileBreak name=".env" />
            <Ln>
              <C># reach me</C>
            </Ln>
            <Ln>
              <V>EMAIL</V>
              <P>=</P>
              <a className="ln-link tk-s" href={`mailto:${EMAIL}`}>
                {EMAIL}
              </a>
            </Ln>
            <Ln>
              <V>GITHUB</V>
              <P>=</P>
              <a className="ln-link tk-s" href={GITHUB} target="_blank" rel="noreferrer">
                github.com/MrinaliBhardwaj
              </a>
            </Ln>
            <Ln>
              <V>LINKEDIN</V>
              <P>=</P>
              <a className="ln-link tk-s" href={LINKEDIN} target="_blank" rel="noreferrer">
                linkedin.com/in/mrinali-bhardwaj-a340a3322
              </a>
            </Ln>
            <Ln>
              <V>RESUME</V>
              <P>=</P>
              <a className="ln-link tk-s" href="/resume-tech.pdf" download>
                /resume-tech.pdf
              </a>
            </Ln>
            <Ln>
              <V>STATUS</V>
              <P>=</P>
              <S>open_to_internships</S>
            </Ln>
            <Ln blank />
            <Ln>
              <a className="ln-link tk-c" href="#">
                {"// back to the start"}
              </a>
            </Ln>
          </section>
        </div>
      </div>

      {/* the status bar */}
      <footer className="tw-status" aria-label="Editor status">
        <div className="tw-status-l">
          <span className="tw-st">
            <GitBranch size={12} strokeWidth={2} aria-hidden="true" /> main*
          </span>
        </div>
        <div className="tw-status-r">
          <span className="tw-st">Ln {line}, Col 1</span>
          <span className="tw-st tw-st--desk">UTF-8</span>
          <span className="tw-st tw-st--desk">TypeScript</span>
          <span className="tw-st tw-st--desk">Prettier ✓</span>
        </div>
      </footer>
    </div>
  );
}
