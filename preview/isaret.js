import { loadCatalog, escapeHtml } from "/assets/js/catalog.js";

// The marks, given a meaning. A mark is a shape (the vessel), a cut inside it and a texture:
//   vessel  = the family of the project's first topic
//   cut     = what it is made as, read from its tools
//   texture = its collection (filled Featured, outline Teaching, dashed Experiment)
// Three ways to make the owner's logo from the same parts, and the marks at work.

const { projects } = await loadCatalog();

const VESSELS = [
  { id: "circle", name: "Felsefe", en: "Philosophy", topics: ["Philosophy"], svg: `<circle cx="12" cy="12" r="10"/>` },
  { id: "diamond", name: "Ağlar ve veri", en: "Networks & data", topics: ["Networks", "Data"], svg: `<path d="M12 1.5 22.5 12 12 22.5 1.5 12Z"/>` },
  { id: "triangle", name: "Gazetecilik", en: "Journalism", topics: ["Journalism", "Storytelling"], svg: `<path d="M12 2 22 21H2Z"/>` },
  { id: "arch", name: "Mekân", en: "Place", topics: ["Location", "Mobile", "Mapping", "AR"], svg: `<path d="M2 12a10 10 0 0 1 20 0v10H2Z"/>` },
  { id: "hexagon", name: "Etkileşim ve sistemler", en: "Interaction & systems", topics: ["Interaction", "Interface", "Design", "Play", "Exhibition", "3D", "Real-time", "Collaboration", "Tools", "AI", "Computer vision"], svg: `<path d="M12 1.5 21.1 6.75v10.5L12 22.5 2.9 17.25V6.75Z"/>` },
  { id: "square", name: "Eğitim", en: "Education", topics: ["Education"], svg: `<rect x="2.5" y="2.5" width="19" height="19"/>` },
];
const CUTS = [
  { id: "plus", name: "Canlı, çok kişili", en: "Live, many at once", tools: ["PeerJS", "QRCode.js"], svg: `<path d="M12 5v14M5 12h14"/>` },
  { id: "dot", name: "Konum ve harita", en: "Location & maps", tools: ["Leaflet", "Geolocation", "DeviceOrientation"], svg: `<circle cx="12" cy="12" r="3"/>` },
  { id: "slash", name: "Etkileşimli sahne", en: "Interactive scene", tools: ["p5.js", "Canvas", "Three.js", "MediaPipe"], svg: `<path d="M6 17 18 7"/>` },
  { id: "ring", name: "Veri görselleştirme", en: "Data visualisation", tools: ["D3", "Graphology", "jsnetworkx", "jStat"], svg: `<circle cx="12" cy="12" r="6"/>` },
  { id: "line", name: "Web ve platform", en: "Web & platform", tools: ["HTML", "CSS", "Tailwind", "JavaScript", "Python"], svg: `<path d="M5 12h14"/>` },
];
const TEXTURES = [
  ["Featured", "Dolu", "Öne çıkan işler"],
  ["Teaching", "Kontur", "Derste kullanılanlar"],
  ["Experiment", "Kesik", "Deneyler"],
];

const vesselOf = (p) => VESSELS.find((v) => v.topics.includes(p.topics[0])) ?? VESSELS.find((v) => p.topics.some((t) => v.topics.includes(t))) ?? VESSELS[4];
const cutOf = (p) => CUTS.find((c) => p.stack.some((s) => c.tools.includes(s))) ?? null;

function draw(vessel, cut, kind = "Featured", cls = "") {
  const filled = kind === "Featured";
  const dash = kind === "Experiment" ? ` stroke-dasharray="3 2.4"` : "";
  return `<svg class="im ${cls}" viewBox="0 0 24 24" aria-hidden="true">
    ${vessel ? `<g fill="${filled ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.6"${dash}>${vessel.svg}</g>` : ""}
    ${cut ? `<g class="${filled && vessel ? "cut" : ""}" fill="none" stroke="currentColor" stroke-width="1.8">${cut.svg}</g>` : ""}
  </svg>`;
}
const markOf = (p) => draw(vesselOf(p), cutOf(p), p.kind);

