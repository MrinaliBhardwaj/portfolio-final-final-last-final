// PAGE TWO of the scrapbook — the tech origin story, as a creative-desk
// collage. This is the page in her reference render.
//
// RECOVERED, not rewritten — see the note in Scene.jsx. Reconstructed from the
// transcripts' Write + Edit chain and verified against the full-file Read
// snapshot of 1 July 2026. The centerpiece art it points at,
// public/tech-discovery.png, survived the rebuild on disk.
//
// Only restoration edit: `onOpen` used to open the retired ArchivePanel
// drawer; the PROFILE.DOC tab and "pull for profile" note now navigate to
// #/tech — this page's story, continued in the present tense.
//
// Stage is 1485x1075 with `--u = 100cqw/1485`; U(n) below is Figma space.
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

export default function SceneTwo({ onOpen }) {
  return (
    <section className="sheet sheet-two">
      <div className="nw-stage">
        <div className="scene-two">

          {/* ============ NARRATIVE COPY (top band, clear of the sheet) ============ */}
          <div className="t-copy" style={{ left: U(70), top: U(40) }}>
            For the other half, the little one knew visuals alone weren&rsquo;t gonna cut it.
            <span style={{ display: "block", height: U(14) }} />
            What do ideas even mean if you can&rsquo;t build them.
          </div>

          <div className="t-copy" style={{ left: U(980), top: U(842) }}>
            And somewhere between the bugs<br />
            and the late nights,<br />
            all ideas started feeling real.
          </div>

          {/* ============ CENTERPIECE: the real hand-drawn reference ============
              Aspect (1474/1067) matches the scene, so it drops in 1:1. */}
          <img
            className="t2-ref"
            src="/tech-discovery.png"
            alt="Hand-drawn pencil flow: from first website through prototype, deployment and first real product — idea, sketch, wireframe, build, launch, iterate."
            draggable="false"
          />

          {/* ============ LEFT MARGIN · pencil work ============ */}
          <div className="t2-note" style={{ left: U(34), top: U(150), fontSize: U(27), transform: "rotate(-2deg)" }}>
            const idea = reality;
          </div>
          <svg className="t2-arrow" viewBox="0 0 60 64" aria-hidden="true" style={{ left: U(36), top: U(180), width: U(60), height: U(64) }}>
            <path d="M10,6 C2,22 4,40 30,52" fill="none" stroke="#8a8478" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M30,52 L20,50 M30,52 L26,42" fill="none" stroke="#8a8478" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <div className="t2-note" style={{ left: U(74), top: U(224), fontSize: U(24), lineHeight: U(33) }}>
            function makeItReal() {"{"}<br />
            &nbsp;&nbsp;plan();<br />
            &nbsp;&nbsp;build();<br />
            &nbsp;&nbsp;ship();<br />
            {"}"}
          </div>

          <div className="t2-note" style={{ left: U(56), top: U(466), fontSize: U(25), lineHeight: U(35) }}>
            <span className="t2-head">notes<Underline w={62} /></span><br />
            - keep it simple<br />
            - solve real problems<br />
            - don&rsquo;t overbuild<br />
            - ship {">"} perfect
          </div>

          <div className="t2-card" style={{ left: U(38), top: U(724), width: U(266), height: U(116), transform: "rotate(-1deg)" }}>
            <RoughBox w={266} h={116} />
            <div className="tape" style={{ left: "50%", top: U(-15), width: U(110), height: U(34), transform: "translateX(-50%) rotate(-4deg)" }} />
            <div className="t2-card-body" style={{ fontSize: U(25), lineHeight: U(34) }}>
              reminder:<br />
              progress {">"} perfection <span className="t2-spark">&#10038;</span>
            </div>
          </div>

          {/* ============ RIGHT MARGIN · pencil work ============ */}
          <div className="t2-card" style={{ left: U(1244), top: U(148), width: U(152), height: U(226) }}>
            <RoughBox w={152} h={226} />
            <div className="t2-card-body" style={{ fontSize: U(24), lineHeight: U(31) }}>
              <span className="t2-head">tech stack<Underline w={92} /></span><br />
              - next.js<br />
              - typescript<br />
              - tailwind css<br />
              - supabase<br />
              - vercel
            </div>
          </div>

          <div className="t2-note" style={{ left: U(1240), top: U(392), fontSize: U(21), lineHeight: U(29) }}>
            $ npm run dev<br />
            <span className="t2-mut">{">"} ready on localhost:3000</span><br />
            <span style={{ display: "block", height: U(10) }} />
            $ git commit -m &ldquo;ship it&rdquo;<br />
            $ git push origin main
          </div>

          <div className="t2-card" style={{ left: U(1240), top: U(566), width: U(168), height: U(50) }}>
            <RoughBox w={168} h={50} />
            <div className="t2-card-body" style={{ fontSize: U(23), lineHeight: U(28) }}>
              v1.2 shipped <span className="t2-spark">&#10003;</span>
            </div>
          </div>

          {/* ============ Reused tab + pull note ============ */}
          <button className="pull" onClick={onOpen} style={{ left: U(1232), top: U(70), fontSize: U(30), transform: "rotate(-8deg)" }}>
            pull for profile
          </button>
          <button className="archive-tab" onClick={onOpen} aria-label="Open the engineering portfolio" style={{ top: U(40) }}>
            <span>PROFILE.DOC</span>
          </button>
        </div>
      </div>
    </section>
  );
}
