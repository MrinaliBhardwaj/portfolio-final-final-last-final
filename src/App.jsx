// Shell: hash routes keep each world directly linkable. Send #/design with
// design applications and #/tech with engineering ones; those visitors never
// see the other world. Choosing a side on the cover triggers a full-screen
// wipe in the destination world's color, then navigates.
//
// The dock lives here, above the routes, so it persists across them like an
// OS layer: on the cover it surfaces once the divergence settles; on the
// worlds it is always present, showing which "app" is open, and switches
// between them like tabs (a quick crossfade, no wipe ceremony).
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import Cover, { hasSeenIntro } from "./Cover.jsx";
import { clearMinimised, minimisedWorlds } from "./WindowLights.jsx";
import { WorldOpening } from "./world-open.js";
import { bySlug } from "./projects.js";
import { pageBySlug } from "./figma-pages.js";

// THE FIVE WORLDS ARE CODE-SPLIT, and the cover is why. Someone who opens the
// site and never leaves the desktop was downloading all five anyway: the two
// long worlds, the dome gallery, the scrapbook's scenes, and the whole vendored
// froggie game — a quarter of a megabyte of pond physics for a visitor who
// never clicks the frog. Every one of them is behind a click, so every one of
// them can arrive at that click instead of before it.
//
// The cost of splitting is a blank window while a chunk downloads, so it is
// paid up front instead: WARM() fetches all five during the first idle moment
// after the desktop settles (see below). By the time a dock icon is clicked the
// chunk is in memory and the lazy boundary resolves in the same frame — the
// grow-open never waits on the network. If idle never comes, Suspense catches
// it and the window opens empty for an instant rather than not at all.
const DesignWorld = lazy(() => import("./DesignWorld.jsx"));
const TechWorld = lazy(() => import("./TechWorld.jsx"));
const GalleryWorld = lazy(() => import("./GalleryWorld.jsx"));
const NotesWorld = lazy(() => import("./NotesWorld.jsx"));
const PondWorld = lazy(() => import("./PondWorld.jsx"));
// design-route-only, and its one class (.dw-tag) is defined in
// design-world.css — which now travels with the design chunk. Splitting it
// too keeps the tag and the rule that styles it arriving together.
const DesignCursor = lazy(() => import("./DesignCursor.jsx"));

// the same five, as plain imports to prime the module cache. React.lazy caches
// on the promise, so a chunk fetched here is not fetched again at the click.
const WARM = [
  () => import("./DesignWorld.jsx"),
  () => import("./TechWorld.jsx"),
  () => import("./GalleryWorld.jsx"),
  () => import("./NotesWorld.jsx"),
  () => import("./PondWorld.jsx"),
];
import Dock from "./Dock.jsx";
import PhoneDock from "./PhoneDock.jsx";
import useIsPhone from "./use-is-phone.js";
import "./cover.css";
import "./menu-bar.css";
import "./desktop-files.css";
import "./dock.css";
import "./window-lights.css";
// A WORLD'S STYLESHEET TRAVELS WITH ITS WORLD. design-world, figma-canvas,
// figma-panel, file-tree, tech-world, gallery-world, pond-world and world-tabs
// used to be imported here, which put all of them in the shell's one stylesheet
// — the cover was parsing 54 kB of Figma-panel rules it would never apply. Each
// is now imported by the component that uses it, so Vite emits it beside that
// component's chunk and the browser fetches it at the same moment.
//
// SAFE BECAUSE THE WORLDS DO NOT SHARE A SINGLE SELECTOR. Route stylesheets
// arrive in visit order, so anything defined twice would resolve differently
// depending on where you had been — a genuinely nasty bug. Checked before the
// move: across all eight files, pairwise selector intersection is empty, and
// every one is namespaced (.dw-, .tw-, .fc-, .fp-, .ft-, .wt-, .gw-, .pw-).
// KEEP IT THAT WAY — a bare `.is-active` added to one of them would reopen it.
//
// The windows' own stylesheets (case-window, code-window, notes-world) left
// with them — every window is behind a click, so see Cover.jsx.
// collage.css (page three of the scrapbook) is no longer loaded: SceneThree was
// cut from About Me on 12 Sep 2026. Restore both together.
import "./phone-home.css";

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

// the hash path, minus the leading #/ and any "?" query, lowercased
function hashPath() {
  return window.location.hash.replace(/^#\/?/, "").split("?")[0].toLowerCase();
}

function getRoute() {
  // FIRST SEGMENT only, and it still matters after the project pages went: a
  // legacy #/design/<slug> is redirected below, but it is read HERE first on
  // the render that precedes it, and matching the whole path would flash the
  // cover on the way through. The query is already stripped by hashPath, which
  // is what lets #/?case=layover resolve to "" and render the desktop.
  const hash = hashPath().split("/")[0];
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

// #/design/<slug> USED TO BE A PAGE. It is now the case-study window on the
// desktop, and that window has its own address (#/?case=<slug>, read by
// Cover.jsx). Every link in the app was repointed, but links do not only live
// in the app — one may be in someone's bookmarks, in a message, or in a CV that
// was sent out — so the old shape is caught here and forwarded rather than
// dropping those visitors on a canvas with no explanation.
//
// Assigning to location.hash rather than replaceState: this has to run BEFORE
// getRoute reads the hash on the very first render, and location.hash updates
// synchronously (only the hashchange EVENT is deferred), so the initial state
// is computed from the new address. Unknown slugs are left alone and fall
// through to the design canvas, which is what a stale link should do.
function redirectLegacyProjectPage() {
  const [world, slug] = hashPath().split("/");
  // A REAL PAGE OF THE FILE OUTRANKS THE LEGACY SHAPE. #/design/<slug> is a
  // project page again for anything in FIGMA_PAGES; only the old case-study
  // slugs are still forwarded. Without this check, the day a project gains
  // both a page and a case study the page becomes unreachable.
  if (pageBySlug(slug)) return false;
  if (world !== "design" || !slug || !bySlug(slug)) return false;
  window.location.hash = `/?case=${slug}`;
  return true;
}

if (typeof window !== "undefined") redirectLegacyProjectPage();

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
      {/* Anything inside that measures its own box once has to wait this out —
          while the zoom runs, this transform is the containing block for every
          fixed-position descendant, so they measure the SCALED window rather
          than the viewport. See world-open.js. */}
      <WorldOpening.Provider value={opening}>
        {/* null, not a spinner: the window itself is the loading affordance —
            it has already grown open around this space. With WARM() ahead of
            it this boundary resolves synchronously and is never seen. */}
        <Suspense fallback={null}>{children}</Suspense>
      </WorldOpening.Provider>
    </motion.div>
  );
}

