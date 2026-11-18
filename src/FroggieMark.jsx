// THE GAME'S ICON — her frog, not a borrowed glyph.
//
// This is the one dock tile with no brand behind it, because the Lotus Pond is
// hers: froggie is her own game, so a third-party mark would be wrong here and a
// generic lucide flower (what sat here before) said nothing about what the app
// actually is. So the icon is the frog.
//
// HER PIXEL FROG (18 Nov 2026). This used to be a frog drawn here in SVG
// ellipses, in the game's palette. It is now her own pixel-art sticker —
// public/dock/froggie.webp, cropped to the sticker's edge and saved at 320px,
// which covers the largest this tile ever draws at a 2x screen. Pixel art suits
// it better than the vector frog did: the game is "catch coding bugs with a
// pixel frog". Both docks (Mac and phone) draw this one component, so the
// icon is the same everywhere.
//
// The night-pond tile is what makes it read as an APP icon beside VS Code and
// Figma, which carry their own tiles. A bare sticker would have floated. The
// sticker brings its own white outline, so it holds against the dark pond.
const SRC = "/dock/froggie.webp";
// the sticker's own proportions (320x234), so it is never stretched
const ASPECT = 234 / 320;

export default function FroggieMark({ size = 24, ...rest }) {
  // 88% of the tile wide, centred, and a hair low: the sticker's lily pad is
  // its base, so true centre would read as floating upward
  const w = 28.2;
  const h = w * ASPECT;
  return (
    <svg viewBox="0 0 32 32" width={size} height={size} {...rest}>
      <defs>
        <linearGradient id="fg-pond" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2a2b55" />
          <stop offset="1" stopColor="#0e1b30" />
        </linearGradient>
      </defs>

      {/* the pond at night */}
      <rect width="32" height="32" rx="7.2" fill="url(#fg-pond)" />
      <image
        href={SRC}
        x={(32 - w) / 2}
        y={(32 - h) / 2 + 0.6}
        width={w}
        height={h}
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
}
