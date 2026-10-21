// Builds assets/js/ocean.js from the ascii-sharks source, with a finer grid than the library default.
//
//   node tools/build-ocean.mjs <path-to-ascii-sharks>
//
// The build patches a few lines of the renderer (see PATCHES): a denser grid than the
// library's 8–13 px cells, and translucent "abyssal" sharks. The source folder is not edited.

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Cell width in px = viewport width / PER, clamped to [MIN, MAX]. Height follows at 1.45×.
const CELL = { per: 240, min: 5, max: 8 };

const SITE_EXPR = `clamp(Math.round(width / ${CELL.per}), ${CELL.min}, ${CELL.max})`;

// Each patch swaps one exact snippet of renderer.ts; the build fails if a snippet goes missing.
const PATCHES = [
  // Finer grid.
  ["clamp(Math.round(width / 124), 8, 13)", SITE_EXPR],

  // Abyssal sharks: depth below 0.6 means "far beneath the surface". The library only
  // darkens by depth; here a deep shark is drawn translucent instead, so it reads as a
  // shadow under the paper (the megalodon uses this).
  ["const dim = 0.7 + 0.3 * sharkDepth[i];",
   "const deep = sharkDepth[i] < 0.6; ctx.globalAlpha = deep ? sharkDepth[i] : 1; const dim = deep ? 1 : 0.7 + 0.3 * sharkDepth[i];"],
  ["private drawSharks(t: number) {",
   "private drawSharks(t: number) { this.drawSharksLayer(t); this.ctx.globalAlpha = 1; }\n  private drawSharksLayer(t: number) {"],
];

const lib = resolve(process.argv[2] ?? "");
const site = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const esbuild = createRequire(join(lib, "package.json"))("esbuild");

const patchRenderer = {
  name: "site-renderer-patches",
  setup(build) {
    build.onLoad({ filter: /renderer\.ts$/ }, (args) => {
      let src = readFileSync(args.path, "utf8");
      for (const [from, to] of PATCHES) {
        if (!src.includes(from)) {
          throw new Error(`renderer.ts no longer contains "${from}"; update tools/build-ocean.mjs`);
        }
        src = src.replace(from, to);
      }
      return { contents: src, loader: "ts" };
    });
  },
};

await esbuild.build({
  entryPoints: [join(lib, "src", "index.ts")],
  outfile: join(site, "assets", "js", "ocean.js"),
  bundle: true,
  format: "esm",
  minify: true,
  target: "es2020",
  legalComments: "none",
  banner: { js: "/* ascii-sharks OceanEngine. Built by tools/build-ocean.mjs with site patches; do not edit. */" },
  plugins: [patchRenderer],
  logLevel: "info",
});
