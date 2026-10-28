// Measures frame times while the atlas is zoomed with the mouse wheel, in a headless Chrome.
// Usage: node zoombench.mjs <url> [label]
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const url = process.argv[2], label = process.argv[3] || url, pre = process.argv[4] || "1";
const port = 9300 + Math.floor(Math.random() * 500);
const chrome = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe", [
  "--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), "zb-"))}`,
  "--window-size=1440,900", "--no-first-run", "--no-default-browser-check", "--mute-audio", "about:blank",
], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let ver;
for (let i = 0; i < 50; i++) { try { ver = await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); break; } catch { await sleep(200); } }
const tab = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, { method: "PUT" })).json();
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send("Runtime.enable");
await sleep(5000);
const run = async (expr) => (await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true })).result?.result?.value;

await run(pre); await sleep(800);
// Real wheel input through the browser, one notch per frame, in and out around the middle.
const out = [];
const PROF = process.env.PROF; if (PROF) { await send("Profiler.enable"); await send("Profiler.setSamplingInterval", { interval: 200 }); }
for (const pass of ["warm", "a", "b"]) {
  if (PROF && pass === "a") await send("Profiler.start");
  await run(`window.__tok=(window.__tok||0)+1; window.__ft=[]; (function(tok,arr){ (function f(t){ if(window.__tok!==tok) return; arr.push(t); requestAnimationFrame(f); })(performance.now()); })(window.__tok, window.__ft); 1`);
  for (let n = 0; n < 60; n++) {
    const DY = +(process.env.DY || 100), PER = +(process.env.PER || 15); const dy = (Math.floor(n / PER) % 2 ? DY : -DY);
    await send("Input.dispatchMouseEvent", { type: "mouseWheel", x: 860, y: 480, deltaX: 0, deltaY: dy });
    await sleep(16);
  }
  await sleep(400);
  const ft = await run(`(() => { const t = window.__ft, d = []; for (let i = 1; i < t.length; i++) d.push(t[i]-t[i-1]); return d; })()`);
  if (pass !== "warm") out.push(...(process.env.ALL ? ft : ft.slice(0, 70)));
}
if (PROF) { const p = (await send("Profiler.stop")).result.profile; const self = new Map(); const dt = p.timeDeltas; const byId = new Map(p.nodes.map((n) => [n.id, n])); p.samples.forEach((sid, k) => { const n = byId.get(sid), f = n.callFrame, key = (f.functionName || "(anon)") + " " + (f.url.split("/").pop() || "") + ":" + f.lineNumber; self.set(key, (self.get(key) || 0) + (dt[k] || 0)); }); const tot=[...self.values()].reduce((a,b)=>a+b,0); console.log("JS profile total ms", (tot/1000).toFixed(0)); [...self].sort((a, b) => b[1] - a[1]).slice(0, 18).forEach(([k, v]) => console.log("  ", (v / 1000).toFixed(1).padStart(7), "ms ", k)); }
const d = out.sort((a, b) => a - b), q = (p) => d[Math.min(d.length - 1, Math.floor(d.length * p))];
const avg = d.reduce((s, x) => s + x, 0) / d.length;
console.log(`${label}: frames ${d.length}, avg ${avg.toFixed(1)} ms, p50 ${q(0.5).toFixed(1)}, p95 ${q(0.95).toFixed(1)}, max ${d[d.length - 1].toFixed(1)}, >50ms ${d.filter((x) => x > 50).length}`);
ws.close(); chrome.kill();
process.exit(0);
