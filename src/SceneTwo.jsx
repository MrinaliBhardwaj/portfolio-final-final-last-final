// PAGE TWO of the scrapbook — the tech origin story.
//
// RECOVERED, not rewritten — see the note in Scene.jsx. Reconstructed from the
// transcripts' Write + Edit chain and verified against the full-file Read
// snapshot of 1 July 2026. The centrepiece art it points at,
// public/tech-discovery.webp, survived the rebuild on disk.
//
// Four deliberate edits since restoration, all by request: `onOpen` was rewired
// off the retired ArchivePanel drawer to #/tech; then the PROFILE.DOC tab and
// "pull for profile" note were REMOVED (27 July 2026), taking the `onOpen` prop
// with them; then the page was re-composed from a fixed plate into three
// columns; and then, on 3 August 2026, STRIPPED BACK TO THIS.
//
// ---- WHAT THIS PAGE IS NOW ----
// Every pencil mark is gone: `const idea = reality`, `makeItReal()`, the notes
// list, the reminder card, the tech-stack card, the terminal lines, the ship
// note, and the RoughBox / Underline components that drew their frames. All of
// it is in git from commit 7639232 back if it is ever wanted again.
//
// What is left is the drawing and two runs of narrative — which is exactly page
// one's cast: opening copy, artwork, closing line. So page two takes page one's
// geometry too:
//
//     [copy 1, top-left]
//                        [ the drawing, filling the height ]
//                                            [copy 2, bottom-right]
//
// THE LINE BREAKS ARE HERS and are not decorative — they are where the sentence
// breathes. Nothing re-wraps them: each block is `nowrap`, pinned to an edge,
// and sized by its own longest line, so there is no measure for the browser to
// break against. Changing a word means re-checking that the block still clears
// the drawing (notes-world.css derives --t2-plate-x from the widest line).
//
// The typography is page one's, measured out of origin.webp's pixels rather
// than matched by eye — the derivation is in notes-world.css, since that is
// where the numbers live.
export default function SceneTwo() {
  return (
    <section className="sheet sheet-two">
      <div className="nw-stage">
        <div className="scene-two">

          <div className="t2-copy t2-copy--open">
            <p className="t-copy">
              For the other half,<br />
              the little one knew visuals alone<br />
              weren&rsquo;t gonna cut it.
            </p>
            <p className="t-copy">
              What do ideas even mean<br />
              if you can&rsquo;t build them.
            </p>
          </div>

          {/* The plate is the drawing's INK box, not the file's box — the image
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

          <div className="t2-copy t2-copy--close">
            <p className="t-copy">
              But somewhere<br />
              between the bugs and the late nights,<br />
              all ideas started feeling real.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
