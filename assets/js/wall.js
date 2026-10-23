import { escapeHtml } from "./catalog.js";

// The project wall: a full-screen field of thumbnails drifting sideways in rows, bent
// like the inside of a cinema screen. Tiles in the middle face you flat; toward the
// edges they swing in and come closer. Rows alternate direction and speed, and projects
// repeat as often as it takes to fill each row.
//
// Every tile is placed from script each frame (position, angle, depth), because the
// curve depends on where a tile is on screen at that moment. The burst animates the
// card inside each tile, so the two transforms never fight.

export const KIND_LABEL = { Featured: "Featured", Teaching: "Teaching", Experiment: "Experiment" };

const TILE_VW = 0.28;      // card width as a share of the screen…
const TILE_MIN = 180;      // …but never narrower…
const TILE_MAX = 420;      // …or wider than this (px); height is 16:9
const CURVE_DEG = 34;      // angle of a tile at the screen edge
const CURVE_DEPTH = 220;   // how far toward you the edges come, in px
const EDGE_U = 1.3;        // where the curve ends, in half-widths from the centre (1 = screen edge)
const SPEEDS = [22, 30, 18, 26, 20, 28]; // px/s per row, cycling
const BURST_MS = 900;
const BURST_SPREAD = 520;  // stagger: centre tiles first, edges last

const rand = (a, b) => a + Math.random() * (b - a);
const mod = (a, n) => ((a % n) + n) % n;

