import { scene, camera, renderer, onResize } from "./scene.js";
import { setupLighting } from "./lighting.js";
import { loadPCB } from "./pcb.js";
import { setupScrollRotation } from "./scrollRotation.js";
import { setupLEDGlow } from "./ledGlow.js";
import { loadPhone, setupPhoneScroll } from "./phone.js";
import { setupBackground, updateBackground } from "./background.js";

import "./three.module.js"; // ensure THREE is loaded

gsap.registerPlugin(ScrollTrigger);

setupLighting(scene);
setupBackground(scene);
updateBackground(0);

// Load PCB → then wire features
loadPCB(scene).then(({ board, ledAnchor }) => {
  setupLEDGlow(board, ledAnchor);
  setupScrollRotation(board);

  // Load phone AFTER PCB so z-order feels right
  loadPhone(scene).then((phone) => {
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
