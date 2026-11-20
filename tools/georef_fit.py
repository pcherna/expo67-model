"""Fit map-pixel <-> local-metre transforms per panel from data/georef/gcps.json.

Candidate models: similarity, affine, and thin-plate splines with several smoothing values.
The model is chosen by leave-one-out cross-validation (LOOCV) on the hand-picked points.
Each one is held out in turn and predicted from all the others, including auto shore points.
That measures how well a model predicts places it was not fitted to, which is what
matters for placing pavilions between control points.

Writes data/georef/transforms.json:
  panels.<p>.affine_matrix   2x3, pixel -> local (always kept; used for shore matching)
  panels.<p>.model           "affine" | "tps"
  panels.<p>.tps_fwd/tps_inv TPS params (pixel->local, local->pixel) when model == tps
Usage: .venv/bin/python tools/georef_fit.py [--verbose]
"""
import argparse
import json

import numpy as np
from shapely.geometry import Polygon

from common import DATA
from tps import TPS

GCPS = DATA / "georef" / "gcps.json"
REF = DATA / "osm" / "reference.geojson"
OUT = DATA / "georef" / "transforms.json"
LAMBDAS = [0.001, 0.01, 0.05, 0.2, 1.0]


def resolve(osm, feats):
    if "local" in osm:
        return osm["local"]
    if "centroid" in osm:
        c = Polygon(feats[osm["centroid"]]["geometry"]["coordinates"]).centroid
        return [c.x, c.y]
    raise ValueError(f"unknown osm spec {osm}")


def fit_affine(px, xy, w):
    u = np.column_stack([px, np.ones(len(px))])
    sw = np.sqrt(w)[:, None]
    A, *_ = np.linalg.lstsq(u * sw, xy * sw, rcond=None)
    return A.T


def fit_similarity(px, xy, w):
    """Rotation + scale + mirror (image v points down, so fit on (u, -v))."""
    rows, rhs, ws = [], [], []
    for (u, v), (x, y), wi in zip(px, xy, w):
        v = -v
        rows += [[u, -v, 1, 0], [v, u, 0, 1]]
        rhs += [x, y]
        ws += [wi, wi]
    sw = np.sqrt(ws)
    a, b, tx, ty = np.linalg.lstsq(np.array(rows) * sw[:, None], np.array(rhs) * sw, rcond=None)[0]
    return np.array([[a, b, tx], [b, -a, ty]])


def apply_affine(A, px):
    return np.column_stack([px, np.ones(len(px))]) @ A.T


def make_predictor(kind, px, xy, w):
    if kind == "similarity":
        A = fit_similarity(px, xy, w)
        return lambda q: apply_affine(A, q)
    if kind == "affine":
        A = fit_affine(px, xy, w)
        return lambda q: apply_affine(A, q)
    lam = float(kind.split("=")[1])
    return TPS(px, xy, w, lam)


def wrms(r, w):
    return float(np.sqrt(np.average(r**2, weights=w)))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--verbose", action="store_true")
    a = ap.parse_args()
    g = json.loads(GCPS.read_text())
    feats = {f["properties"]["osm"]: f for f in json.loads(REF.read_text())["features"]}
    out = {"source": g["source"], "frame": "local metres, tools/common.py", "panels": {}}
    for panel in g["panels"]:
        manual = [p for p in g["points"] if p["panel"] == panel and p.get("w", 1) > 0]
        shore = [p for p in g.get("auto_shore", []) if p["panel"] == panel]
        pts = manual + shore
        if len(manual) < 3:
            print(f"[{panel}] only {len(manual)} manual GCPs, skipped")
            continue
        px = np.array([p["px"] for p in pts], float)
        xy = np.array([resolve(p["osm"], feats) for p in pts], float)
        w = np.array([p.get("w", 1.0) for p in pts], float)
        nm = len(manual)

        kinds = ["similarity"] + (["affine"] if nm >= 4 else []) + ([f"tps={l}" for l in LAMBDAS] if nm >= 6 else [])
        scores = {}
        for kind in kinds:
            fitres = np.linalg.norm(make_predictor(kind, px, xy, w)(px) - xy, axis=1)
            loo = []
            for i in range(nm):
                keep = np.arange(len(pts)) != i
                f = make_predictor(kind, px[keep], xy[keep], w[keep])
                loo.append(np.linalg.norm(f(px[i:i + 1])[0] - xy[i]))
            loo = np.array(loo)
            scores[kind] = (wrms(loo, w[:nm]), loo, fitres)
            print(f"[{panel}] {kind:11s} fit rms(manual)={wrms(fitres[:nm], w[:nm]):5.1f} m  "
                  f"fit rms(shore)={(wrms(fitres[nm:], w[nm:]) if len(shore) else float('nan')):5.1f} m  LOOCV={scores[kind][0]:5.1f} m")
        best = min(scores, key=lambda k: scores[k][0])
        _, loo, fitres = scores[best]
        print(f"[{panel}] chosen: {best}  ({nm} manual + {len(shore)} shore GCPs)")
        for p, li, ri in zip(manual, loo, fitres):
            flag = "  <-- check" if li > 20 else ""
            if a.verbose or flag:
                print(f"    {p['id']:24s} w={p.get('w', 1):.2f} fit={ri:5.1f} m  loo={li:5.1f} m{flag}")

        aff = fit_affine(px, xy, w) if nm >= 4 else fit_similarity(px, xy, w)
        rec = {"affine_matrix": aff.round(6).tolist(), "n_manual": nm, "n_shore": len(shore),
               "loocv_m": round(scores[best][0], 2), "rms_m": round(wrms(fitres[:nm], w[:nm]), 2)}
        if best.startswith("tps"):
            lam = float(best.split("=")[1])
            rec.update(model="tps", lam=lam, tps_fwd=TPS(px, xy, w, lam).to_json(), tps_inv=TPS(xy, px, w, lam).to_json())
        else:
            rec.update(model=best, matrix=(fit_similarity(px, xy, w) if best == "similarity" else aff).round(6).tolist())
        out["panels"][panel] = rec
    OUT.write_text(json.dumps(out))
    print(f"-> {OUT.relative_to(DATA.parent)}")


if __name__ == "__main__":
    main()
