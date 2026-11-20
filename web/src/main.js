// Expo 67 pilot viewer.
// World frame: local metres from tools/common.py (MTM8 minus origin). local (x, y) -> three (x, 0, -y).
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { buildPavilion } from './pavilions/index.js';

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
  georefInfo.push(`${name}: ${b.model}, ${b.n_gcps} hand + ${b.n_shore} shore GCPs, held-out error ${b.loocv_m} m`);
}

const footprints = new THREE.Group();
scene.add(footprints);
const goto = document.getElementById('goto');
const places = new Map(); // id -> {x, y, label}, for the fly-to list and ?view=<id>

function addPlace(id, label, x, y) {
  places.set(id, { x, y, label });
  const opt = document.createElement('option');
  opt.value = id;
  opt.textContent = label;
  goto.appendChild(opt);
}

function flyTo(id) {
  const p = places.get(id);
  if (!p) return;
  const t = toWorld(p.x, p.y);
  controls.target.copy(t);
  camera.position.copy(t).add(new THREE.Vector3(-170, 110, 140));
  controls.update();
}

async function addLandmarks() {
  const lms = await (await fetch('/data/landmarks.json')).json();
  const lineMat = new THREE.LineBasicMaterial({ color: 0xd0108a });
  for (const lm of lms) {
    const pts = lm.footprint.map(([x, y]) => toWorld(x, y, 1.5));
    footprints.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
  }
}

async function addPavilions() {
  const recs = await (await fetch('/data/pavilions.json')).json();
  for (const rec of recs) {
    scene.add(buildPavilion(rec));
    addPlace(rec.id, `${rec.name}${rec.map_no ? ` (${rec.map_no})` : ''}`, rec.x, rec.y);
  }
}

goto.addEventListener('change', () => flyTo(goto.value));
document.getElementById('toggle-footprints').addEventListener('change', (e) => {
  footprints.visible = e.target.checked;
});

await Promise.all([addMapPanel('islands', 0), addMapPanel('havre', 0.05), addLandmarks(), addPavilions()]);
document.getElementById('georef-info').textContent = georefInfo.join(' · ');
const view = new URLSearchParams(location.search).get('view');
if (view) flyTo(view);

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

let statsShown = false;
renderer.setAnimationLoop(() => {
  controls.update();
  renderer.render(scene, camera);
  if (!statsShown) {
    statsShown = true;
    const { triangles, calls } = renderer.info.render;
    const msg = `${places.size} models · ${(triangles / 1000).toFixed(0)}k triangles · ${calls} draw calls`;
    document.getElementById('stats').textContent = msg;
    console.log(`[stats] ${msg}`);
  }
});
