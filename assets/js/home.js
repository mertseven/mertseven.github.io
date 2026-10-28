import { loadCatalog, escapeHtml } from "./catalog.js?v=36fa2c107a";
import { mountSearch } from "./search-box.js?v=d6e87dba1a";
import { mountNamesWall } from "./names-wall.js?v=35c8fe462c";
import { mountFocus } from "./focus.js?v=1defe7310a";
import { mountBelow } from "./home-below.js?v=b6bebdb28d";
import { t, href } from "./i18n.js?v=137ec0cac8";
import "./theme.js?v=b9429d0964";
import "./lang.js?v=61d7a584bf";

// Home: the name wall over the question and the search. Typing turns the matching projects
// into a drum of names (↑ ↓ or the wheel turn it, Enter opens the one in front); a plain
// click on any name opens its project card. Papers that match are counted under the box,
// with a way to the full results on /search/. Below the first screen the page goes on as a
// magazine (home-below.js).

document.getElementById("year").textContent = new Date().getFullYear();

const projectIds = (results) => new Set(results.filter((e) => e.type === "Project").map((e) => e.raw.id));

let names = null;     // the wall, once its fonts are in
let focus = null;     // the project card
let last = { q: "", ids: null, hint: null }; // what arrived before the wall was ready
let baseBeneath = ""; // the resting count line, restored when the box is cleared

const { input, beneath, ready } = mountSearch({
  panel: false,
  onQuery(q, results) {
    const ids = q ? projectIds(results) : null;
    last.q = q;
    last.ids = ids;
    names?.query(q, ids);
    writeBeneath(q, results);
  },
  onHint(word, results) {
    last.hint = projectIds(results);
    names?.hint(last.hint);
  },
});
ready.then(() => { baseBeneath = beneath.innerHTML; if (last.q) writeBeneath(last.q, null); });

// Under the box: the count while typing, the resting line otherwise.
function writeBeneath(q, results) {
  if (!beneath) return;
  if (!q) {
    if (baseBeneath) beneath.innerHTML = baseBeneath;
    return;
  }
  if (!results) return;
  const n = (type) => results.filter((e) => e.type === type).length;
  const parts = [];
  if (n("Project")) parts.push(t.projects(n("Project")));
  if (n("Research")) parts.push(t.papers(n("Research")));
  if (n("Writing")) parts.push(t.writings(n("Writing")));
  beneath.innerHTML = parts.length
    ? `${parts.join('<span class="sep" aria-hidden="true">·</span>')}<span class="sep" aria-hidden="true">—</span><a class="all" href="${href(`/search/?q=${encodeURIComponent(q)}`)}">${t.allResults}</a>`
    : t.nothing(escapeHtml(q));
}

// The drum answers to the keys while the box has focus.
input.addEventListener("keydown", (e) => {
  if (!names || !input.value.trim()) return;
  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    e.preventDefault();
    names.step(e.key === "ArrowDown" ? 1 : -1);
  } else if (e.key === "Enter") {
    const i = names.front();
    if (i < 0) return;
    // Keep this Enter from reaching the card's own "Enter opens the project" once it is up.
    e.preventDefault();
    e.stopPropagation();
    focus?.open(i);
  }
});

loadCatalog()
  .then(async ({ projects, publications }) => {
    // The card opens from a name, not a tile: there is no frame to fly from or back to.
    focus = mountFocus(projects, { hold() {}, tileFor: () => null });
    mountBelow(document.getElementById("below"), { projects, publications, focus });
    names = await mountNamesWall(document.getElementById("names"), projects, {
      onSelect: (i) => focus.open(i),
    });
    if (last.hint) names.hint(last.hint);
    if (last.q) names.query(last.q, last.ids);
  })
  .catch(() => document.getElementById("names").classList.add("is-ready"));
