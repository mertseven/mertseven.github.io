import { loadCatalog, escapeHtml } from "/assets/js/catalog.js";

// Bars that spell. One alphabet of bars on a small grid; the owner's monogram is "m" over
// "s", and every project writes its own two letters the same way. A mark always says
// something now: whose it is.
//
// Glyph: 7 × 7 tracks. Two letters stacked, each three tracks tall (rows 0–2 and 4–6) and
// seven wide, with one empty row between. Inside a letter, bars run between the points
// x ∈ {0, 3, 6}, y ∈ {0, 1, 2}: only horizontal or vertical, never diagonal.

const { projects } = await loadCatalog();
const SHOW = ["jstudio", "networkcanvas", "philosophical-networks", "critical-theory", "socrates", "ima-lab", "etkilesim-atlasi", "grad-projects", "icebreaker", "find-the-university", "visualizing-sep", "kafka"];

const PITCH = 3;
const T = 1.5;
const C = (i) => 3 + i * PITCH;
const f = (n) => +n.toFixed(2);

const A = {
  a: [[0, 0, 6, 0], [6, 0, 6, 2], [0, 1, 6, 1], [0, 1, 0, 2], [0, 2, 6, 2]],
  b: [[0, 0, 0, 2], [0, 1, 6, 1], [6, 1, 6, 2], [0, 2, 6, 2]],
  c: [[0, 0, 6, 0], [0, 0, 0, 2], [0, 2, 6, 2]],
  d: [[6, 0, 6, 2], [0, 1, 6, 1], [0, 1, 0, 2], [0, 2, 6, 2]],
  e: [[0, 0, 6, 0], [0, 0, 0, 2], [6, 0, 6, 1], [0, 1, 6, 1], [0, 2, 6, 2]],
  f: [[0, 0, 6, 0], [0, 0, 0, 2], [0, 1, 3, 1]],
  g: [[0, 0, 6, 0], [0, 0, 0, 2], [0, 2, 6, 2], [6, 1, 6, 2], [3, 1, 6, 1]],
  h: [[0, 0, 0, 2], [0, 1, 6, 1], [6, 1, 6, 2]],
  i: [[0, 0, 6, 0], [3, 0, 3, 2], [0, 2, 6, 2]],
  j: [[6, 0, 6, 2], [0, 2, 6, 2], [0, 1, 0, 2]],
  k: [[0, 0, 0, 2], [0, 1, 3, 1], [3, 0, 3, 2], [3, 0, 6, 0], [3, 2, 6, 2]],
  l: [[0, 0, 0, 2], [0, 2, 6, 2]],
  m: [[0, 0, 6, 0], [0, 0, 0, 2], [3, 0, 3, 2], [6, 0, 6, 2]],
  n: [[0, 0, 6, 0], [0, 0, 0, 2], [6, 0, 6, 2]],
  o: [[0, 0, 6, 0], [0, 0, 0, 2], [6, 0, 6, 2], [0, 2, 6, 2]],
  p: [[0, 0, 6, 0], [0, 0, 0, 2], [6, 0, 6, 1], [0, 1, 6, 1]],
  q: [[0, 0, 6, 0], [0, 0, 0, 1], [6, 0, 6, 2], [0, 1, 6, 1]],
  r: [[0, 0, 6, 0], [0, 0, 0, 2]],
  s: [[0, 0, 6, 0], [0, 0, 0, 1], [0, 1, 6, 1], [6, 1, 6, 2], [0, 2, 6, 2]],
  t: [[0, 0, 6, 0], [3, 0, 3, 2]],
  u: [[0, 0, 0, 2], [6, 0, 6, 2], [0, 2, 6, 2]],
  v: [[0, 0, 0, 2], [0, 2, 3, 2], [3, 1, 3, 2], [3, 1, 6, 1], [6, 0, 6, 1]],
  w: [[0, 0, 0, 2], [3, 0, 3, 2], [6, 0, 6, 2], [0, 2, 6, 2]],
  x: [[0, 1, 6, 1], [3, 0, 3, 2], [0, 0, 0, 1], [6, 1, 6, 2]],
  y: [[0, 0, 0, 1], [0, 1, 6, 1], [6, 0, 6, 2], [0, 2, 6, 2]],
  z: [[0, 0, 6, 0], [6, 0, 6, 1], [0, 1, 6, 1], [0, 1, 0, 2], [0, 2, 6, 2]],
};
// Letters that also read as digits in this alphabet; worth knowing, not worth hiding.
const LOOKALIKE = { s: "5", z: "2", g: "6", o: "0", i: "1", b: "6" };

