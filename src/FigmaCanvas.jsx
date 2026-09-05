// A PROJECT'S PAGE OF THE FIGMA FILE — an actual canvas, not a gallery.
//
// The screens used to sit in the case-study window as a horizontal rail, which
// was the wrong home: a rail is a presentation of screens, and what these are
// is a Figma page. So they live on one, at the coordinates the real file gives
// them (figma-pages.js), and the canvas behaves the way a canvas behaves —
// scroll to pan, ctrl/⌘-scroll or the buttons to zoom, click a frame to select
// it, and the layers and properties panels follow the selection.
//
// The one thing that does NOT scale is the chrome. Figma draws frame names,
// selection rings and dimension pills at a constant screen size however far you
// zoom out, because they are annotations on the canvas rather than things on it.
// Every one of those is sized in `calc(<px> / var(--fc-s))`, which is what makes
// a 12px label stay 12px at 8% zoom — see figma-canvas.css.
import { useCallback, useEffect, useRef, useState } from "react";
import { pageBounds } from "./figma-pages.js";

const MIN_Z = 0.02;
const MAX_Z = 2;
const PAD = 120; // Figma units of air around the page when fitted

/** clamp, because a zoom of 0 divides by zero in every `calc()` below */
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/**
 * THE WORLD OPENS UNDER A TRANSFORM, so a measured rect is a LIE for a while.
 *
 * A world unfolds out of its dock icon by scaling from ~0.3 (App.jsx), and an
 * ancestor transform scales getBoundingClientRect with it — the first fit ran
 * against a 297x258 "viewport" and settled the page at 6% instead of 21%. A
 * ResizeObserver never corrects it either, because a transform is not a resize.
 *
 * offsetWidth/offsetHeight are layout values and ignore ancestor transforms, so
 * they are the honest size. `outerScale` recovers the transform itself, for the
 * two places that legitimately work in client pixels: the pointer position a
 * zoom is centred on, and a drag's delta.
 */
const layoutSize = (el) => ({ width: el.offsetWidth, height: el.offsetHeight });
const outerScale = (el) => {
  const w = el.offsetWidth;
  const k = w ? el.getBoundingClientRect().width / w : 1;
  return k > 0.01 ? k : 1;
};

