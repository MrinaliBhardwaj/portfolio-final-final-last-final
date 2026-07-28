"""One-off: her LAYOVER slide exports -> web-ready WebP.

Source is C:/Users/heave/Downloads/LAYOVER (five 1920x1080 PNGs, ~9.7 MB total)
and is NOT vendored — these are presentation exports, the .fig is the real
source. Re-run this if she re-exports.

1600px wide is the widest the case-study column ever renders these (the page
caps at 1100 and they sit inside it), so anything larger is spent on nothing.
q82 because these are photographic mockups with soft gradients, not linework.
"""
from pathlib import Path
from PIL import Image

SRC = Path(r"C:/Users/heave/Downloads/LAYOVER")
OUT = Path(__file__).resolve().parent.parent / "public" / "work" / "layover"

# source slide -> the name the case study refers to it by
SHOTS = {
    "Slide 16_9 - 1.png": "hero",       # the landing page, airport picker open
    "Slide 16_9 - 3.png": "app",        # two phones, ordering UI
    "Slide 16_9 - 4.png": "order",      # restaurant grid + order confirmed
    "Slide 16_9 - 5.png": "brand",      # the wordmark on a billboard
    "Slide 16_9 - 7.png": "system",     # web + app together
}

WIDTH = 1600


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    total = 0
    for src_name, out_name in SHOTS.items():
        src = SRC / src_name
        if not src.exists():
            raise SystemExit(f"missing source: {src}")
        im = Image.open(src).convert("RGB")
        h = round(im.height * WIDTH / im.width)
        im = im.resize((WIDTH, h), Image.LANCZOS)
        dest = OUT / f"{out_name}.webp"
        im.save(dest, "WEBP", quality=82, method=6)
        kb = dest.stat().st_size / 1024
        total += kb
        print(f"{out_name:8} {im.width}x{im.height}  {kb:7.1f} KB")
    print(f"{'total':8} {'':9}  {total:7.1f} KB")


if __name__ == "__main__":
    main()
