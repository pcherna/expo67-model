// Shared helpers for pavilion builders.
// Pavilion frame: origin at the ground centre, +X along the long axis (rot_deg), +Y up,
// -Z to the left of the axis. The loader rotates and positions the result into the world.
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

export const mat = {
  concrete: new THREE.MeshStandardMaterial({ color: 0xcbc5b8, roughness: 0.9 }),
  concreteDark: new THREE.MeshStandardMaterial({ color: 0x9d978b, roughness: 0.9 }),
  white: new THREE.MeshStandardMaterial({ color: 0xeeeeea, roughness: 0.6 }),
  glass: new THREE.MeshStandardMaterial({ color: 0x5d7486, roughness: 0.15, metalness: 0.3 }),
  glassClear: new THREE.MeshStandardMaterial({ color: 0xbfd3dd, roughness: 0.1, metalness: 0.1, transparent: true, opacity: 0.35, side: THREE.DoubleSide, depthWrite: false }),
  steel: new THREE.MeshStandardMaterial({ color: 0x58616a, roughness: 0.5, metalness: 0.6 }),
  aluminium: new THREE.MeshStandardMaterial({ color: 0xd9dcdf, roughness: 0.35, metalness: 0.7 }),
  rust: new THREE.MeshStandardMaterial({ color: 0x8e3b2c, roughness: 0.8 }),
  timber: new THREE.MeshStandardMaterial({ color: 0x8a6440, roughness: 0.85 }),
  paving: new THREE.MeshStandardMaterial({ color: 0xd8d2c4, roughness: 0.95 }),
};

/** Modern OSM footprint ([[x, y], ...] in local metres) expressed in the pavilion frame as Vector2(X, -Z). */
export function footprintInFrame(rec) {
  const t = -THREE.MathUtils.degToRad(rec.rot_deg);
  const c = Math.cos(t);
  const s = Math.sin(t);
  return rec.footprint.map(([x, y]) => {
    const dx = x - rec.x;
    const dy = y - rec.y;
    return new THREE.Vector2(dx * c - dy * s, dx * s + dy * c);
  });
}

/** Extrude a plan (Vector2 in frame coords where .y is "left of axis") from z0 up to z1 (metres). */
export function extrudePlan(pts, z0, z1, material) {
  const shape = new THREE.Shape(pts);
  const geo = new THREE.ExtrudeGeometry(shape, { depth: z1 - z0, bevelEnabled: false });
  geo.rotateX(-Math.PI / 2); // shape XY -> XZ plane, extrusion along +Y; shape y becomes -Z (left)
  geo.translate(0, z0, 0);
  const m = new THREE.Mesh(geo, material);
  m.castShadow = m.receiveShadow = true;
  return m;
}

/** Axis-aligned box by centre and size, in the pavilion frame (y = up). */
export function box(cx, cy, cz, sx, sy, sz, material) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(sx, sy, sz), material);
  m.position.set(cx, cy, cz);
  m.castShadow = m.receiveShadow = true;
  return m;
}

/** Merge many same-material geometries into one mesh (keeps draw calls low). */
export function merged(geos, material) {
  const m = new THREE.Mesh(mergeGeometries(geos, false), material);
  m.castShadow = m.receiveShadow = true;
  return m;
}

/** Thin cylinder between two points: for struts and members. */
export function strutGeometry(a, b, radius, radial = 4) {
  const d = new THREE.Vector3().subVectors(b, a);
  const g = new THREE.CylinderGeometry(radius, radius, d.length(), radial, 1, true);
  g.translate(0, d.length() / 2, 0);
  g.applyQuaternion(new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.clone().normalize()));
  g.translate(a.x, a.y, a.z);
  return g;
}

/** Deterministic PRNG so procedural layouts are stable between reloads. */
export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
