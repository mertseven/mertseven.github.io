// The gallery for topo.html: twenty small maps, each opens large with names and a pointer.
// Static ones draw once; the moving ones only move while hovered or open.

import { VARIANTS, ASPECT, ALL } from "./topo.js";

const { LIBS, CATS, labels } = ALL;
const grid = document.getElementById("grid");
const view = document.getElementById("view");
const DPR = Math.min(2, devicePixelRatio || 1);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

grid.innerHTML = VARIANTS.map((v, k) => `
  <button type="button" class="tp-card${v.dark ? " is-dark" : ""}" data-k="${k}">
    <span class="tp-pic" style="aspect-ratio:${ASPECT.toFixed(3)}"><canvas></canvas>${v.anim ? `<i class="tp-moves">hareketli</i>` : ""}</span>
    <span class="tp-cap"><b><span class="mono">${String(k + 1).padStart(2, "0")}</span> ${esc(v.name)}</b><span>${esc(v.note)}</span></span>
  </button>`).join("");
const cards = [...grid.querySelectorAll(".tp-card")].map((el, k) => ({ el, k, canvas: el.querySelector("canvas"), S: {}, drawn: false }));

function fit(canvas) {
  const r = canvas.getBoundingClientRect(), W = Math.max(1, Math.round(r.width)), H = Math.max(1, Math.round(r.height));
  if (canvas.width !== W * DPR || canvas.height !== H * DPR) { canvas.width = W * DPR; canvas.height = H * DPR; return [W, H, true]; }
  return [W, H, false];
}
function paint(target, t) {
  const v = VARIANTS[target.k], [W, H, resized] = fit(target.canvas), ctx = target.canvas.getContext("2d");
  if (resized) target.S = {};
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  if (!v.trails) ctx.clearRect(0, 0, W, H);
  target.P = v.draw(ctx, W, H, t, target.S);
  target.W = W; target.H = H;
}

// Draw each card once when it first comes into view.
const io = new IntersectionObserver((es) => es.forEach((e) => {
  if (!e.isIntersecting) return;
  const c = cards.find((x) => x.el === e.target);
  if (!c.drawn) { c.drawn = true; paint(c, 0); }
}), { rootMargin: "200px" });
cards.forEach((c) => io.observe(c.el));

// ——— Motion: one loop, for whichever moving map is hovered or open ———
let moving = null, raf = 0, t0 = 0, spin = 0;
function loop(now) {
  if (!moving) return;
  const t = (now - t0) / 1000 + spin;
  paint(moving, t);
  if (moving === big) overlay(t);
  raf = requestAnimationFrame(loop);
}
function move(target) {
  cancelAnimationFrame(raf);
  moving = target && VARIANTS[target.k].anim ? target : null;
  if (moving) { t0 = performance.now(); raf = requestAnimationFrame(loop); }
}
grid.addEventListener("pointerover", (e) => { const el = e.target.closest(".tp-card"); if (el && !view.open) { const c = cards[el.dataset.k]; if (moving !== c) move(c); } });
grid.addEventListener("pointerleave", () => { if (!view.open) move(null); });

// ——— The large view ———
const big = { k: 0, canvas: view.querySelector(".tv-base"), S: {} };
const top = view.querySelector(".tv-top");
const tip = view.querySelector(".tv-tip");
let hover = -1;
function overlay() {
  const v = VARIANTS[big.k], ctx = top.getContext("2d");
  if (top.width !== big.canvas.width) { top.width = big.canvas.width; top.height = big.canvas.height; }
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  ctx.clearRect(0, 0, big.W, big.H);
  labels(ctx, big.P, { color: v.ink, halo: v.halo, font: v.font || "500 11.5px 'DM Sans', sans-serif", upper: v.upper !== false, spacing: v.upper === false ? "0px" : "0.22em" });
  if (hover >= 0 && big.P[hover]) {
    const [x, y] = big.P[hover];
    ctx.beginPath(); ctx.arc(x, y, 7, 0, 7); ctx.strokeStyle = v.ink; ctx.lineWidth = 1.5; ctx.stroke();
    tip.style.transform = `translate(${Math.round(x + 14)}px, ${Math.round(y - 10)}px)`;
  }
}
function openView(k) {
  big.k = k; big.S = {}; hover = -1; tip.hidden = true; spin = 0;
  const v = VARIANTS[k];
  view.querySelector(".tv-title").innerHTML = `<span class="mono">${String(k + 1).padStart(2, "0")} / 20</span> ${esc(v.name)}`;
  view.querySelector(".tv-note").textContent = v.note;
  view.classList.toggle("is-dark", !!v.dark);
  if (!view.open) view.showModal();
  requestAnimationFrame(() => {
    big.canvas.width = 0; // force a fresh size
    paint(big, 0); overlay(0);
    move(v.anim ? big : null);
  });
}
grid.addEventListener("click", (e) => { const el = e.target.closest(".tp-card"); if (el) openView(+el.dataset.k); });
view.addEventListener("close", () => move(null));
view.querySelector(".tv-close").addEventListener("click", () => view.close());
view.querySelector(".tv-prev").addEventListener("click", () => openView((big.k + 19) % 20));
view.querySelector(".tv-next").addEventListener("click", () => openView((big.k + 1) % 20));
view.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") openView((big.k + 1) % 20);
  else if (e.key === "ArrowLeft") openView((big.k + 19) % 20);
});

// Pointer: the nearest library gets a ring and a label; dragging turns the 3D ones.
const stage = view.querySelector(".tv-stage");
let drag = null;
stage.addEventListener("pointerdown", (e) => { if (VARIANTS[big.k].anim) { drag = { x: e.clientX, s: spin }; stage.setPointerCapture(e.pointerId); } });
stage.addEventListener("pointerup", () => { drag = null; });
stage.addEventListener("pointermove", (e) => {
  const r = big.canvas.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
  if (drag) { spin = drag.s - (e.clientX - drag.x) * 0.03; }
  let best = -1, bd = 18 * 18;
  (big.P || []).forEach((p, i) => { if (!p) return; const d = (p[0] - x) ** 2 + (p[1] - y) ** 2; if (d < bd) { bd = d; best = i; } });
  if (best !== hover) {
    hover = best;
    if (best >= 0) {
      const l = LIBS[best];
      tip.innerHTML = `<b>${esc(l.name)}</b><span>${esc(CATS[l.cat].label)} · ${l.year}${l.live ? " · canlı" : ""}</span>`;
      tip.hidden = false;
    } else tip.hidden = true;
    if (!moving) overlay();
  }
});
stage.addEventListener("pointerleave", () => { hover = -1; tip.hidden = true; if (!moving) overlay(); });
addEventListener("resize", () => { if (view.open) { paint(big, 0); overlay(); } });
