import { TOPIC_TR, KIND_TR } from "./i18n.js";

// Loads assets/data/catalog.json once and searches it.
// One flat list of entries so projects, publications and writing rank against each other.

const DATA_URL = new URL("../data/catalog.json", import.meta.url);

let cache;

export function loadCatalog() {
  cache ??= fetch(DATA_URL)
    .then((r) => {
      if (!r.ok) throw new Error(`catalog ${r.status}`);
      return r.json();
    })
    .then(toEntries);
  return cache;
}

function toEntries(data) {
  const projects = data.projects.map((p) => ({
    type: "Project",
    title: p.title,
    url: p.url,
    meta: p.kind,
    summary: p.summary,
    // The id carries the folder name, so Turkish names like "etkilesim-atlasi" still match;
    // topics and collections are tagged in Turkish too, in either language, so "ağlar" works.
    tags: [...p.topics, ...p.topics.map((x) => TOPIC_TR[x] ?? ""), ...p.stack, p.kind, KIND_TR[p.kind] ?? "", p.id.replace(/-/g, " ")],
    raw: p,
  }));
  const publications = data.publications.map((p) => ({
    type: "Research",
    title: p.title,
    url: p.url,
    meta: [p.year, p.note].filter(Boolean).join(" · "),
    summary: p.authors,
    tags: [...p.keywords, String(p.year)],
    raw: p,
  }));
  const writings = data.writings.map((w) => ({
    type: "Writing",
    title: w.title,
    url: w.url,
    meta: [w.type, w.date.slice(0, 4)].join(" · "),
    summary: w.excerpt,
    tags: [w.type, w.language === "tr" ? "Turkish" : "English"],
    raw: w,
  }));

  const entries = [...projects, ...publications, ...writings];
  for (const e of entries) {
    e.nTitle = normalize(e.title);
    e.nTags = normalize(e.tags.join(" "));
    e.nBody = normalize(`${e.summary} ${e.meta}`);
  }
  // Wall thumbnails follow the id; tools/shoot-projects.py makes them. "image": null in the
  // catalog marks a project without one, which the wall sets as a typographic tile.
  const projectsWithImages = data.projects.map((p) => ({
    ...p,
    image: p.image === null ? null : `/assets/img/projects/${p.id}.webp`,
  }));
  return { entries, projects: projectsWithImages };
}

// Lowercase and fold accents, including Turkish ı/İ, so "etkilesim" finds "Etkileşim".
export function normalize(s) {
  return String(s)
    .replace(/İ/g, "i")
    .replace(/ı/g, "i")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

/** Every query word must hit somewhere; title hits outrank tags, tags outrank body. */
export function search(entries, query, limit = 8) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  if (!words.length) return [];

  const scored = [];
  for (const e of entries) {
    let score = 0;
    let ok = true;
    for (const w of words) {
      let s = 0;
      if (e.nTitle.startsWith(w)) s = 12;
      else if (new RegExp(`\\b${escape(w)}`).test(e.nTitle)) s = 8;
      else if (e.nTitle.includes(w)) s = 5;
      else if (new RegExp(`\\b${escape(w)}`).test(e.nTags)) s = 4;
      else if (e.nBody.includes(w)) s = 2;
      if (!s) { ok = false; break; }
      score += s;
    }
    if (ok) scored.push({ e, score: score + (e.type === "Project" ? 0.5 : 0) });
  }
  scored.sort((a, b) => b.score - a.score || a.e.title.localeCompare(b.e.title));
  return scored.slice(0, limit).map((s) => s.e);
}

/** Wraps query words found in `text` with <mark>, escaping everything else. */
export function highlight(text, query) {
  const words = normalize(query).split(/\s+/).filter(Boolean);
  const n = normalize(text);
  const hits = new Array(text.length).fill(false);
  for (const w of words) {
    let i = n.indexOf(w);
    while (i !== -1) {
      for (let k = i; k < i + w.length; k++) hits[k] = true;
      i = n.indexOf(w, i + w.length);
    }
  }
  let out = "";
  let open = false;
  for (let i = 0; i < text.length; i++) {
    if (hits[i] !== open) {
      out += hits[i] ? "<mark>" : "</mark>";
      open = hits[i];
    }
    out += escapeHtml(text[i]);
  }
  return open ? out + "</mark>" : out;
}

export function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

function escape(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
