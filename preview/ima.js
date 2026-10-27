// IMA umbrella preview: the lab's own arch mark, rebuilt as a family (lab., map., and a
// mark for the roof itself), and four ways to lay out the /ima/ page. Nothing under
// /ima/lab/ is touched; its font, mark and pictures are only read from here.

const PETROL = "#286375";

// The lab mark's six tiles, in its own order: an arch corner, a filled square, an arch top;
// then a filled corner, a hatched square, a filled corner. Hatched tiles carry an outlined
// letter, filled tiles a paper one, exactly as in ima/lab/assets/brand/kemer-petrol.svg.
const TILES = [
  { x: 0, y: 0, d: "M21.6 0H48V48H0V21.6A21.6 21.6 0 0 1 21.6 0Z", fill: false },
  { x: 50.64, y: 0, d: "M0 0H48V48H0Z", fill: true },
  { x: 101.28, y: 0, d: "M0 24A24 24 0 0 1 48 24V48H0Z", fill: false },
  { x: 0, y: 50.64, d: "M0 0H48V48H21.6A21.6 21.6 0 0 1 0 26.4Z", fill: true },
  { x: 50.64, y: 50.64, d: "M0 0H48V48H0Z", fill: false },
  { x: 101.28, y: 50.64, d: "M0 0H48V26.4A21.6 21.6 0 0 1 26.4 48H0Z", fill: true },
];
// Glyphs from the mark (units of a 700-high cap), with their advance widths.
const GLYPH = {
  I: { w: 264, d: "M66 0V700H198V0Z" },
  M: { w: 882, d: "M66 0V700H311L432 90H450L571 700H816V0H688V603H670L550 0H332L212 603H194V0Z" },
  A: { w: 634, d: "M18 0 202 700H432L616 0H480L442 154H192L154 0ZM223 276H411L326 617H308Z" },
  L: { w: 542, d: "M66 0V700H198V120H518V0Z" },
  B: { w: 664, d: "M46 0V116H138V584H46V700H406Q470 700 517.5 678.5Q565 657 591.5 617.5Q618 578 618 523V513Q618 465 600.0 434.5Q582 404 557.5 387.5Q533 371 511 364V346Q533 340 559.0 323.5Q585 307 603.5 276.0Q622 245 622 195V185Q622 127 595.0 85.5Q568 44 520.5 22.0Q473 0 410 0ZM270 120H394Q437 120 463.5 141.0Q490 162 490 201V211Q490 250 464.0 271.0Q438 292 394 292H270ZM270 412H392Q433 412 459.5 433.0Q486 454 486 491V501Q486 539 460.0 559.5Q434 580 392 580H270Z" },
  // P is drawn here in the same manner as the mark's B: same stem, same bowl, cut short.
  P: { w: 664, d: "M66 0V700H404Q470 700 518.5 676.5Q567 653 593.5 610.5Q620 568 620 510V492Q620 434 593.5 391.5Q567 349 518.5 325.5Q470 302 404 302H198V0ZM198 418H392Q436 418 462.0 441.0Q488 464 488 505V511Q488 552 462.0 575.0Q436 598 392 598H198Z" },
  K: { w: 664, d: "M66 0V700H198V408H232L452 700H612L344 360L626 0H466L232 300H198V0Z" },
  T: { w: 600, d: "M234 0V580H28V700H572V580H366V0Z" },
};

