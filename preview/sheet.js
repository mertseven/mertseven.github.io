import { loadCatalog, escapeHtml } from "/assets/js/catalog.js";
import { A, LOOKALIKE, cut, SIZE, wordsOf } from "/preview/bar-alphabet.js";

// The code sheet: every project written side by side in the bar alphabet, in two cuts
// (wide, as drawn; narrow, condensed) and two lengths (two letters, three letters), plus
// the mixed rule that picks two or three by the length of the name.

const { projects } = await loadCatalog();
const SHOW = ["jstudio", "networkcanvas", "philosophical-networks", "critical-theory", "socrates", "ima-lab", "etkilesim-atlasi", "grad-projects", "icebreaker", "find-the-university", "visualizing-sep", "kafka"];
const OWNER = "ms";

const C = (i) => 3 + i * 3;
const f = (n) => +n.toFixed(2);
const PX = 6; // pixels per track on the sheet, the same for every cut

// ——— Codes ———

// Candidates in order of preference; the first one free (and not the owner's) wins.
const cands2 = (w) => (w.length > 1
  ? [w[0][0] + w.at(-1)[0], ...[...w.at(-1).slice(1)].map((c) => w[0][0] + c), ...[...w[0].slice(1)].map((c) => w[0][0] + c)]
  : [...w[0].slice(1)].map((c) => w[0][0] + c));
const cands3 = (w) => {
  if (w.length >= 3) return [w[0][0] + w[1][0] + w[2][0], ...[...w[2].slice(1)].map((c) => w[0][0] + w[1][0] + c), w[0][0] + w[1][0] + w.at(-1)[0]];
  if (w.length === 2) return [...w[1].slice(1)].map((c) => w[0][0] + w[1][0] + c);
  return [...w[0].slice(2)].map((c) => w[0].slice(0, 2) + c);
};
function assign(pick) {
  const used = new Set([OWNER]), out = new Map();
  for (const p of projects) {
    const list = pick(wordsOf(p.title)).filter((c) => [...c].every((ch) => A[ch]));
    const code = list.find((c) => !used.has(c)) ?? list[0];
    used.add(code);
    out.set(p.id, code);
  }
  return out;
}
const TWO = assign(cands2);
const THREE = assign(cands3);
// Mixed: names of three words or more take three letters, shorter names two.
const MIXED = assign((w) => (w.length >= 3 ? [...cands3(w), ...cands2(w)] : [...cands2(w), ...cands3(w)]));

// ——— Drawing ———

const kindState = (p) => (p.kind === "Featured" ? "" : p.kind === "Teaching" ? "thin" : "dots");
const d = ([x1, y1, x2, y2]) => `M${f(C(x1))},${f(C(y1))} L${f(C(x2))},${f(C(y2))}`;
const bar = (b, st) => `<path class="hb${st ? ` ${st}` : ""}" d="${d(b)}"/>`;

// A code written left to right, one empty track between letters.
function word(code, width, st = "", px = PX) {
  const [lw, lh] = SIZE[width];
  const bars = [...code].flatMap((ch, i) => cut(ch, width).map(([x1, y1, x2, y2]) => [x1 + i * (lw + 1), y1, x2 + i * (lw + 1), y2]));
  const cols = code.length * lw + code.length - 1;
  return `<svg viewBox="1.5 1.5 ${cols * 3} ${lh * 3}" width="${cols * px}" height="${lh * px}" aria-hidden="true">${bars.map((b) => bar(b, st)).join("")}</svg>`;
}
// The same, centred in a square tile, for favicons.
function tile(code, width, size) {
  const [lw, lh] = SIZE[width];
  const cols = code.length * lw + code.length - 1, s = Math.max(cols, lh) + 2;
  const bars = [...code].flatMap((ch, i) => cut(ch, width).map(([x1, y1, x2, y2]) => [x1 + i * (lw + 1), y1, x2 + i * (lw + 1), y2]));
  const vx = 1.5 + (cols * 3) / 2 - (s * 3) / 2, vy = 1.5 + (lh * 3) / 2 - (s * 3) / 2;
  return `<span class="fav-tile" style="width:${size}px;height:${size}px"><svg viewBox="${f(vx)} ${f(vy)} ${s * 3} ${s * 3}" aria-hidden="true" style="width:100%;height:100%">${bars.map((b) => bar(b, "")).join("")}</svg></span>`;
}

// ——— Page ———

const root = document.getElementById("ag");
const show = SHOW.map((id) => projects.find((p) => p.id === id)).filter(Boolean);
const ORDER = [["Featured", "Featured · dolu"], ["Teaching", "Öğretim · ince"], ["Experiment", "Deney · boncuk"]];
const cell = (code, width, st) => `<td><span class="sc">${word(code, width, st)}<code>${code}</code></span></td>`;

