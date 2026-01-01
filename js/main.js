import * as THREE from "./three.module.js";
import { scene, camera, renderer, onResize } from "./scene.js";
import { setupLighting } from "./lighting.js";
import { loadPCB } from "./pcb.js";
import { setupScrollRotation } from "./scrollRotation.js";
import { setupLEDGlow } from "./ledGlow.js";
import { loadPhone, setupPhoneScroll } from "./phone.js";
import { setupBackground, updateBackground } from "./background.js";
import { setupLEDTrigger } from "./ledTrigger.js";

renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.shadowMap.enabled = false;
gsap.registerPlugin(ScrollTrigger);

// ─────────────────────────────────────────────
// AUTO SCROLL ON FIRST TOUCH / CLICK
// ─────────────────────────────────────────────

const touchHint = document.getElementById("touch-to-start");

function hideTouchHint() {
  if (touchHint) {
    touchHint.classList.add("hidden");
  }
}

// Adjust this: higher = slower scroll
const AUTO_SCROLL_DURATION = 4200; // ms

let autoScrolled = false;

function autoScrollToBottom() {
  if (autoScrolled) return;
  autoScrolled = true;

  const start = window.scrollY;
  const end =
    document.documentElement.scrollHeight - window.innerHeight;

  const startTime = performance.now();

  function step(now) {
    const t = Math.min((now - startTime) / AUTO_SCROLL_DURATION, 1);

    // easeInOut
    const eased = t < 0.5
      ? 2 * t * t
      : 1 - Math.pow(-2 * t + 2, 2) / 2;

    window.scrollTo(0, start + (end - start) * eased);

    if (t < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

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

function firstInteraction() {
  unlockHaptics();
  autoScrollToBottom();
  hideTouchHint();
}

window.addEventListener("touchstart", firstInteraction, { once: true });
window.addEventListener("click", firstInteraction, { once: true });

function optimiseMaterials(object) {
    object.traverse((m) => {
        if (!m.isMesh || !m.material) return;

          const mats = Array.isArray(m.material)
            ? m.material
            : [m.material];

          mats.forEach(mat => {
                  mat.clearcoat = 0;
                  mat.clearcoatRoughness = 0;
                  mat.transmission = 0;
                  mat.thickness = 0;

                  mat.envMapIntensity = 0.3;
                  mat.roughness = Math.max(mat.roughness ?? 0.6, 0.6);
                  mat.metalness = Math.min()
          })
    })
}

/* ─────────────────────────────────────────────
   ROOT GROUP (GLOBAL OFFSET LIVES HERE)
   ───────────────────────────────────────────── */

const rootGroup = new THREE.Group();
scene.add(rootGroup);

// ⬆️ Move entire animation up/down here
rootGroup.position.y = 0.02;
rootGroup.position.x = -0.000;

/* ───────────────────────────────────────────── */

setupLighting(scene);

// Background now attaches to rootGroup
setupBackground(rootGroup);
updateBackground(0);

// Load PCB → then wire features
loadPCB(rootGroup).then(({ board, ledAnchor }) => {
  setupLEDGlow(board, ledAnchor);
  setupScrollRotation(board, rootGroup);
  setupLEDTrigger();

  // Load phone AFTER PCB so z-order feels right
  loadPhone(rootGroup).then((phone) => {
    // 🔥 FORCE GPU COMPILE (mobile hitch fix)
    renderer.compile(scene, camera);
    renderer.render(scene, camera);

    requestAnimationFrame(() => {
      phone.traverse((m) => {
        if (m.isMesh && m.material) {
          m.material.opacity = 1;
          m.material.transparent = false;
        }
      });

      phone.visible = false;
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
