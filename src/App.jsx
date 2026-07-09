// Shell: hash routes keep each world directly linkable. Send #/design with
// design applications and #/tech with engineering ones; those visitors never
// see the other world. Choosing a side on the cover triggers a full-screen
// wipe in the destination world's color, then navigates.
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import Cover from "./Cover.jsx";
import DesignWorld from "./DesignWorld.jsx";
import TechWorld from "./TechWorld.jsx";
import "./cover.css";
import "./dock.css";
import "./design-world.css";
import "./file-tree.css";
import "./tech-world.css";

const TITLES = {
  "": "Mrinali Bhardwaj",
  design: "Mrinali Bhardwaj - Design",
  tech: "Mrinali Bhardwaj - Tech",
};

const WIPE_BG = { design: "#f4f3f0", tech: "#090d0b" };

function getRoute() {
  const hash = window.location.hash.replace(/^#\/?/, "").toLowerCase();
  if (hash === "design") return "design";
  // "engineering" kept as an alias for links already in circulation
  if (hash === "tech" || hash === "engineering") return "tech";
  return "";
}

export default function App() {
  const [route, setRoute] = useState(getRoute);
  const [entering, setEntering] = useState(null);
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
  }, [route]);

  const choose = (world) => {
    if (entering) return;
    navigated.current = false;
    setEntering(world);
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
            <Cover onChoose={choose} />
          </motion.div>
        )}

        {route === "design" && (
          <motion.div
            key="design"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
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
            transition={{ duration: 0.35 }}
          >
            <TechWorld />
          </motion.div>
        )}
      </AnimatePresence>

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
              window.location.hash =
                entering === "design" ? "/design" : "/tech";
              window.setTimeout(() => setEntering(null), 160);
            }}
          />
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
