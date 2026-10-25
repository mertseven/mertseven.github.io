import { loadCatalog, escapeHtml } from "/assets/js/catalog.js";

// Network identity, six variants. Each one is a small generative rule: the owner's logo is
// one fixed output of it, every project gets another output, unique across the catalogue.

const { projects } = await loadCatalog();
const SHOW = ["jstudio", "networkcanvas", "philosophical-networks", "critical-theory", "socrates", "ima-lab", "etkilesim-atlasi", "grad-projects", "icebreaker", "find-the-university", "visualizing-sep", "kafka"];

const hash = (s) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619) >>> 0; return h; };
const rng = (seed) => () => {
  seed = (seed + 0x6d2b79f5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};
const pick = (r, n) => Math.floor(r() * n);
const f = (n) => +n.toFixed(2);
const pt = ([x, y]) => `${f(x)},${f(y)}`;
const style = (p) => (p.kind === "Featured" ? "" : p.kind === "Teaching" ? "hollow" : "dashed");
const svg = (body) => `<svg viewBox="0 0 24 24" aria-hidden="true">${body}</svg>`;

// A drawn edge: pathLength 1 lets the card draw it on hover; dashed ones stay still.
const edge = (d, cls, i, w) => `<path class="e${cls === "dashed" ? " dashed" : ""}" pathLength="1" d="${d}" style="stroke-width:${w};animation-delay:${i * 120}ms"/>`;
const node = ([x, y], cls, r) => cls === "hollow"
  ? `<circle class="n hollow" cx="${f(x)}" cy="${f(y)}" r="${r}" style="stroke-width:0.9"/>`
  : `<circle class="n" cx="${f(x)}" cy="${f(y)}" r="${cls === "dashed" ? r * 0.75 : r}"/>`;
const ghost = ([x, y], r = 0.8) => `<circle class="g" cx="${f(x)}" cy="${f(y)}" r="${r}"/>`;
const symKey = (list) => { const a = list.join("-"), b = [...list].reverse().join("-"); return a < b ? a : b; };
const choose = (r, n, k) => { const s = new Set(); while (s.size < k) s.add(pick(r, n)); return [...s].sort((a, b) => a - b); };
const PAIRS = []; for (let i = 0; i < 7; i++) for (let j = i + 1; j < 7; j++) PAIRS.push([i, j]);

// ——— 1 · Grid path ———
const G3 = (i) => [4 + 8 * (i % 3), 4 + 8 * Math.floor(i / 3)];
const near3 = (i) => {
  const x = i % 3, y = Math.floor(i / 3), out = [];
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
    const nx = x + dx, ny = y + dy;
    if ((dx || dy) && nx >= 0 && ny >= 0 && nx < 3 && ny < 3) out.push(nx + 3 * ny);
  }
  return out;
};
const grid = {
  logo: [0, 2, 6],
  make(r) {
    for (;;) {
      const len = 3 + pick(r, 2), path = [pick(r, 9)];
      while (path.length <= len) {
        const opts = near3(path.at(-1)).filter((n) => !path.includes(n));
        if (!opts.length) break;
        path.push(opts[pick(r, opts.length)]);
      }
      if (path.length === len + 1) return path;
    }
  },
  key: symKey,
  draw(path, cls = "") {
    const w = cls === "" ? 1.9 : 1.1;
    const d = path.map((i, k) => `${k ? "L" : "M"}${pt(G3(i))}`).join(" ");
    return svg(Array.from({ length: 9 }, (_, i) => ghost(G3(i))).join("")
      + edge(d, cls, 0, w)
      + path.map((i, k) => node(G3(i), cls, k === 0 ? 2.5 : 1.5)).join(""));
  },
};

