import { OceanEngine } from "./ocean.js";
import { loadCatalog, search, highlight, escapeHtml } from "./catalog.js";

const SUGGESTIONS = ["networks", "journalism", "philosophy", "interaction", "teaching"];

// Ocean follows the colour scheme, like the tokens do.
const dark = window.matchMedia("(prefers-color-scheme: dark)");
const themeFor = () => {
  const forced = document.documentElement.dataset.theme;
  return forced === "dark" || (!forced && dark.matches) ? "dark" : "light";
};
const ocean = new OceanEngine(document.getElementById("ocean"), undefined, themeFor());
dark.addEventListener("change", () => ocean.setTheme(themeFor()));

document.getElementById("year").textContent = new Date().getFullYear();

const root = document.getElementById("search");
const input = document.getElementById("q");
const panel = document.getElementById("panel");
const list = document.getElementById("results");
const suggest = document.getElementById("suggest");

let entries = [];
let results = [];
let active = -1;

loadCatalog()
  .then((c) => {
    entries = c.entries;
    if (input.value) render();
  })
  .catch(() => {
    list.innerHTML = `<li class="results-empty">The index could not load. <a href="/work/">Open it directly</a>.</li>`;
  });

for (const word of SUGGESTIONS) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "chip";
  b.textContent = word;
  b.addEventListener("click", () => {
    input.value = word;
    input.focus();
    render();
  });
  suggest.append(b);
}

function render() {
  const q = input.value.trim();
  results = search(entries, q);
  active = results.length ? 0 : -1;

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
    if (active >= 0) window.location.href = results[active].url;
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
  if (e.key === "/" && document.activeElement !== input) {
    e.preventDefault();
    input.focus();
  }
});
