import { loadCatalog, escapeHtml } from "./catalog.js?v=2d38ee3fe9";
import { t } from "./i18n.js?v=f87d481c3f";
import "./theme.js?v=78b07b7bd1";
import "./lang.js?v=d6b9267e72";

// /research/: every paper open, one after another, as one long read. An index on the
// left stays in place and marks the paper being read; a title in it scrolls there, and
// ← → (or j k) step from paper to paper. Each paper has its address (#dissertation), so a
// search result or a shared link lands on it.

document.getElementById("year").textContent = new Date().getFullYear();

const root = document.getElementById("research");
const { publications: papers } = await loadCatalog();
const pad = (i) => String(i + 1).padStart(2, "0");
const ext = { target: "_blank", rel: "noopener" };
const a = (href, label, outside = true) =>
  `<a href="${escapeHtml(href)}"${outside ? ` target="${ext.target}" rel="${ext.rel}"` : ""}>${label}${outside ? " ↗" : " ↓"}</a>`;
const authors = (s) => escapeHtml(s).replace("Seven, M.", "<b>Seven, M.</b>");

function paper(p, i) {
  const kind = t.paperKind[p.kind];
  const links = [
    p.link && a(p.link, p.kind === "dissertation" ? t.fullText : "DOI"),
    p.pdf && a(p.pdf, p.kind === "dissertation" ? `${t.fullText} (YÖK)` : "PDF"),
    ...(p.files || []).map((f) => a(f.href, t.file[f.label] ?? f.label, false)),
    p.citation && `<button type="button" class="pp-cite-btn" data-i="${i}">${t.cite}</button>`,
    p.note === "In press" && `<span class="label">${t.inPress}</span>`,
  ].filter(Boolean);
  return `
    <article class="pp" id="${escapeHtml(p.id)}" data-i="${i}">
      <p class="pp-meta"><span class="mono">${pad(i)} / ${pad(papers.length - 1)}</span><span class="mono">${p.year}</span>${kind ? `<span class="label">${kind}</span>` : ""}</p>
      <h2 class="pp-title">${escapeHtml(p.title)}</h2>
      <p class="pp-by"><span>${authors(p.authors)}</span>${p.venue && p.venue !== "In press" ? `<span>${escapeHtml(p.venue)}</span>` : ""}</p>
      <p class="pp-abs">${escapeHtml(p.abstract)}</p>
      <p class="pp-kw">${p.keywords.map((k) => `<span>${escapeHtml(k)}</span>`).join("")}</p>
      ${p.citation ? `<blockquote class="pp-cite">${escapeHtml(p.citation)}</blockquote>` : ""}
      <p class="pp-acts">${links.join("")}</p>
    </article>`;
}

root.innerHTML = `
  <div class="rx-head">
    <h1 class="rx-h1"><span class="label">${t.research}</span>${t.researchLead}</h1>
    <p class="rx-count mono">${t.paperCount(papers.length)}</p>
  </div>
  <div class="rx-body">
    <nav class="rx-index" aria-label="${t.papersNav}">
      <ol>${papers.map((p, i) => `<li><a href="#${escapeHtml(p.id)}" data-i="${i}"><span class="mono">${p.year}</span><span class="rx-t">${escapeHtml(p.title)}</span></a></li>`).join("")}</ol>
    </nav>
    <div class="rx-flow">${papers.map(paper).join("")}</div>
  </div>`;

const items = [...root.querySelectorAll(".rx-index a")];
const articles = [...root.querySelectorAll(".pp")];
let at = -1;
// The address follows the reading only once someone reads: a plain visit keeps a plain URL.
let moved = Boolean(location.hash);
addEventListener("scroll", () => { moved = true; }, { once: true, passive: true });

// Mark a paper in the index, and keep its address in the bar without a jump.
function mark(i) {
  if (i === at) return;
  at = i;
  items.forEach((el, k) => el.toggleAttribute("aria-current", k === i));
  if (moved) history.replaceState(null, "", `${location.pathname}${location.search}#${papers[i].id}`);
}

// The paper whose top has most recently crossed the middle of the window is the one read.
const spy = new IntersectionObserver((list) => {
  for (const e of list) if (e.isIntersecting) mark(Number(e.target.dataset.i));
}, { rootMargin: "-40% 0px -55% 0px" });
articles.forEach((el) => spy.observe(el));

const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
function go(i) {
  const k = Math.max(0, Math.min(papers.length - 1, i));
  articles[k].scrollIntoView({ behavior: reduce() ? "auto" : "smooth", block: "start" });
  mark(k);
}

root.addEventListener("click", async (e) => {
  const link = e.target.closest(".rx-index a");
  if (link && e.button === 0 && !e.metaKey && !e.ctrlKey) {
    e.preventDefault();
    go(Number(link.dataset.i));
    return;
  }
  const b = e.target.closest(".pp-cite-btn");
  if (!b) return;
  try {
    await navigator.clipboard.writeText(papers[b.dataset.i].citation);
    b.textContent = t.copied;
  } catch {
    // Without the clipboard, select the citation so a copy is one keystroke away.
    const q = b.closest(".pp").querySelector(".pp-cite");
    getSelection().selectAllChildren(q);
    b.textContent = t.copyFail;
  }
  setTimeout(() => { b.textContent = t.cite; }, 1600);
});

document.addEventListener("keydown", (e) => {
  if (e.target.closest?.("input, textarea, [contenteditable]") || e.metaKey || e.ctrlKey || e.altKey) return;
  const d = { ArrowRight: 1, j: 1, ArrowLeft: -1, k: -1 }[e.key];
  if (d) { e.preventDefault(); go((at < 0 ? 0 : at) + d); }
  else if (e.key === "/") { e.preventDefault(); location.href = document.querySelector(".header-icons a[href*='search']").href; }
});

// Arriving with an address: go straight to that paper.
const start = papers.findIndex((p) => p.id === decodeURIComponent(location.hash.slice(1)));
if (start > 0) {
  // Now, and again once the fonts are in and the heights above it are final.
  articles[start].scrollIntoView({ block: "start" });
  document.fonts.ready.then(() => articles[start].scrollIntoView({ block: "start" }));
}
mark(Math.max(0, start));
root.classList.add("is-ready");
