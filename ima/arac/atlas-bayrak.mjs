// MAP geçişinin bayrakları: atlasın 162 kütüphanesi, atlastaki yerleriyle.
// Ad, küme, yıldız (bin) etiketin src/_p2.js'teki RAW dizisinden; konum (yaklaşık -1…1), atlasın pişmiş
// t-SNE yerleşiminden (veri/yerlesim.json). Küme renkleri atlasın kendi renkleri.
// Atlas değişince yeniden çalıştırın: node arac/atlas-bayrak.mjs  →  ../atlas-bayrak.json
import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const atlas = join(here, "..", "..", "etkilesim-atlasi");
const src = readFileSync(join(atlas, "src", "_p2.js"), "utf8").replace(/\r\n/g, "\n");
const a = src.indexOf("const RAW = ["), b = src.indexOf("\n];", a);
const RAW = Function(`return ${src.slice(a + "const RAW = ".length, b + 2)}`)();
const { pos } = JSON.parse(readFileSync(join(atlas, "veri", "yerlesim.json"), "utf8"));
if (pos.length !== RAW.length * 2) throw new Error(`yerleşim ${pos.length / 2} kütüphane, RAW ${RAW.length}: atlası yeniden derleyin`);

const CATS = { geo: "#43B182", viz: "#5B93EE", "3d": "#A487F2", game: "#45C4CE", creative: "#EE6FB8",
  motion: "#F2762C", audio: "#E2BE3E", sense: "#8FBF4E", story: "#F06551", tools: "#9AA3B8" };
const r3 = (v) => Math.round(v * 1000) / 1000;
const libs = RAW.map((r, i) => [r[0], r[1], r[5], r3(pos[i * 2]), r3(pos[i * 2 + 1])]);
const out = join(here, "..", "atlas-bayrak.json");
writeFileSync(out, JSON.stringify({ note: "ad, küme, yıldız (bin), x, y (yaklaşık -1…1) · arac/atlas-bayrak.mjs", cats: CATS, libs }));
console.log(`${libs.length} kütüphane → ${out}`);
