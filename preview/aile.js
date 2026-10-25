import { loadCatalog, escapeHtml } from "/assets/js/catalog.js";

// How the owner's monogram and the project marks become one family. Four ties, each shown
// with either logo: the same bars can turn one into the other, they read as letters of one
// alphabet, they share tracks, and they sign each other's pages.

const { projects } = await loadCatalog();
const SHOW = ["jstudio", "networkcanvas", "philosophical-networks", "critical-theory", "socrates", "ima-lab", "etkilesim-atlasi", "grad-projects", "icebreaker", "find-the-university", "visualizing-sep", "kafka"];

const PITCH = 21 / 8;
const T = +(PITCH * 0.62).toFixed(2);
const C = (i) => 1.5 + PITCH / 2 + i * PITCH;
const f = (n) => +n.toFixed(2);
const kindState = (p) => (p.kind === "Featured" ? "" : p.kind === "Teaching" ? "hollow" : "dots");

const TOPICS = [
  ["Philosophy", ["Philosophy"]], ["Networks", ["Networks"]], ["Data", ["Data"]], ["Journalism", ["Journalism", "Storytelling"]],
  ["Place", ["Location", "Mobile", "Mapping", "AR"]], ["Interaction", ["Interaction", "Interface", "Design", "Play", "Exhibition", "3D"]],
  ["Systems", ["Real-time", "Collaboration", "Tools", "AI", "Computer vision"]], ["Education", ["Education"]],
];
const TOOLS = [
  ["Viz", ["D3", "Graphology", "jsnetworkx", "jStat"]], ["Script", ["JavaScript"]], ["Web", ["HTML", "CSS", "Tailwind"]],
  ["Geo", ["Leaflet", "Geolocation", "DeviceOrientation"]], ["Graphics", ["p5.js", "Canvas", "Three.js"]], ["Peer", ["PeerJS", "QRCode.js"]],
  ["Vision", ["MediaPipe"]], ["Python", ["Python"]],
];
const families = (list, fams) => [...new Set(list.map((x) => fams.findIndex(([, m]) => m.includes(x))).filter((i) => i >= 0))].sort((a, b) => a - b);
const topicsOf = (p) => families(p.topics, TOPICS);
const toolsOf = (p) => families(p.stack, TOOLS);

// Both logos sit on the tracks as they are, with no half-track nudge, so they can share
// tracks with the projects. Alone, a logo is centred on its own bounds instead.
const LOGOS = {
  mono: { name: "Kare monogram", bars: [[0, 0, 6, 0], [0, 0, 0, 2], [3, 0, 3, 2], [6, 0, 6, 2], [0, 3, 6, 3], [0, 3, 0, 5], [0, 5, 6, 5], [6, 5, 6, 7], [0, 7, 6, 7]] },
  lig: { name: "Ligatür", bars: [[0, 2, 7, 2], [0, 2, 0, 6], [2, 2, 2, 6], [4, 2, 4, 6], [5, 2, 5, 4], [5, 4, 7, 4], [7, 4, 7, 6], [4, 6, 7, 6]] },
};

// Full bars run edge to edge. Trimmed bars stop one track past their last crossing, so a
// project draws a glyph, as the logo does, instead of a grid; a glyph is at least four
// tracks wide and tall, so none shrinks to a speck.
const fullBars = (p) => [...toolsOf(p).map((c) => [c, 0, c, 7]), ...topicsOf(p).map((r) => [0, r, 7, r])];
const trimBars = (p) => {
  const R = topicsOf(p), K = toolsOf(p);
  const ext = (l) => {
    let lo = Math.min(...l) - 1, hi = Math.max(...l) + 1;
    while (hi - lo < 4) { lo--; hi++; }
    const s = lo < 0 ? -lo : hi > 7 ? 7 - hi : 0;
    return [Math.max(0, lo + s), Math.min(7, hi + s)];
  };
  const [c0, c1] = ext(K), [r0, r1] = ext(R);
  return [...K.map((c) => [c, r0, c, r1]), ...R.map((r) => [c0, r, c1, r])];
};

