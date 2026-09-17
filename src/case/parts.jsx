// THE EDITORIAL KIT every project page is built from.
//
// The rule these exist to enforce is the one in PRODUCT.md: "Worlds diverge,
// chrome agrees." A project page is allowed to look nothing like the one before
// it — its own palette, its own typefaces, its own section-label motif, its own
// rhythm — but the things that make it feel like THIS portfolio must be the
// same objects underneath: the same reveal, the same measure, the same sticky
// behaviour, the same lazy images, the same reduced-motion contract.
//
// So: no project page positions anything itself. It picks parts, in an order it
// chose, and dresses them with its theme's custom properties. Everything that
// could drift lives here once.
//
// NOTHING HERE ANIMATES ANYTHING BUT transform AND opacity, and nothing here
// runs a rAF loop that outlives what it is animating — both are house rules,
// and this window is the heaviest thing on the site.
import {
  createContext,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";

// ---------------------------------------------------------------- reveal ----

/**
 * ONE OBSERVER PER PAGE, not one per element. A study is seventy or eighty
 * revealed objects; seventy IntersectionObservers is seventy sets of callbacks
 * the compositor has to service on a document that is already the most
 * expensive thing here.
 *
 * `root` is the WINDOW'S scroller, not the viewport. The study scrolls inside
 * `.cw-main` — against the viewport every element in the document is "visible"
 * from the first frame and nothing ever reveals.
 * @type {React.Context<null | ((el: Element) => () => void)>}
 */
const RevealCtx = createContext(null);

/**
 * Hand out an `observe` that reveals once and then forgets the element. Once a
 * thing has been seen it costs nothing for the rest of the session — which is
 * the whole reason this is an observer and not a scroll handler.
 * @param {React.RefObject<HTMLElement | null>} scrollerRef
 * @param {boolean} animate false = reduced motion, or no JS-driven motion at all
 */
export function useRevealRoot(scrollerRef, animate) {
  const pending = useRef(new Set());
  const io = useRef(/** @type {IntersectionObserver | null} */ (null));

  useEffect(() => {
    if (!animate) return undefined;
    const root = scrollerRef.current || null;
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (!e.isIntersecting) continue;
          e.target.classList.add("is-in");
          obs.unobserve(e.target);
        }
      },
      // 12% up from the bottom edge: the object has properly arrived before it
      // starts, rather than beginning its move while still off the screen.
      { root, rootMargin: "0px 0px -12% 0px", threshold: 0.01 },
    );
    io.current = obs;
    for (const el of pending.current) obs.observe(el);
    pending.current.clear();

    // A BACKSTOP, because an unseen page is worse than an unanimated one.
    // Headless renderers, print, a scroller that never scrolls and any future
    // container-with-no-layout all end with elements observed and never
    // intersecting. After 2.4s, show everything that is still waiting.
    const t = setTimeout(() => {
      for (const el of Array.from(root ? root.querySelectorAll(".pp-r:not(.is-in)") : []))
        el.classList.add("is-in");
    }, 2400);

    return () => {
      clearTimeout(t);
      obs.disconnect();
      io.current = null;
    };
  }, [scrollerRef, animate]);

  return useMemo(
    () => (el) => {
      if (!animate || !el) return () => {};
      if (io.current) io.current.observe(el);
      else pending.current.add(el);
      return () => {
        io.current?.unobserve(el);
        pending.current.delete(el);
      };
    },
    [animate],
  );
}

/**
 * @param {object} p
 * @param {(el: Element) => () => void} p.observe
 * @param {any} p.children
 */
export function RevealProvider({ observe, children }) {
  return <RevealCtx.Provider value={observe}>{children}</RevealCtx.Provider>;
}

