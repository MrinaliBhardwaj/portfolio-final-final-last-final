"""One-off: a tall Meal Maestro case-study export -> sliced, web-ready WebP.

!! NOT WIRED UP YET — SRC BELOW IS A BAD SOURCE. It points at a full-page
screenshot of the BEHANCE PAGE, which carries Behance's header, a floating
"Follow All / Appreciate" bar sitting on top of her artwork, and ~85% of its
7734px height is Behance's "Popular projects" feed: other designers' work with
Save buttons. It was sliced once, inspected, and pulled. Repoint SRC at a real
export — the artboards out of Figma, or the Behance project images themselves
rather than a capture of the page around them — then run this and put the strip
back in projects.js (the renderer already handles it).

Shipping a tall case study as ONE image is a bad idea even compressed: a
1341x7734 bitmap is ~41 MB of RGBA once decoded, all of it on the main thread,
all of it before anything paints. So it is sliced.

Slices stack seamlessly (same width, no gap, no per-slice rim — see .pp-strip
in project-page.css) and every slice after the first is lazy, so a visitor
decodes roughly what they can see instead of the whole presentation.

Width is left at native 1341: the case-study column caps at ~1036 CSS px, so
this still has a little headroom on a 2x screen without paying for a 2688px
master nobody will see.
"""
from pathlib import Path
from PIL import Image

SRC = Path(r"C:/Users/heave/Downloads/www.behance.net_gallery_249664345_AI-Powered-Meal-Planner-App-UIUX.png")
OUT = Path(__file__).resolve().parent.parent / "public" / "work" / "meal-maestro"

SLICES = 8
QUALITY = 80


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    im = Image.open(SRC)
    # flatten onto white: the capture is RGBA but has no real transparency, and
    # an alpha channel costs bytes in WebP for nothing
    if im.mode in ("RGBA", "LA", "P"):
        flat = Image.new("RGB", im.size, (255, 255, 255))
        rgba = im.convert("RGBA")
        flat.paste(rgba, mask=rgba.split()[-1])
        im = flat
    else:
        im = im.convert("RGB")

    w, h = im.size
    # ceil division so the last slice absorbs the remainder and no row is lost
    step = -(-h // SLICES)
    total = 0
    for i in range(SLICES):
        top = i * step
        bottom = min(h, top + step)
        if top >= bottom:
            break
        part = im.crop((0, top, w, bottom))
        dest = OUT / f"s{i:02d}.webp"
        part.save(dest, "WEBP", quality=QUALITY, method=6)
        kb = dest.stat().st_size / 1024
        total += kb
        print(f"s{i:02d}  {part.width}x{part.height}  {kb:7.1f} KB")

    src_mb = SRC.stat().st_size / 1024 / 1024
    print(f"\nsource {w}x{h}  {src_mb:.2f} MB  ->  {total / 1024:.2f} MB in {SLICES} slices")


if __name__ == "__main__":
    main()
