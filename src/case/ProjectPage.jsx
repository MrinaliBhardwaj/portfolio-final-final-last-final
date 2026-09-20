// THE PROJECT PAGE — the document inside the case window.
//
// WHAT THIS REPLACED, and why. The window used to render a short preamble and
// then the project's ENTIRE Behance board: ten stacked slices, 20,000px tall,
// every word of it a pixel. That is a case study pasted into a portfolio — it
// cannot reflow, cannot be selected or searched, has no hierarchy the page
// controls, and looks identical for all four projects because the page is not
// designing anything.
//
// So the board is source material now, and each project gets a page built out
// of it: its own palette, its own typefaces, its own section-label motif, its
// own rhythm, composed from pieces of the board rather than from the board.
// The board itself is still here — folded away at the foot, where it is an
// appendix rather than the layout (`.pp-board`). Nothing was thrown away.
//
// WHAT STAYED THE SAME, deliberately. The window, its three working lights, the
// Finder sidebar, the prev/next chevrons, the fold-on-scroll, the measure, the
// 44px targets, the reduced-motion contract. PRODUCT.md calls this "worlds
// diverge, chrome agrees"; the project pages are the same rule one level down.
//
// The MASTHEAD is the hinge between the two: identical furniture on all four
// pages — what it is, when, her role, the shape of the job, and what came of
// it — wearing the project's paint. A reader arriving from the sidebar lands on
// the same object every time and only then does the project take over.
//
// Under it, the SECTION INDEX: a study is eight to fifteen screens inside a
// window whose scrollbar says nothing about what is in it, so the sections
// announce themselves and can be jumped between.
import { useEffect, useRef } from "react";
import { ChevronRight } from "lucide-react";

// The four faces the projects use that the site did not already have. Declared
// once, here, and NOT once per page: an @font-face the page never applies is
// never fetched, so a reader on Layover pays for Montserrat and for nothing
// else. Archivo, Inter and JetBrains Mono are already the site's own.
import "@fontsource-variable/montserrat/wght.css";
import "@fontsource-variable/open-sans/wght.css";
import "@fontsource-variable/gantari/wght.css";
import "@fontsource/poppins/latin-400.css";
import "@fontsource/poppins/latin-500.css";
import "@fontsource/poppins/latin-600.css";
import "@fontsource/poppins/latin-700.css";

import {
  ChapterNav,
  ParallaxProvider,
  RevealProvider,
  useChapters,
  useRevealRoot,
  useParallaxRoot,
  usePageMotion,
} from "./parts.jsx";
import Layover from "./Layover.jsx";
import MealMaestro from "./MealMaestro.jsx";
import Futurepreneurs from "./Futurepreneurs.jsx";
import NextG from "./NextG.jsx";
import "./project-page.css";
import "./themes.css";

/**
 * A VIDEO THAT LIVES INSIDE A BOARD. Figma renders a video fill as a blank box
 * in every export, so a board with a video in it arrives with a white hole
 * where the video goes. This lays the real video over that hole: positioned in
 * the board's own pixel coordinates, as percentages of the stacked strip, so it
 * tracks the board at any width, and rounded to the box's own corners.
 *
 * It only plays while it is on screen (and pauses when scrolled away), and it
 * is not fetched until then — `preload="none"` — so a study you never scroll
 * down costs nothing. Under reduced motion it never autoplays: it shows its
 * poster and native controls instead.
 */
function BoardVideo({ v, board }) {
  const ref = useRef(null);
  const reduced =
    typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => {
    const el = ref.current;
    if (!el || reduced) return undefined;
    el.muted = true; // React sets `muted` late; autoplay policy needs it before play()
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) el.play().catch(() => {});
        else el.pause();
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [reduced]);
  const W = board.slices[0].w;
  const H = board.slices.reduce((s, sl) => s + sl.h, 0);
  return (
    <video
      ref={ref}
      className="cw-board-video"
      src={v.src}
      poster={v.poster}
      muted
      loop
      playsInline
      preload="none"
      controls={reduced}
      aria-label={v.label}
      style={{
        left: `${(v.x / W) * 100}%`,
        top: `${(v.y / H) * 100}%`,
        width: `${(v.w / W) * 100}%`,
        height: `${(v.h / H) * 100}%`,
        borderRadius: `${(v.r / v.w) * 100}% / ${(v.r / v.h) * 100}%`,
      }}
    />
  );
}

/**
 * slug -> its composition. A project with no page here still gets the masthead
 * and its board, which is exactly what a project whose study has not been
 * art-directed yet should get: the furniture, honestly, and the source.
 */
