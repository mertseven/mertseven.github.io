// Builds the atlas overhaul previews (preview/atlas-ui/*.html) from the published atlas.
// Nothing under etkilesim-atlasi/ is touched: the built page is read, a few code patches are
// applied (the same ones the real change would make in src/), and each variant's interface
// layer (ui.css, ui.js and the variant's own css) is attached. Run: node preview/atlas-ui/build.mjs

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url)), root = join(here, "..", "..");
const SRC = readFileSync(join(root, "etkilesim-atlas.html"), "utf8").replace(/\r\n/g, "\n");

// ——— The t-SNE result, solved once here instead of on every visit ———
const p2 = readFileSync(join(root, "etkilesim-atlasi", "src", "_p2.js"), "utf8").replace(/^<script>\s*/, "").replace("(function(){", "");
const { makeSolver, fitted, X, N } = new Function(p2 + "; return { makeSolver, fitted, X, N: X.length };")();
const t0 = performance.now();
const solver = makeSolver(X, 18, 20260907);
for (let i = 0; i < 700; i++) solver.step();
const POS = Array.from(fitted(solver.Y, N), (v) => +v.toFixed(6));
console.log(`t-SNE solved at build time: ${(performance.now() - t0).toFixed(0)} ms, ${N} libraries`);

// ——— Patches shared by every variant ———
function patch(html, pairs) {
  for (const [a, b, label] of pairs) {
    if (!html.includes(a)) throw new Error(`patch target not found: ${label || a.slice(0, 60)}`);
    html = html.replace(a, b);
  }
  return html;
}
const NOTES = {
  maps: "Koordinatı piksele çeviren işler: seçim haritaları, akış, mekânsal analiz.",
  storytelling: "Okuma sırasını tasarlayan işler: kaydırmalı anlatı, uzun form.",
  immersive: "Derinlik, kamera ve mekân duygusu kuran işler.",
  interactives: "Okurun oynadığı işler: quiz, tahmin, yarış, çizdirme.",
  visualizations: "Sayıyı işarete bağlayan işler: grafik, ağ, karşılaştırma.",
  investigations: "Veriyle kurulmuş araştırma dosyaları ve veritabanları.",
  drone: "Yukarıdan bakış: uydu görüntüsü, hava çekimi, arazi değişimi.",
  portfolios: "Ekipler, stüdyolar ve derlemeler: tek tek iş değil, kaynak.",
};
function shared(html, mode) {
  html = patch(html, [
    // 1. No solving on load: the layout starts from the result computed above.
    ["solveNow(perplexity, 700);", `/* önizleme: t-SNE derlemede çözüldü */\nPOS = Float64Array.from(${JSON.stringify(POS)}); klNow = ${solver.kl ?? 0};`, "solveNow"],
    // 2. Open on the whole map, not on a cluster of live demos.
    ["centerOn(bestOpening(), Math.max(0.30, Math.min(0.82, VW/980)));", "fitAll();", "openView"],
    // 3. A selection tells the interface, and frames the card with its sheet.
    [`  c.el.setAttribute("data-sel","");\n  if(view.k < 0.62) { centerOn(i, 0.8); return; }\n  requestAnimationFrame(()=>ensureVisible(i));`,
     `  c.el.setAttribute("data-sel","");\n  dispatchEvent(new CustomEvent("atlas:select",{detail:i}));\n  requestAnimationFrame(()=>frameSel(i));`, "select"],
    [`  sel=j; buildSheet(cards[j]); cards[j].el.setAttribute("data-sel","");\n  requestAnimationFrame(()=>ensureVisible(j));`,
     `  sel=j; buildSheet(cards[j]); cards[j].el.setAttribute("data-sel","");\n  dispatchEvent(new CustomEvent("atlas:select",{detail:j}));\n  requestAnimationFrame(()=>frameSel(j));`, "goTo"],
    [`  cards[sel].el.removeAttribute("data-sel");\n  sel=-1;`, `  cards[sel].el.removeAttribute("data-sel");\n  sel=-1;\n  dispatchEvent(new CustomEvent("atlas:deselect"));`, "deselect"],
    ["function ensureVisible(i){", `/* Seçilen kart künyesiyle birlikte görünür. Künye kartın altındaysa ikisi
   birden sığacak ölçeğe inilir; künye bir panele taşındıysa yalnız kart, panelin
   kapatmadığı alanın ortasına gelir. */
const UI_MODE = ${JSON.stringify(mode)};
function frameSel(i){
  measure();
  const pad=28, c=cards[i], phone=VW<=900;
  if(UI_MODE==="rail" && !phone){
    const sh=c.el.querySelector(".sheet").offsetHeight||560;
    const k=Math.max(0.42, Math.min(0.8, (VH-pad*2)/(CARD_H+9+sh)));
    view.k=k; view.tx=VW/2-LAY[i*2]*k; view.ty=pad-(LAY[i*2+1]-CARD_H/2)*k; apply(); return;
  }
  const side = UI_MODE==="float" && !phone ? 400 : 0, bottom = phone ? VH*0.5 : 0, top = UI_MODE==="float" && phone ? 150 : 0;
  const k=Math.max(Math.min(view.k,0.8), Math.min(0.8, (VH-top-bottom-pad*2)/CARD_H));
  view.k=k; view.tx=(VW-side)/2-LAY[i*2]*k; view.ty=top+(VH-top-bottom)/2-LAY[i*2+1]*k; apply();
}
function ensureVisible(i){`, "frameSel"],
    // 4. Region names keep a wider berth from each other.
    ["const ox=(a.w+b.w)/2+16-Math.abs(a.x-b.x);\n      const oy=(a.h+b.h)/2+9 -Math.abs(a.y-b.y);", "const ox=(a.w+b.w)/2+28-Math.abs(a.x-b.x);\n      const oy=(a.h+b.h)/2+16-Math.abs(a.y-b.y);", "labels"],
    ["for(let pass=0; pass<9; pass++){", "for(let pass=0; pass<18; pass++){", "label passes"],
    // 5. The scale readout says nothing to a reader.
    ["`<span>ölçek <b>${view.k.toFixed(2)}×</b></span>` +", "", "hud"],
    // 6. Wheel zoom without stutter. Zooming inside one level of detail was already smooth;
    //    the hitches came from what happens when a threshold is crossed: the cards' level of
    //    detail flips (a style pass over ~4000 nodes), every visible glyph canvas is resized,
    //    and live demos load or unload. The wheel now eases toward a target scale, and those
    //    three wait until the wheel has been still for a moment.
    ["let framed=false;", `/* Tekerlek sürerken pahalı geçişler bekler; durunca bir kez yapılır. */
let wz=null, zoomingUntil=0, lodPending=false, lastRes=0, lastVsig="";
const zooming=()=>performance.now()<zoomingUntil;
function stepZoom(){
  if(!wz) return;
  const r=wz.k/view.k;
  if(Math.abs(r-1)<0.003){ zoomBy(r, wz.ax, wz.ay); wz=null; return; }
  zoomBy(Math.pow(r, 0.3), wz.ax, wz.ay);
}
let framed=false;`, "zoom state"],
    ["if(world.dataset.lod !== lod) world.dataset.lod = lod;", "if(world.dataset.lod !== lod){ if(zooming()) lodPending=true; else world.dataset.lod = lod; }", "lod"],
    ["  if(!framed){ measure(); openView(); }", "  if(!framed){ measure(); openView(); }\n  stepZoom();\n  if(lodPending && !zooming()){ lodPending=false; apply(); }", "frame zoom"],
    // What waited for the wheel to stop is then spread over a few frames: at most one live
    // demo starts per frame, at most ten glyph canvases change resolution per frame.
    ["  for(const i of want) if(!liveMap.has(i)) mountOne(i);", "  for(const i of want) if(!liveMap.has(i)){ mountOne(i); break; }", "live one per frame"],
    ["      if(c.res!==RES){ c.cv.width=c.cv.height=RES; c.res=RES; }", "      if(c.res!==RES){ if(c.res && ++resized>10) continue; c.cv.width=c.cv.height=RES; c.res=RES; }", "res spread"],
    ["  if(!skip){", "  let resized=0;\n  if(!skip){", "res counter"],
    ["const RES = bucketFor(plate*view.k*DPR);", "const RES = (zooming() && lastRes) ? lastRes : (lastRes = bucketFor(plate*view.k*DPR));", "res"],
    ["  updateLive();\n  updateLabels();\n  drawLinks(hoverIdx>=0 ? hoverIdx : sel);\n  drawMini();",
     `  if(!zooming()) updateLive();
  /* Bölge adları ve mini harita yalnız görünüm değişince (ya da arada bir, süzgeç için) yenilenir. */
  const vsig = view.k.toFixed(4)+","+view.tx.toFixed(1)+","+view.ty.toFixed(1)+","+VW+","+VH;
  if(vsig!==lastVsig || tick%20===0){ lastVsig=vsig; updateLabels(); drawMini(); }
  drawLinks(hoverIdx>=0 ? hoverIdx : sel);`, "live + labels + mini"],
    // Glyphs: a card already drawn at this resolution is left as it is while the wheel is
    // turning, and at the far level (cards a few dozen pixels wide) it is refreshed only
    // every tenth frame. A card never drawn yet is always drawn, so nothing shows up blank.
    [`      if(c.plate.hasAttribute("data-live")) continue;   /* canlı demo varken glyph çizilmez */`,
     `      if(c.plate.hasAttribute("data-live")) continue;   /* canlı demo varken glyph çizilmez */
      if(c.res===RES && (zooming() || (view.k<0.34 && (tick+i)%10!==0))) continue;`, "glyph throttle"],
    ["    pinch=d; dragged+=20; return;", "    pinch=d; dragged+=20; zoomingUntil=performance.now()+220; return;", "pinch"],
    [`  const r=stage.getBoundingClientRect();
  zoomBy(Math.exp(-e.deltaY*0.0016), e.clientX-r.left, e.clientY-r.top);`, `  const r=stage.getBoundingClientRect();
  const dy = e.deltaMode===1 ? e.deltaY*16 : e.deltaMode===2 ? e.deltaY*VH : e.deltaY;
  const base = wz ? wz.k : view.k;
  wz = { k: Math.max(.085, Math.min(2.2, base*Math.exp(-dy*0.0016))), ax:e.clientX-r.left, ay:e.clientY-r.top };
  zoomingUntil = performance.now()+220;`, "wheel"],
    // 7. More of the atlas reachable from the interface layer, and the comparison list
    //    announced whenever it changes (the tour fills it too).
    ["goStop, addCompare, renderCmp };", "goStop, addCompare, renderCmp, goTo, deselect, buildSheet, endTour, TOUR, DEMO_OF, compare, removeCompare, AXES, AXIS_FAM, AXIS_INFO, get sel(){ return sel; } };", "export"],
    [`  compare.length ? trayEl.setAttribute("data-on","") : trayEl.removeAttribute("data-on");`,
     `  compare.length ? trayEl.setAttribute("data-on","") : trayEl.removeAttribute("data-on");\n  dispatchEvent(new CustomEvent("atlas:compare",{detail:compare.slice()}));`, "compare event"],
    // 8. Language: when window.ATLAS_EN is there (English pages load en.js first), the data
    //    takes its English words. Axis names are renamed everywhere they are looked up, so
    //    every bar, sheet and comparison follows. Without it nothing changes.
    ["/* Türetilmiş eksenler", `if(window.ATLAS_EN){
  const E=window.ATLAS_EN;
  for(const k in E.cats){ CATS[k].label=E.cats[k].label; CATS[k].note=E.cats[k].note; }
  const info={};
  AXES.forEach((a,i)=>{ const n=E.axes[a]||a; info[n]=E.axisInfo[n]||AXIS_INFO[a]; AXES[i]=n; });
  for(const k in AXIS_INFO) delete AXIS_INFO[k];
  Object.assign(AXIS_INFO, info);
  AXIS_FAM.forEach((f,i)=>{ f.t=E.fams[i].t; f.n=E.fams[i].n; f.ax=f.ax.map(a=>E.axes[a]||a); });
  LIBS.forEach(l=>{ if(E.tags[l.name]) l.tag=E.tags[l.name]; });
}
/* Türetilmiş eksenler`, "en data"],
    ["let tourIdx = -1;", "if(window.ATLAS_EN) TOUR.forEach((s,i)=>{ s.t=ATLAS_EN.tour[i].t; s.d=ATLAS_EN.tour[i].d; });\nlet tourIdx = -1;", "en tour"],
    ["const DEFAULT_HINT = ", "if(window.ATLAS_EN) Object.assign(HINTS, ATLAS_EN.hints);\nconst DEFAULT_HINT = window.ATLAS_EN ? ATLAS_EN.defaultHint : ", "en hints"],
    [`const both = (a==="Bildirimsel"||a==="Soyutlama");`, `const both = (a===AXES[10]||a===AXES[11]);`, "axes both"],
  ]);
  // 9. The museum's section notes, with their Turkish letters back.
  for (const [k, v] of Object.entries(NOTES)) html = html.replace(new RegExp(`("${k}": \\{label:"[^"]*", wing:"[^"]*", note:)"[^"]*"`), `$1${JSON.stringify(v)}`);
  return html;
}

