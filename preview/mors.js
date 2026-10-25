import { loadCatalog, escapeHtml } from "/assets/js/catalog.js";
import { OWNER, makeCodes } from "/preview/codes.js";

// Equal bars as a code. Every bar on this page has the same length and weight; what
// changes is only where a bar sits and which way it turns. Four ways to write with it,
// each one a real cipher (it can be read back) that also looks like something.

const { projects } = await loadCatalog();
const SHOW = ["jstudio", "networkcanvas", "philosophical-networks", "critical-theory", "socrates", "ima-lab", "etkilesim-atlasi", "grad-projects", "icebreaker", "find-the-university", "visualizing-sep", "kafka"];
const { mixed: CODE } = makeCodes(projects);

const L = 4.2;   // bar length, the same everywhere
const W = 1.4;   // bar weight
const PX = 3.4;  // pixels per unit, the same for every mark on the page
const f = (n) => +n.toFixed(2);
const kindState = (p) => (p.kind === "Featured" ? "" : p.kind === "Teaching" ? "thin" : "dots");

// One bar, centred on (cx, cy), turned by `a` degrees (0 is horizontal). Filled for
// Featured, an outline for teaching, three beads for experiments.
function bar(cx, cy, a, st = "") {
  const t = `transform="translate(${f(cx)} ${f(cy)}) rotate(${a})"`;
  if (st === "dots") {
    const q = 1.1;
    return `<g ${t}>${[-1.55, 0, 1.55].map((x) => `<rect class="bd" x="${f(x - q / 2)}" y="${f(-q / 2)}" width="${q}" height="${q}"/>`).join("")}</g>`;
  }
  return `<rect class="cb${st ? ` ${st}` : ""}" x="${-L / 2}" y="${-W / 2}" width="${L}" height="${W}" ${t}/>`;
}
const svg = (vb, w, h, body) => `<svg viewBox="${vb}" width="${f(w * PX)}" height="${f(h * PX)}" aria-hidden="true">${body}</svg>`;

// ——— Morse ———

const MORSE = {
  a: ".-", b: "-...", c: "-.-.", d: "-..", e: ".", f: "..-.", g: "--.", h: "....", i: "..", j: ".---", k: "-.-", l: ".-..", m: "--",
  n: "-.", o: "---", p: ".--.", q: "--.-", r: ".-.", s: "...", t: "-", u: "..-", v: "...-", w: ".--", x: "-..-", y: "-.--", z: "--..",
};
// A dot stands up, a dash lies down: one bar, two directions.
const angleOf = (sym) => (sym === "." ? 90 : 0);
// The code as a run of cells: a symbol per cell, an empty cell between letters.
const cells = (word) => [...word].flatMap((ch, i) => [...(i ? [null] : []), ...MORSE[ch]]);

// 1 · Woven: the run fills a square of cells in reading order, like a mat. As in a kilim,
// the motif repeats until the square is full, one empty cell between repeats.
const HN = 4, HS = 6;
const repeat = (word) => {
  const one = cells(word), run = [];
  while (run.length < HN * HN) run.push(...(run.length ? [null] : []), ...one);
  return run.slice(0, HN * HN);
};
function woven(word, st = "") {
  const run = repeat(word);
  let body = "";
  for (let i = 0; i < HN * HN; i++) {
    const cx = HS / 2 + (i % HN) * HS, cy = HS / 2 + Math.floor(i / HN) * HS;
    body += run[i] ? bar(cx, cy, angleOf(run[i]), st) : `<circle class="g" cx="${cx}" cy="${cy}" r="0.4"/>`;
  }
  return svg("0 0 24 24", 24, 24, body);
}

// 2 · Skyline: each letter is a column, its symbols stacked from the top down and the
// columns standing on one ground line.
function skyline(word, st = "") {
  const gap = 1.5, cols = [...word];
  const w = cols.length * HS + (cols.length - 1) * gap;
  let body = `<line class="ground" x1="0" y1="24" x2="${w}" y2="24"/>`;
  cols.forEach((ch, c) => {
    const m = MORSE[ch], x = HS / 2 + c * (HS + gap);
    [...m].forEach((sym, k) => { body += bar(x, 24 - (m.length - k) * HS + HS / 2, angleOf(sym), st); });
  });
  return svg(`0 0 ${w} 24.5`, w, 24.5, body);
}

// ——— Our own ciphers ———

// 3 · Stem: strokes along a line, in the manner of ogham. Five families of up to five
// strokes: above, below, across, and the two diagonals; z is a cross.
const STEP = 2.6, LGAP = 2.6;
function stemmed(word, st = "") {
  let x = 1.5, body = "";
  [...word].forEach((ch, i) => {
    if (i) x += LGAP;
    const n = ch.charCodeAt(0) - 97;
    if (ch === "z") { body += bar(x, 12, 45, st) + bar(x, 12, -45, st); x += STEP; return; }
    const fam = Math.floor(n / 5), count = (n % 5) + 1;
    for (let k = 0; k < count; k++) {
      const [cy, a] = [[12 - L / 2 - 0.2, 90], [12 + L / 2 + 0.2, 90], [12, 90], [12, -45], [12, 45]][fam];
      body += bar(x, cy, a, st);
      x += STEP;
    }
  });
  const w = x - STEP + 1.5;
  return svg(`0 6.5 ${f(w)} 11`, w, 11, `<line class="stem" x1="0" y1="12" x2="${f(w)}" y2="12"/>${body}`);
}

