import { loadCatalog, normalize, escapeHtml } from "./catalog.js";

// Collection is single choice; topics and stack are multi-select (any of).
// Groups combine with AND. State lives in the URL so a filtered view can be shared.
const KINDS = ["Featured", "Teaching", "Experiment"];
const KIND_LABEL = { Featured: "Featured", Teaching: "Teaching", Experiment: "Experiments" };

const VISIBLE = 8;

const state = { kind: "", topic: new Set(), stack: new Set(), text: "" };
const expanded = new Set();

const grid = document.getElementById("grid");
const empty = document.getElementById("empty");
const count = document.getElementById("count");
const clear = document.getElementById("clear");
const text = document.getElementById("f-text");

document.getElementById("year").textContent = new Date().getFullYear();

let projects = [];

loadCatalog()
  .then((c) => {
    projects = c.projects.map((p, i) => ({ ...p, n: i + 1, hay: normalize(`${p.title} ${p.summary}`) }));
    readUrl();
    buildChips();
    render();
  })
  .catch(() => {
    grid.innerHTML = "";
    empty.hidden = false;
    empty.textContent = "The index could not load.";
  });

function tally(key) {
  const counts = new Map();
  for (const p of projects) for (const v of p[key]) counts.set(v, (counts.get(v) || 0) + 1);
  return [...counts].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

function chip(label, n, pressed, onClick) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "chip";
  b.setAttribute("aria-pressed", String(pressed));
  b.innerHTML = `${escapeHtml(label)}${n == null ? "" : ` <span class="count">${n}</span>`}`;
  b.addEventListener("click", onClick);
  return b;
}

function buildChips() {
  const kindBox = document.getElementById("f-kind");
  kindBox.replaceChildren(
    chip("All", projects.length, !state.kind, () => setKind("")),
    ...KINDS.map((k) => chip(KIND_LABEL[k], projects.filter((p) => p.kind === k).length, state.kind === k, () => setKind(k))),
  );
  // Long tails stay folded: the most used values show, the rest sit behind "+ n more".
  // Anything selected stays visible even when folded.
  for (const key of ["topic", "stack"]) {
    const box = document.getElementById(`f-${key}`);
    const field = key === "topic" ? "topics" : "stack";
    const all = tally(field);
    const shown = expanded.has(key) ? all : all.filter(([v], i) => i < VISIBLE || state[key].has(v));
    const chips = shown.map(([v, n]) => chip(v, n, state[key].has(v), () => toggle(key, v)));
    const hidden = all.length - shown.length;
    if (hidden > 0 || expanded.has(key)) {
      const more = chip(hidden > 0 ? `+ ${hidden} more` : "Show less", null, false, () => {
        expanded.has(key) ? expanded.delete(key) : expanded.add(key);
        buildChips();
      });
      more.classList.add("chip--ghost");
      chips.push(more);
    }
    box.replaceChildren(...chips);
  }
}

function setKind(k) {
  state.kind = k;
  update();
}

function toggle(key, v) {
  state[key].has(v) ? state[key].delete(v) : state[key].add(v);
  update();
}

function update() {
  buildChips();
  render();
  writeUrl();
}

function matches(p) {
  if (state.kind && p.kind !== state.kind) return false;
  if (state.topic.size && !p.topics.some((t) => state.topic.has(t))) return false;
  if (state.stack.size && !p.stack.some((s) => state.stack.has(s))) return false;
  if (state.text) {
    const words = normalize(state.text).split(/\s+/).filter(Boolean);
    if (!words.every((w) => p.hay.includes(w))) return false;
  }
  return true;
}

function render() {
  const shown = projects.filter(matches);
  grid.innerHTML = shown.map((p) => `
    <a class="cell" href="${escapeHtml(p.url)}">
      <div class="cell-top">
        <span class="cell-num mono">${String(p.n).padStart(2, "0")}</span>
        <span class="cell-arrow" aria-hidden="true">↗</span>
      </div>
      <h2>${escapeHtml(p.title)}</h2>
      <p class="cell-summary">${escapeHtml(p.summary)}</p>
      <dl class="cell-meta">
        <dt>Collection</dt><dd>${KIND_LABEL[p.kind]}</dd>
        <dt>Topics</dt><dd>${p.topics.map(escapeHtml).join(", ")}</dd>
        <dt>Stack</dt><dd>${p.stack.map(escapeHtml).join(", ")}</dd>
      </dl>
    </a>`).join("");

  const filtered = state.kind || state.topic.size || state.stack.size || state.text;
  count.textContent = filtered ? `${shown.length} of ${projects.length} projects` : `${projects.length} projects`;
  clear.hidden = !filtered;
  empty.hidden = shown.length > 0;
  grid.hidden = shown.length === 0;
}

function clearAll() {
  state.kind = "";
  state.topic.clear();
  state.stack.clear();
  state.text = "";
  text.value = "";
  update();
}

clear.addEventListener("click", clearAll);
document.getElementById("clear-2").addEventListener("click", clearAll);

text.addEventListener("input", () => {
  state.text = text.value.trim();
  render();
  writeUrl();
});

function readUrl() {
  const q = new URLSearchParams(location.search);
  const kind = q.get("collection");
  if (KINDS.includes(kind)) state.kind = kind;
  for (const v of q.getAll("topic")) state.topic.add(v);
  for (const v of q.getAll("stack")) state.stack.add(v);
  state.text = q.get("q") || "";
  text.value = state.text;
}

function writeUrl() {
  const q = new URLSearchParams();
  if (state.kind) q.set("collection", state.kind);
  for (const v of state.topic) q.append("topic", v);
  for (const v of state.stack) q.append("stack", v);
  if (state.text) q.set("q", state.text);
  const s = q.toString();
  history.replaceState(null, "", s ? `?${s}` : location.pathname);
}
