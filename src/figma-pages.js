// THE PROJECT PAGES OF THE FIGMA FILE.
//
// The design world is a Figma file. It had one page — "design", the portfolio
// itself. These are the pages after it: one per project, named for the project,
// holding that project's screens as frames.
//
// EVERY NUMBER HERE IS THE FIGMA FILE'S OWN. `x`, `y`, `w` and `h` are read
// straight out of the file (get_metadata on the page node), and `name` is the
// layer name as she typed it. That is the point: the canvas below is not a
// tasteful re-arrangement of her screens, it is her page, at her placements. If
// a frame moves in Figma it moves here, and if four frames are called "row"
// then four frames are called "row" — renaming them to read better would make
// this a second, prettier source of truth, which is the one thing a mirror of a
// design file must never be.
//
// The exports are PNG at 2x from the same node ids, resized to 1800 wide and
// carried as WebP. 1800 is ~1.25x the 1440 the frame is drawn at when the page
// is at 100%, so it holds up when you zoom in past fit.

/**
 * @typedef {object} PageFrame
 * @property {string} node   the Figma node id, so a frame can be re-pulled
 * @property {string} name   the layer name, exactly as it is in the file
 * @property {number} x      canvas coordinates, in Figma units
 * @property {number} y
 * @property {number} w
 * @property {number} h
 * @property {string} src    the export, absolute from /public
 * @property {string} alt
 *
 * @typedef {object} FigmaPage
 * @property {string} slug   the route: #/design/<slug>
 * @property {string} name   the page name, in the Pages list
 * @property {string} file   the Figma file this page was mirrored from
 * @property {string} [link] that file, if it is shareable
 * @property {PageFrame[]} frames
 */

const R = "/work/regis";
const N = "/work/nextg";

