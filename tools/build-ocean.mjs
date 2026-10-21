// Builds assets/js/ocean.js from the ascii-sharks source, with a finer grid than the library default.
//
//   node tools/build-ocean.mjs <path-to-ascii-sharks>
//
// ascii-sharks sizes each cell as width / 124, clamped to 8–13 px. The site wants a denser,
// more granular texture, so the build swaps that one expression. The source folder is not edited.

import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { join, resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

// Cell width in px = viewport width / PER, clamped to [MIN, MAX]. Height follows at 1.45×.
const CELL = { per: 240, min: 5, max: 8 };

const LIB_EXPR = "clamp(Math.round(width / 124), 8, 13)";
const SITE_EXPR = `clamp(Math.round(width / ${CELL.per}), ${CELL.min}, ${CELL.max})`;

const lib = resolve(process.argv[2] ?? "");
const site = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const esbuild = createRequire(join(lib, "package.json"))("esbuild");

const patchCells = {
  name: "site-cell-size",
  setup(build) {
    build.onLoad({ filter: /renderer\.ts$/ }, (args) => {
      const src = readFileSync(args.path, "utf8");
      if (!src.includes(LIB_EXPR)) {
        throw new Error(`renderer.ts no longer contains "${LIB_EXPR}"; update tools/build-ocean.mjs`);
      }
      return { contents: src.replace(LIB_EXPR, SITE_EXPR), loader: "ts" };
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
  banner: { js: `/* ascii-sharks OceanEngine. Built by tools/build-ocean.mjs (cell ${SITE_EXPR}); do not edit. */` },
  plugins: [patchCells],
  logLevel: "info",
});
