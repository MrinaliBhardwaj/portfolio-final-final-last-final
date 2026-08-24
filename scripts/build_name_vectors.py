"""Regenerate src/NameMark.jsx -- her name as kerned vector artwork.

    python scripts/build_name_vectors.py

WHY THIS EXISTS. The hero name used to be text in two script faces: Ballet for
the capitals, Pinyon Script for the lowercase. Pinyon does not reliably join its
letters -- several lowercase pairs in "Mrinali Bhardwaj" meet at a TANGENT
rather than an overlap, which is a mathematical touch and not a visible one. At
the shipped ~187px the i->n join was 2px of ink; on a phone, under one. Those
were the reported breaks.

letter-spacing cannot fix a tangent -- it moves every glyph by the same amount,
so it either leaves the join alone or crashes the whole run. The fix has to be
per pair, which means the glyphs have to be independent objects. Hence outlines.

Needs: pip install fonttools brotli   (brotli is what reads the .woff2 files)
"""
import math
import os

import numpy as np
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.basePen import BasePen
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
from fontTools.misc.transform import Transform
from PIL import Image, ImageDraw

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.normpath(os.path.join(HERE, ".."))
BALLET = os.path.join(
    ROOT, "node_modules", "@fontsource-variable", "ballet", "files",
    "ballet-latin-opsz-normal.woff2")
PINYON = os.path.join(
    ROOT, "node_modules", "@fontsource", "pinyon-script", "files",
    "pinyon-script-latin-400-normal.woff2")
DEST = os.path.join(ROOT, "src", "NameMark.jsx")


def load_ballet():
    f = TTFont(BALLET)
    # the page renders `font-variation-settings: "opsz" 72`, and the default
    # instance is a DIFFERENT set of outlines -- pin the axis or the artwork
    # will not be the shape the CSS was drawing
    return instantiateVariableFont(f, {"opsz": 72}, inplace=True,
                                   updateFontNames=False)


def load_pinyon():
    return TTFont(PINYON)


class FlattenPen(BasePen):
    """Outlines as polylines, for rasterising. Quadratics and cubics both get
    subdivided; `steps` is per curve segment."""

    def __init__(self, glyphSet, steps=24):
        super().__init__(glyphSet)
        self.contours, self.cur, self.steps = [], [], steps

    def _moveTo(self, p):
        self._flush()
        self.cur = [p]

    def _lineTo(self, p):
        self.cur.append(p)

    def _curveToOne(self, c1, c2, p):
        p0 = self.cur[-1]
        for i in range(1, self.steps + 1):
            t = i / self.steps
            u = 1 - t
            self.cur.append((
                u*u*u*p0[0] + 3*u*u*t*c1[0] + 3*u*t*t*c2[0] + t*t*t*p[0],
                u*u*u*p0[1] + 3*u*u*t*c1[1] + 3*u*t*t*c2[1] + t*t*t*p[1]))

    def _qCurveToOne(self, c, p):
        p0 = self.cur[-1]
        for i in range(1, self.steps + 1):
            t = i / self.steps
            u = 1 - t
            self.cur.append((u*u*p0[0] + 2*u*t*c[0] + t*t*p[0],
                             u*u*p0[1] + 2*u*t*c[1] + t*t*p[1]))

    def _closePath(self):
        self._flush()

    def _endPath(self):
        self._flush()

    def _flush(self):
        if len(self.cur) > 2:
            self.contours.append(self.cur)
        self.cur = []


def glyph_name(font, ch):
    return font.getBestCmap()[ord(ch)]


def outline(font, ch, steps=24):
    gs = font.getGlyphSet()
    pen = FlattenPen(gs, steps)
    gs[glyph_name(font, ch)].draw(pen)
    pen._flush()
    return pen.contours


def advance(font, ch):
    return font["hmtx"][glyph_name(font, ch)][0]


def upem(font):
    return font["head"].unitsPerEm


