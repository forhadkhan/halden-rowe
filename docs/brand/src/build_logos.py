"""Halden & Rowe logo options: generator for every candidate SVG (Picasso, 2026-10-07).

Run from the project root:
  uv run --no-project --with skia-pathops python docs/brand/src/build_logos.py

Writes docs/brand/options/<option>/{wordmark,monogram,favicon}.svg and docs/brand/logo-options.html.
Every glyph is built from rectangles, polygons, circles and stroked centre lines, merged with real
booleans (skia-pathops) into one filled path per glyph. No font is used anywhere.

Frame shared by all options (matches the live files so no consumer layout changes):
  wordmark  viewBox -3 0 463 48, cap line y=4, baseline y=44
  monogram  viewBox 0 0 48 48
  favicon   viewBox 0 0 32 32 on the ink tile (#1A1E1D, rx 7), mark in mist (#ECE8DF)
"""

from __future__ import annotations

import math
from pathlib import Path as FsPath

import pathops

ROOT = FsPath(__file__).resolve().parents[3]
OUT = ROOT / "docs" / "brand" / "options"
K = 0.5523  # quarter-circle cubic handle ratio

CAP, BASE = 4.0, 44.0
WM_X0, WM_X1 = 0.0, 457.0  # wordmark ink spans this inside viewBox -3..460


# ----------------------------------------------------------------------------- primitives
def rect(x0, y0, x1, y1):
    p = pathops.Path()
    p.moveTo(x0, y0)
    p.lineTo(x1, y0)
    p.lineTo(x1, y1)
    p.lineTo(x0, y1)
    p.close()
    return p


def poly(points):
    p = pathops.Path()
    p.moveTo(*points[0])
    for pt in points[1:]:
        p.lineTo(*pt)
    p.close()
    return p


def ellipse(cx, cy, rx, ry):
    p = pathops.Path()
    p.moveTo(cx + rx, cy)
    p.cubicTo(cx + rx, cy + K * ry, cx + K * rx, cy + ry, cx, cy + ry)
    p.cubicTo(cx - K * rx, cy + ry, cx - rx, cy + K * ry, cx - rx, cy)
    p.cubicTo(cx - rx, cy - K * ry, cx - K * rx, cy - ry, cx, cy - ry)
    p.cubicTo(cx + K * rx, cy - ry, cx + rx, cy - K * ry, cx + rx, cy)
    p.close()
    return p


def ring(cx, cy, rx, ry, tx, ty=None):
    """Elliptical ring: outer radii rx/ry, side thickness tx, top/bottom thickness ty."""
    ty = tx if ty is None else ty
    return op(ellipse(cx, cy, rx, ry), ellipse(cx, cy, rx - tx, ry - ty), "diff")


def arc_into(p, cx, cy, r, a0, a1, move=True):
    """Append a circular arc (degrees, SVG y-down) as cubic segments of at most 90 degrees."""
    n = max(1, math.ceil(abs(a1 - a0) / 90 - 1e-9))
    step = (a1 - a0) / n
    for i in range(n):
        t0 = math.radians(a0 + i * step)
        t1 = math.radians(a0 + (i + 1) * step)
        h = 4 / 3 * math.tan((t1 - t0) / 4)
        x0, y0 = cx + r * math.cos(t0), cy + r * math.sin(t0)
        x3, y3 = cx + r * math.cos(t1), cy + r * math.sin(t1)
        if move and i == 0:
            p.moveTo(x0, y0)
        p.cubicTo(
            x0 - h * r * math.sin(t0), y0 + h * r * math.cos(t0),
            x3 + h * r * math.sin(t1), y3 - h * r * math.cos(t1),
            x3, y3,
        )
    return p


def stroked(build, width, cap="butt", join="miter"):
    """Outline an open centre line. `build(path)` draws the centre line."""
    p = pathops.Path()
    build(p)
    caps = {"butt": pathops.LineCap.BUTT_CAP, "round": pathops.LineCap.ROUND_CAP,
            "square": pathops.LineCap.SQUARE_CAP}
    joins = {"miter": pathops.LineJoin.MITER_JOIN, "round": pathops.LineJoin.ROUND_JOIN}
    p.stroke(width, caps[cap], joins[join], 10)
    p.convertConicsToQuads()
    return p


