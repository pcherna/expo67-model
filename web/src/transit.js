// Transit lines from web/public/data/transit.json: track deck, piers over water, stations, moving trains.
// Points are [x, y, deckHeight] in local metres; world = (x, h, -y).
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';

const DECK_W = 8; // m, double track. Estimate.
const deckMat = new THREE.MeshStandardMaterial({ color: 0x8d8a84, roughness: 0.9 });
const pierMat = new THREE.MeshStandardMaterial({ color: 0xb9b5ac, roughness: 0.9 });
const platformMat = new THREE.MeshStandardMaterial({ color: 0xe0dbd0, roughness: 0.85 });

function ribbon(pts, width, lift) {
  const pos = [];
  const v = pts.map(([x, y, h]) => new THREE.Vector3(x, h + lift, -y));
  for (let i = 0; i < v.length - 1; i++) {
    const dir = new THREE.Vector3().subVectors(v[i + 1], v[i]).setY(0).normalize();
    const side = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(width / 2);
    const a0 = v[i].clone().add(side);
    const a1 = v[i].clone().sub(side);
    const b0 = v[i + 1].clone().add(side);
    const b1 = v[i + 1].clone().sub(side);
    pos.push(a0, b0, a1, a1, b0, b1);
  }
  const g = new THREE.BufferGeometry().setFromPoints(pos);
  g.computeVertexNormals();
  return g;
}

function deckBox(pts) {
  // top surface plus a 1.2 m fascia on both sides, as one geometry
  const top = ribbon(pts, DECK_W, 0.6);
  const sides = [];
  const v = pts.map(([x, y, h]) => new THREE.Vector3(x, h, -y));
  for (const s of [1, -1]) {
    const pos = [];
    for (let i = 0; i < v.length - 1; i++) {
      const dir = new THREE.Vector3().subVectors(v[i + 1], v[i]).setY(0).normalize();
      const off = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar((s * DECK_W) / 2);
      const a = v[i].clone().add(off);
      const b = v[i + 1].clone().add(off);
      const aTop = a.clone().setY(a.y + 0.6);
      const bTop = b.clone().setY(b.y + 0.6);
      const aBot = a.clone().setY(Math.max(0, a.y - 0.6));
      const bBot = b.clone().setY(Math.max(0, b.y - 0.6));
      pos.push(aTop, aBot, bTop, bTop, aBot, bBot);
    }
    const g = new THREE.BufferGeometry().setFromPoints(pos);
    g.computeVertexNormals();
    sides.push(g);
  }
  return mergeGeometries([top, ...sides]);
}

export function buildTransit(lines) {
  const group = new THREE.Group();
  const trains = [];
  for (const line of lines) {
    const decks = [];
    const piers = [];
    for (const seg of line.segments) {
      decks.push(deckBox(seg.pts));
      seg.pts.forEach(([x, y, h], i) => {
        if (h > 2 && i % 8 === 0) {
          const g = new THREE.BoxGeometry(2, h, DECK_W * 0.8);
          const [nx, ny] = seg.pts[Math.min(i + 1, seg.pts.length - 1)];
          g.rotateY(Math.atan2(ny - y, nx - x)); // local dir (dx, dy) -> world rotation.y = atan2(dy, dx)
          g.translate(x, h / 2 - 0.5, -y);
          piers.push(g);
        }
      });
      // one train per segment, shuttling end to end
      const curve = new THREE.CatmullRomCurve3(seg.pts.map(([x, y, h]) => new THREE.Vector3(x, h + 2.2, -y)));
      const car = new THREE.Mesh(new THREE.BoxGeometry(110, 3.2, 3.2), new THREE.MeshStandardMaterial({ color: line.colour, roughness: 0.5 }));
      car.castShadow = true;
      group.add(car);
      trains.push({ curve, car, len: seg.length_m, speed: 15 }); // m/s (~55 km/h). Estimate.
    }
    const deck = new THREE.Mesh(mergeGeometries(decks), deckMat);
    deck.castShadow = deck.receiveShadow = true;
    group.add(deck);
    if (piers.length) group.add(new THREE.Mesh(mergeGeometries(piers), pierMat));
    // stations: 120 m platform along the nearest segment direction
    for (const st of line.stations) {
      let best = null;
      for (const seg of line.segments) {
        seg.pts.forEach((p, i) => {
          const d = Math.hypot(p[0] - st.x, p[1] - st.y);
          if (!best || d < best.d) best = { d, seg, i };
        });
      }
      const { seg, i } = best;
      const a = seg.pts[Math.max(0, i - 2)];
      const b = seg.pts[Math.min(seg.pts.length - 1, i + 2)];
      const [x, y, h] = seg.pts[i];
      const g = new THREE.BoxGeometry(120, 1.2, DECK_W + 10);
      const roof = new THREE.BoxGeometry(110, 0.5, DECK_W + 12);
      roof.translate(0, 5.5, 0);
      const m = new THREE.Mesh(mergeGeometries([g, roof]), platformMat);
      m.rotation.y = Math.atan2(b[1] - a[1], b[0] - a[0]);
      m.position.set(x, h + 0.6, -y);
      m.castShadow = m.receiveShadow = true;
      m.userData.station = st;
      group.add(m);
    }
  }
  const tmp = new THREE.Vector3();
  group.userData.update = (t) => {
    for (const tr of trains) {
      // ping-pong along the segment, with a 20 s dwell at each end
      const run = tr.len / tr.speed;
      const period = 2 * (run + 20);
      const ph = (t + tr.len) % period;
      let u;
      if (ph < run) u = ph / run;
      else if (ph < run + 20) u = 1;
      else if (ph < 2 * run + 20) u = 1 - (ph - run - 20) / run;
      else u = 0;
      u = THREE.MathUtils.clamp(u, 0.02, 0.98);
      tr.curve.getPointAt(u, tr.car.position);
      tr.curve.getTangentAt(u, tmp);
      tr.car.rotation.y = Math.atan2(-tmp.z, tmp.x);
    }
  };
  return group;
}
