import { escapeHtml } from "/assets/js/catalog.js";
import { PAPERS, f, me, dual, acts } from "/preview/papers.js";

// Research, five layouts with the same papers: a bibliography, the dissertation at the
// centre, an arc diagram of co-authors, journal cards and a reading room. The abstracts and
// citations come from the old page's publications.js; links prefer the catalogue's.

const lead = `<p class="label">Research</p><h1 class="rs-lead">Papers on how <em>knowledge</em> moves through networks, classrooms and screens.</h1>`;

const SCENES = [
  {
    id: "bib", label: "A · Bibliyografya",
    about: "<b>Yıllara göre bir liste, /work/ ile aynı dilde.</b> Satırın üzerine gelince başlık serif italik oluyor; tıklayınca özet açılıyor. Kendi adın kalın. Bir anahtar kelimeye tıklamak listeyi süzüyor. Atıf düğmesi APA kaynakçasını panoya kopyalıyor. En işlevsel ve en tanıdık yol.",
    html: () => `
      <section class="rs-a">
        ${lead}
        <p class="rs-filter" id="rs-filter"></p>
        ${[...new Set(PAPERS.map((p) => p.year))].map((y) => `
          <div class="rs-year" data-year="${y}"><span class="rs-y mono">${y}</span>
            <div>${PAPERS.map((p, i) => [p, i]).filter(([p]) => p.year === y).map(([p, i]) => `
              <details class="rs-row" data-kw="${escapeHtml(p.keywords.join("|"))}">
                <summary><span class="rs-t">${dual(escapeHtml(p.title))}</span>${p.phd ? `<span class="label rs-tag">PhD</span>` : ""}</summary>
                <p class="rs-by">${me(p.authors)}${p.venue ? ` · <span>${escapeHtml(p.venue)}</span>` : ""}</p>
                <p class="rs-abs">${escapeHtml(p.abstract)}</p>
                <p class="rs-kw">${p.keywords.map((k) => `<button type="button" data-kw="${escapeHtml(k)}">${escapeHtml(k)}</button>`).join("")}</p>
                ${acts(p, i)}
              </details>`).join("")}
            </div>
          </div>`).join("")}
      </section>`,
  },
  {
    id: "tez", label: "B · Tez merkezde",
    about: "<b>Doktora tezi sahnenin ortasında.</b> Başlığı, özeti, 608 katılımcı, tam metin, PDF ve görsel kitapçık. Altında diğer yayınlar kısa bir listede. Araştırma kimliğini tek bir büyük işle anlatıyor; ama yeni makaleler geldikçe tezin öne çıkması eskiyebilir.",
    html: () => {
      const t = PAPERS.find((p) => p.phd), rest = PAPERS.filter((p) => !p.phd);
      return `
      <section class="rs-b">
        <p class="label">Doctoral dissertation · ${t.year} · Ege University</p>
        <h1 class="rs-b-title">${escapeHtml(t.title.replace(/:.*/, ":"))} <em>${escapeHtml(t.title.replace(/^[^:]*:\s*/, ""))}</em></h1>
        <div class="rs-b-grid">
          <p class="rs-b-abs">${escapeHtml(t.abstract)}</p>
          <div class="rs-b-side">
            <p class="rs-b-num"><span>608</span> respondents</p>
            <p class="rs-kw">${t.keywords.map((k) => `<span>${escapeHtml(k)}</span>`).join("")}</p>
            <p class="rs-b-links"><a href="${escapeHtml(t.pdf)}" target="_blank" rel="noopener">Full text, YÖK ↗</a><a href="/Seven_Tez.pdf">Dissertation (PDF) ↓</a><a href="/Seven_VP.pdf">Visual booklet (PDF) ↓</a></p>
          </div>
        </div>
        <h2 class="label rs-b-h">Papers</h2>
        <ol class="rs-b-list">${rest.map((p) => `<li><span class="mono">${p.year}</span><a href="${escapeHtml(p.link || "#")}">${escapeHtml(p.title)}</a><span class="rs-by">${me(p.authors)}</span></li>`).join("")}</ol>
      </section>`;
    },
  },
  {
    id: "yay", label: "C · Yay ağı",
    about: "<b>Ağları çalışan birinin yayın listesi bir ağ olmalı.</b> Yayınlar soldan sağa zamanda dizili; ortak yazarlar onları kemerlerle bağlıyor. Bir yazarın üzerine gelince onunla yazılan her şey yanıyor; bir yayına tıklayınca kartı açılıyor. En özgün ve en 'sen' olanı; ama listenin kendisi altta kalıyor.",
    html: () => {
      const chron = [...PAPERS].reverse();
      const W = 1000, X = (i) => 60 + (i * (W - 120)) / (chron.length - 1), BASE = 250;
      const co = new Map();
      chron.forEach((p, i) => p.authors.split(/\.,\s*/).map((a) => `${a.replace(/\.$/, "").replace(/^&\s*/, "").trim()}.`).filter((a) => !a.startsWith("Seven")).forEach((a) => { if (!co.has(a)) co.set(a, []); co.get(a).push(i); }));
      const arcs = [];
      for (const [a, list] of co) for (let k = 1; k < list.length; k++) arcs.push([a, list[k - 1], list[k]]);
      const names = [...co.keys()];
      return `
      <section class="rs-c">
        ${lead}
        <div class="rs-c-wrap">
          <svg class="rs-c-svg" viewBox="0 0 ${W} 330" aria-label="Papers in time, linked by co-authors">
            <line class="rs-c-base" x1="30" y1="${BASE}" x2="${W - 30}" y2="${BASE}"/>
            ${(() => {
              // Co-authors who share the same two papers get nested arcs, not one on top of another.
              const seen = new Map();
              return arcs.map(([a, i, j]) => {
                const k = seen.get(`${i}-${j}`) ?? 0;
                seen.set(`${i}-${j}`, k + 1);
                const r = (X(j) - X(i)) / 2, ry = Math.min(r, 200) * (1 - 0.18 * k);
                return `<path class="rs-arc" data-a="${escapeHtml(a)}" d="M${X(i)},${BASE} A${r},${f(ry)} 0 0 1 ${X(j)},${BASE}"/>`;
              }).join("");
            })()}
            ${chron.map((p, i) => `<g class="rs-node" data-i="${PAPERS.indexOf(p)}" tabindex="0"><circle cx="${X(i)}" cy="${BASE}" r="${p.phd ? 9 : 6}"/><text x="${X(i)}" y="${BASE + 30}" text-anchor="middle">${p.year}</text></g>`).join("")}
          </svg>
          <p class="rs-c-names">${names.map((a) => `<button type="button" data-a="${escapeHtml(a)}">${escapeHtml(a)} <span class="mono">${co.get(a).length}</span></button>`).join("")}</p>
          <div class="rs-c-card" id="rs-card"><p class="rs-c-hint">Pick a paper on the line, or a co-author above it.</p></div>
        </div>
      </section>`;
    },
  },
  {
    id: "kart", label: "D · Dergi kartları",
    about: "<b>Her yayın bir dergi sayısı gibi.</b> Kartın üstünde yıl ve yayın yeri, ortada büyük ince harflerle başlık, altta anahtar kelimeler. Üzerine gelince kart dönüp özeti gösteriyor. Görsel ve baskı hissi güçlü; ama uzun başlıklar kartları kalabalıklaştırıyor.",
    html: () => `
      <section class="rs-d">
        ${lead}
        <div class="rs-d-grid">${PAPERS.map((p, i) => `
          <article class="rs-d-card${p.phd ? " is-phd" : ""}" tabindex="0">
            <div class="rs-d-face">
              <p class="rs-d-top"><span class="mono">${p.year}</span><span class="label">${p.phd ? "Dissertation" : escapeHtml(p.venue.split(/[,.(]/)[0] || "Paper")}</span></p>
              <h2>${escapeHtml(p.title)}</h2>
              <p class="rs-d-kw">${p.keywords.map(escapeHtml).join(" · ")}</p>
            </div>
            <div class="rs-d-back"><p>${escapeHtml(p.abstract)}</p>${acts(p, i)}</div>
          </article>`).join("")}
        </div>
      </section>`,
  },
  {
    id: "oda", label: "E · Okuma odası",
    about: "<b>Bir okuma odası.</b> Solda başlıklar, sağda seçilen yayının hepsi: yazarlar, yayın yeri, özet, anahtar kelimeler, kaynakça ve bağlantılar. ↑ ↓ ile gezilir. Özetleri okumak isteyen için en iyisi; mobilde tek sütuna iniyor.",
    html: () => `
      <section class="rs-e">
        ${lead}
        <div class="rs-e-grid">
          <ol class="rs-e-list" id="rs-list">${PAPERS.map((p, i) => `<li><button type="button" data-i="${i}"><span class="mono">${p.year}</span><span>${escapeHtml(p.title)}</span></button></li>`).join("")}</ol>
          <article class="rs-e-read" id="rs-read"></article>
        </div>
      </section>`,
  },
];

// A paper in full, for the reading room and the arc diagram's card.
const full = (p) => {
  const i = PAPERS.indexOf(p);
  return `
    <p class="rs-e-meta"><span class="mono">${p.year}</span>${p.phd ? ` <span class="label">PhD</span>` : ""}</p>
    <h2>${escapeHtml(p.title)}</h2>
    <p class="rs-by">${me(p.authors)}${p.venue ? `<br><span>${escapeHtml(p.venue)}</span>` : ""}</p>
    <p class="rs-abs">${escapeHtml(p.abstract)}</p>
    <p class="rs-kw">${p.keywords.map((k) => `<span>${escapeHtml(k)}</span>`).join("")}</p>
    ${p.cite ? `<blockquote class="rs-cite-box">${escapeHtml(p.cite)}</blockquote>` : ""}
    ${acts(p, i)}`;
};

// ——— Page ———

const host = document.getElementById("research");
const note = document.getElementById("about");
const row = document.createElement("div");
row.className = "modes-row";
for (const s of SCENES) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "chip";
  b.textContent = s.label;
  b.dataset.id = s.id;
  b.addEventListener("click", () => show(s.id));
  row.append(b);
}
document.getElementById("modes").append(row);

let filter = "";
function applyFilter() {
  const bar = host.querySelector("#rs-filter");
  if (!bar) return;
  let n = 0;
  host.querySelectorAll(".rs-row").forEach((r) => { const on = !filter || r.dataset.kw.split("|").includes(filter); r.hidden = !on; n += on; });
  host.querySelectorAll(".rs-year").forEach((y) => { y.hidden = !y.querySelector(".rs-row:not([hidden])"); });
  bar.innerHTML = filter
    ? `<span class="mono">${n}</span> of ${PAPERS.length} papers on <button type="button" class="rs-clear">${escapeHtml(filter)} ×</button>`
    : `<span class="mono">${PAPERS.length}</span> papers, newest first. Click a keyword to see its neighbours.`;
}

function read(i) {
  const el = host.querySelector("#rs-read");
  if (!el) return;
  el.innerHTML = full(PAPERS[i]);
  host.querySelectorAll("#rs-list button").forEach((b) => b.setAttribute("aria-current", String(Number(b.dataset.i) === i)));
}

function show(id) {
  const s = SCENES.find((x) => x.id === id) ?? SCENES[0];
  history.replaceState(null, "", `#${s.id}`);
  row.querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.id === s.id)));
  note.innerHTML = s.about;
  host.innerHTML = s.html();
  host.dataset.scene = s.id;
  filter = "";
  applyFilter();
  read(0);
}

