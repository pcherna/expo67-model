// United States pavilion (map 358): Buckminster Fuller & Shoji Sadao geodesic dome, now the Biosphère.
// Double-layer space frame: an outer triangulated layer and an inner hexagonal layer (the dual),
// joined by diagonal struts. The acrylic skin was destroyed by fire in 1976.
// Dimensions: see docs/research/pavilions.md.
import * as THREE from 'three';
import { mat, merged, strutGeometry } from './common.js';

export const DIMS = {
  diameter: 76.2, // m (250 ft)
  height: 61.5, // m (~200 ft), a 3/4 sphere
  frameDepth: 1.1, // m between the outer and inner layers, estimate pending research
  detail: 9, // icosphere subdivision: sets the triangle size (~3 m edges at this radius)
};

function icosphere(R, detail) {
  // Unique vertices + triangle index list for a geodesic icosphere.
  const g = new THREE.IcosahedronGeometry(R, detail);
  const pos = g.attributes.position;
  const key = (v) => `${v.x.toFixed(3)},${v.y.toFixed(3)},${v.z.toFixed(3)}`;
  const verts = [];
  const index = new Map();
  const tris = [];
  for (let i = 0; i < pos.count; i += 3) {
    const t = [];
    for (let k = 0; k < 3; k++) {
      const v = new THREE.Vector3().fromBufferAttribute(pos, i + k);
      const kk = key(v);
      if (!index.has(kk)) {
        index.set(kk, verts.length);
        verts.push(v);
      }
      t.push(index.get(kk));
    }
    tris.push(t);
  }
  return { verts, tris };
}

export function build() {
  const R = DIMS.diameter / 2;
  const cy = DIMS.height - R; // sphere centre height above ground
  const group = new THREE.Group();
  const { verts, tris } = icosphere(R, DIMS.detail);
  const inner = R - DIMS.frameDepth;
  const above = (v) => v.y + cy > -0.5; // keep members above ground
  const lift = (v) => new THREE.Vector3(v.x, v.y + cy, v.z);

  // Outer triangular layer: unique edges.
  const edges = new Set();
  const outerGeos = [];
  for (const t of tris) {
    for (let k = 0; k < 3; k++) {
      const a = Math.min(t[k], t[(k + 1) % 3]);
      const b = Math.max(t[k], t[(k + 1) % 3]);
      const e = `${a}-${b}`;
      if (edges.has(e) || !above(verts[a]) || !above(verts[b])) continue;
      edges.add(e);
      outerGeos.push(strutGeometry(lift(verts[a]), lift(verts[b]), 0.09));
    }
  }

  // Inner hexagonal layer: one node per outer triangle (its centroid pushed to the inner radius),
  // joined to the nodes of the neighbouring triangles. Diagonals tie each inner node to its triangle's corners.
  const centre = tris.map((t) => new THREE.Vector3().add(verts[t[0]]).add(verts[t[1]]).add(verts[t[2]]).setLength(inner));
  const edgeTris = new Map();
  tris.forEach((t, i) => {
    for (let k = 0; k < 3; k++) {
      const e = `${Math.min(t[k], t[(k + 1) % 3])}-${Math.max(t[k], t[(k + 1) % 3])}`;
      (edgeTris.get(e) || edgeTris.set(e, []).get(e)).push(i);
    }
  });
  const innerGeos = [];
  for (const [, pair] of edgeTris) {
    if (pair.length !== 2) continue;
    const [a, b] = pair.map((i) => centre[i]);
    if (above(a) && above(b)) innerGeos.push(strutGeometry(lift(a), lift(b), 0.07));
  }
  const diagGeos = [];
  tris.forEach((t, i) => {
    if (!above(centre[i])) return;
    for (const v of t) if (above(verts[v])) diagGeos.push(strutGeometry(lift(centre[i]), lift(verts[v]), 0.05));
  });
  group.add(merged(outerGeos, mat.steel), merged(innerGeos, mat.steel), merged(diagGeos, mat.steel));

  // Acrylic skin, cut at the ground.
  const theta = Math.acos(-cy / R);
  const skin = new THREE.Mesh(new THREE.SphereGeometry(R - DIMS.frameDepth / 2, 64, 32, 0, Math.PI * 2, 0, theta), mat.glassClear);
  skin.position.y = cy;
  group.add(skin);
  return group;
}

export default { id: 'us', build };
