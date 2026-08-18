// A CASE STUDY, AS A WINDOW ON THE DESKTOP.
//
// Tapping a project file used to navigate to #/design/<slug> — you left the
// desktop to read about the work. In the reference the case study opens as a
// macOS window ON the desktop instead: the wallpaper, the files and the dock all
// stay put behind it, several can be open at once, and you drag them around.
// That is the difference between a site that looks like a desktop and one that
// behaves like one, so the window is what a project file opens now.
//
// The full page at #/design/<slug> is untouched and still linked from inside the
// window ("Open full case study"). Deep links keep working; this is a second,
// lighter way in, not a replacement.
//
// LIGHT, on a dark site, deliberately: a Mac window is a light panel and this
// one is quoting a Mac window. Notes is already a light world, so the vocabulary
// exists in the project.
import { useRef, useState } from "react";
import { motion, useDragControls } from "framer-motion";
import { ChevronLeft, ChevronRight, ArrowUpRight } from "lucide-react";
import { PROJECTS } from "./projects.js";

// Where each new window lands. macOS cascades: every window opens slightly down
// and right of the last one so the stack stays legible instead of one hiding
// another exactly. Wrapped at 4 so the fifth doesn't march off the screen.
const CASCADE = 26;
const CASCADE_WRAP = 4;

export default function CaseWindow({ project, index, z, onClose, onFocus, onSwitch }) {
  const p = project;
  const layer = useRef(null);
  // A window's own three lights, and all three do something REAL to the window —
  // the same rule the title-bar lights follow (see WindowLights.jsx): red quits
  // it, yellow rolls it up into just its title bar (the classic Mac window
  // shade, which is a genuine behaviour and not a stand-in), green toggles it
  // large. Nothing here is a painted circle that swallows a click.
  const [rolled, setRolled] = useState(false);
  const [big, setBig] = useState(false);
  const controls = useDragControls();

  // browse the work without closing the window — this is what makes the
  // reference's back/forward chevrons real rather than decorative
  const at = PROJECTS.findIndex((x) => x.slug === p.slug);
  const step = (d) => () =>
    onSwitch(PROJECTS[(at + d + PROJECTS.length) % PROJECTS.length].slug);

  const offset = (index % CASCADE_WRAP) * CASCADE;

  return (
    <motion.div
      ref={layer}
      className={`cw${big ? " is-big" : ""}${rolled ? " is-rolled" : ""}`}
      style={{ zIndex: z }}
      initial={{ opacity: 0, scale: 0.96, x: offset, y: offset }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.14 } }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      // Dragged by the TITLE BAR only, the way a real window is — grabbing the
      // body of a Mac window selects text, it doesn't move the window. Hence
      // dragListener={false} plus the controls started from the bar below.
      drag
      dragListener={false}
      dragControls={controls}
      dragMomentum={false}
      dragElastic={0}
      onPointerDownCapture={onFocus}
      role="dialog"
      aria-label={`Case study: ${p.name}`}
    >
      <div
        className="cw-bar"
        onPointerDown={(e) => controls.start(e)}
        onDoubleClick={() => setRolled((r) => !r)}
      >
        <div className="cw-lights">
          <button
            type="button"
            className="cw-light cw-light--close"
            onClick={onClose}
            aria-label={`Close ${p.name}`}
          />
          <button
            type="button"
            className="cw-light cw-light--min"
            onClick={() => setRolled((r) => !r)}
            aria-label={rolled ? `Unroll ${p.name}` : `Roll up ${p.name}`}
          />
          <button
            type="button"
            className="cw-light cw-light--max"
            onClick={() => setBig((b) => !b)}
            aria-label={big ? "Shrink this window" : "Enlarge this window"}
          />
        </div>

        <div className="cw-nav">
          <button type="button" onClick={step(-1)} aria-label="Previous project">
            <ChevronLeft size={15} strokeWidth={2} aria-hidden="true" />
          </button>
          <button type="button" onClick={step(1)} aria-label="Next project">
            <ChevronRight size={15} strokeWidth={2} aria-hidden="true" />
          </button>
        </div>

        <span className="cw-title">Case Study&nbsp;: {p.name}</span>
      </div>

      {/* `hidden` rather than unmounted while rolled up: the window keeps its
          scroll position and its images stay decoded, so rolling back down is
          instant instead of re-fetching the preview. */}
      <div className="cw-body" hidden={rolled}>
        <header className="cw-head">
          <img className="cw-thumb" src={p.cover} alt="" />
          <div>
            <h2>{p.name}</h2>
            <p className="cw-sub">{p.what}</p>
          </div>
        </header>

        <div className="cw-card">
          <p>{p.summary || p.blurb}</p>
        </div>

        <h3 className="cw-section">Details</h3>
        <dl className="cw-facts">
          {(p.facts || [["Type", p.what]]).map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>

        <h3 className="cw-section">Preview</h3>
        <div className="cw-preview">
          <img src={p.cover} alt={`${p.name} — cover`} loading="lazy" />
        </div>

        <div className="cw-actions">
          <a className="cw-open" href={`#/design/${p.slug}`}>
            Open full case study
            <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
          </a>
          {p.external && (
            <a
              className="cw-open cw-open--quiet"
              href={p.external}
              target="_blank"
              rel="noreferrer"
            >
              Behance
              <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
            </a>
          )}
        </div>
      </div>
    </motion.div>
  );
}
