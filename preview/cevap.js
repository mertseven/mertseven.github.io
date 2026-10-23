import { loadCatalog, escapeHtml, search } from "/assets/js/catalog.js";
import { answer } from "./approaches.js";
import { ab4 as curvedNames } from "./curved.js";

// A + B: three ways to put the name wall together with the answer wall.

const KIND = { Featured: "Featured", Teaching: "Teaching", Experiment: "Experiment" };
const HINTS = ["networks", "Bergson", "journalism", "teaching", "philosophy", "Three.js", "mapping"];
const HINT_MS = 3200;

const MODES = [
  {
    id: "ab1", label: "1 · İsimler sakin hal, kartlar cevap",
    about: "<b>Önerdiğim.</b> Başta yalnızca proje adları akıyor, görsel yok. Yazınca eşleşen adlar koyulaşıp italiğe dönüyor, gerisi soluyor; eşleşen projelerin kartları <b>isimlerinin bulunduğu yerden</b> öne uçup toplanıyor. Kutu boşken dönen ipucunun adları italik olarak öne çıkıyor.",
  },
  {
    id: "ab2", label: "2 · İsimler arka planda filigran",
    about: "<b>Cevap duvarı olduğu gibi, arkasında isimler.</b> Kartlar önde süzülüyor; arkada çok soluk, büyük harflerle proje adları akıyor. Yazınca eşleşen adlar arkada da biraz koyulaşıyor. Daha zengin, ama iki hareketli katman kalabalıklaşabilir.",
  },
  {
    id: "ab4", label: "4 · İsim + logo, kavisli", pick: true,
    about: "<b>3 numaranın kavisli ve logolu hali.</b> Her adın başında projenin işareti var (şimdilik yer tutucu: Featured dolu, öğretim kontur, deney kesik çizgili). Şeritler ana sayfadaki duvar gibi kavisli: ortadakiler düz, kenardakiler sana dönüyor. Yazınca cevap, yatay ekseninde dönen bir silindir gibi diziliyor; <b>fare tekerleğiyle çevir</b>, öndekine tıklayınca açılır.",
  },
  {
    id: "ab3", label: "3 · Cevap isimlerle geliyor",
    about: "<b>Kart yok, yalnızca tipografi.</b> Başta isimler akıyor. Yazınca şeritler soluyor ve eşleşen projelerin adları ortada büyük bir liste olarak diziliyor; görsel ancak bir adın üzerine gelince imlecin yanında çıkıyor. En sade ve en hızlı; ama kartların öne uçtuğu an yok.",
  },
];

const stage = document.getElementById("stage");
const modesEl = document.getElementById("modes");
const about = document.getElementById("about");
const bar = document.getElementById("bar");
const peek = document.getElementById("peek");

const { projects, entries } = await loadCatalog();
const idsFor = (q) => new Set(search(entries, q, Infinity).filter((e) => e.type === "Project").map((e) => e.raw.id));

let stop = () => {};
let current = null;

const row = document.createElement("div");
row.className = "modes-row";
for (const m of MODES) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = `chip${m.pick ? " chip--pick" : ""}`;
  b.textContent = m.label;
  b.dataset.id = m.id;
  b.addEventListener("click", () => show(m.id));
  row.append(b);
}
modesEl.append(row);
show(MODES.some((m) => m.id === location.hash.slice(1)) ? location.hash.slice(1) : "ab4");

let resizeTimer;
addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => show(current.id), 200);
});

function show(id) {
  current = MODES.find((m) => m.id === id);
  history.replaceState(null, "", `#${id}`);
  for (const b of row.querySelectorAll(".chip")) b.setAttribute("aria-pressed", String(b.dataset.id === id));
  about.innerHTML = current.about;
  document.documentElement.style.setProperty("--bar-h", `${bar.offsetHeight}px`);
  stop();
  peek.classList.remove("on");
  stage.className = "stage";
  stage.replaceChildren();
  stop = ({ ab1, ab2, ab3, ab4 })[id]() || (() => {});
}

// ——— Shared pieces ———

function pic(p) {
  return p.image ? `<img src="${escapeHtml(p.image)}" alt="">` : `<span class="c-type">${escapeHtml(p.title)}</span>`;
}

