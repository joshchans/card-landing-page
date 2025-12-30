import { updateLEDGlow } from "./ledGlow.js";
import { updateBackground } from "./background.js";
import { updateLightFade } from "./lightFade.js";

export function setupScrollRotation(board) {
  const startY = Math.PI;
  const endRot = {
    x: -Math.PI / 2 - 1,
    y: Math.PI - 0.5,
    z: -0.5
  };

  gsap.to(board.rotation, {
    x: endRot.x,
    y: startY + Math.PI * 2 - 0.5,
    z: Math.PI * 2 - 0.5,

    scrollTrigger: {
      trigger: "#scroll-space",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.4,

      onUpdate: (self) => {
        const p = self.progress;
        const fadeStart = 0.85;
        let fade = 0;

        if (p > fadeStart) {
          fade = (p - fadeStart) / (1 - fadeStart);
          fade = Math.min(Math.max(fade, 0), 1);
        }

        updateLEDGlow(fade);
        updateBackground(p);
        updateLightFade(p);
      }
    }
  });
}
