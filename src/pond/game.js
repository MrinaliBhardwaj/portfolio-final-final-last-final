// UNDERTOW — the pond's game loop. Pure state, no DOM, no GL: PondWorld
// feeds it entities (a hand/cursor above the waterline, one below) and it
// returns everything the renderer needs each frame.
//
// The rule of the piece: the reflection disobeys. Lotus B (below the line)
// chases lotus A's *past* — delayed and noise-bent by `disagree`. Holding a
// true mirror between your two hands raises `sync`, which tightens the lag
// until the worlds move as one; hold that agreement and both lotuses bloom.

// fraction of viewport height (from the bottom) where the water ends
export const WATERLINE = 0.44;

const STORE_COUNT = "pond:agreements";
const STORE_MOTES = "pond:motes";
const MOTE_CAP = 48;

const HOLD_SECONDS = 4.2; // full agreement held this long wins
const SYNC_GATE = 0.7; // sync above this fills progress, below drains it
const BLOOM_SECONDS = 3.0;
const AFTERGLOW_SECONDS = 6.0;
const SETTLE_SECONDS = 4.0;
// one-handed visitors in camera mode aren't stranded: after this long with
// only one hand offered, the reflection stirs on its own as a partner
const LONELY_SECONDS = 12.0;

function readStore() {
  let count = 0;
  let motes = [];
  try {
    const n = parseInt(window.localStorage.getItem(STORE_COUNT) || "0", 10);
    if (Number.isFinite(n) && n > 0) count = n;
    const raw = JSON.parse(window.localStorage.getItem(STORE_MOTES) || "[]");
    if (Array.isArray(raw)) {
      motes = raw
        .filter((m) => m && Number.isFinite(m.x) && Number.isFinite(m.h))
        .slice(-MOTE_CAP);
    }
  } catch {
    /* private mode etc — the pond just forgets */
  }
  return { count, motes };
}

function writeStore(count, motes) {
  try {
    window.localStorage.setItem(STORE_COUNT, String(count));
    window.localStorage.setItem(STORE_MOTES, JSON.stringify(motes));
  } catch {
    /* ignore */
  }
}

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const damp = (from, to, rate, dt) => from + (to - from) * (1 - Math.exp(-rate * dt));
const easeInOut = (t) => t * t * (3 - 2 * t);

// cheap deterministic wander (sum of incommensurate sines ≈ smooth noise)
function wander(t, seed) {
  return (
    Math.sin(t * 0.83 + seed * 12.9) * 0.55 +
    Math.sin(t * 1.97 + seed * 5.3) * 0.3 +
    Math.sin(t * 3.31 + seed * 71.7) * 0.15
  );
}