// Two layouts of the same alphabet. Stacked: wide letters (7 × 3), one above the other.
// Side by side: the same letters condensed (3 × 7), the points moved to x ∈ {0, 1, 2},
// y ∈ {0, 3, 6}; every bar keeps its place in the letter, only the proportion changes.
const state = { layout: "stack" };
const letterBars = (ch) => (state.layout === "side" ? A[ch].map(([x1, y1, x2, y2]) => [x1 / 3, y1 * 3, x2 / 3, y2 * 3]) : A[ch]);
const glyphBars = ([a, b]) => {
  const [dx, dy] = state.layout === "side" ? [4, 0] : [0, 4];
  return [...letterBars(a), ...letterBars(b).map(([x1, y1, x2, y2]) => [x1 + dx, y1 + dy, x2 + dx, y2 + dy])];
};

// ——— Codes: two letters from the name ———

const STOP = new Set(["of", "the", "for", "and", "s", "a"]);
const fold = (s) => s.toLocaleLowerCase("tr").replace(/ı/g, "i").normalize("NFD").replace(/[̀-ͯ]/g, "");
const wordsOf = (t) => fold(t).split(/[^a-z]+/).filter((w) => w && !STOP.has(w));
function codes() {
  const used = new Set(["ms"]);
  const out = new Map();
  for (const p of projects) {
    const w = wordsOf(p.title), first = w[0], last = w.at(-1);
    // Initials of the first and last words; then the last word's later letters; then the first word's.
    const cands = w.length > 1
      ? [first[0] + last[0], ...[...last.slice(1)].map((c) => first[0] + c), ...[...first.slice(1)].map((c) => first[0] + c)]
      : [...first.slice(1)].map((c) => first[0] + c);
    const code = cands.find((c) => !used.has(c) && A[c[0]] && A[c[1]]) ?? cands[0];
    used.add(code);
    out.set(p.id, code);
  }
  return out;
}
const CODE = codes();

// ——— Drawing ———

const kindState = (p) => (p.kind === "Featured" ? "" : p.kind === "Teaching" ? "thin" : "dots");
const d = ([x1, y1, x2, y2]) => `M${f(C(x1))},${f(C(y1))} L${f(C(x2))},${f(C(y2))}`;
// Filled: the full bar. Thin: half the weight, for teaching. Dots: the bar as a row of
// beads one track apart, for experiments.
const bar = (b, st = "", k = 0) => `<path class="hb${st ? ` ${st}` : ""}"${st === "dots" ? "" : ' pathLength="1"'} d="${d(b)}" style="animation-delay:${k * 60}ms"/>`;
const gridDots = (cols = 7, rows = 7) => Array.from({ length: cols * rows }, (_, i) => `<circle class="g" cx="${f(C(i % cols))}" cy="${f(C(Math.floor(i / cols)))}" r="0.3"/>`).join("");
const svg = (body, vb = "0 0 24 24") => `<svg viewBox="${vb}" aria-hidden="true">${body}</svg>`;
const glyph = (bars, st = "", grid = false) => svg((grid ? gridDots() : "") + bars.map((b, k) => bar(b, st, k)).join(""));
const ownerBars = () => glyphBars(["m", "s"]);
const owner = (grid = false) => glyph(ownerBars(), "", grid);
const markOf = (p, grid = false) => glyph(glyphBars(CODE.get(p.id)), kindState(p), grid);
const letter = (ch) => (state.layout === "side"
  ? svg(gridDots(3, 7) + letterBars(ch).map((b) => bar(b)).join(""), "0 0 12 24")
  : svg(gridDots(7, 3) + letterBars(ch).map((b) => bar(b)).join(""), "0 0 24 12"));

// ——— Morph: one pair of letters becomes another ———

