import * as THREE from "./three.module.js";
import { makeGlowTexture } from "./glowTexture.js";

let ledMesh, ledLight, glowSprite;

export function setupLEDGlow(board, ledAnchor) {
  if (!ledAnchor) return;

  ledMesh = ledAnchor;

  // Emissive
  ledMesh.traverse((m) => {
    if (m.isMesh) {
      m.material.emissive.set(0xffd400);
      m.material.emissiveIntensity = 0;
    }
  });

  // Subtle point light
  ledLight = new THREE.PointLight(0xffd400, 0, 0.1);
  ledAnchor.getWorldPosition(ledLight.position);
  board.add(ledLight);
  board.worldToLocal(ledLight.position);

  // Glow sprite
  const glowMat = new THREE.SpriteMaterial({
    map: makeGlowTexture(),
    transparent: true,
    opacity: 0,
    blending: THREE.AdditiveBlending,
    depthWrite: false
  });

  glowSprite = new THREE.Sprite(glowMat);
  glowSprite.position.copy(ledLight.position);
  glowSprite.scale.set(0.02, 0.02, 1);
  board.add(glowSprite);
}

// Called from scrollRotation.js
export function updateLEDGlow(fade) {
  if (!ledMesh || !ledLight || !glowSprite) return;

  ledMesh.traverse((m) => {
    if (m.isMesh) {
      m.material.emissiveIntensity = fade * 0.8;
    }
  });

  ledLight.intensity = fade * 0.6;
  glowSprite.material.opacity = fade * 0.25;
}
