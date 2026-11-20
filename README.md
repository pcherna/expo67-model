# Expo 67 model

A 3D rendition of the Expo 67 site in Montréal, served in the browser with three.js.

![pilot view](docs/pilot-view.png)

## Status

- **Georeferencing:** the 1967 souvenir map is warped onto a metric frame. Held-out error is about 22 m on the islands and about 36 m on Cité du Havre (see findings below).
- **Pavilions:** 127 buildings across the whole site.
  - 10 dedicated procedural models: the pilot five (US, USSR, France, Canada/Katimavik, Habitat 67), the People Tree, and the hexagon theme pavilions (Man the Explorer, Man the Producer).
  - 117 generic massing models: footprints traced from the souvenir map (or modern OSM for survivors), roof colour sampled from the map, height from sources where found and otherwise from a size class. Special shapes: Germany's Frei Otto tent (8 masts, 14–38 m), Ontario's tent, the Gyrotron pyramid and volcano, and Erickson/Massey's timber hex pyramids (Man in the Community, 140 ft).
  - Click any building in the viewer to see its name and where its data came from.
- **Expo Express:** 3.6 km of the line traced from the map, with bridges, piers, four stations and moving trains. The stretch along Île Notre-Dame between station 433 and the Expo Express bridge is outside the drawn map, so it is a gap.
- **Trees:** about 13,000 trees, placed where the map draws tree crowns, rendered as two instanced meshes.
- **Better sources:** blocked. See "Known gaps".

| Model | Map no. | Position from | Size from |
|---|---|---|---|
| US (Biosphère) | 358 | modern footprint | sourced: 76 m diameter, 62 m high; frame depth and platforms estimated |
| USSR | 479 | souvenir map | roof area sourced (about 9,300 m²); length, width and heights estimated |
| France (Casino) | 425 | circle fit to the round part of the modern footprint, which agrees with the map within 8 m | round plan from the footprint arc (r = 36 m); storeys and height sourced; fins estimated |
| Canada / Katimavik | 406 | souvenir map, corrected locally against the surviving Pavillon du Canada | top 58.5 m square and 31 m high, sourced; base estimated |
| People Tree | 406 | as Katimavik | 18.3 m, sourced |
| Habitat 67 | – | modern footprint | module size, 12 storeys and 354 modules sourced; stacking pattern generated (360 modules) |
| Man the Explorer (3 buildings) | 320 | souvenir map | truncated-tetrahedron system sourced; all sizes estimated |
| Man the Producer | 440 | souvenir map | as Man the Explorer |

Every dimension sits in a `DIMS` block at the top of its builder in `web/src/pavilions/`. Each value is marked sourced or estimated. The research behind them is in `docs/research/pavilions.md`.

## Serving it

```sh
cd web && npm run build      # static site in web/dist (about 3.4 MB)
```

Upload `web/dist` to any static host (GitHub Pages, Netlify, S3, a plain web server). Asset paths are relative, so it works from a subpath too. Touch devices get a lighter mode automatically (pixel ratio 1, smaller shadow map, no tree shadows). Add `?q=low` or `?q=high` to force a mode.

