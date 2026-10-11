
const garden = document.getElementById("garden");
const canvas = document.getElementById("flowerCanvas");
const ctx = canvas.getContext("2d");

const flowerCount = document.getElementById("flowerCount");
const gardenHint = document.getElementById("gardenHint");
const resetButton = document.getElementById("resetGarden");

let flowers = [];
let particles = [];
let stars = [];
let animationFrame;
let lastTime = 0;
let elapsed = 0;

const flowerColors = [
  "#ff4d55",
  "#ff82bd",
  "#fff2a8",
  "#ffffff",
  "#c6a1ff",
  "#ffad79",
  "#f5a6dc"
];

const leafColor = "#6da65b";
const stemColor = "#477d49";

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function resizeCanvas() {
  const rect = garden.getBoundingClientRect();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);

  canvas.style.width = `${rect.width}px`;
  canvas.style.height = `${rect.height}px`;

  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  createStars(rect.width, rect.height);
  drawScene();
}

function createStars(width, height) {
  stars = [];

  const amount = Math.floor((width * height) / 8500);

  for (let i = 0; i < amount; i++) {
    stars.push({
      x: random(0, width),
      y: random(0, height),
      radius: random(0.5, 1.5),
      alpha: random(0.1, 0.45),
      phase: random(0, Math.PI * 2)
    });
  }
}

function createFlower(targetX, targetY) {
  const width = garden.clientWidth;
  const height = garden.clientHeight;

  // Each stem begins near the bottom of the garden.
  const baseX = Math.max(
    12,
    Math.min(width - 12, width * 0.5 + random(-width * 0.13, width * 0.13))
  );

  const baseY = height - random(8, 22);

  // Control point creates a natural curve toward the clicked position.
  const controlX = (baseX + targetX) / 2 + random(-45, 45);
  const controlY = Math.max(
    targetY + 10,
    (baseY + targetY) / 2 + random(-20, 20)
  );

  flowers.push({
    baseX,
    baseY,
    targetX,
    targetY,
    controlX,
    controlY,
    color: flowerColors[Math.floor(Math.random() * flowerColors.length)],
    petalCount: Math.floor(random(8, 13)),
    petalLength: random(8, 13),
    petalWidth: random(4, 7),
    centerRadius: random(4, 7),
    rotation: random(0, Math.PI * 2),
    bloom: random(0, 0.8),
    delay: random(0, 0.12),
    duration: random(1.1, 1.8),
    sway: random(0.5, 1.6),
    swayPhase: random(0, Math.PI * 2),
    leafCount: Math.floor(random(3, 6))
  });

  createParticles(targetX, targetY, 12);
  updateCount();

  gardenHint.style.opacity = "0";
}

function createParticles(x, y, amount) {
  for (let i = 0; i < amount; i++) {
    const angle = random(0, Math.PI * 2);
    const speed = random(12, 55);

    particles.push({
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: random(0.35, 0.8),
      maxLife: 0,
      radius: random(1, 2.5),
      color: Math.random() > 0.5 ? "#ffd0e6" : "#fff1ad"
    });

    const particle = particles[particles.length - 1];
    particle.maxLife = particle.life;
  }
}

function updateCount() {
  const count = flowers.length;

  flowerCount.textContent =
    `${count} ${count === 1 ? "flower" : "flowers"} planted`;
}

// Get a point along the quadratic Bezier curve.
function getCurvePoint(flower, t) {
  const { baseX, baseY, controlX, controlY, targetX, targetY } = flower;

  const inverse = 1 - t;

  return {
    x: inverse * inverse * baseX +
       2 * inverse * t * controlX +
       t * t * targetX,

    y: inverse * inverse * baseY +
       2 * inverse * t * controlY +
       t * t * targetY
  };
}

// Draw only the portion of the stem that has grown.
function drawStem(flower, progress) {
  const steps = 45;
  const visibleSteps = Math.max(1, Math.ceil(steps * progress));

  ctx.beginPath();

  for (let i = 0; i <= visibleSteps; i++) {
    const t = (i / steps) * progress;
    const point = getCurvePoint(flower, t);

    if (i === 0) {
      ctx.moveTo(point.x, point.y);
    } else {
      ctx.lineTo(point.x, point.y);
    }
  }

  ctx.strokeStyle = stemColor;
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.stroke();
}

function drawLeaf(x, y, angle, size, progress) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  ctx.globalAlpha = progress;

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(
    size * 0.5,
    -size * 0.8,
    size,
    -size * 0.15
  );
  ctx.quadraticCurveTo(
    size * 0.55,
    size * 0.12,
    0,
    0
  );

  ctx.fillStyle = leafColor;
  ctx.fill();

  // Leaf vein.
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(size * 0.82, -size * 0.17);
  ctx.strokeStyle = "rgba(210, 244, 168, 0.35)";
  ctx.lineWidth = 0.6;
  ctx.stroke();

  ctx.restore();
}

