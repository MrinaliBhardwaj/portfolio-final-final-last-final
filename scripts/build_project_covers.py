"""Cuts the three "selected work" board covers from her raw exports.

Each board is a fixed CSS aspect-ratio box (design-world.css: lg 16/10, sm
4/5, wide 2/1 — wide was 8/3 until this pass, see below) that used to hold a
decorative SVG sketch. These replace it with real photos, pre-cropped here
rather than left to CSS object-fit:cover on the raw file, because two of the
three sources don't match their board's aspect at all:

  meal-maestro (lg, 16/10=1.6): source is already 1400x870=1.609 - a near
  no-op trim, 4px off each side.

  layover (sm, 4/5=0.8, PORTRAIT): source is a 1920x1080 LANDSCAPE slide -
  the exact opposite orientation. Two passes to get here, both by drawing
  candidate boxes over the source and looking, not by computing coordinates
  blind: pass 1 cropped the full height at the two-phone cluster and looked
  wrong on arrival (phones small at the bottom of empty gradient). Pass 2
  raised the crop's top edge, but only as far as y=340 - still 45px into the
  gap where the DARK LAPTOP MOCKUP's edge is exposed just above the phones
  (the phone doesn't visually start until y=385, and the laptop sits behind
  it, so anything above y=385 in that x-range shows laptop, not phone or
  background). The fix was raising y0 again, to right where the phone
  actually begins (y=385) rather than stopping at a number that merely looked
  close. Final box (1082, 385, 1638, 1080): starts exactly at the phones' top
  edge, no laptop, both phones filling the frame centred.

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
        "src": r"C:\Users\heave\Downloads\LAYOVER\Slide 16_9 - 7.png",
        "out": ROOT + r"\public\work\layover\cover.webp",
        "crop": "explicit",
        "box": (1082, 385, 1638, 1080),
        "resize_width": 700,
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
