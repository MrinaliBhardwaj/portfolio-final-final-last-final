// THE CD ON THE DESK PLAYS.
//
// WHY A CLICK AND NOT A HOVER. The idea was hover-to-play, and hover cannot do
// it: Chrome, Safari and Firefox all require USER ACTIVATION before audio with
// sound may start, and `mouseenter` is not one of the qualifying events —
// click, pointerdown, keydown and touchend are. `play()` from a hover handler
// is rejected with NotAllowedError. Activation is sticky per page, so it would
// have worked for anyone who had already clicked something, and this site's
// first-run path is land, SCROLL through the bloom, arrive at the desk — and
// scrolling does not grant activation either. It would have worked on the
// machine it was built on, where you click constantly, and been silent for a
// visitor. So the click is the switch, which is also how a CD player works.
//
// The hover still does something, and it is the part that is genuinely free:
// the disc spins. That is the affordance saying this object is not decoration.
//
// WHAT SPINS, AND WHY IT IS NOT THE IMAGE. `.dpiece img` carries a
// `drop-shadow` filter, and a filtered element that rotates has to be
// re-rasterised every frame it moves — a real cost for as long as the pointer
// rests there. So the still image keeps its shadow and does not move, and a
// second, unfiltered layer sits on top carrying the same artwork clipped to a
// circle. Rotating a circle sweeps exactly the circle it already occupied, so
// the jewel case stays put and only the disc turns. No second asset: it is the
// same file, clipped.
//
// SWAPPING THE TRACK. public/audio/desk-track.mp3 is twenty seconds of
// generated silence — a valid file so the whole mechanism is testable, and
// nothing anyone would want to hear. Replace that file and nothing here
// changes. Prefer a 30-45s SEAMLESS LOOP over a whole song: nobody holds a
// pointer still for four minutes, a loop starts without a buffering gap, and
// it is a tenth of the bytes. It is fetched on the first click and never
// before (`preload="none"`), so until someone asks for it, it costs nothing.
import { useCallback, useEffect, useRef, useState } from "react";

const TRACK = "/audio/desk-track.mp3";

// Long enough not to click, short enough not to feel like a dissolve. Cutting
// a track dead on pause sounds like the page broke rather than like a stop.
const FADE_MS = 120;

export default function CdPlayer({ piece, style, visible }) {
  const audioRef = useRef(null);
  const fadeRef = useRef(0);
  const [playing, setPlaying] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [blocked, setBlocked] = useState(false);

  // Ramp the volume rather than stepping it. rAF rather than a timer so the
  // ramp is tied to frames the browser is actually drawing.
  // THE CLOCK COMES FROM THE FIRST FRAME, NOT FROM THE CALLER.
  //
  // This took `start` from `performance.now()` here, at call time, and compared
  // the rAF timestamp against it. A rAF callback is handed the timestamp of the
  // frame it belongs to, and input events are processed at the START of a
  // frame — so a fade begun inside a click handler got a first timestamp about
  // 29ms EARLIER than its own start, making the ratio negative. The volume
  // setter is range-checked: `volume = -0.24` throws IndexSizeError, the
  // exception kills the rAF chain, and the fade dies on frame one. Both
  // directions were broken (fading out overshot to 1.24), so the track would
  // have started silent and stopped dead — the exact thing the fade is for.
  //
  // Taking the baseline from the first callback puts both ends of the
  // subtraction on the same clock. The clamp is belt and braces: a value out
  // of range here throws rather than saturating, so it must never be reached.
  const fadeTo = useCallback((to, done) => {
    const audio = audioRef.current;
    if (!audio) return;
    cancelAnimationFrame(fadeRef.current);
    const from = audio.volume;
    let start = null;
    const step = (now) => {
      if (start === null) start = now;
      const k = Math.min(1, Math.max(0, (now - start) / FADE_MS));
      const v = from + (to - from) * k;
      audio.volume = v < 0 ? 0 : v > 1 ? 1 : v;
      if (k < 1) fadeRef.current = requestAnimationFrame(step);
      else done?.();
    };
    fadeRef.current = requestAnimationFrame(step);
  }, []);

  const stop = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    setPlaying(false);
    fadeTo(0, () => audio.pause());
  }, [fadeTo]);

  // ASK THE ELEMENT, NOT REACT. This read `playing` and drove that state from
  // the resolution of `play()` — and that promise does not settle when
  // playback is REQUESTED, it settles when playback has actually begun, which
  // with `preload="none"` means after the file has been fetched and buffered.
  // Measured with trusted input: the audio was running while the button still
  // read "Play the music", and a second click inside that window called
  // `play()` again instead of stopping, because React's `playing` was still
  // false. `audio.paused` is never stale, so the decision is made from it and
  // the state below is driven by the element's own play/pause events.
  const toggle = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!audio.paused) return stop();
    // Start silent and come up, so the first instant is never a thump. The
    // ramp begins now rather than on the promise, for the same reason.
    audio.volume = 0;
    const started = audio.play();
    fadeTo(1);
    // Should not happen from a click — the click IS the activation — but a
    // browser that refuses should say so rather than leave a dead object.
    if (started) started.catch(() => setBlocked(true));
  }, [stop, fadeTo]);

  // NOBODY WANTS MUSIC FROM A TAB THEY CANNOT SEE. A portfolio left open in a
  // background tab playing to an empty room is the thing people close tabs at
  // random to find.
  useEffect(() => {
    if (!playing) return;
    const onHide = () => document.hidden && stop();
    document.addEventListener("visibilitychange", onHide);
    return () => document.removeEventListener("visibilitychange", onHide);
  }, [playing, stop]);

  useEffect(() => () => cancelAnimationFrame(fadeRef.current), []);

  // Spin while the pointer is on it, and keep spinning for as long as it
  // plays — a stopped disc with sound coming out of it would read as broken.
  const spinning = hovered || playing;

  const label = blocked
    ? "The browser blocked the music"
    : playing
      ? "Stop the music"
      : "Play the music";

  return (
    <button
      type="button"
      className={`dpiece dpiece-cd${spinning ? " is-spinning" : ""}`}
      data-key={piece.key}
      style={style}
      aria-label={label}
      aria-pressed={playing}
      tabIndex={visible ? 0 : -1}
      onPointerEnter={() => setHovered(true)}
      onPointerLeave={() => setHovered(false)}
      onBlur={() => setHovered(false)}
      onFocus={() => setHovered(true)}
      onClick={toggle}
    >
      <span className="dpiece-art">
        <img src={piece.src} alt="" decoding="async" draggable="false" />
        {/* the same artwork, clipped to the disc and free of the shadow */}
        <span
          className="cd-disc"
          aria-hidden="true"
          style={{ backgroundImage: `url(${piece.src})` }}
        />
      </span>
      {/* The element is the source of truth for whether it is playing; these
          two events are what keep the label, the pressed state and the spin
          honest from the instant playback starts, rather than a beat later. */}
      <audio
        ref={audioRef}
        src={TRACK}
        preload="none"
        loop
        onPlay={() => {
          setPlaying(true);
          setBlocked(false);
        }}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
      />
    </button>
  );
}
