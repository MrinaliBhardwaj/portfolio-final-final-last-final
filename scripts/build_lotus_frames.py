"""Build the cover lotus's frame sequence from the source clip.

WHY THIS EXISTS
---------------
`public/lotus-bloom.mp4` is encoded with exactly ONE keyframe for all 241
frames (verified: `ffprobe -select_streams v:0 -show_entries packet=flags`
returns a single `K`). There is no seek point after t=0, so seeking anywhere
in the clip costs a decode of every preceding frame, and seeking *backwards*
restarts from zero. Scroll-scrubbing that video is asking a codec for the one
access pattern it is worst at, every single frame.

So we don't ship the video. We ship the frames, pre-decoded, as images — the
same thing Apple's scroll-driven product pages do. Every frame is then
independently decodable and the scrub is a texture blit.

This is a ONE-OFF developer script, not part of the build or runtime. Re-run it
only if the source clip changes. ffmpeg is needed here and nowhere else.

    python scripts/build_lotus_frames.py

OUTPUT
------
    public/lotus/atlas.webp     all frames, small, in one grid  (tier A)
    public/lotus/f00..f39.webp  full-size individual frames     (tier B)

The atlas is the zero-stutter guarantee: one request, one decode, and the
whole timeline is scrubbable. The individual frames stream in behind it and
swap per-index as they arrive.

FRAME ORDER IS REVERSED on purpose. The cover scrubs the clip backwards (the
source arc is open -> bud -> re-bloom; reversed it reads as open -> folds ->
re-opens down the page). Baking the reversal in here means f00 is literally
what you see at scroll position 0 — which is also exactly `lotus-still.webp`,
the preloaded poster — so the poster -> canvas handoff is seamless and the
runtime needs no `reverse` flag.
"""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
# The source clip lives OUTSIDE public/ so it is never deployed — shipping it
# was the whole problem. It stays in the repo purely so these frames can be
# regenerated; nothing at runtime reads it.
SRC = ROOT / "assets-src" / "lotus-bloom.mp4"
OUT = ROOT / "public" / "lotus"

# 40 frames. With the runtime's temporal easing (~91 ms time constant) the eye
# cannot resolve individual steps on an organic bloom at this density, and the
# memory cost is linear in this number: 40 x 1280 x 720 x 4 B ~= 147 MB of
# ImageBitmap. Raising it raises resident GPU memory proportionally.
FRAMES = 40

# Tier B: individual frames. 1600x900 rather than the source's native 1920x1080
# — 83% of native linear resolution for 71% of the memory. The subject is a
# translucent flower with fine petal veining over a starfield of 1px points,
# which is exactly the content that dies under upscaling, so we stay close to
# native and let the compositor (not drawImage) handle any final stretch.
# Memory is linear in W*H*FRAMES: 40 x 1600 x 900 x 4 B ~= 220 MB, against the
# old 54 x 1920 x 1080 x 4 B = 427 MB.
FRAME_W, FRAME_H = 1600, 900
# Higher than a photo would need: the black field behind the stars is a smooth
# near-black gradient, and that is where WebP bands first. Frames cost ~30 KB
# at this quality, so there is no reason to economise here.
FRAME_QUALITY = 88

# Tier A: the instant atlas. 8x5 grid exactly fits 40 tiles with no waste.
# 3840x1350 stays under the 4096 texture limit that older mobile GPUs enforce,
# so it is safe to upload as a single texture everywhere.
ATLAS_COLS, ATLAS_ROWS = 8, 5
TILE_W, TILE_H = 480, 270
ATLAS_QUALITY = 82


def find_ffmpeg() -> str:
    """ffmpeg from PATH, or the winget install location (whose PATH entry
    only applies to shells started after the install)."""
    exe = shutil.which("ffmpeg")
    if exe:
        return exe
    packages = (
        Path(os.environ.get("LOCALAPPDATA", ""))
        / "Microsoft"
        / "WinGet"
        / "Packages"
    )
    for candidate in packages.glob("Gyan.FFmpeg*/**/bin/ffmpeg.exe"):
        return str(candidate)
    sys.exit(
        "ffmpeg not found. Install it with:  winget install Gyan.FFmpeg --source winget"
    )


