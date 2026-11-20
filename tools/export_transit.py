"""Resolve data/transit/lines.json into web/public/data/transit.json.

Each segment is mapped to local metres, densified every STEP m, and given a deck height:
0 m on land, BRIDGE_H over water (from the warped map's land mask), with linear ramps.
Usage: .venv/bin/python tools/export_transit.py   (run after tools/georef_warp.py)
"""
import json

import numpy as np
from PIL import Image
from scipy import ndimage

import georef
from common import DATA, ROOT

STEP = 5.0
BRIDGE_H = 9.0  # m, deck over water. Estimate.
RAMP = 80.0  # m to climb from grade to deck


def main():
    spec = json.loads((DATA / "transit" / "lines.json").read_text())
    _, xf = georef.load()
    masks = {}
    for panel in xf:
        meta = json.loads((ROOT / "web" / "public" / "georef" / f"{panel}.json").read_text())
        img = Image.open(DATA / "georef" / f"{panel}_warped.png")
        mpp = (meta["xmax"] - meta["xmin"]) / img.width
        land = georef.land_mask(img, min_area=3000, mpp=mpp)
        masks[panel] = (land, meta, mpp)

    out = []
    for line in spec["lines"]:
        segs = []
        for seg in line["segments"]:
            pts = xf[seg["panel"]].px_to_local(seg["px"])
            d = np.r_[0, np.cumsum(np.hypot(*np.diff(pts, axis=0).T))]
            s = np.arange(0, d[-1] + 0.01, STEP)
            xy = np.column_stack([np.interp(s, d, pts[:, 0]), np.interp(s, d, pts[:, 1])])
            # water test: sample the land mask of every panel; land on any panel counts as land
            water = np.ones(len(xy), bool)
            for land, meta, mpp in masks.values():
                i = ((xy[:, 0] - meta["xmin"]) / mpp).astype(int)
                j = ((meta["ymax"] - xy[:, 1]) / mpp).astype(int)
                ok = (i >= 0) & (i < land.shape[1]) & (j >= 0) & (j < land.shape[0])
                water[ok] &= ~land[j[ok], i[ok]]
            # deck height: distance (along the line) to the nearest water sample, turned into a ramp
            dist = ndimage.distance_transform_edt(~water) * STEP if water.any() else np.full(len(xy), 1e9)
            h = np.clip(BRIDGE_H * (1 - dist / RAMP), 0, BRIDGE_H)
            segs.append({"pts": [[round(float(x), 2), round(float(y), 2), round(float(z), 2)] for (x, y), z in zip(xy, h)],
                         "length_m": round(float(d[-1]), 1)})
        stations = []
        for st in line["stations"]:
            x, y = xf[st["panel"]].px_to_local([st["px"]])[0]
            stations.append({"no": st["no"], "name": st["name"], "x": round(float(x), 2), "y": round(float(y), 2)})
        out.append({"id": line["id"], "name": line["name"], "colour": line["colour"], "segments": segs, "stations": stations})
        print(f"{line['id']}: {len(segs)} segments, {sum(s['length_m'] for s in segs):.0f} m, {len(stations)} stations")
    (ROOT / "web" / "public" / "data" / "transit.json").write_text(json.dumps(out))


if __name__ == "__main__":
    main()
