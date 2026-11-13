// The cover's two canvases — the lotus scrub and the starfield over it — and
// the one decision about them that matters: WHICH THREAD PAINTS THEM.
//
// THEY ARE PAINTED IN A WORKER (lotus.worker.js), and this is why.
//
// The bloom used to be drawn from a requestAnimationFrame loop on the page.
// That makes the flower exactly as smooth as the main thread is free, and on a
// first visit the main thread is the busiest it will ever be: React is still
// settling, fonts and code chunks are landing, the desk is about to arrive.
// Measured on a cold first scroll (headless Chrome, 4x CPU throttle,
// scripts/measure-cover.mjs): the page managed 15-20 frames across the whole
// four-second bloom, with single stalls of 700-1000ms. The scroll itself never
// stalled — the browser scrolls on its own thread — so what a visitor saw was
// a wheel that turned and a flower that did not.
//
// Every earlier fix made the main thread a little less busy, and each was
// real, but none could change the arrangement: the flower was still waiting in
// the same queue as everything else. Moving it off that thread does. An
// OffscreenCanvas presents straight to the compositor, so:
//
//   · a long task on the page can no longer freeze the bloom. The worker keeps
//     easing toward the last scroll position it was told about, and catches up
//     the instant the next one arrives;
//   · fetching and decoding the forty full-size frames costs the page nothing,
//     so they no longer have to wait for the visitor to stop scrolling. They
//     start the moment the atlas is in — which is what puts the SHARP flower,
//     not the soft atlas one, under a first-time visitor's first scroll;
//   · the starfield's clear-and-redraw goes with it. The page now does no
//     per-frame canvas work at all.
//
// The page's whole part is to say where the scroll is (`setProgress`, called
// from the scroll handler, so not even a frame late) and how big the canvases
// are.
//
// THE FALLBACK is the same engine (lotus-core.js) run on the page, with its
// refinement tier gated on stillness and idleness exactly as it was — for a
// browser without OffscreenCanvas-in-a-worker, which today means Safari before
// 16.4 and Firefox before 105.
import { createLotusEngine, ATLAS_URL } from "./lotus-core.js";
import { createParticles } from "./particles.js";

// 1.5 rather than 2: a backing store's area (and so its fill cost) grows with
// the square of this, and the source frames are 1600 wide.
const dprCap = () => Math.min(window.devicePixelRatio || 1, 1.5);
const boxOf = (el) => [
  el.clientWidth || window.innerWidth,
  el.clientHeight || window.innerHeight,
  dprCap(),
];

const canUseWorker = () =>
  typeof Worker !== "undefined" &&
  typeof OffscreenCanvas !== "undefined" &&
  typeof HTMLCanvasElement !== "undefined" &&
  "transferControlToOffscreen" in HTMLCanvasElement.prototype;

// The atlas is preloaded by index.html as a fetch, so asking for it here is
// answered from that preload without touching the network again. A Blob is a
// handle, not the bytes — handing it to the worker copies nothing.
const fetchAtlas = () =>
  fetch(ATLAS_URL)
    .then((r) => (r.ok ? r.blob() : null))
    .catch(() => null);

// A CANVAS CAN ONLY BE HANDED OVER ONCE. transferControlToOffscreen() throws
// on its second call for the same element, and React's StrictMode mounts every
// effect twice in development — mount, unmount, mount — against the SAME
// element. So a live session is remembered per canvas: tearing one down only
// pauses it and schedules the real end for the next task, and a remount that
// arrives before then (StrictMode's does, synchronously) takes the session
// back instead of starting a second.
const sessions = new WeakMap();

/**
 * @param {HTMLCanvasElement} canvas the lotus
 * @param {{ particlesCanvas?: HTMLCanvasElement | null, progress?: number }} [opts]
 * @returns {{ setProgress: (p: number) => void, destroy: () => void }}
 */
export function createLotusScrubber(canvas, opts = {}) {
  const { particlesCanvas = null, progress = 0 } = opts;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Reduced motion: fetch nothing, decode nothing, run nothing. The preloaded
  // poster (the resting pose, identical to frame 0) is the whole experience,
  // under a starfield painted once and left still.
  if (reduced) {
    const stars = particlesCanvas ? createParticles(particlesCanvas) : null;
    return { setProgress() {}, destroy: () => stars?.destroy() };
  }

  return canUseWorker()
    ? inWorker(canvas, particlesCanvas, progress)
    : onPage(canvas, particlesCanvas, progress);
}