/**
 * A thing that arrives rather than being there.
 *
 * THE RESTING STATE IS VISIBLE. `.pp-r` on its own paints normally; only a page
 * whose root carries `data-anim="on"` — set in a layout effect, and only when
 * the visitor has not asked for reduced motion — hides it until `.is-in`. A
 * study that reaches a reader with no JS, with JS that threw, or under reduced
 * motion is a study they can read, which is the whole of the contract.
 *
 * @param {object} p
 * @param {"up"|"left"|"right"|"in"|"wipe"} [p.from] which way it arrives
 * @param {number} [p.delay] seconds, for stagger inside one row
 * @param {string} [p.as] element to render
 * @param {string} [p.className]
 * @param {React.CSSProperties} [p.style]
 * @param {any} p.children
 */
export function Reveal({ from = "up", delay = 0, as = "div", className = "", style, children }) {
  // A tag name chosen at runtime. TS cannot narrow a string variable to an
  // intrinsic element, and the alternative — a union of every tag this is ever
  // called with — is a list that goes stale on the next section.
  const As = /** @type {any} */ (as);
  const observe = useContext(RevealCtx);
  const ref = useRef(null);
  useEffect(() => (observe ? observe(ref.current) : undefined), [observe]);
  return (
    <As
      ref={ref}
      className={`pp-r pp-r--${from} ${className}`.trim()}
      style={delay ? { ...style, transitionDelay: `${delay}s` } : style}
    >
      {children}
    </As>
  );
}

// -------------------------------------------------------------- parallax ----

/**
 * ONE scroll listener for the whole page, rAF-throttled, and only while there
 * is something registered to move. It writes a single custom property per
 * element and nothing else — no layout is read in the handler beyond the
 * scroller's own scrollTop, and the elements' boxes are measured once on
 * registration and again only on resize.
 *
 * Off entirely under reduced motion, and off on coarse pointers: a phone is
 * where this costs the most and reads the least.
 * @param {React.RefObject<HTMLElement | null>} scrollerRef
 * @param {boolean} animate
 */
export function useParallaxRoot(scrollerRef, animate) {
  const items = useRef(/** @type {Map<HTMLElement, number>} */ (new Map()));
  const frame = useRef(0);

  const on =
    animate &&
    typeof window !== "undefined" &&
    !window.matchMedia?.("(pointer: coarse)").matches;

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!on || !scroller) return undefined;

    // READ EVERYTHING, THEN WRITE EVERYTHING. Interleaving the two is what
    // this cost before: setting --pp-p feeds a transform, so the next
    // getBoundingClientRect in the same loop forces a synchronous layout of a
    // ten-thousand-pixel document — twelve of them per frame. Layout was 6.1s
    // of a single case study opening. Two passes, one layout.
    const boxes = [];
    const paint = () => {
      frame.current = 0;
      const sr = scroller.getBoundingClientRect();
      const h = sr.height || 1;
      boxes.length = 0;
      for (const el of items.current.keys()) {
        // MEASURE THE PARENT, NEVER THE ELEMENT ITSELF. This writes a transform
        // onto `el`, and getBoundingClientRect reports the box AFTER transforms
        // — so reading `el` feeds the last frame's offset back in and the image
        // walks off the document. (It did: 588,000px down, and the plate looked
        // like an empty grey box.) The frame around it never moves.
        const host = el.parentElement || el;
        boxes.push([el, host.getBoundingClientRect()]);
      }
      for (const [el, r] of boxes) {
        // +1 when the frame's middle is at the bottom of the pane, -1 at the
        // top; clamped, so an element far off screen cannot ask for a huge
        // offset it will never be seen at.
        const p = ((r.top + r.height / 2 - sr.top) / h) * 2 - 1;
        const clamped = p < -1.4 ? -1.4 : p > 1.4 ? 1.4 : p;
        // the DEPTH is applied in CSS (--pp-d), not here — doing both is what
        // turned a 26px drift into a 676px one
        el.style.setProperty("--pp-p", (-clamped).toFixed(4));
      }
    };
    const onScroll = () => {
      if (!frame.current) frame.current = requestAnimationFrame(paint);
    };
    scroller.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    paint();
    return () => {
      scroller.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame.current) cancelAnimationFrame(frame.current);
      frame.current = 0;
    };
  }, [scrollerRef, on]);

  return useMemo(
    () => (el, depth) => {
      if (!on || !el) return () => {};
      items.current.set(el, depth);
      return () => items.current.delete(el);
    },
    [on],
  );
}