/** @type {FigmaPage[]} */
export const FIGMA_PAGES = [
  {
    slug: "regis",
    name: "Regis",
    file: "Compliance Checker — Regis",
    // Twelve 1440x900 frames on a 3 x 4 grid: 1540 apart across (a 100px
    // gutter), 1000 apart down. No captions, no section headers — the page is
    // the frames and their names, which is what Figma draws.
    frames: [
      {
        node: "8:2", name: "Today – Overview", x: 0, y: 0, w: 1440, h: 900,
        src: `${R}/today-overview.webp`,
        alt: "Regis's Today screen: an overdue count of 109 leading a priority queue of obligations ranked by risk, with a compliance-health panel at 68% and a read-only Copilot beside it.",
      },
      {
        node: "9:148", name: "Obligations – Tracker", x: 1540, y: 0, w: 1440, h: 900,
        src: `${R}/obligations-tracker.webp`,
        alt: "Regis's obligation tracker: a filtered register of 346 obligations with priority, owner, due date and status columns, and a bulk-action bar for approving and submitting for review.",
      },
      {
        node: "10:327", name: "Obligation detail – Sheet", x: 3080, y: 0, w: 1440, h: 900,
        src: `${R}/obligation-detail.webp`,
        alt: "One obligation opened as a sheet over the tracker, showing its overview, evidence completeness, frequency and applicability, and who it applies to.",
      },
      {
        node: "11:520", name: "Evidence – Repository", x: 0, y: 1000, w: 1440, h: 900,
        src: `${R}/evidence-repository.webp`,
        alt: "Regis's evidence repository: uploaded documents with type, processing state and expiry, and banners for documents not yet linked to an obligation.",
      },
      {
        node: "11:724", name: "Audit trail – Exceptions", x: 1540, y: 1000, w: 1440, h: 900,
        src: `${R}/audit-trail.webp`,
        alt: "Regis's audit trail: every state change as an immutable ledger row with actor, action, item and extra detail.",
      },
      {
        node: "12:693", name: "Reports – Board pack", x: 3080, y: 1000, w: 1440, h: 900,
        src: `${R}/reports-board-pack.webp`,
        alt: "Regis's compliance report for the board: the standing position as figures, an overdue table, and HTML and PDF export controls.",
      },
      {
        node: "12:931", name: "Team – Roles", x: 0, y: 2000, w: 1440, h: 900,
        src: `${R}/team-roles.webp`,
        alt: "Regis's team screen: active members and pending invites with preparer, approver and head-of-compliance roles, over a matrix of which role can do what.",
      },
      {
        node: "14:878", name: "Notifications – Inbox", x: 1540, y: 2000, w: 1440, h: 900,
        src: `${R}/notifications.webp`,
        alt: "Regis's notification inbox, grouped by obligation: escalations, reviews requested, items sent back, and assignments.",
      },
      {
        node: "14:1052", name: "Legal updates – Feed", x: 3080, y: 2000, w: 1440, h: 900,
        src: `${R}/legal-updates.webp`,
        alt: "Regis's legal-updates feed: new and amended regulation, each entry ending in what it changed in your own register.",
      },
      {
        node: "15:1043", name: "Onboarding – Confirm derived values", x: 0, y: 3000, w: 1440, h: 900,
        src: `${R}/onboarding.webp`,
        alt: "Regis's onboarding: the compliance profile at 92%, the contradictions it found, and the derived values waiting to be confirmed with their confidence and source.",
      },
      {
        node: "15:1218", name: "Sign in – Create workspace", x: 1540, y: 3000, w: 1440, h: 900,
        src: `${R}/sign-in.webp`,
        alt: "Regis's sign-in and workspace creation, headlined “A defensible compliance calendar for Indian NBFCs.”",
      },
      {
        node: "17:1330", name: "Obligations – Tracker (Dark)", x: 3080, y: 3000, w: 1440, h: 900,
        src: `${R}/tracker-dark.webp`,
        alt: "The same obligation tracker on the dark theme.",
      },
    ],
  },
  {
    slug: "nextg",
    name: "NextG Apex",
    file: "NextG",
    // One column at x ~2135, top to bottom, with the file's own uneven gaps —
    // 153, 83, 75, 115, 184, 191, 126, 126 — kept rather than regularised.
    frames: [
      {
        node: "144:361", name: "browser", x: 2132, y: 165, w: 1440, h: 951,
        src: `${N}/f-browser.webp`,
        alt: "NextG's landing page in a browser frame: the headline “Every outlet, One growth engine.” over a constellation of linked dots, with 500K+ retail outlets, 900+ towns and cities and 20+ challenger brands beneath it.",
      },
      {
        node: "144:701", name: "states", x: 2143, y: 1269, w: 1440, h: 374,
        src: `${N}/f-states.webp`,
        alt: "Three states of the same NextG component at 0.00, 0.55 and 1.00.",
      },
      {
        node: "144:4986", name: "row", x: 2135, y: 1726, w: 1440, h: 548,
        src: `${N}/f-services.webp`,
        alt: "NextG's services and industries sections, side by side.",
      },
      {
        node: "144:5037", name: "row", x: 2135, y: 2349, w: 1440, h: 548,
        src: `${N}/f-brands.webp`,
        alt: "NextG's brands and testimonials sections, side by side.",
      },
      {
        node: "144:5097", name: "row", x: 2135, y: 3012, w: 1440, h: 548,
        src: `${N}/f-leadership.webp`,
        alt: "NextG's leadership section beside its closing band.",
      },
      {
        node: "144:5145", name: "featured – coverage map", x: 2135, y: 3744, w: 1440, h: 665,
        src: `${N}/f-coverage.webp`,
        alt: "NextG's coverage map view: every outlet, beat and territory on one live map, with 94% coverage, 900+ towns live and 512K outlets.",
      },
      {
        node: "144:5201", name: "other views", x: 2135, y: 4600, w: 1440, h: 307,
        src: `${N}/f-other-views.webp`,
        alt: "Three further NextG views: execution, live intelligence and field ops.",
      },
      {
        node: "144:2396", name: "row", x: 2135, y: 5033, w: 1440, h: 647,
        src: `${N}/f-demo.webp`,
        alt: "NextG's book-a-demo section beside the shop.",
      },
      {
        node: "144:2546", name: "phones", x: 2135, y: 5806, w: 1440, h: 706,
        src: `${N}/f-phones.webp`,
        alt: "Four NextG mobile screens in a row: the hero, coordinated growth, the product showcase and the navigation drawer.",
      },
    ],
  },
];

export const pageBySlug = (slug) =>
  FIGMA_PAGES.find((p) => p.slug === slug) || null;

/** the page's bounding box in Figma units — what the canvas has to hold */
export function pageBounds(page) {
  const f = page.frames;
  const x0 = Math.min(...f.map((n) => n.x));
  const y0 = Math.min(...f.map((n) => n.y));
  const x1 = Math.max(...f.map((n) => n.x + n.w));
  const y1 = Math.max(...f.map((n) => n.y + n.h));
  return { x0, y0, w: x1 - x0, h: y1 - y0 };
}
