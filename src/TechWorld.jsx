// TECH WORLD: the portfolio as an open VS Code editor — rendered the way the
// IDE itself renders things people actually need to read. Raw code is hard to
// scan, so the page uses VS Code's own reading aids as its type system: the
// README is a Markdown *preview*, every entry gets a proportional CodeLens
// headline (sticky, like sticky scroll), impact metrics render as inlay-hint
// pills (the page's one gold accent), deep detail sits behind real code
// folds, and syntax ceremony is lowlighted so content carries the contrast.
import { Fragment, useEffect, useState } from "react";
import {
  ArrowUpRight,
  Bug,
  ChevronRight,
  Eye,
  Files,
  GitBranch,
  Package,
  Search,
  Settings,
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
        {blank ? " " : children}
      </span>
    </div>
  );
}

/* lowlighted tokens */
const K = (p) => <span className="tk-k" {...p} />; // keyword
const V = (p) => <span className="tk-v" {...p} />; // property key
const P = (p) => <span className="tk-p" {...p} />; // punctuation
const C = (p) => <span className="tk-c" {...p} />; // comment

// a string literal: whisper quotes, bright content (dim = detail level)
function Str({ dim = false, children }) {
  return (
    <>
      <span className="tk-p">"</span>
      <span className={dim ? "tk-s tk-s--dim" : "tk-s"}>{children}</span>
      <span className="tk-p">"</span>
    </>
  );
}

// CodeLens headline: proportional Inter on an un-numbered editor line,
// sticky under the breadcrumbs like VS Code's sticky scroll
function Lens({ title, tag, right, href }) {
  return (
    <div className="ln ln--lens">
      <div className="ln-c lens-row">
        <h3 className="lens-t">{title}</h3>
        {tag && <span className="lens-tag">{tag}</span>}
        {right &&
          (href ? (
            <a className="lens-r" href={href} target="_blank" rel="noreferrer">
              {right} <ArrowUpRight size={11} strokeWidth={2} aria-hidden="true" />
            </a>
          ) : (
            <span className="lens-r">{right}</span>
          ))}
      </div>
    </div>
  );
}

// a real code fold: collapsed shows `key: [ ⋯ ],` — the ⋯ and the gutter
// chevron are the toggle, exactly like the editor's folding UI
function FoldLine({ k, open, onToggle }) {
  return (
    <div className="ln ln--fold">
      <button
        type="button"
        className="ln-c foldbtn"
        style={{ paddingLeft: "1.6ch" }}
        onClick={onToggle}
        aria-expanded={open}
        aria-label={open ? `Collapse ${k}` : `Expand ${k}`}
      >
        <ChevronRight
          size={11}
          strokeWidth={2.5}
          className={"fold-chev" + (open ? " is-open" : "")}
          aria-hidden="true"
        />
        <V>{k}</V>
        <P>: [</P>
        {!open && (
          <>
            <span className="fold-dots">⋯</span>
            <P>],</P>
          </>
        )}
      </button>
    </div>
  );
}

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
/* identity lives in the CodeLens; the visible code lines carry only new
   information: one gold metric, one summary string, folded detail */

const experience = [
  {
    role: "Software Development Intern",
    org: "LTIMindtree",
    tag: "BPCL · computer vision",
    when: "May – Jul 2026",
    impact: "91% mAP@0.5 · 20+ FPS",
    summary:
      "YOLOv8 hazard & PPE detection over live CCTV feeds — multi-stream RTSP inference in real time",
    detail: [
      "curated + annotated 12,000+ frames across 25+ viewpoints; augmentation lifted small-object recall 14%",
      "manual monitoring effort down ~60%",
    ],
  },
  {
    role: "Frontend Developer",
    org: "NextG",
    tag: "retail-tech · phygital engine",
    when: "Jun 2026",
    impact: "500K+ outlets",
    summary:
      "scroll-driven WebGL brand experience — cursor-reactive particle lattice, dependency-free vanilla JS",
    detail: [
      "owned creative direction through implementation: end-to-end landing prototypes in React, TypeScript, WebGL",
    ],
  },
  {
    role: "Project Intern",
    org: "Globally GI",
    tag: "computer vision & data",
    when: "Jan – Apr 2026",
    impact: "3× labeled data · +9% accuracy",
    summary:
      "CVAT dataset expansion + annotation pipeline for a food-recognition model",
    detail: [],
  },
  {
    role: "Software Development Intern",
    org: "DIOnce Technology",
    tag: "full-stack",
    when: "May – Jul 2025",
    impact: "",
    summary:
      "full-stack Django apps — auth, order management, secure payments — serving live users",
    detail: [
      "tested, documented PRs to an open-source text-analysis tool",
    ],
  },
];

