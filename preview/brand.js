import { loadCatalog, escapeHtml } from "/assets/js/catalog.js";

// Brand preview: four directions for the identity. Each one is a rule that makes the
// owner's logo and, from the same rule, a distinct mark for every project.

const { projects } = await loadCatalog();
const KIND = { Featured: "Featured", Teaching: "Teaching", Experiment: "Experiment" };
const SHOW = ["jstudio", "networkcanvas", "philosophical-networks", "critical-theory", "socrates", "ima-lab", "etkilesim-atlasi", "grad-projects", "icebreaker", "find-the-university", "visualizing-sep", "kafka"];

const hash = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0; return h; };
// A stable shuffle of a list, keyed by a project id.
const order = (list, key) => list.map((v, i) => [hash(`${key}:${i}`), v]).sort((a, b) => a[0] - b[0]).map(([, v]) => v);

// Give each project a distinct value from `pool`, in catalogue order, starting from its
// own shuffled preference so the result does not depend on who came first more than needed.
function assign(pool, reserved = []) {
  const used = new Set(reserved.map(String));
  const out = new Map();
  for (const p of projects) {
    const pick = order(pool, p.id).find((v) => !used.has(String(v)));
    used.add(String(pick));
    out.set(p.id, pick);
  }
  return out;
}

const style = (p) => (p.kind === "Featured" ? "" : p.kind === "Teaching" ? "hollow" : "dashed");

// ——— A · Seven segments ———
// The owner is the 7 (segments a, b, c lit). Every project lights another combination of
// the same seven bars: 3 to 5 of them, never the 7 itself.

const SEG = "abcdefg";
function segPolys() {
  const W = 14, H = 24, t = 2.6, g = 0.75, m = t / 2;
  const hbar = (cx, cy, L) => [[cx - L / 2, cy], [cx - L / 2 + m, cy - m], [cx + L / 2 - m, cy - m], [cx + L / 2, cy], [cx + L / 2 - m, cy + m], [cx - L / 2 + m, cy + m]];
  const vbar = (cx, cy, L) => [[cx, cy - L / 2], [cx + m, cy - L / 2 + m], [cx + m, cy + L / 2 - m], [cx, cy + L / 2], [cx - m, cy + L / 2 - m], [cx - m, cy - L / 2 + m]];
  const L = W - 2 * m - 2 * g;
  const V = H / 2 - m - 2 * g;
  return {
    a: hbar(W / 2, m, L),
    b: vbar(W - m, m + g + V / 2 + g / 2, V),
    c: vbar(W - m, H / 2 + g + V / 2, V),
    d: hbar(W / 2, H - m, L),
    e: vbar(m, H / 2 + g + V / 2, V),
    f: vbar(m, m + g + V / 2 + g / 2, V),
    g: hbar(W / 2, H / 2, L),
  };
}
const POLYS = segPolys();
const pts = (poly) => poly.map(([x, y]) => `${x.toFixed(2)},${y.toFixed(2)}`).join(" ");

function seven(lit, cls = "") {
  // Lit bars come on in reading order on hover; the dark ones stay as hairlines.
  let k = 0;
  const bars = [...SEG].map((s) => {
    const on = lit.includes(s);
    return `<polygon class="seg ${on ? `seg-on ${cls}` : "seg-off"}" points="${pts(POLYS[s])}"${on ? ` style="animation-delay:${(k++) * 90}ms"` : ""}/>`;
  }).join("");
  return `<svg viewBox="-1 -1 16 26" aria-hidden="true"><g transform="skewX(-7) translate(1.6 0)">${bars}</g></svg>`;
}
const SEG_POOL = (() => {
  const out = [];
  for (let n = 1; n < 128; n++) {
    const lit = [...SEG].filter((_, i) => n & (1 << i)).join("");
    if (lit.length >= 3 && lit.length <= 5 && lit !== "abc") out.push(lit);
  }
  return out;
})();
const segOf = assign(SEG_POOL, ["abc"]);