export function createGame({ calm = false } = {}) {
  const stored = readStore();

  const g = {
    // phases: play | blooming | afterglow | settle
    phase: "play",
    phaseT: 0,
    time: 0,
    sync: 0,
    progress: 0,
    disagree: 1,
    bloomFlash: 0,
    burstT: 0,
    agreements: stored.count,
    motes: stored.motes,
    justWon: false, // true for exactly one frame after a win lands
    firstWin: false,
    captionKey: "idle",
    lotusA: { lean: 0, sway: 0, bloom: 0.2 },
    lotusB: { lean: 0, sway: 0, bloom: 0.14 },
    // renderer entities — vec3 style {x, y, on}
    above: { x: 0.5, y: 0.72, on: 0 },
    below: { x: 0.5, y: 0.2, on: 0 },
    ghost: { x: 0.5, y: 0.2, on: 0 },
    belowIsSynth: false,
  };

  // the reflection chases the flower's past: a short ring buffer of A's state
  const HIST = 120;
  const hist = new Float32Array(HIST * 3); // lean, sway, bloom
  let histHead = 0;
  let histFilled = 0;

  // the synthesized partner (pointer mode / lonely-hand fallback)
  const follower = { x: 0.5, y: WATERLINE * 0.5, engaged: false };
  let lonelyT = 0;
  let stillT = 0; // how long the guiding hand has been parked
  const amp = calm ? 0.3 : 1;

  function pushHist(dt) {
    // ~60Hz ring; store every frame, sampling handles variable dt roughly
    hist[histHead * 3] = g.lotusA.lean;
    hist[histHead * 3 + 1] = g.lotusA.sway;
    hist[histHead * 3 + 2] = g.lotusA.bloom;
    histHead = (histHead + 1) % HIST;
    if (histFilled < HIST) histFilled++;
  }

  function sampleHist(delaySeconds, dt) {
    const frames = clamp(Math.round(delaySeconds / Math.max(dt, 1 / 120)), 0, histFilled - 1);
    const idx = (histHead - 1 - frames + HIST * 2) % HIST;
    return [hist[idx * 3], hist[idx * 3 + 1], hist[idx * 3 + 2]];
  }

  function win() {
    g.phase = "blooming";
    g.phaseT = 0;
  }

  function landWin() {
    g.agreements += 1;
    g.firstWin = g.agreements === 1;
    g.motes.push({ x: 0.24 + Math.random() * 0.52, h: Math.random() });
    if (g.motes.length > MOTE_CAP) g.motes.shift();
    writeStore(g.agreements, g.motes);
    g.justWon = true;
  }

  // input: { a: {x,y,speed}|null, b: {x,y,speed}|null, allowSynth, forceMirror }
  function update(dt, input) {
    dt = clamp(dt, 0.001, 0.05);
    g.time += dt;
    g.phaseT += dt;
    g.justWon = false;
    const t = g.time;

    // -------- entities --------
    let a = input.a;
    let b = input.b;
    g.belowIsSynth = false;
    g.aboveIsSynth = false;

    if ((a && !b) || (!a && b)) {
      // a partner on the missing side can be synthesized: always in pointer
      // mode, and in camera mode only after the hand has been alone a while
      lonelyT += dt;
      const maySynth = input.allowSynth || lonelyT > LONELY_SECONDS;
      if (maySynth) {
        const src = a || b;
        const tx = src.x;
        const ty = 2 * WATERLINE - src.y; // the true mirror point
        if (input.forceMirror) {
          follower.x = tx;
          follower.y = ty;
        } else {
          // the reflection wants to be LED, not waited out: a parked hand
          // bores it (it drifts off), a slow steady trace lets it catch up
          const speed = src.speed || 0;
          if (speed < 0.02) stillT += dt;
          else stillT = Math.max(0, stillT - dt * 3);
          const bored = clamp((stillT - 2.5) * 0.5, 0, 1.6);
          const rate = 1 / ((0.12 + 1.05 * (1 - g.sync)) * (1 + bored * 2.2));
          follower.x = damp(follower.x, tx, rate, dt);
          follower.y = damp(follower.y, ty, rate, dt);
          const wob = (0.028 * (1 - g.sync) + 0.03 * bored) * amp * dt * 6;
          follower.x += wander(t, 3) * wob;
          follower.y += wander(t, 9) * wob * 0.75;
        }
        follower.engaged = true;
        const synth = {
          x: follower.x,
          y: a
            ? clamp(follower.y, 0.02, WATERLINE - 0.01)
            : clamp(follower.y, WATERLINE + 0.01, 0.98),
          speed: 0,
        };
        if (a) {
          b = synth;
          g.belowIsSynth = true;
        } else {
          a = synth;
          g.aboveIsSynth = true;
        }
      }
    } else {
      lonelyT = 0;
      follower.engaged = false;
    }

    // -------- sync: how truly the two sides mirror --------
    if (a && b) {
      const mx = a.x;
      const my = 2 * WATERLINE - a.y;
      const err = Math.hypot(b.x - mx, (b.y - my) * 1.4);
      const inst = Math.exp(-((err / 0.1) ** 2));
      g.sync = damp(g.sync, inst, 6, dt);
      // the ghost marks where your second hand should be: it haunts the
      // synthetic side's world, mirroring the real hand
      if (g.aboveIsSynth) {
        g.ghost.x = b.x;
        g.ghost.y = 2 * WATERLINE - b.y;
      } else {
        g.ghost.x = mx;
        g.ghost.y = my;
      }
      g.ghost.on = 1;
    } else {
      g.sync = damp(g.sync, 0, 2.5, dt);
      g.ghost.on = 0;
    }
    g.disagree = damp(g.disagree, 1 - g.sync, 2.5, dt);

    g.above.on = a ? 1 : 0;
    if (a) {
      g.above.x = a.x;
      g.above.y = a.y;
    }
    g.below.on = b ? 1 : 0;
    if (b) {
      g.below.x = b.x;
      g.below.y = b.y;
    }

    // -------- progress & phases --------
    if (g.phase === "play") {
      if (a && b && g.sync > SYNC_GATE) g.progress += dt / HOLD_SECONDS;
      else g.progress -= dt / 2.6;
      g.progress = clamp(g.progress, 0, 1);
      if (g.progress >= 1) win();
      g.bloomFlash = damp(g.bloomFlash, 0, 4, dt);
      g.burstT = 0;
    } else if (g.phase === "blooming") {
      const p = clamp(g.phaseT / BLOOM_SECONDS, 0, 1);
      g.sync = 1;
      g.disagree = damp(g.disagree, 0, 8, dt);
      g.progress = 1;
      // flash peaks early then decays; the burst rides the whole bloom
      g.bloomFlash = Math.exp(-((p - 0.18) ** 2) / 0.02) * 0.9;
      g.burstT = p;
      if (p >= 1) {
        landWin();
        g.phase = "afterglow";
        g.phaseT = 0;
      }
    } else if (g.phase === "afterglow") {
      g.bloomFlash = damp(g.bloomFlash, 0, 2, dt);
      g.burstT = 1;
      if (g.phaseT > AFTERGLOW_SECONDS) {
        g.phase = "settle";
        g.phaseT = 0;
      }
    } else if (g.phase === "settle") {
      g.progress = damp(g.progress, 0, 1.2, dt);
      g.burstT = 1;
      if (g.phaseT > SETTLE_SECONDS) {
        g.phase = "play";
        g.phaseT = 0;
        g.progress = 0;
      }
    }

    // -------- lotus A: alive, and leaning to the offered hand --------
    const sway =
      (0.05 * Math.sin(t * 0.5) + 0.022 * Math.sin(t * 1.37 + 1.3)) * amp;
    g.lotusA.sway = sway;
    const leanTarget = a ? clamp((a.x - 0.5) * 0.55, -0.22, 0.22) : 0;
    g.lotusA.lean = damp(g.lotusA.lean, leanTarget, 3, dt);

    let bloomTarget;
    if (g.phase === "blooming") bloomTarget = easeInOut(clamp(g.phaseT / BLOOM_SECONDS, 0, 1)) * 0.65 + 0.35;
    else if (g.phase === "afterglow") bloomTarget = 1;
    else if (g.phase === "settle") bloomTarget = 0.5;
    else bloomTarget = 0.34 + (a ? 0.1 : 0) + 0.45 * g.progress;
    g.lotusA.bloom = damp(g.lotusA.bloom, bloomTarget, g.phase === "blooming" ? 2.2 : 1.6, dt);

    pushHist(dt);

    // -------- lotus B: the disobedient reflection --------
    const delayed = sampleHist(1.1 * g.disagree, dt);
    const d = g.disagree * amp;
    g.lotusB.lean = delayed[0] + wander(t, 21) * 0.16 * d;
    g.lotusB.sway = delayed[1] + wander(t, 33) * 0.1 * d;
    g.lotusB.bloom = clamp(delayed[2] - 0.07 * g.disagree, 0.05, 1);

    // -------- caption --------
    if (g.phase === "blooming") g.captionKey = "quiet";
    else if (g.phase === "afterglow") g.captionKey = "won";
    else if (g.phase === "settle") g.captionKey = "settle";
    else if (!a && !b) g.captionKey = "idle";
    else if (a && !b) g.captionKey = "aboveOnly";
    else if (!a && b) g.captionKey = "belowOnly";
    else if (g.sync > 0.55) g.captionKey = "hold";
    else if (g.belowIsSynth) g.captionKey = "synth";
    else g.captionKey = "agree";

    return g;
  }

  return { update, state: g };
}
