import { loadCatalog, escapeHtml } from "/assets/js/catalog.js";

// The folding rule. Four equal bars, hinged end to end, like a carpenter's folding ruler.
// Folded one way they make an M; the same M turned a quarter to the left is Σ, the Greek
// S: Mert and Seven in one shape. Every project is the same ruler folded differently: the
// first leg always stands up as the M's does, and each hinge turns in steps of 30°.

const { projects } = await loadCatalog();
const SHOW = ["jstudio", "networkcanvas", "philosophical-networks", "critical-theory", "socrates", "ima-lab", "etkilesim-atlasi", "grad-projects", "icebreaker", "find-the-university", "visualizing-sep", "kafka"];

const SEG = 13;   // bar length in units of the 24-unit square, the same for every mark
const WT = 3.2;   // bar weight
const f = (n) => +n.toFixed(2);
const hash = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0; return h; };
const kindState = (p) => (p.kind === "Featured" ? "" : p.kind === "Teaching" ? "thin" : "dots");

// Directions in screen degrees (y points down, so up is −90).
const M = [-90, 60, -60, 90];
const rad = (a) => (a * Math.PI) / 180;
const points = (dirs) => dirs.reduce((pts, a) => { const [x, y] = pts.at(-1); return [...pts, [x + Math.cos(rad(a)), y + Math.sin(rad(a))]]; }, [[0, 0]]);
const bounds = (pts) => { const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]); return [Math.min(...xs), Math.min(...ys), Math.max(...xs), Math.max(...ys)]; };

// ——— The folds a project may take ———

// Segments a–b and c–d lying on one line and overlapping would hide a bar.
const overlaps = (pts) => {
  for (let i = 0; i < 4; i++) for (let j = i + 2; j < 4; j++) {
    const [a, b] = [pts[i], pts[i + 1]], [c, d] = [pts[j], pts[j + 1]];
    const cross = (p, q, r) => (q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]);
    if (Math.abs(cross(a, b, c)) < 1e-6 && Math.abs(cross(a, b, d)) < 1e-6) {
      const t = (p) => ((p[0] - a[0]) * (b[0] - a[0]) + (p[1] - a[1]) * (b[1] - a[1]));
      const lo = Math.min(t(c), t(d)), hi = Math.max(t(c), t(d));
      if (hi > 1e-6 && lo < 1 - 1e-6) return true;
    }
  }
  return false;
};
// A ruler does not pass through itself: two bars that are not neighbours never cross.
const crosses = (pts) => {
  const side = (p, q, r) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]));
  for (let i = 0; i < 4; i++) for (let j = i + 2; j < 4; j++) {
    const [a, b, c, d] = [pts[i], pts[i + 1], pts[j], pts[j + 1]];
    if (side(a, b, c) * side(a, b, d) < 0 && side(c, d, a) * side(c, d, b) < 0) return true;
  }
  return false;
};
const TURNS = [-150, -120, -90, -60, -30, 30, 60, 90, 120, 150];
const FOLDS = [];
for (const a of TURNS) for (const b of TURNS) for (const c of TURNS) {
  const dirs = [-90, -90 + a, -90 + a + b, -90 + a + b + c];
  const pts = points(dirs), [x0, y0, x1, y1] = bounds(pts);
  // About as compact as the M: no fold sprawls past 1.45 bars either way, so every fold
  // fits the same square at the same bar length.
  if (x1 - x0 > 1.45 || y1 - y0 > 1.45 || x1 - x0 < 0.5 || y1 - y0 < 0.5) continue;
  if (overlaps(pts) || crosses(pts)) continue;
  // The M is the owner's alone: a fold that keeps two of its three hinges reads as an M.
  if ([a, b, c].filter((t, i) => t === [150, -120, 150][i]).length >= 2) continue;
  // Nor any other zigzag that folds back hard at both ends the way the M does.
  // (Its mirror too: the same M drawn from the other leg.)
  if (Math.abs(a) >= 120 && Math.abs(c) >= 120 && Math.sign(a) === Math.sign(c) && Math.sign(b) !== Math.sign(a)) continue;
  FOLDS.push(dirs);
}
// Each project takes its own fold, chosen by its id and never shared.
const FOLD = (() => {
  const used = new Set(), out = new Map();
  for (const p of projects) {
    const order = FOLDS.map((d, i) => [hash(`${p.id}:${i}`), d]).sort((x, y) => x[0] - y[0]);
    const pick = order.find(([, d]) => !used.has(String(d)))[1];
    used.add(String(pick));
    out.set(p.id, pick);
  }
  return out;
})();

