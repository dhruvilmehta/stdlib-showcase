import add from "https://cdn.skypack.dev/@stdlib/math-base-ops-add";
import mul from "https://cdn.skypack.dev/@stdlib/math-base-ops-mul";
import sub from "https://cdn.skypack.dev/@stdlib/math-base-ops-sub";
import pow from "https://cdn.skypack.dev/@stdlib/math-base-special-pow";
import max from "https://cdn.skypack.dev/@stdlib/math-base-special-max";
import min from "https://cdn.skypack.dev/@stdlib/math-base-special-min";
import ceil from "https://cdn.skypack.dev/@stdlib/math-base-special-ceil";
import floor from "https://cdn.skypack.dev/@stdlib/math-base-special-floor";
import abs from "https://cdn.skypack.dev/@stdlib/math-base-special-abs";
import sin from "https://cdn.skypack.dev/@stdlib/math-base-special-sin";
import cos from "https://cdn.skypack.dev/@stdlib/math-base-special-cos";
import exp from "https://cdn.skypack.dev/@stdlib/math-base-special-exp";
import sqrt from "https://cdn.skypack.dev/@stdlib/math-base-special-sqrt";
import PI from "https://cdn.skypack.dev/@stdlib/constants-float64-pi";

const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");
const w = canvas.width;
const h = canvas.height;

const origin = { x: mul(w, 0.5), y: mul(h, 0.5) };
let scale = 20;
let animationIndex = 0;
let animationPath = [];
let hoverPoint = null;

function adjustScale(path) {
  let maxX = 0;
  let maxY = 0;
  path.forEach(([x, y]) => {
    maxX = max(maxX, abs(x));
    maxY = max(maxY, abs(y));
  });
  maxX = mul(maxX, 1.1);
  maxY = mul(maxY, 1.1);
  const scaleX = mul(w, 0.5) / maxX;
  const scaleY = mul(h, 0.5) / maxY;
  scale = min(scaleX, scaleY, 20);
}

function toCanvasX(x) {
  return add(origin.x, mul(x, scale));
}

function toCanvasY(y) {
  return sub(origin.y, mul(y, scale));
}

function fromCanvasX(cx) {
  return sub(cx, origin.x) / scale;
}

function fromCanvasY(cy) {
  return sub(origin.y, cy) / scale;
}

function drawPoint(x, y, color = "blue", radius = 4) {
  ctx.beginPath();
  ctx.arc(toCanvasX(x), toCanvasY(y), radius, 0, mul(2, PI));
  ctx.fillStyle = color;
  ctx.fill();
  ctx.strokeStyle = "rgba(0, 0, 0, 0.3)";
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawGrid() {
  ctx.strokeStyle = "rgba(200, 200, 200, 0.5)";
  ctx.lineWidth = 0.5;
  const gridStep = 1;
  const xRange = ceil(w / mul(2, scale));
  const yRange = ceil(h / mul(2, scale));

  for (let i = sub(0, xRange); i <= xRange; i = add(i, gridStep)) {
    ctx.beginPath();
    ctx.moveTo(toCanvasX(i), 0);
    ctx.lineTo(toCanvasX(i), h);
    ctx.stroke();
  }
  for (let j = sub(0, yRange); j <= yRange; j = add(j, gridStep)) {
    ctx.beginPath();
    ctx.moveTo(0, toCanvasY(j));
    ctx.lineTo(w, toCanvasY(j));
    ctx.stroke();
  }
}

function drawAxes() {
  const gradientX = ctx.createLinearGradient(0, 0, w, 0);
  gradientX.addColorStop(0, "rgba(100, 100, 100, 0)");
  gradientX.addColorStop(0.5, "rgba(100, 100, 100, 1)");
  gradientX.addColorStop(1, "rgba(100, 100, 100, 0)");

  const gradientY = ctx.createLinearGradient(0, 0, 0, h);
  gradientY.addColorStop(0, "rgba(100, 100, 100, 0)");
  gradientY.addColorStop(0.5, "rgba(100, 100, 100, 1)");
  gradientY.addColorStop(1, "rgba(100, 100, 100, 0)");

  ctx.strokeStyle = gradientX;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, toCanvasY(0));
  ctx.lineTo(w, toCanvasY(0));
  ctx.stroke();

  ctx.strokeStyle = gradientY;
  ctx.beginPath();
  ctx.moveTo(toCanvasX(0), 0);
  ctx.lineTo(toCanvasX(0), h);
  ctx.stroke();

  ctx.fillStyle = "#444";
  ctx.font = "14px Arial";
  ctx.textAlign = "center";

  const xRange = ceil(w / mul(2, scale));
  for (let i = floor(sub(0, xRange)); i <= xRange; i = add(i, 1)) {
    if (i !== 0) {
      const cx = toCanvasX(i);
      ctx.beginPath();
      ctx.moveTo(cx, sub(toCanvasY(0), 6));
      ctx.lineTo(cx, add(toCanvasY(0), 6));
      ctx.strokeStyle = "#666";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillText(i.toString(), cx, add(toCanvasY(0), 20));
    }
  }

  ctx.textAlign = "right";
  const yRange = ceil(h / mul(2, scale));
  for (let i = floor(sub(0, yRange)); i <= yRange; i = add(i, 1)) {
    if (i !== 0) {
      const cy = toCanvasY(i);
      ctx.beginPath();
      ctx.moveTo(sub(toCanvasX(0), 6), cy);
      ctx.lineTo(add(toCanvasX(0), 6), cy);
      ctx.strokeStyle = "#666";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillText(i.toString(), sub(toCanvasX(0), 10), add(cy, 5));
    }
  }

  ctx.fillStyle = "#222";
  ctx.font = "16px Arial";
  ctx.textAlign = "left";
  ctx.fillText("x", sub(w, 30), sub(toCanvasY(0), 10));
  ctx.fillText("y", add(toCanvasX(0), 10), 20);
}

