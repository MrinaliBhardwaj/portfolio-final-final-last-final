// A PAGE of the design file — one project's case study.
//
// It renders inside DesignWorld, keeping the tab bar, the layers panel, the
// properties panel and the pink collaborator cursor, because in the Figma
// metaphor this is not a different app: it is the same file with a different
// page selected. Only the canvas changes.
//
// The shots are her exported artboards, so they carry their own composition and
// their own background — the page's job is to give them a quiet dark canvas and
// get out of the way. Wide shots (the 16:9 slides) run the full column; the
// rest sit in it. A project with no shots yet still gets a real page: the
// overview and the facts stand on their own and the gap is stated rather than
// papered over with a placeholder frame.
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight } from "lucide-react";

const EASE = [0.22, 1, 0.36, 1];

export default function ProjectPage({ project }) {
  return (
    <article className="pp">
      <motion.header
        className="pp-head"
        initial={{ opacity: 0, y: 18 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: EASE }}
      >
        <a className="pp-back" href="#/design">
          <ArrowLeft size={14} strokeWidth={2} aria-hidden="true" />
          Selected work
        </a>

        <p className="pp-file" aria-hidden="true">
          {project.file}
        </p>
        <h1 className="pp-name">{project.name}</h1>
        <p className="pp-what">
          {project.what} · {project.when}
        </p>
        <p className="pp-summary">{project.summary}</p>

        <dl className="pp-facts">
          {project.facts.map(([k, v]) => (
            <div className="pp-fact" key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>

        {project.external && (
          <a
            className="pp-ext"
            href={project.external}
            target="_blank"
            rel="noreferrer"
          >
            See it on Behance
            <ArrowUpRight size={13} strokeWidth={2} aria-hidden="true" />
          </a>
        )}
      </motion.header>

      {project.shots.length > 0 ? (
        <div className="pp-shots">
          {project.shots.map((shot, i) => (
            <motion.figure
              className={`pp-shot${shot.wide ? " pp-shot--wide" : ""}`}
              key={shot.src}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, ease: EASE, delay: (i % 2) * 0.06 }}
            >
              {shot.strip ? (
                /* One tall presentation, delivered in slices. They carry no rim
                   or radius of their own — those would draw a line at every
                   seam — so the wrapper holds the frame and the slices just
                   stack. `width`/`height` on each is what reserves the space,
                   so lazy slices below the fold don't collapse the scroll
                   height and make the page jump as they arrive. */
                <div className="pp-strip">
                  {shot.strip.map((src, s) => {
                    // The last slice is usually short — the source height
                    // rarely divides evenly — so it declares its own size.
                    // Reserving the wrong height here is what makes a long
                    // lazy-loaded page twitch as the bottom arrives.
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
                        loading={s === 0 ? "eager" : "lazy"}
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
                  loading={i === 0 ? "eager" : "lazy"}
                  decoding="async"
                  width="1600"
                  height="900"
                  draggable="false"
                />
              )}
              <figcaption>{shot.caption}</figcaption>
            </motion.figure>
          ))}
        </div>
      ) : (
        /* Honest rather than decorative: an empty artboard would imply the work
           doesn't exist. It does — the shots just aren't exported yet. */
        <p className="pp-empty">
          Case-study shots for this project aren&rsquo;t up yet — the full set
          lives on Behance in the meantime.
        </p>
      )}
    </article>
  );
}
