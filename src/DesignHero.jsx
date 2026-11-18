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
// FIXED 11 Oct 2026: the tab read "PROFTLE.DOC", a typo for "PROFILE.DOC",
// baked into profile-tab.png and still present in the Figma file. It was
// repaired in the asset rather than waiting for a re-export: in this serif
// typewriter face a capital I is the T's stem and foot under a narrow top
// serif, so the crossbar's outer arms were cleared to the paper directly above
// them, and the glyph's own foot was mirrored up to form the top serif. Both
// the poster and the mobile frame use that one file, so both read correctly.
// THE FIGMA FILE STILL SAYS PROFTLE — a re-export would undo this.
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
// THE MOBILE FRAME — HER ARTBOARD, AT HER SIZE (18 Nov 2026).
//
// Figma node 361:489, "iPhone 16 - 1": 393x852, a cream sheet 340x665 inset
// 27px, everything on it at her coordinates. This replaces a 393x1100 reflow
// that had raised the type to a 15px body and spread every section to pay for
// it; she called the spacing wrong and the frame too long. The positions below
// are hers, read from the file. Two things are deliberately NOT hers:
//
//   RAILS. Her frame has six left edges (intro 42, "Meet" 52, name 47, the
//   experience head 44, its blocks 46) and two right ones (intro 351, the
//   experience column 339). Content now starts on CL and ends on CR, which sit
//   on her intro, the widest thing on the sheet.
//
//   ONE TYPE SCALE. Her file mixes 12.636 / 11.152 for the same role line,
//   11.122 / 12 for org and intro, and 9.477 / 8.737 / 7.478 for the small
//   lines. Four sizes now, one per job: display (the name), heading 15,
//   text 12 (intro, role, org), small 10 (kind, date, the resume link, the
//   skill labels). Her 7.5px skill labels come up to the small size with the
//   rest; nothing else moves.
const SHEET_X = 27;
const SHEET_W = 340;
const SHEET_Y = 94;
const SHEET_H = 665;                  // 94 -> 759, hers
const STAGE_W = 393;                  // x 852 tall — see .dwh-m-stage
const CL = 44;                        // the left rail
const CR = 349;                       // the right rail
const CW = CR - CL;                   // 305 — her intro is 309

const T = {
  meet: 20, name: 43.244, head: 15,
  text: 12, small: 10,
};

// Experience: her two rows, her line offsets inside a block.
const COL_L = 120;                    // clears "Entrepreneurship Cell"
const COL_R = 110;                    // clears "LUMA Technologies"
const ROW_Y = [296, 379];
const XP_LINE = { kind: 0, role: 13.4, org: 29.6, date: 46.6 };

const M_EXP = [
  { x: CL, y: ROW_Y[0], w: COL_L, align: "left", kind: "Leadership", role: "Design Executive", org: "Entrepreneurship Cell", date: "Jan 2024 – Jan 2025" },
  { x: CR - COL_R, y: ROW_Y[0], w: COL_R, align: "right", kind: "Internship", role: "Graphic Designer", org: "Moon Finance", date: "Jan 2025 – Jul 2025" },
  { x: CL, y: ROW_Y[1], w: COL_L, align: "left", kind: "Freelance", role: "Design Engineer", org: "NextG Apex", date: "June 2026 - July 2026" },
  { x: CR - COL_R, y: ROW_Y[1], w: COL_R, align: "right", kind: "Freelance", role: "UI/ UX Designer", org: "LUMA Technologies", date: "Jul 2025 - Oct 2025" },
];

// The connectors, in the gutter between the columns at her height (327.5 and
// 409.2 in the file). Her third rule, a vertical tick at the sheet's right
// edge, connects nothing and reads as an artifact, so it stays dropped.
const GUT_L = CL + COL_L;             // 164
const GUT_R = CR - COL_R;             // 239
const M_RULES = ROW_Y.map((y) => ({ x: GUT_L + 5, y: y + 31, w: GUT_R - GUT_L - 10 }));

