import { escapeHtml } from "/assets/js/catalog.js";

// The papers for the Research previews: abstracts and citations from the old page's
// publications.js, links from the catalogue where it has a better one.

const catalog = await (await fetch("/assets/data/catalog.json")).json();
const src = await (await fetch("/publications.js")).text();
const old = Function(`return ${src.match(/const publicationsData = (\[[\s\S]*?\n\]);/)[1]}`)();

const key = (t) => t.replace(/^\[PhD\]\s*/, "").slice(0, 24).toLowerCase();
export const PAPERS = old.map((o) => {
  const title = o.title.replace(/^\[PhD\]\s*/, "");
  const c = catalog.publications.find((p) => key(p.title) === key(title)) || {};
  // Two citations still carry the old file's placeholders for a missing venue.
  const cite = (o.downloadable?.citation || "").replace(/\[Journal Name[^\]]*\]/, "In press").replace(/\s*\[Conference\/Publication Source[^\]]*\]\.?/, "").trim();
  // The venue is what the citation says after the title, without its DOI.
  let venue = cite.slice(cite.indexOf(").") + 2).trim();
  const at = venue.toLowerCase().indexOf(title.slice(-18).toLowerCase());
  if (at >= 0) venue = venue.slice(at + 18).replace(/^[^.]*\.\s*/, "");
  venue = venue.replace(/https?:\/\/\S+/g, "").replace(/\s*\.\s*$/, "").trim();
  // The old data has a few placeholders and one citation whose title differs from the entry.
  if (venue.toLowerCase().startsWith(title.slice(0, 20).toLowerCase())) venue = venue.slice(venue.indexOf(". ") + 2);
  venue = venue.replace(/^\[(.*)\]$/, "$1").replace(/^\(Oral Presentation\)\.\s*/, "Oral presentation, ");
  if (/if known/.test(venue)) venue = "";
  const ext = (u) => u && /^https?:/.test(u);
  return {
    title, year: o.year, authors: o.authors, abstract: o.abstract, keywords: o.keywords.map((k) => k[0].toUpperCase() + k.slice(1)),
    cite, venue: venue || c.note || "",
    phd: o.title.startsWith("[PhD]"),
    pending: c.note === "In press",
    link: ext(c.url) ? c.url : ext(o.doi) ? o.doi : "",
    pdf: ext(o.downloadable?.pdf) ? o.downloadable.pdf : "",
  };
}).sort((a, b) => b.year - a.year);

export const f = (n) => +n.toFixed(2);
export const me = (a) => escapeHtml(a).replace("Seven, M.", "<b>Seven, M.</b>");
export const dual = (t) => `<span class="tw"><span class="ts">${t}</span><span class="ti" aria-hidden="true">${t}</span></span>`;
export const acts = (p, i) => `
  <span class="rs-acts">
    ${p.link ? `<a href="${escapeHtml(p.link)}" target="_blank" rel="noopener">${p.phd ? "Full text" : "DOI"} ↗</a>` : ""}
    ${p.pdf ? `<a href="${escapeHtml(p.pdf)}" target="_blank" rel="noopener">PDF ↗</a>` : ""}
    ${p.cite ? `<button type="button" class="rs-cite" data-i="${i}">Cite</button>` : ""}
    ${p.pending ? `<span class="label">In press</span>` : ""}
  </span>`;
