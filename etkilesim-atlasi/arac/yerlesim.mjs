// Haritanın yerleşimini (t-SNE) bir kez hesaplar ve veri/yerlesim.json'a yazar.
// derle.py bunu BAKED olarak sayfaya gömer; atlas açılışta çözmek yerine onu kullanır.
//
// Kullanım:  node arac/yerlesim.mjs
//
// Ne zaman: _p2.js'teki kütüphane listesi, özellik vektörleri, ağırlıklar ya da çözücü
// değiştiğinde. Unutulursa bir şey bozulmaz: derle.py parmak izinin tutmadığını görür,
// yerleşimi gömmez ve uyarır; harita da eskisi gibi tarayıcıda çözülür.
//
// Parmak izi: _p2.js'in "const RAW = [" satırından dosya sonuna kadarki kısmı (satır sonları
// \n'e çevrilmiş), SHA-1. derle.py aynısını hesaplar.
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const HERE = dirname(dirname(fileURLToPath(import.meta.url)));
const src = readFileSync(join(HERE, "src", "_p2.js"), "utf8").replace(/\r\n/g, "\n");
const hash = createHash("sha1").update(src.slice(src.indexOf("const RAW = ["))).digest("hex");

// _p2.js IIFE'yi açar ve tarayıcı için yazılmış; burada yalnız veri ve çözücü lazım.
globalThis.window = {};
const body = src.replace(/^<script>\s*/, "").replace("(function(){", "");
const { makeSolver, fitted, X } = new Function(body + "; return { makeSolver, fitted, X };")();

// _p4b.js'teki solveNow(perplexity, 700) ile aynı ayarlar ve aynı tohum.
const PERPLEXITY = 18, ITERS = 700, SEED = 20260907;
const t0 = performance.now();
const s = makeSolver(X, PERPLEXITY, SEED);
for (let i = 0; i < ITERS; i++) s.step();
const pos = Array.from(fitted(s.Y, X.length), (v) => +v.toFixed(6));

writeFileSync(join(HERE, "veri", "yerlesim.json"),
  JSON.stringify({ hash, n: X.length, perplexity: PERPLEXITY, iters: ITERS, seed: SEED, kl: +s.kl.toFixed(6), pos }) + "\n");
console.log(`yerlesim: ${X.length} kutuphane, ${(performance.now() - t0).toFixed(0)} ms, parmak izi ${hash.slice(0, 10)}`);