function reveal(canvas) {
  canvas.style.opacity = "1";
  performance.mark?.("lotus-scrubbable");
}

function inWorker(canvas, particlesCanvas, progress) {
  let session = sessions.get(canvas);
  let last = progress;

  if (session) {
    clearTimeout(session.ending);
    session.worker.postMessage({ type: "resume", p: progress });
  } else {
    let worker;
    try {
      worker = new Worker(new URL("./lotus.worker.js", import.meta.url), {
        type: "module",
      });
    } catch {
      // a policy that forbids workers: paint on the page instead
      return onPage(canvas, particlesCanvas, progress);
    }
    session = { worker, ending: 0 };
    sessions.set(canvas, session);

    worker.onmessage = (ev) => {
      if (ev.data.type === "ready") reveal(canvas);
      // how many full-size frames are in — for scripts/measure-cover.mjs, and
      // for anyone wondering in devtools why the flower is soft
      else if (ev.data.type === "frames") canvas.dataset.frames = ev.data.n;
    };
    // If the worker dies, the canvases went with it and cannot be taken back.
    // What is left is the poster underneath — the resting lotus, which is the
    // same picture reduced motion shows on purpose.
    worker.onerror = () => {
      canvas.style.opacity = "0";
    };

    const lotus = canvas.transferControlToOffscreen();
    const particles = particlesCanvas?.transferControlToOffscreen() ?? null;
    worker.postMessage(
      {
        type: "init",
        lotus,
        particles,
        origin: window.location.origin,
        lotusSize: boxOf(canvas),
        particlesSize: particlesCanvas ? boxOf(particlesCanvas) : null,
        progress,
      },
      particles ? [lotus, particles] : [lotus]
    );
    fetchAtlas().then((blob) => worker.postMessage({ type: "atlas", blob }));
  }

  const { worker } = session;
  // ResizeObserver, not a window listener: it fires on the initial layout too,
  // which is what recovers a canvas that had no box yet when it was handed
  // over, and it tracks the element's own box rather than assuming it always
  // matches the viewport.
  const ro = new ResizeObserver((entries) => {
    for (const e of entries) {
      worker.postMessage({
        type: "size",
        which: e.target === canvas ? "lotus" : "particles",
        size: boxOf(e.target),
      });
    }
  });
  ro.observe(canvas);
  if (particlesCanvas) ro.observe(particlesCanvas);

  return {
    setProgress(p) {
      if (p === last) return;
      last = p;
      worker.postMessage({ type: "progress", p });
    },
    destroy() {
      ro.disconnect();
      worker.postMessage({ type: "pause" });
      session.ending = setTimeout(() => {
        worker.terminate();
        sessions.delete(canvas);
      }, 0);
    },
  };
}

// The engine on the main thread. Same code, same picture — it simply shares
// the page's frame budget, so the refinement tier goes back behind its gates.
function onPage(canvas, particlesCanvas, progress) {
  const stars = particlesCanvas ? createParticles(particlesCanvas) : null;

  // WAIT FOR A GAP BEFORE EACH FULL-SIZE FRAME. On this thread a decode
  // competes with React mounting, the desk's art and the scrub itself;
  // measured at 4x CPU throttle, holding these back took 680ms off the main
  // thread's blocked time. The 1.2s timeout is the backstop: a page that never
  // goes idle must not be a page that never refines.
  const whenSpare = () =>
    new Promise((resolve) => {
      const idle = window.requestIdleCallback;
      if (idle) idle(() => resolve(), { timeout: 1200 });
      else setTimeout(resolve, 600);
    });

  const engine = createLotusEngine(canvas, {
    gated: true,
    whenSpare,
    onReady: () => reveal(canvas),
    onFrames: (n) => {
      canvas.dataset.frames = n;
    },
    onStep: stars?.step,
  });
  const measure = () => engine.setSize(...boxOf(canvas));
  measure();
  const ro = new ResizeObserver(measure);
  ro.observe(canvas);

  engine.setProgress(progress);
  engine.start();
  fetchAtlas().then((blob) => engine.load(blob ?? undefined));

  return {
    setProgress: engine.setProgress,
    destroy() {
      ro.disconnect();
      engine.destroy();
      stars?.destroy();
      canvas.style.opacity = "0";
    },
  };
}
