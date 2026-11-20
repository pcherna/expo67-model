"""Resolve data/pavilions/placements.json into web/public/data/pavilions.json.

Output per pavilion: x, y (local metres), rot_deg (long axis, degrees CCW from east),
footprint (modern OSM polygon if the building survives), provenance.
Usage: .venv/bin/python tools/export_pavilions.py
"""
import json
import math

import numpy as np
from shapely.geometry import Polygon

import georef
from common import DATA, ROOT


def long_axis_deg(poly):
    r = list(poly.minimum_rotated_rectangle.exterior.coords)
    e = [(r[i + 1][0] - r[i][0], r[i + 1][1] - r[i][1]) for i in range(2)]
    dx, dy = max(e, key=lambda v: math.hypot(*v))
    return math.degrees(math.atan2(dy, dx)) % 180


def main():
    spec = json.loads((DATA / "pavilions" / "placements.json").read_text())
    feats = {f["properties"]["osm"]: f for f in json.loads((DATA / "osm" / "reference.geojson").read_text())["features"]}
    _, xf = georef.load()
    out = []
    for p in spec["pavilions"]:
        rec = {"id": p["id"], "name": p["name"], "map_no": p["map_no"]}
        if p["source"] == "osm":
            poly = Polygon(feats[p["osm"]]["geometry"]["coordinates"])
            c = poly.centroid
            rec.update(x=c.x, y=c.y, rot_deg=long_axis_deg(poly),
                       footprint=[[round(x, 2), round(y, 2)] for x, y in poly.exterior.coords],
                       provenance=f"surviving building, OSM {p['osm']}")
        else:
            T = xf[p["panel"]]
            c = T.px_to_local([p["centre_px"]])[0]
            a0, a1 = T.px_to_local(p["axis_px"])
            off = np.zeros(2)
            prov = f"1967 souvenir map px {p['centre_px']} via {T.model} ({p['panel']})"
            if "anchor" in p:
                ac = Polygon(feats[p["anchor"]["osm"]]["geometry"]["coordinates"]).centroid
                off = np.array([ac.x, ac.y]) - T.px_to_local([p["anchor"]["px"]])[0]
                prov += f", locally corrected by {np.hypot(*off):.0f} m using anchor {p['anchor']['osm']}"
            c = c + off
            rec.update(x=float(c[0]), y=float(c[1]),
                       rot_deg=math.degrees(math.atan2(a1[1] - a0[1], a1[0] - a0[0])) % 360,
                       footprint=None, provenance=prov)
        rec["x"], rec["y"], rec["rot_deg"] = round(rec["x"], 2), round(rec["y"], 2), round(rec["rot_deg"], 2)
        out.append(rec)
        print(f"{p['id']:8s} x={rec['x']:8.1f} y={rec['y']:8.1f} rot={rec['rot_deg']:6.1f}  {rec['provenance']}")
    dst = ROOT / "web" / "public" / "data" / "pavilions.json"
    dst.write_text(json.dumps(out))
    print(f"-> {dst.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
