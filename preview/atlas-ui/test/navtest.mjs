// Drives the atlas with real input through Chrome (CDP) and checks every way of getting
// around. Usage: node navtest.mjs <url> [label]
import { spawn } from "node:child_process";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

const url = process.argv[2], label = process.argv[3] || url;
const port = 9300 + Math.floor(Math.random() * 600);
const chrome = spawn("C:/Program Files/Google/Chrome/Application/chrome.exe", [
  "--headless=new", `--remote-debugging-port=${port}`, `--user-data-dir=${mkdtempSync(join(tmpdir(), "nt-"))}`,
  "--window-size=1440,900", "--no-first-run", "--no-default-browser-check", "--mute-audio", "about:blank",
], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
for (let i = 0; i < 50; i++) { try { await (await fetch(`http://127.0.0.1:${port}/json/version`)).json(); break; } catch { await sleep(200); } }
const tab = await (await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, { method: "PUT" })).json();
const ws = new WebSocket(tab.webSocketDebuggerUrl);
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
let phase = "load"; const exc = [];
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } if (d.method === "Runtime.exceptionThrown") { const e = d.params.exceptionDetails, f = e.stackTrace?.callFrames?.[0]; exc.push(phase + ": " + (e.exception?.description?.split(String.fromCharCode(10))[0] || e.text) + " @ " + (f?.url || e.url || "").split("/").pop() + ":" + (f?.lineNumber ?? e.lineNumber) + "  [" + (e.stackTrace?.callFrames || []).slice(0, 9).map((c) => (c.functionName || "anon") + "@" + c.url.split("/").pop() + ":" + c.lineNumber).join(" < ") + "]"); } };
const send = (method, params = {}) => new Promise((r) => { const i = ++id; pending.set(i, r); ws.send(JSON.stringify({ id: i, method, params })); });
const run = async (expr) => { const r = await send("Runtime.evaluate", { expression: expr, awaitPromise: true, returnByValue: true }); if (r.result?.exceptionDetails) return { error: r.result.exceptionDetails.exception?.description }; return r.result?.result?.value; };
await send("Runtime.enable");
for (let i = 0; i < 40; i++) { if (await run(`!!(window.atlas && atlas.cards)`)) break; await sleep(250); }
await sleep(2500);
await run(`window.__errs=[]; addEventListener('error', e => __errs.push(e.message)); 1`);

const mouse = (type, x, y, extra = {}) => send("Input.dispatchMouseEvent", { type, x, y, button: "left", buttons: type === "mouseReleased" ? 0 : 1, clickCount: 1, ...extra });
async function drag(x, y, dx, dy, steps = 24, mods = 0) {
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x, y, modifiers: mods });
  await mouse("mousePressed", x, y, { modifiers: mods });
  for (let s = 1; s <= steps; s++) { await mouse("mouseMoved", x + (dx * s) / steps, y + (dy * s) / steps, { modifiers: mods }); await sleep(12); }
  await mouse("mouseReleased", x + dx, y + dy, { modifiers: mods });
  await sleep(250);
}
const state = () => run(`({ tx: atlas.view.tx, ty: atlas.view.ty, k: atlas.view.k, sel: typeof atlas.sel === "number" ? atlas.sel : -2, selText: (getSelection().rangeCount && !getSelection().isCollapsed) ? (String(getSelection()) || "(non-text range)") : "", lay: Array.from(atlas.LAY.slice(0, 324)).join(",").length + ":" + Array.from(atlas.LAY).reduce((s, v) => s + v, 0).toFixed(1) })`);
// Find points: empty ground, a card's plate, its caption text, a live demo plate.
const spot = (what) => run(`(() => {
  const st = document.getElementById("stage").getBoundingClientRect();
  const inside = (r) => r.left > st.left + 60 && r.right < st.right - 240 && r.top > st.top + 60 && r.bottom < st.bottom - 160;
  const ok = (x, y) => { const e = document.elementFromPoint(x, y); return e && !e.closest(".card,.ui-dock,.ui-kp,.zoombar,.mini,.hud,.callout,.tray,.labels"); };
  if ("${what}" === "empty") { for (let y = st.top + 120; y < st.bottom - 200; y += 23) for (let x = st.left + 80; x < st.right - 300; x += 29) if (ok(x, y) && ok(x + 260, y)) return [x, y]; return null; }
  for (const c of atlas.cards) {
    const sel = "${what}" === "plate" ? ".box--main .plate" : "${what}" === "caption" ? ".box--cap p" : "${what}" === "title" ? ".head h3" : ".box--main .plate[data-live]";
    const el = c.el.querySelector(sel); if (!el) continue;
    const r = el.getBoundingClientRect(); if (!r.width || !inside(r)) continue;
    const x = r.left + r.width / 2, y = r.top + r.height / 2;
    if (document.elementFromPoint(x, y)?.closest(".card") === c.el) return [x, y];
  }
  return null;
})()`);

