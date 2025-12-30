import * as THREE from "./three.module.js";

export function setupLighting(scene) {
scene.add(new THREE.AmbientLight(0xffffff, 0.6));

const hemi = new THREE.HemisphereLight(
  0xffffff, // sky
  0x444444, // ground
  1.0
);
scene.add(hemi);
