// Trees detected from the souvenir map's drawn crowns (tools/export_trees.py), as two instanced meshes.
import * as THREE from 'three';

export function buildTrees({ trees }) {
  const n = trees.length;
  const crownGeo = new THREE.IcosahedronGeometry(1, 0);
  crownGeo.scale(3.6, 3.2, 3.6);
  const trunkGeo = new THREE.CylinderGeometry(0.25, 0.35, 1, 5);
  trunkGeo.translate(0, 0.5, 0);
  const crowns = new THREE.InstancedMesh(crownGeo, new THREE.MeshStandardMaterial({ roughness: 0.95, flatShading: true }), n);
  const trunks = new THREE.InstancedMesh(trunkGeo, new THREE.MeshStandardMaterial({ color: 0x5b4632, roughness: 1 }), n);
  const m = new THREE.Matrix4();
  const q = new THREE.Quaternion();
  const c = new THREE.Color();
  const up = new THREE.Vector3(0, 1, 0);
  trees.forEach(([x, y, s], i) => {
    const trunkH = 3.5 * s;
    q.setFromAxisAngle(up, (i * 2.399) % (Math.PI * 2));
    m.compose(new THREE.Vector3(x, trunkH + 2.4 * s, -y), q, new THREE.Vector3(s, s, s));
    crowns.setMatrixAt(i, m);
    m.compose(new THREE.Vector3(x, 0, -y), q, new THREE.Vector3(s, trunkH, s));
    trunks.setMatrixAt(i, m);
    c.setHSL(0.24 + ((i * 0.618) % 1) * 0.07, 0.42, 0.26 + ((i * 0.382) % 1) * 0.1);
    crowns.setColorAt(i, c);
  });
  crowns.castShadow = true;
  crowns.receiveShadow = true;
  const g = new THREE.Group();
  g.add(crowns, trunks);
  return g;
}