function drawHoverInfo() {
  if (!hoverPoint) return;

  const [hx, hy] = hoverPoint;
  const canvasX = toCanvasX(hx);
  const canvasY = toCanvasY(hy);

  drawPoint(hx, hy, "rgba(255, 165, 0, 0.8)", 6);

  ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
  ctx.strokeStyle = "#fff";
  ctx.lineWidth = 1;
  const text = `x: ${hx.toFixed(2)}, y: ${hy.toFixed(2)}`;
  const textWidth = ctx.measureText(text).width;
  const padding = 10;
  const boxWidth = add(textWidth, mul(2, padding));
  const boxHeight = 25;

  let boxX = add(canvasX, 10);
  let boxY = sub(canvasY, 35);
  if (add(boxX, boxWidth) > w) boxX = sub(canvasX, add(boxWidth, 10));
  if (boxY < 0) boxY = add(canvasY, 10);

  ctx.beginPath();
  ctx.rect(boxX, boxY, boxWidth, boxHeight);
  ctx.fill();
  ctx.stroke();

  ctx.fillStyle = "#fff";
  ctx.font = "12px Arial";
  ctx.textAlign = "center";
  ctx.fillText(text, add(boxX, mul(boxWidth, 0.5)), add(boxY, 17));
}

function drawScene(path, index) {
  ctx.clearRect(0, 0, w, h);
  drawGrid();
  drawAxes();

  // Draw the curve joining points
  ctx.beginPath();
  ctx.strokeStyle = "rgba(0, 0, 255, 0.5)"; // Blue curve with some transparency
  ctx.lineWidth = 2;
  for (let j = 0; j <= index; j = add(j, 1)) {
    const [x, y] = path[j];
    if (j === 0) {
      ctx.moveTo(toCanvasX(x), toCanvasY(y));
    } else {
      ctx.lineTo(toCanvasX(x), toCanvasY(y));
    }
  }
  ctx.stroke();

  // Draw points on top of the curve
  for (let j = 0; j <= index; j = add(j, 1)) {
    const [x, y] = path[j];
    drawPoint(x, y, j === index ? "red" : "blue");
  }
  drawHoverInfo();
}

