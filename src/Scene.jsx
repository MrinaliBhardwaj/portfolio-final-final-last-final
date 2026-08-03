// PAGE ONE of the scrapbook — the origin story, as one finished piece of art.
//
// This is HER composition, placed exactly as exported (27 July 2026, by
// request). A dashed line wanders in from the left, arrives at a childhood
// school photo, tangles through a knot of loops, resolves at a recent portrait
// and leaves as a clean arrow — the whole "meet mini mri" arc told in one line,
// with the two real photographs the earlier draft only had empty polaroid slots
// for, and the narrative copy set around them.
//
// It supersedes the hand-built version of this page (recovered from session
// transcripts in July 2026: SVG line art, `[image 1]`/`[image 2]` slots, pencil
// milestone labels, the copy as live text). That art is NOT lost — it is in git
// history from commit 5336277 onward, and DECISIONS.md records what it was.
//
// Placed as a single image on purpose: she asked for the exact visuals, and
// re-drawing a composition that is already final would only invite drift.
//
// The copy is BAKED INTO the image, so it can't be selected, searched or
// translated, and it doesn't reflow. The alt below therefore carries the full
// text verbatim — that is the only route a screen reader or a crawler has to
// it. If she ever re-exports this frame with different words, update the alt
// to match or the two silently drift apart.
// THE FOUR PINK DOTS on the scribbled line are painted INTO the artwork, so
// they are pixels, not elements — there was nothing there to hover. These are
// invisible hotspots laid over them.
//
// Coordinates are measured, not guessed: the dots were located by scanning
// origin.webp for its pink (r>195, g 80–190, b 130–215) and taking each
// cluster's centroid, then expressed as percentages of the 1673×714 frame.
// Percentages because the image is `width: 100%` on desktop and height-driven
// while panning on mobile — a percentage tracks the artwork through both, where
// a pixel offset would drift the moment the sheet resized.
//
// The dots themselves are only 6–10px in a 1673px-wide frame — about 5px on
// screen — so each hotspot is deliberately several times the dot it covers.
// Hovering a 5px target is not something anyone should have to do.
//
// Ordered left to right, which is the way the line reads: it leaves the
// childhood photograph, tangles through the knot and resolves at the portrait,
// so left is younger. The FOURTH dot (60.394%, 24.904%) is intentionally not
// here — it is the one nearest the grown portrait, and her copy for it doesn't
// exist yet. Add it to this array and it works; nothing else needs touching.
// `place` is not decoration. Dot two sits BELOW dot three and only ~42px from
// it on a 1200px sheet, so if every note opened upward, dot two's would land on
// top of dot three's dot. Dot two opens downward into the empty cream instead —
// there is nothing there until the closing paragraph.
const MILESTONES = [
  { left: 40.538, top: 36.449, age: "age 13", note: "1M on TikTok", place: "above" },
  { left: 48.928, top: 40.946, age: "age 17", note: "500k on Pinterest", place: "below" },
  { left: 51.737, top: 32.835, age: "age 21", note: "18k on Instagram", place: "above" },
];

export default function Scene() {
  return (
    <section className="sheet sheet-one">
      <div className="nw-stage">
        {/* The frame is the WHOLE 1673x714 export; the stage above it is the
            crop window, and the top 55 rows of blank cream are pulled up out of
            it (see .nw-origin-frame). The milestones live in here rather than on
            the stage on purpose: their percentages were measured against the
            full frame by pixel scan, and inside this element they stay true
            without being rewritten. */}
        <div className="nw-origin-frame">
          <img
            className="nw-origin"
            src="/notes/origin.webp"
            alt={
              "meet mini mri. tiny, curious and an eye for art. If something " +
              "looked cool, she noticed. By the time she was 12, the signs had " +
              "aligned. — A childhood school photograph of Mrinali is joined by " +
              "a looping hand-drawn line to a recent portrait of her, the line " +
              "tangling into a dense scribble in between before straightening " +
              "out and leaving as a single confident arrow. — After mastering " +
              "the art of growing an audience with just a little flair, she " +
              "probably thought she'd cracked it. That's when it clicked, maybe " +
              "this was half the game."
            }
            width="1673"
            height="714"
            draggable="false"
          />

          {/* A <button> rather than a bare div with a title: hover alone would
              leave this on a mouse only. As a button each one is tabbable, so the
              milestones are reachable by keyboard, and a tap works on a phone,
              where there is no hover at all.

              The label is spelled out rather than left to the markup. Read from
              the DOM, "age 13" followed by "1M on TikTok" concatenates to
              "age 131M on TikTok" — the space you see is a flex `gap`, which is
              layout and not text, so a screen reader would say "age one hundred
              thirty-one M". The visible halves stay aria-hidden and this carries
              the meaning. */}
          {MILESTONES.map((m) => (
            <button
              key={m.age}
              type="button"
              className={`nw-milestone nw-milestone--${m.place}`}
              style={{ left: `${m.left}%`, top: `${m.top}%` }}
              aria-label={`${m.age} — ${m.note}`}
            >
              <span className="nw-milestone-note" aria-hidden="true">
                <span className="nw-milestone-age">{m.age}</span>
                {m.note}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
