// Expo 67 pilot viewer.
// World frame: local metres from tools/common.py (MTM8 minus origin). local (x, y) -> three (x, 0, -y).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

const WATER = 0x87c8dc;
const toWorld = (x, y, h = 0) => new THREE.Vector3(x, h, -y);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;
document.getElementById('app').appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xbcd9ea);
scene.fog = new THREE.Fog(0xbcd9ea, 4000, 9000);

const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 5, 20000);
camera.position.set(-1400, 1600, -400);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(250, 0, -1400);
controls.maxPolarAngle = Math.PI * 0.49;
controls.enableDamping = true;
controls.update();

scene.add(new THREE.HemisphereLight(0xffffff, 0x667766, 1.6));
const sun = new THREE.DirectionalLight(0xffffff, 2.2);
sun.position.set(-800, 1200, 600); // afternoon sun from the south-west
sun.target.position.set(300, 0, -1500);
sun.castShadow = true;
Object.assign(sun.shadow.camera, { left: -2500, right: 2500, top: 2500, bottom: -2500, near: 10, far: 5000 });
sun.shadow.mapSize.set(4096, 4096);
scene.add(sun, sun.target);

// River surface below the map planes.
const water = new THREE.Mesh(
  new THREE.PlaneGeometry(20000, 20000),
  new THREE.MeshLambertMaterial({ color: WATER }),
);
water.rotation.x = -Math.PI / 2;
water.position.y = -3; // well below the map planes to avoid z-fighting at km viewing distances
scene.add(water);

const loader = new THREE.TextureLoader();
const georefInfo = [];

async function addMapPanel(name, lift) {
  const b = await (await fetch(`/georef/${name}.json`)).json();
  const tex = await loader.loadAsync(`/georef/${name}.webp`);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  const w = b.xmax - b.xmin;
  const h = b.ymax - b.ymin;
  const plane = new THREE.Mesh(
    new THREE.PlaneGeometry(w, h),
    new THREE.MeshLambertMaterial({ map: tex, transparent: true, alphaTest: 0.5 }),
  );
  plane.rotation.x = -Math.PI / 2;
  plane.position.copy(toWorld((b.xmin + b.xmax) / 2, (b.ymin + b.ymax) / 2, lift));
  plane.receiveShadow = true;
  scene.add(plane);
  georefInfo.push(`${name}: ${b.model}, ${b.n_gcps} GCPs, RMS ${b.rms_m} m`);
}

// Biosphère as a scale check: Fuller's dome, 76.2 m diameter, 61.5 m high (a 3/4 sphere).
function buildDome(lm) {
  const R = 38.1;
  const H = 61.5;
  const cy = H - R; // centre height above ground
  const theta = Math.acos(-cy / R); // polar angle where the sphere meets the ground
  const geo = new THREE.SphereGeometry(R, 40, 24, 0, Math.PI * 2, 0, theta);
  const group = new THREE.Group();
  const shell = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ color: 0xdfe8ee, transparent: true, opacity: 0.35, roughness: 0.3, side: THREE.DoubleSide }));
  // Icosahedral frame clipped at ground level (world y = 0) to the same 3/4 sphere.
  const frame = new THREE.LineSegments(
    new THREE.WireframeGeometry(new THREE.IcosahedronGeometry(R, 6)),
    new THREE.LineBasicMaterial({ color: 0x40505a, clippingPlanes: [new THREE.Plane(new THREE.Vector3(0, 1, 0), 0)] }),
  );
  renderer.localClippingEnabled = true;
  shell.castShadow = true;
  group.add(shell, frame);
  group.position.copy(toWorld(lm.x, lm.y, cy));
  scene.add(group);
}

const footprints = new THREE.Group();
scene.add(footprints);

async function addLandmarks() {
  const lms = await (await fetch('/data/landmarks.json')).json();
  const mat = new THREE.LineBasicMaterial({ color: 0xd0108a });
  const goto = document.getElementById('goto');
  for (const lm of lms) {
    const pts = lm.footprint.map(([x, y]) => toWorld(x, y, 1.5));
    footprints.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), mat));
    const opt = document.createElement('option');
    opt.value = lm.id;
    opt.textContent = lm.label;
    goto.appendChild(opt);
    if (lm.id === 'biosphere') buildDome(lm);
  }
  goto.addEventListener('change', () => {
    const lm = lms.find((l) => l.id === goto.value);
    if (!lm) return;
    const t = toWorld(lm.x, lm.y);
    controls.target.copy(t);
    camera.position.copy(t).add(new THREE.Vector3(-220, 180, 160));
    controls.update();
  });
}

document.getElementById('toggle-footprints').addEventListener('change', (e) => {
  footprints.visible = e.target.checked;
});

await Promise.all([addMapPanel('islands', 0), addMapPanel('havre', 0.05), addLandmarks()]);
document.getElementById('georef-info').textContent = georefInfo.join(' · ');

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
});
