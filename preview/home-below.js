import { loadCatalog, escapeHtml } from "/assets/js/catalog.js";
import { href } from "/assets/js/i18n.js";

// What comes under the home page's first screen, three ways: a magazine, a strip and a
// board. The first screen is the real one (home.js); scrolling past it, the name wall
// softens and blurs like a curtain drawing.

const { projects, publications } = await loadCatalog();
const about = await (await fetch("/assets/data/about.json", { cache: "no-cache" })).json();
const PICKS = ["jstudio", "networkcanvas", "socrates", "kafka"].map((id) => projects.find((p) => p.id === id)).filter(Boolean);
const NOW = {
  teaching: projects.find((p) => p.id === "ima-lab"),
  paper: publications[0],
  making: projects.find((p) => p.id === "etkilesim-atlasi"),
};

const img = (p) => (p.image ? `<img src="${escapeHtml(p.image)}" alt="" loading="lazy">` : `<span class="hb-type">${escapeHtml(p.title)}</span>`);
const workLink = (p) => href(`/work/#${p.id}`);
const head = (label, title, more, to) => `<div class="hb-head"><span class="label">${label}</span><h2>${title}</h2>${more ? `<a class="hb-more" href="${href(to)}">${more}</a>` : ""}</div>`;

const nowCols = () => `
  <div class="hb-now">
    <a class="hb-now-i" href="${workLink(NOW.teaching)}"><span class="label">Teaching</span><b>Interactive Media Applications</b><span>Eight playable experiments on agency, feedback and emergence, this term at Yaşar.</span></a>
    <a class="hb-now-i" href="${href(NOW.paper.url)}"><span class="label">Latest paper</span><b>${escapeHtml(NOW.paper.title.split(":")[0])}</b><span>${NOW.paper.year} · ${escapeHtml(NOW.paper.venue)}</span></a>
    <a class="hb-now-i" href="${workLink(NOW.making)}"><span class="label">On the bench</span><b>${escapeHtml(NOW.making.title)}</b><span>${escapeHtml(NOW.making.summary)}</span></a>
  </div>`;

const hello = () => `
  <section class="hb-hello">
    <figure class="hb-face"><img src="${about.shared.portrait}" alt="${about.shared.name}"></figure>
    <div>
      <p class="hb-hello-lead">${about.en.lead}</p>
      <p class="hb-hello-links"><a href="mailto:${about.shared.email}">${about.shared.email}</a><a href="${href("/about/")}">About →</a></p>
    </div>
  </section>`;

const colophon = () => `
  <footer class="hb-colophon">
    <div class="hb-col-top">
      <a class="wordmark" href="/"><span class="wordmark-mark" aria-hidden="true"></span><span>Mert Seven</span></a>
      <nav><a href="${href("/work/")}">Index</a><a href="${href("/research/")}">Research</a><a href="${href("/about/")}">About</a><a href="${href("/search/")}">Search</a></nav>
    </div>
    <div class="hb-col-bottom mono"><span>Set in Geist &amp; Instrument Serif · Made by hand in İzmir · © ${new Date().getFullYear()}</span><span>Open source on <a href="https://github.com/mertseven/mertseven.github.io">GitHub</a></span></div>
  </footer>`;