// ——— Drawing ———

// Centred on the square by its own bounds. "line" draws one continuous stroke; "ruler"
// draws four separate bars with a hinge pin at each joint.
function geometry(dirs) {
  const pts = points(dirs), [x0, y0, x1, y1] = bounds(pts);
  const cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
  return pts.map(([x, y]) => [12 + (x - cx) * SEG, 12 + (y - cy) * SEG]);
}
function draw(dirs, st = "", look = state.look) {
  const P = geometry(dirs);
  const stroke = (d, w, cls = "fr") => `<path class="${cls}" d="${d}" style="stroke-width:${w}"/>`;
  let body = "";
  if (look === "line") {
    const d = P.map((p, i) => `${i ? "L" : "M"}${f(p[0])},${f(p[1])}`).join(" ");
    body = st === "dots" ? `<path class="fr dots" d="${d}" style="stroke-width:${WT}"/>`
      : stroke(d, WT) + (st === "thin" ? stroke(d, WT - 1.6, "fr-in") : "");
  } else {
    const gap = 1.1;
    for (let i = 0; i < 4; i++) {
      const [a, b] = [P[i], P[i + 1]], len = Math.hypot(b[0] - a[0], b[1] - a[1]);
      const ux = (b[0] - a[0]) / len, uy = (b[1] - a[1]) / len;
      const s = i ? gap : 0, e = i < 3 ? gap : 0;
      const d = `M${f(a[0] + ux * s)},${f(a[1] + uy * s)} L${f(b[0] - ux * e)},${f(b[1] - uy * e)}`;
      body += st === "dots" ? `<path class="fr dots sq" d="${d}" style="stroke-width:${WT}"/>`
        : `<path class="fr sq" d="${d}" style="stroke-width:${WT}"/>` + (st === "thin" ? `<path class="fr-in sq" d="${d}" style="stroke-width:${WT - 1.6}"/>` : "");
    }
    body += P.slice(1, 4).map(([x, y]) => `<circle class="pin" cx="${f(x)}" cy="${f(y)}" r="0.9"/>`).join("");
  }
  return `<svg viewBox="0 0 24 24" aria-hidden="true"><g class="m">${body}</g></svg>`;
}

// ——— Morph: the ruler folds from the M into a project and back ———

const short = (a, b) => { let d = (((b - a) % 360) + 540) % 360 - 180; return d; };
const ease = (t) => t * t * (3 - 2 * t);
let run = 0;
function folding(stage, cap) {
  const me = ++run, list = SHOW.map((id) => projects.find((p) => p.id === id)).filter(Boolean);
  let from = M, step = 0;
  stage.innerHTML = draw(M);
  cap.innerHTML = "<b>M</b> <span>Mert Seven</span>";
  const next = () => {
    if (me !== run) return;
    const toM = step % 2 === 1, p = list[Math.floor(step / 2) % list.length];
    const to = toM ? M : FOLD.get(p.id);
    const deltas = from.map((a, i) => short(a, to[i])), t0 = performance.now(), start = from;
    cap.innerHTML = toM ? "<b>M</b> <span>Mert Seven</span>" : `<b>${escapeHtml(p.title)}</b> <span>${escapeHtml(p.kind)}</span>`;
    const frame = (now) => {
      if (me !== run) return;
      const t = ease(Math.min(1, (now - t0) / 1100));
      stage.innerHTML = draw(start.map((a, i) => a + deltas[i] * t));
      if (t < 1) requestAnimationFrame(frame);
      else { from = to; step++; setTimeout(next, toM ? 900 : 1500); }
    };
    requestAnimationFrame(frame);
  };
  setTimeout(next, 1200);
}

// ——— Page ———

const state = { look: "line" };
const root = document.getElementById("ag");
const show = SHOW.map((id) => projects.find((p) => p.id === id)).filter(Boolean);
const ORDER = [["Featured", "Featured · dolu"], ["Teaching", "Öğretim · kontur"], ["Experiment", "Deney · boncuk"]];

