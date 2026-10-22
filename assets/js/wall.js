import { escapeHtml } from "./catalog.js";

// The project wall on the home page: three tilted rows of thumbnails drifting in
// opposite directions. Each row holds its projects repeated until it is wider than the
// screen, then that run twice over, so sliding it by exactly half loops without a seam.

const ROWS = 3;
const KIND_LABEL = { Featured: "Featured", Teaching: "Teaching", Experiment: "Experiment" };

export function mountWall(root, projects) {
  const rows = Array.from({ length: ROWS }, () => []);
  projects.forEach((p, i) => rows[i % ROWS].push(p));

  let built = "";

  function tile(p) {
    const img = p.image
      ? `<img src="${escapeHtml(p.image)}" alt="" loading="eager" decoding="async"
             onerror="this.parentElement.classList.add('tile--type'); this.remove()">`
      : "";
    return `
      <a class="tile${p.image ? "" : " tile--type"}" href="${escapeHtml(p.url)}" data-id="${escapeHtml(p.id)}" tabindex="-1">
        ${img}
        <span class="tile-fallback" aria-hidden="true">${escapeHtml(p.title)}</span>
        <span class="tile-label"><span class="label">${KIND_LABEL[p.kind]}</span>${escapeHtml(p.title)}</span>
      </a>`;
  }

  function build() {
    const tileW = parseFloat(getComputedStyle(root).getPropertyValue("--tile-w")) || 240;
    const gap = parseFloat(getComputedStyle(root).getPropertyValue("--tile-gap")) || 14;
    const html = rows.map((row, r) => {
      const runW = row.length * (tileW + gap);
      const repeat = Math.max(1, Math.ceil((innerWidth * 1.4) / runW));
      const run = Array.from({ length: repeat }, () => row.map(tile).join("")).join("");
      // Slower rows read as farther away; alternate directions like the reference.
      const dur = (runW * repeat) / (r === 1 ? 22 : 30);
      return `<div class="wall-row${r % 2 ? " wall-row--reverse" : ""}" style="--dur:${dur.toFixed(1)}s">
        <div class="wall-track">${run}${run}</div></div>`;
    }).join("");
    if (html === built) return;
    built = html;
    root.innerHTML = `<div class="wall-tilt">${html}</div>`;
  }

  build();
  let t;
  addEventListener("resize", () => {
    clearTimeout(t);
    t = setTimeout(build, 200);
  });

  // Search echo: matches stay lit, the rest dim. A rotating hint only lifts its matches.
  function mark(ids, mode) {
    root.classList.toggle("is-filtering", mode === "query" && ids !== null);
    root.classList.toggle("is-hinting", mode === "hint" && ids !== null && ids.size > 0);
    for (const el of root.querySelectorAll(".tile")) {
      const on = ids !== null && ids.has(el.dataset.id);
      el.classList.toggle("is-match", on);
    }
  }

  return {
    el: root,
    /** ids: Set of project ids, or null to clear. */
    query: (ids) => mark(ids, "query"),
    hint: (ids) => {
      if (root.classList.contains("is-filtering")) return;
      mark(ids, "hint");
    },
    /** Tiles currently on screen, for the intro's burst. */
    visibleTiles() {
      const vw = innerWidth;
      const vh = innerHeight;
      return [...root.querySelectorAll(".tile")].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.right > -40 && r.left < vw + 40 && r.bottom > -40 && r.top < vh + 40;
      });
    },
  };
}
