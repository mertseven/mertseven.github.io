import { mountIndex } from "./index-grid.js";
import "./theme.js";

document.getElementById("year").textContent = new Date().getFullYear();
mountIndex(document.getElementById("index-root"));

// "/" opens search from here too, as it does on the pages that carry the box.
document.addEventListener("keydown", (e) => {
  if (e.key === "/" && !e.target.closest?.("input, textarea, [contenteditable]")) {
    e.preventDefault();
    location.href = "/search/";
  }
});
