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
    // 6. More of the atlas reachable from the interface layer.
    ["goStop, addCompare, renderCmp };", "goStop, addCompare, renderCmp, goTo, deselect, buildSheet, endTour, TOUR, DEMO_OF, get sel(){ return sel; } };", "export"],
  ]);
  // 7. The museum's section notes, with their Turkish letters back.
  for (const [k, v] of Object.entries(NOTES)) html = html.replace(new RegExp(`("${k}": \\{label:"[^"]*", wing:"[^"]*", note:)"[^"]*"`), `$1${JSON.stringify(v)}`);
  return html;
}

const VARIANTS = [
  { id: "a", mode: "rail", title: "A · Düzenli ray" },
  { id: "b", mode: "drawer", title: "B · Üst çubuk ve çekmece" },
  { id: "c", mode: "float", title: "C · Yüzen paneller" },
];
for (const v of VARIANTS) {
  let html = shared(SRC, v.mode);
  html = html.replace("<title>Etkileşim Atlası</title>", `<title>Atlas · ${v.title}</title>\n<meta name="robots" content="noindex">`);
  const inject = `\n<link rel="stylesheet" href="/preview/atlas-ui/ui.css">\n<link rel="stylesheet" href="/preview/atlas-ui/${v.id}.css">\n<script src="/preview/atlas-ui/ui.js" data-mode="${v.mode}" data-variant="${v.id}"></script>\n`;
  const at = html.lastIndexOf("</body>");
  html = at >= 0 ? html.slice(0, at) + inject + html.slice(at) : html + inject;
  writeFileSync(join(here, `${v.id}.html`), html);
  console.log(`${v.id}.html  ${(html.length / 1024).toFixed(1)} kB  (${v.title})`);
}
