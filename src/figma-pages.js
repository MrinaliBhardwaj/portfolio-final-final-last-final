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
//
// ---------------------------------------------------------------------------
// THE FILE KEYS, SO A PAGE CAN BE RE-PULLED.
//
//   regis    8qMVRhvaHKN41AHP72kx86   "Compliance Checker — Regis"
//   nextg    bUB4MsJcWhbCEhPEyI7Ip6   "NextG"
//   layover  BRaDrcuSqhHuA7PTmJX0Zt   "layover Casestudy"
//
// Written down because they were not. Regis's key lived in one chat message
// from 3 Sep 2026 and nowhere in the repo, so a later session went looking for
// it, found nothing, and reported the page as unpullable — when it had been
// used that same day to pull all twelve of its exports. The other two have
// been in scripts/build_figma_components.py since 18 Sep.
//
// A COMMENT, NOT A FIELD. These were briefly `fileKey` properties on each
// page, which shipped them inside the JS bundle. No code reads them — they
// exist for whoever next needs to re-pull a page — so a comment does the same
// job and reaches no browser. The three files are private; a Figma file key
// is what a share URL carries, so for a file set to "anyone with the link"
// the key would BE the credential, and these would not be written here.
//
// To re-pull: `use_figma` with the key and a read-only script beats
// `get_metadata` on anything large — Layover's page overflows the MCP
// transport, and per-frame metadata runs about 10k tokens a frame. See
// DECISIONS.md, "Layover and Regis get their real layers".
// ---------------------------------------------------------------------------

