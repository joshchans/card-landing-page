import * as THREE from "./three.module.js";
import { GLTFLoader } from "./GLTFLoader.js";

/* ─────────────────────────────────────────────
   EDIT THESE VALUES
   ───────────────────────────────────────────── */

// Scroll window where phone animates in
const PHONE_SCROLL_START = "0% top";
const PHONE_SCROLL_END   = "55% top";

// Phone start (offscreen / hidden pose)
const PHONE_START_POSITION = new THREE.Vector3(
  -0.0,   // x
  -1.0,   // y
  0.0    // z
);

// Phone final resting position (under PCB)
const PHONE_END_POSITION = new THREE.Vector3(
  0.037,  // x
 -0.055,   // y
  0.03    // z
);

// Phone start rotation (tumble pose)
const PHONE_START_ROTATION = new THREE.Euler(
  -4.2,   // x (forward flip)
 -26.8,   // y (yaw spin)
  2.4    // z (roll)
);

// Phone final orientation (DO NOT animate past this)
const PHONE_FINAL_ROTATION = new THREE.Euler(
 -0.25,  // x
  2.2,   // y
 -0.93   // z
);

// Optional settle tilt (set to 0 to disable)
const PHONE_SETTLE_TILT = 0.08;

/* ───────────────────────────────────────────── */

let phone;

export function loadPhone(scene) {
  const loader = new GLTFLoader();

  return new Promise((resolve) => {
    loader.load("./models/phone.glb", (gltf) => {
      phone = gltf.scene;
      scene.add(phone);

      // Start in tumble pose
      phone.rotation.copy(PHONE_START_ROTATION);
      phone.position.copy(PHONE_END_POSITION);

      // 👇 FORCE GPU WARM-UP
      phone.visible = true;

      phone.traverse((m) => {
        if (m.isMesh && m.material) {
          m.material.transparent = true;
          m.material.opacity = 0.0001;

          // Mobile safety
          m.material.clearcoat = 0;
          m.material.envMapIntensity = 0.3;
          m.material.needsUpdate = true;
        }
      });

      resolve(phone);
    });
  });
}
export function setupPhoneScroll(phone) {
  // Explicit visibility control
  ScrollTrigger.create({
    trigger: "#scroll-motion",
    start: PHONE_SCROLL_START,
    end: PHONE_SCROLL_END,

    onEnter: () => {
      phone.visible = true;
    },
    onLeaveBack: () => {
      phone.visible = false;
    }
  });

  // Fly-in translation
  gsap.fromTo(
    phone.position,
    {
      x: PHONE_START_POSITION.x,
      y: PHONE_START_POSITION.y,
      z: PHONE_START_POSITION.z
    },
    {
      x: PHONE_END_POSITION.x,
      y: PHONE_END_POSITION.y,
      z: PHONE_END_POSITION.z,

      scrollTrigger: {
        trigger: "#scroll-motion",
        start: PHONE_SCROLL_START,
        end: PHONE_SCROLL_END,
        scrub: 0.4
      }
    }
  );

  // Tumble-in rotation (lands EXACTLY at final pose)
  gsap.fromTo(
    phone.rotation,
    {
      x: PHONE_START_ROTATION.x,
      y: PHONE_START_ROTATION.y,
      z: PHONE_START_ROTATION.z
    },
    {
      x: PHONE_FINAL_ROTATION.x,
      y: PHONE_FINAL_ROTATION.y,
      z: PHONE_FINAL_ROTATION.z,

      scrollTrigger: {
        trigger: "#scroll-motion",
        start: PHONE_SCROLL_START,
        end: PHONE_SCROLL_END,
        scrub: 0.4
      }
    }
  );
  ScrollTrigger.create({
    trigger: "#scroll-motion",
    start: PHONE_SCROLL_END,
    once: true,
    onEnter: () => {
      phone.traverse(m => {
        if (m.isMesh) {
          m.matrixAutoUpdate = false;
          m.updateMatrix();
        }
      });
    }
  });
  // Optional settle tilt (micro polish)
  if (PHONE_SETTLE_TILT > 0) {
    gsap.fromTo(
      phone.rotation,
      { x: PHONE_FINAL_ROTATION.x + PHONE_SETTLE_TILT },
      {
        x: PHONE_FINAL_ROTATION.x,
        scrollTrigger: {
          trigger: "#scroll-motion",
          start: PHONE_SCROLL_START,
          end: PHONE_SCROLL_END,
          scrub: 0.4
        }
      }
    );
  }
}
