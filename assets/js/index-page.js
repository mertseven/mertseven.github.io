import { loadCatalog, escapeHtml } from "./catalog.js?v=36fa2c107a";
import { mark } from "./names-wall.js?v=35c8fe462c";
import { mountFocus } from "./focus.js?v=1defe7310a";
import { t, lang, href, kindName, topicName } from "./i18n.js?v=137ec0cac8";

// /work/: the catalogue. Projects in three chapters, one row each — number, mark, title,
// collection, topics, tools — under a sentence that filters them ("Show teaching projects
// about networks, made with D3."). Rows that stop matching fold away and empty chapters
// close; the rest glide into place. Hovering a row brings its title to serif italic and
// its picture beside the cursor; a click opens the project card at /work/#id. A switch
// shows the same chapters as images instead, or the whole work as a glossary of the
// concepts behind it (assets/data/glossary.json), each with the projects and papers that
// carry it. Scrolling leans the rows back a little, a quiet echo of the drum on the home page.
//
// The filter lives in the query (?collection=Teaching&topic=Networks&stack=D3), the open
// card in the hash (#socrates), and the chosen view in localStorage.

const KINDS = ["Featured", "Teaching", "Experiment"];
const CHAPTER = t.chapter;
const WORD = t.kindWord;
const LEAN_DEG = 8; // how far rows lean back at the top and bottom of the window

const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const dual = (t) => `<span class="tw"><span class="ts">${t}</span><span class="ti" aria-hidden="true">${t}</span></span>`;

