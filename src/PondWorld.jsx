// THE POND — STILL WATER: an installation, not a page and not a game. No
// instructions, no meters, no goals. The pond is a living ecosystem that
// notices hands: the flower leans, fireflies gather, and between two raised
// palms a lotus of light forms — release it and the real flower answers.
//
// This file is only the frame: consent ritual (asking for the camera is part
// of the piece), input plumbing, sound toggle, chrome. The world lives in
// pond/gl.js (render), pond/game.js (presence), pond/spirit.js (the light),
// pond/flower.js (the filmed bloom).
import { useEffect, useRef, useState } from "react";
import { Volume2, VolumeX, X } from "lucide-react";
import { createPond } from "./pond/gl.js";
import { createGame, WATERLINE } from "./pond/game.js";
import { createHum } from "./pond/audio.js";

function readFlags() {
  const q = window.location.hash.split("?")[1] || "";
  const parts = q.split(/[&,]/);
  return { sim: parts.includes("sim"), hud: parts.includes("hud") || parts.includes("sim") };
}

export default function PondWorld() {
  const [flags] = useState(readFlags);
  const [ritual, setRitual] = useState(flags.sim ? "done" : "ask");
  const [mode, setMode] = useState(flags.sim ? "sim" : null);
  const [soundOn, setSoundOn] = useState(false);
  const [fatal, setFatal] = useState(false);

  const stageRef = useRef(null);
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const hudRef = useRef(null);
  const handsRef = useRef(null);
  const humRef = useRef(null);
  const modeRef = useRef(mode);
  const pointerRef = useRef({ x: 0.5, y: 0.5, t: 0, down: false, active: false });
  const simHandsRef = useRef(null); // verification override: [{x,y},{x,y}] | null

  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  useEffect(() => {
    const calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const game = createGame({ calm });
    const engine = createPond(canvasRef.current, { calm });
    if (!engine) {
      setFatal(true);
      return undefined;
    }
    const hum = createHum();
    humRef.current = hum;

    const prev = { hudAt: 0, humAt: 0, ambientAt: 0 };

    engine.start((dt, time) => {
      const m = modeRef.current;
      let hands = [];
      let pointer = null;

      if (simHandsRef.current) {
        hands = simHandsRef.current;
      } else if (m === "hands") {
        hands = handsRef.current ? handsRef.current.sample() : [];
      } else if (m === "pointer" || m === "sim") {
        const p = pointerRef.current;
        pointer = {
          x: p.x,
          y: p.y,
          down: p.down,
          active: p.down || performance.now() - p.t < 2500,
        };
      }

      const s = game.update(dt, { hands, pointer });

      // ---- the water answers whatever touches it ----
      for (const h of hands) {
        if (h.y < WATERLINE) {
          engine.addDrop(h.x, h.y, 0.05, Math.min((h.speed || 0) * 0.05, 0.25) + 0.006);
        }
      }
      if (pointer && pointer.active && pointer.y < WATERLINE) {
        engine.addDrop(pointer.x, pointer.y, 0.05, 0.02);
      }
      if (time > prev.ambientAt) {
        // unprompted life under the surface
        engine.addDrop(Math.random(), Math.random() * WATERLINE * 0.9, 0.03, 0.04 + Math.random() * 0.05);
        prev.ambientAt = time + 2.2 + Math.random() * 3.0;
      }
      if (s.justSank) {
        engine.addDrop(s.spirit.sinkX, WATERLINE * 0.96, 0.10, 0.5);
        hum.ding();
      }
      if (s.petalLanded) {
        engine.addDrop(s.petal.x, WATERLINE * 0.97, 0.04, 0.12);
      }

      if (time > prev.humAt) {
        hum.setSync(s.spirit.alive * 0.8 + s.flowerGlow * 0.2);
        prev.humAt = time + 0.5;
      }
      if (hudRef.current && time > prev.hudAt) {
        const st = engine.stats();
        hudRef.current.textContent =
          `fps ${st.fps}  tier ${st.tier}  sim ${st.sim}\n` +
          `flower ${s.flower.toFixed(2)}  spirit ${s.spirit.alive.toFixed(2)}` +
          `${s.spirit.sink > 0 ? " sinking" : ""}  derender ${s.derender.toFixed(2)}\n` +
          `hands ${hands.length}  mode ${m || "-"}`;
        prev.hudAt = time + 0.3;
      }
      return s;
    });

    // headless verification surface (?sim / ?hud): drive hands by script,
    // step frames, read pixels — a hidden tab never fires rAF
    if (readFlags().hud) {
      window.__pond = {
        step: (n = 1, dt = 1 / 60) => {
          for (let i = 0; i < n; i++) engine.stepOnce(dt);
        },
        snap: () => engine.snapshot(),
        stats: () => engine.stats(),
        hands: (arr) => {
          simHandsRef.current = Array.isArray(arr) && arr.length ? arr : null;
        },
        hold: (x, y, down) => {
          const p = pointerRef.current;
          p.x = x;
          p.y = y;
          p.down = !!down;
          p.t = performance.now();
        },
      };
    }

    return () => {
      delete window.__pond;
      engine.dispose();
      if (handsRef.current) {
        handsRef.current.stop();
        handsRef.current = null;
      }
      hum.dispose();
      humRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

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
      console.warn("pond: the eye stays closed", err);
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
    const p = pointerRef.current;
    p.x = (e.clientX - rect.left) / rect.width;
    p.y = 1 - (e.clientY - rect.top) / rect.height;
    p.t = performance.now();
    p.active = true;
  };

  return (
    <div className="pw">
      <div
        ref={stageRef}
        className="pw-stage"
        onPointerMove={onPointerMove}
        onPointerDown={(e) => {
          onPointerMove(e);
          pointerRef.current.down = true;
        }}
        onPointerUp={() => {
          pointerRef.current.down = false;
        }}
        onPointerLeave={() => {
          pointerRef.current.active = false;
          pointerRef.current.down = false;
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

      <p className="pw-visually-hidden">
        An ambient installation: a lotus pond at night that responds to your
        hands through the camera, or to your cursor. There is nothing to
        achieve; it is a place to be.
      </p>

      <p className="pw-hint" aria-hidden="true">
        An installation
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

      {flags.hud && <div ref={hudRef} className="pw-hud" aria-hidden="true" />}
    </div>
  );
}
