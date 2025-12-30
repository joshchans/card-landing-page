// Background light fade: space → light
// Robust to fast scroll in BOTH directions

const START_LEVEL = 30;   // not pure black (premium dark)
const END_LEVEL   = 300;  // pure white

let current = START_LEVEL;
let target = START_LEVEL;

export function updateLightFade(progress) {
  const fadeStart = 0.2;

  // Map scroll → target brightness
  if (progress < fadeStart) {
    target = START_LEVEL;
  } else {
    const t = (progress - fadeStart) / (1 - fadeStart);
    target = START_LEVEL + t * (END_LEVEL - START_LEVEL);
  }

  // HARD convergence near ends (both directions)
  if (progress > 0.98) {
    current = END_LEVEL;
  } else if (progress < 0.02) {
    current = START_LEVEL;
  } else {
    // Smooth interpolation in the middle
    current += (target - current) * 0.12;
  }

  const c = Math.round(current);
  document.body.style.backgroundColor =
    `rgb(${c}, ${c}, ${c})`;
}
