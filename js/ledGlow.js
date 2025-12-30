import * as THREE from "./three.module.js";
import { makeGlowTexture } from "./glowTexture.js";

let ledMesh, ledLight, glowSprite;

export function setupLEDGlow(board, ledAnchor) {
  if (!ledAnchor) return;

  ledMesh = ledAnchor;

  // Emissive (visual only)
  ledMesh.traverse((m) => {
    if (m.isMesh && m.material) {
      m.material.emissive = new THREE.Color(0xffd400);
      m.material.emissiveIntensity = 0;
      m.material.side = THREE.FrontSide; // prevent bleed-through
    }
  });

  // --- LED POINT LIGHT (PHYSICALLY CLAMPED) ---
  ledLight = new THREE.PointLight(
    0xffd400,
    0,        // intensity (animated)
    0.015,    // VERY short range → no back bleed
    2         // decay
  );

  // Position at LED, then push slightly forward
  ledAnchor.getWorldPosition(ledLight.position);
  board.add(ledLight);
  board.worldToLocal(ledLight.position);

  // Push light out of PCB plane (critical)
  ledLight.position.z += 0.0015;

  // --- GLOW SPRITE (visual halo only) ---
  const glowMat = new THREE.SpriteMaterial({
    map: makeGlowTexture(),
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false
  });

  glowSprite = new THREE.Sprite(glowMat);
  glowSprite.position.copy(ledLight.position);
  glowSprite.scale.set(0.02, 0.02, 1);
  board.add(glowSprite);
}

// Called from scroll logic
export function updateLEDGlow(fade) {
  if (!ledMesh || !ledLight || !glowSprite) return;

  // Emissive glow on LED body
  ledMesh.traverse((m) => {
    if (m.isMesh && m.material) {
      m.material.emissiveIntensity = fade * 0.9;
    }
  });

  // Light intensity (kept low on purpose)
  ledLight.intensity = fade * 0.7;

  // Halo opacity
  glowSprite.material.opacity = fade * 0.3;
}
