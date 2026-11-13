// THE LOTUS ENGINE — the scrub itself, with no idea which thread it is on.
//
// It is handed a canvas and told a position; it fetches, decodes, eases and
// paints. Nothing in here touches `window`, `document` or the DOM, because its
// real home is a worker (lotus.worker.js) drawing into an OffscreenCanvas.
// lotus.js runs the very same code on the main thread for the browsers that
// cannot do that. See lotus.js for why the split exists.
//
// WHY NOT A VIDEO
// ---------------
// This used to scrub `public/lotus-bloom.mp4` by seeking a <video>, with a
// runtime frame cache in front of it. The clip is encoded with exactly ONE
// keyframe for all 241 frames (`ffprobe -select_streams v:0
// -show_entries packet=flags` returns a single `K`), so there is no seek point
// after t=0: seeking mid-clip decodes every preceding frame, seeking backwards
// restarts from zero. Its `moov` was also the last box in the file, so nothing
// could seek until all 6 MB had arrived. Building the cache from that video
// still paid the full cost — it just paid it once, over the first several
// seconds, which is exactly how long the stutter lasted.
//
// So the frames are extracted at build time instead (scripts/build_lotus_frames.py)
// and shipped as images. Every frame is independently decodable, nothing is a
// seek, and no video decoder is involved at runtime.
//
// TWO TIERS, so responsiveness never waits on fidelity:
//   A. one sprite atlas of every frame, small — preloaded in index.html, so it
//      lands during HTML parse. One request, one decode, and the WHOLE timeline
//      is scrubbable. This is the zero-stutter guarantee.
//   B. the full-size frames, streamed in behind it.
// Because A covers every index from the moment it lands, there is never a
// missing frame — no nearest-neighbour search, no popping.
//
// Frame order is already reversed on disk (f00 is the top-of-page resting pose,
// identical to the preloaded poster), so there is no reverse flag here.

export const FRAME_COUNT = 40;
export const ATLAS_URL = "/lotus/atlas.webp";
const frameUrl = (i) => `/lotus/f${String(i).padStart(2, "0")}.webp`;

// must match scripts/build_lotus_frames.py
const FRAME_W = 1600;
const FRAME_H = 900;
const ATLAS_COLS = 8;
const TILE_W = 480;
const TILE_H = 270;

// How many frames to fetch at once. Enough to saturate an HTTP/2 connection
// without starving the atlas or the rest of the page of bandwidth.
const FETCH_CONCURRENCY = 6;

// How long the position must hold still before the scrub counts as at rest.
// Short enough that a visitor who stops gets crisp frames almost immediately,
// long enough that it never fires between two wheel ticks.
const QUIET_MS = 250;

/**
 * @param {HTMLCanvasElement | OffscreenCanvas} canvas
 * @param {{
 *   origin?: string,            // prefix for the frame URLs (a worker has no page to resolve against)
 *   onReady?: () => void,       // the atlas is in: the whole timeline is scrubbable
 *   onFrames?: (n: number) => void, // how many full-size frames have landed
 *   onStep?: (dt: number) => void,  // called once per painted frame (the starfield rides this)
 *   gated?: boolean,            // hold the refinement tier back while the scrub is moving
 *   whenSpare?: () => Promise<void>, // …and until the thread is idle (main thread only)
 * }} [opts]
 */
