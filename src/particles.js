// A field of slow-drifting white particles over the lotus, matching the
// reference hero's starfield. Framework-free so it lives outside React's
// render cycle.
//
// This does NOT own a requestAnimationFrame loop. It exposes step(dt) and the
// lotus scrubber drives it, so the cover runs one rAF instead of two competing
// ones — two loops means two independent wake-ups per frame and no ordering
// guarantee between the scrub paint and the particle paint.
//
// Drawing is batched. The naive version issued one beginPath/arc/fill per
// particle (~170 of them at 1080p) and rebuilt an `rgba(...)` STRING for each,
// every frame — ~170 draw calls and ~170 string allocations per frame, all on
// the main thread, competing with the scrub. Opacity never changes after
// build, so particles are bucketed by it once and each bucket is emitted as a
// SINGLE path with one fill: ~4 draw calls per frame, zero allocation.
const OPACITY_BUCKETS = 4;
const TAU = Math.PI * 2;

export function createParticles(canvas) {
  const ctx = canvas.getContext("2d", { alpha: true });

  let buckets = [];
  let w = 0;
  let h = 0;

  function build() {
    // The old version set canvas.width from innerWidth, ignoring DPR entirely,
    // so the field was drawn at 1x and stretched — soft dots on every retina
    // screen. Capped at 1.5 to match the lotus canvas: fill cost scales with
    // the square of this.
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    const cssW = canvas.clientWidth || window.innerWidth;
    const cssH = canvas.clientHeight || window.innerHeight;
    // layout hasn't happened yet — building at 0 would leave an empty field
    // that only a later resize could fix. The observer calls us back.
    if (cssW < 1 || cssH < 1) return;
    w = Math.round(cssW * dpr);
    h = Math.round(cssH * dpr);
    canvas.width = w;
    canvas.height = h;
    ctx.fillStyle = "#ffffff"; // set once; only globalAlpha varies per bucket

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
        size: (Math.random() * 1.5 + 0.5) * dpr,
      });
    }
  }

  function step(dt) {
    ctx.clearRect(0, 0, w, h);
    for (const bucket of buckets) {
      if (!bucket.items.length) continue;
      ctx.globalAlpha = bucket.alpha;
      ctx.beginPath();
      for (const p of bucket.items) {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.x < 0) p.x = w;
        else if (p.x > w) p.x = 0;
        if (p.y < 0) p.y = h;
        else if (p.y > h) p.y = 0;
        // moveTo before each arc, or the subpaths chain together into lines
        ctx.moveTo(p.x + p.size, p.y);
        ctx.arc(p.x, p.y, p.size, 0, TAU);
      }
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  build();
  step(0); // paint once so the field is there before the first tick
  // fires on the initial layout as well as later resizes, so a canvas that
  // wasn't laid out yet at mount still gets built (see the guard in build)
  const ro = new ResizeObserver(() => {
    build();
    step(0);
  });
  ro.observe(canvas);
  window.addEventListener("resize", build);

  return {
    step,
    destroy() {
      ro.disconnect();
      window.removeEventListener("resize", build);
      buckets = [];
    },
  };
}
