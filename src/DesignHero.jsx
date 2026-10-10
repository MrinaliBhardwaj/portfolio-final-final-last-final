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
// THE MOBILE FRAME, ON A GRID.
//
// Her frame (node 361:489) gave the composition: the stepped tab, the script
// name, a justified intro, experience as a 2x2 with hand-drawn connectors, the
// softwares tiles, the photo bleeding off the bottom-left, three scattered
// skill folders. All of that is kept. What is NOT kept is her measurements,
// because reproduced literally they had two problems a phone cannot absorb:
//
//   TYPE. The smallest text rendered at 7.48px (skill labels) and 9.48px (the
//   Leadership/Internship line and the dates), under a 12px intro. Nobody
//   reads 7px on a phone. Everything is raised to a floor of 10.5px with the
//   body at 15px, and the hierarchy is kept by ratio instead of by shrinking.
//
//   MARGINS. The frame had SIX different left edges — the intro at 42, "Meet"
//   at 52, the name at 47, the experience head at 44, its blocks at 46, and a
//   right column ending at 339 against a sheet edge of 367. Nothing lined up
//   with anything. There is now one padding and two rails, CL and CR; every
//   element starts or ends on one of them.
//
// The stage grew 852 -> 1040 to pay for the larger type. That is the honest
// trade: her artboard is one phone screen, and this content at a readable size
// is not one phone screen. A phone scrolls.
const PAD = 24;
const SHEET_X = 27;
const SHEET_W = 340;
const SHEET_Y = 94;
const SHEET_H = 956;                  // 94 -> 1050
const STAGE_W = 393;
const STAGE_H = 1100;
const CL = SHEET_X + PAD;             // 51  — the left rail
const CR = SHEET_X + SHEET_W - PAD;   // 343 — the right rail
const CW = CR - CL;                   // 292 — content width

// Type scale. The ratios are hers; the floor is not.
//
// These are STAGE units, so they scale with the viewport: a 360px Android
// renders them at 0.916 of the number below. The floor is therefore set for
// the narrowest common phone rather than for the 393 the frame was drawn at —
// date 11 and skill 11.5 land at 10.1 and 10.5 on a 360, where her frame's
// own 9.477 and 7.478 would have landed at 8.7 and 6.9.
const T = {
  meet: 19, name: 42, resume: 12, intro: 15, head: 17,
  kind: 11, role: 14, org: 12, date: 11, skill: 11.5,
};

// Experience: two rails, two rows. The left column is wider because it carries
// "Entrepreneurship Cell" and "June 2026 - July 2026", the two longest strings
// in the block; the right only has to clear "LUMA Technologies".
const COL_L = 130;
const COL_R = 110;
const ROW_Y = [432, 524];
const XP_LINE = { kind: 0, role: 19, org: 40, date: 60 };

const M_EXP = [
  { x: CL, y: ROW_Y[0], w: COL_L, align: "left", kind: "Leadership", role: "Design Executive", org: "Entrepreneurship Cell", date: "Jan 2024 – Jan 2025" },
  { x: CR - COL_R, y: ROW_Y[0], w: COL_R, align: "right", kind: "Internship", role: "Graphic Designer", org: "Moon Finance", date: "Jan 2025 – Jul 2025" },
  { x: CL, y: ROW_Y[1], w: COL_L, align: "left", kind: "Freelance", role: "Design Engineer", org: "NextG Apex", date: "June 2026 - July 2026" },
  { x: CR - COL_R, y: ROW_Y[1], w: COL_R, align: "right", kind: "Freelance", role: "UI/ UX Designer", org: "LUMA Technologies", date: "Jul 2025 - Oct 2025" },
];

// The two connectors, centred in the gutter between the columns and sitting on
// the role line. Her third rule was a 21-unit vertical tick at the sheet's
// right edge; on this grid it lands on the rail with nothing to connect, where
// it reads as a rendering artifact rather than a drawn mark, so it is dropped.
const GUT_L = CL + COL_L;             // 181
const GUT_R = CR - COL_R;             // 233
const M_RULES = ROW_Y.map((y) => ({ x: GUT_L + 5, y: y + XP_LINE.role + 7, w: GUT_R - GUT_L - 10 }));

// Softwares keeps the crop's own aspect (264 x 108 on the poster) and ends on
// the right rail.
const SOFT_W = 175;
const SOFT_H = SOFT_W / (264 / 108);
const SOFT_X = CR - SOFT_W;
const SOFT_Y = 640;
const SKILL_Y = 752;

// The photo sits on the sheet's bottom edge and bleeds off the left, as she
// drew it. Its aspect is the asset's own.
const PHOTO_W = 300;
const PHOTO_H = PHOTO_W / (303 / 325.209);
const PHOTO_X = -44;
const PHOTO_Y = SHEET_Y + SHEET_H - PHOTO_H;

// Skill folders: her scatter, stored as centres because that is how a
// scattered cluster wants to be positioned.
//
// THE LABELS ARE ONE LINE NOW. Her frame wraps them ("UI/UX" / "Design"),
// which was free at 7.5px and is not at 11: two lines plus a 50-unit folder
// needs 84 units of stagger, and at the 58 her scatter uses, each folder
// landed on the label above it. One line needs 70, and "Graphic Design" at
// 11px measures ~80 against a 110-wide column, so it fits without wrapping.
const M_FOLDER = 46;
const M_SKILLS = [
  { cx: 285, cy: 810, label: ["UI/UX Design"] },
  { cx: 318, cy: 890, label: ["Branding"] },
  { cx: 297, cy: 970, label: ["Graphic Design"] },
];

