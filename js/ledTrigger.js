import { updateLEDGlow } from "./ledGlow.js";
import {
  initCardStatus,
  updateCardStatusFade
} from "./cardStatus.js";

let hasTriggered = false;
let audioCtx = null;
let unlocked = false;

/* ─────────────────────────────────────────────
   MOBILE UNLOCK (AUDIO + HAPTICS)
   MUST CREATE AudioContext DURING USER GESTURE
   ───────────────────────────────────────────── */

function unlockAudioAndHaptics() {
  if (unlocked) return;

  // Create audio context DURING gesture (critical)
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();

  if (audioCtx.state === "suspended") {
    audioCtx.resume();
  }

  if (navigator.vibrate) {
    navigator.vibrate(1); // tiny unlock pulse
  }

  unlocked = true;
  console.log("Audio + haptics unlocked");
}

window.addEventListener("touchstart", unlockAudioAndHaptics, { once: true });
window.addEventListener("click", unlockAudioAndHaptics, { once: true });

/* ─────────────────────────────────────────────
   APPLE-PAY-STYLE DOUBLE CHIME
   ───────────────────────────────────────────── */

function playPing() {
  if (!unlocked || !audioCtx) return;

  const now = audioCtx.currentTime;

  const master = audioCtx.createGain();
  master.gain.value = 0.22;
  master.connect(audioCtx.destination);

  // Reverb tail
  const delay = audioCtx.createDelay();
  delay.delayTime.value = 0.045;

  const feedback = audioCtx.createGain();
  feedback.gain.value = 0.55;

  delay.connect(feedback);
  feedback.connect(delay);
  delay.connect(master);

  function tone(freq, start, peak, end, dur) {
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, start);

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(peak, start + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, end);

    osc.connect(gain);
    gain.connect(master);
    gain.connect(delay);

    osc.start(start);
    osc.stop(start + dur);
  }

  // Main tone
  tone(880, now, 0.22, now + 0.45, 0.7);

  // Reply tone (clearly delayed)
  tone(1760, now + 0.12, 0.18, now + 0.6, 0.85);
}

/* ─────────────────────────────────────────────
   SCROLL TRIGGER
   ───────────────────────────────────────────── */

export function setupLEDTrigger() {
  ScrollTrigger.create({
    trigger: "#scroll-led",
    start: "60% bottom",
    end: "100% bottom",
    scrub: true,

    onUpdate: (self) => {
      const p = self.progress;

      // LED intensity
      updateLEDGlow(p);

      // 🔔 Trigger once, reliably
      const TRIGGER_POINT = 0.92;
      if (p >= TRIGGER_POINT && !hasTriggered) {
        if (navigator.vibrate) {
          navigator.vibrate([8, 16, 8]);
        }

        playPing();
        hasTriggered = true;
      }

      // Card recognised text
      if (p > 0.05) {
        initCardStatus();
      }

      // Fade text
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
