// PAGE TWO of the scrapbook — the tech origin story, as a creative-desk
// collage. This is the page in her reference render.
//
// RECOVERED, not rewritten — see the note in Scene.jsx. Reconstructed from the
// transcripts' Write + Edit chain and verified against the full-file Read
// snapshot of 1 July 2026. The centerpiece art it points at,
// public/tech-discovery.webp, survived the rebuild on disk.
//
// Three deliberate edits since restoration, all by request: `onOpen` was
// rewired off the retired ArchivePanel drawer to #/tech; then the PROFILE.DOC
// tab and "pull for profile" note were REMOVED (27 July 2026), taking the
// `onOpen` prop with them — they were its only callers; and then the page was
// RE-COMPOSED (3 August 2026).
//
// ---- THE RE-COMPOSITION ----
// The brief was that this page fill the viewport's width with consistent side
// padding, sit centred in the room, and NOT get smaller — "reposition elements
// if necessary".
//
// It was necessary. The old plate was a 1485x1075 Figma stage (aspect 1.38 —
// nearly square) of absolutely-placed elements, in a viewport that is nearly
// 2:1. A fixed-aspect plate can obey width or height, never both, so fitting
// its height meant shrinking it to ~1006px on a 1440px screen and wasting
// 210px a side, with the pencil notes down at 8-10px.
//
// So the page is no longer a plate. It is three columns:
//
//     |<- 48u ->[ left margin  ]<- gap ->[ THE DRAWING ]<- gap ->[ right ]<- 48u ->|
//
// with the two margins pinned to the screen's edges and the drawing centred
// between them. The scene's HEIGHT is the room (notes-world.css), and `--u` —
// the unit every mark below is expressed in — comes from that height, so a
// wider window moves the columns apart instead of shrinking the type.
//
// Every element from the original is still here, and still in the margin it was
// drawn in; what changed is that each column is now a flex column with its four
// groups distributed, rather than four hand-placed y coordinates tuned for a
// 1075-tall stage. The GROUPS are the original's own grouping — that is the
// part worth preserving, and it survives any height.
//
// The other half of the size problem was the centrepiece itself: 31% of its
// width was blank cream. It is cropped to its measured ink now, which is what
// buys the drawing back its size. See .t2-plate in notes-world.css.
//
// Stage is 714 units tall (page one's native height, so the two sheets are the
// same shape); U(n) below is that space.
const U = (n) => `calc(${n} * var(--u))`;

/* A hand-drawn, slightly-wavy rectangle so framed scraps read as pencil,
   not crisp CSS borders. viewBox matches the card so strokes stay even. */
