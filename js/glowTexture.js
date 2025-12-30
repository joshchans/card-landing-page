import * as THREE from "./three.module.js";

export function makeGlowTexture() {
  const size = 128;
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = size;

  const ctx = canvas.getContext("2d");
  const gradient = ctx.createRadialGradient(
    size / 2, size / 2, 0,
    size / 2, size / 2, size / 2
  );

  gradient.addColorStop(0.0, "rgba(255,212,0,1)");
  gradient.addColorStop(0.2, "rgba(255,212,0,0.9)");
  gradient.addColorStop(0.5, "rgba(255,212,0,0.35)");
  gradient.addColorStop(0.75,"rgba(255,212,0,0.12)");
  gradient.addColorStop(1.0, "rgba(255,212,0,0)");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, size, size);

  return new THREE.CanvasTexture(canvas);
}
