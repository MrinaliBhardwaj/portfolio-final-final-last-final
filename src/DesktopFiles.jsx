// The desktop files — her Figma composition, placed on the live desktop.
//
// THE FIGMA IS THE SOURCE (2026-08-24, node 306:542 of file drda7Tnqo…). Every
// piece below carries the artboard's own numbers, verbatim, and the percentages
// are derived from them at render. Nothing here was placed by eye, so "does it
// match the design" is a question you can answer by reading the table rather
// than by squinting at two screenshots.
//
// WHAT REPLACED WHAT. The old desk was three project covers, two résumé
// documents and three README files, hand-scattered. All of it is gone, on
// request: the composition is now six folders and a jewel case on the left, the
// two résumés and a run of artwork on the right.
//
// THE BLACK RECTANGLES IN THE ARTBOARD ARE NOT DESIGN. Seven of them (306:541,
// :543, :544, :546, :547, :549, :550) sit under the visible layers — they were
// masking the previous folders while she worked. They are deliberately not
// implemented, and this note is here so nobody "restores" them later.
//
// WHAT IS INTERACTIVE, and what is only paint. EVERY FOLDER OPENS SOMETHING —
// that is the rule the desk teaches, and it is worth more than any badge or
// hover hint. Six folders on the left, two résumé cards on the right, eight
// live objects. The other nine pieces are artwork: `pointer-events: none`,
// `aria-hidden`, no label.
//
// It did not start that way. Three of these folders shipped inert and
// unlabelled, at the same size and shape as the live ones and in the same
// cluster — folder-green sat in the same ROW as a live folder, 134px away.
// Clicking it produced silence, which reads as a broken site rather than as
// decoration. Folder shape has to predict behaviour or it predicts nothing.
//
// So the two folders whose contents are still unknown are "untitled folder"
// and open an empty window, the way Finder's own new folder does. An honest
// empty room beats a door that isn't a door.
//
// THE COVERS ARE DECORATIVE, NOT THUMBNAILS. Every one of these six is a
// patterned folder cover — a gingham horse, a girl's face, caterpillars, two
// florals, a landscape. None of them depicts its project. The first build
// assigned case studies to them by reading order using filenames invented at
// export time, which is how the girl's face — an obvious "About Me" — ended up
// labelled Layover. The mapping below is content, set by hand; the `src` is
// only which cover the folder wears.
//
// THE LOTUS STILL OWNS THE MIDDLE. Measured, the bloom is x 36–69% on a
// landscape screen; the artboard's left cluster stops at 32.3% and its right
// cluster starts at 69.4%, so the design already respects it. The dev assertion
// below now tests the whole BOX rather than the centre point, because these
// pieces are much larger than the old tiles and a centre that clears the flower
// no longer means the artwork does.
import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// The artboard. Positions are percentages of the stage: x against its width, y
// against its height, so the composition holds its proportions across the width
// and breathes vertically rather than letterboxing.
const FRAME = { w: 1897, h: 824 };

const A = "/desk";

