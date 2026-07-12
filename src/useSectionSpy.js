// Shared scroll-spy for the world pages' sidebars (tech explorer, design
// layers panel). The active section is whichever one's top has most recently
// crossed a line near the top of the viewport (the classic scrollspy
// approach — IntersectionObserver ratio ranking breaks when section heights
// differ a lot), with the last section pinned once the page is scrolled to
// the very bottom.
//
// A click-selected section becomes active immediately and holds until its
// smooth-scroll settles: on a short page several sections can sit fully
// visible at max scroll, so scroll position alone can't always tell which
// one the user meant.
import { useEffect, useRef, useState } from "react";

function jumpTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const reduced = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;
  el.scrollIntoView({ behavior: reduced ? "auto" : "smooth", block: "start" });
}

export default function useSectionSpy(sectionIds) {
  const [active, setActive] = useState(sectionIds[0]);
  const jumpingRef = useRef(false);
  const jumpTimeoutRef = useRef(null);
  const idsRef = useRef(sectionIds);
  idsRef.current = sectionIds;

  useEffect(() => {
    let raf = null;

    const update = () => {
      raf = null;
      if (jumpingRef.current) return;

      const ids = idsRef.current;
      const els = ids.map((id) => document.getElementById(id)).filter(Boolean);
      const line = window.innerHeight * 0.3;
      const atBottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - 2;

      let current = els[0]?.id;
      for (const el of els) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
      }
      if (atBottom) current = ids[ids.length - 1];
      if (current) setActive(current);
    };

    const onScroll = () => {
      if (raf === null) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  const select = (id) => {
    setActive(id);
    jumpingRef.current = true;
    if (jumpTimeoutRef.current) clearTimeout(jumpTimeoutRef.current);
    jumpTo(id);

    // release when the smooth-scroll settles — but ALWAYS keep a timeout
    // fallback, because scrollend never fires when the click lands on the
    // section already in view (no movement), which would otherwise freeze
    // the spy on that section forever
    let released = false;
    const release = () => {
      if (released) return;
      released = true;
      jumpingRef.current = false;
      window.removeEventListener("scrollend", release);
      if (jumpTimeoutRef.current) clearTimeout(jumpTimeoutRef.current);
    };
    if ("onscrollend" in window) {
      window.addEventListener("scrollend", release, { once: true });
    }
    jumpTimeoutRef.current = setTimeout(release, 1000);
  };

  return [active, select];
}
