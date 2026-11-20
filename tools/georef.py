"""Load fitted transforms and convert between souvenir-map pixels and local metres."""
import json

import numpy as np
from scipy import ndimage

from common import DATA
from tps import TPS

WATER_RGB = np.array([131, 203, 218])  # sampled from the souvenir map's river


class PanelTransform:
    def __init__(self, rec):
        self.rec = rec
        self.model = rec["model"]
        if self.model == "tps":
            self.fwd = TPS.from_json(rec["tps_fwd"])
            self.inv = TPS.from_json(rec["tps_inv"])
        else:
            A = np.vstack([np.array(rec["matrix"]), [0, 0, 1]])
            self.A, self.Ainv = A, np.linalg.inv(A)

    def px_to_local(self, px):
        px = np.atleast_2d(np.asarray(px, float))
        if self.model == "tps":
            return self.fwd(px)
        return np.column_stack([px, np.ones(len(px))]) @ self.A[:2].T

    def local_to_px(self, xy):
        xy = np.atleast_2d(np.asarray(xy, float))
        if self.model == "tps":
            return self.inv(xy)
        return np.column_stack([xy, np.ones(len(xy))]) @ self.Ainv[:2].T


def load():
    tr = json.loads((DATA / "georef" / "transforms.json").read_text())
    return tr, {p: PanelTransform(r) for p, r in tr["panels"].items()}


def land_mask(img, min_area=3000, mpp=1.0):
    """Boolean land mask of a warped map image: not river-coloured, minus specks and legend text."""
    a = np.asarray(img.convert("RGBA")).astype(np.int16)
    rgb, alpha = a[..., :3], a[..., 3]
    water = (np.abs(rgb - WATER_RGB).max(axis=2) < 28) & (alpha > 0)
    land = ~water & (alpha > 0)
    land = ndimage.binary_opening(land, iterations=2)
    lab, n = ndimage.label(land)
    sizes = ndimage.sum(land, lab, range(1, n + 1))
    keep = np.zeros(n + 1, bool)
    keep[1:] = sizes * mpp * mpp > min_area
    return keep[lab]
