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

// ─────────────────────────────────────────────
// HAPTICS UNLOCK (required for mobile vibration)
// ─────────────────────────────────────────────

window.__hapticsUnlocked = false;

function unlockHaptics() {
  if (!window.__hapticsUnlocked && navigator.vibrate) {
    navigator.vibrate(1); // tiny unlock pulse
    window.__hapticsUnlocked = true;
    console.log("Haptics unlocked");
  }
}

window.addEventListener("touchstart", unlockHaptics, { once: true });
window.addEventListener("click", unlockHaptics, { once: true });

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
    // 🔥 FORCE COMPILE (mobile fix)
    renderer.compile(scene, camera);
    renderer.render(scene, camera);

    // Restore normal state next frame
    requestAnimationFrame(() => {
      phone.traverse((m) => {
        if (m.isMesh && m.material) {
          m.material.opacity = 1;
          m.material.transparent = false;
        }
      });

      phone.visible = false; // real hiding
    });

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
