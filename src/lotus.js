// Smooth scroll-scrubbing for the lotus. Seeking a <video> per scroll frame
// stutters because each seek re-runs the decoder. Instead we decode the whole
// clip ONCE into a set of ImageBitmaps, then paint the frame matching scroll
// progress to a canvas — no per-frame seeking, so it tracks the scrollbar at
// any speed. While frames are still decoding we fall back to seeking the
// visible <video> (rougher, but responsive), then swap to the canvas.
const isMobile = () => window.matchMedia("(max-width: 719px)").matches;

export function createLotusScrubber(canvas, video, getProgress, videoUrl, opts = {}) {
  // reverse: play the clip end→start across the scroll track. The frame cache
  // makes direction free — we just mirror progress before mapping it to a
  // frame — and the same mirror applies to the <video> fallback seeks.
  const { reverse = false } = opts;
  const ctx = canvas.getContext("2d");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let raf = 0;
  let frames = []; // sparse: filled in strided order, so index != capture order
  let frameCount = 0;
  let ready = false;
  let destroyed = false;
  let lastF = -1; // fractional frame index of the last paint
  let objectUrl = null; // one blob URL feeds BOTH the extractor and the
  // visible fallback <video>, so it must outlive extract(): revoked in destroy
  let aborter = null; // cancels the multi-MB clip download if the scrubber
  // dies while it's in flight (route change, StrictMode's throwaway mount)

  // Temporally smoothed frame position. Wheel scrolls arrive as coarse steps
  // (a tick can jump several frames at once), so mapping scroll → frame
  // directly makes the bloom stutter. The painted position eases toward the
  // live target every rAF instead; time-based, so the ~quarter-second settle
  // feels the same at any refresh rate.
  let smoothF = -1;
  let lastT = 0;

  // nearest captured frame at-or-below / at-or-above i — the cache fills in
  // strided passes, so early on only every 8th/4th slot exists
  function below(i) {
    for (let k = Math.min(i, frameCount - 1); k >= 0; k--) {
      if (frames[k]) return k;
    }
    return -1;
  }
  function above(i) {
    for (let k = Math.max(i, 0); k < frameCount; k++) {
      if (frames[k]) return k;
    }
    return -1;
  }

  function sizeCanvas() {
    // render at the device pixel ratio, capped at 2: the source clip is
    // 1080p, so a larger backing store only inflates per-frame fill cost
    // (two cover-fit draws per paint) without adding real detail
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high"; // context state resets on resize
    lastF = -1; // force a redraw at the new size
  }

  function paint(bmp, alpha) {
    const cw = canvas.width;
    const ch = canvas.height;
    const s = Math.max(cw / bmp.width, ch / bmp.height); // object-fit: cover
    const dw = bmp.width * s;
    const dh = bmp.height * s;
    ctx.globalAlpha = alpha;
    ctx.drawImage(bmp, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
    ctx.globalAlpha = 1;
  }

  function drawBitmap(bmp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    paint(bmp, 1);
  }

  // The fallback <video> is hidden until it sits on a frame the scroll actually
  // asked for. Revealing it earlier flashes the clip's frame 0 — which, played
  // in reverse, is the far END of the arc: the wrong pose. Until then the
  // static poster (the resting pose) holds the stage, already correct.
  //
  // `seeked` is the reliable signal (it means we landed on a frame we asked
  // for, even if the scroll has since moved on); the loop below also reveals
  // on position, which covers a clip that never needs a seek at all.
  function revealVideo() {
    if (video) video.style.opacity = "1";
  }
  video?.addEventListener("seeked", revealVideo, { once: true });

  async function extract() {
    const src = document.createElement("video");
    src.muted = true;
    src.playsInline = true;
    src.preload = "auto";

    try {
      // Load the whole clip into memory as a blob URL. Random/backward seeks
      // on this sparse-keyframe video stall for seconds, but SEQUENTIAL forward
      // seeks over fully-buffered data are fast (~50-170ms each), and seeking
      // is event-driven so it works even when the tab is hidden (unlike
      // requestVideoFrameCallback, which the browser throttles in background).
      aborter = new AbortController();
      const resp = await fetch(videoUrl, { signal: aborter.signal });
      const blob = await resp.blob();
      objectUrl = URL.createObjectURL(blob);
      src.src = objectUrl;
      // The visible fallback <video> drinks from the SAME blob — the clip
      // crosses the network exactly once, and the fallback's seeks become
      // fully-buffered (fast) instead of crawling a cold network stream.
      if (video && !destroyed) video.src = objectUrl;

      await new Promise((res, rej) => {
        src.onloadedmetadata = () => res();
        src.onerror = () => rej(new Error("metadata"));
        setTimeout(() => rej(new Error("metadata timeout")), 12000);
      });

      const mobile = isMobile();
      const count = mobile ? 40 : 54;
      // desktop: capture at the video's NATIVE resolution (crispest the source
      // allows). mobile: downscale with high-quality resampling to bound
      // memory, since a portrait phone crops the landscape frame anyway.
      const capOpts = mobile
        ? {
            resizeWidth: 1280,
            resizeHeight: Math.round(
              (1280 * src.videoHeight) / src.videoWidth
            ),
            resizeQuality: "high",
          }
        : { resizeQuality: "high" };
      const dur = src.duration;
      const step = (dur - 0.05) / (count - 1);
      frameCount = count;
      frames = new Array(count);

      // Capture in a strided order (every 8th, then 4th, 2nd, 1st) so the
      // cache covers the whole bloom coarsely within a second or two, then
      // refines. We reveal the canvas as soon as coverage is broad enough, so
      // the scrub is smooth and native-crisp early instead of after a full,
      // ~15s sequential pass. seeks must still go forward within each pass to
      // stay fast on this sparse-keyframe clip.
      const order = [];
      const seen = new Set();
      const push = (i) => {
        if (!seen.has(i)) {
          seen.add(i);
          order.push(i);
        }
      };
      for (const s of [8, 4, 2, 1]) {
        for (let i = 0; i < count; i += s) push(i);
        // A strided walk from 0 never lands on the final frame (54 frames,
        // stride 8 stops at 48), so it would be captured dead last. Reversed,
        // that frame is the resting pose at the TOP of the page — the first
        // thing anyone sees — so it has to exist in the first coarse pass or
        // the canvas reveals a visibly earlier pose and pops later. Appending
        // it per-pass keeps every pass ascending; later passes dedupe away.
        push(count - 1);
      }

      let captured = 0;
      for (const i of order) {
        if (destroyed) return;
        src.currentTime = i * step;
        await new Promise((res) => {
          const on = () => {
            src.removeEventListener("seeked", on);
            res();
          };
          src.addEventListener("seeked", on);
          setTimeout(res, 3000); // don't hang if one seek stalls
        });
        try {
          const bmp = await createImageBitmap(src, capOpts);
          if (destroyed) {
            bmp.close?.();
            return;
          }
          frames[i] = bmp;
          captured++;
        } catch {
          /* skip a bad frame */
        }

        // reveal once coverage spans the timeline; keep refining after. The
        // opaque canvas simply fades in over the fallback video (we never hide
        // the video via style, which avoids a black gap if a StrictMode remount
        // races the inline styles).
        if (!ready && captured >= Math.min(count, 12)) {
          sizeCanvas();
          ready = true;
          canvas.style.opacity = "1";
        }
        lastF = -1; // repaint with the newly improved coverage
      }
    } catch {
      /* extraction failed — the <video> fallback keeps working */
    } finally {
      src.removeAttribute("src");
      src.load?.();
      // objectUrl stays alive: the visible fallback <video> still reads from
      // it. destroy() revokes it.
    }
  }

  function loop(now) {
    if (destroyed) return;
    const raw = Math.min(1, Math.max(0, getProgress()));
    const p = reverse ? 1 - raw : raw;

    if (ready) {
      const target = p * (frameCount - 1);
      const dt = Math.min(0.1, lastT ? (now - lastT) / 1000 : 1 / 60);
      lastT = now;
      if (smoothF < 0) {
        smoothF = target; // first paint: no ease-in from a stale position
      } else {
        smoothF += (target - smoothF) * (1 - Math.exp(-dt * 11));
        // snap when settled so the loop stops repainting between scrolls
        if (Math.abs(target - smoothF) < 0.003) smoothF = target;
      }
      const f = smoothF;
      if (Math.abs(f - lastF) > 0.003) {
        // paint the single nearest CAPTURED frame, flat. We used to crossfade
        // the two neighbours for sub-frame glide, but blending two frames of
        // a moving flower reads as motion blur — the scrub looked soft the
        // whole way down. Crisp frames + the temporal ease above is enough.
        const lo = below(Math.floor(f));
        const hi = above(Math.ceil(f));
        let pick = -1;
        if (lo >= 0 && hi >= 0) pick = f - lo <= hi - f ? lo : hi;
        else if (lo >= 0 || hi >= 0) pick = lo >= 0 ? lo : hi;
        if (pick >= 0) {
          lastF = f;
          drawBitmap(frames[pick]);
        }
      }
    } else if (
      video &&
      video.readyState >= 1 && // metadata is enough to start seeking
      !video.seeking &&
      Number.isFinite(video.duration)
    ) {
      // fallback: seek the visible video until the frame cache is ready
      const target = p * (video.duration - 0.05);
      if (Math.abs(video.currentTime - target) > 0.03) {
        try {
          video.currentTime = target;
        } catch {
          /* not seekable yet */
        }
      } else if (video.readyState >= 2) {
        // already on the requested frame, with pixels to show it: safe to
        // reveal. Covers a clip that never needs a seek (forward at rest),
        // which the `seeked` listener alone would hide forever.
        revealVideo();
      }
    }
    raf = requestAnimationFrame(loop);
  }

  sizeCanvas();
  window.addEventListener("resize", sizeCanvas);

  if (!reduced) {
    raf = requestAnimationFrame(loop);
    extract();
  }
  // reduced motion: do NOTHING — no clip download, no decoding, no scrubbing.
  // The static poster (the clip's resting pose, rendered by the Cover) is the
  // whole experience, and the visitor saves the multi-MB video entirely.

  return {
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", sizeCanvas);
      frames.forEach((f) => f.close?.());
      frames = [];
      // fall back to the poster/video so a StrictMode remount never shows a
      // blank (revealed) canvas before its own frames are ready
      if (canvas) canvas.style.opacity = "0";
      aborter?.abort();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    },
  };
}