def source_frame_count(ffmpeg: str) -> int:
    """Count frames via ffprobe next to ffmpeg; fall back to the known 241."""
    probe = Path(ffmpeg).with_name("ffprobe.exe")
    if not probe.exists():
        probe = Path(ffmpeg).with_name("ffprobe")
    if not probe.exists():
        return 241
    out = subprocess.run(
        [
            str(probe), "-v", "error", "-select_streams", "v:0",
            "-show_entries", "stream=nb_frames", "-of", "csv=p=0", str(SRC),
        ],
        capture_output=True, text=True,
    ).stdout.strip()
    return int(out) if out.isdigit() else 241


def main() -> None:
    if not SRC.exists():
        sys.exit(f"source clip missing: {SRC}")

    ffmpeg = find_ffmpeg()
    total = source_frame_count(ffmpeg)
    print(f"source: {SRC.name}  ({total} frames)")
    print(f"ffmpeg: {ffmpeg}\n")

    # Evenly sample FRAMES indices across the clip, endpoints included.
    picks = [round(i * (total - 1) / (FRAMES - 1)) for i in range(FRAMES)]

    # One decode pass with an explicit select expression. The alternative —
    # seeking to each timestamp — would re-decode from frame 0 every time on
    # this single-keyframe encode, i.e. quadratic work for the same output.
    expr = "+".join(f"eq(n\\,{n})" for n in picks)
    vf = f"select='{expr}',scale={FRAME_W}:{FRAME_H}:flags=lanczos"

    tmp = Path(tempfile.mkdtemp(prefix="lotus-frames-"))
    try:
        print(f"extracting {FRAMES} frames in one pass...")
        subprocess.run(
            [
                ffmpeg, "-hide_banner", "-loglevel", "error", "-y",
                "-i", str(SRC),
                "-vf", vf,
                "-vsync", "0",
                str(tmp / "src_%03d.png"),
            ],
            check=True,
        )

        extracted = sorted(tmp.glob("src_*.png"))
        if len(extracted) != FRAMES:
            sys.exit(
                f"expected {FRAMES} frames, ffmpeg produced {len(extracted)}"
            )

        # REVERSE: scroll position 0 shows the clip's LAST frame (resting,
        # fully open) — see the module docstring.
        extracted.reverse()

        OUT.mkdir(parents=True, exist_ok=True)
        for stale in OUT.glob("*.webp"):
            stale.unlink()

        print(f"writing {FRAMES} frames at {FRAME_W}x{FRAME_H} (q{FRAME_QUALITY})...")
        images = []
        frames_bytes = 0
        for i, path in enumerate(extracted):
            img = Image.open(path).convert("RGB")
            images.append(img)
            dest = OUT / f"f{i:02d}.webp"
            img.save(dest, "WEBP", quality=FRAME_QUALITY, method=6)
            frames_bytes += dest.stat().st_size

        print(f"composing {ATLAS_COLS}x{ATLAS_ROWS} atlas of {TILE_W}x{TILE_H} tiles...")
        atlas = Image.new("RGB", (ATLAS_COLS * TILE_W, ATLAS_ROWS * TILE_H))
        for i, img in enumerate(images):
            tile = img.resize((TILE_W, TILE_H), Image.LANCZOS)
            atlas.paste(tile, ((i % ATLAS_COLS) * TILE_W, (i // ATLAS_COLS) * TILE_H))
        atlas_path = OUT / "atlas.webp"
        atlas.save(atlas_path, "WEBP", quality=ATLAS_QUALITY, method=6)
        atlas_bytes = atlas_path.stat().st_size

        for img in images:
            img.close()

        mb = 1024 * 1024
        src_bytes = SRC.stat().st_size
        print("\n--- payload ---")
        print(f"  atlas.webp            {atlas_bytes / 1024:8.0f} KB   "
              f"({atlas.width}x{atlas.height})  <- preloaded, instant scrub")
        print(f"  f00..f{FRAMES - 1:02d}.webp        {frames_bytes / mb:8.2f} MB   "
              f"({frames_bytes / FRAMES / 1024:.0f} KB avg)")
        print(f"  total                 {(atlas_bytes + frames_bytes) / mb:8.2f} MB")
        print(f"  was (lotus-bloom.mp4) {src_bytes / mb:8.2f} MB")
        print(f"  saving                {(src_bytes - atlas_bytes - frames_bytes) / mb:8.2f} MB")
        print(f"\n  bitmap residency ~= {FRAMES * FRAME_W * FRAME_H * 4 / mb:.0f} MB"
              f"  (was {54 * 1920 * 1080 * 4 / mb:.0f} MB)")
    finally:
        shutil.rmtree(tmp, ignore_errors=True)


if __name__ == "__main__":
    main()
