"""Tile images into one review sheet, each labelled with its index. Usage: montage.py OUT H IMG [IMG ...]"""
import sys
from PIL import Image, ImageDraw

out, h, paths = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
ims = [Image.open(p).convert("RGB") for p in paths]
ims = [im.resize((round(im.width * h / im.height), h)) for im in ims]
rows, row, w = [], [], 0
for im in ims:
    if row and w + im.width > 2000:
        rows.append(row); row, w = [], 0
    row.append(im); w += im.width
rows.append(row)
sheet = Image.new("RGB", (max(sum(i.width for i in r) for r in rows), h * len(rows)), "white")
k = 0
for j, r in enumerate(rows):
    x = 0
    for im in r:
        sheet.paste(im, (x, j * h))
        ImageDraw.Draw(sheet).rectangle((x, j * h, x + 22, j * h + 18), fill="black")
        ImageDraw.Draw(sheet).text((x + 5, j * h + 3), str(k), fill="yellow")
        x += im.width; k += 1
sheet.save(out, quality=85)
