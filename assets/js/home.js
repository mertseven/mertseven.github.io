import { OceanEngine } from "./ocean.js";
import { loadCatalog, search, highlight, escapeHtml } from "./catalog.js";
import { mountIndex } from "./index-grid.js";

// Ocean follows the colour scheme, like the tokens do.
const dark = window.matchMedia("(prefers-color-scheme: dark)");
const themeFor = () => {
  const forced = document.documentElement.dataset.theme;
  return forced === "dark" || (!forced && dark.matches) ? "dark" : "light";
};
// Four classics at different depths, and the ray gliding among them.
const SHARKS = [
  { kind: "classic", size: 1 },
  { kind: "ray", size: 0.9 },
  { kind: "classic", size: 0.7 },
  { kind: "classic", size: 0.84 },
  { kind: "classic", size: 0.77 },
];
const ocean = new OceanEngine(document.getElementById("ocean"), SHARKS, themeFor());

document.getElementById("year").textContent = new Date().getFullYear();
mountIndex(document.getElementById("index-root"));

// The dive. Over the first screen of scrolling the water darkens to night blue.
// The ocean only has a light and a dark theme, so a night layer (.abyss) thickens until
// it is opaque, the theme flips underneath where nobody can see it, and the layer thins
// out again over the dark ocean. Starting from a dark scheme there is nothing to flip:
// the layer only tints the black water blue.
const abyss = document.getElementById("abyss");
const frost = document.getElementById("frost");
const gauge = document.getElementById("gauge");
const gaugeM = document.getElementById("gauge-m");
const hint = document.querySelector(".surface-foot");

const FLIP_DOWN = 0.5;   // progress at which the light surface turns into the deep
const FLIP_UP = 0.46;    // a little lower on the way up, so a resting scroll never flickers
const DEEP_TINT = 0.32;  // how much night blue stays over the dark ocean at the bottom
const METRES = 200;      // depth shown once the index is reached

let deep = false;
let ticking = false;

function dive() {
  ticking = false;
  const p = Math.min(1, Math.max(0, scrollY / (innerHeight * 0.9)));
  const surfaceDark = !document.documentElement.dataset.dive && themeFor() === "dark";

  if (surfaceDark) {
    abyss.style.opacity = (p * DEEP_TINT).toFixed(3);
  } else {
    const flip = deep ? p >= FLIP_UP : p >= FLIP_DOWN;
    if (flip !== deep) {
      deep = flip;
      if (deep) {
        document.documentElement.dataset.theme = "dark";
        document.documentElement.dataset.dive = "1";
      } else {
        delete document.documentElement.dataset.theme;
        delete document.documentElement.dataset.dive;
      }
      ocean.setTheme(themeFor());
    }
    // Ease in so the page stays bright for a while, then closes fast toward the flip.
    const a = deep
      ? 1 - ((p - FLIP_DOWN) / (1 - FLIP_DOWN)) * (1 - DEEP_TINT)
      : Math.pow(p / FLIP_DOWN, 1.8);
    abyss.style.opacity = Math.min(1, Math.max(0, a)).toFixed(3);
  }

  frost.style.opacity = (1 - p * 0.7).toFixed(3);
  hint.style.opacity = Math.max(0, 1 - p * 4).toFixed(3);
  gauge.style.opacity = Math.min(1, p * 3).toFixed(3);
  gaugeM.textContent = Math.round((scrollY / (innerHeight * 0.9)) * METRES);
}

function onScroll() {
  if (!ticking) {
    ticking = true;
    requestAnimationFrame(dive);
  }
}
addEventListener("scroll", onScroll, { passive: true });
addEventListener("resize", onScroll);
dark.addEventListener("change", () => {
  ocean.setTheme(themeFor());
  dive();
});
dive();

// Size the question so it spans exactly the width of the search bar.
const prompt = document.getElementById("prompt");
const promptLine = prompt.querySelector(".prompt-line");
function fitPrompt() {
  const target = prompt.clientWidth;
  if (!target) return;
  prompt.style.fontSize = "100px";
  prompt.style.fontSize = `${(100 * target) / promptLine.getBoundingClientRect().width}px`;
}
document.fonts.ready.then(fitPrompt);
new ResizeObserver(fitPrompt).observe(prompt.parentElement);

const root = document.getElementById("search");
const input = document.getElementById("q");
const panel = document.getElementById("panel");
const list = document.getElementById("results");
const beneath = document.getElementById("beneath");

let entries = [];
let results = [];
let active = -1;

// A search can be shared: /?q=networks opens with the box filled and the results showing.
input.value = new URLSearchParams(location.search).get("q") || "";

loadCatalog()
  .then((c) => {
    entries = c.entries;
    writeBeneath(entries);
    startHints();
    if (input.value) render();
  })
  .catch(() => {
    list.innerHTML = `<li class="results-empty">The index could not load. <a href="/work/">Open it directly</a>.</li>`;
  });

