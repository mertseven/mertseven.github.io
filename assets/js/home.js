import { loadCatalog } from "./catalog.js";
import { mountSearch } from "./search-box.js";
import { mountWall } from "./wall.js";
import "./theme.js";

// Home: the curved project wall bursts in and fills the first screen. Scrolling draws
// frosted glass over it and brings up the question and the search. Typing lights the
// matching tiles behind the glass; the rotating hint lifts its own.

document.getElementById("year").textContent = new Date().getFullYear();

const wallEl = document.getElementById("wall");
const veil = document.getElementById("veil");
const hint = document.getElementById("scroll-hint");
const stage = document.getElementById("find");

const projectIds = (results) =>
  new Set(results.filter((e) => e.type === "Project").map((e) => e.raw.id));

let wall = null;

const { input } = mountSearch({
  onQuery: (q, results) => {
    wall?.query(q ? projectIds(results) : null);
    // While searching the glass thins, so the lit tiles show through it.
    veil.classList.toggle("is-thin", Boolean(q));
  },
  onHint: (word, results) => wall?.hint(projectIds(results)),
});

// Focusing the box (by "/", a click or ?q=) brings the search screen into view.
input.addEventListener("focus", () => {
  if (stage.getBoundingClientRect().top > innerHeight * 0.3) stage.scrollIntoView({ behavior: "smooth" });
});
if (input.value) requestAnimationFrame(() => stage.scrollIntoView());

loadCatalog()
  .then(async ({ projects }) => {
    wall = mountWall(wallEl, projects);
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
    const p = Math.min(1, Math.max(0, scrollY / (innerHeight * 0.7)));
    document.documentElement.style.setProperty("--p", p.toFixed(3));
    hint.style.opacity = Math.max(0, 1 - p * 3).toFixed(3);
  });
}
addEventListener("scroll", onScroll, { passive: true });
onScroll();
