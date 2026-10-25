import { loadCatalog, escapeHtml } from "/assets/js/catalog.js";

// The bar system. One grid, one bar, three states; the owner's logo and every project
// mark are drawn with nothing else.
//
// Grid: 8 × 8 tracks on a 24-unit canvas. Rows are topic families, columns tool families.
// Bar: runs from one track centre to another, horizontal or vertical only, 62% of the
// track pitch thick. Ends are square (or round, as a variant).
// States: filled (Featured), outline (Teaching), modules (Experiment).

const { projects } = await loadCatalog();
const SHOW = ["jstudio", "networkcanvas", "philosophical-networks", "critical-theory", "socrates", "ima-lab", "etkilesim-atlasi", "grad-projects", "icebreaker", "find-the-university", "visualizing-sep", "kafka"];
const FAMILY = ["jstudio", "networkcanvas", "socrates", "etkilesim-atlasi", "icebreaker"];

const PITCH = 21 / 8;
const T = +(PITCH * 0.62).toFixed(2);
const C = (i) => 1.5 + PITCH / 2 + i * PITCH;
const f = (n) => +n.toFixed(2);
const svg = (body, cls = "") => `<svg viewBox="0 0 24 24" aria-hidden="true"${cls ? ` class="${cls}"` : ""}>${body}</svg>`;
const kindState = (p) => (p.kind === "Featured" ? "" : p.kind === "Teaching" ? "hollow" : "dots");

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

// One bar, in track coordinates. An outline bar is the ink bar with a paper bar inside it;
// a module bar is the same bar broken into squares one bar wide.
function bar([x1, y1, x2, y2], state = "", k = 0, dx = 0, dy = 0) {
  const d = `M${f(C(x1) + dx)},${f(C(y1) + dy)} L${f(C(x2) + dx)},${f(C(y2) + dy)}`;
  const delay = `animation-delay:${k * 80}ms`;
  if (state === "dots") return `<path class="b dots" d="${d}" style="stroke-width:${T};stroke-dasharray:0.01 ${f(T * 1.7)}"/>`;
  const ink = `<path class="b" pathLength="1" d="${d}" style="stroke-width:${T};${delay}"/>`;
  return state === "hollow" ? `${ink}<path class="b-in" pathLength="1" d="${d}" style="stroke-width:${f(T - 0.8)};${delay}"/>` : ink;
}
// The grid itself: a faint point at every track crossing.
const gridDots = () => Array.from({ length: 64 }, (_, i) => `<circle class="g" cx="${f(C(i % 8))}" cy="${f(C(Math.floor(i / 8)))}" r="0.28"/>`).join("");
// A glyph: a list of bars, optionally shifted by half a track to sit centred.
const glyph = (bars, { shift = [0, 0], grid = false, state = "" } = {}) =>
  svg((grid ? gridDots() : "") + bars.map((b, k) => bar(b, state, k, shift[0] * PITCH, shift[1] * PITCH)).join(""));

// Verticals first (tools), then horizontals (topics), the order they are drawn in.
const projectBars = (p) => [...toolsOf(p).map((c) => [c, 0, c, 7]), ...topicsOf(p).map((r) => [0, r, 7, r])];
const projectMark = (p, grid = false) => glyph(projectBars(p), { grid, state: kindState(p) });

