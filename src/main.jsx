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
import "@fontsource-variable/archivo/wdth.css";
import "@fontsource-variable/jetbrains-mono";
import "@fontsource-variable/inter";
import "@fontsource-variable/ballet";
import "@fontsource/pinyon-script";
import "@fontsource/cormorant-garamond/400.css";
import "@fontsource/cormorant-garamond/500.css";
import "@fontsource/space-mono/400.css";
// the scrapbook's pencil hand (Notes). Without it every handwritten note in
// the archive falls back to `cursive` — Comic Sans on Windows.
import "@fontsource/caveat/400.css";
import App from "./App.jsx";
import "./index.css";

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
