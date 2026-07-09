// Smooth scroll-scrubbing for the lotus. Seeking a <video> per scroll frame
// stutters because each seek re-runs the decoder. Instead we decode the whole
// clip ONCE into a set of ImageBitmaps, then paint the frame matching scroll
// progress to a canvas — no per-frame seeking, so it tracks the scrollbar at
// any speed. While frames are still decoding we fall back to seeking the
// visible <video> (rougher, but responsive), then swap to the canvas.
const isMobile = () => window.matchMedia("(max-width: 719px)").matches;

export function createLotusScrubber(canvas, video, getProgress, videoUrl) {
  const ctx = canvas.getContext("2d");
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  let raf = 0;
  let frames = []; // sparse: filled in strided order, so index != capture order
  let frameCount = 0;
  let ready = false;
  let destroyed = false;
  let lastIdx = -1;

  // nearest captured frame to idx (frames fill in progressively)
  function frameAt(idx) {
    if (frames[idx]) return frames[idx];
    for (let d = 1; d < frameCount; d++) {
      if (frames[idx - d]) return frames[idx - d];
      if (frames[idx + d]) return frames[idx + d];
    }
    return null;
  }

  function sizeCanvas() {
    // render at the full device pixel ratio (cap 2.5) so the canvas backing
    // store matches the screen and the lotus stays crisp on retina displays
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const w = canvas.clientWidth || window.innerWidth;
    const h = canvas.clientHeight || window.innerHeight;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high"; // context state resets on resize
    lastIdx = -1; // force a redraw at the new size
  }

  function drawBitmap(bmp) {
    const cw = canvas.width;
    const ch = canvas.height;
    const s = Math.max(cw / bmp.width, ch / bmp.height); // object-fit: cover
    const dw = bmp.width * s;
    const dh = bmp.height * s;
    ctx.clearRect(0, 0, cw, ch);
    ctx.drawImage(bmp, (cw - dw) / 2, (ch - dh) / 2, dw, dh);
  }

  async function extract() {
    let objectUrl = null;
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
      const resp = await fetch(videoUrl);
      const blob = await resp.blob();
      objectUrl = URL.createObjectURL(blob);
      src.src = objectUrl;

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
      for (const s of [8, 4, 2, 1]) {
        for (let i = 0; i < count; i += s) {
          if (!seen.has(i)) {
            seen.add(i);
            order.push(i);
          }
        }
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
        lastIdx = -1; // repaint with the newly improved coverage
      }
    } catch {
      /* extraction failed — the <video> fallback keeps working */
    } finally {
      src.removeAttribute("src");
      src.load?.();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
  }

  function loop() {
    if (destroyed) return;
    const p = Math.min(1, Math.max(0, getProgress()));

    if (ready) {
      const idx = Math.round(p * (frameCount - 1));
      if (idx !== lastIdx) {
        const bmp = frameAt(idx);
        if (bmp) {
          lastIdx = idx;
          drawBitmap(bmp);
        }
      }
    } else if (
      video &&
      video.readyState >= 2 &&
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
      }
    }
    raf = requestAnimationFrame(loop);
  }

  sizeCanvas();
  window.addEventListener("resize", sizeCanvas);

  if (reduced) {
    // reduced motion: one static mid-bloom frame, no scrubbing or decoding
    const settle = () => {
      if (video && Number.isFinite(video.duration)) {
        video.currentTime = video.duration * 0.6;
      }
    };
    if (video && video.readyState >= 1) settle();
    else video?.addEventListener("loadedmetadata", settle, { once: true });
  } else {
    raf = requestAnimationFrame(loop);
    extract();
  }

  return {
    destroy() {
      destroyed = true;
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", sizeCanvas);
      frames.forEach((f) => f.close?.());
      frames = [];
      // fall back to the video so a StrictMode remount never shows a blank
      // (revealed) canvas before its own frames are ready
      if (canvas) canvas.style.opacity = "0";
    },
  };
}
