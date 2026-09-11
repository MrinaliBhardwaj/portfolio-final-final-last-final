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
 *   pending        string     the study has not arrived yet: the project gets its
 *                             desk folder, its window and its sidebar row, the
 *                             window shows this where the study will go, and the
 *                             design canvas leaves it out until it is dropped
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
    // THE STUDY, NOT AN APPENDIX (12 Sep 2026). This same frame used to be
    // folded away at the foot of the page as an `archive` — "the export the
    // window used to be", kept until something replaced it. Nothing did: she
    // asked for it as the case study, so it is a board now, drawn the way
    // Layover's and Futurepreneurs' are.
    //
    // meal-maestro-case-study, node 429:2731 ("Updated case study full"), 1400
    // x 22306 — CROPPED to 19977 at her request: past the closing "Thanks for
    // watching!" card the frame runs on for ~2,400px of flat green. The cut
    // leaves 67px under the card, the gap it has above it. `dims` is the board
    // as shown, not the frame, because here the difference is the point.
    // Sliced by scripts/build_case_boards.py.
    //
    // (The first file ever offered for Meal Maestro was a screenshot of the
    // Behance PAGE — their header, a "Follow All / Appreciate" bar over her
    // artwork, and ~85% other designers' projects. Check an export's contents
    // before shipping it.)
    boards: [{
      node: "429:2731",
      dims: "1400 × 19977",
      slices: [
        { src: "/work/meal-maestro/case/s00.webp", w: 1400, h: 2476 },
        { src: "/work/meal-maestro/case/s01.webp", w: 1400, h: 2369 },
        { src: "/work/meal-maestro/case/s02.webp", w: 1400, h: 1788 },
        { src: "/work/meal-maestro/case/s03.webp", w: 1400, h: 2456 },
        { src: "/work/meal-maestro/case/s04.webp", w: 1400, h: 1815 },
        { src: "/work/meal-maestro/case/s05.webp", w: 1400, h: 1900 },
        { src: "/work/meal-maestro/case/s06.webp", w: 1400, h: 2013 },
        { src: "/work/meal-maestro/case/s07.webp", w: 1400, h: 1821 },
        { src: "/work/meal-maestro/case/s08.webp", w: 1400, h: 2510 },
        { src: "/work/meal-maestro/case/s09.webp", w: 1400, h: 829 },
      ],
      alt:
          "The Meal Maestro case study: a smart meal-planning app for personalized recommendations and nutrition guidance, designed in Vellore, Tamil Nadu, May 2026. It runs from the goal of making healthy eating simpler and more accessible, through branding and primary research grounded in real voices and real data (12 discovery phone interviews, 140 survey responses, 4 comparison teardowns, 5 weeks), into key insights about why people abandon meal planning, then a design system of colour and type — Poppins for display and headings, Open Sans for body — and finally the home, recipe detail, tracker and explore flows, closing on \"Thanks for watching!\".",
    }],
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
    // CORRECTED FROM HER OWN BOARD (5 Sep 2026). The case study states the role
    // as "Product Designer, co-lead" and names five surfaces; this said three,
    // and the two were now contradicting each other on the same page. Her
    // artwork is the authority on her project.
    facts: [
      ["Role", "Product designer, co-lead"],
      ["Surfaces", "Marketing site · Consumer web · Consumer app · Vendor portal · Admin portal"],
      ["Timeline", "2025"],
      ["Tool", "Figma"],
      ["Launch airports", "Delhi IGI · Mumbai CSIA · Bengaluru KIA · Hyderabad RGIA"],
    ],
    external: BEHANCE,
    // Shipped as a real product — the case-study page links here instead of
    // back to Behance, since the live thing outranks mockups of it.
    live: "https://mylayover.in/",
    metrics: [
      { value: "4", label: "airports at launch" },
      { value: "5", label: "surfaces, marketing site to admin portal" },
      { value: "Live", label: "shipped at mylayover.in" },
    ],
    // THE CASE STUDY ITSELF (5 Sep 2026), her node 171:3998 — 1600 x 20013 of
    // written argument interleaved with the screens it argues about.
    //
    // SLICED AT HER OWN SLIDE BREAKS, not on a grid. The board has a consistent
    // 200-226px gap between slides, and every cut below is the middle of one of
    // those gaps — found by scanning for rows that are a single flat colour
    // across all 1600px, which is the only place a cut costs nothing. Ten
    // slices, none of them through a word or an image. (It has to be cut at all
    // because WebP tops out at 16383px; 20013 cannot be one file. Cutting it
    // well is what stops that being a compromise.)
    hero: "/work/layover/hero.webp",
    boards: [{
      dims: "1600 × 20013",
      node: "171:3998",
      slices: [
        { src: "/work/layover/case/s00.webp", w: 1600, h: 1611 },
        { src: "/work/layover/case/s01.webp", w: 1600, h: 1696 },
        { src: "/work/layover/case/s02.webp", w: 1600, h: 2400 },
        { src: "/work/layover/case/s03.webp", w: 1600, h: 2989 },
        { src: "/work/layover/case/s04.webp", w: 1600, h: 3215 },
        { src: "/work/layover/case/s05.webp", w: 1600, h: 1474 },
        { src: "/work/layover/case/s06.webp", w: 1600, h: 2005 },
        { src: "/work/layover/case/s07.webp", w: 1600, h: 1994 },
        { src: "/work/layover/case/s08.webp", w: 1600, h: 2085 },
        { src: "/work/layover/case/s09.webp", w: 1600, h: 544 },
      ],
      alt:
        "The Layover case study. It opens on “You have ninety minutes. Nothing tells you what fits.” and argues that a layover looks like leisure and behaves like a deadline, that both sides — traveller and counter — are solving the same equation from opposite ends, and that the work is designing for someone who is already slightly late. It runs through one number across five surfaces, the marketing site, the ordering flow, the vendor portal that is “the screen nobody screenshots and the one the product runs on”, the legal requirements that cannot be deleted only sequenced, and the admin tools for a marketplace that does not fail loudly — closing on “we kept asking for less.”",
    }],
    shots: [],
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
    hero: "/work/futurepreneurs/hero.webp",
    // TRIMMED AT THE EDGES. Both boards carry a thin rgb(30,30,30) border on
    // their outer columns — 6 left / 5 right on the first, 10 / 10 on the
    // second. Invisible against their dark sections and a hard black strip down
    // the side of every light one, which is exactly what it looked like. The
    // `dims` below stay the Figma frame's own; the exports are that minus the
    // border.
    //
    // TWO BOARDS, IN THE ORDER SHE GAVE THEM (10 Sep 2026). They overlap: the
    // second is largely a superset of the first — same type spread, same LINE
    // and D-Day screens, same "10 YEARS", same FAQs, same closing slide — and
    // the first reads as an earlier, shorter cut of the same deck. Both are here
    // because both were asked for; dropping either is deleting one object below.
    boards: [
      {
        node: "345:2408", dims: "1925 × 12354",
        title: "The case study",
        slices: [
          { src: "/work/futurepreneurs/case-a/s00.webp", w: 1914, h: 2619 },
          { src: "/work/futurepreneurs/case-a/s01.webp", w: 1914, h: 1780 },
          { src: "/work/futurepreneurs/case-a/s02.webp", w: 1914, h: 2072 },
          { src: "/work/futurepreneurs/case-a/s03.webp", w: 1914, h: 1912 },
          { src: "/work/futurepreneurs/case-a/s04.webp", w: 1914, h: 2591 },
          { src: "/work/futurepreneurs/case-a/s05.webp", w: 1914, h: 1380 },
        ],
        alt:
          "The Futurepreneurs 10.0 case study: the event site on a laptop over black, the brand’s violet-and-yellow system with Whyte Inktrap and Gantari, the auditorium it filled, the LINE and D-Day screens, a “10 YEARS FUTUREPRENEURS” spread, the FAQs and the website, closing on an orange “Thank_you” slide.",
      },
      {
        node: "345:15635", dims: "1930 × 16481",
        title: "The full deck",
        slices: [
          { src: "/work/futurepreneurs/case-b/s00.webp", w: 1910, h: 2094 },
          { src: "/work/futurepreneurs/case-b/s01.webp", w: 1910, h: 1780 },
          { src: "/work/futurepreneurs/case-b/s02.webp", w: 1910, h: 2367 },
          { src: "/work/futurepreneurs/case-b/s03.webp", w: 1910, h: 2307 },
          { src: "/work/futurepreneurs/case-b/s04.webp", w: 1910, h: 2064 },
          { src: "/work/futurepreneurs/case-b/s05.webp", w: 1910, h: 2236 },
          { src: "/work/futurepreneurs/case-b/s06.webp", w: 1910, h: 1780 },
          { src: "/work/futurepreneurs/case-b/s07.webp", w: 1910, h: 1853 },
        ],
        alt:
          "The longer Futurepreneurs 10.0 deck: it opens on “PROJECT FUTUREPRENEURS” with the brief and deliverables, then the type and colour system, the event timeline and its sponsors, the aftermovie, winners and prize pool, the registration screens and QR flow, phone mockups, the “10 YEARS” spread, FAQs, the website, stickers, the animation and the certificate — closing on the same orange “Thank_you” slide.",
      },
    ],
    shots: [],
  },
  // NEXTG APEX (folder 11 Sep 2026, study 12 Sep 2026). It had its desk folder,
  // its window and its sidebar row a day early, with `pending` standing where
  // the study would go; the study has landed, so `pending` is gone — which is
  // also what put it on the design canvas, in the `offset` slot.
  //
  // Every word below is hers, from the board itself (cover, "02 Project
  // overview" and "14 Results"), not written for this page.
  {
    slug: "nextg",
    name: "NextG Apex",
    what: "Website redesign",
    when: "Jun 2026",
    tag: "Half a million outlets, one screen",
    blurb:
      "A B2B retail-tech case study on making half a million outlets legible in a single screen.",
    size: "offset",
    // the landing page in its browser frame: the same export as the NextG page
    // of the design file, so it is her work rather than a stand-in. It is the
    // hero too (no `hero` field), and the canvas board uses its own ratio.
    cover: "/work/nextg/f-browser.webp",
    file: "nextg-apex-final",
    dims: "1600 × 20076",
    role: "Product design + front-end",
    summary:
      "NextG runs field sales for FMCG brands across half a million Indian outlets. Their 10 year old site looked like every other B2B tool, so nobody believed the scale. I rebuilt it end to end — structure, interface, design system, and the front-end code.",
    facts: [
      ["Role", "Product design + front-end"],
      ["Timeline", "June 2026"],
      ["Category", "B2B retail tech"],
      ["Location", "India"],
    ],
    metrics: [
      { value: "500,000", label: "outlets the site had to make legible" },
      { value: "6", label: "pages, designed and built end to end" },
      { value: "17", label: "colours in the one token file every page reads" },
    ],
    // NextG, node 181:103 ("NextG Apex · Case Study"), 1600 x 20076. No crop
    // and no border to trim; its sixteen sections sit on flat gaps, so all but
    // one cut lands in one. Sliced by scripts/build_case_boards.py.
    boards: [{
      node: "181:103",
      dims: "1600 × 20076",
      slices: [
        { src: "/work/nextg/case/s00.webp", w: 1600, h: 2384 },
        { src: "/work/nextg/case/s01.webp", w: 1600, h: 1813 },
        { src: "/work/nextg/case/s02.webp", w: 1600, h: 2537 },
        { src: "/work/nextg/case/s03.webp", w: 1600, h: 2180 },
        { src: "/work/nextg/case/s04.webp", w: 1600, h: 2104 },
        { src: "/work/nextg/case/s05.webp", w: 1600, h: 2117 },
        { src: "/work/nextg/case/s06.webp", w: 1600, h: 2121 },
        { src: "/work/nextg/case/s07.webp", w: 1600, h: 2167 },
        { src: "/work/nextg/case/s08.webp", w: 1600, h: 2278 },
        { src: "/work/nextg/case/s09.webp", w: 1600, h: 375 },
      ],
      // THE WHITE BOX IN "FRAME 5" IS A VIDEO. The BUILD section's big panel,
      // "nextg landing 1" (213:2), is a video fill in Figma, and every export
      // renders it as a blank #f4f6f8 box. This puts the video back over it, in
      // board pixels: the box is 1146 x 497 at (104, 1665) with ~20px corners,
      // grown by 1px all round so the export's anti-aliased white edge is
      // covered too. The video is her screen recording of the landing page
      // (Videos/Screen Recordings/"nextg landing.mp4", 1896x822 — exactly the
      // size of Figma's fill), re-encoded silent at 1440 wide: 9.0 MB -> 0.66 MB.
      // Its first 3.9s are cut. The recording opens on the page's own intro,
      // which at this size is a near-blank sheet — no nav, no type, luminance
      // spread under 3 against 30 once it settles — so it made a blank poster
      // and a white flash on every loop. It starts on the settled page now
      // (6.6s of it), and the poster is its first frame.
      videos: [
        {
          src: "/work/nextg/landing.mp4",
          poster: "/work/nextg/landing-poster.webp",
          x: 103, y: 1664, w: 1148, h: 499, r: 21,
          label: "Screen recording of the NextG landing page",
        },
      ],
      alt:
        "The NextG Apex case study: a B2B retail-tech site for field sales across half a million Indian outlets, designed and built end to end. It runs from the project overview and a brief in two halves — a CEO who wanted a site people keep scrolling and a CTO who wanted the phygital proposition stated without ambiguity — through the whole site, the process, an audit, structure, type and colour, the design decisions, the product views, conversion, responsive layouts and the WebGL build, to what shipped: six pages, one system, no framework — closing on “Thanks for watching”.",
    }],
    shots: [],
  },
];

export const bySlug = (slug) => PROJECTS.find((p) => p.slug === slug) || null;
