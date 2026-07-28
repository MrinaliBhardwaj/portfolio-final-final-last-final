// NOTES — the dock's app between VS Code and Photos, and the home of the
// site's own prehistory: the hand-drawn scrapbook that was the portfolio
// before the lotus.
//
// Two sheets, scrolled: page one is "meet mini mri" — the design origin story,
// eleven years old with a camera and two polaroids; page two is the tech story,
// the desk collage where ideas start getting built. Both are RECOVERED files
// (Scene.jsx / SceneTwo.jsx) — see their headers.
//
// This file is only the frame: the app chrome and the profile wiring. The
// scenes' art is untouched.
//
// Notes is the portfolio's one LIGHT world on purpose. Design, tech, gallery
// and the pond are all dark; the scrapbook is paper, and Apple Notes is paper
// too, so the app and its contents agree instead of fighting.
import { X } from "lucide-react";
import Scene from "./Scene.jsx";
import SceneTwo from "./SceneTwo.jsx";

export default function NotesWorld() {
  // The PROFILE.TXT / PROFILE.DOC file tabs and their "pull for profile"
  // pencil notes are gone (27 July 2026, by request), so the scenes no longer
  // take an `onOpen` — the scrapbook is now purely something you read, and the
  // dock is the way out of it.
  const back = () => {
    window.location.hash = "/";
  };

  return (
    <div className="nw">
      <header className="nw-top">
        <a className="nw-mark" href="#/" aria-label="Mrinali Bhardwaj — home">
          mb
        </a>
        <span className="nw-app">Notes</span>
        <button
          type="button"
          className="nw-close"
          onClick={back}
          aria-label="Close Notes and return to the start"
        >
          <X size={18} strokeWidth={1.6} aria-hidden="true" />
        </button>
      </header>

      {/* Phones only (see notes-world.css). Both pages are wide fixed-aspect
          artwork with the copy baked in, so on a phone they are sized by
          HEIGHT and panned sideways rather than shrunk to fit the width —
          this is the one line that says so. It sits outside both sheets
          because each sheet is its own scroll port. */}
      <p className="nw-pan">both pages pan sideways &rarr;</p>

      <Scene />
      <SceneTwo />

      <p className="nw-coda">
        drawn june 2026 &mdash; the first draft of this site, kept.
      </p>
    </div>
  );
}
