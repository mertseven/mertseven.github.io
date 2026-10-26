import { mountIndexPage } from "./index-page.js?v=64ba8b968a";
import { href } from "./i18n.js?v=6e6214bd19";
import "./theme.js?v=88b86c6ab4";
import "./lang.js?v=6cb74bcf69";

document.getElementById("year").textContent = new Date().getFullYear();
mountIndexPage(document.getElementById("index"));

// "/" opens search from here too, as it does on the pages that carry the box.
document.addEventListener("keydown", (e) => {
  if (e.key === "/" && !e.target.closest?.("input, textarea, [contenteditable]") && !document.documentElement.classList.contains("has-focus")) {
    e.preventDefault();
    location.href = href("/search/");
  }
});
