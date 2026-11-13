// THE DRESS REHEARSAL — why a first visit's first scroll no longer freezes.
//
// THE PROBLEM IT SOLVES IS NOT IN THE PAGE. A browser draws with small GPU
// programs — shaders — and builds each one the first time a new KIND of
// drawing reaches the screen: the first blur, the first drop shadow, the first
// glass, the first image faded over another. Building one takes the GPU's
// presenting thread tens to hundreds of milliseconds, and while it waits,
// nothing is presented at all: not the lotus, not the scroll, nothing.
//
// On this cover almost every kind of drawing first appears at the same
// moment — the settle, when the dock rises out of a blur and seventeen files
// fade up over the flower. Traced on a cold profile (scripts/measure-cover.mjs
// --gpu): SEVENTY programs were linked during one first scroll, and the GPU
// thread spent 1.9 SECONDS waiting on them, in blocks of up to 600ms. That is
// the lag on the first scroll, all of it that was left once the page itself
// had been taken out of the way — and it is why it only ever happened once:
// the browser keeps what it builds, so a second scroll finds every program
// ready. Every earlier fix made the page faster, which is real, and none could
// touch this, because none of it is the page's work.
//
// The programs cannot be shipped and cannot be asked for. They can only be
// CAUSED — by drawing the thing. So the thing is drawn early: while the
// visitor is still reading the name, the desk makes its whole entrance once,
// for real, behind a curtain at 1% opacity. Same elements, same transitions,
// same blur sweeping from 14px to nothing — so the same programs — and nobody
// sees it. When the scroll arrives at the settle, the GPU has done all of this
// before. Measured with the rehearsal in place: 70 programs became 10, and the
// longest stretch with nothing reaching the screen fell from ~620ms to ~140ms.
//
// HOW IT IS STAGED. <html data-desk> already drives both entrances (dock.css,
// desktop-files.css). Two more values exist only for this:
//   "rehearse" — everything in its "up" pose, under the curtains
//   "strike"   — everything dropped back down at once, curtains still closed
// then "down" again, as if nothing happened. The curtain is the parent, not
// the performers: each tile and the dock run their REAL styles to their real
// final values inside an invisible group, which is what makes the programs the
// right ones. Pinning each performer's own opacity to 1% would rehearse a
// different play.
//
// IT YIELDS TO THE REAL THING. Every step checks that the attribute still
// holds what the rehearsal last wrote; if a fast scroll has already taken the
// stage ("up"), the rehearsal simply stops and never touches it again.

// the dock's rise is 1.4s and the last file lands at ~1.15s; a little air
const REHEARSE_MS = 1800;
// How long to wait for the desk's art before going on without it. A tile
// whose image has not arrived draws nothing and rehearses nothing — but every
// tile is the same KIND of drawing, so a few latecomers cost little, while a
// late start costs everything: the programs take the GPU ~2s to build however
// they are asked for, and a rehearsal still running when the visitor scrolls
// is a rehearsal they feel. Measured at 2500 it had not begun 4s after load.
const ART_TIMEOUT_MS = 600;

/**
 * Run the desk's entrance once, invisibly. Call it when the cover mounts on a
 * visit that still owes the ceremony.
 * @returns {() => void} cancel — safe to call at any point
 */
export function rehearseDesk() {
  const root = document.documentElement;
  let cancelled = false;
  const timers = new Set();

  const holds = (value) => !cancelled && root.dataset.desk === value;
  const wait = (ms) =>
    new Promise((resolve) => {
      const id = setTimeout(() => {
        timers.delete(id);
        resolve();
      }, ms);
      timers.add(id);
    });
  // two frames: one for the style to be applied, one for it to be presented
  const painted = () =>
    new Promise((resolve) =>
      requestAnimationFrame(() => requestAnimationFrame(() => resolve()))
    );

  (async () => {
    /** @type {HTMLImageElement[]} */
    const art = Array.from(
      document.querySelectorAll(".cover-desktop img, .dock img")
    );
    await Promise.race([
      // decode(), not just load: the bitmap is ready to become a texture
      Promise.allSettled(art.map((img) => img.decode?.() ?? Promise.resolve())),
      wait(ART_TIMEOUT_MS),
    ]);
    await painted();
    if (!holds("down")) return;

    root.dataset.desk = "rehearse";
    await wait(REHEARSE_MS);
    if (!holds("rehearse")) return;

    root.dataset.desk = "strike";
    await painted();
    if (!holds("strike")) return;

    root.dataset.desk = "down";
  })();

  return () => {
    const mine = root.dataset.desk === "rehearse" || root.dataset.desk === "strike";
    cancelled = true;
    for (const id of timers) clearTimeout(id);
    timers.clear();
    if (mine) root.dataset.desk = "down";
  };
}
