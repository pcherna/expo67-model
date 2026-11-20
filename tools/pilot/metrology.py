"""Single-view height measurement (Criminisi, Reid & Zisserman 2000) from picked lines and points.

Annotation JSON (paths relative to the annotation file):
  {"segs": "gb2.json",                       # segments from lines.py
   "vertical": [ids or [x0,y0,x1,y1]],       # edges that are truly vertical in the world
   "hA": [...], "hB": [...],                 # two families of horizontal edges (hB optional)
   "ref": {"b": [x, y], "t": [x, y], "h": 61.0},   # a reference of known height: base and top pixels
   "targets": {"name": {"b": [x, y], "t": [x, y]}, ...}}
With hA and hB, the horizon is the line through their vanishing points. With hA only, the focal length
comes from orthogonality of the hA and vertical vanishing points (principal point at the image centre),
and the horizon is the line through the hA point perpendicular to the vertical direction.
Each target base must sit on the same ground plane as the reference base.
Usage: python tools/pilot/metrology.py ANNOTATION.json [--img IMG --out OVERLAY.jpg]
"""
import argparse
import json
from pathlib import Path

import numpy as np


def hom(p):
    return np.array([p[0], p[1], 1.0])


def vanishing_point(segs):
    """Least-squares intersection of lines (smallest singular vector of the stacked line equations)."""
    L = []
    for x0, y0, x1, y1 in segs:
        l = np.cross(hom((x0, y0)), hom((x1, y1)))
        L.append(l / np.linalg.norm(l[:2]))
    _, s, vt = np.linalg.svd(np.array(L))
    v = vt[-1]
    # residual: rms perpendicular distance of each segment's midpoint line to the VP direction, in degrees
    res = []
    for x0, y0, x1, y1 in segs:
        m = np.array([(x0 + x1) / 2, (y0 + y1) / 2])
        d = np.array([x1 - x0, y1 - y0])
        to_v = v[:2] - m * v[2]
        ang = np.degrees(np.arccos(abs(d @ to_v) / (np.linalg.norm(d) * np.linalg.norm(to_v) + 1e-12)))
        res.append(ang)
    return v, float(np.sqrt(np.mean(np.square(res))))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("ann")
    ap.add_argument("--size", default="", help="W,H of the image (needed for hA-only mode)")
    a = ap.parse_args()
    path = Path(a.ann)
    A = json.loads(path.read_text())
    segs = json.loads((path.parent / A["segs"]).read_text()) if "segs" in A else []
    pick = lambda ids: [segs[i] if isinstance(i, int) else i for i in ids]
    v, rv = vanishing_point(pick(A["vertical"]))
    hA, ra = vanishing_point(pick(A["hA"]))
    print(f"vertical VP {np.round(v[:2] / v[2])} (rms {rv:.2f} deg over {len(A['vertical'])} edges)")
    print(f"hA VP {np.round(hA[:2] / hA[2])} (rms {ra:.2f} deg)")
    if A.get("hB"):
        hB, rb = vanishing_point(pick(A["hB"]))
        print(f"hB VP {np.round(hB[:2] / hB[2])} (rms {rb:.2f} deg)")
        l = np.cross(hA, hB)
    else:
        W, H = A["size"] if "size" in A else [int(s) for s in a.size.split(",")]
        c = np.array([W / 2, H / 2])
        pv, ph = v[:2] / v[2], hA[:2] / hA[2]
        f2 = -(pv - c) @ (ph - c)
        print(f"focal from orthogonality: {np.sqrt(f2):.0f} px" if f2 > 0 else "focal: no real solution (bad VPs)")
        n = pv - c  # horizon is perpendicular to the vertical direction in the image
        l = np.array([n[0], n[1], -n @ ph])
    l = l / np.linalg.norm(l[:2])

    def alpha_z(b, t):
        b, t = hom(b), hom(t)
        return -np.linalg.norm(np.cross(b, t)) / ((l @ b) * np.linalg.norm(np.cross(v, t)))

    ref = A["ref"]
    alpha = alpha_z(ref["b"], ref["t"]) / ref["h"]
    print(f"reference {ref['h']} m")
    out = {}
    for name, p in A["targets"].items():
        z = alpha_z(p["b"], p["t"]) / alpha
        out[name] = round(float(z), 2)
        print(f"  {name}: {z:.1f} m")
    (path.with_suffix(".result.json")).write_text(json.dumps({"vertical_rms_deg": rv, "hA_rms_deg": ra, "heights_m": out}, indent=1))


if __name__ == "__main__":
    main()
