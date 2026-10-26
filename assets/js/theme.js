import { t } from "./i18n.js?v=6e6214bd19";

// Light/dark switch shared by every page.
//
// Until someone uses the toggle the site follows the system setting. A choice is kept in
// localStorage and set as data-theme on <html>, which tokens.css reads. Each page also sets
// it from an inline <head> script before first paint, so a stored dark theme never flashes light.

const KEY = "theme";
const system = window.matchMedia("(prefers-color-scheme: dark)");
const listeners = new Set();

export function currentTheme() {
  const set = document.documentElement.dataset.theme;
  if (set === "light" || set === "dark") return set;
  return system.matches ? "dark" : "light";
}

export function onThemeChange(fn) {
  listeners.add(fn);
}

function apply(theme, store) {
  document.documentElement.dataset.theme = theme;
  if (store) {
    try { localStorage.setItem(KEY, theme); } catch {}
  }
  sync();
}

function sync() {
  const theme = currentTheme();
  for (const b of document.querySelectorAll("[data-theme-toggle]")) {
    b.dataset.mode = theme;
    b.setAttribute("aria-label", theme === "dark" ? t.toLight : t.toDark);
  }
  for (const fn of listeners) fn(theme);
}

for (const b of document.querySelectorAll("[data-theme-toggle]")) {
  b.addEventListener("click", () => apply(currentTheme() === "dark" ? "light" : "dark", true));
}

// Follow the system only while nothing has been chosen here.
system.addEventListener("change", () => {
  let stored = null;
  try { stored = localStorage.getItem(KEY); } catch {}
  if (!stored) {
    delete document.documentElement.dataset.theme;
    sync();
  }
});

sync();
