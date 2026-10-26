import { mountIndexPage } from "./index-page.js?v=5806ed05b7";
import { href } from "./i18n.js?v=438fcf2133";
import "./theme.js?v=643f2d9888";
import "./lang.js?v=cf96f32183";

document.getElementById("year").textContent = new Date().getFullYear();
mountIndexPage(document.getElementById("index"));

// "/" opens search from here too, as it does on the pages that carry the box.
document.addEventListener("keydown", (e) => {
  if (e.key === "/" && !e.target.closest?.("input, textarea, [contenteditable]") && !document.documentElement.classList.contains("has-focus")) {
    e.preventDefault();
    location.href = href("/search/");
  }
});