const ParallaxCtx = createContext(/** @type {null | ((el: HTMLElement, d: number) => () => void)} */ (null));

/**
 * @param {object} p
 * @param {(el: HTMLElement, depth: number) => () => void} p.register
 * @param {any} p.children
 */
export function ParallaxProvider({ register, children }) {
  return <ParallaxCtx.Provider value={register}>{children}</ParallaxCtx.Provider>;
}

/** @param {number} depth how far it drifts, in CSS px at the extremes */
function useParallax(depth) {
  const register = useContext(ParallaxCtx);
  const ref = useRef(null);
  useEffect(() => (register && depth ? register(ref.current, depth) : undefined), [register, depth]);
  return ref;
}

// ----------------------------------------------------------------- parts ----

/**
 * A NUMBERED SECTION, and the number is not decoration — every one of her
 * boards numbers its own sections ("08 — BRAND", "06 — DECISIONS",
 * `<Theme\>`), so the page is quoting the deck's own wayfinding. The theme
 * decides how the label is DRAWN; the part only decides that there is one.
 * @param {object} p
 * @param {string} [p.n] the section's number, as she wrote it
 * @param {string} p.label
 * @param {string} [p.tone] a theme-defined ground: "operator", "forest", "navy"…
 * @param {boolean} [p.flush] a tighter top, for the section under a bleed band
 * @param {string} [p.className]
 * @param {any} p.children
 */
export function Chapter({ n = "", label, tone = "", flush = false, className = "", children }) {
  return (
    <section
      className={`pp-ch${flush ? " is-flush" : ""} ${className}`.trim()}
      data-tone={tone || undefined}
      aria-label={label}
    >
      <Reveal className="pp-ch-head" from="left">
        {n && <span className="pp-ch-n">{n}</span>}
        <span className="pp-ch-label">{label}</span>
      </Reveal>
      {children}
    </section>
  );
}

/**
 * The line the section is about, set as large as the theme dares. One per
 * section at most — a page where everything shouts says nothing.
 * @param {object} p
 * @param {"xl"|"lg"|"md"} [p.size]
 * @param {string} [p.as]
 * @param {string} [p.className]
 * @param {any} p.children
 */
export function Statement({ size = "lg", as: As = "h3", className = "", children }) {
  return (
    <Reveal as={As} from="up" className={`pp-say pp-say--${size} ${className}`.trim()}>
      {children}
    </Reveal>
  );
}

/**
 * The paragraph under a Statement — measure-capped, never full width.
 * @param {object} p
 * @param {boolean} [p.wide] let it out to 86ch, for a stated argument
 * @param {string} [p.className]
 * @param {any} p.children
 */
export function Say({ wide = false, className = "", children }) {
  return (
    <Reveal as="p" className={`pp-copy${wide ? " is-wide" : ""} ${className}`.trim()}>
      {children}
    </Reveal>
  );
}

/**
 * A small annotation: a caption that is an argument, not a filename.
 * @param {object} p
 * @param {string} [p.className]
 * @param {any} p.children
 */
export function Note({ className = "", children }) {
  return <p className={`pp-note ${className}`.trim()}>{children}</p>;
}

