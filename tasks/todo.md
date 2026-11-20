# Expo 67 model: build plan

## Step 1: Georeferencing
- [x] Souvenir map, OSM reference, affine per panel (islands 17 m, havre 29 m RMS)
- [x] Add more GCPs: 121 automatic shore points (Ste-Hélène, Cité river side) + Port of Montréal building
- [x] Thin-plate-spline warp with smoothing, chosen by leave-one-out cross-validation against affine. Result: TPS lost (23–31 m vs affine 22 m held-out error). Kept affine.
- [x] Mask the legend text off the water (water is transparent, label boxes masked)

## Step 2: Better sources
- [ ] Données Québec aerials: index CSVs fetched (sources/aerials/). Every image returns HTTP 403 "maintenance". Retry; 1969 is the best target.
- [ ] LAC 1967 blueprint: only on the paywalled Adam Matthew database. Needs the user's access or a LAC reproduction request.

## Step 3: First five pavilions (procedural three.js)
- [x] US / Biosphère (358): 16-frequency double-layer frame, skin, platforms, escalator
- [x] USSR (479): ski-jump roof, leaning glass wall, V frames, mezzanines (dimensions mostly estimated)
- [x] France / Casino (425): placed by circle fit to the surviving footprint; fin bands
- [x] Canada / Katimavik (406) + People Tree, locally anchored to the surviving Pavillon du Canada
- [x] Habitat 67: 360 procedural modules in the OSM footprint (target 354)

## Step 4: Hexagon pavilions (stretch goal)
- [x] Man the Explorer (320): 3 hexagonal halls with a truncated-tetrahedron lattice. DuPont auditorium (330) not modelled.
- [x] Man the Producer (440): 3 sections

## Step 5: Whole-site coverage
- [x] Map texture at 0.5 m/px in 2048 px tiles
- [x] Legend OCR (tesseract) for names; 117 generic footprints traced or taken from OSM
- [x] Special generic kinds: tent (Germany, Ontario), pyramid/cone (Gyrotron), hex timber pyramid (Man in the Community)
- [x] Click-to-identify with provenance; ?view=no<number>
- [x] Expo Express (3.6 km traced; Notre-Dame link is a gap)
- [x] Trees from map crowns (13k, instanced)
- [ ] Minirail: blocked. Ambiguous on the souvenir map; needs aerials or a route diagram.
- [x] Low-quality mode for touch devices; relative asset paths; production build verified (3.4 MB)
- [x] Canals and lagoons as water (transparent map water)

## Step 6: Shapes and heights from 1967 photos and film (pilot, 2026-11-20)
- [x] Collect sources: 10 Commons photos (CC BY-SA), 6 Internet Archive films, film shot index (docs/pilot/film-shots.json)
- [x] VGGT on photos and film clips: fails for single buildings. Works for elevated moving shots, for layout only. Weights deleted afterwards.
- [x] Single-view height tool (tools/pilot/metrology.py), checked on a synthetic scene
- [x] Netherlands 19 m (module count) and Czechoslovakia 17 m (people as scale) written to data/pavilions/generic.json
- [ ] Britain: no view with a visible base. Retry with archive photos.
- [ ] Send the archive requests in docs/archive-requests.md (user)
- [ ] When archive photos arrive: measure heights pavilion by pavilion, largest pavilions first

## Domain rules found mid-build
- The souvenir map has 3 panels. Ste-Hélène and Notre-Dame share one geometry. Cité du Havre is drawn displaced.
- Building art is slightly oblique, so the drawn roof sits north-west of the true footprint in map terms. Weight building GCPs lower than ground-level ones.
- Notre-Dame was reshaped after 1967 (Olympic basin, beach). Its modern shoreline is not a control.
- Map legend: 300-series = Ste-Hélène, 400-series = Notre-Dame, 500-series = La Ronde, 200-series = Cité du Havre.
- The souvenir map's error is about 20 m per point and is not smooth. More fitting won't fix it. Accuracy has to come from a better source (aerials or blueprint).
- Map sizes are exaggerated by up to 1.7× (USSR, Katimavik). Take only positions from the map.
- A surviving building inside the same drawn complex is a better local anchor than the site-wide fit.
- A height measured from a photo needs the base of the building in view, on the same ground as the reference.
- Prefer a scale on the building (façade module, storey, door) over people. At pavilion distance a person is 10–20 px, so 1 px is 5–10 % of the height.
- Film helps 3D only when the camera moves sideways. Static shots, pans from one spot and zooms give nothing.
- The British pavilion's main block is white. It only looks dark where it is in shadow.
- Only the 1967 newsreel among the films has a clear licence. Measure from the others, but don't publish their frames.

## Review
- Done: steps 1, 3 and 4. Step 2 is blocked by an external server outage and a paywall.
- Position error for demolished pavilions is 20–35 m. Better sources are the only real fix.
- Next: the aerials when the server is back, tiled map texture, then the next pavilion batch.
- Photo pilot (step 6): measuring from photos works where a base is visible. Automatic reconstruction does not. Coverage on the web is thin, so the archive requests are the next real step.