const LAYOUTS = {
  dergi: {
    label: "A · Dergi",
    note: "Seçki dört büyük satır: görsel ve metin sırayla sağa sola geçiyor. Altında üç sütunlu 'şimdi' bandı, sonra kısa tanışma ve kolofon.",
    html: () => `
      <section class="hb-sec">
        ${head("Selected", "Four <em>doors</em> into the work", "The full index →", "/work/")}
        <div class="hb-mag">${PICKS.map((p, i) => `
          <a class="hb-mag-i${i % 2 ? " is-flip" : ""}" href="${workLink(p)}">
            <span class="hb-print">${img(p)}</span>
            <span class="hb-mag-t"><span class="label">${p.kind}</span><b>${escapeHtml(p.title)}</b><span>${escapeHtml(p.summary)}</span><span class="mono">${p.stack.map(escapeHtml).join(", ")}</span></span>
          </a>`).join("")}
        </div>
      </section>
      <section class="hb-sec">${head("Now", "What is on the <em>desk</em>")}${nowCols()}</section>
      ${hello()}${colophon()}`,
  },
  serit: {
    label: "B · Şerit",
    note: "İlk ekranın hemen altında 'şimdi' bandı; sonra seçki yana kayan büyük kartlardan bir şerit (tekerlek, sürükleme ya da ok tuşları). En altta tanışma ve kolofon.",
    html: () => `
      <section class="hb-sec hb-sec--tight">${head("Now", "What is on the <em>desk</em>")}${nowCols()}</section>
      <section class="hb-sec">
        ${head("Selected", "Four <em>doors</em> into the work", "The full index →", "/work/")}
        <div class="hb-strip" tabindex="0">${PICKS.map((p) => `
          <a class="hb-strip-i" href="${workLink(p)}">
            <span class="hb-print">${img(p)}</span>
            <span class="label">${p.kind}</span><b>${escapeHtml(p.title)}</b><span>${escapeHtml(p.summary)}</span>
          </a>`).join("")}
          <a class="hb-strip-i hb-strip-more" href="${href("/work/")}"><b>All ${projects.length} projects</b><span>The full index →</span></a>
        </div>
      </section>
      ${hello()}${colophon()}`,
  },
  pano: {
    label: "C · Pano",
    note: "Seçki 2 × 2 bir pano. 'Şimdi' sütunlar yerine tek bir cümle: bu dönem ne öğretiyor, en son ne yayımladı, şu sıralar ne yapıyor. Tanışma ve kolofon yan yana.",
    html: () => `
      <section class="hb-sec">
        <p class="hb-sentence">This term Mert is teaching <a href="${workLink(NOW.teaching)}">Interactive Media <em>Applications</em></a>, has just published <a href="${href(NOW.paper.url)}">${escapeHtml(NOW.paper.title.split(":")[0])}</a>, and is building <a href="${workLink(NOW.making)}"><em>${escapeHtml(NOW.making.title)}</em></a>.</p>
      </section>
      <section class="hb-sec">
        ${head("Selected", "Four <em>doors</em> into the work", "The full index →", "/work/")}
        <div class="hb-board">${PICKS.map((p) => `
          <a class="hb-board-i" href="${workLink(p)}">
            <span class="hb-print">${img(p)}</span>
            <span class="hb-board-cap"><b>${escapeHtml(p.title)}</b><span class="label">${p.kind}</span></span>
          </a>`).join("")}
        </div>
      </section>
      <div class="hb-pair">${hello()}${colophon()}</div>`,
  },
};

// ——— Page ———

const host = document.getElementById("below");
const pill = document.getElementById("variants");
pill.innerHTML = `<div class="hb-pill-row">${Object.entries(LAYOUTS).map(([id, l]) => `<button type="button" data-v="${id}">${l.label}</button>`).join("")}</div><p class="hb-pill-note"></p>`;

function show(id) {
  const l = LAYOUTS[id] ?? LAYOUTS.dergi;
  const key = LAYOUTS[id] ? id : "dergi";
  host.innerHTML = l.html();
  host.dataset.v = key;
  pill.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === key)));
  pill.querySelector(".hb-pill-note").textContent = l.note;
  history.replaceState(null, "", `${location.pathname}${location.search}#${key}`);
}
pill.addEventListener("click", (e) => { const b = e.target.closest("button"); if (b) show(b.dataset.v); });
show(location.hash.slice(1));

// The curtain: past the first screen the wall softens and blurs. Only written when it changes.
const wall = document.getElementById("names");
let last = -1;
function curtain() {
  const p = Math.min(1, Math.max(0, scrollY / (innerHeight * 0.8)));
  if (Math.abs(p - last) < 0.005) return;
  last = p;
  wall.style.filter = p ? `blur(${(p * 7).toFixed(2)}px) opacity(${(1 - p * 0.75).toFixed(3)})` : "";
  wall.style.transform = p ? `translateY(${(p * -36).toFixed(1)}px) scale(${(1 - p * 0.04).toFixed(4)})` : "";
}
addEventListener("scroll", () => requestAnimationFrame(curtain), { passive: true });

// The strip turns with the arrow keys when it has focus.
host.addEventListener("keydown", (e) => {
  const s = e.target.closest(".hb-strip");
  if (!s || !["ArrowLeft", "ArrowRight"].includes(e.key)) return;
  e.preventDefault();
  s.scrollBy({ left: (e.key === "ArrowRight" ? 1 : -1) * s.clientWidth * 0.6, behavior: "smooth" });
});
