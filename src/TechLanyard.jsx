// Her ID badge, hung from the top-right corner of the editor. It's a physics
// scene, so this wrapper is the gate that keeps it from costing anything where
// it shouldn't run:
//
//   · DESKTOP ONLY — `(min-width: 1280px) and (pointer: fine)`. Below that the
//     tech world drops its whole desktop chrome anyway, and a swinging
//     drag-toy on a phone would just eat the tap target it sits on.
//   · REDUCED MOTION — a badge that never stops swaying is exactly what that
//     setting is asking us not to do, so it doesn't mount at all.
//   · LAZY — three + rapier + drei is ~700kB, more than this whole app was.
//     React.lazy keeps it out of the entry bundle: nobody pays for it until
//     they open #/tech on a wide screen.
//   · FROZEN WHEN HIDDEN — `frameloop="never"` while the tab is backgrounded,
//     so the rope sim isn't burning a core behind another window.
//
// This gate is also what keeps the badge's webcam request narrow: DevBadge asks
// for the camera on mount, and it only ever mounts here — #/tech, wide screen,
// motion allowed. Refusal is harmless (see DevBadge.jsx).
import { Suspense, lazy, useEffect, useState } from "react";
import DevBadge from "./DevBadge.jsx";

const Lanyard = lazy(() => import("./Lanyard.jsx"));

export default function TechLanyard() {
  const [enabled, setEnabled] = useState(false);
  const [live, setLive] = useState(true);

  useEffect(() => {
    const big = window.matchMedia("(min-width: 1280px) and (pointer: fine)");
    const still = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => setEnabled(big.matches && !still.matches);
    sync();
    big.addEventListener("change", sync);
    still.addEventListener("change", sync);
    return () => {
      big.removeEventListener("change", sync);
      still.removeEventListener("change", sync);
    };
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const sync = () => setLive(!document.hidden);
    sync();
    document.addEventListener("visibilitychange", sync);
    return () => document.removeEventListener("visibilitychange", sync);
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div className="tw-lanyard">
      <Suspense fallback={null}>
        <Lanyard
          position={[0, 0, 17]}
          gravity={[0, -40, 0]}
          frameloop={live ? "always" : "never"}
          cardFront={<DevBadge />}
        />
      </Suspense>
    </div>
  );
}
