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

## Domain rules found mid-build
- The souvenir map has 3 panels. Ste-Hélène and Notre-Dame share one geometry. Cité du Havre is drawn displaced.
- Building art is slightly oblique, so the drawn roof sits north-west of the true footprint in map terms. Weight building GCPs lower than ground-level ones.
- Notre-Dame was reshaped after 1967 (Olympic basin, beach). Its modern shoreline is not a control.
- Map legend: 300-series = Ste-Hélène, 400-series = Notre-Dame, 500-series = La Ronde, 200-series = Cité du Havre.
- The souvenir map's error is about 20 m per point and is not smooth. More fitting won't fix it. Accuracy has to come from a better source (aerials or blueprint).
- Map sizes are exaggerated by up to 1.7× (USSR, Katimavik). Take only positions from the map.
- A surviving building inside the same drawn complex is a better local anchor than the site-wide fit.

## Review
- Done: steps 1, 3 and 4. Step 2 is blocked by an external server outage and a paywall.
- Position error for demolished pavilions is 20–35 m. Better sources are the only real fix.
- Next: the aerials when the server is back, tiled map texture, then the next pavilion batch.
