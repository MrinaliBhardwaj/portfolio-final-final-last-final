// Fails the build if anything under src/ pulls a SUBRESOURCE from a remote host.
//
// This exists because the dock, the world tab strip and the cover all used to
// load their brand marks from cdn.simpleicons.org — which put the site's primary
// navigation behind a third party. If that host is slow, down, blocked by an ad
// blocker or behind a corporate proxy, the icons vanish and the dock is the only
// way out of most worlds. See BrandIcons.jsx.
//
// SUBRESOURCES ONLY. Outbound hyperlinks are the entire point of a portfolio —
// Cover.jsx links to github.com, DesignWorld.jsx holds LINKEDIN and BEHANCE
// constants, projects link to live sites. Those must never trip this. What we
// forbid is the page FETCHING something from another origin at load: an image
// src, a CSS url(), a remote @import, a script src.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// fileURLToPath, not URL.pathname: this repo lives in "mri's portfolio", and a
// raw pathname hands back the space percent-encoded as %20 — which then fails
// to scandir. Same trap for the apostrophe.
const ROOT = fileURLToPath(new URL("..", import.meta.url));
const SRC = join(ROOT, "src");

// Each pattern matches a fetch, not a link. `href` is deliberately absent:
// on an <a> it is navigation, and the two places it isn't (<link rel>, @import)
// are covered by the stylesheet rules below.
const RULES = [
  [/\bsrc\s*=\s*["'`]\s*https?:\/\//i, "remote src= (image/script/iframe)"],
  [/\bsrcSet\s*=\s*["'`][^"'`]*https?:\/\//i, "remote srcSet="],
  [/url\(\s*["']?\s*https?:\/\//i, "remote url() in CSS"],
  [/@import\s+(url\()?\s*["']?\s*https?:\/\//i, "remote @import"],
  [/<link[^>]+href\s*=\s*["'`]\s*https?:\/\//i, "remote <link href="],
];

const files = [];
(function walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) walk(p);
    else if (/\.(jsx?|tsx?|css|html)$/.test(name)) files.push(p);
  }
})(SRC);

const hits = [];
for (const file of files) {
  const lines = readFileSync(file, "utf8").split(/\r?\n/);
  lines.forEach((line, i) => {
    for (const [re, what] of RULES) {
      if (re.test(line)) {
        hits.push({ file: relative(ROOT, file), line: i + 1, what, text: line.trim().slice(0, 110) });
        break;
      }
    }
  });
}

if (hits.length) {
  console.error(`\n  ${hits.length} remote subresource(s) under src/ — the build is blocked.\n`);
  for (const h of hits) {
    console.error(`  ${h.file}:${h.line}  ${h.what}`);
    console.error(`     ${h.text}\n`);
  }
  console.error("  Vendor it instead: assets under public/, brand marks in src/BrandIcons.jsx.");
  console.error("  Outbound <a href> links are fine and are not what this checks.\n");
  process.exit(1);
}

console.log(`no remote subresources under src/ (${files.length} files checked)`);
