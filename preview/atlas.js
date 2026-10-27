// Etkileşim Atlası, four directions for an overhaul (atlas.html). The data is the atlas's
// own (atlas-data.json, pulled from etkilesim-atlasi/src/_p2.js with each card's place on
// the live map); only the way it is shown changes. All four share one frame: the map.
// lockup, a search, the ten clusters as filters, and one detail drawer.

import { lockup } from "./ima-mark.js";

const D = await (await fetch("/preview/atlas-data.json", { cache: "no-cache" })).json();
const LIBS = D.libs.map((l, i) => ({ ...l, i }));
const CATS = D.cats;
const CAT_KEYS = Object.keys(CATS);
const AXES = D.axes;
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);

// Grid references, as in a printed atlas: twelve columns (no I, it reads as 1), five rows.
const COLS = "ABCDEFGHJKLM";
const ref = (l) => COLS[Math.min(11, Math.floor(l.x * 12))] + (1 + Math.min(4, Math.floor(l.y * 5)));
// The surface a library draws on decides a tile's corner (direction B).
const SURF = ["DOM", "SVG", "Canvas", "WebGL"];
const surface = (l) => { const m = Math.max(...l.v.slice(0, 4)); return m < 0.25 ? -1 : l.v.indexOf(m); };

const DIRS = {
  pafta: {
    label: "A · Pafta",
    note: "Basılı bir atlas gibi: kâğıt zemin, kümeler kıyı çizgisi ve yükselti tonuyla bölge, kütüphaneler kasaba. Yalnız canlı demosu olanların adı yazılı, gerisi üzerine gelince. Her kütüphanenin bir pafta karesi var (K4 gibi), dizin yanda.",
  },
  karo: {
    label: "B · Karo",
    note: "IMA ailesinin dili: her kütüphane, lab işaretinin karolarından biri. Köşe neyin üstüne çizdiğini (DOM, SVG, Canvas, WebGL), doku kümesini söylüyor; canlı demosu olanlar dolu karo. Harita yerine raflar.",
  },
  dizin: {
    label: "C · Dizin",
    note: "Harita yok, tipografik bir dizin. Her satırda 13 eksenin parmak izi: kütüphaneleri birbirinden ayıran şey bir bakışta görünüyor. Sıralanabilir; en hızlı ve telefonda en rahat olanı.",
  },
  masa: {
    label: "D · Işık masası",
    note: "Bugünkü mekânsal fikir, sadeleşmiş: karanlık bir ışık masasında 162 slayt, t-SNE'nin koyduğu yerde. Sürükleyerek gezilir, 'sığdır' bütünü gösterir. Mevcut atlasa en yakın olanı.",
  },
};

let dir = "pafta";
try { dir = JSON.parse(sessionStorage.getItem("atlas"))?.dir || dir; } catch {}
if (!DIRS[dir]) dir = "pafta";
const off = new Set(); // clusters switched off
let query = "";
let sortKey = "cat", sortUp = true;
let current = -1;

const app = document.getElementById("app");
const stage = document.getElementById("stage");
const drawer = document.getElementById("drawer");

// ——— Preview controls ———
function controls() {
  document.getElementById("controls").innerHTML = `<div class="modes-row"><span class="label">Yön</span>${Object.entries(DIRS).map(([k, v]) => `<button type="button" class="chip" data-dir="${k}" aria-pressed="${k === dir}">${v.label}</button>`).join("")}</div>`;
  document.getElementById("note").textContent = DIRS[dir].note;
}
document.getElementById("controls").addEventListener("click", (e) => {
  const b = e.target.closest("[data-dir]");
  if (!b) return;
  dir = b.dataset.dir;
  try { sessionStorage.setItem("atlas", JSON.stringify({ dir })); } catch {}
  closeDrawer();
  render();
});

