# Expo 67 pavilions: geometric facts for massing models

Research date: 2026-11-19. Scope: geometry, size and materials only.

## Conventions

- Units: every figure keeps its source units, then gives metres. 1 ft = 0.3048 m. 1 sq ft = 0.0929 m².
- Confidence tags:
  - **[A]** primary or authoritative source (archive, architect, engineer, encyclopedia).
  - **[B]** reputable secondary source (museum site, trade press, FAO).
  - **[W]** Wikipedia or a fan/blog site only.
  - **[S]** seen only in a search-engine summary. The page itself was not opened or did not load. Verify before use.
- "Not found" means no source gave the number. "Estimate from photos" is labelled as such and is not a sourced fact.
- Commons photo links resolve as `https://commons.wikimedia.org/wiki/File:<name>`.

## General gaps

No official 1967 technical sheet was reachable online for any pavilion. The best offline sources are:
- CCA, May Cutler collection: "Description of the Pavilion of the Soviet Union", ARCH260635 (text not online).
- CCA, Affleck Desbarats Dimakopoulos Lebensold Sise fonds: theme pavilions file 410075 (drawings, not online).
- CCA, Roderick Robbie fonds: Katimavik drawings.
- World's Fairs (Adam Matthew) RG71 1984-85/031/138: USSR technical drawings and model photos (subscription).
- Book: Fabien Bellat, *CCCP'67: un monument à la guerre froide* (B2, 2018).
- Book: N. O. Podgorskaya, *Павильоны СССР на международных выставках* (2013).

---

## 1. United States pavilion (map 358, Île Sainte-Hélène), now the Biosphère

Designers: R. Buckminster Fuller and Shoji Sadao (Fuller & Sadao, with Geometrics Inc.). Interior platforms and exhibits by Cambridge Seven Associates. Structural engineers: Simpson Gumpertz & Heger.

### Dimensions

- Diameter: 250 ft = 76 m. **[A]** SGH ("250 ft dia."), plus Wikipedia, ArchEyes, Westland. A 1967 trade caption says 275 ft (83.8 m). Treat 275 ft as an error.
- Height: 62 m (203 ft) per Wikipedia and ArchEyes **[W/B]**. Westland says "two hundred feet high (20 stories)" = 61 m. Some sites give 61 m. Use **62 m**.
- Sphere fraction: "three-quarter sphere" **[W/B]** (Wikipedia, Westland, Cabinet magazine).
  - Geometric check: a 76 m sphere (R = 38 m) cut 62 m above its base has its cut plane 24 m below the centre. That is 0.816 of the diameter, or about 0.82 of the sphere's height. Use this as the truncation for modelling.
- Frame: double-layer space frame.
  - Outer layer is triangles. Inner layer is hexagons. The layers are joined by diagonal struts. Westland: "a triangle on the outside, hexagonal on the inside, and curved to fit a given arc" **[W]**. ArchEyes: "double-layer lattice of steel tubes arranged in triangles and hexagons" **[B]**.
  - One secondary source reverses this: outer triangles plus hexagons, inner hexagons **[S]**. The triangle-outside, hexagon-inside reading has more support.
- Members: hollow tubular steel with varying wall thickness. Thinner walls are in the upper dome. Joints are welded cast-steel hubs. **[A]** SGH.
- Tube diameter: 3 in = 7.6 cm, "welded at the joints" **[S]** (blog-level source).
- Member count: "24,000 steel bars" per the BIE blog **[S]** (page returned 403).
- Grid frequency: outer layer is a Class I, 16-frequency icosahedron. Inner layer is a 32-frequency Class II icosahedron. **[W]** This comes only from a user-uploaded SketchUp 3D Warehouse model description. Unverified.
  - Derived: a 16-frequency grid on R = 38 m gives outer triangle edges of about 2.6 m.
- Layer depth (outer to inner layer): **not found**.
- Acrylic skin: about 1,900 moulded acrylic panels **[S]** (two secondary sources, no primary source).
  - The panels were curved "bubbles", one per outer triangle cell.
  - Triangular, motorised sun shades sat inside the skin and were adjusted every 20 minutes **[A]** SGH. The shade system later failed and was disabled **[W]**.
- The skin burned on 20 May 1976. The steel frame survives without a skin today.
- Interior: "four themed platforms divided into seven levels" **[W]**. Another source says "six levels of exhibits, connected by escalators" **[S]**. Cambridge Seven's platforms were four freestanding structures **[B]** (2016 journal abstract).
  - Platform heights: **not found**.
  - Westland's top-down order: a Space Observation Deck at the highest platform, then an Apollo command module level, then a paintings level (works 7 to 56 ft long), then a film-star photos level. The ground floor held a three-screen theatre.
