// Cycles a list of words in one slot: the outgoing word blurs up and away, the
// incoming one resolves character by character, left to right.
//
// Ported from the shadcn-style `text-morph` recipe to this codebase's stack —
// plain JSX instead of TSX, `framer-motion` instead of `motion/react` (same
// AnimatePresence/motion API, already a dependency), and real class names
// instead of Tailwind utilities. Two deliberate changes to the original:
//
//   1. It splits on WORDS first, then characters. The original laid every char
//      out in one flex row, which cannot wrap — fine for "designer", but these
//      roles ("INTERACTION DESIGNER") live in a ~160px editorial column and
//      have to break across lines. Word groups wrap; the per-char stagger still
//      runs continuously across the whole phrase via a flat index.
//   2. It honours prefers-reduced-motion (a plain crossfade, no blur or drift)
//      and takes a `paused` prop, so the timer stops when the caller knows the
//      slot is off screen rather than re-rendering forever behind an opacity 0.
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

export default function TextMorph({
  words,
  interval = 2500,
  paused = false,
  className = "",
}) {
  const [index, setIndex] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!words?.length || paused) return;
    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % words.length);
    }, interval);
    return () => clearInterval(timer);
  }, [words, interval, paused]);

  // modulo rather than a bare lookup: a shorter list arriving while we're
  // parked on a high index would otherwise render undefined
  const word = words?.length ? words[index % words.length] : "";

  // one flat char counter across the whole phrase so the stagger doesn't
  // restart at each word boundary
  const groups = useMemo(() => {
    let n = 0;
    return String(word)
      .split(" ")
      .map((w) => Array.from(w).map((ch) => ({ ch, i: n++ })));
  }, [word]);

  if (!words?.length) return null;

  const from = reduced
    ? { opacity: 0 }
    : { opacity: 0, y: 5, filter: "blur(5px)" };
  const to = reduced
    ? { opacity: 1 }
    : { opacity: 1, y: 0, filter: "blur(0px)" };
  const out = reduced
    ? { opacity: 0 }
    : { opacity: 0, y: -5, filter: "blur(5px)" };

  return (
    <span className={`tm ${className}`.trim()}>
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={index}
          className="tm-phrase"
          initial={reduced ? { opacity: 0 } : { opacity: 0, y: 5 }}
          animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduced ? { opacity: 0 } : { opacity: 0, y: -5 }}
          transition={{ duration: 0.4 }}
        >
          {groups.map((chars, gi) => (
            <span className="tm-word" key={gi}>
              {chars.map(({ ch, i }) => (
                <motion.span
                  key={i}
                  className="tm-char"
                  initial={from}
                  animate={to}
                  exit={out}
                  transition={{ delay: reduced ? 0 : i * 0.03, duration: 0.3 }}
                >
                  {ch}
                </motion.span>
              ))}
            </span>
          ))}
        </motion.span>
      </AnimatePresence>
    </span>
  );
}
