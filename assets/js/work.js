import { mountIndexPage } from "./index-page.js?v=59421d2723";
import { href } from "./i18n.js?v=137ec0cac8";
import "./theme.js?v=b9429d0964";
import "./lang.js?v=61d7a584bf";

document.getElementById("year").textContent = new Date().getFullYear();
mountIndexPage(document.getElementById("index"));

// "/" opens search from here too, as it does on the pages that carry the box.
document.addEventListener("keydown", (e) => {
  if (e.key === "/" && !e.target.closest?.("input, textarea, [contenteditable]") && !document.documentElement.classList.contains("has-focus")) {
    e.preventDefault();
    location.href = href("/search/");
  }
});
