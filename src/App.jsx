// Shell: hash routes keep each world directly linkable. Send #/design with
// design applications and #/tech with engineering ones; those visitors never
// see the other world. Choosing a side on the cover triggers a full-screen
// wipe in the destination world's color, then navigates.
//
// The dock lives here, above the routes, so it persists across them like an
// OS layer: on the cover it surfaces once the divergence settles; on the
// worlds it is always present, showing which "app" is open, and switches
// between them like tabs (a quick crossfade, no wipe ceremony).
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import Cover from "./Cover.jsx";
import DesignWorld from "./DesignWorld.jsx";
import TechWorld from "./TechWorld.jsx";
import GalleryWorld from "./GalleryWorld.jsx";
import NotesWorld from "./NotesWorld.jsx";
import PondWorld from "./PondWorld.jsx";
import Dock from "./Dock.jsx";
import DesignCursor from "./DesignCursor.jsx";
import "./cover.css";
import "./dock.css";
import "./world-tabs.css";
import "./design-world.css";
import "./figma-panel.css";
import "./file-tree.css";
import "./tech-world.css";
import "./gallery-world.css";
import "./notes-world.css";
import "./pond-world.css";

const TITLES = {
  "": "Mrinali Bhardwaj",
  design: "Mrinali Bhardwaj - Design",
  tech: "Mrinali Bhardwaj - Tech",
  gallery: "Mrinali Bhardwaj - Gallery",
  notes: "Mrinali Bhardwaj - Notes",
  pond: "Mrinali Bhardwaj - Lotus Pond",
};

// Where the last click landed. A world grows open FROM this point (see
// WorldWindow), so clicking a dock icon makes the window unfold out of that
// icon — the way a Mac app opens from its dock tile. Captured on the capture
// phase so it's already set by the time the click navigates. Defaults to the
// dock's home (bottom centre) before any pointer touches the page.
let launchPoint = null;
if (typeof window !== "undefined") {
  window.addEventListener(
    "pointerdown",
    (e) => {
      launchPoint = { x: e.clientX, y: e.clientY };
    },
    { capture: true }
  );
}
function launchOrigin() {
  // the wrapper is pinned to the viewport while opening, so client coords map
  // straight to its own box; px, not %, so the origin sits on the real icon
  return launchPoint
    ? `${launchPoint.x}px ${launchPoint.y}px`
    : "50% 100%";
}

