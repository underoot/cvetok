import "./style.css";

import { Scene } from "three/src/scenes/Scene";
import { PerspectiveCamera } from "three/src/cameras/PerspectiveCamera";
import { WebGLRenderer } from "three/src/renderers/WebGLRenderer";
import { PointLight } from "three/src/lights/PointLight";
import { ImageBitmapLoader } from "three/src/loaders/ImageBitmapLoader";
import { PlaneGeometry } from "three/src/geometries/PlaneGeometry";
import { MeshPhongMaterial } from "three/src/materials/MeshPhongMaterial";
import { Mesh } from "three/src/objects/Mesh";
import { CanvasTexture } from "three/src/textures/CanvasTexture";
import { MeshBasicMaterial } from "three/src/materials/MeshBasicMaterial";
import { DoubleSide } from "three/src/constants";

import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { PointerLockControls } from "three/examples/jsm/controls/PointerLockControls.js";
import { AmbientLight } from "three";

const PERSON_HEIGHT = 2;

const scene = new Scene();
const camera = new PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);

camera.position.set(0, PERSON_HEIGHT);

scene.add(camera);

const renderer = new WebGLRenderer({ antialias: true });

scene.add(new AmbientLight(0xffffff, 0.6));

const pointLight = new PointLight(0xffffff, 2, 60);
pointLight.position.set(0, 3.5, 0);
scene.add(pointLight);

renderer.setSize(window.innerWidth, window.innerHeight);

window.addEventListener("resize", (e) => {
  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
});

document.body.appendChild(renderer.domElement);

const person = new PointerLockControls(camera, renderer.domElement);

document.body.addEventListener("click", () => {
  person.lock();
});

let moveKey = new Set();

let targetKeyCodes = [87, 68, 83, 65];

const onKeyDown = function (event) {
  if (!targetKeyCodes.includes(event.keyCode)) {
    return;
  }

  moveKey.add(event.keyCode);
};

const onKeyUp = function (event) {
  moveKey.delete(event.keyCode);
};

document.addEventListener("keydown", onKeyDown, false);
document.addEventListener("keyup", onKeyUp, false);

function animate(time) {
  if (camera.position.z < -9) {
    camera.position.z = -9;
  }

  if (camera.position.z > 9) {
    camera.position.z = 9;
  }

  if (camera.position.x > 9) {
    camera.position.x = 9;
  }

  if (camera.position.x < -9) {
    camera.position.x = -9;
  }

  for (const key of moveKey.values()) {
    switch (key) {
      case 87:
        person.moveForward(0.1);
        break;
      case 68:
        person.moveRight(0.1);
        break;
      case 83:
        person.moveForward(-0.1);
        break;
      case 65:
        person.moveRight(-0.1);
        break;
    }
  }

  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

async function start() {
  const loader = new GLTFLoader();
  const imageLoader = new ImageBitmapLoader();

  imageLoader.setOptions({ imageOrientation: "flipY" });

  const floor = new Mesh(
    new PlaneGeometry(20, 20),
    new MeshPhongMaterial({ color: 0xcc00ff, side: DoubleSide })
  );

  floor.position.set(0, 0, 0);
  floor.rotation.set(Math.PI / 2, 0, 0);

  scene.add(floor);

  const walls = new Array(4)
    .fill(null)
    .map(
      () =>
        new Mesh(
          new PlaneGeometry(20, 20),
          new MeshPhongMaterial({ color: 0xbbbbbb, side: DoubleSide })
        )
    );

  walls[0].position.set(0, 5, 10);
  walls[0].rotation.set(0, 0, 0);

  walls[1].position.set(10, 5, 0);
  walls[1].rotation.set(0, Math.PI / 2, 0);

  walls[2].position.set(0, 5, -10);
  walls[2].rotation.set(0, 0, 0);

  walls[3].position.set(-10, 5, 0);
  walls[3].rotation.set(0, Math.PI / 2, 0);

  walls.map((w) => scene.add(w));

  const addPainting = async ({ name, paintX, paintY, rotation = 0 } = {}) => {
    const bitmap = await imageLoader.loadAsync(name);
    const texture = new CanvasTexture(bitmap);
    const material = new MeshBasicMaterial({ map: texture, side: DoubleSide });
    const plane = new PlaneGeometry(1.6, 2.08);
    const mesh = new Mesh(plane, material);

    mesh.position.set(paintX, 2.5, paintY);
    mesh.rotation.set(0, rotation, 0);

    scene.add(mesh);
  };

  await addPainting({
    name: "a4_3.jpeg",
    paintX: 0,
    paintY: -9.9,
    rotation: 0,
  });

  await addPainting({
    name: "a3_1.jpeg",
    paintX: -9.9,
    paintY: 0,
    rotation: Math.PI / 2,
  });

  await addPainting({
    name: "a4_8.jpeg",
    paintX: 9.9,
    paintY: 0,
    rotation: -Math.PI / 2,
  });

  await addPainting({
    name: "a4_6.jpeg",
    paintX: 0,
    paintY: 9.9,
    rotation: Math.PI,
  });

  document.querySelector("#loading").textContent = "";

  animate();
}

start();
