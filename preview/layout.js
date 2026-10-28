// The tensor space put to work: fifteen ways to lay it out on a page (layout.html). Each
// layout is a real page built at its own size (1440×900, or 390×844 for the phone), shown
// scaled down in the gallery and at full size when opened, where it moves, answers the
// pointer, searches, filters and opens a library. The drawing style can be switched.

import { VARIANTS, ALL, focus, aim } from "./tensor.js";
import { lockup } from "./ima-mark.js";

const { LIBS, CATS } = ALL;
const CAT_KEYS = Object.keys(CATS);
const DPR = Math.min(2, devicePixelRatio || 1);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
const FIRST = LIBS.findIndex((l) => l.name === "D3.js");
const byStars = [...LIBS].sort((a, b) => b.stars - a.stars);

// The drawing styles a layout can be seen in (numbers as on tensor.html).
const STYLES = [0, 1, 3, 7, 14];
let style = 0;
try { style = +sessionStorage.getItem("layout-style") || 0; } catch {}
if (!STYLES.includes(style)) style = 0;

// ——— Pieces every layout is built from ———
const cv = (attrs = "") => `<div class="cv" ${attrs}><canvas></canvas><i class="ring" hidden></i></div>`;
const search = (ph = "Kütüphane ara…") => `<label class="u-search"><input type="search" placeholder="${ph}" autocomplete="off"></label>`;
const chips = (vertical = false) => `<div class="u-chips${vertical ? " is-v" : ""}">${CAT_KEYS.map((k) => `<button type="button" data-cat="${k}" style="--c:${CATS[k].color}"><i></i>${esc(CATS[k].label)}<u>${LIBS.filter((l) => l.cat === k).length}</u></button>`).join("")}</div>`;
const brand = (title = true) => `<div class="u-brand">${lockup("map")}${title ? `<b>Etkileşim Atlası</b>` : ""}</div>`;
const detail = (cls = "") => `<div class="u-detail ${cls}" data-detail></div>`;
const rows = (list = LIBS, cls = "") => `<ul class="u-rows ${cls}">${list.map((l) => `<li data-i="${l.i}"><i style="--c:${CATS[l.cat].color}"></i><b>${esc(l.name)}</b><span>${esc(CATS[l.cat].label)}</span><u>${l.year}</u></li>`).join("")}</ul>`;
const legend = () => `<div class="u-legend"><span><i class="lg-stem"></i>yıl: ipin boyu</span><span><i class="lg-floor"></i>zemin: t-SNE haritası</span><span><i class="lg-dot"></i>nokta: kütüphane</span></div>`;
function fillDetail(el, l) {
  el.innerHTML = `<p class="u-k"><i style="--c:${CATS[l.cat].color}"></i>${esc(CATS[l.cat].label)} · ${l.year}</p>
    <h3>${esc(l.name)}</h3><p class="u-tag">${esc(l.tag)}</p>
    <dl><div><dt>Lisans</dt><dd>${esc(l.lic)}</dd></div><div><dt>Boyut</dt><dd>${l.kb} kB</dd></div><div><dt>GitHub</dt><dd>${l.stars} bin</dd></div><div><dt>Demo</dt><dd>${l.live ? "canlı" : "—"}</dd></div></dl>
    <p class="u-acts"><a href="https://${esc(l.url)}" target="_blank" rel="noopener">${esc(l.url)} ↗</a></p>`;
}

// ——— The fifteen ———
const STEPS = [
  { t: "Zemin bir harita", p: "Kutunun tabanı t-SNE haritası: birbirine benzeyen kütüphaneler yan yana düşüyor, kalabalık yerler eş yükselti eğrileriyle tepe.", aim: { pitch: 0.12, spin: 0.02 } },
  { t: "Yükseklik zaman", p: "Her kütüphane, çıktığı yıl kadar yükselen bir ipe bağlı. Eskiler zemine yakın, yeniler tavanda.", aim: { pitch: 1.2, spin: 0.08 } },
  { t: "Bir küme: Kartografya", p: "Haritacılık kütüphaneleri haritanın bir köşesinde toplanıyor, ama yaşları 2006'dan 2021'e yayılıyor.", aim: { pitch: 1.0, spin: 0.1 }, focus: "geo" },
  { t: "Yeni dalga: 3B", p: "3B kütüphaneler ise çoğunlukla genç: tavana yakın, sıkışık bir bulut.", aim: { pitch: 0.95, spin: 0.1 }, focus: "3d" },
];
const SUBS = ["Zeminde benzerlik, yükseklikte zaman.", "Kartografya kümesi: on altı kütüphane, on beş yıl.", "Tavana yakın olanlar son beş yılın kütüphaneleri."];

