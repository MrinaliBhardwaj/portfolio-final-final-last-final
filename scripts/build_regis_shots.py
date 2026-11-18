"""Regis case-study figures -> public/work/regis/fig/*.webp

    python scripts/build_regis_shots.py <dir-of-exports>

<dir> holds her section frames from file 8qMVRhvaHKN41AHP72kx86 exported at
scale 2 (MCP download_assets, defaultScale 2), named by section number:
s09.png (104:2272 "09 What needs me today") ... s17.png (104:2834 "17 Ledger"),
plus the two photographs as uploaded (justice.png, the cover's 86:878, and
portrait.png, the cover's 91:905). The exports are not vendored: the .fig is
the source, so re-export and re-run if she changes a frame.

ONLY THE PICTURES ARE PICTURES. Every heading, paragraph, label and caption on
the Regis page is real text in Regis.jsx; what is cut here is what cannot be
text without being redrawn: the product screens, the before/after dialogs, the
two dot plots and the colour swatches. Boxes are her frames' own, in 1x section
coordinates, doubled for the 2x export.
"""
import sys
from pathlib import Path

from PIL import Image

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "public" / "work" / "regis" / "fig"

# name: (section file, x0, y0, x1, y1) in 1x section coordinates
CROPS = {
    # "09 What needs me today": the stage (tan plate) holding the Today screen
    "today": ("s09", 120, 560, 1480, 1380),
    # "10 Which one first": the two dot plots with their axes
    "plot-capped": ("s10", 120, 920, 1460, 1085),
    "plot-log": ("s10", 120, 1250, 1460, 1415),
    # "11 The queue": the tracker screen, her numbered markers included
    "queue": ("s11", 196, 376, 1404, 1134),
    # "12 Before I commit": the two stages under BEFORE / SHIPPED
    "confirm-before": ("s12", 120, 651, 780, 1075),
    "confirm-after": ("s12", 820, 651, 1480, 1075),
    # "13 Where is the proof"
    "evidence-before": ("s13", 120, 651, 780, 1107),
    "evidence-after": ("s13", 820, 651, 1480, 1107),
    # "14 On record"
    "record-before": ("s14", 120, 651, 780, 1124),
    "record-after": ("s14", 820, 651, 1480, 1124),
    # "15 The trail" and "16 The board": stage + screen. Cut at the SCREEN'S
    # bottom edge, not the stage's: her caption is set inside the stage, under
    # the screen, and the page sets that caption as text. The stage's own
    # bottom margin is put back below (PAD).
    "trail": ("s15", 120, 530, 1480, 1328),
    "board": ("s16", 120, 478, 1480, 1276),
    # "17 Ledger": both swatch rows (light, then the same tokens dark) and the
    # dark-mode tracker
    "swatches": ("s17", 120, 560, 1310, 715),
    "dark": ("s17", 1020, 989, 1440, 1251),
}

# tan stage margin restored under a screen whose caption was cut away, 1x px
PAD = {"trail": 48, "board": 48}
STAGE = (244, 239, 227)  # her stage fill, #f4efe3

MAX_W = 2400  # a 1068px column at 2x, with room; wider is bytes nobody sees
QUALITY = 84


def save(im, name):
    if im.width > MAX_W:
        im = im.resize((MAX_W, round(im.height * MAX_W / im.width)), Image.LANCZOS)
    path = OUT / f"{name}.webp"
    im.save(path, "WEBP", quality=QUALITY, method=6)
    print(f"  {name:16s} {im.width}x{im.height}  {path.stat().st_size / 1024:6.1f} KB")


def main():
    src = Path(sys.argv[1])
    OUT.mkdir(parents=True, exist_ok=True)
    cache = {}
    for name, (sec, x0, y0, x1, y1) in CROPS.items():
        if sec not in cache:
            cache[sec] = Image.open(src / f"{sec}.png").convert("RGB")
        im = cache[sec].crop((x0 * 2, y0 * 2, x1 * 2, y1 * 2))
        if name in PAD:
            out = Image.new("RGB", (im.width, im.height + PAD[name] * 2), STAGE)
            out.paste(im, (0, 0))
            im = out
        save(im, name)
    # the photographs keep their alpha: both are cut-outs that stand on the paper
    for name in ("justice", "portrait"):
        save(Image.open(src / f"{name}.png").convert("RGBA"), name)


if __name__ == "__main__":
    main()