const LOGOS = [
  {
    name: "<em>Ligatür</em>",
    desc: "m ile s aynı çubuğu paylaşıyor: m'nin üst çubuğu s'nin üstüne devam ediyor, s'nin alt çubuğu m'nin son bacağına bağlanıyor. İki harf, tek parça.",
    bars: [[0, 2, 7, 2], [0, 2, 0, 6], [2, 2, 2, 6], [4, 2, 4, 6], [5, 2, 5, 4], [5, 4, 7, 4], [7, 4, 7, 6], [4, 6, 7, 6]],
    shift: [0, -0.5],
    good: ["Tek bir işaret gibi duruyor, iki harf yan yana değil.", "Bağlantı fikri harfin içinde: m ve s birbirine bağlı.", "Çubuk sayısı az, hepsi ızgarada."],
    bad: ["Okumak bir an sürebilir; önce desen, sonra harf.", "s'nin kapanışı m'ye bağlandığı için '5' çağrışımı azalıyor ama 'ms' de biraz gizleniyor."],
  },
  {
    name: "Kare <em>monogram</em>",
    desc: "Media Lab'in kare glifleri gibi: m üstte, s altta, ikisi birlikte tam bir kare dolduruyor. Proje işaretleriyle aynı ölçüde; yanlarına konunca aynı aileden olduğu hemen görülüyor.",
    bars: [[0, 0, 6, 0], [0, 0, 0, 2], [3, 0, 3, 2], [6, 0, 6, 2], [0, 3, 6, 3], [0, 3, 0, 5], [0, 5, 6, 5], [6, 5, 6, 7], [0, 7, 6, 7]],
    shift: [0.5, 0],
    good: ["Kare ve yoğun: favicon ve profil fotoğrafı için ideal.", "Proje işaretleriyle aynı kareyi dolduruyor; sistemin en tutarlı hali.", "Media Lab mantığına en yakın olan."],
    bad: ["m basık kalıyor; ilk bakışta harften çok bir desen.", "Dokuz çubuk; 16 px'de sıkışık."],
  },
  {
    name: "Tek <em>m</em>",
    desc: "Yalnızca baş harf, tam karede: üstte bir çubuk, altında eşit aralıklı üç bacak. Sistemin en yalın harfi.",
    bars: [[0, 1, 6, 1], [0, 1, 0, 7], [3, 1, 3, 7], [6, 1, 6, 7]],
    shift: [0.5, -0.5],
    good: ["Dört çubuk; her boyutta net.", "Bir proje işareti kadar sade, ama harf olduğu için ayırt ediliyor."],
    bad: ["π ya da bir masa gibi okunabilir.", "'Seven' logoda yok; wordmark'a kalıyor."],
  },
  {
    name: "Üç ve <em>üç</em>",
    desc: "Harfi çizmeden harfi söylemek: m'nin üç bacağı üç dikey çubuk (araçlar gibi), s'nin üç çizgisi üç yatay çubuk (konular gibi). Proje işaretlerinin dili, ama bu kez ayrık duruyor.",
    bars: [[0, 1, 0, 7], [2, 1, 2, 7], [4, 1, 4, 7], [5, 1, 7, 1], [5, 4, 7, 4], [5, 7, 7, 7]],
    shift: [0, -0.5],
    good: ["En özgün olanı: bir harf değil, bir kural.", "Proje işaretleriyle doğrudan akraba: dikey araç, yatay konu.", "Çok sakin ve 'premium' bir duruş."],
    bad: ["'ms' olduğu anlatılmadan anlaşılmıyor.", "Yan yana çubuklar küçükte bir barkoda dönüşebilir."],
  },
  {
    name: "<em>ms</em>, yeniden",
    desc: "Önceki 'ms', ama kurallara göre yeniden çizilmiş: aynı ızgara, aynı kalınlık, köşeli uçlar. Karşılaştırma için.",
    bars: [[0, 2, 4, 2], [0, 2, 0, 6], [2, 2, 2, 6], [4, 2, 4, 6], [5, 2, 7, 2], [5, 2, 5, 4], [5, 4, 7, 4], [7, 4, 7, 6], [5, 6, 7, 6]],
    shift: [0, -0.5],
    good: ["Doğrudan okunuyor."],
    bad: ["İki ayrı harf yan yana; bir işaretten çok bir kısaltma.", "s yine '5'e yakın."],
  },
];

