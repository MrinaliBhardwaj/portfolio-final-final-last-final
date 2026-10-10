// The design world's hero: an EXACT reproduction of Mrinali's Figma frame
// "Frame 19" (PROFILE.DOC) — file drda7TnqoM3fEpbibCDIc2, node 208:260.
//
// The frame is a fixed 1316×741 poster. Every element sits at its real
// Figma-space coordinate, converted to responsive units by `--u`
// (= 100cqw / 1316, set on .dwh in design-world.css) — the same fixed-stage
// trick the notes scrapbook uses. U(n) turns a Figma pixel into a scaling
// length; DON'T hand-tune these numbers, they came straight from the file.
//
// Raster art is vendored under public/design-hero/ (downloaded from the Figma
// asset API — see DECISIONS.md). The folder icon is one export reused ×3.
//
// KNOWN (baked into her asset, flagged to her): the tab reads "PROFTLE.DOC",
// a typo for "PROFILE.DOC". It lives in profile-tab.png and can't be fixed in
// code — awaiting a corrected export if she wants it.
const U = (n) => `calc(${n} * var(--u))`;
const A = "/design-hero";

// The same trick for her MOBILE frame — node 361:489, "iPhone 16 - 1", a
// 393×852 artboard. `--um` (= 100cqw / 393) is set on .dwh-m-stage.
const UM = (n) => `calc(${n} * var(--um))`;

// the intro copy, shared by the fixed poster and the mobile reflow below
const INTRO =
  "I am an aspiring design engineer based in India, currently pursuing a bachelors degree in computer science at VIT University. My academic background allows me to work at the intersection of tech and design";

// four experience entries — {block x,y, alignment, and the four lines}
const EXPERIENCE = [
  {
    x: 5.94, y: 65.27, align: "left",
    kind: "Leadership", role: "Design Executive",
    org: "Entrepreneurship Cell", date: "Jan 2024 – Jan 2025",
  },
  {
    x: 265.36, y: 65.27, align: "right",
    kind: "Internship", role: "Graphic Designer",
    org: "Moon Finance", date: "Jan 2025 – Jul 2025",
  },
  {
    x: 5.47, y: 185.69, align: "left",
    kind: "Freelance", role: "Design Engineer",
    org: "NextG Apex", date: "June 2026 - July 2026",
  },
  {
    x: 272.11, y: 186.42, align: "right",
    kind: "Freelance", role: "UI/ UX Designer",
    org: "LUMA Technologies", date: "Jul 2025 - Oct 2025",
  },
];

// three education entries, stacked in the education group
const EDUCATION = [
  { y: 37.42, title: "Google UX Design Certificate", sub: "Coursera(‘25)" },
  {
    y: 77.61, title: "B.Tech in Computer Science and Engineering",
    sub: "Vellore Institute of Technology (‘23-’27) CGPA: 8.34",
  },
  {
    y: 120.61, title: "Senior Secondary Education(CBSE)",
    sub: "Delhi World Public School (‘23)",
  },
];

// the folder artwork's own size in Figma units, shared by the image element
// below and by the label centring
const FOLDER_W = 64.107;
const FOLDER_H = 64.198;

// The three Skill-Set folders: {folder x,y} and its {label y,w + lines}.
//
// The label's X IS DERIVED, not stored. It used to be an `lx` per row (12, 134,
// 254) and every one of them was about a folder-width too far left, so each name
// sat ~41px to the left of the folder it belongs to instead of under it — the
// labels are `align-items: center`, so the intent was always centred. Centring
// them off `fx` means the two cannot drift apart again, whatever the artwork
// does next.
const SKILLS = [
  { fx: 64.107, fy: 28.07, ly: 104, lw: 36, label: ["UI/UX", "Design"] },
  { fx: 188.28, fy: 55.18, ly: 133, lw: 47, label: ["Branding"] },
  { fx: 305, fy: 12.29, ly: 89, lw: 41, label: ["Graphic", "Design"] },
];

// centre of the folder, minus half the label box
const skillLabelX = (s) => s.fx + (FOLDER_W - s.lw) / 2;

