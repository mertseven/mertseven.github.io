import { escapeHtml, search } from "/assets/js/catalog.js";

// Approaches A–H for the wall preview. Each scene takes the shared context from salon.js
// ({ stage, projects, entries, card, rows, KIND }) and may return a cleanup function.

// ——— A · Answer wall ———
// Quiet and sparse until you ask: the matches gather in front, the rest scatter.

export function answer({ stage, projects, entries, card }) {
  const W = stage.clientWidth;
  const H = stage.clientHeight;
  const cw = W < 700 ? 150 : 230;
  const ch = Math.round(cw * 0.5625);
  const askH = 150; // room kept clear at the bottom for the question and the box

  const wrap = document.createElement("div");
  wrap.className = "aw";
  wrap.innerHTML = projects.map((p) => card(p)).join("") + `
    <div class="aw-ask">
      <p class="aw-q">what are you <em>curious</em> about?</p>
      <input type="search" placeholder="try networks…" spellcheck="false" aria-label="Search the wall">
      <span class="aw-count"></span>
    </div>`;
  stage.append(wrap);
  const els = [...wrap.querySelectorAll(".c")];
  const input = wrap.querySelector("input");
  const count = wrap.querySelector(".aw-count");

  const items = els.map((el, i) => {
    el.style.width = `${cw}px`;
    el.querySelector(".c-img").style.height = `${ch}px`;
    return {
      el,
      id: projects[i].id,
      hx: Math.random() * (W - cw),
      hy: 10 + Math.random() * Math.max(10, H - askH - ch - 10),
      x: W / 2 - cw / 2,
      y: H / 2 - ch / 2,
      s: 0.2,
      o: 0,
      vx: (Math.random() < 0.5 ? -1 : 1) * (4 + Math.random() * 8),
      ph: Math.random() * 6.28,
    };
  });

  let hits = null;   // ids matching the typed query
  let hinted = null; // ids matching the rotating hint
  const HINTS = ["networks", "Bergson", "journalism", "teaching", "philosophy", "Three.js", "mapping"];
  let h = 0;
  const idsFor = (q) => new Set(search(entries, q, Infinity).filter((e) => e.type === "Project").map((e) => e.raw.id));
  const setHint = () => {
    input.placeholder = `try ${HINTS[h]}…`;
    hinted = idsFor(HINTS[h]);
    h = (h + 1) % HINTS.length;
  };
  setHint();
  const hintTimer = setInterval(() => { if (!input.value) setHint(); }, 3200);

  input.addEventListener("input", () => {
    const q = input.value.trim();
    hits = q ? idsFor(q) : null;
    count.textContent = q ? `${hits.size} project${hits.size === 1 ? "" : "s"}` : "";
  });

  let raf;
  let last = performance.now();
  const tick = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now / 1000;
    // Matches gather in a centred grid above the box.
    const lit = hits ? items.filter((it) => hits.has(it.id)) : [];
    const cols = Math.max(1, Math.min(lit.length, W < 700 ? 2 : 4));
    const gw = cols * (cw + 16) - 16;
    const gh = Math.ceil(lit.length / cols) * (ch + 16) - 16;
    const top = Math.max(16, (H - askH - gh) / 2);
    lit.forEach((it, k) => {
      it.tx = (W - gw) / 2 + (k % cols) * (cw + 16);
      it.ty = top + Math.floor(k / cols) * (ch + 16);
    });
    for (const it of items) {
      it.hx += it.vx * dt;
      if (it.hx < -cw) it.hx = W;
      if (it.hx > W) it.hx = -cw;
      const bob = Math.sin(t * 0.6 + it.ph) * 6;
      let tx = it.hx, ty = it.hy + bob, ts = 0.55, to = 0.45;
      if (hits) {
        if (hits.has(it.id)) { tx = it.tx; ty = it.ty; ts = 1; to = 1; }
        else {
          // Pushed out toward the nearer side, small and faint.
          tx = it.hx < W / 2 ? it.hx * 0.4 - cw * 0.2 : W - (W - it.hx) * 0.4 - cw * 0.8;
          ts = 0.4; to = 0.12;
        }
      } else if (hinted?.has(it.id)) { ts = 0.78; to = 0.95; }
      const k = Math.min(1, dt * 4);
      it.x += (tx - it.x) * k;
      it.y += (ty - it.y) * k;
      it.s += (ts - it.s) * k;
      it.o += (to - it.o) * k;
      it.el.style.transform = `translate(${it.x.toFixed(1)}px, ${it.y.toFixed(1)}px) scale(${it.s.toFixed(3)})`;
      it.el.style.opacity = it.o.toFixed(3);
      it.el.style.zIndex = Math.round(it.s * 100);
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => { cancelAnimationFrame(raf); clearInterval(hintTimer); };
}

// ——— B · Names ———
// The titles are the wall; a picture appears beside the cursor only when asked for.

export function names({ stage, projects }) {
  const W = stage.clientWidth;
  const peek = document.getElementById("peek");
  const wrap = document.createElement("div");
  wrap.className = "names";
  stage.append(wrap);
  const rowsN = 4;
  for (let r = 0; r < rowsN; r++) {
    const list = projects.filter((_, i) => i % rowsN === r);
    const one = list.map((p) => {
      const i = projects.indexOf(p);
      return `<a class="nm k-${p.kind}" href="${escapeHtml(p.url)}" target="_blank" rel="noopener" data-i="${i}">${escapeHtml(p.title)}<sup>${String(i + 1).padStart(2, "0")}</sup></a>`;
    }).join("");
    const track = document.createElement("div");
    track.className = `track${r % 2 ? " rev" : ""}`;
    track.innerHTML = one;
    wrap.append(track);
    const runW = track.scrollWidth;
    const reps = Math.max(1, Math.ceil((W * 1.4) / runW));
    const run = one.repeat(reps);
    track.innerHTML = run + run;
    track.style.setProperty("--dur", `${((runW * reps) / (r % 2 ? 40 : 30)).toFixed(0)}s`);
  }

  const onOver = (e) => {
    const a = e.target.closest(".nm");
    if (!a) return;
    const p = projects[a.dataset.i];
    wrap.classList.add("has-hover");
    wrap.querySelectorAll(".nm.on").forEach((n) => n.classList.remove("on"));
    wrap.querySelectorAll(`.nm[data-i="${a.dataset.i}"]`).forEach((n) => n.classList.add("on"));
    peek.innerHTML = p.image ? `<img src="${escapeHtml(p.image)}" alt="">` : `<span class="c-type">${escapeHtml(p.title)}</span>`;
    peek.classList.add("on");
  };
  const onOut = (e) => {
    if (e.relatedTarget?.closest?.(".nm")) return;
    wrap.classList.remove("has-hover");
    wrap.querySelectorAll(".nm.on").forEach((n) => n.classList.remove("on"));
    peek.classList.remove("on");
  };
  const onMove = (e) => {
    const x = Math.min(innerWidth - 360, e.clientX + 24);
    const y = Math.min(innerHeight - 210, e.clientY + 24);
    peek.style.transform = `translate(${x}px, ${y}px)`;
  };
  wrap.addEventListener("pointerover", onOver);
  wrap.addEventListener("pointerout", onOut);
  addEventListener("pointermove", onMove);
  return () => { removeEventListener("pointermove", onMove); peek.classList.remove("on"); };
}

// ——— C · ASCII print ———
// Every screenshot redrawn in characters, so the whole body of work shares one material.

const RAMP = " .,:;-=+*%#@"; // paper to dense ink
const asciiCache = new Map();

export function ascii(ctx) {
  ctx.rows(ctx.mode);
  for (const el of ctx.stage.querySelectorAll(".c")) {
    const img = el.querySelector("img");
    if (!img) continue;
    const box = el.querySelector(".c-img");
    const canvas = document.createElement("canvas");
    box.append(canvas);
    drawAscii(img.getAttribute("src"), canvas, box);
  }
}

async function drawAscii(src, canvas, box) {
  const cols = 72;
  const rowsN = Math.round(cols * 0.5625 * 0.52); // a character is about twice as tall as wide
  let cells = asciiCache.get(src);
  if (!cells) {
    const img = new Image();
    img.src = src;
    try { await img.decode(); } catch { return; }
    const c = document.createElement("canvas");
    c.width = cols;
    c.height = rowsN;
    const g = c.getContext("2d", { willReadFrequently: true });
    // Cover-crop from the top at 16:9, as the cards do.
    const sw = img.naturalWidth;
    const sh = Math.min(img.naturalHeight, sw * 0.5625);
    g.drawImage(img, 0, 0, sw, sh, 0, 0, cols, rowsN);
    const d = g.getImageData(0, 0, cols, rowsN).data;
    const raw = [];
    for (let i = 0; i < cols * rowsN; i++) {
      const l = (0.299 * d[i * 4] + 0.587 * d[i * 4 + 1] + 0.114 * d[i * 4 + 2]) / 255;
      raw.push(1 - l); // amount of ink
    }
    // Most screenshots are pale pages: stretch each one to its own darkest and lightest
    // so the whole ramp is used, then lift the midtones a little.
    const sorted = [...raw].sort((a, b) => a - b);
    const lo = sorted[Math.floor(sorted.length * 0.02)];
    const hi = Math.max(lo + 0.08, sorted[Math.floor(sorted.length * 0.98)]);
    cells = raw.map((v) => Math.pow(Math.min(1, Math.max(0, (v - lo) / (hi - lo))), 0.7));
    asciiCache.set(src, cells);
  }
  const W = box.clientWidth;
  const H = box.clientHeight;
  const dpr = Math.min(2, devicePixelRatio || 1);
  canvas.width = W * dpr;
  canvas.height = H * dpr;
  const g = canvas.getContext("2d");
  g.scale(dpr, dpr);
  g.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--paper").trim() || "#f4f3ef";
  g.fillRect(0, 0, W, H);
  const cw = W / cols;
  const chh = H / rowsN;
  g.font = `600 ${Math.round(chh * 0.92)}px "Geist Mono", ui-monospace, monospace`;
  g.textAlign = "center";
  g.textBaseline = "middle";
  for (let r = 0; r < rowsN; r++) {
    for (let c = 0; c < cols; c++) {
      const ink = cells[r * cols + c];
      // Even blank paper keeps a faint dot, so every card reads as one printed field.
      const ch = ink < 0.06 ? "." : RAMP[Math.min(RAMP.length - 1, Math.floor(ink * RAMP.length))];
      g.fillStyle = `rgba(22, 23, 27, ${(ink < 0.06 ? 0.16 : 0.3 + ink * 0.7).toFixed(2)})`;
      g.fillText(ch, c * cw + cw / 2, r * chh + chh / 2);
    }
  }
}

// ——— D · Live ———
// The work running, not a picture of it. (On the site these would be short silent loops.)

export function live({ stage, projects }) {
  const pick = ["networkcanvas", "philosophical-networks", "critical-theory", "socrates", "etkilesim-atlasi", "ima-lab", "jstudio", "grad-projects"];
  const ps = pick.map((id) => projects.find((p) => p.id === id)).filter(Boolean);
  const wrap = document.createElement("div");
  wrap.className = "live";
  wrap.innerHTML = ps.map((p) => `
    <div class="cell">
      <div class="frame"><iframe src="${escapeHtml(p.url)}" loading="lazy" tabindex="-1" title="${escapeHtml(p.title)}"></iframe></div>
      <div class="cap"><span class="dot"></span><span>${escapeHtml(p.title)}</span><span class="mono">live</span></div>
    </div>`).join("");
  stage.append(wrap);
  const fit = () => {
    for (const f of wrap.querySelectorAll(".frame")) {
      const s = Math.max(f.clientWidth / 1280, f.clientHeight / 800);
      f.querySelector("iframe").style.transform = `scale(${s})`;
    }
  };
  fit();
  requestAnimationFrame(fit);
}

// ——— E · Contact sheet ———
// A photographer's strip of negatives, the picks circled in grease pencil.

export function contact({ stage, projects }) {
  const H = stage.clientHeight;
  const fw = Math.round(Math.min(220, Math.max(140, ((H - 160) / 3) * 1.5 - 30)));
  const wrap = document.createElement("div");
  wrap.className = "sheet";
  wrap.style.setProperty("--fw", `${fw}px`);
  // A loose, hand-drawn loop that does not quite close.
  const grease = () => {
    const j = () => Math.random() * 6 - 3;
    const d = `M${8 + j()} ${52 + j()} C 6 ${12 + j()}, ${92 + j()} 6, 95 ${48 + j()} S ${30 + j()} 102, ${10 + j()} ${58 + j()} C 12 30, ${60 + j()} 4, ${86 + j()} ${24 + j()}`;
    return `<svg viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><path class="grease" vector-effect="non-scaling-stroke" d="${d}"/></svg>`;
  };
  for (let r = 0; r < 3; r++) {
    const list = projects.slice(r * 10).concat(projects.slice(0, r * 10));
    const frames = list.map((p) => {
      const n = projects.indexOf(p) + 1;
      const pic = p.image ? `<img src="${escapeHtml(p.image)}" alt="" loading="lazy">` : `<span class="c-type">${escapeHtml(p.title)}</span>`;
      return `<a class="fr" href="${escapeHtml(p.url)}" target="_blank" rel="noopener">${pic}<span class="no">▸ ${n}${"ABC"[r]}<b>${escapeHtml(p.title)}</b></span>${p.kind === "Featured" ? grease() : ""}</a>`;
    }).join("");
    const strip = document.createElement("div");
    strip.className = `strip ${r === 1 ? "tilt-b" : "tilt-a"}`;
    strip.innerHTML = frames + frames;
    strip.style.setProperty("--dur", `${((list.length * (fw + 6)) / (r === 1 ? 16 : 12)).toFixed(0)}s`);
    if (r === 1) strip.style.animationDirection = "reverse";
    wrap.append(strip);
  }
  stage.append(wrap);
}

// ——— F · Table ———
// Prints scattered on a table: drag them, shuffle them, pull one to the top.

export function table({ stage, projects }) {
  const W = stage.clientWidth;
  const H = stage.clientHeight;
  const pw = W < 700 ? 150 : 210;
  const wrap = document.createElement("div");
  wrap.className = "table";
  wrap.style.setProperty("--pw", `${pw}px`);
  wrap.innerHTML = projects.map((p) => `<div class="print">${p.image ? `<img src="${escapeHtml(p.image)}" alt="" draggable="false">` : `<span class="c-type">${escapeHtml(p.title)}</span>`}<span>${escapeHtml(p.title)}</span></div>`).join("");
  stage.append(wrap);
  let z = 1;
  [...wrap.children].forEach((el, i) => {
    const it = { x: 20 + Math.random() * (W - pw - 40), y: 20 + Math.random() * (H - pw * 0.8 - 40), r: Math.random() * 24 - 12 };
    el.style.zIndex = z++;
    const place = () => { el.style.transform = `translate(${it.x}px, ${it.y}px) rotate(${it.r}deg)`; };
    place();
    el.animate(
      [{ transform: `translate(${it.x}px, ${it.y - 60}px) rotate(${it.r * 2}deg) scale(1.15)`, opacity: 0 }, { transform: el.style.transform, opacity: 1 }],
      { duration: 520, delay: i * 45, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", fill: "backwards" },
    );
    let drag = null;
    el.addEventListener("pointerdown", (e) => {
      el.setPointerCapture(e.pointerId);
      el.style.zIndex = ++z;
      el.classList.add("grab");
      drag = { dx: e.clientX - it.x, dy: e.clientY - it.y, r0: it.r };
    });
    el.addEventListener("pointermove", (e) => {
      if (!drag) return;
      const nx = e.clientX - drag.dx;
      it.r = drag.r0 + Math.max(-6, Math.min(6, (nx - it.x) * 0.8)); // a little swing as it is pulled
      it.x = nx;
      it.y = e.clientY - drag.dy;
      place();
    });
    const end = () => { drag = null; el.classList.remove("grab"); };
    el.addEventListener("pointerup", end);
    el.addEventListener("pointercancel", end);
  });
}

// ——— G · One at a time ———
// The opposite of a wall: one project fills the frame, then the next, slowly.

export function one({ stage, projects, KIND }) {
  const MS = 5200;
  const list = projects.filter((p) => p.image);
  let at = 0;
  const wrap = document.createElement("div");
  wrap.className = "one";
  wrap.innerHTML = `
    <div class="slide on"></div><div class="slide"></div>
    <div class="shade"></div>
    <div class="cap">
      <span class="label k"></span>
      <h2></h2>
      <p></p>
      <div class="row"><button type="button" data-d="-1" aria-label="Previous">←</button><span class="n"></span><span class="bar-p"><i></i></span><button type="button" data-d="1" aria-label="Next">→</button></div>
    </div>`;
  stage.append(wrap);
  wrap.style.setProperty("--ms", `${MS}ms`);
  const slides = [...wrap.querySelectorAll(".slide")];
  let front = 0;
  const show = (i, first) => {
    const p = list[i];
    const next = first ? slides[0] : slides[1 - front];
    next.innerHTML = `<img src="${escapeHtml(p.image)}" alt="">`;
    if (!first) {
      slides[front].classList.remove("on");
      next.classList.add("on");
      front = 1 - front;
    }
    wrap.querySelector(".k").textContent = KIND[p.kind];
    wrap.querySelector("h2").textContent = p.title;
    wrap.querySelector("p").textContent = p.summary;
    wrap.querySelector(".n").textContent = `${String(i + 1).padStart(2, "0")} / ${String(list.length).padStart(2, "0")}`;
    const bar = wrap.querySelector(".bar-p i");
    bar.style.animation = "none";
    bar.getBoundingClientRect();
    bar.style.animation = "";
  };
  show(0, true);
  const advance = () => { at = (at + 1) % list.length; show(at); };
  let timer = setInterval(advance, MS);
  wrap.addEventListener("click", (e) => {
    const b = e.target.closest("[data-d]");
    if (!b) return;
    clearInterval(timer);
    at = (at + Number(b.dataset.d) + list.length) % list.length;
    show(at);
    timer = setInterval(advance, MS);
  });
  return () => clearInterval(timer);
}

// ——— H · Concept map ———
// Projects on a plane: theory to practice across, teaching to experiment down.

export function map({ stage, projects }) {
  const W = stage.clientWidth;
  const H = stage.clientHeight;
  // A rough first placement from the topic tags, for the owner to correct by hand.
  const PRACTICE = { Philosophy: -2, Networks: -1, Data: -0.6, AI: -0.4, Storytelling: -0.8, Journalism: 0.3, Education: 0.4, Design: 0.6, Collaboration: 0.4, "Real-time": 0.9, Interaction: 0.8, "3D": 0.8, Mapping: 0.7, Exhibition: 0.6, Tools: 1.4, Interface: 1.6, Mobile: 1.6, Location: 1.2, AR: 1.4, Play: 1.2, "Computer vision": 1.0 };
  const UP = { Teaching: 1.4, Featured: 0.1, Experiment: -1.3 };
  const PW = 1800, PH = 1100; // the plane is larger than the window, to pan around
  const mw = 132;
  const nodes = projects.map((p) => {
    const px = p.topics.reduce((s, t) => s + (PRACTICE[t] ?? 0), 0) / p.topics.length;
    const py = UP[p.kind] + (p.topics.includes("Education") ? 0.5 : 0);
    return { p, x: PW / 2 + px * 360 + (Math.random() - 0.5) * 80, y: PH / 2 - py * 260 + (Math.random() - 0.5) * 80 };
  });
  // Nudge apart until no two cards overlap.
  for (let k = 0; k < 120; k++) {
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const a = nodes[i], b = nodes[j];
        const dx = b.x - a.x, dy = b.y - a.y;
        const ox = mw + 18 - Math.abs(dx), oy = mw * 0.5625 + 34 - Math.abs(dy);
        if (ox > 0 && oy > 0) {
          if (ox < oy) { const s = ((dx < 0 ? -1 : 1) * ox) / 2; a.x -= s; b.x += s; }
          else { const s = ((dy < 0 ? -1 : 1) * oy) / 2; a.y -= s; b.y += s; }
        }
      }
    }
  }
  const pic = (p) => p.image
    ? `<img src="${escapeHtml(p.image)}" alt="" draggable="false">`
    : `<span class="c-type" style="font-size:0.7rem;padding:6px">${escapeHtml(p.title)}</span>`;
  const wrap = document.createElement("div");
  wrap.className = "map";
  wrap.style.setProperty("--mw", `${mw}px`);
  wrap.innerHTML = `
    <div class="map-plane" style="width:${PW}px;height:${PH}px">
      <div class="axis" style="left:0;right:0;top:${PH / 2}px;height:1px"></div>
      <div class="axis" style="top:0;bottom:0;left:${PW / 2}px;width:1px"></div>
      <span class="ax-l" style="left:${PW / 2 - 560}px;top:${PH / 2 + 8}px">← Theory</span>
      <span class="ax-l" style="left:${PW / 2 + 480}px;top:${PH / 2 + 8}px">Practice →</span>
      <span class="ax-l" style="left:${PW / 2 + 8}px;top:${PH / 2 - 400}px">↑ Teaching</span>
      <span class="ax-l" style="left:${PW / 2 + 8}px;top:${PH / 2 + 380}px">↓ Experiment</span>
      ${nodes.map((n) => `<a class="c" href="${escapeHtml(n.p.url)}" target="_blank" rel="noopener" style="left:${(n.x - mw / 2).toFixed(0)}px;top:${(n.y - mw * 0.28).toFixed(0)}px"><div class="c-img">${pic(n.p)}</div><span class="mt">${escapeHtml(n.p.title)}</span></a>`).join("")}
    </div>
    <span class="map-hint">drag to pan · scroll to zoom</span>`;
  stage.append(wrap);
  const plane = wrap.querySelector(".map-plane");
  let s = Math.min(1, Math.max(W / PW, H / PH) * 1.05);
  let tx = (W - PW * s) / 2;
  let ty = (H - PH * s) / 2;
  const apply = () => { plane.style.transform = `translate(${tx}px, ${ty}px) scale(${s})`; };
  apply();
  let drag = null;
  let moved = false;
  wrap.addEventListener("pointerdown", (e) => {
    drag = { x: e.clientX - tx, y: e.clientY - ty };
    moved = false;
    wrap.classList.add("grab");
  });
  wrap.addEventListener("pointermove", (e) => {
    if (!drag) return;
    const nx = e.clientX - drag.x;
    const ny = e.clientY - drag.y;
    if (Math.abs(nx - tx) + Math.abs(ny - ty) > 2) moved = true;
    tx = nx;
    ty = ny;
    apply();
  });
  const end = () => { drag = null; wrap.classList.remove("grab"); };
  wrap.addEventListener("pointerup", end);
  wrap.addEventListener("pointerleave", end);
  // A drag that ends over a card should not open it.
  wrap.addEventListener("click", (e) => { if (moved) e.preventDefault(); }, true);
  wrap.addEventListener("wheel", (e) => {
    e.preventDefault();
    const r = wrap.getBoundingClientRect();
    const mx = e.clientX - r.left;
    const my = e.clientY - r.top;
    const ns = Math.min(2.2, Math.max(0.35, s * Math.exp(-e.deltaY * 0.0015)));
    tx = mx - ((mx - tx) * ns) / s;
    ty = my - ((my - ty) * ns) / s;
    s = ns;
    apply();
  }, { passive: false });
}
