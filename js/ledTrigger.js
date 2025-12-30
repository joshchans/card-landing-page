export function setupScrollHint() {
  const hint = document.getElementById("scroll-hint");
  if (!hint) return;

  ScrollTrigger.create({
    trigger: "#scroll-led",
    start: "top bottom",
    end: "top center",

    onEnter: () => {
      // User reached LED section → hide hint
      hint.style.opacity = 0;
    },

    onLeaveBack: () => {
      // User scrolls back UP → show hint again
      hint.style.opacity = 1;
    }
  });
}