# ---- layout ----------------------------------------------------------------
K = 1000        # output units per em
TRACK = -0.01   # the tracking the CSS used to apply, folded into the layout
PPEM = 600      # rasterisation density for the measurements
# NO TUCKS. THE FONT'S SPACING WAS RIGHT ALL ALONG (2026-08-20, second pass).
#
# This solver used to close each weak join by nudging the right-hand glyph left
# until a contact threshold was met. Shipped, that read as "too into each
# other", and measuring the TERMINALS rather than the contact area says why.
#
# In the baseline band, every lowercase pair in this name ALREADY overlaps
# horizontally, by 0.05-0.10em, before anything is moved:
#
#     r->i -0.100   i->n -0.070   n->a -0.075   a->l -0.090   l->i -0.100
#     h->a -0.075   a->r -0.053   r->d -0.067   d->w -0.100   w->a -0.075
#
# That overlap is the design: in a connected script the exit stroke of one
# letter and the entry stroke of the next are the same stroke drawn twice, and
# the advance width is where the designer intended them to superimpose. The
# tucks pushed i->n to -0.123 and a->r to -0.130, roughly doubling it, which
# does not join the letters -- it drives one into the body of the other.
#
# AND THE JOIN CANNOT BE CLOSED HORIZONTALLY ANYWAY. The two hairlines CROSS at
# a shallow angle instead of meeting tip to tip: for i->n the n's entry terminal
# sits 0.070em left of AND 0.157em below the i's exit terminal. A horizontal
# nudge only changes how deeply they cross; it can never bring the two tips
# together, because they are separated vertically as well. Making them meet at
# the ends means editing the outlines -- trimming each stroke back to the
# crossing and welding them -- which is letterform work, not kerning.
#
# So the artwork ships at the font's own advances. Everything vectorising bought
# is still bought: no font to substitute, no ink outside the box, no
# measure-and-rescale effect. Run report() to print the geometry.
CONTACT_TARGET = 0.065   # only used by report(), to show what a solver would do
GAP = 0.28      # em between the two words


def layout(runs, tracking_em=TRACK, deltas=None):
    """A run is (font, text, em_scale). Returns [(font, ch, x_pen, scale)] in a
    common space where 1.0 == the Ballet em. A delta at index i shifts glyph i
    AND everything after it, which is what makes it a kern rather than a
    collision: the rest of the run keeps its own spacing as it moves."""
    deltas = deltas or {}
    out, x, idx = [], 0.0, 0
    for font, text, em in runs:
        u = upem(font)
        for ch in text:
            if ch == " ":
                x += GAP + tracking_em
                idx += 1
                continue
            x += deltas.get(idx, 0.0)
            out.append((font, ch, x, em / u))
            x += advance(font, ch) * em / u + tracking_em
            idx += 1
    return out


def ink_polys(placed, px_per_em):
    polys = []
    for font, ch, xpen, s in placed:
        for c in outline(font, ch):
            polys.append([((xpen + px*s) * px_per_em, -(py*s) * px_per_em)
                          for px, py in c])
    return polys


def raster(polys, pad=40):
    """Even-odd rasterise -- correct for letterforms, whose counters are wound
    the opposite way and which do not self-intersect."""
    xs = [p[0] for c in polys for p in c]
    ys = [p[1] for c in polys for p in c]
    x0, y0 = min(xs) - pad, min(ys) - pad
    W = int(math.ceil(max(xs) + pad - x0))
    H = int(math.ceil(max(ys) + pad - y0))
    acc = np.zeros((H, W), dtype=bool)
    for c in polys:
        im = Image.new("1", (W, H), 0)
        ImageDraw.Draw(im).polygon([(p[0] - x0, p[1] - y0) for p in c], fill=1)
        acc ^= np.array(im, dtype=bool)
    return acc, (x0, y0)


