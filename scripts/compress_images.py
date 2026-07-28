"""Convert the heavy referenced PNGs in public/ to WebP.

Only files that are actually referenced and actually large are here. The small
ones (folder, profile-tab, softwares, flourish, the lanyard band texture — all
under 60 KB) are left as PNG on purpose: the saving is negligible and every
conversion is a reference change that can break something.

Alpha is preserved where the source has it — contact-envelope.png in particular
is a TRUE-transparent PNG (that was established the hard way; an earlier asset
turned out to have a checkerboard baked in as opaque pixels) and WebP carries
alpha fine.

Quality is per-image, not one global number: linework and text need more than
photographs do at the same perceived quality.
"""
from pathlib import Path
from PIL import Image

PUB = Path(__file__).resolve().parent.parent / "public"

# path relative to public/  ->  quality
TARGETS = {
    "design-hero/bg-pond.png": 88,      # painted pond, soft gradients
    "contact-envelope.png": 90,         # photo, real alpha, has handwriting in it
    "tech-discovery.png": 90,           # pencil linework + small code text
    "design-hero/mini-mri.png": 88,     # photograph
    "design-hero/tiger.png": 90,        # illustration with hard edges
}


def main():
    before = after = 0
    for rel, q in TARGETS.items():
        src = PUB / rel
        if not src.exists():
            raise SystemExit(f"missing: {src}")
        im = Image.open(src)
        has_alpha = im.mode in ("RGBA", "LA") or (
            im.mode == "P" and "transparency" in im.info
        )
        im = im.convert("RGBA" if has_alpha else "RGB")
        dest = src.with_suffix(".webp")
        im.save(dest, "WEBP", quality=q, method=6, lossless=False)

        b = src.stat().st_size / 1024
        a = dest.stat().st_size / 1024
        before += b
        after += a
        print(
            f"{rel:32} {im.size[0]:>5}x{im.size[1]:<5} "
            f"alpha={'y' if has_alpha else 'n'}  {b:7.0f} -> {a:6.0f} KB"
        )

    print(f"\n{'total':32} {'':13} {before:12.0f} -> {after:6.0f} KB "
          f"({100 * (1 - after / before):.0f}% smaller)")


if __name__ == "__main__":
    main()
