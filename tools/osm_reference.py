"""Convert the raw Overpass dump to local-metre GeoJSON and render a reference PNG.

Usage: .venv/bin/python tools/osm_reference.py
Inputs:  data/osm/islands_raw.json (Overpass `out geom tags`)
Outputs: data/osm/reference.geojson, data/osm/reference.png (+ reference_meta.json)
"""
import json

from PIL import Image, ImageDraw

from common import DATA, lonlat_to_local

RAW = DATA / "osm" / "islands_raw.json"
RAW_REL = DATA / "osm" / "relations_raw.json"  # relations re-fetched with `out geom;`
OUT_GEOJSON = DATA / "osm" / "reference.geojson"
OUT_PNG = DATA / "osm" / "reference.png"
OUT_META = DATA / "osm" / "reference_meta.json"

# Render window in local metres and resolution.
XMIN, XMAX, YMIN, YMAX = -1600.0, 2800.0, -2600.0, 3800.0
MPP = 1.0  # metres per pixel


def classify(tags):
    if "building" in tags:
        return "building"
    if tags.get("place") in ("island", "islet"):
        return "island"
    if tags.get("natural") == "water" or "waterway" in tags:
        return "water"
    if tags.get("man_made") == "bridge":
        return "bridge"
    if "railway" in tags:
        return "railway"
    if "highway" in tags:
        return "highway"
    if "leisure" in tags:
        return "leisure"
    if tags.get("man_made"):
        return "man_made"
    return None


def element_rings(el):
    if el["type"] == "way" and "geometry" in el:
        yield [lonlat_to_local(p["lon"], p["lat"]) for p in el["geometry"]]
    elif el["type"] == "relation":
        parts = [[(p["lon"], p["lat"]) for p in m["geometry"]]
                 for m in el.get("members", []) if m.get("role") in ("outer", "") and m.get("geometry")]
        for ring in stitch(parts):
            yield [lonlat_to_local(lon, lat) for lon, lat in ring]


def stitch(parts):
    """Join multipolygon member ways end-to-end into rings (open chains are returned as-is)."""
    parts = [list(p) for p in parts]
    rings = []
    while parts:
        cur = parts.pop(0)
        changed = True
        while cur[0] != cur[-1] and changed:
            changed = False
            for i, p in enumerate(parts):
                if p[0] == cur[-1]:
                    cur += p[1:]
                elif p[-1] == cur[-1]:
                    cur += p[::-1][1:]
                elif p[-1] == cur[0]:
                    cur = p[:-1] + cur
                elif p[0] == cur[0]:
                    cur = p[::-1][:-1] + cur
                else:
                    continue
                parts.pop(i)
                changed = True
                break
        rings.append(cur)
    return rings


def main():
    elements = [e for e in json.loads(RAW.read_text())["elements"] if e["type"] != "relation"]
    elements += json.loads(RAW_REL.read_text())["elements"]
    feats = []
    for el in elements:
        tags = el.get("tags", {})
        kind = classify(tags)
        if not kind:
            continue
        for ring in element_rings(el):
            feats.append({
                "type": "Feature",
                "properties": {"kind": kind, "osm": f"{el['type']}/{el['id']}", **{k: tags[k] for k in ("name", "highway", "building", "bridge", "layer") if k in tags}},
                "geometry": {"type": "LineString", "coordinates": [[round(x, 2), round(y, 2)] for x, y in ring]},
            })
    OUT_GEOJSON.write_text(json.dumps({"type": "FeatureCollection", "crs_note": "local metres, see tools/common.py", "features": feats}))

    w, h = int((XMAX - XMIN) / MPP), int((YMAX - YMIN) / MPP)
    img = Image.new("RGB", (w, h), (170, 205, 230))  # default: water
    d = ImageDraw.Draw(img)
    px = lambda pts: [((x - XMIN) / MPP, (YMAX - y) / MPP) for x, y in pts]

    order = ["water", "island", "leisure", "highway", "railway", "bridge", "building", "man_made"]
    style = {
        "island": dict(fill=(225, 230, 210)),
        "leisure": dict(fill=(200, 225, 180)),
        "water": dict(fill=(170, 205, 230)),
        "building": dict(fill=(150, 110, 100), outline=(90, 60, 50)),
    }
    for kind in order:
        for f in feats:
            if f["properties"]["kind"] != kind:
                continue
            pts = px(f["geometry"]["coordinates"])
            if len(pts) < 2:
                continue
            closed = pts[0] == pts[-1] and len(pts) > 3
            if kind in style and closed:
                d.polygon(pts, **style[kind])
            elif kind == "highway":
                hw = f["properties"].get("highway", "")
                major = hw in ("motorway", "trunk", "primary", "secondary", "motorway_link")
                d.line(pts, fill=(250, 250, 250) if not major else (240, 180, 60), width=4 if major else 2)
            elif kind == "railway":
                d.line(pts, fill=(80, 80, 80), width=2)
            elif kind == "bridge":
                d.line(pts, fill=(60, 60, 60), width=3)
            elif kind == "water" and not closed:
                d.line(pts, fill=(120, 170, 210), width=2)
    # 250 m grid with labels to help read coordinates off the image
    for gx in range(int(XMIN), int(XMAX) + 1, 250):
        x = (gx - XMIN) / MPP
        d.line([(x, 0), (x, h)], fill=(255, 0, 0) if gx % 1000 == 0 else (255, 150, 150), width=1)
        d.text((x + 2, 2), str(gx), fill=(200, 0, 0))
    for gy in range(int(YMIN), int(YMAX) + 1, 250):
        y = (YMAX - gy) / MPP
        d.line([(0, y), (w, y)], fill=(255, 0, 0) if gy % 1000 == 0 else (255, 150, 150), width=1)
        d.text((2, y + 2), str(gy), fill=(200, 0, 0))
    img.save(OUT_PNG)
    OUT_META.write_text(json.dumps({"xmin": XMIN, "xmax": XMAX, "ymin": YMIN, "ymax": YMAX, "mpp": MPP}))
    print(f"{len(feats)} features -> {OUT_GEOJSON.name}; {w}x{h} px -> {OUT_PNG.name}")


if __name__ == "__main__":
    main()
