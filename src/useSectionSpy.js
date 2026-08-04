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
      // Nothing mounted yet: say nothing. Reading a page with no sections in it
      // and then announcing a winner is how a wrong answer gets latched.
      if (!els.length) return;

      const line = window.innerHeight * 0.3;
      const doc = document.documentElement;

      // "SCROLLED TO THE BOTTOM" IS ONLY MEANINGFUL ON A PAGE THAT SCROLLS.
      // Without this guard the test `innerHeight + scrollY >= scrollHeight - 2`
      // is trivially TRUE whenever the document is exactly viewport-tall — and
      // a world is exactly viewport-tall for the first ~420ms of its life,
      // because WorldWindow pins and clips it while the open-zoom runs. So the
      // spy's first reading pinned the LAST section, and the design world woke
      // up showing contact in its layers and properties panels.
      const scrollable = doc.scrollHeight > window.innerHeight + 2;
      const atBottom =
        scrollable &&
        window.innerHeight + window.scrollY >= doc.scrollHeight - 2;

      let current = els[0].id;
      for (const el of els) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
      }
      if (atBottom) current = ids[ids.length - 1];
      setActive(current);
    };

    const onScroll = () => {
      if (raf === null) raf = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    // THE PAGE'S HEIGHT CHANGES WITHOUT A SCROLL OR A RESIZE, and that was the
    // other half of the bug. A world mounts pinned and viewport-tall, then the
    // zoom lands, the pin releases and the document becomes several screens —
    // no scroll event, no resize event, so the spy's one and only reading was
    // the pinned one and it stayed wrong until the visitor happened to scroll.
    // Watching the root element catches that, and any other late reflow (fonts
    // landing, an image finally sizing) for free.
    const ro =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(onScroll);
    ro?.observe(document.documentElement);

    return () => {
      if (raf !== null) cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      ro?.disconnect();
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
