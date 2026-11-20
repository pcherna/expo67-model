// Theme pavilions by Affleck, Desbarats, Dimakopoulos, Lebensold, Sise (map 320 Man the Explorer,
// map 440 Man the Producer). See docs/research/pavilions.md §6.
// Sourced: space frames of truncated tetrahedra, partly clad. Man the Explorer = three elongated-hexagon
// buildings; Man the Producer = one building in three sections.
// Form, from 1967 photos and the souvenir map's drawing: each unit is a truncated tetrahedron resting on a
// hexagonal face. Three inclined hexagons rise from alternate edges of the base hexagon, and their top edges
// meet a flat triangular roof (a lattice skylight on the map). The other three base edges carry the corner
// triangles, which lean outward and show the dark exposed frame. Hexagons are clad in grey diamond shingle,
// with six triangular windows around the centre and shingled spokes between them.
// NOT sourced: every dimension. Unit sizes and Man the Producer's layout are estimates from the map.
import * as THREE from 'three';

export const DIMS = {
  // Regular truncated tetrahedron: corner and apex cuts at 1/3 of each tetrahedron edge, apex height of a
  // regular tetrahedron. Matches the photos (hexagon faces about as tall as wide). Shape not measured.
  cornerCut: 1 / 3,
  apexCut: 1 / 3,
  explorerEdge: 22, // m, hexagon edge. Estimate: map 320 draws the front hexagon ~54 m wide; map oversizes up to 1.7×.
  // Man the Producer, map 440: two large and four small units. Centres (x along the axis, y to its left) and
  // edges in m, estimated from the map drawing scaled by 1/1.3 for its oversizing.
  producerUnits: [
    { x: 38, y: 6, edge: 22 }, { x: -46, y: 17, edge: 22 },
    { x: -27, y: -6, edge: 10 }, { x: -8, y: -19, edge: 10 }, { x: -10, y: 15, edge: 10 }, { x: 12, y: -13, edge: 10 },
  ],
};

