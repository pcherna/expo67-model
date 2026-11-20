// Registry of pavilion builders, keyed by the id used in web/public/data/pavilions.json.
import * as THREE from 'three';
import habitat from './habitat.js';
import us from './us.js';

const builders = { us, habitat };

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