const RULES = [
  {
    title: "İzgara",
    text: "8 × 8 iz. Satırlar konu aileleri, sütunlar araç aileleri. Logo da projeler de yalnızca bu izlerin üzerinde çizilir.",
    art: () => glyph([[0, 3, 7, 3], [5, 0, 5, 7]], { grid: true }),
  },
  {
    title: "Çubuk",
    text: `Bir iz merkezinden başlar, bir iz merkezinde biter. Yalnızca yatay ya da dikey. Kalınlık iz aralığının %62'si; aradaki boşluk hep aynı.`,
    art: () => glyph([[1, 2, 6, 2], [1, 4, 4, 4], [1, 6, 2, 6]], { grid: true }),
  },
  {
    title: "Üç hal",
    text: "Aynı çubuk üç halde: dolu (Featured), kontur (öğretim), modül (deney). Koleksiyon renk ya da şekille değil, çubuğun dokusuyla söylenir.",
    art: () => svg(bar([1, 1, 6, 1]) + bar([1, 3.5, 6, 3.5], "hollow") + bar([1, 6, 6, 6], "dots")),
  },
  {
    title: "Kesişim",
    text: "Çubuklar birbirinin üstünden düz geçer: boşluk, gölge, açı yok. Önce dikeyler (araçlar), sonra yataylar (konular).",
    art: () => glyph([[2, 0, 2, 7], [5, 0, 5, 7], [0, 4, 7, 4]]),
  },
  {
    title: "Harf",
    text: "Logo için ayrı kural yok: harfler de aynı izlerde, aynı çubuklarla yazılır. Gerekirse bütün glif yarım iz kaydırılarak ortalanır.",
    art: () => glyph(LOGOS[0].bars, { grid: true, shift: LOGOS[0].shift }),
  },
  {
    title: "Yazı",
    text: "Çubuklar katı, yazı akışkan: Geist Light gövde, vurgu için Instrument Serif italik, etiketler Geist Mono büyük harf.",
    art: () => `<span class="rule-type">Mert <em>Seven</em><span class="label">New media</span></span>`,
  },
  {
    title: "Renk",
    text: "Tek renk: mürekkep ve kâğıt. Koyu temada yer değiştirir. İşaretler hiçbir zaman renklendirilmez; fark dokudadır.",
    art: () => `<span class="rule-sw"><span style="background:var(--ink)"></span><span style="background:var(--paper)"></span></span>`,
  },
  {
    title: "Hareket",
    text: "Çubuklar boyları boyunca çizilerek gelir, 80 ms arayla, çizildikleri sırayla. Üzerine gel.",
    art: () => projectMark(projects.find((p) => p.id === "etkilesim-atlasi")),
  },
];

// ——— Page ———

const root = document.getElementById("ag");
const marks = SHOW.map((id) => projects.find((p) => p.id === id)).filter(Boolean);
const family = FAMILY.map((id) => projects.find((p) => p.id === id)).filter(Boolean);
const tip = (p) => escapeHtml(`${p.title} · ${p.topics.join(", ")} · ${p.stack.join(", ")}`);

document.getElementById("about").innerHTML = "<b>Tek ızgara, tek çubuk, üç hal.</b> Ana logo da proje işaretleri de yalnızca bu kurallarla çiziliyor. Üstteki düğmeyle çubuk uçlarını köşeli ya da yuvarlak görebilirsin. Logo kartlarında ızgara noktaları görünür; her şeyin aynı izlere oturduğunu gösteriyor.";

root.innerHTML = `
  <article class="vc vc--wide">
    <div class="vc-head"><span class="label">Sistem</span><h2>Kurallar</h2></div>
    <div class="rules">${RULES.map((r) => `<div class="rule"><div class="rule-art">${r.art()}</div><h3>${r.title}</h3><p>${r.text}</p></div>`).join("")}</div>
  </article>
  <article class="vc vc--wide">
    <div class="vc-head"><span class="label">Proje kimlikleri</span><h2>Aynı kurallarla</h2></div>
    <p class="vc-desc">Her konu ailesi bir yatay, her araç ailesi bir dikey çubuk. Dolu: Featured · Kontur: öğretim · Modül: deney.</p>
    <div class="vc-marks">${marks.map((p) => `<span class="vm" title="${tip(p)}">${projectMark(p)}<span>${escapeHtml(p.title)}</span></span>`).join("")}</div>
  </article>
  ${LOGOS.map((v, n) => {
    const logo = glyph(v.bars, { shift: v.shift });
    return `
    <article class="vc${n === LOGOS.length - 1 ? " vc--ref" : ""}">
      <div class="vc-head"><span class="label">${n + 1}</span><h2>${v.name}</h2></div>
      <p class="vc-desc">${v.desc}</p>
      <div class="vc-top">
        <div class="vc-hero">${glyph(v.bars, { shift: v.shift, grid: true })}</div>
        <div class="vc-side">
          <span class="lockup vc-lock">${logo}<span>Mert <em>Seven</em></span></span>
          <div class="vc-favs">
            ${[48, 32, 16].map((s) => `<span class="fav-tile" style="width:${s}px;height:${s}px">${logo}</span>`).join("")}
            <span class="vc-px">48 · 32 · 16 px</span>
          </div>
        </div>
      </div>
      <div class="vc-family"><span class="vc-own">${logo}</span>${family.map((p) => `<span title="${tip(p)}">${projectMark(p)}</span>`).join("")}</div>
      <div class="notes">
        <div><h3>Güçlü</h3><ul>${v.good.map((x) => `<li>${x}</li>`).join("")}</ul></div>
        <div><h3>Zayıf</h3><ul>${v.bad.map((x) => `<li>${x}</li>`).join("")}</ul></div>
      </div>
    </article>`;
  }).join("")}`;

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