// THE FOLDER TAB, DERIVED FROM THE SHEET RATHER THAN PLACED AGAINST IT.
//
// profile-tab.png is a 400x72 crop taken from the rendered poster, and only
// x 50..319 / y 21..71 of it is folder — the rest was opaque pond-painting.
// profile-tab-cut.png is the same artwork with everything but the folder cut
// to alpha, so the real background shows through. x=50 in the asset is the
// folder's left edge and y=67 is where its body begins, so those land on the
// sheet's left edge and top.
const TAB_W = 289;                       // her node's width, and it was right
const TAB_K = TAB_W / 400;               // asset px -> stage units
const TAB_H = 72 * TAB_K;                // the asset's own aspect, not her box
const TAB_X = SHEET_X - 50 * TAB_K;      // folder left edge == sheet left edge
const TAB_Y = SHEET_Y - 67 * TAB_K;      // folder body top  == sheet top

// SOFTWARES. softwares.png has the word "Softwares" baked in above the tiles,
// at whatever size the crop is drawn — at her width that was ~11px, under a
// 15px "Experience" and "Skill Set". softwares-tiles.png is the same asset with
// the word cut off (rows 44..107), and the heading is real text on the scale.
const SOFT_W = 175;
const SOFT_H = SOFT_W * (64 / 264);
const SOFT_X = CR - SOFT_W;              // 174 — her tiles start at ~176
const SOFT_HEAD_X = SOFT_X + 5 * (SOFT_W / 264); // the first tile's edge
const SOFT_HEAD_Y = 461;                 // her label, 460.5
const SOFT_Y = 484;

// The photo bleeds off the left and stands on the sheet's bottom edge: her
// node, (-48, 435.35) 303x325.2.
const PHOTO_W = 303;
const PHOTO_H = 325.209;
const PHOTO_X = -48;
const PHOTO_Y = 435.35;

// Skill Set: her heading at (207, 546.6) and her three folder centres,
// recovered from the group's centre-relative offsets.
const SKILL_X = 207;
const SKILL_Y = 548;
const M_FOLDER = 44;                     // hers is 43.6
const M_SKILLS = [
  { cx: 240.8, cy: 597.9, label: ["UI/UX Design"] },
  { cx: 311.8, cy: 646.8, label: ["Branding"] },
  { cx: 253.8, cy: 690.8, label: ["Graphic Design"] },
];

