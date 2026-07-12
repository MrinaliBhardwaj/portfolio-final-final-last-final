// STILL WATER — the pond's presence engine. Not a game: no objectives, no
// meters, no win. It watches for hands and composes moments:
//   · alone, the pond breathes — fireflies wander, mist drifts, petals fall
//   · one presence: the flower leans, fireflies gather, water answers touch
//   · two hands: a lotus of light forms in the space between the palms —
//     apart it elongates, together it condenses, turning wrists turn it,
//     folding past a half-turn it blooms inside-out
//   · letting it go, the light sinks into the pond and the real flower
//     opens a breath further (this persists; the pond remembers quietly)
//   · long stillness: the reflection forgets, for a moment, that it is
//     water — it de-renders into phosphor and heals
export const WATERLINE = 0.44;

const STORE_BLOOM = "pond:bloom";
const STORE_MOTES = "pond:motes";
const MOTE_CAP = 48;
const FLY_COUNT = 14;

function readStore() {
  let bloom = 0.12;
  let motes = [];
  try {
    const b = parseFloat(window.localStorage.getItem(STORE_BLOOM) || "0.12");
    if (Number.isFinite(b)) bloom = Math.min(1, Math.max(0.08, b));
    const raw = JSON.parse(window.localStorage.getItem(STORE_MOTES) || "[]");
    if (Array.isArray(raw)) {
      motes = raw
        .filter((m) => m && Number.isFinite(m.x) && Number.isFinite(m.h))
        .slice(-MOTE_CAP);
    }
  } catch {
    /* private mode — the pond just forgets */
  }
  return { bloom, motes };
}

function writeStore(bloom, motes) {
  try {
    window.localStorage.setItem(STORE_BLOOM, String(bloom));
    window.localStorage.setItem(STORE_MOTES, JSON.stringify(motes));
  } catch {
    /* ignore */
  }
}

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const damp = (from, to, rate, dt) => from + (to - from) * (1 - Math.exp(-rate * dt));

function wander(t, seed) {
  return (
    Math.sin(t * 0.83 + seed * 12.9) * 0.55 +
    Math.sin(t * 1.97 + seed * 5.3) * 0.3 +
    Math.sin(t * 3.31 + seed * 71.7) * 0.15
  );
}