function render() {
  root.dataset.look = state.look;
  const logo = draw(M, "");
  root.innerHTML = `
    <article class="vc vc--wide">
      <div class="vc-head"><span class="label">Fikir</span><h2>Katlanır <em>metre</em></h2></div>
      <p class="vc-desc">Eşit dört çubuk, uç uca menteşeli: bir marangozun katlanır metresi, yani bir zanaatkârın aleti. Bir biçimde katlanınca <b>M</b> oluyor. Aynı M sola çeyrek dönünce <b>Σ</b>: Yunan alfabesinde S. Mert ve Seven tek şekilde, yalnızca bakış açısı değişiyor. Önce bir işaret görülüyor, sonra harf. Projeler aynı metre, başka katlanmış: ilk bacak hep M'deki gibi dik duruyor, menteşeler 30°'lik adımlarla dönüyor. Yeni çubuk yok, kısa ya da uzun çubuk yok.</p>
    </article>

    <article class="vc vc--wide">
      <div class="vc-head"><span class="label">1</span><h2>Logo: M ve <em>Σ</em></h2></div>
      <div class="vc-top hero2">
        <div class="vc-hero flip" title="Üzerine gel: Σ">${logo}</div>
        <div class="vc-side">
          <span class="lockup vc-lock flip">${logo}<span>Mert <em>Seven</em></span></span>
          <div class="vc-favs">${[48, 32, 16].map((s) => `<span class="fav-tile" style="width:${s}px;height:${s}px">${logo}</span>`).join("")}<span class="vc-px">48 · 32 · 16 px</span></div>
          <div class="ms-pair"><span>${draw(M)}<b>M</b><i>Mert</i></span><span class="sigma">${draw(M)}<b>Σ</b><i>Seven</i></span></div>
          <p class="vc-desc">Büyük logonun ya da wordmark'ın üzerine gel: M sola dönüp Σ oluyor. Sitede header'daki logo böyle davranır.</p>
        </div>
      </div>
    </article>

    <article class="vc vc--wide">
      <div class="vc-head"><span class="label">2</span><h2>Aynı metre, başka <em>katlanmış</em></h2></div>
      <p class="vc-desc">Her proje kendi katlanışını alıyor; iki proje aynı katlanışı paylaşmıyor. Kural ${FOLDS.length} farklı katlanış veriyor, 28 proje rahat sığıyor. Bazıları kendiliğinden bir harfe benziyor (N, Z, W, L…), bazıları bir figüre; hepsi M'nin kardeşi.</p>
      <div class="word">${logo}${show.map((p) => `<span title="${escapeHtml(p.title)}">${draw(FOLD.get(p.id), kindState(p))}</span>`).join("")}</div>
    </article>

    <article class="vc vc--wide">
      <div class="vc-head"><span class="label">3</span><h2><em>Katlanırken</em></h2></div>
      <p class="vc-desc">M açılıp bir projenin biçimine katlanıyor, sonra geri dönüyor. Çubuklar kopmuyor; yalnızca menteşeler dönüyor. Künye açılınca header'daki M o projeye katlanır.</p>
      <div class="morph">
        <div class="morph-stage" id="fold"></div>
        <p class="morph-cap" id="fold-cap"></p>
      </div>
    </article>

    <article class="vc vc--wide">
      <div class="vc-head"><span class="label">4</span><h2>Bütün <em>projeler</em></h2></div>
      ${ORDER.map(([k, label]) => `
        <div class="kind"><span class="label">${label}</span>
          <div class="all">${projects.filter((p) => p.kind === k).map((p) => `<span class="all-i">${draw(FOLD.get(p.id), kindState(p))}<span>${escapeHtml(p.title)}</span></span>`).join("")}</div>
        </div>`).join("")}
    </article>`;
  folding(root.querySelector("#fold"), root.querySelector("#fold-cap"));
}
render();

const bind = (attr, key, after) => {
  for (const b of document.querySelectorAll(`[${attr}]`)) {
    b.addEventListener("click", () => {
      document.querySelectorAll(`[${attr}]`).forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      after(b.getAttribute(attr));
    });
  }
};
bind("data-look", "look", (v) => { state.look = v; render(); });
bind("data-theme-set", "theme", (v) => { document.documentElement.dataset.theme = v; });
