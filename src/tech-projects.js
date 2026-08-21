// The engineering projects — one list, three consumers.
//
// It used to live inside TechWorld.jsx as a private `const projects`, which was
// fine while the tech world was the only thing that rendered it. The desktop now
// carries a README file per project (DesktopFiles.jsx) that opens an editor
// window (CodeWindow.jsx), so the same three projects are drawn by three
// different surfaces. This is projects.js's sibling and exists for the same
// reason that one does: a second copy of a stat is how one of them goes stale.
//
// EVERY NUMBER HERE IS HERS. The README window arranges these fields, it does
// not embellish them — no invented timings, no fabricated terminal output, no
// "6 months" that nobody measured. If a field isn't in this file, the window
// doesn't claim it.
//
// `impact` is written as ` · `-separated stats because both consumers split it:
// the tech world prints it as one line, the README window turns each half into
// its own stat chip.

/**
 * @typedef {object} TechProject
 * @property {string} key      slug — the id in #/?readme=<key>
 * @property {string} name
 * @property {string} what     one line, used as the README's subtitle
 * @property {string} file     the desktop file's name
 * @property {string[]} stack
 * @property {string} impact   ` · `-separated stats
 * @property {string[]} proof
 * @property {string} repo     host + path, no protocol (the tech world prints it)
 */

/** @type {TechProject[]} */
export const TECH_PROJECTS = [
  {
    key: "regis",
    name: "Regis",
    what: "AI-assisted compliance platform for Indian NBFCs",
    file: "regis.md",
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
    file: "lexa.md",
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
    file: "public-pulse.md",
    stack: ["React Native (Expo)", "Express", "PostgreSQL", "LangGraph"],
    impact: "SIH national finalist",
    proof: [
      "camera-first capture, feeds, voting on Firebase auth + S3 media",
      "LangChain/LangGraph agent pipeline for AI triage of citizen reports",
    ],
    repo: "github.com/MrinaliBhardwaj/public-pulse",
  },
];

export const byKey = (key) => TECH_PROJECTS.find((p) => p.key === key) || null;

// `repo` is stored bare so the tech world can print it as text; anything that
// needs to LINK to it goes through here rather than concatenating "https://"
// at four call sites.
export const repoUrl = (p) => `https://${p.repo}`;