// ——— 2 · Metro ———
const M4 = ([x, y]) => [3 + 6 * x, 3 + 6 * y];
const DIR8 = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
const metro = {
  logo: [[0, 0], [3, 0], [1, 2], [1, 3]],
  make(r) {
    for (;;) {
      const p = [[pick(r, 4), pick(r, 4)]], seen = new Set([String(p[0])]);
      let dir = pick(r, 8), ok = true;
      const turns = 1 + pick(r, 2);
      for (let t = 0; t <= turns && ok; t++) {
        if (t) dir = (dir + (r() < 0.5 ? 1 : -1) * (1 + pick(r, 2)) + 8) % 8; // 45° or 90°
        let [x, y] = p.at(-1);
        for (let s = 0, len = 1 + pick(r, 2); s < len; s++) {
          x += DIR8[dir][0]; y += DIR8[dir][1];
          if (x < 0 || y < 0 || x > 3 || y > 3 || seen.has(`${x},${y}`)) { ok = false; break; }
          seen.add(`${x},${y}`);
        }
        if (ok) p.push([x, y]);
      }
      // Long enough to read as a line rather than a knot of two stations.
      if (ok && seen.size >= 5) return p;
    }
  },
  key: (p) => symKey(p.map(String)),
  draw(p, cls = "") {
    const w = cls === "" ? 3.2 : 1.9;
    const d = p.map((q, k) => `${k ? "L" : "M"}${pt(M4(q))}`).join(" ");
    const stop = (q) => { const [x, y] = M4(q); return `<circle class="st" cx="${x}" cy="${y}" r="2.3" style="stroke-width:${cls === "" ? 1.4 : 1}"/>`; };
    return svg(edge(d, cls, 0, w) + stop(p[0]) + stop(p.at(-1)));
  },
};

// ——— 3 · Hub ———
const RING = (i) => { const a = -Math.PI / 2 + (i * 2 * Math.PI) / 7; return [12 + Math.cos(a) * 9.5, 12 + Math.sin(a) * 9.5]; };
// Chords bow towards the centre, so the drawing reads as woven rather than as a star.
const arc = (a, b) => {
  const A = RING(a), B = RING(b), m = [(A[0] + B[0]) / 2, (A[1] + B[1]) / 2];
  const c = [12 + (m[0] - 12) * 0.5, 12 + (m[1] - 12) * 0.5];
  return `M${pt(A)} Q${pt(c)} ${pt(B)}`;
};
const hub = {
  logo: [8, 10], // 1–4 and 1–6: a top bar and a diagonal, the 7 drawn on the ring
  make: (r) => choose(r, PAIRS.length, 3 + pick(r, 2)),
  key: (s) => s.join("."),
  draw(s, cls = "") {
    const pairs = s.map((i) => PAIRS[i]);
    const deg = Array(7).fill(0);
    pairs.forEach(([a, b]) => { deg[a]++; deg[b]++; });
    const w = cls === "" ? 1.6 : 1;
    return svg(`<circle class="gl" cx="12" cy="12" r="9.5"/>`
      + pairs.map(([a, b], k) => edge(arc(a, b), cls, k, w)).join("")
      + deg.map((n, i) => (n ? node(RING(i), cls, Math.min(2.8, 1.2 + 0.4 * n)) : ghost(RING(i)))).join(""));
  },
};

// ——— 4 · Segment network ———
const N6 = [[5, 2.5], [17, 2.5], [5, 12], [17, 12], [5, 21.5], [17, 21.5]];
const E11 = [[0, 1], [1, 3], [3, 5], [4, 5], [2, 4], [0, 2], [2, 3], [0, 3], [1, 2], [2, 5], [3, 4]];
const segnet = {
  logo: [0, 1, 2],
  make(r) {
    for (;;) {
      const s = choose(r, E11.length, 3 + pick(r, 2));
      const diag = s.filter((i) => i >= 7).length;
      if (diag >= 1 && diag <= 2) return s;
    }
  },
  key: (s) => s.join("."),
  draw(s, cls = "") {
    const used = new Set(s.flatMap((i) => E11[i]));
    const w = cls === "" ? 2.2 : 1.2;
    const frame = E11.slice(0, 7).map(([a, b]) => `<path class="gl" d="M${pt(N6[a])} L${pt(N6[b])}"/>`).join("");
    const lit = s.map((i, k) => edge(`M${pt(N6[E11[i][0]])} L${pt(N6[E11[i][1]])}`, cls, k, w)).join("");
    const dots = N6.map((p, i) => (used.has(i) ? node(p, cls, 1.7) : ghost(p))).join("");
    return svg(`<g transform="skewX(-7) translate(1.5 0)">${frame}${lit}${dots}</g>`);
  },
};

