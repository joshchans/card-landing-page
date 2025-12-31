import { updateLEDGlow } from "./ledGlow.js";
import {
  initCardStatus,
  updateCardStatusFade
} from "./cardStatus.js";

let hasTriggered = false;
let audioCtx;
let hapticsUnlocked = false;

function unlockHapticsAndAudio() {
  if (!hapticsUnlocked) {
    if (navigator.vibrate) navigator.vibrate(1);

    if (audioCtx && audioCtx.state === "suspended") {
      audioCtx.resume();
    }

    hapticsUnlocked = true;
    console.log("Haptics + audio unlocked");
  }
}

window.addEventListener("touchstart", unlockHapticsAndAudio, { once: true });
window.addEventListener("click", unlockHapticsAndAudio, { once: true });

function playPing() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  const now = audioCtx.currentTime;

  // Master output
  const master = audioCtx.createGain();
  master.gain.value = 0.2;
  master.connect(audioCtx.destination);

  // --- Reverb tail (longer, cleaner) ---
  const delay = audioCtx.createDelay();
  delay.delayTime.value = 0.045;

  const feedback = audioCtx.createGain();
  feedback.gain.value = 0.55; // longer tail

  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(master);

  // === Tone 1 (main chime) ===
  const osc1 = audioCtx.createOscillator();
  const gain1 = audioCtx.createGain();

  osc1.type = "sine";
  osc1.frequency.setValueAtTime(880, now); // A5

  gain1.gain.setValueAtTime(0.0001, now);
  gain1.gain.exponentialRampToValueAtTime(0.22, now + 0.05);
  gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

  osc1.connect(gain1);
  gain1.connect(master);
  gain1.connect(delay);

  // === Tone 2 (reply chime, clearly later) ===
  const osc2 = audioCtx.createOscillator();
  const gain2 = audioCtx.createGain();

  osc2.type = "sine";
  osc2.frequency.setValueAtTime(1760, now + 0.12); // A6

  gain2.gain.setValueAtTime(0.0001, now + 0.12);
  gain2.gain.exponentialRampToValueAtTime(0.18, now + 0.17);
  gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

  osc2.connect(gain2);
  gain2.connect(master);
  gain2.connect(delay);

  // Play
  osc1.start(now);
  osc2.start(now + 0.12);

  osc1.stop(now + 0.7);
  osc2.stop(now + 0.85);
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

      const TRIGGER_POINT = 1.0;
      if (p > TRIGGER_POINT && !hasTriggered) {
        // Haptic
        if (hapticsUnlocked && navigator.vibrate) {
          navigator.vibrate([8, 16, 8]);
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