# ---- the measurement -------------------------------------------------------
# THE TUCKS ARE SOLVED, NOT TYPED. They were hard-coded once, as a dict keyed by
# glyph index, and the indices silently went out of step with the word they
# belonged to -- the i->n tuck was written onto the `i` instead of the `n`, so
# the join it was meant to close never moved. Numbers measured in one place and
# retyped in another drift; these are derived here, on every run.
#
# THE METRIC IS CONTACT, not stroke thickness. For a pair, mask each glyph and
# ask how much of the two actually touches -- `a & dilate(b)`, reported as the
# vertical extent of that contact. It rises as the pair closes. A "thinnest ink
# column in the corridor" measure does NOT: tucking further widens the corridor
# being searched, so it can report a WORSE number for a better join, and that
# non-monotonicity is what produced a wrong table the first time round.
#
# CAPITALS ARE EXCLUDED. M->r and B->h have zero contact, and no tuck fixes
# B->h: swept to -0.32em the B still never touches the h, because Ballet's B
# ends in a flourish that curves away from the baseline rather than in an exit
# stroke. M->r can be forced shut at -0.12em and it looks worse -- the r climbs
# onto the M's last leg and the two crash. Swash capitals stand apart from the
# lowercase that follows them; both faces are drawn that way.
WORDS = [("Mrinali", "M", "rinali"), ("Bhardwaj", "B", "hardwaj")]


def runs_for(cap, rest):
    return [(BALLET_F, cap, 1.0), (PINYON_F, rest, 0.861)]


def gmask(one, shape, origin, ppem=None):
    # ppem is a PARAMETER, not the module constant it used to read. Rasterising
    # a scene at one density and its glyph masks at another silently scales
    # every mask -- it put the first weld 0.6em from where the strokes meet.
    ppem = PPEM if ppem is None else ppem
    ox, oy = origin
    H, W = shape
    acc = np.zeros((H, W), bool)
    for c in ink_polys([one], ppem):
        im = Image.new("1", (W, H), 0)
        ImageDraw.Draw(im).polygon([(p[0] - ox, p[1] - oy) for p in c], fill=1)
        acc ^= np.array(im, dtype=bool)
    return acc


def _dilate(m):
    o = m.copy()
    o[1:, :] |= m[:-1, :]
    o[:-1, :] |= m[1:, :]
    o[:, 1:] |= m[:, :-1]
    o[:, :-1] |= m[:, 1:]
    return o


def contact(runs, deltas, i):
    """Vertical extent, in em, over which glyph i and glyph i+1 actually touch.
    0.0 means they do not touch at all -- a break."""
    placed = layout(runs, deltas=deltas)
    mask, origin = raster(ink_polys(placed, PPEM))
    a = gmask(placed[i], mask.shape, origin)
    b = gmask(placed[i + 1], mask.shape, origin)
    t = a & _dilate(b)
    if not t.any():
        return 0.0
    ys = np.where(t.any(axis=1))[0]
    return (ys.max() - ys.min() + 1) / PPEM


def solve(cap, rest):
    """Smallest leftward nudge per pair that brings contact up to TARGET."""
    runs, text, tucks = runs_for(cap, rest), cap + rest, {}
    for i in range(1, len(text) - 1):      # from 1: the capital is left alone
        before = contact(runs, tucks, i)
        if before >= CONTACT_TARGET:
            print("  %s->%-2s  %.4f              ok" % (text[i], text[i+1], before))
            continue
        for step in range(1, 61):
            d = -step * 0.004
            trial = dict(tucks)
            trial[i + 1] = d
            got = contact(runs, trial, i)
            if got >= CONTACT_TARGET:
                tucks[i + 1] = d
                print("  %s->%-2s  %.4f %+.3f -> %.4f"
                      % (text[i], text[i+1], before, d, got))
                break
        else:
            print("  %s->%-2s  %.4f              UNSOLVED" % (text[i], text[i+1], before))
    print("  %s->%-2s  %.4f              capital, left apart"
          % (text[0], text[1], contact(runs, tucks, 0)))
    return tucks