def line(points, width, cap="butt", join="miter"):
    def build(p):
        p.moveTo(*points[0])
        for pt in points[1:]:
            p.lineTo(*pt)
    return stroked(build, width, cap, join)


def arc(cx, cy, r, a0, a1, width, cap="butt"):
    return stroked(lambda p: arc_into(p, cx, cy, r, a0, a1), width, cap)


def op(a, b, kind):
    kinds = {"union": pathops.PathOp.UNION, "diff": pathops.PathOp.DIFFERENCE,
             "inter": pathops.PathOp.INTERSECTION}
    return pathops.op(a, b, kinds[kind], fix_winding=True)


def union(*paths):
    out = paths[0]
    for p in paths[1:]:
        out = op(out, p, "union")
    return out


def band(p, y0=CAP, y1=BASE, x0=-50, x1=500):
    """Clip to the cap band: flat tops and feet on diagonals."""
    return op(p, rect(x0, y0, x1, y1), "inter")


def moved(p, dx=0.0, dy=0.0, s=1.0, ox=0.0, oy=0.0):
    """Scale about (ox, oy) then translate; returns a new path."""
    out = pathops.Path()
    pen = _XformPen(out, dx, dy, s, ox, oy)
    p.draw(pen)
    return out


def _split_quads(pts):
    """Pen-protocol qCurveTo (off-curve points with implied on-curve midpoints) to single quads."""
    offs, end = list(pts[:-1]), pts[-1]
    out = []
    for i, c in enumerate(offs):
        if i < len(offs) - 1:
            nxt = offs[i + 1]
            out.append((c, ((c[0] + nxt[0]) / 2, (c[1] + nxt[1]) / 2)))
        else:
            out.append((c, end))
    return out


class _XformPen:
    def __init__(self, target, dx, dy, s, ox, oy):
        self.t, self.dx, self.dy, self.s, self.ox, self.oy = target, dx, dy, s, ox, oy

    def _f(self, pt):
        return ((pt[0] - self.ox) * self.s + self.ox + self.dx, (pt[1] - self.oy) * self.s + self.oy + self.dy)

    def moveTo(self, pt):
        self.t.moveTo(*self._f(pt))

    def lineTo(self, pt):
        self.t.lineTo(*self._f(pt))

    def curveTo(self, *pts):
        flat = [c for pt in pts for c in self._f(pt)]
        self.t.cubicTo(*flat)

    def qCurveTo(self, *pts):
        for ctrl, end in _split_quads(pts):
            self.t.quadTo(*self._f(ctrl), *self._f(end))

    def closePath(self):
        self.t.close()

    def endPath(self):
        pass


class _DPen:
    def __init__(self):
        self.parts = []

    @staticmethod
    def _n(v):
        s = f"{v:.2f}".rstrip("0").rstrip(".")
        return "0" if s in ("-0", "") else s

    def _pt(self, pt):
        return f"{self._n(pt[0])} {self._n(pt[1])}"

    def moveTo(self, pt):
        self.parts.append("M" + self._pt(pt))

    def lineTo(self, pt):
        self.parts.append("L" + self._pt(pt))

    def curveTo(self, *pts):
        self.parts.append("C" + " ".join(self._pt(p) for p in pts))

    def qCurveTo(self, *pts):
        for ctrl, end in _split_quads(pts):
            self.parts.append(f"Q{self._pt(ctrl)} {self._pt(end)}")

    def closePath(self):
        self.parts.append("Z")

    def endPath(self):
        pass


def d_of(p):
    p = pathops.Path(p)
    p.simplify(fix_winding=True)
    pen = _DPen()
    p.draw(pen)
    return "".join(pen.parts)


def bounds(p):
    return p.bounds  # (xmin, ymin, xmax, ymax)


