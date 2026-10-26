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

// ——— Three words: think, teach, make ———
// Each word fills the screen; its letters are windows onto the work of that kind. Scrolling
// into a word lays out what belongs to it.
const byId = (id) => projects.find((p) => p.id === id);
const WORDS = [
  {
    word: "think", em: "Research", line: "Papers, a dissertation and visual essays on how knowledge moves.",
    pics: ["philosophical-networks", "critical-theory", "visualizing-sep"],
    items: () => [
      ...publications.slice(0, 6).map((p) => ({ t: p.title.split(":")[0], m: `${p.year} · paper`, to: href(p.url) })),
      ...projects.filter((p) => p.topics.includes("Philosophy")).map((p) => ({ t: p.title, m: "visual essay", to: workLink(p) })),
    ],
  },
  {
    word: "teach", em: "Classroom", line: "Tools, labs and platforms made for courses, juries and students.",
    pics: ["ima-lab", "jstudio", "grad-projects"],
    items: () => projects.filter((p) => p.kind === "Teaching" || (p.kind === "Featured" && p.topics.includes("Education"))).map((p) => ({ t: p.title, m: p.topics.join(", ").toLowerCase(), to: workLink(p) })),
  },
  {
    word: "make", em: "Workshop", line: "Systems, instruments and small experiments, built by hand.",
    pics: ["networkcanvas", "kafka", "find-the-university"],
    items: () => projects.filter((p) => p.kind !== "Teaching" && !p.topics.includes("Philosophy") && !p.topics.includes("Education")).map((p) => ({ t: p.title, m: p.stack.join(", "), to: workLink(p) })),
  },
];
const wordsHtml = () => `
  <section class="hb-words">${WORDS.map((w, n) => {
    // Single quotes: this goes inside a double-quoted style attribute.
    const bg = w.pics.map((id) => `url('${byId(id)?.image}')`).join(", ");
    return `
    <article class="hb-word" data-w="${w.word}">
      <p class="hb-word-k"><span class="mono">0${n + 1}</span><span class="label">${w.em}</span></p>
      <h2 class="hb-word-big" style="background-image:${bg}">${w.word}</h2>
      <div class="hb-word-body">
        <p class="hb-word-line">${w.line}</p>
        <ol class="hb-word-list">${w.items().map((it, i) => `<li style="--d:${i * 40}ms"><a href="${it.to}"><span>${escapeHtml(it.t)}</span><span class="mono">${escapeHtml(it.m)}</span></a></li>`).join("")}</ol>
      </div>
    </article>`;
  }).join("")}
  </section>`;

// ——— Glossary: the concepts behind the work ———
const GLOSSARY = [
  ["AI", "Systems that predict, generate or decide; here mostly something to teach with, and to question."],
  ["AR", "Digital layers laid over the place you stand in."],
  ["Co-presence", "Being with others, and the many ways screens and masks change it."],
  ["Cultural globalization", "Global forms that cast local shadows."],
  ["Data", "Records made legible: counted, mapped, drawn."],
  ["Education", "Learning by building; the classroom as a studio."],
  ["Extended reality", "AR, VR and everything between them."],
  ["Homophily", "Birds of a feather: why networks fill up with people like us."],
  ["Interaction", "What a system does back when you do something to it."],
  ["Journalism", "Finding out, checking and telling, now with data and code."],
  ["Mapping", "Putting knowledge in space so it can be walked through."],
  ["Misinformation", "False claims that travel on trust."],
  ["Networks", "Things known by their connections."],
  ["Philosophy", "Old questions about knowing, asked again with new media."],
  ["Real-time", "Many people, one moment, one shared screen."],
  ["Testimony", "Knowing something because someone told you: the epistemology of trust."],
];
// Whole words only, so "AR" does not turn up inside "learning".
const word = (term) => new RegExp(`(^|[^a-z])${term.replace(/[-]/g, "\\-")}($|[^a-z])`, "i");
const has = (list, term) => list.some((k) => word(term).test(k));
const worksFor = (term) => [
  ...projects.filter((p) => has(p.topics, term)).map((p) => ({ t: p.title, to: workLink(p), k: "project" })),
  ...publications.filter((p) => has(p.keywords, term) || word(term).test(p.title)).map((p) => ({ t: p.title.split(":")[0], to: href(p.url), k: "paper" })),
];
const glossaryHtml = (compact = false) => {
  const entries = GLOSSARY.map(([term, def]) => ({ term, def, works: worksFor(term) })).filter((e) => e.works.length);
  const letters = [...new Set(entries.map((e) => e.term[0]))];
  return `
  <section class="hb-gloss${compact ? " is-compact" : ""}">
    ${head("Glossary", `A <em>lexicon</em> of the work <span class="hb-gloss-n mono">${entries.length} concepts</span>`)}
    <nav class="hb-gloss-az mono">${letters.map((l) => `<a href="#g-${l}">${l}</a>`).join("")}</nav>
    ${letters.map((l) => `
      <div class="hb-gloss-l" id="g-${l}"><span class="hb-gloss-letter">${l}</span>
        <dl>${entries.filter((e) => e.term[0] === l).map((e) => `
          <div class="hb-gloss-e">
            <dt><span class="hb-gloss-term">${escapeHtml(e.term)}</span><span class="mono">n. · ${e.works.length} ${e.works.length === 1 ? "work" : "works"}</span></dt>
            <dd><p>${escapeHtml(e.def)}</p><ul>${e.works.map((w) => `<li><a href="${w.to}">${escapeHtml(w.t)}</a><span class="label">${w.k}</span></li>`).join("")}</ul></dd>
          </div>`).join("")}
        </dl>
      </div>`).join("")}
  </section>`;
};

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
  kelime: {
    label: "D · Üç kelime",
    note: "Ekranı dolduran üç kelime: think, teach, make. Harfler o türdeki işlerin görsellerine açılan pencereler; üzerine gelince renkleniyor. Bir kelimeye inince altındaki işler sırayla diziliyor.",
    html: () => `${wordsHtml()}${hello()}${colophon()}`,
  },
  sozluk: {
    label: "E · Sözlük",
    note: "İşlerin arkasındaki kavramlar bir sözlük gibi, harf harf. Her kavramın kısa bir tanımı ve onu taşıyan projeler ile yayınlar var. Üstteki harfler sözlükte atlamaya yarıyor.",
    html: () => `${glossaryHtml()}${hello()}${colophon()}`,
  },
  ikisi: {
    label: "F · İkisi",
    note: "Önce üç kelime, sonra sözlük: biri işleri rollere, öteki kavramlara göre açıyor. En uzun ve en zengin olanı.",
    html: () => `${wordsHtml()}${glossaryHtml(true)}${hello()}${colophon()}`,
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
  // A word lays out its works once it is well into the window.
  const seen = new IntersectionObserver((list) => {
    for (const e of list) if (e.isIntersecting) { e.target.classList.add("is-in"); seen.unobserve(e.target); }
  }, { rootMargin: "0px 0px -35% 0px" });
  host.querySelectorAll(".hb-word").forEach((w) => seen.observe(w));
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
