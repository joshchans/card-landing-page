import * as THREE from "./three.module.js";

export function setupLighting(scene) {
  scene.add(new THREE.AmbientLight(0xffffff, 1.1));

  const key = new THREE.DirectionalLight(0xffffff, 0.8);
  key.position.set(0.3, 0.6, 0.4);
  scene.add(key);

  const fill = new THREE.DirectionalLight(0xffffff, 0.4);
  fill.position.set(-0.4, 0.2, 0.3);
  scene.add(fill);
}
