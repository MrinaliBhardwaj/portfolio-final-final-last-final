// DESIGN WORLD: the portfolio as an open Figma file. The page is the dark
// #1E1E1E canvas; the content lives on light artboard FRAMES scattered
// across it, each with a frame-name label. The scroll-spy SELECTS frames —
// blue ring, corner handles, dimension pill — exactly like clicking one in
// Figma, and the layers panel + properties panel track the selection.
// Chrome speaks Inter (Figma's UI font); the hero headline keeps the wide
// Archivo display type — the one identity thread shared across surfaces.
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, Layers, Mail } from "lucide-react";
import { FigmaMark } from "./BrandIcons.jsx";
import FigmaPanel from "./FigmaPanel.jsx";
import WorldTabs from "./WorldTabs.jsx";
import DesignHero from "./DesignHero.jsx";
import ProjectPage from "./ProjectPage.jsx";
import useSectionSpy from "./useSectionSpy.js";
import { PROJECTS, bySlug } from "./projects.js";

const EASE = [0.22, 1, 0.36, 1];
const EMAIL = "mailto:mrinalibhardwaj0705@gmail.com";
const LINKEDIN = "https://www.linkedin.com/in/mrinali-bhardwaj-a340a3322/";
const BEHANCE = "https://www.behance.net/mrinalibhardwaj1";