export function mountWall(root, projects, { onSelect } = {}) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  let held = false;     // the whole wall stops while a project card is open
  const field = document.createElement("div");
  field.className = "wall-field";
  root.append(field);

  let rows = [];        // { y, dir, speed, offset, loop, tiles: [{ el, base }], paused }
  let metrics = null;
  let last = 0;
  let raf = 0;

  function tileHtml(p) {
    const img = p.image
      ? `<img src="${escapeHtml(p.image)}" alt="" decoding="async"
             onerror="this.closest('.tile').classList.add('tile--type'); this.remove()">`
      : "";
    return `
      <div class="tile-card">
        ${img}
        <span class="tile-fallback" aria-hidden="true">${escapeHtml(p.title)}</span>
      </div>`;
  }

  // The name of the card under the cursor rides beside it in a small pill, as in Burst.
  const pill = document.createElement("div");
  pill.className = "wall-pill";
  pill.setAttribute("aria-hidden", "true");
  document.body.append(pill);
  let pillOn = null;
  field.addEventListener("pointerover", (e) => {
    const el = e.target.closest(".tile");
    if (!el || el === pillOn || e.pointerType === "touch") return;
    pillOn = el;
    const p = projects[el.dataset.index];
    pill.innerHTML = `<span class="label">${KIND_LABEL[p.kind]}</span>${escapeHtml(p.title)}`;
    pill.classList.add("is-on");
  });
  field.addEventListener("pointerout", (e) => {
    if (!e.relatedTarget?.closest?.(".tile")) {
      pillOn = null;
      pill.classList.remove("is-on");
    }
  });
  addEventListener("pointermove", (e) => {
    pill.style.transform = `translate(${e.clientX + 18}px, ${e.clientY + 18}px)`;
  }, { passive: true });

  // A plain click opens the project's card (onSelect); a modified click keeps the link.
  field.addEventListener("click", (e) => {
    const el = e.target.closest(".tile");
    if (!el || !onSelect || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    pillOn = null;
    pill.classList.remove("is-on");
    onSelect(Number(el.dataset.index), el);
  });

  function build() {
    const vw = root.clientWidth;
    const vh = root.clientHeight;
    // Burst's proportions: 16:9 cards about 28% of the screen wide.
    const w = Math.round(Math.min(TILE_MAX, Math.max(TILE_MIN, vw * TILE_VW)));
    const h = Math.round(w * 9 / 16);
    const gap = Math.round(w * 0.05);
    root.style.setProperty("--tile-w", `${w}px`);
    root.style.setProperty("--tile-h", `${h}px`);
    const pitchX = w + gap;
    const pitchY = h + gap;
    const rowCount = Math.ceil(vh / pitchY) + 1;
    // Wide enough that a tile leaving one edge re-enters past the other, curve included.
    const perRow = Math.ceil((vw * 1.5) / pitchX) + 2;
    metrics = { w, h, vw, vh, pitchX };

    field.replaceChildren();
    rows = [];
    const top = (vh - rowCount * pitchY + gap) / 2;
    for (let r = 0; r < rowCount; r++) {
      const row = {
        y: top + r * pitchY,
        dir: r % 2 ? -1 : 1,
        speed: SPEEDS[r % SPEEDS.length],
        offset: r % 2 ? pitchX / 2 : 0, // brick offset between neighbouring rows
        loop: perRow * pitchX,
        tiles: [],
        paused: false,
      };
      for (let i = 0; i < perRow; i++) {
        // Each row starts somewhere else in the list, so neighbours rarely repeat.
        const index = (i + r * 5) % projects.length;
        const p = projects[index];
        const el = document.createElement("a");
        el.className = `tile${p.image ? "" : " tile--type"}`;
        el.href = p.url;
        el.dataset.id = p.id;
        el.dataset.index = index;
        el.tabIndex = -1;
        el.innerHTML = tileHtml(p);
        el.addEventListener("pointerenter", () => (row.paused = true));
        el.addEventListener("pointerleave", () => (row.paused = false));
        field.append(el);
        row.tiles.push({ el, base: i * pitchX });
      }
      rows.push(row);
    }
    place();
  }

  // Position every tile for the current offsets: x along the row, then the curve.
  function place() {
    const { w, vw } = metrics;
    const half = vw / 2;
    for (const row of rows) {
      const start = (vw - row.loop) / 2;
      for (const t of row.tiles) {
        const x = start + mod(t.base + row.offset, row.loop);
        const raw = (x + w / 2 - half) / half; // -1 at the left edge, 1 at the right
        // Past the edge of the curve a tile is hidden; inside it, depth and angle follow u.
        const out = Math.abs(raw) > EDGE_U;
        t.el.style.visibility = out ? "hidden" : "";
        if (out) continue;
        const z = CURVE_DEPTH * raw * raw;
        const a = -CURVE_DEG * raw;
        t.el.style.transform = `translate3d(${x.toFixed(1)}px, ${row.y.toFixed(1)}px, ${z.toFixed(1)}px) rotateY(${a.toFixed(2)}deg)`;
      }
    }
  }

  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (!held) {
      for (const row of rows) {
        if (!row.paused) row.offset += row.dir * row.speed * dt;
      }
    }
    place();
    raf = requestAnimationFrame(frame);
  }

  function run() {
    cancelAnimationFrame(raf);
    if (reduce.matches || document.hidden) return;
    last = performance.now();
    raf = requestAnimationFrame(frame);
  }

  build();
  run();

  let resizeTimer;
  addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(build, 200);
  });
  document.addEventListener("visibilitychange", run);
  reduce.addEventListener("change", run);

  // Search echo: matches stay lit, the rest dim. A rotating hint only lifts its matches.
  function mark(ids, mode) {
    root.classList.toggle("is-filtering", mode === "query" && ids !== null);
    root.classList.toggle("is-hinting", mode === "hint" && ids !== null && ids.size > 0);
    for (const row of rows) {
      for (const t of row.tiles) t.el.classList.toggle("is-match", ids !== null && ids.has(t.el.dataset.id));
    }
  }

  return {
    /** Resolves once the images on screen have loaded, or after `ms`, whichever is first. */
    ready(ms = 1200) {
      const imgs = [...field.querySelectorAll(".tile img")].filter((img) => img.closest(".tile").style.visibility !== "hidden");
      const loads = imgs.map((img) => (img.complete ? null : new Promise((r) => { img.onload = r; img.addEventListener("error", r); })));
      return Promise.race([Promise.all(loads), new Promise((r) => setTimeout(r, ms))]);
    },
    /** Stop (true) or restart (false) the drift, e.g. while a project card is open. */
    hold(v) {
      held = v;
    },
    /** The on-screen tile showing project `index` nearest the centre, or null. */
    tileFor(index) {
      let best = null;
      let bestD = Infinity;
      for (const row of rows) {
        for (const t of row.tiles) {
          if (Number(t.el.dataset.index) !== index || t.el.style.visibility === "hidden") continue;
          const r = t.el.getBoundingClientRect();
          if (r.right < 0 || r.left > innerWidth || r.bottom < 0 || r.top > innerHeight) continue;
          const d = Math.hypot(r.left + r.width / 2 - innerWidth / 2, r.top + r.height / 2 - innerHeight / 2);
          if (d < bestD) { bestD = d; best = t.el; }
        }
      }
      return best;
    },
    query: (ids) => mark(ids, "query"),
    hint: (ids) => {
      if (root.classList.contains("is-filtering")) return;
      mark(ids, "hint");
    },
    /** The opening: every card on screen flies out from the centre to its place. */
    burst() {
      root.classList.remove("is-waiting");
      if (reduce.matches) return;
      const cx = metrics.vw / 2;
      const cy = metrics.vh / 2;
      const far = Math.hypot(cx, cy);
      const box = root.getBoundingClientRect();
      for (const row of rows) {
        for (const t of row.tiles) {
          if (t.el.style.visibility === "hidden") continue;
          const r = t.el.getBoundingClientRect();
          const dx = cx - (r.left - box.left + r.width / 2);
          const dy = cy - (r.top - box.top + r.height / 2);
          const d = Math.min(1, Math.hypot(dx, dy) / far);
          t.el.firstElementChild.animate(
            [
              { transform: `translate(${dx}px, ${dy}px) scale(0.2) rotate(${rand(-16, 16)}deg)`, filter: "blur(16px)", opacity: 0 },
              { opacity: 1, offset: 0.3 },
              { transform: "none", filter: "blur(0)", opacity: 1 },
            ],
            { duration: BURST_MS, delay: d * BURST_SPREAD, easing: "cubic-bezier(0.16, 0.84, 0.24, 1)", fill: "backwards" },
          );
        }
      }
    },
  };
}
