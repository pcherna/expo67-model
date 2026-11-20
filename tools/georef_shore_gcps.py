"""Generate shoreline GCPs automatically where the shore is unchanged since 1967.

Shores used: Île Sainte-Hélène (whole outline, minus excluded stretches) and the river
side of Cité du Havre. Notre-Dame is skipped: it was reshaped for 1976.

Method: walk the modern OSM shoreline every STEP metres. At each sample, search along the
outward normal in the current (affine) warped map for the nearest land->water edge. The map
pixel at that edge pairs with the modern shore point. Because only the normal offset is
measured, these points constrain the outline. The along-shore position comes from the
current transform.

Writes the points into data/georef/gcps.json under "auto_shore" (replaced on each run).
Run tools/georef_fit.py + tools/georef_warp.py first. Pixel positions are mapped back with
the same transform that produced the warped image, so this works for affine or TPS.
"""
import json

import numpy as np
from PIL import Image
from shapely.geometry import LineString, Point, Polygon

import georef
from common import DATA

Image.MAX_IMAGE_PIXELS = None
STEP = 40.0  # metres between samples
SEARCH = 70.0  # metres either side of the modern shore
MIN_WATER_RUN = 8  # metres of continuous water needed to count as open water
WEIGHT = 0.25

SHORES = {
    # panel: (OSM feature, optional clip box in local metres [xmin, xmax, ymin, ymax], excluded boxes)
    "islands": ("way/156840794", None, [
        # La Ronde's NE marina/breakwaters were reworked after 1967; skip that end.
        (-400, 600, 3150, 3700),
    ]),
    "havre": ("relation/3430571", (-600, -520, -150, 860), []),
}


def main():
    g = json.loads((DATA / "georef" / "gcps.json").read_text())
    _, xforms = georef.load()
    feats = {f["properties"]["osm"]: f for f in json.loads((DATA / "osm" / "reference.geojson").read_text())["features"]}
    auto = []
    for panel, (osm, clip, excl) in SHORES.items():
        meta = json.loads((DATA.parent / "web" / "public" / "georef" / f"{panel}.json").read_text())
        img = Image.open(DATA / "georef" / f"{panel}_warped.png")
        mpp = (meta["xmax"] - meta["xmin"]) / img.width
        land = georef.land_mask(img, min_area=20000)

        coords = feats[osm]["geometry"]["coordinates"]
        poly = Polygon(coords)
        line = LineString(coords)
        n_ok = 0
        for s in np.arange(0, line.length, STEP):
            p = np.array(line.interpolate(s).coords[0])
            if clip and not (clip[0] <= p[0] <= clip[1] and clip[2] <= p[1] <= clip[3]):
                continue
            if any(b[0] <= p[0] <= b[1] and b[2] <= p[1] <= b[3] for b in excl):
                continue
            q = np.array(line.interpolate(min(s + 2, line.length)).coords[0]) - np.array(line.interpolate(max(s - 2, 0)).coords[0])
            nrm = np.array([q[1], -q[0]]) / (np.hypot(*q) + 1e-9)
            if poly.contains(Point(*(p + nrm * 3))):
                nrm = -nrm  # make it point out to the water
            offs = np.arange(-SEARCH, SEARCH + 1, mpp)
            pts = p[None, :] + offs[:, None] * nrm[None, :]
            ii = ((pts[:, 0] - meta["xmin"]) / mpp).astype(int)
            jj = ((meta["ymax"] - pts[:, 1]) / mpp).astype(int)
            ok = (ii >= 0) & (ii < img.width) & (jj >= 0) & (jj < img.height)
            if not ok.all():
                continue
            prof = land[jj, ii]
            # land->water edges followed by a run of open water
            edges = [k for k in range(1, len(prof) - MIN_WATER_RUN) if prof[k - 1] and not prof[k:k + MIN_WATER_RUN].any()]
            if not edges:
                continue
            k = min(edges, key=lambda k: abs(offs[k]))
            if abs(offs[k]) > SEARCH - 5:
                continue
            mp = pts[k]  # where the 1967 shore is, in the current warp's local coords
            px = xforms[panel].local_to_px(mp)[0]
            auto.append({"id": f"shore_{panel}_{int(s):05d}", "panel": panel, "px": [round(px[0], 1), round(px[1], 1)],
                         "osm": {"local": [round(p[0], 2), round(p[1], 2)]}, "w": WEIGHT,
                         "why": f"auto shoreline match, normal offset {offs[k]:+.0f} m vs previous warp"})
            n_ok += 1
        offsets = [float(a["why"].split("offset ")[1].split(" ")[0]) for a in auto if a["panel"] == panel]
        print(f"[{panel}] {n_ok} shore GCPs, normal offset median {np.median(offsets):+.1f} m, p90 |off| {np.percentile(np.abs(offsets), 90):.1f} m")
    g["auto_shore"] = auto
    (DATA / "georef" / "gcps.json").write_text(json.dumps(g, indent=1, ensure_ascii=False))


if __name__ == "__main__":
    main()