Attribution required when publishing: souvenir map CC BY 2.5 CA (Compagnie canadienne de l'Exposition internationale de 1967), OpenStreetMap (ODbL). See `sources/SOURCES.md`.

## Coordinate frame

The frame is NAD83 / MTM zone 8 (EPSG:32188, the City of Montréal's grid), shifted to a local origin at E 302000, N 5040000. Units are metres, +x is east and +y is north. In three.js, local (x, y) becomes (x, 0, −y). See `tools/common.py`.

## Layout

```
sources/        raw inputs (see sources/SOURCES.md for licences)
data/osm/       Overpass dumps + derived reference.geojson (local metres)
data/georef/    gcps.json (hand-picked control points), transforms.json, QA overlays
tools/          Python pipeline
web/            Vite + three.js viewer; web/public/ holds generated assets
```

## Pipeline

```sh
python3 -m venv .venv && .venv/bin/pip install -r requirements.txt
.venv/bin/python tools/osm_reference.py     # OSM -> reference.geojson + reference.png
.venv/bin/python tools/georef_fit.py        # fit per-panel transforms, print residuals
.venv/bin/python tools/georef_warp.py --mpp 1.0   # warp panels, write QA overlays + web textures
.venv/bin/python tools/georef_shore_gcps.py # optional: regenerate automatic shoreline GCPs, then refit + rewarp
.venv/bin/python tools/export_landmarks.py  # surviving-building footprints for the viewer
.venv/bin/python tools/export_pavilions.py  # data/pavilions/placements.json -> web/public/data/pavilions.json
.venv/bin/python tools/export_generic.py    # data/pavilions/generic.json -> web/public/data/generic.json (run after export_pavilions)
.venv/bin/python tools/export_transit.py    # data/transit/lines.json -> web/public/data/transit.json
.venv/bin/python tools/export_trees.py      # tree crowns on the warped map -> web/public/data/trees.json (run after export_generic)
cd web && npm install && npm run dev       # /?view=<id> or /?view=no<map number>, e.g. /?view=ussr, /?view=no454
```

To add a control point:
1. Run `tools/crop_grid.py` on the map to read the pixel position.
2. Add the point to `data/georef/gcps.json`.
3. Rerun the fit and warp scripts.
4. Check `data/georef/*_overlay.jpg`. The red lines are modern shores and the magenta shapes are modern buildings.

## Georeferencing findings

- The souvenir map is a near-planimetric illustration at about 2 px/m. Buildings are drawn slightly oblique, and sizes are exaggerated by up to 1.7×. Take only positions from the map. Take sizes from published data.
- **Sainte-Hélène and Notre-Dame** share one geometry. **Cité du Havre** is a separate, displaced panel with its own transform.
- I tested a thin-plate-spline warp against affine using leave-one-out cross-validation. The spline lost: 23–31 m held-out error against 22 m for affine. The map's error is about 20 m per point and isn't smooth, so no warp can remove it. Better accuracy has to come from a better source.
- Automatic shoreline control points (121 of them) come from places where the shore is unchanged since 1967: Sainte-Hélène and Cité du Havre's river side. Notre-Dame was reshaped for 1976, so its modern shore is not used.
- Local anchors beat the site-wide fit. Examples: Katimavik is corrected against the surviving Pavillon du Canada, and France is placed by the arc of its surviving footprint.

## Known gaps

- **Better sources are blocked.**
  - The City of Montréal's 1966 and 1969 aerial photos (open data, CC BY-NC-SA) list fine, but every image returns HTTP 403 "site en maintenance". Retry later. The 1969 set is the best target, because most pavilions still stood then.
  - The LAC 1967 site blueprint and plans are only on the subscription World's Fairs database (Adam Matthew). An institutional login or a direct LAC reproduction request is needed.
- **Position accuracy for demolished pavilions is about 20–35 m** until aerials are georeferenced.
- **Many dimensions are estimates:** all USSR sizes except roof area, all theme-pavilion sizes, Katimavik's base, and France's fins. The research file lists archive sources (CCA fonds, Bellat's book) that would settle them.
- **Generic massing is rough.** Footprints are traced by eye from an illustration (sizes there can be exaggerated). Most heights are a size class, not a source. Legend matches marked "(?)" in the fly-to list are uncertain.
- **Minirail not modelled.** On this map it is drawn with the same ink weight as road edges, so it can't be traced reliably at junctions. It needs a clearer source, such as the aerials or a route diagram.
- **Not yet modelled:** La Ronde's rides beyond the Gyrotron, and terrain. Smaller service buildings and kiosks are left out. (Canals and lagoons already show as water, because the map's water is transparent.)
- **Scene weight:** about 1.2 M triangles per frame including the shadow pass. Fine on desktop. Not yet tested on phones.