host.addEventListener("click", async (e) => {
  const c = e.target.closest(".rs-cite");
  if (c) {
    try { await navigator.clipboard.writeText(PAPERS[c.dataset.i].cite); c.textContent = "Copied"; } catch { c.textContent = "Select and copy"; }
    setTimeout(() => { c.textContent = "Cite"; }, 1600);
    return;
  }
  const kw = e.target.closest(".rs-kw button");
  if (kw) { filter = filter === kw.dataset.kw ? "" : kw.dataset.kw; applyFilter(); return; }
  if (e.target.closest(".rs-clear")) { filter = ""; applyFilter(); return; }
  const r = e.target.closest("#rs-list button");
  if (r) { read(Number(r.dataset.i)); return; }
  const node = e.target.closest(".rs-node");
  if (node) { host.querySelector("#rs-card").innerHTML = full(PAPERS[node.dataset.i]); host.querySelectorAll(".rs-node").forEach((n) => n.classList.toggle("on", n === node)); }
});
host.addEventListener("keydown", (e) => {
  if (host.dataset.scene !== "oda" || !["ArrowDown", "ArrowUp"].includes(e.key)) return;
  const cur = Number(host.querySelector('#rs-list [aria-current="true"]')?.dataset.i ?? 0);
  const next = (cur + (e.key === "ArrowDown" ? 1 : -1) + PAPERS.length) % PAPERS.length;
  e.preventDefault();
  read(next);
  host.querySelector(`#rs-list [data-i="${next}"]`).focus();
});
// Co-authors light up their arcs.
host.addEventListener("pointerover", (e) => {
  const a = e.target.closest("[data-a]")?.dataset.a ?? null;
  host.querySelectorAll(".rs-arc").forEach((p) => p.classList.toggle("on", p.dataset.a === a));
  host.querySelectorAll(".rs-c-names button").forEach((b) => b.classList.toggle("on", b.dataset.a === a));
});

for (const b of document.querySelectorAll("[data-theme-set]")) {
  b.addEventListener("click", () => {
    document.documentElement.dataset.theme = b.dataset.themeSet;
    document.querySelectorAll("[data-theme-set]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  });
}

show(location.hash.slice(1));
