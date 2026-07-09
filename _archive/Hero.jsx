// Hero — a faithful reconstruction of the Figma frame "Desktop - 12"
// (file: portfolio / attempt 2). Built on a 1440x1024 stage where one Figma
// pixel == 1 * var(--u), so the whole composition scales to the viewport while
// preserving exact positions, sizes, rotations and the layered typography.
const U = (n) => `calc(${n} * var(--u))`;

export default function Hero() {
  return (
    <section className="hero">
      {/* Real, machine-readable identity. The stage below is a decorative
          reconstruction whose name is split into positioned fragments, so it
          is hidden from assistive tech / search in favour of this heading. */}
      <h1 className="sr-only">Mrinali Bhardwaj — UI/UX Designer &amp; Design Engineer</h1>

      <div className="hero-stage" aria-hidden="true">

        {/* ---------- paper + lotus collage (top-right group @ 812,52) ---------- */}
        <div className="h-grp" style={{ left: U(812), top: U(52), width: U(1027), height: U(904) }}>
          <div className="h-asset" style={{ left: U(123), top: U(0), width: U(563), height: U(824) }}>
            <img src="/hero/paper-lotus.png" alt="Torn handmade-paper panel with a single-line lotus illustration" style={{ transform: "scaleX(-1)" }} />
          </div>
          <div className="h-asset" style={{ left: U(113), top: U(738), width: U(921.432), height: U(171.411), transform: "rotate(176.44deg) scaleY(-1)" }}>
            <img src="/hero/paper-bottom.png" alt="" />
          </div>
          <div className="h-asset" style={{ left: U(0), top: U(66.29), width: U(222.62), height: U(799.865), transform: "rotate(-4.55deg)" }}>
            <img src="/hero/paper-left.png" alt="" />
          </div>
          <div className="h-asset" style={{ left: U(259), top: U(-36), width: U(267.535), height: U(134.129), opacity: 0.45, transform: "rotate(-7.16deg)" }}>
            <img src="/hero/tape.png" alt="" style={{ objectFit: "cover" }} />
          </div>
        </div>

        {/* ---------- the name (Ballet, two-layer offset) ---------- */}
        <div className="h-name">
          {/* M — oversized cap, blush over a taupe ghost */}
          <p style={{ left: U(64.04), top: U(215.68), fontSize: U(307.822), letterSpacing: U(-27.704), color: "#b1a392" }}>M</p>
          <p style={{ left: U(66.35), top: U(214.91), fontSize: U(307.822), letterSpacing: U(-27.704), color: "#fe8fbc" }}>M</p>
          {/* rinali */}
          <p style={{ left: U(511.69), top: U(277.31), fontSize: U(247.733), color: "#b1a392" }}>rinali</p>
          <p style={{ left: U(513.55), top: U(276.69), fontSize: U(247.733), color: "#fe8fbc" }}>rinali</p>
          {/* B — oversized cap, slightly rotated */}
          <p style={{ left: U(201.96), top: U(444.92), fontSize: U(289.446), letterSpacing: U(-8.6834), color: "#9e8674", transform: "rotate(3.44deg)" }}>B</p>
          {/* hardwaj */}
          <p style={{ left: U(514.54), top: U(506.25), fontSize: U(204.373), color: "#b1a392" }}>hardwaj</p>
          <p style={{ left: U(516.07), top: U(505.74), fontSize: U(204.373), color: "#9e8674" }}>hardwaj</p>
        </div>

        {/* ---------- bottom-left role label ---------- */}
        <div className="h-role" style={{ left: U(73), top: U(928), fontSize: U(18.365) }}>
          ui/ux designer<br />
          design engineer
        </div>

        {/* ---------- watercolor swatch composite (bottom-left) ---------- */}
        <div className="h-asset" style={{ left: U(97), top: U(713), width: U(649.086), height: U(430.5), transform: "rotate(-4.29deg)" }}>
          <img src="/hero/swatch.png" alt="" style={{ objectFit: "cover" }} />
        </div>

        {/* ---------- second tape strip (bottom, faint) ---------- */}
        <div className="h-asset" style={{ left: U(472), top: U(829), width: U(248.26), height: U(195.316), opacity: 0.45, transform: "rotate(15.85deg)" }}>
          <img src="/hero/tape.png" alt="" style={{ objectFit: "cover" }} />
        </div>

        {/* ---------- registration crosshair lines ---------- */}
        <span className="h-line" style={{ left: U(299), top: U(885.5), width: U(99.246), height: "1px" }} />
        <span className="h-line" style={{ left: U(329), top: U(824), width: "1px", height: U(84) }} />
        <span className="h-line" style={{ left: U(361.5), top: U(866), width: "1px", height: U(79.489) }} />

        {/* ---------- ornamental flourishes (vector, overlaid) ---------- */}
        <div className="h-asset h-flourish" style={{ left: U(149), top: U(66), width: U(1617.13), height: U(1275.839) }}>
          <img src="/hero/flourish.png" alt="" />
        </div>

        {/* ---------- full-bleed paper grain overlay ---------- */}
        <div className="h-asset h-grain" style={{ left: U(-7.09), top: U(58.6), width: U(1930.585), height: U(1291.288), transform: "rotate(0.23deg)" }}>
          <img src="/hero/bg-texture.png" alt="" style={{ objectFit: "cover" }} />
        </div>
      </div>
    </section>
  );
}
