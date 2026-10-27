import { loadCatalog, escapeHtml } from "/assets/js/catalog.js";

// Four silk curtains for the four featured projects, hanging from a rod across the screen.
// Their folds drift and they sway a little, the hem more than the top. A click draws them
// all to the left, gathered into narrow pleats, and behind them the banner shows the project:
// its picture, its words and a way in. A pleat switches the project; Esc or "close" lets the
// curtains fall back.
//
// The silk is drawn on a canvas per curtain, column by column: each column's tone comes from
// the angle of the fold under it (soft light) plus a narrow specular line (the sheen).

const { projects } = await loadCatalog();
const home = await (await fetch("/assets/data/home.json", { cache: "no-cache" })).json();
const PICKS = home.picks.map((id) => projects.find((p) => p.id === id)).filter(Boolean);

const PALETTES = {
  inci: { label: "İnci", base: [[226, 220, 206], [214, 206, 190], [232, 226, 214], [220, 212, 198]], sheen: [255, 252, 244], ink: "#2a2622" },
  gece: { label: "Gece", base: [[38, 38, 42], [30, 31, 36], [44, 42, 46], [34, 34, 40]], sheen: [190, 192, 204], ink: "#eceef3" },
  renk: { label: "Renkli", base: [[112, 30, 36], [28, 52, 84], [52, 74, 52], [150, 108, 40]], sheen: [255, 236, 214], ink: "#f6efe4" },
};
let palette = "inci";
try { palette = sessionStorage.getItem("perde") || palette; } catch {}

const stage = document.getElementById("drape");
const banner = stage.querySelector(".banner");
const reduce = matchMedia("(prefers-reduced-motion: reduce)");

stage.insertAdjacentHTML("beforeend", PICKS.map((p, i) => `
  <button type="button" class="curtain" data-i="${i}" style="--i:${i}" aria-label="${escapeHtml(p.title)}">
    <span class="cloth"><canvas></canvas><span class="cur-name">${escapeHtml(p.title)}</span><span class="cur-no mono">0${i + 1}</span></span>
  </button>`).join(""));
const curtains = [...stage.querySelectorAll(".curtain")];
const cloths = curtains.map((c) => ({ el: c.querySelector(".cloth"), canvas: c.querySelector("canvas"), seed: Math.random() * 100 }));