/**
 * FULL-BLEED. The document has a measure and this ignores it: the band runs the
 * whole width of the scrolling pane, which is the one gesture that makes a page
 * feel art-directed rather than typeset.
 *
 * It breaks out with negative margins rather than by leaving the document,
 * because the document's padding is itself animated (the sidebar's fold moves
 * it), and anything positioned against the pane instead would drift 122px
 * sideways every time a reader scrolls past the fold.
 * @param {object} p
 * @param {string} [p.src] the picture; omit for a band of pure colour
 * @param {string} [p.alt]
 * @param {"tall"|"short"|"auto"} [p.h]
 * @param {number} [p.depth] parallax, in px of drift at the extremes
 * @param {string} [p.tone]
 * @param {string} [p.className]
 * @param {any} [p.children] words over the band; they bring a scrim with them
 */
export function Bleed({
  src = "",
  alt = "",
  h = "short",
  depth = 0,
  tone = "",
  className = "",
  children = null,
}) {
  const ref = useParallax(depth);
  return (
    <Reveal
      from="in"
      className={`pp-bleed pp-bleed--${h} ${className}`.trim()}
      data-tone={tone || undefined}
    >
      {src && (
        <img
          ref={ref}
          className="pp-bleed-img"
          src={src}
          alt={alt}
          loading="lazy"
          decoding="async"
          draggable="false"
          style={depth ? { "--pp-d": `${depth}px` } : undefined}
        />
      )}
      {children && <div className="pp-bleed-in">{children}</div>}
    </Reveal>
  );
}

/**
 * A picture, framed the way the theme frames pictures. `w` and `h` are the
 * file's real pixels and are not optional: the study is a scroller inside a
 * scroller, and an image that arrives without its box reserved moves the line
 * the reader is on.
 * @param {object} p
 * @param {string} p.src
 * @param {string} [p.alt]
 * @param {[number, number]} p.size the file's own pixels, from art.js
 * @param {string} [p.caption]
 * @param {"cover"|"contain"} [p.fit] cover crops to the box, contain fits inside it
 * @param {number} [p.depth] parallax, in px of drift at the extremes
 * @param {string} [p.ratio] crop the box; omit to keep the file's own shape
 * @param {"up"|"left"|"right"|"in"|"wipe"} [p.from]
 * @param {number} [p.delay]
 * @param {string} [p.className]
 */
export function Plate({
  src,
  alt = "",
  size,
  caption = "",
  fit = "cover",
  depth = 0,
  ratio = "",
  from = "up",
  delay = 0,
  className = "",
}) {
  const ref = useParallax(depth);
  const [w, h] = size;
  return (
    <Reveal from={from} delay={delay} as="figure" className={`pp-plate ${className}`.trim()}>
      <span className="pp-plate-box" style={ratio ? { aspectRatio: ratio } : undefined}>
        <img
          ref={ref}
          src={src}
          alt={alt}
          width={w}
          height={h}
          loading="lazy"
          decoding="async"
          draggable="false"
          style={{ objectFit: fit, ...(depth ? { "--pp-d": `${depth}px` } : null) }}
        />
      </span>
      {caption && <figcaption>{caption}</figcaption>}
    </Reveal>
  );
}

/**
 * TWO COLUMNS THAT ARE NOT THE SAME WIDTH. `ratio` is the left column's share;
 * the asymmetry is the point, and a page of 50/50 splits is a grid pretending
 * to be a composition.
 * @param {object} p
 * @param {string} [p.ratio] any grid-template-columns value
 * @param {boolean} [p.middle] centre the columns against each other
 * @param {boolean} [p.flip] on a narrow column, stack the SECOND child first
 * @param {string} [p.gap]
 * @param {string} [p.className]
 * @param {any} p.children
 */
export function Split({
  ratio = "1fr 1fr",
  middle = false,
  flip = false,
  gap = "",
  className = "",
  children,
}) {
  return (
    <div
      className={`pp-split${middle ? " is-middle" : ""}${flip ? " is-flip" : ""} ${className}`.trim()}
      style={{ "--pp-cols": ratio, ...(gap ? { "--pp-gap": gap } : null) }}
    >
      {children}
    </div>
  );
}

