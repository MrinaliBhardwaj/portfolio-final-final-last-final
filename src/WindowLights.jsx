// The three traffic lights every world's title bar carries, in macOS's own
// order and colours. Replaces the lone × each world used to have.
//
// ALL THREE DO SOMETHING REAL, and that is the whole design constraint here.
// The reference portfolios paint three dots and wire only the red one — the
// other two are decoration that responds to a click by doing nothing, which is
// exactly the dead affordance the Claude dock tile was removed for. So:
//
//   red    CLOSE     → quit to the desktop, and the app is closed: no dot.
//   yellow MINIMISE  → back to the desktop, but the app stays OPEN — its dock
//                      icon keeps its dot, the way a minimised Mac window
//                      lives on in the dock until you actually quit it.
//   green  MAXIMISE  → the browser's real Fullscreen API, toggled.
//
// The minimised set lives in sessionStorage rather than React state because
// this component sits several levels inside each world, and the thing that
// needs to read it is the Dock, which is a sibling of the routes up in App.
// Passing a setter down through five unrelated world components to move one
// boolean would be worse than a keyed string; App re-reads it on every route
// change, which is exactly when it can change.
import { Minus, Plus, X } from "lucide-react";

const KEY = "mb-minimised";

const read = () => {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const write = (list) => {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable: minimise degrades to close, nothing breaks */
  }
};

export const minimisedWorlds = read;

export const clearMinimised = (world) => {
  const next = read().filter((w) => w !== world);
  write(next);
  return next;
};

const home = () => {
  window.location.hash = "/";
};

// Exported so the menu bar's View menu drives the same one — fullscreen is a
// user-gesture-gated API that REJECTS rather than throws, so the catch matters:
// a browser that refuses (iOS Safari has never supported it on non-video
// elements) must not put an unhandled rejection in the console every time
// someone pokes it.
export const toggleFullscreen = () => {
  if (document.fullscreenElement) {
    document.exitFullscreen?.().catch(() => {});
  } else {
    document.documentElement.requestFullscreen?.().catch(() => {});
  }
};

export default function WindowLights({ world, label }) {
  const close = () => {
    clearMinimised(world);
    home();
  };

  const minimise = () => {
    const list = read();
    if (!list.includes(world)) write([...list, world]);
    home();
  };

  const maximise = toggleFullscreen;

  return (
    <div className="wlights">
      <button
        type="button"
        className="wlight wlight--close"
        onClick={close}
        aria-label={`Close ${label} and return to the desktop`}
      >
        <X size={9} strokeWidth={2.6} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="wlight wlight--min"
        onClick={minimise}
        aria-label={`Minimise ${label} — return to the desktop, leaving it open`}
      >
        <Minus size={9} strokeWidth={2.6} aria-hidden="true" />
      </button>
      <button
        type="button"
        className="wlight wlight--max"
        onClick={maximise}
        aria-label="Toggle full screen"
      >
        <Plus size={9} strokeWidth={2.6} aria-hidden="true" />
      </button>
    </div>
  );
}
