// The design file's PROJECT PAGES.
//
// One module because this list feeds four things that must never disagree: the
// artboards on the design canvas, the layers panel's selected-work children,
// the Pages list in the panel, and the case-study page each board opens. When
// the file names lived in two places they drifted within a single edit — see
// the note on FRAMES in DesignWorld.jsx.
//
// `size` is not decoration: it picks the board slot AND the sketch, and the two
// are coupled by aspect ratio in design-world.css (lg 16/10 = the "screens"
// web+phone pair, sm 4/5 = portrait "app" screens, wide 8/3 = the "brand" mark
// + wordmark + chips). Reorder this array and the canvas follows; change a
// `size` without changing `sketch` to match and the art won't fit its board.
//
// `shots` is what the case-study page renders. A project with none still gets a
// page — it just says so, rather than showing an empty frame.

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
    sketch: "screens",
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
    shots: [
      {
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
    sketch: "app",
    file: "layover-v3",
    dims: "1080 × 1350",
    role: "Brand identity, UI design, product design",
    summary:
      "A layover is dead time you've already paid for. Layover turns it into something usable: enter your airport or PNR and it shows what's actually open in your terminal right now — order a meal to your gate, or book into a lounge. Built around Indian airports (Delhi, Mumbai, Bengaluru, Hyderabad) and the details that matters there: terminal-aware delivery, veg and non-veg filters as a first-class control, and a live prep timer so you know whether you have time before boarding.",
    facts: [
      ["Role", "Brand identity · UI · product design"],
      ["Surfaces", "Marketing site, web app, mobile app"],
      ["Airports", "Delhi IGI, Mumbai CSIA, Bengaluru KIA, Hyderabad RGIA"],
      ["Timeline", "2025"],
    ],
    external: BEHANCE,
    // Shipped as a real product — the case-study page links here instead of
    // back to Behance, since the live thing outranks mockups of it.
    live: "https://mylayover.in/",
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
    sketch: "brand",
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
    shots: [],
  },
];

export const bySlug = (slug) => PROJECTS.find((p) => p.slug === slug) || null;
