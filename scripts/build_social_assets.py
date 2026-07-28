"""Share-card and favicon assets, cut from the cover's own lotus.

Both come from public/lotus-still.webp — the frame already on screen at first
paint — so a shared link looks like the site it opens, and nothing new has to be
art-directed or kept in sync.

  og.jpg            1200x630, the card Slack/LinkedIn/iMessage render.
  favicon-32.png    the tab icon: cropped TIGHT to the bloom, because the full
                    1920x1080 frame is mostly black sky and would read as an
                    empty square at 32px.
  apple-touch-icon  180x180, same crop, for an iOS home-screen bookmark.
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

    # ---- favicons: square, tight on the bloom ----
    bw, bh = BLOOM[2] - BLOOM[0], BLOOM[3] - BLOOM[1]
    side = max(bw, bh)
    bx, by = (BLOOM[0] + BLOOM[2]) // 2, (BLOOM[1] + BLOOM[3]) // 2
    sq = im.crop((bx - side // 2, by - side // 2, bx + side // 2, by + side // 2))
    for name, px in (("favicon-32.png", 32), ("apple-touch-icon.png", 180)):
        sq.resize((px, px), Image.LANCZOS).save(PUB / name, "PNG", optimize=True)

    for f in ("og.jpg", "favicon-32.png", "apple-touch-icon.png"):
        p = PUB / f
        print(f"{f:24} {Image.open(p).size}  {p.stat().st_size / 1024:6.1f} KB")


if __name__ == "__main__":
    main()