- Long escalator: 37 m (121 ft), "longest ever built at the time" **[W]**, citing a British Pathé newsreel. Another figure is 41 m (135 ft), "longest unsupported escalator in the world" **[W]**, citing *Montreal Star*, 28 Apr 1967. Both may be correct for different flights.
  - Escalator angle: **not found**. Standard escalators of the period rose at 30°, so a 37 m run would rise about 18.5 m. This is an assumption, not a source.
- Minirail: the train ran through the dome **[W/B]**. Westland says the first escalator carried visitors "upwards from the entrance, past Minirail tracks that cut through the pavilion".
  - Minirail entry height: **not found**. RIBApix photo RIBA23255, "the Minirail emerging from the dome", shows the entry point.

### Form for a modeller

Model a sphere of R = 38 m, cut by a horizontal plane 24 m below the centre, standing on a low ring base. Build two concentric geodesic shells: an outer triangulated icosahedral grid and an inner hexagonal grid. Join them with diagonal struts. Optionally fill each outer triangle with a slightly domed translucent acrylic panel. Inside, place 4 freestanding steel-deck platforms at staggered heights up to about 2/3 of the dome height. Add a long straight escalator rising toward the top platform. A minirail beam passes through the shell at low level.

### Colours and materials

- Frame: steel, painted. Period photos read white to light grey.
- Skin (1967): clear acrylic. Westland: "exquisitely tinted". The tint colour was not found.
- Shades: triangular, silvery or aluminised (from photos).

### Confidence

Diameter and height are solid. The layer pattern has only medium support, and the frequency is weak. Panel count, layer depth, platform heights and minirail height are weak or not found.

### Sources used

- https://en.wikipedia.org/wiki/Montreal_Biosphere
- https://www.sgh.com/?p=7021 (Simpson Gumpertz & Heger project page)
- https://archeyes.com/montreal-biosphere-1967-buckminster-fuller/
- https://www.westland.net/expo67/map-docs/unitedstates.htm
- https://www.westland.net/expo67/map-docs/architecture.htm
- https://www.cabinetmagazine.org/issues/32/wolcott.php
- https://embed-3dwarehouse-classic.sketchup.com/model/68f0c311f64503e4bb8627f7da72a40a/Biosphere-Montreal-Geodesic-Dome (frequency claim only)
- https://www.newsteelconstruction.com/wp/40-years-ago-digital-computer-reduces-design-time-for-the-british-pavilion-at-montreal/ (275 ft caption)

### Reference photos

- RIBApix RIBA23255, Minirail emerging from the dome: https://www.architecture.com/image-library/RIBApix/licensed-image/poster/united-states-pavilion-ile-sainte-helene-expo-67-montreal-the-minirail-emerging-from-the-dome/posterid/RIBA23255.html
- RIBApix RIBA23239, theme pavilion with US dome: https://www.ribapix.com/theme-pavilions-ile-sainte-helene-expo-67-montreal-man-the-explorer-pavilion-on-the-left-the-united-states-pavilion-with-the-scandinavian-pavilion-on-the-right_riba23239
- Expo67.museum, US pavilion and minirail: https://www.expo67.museum/en/?p=17360
- Henry Ford Museum, Fuller's dome model: https://www.thehenryford.org/collections-and-research/digital-collections/artifact/361692
- Commons, current frame: `File:17-08-islcanus-RalfR-DSC 3883.jpg`, `File:Biosphere - Panorama.jpg`, `File:201708 Biosphere Montreal 01.jpg`
- Commons, Expo-era view with theme pavilion: `File:Expo 67, île sainte-Hélène, pavillons du Téléphone, des États-Unis, pavillon thématique L'homme interroge l'univers, la Scandinavie.jpg`

---

## 2. USSR pavilion (map 479, Île Notre-Dame)

Architects: M. V. Posokhin, A. A. Mndoyants and B. I. Tkhor. Engineer: A. Kondratiev. Consulting engineers: Beauchemin-Beaton-Lapointe. Aluminium supplier: Alcan. The steel frame was designed, fabricated and erected by Italian firms. The building was moved to VDNKh, Moscow (Pavilion No. 70) and re-erected from 1970 to 1977. It was dismantled in 2025.

### Dimensions