function RoughBox({ w, h, stroke = "#6b6660" }) {
  const d =
    `M5,6 C${w * 0.35},2 ${w * 0.7},7 ${w - 6},4 ` +
    `C${w - 2},${h * 0.32} ${w - 7},${h * 0.68} ${w - 4},${h - 5} ` +
    `C${w * 0.68},${h - 2} ${w * 0.32},${h - 7} 6,${h - 4} ` +
    `C2,${h * 0.7} 7,${h * 0.32} 5,6`;
  return (
    <svg className="t2-box" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" aria-hidden="true">
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

/* Loose pencil underline for a heading word. */
function Underline({ w = 70 }) {
  return (
    <svg className="t2-uline" viewBox={`0 0 ${w} 8`} preserveAspectRatio="none" aria-hidden="true">
      <path d={`M2,4 C${w * 0.3},2 ${w * 0.6},7 ${w - 2},3`} fill="none" stroke="#8a8478" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

export default function SceneTwo() {
  return (
    <section className="sheet sheet-two">
      <div className="nw-stage">
        <div className="scene-two">

          {/* ============ LEFT MARGIN ============
              The narrative opens here, then the pencil work runs down the page
              in the order it was drawn in. */}
          <div className="t2-col t2-col--left">
            <div>
              <p className="t-copy">
                For the other half, the little one knew visuals alone weren&rsquo;t gonna cut it.
              </p>
              <p className="t-copy">What do ideas even mean if you can&rsquo;t build them.</p>
            </div>

            <div>
              <div className="t2-note" style={{ fontSize: U(19), transform: "rotate(-2deg)" }}>
                const idea = reality;
              </div>
              <svg className="t2-arrow" viewBox="0 0 60 64" aria-hidden="true">
                <path d="M10,6 C2,22 4,40 30,52" fill="none" stroke="#8a8478" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M30,52 L20,50 M30,52 L26,42" fill="none" stroke="#8a8478" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <div className="t2-note" style={{ fontSize: U(17), lineHeight: U(25) }}>
                function makeItReal() {"{"}<br />
                &nbsp;&nbsp;plan();<br />
                &nbsp;&nbsp;build();<br />
                &nbsp;&nbsp;ship();<br />
                {"}"}
              </div>
            </div>

            <div className="t2-note" style={{ fontSize: U(18), lineHeight: U(26) }}>
              <span className="t2-head">notes<Underline w={62} /></span><br />
              - keep it simple<br />
              - solve real problems<br />
              - don&rsquo;t overbuild<br />
              - ship {">"} perfect
            </div>

            <div className="t2-card" style={{ width: U(272), height: U(92), transform: "rotate(-1deg)" }}>
              <RoughBox w={272} h={92} />
              <div className="tape" style={{ left: "50%", top: U(-15), width: U(110), height: U(34), transform: "translateX(-50%) rotate(-4deg)" }} />
              <div className="t2-card-body" style={{ fontSize: U(18), lineHeight: U(26) }}>
                reminder:<br />
                progress {">"} perfection <span className="t2-spark">&#10038;</span>
              </div>
            </div>
          </div>

          {/* ============ CENTREPIECE: the real hand-drawn reference ============
              The plate is the drawing's INK box, not the file's box — the image
              is oversized and offset inside it so the blank cream is cropped
              away. All four numbers are in notes-world.css. */}
          <div className="t2-plate">
            <img
              className="t2-ref"
              src="/tech-discovery.webp"
              alt="Hand-drawn pencil flow: from first website through prototype, deployment and first real product — idea, sketch, wireframe, build, launch, iterate."
              draggable="false"
            />
          </div>

          {/* ============ RIGHT MARGIN ============
              The stack, the terminal, the ship note — and the page's closing
              line at the foot, so the narrative ends bottom-right where it
              ended before. */}
          <div className="t2-col t2-col--right">
            <div className="t2-card" style={{ width: U(210), height: U(212) }}>
              <RoughBox w={210} h={212} />
              <div className="t2-card-body" style={{ fontSize: U(17), lineHeight: U(24) }}>
                <span className="t2-head">tech stack<Underline w={92} /></span><br />
                - next.js<br />
                - typescript<br />
                - tailwind css<br />
                - supabase<br />
                - vercel
              </div>
            </div>

            <div className="t2-note" style={{ fontSize: U(15), lineHeight: U(22) }}>
              $ npm run dev<br />
              <span className="t2-mut">{">"} ready on localhost:3000</span><br />
              <span style={{ display: "block", height: U(10) }} />
              $ git commit -m &ldquo;ship it&rdquo;<br />
              $ git push origin main
            </div>

            <div className="t2-card" style={{ width: U(180), height: U(54) }}>
              <RoughBox w={180} h={54} />
              <div className="t2-card-body" style={{ fontSize: U(16), lineHeight: U(23) }}>
                v1.2 shipped <span className="t2-spark">&#10003;</span>
              </div>
            </div>

            {/* The authored line breaks are gone on purpose. They were tuned
                for a plate where this line had ~500 units to run in; the margin
                column is 250, so "And somewhere between the bugs" wrapped
                anyway and the hard breaks only added ragged half-lines under
                it. Balanced wrapping keeps the three-beat shape without
                pretending to a width this column doesn't have. */}
            <p className="t-copy t-copy--close">
              And somewhere between the bugs and the late nights, all ideas
              started feeling real.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
