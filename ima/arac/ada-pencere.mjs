// LAB geçişinde pencereden görünen adanın gece görüntüsünü üretir: ada-c2 başsız Chrome'da gece
// modunda ve arayüzsüz açılır, kamera deniz fenerinin fener odasına konup adanın ortasına bakar,
// tek kare ../ada-gece.webp olarak yazılır.
// Kullanım (sunucu açıkken, tools/serve.py): node arac/ada-pencere.mjs [http://127.0.0.1:8765]
import { spawn } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const base = process.argv[2] || "http://127.0.0.1:8765";
const W = 1920, H = 960, FOV = 64; // pencerenin arkasındaki düzlem 2:1, yatayda ~103°
const out = join(dirname(fileURLToPath(import.meta.url)), "..", "ada-gece.webp");
const port = 9300 + Math.floor(Math.random() * 600);
const chrome = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe", ["--headless=new", `--remote-debugging-port=${port}`,
  `--user-data-dir=${mkdtempSync(join(tmpdir(), "ada-"))}`, `--window-size=${W},${H}`, "--force-device-scale-factor=1", "--hide-scrollbars", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; i < 50; i++) { try { await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); break; } catch { await sleep(200); } }
const tab = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json();
const ws = new WebSocket(tab.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });

await send("Emulation.setDeviceMetricsOverride", { width: W, height: H, deviceScaleFactor: 1, mobile: false });
await send("Page.navigate", { url: `${base}/ima/lab/island/ada-c2/index.html?mode=night&clean=1&cam=tp&fov=${FOV}&q=1` });
await sleep(8000);
// Kamera: fener odası (fenerin tepesi, adaya doğru biraz önde), bakış adanın ortasının ötesine.
const r = await send("Runtime.evaluate", { awaitPromise: true, returnByValue: true, expression: `(async () => {
  const g = __c2, T3 = g.THREE, L = g.P.hub.pos;
  let fx = -1.9 - L.x, fz = .6 - L.z; const n = Math.hypot(fx, fz); fx /= n; fz /= n;
  const eye = new T3.Vector3(L.x + fx * 1.2, L.y + 5.4, L.z + fz * 1.2), at = new T3.Vector3(L.x + fx * 24, .2, L.z + fz * 24);
  const look = T3.Object3D.prototype.lookAt;
  g.tpCam.lookAt = function(){ this.position.copy(eye); this.up.set(0, 1, 0); look.call(this, at); };
  g.isl.scene.remove(g.avatar);
  await new Promise((res) => setTimeout(res, 2500));
  return document.getElementById('loadStatus').hidden;
})()` });
if (!r.result?.result?.value) console.warn("ada henüz yüklenmemiş olabilir");
const shot = await send("Page.captureScreenshot", { format: "webp", quality: 72 });
writeFileSync(out, Buffer.from(shot.result.data, "base64"));
console.log(`${out} yazıldı`);
ws.close(); chrome.kill(); process.exit(0);
