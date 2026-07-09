import { useEffect, useState } from "react";
import { motion, AnimatePresence, MotionConfig } from "framer-motion";
import Hero from "./Hero.jsx";
import Tear from "./Tear.jsx";
import DesignSide from "./DesignSide.jsx";
import EngineeringSide from "./EngineeringSide.jsx";
import "./hero.css";
import "./tear.css";
import "./design-side.css";
import "./engineering-side.css";

const EASE = [0.22, 1, 0.36, 1];

// Hash routes make each side directly linkable: send #/design with design
// applications and #/engineering with SWE applications — those visitors
// never see the other side at all.
const TITLES = {
  "": "Mrinali Bhardwaj — Profile",
  design: "Mrinali Bhardwaj — Design",
  engineering: "Mrinali Bhardwaj — Engineering",
};

function getRoute() {
  const h = window.location.hash.replace(/^#\/?/, "");
  return h === "design" || h === "engineering" ? h : "";
}

function scrollToAnchor(anchor) {
  const el = document.getElementById(anchor);
  if (!el) return;
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

export default function App() {
  const [route, setRoute] = useState(getRoute);

  useEffect(() => {
    const onHash = () => setRoute(getRoute());
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    document.title = TITLES[route];
    window.scrollTo(0, 0);
  }, [route]);

  return (
    <div className="page">
      <MotionConfig reducedMotion="user">
      <AnimatePresence mode="wait">
        {route === "" && (
          <motion.main
            key="cover"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
          >
            <Hero />
            <Tear />
          </motion.main>
        )}

        {route === "design" && (
          <motion.main
            key="design"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
          >
            <DesignSide />
          </motion.main>
        )}

        {route === "engineering" && (
          <motion.main
            key="engineering"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: EASE }}
          >
            <EngineeringSide onNav={scrollToAnchor} />
          </motion.main>
        )}
      </AnimatePresence>
      </MotionConfig>
    </div>
  );
}
