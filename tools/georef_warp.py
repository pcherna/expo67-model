"""Warp the souvenir map into the local metric frame using data/georef/transforms.json.

Each panel only uses its own region of the scan (PANEL_REGIONS, in source pixels), so the
displaced Cité du Havre drawing does not bleed into the islands warp and vice versa.

Outputs per panel:
  data/georef/<panel>_warped.png      RGBA map resampled to local metres, north up
  data/georef/<panel>_overlay.jpg     same, with modern OSM outlines on top (QA)
  web/public/georef/<panel>.webp      web texture, longest side <= 4096 px
  web/public/georef/<panel>.json      bounds {xmin,xmax,ymin,ymax} in local metres for the ground plane
Usage: .venv/bin/python tools/georef_warp.py [--mpp 0.5] [--panel islands]
"""
import argparse
import json

import numpy as np
from PIL import Image, ImageDraw
from scipy import ndimage

import georef
from common import DATA, ROOT

Image.MAX_IMAGE_PIXELS = None

WINDOWS = {  # local-metre extents to render per panel: xmin, xmax, ymin, ymax
    "islands": (-700.0, 1700.0, -800.0, 3700.0),
    "havre": (-1100.0, 0.0, -1300.0, 1000.0),
}
# Source-pixel rectangles that belong to each panel (x0, y0, x1, y1). Islands = everything else.
HAVRE_BLOCK = (0, 0, 4950, 1150)
# Panel title boxes and the logo, printed over the water (source pixels, with margin).
LABEL_BOXES = [
    (5320, 540, 5720, 700),    # ILE SAINTE-HELENE
    (8750, 2690, 9000, 2870),  # LA RONDE
    (1800, 2200, 2180, 2330),  # ILE NOTRE-DAME
    (2670, 980, 3040, 1110),   # CITE DU HAVRE
    (8800, 150, 10000, 560),   # expo67 logo
]
WEB_MAX = 4096
GRID = 8  # evaluate the (possibly TPS) inverse transform every GRID output pixels, interpolate between
WEB_DIR = ROOT / "web" / "public" / "georef"


def panel_mask(size, panel):
    m = Image.new("L", size, 0 if panel == "havre" else 255)
    d = ImageDraw.Draw(m)
    d.rectangle(HAVRE_BLOCK, fill=255 if panel == "havre" else 0)
    for box in LABEL_BOXES:
        d.rectangle(box, fill=0)
    return m


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--mpp", type=float, default=0.5)
    ap.add_argument("--panel", default=None)
    a = ap.parse_args()
    tr, xforms = georef.load()
    src = Image.open(ROOT / tr["source"]).convert("RGB")
    ref = json.loads((DATA / "osm" / "reference.geojson").read_text())["features"]
    WEB_DIR.mkdir(parents=True, exist_ok=True)

    for panel, info in tr["panels"].items():
        if a.panel and panel != a.panel:
            continue
        xmin, xmax, ymin, ymax = WINDOWS[panel]
        mpp = a.mpp
        W, H = int((xmax - xmin) / mpp), int((ymax - ymin) / mpp)
        # output pixel (i, j) -> local (xmin + i*mpp, ymax - j*mpp) -> source pixel, on a coarse grid
        gi = np.arange(0, W + GRID, GRID)
        gj = np.arange(0, H + GRID, GRID)
        GI, GJ = np.meshgrid(gi, gj)
        loc = np.column_stack([xmin + GI.ravel() * mpp, ymax - GJ.ravel() * mpp])
        spx = xforms[panel].local_to_px(loc)
        su = spx[:, 0].reshape(GI.shape)
        sv = spx[:, 1].reshape(GI.shape)
        # bilinear upsample of the coordinate maps to full output resolution
        J, I = np.mgrid[0:H, 0:W].astype(np.float32) / GRID
        U = ndimage.map_coordinates(su, [J, I], order=1)
        V = ndimage.map_coordinates(sv, [J, I], order=1)
        rgba = np.dstack([np.asarray(src), np.asarray(panel_mask(src.size, panel))])
        chans = [ndimage.map_coordinates(rgba[..., c], [V, U], order=1, mode="constant", cval=0) for c in range(4)]
        warped = Image.fromarray(np.dstack(chans).astype(np.uint8))
        # Water becomes transparent so the viewer's own water shows through. This also drops the legend text.
        land = georef.land_mask(warped, min_area=3000, mpp=mpp)
        land = ndimage.binary_closing(land, iterations=2)
        warped.putalpha(Image.fromarray((land * 255).astype(np.uint8)))
        warped.save(DATA / "georef" / f"{panel}_warped.png")

        bounds = {"xmin": xmin, "xmax": xmax, "ymin": ymin, "ymax": ymax, "model": info["model"], "rms_m": info["rms_m"], "loocv_m": info["loocv_m"],
                  "n_gcps": info["n_manual"], "n_shore": info["n_shore"]}
        s = min(1.0, WEB_MAX / max(W, H))
        web = warped.resize((round(W * s), round(H * s)), Image.LANCZOS) if s < 1 else warped
        web.save(WEB_DIR / f"{panel}.webp", quality=82, method=6)
        (WEB_DIR / f"{panel}.json").write_text(json.dumps(bounds))

        ov = Image.new("RGB", (W, H), (0, 0, 0))
        ov.paste(warped, mask=warped.getchannel("A"))
        d = ImageDraw.Draw(ov)
        topx = lambda c: [((x - xmin) / mpp, (ymax - y) / mpp) for x, y in c]
        colors = {"island": (255, 0, 0), "building": (255, 0, 255), "bridge": (0, 0, 0), "water": (0, 60, 255)}
        for f in ref:
            k = f["properties"]["kind"]
            c = f["geometry"]["coordinates"]
            if k in colors and len(c) > 1:
                d.line(topx(c), fill=colors[k], width=3 if k == "island" else 2)
            elif k == "highway" and f["properties"].get("highway") in ("motorway", "trunk", "primary", "secondary", "tertiary", "unclassified", "service"):
                d.line(topx(c), fill=(255, 140, 0), width=1)
        ov.save(DATA / "georef" / f"{panel}_overlay.jpg", quality=85)
        print(f"[{panel}] {W}x{H} @ {mpp} m/px, web {web.size[0]}x{web.size[1]} -> {panel}_warped.png, {panel}_overlay.jpg, web/public/georef/{panel}.webp")


if __name__ == "__main__":
    main()