// The interface words written into the atlas's own code and markup, for the English pages.
// The museum and the pavilion keep their Turkish for now.
const EN_UI = [
  ['<html lang="tr">', '<html lang="en">'],
  ['name="description" content="İnteraktif medyayı mümkün kılan 162 JavaScript kütüphanesi ve onlarla yapılmış 118 gazetecilik işi."', 'name="description" content="The 162 JavaScript libraries that make interactive media possible, and 118 journalism works made with them."'],
  ['" — künyeyi aç"', '" — open details"'],
  ['title="Bu kart elle yerleştirildi">elle', 'title="This card was placed by hand">moved'],
  ['title="Yakınlaşınca kütüphanenin kendisi bu kartta çalışır"', 'title="Zoom in and the library itself runs on this card"'],
  ['<b class="livetag">canlı</b>', '<b class="livetag">live</b>', true],
  ['aria-label="Etkileşimli kanadı aç"', 'aria-label="Open larger and try"'],
  ['<u class="wing__tag">etkileşimli</u>', '<u class="wing__tag">interactive</u>'],
  ['aria-label="Kanadı kapat"', 'aria-label="Close"'],
  ['solveBtn.textContent="Manzarayı yeniden ser";', 'solveBtn.textContent="Recompute the map";'],
  ['"Seriliyor…"', '"Computing…"'],
  ['`<span><b>${N}</b> kütüphane</span><span><b>${CAT_KEYS.length}</b> küme</span>`', '`<span><b>${N}</b> libraries</span><span><b>${CAT_KEYS.length}</b> clusters</span>`'],
  ['`<span>seriliyor…</span>`', '`<span>computing…</span>`'],
  ['<p class="sec">Künye — ${CATS[l.cat].label}</p>', '<p class="sec">Details — ${CATS[l.cat].label}</p>'],
  ['<dt>Yaklaşık ağırlık</dt>', '<dt>Approx. size</dt>'],
  ['<dt>GitHub yıldızı</dt>', '<dt>GitHub stars</dt>'],
  ['<dt>İlk sürüm</dt>', '<dt>First release</dt>'],
  ['<dt>Lisans</dt><dd>${l.lic}</dd>', '<dt>Licence</dt><dd>${l.lic}</dd>'],
  ['<p class="sec">Ne yapar — eksen adına tıklayın</p>', '<p class="sec">What it does — click an axis name</p>'],
  ['<p class="sec">Benzer kütüphaneler</p>', '<p class="sec">Similar libraries</p>'],
  ['&#8646; karşılaştırmaya ekle</button>', '&#8646; add to comparison</button>'],
  ['const DEFAULT_NOTE = "Bir kümenin üzerine gelin. Aynı işi farklı katmanlarda yapan kütüphaneler manzarada yan yana düşer.";', 'const DEFAULT_NOTE = "Hover over a cluster. Libraries that do the same job on different layers land side by side on the map.";'],
  ['`↺ Elle taşınan ${pinned.size} kartı geri al`', '`↺ Put back the ${pinned.size} card(s) moved by hand`'],
  ['<u>${members.length} kütüphane</u>', '<u>${members.length} libraries</u>'],
  ['const GESTURE = { tone:"Sesi başlat" };', 'const GESTURE = { tone:"Start sound" };'],
  ['gate.textContent="başlıyor…";', 'gate.textContent="starting…";'],
  ['gate.textContent="\\u25B6 tekrar dene";', 'gate.textContent="\\u25B6 try again";'],
  ['hint.textContent="sürükle";', 'hint.textContent="drag";'],
  ['["ege","marmara","akdeniz","iç anadolu"]', '["north","south","east","west"]'],
  ['&#8592; önceki</button>', '&#8592; previous</button>'],
  ['sonraki &#8594;</button>', 'next &#8594;</button>'],
  ['>kapat</button>', '>close</button>'],
  ['<span>tur</span>', '<span>tour</span>'],
  ['<u>yüksek</u>', '<u>high</u>'],
  ['<u>düşük</u>', '<u>low</u>'],
  ['"en yüksek":"örnek"', '"highest":"examples"'],
  ['"en düşük"', '"lowest"'],
  ['Eksenler — kartlardaki çubuklar ne anlatıyor', 'Axes — what the bars on the cards mean'],
  ['aria-label="Yakınlaştır"', 'aria-label="Zoom in"'],
  ['aria-label="Uzaklaştır"', 'aria-label="Zoom out"'],
  ['aria-label="Tümünü sığdır" title="Tüm manzarayı sığdır"', 'aria-label="Fit all" title="Fit the whole map"'],
  ['>manzara özeti<', '>overview<'],
  ['aria-label="Manzara özeti — tıklayın ya da sürükleyin"', 'aria-label="Overview — click or drag"'],
];
function english(html) {
  for (const [a, b, all] of EN_UI) {
    if (!html.includes(a)) throw new Error(`EN target not found: ${a.slice(0, 70)}`);
    html = all ? html.split(a).join(b) : html.replace(a, b);
  }
  return html.replace("<title>Etkileşim Atlası</title>", '<title>Interaction Atlas</title>\n<script src="/preview/atlas-ui/en.js"></script>');
}

