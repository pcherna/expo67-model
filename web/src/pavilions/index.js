// Registry of pavilion builders, keyed by the id used in web/public/data/pavilions.json.
import * as THREE from 'three';
import canada, { peopleTree } from './canada.js';
import france from './france.js';
import habitat from './habitat.js';
import { explorer, producer } from './theme.js';
import us from './us.js';
import ussr from './ussr.js';

const builders = Object.fromEntries(
  [us, ussr, france, canada, peopleTree, habitat, explorer('explorer_life'), explorer('explorer_planet'), explorer('explorer_oceans'), producer]
    .map((b) => [b.id, b]),
);

/** Build and place one pavilion record. Unknown ids get a translucent marker so placement is visible. */
export function buildPavilion(rec) {
  const b = builders[rec.id];
  let obj;
  if (b) {
    obj = b.build(rec);
  } else {
    obj = new THREE.Mesh(
      new THREE.BoxGeometry(40, 12, 40),
      new THREE.MeshStandardMaterial({ color: 0xff6600, transparent: true, opacity: 0.5 }),
    );
    obj.position.y = 6;
  }
  const g = new THREE.Group();
  g.add(obj);
  g.position.set(rec.x, 0, -rec.y);
  g.rotation.y = THREE.MathUtils.degToRad(rec.rot_deg);
  g.name = rec.id;
  g.userData = rec;
  return g;
}