/**
 * One row under a frame in the layers panel: the layer's name exactly as it is
 * in Figma, and which glyph FigmaPanel should draw for it.
 *
 * @typedef {object} FrameLayer
 * @property {"frame"|"text"|"image"|"component"|"vector"} icon
 * @property {string} name
 *
 * @typedef {object} PageFrame
 * @property {string} node   the Figma node id, so a frame can be re-pulled
 * @property {string} name   the layer name, exactly as it is in the file
 * @property {number} x      canvas coordinates, in Figma units
 * @property {number} y
 * @property {number} w
 * @property {number} h
 * @property {string} src    the export, absolute from /public
 * @property {string} alt
 * @property {FrameLayer[]} [children]  the frame's real layers, read out of
 *   the file. Every frame of every page now carries them; it stays optional
 *   so a newly added frame is a missing panel row rather than a type error.
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
// THE LAYERS ARE THE REAL ONES.
//
// Each frame below carries its actual first-level children, read out of the
// Figma file with get_metadata — the names she gave them, in her order. They
// are here because the design world's layers panel used to render every frame
// with `children: []` and its properties panel described every one as an image
// fill, which is what the page is SHOWING (an exported webp) rather than what
// the node IS. A recruiter reading that panel was being told she pastes
// screenshots into Figma, when the file is frames, text layers, component
// instances and auto-layout all the way down.
//
// First level only, which is exactly what Figma's own panel shows before you
// expand a row — and mercifully so: the NextG hero's "outlet field" alone
// holds about three hundred hand-placed lines and ellipses.
//
// EXCEPT WHERE THE FIRST LEVEL IS A WRAPPER. Ten of Regis's twelve screens
// read, at depth one, as exactly two rows: `Sidebar` and `page`. That is
// true and it is useless — the panel has one level of expansion to spend and
// spending it on a wrapper says nothing. Layover has the same shape under
// different names (`main_frame`, `main content`, and in several places a
// frame literally called `Frame`), so naming cannot identify a wrapper.
// Geometry can: a wrapper is a lone child that FILLS ITS PARENT. So where a
// frame has three or fewer children and one of them covers 60% or more of
// the board, that child is skipped and its own children are listed — the
// same thing a designer does when the first expand reveals nothing. It
// bottoms out at three levels. Everything else is depth one.
//
// Then three filters, in this order: Figma's auto-generated names are
// dropped (`Group 36965`, `Rectangle 5705`, `Mask group`) because they
// describe nothing she decided; repeats are collapsed, which is also a hard
// requirement since FigmaPanel keys its rows by name and a duplicate would
// collide; and the list is capped at seven so a row does not become a wall.
//
// Two rows were removed by hand, both from Layover's vendor screens: an
// invented person's name and a `pan_id….pdf` filename, placeholder content
// in her file that has no business being published as text on a live site.
//
// WHAT IS STILL NOT HERE. No `image` icons, anywhere. In Figma an image is a
// rectangle with an image fill, and fills do not come back from metadata —
// the same gap that leaves the properties panel's Fill row empty. So an
// image layer is indistinguishable from a plain rectangle and both read as
// `vector`. A guess would have been easy and wrong.
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
        children: [
          { icon: "frame", name: "page-head" },
          { icon: "vector", name: "rule" },
          { icon: "frame", name: "note-critical" },
          { icon: "frame", name: "metric-strip" },
          { icon: "frame", name: "split" },
        ],
      },
      {
        node: "9:148", name: "Obligations – Tracker", x: 1540, y: 0, w: 1440, h: 900,
        src: `${R}/obligations-tracker.webp`,
        alt: "Regis's obligation tracker: a filtered register of 346 obligations with priority, owner, due date and status columns, and a bulk-action bar for approving and submitting for review.",
        children: [
          { icon: "frame", name: "page-head" },
          { icon: "vector", name: "rule" },
          { icon: "frame", name: "views" },
          { icon: "frame", name: "tracker" },
        ],
      },
      {
        node: "10:327", name: "Obligation detail – Sheet", x: 3080, y: 0, w: 1440, h: 900,
        src: `${R}/obligation-detail.webp`,
        alt: "One obligation opened as a sheet over the tracker, showing its overview, evidence completeness, frequency and applicability, and who it applies to.",
        children: [
          { icon: "component", name: "Sidebar" },
          { icon: "frame", name: "page" },
          { icon: "vector", name: "scrim" },
          { icon: "frame", name: "sheet" },
        ],
      },
      {
        node: "11:520", name: "Evidence – Repository", x: 0, y: 1000, w: 1440, h: 900,
        src: `${R}/evidence-repository.webp`,
        alt: "Regis's evidence repository: uploaded documents with type, processing state and expiry, and banners for documents not yet linked to an obligation.",
        children: [
          { icon: "frame", name: "page-head" },
          { icon: "vector", name: "rule" },
          { icon: "frame", name: "notes" },
          { icon: "frame", name: "evidence" },
        ],
      },
      {
        node: "11:724", name: "Audit trail – Exceptions", x: 1540, y: 1000, w: 1440, h: 900,
        src: `${R}/audit-trail.webp`,
        alt: "Regis's audit trail: every state change as an immutable ledger row with actor, action, item and extra detail.",
        children: [
          { icon: "frame", name: "toolbar" },
          { icon: "vector", name: "rule" },
          { icon: "frame", name: "thead" },
          { icon: "frame", name: "row" },
          { icon: "frame", name: "panel-foot" },
        ],
      },
      {
        node: "12:693", name: "Reports – Board pack", x: 3080, y: 1000, w: 1440, h: 900,
        src: `${R}/reports-board-pack.webp`,
        alt: "Regis's compliance report for the board: the standing position as figures, an overdue table, and HTML and PDF export controls.",
        children: [
          { icon: "frame", name: "page-head" },
          { icon: "vector", name: "rule" },
          { icon: "frame", name: "note" },
          { icon: "frame", name: "meta" },
          { icon: "frame", name: "metric-strip" },
          { icon: "frame", name: "section-overdue" },
        ],
      },
      {
        node: "12:931", name: "Team – Roles", x: 0, y: 2000, w: 1440, h: 900,
        src: `${R}/team-roles.webp`,
        alt: "Regis's team screen: active members and pending invites with preparer, approver and head-of-compliance roles, over a matrix of which role can do what.",
        children: [
          { icon: "frame", name: "page-head" },
          { icon: "vector", name: "rule" },
          { icon: "frame", name: "note" },
          { icon: "frame", name: "active-members" },
          { icon: "frame", name: "pending" },
          { icon: "frame", name: "role-matrix" },
        ],
      },
      {
        node: "14:878", name: "Notifications – Inbox", x: 1540, y: 2000, w: 1440, h: 900,
        src: `${R}/notifications.webp`,
        alt: "Regis's notification inbox, grouped by obligation: escalations, reviews requested, items sent back, and assignments.",
        children: [
          { icon: "frame", name: "notification" },
        ],
      },
      {
        node: "14:1052", name: "Legal updates – Feed", x: 3080, y: 2000, w: 1440, h: 900,
        src: `${R}/legal-updates.webp`,
        alt: "Regis's legal-updates feed: new and amended regulation, each entry ending in what it changed in your own register.",
        children: [
          { icon: "frame", name: "update" },
        ],
      },
      {
        node: "15:1043", name: "Onboarding – Confirm derived values", x: 0, y: 3000, w: 1440, h: 900,
        src: `${R}/onboarding.webp`,
        alt: "Regis's onboarding: the compliance profile at 92%, the contradictions it found, and the derived values waiting to be confirmed with their confidence and source.",
        children: [
          { icon: "frame", name: "page-head" },
          { icon: "vector", name: "rule" },
          { icon: "frame", name: "stepper" },
          { icon: "frame", name: "profile-completeness" },
          { icon: "frame", name: "contradictions" },
          { icon: "frame", name: "derived" },
          { icon: "frame", name: "actions" },
        ],
      },
      {
        node: "15:1218", name: "Sign in – Create workspace", x: 1540, y: 3000, w: 1440, h: 900,
        src: `${R}/sign-in.webp`,
        alt: "Regis's sign-in and workspace creation, headlined “A defensible compliance calendar for Indian NBFCs.”",
        children: [
          { icon: "frame", name: "auth-aside" },
          { icon: "frame", name: "auth-main" },
        ],
      },
      {
        node: "17:1330", name: "Obligations – Tracker (Dark)", x: 3080, y: 3000, w: 1440, h: 900,
        src: `${R}/tracker-dark.webp`,
        alt: "The same obligation tracker on the dark theme.",
        children: [
          { icon: "frame", name: "page-head" },
          { icon: "vector", name: "rule" },
          { icon: "frame", name: "views" },
          { icon: "frame", name: "tracker" },
        ],
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
        children: [
          { icon: "frame", name: "chrome" },
          { icon: "frame", name: "HERO \u2014 native reconstruction" },
        ],
        src: `${N}/f-browser.webp`,
        alt: "NextG's landing page in a browser frame: the headline “Every outlet, One growth engine.” over a constellation of linked dots, with 500K+ retail outlets, 900+ towns and cities and 20+ challenger brands beneath it.",
      },
      {
        node: "144:701", name: "states", x: 2143, y: 1269, w: 1440, h: 374,
        children: [
          { icon: "frame", name: "state 0.00" },
          { icon: "frame", name: "state 0.55" },
          { icon: "frame", name: "state 1.00" },
        ],
        src: `${N}/f-states.webp`,
        alt: "Three states of the same NextG component at 0.00, 0.55 and 1.00.",
      },
      {
        node: "144:4986", name: "row", x: 2135, y: 1726, w: 1440, h: 548,
        children: [
          { icon: "frame", name: "Services" },
          { icon: "frame", name: "Industries" },
        ],
        src: `${N}/f-services.webp`,
        alt: "NextG's services and industries sections, side by side.",
      },
      {
        node: "144:5037", name: "row", x: 2135, y: 2349, w: 1440, h: 548,
        children: [
          { icon: "frame", name: "Brands" },
          { icon: "frame", name: "Testimonials" },
        ],
        src: `${N}/f-brands.webp`,
        alt: "NextG's brands and testimonials sections, side by side.",
      },
      {
        node: "144:5097", name: "row", x: 2135, y: 3012, w: 1440, h: 548,
        children: [
          { icon: "frame", name: "Leadership" },
          { icon: "frame", name: "Closing band" },
        ],
        src: `${N}/f-leadership.webp`,
        alt: "NextG's leadership section beside its closing band.",
      },
      {
        node: "144:5145", name: "featured – coverage map", x: 2135, y: 3744, w: 1440, h: 665,
        children: [
          { icon: "frame", name: "screen \u2014 tab1" },
          { icon: "vector", name: "Rectangle" },
          { icon: "vector", name: "Ellipse" },
          { icon: "text", name: "1" },
          { icon: "text", name: "2" },
          { icon: "text", name: "3" },
        ],
        src: `${N}/f-coverage.webp`,
        alt: "NextG's coverage map view: every outlet, beat and territory on one live map, with 94% coverage, 900+ towns live and 512K outlets.",
      },
      {
        node: "144:5201", name: "other views", x: 2135, y: 4600, w: 1440, h: 307,
        children: [
          { icon: "frame", name: "Execution" },
          { icon: "frame", name: "Live intelligence" },
          { icon: "frame", name: "Field ops" },
        ],
        src: `${N}/f-other-views.webp`,
        alt: "Three further NextG views: execution, live intelligence and field ops.",
      },
      {
        node: "144:2396", name: "row", x: 2135, y: 5033, w: 1440, h: 647,
        children: [
          { icon: "frame", name: "Book a demo" },
          { icon: "frame", name: "The shop" },
        ],
        src: `${N}/f-demo.webp`,
        alt: "NextG's book-a-demo section beside the shop.",
      },
      {
        node: "144:2546", name: "phones", x: 2135, y: 5806, w: 1440, h: 706,
        children: [
          { icon: "frame", name: "Hero" },
          { icon: "frame", name: "Coordinated growth" },
          { icon: "frame", name: "Product showcase" },
          { icon: "frame", name: "Navigation drawer" },
        ],
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
        children: [
          { icon: "frame", name: "CARD 3" },
          { icon: "frame", name: "CARD 2" },
          { icon: "text", name: "It\u2019s Now More Easy to Order by Our Mobile App" },
          { icon: "component", name: "Mobile app store badge" },
          { icon: "text", name: "Soon You Can Lounge Before You Fly" },
          { icon: "vector", name: "Arrow 1 (Stroke)" },
        ],
      },
      {
        node: "204:1274", name: "iPhone 16 Pro Max - 14",
        x: 1540, y: 197, w: 440, h: 1812,
        src: "/work/layover-page/01-landing-page-440px.webp",
        alt:
          "Layover — Landing page — 440px. Single column, prep time retained.",
        children: [
          { icon: "frame", name: "logo" },
          { icon: "text", name: "Terminal 3" },
          { icon: "text", name: "Indira Gandhi International Airport" },
          { icon: "vector", name: "tim-hortons-logo-png_seeklogo-140033 2" },
          { icon: "vector", name: "mcdonalds-logo-transparent-background-free-png 1" },
          { icon: "vector", name: "Subway_2016_logo.svg 1" },
        ],
      },
      {
        node: "204:1425", name: "terminal enter page",
        x: 0, y: 4090, w: 1440, h: 3496,
        src: "/work/layover-page/02-terminal-entry.webp",
        alt:
          "Layover — Terminal entry. One field: airport or PNR.",
        children: [
          { icon: "frame", name: "CARD 3" },
          { icon: "frame", name: "CARD 2" },
          { icon: "text", name: "It\u2019s Now More Easy to Order by Our Mobile App" },
          { icon: "component", name: "Mobile app store badge" },
          { icon: "text", name: "Soon You Can Lounge Before You Fly" },
          { icon: "vector", name: "Arrow 1 (Stroke)" },
        ],
      },
      {
        node: "204:1567", name: "Desktop - 80",
        x: 1540, y: 4090, w: 1440, h: 2446,
        src: "/work/layover-page/02-outlet-listing.webp",
        alt:
          "Layover — Outlet listing. Prep time and Get Directions on every card.",
        children: [
          { icon: "frame", name: "Footer" },
          { icon: "text", name: "Terminal 3" },
          { icon: "text", name: "Indira Gandhi International Airport" },
          { icon: "text", name: "All" },
          { icon: "text", name: "Veg" },
          { icon: "text", name: "Non-Veg" },
          { icon: "text", name: "Filters" },
        ],
      },
      {
        node: "204:1671", name: "Desktop - 73",
        x: 3080, y: 4090, w: 1440, h: 2315,
        src: "/work/layover-page/02-outlet-menu.webp",
        alt:
          "Layover — Outlet menu. Veg / non-veg as a header control.",
        children: [
          { icon: "text", name: "Mc Donald\u2019s" },
          { icon: "vector", name: "mcdonalds-logo-transparent-background-free-png 1" },
          { icon: "frame", name: "logo" },
          { icon: "frame", name: "Footer" },
        ],
      },
      {
        node: "204:1796", name: "Desktop - 78",
        x: 4620, y: 4090, w: 1440, h: 1551,
        src: "/work/layover-page/02-cart.webp",
        alt:
          "Layover — Cart. Fees itemised before payment.",
        children: [
          { icon: "text", name: "Cart" },
          { icon: "text", name: "Complete your meal with" },
        ],
      },
      {
        node: "204:2050", name: "Desktop - 59",
        x: 0, y: 7676, w: 1440, h: 1118,
        src: "/work/layover-page/02-payment-options.webp",
        alt:
          "Layover — Payment options. UPI, cards, netbanking, pay on pickup.",
        children: [
          { icon: "frame", name: "Footer" },
          { icon: "text", name: "More Payment Options" },
          { icon: "text", name: "Payment Options" },
        ],
      },
      {
        node: "204:2149", name: "Desktop - 79",
        x: 1540, y: 7676, w: 1440, h: 1531,
        src: "/work/layover-page/02-order-confirmed.webp",
        alt:
          "Layover — Order confirmed. Live countdown against prep time.",
        children: [
          { icon: "frame", name: "Desktop - 57" },
          { icon: "text", name: "Order Confirmed" },
          { icon: "frame", name: "map frame" },
          { icon: "text", name: "map" },
          { icon: "text", name: "view order details" },
          { icon: "frame", name: "Footer" },
        ],
      },
      {
        node: "204:2275", name: "Profile",
        x: 3080, y: 7676, w: 1440, h: 1531,
        src: "/work/layover-page/02-account.webp",
        alt:
          "Layover — Account. Orders, lounge bookings, preferences.",
        children: [
          { icon: "frame", name: "Desktop - 57" },
          { icon: "frame", name: "Footer" },
        ],
      },
      {
        node: "204:2436", name: "Location-airport-selection",
        x: 0, y: 9604, w: 440, h: 1008,
        src: "/work/layover-page/03-airport-selection.webp",
        alt:
          "Layover — Airport selection.",
        children: [
          { icon: "vector", name: "Container" },
          { icon: "text", name: "Indira Gandhi International Airport" },
          { icon: "text", name: "Departures, Terminal 3" },
          { icon: "frame", name: "dropdown-arrow-svgrepo-com 1" },
          { icon: "frame", name: "map-arrow-up-svgrepo-com 1" },
          { icon: "frame", name: "profile-circle-svgrepo-com 1" },
          { icon: "frame", name: "Status bar" },
        ],
      },
      {
        node: "204:2512", name: "Food-home",
        x: 520, y: 9604, w: 440, h: 1767,
        src: "/work/layover-page/03-home.webp",
        alt:
          "Layover — Home.",
        children: [
          { icon: "vector", name: "Container" },
          { icon: "text", name: "Indira Gandhi International Airport" },
          { icon: "text", name: "Departures, Terminal 3" },
          { icon: "frame", name: "dropdown-arrow-svgrepo-com 1" },
          { icon: "frame", name: "map-arrow-up-svgrepo-com 1" },
          { icon: "frame", name: "profile-circle-svgrepo-com 1" },
          { icon: "frame", name: "Status bar" },
        ],
      },
      {
        node: "204:2682", name: "food menu",
        x: 1040, y: 9604, w: 440, h: 1767,
        src: "/work/layover-page/03-outlet-menu.webp",
        alt:
          "Layover — Outlet menu.",
        children: [
          { icon: "vector", name: "Container" },
          { icon: "frame", name: "dropdown-arrow-svgrepo-com 1" },
          { icon: "frame", name: "profile-circle-svgrepo-com 1" },
          { icon: "frame", name: "Status bar" },
          { icon: "text", name: "10-15 Min." },
          { icon: "text", name: "4.5" },
          { icon: "text", name: "KFC" },
        ],
      },
      {
        node: "204:2885", name: "added to cart",
        x: 1560, y: 9604, w: 440, h: 1767,
        src: "/work/layover-page/03-item-added.webp",
        alt:
          "Layover — Item added.",
        children: [
          { icon: "vector", name: "Container" },
          { icon: "frame", name: "dropdown-arrow-svgrepo-com 1" },
          { icon: "frame", name: "profile-circle-svgrepo-com 1" },
          { icon: "frame", name: "Status bar" },
          { icon: "text", name: "10-15 Min." },
          { icon: "text", name: "4.5" },
          { icon: "text", name: "KFC" },
        ],
      },
      {
        node: "204:3097", name: "cart with to pay dropdown",
        x: 2080, y: 9604, w: 440, h: 1767,
        src: "/work/layover-page/03-cart-and-payment.webp",
        alt:
          "Layover — Cart and payment.",
        children: [
          { icon: "vector", name: "Container" },
          { icon: "frame", name: "dropdown-arrow-svgrepo-com 1" },
          { icon: "frame", name: "profile-circle-svgrepo-com 1" },
          { icon: "frame", name: "Status bar" },
          { icon: "component", name: "mdi:lacto-vegetarian" },
          { icon: "text", name: "Maharaja Mac" },
          { icon: "text", name: "Cart" },
        ],
      },
      {
        node: "204:3260", name: "Sign Up-1",
        x: 0, y: 11768, w: 375, h: 861,
        src: "/work/layover-page/04-phone-social.webp",
        alt:
          "Layover — Phone + social.",
        children: [
          { icon: "frame", name: "Content" },
          { icon: "frame", name: "Headline" },
          { icon: "component", name: "Native / Status Bar" },
          { icon: "component", name: "Native / Home Indicator" },
        ],
      },
      {
        node: "204:3707", name: "Sign Up-2",
        x: 455, y: 11768, w: 375, h: 861,
        src: "/work/layover-page/04-otp-pass-2.webp",
        alt:
          "Layover — OTP — pass 2.",
        children: [
          { icon: "frame", name: "Content" },
          { icon: "frame", name: "Headline" },
          { icon: "component", name: "Native / Status Bar" },
          { icon: "component", name: "Native / Home Indicator" },
          { icon: "component", name: "iOS Numeric Keyboard" },
        ],
      },
      {
        node: "204:4131", name: "Sign Up-3",
        x: 910, y: 11768, w: 375, h: 861,
        src: "/work/layover-page/04-otp-pass-3.webp",
        alt:
          "Layover — OTP — pass 3.",
        children: [
          { icon: "frame", name: "Content" },
          { icon: "frame", name: "Headline" },
          { icon: "component", name: "Native / Status Bar" },
          { icon: "component", name: "Native / Home Indicator" },
        ],
      },
      {
        node: "204:4559", name: "Sign Up-4",
        x: 1365, y: 11768, w: 375, h: 861,
        src: "/work/layover-page/04-otp-pass-4.webp",
        alt:
          "Layover — OTP — pass 4.",
        children: [
          { icon: "frame", name: "Content" },
          { icon: "frame", name: "Headline" },
          { icon: "component", name: "Native / Status Bar" },
          { icon: "component", name: "Native / Home Indicator" },
          { icon: "component", name: "iOS Numeric Keyboard" },
        ],
      },
      {
        node: "204:4988", name: "Sign Up-5",
        x: 1820, y: 11768, w: 375, h: 861,
        src: "/work/layover-page/04-otp-final-with-error-state.webp",
        alt:
          "Layover — OTP — final, with error state.",
        children: [
          { icon: "frame", name: "Content" },
          { icon: "frame", name: "Headline" },
          { icon: "component", name: "Native / Status Bar" },
          { icon: "component", name: "Native / Home Indicator" },
          { icon: "component", name: "iOS Numeric Keyboard" },
        ],
      },
      {
        node: "205:2929", name: "Dashboard_V2",
        x: 0, y: 13026, w: 1440, h: 1118,
        src: "/work/layover-page/05-order-queue.webp",
        alt:
          "Layover — Order queue. Colour-coded by state.",
        children: [
          { icon: "frame", name: "header" },
          { icon: "frame", name: "order history" },
          { icon: "frame", name: "revenue Chart" },
          { icon: "frame", name: "accept oreder" },
          { icon: "frame", name: "order review" },
          { icon: "frame", name: "Alerts" },
          { icon: "frame", name: "Summary" },
        ],
      },
      {
        node: "205:3188", name: "Order",
        x: 1540, y: 13026, w: 1440, h: 1118,
        src: "/work/layover-page/05-order-card.webp",
        alt:
          "Layover — Order card. Accept and Reject take the largest targets.",
        children: [
          { icon: "text", name: "Dashboard" },
          { icon: "frame", name: "order 1" },
          { icon: "frame", name: "order 26" },
          { icon: "frame", name: "order 27" },
          { icon: "frame", name: "order 28" },
          { icon: "frame", name: "order 29" },
          { icon: "frame", name: "order 30" },
        ],
      },
      {
        node: "205:3449", name: "empty",
        x: 3080, y: 13026, w: 1440, h: 1118,
        src: "/work/layover-page/05-empty-queue.webp",
        alt:
          "Layover — Empty queue. Designed before the populated version.",
        children: [
          { icon: "frame", name: "header" },
          { icon: "frame", name: "searchbar" },
          { icon: "frame", name: "add section" },
          { icon: "frame", name: "add item" },
        ],
      },
      {
        node: "205:3541", name: "Menu",
        x: 4620, y: 13026, w: 1440, h: 1118,
        src: "/work/layover-page/05-menu-management.webp",
        alt:
          "Layover — Menu management. Edited in place, not in a settings tree.",
        children: [
          { icon: "frame", name: "header" },
          { icon: "frame", name: "searchbar" },
          { icon: "frame", name: "add section" },
          { icon: "frame", name: "add item" },
        ],
      },
      {
        node: "205:3677", name: "add/edit item",
        x: 0, y: 14234, w: 1440, h: 1118,
        src: "/work/layover-page/05-item-editor.webp",
        alt:
          "Layover — Item editor. Preparation Time is a required field.",
        children: [
          { icon: "frame", name: "header" },
          { icon: "text", name: "Add Ons" },
          { icon: "frame", name: "scroll bar" },
        ],
      },
      {
        node: "205:3867", name: "Coupon",
        x: 1540, y: 14234, w: 1440, h: 1118,
        src: "/work/layover-page/05-coupons.webp",
        alt:
          "Layover — Coupons. Scoped to items and dates.",
        children: [
          { icon: "frame", name: "coupons" },
          { icon: "frame", name: "buton" },
        ],
      },
      {
        node: "205:4110", name: "Analytics and report UI",
        x: 3080, y: 14234, w: 1440, h: 1118,
        src: "/work/layover-page/05-analytics.webp",
        alt:
          "Layover — Analytics. The same numbers admin grades them on.",
        children: [
          { icon: "frame", name: "header" },
        ],
      },
      {
        node: "205:4457", name: "reviews",
        x: 4620, y: 14234, w: 1440, h: 1118,
        src: "/work/layover-page/05-reviews.webp",
        alt:
          "Layover — Reviews. Vendor can reply directly.",
        children: [
          { icon: "frame", name: "coupons" },
          { icon: "frame", name: "buton" },
        ],
      },
      {
        node: "205:4639", name: "Profile and Settings_1",
        x: 0, y: 15442, w: 1440, h: 1118,
        src: "/work/layover-page/05-business-profile.webp",
        alt:
          "Layover — Business profile. Logo, cuisine, operating hours.",
        children: [
          { icon: "frame", name: "header" },
          { icon: "frame", name: "button" },
          { icon: "text", name: "Contact Details" },
          { icon: "text", name: "Business Details" },
        ],
      },
      {
        node: "205:4816", name: "Profile and Settings_2",
        x: 1540, y: 15442, w: 1440, h: 1118,
        src: "/work/layover-page/05-bank-details-gst-and-pan.webp",
        alt:
          "Layover — Bank details, GST and PAN. Upload proof stays visible after saving.",
        children: [
          { icon: "frame", name: "header" },
          { icon: "frame", name: "button" },
          { icon: "text", name: "Bank Details" },
          { icon: "text", name: "Business and Tax" },
        ],
      },
      {
        node: "205:4897", name: "Dahboard-BOTH",
        x: 0, y: 16957, w: 393, h: 901,
        src: "/work/layover-page/06-dashboard.webp",
        alt:
          "Layover — Dashboard.",
        children: [
          { icon: "text", name: "Dashboard" },
          { icon: "frame", name: "pajamas:hamburger" },
          { icon: "frame", name: "searchbar" },
          { icon: "text", name: "Orders Pending" },
          { icon: "frame", name: "fluent:filter-16-filled" },
        ],
      },
      {
        node: "205:5279", name: "FRONT",
        x: 473, y: 16957, w: 393, h: 901,
        src: "/work/layover-page/06-incoming-order.webp",
        alt:
          "Layover — Incoming order.",
        children: [
          { icon: "text", name: "Dashboard" },
          { icon: "frame", name: "pajamas:hamburger" },
          { icon: "frame", name: "searchbar" },
        ],
      },
      {
        node: "205:5373", name: "INSIDE",
        x: 946, y: 16957, w: 393, h: 901,
        src: "/work/layover-page/06-order-detail.webp",
        alt:
          "Layover — Order detail.",
        children: [
          { icon: "text", name: "Dashboard" },
          { icon: "frame", name: "pajamas:hamburger" },
          { icon: "frame", name: "searchbar" },
          { icon: "text", name: "Orders Pending" },
          { icon: "frame", name: "fluent:filter-16-filled" },
        ],
      },
      {
        node: "205:5734", name: "Dashboard",
        x: 1419, y: 16957, w: 393, h: 901,
        src: "/work/layover-page/06-queue.webp",
        alt:
          "Layover — Queue.",
        children: [
          { icon: "text", name: "Dashboard" },
          { icon: "frame", name: "pajamas:hamburger" },
          { icon: "frame", name: "searchbar" },
          { icon: "text", name: "Orders Pending" },
          { icon: "frame", name: "fluent:filter-16-filled" },
        ],
      },
      {
        node: "205:6133", name: "iPhone 16 - 1",
        x: 1892, y: 16957, w: 393, h: 901,
        src: "/work/layover-page/06-menu.webp",
        alt:
          "Layover — Menu.",
        children: [
          { icon: "text", name: "Dashboard" },
          { icon: "frame", name: "pajamas:hamburger" },
          { icon: "frame", name: "searchbar" },
          { icon: "frame", name: "order 6" },
          { icon: "frame", name: "order 1" },
          { icon: "frame", name: "order 7" },
        ],
      },
      {
        node: "205:6196", name: "Vendor Onboarding1",
        x: 0, y: 18255, w: 1423, h: 1106,
        src: "/work/layover-page/07-01-business-details.webp",
        alt:
          "Layover — 01 · Business details. Completable on a phone at the counter.",
        children: [
          { icon: "text", name: "Vendor Onboarding" },
          { icon: "text", name: "Complete your registration" },
          { icon: "text", name: "Registration" },
          { icon: "text", name: "Verification" },
          { icon: "text", name: "Business Name" },
        ],
      },
      {
        node: "205:6237", name: "Vendor Onboarding2",
        x: 1523, y: 18255, w: 1423, h: 1061,
        src: "/work/layover-page/07-02-contact-details.webp",
        alt:
          "Layover — 02 · Contact details.",
        children: [
          { icon: "text", name: "Vendor Onboarding" },
          { icon: "text", name: "Complete your registration" },
          { icon: "text", name: "Registration" },
          { icon: "text", name: "Verification" },
          { icon: "text", name: "Documents" },
          { icon: "text", name: "Approval" },
        ],
      },
      {
        node: "205:6293", name: "Vendor Onboarding3",
        x: 3045, y: 18255, w: 1423, h: 1061,
        src: "/work/layover-page/07-03-email-and-phone-otp.webp",
        alt:
          "Layover — 03 · Email and phone OTP.",
        children: [
          { icon: "text", name: "Vendor Onboarding" },
          { icon: "text", name: "Complete your registration" },
          { icon: "text", name: "Registration" },
          { icon: "text", name: "Verification" },
          { icon: "text", name: "Documents" },
          { icon: "text", name: "Approval" },
        ],
      },
      {
        node: "205:6345", name: "Vendor Onboarding4",
        x: 4568, y: 18255, w: 1423, h: 1326,
        src: "/work/layover-page/07-04-kyc-fssai-trade-licence.webp",
        alt:
          "Layover — 04 · KYC, FSSAI, trade licence. Constraint stated under the field.",
        children: [
          { icon: "text", name: "Vendor Onboarding" },
          { icon: "text", name: "Complete your registration" },
          { icon: "text", name: "Registration" },
          { icon: "text", name: "Verification" },
          { icon: "text", name: "Documents" },
          { icon: "text", name: "Approval" },
        ],
      },
      {
        node: "205:6414", name: "Vendor Onboarding5",
        x: 0, y: 19671, w: 1423, h: 1281,
        src: "/work/layover-page/07-05-bank-details.webp",
        alt:
          "Layover — 05 · Bank details.",
        children: [
          { icon: "text", name: "Vendor Onboarding" },
          { icon: "text", name: "Complete your registration" },
          { icon: "text", name: "Registration" },
          { icon: "text", name: "Verification" },
          { icon: "text", name: "Documents" },
          { icon: "text", name: "Approval" },
        ],
      },
      {
        node: "205:6479", name: "Vendor Onboarding6",
        x: 1523, y: 19671, w: 1423, h: 1419,
        src: "/work/layover-page/07-06-submitted.webp",
        alt:
          "Layover — 06 · Submitted. Approval estimate and what happens next.",
        children: [
          { icon: "text", name: "Vendor Onboarding" },
          { icon: "text", name: "Complete your registration" },
          { icon: "text", name: "Registration" },
          { icon: "text", name: "Verification" },
          { icon: "text", name: "Documents" },
          { icon: "text", name: "Approval" },
        ],
      },
      {
        node: "205:6539", name: "Vendor_Management",
        x: 0, y: 21487, w: 1440, h: 1118,
        src: "/work/layover-page/08-vendor-management.webp",
        alt:
          "Layover — Vendor management. Four metrics per row.",
        children: [
          { icon: "text", name: "Vendor Management" },
          { icon: "text", name: "Monitor and control vendor operations and performance" },
        ],
      },
      {
        node: "205:6750", name: "Vendor_Onboarding",
        x: 1540, y: 21487, w: 1440, h: 1073,
        src: "/work/layover-page/08-onboarding-approval.webp",
        alt:
          "Layover — Onboarding approval.",
        children: [
          { icon: "text", name: "Vendor Onboarding" },
          { icon: "text", name: "Manage vendor applications and onboard new partners" },
        ],
      },
      {
        node: "205:6925", name: "Vendor_Management(Menu)",
        x: 3080, y: 21487, w: 1440, h: 1118,
        src: "/work/layover-page/08-menu-oversight.webp",
        alt:
          "Layover — Menu oversight. Admin can correct a listing directly.",
        children: [
          { icon: "text", name: "Vendor Management" },
          { icon: "text", name: "Monitor and control vendor operations and performance" },
          { icon: "text", name: "Back to Menu" },
        ],
      },
      {
        node: "205:7129", name: "Orders",
        x: 4620, y: 21487, w: 1440, h: 1073,
        src: "/work/layover-page/08-order-management.webp",
        alt:
          "Layover — Order management.",
        children: [
          { icon: "frame", name: "coupons" },
          { icon: "frame", name: "buton" },
        ],
      },
      {
        node: "205:7380", name: "User_Management",
        x: 0, y: 22695, w: 1440, h: 1073,
        src: "/work/layover-page/08-user-management.webp",
        alt:
          "Layover — User management.",
        children: [
          { icon: "text", name: "Vendor Management" },
          { icon: "text", name: "Monitor and control vendor operations and performance" },
          { icon: "text", name: "47 orders" },
          { icon: "text", name: "Contact" },
          { icon: "text", name: "Order Stats" },
          { icon: "text", name: "Member Since" },
        ],
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