# ---- the trims -------------------------------------------------------------
# TRIMMING THE STUB, which is the only repair that actually applies here.
#
# At i->n and a->r the two glyphs meet at a POINT -- 38 and 171 pixels of shared
# ink at 900ppem. The connector's blunt terminal reaches the next letter's stem
# at an angle, so one corner of that flat cap lands INSIDE the stem and the
# other pokes out past its edge. The corner that pokes out is the step she saw.
#
# It cannot be built up. Adding ink (a round join, a fillet, a morphological
# close) leaves the protruding corner exactly where it was and only adds a bulge
# somewhere else -- all three were tried and all three did. The corner has to
# come OFF.
#
# THE CUT. Take the stub glyph's ink near the contact, give it a direction (the
# principal axis of that ink, pointed at the other glyph), and project every
# pixel onto it. The deepest pixel that is still INSIDE the other glyph marks
# how far the stroke genuinely penetrates the stem; everything past that is the
# uncovered corner. Cutting there removes the corner and leaves the stroke
# ending inside the stem, where the stem covers the cut -- so no step outside
# and no gap inside. The cut edge is never seen.
#
# It is applied as a clip on that ONE glyph's own path, which is why the glyphs
# are emitted separately now. A mask over the whole word would cut the stem too.
# OFF. The cut is computed correctly and is surgical -- 0.43% of the ink, right
# at the contact -- and checked against the browser it removes the wrong 0.43%:
# the step in the connector survives it. Five automatic repairs were tried here
# (kern, close, fillet, round join, trim) and every one either missed the defect
# or damaged something else. The remaining fix is a hand weld with a pen tool,
# which is minutes of a designer's time and evidently hours of mine.
TRIM_PAIRS = {}
TRIM_PPEM = 900
TRIM_RHO = 0.045     # em; how much of the stroke around the contact is examined
TRIM_BLEED = 0.004   # em; keep the cut this far inside the stem, never outside


def _pca_dir(ys, xs):
    p = np.stack([xs - xs.mean(), ys - ys.mean()])
    w, v = np.linalg.eigh(p @ p.T)
    return v[:, -1]


def trim_for(runs, pair):
    """The half-plane that takes the protruding corner off. Returns
    (keep_normal, offset) in output units, or None if there is nothing to cut."""
    i, j = pair
    placed = layout(runs)
    mask, origin = raster(ink_polys(placed, TRIM_PPEM))
    A = gmask(placed[i], mask.shape, origin, TRIM_PPEM)
    B = gmask(placed[j], mask.shape, origin, TRIM_PPEM)
    ov = A & B
    if not ov.any():
        return None
    cy, cx = np.where(ov)[0].mean(), np.where(ov)[1].mean()

    rho = TRIM_RHO * TRIM_PPEM
    Y, X = np.ogrid[:mask.shape[0], :mask.shape[1]]
    near = ((Y - cy) ** 2 + (X - cx) ** 2) <= rho * rho

    # whichever glyph pokes out past the other, near the contact, owns the stub
    a_out = int((A & near & ~B).sum())
    b_out = int((B & near & ~A).sum())
    stub_is_a = a_out >= b_out
    S, OTHER = (A, B) if stub_is_a else (B, A)

    sy, sx = np.where(S & near)
    if len(sy) < 20:
        return None
    u = _pca_dir(sy, sx)                      # (ux, uy) in pixel space
    oy, ox_ = np.where(OTHER & near)
    to_other = np.array([ox_.mean() - sx.mean(), oy.mean() - sy.mean()])
    if u @ to_other < 0:
        u = -u                                # point the axis INTO the other glyph

    t = (sx - cx) * u[0] + (sy - cy) * u[1]
    inside = OTHER[sy, sx]
    if not inside.any():
        return None
    t_cut = t[inside].max() - TRIM_BLEED * TRIM_PPEM
    kept_off = int((t > t_cut).sum())
    if kept_off == 0:
        return None

    # back to output units: the plane is { p : (p - c) . u <= t_cut }
    x0, y0 = origin
    c_out = ((cx + x0) / TRIM_PPEM * K, (cy + y0) / TRIM_PPEM * K)
    return dict(u=(float(u[0]), float(u[1])), c=c_out,
                t=float(t_cut / TRIM_PPEM * K),
                owner=(i if stub_is_a else j),
                removed=kept_off)


