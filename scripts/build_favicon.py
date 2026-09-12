"""Her monogram, as the tab icon.

    python scripts/build_favicon.py

WHAT IT REPLACED. The favicon was a tight crop of the cover's lotus (cut by
build_social_assets.py). At 32px a photographic bloom is a smudge — pretty in
the file, unreadable in a tab strip — and it said nothing about whose tab it
is. The monogram is the mark she already signs every world with: "mb" in Pinyon
Script, the same face .dw-mark and .nw-mark wear.

OUTLINES, NOT TEXT, for the SVG: a favicon cannot load a webfont, so a
`<text>` element would render in whatever the viewer happens to have and would
not be Pinyon anywhere. The glyphs are cut from the font file this site already
ships (node_modules/@fontsource/pinyon-script) and written as paths.

AND THE SVG HAS NO TILE BEHIND IT. It carries a `prefers-color-scheme` rule
instead, so the monogram is dark ink on a light tab strip and cream on a dark
one — the mark sitting on the tab itself rather than in a box. The PNGs cannot
do that: a raster is one fixed picture, and a cream monogram on transparent
disappears against Chrome's default light strip. They keep the squircle, which
is also what iOS demands of a home-screen icon (it composites onto an opaque
tile regardless, so transparency there buys a black box you did not choose).

The PNGs are drawn from the same font through PIL, at 4x and downsampled, which
is what gives the 32px one clean edges.

Needs: pip install fonttools brotli pillow
"""
import io
import os

from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, ".."))
PINYON = os.path.join(
    ROOT, "node_modules", "@fontsource", "pinyon-script", "files",
    "pinyon-script-latin-400-normal.woff2")
OUT = os.path.join(ROOT, "public")

# THE GROUND IS THE SITE'S OWN. Every world this mark appears in sits on near
# black, and a tab strip is the one place a transparent icon cannot be trusted:
# on a light theme a white monogram on nothing is an empty square.
INK = (244, 242, 247)
GROUND = (10, 9, 16)
# the same mark for a light tab strip: the site's ground, used as the ink
INK_ON_LIGHT = (10, 9, 16)
# a squircle, because every OS that shows the 180 will round it anyway — and
# one that rounds it again over a square just clips the corners twice
RADIUS = 0.22


def ttf_bytes():
    """the woff2 as a plain TTF, which is what PIL's FreeType can read"""
    font = TTFont(PINYON)
    font.flavor = None
    buf = io.BytesIO()
    font.save(buf)
    return buf.getvalue(), font


# HOW MUCH OF THE TILE THE INK TAKES, and it is not one number. A tab icon is
# read at 16-32px and wants to fill its square; a home-screen icon is read at
# 60+ and wants the margin every other app on that screen has. Pinyon is a
# script with hairline joins, so the tab sizes also carry a little added weight
# — without it the thin strokes grey out to a smudge, which is exactly how the
# lotus crop failed.
# the SVG has no tile to sit inside, so it can run nearly to the edges — the
# margin a boxed icon needs is the box's, not the mark's
FILL = {"favicon-32.png": 0.82, "apple-touch-icon.png": 0.66, "svg": 0.88}


def draw_png(size, ttf, fill, bolden=0.0, scale=4):
    """`mb` centred on the ground, drawn big and downsampled for clean edges"""
    big = size * scale
    im = Image.new("RGB", (big, big), GROUND)
    mask = Image.new("L", (big, big), 0)
    ImageDraw.Draw(mask).rounded_rectangle(
        [0, 0, big - 1, big - 1], radius=int(big * RADIUS), fill=255)

    # Pinyon sets small for its point size (it is a script face with long
    # ascenders and a low x-height), so the box is filled by measurement rather
    # than by a guessed ratio: grow until the INK is ~62% of the tile's width.
    target = big * fill
    px = big
    while px > 4:
        font = ImageFont.truetype(io.BytesIO(ttf), px)
        box = font.getbbox("mb")
        if (box[2] - box[0]) <= target:
            break
        px = int(px * 0.94)
    font = ImageFont.truetype(io.BytesIO(ttf), px)
    box = font.getbbox("mb")
    d = ImageDraw.Draw(im)
    stroke = int(round(big * bolden))
    # centred on the INK box, not on the font's line box: a script face's line
    # box is mostly the room its ascenders and descenders need, and centring on
    # that hangs the two letters high in the tile
    d.text(
        ((big - (box[2] - box[0])) / 2 - box[0], (big - (box[3] - box[1])) / 2 - box[1]),
        "mb", font=font, fill=INK, stroke_width=stroke, stroke_fill=INK)

    out = Image.new("RGB", (big, big), GROUND)
    out.paste(im, (0, 0), mask)
    # the corners the mask cut are the page behind the icon: black, like the tab
    flat = Image.new("RGB", (big, big), (0, 0, 0))
    flat.paste(out, (0, 0), mask)
    return flat.resize((size, size), Image.LANCZOS)


def svg(font, fill):
    """the two glyphs as paths, so the icon is sharp at any size"""
    glyphs = font.getGlyphSet()
    cmap = font.getBestCmap()
    upem = font["head"].unitsPerEm
    hmtx = font["hmtx"]

    d, x = [], 0.0
    for ch in "mb":
        name = cmap[ord(ch)]
        pen = SVGPathPen(glyphs)
        glyphs[name].draw(pen)
        path = pen.getCommands()
        if path:
            d.append(f'<path transform="translate({x:.1f} 0)" d="{path}" />')
        x += hmtx[name][0]

    # the ink box, so the mark can be centred on what you can SEE
    xs, ys = [], []
    for ch, off in zip("mb", [0.0, hmtx[cmap[ord("m")]][0]]):
        g = font["glyf"][cmap[ord(ch)]]
        if g.numberOfContours:
            xs += [g.xMin + off, g.xMax + off]
            ys += [g.yMin, g.yMax]
    w, h = max(xs) - min(xs), max(ys) - min(ys)
    side = max(w, h) / fill
    tx = min(xs) - (side - w) / 2
    ty = min(ys) - (side - h) / 2
    ink = "#%02x%02x%02x" % INK_ON_LIGHT
    ink_dark = "#%02x%02x%02x" % INK
    return f"""<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {side:.0f} {side:.0f}">
  <style>
    /* no tile: the monogram sits on the tab strip itself, and follows it */
    path {{ fill: {ink}; }}
    @media (prefers-color-scheme: dark) {{ path {{ fill: {ink_dark}; }} }}
  </style>
  <g transform="translate({-tx:.1f} {ty + side:.1f}) scale(1 -1)">
    {chr(10).join("    " + p for p in d).strip()}
  </g>
</svg>
"""


def main():
    ttf, font = ttf_bytes()
    for name, size, bolden in (
        ("favicon-32.png", 32, 0.004),
        ("apple-touch-icon.png", 180, 0.0),
    ):
        path = os.path.join(OUT, name)
        draw_png(size, ttf, FILL[name], bolden).save(path)
        print(f"{name:22} {size}x{size}  {os.path.getsize(path) / 1024:5.1f} KB")
    path = os.path.join(OUT, "favicon.svg")
    with io.open(path, "w", encoding="utf-8") as f:
        f.write(svg(font, FILL["svg"]))
    print(f"{'favicon.svg':22} vector  {os.path.getsize(path) / 1024:5.1f} KB")


if __name__ == "__main__":
    main()
