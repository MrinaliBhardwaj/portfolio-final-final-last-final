"""Cuts the three "selected work" board covers from her raw exports.

Each board is a fixed CSS aspect-ratio box (design-world.css: lg 16/10, sm
4/5, wide 8/3) that used to hold a decorative SVG sketch. These replace it
with real photos, pre-cropped here rather than left to CSS object-fit:cover
on the raw file, because two of the three sources don't match their board's
aspect at all:

  meal-maestro (lg, 16/10=1.6): source is already 1400x870=1.609 - a near
  no-op trim, 4px off each side.

  layover (sm, 4/5=0.8, PORTRAIT): source is a 1920x1080 LANDSCAPE slide -
  the exact opposite orientation. A blind centre-crop lands on the dark
  laptop mockup and misses both phones almost entirely. Cropped instead to
  the two-phone cluster on the right (x 1056-1920), which is what a phone-
  shaped portrait board should show anyway.

  futurepreneurs (wide, 8/3=2.667): source is 814x580=1.403, much closer to
  square than the letterbox target. Centre-cropped vertically, nudged 15px
  up off true-centre to favour the laptop screen over the black desk below
  it - the title and gradient sit centred in the result, the white margin
  above and the desk below are what's cut.

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
        "src": r"C:\Users\heave\Downloads\LAYOVER\Slide 16_9 - 7.png",
        "out": ROOT + r"\public\work\layover\cover.webp",
        "target_ratio": 4 / 5,
        "crop": "box",
        "box_center_x": 1560,
        "resize_width": 700,
    },
    {
        "name": "futurepreneurs",
        "src": r"C:\Users\heave\OneDrive\Pictures\Screenshots\Screenshot 2026-07-30 210711.png",
        "out": ROOT + r"\public\work\futurepreneurs\cover.webp",
        "target_ratio": 8 / 3,
        "crop": "center",
        "center_nudge_y": -15,
        "resize_width": 1200,
    },
]

for job in JOBS:
    im = Image.open(job["src"]).convert("RGB")
    w, h = im.size
    ratio = job["target_ratio"]

    if job["crop"] == "center":
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
