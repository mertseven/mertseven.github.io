import { counterpart } from "./i18n.js?v=f87d481c3f";

// The EN / TR switch in the header: a link to this same page in the other language. The
// address changes as people search and filter, so the link is worked out at the moment
// of the click and carries the query and the open card with it.

for (const a of document.querySelectorAll("[data-lang-switch]")) {
  const to = counterpart();
  if (!to) { a.hidden = true; continue; }
  a.href = to;
  a.addEventListener("click", (e) => {
    if (e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    location.href = counterpart();
  });
}
