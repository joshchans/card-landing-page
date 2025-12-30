import * as THREE from "./three.module.js";

export const scene = new THREE.Scene();
scene.background = new THREE.Color(0xffffff);

export const camera = new THREE.PerspectiveCamera(
  45,
  window.innerWidth / window.innerHeight,
  0.001,
  10
);
camera.position.set(0, 0.15, 0.3);
camera.lookAt(0, 0, 0);

export const renderer = new THREE.WebGLRenderer({
  canvas: document.getElementById("scene"),
  antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

export function onResize(camera, renderer) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