export function createLotusEngine(canvas, opts = {}) {
  const { origin = "", onReady, onFrames, onStep, gated = false, whenSpare } = opts;
  const ctx = canvas.getContext("2d", { alpha: true });

  // a worker has requestAnimationFrame only in the browsers that also let it
  // own a canvas; the timer is the floor for anything stranger
  const g = globalThis;
  const hasRaf = typeof g.requestAnimationFrame === "function";
  const nextFrame = hasRaf
    ? (cb) => g.requestAnimationFrame(cb)
    : (cb) => setTimeout(() => cb(performance.now()), 16);
  const cancelFrame = hasRaf ? (id) => g.cancelAnimationFrame(id) : (id) => clearTimeout(id);

  let raf = 0;
  let running = false;
  let loading = false;
  let destroyed = false;
  let atlas = null;
  const frames = new Array(FRAME_COUNT);
  let framesIn = 0;
  // FRAMES THAT HAVE BEEN DECODED BUT NEVER DRAWN. A decoded bitmap is pixels
  // in memory; it becomes a texture — an upload to the GPU, on the thread that
  // presents frames — the first time it is drawn. Left alone, that first draw
  // is the moment the scrub reaches the frame: forty uploads, each landing in
  // the frame that needed it. So each arrival waits here, and the loop draws
  // one per tick into a single pixel that the real frame is painted straight
  // over in the same tick. Nobody sees it; the texture exists from then on.
  const unwarmed = [];
  const aborter = new AbortController();

  // where the scrub has been told to be, 0..1
  let progress = 0;

  // IS THE CEREMONY MOVING RIGHT NOW? `lastMoveAt` is stamped by the loop
  // whenever the position changes, so "quiet" means it has held still for
  // QUIET_MS. Two things read it: which tier may be painted (below), and — on
  // the main thread only — whether the refinement tier may decode.
  let lastMoveAt = 0;
  let lastProgress = -1;
  let quietWaiters = [];

  let lastIndex = -1;
  let lastTier = 0; // 0 nothing, 1 atlas tile, 2 full frame
  let dirty = true; // force a repaint (resize, or the atlas arrived)
  let lastT = 0;

  // Temporally smoothed frame position. Wheel scrolls arrive as coarse steps —
  // a tick can jump several frames at once — so mapping scroll straight to a
  // frame makes the bloom stutter. The painted position eases toward the live
  // target every frame instead. Time-based, so the ~quarter-second settle feels
  // identical at 60Hz and 120Hz.
  //
  // It is also what keeps the flower moving when the page cannot talk to it:
  // if the main thread is busy for a beat and no new position arrives, this
  // keeps gliding toward the last one instead of freezing mid-petal.
  let smoothF = -1;

  function setSize(cssW, cssH, dpr) {
    // A degenerate box means layout hasn't run yet. Sizing to 0 here would
    // leave a permanently blank canvas that only a later resize could rescue —
    // so bail and let the caller's ResizeObserver try again with a real box.
    if (cssW < 1 || cssH < 1) return;
    let bw = Math.round(cssW * dpr);
    let bh = Math.round(cssH * dpr);
    // Never ask drawImage to magnify. If cover-fitting the source into this
    // backing store would upscale, shrink the backing store until it doesn't
    // and let CSS stretch the canvas ELEMENT the rest of the way — the
    // compositor does that in hardware for free, whereas drawImage would
    // resample on the CPU every single frame.
    const cover = Math.max(bw / FRAME_W, bh / FRAME_H);
    if (cover > 1) {
      bw = Math.round(bw / cover);
      bh = Math.round(bh / cover);
    }
    if (canvas.width === bw && canvas.height === bh) return;
    canvas.width = bw;
    canvas.height = bh;
    // "low" — plain bilinear. The backing store is never larger than the
    // source (see above), so a full frame is drawn at between about 0.6x and
    // 1x, where bilinear and anything better are the same picture on a soft
    // organic subject. "medium" is not free to ask for, though: it samples
    // from mipmaps, so the GPU has to BUILD a mip chain for every one of the
    // forty 1600x900 frames the first time it is drawn — work on the thread
    // that presents frames, in the middle of the scrub.
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "low";
    dirty = true; // context state and contents are reset by the resize
  }

  // object-fit: cover, from an arbitrary source rect
  function coverDraw(src, sx, sy, sw, sh) {
    const cw = canvas.width;
    const ch = canvas.height;
    const s = Math.max(cw / sw, ch / sh);
    const dw = sw * s;
    const dh = sh * s;
    ctx.drawImage(src, sx, sy, sw, sh, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }

  // ONE TIER AT A TIME WHILE IT MOVES. Each index has its own full frame or
  // its own atlas tile, so a half-refined timeline scrubbed across pops
  // between sharp and soft, frame by frame — worse than either. So while the
  // flower is moving it is drawn from the full frames only once ALL of them
  // are in; until then a moving flower is the atlas throughout, and a resting
  // one is as sharp as whatever has landed for the frame it rests on. The
  // sharpening happens once, in one direction, and never back.
  function tierFor(i, moving) {
    if (frames[i] && (framesIn === FRAME_COUNT || !moving)) return 2;
    return atlas ? 1 : 0;
  }

  function paintFrame(i, tier) {
    if (tier === 2) {
      const hi = frames[i];
      coverDraw(hi, 0, 0, hi.width, hi.height);
    } else {
      const col = i % ATLAS_COLS;
      const row = Math.floor(i / ATLAS_COLS);
      coverDraw(atlas, col * TILE_W, row * TILE_H, TILE_W, TILE_H);
    }
  }

  // `source` is the atlas as a Blob when the page has already fetched it (it
  // is preloaded in index.html, so that fetch is free), or nothing, in which
  // case it is fetched here.
  async function loadAtlas(source) {
    let blob = source;
    if (!blob) {
      const resp = await fetch(origin + ATLAS_URL, { signal: aborter.signal });
      blob = await resp.blob();
    }
    if (destroyed) return;
    // Decoding from a Blob happens OFF the calling thread, unlike
    // createImageBitmap(<video>), which had to run synchronously against the
    // element's current frame.
    const bmp = await createImageBitmap(blob);
    if (destroyed) {
      bmp.close?.();
      return;
    }
    atlas = bmp;
    dirty = true;
    onReady?.();
    loadFrames();
  }

  // Strided [8,4,2,1]: the timeline gets coarse full-length coverage first,
  // then refines — so a visitor who stops early in the stream is likelier to
  // be resting on a frame that has already landed.
  function stridedOrder(n) {
    const order = [];
    const seen = new Set();
    for (const stride of [8, 4, 2, 1]) {
      for (let i = 0; i < n; i += stride) {
        if (!seen.has(i)) {
          seen.add(i);
          order.push(i);
        }
      }
    }
    return order;
  }

  // THE GATE, AND WHY IT IS ONLY FOR THE MAIN THREAD. Decoding forty 1600x900
  // frames on the thread that is also painting the scrub cost it real frames —
  // a trace once ranked ImageDecoder::DecodeFrameBufferAtIndex at 896ms across
  // the settle. So when this engine is running there (`gated`), a frame may
  // only start once the scrub is STILL and the thread is IDLE.
  //
  // In the worker none of that applies: the fetch, the decode and the upload
  // all happen away from the page, so the frames start the moment the atlas is
  // in and keep coming straight through a scroll. That is the whole reason a
  // first-time visitor gets the sharp flower instead of the soft one.
  function untilQuiet() {
    if (destroyed) return Promise.resolve();
    if (performance.now() - lastMoveAt >= QUIET_MS) return Promise.resolve();
    return new Promise((resolve) => quietWaiters.push(resolve));
  }

  async function loadFrames() {
    const order = stridedOrder(FRAME_COUNT);
    let cursor = 0;
    const worker = async () => {
      while (!destroyed) {
        if (gated) {
          await untilQuiet();
          if (destroyed) return;
          await whenSpare?.();
          if (destroyed) return;
        }
        const at = cursor++;
        if (at >= order.length) return;
        const i = order[at];
        try {
          // `low`, because these are the REFINEMENT tier: the atlas already
          // covers every index, so a frame arriving a moment later costs
          // nothing visible, while competing with the desk's art and the
          // bundle for bandwidth costs a slower opening.
          const resp = await fetch(origin + frameUrl(i), {
            signal: aborter.signal,
            priority: "low",
          });
          const blob = await resp.blob();
          if (destroyed) return;
          const bmp = await createImageBitmap(blob);
          if (destroyed) {
            bmp.close?.();
            return;
          }
          unwarmed.push([i, bmp]);
        } catch {
          /* a dropped frame just keeps its atlas tile — nothing to recover */
        }
      }
    };
    await Promise.all(Array.from({ length: FETCH_CONCURRENCY }, worker));
  }

  function loop(now) {
    if (destroyed || !running) return;
    const dt = Math.min(0.1, lastT ? (now - lastT) / 1000 : 1 / 60);
    lastT = now;

    const p = progress;
    const target = p * (FRAME_COUNT - 1);
    if (smoothF < 0) {
      smoothF = target; // first paint: land on position, don't ease in from 0
    } else {
      smoothF += (target - smoothF) * (1 - Math.exp(-dt * 11));
      if (Math.abs(target - smoothF) < 0.004) smoothF = target; // settle
    }

    // Stamp movement, and release anything waiting for it to stop.
    if (p !== lastProgress) {
      lastProgress = p;
      lastMoveAt = now;
    } else if (quietWaiters.length && now - lastMoveAt >= QUIET_MS) {
      const waiting = quietWaiters;
      quietWaiters = [];
      for (const release of waiting) release();
    }
    const moving = now - lastMoveAt < QUIET_MS || smoothF !== target;

    // one arrival a tick becomes a texture (see `unwarmed`), and only then
    // counts as in: the pixel it touches is repainted by the frame below
    if (unwarmed.length && atlas) {
      const [at, bmp] = unwarmed.shift();
      ctx.drawImage(bmp, 0, 0, 1, 1, 0, 0, 1, 1);
      frames[at] = bmp;
      framesIn++;
      onFrames?.(framesIn);
      dirty = true;
    }

    const i = Math.round(smoothF);
    const tier = tierFor(i, moving);
    if (tier && (i !== lastIndex || tier !== lastTier || dirty)) {
      paintFrame(i, tier);
      lastIndex = i;
      lastTier = tier;
      dirty = false;
    }

    onStep?.(dt);
    raf = nextFrame(loop);
  }

  return {
    setSize,
    setProgress(p) {
      progress = p < 0 ? 0 : p > 1 ? 1 : p;
    },
    start() {
      if (running || destroyed) return;
      running = true;
      lastT = 0;
      raf = nextFrame(loop);
    },
    // Fetch and decode: the atlas first, then the full frames behind it. Once
    // only — a paused-and-resumed engine keeps everything it already has.
    /** @param {Blob} [atlasBlob] the atlas, if the caller already holds it */
    load(atlasBlob) {
      if (loading || destroyed) return;
      loading = true;
      loadAtlas(atlasBlob).catch(() => {
        /* offline or blocked: the poster holds, and so does the layout */
      });
    },
    // stop painting without letting go of anything already decoded
    pause() {
      running = false;
      cancelFrame(raf);
    },
    destroy() {
      destroyed = true;
      running = false;
      cancelFrame(raf);
      // the loop is gone, so nothing else will ever release these
      const stranded = quietWaiters;
      quietWaiters = [];
      for (const release of stranded) release();
      aborter.abort();
      atlas?.close?.();
      atlas = null;
      for (const f of frames) f?.close?.();
      frames.length = 0;
      for (const [, f] of unwarmed) f.close?.();
      unwarmed.length = 0;
    },
  };
}
