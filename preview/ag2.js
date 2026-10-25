import { loadCatalog, escapeHtml } from "/assets/js/catalog.js";

// Network identity without the 7. Four starting points: the link, the map of the work
// itself, the branching of a question, and the weave of topics and tools.

const { projects } = await loadCatalog();
const SHOW = ["jstudio", "networkcanvas", "philosophical-networks", "critical-theory", "socrates", "ima-lab", "etkilesim-atlasi", "grad-projects", "icebreaker", "find-the-university", "visualizing-sep", "kafka"];

const hash = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0; return h; };
const rng = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const f = (n) => +n.toFixed(2);
const pt = ([x, y]) => `${f(x)},${f(y)}`;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const style = (p) => (p.kind === "Featured" ? "" : p.kind === "Teaching" ? "hollow" : "dashed");
const svg = (body) => `<svg viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;
const polar = ([x, y], deg, len) => [x + Math.cos((deg * Math.PI) / 180) * len, y + Math.sin((deg * Math.PI) / 180) * len];

const edge = (d, cls, i, w) => `<path class="e${cls === "dashed" ? " dashed" : ""}" pathLength="1" d="${d}" style="stroke-width:${w};animation-delay:${i * 110}ms"/>`;
const line = (a, b) => `M${pt(a)} L${pt(b)}`;
const node = ([x, y], cls, r) => cls === "hollow"
  ? `<circle class="n hollow" cx="${f(x)}" cy="${f(y)}" r="${r}" style="stroke-width:0.9"/>`
  : `<circle class="n" cx="${f(x)}" cy="${f(y)}" r="${cls === "dashed" ? f(r * 0.8) : r}"/>`;
const ghost = ([x, y], r = 0.8) => `<circle class="g" cx="${f(x)}" cy="${f(y)}" r="${r}"/>`;

// The catalogue's topics and tools, folded into eight families each.
const TOPICS = [
  ["Philosophy", ["Philosophy"]],
  ["Networks", ["Networks"]],
  ["Data", ["Data"]],
  ["Journalism", ["Journalism", "Storytelling"]],
  ["Place", ["Location", "Mobile", "Mapping", "AR"]],
  ["Interaction", ["Interaction", "Interface", "Design", "Play", "Exhibition", "3D"]],
  ["Systems", ["Real-time", "Collaboration", "Tools", "AI", "Computer vision"]],
  ["Education", ["Education"]],
];
const TOOLS = [
  ["Viz", ["D3", "Graphology", "jsnetworkx", "jStat"]],
  ["Script", ["JavaScript"]],
  ["Web", ["HTML", "CSS", "Tailwind"]],
  ["Geo", ["Leaflet", "Geolocation", "DeviceOrientation"]],
  ["Graphics", ["p5.js", "Canvas", "Three.js"]],
  ["Peer", ["PeerJS", "QRCode.js"]],
  ["Vision", ["MediaPipe"]],
  ["Python", ["Python"]],
];
const families = (list, fams) => [...new Set(list.map((x) => fams.findIndex(([, m]) => m.includes(x))).filter((i) => i >= 0))].sort((a, b) => a - b);
const topicsOf = (p) => families(p.topics, TOPICS);
const toolsOf = (p) => families(p.stack, TOOLS);

// ——— 1 · The link ———
// Two nodes and an edge: the smallest network there is. Filled is thinking, hollow is
// making. Every project starts from the same link and grows its own branches from it.
const A = [4.5, 18.5], B = [11.5, 11.5];
const link = {
  logo: () => svg(`<path class="e" pathLength="1" d="${line([4, 17], [20, 7])}" style="stroke-width:1.8"/><circle class="n" cx="4" cy="17" r="3.4"/><circle class="n hollow" cx="20" cy="7" r="3.1" style="stroke-width:1.7"/>`),
  mark(p, cls) {
    const r = rng(hash(p.id));
    const n = Math.max(1, topicsOf(p).length);
    const base = -95 + (r() - 0.5) * 70;
    const spread = 48 + r() * 30;
    const ends = Array.from({ length: n }, (_, k) => {
      const a = base + (k - (n - 1) / 2) * spread + (r() - 0.5) * 16;
      const e = polar(B, a, 6.5 + r() * 3);
      return [clamp(e[0], 2, 22), clamp(e[1], 2, 22)];
    });
    const w = cls === "" ? 1.6 : 1.1;
    return svg(`<path class="e" pathLength="1" d="${line(A, B)}" style="stroke-width:1.6"/>`
      + ends.map((e, k) => edge(line(B, e), cls, k + 1, w)).join("")
      + `<circle class="n" cx="${A[0]}" cy="${A[1]}" r="2.6"/><circle class="n hollow" cx="${B[0]}" cy="${B[1]}" r="2.2" style="stroke-width:1.3"/>`
      + ends.map((e) => node(e, cls, 1.5)).join(""));
  },
  lockup: (logo) => `<span class="lockup vc-lock lk-link"><span>Mert</span>${logo}<em>Seven</em></span>`,
};

// ——— 2 · The map of the work ———
// Eight topic families on a ring. A project is a node inside it, tied to its topics. The
// logo is every project at once: the whole body of work, redrawn whenever it grows.
const RING = (i) => polar([12, 12], -90 + i * 45, 9.6);
const placeOf = (p) => {
  const t = topicsOf(p), r = rng(hash(p.id));
  const c = t.reduce((s, i) => [s[0] + RING(i)[0] / t.length, s[1] + RING(i)[1] / t.length], [0, 0]);
  const pull = t.length === 1 ? 0.45 : 0.75;
  return [12 + (c[0] - 12) * pull + (r() - 0.5) * 3, 12 + (c[1] - 12) * pull + (r() - 0.5) * 3];
};
const map = {
  logo() {
    const count = Array(8).fill(0);
    let body = `<circle class="gl" cx="12" cy="12" r="9.6"/>`;
    for (const p of projects) {
      const at = placeOf(p);
      for (const i of topicsOf(p)) { count[i]++; body += `<path class="e faint" pathLength="1" d="${line(at, RING(i))}" style="stroke-width:0.55"/>`; }
    }
    body += projects.map((p) => `<circle class="n" cx="${f(placeOf(p)[0])}" cy="${f(placeOf(p)[1])}" r="0.75"/>`).join("");
    body += count.map((n, i) => `<circle class="n" cx="${f(RING(i)[0])}" cy="${f(RING(i)[1])}" r="${f(0.7 + Math.sqrt(n) * 0.32)}"/>`).join("");
    return svg(body);
  },
  mark(p, cls) {
    const t = topicsOf(p), at = placeOf(p), w = cls === "" ? 1.5 : 1;
    return svg(`<circle class="gl" cx="12" cy="12" r="9.6"/>`
      + t.map((i, k) => edge(line(at, RING(i)), cls, k, w)).join("")
      + Array.from({ length: 8 }, (_, i) => (t.includes(i) ? node(RING(i), cls, 1.5) : ghost(RING(i)))).join("")
      + node(at, cls, 2.1));
  },
};

// ——— 3 · Branching ———
// Curiosity as a tree: a question at the root, splitting into paths. The logo is the first
// split. A project's tree has one branch per topic family and leaves for its tools.
const ROOT = [12, 22];
const branch = {
  logo() {
    const fork = [12, 13];
    const L = polar(fork, -90 - 38, 9), R = polar(fork, -90 + 38, 9);
    return svg(`<path class="e" pathLength="1" d="${line(ROOT, fork)} ${line(fork, L)} M${pt(fork)} L${pt(R)}" style="stroke-width:1.9"/>`
      + `<circle class="n" cx="${ROOT[0]}" cy="${ROOT[1]}" r="1.6"/>${node(fork, "", 1.6)}${node(L, "", 2.7)}<circle class="n hollow" cx="${f(R[0])}" cy="${f(R[1])}" r="2.4" style="stroke-width:1.5"/>`);
  },
  mark(p, cls) {
    const r = rng(hash(p.id));
    const n = Math.max(1, topicsOf(p).length), leaves = Math.max(1, toolsOf(p).length);
    // A trunk that leans a little, branches leaving it at different heights, sides alternating.
    const top = [12 + (r() - 0.5) * 6, 3 + r() * 3];
    const at = (u) => [ROOT[0] + (top[0] - ROOT[0]) * u, ROOT[1] + (top[1] - ROOT[1]) * u];
    const w = cls === "" ? 1.5 : 1;
    let d = line(ROOT, top), k = 0, side = r() < 0.5 ? -1 : 1;
    const tips = [top];
    const heights = Array.from({ length: n }, () => 0.3 + r() * 0.55).sort();
    heights.forEach((u, i) => {
      const s = at(u), a = -90 + side * (35 + r() * 30), m = polar(s, a, 4.5 + r() * 3.5);
      side = -side;
      const clampP = (q) => [clamp(q[0], 2, 22), clamp(q[1], 2, 22)];
      // Spread the tools over the branches: some end in a fork, the others in a leaf.
      if (leaves - k > n - i) {
        d += ` ${line(s, clampP(m))}`;
        for (const t of [-28, 28]) { const tip = clampP(polar(m, a + t, 2.6 + r() * 1.4)); d += ` ${line(clampP(m), tip)}`; tips.push(tip); }
        k += 2;
      } else {
        d += ` ${line(s, clampP(m))}`;
        tips.push(clampP(m));
        k++;
      }
    });
    return svg(edge(d, cls, 0, w) + `<circle class="n" cx="${ROOT[0]}" cy="${ROOT[1]}" r="1.3"/>` + tips.map((t) => node(t, cls, 1.4)).join(""));
  },
};

// ——— 4 · Weave ———
// Topics run across, tools run down, and they cross over and under like threads in a
// kilim. The logo is every thread the work has used; a project is the threads it uses.
const SLOT = (i) => 3.2 + i * (17.6 / 7);
function weave(rows, cols, cls = "", w = 1.5) {
  const ink = (d, k) => `<path class="e${cls === "dashed" ? " dashed" : ""}" pathLength="1" d="${d}" style="stroke-width:${w};animation-delay:${k * 70}ms"/>`;
  const casing = (d) => `<path class="casing" d="${d}" style="stroke-width:${w + 1.6}"/>`;
  const lo = 1.5, hi = 22.5;
  let body = "", k = 0;
  for (const c of cols) body += ink(line([SLOT(c), lo], [SLOT(c), hi]), k++);
  for (const r of rows) { const d = line([lo, SLOT(r)], [hi, SLOT(r)]); body += casing(d) + ink(d, k++); }
  // Every other crossing, the down thread comes back on top.
  for (const r of rows) for (const c of cols) {
    if ((r + c) % 2) continue;
    const d = line([SLOT(c), SLOT(r) - w * 1.2], [SLOT(c), SLOT(r) + w * 1.2]);
    body += `<path class="casing" d="${d}" style="stroke-width:${w + 1.6};stroke-linecap:butt"/><path class="e" d="${d}" style="stroke-width:${w};stroke-linecap:butt"/>`;
  }
  return svg(body);
}
const loom = {
  logo() {
    const rows = [...new Set(projects.flatMap(topicsOf))].sort((a, b) => a - b);
    const cols = [...new Set(projects.flatMap(toolsOf))].sort((a, b) => a - b);
    return weave(rows, cols, "", 1.15);
  },
  mark: (p, cls) => weave(topicsOf(p), toolsOf(p), cls, cls === "" ? 1.6 : 1.1),
};

const VARIANTS = [
  {
    gen: link, name: "<em>Bağ</em>",
    desc: "Bir ağın en küçük hali: iki düğüm ve aralarındaki çizgi. Dolu düğüm düşünmek (akademisyen), boş düğüm yapmak (zanaatkâr); ikisini birbirine bağlayan sensin. Her proje bu bağla başlıyor ve boş düğümden, konu sayısı kadar dal veriyor. Wordmark'ta bağ adının iki yarısını birleştiriyor.",
    good: ["Fikri tek cümle: 'scholar & digital crafter' doğrudan çizim olmuş.", "Her proje işareti senin logonu içeriyor; aile bağı kelimenin tam anlamıyla.", "16 px'de bile iki nokta ve bir çizgi; en net favicon.", "Wordmark'a gömülebiliyor: Mert ●—○ Seven."],
    bad: ["Logo çok yalın; bir 'bağlantı' ya da 'paylaş' ikonuna yakın durabilir. Oran ve açı çok iyi ayarlanmalı.", "Proje işaretlerinde dallar rastgele yönleniyor; yalnızca sayıları veriden geliyor."],
  },
  {
    gen: map, name: "İşlerin <em>haritası</em>",
    desc: "Katalogdaki konular sekiz aileye toplanıp bir halkaya diziliyor (felsefe, ağlar, veri, gazetecilik, mekân, etkileşim, sistemler, eğitim). Her proje halkanın içinde bir nokta ve kendi konularına bağlanıyor. Logo, 28 projenin hepsi birden: işlerinin gerçek ağı. Yeni bir proje eklenince logo da biraz değişiyor.",
    good: ["Tamamen gerçek veri: işaretler uydurma değil, projenin ne hakkında olduğunu gösteriyor.", "Yaşayan logo: Media Lab'in 'tek sistem, sonsuz çıktı' fikrine en yakın olan.", "Aynı konudaki projeler kardeş gibi görünüyor; site gezilirken bu bir şey anlatıyor."],
    bad: ["Logo küçükte gri bir yumağa dönüşüyor; favicon için ayrı, sadeleştirilmiş bir hali gerek.", "Aynı konuları paylaşan projeler (ör. Philosophical Networks ve Critical Theory) neredeyse aynı işareti alıyor."],
  },
  {
    gen: branch, name: "<em>Dallanma</em>",
    desc: "Merak bir ağaç gibi: kökte bir soru, sonra yollar ayrılıyor. Logo ilk ayrılma anı: bir sorudan iki yol, biri dolu biri boş. Her projenin ağacında konu sayısı kadar dal, araç sayısı kadar yaprak var.",
    good: ["Ana sayfadaki 'what are you curious about?' sorusunun çizimi.", "Ağaçlar organik ve birbirinden çok farklı; işaretler ayırt edilir.", "Logo yalın ve güçlü; küçükte de okunuyor."],
    bad: ["Ağaç ve dal çağrışımı doğa ve soy ağacına kayabilir.", "Logo bir 'Y' harfine ya da bir çatala benzeyebilir.", "Ağ fikrinden çok hiyerarşi anlatıyor."],
  },
  {
    gen: loom, name: "<em>Örgü</em>",
    desc: "Bir kilim gibi: konular yatay, araçlar dikey iplikler; kesiştikleri yerde biri üstten biri alttan geçiyor. Logo, işlerinin kullandığı bütün ipliklerin dokusu. Her proje yalnızca kendi ipliklerini taşıyor: neyi hangi araçla yaptığını gösteren küçük bir dokuma.",
    good: ["Gerçek veri ve gerçek bir yerel referans: İzmir, Anadolu dokuması.", "Modüler ve tekrar etmeyen; Media Lab'in ızgara hissine yakın.", "Desenler birbirinden çok farklı ve aynı ailede."],
    bad: ["Logo küçükte bir ızgaraya ya da '#' işaretine benzeyebilir.", "Üst-alt geçiş detayı 16 px'de kayboluyor.", "Kilim çağrışımı fazla folklorik okunabilir; dozu iyi ayarlanmalı."],
  },
];

// ——— Page ———

const list = SHOW.map((id) => projects.find((p) => p.id === id)).filter(Boolean);
document.getElementById("about").innerHTML = "<b>7'yi bıraktım.</b> Dört yeni çıkış noktası; hepsi hâlâ birer ağ ama başka bir şeyden doğuyor: tanımının kendisinden (bağ), işlerinin gerçek verisinden (harita, örgü) ve sitenin sorusundan (dallanma). Kartın üzerine gelince işaretler kendini çiziyor. Dolu: Featured · İnce: öğretim · Kesik: deney.";

document.getElementById("ag").innerHTML = VARIANTS.map((v, n) => {
  const logo = () => v.gen.logo();
  const lock = v.gen.lockup ? v.gen.lockup(logo()) : `<span class="lockup vc-lock">${logo()}<span>Mert <em>Seven</em></span></span>`;
  return `
    <article class="vc">
      <div class="vc-head"><span class="label">${n + 1}</span><h2>${v.name}</h2></div>
      <p class="vc-desc">${v.desc}</p>
      <div class="vc-top">
        <div class="vc-hero">${logo()}</div>
        <div class="vc-side">
          ${lock}
          <div class="vc-favs">
            ${[48, 32, 16].map((s) => `<span class="fav-tile" style="width:${s}px;height:${s}px">${logo()}</span>`).join("")}
            <span class="vc-px">48 · 32 · 16 px</span>
          </div>
        </div>
      </div>
      <div class="vc-marks">
        ${list.map((p) => `<span class="vm" title="${escapeHtml(`${p.title} · ${p.topics.join(", ")} · ${p.stack.join(", ")}`)}">${v.gen.mark(p, style(p))}<span>${escapeHtml(p.title)}</span></span>`).join("")}
      </div>
      <div class="notes">
        <div><h3>Güçlü</h3><ul>${v.good.map((x) => `<li>${x}</li>`).join("")}</ul></div>
        <div><h3>Zayıf</h3><ul>${v.bad.map((x) => `<li>${x}</li>`).join("")}</ul></div>
      </div>
    </article>`;
}).join("");

for (const b of document.querySelectorAll("[data-theme-set]")) {
  b.addEventListener("click", () => {
    document.documentElement.dataset.theme = b.dataset.themeSet;
    document.querySelectorAll("[data-theme-set]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  });
}