// Rows of project names drifting in opposite directions. Hovering a name shows its
// picture beside the cursor. Returns the container and a way to mark names.
function nameRows(host, { rows: rowsN = 4, peekable = true } = {}) {
  const W = stage.clientWidth;
  const wrap = document.createElement("div");
  wrap.className = "names";
  host.append(wrap);
  for (let r = 0; r < rowsN; r++) {
    const list = projects.filter((_, i) => i % rowsN === r);
    const one = list.map((p) => {
      const i = projects.indexOf(p);
      return `<a class="nm k-${p.kind}" href="${escapeHtml(p.url)}" target="_blank" rel="noopener" data-i="${i}" data-id="${escapeHtml(p.id)}">${escapeHtml(p.title)}<sup>${String(i + 1).padStart(2, "0")}</sup></a>`;
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
  const off = peekable ? hoverPeek(wrap, ".nm") : () => {};
  const mark = (cls, ids) => {
    for (const n of wrap.querySelectorAll(".nm")) n.classList.toggle(cls, Boolean(ids?.has(n.dataset.id)));
  };
  return { wrap, mark, off };
}

// The picture of whatever `sel` element is under the cursor, riding beside it.
function hoverPeek(root, sel) {
  const over = (e) => {
    const a = e.target.closest(sel);
    if (!a) return;
    const p = projects[a.dataset.i];
    peek.innerHTML = pic(p);
    peek.classList.add("on");
    root.classList.add("has-hover");
  };
  const out = (e) => {
    if (e.relatedTarget?.closest?.(sel)) return;
    peek.classList.remove("on");
    root.classList.remove("has-hover");
  };
  const move = (e) => {
    const x = Math.min(innerWidth - 360, e.clientX + 24);
    const y = Math.min(innerHeight - 210, e.clientY + 24);
    peek.style.transform = `translate(${x}px, ${y}px)`;
  };
  root.addEventListener("pointerover", over);
  root.addEventListener("pointerout", out);
  addEventListener("pointermove", move);
  return () => { removeEventListener("pointermove", move); peek.classList.remove("on"); };
}

// The question and the box at the bottom, with a hint that rotates while it is empty.
function askBox(onQuery, onHint) {
  const ask = document.createElement("div");
  ask.className = "aw-ask";
  ask.innerHTML = `
    <p class="aw-q">what are you <em>curious</em> about?</p>
    <input type="search" spellcheck="false" aria-label="Search the wall">
    <span class="aw-count"></span>`;
  stage.append(ask);
  const input = ask.querySelector("input");
  const count = ask.querySelector(".aw-count");
  let h = 0;
  const hint = () => {
    input.placeholder = `try ${HINTS[h]}…`;
    onHint(idsFor(HINTS[h]));
    h = (h + 1) % HINTS.length;
  };
  hint();
  const timer = setInterval(() => { if (!input.value) hint(); }, HINT_MS);
  input.addEventListener("input", () => {
    const q = input.value.trim();
    const ids = q ? idsFor(q) : null;
    count.textContent = q ? `${ids.size} project${ids.size === 1 ? "" : "s"}` : "";
    onQuery(q, ids);
    if (!q) onHint(idsFor(HINTS[(h + HINTS.length - 1) % HINTS.length]));
  });
  return () => clearInterval(timer);
}

// ——— 1 · Names at rest, cards as the answer ———

function ab1() {
  const area = document.createElement("div");
  area.className = "names-area";
  stage.append(area);
  const names = nameRows(area);
  const W = stage.clientWidth;
  const H = stage.clientHeight;
  const fw = W < 700 ? 150 : 220;
  const fh = Math.round(fw * 0.5625) + 42;
  let flying = [];

  // The visible copy of a project's name nearest the centre: where its card takes off.
  const nameRect = (id) => {
    const box = stage.getBoundingClientRect();
    let best = null, bestD = Infinity;
    for (const n of names.wrap.querySelectorAll(`.nm[data-id="${CSS.escape(id)}"]`)) {
      const r = n.getBoundingClientRect();
      if (r.right < box.left || r.left > box.right) continue;
      const d = Math.abs(r.left + r.width / 2 - (box.left + box.width / 2));
      if (d < bestD) { bestD = d; best = r; }
    }
    return best && { x: best.left - box.left, y: best.top - box.top, w: best.width, h: best.height };
  };

  const land = (ids) => {
    // Send the old cards back into their names.
    for (const f of flying) {
      const back = nameRect(f.dataset.id);
      const a = f.animate(
        [{ opacity: 1 }, { opacity: 0, transform: back ? `translate(${back.x}px, ${back.y}px) scale(0.25)` : f.style.transform }],
        { duration: 260, easing: "ease-in", fill: "forwards" },
      );
      a.finished.then(() => f.remove(), () => f.remove());
    }
    flying = [];
    if (!ids || !ids.size) return;
    const list = projects.filter((p) => ids.has(p.id)).slice(0, 12);
    const cols = Math.min(list.length, W < 700 ? 2 : 4);
    const rowsN = Math.ceil(list.length / cols);
    const gw = cols * (fw + 16) - 16;
    const gh = rowsN * (fh + 16) - 16;
    const top = Math.max(12, (H - 150 - gh) / 2);
    list.forEach((p, k) => {
      const el = document.createElement("a");
      el.className = "c fly";
      el.href = p.url;
      el.target = "_blank";
      el.rel = "noopener";
      el.dataset.id = p.id;
      el.style.setProperty("--fw", `${fw}px`);
      el.innerHTML = `<div class="c-img">${pic(p)}</div><div class="c-cap"><span class="c-no">No.&nbsp;${String(projects.indexOf(p) + 1).padStart(2, "0")}</span><span class="c-title">${escapeHtml(p.title)}</span><span class="c-med">${KIND[p.kind]} · ${p.stack.map(escapeHtml).join(", ")}</span></div>`;
      const x = (W - gw) / 2 + (k % cols) * (fw + 16);
      const y = top + Math.floor(k / cols) * (fh + 16);
      el.style.transform = `translate(${x}px, ${y}px)`;
      stage.append(el);
      const from = nameRect(p.id);
      el.animate(
        [
          { transform: from ? `translate(${from.x}px, ${from.y}px) scale(0.2)` : `translate(${x}px, ${y + 40}px) scale(0.6)`, opacity: 0, filter: "blur(8px)" },
          { opacity: 1, offset: 0.4 },
          { transform: `translate(${x}px, ${y}px)`, opacity: 1, filter: "blur(0)" },
        ],
        { duration: 700, delay: k * 45, easing: "cubic-bezier(0.16, 0.84, 0.24, 1)", fill: "backwards" },
      );
      flying.push(el);
    });
  };

  const stopAsk = askBox(
    (q, ids) => {
      names.wrap.classList.toggle("is-q", Boolean(q));
      names.mark("hit", ids);
      names.mark("hint", null);
      land(ids);
    },
    (ids) => { if (!names.wrap.classList.contains("is-q")) names.mark("hint", ids); },
  );
  return () => { stopAsk(); names.off(); };
}

// ——— 2 · Watermark ———

function ab2() {
  const wm = document.createElement("div");
  wm.className = "watermark";
  stage.append(wm);
  const names = nameRows(wm, { rows: 4, peekable: false });
  const stopWall = answer({ stage, projects, entries, card: (p) => `
    <a class="c" href="${escapeHtml(p.url)}" target="_blank" rel="noopener" data-id="${escapeHtml(p.id)}">
      <div class="c-img">${pic(p)}</div>
    </a>` });
  const input = stage.querySelector(".aw-ask input");
  input.addEventListener("input", () => {
    const q = input.value.trim();
    names.mark("hit", q ? idsFor(q) : null);
  });
  return () => { stopWall?.(); names.off(); };
}

// ——— 4 · Names with marks, curved (preview/curved.js) ———

function ab4() {
  return curvedNames({ stage, projects, KIND, askBox, hoverPeek });
}

// ——— 3 · The answer is names ———

function ab3() {
  const area = document.createElement("div");
  area.className = "names-area";
  stage.append(area);
  const names = nameRows(area);
  const list = document.createElement("div");
  list.className = "answer-list";
  stage.append(list);
  const offList = hoverPeek(list, "a");

  const stopAsk = askBox(
    (q, ids) => {
      area.classList.toggle("is-listing", Boolean(q));
      names.mark("hint", null);
      if (!q) { list.replaceChildren(); return; }
      const ps = projects.filter((p) => ids.has(p.id)).slice(0, 8);
      list.innerHTML = ps.length
        ? ps.map((p) => `<a href="${escapeHtml(p.url)}" target="_blank" rel="noopener" data-i="${projects.indexOf(p)}"><span class="k">${KIND[p.kind]}</span>${escapeHtml(p.title)}<sup>${String(projects.indexOf(p) + 1).padStart(2, "0")}</sup></a>`).join("")
        : `<span class="none">Nothing for “${escapeHtml(q)}” yet.</span>`;
      [...list.children].forEach((a, k) => a.animate(
        [{ opacity: 0, transform: "translateY(18px)" }, { opacity: 1, transform: "none" }],
        { duration: 420, delay: k * 55, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)", fill: "backwards" },
      ));
    },
    (ids) => { if (!area.classList.contains("is-listing")) names.mark("hint", ids); },
  );
  return () => { stopAsk(); names.off(); offList(); };
}
