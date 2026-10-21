import { mountIndex } from "./index-grid.js";

document.getElementById("year").textContent = new Date().getFullYear();
mountIndex(document.getElementById("index-root"));
