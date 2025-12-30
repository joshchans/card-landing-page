import { updateLEDGlow } from "./ledGlow.js";
import {
  initCardStatus,
  updateCardStatusFade
} from "./cardStatus.js";

let dataShown = false;

export function setupLEDTrigger() {
  ScrollTrigger.create({
    trigger: "#scroll-led",
    start: "50% bottom",
    end: "100% bottom",
    scrub: true,

    onUpdate: (self) => {
      const p = self.progress;

      // LED (unchanged)
      updateLEDGlow(p);

      // Card recognised text
      if (p > 0.05) {
        initCardStatus();
      }

      const TEXT_FADE_START = 0.6;
      let textOpacity = 0;

      if (p > TEXT_FADE_START) {
        textOpacity =
          (p - TEXT_FADE_START) / (1 - TEXT_FADE_START);
        textOpacity = Math.min(Math.max(textOpacity, 0), 1);
      }

      updateCardStatusFade(textOpacity);

      // Data payload fade (slightly after title)
      const data = document.getElementById("card-data");
      if (data) {
        data.style.transition = "opacity 0.5s ease";
        data.style.opacity = Math.max(0, textOpacity - 0.15);
      }
    },

    onLeaveBack: () => {
      updateLEDGlow(0);
      updateCardStatusFade(0);

      const data = document.getElementById("card-data");
      if (data) data.style.opacity = 0;
    }
  });
}