// ——— The silk ———
function size() {
  const dpr = Math.min(2, devicePixelRatio || 1);
  for (const c of cloths) {
    const r = c.canvas.getBoundingClientRect();
    c.canvas.width = Math.max(1, Math.round(r.width * dpr / 2)); // a column every 2 device pixels
    c.canvas.height = 1;                                           // tone varies across, not down
  }
}
function paint(t) {
  const P = PALETTES[palette];
  cloths.forEach((c, k) => {
    const g = c.canvas.getContext("2d"), w = c.canvas.width;
    const img = g.createImageData(w, 1), d = img.data, base = P.base[k % P.base.length];
    // Folds are measured in cloth, not in pixels: a curtain drawn aside keeps the same folds,
    // packed tighter, which is what a gathered curtain looks like.
    for (let x = 0; x < w; x++) {
      // Silk is soft: a gentle tone across wide, uneven folds, a broad glow, and a thin line
      // of sheen only where a fold turns straight to the light.
      const u = (x / w) * 9 + c.seed;
      const ph = u + Math.sin(u * 0.45 - t * 0.35 + c.seed) * 1.6 + Math.sin(u * 1.9 + t * 0.5) * 0.25;
      const diffuse = 0.8 + 0.2 * Math.sin(ph);
      const spec = Math.pow(Math.max(0, Math.cos(ph - 0.6)), 26) * 0.5 + Math.pow(Math.max(0, Math.cos(ph * 0.5 + 1)), 6) * 0.14;
      const i = x * 4;
      for (let ch = 0; ch < 3; ch++) d[i + ch] = Math.min(255, base[ch] * diffuse + P.sheen[ch] * spec);
      d[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
  });
}

// ——— The sway: the hem moves more than the rod ———
let open = -1;
function sway(t) {
  cloths.forEach((c, k) => {
    const a = open >= 0 ? 0.25 : 1;
    const s = Math.sin(t * 0.8 + k * 1.3) * 0.9 * a + Math.sin(t * 1.7 + k) * 0.25 * a;
    c.el.style.transform = `skewX(${s.toFixed(3)}deg)`;
  });
}

let raf = 0;
const t0 = performance.now();
function frame(now) {
  const t = (now - t0) / 1000;
  paint(reduce.matches ? 0 : t);
  if (!reduce.matches) sway(t);
  raf = requestAnimationFrame(frame);
}
// Only while the stage can be seen.
new IntersectionObserver(([e]) => {
  cancelAnimationFrame(raf);
  if (e.isIntersecting) raf = requestAnimationFrame(frame);
}).observe(stage);

// ——— Drawn aside, and the banner ———
function show(i) {
  const p = PICKS[i];
  open = i;
  stage.classList.add("is-open");
  curtains.forEach((c, k) => { c.setAttribute("aria-pressed", String(k === i)); c.classList.toggle("is-current", k === i); });
  banner.innerHTML = `
    <figure class="bn-pic">${p.image ? `<img src="${escapeHtml(p.image)}" alt="">` : ""}</figure>
    <div class="bn-text">
      <p class="label">${escapeHtml(p.kind)} · ${String(i + 1).padStart(2, "0")} / ${String(PICKS.length).padStart(2, "0")}</p>
      <h2>${escapeHtml(p.title)}</h2>
      <p class="bn-sum">${escapeHtml(p.summary)}</p>
      <dl class="bn-meta"><dt>Topics</dt><dd>${p.topics.map(escapeHtml).join(", ")}</dd><dt>Stack</dt><dd>${p.stack.map(escapeHtml).join(", ")}</dd></dl>
      <p class="bn-acts"><a class="bn-open" href="${escapeHtml(p.url)}">Open project <span aria-hidden="true">↗</span></a><button type="button" class="bn-close">Close</button></p>
    </div>`;
  banner.animate?.([{ opacity: 0, transform: "translateX(24px)" }, { opacity: 1, transform: "none" }], { duration: 700, delay: 280, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", fill: "backwards" });
  requestAnimationFrame(size);
}
function close() {
  open = -1;
  stage.classList.remove("is-open");
  curtains.forEach((c) => { c.setAttribute("aria-pressed", "false"); c.classList.remove("is-current"); });
  setTimeout(size, 900);
}
stage.addEventListener("click", (e) => {
  if (e.target.closest(".bn-close")) return close();
  const c = e.target.closest(".curtain");
  if (c) show(Number(c.dataset.i));
});
document.addEventListener("keydown", (e) => {
  if (open < 0) return;
  if (e.key === "Escape") close();
  else if (e.key === "ArrowRight" || e.key === "ArrowDown") show((open + 1) % PICKS.length);
  else if (e.key === "ArrowLeft" || e.key === "ArrowUp") show((open - 1 + PICKS.length) % PICKS.length);
});
// The canvases follow their curtains' widths as they gather and fall.
new ResizeObserver(size).observe(stage);
curtains.forEach((c) => c.addEventListener("transitionend", size));

// ——— Palette ———
const pal = document.getElementById("palette");
pal.innerHTML = Object.entries(PALETTES).map(([k, v]) => `<button type="button" data-p="${k}" aria-pressed="${k === palette}">${v.label}</button>`).join("");
pal.addEventListener("click", (e) => {
  const b = e.target.closest("[data-p]");
  if (!b) return;
  palette = b.dataset.p;
  try { sessionStorage.setItem("perde", palette); } catch {}
  pal.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  stage.style.setProperty("--silk-ink", PALETTES[palette].ink);
});
stage.style.setProperty("--silk-ink", PALETTES[palette].ink);
size();
paint(0);
