// A shared description of where the important things sit, recomputed on resize.
// Modules hold a reference to one PondLayout object (mutated in place) so the
// water knows where to paint the moon's reflection, the sky knows where the
// horizon is, and so on — without any module reaching into another.

export interface PondLayout {
  w: number;
  h: number;
  /** Top of the water plane, in virtual pixels. */
  waterlineY: number;
  /** Where the far scenery meets the sky. */
  horizonY: number;
  /**
   * The lowest y anything the player needs to see or tap may occupy: the dock
   * floats over the bottom of every world, and the pond's canvas runs edge to
   * edge under it. Bottom-CENTRE, which is exactly where the hero lily pad sits.
   */
  dockSafeY: number;
  moon: { x: number; y: number; r: number };
}

/**
 * The dock's own height in CSS px: 1.9rem clear of the bottom (30.4) + a 46px
 * tile + 0.4rem padding top and bottom (12.8) = 89.2, rounded up for air.
 * Over-reserving is harmless — it only ever lifts things — and the mobile dock
 * is shorter still, so this is a safe ceiling for both.
 */
const DOCK_CSS_PX = 96;

export const makePondLayout = (): PondLayout => ({
  w: 1,
  h: 1,
  waterlineY: 1,
  horizonY: 1,
  dockSafeY: 1,
  moon: { x: 0, y: 0, r: 8 },
});

/** Recompute layout in place from the current buffer size. */
export const computePondLayout = (
  out: PondLayout,
  w: number,
  h: number
): void => {
  out.w = w;
  out.h = h;
  out.waterlineY = Math.round(h * 0.55);
  out.horizonY = out.waterlineY;

  // The buffer is winH/pixelSize tall, so `h / window.innerHeight` is 1/pixelSize
  // — which converts the dock's CSS height straight into virtual pixels without
  // this module needing to know what the pixel size actually is.
  const winH = typeof window === "undefined" ? 0 : window.innerHeight;
  const dockVirtual = winH > 0 ? (DOCK_CSS_PX * h) / winH : 0;
  out.dockSafeY = Math.round(h - dockVirtual);

  out.moon.r = Math.max(7, Math.round(h * 0.05));
  out.moon.x = Math.round(w * 0.73);
  out.moon.y = Math.round(h * 0.22);
};
