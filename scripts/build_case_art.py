"""Case-study BOARDS -> the ART each project page is built from.

    python scripts/build_case_art.py [slug ...]

WHY THIS EXISTS. Every project has its case study as one enormous board — hers,
exported from Figma, 12,000 to 20,000px tall and cut into `boards[].slices` by
build_case_boards.py. That board is SOURCE MATERIAL, not a layout: stacking it
in a window is a Behance page pasted into a portfolio.

The project pages are art-directed instead, which needs the board's pieces as
pieces: a full-bleed photograph, a phone screen on its own, a wordmark, a poster
grid. Layover and NextG were exported with loose assets and mostly have them
already; Meal Maestro and Futurepreneurs were not, so their art is cut out of
their own boards here.

The crops are in BOARD PIXELS — the stacked, full-height board, which is the
coordinate system her Figma frame is in and the one every note below refers to.
The slices are re-stacked in memory to get there; nothing on disk changes.

NATIVE RESOLUTION, no upscale. A crop is saved at its own pixel size unless it
is wider than MAXW, which only downscales. The pages render these at 600-1400
CSS px, so a 1400px crop is still Retina-sharp and anything bigger is spent on
nothing.

Re-run after re-slicing a board; the outputs are vendored (they are what the
site serves) but they are derived, and this file is the record of where each
one came from.
"""
import sys
from pathlib import Path

from PIL import Image

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
WORK = ROOT / "public" / "work"

MAXW = 1600
QUALITY = 82

# slug -> the directories its board slices live in, in board order
BOARDS = {
    "meal-maestro": ["meal-maestro/case"],
    "futurepreneurs": ["futurepreneurs/case-b", "futurepreneurs/case-a"],
    "layover": ["layover/case"],
    "nextg": ["nextg/case"],
}

