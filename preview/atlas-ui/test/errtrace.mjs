// Collects uncaught exceptions with their source (CDP sees through cross-origin "Script error.")
// while the atlas visits the live demos. Usage: node errtrace.mjs <url>
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
const url = process.argv[2], port = 9300 + Math.floor(Math.random() * 600);
const chrome = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe", ["--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), "et-"))}`, "--window-size=1440,900", "--mute-audio", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; i < 50; i++) { try { await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); break; } catch { await sleep(200); } }
const tab = await (await fetch(`http://127.0.0.1:${port}/json/new?about:blank`, { method: "PUT" })).json();
const ws = new WebSocket(tab.webSocketDebuggerUrl); await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map(); const seen = new Map();
ws.onmessage = (m) => {
  const d = JSON.parse(m.data);
  if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); }
  if (d.method === "Runtime.exceptionThrown") {
    const e = d.params.exceptionDetails, f = e.stackTrace?.callFrames?.[0];
    const key = `${e.exception?.description?.split("\n")[0] || e.text} @ ${(f?.url || e.url || "").split("/").slice(-2).join("/")}:${f?.lineNumber ?? e.lineNumber} ${f?.functionName || ""}`;
    seen.set(key, (seen.get(key) || 0) + 1);
  }
};
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
await send("Runtime.enable");
await send("Page.navigate", { url });
await sleep(5000);
const run = (expr) => send("Runtime.evaluate", { expression: expr, awaitPromise: true });
// Visit every live demo for a moment.
const n = (await send("Runtime.evaluate", { expression: "Object.keys(atlas.DEMO_OF).length", returnByValue: true })).result.result.value;
for (let k = 0; k < n; k++) { await run(`(() => { const name = Object.keys(atlas.DEMO_OF)[${k}]; const i = atlas.LIBS.findIndex(l => l.name === name); atlas.centerOn(i, 0.8); })()`); await sleep(1500); }
console.log(`${url}\n  ${n} demos visited`);
for (const [k, v] of seen) console.log(`  ${String(v).padStart(4)} × ${k}`);
ws.close(); chrome.kill(); process.exit(0);