export default function App() {
  const [route, setRoute] = useState(getRoute);
  // the cover on a phone is an iPhone home screen, and it brings its own dock
  const { phone } = useIsPhone();
  const [coverSettled, setCoverSettled] = useState(false);
  // worlds the yellow light was used on: still "open", so the dock keeps their
  // dot even though you are back on the desktop (see WindowLights.jsx)
  const [minimised, setMinimised] = useState(minimisedWorlds);

  useEffect(() => {
    const onHash = () => {
      // a legacy link clicked mid-session redirects and fires a second
      // hashchange; that one cannot match, so this terminates
      if (redirectLegacyProjectPage()) return;
      setRoute(getRoute());
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  // Every route change below force-scrolls to the top, so the browser's own
  // restore is not just redundant, it's a race we lose: on back/forward it
  // re-applies the old scroll AFTER our effect and after the world has mounted.
  // The lanyard is pinned to the DOCUMENT, so a late jump moves its anchor by
  // several screens and the badge visibly sails into place. Opt out.
  useEffect(() => {
    if (!("scrollRestoration" in history)) return;
    const previous = history.scrollRestoration;
    history.scrollRestoration = "manual";
    return () => {
      history.scrollRestoration = previous;
    };
  }, []);

  useEffect(() => {
    document.title = TITLES[route];
    document.documentElement.dataset.world = route || "void";
    // Opening a world un-minimises it; landing anywhere re-reads the set, which
    // is how the lights' sessionStorage writes reach the dock without threading
    // a setter down through five unrelated world components.
    setMinimised(route ? clearMinimised(route) : minimisedWorlds());
    // The scroll reset and the dock retraction are FIRST-VISIT behaviours on
    // the cover. Once the ceremony has been seen, Cover lands itself at the
    // settled desktop in a layout effect and announces settled — and THIS
    // effect is passive, so it runs after that and was stomping both signals:
    // scrollTo(0,0) un-landed the page and setCoverSettled(false) retracted
    // the dock Cover had just surfaced. Home is a place now, not a corridor;
    // the corridor behaviours only apply while the ceremony is still owed.
    if (route === "" && hasSeenIntro()) {
      // Cover owns the scroll position and the settled signal on this route
    } else {
      window.scrollTo(0, 0);
      // back on the cover, the dock retracts until the divergence settles
      if (route === "") setCoverSettled(false);
    }
  }, [route]);

  // WARM THE WORLDS once the page has nothing better to do. This is the other
  // half of the code split above: the chunks leave the critical path, then come
  // back during the first idle window so a click still opens instantly. Idle is
  // the whole point — fetching eagerly on mount would just re-create the
  // problem the split solves, competing with the lotus atlas and the desk's
  // images for the same first seconds of bandwidth.
  //
  // Sequential, not Promise.all: five parallel fetches on a slow connection is
  // five things arriving late. One at a time keeps each one cheap, and the
  // order matches how likely a visitor is to want it.
  useEffect(() => {
    let cancelled = false;
    const run = async () => {
      for (const load of WARM) {
        if (cancelled) return;
        try {
          await load();
        } catch {
          // a failed prefetch is not a failure: the lazy boundary will fetch
          // it again at the click, and report properly if it is still broken
        }
      }
    };
    const idle = window.requestIdleCallback;
    // Safari has no requestIdleCallback; a timeout is a fine stand-in, and the
    // 2s floor keeps this behind the cover's own loading either way.
    const id = idle
      ? idle(run, { timeout: 4000 })
      : setTimeout(run, 2000);
    return () => {
      cancelled = true;
      if (idle) window.cancelIdleCallback?.(id);
      else clearTimeout(id);
    };
  }, []);

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
      {route === "design" && (
        <Suspense fallback={null}>
          <DesignCursor />
        </Suspense>
      )}

      {/* the OS layer: present on every route, above the page. The world
          grows up from behind it, so the dock reads as the launch surface. */}
      {/* ONE DOCK PER MACHINE. The Mac's is this one, bottom-centre on every
          route. The phone's is an iOS dock (PhoneDock.jsx) — also on every
          route, also in one place: it used to belong to the home screen while
          the worlds got the Mac dock's phone rail, so the thing you launched
          Figma from jumped to the left edge the moment it opened. */}
      {phone ? (
        <PhoneDock
          visible={route === "" ? coverSettled : true}
          active={route || null}
          minimised={minimised}
        />
      ) : (
        <Dock
          visible={route === "" ? coverSettled : true}
          onChoose={dockChoose}
          active={route || null}
          minimised={minimised}
        />
      )}
    </MotionConfig>
  );
}
