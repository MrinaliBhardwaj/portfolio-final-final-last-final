// PAGE THREE of the scrapbook — the poster collage: who she is now.
//
// Replicated from Figma (file drda7TnqoM3fEpbibCDIc2, node 272:515,
// "Desktop - 16"), by request, on 3 August 2026. Unlike pages one and two this
// is NOT a recovered artifact — it is a live design, and every coordinate below
// is read off that frame rather than invented. The frame is 1449 x 2545 and
// `U(n)` is one of its units, so a number here is the number in the file.
//
// ---- THREE WINDOWS, ONE POSTER ----
// The frame is about three screens tall and its sections do not separate: the
// ENGINEER banner crosses the first seam, and the pink block overhangs the
// yellow band by 79 units. So this renders ONE poster and shows it through
// three viewport-sized windows. Anything crossing a seam continues across it,
// exactly as drawn — which is only true because each panel is a window rather
// than its own composition.
//
// The poster is rendered three times, once per panel, and each window clips it.
// That is deliberate: it costs about 60 extra DOM nodes per panel and buys
// exact continuity, and the four bitmaps are the same four files in all three,
// so the browser decodes each once no matter how many tags reference it.
//
// Panel one carries the eager images; everything below the fold is lazy — this
// page is four bitmaps and one of them is tiled twelve times.
//
// ---- ONE THING IS NOT EXACT, AND IT IS FLAGGED ----
// The front M's fill did not come out of Figma (see .cl-m--front in
// collage.css). Everything else is measured.
const U = (n) => `calc(${n} * var(--cu))`;

// The frame's own centre line, so `calc(50% ± n)` coordinates from the design
// can be written as plain numbers here: 1449 / 2 = 724.5.
const CX = 724.5;

// Seams at 854 and 1708. 1708 is the yellow band's own top edge, so the second
// seam lands on a real boundary rather than through one; that leaves the first
// two panels identical and the third within 17 units of them. The poster is
// scaled so the tallest of these fits the room (collage.css).
const BANDS = [
  { key: "one", top: 0, height: 854 },
  { key: "two", top: 854, height: 854 },
  { key: "three", top: 1708, height: 837 },
];

// Twelve lotus tiles, three staggered rows of four, each 555 units rotated
// 9.44deg inside a 638.473 box. Straight from the design — the rows step left
// by 149 and 166 rather than a constant, so this is a list, not a loop over a
// formula that would quietly regularise it.
const LOTUS = [
  [-89, -233], [375, -233], [839, -233], [1297, -233],
  [-238, 67], [226, 67], [690, 67], [1153, 67],
  [-404, 386], [56, 386], [520, 386], [984, 386],
];

// Kept verbatim, including the two runs the design breaks mid-word ("ICICON",
// and the trailing "ON ICON"). The repeated word is the artwork — it is a type
// texture on the pink card, not placeholder copy waiting to be replaced.
const ICON_TEXTURE =
  "ICON ".repeat(40) +
  "ICICON " +
  "ICON ".repeat(38) +
  "ON ICON ";

const ROLES = [
  ["DESIGNER", 762],
  ["SOFTWARE DEVELOPER", 888],
  ["INFLUENCER", 1125],
  ["FREELANCER", 1273],
];

