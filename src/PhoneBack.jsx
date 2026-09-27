// THE WAY HOME, ON A PHONE.
//
// Every world and every window already had one — the "mb" monogram in the
// corner, or the red traffic light. Measured on a phone they are 22x20 and
// 12x12: a Mac's affordances, at a Mac's size, asking for a mouse. Nobody
// reads a 12px dot as "go back", and nothing else on those screens said the
// home screen was still there.
//
// So on a phone those two become this: one labelled control, 44px of target,
// in the place iOS puts back — top left of whatever bar the screen already
// has. It is the same action underneath (close the world / return to #/), and
// it is the ONLY one on the screen, because two ways home is the failure the
// monogram-plus-lights combination already was (PRODUCT.md #2).
//
// It takes its colour from whatever it sits in: `currentColor` mixed into the
// fill and the border, so the same component reads right on the notes cream,
// the tech editor's near-black and the design world's white without three
// copies of itself.
import { ChevronLeft } from "lucide-react";

/**
 * @param {object} p
 * @param {string} [p.label] the word on it; "Home" unless a screen means back
 * @param {() => void} [p.onClick] when it must do more than navigate (the
 *   worlds clear their minimised flag first) — otherwise it is a plain link
 * @param {string} [p.className]
 */
export default function PhoneBack({ label = "Home", onClick, className = "" }) {
  const inner = (
    <>
      <ChevronLeft size={17} strokeWidth={2.4} aria-hidden="true" />
      <span className="pback-word">{label}</span>
    </>
  );
  const cls = `pback ${className}`.trim();
  const aria = "Back to the home screen";
  return onClick ? (
    <button type="button" className={cls} onClick={onClick} aria-label={aria}>
      {inner}
    </button>
  ) : (
    <a className={cls} href="#/" aria-label={aria}>
      {inner}
    </a>
  );
}
