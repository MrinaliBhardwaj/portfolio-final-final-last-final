"""Figma COMPONENTS -> web-ready files for the project pages.

    python scripts/build_figma_components.py <download-dir>

WHAT REPLACED WHAT. The project pages were first built from crops of each
case-study board — rectangles cut out of a flattened 20,000px export. That
gave pictures with the board's own backgrounds, neighbours and margins baked
in, cut wherever the crop box happened to land. She was right that they looked
it.

These are the real objects instead, taken out of her Figma files one node at a
time through the Figma MCP (`download_assets`):

  * photographs are the ORIGINAL uploads (the node's raw image fill), so they
    arrive uncropped and at the resolution she placed them at;
  * mockups, cards and graphics are the NODE rendered on its own — a phone
    mockup is the phone, not the phone plus whatever sat behind it;
  * marks are VECTORS: the Futurepreneurs monogram and the Layover wordmark
    ship as SVG.

`<download-dir>` holds what the MCP returned, one folder per project, named
as in SOURCES below. The downloads are not vendored (the .fig is the source);
this script is the record of which node each file came from.

UN-MATTING. Meal Maestro's mockups export on an opaque #385A41 — the frame
they sit in, which is her own "forest" swatch. Each pixel p is split into
"some amount of shadow over that green" (p ~= k * green) or "the object
itself": close to a scaled green means background or shadow, and becomes
black at alpha 1-k; anything else is opaque. The phones have black bezels, so
the edge between the two is clean and the drop shadow survives as a real
shadow that works over any ground.
"""
import re
import sys
from pathlib import Path

import numpy as np
from PIL import Image

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
WORK = ROOT / "public" / "work"

FOREST = np.array([56, 90, 65], dtype=np.float32)  # #385A41, her swatch
WHITE = np.array([255, 255, 255], dtype=np.float32)

# project -> [(source file, output name, how, max width, node it came from)]
#   how: "photo" resize + webp · "matte" un-matte #385A41 then webp with alpha
#        "keep" webp as rendered · "svg" vector, backgrounds stripped
SOURCES = {
    "meal-maestro": [  # file VFPcvgP4zS28UJQxvjd5va, frame 429:2731
        ("hero-phones.png", "hero-phones", "matte", 1200, "429:2783 Frame 45"),
        ("phone-home.png", "phone-home", "matte", 760, "429:3688 Phone mockup"),
        ("phone-recipe.png", "phone-recipe", "matte", 760, "429:3875 Phone mockup"),
        ("phone-tracker.png", "phone-tracker", "matte", 760, "429:4208 RIGHT PHONE"),
        ("phone-explore.png", "phone-explore", "matte", 900, "429:4062 Phone mockup"),
        ("macro.png", "macro", "keep", 1014, "429:3950 CENTER VISUALIZATION"),
        ("kitchen.raw.jpg", "kitchen", "photo", 1800, "429:3590 image fill"),
        ("crates.raw.jpg", "crates", "photo", 1800, "339:1114 image fill"),
        ("produce.raw1.jpg", "produce", "photo", 1800, "429:2803 image fill"),
        ("pasta.raw1.jpg", "pasta", "photo", 736, "429:3665 image fill"),
    ],
    "futurepreneurs": [  # file drda7TnqoM3fEpbibCDIc2, decks 345:2408 / 345:15635
        ("mark-vec.svg", "mark", "svg", 0, "345:14470 fp logo"),
        ("social.raw.png", "social", "photo", 1400, "345:14487 image fill"),
        ("stories.png", "stories", "keep", 1600, "345:14493 story mockups"),
        ("laptop.png", "laptop", "keep", 1400, "345:15202 Mockup 1"),
        ("phone-yellow.png", "phone", "keep", 800, "345:15205 iPhone 16 mockup"),
        # the stickers export on opaque white; they are laid over the printed
        # things on the page, so the white comes off the same way the green does
        ("sticker-1.png", "sticker-1", "matte-white", 700, "345:15538 Sticker"),
        ("sticker-2.png", "sticker-2", "matte-white", 700, "345:15553 Sticker"),
        ("certificate.png", "certificate", "keep", 1263, "345:15273 third place"),
        ("invitation.png", "invitation", "keep", 1004, "345:15211 invitation"),
        ("hall.raw.jpg", "hall", "photo", 1800, "345:2464 image fill"),
        ("site-desktop.raw.png", "site-desktop", "photo", 1006, "345:15534 image fill"),
        ("site-mobile.raw.png", "site-mobile", "photo", 299, "345:15536 image fill"),
    ],
    "nextg": [  # file bUB4MsJcWhbCEhPEyI7Ip6, frame 181:103
        ("shop.raw.png", "shop", "photo", 900, "235:9 careers-02"),
        ("coverage.raw.png", "coverage", "photo", 1120, "181:1902 coverage map"),
        ("site-full.raw.png", "site-full", "photo", 512, "181:73 full-page capture"),
        ("presenting.raw.jpg", "presenting", "photo", 720, "221:35 photo"),
    ],
    "layover": [  # file BRaDrcuSqhHuA7PTmJX0Zt, frame 171:3998
        ("wordmark.svg", "wordmark", "svg", 0, "171:9547 logo"),
    ],
}