let uid = 0;
// A mark from six letters, or from the top row alone (the roof).
function mark(letters, { rows = 2, color: given = PETROL, dim = false } = {}) {
  const id = `h${++uid}`;
  const color = dim ? "#a5adb1" : given; // a tool still to come is drawn in grey
  const h = rows === 2 ? 99.64 : 49;
  const tiles = TILES.slice(0, rows * 3).map((t, i) => {
    const g = GLYPH[letters[i]];
    const tx = (48 - g.w * 0.048) / 2;
    const glyph = t.fill
      ? `<path d="${g.d}" transform="translate(${tx.toFixed(3)} 40.8) scale(0.048 -0.048)" fill="white"/>`
      : `<path d="${g.d}" transform="translate(${tx.toFixed(3)} 40.8) scale(0.048 -0.048)" fill="${color}" stroke="white" stroke-width="52.08" stroke-linejoin="round" paint-order="stroke fill"/>`;
    return `<g transform="translate(${t.x} ${t.y})"><path d="${t.d}" fill="${t.fill ? color : `url(#${id}c)`}" stroke="${color}" stroke-width="0.86"/>${glyph}</g>`;
  }).join("");
  return `<svg class="ima-mk${dim ? " is-dim" : ""}" viewBox="-0.5 -0.5 150.28 ${h}" aria-hidden="true">
    <defs><pattern id="${id}h" width="3.36" height="3.36" patternUnits="userSpaceOnUse"><path d="M-1 1L1-1M0 3.36L3.36 0M2.36 4.36L4.36 2.36" fill="none" stroke="${color}" stroke-width="0.55"/></pattern>
    <pattern id="${id}c" width="7.3" height="7.3" patternUnits="userSpaceOnUse"><rect width="7.3" height="7.3" fill="white"/><rect width="7.3" height="7.3" fill="url(#${id}h)"/><path d="M-1 6.3L1 8.3M0 0L7.3 7.3M6.3-1L8.3 1" fill="none" stroke="${color}" stroke-width="0.55"/></pattern></defs>
    ${tiles}</svg>`;
}
const lockup = (suffix, opts = {}) => `<span class="ima-lock${opts.big ? " is-big" : ""}${opts.dim ? " is-dim" : ""}">${mark(suffix ? `IMA${suffix.toUpperCase()}` : "IMA", { rows: suffix ? 2 : 1, dim: opts.dim })}<span class="ima-type"><span class="ima-title">interactive media applications</span>${suffix ? `<span class="ima-suffix">${suffix}.</span>` : `<span class="ima-course">NMED 3203</span>`}</span></span>`;

// ——— Words, in both languages ———
const COPY = {
  en: {
    course: "A studio course on interaction: how media act back. Two places to work in: a lab of playable experiments, and a map of the libraries and newsroom works behind interactive media.",
    lab: "Eight playable experiments on agency, feedback, emergence and more.",
    map: "162 JavaScript libraries and 118 journalism works made with them, as a walkable atlas.",
    next: "Next term's tool.",
    enter: "Enter", soon: "Coming", term: "Fall 2026 · Yaşar University · Mert Seven, PhD",
    weeks: [["Week 1–4", "Lab: agency, feedback, rules, emergence"], ["Week 5–8", "Lab: time, chance, constraint, play"], ["Week 9–12", "Map: libraries, newsroom works, your own pavilion"], ["Week 13–14", "Final projects"]],
  },
  tr: {
    course: "Etkileşim üzerine bir atölye dersi: medyanın nasıl karşılık verdiği. Çalışacağın iki yer var: oynanabilir deneylerden oluşan bir laboratuvar ve etkileşimli medyanın arkasındaki kütüphanelerin ve habercilik işlerinin haritası.",
    lab: "Faillik, geri bildirim, beliriş ve daha fazlası üzerine sekiz oynanabilir deney.",
    map: "162 JavaScript kütüphanesi ve onlarla yapılmış 118 habercilik işi; içinde yürünebilen bir atlas.",
    next: "Gelecek dönemin aracı.",
    enter: "Gir", soon: "Yakında", term: "Güz 2026 · Yaşar Üniversitesi · Dr. Mert Seven",
    weeks: [["1–4. hafta", "Lab: faillik, geri bildirim, kurallar, beliriş"], ["5–8. hafta", "Lab: zaman, şans, kısıt, oyun"], ["9–12. hafta", "Map: kütüphaneler, habercilik işleri, kendi pavyonun"], ["13–14. hafta", "Final projeleri"]],
  },
};

const LAB_PIC = "/ima/lab/assets/footer/island-threshold.webp";
const MAP_PIC = "/assets/img/projects/etkilesim-atlasi.webp";

const LAYOUTS = {
  kapi: {
    label: "A · İki kapı",
    note: "Kemer markanın kendi şeklinden iki büyük kapı: lab. adaya, map. atlasa açılıyor. Kapının üzerine gelince içi aydınlanıyor. En sade ve en anlaşılır olanı.",
    html: (c) => `
      <section class="h-a">
        <header class="h-a-head">${lockup("", { big: true })}<p>${c.course}</p></header>
        <div class="h-a-doors">
          <a class="door" href="/ima/lab/"><span class="door-pic" style="background-image:url('${LAB_PIC}')"></span><span class="door-cap">${lockup("lab")}<span>${c.lab}</span><b>${c.enter} →</b></span></a>
          <a class="door" href="/etkilesim-atlas.html"><span class="door-pic is-map" style="background-image:url('${MAP_PIC}')"></span><span class="door-cap">${lockup("map")}<span>${c.map}</span><b>${c.enter} →</b></span></a>
        </div>
      </section>`,
  },
  kapak: {
    label: "B · Ders kapağı",
    note: "Bir ders kitabının kapağı gibi: büyük lockup, dersin tek paragraflık tarifi, dönem bilgisi, haftaların akışı ve araçlar rafı. Gelecek araç için soluk bir yer ayrılmış.",
    html: (c) => `
      <section class="h-b">
        <div class="h-b-cover">${lockup("", { big: true })}<p class="h-b-term">${c.term}</p><p class="h-b-course">${c.course}</p></div>
        <ol class="h-b-weeks">${c.weeks.map(([w, t]) => `<li><span>${w}</span><b>${t}</b></li>`).join("")}</ol>
        <div class="h-b-shelf">
          <a class="tool" href="/ima/lab/">${lockup("lab")}<span>${c.lab}</span></a>
          <a class="tool" href="/etkilesim-atlas.html">${lockup("map")}<span>${c.map}</span></a>
          <span class="tool is-next">${lockup("kit", { dim: true })}<span>${c.soon} · ${c.next}</span></span>
        </div>
      </section>`,
  },
  ikiye: {
    label: "C · Ada ve atlas",
    note: "Ekran ikiye bölünüyor: solda lab'in adası, sağda atlasın karanlık haritası, ortadaki dikişte çatı işareti. Bir tarafın üzerine gelince o taraf genişliyor. En sinematik olanı.",
    html: (c) => `
      <section class="h-c">
        <a class="half is-lab" href="/ima/lab/"><span class="half-pic" style="background-image:url('${LAB_PIC}')"></span><span class="half-cap">${lockup("lab")}<span>${c.lab}</span></span></a>
        <a class="half is-map" href="/etkilesim-atlas.html"><span class="half-pic" style="background-image:url('${MAP_PIC}')"></span><span class="half-cap">${lockup("map")}<span>${c.map}</span></span></a>
        <span class="h-c-seam">${mark("IMA", { rows: 1 })}</span>
      </section>`,
  },
  raf: {
    label: "D · Sözcükler",
    note: "Görsel yok, yalnızca markanın yazısı: dev 'lab.' ve 'map.' sözcükleri, yanlarında tek satır. Üzerine gelince sözcüğün yanında kendi işareti beliriyor. En tipografik ve en hızlı açılan.",
    html: (c) => `
      <section class="h-d">
        <header>${lockup("", {})}</header>
        <a class="word" href="/ima/lab/"><b>lab.</b><span>${c.lab}</span>${mark("IMALAB")}</a>
        <a class="word" href="/etkilesim-atlas.html"><b>map.</b><span>${c.map}</span>${mark("IMAMAP")}</a>
        <span class="word is-next"><b>kit.</b><span>${c.soon} · ${c.next}</span></span>
        <p class="h-d-course">${c.course}</p>
      </section>`,
  },
};

// ——— Page ———
const state = { layout: "kapi", lang: "tr" };
try { Object.assign(state, JSON.parse(sessionStorage.getItem("ima") || "{}")); } catch {}
const host = document.getElementById("hub");
const note = document.getElementById("note");

document.getElementById("family").innerHTML = `
  <div class="fam">
    <figure>${lockup("lab", { big: true })}<figcaption>Bugünkü lab. işareti, aynı kural yeniden çizildi</figcaption></figure>
    <figure>${lockup("map", { big: true })}<figcaption>map. aynı altı karo; alt sıra M · A · P</figcaption></figure>
    <figure>${lockup("", { big: true })}<figcaption>Çatı: yalnızca üst sıra, I · M · A, ve ders kodu</figcaption></figure>
    <figure>${lockup("kit", { big: true, dim: true })}<figcaption>Gelecekteki bir araç aynı kalıba oturur</figcaption></figure>
  </div>
  <div class="atlas-mock">
    <div class="atlas-side">${lockup("map")}<p class="atlas-k">T-35B GÖMÜLDÜ · N=162</p><h3>Etkileşim Atlası</h3><p>İnteraktif medyayı mümkün kılan JavaScript kütüphaneleri, elle değil özellik vektörlerinden serilmiş bir kart manzarası.</p></div>
    <div class="atlas-shot" style="background-image:url('${MAP_PIC}')"></div>
    <p class="atlas-note">Atlasın içinde: kenar çubuğunun en üstünde map. lockup'ı; atlasın kendi kâğıt/mürekkep dünyası olduğu gibi kalıyor.</p>
  </div>`;

function render() {
  const l = LAYOUTS[state.layout] ?? LAYOUTS.kapi;
  host.innerHTML = l.html(COPY[state.lang]);
  host.dataset.layout = state.layout;
  note.textContent = l.note;
  document.querySelectorAll("[data-k]").forEach((b) => b.setAttribute("aria-pressed", String(state[b.dataset.k] === b.dataset.v)));
  try { sessionStorage.setItem("ima", JSON.stringify(state)); } catch {}
}
document.getElementById("controls").innerHTML = `
  <div class="modes-row"><span class="label">Çatı</span>${Object.entries(LAYOUTS).map(([k, l]) => `<button type="button" class="chip" data-k="layout" data-v="${k}">${l.label}</button>`).join("")}</div>
  <div class="modes-row"><span class="label">Dil</span><button type="button" class="chip" data-k="lang" data-v="tr">Türkçe</button><button type="button" class="chip" data-k="lang" data-v="en">English</button></div>`;
document.getElementById("controls").addEventListener("click", (e) => {
  const b = e.target.closest("[data-k]");
  if (!b) return;
  state[b.dataset.k] = b.dataset.v;
  render();
});
render();
