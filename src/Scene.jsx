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
export default function Scene() {
  return (
    <section className="sheet sheet-one">
      <div className="nw-stage">
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
      </div>
    </section>
  );
}