const VARIANTS = [
  { id: "a", mode: "rail", title: "A · Düzenli ray" },
  { id: "b", mode: "drawer", title: "B · Üst çubuk ve çekmece" },
  { id: "c", mode: "float", title: "C · Yüzen paneller" },
  // Derivatives of B, each adding its own stylesheet on top of b.css.
  { id: "b1", mode: "drawer", title: "B1 · Tek satır", css: ["b"] },
  { id: "b2", mode: "drawer", title: "B2 · İki kat", css: ["b", "b2"] },
  { id: "b3", mode: "drawer", title: "B3 · Ortada arama", css: ["b", "b3"] },
  { id: "b4", mode: "drawer", title: "B4 · Sekmeler", css: ["b", "b4"] },
  { id: "b5", mode: "drawer", title: "B5 · Kompakt", css: ["b", "b5"] },
  { id: "b6", mode: "drawer", title: "B6 · Kâğıt bant", css: ["b", "b6"] },
];
// B2, the chosen direction, is built in both languages: b2.html in English (the default),
// b2-tr.html in Turkish, each linking to the other. The other variants stay Turkish.
const PAGES = VARIANTS.flatMap((v) => v.id === "b2"
  ? [{ ...v, lang: "en", file: "b2", alt: "b2-tr.html" }, { ...v, lang: "tr", file: "b2-tr", alt: "b2.html" }]
  : [{ ...v, lang: "tr", file: v.id }]);
for (const v of PAGES) {
  let html = shared(SRC, v.mode);
  if (v.lang === "en") html = english(html);
  html = html.replace(/<title>[^<]*<\/title>/, `<title>Atlas · ${v.title}${v.lang === "en" ? " · EN" : ""}</title>\n<meta name="robots" content="noindex">`);
  const links = (v.css || [v.id]).map((c) => `<link rel="stylesheet" href="/preview/atlas-ui/${c}.css">`).join("\n");
  const inject = `\n<link rel="stylesheet" href="/preview/atlas-ui/ui.css">\n${links}\n<script src="/preview/atlas-ui/ui.js" data-mode="${v.mode}" data-variant="${v.id}"${v.alt ? ` data-alt="${v.alt}"` : ""}></script>\n`;
  const at = html.lastIndexOf("</body>");
  html = at >= 0 ? html.slice(0, at) + inject + html.slice(at) : html + inject;
  writeFileSync(join(here, `${v.file}.html`), html);
  console.log(`${v.file}.html  ${(html.length / 1024).toFixed(1)} kB  (${v.title}, ${v.lang})`);
}
