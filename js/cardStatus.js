let initialised = false;

const BYTE_OPTIONS = [68];

function formatTime(date) {
  const h = String(date.getHours()).padStart(2, "0");
  const m = String(date.getMinutes()).padStart(2, "0");
  const s = String(date.getSeconds()).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function initCardStatus() {
  if (initialised) return;
  initialised = true;

  const bytes =
    BYTE_OPTIONS[Math.floor(Math.random() * BYTE_OPTIONS.length)];

  const el = document.getElementById("card-status");
  const meta = el.querySelector(".meta");

  meta.textContent = `${bytes} bytes read · ${formatTime(new Date())}`;

  // Ensure known starting state
  el.style.opacity = 0;
  el.style.transition = "opacity 0.5s ease";
}

export function updateCardStatusFade(amount) {
  const el = document.getElementById("card-status");
  el.style.opacity = amount;
}
