import { updateLEDGlow } from "./ledGlow.js";
import {
  initCardStatus,
  updateCardStatusFade
} from "./cardStatus.js";

export function setupLEDTrigger() {
  const scrollHint = document.getElementById("scroll-hint");

  ScrollTrigger.create({
    trigger: "#scroll-led",
    start: "50% bottom",
    end: "100% bottom",
    scrub: true,

    onUpdate: (self) => {
      const p = self.progress;

      // LED glow
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

      const data = document.getElementById("card-data");
      if (data) {
        data.style.opacity = Math.max(0, textOpacity - 0.15);
      }

      // 🔽 Scroll hint fades OUT once LED section starts
      if (scrollHint) {
        scrollHint.style.opacity = p < 0.05 ? 1 : 0;
      }
    },

    onLeaveBack: () => {
      // Scrolling UP past LED section → restore scroll hint
      if (scrollHint) {
        scrollHint.style.opacity = 1;
      }

      updateLEDGlow(0);
      updateCardStatusFade(0);

      const data = document.getElementById("card-data");
      if (data) data.style.opacity = 0;
    }
  });
}
