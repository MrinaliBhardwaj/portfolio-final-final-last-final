// THE POND — the dock's Game app, now "Lotus Pond · Mrinali's Pet Frog".
// The froggie diorama (github.com/MrinaliBhardwaj/froggie) is vendored whole
// into src/froggie and mounted here on #/pond: a night lotus pond where a pixel
// frog hops the lily pads catching programmer-bugs. No score, no timer, no
// failure — the hand-tracked STILL WATER installation that used to live at this
// route is archived on the pond-still-water branch.
//
// This file is only the frame: canvas mount + teardown, the glass info panel
// (React owns it here; upstream it was static markup in froggie's index.html),
// and the portfolio's chrome. The game itself is untouched under froggie/.
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import { Game } from "./froggie/engine/Game";
import { ambience } from "./froggie/audio/Ambience";

export default function PondWorld() {
  const canvasRef = useRef(null);
  const bugsRef = useRef(-1);
  const [booted, setBooted] = useState(false);
  const [bugs, setBugs] = useState(0);
  const [muted, setMuted] = useState(() => ambience.isMuted);

  useEffect(() => {
    const game = new Game(
      canvasRef.current,
      () => setBooted(true),
      // this fires every frame — only wake React when the count actually moves
      (n) => {
        if (n === bugsRef.current) return;
        bugsRef.current = n;
        setBugs(n);
      }
    );
    // "m" mutes from inside the game; keep the button honest about it
    ambience.onMuteChange = setMuted;
    game.start();

    // Headless verification surface: a hidden browser tab never fires rAF, so
    // the pond can't be screenshotted from a background pane. Drive it by hand
    // instead — step(n) advances frames, snap() POSTs the canvas to the
    // dev-only vite middleware, which writes pond-shot.png at the repo root.
    if (import.meta.env.DEV) {
      window.__pond = {
        step: (n = 1, dt = 1 / 60) => {
          for (let i = 0; i < n; i++) game.stepOnce(dt);
        },
        snap: async () => {
          const png = canvasRef.current?.toDataURL("image/png");
          if (!png) return "no canvas";
          await fetch("/__pond-shot", { method: "POST", body: png });
          return "pond-shot.png";
        },
      };
    }

    return () => {
      delete window.__pond;
      ambience.onMuteChange = null;
      game.dispose();
    };
  }, []);

  const back = () => {
    window.location.hash = "/";
  };

  return (
    <div className="pw">
      <div className="pw-stage">
        <canvas ref={canvasRef} className="pw-canvas" aria-hidden="true" />
      </div>

      <header className="pw-top">
        <span className="pw-mark" aria-label="Mrinali Bhardwaj">
          mb
        </span>
        <button
          type="button"
          className="pw-close"
          onClick={back}
          aria-label="Close the pond and return to the start"
        >
          <X size={18} strokeWidth={1.6} aria-hidden="true" />
        </button>
      </header>

      {/* the one piece of non-canvas UI: what this is, and how it's going */}
      <div className={`pw-panel${booted ? " is-ready" : ""}`}>
        <div className="pw-p-title">🐸 Lotus Pond</div>
        <div className="pw-p-sub">Mrinali&rsquo;s Pet Frog</div>
        <p className="pw-p-desc">Catch coding bugs and help the pond flourish.</p>
        <div className="pw-p-row">
          <span className="pw-p-bugs">
            🐛 Bugs Fixed: <b>{bugs}</b>
          </span>
          <button
            type="button"
            className={`pw-p-mute${muted ? " is-muted" : ""}`}
            onClick={() => ambience.toggleMute()}
            aria-pressed={muted}
            aria-label={muted ? "Unmute the pond" : "Mute the pond"}
            title="Sound on / off (m)"
          >
            {muted ? "🔇" : "🔊"}
          </button>
        </div>
      </div>

      <div className={`pw-boot${booted ? " is-gone" : ""}`} aria-hidden="true">
        &middot; lotus pond &middot;
      </div>

      <p className="pw-visually-hidden">
        A pixel-art lotus pond at night. A frog sits on a lily pad; click one of
        the bugs drifting over the water and it will hop across the pads and
        catch it. There is no score and no way to lose.
      </p>
    </div>
  );
}
