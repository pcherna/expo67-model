"""Detect drawn tree crowns on the warped souvenir map and export tree positions.

Crowns are darker, more saturated green than the lawns: G dominant, luminance below LUM_MAX.
Positions are Poisson-disk-ish samples (grid jitter + min spacing) inside the crown mask.
Output: web/public/data/trees.json  {"spacing": m, "trees": [[x, y, s], ...]}  (s = size factor 0.7-1.3)
Usage: .venv/bin/python tools/export_trees.py
"""
import json

import numpy as np
from PIL import Image
from scipy import ndimage
from shapely import contains_xy
from shapely.geometry import Point, Polygon
from shapely.ops import unary_union

from common import DATA, ROOT

Image.MAX_IMAGE_PIXELS = None
SPACING = 8.0  # m between trees
LUM_MAX = 138
MIN_PATCH_M2 = 30
DENSITY_SIGMA_M = 3.0  # m
DENSITY_MIN = 0.14  # fraction of crown-ink pixels nearby


def main():
    rng = np.random.default_rng(67)
    trees = []
    for panel in ("islands", "havre"):
        meta = json.loads((ROOT / "web" / "public" / "georef" / f"{panel}.json").read_text())
        a = np.asarray(Image.open(DATA / "georef" / f"{panel}_warped.png").convert("RGBA")).astype(np.int16)
        mpp = (meta["xmax"] - meta["xmin"]) / a.shape[1]
        r, g, b, al = a[..., 0], a[..., 1], a[..., 2], a[..., 3]
        lum = (r + g + b) / 3
        crown = (al > 0) & (g > r + 4) & (g > b + 25) & (lum < LUM_MAX) & (lum > 55)
        # The mask catches crown outlines and shading, not whole crowns: turn it into a wooded-density map.
        density = ndimage.gaussian_filter(crown.astype(np.float32), sigma=DENSITY_SIGMA_M / mpp)
        crown = density > DENSITY_MIN
        lab, n = ndimage.label(crown)
        sizes = ndimage.sum(crown, lab, range(1, n + 1)) * mpp * mpp
        keep = np.zeros(n + 1, bool)
        keep[1:] = sizes >= MIN_PATCH_M2
        crown = keep[lab]
        # jittered grid, then keep samples on crown pixels
        step = SPACING / mpp
        jj, ii = np.mgrid[step / 2:a.shape[0]:step, step / 2:a.shape[1]:step]
        jj = jj + rng.uniform(-0.35, 0.35, jj.shape) * step
        ii = ii + rng.uniform(-0.35, 0.35, ii.shape) * step
        jj = np.clip(jj.astype(int), 0, a.shape[0] - 1)
        ii = np.clip(ii.astype(int), 0, a.shape[1] - 1)
        on = crown[jj, ii]
        xs = meta["xmin"] + ii[on] * mpp
        ys = meta["ymax"] - jj[on] * mpp
        sz = rng.uniform(0.7, 1.3, len(xs))
        trees += [[round(float(x), 1), round(float(y), 1), round(float(s), 2)] for x, y, s in zip(xs, ys, sz)]
        print(f"[{panel}] crown cover {crown.mean() * 100:.1f}% of panel window, {on.sum()} trees")
    # drop trees inside modelled buildings (generic footprints + dedicated pavilions, buffered)
    pub = ROOT / "web" / "public" / "data"
    shapes = [Polygon(b["footprint"]).buffer(3) for b in json.loads((pub / "generic.json").read_text())]
    for p in json.loads((pub / "pavilions.json").read_text()):
        shapes.append(Polygon(p["footprint"]).buffer(3) if p.get("footprint") else Point(p["x"], p["y"]).buffer(p.get("fit_radius", 40)))
    blocked = unary_union(shapes)
    t = np.array(trees)
    inside = contains_xy(blocked, t[:, 0], t[:, 1])
    trees = t[~inside].tolist()
    print(f"removed {inside.sum()} trees inside buildings")
    (ROOT / "web" / "public" / "data" / "trees.json").write_text(json.dumps({"spacing": SPACING, "trees": trees}))
    print(f"{len(trees)} trees -> web/public/data/trees.json")


if __name__ == "__main__":
    main()