const results = [];
const check = (name, ok, info) => { results.push({ name, ok, info }); phase = "after: " + name; };
async function panTest(name, where, prep) {
  await run(`atlas.deselect && atlas.deselect(); getSelection().removeAllRanges(); ${prep}; 1`); await sleep(1200);
  const p = await spot(where);
  if (!p) return check(name, null, "no spot found");
  const a = await state();
  await drag(p[0], p[1], 260, 120);
  const b = await state();
  const moved = Math.round(b.tx - a.tx), movedY = Math.round(b.ty - a.ty);
  const cardMoved = a.lay !== b.lay;
  check(name, Math.abs(moved - 260) < 6 && Math.abs(movedY - 120) < 6 && !b.selText && !cardMoved,
    `map moved ${moved},${movedY} of 260,120; text selected: ${JSON.stringify(b.selText.slice(0, 40))}; card moved: ${cardMoved}; selection ${a.sel}→${b.sel}`);
}

await panTest("drag from empty ground (far)", "empty", "atlas.fitAll()");
await panTest("drag from empty ground (near)", "empty", "atlas.centerOn(20,0.7)");
await panTest("drag starting on a card picture", "plate", "atlas.centerOn(20,0.7)");
await panTest("drag starting on a card's caption text", "caption", "atlas.centerOn(20,0.7)");
await panTest("drag starting on a card title", "title", "atlas.centerOn(20,0.7)");
await panTest("drag starting on a live demo", "live", "atlas.centerOn(66,0.75)");
// A drag that starts on empty ground and passes over live demos on the way.
{
  await run(`atlas.deselect && atlas.deselect(); getSelection().removeAllRanges(); atlas.centerOn(66,0.75); 1`); await sleep(2500);
  const p = await run(`(() => { const L = [...document.querySelectorAll(".plate[data-live]")].map(e => e.getBoundingClientRect()).filter(r => r.width && r.left > 140 && r.left < 760 && r.top > 120 && r.bottom < 820); if (!L.length) return null; const r = L[0]; return [r.left - 30, r.top + r.height / 2, L.length]; })()`);
  if (!p) check("drag passing over live demos", null, "no live demo mounted");
  else {
    const a = await state(); await drag(p[0], p[1], 420, 0, 40); const b = await state();
    const moved = Math.round(b.tx - a.tx);
    check("drag passing over live demos", Math.abs(moved - 420) < 8 && !b.selText, `map moved ${moved} of 420 (${p[2]} demos live); text: ${JSON.stringify(b.selText.slice(0, 40))}`);
  }
}
// Moving a card by hand: press and hold, then drag; or drag with Alt. The map stays.
for (const [name, hold, mods] of [["Alt + drag a card: the card moves", 0, 1]]) {
  await run(`atlas.deselect && atlas.deselect(); atlas.centerOn(20,0.7); 1`); await sleep(900);
  const p = await spot("title"); const a = await state();
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: p[0], y: p[1], modifiers: mods });
  await mouse("mousePressed", p[0], p[1], { modifiers: mods }); await sleep(hold);
  for (let s = 1; s <= 20; s++) { await mouse("mouseMoved", p[0] + s * 8, p[1] + s * 4, { modifiers: mods }); await sleep(12); }
  await mouse("mouseReleased", p[0] + 160, p[1] + 80, { modifiers: mods }); await sleep(900);
  const b = await state();
  check(name, a.lay !== b.lay && Math.abs(b.tx - a.tx) < 2 && !b.selText, `card moved: ${a.lay !== b.lay}; map moved ${Math.round(b.tx - a.tx)}; text: ${JSON.stringify(b.selText.slice(0, 30))}`);
}
// Any selection at all (a range over images or canvases shows blue but has no text), for
// drags that start outside the map too, and for double clicks.
{
  const sel = () => run(`(() => { const s = getSelection(); return s.rangeCount && !s.isCollapsed ? (String(s).slice(0, 40) || "(non-text range: " + (s.anchorNode?.nodeName || "") + ")") : ""; })()`);
  const starts = {
    "top bar title": `document.querySelector(".ui-brand b")`, "top bar counts": `document.querySelector(".ui-brand span")`,
    "cluster ribbon note": `document.querySelector("#catNote")`, "cluster ribbon chip": `document.querySelector("#legend .cat b")`,
    "region name on the map": `document.querySelector(".rlabel b")`, "counter (HUD)": `document.querySelector(".hud")`,
    "overview label": `document.querySelector(".minilabel")`, "empty ground": null,
  };
  for (const [name, q] of Object.entries(starts)) {
    await run(`getSelection().removeAllRanges(); atlas.deselect && atlas.deselect(); atlas.centerOn(20,0.6); document.querySelector(".ui-ribbon-show")?.click(); 1`); await sleep(500);
    const p = q ? await run(`(() => { const e = ${q}; if (!e) return null; const r = e.getBoundingClientRect(); return r.width ? [r.left + Math.min(20, r.width / 2), r.top + r.height / 2] : null; })()`) : await spot("empty");
    if (!p) { check(`no selection: drag from ${name}`, null, "element not shown"); continue; }
    await drag(p[0], p[1], 300, 260, 30);
    const s = await sel();
    check(`no selection: drag from ${name}`, !s, s ? `selected ${JSON.stringify(s)}` : "nothing selected");
  }
  for (const [name, where] of [["double click on a caption", "caption"], ["double click on a title", "title"], ["triple click on a caption", "caption"]]) {
    await run(`getSelection().removeAllRanges(); atlas.deselect && atlas.deselect(); atlas.centerOn(20,0.7); 1`); await sleep(500);
    const p = await spot(where); const n = name.startsWith("triple") ? 3 : 2;
    for (let c = 1; c <= n; c++) { await send("Input.dispatchMouseEvent", { type: "mousePressed", x: p[0], y: p[1], button: "left", buttons: 1, clickCount: c }); await send("Input.dispatchMouseEvent", { type: "mouseReleased", x: p[0], y: p[1], button: "left", buttons: 0, clickCount: c }); }
    await sleep(300);
    const s = await sel();
    check(`no selection: ${name}`, !s, s ? `selected ${JSON.stringify(s)}` : "nothing selected");
  }
  // A press, a natural pause before moving (~0.5 s), then a drag: should still pan.
  await run(`getSelection().removeAllRanges(); atlas.deselect && atlas.deselect(); atlas.centerOn(20,0.7); 1`); await sleep(600);
  const p = await spot("caption"); const a = await state();
  await mouse("mousePressed", p[0], p[1]); await sleep(500);
  for (let s = 1; s <= 20; s++) { await mouse("mouseMoved", p[0] + s * 12, p[1] + s * 5); await sleep(12); }
  await mouse("mouseReleased", p[0] + 240, p[1] + 100); await sleep(300);
  const b = await state();
  check("press, pause half a second, then drag: the map pans", Math.abs(b.tx - a.tx - 240) < 6 && a.lay === b.lay, `map moved ${Math.round(b.tx - a.tx)} of 240; card moved: ${a.lay !== b.lay}`);
}
// Mouse released outside the window.
{
  await run(`atlas.centerOn(20,0.5); 1`); await sleep(800);
  const p = await spot("empty"); const a = await state();
  await mouse("mousePressed", p[0], p[1]);
  for (let s = 1; s <= 20; s++) { await mouse("mouseMoved", p[0], p[1] + s * 60); await sleep(10); }
  await mouse("mouseReleased", p[0], 1300); await sleep(200);
  await send("Input.dispatchMouseEvent", { type: "mouseMoved", x: p[0] + 100, y: 300, buttons: 0 }); await sleep(200);
  const b = await state();
  check("release outside the window, then move", Math.abs((b.tx - a.tx)) < 2, `after release tx moved ${Math.round(b.tx - a.tx)} (should stay)`);
}
// Click still selects a card, and a click on empty ground deselects.
{
  await run(`atlas.deselect && atlas.deselect(); atlas.centerOn(20,0.7); 1`); await sleep(900);
  const p = await spot("plate");
  await mouse("mousePressed", p[0], p[1]); await mouse("mouseReleased", p[0], p[1]); await sleep(500);
  const s1 = await state();
  const e = await spot("empty");
  await mouse("mousePressed", e[0], e[1]); await mouse("mouseReleased", e[0], e[1]); await sleep(300);
  const s2 = await state();
  check("click selects a card, click on ground deselects", s1.sel >= 0 && s2.sel === -1, `after card click sel=${s1.sel}, after ground click sel=${s2.sel}`);
}
// Wheel: the point under the cursor stays put.
{
  await run(`atlas.centerOn(20,0.4); 1`); await sleep(800);
  const x = 700, y = 420;
  const w0 = await run(`(() => { const r = document.getElementById("stage").getBoundingClientRect(), v = atlas.view; return [(${x} - r.left - v.tx) / v.k, (${y} - r.top - v.ty) / v.k]; })()`);
  for (let n = 0; n < 6; n++) { await send("Input.dispatchMouseEvent", { type: "mouseWheel", x, y, deltaX: 0, deltaY: -100 }); await sleep(30); }
  await sleep(900);
  const w1 = await run(`(() => { const r = document.getElementById("stage").getBoundingClientRect(), v = atlas.view; return [(${x} - r.left - v.tx) / v.k, (${y} - r.top - v.ty) / v.k, v.k]; })()`);
  check("wheel zoom keeps the point under the cursor", Math.hypot(w1[0] - w0[0], w1[1] - w0[1]) < 3 && w1[2] > 0.6, `drift ${Math.hypot(w1[0] - w0[0], w1[1] - w0[1]).toFixed(1)} map px, k 0.40→${w1[2].toFixed(2)}`);
}
// Zoom buttons and the overview.
{
  await run(`atlas.centerOn(20,0.5); 1`); await sleep(500);
  const k0 = (await state()).k;
  await run(`document.getElementById("zin").click(); 1`); await sleep(500); const k1 = (await state()).k;
  await run(`document.getElementById("zout").click(); document.getElementById("zout").click(); 1`); await sleep(500); const k2 = (await state()).k;
  await run(`document.getElementById("zfit").click(); 1`); await sleep(500); const k3 = (await state()).k;
  check("zoom buttons + − and fit", k1 > k0 && k2 < k1 && k3 < 0.2, `k ${k0.toFixed(2)} → + ${k1.toFixed(2)} → −− ${k2.toFixed(2)} → fit ${k3.toFixed(2)}`);
  const m = await run(`(() => { const r = document.getElementById("mini").getBoundingClientRect(); return r.width ? [r.left + r.width * 0.2, r.top + r.height * 0.5] : null; })()`);
  if (m) {
    await run(`atlas.centerOn(20,0.6); 1`); await sleep(400); const a = await state();
    await mouse("mousePressed", m[0], m[1]); await mouse("mouseReleased", m[0], m[1]); await sleep(400); const b = await state();
    check("overview map click moves the view", Math.abs(b.tx - a.tx) > 50, `tx ${Math.round(a.tx)} → ${Math.round(b.tx)}`);
  }
}
// Touch: one-finger pan, two-finger pinch.
{
  await send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 5 });
  await run(`atlas.centerOn(20,0.5); 1`); await sleep(600);
  const p = await spot("plate"); const a = await state();
  await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: p[0], y: p[1], id: 1 }] });
  for (let s = 1; s <= 20; s++) { await send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: p[0] + s * 10, y: p[1] + s * 5, id: 1 }] }); await sleep(12); }
  await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await sleep(300);
  const b = await state();
  check("touch: one-finger pan starting on a card", Math.abs(b.tx - a.tx - 200) < 8 && a.lay === b.lay, `map moved ${Math.round(b.tx - a.tx)},${Math.round(b.ty - a.ty)} of 200,100; card moved: ${a.lay !== b.lay}`);
  {
    await run(`atlas.centerOn(20,0.6); 1`); await sleep(500);
    const q = await spot("title"); const a2 = await state();
    await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: q[0], y: q[1], id: 1 }] }); await sleep(750);
    for (let s = 1; s <= 20; s++) { await send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: q[0] + s * 8, y: q[1] + s * 4, id: 1 }] }); await sleep(12); }
    await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await sleep(900);
    const b2 = await state();
    check("touch: press and hold a card, then drag: the card moves", a2.lay !== b2.lay && Math.abs(b2.tx - a2.tx) < 2, `card moved: ${a2.lay !== b2.lay}; map moved ${Math.round(b2.tx - a2.tx)}`);
  }
  const c = { x: 700, y: 450 }; const k0 = (await state()).k;
  await send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x: c.x - 50, y: c.y, id: 1 }, { x: c.x + 50, y: c.y, id: 2 }] });
  for (let s = 1; s <= 20; s++) { await send("Input.dispatchTouchEvent", { type: "touchMove", touchPoints: [{ x: c.x - 50 - s * 6, y: c.y, id: 1 }, { x: c.x + 50 + s * 6, y: c.y, id: 2 }] }); await sleep(12); }
  await send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] }); await sleep(500);
  const k1 = (await state()).k;
  check("touch: two-finger pinch zooms", k1 > k0 * 1.5, `k ${k0.toFixed(2)} → ${k1.toFixed(2)}`);
  await send("Emulation.setTouchEmulationEnabled", { enabled: false });
}
// Keyboard: Tab to a card, Enter opens it, Escape closes.
{
  await run(`atlas.deselect && atlas.deselect(); atlas.centerOn(20,0.7); document.activeElement.blur(); atlas.cards[20].el.focus(); 1`);
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 }); await send("Input.dispatchKeyEvent", { type: "keyUp", key: "Enter", code: "Enter", windowsVirtualKeyCode: 13 }); await sleep(300);
  const s1 = await state();
  await send("Input.dispatchKeyEvent", { type: "keyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27 }); await sleep(300);
  const s2 = await state();
  check("keyboard: Enter opens a focused card, Esc closes", s1.sel === 20 && s2.sel === -1, `sel after Enter ${s1.sel}, after Esc ${s2.sel}`);
}
const errs = await run(`__errs`);
console.log(`\n${label}`);
for (const r of results) console.log(`  ${r.ok === true ? "ok  " : r.ok === false ? "FAIL" : "--  "} ${r.name}: ${r.info}`);
console.log(`  page errors: ${errs && errs.length ? errs.join(" | ") : "none"}`); exc.forEach((x) => console.log("   exc " + x));
ws.close(); chrome.kill(); process.exit(0);