- Roof area: "100,000 ft² steel roof" = about 9,290 m² **[B/S]**. The source is a 1967 *Building with Steel* caption reprinted by New Steel Construction. Architectuul independently gives "approx. 1 ha" = 10,000 m² **[S]**.
- Length: **not found** as a stated building length.
  - The same 1967 caption says the roof sits "on 450 ft exposed vee-shaped steel supports" (137 m). This probably means the building or roof length, since no single support is 137 m long. If true, roof width ≈ 9,290 / 137 ≈ 68 m. **Derived estimate, low confidence.**
- Width: **not found**. See the derivation above.
- Height (Montreal): **not found**.
  - Moscow figures do not apply. During re-erection at VDNKh the roof was raised by "over three floors" **[W]** (Russian Wikipedia, expo67.museum).
- Roof form: a "ski-jump" or "upswept" roof **[W]** (Westland). Russian sources describe a large overhanging canopy (козырёк) above the entrance. The main glass façade wall leans forward, so the canopy cantilevers past it.
  - Cantilever length and rise: **not found**.
- Supports: "two gigantic V-shaped steel struts"; the roof is "supported in tension" **[B]** (Commentary, 1967). Westland describes "wide-angled V beams". Hidden Architecture says "two large V shape columns hold all the roof". Moscow city museum and Russian Wikipedia say "four powerful steel supports", inclined to form two letters "У".
  - **Reconciled reading:** two V or Y frames, each made of two inclined legs, for four legs in all. The roof hangs from them.
- Interior: column-free open plan **[W]**.
  - Three tiers **[B]** (expo67.museum): marine world and energy at the bottom, industry and agriculture in the middle, space at the top.
  - Westland: ground floor "above were two mezzanines", reached by escalators.
  - The mezzanine floors also hang from or bear on the V supports (um.mos.ru).
- Roof soffit: aluminium plates laid in a pattern meant to evoke the Tu-144 jet **[B]** (um.mos.ru, Russian Wikipedia).
- Walls: "great walls of glass and aluminum" **[W]**. The façade is fully glazed with no visible interruption **[W]**.
- Other: steel content "about as much as a 30-storey office block" **[B]** (Commentary, 1967). An 11 m Hammer-and-Sickle sculpture stood in front **[W]**.
- Orientation relative to the canal: **not found** in text. Use the souvenir map and the Commons aerials below.

### Form for a modeller

Start with a long rectangular glass box on a low podium (stylobate). Its long front wall leans outward. Above it, place one large thin roof slab. The slab is low at the rear and sweeps upward toward the front, where it oversails the leaning glass wall as a deep canopy. Carry the roof on two huge V- or Y-shaped steel frames, one near each end, standing outside the glass line. Inside, add two mezzanine decks above the ground floor. Rough massing **(estimate, see above)**: about 137 m × 68 m footprint. The roof underside is aluminium. The overall height is not sourced, so take it from photos.

### Colours and materials

- Roof: aluminium-clad, with a silver-grey upper surface and an aluminium-plate soffit.
- Walls: clear or grey-tinted glass in aluminium mullions.
- V supports: exposed steel. Photos suggest dark or grey paint (not sourced).

### Confidence

Low for all dimensions. The two independent area figures (about 9,300 m² and about 1 ha) agree, so area has medium confidence. The support topology has medium confidence: sources say "two V" or "four legs forming two Y", which are consistent.

### Sources used

- https://www.newsteelconstruction.com/wp/40-years-ago-digital-computer-reduces-design-time-for-the-british-pavilion-at-montreal/
- https://www.westland.net/expo67/map-docs/ussr.htm
- https://www.westland.net/expo67/map-docs/architecture.htm
- https://www.commentary.org/articles/neil-compton/expo-67/ (via search summary)
- https://hiddenarchitecture.net/expo-67-ussr-pavilion/
- https://um.mos.ru/houses/pavilon_70/ (Moscow city museum)
- https://ru.wikipedia.org/wiki/Павильон_№_70_«Москва»_на_ВДНХ
- https://www.expo67.museum/en/?p=19936
- https://www.cca.qc.ca/en/search/details/collection/object/423226 (catalogue record only)
- https://architectuul.com/architecture/expo-67-soviet-pavilion (403, search summary only)

### Reference photos

- Hidden Architecture gallery (CCA-credited photos): https://hiddenarchitecture.net/wp-content/uploads/2017/05/415681-1.jpg, https://hiddenarchitecture.net/wp-content/uploads/2017/05/415682.jpg, https://hiddenarchitecture.net/wp-content/uploads/2017/05/415680.jpg
- Commons: `File:Expo 67, pavillon de l'URSS.jpg`, `File:Expo67 USSR Pavilion 1.jpg`, `File:Expo 67, île Notre-Dame, pavillons Vénézuela, Éthiopie, Maroc, URSS.jpg` (oblique context)
- Commons category: https://commons.wikimedia.org/wiki/Category:USSR_Pavilion_(Expo_67)
- Moscow re-erection, for structure only (heights differ): https://commons.wikimedia.org/wiki/Category:VDNKh_Montreal_Pavilion_(No_70)

