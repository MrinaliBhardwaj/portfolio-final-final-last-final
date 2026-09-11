"""Case-study BOARDS -> web-ready WebP slices, for projects.js `boards[]`.

    python scripts/build_case_boards.py <job> <export.png>

<export.png> is the Figma frame rendered at scale 1 (the MCP get_screenshot with
maxDimension = the frame's height; download_assets clamps tall frames to 4096,
which is useless here). The exports are NOT vendored: the .fig is the source,
so re-export and re-run if she changes a board.

WHY SLICES: WebP tops out at 16383px, and both boards are ~20,000 tall. Cut in
her own gaps: every cut is the middle of a run of rows that are one flat colour
across the full width — the only place a cut costs nothing (Layover's rule).
When no such run exists near a target, the least-busy row within reach is used
instead (Futurepreneurs' fallback). The slices stack with no gap, so a cut is
invisible either way.

NATIVE WIDTH, no downscale: the study column renders them at ~1130 CSS px, so
1400/1600 is what keeps them sharp on a Retina screen.
"""
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent

JOBS = {
    # meal-maestro-case-study, node 429:2731 ("Updated case study full"),
    # 1400 x 22306. Everything past the closing "Thanks for watching!" card is
    # ~2,400px of flat green she asked to have cropped: the card ends at row
    # 19909, and the cut keeps 67px of green under it — the same gap the card
    # has above it, so the study ends on a margin rather than on the card's edge.
    "meal-maestro": {"crop_h": 19977, "out": "public/work/meal-maestro/case"},
    # NextG, node 181:103 ("NextG Apex · Case Study"), 1600 x 20076.05. It
    # renders as 20077 rows, the last a 1px (30,30,30) sliver of the canvas
    # behind the frame, so it is trimmed to the frame's whole-pixel height.
    "nextg": {"crop_h": 20076, "out": "public/work/nextg/case"},
}

TARGET = 2200  # slice height aimed for
REACH = 420  # how far from a target a cut may move to find a clean row
QUALITY = 80


def pick_cuts(rgb):
    h = rgb.shape[0]
    spread = (rgb.max(axis=1) - rgb.min(axis=1)).max(axis=1)  # per row
    flat = spread <= 3
    # the middle of each flat run, with its length
    mids = []
    y = 0
    while y < h:
        if flat[y]:
            s = y
            while y < h and flat[y]:
                y += 1
            if y - s >= 6:
                mids.append(((s + y) // 2, y - s))
        else:
            y += 1
    busy = np.abs(np.diff(rgb.astype(int), axis=0)).sum(axis=(1, 2))
    cuts, last = [], 0
    while h - last > TARGET + REACH:
        t = last + TARGET
        near = [m for m, n in mids if abs(m - t) <= REACH]
        if near:
            c = min(near, key=lambda m: abs(m - t))
            kind = "flat"
        else:
            lo, hi = t - REACH, t + REACH
            c = lo + int(np.argmin(busy[lo:hi]))
            kind = "least-busy"
        cuts.append((c, kind))
        last = c
    return cuts


def main():
    job, src = sys.argv[1], Path(sys.argv[2])
    cfg = JOBS[job]
    im = Image.open(src).convert("RGB")
    rgb = np.asarray(im)
    w, h0 = im.size
    rgb = rgb[: cfg["crop_h"]]
    h = rgb.shape[0]

    # the Futurepreneurs trap: a baked-in border shows as outer columns that
    # differ from their neighbours down the whole board
    edge = [
        float(np.abs(rgb[:, i].astype(int) - rgb[:, i + j].astype(int)).mean())
        for i, j in ((0, 12), (w - 1, -12))
    ]
    print(f"{job}: {w}x{h0} -> cropped to {w}x{h}; edge-vs-inner mean diff L/R {edge[0]:.2f}/{edge[1]:.2f}")

    cuts = pick_cuts(rgb)
    out = ROOT / cfg["out"]
    out.mkdir(parents=True, exist_ok=True)
    for old in out.glob("s*.webp"):
        old.unlink()
    bounds = [0] + [c for c, _ in cuts] + [h]
    slices, total = [], 0
    for i in range(len(bounds) - 1):
        a, b = bounds[i], bounds[i + 1]
        dest = out / f"s{i:02d}.webp"
        Image.fromarray(rgb[a:b]).save(dest, "WEBP", quality=QUALITY, method=6)
        kb = dest.stat().st_size / 1024
        total += kb
        kind = cuts[i][1] if i < len(cuts) else "end"
        print(f"  s{i:02d}  y {a:5d}-{b:5d}  {w}x{b - a}  {kb:6.1f} KB  cut: {kind}")
        slices.append({"src": "/" + cfg["out"].removeprefix("public/") + f"/s{i:02d}.webp", "w": w, "h": b - a})
    print(f"  total {total / 1024:.2f} MB in {len(slices)} slices")
    print("SLICES " + json.dumps(slices))


if __name__ == "__main__":
    main()
