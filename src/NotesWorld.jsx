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
import Scene from "./Scene.jsx";
import SceneTwo from "./SceneTwo.jsx";
import WindowLights from "./WindowLights.jsx";
import "./notes-world.css";

export default function NotesWorld() {
  return (
    <div className="nw">
      {/* The lone × on the right became the three lights on the left
          (18 Aug 2026) — see WindowLights.jsx; all three do something real. */}
      <header className="nw-top">
        <WindowLights world="notes" label="Notes" />
        <a className="nw-mark" href="#/" aria-label="Mrinali Bhardwaj: home">
          mb
        </a>
        <span className="nw-app">Notes</span>
      </header>

      {/* Portrait phones only (see notes-world.css): .nw-turn lays the
          landscape scrapbook on its side, already turned, so a visitor holding
          the phone upright just turns it to read; nothing asks them to. On
          every other screen the wrapper is inert. */}
      <div className="nw-turn">
        <Scene />
        {/* Page two is the LAST thing on the page. The poster collage that
            followed it (SceneThree.jsx, three viewport-tall sheets) was cut 12 Sep
            2026 by request, in the About Me window too; the file is kept, just
            not rendered. The "drawn june 2026" coda went before it (4 Aug 2026).
            Page two already reserves --nw-room for the floating dock, so ending
            on it puts nothing under the dock. */}
        <SceneTwo />
      </div>
    </div>
  );
}