---

## 3. France pavilion (map 425, Île Notre-Dame), now the Casino de Montréal main building

Architects: Jean Faugeron (France) with André Blouin (Montréal). One source also credits André de Mot. Aluminium blades were designed by Gilles Aubertin and made by Raymond Manufacturing.

### Dimensions

- Floor area: 250,000 sq ft = about 23,200 m². This was "the largest building erected for Expo 67" **[B]** (Portail Constructo, citing Radio-Canada). Another online article gives "20,000 m² over seven levels" **[S]**.
- Levels: sources disagree. Use 8 to 9 storeys above ground.
  - "9 niveaux autour d'un vide central" **[W]** (French Wikipedia, uncited).
  - "nine storey structure" **[W]** (manchesterhistory.net).
  - "eight floors of art exhibits" **[S]** (BIE blog, which returned 403).
  - "7 floors (overground)" plus a roof terrace **[W/S]** (imtl.org; one 1967 account).
  - The casino today has "six étages" **[W]** (French Wikipedia, Casino de Montréal). This is the converted state.
- Height: "environ 100 pieds (32 mètres)" **[W]** (French Wikipedia, cited). Note that 100 ft is 30.5 m. Decorative masts and a steel spire rose above the roof. Their heights were not found.
  - A 1967 magazine says visitors at the top looked down at a fountain "190 ft. below" **[S]**. This likely includes the spire or terrace, or is an error. Not used.
- Plan: "circulaire" **[W]** (French Wikipedia, uncited). Photos show a rounded, fin-wrapped mass rather than a true circle. Footprint dimensions were **not found**.
- Central void: exhibition halls ring an open central atrium **[W]**. Xenakis's *Polytope* cables ran "from the first floor to the ceiling six floors above" **[W]**. So the atrium was about 6 storeys tall.
- Structure: steel and concrete frame. Steel construction was unusual in Montréal at the time **[B]**.

### The aluminium "fins"

- "Hundreds" of aluminium brise-soleil blades (lames) are fixed "tout autour du pavillon" **[B]** (Portail Constructo).
- They form a spiral ("spirale des lames") **[B]**.
- Wording elsewhere: "concrete and steel structure covered in glimmering aluminum fins" **[S]**; "a wall of aluminium blades, lit from inside, wrapped around a concrete frame" **[S]**.
- Modeller reading, from photos: thin, vertical-to-diagonal aluminium blades, closely spaced. They stand proud of each floor edge as continuous curving bands. The bands wrap the building in a rising spiral, so the outline reads as stacked, curved, louvred tiers. Blade size and spacing were **not found**.

### What changed for the Casino (so you can undo it)

- 1985 to 1992: the building was the Palais de la civilisation (museum). Exterior changes in this period were not found.
- 1993 conversion, led by Le Groupe Arcop for Loto-Québec. Opened 9 Oct 1993.
  - The interior was fully stripped and asbestos removed.
  - The structure was reinforced for seismic loads and casino loads.
  - **The original aluminium blades were preserved.** The design worked "from the outside in" **[B]** (Portail Constructo).
- The building was linked to the neighbouring Quebec pavilion. A third, new block was added **[W]**.
- 1994: first enlargement. 1996: second enlargement with a show hall (cabaret) **[W]**. imtl dates the Quebec pavilion integration to 1996.
- 2009 to 2013: CAD 300 M "revival" by Menkès Shooner Dagenais Letourneux with Provencher_Roy. Total area today is 45,000 m², across three buildings.
- **For a 1967 model:** remove the Quebec-pavilion link and the added blocks, keep the fin-wrapped tower, and restore the masts and spire. Whether the spire survives today was **not found**. Check current photos.

### Colours and materials

Natural or anodised silver aluminium blades over glazing and a concrete frame. The steel spire and masts read white or silver in photos.

### Confidence

Area: medium. Storey count: conflicting, use 8 to 9. Height: one cited Wikipedia figure only. Plan dimensions: not found.

### Sources used

