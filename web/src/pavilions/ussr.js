// USSR pavilion (map 479), Posokhin, Mndoyants & Tkhor. Demolished in Montréal (moved to VDNKh, Moscow).
// Form (docs/research/pavilions.md §2): a long glass hall on a podium. Its front glass wall leans outward.
// A thin aluminium roof sweeps up toward the front into a deep canopy. Two V-shaped steel frames, one at
// each end outside the glass, carry the roof. Two mezzanine decks are inside.
// Only the roof area (~9,300 m²) is sourced. Every other dimension below is an estimate and is labelled.
import * as THREE from 'three';
import { mat, box, merged, strutGeometry } from './common.js';

export const DIMS = {
  roofLength: 137, // m: "450 ft" support caption (1967), read as roof length. Low confidence.
  roofDepth: 68, // m: 9,290 m² roof area / 137 m. Derived.
  rearEave: 15, // m: underside of roof at the back. Estimate from photos.
  frontTip: 33, // m: underside at the canopy edge. Estimate from photos.
  canopy: 12, // m: canopy reach past the top of the glass wall. Estimate.
  glassLength: 117, // m: glass hall shorter than the roof so the V frames stand outside it. Estimate.
  glassLeanDeg: 9, // front wall leans outward. Estimate.
  mezzanines: [7, 13], // m: deck heights. Estimate (ground + two mezzanines per Westland).
  podium: 1.2, // m: stylobate. Estimate.
};

const roofGlass = new THREE.MeshStandardMaterial({ color: 0x7f97a6, roughness: 0.1, metalness: 0.4, transparent: true, opacity: 0.55, side: THREE.DoubleSide });

/** Extrude a side profile given as [z, h] points (pavilion frame) along X from x0 to x1. */
function profileAlongX(zh, x0, x1, material) {
  const shape = new THREE.Shape(zh.map(([z, h]) => new THREE.Vector2(-z, h)));
  const g = new THREE.ExtrudeGeometry(shape, { depth: x1 - x0, bevelEnabled: false });
  g.rotateY(Math.PI / 2); // shape u=-z -> z, extrusion -> +x
  g.translate(x0, 0, 0);
  const m = new THREE.Mesh(g, material);
  m.castShadow = m.receiveShadow = true;
  return m;
}

export function build() {
  const { roofLength: L, roofDepth: D, rearEave: h0, frontTip: h1, canopy, glassLength: GL } = DIMS;
  const P = DIMS.podium;
  const z0 = -D / 2;
  const under = (z) => {
    const t = THREE.MathUtils.clamp((z - z0) / D, 0, 1);
    return P + h0 + (h1 - h0) * t ** 3; // ski-jump: flat at the back, sweeping up at the front
  };
  const thick = (z) => 2.4 - 1.9 * THREE.MathUtils.clamp((z - z0) / D, 0, 1) ** 2; // thins to a blade edge
  const group = new THREE.Group();

  // Podium
  group.add(box(0, P / 2, 2, L + 14, P, D + 10, mat.paving));

  // Roof slab: underside curve and top curve, extruded along the length.
  const N = 40;
  const top = [];
  const bot = [];
  for (let i = 0; i <= N; i++) {
    const z = z0 + (D * i) / N;
    bot.push([z, under(z)]);
    top.push([z, under(z) + thick(z)]);
  }
  group.add(profileAlongX([...bot, ...top.reverse()], -L / 2, L / 2, mat.aluminium));

  // Glass hall. The back wall is vertical. The front wall leans out and stops under the canopy.
  const zr = z0 + 6;
  const zfTop = D / 2 - canopy;
  const hTop = under(zfTop) - 0.3;
  const zfBot = zfTop - Math.tan(THREE.MathUtils.degToRad(DIMS.glassLeanDeg)) * (hTop - P);
  const hall = [[zr, P], [zfBot, P], [zfTop, hTop]];
  for (let i = 1; i < N; i++) {
    const z = zfTop - ((zfTop - zr) * i) / N;
    hall.push([z, under(z) - 0.3]);
  }
  hall.push([zr, under(zr) - 0.3]);
  group.add(profileAlongX(hall, -GL / 2, GL / 2, roofGlass));

  // Mullions on the leaning front wall, every 3 m.
  const mull = [];
  const lean = THREE.MathUtils.degToRad(DIMS.glassLeanDeg);
  const wallLen = (hTop - P) / Math.cos(lean);
  for (let x = -GL / 2; x <= GL / 2 + 0.01; x += 3) {
    const g = new THREE.BoxGeometry(0.25, wallLen, 0.4);
    g.translate(0, wallLen / 2, 0);
    g.rotateX(lean); // top tips toward +Z (front)
    g.translate(x, P, zfBot);
    mull.push(g);
  }
  group.add(merged(mull, mat.steel));

  // Mezzanine decks.
  for (const h of DIMS.mezzanines) group.add(box(0, P + h, (zr + zfBot - 10) / 2, GL - 12, 0.7, zfBot - 10 - zr, mat.white));

  // Two V frames, one beyond each end of the glass hall. Legs meet at a ground pivot and rise to the roof.
  const legs = [];
  for (const x of [-(GL / 2 + 7), GL / 2 + 7]) {
    const base = new THREE.Vector3(x, P, -2);
    for (const zt of [z0 + 9, D / 2 - canopy - 2]) legs.push(strutGeometry(base, new THREE.Vector3(x, under(zt), zt), 1.1, 8));
  }
  group.add(merged(legs, mat.steel));
  return group;
}

export default { id: 'ussr', build };
