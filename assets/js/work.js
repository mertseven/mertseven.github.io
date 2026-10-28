import { mountIndexPage } from "./index-page.js?v=b5bc8084a2";
import { href } from "./i18n.js?v=7d31a14007";
import "./theme.js?v=93e79f6375";
import "./lang.js?v=487e9aa150";

document.getElementById("year").textContent = new Date().getFullYear();
mountIndexPage(document.getElementById("index"));

// "/" opens search from here too, as it does on the pages that carry the box.
document.addEventListener("keydown", (e) => {
  if (e.key === "/" && !e.target.closest?.("input, textarea, [contenteditable]") && !document.documentElement.classList.contains("has-focus")) {
    e.preventDefault();
    location.href = href("/search/");
  }
});