// x, y, w, h are the Figma frame's own pixels — top-left origin, unrounded.
// `art` false means paint only. Order is the artboard's paint order.
//
// EVERY SIZE HERE IS THE ARTBOARD'S. The six folders were briefly grown to 154
// units — the measured case being that the artboard's decoration outweighed
// everything clickable 5.2 : 1 and the case studies came to 1.4% of the screen,
// so the objects that matter most were the smallest labelled ones. On the
// screen they read as too big, and that is the call that counts: the argument
// was about attention, and attention is what the person looking at it has.
// They are back at 117.4/117.2, and the emphasis is carried entirely by the
// LABELS instead — which is the cheaper instrument anyway, and the one that
// does not touch the composition.
const PIECES = [
  // ---------------- left: the folders, the case, the frog ----------------
  // The gingham horse. Contents not decided yet, so it is an EMPTY FOLDER and
  // says so, rather than being a folder-shaped thing that ignores the cursor.
  {
    key: "folder-horse",
    src: `${A}/meal-maestro.webp`,
    x: 454, y: 112, w: 117.39, h: 99.686,
    label: "untitled folder",
    kind: "Folder",
    aria: "untitled folder — empty",
    opensEmpty: "horse",
  },
  // The Chinese landscape. The fourth case-study slot, holding a case study she
  // has not handed over yet — same treatment as the horse until she does.
  {
    key: "folder-scenery",
    src: `${A}/folder-scenery.webp`,
    x: 272.52, y: 560.93, w: 117.39, h: 117.39,
    label: "untitled folder",
    kind: "Folder",
    aria: "untitled folder — empty",
    opensEmpty: "scenery",
  },
  {
    key: "folder-floral",
    src: `${A}/folder-floral.webp`,
    x: 94.04, y: 564.71, w: 117.39, h: 117.39,
    label: "Layover",
    kind: "Case Study",
    aria: "Layover — brand and product design, open the case study",
    opensCase: "layover",
    phone: [38, 88], pw: 56,
  },
  {
    key: "futurepreneurs",
    src: `${A}/futurepreneurs.webp`,
    x: 94.04, y: 413.08, w: 117.23, h: 99.367,
    label: "Futurepreneurs 10.0",
    kind: "Case Study",
    aria: "Futurepreneurs 10.0 — branding and UI, open the case study",
    opensCase: "futurepreneurs",
    phone: [38, 72], pw: 56,
  },
  {
    key: "folder-green",
    src: `${A}/folder-green.webp`,
    x: 264.95, y: 413.08, w: 117.39, h: 99.845,
    label: "Meal Maestro",
    kind: "Case Study",
    aria: "Meal Maestro — UI design, open the case study",
    opensCase: "meal-maestro",
    phone: [78, 72], pw: 56,
  },
  // The girl's face — the one cover on this desk that depicts a person, which
  // is why it is the one that opens her. The Notes scrapbook lives behind it.
  {
    key: "about-me",
    src: `${A}/layover.webp`,
    x: 454, y: 256.48, w: 117.23, h: 97.772,
    label: "About Me",
    kind: "Note",
    aria: "About Me — the scrapbook, opens in a window",
    opensNote: "about",
    phone: [78, 88], pw: 56,
  },

  // ---------------- right: the two résumés ----------------
  // Her call on which card is which: the pink DESIGNER star is the design
  // résumé, the green terminal is the engineering one. They are the artboard's
  // only matching pair and they sit side by side, which is what makes them read
  // as the two documents rather than as two more pictures.
  //
  // HER NAME IS ON BOTH, on the kind line. The settled desktop had no words on
  // it at all — the hero name and the roles aside both belong to the ceremony
  // and have faded out long before the desk arrives, so the screen a visitor
  // actually reads carried a menu bar, a clock and nothing else.
  //
  // THE NAME IS THE SECOND LINE, NOT THE FIRST, and that is a measurement
  // rather than a preference. These two cards sit 117px apart centre to
  // centre. "Mrinali Bhardwaj" sets to 103px at 12.5px, and with the label's
  // padding that is 119px — so two of them side by side overlap, and the desk's
  // two most important files would have collided into one smear of text. The
  // document name is what differs between them, so the document name goes on
  // top; the 10px line underneath carries her name and still fits.
  //
  // AND NO "· PDF" ON THAT LINE. With it the kind ran 111px, which is still
  // wider than the 117px of spacing once the label's padding is counted, and
  // the two labels overlapped by 10px. It costs nothing to drop: the aria-label
  // says "PDF, opens in a new tab", the card is drawn as a document, and Finder
  // does not caption a PDF either — the icon is the file type.
  {
    key: "resume-design",
    src: `${A}/resume-design.webp`,
    x: 1476, y: 311, w: 147.837, h: 147.837,
    label: "Design résumé",
    kind: "Mrinali Bhardwaj",
    aria: "Mrinali Bhardwaj, design résumé — PDF, opens in a new tab",
    href: "/resume-design.pdf",
    newTab: true,
    phone: [70, 8], pw: 56,
  },
  {
    key: "resume-tech",
    src: `${A}/resume-tech.webp`,
    x: 1328, y: 308, w: 147.837, h: 147.837,
    label: "Tech résumé",
    kind: "Mrinali Bhardwaj",
    aria: "Mrinali Bhardwaj, tech résumé — PDF, opens in a new tab",
    href: "/resume-tech.pdf",
    newTab: true,
    phone: [30, 8], pw: 56,
  },

  // ---------------- the artwork ----------------
  // A glass plate under the dragonfly, at the artboard's own 4% white and its
  // own radius. The inset is uniform (20.77 of 215 across, 21.05 of 197.9 down)
  // so it is expressed as padding rather than as a second absolute box.
  {
    key: "dragonfly",
    src: `${A}/dragonfly.webp`,
    x: 1316, y: 112, w: 215, h: 197.898,
    glass: { radius: 24.432, pad: 20.77 },
  },
  { key: "cd-case", src: `${A}/cd-case.webp`, x: 97, y: 92, w: 285, h: 285 },
  // The frog's picture is BIGGER than the plate behind it and hangs over both
  // ends — 15.9px above, 25px below. So the piece is sized to the picture and
  // the plate is inset within it, not the other way round.
  {
    key: "frog-jar",
    src: `${A}/frog-jar.webp`,
    x: 423, y: 385.1, w: 190, h: 342,
    plate: { top: 15.9, height: 301, radius: 18.718 },
  },
  {
    key: "card-karma",
    src: `${A}/card-karma.webp`,
    x: 1643.82, y: 110.03, w: 155.7, h: 143.966,
    radius: 9.026,
  },
  { key: "pin", src: `${A}/pin.webp`, x: 1611, y: 71, w: 77.18, h: 77.18 },
  // Two stars cut from one sheet, each rotated. The rotation rides on the inner
  // span: Framer owns the transform on the tile itself for the entrance.
  {
    key: "sparkle-a",
    src: `${A}/sparkle-a.webp`,
    x: 1553, y: 177, w: 77.594, h: 81.427,
    rotate: 13.06,
  },
  {
    key: "sparkle-b",
    src: `${A}/sparkle-b.webp`,
    x: 1586, y: 227, w: 77.945, h: 75.917,
    rotate: 10.95,
  },
  {
    key: "art-relief",
    src: `${A}/art-relief.webp`,
    x: 1644, y: 290, w: 157, h: 160.204,
    radius: 17.841,
  },
  // The artboard crops this one upward inside its box (top −39.78% of a 151.9%
  // render), which lands the focal point at 59% down. object-position says the
  // same thing in one declaration.
  {
    key: "crowd",
    src: `${A}/crowd.webp`,
    x: 1316, y: 465.24, w: 486, h: 228.53,
    radius: 19.959,
    focus: "50% 59%",
  },
];

