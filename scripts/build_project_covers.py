"""Cuts the three "selected work" board covers from her raw exports.

Each board is a fixed CSS aspect-ratio box (design-world.css: lg 16/10, sm
4/5, wide 2/1 — wide was 8/3 until this pass, see below) that used to hold a
decorative SVG sketch. These replace it with real photos, pre-cropped here
rather than left to CSS object-fit:cover on the raw file, because two of the
three sources don't match their board's aspect at all:

  meal-maestro (lg, 16/10=1.6): source is already 1400x870=1.609 - a near
  no-op trim, 4px off each side.

  layover (sm) went through two different SOURCE IMAGES, not just recrops.
  Both were 1920x1080 slides from the same deck:

  v1 was the two-phone app slide. Two passes to get right, both by drawing
  candidate boxes over the source and looking, not by computing coordinates
  blind: pass 1 cropped the full height at the phone cluster and looked wrong
  on arrival (phones small at the bottom of empty gradient). Pass 2 raised
  the crop's top edge, but only to y=340 - still 45px into the gap where the
  dark laptop mockup BEHIND the phones is exposed above them (the phone
  itself doesn't start until y=385). Fixed by raising y0 to 385 exactly.

  v2 (current) swaps in the wordmark billboard slide instead - white LayOver
  logo (the reversed 'e') on a black sign, on a tree-lined street. Asked to
  "increase width": the board was 4/5 PORTRAIT, this source is landscape, and
  unlike the futurepreneurs case, this board's WIDTH is not aspect-ratio
  derived - `.dw-board--sm .dw-board-art` has no explicit width, so it fills
  its grid-column track first and aspect-ratio only ever set its HEIGHT
  against that already-fixed width. Loosening the ratio here would have made
  the box shorter, not wider. Actually growing it needed the grid-column span
  itself increased (design-world.css) - 4 tracks to 5, reclaiming the empty
  gap column between it and the lg board (row: lg spans 1-7, gap at 8, sm
  used to start at 9 - sm now starts at 8, the maximum growth available
  without overlapping lg, which ends its own span exactly at column 8).

  The crop itself only trims the slide's own decorative frame - flat cream
  and gold gradient bars either side of the photo, confirmed by scanning for
  colour-jump discontinuities rather than eyeballing where they end (x<195
  and x>1725 are the bars; the real photo is exactly x 195-1725). No
  further crop needed: keeping the full photo height alongside that width
  gives 1530x1080 = 17/12 ≈ 1.417, on its own a normal landscape ratio - nice
  enough that the board's aspect-ratio just uses that number directly rather
  than forcing a rounder target and cropping the photo further to hit it.

  futurepreneurs (wide, was 8/3=2.667, now 2/1=2.0): source is 814x580=1.403,
  much closer to square than either letterbox ratio. IMPORTANT: under
  object-fit:cover with a fixed-width source, the RENDERED crop height is
  always source_width / board_ratio, no matter how tall a region is cropped
  here — cover always re-crops back down to whatever the box demands. So
  "show more of the image" is not something this script can do alone; the
  board's own aspect-ratio had to change too (done in design-world.css,
  desktop only — futurepreneurs is the only project using size:"wide", so
  nothing else shares this box). At 2/1 the crop runs 90-460 vertically,
  which is the full laptop plus a strip of the colourful desk reflection
  under it, instead of the tight 8/3 crop's laptop-screen-only strip.

Run from the repo root: python scripts/build_project_covers.py
"""

from PIL import Image

ROOT = r"C:\Users\heave\Downloads\mri's portfolio"

JOBS = [
    {
        "name": "meal-maestro",
        "src": r"C:\Users\heave\Downloads\Updated case study full.png",
        "out": ROOT + r"\public\work\meal-maestro\cover.webp",
        "target_ratio": 16 / 10,
        "crop": "center",
        "resize_width": 1200,
    },
    {
        "name": "layover",
        "src": r"C:\Users\heave\Downloads\LAYOVER\Slide 16_9 - 5.png",
        "out": ROOT + r"\public\work\layover\cover.webp",
        "crop": "explicit",
        "box": (195, 0, 1725, 1080),
        "resize_width": 1200,
    },
    {
        "name": "futurepreneurs",
        "src": r"C:\Users\heave\OneDrive\Pictures\Screenshots\Screenshot 2026-07-30 210711.png",
        "out": ROOT + r"\public\work\futurepreneurs\cover.webp",
        "target_ratio": 2 / 1,
        "crop": "center",
        "center_nudge_y": -15,
        "resize_width": 1200,
    },
]

for job in JOBS:
    im = Image.open(job["src"]).convert("RGB")
    w, h = im.size

    if job["crop"] == "explicit":
        box = job["box"]
        ratio = (box[2] - box[0]) / (box[3] - box[1])
    elif job["crop"] == "center":
        ratio = job["target_ratio"]
        if w / h > ratio:
            # source proportionally wider than target: crop width, keep height
            crop_h = h
            crop_w = int(round(crop_h * ratio))
            x0 = (w - crop_w) // 2
            y0 = job.get("center_nudge_y", 0)
            y0 = max(0, min(h - crop_h, (h - crop_h) // 2 + y0))
        else:
            crop_w = w
            crop_h = int(round(crop_w / ratio))
            y0 = (h - crop_h) // 2 + job.get("center_nudge_y", 0)
            y0 = max(0, min(h - crop_h, y0))
            x0 = 0
        box = (x0, y0, x0 + crop_w, y0 + crop_h)
    else:  # "box" - horizontal crop centred on a named x, full height
        ratio = job["target_ratio"]
        crop_h = h
        crop_w = int(round(crop_h * ratio))
        cx = job["box_center_x"]
        x0 = max(0, min(w - crop_w, cx - crop_w // 2))
        box = (x0, 0, x0 + crop_w, crop_h)

    cropped = im.crop(box)
    # never upscale past the crop's native resolution - futurepreneurs' crop
    # is only 814px wide (the source screenshot's full width), and asking for
    # 1200 stretched it 47% and visibly softened the laptop screen's text
    out_w = min(job["resize_width"], cropped.size[0])
    out_h = int(round(out_w / ratio))
    resized = cropped.resize((out_w, out_h), Image.LANCZOS)
    resized.save(job["out"], "WEBP", quality=88)

    import os
    size_kb = os.path.getsize(job["out"]) / 1024
    print(f"{job['name']}: {im.size} -> crop {box} -> {resized.size}  ({size_kb:.1f} KB)")
