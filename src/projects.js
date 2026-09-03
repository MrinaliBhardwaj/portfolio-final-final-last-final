// The design file's PROJECT PAGES.
//
// One module because this list feeds four things that must never disagree: the
// artboards on the design canvas, the layers panel's selected-work children,
// the Pages list in the panel, and the case-study page each board opens. When
// the file names lived in two places they drifted within a single edit — see
// the note on FRAMES in DesignWorld.jsx.
//
// `size` is not decoration: it picks the board slot, and that slot is a fixed
// CSS aspect-ratio box (design-world.css: lg 16/10, sm 4/5 portrait, wide
// 2/1). `cover` has to already be cropped to roughly that ratio — see
// scripts/build_project_covers.py, which is also the record of where each
// crop landed and why. Reorder this array and the canvas follows.
//
// `cover` replaced a placeholder SVG sketch (one per `size`, keyed by a
// `sketch` field this file no longer has) once real case-study art existed
// for every board. `shots` is what the case-study page itself renders. A
// project with none still gets a page — it just says so, rather than showing
// an empty frame.

/**
 * A shot is EITHER a single image (`src`) OR a tall export delivered as stacked
 * slices (`strip`) — never both, and never neither. Spelled out because reading
 * `src` blindly on a strip shot is exactly the crash that took the whole design
 * world down once: strips have no `src` at all, and nothing checked the JSX
 * then. Anything consuming `shots` has to branch on `strip` first.
 *
 * @typedef {object} Shot
 * @property {string} [src]         single image, absolute from /public
 * @property {string[]} [strip]     slices of one tall artboard, in order
 * @property {[number, number]} [sliceSize]      w/h shared by every slice
 * @property {[number, number]} [lastSliceSize]  the short last one, if uneven
 * @property {string} [frame]       artboard name, shown as frame chrome
 * @property {string} [dims]        artboard size, shown as the dims pill
 * @property {boolean} [wide]       span the full column rather than half
 * @property {string} caption
 * @property {string} alt
 */

/**
 * THE CASE STUDY IS HTML NOW, NOT AN EXPORT.
 *
 * It used to be one enormous artboard scrolled inside a window - 1400x22306 for
 * Meal Maestro - which meant a case study that could not reflow, could not be
 * read on a phone, and whose every word was a pixel. The window renders
 * sections instead, and the fields below are those sections.
 *
 * Every one is OPTIONAL. A project supplies what it has and the page omits the
 * rest, so no slot ever has to be filled with something invented.
 *
 * @typedef {object} Metric   one number in the outcome band under the hero
 * @property {string} value   "2,200+", "140", "3rd"
 * @property {string} label   what it counts, in a few words
 *
 * @typedef {object} Section  a headed block of prose in the study
 * @property {string} title   "The problem", "The approach"
 * @property {string} body    one or two paragraphs of plain text
 *
 * Optional keys a project may carry, beyond the ones already here:
 *   metrics        Metric[]   the outcome band
 *   sections       Section[]  problem / approach / whatever the study needs
 *   contributions  string[]   "What I did" bullets
 *   archive        Shot       a full exported artboard, folded away at the foot
 *                             of the study rather than BEING the study
 *   screensAs      "rail"     lay the screens across instead of down, aligned
 *                             on a shared height. For UI screens that belong in
 *                             sequence; the default grid suits wide boards.
 */

const BEHANCE = "https://www.behance.net/mrinalibhardwaj1";

