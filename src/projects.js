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
    // WAITING ON A CLEAN EXPORT. The file supplied for this
    // (www.behance.net_gallery_...png) was a full-page screenshot of the
    // BEHANCE PAGE, not the case study: Behance's own header and a floating
    // "Follow All / Appreciate" bar composited over her artwork, and then
    // ~85% of its 7734px height was Behance's "Popular projects" feed — other
    // designers' work, complete with Save buttons. Publishing that would have
    // put a dozen other people's projects on her portfolio.
    //
    // The rendering side is ready: a `strip` shot (see the shape in
    // ProjectPage.jsx and .pp-strip in project-page.css) takes a sliced tall
    // image and stacks it seamlessly with lazy loading. Point
    // scripts/build_meal_maestro_shots.py at a real export — the artboards
    // straight out of Figma, or the Behance images themselves rather than a
    // capture of the page around them — and this becomes a few lines.
    shots: [],
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
    shots: [
      {
        src: "/work/layover/hero.webp",
        wide: true,
        caption: "The landing page. One question — which airport are you in — and the whole product follows from the answer.",
        alt:
          "Layover's landing page over a photograph of an airport atrium, headline \"Order Meals, Access Lounges. All In One App.\", with a panel listing Hyderabad RGIA, Bengaluru KIA, Mumbai CSIA and Delhi IGI above a field reading \"enter your airport / PNR\".",
      },
      {
        src: "/work/layover/brand.webp",
        wide: true,
        caption:
          "The wordmark, with the rotated ‘e’ — a plane turning back on itself, which is the whole idea of a layover in one letter.",
        alt:
          "The LayOver wordmark in white on a black billboard on a tree-lined street, the ‘e’ rotated 180 degrees.",
      },
      {
        src: "/work/layover/app.webp",
        caption:
          "The app's ordering surface, warm where the marketing site is dark — this is the part you use standing at a gate.",
        alt:
          "Two phone screens showing Layover's food ordering interface in cream and gold: a delivery destination of \"Layover office\", a greeting, a dish search field, category chips for fries and burgers, and an \"Open Stalls\" section.",
      },
      {
        src: "/work/layover/order.webp",
        caption:
          "Browse by terminal, then track the order. Every restaurant card carries its pier, because in an airport \"where\" is the only question that matters.",
        alt:
          "Layover's restaurant directory on desktop showing Tim Hortons, Starbucks, Theobroma, McDonald's, Berco's, Idli.com, KFC and Subway, each labelled \"t3 domestic departure piers\", beside a mobile order-confirmed screen with a twenty-minute prep timer, itemised order and a map.",
      },
      {
        src: "/work/layover/system.webp",
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
    external: BEHANCE,
    shots: [],
  },
];

export const bySlug = (slug) => PROJECTS.find((p) => p.slug === slug) || null;
