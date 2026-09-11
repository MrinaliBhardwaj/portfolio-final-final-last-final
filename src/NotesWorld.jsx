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
import { Smartphone } from "lucide-react";
import Scene from "./Scene.jsx";
import SceneTwo from "./SceneTwo.jsx";
import WindowLights from "./WindowLights.jsx";

export default function NotesWorld() {
  return (
    <div className="nw">
      {/* The lone × on the right became the three lights on the left
          (18 Aug 2026) — see WindowLights.jsx; all three do something real. */}
      <header className="nw-top">
        <WindowLights world="notes" label="Notes" />
        <a className="nw-mark" href="#/" aria-label="Mrinali Bhardwaj — home">
          mb
        </a>
        <span className="nw-app">Notes</span>
      </header>

      {/* Portrait phones only (see notes-world.css): both pages are wide
          fixed-aspect artwork with the copy baked into the pixels, which
          cannot be shrunk to a portrait phone's width without the text going
          unreadable. Rather than pan or fake a rotated layout, this asks for
          the real thing — landscape gets no special treatment at all, because
          the same width-driven rules the desktop uses already work on it. */}
      <div className="nw-rotate-gate" role="status">
        <Smartphone size={30} strokeWidth={1.3} aria-hidden="true" />
        <p>
          turn your phone sideways
          <br />
          to read the scrapbook
        </p>
      </div>

      <Scene />
      {/* Page two is the LAST thing on the page. The poster collage that
          followed it (SceneThree.jsx, three viewport-tall sheets) was cut 12 Sep
          2026 by request, in the About Me window too; the file is kept, just
          not rendered. The "drawn june 2026" coda went before it (4 Aug 2026).
          Page two already reserves --nw-room for the floating dock, so ending
          on it puts nothing under the dock. */}
      <SceneTwo />
    </div>
  );
}