# ----------------------------------------------------------------------------- shared ampersand
def ampersand_skeleton(p, w=26.0, top=CAP, bot=BASE):
    """Centre line of a geometric ampersand: upper loop, crossing diagonal, round lower bowl, tail."""
    sw = 5.0  # stroke the caller uses; keeps the bowl on the baseline
    lr = 5.6  # upper loop radius
    lcx, lcy = w * 0.46, top + lr + sw / 2
    br = 9.2  # lower bowl radius
    bcx, bcy = w * 0.40, bot - br - sw / 2
    c45 = math.cos(math.radians(45))
    # the leg: from the foot, bottom right, straight up to the loop's lower left
    p.moveTo(w, bot - sw / 2)
    p.lineTo(lcx - lr * c45, lcy + lr * c45)
    # round the loop over the top to its lower right
    arc_into(p, lcx, lcy, lr, 135, 405, move=False)
    # straight down-left into the bowl, crossing the leg
    p.lineTo(bcx + br * math.cos(math.radians(225)), bcy + br * math.sin(math.radians(225)))
    # round the bowl: left, bottom, right, then the tail rises to the right
    for a0, a1 in ((225, 180), (180, 90), (90, 0), (0, -35)):
        arc_into(p, bcx, bcy, br, a0, a1, move=False)
    p.lineTo(w + 1.0, top + (bot - top) * 0.42)


# ----------------------------------------------------------------------------- option A: Swing
class Swing:
    """Plan line weights: walls heavy, the door swing light. The R carries the door swing."""

    key, name = "a-swing", "A. Swing"
    S, M, L = 6.4, 4.4, 2.8  # wall stem, door leaf, swing arc

    def H(self, x):
        S, M, L = self.S, self.M, self.L
        w, cy = 30.0, 23.0
        parts = [rect(0, CAP, S, BASE), rect(w - S, CAP, w, BASE), rect(S, cy - M / 2, w - S, cy + M / 2)]
        return moved(union(*parts), x), w

    def R(self, x, S=None, M=None, L=None, top=CAP, bot=BASE):
        """The R's bowl is a plan door swing: the leaf (bar) hinged on the stem, its quarter arc to the cap line."""
        S = self.S if S is None else S
        M = self.M if M is None else M
        L = self.L if L is None else L
        cy = top + (bot - top) * 0.5
        r = cy - top - L / 2
        parts = [rect(0, top, S, bot), rect(S - 0.01, cy - M / 2, S + r + L / 2, cy + M / 2),
                 arc(S, cy, r, -90, 0, L)]
        leg = band(line([(S + r * 0.42, cy - 6), (S + r + 3.2 * (bot - top) / 40, bot + 6)], S), cy, bot)
        parts.append(leg)
        g = union(*parts)
        return moved(g, x), bounds(g)[2]

    def A(self, x):
        S, M = self.S, self.M
        w = 33.0
        g = band(line([(S * 0.55, BASE + 8), (w / 2, CAP - 9), (w - S * 0.55, BASE + 8)], S))
        g = union(g, rect(7, 30, w - 7, 30 + M))
        g = op(g, rect(-5, CAP, w + 5, BASE), "inter")
        return moved(g, x), w

    def L_(self, x):
        S = self.S
        w = 22.0
        return moved(union(rect(0, CAP, S, BASE), rect(0, BASE - S * 0.92, w, BASE)), x), w

    def E(self, x):
        S = self.S
        w, a = 22.0, S * 0.9
        g = union(rect(0, CAP, S, BASE), rect(0, CAP, w, CAP + a), rect(0, 23.2 - a / 2, w - 3, 23.2 + a / 2),
                  rect(0, BASE - a, w, BASE))
        return moved(g, x), w

    def D(self, x):
        S = self.S
        w, R = 32.0, 20.0
        a = S * 0.92
        outer = op(union(rect(0, CAP, w - R, BASE), ellipse(w - R, 24, R, R)), rect(0, CAP, w + 1, BASE), "inter")
        inner = op(union(rect(S, CAP + a, w - R, BASE - a), ellipse(w - R, 24, R - S, R - a)), rect(S, 0, w, 48),
                   "inter")
        return moved(op(outer, inner, "diff"), x), w

    def N(self, x):
        S = self.S
        w = 31.0
        g = union(rect(0, CAP, S, BASE), rect(w - S, CAP, w, BASE),
                  band(line([(S * 0.5, CAP - 4), (w - S * 0.5, BASE + 4)], S * 1.05)))
        return moved(g, x), w

    def O(self, x):
        S = self.S
        R = 20.6
        return moved(ring(R, 24, R, R, S * 1.05, S * 0.95), x), 2 * R

    def W(self, x):
        S = self.S
        w = 47.0
        g = band(line([(2.4, CAP - 10), (12.6, BASE + 10), (23.5, CAP + 2), (34.4, BASE + 10), (44.6, CAP - 10)],
                      S * 0.95), CAP, BASE, -1, w + 1)
        g = op(g, rect(0, CAP, w, BASE), "inter")
        return moved(g, x), w

    def amp(self, x):
        w = 27.0
        g = stroked(lambda p: ampersand_skeleton(p, w, CAP + 4, BASE), 5.0, cap="butt", join="round")
        g = op(g, rect(-3, 0, w, BASE), "inter")
        return moved(g, x), w

    def wordmark_glyphs(self):
        return ["H", "A", "L_", "D", "E", "N", " ", "amp", " ", "R", "O", "W", "E"]

    def monogram(self):
        # H and the door-swing R side by side on the 48 grid, heavier light strokes for small sizes
        h, hw = self.H(0)
        r, rw = self.R(0, L=3.6, M=5.0)
        gap = 4.0
        total = hw + gap + rw
        s = 42 / total
        g = union(h, moved(r, hw + gap))
        return moved(g, (48 - total * s) / 2, 0, s, 0, 24)

    def favicon(self):
        # The door-swing R alone, drawn on the 32 grid with heavier strokes
        g, w = self.R(0, S=6.0, M=4.0, L=3.0, top=5.0, bot=27.0)
        return moved(g, round((32 - w) / 2))


