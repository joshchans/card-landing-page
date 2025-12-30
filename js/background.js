import * as THREE from "./three.module.js";

let dust;
let positions;
let speeds;

// scroll-coupled intensity
let currentIntensity = 0;
let targetIntensity = 0;

// easing helper
function easeInQuad(t) {
  return t * t;
}

export function setupBackground(scene) {
  const COUNT = 400;

  positions = new Float32Array(COUNT * 3);
  speeds = new Float32Array(COUNT);

  for (let i = 0; i < COUNT; i++) {
    positions[i * 3 + 0] = (Math.random() - 0.5) * 3.0; // x spread
    positions[i * 3 + 1] = Math.random() * 6 - 3;      // y spread
    positions[i * 3 + 2] = -Math.random() * 2.0;       // closer to camera

    // 🔑 slightly faster overall
    speeds[i] = Math.random() * 1.0 + 0.6;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );

  const material = new THREE.PointsMaterial({
    color: 0xf6f9ff,        // bright cool white
    size: 0.016,            // clearly visible, still subtle
    transparent: true,
    opacity: 0.0,           // start invisible
    depthWrite: false,
    sizeAttenuation: true
  });

  dust = new THREE.Points(geometry, material);
  scene.add(dust);

  // initialise state to avoid snap on first scroll
  currentIntensity = 0;
  targetIntensity = 0;
}

export function updateBackground(progress) {
  if (!dust) return;

  /*
    progress: 0 → 1
    early: deep space
    late: arriving into light
  */

  // intensity envelope
  if (progress < 0.75) {
    targetIntensity = progress / 0.75;
  } else {
    targetIntensity = 1 - (progress - 0.75) / 0.25;
  }

  targetIntensity = Math.max(0, Math.min(1, targetIntensity));

  // smooth easing (prevents snapping)
  currentIntensity += (targetIntensity - currentIntensity) * 0.08;

  // acceleration near the end
  let accel = 1;
  if (progress > 0.7) {
    const t = (progress - 0.7) / 0.3; // 0 → 1
    accel = 1 + easeInQuad(Math.min(t, 1)) * 3.5;
  }

  // move dust upward (falling illusion)
  for (let i = 0; i < positions.length / 3; i++) {
    positions[i * 3 + 1] +=
      speeds[i] * 0.03 * currentIntensity * accel;

    if (positions[i * 3 + 1] > 3) {
      positions[i * 3 + 1] = -3;
    }
  }

  dust.geometry.attributes.position.needsUpdate = true;

  // fade particles as we reach the light
  dust.material.opacity = 0.55 * currentIntensity;
}
