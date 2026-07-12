// THE POND: the dock's Game app — UNDERTOW, an interactive installation.
// One lotus above the waterline (the design world, soft and lit); its
// reflection below (the tech world, phosphor wireframe) disobeys — it lags,
// mirrors wrong. Bring a hand into each world and truly mirror yourself: the
// waterline holds gold, the worlds sync, and both lotuses bloom as one.
//
// This file is the shell and conductor: entry ritual (asking for the camera
// is part of the piece), input routing (hands / cursor / ?sim), captions,
// tally, sound. The rendering lives in pond/gl.js, the rules in pond/game.js.
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, X } from "lucide-react";
import { createPond } from "./pond/gl.js";
import { createGame, WATERLINE } from "./pond/game.js";
import { createHum } from "./pond/audio.js";

function readAgreements() {
  try {
    const n = parseInt(window.localStorage.getItem("pond:agreements") || "0", 10);
    return Number.isFinite(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}

function readFlags() {
  const q = window.location.hash.split("?")[1] || "";
  const parts = q.split(/[&,]/);
  return { sim: parts.includes("sim"), hud: parts.includes("hud") || parts.includes("sim") };
}

// what the pond says, and when
function captionFor(key, mode, state) {
  switch (key) {
    case "idle":
      return mode === "hands"
        ? { text: "hold a hand over the water" }
        : { text: "move slowly — the reflection is shy" };
    case "aboveOnly":
      return { text: "its reflection is not listening — bring a second hand below the line" };
    case "belowOnly":
      return { text: "that is the reflection's world — keep a hand above the water too" };
    case "meet":
      return { text: "it is waiting at the gold ring — meet it there" };
    case "cup":
      return { text: "a firefly has come — cup it in your upper hand" };
    case "lead":
      return { text: "lead it home, slowly — keep your reflection with you" };
    case "surge":
      return { text: "it doubts you — hold" };
    case "agree":
      return { text: "one hand in each world — now mirror yourself" };
    case "hold":
      return { text: "hold the agreement…" };
    case "won":
      return {
        text: "the worlds agreed",
        sub: state.firstWin
          ? "the pond will remember this light"
          : `agreement nº ${state.agreements}`,
      };
    default:
      return null; // quiet / settle — the pond falls silent
  }
}

export default function PondWorld() {
  const [flags] = useState(readFlags);
  // ritual: ask → opening → done; ?sim skips straight in
  const [ritual, setRitual] = useState(flags.sim ? "done" : "ask");
  const [mode, setMode] = useState(flags.sim ? "sim" : null);
  const [cap, setCap] = useState(null);
  const [capQuiet, setCapQuiet] = useState(true);
  const [tally, setTally] = useState(readAgreements);
  const [lit, setLit] = useState(false);
  const [soundOn, setSoundOn] = useState(false);
  const [fatal, setFatal] = useState(false);

  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const hudRef = useRef(null);
  const engineRef = useRef(null);
  const handsRef = useRef(null);
  const humRef = useRef(null);
  const modeRef = useRef(mode);
  const agreeRef = useRef(false);
  const pointerRef = useRef({ x: 0.5, y: 0.5, t: 0, speed: 0, active: false });
  const overrideRef = useRef(null); // { text, sub, until }
  const capKeyRef = useRef("");
  const timersRef = useRef({ cap: 0, lit: 0 });

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  // ---- the world itself: engine + game, alive for the whole visit ----
  useEffect(() => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const game = createGame({ calm });
    const engine = createPond(canvasRef.current, { calm });
    if (!engine) {
      setFatal(true);
      return undefined;
    }
    engineRef.current = engine;
    const hum = createHum();
    humRef.current = hum;
    const timers = timersRef.current;

    const prev = { bx: 0.5, by: 0.2, ax: 0.5, ay: 0.7, phase: "play", ambientAt: 0, humAt: 0, hudAt: 0 };

    const showCaption = (next) => {
      setCapQuiet(true);
      clearTimeout(timers.cap);
      timers.cap = window.setTimeout(() => {
        if (next) {
          setCap(next);
          setCapQuiet(false);
        }
      }, 420);
    };

    engine.start((dt, time) => {
      const m = modeRef.current;
      let a = null;
      let b = null;
      let allowSynth = false;
      let forceMirror = false;

      if (m === "hands") {
        const hands = handsRef.current ? handsRef.current.sample() : [];
        for (const h of hands) {
          if (h.y > WATERLINE) {
            if (!a || h.y > a.y) a = h;
          } else if (!b || h.y < b.y) {
            b = h;
          }
        }
      } else if (m === "pointer" || m === "sim") {
        const p = pointerRef.current;
        allowSynth = true;
        forceMirror = m === "sim" && agreeRef.current;
        if (p.active && performance.now() - p.t < 2500) {
          const ent = { x: p.x, y: p.y, speed: p.speed };
          if (p.y > WATERLINE) a = ent;
          else b = ent;
        } else if (m === "sim") {
          // sim mode always offers a resting hand, so the whole loop can be
          // driven (and verified) without a webcam or even a cursor
          a = { x: 0.5, y: 0.72, speed: 0 };
        }
      }

      const s = game.update(dt, { a, b, allowSynth, forceMirror });
      s.pointerFly = m !== "hands";

      // ---- ripples: whatever touches the water, marks it ----
      if (s.below.on) {
        const sp = Math.hypot(s.below.x - prev.bx, s.below.y - prev.by) / dt;
        engine.addDrop(s.below.x, s.below.y, 0.05, Math.min(sp * 0.05, 0.3) + 0.008);
      }
      if (s.above.on && s.above.y - WATERLINE < 0.07) {
        const sp = Math.hypot(s.above.x - prev.ax, s.above.y - prev.ay) / dt;
        engine.addDrop(s.above.x, WATERLINE * 0.96, 0.045, Math.min(sp * 0.03, 0.16));
      }
      prev.bx = s.below.x;
      prev.by = s.below.y;
      prev.ax = s.above.x;
      prev.ay = s.above.y;
      if (time > prev.ambientAt) {
        // unprompted life: a fish under the surface, a seed falling somewhere
        engine.addDrop(Math.random(), Math.random() * WATERLINE * 0.9, 0.03, 0.04 + Math.random() * 0.06);
        prev.ambientAt = time + 1.8 + Math.random() * 2.6;
      }
      if (s.phase === "blooming" && prev.phase !== "blooming") {
        engine.addDrop(0.5, WATERLINE * 0.92, 0.13, 0.65);
        engine.addDrop(0.42, WATERLINE * 0.8, 0.07, 0.3);
        engine.addDrop(0.58, WATERLINE * 0.8, 0.07, 0.3);
      }
      prev.phase = s.phase;

      // ---- caption ----
      const ov = overrideRef.current;
      if (ov && performance.now() < ov.until) {
        if (capKeyRef.current !== "override") {
          capKeyRef.current = "override";
          showCaption({ text: ov.text, sub: ov.sub });
        }
      } else {
        const key = `${s.captionKey}|${m}`;
        if (capKeyRef.current !== key) {
          capKeyRef.current = key;
          showCaption(captionFor(s.captionKey, m, s));
        }
      }

      // ---- an act completes: a small answering note ----
      if (s.justAdvanced) hum.ding();

      // ---- a win lands ----
      if (s.justWon) {
        setTally(s.agreements);
        setLit(true);
        clearTimeout(timers.lit);
        timers.lit = window.setTimeout(() => setLit(false), 4500);
        hum.chime();
      }

      if (time > prev.humAt) {
        hum.setSync(s.sync);
        prev.humAt = time + 0.5;
      }
      if (hudRef.current && time > prev.hudAt) {
        const st = engine.stats();
        hudRef.current.textContent =
          `fps ${st.fps}  tier ${st.tier}  sim ${st.sim}\n` +
          `phase ${s.phase}  act ${s.stage} ${s.stageProg.toFixed(2)}  sync ${s.sync.toFixed(2)}  meter ${s.progress.toFixed(2)}\n` +
          `surge ${s.surge.toFixed(2)}  firefly ${s.firefly.on ? (s.firefly.held ? "held" : "free") : "-"}  ` +
          `mode ${m || "-"}${s.belowIsSynth ? "  +synth-below" : ""}${s.aboveIsSynth ? "  +synth-above" : ""}` +
          `${forceMirror ? "  MIRROR" : ""}`;
        prev.hudAt = time + 0.3;
      }
      return s;
    });

    // headless driving surface for dev verification (?sim / ?hud)
    if (readFlags().hud) {
      window.__pond = {
        step: (n = 1, dt = 1 / 60) => {
          for (let i = 0; i < n; i++) engine.stepOnce(dt);
        },
        snap: () => engine.snapshot(),
        stats: () => engine.stats(),
        agree: (on) => {
          agreeRef.current = on;
        },
      };
    }

    return () => {
      delete window.__pond;
      clearTimeout(timers.cap);
      clearTimeout(timers.lit);
      engine.dispose();
      engineRef.current = null;
      if (handsRef.current) {
        handsRef.current.stop();
        handsRef.current = null;
      }
      hum.dispose();
      humRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ?sim: 'w' toggles a perfect mirror partner, so the win is reachable
  // deterministically (this is how the loop gets verified headless)
  useEffect(() => {
    if (!flags.sim) return undefined;
    const onKey = (e) => {
      if (e.key === "w" || e.key === "W") agreeRef.current = !agreeRef.current;
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [flags.sim]);

  const back = () => {
    window.location.hash = "/";
  };

  const letItLook = async () => {
    setRitual("opening");
    try {
      const { createHands } = await import("./pond/hands.js");
      handsRef.current = await createHands(videoRef.current);
      setMode("hands");
    } catch (err) {
      // no camera, or a "no" at the browser prompt — the pond doesn't sulk
      console.warn("pond: the eye stays closed", err);
      overrideRef.current = {
        text: "no eye, then — the pond will follow your cursor",
        sub: "move slowly",
        until: performance.now() + 6000,
      };
      setMode("pointer");
    }
    setRitual("done");
  };

  const keepHidden = () => {
    setMode("pointer");
    setRitual("done");
  };

  const toggleSound = () => {
    const next = !soundOn;
    setSoundOn(next);
    if (humRef.current) humRef.current.setOn(next);
  };

  const onPointerMove = (e) => {
    const rect = stageRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = 1 - (e.clientY - rect.top) / rect.height;
    const p = pointerRef.current;
    const now = performance.now();
    const dt = Math.max((now - p.t) / 1000, 0.008);
    p.speed = p.speed * 0.7 + (Math.hypot(x - p.x, y - p.y) / dt) * 0.3;
    p.x = x;
    p.y = y;
    p.t = now;
    p.active = true;
  };

  return (
    <div className="pw">
      <div
        ref={stageRef}
        className="pw-stage"
        onPointerMove={onPointerMove}
        onPointerDown={onPointerMove}
        onPointerLeave={() => {
          pointerRef.current.active = false;
        }}
      >
        {fatal ? (
          <div className="pw-ritual" style={{ background: "none" }}>
            <p className="pw-ritual-title">this pond needs WebGL2, and the browser declined</p>
            <p className="pw-ritual-sub">the rest of the portfolio is unaffected</p>
          </div>
        ) : (
          <canvas ref={canvasRef} aria-hidden="true" />
        )}
      </div>

      <video ref={videoRef} className="pw-video" playsInline muted aria-hidden="true" />

      <header className="pw-top">
        <span className="pw-mark" aria-label="Mrinali Bhardwaj">
          mb
        </span>
        <span className="pw-label">The Pond</span>
        <button
          type="button"
          className="pw-close"
          onClick={back}
          aria-label="Close the pond and return to the start"
        >
          <X size={18} strokeWidth={1.6} aria-hidden="true" />
        </button>
      </header>

      {ritual !== "done" && !fatal && (
        <div className="pw-ritual">
          {ritual === "ask" ? (
            <>
              <p className="pw-ritual-title">the pond would like to see your hands</p>
              <p className="pw-ritual-sub">
                the watching happens here, in your browser — no image ever leaves this window
              </p>
              <div className="pw-ritual-actions">
                <button type="button" className="pw-btn pw-btn--eye" onClick={letItLook}>
                  let it look
                </button>
                <button type="button" className="pw-btn pw-btn--hide" onClick={keepHidden}>
                  keep them hidden
                </button>
              </div>
            </>
          ) : (
            <p className="pw-ritual-title">the pond is opening its eye&hellip;</p>
          )}
        </div>
      )}

      <p className={`pw-caption${capQuiet || !cap ? " is-quiet" : ""}`} role="status">
        {cap ? cap.text : ""}
        {cap && cap.sub ? <span className="pw-caption-sub">{cap.sub}</span> : null}
      </p>

      <p className="pw-hint" aria-hidden="true">
        An installation · agree with your reflection
      </p>

      {!fatal && ritual === "done" && (
        <button
          type="button"
          className={`pw-sound${soundOn ? " is-on" : ""}`}
          onClick={toggleSound}
          aria-pressed={soundOn}
          aria-label={soundOn ? "Mute the pond" : "Let the pond hum"}
        >
          {soundOn ? (
            <Volume2 size={17} strokeWidth={1.6} aria-hidden="true" />
          ) : (
            <VolumeX size={17} strokeWidth={1.6} aria-hidden="true" />
          )}
        </button>
      )}

      {tally > 0 && (
        <p className={`pw-count${lit ? " is-lit" : ""}`} aria-label={`${tally} agreements so far`}>
          <span className="pw-count-dot" />
          {tally} agreement{tally === 1 ? "" : "s"}
        </p>
      )}

      {flags.hud && <div ref={hudRef} className="pw-hud" aria-hidden="true" />}
    </div>
  );
}