# ----------------------------------------------------------------------------- option B: Et
class Et:
    """High-contrast drawn capitals; the ampersand is the old 'Et' ligature, the mark of the partnership."""

    key, name = "b-et", "B. Et"
    V, T = 6.8, 2.6  # thick, thin (thin holds 0.75 px at the 14 px header)

    def H(self, x):
        V, T = self.V, self.T
        w = 30.0
        return moved(union(rect(0, CAP, V, BASE), rect(w - V, CAP, w, BASE), rect(V, 22.6, w - V, 22.6 + T)), x), w

    def A(self, x):
        V, T = self.V, self.T
        w = 34.0
        apex = (w / 2 + 1.0, CAP - 8)
        left = band(line([(T * 0.6, BASE + 8), apex], T * 1.15))
        right = band(line([apex, (w - V * 0.55, BASE + 8)], V))
        g = union(left, right, rect(7, 30.5, w - 7, 30.5 + T))
        g = op(g, rect(-1, CAP, w + 1, BASE), "inter")
        return moved(g, x), w

    def L_(self, x):
        w = 21.0
        return moved(union(rect(0, CAP, self.V, BASE), rect(0, BASE - self.T * 1.2, w, BASE)), x), w

    def E(self, x):
        V, T = self.V, self.T
        w = 21.0
        g = union(rect(0, CAP, V, BASE), rect(0, CAP, w, CAP + T * 1.2), rect(0, 22.6, w - 3.5, 22.6 + T),
                  rect(0, BASE - T * 1.2, w, BASE))
        return moved(g, x), w

    def D(self, x):
        V, T = self.V, self.T
        w, R = 33.0, 20.0
        outer = op(union(rect(0, CAP, w - R, BASE), ellipse(w - R, 24, R, R)), rect(0, CAP, w + 1, BASE), "inter")
        inner = op(union(rect(V, CAP + T * 1.2, w - R, BASE - T * 1.2), ellipse(w - R, 24, R - V, R - T * 1.2)),
                   rect(V, 0, w, 48), "inter")
        return moved(op(outer, inner, "diff"), x), w

    def N(self, x):
        V, T = self.V, self.T
        w = 31.0
        g = union(rect(0, CAP, T * 1.2, BASE), rect(w - T * 1.2, CAP, w, BASE),
                  band(line([(V * 0.35, CAP - 5), (w - V * 0.35, BASE + 5)], V)))
        return moved(g, x), w

    def O(self, x):
        R = 20.6
        return moved(ring(R, 24, R, R, self.V * 1.05, self.T * 1.2), x), 2 * R

    def W(self, x):
        V, T = self.V, self.T
        w = 50.0
        a = band(line([(2.6, CAP - 10), (14.0, BASE + 10)], V))
        b = band(line([(12.5, BASE + 10), (25.0, CAP - 10)], T * 1.15))
        c = band(line([(25.0, CAP - 10), (37.5, BASE + 10)], V))
        e = band(line([(36.0, BASE + 10), (47.4, CAP - 10)], T * 1.15))
        g = op(union(a, b, c, e), rect(0, CAP, w, BASE), "inter")
        return moved(g, x), w

    def R(self, x):
        V, T = self.V, self.T
        w = 30.0
        bw, cy = 10.0, 25.0  # straight part of bowl, bowl bottom line
        ry = (cy - CAP) / 2
        outer = union(rect(0, CAP, bw, cy), ellipse(bw, CAP + ry, 13.0, ry))
        outer = op(outer, rect(0, CAP, 100, cy), "inter")
        inner = union(rect(V, CAP + T * 1.2, bw, cy - T), ellipse(bw, CAP + ry, 13.0 - V * 0.95, ry - T * 1.1))
        inner = op(inner, rect(V, 0, 100, 48), "inter")
        bowl = op(outer, inner, "diff")
        leg = band(line([(bw - 1, cy - 8), (w - 2.4, BASE + 10)], V), cy - T, BASE)
        g = union(rect(0, CAP, V, BASE), bowl, leg)
        g = op(g, rect(0, CAP, w, BASE), "inter")
        return moved(g, x), w

    def et(self, x, V=None, T=None):
        """E and t share one bar: the E's middle arm runs on as the t's crossbar."""
        V = self.V if V is None else V
        T = self.T if T is None else T
        arm = 13.0
        tx = arm + 4.0  # t stem left
        w = tx + V + 9.0
        bar_y = 18.6
        fr = V + 4.0  # t foot bend radius
        g = union(
            rect(0, CAP, V, BASE),                      # E stem
            rect(0, CAP, arm, CAP + T * 1.2),           # E top arm
            rect(0, BASE - T * 1.2, arm, BASE),         # E bottom arm
            rect(0, bar_y, w, bar_y + T * 1.15),        # shared bar: E middle arm = t crossbar
            # t stem, its top cut on a steep oblique, after the draughtsman's dimension tick
            poly([(tx, 8.0 + V * 0.7), (tx + V, 8.0), (tx + V, BASE - fr + 0.01), (tx, BASE - fr + 0.01)]),
            _quarter_foot(tx, V, T, BASE, fr, w),       # t foot turns right into the baseline
        )
        return moved(g, x), w

    def wordmark_glyphs(self):
        return ["H", "A", "L_", "D", "E", "N", " ", "et", " ", "R", "O", "W", "E"]

    def monogram(self):
        g, w = self.et(0, V=7.2, T=2.6)
        s = 0.95
        return moved(g, (48 - w * s) / 2, 0, s, 0, 24)

    def favicon(self):
        g, w = self.et(0, V=7.6, T=4.0)
        s = 0.56
        return moved(g, (32 - w * s) / 2, 16 - 24, s, 0, 24)


