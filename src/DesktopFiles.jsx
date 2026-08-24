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
// WHAT IS INTERACTIVE, and what is only paint: the three case-study folders open
// their windows, the two résumé cards open their PDFs. Everything else is
// artwork — `pointer-events: none`, `aria-hidden`, no label — because a tile
// that highlights under the cursor and then does nothing is the one thing this
// desk has never had. The three unlabelled folders are in that category until
// she says what they hold.
//
// THE LOTUS STILL OWNS THE MIDDLE. Measured, the bloom is x 36–69% on a
// landscape screen; the artboard's left cluster stops at 32.3% and its right
// cluster starts at 69.4%, so the design already respects it. The dev assertion
// below now tests the whole BOX rather than the centre point, because these
// pieces are much larger than the old tiles and a centre that clears the flower
// no longer means the artwork does.
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

// The artboard. Positions are percentages of the stage: x against its width, y
// against its height, so the composition holds its proportions across the width
// and breathes vertically rather than letterboxing.
const FRAME = { w: 1897, h: 824 };

const A = "/desk";

// x, y, w, h are the Figma frame's own pixels — top-left origin, unrounded.
// `art` false means paint only. Order is the artboard's paint order.
const PIECES = [
  // ---------------- left: the folders, the case, the frog ----------------
  {
    key: "meal-maestro",
    src: `${A}/meal-maestro.webp`,
    x: 454, y: 112, w: 117.39, h: 99.686,
    label: "Meal Maestro",
    aria: "Meal Maestro — UI design, open the case study",
    opensCase: "meal-maestro",
    phone: [34, 15], pw: 66,
  },
  {
    key: "folder-scenery",
    src: `${A}/folder-scenery.webp`,
    x: 272.52, y: 560.93, w: 117.39, h: 117.39,
  },
  {
    key: "folder-floral",
    src: `${A}/folder-floral.webp`,
    x: 94.04, y: 564.71, w: 117.39, h: 117.39,
  },
  {
    key: "futurepreneurs",
    src: `${A}/futurepreneurs.webp`,
    x: 94.04, y: 413.08, w: 117.23, h: 99.367,
    label: "Futurepreneurs 10.0",
    aria: "Futurepreneurs 10.0 — branding and UI, open the case study",
    opensCase: "futurepreneurs",
    phone: [76, 80], pw: 66,
  },
  {
    key: "folder-green",
    src: `${A}/folder-green.webp`,
    x: 264.95, y: 413.08, w: 117.39, h: 99.845,
  },
  {
    key: "layover",
    src: `${A}/layover.webp`,
    x: 454, y: 256.48, w: 117.23, h: 97.772,
    label: "Layover",
    aria: "Layover — brand and product design, open the case study",
    opensCase: "layover",
    phone: [44, 73], pw: 66,
  },

  // ---------------- right: the two résumés ----------------
  // Her call on which card is which: the pink DESIGNER star is the design
  // résumé, the green terminal is the engineering one. They are the artboard's
  // only matching pair and they sit side by side, which is what makes them read
  // as the two documents rather than as two more pictures.
  {
    key: "resume-design",
    src: `${A}/resume-design.webp`,
    x: 1476, y: 311, w: 147.837, h: 147.837,
    label: "Design resume",
    aria: "Design resume — PDF, opens in a new tab",
    href: "/resume-design.pdf",
    newTab: true,
    phone: [67, 12], pw: 56,
  },
  {
    key: "resume-tech",
    src: `${A}/resume-tech.webp`,
    x: 1328, y: 308, w: 147.837, h: 147.837,
    label: "Tech resume",
    aria: "Tech resume — PDF, opens in a new tab",
    href: "/resume-tech.pdf",
    newTab: true,
    phone: [85, 17], pw: 56,
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

function useIsPhone() {
  const [isPhone, setIsPhone] = useState(
    () => typeof window !== "undefined" && window.matchMedia(PHONE).matches
  );
  useEffect(() => {
    // Re-read the query FRESH each time rather than trusting a stored
    // MediaQueryList, and listen to `resize` as well as `change`. A held MQL
    // that never re-evaluates is not hypothetical — it is what happens under a
    // devtools device-metrics override, where the width changes, a new
    // matchMedia() call reports the new answer, and the old object's `change`
    // never fires.
    const sync = () => setIsPhone(window.matchMedia(PHONE).matches);
    const mq = window.matchMedia(PHONE);
    sync();
    mq.addEventListener("change", sync);
    window.addEventListener("resize", sync);
    return () => {
      mq.removeEventListener("change", sync);
      window.removeEventListener("resize", sync);
    };
  }, []);
  return isPhone;
}

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

export default function DesktopFiles({ visible, onOpenCase }) {
  const isPhone = useIsPhone();
  const shown = isPhone ? PIECES.filter((p) => p.phone) : PIECES;

  return (
    <div className={`cover-desktop${isPhone ? " is-phone" : ""}`} aria-hidden={!visible}>
      {shown.map((p, i) => {
        const [l, t] = isPhone ? p.phone : [leftPct(p), topPct(p)];
        const interactive = !!(p.opensCase || p.href);
        // Sized and centred here rather than in CSS. The box has to be pulled
        // back by half its own HEIGHT, and a percentage margin resolves against
        // the container's WIDTH — so the vertical figure is width-relative too,
        // and expressing that as calc(var(--w) / var(--ar)) in the stylesheet
        // buys nothing but a division CSS is fussy about.
        const pw = p.pw || 60;
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
            {p.label && <span className="dpiece-label">{p.label}</span>}
          </>
        );

        // Paint only. Not a link, not focusable, not announced — the artboard
        // does not make these openable and neither do we.
        if (!interactive) {
          return (
            <motion.div
              key={p.key}
              className="dpiece is-art"
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
            style={style}
            href={p.href || `#/?case=${p.opensCase}`}
            target={p.newTab ? "_blank" : undefined}
            aria-label={p.aria}
            tabIndex={visible ? 0 : -1}
            // Only a PLAIN left click opens a window. Modified clicks and the
            // middle button are how people open things in new tabs, and
            // swallowing those would break the one habit an anchor promises —
            // so they fall through to the href, which is that window's own
            // shareable address.
            onClick={(e) => {
              if (!p.opensCase) return;
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey || e.button !== 0) return;
              e.preventDefault();
              onOpenCase?.(p.opensCase);
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