- https://www.portailconstructo.com/infoconstructo/pavillon_france_lexpo_67_vestige_dune_grande_epoque_construction
- https://fr.wikipedia.org/wiki/Pavillon_de_la_France_(1967)
- https://fr.wikipedia.org/wiki/Casino_de_Montréal
- https://en.wikipedia.org/wiki/Polytope_de_Montr%C3%A9al
- https://imtl.org/montreal/building/casino_montreal.php
- https://manchesterhistory.net/architecture/1960/casino.html
- https://www.westland.net/expo67/map-docs/architecture.htm
- https://www.archdaily.com/493993/revival-of-the-casino-of-montreal-menkes-shooner-dagenais-letourneux-provencher-roy-architectes

### Reference photos

- Commons: `File:Expo 67, pavillon de la France.jpg`, `File:Expo 67, pavillon de la France (2).jpg`, `File:Pavillon de la France (2).jpg`
- Commons, oblique with neighbours: `File:Expo 67, île Notre-Dame, pavillons Grande-Bretagne, Haïti, France..jpg`
- Commons category: https://commons.wikimedia.org/wiki/Category:Pavillon_de_la_France
- Expo67.museum exterior photo: https://www.expo67.museum/en/document/photo-french-pavilion-exterior/
- Current casino, for the surviving fins: https://commons.wikimedia.org/wiki/Category:Casino_de_Montréal

---

## 4. Canada pavilion and Katimavik (map 406, Île Notre-Dame)

Architects: Ashworth, Robbie, Vaughan & Williams (Rod Robbie), with Schoeler, Barkham & Heaton and Z. Matthew Stankiewicz.

### Katimavik dimensions

- Top edge: "each of its 192 foot long sides" carried a promenade **[S]** (McGill Digital Library slide record; the page now redirects). 192 ft = **58.5 m square at the top.**
- Summit walkway: "a 768-foot walkway at its summit" **[A]** (CCA, Robbie fonds). 768 ft = 234 m = 4 × 192 ft. This confirms a 58.5 m square top perimeter.
- Height: "100-foot-high" **[B]** (Daily Commercial News, 2017) = 30.5 m. Westland: "top reaches 109 feet" = 33.2 m **[W]**. Wikipedia and CCA: "nine storey" **[A/W]**.
  - **Use 30.5 to 33 m to the top deck.**
- Base (bottom) size: **not found**.
- Height above ground of the inverted apex: **not found**.
- Supports: four columns **[W]** (Wikipedia, citing Miedema).
- Structure: about 1,000-ton (≈ 907 t) hollow steel frame **[W]**. Built of structural steel and laminated BC fir **[B]**. RIBApix caption: "the inverted pyramid in steel and plastic".
- "270,000-square-foot" (25,100 m²) **[B]**. This is probably the total pavilion floor area, not the pyramid.
- Top: open to the sky. Four inner sloping walls carried large sculptures **[W/A]**. A perimeter promenade ran around the top edge. A final open stair ran diagonally up to the top perimeter **[W]** (Westland).
- Below: a rotating theatre complex of 1,000 seats, with five cinemas, sat beneath the pyramid **[W]**.
- **Estimate from photos (not sourced):** the pyramid is a truncated inverted square pyramid. The bottom is roughly 1/4 to 1/3 of the top width and starts about 1 to 2 storeys above grade on four columns near its narrow base. Each sloping face holds stepped terraces or galleries. Check the RIBA and Commons aerials before committing.

### Rest of the Canada complex

- Site: 7.5 acres = 30,285 m² **[W]** (Wikipedia, citing CBC). Westland says "11 acres (30,285 sq m)". The area figure matches 7.5 acres, so use **30,285 m²**.
- Smaller pyramid-roofed buildings: "The three largest pyramids are 18 meters (60 feet) square" **[B]** (FAO *Unasylva* no. 85, "Wood at Expo 67"). Their roofs are laminated Douglas fir. The largest beam was 18 m long and 0.9 m deep.
  - Westland: "Each of the other buildings had a pyramidal roof" **[W]**.
  - Count and layout: **not found**. Take them from the aerial photos.
- People Tree: "Sixty feet in height" = 18.3 m **[W]** (Wikipedia, citing Miedema). Westland calls it "six-story-high" **[W]**.
  - Form: an abstract tree of about 1,000 nylon "leaves", red and orange, half printed with photos of Canadians.
- Also in the complex: an Arts Centre with a 500-seat theatre (northeast), a Children's Creative Centre and La Toundra restaurant. Sizes: **not found**.

### Form for a modeller

Build a square inverted frustum, 58.5 m square at the top deck, about 30 to 33 m above grade, narrowing downward to a small base. Seat it on four columns. Cut its top open so it is a hollow bowl with four inward-sloping sculptured faces. Put a flat perimeter promenade around the rim. Around it, scatter several low buildings with square-pyramid hip roofs, the largest 18 m square. Next to the pyramid, add the 18 m People Tree as a conical cluster of red and orange planes.