export const PROJECTS = [
  {
    slug: "meal-maestro",
    name: "Meal Maestro",
    what: "UI design",
    when: "Mar 2025",
    tag: "GDG Design-a-thon · 3rd",
    blurb:
      "A smart meal-planning app: personalized recipes and grocery lists from user preferences.",
    size: "lg",
    cover: "/work/meal-maestro/cover.webp",
    file: "meal-maestro-final",
    dims: "1440 × 900",
    role: "UI design",
    summary:
      "A meal-planning app built around one idea: the hard part isn't cooking, it's deciding. Meal Maestro takes what you like, what you avoid and what's already in the kitchen, and turns it into a week of recipes and the one grocery list that covers them. Placed third at the GDG Design-a-thon.",
    facts: [
      ["Role", "UI design"],
      ["Timeline", "Mar 2025"],
      ["Recognition", "3rd — GDG Design-a-thon"],
    ],
    external: BEHANCE,
    // Her own numbers, from the research page of the study itself - they were
    // buried in the export's alt text, where a hiring manager scanning for
    // thirty seconds would never find them.
    metrics: [
      { value: "140", label: "survey responses" },
      { value: "12", label: "discovery interviews" },
      { value: "3rd", label: "GDG Design-a-thon" },
    ],
    shots: [],
    // NOT A SHOT ANY MORE. This is the 22,306px export the window used to BE:
    // 18 files of one flat picture, unreflowable, unsearchable, unreadable on a
    // phone. It stays because it is the real work and deleting it would lose
    // it - but it is folded away at the foot of the study as an archive rather
    // than served as the study. When the rebuilt sections arrive, it can go.
    archive: {
        // The full case study, exported from the Figma file
        // (meal-maestro-case-study, node 429-2731) at 1400x22306 and sliced by
        // scripts/build_meal_maestro_shots.py. Slicing is REQUIRED, not an
        // optimisation: WebP's maximum dimension is 16383px, so 22306 cannot be
        // one file — and a bitmap that tall would be ~125 MB of RGBA to decode
        // on the main thread anyway. 17.3 MB of PNG becomes 1.26 MB.
        //
        // (The first file offered for this slot was a screenshot of the Behance
        // PAGE — their header, a "Follow All / Appreciate" bar over her
        // artwork, and ~85% other designers' projects. Check an export's
        // contents before shipping it.)
        //
        // `frame`/`dims` name this as the one Figma artboard it actually is —
        // the 18 files underneath are a delivery detail, not 18 things she drew.
        frame: "case-study",
        dims: "1400 × 22306",
        strip: Array.from(
          { length: 18 },
          (_, i) => `/work/meal-maestro/s${String(i).padStart(2, "0")}.webp`
        ),
        sliceSize: [1400, 1240],
        // 22306 doesn't divide by 18, so the last slice is short. Given exactly
        // rather than rounded, so the space the browser reserves for it matches
        // what arrives and the page doesn't twitch at the very bottom.
        lastSliceSize: [1400, 1226],
        wide: true,
        caption:
          "The full case study — research with real users, the insights it earned, the design system, and the flows it produced.",
        alt:
          "The Meal Maestro case study: a smart meal-planning app for personalized recommendations and nutrition guidance, designed in Vellore, Tamil Nadu, May 2026. It runs from the goal of making healthy eating simpler and more accessible, through branding and primary research grounded in real voices and real data (12 discovery phone interviews, 140 survey responses, 4 comparison teardowns, 5 weeks), into key insights about why people abandon meal planning, then a design system of colour and type — Poppins for display and headings, Open Sans for body — and finally the home, recipe detail, tracker and explore flows, closing on \"Thanks for watching!\".",
    },
  },
  {
    slug: "regis",
    name: "Regis",
    what: "Product design · compliance platform",
    when: "2026",
    tag: "29 Indian laws, one register",
    blurb:
      "A compliance workspace for Indian NBFCs: one entity profile in, 367 dated obligations out, and a board pack at the end of it.",
    size: "lg",
    cover: "/work/regis/cover.webp",
    file: "compliance-checker-regis",
    dims: "1440 × 900",
    role: "Product design, UI design",
    summary:
      "Compliance software fails in a specific way: it tells you everything is due and nothing is urgent. Regis takes one entity profile and derives 367 dated obligations from 106 templates across 29 Indian laws, then spends the whole interface on the only question a compliance officer has at 9am — what is going to cost money today. Overdue leads every screen, the queue is ranked by risk against time rather than by date, and maker-checker is drawn into the roles rather than bolted on. Designed and built end to end; the engineering side is in the README.",
    facts: [
      ["Role", "Product design · UI design"],
      ["Timeline", "2026"],
      ["Surfaces", "Web app, light and dark"],
      ["Engineering", "FastAPI · PostgreSQL · Next.js · TypeScript"],
    ],
    metrics: [
      { value: "367", label: "obligations derived from one profile" },
      { value: "29", label: "Indian laws covered" },
      { value: "12", label: "screens, light and dark" },
    ],
    // A RAIL: twelve 1440-wide boards down a column is twelve screenfuls of
    // scrolling. Across, at a shared height, they read as the product they are.
    screensAs: "rail",
    external: "https://github.com/MrinaliBhardwaj/compliance-checker",
    shots: [
      {
        src: "/work/regis/today-overview.webp",
        frame: "Today",
        dims: "1440 × 900",
        caption:
          "The standing position, ranked. Every obligation past its statutory date is a penalty accruing per day, so the overdue count leads and the priority queue is ordered by risk against time rather than by date.",
        alt:
          "Regis, the today screen: a compliance workspace for Indian NBFCs, in the product's own restrained grey-and-red interface.",
      },
      {
        src: "/work/regis/obligations-tracker.webp",
        frame: "Obligations",
        dims: "1440 × 900",
        caption:
          "346 obligations across 29 laws, filtered rather than searched — the register is too large to browse, so the controls are the interface.",
        alt:
          "Regis, the obligations screen: a compliance workspace for Indian NBFCs, in the product's own restrained grey-and-red interface.",
      },
      {
        src: "/work/regis/obligation-detail.webp",
        frame: "Obligation detail",
        dims: "1440 × 900",
        caption:
          "One obligation, opened as a sheet over the tracker so you never lose your place in the list you were working through.",
        alt:
          "Regis, the obligation detail screen: a compliance workspace for Indian NBFCs, in the product's own restrained grey-and-red interface.",
      },
      {
        src: "/work/regis/evidence-repository.webp",
        frame: "Evidence",
        dims: "1440 × 900",
        caption:
          "What was filed, when, and by whom. The AI classification sits beside each file rather than replacing the human column.",
        alt:
          "Regis, the evidence screen: a compliance workspace for Indian NBFCs, in the product's own restrained grey-and-red interface.",
      },
      {
        src: "/work/regis/audit-trail.webp",
        frame: "Audit trail",
        dims: "1440 × 900",
        caption:
          "Every state change, immutable. This is the screen a regulator asks for, so it reads as a ledger and not as a feed.",
        alt:
          "Regis, the audit trail screen: a compliance workspace for Indian NBFCs, in the product's own restrained grey-and-red interface.",
      },
      {
        src: "/work/regis/reports-board-pack.webp",
        frame: "Reports",
        dims: "1440 × 900",
        caption:
          "The board pack, generated. The quarterly report is the output the whole system exists to produce.",
        alt:
          "Regis, the reports screen: a compliance workspace for Indian NBFCs, in the product's own restrained grey-and-red interface.",
      },
      {
        src: "/work/regis/team-roles.webp",
        frame: "Team",
        dims: "1440 × 900",
        caption:
          "Maker-checker, made visible: who can prepare, who can approve, and the rule that the two cannot be one person.",
        alt:
          "Regis, the team screen: a compliance workspace for Indian NBFCs, in the product's own restrained grey-and-red interface.",
      },
      {
        src: "/work/regis/notifications.webp",
        frame: "Notifications",
        dims: "1440 × 900",
        caption:
          "99+ is a failure state, not a badge. The inbox groups by obligation so a single filing does not arrive as eleven separate alerts.",
        alt:
          "Regis, the notifications screen: a compliance workspace for Indian NBFCs, in the product's own restrained grey-and-red interface.",
      },
      {
        src: "/work/regis/legal-updates.webp",
        frame: "Legal updates",
        dims: "1440 × 900",
        caption:
          "New and amended law, and what it changed in your register — the feed's job is to end at an obligation, not at an article.",
        alt:
          "Regis, the legal updates screen: a compliance workspace for Indian NBFCs, in the product's own restrained grey-and-red interface.",
      },
      {
        src: "/work/regis/onboarding.webp",
        frame: "Onboarding",
        dims: "1440 × 900",
        caption:
          "The derived values, confirmed. The engine reads 367 obligations out of one entity profile, so the profile is where the whole system is right or wrong.",
        alt:
          "Regis, the onboarding screen: a compliance workspace for Indian NBFCs, in the product's own restrained grey-and-red interface.",
      },
      {
        src: "/work/regis/sign-in.webp",
        frame: "Sign in",
        dims: "1440 × 900",
        caption:
          "Workspace creation, in the same restrained type as the product it opens into.",
        alt:
          "Regis, the sign in screen: a compliance workspace for Indian NBFCs, in the product's own restrained grey-and-red interface.",
      },
      {
        src: "/work/regis/tracker-dark.webp",
        frame: "Tracker, dark",
        dims: "1440 × 900",
        caption:
          "The same tracker on the dark theme — a compliance officer's screen is open for eight hours, so both themes are first-class.",
        alt:
          "Regis, the tracker, dark screen: a compliance workspace for Indian NBFCs, in the product's own restrained grey-and-red interface.",
      },
    ],
  },
  {
    slug: "nextg",
    name: "NextG Apex",
    what: "Product & brand design · retail platform",
    when: "2026",
    tag: "500K+ outlets, one growth engine",
    blurb:
      "The phygital engine for retail: field execution, store intelligence and visibility for FMCG brands, as one site and one app.",
    size: "wide",
    cover: "/work/nextg/cover.webp",
    file: "nextg-apex",
    dims: "1440 × 900",
    role: "Product design, brand, UI design",
    summary:
      "NextG sells reach — half a million retail outlets across 900 towns — and the design problem is that reach is abstract until you can see it. The site opens on the network itself, drawn as a constellation, and every number under the headline is a claim the coverage map then has to make good on. The app is the other half: the same system in the hand of someone standing in a store, where the drawer and the showcase have to work one-thumbed in a bad-signal aisle.",
    facts: [
      ["Role", "Product design · brand · UI"],
      ["Timeline", "2026"],
      ["Surfaces", "Marketing site, mobile app"],
    ],
    metrics: [
      { value: "500K+", label: "retail outlets, scaling to 3M" },
      { value: "900+", label: "towns and cities" },
      { value: "20+", label: "challenger brands" },
    ],
    // A rail: a desktop board and four portrait phone screens have nothing in
    // common but their height, which is exactly what the rail aligns them on.
    screensAs: "rail",
    shots: [
      {
        src: "/work/nextg/desktop.webp",
        frame: "The site",
        dims: "1440 × 951",
        caption:
          "The landing page. The network is the product, so the network is the artwork — and the three figures under the headline are what the rest of the site has to substantiate.",
        alt:
          "NextG's landing page in a browser frame: navigation, the headline \u201cEvery outlet, One growth engine.\u201d in black and blue over a constellation of linked dots, a \u201cBook a demo\u201d button, and the figures 500K+ retail outlets, 900+ towns and cities, 20+ challenger brands.",
      },
      {
        src: "/work/nextg/coverage-map.webp",
        frame: "Coverage",
        dims: "1440 × 665",
        caption:
          "The claim, made good. Reach is abstract until it is a map, and this is the screen the headline's numbers are cashed against.",
        alt: "NextG's featured coverage map view, showing retail distribution across the country.",
      },
      {
        src: "/work/nextg/phone-hero.webp",
        frame: "App · home",
        dims: "316 × 706",
        caption: "The same system in the hand of someone standing in a store.",
        alt: "NextG's mobile home screen.",
      },
      {
        src: "/work/nextg/phone-growth.webp",
        frame: "App · growth",
        dims: "316 × 706",
        caption: "Coordinated growth — the numbers a brand manager checks first.",
        alt: "NextG's mobile coordinated-growth screen.",
      },
      {
        src: "/work/nextg/phone-showcase.webp",
        frame: "App · showcase",
        dims: "316 × 706",
        caption: "The product showcase, built to be read one-thumbed in an aisle.",
        alt: "NextG's mobile product showcase screen.",
      },
      {
        src: "/work/nextg/phone-drawer.webp",
        frame: "App · navigation",
        dims: "316 × 706",
        caption: "The drawer. Everything the app does, in one reachable list.",
        alt: "NextG's mobile navigation drawer.",
      },
    ],
  },
  {
    slug: "layover",
    name: "Layover",
    what: "Brand & product design · web and mobile",
    when: "2025",
    tag: "Airport dwell time, redesigned",
    blurb:
      "An airport companion: order meals from your terminal and book lounge access, in the hours between flights.",
    size: "sm",
    cover: "/work/layover/cover.webp",
    file: "layover-v3",
    dims: "1080 × 1350",
    role: "Brand identity, UI design, product design",
    summary:
      "A layover is dead time you've already paid for. Layover turns it into something usable: enter your airport or PNR and it shows what's actually open in your terminal right now — order a meal to your gate, or book into a lounge. Built around Indian airports (Delhi, Mumbai, Bengaluru, Hyderabad) and the details that matters there: terminal-aware delivery, veg and non-veg filters as a first-class control, and a live prep timer so you know whether you have time before boarding.",
    facts: [
      ["Role", "Brand identity · UI · product design"],
      ["Surfaces", "Marketing site, web app, mobile app"],
      ["Timeline", "2025"],
    ],
    external: BEHANCE,
    // Shipped as a real product — the case-study page links here instead of
    // back to Behance, since the live thing outranks mockups of it.
    live: "https://mylayover.in/",
    // HER CALL, 2 Sep 2026: a rail, not a grid. Layover is a phone product and
    // its screens are meant to be read across, in order — a column turns one
    // flow into eight screenfuls of scrolling.
    screensAs: "rail",
    metrics: [
      { value: "4", label: "airports at launch" },
      { value: "3", label: "surfaces: site, web app, mobile app" },
      { value: "Live", label: "shipped at mylayover.in" },
    ],
    shots: [
      {
        src: "/work/layover/hero.webp",
        frame: "hero",
        dims: "1600 × 900",
        wide: true,
        caption: "The landing page. One question — which airport are you in — and the whole product follows from the answer.",
        alt:
          "Layover's landing page over a photograph of an airport atrium, headline \"Order Meals, Access Lounges. All In One App.\", with a panel listing Hyderabad RGIA, Bengaluru KIA, Mumbai CSIA and Delhi IGI above a field reading \"enter your airport / PNR\".",
      },
      {
        src: "/work/layover/brand.webp",
        frame: "brand",
        dims: "1600 × 900",
        wide: true,
        caption:
          "The wordmark, with the rotated ‘e’ — a plane turning back on itself, which is the whole idea of a layover in one letter.",
        alt:
          "The LayOver wordmark in white on a black billboard on a tree-lined street, the ‘e’ rotated 180 degrees.",
      },
      {
        src: "/work/layover/app.webp",
        frame: "app",
        dims: "1600 × 900",
        caption:
          "The app's ordering surface, warm where the marketing site is dark — this is the part you use standing at a gate.",
        alt:
          "Two phone screens showing Layover's food ordering interface in cream and gold: a delivery destination of \"Layover office\", a greeting, a dish search field, category chips for fries and burgers, and an \"Open Stalls\" section.",
      },
      {
        src: "/work/layover/order.webp",
        frame: "order",
        dims: "1600 × 900",
        caption:
          "Browse by terminal, then track the order. Every restaurant card carries its pier, because in an airport \"where\" is the only question that matters.",
        alt:
          "Layover's restaurant directory on desktop showing Tim Hortons, Starbucks, Theobroma, McDonald's, Berco's, Idli.com, KFC and Subway, each labelled \"t3 domestic departure piers\", beside a mobile order-confirmed screen with a twenty-minute prep timer, itemised order and a map.",
      },
      {
        src: "/work/layover/system.webp",
        frame: "system",
        dims: "1600 × 900",
        wide: true,
        caption: "Site and app as one system — the dark front door, the warm room behind it.",
        alt:
          "Layover's marketing site and mobile app shown together, the dark landing page beside the two cream ordering screens.",
      },
    ],
  },
  {
    slug: "futurepreneurs",
    name: "Futurepreneurs 10.0",
    what: "Branding & UI",
    when: "Oct 2024",
    tag: "2,200+ registrations",
    blurb:
      "Full identity and digital assets — website, social, reels, brochures — driving 10,000+ views.",
    size: "wide",
    cover: "/work/futurepreneurs/cover.webp",
    file: "futurepreneurs-final-FINAL(2)",
    dims: "1920 × 720",
    role: "Branding, UI design",
    summary:
      "The tenth edition of Futurepreneurs needed an identity that could hold a whole campaign, not just a poster. One system carried the website, the social run, the reels and the print brochures — which is what let it reach 10,000+ views and convert to 2,200+ registrations.",
    facts: [
      ["Role", "Brand identity · UI design"],
      ["Deliverables", "Website, social, reels, brochures"],
      ["Reach", "10,000+ views · 2,200+ registrations"],
      ["Timeline", "Oct 2024"],
    ],
    // The project's own gallery, not the general profile — same reasoning as
    // Layover's live link: point at the specific thing, not a landing page.
    external: "https://www.behance.net/gallery/221417825/FUTUREPRENEURS-100-UI-Design",
    metrics: [
      { value: "10,000+", label: "views across the campaign" },
      { value: "2,200+", label: "registrations" },
      { value: "10th", label: "edition of the event" },
    ],
    shots: [],
  },
];

export const bySlug = (slug) => PROJECTS.find((p) => p.slug === slug) || null;