// THE FLOWER'S FOOTPRINT, MEASURED — and not the same shape on a phone. The
// wallpaper is the bloom's last frame drawn with object-fit: cover, so the crop,
// and therefore where the flower lands, depends on the viewport's aspect.
// public/lotus/f39.webp profiled at luminance > 130, binned into 5% columns and
// rows, keeping bins holding more than 1% of the ink:
//
//   1440x900 (and every landscape ratio)   x 36-69%   y 26-69%
//   320x568 / 375x667 / 390x844 / 430x932  x  0-100%  y 27-68%
//
// A portrait phone crops hard into the flower's sides, so it stops being a
// central column and becomes a BAND ACROSS THE MIDDLE at full width. That is why
// the phone composition puts files above it and below it and never beside it.
const NO_GO = {
  desktop: { x0: 36, x1: 69, y0: 26, y1: 69 },
  phone: { x0: -1, x1: 101, y0: 27, y1: 68 },
};

const PHONE = "(max-width: 640px)";
// A PHONE IS ALSO A HEIGHT, not only a width. The pieces are sized in PIXELS
// on a phone and placed in PERCENTAGES, so one row costs a fixed ~95px but a
// varying share of the screen: 11% of a 390x844, 17% of a 320x568. The bloom
// owns the middle band at both, which leaves two strips of open air that are
// 228px and 267px on the tall one and 153px and 182px on the short one — and
// a layout authored against the first arrangement put two rows where only one
// fits and stacked three files on top of each other.
const SHORT = "(max-height: 700px)";

function useIsPhone() {
  const read = () =>
    typeof window === "undefined"
      ? { phone: false, short: false }
      : {
          phone: window.matchMedia(PHONE).matches,
          short: window.matchMedia(SHORT).matches,
        };
  const [size, setSize] = useState(read);
  useEffect(() => {
    // Re-read the query FRESH each time rather than trusting a stored
    // MediaQueryList, and listen to `resize` as well as `change`. A held MQL
    // that never re-evaluates is not hypothetical — it is what happens under a
    // devtools device-metrics override, where the width changes, a new
    // matchMedia() call reports the new answer, and the old object's `change`
    // never fires.
    const sync = () =>
      setSize((prev) => {
        const next = read();
        return prev.phone === next.phone && prev.short === next.short ? prev : next;
      });
    const mqs = [window.matchMedia(PHONE), window.matchMedia(SHORT)];
    sync();
    mqs.forEach((mq) => mq.addEventListener("change", sync));
    window.addEventListener("resize", sync);
    return () => {
      mqs.forEach((mq) => mq.removeEventListener("change", sync));
      window.removeEventListener("resize", sync);
    };
  }, []);
  return size;
}