// 4 · Signal: two arms from a hub, as in flag semaphore, but our own table: the arms point
// in eight directions and each pair of directions is a letter.
const PAIRS = [];
for (let i = 0; i < 8; i++) for (let j = i + 1; j < 8; j++) PAIRS.push([i, j]);
const ARM = (k) => -90 + k * 45;
function signal(word, st = "") {
  const R = 5.6, step = 2 * R + 2.4;
  let body = "";
  [...word].forEach((ch, i) => {
    const cx = R + i * step, cy = R, [p, q] = PAIRS[ch.charCodeAt(0) - 97];
    for (const k of [p, q]) {
      const a = ARM(k), r = (L / 2 + 0.9) ;
      body += bar(cx + Math.cos((a * Math.PI) / 180) * r, cy + Math.sin((a * Math.PI) / 180) * r, a, st);
    }
    body += `<circle class="hub" cx="${f(cx)}" cy="${f(cy)}" r="0.8"/>`;
  });
  const w = word.length * step - 2.4;
  return svg(`0 0 ${f(w)} ${2 * R}`, w, 2 * R, body);
}

const SCHEMES = [
  {
    id: "woven", name: "<em>Hasır</em>", draw: woven, looks: "bir hasır, bir kilim, bir parke",
    desc: "Gerçek mors: nokta dik bir çubuk, çizgi yatay bir çubuk. Semboller okuma sırasıyla 4 × 4'lük bir kareyi dolduruyor, harflerin arasında bir boş hücre; kilimdeki gibi motif kare dolana kadar tekrar ediyor. Her kod kendine özgü bir dokuma deseni çıkarıyor.",
    good: ["Gerçek bir kod: mors bilen okuyabilir.", "Her işaret aynı, dolu bir kare: aile bağı çok güçlü, favicon'da net.", "Dönüşüm çok güzel: çubuklar yerinde dönerek başka bir isim yazıyor (aşağıda)."],
    bad: ["Tekrar yüzünden kodun nerede başlayıp bittiği ilk bakışta görünmüyor.", "Okuması zor; ama bu bir kod, harf değil."],
  },
  {
    id: "skyline", name: "Silüet", draw: skyline, looks: "bir şehir silüeti, bir kayıt cihazı",
    desc: "Yine gerçek mors, ama her harf bir sütun: semboller yukarıdan aşağı diziliyor, sütunlar aynı zemine basıyor. Kısa harf alçak, uzun harf yüksek; her isim kendi silüetini çiziyor.",
    good: ["Çok okunaklı bir yapı: kaç harf, hangi harf, hemen görülüyor.", "Silüet bir şeye benziyor: İzmir'in kıyısı gibi bir sıra yapı.", "Harf sayısı arttıkça işaret genişliyor; kod da görünür."],
    bad: ["Genişlik değiştiği için kare bir favicon'a sığması zor.", "e ve t gibi tek sembollü harfler çok kısa kalıyor."],
  },
  {
    id: "stem", name: "<em>Sap</em>", draw: stemmed, looks: "bir tüy, bir balık kılçığı, bir anten",
    desc: "Kendi şifremiz, eski İrlanda ogham yazısı gibi: bir sap ve üzerinde eşit çizgiler. Beş aile, her birinde beşe kadar çizgi: üstte, altta, kesen, iki çapraz. a bir üst çizgi, m üç kesen, s dört çapraz.",
    good: ["Doğal bir şeye benziyor: tüy, dal, kılçık.", "Kod basit: aileyi ve sayıyı öğrenen okur.", "Sap ağ fikrindeki çizgiyi geri getiriyor."],
    bad: ["Uzun ve ince; kareye sığmıyor.", "Çapraz çizgiler sistemin yatay-dikey disiplinini bozuyor."],
  },
  {
    id: "signal", name: "<em>Sinyal</em>", draw: signal, looks: "işaret veren bir figür, bir saat, bir rüzgârgülü",
    desc: "Bayrak semaforu gibi, ama kendi tablomuzla: her harf bir merkezden çıkan iki eşit kol. Kollar sekiz yöne bakabiliyor; her yön çifti bir harf.",
    good: ["İnsan figürüne benziyor: işaret veren biri.", "Her harf ayrı bir figür; ritmi güzel.", "Hareketle çok iyi: kollar dönerek harf değiştiriyor."],
    bad: ["Merkezden çıkan çizgiler küçükte yıldız ya da kar tanesi gibi okunabilir.", "Tablo ezberlenmeden okunmuyor."],
  },
];