// ——— 5 · Adjacency matrix ———
const S7 = 24 / 7;
const matrix = {
  logo: "logo",
  make: (r) => choose(r, PAIRS.length, 3 + pick(r, 2)),
  key: (s) => (s === "logo" ? s : s.join(".")),
  draw(s, cls = "") {
    const cells = s === "logo"
      ? [...Array.from({ length: 7 }, (_, j) => [0, j]), ...Array.from({ length: 6 }, (_, k) => [k + 1, 5 - k])]
      : s.flatMap((i) => [PAIRS[i], [PAIRS[i][1], PAIRS[i][0]]]).sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    const lit = new Set(cells.map(String));
    let body = "";
    for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) {
      if (!lit.has(`${i},${j}`)) body += ghost([j * S7 + S7 / 2, i * S7 + S7 / 2], i === j ? 0.55 : 0.35);
    }
    body += cells.map(([i, j], k) => {
      const x = j * S7 + 0.35, y = i * S7 + 0.35, z = S7 - 0.7, delay = `animation-delay:${k * 45}ms`;
      if (cls === "dashed") return `<circle class="px" cx="${f(x + z / 2)}" cy="${f(y + z / 2)}" r="1.1" style="${delay}"/>`;
      if (cls === "hollow") return `<rect class="px hollow" x="${f(x + 0.3)}" y="${f(y + 0.3)}" width="${f(z - 0.6)}" height="${f(z - 0.6)}" rx="0.5" style="${delay}"/>`;
      return `<rect class="px" x="${f(x)}" y="${f(y)}" width="${f(z)}" height="${f(z)}" rx="0.5" style="${delay}"/>`;
    }).join("");
    return svg(body);
  },
};

// ——— 6 · Three beams (after the MIT Media Lab's 2011 identity) ———
let clips = 0;
const beams = {
  logo: [[1, 1, 28, 34], [6, 0, 128, 30], [2, 6, 300, 38]],
  make: (r) => Array.from({ length: 3 }, () => [pick(r, 7), pick(r, 7), pick(r, 24) * 15, 22 + pick(r, 4) * 6]),
  key: (b) => b.map(String).sort().join("|"),
  draw(b, cls = "") {
    const id = `beam${++clips}`;
    const polys = b.map(([gx, gy, a, s], k) => {
      const o = [3 + 3 * gx, 3 + 3 * gy];
      const ray = (deg) => [o[0] + Math.cos((deg * Math.PI) / 180) * 40, o[1] + Math.sin((deg * Math.PI) / 180) * 40];
      const d = `M${pt(o)} L${pt(ray(a - s / 2))} L${pt(ray(a + s / 2))} Z`;
      return `<path class="px bm${cls ? ` ${cls}` : ""}" d="${d}" style="animation-delay:${k * 160}ms"/>`;
    }).join("");
    const dots = b.map(([gx, gy]) => node([3 + 3 * gx, 3 + 3 * gy], cls, 1.4)).join("");
    return svg(`<defs><clipPath id="${id}"><rect width="24" height="24" rx="3"/></clipPath></defs><g clip-path="url(#${id})">${polys}</g>${dots}`);
  },
};

