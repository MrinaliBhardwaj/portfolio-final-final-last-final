// ABOUT ME, AS A WINDOW ON THE DESKTOP.
//
// The scrapbook used to be a dock icon that took over the screen. It is a
// FOLDER on the desk now — the girl's-face cover, the one piece of art here
// that depicts a person — and it opens the way every other folder does. The
// dock icon is gone; a thing you can open from the desktop does not also need
// a permanent slot in the dock.
//
// THE WIDTH IS THE WHOLE PROBLEM, and it was chosen with the tradeoff on the
// table. Page one is a single exported image with its copy BAKED INTO THE
// PIXELS, and notes-world.css caps the sheet at 1673px — page one's native
// width — precisely so that copy never scales. A case-study window is 880px.
// Putting the scrapbook in one would render her handwriting at 53%.
//
// So this window is as wide as the viewport allows, not as wide as its
// siblings: min(1673px, 100vw - 40px). At 1512 that is ~88% of native, which
// is legible; below about 1200 it is not really, and that is what the GREEN
// LIGHT is for. Zoom goes to #/notes — the full-screen world, still there,
// still at native scale — which is exactly what a macOS zoom button means and
// gives the copy a guaranteed home. Red closes, yellow rolls up, green leaves.
// Three lights, three real behaviours, same rule as everywhere else.
//
// THE CONTENT IS NOT COPIED. Scene / SceneTwo / SceneThree are the same
// components the world renders, inside the same `.nw` class they are styled
// against — this file supplies a window instead of a page, and nothing else.
import { useEffect, useRef, useState } from "react";
import { motion, useDragControls } from "framer-motion";
import { Maximize2 } from "lucide-react";
import Scene from "./Scene.jsx";
import SceneTwo from "./SceneTwo.jsx";
import SceneThree from "./SceneThree.jsx";

const CASCADE = 26;
const CASCADE_WRAP = 4;

export default function NoteWindow({ index, z, onClose, onFocus }) {
  const [rolled, setRolled] = useState(false);
  const controls = useDragControls();
  const bodyRef = useRef(null);

  // WHAT `100dvh` MEANT, INSIDE A WINDOW. Both sheets size themselves against
  // the viewport — `.nw .sheet` reserves a screen of height, and page two
  // solves its whole layout from `--t2-h`, which is `min(714px, 100dvh - room)`.
  // In a window neither is the viewport any more, so notes-world.css reads
  // `var(--nw-vh, 100dvh)` and this measures the body and publishes the answer.
  // The fallback is the world's own value, so the full-screen route is
  // untouched by any of this.
  useEffect(() => {
    const el = bodyRef.current;
    if (!el) return;
    const sync = () => {
      const h = el.clientHeight;
      if (h) el.style.setProperty("--nw-vh", `${h}px`);
    };
    sync();
    const ro = new ResizeObserver(sync);
    ro.observe(el);
    return () => ro.disconnect();
  }, [rolled]);

  const offset = (index % CASCADE_WRAP) * CASCADE;

  return (
    <motion.div
      className={`cw nw-win${rolled ? " is-rolled" : ""}`}
      style={{ zIndex: z }}
      initial={{ opacity: 0, scale: 0.96, x: offset, y: offset }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.14 } }}
      transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
      drag
      dragListener={false}
      dragControls={controls}
      dragMomentum={false}
      dragElastic={0}
      onPointerDownCapture={onFocus}
      role="dialog"
      aria-label="About Me — the scrapbook"
    >
      <div
        className="cw-bar"
        onPointerDown={(e) => controls.start(e)}
        onDoubleClick={() => setRolled((r) => !r)}
      >
        <div className="cw-lights">
          <button
            type="button"
            className="cw-light cw-light--close"
            onClick={onClose}
            aria-label="Close About Me"
          />
          <button
            type="button"
            className="cw-light cw-light--min"
            onClick={() => setRolled((r) => !r)}
            aria-label={rolled ? "Unroll About Me" : "Roll up About Me"}
          />
          {/* Zoom LEAVES, and says so. The scrapbook's copy is baked into its
              pixels at 1673px wide; the only place it is guaranteed readable is
              the full-screen world, so that is where the green light goes. */}
          <a
            className="cw-light cw-light--max"
            href="#/notes"
            aria-label="Open the scrapbook full screen"
          />
        </div>

        <div className="cw-nav">
          <a href="#/notes" className="nw-win-zoom" aria-label="Open full screen">
            <Maximize2 size={13} strokeWidth={2} aria-hidden="true" />
            <span>Full screen</span>
          </a>
        </div>

        <span className="cw-title">About Me&nbsp;: the scrapbook</span>
      </div>

      <div className="cw-body nw-win-body" hidden={rolled} ref={bodyRef}>
        {/* `.nw` is what all 536 lines of notes-world.css are scoped to, so the
            sheets style themselves here exactly as they do in the world. */}
        <div className="nw nw-in-window">
          <Scene />
          <SceneTwo />
          <SceneThree />
        </div>
      </div>
    </motion.div>
  );
}