// Every window on this desk has its own address, and the folder that opens it
// is a real anchor pointing at that address — which is what makes ⌘-click,
// middle-click and "copy link" work on a piece of furniture.
const windowHref = (p) =>
  p.opensCase
    ? `#/?case=${p.opensCase}`
    : p.opensNote
      ? `#/?note=${p.opensNote}`
      : p.opensEmpty
        ? `#/?folder=${p.opensEmpty}`
        : "#/";

// percentages of the stage, from the artboard's pixels
const leftPct = (p) => ((p.x + p.w / 2) / FRAME.w) * 100;
const topPct = (p) => ((p.y + p.h / 2) / FRAME.h) * 100;
const widthPct = (p) => (p.w / FRAME.w) * 100;

// Dev-only guard. It tests the BOX now, not the centre: these pieces run to 285
// artboard pixels and a centre that clears the bloom stopped being evidence
// that the artwork does. Silent overlap is exactly the regression that survives
// a redesign, because nobody re-measures the flower.
if (import.meta.env.DEV) {
  const bad = [];
  for (const p of PIECES) {
    const box = NO_GO.desktop;
    const l = (p.x / FRAME.w) * 100;
    const r = ((p.x + p.w) / FRAME.w) * 100;
    const t = (p.y / FRAME.h) * 100;
    const b = ((p.y + p.h) / FRAME.h) * 100;
    if (l < box.x1 && r > box.x0 && t < box.y1 && b > box.y0)
      bad.push(`${p.key} (desktop, x ${l.toFixed(1)}–${r.toFixed(1)}%)`);
  }
  if (bad.length)
    console.error("[DesktopFiles] these sit on the lotus:", bad.join(", "));
}

/**
 * Dev-only, and it runs on the RENDERED boxes rather than on the table above.
 *
 * The static check can only see what the artboard declares: artwork boxes, in
 * artboard units, on a desktop. It cannot see the labels — which are px-sized
 * from a stylesheet, sit outside the aspect box, and are now two lines tall —
 * and it cannot see the dock or the menu bar, which are laid out by other
 * components entirely. Every collision this composition has actually had was in
 * one of those blind spots.
 *
 * So this measures. It is the same sweep used to verify the build by hand,
 * kept in the code so the next person changing a coordinate finds out at once
 * instead of three sessions later.
 */
function auditLayout(root, isPhone) {
  const stage = root.parentElement;
  if (!stage) return;
  const st = stage.getBoundingClientRect();
  if (!st.width || !st.height) return;
  const ng = isPhone ? NO_GO.phone : NO_GO.desktop;
  const chrome = [
    [".mb-bar", "the menu bar"],
    [".dock", "the dock"],
  ]
    .map(([sel, name]) => {
      const n = document.querySelector(sel);
      return n ? { name, r: n.getBoundingClientRect() } : null;
    })
    .filter(Boolean);

  const hits = [];
  /** artwork box + label box, as one union — what the piece actually occupies */
  const occupied = (d) => {
    const r = d.getBoundingClientRect();
    const lab = d.querySelector(".dpiece-label");
    if (!lab) return r;
    const lr = lab.getBoundingClientRect();
    return {
      left: Math.min(r.left, lr.left),
      right: Math.max(r.right, lr.right),
      top: Math.min(r.top, lr.top),
      bottom: Math.max(r.bottom, lr.bottom),
    };
  };
  const meets = (a, b) =>
    a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;

  const tiles = [...root.querySelectorAll(".dpiece")].map((d) => ({
    key: d.getAttribute("data-key") || "?",
    live: !d.classList.contains("is-art"),
    box: occupied(d),
  }));

  for (const t of tiles) {
    const b = t.box;
    const l = ((b.left - st.left) / st.width) * 100;
    const r = ((b.right - st.left) / st.width) * 100;
    const tp = ((b.top - st.top) / st.height) * 100;
    const bt = ((b.bottom - st.top) / st.height) * 100;
    if (l < ng.x1 && r > ng.x0 && tp < ng.y1 && bt > ng.y0)
      hits.push(`${t.key} sits on the lotus (x ${l.toFixed(1)}–${r.toFixed(1)}%)`);
    if (b.left < 0 || b.right > st.width || b.top < 0 || b.bottom > st.height)
      hits.push(`${t.key} runs off the stage`);
    for (const c of chrome)
      if (meets(b, c.r)) hits.push(`${t.key} meets ${c.name}`);
  }

  // …and each other. Two labels can collide long before their artwork does.
  for (let i = 0; i < tiles.length; i += 1)
    for (let j = i + 1; j < tiles.length; j += 1) {
      // artwork is MEANT to overlap — the artboard layers it. Only the eight
      // live tiles have to stay separable, because they have to be aimed at.
      if (!tiles[i].live || !tiles[j].live) continue;
      if (meets(tiles[i].box, tiles[j].box))
        hits.push(`${tiles[i].key} overlaps ${tiles[j].key}`);
    }

  if (hits.length)
    console.error(
      `[DesktopFiles] layout at ${Math.round(st.width)}×${Math.round(st.height)}:\n  ` +
        hits.join("\n  ")
    );
}

