import { updateBackground } from "./background.js";
import { updateLightFade } from "./lightFade.js";

function clamp01(x) {
  return Math.min(Math.max(x, 0), 1);
}

function easeInOut(t) {
  return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
}

export function setupScrollRotation(board, rootGroup) {
  // ROTATION (unchanged behaviour)
  const startY = Math.PI;
  const endRot = {
    x: -Math.PI / 2 - 1,
    y: Math.PI - 0.5,
    z: -0.5
  };

  // X SHIFT (start centred, end slightly left)
  const START_X = 0.0;       // centred at start
  const END_X   = -0.005;    // left at end (tweak this)
  const SHIFT_START_P = 0.0; // start shifting at 70% scroll
  const SHIFT_END_P   = 1.00; // finish at end

  // Make sure we start centred
  if (rootGroup) rootGroup.position.x = START_X;

  gsap.to(board.rotation, {
    x: endRot.x,
    y: startY + Math.PI * 2 - 0.5,
    z: Math.PI * 2 - 0.5,

    scrollTrigger: {
      trigger: "#scroll-motion",
      start: "top top",
      end: "bottom bottom",
      scrub: 0.4,

      onUpdate: (self) => {
        const p = self.progress;

        // existing fades
        updateBackground(p);
        updateLightFade(p);

        // shift rootGroup only near the end
        if (rootGroup) {
          const t = clamp01((p - SHIFT_START_P) / (SHIFT_END_P - SHIFT_START_P));
          const e = easeInOut(t);
          rootGroup.position.x = START_X + (END_X - START_X) * e;
        }
      }
    }
  });
}
