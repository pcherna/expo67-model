# Pilot: 3D from 1967 photos and film

Run on 2026-11-20 on four buildings: Great Britain, the Netherlands, Czechoslovakia and the US pavilion (control). The question was whether to model the demolished pavilions automatically from photos and film, or by hand from measurements taken off photos.

## Result

Automatic reconstruction does not work for single buildings. Measuring from photos does, when the photo shows the base of the building and a known scale. Use measurement from photos to set heights, and keep the hand-built models.

The measured heights are now in `data/pavilions/generic.json`.

| Building | Usable photos | Usable film | Height now in model | Measured |
|---|---|---|---|---|
| Netherlands | 3 | 6 s, static | 12 m | tall block about 19 m, low block about 14.5 m (module count); 25 m and 19 m from people as scale |
| Czechoslovakia | 2 | none identified for certain | 12 m | about 17 m ± 4 m (one photo, people as scale) |
| Great Britain | 5 | about 170 s | 36.6 m block, 61 m tower (sourced) | not measurable: the base is hidden in every view |
| US (control) | not collected | about 160 s of exterior | dedicated model | VGGT gave no usable shape |

## What was tried

### Automatic reconstruction with VGGT

VGGT-1B ran on an M1 Max in 25 to 50 s per set. The sets were:

- Five Commons photos of Britain. Each photo became its own depth sheet, and the five did not line up. See `vggt-britain-photos.jpg`, where each colour is one photo.
- An elevated, moving shot past Britain (Impressions of Expo 67, 6:41 to 7:02). This set gave a coherent scene, with the canal, the Expo Express curve and the roofs in the right places. See `vggt-britain-film-pan.jpg`. The tower is only a few points thick, so the shot is useful for site layout but not for the building.
- A Minirail shot of the British tower. The confidence stayed at its floor, because the tower is far away against the sky.
- Two US pavilion shots. One is a zoom or a static camera with no movement, so VGGT had nothing to work from. The other shows only the edge of the sphere from a moving car.

The film search found shots of the four buildings in six films (see `film-shots.json`). Most shots are static or panned from one spot, and they cut every few seconds. Only a camera that moves sideways gives 3D, and only a few clips have that.

### Measuring heights from photos

`tools/pilot/metrology.py` measures heights from one photo with the method of Criminisi, Reid and Zisserman (2000). It needs the vertical vanishing point, the horizon and a reference of known height. On a synthetic scene with 1 px noise it gets 29.8 m for a 30 m box and 60.3 m for a 61 m tower.

The real photos added two problems:

- The base of the building must be visible and on the same ground as the reference. At Britain the terraces, the moat, the Minirail and the crowds hide the base in every view found.
- People are the usual reference, but at pavilion distance they are 10 to 20 px tall. One pixel of error is 5 to 10 % of the height.

The Netherlands had a better scale. Its lattice is built of 3-foot (0.914 m) cubes, according to the [EGM project page](https://egm.nl/en/architects/projects/dutch-pavilion-world-expo-1967/). The lattice repeats every 10.5 px in the photo, so counting modules gives the height directly. The people-based estimate is 30 % higher, which shows how weak people are as a reference at this distance.

## Coverage is the real limit

Britain and the US pavilion were filmed a lot. The Netherlands appears in one 6 s shot, and no film shot of Czechoslovakia could be identified for certain. Most of the 116 generic pavilions will look like the Netherlands or worse. A pavilion-by-pavilion plan therefore depends on the archives (LAC, Archives de Montréal, CCA), not on the web.

## Recommendation

1. Measure heights from photos, one pavilion at a time, where a photo shows the base. Prefer a scale on the building itself, such as a module, a storey or a door, over people.
2. Skip VGGT for single buildings. Keep it for elevated moving shots, which can check the site layout against the map.
3. Ask LAC and the Archives de Montréal for their Expo 67 photo series before scaling up. Commons has only 2 to 5 photos per pavilion.

## Notes for running it again

- The VGGT weights (4.7 GB) were deleted after the pilot. The code and its virtual environment are still in `data/pilot/vggt/`. To restore the weights, download `model.safetensors` from `facebook/VGGT-1B` on Hugging Face into `data/pilot/vggt/weights/`.
- VGGT runs on Apple silicon (MPS) in float32 without changes. A set of 5 to 22 images takes 25 to 50 s on an M1 Max.
- The VGGT depth confidence never goes below 1. A median of 1.0 with a 90th percentile near 1 means the model found no usable geometry.
- Mask the sky before looking at a point cloud. Blue sky gets depth too, and it hides the building.
- Colour the points by source image to see whether the images agree. One fan of points per image means the reconstruction failed.
- The Wikimedia Commons API returns HTTP 429 to fast clients. Wait between calls, and send a User-Agent when downloading files.
- When asking a subagent to find a building in film, describe it from a photo first. The first brief called the British main block dark, but it is white.

## Files

- `tools/pilot/vggt_run.py` and `render_cloud.py` run VGGT and render the point clouds.
- `tools/pilot/lines.py` and `metrology.py` detect edges, make grids for picking points and solve heights.
- `data/pilot/SOURCES.md` lists the photos and films and their licences.