function Art({ p }) {
  const img = (
    <img
      src={p.src}
      alt=""
      loading="lazy"
      decoding="async"
      draggable="false"
      style={{
        borderRadius: p.radius ? `${(p.radius / p.w) * 100}%` : undefined,
        objectPosition: p.focus,
        objectFit: p.focus ? "cover" : undefined,
      }}
    />
  );

  if (p.glass) {
    return (
      <span
        className="dpiece-glass"
        style={{
          borderRadius: `${(p.glass.radius / p.w) * 100}%`,
          padding: `${(p.glass.pad / p.w) * 100}%`,
        }}
      >
        {img}
      </span>
    );
  }

  if (p.plate) {
    return (
      <>
        <span
          className="dpiece-plate"
          aria-hidden="true"
          style={{
            top: `${(p.plate.top / p.h) * 100}%`,
            height: `${(p.plate.height / p.h) * 100}%`,
            borderRadius: `${(p.plate.radius / p.w) * 100}%`,
          }}
        />
        {img}
      </>
    );
  }

  return img;
}

export default function DesktopFiles({ visible, onOpenCase, onOpenNote, onOpenEmpty }) {
  const { phone: isPhone, short } = useIsPhone();
  const shown = isPhone ? PIECES.filter((p) => p.phone) : PIECES;
  const layerRef = useRef(null);

  // Measure once the pieces are up, and again on resize. Dev only — the whole
  // audit is dead code in a production build.
  useEffect(() => {
    if (!import.meta.env.DEV || !visible) return;
    let live = true;
    const run = () => live && layerRef.current && auditLayout(layerRef.current, isPhone);
    // AFTER THE FONTS, not on a timer. Every one of these boxes is sized by
    // its label's text, and until Inter arrives the labels are laid out in the
    // fallback face at a different width — the first version of this audit ran
    // at 120ms and reported three collisions that did not exist, all of them
    // just Segoe being wider than Inter. A measurement taken at the wrong
    // moment is worse than no measurement: it costs a real investigation.
    //
    // A TIMEOUT, NOT requestAnimationFrame. rAF looks like the right way to
    // wait for the next layout, and it is — in a tab that is being painted.
    // A hidden or backgrounded view never runs a frame, so an audit chained to
    // rAF simply never reports, which is the failure mode you notice last.
    // AND AFTER THE ENTRANCE, which is the second thing that moves these boxes.
    // Framer animates each tile from scale .97, staggered — the last one settles
    // at roughly 0.1 + 16*0.035 + 0.45s. getBoundingClientRect reports the
    // TRANSFORMED box, so an audit that runs mid-entrance measures everything
    // 3% small and clears collisions that are real: two résumé labels looked
    // 4px apart at .97 and overlapped at 1. Measuring early is how you certify
    // a bug.
    const ready = document.fonts ? document.fonts.ready : Promise.resolve();
    ready.then(() => setTimeout(run, 1200));
    window.addEventListener("resize", run);
    return () => {
      live = false;
      window.removeEventListener("resize", run);
    };
  }, [visible, isPhone, short]);

  return (
    <div
      className={`cover-desktop${isPhone ? " is-phone" : ""}`}
      aria-hidden={!visible}
      ref={layerRef}
    >
      {shown.map((p, i) => {
        const [l, t] = isPhone ? p.phone : [leftPct(p), topPct(p)];
        const interactive = !!(p.opensCase || p.opensNote || p.opensEmpty || p.href);
        // Sized and centred here rather than in CSS. The box has to be pulled
        // back by half its own HEIGHT, and a percentage margin resolves against
        // the container's WIDTH — so the vertical figure is width-relative too,
        // and expressing that as calc(var(--w) / var(--ar)) in the stylesheet
        // buys nothing but a division CSS is fussy about.
        // A SHORT SCREEN GETS SMALLER FILES, not fewer. 0.78 is what makes
        // three rows of artwork-plus-label fit between the menu bar, the
        // bloom's band and the bottom of a 568-tall screen — at full size the
        // last row's label ran 1px off the stage. The tap target does not
        // shrink with it: `min-width/min-height: 44px` in the stylesheet grows
        // the touchable box back around the smaller drawing.
        const pw = (p.pw || 60) * (short ? 0.78 : 1);
        const box = isPhone
          ? {
              width: `${pw}px`,
              marginLeft: `${-pw / 2}px`,
              marginTop: `${-(pw * p.h) / p.w / 2}px`,
            }
          : {
              width: `${widthPct(p)}%`,
              marginLeft: `${-widthPct(p) / 2}%`,
              marginTop: `${(-(p.h / FRAME.w) * 100) / 2}%`,
            };
        // cast, not a plain ternary: assigning the object to a variable first
        // widens "auto"/"none" to `string`, which MotionStyle refuses
        const pointerEvents = /** @type {"auto" | "none"} */ (
          visible && interactive ? "auto" : "none"
        );
        const style = {
          left: `${l}%`,
          top: `${t}%`,
          aspectRatio: `${p.w} / ${p.h}`,
          ...box,
          zIndex: i + 1,
          pointerEvents,
        };

        const inner = (
          <>
            <span className="dpiece-art" style={{ transform: p.rotate ? `rotate(${p.rotate}deg)` : undefined }}>
              <Art p={p} />
            </span>
            {p.label && (
              <span className="dpiece-label">
                <span className="dpiece-name">{p.label}</span>
                {/* Finder's second line — the KIND. It is what turns a pretty
                    folder cover into "this is a case study" without a badge,
                    a caption or a call to action anywhere on the desk. Hidden
                    from assistive tech because `aria` already says it, in a
                    fuller sentence, on the link itself. */}
                {p.kind && (
                  <span className="dpiece-kind" aria-hidden="true">
                    {p.kind}
                  </span>
                )}
              </span>
            )}
          </>
        );

        // Paint only. Not a link, not focusable, not announced — the artboard
        // does not make these openable and neither do we.
        if (!interactive) {
          return (
            <motion.div
              key={p.key}
              className="dpiece is-art"
              data-key={p.key}
              style={style}
              aria-hidden="true"
              initial={false}
              animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.97 }}
              transition={{ duration: 0.45, ease: "easeOut", delay: visible ? 0.1 + i * 0.035 : 0 }}
            >
              {inner}
            </motion.div>
          );
        }

        return (
          <motion.a
            key={p.key}
            className="dpiece"
            data-key={p.key}
            style={style}
            href={p.href || windowHref(p)}
            target={p.newTab ? "_blank" : undefined}
            aria-label={p.aria}
            tabIndex={visible ? 0 : -1}
            // Only a PLAIN left click opens a window. Modified clicks and the
            // middle button are how people open things in new tabs, and
            // swallowing those would break the one habit an anchor promises —
            // so they fall through to the href, which is that window's own
            // shareable address.
            onClick={(e) => {
              if (p.href) return;
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
              e.preventDefault();
              if (p.opensCase) onOpenCase?.(p.opensCase);
              else if (p.opensNote) onOpenNote?.(p.opensNote);
              else if (p.opensEmpty) onOpenEmpty?.(p.opensEmpty);
            }}
            initial={false}
            // No flight. A desktop's files don't arrive, they're there when the
            // screen is — a short fade in place is all the entrance a machine
            // that was already on gets.
            animate={visible ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.97 }}
            whileTap={{ scale: 0.94 }}
            transition={{ duration: 0.45, ease: "easeOut", delay: visible ? 0.1 + i * 0.035 : 0 }}
          >
            {inner}
          </motion.a>
        );
      })}
    </div>
  );
}