# slug -> [(name, board index, x0, y0, x1, y1, note)]
# Every box was picked off a ruled render of the board itself (a 100px grid over
# a downscale), not guessed — and every one is a whole object of hers: a panel, a
# photograph, a mockup, a mark. Nothing here crops through a word.
CROPS = {
    "meal-maestro": [
        # The two app cards on cream that open the study — the recipe screen and
        # the tracker. The page's first real look at the product.
        ("recipe-tracker", 0, 60, 1560, 1345, 2545, "Diet Recipe + Tracker, on cream"),
        # Full-bleed produce shelf with the wordmark reversed out of it. This is
        # the brand statement of the whole deck and it is a photograph, which is
        # exactly what a full-bleed band wants.
        ("produce", 0, 70, 2700, 1335, 3390, "market shelf, wordmark over it"),
        # The wordmark on its construction grid.
        ("wordmark", 0, 75, 3405, 1020, 3815, "meal maestro wordmark + grid"),
        # The Explore screen alone, off its background.
        ("explore", 0, 175, 5005, 745, 5835, "EXPLORE, the discovery screen"),
        # "Built on a palette rooted in nature" — the swatch field with the
        # GENERATING screen in it. The palette is redrawn in CSS on the page
        # (the hexes are hers, see the theme file); this is the artwork of it.
        ("palette", 0, 45, 14060, 1355, 14810, "the palette, as she presented it"),
        # The type-system panel: Aa. set in Poppins over forest green. Poppins
        # and Open Sans are not webfonts on this site, so the typography section
        # shows her own specimen rather than faking it in another face.
        ("typespec", 0, 25, 14880, 1385, 15530, "Poppins / Open Sans specimen"),
        # "Your meals, planned for every morning" beside "Taste Every Detail." —
        # the home flow over a bowl of pasta, one of the deck's best spreads.
        ("morning", 0, 40, 15580, 1360, 16520, "home flow + Taste Every Detail"),
        # maestro ai in a real kitchen: crates, wood, daylight. The one shot in
        # the deck that is a photograph of the product in the world.
        ("crates", 0, 90, 16645, 1320, 17395, "maestro ai, shot in a kitchen"),
        # "Track. Learn. Thrive." with the macro ring and the progress chart.
        ("track", 0, 40, 17460, 1360, 18260, "the tracker flow"),
        # "Seven ways to find your meal" — the explore grid, ends on HOT Picks.
        ("seven", 0, 0, 18430, 1400, 19355, "seven ways to find your meal"),
        # The closing card: white script on wet leaves.
        ("thanks", 0, 60, 19340, 1340, 19900, "Thanks for watching!"),
    ],
    "futurepreneurs": [
        # The opening: PROJECT FUTUREPRENEURS over the lilac mesh. The mesh is
        # the deck's atmosphere and the page borrows it as a real gradient.
        ("mesh", 0, 0, 0, 1910, 1070, "PROJECT FUTUREPRENEURS, on the mesh"),
        # The TP monogram, gradient, off the black About panel.
        ("mark", 0, 1470, 1280, 1880, 1740, "the TP monogram"),
        # The social grid, split in two: six event cards, then the timeline
        # poster under them. One 1730x2310 crop would be a poster nobody can
        # read at page width; two are each a composition.
        ("social", 0, 95, 3940, 1825, 5060, "the social grid, aftermovie to partner"),
        ("timeline", 0, 95, 5040, 1825, 6250, "the TIMELINE poster"),
        # Three phones of Instagram stories, on yellow and coral blocks.
        ("stories", 0, 100, 7490, 1860, 8540, "the story set"),
        # The process diagram: research to design, on black.
        ("process", 0, 0, 8590, 1910, 9720, "research to ideate to wireframe to UI"),
        # The site, as a full page — this is the WEBSITE deliverable, and it is
        # a tall portrait mockup, so it gets its own tall slot on the page.
        ("website", 0, 180, 9820, 1215, 11915, "the event site, full page"),
        # The stickers: two TP marks, die-cut.
        ("stickers", 0, 280, 13910, 990, 14520, "the die-cut stickers"),
        # The closing card, on Sorrell Brown.
        ("thanks", 0, 0, 15915, 1910, 16481, "the Thank_you card"),
        # From the FIRST board, which is the shorter cut: the auditorium it
        # filled. The only photograph of the event itself in either deck.
        ("room", 1, 0, 5385, 1914, 6465, "the auditorium it filled"),
    ],
    "layover": [
        # The wordmark reversing its own "e", full width on near-black.
        # brand.webp is the billboard photograph of it; this is the mark itself.
        ("wordmark", 0, 110, 15640, 1490, 15895, "LayOver, with the reversed e"),
    ],
    "nextg": [
        # "Every dot on the coverage map is one of these" — a shopkeeper and a
        # rep in a real store. The argument of the whole case study in one frame.
        ("shop", 0, 0, 11800, 1600, 12215, "the outlet the coverage map is about"),
        # The coverage map panel: 98% / 900+ / 512K over a live map of India.
        ("coverage", 0, 130, 13250, 1450, 13825, "the coverage map, with its numbers"),
    ],
}


def stack(dirname):
    files = sorted((WORK / dirname).glob("s*.webp"))
    if not files:
        raise SystemExit(f"no slices in {dirname}")
    ims = [Image.open(f).convert("RGB") for f in files]
    board = Image.new("RGB", (ims[0].width, sum(i.height for i in ims)))
    y = 0
    for i in ims:
        board.paste(i, (0, y))
        y += i.height
    return board


def main(slugs):
    for slug in slugs:
        boards = [stack(d) for d in BOARDS[slug]]
        out = WORK / slug / "art"
        out.mkdir(parents=True, exist_ok=True)
        total = 0.0
        print(f"\n{slug}")
        for name, bi, x0, y0, x1, y1, note in CROPS[slug]:
            b = boards[bi]
            if x1 > b.width or y1 > b.height:
                raise SystemExit(f"{slug}/{name}: box exceeds board {b.width}x{b.height}")
            im = b.crop((x0, y0, x1, y1))
            if im.width > MAXW:
                im = im.resize((MAXW, round(im.height * MAXW / im.width)), Image.LANCZOS)
            dest = out / f"{name}.webp"
            im.save(dest, "WEBP", quality=QUALITY, method=6)
            kb = dest.stat().st_size / 1024
            total += kb
            print(f"  {name:14} {im.width:5}x{im.height:<5} {kb:7.1f} KB   {note}")
        print(f"  {'total':14} {'':11} {total:7.1f} KB")


if __name__ == "__main__":
    main(sys.argv[1:] or list(CROPS))