/**
 * A plain vertical run with the theme's rhythm between its children.
 * @param {object} p
 * @param {string} [p.gap]
 * @param {string} [p.className]
 * @param {any} p.children
 */
export function Run({ gap = "", className = "", children }) {
  return (
    <div className={`pp-run ${className}`.trim()} style={gap ? { "--pp-gap": gap } : undefined}>
      {children}
    </div>
  );
}

/**
 * A SCROLL RAIL. Screens belong beside each other when the thing being shown is
 * a FLOW: six onboarding steps stacked vertically is a list, and the same six
 * in a row you push through is the sequence they actually are.
 *
 * Snapped, keyboard-reachable, and it says how many there are — a rail that
 * does not announce its length is a rail nobody scrolls.
 * @param {object} p
 * @param {"phone"|"wide"|"free"} [p.kind] the slot shape
 * @param {string} [p.label]
 * @param {string} [p.count] how many there are, said out loud
 * @param {string} [p.className]
 * @param {any} p.children
 */
export function Rail({ kind = "phone", label = "", count = "", className = "", children }) {
  return (
    <Reveal className={`pp-rail pp-rail--${kind} ${className}`.trim()}>
      {(label || count) && (
        <p className="pp-rail-head">
          {label}
          {count ? <span className="pp-rail-n">{count}</span> : null}
        </p>
      )}
      <ul className="pp-rail-track" tabIndex={0} aria-label={label}>
        {children}
      </ul>
    </Reveal>
  );
}

/**
 * One cell of a Rail.
 * @param {object} p
 * @param {string} p.src
 * @param {string} p.alt
 * @param {[number, number]} p.size
 * @param {string} [p.caption]
 * @param {string} [p.tint]
 * @param {string} [p.className]
 */
export function Slide({ src, alt, size, caption = "", tint = "", className = "" }) {
  const [w, h] = size;
  return (
    <li className={`pp-slide ${className}`.trim()} style={tint ? { "--pp-tint": tint } : undefined}>
      <img
        src={src}
        alt={alt}
        width={w}
        height={h}
        loading="lazy"
        decoding="async"
        draggable="false"
      />
      {caption && <p className="pp-slide-cap">{caption}</p>}
    </li>
  );
}

/**
 * A CAPTION THAT STAYS WHILE ITS EVIDENCE GOES PAST. Sticky is the cheapest
 * honest way to say "all of this is one argument" — no scroll handler, no
 * measurement, and it degrades to a normal heading the moment the column is too
 * narrow to hold two things side by side.
 * @param {object} p
 * @param {any} p.aside the thing that stays
 * @param {string} [p.ratio]
 * @param {string} [p.className]
 * @param {any} p.children the evidence that goes past
 */
export function Sticky({ aside, ratio = "0.85fr 1.4fr", className = "", children }) {
  return (
    <div className={`pp-sticky ${className}`.trim()} style={{ "--pp-cols": ratio }}>
      <div className="pp-sticky-aside">
        <div className="pp-sticky-pin">{aside}</div>
      </div>
      <div className="pp-sticky-flow">{children}</div>
    </div>
  );
}

/**
 * The numbers, big. Every project's board already has a row like this and the
 * figures in it are hers; nothing here is computed or rounded.
 * @param {object} p
 * @param {{value: string, label: string, note?: string}[]} p.items
 * @param {string} [p.className]
 */
export function Figures({ items, className = "" }) {
  return (
    <dl className={`pp-figs ${className}`.trim()}>
      {items.map((f, i) => (
        <Reveal as="div" key={f.label} delay={i * 0.06} className="pp-fig">
          <dd>{f.value}</dd>
          <dt>{f.label}</dt>
          {f.note && <p>{f.note}</p>}
        </Reveal>
      ))}
    </dl>
  );
}

