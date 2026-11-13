// A field of slow-drifting white particles over the lotus, matching the
// reference hero's starfield. Framework-free so it lives outside React's
// render cycle.
//
// This does NOT own a requestAnimationFrame loop. It exposes step(dt) and the
// lotus engine drives it, so the cover runs one rAF instead of two competing
// ones — two loops means two independent wake-ups per frame and no ordering
// guarantee between the scrub paint and the particle paint.
//
// TWO LAYERS. createParticleField is the field itself and touches nothing but
// the canvas it is given, because it normally runs in the cover's worker
// (lotus.worker.js) on an OffscreenCanvas. createParticles is the same field
// with the DOM plumbing — measuring and resize-watching — for when it has to
// run on the page instead.
//
// EVERY DOT IS A BLIT OF A PRE-DRAWN DOT. This is the third way this field has
// been drawn, and the first two are worth knowing about:
//
//   1. one beginPath/arc/fill per particle, with an `rgba(...)` string rebuilt
//      for each — ~170 draw calls and ~170 allocations a frame, on the page.
//   2. one PATH per opacity bucket: every dot of that opacity as a subpath,
//      filled once. Four draw calls and no allocation, which looked like the
//      end of it — from the page's side.
//
// From the GPU's side, (2) was the most expensive thing on the cover. A path
// of forty-odd separate circles scattered across the whole screen is not
// something a GPU can draw directly, so the browser rasterised each one on the
// CPU into a screen-sized mask and UPLOADED IT AS A TEXTURE — four full-screen
// uploads per frame, sixty times a second, for as long as the cover was open.
// Traced (scripts/measure-cover.mjs --gpu --gpu-threads): with the field
// drawing, the GPU thread spent 609ms in texture uploads and 379ms in path
// drawing across a six-second scroll; with it switched off, 132ms and none.
// That thread is the one that puts frames on the screen, so the starfield was
// taking a fifth of it away from the lotus underneath.
//
// A dot is now drawn once, into a small sprite sheet (a few radii, each
// antialiased exactly as an arc would be), and every particle is a drawImage
// of its nearest size. Blits of one texture are the cheapest thing a GPU does:
// the whole field goes out as a single batch, nothing is rasterised and
// nothing is uploaded after the first frame.
const OPACITY_BUCKETS = 4;
const TAU = Math.PI * 2;
// how many dot radii the sheet holds; a particle takes the nearest
const SIZE_STEPS = 6;

// a scratch surface for the sprite sheet, on whichever thread this is
function scratch(w, h) {
  if (typeof OffscreenCanvas !== "undefined") return new OffscreenCanvas(w, h);
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

export function createParticleField(canvas) {
  const ctx = canvas.getContext("2d", { alpha: true });

  let buckets = [];
  let w = 0;
  let h = 0;
  let sheet = null; // the dots, SIZE_STEPS of them in a row
  let cell = 0; // each one's square cell, in backing pixels

  // `dpr` arrives already capped by the caller (1.5, to match the lotus
  // canvas: fill cost scales with the square of it). The first version of this
  // ignored DPR entirely, so the field was drawn at 1x and stretched — soft
  // dots on every retina screen.
  function resize(cssW, cssH, dpr) {
    // layout hasn't happened yet — building at 0 would leave an empty field
    // that only a later resize could fix. The caller's observer tries again.
    if (cssW < 1 || cssH < 1) return;
    w = Math.round(cssW * dpr);
    h = Math.round(cssH * dpr);
    canvas.width = w;
    canvas.height = h;

    // radii run 0.5..2 CSS px, as they always have
    const minR = 0.5 * dpr;
    const maxR = 2 * dpr;
    const radius = (k) => minR + ((maxR - minR) * k) / (SIZE_STEPS - 1);
    cell = Math.ceil(maxR * 2) + 2; // a pixel of air so neighbours never bleed
    const surface = scratch(cell * SIZE_STEPS, cell);
    const sctx = surface.getContext("2d");
    sctx.fillStyle = "#ffffff";
    for (let k = 0; k < SIZE_STEPS; k++) {
      sctx.beginPath();
      sctx.arc(k * cell + cell / 2, cell / 2, radius(k), 0, TAU);
      sctx.fill();
    }
    // a bitmap, where the platform has one: it is uploaded once and is then a
    // texture for good, where a canvas source can be re-read
    sheet =
      "transferToImageBitmap" in surface ? surface.transferToImageBitmap() : surface;

    // density is per CSS pixel, so the count doesn't explode on retina
    const count = Math.floor((cssW * cssH) / 12000);

    buckets = Array.from({ length: OPACITY_BUCKETS }, (_, b) => ({
      // bucket centre: 0.2..0.8, matching the old random range
      alpha: 0.2 + ((b + 0.5) / OPACITY_BUCKETS) * 0.6,
      items: [],
    }));

    for (let i = 0; i < count; i++) {
      const opacity = Math.random();
      const b = Math.min(
        OPACITY_BUCKETS - 1,
        Math.floor(opacity * OPACITY_BUCKETS)
      );
      buckets[b].items.push({
        x: Math.random() * w,
        y: Math.random() * h,
        // velocities are per SECOND now (the old ones were per frame, which
        // silently made the drift speed depend on refresh rate)
        vx: (Math.random() - 0.5) * 18 * dpr,
        vy: (Math.random() - 0.5) * 18 * dpr,
        // which dot on the sheet: the same 0.5..2px spread, in SIZE_STEPS steps
        sx: Math.round(Math.random() * (SIZE_STEPS - 1)) * cell,
      });
    }
    step(0); // paint once so the field is there before the first tick
  }

  function step(dt) {
    if (!sheet) return;
    ctx.clearRect(0, 0, w, h);
    const half = cell / 2;
    for (const bucket of buckets) {
      if (!bucket.items.length) continue;
      ctx.globalAlpha = bucket.alpha;
      for (const p of bucket.items) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < 0) p.x = w;
        else if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        else if (p.y > h) p.y = 0;
        ctx.drawImage(sheet, p.sx, 0, cell, cell, p.x - half, p.y - half, cell, cell);
      }
    }
    ctx.globalAlpha = 1;
  }

  return {
    resize,
    step,
    destroy() {
      buckets = [];
      sheet?.close?.();
      sheet = null;
    },
  };
}

// the same field, run on the page: it measures its own canvas and follows it
export function createParticles(canvas) {
  const field = createParticleField(canvas);
  const measure = () =>
    field.resize(
      canvas.clientWidth || window.innerWidth,
      canvas.clientHeight || window.innerHeight,
      Math.min(window.devicePixelRatio || 1, 1.5)
    );
  measure();
  // fires on the initial layout as well as later resizes, so a canvas that
  // wasn't laid out yet at mount still gets built (see the guard in resize)
  const ro = new ResizeObserver(measure);
  ro.observe(canvas);

  return {
    step: field.step,
    destroy() {
      ro.disconnect();
      field.destroy();
    },
  };
}
