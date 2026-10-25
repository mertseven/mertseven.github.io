import { loadCatalog, escapeHtml } from "/assets/js/catalog.js";

// Weave identity: the project marks stay as they are (topics across, tools down); this
// page tries simpler logos for the owner, each one a single idea taken from the weave.

const { projects } = await loadCatalog();
const SHOW = ["jstudio", "networkcanvas", "philosophical-networks", "critical-theory", "socrates", "ima-lab", "etkilesim-atlasi", "grad-projects", "icebreaker", "find-the-university", "visualizing-sep", "kafka"];
const FAMILY = ["jstudio", "networkcanvas", "socrates", "etkilesim-atlasi", "icebreaker"];

const f = (n) => +n.toFixed(2);
const pt = ([x, y]) => `${f(x)},${f(y)}`;
const line = (a, b) => `M${pt(a)} L${pt(b)}`;
const style = (p) => (p.kind === "Featured" ? "" : p.kind === "Teaching" ? "hollow" : "dashed");
const svg = (body) => `<svg viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;

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
// The families the work uses most, most used first.
const top = (of, n) => {
  const count = new Map();
  for (const p of projects) for (const i of of(p)) count.set(i, (count.get(i) || 0) + 1);
  return [...count].sort((a, b) => b[1] - a[1]).slice(0, n).map(([i]) => i);
};

// Threads: verticals first, horizontals over them with a paper-coloured casing, then the
// verticals that should be on top at a crossing come back over it.
function woven({ rows, cols, w, from = 1.5, to = 22.5, vOver = (r, c) => (r + c) % 2 === 0, cls = "", extra = "", transform = "" }) {
  const dash = cls === "dashed" ? " dashed" : "";
  const ink = (d, k) => `<path class="e${dash}" pathLength="1" d="${d}" style="stroke-width:${w};animation-delay:${k * 80}ms"/>`;
  const casing = (d, cap = "") => `<path class="casing" d="${d}" style="stroke-width:${f(w + Math.max(1.4, w * 0.6))}${cap}"/>`;
  const span = (t) => (typeof t === "object" ? t : { at: t, from, to });
  let body = "", k = 0;
  const C = cols.map(span), R = rows.map(span);
  for (const c of C) body += ink(line([c.at, c.from], [c.at, c.to]), k++);
  for (const r of R) { const d = line([r.from, r.at], [r.to, r.at]); body += casing(d) + ink(d, k++); }
  R.forEach((r, i) => C.forEach((c, j) => {
    if (!vOver(i, j, r, c) || c.at < r.from || c.at > r.to || r.at < c.from || r.at > c.to) return;
    // The casing only needs to cover the crossing thread; the ink runs past it, so its ends
    // land on ink of the same colour and leave no seam.
    const hc = w * 0.5 + 0.3, hi = w * 0.5 + Math.max(1.4, w * 0.6) + 0.6;
    const dc = line([c.at, r.at - hc], [c.at, r.at + hc]);
    const di = line([c.at, r.at - hi], [c.at, r.at + hi]);
    body += `${casing(dc, ";stroke-linecap:butt")}<path class="e" d="${di}" style="stroke-width:${w};stroke-linecap:butt"/>`;
  }));
  return svg(transform ? `<g transform="${transform}">${body}${extra}</g>` : body + extra);
}

// The project marks, unchanged from the previous preview.
const SLOT = (i) => 3.2 + i * (17.6 / 7);
const projectMark = (p) => {
  const cls = style(p);
  return woven({ rows: topicsOf(p).map(SLOT), cols: toolsOf(p).map(SLOT), w: cls === "" ? 1.6 : 1.1, cls, vOver: (i, j, r, c) => (topicsOf(p)[i] + toolsOf(p)[j]) % 2 === 0 });
};

const T3 = top(topicsOf, 3), K3 = top(toolsOf, 3);

const LOGOS = [
  {
    name: "Şimdiki", tag: "0",
    desc: "Karşılaştırma için: işlerinin kullandığı bütün iplikler, 8 × 8.",
    logo: () => woven({ rows: [...new Set(projects.flatMap(topicsOf))].map(SLOT), cols: [...new Set(projects.flatMap(toolsOf))].map(SLOT), w: 1.15 }),
    good: ["Bütün işin tek resmi."], bad: ["Küçükte bir ızgara; logo olarak fazla yoğun."],
  },
  {
    name: "Tek <em>geçiş</em>", tag: "1",
    desc: "Dokumanın en küçük birimi: bir atkı ipliği bir çözgü ipliğinin üstünden geçiyor. Bir konu ve bir araç; her proje bundan başlıyor.",
    logo: () => woven({ rows: [12], cols: [12], w: 3.4, from: 3, to: 21, vOver: () => false }),
    good: ["En yalın hali; 16 px'de bile kusursuz.", "Üst-alt boşluğu onu sıradan bir artıdan ayırıyor."],
    bad: ["Bir artı ya da haç olarak okunma riski yüksek.", "Tek başına 'örgü' olduğu anlaşılmayabilir."],
  },
  {
    name: "Düz <em>dokuma</em>", tag: "2",
    desc: "İki atkı, iki çözgü, sırayla üstten ve alttan: düz dokumanın tekrar eden birimi. Projelerin hepsi bu birimin büyümüş hali.",
    logo: () => woven({ rows: [8, 16], cols: [8, 16], w: 3.2, from: 3, to: 21 }),
    good: ["Örgü olduğu hemen anlaşılıyor.", "Simetrik ve sakin; favicon'da güçlü.", "Proje işaretleriyle birebir aynı dil."],
    bad: ["'#' işaretine yakın duruyor; üst-alt geçiş farkı kurtarıyor ama ince."],
  },
  {
    name: "<em>Fırıldak</em>", tag: "3",
    desc: "Aynı dört iplik, ama uçları kaydırılmış: her iplik bir köşeden taşıyor. Dokuma dönüyormuş gibi görünüyor; '#' çağrışımı kalkıyor.",
    logo: () => woven({
      rows: [{ at: 8, from: 2.5, to: 18 }, { at: 16, from: 6, to: 21.5 }],
      cols: [{ at: 16, from: 2.5, to: 18 }, { at: 8, from: 6, to: 21.5 }],
      w: 3.2,
      vOver: (i, j) => (i + j) % 2 === 1,
    }),
    good: ["Hareket hissi olan, ayırt edici bir işaret.", "Hâlâ dört iplik ve dört geçiş: aynı sistem.", "Dönme animasyonuna çok uygun."],
    bad: ["Örgüden çok bir düğüm ya da sembol gibi okunabilir.", "Proje işaretleriyle arasındaki bağ biraz daha dolaylı."],
  },
  {
    name: "İpin <em>ucu</em>", tag: "4",
    desc: "Düz dokuma, ama bir iplik dokumanın dışına çıkıyor ve bir düğümde bitiyor. Merak, ipin ucunu çekmek: ağ ile örgü tek işarette.",
    logo: () => woven({
      rows: [{ at: 8.5, from: 2.5, to: 15.5 }, { at: 15, from: 2.5, to: 19 }],
      cols: [{ at: 6, from: 3, to: 21 }, { at: 12.5, from: 3, to: 21 }],
      w: 2.8,
      extra: `<circle class="n" cx="20.6" cy="15" r="2.6"/>`,
    }),
    good: ["Bir hikâyesi var: 'what are you curious about?' sorusuna bağlanıyor.", "Ağ fikri (düğüm) geri geliyor, ama yalın.", "Asimetrik olduğu için daha kişisel ve akılda kalıcı."],
    bad: ["Düğüm küçükte kaybolmasın diye büyük durmalı; dengesi ince ayar istiyor."],
  },
  {
    name: "Kilim <em>gözü</em>", tag: "5",
    desc: "Düz dokuma 45° döndürülünce bir eşkenar dörtgen çıkıyor: kilimlerdeki 'göz' motifi. Yerel bir referans, ama soyut.",
    logo: () => woven({ rows: [9, 15], cols: [9, 15], w: 2.9, from: 4.5, to: 19.5, transform: "rotate(45 12 12)" }),
    good: ["Anadolu dokumasına sessiz bir selam; İzmir'le bağ.", "Elmas biçimi küçük boyutta çok net.", "Proje işaretlerinden ayrışıyor ama aynı aileden."],
    bad: ["'Nazar' çağrışımı istenmeyebilir.", "Döndürüldüğü için proje işaretleriyle aynı ızgarada durmuyor."],
  },
  {
    name: "Senin <em>ipliklerin</em>", tag: "6",
    desc: `Veriden gelen sade logo: en çok çalıştığın üç konu (${T3.map((i) => TOPICS[i][0]).join(", ")}) ve en çok kullandığın üç araç (${K3.map((i) => TOOLS[i][0]).join(", ")}), 3 × 3.`,
    logo: () => woven({ rows: [6, 12, 18], cols: [6, 12, 18], w: 2.5, from: 2.5, to: 21.5 }),
    good: ["Hâlâ gerçek veri, ama okunacak kadar az.", "Şimdiki logo ile proje işaretleri arasında tam ortada."],
    bad: ["Küçükte yine biraz ızgara gibi; düz dokumadan daha kalabalık."],
  },
];

// ——— Page ———

const marks = SHOW.map((id) => projects.find((p) => p.id === id)).filter(Boolean);
const family = FAMILY.map((id) => projects.find((p) => p.id === id)).filter(Boolean);
const tip = (p) => escapeHtml(`${p.title} · ${p.topics.join(", ")} · ${p.stack.join(", ")}`);

document.getElementById("about").innerHTML = "<b>Proje işaretleri aynı kalıyor;</b> yalnızca ana logo için sade alternatifler. Her kartın altındaki satır, logoyu beş proje işaretinin yanına koyuyor: aileden biri gibi durmalı ama en kolay o tanınmalı.";

document.getElementById("ag").innerHTML = `
  <article class="vc vc--wide">
    <div class="vc-head"><span class="label">Proje kimlikleri</span><h2>Değişmiyor</h2></div>
    <p class="vc-desc">Konular yatay, araçlar dikey iplikler. Dolu: Featured · İnce: öğretim · Kesik: deney.</p>
    <div class="vc-marks">${marks.map((p) => `<span class="vm" title="${tip(p)}">${projectMark(p)}<span>${escapeHtml(p.title)}</span></span>`).join("")}</div>
  </article>
  ${LOGOS.map((v) => {
    const logo = v.logo();
    return `
    <article class="vc${v.tag === "0" ? " vc--ref" : ""}">
      <div class="vc-head"><span class="label">${v.tag}</span><h2>${v.name}</h2></div>
      <p class="vc-desc">${v.desc}</p>
      <div class="vc-top">
        <div class="vc-hero">${logo}</div>
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
