import { mountIndexPage } from "./index-page.js?v=26d444edd1";
import { href } from "./i18n.js?v=bed860ddb2";
import "./theme.js?v=b1a8b8e960";
import "./lang.js?v=33bbb878c3";

document.getElementById("year").textContent = new Date().getFullYear();
mountIndexPage(document.getElementById("index"));

// "/" opens search from here too, as it does on the pages that carry the box.
document.addEventListener("keydown", (e) => {
  if (e.key === "/" && !e.target.closest?.("input, textarea, [contenteditable]") && !document.documentElement.classList.contains("has-focus")) {
    e.preventDefault();
    location.href = href("/search/");
  }
});
