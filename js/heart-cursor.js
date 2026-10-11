document.addEventListener("DOMContentLoaded", () => {
  // Skip touch devices and reduced-motion preferences
  if (
    window.matchMedia("(pointer: coarse)").matches ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return;
  }

  const hearts = ["♡", "♥", "💗", "💕"];
  let lastHeartTime = 0;

  document.addEventListener("mousemove", (event) => {
    const now = performance.now();

    // Prevent too many hearts from appearing
    if (now - lastHeartTime < 65) return;
    lastHeartTime = now;

    const heart = document.createElement("span");
    heart.className = "cursor-heart";
    heart.textContent =
      hearts[Math.floor(Math.random() * hearts.length)];

    heart.style.left = `${event.clientX}px`;
    heart.style.top = `${event.clientY}px`;
    heart.style.setProperty(
      "--drift",
      `${Math.random() * 60 - 30}px`
    );
    heart.style.setProperty(
      "--rotation",
      `${Math.random() * 50 - 25}deg`
    );

    document.body.appendChild(heart);

    heart.addEventListener("animationend", () => {
      heart.remove();
    });
  });
});