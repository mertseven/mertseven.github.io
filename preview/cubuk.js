import { loadCatalog, escapeHtml } from "/assets/js/catalog.js";

// Bar identity: no weaving, just bars on a fixed grid of eight slots. A project lays one
// bar across for each topic family and one down for each tool family. The owner's logo is
// built from the same bars.

const { projects } = await loadCatalog();
const SHOW = ["jstudio", "networkcanvas", "philosophical-networks", "critical-theory", "socrates", "ima-lab", "etkilesim-atlasi", "grad-projects", "icebreaker", "find-the-university", "visualizing-sep", "kafka"];
const FAMILY = ["jstudio", "networkcanvas", "socrates", "etkilesim-atlasi", "icebreaker"];

const f = (n) => +n.toFixed(2);
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

// A bar from (x1, y1) to (x2, y2). pathLength lets a card draw it on hover.
const bar = ([x1, y1, x2, y2], w, cls = "", k = 0) => `<path class="e${cls === "dashed" ? " dashed" : ""}" pathLength="1" d="M${f(x1)},${f(y1)} L${f(x2)},${f(y2)}" style="stroke-width:${w};animation-delay:${k * 90}ms"/>`;
const bars = (list, w, cls) => svg(list.map((b, k) => bar(b, w, cls, k)).join(""));

const SLOT = (i) => 3.2 + i * (17.6 / 7);
const projectMark = (p) => {
  const cls = style(p), w = cls === "" ? 1.8 : 1.15;
  return bars([
    ...toolsOf(p).map((c) => [SLOT(c), 1.5, SLOT(c), 22.5]),
    ...topicsOf(p).map((r) => [1.5, SLOT(r), 22.5, SLOT(r)]),
  ], w, cls);
};

// How many projects each topic family has, largest first.
const counts = TOPICS.map(([name], i) => [name, projects.filter((p) => topicsOf(p).includes(i)).length]).sort((a, b) => b[1] - a[1]);

const LOGOS = [
  {
    name: "<em>ms</em>", tag: "1",
    desc: "MIT Media Lab'in 2014 kimliğindeki yol: harfleri aynı çubuklardan kurmak. Logo, yalnızca yatay ve dikey çubuklarla yazılmış küçük bir 'ms'. Projeler aynı çubuklarla kendi desenlerini çiziyor.",
    logo: () => bars([[3, 8, 12, 8], [3, 8, 3, 19], [7.5, 8, 7.5, 19], [12, 8, 12, 19], [15.5, 8, 21, 8], [15.5, 8, 15.5, 13.5], [15.5, 13.5, 21, 13.5], [21, 13.5, 21, 19], [15.5, 19, 21, 19]], 2.3),
    good: ["Adın doğrudan okunuyor; açıklama gerektirmiyor.", "Media Lab'deki 'harf = çubuk sistemi' mantığının kendisi.", "Proje işaretleriyle aynı kalınlık ve aynı açılar."],
    bad: ["Dokuz çubuk; 16 px'de 's' biraz '5'e kayıyor.", "Harf olduğu için proje işaretlerinden daha 'yazı' gibi duruyor."],
  },
  {
    name: "Tek <em>m</em>", tag: "2",
    desc: "Yalnızca baş harf: üstte bir çubuk, altında üç bacak. Bir 'm', ama aynı zamanda üç dikey çubuğu bağlayan tek bir yatay çubuk: bir konunun üç araçla buluşması.",
    logo: () => bars([[4.5, 5.5, 19.5, 5.5], [4.5, 5.5, 4.5, 19.5], [12, 5.5, 12, 19.5], [19.5, 5.5, 19.5, 19.5]], 3.2),
    good: ["Dört çubuk; en sade harf çözümü.", "Favicon'da çok güçlü.", "Hem harf hem proje deseni gibi okunuyor."],
    bad: ["Pi (π) harfine ya da bir masaya benzeyebilir.", "'Seven' kısmı logoda yok; wordmark'a bırakılıyor."],
  },
  {
    name: "Çubuk <em>grafik</em>", tag: "3",
    desc: `Kelimenin tam anlamıyla bir çubuk grafik: en çok çalıştığın dört konu ailesi, proje sayılarıyla (${counts.slice(0, 4).map(([n, c]) => `${n} ${c}`).join(", ")}). Logo gerçek veri; iş arttıkça çubuklar uzuyor.`,
    logo: () => {
      const max = counts[0][1];
      return bars(counts.slice(0, 4).map(([, c], i) => [3, 5 + i * 4.7, 3 + (c / max) * 18, 5 + i * 4.7]), 2.8);
    },
    good: ["Veriyle çalışan biri için dürüst ve esprili bir logo.", "Basit, sakin, her boyutta okunur.", "Yaşayan logo: katalog değişince kendiliğinden değişir."],
    bad: ["Bir 'menü' ya da 'istatistik' simgesine çok yakın.", "Proje işaretlerinin ızgarasından farklı bir mantık."],
  },
  {
    name: "<em>Kesişim</em>", tag: "4",
    desc: "Bütün proje işaretlerinin en küçük birimi: bir konu ve bir araç, bir yatay ve bir dikey çubuk. Kesişim merkezden kaydırılmış; böylece bir haç ya da artı değil, bir koordinat gibi duruyor.",
    logo: () => bars([[3, 9, 21, 9], [15, 3, 15, 21]], 3.2),
    good: ["İki çubuk: sistemin ta kendisi.", "Proje işaretleri bunun çoğalmış hali; aile bağı çok net.", "Hareketle çok iyi çalışır: çubuklar kayarak bir projenin desenine dönüşebilir."],
    bad: ["Çok yalın; tek başına bir anlamı yok, sistemle birlikte anlam kazanıyor.", "Kaydırılmış olsa da artı işaretine yakın."],
  },
];

// ——— Page ———

const marks = SHOW.map((id) => projects.find((p) => p.id === id)).filter(Boolean);
const family = FAMILY.map((id) => projects.find((p) => p.id === id)).filter(Boolean);
const tip = (p) => escapeHtml(`${p.title} · ${p.topics.join(", ")} · ${p.stack.join(", ")}`);

document.getElementById("about").innerHTML = "<b>Örgü yok, çubuk var.</b> Proje işaretleri aynı kural: her konu ailesi için bir yatay, her araç ailesi için bir dikey çubuk, sabit sekiz yuvalık bir ızgarada. Üst-alt geçişi kaldırdım. Aşağıda ana logo için dört çubuk çözümü; her kartın altındaki satır logoyu beş proje işaretinin yanına koyuyor.";

document.getElementById("ag").innerHTML = `
  <article class="vc vc--wide">
    <div class="vc-head"><span class="label">Proje kimlikleri</span><h2>Çubuklar</h2></div>
    <p class="vc-desc">Yatay: konu ailesi (felsefe, ağlar, veri, gazetecilik, mekân, etkileşim, sistemler, eğitim). Dikey: araç ailesi. Dolu: Featured · İnce: öğretim · Kesik: deney.</p>
    <div class="vc-marks">${marks.map((p) => `<span class="vm" title="${tip(p)}">${projectMark(p)}<span>${escapeHtml(p.title)}</span></span>`).join("")}</div>
  </article>
  ${LOGOS.map((v) => {
    const logo = v.logo();
    return `
    <article class="vc">
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