const isH = ([, y1, , y2]) => y1 === y2;
const mid = ([x1, y1, x2, y2]) => [(x1 + x2) / 2, (y1 + y2) / 2, (x1 + x2) / 2, (y1 + y2) / 2];
function pairUp(a, b) {
  const out = [];
  for (const h of [false, true]) {
    const key = h ? ([x1, y]) => y * 10 + x1 : ([x, y1]) => x * 10 + y1;
    const s = a.filter((x) => isH(x) === h).sort((p, q) => key(p) - key(q));
    const t = b.filter((x) => isH(x) === h).sort((p, q) => key(p) - key(q));
    for (let i = 0; i < Math.max(s.length, t.length); i++) out.push({ from: s[i] ?? mid(t[i]), to: t[i] ?? mid(s[i]), oa: s[i] ? 1 : 0, ob: t[i] ? 1 : 0 });
  }
  return out;
}
const ease = (t) => t * t * (3 - 2 * t);
// Each run gets a token; a re-render starts a new run and the old one stops at its next tick.
let run = 0;
function runMorph(stage, cap) {
  const me = ++run;
  const list = SHOW.map((id) => projects.find((p) => p.id === id)).filter(Boolean);
  const host = stage.querySelector("g.mb");
  const OWNER = ownerBars();
  let shape = OWNER, step = 0;
  const draw = (bars) => { host.innerHTML = bars.map((b) => `<path d="${d(b)}"/>`).join(""); };
  draw(shape);
  cap.innerHTML = "<b>ms</b> <span>Mert Seven</span>";
  const next = () => {
    if (me !== run) return;
    const toOwner = step % 2 === 1, p = list[Math.floor(step / 2) % list.length];
    const target = toOwner ? OWNER : glyphBars(CODE.get(p.id));
    const pairs = pairUp(shape, target);
    host.innerHTML = pairs.map(() => "<path/>").join("");
    const paths = [...host.children], t0 = performance.now();
    cap.innerHTML = toOwner ? "<b>ms</b> <span>Mert Seven</span>" : `<b>${CODE.get(p.id)}</b> <span>${escapeHtml(p.title)}</span>`;
    const frame = (now) => {
      if (me !== run) return;
      const t = ease(Math.min(1, (now - t0) / 800));
      pairs.forEach(({ from, to, oa, ob }, i) => {
        paths[i].setAttribute("d", d(from.map((v, k) => v + (to[k] - v) * t)));
        paths[i].style.opacity = String(oa + (ob - oa) * t);
      });
      if (t < 1) requestAnimationFrame(frame);
      else { shape = target; draw(shape); step++; setTimeout(next, toOwner ? 900 : 1600); }
    };
    requestAnimationFrame(frame);
  };
  setTimeout(next, 1200);
}

// ——— Page ———

const root = document.getElementById("ag");
const show = SHOW.map((id) => projects.find((p) => p.id === id)).filter(Boolean);
const tip = (p) => escapeHtml(`${p.title} · ${CODE.get(p.id)}`);
const js = projects.find((p) => p.id === "jstudio");
const ORDER = ["Featured", "Teaching", "Experiment"];
const byKind = ORDER.map((k) => [k, projects.filter((p) => p.kind === k)]);
const KIND_TR = { Featured: "Featured · dolu", Teaching: "Öğretim · ince", Experiment: "Deney · boncuk" };