export const LAYOUTS = [
  {
    id: "tam", name: "Tam sayfa, yüzen arayüz", note: "Sahne bütün ekran; arama, kümeler, açıklama ve seçilen kütüphanenin kartı üstünde yüzüyor. En sürükleyici, harita her şeyin önünde.",
    build: () => `<div class="L-tam">${cv()}
      <div class="fl fl-tl">${brand()}</div><div class="fl fl-tr">${search()}</div>
      <div class="fl fl-bl">${chips()}</div><div class="fl fl-br">${detail("is-card")}</div><div class="fl fl-bc">${legend()}</div></div>`,
  },
  {
    id: "sol", name: "Sol kenar çubuğu", note: "Bugünkü atlasın düzeni: solda sabit bir çubuk (arama, kümeler, tur), sağda sahne. Alışılmış, her şey tek bakışta.",
    build: () => `<div class="L-sol"><aside>${brand()}<p class="u-lead">162 kütüphane, zeminde benzerlik, yükseklikte zaman.</p>${search()}<p class="u-h">Kümeler</p>${chips(true)}<p class="u-h">Tur</p><ol class="u-tour">${STEPS.map((s) => `<li>${esc(s.t)}</li>`).join("")}</ol></aside>
      <main>${cv()}<div class="fl fl-br">${detail("is-card")}</div></main></div>`,
  },
  {
    id: "cekmece", name: "Üst çubuk, sağ çekmece", note: "İnce bir üst çubukta marka, arama ve kümeler; sahne geniş. Bir kütüphane seçince sağdan künye çekmecesi açılıyor.",
    build: () => `<div class="L-cekmece"><header>${brand()}${chips()}${search()}</header><main>${cv()}<aside>${detail()}</aside></main></div>`,
  },
  {
    id: "zaman", name: "Alt zaman çizelgesi", note: "Yükseklik zaten yıl; altta bir zaman çubuğu onu elle tutulur yapıyor. İki tutamak yıl aralığını seçiyor, kutu yalnız o dönemi gösteriyor.",
    build: () => `<div class="L-zaman"><header>${brand()}${search()}</header><main>${cv()}<div class="fl fl-tr">${detail("is-card")}</div></main>
      <footer><div class="u-hist">${Array.from({ length: 18 }, (_, k) => { const n = LIBS.filter((l) => l.year === 2006 + k).length; return `<span style="--h:${n}"><i></i><u>${k % 3 ? "" : 2006 + k}</u></span>`; }).join("")}</div>
      <div class="u-range"><input type="range" min="2006" max="2023" value="2006" data-y0><input type="range" min="2006" max="2023" value="2023" data-y1></div><p class="u-yr"><b data-yr>2006 – 2023</b> arası</p></footer></div>`,
  },
  {
    id: "liste", name: "Yan yana: sahne ve dizin", note: "Solda sahne, sağda bütün kütüphanelerin sıralı dizini. Satıra gelince noktası halkalanıyor, noktaya tıklayınca satırı açılıyor. Hem keşif hem başvuru.",
    build: () => `<div class="L-liste"><main>${brand()}${cv()}</main><aside>${search()}${chips()}${rows()}</aside></div>`,
  },
  {
    id: "serit", name: "Üstte sahne, altta kart şeridi", note: "Sahne üstte, altında yana kayan bir kart şeridi. Kartlar kütüphanenin kendisi; şerit kaydıkça seçilen nokta değişiyor. Galeri hissi.",
    build: () => `<div class="L-serit"><header>${brand()}${chips()}${search()}</header><main>${cv()}</main>
      <footer><div class="u-strip">${byStars.slice(0, 40).map((l) => `<article data-i="${l.i}" style="--c:${CATS[l.cat].color}"><i></i><b>${esc(l.name)}</b><span>${esc(l.tag)}</span><u>${esc(CATS[l.cat].label)} · ${l.year}</u></article>`).join("")}</div></footer></div>`,
  },
  {
    id: "anlati", name: "Kaydırmalı anlatı", note: "Solda metin adım adım akıyor, sağda sahne sabit kalıp her adımda kamerasını ve odağını değiştiriyor. Ders anlatımı ya da haber anlatımı için.", scroll: true,
    build: () => `<div class="L-anlati"><div class="st-text">${brand()}${STEPS.map((s, k) => `<section class="st" data-step="${k}"><p class="u-k">${k + 1} / ${STEPS.length}</p><h2>${esc(s.t)}</h2><p>${esc(s.p)}</p></section>`).join("")}<section class="st st-end"><h2>Şimdi sen gez.</h2><p>Atlası aç, istediğin kütüphaneye git.</p></section></div>
      <div class="st-stage">${cv(`data-aim='${JSON.stringify(STEPS[0].aim)}'`)}</div></div>`,
  },
  {
    id: "uzun", name: "Uzun sayfa: kapak ve bölümler", note: "Sahne bir kapak gibi en üstte; aşağı inince her küme kendi bölümü, kendi küçük kutusu ve listesiyle. Bir kitap ya da rapor gibi okunuyor.", scroll: true,
    build: () => `<div class="L-uzun"><section class="hero">${cv()}<div class="hero-t">${brand(false)}<h1>Etkileşim<br>Atlası</h1><p>İnteraktif medyayı mümkün kılan 162 JavaScript kütüphanesi; zeminde benzerlik, yükseklikte zaman.</p></div></section>
      ${CAT_KEYS.map((k, n) => `<section class="ch"><div><p class="u-k">Bölüm ${n + 1}</p><h2>${esc(CATS[k].label)}</h2><p>${esc(CATS[k].note)}</p>${rows(LIBS.filter((l) => l.cat === k), "is-cols")}</div>${cv(`data-focus="${k}"`)}</section>`).join("")}</div>`,
  },
  {
    id: "coklu", name: "Küçük çoklular", note: "On küme, on küçük kutu, aynı açıdan. Kümelerin şekli ve yaşı yan yana kıyaslanıyor; birine tıklayınca büyüyor.",
    build: () => `<div class="L-coklu"><header>${brand()}<p class="u-lead">Aynı kutu, on küme. Hangisi genç, hangisi dağınık?</p>${search()}</header>
      <main>${CAT_KEYS.map((k) => `<figure>${cv(`data-focus="${k}"`)}<figcaption style="--c:${CATS[k].color}"><i></i>${esc(CATS[k].label)} <u>${LIBS.filter((l) => l.cat === k).length}</u></figcaption></figure>`).join("")}</main></div>`,
  },
  {
    id: "pano", name: "Pano", note: "Sahne ortada, çevresinde küçük göstergeler: yıllara göre dağılım, küme büyüklükleri, en çok ilgi görenler, seçilen kütüphane. Veri odaklı bir kontrol odası.",
    build: () => {
      const max = Math.max(...CAT_KEYS.map((k) => LIBS.filter((l) => l.cat === k).length));
      return `<div class="L-pano"><header>${brand()}${search()}</header>
      <section class="w w-main">${cv()}</section>
      <section class="w w-yil"><p class="u-h">Yıllara göre</p><div class="u-hist">${Array.from({ length: 18 }, (_, k) => `<span style="--h:${LIBS.filter((l) => l.year === 2006 + k).length}"><i></i><u>${k % 4 ? "" : 2006 + k}</u></span>`).join("")}</div></section>
      <section class="w w-kume"><p class="u-h">Kümeler</p>${CAT_KEYS.map((k) => { const n = LIBS.filter((l) => l.cat === k).length; return `<div class="u-bar" data-cat="${k}"><span>${esc(CATS[k].label)}</span><i style="--w:${(n / max) * 100}%;--c:${CATS[k].color}"></i><u>${n}</u></div>`; }).join("")}</section>
      <section class="w w-top"><p class="u-h">En çok ilgi görenler</p>${rows(byStars.slice(0, 9))}</section>
      <section class="w w-sec"><p class="u-h">Seçili</p>${detail()}</section>
      <section class="w w-say"><p class="u-h">Sayılar</p><dl><div><dt>Kütüphane</dt><dd>162</dd></div><div><dt>Canlı demo</dt><dd>28</dd></div><div><dt>Küme</dt><dd>10</dd></div><div><dt>Eksen</dt><dd>13</dd></div></dl></section></div>`;
    },
  },
  {
    id: "dergi", name: "Dergi yayılımı", note: "Açık bir dergi: sahne iki sayfaya yayılan büyük bir görsel, kenarında sütun metin, altyazı ve sayfa numaraları. Basılı bir hissi var; ekranda da sakin.",
    build: () => `<div class="L-dergi"><div class="pg pg-l"><p class="u-k">Etkileşim Atlası · Sayı 1</p><h1>Bir kutunun içinde on yedi yıl</h1><p class="dek">İnteraktif medyanın 162 kütüphanesi: zeminde birbirine benzeyenler yan yana, yükseklikte doğdukları yıl.</p>
      <div class="cols"><p>Atlasın zemini t-SNE ile serilmiş bir harita. Her kütüphane on üç soruya verdiği cevaplarla bir noktaya dönüşüyor; benzer cevaplar veren kütüphaneler yan yana düşüyor.</p><p>Bu haritayı bir kutunun tabanına koyup her kütüphaneyi çıktığı yıl kadar yükseltince, zaman da görünür oluyor: haritacılık eski ve yaygın, 3B genç ve sıkışık.</p></div><p class="folio">12</p></div>
      <div class="spread">${cv()}<p class="u-cap"><b>Şekil 1.</b> Kutu, yukarıdan ve yandan. Her ip bir kütüphane; boyu yaşı.</p></div><p class="folio folio-r">13</p></div>`,
  },
  {
    id: "sinema", name: "Sinematik bant", note: "Geniş bir sinema kadrajı: üstte ve altta siyah bant, kamera kendi kendine dolaşıyor, altta altyazı gibi akan cümleler. Açılış ekranı ya da sergi için.",
    build: () => `<div class="L-sinema"><div class="bar-t"><span>${lockup("map")}</span><span class="mono">ETKİLEŞİM ATLASI · 162 · 2006–2023</span></div>${cv(`data-aim='{"spin":0.22,"pitch":1.15}'`)}<div class="bar-b"><p class="sub" data-sub>${esc(SUBS[0])}</p></div></div>`,
  },
  {
    id: "kusbakisi", name: "Kuşbakışı ve yakın plan", note: "Büyük sahnenin köşesinde kutunun tepeden görünüşü küçük bir harita gibi duruyor; ikisi aynı seçimi gösteriyor. Kaybolmadan döndürülebiliyor.",
    build: () => `<div class="L-kusbakisi"><header>${brand()}${chips()}${search()}</header><main>${cv()}
      <div class="fl fl-tl inset"><p class="u-h">Kuşbakışı</p>${cv(`data-aim='{"pitch":0.02,"spin":0,"yaw":0}'`)}</div><div class="fl fl-br">${detail("is-card")}</div></main></div>`,
  },
  {
    id: "telefon", name: "Telefon: alt sayfa", note: "Telefonda dik: kutu boyuna dönmüş ve yukarıdan bakıyor, altında çekilip büyütülebilen bir sayfada arama ve liste. Seçilen kütüphane sayfanın tepesine çıkıyor.", phone: true,
    build: () => `<div class="L-telefon"><header>${lockup("map")}<b>Atlas</b></header>${cv()}<div class="u-sheet"><i class="grab"></i>${detail("is-mini")}${search()}${chips()}${rows()}</div></div>`,
  },
  {
    id: "sunum", name: "Sunum modu", note: "Sınıfta perdeye yansıtmak için: iri başlık, büyük sahne, altta adım göstergesi; ok tuşlarıyla bir sonraki noktaya geçiliyor. Ders anlatırken kullanılan hâli.",
    build: () => `<div class="L-sunum"><div class="sn-t"><p class="u-k">NMED 3203 · Hafta 9</p><h1 data-sn-t>${esc(STEPS[1].t)}</h1><p data-sn-p>${esc(STEPS[1].p)}</p></div>${cv(`data-aim='${JSON.stringify(STEPS[1].aim)}'`)}
      <footer><span class="mono" data-sn-n>2 / ${STEPS.length}</span><div class="dots">${STEPS.map((_, k) => `<i${k === 1 ? ' class="on"' : ""}></i>`).join("")}</div><span class="mono">← → ile ilerle</span>${lockup("map")}</footer></div>`,
  },
];

