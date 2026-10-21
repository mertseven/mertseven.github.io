import { mountIndex } from "./index-grid.js";
import "./theme.js";

document.getElementById("year").textContent = new Date().getFullYear();
mountIndex(document.getElementById("index-root"));