export function createGame({ calm = false } = {}) {
  const stored = readStore();
  const amp = calm ? 0.35 : 1;

  const g = {
    time: 0,
    // presence, for the water's soft glows
    above: { x: 0.5, y: 0.7, on: 0 },
    below: { x: 0.5, y: 0.2, on: 0 },
    lean: 0,
    sway: 0,
    // the real flower (filmed): 0 closed … 1 full bloom
    flower: stored.bloom,
    flowerGlow: 0,
    // the flower of light between the hands
    spirit: {
      x: 0.5, y: 0.66, scale: 0.1, stretch: 1, angle: 0,
      invert: 0, alive: 0, sink: 0, sinkX: 0.5, sinkY: WATERLINE, thread: 0,
      palmAx: 0.4, palmAy: 0.66, palmBx: 0.6, palmBy: 0.66,
    },
    fireflies: [],
    petal: { x: 0.5, y: 0.8, rot: 0, life: 0 },
    derender: 0,
    motes: stored.motes,
    justSank: false,
    petalLanded: false,
  };

  let bloomTarget = stored.bloom;
  let heldT = 0;
  let prevAngle = 0;
  let sinkT = 0;
  let stillT = 0;
  let derenderCool = 20;
  let petalTimer = 12 + Math.random() * 14;

  for (let i = 0; i < FLY_COUNT; i++) {
    g.fireflies.push({
      x: Math.random(),
      y: WATERLINE + 0.05 + Math.random() * 0.3,
      vx: 0,
      vy: 0,
      ph: Math.random() * Math.PI * 2,
      br: 0.5 + Math.random() * 0.5,
    });
  }

  function angleUnwrap(next) {
    let d = next - prevAngle;
    while (d > Math.PI) d -= Math.PI * 2;
    while (d < -Math.PI) d += Math.PI * 2;
    prevAngle += d;
    return prevAngle;
  }

  function landSink() {
    bloomTarget = clamp(bloomTarget + 0.16, 0, 1);
    g.flowerGlow = 1;
    g.motes.push({ x: clamp(g.spirit.sinkX + (Math.random() - 0.5) * 0.08, 0.05, 0.95), h: Math.random() });
    if (g.motes.length > MOTE_CAP) g.motes.shift();
    writeStore(bloomTarget, g.motes);
    g.justSank = true;
  }

  // input: { hands: [{x,y,speed}…], pointer: {x,y,down,active}|null }
  function update(dt, input) {
    dt = clamp(dt, 0.001, 0.05);
    g.time += dt;
    const t = g.time;
    g.justSank = false;
    g.petalLanded = false;

    const hands = input.hands || [];
    const ptr = input.pointer && input.pointer.active ? input.pointer : null;
    const presences = hands.length ? hands : ptr ? [ptr] : [];
    const twoHands = hands.length >= 2;
    const gathering = twoHands || (ptr && ptr.down);

    // -------- presence glows for the water --------
    g.above.on = 0;
    g.below.on = 0;
    for (const p of presences) {
      if (p.y > WATERLINE && !g.above.on) {
        g.above = { x: p.x, y: p.y, on: 1 };
      } else if (p.y <= WATERLINE && !g.below.on) {
        g.below = { x: p.x, y: p.y, on: 1 };
      }
    }

    // -------- the real flower leans toward whoever is here --------
    const focus = presences[0] || null;
    g.sway = (0.05 * Math.sin(t * 0.4) + 0.02 * Math.sin(t * 1.1 + 2.0)) * amp;
    g.lean = damp(g.lean, focus ? clamp((focus.x - 0.5) * 0.8, -0.5, 0.5) : 0, 1.6, dt);

    g.flower = damp(g.flower, bloomTarget, 0.7, dt);
    g.flowerGlow = damp(g.flowerGlow, 0, 1.6, dt);

    // -------- the flower of light between the hands --------
    const sp = g.spirit;
    if (sp.sink > 0 && sp.sink < 1) {
      // draining — nothing interrupts the offering
      sinkT += dt;
      sp.sink = clamp(sinkT / 1.35, 0, 1);
      sp.alive = damp(sp.alive, 0.85, 2, dt);
      if (sp.sink >= 1) {
        landSink();
        sp.alive = 0;
        sp.sink = 0;
        heldT = 0;
      }
    } else if (gathering) {
      heldT += dt;
      const wake = clamp(heldT / 0.7, 0, 1);
      sp.alive = damp(sp.alive, wake, 3, dt);
      sp.sink = 0;
      if (twoHands) {
        const [h1, h2] = hands;
        const mx = (h1.x + h2.x) / 2;
        const my = (h1.y + h2.y) / 2;
        const dist = Math.hypot(h1.x - h2.x, h1.y - h2.y);
        const ang = angleUnwrap(Math.atan2(h2.y - h1.y, h2.x - h1.x));
        sp.palmAx = h1.x;
        sp.palmAy = h1.y;
        sp.palmBx = h2.x;
        sp.palmBy = h2.y;
        sp.x = damp(sp.x, mx, 10, dt);
        sp.y = damp(sp.y, my, 10, dt);
        sp.scale = damp(sp.scale, clamp(dist * 0.55, 0.06, 0.28), 8, dt);
        sp.stretch = damp(sp.stretch, clamp(0.55 + dist * 2.0, 0.7, 1.6), 6, dt);
        sp.angle = damp(sp.angle, ang, 10, dt);
        // fold the flower through itself past a half-turn of the wrists:
        // wrapped angle near ±π means the hands have crossed over
        const wrapped = ((sp.angle % (Math.PI * 2)) + Math.PI * 3) % (Math.PI * 2) - Math.PI;
        sp.invert = damp(sp.invert, Math.abs(wrapped) > 2.1 ? 1 : 0, 4, dt);
        sp.thread = 1;
      } else if (ptr) {
        sp.x = damp(sp.x, ptr.x, 8, dt);
        sp.y = damp(sp.y, ptr.y, 8, dt);
        sp.scale = damp(sp.scale, clamp(0.05 + heldT * 0.09, 0.05, 0.22), 3, dt);
        sp.stretch = damp(sp.stretch, 1 + 0.15 * Math.sin(t * 1.3), 4, dt);
        sp.angle += dt * 0.25;
        sp.invert = damp(sp.invert, 0, 4, dt);
        sp.thread = 0;
      }
    } else {
      // released: if it was truly held, it becomes an offering
      if (sp.alive > 0.55 && heldT > 0.9) {
        sinkT = 0.0001;
        sp.sink = 0.0001;
        sp.sinkX = sp.x;
        sp.sinkY = WATERLINE - 0.015;
      } else {
        sp.alive = damp(sp.alive, 0, 5, dt);
        heldT = Math.max(0, heldT - dt * 3);
      }
    }

    // -------- fireflies: drawn to whoever is gentle --------
    const seek = focus || null;
    for (let i = 0; i < FLY_COUNT; i++) {
      const f = g.fireflies[i];
      let tx;
      let ty;
      if (seek && i % 3 !== 0) {
        const orbA = t * (0.25 + (i % 5) * 0.11) + i * 2.4;
        const orbR = 0.05 + (i % 4) * 0.035;
        tx = seek.x + Math.cos(orbA) * orbR;
        ty = seek.y + Math.sin(orbA) * orbR * 0.7;
      } else {
        tx = 0.5 + 0.42 * wander(t * 0.4, i * 7.3);
        ty = WATERLINE + 0.16 + 0.14 * wander(t * 0.33, i * 3.1);
      }
      ty = Math.max(ty, WATERLINE + 0.02);
      f.vx += (tx - f.x) * dt * 2.2;
      f.vy += (ty - f.y) * dt * 2.2;
      f.vx *= Math.exp(-dt * 1.8);
      f.vy *= Math.exp(-dt * 1.8);
      const sp2 = Math.hypot(f.vx, f.vy);
      const cap = 0.22;
      if (sp2 > cap) {
        f.vx = (f.vx / sp2) * cap;
        f.vy = (f.vy / sp2) * cap;
      }
      f.x += f.vx * dt;
      f.y += f.vy * dt;
      f.ph += dt * (0.7 + (i % 3) * 0.4);
      f.br = damp(f.br, seek ? 1 : 0.55, 1.5, dt);
    }

    // -------- now and then, a petal lets go of the flower --------
    const pt = g.petal;
    if (pt.life > 0) {
      pt.life -= dt / 8;
      pt.x += (wander(t * 0.7, 9.1) * 0.02 + g.sway * 0.3) * dt * 3;
      pt.y -= dt * 0.045;
      pt.rot += dt * (0.6 + wander(t, 4.4) * 0.4);
      if (pt.y <= WATERLINE + 0.004) {
        g.petalLanded = true;
        pt.life = 0;
      }
    } else if (g.flower > 0.35 && sp.alive < 0.1) {
      petalTimer -= dt;
      if (petalTimer <= 0) {
        petalTimer = 18 + Math.random() * 18;
        pt.x = 0.5 + (Math.random() - 0.5) * 0.12;
        pt.y = WATERLINE + 0.30 + Math.random() * 0.06;
        pt.rot = Math.random() * Math.PI;
        pt.life = 1;
      }
    }

    // -------- long stillness: the reflection forgets itself --------
    if (presences.length === 0) stillT += dt;
    else stillT = 0;
    derenderCool -= dt;
    if (stillT > 22 && derenderCool <= 0 && g.derender === 0) {
      g.derender = 0.0001;
      derenderCool = 45;
    }
    if (g.derender > 0) {
      g.derender += dt / 4.5;
      if (g.derender >= 1) g.derender = 0;
    }

    return g;
  }

  return { update, state: g };
}
