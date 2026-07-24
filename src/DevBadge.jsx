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

export default function DevBadge() {
  const video = useRef(null);

  useEffect(() => {
    const media = navigator.mediaDevices;
    if (!media?.getUserMedia) return;

    let stream = null;
    let gone = false;

    // 320x240 is plenty: it lands under a 12px blur and a displacement map, so
    // the extra pixels of the source's 640x480 are spent purely on decode.
    media
      .getUserMedia({
        video: { width: { ideal: 320 }, height: { ideal: 240 }, facingMode: "user" },
      })
      .then((s) => {
        // a visitor can sit on the permission prompt for a while — by the time
        // they answer, this badge may be long unmounted
        if (gone) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        if (video.current) video.current.srcObject = s;
      })
      .catch(() => {
        /* declined, blocked, or no camera. The metal look stands on its own. */
      });

    return () => {
      gone = true;
      stream?.getTracks().forEach((t) => t.stop());
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