// ——— Drawing one frame's canvases ———
function draw(frame, t, scale = 1) {
  const v = VARIANTS[style], st = frame._state;
  frame.classList.toggle("is-dark", !!v.dark);
  frame.querySelectorAll(".cv").forEach((c) => {
    const canvas = c.querySelector("canvas"), W = c.offsetWidth, H = c.offsetHeight;
    if (!W || !H) return;
    const px = DPR * scale;
    if (canvas.width !== Math.round(W * px) || canvas.height !== Math.round(H * px)) { canvas.width = Math.round(W * px); canvas.height = Math.round(H * px); c._S = {}; }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(px, 0, 0, px, 0, 0); ctx.clearRect(0, 0, W, H);
    const fk = c.dataset.focus;
    let set = st.match;
    if (fk) set = new Set(LIBS.filter((l) => l.cat === fk && (!st.match || st.match.has(l.i))).map((l) => l.i));
    focus(set); aim(c.dataset.aim ? JSON.parse(c.dataset.aim) : null);
    try { c._P = v.draw(ctx, W, H, t, c._S || (c._S = {})); } finally { focus(null); aim(null); }
    ring(c, st.sel);
  });
}
function ring(c, i) {
  const r = c.querySelector(".ring"), p = c._P && i >= 0 ? c._P[i] : null;
  r.hidden = !p;
  if (p) r.style.transform = `translate(${p[0].toFixed(1)}px, ${p[1].toFixed(1)}px)`;
}
function select(frame, i) {
  frame._state.sel = i;
  frame.querySelectorAll("[data-detail]").forEach((el) => fillDetail(el, LIBS[i]));
  frame.querySelectorAll("[data-i]").forEach((el) => el.classList.toggle("is-sel", +el.dataset.i === i));
  frame.querySelectorAll(".cv").forEach((c) => ring(c, i));
}
// Search, clusters and the year range all narrow the same set.
function refilter(frame) {
  const st = frame._state, q = st.query;
  const ok = (l) => !st.off.has(l.cat) && l.year >= st.y0 && l.year <= st.y1 && (!q || `${l.name} ${l.tag}`.toLocaleLowerCase("tr").includes(q));
  st.match = st.off.size || q || st.y0 > 2006 || st.y1 < 2023 ? new Set(LIBS.filter(ok).map((l) => l.i)) : null;
  frame.querySelectorAll("li[data-i], article[data-i]").forEach((el) => { el.hidden = !!st.match && !st.match.has(+el.dataset.i); });
  frame.querySelectorAll("[data-cat]").forEach((el) => el.classList.toggle("is-off", st.off.has(el.dataset.cat)));
  const yr = frame.querySelector("[data-yr]"); if (yr) yr.textContent = `${st.y0} – ${st.y1}`;
  if (!moving) draw(frame, 0);
}
function build(L, frame) {
  frame.className = `lf-frame${L.phone ? " is-phone" : ""}${L.scroll ? " is-scroll" : ""}`;
  frame.innerHTML = L.build();
  frame._state = { sel: FIRST, query: "", off: new Set(), y0: 2006, y1: 2023, match: null };
  frame.querySelectorAll("[data-detail]").forEach((el) => fillDetail(el, LIBS[FIRST]));
  frame.querySelectorAll(`[data-i="${FIRST}"]`).forEach((el) => el.classList.add("is-sel"));
}

