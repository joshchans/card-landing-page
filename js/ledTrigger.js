import { updateLEDGlow } from "./ledGlow.js";
import {
  initCardStatus,
  updateCardStatusFade
} from "./cardStatus.js";

export function setupLEDTrigger() {
  ScrollTrigger.create({
    trigger: "#scroll-led",

    // After motion has ended
    start: "70% bottom",
    end: "100% bottom",

    scrub: true,

    onUpdate: (self) => {
      const p = self.progress; // 0 → 1

      // LED behaviour (UNCHANGED)
      updateLEDGlow(p);

      // Initialise text once
      if (p > 0.05) {
        initCardStatus();
      }

      // Fade text in only near the end
      const TEXT_FADE_START = 0.6;
      let textOpacity = 0;

      if (p > TEXT_FADE_START) {
        textOpacity =
          (p - TEXT_FADE_START) / (1 - TEXT_FADE_START);
        textOpacity = Math.min(Math.max(textOpacity, 0), 1);
      }

      updateCardStatusFade(textOpacity);
    },

    onLeaveBack: () => {
      updateLEDGlow(0);
      updateCardStatusFade(0);
    }
  });
}