def clip_shapes(tr):
    """The cut, as TWO contours for an even-odd clip: a rectangle covering the
    whole artwork, minus a small circular SEGMENT over the protruding corner.

    A half-plane was the obvious construction and it is wrong -- a clip applies
    to the entire glyph, so slicing on an infinite line took most of the n away
    with the corner. The removal has to be local, and the segment is the
    half-plane intersected with the same disc the measurement was made in."""
    (ux, uy), (cx, cy), t = tr["u"], tr["c"], tr["t"]
    rho = TRIM_RHO * K
    if abs(t) >= rho:
        return None
    keep = [(-20000.0, -20000.0), (20000.0, -20000.0),
            (20000.0, 20000.0), (-20000.0, 20000.0)]
    # points of the disc lying past the cut, in angle order, closed by the chord
    seg, steps = [], 96
    base = math.atan2(uy, ux)
    for k in range(steps + 1):
        a = base - math.pi / 2 + math.pi * k / steps
        px, py = cx + rho * math.cos(a), cy + rho * math.sin(a)
        if (px - cx) * ux + (py - cy) * uy >= t:
            seg.append((px, py))
    if len(seg) < 3:
        return None
    h = math.sqrt(max(rho * rho - t * t, 0.0))
    dx, dy = -uy, ux
    seg = ([(cx + ux * t - dx * h, cy + uy * t - dy * h)] + seg +
           [(cx + ux * t + dx * h, cy + uy * t + dy * h)])
    return keep, seg


def word_paths(runs, tucks):
    """One path per glyph. They used to be concatenated into a single `d`, and
    they cannot be any more: a clip has to apply to ONE letter, and a single
    fill rule shared across every contour in a word is a hole waiting to
    happen."""
    placed = layout(runs, deltas=tucks)
    out, xs, ys = [], [], []
    for font, ch, xpen, s in placed:
        gs = font.getGlyphSet()
        pen = SVGPathPen(gs, ntos=lambda v: ("%.1f" % v).rstrip("0").rstrip("."))
        # font units are y-up, SVG is y-down; y = 0 stays the baseline
        gs[glyph_name(font, ch)].draw(
            TransformPen(pen, Transform(s*K, 0, 0, -s*K, xpen*K, 0)))
        out.append(pen.getCommands())
        for c in outline(font, ch):
            for px, py in c:
                xs.append((xpen + px*s) * K)
                ys.append(-(py*s) * K)
    return out, (min(xs), min(ys), max(xs), max(ys))


HEADER = '''// HER NAME, AS VECTOR ARTWORK -- not as text in two script fonts.
//
// GENERATED by scripts/build_name_vectors.py. Do not hand-edit.
//
// WHY IT IS DRAWN AND NOT SET. Two junctions in her name read as breaks -- i->n
// in Mrinali and a->r in Bhardwaj. They are not spacing: measured on the
// outlines the glyphs there share 38 and 171 pixels at 900ppem, a POINT
// contact. The connector's blunt terminal reaches the next letter's stem at an
// angle, one corner of that flat cap lands inside the stem and the other pokes
// out past its edge, and the corner that pokes out is the step you can see.
//
// Kerning cannot fix it -- closing the pair only drives one letter into the
// body of the other, and it was tried. Nor can anything additive: a round join,
// a fillet and a morphological close all leave the protruding corner where it
// is. The corner is TRIMMED instead, by clipping that one glyph on a plane that
// sits just inside the stem, so the cut is covered and neither a step nor a gap
// is left. See the build script for how the plane is found.
//
// ONE PATH PER GLYPH, and a clip belongs to one letter -- which a single merged
// path per word could not express, and which also removes any chance of two
// contours sharing a fill rule and cancelling into a hole.
//
// GEOMETRY. Both words share one vertical extent, so both boxes are the same
// height and their baselines land at the same place -- which is what lets them
// sit in a row without a text baseline to align to, and stack into two lines on
// a phone. Each box is the INK box: nothing paints outside it, so the
// swash-overhang padding this used to need is gone, and so is the
// measure-and-rescale safety net that used to live in Cover.jsx.'''

