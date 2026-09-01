// A CASE STUDY, AS A WINDOW ON THE DESKTOP.
//
// Tapping a project file used to navigate to #/design/<slug> — you left the
// desktop to read about the work. In the reference the case study opens as a
// macOS window ON the desktop instead: the wallpaper, the files and the dock all
// stay put behind it, several can be open at once, and you drag them around.
// That is the difference between a site that looks like a desktop and one that
// behaves like one, so the window is what a project file opens now.
//
// IT IS A FINDER-SHAPED APP NOW (1 Sep 2026), not a scroller. The window held
// one thing — an exported artboard, 1400x22306 for Meal Maestro — under a short
// preamble. That is a PDF viewer wearing a Mac window: the study could not
// reflow, could not be read on a phone, could not be searched or selected or
// scanned, and moving between projects meant two chevrons that never said what
// was on either side of you.
//
// So the window has a SIDEBAR and a DOCUMENT. The sidebar is the whole body of
// work, always visible, current project lit — how a hiring manager sees that
// there are three of these and jumps between them without closing anything. The
// document is HTML sections at a ~1100px measure: hero, the numbers, the
// overview, the screens. The export is not gone — it is folded away at the foot
// of the study, where it is an archive rather than the page.
//
// LIGHT, on a dark site, deliberately: a Mac window is a light panel and this
// one is quoting a Mac window. Notes is already a light world, so the vocabulary
// exists in the project.
import { useEffect, useRef, useState } from "react";
import { motion, useDragControls } from "framer-motion";
import {
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ArrowUpRight,
  Folder,
  User,
  Calendar,
  Trophy,
  Layers,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import { PROJECTS } from "./projects.js";

// Where each new window lands. macOS cascades: every window opens slightly down
// and right of the last one so the stack stays legible instead of one hiding
// another exactly. Wrapped at 4 so the fifth doesn't march off the screen.
const CASCADE = 26;
const CASCADE_WRAP = 4;

/** the artboard's own pixel width, so a wide window can't blow it up past 1:1 */
function nativeWidth(shot) {
  if (shot.sliceSize) return `${shot.sliceSize[0]}px`;
  const w = shot.dims && parseInt(shot.dims, 10);
  return w ? `${w}px` : undefined;
}

// The meta row under the title reads as facts rather than a definition list only
// because each fact carries a mark. `facts` is authored as free-text pairs, so
// this matches on the label rather than demanding a fixed schema — anything
// unrecognised still renders, just with the neutral mark.
// (Objects rather than pairs: a `[RegExp, Icon]` tuple widens to
// `(RegExp | Icon)[]` under checkJs, and the icon then can't be used as a
// component. Named fields keep both types intact.)
const FACT_ICONS = [
  { re: /role|design|craft/i, icon: User },
  { re: /time|when|date|dur/i, icon: Calendar },
  { re: /recog|award|place|prize/i, icon: Trophy },
  { re: /surface|deliver|scope|platform/i, icon: Layers },
  { re: /reach|result|impact|metric/i, icon: TrendingUp },
];

function factIcon(label) {
  return FACT_ICONS.find((f) => f.re.test(label))?.icon || Sparkles;
}

/** the picture that leads the study: its first real screen, else its cover */
function heroArt(p) {
  const shot = (p.shots || []).find((s) => s.src);
  return shot ? { src: shot.src, alt: shot.alt } : { src: p.cover, alt: "" };
}

export default function CaseWindow({ project, index, z, onClose, onFocus, onSwitch }) {
  const p = project;
  const layer = useRef(null);
  const main = useRef(null);
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

  // Switching projects in place has to reset the reading position. Without it
  // you pick Layover from the sidebar while eight screens down Meal Maestro and
  // land eight screens down Layover, which reads as a broken click.
  useEffect(() => {
    main.current?.scrollTo({ top: 0 });
  }, [p.slug]);

  const offset = (index % CASCADE_WRAP) * CASCADE;
  const hero = heroArt(p);
  const shots = p.shots || [];

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
            aria-label={rolled ? "Unroll this window" : "Roll up this window"}
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

        <span className="cw-title">{p.name}</span>
      </div>

      {/* `hidden` rather than unmounted while rolled up: the window keeps its
          scroll position and its images stay decoded, so rolling back down is
          instant instead of re-fetching everything. */}
      <div className="cw-shell" hidden={rolled}>
        {/* ---- the sidebar ----
            Every project, always, with the current one lit. It answers "how much
            work is there, and how do I get to the rest of it" — which two
            chevrons on a title bar cannot, because they never say what is on
            either side of you. */}
        <nav className="cw-side" aria-label="Projects">
          <p className="cw-side-title">Portfolio</p>
          <p className="cw-side-group">
            <ChevronDown size={12} strokeWidth={2.2} aria-hidden="true" />
            <Folder size={13} strokeWidth={1.7} aria-hidden="true" />
            Projects
          </p>
          <ul className="cw-side-list">
            {PROJECTS.map((x) => {
              const here = x.slug === p.slug;
              return (
                <li key={x.slug}>
                  <button
                    type="button"
                    className={`cw-side-item${here ? " is-current" : ""}`}
                    // The highlight is not the whole story: a screen reader has
                    // to be told which row it is on too, and `aria-current` is
                    // how a navigation list says so.
                    aria-current={here ? "true" : undefined}
                    onClick={() => !here && onSwitch(x.slug)}
                  >
                    <img className="cw-side-thumb" src={x.cover} alt="" />
                    <span className="cw-side-text">
                      <span className="cw-side-name">{x.name}</span>
                      <span className="cw-side-kind">{x.what}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <p className="cw-side-foot">© 2025 Mrinali Bhardwaj</p>
        </nav>

        {/* ---- the study ---- */}
        <div className="cw-main" ref={main}>
          <article className="cw-doc">
            <header className="cw-hero">
              <div className="cw-hero-text">
                <p className="cw-eyebrow">
                  {p.what}
                  {p.when && <span className="cw-eyebrow-when">{p.when}</span>}
                </p>
                <h2>{p.name}</h2>
                <p className="cw-lede">{p.blurb}</p>
                {p.facts && (
                  <dl className="cw-meta">
                    {p.facts.slice(0, 3).map(([k, v]) => {
                      const Mark = factIcon(k);
                      return (
                        <div key={k}>
                          <Mark size={16} strokeWidth={1.6} aria-hidden="true" />
                          <div>
                            <dt>{k}</dt>
                            <dd>{v}</dd>
                          </div>
                        </div>
                      );
                    })}
                  </dl>
                )}
              </div>
              <div className="cw-hero-art">
                <img src={hero.src} alt={hero.alt} decoding="async" draggable="false" />
              </div>
            </header>

            {/* Overview and the numbers share a band, as in the reference: the
                prose says what it is, the figures say whether it worked, and a
                hiring manager reads the second one first. */}
            <section className="cw-band">
              <div className="cw-band-copy">
                <h3 className="cw-kicker">Overview</h3>
                <p>{p.summary || p.blurb}</p>
              </div>
              {p.metrics?.length > 0 && (
                <div className="cw-band-stats">
                  <h3 className="cw-kicker">Key outcome</h3>
                  <dl className="cw-stats">
                    {p.metrics.map((m) => (
                      <div key={m.label}>
                        <dd>{m.value}</dd>
                        <dt>{m.label}</dt>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </section>

            {/* The written study. Empty until the rewritten copy lands, and it
                renders nothing at all rather than an empty heading — see the
                `sections` note in projects.js. */}
            {p.sections?.length > 0 && (
              <section className="cw-prose">
                {p.sections.map((s) => (
                  <div key={s.title}>
                    <h3 className="cw-kicker">{s.title}</h3>
                    <p>{s.body}</p>
                  </div>
                ))}
              </section>
            )}

            {p.contributions?.length > 0 && (
              <section className="cw-role">
                <h3 className="cw-kicker">What I did</h3>
                <ul>
                  {p.contributions.map((c) => (
                    <li key={c}>{c}</li>
                  ))}
                </ul>
              </section>
            )}

            {p.facts?.length > 3 && (
              <section className="cw-detail">
                <h3 className="cw-kicker">Details</h3>
                <dl className="cw-facts">
                  {p.facts.slice(3).map(([k, v]) => (
                    <div key={k}>
                      <dt>{k}</dt>
                      <dd>{v}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            )}

            <section className="cw-screens">
              <h3 className="cw-kicker">The work</h3>
              {shots.length > 0 ? (
                <div className="cw-shots">
                  {shots.map((shot, i) => (
                    <figure
                      className={`cw-shot${shot.wide ? " is-wide" : ""}`}
                      key={shot.frame || shot.src}
                    >
                      <div
                        className="cw-shot-art"
                        // NEVER UPSCALE AN ARTBOARD. The window is 1240 wide and
                        // 1600 zoomed, and the image is `width: 100%` — without
                        // this a 1400px export renders at 1560 in a zoomed
                        // window, which is 11% of pure blur.
                        style={{ maxWidth: nativeWidth(shot) }}
                      >
                        <img
                          src={shot.src}
                          alt={shot.alt}
                          // every shot is lazy in here, including the first: a
                          // window opens over a desktop the visitor is already
                          // looking at, so nothing in it is above the fold at
                          // open time
                          loading="lazy"
                          decoding="async"
                          draggable="false"
                        />
                      </div>
                      <figcaption>
                        <span className="cw-shot-n" aria-hidden="true">
                          {i + 1}
                        </span>
                        <span>
                          {shot.frame && <b className="cw-shot-name">{shot.frame}</b>}
                          {shot.caption}
                        </span>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              ) : (
                /* Honest rather than decorative: an empty frame would imply the
                   work doesn't exist. It does — the screens just aren't broken
                   out yet. */
                <p className="cw-empty">
                  The screens for this one aren&rsquo;t broken out yet
                  {p.archive ? " — the full export is below." : "."}
                </p>
              )}
            </section>

            {/* THE EXPORT, DEMOTED. It used to be the page: 18 slices of one
                22,306px picture. Real work, but flat, unreflowable and unreadable
                on a phone, so it is an appendix you open rather than the thing
                you land on. Closed by default, and `loading="lazy"` inside a
                closed <details> means the browser fetches none of its 1.26 MB
                until someone asks for it. */}
            {p.archive && (
              <details className="cw-archive">
                <summary>
                  <ChevronRight size={14} strokeWidth={2} aria-hidden="true" />
                  The full case study, as exported from Figma
                  <span className="cw-archive-dim">{p.archive.dims}</span>
                </summary>
                <div className="cw-strip">
                  {p.archive.strip.map((src, s) => {
                    // the last slice is short — the source height rarely divides
                    // evenly — so it declares its own size
                    const [w, h] =
                      s === p.archive.strip.length - 1 && p.archive.lastSliceSize
                        ? p.archive.lastSliceSize
                        : p.archive.sliceSize;
                    return (
                      <img
                        key={src}
                        src={src}
                        alt={s === 0 ? p.archive.alt : ""}
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
              </details>
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
          </article>
        </div>
      </div>
    </motion.div>
  );
}