// ——— Gallery ———
const grid = document.getElementById("grid");
grid.innerHTML = LAYOUTS.map((L, k) => `<button type="button" class="lf-card" data-k="${k}">
  <span class="lf-scale${L.phone ? " is-phone" : ""}"><span class="lf-frame"></span></span>
  <span class="lf-cap"><b><span class="mono">${String(k + 1).padStart(2, "0")}</span> ${esc(L.name)}</b><span>${esc(L.note)}</span></span></button>`).join("");
const cards = [...grid.querySelectorAll(".lf-card")].map((el, k) => ({ el, k, frame: el.querySelector(".lf-frame"), scale: el.querySelector(".lf-scale") }));
function sizeCard(c) {
  const L = LAYOUTS[c.k], fw = L.phone ? 390 : 1440, fh = L.phone ? 844 : 900;
  const box = c.scale.getBoundingClientRect().width, s = L.phone ? Math.min(box / fw, (box * 900 / 1440) / fh) : box / fw;
  c.frame.style.transform = `scale(${s})`;
  c.scale.style.height = `${(L.phone ? box * 900 / 1440 : fh * s).toFixed(1)}px`;
  if (L.phone) c.frame.style.left = `${((box - fw * s) / 2).toFixed(1)}px`;
  return s;
}
function renderCards() { cards.forEach((c) => { if (!c.frame._state) build(LAYOUTS[c.k], c.frame); const s = sizeCard(c); if (c.seen) draw(c.frame, 0, s); }); }
const io = new IntersectionObserver((es) => es.forEach((e) => { const c = cards.find((x) => x.el === e.target); if (e.isIntersecting && !c.seen) { c.seen = true; draw(c.frame, 0, sizeCard(c)); } }), { rootMargin: "300px" });
cards.forEach((c) => io.observe(c.el));
renderCards();
let rs = 0;
addEventListener("resize", () => { clearTimeout(rs); rs = setTimeout(() => { renderCards(); if (view.open) draw(big, 0); }, 150); });