export default function FigmaCanvas({ page, activeNode, onSelect, focusAt }) {
  const viewport = useRef(null);
  const [view, setView] = useState({ z: 0.1, x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  // has anyone moved the view yet? see the ResizeObserver below
  const touched = useRef(false);
  // the live view, readable from a gesture handler without re-binding it
  const viewRef = useRef(view);
  viewRef.current = view;
  const bounds = pageBounds(page);

  /** the zoom and offset that centre the whole page in the viewport */
  const fit = useCallback(() => {
    touched.current = true;
    const el = viewport.current;
    if (!el) return;
    const { width, height } = layoutSize(el);
    if (!width || !height) return;
    const z = clamp(
      Math.min(width / (bounds.w + PAD * 2), height / (bounds.h + PAD * 2)),
      MIN_Z,
      1
    );
    setView({
      z,
      x: (width - bounds.w * z) / 2 - bounds.x0 * z,
      y: (height - bounds.h * z) / 2 - bounds.y0 * z,
    });
  }, [bounds.w, bounds.h, bounds.x0, bounds.y0]);

  /**
   * The view a page OPENS at: fitted to the width, pinned to the top.
   *
   * Not the same as Fit, and deliberately. Regis is 4520 x 3900 and its width
   * is the binding constraint, so the two agree — but NextG is a 1440-wide
   * column 6347 tall, and fitting all of it lands you at 14%, looking at nine
   * frames too small to read. Fitting the width opens it at 60%, which is where
   * you would be if you opened the real file and pressed nothing. Fit is still
   * Fit; it is on the button, where someone asking for the whole page can find
   * it.
   */
  const openAt = useCallback(() => {
    const el = viewport.current;
    if (!el) return;
    const { width, height } = layoutSize(el);
    if (!width || !height) return;
    const z = clamp(width / (bounds.w + PAD * 2), MIN_Z, 1);
    setView({
      z,
      x: (width - bounds.w * z) / 2 - bounds.x0 * z,
      // top-aligned rather than centred, with the same air above the page that
      // the width-fit leaves at its sides
      y: PAD * z - bounds.y0 * z,
    });
  }, [bounds.w, bounds.x0, bounds.y0]);

  // Open the page, and re-open it if the page changes. A ResizeObserver rather
  // than a window listener: the viewport also changes width when the properties
  // panel appears at a breakpoint, which `resize` never fires for.
  //
  // The observer only RE-fits while the view is untouched. Re-fitting on every
  // resize would yank the canvas back to the top the moment someone zoomed in
  // and their browser fired a resize for any reason at all.
  useEffect(() => {
    touched.current = false;
    openAt();
    const el = viewport.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      if (!touched.current) openAt();
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [openAt, page.slug]);

  /** zoom about a point in viewport space, so the pixel under it stays put */
  const zoomAt = useCallback((factor, px, py) => {
    touched.current = true;
    setView((v) => {
      const z = clamp(v.z * factor, MIN_Z, MAX_Z);
      const k = z / v.z;
      return { z, x: px - (px - v.x) * k, y: py - (py - v.y) * k };
    });
  }, []);

  // Figma's own wheel contract: plain wheel pans, ctrl/⌘ wheel zooms. The
  // listener is attached by hand rather than via onWheel because React's
  // synthetic wheel handler is passive, and a passive listener cannot
  // preventDefault — without which ctrl+wheel is the BROWSER's page zoom and
  // the canvas never sees it.
  useEffect(() => {
    const el = viewport.current;
    if (!el) return;
    const onWheel = (e) => {
      e.preventDefault();
      const r = el.getBoundingClientRect();
      const k = outerScale(el);
      if (e.ctrlKey || e.metaKey) {
        zoomAt(
          Math.exp(-e.deltaY * 0.01),
          (e.clientX - r.left) / k,
          (e.clientY - r.top) / k
        );
      } else {
        touched.current = true;
        setView((v) => ({ ...v, x: v.x - e.deltaX / k, y: v.y - e.deltaY / k }));
      }
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, [zoomAt]);

  // ---- pan and pinch ----
  // One pointer pans; two pinch. Both live in the same pointer bookkeeping
  // because `touch-action: none` on the viewport turns the browser's own pan
  // and pinch OFF — which is the only way a drag can pan a canvas, and which
  // makes the pinch this component's debt to pay. Without it a phone can only
  // zoom by the two buttons, on a surface whose entire vocabulary is the
  // gesture.
  const pointers = useRef(new Map());
  const gesture = useRef(null);

  const gap = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const mid = (a, b) => ({ x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 });

  const down = (e) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    touched.current = true;
    const el = viewport.current;
    // BOOKKEEPING FIRST, CAPTURE SECOND. setPointerCapture throws NotFoundError
    // for a pointer the browser does not consider active, and when it threw
    // ahead of the Map write the whole gesture never registered — a pinch did
    // nothing at all while a pan, which happened to survive, looked fine.
    // Capture is an optimisation (it keeps a drag alive past the edge); losing
    // it must not cost the gesture.
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    startGesture();
    setDragging(true);
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      /* not capturable — the pointer handlers below still work */
    }
  };

  /** re-read the gesture's origin — called whenever a pointer joins or leaves,
      so adding a second finger does not make the canvas jump */
  const startGesture = () => {
    const el = viewport.current;
    const pts = [...pointers.current.values()];
    if (!el || pts.length === 0) return (gesture.current = null);
    const r = el.getBoundingClientRect();
    const k = outerScale(el);
    const c = pts.length >= 2 ? mid(pts[0], pts[1]) : pts[0];
    gesture.current = {
      k,
      // in viewport space, which is what zoomAt and the pan maths both use
      cx: (c.x - r.left) / k,
      cy: (c.y - r.top) / k,
      dist: pts.length >= 2 ? gap(pts[0], pts[1]) : 0,
      view: viewRef.current,
    };
  };

  const move = (e) => {
    if (!pointers.current.has(e.pointerId)) return;
    pointers.current.set(e.pointerId, { x: e.clientX, y: e.clientY });
    const g = gesture.current;
    const el = viewport.current;
    if (!g || !el) return;
    const pts = [...pointers.current.values()];
    const r = el.getBoundingClientRect();
    const c = pts.length >= 2 ? mid(pts[0], pts[1]) : pts[0];
    const cx = (c.x - r.left) / g.k;
    const cy = (c.y - r.top) / g.k;
    // the pinch's scale factor, or 1 while a single finger only pans
    const f =
      pts.length >= 2 && g.dist > 0 ? gap(pts[0], pts[1]) / g.dist : 1;
    const z = clamp(g.view.z * f, MIN_Z, MAX_Z);
    const s = z / g.view.z;
    setView({
      z,
      // the point under the fingers stays under the fingers, and the whole
      // thing follows their midpoint
      x: cx - (g.cx - g.view.x) * s,
      y: cy - (g.cy - g.view.y) * s,
    });
  };

  const up = (e) => {
    pointers.current.delete(e.pointerId);
    try {
      viewport.current?.releasePointerCapture(e.pointerId);
    } catch {
      /* never captured, or already gone */
    }
    if (pointers.current.size === 0) {
      gesture.current = null;
      setDragging(false);
    } else {
      startGesture(); // lifting one of two fingers must not jump the canvas
    }
  };

  /** put one frame in the middle of the viewport, at a readable zoom */
  const focus = useCallback(
    (frame) => {
      const el = viewport.current;
      if (!el) return;
      touched.current = true;
      const { width, height } = layoutSize(el);
      const z = clamp(
        Math.min(width / (frame.w * 1.25), height / (frame.h * 1.25)),
        MIN_Z,
        MAX_Z
      );
      setView({
        z,
        x: width / 2 - (frame.x + frame.w / 2) * z,
        y: height / 2 - (frame.y + frame.h / 2) * z,
      });
    },
    []
  );

  // SELECTING FROM THE PANEL MOVES THE CANVAS; CLICKING A FRAME MUST NOT.
  // Both set the same selection, so the difference cannot be read from the
  // selection itself — `focusAt` is a counter the parent bumps only for a
  // panel-driven pick. Without the distinction one of the two is always wrong:
  // either the panel highlights a frame that is somewhere off screen, or the
  // canvas lurches out from under the pointer you just clicked with.
  const lastFocus = useRef(focusAt);
  useEffect(() => {
    if (focusAt === lastFocus.current) return;
    lastFocus.current = focusAt;
    const f = page.frames.find((n) => n.node === activeNode);
    if (f) focus(f);
  }, [focusAt, activeNode, page.frames, focus]);

  /** the buttons zoom about the middle of the view, which is where you look */
  const zoomMid = (factor) => () => {
    const el = viewport.current;
    zoomAt(factor, (el?.offsetWidth || 0) / 2, (el?.offsetHeight || 0) / 2);
  };

  const pct = Math.round(view.z * 100);

  // ONLY MOUNT THE IMAGES YOU CAN NEARLY SEE. Layover is forty-five frames and
  // 2.3 MB, and `loading="lazy"` is no help on a canvas that pans by transform
  // rather than scrolling (see the note on the img below). The frame BOXES all
  // render — they are empty divs, and they carry the selection ring and the
  // name, which must stay correct for frames off screen — but the <img> inside
  // one only mounts when its rect is within a screen's worth of the viewport.
  const vp = viewport.current;
  const vw = vp?.offsetWidth || 0;
  const vh = vp?.offsetHeight || 0;
  const near = (f) => {
    if (!vw) return true; // first paint, before the viewport is measured
    const l = view.x + f.x * view.z;
    const t = view.y + f.y * view.z;
    return (
      l < vw + vw * 0.6 &&
      l + f.w * view.z > -vw * 0.6 &&
      t < vh + vh * 0.6 &&
      t + f.h * view.z > -vh * 0.6
    );
  };

  return (
    <div className="fc">
      {/* which page you are on, and the way back to the portfolio page — the
          Pages list says the same thing, but on a phone that list is a sheet
          you have to open, and a canvas with no label is just a grey field. */}
      <div className="fc-head">
        <a href="#/design">design</a>
        <span className="fc-head-sep" aria-hidden="true">/</span>
        <b>{page.name}</b>
        <span className="fc-head-count">{page.frames.length} frames</span>
      </div>

      <div
        className={`fc-viewport${dragging ? " is-dragging" : ""}`}
        ref={viewport}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        role="application"
        aria-label={`${page.name} — Figma canvas. Drag to pan, ctrl and scroll to zoom.`}
      >
        <div
          className={`fc-canvas${view.z < 0.2 ? " is-far" : ""}`}
          style={{
            // `--fc-s` is read back by every annotation in the CSS to divide
            // its own size by, which is how the chrome stays screen-sized.
            "--fc-s": view.z,
            transform: `translate3d(${view.x}px, ${view.y}px, 0) scale(${view.z})`,
          }}
        >
          {/* HER SECTION HEADERS, as text on the canvas.
              These scale WITH the page rather than against it — unlike the frame
              names and the selection chrome, which are Figma's annotations, this
              is her own writing on her own page, and it belongs to the artwork.
              Sizes come from the text nodes' measured heights in the file: the
              number box is 23 tall, the title 74, the line under it 32. */}
          {(page.sections || []).map((sec) => (
            <div className="fc-sec" key={sec.num} style={{ left: sec.x, top: sec.y }}>
              <span className="fc-sec-n">{sec.num}</span>
              <h2 className="fc-sec-t">{sec.title}</h2>
              <p className="fc-sec-s">{sec.sub}</p>
            </div>
          ))}

          {page.frames.map((f) => {
            const on = f.node === activeNode;
            return (
              <div
                key={f.node}
                className={`fc-frame${on ? " is-selected" : ""}`}
                style={{ left: f.x, top: f.y, width: f.w, height: f.h }}
              >
                <button
                  type="button"
                  className="fc-name"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => onSelect(f.node)}
                >
                  {f.name}
                </button>
                <button
                  type="button"
                  className="fc-hit"
                  onPointerDown={(e) => e.stopPropagation()}
                  onClick={() => onSelect(f.node)}
                  aria-label={f.name}
                  aria-pressed={on}
                >
                  {/* NOT `loading="lazy"`: that decides by intersection with the
                      SCROLLPORT, and this canvas never scrolls — it pans by
                      transform, so ten of twelve frames stayed blank white
                      forever waiting for a scroll event a canvas does not
                      produce. `near()` above does the same job against the
                      canvas's own geometry, which is the thing that actually
                      moves. */}
                  {near(f) && (
                    <img src={f.src} alt={f.alt} decoding="async" draggable="false" />
                  )}
                </button>
                {on && (
                  <>
                    <span className="fc-h fc-h--tl" aria-hidden="true" />
                    <span className="fc-h fc-h--tr" aria-hidden="true" />
                    <span className="fc-h fc-h--bl" aria-hidden="true" />
                    <span className="fc-h fc-h--br" aria-hidden="true" />
                    <span className="fc-dims" aria-hidden="true">
                      {f.w} × {f.h}
                    </span>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="fc-zoom" role="group" aria-label="Zoom">
        <button type="button" onClick={zoomMid(1 / 1.25)} aria-label="Zoom out">
          −
        </button>
        <span aria-live="polite">{pct}%</span>
        <button type="button" onClick={zoomMid(1.25)} aria-label="Zoom in">
          +
        </button>
        <button type="button" className="fc-fit" onClick={fit}>
          Fit
        </button>
      </div>
    </div>
  );
}
