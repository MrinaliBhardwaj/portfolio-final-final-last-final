// PAGE THREE of the scrapbook — the poster collage: who she is now.
//
// Replicated from Figma (file drda7TnqoM3fEpbibCDIc2), by request. Unlike pages
// one and two this is NOT a recovered artifact — it is a live design, and every
// coordinate below is read off the frame rather than invented. `U(n)` is one
// frame unit, so a number here is the number in the file.
//
// NOW TRACKING node 296:533 ("Desktop - 17"), the resized pass. It supersedes
// 272:515 ("Desktop - 16"), which is what the first implementation was built
// from. The frame went 1449x2545 -> 1449x2200 and essentially every component
// was scaled down with it, so nothing below is a tweak of the old numbers —
// they were all re-read. Two changes are worth naming because they are
// decisions rather than resizes:
//
//   · THE GROUND IS CREAM NOW. #1e1516 -> #f8f7f4, which is exactly the Notes
//     world's own --paper. The first pass was a dark poster dropped into the
//     portfolio's one deliberately LIGHT world; this one agrees with it, and
//     the poster's margins on a wide screen now blend into the page instead of
//     cutting a dark band out of it.
//   · The yellow went #ffe991 -> #ffdc51, and the role bar went white ->
//     #1e1516 to sit on the new ground.
//
// ---- THREE WINDOWS, ONE POSTER ----
// The frame is about three screens tall and its sections do not separate: the
// ENGINEER banner crosses the first seam and the pink block overhangs the
// yellow band. So this renders ONE poster and shows it through three
// viewport-sized windows. Anything crossing a seam continues across it, exactly
// as drawn — which is only true because each panel is a window rather than its
// own composition.
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
// The front M's fill does not come out of Figma (see .cl-m--front in
// collage.css). Everything else is measured.
const U = (n) => `calc(${n} * var(--cu))`;

// The frame's own centre line, so `calc(50% ± n)` coordinates from the design
// can be written as plain numbers here: 1449 / 2 = 724.5.
const CX = 724.5;

// The frame's height. Confirmed two ways: the yellow band is 837 tall at
// y=1313, and the poem's copy is placed at `calc(50% + 686)`, which puts it 26
// units inside its card at 1735 only if 50% = 1075.
const FRAME_H = 2150;

// EQUAL THIRDS, and that is the whole reason the resize was worth doing.
// The original frame split into 854/854/837 — a 1.70 aspect, which cannot be
// full-bleed AND one viewport (the viewport wants 1.87 or wider on a 16:9
// laptop). 2150/3 = 716.67 gives 1449/716.67 = 2.022 for all three panels: past
// the threshold, uniform, so all three sheets are the same size and every one
// of them fits. Seams land at 716.67 and 1433.33; both fall inside a field
// rather than on an edge, which the windowing makes a non-issue.
const BANDS = ["one", "two", "three"].map((key, i) => ({
  key,
  top: (i * FRAME_H) / 3,
  height: FRAME_H / 3,
}));

