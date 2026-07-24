// The card face hanging on the lanyard: a conference/office access badge, in
// the tech world's own VS Code palette. Mounted on the 3D card's front face
// by <Lanyard cardFront={...}> — it is a live DOM node, which is the whole
// reason for the <Html transform> overlay (these gradients, the noise layer and
// the mask-composite border can't run inside a WebGL texture).
//
// Adapted from the standalone project's ReflectiveCard with two changes:
//
//   · NO WEBCAM. The original mirrored a live getUserMedia feed into the card
//     through an feTurbulence/feDisplacementMap filter. On a public portfolio
//     that fires a camera-permission prompt at a stranger on page load, and the
//     filter is the single most expensive thing in the scene. The metallic
//     sheen/noise/border layers carry the look on their own over the dark base.
//     (To bring it back, see HANDOVER.md §6 in the lanyard project.)
//
//   · Every class is `dvb-` prefixed. The source used bare `.label`, `.value`,
//     `.card-header`, `.card-body` — global names this project would collide
//     with sooner or later (the DomeGallery `.stage` lesson, see DECISIONS.md).
//
// The copy is her real tech identity, matching README.md in the buffer behind
// it — the original card said "JUNIOR DEVELOPER", which contradicts it.
import { Activity, Fingerprint, Terminal } from "lucide-react";

export default function DevBadge() {
  return (
    <div className="dvb">
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