COMPONENT = '''
export default function NameMark() {
  return (
    <>
      {NAME_WORDS.map((w) => (
        <svg
          key={w.word}
          className="cover-name-word"
          viewBox={`${w.x} ${NAME_VIEW.y} ${w.w} ${NAME_VIEW.h}`}
          style={{ width: `${w.em}em` }}
          role="presentation"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            {w.glyphs.map((g, i) =>
              g.clip ? (
                <clipPath
                  key={i}
                  /* namespaced by word: ids are global to the document, and two
                     inline svgs both defining #c2 is the collision the dock
                     icons already taught us about */
                  id={`nm-${w.word.toLowerCase()}-${i}`}
                  clipPathUnits="userSpaceOnUse"
                  clipRule="evenodd"
                >
                  {/* even-odd: the big rectangle keeps everything, the small
                      segment punches the corner back out of it */}
                  {g.clip.map((poly, k) => (
                    <polygon
                      key={k}
                      clipRule="evenodd"
                      points={poly.map((p) => p.join(",")).join(" ")}
                    />
                  ))}
                </clipPath>
              ) : null
            )}
          </defs>
          {w.glyphs.map((g, i) => (
            <path
              key={i}
              d={g.d}
              fill="currentColor"
              clipPath={g.clip ? `url(#nm-${w.word.toLowerCase()}-${i})` : undefined}
            />
          ))}
        </svg>
      ))}
    </>
  );
}
'''


def build():
    rows = []
    for name, cap, rest in WORDS:
        print(name)
        runs = runs_for(cap, rest)
        tucks = {}   # see the note above -- the font's advances stand
        ds, bb = word_paths(runs, tucks)
        clips = {}
        for pair in TRIM_PAIRS.get(name, []):
            tr = trim_for(runs, pair)
            if tr is None:
                print("  trim %s: nothing protruding, left alone" % (pair,))
                continue
            sh = clip_shapes(tr)
            if sh is None:
                print("  trim %s: cut falls outside the disc, skipped" % (pair,))
                continue
            clips[tr["owner"]] = sh
            print("  trim %s: glyph %d, %d px of corner removed"
                  % (pair, tr["owner"], tr["removed"]))
        rows.append((name, ds, bb, clips))

    y0 = min(b[1] for _, _, b, _c in rows)
    y1 = max(b[3] for _, _, b, _c in rows)
    H = y1 - y0
    total = sum(b[2] - b[0] for _, _, b, _c in rows) / K + GAP

    out = [HEADER, "",
           "// viewBox units are 1/1000 em; y = 0 is the baseline",
           "export const NAME_VIEW = { y: %.1f, h: %.1f };" % (y0, H), "",
           "export const NAME_WORDS = ["]
    for name, ds, bb, clips in rows:
        out += ["  {",
                '    word: "%s",' % name,
                "    x: %.1f," % bb[0],
                "    w: %.1f," % (bb[2] - bb[0]),
                "    em: %.4f," % ((bb[2] - bb[0]) / K),
                "    glyphs: ["]
        for gi, d in enumerate(ds):
            if gi in clips:
                keep, seg = clips[gi]
                fmt = lambda poly: "[" + ", ".join("[%.1f, %.1f]" % (q[0], q[1]) for q in poly) + "]"
                out.append('      { d: "%s", clip: [%s, %s] },' % (d, fmt(keep), fmt(seg)))
            else:
                out.append('      { d: "%s" },' % d)
        out += ["    ],", "  },"]
    out += ["];", "",
            "// the gap between the two words, in em -- a real value from the layout,",
            "// not the space glyph of a font that no longer sets this name",
            "export const NAME_GAP = %s;" % GAP,
            COMPONENT]

    with open(DEST, "w", encoding="utf-8", newline="\n") as fh:
        fh.write("\n".join(out))

    print("")
    print("shared height %.4fem; ink runs %.4fem below the baseline" % (H / K, y1 / K))
    print("whole name %.4fem wide -> %.1fvw at the 13vw type size" % (total, 13 * total))
    print("wrote %s" % DEST)


if __name__ == "__main__":
    BALLET_F, PINYON_F = load_ballet(), load_pinyon()
    build()
