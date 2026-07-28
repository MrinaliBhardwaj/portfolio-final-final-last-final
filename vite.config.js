import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Vite transpiles the vendored TypeScript game under src/froggie natively via
// esbuild — no plugin needed for it. `npm run typecheck` runs tsc for real.
//
// dev-only: window.__pond.snap() POSTs a rendered frame here so the pond can be
// verified visually. A hidden browser tab never fires rAF, so a screenshot of a
// background pane sees nothing — the frame has to be stepped by hand and read
// back out. Writes pond-shot.png at the project root; gitignored.
//
// `configureServer` only runs under `vite dev`, so none of this exists in a
// build. It is still a route that writes to disk, though, and while the dev
// server is up ANY page you happen to have open can POST to localhost — no
// browser prevents that. Two guards, both cheap:
//
//   · ORIGIN. Only same-origin callers are served. A cross-site POST either
//     carries a foreign `Origin` (rejected here) or is a no-cors form/beacon
//     with a body this handler can't parse anyway. Requests with no Origin at
//     all — curl, the odd fetch — are allowed, because that is how this gets
//     driven from a script deliberately.
//   · SIZE. The body used to be accumulated into a string with no ceiling, so
//     one large POST could grow the dev server's heap until it fell over. A
//     1080p PNG data URL lands around 3 MB; 12 is generous and finite.
const MAX_SHOT_BYTES = 12 * 1024 * 1024;

function pondShot() {
  return {
    name: "pond-shot",
    configureServer(server) {
      server.middlewares.use("/__pond-shot", (req, res) => {
        if (req.method !== "POST") {
          res.statusCode = 405;
          res.end();
          return;
        }

        const origin = req.headers.origin;
        if (origin) {
          const host = req.headers.host;
          let ok = false;
          try {
            ok = new URL(origin).host === host;
          } catch {
            ok = false;
          }
          if (!ok) {
            res.statusCode = 403;
            res.end("cross-origin");
            return;
          }
        }

        let body = "";
        let bytes = 0;
        let aborted = false;
        req.on("data", (c) => {
          if (aborted) return;
          bytes += c.length;
          if (bytes > MAX_SHOT_BYTES) {
            aborted = true;
            res.statusCode = 413;
            res.end("too large");
            req.destroy();
            return;
          }
          body += c;
        });
        req.on("end", () => {
          if (aborted) return;
          try {
            const b64 = body.replace(/^data:image\/png;base64,/, "");
            const out = fileURLToPath(new URL("./pond-shot.png", import.meta.url));
            writeFileSync(out, Buffer.from(b64, "base64"));
            res.end("ok");
          } catch (e) {
            res.statusCode = 500;
            res.end(String(e));
          }
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), pondShot()],
  // honor a harness-assigned port (Claude's preview pane sets PORT when 5173
  // is taken by another session); otherwise vite's own default applies
  server: process.env.PORT ? { port: Number(process.env.PORT) } : undefined,
});
