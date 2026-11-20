// Generic massing for every pavilion without a dedicated builder (web/public/data/generic.json).
// Footprints are in local metres (x east, y north); three.js world = (x, h, -y).
// Kinds: box (extruded footprint), pyramid/cone (apex over the centroid), tent (membrane over masts),
// hexpyramid (stacked hexagonal timber rings, after Erickson/Massey's Man in the Community).
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const membrane = new THREE.MeshStandardMaterial({ color: 0xf2f0ea, roughness: 0.8, side: THREE.DoubleSide, transparent: true, opacity: 0.92 });
const mastMat = new THREE.MeshStandardMaterial({ color: 0x6a7076, roughness: 0.5, metalness: 0.5 });
const timber = new THREE.MeshStandardMaterial({ color: 0x9b7a52, roughness: 0.85 });

function shapeOf(fp) {
  return new THREE.Shape(fp.map(([x, y]) => new THREE.Vector2(x, y)));
}

function colourise(geo, hex) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  g.computeVertexNormals();
  const roof = new THREE.Color(hex);
  const wall = roof.clone().multiplyScalar(0.72);
  const n = g.attributes.normal;
  const col = new Float32Array(n.count * 3);
  for (let i = 0; i < n.count; i++) {
    const c = n.getY(i) > 0.5 ? roof : wall;
    col.set([c.r, c.g, c.b], i * 3);
  }
  g.setAttribute('color', new THREE.BufferAttribute(col, 3));
  for (const k of Object.keys(g.attributes)) if (!['position', 'normal', 'color'].includes(k)) g.deleteAttribute(k);
  return g;
}

function boxGeometry(b) {
  const g = new THREE.ExtrudeGeometry(shapeOf(b.footprint), { depth: b.h, bevelEnabled: false });
  g.rotateX(-Math.PI / 2); // shape (x, y) -> world (x, -y); extrusion -> +Y
  return colourise(g, b.colour);
}

function pyramidGeometry(b) {
  const fp = b.footprint;
  const cx = fp.reduce((s, p) => s + p[0], 0) / fp.length;
  const cy = fp.reduce((s, p) => s + p[1], 0) / fp.length;
  const apex = new THREE.Vector3(cx, b.h, -cy);
  const pts = [];
  for (let i = 0; i < fp.length; i++) {
    const [ax, ay] = fp[i];
    const [bx, by] = fp[(i + 1) % fp.length];
    pts.push(new THREE.Vector3(ax, 0, -ay), new THREE.Vector3(bx, 0, -by), apex);
  }
  return colourise(new THREE.BufferGeometry().setFromPoints(pts), b.colour);
}

function inside(fp, x, y) {
  let c = false;
  for (let i = 0, j = fp.length - 1; i < fp.length; j = i++) {
    const [xi, yi] = fp[i];
    const [xj, yj] = fp[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) c = !c;
  }
  return c;
}

/** Membrane hung from masts: smooth peaks at each mast, low (4 m) at the edges. */
function tent(b) {
  const group = new THREE.Group();
  const fp = b.footprint;
  const xs = fp.map((p) => p[0]);
  const ys = fp.map((p) => p[1]);
  const step = 2.5;
  const x0 = Math.min(...xs);
  const y0 = Math.min(...ys);
  const nx = Math.ceil((Math.max(...xs) - x0) / step);
  const ny = Math.ceil((Math.max(...ys) - y0) / step);
  const base = 4;
  const hAt = (x, y) => {
    let h = base;
    for (const [mx, my, mh] of b.masts) {
      const d = Math.hypot(x - mx, y - my);
      h = Math.max(h, base + (mh - base) * Math.exp(-((d / (0.9 * mh)) ** 2)));
    }
    return h;
  };
  const pts = [];
  const P = (i, j) => new THREE.Vector3(x0 + i * step, hAt(x0 + i * step, y0 + j * step), -(y0 + j * step));
  for (let i = 0; i < nx; i++) {
    for (let j = 0; j < ny; j++) {
      const cx = x0 + (i + 0.5) * step;
      const cy = y0 + (j + 0.5) * step;
      if (!inside(fp, cx, cy)) continue;
      const a = P(i, j);
      const bb = P(i + 1, j);
      const c = P(i + 1, j + 1);
      const d = P(i, j + 1);
      pts.push(a, bb, c, a, c, d);
    }
  }
  const g = new THREE.BufferGeometry().setFromPoints(pts);
  g.computeVertexNormals();
  const m = new THREE.Mesh(g, membrane);
  m.castShadow = m.receiveShadow = true;
  group.add(m);
  const masts = b.masts.map(([x, y, h]) => {
    const mg = new THREE.CylinderGeometry(0.35, 0.5, h + 2, 8);
    mg.translate(x, (h + 2) / 2, -y);
    return mg;
  });
  group.add(new THREE.Mesh(mergeGeometries(masts), mastMat));
  return group;
}

/** Stacked hexagonal rings of box beams, alternating 30° per course, open at the top. */
function hexPyramid(b) {
  const fp = b.footprint;
  const cx = fp.reduce((s, p) => s + p[0], 0) / fp.length;
  const cy = fp.reduce((s, p) => s + p[1], 0) / fp.length;
  const R = Math.max(...fp.map(([x, y]) => Math.hypot(x - cx, y - cy)));
  const courses = Math.round(b.h / 3);
  const beam = 1.5; // m: box beams "as large as five feet square" (McGill eScholarship)
  const geos = [];
  for (let k = 0; k < courses; k++) {
    const r = R * (1 - (0.82 * k) / courses);
    const rot = (k % 2) * (Math.PI / 6);
    const y = k * (b.h / courses) + beam / 2;
    for (let s = 0; s < 6; s++) {
      const a0 = rot + (s * Math.PI) / 3;
      const a1 = a0 + Math.PI / 3;
      const p0 = new THREE.Vector2(cx + r * Math.cos(a0), cy + r * Math.sin(a0));
      const p1 = new THREE.Vector2(cx + r * Math.cos(a1), cy + r * Math.sin(a1));
      const len = p0.distanceTo(p1) + beam;
      const g = new THREE.BoxGeometry(len, beam, beam);
      g.rotateY(Math.atan2(p1.y - p0.y, p1.x - p0.x)); // local y -> world -z
      g.translate((p0.x + p1.x) / 2, y, -(p0.y + p1.y) / 2);
      geos.push(g);
    }
  }
  const m = new THREE.Mesh(mergeGeometries(geos), timber);
  m.castShadow = m.receiveShadow = true;
  return m;
}

export function buildGeneric(list) {
  const group = new THREE.Group();
  const boxes = [];
  for (const b of list) {
    if (b.kind === 'tent') group.add(tent(b));
    else if (b.kind === 'hexpyramid') group.add(hexPyramid(b));
    else if (b.kind === 'pyramid' || b.kind === 'cone') boxes.push(pyramidGeometry(b));
    else boxes.push(boxGeometry(b));
  }
  const mesh = new THREE.Mesh(mergeGeometries(boxes), new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.85 }));
  mesh.castShadow = mesh.receiveShadow = true;
  group.add(mesh);
  return group;
}
