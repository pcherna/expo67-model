// Canada pavilion (map 406): Katimavik inverted pyramid and the People Tree.
// Architects: Ashworth, Robbie, Vaughan & Williams. See docs/research/pavilions.md §4.
// Katimavik: open-topped inverted square frustum. Top deck 58.5 m square (192 ft, two consistent
// sources) at ~31 m, on four columns. Base size and lift above ground were not found; the values below
// follow the research's photo estimate (base about 1/3 of the top, starting 1–2 storeys up).
import * as THREE from 'three';
import { mat, merged, strutGeometry } from './common.js';

export const DIMS = {
  top: 58.5, // m square (192 ft). Sourced.
  topHeight: 31.5, // m to the top deck (100–109 ft). Sourced range 30.5–33.
  base: 19.5, // m square at the bottom. Estimate (1/3 of top).
  baseHeight: 9, // m: underside of the inverted apex. Estimate.
  promenade: 6, // m wide perimeter walkway on top. Estimate.
  bowlFloorHeight: 18, // m: floor of the open bowl. Estimate.
  bowlFloor: 16, // m square. Estimate.
  ledgeEvery: 3.2, // m: stepped galleries on the sloping faces. Estimate from photos.
  peopleTreeHeight: 18.3, // m (60 ft). Sourced.
};

const shell = new THREE.MeshStandardMaterial({ color: 0x6d6862, roughness: 0.75, side: THREE.DoubleSide }); // colour not found
const sculptureWall = new THREE.MeshStandardMaterial({ color: 0xb9b2a5, roughness: 0.85, side: THREE.DoubleSide });

/** Square frustum (4-sided) between two heights, edges aligned to X/Z. */
function squareFrustum(sideTop, sideBot, y0, y1, material, open = true) {
  const g = new THREE.CylinderGeometry(sideTop / Math.SQRT2, sideBot / Math.SQRT2, y1 - y0, 4, 1, open);
  g.rotateY(Math.PI / 4);
  g.translate(0, (y0 + y1) / 2, 0);
  const m = new THREE.Mesh(g, material);
  m.castShadow = m.receiveShadow = true;
  return m;
}

function squareRing(outer, inner, y, t, material) {
  const s = new THREE.Shape([[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([x, z]) => new THREE.Vector2((x * outer) / 2, (z * outer) / 2)));
  s.holes.push(new THREE.Path([[-1, -1], [-1, 1], [1, 1], [1, -1]].map(([x, z]) => new THREE.Vector2((x * inner) / 2, (z * inner) / 2))));
  const g = new THREE.ExtrudeGeometry(s, { depth: t, bevelEnabled: false });
  g.rotateX(-Math.PI / 2);
  g.translate(0, y - t, 0);
  const m = new THREE.Mesh(g, material);
  m.castShadow = m.receiveShadow = true;
  return m;
}

export function buildKatimavik() {
  const d = DIMS;
  const group = new THREE.Group();
  group.add(squareFrustum(d.top, d.base, d.baseHeight, d.topHeight, shell));
  // closed underside of the apex
  group.add(squareRing(d.base, 0.01, d.baseHeight + 0.6, 0.6, shell));
  // open bowl: inner sloping faces (carried sculptures) and a floor
  const inner = d.top - 2 * d.promenade;
  group.add(squareFrustum(inner, d.bowlFloor, d.bowlFloorHeight, d.topHeight, sculptureWall));
  group.add(squareRing(d.bowlFloor + 0.2, 0.01, d.bowlFloorHeight + 0.4, 0.4, mat.paving));
  // perimeter promenade
  group.add(squareRing(d.top + 0.6, inner, d.topHeight + 0.6, 0.6, mat.paving));
  // stepped galleries on the outer faces
  const ledges = [];
  for (let y = d.baseHeight + d.ledgeEvery; y < d.topHeight - 1; y += d.ledgeEvery) {
    const s = d.base + ((d.top - d.base) * (y - d.baseHeight)) / (d.topHeight - d.baseHeight);
    const g = new THREE.CylinderGeometry((s + 1.6) / Math.SQRT2, (s + 1.6) / Math.SQRT2, 0.35, 4, 1, false);
    g.rotateY(Math.PI / 4);
    g.translate(0, y, 0);
    ledges.push(g);
  }
  group.add(merged(ledges, mat.white));
  // four columns under the apex
  const cols = [];
  for (const [x, z] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) {
    const p = new THREE.Vector3((x * d.base) / 2 - x * 2, 0, (z * d.base) / 2 - z * 2);
    cols.push(strutGeometry(p, p.clone().setY(d.baseHeight), 1.1, 10));
  }
  group.add(merged(cols, mat.concrete));
  return group;
}

/** People Tree: ~1,000 red and orange nylon "leaves" on an 18.3 m tree. */
export function buildPeopleTree() {
  const H = DIMS.peopleTreeHeight;
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.8, H, 10), mat.steel);
  trunk.position.y = H / 2;
  group.add(trunk);
  const N = 1000;
  const leaf = new THREE.PlaneGeometry(1.0, 0.8);
  const leaves = new THREE.InstancedMesh(leaf, new THREE.MeshStandardMaterial({ side: THREE.DoubleSide, roughness: 0.8 }), N);
  const m4 = new THREE.Matrix4();
  const e = new THREE.Euler();
  const c = new THREE.Color();
  for (let i = 0; i < N; i++) {
    const t = i / N;
    const y = 4 + t * (H - 4.5); // leaves from 4 m up
    const r = 0.8 + 5.5 * Math.sin(Math.PI * Math.min(1, (y - 4) / (H - 4))) ** 0.8;
    const ang = i * 2.399963; // golden angle spiral
    e.set((i % 7) * 0.3, -ang, (i % 5) * 0.25);
    m4.makeRotationFromEuler(e).setPosition(r * Math.cos(ang), y, r * Math.sin(ang));
    leaves.setMatrixAt(i, m4);
    leaves.setColorAt(i, c.setHex(i % 3 ? 0xd9341f : 0xf08a1c));
  }
  leaves.castShadow = true;
  group.add(leaves);
  return group;
}

export default { id: 'canada', build: buildKatimavik };
export const peopleTree = { id: 'canada_people_tree', build: buildPeopleTree };