def _quarter_foot(tx, V, T, base, fr, w):
    """The t's foot: thick stem bends through a quarter round into a thin baseline stroke."""
    cx, cy = tx + fr, base - fr  # centre of the bend; outer edge meets the stem's left edge and the baseline
    # quarter ring, bottom-left quadrant: thick (V) on the left, thin (1.2 T) at the bottom
    q = ring(cx, cy, fr, fr, V, T * 1.2)
    q = op(q, rect(cx - fr - 1, cy, cx, base + 1), "inter")
    tail = rect(cx - 0.01, base - T * 1.2, w, base)
    return union(q, tail)


# ----------------------------------------------------------------------------- option C: Hinge
class Hinge:
    """Lowercase geometric wordmark; the ampersand is a hinge: two leaves on one pin."""

    key, name = "c-hinge", "C. Hinge"
    s = 5.6
    XH = 17.0  # x-height line

    def _bowl(self, x0, w):
        r = (BASE - self.XH) / 2
        return ring(x0 + r, self.XH + r, r + 0.3, r + 0.3, self.s, self.s * 0.92)

    def h(self, x, asc=True):
        s = self.s
        w = 26.0
        r = w / 2
        cy = self.XH + r
        arch = op(ring(r, cy, r, r, s, s * 0.92), rect(-1, 0, w + 1, cy), "inter")
        g = union(rect(0, CAP if asc else self.XH, s, BASE), arch, rect(w - s, cy - 0.01, w, BASE))
        return moved(g, x), w

    def n(self, x):
        return self.h(x, asc=False)

    def a(self, x):
        w = 27.6
        return moved(union(self._bowl(0, w), rect(w - self.s, self.XH, w, BASE)), x), w

    def d(self, x):
        w = 27.6
        return moved(union(self._bowl(0, w), rect(w - self.s, CAP, w, BASE)), x), w

    def o(self, x):
        r = (BASE - self.XH) / 2 + 0.3
        return moved(self._bowl(0, 0), x), 2 * r - 0.3

    def l(self, x):
        return moved(rect(0, CAP, self.s, BASE), x), self.s

    def e(self, x):
        s = self.s
        r = (BASE - self.XH) / 2 + 0.3
        cx, cy = r - 0.3, self.XH + r - 0.3
        g = self._bowl(0, 0)
        # aperture: open the lower right between the bar and about 40 degrees
        cut = poly([(cx, cy + s * 0.45), (cx + 40, cy + s * 0.45), (cx + 40, cy + 40 * math.tan(math.radians(38)))])
        g = op(g, cut, "diff")
        g = union(g, rect(cx - r + s * 0.5, cy - s * 0.45, cx + r, cy + s * 0.45))
        return moved(g, x), 2 * r - 0.3

    def r(self, x):
        s = self.s
        rr = (BASE - self.XH) / 2
        cx, cy = rr, self.XH + rr
        shoulder = op(ring(cx, cy, rr, rr, s, s * 0.92),
                      poly([(cx, cy), (-5, cy), (-5, self.XH - 5), (cx + 40 * math.cos(math.radians(-58)),
                                                                     cy + 40 * math.sin(math.radians(-58)))]),
                      "inter")
        g = union(rect(0, self.XH, s, BASE), shoulder)
        return moved(g, x), bounds(g)[2]

    def w(self, x):
        s = self.s
        w = 36.0
        g = band(line([(1.8, self.XH - 8), (10.2, BASE + 8), (18.0, self.XH + 1), (25.8, BASE + 8), (34.2, self.XH - 8)],
                      s), self.XH, BASE, -1, w + 1)
        g = op(g, rect(0, self.XH, w, BASE), "inter")
        return moved(g, x), w

    def hinge(self, x, top=CAP, bot=BASE, leaf=7.4, pin=6.0, gap=1.6, knuckles=5, holes=True):
        """Two leaves and a barrel of alternating knuckles. Left owns 1,3,5; right owns 2,4."""
        w = leaf * 2 + pin
        h = bot - top
        kh = (h - gap * (knuckles - 1)) / knuckles
        lx0, lx1 = 0.0, leaf - gap / 2
        rx0, rx1 = leaf + pin + gap / 2, w
        left = rect(lx0, top, lx1, bot)
        right = rect(rx0, top, rx1, bot)
        for i in range(knuckles):
            y0 = top + i * (kh + gap)
            y1 = y0 + kh
            if i % 2 == 0:
                left = union(left, rect(lx1 - 0.01, y0, leaf + pin - gap / 2 + 0.6, y1))
            else:
                right = union(right, rect(leaf + gap / 2 - 0.6, y0, rx0 + 0.01, y1))
        g = union(left, right)
        if holes:
            hr = leaf * 0.2
            for yy in (top + h * 0.26, bot - h * 0.26):
                g = op(g, ellipse(lx1 / 2, yy, hr, hr), "diff")
                g = op(g, ellipse((rx0 + rx1) / 2, yy, hr, hr), "diff")
        return moved(g, x), w

    def amp(self, x):
        return self.hinge(x, top=CAP, bot=BASE, leaf=6.5, pin=6.0, gap=2.0, knuckles=3, holes=False)

    def wordmark_glyphs(self):
        return ["h", "a", "l", "d", "e", "n", " ", "amp", " ", "r", "o", "w", "e"]

    def monogram(self):
        g, w = self.hinge(0, top=7, bot=41, leaf=9.0, pin=8.0, gap=2.0, knuckles=5, holes=True)
        return moved(g, (48 - w) / 2)

    def favicon(self):
        g, w = self.hinge(0, top=5, bot=27, leaf=6.0, pin=6.0, gap=2.0, knuckles=3, holes=False)
        return moved(g, (32 - w) / 2)


