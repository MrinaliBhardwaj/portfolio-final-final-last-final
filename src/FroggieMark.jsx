// THE GAME'S ICON — her frog, not a borrowed glyph.
//
// This is the one dock tile with no brand behind it, because the Lotus Pond is
// hers: froggie is her own game, so a third-party mark would be wrong here and a
// generic lucide flower (what sat here before) said nothing about what the app
// actually is. So the icon is the frog.
//
// EVERY COLOUR IS THE GAME'S OWN, lifted from src/froggie/config/theme.ts rather
// than picked to look froggy — frogBody #7cbf74, frogBodyLit #9bd68c, frogBelly
// #f2ead0, frogCheek #e79ab0, frogEye #232f3a, frogEyeHi #eaf2ff, frogMouth
// #3a4a3f, with skyLow/waterDeep behind and the moon and lily pad in moon and
// bambooLeaf. Open the game and the icon is the same creature in the same light.
//
// Built from ellipses and discs on purpose: that is how the game itself draws
// (see FrogPose.ts — `fillEllipse`, `disc`, and limbs as "a run of discs"), so
// the shapes here are the same vocabulary rather than a different illustration
// of the same idea.
//
// The night-pond tile is what makes it read as an APP icon beside VS Code and
// Notes, which carry their own tiles. A bare frog would have floated.
export default function FroggieMark({ size = 24, ...rest }) {
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
      {/* the moon, clear of the eye domes below it */}
      <circle cx="26" cy="5.4" r="2.2" fill="#f5eccb" opacity="0.9" />
      {/* the lily pad he sits on */}
      <ellipse cx="16" cy="27.6" rx="11" ry="2.5" fill="#20364e" />

      {/* head and eye domes share one silhouette — same fill, drawn as three
          shapes so the domes read as bumps rather than as separate balls */}
      <ellipse cx="16" cy="20" rx="10.5" ry="7.6" fill="#7cbf74" />
      <circle cx="10.6" cy="12.4" r="4.7" fill="#7cbf74" />
      <circle cx="21.4" cy="12.4" r="4.7" fill="#7cbf74" />
      {/* moonlight across the top of the head */}
      <ellipse cx="16" cy="16.6" rx="8" ry="3.4" fill="#9bd68c" opacity="0.55" />

      {/* muzzle, cheeks, smile */}
      <ellipse cx="16" cy="23.4" rx="6.6" ry="3.6" fill="#f2ead0" />
      <circle cx="7.7" cy="21.4" r="1.7" fill="#e79ab0" opacity="0.85" />
      <circle cx="24.3" cy="21.4" r="1.7" fill="#e79ab0" opacity="0.85" />
      <path
        d="M12.4 22.2q3.6 2.8 7.2 0"
        fill="none"
        stroke="#3a4a3f"
        strokeWidth="1.2"
        strokeLinecap="round"
      />

      {/* eyes last, so nothing paints over them */}
      <circle cx="10.6" cy="12" r="2.9" fill="#eaf2ff" />
      <circle cx="21.4" cy="12" r="2.9" fill="#eaf2ff" />
      <circle cx="11.2" cy="12.4" r="1.5" fill="#232f3a" />
      <circle cx="22" cy="12.4" r="1.5" fill="#232f3a" />
      <circle cx="10.5" cy="11.6" r="0.62" fill="#fff" />
      <circle cx="21.3" cy="11.6" r="0.62" fill="#fff" />
    </svg>
  );
}