const VARIANTS = [
  {
    gen: grid, name: "Izgara <em>yolu</em>",
    desc: "Dokuz düğümlük bir ızgarada tek bir yol. Logo, üst sıra boyunca gidip çapraz inen bir 7. Her proje komşu düğümlerden geçen 3–4 adımlık başka bir yol çiziyor; kalın nokta yolun başladığı yer.",
    good: ["Çok sade, 16 px'de net.", "Yıldız yok, tek bir hareket var: bir yerden bir yere gitmek.", "Çizilirken izlemesi güzel."],
    bad: ["Dokuz düğüm az; bazı yollar birbirine benziyor.", "Bir kilit ekranı desenini hatırlatabilir."],
  },
  {
    gen: metro, name: "<em>Metro</em>",
    desc: "Hat haritası dili: yalnızca yatay, dikey ve 45°. Logo, dirsekli bir 7 ve iki ucunda durak. Her proje kendi hattı; projeler bir arada bir şehir haritası gibi duruyor.",
    good: ["Kalın ve okunaklı; en iyi favicon.", "Yönlendirme, keşif, rota: site bir haritaya dönüşüyor.", "Metro ağı çağrışımı tanıdık ama kişisel hissediyor."],
    bad: ["Ağdan çok rotayı anlatıyor; bağlar değil yollar.", "İşaretler tek çizgi olduğu için ayırt edicilik çizgi biçiminde."],
  },
  {
    gen: hub, name: "<em>Halka</em>",
    desc: "Halkada yedi düğüm, yine. Ama logo yıldız değil: aynı halkanın üzerine iki yayla çizilmiş bir 7. Projeler aynı halkada 3–4 bağ kuruyor; çok bağlı düğüm büyüyor. Yaylar hafifçe kıvrıldığı için çizim keskin bir yıldız yerine dokunmuş bir ağ gibi duruyor.",
    good: ["Önceki ağ fikrine en yakın, ama yıldızsız.", "Halka hep aynı; içindeki çizim değişiyor: aile hissi güçlü.", "Düğüm büyüklüğü veri gibi okunuyor."],
    bad: ["Küçük boyutta yaylar birbirine karışabilir.", "Logo, projelerin yanında en sade olanı; daha az 'ağ' gibi duruyor."],
  },
  {
    gen: segnet, name: "Segment <em>ağı</em>",
    desc: "A ile C'nin birleşimi: yedi segmentli ekranın köşeleri düğüm, çubukları bağ. Logo yine yanan 7 (a, b, c). Projeler bu çerçevede çapraz bağlar da kurabiliyor, böylece rakam olmaktan çıkıp ağa dönüşüyor.",
    good: ["Adındaki 7 doğrudan okunuyor.", "Ağ fikri ile ekran fikri tek sistemde.", "Çerçeve hep aynı, bu yüzden aile hissi çok güçlü."],
    bad: ["Altı düğüm ve on bir bağ; çeşitlilik sınırlı (28 proje sığar ama sıkışık).", "İkisinin arasında kalıp ikisinden de zayıf olma riski."],
  },
  {
    gen: matrix, name: "Bağ <em>matrisi</em>",
    desc: "Ağı çizmek yerine tablosunu göstermek: 7×7 komşuluk matrisi. Logo, hücrelerle yazılmış bir 7. Projelerde her bağ iki hücre yakıyor, bu yüzden desenler köşegene göre simetrik; dokuma ya da bir halı motifi gibi.",
    good: ["En özgün ve en 'akademik' olanı: ağ bilimini bilen hemen tanır.", "Piksel dokusu ASCII okyanusuyla akraba.", "Üretken; desenler tekrarlamıyor."],
    bad: ["Ağ olduğunu bilmeyen için bir QR koduna benzeyebilir.", "16 px'de hücreler eriyor; favicon için sadeleştirmek gerekir."],
  },
  {
    gen: beams, name: "Üç <em>ışın</em>",
    desc: "MIT Media Lab'in 2011 kimliğine açık bir selam: aynı ızgaradan çıkan üç ışık huzmesi, kesiştikleri yerde koyulaşıyor. Her projenin üç ışını farklı.",
    good: ["Modülerlik hissi en güçlü olan.", "Işıklar üst üste binince tek renkle bile derinlik oluşuyor.", "Sahne ışığı: sinema perdesi duvarıyla uyumlu."],
    bad: ["Referansı fazla açık; kopya gibi okunabilir.", "Ağdan çok ışık anlatıyor.", "Küçükte ışınlar seçilemiyor."],
  },
];

// ——— Page ———

const list = SHOW.map((id) => projects.find((p) => p.id === id)).filter(Boolean);
document.getElementById("about").innerHTML = "<b>Ağ fikrinin altı türevi.</b> Hepsi aynı mantıkla çalışıyor: bir kural, kuralın sabit bir çıktısı senin logon, diğer çıktılar projelerin. Kartın üzerine gelince işaretler kendini çiziyor. Dolu: Featured · İnce: öğretim · Kesik: deney.";

document.getElementById("ag").innerHTML = VARIANTS.map((v, n) => {
  const used = new Set([v.gen.key(v.gen.logo)]);
  const of = new Map();
  for (const p of projects) {
    for (let k = 0; k < 800; k++) {
      const d = v.gen.make(rng(hash(p.id) + k * 7919));
      const key = v.gen.key(d);
      if (!used.has(key)) { used.add(key); of.set(p.id, d); break; }
    }
  }
  const logo = () => v.gen.draw(v.gen.logo);
  return `
    <article class="vc">
      <div class="vc-head"><span class="label">C${n + 1}</span><h2>${v.name}</h2></div>
      <p class="vc-desc">${v.desc}</p>
      <div class="vc-top">
        <div class="vc-hero">${logo()}</div>
        <div class="vc-side">
          <span class="lockup vc-lock">${logo()}<span>Mert <em>Seven</em></span></span>
          <div class="vc-favs">
            ${[48, 32, 16].map((s) => `<span class="fav-tile" style="width:${s}px;height:${s}px">${logo()}</span>`).join("")}
            <span class="vc-px">48 · 32 · 16 px</span>
          </div>
        </div>
      </div>
      <div class="vc-marks">
        ${list.map((p) => `<span class="vm" title="${escapeHtml(p.title)}">${v.gen.draw(of.get(p.id), style(p))}<span>${escapeHtml(p.title)}</span></span>`).join("")}
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
