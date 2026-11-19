"""Fit map-pixel -> local-metre transforms per panel from data/georef/gcps.json.

Writes data/georef/transforms.json and prints per-point residuals so bad GCPs stand out.
Usage: .venv/bin/python tools/georef_fit.py
"""
import json

import numpy as np
from shapely.geometry import Polygon

from common import DATA

GCPS = DATA / "georef" / "gcps.json"
REF = DATA / "osm" / "reference.geojson"
OUT = DATA / "georef" / "transforms.json"


def resolve(osm, feats):
    if "local" in osm:
        return osm["local"]
    if "centroid" in osm:
        c = Polygon(feats[osm["centroid"]]["geometry"]["coordinates"]).centroid
        return [c.x, c.y]
    raise ValueError(f"unknown osm spec {osm}")


def fit_affine(px, xy, w):
    """Weighted least squares for [x y] = A @ [u v 1]."""
    u = np.column_stack([px, np.ones(len(px))])
    sw = np.sqrt(w)[:, None]
    A, *_ = np.linalg.lstsq(u * sw, xy * sw, rcond=None)
    return A.T  # 2x3


def fit_similarity(px, xy, w):
    """Weighted least squares for a rotation+scale+mirror: image v points down, so fit on (u, -v)."""
    rows, rhs, ws = [], [], []
    for (u, v), (x, y), wi in zip(px, xy, w):
        v = -v
        rows += [[u, -v, 1, 0], [v, u, 0, 1]]
        rhs += [x, y]
        ws += [wi, wi]
    sw = np.sqrt(ws)
    a, b, tx, ty = np.linalg.lstsq(np.array(rows) * sw[:, None], np.array(rhs) * sw, rcond=None)[0]
    # fold the v -> -v flip back in so the matrix applies to raw pixel coords
    return np.array([[a, b, tx], [b, -a, ty]])


def apply(A, px):
    return np.column_stack([px, np.ones(len(px))]) @ A.T


def main():
    g = json.loads(GCPS.read_text())
    feats = {f["properties"]["osm"]: f for f in json.loads(REF.read_text())["features"]}
    out = {"source": g["source"], "frame": "local metres, tools/common.py", "panels": {}}
    for panel in g["panels"]:
        pts = [p for p in g["points"] if p["panel"] == panel and p.get("w", 1) > 0]
        if len(pts) < 3:
            print(f"[{panel}] only {len(pts)} GCPs, skipped")
            continue
        px = np.array([p["px"] for p in pts], float)
        xy = np.array([resolve(p["osm"], feats) for p in pts], float)
        w = np.array([p.get("w", 1.0) for p in pts], float)
        res = {}
        for kind, fn in (("similarity", fit_similarity), ("affine", fit_affine)):
            if kind == "affine" and len(pts) < 4:
                continue
            A = fn(px, xy, w)
            r = np.linalg.norm(apply(A, px) - xy, axis=1)
            res[kind] = (A, r)
            sx, sy = np.linalg.norm(A[:, 0]), np.linalg.norm(A[:, 1])
            rot = np.degrees(np.arctan2(A[1, 0], A[0, 0]))
            rms = float(np.sqrt(np.average(r**2, weights=w)))
            print(f"[{panel}] {kind:10s} n={len(pts)} rms={rms:5.1f} m  scale={1/sx:.3f},{1/sy:.3f} px/m  rot={rot:6.1f} deg")
        best = "affine" if "affine" in res and len(pts) >= 6 else "similarity"
        A, r = res[best]
        for p, ri in zip(pts, r):
            flag = "  <-- check" if ri > 15 else ""
            print(f"    {p['id']:22s} w={p.get('w',1):.1f} resid={ri:6.1f} m{flag}")
        out["panels"][panel] = {"model": best, "matrix": A.round(6).tolist(), "rms_m": round(float(np.sqrt(np.average(r**2, weights=w))), 2), "n": len(pts)}
    OUT.write_text(json.dumps(out, indent=2))
    print(f"-> {OUT.relative_to(DATA.parent)}")


if __name__ == "__main__":
    main()