// ——— The shared frame ———
function frame() {
  app.querySelector(".ax-lock").innerHTML = lockup("map");
  app.querySelector(".ax-cats").innerHTML = CAT_KEYS.map((k) => {
    const n = LIBS.filter((l) => l.cat === k).length;
    return `<button type="button" class="ax-cat" data-cat="${k}" style="--c:${CATS[k].color}" aria-pressed="${!off.has(k)}"><i class="sw sw-${k}"></i>${esc(CATS[k].label)}<u>${n}</u></button>`;
  }).join("");
}
app.querySelector(".ax-cats").addEventListener("click", (e) => {
  const b = e.target.closest("[data-cat]");
  if (!b) return;
  const k = b.dataset.cat;
  off.has(k) ? off.delete(k) : off.add(k);
  b.setAttribute("aria-pressed", String(!off.has(k)));
  filter();
});
app.querySelector(".ax-search input").addEventListener("input", (e) => { query = e.target.value.trim().toLocaleLowerCase("tr"); filter(); });

const matches = (l) => !off.has(l.cat) && (!query || `${l.name} ${l.tag} ${l.glyph}`.toLocaleLowerCase("tr").includes(query));
function filter() {
  let n = 0;
  stage.querySelectorAll("[data-i]").forEach((el) => {
    const ok = matches(LIBS[el.dataset.i]);
    el.classList.toggle("is-off", !ok);
  });
  LIBS.forEach((l) => { if (matches(l)) n++; });
  app.querySelector(".ax-count").innerHTML = `<b>${n}</b> / ${LIBS.length} kütüphane`;
  stage.querySelectorAll("[data-cat-block]").forEach((el) => el.classList.toggle("is-off", off.has(el.dataset.catBlock)));
}

// ——— A · Pafta ———
function pafta() {
  const W = 1400, H = 640, X = (l) => 60 + l.x * 1280, Y = (l) => 50 + l.y * 540;
  const r = (l) => 2.6 + Math.log10(l.stars + 1) * 2.4;
  const grid = [...Array(13)].map((_, i) => `<line x1="${40 + i * 110}" y1="30" x2="${40 + i * 110}" y2="${H - 30}"/>`).join("")
    + [...Array(6)].map((_, i) => `<line x1="40" y1="${30 + i * 116}" x2="${W - 40}" y2="${30 + i * 116}"/>`).join("");
  const glabels = [...COLS].map((c, i) => `<text x="${95 + i * 110}" y="22">${c}</text><text x="${95 + i * 110}" y="${H - 12}">${c}</text>`).join("")
    + [1, 2, 3, 4, 5].map((n, i) => `<text x="22" y="${92 + i * 116}">${n}</text><text x="${W - 22}" y="${92 + i * 116}">${n}</text>`).join("");
  const land = (rad) => CAT_KEYS.map((k) => `<g data-cat-block="${k}" fill="${CATS[k].color}">${LIBS.filter((l) => l.cat === k).map((l) => `<circle cx="${X(l).toFixed(1)}" cy="${Y(l).toFixed(1)}" r="${rad}"/>`).join("")}</g>`).join("");
  const names = CAT_KEYS.map((k) => {
    const ls = LIBS.filter((l) => l.cat === k);
    const cx = ls.reduce((s, l) => s + X(l), 0) / ls.length, cy = ls.reduce((s, l) => s + Y(l), 0) / ls.length;
    return `<text class="pf-region" data-cat-block="${k}" x="${cx.toFixed(0)}" y="${(cy - 6).toFixed(0)}">${esc(CATS[k].label.toLocaleUpperCase("tr"))}</text>`;
  }).join("");
  const towns = LIBS.map((l) => `<g class="pf-town${l.live ? " is-live" : ""}" data-i="${l.i}" tabindex="0" role="button" aria-label="${esc(l.name)}">
      <circle cx="${X(l).toFixed(1)}" cy="${Y(l).toFixed(1)}" r="${r(l).toFixed(1)}"/>
      <text x="${(X(l) + r(l) + 4).toFixed(1)}" y="${(Y(l) + 3.5).toFixed(1)}">${esc(l.name)}</text></g>`).join("");
  const index = CAT_KEYS.map((k) => `<section data-cat-block="${k}"><h4 style="--c:${CATS[k].color}">${esc(CATS[k].label)}</h4>${LIBS.filter((l) => l.cat === k).sort((a, b) => a.name.localeCompare(b.name, "tr")).map((l) => `<a href="#" data-i="${l.i}"><span>${esc(l.name)}</span><i></i><b>${ref(l)}</b></a>`).join("")}</section>`).join("");
  stage.innerHTML = `<div class="pf">
    <div class="pf-map"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Kütüphanelerin haritası">
      <defs>
        <filter id="pf-goo" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="13"/><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 24 -10"/></filter>
        <filter id="pf-coast" x="-5%" y="-5%" width="110%" height="110%"><feGaussianBlur stdDeviation="13"/><feColorMatrix values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 24 -10" result="s"/><feMorphology in="s" operator="erode" radius="1.3" result="e"/><feComposite in="s" in2="e" operator="out"/></filter>
      </defs>
      <g class="pf-grid">${grid}</g><g class="pf-glabel">${glabels}</g>
      <g filter="url(#pf-goo)" opacity="0.16">${land(44)}</g>
      <g filter="url(#pf-goo)" opacity="0.2">${land(24)}</g>
      <g filter="url(#pf-coast)" opacity="0.9">${land(44)}</g>
      <g class="pf-names">${names}</g>
      <g class="pf-towns">${towns}</g>
    </svg>
    <div class="pf-legend"><span><i class="lg-live"></i>canlı demo</span><span><i class="lg-ring"></i>yalnız künye</span><span>daire büyüklüğü: GitHub ilgisi</span><span class="mono">t-SNE · 13 eksen · 162</span></div></div>
    <aside class="pf-index"><p class="label">Dizin</p>${index}</aside></div>`;
}

