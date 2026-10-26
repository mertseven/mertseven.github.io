import { escapeHtml } from "/assets/js/catalog.js";
import { PAPERS, me, acts } from "/preview/papers.js";

// The reading room, five ways: the classic two panes, a margin index, a strip of years,
// an open book and one long read with an index that follows the scroll. ↑ ↓ or ← → walk
// through the papers in every one of them.

const pad = (i) => String(i + 1).padStart(2, "0");
const total = pad(PAPERS.length - 1);

// The pieces of one paper, arranged differently by each room.
const P = {
  meta: (p, i) => `<p class="od-meta"><span class="mono">${pad(i)} / ${total}</span><span class="mono">${p.year}</span>${p.phd ? `<span class="label">PhD</span>` : ""}</p>`,
  title: (p, cls = "od-title") => `<h2 class="${cls}">${escapeHtml(p.title)}</h2>`,
  by: (p) => `<p class="od-by"><span class="od-au">${me(p.authors)}</span>${p.venue ? `<span>${escapeHtml(p.venue)}</span>` : ""}</p>`,
  abs: (p) => `<p class="od-abs">${escapeHtml(p.abstract)}</p>`,
  kw: (p) => `<p class="od-kw">${p.keywords.map((k) => `<span>${escapeHtml(k)}</span>`).join("")}</p>`,
  cite: (p) => (p.cite ? `<blockquote class="od-cite">${escapeHtml(p.cite)}</blockquote>` : ""),
  acts: (p, i) => acts(p, i),
};
const all = (p, i) => P.meta(p, i) + P.title(p) + P.by(p) + P.abs(p) + P.kw(p) + P.cite(p) + P.acts(p, i);

const ROOMS = [
  {
    id: "klasik", label: "1 · Klasik",
    about: "<b>Başlangıç noktası.</b> Solda yıl ve başlık listesi, sağda seçilen yayının tamamı. Seçili başlık serif italik. Sağ panel kaydırırken yerinde kalıyor.",
    html: () => `
      <div class="od-1">
        <ol class="od-list">${PAPERS.map((p, i) => `<li><button type="button" data-i="${i}"><span class="mono">${p.year}</span><span>${escapeHtml(p.title)}</span></button></li>`).join("")}</ol>
        <article class="od-read" data-read></article>
      </div>`,
    read: all,
  },
  {
    id: "kenar", label: "2 · Kenar dizini",
    about: "<b>Okunan metin büyük, dizin kenarda.</b> Yayın sayfanın neredeyse tamamını alıyor; sağ kenarda yalnızca numaralar ve yıllar. Bir numaranın üzerine gelince başlığı açılıyor. Bir kitabın kenar notları gibi; okumaya en çok yer bırakan.",
    html: () => `
      <div class="od-2">
        <article class="od-read" data-read></article>
        <ol class="od-rail">${PAPERS.map((p, i) => `<li><button type="button" data-i="${i}"><span class="mono">${pad(i)}</span><span class="od-rail-y mono">${p.year}</span><span class="od-rail-t">${escapeHtml(p.title)}</span></button></li>`).join("")}</ol>
      </div>`,
    read: (p, i) => P.meta(p, i) + P.title(p, "od-title od-title--big") + P.by(p) + `<div class="od-2-cols"><div>${P.abs(p)}${P.kw(p)}</div><div>${P.cite(p)}${P.acts(p, i)}</div></div>`,
  },
  {
    id: "serit", label: "3 · Yıl şeridi",
    about: "<b>Üstte bir zaman şeridi.</b> Yayınlar soldan sağa yıllarıyla dizili küçük sekmeler; altında okuma iki sütunda: solda başlık ve yazarlar, sağda özet ve kaynakça. ← → ile gezilir. Zamanı görünür kılıyor; mobilde şerit yana kayıyor.",
    html: () => `
      <div class="od-3">
        <ol class="od-strip">${[...PAPERS].reverse().map((p) => { const i = PAPERS.indexOf(p); return `<li><button type="button" data-i="${i}"><span class="mono">${p.year}</span><span>${escapeHtml(p.title.split(/[:.]/)[0])}</span></button></li>`; }).join("")}</ol>
        <article class="od-read" data-read></article>
      </div>`,
    read: (p, i) => `<div class="od-3-cols"><div>${P.meta(p, i)}${P.title(p, "od-title od-title--big")}${P.by(p)}${P.acts(p, i)}</div><div>${P.abs(p)}${P.kw(p)}${P.cite(p)}</div></div>`,
  },
  {
    id: "kitap", label: "4 · Açık kitap",
    about: "<b>Bir kitap açık duruyor.</b> Sol sayfada başlık, yazarlar ve yayın yeri; sağ sayfada özet, anahtar kelimeler ve kaynakça. Altta sayfa numarası ve noktalar; ← → sayfa çeviriyor. En sakin ve en 'okuma' hissi veren; ama listenin tamamı bir bakışta görünmüyor.",
    html: () => `
      <div class="od-4">
        <article class="od-book" data-read></article>
        <nav class="od-pager"><button type="button" data-step="-1" aria-label="Previous">←</button><span class="od-dots">${PAPERS.map((p, i) => `<button type="button" data-i="${i}" aria-label="${escapeHtml(p.title)}"></button>`).join("")}</span><button type="button" data-step="1" aria-label="Next">→</button></nav>
      </div>`,
    read: (p, i) => `<div class="od-page">${P.meta(p, i)}${P.title(p, "od-title od-title--big")}${P.by(p)}${P.acts(p, i)}</div><div class="od-page">${P.abs(p)}${P.kw(p)}${P.cite(p)}</div>`,
  },
  {
    id: "akis", label: "5 · Akış",
    about: "<b>Bütün yayınlar tek bir uzun okuma.</b> Hepsi alt alta açık; solda yapışık bir dizin, okuduğun yayını kendiliğinden işaretliyor. Dizinden bir başlığa tıklayınca oraya kayıyor. Hiçbir şey gizli değil; en çok kaydırma isteyen.",
    html: () => `
      <div class="od-5">
        <ol class="od-list od-list--sticky">${PAPERS.map((p, i) => `<li><button type="button" data-i="${i}"><span class="mono">${p.year}</span><span>${escapeHtml(p.title)}</span></button></li>`).join("")}</ol>
        <div class="od-flow">${PAPERS.map((p, i) => `<article class="od-read" id="paper-${i}" data-i="${i}">${all(p, i)}</article>`).join("")}</div>
      </div>`,
  },
];

