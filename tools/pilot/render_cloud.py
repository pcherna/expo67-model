"""Render a VGGT reconstruction (recon.npz) to a review sheet: input views re-projected plus orbit views.

Point splatting with a z-buffer, numpy only. Points are filtered by confidence percentile.
Usage: python tools/pilot/render_cloud.py RECON_DIR [--conf 50] [--frames 0,1,..]
Writes RECON_DIR/review.jpg: top row = orbit views around the cloud's centre; row 2 = top-down and side.
"""
import argparse
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

W, H = 640, 480


def look_at(eye, target, up=np.array([0.0, -1.0, 0.0])):
    """OpenCV-style cam-from-world (x right, y down, z forward)."""
    z = target - eye
    z /= np.linalg.norm(z)
    x = np.cross(z, up)  # with y down: right = forward x down... use up=-y (OpenCV world from VGGT is y-down)
    if np.linalg.norm(x) < 1e-6:
        x = np.cross(z, np.array([1.0, 0, 0]))
    x /= np.linalg.norm(x)
    y = np.cross(z, x)
    R = np.stack([x, y, z])
    return R, -R @ eye


def splat(pts, rgb, R, t, f, size=2):
    pc = pts @ R.T + t
    ok = pc[:, 2] > 1e-3
    pc, c = pc[ok], rgb[ok]
    u = (f * pc[:, 0] / pc[:, 2] + W / 2).astype(int)
    v = (f * pc[:, 1] / pc[:, 2] + H / 2).astype(int)
    img = np.full((H, W, 3), 255, np.uint8)
    zb = np.full((H, W), np.inf)
    order = np.argsort(-pc[:, 2])  # far to near, near overwrites
    for dx in range(size):
        for dy in range(size):
            uu, vv = u[order] + dx, v[order] + dy
            m = (uu >= 0) & (uu < W) & (vv >= 0) & (vv < H)
            img[vv[m], uu[m]] = c[order][m]
            zb[vv[m], uu[m]] = np.minimum(zb[vv[m], uu[m]], pc[order][m, 2])
    return Image.fromarray(img)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("recon")
    ap.add_argument("--conf", type=float, default=50)
    ap.add_argument("--frames", default="")
    ap.add_argument("--bycam", action="store_true", help="colour points by source image")
    a = ap.parse_args()
    d = np.load(Path(a.recon) / "recon.npz")
    pts, rgb, conf, E = d["points"], d["rgb"], d["conf"], d["extrinsic"]
    sel = [int(i) for i in a.frames.split(",")] if a.frames else range(len(pts))
    pal = np.array([[230, 25, 75], [60, 180, 75], [0, 130, 200], [245, 130, 48], [145, 30, 180], [70, 240, 240],
                    [240, 50, 230], [128, 128, 0], [0, 0, 128], [170, 110, 40]], np.uint8)
    keep = []
    for i in sel:
        r, g, b = (rgb[i][..., k].astype(int) for k in range(3))
        sky = (b > r + 25) & (b > 140)  # clear blue sky: drop it, it has no usable depth
        keep.append((conf[i] > np.percentile(conf[i], a.conf)) & (rgb[i].sum(-1) > 0) & ~sky)
    P = np.concatenate([pts[i][k] for i, k in zip(sel, keep)])
    C = np.concatenate([np.broadcast_to(pal[j % 10], (k.sum(), 3)) if a.bycam else rgb[i][k] for j, (i, k) in enumerate(zip(sel, keep))])
    centres = np.array([-e[:, :3].T @ e[:, 3] for e in E])
    # scene centre: median of points; scale: spread
    ctr = np.median(P, axis=0)
    rad = np.percentile(np.linalg.norm(P - ctr, axis=1), 90)
    # "up" in the VGGT frame: average camera up vector (-y of each camera)
    up = -np.mean([e[1, :3] for e in E], axis=0)
    up /= np.linalg.norm(up)
    fwd = np.mean([e[2, :3] for e in E], axis=0)
    fwd -= up * (fwd @ up)
    fwd /= np.linalg.norm(fwd)
    side = np.cross(up, fwd)
    tiles = []
    for ang in (-60, -20, 20, 60):
        th = np.radians(ang)
        dirn = np.cos(th) * fwd + np.sin(th) * side
        eye = ctr - dirn * rad * 2.2 + up * rad * 0.5
        R, t = look_at(eye, ctr, up=-up)
        tiles.append((f"orbit {ang:+d}", splat(P, C, R, t, 500)))
    R, t = look_at(ctr + up * rad * 3, ctr, up=-fwd)
    top = splat(P, C, R, t, 500)
    dr = ImageDraw.Draw(top)
    for i, c in enumerate(centres):  # camera centres in top view
        pc = R @ c + t
        if pc[2] > 0:
            x, y = 500 * pc[0] / pc[2] + W / 2, 500 * pc[1] / pc[2] + H / 2
            dr.ellipse((x - 5, y - 5, x + 5, y + 5), fill="red")
            dr.text((x + 7, y - 6), str(i), fill="red")
    tiles.append(("top (red = cameras)", top))
    R, t = look_at(ctr + side * rad * 2.5, ctr, up=-up)
    tiles.append(("side", splat(P, C, R, t, 500)))
    sheet = Image.new("RGB", (W * 3, H * 2), "white")
    for k, (lab, im) in enumerate(tiles):
        ImageDraw.Draw(im).text((6, 6), lab, fill="black")
        sheet.paste(im, ((k % 3) * W, (k // 3) * H))
    sheet.save(Path(a.recon) / "review.jpg", quality=85)
    print(f"{len(P)} points, radius {rad:.3f} -> {Path(a.recon) / 'review.jpg'}")


if __name__ == "__main__":
    main()
