// A proximity-reactive halftone field: a grid of dots that swell as the pointer
// nears them and fade to nothing further out, with a slow noise shimmer so the
// field is never quite static.
//
// Adapted from a Next/Tailwind/TS snippet. Four things had to change for it to
// be safe here, and each is load-bearing rather than stylistic:
//
//  1. IT IS SCOPED TO ITS OWN BOX, not the window. The original sized the canvas
//     to `window.innerWidth/innerHeight` and read `e.clientX/clientY` straight
//     as canvas coordinates. That is only correct for a full-viewport hero. In a
//     frame partway down a scrolling canvas it would be the wrong size AND the
//     hover response would be offset by the frame's own position on the page.
//  2. IT STOPS. The original's `requestAnimationFrame` loop had no
//     `cancelAnimationFrame` in its cleanup, so every mount leaked a permanent
//     loop — and the design world mounts and unmounts on every route change.
//  3. IT PAUSES WHEN OFF SCREEN. This is one section of a long page; without an
//     IntersectionObserver it would redraw a few thousand arcs a frame while
//     parked somewhere the visitor cannot see.
//  4. IT HONOURS `prefers-reduced-motion` by painting one static, even field
//     rather than running at all.
//
// Coordinates are stored as a flat number array rather than objects: it is a few
// thousand entries redrawn every frame, and this keeps the hot loop free of
// property lookups.
import { useEffect, useRef } from "react";

const TAU = Math.PI * 2;

// how fast the shimmer crawls. The original advanced its noise by FRAME COUNT,
// which silently ran twice as fast on a 120Hz screen as on a 60Hz one; this is
// in seconds, so it looks the same everywhere.
const SHIMMER = 12;

// cheap hash noise — deterministic per position, so a dot's wobble is its own
const noiseAt = (x, y, t) => {
  const n = Math.sin(x * 12.9898 + y * 78.233 + t * SHIMMER) * 43758.5453;
  return n - Math.floor(n);
};

/**
 * @param {object} props
 * @param {string} [props.color]     any canvas fill; alpha included
 * @param {number} [props.dotSize]   grid pitch is half this, max dot diameter 0.72x
 * @param {string} [props.className]
 */
export default function InteractiveDots({
  color = "rgba(244, 114, 182, 0.5)",
  dotSize = 26,
  className = "",
}) {
  const canvasRef = useRef(null);
  // pointer in VIEWPORT coords; converted to canvas-local at paint time
  const pointer = useRef({ x: -99999, y: -99999 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const spacing = dotSize / 2;
    const maxR = (dotSize * 0.72) / 2;

    let raf = 0;
    let running = false;
    let dots = /** @type {number[]} */ ([]);
    let cssW = 0;
    let cssH = 0;
    let reach = 1;
    // cached so the paint loop never forces a layout; refreshed on the events
    // that can actually move this element
    let rect = { left: 0, top: 0 };

    const syncRect = () => {
      const r = canvas.getBoundingClientRect();
      rect = { left: r.left, top: r.top };
    };

    const build = () => {
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      // a degenerate box means layout has not run yet; the ResizeObserver below
      // calls back the moment it has (same guard as the lotus scrubber)
      if (w < 1 || h < 1) return false;
      cssW = w;
      cssH = h;
      // 1.5 not 2: the fill cost scales with the backing store's AREA, and these
      // are soft round shapes where the difference is invisible
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      // the distance at which a dot has shrunk to nothing
      reach = Math.max(w, h) / 2;
      dots = [];
      for (let x = 0; x <= w + spacing; x += spacing) {
        for (let y = 0; y <= h + spacing; y += spacing) dots.push(x, y);
      }
      syncRect();
      return true;
    };

    // reduced motion: one even, quiet field. No loop, no pointer response.
    const paintStatic = () => {
      ctx.clearRect(0, 0, cssW, cssH);
      ctx.fillStyle = color;
      const r = maxR * 0.18;
      for (let i = 0; i < dots.length; i += 2) {
        ctx.beginPath();
        ctx.arc(dots[i], dots[i + 1], r, 0, TAU);
        ctx.fill();
      }
    };

    const paint = (now) => {
      const t = now / 1000;
      ctx.clearRect(0, 0, cssW, cssH);
      // constant for the whole field — setting it per dot was pure overhead
      ctx.fillStyle = color;
      const px = pointer.current.x - rect.left;
      const py = pointer.current.y - rect.top;
      for (let i = 0; i < dots.length; i += 2) {
        const x = dots[i];
        const y = dots[i + 1];
        const dx = px - x;
        const dy = py - y;
        let d = Math.sqrt(dx * dx + dy * dy);
        d *= 0.7 + noiseAt(x, y, t) * 0.5;
        if (d >= reach) continue; // would be zero-radius: skip the arc entirely
        const r = maxR * (1 - d / reach);
        if (r < 0.3) continue; // sub-pixel: costs a fill, shows nothing
        ctx.beginPath();
        ctx.arc(x, y, r, 0, TAU);
        ctx.fill();
      }
      raf = requestAnimationFrame(paint);
    };

    const start = () => {
      if (running || reduced || !dots.length) return;
      running = true;
      raf = requestAnimationFrame(paint);
    };

    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
      raf = 0;
    };

    const onPointer = (e) => {
      pointer.current = { x: e.clientX, y: e.clientY };
    };

    const onResize = () => {
      if (build() && reduced) paintStatic();
    };

    if (build() && reduced) paintStatic();

    // only run while the frame is actually on screen
    const io = new IntersectionObserver(
      ([entry]) => {
        syncRect();
        if (entry.isIntersecting) start();
        else stop();
      },
      { rootMargin: "120px" }
    );
    io.observe(canvas);

    // tracks its own box rather than assuming it follows the window — the frame
    // is in a responsive grid and can change size without the window doing so
    const ro = new ResizeObserver(onResize);
    ro.observe(canvas);

    window.addEventListener("pointermove", onPointer, { passive: true });
    window.addEventListener("scroll", syncRect, { passive: true });
    window.addEventListener("resize", onResize);

    return () => {
      stop();
      io.disconnect();
      ro.disconnect();
      window.removeEventListener("pointermove", onPointer);
      window.removeEventListener("scroll", syncRect);
      window.removeEventListener("resize", onResize);
    };
  }, [color, dotSize]);

  return (
    <canvas
      ref={canvasRef}
      className={`idots${className ? ` ${className}` : ""}`}
      aria-hidden="true"
    />
  );
}