function Poster({ eager }) {
  const load = eager ? undefined : "lazy";
  return (
    <>
      <div className="cl-ground" />

      <img
        className="cl-abs"
        src="/collage/photo-top.png"
        alt="Mrinali, lit against a dark ground"
        loading={load}
        decoding="async"
        style={{ left: U(0), top: U(0), width: U(699.2), height: U(874) }}
      />

      {/* ============ the pink section ("Desktop - 15") ============ */}
      <div
        className="cl-rot"
        style={{ left: U(-34.5), top: U(799.56), width: U(1517.623), height: U(987.704) }}
      >
        <div
          className="cl-pink"
          style={{ width: U(1490.791), height: U(944.769), transform: "rotate(-1.67deg)" }}
        >
          <img
            className="cl-abs cl-cover"
            src="/collage/photo-pink.jpg"
            alt=""
            loading={load}
            decoding="async"
            style={{ left: U(309.55), top: U(-86), width: U(1550.408), height: U(1162.806) }}
          />
          <div
            className="cl-clip"
            style={{ left: U(-348.6), top: U(-105.13), width: U(1139.486), height: U(1162.806) }}
          >
            <img src="/collage/photo-pink.jpg" alt="" loading={load} decoding="async" />
          </div>

          {/* A pink rectangle with the words CUT OUT of it — one path, so the
              photograph behind is what you read the letters in. That is why it
              sits above both photos and why the alt carries the words: they
              exist nowhere else. */}
          <img
            className="cl-abs"
            src="/collage/subtract.svg"
            alt="trust the process — and the artist"
            loading={load}
            decoding="async"
            style={{ left: U(0), top: U(0), width: U(809.582), height: U(1060.118) }}
          />

          <img
            className="cl-abs"
            src="/collage/vector18.svg"
            alt=""
            loading={load}
            decoding="async"
            style={{ left: U(1092.26), top: U(469.68), width: U(350.782), height: U(341.484) }}
          />
          <img
            className="cl-abs"
            src="/collage/vector19.svg"
            alt=""
            loading={load}
            decoding="async"
            style={{ left: U(939.9), top: U(400.4), width: U(215.866), height: U(182.96) }}
          />

          <div
            className="cl-rot"
            style={{ left: U(-273.31), top: U(263.25), width: U(912.296), height: U(912.296) }}
          >
            <img
              src="/collage/star-photo-1.png"
              alt=""
              loading={load}
              decoding="async"
              style={{ width: U(736), height: U(736), transform: "rotate(16.22deg)", objectFit: "cover" }}
            />
          </div>
        </div>
      </div>

      {/* ============ the lotus band ============ */}
      <div className="cl-band3">
        {LOTUS.map(([x, y]) => (
          <div
            key={`${x},${y}`}
            className="cl-rot"
            style={{ left: U(x), top: U(y), width: U(638.473), height: U(638.473) }}
          >
            <img
              src="/collage/lotus-tile.png"
              alt=""
              loading="lazy"
              decoding="async"
              style={{ width: U(555), height: U(555), transform: "rotate(9.44deg)", objectFit: "cover" }}
            />
          </div>
        ))}
      </div>

      {/* ============ the M ============
          Three layers, offset a few units from each other and all rotated
          -15.09deg: black behind, gold, gold in front. The offsets are what
          give it its edge. */}
      <div
        className="cl-rot"
        style={{ left: U(CX - 389.07), top: U(165.76), width: U(859.073), height: U(745.53) }}
      >
        <p className="cl-m cl-m--back" style={{ transform: "rotate(-15.09deg)" }} aria-hidden="true">M</p>
      </div>
      <div
        className="cl-rot"
        style={{ left: U(CX - 382.76), top: U(161.58), width: U(859.073), height: U(745.53) }}
      >
        <p className="cl-m cl-m--mid" style={{ transform: "rotate(-15.09deg)" }} aria-hidden="true">M</p>
      </div>
      <div
        className="cl-rot"
        style={{ left: U(CX - 370.37), top: U(157), width: U(859.073), height: U(745.53) }}
      >
        <p className="cl-m cl-m--front" style={{ transform: "rotate(-15.09deg)" }}>M</p>
      </div>

      {/* ============ the ICON card ============ */}
      <div className="cl-iconwrap">
        <div className="cl-iconcard" />
        <p className="cl-icontext">{ICON_TEXTURE}</p>
      </div>

      {/* ============ the role bar ============ */}
      {ROLES.map(([word, x]) => (
        <p key={word} className="cl-role" style={{ left: U(x) }}>
          {word}
        </p>
      ))}

      <div className="cl-darkblock" />

      {/* ============ ENGINEER ============ */}
      <div
        className="cl-rot"
        style={{ left: U(503.54), top: U(640.46), width: U(1052.127), height: U(270.982) }}
      >
        <div
          className="cl-banner"
          style={{ width: U(1040.395), height: U(188.434), transform: "rotate(-4.58deg)" }}
        />
      </div>
      <div
        className="cl-rot"
        style={{ left: U(662.83), top: U(666.74), width: U(688.901), height: U(217.438) }}
      >
        <p className="cl-word" style={{ transform: "rotate(-4.56deg)" }}>ENGINEER</p>
      </div>

      {/* ============ DESIGN ============
          Its banner is drawn after ENGINEER's and overlaps it, which is the
          design's own stacking — keep this order. */}
      <div
        className="cl-rot"
        style={{ left: U(-511), top: U(534), width: U(1173.593), height: U(283.754) }}
      >
        <div
          className="cl-banner"
          style={{ width: U(1162), height: U(188.434), transform: "rotate(4.74deg)" }}
        />
      </div>

      {/* ============ the two stamped labels ============ */}
      <div
        className="cl-label"
        style={{ left: U(1124), top: U(496.16), width: U(265), height: U(42.57) }}
      />
      <p className="cl-labeltext" style={{ left: U(1138.9), top: U(505.74), fontSize: U(19.582) }}>
        WHICH BRINGS US HERE
      </p>
      <div
        className="cl-label"
        style={{ left: U(1212.33), top: U(551.27), width: U(176.667), height: U(37.249) }}
      />
      <p className="cl-labeltext" style={{ left: U(1227.23), top: U(559.78), fontSize: U(17.066) }}>
        PORTFOLIO 2026
      </p>

      <div
        className="cl-rot"
        style={{ left: U(55.79), top: U(596.21), width: U(521.634), height: U(204.874) }}
      >
        <p className="cl-word" style={{ transform: "rotate(4.66deg)" }}>DESIGN</p>
      </div>

      {/* ============ the lotus name card ============ */}
      <div className="cl-poem" />
      <div className="cl-poemtext">
        <p>
          <span className="cl-deva">मृणाली</span> [mṛṇālī] one who belongs to the lotus
          <br />
          The Lotus is born in water,{" "}
        </p>
        <p>
          yet untouched by it.
          <br />
          It rises from mud, yet carries no stain.
          <br />
          Its roots drink from darkness, but its face only knows light.{" "}
          <br />
          Is that what grace looks like?{" "}
          <br />
          To know darkness intimately, and simply refusing to carry it into your heart.
        </p>
      </div>
    </>
  );
}

export default function SceneThree() {
  return BANDS.map((b, i) => (
    <section key={b.key} className={`sheet sheet-collage sheet-collage--${b.key}`}>
      <div className="cl-window" style={{ "--cl-ar": 1449 / b.height }}>
        <div className="cl-poster" style={{ top: U(-b.top) }}>
          <Poster eager={i === 0} />
        </div>
      </div>
    </section>
  ));
}
