// THE POND: the dock's Game app — an interactive installation. One lotus
// above the waterline (the design world, soft and lit); its reflection below
// (the tech world, phosphor wireframe) disobeys — it lags, mirrors wrong.
// Bring a hand into each world and truly mirror yourself: the waterline holds
// gold, the worlds sync, and both lotuses bloom as one.
//
// This file is the shell: chrome, captions, tally. The visuals (WebGL
// pipeline), hand tracking and game loop mount into the stage next.
import { useEffect, useState } from "react";
import { X } from "lucide-react";

// win tally persists across visits — every agreement leaves a light on the
// pond, so the piece slowly accumulates its audience
const COUNT_KEY = "pond:agreements";

export function readAgreements() {
  try {
    const n = parseInt(window.localStorage.getItem(COUNT_KEY) || "0", 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

export default function PondWorld() {
  const [agreements] = useState(readAgreements);

  const back = () => {
    window.location.hash = "/";
  };

  useEffect(() => {
    // the stage is claimed by the GL pipeline in the next milestone
  }, []);

  return (
    <div className="pw">
      <div className="pw-stage" aria-hidden="true" />

      <header className="pw-top">
        <span className="pw-mark" aria-label="Mrinali Bhardwaj">
          mb
        </span>
        <span className="pw-label">The Pond</span>
        <button
          type="button"
          className="pw-close"
          onClick={back}
          aria-label="Close the pond and return to the start"
        >
          <X size={18} strokeWidth={1.6} aria-hidden="true" />
        </button>
      </header>

      <p className="pw-caption" role="status">
        the water is being poured&hellip;
      </p>

      <p className="pw-hint" aria-hidden="true">
        An installation · agree with your reflection
      </p>

      {agreements > 0 && (
        <p className="pw-count" aria-label={`${agreements} agreements so far`}>
          <span className="pw-count-dot" />
          {agreements} agreement{agreements === 1 ? "" : "s"}
        </p>
      )}
    </div>
  );
}
