import { escapeHtml } from "./catalog.js";

// The home page's name wall. At rest every project's name, with its mark, drifts in rows
// bent like a cinema screen. Asked something, the names behind blur and the matches stand
// up as a drum turning on a horizontal axis, the one in front set in serif italic.
//
// Smoothness rules (each one cost a glitch to learn):
// - Nothing is measured before the fonts are in, or the widths are wrong.
// - A name never changes font. It carries a sans and a serif-italic copy in one grid cell
//   (so its width is fixed) and "italic" is a fade: the old copy leaves, then the new arrives.
// - Drum names share one left edge, so nothing re-centres when a name changes look.
// - The blur behind the answer is a filter on the names layer, which has stopped by then,
//   not a backdrop-filter recomputed over moving 3D text.
// - Nothing is written to the page on a frame where nothing moved.

const KIND = { Featured: "Featured", Teaching: "Teaching", Experiment: "Experiment" };

const ROWS = 4;
const GAP_EM = 0.9;      // space between names in a row
const SPEEDS = [34, 26]; // px/s, alternating rows
const CURVE_DEG = 32;    // angle of a name at the screen edge
const CURVE_DEPTH = 200; // how far toward you the edges come, in px
const EDGE_U = 1.3;      // where the curve ends, in half-widths from the centre
const STEP = 20;         // degrees between names on the drum
const ITALIC_SPAN = 0.6; // how far from the front (in names) the italic reaches

const smooth = (a, b, x) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// A placeholder mark for each project until it has its own logo: a shape and an inner
// cut picked from the id; filled for Featured, outlined for Teaching, dashed for Experiment.
// A project with its own logo gives "logo" (an SVG path) in the catalog and that is used.
export function mark(p) {
  if (p.logo) return `<img class="mk" src="${escapeHtml(p.logo)}" alt="" aria-hidden="true">`;
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
  const filled = p.kind === "Featured";
  const dash = p.kind === "Experiment" ? ` stroke-dasharray="3 2.4"` : "";
  // On a filled mark the cut is drawn in paper colour; on an outline, in ink.
  return `<svg class="mk" viewBox="0 0 24 24" aria-hidden="true">
    <g fill="${filled ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.6"${dash}>${shapes[h % shapes.length]}</g>
    <g class="${filled ? "cut" : ""}" fill="none" stroke="currentColor" stroke-width="1.8">${cuts[(h >>> 3) % cuts.length]}</g>
  </svg>`;
}

// The title twice in one cell: sans at rest, serif italic for emphasis.
const dual = (t) => `<span class="tw"><span class="ts">${t}</span><span class="ti" aria-hidden="true">${t}</span></span>`;

const fontsReady = () => Promise.all([
  document.fonts.load('300 64px "Geist"'),
  document.fonts.load('italic 400 64px "Instrument Serif"'),
  document.fonts.load('400 12px "Geist Mono"'),
]).catch(() => {});