### Colours and materials

- Katimavik: steel frame. Exterior cladding colour was **not found** in text. Check photos, and note the RIBA caption "steel and plastic".
- Small pyramids: exposed laminated Douglas fir roofs, natural wood.
- People Tree: red and orange.

### Confidence

Top size and height: medium (two consistent figures). Base size, apex height and the small-pyramid layout: not found.

### Sources used

- https://en.wikipedia.org/wiki/Canadian_Pavilion
- https://www.cca.qc.ca/en/search/details/collection/object/524231 (Robbie fonds)
- https://canada.constructconnect.com/?p=122521 (Daily Commercial News)
- https://www.westland.net/expo67/map-docs/canada.htm
- https://www.fao.org/4/59708e/59708e05.htm (FAO *Unasylva*, "Wood at Expo 67")
- https://digital.library.mcgill.ca/expo-67/search/lotDetails.php?id=14 (192 ft; seen only in a search snippet)

### Reference photos

- Commons: `File:Expo 67, pavillon du Canada et sa pyramide inversée ( le Katimavik).jpg`, `File:Expo 67, pavillon du Canada et sa pyramide inversée (le Katimavik) (2).jpg`, `File:Expo 67, pavillon du Canada et environs.jpg`
- Commons, oblique with the Minirail: `File:Expo 67, pavillons Ontario, Canada, Provinces-de-l'Ouest, et le Minirail..jpg`
- Commons category: https://commons.wikimedia.org/wiki/Category:Canada_Pavilion_at_Expo_1967
- RIBApix RIBA23247, "the inverted pyramid in steel and plastic": https://www.architecture.com/image-library/ribapix/image-information/poster/katimavik-canadian-pavilion-ile-notre-dame-expo-67-montreal-the-inverted-pyramid-in-steel-and-plasti/posterid/RIBA23247.html
- UBC slide 81, aerial view of Katimavik: https://ubcischool.arcabc.ca/1967-montreal-expo-67/slide-81-canada-pavilion-aerial-view-katimavik

---

## 5. Habitat 67 (Cité du Havre)

Architect: Moshe Safdie (with David, Barott, Boulva). Structural engineer: August Komendant.

### Dimensions

- Module: 38 ft 5 in × 17 ft 5 in × 9 ft 10 in = **11.7 × 5.3 × 3.0 m** **[W]** (Wikipedia, citing CPCI). Budowle.pl gives 38.5 × 17.5 × 10 ft. One site gives 5.3 × 3.6 × 2.7 m. Treat that as an error.
  - Module area is about 600 sq ft = 56 m² **[A]** (Canadian Encyclopedia, Safdie Architects). Weight is about 90 tons **[A]** (Canadian Encyclopedia).
- Module count: **354** **[A]** (Canadian Encyclopedia, Wikipedia/CPCI, Westland). Safdie Architects gives 365 **[A]**. Use 354 for the built boxes.
- Residences: 158 at completion **[A]** (Safdie Architects, Canadian Encyclopedia). Wikipedia gives 146 today and the Canadian Encyclopedia 148, after mergers. Each residence uses 1 to 8 modules.
- Storeys: **12** residential storeys **[A]**. Wikipedia adds a parking level and a services level.
- Max height: 44.21 m **[W]** (budowle.pl only). 12 × 3.0 m = 36 m of boxes, plus base and services. Plausible but unverified.
- Clusters: three pyramidal clusters **[W]** (Wikipedia, CPCI). Overall it reads as a stepped, zig-zag ridge. It rises in a "slightly pyramidal form" **[A]**.
- Overall length: three-part spine about **290 m (950 ft)** **[A]** (McGill CAC Safdie archive, via archive-it).
- Circulation: three elevator cores (Safdie Architects). Elevators stop every fourth floor at covered pedestrian streets that run the complex's length **[A]**.
  - So streets sit at about levels 2, 6 and 10. This is inferred from "every fourth floor" and is approximate.
- Floor area: 238,000 sq ft = 22,160 m² **[A]** (Safdie Architects). Wikipedia gives 29,700 m².
- Private terraces: 225 to 1,000 sq ft (21 to 93 m²) **[A]** (habitat67.com). Typical garden 37 × 17 ft (11.3 × 5.2 m), i.e. the roof of the module below **[W]**.
- Assembly: modules were post-tensioned together with high-tension rods, cables and welding. Upper modules cantilever off lower ones.
- Per-cluster heights or a stacking diagram: **not found online.** A published section exists in Safdie, *Beyond Habitat* (1970), and in CPCI material. These were not reachable.

