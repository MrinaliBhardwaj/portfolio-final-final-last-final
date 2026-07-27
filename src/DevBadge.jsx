// The card face hanging on the lanyard: a conference/office access badge, in
// the tech world's own VS Code palette. Mounted on the 3D card's front face
// by <Lanyard cardFront={...}> — it is a live DOM node, which is the whole
// reason for the <Html transform> overlay (these gradients, the noise layer and
// the mask-composite border can't run inside a WebGL texture).
//
// Adapted from the standalone project's ReflectiveCard:
//
//   · THE WEBCAM IS THE POINT. A live getUserMedia feed is pushed through an
//     feTurbulence/feDisplacementMap filter so the badge mirrors whoever is
//     reading it — a laminated card catching the room. It is requested only
//     here, which means only on #/tech above 1280px (see TechLanyard.jsx), and
//     a refusal costs nothing: the feed simply never arrives and the card sits
//     on its dark base with the sheen and noise doing the work.
//
//   · Every class is `dvb-` prefixed. The source used bare `.label`, `.value`,
//     `.card-header`, `.card-body` — global names this project would collide
//     with sooner or later (the DomeGallery `.stage` lesson, see DECISIONS.md).
//
// The copy is her real tech identity, matching README.md in the buffer behind
// it — the original card said "JUNIOR DEVELOPER", which contradicts it.
import { useEffect, useRef } from "react";
import { Activity, Fingerprint, Terminal } from "lucide-react";

// ---- the camera: one shared stream, refcounted ----
// Module scope on purpose. <React.StrictMode> runs every effect twice in dev
// (mount -> cleanup -> mount), so the obvious per-component version fires TWO
// getUserMedia calls. Their tracks share one physical camera, and the first
// call's cleanup then stops a track the second call is still displaying — the
// badge goes black, in dev only, for reasons nothing on screen explains.
//
// Refcounting one shared promise gives a single prompt and a single stream with
// no race, while a deferred release still hands the camera back when she
// actually leaves the tech world — which a plain module singleton never would.
// Holding a webcam open after you navigate away is exactly the creepy behaviour
// this feature has to avoid.
const CAM = { promise: null, refs: 0, timer: 0 };

function acquireCam() {
  CAM.refs += 1;
  if (CAM.timer) {
    clearTimeout(CAM.timer);
    CAM.timer = 0;
  }
  if (!CAM.promise) {
    // 320x240 is plenty: it lands under a 7px blur and a displacement map, so
    // the extra pixels of the source's 640x480 are spent purely on decode.
    CAM.promise = navigator.mediaDevices.getUserMedia({
      video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: "user" },
    });
  }
  return CAM.promise;
}

function releaseCam() {
  CAM.refs -= 1;
  if (CAM.refs > 0) return;
  // Deferred, so StrictMode's instant remount re-acquires the very same stream
  // instead of tearing the camera down and prompting all over again. Clearing
  // the promise also means a refusal isn't cached forever: fix the permission,
  // come back to #/tech, and it asks again.
  CAM.timer = setTimeout(() => {
    const held = CAM.promise;
    CAM.promise = null;
    CAM.timer = 0;
    held?.then((s) => s.getTracks().forEach((t) => t.stop())).catch(() => {});
  }, 500);
}

export default function DevBadge() {
  const video = useRef(null);

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) return;
    let gone = false;

    acquireCam()
      .then((stream) => {
        const el = video.current;
        if (gone || !el) return;
        el.srcObject = stream;
        if (import.meta.env.DEV) window.__badgeCam = el;
        // `autoplay` alone is unreliable when the source is attached AFTER the
        // element has already run its autoplay algorithm against no source.
        // Ask explicitly; muted playback needs no user gesture.
        return el.play().catch(() => {});
      })
      .catch((err) => {
        // Deliberately not silent. A refusal is fine; an undiagnosable one is
        // not. `err.name` is the whole story: NotAllowedError means blocked
        // (sticky per origin until reset from the address bar), NotFoundError
        // means no camera, NotReadableError means another app holds it.
        if (import.meta.env.DEV) {
          console.warn("[badge] camera unavailable:", err.name, "—", err.message);
        }
      });

    return () => {
      gone = true;
      releaseCam();
    };
  }, []);

  return (
    <div className="dvb">
      {/* the reflection: turbulence displaces the feed, then a specular pass is
          screened back over it so the ripples catch a highlight. The source's
          `glassDistortion` tail (erode → blur → a second displacement) is cut —
          it ran at scale 0, so five filter primitives produced no pixels. */}
      <svg className="dvb-filters" aria-hidden="true">
        <defs>
          <filter id="dvb-metal" x="-20%" y="-20%" width="140%" height="140%">
            <feTurbulence type="turbulence" baseFrequency="0.03" numOctaves="2" result="noise" />
            <feColorMatrix in="noise" type="luminanceToAlpha" result="noiseAlpha" />
            <feDisplacementMap
              in="SourceGraphic"
              in2="noise"
              scale="20"
              xChannelSelector="R"
              yChannelSelector="G"
              result="rippled"
            />
            <feSpecularLighting
              in="noiseAlpha"
              surfaceScale="20"
              specularConstant="1.2"
              specularExponent="20"
              lightingColor="#ffffff"
              result="light"
            >
              <fePointLight x="0" y="0" z="300" />
            </feSpecularLighting>
            <feComposite in="light" in2="rippled" operator="in" result="lit" />
            <feBlend in="lit" in2="rippled" mode="screen" />
          </filter>
        </defs>
      </svg>

      <video ref={video} className="dvb-video" autoPlay playsInline muted />

      <div className="dvb-noise" aria-hidden="true" />
      <div className="dvb-sheen" aria-hidden="true" />
      <div className="dvb-border" aria-hidden="true" />

      <div className="dvb-content">
        <div className="dvb-head">
          <span className="dvb-chip">
            <Terminal size={13} strokeWidth={2} aria-hidden="true" />
            FULL-STACK &middot; AI
          </span>
          <Activity className="dvb-status" size={19} strokeWidth={2} aria-hidden="true" />
        </div>

        <div className="dvb-body">
          <h2 className="dvb-name">MRINALI BHARDWAJ</h2>
          <p className="dvb-role">SOFTWARE ENGINEER</p>
        </div>

        <div className="dvb-foot">
          <div className="dvb-id">
            <span className="dvb-k">B.TECH CSE</span>
            <span className="dvb-v">VIT &middot; 2027</span>
          </div>
          <Fingerprint size={30} strokeWidth={1.5} className="dvb-print" aria-hidden="true" />
        </div>
      </div>
    </div>
  );
}