const STORIES = {
  layover: Layover,
  "meal-maestro": MealMaestro,
  futurepreneurs: Futurepreneurs,
  nextg: NextG,
};

/** the one project whose masthead sits on its own gradient */
const MESH = new Set(["futurepreneurs"]);

export default function ProjectPage({ project: p, scrollerRef }) {
  const root = useRef(null);
  const animate = usePageMotion(root);
  const observe = useRevealRoot(scrollerRef, animate);
  const register = useParallaxRoot(scrollerRef, animate);
  const chapters = useChapters(root, scrollerRef);
  const Story = STORIES[p.slug];
  const boards = p.boards || [];

  return (
    <RevealProvider observe={observe}>
      <ParallaxProvider register={register}>
        {/* `.cw-doc` for the window's measure and its fold-aware padding,
            `.pp` for everything this page is. Both, on purpose — see the note
            at the top of project-page.css. */}
        <article ref={root} className="cw-doc pp" data-project={p.slug}>
          {/* THE FIRST SCREEN ANSWERS THE FIRST FOUR QUESTIONS.
              It used to answer two. A reader got the name, a sentence and a
              rule-separated row of whatever facts the project happened to
              carry — three on one study, five on another, stretched edge to
              edge so "Role" sat 1,200px from "Launch airports" and belonged to
              nothing. The result of the work was ten thousand pixels below, at
              the foot, where somebody spending ninety seconds never reaches.

              Now: what it is and when, its name, the claim, her role and the
              shape of the job on the left; WHAT CAME OF IT on the right, in the
              project's own accent, in the space that was empty. Four fixed
              slots in one order on all four studies — Role, Timeline, Scope,
              Tools — so the four pages are the same object wearing different
              paint, and a missing slot is simply absent rather than padded out
              with "Location: India". */}
          <header className="pp-mast">
            {MESH.has(p.slug) && <div className="pp-mesh" aria-hidden="true" />}
            <div className="pp-mast-grid">
              <div className="pp-mast-say">
                <p className="pp-mast-kind">
                  {p.what}
                  {p.when && <span>{p.when}</span>}
                </p>
                <h2>{p.name}</h2>
                {(p.blurb || p.summary) && <p className="pp-mast-lede">{p.blurb || p.summary}</p>}
                {p.facts?.length > 0 && (
                  <dl className="pp-mast-facts">
                    {p.facts.map(([k, v]) => (
                      <div key={k}>
                        <dt>{k}</dt>
                        <dd>{v}</dd>
                      </div>
                    ))}
                  </dl>
                )}
              </div>

              {p.metrics?.length > 0 && (
                <div className="pp-mast-out">
                  <p className="pp-mast-out-head">Outcome</p>
                  <dl>
                    {p.metrics.map((m) => (
                      <div key={m.label}>
                        <dd>{m.value}</dd>
                        <dt>{m.label}</dt>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </div>
          </header>

          <ChapterNav {...chapters} />

          {Story ? (
            <Story />
          ) : (
            /* Honest rather than decorative. A project with a board and no page
               yet says so, and the board below is still the whole study. */
            <p className="pp-copy is-wide pp-pending">
              {p.pending ||
                "The page for this one hasn’t been art-directed yet — the full case study is below."}
            </p>
          )}

          {/* ---- her board, demoted ----
              It used to BE the page. Closed by default, so `loading="lazy"`
              inside it fetches none of its megabytes — and, just as usefully,
              20,000px of image boxes are not laid out the instant a window
              opens. */}
          {boards.map((b, i) => (
            <details className="pp-board" key={b.node || i}>
              <summary>
                <ChevronRight size={14} strokeWidth={2.2} aria-hidden="true" />
                {b.title || "The full case study, as exported from Figma"}
                <span className="pp-board-dim">{b.dims}</span>
              </summary>
              <p className="pp-board-note">
                The original board. Everything above is built out of this — the page is the
                edit, this is the source.
              </p>
              <figure className="pp-strip">
                {b.slices.map((sl, s) => (
                  <img
                    key={sl.src}
                    src={sl.src}
                    alt={s === 0 ? b.alt : ""}
                    aria-hidden={s === 0 ? undefined : "true"}
                    loading="lazy"
                    decoding="async"
                    width={sl.w}
                    height={sl.h}
                    draggable="false"
                  />
                ))}
                {/* the white hole Figma leaves where a video fill was — see
                    BoardVideo above. The board is an appendix now, but an
                    appendix with a blank box in it is still wrong. */}
                {b.videos?.map((v) => (
                  <BoardVideo key={v.src} v={v} board={b} />
                ))}
              </figure>
            </details>
          ))}
        </article>
      </ParallaxProvider>
    </RevealProvider>
  );
}
