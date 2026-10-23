import { escapeHtml } from "/assets/js/catalog.js";

// 4 · Names with marks, curved. At rest the names drift in rows bent like a cinema
// screen; the answer stands up as a drum of names turning on a horizontal axis.
// Takes the shared pieces from cevap.js: { stage, projects, KIND, askBox, hoverPeek }.

const CURVE_DEG = 32;    // angle of a name at the screen edge
const CURVE_DEPTH = 200; // how far toward you the edges come, in px
const EDGE_U = 1.3;      // where the curve ends, in half-widths from the centre
const STEP = 20;         // degrees between names on the drum

// A placeholder mark for each project until it has its own logo: a shape and an inner
// cut picked from the id; filled for Featured, outlined for Teaching, dashed for Experiment.
export function mark(p) {
  let h = 0;
  for (const ch of p.id) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  const shapes = [
    `<circle cx="12" cy="12" r="10"/>`,
    `<rect x="2.5" y="2.5" width="19" height="19"/>`,
    `<path d="M12 1.5 22.5 12 12 22.5 1.5 12Z"/>`,
    `<path d="M12 2 22 21H2Z"/>`,
    `<path d="M12 1.5 21.1 6.75v10.5L12 22.5 2.9 17.25V6.75Z"/>`,
    `<path d="M2 12a10 10 0 0 1 20 0v10H2Z"/>`,
  ];
  const cuts = [
    `<circle cx="12" cy="12" r="3"/>`,
    `<path d="M5 12h14"/>`,
    `<path d="M12 5v14M5 12h14"/>`,
    `<circle cx="12" cy="12" r="6"/>`,
    `<path d="M6 17 18 7"/>`,
    ``,
  ];
  const shape = shapes[h % shapes.length];
  const cut = cuts[(h >>> 3) % cuts.length];
  const filled = p.kind === "Featured";
  const dash = p.kind === "Experiment" ? ` stroke-dasharray="3 2.4"` : "";
  // On a filled mark the cut is drawn in paper colour; on an outline, in ink.
  return `<svg class="mk" viewBox="0 0 24 24" aria-hidden="true">
    <g fill="${filled ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.6"${dash}>${shape}</g>
    <g class="${filled ? "cut" : ""}" fill="none" stroke="currentColor" stroke-width="1.8">${cut}</g>
  </svg>`;
}

