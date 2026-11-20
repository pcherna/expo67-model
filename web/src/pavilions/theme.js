// Theme pavilions by Affleck, Desbarats, Dimakopoulos, Lebensold, Sise (map 320 Man the Explorer,
// map 440 Man the Producer). See docs/research/pavilions.md §6.
// Sourced: space frames of truncated tetrahedra, weathering (pre-rusted) steel, partly clad in panels.
// Man the Explorer = three linked elongated-hexagon buildings; Man the Producer = one building in three sections.
// NOT sourced: every dimension and the cell size. The values below are estimates and are marked.
//
// Model: each building is a clad core (stepped hexagonal tiers, inset per storey) wrapped in an exposed
// frame. The frame is truncated tetrahedra stacked in "hourglass" pairs on a honeycomb. A hex-down cell
// meets a mirrored cell triangle-to-triangle, so the hexagonal faces form floors every two cells.
import * as THREE from 'three';
import { merged } from './common.js';
import { truncatedTetrahedron } from './tetra.js';

export const DIMS = {
  cellEdge: 2.0, // m. Not sourced. Gives a storey of 2 × 1.633 × edge ≈ 6.5 m.
  explorer: { length: 60, width: 40, storeys: 3, inset: 4 }, // m. Estimate from the map (drawn ~78 m) and photos.
  producerSection: { length: 58, width: 46, storeys: 4, inset: 4 }, // m. Estimate.
  producerSpacing: 52, // m between section centres along the axis. Estimate from the map (~170 m complex).
};

const frameMat = new THREE.LineBasicMaterial({ color: 0xc0653f }); // weathering steel, lighter than the panels so the lattice reads
const cladding = new THREE.MeshStandardMaterial({ color: 0x6b2c22, roughness: 0.9 });
const windowMat = new THREE.MeshStandardMaterial({ color: 0x2c3a44, roughness: 0.2, metalness: 0.3, side: THREE.DoubleSide });

// One truncated tetrahedron, rotated so a hexagonal face lies at y = 0 and the opposite triangle on top.
const CELL = (() => {
  const { verts, edges } = truncatedTetrahedron(1);
  // hexagonal faces are normal to (±1,±1,±1) with an odd number of minus signs for this vertex set; find one
  const cands = [[1, 1, -1], [1, -1, 1], [-1, 1, 1], [-1, -1, -1], [1, 1, 1], [-1, -1, 1], [-1, 1, -1], [1, -1, -1]];
  let n = null;
  for (const c of cands) {
    const v = new THREE.Vector3(...c).normalize();
    const d = Math.max(...verts.map((p) => p.dot(v)));
    if (verts.filter((p) => Math.abs(p.dot(v) - d) < 1e-6).length === 6) {
      n = v;
      break;
    }
  }
  const q = new THREE.Quaternion().setFromUnitVectors(n, new THREE.Vector3(0, -1, 0));
  const vs = verts.map((p) => p.clone().applyQuaternion(q));
  const ymin = Math.min(...vs.map((p) => p.y));
  vs.forEach((p) => (p.y -= ymin));
  const h = Math.max(...vs.map((p) => p.y));
  const hex = vs.filter((p) => p.y < 1e-6);
  const phi = Math.atan2(hex[0].z, hex[0].x); // angle of a hexagon corner
  return { vs, edges, h, phi };
})();

function hexPlan(length, width) {
  const a = width / (2 * Math.sqrt(3)); // 120° apex
  return [
    new THREE.Vector2(length / 2, 0), new THREE.Vector2(length / 2 - a, width / 2), new THREE.Vector2(-length / 2 + a, width / 2),
    new THREE.Vector2(-length / 2, 0), new THREE.Vector2(-length / 2 + a, -width / 2), new THREE.Vector2(length / 2 - a, -width / 2),
  ];
}

function insideConvex(poly, x, y, margin = 0) {
  for (let i = 0; i < poly.length; i++) {
    const a = poly[i];
    const b = poly[(i + 1) % poly.length];
    const cross = (b.x - a.x) * (y - a.y) - (b.y - a.y) * (x - a.x);
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    if (cross / len < margin) return false; // CCW polygon: inside is left of each edge
  }
  return true;
}