function getSelectedFunction() {
  const selected = document.getElementById("functionSelect").value;
  if (selected === "custom") {
    const fInput = document.getElementById("customF").value;
    const gradXInput = document.getElementById("customGradX").value;
    const gradYInput = document.getElementById("customGradY").value;

    try {
      // eslint-disable-next-line no-new-func
      const f = new Function("x", "y", `return ${fInput}`);
      // eslint-disable-next-line no-new-func
      const gradX = new Function("x", "y", `return ${gradXInput}`);
      // eslint-disable-next-line no-new-func
      const gradY = new Function("x", "y", `return ${gradYInput}`);
      return {
        f: (x, y) => f(x, y),
        grad: (x, y) => [gradX(x, y), gradY(x, y)],
      };
    } catch (e) {
      console.error("Invalid custom function:", e);
      return getSelectedFunction("circle"); // Fallback to circle if error
    }
  }

  switch (selected) {
    case "circle":
      return {
        f: (x, y) => add(pow(x, 2), pow(y, 2)),
        grad: (x, y) => [mul(2, x), mul(2, y)],
      };
    case "egg":
      return {
        f: (x, y) => add(pow(x, 2), sin(y)),
        grad: (x, y) => [mul(2, x), cos(y)],
      };
    case "simple":
      return {
        f: (x, y) => add(pow(x, 2), mul(2, pow(y, 2))),
        grad: (x, y) => [mul(2, x), mul(4, y)],
      };
    case "ellipse":
      return {
        f: (x, y) => add(mul(2, pow(x, 2)), pow(y, 2)),
        grad: (x, y) => [mul(4, x), mul(2, y)],
      };
    case "rastrigin":
      return {
        f: (x, y) =>
          add(
            20,
            add(pow(x, 2), pow(y, 2)),
            mul(-10, add(cos(mul(2, PI, x)), cos(mul(2, PI, y)))),
          ),
        grad: (x, y) => [
          add(mul(2, x), mul(mul(20, PI), sin(mul(2, PI, x)))),
          add(mul(2, y), mul(mul(20, PI), sin(mul(2, PI, y)))),
        ],
      };
    case "ackley":
      return {
        f: (x, y) =>
          add(
            mul(-20, exp(mul(-0.2, sqrt(mul(0.5, add(pow(x, 2), pow(y, 2))))))),
            mul(-1, exp(mul(0.5, add(cos(mul(2, PI, x)), cos(mul(2, PI, y)))))),
            add(20, Math.E),
          ),
        grad: (x, y) => {
          const a = 20;
          const b = 0.2;
          const c = mul(2, PI);
          const term1 = sqrt(mul(0.5, add(pow(x, 2), pow(y, 2))));
          const term2 = mul(0.5, add(cos(mul(c, x)), cos(mul(c, y))));
          return [
            add(
              mul(mul(a, b), mul(x, exp(mul(-b, term1)))) / term1,
              mul(c, mul(sin(mul(c, x)), exp(term2))),
            ),
            add(
              mul(mul(a, b), mul(y, exp(mul(-b, term1)))) / term1,
              mul(c, mul(sin(mul(c, y)), exp(term2))),
            ),
          ];
        },
      };
    default:
      return {
        f: (x, y) => add(pow(x, 2), pow(y, 2)),
        grad: (x, y) => [mul(2, x), mul(2, y)],
      };
  }
}

function runGD(initX, initY, lr, steps) {
  const { f, grad } = getSelectedFunction();
  let x = initX;
  let y = initY;
  const path = [];

  for (let i = 0; i < steps; i = add(i, 1)) {
    path.push([x, y, f(x, y)]);
    const [dx, dy] = grad(x, y);
    x = sub(x, mul(lr, dx));
    y = sub(y, mul(lr, dy));
  }
  return path;
}

function animatePath(path) {
  adjustScale(path);
  animationPath = path;
  animationIndex = 0;

  const speed = parseInt(document.getElementById("speed").value);

  function drawNext() {
    drawScene(animationPath, animationIndex);
    if (animationIndex < sub(path.length, 1)) {
      animationIndex = add(animationIndex, 1);
      setTimeout(() => requestAnimationFrame(drawNext), speed);
    }
  }
  drawNext();
}

// Controls
const initXInput = document.getElementById("initX");
const initYInput = document.getElementById("initY");
const lrInput = document.getElementById("lr");
const stepsInput = document.getElementById("steps");
const speedInput = document.getElementById("speed");
const runButton = document.getElementById("run");
const functionSelect = document.getElementById("functionSelect");
const customInputs = document.getElementById("customInputs");

initXInput.addEventListener(
  "input",
  () => (document.getElementById("initXVal").textContent = initXInput.value),
);
initYInput.addEventListener(
  "input",
  () => (document.getElementById("initYVal").textContent = initYInput.value),
);
lrInput.addEventListener(
  "input",
  () => (document.getElementById("lrVal").textContent = lrInput.value),
);
speedInput.addEventListener(
  "input",
  () => (document.getElementById("speedVal").textContent = speedInput.value),
);

// Show/hide custom inputs based on selection
functionSelect.addEventListener("change", () => {
  customInputs.style.display =
    functionSelect.value === "custom" ? "flex" : "none";
});

runButton.addEventListener("click", () => {
  const initX = parseFloat(initXInput.value);
  const initY = parseFloat(initYInput.value);
  const lr = parseFloat(lrInput.value);
  const steps = parseInt(stepsInput.value);

  const path = runGD(initX, initY, lr, steps);
  animatePath(path);
});

// Hover functionality
canvas.addEventListener("mousemove", (e) => {
  const rect = canvas.getBoundingClientRect();
  const mouseX = sub(e.clientX, rect.left);
  const mouseY = sub(e.clientY, rect.top);
  const dataX = fromCanvasX(mouseX);
  const dataY = fromCanvasY(mouseY);

  hoverPoint = null;
  if (animationPath.length > 0) {
    for (let i = 0; i <= animationIndex; i = add(i, 1)) {
      const [x, y] = animationPath[i];
      const dx = sub(toCanvasX(x), mouseX);
      const dy = sub(toCanvasY(y), mouseY);
      if (add(pow(dx, 2), pow(dy, 2)) < 100) {
        hoverPoint = [x, y];
        break;
      }
    }
  }
  drawScene(animationPath, animationIndex);
});

canvas.addEventListener("mouseleave", () => {
  hoverPoint = null;
  drawScene(animationPath, animationIndex);
});

// Auto-start
runButton.click();
