// The real flower — the portfolio's own filmed lotus bloom, decoded once
// into ImageBitmaps (same strided-seek approach as the cover's scrubber in
// src/lotus.js) and served to WebGL as a single texture whose frame follows
// `progress`. Filmed footage is the one thing a browser can show that is
// photoreal by construction; the pond drives it with light instead of a
// scrollbar.
// the clip is edited footage: an open-flower beauty shot first, then the
// bud-to-bloom take. progress drives only the bloom segment.
const SEG_IN = 0.36;
const SEG_OUT = 0.97;

export function createFlowerTexture(gl, url, { count = 44, width = 960 } = {}) {
  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 2, 2, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  let frames = new Array(count);
  let aspect = 16 / 9;
  let uploaded = -1;
  let anyReady = false;
  let destroyed = false;

  function nearest(idx) {
    if (frames[idx]) return idx;
    for (let d = 1; d < count; d++) {
      if (frames[idx - d]) return idx - d;
      if (frames[idx + d]) return idx + d;
    }
    return -1;
  }

  async function extract() {
    let objectUrl = null;
    const src = document.createElement("video");
    src.muted = true;
    src.playsInline = true;
    src.preload = "auto";
    try {
      const resp = await fetch(url);
      const blob = await resp.blob();
      objectUrl = URL.createObjectURL(blob);
      src.src = objectUrl;
      await new Promise((res, rej) => {
        src.onloadedmetadata = () => res();
        src.onerror = () => rej(new Error("metadata"));
        setTimeout(() => rej(new Error("timeout")), 12000);
      });
      aspect = src.videoWidth / src.videoHeight;
      const capOpts = {
        resizeWidth: width,
        resizeHeight: Math.round((width * src.videoHeight) / src.videoWidth),
        resizeQuality: "high",
      };
      const t0 = src.duration * SEG_IN;
      const step = (src.duration * (SEG_OUT - SEG_IN)) / (count - 1);
      // strided order: coarse coverage first, then refinement
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
      for (const i of order) {
        if (destroyed) return;
        src.currentTime = t0 + i * step;
        await new Promise((res) => {
          const on = () => {
            src.removeEventListener("seeked", on);
            res();
          };
          src.addEventListener("seeked", on);
          setTimeout(res, 3000);
        });
        try {
          const bmp = await createImageBitmap(src, capOpts);
          if (destroyed) {
            bmp.close?.();
            return;
          }
          frames[i] = bmp;
          anyReady = true;
          uploaded = -1; // coverage improved: allow a repaint of the same index
        } catch {
          /* skip a bad frame */
        }
      }
    } catch {
      /* footage unavailable — the pond stays waterbound, nothing crashes */
    } finally {
      src.removeAttribute("src");
      src.load?.();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
  }
  extract();

  return {
    get aspect() {
      return aspect;
    },
    get ready() {
      return anyReady;
    },
    texture: tex,
    // uploads the frame for `progress` if it changed; returns true when the
    // texture holds something drawable
    update(progress) {
      if (!anyReady) return false;
      const idx = nearest(
        Math.round(Math.min(1, Math.max(0, progress)) * (count - 1))
      );
      if (idx < 0) return false;
      if (idx !== uploaded) {
        uploaded = idx;
        gl.bindTexture(gl.TEXTURE_2D, tex);
        // (UNPACK_FLIP_Y is ignored for ImageBitmap sources — the composite
        // shader flips v instead)
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, frames[idx]);
      }
      return true;
    },
    dispose() {
      destroyed = true;
      gl.deleteTexture(tex);
      frames.forEach((f) => f && f.close?.());
      frames = [];
    },
  };
}
