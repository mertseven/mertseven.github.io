import { loadCatalog } from "./catalog.js";
import { mountSearch } from "./search-box.js";
import { mountWall } from "./wall.js";
import { playIntro } from "./intro.js";
import "./theme.js";

// Home: the opening sequence, then the project wall with the search beneath it.
// Typing in the search lights the matching tiles; the rotating hint lifts its own.

document.getElementById("year").textContent = new Date().getFullYear();

const projectIds = (results) =>
  new Set(results.filter((e) => e.type === "Project").map((e) => e.raw.id));

let wall = null;

mountSearch({
  onQuery: (q, results) => wall?.query(q ? projectIds(results) : null),
  onHint: (word, results) => wall?.hint(projectIds(results)),
});

loadCatalog()
  .then(({ projects }) => {
    wall = mountWall(document.getElementById("wall"), projects);
    return playIntro({ images: projects.map((p) => p.image).filter(Boolean), wall });
  })
  .catch(() => document.documentElement.classList.remove("is-intro"));
