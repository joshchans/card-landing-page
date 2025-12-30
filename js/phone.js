import * as THREE from "./three.module.js";
import { GLTFLoader } from "./GLTFLoader.js";

/* ─────────────────────────────────────────────
   EDIT THESE VALUES
   ───────────────────────────────────────────── */

// Scroll window where phone animates in
const PHONE_SCROLL_START = "0% top";
const PHONE_SCROLL_END   = "60% top";

// Phone start (offscreen / hidden pose)
const PHONE_START_POSITION = new THREE.Vector3(
  -1,    // x
  0,// y (well below view)
  0     // z
);

// Phone final resting position (under PCB)
const PHONE_END_POSITION = new THREE.Vector3(
  0.029,     // x
  -0.05,// y (≈2 mm below PCB)
  0.04      // z
);

// Phone orientation (flat, back facing up)
const PHONE_FINAL_ROTATION = new THREE.Euler(
  -0.25, // x
  2.2,            // y
  -0.93             // z
);

// Optional settle tilt (set to 0 to disable)
const PHONE_SETTLE_TILT = 0.0;


/* ───────────────────────────────────────────── */

let phone;

export function loadPhone(scene) {
  const loader = new GLTFLoader();

  return new Promise((resolve) => {
    loader.load("./models/phone.glb", (gltf) => {
      phone = gltf.scene;
      scene.add(phone);

      // Start fully hidden
      phone.visible = false;

      // Set final orientation once
      phone.rotation.copy(PHONE_FINAL_ROTATION);

      // Place at final position (animation will override)
      phone.position.copy(PHONE_END_POSITION);

      resolve(phone);
    });
  });
}

export function setupPhoneScroll(phone) {
  // Control visibility explicitly
  ScrollTrigger.create({
    trigger: "#scroll-space",
    start: PHONE_SCROLL_START,
    end: PHONE_SCROLL_END,

    onEnter: () => {
      phone.visible = true;
    },
    onLeaveBack: () => {
      phone.visible = false;
    }
  });

  // Fly-in motion
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
        trigger: "#scroll-space",
        start: PHONE_SCROLL_START,
        end: PHONE_SCROLL_END,
        scrub: 0.4
      }
    }
  );

  // Optional settle tilt (very subtle)
  if (PHONE_SETTLE_TILT > 0) {
    gsap.fromTo(
      phone.rotation,
      { x: PHONE_FINAL_ROTATION.x + PHONE_SETTLE_TILT },
      {
        x: PHONE_FINAL_ROTATION.x,
        scrollTrigger: {
          trigger: "#scroll-space",
          start: PHONE_SCROLL_START,
          end: PHONE_SCROLL_END,
          scrub: 0.4
        }
      }
    );
  }
}
