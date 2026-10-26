// Grain preview: the real pages in a frame, with a grain laid over or under them. Nothing in
// the site changes; the grain is put into the framed page from here.
//
// Dose: how visible it is. Motion: still, flickering like film, or flickering only behind
// the home page's first screen (still everywhere else). Layer: on the paper (under the
// content, so pictures stay clean) or over everything (pictures get it too). Theme: dark
// grains on paper, light grains on black.

const PAGES = [["/", "Ana sayfa"], ["/work/", "İndeks"], ["/research/", "Araştırma"], ["/about/", "Hakkında"], ["/search/", "Arama"], ["/nowhere", "404"]];
const DOSES = [["0", "Kapalı"], ["0.035", "Hafif"], ["0.065", "Orta"], ["0.11", "Güçlü"]];
const MOTIONS = [["still", "Durağan"], ["film", "Kıpırdayan"], ["first", "İlk ekranda kıpırdayan"]];
const LAYERS = [["paper", "Zeminde"], ["over", "Her şeyin üstünde"]];
const THEMES = [["light", "Açık"], ["dark", "Koyu"]];

const state = { page: "/", dose: "0.035", motion: "first", layer: "paper", theme: "light" };
try { Object.assign(state, JSON.parse(sessionStorage.getItem("grain") || "{}")); } catch {}

// A square of noise: every pixel one grain, its alpha random. Dark grains for paper,
// light grains for black. Made once per colour and dose, then tiled.
const cache = new Map();
function noise(dark, alpha) {
  const key = `${dark}:${alpha}`;
  if (cache.has(key)) return cache.get(key);
  const n = 180, c = document.createElement("canvas");
  c.width = c.height = n;
  const g = c.getContext("2d"), img = g.createImageData(n, n), d = img.data;
  const v = dark ? 236 : 18;
  for (let i = 0; i < d.length; i += 4) {
    d[i] = d[i + 1] = d[i + 2] = v;
    d[i + 3] = Math.random() < 0.5 ? Math.round(Math.random() * 255 * alpha * 2.2) : 0;
  }
  g.putImageData(img, 0, 0);
  const url = c.toDataURL("image/png");
  cache.set(key, url);
  return url;
}

const frame = document.getElementById("frame");

function apply() {
  const doc = frame.contentDocument;
  if (!doc?.documentElement) return;
  doc.documentElement.dataset.theme = state.theme;
  doc.getElementById("grain-style")?.remove();
  doc.querySelectorAll(".grain-veil").forEach((n) => n.remove());
  const a = Number(state.dose);
  if (!a) return;
  const dark = state.theme === "dark";
  const url = noise(dark, a);
  const flicker = `@keyframes grain-move { 0% { background-position: 0 0; } 20% { background-position: -37px 21px; } 40% { background-position: 53px -61px; } 60% { background-position: -71px -29px; } 80% { background-position: 19px 67px; } 100% { background-position: 0 0; } }`;
  const moving = "animation: grain-move 0.9s steps(1) infinite;";
  const veil = `position: fixed; inset: 0; z-index: 9999; pointer-events: none; background-image: url(${url}); background-size: 180px 180px;`;
  let css = flicker;
  if (state.layer === "paper") {
    // On the paper: the body's own background carries the grain, under every picture.
    css += `body { background-image: url(${url}); background-size: 180px 180px; ${state.motion === "film" ? moving : ""} }`;
  } else {
    css += `.grain-veil { ${veil} ${state.motion === "film" ? moving : ""} }`;
  }
  // Flicker behind the home page's first screen only: a veil inside it, the rest still.
  css += `.first { position: relative; } .first > .grain-first { position: absolute; inset: 0; z-index: 0; pointer-events: none; background-image: url(${url}); background-size: 180px 180px; ${moving} } .first > *:not(.grain-first) { position: relative; z-index: 1; }`;
  css += `@media (prefers-reduced-motion: reduce) { body, .grain-veil, .grain-first { animation: none !important; } }`;
  const style = doc.createElement("style");
  style.id = "grain-style";
  style.textContent = css;
  doc.head.append(style);
  if (state.layer === "over") {
    const v = doc.createElement("div");
    v.className = "grain-veil";
    doc.body.append(v);
  }
  const first = doc.querySelector(".first");
  if (first && state.motion === "first") {
    const f = doc.createElement("div");
    f.className = "grain-first grain-veil-first";
    first.prepend(f);
    // On the paper layer the body's grain would sit still under the moving one: let the
    // first screen's own grain take over there.
    if (state.layer === "paper") first.style.background = "var(--paper)";
  }
}

// ——— Controls ———

const bar = document.getElementById("controls");
const group = (key, label, list) => `
  <div class="modes-row"><span class="label">${label}</span>${list.map(([v, l]) => `<button type="button" class="chip" data-k="${key}" data-v="${v}" aria-pressed="${state[key] === v}">${l}</button>`).join("")}</div>`;
bar.innerHTML = group("page", "Sayfa", PAGES) + group("dose", "Doz", DOSES) + group("motion", "Hareket", MOTIONS) + group("layer", "Katman", LAYERS) + group("theme", "Tema", THEMES);
bar.addEventListener("click", (e) => {
  const b = e.target.closest("[data-k]");
  if (!b) return;
  state[b.dataset.k] = b.dataset.v;
  bar.querySelectorAll(`[data-k="${b.dataset.k}"]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  try { sessionStorage.setItem("grain", JSON.stringify(state)); } catch {}
  if (b.dataset.k === "page") frame.src = state.page;
  else apply();
});

frame.addEventListener("load", apply);
frame.src = state.page;
document.documentElement.dataset.theme = "light";
