// Stamps every stylesheet and script with a hash of its contents, so a browser never
// keeps an old copy after a change: /assets/css/work.css?v=1a2b3c4d5e.
//
//   node tools/stamp.mjs
//
// Run it after editing anything in assets/css or assets/js, before committing. It rewrites
// the ?v= on the links in the site's pages and on the imports between the modules (a
// module's stamp covers the stamps of what it imports, so a change deep down reaches the
// page). Running it twice changes nothing.

import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { join } from "node:path";

const PAGES = ["", "work", "search", "research", "about"].flatMap((p) => [join(p, "index.html"), join("tr", p, "index.html")]);
const hash = (s) => createHash("sha256").update(s).digest("hex").slice(0, 10);

// Modules first, leaves before the modules that import them.
const JS = "assets/js";
const IMPORT = /((?:from|import)\s+")(\.\/[\w-]+\.js)(?:\?v=\w+)?(")/g;
const stamps = new Map();
function stampModule(name, trail = []) {
  if (stamps.has(name)) return stamps.get(name);
  if (trail.includes(name)) throw new Error(`import cycle: ${[...trail, name].join(" → ")}`);
  const file = join(JS, name);
  let src = readFileSync(file, "utf8");
  src = src.replace(IMPORT, (m, a, spec, b) => `${a}${spec}?v=${stampModule(spec.slice(2), [...trail, name])}${b}`);
  writeFileSync(file, src);
  const v = hash(src);
  stamps.set(name, v);
  return v;
}
for (const f of readdirSync(JS)) if (f.endsWith(".js")) stampModule(f);
for (const f of readdirSync("assets/css")) if (f.endsWith(".css")) stamps.set(`css/${f}`, hash(readFileSync(join("assets/css", f), "utf8")));

const LINK = /(["'])\/assets\/(css|js)\/([\w-]+\.(?:css|js))(?:\?v=\w+)?\1/g;
for (const page of PAGES) {
  const html = readFileSync(page, "utf8");
  const out = html.replace(LINK, (m, q, dir, f) => {
    const v = dir === "css" ? stamps.get(`css/${f}`) : stamps.get(f);
    return v ? `${q}/assets/${dir}/${f}?v=${v}${q}` : m;
  });
  if (out !== html) writeFileSync(page, out);
}
console.log(`stamped ${stamps.size} files across ${PAGES.length} pages`);
