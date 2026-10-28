import { mountIndexPage } from "./index-page.js?v=e4633fe974";
import { href } from "./i18n.js?v=f87d481c3f";
import "./theme.js?v=78b07b7bd1";
import "./lang.js?v=d6b9267e72";

document.getElementById("year").textContent = new Date().getFullYear();
mountIndexPage(document.getElementById("index"));

// "/" opens search from here too, as it does on the pages that carry the box.
document.addEventListener("keydown", (e) => {
  if (e.key === "/" && !e.target.closest?.("input, textarea, [contenteditable]") && !document.documentElement.classList.contains("has-focus")) {
    e.preventDefault();
    location.href = href("/search/");
  }
});
