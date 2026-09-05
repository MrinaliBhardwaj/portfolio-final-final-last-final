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
 * A heading she wrote on the canvas, outside any frame. Only Layover has these;
 * Regis and NextG carry no text of their own, which is why `sections` is
 * optional rather than an empty array everywhere.
 *
 * @typedef {object} PageSection
 * @property {string} num    "01"
 * @property {string} title  "Marketing site"
 * @property {string} sub    the line of argument under it
 * @property {number} x
 * @property {number} y
 *
 * @typedef {object} FigmaPage
 * @property {string} slug   the route: #/design/<slug>
 * @property {string} name   the page name, in the Pages list
 * @property {string} file   the Figma file this page was mirrored from
 * @property {string} [link] that file, if it is shareable
 * @property {PageSection[]} [sections]
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
  {
    slug: "layover",
    name: "Layover",
    file: "layover Casestudy",
    // THE PAGE IS NAMED "SCREENS" (204:1140) and it is the most written-down of
    // the three: eight numbered sections, each with a title and a line of
    // argument, and forty-five screens each captioned underneath.
    //
    // THOSE CAPTIONS ARE HERS, NOT MINE — and they are baked into the frame
    // images rather than re-set as text here. Each frame below is a crop of her
    // WRAPPER (the screen plus the caption she put under it), taken from an
    // export of the section at 6060 native, so the caption arrives in her own
    // type at her own placement. Re-typing them would be my approximation of
    // her page standing in for her page.
    //
    // The section headers ARE text, because they sit outside the wrappers.
    sections: [
      { num: "01", title: "Marketing site", sub: "The public site and its responsive counterpart.", x: 0, y: 0 },
      { num: "02", title: "Consumer web", sub: "Ordering, from entering a terminal to a live countdown.", x: 0, y: 3893 },
      { num: "03", title: "Consumer app — iOS", sub: "The same decisions at 440px.", x: 0, y: 9407 },
      { num: "04", title: "Sign-up explorations", sub: "Converged on a phone number and an OTP.", x: 0, y: 11571 },
      { num: "05", title: "Vendor portal", sub: "Light, dense, and built for a bright counter.", x: 0, y: 12829 },
      { num: "06", title: "Vendor portal — mobile", sub: "Most stall owners do not have a desk.", x: 0, y: 16760 },
      { num: "07", title: "Vendor onboarding", sub: "Six steps. Identity first, documents last.", x: 0, y: 18058 },
      { num: "08", title: "Admin portal", sub: "Catching a vendor going bad before a traveller does.", x: 0, y: 21290 },
    ],
    frames: [
      {
        node: "204:1148", name: "LANDING PAGE",
        x: 0, y: 197, w: 1440, h: 3496,
        src: "/work/layover-page/01-landing-page.webp",
        alt:
          "Layover — Landing page. Airport entry above the fold.",
      },
      {
        node: "204:1274", name: "iPhone 16 Pro Max - 14",
        x: 1540, y: 197, w: 440, h: 1812,
        src: "/work/layover-page/01-landing-page-440px.webp",
        alt:
          "Layover — Landing page — 440px. Single column, prep time retained.",
      },
      {
        node: "204:1425", name: "terminal enter page",
        x: 0, y: 4090, w: 1440, h: 3496,
        src: "/work/layover-page/02-terminal-entry.webp",
        alt:
          "Layover — Terminal entry. One field: airport or PNR.",
      },
      {
        node: "204:1567", name: "Desktop - 80",
        x: 1540, y: 4090, w: 1440, h: 2446,
        src: "/work/layover-page/02-outlet-listing.webp",
        alt:
          "Layover — Outlet listing. Prep time and Get Directions on every card.",
      },
      {
        node: "204:1671", name: "Desktop - 73",
        x: 3080, y: 4090, w: 1440, h: 2315,
        src: "/work/layover-page/02-outlet-menu.webp",
        alt:
          "Layover — Outlet menu. Veg / non-veg as a header control.",
      },
      {
        node: "204:1796", name: "Desktop - 78",
        x: 4620, y: 4090, w: 1440, h: 1551,
        src: "/work/layover-page/02-cart.webp",
        alt:
          "Layover — Cart. Fees itemised before payment.",
      },
      {
        node: "204:2050", name: "Desktop - 59",
        x: 0, y: 7676, w: 1440, h: 1118,
        src: "/work/layover-page/02-payment-options.webp",
        alt:
          "Layover — Payment options. UPI, cards, netbanking, pay on pickup.",
      },
      {
        node: "204:2149", name: "Desktop - 79",
        x: 1540, y: 7676, w: 1440, h: 1531,
        src: "/work/layover-page/02-order-confirmed.webp",
        alt:
          "Layover — Order confirmed. Live countdown against prep time.",
      },
      {
        node: "204:2275", name: "Profile",
        x: 3080, y: 7676, w: 1440, h: 1531,
        src: "/work/layover-page/02-account.webp",
        alt:
          "Layover — Account. Orders, lounge bookings, preferences.",
      },
      {
        node: "204:2436", name: "Location-airport-selection",
        x: 0, y: 9604, w: 440, h: 1008,
        src: "/work/layover-page/03-airport-selection.webp",
        alt:
          "Layover — Airport selection.",
      },
      {
        node: "204:2512", name: "Food-home",
        x: 520, y: 9604, w: 440, h: 1767,
        src: "/work/layover-page/03-home.webp",
        alt:
          "Layover — Home.",
      },
      {
        node: "204:2682", name: "food menu",
        x: 1040, y: 9604, w: 440, h: 1767,
        src: "/work/layover-page/03-outlet-menu.webp",
        alt:
          "Layover — Outlet menu.",
      },
      {
        node: "204:2885", name: "added to cart",
        x: 1560, y: 9604, w: 440, h: 1767,
        src: "/work/layover-page/03-item-added.webp",
        alt:
          "Layover — Item added.",
      },
      {
        node: "204:3097", name: "cart with to pay dropdown",
        x: 2080, y: 9604, w: 440, h: 1767,
        src: "/work/layover-page/03-cart-and-payment.webp",
        alt:
          "Layover — Cart and payment.",
      },
      {
        node: "204:3260", name: "Sign Up-1",
        x: 0, y: 11768, w: 375, h: 861,
        src: "/work/layover-page/04-phone-social.webp",
        alt:
          "Layover — Phone + social.",
      },
      {
        node: "204:3707", name: "Sign Up-2",
        x: 455, y: 11768, w: 375, h: 861,
        src: "/work/layover-page/04-otp-pass-2.webp",
        alt:
          "Layover — OTP — pass 2.",
      },
      {
        node: "204:4131", name: "Sign Up-3",
        x: 910, y: 11768, w: 375, h: 861,
        src: "/work/layover-page/04-otp-pass-3.webp",
        alt:
          "Layover — OTP — pass 3.",
      },
      {
        node: "204:4559", name: "Sign Up-4",
        x: 1365, y: 11768, w: 375, h: 861,
        src: "/work/layover-page/04-otp-pass-4.webp",
        alt:
          "Layover — OTP — pass 4.",
      },
      {
        node: "204:4988", name: "Sign Up-5",
        x: 1820, y: 11768, w: 375, h: 861,
        src: "/work/layover-page/04-otp-final-with-error-state.webp",
        alt:
          "Layover — OTP — final, with error state.",
      },
      {
        node: "205:2929", name: "Dashboard_V2",
        x: 0, y: 13026, w: 1440, h: 1118,
        src: "/work/layover-page/05-order-queue.webp",
        alt:
          "Layover — Order queue. Colour-coded by state.",
      },
      {
        node: "205:3188", name: "Order",
        x: 1540, y: 13026, w: 1440, h: 1118,
        src: "/work/layover-page/05-order-card.webp",
        alt:
          "Layover — Order card. Accept and Reject take the largest targets.",
      },
      {
        node: "205:3449", name: "empty",
        x: 3080, y: 13026, w: 1440, h: 1118,
        src: "/work/layover-page/05-empty-queue.webp",
        alt:
          "Layover — Empty queue. Designed before the populated version.",
      },
      {
        node: "205:3541", name: "Menu",
        x: 4620, y: 13026, w: 1440, h: 1118,
        src: "/work/layover-page/05-menu-management.webp",
        alt:
          "Layover — Menu management. Edited in place, not in a settings tree.",
      },
      {
        node: "205:3677", name: "add/edit item",
        x: 0, y: 14234, w: 1440, h: 1118,
        src: "/work/layover-page/05-item-editor.webp",
        alt:
          "Layover — Item editor. Preparation Time is a required field.",
      },
      {
        node: "205:3867", name: "Coupon",
        x: 1540, y: 14234, w: 1440, h: 1118,
        src: "/work/layover-page/05-coupons.webp",
        alt:
          "Layover — Coupons. Scoped to items and dates.",
      },
      {
        node: "205:4110", name: "Analytics and report UI",
        x: 3080, y: 14234, w: 1440, h: 1118,
        src: "/work/layover-page/05-analytics.webp",
        alt:
          "Layover — Analytics. The same numbers admin grades them on.",
      },
      {
        node: "205:4457", name: "reviews",
        x: 4620, y: 14234, w: 1440, h: 1118,
        src: "/work/layover-page/05-reviews.webp",
        alt:
          "Layover — Reviews. Vendor can reply directly.",
      },
      {
        node: "205:4639", name: "Profile and Settings_1",
        x: 0, y: 15442, w: 1440, h: 1118,
        src: "/work/layover-page/05-business-profile.webp",
        alt:
          "Layover — Business profile. Logo, cuisine, operating hours.",
      },
      {
        node: "205:4816", name: "Profile and Settings_2",
        x: 1540, y: 15442, w: 1440, h: 1118,
        src: "/work/layover-page/05-bank-details-gst-and-pan.webp",
        alt:
          "Layover — Bank details, GST and PAN. Upload proof stays visible after saving.",
      },
      {
        node: "205:4897", name: "Dahboard-BOTH",
        x: 0, y: 16957, w: 393, h: 901,
        src: "/work/layover-page/06-dashboard.webp",
        alt:
          "Layover — Dashboard.",
      },
      {
        node: "205:5279", name: "FRONT",
        x: 473, y: 16957, w: 393, h: 901,
        src: "/work/layover-page/06-incoming-order.webp",
        alt:
          "Layover — Incoming order.",
      },
      {
        node: "205:5373", name: "INSIDE",
        x: 946, y: 16957, w: 393, h: 901,
        src: "/work/layover-page/06-order-detail.webp",
        alt:
          "Layover — Order detail.",
      },
      {
        node: "205:5734", name: "Dashboard",
        x: 1419, y: 16957, w: 393, h: 901,
        src: "/work/layover-page/06-queue.webp",
        alt:
          "Layover — Queue.",
      },
      {
        node: "205:6133", name: "iPhone 16 - 1",
        x: 1892, y: 16957, w: 393, h: 901,
        src: "/work/layover-page/06-menu.webp",
        alt:
          "Layover — Menu.",
      },
      {
        node: "205:6196", name: "Vendor Onboarding1",
        x: 0, y: 18255, w: 1423, h: 1106,
        src: "/work/layover-page/07-01-business-details.webp",
        alt:
          "Layover — 01 · Business details. Completable on a phone at the counter.",
      },
      {
        node: "205:6237", name: "Vendor Onboarding2",
        x: 1523, y: 18255, w: 1423, h: 1061,
        src: "/work/layover-page/07-02-contact-details.webp",
        alt:
          "Layover — 02 · Contact details.",
      },
      {
        node: "205:6293", name: "Vendor Onboarding3",
        x: 3045, y: 18255, w: 1423, h: 1061,
        src: "/work/layover-page/07-03-email-and-phone-otp.webp",
        alt:
          "Layover — 03 · Email and phone OTP.",
      },
      {
        node: "205:6345", name: "Vendor Onboarding4",
        x: 4568, y: 18255, w: 1423, h: 1326,
        src: "/work/layover-page/07-04-kyc-fssai-trade-licence.webp",
        alt:
          "Layover — 04 · KYC, FSSAI, trade licence. Constraint stated under the field.",
      },
      {
        node: "205:6414", name: "Vendor Onboarding5",
        x: 0, y: 19671, w: 1423, h: 1281,
        src: "/work/layover-page/07-05-bank-details.webp",
        alt:
          "Layover — 05 · Bank details.",
      },
      {
        node: "205:6479", name: "Vendor Onboarding6",
        x: 1523, y: 19671, w: 1423, h: 1419,
        src: "/work/layover-page/07-06-submitted.webp",
        alt:
          "Layover — 06 · Submitted. Approval estimate and what happens next.",
      },
      {
        node: "205:6539", name: "Vendor_Management",
        x: 0, y: 21487, w: 1440, h: 1118,
        src: "/work/layover-page/08-vendor-management.webp",
        alt:
          "Layover — Vendor management. Four metrics per row.",
      },
      {
        node: "205:6750", name: "Vendor_Onboarding",
        x: 1540, y: 21487, w: 1440, h: 1073,
        src: "/work/layover-page/08-onboarding-approval.webp",
        alt:
          "Layover — Onboarding approval.",
      },
      {
        node: "205:6925", name: "Vendor_Management(Menu)",
        x: 3080, y: 21487, w: 1440, h: 1118,
        src: "/work/layover-page/08-menu-oversight.webp",
        alt:
          "Layover — Menu oversight. Admin can correct a listing directly.",
      },
      {
        node: "205:7129", name: "Orders",
        x: 4620, y: 21487, w: 1440, h: 1073,
        src: "/work/layover-page/08-order-management.webp",
        alt:
          "Layover — Order management.",
      },
      {
        node: "205:7380", name: "User_Management",
        x: 0, y: 22695, w: 1440, h: 1073,
        src: "/work/layover-page/08-user-management.webp",
        alt:
          "Layover — User management.",
      },
    ],
  },
];

export const pageBySlug = (slug) =>
  FIGMA_PAGES.find((p) => p.slug === slug) || null;

/** the page's bounding box in Figma units — what the canvas has to hold */
export function pageBounds(page) {
  const f = page.frames;
  // Section headers sit ABOVE the first frame of their section — Layover's
  // frames start at y 197 and its headers at y 0 — so a box drawn from the
  // frames alone clips every heading on the page.
  const heads = page.sections || [];
  const x0 = Math.min(...f.map((n) => n.x), ...heads.map((n) => n.x));
  const y0 = Math.min(...f.map((n) => n.y), ...heads.map((n) => n.y));
  const x1 = Math.max(...f.map((n) => n.x + n.w));
  const y1 = Math.max(...f.map((n) => n.y + n.h));
  return { x0, y0, w: x1 - x0, h: y1 - y0 };
}
