"""Detect straight edges in a photo and draw a numbered overlay for picking lines and points by eye.

Usage: python tools/pilot/lines.py IMG OUT_PREFIX [--min 40] [--crop x0,y0,x1,y1] [--scale 1]
Writes OUT_PREFIX.json (segments in source pixels) and OUT_PREFIX.jpg (overlay with segment ids and
a coordinate grid every 50 source px). Use --crop/--scale to zoom when picking points.
Runs under the pilot venv (data/pilot/vggt/.venv), which has OpenCV.
"""
import argparse
import json

import cv2
import numpy as np


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("img")
    ap.add_argument("out")
    ap.add_argument("--min", type=float, default=40)
    ap.add_argument("--crop", default="")
    ap.add_argument("--scale", type=float, default=1.0)
    ap.add_argument("--grid", type=int, default=50)
    a = ap.parse_args()
    im = cv2.imread(a.img)
    gray = cv2.cvtColor(im, cv2.COLOR_BGR2GRAY)
    segs = cv2.createLineSegmentDetector().detect(gray)[0]
    segs = [] if segs is None else segs.reshape(-1, 4)
    segs = [s for s in segs if np.hypot(s[2] - s[0], s[3] - s[1]) >= a.min]
    segs.sort(key=lambda s: -np.hypot(s[2] - s[0], s[3] - s[1]))
    json.dump([[round(float(v), 1) for v in s] for s in segs], open(a.out + ".json", "w"))
    x0, y0, x1, y1 = [int(v) for v in a.crop.split(",")] if a.crop else (0, 0, im.shape[1], im.shape[0])
    k = a.scale
    view = cv2.resize(im[y0:y1, x0:x1], None, fx=k, fy=k, interpolation=cv2.INTER_CUBIC)
    view = (view * 0.75).astype(np.uint8)
    T = lambda x, y: (int((x - x0) * k), int((y - y0) * k))
    g = a.grid
    for gx in range((x0 // g) * g, x1, g):
        cv2.line(view, T(gx, y0), T(gx, y1), (90, 90, 90), 1)
        cv2.putText(view, str(gx), (T(gx, y0)[0] + 2, 12), cv2.FONT_HERSHEY_PLAIN, 0.8, (0, 255, 255), 1)
    for gy in range((y0 // g) * g, y1, g):
        cv2.line(view, T(x0, gy), T(x1, gy), (90, 90, 90), 1)
        cv2.putText(view, str(gy), (2, T(x0, gy)[1] - 2), cv2.FONT_HERSHEY_PLAIN, 0.8, (0, 255, 255), 1)
    for i, s in enumerate(segs):
        ang = np.degrees(np.arctan2(s[3] - s[1], s[2] - s[0])) % 180
        col = (0, 0, 255) if abs(ang - 90) < 20 else (255, 160, 0)  # red = near-vertical, blue = other
        cv2.line(view, T(s[0], s[1]), T(s[2], s[3]), col, 2)
        mx, my = T((s[0] + s[2]) / 2, (s[1] + s[3]) / 2)
        cv2.putText(view, str(i), (mx + 3, my - 3), cv2.FONT_HERSHEY_PLAIN, 1.0, (255, 255, 255), 1)
    cv2.imwrite(a.out + ".jpg", view, [cv2.IMWRITE_JPEG_QUALITY, 88])
    print(f"{len(segs)} segments >= {a.min}px -> {a.out}.jpg")


if __name__ == "__main__":
    main()