// Style switch
const styleBar = document.getElementById("styles");
styleBar.innerHTML = `<div class="modes-row"><span class="label">Üslup</span>${STYLES.map((s) => `<button type="button" class="chip" data-style="${s}" aria-pressed="${s === style}">${String(s + 1).padStart(2, "0")} · ${esc(VARIANTS[s].name)}</button>`).join("")}</div>`;
styleBar.addEventListener("click", (e) => {
  const b = e.target.closest("[data-style]"); if (!b) return;
  style = +b.dataset.style;
  try { sessionStorage.setItem("layout-style", style); } catch {}
  styleBar.querySelectorAll("[data-style]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  cards.forEach((c) => { if (c.seen) draw(c.frame, 0, sizeCard(c)); });
  if (view.open) draw(big, 0);
});

// ——— Full view ———
const view = document.getElementById("view"), big = view.querySelector(".lv-frame"), tip = view.querySelector(".lv-tip");
let cur = 0, moving = false, raf = 0, t0 = 0;
function open(k) {
  cur = k;
  const L = LAYOUTS[k];
  build(L, big);
  view.querySelector(".lv-title").innerHTML = `<span class="mono">${String(k + 1).padStart(2, "0")} / ${LAYOUTS.length}</span> ${esc(L.name)}`;
  if (!view.open) view.showModal();
  big.scrollTop = 0;
  big.querySelectorAll(".L-telefon, .u-sheet").forEach((el) => { el.scrollTop = 0; });
  requestAnimationFrame(() => { fitBig(); draw(big, 0); wire(); start(); });
}
function fitBig() {
  const L = LAYOUTS[cur], host = view.querySelector(".lv-host"), r = host.getBoundingClientRect();
  if (L.phone) { const s = Math.min(1, (r.height - 24) / 844); big.style.transform = `scale(${s})`; big.style.left = `${(r.width - 390 * s) / 2}px`; big.style.top = "12px"; big.style.width = "390px"; big.style.height = "844px"; }
  else { big.style.transform = ""; big.style.left = "0"; big.style.top = "0"; big.style.width = `${r.width}px`; big.style.height = `${r.height}px`; }
}
function start() {
  cancelAnimationFrame(raf); moving = true; t0 = performance.now();
  const loop = (now) => {
    if (!view.open) { moving = false; return; }
    const t = (now - t0) / 1000;
    const sub = big.querySelector("[data-sub]");
    if (sub) { const n = Math.floor(t / 4) % SUBS.length; if (sub.dataset.n !== String(n)) { sub.dataset.n = n; sub.textContent = SUBS[n]; } }
    draw(big, t, LAYOUTS[cur].phone ? parseFloat(big.style.transform.slice(6)) || 1 : 1);
    raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
}
view.addEventListener("close", () => { moving = false; cancelAnimationFrame(raf); tip.hidden = true; });
view.querySelector(".lv-close").onclick = () => view.close();
view.querySelector(".lv-prev").onclick = () => open((cur + LAYOUTS.length - 1) % LAYOUTS.length);
view.querySelector(".lv-next").onclick = () => open((cur + 1) % LAYOUTS.length);
grid.addEventListener("click", (e) => { const el = e.target.closest(".lf-card"); if (el) open(+el.dataset.k); });

// Everything a layout answers to, wired fresh each time one opens.
function wire() {
  const st = big._state;
  big.querySelectorAll(".u-search input").forEach((inp) => inp.addEventListener("input", () => { st.query = inp.value.trim().toLocaleLowerCase("tr"); refilter(big); }));
  big.querySelectorAll("button[data-cat], .u-bar[data-cat]").forEach((b) => b.addEventListener("click", () => { const k = b.dataset.cat; st.off.has(k) ? st.off.delete(k) : st.off.add(k); refilter(big); }));
  const y0 = big.querySelector("[data-y0]"), y1 = big.querySelector("[data-y1]");
  if (y0) { const f = () => { st.y0 = Math.min(+y0.value, +y1.value); st.y1 = Math.max(+y0.value, +y1.value); refilter(big); }; y0.oninput = f; y1.oninput = f; }
  big.querySelectorAll("[data-i]").forEach((el) => {
    el.addEventListener("click", () => select(big, +el.dataset.i));
    el.addEventListener("pointerenter", () => big.querySelectorAll(".cv").forEach((c) => ring(c, +el.dataset.i)));
    el.addEventListener("pointerleave", () => big.querySelectorAll(".cv").forEach((c) => ring(c, st.sel)));
  });
  // Scrolling the strip picks the card nearest its middle.
  const strip = big.querySelector(".u-strip");
  if (strip) strip.addEventListener("scroll", () => { const mid = strip.scrollLeft + strip.clientWidth / 2; let best = null, bd = 1e9; strip.querySelectorAll("article:not([hidden])").forEach((a) => { const d = Math.abs(a.offsetLeft + a.offsetWidth / 2 - mid); if (d < bd) { bd = d; best = a; } }); if (best && +best.dataset.i !== st.sel) select(big, +best.dataset.i); }, { passive: true });
  // The scrolling story: each step aims the sticky stage.
  const steps = big.querySelectorAll(".st[data-step]");
  if (steps.length) {
    const stage = big.querySelector(".st-stage .cv");
    const so = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return;
      const s = STEPS[+e.target.dataset.step];
      stage.dataset.aim = JSON.stringify(s.aim);
      if (s.focus) stage.dataset.focus = s.focus; else delete stage.dataset.focus;
      steps.forEach((x) => x.classList.toggle("is-on", x === e.target));
    }), { root: big, threshold: 0.6 });
    steps.forEach((s) => so.observe(s));
  }
  // Pointer over any stage: nearest library.
  big.querySelectorAll(".cv").forEach((c) => {
    c.addEventListener("pointermove", (e) => {
      const r = c.getBoundingClientRect(), k = r.width / c.offsetWidth, x = (e.clientX - r.left) / k, y = (e.clientY - r.top) / k;
      let best = -1, bd = 16 * 16;
      (c._P || []).forEach((p, i) => { if (!p) return; const d = (p[0] - x) ** 2 + (p[1] - y) ** 2; if (d < bd) { bd = d; best = i; } });
      c._hover = best; c.style.cursor = best >= 0 ? "pointer" : "";
      if (best >= 0) { const l = LIBS[best]; tip.innerHTML = `<b>${esc(l.name)}</b><span>${esc(CATS[l.cat].label)} · ${l.year}</span>`; tip.hidden = false; tip.style.transform = `translate(${e.clientX + 14}px, ${e.clientY - 12}px)`; }
      else tip.hidden = true;
    });
    c.addEventListener("pointerleave", () => { tip.hidden = true; });
    c.addEventListener("click", () => { if (c._hover >= 0) select(big, c._hover); });
  });
}
// The presentation steps with the arrow keys; elsewhere arrows change layout.
view.addEventListener("keydown", (e) => {
  if (e.target.matches("input")) return;
  const sn = big.querySelector("[data-sn-t]");
  if (sn && (e.key === "ArrowRight" || e.key === "ArrowLeft")) {
    const n = (((+big.dataset.sn || 1) + (e.key === "ArrowRight" ? 1 : -1)) % STEPS.length + STEPS.length) % STEPS.length;
    big.dataset.sn = n; const s = STEPS[n], c = big.querySelector(".cv");
    sn.textContent = s.t; big.querySelector("[data-sn-p]").textContent = s.p; big.querySelector("[data-sn-n]").textContent = `${n + 1} / ${STEPS.length}`;
    big.querySelectorAll(".dots i").forEach((d, k) => d.classList.toggle("on", k === n));
    c.dataset.aim = JSON.stringify(s.aim); if (s.focus) c.dataset.focus = s.focus; else delete c.dataset.focus;
    e.preventDefault(); return;
  }
  if (e.key === "ArrowRight") open((cur + 1) % LAYOUTS.length);
  else if (e.key === "ArrowLeft") open((cur + LAYOUTS.length - 1) % LAYOUTS.length);
});