// ---------- textures (procedural, no image assets) ----------
function canvasTexture(w, h, draw) {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  draw(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

// Diamond shingles: one diamond per tile.
const shingleTex = canvasTexture(64, 64, (g, w, h) => {
  g.fillStyle = '#8a8986';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#5f5e5b';
  g.lineWidth = 3;
  g.beginPath();
  g.moveTo(0, h / 2); g.lineTo(w / 2, 0); g.lineTo(w, h / 2); g.lineTo(w / 2, h); g.closePath();
  g.stroke();
});

// Triangular lattice (the exposed frame seen through the white panels).
const latticeTex = canvasTexture(64, 110, (g, w, h) => {
  g.fillStyle = '#ece8dc';
  g.fillRect(0, 0, w, h);
  g.strokeStyle = '#3d3d3d';
  g.lineWidth = 5;
  g.beginPath();
  for (const y of [0, h / 2, h]) { g.moveTo(0, y); g.lineTo(w, y); }
  for (let x = -2 * w; x <= 2 * w; x += w) {
    g.moveTo(x, h); g.lineTo(x + w, 0);
    g.moveTo(x, 0); g.lineTo(x + w, h);
  }
  g.stroke();
});

// Dark bay: open frame with light spots, as in the photos.
const bayTex = canvasTexture(32, 32, (g, w, h) => {
  g.fillStyle = '#2b2d30';
  g.fillRect(0, 0, w, h);
  g.fillStyle = '#9a9a94';
  g.beginPath();
  g.moveTo(w / 2, h * 0.3); g.lineTo(w * 0.7, h / 2); g.lineTo(w / 2, h * 0.7); g.lineTo(w * 0.3, h / 2); g.closePath();
  g.fill();
});

const cladding = new THREE.MeshStandardMaterial({ color: 0xffffff, map: shingleTex, roughness: 0.9 });
const panels = new THREE.MeshStandardMaterial({ color: 0xffffff, map: latticeTex, roughness: 0.7 });
const bays = new THREE.MeshStandardMaterial({ color: 0xffffff, map: bayTex, roughness: 0.8 });
const TILE = { cladding: 1.6, panels: 3.0, bays: 1.5 }; // metres per texture repeat

// ---------- geometry ----------
/** Accumulates flat-shaded triangles with planar UVs for one material. */
class Bucket {
  constructor(tile) {
    this.tile = tile;
    this.p = [];
    this.n = [];
    this.uv = [];
  }

  tri(a, b, c, f) {
    const cr = new THREE.Vector3().subVectors(b, a).cross(new THREE.Vector3().subVectors(c, a));
    if (cr.dot(f.n) < 0) [b, c] = [c, b]; // wind counter-clockwise seen from outside
    for (const v of [a, b, c]) {
      const d = v.clone().sub(f.o);
      this.p.push(v.x, v.y, v.z);
      this.n.push(f.n.x, f.n.y, f.n.z);
      this.uv.push(d.dot(f.u) / this.tile, d.dot(f.v) / this.tile);
    }
  }

  polygon(pts, f, lift = 0) {
    const q = pts.map((p) => p.clone().addScaledVector(f.n, lift));
    for (let i = 1; i < q.length - 1; i++) this.tri(q[0], q[i], q[i + 1], f);
  }

  mesh(material) {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(this.p, 3));
    g.setAttribute('normal', new THREE.Float32BufferAttribute(this.n, 3));
    g.setAttribute('uv', new THREE.Float32BufferAttribute(this.uv, 2));
    const m = new THREE.Mesh(g, material);
    m.castShadow = m.receiveShadow = true;
    return m;
  }
}

/** Plane frame of a convex face: origin, in-plane axes u, v and the normal pointing away from `inside`. */
function faceFrame(pts, inside) {
  const c = pts.reduce((s, p) => s.add(p), new THREE.Vector3()).divideScalar(pts.length);
  const u = pts[1].clone().sub(pts[0]).normalize();
  const n = new THREE.Vector3().subVectors(pts[2], pts[1]).cross(new THREE.Vector3().subVectors(pts[0], pts[1])).normalize();
  if (n.dot(c.clone().sub(inside)) < 0) n.negate();
  return { o: pts[0], u, v: new THREE.Vector3().crossVectors(n, u), n, c };
}

/**
 * Truncated tetrahedron resting on a hexagonal face, in its own frame (X = map axis, ground at y = 0).
 * Built by cutting a tetrahedron: base triangle C0..C2 on the ground, apex P above the centroid.
 * One inclined hexagon faces +X (the front face on the map); the corner triangle opposite faces -X.
 */
export function truncTet(edge, { cornerCut: f = DIMS.cornerCut, apexCut: g = DIMS.apexCut } = DIMS) {
  const side = edge / (1 - 2 * f); // tetrahedron edge giving hexagon base edges of `edge`
  const R = side / Math.sqrt(3);
  // Corner C_i at angle 180° + 120° i: C0 on -X, so the face opposite it (C1, C2, P) faces +X.
  const C = [0, 1, 2].map((i) => {
    const t = Math.PI + (i * 2 * Math.PI) / 3;
    return new THREE.Vector3(R * Math.cos(t), 0, R * Math.sin(t));
  });
  const P = new THREE.Vector3(0, side * Math.sqrt(2 / 3), 0);
  const along = (a, b, t) => a.clone().lerp(b, t);
  const top = C.map((c) => along(P, c, g)); // roof triangle
  const low = C.map((c) => along(c, P, f)); // top corner of each corner triangle

  const inside = new THREE.Vector3(0, P.y * 0.3, 0);
  const skin = new Bucket(TILE.cladding);
  const white = new Bucket(TILE.panels);
  const dark = new Bucket(TILE.bays);

  for (let i = 0; i < 3; i++) {
    const j = (i + 1) % 3;
    // Corner triangle at C_i, leaning outward over the base.
    const k = (i + 2) % 3;
    const corner = [along(C[i], C[j], f), low[i], along(C[i], C[k], f)];
    dark.polygon(corner, faceFrame(corner, inside));
    // Inclined hexagon on the original face (C_i, C_j, P).
    const hex = [along(C[i], C[j], f), along(C[j], C[i], f), low[j], top[j], top[i], low[i]];
    const fr = faceFrame(hex, inside);
    skin.polygon(hex, fr);
    // Six windows: the hexagon's centre sectors, shrunk about their centroids, leaving shingled spokes.
    for (let s = 0; s < 6; s++) {
      const tri = [fr.c, hex[s], hex[(s + 1) % 6]];
      const m = tri.reduce((a, p) => a.add(p), new THREE.Vector3()).divideScalar(3);
      white.polygon(tri.map((p) => m.clone().lerp(p, 0.5)), fr, 0.08);
    }
  }
  // Flat roof: lattice skylight.
  const roof = faceFrame(top, inside);
  white.polygon(top, roof);

  const group = new THREE.Group();
  group.add(skin.mesh(cladding), white.mesh(panels), dark.mesh(bays));
  group.userData.height = top[0].y;
  return group;
}

export const explorer = (id) => ({ id, build: () => truncTet(DIMS.explorerEdge) });

export const producer = {
  id: 'producer',
  build() {
    const group = new THREE.Group();
    for (const u of DIMS.producerUnits) {
      const t = truncTet(u.edge);
      t.position.set(u.x, 0, -u.y);
      group.add(t);
    }
    return group;
  },
};
