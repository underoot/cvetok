import './style.css'

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { PointerLockControls } from 'three/examples/jsm/controls/PointerLockControls.js';

const PERSON_HEIGHT = 250;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  Math.pow(1000, 2) + Math.pow(1000, 2)
);

camera.position.set(0, PERSON_HEIGHT);

const renderer = new THREE.WebGLRenderer();

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set( 0, 500, 0 );
scene.add( pointLight );

renderer.setSize( window.innerWidth, window.innerHeight );

window.addEventListener('resize', (e) => {
  renderer.setSize( window.innerWidth, window.innerHeight );
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

document.body.appendChild( renderer.domElement );

const person = new PointerLockControls(camera, renderer.domElement);

document.body.addEventListener('click', () => {
  person.lock();
});

let moveKey = new Set();

let targetKeyCodes = [87, 68, 83, 65];

const onKeyDown = function (event) {
  if (!targetKeyCodes.includes(event.keyCode)) {
    return;
  }

  moveKey.add(event.keyCode);
}

const onKeyUp = function (event) {
  moveKey.delete(event.keyCode);
}

document.addEventListener('keydown', onKeyDown, false)
document.addEventListener('keyup', onKeyUp, false);

function animate(time) {
  if (camera.position.z < -980) {
    camera.position.z = -980;
  }

  if (camera.position.z > 980) {
    camera.position.z = 980;
  }

  if (camera.position.x > 980) {
    camera.position.x = 980;
  }

  if (camera.position.x < -980) {
    camera.position.x = -980;
  }

  for (const key of moveKey.values()) {
    switch (key) {
      case 87:
        person.moveForward(10)
        break
      case 68:
        person.moveRight(10)
        break
      case 83:
        person.moveForward(-10)
        break
      case 65:
        person.moveRight(-10)
        break
    }
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

async function start() {
  const loader = new GLTFLoader();
  const imageLoader = new THREE.ImageBitmapLoader();

  imageLoader.setOptions( { imageOrientation: 'flipY' } );

  const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(2000, 2000),
    new THREE.MeshPhongMaterial({ color: 0xCC00FF, side: THREE.DoubleSide })
  );

  floor.position.set(0, 0, 0);
  floor.rotation.set(Math.PI / 2, 0, 0);

  scene.add(floor);

  const walls = new Array(4).fill(null).map(() => (
    new THREE.Mesh(
      new THREE.PlaneGeometry(2000, 1000),
      new THREE.MeshPhongMaterial({ color: 0xBBBBBB, side: THREE.DoubleSide })
    )
  ));

  walls[0].position.set(0, 500, 1000);
  walls[0].rotation.set(0, 0, 0);

  walls[1].position.set(1000, 500, 0);
  walls[1].rotation.set(0, Math.PI / 2, 0);

  walls[2].position.set(0, 500, -1000);
  walls[2].rotation.set(0, 0, 0);

  walls[3].position.set(-1000, 500, 0);
  walls[3].rotation.set(0, Math.PI / 2, 0);

  walls.map(w => scene.add(w));

  const addPainting = async ({name, paintX, paintY, frameX, frameY, rotation = 0} = {}) => {
    const bitmap = await imageLoader.loadAsync(name);
    const texture = new THREE.CanvasTexture(bitmap);
    const material = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
    const plane = new THREE.PlaneGeometry(160, 208);
    const mesh = new THREE.Mesh(plane, material);

    const frame = await loader.loadAsync('frame/frame.gltf');

    mesh.position.set(paintX, 323, paintY);
    mesh.rotation.set(0, rotation, 0);

    frame.scene.position.set(frameX, 200, frameY);
    frame.scene.rotation.set(0, rotation, 0);

    scene.add(frame.scene);
    scene.add(mesh);
  }

  await addPainting({
    name: 'a4_3.jpeg', 
    frameX: 0,
    paintX: 0,
    frameY: -1000,
    paintY: -990,
    rotation: 0
  });

  await addPainting({
    name: 'a3_1.jpeg', 
    frameX: -1000,
    paintX: -990,
    frameY: 0,
    paintY: 0,
    rotation: Math.PI / 2
  });

  await addPainting({
    name: 'a4_8.jpeg', 
    frameX: 1000,
    paintX: 990,
    frameY: 0,
    paintY: 0,
    rotation: -Math.PI / 2
  });

  await addPainting({
    name: 'a4_6.jpeg', 
    frameX: 0,
    paintX: 0,
    frameY: 1000,
    paintY: 990,
    rotation: Math.PI
  });

  scene.add(person.getObject());

  document.querySelector('#loading').textContent = '';

  animate();
}

start();