// ——— The owner's logo, three ways ———
const CAPSULE = { svg: `<rect x="5" y="1.5" width="14" height="21" rx="7"/>` };
const RING_DOT = { svg: `<circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="1.6" fill="currentColor"/>` };
const LOGOS = [
  {
    id: "yedinci", name: "Yedinci <em>kap</em>",
    desc: "Projelerin hiç kullanmadığı, yalnızca sana ait bir kap: dikey bir kapsül, içinde halka. Aynı aileden, ama tek; altı kabın yanında yedinci.",
    logo: (cls) => draw(CAPSULE, CUTS[3], "Featured", cls),
    good: ["Aileye hemen ait, ama hiçbir projeyle karışmıyor.", "Kapsül bir harfe ya da bir göze benzemeden duruyor.", "Favicon'da güçlü."],
    bad: ["Anlamı anlatılmadan 'neden kapsül' sorusu kalabilir."],
  },
  {
    id: "kapsiz", name: "Kapsız <em>kesik</em>",
    desc: "Logo yalnızca iç işaret, etrafında kap yok: bir halka ve ortasında bir nokta. Bütün işlerin ortak iskeleti; projeler bu çekirdeğin etrafına kap giyiyor.",
    logo: (cls) => draw(null, RING_DOT, "Featured", cls),
    good: ["En yalın hali; her boyutta net.", "Hikâyesi güçlü: işler senin çekirdeğinin etrafında biçimleniyor.", "Bir mercek, bir göz bebeği, bir hedef: merak."],
    bad: ["Tek başına bir 'kayıt' ya da 'hedef' simgesine yakın.", "Diğer işaretlerden daha hafif duruyor."],
  },
  {
    id: "donen", name: "Dönen <em>logo</em>",
    desc: "Durağan haliyle kapsız halka; üzerine gelince ya da sayfa yüklenirken altı kap sırayla onun etrafında beliriyor. Logo, işlerin toplamı gibi davranıyor.",
    logo: (cls) => `<span class="im-spin ${cls}">${draw(null, RING_DOT, "Featured")}${VESSELS.map((v, i) => `<span class="im-spin-v" style="--i:${i}">${draw(v, null, "Teaching")}</span>`).join("")}</span>`,
    good: ["Bütün sistemi tek işarette gösteriyor.", "Hareket sitenin merak diline çok uygun.", "Durağan hali sade kalıyor."],
    bad: ["Hareketi görmeyen (yazdırılmış, küçük favicon) yalnızca halkayı görür.", "Dikkat dağıtmaması için çok yavaş ve seyrek olmalı."],
  },
];

// ——— Page ———

const root = document.getElementById("isaret");
const byVessel = VESSELS.map((v) => [v, projects.filter((p) => vesselOf(p) === v)]);
const kindTr = { Featured: "Öne çıkan", Teaching: "Öğretim", Experiment: "Deney" };
const readOut = (p) => {
  const v = vesselOf(p), c = cutOf(p);
  return `${v.name.toLowerCase()} · ${c ? c.name.toLowerCase() : "kesiksiz"} · ${kindTr[p.kind].toLowerCase()}`;
};
const js = projects.find((p) => p.id === "jstudio");

