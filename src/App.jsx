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
import PondWorld from "./PondWorld.jsx";
import Dock from "./Dock.jsx";
import "./cover.css";
import "./dock.css";
import "./world-tabs.css";
import "./design-world.css";
import "./figma-panel.css";
import "./file-tree.css";
import "./tech-world.css";
import "./gallery-world.css";
import "./pond-world.css";

const TITLES = {
  "": "Mrinali Bhardwaj",
  design: "Mrinali Bhardwaj - Design",
  tech: "Mrinali Bhardwaj - Tech",
  gallery: "Mrinali Bhardwaj - Gallery",
  pond: "Mrinali Bhardwaj - The Pond",
};

const WIPE_BG = {
  design: "#f4f3f0",
  tech: "#090d0b",
  gallery: "#05040a",
  pond: "#030807",
};

function getRoute() {
  // the pond takes dev flags after a "?" (#/pond?sim) — route on the path only
  const hash = window.location.hash
    .replace(/^#\/?/, "")
    .split("?")[0]
    .toLowerCase();
  if (hash === "design") return "design";
  // "engineering" kept as an alias for links already in circulation
  if (hash === "tech" || hash === "engineering") return "tech";
  if (hash === "gallery") return "gallery";
  // the dock calls it the Game; the piece calls itself the pond
  if (hash === "pond" || hash === "game") return "pond";
  return "";
}

export default function App() {
  const [route, setRoute] = useState(getRoute);
  const [entering, setEntering] = useState(null);
  const [coverSettled, setCoverSettled] = useState(false);
  const navigated = useRef(false);

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

  const choose = (world) => {
    if (entering) return;
    navigated.current = false;
    setEntering(world);
  };

  // the dock's click semantics depend on where you are: from the cover it
  // launches a world with the wipe; on a world it switches like a tab, and
  // clicking the already-open app just returns you to its top
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
          <motion.div
            key="design"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
          >
            <DesignWorld />
          </motion.div>
        )}

        {route === "tech" && (
          <motion.div
            key="tech"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
          >
            <TechWorld />
          </motion.div>
        )}

        {route === "gallery" && (
          <motion.div
            key="gallery"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
          >
            <GalleryWorld />
          </motion.div>
        )}

        {route === "pond" && (
          <motion.div
            key="pond"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.32 }}
          >
            <PondWorld />
          </motion.div>
        )}
      </AnimatePresence>

      {/* the OS layer: present on every route, above the page, below the wipe */}
      <Dock
        visible={route === "" ? coverSettled : true}
        onChoose={dockChoose}
        active={route || null}
      />

      <AnimatePresence>
        {entering && (
          <motion.div
            className="wipe"
            style={{ background: WIPE_BG[entering] }}
            initial={{ x: entering === "design" ? "-101%" : "101%" }}
            animate={{ x: "0%" }}
            exit={{
              opacity: 0,
              transition: { duration: 0.5, delay: 0.15, ease: "easeOut" },
            }}
            transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
            onAnimationComplete={() => {
              if (navigated.current) return;
              navigated.current = true;
              window.location.hash = "/" + entering;
              window.setTimeout(() => setEntering(null), 160);
            }}
          />
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
