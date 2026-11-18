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
// which covers the largest this ever draws at a 2x screen.
//
// NO TILE OF ITS OWN, the same day, on her call: on the Mac it sits bare in
// the dock beside Figma and Photos, and on the phone it gets the same white
// tile those do (PhoneDock.jsx, skin "light"). The night-pond tile it used to
// carry made it the odd one out on both. So this draws the sticker and nothing
// else, and the viewBox IS the sticker — 320x234 — so a caller sizing it by
// height (the phone does) gets the frog, not a padded square around it.
const SRC = "/dock/froggie.webp";

export default function FroggieMark({ size = 24, ...rest }) {
  return (
    <svg viewBox="0 0 320 234" width={size} height={(size * 234) / 320} {...rest}>
      <image
        href={SRC}
        width="320"
        height="234"
        preserveAspectRatio="xMidYMid meet"
      />
    </svg>
  );
}
