import * as THREE from "./three.module.js";
import { scene, camera, renderer, onResize } from "./scene.js";
import { setupLighting } from "./lighting.js";
import { loadPCB } from "./pcb.js";
import { setupScrollRotation } from "./scrollRotation.js";
import { setupLEDGlow } from "./ledGlow.js";
import { loadPhone, setupPhoneScroll } from "./phone.js";
import { setupBackground, updateBackground } from "./background.js";
import { setupLEDTrigger } from "./ledTrigger.js";

gsap.registerPlugin(ScrollTrigger);

/* ─────────────────────────────────────────────
   ROOT GROUP (GLOBAL OFFSET LIVES HERE)
   ───────────────────────────────────────────── */

const rootGroup = new THREE.Group();
scene.add(rootGroup);

// ⬆️ Move entire animation up/down here
rootGroup.position.y = 0.02;
rootGroup.position.x = -0.005;

/* ───────────────────────────────────────────── */

setupLighting(scene);

// Background now attaches to rootGroup
setupBackground(rootGroup);
updateBackground(0);

// Load PCB → then wire features
loadPCB(rootGroup).then(({ board, ledAnchor }) => {
  setupLEDGlow(board, ledAnchor);
  setupScrollRotation(board);
  setupLEDTrigger();

  // Load phone AFTER PCB so z-order feels right
  loadPhone(rootGroup).then((phone) => {
    setupPhoneScroll(phone);
  });
});

// Resize
window.addEventListener("resize", () => onResize(camera, renderer));

// Render loop
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();
