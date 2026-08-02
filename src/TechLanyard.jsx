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
//   · ONLY AFTER THE WORLD LANDS — the window zooms open from scale 0.3, and a
//     canvas measured mid-zoom hands rapier a hook position that is wrong for
//     good. Waiting also keeps the rope sim off the same 420ms as the zoom.
//
// This gate is also the outer bound on the badge's webcam request — the camera
// can only ever come up on #/tech, on a wide screen, with motion allowed.
//
// The INNER bound, and the one that matters, is consent, and it is owned here
// rather than in DevBadge because the two halves live in different trees: the
// hint is painted on the DOM card face, but the only clickable thing is the 3D
// card under it (the face is pointer-events:none — see lanyard.css). So this
// component holds the state, hands `consent` down to the badge, and takes the
// tap back from <Lanyard onCardTap>. Nothing touches getUserMedia until that
// tap lands, or until the Permissions API says this visitor already said yes.
import { Suspense, lazy, useCallback, useEffect, useState } from "react";
import DevBadge from "./DevBadge.jsx";
import { useWorldOpening } from "./world-open.js";

const Lanyard = lazy(() => import("./Lanyard.jsx"));

export default function TechLanyard() {
  const [enabled, setEnabled] = useState(false);
  const [live, setLive] = useState(true);
  const [consent, setConsent] = useState("idle");
  // Not just tidiness: mounting mid-zoom is what nailed the hook to the wrong
  // place. The canvas measures the SCALED world window, rapier bakes that into
  // the bodies, and it never re-reads. See world-open.js.
  const opening = useWorldOpening();

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

  // Has this visitor already granted the camera on a previous visit? Then the
  // reflection is what they chose and re-asking would be the annoying version
  // of being careful — arm it silently, no hint, no second prompt.
  //
  // querying is NOT the same as requesting: Permissions.query only reads the
  // stored decision, it never prompts. The try/catch is load-bearing — Firefox
  // doesn't implement the "camera" descriptor and throws TypeError — and every
  // failure path must fall through to "idle", never to "armed". A missing API
  // must never become an auto-request; that is the bug this whole change is
  // about.
  useEffect(() => {
    if (!enabled) return;
    let gone = false;
    (async () => {
      try {
        const status = await navigator.permissions.query({ name: "camera" });
        if (gone) return;
        if (status.state === "granted") setConsent("armed");
        else if (status.state === "denied") setConsent("denied");
      } catch {
        /* no Permissions API, or no camera descriptor: stay idle and ask. */
      }
    })();
    return () => {
      gone = true;
    };
  }, [enabled]);

  // Only "idle" can be tapped into "armed": once denied, another request can
  // only reproduce the same block, and once armed the stream is already up.
  const onCardTap = useCallback(() => {
    setConsent((c) => (c === "idle" ? "armed" : c));
  }, []);

  // Stable identity: DevBadge lists this in its effect deps, so a fresh
  // function each render would tear down and re-acquire the stream every time.
  const onDenied = useCallback(() => setConsent("denied"), []);

  if (!enabled || opening) return null;

  return (
    <div className="tw-lanyard">
      <Suspense fallback={null}>
        {/* The camera z is the zoom dial documented on Lanyard's `position`
            prop: rendered card height is 2.25 / (2z·tan(fov/2)) · canvasHeight,
            so this is purely "how big is the badge". 13 renders it ~442px tall
            on a 900px viewport, against ~338px at 17. Nothing else needs
            retuning — the hang anchor's offsets are in world units, which scale
            with z too, so the composition just zooms around the same point. */}
        <Lanyard
          position={[0, 0, 13]}
          gravity={[0, -40, 0]}
          frameloop={live ? "always" : "never"}
          onCardTap={onCardTap}
          cardFront={<DevBadge consent={consent} onDenied={onDenied} />}
        />
      </Suspense>
    </div>
  );
}
