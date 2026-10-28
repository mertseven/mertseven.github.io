import { t, href } from "./i18n.js?v=7d31a14007";
import { search } from "./catalog.js?v=749998b479";
import { mountSearch } from "./search-box.js?v=e184dd5591";
import "./theme.js?v=93e79f6375";

// 404: GitHub Pages serves this one file for every address that leads nowhere, in either
// language; the head script has already set <html lang> from the path. The page asks what
// was wanted, searches for it, and offers the four doors. If the address itself held a
// few words (/projects/kafka), they are searched straight away.

const N = t.nf;
document.title = N.title;
document.getElementById("year").textContent = new Date().getFullYear();

// The page is written in English; in Turkish, its words and links change here.
const set = (sel, fn) => document.querySelectorAll(sel).forEach(fn);
set(".wordmark", (a) => { a.href = href("/"); a.setAttribute("aria-label", N.nav.home); });
set(".site-nav", (n) => n.setAttribute("aria-label", N.nav.main));
set(".site-nav a", (a) => {
  const key = a.dataset.nav;
  a.textContent = N.nav[key];
  a.href = href(a.getAttribute("href"));
});
set(".header-icons a[href='/search/']", (a) => { a.href = href("/search/"); a.setAttribute("aria-label", N.nav.search); });
document.querySelector(".nf-label").textContent = N.label;
document.querySelector(".prompt-line").innerHTML = N.prompt;
document.querySelector(".nf-line").textContent = N.line;
const input = document.getElementById("q");
input.placeholder = N.placeholder;
document.querySelector("label[for='q']").textContent = N.searchLabel;
document.querySelector(".nf-doors").innerHTML = N.doors.map(([to, name]) => `<a href="${href(to)}">${name} <span aria-hidden="true">→</span></a>`).join("");

const { ready } = mountSearch();

// Words from the dead address, the last part first: /tr/projeler/project-kafka.html gives
// "project kafka". Words that only say where something was (projects, papers…) are dropped.
const GENERIC = /^(html?|php|index|tr|en|www|page|pages|projects?|projeler|works?|research|papers?|yayinlar|about|hakkinda|files?|images?|assets)$/i;
const parts = decodeURIComponent(location.pathname)
  .replace(/^\/tr(?=\/|$)/, "")
  .split("/")
  .filter(Boolean)
  .map((seg) => seg.split(/[._\-\s]+/).filter((w) => w.length > 1 && !GENERIC.test(w)))
  .filter((ws) => ws.length);

// The first of these that finds something: the last part whole, then its words alone,
// then the words of the parts before it.
function guess(entries) {
  const tries = [];
  for (const ws of [...parts].reverse()) tries.push(ws.join(" "), ...[...ws].reverse());
  return tries.find((q) => search(entries, q, 1).length) ?? "";
}

ready.then((catalog) => {
  const words = catalog ? guess(catalog.entries) : "";
  if (!words || input.value) { input.focus({ preventScroll: true }); return; }
  input.value = words;
  input.dispatchEvent(new Event("input"));
  document.querySelector(".nf-line").textContent = N.fromPath(words);
  input.focus({ preventScroll: true });
});
