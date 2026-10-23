import { loadCatalog } from "./catalog.js";
import { mountSearch } from "./search-box.js";
import { mountWall } from "./wall.js";
import { mountFocus } from "./focus.js";
import "./theme.js";

// Home: the curved project wall bursts in and fills the first screen. Scrolling draws
// frosted glass over it and brings up the question and the search. Typing lights the
// matching tiles behind the glass; the rotating hint lifts its own.

document.getElementById("year").textContent = new Date().getFullYear();

const wallEl = document.getElementById("wall");
const veil = document.getElementById("veil");
const hint = document.getElementById("scroll-hint");

const projectIds = (results) =>
  new Set(results.filter((e) => e.type === "Project").map((e) => e.raw.id));

let wall = null;

const { input } = mountSearch({
  panelUp: true,
  onQuery: (q, results) => {
    wall?.query(q ? projectIds(results) : null);
    // While searching the glass thins, so the lit tiles show through it.
    veil.classList.toggle("is-thin", Boolean(q));
  },
  onHint: (word, results) => wall?.hint(projectIds(results)),
});

// Focusing the box (by "/", a click or ?q=) scrolls down to where the search rests.
const bottom = () => document.documentElement.scrollHeight - innerHeight;
input.addEventListener("focus", () => {
  if (scrollY < bottom() - 4) scrollTo({ top: bottom(), behavior: "smooth" });
});
if (input.value) requestAnimationFrame(() => scrollTo(0, bottom()));

loadCatalog()
  .then(async ({ projects }) => {
    let focus = null;
    wall = mountWall(wallEl, projects, { onSelect: (i, tile) => focus?.open(i, tile) });
    focus = mountFocus(projects, wall);
    await wall.ready();
    wall.burst();
  })
  .catch(() => wallEl.classList.remove("is-waiting"));

// Scroll: the glass thickens over the first screen as the search rises.
let ticking = false;
function onScroll() {
  if (ticking) return;
  ticking = true;
  requestAnimationFrame(() => {
    ticking = false;
    const p = Math.min(1, Math.max(0, scrollY / Math.max(1, bottom())));
    document.documentElement.style.setProperty("--p", p.toFixed(3));
    hint.style.opacity = Math.max(0, 1 - p * 3).toFixed(3);
  });
}
addEventListener("scroll", onScroll, { passive: true });
onScroll();