export function ab4({ stage, projects, KIND, askBox, hoverPeek }) {
  const W = stage.clientWidth;
  const H = stage.clientHeight - 150;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const no = (p) => String(projects.indexOf(p) + 1).padStart(2, "0");

  // ——— At rest: curved rows ———
  const curve = document.createElement("div");
  curve.className = "curve";
  const field = document.createElement("div");
  field.className = "curve-field";
  curve.append(field);
  stage.append(curve);

  const rowsN = 4;
  const rows = [];
  const GAP_EM = 0.9;
  for (let r = 0; r < rowsN; r++) {
    const list = projects.filter((_, i) => i % rowsN === r);
    const row = { y: 0, dir: r % 2 ? -1 : 1, speed: r % 2 ? 26 : 34, offset: r * 137, loop: 0, items: [] };
    let x = 0;
    // Repeat the row until it is wide enough to wrap past both ends of the curve.
    do {
      for (const p of list) {
        const el = document.createElement("a");
        el.className = `cn k-${p.kind}`;
        el.href = p.url;
        el.target = "_blank";
        el.rel = "noopener";
        el.dataset.i = projects.indexOf(p);
        el.dataset.id = p.id;
        el.innerHTML = `${mark(p)}${escapeHtml(p.title)}<sup>${no(p)}</sup>`;
        field.append(el);
        const w = el.offsetWidth;
        const em = parseFloat(getComputedStyle(el).fontSize);
        row.items.push({ el, base: x, w });
        x += w + GAP_EM * em;
      }
    } while (x < W * 1.7);
    row.loop = x;
    rows.push(row);
  }
  const lineH = rows[0].items[0].el.offsetHeight * 1.05;
  const top = (H - rowsN * lineH) / 2;
  rows.forEach((row, r) => { row.y = top + r * lineH; });

  let held = false; // a row stops while the cursor is on the names
  const place = () => {
    const half = W / 2;
    for (const row of rows) {
      const start = (W - row.loop) / 2;
      for (const it of row.items) {
        const x = start + ((((it.base + row.offset) % row.loop) + row.loop) % row.loop);
        const u = (x + it.w / 2 - half) / half;
        const out = Math.abs(u) > EDGE_U;
        it.el.style.visibility = out ? "hidden" : "";
        if (out) continue;
        it.el.style.transform = `translate3d(${x.toFixed(1)}px, ${row.y.toFixed(1)}px, ${(CURVE_DEPTH * u * u).toFixed(1)}px) rotateY(${(-CURVE_DEG * u).toFixed(2)}deg)`;
      }
    }
  };

  // Frosted glass that slides in between the names and the answer.
  const glass = document.createElement("div");
  glass.className = "frost-glass";
  stage.append(glass);

  // ——— The answer: a drum ———
  const drum = document.createElement("div");
  drum.className = "drum";
  const axis = document.createElement("div");
  axis.className = "drum-axis";
  drum.append(axis);
  stage.append(drum);
  let dn = [];
  let center = 0;
  let target = 0;
  let R = 0;

  const fill = (ids, q) => {
    axis.replaceChildren();
    drum.querySelector(".none")?.remove();
    dn = [];
    drum.classList.toggle("is-active", Boolean(q));
    if (!q) return;
    const ps = projects.filter((p) => ids.has(p.id));
    if (!ps.length) {
      drum.insertAdjacentHTML("beforeend", `<span class="none">Nothing for “${escapeHtml(q)}” yet.</span>`);
      return;
    }
    for (const p of ps) {
      const el = document.createElement("a");
      el.className = "dn";
      el.href = p.url;
      el.target = "_blank";
      el.rel = "noopener";
      el.dataset.i = projects.indexOf(p);
      el.innerHTML = `<span class="k">${KIND[p.kind]}</span>${mark(p)}${escapeHtml(p.title)}<sup>${no(p)}</sup>`;
      axis.append(el);
      dn.push({ el, w: el.offsetWidth, h: el.offsetHeight });
    }
    const itemH = dn[0].h * 1.3;
    R = itemH / 2 / Math.tan(((STEP / 2) * Math.PI) / 180);
    target = Math.floor((dn.length - 1) / 2);
    center = reduce ? target : target - 2.5; // the drum rolls into place
  };

  const turn = () => {
    center += (target - center) * (reduce ? 1 : 0.12);
    if (Math.abs(target - center) < 0.001) center = target;
    let front = -1;
    let best = Infinity;
    dn.forEach((d, i) => {
      const a = (i - center) * STEP;
      const hide = Math.abs(a) > 84;
      d.el.style.visibility = hide ? "hidden" : "";
      if (Math.abs(i - center) < best) { best = Math.abs(i - center); front = i; }
      if (hide) return;
      const c = Math.cos((a * Math.PI) / 180);
      d.el.style.transform = `translate(${-d.w / 2}px, ${-d.h / 2}px) translateZ(${-R}px) rotateX(${(-a).toFixed(2)}deg) translateZ(${R}px)`;
      d.el.style.opacity = Math.max(0, c ** 1.6).toFixed(3);
    });
    dn.forEach((d, i) => d.el.classList.toggle("is-front", i === front));
  };

  drum.addEventListener("wheel", (e) => {
    if (!dn.length) return;
    e.preventDefault();
    target = Math.max(0, Math.min(dn.length - 1, target + Math.sign(e.deltaY)));
  }, { passive: false });
  // A name off the front turns the drum to it; the one in front opens.
  drum.addEventListener("click", (e) => {
    const a = e.target.closest(".dn");
    if (!a || a.classList.contains("is-front")) return;
    e.preventDefault();
    target = dn.findIndex((d) => d.el === a);
  });

  // ——— Hover: the picture beside the cursor, and every copy of the name lit ———
  const offRows = hoverPeek(curve, ".cn");
  const offDrum = hoverPeek(drum, ".dn");
  const clearOn = () => { for (const n of field.querySelectorAll(".cn.on")) n.classList.remove("on"); };
  curve.addEventListener("pointerover", (e) => {
    const a = e.target.closest(".cn");
    clearOn();
    if (a) for (const n of field.querySelectorAll(`.cn[data-id="${CSS.escape(a.dataset.id)}"]`)) n.classList.add("on");
  });
  curve.addEventListener("pointerenter", () => { held = true; });
  curve.addEventListener("pointerleave", () => { held = false; clearOn(); });

  const markRows = (cls, ids) => {
    for (const row of rows) for (const it of row.items) it.el.classList.toggle(cls, Boolean(ids?.has(it.el.dataset.id)));
  };

  const stopAsk = askBox(
    (q, ids) => {
      curve.classList.toggle("is-listing", Boolean(q));
      glass.classList.toggle("is-on", Boolean(q));
      markRows("hint", null);
      fill(ids, q);
    },
    (ids) => { if (!curve.classList.contains("is-listing")) markRows("hint", ids); },
  );

  let raf;
  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!held && !reduce && !curve.classList.contains("is-listing")) {
      for (const row of rows) row.offset += row.dir * row.speed * dt;
    }
    place();
    if (dn.length) turn();
    raf = requestAnimationFrame(frame);
  };
  place();
  raf = requestAnimationFrame(frame);
  return () => { cancelAnimationFrame(raf); stopAsk(); offRows(); offDrum(); };
}