### Form for a modeller

Use 354 boxes of 11.7 × 5.3 × 3.0 m. Stack them up to 12 high along a 290 m north-south-ish spine on the Cité du Havre pier. Group them into three stepped, pyramid-like clusters joined into one zig-zag mass. Alternate the box orientation by 90° between layers. Offset each box so that its roof becomes the garden of the box above. Keep open voids and bridges between clusters. Run pedestrian streets every fourth level. The best basis for layout is the scan below or tracing from aerials.

### Colours and materials

Precast concrete, light grey. Windows set in dark frames. Some modules have rooftop planters with greenery. The streets have translucent plastic domed roofs (from photos).

### Freely licensed 3D model

- Sketchfab "Habitat 67 dataset" by user *axonite*: https://sketchfab.com/3d-models/habitat-67-dataset-7ce91e5da04340c0b3275aecd0c30093
  - Licence: **CC BY 4.0** (attribution required, commercial use allowed).
  - 1.2 M triangles, 716.7 k vertices. Photogrammetry (Agisoft, "no lasers").
  - Download: a "Download 3D Model" button is present. The page does not say whether login is needed. Sketchfab normally requires a free account to download. Not tested here.
- RealityCapture (Capturing Reality) sample dataset: 3,199 images plus 207 laser scans. **Education-only licence**, so not free for general use. https://www.capturingreality.com/head-scan (search-result URL; the dataset page may have moved).

### Confidence

Module size, count, storeys and spine length: high. Max height: low (single source). Per-cluster heights: not found.

### Sources used

- https://en.wikipedia.org/wiki/Habitat_67
- https://www.thecanadianencyclopedia.ca/en/article/habitat-67
- https://www.safdiearchitects.com/projects/habitat-67
- https://www.habitat67.com/en/about/
- https://wayback.archive-it.org/22619/20250109195205/https://cac.mcgill.ca/moshesafdie/habitat/Matrix-Assemblage.htm
- https://www.budowle.pl/building/habitat-67
- https://www.westland.net/expo67/map-docs/architecture.htm
- https://sketchfab.com/3d-models/habitat-67-dataset-7ce91e5da04340c0b3275aecd0c30093

### Reference photos

- Commons, Expo-era: `File:Expo 67 Montreal Canada (12).jpg`, `File:Expo 67 Montreal Canada (15).jpg`
- Commons: `File:Habitat 67 2019 dllu 01.jpg`, `File:201708 Habitat 67 Montréal 01.jpg`, `File:Cite du havre.jpg`
- Commons category (200+ files): https://commons.wikimedia.org/wiki/Category:Habitat_67

---

## 6. Theme pavilions: Man the Explorer (map 320) and Man the Producer (map 440)

Architects: Affleck, Desbarats, Dimakopoulos, Lebensold, Sise (Arcop), commissioned July 1964. Map names: "L'Homme interroge l'univers" and "L'Homme à l'œuvre".

### Shared structure

- Unit: the truncated tetrahedron, "a four-sided triangular figure with the corners cut off, then flattened so that it looked like a prism" **[W]** (Westland). Geometry: 4 regular hexagons, 4 equilateral triangles, 12 vertices, 18 edges.
- System: "tetrahedral-shaped units of steel construction … built as continuous space frames" **[A]** (CCA, Arcop fonds file 410075).
- Joints: designed to be welded. A shortage of welders meant they were bolted and "heavily braced" **[W]** (Westland, expolounge).
- Steel: "pre-rusted steel (probably cor-ten), partially clad with wood-fibre insulation" **[B]** (Monica Pidgeon photo caption, Google Arts & Culture / RIBA).
- **Module edge length: not found.** Member sizes: **not found.**
- **Unverified [S] numbers.** These appeared only in a search-engine summary whose source page could not be identified or opened. Do not use them without verification:
  - "about 400,000 members of paired steel angles, 2.5 million bolts and 100,000 nodes, totalling roughly 7,500 tonnes" for both pavilions.
  - "3'-3" lengths of bent 6"-wide steel plate chords, joined by gusset plates angled at 70 and 110 degrees".
  - The likely source is Inderbir Riar's chapter "Expo 67, or Megastructure Redux" (ACM DL, which returned 403).
- Proposals for alternative cladding exist in the CCA file. The final cladding was a mix of rusted steel frame and closed panels.

### Man the Explorer (map 320, Île Sainte-Hélène, on former Île Verte)