export async function mountIndexPage(root) {
  const [{ projects, publications }, glossary] = await Promise.all([
    loadCatalog(),
    fetch(new URL("../data/glossary.json", import.meta.url), { cache: "no-cache" }).then((r) => r.json()).catch(() => ({ terms: [] })),
  ]);
  const no = (p) => String(projects.indexOf(p) + 1).padStart(2, "0");
  const state = readQuery();

  root.innerHTML = `
    <div class="ix-head">
      <h1 class="ix-h1">${t.index}</h1>
      <div class="ix-side"><span class="ix-count mono" aria-live="polite"></span>
        <div class="views" role="group" aria-label="${t.view}">
          <button type="button" data-v="list">${t.list}</button><button type="button" data-v="grid">${t.images}</button><button type="button" data-v="gloss">${t.glossary}</button>
        </div>
      </div>
    </div>
    <p class="sentence"></p>`;
  const count = root.querySelector(".ix-count");
  const sentenceEl = root.querySelector(".sentence");
  const viewsEl = root.querySelector(".views");

  // ——— Chapters ———
  const chapters = KINDS.map((k) => {
    const ps = projects.filter((p) => p.kind === k);
    const sec = document.createElement("section");
    sec.className = "chapter";
    sec.dataset.k = k;
    sec.setAttribute("aria-labelledby", `ch-${k}`);
    sec.innerHTML = `
      <div class="chapter-head">
        <h2 id="ch-${k}">${CHAPTER[k].title} <em>${CHAPTER[k].em}</em></h2>
        <span class="n mono"></span>
        <p>${CHAPTER[k].note}</p>
      </div>
      <div class="ix-list">${ps.map(rowHtml).join("")}</div>
      <div class="ix-grid">${ps.map(cardHtml).join("")}</div>`;
    root.append(sec);
    return sec;
  });

  // ——— Glossary: the concepts behind the work, letter by letter ———
  // A term is matched as a whole word, so "AR" does not turn up inside "learning".
  const whole = (term) => new RegExp(`(^|[^a-z])${term.replace(/[.*+?^${}()|[\]\\-]/g, "\\$&")}($|[^a-z])`, "i");
  const entries = glossary.terms.map((g) => {
    const w = whole(g.term);
    return {
      ...g[lang],
      projects: projects.filter((p) => p.topics.some((x) => w.test(x))),
      papers: publications.filter((p) => p.keywords.some((k) => w.test(k)) || w.test(p.title)),
    };
  }).filter((e) => e.projects.length + e.papers.length)
    .sort((a, b) => a.label.localeCompare(b.label, lang));
  const initial = (e) => e.label[0].toLocaleUpperCase(lang);
  const letters = [...new Set(entries.map(initial))];
  const glossEl = document.createElement("section");
  glossEl.className = "ix-gloss";
  glossEl.setAttribute("aria-label", t.glossary);
  glossEl.innerHTML = `
    <nav class="gl-az mono">${letters.map((l) => `<button type="button" data-l="${l}">${l}</button>`).join("")}</nav>
    ${letters.map((l) => `
      <div class="gl-l" data-l="${l}"><span class="gl-letter">${l}</span>
        <dl>${entries.filter((e) => initial(e) === l).map((e) => `
          <div class="gl-e">
            <dt><span class="gl-term">${escapeHtml(e.label)}</span><span class="gl-n mono"></span></dt>
            <dd><p>${escapeHtml(e.def)}</p>
              <ul>
                ${e.projects.map((p) => `<li class="gl-w" data-i="${projects.indexOf(p)}"><a class="ig" href="${escapeHtml(p.url)}" data-i="${projects.indexOf(p)}" data-id="${escapeHtml(p.id)}">${escapeHtml(p.title)}</a><span class="label">${t.kindProject}</span></li>`).join("")}
                ${e.papers.map((p) => `<li class="gl-w gl-paper"><a href="${escapeHtml(href(p.url))}">${escapeHtml(p.title.split(":")[0])}</a><span class="label">${t.kindPaper}</span></li>`).join("")}
              </ul>
            </dd>
          </div>`).join("")}
        </dl>
      </div>`).join("")}
    <p class="gl-none" hidden>${t.noConcept}</p>`;
  root.append(glossEl);
  glossEl.querySelector(".gl-az").addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) glossEl.querySelector(`.gl-l[data-l="${b.dataset.l}"]`)?.scrollIntoView({ behavior: reduce() ? "auto" : "smooth", block: "start" });
  });

  // The filter reaches the glossary too: projects that stop matching drop out, papers stay
  // only while no collection or tool is chosen (they have neither), and an emptied concept
  // or letter closes.
  function filterGlossary(ok) {
    const papersOn = !state.kind && !state.stack;
    let any = false;
    for (const e of glossEl.querySelectorAll(".gl-e")) {
      let n = 0;
      for (const li of e.querySelectorAll(".gl-w")) {
        const on = li.classList.contains("gl-paper") ? papersOn : ok(projects[li.dataset.i]);
        li.hidden = !on;
        n += on;
      }
      e.hidden = !n;
      e.querySelector(".gl-n").textContent = t.works(n);
      any ||= n > 0;
    }
    for (const l of glossEl.querySelectorAll(".gl-l")) l.hidden = !l.querySelector(".gl-e:not([hidden])");
    for (const b of glossEl.querySelectorAll(".gl-az button")) b.disabled = glossEl.querySelector(`.gl-l[data-l="${b.dataset.l}"]`).hidden;
    glossEl.querySelector(".gl-none").hidden = any;
  }

  function rowHtml(p) {
    return `
      <a class="ix k-${p.kind}" href="${escapeHtml(p.url)}" data-i="${projects.indexOf(p)}" data-id="${escapeHtml(p.id)}">
        <span class="ix-no mono">${no(p)}</span>
        <span class="ix-mk">${mark(p)}</span>
        <span class="ix-title">${dual(escapeHtml(p.title))}</span>
        <span class="ix-kind label">${kindName(p.kind)}</span>
        <span class="ix-topics">${p.topics.map((x) => escapeHtml(topicName(x))).join(", ")}</span>
        <span class="ix-stack mono">${p.stack.map(escapeHtml).join(", ")}</span>
      </a>`;
  }

  function cardHtml(p) {
    const pic = p.image
      ? `<img src="${escapeHtml(p.image)}" alt="" loading="lazy" decoding="async">`
      : `<span class="ic-type">${escapeHtml(p.title)}</span>`;
    return `
      <a class="ic" href="${escapeHtml(p.url)}" data-i="${projects.indexOf(p)}" data-id="${escapeHtml(p.id)}">
        <span class="ic-img">${pic}</span>
        <span class="ic-cap">
          <span class="ic-no mono">No.&nbsp;${no(p)}</span>
          <span class="ic-title">${escapeHtml(p.title)}</span>
          <span class="ic-med">${kindName(p.kind)} &middot; ${p.stack.map(escapeHtml).join(", ")}</span>
        </span>
      </a>`;
  }

  // ——— Filter ———
  const matches = (s) => (p) =>
    (!s.kind || p.kind === s.kind) &&
    (!s.topic || p.topics.includes(s.topic)) &&
    (!s.stack || p.stack.includes(s.stack));

  const tally = (key) => {
    const m = new Map();
    for (const p of projects) for (const v of p[key]) m.set(v, (m.get(v) || 0) + 1);
    return [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  };
  const options = {
    kind: [["", WORD[""]], ...KINDS.map((k) => [k, WORD[k]])],
    topic: [["", t.anyTopic], ...tally("topics").map(([x]) => [x, topicName(x).toLocaleLowerCase(document.documentElement.lang)])],
    stack: [["", t.anyTool], ...tally("stack").map(([x]) => [x, x])],
  };
  // Drop values from the address that no project has.
  for (const k of ["kind", "topic", "stack"]) if (!options[k].some(([v]) => v === state[k])) state[k] = "";

  const word = (k) => options[k].find(([v]) => v === state[k])[1];
  // How many projects a choice would leave, given the other two.
  const countFor = (k, v) => projects.filter(matches({ ...state, [k]: v })).length;

  function writeSentence() {
    const pick = (k) => `<button class="pick" type="button" data-k="${k}" aria-haspopup="listbox" aria-expanded="false">${dual(escapeHtml(word(k)))}</button>`;
    const any = state.kind || state.topic || state.stack;
    sentenceEl.innerHTML = `${t.sentence(pick("kind"), pick("topic"), pick("stack"))}${any ? ` <button class="sentence-reset" type="button">${t.reset}</button>` : ""}`;
  }

  let menu = null;
  const closeMenu = (focusPick) => {
    if (!menu) return;
    const b = menu.parentElement;
    menu.remove();
    menu = null;
    b.setAttribute("aria-expanded", "false");
    if (focusPick) b.focus();
  };
  const openMenu = (b) => {
    const k = b.dataset.k;
    menu = document.createElement("div");
    menu.className = "menu";
    menu.setAttribute("role", "listbox");
    menu.innerHTML = options[k].map(([v, w]) => {
      const n = countFor(k, v);
      return `<button type="button" role="option" data-k="${k}" data-v="${escapeHtml(v)}" aria-selected="${state[k] === v}"${n ? "" : " disabled"}><span>${escapeHtml(w)}</span><span class="n mono">${n}</span></button>`;
    }).join("");
    b.append(menu);
    b.setAttribute("aria-expanded", "true");
    (menu.querySelector('[aria-selected="true"]') || menu.querySelector("button:not([disabled])"))?.focus();
  };

  sentenceEl.addEventListener("click", (e) => {
    if (e.target.closest(".sentence-reset")) {
      state.kind = state.topic = state.stack = "";
      return apply(true);
    }
    const opt = e.target.closest(".menu button");
    if (opt) {
      state[opt.dataset.k] = opt.dataset.v;
      closeMenu(false);
      apply(true);
      sentenceEl.querySelector(`.pick[data-k="${opt.dataset.k}"]`)?.focus();
      return;
    }
    const b = e.target.closest(".pick");
    if (!b) return;
    const same = menu?.parentElement === b;
    closeMenu(false);
    if (!same) openMenu(b);
  });
  sentenceEl.addEventListener("keydown", (e) => {
    if (!menu) return;
    const items = [...menu.querySelectorAll("button:not([disabled])")];
    const i = items.indexOf(document.activeElement);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      items[(i + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length]?.focus();
    } else if (e.key === "Escape") {
      e.preventDefault();
      e.stopPropagation();
      closeMenu(true);
    }
  });
  document.addEventListener("pointerdown", (e) => { if (menu && !sentenceEl.contains(e.target)) closeMenu(false); });

  // Rows that stop matching fold away; rows that match again unfold. The layout flows
  // with the height, so the rows below glide instead of jumping.
  function fold(el, on, animate) {
    if (on === !el.hidden && !el.dataset.leaving) return;
    el.getAnimations().forEach((a) => a.cancel());
    if (!animate || reduce()) {
      el.hidden = !on;
      delete el.dataset.leaving;
      return;
    }
    if (on) {
      el.hidden = false;
      delete el.dataset.leaving;
      el.animate(
        [{ height: "0px", opacity: 0, paddingTop: "0px", paddingBottom: "0px" }, { height: `${el.scrollHeight}px`, opacity: 1 }],
        { duration: 380, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
      );
    } else {
      el.dataset.leaving = "1";
      const a = el.animate(
        [{ height: `${el.offsetHeight}px`, opacity: 1 }, { height: "0px", opacity: 0, paddingTop: "0px", paddingBottom: "0px", marginTop: "0px", borderBottomWidth: "0px" }],
        { duration: 320, easing: "cubic-bezier(0.4, 0, 0.6, 1)" },
      );
      a.onfinish = () => { el.hidden = true; delete el.dataset.leaving; };
    }
  }

  function apply(animate) {
    writeSentence();
    writeQuery(state);
    const ok = matches(state);
    let total = 0;
    for (const sec of chapters) {
      let m = 0;
      for (const el of sec.querySelectorAll(".ix")) {
        const on = ok(projects[el.dataset.i]);
        fold(el, on, animate && view === "list");
        m += on;
      }
      for (const el of sec.querySelectorAll(".ic")) {
        const on = ok(projects[el.dataset.i]);
        if (on === !el.hidden) continue;
        el.hidden = !on;
        if (on && animate && view === "grid" && !reduce()) {
          el.animate([{ opacity: 0, transform: "scale(0.96)" }, { opacity: 1, transform: "none" }], { duration: 320, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
        }
      }
      sec.querySelector(".chapter-head .n").textContent = String(m).padStart(2, "0");
      fold(sec, m > 0, animate);
      total += m;
    }
    count.textContent = t.shown(total, projects.length);
    filterGlossary(ok);
    lean();
  }

  // ——— List or images ———
  let view = "list";
  try { view = ["grid", "gloss"].includes(localStorage.getItem("index-view")) ? localStorage.getItem("index-view") : "list"; } catch {}
  function setView(v, animate) {
    view = v;
    root.classList.toggle("is-grid", v === "grid");
    root.classList.toggle("is-gloss", v === "gloss");
    viewsEl.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === v)));
    try { localStorage.setItem("index-view", v); } catch {}
    if (animate && !reduce() && v === "gloss") {
      glossEl.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 360, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
    } else if (animate && !reduce()) {
      for (const sec of chapters) {
        if (sec.hidden) continue;
        sec.querySelector(v === "grid" ? ".ix-grid" : ".ix-list").animate(
          [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }],
          { duration: 360, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
        );
      }
    }
    lean();
  }
  viewsEl.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b && b.dataset.v !== view) setView(b.dataset.v, true);
  });

  // ——— Hover: title to italic, the others step back, the picture by the cursor ———
  const peek = document.createElement("div");
  peek.className = "peek";
  peek.setAttribute("aria-hidden", "true");
  document.body.append(peek);
  addEventListener("pointermove", (e) => {
    peek.style.transform = `translate(${Math.min(innerWidth - 360, e.clientX + 24)}px, ${Math.min(innerHeight - 210, e.clientY + 24)}px)`;
  }, { passive: true });
  root.addEventListener("pointerover", (e) => {
    if (e.pointerType === "touch") return;
    const a = e.target.closest(".ix");
    root.querySelectorAll(".ix-list").forEach((l) => l.classList.toggle("has-hover", Boolean(a && l.contains(a))));
    const p = a && projects[a.dataset.i];
    if (!p) { peek.classList.remove("on"); return; }
    peek.innerHTML = p.image ? `<img src="${escapeHtml(p.image)}" alt="">` : `<span class="peek-type">${escapeHtml(p.title)}</span>`;
    peek.classList.add("on");
  });
  root.addEventListener("pointerleave", () => {
    peek.classList.remove("on");
    root.querySelectorAll(".ix-list").forEach((l) => l.classList.remove("has-hover"));
  });

  // ——— The project card, and its place in the address ———
  const focus = mountFocus(projects, { hold() {}, tileFor: () => null });
  const focusEl = document.querySelector(".focus");
  new MutationObserver(() => {
    if (focusEl.hidden && location.hash) history.replaceState(null, "", location.pathname + location.search);
  }).observe(focusEl, { attributes: true, attributeFilter: ["hidden"] });
  const openCard = (i) => {
    peek.classList.remove("on");
    history.replaceState(null, "", `${location.pathname}${location.search}#${projects[i].id}`);
    focus.open(i);
  };
  root.addEventListener("click", (e) => {
    const a = e.target.closest(".ix, .ic, .ig");
    if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    openCard(Number(a.dataset.i));
  });
  const fromHash = () => {
    const id = decodeURIComponent(location.hash.slice(1));
    const i = id ? projects.findIndex((p) => p.id === id) : -1;
    if (i >= 0) focus.open(i);
  };

  // ——— Lean: rows tilt back as they leave the middle of the window ———
  let raf = 0;
  function lean() {
    if (reduce() || raf) return;
    raf = requestAnimationFrame(() => {
      raf = 0;
      const mid = innerHeight / 2;
      for (const el of root.querySelectorAll(view === "list" ? ".ix:not([hidden]), .chapter-head" : ".chapter-head")) {
        const r = el.getBoundingClientRect();
        if (r.bottom < -40 || r.top > innerHeight + 40) continue;
        const d = Math.max(-1, Math.min(1, (r.top + r.height / 2 - mid) / mid));
        el.style.transform = `perspective(900px) rotateX(${(-d * LEAN_DEG).toFixed(2)}deg)`;
        el.style.opacity = (1 - d * d * 0.45).toFixed(3);
      }
    });
  }
  addEventListener("scroll", lean, { passive: true });
  addEventListener("resize", lean);

  setView(view, false);
  apply(false);
  root.classList.add("is-ready");
  fromHash();
  addEventListener("hashchange", fromHash);
}

function readQuery() {
  const q = new URLSearchParams(location.search);
  return { kind: q.get("collection") || "", topic: q.get("topic") || "", stack: q.get("stack") || "" };
}

function writeQuery(s) {
  const q = new URLSearchParams();
  if (s.kind) q.set("collection", s.kind);
  if (s.topic) q.set("topic", s.topic);
  if (s.stack) q.set("stack", s.stack);
  const qs = q.toString();
  history.replaceState(null, "", `${location.pathname}${qs ? `?${qs}` : ""}${location.hash}`);
}