root.innerHTML = `
  <article class="vc vc--wide">
    <div class="vc-head"><span class="label">Fikir</span><h2>İşaretler artık <em>bir şey söylüyor</em></h2></div>
    <p class="vc-desc">Aynı geçici işaretler, ama artık rastgele değil. <b>Kap</b>, projenin ilk konusunun ailesi; <b>kesik</b>, neyle yapıldığı; <b>doku</b>, koleksiyonu. Bir işarete bakan, projeyi bilmeden de okuyabilir: <i>üçgen içinde nokta, dolu</i> = gazetecilik, haritayla, öne çıkan bir iş.</p>
  </article>

  <article class="vc vc--wide">
    <div class="vc-head"><span class="label">1</span><h2>Okuma <em>anahtarı</em></h2></div>
    <div class="key3">
      <div><span class="label">Kap · konu</span>${VESSELS.map((v) => `<p class="key-i">${draw(v, null, "Teaching")}<span>${v.name}<i>${v.en}</i></span></p>`).join("")}</div>
      <div><span class="label">Kesik · yapılış</span>${CUTS.map((c) => `<p class="key-i">${draw(null, c, "Featured")}<span>${c.name}<i>${c.tools.slice(0, 3).join(", ")}…</i></span></p>`).join("")}</div>
      <div><span class="label">Doku · koleksiyon</span>${TEXTURES.map(([k, n, d]) => `<p class="key-i">${draw(VESSELS[0], null, k)}<span>${n}<i>${d}</i></span></p>`).join("")}</div>
    </div>
  </article>

  <article class="vc vc--wide">
    <div class="vc-head"><span class="label">2</span><h2>Bütün <em>projeler</em></h2></div>
    <p class="vc-desc">Kaplarına göre gruplu. Her işaretin altında okunuşu var.</p>
    ${byVessel.filter(([, ps]) => ps.length).map(([v, ps]) => `
      <div class="grp"><p class="grp-h">${draw(v, null, "Teaching")}<span>${v.name}</span><span class="mono">${ps.length}</span></p>
        <div class="grp-row">${ps.map((p) => `<span class="pi" title="${escapeHtml(p.topics.join(", "))} · ${escapeHtml(p.stack.join(", "))}">${markOf(p)}<b>${escapeHtml(p.title)}</b><span>${readOut(p)}</span></span>`).join("")}</div>
      </div>`).join("")}
  </article>

  ${LOGOS.map((l, n) => `
  <article class="vc">
    <div class="vc-head"><span class="label">Logo ${n + 1}</span><h2>${l.name}</h2></div>
    <p class="vc-desc">${l.desc}</p>
    <div class="vc-top">
      <div class="vc-hero is-logo">${l.logo("big")}</div>
      <div class="vc-side">
        <span class="lockup vc-lock">${l.logo("")}<span>Mert <em>Seven</em></span></span>
        <div class="vc-favs">${[48, 32, 16].map((s) => `<span class="fav-tile" style="width:${s}px;height:${s}px">${l.logo("")}</span>`).join("")}<span class="vc-px">48 · 32 · 16 px</span></div>
      </div>
    </div>
    <div class="vc-family"><span class="vc-own">${l.logo("")}</span>${["jstudio", "networkcanvas", "socrates", "ima-lab", "kafka"].map((id) => markOf(projects.find((p) => p.id === id))).join("")}</div>
    <div class="notes">
      <div><h3>Güçlü</h3><ul>${l.good.map((x) => `<li>${x}</li>`).join("")}</ul></div>
      <div><h3>Zayıf</h3><ul>${l.bad.map((x) => `<li>${x}</li>`).join("")}</ul></div>
    </div>
  </article>`).join("")}

  <article class="vc vc--wide">
    <div class="vc-head"><span class="label">3</span><h2>İşbaşında</h2></div>
    <div class="apps">
      <div class="app"><span class="label">Header</span>
        <div class="app-head"><span class="lockup lockup--sm">${LOGOS[1].logo("")}<span>Mert <em>Seven</em></span></span><nav><span>Index</span><span>Research</span><span>About</span></nav></div>
      </div>
      <div class="app"><span class="label">Künye</span>
        <div class="app-card">${markOf(js)}<div><p class="label">${readOut(js)}</p><h3>Journalism <em>Studio</em></h3><p>${escapeHtml(js.summary)}</p></div></div>
      </div>
      <div class="app"><span class="label">Footer imzası</span>
        <div class="app-foot mono"><span>Made by hand in İzmir · © 2026</span><span class="app-sig">${LOGOS[1].logo("")}<span>×</span>${markOf(js)}</span></div>
      </div>
      <div class="app"><span class="label">Yükleniyor</span>
        <div class="app-load">${LOGOS[2].logo("is-loading")}</div>
      </div>
      <div class="app"><span class="label">Sözlük maddeleri</span>
        <ul class="app-list">${VESSELS.slice(0, 4).map((v) => `<li>${draw(v, null, "Teaching")}<span>${v.en}</span></li>`).join("")}</ul>
      </div>
    </div>
  </article>`;

for (const b of document.querySelectorAll("[data-theme-set]")) {
  b.addEventListener("click", () => {
    document.documentElement.dataset.theme = b.dataset.themeSet;
    document.querySelectorAll("[data-theme-set]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  });
}
