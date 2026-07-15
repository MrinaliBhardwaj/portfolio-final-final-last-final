// The name tag riding the design world's cursor: "Mrinali", the way a Figma
// multiplayer cursor carries its owner's label.
//
// Only the LABEL lives here. The arrow itself stays a real CSS cursor (an SVG
// data URI in design-world.css) because the OS draws that one — it can never
// lag the pointer, and it survives with JS off. A DOM arrow would trail the
// real pointer by a frame and feel broken. So: OS draws the arrow, we draw the
// tag, and the tag is ALLOWED to trail — in Figma it does exactly that, the
// label easing along behind its cursor rather than welded to it.
//
// Rendered by App next to the Dock rather than inside DesignWorld: the cursor
// is scoped to the whole design world (dock included), so its tag has to clear
// the dock too, and DesignWorld sits inside an AnimatePresence wrapper whose
// opacity/will-change would trap the tag in a stacking context below it.
import { useEffect, useRef } from "react";

export default function DesignCursor() {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // reduced motion gets the tag pinned to the pointer, no easing
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const K = reduced ? 1 : 0.18;

    let x = 0;
    let y = 0;
    let tx = 0;
    let ty = 0;
    let raf = 0;
    let placed = false;

    // The loop SLEEPS once the tag has caught up, instead of burning a rAF
    // forever behind an idle pointer — this runs on every design-world visit.
    const tick = () => {
      const dx = x - tx;
      const dy = y - ty;
      if (Math.abs(dx) < 0.05 && Math.abs(dy) < 0.05) {
        tx = x;
        ty = y;
        el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
        raf = 0;
        return;
      }
      tx += dx * K;
      ty += dy * K;
      el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      raf = requestAnimationFrame(tick);
    };

    const wake = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };

    const onMove = (e) => {
      // touch and pen fire pointermove too, but they leave no cursor to label
      if (e.pointerType !== "mouse") return;
      x = e.clientX;
      y = e.clientY;
      if (!placed) {
        // first sighting: drop the tag AT the pointer, don't fly it in from 0,0
        placed = true;
        tx = x;
        ty = y;
        el.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
        el.classList.add("is-live");
      }
      wake();
    };

    // leaving the window drops the tag; you're not in the file any more
    const onOut = (e) => {
      if (e.relatedTarget === null) el.classList.remove("is-live");
    };
    const onOver = () => {
      if (placed) el.classList.add("is-live");
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("pointerout", onOut, { passive: true });
    window.addEventListener("pointerover", onOver, { passive: true });

    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerout", onOut);
      window.removeEventListener("pointerover", onOver);
    };
  }, []);

  return (
    <div ref={ref} className="dw-tag" aria-hidden="true">
      Mrinali
    </div>
  );
}