# ----------------------------------------------------------------------------- layout and files
def build_wordmark(opt):
    names = opt.wordmark_glyphs()
    glyphs, widths = [], []
    for n in names:
        if n == " ":
            glyphs.append(None)
            widths.append(0.0)
            continue
        g, w = getattr(opt, n)(0)
        glyphs.append(g)
        widths.append(w)
    letters = sum(widths)
    n_gaps = len(names) - 1
    # a word space counts as two letter gaps on each side of the ampersand
    units = n_gaps + 2
    track = (WM_X1 - WM_X0 - letters) / units
    paths, x = [], WM_X0
    for n, g, w in zip(names, glyphs, widths):
        if g is None:
            x += track * 2
            continue
        paths.append(d_of(moved(g, x)))
        x += w + track
    return paths, track


def svg_wordmark(opt, paths, note):
    body = "\n".join(f'  <path d="{d}"/>' for d in paths)
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="-3 0 463 48" width="463" height="48" role="img" aria-labelledby="hr-wordmark-title">
  <title id="hr-wordmark-title">Halden &amp; Rowe</title>
  <!-- {note} -->
<g fill="currentColor">
{body}
</g>
</svg>
'''


def svg_monogram(d, note):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48" width="48" height="48" role="img" aria-labelledby="hr-monogram-title">
  <title id="hr-monogram-title">Halden &amp; Rowe</title>
  <!-- {note} -->
  <path fill="currentColor" d="{d}"/>
</svg>
'''


