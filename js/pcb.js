import * as THREE from "./three.module.js";
import { GLTFLoader } from "./GLTFLoader.js";

export async function loadPCB(parent) {
  const loader = new GLTFLoader();

  return new Promise((resolve) => {
    loader.load("./models/board.glb", (gltf) => {
      const board = gltf.scene;

board.traverse((child) => {
  if (!child.isMesh || !child.material) return;

  const mats = Array.isArray(child.material)
    ? child.material
    : [child.material];

  mats.forEach((mat) => {
    switch (mat.name) {

      // 🪙 Shiny silver (silkscreen)
      case "mat_9":
        mat.color.setHex(0xFFFFFF);
        mat.metalness = 1;
        mat.roughness = 0.12;
        mat.emissive.set(0xcccccc);   // glow colour
        mat.emissiveIntensity = 1.2;  // strength
        break;

      // 🪙 Shiny silver (soldermask, same treatment as before)
      case "mat_10":
        mat.color.setHex(0xFFFFFF);
        mat.metalness = 0.5;
        mat.roughness = 0.18;
        break;

      // ⬜ White FR4
      case "mat_11":
        mat.color.setHex(0xffffff);
        mat.metalness = 0.0;
        mat.roughness = 0.85;
        break;

      case "mat_12":
        mat.color.setHex(0x000000);
        mat.metalness = 0.0;
        mat.roughness = 0.75;
        mat.map = null;
        mat.emissiveMap = null;
        mat.envMap = null;
        mat.envMapIntensity = 0;
        mat.vertexColors = false;
        break;
    }

    mat.needsUpdate = true;
  });
});

      parent.add(board);

      // Start pose (unchanged)
      board.rotation.set(
        -Math.PI / 2 - 0.4,
        Math.PI,
        0
      );
      board.position.set(0, 0, 0);

      // LED anchor (unchanged)
      const ledAnchor = board.getObjectByName(
        "LED_0603_1608Metric"
      );

      resolve({ board, ledAnchor });
    });
  });
}
