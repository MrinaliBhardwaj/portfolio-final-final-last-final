// THE RIGHT-HAND PROPERTIES PANEL, BUILT AGAINST THE REAL ONE.
//
// The first version of this was written from memory and did not look like
// Figma. It showed the layer's NAME (Figma does not — the name lives in the
// layers panel), a 2x2 grid of X/Y/W/H (Figma splits those across Position and
// Resizing), an invented "Contents · N layers" row (Figma has no such thing),
// and a Fill row that said "Image" for every artboard, which is what started
// all this.
//
// So it was measured instead. With a frame selected, Figma's Design tab reads,
// top to bottom:
//
//   Design | Prototype ................................... 42% ⌄
//   Frame ⌄ ............................... ⠿ ✦ ◐ ❐ ⌄
//   Position ................................................ ⬚
//     Alignment     [⊣ ⊹ ⊢] [⊤ ⊹ ⊥]                          ≡
//     Position      X 0           Y 3021
//     Rotation      ⌐ 0°          ⟲ ⇄ ⇅
//   Auto layout / Layout .................................... ⬚
//     Resizing      W 1600 Fill   H 3689 ⌄                   ⤢
//   Appearance ........................................... 👁 ◌
//     Opacity       100%      Corner radius   0
//   Fill ................................................. ⠿ +
//     ■ FFFFFF      100 %                                  👁 −
//   Stroke .................................................. +
//   Effects ................................................. +
//   Export .................................................. +
//
// Every label sits ABOVE its control in grey, every value sits in a dark
// rounded field with a grey glyph for a prefix, and every section is divided
// by a hairline with its title in white and its affordances pushed right.
//
// WHAT IS NOT CLAIMED. X, Y, W and H are real — they come out of the file.
// Rotation 0°, opacity 100% and corner radius 0 are Figma's defaults for an
// untouched frame, which is what these are. The fill is the one thing left
// blank: fills cannot be read from `get_metadata`, sampling the exports
// returns Figma's own 1E1E1E canvas rather than the frame's fill, and
// inventing one is precisely the mistake this panel is here to undo. An empty
// Fill section with a + is a real Figma state; a wrong hex is not. Where a
// fill IS known — the design world's own boards, which she authored in
// code — it renders properly.
import { memo } from "react";

/** The stroke every glyph here shares. Typed literally so `strokeLinecap`
 *  stays the union SVG wants rather than widening to string.
 *  @type {{ fill: "none", stroke: string, strokeWidth: number, strokeLinecap: "round" }} */
const S = { fill: "none", stroke: "currentColor", strokeWidth: 1.1, strokeLinecap: "round" };

const Chev = () => (
  <svg className="dwp-chev" viewBox="0 0 8 8" aria-hidden="true">
    <path d="M2 3.2 4 5.2l2-2" {...S} strokeLinejoin="round" />
  </svg>
);

const Plus = () => (
  <svg viewBox="0 0 12 12" aria-hidden="true">
    <path d="M6 2.4v7.2M2.4 6h7.2" {...S} />
  </svg>
);

const Eye = () => (
  <svg viewBox="0 0 12 12" aria-hidden="true">
    <path d="M1.3 6S3 3.1 6 3.1 10.7 6 10.7 6 9 8.9 6 8.9 1.3 6 1.3 6Z" {...S} />
    <circle cx="6" cy="6" r="1.2" {...S} />
  </svg>
);

const Minus = () => (
  <svg viewBox="0 0 12 12" aria-hidden="true">
    <path d="M2.6 6h6.8" {...S} />
  </svg>
);

const Dots = () => (
  <svg viewBox="0 0 12 12" aria-hidden="true">
    {[3, 6, 9].map((y) =>
      [3.5, 8.5].map((x) => <circle key={`${x}-${y}`} cx={x} cy={y} r="0.75" fill="currentColor" />)
    )}
  </svg>
);

const Target = () => (
  <svg viewBox="0 0 12 12" aria-hidden="true">
    <path d="M1.6 3.4V1.6h1.8M8.6 1.6h1.8v1.8M10.4 8.6v1.8H8.6M3.4 10.4H1.6V8.6" {...S} strokeLinejoin="round" />
    <rect x="4.4" y="4.4" width="3.2" height="3.2" {...S} />
  </svg>
);

/* the six alignment marks, and the distribute one that sits apart from them */
const Align = ({ d }) => (
  <svg viewBox="0 0 12 12" aria-hidden="true">
    <path d={d} {...S} />
  </svg>
);
const ALIGN_H = ["M2.4 2v8M4.2 4.2h5.4M4.2 7.8h3.2", "M6 2v8M3.4 4.2h5.2M4.2 7.8h3.6", "M9.6 2v8M2.4 4.2h5.4M4.8 7.8h2.8"];
const ALIGN_V = ["M2 2.4h8M4.2 4.2v5.4M7.8 4.2v3.2", "M2 6h8M4.2 3.4v5.2M7.8 4.2v3.6", "M2 9.6h8M4.2 2.4v5.4M7.8 4.8v2.8"];

const Flip = ({ d }) => (
  <svg viewBox="0 0 12 12" aria-hidden="true">
    <path d={d} {...S} strokeLinejoin="round" />
  </svg>
);

/* a value cell: grey glyph, then the number — Figma's field, not a chip */
function Field({ glyph, value, trailing = null }) {
  return (
    <span className="dwp-f">
      <span className="dwp-f-g">{glyph}</span>
      <span className="dwp-f-v">{value}</span>
      {trailing && <span className="dwp-f-t">{trailing}</span>}
    </span>
  );
}

/* Stroke, Effects and Export carry nothing but a +, which is Figma's own
   empty state — so children is optional here. */
