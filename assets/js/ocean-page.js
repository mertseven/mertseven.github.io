import { OceanEngine } from "./ocean.js?v=8d4ae8cf02";
import { mountSearch } from "./search-box.js?v=b64033297f";
import { currentTheme, onThemeChange } from "./theme.js?v=643f2d9888";
import "./lang.js?v=cf96f32183";

// /search/: the search box alone, over the ASCII ocean under frosted glass.

// Four classics at different depths, and the ray gliding among them.
const SHARKS = [
  { kind: "classic", size: 1 },
  { kind: "ray", size: 0.9 },
  { kind: "classic", size: 0.7 },
  { kind: "classic", size: 0.84 },
  { kind: "classic", size: 0.77 },
];
// The ocean follows the page theme: the system's at first, then the header toggle's.
const ocean = new OceanEngine(document.getElementById("ocean"), SHARKS, currentTheme());
onThemeChange((theme) => ocean.setTheme(theme));

document.getElementById("year").textContent = new Date().getFullYear();

const { input } = mountSearch();
// Arriving here means someone wants to search: put the cursor in the box.
if (!input.value) input.focus({ preventScroll: true });