function render() {
const side = state.layout === "side";
root.dataset.layout = state.layout;
root.innerHTML = `
  <article class="vc vc--wide">
    <div class="vc-head"><span class="label">Fikir</span><h2>Çubuklar artık <em>yazıyor</em></h2></div>
    <p class="vc-desc">Haklıydın: veriden gelen şekiller, projenin adı yanında yokken hiçbir şey söylemiyordu. Şimdi kural tek ve logo ile aynı: <b>her işaret iki harf.</b> Senin logon ${side ? "<b>m</b> solda <b>s</b> sağda" : "<b>m</b> üstte <b>s</b> altta"}; her proje de adının iki harfini aynı alfabeyle, aynı yerde yazıyor. Journalism Studio <b>js</b>, Network Canvas <b>nc</b>. Koleksiyon harfin dokusunda: dolu, ince ya da boncuk. Konular ve araçlar işarette değil, yazıda kalıyor.</p>
  </article>

  <article class="vc vc--wide">
    <div class="vc-head"><span class="label">1</span><h2>Alfabe</h2></div>
    <p class="vc-desc">${side
      ? "Yan yana dizmek için aynı harfler daraltıldı: üç iz genişliğinde, yedi iz yüksekliğinde. Her çubuk harfteki yerini koruyor; yalnızca oran değişiyor. Dar, uzun harfler; bir tabela ya da bir sütun yazısı gibi."
      : "Her harf yedi iz genişliğinde, üç iz yüksekliğinde. Basık, geniş harfler; ekran yazısı ile kilim motifi arasında bir yerde."} Çubuklar yalnızca dokuz noktanın arasında: sol, orta, sağ; üst, orta, alt. Altı çizili olanlar bir rakama benzeyebilir.</p>
    <div class="abc">${Object.keys(A).map((ch) => `<span class="abc-l${LOOKALIKE[ch] ? " look" : ""}" title="${LOOKALIKE[ch] ? `${ch} ≈ ${LOOKALIKE[ch]}` : ch}">${letter(ch)}<span>${ch}</span></span>`).join("")}</div>
  </article>

  <article class="vc vc--wide">
    <div class="vc-head"><span class="label">2</span><h2>Senin <em>monogramın</em></h2></div>
    <div class="vc-top hero2">
      <div class="vc-hero">${owner(true)}</div>
      <div class="vc-side">
        <span class="lockup vc-lock">${owner()}<span>Mert <em>Seven</em></span></span>
        <div class="vc-favs">${[48, 32, 16].map((s) => `<span class="fav-tile" style="width:${s}px;height:${s}px">${owner()}</span>`).join("")}<span class="vc-px">48 · 32 · 16 px</span></div>
        <p class="vc-desc">${side ? "Solda m, sağda s" : "Üstte m, altta s"}. Projelerle aynı ızgara, aynı çubuk, aynı boşluk; tek farkı senin harflerin olması.</p>
      </div>
    </div>
  </article>

  <article class="vc vc--wide">
    <div class="vc-head"><span class="label">3</span><h2>Bir kelimenin <em>harfleri</em></h2></div>
    <p class="vc-desc">Logo ve projeler yan yana: artık hepsi aynı yazıyla yazılmış, aynı ölçüde iki harf.</p>
    <div class="word">${owner()}${show.map((p) => `<span title="${tip(p)}">${markOf(p)}</span>`).join("")}</div>
  </article>

  <article class="vc vc--wide">
    <div class="vc-head"><span class="label">4</span><h2><em>Dönüşüm</em></h2></div>
    <p class="vc-desc">İki harf başka iki harfe dönüşüyor: aynı çubuklar kayıp uzuyor. Sitede künye açılınca header'daki ms, o projenin harflerine döner.</p>
    <div class="morph">
      <div class="morph-stage"><svg viewBox="0 0 24 24" aria-hidden="true">${gridDots()}<g class="mb"></g></svg></div>
      <p class="morph-cap" id="morph-cap"></p>
    </div>
  </article>

  <article class="vc vc--wide">
    <div class="vc-head"><span class="label">5</span><h2>Bütün <em>projeler</em></h2></div>
    <p class="vc-desc">Kod: ilk ve son kelimenin baş harfleri. Çakışırsa son kelimenin sonraki harfi alınıyor (Mind Shift, senin ms'inle çakıştığı için mh oldu). Tek kelimelik adlar ilk iki harfini alıyor.</p>
    ${byKind.map(([k, list]) => `
      <div class="kind"><span class="label">${KIND_TR[k]}</span>
        <div class="all">${list.map((p) => `<span class="all-i" title="${tip(p)}">${markOf(p)}<b>${CODE.get(p.id)}</b><span>${escapeHtml(p.title)}</span></span>`).join("")}</div>
      </div>`).join("")}
  </article>

  <article class="vc vc--wide">
    <div class="vc-head"><span class="label">6</span><h2><em>İmza</em></h2></div>
    <div class="sig-mocks">
      <div class="sig-page">
        <div class="sig-crumb">${owner()}<span>Mert <em>Seven</em></span><span class="sep">/</span>${markOf(js)}<span>Journalism Studio</span></div>
        <div class="sig-title">${markOf(js)}<h3>Journalism <em>Studio</em></h3></div>
        <p class="sig-meta">Journalism · Education · Mapping — Tailwind, Leaflet, JavaScript</p>
      </div>
      <div class="sig-foot">
        <span>Set in Geist &amp; Instrument Serif · Made by hand in İzmir · © 2026</span>
        <span class="sig-pair">${owner()}<span class="plus">×</span>${markOf(js)}</span>
      </div>
    </div>
  </article>`;
runMorph(root.querySelector(".morph-stage"), root.querySelector("#morph-cap"));
}
render();

for (const b of document.querySelectorAll("[data-layout]")) {
  b.addEventListener("click", () => {
    state.layout = b.dataset.layout;
    document.querySelectorAll("[data-layout]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
    render();
  });
}

for (const b of document.querySelectorAll("[data-theme-set]")) {
  b.addEventListener("click", () => {
    document.documentElement.dataset.theme = b.dataset.themeSet;
    document.querySelectorAll("[data-theme-set]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  });
}
for (const b of document.querySelectorAll("[data-caps]")) {
  b.addEventListener("click", () => {
    root.dataset.caps = b.dataset.caps;
    document.querySelectorAll("[data-caps]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  });
}
