// THE COVER'S PAINTING THREAD. Both of its canvases — the lotus and the
// starfield over it — are drawn from here, into OffscreenCanvases the page has
// handed over. See lotus.js for why, and lotus-core.js for the scrub itself.
//
// The page sends four things: the canvases (once), their size (on resize), the
// scroll position (on scroll), and the atlas it has already fetched. Nothing
// else crosses, and nothing at all crosses per frame.
import { createLotusEngine } from "./lotus-core.js";
import { createParticleField } from "./particles.js";

let engine = null;
let field = null;

self.onmessage = (ev) => {
  const m = ev.data;
  switch (m.type) {
    case "init": {
      field = m.particles ? createParticleField(m.particles) : null;
      if (field && m.particlesSize) field.resize(...m.particlesSize);
      engine = createLotusEngine(m.lotus, {
        origin: m.origin,
        onReady: () => self.postMessage({ type: "ready" }),
        // a progress report, and a sparse one: six messages in a visit
        onFrames: (n) => {
          if (n % 8 === 0) self.postMessage({ type: "frames", n });
        },
        // one loop for both canvases, so the scrub and the stars cannot tear
        onStep: field ? field.step : undefined,
      });
      if (m.lotusSize) engine.setSize(...m.lotusSize);
      engine.setProgress(m.progress || 0);
      engine.start();
      break;
    }
    // the page fetched it (it is preloaded there); no blob means it could not,
    // and the engine fetches its own
    case "atlas":
      engine?.load(m.blob);
      break;
    case "progress":
      engine?.setProgress(m.p);
      break;
    case "size":
      if (m.which === "particles") field?.resize(...m.size);
      else engine?.setSize(...m.size);
      break;
    case "pause":
      engine?.pause();
      break;
    case "resume":
      engine?.setProgress(m.p);
      engine?.start();
      break;
  }
};
