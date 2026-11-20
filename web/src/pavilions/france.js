// France pavilion (map 425), Jean Faugeron with André Blouin. Now the main Casino de Montréal building.
// Form (docs/research/pavilions.md §3): a rounded mass of 8–9 storeys (~32 m) around a central atrium
// about 6 storeys tall. Hundreds of aluminium blades wrap it in rising, spiralling bands. Masts and a
// spire stood on the roof. Plan dimensions were not found in text. The round plan below matches the arc
// of the surviving building's OSM footprint (r = 36.2 m). 1993+ casino additions are left out.
import * as THREE from 'three';
import { mat, merged, strutGeometry } from './common.js';

export const DIMS = {
  storeys: 8, // sources say 7–9
  storeyHeight: 3.9, // m: 8 × 3.9 ≈ 31 m, matches "about 100 ft (32 m)"
  baseRadii: [31, 31], // m: lowest tier. Plan is round: the surviving footprint arc fits r = 36.2 m (OSM).
  growPerTier: 0.7, // m: upper tiers oversail the ones below, reaching ~36 m at the top tier. Estimate.
  atriumRadius: 10, // m. Estimate.
  finSpacing: 0.85, // m along the band. Not sourced.
  finDepth: 1.3, // m. Not sourced.
  finTwistDeg: 35, // blade angle to the facade; it advances each tier to read as a spiral. Estimate.
  spire: 24, // m above roof. Not sourced (heights not found).
};

export function build() {
  const group = new THREE.Group();
  const { storeys, storeyHeight: H } = DIMS;
  const ellipse = (a, b, t) => new THREE.Vector2(a * Math.cos(t), b * Math.sin(t));
  const slabs = [];
  const cores = [];
  let finCount = 0;
  const finsPerTier = [];
  for (let k = 0; k < storeys; k++) {
    const a = DIMS.baseRadii[0] + k * DIMS.growPerTier;
    const b = DIMS.baseRadii[1] + k * DIMS.growPerTier;
    // floor slab: ellipse with the atrium cut out
    const shape = new THREE.Shape();
    for (let i = 0; i <= 64; i++) {
      const p = ellipse(a - 0.5, b - 0.5, (i / 64) * Math.PI * 2);
      i ? shape.lineTo(p.x, p.y) : shape.moveTo(p.x, p.y);
    }
    const hole = new THREE.Path();
    for (let i = 0; i <= 32; i++) {
      const p = ellipse(DIMS.atriumRadius, DIMS.atriumRadius, (i / 32) * Math.PI * 2);
      i ? hole.lineTo(p.x, p.y) : hole.moveTo(p.x, p.y);
    }
    shape.holes.push(hole);
    const sg = new THREE.ExtrudeGeometry(shape, { depth: 0.5, bevelEnabled: false, curveSegments: 4 });
    sg.rotateX(-Math.PI / 2);
    sg.translate(0, k * H + H - 0.5, 0);
    slabs.push(sg);
    // glazed wall set back behind the fins
    const cg = new THREE.CylinderGeometry(1, 1, H - 0.5, 48, 1, true);
    cg.scale(a - 2.2, 1, b - 2.2);
    cg.translate(0, k * H + (H - 0.5) / 2, 0);
    cores.push(cg);
    // fin positions along the ellipse, evenly spaced by arc length
    const pts = [];
    let acc = 0;
    let prev = ellipse(a, b, 0);
    for (let i = 1; i <= 720; i++) {
      const p = ellipse(a, b, (i / 720) * Math.PI * 2);
      acc += p.distanceTo(prev);
      if (acc >= DIMS.finSpacing) {
        pts.push({ p, t: (i / 720) * Math.PI * 2 });
        acc = 0;
      }
      prev = p;
    }
    finsPerTier.push({ k, a, b, pts });
    finCount += pts.length;
  }
  group.add(merged(slabs, mat.white));
  const glazing = merged(cores, mat.glass);
  group.add(glazing);

  // Fins as one InstancedMesh.
  const fin = new THREE.BoxGeometry(0.08, H * 0.92, DIMS.finDepth);
  const fins = new THREE.InstancedMesh(fin, mat.aluminium, finCount);
  fins.castShadow = true;
  const m4 = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  let n = 0;
  for (const { k, a, b, pts } of finsPerTier) {
    for (const { p, t } of pts) {
      const tangent = Math.atan2(b * Math.cos(t), -a * Math.sin(t)); // direction of the ellipse at t
      const yaw = -tangent + THREE.MathUtils.degToRad(90 + DIMS.finTwistDeg + k * 6);
      q.setFromAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
      m4.compose(new THREE.Vector3(p.x, k * H + H * 0.5, -p.y), q, new THREE.Vector3(1, 1, 1));
      fins.setMatrixAt(n++, m4);
    }
  }
  group.add(fins);

  // Roof: spire and four masts.
  const roofY = DIMS.storeys * H;
  const masts = [strutGeometry(new THREE.Vector3(0, roofY, 0), new THREE.Vector3(0, roofY + DIMS.spire, 0), 0.5, 8)];
  const a = DIMS.baseRadii[0] + (storeys - 1) * DIMS.growPerTier;
  const b = DIMS.baseRadii[1] + (storeys - 1) * DIMS.growPerTier;
  for (let i = 0; i < 4; i++) {
    const t = (i / 4) * Math.PI * 2 + Math.PI / 4;
    const p = ellipse(a * 0.7, b * 0.7, t);
    masts.push(strutGeometry(new THREE.Vector3(p.x, roofY, -p.y), new THREE.Vector3(p.x, roofY + 10, -p.y), 0.25, 6));
  }
  group.add(merged(masts, mat.white));
  return group;
}

export default { id: 'france', build };
