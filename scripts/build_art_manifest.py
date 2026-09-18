"""Every project-page picture, with its real pixel size -> src/case/art.js.

    python scripts/build_art_manifest.py

The project pages set `width`/`height` on every image they draw. That is not
tidiness: a case study is a scroller inside a scroller and its images are lazy,
so one <img> whose box is not reserved moves the line the reader is on, and
eighty of them make the page unusable while it loads.

Sizes written by hand go stale the first time an asset is re-exported and
nothing catches it, so they are read off the files instead. Re-run after
build_figma_components.py or after adding anything under public/work.

The case-study BOARD slices are excluded on purpose — those already carry their
sizes in projects.js, next to the crop notes that explain them.
"""
from pathlib import Path

from PIL import Image

Image.MAX_IMAGE_PIXELS = None
ROOT = Path(__file__).resolve().parent.parent
PUBLIC = ROOT / "public"
OUT = ROOT / "src" / "case" / "art.js"

SKIP = ("/case/", "/case-a/", "/case-b/")

HEAD = """// GENERATED — do not edit by hand. `python scripts/build_art_manifest.py`
//
// Every picture a project page draws, with its real pixel size.
//
// WHY A MANIFEST AND NOT A NUMBER IN THE MARKUP. The study is a scroller inside
// a scroller and its images are lazy: one <img> that arrives without its box
// reserved moves the line the reader is on, and eighty of them make the page
// unreadable while it loads. Writing the sizes by hand means they are wrong the
// first time an asset is re-exported — so they are read off the files.
export const ART = {
"""

FOOT = """};

/** @param {string} src @returns {[number, number]} */
export const size = (src) => ART[src] || [1600, 900];
"""


def main():
    rows = {}
    for f in sorted((PUBLIC / "work").rglob("*.webp")):
        rel = "/" + f.relative_to(PUBLIC).as_posix()
        if any(s in rel for s in SKIP):
            continue
        with Image.open(f) as im:
            rows[rel] = (im.width, im.height)
    body = ",\n".join(f'  "{k}": [{w}, {h}]' for k, (w, h) in rows.items())
    OUT.write_text(HEAD + body + "\n" + FOOT, encoding="utf8")
    print(f"{len(rows)} entries -> {OUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
