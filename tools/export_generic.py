"""Resolve data/pavilions/generic.json into web/public/data/generic.json (local metres).

Per building: footprint polygon, height, roof colour sampled from the souvenir map, kind
(box | tent | pyramid | cone | hexpyramid) and kind-specific extras (tent masts).
Usage: .venv/bin/python tools/export_generic.py
"""
import json
import math

import numpy as np
from PIL import Image, ImageDraw
from shapely.geometry import Point, Polygon

import georef
from common import DATA, ROOT

Image.MAX_IMAGE_PIXELS = None
HEIGHT_CLASSES = [(400, 6.0), (1500, 9.0), (4000, 12.0), (float("inf"), 15.0)]  # footprint m² -> height m (generic)
CLASH_M = 25  # warn if a generic footprint centre is this close to a dedicated pavilion


def footprint_px(b):
    if "rect" in b:
        x0, y0, x1, y1 = b["rect"]
        return [(x0, y0), (x1, y0), (x1, y1), (x0, y1)]
    if "poly" in b:
        return [tuple(p) for p in b["poly"]]
    cx, cy, r = b["circle"]
    return [(cx + r * math.cos(t), cy + r * math.sin(t)) for t in np.linspace(0, 2 * math.pi, 33)[:-1]]


def roof_colour(src, poly_px):
    """Median map colour inside the footprint, ignoring ink lines, water and pale paving."""
    xs = [p[0] for p in poly_px]
    ys = [p[1] for p in poly_px]
    x0, y0, x1, y1 = int(min(xs)), int(min(ys)), int(max(xs)) + 1, int(max(ys)) + 1
    crop = np.asarray(src.crop((x0, y0, x1, y1))).reshape(-1, 3).astype(int)
    m = Image.new("L", (x1 - x0, y1 - y0), 0)
    ImageDraw.Draw(m).polygon([(x - x0, y - y0) for x, y in poly_px], fill=255)
    inside = np.asarray(m).ravel() > 0
    px = crop[inside]
    lum = px.mean(axis=1)
    water = np.abs(px - georef.WATER_RGB).max(axis=1) < 28
    keep = (lum > 70) & (lum < 235) & ~water
    if keep.sum() < 10:
        keep = np.ones(len(px), bool)
    c = np.median(px[keep], axis=0)
    return "#%02x%02x%02x" % tuple(int(v) for v in c)


def height_for(area, b):
    if "h" in b:
        return float(b["h"])
    return next(h for a, h in HEIGHT_CLASSES if area < a)


def main():
    spec = json.loads((DATA / "pavilions" / "generic.json").read_text())
    feats = {f["properties"]["osm"]: f for f in json.loads((DATA / "osm" / "reference.geojson").read_text())["features"]}
    dedicated = json.loads((ROOT / "web" / "public" / "data" / "pavilions.json").read_text())
    tr, xf = georef.load()
    src = Image.open(ROOT / tr["source"]).convert("RGB")
    out = []

    def clash(poly, name):
        c = poly.centroid
        for d in dedicated:
            if math.hypot(c.x - d["x"], c.y - d["y"]) < CLASH_M:
                print(f"  ! {name} centre is {math.hypot(c.x - d['x'], c.y - d['y']):.0f} m from dedicated '{d['id']}'")

    for b in spec["buildings"]:
        T = xf[b["panel"]]
        ppx = footprint_px(b)
        loc = T.px_to_local(ppx)
        poly = Polygon(loc)
        if not poly.is_valid or poly.area < 20:
            print(f"  ! skipped {b['name']}: bad footprint")
            continue
        if poly.exterior.is_ccw is False:
            poly = Polygon(list(poly.exterior.coords)[::-1])
        rec = {"no": b["no"], "name": b["name"], "kind": b.get("kind", "box"), "h": height_for(poly.area, b),
               "colour": roof_colour(src, ppx), "footprint": [[round(x, 2), round(y, 2)] for x, y in poly.exterior.coords[:-1]],
               "source": "souvenir map", "uncertain": bool(b.get("uncertain")), "note": b.get("note", "")}
        if "masts" in b:
            m = T.px_to_local([[x, y] for x, y, _ in b["masts"]])
            rec["masts"] = [[round(float(p[0]), 2), round(float(p[1]), 2), h] for p, (_, _, h) in zip(m, b["masts"])]
        clash(poly, b["name"])
        out.append(rec)

    for s in spec.get("osm_survivors", []):
        poly = Polygon(feats[s["osm"]]["geometry"]["coordinates"])
        if poly.exterior.is_ccw is False:
            poly = Polygon(list(poly.exterior.coords)[::-1])
        panel = "havre" if poly.centroid.x < -300 else "islands"
        ppx = [tuple(p) for p in xf[panel].local_to_px(list(poly.exterior.coords))]
        clash(poly, s["name"])
        out.append({"no": None, "name": s["name"], "kind": "box", "h": float(s["h"]), "colour": roof_colour(src, ppx),
                    "footprint": [[round(x, 2), round(y, 2)] for x, y in poly.exterior.coords[:-1]],
                    "source": f"surviving building, OSM {s['osm']}", "uncertain": False, "note": s.get("note", "")})

    dst = ROOT / "web" / "public" / "data" / "generic.json"
    dst.write_text(json.dumps(out))
    print(f"{len(out)} generic buildings -> {dst.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