// ——— Page ———

const root = document.getElementById("ag");
const show = SHOW.map((id) => projects.find((p) => p.id === id)).filter(Boolean);
const keyOf = (draw) => [..."abcdefghijklmnopqrstuvwxyz"].map((ch) => `<span class="key-l">${draw(ch)}<span>${ch}</span></span>`).join("");

root.innerHTML = `
  <article class="vc vc--wide">
    <div class="vc-head"><span class="label">Fikir</span><h2>Eşit çubuklarla bir <em>kod</em></h2></div>
    <p class="vc-desc">Bu sayfadaki bütün çubuklar aynı uzunlukta ve aynı kalınlıkta. Değişen yalnızca çubuğun nerede durduğu ve hangi yöne döndüğü. Dört yazma biçimi: ikisi gerçek mors, ikisi bizim kendi şifremiz. Her biri okunabilen bir kod ve aynı zamanda bir şeye benzeyen bir doku. Projeler kendi kodlarını yazıyor (js, nc, sqk…); sen <b>ms</b>.</p>
  </article>
  ${SCHEMES.map((s, n) => `
    <article class="vc vc--wide">
      <div class="vc-head"><span class="label">${n + 1}</span><h2>${s.name}</h2><span class="looks">${s.looks}</span></div>
      <p class="vc-desc">${s.desc}</p>
      <div class="mors-top">
        <div class="mors-owner">${s.draw(OWNER)}<span>ms · Mert Seven</span></div>
        ${s.id === "woven" ? `<div class="mors-owner">${woven("seven")}<span>seven · ya da soyadın</span></div>` : ""}
        <div class="mors-projects">${show.map((p) => `<span class="mp" title="${escapeHtml(p.title)}">${s.draw(CODE.get(p.id), kindState(p))}<b>${CODE.get(p.id)}</b><span>${escapeHtml(p.title)}</span></span>`).join("")}</div>
      </div>
      <details class="key"><summary>Anahtar: a–z</summary><div class="key-row">${keyOf(s.draw)}</div></details>
      <div class="notes">
        <div><h3>Güçlü</h3><ul>${s.good.map((x) => `<li>${x}</li>`).join("")}</ul></div>
        <div><h3>Zayıf</h3><ul>${s.bad.map((x) => `<li>${x}</li>`).join("")}</ul></div>
      </div>
    </article>`).join("")}

  <article class="vc vc--wide">
    <div class="vc-head"><span class="label">Dönüşüm</span><h2>Hasır, <em>dönerken</em></h2></div>
    <p class="vc-desc">On altı çubuk yerinde duruyor; yalnızca dönüyor, beliriyor ya da kayboluyor. "seven" dokuması bir projenin koduna dönüşüyor, sonra geri geliyor. Sitede künye açılınca header'daki işaret böyle değişir.</p>
    <div class="morph">
      <div class="morph-stage"><svg viewBox="0 0 24 24" aria-hidden="true" id="loom"></svg></div>
      <p class="morph-cap" id="loom-cap"></p>
    </div>
  </article>`;

// ——— Woven morph: the same sixteen bars turn, appear and fade ———

const loom = document.getElementById("loom"), cap = document.getElementById("loom-cap");
loom.innerHTML = Array.from({ length: 16 }, (_, i) => {
  const cx = HS / 2 + (i % 4) * HS, cy = HS / 2 + Math.floor(i / 4) * HS;
  return `<circle class="g" cx="${cx}" cy="${cy}" r="0.4"/><g transform="translate(${cx} ${cy})"><rect class="cb turn" x="${-L / 2}" y="${-W / 2}" width="${L}" height="${W}"/></g>`;
}).join("");
const bars = [...loom.querySelectorAll("rect.turn")];
const angle = bars.map(() => 0);
function weave(word) {
  const run = repeat(word);
  bars.forEach((r, i) => {
    const sym = run[i];
    if (sym) {
      // Turn the short way: a bar that is already standing stays standing.
      const want = angleOf(sym);
      if (((angle[i] % 180) + 180) % 180 !== want) angle[i] += 90;
      r.style.transform = `rotate(${angle[i]}deg)`;
      r.style.opacity = "1";
    } else r.style.opacity = "0";
  });
}
let step = 0;
weave("seven");
cap.innerHTML = "<b>seven</b> <span>Mert Seven</span>";
setInterval(() => {
  step++;
  const p = show[Math.floor(step / 2) % show.length];
  if (step % 2) { weave(CODE.get(p.id)); cap.innerHTML = `<b>${CODE.get(p.id)}</b> <span>${escapeHtml(p.title)}</span>`; }
  else { weave("seven"); cap.innerHTML = "<b>seven</b> <span>Mert Seven</span>"; }
}, 2200);

for (const b of document.querySelectorAll("[data-theme-set]")) {
  b.addEventListener("click", () => {
    document.documentElement.dataset.theme = b.dataset.themeSet;
    document.querySelectorAll("[data-theme-set]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  });
}
