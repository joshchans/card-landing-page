import * as THREE from "./three.module.js";
import { GLTFLoader } from "./GLTFLoader.js";

export async function loadPCB(scene) {
  const loader = new GLTFLoader();

  return new Promise((resolve) => {
    loader.load("./models/board.glb", (gltf) => {
      const board = gltf.scene;
      scene.add(board);

      // Start pose
      board.rotation.set(
        -Math.PI / 2 - 0.4,
        Math.PI,
        0
      );
      board.position.set(0, 0, 0);

      // Find LED anchor
      const ledAnchor = board.getObjectByName("LED_0603_1608Metric");

      resolve({ board, ledAnchor });
    });
  });
}