// ——— B · Karo ———
// The four corner shapes are the lab mark's own; a square for a library that draws nothing.
const SHAPES = [
  "M21.6 0H48V48H0V21.6A21.6 21.6 0 0 1 21.6 0Z",        // DOM: arch corner, top left
  "M0 24A24 24 0 0 1 48 24V48H0Z",                         // SVG: arch top
  "M0 0H48V26.4A21.6 21.6 0 0 1 26.4 48H0Z",               // Canvas: arch corner, bottom right
  "M0 0H48V48H21.6A21.6 21.6 0 0 1 0 26.4Z",               // WebGL: arch corner, bottom left
];
const SQUARE = "M0 0H48V48H0Z";
// One texture per cluster, all in petrol.
const TEX = {
  geo: `<path d="M0 2H6M0 5H6" stroke-width=".7"/>`,
  viz: `<path d="M2 0V6M5 0V6" stroke-width=".7"/>`,
  "3d": `<path d="M-1 1L1-1M0 6L6 0M5 7L7 5" stroke-width=".7"/>`,
  game: `<path d="M-1 1L1-1M0 6L6 0M5 7L7 5M-1 5L1 7M0 0L6 6M5-1L7 1" stroke-width=".55"/>`,
  creative: `<circle cx="3" cy="3" r="1" stroke="none" fill="currentColor"/>`,
  motion: `<path d="M-1 5L1 7M0 0L6 6M5-1L7 1" stroke-width=".7"/>`,
  audio: `<path d="M0 3Q1.5 1 3 3T6 3" stroke-width=".7"/>`,
  sense: `<circle cx="3" cy="3" r="1.7" stroke-width=".6"/>`,
  story: `<path d="M0 0H3V3H0ZM3 3H6V6H3Z" stroke="none" fill="currentColor" opacity=".55"/>`,
  tools: `<path d="M3 1V5M1 3H5" stroke-width=".7"/>`,
};
const texDefs = () => `<svg class="defs" aria-hidden="true"><defs>${CAT_KEYS.map((k) => `<pattern id="tx-${k}" width="6" height="6" patternUnits="userSpaceOnUse"><rect width="6" height="6" fill="#fff"/><g fill="none" stroke="currentColor" color="#286375">${TEX[k]}</g></pattern>`).join("")}</defs></svg>`;
function tile(l, size = 48) {
  const s = surface(l), d = s < 0 ? SQUARE : SHAPES[s];
  const ch = esc(([...l.name.replace(/^[^A-Za-z0-9]+/, "")][0] || "?").toLocaleUpperCase("en"));
  const letter = l.live
    ? `<text x="24" y="33" fill="#fff">${ch}</text>`
    : `<text x="24" y="33" fill="#286375" stroke="#fff" stroke-width="3.2" paint-order="stroke fill">${ch}</text>`;
  return `<svg class="kr-tile" viewBox="-0.5 -0.5 49 49" width="${size}" height="${size}" aria-hidden="true"><path d="${d}" fill="${l.live ? "#286375" : `url(#tx-${l.cat})`}" stroke="#286375" stroke-width="1"/>${letter}</svg>`;
}
function karo() {
  const legendShapes = SURF.map((n, i) => `<span>${tile({ name: n, live: 0, cat: "tools", v: [0, 0, 0, 0].map((_, j) => (j === i ? 1 : 0)) }, 30)}${n}</span>`).join("");
  const legendTex = CAT_KEYS.map((k) => `<span><svg viewBox="0 0 20 20" width="20" height="20" aria-hidden="true"><rect x=".5" y=".5" width="19" height="19" fill="url(#tx-${k})" stroke="#286375"/></svg>${esc(CATS[k].label)}</span>`).join("");
  stage.innerHTML = `${texDefs()}<div class="kr">
    <div class="kr-key">
      <div><p class="label">Köşe · neyin üstüne çiziyor</p><div class="kr-keyrow">${legendShapes}<span>${tile({ name: "—", live: 0, cat: "tools", v: [0, 0, 0, 0] }, 30)}hiçbiri</span></div></div>
      <div><p class="label">Doku · küme</p><div class="kr-keyrow is-tex">${legendTex}</div></div>
      <div><p class="label">Dolu · canlı demo</p><div class="kr-keyrow">${tile({ name: "p5.js", live: 1, cat: "creative", v: [0, 0, 1, 0] }, 30)}<span>28 kütüphane kartın içinde çalışıyor</span></div></div>
    </div>
    ${CAT_KEYS.map((k) => `<section class="kr-shelf" data-cat-block="${k}">
      <header><h3>${esc(CATS[k].label)}</h3><p>${esc(CATS[k].note)}</p></header>
      <div class="kr-row">${LIBS.filter((l) => l.cat === k).map((l) => `<a href="#" class="kr-item" data-i="${l.i}">${tile(l)}<span>${esc(l.name)}</span></a>`).join("")}</div>
    </section>`).join("")}</div>`;
}

// ——— C · Dizin ———
const COLS_C = [
  ["no", "№"], ["name", "Kütüphane"], ["cat", "Küme"], ["year", "Yıl"], ["kb", "kB"], ["stars", "GitHub bin"], ["v", "Parmak izi · 13 eksen"], ["live", "Canlı"],
];
function sorted() {
  const val = (l) => (sortKey === "no" ? l.i : sortKey === "cat" ? CAT_KEYS.indexOf(l.cat) * 1000 + l.i : sortKey === "v" ? l.v.reduce((a, b) => a + b, 0) : l[sortKey]);
  return [...LIBS].sort((a, b) => {
    const x = val(a), y = val(b);
    const c = typeof x === "string" ? x.localeCompare(y, "tr") : x - y;
    return sortUp ? c : -c;
  });
}
function dizin() {
  const fam = D.families.map((f) => f.ax.length);
  const print = (v) => { let k = 0; return fam.map((n) => `<span class="fp-g">${v.slice(k, (k += n)).map((x) => `<i style="--a:${x}"></i>`).join("")}</span>`).join(""); };
  const head = COLS_C.map(([k, t]) => `<th scope="col" class="c-${k}"><button type="button" data-sort="${k}" aria-pressed="${sortKey === k}">${t}${sortKey === k ? (sortUp ? " ↑" : " ↓") : ""}</button></th>`).join("");
  const axisHead = `<div class="fp-head">${(() => { let k = 0; return fam.map((n) => `<span class="fp-g">${AXES.slice(k, (k += n)).map((a) => `<b title="${esc(a)}">${esc(a.slice(0, 2))}</b>`).join("")}</span>`).join(""); })()}</div>`;
  stage.innerHTML = `<div class="dz">
    <div class="dz-lead"><h2>162 kütüphane, <em>13 soruya</em> verdikleri cevaplarla.</h2><p>${D.families.map((f) => `<span>${esc(f.t)}</span>`).join("")}</p></div>
    <table class="dz-t"><thead><tr>${head}</tr><tr class="dz-axes"><td colspan="6"></td><td>${axisHead}</td><td></td></tr></thead>
    <tbody>${sorted().map((l) => `<tr data-i="${l.i}" tabindex="0">
      <td class="c-no mono">${String(l.i + 1).padStart(3, "0")}</td>
      <td class="c-name"><b>${esc(l.name)}</b><span>${esc(l.tag)}</span></td>
      <td class="c-cat"><i style="--c:${CATS[l.cat].color}"></i>${esc(CATS[l.cat].label)}</td>
      <td class="c-year mono">${l.year}</td><td class="c-kb mono">${l.kb}</td><td class="c-stars mono">${l.stars}</td>
      <td class="c-v"><div class="fp">${print(l.v)}</div></td>
      <td class="c-live">${l.live ? `<span class="tag">canlı</span>` : ""}</td></tr>`).join("")}</tbody></table></div>`;
}
stage.addEventListener("click", (e) => {
  const b = e.target.closest("[data-sort]");
  if (!b) return;
  const k = b.dataset.sort;
  if (sortKey === k) sortUp = !sortUp; else { sortKey = k; sortUp = !["stars", "kb", "year", "live", "v"].includes(k); }
  dizin();
  filter();
});

// ——— D · Işık masası ———
const MW = 4400, MH = 1800;
function masa() {
  const cent = CAT_KEYS.map((k) => {
    const ls = LIBS.filter((l) => l.cat === k);
    return { k, x: ls.reduce((s, l) => s + l.x, 0) / ls.length, y: ls.reduce((s, l) => s + l.y, 0) / ls.length };
  });
  stage.innerHTML = `<div class="ms" tabindex="0" aria-label="Işık masası; sürükleyerek gezin">
    <div class="ms-board" style="width:${MW}px;height:${MH}px">
      ${cent.map((c) => `<span class="ms-glow" data-cat-block="${c.k}" style="left:${(80 + c.x * (MW - 260)).toFixed(0)}px;top:${(60 + c.y * (MH - 190)).toFixed(0)}px;--c:${CATS[c.k].color}"><b>${esc(CATS[c.k].label)}</b></span>`).join("")}
      ${LIBS.map((l) => `<button type="button" class="ms-slide${l.live ? " is-live" : ""}" data-i="${l.i}" style="left:${(80 + l.x * (MW - 260)).toFixed(0)}px;top:${(60 + l.y * (MH - 190)).toFixed(0)}px;--c:${CATS[l.cat].color}">
        <span class="ms-win"><i>${esc(l.glyph)}</i></span><b>${esc(l.name)}</b><u class="mono">${String(l.i + 1).padStart(3, "0")}</u></button>`).join("")}
    </div>
    <div class="ms-tools"><button type="button" data-fit>Sığdır</button><button type="button" data-near>Yakın</button></div></div>`;
  const ms = stage.querySelector(".ms"), board = ms.querySelector(".ms-board");
  let fit = false;
  // Fitted, the whole board is scaled into view and centred; near, it is full size and panned.
  const place = () => {
    const s = Math.min(ms.clientWidth / MW, ms.clientHeight / MH);
    board.style.transform = fit ? `translate(${((ms.clientWidth - MW * s) / 2).toFixed(0)}px, ${((ms.clientHeight - MH * s) / 2).toFixed(0)}px) scale(${s.toFixed(4)})` : "";
    board.classList.toggle("is-fit", fit);
    ms.classList.toggle("is-fit", fit);
    if (fit) ms.scrollTo(0, 0);
    else ms.scrollTo((MW - ms.clientWidth) / 2, (MH - ms.clientHeight) / 2);
  };
  ms.querySelector("[data-fit]").onclick = () => { fit = true; place(); };
  ms.querySelector("[data-near]").onclick = () => { fit = false; place(); };
  // Drag to pan; a click that did not move still opens a slide.
  let drag = null;
  ms.addEventListener("pointerdown", (e) => { if (fit || e.target.closest(".ms-tools")) return; drag = { x: e.clientX, y: e.clientY, sx: ms.scrollLeft, sy: ms.scrollTop, moved: false }; });
  addEventListener("pointermove", (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (Math.abs(dx) + Math.abs(dy) > 4) { drag.moved = true; ms.classList.add("is-dragging"); }
    ms.scrollLeft = drag.sx - dx; ms.scrollTop = drag.sy - dy;
  });
  addEventListener("pointerup", () => { if (drag?.moved) ms.dataset.justDragged = "1"; drag = null; ms.classList.remove("is-dragging"); setTimeout(() => delete ms.dataset.justDragged, 0); });
  place();
}

// ——— Detail drawer, shared ———
function openDrawer(i) {
  const l = LIBS[i];
  current = i;
  let k = 0;
  const bars = D.families.map((f) => `<div class="dr-fam"><p>${esc(f.t)}</p>${f.ax.map((a) => `<div class="dr-bar"><span>${esc(a)}</span><i style="--w:${(l.v[k++] * 100).toFixed(0)}%"></i></div>`).join("")}</div>`).join("");
  drawer.innerHTML = `<button type="button" class="dr-close" aria-label="Kapat">×</button>
    <p class="dr-cat"><i style="--c:${CATS[l.cat].color}" class="sw sw-${l.cat}"></i>${esc(CATS[l.cat].label)} · <span class="mono">${ref(l)}</span></p>
    <div class="dr-title">${dir === "karo" ? tile(l, 64) : ""}<h2>${esc(l.name)}</h2></div>
    <p class="dr-tag">${esc(l.tag)}</p>
    ${l.live ? `<p class="dr-live"><span class="tag">canlı</span>Bu kütüphane atlasta kartın içinde çalışıyor.</p>` : ""}
    <dl class="dr-facts"><div><dt>Yıl</dt><dd>${l.year}</dd></div><div><dt>Lisans</dt><dd>${esc(l.lic)}</dd></div><div><dt>Boyut</dt><dd>${l.kb} kB</dd></div><div><dt>GitHub</dt><dd>${l.stars} bin</dd></div></dl>
    ${bars}
    <p class="dr-acts"><a href="https://${esc(l.url)}" target="_blank" rel="noopener">${esc(l.url)} ↗</a><a href="/etkilesim-atlas.html">Atlasta aç ↗</a></p>`;
  app.classList.add("has-drawer");
  drawer.setAttribute("aria-hidden", "false");
  stage.querySelectorAll(".is-current").forEach((el) => el.classList.remove("is-current"));
  stage.querySelectorAll(`[data-i="${i}"]`).forEach((el) => el.classList.add("is-current"));
}
function closeDrawer() {
  current = -1;
  app.classList.remove("has-drawer");
  drawer.setAttribute("aria-hidden", "true");
  stage.querySelectorAll(".is-current").forEach((el) => el.classList.remove("is-current"));
}
drawer.addEventListener("click", (e) => { if (e.target.closest(".dr-close")) closeDrawer(); });
stage.addEventListener("click", (e) => {
  const el = e.target.closest("[data-i]");
  if (!el || stage.querySelector(".ms")?.dataset.justDragged) return;
  e.preventDefault();
  openDrawer(+el.dataset.i);
});
stage.addEventListener("keydown", (e) => {
  const el = e.target.closest("[data-i]");
  if (el && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); openDrawer(+el.dataset.i); }
});
addEventListener("keydown", (e) => { if (e.key === "Escape" && current >= 0) closeDrawer(); });

// ——— Render ———
const VIEWS = { pafta, karo, dizin, masa };
function render() {
  app.dataset.dir = dir;
  controls();
  VIEWS[dir]();
  filter();
}
frame();
render();
