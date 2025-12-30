import * as THREE from "./three.module.js";

export function setupLighting(scene) {
  scene.environment = null;
  // Soft neutral ambient (don’t overpower reflections)
  const ambient = new THREE.AmbientLight(0xffffff, 0.1);
  scene.add(ambient);

  // Key light (main definition)
  const key = new THREE.DirectionalLight(0xffffff, 0.7);
  key.position.set(0.1, 0.1, 0.05);
  scene.add(key);

  //// Fill light (softens contrast)
  const fill = new THREE.DirectionalLight(0xf0f0f0, 0.2);
  fill.position.set(-0.06, 0.03, 0.2);
  scene.add(fill);

  //// Rim / edge light (makes metal pop)
  const rim = new THREE.DirectionalLight(0xffffff, 0.2);
  rim.position.set(0, 0.0, -0.2);
  scene.add(rim);
}