def unmatte(im, ground=FOREST):
    a = np.asarray(im.convert("RGB"), dtype=np.float32)
    k = (a @ ground) / float(ground @ ground)  # best scale of the ground colour
    resid = np.linalg.norm(a - k[..., None] * ground, axis=-1)
    bg = (resid < 9.0) & (k <= 1.03)
    out = np.dstack([a, np.full(a.shape[:2], 255, np.float32)])
    alpha = np.clip(1.0 - k, 0, 1) * 255
    out[bg, 0:3] = 0
    out[bg, 3] = alpha[bg]
    # FEATHER THE FRAME. Figma's export bounds cut the drop shadow off square,
    # which reads as a grey box round the phone. The shadow is faded to nothing
    # over the outer 9% of the frame; the object is far inside that and is not
    # touched.
    h, w = a.shape[:2]
    m = max(8, int(min(w, h) * 0.09))
    ry = np.minimum(np.arange(h), np.arange(h)[::-1])[:, None] / m
    rx = np.minimum(np.arange(w), np.arange(w)[::-1])[None, :] / m
    ramp = np.clip(np.minimum(ry, rx), 0, 1)
    out[bg, 3] = (out[..., 3] * ramp)[bg]
    img = Image.fromarray(out.astype(np.uint8), "RGBA")
    box = img.getchannel("A").point(lambda v: 255 if v > 6 else 0).getbbox()
    return img.crop(box) if box else img


def fit(im, maxw):
    if maxw and im.width > maxw:
        im = im.resize((maxw, round(im.height * maxw / im.width)), Image.LANCZOS)
    return im


def clean_svg(text):
    # The export draws every ancestor's background behind the mark: the page
    # canvas, the case-study frame, the section. Drop the rects; keep the art.
    # Only in the drawing, never in <defs>: the clip-paths are rects too, and
    # stripping those clips the mark to nothing.
    head, sep, defs = text.partition("<defs>")
    return re.sub(r"<rect[^>]*/>\s*", "", head) + sep + defs


def main(src):
    src = Path(src)
    for slug, rows in SOURCES.items():
        out = WORK / slug / "fig"
        out.mkdir(parents=True, exist_ok=True)
        print(f"\n{slug}")
        for fname, name, how, maxw, node in rows:
            f = src / slug / fname
            if not f.exists():
                raise SystemExit(f"missing {f}")
            if how == "svg":
                dest = out / f"{name}.svg"
                dest.write_text(clean_svg(f.read_text(encoding="utf8")), encoding="utf8")
                print(f"  {name:14} svg              {dest.stat().st_size/1024:6.1f} KB  {node}")
                continue
            im = Image.open(f)
            if how == "matte":
                im = unmatte(im)
            elif how == "matte-white":
                im = unmatte(im, WHITE)
            elif how == "photo" and im.mode == "RGBA" and im.getchannel("A").getextrema()[0] == 255:
                im = im.convert("RGB")
            im = fit(im, maxw)
            dest = out / f"{name}.webp"
            q = 84 if im.mode == "RGBA" else 80
            im.save(dest, "WEBP", quality=q, method=6)
            print(f"  {name:14} {im.width:5}x{im.height:<5} {im.mode:4} {dest.stat().st_size/1024:6.1f} KB  {node}")


if __name__ == "__main__":
    main(sys.argv[1])