function getRoute() {
  // route on the path only, ignoring any "?" query the hash may carry
  const hash = window.location.hash
    .replace(/^#\/?/, "")
    .split("?")[0]
    .toLowerCase();
  if (hash === "design") return "design";
  // "engineering" kept as an alias for links already in circulation
  if (hash === "tech" || hash === "engineering") return "tech";
  if (hash === "gallery") return "gallery";
  // the dock calls it Notes; it holds the archived first draft of the site
  if (hash === "notes") return "notes";
  // the dock calls it the Game; the piece calls itself the pond
  if (hash === "pond" || hash === "game") return "pond";
  return "";
}

// A world opens the way a Mac app window opens: it unfolds out of the dock
// icon that launched it, scaling up from that point to fill the screen while
// the dock stays put in front. The transform-origin is the clicked icon (see
// launchOrigin); scaling from ~0.3 there makes the window grow up and out of
// the tile rather than fading in place.
//
// The pin is load-bearing, not decoration. Every world's chrome is
// `position: fixed` — the tab bar, the tech sidebars and status bar, and the
// gallery/pond stages themselves — and a transformed ancestor becomes the
// containing block for fixed descendants. Pinned to the viewport, that block
// IS the viewport, so the chrome scales with the window like real glass.
// Unpinned, it would resolve against the full document box instead: bottom-
// anchored bars would fly off and the fixed-position worlds would collapse
// to zero height. The pin releases the instant the zoom lands, handing
// scrolling back to the document.
function WorldWindow({ children }) {
  const [opening, setOpening] = useState(true);
  const ref = useRef(null);
  const settled = useRef(false);
  // frozen at mount so a later click (which moves launchPoint) can't shift
  // this window's origin mid-open
  const origin = useRef(launchOrigin());

  const settle = () => {
    if (settled.current) return;
    settled.current = true;
    setOpening(false);
  };

  // Safety net. The zoom is driven by requestAnimationFrame, which a
  // background tab or a headless renderer may never run — and the opening
  // state is opacity: 0, pinned and clipped. Left stuck there the world
  // ships blank and unscrollable. Dropping `is-opening` after the zoom was
  // due hands the world to the CSS below, which forces the finished state:
  // being *there* must never depend on an animation having run.
  useEffect(() => {
    const t = setTimeout(settle, 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <motion.div
      ref={ref}
      className={`world-window${opening ? " is-opening" : ""}`}
      style={{ transformOrigin: origin.current }}
      initial={{ opacity: 0, scale: 0.3 }}
      animate={{ opacity: 1, scale: 1 }}
      // No exit animation, deliberately. Switching apps on a Mac is a cut,
      // not a crossfade — the incoming grow carries the motion. It also lets
      // the settled state below force opacity without fighting a fade-out.
      // Opacity resolves fast so it reads as a growing window, not a fade.
      transition={{
        duration: 0.42,
        ease: [0.16, 1, 0.3, 1],
        opacity: { duration: 0.18, ease: "easeOut" },
      }}
      onAnimationComplete={settle}
    >
      {children}
    </motion.div>
  );
}

export default function App() {
  const [route, setRoute] = useState(getRoute);
  const [coverSettled, setCoverSettled] = useState(false);

  useEffect(() => {
    const onHash = () => setRoute(getRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    document.title = TITLES[route];
    document.documentElement.dataset.world = route || "void";
    window.scrollTo(0, 0);
    // back on the cover, the dock retracts until the divergence settles again
    if (route === "") setCoverSettled(false);
  }, [route]);

  // launching a world is just navigation now — no slide-wipe. The world's
  // own grow-open (WorldWindow) carries the transition, unfolding from
  // whatever the visitor clicked (a dock icon, a cover CTA).
  const choose = (world) => {
    window.location.hash = "/" + world;
  };

  // the dock's click semantics depend on where you are: from the cover it
  // launches a world; on a world it switches like a tab, and clicking the
  // already-open app just returns you to its top
  const dockChoose = (world) => {
    if (route === "") {
      choose(world);
      return;
    }
    if (world === route) {
      const reduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;
      window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
      return;
    }
    window.location.hash = "/" + world;
  };

  return (
    <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        {route === "" && (
          <motion.div
            key="cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Cover onChoose={choose} onSettledChange={setCoverSettled} />
          </motion.div>
        )}

        {route === "design" && (
          <WorldWindow key="design">
            <DesignWorld />
          </WorldWindow>
        )}

        {route === "tech" && (
          <WorldWindow key="tech">
            <TechWorld />
          </WorldWindow>
        )}

        {route === "gallery" && (
          <WorldWindow key="gallery">
            <GalleryWorld />
          </WorldWindow>
        )}

        {route === "notes" && (
          <WorldWindow key="notes">
            <NotesWorld />
          </WorldWindow>
        )}

        {route === "pond" && (
          <WorldWindow key="pond">
            <PondWorld />
          </WorldWindow>
        )}
      </AnimatePresence>

      {/* The design world's cursor tag. It lives up here beside the dock, not
          inside DesignWorld: the pink cursor is scoped to the whole world (the
          dock included), so its label has to clear the dock too — and inside
          the route wrapper it would be trapped under AnimatePresence's
          stacking context. Keyed to the route so it remounts clean. */}
      {route === "design" && <DesignCursor />}

      {/* the OS layer: present on every route, above the page. The world
          grows up from behind it, so the dock reads as the launch surface. */}
      <Dock
        visible={route === "" ? coverSettled : true}
        onChoose={dockChoose}
        active={route || null}
      />
    </MotionConfig>
  );
}
