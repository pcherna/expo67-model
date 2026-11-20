// Habitat 67 (Moshe Safdie), Cité du Havre. Still standing.
// Procedural stack of precast concrete modules inside the real (OSM) footprint.
// This is a massing model: module size and count follow published figures, but the exact
// stacking pattern is generated (three stepped clusters, rotating module direction per level).
import * as THREE from 'three';
import { mat, merged, footprintInFrame, rng } from './common.js';

export const DIMS = {
  module: { long: 11.7, wide: 5.3, high: 3.05 }, // m (38'6" x 17'6" x 10')
  targetModules: 354, // modules as built (combined into 158 dwellings)
  maxStoreys: 12,
  // Cluster peaks along the long axis (m from footprint centre) and their height in storeys.
  peaks: [
    { x: -95, storeys: 12 },
    { x: 0, storeys: 10 },
    { x: 95, storeys: 12 },
  ],
  falloffAlong: 9, // m per storey of drop moving along the axis away from a peak
  falloffAcross: 4.5, // m per storey of drop moving across the axis away from the spine
  voidChance: 0.18, // skipped slots = terraces and gaps
};

function inside(poly, x, y) {
  let c = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const a = poly[i];
    const b = poly[j];
    if (a.y > y !== b.y > y && x < ((b.x - a.x) * (y - a.y)) / (b.y - a.y) + a.x) c = !c;
  }
  return c;
}

export function build(rec) {
  const poly = footprintInFrame(rec);
  const { long: L, wide: W, high: H } = DIMS.module;
  const rand = rng(67);
  // Spine: middle of the footprint's cross-section at each x, sampled every metre.
  const xs = poly.map((p) => p.x);
  const x0 = Math.floor(Math.min(...xs));
  const x1 = Math.ceil(Math.max(...xs));
  const spine = new Map();
  for (let x = x0; x <= x1; x++) {
    const ys = [];
    for (let y = -60; y <= 60; y += 0.5) if (inside(poly, x, y)) ys.push(y);
    if (ys.length) spine.set(x, (Math.min(...ys) + Math.max(...ys)) / 2);
  }
  const heightAt = (x, y) => {
    const s = spine.get(Math.round(x)) ?? 0;
    let best = 0;
    for (const p of DIMS.peaks) {
      const h = p.storeys - Math.abs(x - p.x) / DIMS.falloffAlong - Math.abs(y - s) / DIMS.falloffAcross;
      best = Math.max(best, h);
    }
    return Math.min(best, DIMS.maxStoreys);
  };

  const levels = [];
  const concrete = [];
  const glazing = [];
  let count = 0;
  for (let lvl = 0; lvl < DIMS.maxStoreys; lvl++) {
    const along = lvl % 2 === 0; // modules alternate direction level by level
    const sx = along ? L : W;
    const sy = along ? W : L;
    const placed = [];
    const off = (lvl % 3) * (W / 3); // stagger so levels don't stack as plain columns
    for (let x = x0 + sx / 2 + off; x <= x1 - sx / 2; x += sx + 0.3) {
      for (let y = -60 + sy / 2; y <= 60 - sy / 2; y += sy + 0.3) {
        const corners = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([a, b]) => [x + (a * sx) / 2, y + (b * sy) / 2]);
        if (!corners.every(([cx, cy]) => inside(poly, cx, cy))) continue;
        if (lvl >= heightAt(x, y)) continue;
        if (rand() < DIMS.voidChance) continue;
        if (lvl > 0) {
          // needs support: centre over a module of the level below
          const below = levels[lvl - 1];
          if (!below.some((m) => Math.abs(m.x - x) < m.sx / 2 && Math.abs(m.y - y) < m.sy / 2)) continue;
        }
        placed.push({ x, y, sx, sy });
        const g = new THREE.BoxGeometry(sx, H - 0.1, sy);
        g.translate(x, lvl * H + H / 2, -y);
        concrete.push(g);
        // a window wall on one short end
        const gw = along ? new THREE.BoxGeometry(0.12, H * 0.6, sy * 0.75) : new THREE.BoxGeometry(sx * 0.75, H * 0.6, 0.12);
        if (along) gw.translate(x + (rand() < 0.5 ? 1 : -1) * (sx / 2 + 0.03), lvl * H + H * 0.5, -y);
        else gw.translate(x, lvl * H + H * 0.5, -(y + (rand() < 0.5 ? 1 : -1) * (sy / 2 + 0.03)));
        glazing.push(gw);
        count++;
      }
    }
    levels.push(placed);
  }
  const group = new THREE.Group();
  group.add(merged(concrete, mat.concrete), merged(glazing, mat.glass));
  group.userData.moduleCount = count;
  console.log(`[habitat] ${count} modules (target ${DIMS.targetModules})`);
  return group;
}

export default { id: 'habitat', build };