function MobileExperience({ e }) {
  // the three top lines hang off whichever rail the column aligns to; the date
  // is centred across the block, as it is on the poster
  const side = e.align === "right" ? "right" : "left";
  return (
    <div className="dwh-m-xp" style={{ left: UM(e.x), top: UM(e.y), width: UM(e.w) }}>
      <span className="dwh-m-xp-kind" style={{ top: UM(XP_LINE.kind), fontSize: UM(T.small), [side]: 0 }}>{e.kind}</span>
      <span className="dwh-m-xp-role" style={{ top: UM(XP_LINE.role), fontSize: UM(T.text), [side]: 0 }}>{e.role}</span>
      <span className="dwh-m-xp-org" style={{ top: UM(XP_LINE.org), fontSize: UM(T.text), [side]: 0 }}>{e.org}</span>
      <span className="dwh-m-xp-date" style={{ top: UM(XP_LINE.date), fontSize: UM(T.small) }}>{e.date}</span>
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

      {/* the manila PROFILE.DOC folder tab. Cropped from the rendered frame at
          its exact spot, so the painting behind it in the crop realigns with
          the real painting — seamless. (The T→I repair is at the top of this
          file; the crop is why the asset carries painting at all.) */}
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

      {/* ============ MOBILE: HER FRAME, AT HER SIZE ============ */}
      {/* Figma node 361:489, "iPhone 16 - 1": her coordinates, on two rails
          and one type scale (see the constants at the top of this file). The
          poster's own layers stay hidden below 768px; only this changes. */}
      <div className="dwh-m">
        <div className="dwh-m-stage">
          {/* the painting, bleeding past the sheet on every side — her two
              layers, at her sizes */}
          <img className="dwh-m-bg" src={`${A}/bg-pond.webp`} alt="" aria-hidden="true"
            style={{ left: UM(-860), top: UM(154), width: UM(1521.429), height: UM(852) }} />
          <img className="dwh-m-bg" src={`${A}/bg-pond.webp`} alt="" aria-hidden="true"
            style={{ left: UM(-561), top: UM(-66), width: UM(1251.786), height: UM(701) }} />

          <div className="dwh-m-sheet"
            style={{ left: UM(SHEET_X), top: UM(SHEET_Y), width: UM(SHEET_W), height: UM(SHEET_H) }} />

          {/* HER WIDTH; THE ASSET'S HEIGHT; THE SHEET'S EDGES. See TAB_*. */}
          <img className="dwh-m-tab" src={`${A}/profile-tab-cut.png`} alt="" aria-hidden="true"
            style={{ left: UM(TAB_X), top: UM(TAB_Y), width: UM(TAB_W), height: UM(TAB_H) }} />

          <span className="dwh-m-meet" style={{ left: UM(CL), top: UM(107), fontSize: UM(T.meet) }}>
            Meet
          </span>
          {/* the script overhangs its own box, so it sits a touch left of the
              rail to read as optically aligned with "Meet" above it */}
          <span className="dwh-m-name" style={{ left: UM(CL - 3), top: UM(134), fontSize: UM(T.name) }}>
            Mrinali Bhardwaj!
          </span>

          {/* the 44px hit area is `a.dwh-m-download::after` in design-world.css */}
          <a className="dwh-m-download" href="/resume-design.pdf" target="_blank" rel="noreferrer"
            style={{ right: UM(STAGE_W - CR), top: UM(109), fontSize: UM(T.small) }}>
            View Resume
            <span className="dwh-m-download-arrow" aria-hidden="true">↗</span>
          </a>

          <p className="dwh-m-intro"
            style={{ left: UM(CL), top: UM(181), width: UM(CW), fontSize: UM(T.text) }}>
            {INTRO}
          </p>

          {/* ---- experience ---- */}
          <span className="dwh-m-head" style={{ left: UM(CL), top: UM(274), fontSize: UM(T.head) }}>
            Experience
          </span>
          {M_EXP.map((e) => (
            <MobileExperience key={e.role + e.org} e={e} />
          ))}
          {M_RULES.map((r, i) => (
            <span key={i} className="dwh-m-rule"
              style={{ left: UM(r.x), top: UM(r.y), width: UM(r.w) }} />
          ))}

          {/* ---- softwares: real heading, tiles-only crop ---- */}
          <span className="dwh-m-head" style={{ left: UM(SOFT_HEAD_X), top: UM(SOFT_HEAD_Y), fontSize: UM(T.head) }}>
            Softwares
          </span>
          <img className="dwh-m-soft" src={`${A}/softwares-tiles.png`}
            alt="Figma, Photoshop, Illustrator, VS Code"
            style={{ left: UM(SOFT_X), top: UM(SOFT_Y), width: UM(SOFT_W), height: UM(SOFT_H) }} />

          {/* on the sheet's bottom edge, bleeding off the left as she drew it */}
          <img className="dwh-m-photo" src={`${A}/mini-mri.webp`}
            alt="Mrinali as a child in a blue bucket hat"
            style={{ left: UM(PHOTO_X), top: UM(PHOTO_Y), width: UM(PHOTO_W), height: UM(PHOTO_H) }} />

          {/* ---- skill set ---- */}
          <span className="dwh-m-head" style={{ left: UM(SKILL_X), top: UM(SKILL_Y), fontSize: UM(T.head) }}>
            Skill Set
          </span>
          {M_SKILLS.map((s, i) => (
            <img key={i} className="dwh-m-folder" src={`${A}/folder.png`} alt="" aria-hidden="true"
              style={{
                left: UM(s.cx - M_FOLDER / 2), top: UM(s.cy - M_FOLDER / 2),
                width: UM(M_FOLDER), height: UM(M_FOLDER),
              }} />
          ))}
          {M_SKILLS.map((s, i) => (
            <span key={`l${i}`} className="dwh-m-skill-label"
              style={{ left: UM(s.cx), top: UM(s.cy + M_FOLDER / 2 + 5), fontSize: UM(T.small) }}>
              {s.label.map((line, j) => (
                <span key={j}>{line}</span>
              ))}
            </span>
          ))}
        </div>

        {/* EDUCATION IS NOT IN HER MOBILE FRAME, and is not here either — she
            confirmed the omission is deliberate. The poster still carries all
            three credentials, which is where they read properly anyway. */}
      </div>
    </div>
  );
}
