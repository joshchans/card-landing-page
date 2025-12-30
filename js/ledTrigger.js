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

  const now = audioCtx.currentTime;

  // Master gain
  const master = audioCtx.createGain();
  master.gain.value = 0.18;
  master.connect(audioCtx.destination);

  // --- Fake reverb (short, airy) ---
  const delay = audioCtx.createDelay();
  delay.delayTime.value = 0.035;

  const feedback = audioCtx.createGain();
  feedback.gain.value = 0.35;

  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(master);

  // --- Tone 1 (lower chime) ---
  const osc1 = audioCtx.createOscillator();
  const gain1 = audioCtx.createGain();

  osc1.type = "sine";
  osc1.frequency.setValueAtTime(880, now); // A5

  gain1.gain.setValueAtTime(0.0001, now);
  gain1.gain.exponentialRampToValueAtTime(0.15, now + 0.02);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

  osc1.connect(gain1);
  gain1.connect(master);
  gain1.connect(delay);

  // --- Tone 2 (higher sparkle, slightly delayed) ---
  const osc2 = audioCtx.createOscillator();
  const gain2 = audioCtx.createGain();

  osc2.type = "sine";
  osc2.frequency.setValueAtTime(1760, now + 0.03); // A6

  gain2.gain.setValueAtTime(0.0001, now + 0.03);
  gain2.gain.exponentialRampToValueAtTime(0.12, now + 0.05);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

  osc2.connect(gain2);
  gain2.connect(master);
  gain2.connect(delay);

  // Start / stop
  osc1.start(now);
  osc2.start(now + 0.03);

  osc1.stop(now + 0.3);
  osc2.stop(now + 0.35);
}

export function setupLEDTrigger() {
  ScrollTrigger.create({
    trigger: "#scroll-led",
    start: "60% bottom",
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
