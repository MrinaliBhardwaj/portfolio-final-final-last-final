import React from "react";
import { createRoot } from "react-dom/client";
// Every face here is one something on screen actually paints. Three were
// dropped after checking what the browser really renders rather than what the
// stylesheet hints at: archivo's wdth-italic (nothing in --font-sans is ever
// italic), cormorant 600 (the cover uses 500 for titles and 400 for body,
// nothing asks for 600) and caveat 600 (both handwritten notes compute to 400
// and contain no bold). Unused @font-face rules never download the woff2, but
// they do ship in the CSS and they invite the next person to assume the weight
// is available.
//
// SUBSETS. The static families below are imported latin + latin-ext only,
// which drops the cyrillic, cyrillic-ext and vietnamese cuts they otherwise
// ship. latin-ext is NOT optional padding — it is what carries the accented
// glyphs, and dropping it would silently fall back to a system serif mid-word.
//
// The four VARIABLE families (archivo, inter, jetbrains-mono, ballet) are left
// whole on purpose: @fontsource-variable publishes one stylesheet per axis, not
// per subset, so trimming them would mean hand-writing @font-face rules against
// paths inside node_modules. Their unused subsets already cost a visitor
// nothing — every face is guarded by `unicode-range`, so the browser never
// requests a cut it has no characters for. That is deploy weight, not download
// weight, and not worth the fragility.
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/jetbrains-mono";
// TRUE italic, because the tech world renders comments in it and a synthesised
// slant is the wrong shape: JetBrains Mono's italic is a drawn face, and the
// browser's fallback is a shear applied to the upright — including to the box
// drawing characters in the file dividers, which a shear visibly bends. This is
// the only italic face the site loads; nothing else is ever italic.
import "@fontsource-variable/jetbrains-mono/wght-italic.css";
import "@fontsource-variable/inter";
import "@fontsource-variable/ballet";
import "@fontsource/pinyon-script/latin-400.css";
import "@fontsource/pinyon-script/latin-ext-400.css";
import "@fontsource/cormorant-garamond/latin-400.css";
import "@fontsource/cormorant-garamond/latin-ext-400.css";
import "@fontsource/cormorant-garamond/latin-500.css";
import "@fontsource/cormorant-garamond/latin-ext-500.css";
import "@fontsource/space-mono/latin-400.css";
import "@fontsource/space-mono/latin-ext-400.css";
// the scrapbook's pencil hand (Notes). Without it every handwritten note in
// the archive falls back to `cursive` — Comic Sans on Windows.
import "@fontsource/caveat/latin-400.css";
import "@fontsource/caveat/latin-ext-400.css";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