// ——— Page ———

const host = document.getElementById("oda");
const note = document.getElementById("about");
const row = document.createElement("div");
row.className = "modes-row";
for (const r of ROOMS) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "chip";
  b.textContent = r.label;
  b.dataset.id = r.id;
  b.addEventListener("click", () => show(r.id));
  row.append(b);
}
document.getElementById("modes").append(row);

let room = ROOMS[0];
let at = 0;
let spy = null;

function go(i, from) {
  at = (i + PAPERS.length) % PAPERS.length;
  if (room.id === "akis") {
    if (from !== "spy") document.getElementById(`paper-${at}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  } else {
    const el = host.querySelector("[data-read]");
    el.innerHTML = room.read(PAPERS[at], at);
    el.animate?.([{ opacity: 0, transform: "translateY(6px)" }, { opacity: 1, transform: "none" }], { duration: 260, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
  }
  host.querySelectorAll("[data-i]").forEach((b) => { if (b.tagName === "BUTTON") b.setAttribute("aria-current", String(Number(b.dataset.i) === at)); });
  host.querySelector(`.od-strip [data-i="${at}"]`)?.scrollIntoView({ inline: "center", block: "nearest", behavior: "smooth" });
}

function show(id) {
  room = ROOMS.find((r) => r.id === id) ?? ROOMS[0];
  history.replaceState(null, "", `#${room.id}`);
  row.querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.id === room.id)));
  note.innerHTML = room.about;
  host.innerHTML = room.html();
  host.dataset.room = room.id;
  spy?.disconnect();
  if (room.id === "akis") {
    // The index marks the paper whose top has most recently passed the middle of the window.
    spy = new IntersectionObserver((list) => {
      for (const e of list) if (e.isIntersecting) go(Number(e.target.dataset.i), "spy");
    }, { rootMargin: "-45% 0px -50% 0px" });
    host.querySelectorAll(".od-flow .od-read").forEach((a) => spy.observe(a));
  }
  go(at, "spy");
}

host.addEventListener("click", async (e) => {
  const c = e.target.closest(".rs-cite");
  if (c) {
    try { await navigator.clipboard.writeText(PAPERS[c.dataset.i].cite); c.textContent = "Copied"; } catch { c.textContent = "Select and copy"; }
    setTimeout(() => { c.textContent = "Cite"; }, 1600);
    return;
  }
  const s = e.target.closest("[data-step]");
  if (s) return go(at + Number(s.dataset.step));
  const b = e.target.closest("button[data-i]");
  if (b) go(Number(b.dataset.i));
});
document.addEventListener("keydown", (e) => {
  if (e.target.closest?.("input, textarea")) return;
  const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
  if (!d) return;
  e.preventDefault();
  go(at + d);
});

for (const b of document.querySelectorAll("[data-theme-set]")) {
  b.addEventListener("click", () => {
    document.documentElement.dataset.theme = b.dataset.themeSet;
    document.querySelectorAll("[data-theme-set]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  });
}

show(location.hash.slice(1));