/** One elongated-hexagon building in its own frame (X = long axis). */
export function hexHall({ length, width, storeys, inset }, edge = DIMS.cellEdge) {
  const group = new THREE.Group();
  const cellH = CELL.h * edge;
  const storeyH = 2 * cellH;
  const tiers = [];
  for (let k = 0; k < storeys; k++) tiers.push(hexPlan(length - 2.3 * inset * k, width - 2 * inset * k));

  // Clad core: one extruded hexagon per storey, slightly inside the frame.
  const windows = [];
  for (let k = 0; k < storeys; k++) {
    const core = hexPlan(length - 2.3 * inset * k - 3, width - 2 * inset * k - 3);
    const g = new THREE.ExtrudeGeometry(new THREE.Shape(core), { depth: storeyH, bevelEnabled: false });
    g.rotateX(-Math.PI / 2);
    g.translate(0, k * storeyH, 0);
    const m = new THREE.Mesh(g, cladding);
    m.castShadow = m.receiveShadow = true;
    group.add(m);
    // triangular windows on the long faces of each tier (the map shows them on every face)
    const tri = new THREE.Shape([new THREE.Vector2(-2.2, 0), new THREE.Vector2(2.2, 0), new THREE.Vector2(0, 3.8)]);
    const half = core[1].y;
    for (const side of [1, -1]) {
      for (let x = core[2].x + 6; x < core[1].x - 4; x += 9) {
        const tg = new THREE.ShapeGeometry(tri);
        if (side > 0) tg.rotateY(Math.PI); // face outward on the -Z (left) side
        tg.translate(x, k * storeyH + 1.2, -side * (half + 0.05));
        windows.push(tg);
      }
    }
  }
  group.add(merged(windows, windowMat));

  // Exposed frame: honeycomb sites; per storey, a hex-down cell and its mirror. Keep cells near the surface.
  const s = Math.sqrt(3) * edge; // honeycomb centre spacing
  const d1 = new THREE.Vector2(Math.cos(CELL.phi + Math.PI / 6), Math.sin(CELL.phi + Math.PI / 6)).multiplyScalar(s);
  const d2 = new THREE.Vector2(Math.cos(CELL.phi + Math.PI / 2), Math.sin(CELL.phi + Math.PI / 2)).multiplyScalar(s);
  const R = Math.ceil(Math.max(length, width) / s) + 2;
  const pos = [];
  const seen = new Set();
  const addEdge = (a, b) => {
    const k1 = `${a.x.toFixed(2)},${a.y.toFixed(2)},${a.z.toFixed(2)}`;
    const k2 = `${b.x.toFixed(2)},${b.y.toFixed(2)},${b.z.toFixed(2)}`;
    const key = k1 < k2 ? `${k1}|${k2}` : `${k2}|${k1}`;
    if (seen.has(key)) return;
    seen.add(key);
    pos.push(a.x, a.y, a.z, b.x, b.y, b.z);
  };
  for (let k = 0; k < storeys; k++) {
    const plan = tiers[k];
    const above = tiers[k + 1];
    for (let i = -R; i <= R; i++) {
      for (let j = -R; j <= R; j++) {
        const cx = i * d1.x + j * d2.x;
        const cz = i * d1.y + j * d2.y; // frame plan coords: x along axis, "y" = left = -Z
        if (!insideConvex(plan, cx, cz, edge * 0.2)) continue;
        // only cells on the skin: near this tier's edge, or exposed on top (not covered by the next tier)
        const nearEdge = !insideConvex(plan, cx, cz, s * 1.2);
        const roof = !above || !insideConvex(above, cx, cz, 0);
        if (!nearEdge && !roof) continue;
        for (const mirror of [false, true]) {
          const y0 = k * storeyH;
          const p = CELL.vs.map((v) => new THREE.Vector3(cx + v.x * edge, mirror ? y0 + storeyH - v.y * edge : y0 + v.y * edge, -(cz + v.z * edge)));
          for (const [a, b] of CELL.edges) addEdge(p[a], p[b]);
        }
      }
    }
  }
  const lg = new THREE.BufferGeometry();
  lg.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
  group.add(new THREE.LineSegments(lg, frameMat));
  group.userData.frameEdges = pos.length / 6;
  return group;
}

export const explorer = (id) => ({ id, build: () => hexHall(DIMS.explorer) });

export const producer = {
  id: 'producer',
  build() {
    const group = new THREE.Group();
    for (const off of [-1, 0, 1]) {
      const h = hexHall(DIMS.producerSection);
      h.position.x = off * DIMS.producerSpacing;
      group.add(h);
    }
    return group;
  },
};

