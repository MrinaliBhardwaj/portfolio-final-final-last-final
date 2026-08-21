// A CASE STUDY, AS A WINDOW ON THE DESKTOP.
//
// Tapping a project file used to navigate to #/design/<slug> — you left the
// desktop to read about the work. In the reference the case study opens as a
// macOS window ON the desktop instead: the wallpaper, the files and the dock all
// stay put behind it, several can be open at once, and you drag them around.
// That is the difference between a site that looks like a desktop and one that
// behaves like one, so the window is what a project file opens now.
//
// IT IS THE WHOLE CASE STUDY NOW (19 Aug 2026), not a teaser for one. It used
// to show the cover twice — once as a thumbnail, once as a "Preview" — and then
// hand you to #/design/<slug> for the actual artwork, which meant the same three
// projects had three entry points and two different formats. The exported
// artboards render in here instead, the "Open full case study" button is gone,
// ProjectPage.jsx is deleted, and #/design/<slug> redirects to this window's own
// address (#/?case=<slug>) so every link already in circulation still lands on
// the work. One case study, one format, one place.
//
// The design canvas keeps its boards — a Figma file IS an index of frames — but
// they now open this window rather than a second page of themselves.
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

        <h3 className="cw-section">Case study</h3>
        {p.shots.length > 0 ? (
          <div className="cw-shots">
            {p.shots.map((shot, i) => (
              <figure className="cw-shot" key={shot.frame || shot.src}>
                {/* Named and dimensioned like the artboard it is — this is a
                    picture OF a Figma frame, so it wears frame chrome rather
                    than reading as a photo dropped into a window. */}
                {shot.frame && (
                  <div className="cw-shot-frame" aria-hidden="true">
                    <span>{shot.frame}</span>
                    {shot.dims && <span className="cw-shot-dims">{shot.dims}</span>}
                  </div>
                )}
                {shot.strip ? (
                  /* One tall presentation, delivered in slices — WebP tops out
                     at 16383px and this artboard is 22306 tall. They carry no
                     rim or radius of their own, which would draw a line at
                     every seam; the wrapper holds the frame and the slices just
                     stack. width/height on each is what reserves the space, so
                     the lazy ones below the fold cannot collapse the window's
                     scroll height and make it twitch as they arrive. */
                  <div className="cw-strip">
                    {shot.strip.map((src, s) => {
                      // the last slice is short — the source height rarely
                      // divides evenly — so it declares its own size
                      const [w, h] =
                        s === shot.strip.length - 1 && shot.lastSliceSize
                          ? shot.lastSliceSize
                          : shot.sliceSize;
                      return (
                        <img
                          key={src}
                          src={src}
                          alt={s === 0 ? shot.alt : ""}
                          aria-hidden={s === 0 ? undefined : "true"}
                          loading="lazy"
                          decoding="async"
                          width={w}
                          height={h}
                          draggable="false"
                        />
                      );
                    })}
                  </div>
                ) : (
                  <img
                    src={shot.src}
                    alt={shot.alt}
                    // every shot is lazy in here, including the first: a window
                    // opens over a desktop the visitor is already looking at,
                    // so nothing in it is above the fold at open time
                    loading="lazy"
                    decoding="async"
                    width="1600"
                    height="900"
                    draggable="false"
                  />
                )}
                <figcaption>{shot.caption}</figcaption>
              </figure>
            ))}
          </div>
        ) : (
          /* Honest rather than decorative: an empty frame would imply the work
             doesn't exist. It does — the shots just aren't exported yet. */
          <p className="cw-empty">
            The shots for this one aren&rsquo;t exported yet — the full set is on
            Behance in the meantime.
          </p>
        )}

        <div className="cw-actions">
          {p.live && (
            <a className="cw-open" href={p.live} target="_blank" rel="noreferrer">
              Visit the live site
              <ArrowUpRight size={14} strokeWidth={1.8} aria-hidden="true" />
            </a>
          )}
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