const projects = [
  {
    key: "regis",
    name: "Regis",
    what: "AI-assisted compliance platform for Indian NBFCs",
    stack: ["FastAPI", "PostgreSQL", "Next.js", "TypeScript"],
    impact: "137 tests · 84% coverage",
    proof: [
      "34 REST endpoints · 9 modules · 27 tables · multi-tenant isolation · maker-checker approvals",
      "5 rule engines over 106 obligation templates across 29 Indian laws — 367+ dated obligations from one profile in <2s",
      "98.4% AI evidence-classification accuracy",
    ],
    repo: "github.com/MrinaliBhardwaj/compliance-checker",
  },
  {
    key: "lexa",
    name: "Lexa",
    what: "large-document intelligence (RAG) for 500–1,000-page PDFs",
    stack: ["FastAPI", "PostgreSQL", "vector search", "Anthropic / OpenAI"],
    impact: "0 type errors · 54 modules",
    proof: [
      "citation-grounded Q&A, clause & risk extraction, semantic version diffs",
      "82% test coverage · CI gate on every commit",
    ],
    repo: "github.com/MrinaliBhardwaj/Lotus",
  },
  {
    key: "publicPulse",
    name: "Public Pulse",
    what: "civic-issue reporting platform, cross-platform",
    stack: ["React Native (Expo)", "Express", "PostgreSQL", "LangGraph"],
    impact: "SIH national finalist",
    proof: [
      "camera-first capture, feeds, voting on Firebase auth + S3 media",
      "LangChain/LangGraph agent pipeline for AI triage of citizen reports",
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
  const [open, setOpen] = useState(() => new Set());

  const toggle = (key) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });

  // status bar Ln = the buffer line the active section starts on
  useEffect(() => {
    const sec = document.getElementById(activeSection);
    const first = sec?.querySelector(".ln");
    if (!first) return;
    const all = [...document.querySelectorAll(".tw-editor .ln")];
    setLine(all.indexOf(first) + 1);
  }, [activeSection, open]);

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
          {/* ---- README.md, rendered as VS Code's Markdown preview ---- */}
          <section id="tw-about" className="ed-sec" aria-label="About">
            <div className="mdp">
              <div className="mdp-bar">
                <Eye size={12} strokeWidth={2} aria-hidden="true" />
                <span>README.md — preview</span>
              </div>
              <h1 className="mdp-h1">Mrinali Bhardwaj</h1>
              <p className="mdp-lede">
                Software engineer — <strong>full-stack + applied AI</strong>.
                Ships end-to-end products: typed backends, real frontends,
                models that run on live data. B.Tech CSE @ VIT, CGPA 8.34,
                class of 2027. Now: SDE intern @ LTIMindtree — computer
                vision for BPCL.
              </p>
              <div className="mdp-badges">
                <a className="badge" href={GITHUB} target="_blank" rel="noreferrer">
                  <span className="badge-k">gh</span>
                  <span className="badge-v">MrinaliBhardwaj</span>
                </a>
                <a className="badge" href={LINKEDIN} target="_blank" rel="noreferrer">
                  <span className="badge-k">in</span>
                  <span className="badge-v">mrinali-bhardwaj</span>
                </a>
                <a className="badge" href="/resume-tech.pdf" download>
                  <span className="badge-k">cv</span>
                  <span className="badge-v">resume-tech.pdf</span>
                </a>
                <a className="badge" href={`mailto:${EMAIL}`}>
                  <span className="badge-k">@</span>
                  <span className="badge-v">say hello</span>
                </a>
              </div>
              <blockquote className="mdp-quote">
                Open to software · full-stack · applied-AI internships.
              </blockquote>
              <pre className="mdp-code">
                <code>
                  <K>import</K> <P>{"{ "}</P>
                  <span className="tk-s">craft</span>
                  <P>{" }"}</P> <K>from</K>{" "}
                  <a className="tk-s ln-link" href="#/design">
                    "../design"
                  </a>
                  <P>;</P> <C>{"// the other half of this portfolio"}</C>
                </code>
              </pre>
            </div>
          </section>

          {/* ---- experience.ts ---- */}
          <section id="tw-exp" className="ed-sec" aria-label="Experience">
            <FileBreak name="experience.ts" />
            <Ln>
              <K>export const</K> <V>experience</V> <P>= [</P>
            </Ln>
            <Ln blank />
            {experience.map((e) => (
              <Fragment key={e.org}>
                <article className="ed-entry">
                  <Lens
                    title={`${e.role} · ${e.org}`}
                    tag={e.tag}
                    right={e.when}
                  />
                  <Ln ind={1}>
                    <P>{"{"}</P>
                  </Ln>
                  {e.impact && (
                    <Ln ind={2}>
                      <V>impact</V>
                      <P>: </P>
                      <span className="hint hint--gold">{e.impact}</span>
                      <P>,</P>
                    </Ln>
                  )}
                  <Ln ind={2}>
                    <V>work</V>
                    <P>: </P>
                    <Str>{e.summary}</Str>
                    <P>,</P>
                  </Ln>
                  {e.detail.length > 0 && (
                    <>
                      <FoldLine
                        k="detail"
                        open={open.has(e.org)}
                        onToggle={() => toggle(e.org)}
                      />
                      {open.has(e.org) && (
                        <>
                          {e.detail.map((d) => (
                            <Ln ind={2} key={d.slice(0, 24)}>
                              <Str dim>{d}</Str>
                              <P>,</P>
                            </Ln>
                          ))}
                          <Ln ind={1}>
                            <P>],</P>
                          </Ln>
                        </>
                      )}
                    </>
                  )}
                  <Ln ind={1}>
                    <P>{"},"}</P>
                  </Ln>
                </article>
                <Ln blank />
                <Ln blank />
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
              <K>export const</K> <V>projects</V> <P>= [</P>
            </Ln>
            <Ln blank />
            {projects.map((pr) => (
              <Fragment key={pr.key}>
                <article className="ed-entry">
                  <Lens
                    title={pr.name}
                    tag={pr.what}
                    right="repo"
                    href={`https://${pr.repo}`}
                  />
                  <Ln ind={1}>
                    <P>{"{"}</P>
                  </Ln>
                  <Ln ind={2}>
                    <V>impact</V>
                    <P>: </P>
                    <span className="hint hint--gold">{pr.impact}</span>
                    <P>,</P>
                  </Ln>
                  <Ln ind={2}>
                    <V>stack</V>
                    <P>: [</P>
                    {pr.stack.map((s) => (
                      <span className="hint hint--stack" key={s}>
                        {s}
                      </span>
                    ))}
                    <P>],</P>
                  </Ln>
                  <FoldLine
                    k="proof"
                    open={open.has(pr.key)}
                    onToggle={() => toggle(pr.key)}
                  />
                  {open.has(pr.key) && (
                    <>
                      {pr.proof.map((line2) => (
                        <Ln ind={2} key={line2.slice(0, 24)}>
                          <Str dim>{line2}</Str>
                          <P>,</P>
                        </Ln>
                      ))}
                      <Ln ind={1}>
                        <P>],</P>
                      </Ln>
                    </>
                  )}
                  <Ln ind={1}>
                    <P>{"},"}</P>
                  </Ln>
                </article>
                <Ln blank />
                <Ln blank />
              </Fragment>
            ))}
            <Ln>
              <P>];</P>
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
                {items.map((it) => (
                  <span className="hint hint--skill" key={it}>
                    {it}
                  </span>
                ))}
                <P>]{gi < skills.length - 1 ? "," : ""}</P>
              </Ln>
            ))}
            <Ln>
              <P>{"}"}</P>
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
              <a className="ln-link env-v" href={`mailto:${EMAIL}`}>
                {EMAIL}
              </a>
            </Ln>
            <Ln>
              <V>GITHUB</V>
              <P>=</P>
              <a className="ln-link env-v" href={GITHUB} target="_blank" rel="noreferrer">
                github.com/MrinaliBhardwaj
              </a>
            </Ln>
            <Ln>
              <V>LINKEDIN</V>
              <P>=</P>
              <a className="ln-link env-v" href={LINKEDIN} target="_blank" rel="noreferrer">
                linkedin.com/in/mrinali-bhardwaj-a340a3322
              </a>
            </Ln>
            <Ln>
              <V>RESUME</V>
              <P>=</P>
              <a className="ln-link env-v" href="/resume-tech.pdf" download>
                /resume-tech.pdf
              </a>
            </Ln>
            <Ln>
              <V>STATUS</V>
              <P>=</P>
              <span className="hint hint--gold">open_to_internships</span>
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
          <span className="tw-st tw-st--desk">Portfolio Lens ✓</span>
        </div>
      </footer>
    </div>
  );
}
