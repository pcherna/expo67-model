// Truncated-tetrahedron geometry for the theme pavilions (Man the Explorer, Man the Producer).
// A truncated tetrahedron has 12 vertices, 18 edges, 4 hexagonal and 4 triangular faces.
// Vertices: all permutations of (±3, ±1, ±1) with an even number of minus signs (edge = 2√2 units).
import * as THREE from 'three';

const BASE_EDGE = 2 * Math.SQRT2;

function baseVertices() {
  const out = [];
  const perms = [[3, 1, 1], [1, 3, 1], [1, 1, 3]];
  for (const p of perms) {
    for (let s = 0; s < 8; s++) {
      const signs = [s & 1 ? -1 : 1, s & 2 ? -1 : 1, s & 4 ? -1 : 1];
      if (signs.filter((v) => v < 0).length % 2 === 0) out.push(new THREE.Vector3(p[0] * signs[0], p[1] * signs[1], p[2] * signs[2]));
    }
  }
  return out;
}

/** Vertices and edges of a truncated tetrahedron with the given edge length, centred at the origin. */
export function truncatedTetrahedron(edge) {
  const k = edge / BASE_EDGE;
  const verts = baseVertices().map((v) => v.multiplyScalar(k));
  const edges = [];
  for (let i = 0; i < verts.length; i++) {
    for (let j = i + 1; j < verts.length; j++) {
      if (Math.abs(verts[i].distanceTo(verts[j]) - edge) < 1e-6 * edge + 1e-9) edges.push([i, j]);
    }
  }
  return { verts, edges };
}

/** Convex hull mesh of a truncated tetrahedron, for solid (clad) cells. */
export function truncatedTetrahedronGeometry(edge) {
  // three's ConvexGeometry lives in addons; build faces directly to avoid the dependency.
  const { verts } = truncatedTetrahedron(edge);
  const faces = [];
  const n = verts.length;
  // Brute-force convex hull faces: planes through 3 vertices with all others on one side.
  const seen = new Set();
  for (let a = 0; a < n; a++) for (let b = a + 1; b < n; b++) for (let c = b + 1; c < n; c++) {
    const nrm = new THREE.Vector3().subVectors(verts[b], verts[a]).cross(new THREE.Vector3().subVectors(verts[c], verts[a]));
    if (nrm.lengthSq() < 1e-9) continue;
    nrm.normalize();
    const d = nrm.dot(verts[a]);
    let pos = 0;
    let neg = 0;
    const on = [];
    verts.forEach((v, i) => {
      const s = nrm.dot(v) - d;
      if (s > 1e-6) pos++;
      else if (s < -1e-6) neg++;
      else on.push(i);
    });
    if (pos && neg) continue;
    if (pos) nrm.negate();
    const key = on.slice().sort((x, y) => x - y).join(',');
    if (seen.has(key)) continue;
    seen.add(key);
    // order the face polygon around its centroid
    const ctr = on.reduce((acc, i) => acc.add(verts[i]), new THREE.Vector3()).divideScalar(on.length);
    const u = new THREE.Vector3().subVectors(verts[on[0]], ctr).normalize();
    const w = new THREE.Vector3().crossVectors(nrm, u);
    on.sort((i, j) => {
      const pi = new THREE.Vector3().subVectors(verts[i], ctr);
      const pj = new THREE.Vector3().subVectors(verts[j], ctr);
      return Math.atan2(pi.dot(w), pi.dot(u)) - Math.atan2(pj.dot(w), pj.dot(u));
    });
    for (let t = 1; t < on.length - 1; t++) faces.push(verts[on[0]], verts[on[t]], verts[on[t + 1]]);
  }
  const g = new THREE.BufferGeometry().setFromPoints(faces);
  g.computeVertexNormals();
  return g;
}