function drawFlowerHead(flower, progress, time) {
  const {
    targetX,
    targetY,
    color,
    petalCount,
    petalLength,
    petalWidth,
    centerRadius,
    rotation,
    sway,
    swayPhase
  } = flower;

  // Flower head gently sways after blooming.
  const swayOffset = Math.sin(time * 1.3 + swayPhase) * sway * progress;
  const bloom = Math.min(1, progress);

  const radius = petalLength * bloom;

  ctx.save();
  ctx.translate(targetX + swayOffset, targetY);
  ctx.rotate(rotation);

  // Soft glow.
  ctx.shadowColor = color;
  ctx.shadowBlur = 16 * bloom;

  // Petals.
  for (let i = 0; i < petalCount; i++) {
    const angle = (Math.PI * 2 * i) / petalCount;

    ctx.save();
    ctx.rotate(angle);

    ctx.beginPath();
    ctx.ellipse(
      0,
      -radius * 0.72,
      petalWidth * bloom,
      radius * 0.58,
      0,
      0,
      Math.PI * 2
    );

    ctx.fillStyle = color;
    ctx.globalAlpha = bloom;
    ctx.fill();

    // A little highlight on each petal.
    ctx.shadowBlur = 0;
    ctx.beginPath();
    ctx.ellipse(
      0,
      -radius * 0.8,
      petalWidth * bloom * 0.48,
      radius * 0.3,
      0,
      0,
      Math.PI * 2
    );
    ctx.fillStyle = "rgba(255,255,255,0.23)";
    ctx.fill();

    ctx.restore();
  }

  // Flower center.
  ctx.shadowBlur = 7;
  ctx.beginPath();
  ctx.arc(0, 0, centerRadius * bloom, 0, Math.PI * 2);
  ctx.fillStyle = "#ffd34f";
  ctx.fill();

  // Sunflower-style center detail.
  if (color === "#fff2a8") {
    ctx.fillStyle = "#51351b";
    ctx.beginPath();
    ctx.arc(0, 0, centerRadius * 0.72 * bloom, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#9a642d";

    for (let i = 0; i < 12; i++) {
      const a = (Math.PI * 2 * i) / 12;
      ctx.beginPath();
      ctx.arc(
        Math.cos(a) * centerRadius * 0.45 * bloom,
        Math.sin(a) * centerRadius * 0.45 * bloom,
        Math.max(0.5, centerRadius * 0.09 * bloom),
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
  }

  ctx.restore();
}

function drawFlower(flower, time, deltaTime) {
  flower.growthTime = (flower.growthTime || 0) + deltaTime;

  const localTime = Math.max(0, flower.growthTime - flower.delay);
  const rawProgress = Math.min(1, localTime / flower.duration);

  // Smooth ease-out growth.
  const progress = 1 - Math.pow(1 - rawProgress, 3);

  // Keep the first frame clean.
  if (localTime <= 0) return;

  const stemProgress = Math.min(1, progress * 1.08);

  drawStem(flower, stemProgress);

  // Leaves appear gradually along the growing stem.
  for (let i = 0; i < flower.leafCount; i++) {
    const t = 0.18 + (i / flower.leafCount) * 0.62;
    const leafProgress = Math.max(
      0,
      Math.min(1, (progress - t + 0.18) / 0.18)
    );

    if (leafProgress <= 0) continue;

    const point = getCurvePoint(flower, t * stemProgress);

    const direction = i % 2 === 0 ? -1 : 1;
    const angle = direction === 1 ? -0.6 : Math.PI + 0.6;

    drawLeaf(
      point.x,
      point.y,
      angle,
      randomLeafSize(flower, i),
      leafProgress
    );
  }

  drawFlowerHead(flower, progress, time);
}

function randomLeafSize(flower, index) {
  return 13 + ((flower.leafCount + index) % 3) * 2;
}

function drawStars(time) {
  for (const star of stars) {
    const twinkle =
      0.55 + Math.sin(time * 1.8 + star.phase) * 0.35;

    ctx.beginPath();
    ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255, 222, 239, ${star.alpha * twinkle})`;
    ctx.fill();
  }
}

function drawParticles(deltaTime) {
  const width = garden.clientWidth;

  particles = particles.filter((p) => p.life > 0);

  for (const p of particles) {
    p.life -= deltaTime;

    p.x += p.vx * deltaTime;
    p.y += p.vy * deltaTime;

    p.vx *= 0.98;
    p.vy *= 0.98;

    const alpha = Math.max(0, p.life / p.maxLife);

    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;

    ctx.beginPath();
    ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.globalAlpha = 1;
}

function drawScene(deltaTime = 0) {
  const width = garden.clientWidth;
  const height = garden.clientHeight;

  ctx.clearRect(0, 0, width, height);

  drawStars(elapsed);

  // Draw older flowers first so newer stems layer naturally.
  for (const flower of flowers) {
    drawFlower(flower, elapsed, deltaTime);
  }

  drawParticles(deltaTime);
}

function animate(timestamp) {
  if (!lastTime) lastTime = timestamp;

  const deltaTime = Math.min((timestamp - lastTime) / 1000, 0.04);
  lastTime = timestamp;
  elapsed += deltaTime;

  drawScene(deltaTime);

  animationFrame = requestAnimationFrame(animate);
}

function handlePlant(event) {
  const rect = garden.getBoundingClientRect();

  const targetX = event.clientX - rect.left;
  const targetY = event.clientY - rect.top;

  createFlower(targetX, targetY);
}

garden.addEventListener("pointerdown", (event) => {
  // Ignore non-primary mouse buttons.
  if (event.pointerType === "mouse" && event.button !== 0) return;

  handlePlant(event);
});

resetButton.addEventListener("click", () => {
  flowers = [];
  particles = [];
  elapsed = 0;

  gardenHint.style.opacity = "1";

  updateCount();
  drawScene();
});

// Initialize the canvas and begin the animation.
window.addEventListener("resize", resizeCanvas);

resizeCanvas();
updateCount();

cancelAnimationFrame(animationFrame);
animationFrame = requestAnimationFrame(animate);


