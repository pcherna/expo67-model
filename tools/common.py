"""Shared coordinate setup for the Expo 67 model.

World frame: NAD83 / MTM zone 8 (EPSG:32188), the City of Montreal's grid,
shifted to a local origin so values stay small for WebGL.
Local x = easting - ORIGIN_E (metres, east), local y = northing - ORIGIN_N (metres, north).
In three.js we map local (x, y) -> (x, 0, -y) so +Y is up and -Z is north.
"""
from pathlib import Path

from pyproj import Transformer

ROOT = Path(__file__).resolve().parent.parent
DATA = ROOT / "data"
SOURCES = ROOT / "sources"

EPSG = 32188
# Round MTM8 coordinate near the middle of the Expo site (between the two islands).
ORIGIN_E = 302_000.0
ORIGIN_N = 5_040_000.0

_to_mtm = Transformer.from_crs(4326, EPSG, always_xy=True)
_to_ll = Transformer.from_crs(EPSG, 4326, always_xy=True)


def lonlat_to_local(lon, lat):
    e, n = _to_mtm.transform(lon, lat)
    return e - ORIGIN_E, n - ORIGIN_N


def local_to_lonlat(x, y):
    return _to_ll.transform(x + ORIGIN_E, y + ORIGIN_N)
