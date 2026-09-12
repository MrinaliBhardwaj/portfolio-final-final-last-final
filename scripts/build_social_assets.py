"""The share card, cut from the cover's own lotus.

It comes from public/lotus-still.webp — the frame already on screen at first
paint — so a shared link looks like the site it opens, and nothing new has to be
art-directed or kept in sync.

  og.jpg            1200x630, the card Slack/LinkedIn/iMessage render.

THE FAVICONS ARE NOT CUT HERE ANY MORE (12 Sep 2026). They were the same bloom
cropped tight, and at 32px a photograph is a smudge that names nobody. They are
her monogram now — see scripts/build_favicon.py — and this script deliberately
no longer writes them, because running it would have quietly put the lotus back.
"""
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "public" / "lotus-still.webp"
PUB = ROOT / "public"

# where the bloom actually sits in the 1920x1080 frame, measured off the image
BLOOM = (600, 250, 1270, 820)


def main():
    im = Image.open(SRC).convert("RGB")
    w, h = im.size

    # ---- og.jpg: 1.91:1, centred on the bloom rather than the frame ----
    target = 1200 / 630
    crop_h = round(w / target)
    cx, cy = (BLOOM[0] + BLOOM[2]) // 2, (BLOOM[1] + BLOOM[3]) // 2
    top = max(0, min(h - crop_h, cy - crop_h // 2))
    og = im.crop((0, top, w, top + crop_h)).resize((1200, 630), Image.LANCZOS)
    og.save(PUB / "og.jpg", "JPEG", quality=86, optimize=True, progressive=True)

    p = PUB / "og.jpg"
    print(f"{'og.jpg':24} {Image.open(p).size}  {p.stat().st_size / 1024:6.1f} KB")


if __name__ == "__main__":
    main()
