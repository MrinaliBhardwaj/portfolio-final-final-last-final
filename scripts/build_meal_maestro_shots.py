"""Her Meal Maestro case study -> sliced, web-ready WebP.

Source is the full frame exported from the Figma file (meal-maestro-case-study,
node 429-2731) at 1400x22306. The filename says "public pulse" — it is
mislabelled; the contents were checked and it is Meal Maestro end to end.

Slicing is not an optimisation here, it is REQUIRED: WebP's maximum dimension
is 16383px and this is 22306 tall, so it cannot be one file. It would be the
right call anyway — a 1400x22306 bitmap is ~125 MB of RGBA to decode, all on
the main thread, before anything paints.

The slices stack seamlessly (see .pp-strip in project-page.css) and every one
after the first is lazy, so a visitor decodes roughly what they scroll past.

Width stays at native 1400: the case-study column caps around 1036 CSS px, so
this keeps a little headroom on a 2x screen without shipping a master nobody
will ever see at full size.

An earlier attempt used a full-page screenshot of the Behance PAGE instead of
this. It carried Behance's header, a "Follow All / Appreciate" bar sitting on
top of her artwork, and ~85% of its height was Behance's "Popular projects"
feed — other designers' work. Check what is actually in an export before
shipping it.
"""
from pathlib import Path
from PIL import Image

Image.MAX_IMAGE_PIXELS = None  # 31 MP, well past PIL's decompression-bomb guard

SRC = Path(r"C:/Users/heave/Downloads/Updated case study full public pulse.png")
OUT = Path(__file__).resolve().parent.parent / "public" / "work" / "meal-maestro"

SLICES = 18
QUALITY = 82


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    im = Image.open(SRC)

    # Only flatten if there is REAL transparency. Blindly compositing onto white
    # would fringe this one — its field is dark green, not white.
    if im.mode in ("RGBA", "LA", "P"):
        rgba = im.convert("RGBA")
        alpha = rgba.getchannel("A")
        if alpha.getextrema()[0] == 255:
            im = rgba.convert("RGB")  # fully opaque: the channel was dead weight
        else:
            bg = rgba.getpixel((0, 0))[:3]  # its own corner, not an assumption
            flat = Image.new("RGB", rgba.size, bg)
            flat.paste(rgba, mask=alpha)
            im = flat
    else:
        im = im.convert("RGB")

    w, h = im.size
    step = -(-h // SLICES)  # ceil, so the last slice absorbs the remainder
    total = 0
    for i in range(SLICES):
        top = i * step
        bottom = min(h, top + step)
        if top >= bottom:
            break
        part = im.crop((0, top, w, bottom))
        dest = OUT / f"s{i:02d}.webp"
        part.save(dest, "WEBP", quality=QUALITY, method=6)
        total += dest.stat().st_size / 1024

    src_mb = SRC.stat().st_size / 1024 / 1024
    made = sorted(OUT.glob("s*.webp"))
    print(f"{len(made)} slices, {w}x{step} each (last may be shorter)")
    print(f"{src_mb:.2f} MB  ->  {total / 1024:.2f} MB "
          f"({100 * (1 - (total / 1024) / src_mb):.0f}% smaller)")


if __name__ == "__main__":
    main()