function Section({ title, right, children = null }) {
  return (
    <section className="dwp-s">
      <div className="dwp-s-top">
        <h3 className="dwp-s-title">{title}</h3>
        {right && <span className="dwp-s-acts">{right}</span>}
      </div>
      {children}
    </section>
  );
}

function PropsPanel({ frame }) {
  const p = frame.props || {};
  const fill = p.fill;

  return (
    <aside className="dwp" aria-label="Design properties">
      <div className="dwp-tabs">
        <span className="dwp-tab is-on">Design</span>
        <span className="dwp-tab">Prototype</span>
        <span className="dwp-zoom">
          100%
          <Chev />
        </span>
      </div>

      {/* THE SELECTION'S TYPE, which is the whole point. Figma puts it here, on
          its own line, in white — not the layer's name, which is already in
          the panel on the other side of the canvas. */}
      <div className="dwp-sel">
        <span className="dwp-sel-type">
          {frame.type || "Frame"}
          <Chev />
        </span>
        <span className="dwp-sel-acts" aria-hidden="true">
          <Dots />
          <svg viewBox="0 0 12 12">
            <path d="M6 1.8 8.2 4 6 6.2 3.8 4Zm0 4 2.2 2.2L6 10.2 3.8 8.2Z" {...S} strokeLinejoin="round" />
          </svg>
          <svg viewBox="0 0 12 12">
            <circle cx="6" cy="6" r="4.2" {...S} />
            <path d="M6 1.8v8.4A4.2 4.2 0 0 0 6 1.8Z" fill="currentColor" />
          </svg>
          <Chev />
        </span>
      </div>

      <Section title="Position" right={<Target />}>
        <p className="dwp-lab">Alignment</p>
        <div className="dwp-align" aria-hidden="true">
          <span className="dwp-grp">
            {ALIGN_H.map((d) => (
              <button key={d} type="button" className="dwp-ib" tabIndex={-1}>
                <Align d={d} />
              </button>
            ))}
          </span>
          <span className="dwp-grp">
            {ALIGN_V.map((d) => (
              <button key={d} type="button" className="dwp-ib" tabIndex={-1}>
                <Align d={d} />
              </button>
            ))}
          </span>
          <button type="button" className="dwp-ib" tabIndex={-1}>
            <Align d="M2 3h8M3.6 6h4.8M2 9h8" />
          </button>
        </div>

        <p className="dwp-lab">Position</p>
        <div className="dwp-row">
          <Field glyph="X" value={p.x} />
          <Field glyph="Y" value={p.y} />
        </div>

        <p className="dwp-lab">Rotation</p>
        <div className="dwp-row">
          <Field
            glyph={<Flip d="M2.6 2.6v6.8h6.8" />}
            value="0°"
          />
          <span className="dwp-ibs" aria-hidden="true">
            <button type="button" className="dwp-ib" tabIndex={-1}>
              <Flip d="M3 7.5a3.4 3.4 0 1 1 1.3 2.4M3 5.2v2.4h2.4" />
            </button>
            <button type="button" className="dwp-ib" tabIndex={-1}>
              <Flip d="M6 2v8M3.6 4.2 2 6l1.6 1.8M8.4 4.2 10 6l-1.6 1.8" />
            </button>
            <button type="button" className="dwp-ib" tabIndex={-1}>
              <Flip d="M2 6h8M4.2 3.6 6 2l1.8 1.6M4.2 8.4 6 10l1.8-1.6" />
            </button>
          </span>
        </div>
      </Section>

      <Section title="Layout" right={<Target />}>
        <p className="dwp-lab">Resizing</p>
        <div className="dwp-row">
          <Field glyph="W" value={p.w} />
          <Field glyph="H" value={p.h} trailing={<Chev />} />
        </div>
      </Section>

      <Section
        title="Appearance"
        right={
          <>
            <Eye />
            <svg viewBox="0 0 12 12" aria-hidden="true">
              <path d="M6 1.8 8.8 5a3.6 3.6 0 1 1-5.6 0Z" {...S} strokeLinejoin="round" />
            </svg>
          </>
        }
      >
        <div className="dwp-row dwp-row--labs">
          <p className="dwp-lab">Opacity</p>
          <p className="dwp-lab">Corner radius</p>
        </div>
        <div className="dwp-row">
          <Field glyph={<Dots />} value="100%" />
          <Field glyph={<Target />} value="0" />
        </div>
      </Section>

      <Section
        title="Fill"
        right={
          <>
            <Dots />
            <Plus />
          </>
        }
      >
        {/* Only when the fill is genuinely known. The design world's own boards
            carry one because she wrote it; an exported artboard does not. */}
        {fill && (
          <div className="dwp-fillrow">
            {fill.type === "image" ? (
              <>
                <span
                  className="dwp-sw dwp-sw--img"
                  style={{ backgroundImage: `url(${fill.src})` }}
                />
                <span className="dwp-f-v">Image</span>
              </>
            ) : fill === "transparent" ? (
              <>
                <span className="dwp-sw dwp-sw--none" />
                <span className="dwp-f-v">Transparent</span>
              </>
            ) : (
              <>
                <span className="dwp-sw" style={{ background: fill }} />
                <span className="dwp-f-v">{String(fill).replace("#", "").toUpperCase()}</span>
                <span className="dwp-f-o">100</span>
                <span className="dwp-f-pc">%</span>
              </>
            )}
            <span className="dwp-fillrow-acts" aria-hidden="true">
              <Eye />
              <Minus />
            </span>
          </div>
        )}
      </Section>

      <Section title="Stroke" right={<Plus />} />
      <Section title="Effects" right={<Plus />} />
      <Section title="Export" right={<Plus />} />
    </aside>
  );
}

export default memo(PropsPanel);
