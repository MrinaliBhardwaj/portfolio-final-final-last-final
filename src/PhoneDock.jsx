// THE PHONE'S DOCK — one dock, in one place, on every screen.
//
// It started inside the home screen (PhoneHome.jsx) while the worlds kept the
// Mac dock, which on a phone is a rail down the left edge. That meant the
// phone had two docks in two different places depending on where you were:
// tap Figma and the thing you launched it from jumped to the other side of the
// screen. On iOS the dock is the one piece of furniture that never moves, so
// App renders THIS on every phone route instead — the cover included, where it
// surfaces with the home screen as the bloom settles.
//
// The four apps are the Mac dock's four, in the Mac dock's order, and the dot
// under an icon means the same thing it does there: this world is open, or was
// minimised with the yellow light and is still open behind you.
import {
  FigmaMarkColor,
  VSCodeMark,
  ApplePhotosMark,
} from "./BrandIcons.jsx";
import FroggieMark from "./FroggieMark.jsx";

// `skin`/`glyph`/`bg` are the icon contract described in PhoneHome.jsx: a mark
// that already draws its own filled tile bleeds to the edges; a bare glyph gets
// a tile from us, sized by height so a tall logo is not shrunk.
const APPS = [
  {
    key: "figma",
    world: "design",
    aria: "Figma — enter the design world",
    href: "#/design",
    mark: <FigmaMarkColor className="ph-mark-glyph" aria-hidden="true" />,
    skin: "light",
    glyph: "70%",
  },
  {
    key: "vscode",
    world: "tech",
    aria: "VS Code — enter the tech world",
    href: "#/tech",
    mark: <VSCodeMark className="ph-mark-glyph" aria-hidden="true" />,
    skin: "light",
    glyph: "68%",
  },
  {
    key: "gallery",
    world: "gallery",
    aria: "Gallery — open the dome gallery",
    href: "#/gallery",
    mark: <ApplePhotosMark className="ph-mark-glyph" aria-hidden="true" />,
    skin: "light",
    glyph: "72%",
  },
  {
    key: "pond",
    world: "pond",
    aria: "Game — the Lotus Pond, catch coding bugs with a pixel frog",
    href: "#/pond",
    mark: <FroggieMark className="ph-mark-glyph" aria-hidden="true" />,
    skin: "bleed",
    bg: "#123a52",
  },
];

export default function PhoneDock({ visible = true, active = null, minimised = [] }) {
  return (
    <nav className={`ph-dock${visible ? " is-on" : ""}`} aria-label="Dock">
      {APPS.map((a) => {
        const on = a.world === active || minimised.includes(a.world);
        return (
          <a
            key={a.key}
            className={`ph-dock-item${on ? " is-active" : ""}`}
            href={a.href}
            aria-label={a.aria}
            aria-current={on ? "page" : undefined}
            tabIndex={visible ? undefined : -1}
          >
            <span
              className={`ph-mark is-${a.skin}`}
              style={{ "--ph-glyph": a.glyph, "--ph-mark-bg": a.bg }}
            >
              {a.mark}
            </span>
            <span className="ph-dock-dot" aria-hidden="true" />
          </a>
        );
      })}
    </nav>
  );
}
