// DESIGN WORLD: the portfolio as an open Figma file. The page is the dark
// #1E1E1E canvas; the content lives on light artboard FRAMES scattered
// across it, each with a frame-name label. The scroll-spy SELECTS frames —
// blue ring, corner handles, dimension pill — exactly like clicking one in
// Figma, and the layers panel + properties panel track the selection.
// Chrome speaks Inter (Figma's UI font); the hero headline keeps the wide
// Archivo display type — the one identity thread shared across surfaces.
import { motion } from "framer-motion";
import { ArrowUpRight, Mail } from "lucide-react";
import FigmaPanel from "./FigmaPanel.jsx";
import WorldTabs from "./WorldTabs.jsx";
import DesignHero from "./DesignHero.jsx";
import useSectionSpy from "./useSectionSpy.js";

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

// one entry per section-frame: layers-panel children + properties-panel data
const FRAMES = [
  {
    id: "dw-hero",
    name: "profile",
    props: { x: 0, y: 0, w: 1316, h: 741, fill: "#4A4A58" },
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
    props: { x: 240, y: 1440, w: 1200, h: 620, fill: "#F6F5F2" },
    children: [
      { icon: "image", name: "Public Pulse" },
      { icon: "image", name: "Meal Maestro" },
      { icon: "image", name: "Futurepreneurs 10.0" },
    ],
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

/* Faint wireframe ghosts for the work panels — each project rendered as
   design-work-in-progress (cream strokes at ~13% on the slate field). Three
   hand-tuned arrangements, matched to what each project actually was:
   "screens" = web + mobile pair, "app" = a phone with a component beside it,
   "brand" = mark + wordmark lines + Figma's component diamond. Decorative
   only (aria-hidden); the real case-study shots replace nothing here — they
   join the panel later and these ghosts bow out. */
function PanelSketch({ kind }) {
  const s = {
    fill: "none",
    stroke: "rgba(246, 245, 242, 0.14)",
    strokeWidth: 1.3,
  };
  if (kind === "screens") {
    return (
      <svg className="dw-card-sketch" viewBox="0 0 220 132" aria-hidden="true">
        <rect x="8" y="14" width="128" height="86" rx="3" {...s} />
        <path d="M8 30h128" {...s} />
        <circle cx="16" cy="22" r="2.5" {...s} />
        <circle cx="25" cy="22" r="2.5" {...s} />
        <rect x="20" y="44" width="52" height="30" rx="2" {...s} />
        <path d="M20 84h64M20 92h44" {...s} />
        <rect x="152" y="34" width="56" height="92" rx="8" {...s} />
        <path d="M152 50h56M172 118h16" {...s} />
      </svg>
    );
  }
  if (kind === "app") {
    return (
      <svg className="dw-card-sketch" viewBox="0 0 220 132" aria-hidden="true">
        <rect x="78" y="6" width="62" height="120" rx="9" {...s} />
        <path d="M78 26h62M78 106h62" {...s} />
        <circle cx="109" cy="52" r="14" {...s} />
        <path d="M91 76h36M91 86h24" {...s} />
        <rect x="156" y="32" width="42" height="42" rx="4" {...s} />
        <path d="M156 46h42" {...s} />
      </svg>
    );
  }
  // brand
  return (
    <svg className="dw-card-sketch" viewBox="0 0 220 132" aria-hidden="true">
      <circle cx="58" cy="64" r="32" {...s} />
      <path d="M106 48h76M106 62h56M106 76h66" {...s} />
      <path d="M172 92l11 11-11 11-11-11Z" {...s} />
    </svg>
  );
}

/* one artboard on the canvas. When it's the active section it wears Figma's
   selection: blue ring, four corner handles, a dimension pill below. */
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
          <span className="dwp-swatch" style={{ background: p.fill }} />
          <span className="dwp-v">{p.fill.replace("#", "")}</span>
          <span className="dwp-k">100%</span>
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

// Every work is a LINK. TODO: she supplies the real per-project URLs
// (Behance case studies / live sites); until then each opens her Behance
// profile so the affordance is honest, never dead.
const work = [
  {
    name: "Public Pulse",
    what: "Civic-issue platform · web & mobile",
    when: "Sep 2025",
    tag: "SIH national finalist",
    blurb:
      "End-to-end product design for citizen-reported civic issues — capture, feeds, voting — shortlisted for the Smart India Hackathon finals.",
    size: "lg",
    href: BEHANCE,
    sketch: "screens",
  },
  {
    name: "Meal Maestro",
    what: "UI design",
    when: "Mar 2025",
    tag: "GDG Design-a-thon · 3rd",
    blurb:
      "A smart meal-planning app: personalized recipes and grocery lists from user preferences.",
    size: "sm",
    href: BEHANCE,
    sketch: "app",
  },
  {
    name: "Futurepreneurs 10.0",
    what: "Branding & UI",
    when: "Oct 2024",
    tag: "2,200+ registrations",
    blurb:
      "Full identity and digital assets — website, social, reels, brochures — driving 10,000+ views.",
    size: "wide",
    href: BEHANCE,
    sketch: "brand",
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

export default function DesignWorld() {
  const [activeSection, selectFrame] = useSectionSpy(SECTION_IDS);
  const activeFrame =
    FRAMES.find((f) => f.id === activeSection) || FRAMES[0];

  return (
    <div className="dw">
      {/* the open-pages strip: this world and its sibling as Figma file tabs */}
      <WorldTabs world="design" />

      {/* left: layers. right: properties. the canvas sits between. */}
      <FigmaPanel
        frames={FRAMES}
        activeId={activeSection}
        onSelect={selectFrame}
      />
      <PropsPanel frame={activeFrame} />

      {/* the file's one collaborator cursor is the VISITOR's own — a pink arrow
          (design-world.css) tagged "Mrinali" (DesignCursor, mounted by App).
          A second, drifting cursor used to loiter on the hero frame; with the
          real pointer wearing the same arrow it just read as a duplicate. */}
      <div className="dw-content">
        {/* the mobile home badge: on desktop the title-bar "mb" (WorldTabs)
            owns home, so this one only shows once the tab strip is gone (≤768).
            "Say hello" stays on both. */}
        <header className="dw-top">
          <a className="dw-mark" href="#/" aria-label="Mrinali Bhardwaj — home">
            MB
          </a>
          <a className="dw-hello" href={EMAIL}>
            Say hello
          </a>
        </header>

        <div className="dw-canvas">
          {/* ============ hero: her real Figma "PROFILE.DOC" frame ============ */}
          <Frame
            frame={FRAMES[0]}
            active={activeSection === "dw-hero"}
            area="1 / span 12"
            tone="poster"
          >
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

          {/* ============ selected work — clickable artboards ============ */}
          {/* Each work is one big link. The visual is a slate #4a4a58 panel
              (the profile's ink as a field) carrying the project name in the
              contact card's display voice (Archivo 900, lowercase); the pink
              tag chip sits on the panel; hovering deepens the panel and slides
              in the ↗. TODO: swap the name-panels for real case-study shots
              when she supplies them — the panel div stays and gains an image. */}
          <Frame frame={FRAMES[2]} active={activeSection === "dw-work"} area="3 / span 10">
            <h2 className="dw-h2">Selected work</h2>
            <div className="dw-work-grid">
              {work.map((w, i) => (
                <motion.a
                  className={`dw-card dw-card--${w.size}`}
                  key={w.name}
                  href={w.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`${w.name} — open the project`}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.55, ease: EASE, delay: i * 0.06 }}
                >
                  <div className="dw-card-visual">
                    <PanelSketch kind={w.sketch} />
                    <span className="dw-card-tag">{w.tag}</span>
                    <span className="dw-card-display" aria-hidden="true">
                      {w.name.toLowerCase()}
                    </span>
                    <ArrowUpRight
                      className="dw-card-arrow"
                      size={20}
                      strokeWidth={1.6}
                      aria-hidden="true"
                    />
                  </div>
                  <h3 className="dw-card-name">{w.name}</h3>
                  <p className="dw-card-what">
                    {w.what} · {w.when}
                  </p>
                  <p className="dw-card-blurb">{w.blurb}</p>
                  <p className="dw-card-open">View project</p>
                </motion.a>
              ))}
            </div>
          </Frame>

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
                  src="/contact-envelope.png"
                  alt="A handwritten note tucked in a pink envelope: Thank you so much for taking the time to look through my portfolio! I truly appreciate new opportunities to learn and grow. If you're interested in working together, I'd love to chat!"
                  draggable="false"
                />
              </div>
            </div>
          </Frame>
        </div>
      </div>
    </div>
  );
}