// ---------------------------------------------------------------------------
// HER MOBILE FRAME'S OWN NUMBERS (node 361:489). Same content, re-composed by
// her for a phone — so these are a second set of real coordinates, not the
// poster's scaled down.
//
// Experience is a 2×2 again but tighter: blocks 129.917 wide, the four lines
// at a shared 0 / 13.43 / 29.62 / 46.6, dates centred under the block. In the
// file the right-hand column reaches its alignment with a per-line x offset;
// here the block is simply `text-align: right`, which lands in the same place
// and survives a font that measures differently from her Helvetica.
// `w` is the block's ALIGNMENT width, which is not its box width in the file.
// Her right-hand blocks are 129.917 boxes whose lines all end at about x=100
// inside them — the file reaches that with a per-line offset on the left
// column and an explicit right edge on the other. Taking the box at face value
// put the right column 30px further right, hanging 3px off the sheet. 100 is
// where her text actually ends; the sheet's inner edge is 28px beyond it.
const M_EXP = [
  { x: 4.95, y: 54.38, w: 129.917, align: "left", kind: "Leadership", role: "Design Executive", org: "Entrepreneurship Cell", date: "Jan 2024 – Jan 2025", rs: 11.152 },
  { x: 198, y: 51.79, w: 100, align: "right", kind: "Internship", role: "Graphic Designer", org: "Moon Finance", date: "Jan 2025 – Jul 2025", rs: 12.635 },
  { x: 4.55, y: 134.71, w: 129.917, align: "left", kind: "Freelance", role: "Design Engineer", org: "NextG Apex", date: "June 2026 - July 2026", rs: 12.635 },
  { x: 198, y: 134.79, w: 100, align: "right", kind: "Freelance", role: "UI/ UX Designer", org: "LUMA Technologies", date: "Jul 2025 - Oct 2025", rs: 12.636 },
];

// the three hand-drawn connectors between the columns, and the tick at the
// sheet's right edge. All three are in the file; none is decorative licence.
const M_RULES = [
  { x: 122.84, y: 83.3, w: 66.16, rot: 0.41 },
  { x: 114.78, y: 165.02, w: 70.98, rot: 0 },
  { x: 325.7, y: 124.02, w: 21.132, rot: -90 },
];

// folder centres, and the label centred under each — stored as the centre
// because that is how the file positions them (translate -50%, -50%)
const M_FOLDER_W = 43.583;
const M_FOLDER_H = 43.645;
const M_SKILLS = [
  { cx: 33.79, cy: 44.31, lx: 32.66, ly: 74.1, label: ["UI/UX", "Design"] },
  { cx: 104.79, cy: 93.22, lx: 105.68, ly: 124.3, label: ["Branding"] },
  { cx: 46.79, cy: 137.22, lx: 47.91, ly: 167.55, label: ["Graphic", "Design"] },
];

function MobileExperience({ e }) {
  // the three top lines hang off whichever edge the column aligns to; the date
  // is centred across the block, as it is on the poster
  const side = e.align === "right" ? "right" : "left";
  return (
    <div className="dwh-m-xp" style={{ left: UM(e.x), top: UM(e.y), width: UM(e.w) }}>
      <span className="dwh-m-xp-kind" style={{ top: UM(0), fontSize: UM(9.477), [side]: 0 }}>{e.kind}</span>
      <span className="dwh-m-xp-role" style={{ top: UM(13.43), fontSize: UM(e.rs), [side]: 0 }}>{e.role}</span>
      <span className="dwh-m-xp-org" style={{ top: UM(29.62), fontSize: UM(11.122), [side]: 0 }}>{e.org}</span>
      <span className="dwh-m-xp-date" style={{ top: UM(46.6), fontSize: UM(9.476) }}>{e.date}</span>
    </div>
  );
}

function ExperienceEntry({ e }) {
  const right = e.align === "right";
  return (
    <div
      className="dwh-xp"
      style={{ left: U(e.x), top: U(e.y), width: U(155.93), textAlign: e.align }}
    >
      <span className="dwh-xp-kind" style={{ fontSize: U(11.375), top: U(0), [right ? "right" : "left"]: 0 }}>
        {e.kind}
      </span>
      <span className="dwh-xp-role" style={{ fontSize: U(15.165), top: U(16.11), [right ? "right" : "left"]: 0 }}>
        {e.role}
      </span>
      <span className="dwh-xp-org" style={{ fontSize: U(13.349), top: U(35.55), [right ? "right" : "left"]: 0 }}>
        {e.org}
      </span>
      <span className="dwh-xp-date" style={{ fontSize: U(11.374), top: U(55.93) }}>
        {e.date}
      </span>
    </div>
  );
}