const state = { logo: "mono", length: "trim" };
const barsOf = (p) => (state.length === "trim" ? trimBars(p) : fullBars(p));
const logoBars = () => LOGOS[state.logo].bars;

// ——— Drawing ———

const d = ([x1, y1, x2, y2]) => `M${f(C(x1))},${f(C(y1))} L${f(C(x2))},${f(C(y2))}`;
function bar(b, st = "", cls = "") {
  if (st === "dots") return `<path class="b dots ${cls}" d="${d(b)}" style="stroke-width:${T};stroke-dasharray:0.01 ${f(T * 1.7)}"/>`;
  const ink = `<path class="b ${cls}" d="${d(b)}" style="stroke-width:${T}"/>`;
  return st === "hollow" ? `${ink}<path class="b-in ${cls}" d="${d(b)}" style="stroke-width:${f(T - 0.8)}"/>` : ink;
}
const gridDots = () => Array.from({ length: 64 }, (_, i) => `<circle class="g" cx="${f(C(i % 8))}" cy="${f(C(Math.floor(i / 8)))}" r="0.28"/>`).join("");
const svg = (body, vb = "0 0 24 24") => `<svg viewBox="${vb}" aria-hidden="true">${body}</svg>`;
const onGrid = (bars, st = "", grid = false) => svg((grid ? gridDots() : "") + bars.map((b) => bar(b, st)).join(""));
// Centred on its own bounds, for the logo used on its own.
function alone(bars) {
  const xs = bars.flatMap(([a, , b]) => [C(a), C(b)]), ys = bars.flatMap(([, a, , b]) => [C(a), C(b)]);
  const x0 = Math.min(...xs) - T / 2, x1 = Math.max(...xs) + T / 2, y0 = Math.min(...ys) - T / 2, y1 = Math.max(...ys) + T / 2;
  const s = Math.max(x1 - x0, y1 - y0) + 1.6, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  return svg(bars.map((b) => bar(b)).join(""), `${f(cx - s / 2)} ${f(cy - s / 2)} ${f(s)} ${f(s)}`);
}
// A trimmed glyph on its own sits in the middle of the square, as a letter would.
const centred = (bars) => {
  const xs = bars.flatMap(([a, , b]) => [a, b]), ys = bars.flatMap(([, a, , b]) => [a, b]);
  const dx = 3.5 - (Math.min(...xs) + Math.max(...xs)) / 2, dy = 3.5 - (Math.min(...ys) + Math.max(...ys)) / 2;
  return bars.map(([x1, y1, x2, y2]) => [x1 + dx, y1 + dy, x2 + dx, y2 + dy]);
};
const glyphOf = (p, length = state.length) => onGrid(length === "trim" ? centred(trimBars(p)) : fullBars(p), kindState(p));

// Where a logo bar and a project bar lie on the same track and overlap.
function shared(L, P) {
  const out = [];
  for (const [a1, b1, a2, b2] of L) for (const [c1, e1, c2, e2] of P) {
    if (b1 === b2 && e1 === e2 && b1 === e1) {
      const lo = Math.max(Math.min(a1, a2), Math.min(c1, c2)), hi = Math.min(Math.max(a1, a2), Math.max(c1, c2));
      if (lo < hi) out.push([lo, b1, hi, b1]);
    } else if (a1 === a2 && c1 === c2 && a1 === c1) {
      const lo = Math.max(Math.min(b1, b2), Math.min(e1, e2)), hi = Math.min(Math.max(b1, b2), Math.max(e1, e2));
      if (lo < hi) out.push([a1, lo, a1, hi]);
    }
  }
  return out;
}

// ——— Morph: the logo's bars slide and stretch into a project's, then back ———