// ——— B · Cell ———
// The owner is a single cell of the ASCII ocean with a 7 in it. Every project gets a cell
// of its own: a character from the ocean's ramp in a square or a round cell.

const RAMP = ["·", ":", ";", "+", "*", "%", "#", "@", "=", "~", "^", "&", "$", "§", "¤", "×"];
const CELL_POOL = RAMP.flatMap((c) => [`sq${c}`, `ci${c}`]);
const cellOf = assign(CELL_POOL, []);
function cell(ch, shape = "sq", cls = "") {
  const filled = cls === "";
  const dash = cls === "dashed" ? ` stroke-dasharray="2 1.6"` : "";
  const frame = shape === "ci"
    ? `<circle cx="12" cy="12" r="10.5" ${filled ? `fill="currentColor"` : `fill="none" stroke="currentColor" stroke-width="1.3"${dash}`}/>`
    : `<rect x="1.5" y="1.5" width="21" height="21" rx="4" ${filled ? `fill="currentColor"` : `fill="none" stroke="currentColor" stroke-width="1.3"${dash}`}/>`;
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${frame}<text x="12" y="12.6" text-anchor="middle" dominant-baseline="middle" style="font-family:var(--font-mono);font-weight:600;font-size:13px;fill:${filled ? "var(--paper)" : "currentColor"}">${escapeHtml(ch)}</text></svg>`;
}

// ——— C · Network ———
// Seven nodes on a ring. The owner is the seven-pointed star through all of them; every
// project draws three or four of the 21 possible chords.

const NODES = Array.from({ length: 7 }, (_, i) => {
  const a = -Math.PI / 2 + (i * 2 * Math.PI) / 7;
  return [12 + Math.cos(a) * 10, 12 + Math.sin(a) * 10];
});
const CHORDS = [];
for (let i = 0; i < 7; i++) for (let j = i + 1; j < 7; j++) CHORDS.push([i, j]);
const NET_POOL = (() => {
  const out = [];
  const rand = (n) => { let s = n * 9301 + 49297; return () => ((s = (s * 9301 + 49297) % 233280) / 233280); };
  const r = rand(7);
  while (out.length < 300) {
    const k = 3 + Math.floor(r() * 2);
    const set = new Set();
    while (set.size < k) set.add(Math.floor(r() * CHORDS.length));
    const key = [...set].sort((a, b) => a - b).join(".");
    if (!out.includes(key)) out.push(key);
  }
  return out;
})();
const netOf = assign(NET_POOL, []);
function network(edges, cls = "") {
  const used = new Set(edges.flatMap(([a, b]) => [a, b]));
  const dash = cls === "dashed" ? ` stroke-dasharray="1.8 1.6"` : "";
  const w = cls === "hollow" ? 1.1 : 1.6;
  const ring = `<circle cx="12" cy="12" r="10" class="net-ghost"/>`;
  const lines = edges.map(([a, b]) => `<line class="net-edge lit" x1="${NODES[a][0].toFixed(2)}" y1="${NODES[a][1].toFixed(2)}" x2="${NODES[b][0].toFixed(2)}" y2="${NODES[b][1].toFixed(2)}" style="stroke-width:${w}"${dash}/>`).join("");
  const dots = NODES.map(([x, y], i) => used.has(i)
    ? `<circle class="net-node${cls === "hollow" ? " hollow" : ""}" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="1.9"/>`
    : `<circle class="net-node" cx="${x.toFixed(2)}" cy="${y.toFixed(2)}" r="0.9" opacity="0.35"/>`).join("");
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${ring}${lines}${dots}</svg>`;
}
const STAR = Array.from({ length: 7 }, (_, i) => [i, (i + 3) % 7]);
const netEdges = (key) => key.split(".").map(Number).map((i) => CHORDS[i]);

