// The pond's eye — MediaPipe HandLandmarker, fully in-browser. The wasm
// runtime and the model are vendored under public/ (same rule as the lotus
// video: no external URLs at runtime), and everything here is lazy: nothing
// downloads until the visitor says "let it look". No frame ever leaves the
// machine.
//
// sample() returns palm points in screen uv (x right, y UP, mirrored so the
// image behaves like a mirror), smoothed, with a rough speed.
const WASM_PATH = import.meta.env.BASE_URL + "mediapipe/wasm";
const MODEL_PATH = import.meta.env.BASE_URL + "models/hand_landmarker.task";

const DETECT_MS = 38; // ~26 fps of detection, decoupled from render
const STALE_MS = 350;
const PALM = [0, 5, 9, 13, 17]; // wrist + finger MCPs = a stable palm centre

export async function createHands(video) {
  const stream = await navigator.mediaDevices.getUserMedia({
    video: { width: { ideal: 640 }, height: { ideal: 480 }, facingMode: "user" },
    audio: false,
  });
  let landmarker = null;
  try {
    video.srcObject = stream;
    await video.play();

    const { FilesetResolver, HandLandmarker } = await import("@mediapipe/tasks-vision");
    const fileset = await FilesetResolver.forVisionTasks(WASM_PATH);
    const options = (delegate) => ({
      baseOptions: { modelAssetPath: MODEL_PATH, delegate },
      numHands: 2,
      runningMode: "VIDEO",
    });
    try {
      landmarker = await HandLandmarker.createFromOptions(fileset, options("GPU"));
    } catch {
      landmarker = await HandLandmarker.createFromOptions(fileset, options("CPU"));
    }
  } catch (err) {
    for (const t of stream.getTracks()) t.stop();
    video.srcObject = null;
    throw err;
  }

  let tracked = [];
  let lastDetect = 0;

  function sample() {
    const now = performance.now();
    if (now - lastDetect >= DETECT_MS && video.readyState >= 2) {
      const dt = Math.min(now - lastDetect, 100) / 1000;
      lastDetect = now;
      let res = null;
      try {
        res = landmarker.detectForVideo(video, now);
      } catch {
        /* a dropped frame is fine */
      }
      const found = [];
      if (res && res.landmarks) {
        for (const marks of res.landmarks) {
          let x = 0;
          let y = 0;
          for (const i of PALM) {
            x += marks[i].x;
            y += marks[i].y;
          }
          // mirror x (selfie), flip y (MediaPipe is y-down, the pond is y-up)
          found.push({ x: 1 - x / PALM.length, y: 1 - y / PALM.length });
        }
      }
      // nearest-match against last frame so smoothing follows the same hand
      const next = [];
      let pool = tracked;
      for (const f of found) {
        let best = null;
        let bd = Infinity;
        for (const t of pool) {
          const d = (t.x - f.x) ** 2 + (t.y - f.y) ** 2;
          if (d < bd) {
            bd = d;
            best = t;
          }
        }
        if (best && bd < 0.09) {
          pool = pool.filter((t) => t !== best);
          const x = best.x + (f.x - best.x) * 0.5;
          const y = best.y + (f.y - best.y) * 0.5;
          next.push({ x, y, speed: Math.hypot(x - best.x, y - best.y) / Math.max(dt, 0.016), t: now });
        } else {
          next.push({ x: f.x, y: f.y, speed: 0, t: now });
        }
      }
      tracked = next;
    }
    return tracked.filter((t) => now - t.t < STALE_MS);
  }

  function stop() {
    try {
      if (landmarker) landmarker.close();
    } catch {
      /* ignore */
    }
    for (const t of stream.getTracks()) t.stop();
    video.srcObject = null;
  }

  return { sample, stop };
}