const isH = ([, y1, , y2]) => y1 === y2;
const mid = ([x1, y1, x2, y2]) => [(x1 + x2) / 2, (y1 + y2) / 2, (x1 + x2) / 2, (y1 + y2) / 2];
function pairUp(a, b) {
  const out = [];
  for (const h of [false, true]) {
    const key = h ? ([x1, y]) => y * 10 + x1 : ([x, y1]) => x * 10 + y1;
    const s = a.filter((x) => isH(x) === h).sort((p, q) => key(p) - key(q));
    const t = b.filter((x) => isH(x) === h).sort((p, q) => key(p) - key(q));
    const n = Math.max(s.length, t.length);
    for (let i = 0; i < n; i++) {
      // A bar with no partner grows out of (or shrinks into) the middle of the other one.
      const from = s[i] ?? mid(t[i]), to = t[i] ?? mid(s[i]);
      out.push({ from, to, oa: s[i] ? 1 : 0, ob: t[i] ? 1 : 0 });
    }
  }
  return out;
}
const ease = (t) => t * t * (3 - 2 * t);
let morphTimer = 0, morphFrame = 0;
function runMorph(stageEl, captionEl) {
  clearTimeout(morphTimer);
  cancelAnimationFrame(morphFrame);
  const list = SHOW.map((id) => projects.find((p) => p.id === id)).filter(Boolean);
  let shape = logoBars(), step = 0;
  const host = stageEl.querySelector("g.mb");
  const draw = (bars) => { host.innerHTML = bars.map((b) => `<path d="${d(b)}" style="stroke-width:${T}"/>`).join(""); };
  draw(shape);
  captionEl.innerHTML = `<b>Mert Seven</b>`;
  const next = () => {
    const toLogo = step % 2 === 1;
    const p = list[Math.floor(step / 2) % list.length];
    const target = toLogo ? logoBars() : barsOf(p);
    const pairs = pairUp(shape, target);
    host.innerHTML = pairs.map(() => `<path style="stroke-width:${T}"/>`).join("");
    const paths = [...host.children];
    const t0 = performance.now();
    const frame = (now) => {
      const t = ease(Math.min(1, (now - t0) / 900));
      pairs.forEach(({ from, to, oa, ob }, i) => {
        paths[i].setAttribute("d", d(from.map((v, k) => v + (to[k] - v) * t)));
        paths[i].style.opacity = String(oa + (ob - oa) * t);
      });
      if (t < 1) morphFrame = requestAnimationFrame(frame);
      else {
        shape = target;
        draw(shape);
        step++;
        morphTimer = setTimeout(next, toLogo ? 900 : 1500);
      }
    };
    captionEl.innerHTML = toLogo ? `<b>Mert Seven</b>` : `<b>${escapeHtml(p.title)}</b> <span>${escapeHtml(p.topics.join(", "))} · ${escapeHtml(p.stack.join(", "))}</span>`;
    morphFrame = requestAnimationFrame(frame);
  };
  morphTimer = setTimeout(next, 1200);
}

// ——— Page ———

const root = document.getElementById("ag");
const list = SHOW.map((id) => projects.find((p) => p.id === id)).filter(Boolean);
const tip = (p) => escapeHtml(`${p.title} · ${p.topics.join(", ")} · ${p.stack.join(", ")}`);

