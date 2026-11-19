"""Crop a region of a large image and overlay a labelled pixel grid in SOURCE coordinates.

Used to read ground-control-point pixel positions off the scanned map by eye.
Usage: crop_grid.py SRC X0 Y0 X1 Y1 OUT [--width 1600] [--step 100]
"""
import argparse

from PIL import Image, ImageDraw

Image.MAX_IMAGE_PIXELS = None


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("src")
    ap.add_argument("x0", type=int)
    ap.add_argument("y0", type=int)
    ap.add_argument("x1", type=int)
    ap.add_argument("y1", type=int)
    ap.add_argument("out")
    ap.add_argument("--width", type=int, default=1600)
    ap.add_argument("--step", type=int, default=100)
    a = ap.parse_args()

    im = Image.open(a.src).convert("RGB").crop((a.x0, a.y0, a.x1, a.y1))
    s = a.width / im.width
    im = im.resize((a.width, round(im.height * s)), Image.LANCZOS)
    d = ImageDraw.Draw(im)
    first_x = -(-a.x0 // a.step) * a.step
    for gx in range(first_x, a.x1 + 1, a.step):
        x = (gx - a.x0) * s
        major = gx % (a.step * 5) == 0
        d.line([(x, 0), (x, im.height)], fill=(255, 0, 0) if major else (255, 120, 120), width=1)
        d.text((x + 2, 2), str(gx), fill=(180, 0, 0))
    first_y = -(-a.y0 // a.step) * a.step
    for gy in range(first_y, a.y1 + 1, a.step):
        y = (gy - a.y0) * s
        major = gy % (a.step * 5) == 0
        d.line([(0, y), (im.width, y)], fill=(255, 0, 0) if major else (255, 120, 120), width=1)
        d.text((2, y + 2), str(gy), fill=(180, 0, 0))
    im.save(a.out)


if __name__ == "__main__":
    main()