// ——— D · Typographic ———
// The owner is the name with one word in serif italic: Mert *Seven*. Every project follows
// the same rule (its last word in italic), and its mark is the two initials set that way.

function monogram(a, b, cls = "") {
  const ring = cls === "" ? `<circle cx="12" cy="12" r="11" fill="currentColor"/>` : `<circle cx="12" cy="12" r="10.4" fill="none" stroke="currentColor" stroke-width="1.2"${cls === "dashed" ? ` stroke-dasharray="2 1.6"` : ""}/>`;
  const fill = cls === "" ? "var(--paper)" : "currentColor";
  return `<svg viewBox="0 0 24 24" aria-hidden="true">${ring}<text x="12" y="12.8" text-anchor="middle" dominant-baseline="middle" style="fill:${fill};font-size:11px;letter-spacing:-0.4px"><tspan style="font-family:var(--font-sans);font-weight:300">${escapeHtml(a)}</tspan><tspan style="font-family:var(--font-serif);font-style:italic;font-size:12.5px">${escapeHtml(b)}</tspan></text></svg>`;
}
const words = (t) => t.replace(/[^\p{L}\p{N}\s'&!-]/gu, " ").split(/\s+/).filter(Boolean);
const italicLast = (t) => {
  const w = t.split(" ");
  if (w.length < 2) return `<em>${escapeHtml(t)}</em>`;
  return `${escapeHtml(w.slice(0, -1).join(" "))} <em>${escapeHtml(w.at(-1))}</em>`;
};
const initials = (t) => {
  const w = words(t).filter((x) => !/^(of|the|for|and|&)$/i.test(x));
  return [w[0]?.[0]?.toUpperCase() || "?", (w.at(-1)?.[0] || "").toLowerCase()];
};

// ——— Directions ———

const DIRS = [
  {
    id: "seven", label: "A · Yedi segment", pick: true,
    about: "<b>Soyadın Seven, yani 7.</b> Logo, yedi segmentli bir ekranda yanan 7. Her proje aynı yedi çubuğun başka bir kombinasyonunu yakıyor: hepsi senin harfinden türüyor. Büyük logonun üzerine gel: segmentler bir ekran uyanıyormuş gibi sırayla yanıyor.",
    logo: () => seven("abc"),
    mark: (p) => seven(segOf.get(p.id), style(p)),
    code: (p) => [...SEG].map((s) => (segOf.get(p.id).includes(s) ? s : "·")).join(""),
    name: (p) => escapeHtml(p.title),
    legend: "Dolu: Featured · Kontur: öğretim · Kesik: deney. Kod, yanan segmentler (a üst, b sağ üst, c sağ alt, d alt, e sol alt, f sol üst, g orta).",
    good: ["Doğrudan adından geliyor; açıklamaya gerek yok.", "Proje kimliklerini kendisi üretiyor: 3–5 çubuklu 90 kombinasyon, 28 proje rahat sığıyor.", "16 px'de bile okunuyor; tek renkle çalışıyor.", "Harekete çok uygun: yükleme, geçiş, silindirde öne gelen projenin işareti yanabilir.", "Yeni medya: eski bir dijital ekrana selam, ama yeni duruyor."],
    bad: ["Dijital saat çağrışımı fazla teknik ya da retro okunabilir.", "Bazı kombinasyonlar istemeden harf ya da rakam gibi okunur (E, H, 4…); seçerken ayıklamak gerekir.", "İşaretler aynı iskelette olduğu için uzaktan birbirine benzeyebilir."],
  },
  {
    id: "cell", label: "B · Hücre",
    about: "<b>ASCII okyanusundan tek bir hücre.</b> Logo, içinde 7 olan küçük bir kare. Her proje okyanusun karakter dizisinden bir karakter ve kare ya da yuvarlak bir hücre alıyor.",
    logo: () => cell("7", "sq"),
    mark: (p) => cell(cellOf.get(p.id).slice(2), cellOf.get(p.id).slice(0, 2), style(p)),
    code: (p) => `${cellOf.get(p.id).slice(0, 2) === "ci" ? "round" : "square"} ${cellOf.get(p.id).slice(2)}`,
    name: (p) => escapeHtml(p.title),
    legend: "Dolu: Featured · Kontur: öğretim · Kesik: deney. Karakterler okyanusun dokusundan.",
    good: ["Okyanusla ve ASCII dokusuyla en güçlü bağ.", "Çok basit, her yerde tutarlı.", "Favicon'da net."],
    bad: ["Logo olarak karakteri zayıf: bir uygulama ikonuna ya da klavye tuşuna benzeyebilir.", "Proje işaretleri birbirine çok benziyor; tek fark bir karakter.", "Bir font karakterine dayanıyor; ileride çizime dönüştürmek gerekir."],
  },
  {
    id: "net", label: "C · Ağ",
    about: "<b>Yedi düğümlü bir ağ.</b> Logo, yedi düğümün hepsinden geçen yedi köşeli yıldız. Her proje aynı yedi düğüm arasındaki 21 olası bağdan 3–4 tanesini çiziyor; ağ araştırmana ve felsefe ağlarına selam.",
    logo: () => network(STAR),
    mark: (p) => network(netEdges(netOf.get(p.id)), style(p)),
    code: (p) => `${netEdges(netOf.get(p.id)).length} bağ`,
    name: (p) => escapeHtml(p.title),
    legend: "Kalın: Featured · İnce: öğretim · Kesik: deney. Soluk halka ve noktalar ortak iskelet.",
    good: ["Akademik kimliğine en yakın olan: ağlar, bağlar, ilişkiler.", "Yedi düğüm yine adındaki 7'yi taşıyor.", "Proje işaretleri gerçekten farklı şekiller çiziyor."],
    bad: ["Küçük boyutta çizgiler birbirine karışıyor; 16 px favicon zor.", "Logo olarak bir 'ağ' simgesi kalıbına yakın; ayırt edici olması için çok iyi çizilmesi gerek.", "Yıldız, dini ya da mistik çağrışımlara açık."],
  },
  {
    id: "type", label: "D · Tipografik imza",
    about: "<b>İşaret yok, isim var.</b> Logo: Mert <em>Seven</em>. Her proje aynı kuralla yazılıyor (son kelimesi serif italik) ve küçük işareti, adının iki baş harfi bu şekilde dizilmiş bir mühür.",
    logo: () => monogram("M", "s"),
    mark: (p) => monogram(...initials(p.title), style(p)),
    code: (p) => initials(p.title).join(""),
    name: (p) => italicLast(p.title),
    legend: "Dolu: Featured · Kontur: öğretim · Kesik: deney. Adların son kelimesi italik: sitenin 'curious' vurgusuyla aynı.",
    good: ["En sade ve en 'premium' yol; sitenin tipografisinin kendisi.", "Ana sayfadaki 'what are you curious about?' ile birebir aynı dil.", "Yeni bir şekil öğrenmek gerekmiyor."],
    bad: ["Küçük işaret harflerden oluşuyor; logo kadar akılda kalmıyor.", "Aynı baş harfleri paylaşan projeler çakışıyor (Philosophical Networks / Project KAFKA…).", "Bir fonta bağlı; font değişirse kimlik değişir."],
  },
];

// ——— Page ———

const el = (id) => document.getElementById(id);
const brand = el("brand");
const about = el("about");
const modes = el("modes");

const row = document.createElement("div");
row.className = "modes-row";
for (const d of DIRS) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = `chip${d.pick ? " chip--pick" : ""}`;
  b.textContent = d.label;
  b.dataset.id = d.id;
  b.addEventListener("click", () => render(d.id));
  row.append(b);
}
modes.append(row);

for (const b of document.querySelectorAll("[data-theme-set]")) {
  b.addEventListener("click", () => {
    document.documentElement.dataset.theme = b.dataset.themeSet;
    document.querySelectorAll("[data-theme-set]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  });
}

function render(id) {
  const d = DIRS.find((x) => x.id === id);
  history.replaceState(null, "", `#${id}`);
  for (const b of row.querySelectorAll(".chip")) b.setAttribute("aria-pressed", String(b.dataset.id === id));
  about.innerHTML = d.about;
  const logo = d.logo();
  const lock = (cls = "") => `<span class="lockup ${cls}">${logo}<span>Mert <em>Seven</em></span></span>`;
  const list = SHOW.map((pid) => projects.find((p) => p.id === pid)).filter(Boolean);

  brand.innerHTML = `
    <section class="blk">
      <span class="label">Logo ve wordmark</span>
      <div class="hero">
        <div class="hero-mark">${logo}</div>
        <div class="hero-side">
          ${lock()}
          <div class="notes">
            <div><h3>Güçlü</h3><ul>${d.good.map((x) => `<li>${x}</li>`).join("")}</ul></div>
            <div><h3>Zayıf</h3><ul>${d.bad.map((x) => `<li>${x}</li>`).join("")}</ul></div>
          </div>
        </div>
      </div>
    </section>

    <section class="blk">
      <span class="label">Favicon · gerçek boyutlar</span>
      <div class="fav">
        ${[64, 32, 16].map((s) => `<div class="fav-size"><span class="fav-tile" style="width:${s}px;height:${s}px">${logo}</span>${s} px</div>`).join("")}
        <div class="tabs">
          <span class="tab on"><span class="fav-tile">${logo}</span>Mert Seven</span>
          <span class="tab">Inbox</span>
          <span class="tab">Docs</span>
        </div>
      </div>
    </section>

    <section class="blk">
      <span class="label">Header'da</span>
      <div class="mock">
        <div class="mock-head">${lock("lockup--sm")}<nav><span>Index</span><span>Research</span><span>Writing</span><span>About</span></nav></div>
        <div class="mock-body">what are you <em>curious</em> about?</div>
      </div>
    </section>

    <section class="blk">
      <span class="label">Proje kimlikleri · aynı kuraldan</span>
      <div class="marks">
        ${list.map((p) => `
          <div class="pm">
            ${d.mark(p)}
            <span class="pm-name">${d.name(p)}</span>
            <span><span class="pm-kind">${KIND[p.kind]}</span> <span class="pm-code">${escapeHtml(d.code(p))}</span></span>
          </div>`).join("")}
      </div>
      <p class="marks-legend">${d.legend}</p>
    </section>

    <section class="blk">
      <span class="label">Footer · kolofon</span>
      <footer class="colophon">
        <div class="col-top">
          <div>${lock("lockup--sm")}<p class="col-tag">New media scholar &amp; digital crafter.</p></div>
          <div class="col-now"><span class="label">Currently</span>Teaching Interactive Media Applications at Yaşar University, and building an atlas of the tools behind interactive journalism.</div>
          <nav class="col-links"><a href="/work/">Index</a><a href="/publications.html">Research</a><a href="/writing.html">Writing</a><a href="/contact.html">About</a><a href="/search/">Search</a><a href="/contact.html">Contact</a></nav>
        </div>
        <div class="col-bottom">
          <span>Set in Geist &amp; Instrument Serif · Made by hand in İzmir · © 2026</span>
          <span class="col-sig">${logo}<span>this page</span></span>
        </div>
      </footer>
      <p class="marks-legend">Sağ alttaki işaret o sayfanın kimliği: ana sayfada senin logon, bir proje sayfasında o projenin işareti. "Currently" satırı örnek; içeriği senin.</p>
    </section>`;
}

render(DIRS.some((d) => d.id === location.hash.slice(1)) ? location.hash.slice(1) : "seven");