function MobileExperience({ e }) {
  // the three top lines hang off whichever rail the column aligns to; the date
  // is centred across the block, as it is on the poster
  const side = e.align === "right" ? "right" : "left";
  return (
    <div className="dwh-m-xp" style={{ left: UM(e.x), top: UM(e.y), width: UM(e.w) }}>
      <span className="dwh-m-xp-kind" style={{ top: UM(XP_LINE.kind), fontSize: UM(T.kind), [side]: 0 }}>{e.kind}</span>
      <span className="dwh-m-xp-role" style={{ top: UM(XP_LINE.role), fontSize: UM(T.role), [side]: 0 }}>{e.role}</span>
      <span className="dwh-m-xp-org" style={{ top: UM(XP_LINE.org), fontSize: UM(T.org), [side]: 0 }}>{e.org}</span>
      <span className="dwh-m-xp-date" style={{ top: UM(XP_LINE.date), fontSize: UM(T.date) }}>{e.date}</span>
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

      {/* ============ MOBILE: HER FRAME, ON A GRID ============ */}
      {/* Figma node 361:489, "iPhone 16 - 1". Her composition, her assets, her
          art direction — laid out on the rails defined at the top of this file
          rather than at her literal coordinates, because reproduced to the
          pixel the type bottomed out at 7.48px and nothing shared a margin.
          The poster's own layers stay hidden below 768px; only this changes. */}
      <div className="dwh-m">
        <div className="dwh-m-stage">
          {/* the painting, bleeding past the sheet on every side */}
          <img className="dwh-m-bg" src={`${A}/bg-pond.webp`} alt="" aria-hidden="true"
            style={{ left: UM(-860), top: UM(154), width: UM(1521.429), height: UM(1100) }} />
          <img className="dwh-m-bg" src={`${A}/bg-pond.webp`} alt="" aria-hidden="true"
            style={{ left: UM(-561), top: UM(-66), width: UM(1251.786), height: UM(900) }} />

          <div className="dwh-m-sheet"
            style={{ left: UM(SHEET_X), top: UM(SHEET_Y), width: UM(SHEET_W), height: UM(SHEET_H) }} />

          {/* HER X AND WIDTH; OUR HEIGHT. Her frame places the tab as
              "image 25" at (-7, 16) 289x79.377 — aspect 3.64. The tab vendored
              for the poster is 400x72, aspect 5.56: a tighter crop of the same
              artwork. Filling her box with our crop stretched it half again as
              tall. Scanning her rendered frame gave the landmarks (tab left
              x28, top y60, blocks out to x136 and x223, sheet top y94; ours
              x51, y22, x199, x319, y67), which fit at a scale of 0.7276 for a
              width of 291 — so her 289 was right and only the height was not. */}
          <img className="dwh-m-tab" src={`${A}/profile-tab.png`} alt="" aria-hidden="true"
            style={{ left: UM(-7), top: UM(45.59), width: UM(289), height: UM(52.02) }} />

          <span className="dwh-m-meet" style={{ left: UM(CL), top: UM(128), fontSize: UM(T.meet) }}>
            Meet
          </span>
          {/* the script overhangs its own box, so it sits a touch left of the
              rail to read as optically aligned with "Meet" above it */}
          <span className="dwh-m-name" style={{ left: UM(CL - 4), top: UM(150), fontSize: UM(T.name) }}>
            Mrinali Bhardwaj!
          </span>

          {/* her frame sets this 8.737px; the type is now 12 and the 44px hit
              area is handled by `a.dwh-m-download::after` in design-world.css */}
          <a className="dwh-m-download" href="/resume-design.pdf" target="_blank" rel="noreferrer"
            style={{ right: UM(STAGE_W - CR), top: UM(128), fontSize: UM(T.resume) }}>
            View Resume
            <span className="dwh-m-download-arrow" aria-hidden="true">↗</span>
          </a>

          <p className="dwh-m-intro"
            style={{ left: UM(CL), top: UM(222), width: UM(CW), fontSize: UM(T.intro) }}>
            {INTRO}
          </p>

          {/* ---- experience ---- */}
          <span className="dwh-m-head" style={{ left: UM(CL), top: UM(400), fontSize: UM(T.head) }}>
            Experience
          </span>
          {M_EXP.map((e) => (
            <MobileExperience key={e.role + e.org} e={e} />
          ))}
          {M_RULES.map((r, i) => (
            <span key={i} className="dwh-m-rule"
              style={{ left: UM(r.x), top: UM(r.y), width: UM(r.w) }} />
          ))}

          {/* the crop carries its own "Softwares" label above the tiles, so her
              separate label node is deliberately not rendered — drawing it
              would print the word twice */}
          <img className="dwh-m-soft" src={`${A}/softwares.png`}
            alt="Softwares: Figma, Photoshop, Illustrator, VS Code"
            style={{ left: UM(SOFT_X), top: UM(SOFT_Y), width: UM(SOFT_W), height: UM(SOFT_H) }} />

          {/* on the sheet's bottom edge, bleeding off the left as she drew it */}
          <img className="dwh-m-photo" src={`${A}/mini-mri.webp`}
            alt="Mrinali as a child in a blue bucket hat"
            style={{ left: UM(PHOTO_X), top: UM(PHOTO_Y), width: UM(PHOTO_W), height: UM(PHOTO_H) }} />

          {/* ---- skill set ---- */}
          <span className="dwh-m-head" style={{ left: UM(GUT_R), top: UM(SKILL_Y), fontSize: UM(T.head) }}>
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
              style={{ left: UM(s.cx), top: UM(s.cy + M_FOLDER / 2 + 6), fontSize: UM(T.skill) }}>
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