def svg_favicon(d, note):
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="32" height="32">
  <!-- {note} -->
  <rect width="32" height="32" rx="7" fill="#1A1E1D"/>
  <path fill="#ECE8DF" d="{d}"/>
</svg>
'''


NOTES = {
    "a-swing": ("Halden & Rowe wordmark, option A Swing (Picasso, 2026-10-07). Drawn capitals in plan line weights: "
                "heavy walls; the R's bowl is a light floor-plan door swing. One path per letter (footer M24). "
                "Generated by docs/brand/src/build_logos.py. Single colour via currentColor. Min width 120 CSS px.",
                "Halden & Rowe monogram, option A Swing: H and the door-swing R. "
                "Generated by docs/brand/src/build_logos.py. Single colour via currentColor. Min size 24 CSS px.",
                "Halden & Rowe favicon, option A Swing: the door-swing R, mist on the ink tile. "
                "Generated by docs/brand/src/build_logos.py."),
    "b-et": ("Halden & Rowe wordmark, option B Et (Picasso, 2026-10-07). High-contrast drawn capitals; the "
             "ampersand is the Et ligature, the E's middle arm running on as the t's crossbar. One path per glyph. "
             "Generated by docs/brand/src/build_logos.py. Single colour via currentColor. Min width 120 CSS px.",
             "Halden & Rowe monogram, option B Et: the Et ampersand alone. "
             "Generated by docs/brand/src/build_logos.py. Single colour via currentColor. Min size 24 CSS px.",
             "Halden & Rowe favicon, option B Et: heavier Et, mist on the ink tile. "
             "Generated by docs/brand/src/build_logos.py."),
    "c-hinge": ("Halden & Rowe wordmark, option C Hinge (Picasso, 2026-10-07). Geometric lowercase; the ampersand "
                "is a hinge, two leaves on one pin. One path per glyph. Generated by docs/brand/src/build_logos.py. "
                "Single colour via currentColor. Min width 120 CSS px.",
                "Halden & Rowe monogram, option C Hinge: the hinge, two leaves on one pin. "
                "Generated by docs/brand/src/build_logos.py. Single colour via currentColor. Min size 24 CSS px.",
                "Halden & Rowe favicon, option C Hinge: three-knuckle hinge, mist on the ink tile. "
                "Generated by docs/brand/src/build_logos.py."),
}


def main():
    results = {}
    for opt in (Swing(), Et(), Hinge()):
        folder = OUT / opt.key
        folder.mkdir(parents=True, exist_ok=True)
        wn, mn, fn = NOTES[opt.key]
        paths, track = build_wordmark(opt)
        (folder / "wordmark.svg").write_text(svg_wordmark(opt, paths, wn))
        (folder / "monogram.svg").write_text(svg_monogram(d_of(opt.monogram()), mn))
        (folder / "favicon.svg").write_text(svg_favicon(d_of(opt.favicon()), fn))
        results[opt.key] = (opt.name, track)
        print(f"{opt.key}: tracking {track:.2f} units, {len(paths)} glyph paths")
    return results


if __name__ == "__main__":
    main()
