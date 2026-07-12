import { writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// dev-only: the pond's ?sim mode POSTs a rendered frame here so the scene can
// be verified headless (a hidden tab never fires rAF, so screenshots can't
// see it). Writes pond-shot.png at the project root; gitignored.
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
});