/** Builds once the fonts are in. onSelect(index) fires for a plain click on a name. */
export async function mountNamesWall(host, projects, { onSelect } = {}) {
  await fontsReady();
  const W = host.clientWidth;
  const H = host.clientHeight;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const no = (p) => String(projects.indexOf(p) + 1).padStart(2, "0");

  // ——— At rest: curved rows ———
  const curve = document.createElement("div");
  curve.className = "curve";
  const field = document.createElement("div");
  field.className = "curve-field";
  curve.append(field);
  host.append(curve);

  const rows = [];
  for (let r = 0; r < ROWS; r++) {
    const list = projects.filter((_, i) => i % ROWS === r);
    const row = { y: 0, dir: r % 2 ? -1 : 1, speed: SPEEDS[r % 2], offset: r * 137, loop: 0, items: [] };
    let x = 0;
    // Repeat the row until it is wide enough to wrap past both ends of the curve.
    do {
      for (const p of list) {
        const el = document.createElement("a");
        el.className = `cn k-${p.kind}`;
        el.href = p.url;
        el.dataset.i = projects.indexOf(p);
        el.dataset.id = p.id;
        el.tabIndex = -1;
        el.innerHTML = `${mark(p)}${dual(escapeHtml(p.title))}<sup>${no(p)}</sup>`;
        field.append(el);
        const w = el.offsetWidth;
        const em = parseFloat(getComputedStyle(el).fontSize);
        row.items.push({ el, base: x, w, vis: true });
        x += w + GAP_EM * em;
      }
    } while (x < W * 1.7);
    row.loop = x;
    rows.push(row);
  }
  const lineH = rows[0].items[0].el.offsetHeight * 1.05;
  const top = (H - ROWS * lineH) / 2;
  rows.forEach((row, r) => { row.y = top + r * lineH; });

  const place = () => {
    const half = W / 2;
    for (const row of rows) {
      const start = (W - row.loop) / 2;
      for (const it of row.items) {
        const x = start + ((((it.base + row.offset) % row.loop) + row.loop) % row.loop);
        const u = (x + it.w / 2 - half) / half;
        const vis = Math.abs(u) <= EDGE_U;
        if (vis !== it.vis) { it.el.style.visibility = vis ? "" : "hidden"; it.vis = vis; }
        if (!vis) continue;
        it.el.style.transform = `translate3d(${x.toFixed(1)}px, ${row.y.toFixed(1)}px, ${(CURVE_DEPTH * u * u).toFixed(1)}px) rotateY(${(-CURVE_DEG * u).toFixed(2)}deg)`;
      }
    }
  };

  // A pale wash where the drum stands.
  const wash = document.createElement("div");
  wash.className = "wash";
  host.append(wash);

  // ——— The answer: a drum ———
  const drum = document.createElement("div");
  drum.className = "drum";
  drum.setAttribute("aria-live", "polite");
  const axis = document.createElement("div");
  axis.className = "drum-axis";
  drum.append(axis);
  host.append(drum);
  let dn = [];
  let center = 0;
  let target = 0;
  let R = 0;
  let left = 0;  // shared left edge of every name on the drum
  let front = -1;

  const fill = (ids, q) => {
    axis.replaceChildren();
    drum.querySelector(".none")?.remove();
    dn = [];
    front = -1;
    drum.classList.toggle("is-active", Boolean(q));
    if (!q) return;
    const ps = projects.filter((p) => ids.has(p.id));
    if (!ps.length) {
      drum.insertAdjacentHTML("beforeend", `<p class="none">No project for “${escapeHtml(q)}” yet.</p>`);
      return;
    }
    for (const p of ps) {
      const el = document.createElement("a");
      el.className = "dn";
      el.href = p.url;
      el.dataset.i = projects.indexOf(p);
      el.tabIndex = -1;
      el.innerHTML = `<span class="k">${KIND[p.kind]}</span>${mark(p)}${dual(escapeHtml(p.title))}<sup>${no(p)}</sup>`;
      axis.append(el);
      dn.push({ el, w: el.offsetWidth, h: el.offsetHeight, vis: true });
    }
    // One left edge for all, centred on the widest name; on a narrow screen the whole drum
    // shrinks until the widest name fits.
    const widest = Math.max(...dn.map((d) => d.w));
    left = -widest / 2;
    axis.style.transform = `scale(${Math.min(1, (host.clientWidth * 0.92) / widest).toFixed(3)})`;
    R = (dn[0].h * 1.3) / 2 / Math.tan(((STEP / 2) * Math.PI) / 180);
    target = Math.floor((dn.length - 1) / 2);
    center = reduce.matches ? target : target - 2.5; // the drum rolls into place
    turn(true);
  };

  const turn = (force) => {
    const before = center;
    center += (target - center) * (reduce.matches ? 1 : 0.12);
    if (Math.abs(target - center) < 0.0005) center = target;
    if (!force && center === before) return; // at rest: nothing to write
    let near = -1;
    let best = Infinity;
    dn.forEach((d, i) => {
      const off = i - center;
      if (Math.abs(off) < best) { best = Math.abs(off); near = i; }
      const a = off * STEP;
      const vis = Math.abs(a) <= 84;
      if (vis !== d.vis) { d.el.style.visibility = vis ? "" : "hidden"; d.vis = vis; }
      if (!vis) return;
      const c = Math.cos((a * Math.PI) / 180);
      d.el.style.transform = `translate(${left.toFixed(1)}px, ${(-d.h / 2).toFixed(1)}px) translateZ(${(-R).toFixed(1)}px) rotateX(${(-a).toFixed(2)}deg) translateZ(${R.toFixed(1)}px)`;
      d.el.style.opacity = Math.max(0, c ** 1.6).toFixed(3);
      // The sans copy leaves in the first half of the change, the italic arrives in the second.
      const it = Math.max(0, 1 - Math.abs(off) / ITALIC_SPAN);
      d.el.style.setProperty("--ts", (1 - smooth(0, 0.5, it)).toFixed(3));
      d.el.style.setProperty("--ti", smooth(0.5, 1, it).toFixed(3));
    });
    if (near !== front) {
      dn[front]?.el.classList.remove("is-front");
      dn[near]?.el.classList.add("is-front");
      front = near;
    }
  };

  const step = (d) => {
    if (!dn.length) return;
    target = Math.max(0, Math.min(dn.length - 1, target + d));
  };
  drum.addEventListener("wheel", (e) => {
    if (!dn.length) return;
    e.preventDefault();
    step(Math.sign(e.deltaY));
  }, { passive: false });

  // A plain click opens the project's card; a modified click keeps the link.
  const plain = (e) => e.button === 0 && !e.metaKey && !e.ctrlKey && !e.shiftKey && !e.altKey;
  field.addEventListener("click", (e) => {
    const a = e.target.closest(".cn");
    if (!a || !onSelect || !plain(e)) return;
    e.preventDefault();
    onSelect(Number(a.dataset.i));
  });
  // On the drum the name in front opens; another one turns the drum to it first.
  drum.addEventListener("click", (e) => {
    const a = e.target.closest(".dn");
    if (!a || !plain(e)) return;
    e.preventDefault();
    if (a.classList.contains("is-front")) onSelect?.(Number(a.dataset.i));
    else target = dn.findIndex((d) => d.el === a);
  });

  // ——— Hover: the picture beside the cursor, and every copy of the name lit ———
  const peek = document.createElement("div");
  peek.className = "peek";
  peek.setAttribute("aria-hidden", "true");
  document.body.append(peek);
  let held = false;
  let lit = null;
  const light = (id) => {
    if (id === lit) return;
    if (lit) for (const n of field.querySelectorAll(`.cn[data-id="${CSS.escape(lit)}"]`)) n.classList.remove("on");
    if (id) for (const n of field.querySelectorAll(`.cn[data-id="${CSS.escape(id)}"]`)) n.classList.add("on");
    lit = id;
  };
  const showPeek = (a) => {
    const p = a && projects[a.dataset.i];
    if (!p) { peek.classList.remove("on"); return; }
    peek.innerHTML = p.image ? `<img src="${escapeHtml(p.image)}" alt="">` : `<span class="peek-type">${escapeHtml(p.title)}</span>`;
    peek.classList.add("on");
  };
  host.addEventListener("pointerover", (e) => {
    if (e.pointerType === "touch") return;
    const a = e.target.closest(".cn, .dn");
    showPeek(a);
    host.classList.toggle("has-hover", Boolean(a?.matches(".cn")));
    light(a?.matches(".cn") ? a.dataset.id : null);
  });
  curve.addEventListener("pointerenter", () => { held = true; });
  curve.addEventListener("pointerleave", () => { held = false; light(null); host.classList.remove("has-hover"); });
  host.addEventListener("pointerleave", () => peek.classList.remove("on"));
  addEventListener("pointermove", (e) => {
    const x = Math.min(innerWidth - 360, e.clientX + 24);
    const y = Math.min(innerHeight - 210, e.clientY + 24);
    peek.style.transform = `translate(${x}px, ${y}px)`;
  }, { passive: true });

  const markRows = (cls, ids) => {
    for (const row of rows) for (const it of row.items) it.el.classList.toggle(cls, Boolean(ids?.has(it.el.dataset.id)));
  };

  let listing = false;
  let raf;
  let last = performance.now();
  const frame = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!held && !reduce.matches && !listing && !document.documentElement.classList.contains("has-focus")) {
      for (const row of rows) row.offset += row.dir * row.speed * dt;
      place();
    }
    if (dn.length) turn(false);
    raf = requestAnimationFrame(frame);
  };
  place();
  host.classList.add("is-ready");
  raf = requestAnimationFrame(frame);
  document.addEventListener("visibilitychange", () => {
    cancelAnimationFrame(raf);
    if (!document.hidden) { last = performance.now(); raf = requestAnimationFrame(frame); }
  });

  return {
    /** Show the answer for a query (ids: Set of project ids), or clear it (q empty). */
    query(q, ids) {
      listing = Boolean(q);
      host.classList.toggle("is-listing", listing);
      markRows("hint", null);
      peek.classList.remove("on");
      fill(ids || new Set(), q);
    },
    /** Lift the names of a rotating hint's projects while nothing is typed. */
    hint(ids) {
      if (!listing) markRows("hint", ids);
    },
    /** Turn the drum one name up (-1) or down (1). */
    step,
    /** The project index of the name in front of the drum, or -1. */
    front: () => (front >= 0 ? Number(dn[front].el.dataset.i) : -1),
  };
}
