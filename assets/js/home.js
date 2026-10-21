import { OceanEngine } from "./ocean.js";
import { loadCatalog, search, highlight, escapeHtml } from "./catalog.js";
import { currentTheme, onThemeChange } from "./theme.js";

// Four classics at different depths, and the ray gliding among them.
const SHARKS = [
  { kind: "classic", size: 1 },
  { kind: "ray", size: 0.9 },
  { kind: "classic", size: 0.7 },
  { kind: "classic", size: 0.84 },
  { kind: "classic", size: 0.77 },
];
// The ocean follows the page theme: the system's at first, then the header toggle's.
const ocean = new OceanEngine(document.getElementById("ocean"), SHARKS, currentTheme());
onThemeChange((theme) => ocean.setTheme(theme));

document.getElementById("year").textContent = new Date().getFullYear();

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
    part(n("Project"), "project", "projects", "/work/"),
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
    if (document.hidden || input.value) return;
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