function render() {
  const L = logoBars();
  const js = projects.find((p) => p.id === "jstudio");
  const counts = list.map((p) => shared(L, barsOf(p)).length);
  root.innerHTML = `
    <article class="vc vc--wide">
      <div class="vc-head"><span class="label">Sorun</span><h2>Şu an neden <em>aile</em> değiller?</h2></div>
      <p class="vc-desc">Logo bir harf: kısa çubuklar köşelerde birleşiyor. Proje işaretleri bir tablo: çubuklar kenardan kenara uzanıyor. Aynı ızgarada duruyorlar ama aynı dili konuşmuyorlar. Aşağıdaki dört bağ bunu kapatıyor; üstteki düğmelerle her birini iki logo ve iki çubuk boyuyla görebilirsin. Önerim: <b>kırpılmış çubuklar</b>. Projeler de birer glif olunca logo, aynı alfabeden bir kelime gibi duruyor.</p>
    </article>

    <article class="vc vc--wide">
      <div class="vc-head"><span class="label">1</span><h2>Aynı çubuklar, <em>dönüşüm</em></h2></div>
      <p class="vc-desc">Logonun çubukları kayıp uzayarak bir projenin işaretine dönüşüyor, sonra geri geliyor. Yeni çubuk çizilmiyor, eskisi silinmiyor: fazla olan bir çubuğun ortasından doğuyor ya da ortasına çekiliyor. Sitede: bir projenin künyesi açılınca header'daki logo o projenin işaretine dönüşür, kapanınca geri döner.</p>
      <div class="morph">
        <div class="morph-stage"><svg viewBox="0 0 24 24" aria-hidden="true">${gridDots()}<g class="mb"></g></svg></div>
        <p class="morph-cap" id="morph-cap"></p>
      </div>
    </article>

    <article class="vc vc--wide">
      <div class="vc-head"><span class="label">2</span><h2>Aynı <em>alfabe</em></h2></div>
      <p class="vc-desc">Logo ile projeler yan yana dizilince bir satır yazı gibi okunmalı. Tam boy çubuklarla projeler ızgara gibi duruyor, logo aralarında yabancı. Kırpılınca her proje bir harfe dönüşüyor: Γ, ⊥, H, ±… ve logo o alfabenin ilk kelimesi oluyor.</p>
      <div class="line"><span class="line-k">Tam boy</span><span class="line-row">${alone(L)}${list.map((p) => `<span title="${tip(p)}">${glyphOf(p, "full")}</span>`).join("")}</span></div>
      <div class="line"><span class="line-k">Kırpılmış</span><span class="line-row">${alone(L)}${list.map((p) => `<span title="${tip(p)}">${glyphOf(p, "trim")}</span>`).join("")}</span></div>
    </article>

    <article class="vc vc--wide">
      <div class="vc-head"><span class="label">3</span><h2>Ortak <em>izler</em></h2></div>
      <p class="vc-desc">Logo ızgarada kaydırılmadan durduğu için projelerle aynı izleri kullanıyor. Koyu çubuklar, logo ile projenin aynı izde üst üste geldiği yerler: her proje logodan bir parça taşıyor. Soluk olanlar yalnızca birine ait.</p>
      <div class="vc-marks">${list.map((p, i) => {
        const P = barsOf(p), S = shared(L, P);
        return `<span class="vm" title="${tip(p)}">${svg(gridDots() + L.map((b) => bar(b, "", "faint")).join("") + P.map((b) => bar(b, "", "faint")).join("") + S.map((b) => bar(b)).join(""))}<span>${escapeHtml(p.title)}<br>${counts[i] ? `${counts[i]} ortak` : "ortak yok"}</span></span>`;
      }).join("")}</div>
    </article>

    <article class="vc vc--wide">
      <div class="vc-head"><span class="label">4</span><h2><em>İmza</em></h2></div>
      <p class="vc-desc">Logo hiçbir zaman tek başına değil, hep bir proje işaretiyle birlikte. Proje sayfasında ikisi yan yana bir kelime gibi duruyor: kimin ve ne.</p>
      <div class="sig-mocks">
        <div class="sig-page">
          <div class="sig-crumb">${alone(L)}<span>Mert <em>Seven</em></span><span class="sep">/</span>${glyphOf(js)}<span>Journalism Studio</span></div>
          <div class="sig-title">${glyphOf(js)}<h3>Journalism <em>Studio</em></h3></div>
          <p class="sig-meta">Journalism · Education · Mapping — Tailwind, Leaflet, JavaScript</p>
        </div>
        <div class="sig-foot">
          <span>Set in Geist &amp; Instrument Serif · Made by hand in İzmir · © 2026</span>
          <span class="sig-pair">${alone(L)}<span class="plus">×</span>${glyphOf(js)}</span>
        </div>
      </div>
    </article>`;
  runMorph(root.querySelector(".morph-stage"), root.querySelector("#morph-cap"));
}

const bind = (attr, key) => {
  for (const b of document.querySelectorAll(`[${attr}]`)) {
    b.addEventListener("click", () => {
      state[key] = b.getAttribute(attr);
      document.querySelectorAll(`[${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      render();
    });
  }
};
bind("data-logo", "logo");
bind("data-length", "length");
for (const b of document.querySelectorAll("[data-theme-set]")) {
  b.addEventListener("click", () => {
    document.documentElement.dataset.theme = b.dataset.themeSet;
    document.querySelectorAll("[data-theme-set]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  });
}
render();
