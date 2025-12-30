import { updateLEDGlow } from "./ledGlow.js";
import {
  initCardStatus,
  updateCardStatusFade
} from "./cardStatus.js";

let hasTriggered = false;
let audioCtx;

function playPing() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();

  osc.type = "sine";
  osc.frequency.setValueAtTime(1800, audioCtx.currentTime);

  gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
  gain.gain.exponentialRampToValueAtTime(
    0.001,
    audioCtx.currentTime + 0.08
  );

  osc.connect(gain);
  gain.connect(audioCtx.destination);

  osc.start();
  osc.stop(audioCtx.currentTime + 0.08);
}

export function setupLEDTrigger() {
  ScrollTrigger.create({
    trigger: "#scroll-led",
    start: "50% bottom",
    end: "100% bottom",
    scrub: true,

    onUpdate: (self) => {
      const p = self.progress;

      updateLEDGlow(p);

      const TRIGGER_POINT = 0.08;
      if (p > TRIGGER_POINT && !hasTriggered) {
        // Haptic
        if ("vibrate" in navigator) {
          navigator.vibrate(15);
        }

        // Audio ping
        playPing();

        hasTriggered = true;
      }

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
    },

    onLeaveBack: () => {
      updateLEDGlow(0);
      updateCardStatusFade(0);
      hasTriggered = false;

      const data = document.getElementById("card-data");
      if (data) data.style.opacity = 0;
    }
  });
}
