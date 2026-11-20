"""Run VGGT on a set of images: cameras, depth maps and a coloured point cloud.

Runs under the VGGT venv (data/pilot/vggt/.venv), not the project venv.
Usage: data/pilot/vggt/.venv/bin/python tools/pilot/vggt_run.py OUT_DIR IMG [IMG ...]
Writes OUT_DIR/recon.npz (points world, colours, conf, extrinsic 3x4 cam-from-world, intrinsic 3x3,
image size) and OUT_DIR/points.ply (points above the 50th confidence percentile).
Weights: facebook/VGGT-1B (CC BY-NC 4.0), loaded from data/pilot/vggt/weights/.
"""
import sys
import time
from pathlib import Path

import numpy as np
import torch
from safetensors.torch import load_file
from vggt.models.vggt import VGGT
from vggt.utils.geometry import unproject_depth_map_to_point_map
from vggt.utils.load_fn import load_and_preprocess_images
from vggt.utils.pose_enc import pose_encoding_to_extri_intri

ROOT = Path(__file__).resolve().parents[2]
WEIGHTS = ROOT / "data" / "pilot" / "vggt" / "weights" / "model.safetensors"


def write_ply(path, pts, rgb):
    with open(path, "wb") as f:
        f.write(f"ply\nformat binary_little_endian 1.0\nelement vertex {len(pts)}\n"
                "property float x\nproperty float y\nproperty float z\n"
                "property uchar red\nproperty uchar green\nproperty uchar blue\nend_header\n".encode())
        rec = np.zeros(len(pts), dtype=[("p", "<f4", 3), ("c", "u1", 3)])
        rec["p"] = pts
        rec["c"] = rgb
        f.write(rec.tobytes())


def main():
    out = Path(sys.argv[1])
    imgs = sys.argv[2:]
    out.mkdir(parents=True, exist_ok=True)
    device = "mps" if torch.backends.mps.is_available() else "cpu"
    t = time.time()
    model = VGGT()
    model.load_state_dict(load_file(str(WEIGHTS)))
    model.eval().to(device)
    images = load_and_preprocess_images(imgs, mode="pad").to(device)
    with torch.no_grad():
        pred = model(images)
    extr, intr = pose_encoding_to_extri_intri(pred["pose_enc"], images.shape[-2:])
    depth = pred["depth"].squeeze(0).cpu().numpy()
    conf = pred["depth_conf"].squeeze(0).cpu().numpy()
    extr = extr.squeeze(0).cpu().numpy()
    intr = intr.squeeze(0).cpu().numpy()
    pts = unproject_depth_map_to_point_map(depth, extr, intr)  # (S, H, W, 3)
    rgb = (images.permute(0, 2, 3, 1).cpu().numpy() * 255).astype(np.uint8)
    np.savez_compressed(out / "recon.npz", points=pts.astype(np.float32), rgb=rgb, conf=conf.astype(np.float32),
                        extrinsic=extr, intrinsic=intr, size=np.array(images.shape[-2:]), images=np.array(imgs))
    keep = (conf > np.percentile(conf, 50)) & (rgb.sum(-1) > 0)  # pad pixels are black
    write_ply(out / "points.ply", pts[keep], rgb[keep])
    print(f"{len(imgs)} images, {keep.sum()} points kept, {time.time() - t:.0f} s on {device} -> {out}")
    for i, (e, k) in enumerate(zip(extr, intr)):
        c = -e[:, :3].T @ e[:, 3]
        print(f"  cam {i}: centre {np.round(c, 3)}, f {k[0, 0]:.0f}px, conf median {np.median(conf[i]):.2f}  {Path(imgs[i]).name}")


if __name__ == "__main__":
    main()
