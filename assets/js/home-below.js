import { escapeHtml } from "./catalog.js?v=989238ef33";
import { t, lang, href, kindName } from "./i18n.js?v=438fcf2133";

// Under the home page's first screen, as a magazine: four selected projects in large
// alternating rows, a "now" band (this term's course, the latest paper, the work on the
// bench), and a short hello. The picks and the "now" live in assets/data/home.json.
// Scrolling past the first screen, the name wall softens and blurs like a curtain drawing.

export async function mountBelow(host, { projects, publications, focus }) {
  const [home, about] = await Promise.all(
    ["home.json", "about.json"].map((f) => fetch(new URL(`../data/${f}`, import.meta.url), { cache: "no-cache" }).then((r) => r.json())),
  );
  const byId = (id) => projects.find((p) => p.id === id);
  const picks = home.picks.map(byId).filter(Boolean);
  const teach = home.now.teaching;
  const teachP = byId(teach.project);
  const making = byId(home.now.making);
  const paper = publications[0];
  const work = (p) => href(`/work/#${p.id}`);
  const card = (p) => `data-i="${projects.indexOf(p)}"`;
  const pic = (p) => (p.image ? `<img src="${escapeHtml(p.image)}" alt="" loading="lazy" decoding="async">` : `<span class="hb-type">${escapeHtml(p.title)}</span>`);

  host.innerHTML = `
    <section class="hb-sec" aria-labelledby="hb-picks">
      <div class="hb-head"><span class="label">${t.selected}</span><h2 id="hb-picks">${t.doors}</h2><a class="hb-more" href="${href("/work/")}">${t.fullIndex}</a></div>
      <div class="hb-mag">${picks.map((p, i) => `
        <a class="hb-mag-i${i % 2 ? " is-flip" : ""}" href="${work(p)}" ${card(p)}>
          <span class="hb-print">${pic(p)}</span>
          <span class="hb-mag-t"><span class="label">${kindName(p.kind)}</span><b>${escapeHtml(p.title)}</b><span>${escapeHtml(p.summary)}</span><span class="mono">${p.stack.map(escapeHtml).join(", ")}</span></span>
        </a>`).join("")}
      </div>
    </section>

    <section class="hb-sec" aria-labelledby="hb-now">
      <div class="hb-head"><span class="label">${t.now}</span><h2 id="hb-now">${t.desk}</h2></div>
      <div class="hb-now">
        ${teachP ? `<a class="hb-now-i" href="${work(teachP)}" ${card(teachP)}><span class="label">${t.teachingNow}</span><b>${escapeHtml(teach[lang].title)}</b><span>${escapeHtml(teach[lang].line)}</span></a>` : ""}
        ${paper ? `<a class="hb-now-i" href="${href(paper.url)}"><span class="label">${t.latestPaper}</span><b>${escapeHtml(paper.title.split(":")[0])}</b><span>${paper.year}${paper.venue ? ` · ${escapeHtml(paper.venue)}` : ""}</span></a>` : ""}
        ${making ? `<a class="hb-now-i" href="${work(making)}" ${card(making)}><span class="label">${t.bench}</span><b>${escapeHtml(making.title)}</b><span>${escapeHtml(making.summary)}</span></a>` : ""}
      </div>
    </section>

    <section class="hb-hello">
      <figure class="hb-face"><img src="${about.shared.portrait}" alt="${about.shared.name}" loading="lazy"></figure>
      <div>
        <p class="hb-hello-lead">${about[lang].lead}</p>
        <p class="hb-hello-links"><a href="mailto:${about.shared.email}">${about.shared.email}</a><a href="${href("/about/")}">${t.aboutLink}</a></p>
      </div>
    </section>`;

  // A plain click on a project opens its card right here, as a name on the wall does.
  host.addEventListener("click", (e) => {
    const a = e.target.closest("[data-i]");
    if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    focus.open(Number(a.dataset.i));
  });

  // The curtain. Only written when it changes, and never while nothing moves.
  const wall = document.getElementById("names");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  let last = -1;
  let queued = false;
  const curtain = () => {
    queued = false;
    const p = reduce.matches ? 0 : Math.min(1, Math.max(0, scrollY / (innerHeight * 0.8)));
    if (Math.abs(p - last) < 0.005) return;
    last = p;
    wall.style.filter = p ? `blur(${(p * 7).toFixed(2)}px) opacity(${(1 - p * 0.75).toFixed(3)})` : "";
    wall.style.transform = p ? `translateY(${(p * -36).toFixed(1)}px) scale(${(1 - p * 0.04).toFixed(4)})` : "";
  };
  addEventListener("scroll", () => { if (!queued) { queued = true; requestAnimationFrame(curtain); } }, { passive: true });
  curtain();
}
