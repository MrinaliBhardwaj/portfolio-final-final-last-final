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
//
// THE MOTION IS CSS NOW, NOT FRAMER (see .tm-* in cover.css). It was one
// `motion.span` per character under an AnimatePresence in popLayout mode, and
// measured on the cover (scripts/measure-cover.mjs --profile) a single tick of
// one column cost more main-thread time than a re-render of the whole page:
// twenty-odd components mounting, each resolving keyframes for opacity, y and
// blur, each starting its own animations, and popLayout forcing a layout to
// pin the outgoing word. Two columns, every 2.6 seconds, for as long as the
// cover is open — including straight through a visitor's first scroll.
//
// As keyframes on plain spans the same tick is one small render and the
// browser's compositor does the rest: nothing is measured, nothing is driven
// from script. The picture is the same — same 5px drift, same 5px blur, same
// 30ms-per-character stagger, same 0.3s/0.4s durations and ease-in-out.
//
// The outgoing word is simply rendered once more, as `.is-out`, laid over the
// incoming one. It stays in the DOM, finished and invisible, until the next
// tick replaces it — which saves the clean-up render AnimatePresence needed.
import { useEffect, useMemo, useState } from "react";

// one flat char counter across the whole phrase so the stagger doesn't
// restart at each word boundary
const split = (word) => {
  let n = 0;
  return String(word)
    .split(" ")
    .map((w) => Array.from(w).map((ch) => ({ ch, i: n++ })));
};

function Phrase({ word, mode }) {
  const groups = useMemo(() => split(word), [word]);
  return (
    <span className={`tm-phrase${mode ? ` is-${mode}` : ""}`}>
      {groups.map((chars, gi) => (
        <span className="tm-word" key={gi}>
          {chars.map(({ ch, i }) => (
            <span className="tm-char" key={i} style={{ "--i": i }}>
              {ch}
            </span>
          ))}
        </span>
      ))}
    </span>
  );
}

export default function TextMorph({
  words,
  interval = 2500,
  paused = false,
  // A PAUSE THAT COSTS NO RENDER. `paused` is a prop, so flipping it means
  // re-rendering whoever owns it — and on the cover that owner is the whole
  // Cover, at the one moment (mid-scroll) it can least afford a render. A ref
  // is read by the timer instead: a tick that finds it set simply does
  // nothing, and nobody above has to be told.
  pausedRef = null,
  className = "",
}) {
  // `prev` is the word on its way out; -1 until the first tick, so the first
  // word is simply there rather than animating in (AnimatePresence's
  // `initial={false}`)
  const [{ index, prev }, setSlot] = useState({ index: 0, prev: -1 });

  useEffect(() => {
    if (!words?.length || paused) return;
    const timer = setInterval(() => {
      if (pausedRef?.current) return;
      setSlot((s) => ({ index: (s.index + 1) % words.length, prev: s.index }));
    }, interval);
    return () => clearInterval(timer);
  }, [words, interval, paused, pausedRef]);

  if (!words?.length) return null;

  // modulo rather than a bare lookup: a shorter list arriving while we're
  // parked on a high index would otherwise render undefined
  const at = (n) => words[n % words.length];

  return (
    <span className={`tm ${className}`.trim()}>
      {/* keyed by word AND role, so a word leaving is a fresh element whose
          exit keyframes start from the top, not the entering one reused */}
      {prev >= 0 && <Phrase key={`${prev}:out`} word={at(prev)} mode="out" />}
      <Phrase key={`${index}:in`} word={at(index)} mode={prev >= 0 ? "in" : ""} />
    </span>
  );
}
