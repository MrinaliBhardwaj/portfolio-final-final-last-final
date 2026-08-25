// AN EMPTY FOLDER, WHICH IS NOT THE SAME THING AS A DEAD ONE.
//
// Two covers on this desk have no contents yet: the gingham horse, and the
// landscape holding the fourth case-study slot. They shipped once as pure
// artwork — `pointer-events: none`, unlabelled — sitting at the same size and
// shape as the live folders, in the same cluster, one of them 134px from a
// folder that opens a case study. Aiming at the wrong one produced nothing at
// all: no cursor, no hover, no window. That reads as a broken site, not as
// decoration.
//
// The fix is not a badge on the live ones. It is to make these two honest:
// Finder's own name for a folder with nothing in it, and Finder's own empty
// view when you open it. A visitor who clicks learns the desk works and that
// this drawer is empty — which is true — and the ones that aren't empty are
// exactly the ones with a real name underneath.
//
// It is deliberately the smallest window here. There is nothing in it.
import { useState } from "react";
import { motion, useDragControls } from "framer-motion";
import { Folder } from "lucide-react";

const CASCADE = 26;
const CASCADE_WRAP = 4;

export default function EmptyWindow({ index, z, onClose, onFocus }) {
  const [rolled, setRolled] = useState(false);
  const controls = useDragControls();
  const offset = (index % CASCADE_WRAP) * CASCADE;

  return (
    <motion.div
      className={`cw ew${rolled ? " is-rolled" : ""}`}
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
      aria-label="untitled folder — empty"
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
            aria-label="Close untitled folder"
          />
          <button
            type="button"
            className="cw-light cw-light--min"
            onClick={() => setRolled((r) => !r)}
            aria-label={rolled ? "Unroll untitled folder" : "Roll up untitled folder"}
          />
          {/* No zoom. There is nothing to make bigger, and a green light that
              did nothing would be the very thing this window exists to fix. */}
          <span className="cw-light cw-light--off" aria-hidden="true" />
        </div>

        <div className="cw-nav" />
        <span className="cw-title">untitled folder</span>
      </div>

      <div className="cw-body ew-body" hidden={rolled}>
        <Folder size={38} strokeWidth={1.2} aria-hidden="true" />
        <p className="ew-line">Folder is empty</p>
        <p className="ew-note">
          Still being written. The folders with names on them are the ones with
          work inside.
        </p>
      </div>
    </motion.div>
  );
}