/**
 * THE PALETTE, DRAWN IN THE PALETTE. Every hex here is copied off her own
 * colour slide, and the swatch is painted with it rather than being a picture
 * of it — so it is selectable, searchable, and right at any zoom.
 * @param {object} p
 * @param {{hex: string, name?: string, ink?: string}[]} p.items
 * @param {string} [p.className]
 */
export function Swatches({ items, className = "" }) {
  return (
    <ul className={`pp-swatches ${className}`.trim()}>
      {items.map((s, i) => (
        <Reveal
          as="li"
          key={s.hex + s.name}
          delay={i * 0.04}
          className="pp-swatch"
          style={{ background: s.hex, color: s.ink || "#fff" }}
        >
          <span className="pp-swatch-hex">{s.hex}</span>
          {s.name && <span className="pp-swatch-name">{s.name}</span>}
        </Reveal>
      ))}
    </ul>
  );
}

/**
 * A line of hers, given the room a line of hers deserves.
 * @param {object} p
 * @param {string} [p.by]
 * @param {string} [p.className]
 * @param {any} p.children
 */
export function Pull({ by = "", className = "", children }) {
  return (
    <Reveal as="blockquote" from="wipe" className={`pp-pull ${className}`.trim()}>
      <p>{children}</p>
      {by && <cite>{by}</cite>}
    </Reveal>
  );
}

/**
 * A LIST THAT IS AN ARGUMENT. Three columns of short bullets — "what broke /
 * what buyers needed / what I did" — is the shape a case study reaches for
 * constantly and the shape a template renders worst.
 * @param {object} p
 * @param {{head: string, items: string[]}[]} p.groups
 * @param {string} [p.className]
 */
export function Columns({ groups, className = "" }) {
  return (
    <div className={`pp-cols ${className}`.trim()}>
      {groups.map((g, i) => (
        <Reveal as="div" key={g.head} delay={i * 0.07} className="pp-col">
          <h4>{g.head}</h4>
          <ul>
            {g.items.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>
        </Reveal>
      ))}
    </div>
  );
}

/**
 * A MOTIF BAND. Each project has one thing it repeats — a reversed "e", a
 * `<tag\>`, a monospace coordinate — and a band of it is the cheapest way to
 * change the page's temperature between two sections.
 *
 * Duplicated content is `aria-hidden`: the marquee reads once to a screen
 * reader and scrolls twice to everyone else. It does not move at all under
 * reduced motion — a CSS animation, so the media query in index.css already
 * stops it, and `will-change` is deliberately absent so an idle band off screen
 * costs no layer.
 * @param {object} p
 * @param {any} p.children
 * @param {string} [p.className]
 */
export function Marquee({ children, className = "" }) {
  return (
    <div className={`pp-marq ${className}`.trim()} aria-hidden="true">
      <div className="pp-marq-track">
        <span>{children}</span>
        <span>{children}</span>
      </div>
    </div>
  );
}

/**
 * The small print at the foot of a section: her own label for the artwork.
 * @param {object} p
 * @param {any} p.children
 */
export function Credit({ children }) {
  return <p className="pp-credit">{children}</p>;
}

// -------------------------------------------------------------- the page ----

/**
 * WHERE MOTION IS DECIDED, once, for the whole page.
 *
 * `data-anim` is set in a LAYOUT effect so the first painted frame is already
 * the hidden state — set in a passive effect the page would flash complete and
 * then hide itself, which is worse than no animation at all. It is an attribute
 * write on one node, not a state change: none of the re-render cascade that the
 * cover's insta-land effect turned out to be paying for.
 */
export function usePageMotion(rootRef) {
  const [animate] = useState(
    () =>
      typeof window === "undefined" ||
      !window.matchMedia?.("(prefers-reduced-motion: reduce)").matches,
  );
  useLayoutEffect(() => {
    if (animate && rootRef.current) rootRef.current.dataset.anim = "on";
  }, [animate, rootRef]);
  return animate;
}