export default function DesignHero() {
  return (
    <div className="dwh">
      {/* painted lotus-pond background (her real bg, exported frame-clipped) */}
      <img
        className="dwh-bg"
        src={`${A}/bg-pond.webp`}
        alt=""
        aria-hidden="true"
        style={{ left: U(0), top: U(0), width: U(1316), height: U(741) }}
      />

      {/* the cream sheet */}
      <div className="dwh-sheet" style={{ left: U(55), top: U(67), width: U(1206), height: U(607) }} />

      {/* the manila PROFTLE.DOC folder tab (her typo, baked in). Cropped from
          the rendered frame at its exact spot, so the painting behind it in the
          crop realigns with the real painting — seamless. */}
      <img
        className="dwh-tab"
        src={`${A}/profile-tab.png`}
        alt="PROFILE.DOC"
        style={{ left: U(4), top: U(0), width: U(400), height: U(72) }}
      />

      {/* childhood photo — blue bucket hat, bleeds off the sheet's lower-left */}
      <img
        className="dwh-photo"
        src={`${A}/mini-mri.webp`}
        alt="Mrinali as a child in a blue bucket hat"
        style={{ left: U(-61), top: U(238), width: U(483.556), height: U(519) }}
      />

      {/* pink tiger, bottom-right, anchored to its bottom edge */}
      <img
        className="dwh-tiger"
        src={`${A}/tiger.webp`}
        alt=""
        aria-hidden="true"
        style={{ left: U(922), top: U(318), width: U(593), height: U(593) }}
      />

      {/* lotus flourish, bottom-centre. Her node crop-fills a tall image down to
          a wide band; cropped from the render at the exact node box so it shows
          the full-width flourish (not the whole image shrunk into a sliver). */}
      <img
        className="dwh-flourish"
        src={`${A}/flourish.png`}
        alt=""
        aria-hidden="true"
        style={{ left: U(726), top: U(602), width: U(115), height: U(37) }}
      />

      {/* headline */}
      <span className="dwh-meet" style={{ left: U(137), top: U(135), fontSize: U(27.31) }}>
        Meet
      </span>
      <span className="dwh-name" style={{ left: U(210), top: U(106), fontSize: U(64) }}>
        Mrinali Bhardwaj!
      </span>

      {/* intro */}
      <p className="dwh-intro" style={{ left: U(205), top: U(190), width: U(989), fontSize: U(16.778) }}>
        {INTRO}
      </p>

      {/* Opens the résumé for VIEWING, not a forced download — a recruiter
          skimming on a phone doesn't want a surprise file landing in
          Downloads before they've decided whether to keep it. A PDF renders
          in the browser's own viewer (Chrome, Edge, Firefox and Safari all
          have one built in), which has its own save button if they want it —
          exactly the read-first model of a shared Google Drive link. */}
      <a
        className="dwh-download"
        href="/resume-design.pdf"
        target="_blank"
        rel="noreferrer"
        style={{ left: U(1095), top: U(94), fontSize: U(14) }}
      >
        View Resume
        <span className="dwh-download-arrow" aria-hidden="true">↗</span>
      </a>

      {/* ============ EXPERIENCE (2×2) ============ */}
      <div className="dwh-group dwh-exp" style={{ left: U(354), top: U(212), width: U(421.29), height: U(349) }}>
        <span className="dwh-head" style={{ left: U(3.53), top: U(34.63), fontSize: U(18) }}>
          Experience
        </span>
        {EXPERIENCE.map((e) => (
          <ExperienceEntry key={e.role} e={e} />
        ))}
        {/* the connector rules */}
        <span className="dwh-rule" style={{ left: U(147.44), top: U(99.98), width: U(102.34) }} />
        <span className="dwh-rule" style={{ left: U(166.57), top: U(223.27), width: U(85.19) }} />
        {/* vertical divider between the Moon Finance and LUMA boxes. It's a
            ROTATED line node — metadata reports y=174.21 (post-rotation bbox),
            but its true visual top is 148.85, centring it in the gap. */}
        <span className="dwh-rule dwh-rule--v" style={{ left: U(390.92), top: U(148.85), height: U(25.36) }} />

        {/* softwares — "Softwares" label + the four grey tiles, cropped from
            the render (correctly composited over cream, so it drops onto the
            sheet seamlessly; the semi-transparent tiles can't be a clean
            standalone PNG). The label is part of the crop. */}
        <div className="dwh-soft" style={{ left: U(-13), top: U(244.45), width: U(286), height: U(190.67) }}>
          <img
            className="dwh-soft-img"
            src={`${A}/softwares.png`}
            alt="Softwares: Figma, Photoshop, Illustrator, VS Code"
            style={{ left: U(9), top: U(17.55), width: U(264), height: U(108) }}
          />
        </div>
      </div>

      {/* ============ SKILL SET ============ */}
      <div className="dwh-group" style={{ left: U(826), top: U(252), width: U(253), height: U(114.8) }}>
        <span className="dwh-head" style={{ left: U(0), top: U(-5), fontSize: U(18) }}>
          Skill Set
        </span>
        {SKILLS.map((s, i) => (
          <img
            key={i}
            className="dwh-folder"
            src={`${A}/folder.png`}
            alt=""
            aria-hidden="true"
            style={{ left: U(s.fx), top: U(s.fy), width: U(FOLDER_W), height: U(FOLDER_H) }}
          />
        ))}
        {SKILLS.map((s, i) => (
          <span
            key={`l${i}`}
            className="dwh-skill-label"
            style={{
              left: U(skillLabelX(s)),
              top: U(s.ly),
              width: U(s.lw),
              fontSize: U(11),
            }}
          >
            {s.label.map((line, j) => (
              <span key={j}>{line}</span>
            ))}
          </span>
        ))}
      </div>

      {/* ============ EDUCATION ============ */}
      <div className="dwh-group" style={{ left: U(826), top: U(420), width: U(291), height: U(112.79) }}>
        <span className="dwh-head" style={{ left: U(-2), top: U(-0.49), fontSize: U(18) }}>
          Education
        </span>
        {EDUCATION.map((ed) => (
          <div key={ed.title} className="dwh-edu" style={{ top: U(ed.y) }}>
            <span className="dwh-edu-title" style={{ fontSize: U(14.099) }}>{ed.title}</span>
            <span className="dwh-edu-sub" style={{ top: U(18.07), fontSize: U(12.411) }}>{ed.sub}</span>
          </div>
        ))}
      </div>

      {/* ============ MOBILE: HER OWN MOBILE FRAME ============ */}
      {/* Figma node 361:489, "iPhone 16 - 1" — 393×852.

          What was here before was a REFLOW: the poster's content re-stacked
          into one readable column, written because the 1316×741 poster shrinks
          to ~4px type on a phone. It was legible and it was not her design.
          She drew a mobile frame, so this is that frame, composed the way the
          poster is composed — a fixed stage at her coordinates, scaled by
          `--um` (= 100cqw / 393). The poster's own layers stay hidden below
          768px; only the stage changes.

          Every asset is already vendored for the poster and reused as-is: the
          pond painting (twice, at her two offsets), the PROFILE.DOC tab, the
          childhood photo, the softwares crop, the folder ×3. Nothing new was
          downloaded, so nothing can expire. */}
      <div className="dwh-m">
        <div className="dwh-m-stage">
          {/* the painting, bleeding past the sheet on every side */}
          <img className="dwh-m-bg" src={`${A}/bg-pond.webp`} alt="" aria-hidden="true"
            style={{ left: UM(-860), top: UM(154), width: UM(1521.429), height: UM(852) }} />
          <img className="dwh-m-bg" src={`${A}/bg-pond.webp`} alt="" aria-hidden="true"
            style={{ left: UM(-561), top: UM(-66), width: UM(1251.786), height: UM(701) }} />

          {/* the cream sheet: 340×665, centred */}
          <div className="dwh-m-sheet"
            style={{ left: UM(27), top: UM(94), width: UM(340), height: UM(665) }} />

          <img className="dwh-m-tab" src={`${A}/profile-tab.png`} alt="" aria-hidden="true"
            style={{ left: UM(-7), top: UM(16), width: UM(289), height: UM(79.377) }} />

          <span className="dwh-m-meet" style={{ left: UM(52.01), top: UM(104.97), fontSize: UM(20) }}>
            Meet
          </span>
          <span className="dwh-m-name" style={{ left: UM(47), top: UM(127.33), fontSize: UM(43.244) }}>
            Mrinali Bhardwaj!
          </span>

          {/* Her frame sets this 8.737px, top-right. The TYPE is hers and is
              kept; the HIT AREA is not something a design file expresses, and
              a ~9px target fails WCAG 2.5.5 badly on the one device this frame
              is for. The padding below takes it past 44px without moving a
              pixel of the composition. */}
          <a className="dwh-m-download" href="/resume-design.pdf" target="_blank" rel="noreferrer"
            style={{ left: UM(284), top: UM(103), fontSize: UM(8.737) }}>
            View Resume
            <span className="dwh-m-download-arrow" aria-hidden="true">↗</span>
          </a>

          <p className="dwh-m-intro"
            style={{ left: UM(42), top: UM(180), width: UM(309), fontSize: UM(12) }}>
            {INTRO}
          </p>

          {/* ---- experience, softwares ---- */}
          <div className="dwh-m-group"
            style={{ left: UM(41), top: UM(244.21), width: UM(351), height: UM(290.773) }}>
            <span className="dwh-m-head" style={{ left: UM(2.94), top: UM(28.85), fontSize: UM(14.997) }}>
              Experience
            </span>
            {M_EXP.map((e) => (
              <MobileExperience key={e.role + e.org} e={e} />
            ))}
            {M_RULES.map((r, i) => (
              <span key={i} className="dwh-m-rule"
                style={{ left: UM(r.x), top: UM(r.y), width: UM(r.w), transform: `rotate(${r.rot}deg)` }} />
            ))}
            {/* the crop carries its own "Softwares" label above the tiles, so
                her separate label node is deliberately NOT rendered — drawing
                it would print the word twice */}
            <img className="dwh-m-soft" src={`${A}/softwares.png`}
              alt="Softwares: Figma, Photoshop, Illustrator, VS Code"
              style={{ left: UM(125), top: UM(200), width: UM(161), height: UM(66) }} />
          </div>

          {/* the childhood photo, over the sheet's bottom-left corner */}
          <img className="dwh-m-photo" src={`${A}/mini-mri.webp`}
            alt="Mrinali as a child in a blue bucket hat"
            style={{ left: UM(-48), top: UM(435.35), width: UM(303), height: UM(325.209) }} />

          {/* ---- skill set ---- */}
          <div className="dwh-m-group"
            style={{ left: UM(207), top: UM(553.6), width: UM(126.582), height: UM(185.553) }}>
            <span className="dwh-m-head" style={{ left: UM(0), top: UM(-7), fontSize: UM(15) }}>
              Skill Set
            </span>
            {M_SKILLS.map((s, i) => (
              <img key={i} className="dwh-m-folder" src={`${A}/folder.png`} alt="" aria-hidden="true"
                style={{
                  left: UM(s.cx - M_FOLDER_W / 2), top: UM(s.cy - M_FOLDER_H / 2),
                  width: UM(M_FOLDER_W), height: UM(M_FOLDER_H),
                }} />
            ))}
            {M_SKILLS.map((s, i) => (
              <span key={`l${i}`} className="dwh-m-skill-label"
                style={{ left: UM(s.lx), top: UM(s.ly), fontSize: UM(7.478) }}>
                {s.label.map((line, j) => (
                  <span key={j}>{line}</span>
                ))}
              </span>
            ))}
          </div>
        </div>

        {/* EDUCATION IS NOT IN HER MOBILE FRAME. The poster has it, the phone
            frame does not — and three real credentials (a Google certificate,
            the B.Tech with its CGPA, the CBSE line) are not mine to delete on
            the strength of one artboard. It continues below the stage in the
            sheet's own type, where it reads as the document carrying on past
            the fold. Say the word and it goes. */}
        <section className="dwh-m-edu">
          <h3 className="dwh-m-edu-h">Education</h3>
          {EDUCATION.map((ed) => (
            <div className="dwh-m-edu-row" key={ed.title}>
              <p className="dwh-m-edu-title">{ed.title}</p>
              <p className="dwh-m-edu-sub">{ed.sub}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}
