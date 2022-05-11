import * as THREE from "https://threejsfundamentals.org/threejs/resources/threejs/r110/build/three.module.js";
import { OrbitControls } from "https://threejsfundamentals.org/threejs/resources/threejs/r110/examples/jsm/controls/OrbitControls.js";
import { CSS3DRenderer, CSS3DObject } from "./CSS3DRenderer.js";

let scene, camera, renderer, renderer2, cube, mesh, pivot, controls, axesHelper;
let width = window.innerWidth;
let height = window.innerHeight;
const gridSize = 10;
const cubeSize = 1;

/* 
up : z--
down : z++
left : x--
right: x++
*/

init();
// animate();

const btnStart = document.querySelector("#btn-start");
const btnStop = document.querySelector("#btn-stop");

turnOn();
animate();
// btnStart.addEventListener("click", (e) => {
//   e.preventDefault();
//   turnOn();
//   animate();
// });

// btnStop.addEventListener("click", (e) => {
//   e.preventDefault();
//   turnOff();
// });

function turnOn() {
  document.querySelector("#webgl").appendChild(renderer.domElement);
  document.querySelector("#css").appendChild(renderer2.domElement);
}

function turnOff() {
  document.body.removeChild(renderer.domElement);
}

function init() {
  camera = new THREE.PerspectiveCamera(
    45,
    window.innerWidth / window.innerHeight,
    0.1,
    100
  );
  scene = new THREE.Scene();

  /* GRID */
  const gridHelper = new THREE.GridHelper(gridSize, gridSize);
  console.log(gridHelper);
  scene.add(gridHelper);

  /* CUBE */
  const geometry = new THREE.BoxGeometry(1, 1, 1);
  for (var i = 0; i < geometry.faces.length; i += 2) {
    var faceColor = Math.random() * 0xffffff;
    geometry.faces[i].color.setHex(faceColor);
    geometry.faces[i + 1].color.setHex(faceColor);
  }

  let material = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    vertexColors: THREE.FaceColors,
  });

  pivot = new THREE.Group();
  cube = new THREE.Mesh(geometry, material);
  cube.position.set(0.5, 0.5, 0.5);

  scene.add(pivot);
  pivot.add(cube);

  /* Welcome Text */
  let content = "<div>" + "Welcome to Sangwon's Lab!" + "</div>";
  let cssElement = createCSS3DObject(content);
  cssElement.position.set(0, 3, -5);
  scene.add(cssElement);

  let eventCall = "<div>Home</div>";
  let elem = createCSS3DObject(eventCall);
  elem.position.set(-5, 2, 0);
  elem.rotation.y = THREE.Math.degToRad(90);
  scene.add(elem);

  /* Beacons*/

  let beacons = [
    {
      name: "Home",
      pos: new THREE.Vector3(
        Math.round((Math.random() * gridSize) / 2) - 0.5,
        0,
        Math.round((Math.random() * gridSize) / 2) - 0.5
      ),
    },
    {
      name: "About",
      pos: new THREE.Vector3(
        Math.round((Math.random() * gridSize) / 2) - 0.5,
        0,
        Math.round((Math.random() * gridSize) / 2) - 0.5
      ),
    },
  ];

  beacons.forEach((beacon, idx) => {
    var faceColor = Math.random() * 0xffffff;
    let randomPos = new THREE.Vector3(
      Math.round((Math.random() * gridSize) / 2),
      0.5,
      Math.round((Math.random() * gridSize) / 2)
    );
    const geometry = new THREE.PlaneGeometry(1, 1);
    const material = new THREE.MeshBasicMaterial({
      color: faceColor,
      side: THREE.DoubleSide,
    });
    const plane = new THREE.Mesh(geometry, material);
    plane.rotation.x = THREE.Math.degToRad(90);
    plane.position.set(beacon.pos.x, beacon.pos.y, beacon.pos.z);
    console.log(plane.position);
    scene.add(plane);
  });

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer2 = new CSS3DRenderer();
  renderer2.setSize(window.innerWidth, window.innerHeight);
  renderer2.domElement.style.position = "absolute";
  renderer2.domElement.style.top = 0;

  camera.position.z = 10;
  camera.position.x = 10;
  camera.position.y = 10;

  controls = new OrbitControls(camera, renderer.domElement);
  controls = new OrbitControls(camera, renderer2.domElement);

  controls.update();
  controls.keys = {};

  class Controls {
    constructor(object, beacons) {
      this.object = object;
      this.zAxis = new THREE.Vector3(0, 0, 1);
      this.xAxis = new THREE.Vector3(1, 0, 0);
      this.beacons = beacons;

      window.addEventListener("keydown", (e) => {
        e.preventDefault();
        if (gsap.isTweening(this.object.rotation)) return;
        this.handleKeyDown(e.code);
      });
    }

    handleKeyDown(code) {
      switch (code) {
        case "ArrowUp":
          this.moveUp();
          break;
        case "ArrowDown":
          this.moveDown();
          break;
        case "ArrowLeft":
          this.moveLeft();
          break;
        case "ArrowRight":
          this.moveRight();
          break;
      }
    }

    updatePosition(pos) {
      const foundedBeacon = beacons.find((beacon) => {
        let correctedPos = Object.assign(new THREE.Vector3(), beacon.pos);
        correctedPos.x += -0.5;
        correctedPos.z += -0.5;

        return (
          correctedPos.x === pos.x &&
          correctedPos.y === pos.y &&
          correctedPos.z === pos.z
        );
      });

      if (foundedBeacon) {
        alert(foundedBeacon.name);
      }
    }

    moveUp() {
      const tl = gsap.timeline();
      tl.to(this.object.rotation, { duration: 0.3, x: `-=${Math.PI / 2}` });
      tl.then(() => {
        this.object.position.z -= 1;
        this.object.rotation.x = 0;
        this.object.children[0].rotateOnWorldAxis(this.xAxis, -Math.PI / 2);
        this.updatePosition(this.object.position);
      });
    }

    moveDown() {
      const tl = gsap.timeline();
      tl.set(this.object.children[0].position, { z: "-=1" });
      tl.set(this.object.position, { z: "+=1" });
      tl.to(this.object.rotation, { duration: 0.3, x: `+=${Math.PI / 2}` });
      tl.then(() => {
        this.object.rotation.x = 0;
        this.object.children[0].position.z += 1;
        this.object.children[0].rotateOnWorldAxis(this.xAxis, Math.PI / 2);
        this.updatePosition(this.object.position);
      });
    }

    moveLeft() {
      const tl = gsap.timeline();
      tl.to(this.object.rotation, { duration: 0.3, z: `+=${Math.PI / 2}` });
      tl.then(() => {
        this.object.position.x -= 1;
        this.object.rotation.z = 0;
        this.object.children[0].rotateOnWorldAxis(this.zAxis, Math.PI / 2);
        this.updatePosition(this.object.position);
      });
    }

    moveRight() {
      const tl = gsap.timeline();
      tl.set(this.object.children[0].position, { x: "-=1" });
      tl.set(this.object.position, { x: "+=1" });
      tl.to(this.object.rotation, { duration: 0.3, z: `-=${Math.PI / 2}` });
      tl.then(() => {
        this.object.rotation.z = 0;
        this.object.children[0].position.x += 1;
        this.object.children[0].rotateOnWorldAxis(this.zAxis, -Math.PI / 2);
        this.updatePosition(this.object.position);
      });
    }
  }

  let cubeControls = new Controls(pivot, beacons);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
  renderer2.render(scene, camera);
}

window.addEventListener(
  "resize",
  () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer2.setSize(window.innerWidth, window.innerHeight);
  },
  false
);

function createCSS3DObject(content) {
  // Convert the string to dom elements
  let wrapper = document.createElement("div");
  wrapper.innerHTML = content;
  let div = wrapper.firstChild;

  // div style
  div.style.width = "5px";
  div.style.height = "1px";
  div.style.textAlign = "start";
  div.style.fontSize = "0.5px";
  div.style.color = "white";
  div.style.background = "transparent";

  let object = new CSS3DObject(div);

  return object;
}

function createBeaconObject(content) {
  // Convert the string to dom elements

  return object;
}
