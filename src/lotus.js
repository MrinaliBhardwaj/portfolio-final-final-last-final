// Scroll-scrubbing for the cover lotus, from a pre-decoded FRAME SEQUENCE.
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
//   B. the full-size frames, streamed in behind it, each swapping into its slot
//      as it decodes.
// Because A covers every index from the moment it lands, there is never a
// missing frame — no nearest-neighbour search, no popping.
//
// Frame order is already reversed on disk (f00 is the top-of-page resting pose,
// identical to the preloaded poster), so there is no reverse flag here.
//
// The loop also drives the particle field, so the cover runs ONE
// requestAnimationFrame, not two competing ones.

const FRAME_COUNT = 40;
const ATLAS_URL = "/lotus/atlas.webp";
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

export function createLotusScrubber(canvas, getProgress, opts = {}) {
  const { onStep } = opts;
  const ctx = canvas.getContext("2d", { alpha: true });
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let raf = 0;
  let destroyed = false;
  let atlas = null;
  const frames = new Array(FRAME_COUNT);
  const aborter = new AbortController();

  let lastIndex = -1;
  let dirty = true; // force a repaint (resize, or a better frame arrived)
  let lastT = 0;

  // Temporally smoothed frame position. Wheel scrolls arrive as coarse steps —
  // a tick can jump several frames at once — so mapping scroll straight to a
  // frame makes the bloom stutter. The painted position eases toward the live
  // target every frame instead. Time-based, so the ~quarter-second settle feels
  // identical at 60Hz and 120Hz.
  let smoothF = -1;

  function sizeCanvas() {
    const cssW = canvas.clientWidth || window.innerWidth;
    const cssH = canvas.clientHeight || window.innerHeight;
    // A degenerate box means layout hasn't run yet (this effect can commit
    // before the element has been laid out, and a hidden tab may skip layout
    // entirely). Sizing to 0 here would leave a permanently blank canvas that
    // only a later window resize could rescue — so bail and let the
    // ResizeObserver below call us back the moment a real box exists.
    if (cssW < 1 || cssH < 1) return;
    // 1.5 rather than 2: the backing store's area (and so the per-frame fill
    // cost) grows with the square of this, and the source frames are 1600 wide.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
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
    canvas.width = bw;
    canvas.height = bh;
    // "medium" not "high": at ~1:1 the difference is invisible on a soft
    // organic subject, and "high" resampling is real per-frame cost.
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "medium";
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

  function paintFrame(i) {
    const hi = frames[i];
    if (hi) {
      coverDraw(hi, 0, 0, hi.width, hi.height);
      return true;
    }
    if (atlas) {
      const col = i % ATLAS_COLS;
      const row = Math.floor(i / ATLAS_COLS);
      coverDraw(atlas, col * TILE_W, row * TILE_H, TILE_W, TILE_H);
      return true;
    }
    return false; // nothing decoded yet — the poster still holds the stage
  }

  async function loadAtlas() {
    const resp = await fetch(ATLAS_URL, { signal: aborter.signal });
    const blob = await resp.blob();
    if (destroyed) return;
    // Decoding from a Blob happens OFF the main thread, unlike
    // createImageBitmap(<video>), which had to run synchronously against the
    // element's current frame. This is why the new path cannot block scroll.
    const bmp = await createImageBitmap(blob);
    if (destroyed) {
      bmp.close?.();
      return;
    }
    atlas = bmp;
    dirty = true;
    canvas.style.opacity = "1";
    performance.mark?.("lotus-scrubbable");
  }

  // Strided [8,4,2,1]: the timeline gets coarse full-length coverage first,
  // then refines. Unlike the old video path, where each pass restarted near
  // index 0 and so forced a backward seek (a full re-decode from frame 0),
  // these are independent image fetches — order costs nothing.
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
    for (let i = 0; i < n; i++) {
      if (!seen.has(i)) order.push(i);
    }
    return order;
  }

  async function loadFrames() {
    const order = stridedOrder(FRAME_COUNT);
    let cursor = 0;
    const worker = async () => {
      while (!destroyed) {
        const at = cursor++;
        if (at >= order.length) return;
        const i = order[at];
        try {
          const resp = await fetch(frameUrl(i), { signal: aborter.signal });
          const blob = await resp.blob();
          if (destroyed) return;
          const bmp = await createImageBitmap(blob);
          if (destroyed) {
            bmp.close?.();
            return;
          }
          frames[i] = bmp;
          // if this frame is the one currently on screen, repaint it crisp
          if (i === lastIndex) dirty = true;
        } catch {
          /* a dropped frame just keeps its atlas tile — nothing to recover */
        }
      }
    };
    await Promise.all(
      Array.from({ length: FETCH_CONCURRENCY }, worker)
    );
  }

  function loop(now) {
    if (destroyed) return;
    const dt = Math.min(0.1, lastT ? (now - lastT) / 1000 : 1 / 60);
    lastT = now;

    const p = Math.min(1, Math.max(0, getProgress()));
    const target = p * (FRAME_COUNT - 1);
    if (smoothF < 0) {
      smoothF = target; // first paint: land on position, don't ease in from 0
    } else {
      smoothF += (target - smoothF) * (1 - Math.exp(-dt * 11));
      if (Math.abs(target - smoothF) < 0.004) smoothF = target; // settle
    }

    const i = Math.round(smoothF);
    if (i !== lastIndex || dirty) {
      if (paintFrame(i)) {
        lastIndex = i;
        dirty = false;
      }
    }

    onStep?.(dt);
    raf = requestAnimationFrame(loop);
  }

  sizeCanvas();
  // ResizeObserver, not just a window listener: it fires on the initial layout
  // too, which is what recovers the 0x0 case above, and it tracks the element's
  // own box rather than assuming it always matches the viewport.
  const ro = new ResizeObserver(sizeCanvas);
  ro.observe(canvas);
  window.addEventListener("resize", sizeCanvas);

  // Reduced motion: fetch nothing, decode nothing, run nothing. The preloaded
  // poster (the resting pose, identical to frame 0) is the whole experience.
  if (!reduced) {
    raf = requestAnimationFrame(loop);
    loadAtlas()
      .then(() => !destroyed && loadFrames())
      .catch(() => {
        /* offline or blocked: the poster holds, and so does the layout */
      });
  }

  return {
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener("resize", sizeCanvas);
      aborter.abort();
      atlas?.close?.();
      atlas = null;
      for (const f of frames) f?.close?.();
      frames.length = 0;
      canvas.style.opacity = "0";
    },
  };
}
