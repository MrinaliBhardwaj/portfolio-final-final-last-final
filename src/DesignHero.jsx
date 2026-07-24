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

// the three Skill-Set folders: {folder x,y} and its {label x,y,w + lines}
const SKILLS = [
  { fx: 64.107, fy: 28.07, lx: 12, ly: 104, lw: 36, label: ["UI/UX", "Design"] },
  { fx: 188.28, fy: 55.18, lx: 134, ly: 133, lw: 47, label: ["Branding"] },
  { fx: 305, fy: 12.29, lx: 254, ly: 89, lw: 41, label: ["Graphic", "Design"] },
];

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
        src={`${A}/bg-pond.png`}
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
        src={`${A}/mini-mri.png`}
        alt="Mrinali as a child in a blue bucket hat"
        style={{ left: U(-61), top: U(238), width: U(483.556), height: U(519) }}
      />

      {/* pink tiger, bottom-right, anchored to its bottom edge */}
      <img
        className="dwh-tiger"
        src={`${A}/tiger.png`}
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

      {/* download resume */}
      <a
        className="dwh-download"
        href="/resume-design.docx"
        download
        style={{ left: U(1095), top: U(94), fontSize: U(14) }}
      >
        Download Resume
        <span className="dwh-download-arrow" aria-hidden="true">↓</span>
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
            style={{ left: U(s.fx), top: U(s.fy), width: U(64.107), height: U(64.198) }}
          />
        ))}
        {SKILLS.map((s, i) => (
          <span
            key={`l${i}`}
            className="dwh-skill-label"
            style={{ left: U(s.lx), top: U(s.ly), width: U(s.lw), fontSize: U(11) }}
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

      {/* ============ MOBILE REFLOW ============ */}
      {/* The poster above is a fixed 1316×741 artboard; scaled to a phone it
          collapses to ~4px text. Below 768px the CSS hides every poster layer
          and shows this flowed, readable version of the very same content —
          on the poster's own cream sheet, so it still reads as her document. */}
      <div className="dwh-m">
        <div className="dwh-m-hero">
          <img
            className="dwh-m-photo"
            src={`${A}/mini-mri.png`}
            alt="Mrinali as a child in a blue bucket hat"
          />
          <div className="dwh-m-headline">
            <span className="dwh-m-meet">Meet</span>
            <span className="dwh-m-name">Mrinali Bhardwaj!</span>
          </div>
        </div>

        <p className="dwh-m-intro">{INTRO}</p>

        <a className="dwh-m-download" href="/resume-design.docx" download>
          Download Resume
          <span aria-hidden="true">↓</span>
        </a>

        <section className="dwh-m-sec">
          <h3 className="dwh-m-h">Experience</h3>
          <div className="dwh-m-list">
            {EXPERIENCE.map((e) => (
              <div className="dwh-m-xp" key={e.role + e.org}>
                <span className="dwh-m-xp-kind">{e.kind}</span>
                <p className="dwh-m-xp-role">{e.role}</p>
                <p className="dwh-m-xp-org">{e.org}</p>
                <p className="dwh-m-xp-date">{e.date}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="dwh-m-sec">
          <h3 className="dwh-m-h">Skill Set</h3>
          <ul className="dwh-m-skills">
            {SKILLS.map((s, i) => (
              <li key={i}>{s.label.join(" ")}</li>
            ))}
          </ul>
        </section>

        {/* the softwares crop carries its own "Softwares" label + tiles,
            composited over cream so it drops onto this sheet seamlessly */}
        <section className="dwh-m-sec">
          <img
            className="dwh-m-soft"
            src={`${A}/softwares.png`}
            alt="Softwares: Figma, Photoshop, Illustrator, VS Code"
          />
        </section>

        <section className="dwh-m-sec">
          <h3 className="dwh-m-h">Education</h3>
          <div className="dwh-m-list">
            {EDUCATION.map((ed) => (
              <div className="dwh-m-edu" key={ed.title}>
                <p className="dwh-m-edu-title">{ed.title}</p>
                <p className="dwh-m-edu-sub">{ed.sub}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
