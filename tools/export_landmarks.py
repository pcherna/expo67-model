"""Export positions of surviving Expo 67 landmarks (from modern OSM) for the web viewer.

These are ground truth for placing models and for camera presets.
Usage: .venv/bin/python tools/export_landmarks.py
"""
import json

from shapely.geometry import Polygon

from common import DATA, ROOT

LANDMARKS = {  # id: (OSM way, label)
    "biosphere": ("way/26288030", "Biosphère (US pavilion)"),
    "habitat67": ("way/440195613", "Habitat 67"),
    "casino_france": ("way/26698931", "France pavilion (Casino)"),
    "tour_de_levis": ("way/433277863", "Tour de Lévis"),
    "fort": ("way/115813650", "Fort Sainte-Hélène"),
    "helene_de_champlain": ("way/82141843", "Hélène-de-Champlain"),
    "jamaica": ("way/433151288", "Jamaica pavilion"),
    "tunisia": ("way/46866700", "Tunisia pavilion"),
    "korea": ("way/310084402", "Korea pavilion"),
}


def main():
    feats = {f["properties"]["osm"]: f for f in json.loads((DATA / "osm" / "reference.geojson").read_text())["features"]}
    out = []
    for lid, (osm, label) in LANDMARKS.items():
        poly = Polygon(feats[osm]["geometry"]["coordinates"])
        c = poly.centroid
        out.append({"id": lid, "label": label, "osm": osm, "x": round(c.x, 2), "y": round(c.y, 2),
                    "footprint": [[round(x, 2), round(y, 2)] for x, y in poly.exterior.coords]})
    dst = ROOT / "web" / "public" / "data" / "landmarks.json"
    dst.parent.mkdir(parents=True, exist_ok=True)
    dst.write_text(json.dumps(out))
    print(f"{len(out)} landmarks -> {dst.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