- "four exhibit areas in three interconnected buildings around a plaza" **[W]** (Westland). This matches the three elongated-hexagon buildings on the souvenir map.
  - **South building:** Man and Life.
  - **Northeast building:** Man, His Planet and Space.
  - **Northwest building:** Man and the Oceans (upper level) and Man and the Polar Regions (lower level, with a circular rotating theatre).
  - Wikipedia also lists "Man and his Health" as a fifth sub-theme. Its building was not found.
- Next door: the DuPont of Canada Auditorium, 372 seats **[A]** (CCA).
- Building sizes, heights and storeys: **not found.** Westland confirms at least 2 levels in the northwest building, plus an escalator to a gallery above a large tank.
- **Estimate from photos (not sourced):** each building is a long hexagonal-plan mass built from stacked tetrahedral cells. The walls slope or step outward, and the roofline steps up toward the middle. Height is about 3 to 5 storeys (roughly 15 to 25 m). Verify against the RIBA and Commons views below.

### Man the Producer (map 440, Île Notre-Dame)

- "a single building" with three sections: **Resources for Man**, **Progress** and **Man in Control?** **[W]** (Westland). Wikipedia lists "Resources for Man" and "Man in Control".
- Escalators rise from ground level to a balcony serving all three sections **[W]**.
- Inside "Progress" stood a "three-story high" vertical factory, so the interior clear height is at least 3 storeys **[W]**.
- Footprint, height and storeys: **not found.**
- Note: one RIBA/Google Arts caption puts "Man the Producer" on Île Sainte-Hélène. Westland, CCA and the expolounge aerial put it on Île Notre-Dame, which matches the souvenir map (440).

### Form for a modeller

Build one truncated-tetrahedron cell as a steel lattice of 18 edges, with 4 hexagonal and 4 triangular faces. Truncated tetrahedra do not tile space alone; they fill space only together with regular tetrahedra. The source says the units "nest" and were "flattened", so build a 3D lattice of the cells plus tetrahedra, stacked in tiers. Clad selected faces with flat rust-red panels and leave the frame exposed elsewhere. Assemble elongated hexagonal-plan buildings with stepped, sloping edges. Man the Explorer is three such buildings around a plaza. Man the Producer is one large building. Cell size: not sourced. Pick one that gives about 3 cells per storey in photos.

### Colours and materials

Rust-brown or rust-red weathering steel frame (Cor-ten). Wood-fibre insulation board panels: their colour was not found, but the souvenir map shows rust-red. Some glazing.

### Confidence

Building count, sub-theme names and materials: medium. All dimensions: not found.

### Sources used

- https://www.cca.qc.ca/en/search/details/collection/object/410075
- https://www.westland.net/expo67/map-docs/manexplorer.htm
- https://www.westland.net/expo67/map-docs/manproducer.htm
- https://www.westland.net/expo67/map-docs/architecture.htm
- https://dekhomessl.blogspot.com/2006/07/expo-architecture-theme-pavilions.html (mirror of expolounge)
- https://artsandculture.google.com/asset/expo-67-montreal-man-the-producer-pavilion-ile-sainte-helene-architect-affleck-desbarats-dimakopoulos-lebensold-sise/gQE8NcCsG6Zk-w?hl=en
- https://en.wikipedia.org/wiki/Expo_67_pavilions

### Reference photos

- expolounge Flickr scans (models and as built):
  - Man the Explorer model: http://farm3.static.flickr.com/2439/4072025113_7ecb7708a8_o.png
  - Man the Explorer complex with the US dome: http://farm3.static.flickr.com/2794/4071959363_9e8b966f86_o.png
  - Man the Producer aerial: http://farm3.static.flickr.com/2743/4071960429_bb675761ae_o.png
  - Built structure close-up: http://farm3.static.flickr.com/2513/4072024625_14e5c1ab11_o.png
- RIBApix RIBA51288, Man the Explorer: https://www.ribapix.com/man-the-explorer-theme-pavilion-ile-sainte-helene-expo-67-montreal_riba51288
- Commons: `File:Expo 67, île Sainte-Hélène, pavillon thématique L'Homme interroge l'univers.jpg`, `File:Expo 67, fontaine du lac des Cygnes, et le pavillon thématique L'Homme interroge l'univers.jpg`, `File:Expo 67, le Minirail et le pavillon thématique L'Homme à l'œuvre..jpg`, `File:Pavillon l'Homme à l'oeuvre.jpg`
- Commons category: https://commons.wikimedia.org/wiki/Category:Man_the_Explorer