// "28 projects · 9 papers · 2 writings beneath the surface", counted from the catalog.
function writeBeneath(all) {
  const n = (type) => all.filter((e) => e.type === type).length;
  const part = (count, one, many, href) =>
    `<a href="${href}"><span class="mono">${count}</span> ${count === 1 ? one : many}</a>`;
  beneath.innerHTML = [
    part(n("Project"), "project", "projects", "#index"),
    part(n("Research"), "paper", "papers", "/publications.html"),
    part(n("Writing"), "writing", "writings", "/writing.html"),
  ].join('<span class="sep" aria-hidden="true">·</span>') + " <span>beneath the surface</span>";
}

// Rotating hints inside the empty box: one word at a time, each a search that finds
// something. With the box empty, Enter searches the word on show.
const HINTS = [
  "networks", "Bergson", "journalism", "Three.js", "Frankfurt School",
  "misinformation", "teaching", "mapping", "interaction", "Nietzsche", "AR",
];
const HINT_MS = 3200;
const field = input.closest(".search-field");
const ghost = document.getElementById("ghost");
let hints = [];
let hintAt = 0;

function startHints() {
  hints = HINTS.filter((h) => search(entries, h, 1).length);
  if (!hints.length) return;
  field.classList.add("has-ghost");
  showHint(false);
  setInterval(() => {
    // Rest while nobody can see it.
    if (document.hidden || input.value || scrollY > innerHeight * 0.5) return;
    hintAt = (hintAt + 1) % hints.length;
    showHint(true);
  }, HINT_MS);
}

// "try" stays put; only the word moves, leaving upward and the next one rising from below
// through a clipped slot, like a ticker.
function showHint(animate) {
  const html = `<em>${escapeHtml(hints[hintAt])}</em>…`;
  let word = ghost.querySelector(".ghost-word");
  if (!word) {
    ghost.innerHTML = `try <span class="ghost-slot"><span class="ghost-word"></span></span>`;
    word = ghost.querySelector(".ghost-word");
  }
  if (!animate) {
    word.innerHTML = html;
    return;
  }
  word.classList.add("is-out");
  setTimeout(() => {
    word.innerHTML = html;
    word.classList.replace("is-out", "is-in");
    word.getBoundingClientRect(); // commit the start position below before easing up
    word.classList.remove("is-in");
  }, 320);
}

function syncField() {
  field.classList.toggle("has-value", input.value.length > 0);
}

function writeQuery(q) {
  const params = new URLSearchParams(location.search);
  if (q) params.set("q", q);
  else params.delete("q");
  const s = params.toString();
  history.replaceState(null, "", `${location.pathname}${s ? `?${s}` : ""}${location.hash}`);
}

function render() {
  syncField();
  const q = input.value.trim();
  results = search(entries, q);
  active = results.length ? 0 : -1;
  writeQuery(q);

  if (!q) {
    setOpen(false);
    return;
  }
  list.innerHTML = results.length
    ? results.map((e, i) => `
        <li class="result" id="r${i}" role="option" aria-selected="${i === active}">
          <a href="${escapeHtml(e.url)}" tabindex="-1">
            <span class="result-type label">${e.type}</span>
            <span class="result-title">${highlight(e.title, q)}</span>
            <span class="result-sub">${escapeHtml([e.meta, e.summary].filter(Boolean).join(" — "))}</span>
          </a>
        </li>`).join("")
    : `<li class="results-empty">Nothing for “${escapeHtml(q)}” yet. Try a broader word, or <a href="/work/">browse the index</a>.</li>`;
  setOpen(true);
  syncActive();
}

function setOpen(open) {
  panel.hidden = !open;
  root.classList.toggle("is-open", open);
  input.setAttribute("aria-expanded", String(open));
}

function syncActive() {
  list.querySelectorAll(".result").forEach((li, i) => li.setAttribute("aria-selected", String(i === active)));
  if (active >= 0) {
    input.setAttribute("aria-activedescendant", `r${active}`);
    document.getElementById(`r${active}`).scrollIntoView({ block: "nearest" });
  } else {
    input.removeAttribute("aria-activedescendant");
  }
}

input.addEventListener("input", render);
input.addEventListener("focus", () => input.value.trim() && render());

input.addEventListener("keydown", (e) => {
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    if (!results.length) return;
    e.preventDefault();
    const step = e.key === "ArrowDown" ? 1 : -1;
    active = (active + step + results.length) % results.length;
    syncActive();
  } else if (e.key === "Enter") {
    if (!input.value && hints.length) {
      input.value = hints[hintAt];
      render();
    } else if (active >= 0) {
      window.location.href = results[active].url;
    }
  } else if (e.key === "Escape") {
    if (input.value) {
      input.value = "";
      render();
    } else {
      input.blur();
    }
  }
});

list.addEventListener("mousemove", (e) => {
  const li = e.target.closest(".result");
  if (!li) return;
  const i = [...list.children].indexOf(li);
  if (i !== active) {
    active = i;
    syncActive();
  }
});

// Close when clicking away; "/" brings the search back from anywhere.
document.addEventListener("pointerdown", (e) => {
  if (!root.contains(e.target)) setOpen(false);
});
document.addEventListener("keydown", (e) => {
  const typing = e.target.closest?.("input, textarea, [contenteditable]");
  if (e.key === "/" && !typing) {
    e.preventDefault();
    input.focus();
  }
});