root.innerHTML = `
  <article class="vc vc--wide">
    <div class="vc-head"><span class="label">Sheet</span><h2>İki kesim, iki <em>uzunluk</em></h2></div>
    <p class="vc-desc">Harfler artık yan yana ve daraltılmadan da yazılabiliyor. <b>Geniş</b> kesim harfin kendi çizimi (yedi iz eni, üç iz boyu); <b>dar</b> kesim aynı çubukların sıkıştırılmış hali (üç iz eni, yedi iz boyu). Her ikisi de iki ya da üç harf yazabiliyor; harfler arasında hep bir iz boşluk. Bütün işaretler aynı ölçekte: bir iz her yerde aynı boyda.</p>
    <p class="vc-desc"><b>Kodlar.</b> İki harf: ilk ve son kelimenin baş harfi. Üç harf: ilk üç kelimenin baş harfleri; iki kelimelik adlarda ikinci kelimenin ilk iki harfi, tek kelimelik adlarda ilk üç harf. Çakışırsa son harf bir sonrakine kayar. <b>ms</b> yalnızca senin.</p>
  </article>

  <article class="vc vc--wide">
    <div class="vc-head"><span class="label">1</span><h2>Alfabe, iki <em>kesim</em></h2></div>
    <p class="vc-desc">k ve x yeniden çizildi: k bir gövde, ortadan sağ üste çıkan bir kol ve sağdan inen bir bacak; x iki gövde ve aralarında bir nokta (çapraz yok, fırıldak da başka bir şeye benziyordu). Altı çizili olanlar bir rakama benzeyebilir.</p>
    ${["wide", "narrow"].map((w) => `
      <div class="abc2"><span class="label">${w === "wide" ? "Geniş" : "Dar"}</span>
        <div class="abc2-row">${Object.keys(A).map((ch) => `<span class="abc2-l${LOOKALIKE[ch] ? " look" : ""}">${word(ch, w, "", w === "wide" ? 5 : 6)}<span>${ch}</span></span>`).join("")}</div>
      </div>`).join("")}
  </article>

  <article class="vc vc--wide">
    <div class="vc-head"><span class="label">2</span><h2>Logo</h2></div>
    <div class="logo2">
      ${["wide", "narrow"].map((w) => `
        <div class="logo2-c"><span class="label">${w === "wide" ? "Geniş" : "Dar"}</span>
          <div class="logo2-big">${word(OWNER, w, "", w === "wide" ? 14 : 18)}</div>
          <span class="lockup vc-lock">${word(OWNER, w, "", w === "wide" ? 3.2 : 4.4)}<span>Mert <em>Seven</em></span></span>
          <div class="vc-favs">${[48, 32, 16].map((s) => tile(OWNER, w, s)).join("")}<span class="vc-px">48 · 32 · 16 px</span></div>
        </div>`).join("")}
    </div>
    <p class="vc-desc">Geniş ms bir şerit: header'da ve footer'da çok rahat, ama kare bir favicon'da küçülüyor. Dar ms kareyi dolduruyor.</p>
  </article>

  <article class="vc vc--wide">
    <div class="vc-head"><span class="label">3</span><h2>Karma <em>kural</em></h2></div>
    <p class="vc-desc">İki ve üç harf birlikte: üç ya da daha çok kelimelik adlar üç harf, kısalar iki harf alıyor. Satırda uzunluklar karışıyor; bir sayfa yazısındaki kelimeler gibi.</p>
    ${["wide", "narrow"].map((w) => `
      <div class="line"><span class="line-k">${w === "wide" ? "Geniş" : "Dar"}</span>
        <span class="line-row words">${word(OWNER, w)}${show.map((p) => `<span title="${escapeHtml(p.title)} · ${MIXED.get(p.id)}">${word(MIXED.get(p.id), w, kindState(p))}</span>`).join("")}</span>
      </div>`).join("")}
  </article>

  <article class="vc vc--wide">
    <div class="vc-head"><span class="label">4</span><h2>Bütün <em>projeler</em></h2></div>
    <div class="cs-wrap">
      <table class="cs-table">
        <thead><tr><th>Proje</th><th>Geniş · 2</th><th>Geniş · 3</th><th>Dar · 2</th><th>Dar · 3</th><th>Karma</th></tr></thead>
        <tbody>
          <tr class="own"><td><b>Mert Seven</b><span>logo</span></td>${cell(OWNER, "wide", "")}<td class="na">—</td>${cell(OWNER, "narrow", "")}<td class="na">—</td><td class="na">ms</td></tr>
        </tbody>
        ${ORDER.map(([k, label]) => `
          <tbody>
            <tr class="grp"><th colspan="6">${label}</th></tr>
            ${projects.filter((p) => p.kind === k).map((p) => `<tr><td><b>${escapeHtml(p.title)}</b></td>${cell(TWO.get(p.id), "wide", kindState(p))}${cell(THREE.get(p.id), "wide", kindState(p))}${cell(TWO.get(p.id), "narrow", kindState(p))}${cell(THREE.get(p.id), "narrow", kindState(p))}<td><code>${MIXED.get(p.id)}</code></td></tr>`).join("")}
          </tbody>`).join("")}
      </table>
    </div>
    <p class="vc-desc">Logo üç harfli sütunlarda boş: iki harf yalnızca senin olursa ms her yerde ayrışır. İstersen projelerin hepsi üç harfe geçer, ms iki harf kalır.</p>
  </article>`;

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
