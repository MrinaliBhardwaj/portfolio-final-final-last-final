// PAGE ONE of the scrapbook — the origin story, as one finished piece of art.
//
// This is HER composition, placed exactly as exported (27 July 2026, by
// request: "i want this exactly for the first part"). The dashed line enters
// from the left, arrives at a childhood school photo, tangles through a
// knot of loops, resolves at a recent portrait, and leaves as a clean arrow —
// the whole "meet mini mri" arc told in one line, with the two real photos
// that the earlier draft only had empty polaroid slots for.
//
// It supersedes the hand-built version of this page (recovered from session
// transcripts in July 2026: SVG line art, two `[image 1]`/`[image 2]` slots,
// pencil milestone labels, and the narrative copy). That art is NOT lost —
// it is in git history from commit 5336277 onward, and DECISIONS.md records
// what it was. This is the same story, finished.
//
// It is placed as a single image on purpose. She asked for the exact visuals,
// and re-drawing a composition that is already final would only invite drift.
// The image carries no text of its own — see the note in notes-world.css about
// the page's background, and DECISIONS.md about the missing narrative copy.
export default function Scene() {
  return (
    <section className="sheet sheet-one">
      <div className="nw-stage">
        <img
          className="nw-origin"
          src="/notes/origin.webp"
          alt="A hand-drawn timeline: a dashed line wanders in from the left and reaches a childhood school photograph of Mrinali, then loops into a dense scribbled knot before straightening out at a recent portrait of her and leaving as a single confident arrow."
          width="1673"
          height="940"
          draggable="false"
        />
      </div>
    </section>
  );
}
