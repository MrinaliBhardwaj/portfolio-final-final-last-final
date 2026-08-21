// A README, OPEN IN AN EDITOR, ON THE DESKTOP.
//
// The design half of the desk opens light Mac windows (CaseWindow.jsx). This is
// the engineering half's answer, and the difference is the point: the dock
// already establishes two toolchains — Figma and VS Code — so a project file
// opens in the app that made it. Same chrome, same three working lights, same
// drag-by-the-title-bar, same chevrons; a different application behind them.
//
// IT IS A MARKDOWN PREVIEW, NOT RAW SOURCE. VS Code renders .md files exactly
// this way (a Preview tab beside the editor), so the window can carry editor
// chrome and still be readable prose. The `#` and `##` before the headings are
// kept, dimmed, because they are the one cue that says "this is a text file"
// without asking anyone to read markup.
//
// WHY A README AND NOT A CASE STUDY. There is not a single screenshot of Regis,
// Lexa or Public Pulse in this repository, and there shouldn't need to be: the
// evidence for a backend is its endpoints, its coverage and its test count, not
// a picture of it. Everything on screen here comes out of tech-projects.js —
// the window arranges her numbers, it never invents one.
import { useRef, useState } from "react";
import { motion, useDragControls } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowUpRight, ArrowRight } from "lucide-react";
import { TECH_PROJECTS, repoUrl } from "./tech-projects.js";

// Matches CaseWindow's cascade exactly — the two kinds of window share one
// desktop and one stack, so they have to land on the same rhythm.
const CASCADE = 26;
const CASCADE_WRAP = 4;

// The CommonMark mark (CC0), on currentColor — the same rule the dock follows:
// a real logo or nothing. Drawn once here rather than in BrandIcons because
// nothing else on the site is markdown.
function MarkdownMark() {
  return (
    <svg viewBox="0 0 208 128" className="rw-tab-icon" aria-hidden="true">
      <rect
        x="5"
        y="5"
        width="198"
        height="118"
        ry="10"
        fill="none"
        stroke="currentColor"
        strokeWidth="10"
      />
      <path
        fill="currentColor"
        d="M30 98V30h20l20 25 20-25h20v68H90V59L70 84 50 59v39zM155 98l-30-33h20V30h20v35h20z"
      />
    </svg>
  );
}

export default function CodeWindow({ project, index, z, onClose, onFocus, onSwitch }) {
  const p = project;
  const layer = useRef(null);
  // All three lights work, the same as everywhere else on this site: red quits
  // the window, yellow rolls it up to its title bar (the classic Mac window
  // shade), green toggles it large. None of them is a painted circle.
  const [rolled, setRolled] = useState(false);
  const [big, setBig] = useState(false);
  const controls = useDragControls();

  const at = TECH_PROJECTS.findIndex((x) => x.key === p.key);
  const step = (d) => () =>
    onSwitch(TECH_PROJECTS[(at + d + TECH_PROJECTS.length) % TECH_PROJECTS.length].key);

  const offset = (index % CASCADE_WRAP) * CASCADE;

  // `impact` is authored as " · "-separated stats precisely so it can become
  // chips here and stay one line in the tech world — see tech-projects.js.
  const stats = p.impact.split("·").map((s) => s.trim()).filter(Boolean);
  // the repo path's last segment: the folder the file would actually sit in
  const folder = p.repo.split("/").pop();

  return (
    <motion.div
      ref={layer}
      className={`rw${big ? " is-big" : ""}${rolled ? " is-rolled" : ""}`}
      style={{ zIndex: z }}
      initial={{ opacity: 0, scale: 0.96, x: offset, y: offset }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.14 } }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      drag
      dragListener={false}
      dragControls={controls}
      dragMomentum={false}
      dragElastic={0}
      onPointerDownCapture={onFocus}
      role="dialog"
      aria-label={`README: ${p.name}`}
    >
      <div
        className="rw-bar"
        onPointerDown={(e) => controls.start(e)}
        onDoubleClick={() => setRolled((r) => !r)}
      >
        <div className="rw-lights">
          <button
            type="button"
            className="rw-light rw-light--close"
            onClick={onClose}
            aria-label={`Close ${p.name}`}
          />
          <button
            type="button"
            className="rw-light rw-light--min"
            onClick={() => setRolled((r) => !r)}
            aria-label={rolled ? `Unroll ${p.name}` : `Roll up ${p.name}`}
          />
          <button
            type="button"
            className="rw-light rw-light--max"
            onClick={() => setBig((b) => !b)}
            aria-label={big ? "Shrink this window" : "Enlarge this window"}
          />
        </div>

        <div className="rw-nav">
          <button type="button" onClick={step(-1)} aria-label="Previous project">
            <ChevronLeft size={15} strokeWidth={2} aria-hidden="true" />
          </button>
          <button type="button" onClick={step(1)} aria-label="Next project">
            <ChevronRight size={15} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <span className="rw-title">{p.file} — {folder}</span>
      </div>

      {/* `hidden` rather than unmounted while rolled up, so rolling back down
          keeps the scroll position instead of snapping to the top. */}
      <div className="rw-pane" hidden={rolled}>
        {/* the open tab. VS Code labels a rendered markdown tab "Preview", and
            that is exactly what this is, so it says so. */}
        <div className="rw-tabs" aria-hidden="true">
          <span className="rw-tab">
            <MarkdownMark />
            Preview {p.file}
          </span>
        </div>

        <p className="rw-crumbs" aria-hidden="true">
          <span>MrinaliBhardwaj</span>
          <span>{folder}</span>
          <span>{p.file}</span>
        </p>

        <div className="rw-doc">
          <h1 className="rw-h1">
            <span className="rw-hash" aria-hidden="true">#</span>
            {p.name}
          </h1>
          {/* the README's opening blockquote — one line saying what it is */}
          <p className="rw-quote">{p.what}</p>

          <ul className="rw-stats">
            {stats.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>

          <h2 className="rw-h2">
            <span className="rw-hash" aria-hidden="true">##</span>
            Stack
          </h2>
          <ul className="rw-chips">
            {p.stack.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ul>

          <h2 className="rw-h2">
            <span className="rw-hash" aria-hidden="true">##</span>
            What it does
          </h2>
          <ul className="rw-list">
            {p.proof.map((line) => (
              <li key={line}>{line}</li>
            ))}
          </ul>

          <div className="rw-actions">
            <a
              className="rw-open"
              href={repoUrl(p)}
              target="_blank"
              rel="noreferrer"
            >
              View repository
              <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
            </a>
            {/* stays on the site — the tech world is the long version of this */}
            <a className="rw-open rw-open--quiet" href="#/tech">
              Open in the tech world
              <ArrowRight size={14} strokeWidth={1.8} aria-hidden="true" />
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
