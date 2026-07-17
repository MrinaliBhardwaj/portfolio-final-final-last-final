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
        let body = "";
        req.on("data", (c) => {
          body += c;
        });
        req.on("end", () => {
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