// Twelve lotus tiles, three staggered rows of four, each 555 units rotated
// 9.44deg inside a 638.473 box. Straight from the design — the rows step left
// by 149 and 166 rather than a constant, so this is a list, not a loop over a
// formula that would quietly regularise it. Unchanged in the resize.
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

      {/* The big lotus behind the M — the frame's backmost layer. Its own
          export (lotus-big.png), not the band's tile: Figma ships two different
          files for the same flower here and the large one is the higher
          resolution of the two, which it needs at 1080 units.

          The design has a SECOND node at the same size and rotation, 8 units
          away (280:8390), which contains no image at all — an empty duplicate.
          It paints nothing, so it is not reproduced. */}
      <div
        className="cl-rot"
        style={{ left: U(409), top: U(-226), width: U(1343.92), height: U(1343.92) }}
      >
        <img
          src="/collage/lotus-big.png"
          alt=""
          loading={load}
          decoding="async"
          style={{ width: U(1079.829), height: U(1079.829), transform: "rotate(-16.65deg)", objectFit: "cover" }}
        />
      </div>

      <img
        className="cl-abs"
        src="/collage/photo-top.png"
        alt="Mrinali, lit against a dark ground"
        loading={load}
        decoding="async"
        style={{ left: U(-46), top: U(-64.25), width: U(634.6), height: U(793.25) }}
      />

      {/* ============ the pink section ("Desktop - 15") ============ */}
      <div
        className="cl-rot"
        style={{ left: U(CX + 1.97 - 742.224), top: U(659.78), width: U(1484.448), height: U(749.858) }}
      >
        <div
          className="cl-pink"
          style={{ width: U(1464.499), height: U(707.588), transform: "rotate(-1.67deg)" }}
        >
          <img
            className="cl-abs cl-cover"
            src="/collage/photo-pink.jpg"
            alt=""
            loading={load}
            decoding="async"
            style={{ left: U(541.6), top: U(-120.43), width: U(1161.183), height: U(870.887) }}
          />
          <div
            className="cl-clip"
            style={{ left: U(-165.18), top: U(-73.95), width: U(853.421), height: U(870.887) }}
          >
            <img src="/collage/photo-pink.jpg" alt="" loading={load} decoding="async" />
          </div>

          {/* A pink rectangle with the words CUT OUT of it — one path, so the
              photograph behind is what you read the letters in. That is why it
              sits above both photos and why the alt carries the words: they
              exist nowhere else. Redrawn in the resize (it was 809.6x1060.1). */}
          <img
            className="cl-abs"
            src="/collage/subtract.svg"
            alt="trust the process — and the artist"
            loading={load}
            decoding="async"
            style={{ left: U(0), top: U(0), width: U(841.855), height: U(793.979) }}
          />

          {/* Two stars. The small one is a NEW node in this pass (Vector 21);
              the large one kept its name and was rescaled. */}
          <img
            className="cl-abs"
            src="/collage/vector21.svg"
            alt=""
            loading={load}
            decoding="async"
            style={{ left: U(965.45), top: U(282.53), width: U(161.673), height: U(137.028) }}
          />
          <img
            className="cl-abs"
            src="/collage/vector18.svg"
            alt=""
            loading={load}
            decoding="async"
            style={{ left: U(1045.96), top: U(358.39), width: U(262.719), height: U(255.756) }}
          />

          <div
            className="cl-rot"
            style={{ left: U(-194.8), top: U(157.53), width: U(683.266), height: U(683.266) }}
          >
            <img
              src="/collage/star-photo-1.png"
              alt=""
              loading={load}
              decoding="async"
              style={{ width: U(551.229), height: U(551.229), transform: "rotate(16.22deg)", objectFit: "cover" }}
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
        style={{ left: U(CX - 333.15), top: U(86.99), width: U(784.264), height: U(680.595) }}
      >
        <p className="cl-m cl-m--back" style={{ transform: "rotate(-15.09deg)" }} aria-hidden="true">M</p>
      </div>
      <div
        className="cl-rot"
        style={{ left: U(CX - 327.39), top: U(83.18), width: U(784.264), height: U(680.595) }}
      >
        <p className="cl-m cl-m--mid" style={{ transform: "rotate(-15.09deg)" }} aria-hidden="true">M</p>
      </div>
      <div
        className="cl-rot"
        style={{ left: U(CX - 316.09), top: U(79), width: U(784.264), height: U(680.595) }}
      >
        <p className="cl-m cl-m--front" style={{ transform: "rotate(-15.09deg)" }}>M</p>
      </div>

      {/* ============ the ICON card ============
          The wrapper IS the card now — in the old frame it was a 1304x1569 clip
          box with the card floating inside it, which was doing nothing the card
          could not do itself. */}
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

      {/* ============ ENGINEER ============ */}
      <div
        className="cl-rot"
        style={{ left: U(567.2), top: U(525.73), width: U(886.789), height: U(228.398) }}
      >
        <div
          className="cl-banner"
          style={{ width: U(876.901), height: U(158.823), transform: "rotate(-4.58deg)" }}
        />
      </div>
      <div
        className="cl-rot"
        style={{ left: U(727.47), top: U(547.91), width: U(580.251), height: U(184.002) }}
      >
        <p className="cl-word" style={{ transform: "rotate(-4.56deg)" }}>ENGINEER</p>
      </div>

      {/* ============ DESIGN ============
          Its banner is drawn after ENGINEER's and overlaps it, which is the
          design's own stacking — keep this order. */}
      <div
        className="cl-rot"
        style={{ left: U(-293), top: U(444), width: U(989.166), height: U(239.163) }}
      >
        <div
          className="cl-banner"
          style={{ width: U(979.396), height: U(158.823), transform: "rotate(4.74deg)" }}
        />
      </div>

      {/* ============ the two stamped labels ============ */}
      <div
        className="cl-label"
        style={{ left: U(1110.44), top: U(388.55), width: U(241.782), height: U(38.84) }}
      />
      <p className="cl-labeltext" style={{ left: U(1124.03), top: U(397.29), fontSize: U(17.867) }}>
        WHICH BRINGS US HERE
      </p>
      <div
        className="cl-label"
        style={{ left: U(1191.03), top: U(438.83), width: U(161.188), height: U(33.985) }}
      />
      <p className="cl-labeltext" style={{ left: U(1204.62), top: U(446.6), fontSize: U(15.571) }}>
        PORTFOLIO 2026
      </p>

      {/* The word's own tilt went 4.66 -> 5.92deg in the resize; its banner
          stayed at 4.74, so DESIGN now sits very slightly across its bar. That
          is the design, not a rounding slip. */}
      <div
        className="cl-rot"
        style={{ left: U(108.59), top: U(482.84), width: U(442.049), height: U(182.633) }}
      >
        <p className="cl-word" style={{ transform: "rotate(5.92deg)" }}>DESIGN</p>
      </div>

      {/* ============ the lotus name card ============
          The Devanagari मृणाली that used to open this line is gone from the
          card — it became the repeated texture in the name panel below, so it
          reads there instead of twice. The full stop after "lotus" is new. */}
      <div className="cl-poem" />
      <div className="cl-poemtext">
        <p>
          [mṛṇālī] one who belongs to the lotus.
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

      {/* ============ the name panel ============
          Replaces the flat #1e1516 rectangle that stood here. It is a
          photograph with her name set over it thirty times in Devanagari,
          white, on `mix-blend-mode: overlay` — so the type takes its contrast
          from the image underneath rather than sitting on it.

          The word is aria-hidden and the panel carries a label instead: read
          out, thirty repetitions of the same name is noise, and the one thing a
          screen reader should get is what the panel IS. */}
      <div className="cl-namepanel" role="img" aria-label="मृणाली — Mrinali, set over and over">
        <img src="/collage/image68.png" alt="" loading="lazy" decoding="async" />
        <p className="cl-nametext" aria-hidden="true">{"मृणाली ".repeat(30)}</p>
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
