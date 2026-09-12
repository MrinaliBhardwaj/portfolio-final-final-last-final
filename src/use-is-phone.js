// IS THIS A PHONE — and is it a SHORT one.
//
// Lifted out of DesktopFiles.jsx on 12 Sep 2026, when the phone stopped being
// a smaller desktop and became its own screen (PhoneHome.jsx): three files now
// need the same answer, and three copies of a media query is how two of them
// end up disagreeing about what a phone is.
import { useEffect, useState } from "react";

export const PHONE = "(max-width: 640px)";
// A PHONE IS ALSO A HEIGHT, not only a width. Tiles are sized in PIXELS and
// placed on a grid, so one row costs a fixed number of pixels but a varying
// share of the screen: 11% of a 390x844, 17% of a 320x568.
export const SHORT = "(max-height: 700px)";

/**
 * @returns {{ phone: boolean, short: boolean }}
 */
export default function useIsPhone() {
  const read = () =>
    typeof window === "undefined"
      ? { phone: false, short: false }
      : {
          phone: window.matchMedia(PHONE).matches,
          short: window.matchMedia(SHORT).matches,
        };
  const [size, setSize] = useState(read);
  useEffect(() => {
    // Re-read the query FRESH each time rather than trusting a stored
    // MediaQueryList, and listen to `resize` as well as `change`. A held MQL
    // that never re-evaluates is not hypothetical — it is what happens under a
    // devtools device-metrics override, where the width changes, a new
    // matchMedia() call reports the new answer, and the old object's `change`
    // never fires.
    const sync = () =>
      setSize((prev) => {
        const next = read();
        return prev.phone === next.phone && prev.short === next.short ? prev : next;
      });
    const mqs = [window.matchMedia(PHONE), window.matchMedia(SHORT)];
    sync();
    mqs.forEach((mq) => mq.addEventListener("change", sync));
    window.addEventListener("resize", sync);
    return () => {
      mqs.forEach((mq) => mq.removeEventListener("change", sync));
      window.removeEventListener("resize", sync);
    };
  }, []);
  return size;
}
