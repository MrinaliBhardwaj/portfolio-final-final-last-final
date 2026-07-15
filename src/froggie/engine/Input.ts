// Pointer input. Tracks the cursor in *internal* (low-res) pixel space and
// exposes edge-triggered click events that systems drain each frame. Kept
// deliberately small; richer interaction lands in the input/interaction phase.

export interface ClickEvent {
  x: number;
  y: number;
  /** ms since the previous click anywhere — lets us detect double-clicks. */
  sincePrev: number;
}

export class Input {
  /** Cursor position in internal pixels. */
  x = 0;
  y = 0;
  /** Normalised cursor offset from screen centre, roughly [-1,1]. */
  nx = 0;
  ny = 0;
  present = false;
  down = false;

  private pending: ClickEvent[] = [];
  private lastClickAt = -Infinity;
  private scale = 1;
  private viewW = 1;
  private viewH = 1;

  constructor(private readonly canvas: HTMLCanvasElement) {
    const c = canvas;
    c.addEventListener("pointermove", this.onMove, { passive: true });
    c.addEventListener("pointerenter", this.onEnter);
    c.addEventListener("pointerleave", this.onLeave);
    c.addEventListener("pointerdown", this.onDown);
    window.addEventListener("pointerup", this.onUp);
    // Touch: keep the page from scrolling/zooming under the canvas.
    c.addEventListener("touchstart", this.onTouch, { passive: false });
  }

  /** Drop the listeners that outlive the canvas (the window ones). Mounted on
   *  a route, a stale Input would otherwise keep answering pointerup forever. */
  dispose(): void {
    const c = this.canvas;
    c.removeEventListener("pointermove", this.onMove);
    c.removeEventListener("pointerenter", this.onEnter);
    c.removeEventListener("pointerleave", this.onLeave);
    c.removeEventListener("pointerdown", this.onDown);
    window.removeEventListener("pointerup", this.onUp);
    c.removeEventListener("touchstart", this.onTouch);
  }

  private onEnter = (): void => {
    this.present = true;
  };

  private onLeave = (): void => {
    this.present = false;
    this.down = false;
  };

  private onUp = (): void => {
    this.down = false;
  };

  private onTouch = (e: TouchEvent): void => {
    e.preventDefault();
  };

  /** Called by the renderer whenever the backing-store size changes. */
  setViewport(scale: number, viewW: number, viewH: number): void {
    this.scale = scale;
    this.viewW = viewW;
    this.viewH = viewH;
  }

  private toInternal(clientX: number, clientY: number): void {
    const r = this.canvas.getBoundingClientRect();
    this.x = (clientX - r.left) / this.scale;
    this.y = (clientY - r.top) / this.scale;
    this.nx = this.viewW ? (this.x / this.viewW) * 2 - 1 : 0;
    this.ny = this.viewH ? (this.y / this.viewH) * 2 - 1 : 0;
  }

  private onMove = (e: PointerEvent): void => {
    this.present = true;
    this.toInternal(e.clientX, e.clientY);
  };

  private onDown = (e: PointerEvent): void => {
    this.toInternal(e.clientX, e.clientY);
    this.down = true;
    const now = performance.now();
    this.pending.push({
      x: this.x,
      y: this.y,
      sincePrev: now - this.lastClickAt,
    });
    this.lastClickAt = now;
  };

  /** Drain queued clicks for this frame. */
  takeClicks(): ClickEvent[] {
    if (this.pending.length === 0) return EMPTY;
    const out = this.pending;
    this.pending = [];
    return out;
  }
}

const EMPTY: ClickEvent[] = [];
