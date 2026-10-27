// IMA umbrella preview: the lab's own arch mark, rebuilt as a family (lab., map., and a
// mark for the roof itself), and four ways to lay out the /ima/ page. Nothing under
// /ima/lab/ is touched; its font, mark and pictures are only read from here.

import { mark, lockup } from "./ima-mark.js";

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
