# Expo 67 model: build plan

## Step 1: Georeferencing
- [x] Souvenir map, OSM reference, affine per panel (islands 17 m, havre 29 m RMS)
- [x] Add more GCPs: 121 automatic shore points (Ste-Hélène, Cité river side) + Port of Montréal building
- [x] Thin-plate-spline warp with smoothing, chosen by leave-one-out cross-validation against affine. Result: TPS lost (23–31 m vs affine 22 m held-out error). Kept affine.
- [x] Mask the legend text off the water (water is transparent, label boxes masked)

## Step 2: Better sources
- [ ] Données Québec 1966 aerial photos: check coverage and format, then fetch the island frames
- [ ] LAC 1967 blueprint: check whether a free scan exists (amdigital is paywalled)

## Step 3: First five pavilions (procedural three.js)
- [ ] US / Biosphère (358)
- [ ] USSR (479)
- [ ] France / Casino (425)
- [ ] Canada / Katimavik (406)
- [ ] Habitat 67

## Step 4: Hexagon pavilions (stretch goal)
- [ ] Man the Explorer complex (320, plus 330 DuPont auditorium), truncated-tetrahedron frame
- [ ] Man the Producer (440)

## Domain rules found mid-build
- The souvenir map has 3 panels. Ste-Hélène and Notre-Dame share one geometry. Cité du Havre is drawn displaced.
- Building art is slightly oblique, so the drawn roof sits north-west of the true footprint in map terms. Weight building GCPs lower than ground-level ones.
- Notre-Dame was reshaped after 1967 (Olympic basin, beach). Its modern shoreline is not a control.
- Map legend: 300-series = Ste-Hélène, 400-series = Notre-Dame, 500-series = La Ronde, 200-series = Cité du Havre.
- The souvenir map's error is about 20 m per point and is not smooth. More fitting won't fix it. Accuracy has to come from a better source (aerials or blueprint).
