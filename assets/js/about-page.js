import { loadCatalog, escapeHtml } from "./catalog.js?v=260afc3e71";
import { lang, href } from "./i18n.js?v=137ec0cac8";
import "./theme.js?v=b9429d0964";
import "./lang.js?v=61d7a584bf";

// /about/: a colophon. One sentence, then labelled rows: now, practice, teaching, path,
// selected papers, elsewhere, contact. The portrait sits beside them in the same print
// texture as the images on /work/. The words live in assets/data/about.json, in both
// languages; the papers come from the catalogue and open on /research/.

document.getElementById("year").textContent = new Date().getFullYear();

const root = document.getElementById("about");
const [about, { publications }] = await Promise.all([
  fetch(new URL("../data/about.json", import.meta.url), { cache: "no-cache" }).then((r) => r.json()),
  loadCatalog(),
]);
const S = about.shared;
const L = about[lang];
const R = L.rows;

const rows = (list) => `<ul class="ab-rows">${list.map((r) => `<li><span class="mono">${r.years}</span><span><b>${escapeHtml(r.title)}</b> ${escapeHtml(r.place)}</span></li>`).join("")}</ul>`;
const papers = publications.slice(0, 5);

root.innerHTML = `
  <h1 class="ab-lead"><span class="label">${L.label}</span>${L.lead}</h1>
  <div class="ab-grid">
    <figure class="ab-print"><img src="${S.portrait}" alt="${S.name}" width="1918" height="1078"></figure>
    <dl class="ab-dl">
      <dt>${R.now}</dt><dd>${escapeHtml(L.role)}</dd>
      <dt>${R.practice}</dt><dd>${L.body.map((p) => `<p>${escapeHtml(p)}</p>`).join("")}</dd>
      <dt>${R.teaching}</dt><dd class="ab-soft">${S.teaching.map(escapeHtml).join(" · ")}</dd>
      <dt>${R.education}</dt><dd>${rows(L.education)}</dd>
      <dt>${R.experience}</dt><dd>${rows(L.work)}</dd>
      <dt>${R.papers}</dt><dd>
        <ol class="ab-papers">${papers.map((p) => `<li><a href="${escapeHtml(href(p.url))}">${escapeHtml(p.title)}</a> <span class="mono">${p.year}</span></li>`).join("")}</ol>
        <a class="ab-more" href="${href("/research/")}">${L.allPapers}</a>
      </dd>
      <dt>${R.elsewhere}</dt><dd><ul class="ab-links">${S.links.map((l) => `<li><a href="${l.href}" target="_blank" rel="noopener">${l.label} <span aria-hidden="true">↗</span></a></li>`).join("")}</ul></dd>
      <dt id="contact">${R.contact}</dt><dd>
        <p class="ab-open">${escapeHtml(L.open)}</p>
        <a class="ab-mail" href="mailto:${S.email}">${S.email}</a>
        <p class="ab-reach"><span class="mono">${S.phone}</span><span>${escapeHtml(L.place)}</span></p>
        <a class="ab-cv" href="${S.cv}">${L.cv} <span aria-hidden="true">↓</span></a>
      </dd>
    </dl>
  </div>`;

// A link to /about/#contact lands on the contact row once the rows exist.
if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: "start" });
root.classList.add("is-ready");