const reveal = {
  initial: { opacity: 0, y: 24 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-70px" },
  transition: { duration: 0.7, ease: EASE },
};

// The three projects live in projects.js — one list feeding the boards here,
// the layers panel's children, the Pages list and the case-study pages, so they
// cannot drift apart. Each board now opens its own page of this file rather
// than her Behance profile.
const work = PROJECTS;

// one entry per section-frame: layers-panel children + properties-panel data
const FRAMES = [
  {
    id: "dw-hero",
    name: "profile",
    // the poster's fill is her painted lotus-pond image, not a flat colour —
    // so the properties panel shows an image fill (thumbnail + "Image")
    props: {
      x: 0,
      y: 0,
      w: 1316,
      h: 741,
      fill: { type: "image", src: "/design-hero/bg-pond.webp" },
    },
    children: [
      { icon: "image", name: "PROFILE.DOC" },
      { icon: "text", name: "Meet Mrinali Bhardwaj" },
      { icon: "component", name: "experience" },
      { icon: "component", name: "skill-set" },
      { icon: "image", name: "softwares" },
      { icon: "text", name: "education" },
    ],
  },
  {
    id: "dw-exp",
    name: "experience",
    props: { x: 0, y: 760, w: 1440, h: 560, fill: "#F6F5F2" },
    children: [
      { icon: "component", name: "NextG Apex" },
      { icon: "component", name: "LUMA Technologies" },
      { icon: "component", name: "Moon Finance" },
    ],
  },
  {
    id: "dw-work",
    name: "selected-work",
    props: { x: 240, y: 1440, w: 1200, h: 720, fill: "transparent" },
    // DERIVED, not typed out. These three used to be hardcoded, which made the
    // layers panel a second source of truth for the same file names — and the
    // moment the work list was reordered it silently kept listing a project
    // that is no longer on the canvas. The panel is supposed to be a view OF
    // the artboards, so it reads from them.
    children: work.map((w) => ({ icon: "frame", name: w.file })),
  },
  {
    id: "dw-skills",
    name: "skills",
    props: { x: 0, y: 2180, w: 840, h: 420, fill: "#232323" },
    children: [
      { icon: "component", name: "capabilities" },
      { icon: "component", name: "tools" },
    ],
  },
  {
    id: "dw-lead",
    name: "leadership",
    props: { x: 600, y: 2720, w: 840, h: 400, fill: "#F472B6" },
    children: [
      { icon: "image", name: "Riviera'26" },
      { icon: "image", name: "E-Cell" },
    ],
  },
  {
    id: "dw-contact",
    name: "contact",
    props: { x: 0, y: 3240, w: 1440, h: 810, fill: "#EAE3D5" },
    children: [
      { icon: "text", name: "and that's a wrap" },
      { icon: "component", name: "envelope" },
      { icon: "text", name: "contact-links" },
    ],
  },
];

const SECTION_IDS = FRAMES.map((f) => f.id);

/* The work-in-progress drawn ON each project's artboard — no longer ghosts:
   slate wireframe strokes on the cream board, one pink element each (a CTA,
   a card, the component diamond) so every board carries the brand accent.
   Matched to what each project actually was: "screens" = web + phone pair,
   "app" = two app screens, "brand" = mark + wordmark + colour chips +
   Figma's component diamond. Decorative (aria-hidden); real case-study
   shots replace these when she supplies them. */
function PanelSketch({ kind }) {
  const s = {
    fill: "none",
    stroke: "rgba(74, 74, 88, 0.5)",
    strokeWidth: 1.5,
  };
  const pink = { fill: "#f472b6", stroke: "none" };
  if (kind === "screens") {
    return (
      <svg className="dw-board-sketch" viewBox="0 0 320 200" aria-hidden="true">
        <rect x="16" y="22" width="192" height="140" rx="4" {...s} />
        <path d="M16 44h192" {...s} />
        <circle cx="27" cy="33" r="3" {...s} />
        <circle cx="38" cy="33" r="3" {...s} />
        <rect x="32" y="58" width="82" height="46" rx="2" {...s} />
        <rect x="32" y="114" width="44" height="13" rx="6.5" {...pink} />
        <path d="M128 64h64M128 76h46M128 88h56" {...s} />
        <path d="M32 140h160M32 150h118" {...s} />
        <rect x="234" y="34" width="70" height="132" rx="10" {...s} />
        <path d="M234 58h70" {...s} />
        <rect x="246" y="72" width="46" height="32" rx="3" {...pink} />
        <path d="M246 118h46M246 128h32" {...s} />
      </svg>
    );
  }
  if (kind === "app") {
    return (
      <svg className="dw-board-sketch" viewBox="0 0 240 300" aria-hidden="true">
        <rect x="30" y="46" width="86" height="174" rx="11" {...s} />
        <path d="M30 74h86" {...s} />
        <circle cx="73" cy="118" r="21" {...s} />
        <rect x="45" y="156" width="56" height="13" rx="6.5" {...pink} />
        <path d="M45 184h56M45 195h40" {...s} />
        <rect x="128" y="86" width="86" height="174" rx="11" {...s} />
        <path d="M128 114h86" {...s} />
        <rect x="140" y="128" width="62" height="20" rx="2" {...s} />
        <rect x="140" y="158" width="62" height="20" rx="2" {...s} />
        <rect x="140" y="188" width="62" height="20" rx="2" {...s} />
        <circle cx="202" cy="238" r="7" {...pink} />
      </svg>
    );
  }
  // brand
  return (
    <svg className="dw-board-sketch" viewBox="0 0 480 180" aria-hidden="true">
      <circle cx="82" cy="88" r="42" {...s} />
      <circle cx="82" cy="88" r="20" {...s} />
      <path d="M154 62h150M154 84h110M154 106h132" {...s} />
      <rect x="154" y="128" width="16" height="16" {...s} />
      <rect x="178" y="128" width="16" height="16" {...pink} />
      <rect x="202" y="128" width="16" height="16" {...s} />
      <path d="M404 70l18 18-18 18-18-18Z" {...pink} />
    </svg>
  );
}

/* The comment threads used to be hover-to-open, with a `useTapNote` hook
   standing in for hover on a phone: the first tap opened the note and
   SWALLOWED the click, the second let it through. All of that is gone — the
   notes are always open now (see design-world.css), so there is nothing to
   reveal, and a phone tap goes straight to the link on the first try instead
   of being eaten by a disclosure nobody asked for. */

/* one artboard on the canvas. When it's the active section it wears Figma's
   selection: blue ring, four corner handles, a dimension pill below. */
// `tone` is optional: most frames take the default board colour, and only the
// poster, the dark one and the vermilion one pass it. Declared in JSDoc rather
// than as a `= null` default, which would narrow the parameter's type to null
// and turn every real string into an error under strict null checking.
/**
 * @param {{ frame: any, active: boolean, tone?: string, area: string,
 *           children: any }} props
 */
function Frame({ frame, active, tone, area, children }) {
  return (
    <motion.section
      className={`cvf${tone ? ` cvf--${tone}` : ""}${active ? " is-selected" : ""}`}
      id={frame.id}
      aria-label={frame.name}
      style={{ gridColumn: area }}
      {...reveal}
    >
      <p className="cvf-label" aria-hidden="true">
        {frame.name}
      </p>
      <div className="cvf-body">
        {children}
        <span className="cvf-handle cvf-handle--tl" aria-hidden="true" />
        <span className="cvf-handle cvf-handle--tr" aria-hidden="true" />
        <span className="cvf-handle cvf-handle--bl" aria-hidden="true" />
        <span className="cvf-handle cvf-handle--br" aria-hidden="true" />
        <span className="cvf-dims" aria-hidden="true">
          {frame.props.w} × {frame.props.h}
        </span>
      </div>
    </motion.section>
  );
}

/* the right-hand properties panel, tracking the selected frame */
function PropsPanel({ frame }) {
  const p = frame.props;
  const rows = [
    ["X", p.x],
    ["Y", p.y],
    ["W", p.w],
    ["H", p.h],
  ];
  return (
    <aside className="dwp" aria-label="Properties">
      <div className="dwp-head">
        <span className="dwp-tab">Design</span>
        <span className="dwp-zoom">100%</span>
      </div>
      <p className="dwp-selected">{frame.name}</p>
      <div className="dwp-grid">
        {rows.map(([k, v]) => (
          <div className="dwp-cell" key={k}>
            <span className="dwp-k">{k}</span>
            <span className="dwp-v">{v}</span>
          </div>
        ))}
      </div>
      <div className="dwp-sec">
        <p className="dwp-label">Fill</p>
        <div className="dwp-fill">
          {p.fill?.type === "image" ? (
            <>
              <span
                className="dwp-swatch dwp-swatch--img"
                style={{ backgroundImage: `url(${p.fill.src})` }}
              />
              <span className="dwp-v">Image</span>
              <span className="dwp-k">Fill</span>
            </>
          ) : p.fill === "transparent" ? (
            <>
              <span className="dwp-swatch dwp-swatch--none" />
              <span className="dwp-v">Transparent</span>
            </>
          ) : (
            <>
              <span className="dwp-swatch" style={{ background: p.fill }} />
              <span className="dwp-v">{p.fill.replace("#", "")}</span>
              <span className="dwp-k">100%</span>
            </>
          )}
        </div>
      </div>
      <div className="dwp-sec">
        <p className="dwp-label">Export</p>
        <p className="dwp-export">
          <span className="dwp-k">+</span> PNG 2x
        </p>
      </div>
    </aside>
  );
}

const experience = [
  {
    org: "NextG Apex",
    role: "Design Engineer Intern",
    when: "Jun 2026",
    kpi: "11 sections · 4 weeks",
    points: [
      "Led the end-to-end strategic redesign of a retail-tech site serving ₹50–500 Cr FMCG brands — from generic vendor to category-defining “phygital” product.",
      "Rebuilt the design system in Figma: 5 core tokens, 2 typefaces, a dark/light section rhythm.",
    ],
  },
  {
    org: "LUMA Technologies",
    role: "UI/UX Design Intern",
    when: "Jul – Oct 2025",
    kpi: "10,000+ users · 4 days",
    points: [
      "End-to-end UX for a lifestyle platform across web and mobile — 40+ hi-fi screens and prototypes, from scratch.",
      "Onboarding cut from 5 steps to 2; a reusable component library trimmed design-to-dev handoff ~30%.",
    ],
  },
  {
    org: "Moon Finance",
    role: "Brand & Social Design Intern",
    when: "Jan – Jul 2025",
    kpi: "+35–50% engagement",
    points: [
      "60+ branded social creatives building one cohesive, recognizable identity across platforms.",
    ],
  },
];

const capabilities = [
  "UI/UX design",
  "User-centered design",
  "Wireframing",
  "Prototyping",
  "Design systems",
  "Design tokens",
  "Component libraries",
  "Visual identity",
  "Responsive design",
  "Design-to-dev handoff",
];

// `project` is the design file's selected PAGE (a slug from #/design/<slug>),
// or null for the canvas itself. A project page keeps every bit of this world's
// chrome — tab bar, layers, properties, the pink cursor — because it is the
// same file with a different page open, not somewhere else.
export default function DesignWorld({ project = null }) {
  const page = project ? bySlug(project) : null;
  const [activeSection, selectFrame] = useSectionSpy(SECTION_IDS);
  const activeFrame =
    FRAMES.find((f) => f.id === activeSection) || FRAMES[0];
  // phone only: the layers panel is a dismissible bottom sheet
  const [layersOpen, setLayersOpen] = useState(false);

  useEffect(() => {
    if (!layersOpen) return;
    const esc = (e) => e.key === "Escape" && setLayersOpen(false);
    document.addEventListener("keydown", esc);
    return () => document.removeEventListener("keydown", esc);
  }, [layersOpen]);

  return (
    <div className="dw">
      {/* the open-pages strip: this world and its sibling as Figma file tabs */}
      <WorldTabs world="design" />

      {/* left: layers. right: properties. the canvas sits between. */}
      {/* On a project page the layers tree shows THAT page's contents, not the
          canvas's frames — listing artboards that aren't on screen would make
          the panel lie about what you're looking at. */}
      <FigmaPanel
        frames={
          page
            ? [
                {
                  id: "pp",
                  name: page.file,
                  /* A shot is EITHER a single `src` or a sliced `strip` — a
                     strip has no `src` at all, so reading it blindly threw and
                     took the whole world down with it. One layer per shot
                     either way: the slices are a delivery detail, not eight
                     things the visitor put on the page. */
                  children: page.shots.map((s, i) => ({
                    icon: "image",
                    name: s.strip
                      ? `${page.slug}-case-study`
                      : s.src.split("/").pop().replace(".webp", ""),
                    key: s.src || `strip-${i}`,
                  })),
                },
              ]
            : FRAMES
        }
        activeId={page ? "pp" : activeSection}
        onSelect={page ? () => {} : selectFrame}
        project={project}
        open={layersOpen}
        onClose={() => setLayersOpen(false)}
      />
      {/* Same reason as the layers tree above: on a project page the canvas's
          frames aren't on screen, so reporting the hero artboard's X/Y/W/H
          here would be the panel describing something you cannot see. The page
          reports its own artboard size instead. */}
      <PropsPanel
        frame={
          page
            ? {
                name: page.file,
                props: (() => {
                  const [w, h] = page.dims.split(" × ").map(Number);
                  return { x: 0, y: 0, w, h, fill: "transparent" };
                })(),
              }
            : activeFrame
        }
      />

      {/* the sheet's dismiss surface (mobile only — nothing opens it above 768) */}
      {layersOpen && (
        <div
          className="dw-scrim"
          onClick={() => setLayersOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* the file's one collaborator cursor is the VISITOR's own — a pink arrow
          (design-world.css) tagged "Mrinali" (DesignCursor, mounted by App).
          A second, drifting cursor used to loiter on the hero frame; with the
          real pointer wearing the same arrow it just read as a duplicate. */}
      <div className="dw-content">
        {/* On desktop this header is just "Say hello" — the fixed Figma tab bar
            above (WorldTabs) already carries home, the file name and the panels.
            Below 768px that bar is gone, so this becomes the FIGMA MOBILE
            TOOLBAR: home badge, the open file, a Layers button that pulls the
            layers panel up as a bottom sheet, and Say hello as a mail icon.
            The badge wears the same Inter lowercase "mb" as the desktop tab bar
            — this world's monogram is set in the app's own UI type. */}
        <header className="dw-top">
          <a className="dw-mark" href="#/" aria-label="Mrinali Bhardwaj — home">
            mb
          </a>

          <span className="dw-mfile">
            <FigmaMark size={12} aria-hidden="true" />
            design.fig
          </span>

          <button
            type="button"
            className={`dw-mlayers${layersOpen ? " is-on" : ""}`}
            onClick={() => setLayersOpen((v) => !v)}
            aria-expanded={layersOpen}
            aria-controls="dw-layers"
          >
            <Layers size={15} strokeWidth={1.7} aria-hidden="true" />
            Layers
          </button>

          <a className="dw-hello" href={EMAIL} aria-label="Say hello by email">
            <Mail className="dw-hello-ico" size={16} strokeWidth={1.7} aria-hidden="true" />
            <span>Say hello</span>
          </a>
        </header>

        {/* One page of the file at a time. The canvas below is left at its own
            indentation rather than re-nested under this conditional — moving
            240 lines of artboards sideways would bury the actual change. */}
        {page ? (
          <ProjectPage project={page} />
        ) : (
        <div className="dw-canvas">
          {/* ============ hero: her real Figma "PROFILE.DOC" frame ============ */}
          <Frame
            frame={FRAMES[0]}
            active={activeSection === "dw-hero"}
            area="1 / span 12"
            tone="poster"
          >
            {/* a Figma comment pinned to the artboard — thread #1 of the file */}
            <a className="cvf-pin" href={EMAIL}>
              <span className="cvf-pin-dot">1</span>
              <span className="cvf-pin-note">
                <span className="cvf-pin-author">
                  <span className="cvf-pin-avatar" aria-hidden="true">M</span>
                  Mrinali
                </span>
                Open to design internships — say hello
              </span>
            </a>

            <DesignHero />
          </Frame>

          {/* ============ experience — the thread ============ */}
          {/* Reverse-chronological timeline: one hairline across the frame with
              a dot per role (the newest dot is pink) — the profile poster's
              rule-connector motif, scaled up. Type follows the profile card:
              Helvetica bold orgs, light meta, Inter-light body, slate ink. */}
          <Frame frame={FRAMES[1]} active={activeSection === "dw-exp"} area="1 / span 12">
            <h2 className="dw-h2">Experience</h2>
            <div className="dw-exp-grid">
              {experience.map((e, i) => (
                <motion.article
                  className="dw-exp"
                  key={e.org}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.5, ease: EASE, delay: i * 0.06 }}
                >
                  <p className="dw-exp-when">{e.when}</p>
                  <h3 className="dw-exp-org">{e.org}</h3>
                  <p className="dw-exp-role">{e.role}</p>
                  <p className="dw-exp-kpi">{e.kpi}</p>
                  {e.points.map((pt) => (
                    <p className="dw-exp-point" key={pt.slice(0, 24)}>
                      {pt}
                    </p>
                  ))}
                </motion.article>
              ))}
            </div>
          </Frame>

          {/* ============ selected work — a SECTION on the canvas ============ */}
          {/* Not a frame: a labelled Figma SECTION — a loose region of the
              open canvas that GROUPS the three project artboards, with no
              artboard box or selection ring of its own. The boards are the
              frames now (each its own light artboard, file-naming-joke label,
              tilt, numbered comment pin, hover-to-select chrome); this wrapper
              just holds them so they float directly on the #1E1E1E canvas.
              TODO: real case-study shots later replace the sketch inside
              .dw-board-art; everything else stays. */}
          <motion.section
            className="dw-work-section"
            id="dw-work"
            aria-label="selected work"
            style={{ gridColumn: "1 / span 12" }}
            {...reveal}
          >
            <h2 className="dw-h2">Selected work</h2>
            <div className="dw-work-canvas">
              {work.map((w, i) => (
                <motion.a
                  className={`dw-board dw-board--${w.size}`}
                  key={w.name}
                  /* its own page of this file now, not an outbound link — so
                     no target/rel, and the label says "page" not "project" */
                  href={`#/design/${w.slug}`}
                  aria-label={`${w.name} — open the project page`}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.55, ease: EASE, delay: i * 0.08 }}
                >
                  <p className="dw-board-label" aria-hidden="true">
                    {w.file}
                  </p>
                  <div className="dw-board-art">
                    <PanelSketch kind={w.sketch} />
                    <span className="dw-board-display" aria-hidden="true">
                      {w.name.toLowerCase()}
                    </span>
                    {/* comment threads continue the file's numbering: the
                        hero pin is #1, so the boards start at #2 */}
                    {/* a plain span, not a button: with the note always open
                        there is nothing to toggle, and a role="button" nested
                        inside the board's own <a> was a fake control sitting
                        on top of a real link. The note's text carries itself
                        to a screen reader now. */}
                    <span className="dw-board-pin">
                      <span className="dw-board-pin-dot" aria-hidden="true">
                        {i + 2}
                      </span>
                      <span className="dw-board-pin-note">
                        <span className="dw-board-pin-author">
                          <span className="dw-board-pin-avatar" aria-hidden="true">
                            M
                          </span>
                          Mrinali
                        </span>
                        {w.tag}
                      </span>
                    </span>
                    <span className="dw-board-handle dw-board-handle--tl" aria-hidden="true" />
                    <span className="dw-board-handle dw-board-handle--tr" aria-hidden="true" />
                    <span className="dw-board-handle dw-board-handle--bl" aria-hidden="true" />
                    <span className="dw-board-handle dw-board-handle--br" aria-hidden="true" />
                    <span className="dw-board-dims" aria-hidden="true">
                      {w.dims}
                    </span>
                  </div>
                  <div className="dw-board-meta">
                    <h3 className="dw-board-name">{w.name}</h3>
                    <p className="dw-board-what">
                      {w.what} · {w.when}
                    </p>
                    <p className="dw-board-blurb">{w.blurb}</p>
                    <p className="dw-board-open">
                      View project
                      <ArrowUpRight size={13} strokeWidth={2} aria-hidden="true" />
                    </p>

                  </div>
                </motion.a>
              ))}
            </div>
          </motion.section>

          {/* ============ skills (a dark frame on the canvas) ============ */}
          <Frame
            frame={FRAMES[3]}
            active={activeSection === "dw-skills"}
            tone="dark"
            area="1 / span 7"
          >
            <h2 className="dw-h2">Skills</h2>
            <ul className="dw-skill-chips">
              {capabilities.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
            <p className="dw-tools-line">
              Figma · Photoshop · design tokens in real code —{" "}
              <a href="#/tech">see the tech side →</a>
            </p>
          </Frame>

          {/* ============ leadership (the vermilion frame) ============ */}
          <Frame
            frame={FRAMES[4]}
            active={activeSection === "dw-lead"}
            tone="accent"
            area="6 / span 7"
          >
            <h2 className="dw-h2">Leadership</h2>
            <div className="dw-lead-grid">
              <article>
                <h3>Riviera&rsquo;26 — Design Coordinator</h3>
                <p>
                  Visual identity + official website for a 30,000-participant
                  fest — 80,000+ site visits, 150+ assets produced.
                </p>
              </article>
              <article>
                <h3>E-Cell — Design Executive</h3>
                <p>
                  Led the design department across 8+ large-scale events,
                  mentoring 75+ student designers.
                </p>
              </article>
            </div>
          </Frame>

          {/* ============ contact — the "and that's a wrap" finale ============ */}
          <Frame frame={FRAMES[5]} active={activeSection === "dw-contact"} area="1 / span 12">
            <div className="dwc">
              {/* the display type wraps the envelope: top-right + bottom-left */}
              <p className="dwc-big dwc-big--tr" aria-hidden="true">
                and
                <br />
                that&rsquo;s
              </p>
              <h2 className="dwc-big dwc-big--bl">a wrap.</h2>

              {/* channels, top-left — real destinations, not the mockup's handles */}
              <ul className="dwc-links" aria-label="Get in touch">
                <li>
                  <a href={EMAIL}>
                    <span className="dwc-ico" aria-hidden="true">
                      <Mail size={22} strokeWidth={1.5} />
                    </span>
                    mrinalibhardwaj0705@gmail.com
                  </a>
                </li>
                <li>
                  <a href={LINKEDIN} target="_blank" rel="noreferrer">
                    <span className="dwc-ico dwc-ico--txt" aria-hidden="true">
                      in
                    </span>
                    LinkedIn
                  </a>
                </li>
                <li>
                  <a href={BEHANCE} target="_blank" rel="noreferrer">
                    <span className="dwc-ico dwc-ico--txt" aria-hidden="true">
                      Bē
                    </span>
                    Behance
                  </a>
                </li>
              </ul>

              <div className="dwc-sec">
                <a href="/resume-design.docx" download>
                  Design resume <span aria-hidden="true">&darr;</span>
                </a>
              </div>

              {/* the opened envelope + handwritten sign-off — her own photo,
                  a single true-transparent PNG (envelope and note already
                  composited and tucked). The note text is baked into the image,
                  so it lives in the alt. */}
              <div className="dwc-env">
                <img
                  className="dwc-env-photo"
                  src="/contact-envelope.webp"
                  alt="A handwritten note tucked in a pink envelope: Thank you so much for taking the time to look through my portfolio! I truly appreciate new opportunities to learn and grow. If you're interested in working together, I'd love to chat!"
                  draggable="false"
                />
              </div>
            </div>
          </Frame>
        </div>
        )}
      </div>
    </div>
  );
}
