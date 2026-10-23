import { loadCatalog, escapeHtml } from "/assets/js/catalog.js";
import { mark } from "/assets/js/names-wall.js";
import { mountFocus } from "/assets/js/focus.js";

// Index preview: seven proposals for /work/, one at a time, and the combination.
// The pieces are the home page's own: the marks, the two-copy italic title, the picture
// beside the cursor and the project card.

const KIND = { Featured: "Featured", Teaching: "Teaching", Experiment: "Experiment" };
const KINDS = ["Featured", "Teaching", "Experiment"];
const CHAPTER = {
  Featured: { title: "Featured", em: "work", note: "Systems, tools and visual essays at full scale." },
  Teaching: { title: "For the", em: "classroom", note: "Made for courses, juries and students." },
  Experiment: { title: "Small", em: "experiments", note: "Sketches, tests and things that might grow." },
};

const MODES = [
  { id: "list", label: "1 · Katalog listesi",
    about: "<b>Kart yerine satır.</b> Her proje tek satır: numara, işaret, büyük ad, koleksiyon, konular, araçlar. Bir kitabın içindekiler sayfası gibi okunuyor. Üzerine gelince ad italiğe soluyor, diğerleri geri çekiliyor ve görseli imlecin yanında beliriyor." },
  { id: "sentence", label: "2 · Cümle filtresi",
    about: "<b>Çipler yerine bir cümle.</b> Altı çizili kelimelere tıkla: “Show <b>teaching</b> projects about <b>networks</b>, made with <b>D3</b>.” Seçenekler küçük bir listede açılıyor, yanlarında kaç proje olduğu yazıyor." },
  { id: "chapters", label: "3 · Üç bölüm",
    about: "<b>Kitap gibi bölümler.</b> Featured, öğretim ve deneyler büyük başlıklarla ayrılıyor; her bölümün sayısı ve tek satırlık bir açıklaması var." },
  { id: "drum", label: "4 · Kaydırınca silindir",
    about: "<b>Ana sayfanın silindirinin sessiz yankısı.</b> Listeyi kaydır: ortadaki satırlar düz ve net, yukarı ve aşağı uzaklaştıkça geriye hafifçe yatıp soluyorlar (en fazla ~18°). Hareket azaltma tercihinde kapanır." },
  { id: "flow", label: "5 · Akıcı filtre geçişi",
    about: "<b>Hiçbir şey zıplamasın.</b> Koleksiyon seç: eşleşmeyen satırlar çökerek kayboluyor, kalanlar yerlerine kayıyor; geri açınca aynı şekilde açılıyorlar. Aniden yeniden çizim yok." },
  { id: "card", label: "6 · Künye + derin link",
    about: "<b>Ana sayfadaki künye.</b> Bir satıra tıkla: aynı kart açılıyor ve adres <code>#socrates</code> gibi oluyor; bu adresle açılan sayfa doğrudan o künyeyle geliyor. ← → projeler arasında geziyor, Esc kapatıyor." },
  { id: "views", label: "7 · Liste ↔ Görseller",
    about: "<b>İki görünüm.</b> Liste varsayılan; isteyen için ekran görüntülerinin baskı dokulu bir ızgarası. Üzerine gelince görsel renkleniyor." },
  { id: "pick", label: "Önerim · 1 + 2 + 3 + 5 + 6 + 7 (+ hafif 4)", pick: true,
    about: "<b>Önerdiğim birleşim.</b> Bölümlere ayrılmış katalog listesi, üstte cümle filtresi; filtrelerken satırlar çökerek kapanıyor, boşalan bölümler kayboluyor. Satıra tıklayınca künye ve derin link. Kaydırırken çok hafif bir silindir. Sağ üstte <b>List / Images</b>: görseller görünümünde de bölümler, filtre, sayılar ve künye aynı; seçim hatırlanıyor." },
];

const stage = document.getElementById("stage");
const modesEl = document.getElementById("modes");
const about = document.getElementById("about");
const bar = document.getElementById("bar");

const { projects } = await loadCatalog();
const no = (p) => String(projects.indexOf(p) + 1).padStart(2, "0");
const dual = (t) => `<span class="tw"><span class="ts">${t}</span><span class="ti" aria-hidden="true">${t}</span></span>`;

// ——— Shared: the project card, the picture beside the cursor ———

const focus = mountFocus(projects, { hold() {}, tileFor: () => null });
const focusEl = document.querySelector(".focus");
let cardHash = false; // whether the scene keeps the open card in the address
new MutationObserver(() => {
  if (focusEl.hidden && cardHash && location.hash.includes("p=")) history.replaceState(null, "", `#${current.id}`);
}).observe(focusEl, { attributes: true, attributeFilter: ["hidden"] });

const peek = document.createElement("div");
peek.className = "peek";
peek.setAttribute("aria-hidden", "true");
document.body.append(peek);
addEventListener("pointermove", (e) => {
  peek.style.transform = `translate(${Math.min(innerWidth - 360, e.clientX + 24)}px, ${Math.min(innerHeight - 210, e.clientY + 24)}px)`;
}, { passive: true });

// ——— Modes ———

const row = document.createElement("div");
row.className = "modes-row";
for (const m of MODES) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = `chip${m.pick ? " chip--pick" : ""}`;
  b.textContent = m.label;
  b.dataset.id = m.id;
  b.addEventListener("click", () => show(m.id));
  row.append(b);
}
modesEl.append(row);

let current = null;
let stop = () => {};

function show(id, { keepHash = false } = {}) {
  current = MODES.find((m) => m.id === id);
  if (!keepHash) history.replaceState(null, "", `#${id}`);
  for (const b of row.querySelectorAll(".chip")) b.setAttribute("aria-pressed", String(b.dataset.id === id));
  about.innerHTML = current.about;
  document.documentElement.style.setProperty("--bar-h", `${bar.offsetHeight}px`);
  stop();
  peek.classList.remove("on");
  stage.replaceChildren();
  stage.scrollTop = 0;
  cardHash = id === "card" || id === "pick";
  stop = SCENES[id]() || (() => {});
}

// ——— Building blocks ———

function rowHtml(p) {
  return `
    <a class="ix k-${p.kind}" href="${escapeHtml(p.url)}" data-i="${projects.indexOf(p)}" data-id="${escapeHtml(p.id)}">
      <span class="ix-no">${no(p)}</span>
      <span class="ix-mk">${mark(p)}</span>
      <span class="ix-title">${dual(escapeHtml(p.title))}</span>
      <span class="ix-kind label">${KIND[p.kind]}</span>
      <span class="ix-topics">${p.topics.map(escapeHtml).join(", ")}</span>
      <span class="ix-stack">${p.stack.map(escapeHtml).join(", ")}</span>
    </a>`;
}

function frame(title, count) {
  const wrap = document.createElement("div");
  wrap.className = "ix-wrap";
  wrap.innerHTML = `<div class="ix-head"><h2>${title}</h2><span class="ix-count">${count}</span></div>`;
  stage.append(wrap);
  return wrap;
}

function list(host, ps) {
  const el = document.createElement("div");
  el.className = "ix-list";
  el.innerHTML = ps.map(rowHtml).join("");
  host.append(el);
  return el;
}

// The image view: screenshots in print texture, each with its museum label.
function grid(host, ps) {
  const g = document.createElement("div");
  g.className = "ix-grid is-print is-labels";
  g.innerHTML = ps.map((p) => `
    <a class="c" href="${escapeHtml(p.url)}" data-i="${projects.indexOf(p)}" data-id="${escapeHtml(p.id)}">
      <div class="c-img">${p.image ? `<img src="${escapeHtml(p.image)}" alt="" loading="lazy">` : `<span class="c-type">${escapeHtml(p.title)}</span>`}</div>
      <div class="c-cap"><span class="c-no">No.&nbsp;${no(p)}</span><span class="c-title">${escapeHtml(p.title)}</span><span class="c-med">${KIND[p.kind]} · ${p.stack.map(escapeHtml).join(", ")}</span></div>
    </a>`).join("");
  host.append(g);
  return g;
}

// The picture beside the cursor, and the other rows stepping back, for any list in `root`.
function hover(root) {
  root.addEventListener("pointerover", (e) => {
    if (e.pointerType === "touch") return;
    const a = e.target.closest(".ix");
    const lists = root.querySelectorAll(".ix-list");
    lists.forEach((l) => l.classList.toggle("has-hover", Boolean(a && l.contains(a))));
    const p = a && projects[a.dataset.i];
    if (!p) { peek.classList.remove("on"); return; }
    peek.innerHTML = p.image ? `<img src="${escapeHtml(p.image)}" alt="">` : `<span class="peek-type">${escapeHtml(p.title)}</span>`;
    peek.classList.add("on");
  });
  root.addEventListener("pointerleave", () => {
    peek.classList.remove("on");
    root.querySelectorAll(".ix-list").forEach((l) => l.classList.remove("has-hover"));
  });
}

// A plain click opens the card (and, if asked, puts the project in the address).
function openOnClick(root, { deep = false } = {}) {
  root.addEventListener("click", (e) => {
    const a = e.target.closest(".ix, .ix-grid .c");
    if (!a || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault();
    peek.classList.remove("on");
    if (deep) history.replaceState(null, "", `#${current.id}&p=${a.dataset.id}`);
    focus.open(Number(a.dataset.i));
  });
  if (deep) {
    const m = location.hash.match(/p=([^&]+)/);
    const i = m ? projects.findIndex((p) => p.id === decodeURIComponent(m[1])) : -1;
    if (i >= 0) requestAnimationFrame(() => focus.open(i));
  }
}

// Rows that stop matching fold away; rows that match again unfold. Layout flows with the
// height, so the rows below glide up or down instead of jumping.
function setVisible(el, on, animate = true) {
  if (on === !el.hidden && !el.dataset.leaving) return;
  el.getAnimations().forEach((a) => a.cancel());
  if (!animate || matchMedia("(prefers-reduced-motion: reduce)").matches) {
    el.hidden = !on;
    delete el.dataset.leaving;
    return;
  }
  if (on) {
    el.hidden = false;
    delete el.dataset.leaving;
    const h = el.scrollHeight;
    el.animate(
      [{ height: "0px", opacity: 0, paddingTop: "0px", paddingBottom: "0px" }, { height: `${h}px`, opacity: 1 }],
      { duration: 380, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
    );
  } else {
    el.dataset.leaving = "1";
    const h = el.offsetHeight;
    const a = el.animate(
      [{ height: `${h}px`, opacity: 1 }, { height: "0px", opacity: 0, paddingTop: "0px", paddingBottom: "0px", borderBottomWidth: "0px" }],
      { duration: 320, easing: "cubic-bezier(0.4, 0, 0.6, 1)" },
    );
    a.onfinish = () => { el.hidden = true; delete el.dataset.leaving; };
  }
}

// "Show [all] projects about [any topic], made with [any tool]." Each bold word opens a list.
function sentence(host, state, onChange, counts) {
  const p = document.createElement("p");
  p.className = "sentence";
  host.append(p);
  const opts = {
    kind: [["", "all"], ...KINDS.map((k) => [k, k === "Experiment" ? "experimental" : k.toLowerCase()])],
    topic: [["", "any topic"], ...tally("topics").map(([t]) => [t, t.toLowerCase()])],
    stack: [["", "any tool"], ...tally("stack").map(([t]) => [t, t])],
  };
  const word = (key) => opts[key].find(([v]) => v === state[key])[1];
  const render = () => {
    p.innerHTML = `Show <button class="pick" data-k="kind" aria-expanded="false">${dual(escapeHtml(word("kind")))}</button> projects about <button class="pick" data-k="topic" aria-expanded="false">${dual(escapeHtml(word("topic")))}</button>, made with <button class="pick" data-k="stack" aria-expanded="false">${dual(escapeHtml(word("stack")))}</button>.${state.kind || state.topic || state.stack ? `<button class="sentence-reset" type="button">reset</button>` : ""}`;
  };
  render();
  let open = null;
  const close = () => { open?.remove(); open = null; p.querySelectorAll(".pick").forEach((b) => b.setAttribute("aria-expanded", "false")); };
  p.addEventListener("click", (e) => {
    if (e.target.closest(".sentence-reset")) {
      state.kind = state.topic = state.stack = "";
      close(); render(); onChange();
      return;
    }
    const opt = e.target.closest(".menu button");
    if (opt) {
      state[opt.dataset.k] = opt.dataset.v;
      close(); render(); onChange();
      return;
    }
    const b = e.target.closest(".pick");
    if (!b) return;
    const k = b.dataset.k;
    const was = open?.dataset.k === k;
    close();
    if (was) return;
    open = document.createElement("div");
    open.className = "menu";
    open.dataset.k = k;
    open.innerHTML = opts[k].map(([v, w]) => `<button type="button" data-k="${k}" data-v="${escapeHtml(v)}" aria-current="${state[k] === v}"><span>${escapeHtml(w)}</span><span class="n">${counts(k, v)}</span></button>`).join("");
    b.append(open);
    b.setAttribute("aria-expanded", "true");
  });
  document.addEventListener("pointerdown", (e) => { if (open && !p.contains(e.target)) close(); });
}

function tally(key) {
  const m = new Map();
  for (const p of projects) for (const v of p[key]) m.set(v, (m.get(v) || 0) + 1);
  return [...m].sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
}

const matches = (state) => (p) =>
  (!state.kind || p.kind === state.kind) &&
  (!state.topic || p.topics.includes(state.topic)) &&
  (!state.stack || p.stack.includes(state.stack));

// How many projects a choice would leave, given the other two choices.
const counter = (state) => (k, v) => projects.filter(matches({ ...state, [k]: v })).length;

// Rows lean back as they leave the middle of the scroller, like the home page's drum.
function scrollDrum(scroller, maxDeg) {
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return () => {};
  let raf = 0;
  const update = () => {
    raf = 0;
    const box = scroller.getBoundingClientRect();
    const mid = box.top + box.height / 2;
    for (const el of scroller.querySelectorAll(".ix:not([hidden]), .chapter-head")) {
      const r = el.getBoundingClientRect();
      if (r.bottom < box.top - 40 || r.top > box.bottom + 40) continue;
      const d = Math.max(-1, Math.min(1, (r.top + r.height / 2 - mid) / (box.height / 2)));
      el.style.transform = `perspective(900px) rotateX(${(-d * maxDeg).toFixed(2)}deg)`;
      el.style.opacity = (1 - Math.abs(d) ** 2 * 0.55).toFixed(3);
    }
  };
  const on = () => { if (!raf) raf = requestAnimationFrame(update); };
  scroller.addEventListener("scroll", on, { passive: true });
  addEventListener("resize", on);
  update();
  return () => { scroller.removeEventListener("scroll", on); removeEventListener("resize", on); cancelAnimationFrame(raf); };
}

// ——— Scenes ———

const SCENES = {
  list() {
    const wrap = frame("Index", `${projects.length} projects`);
    list(wrap, projects);
    hover(wrap);
  },

  sentence() {
    const wrap = frame("Index", `${projects.length} projects`);
    const state = { kind: "", topic: "", stack: "" };
    const count = wrap.querySelector(".ix-count");
    const go = () => {
      const ok = matches(state);
      let n = 0;
      for (const el of wrap.querySelectorAll(".ix")) { const on = ok(projects[el.dataset.i]); el.hidden = !on; n += on; }
      count.textContent = `${n} of ${projects.length}`;
    };
    sentence(wrap, state, go, counter(state));
    list(wrap, projects);
    hover(wrap);
  },

  chapters() {
    const wrap = frame("Index", `${projects.length} projects in three chapters`);
    for (const k of KINDS) {
      const ps = projects.filter((p) => p.kind === k);
      const sec = document.createElement("section");
      sec.className = "chapter";
      sec.innerHTML = `<div class="chapter-head"><h3>${CHAPTER[k].title} <em>${CHAPTER[k].em}</em></h3><span class="n">${String(ps.length).padStart(2, "0")}</span><p>${CHAPTER[k].note}</p></div>`;
      wrap.append(sec);
      list(sec, ps);
    }
    hover(wrap);
  },

  drum() {
    const wrap = frame("Index", "scroll the list");
    list(wrap, projects);
    hover(wrap);
    return scrollDrum(stage, 18);
  },

  flow() {
    const wrap = frame("Index", `${projects.length} projects`);
    const sw = document.createElement("div");
    sw.className = "switch";
    const choices = [["", "All"], ...KINDS.map((k) => [k, k === "Experiment" ? "Experiments" : k])];
    sw.innerHTML = choices.map(([v, w]) => `<button class="chip" type="button" data-v="${v}" aria-pressed="${!v}">${w}</button>`).join("");
    wrap.querySelector(".ix-head").after(sw);
    list(wrap, projects);
    hover(wrap);
    const count = wrap.querySelector(".ix-count");
    sw.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      sw.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      let n = 0;
      for (const el of wrap.querySelectorAll(".ix")) {
        const on = !b.dataset.v || projects[el.dataset.i].kind === b.dataset.v;
        setVisible(el, on);
        n += on;
      }
      count.textContent = `${n} of ${projects.length}`;
    });
  },

  card() {
    const wrap = frame("Index", "click a row");
    list(wrap, projects);
    hover(wrap);
    openOnClick(wrap, { deep: true });
  },

  views() {
    const wrap = frame("Index", `${projects.length} projects`);
    const t = document.createElement("div");
    t.className = "views";
    t.innerHTML = `<button type="button" data-v="list" aria-pressed="true">List</button><button type="button" data-v="grid" aria-pressed="false">Images</button>`;
    wrap.querySelector(".ix-count").replaceWith(t);
    const l = list(wrap, projects);
    const g = grid(wrap, projects);
    g.hidden = true;
    hover(wrap);
    t.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (!b) return;
      t.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
      const showGrid = b.dataset.v === "grid";
      const [inn, out] = showGrid ? [g, l] : [l, g];
      out.hidden = true;
      inn.hidden = false;
      inn.animate([{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }], { duration: 360, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
    });
  },

  pick() {
    const wrap = frame("Index", "");
    const count = wrap.querySelector(".ix-count");
    const state = { kind: "", topic: "", stack: "" };

    // List or images: one switch for the whole page, remembered for the next visit.
    // Both views live in every chapter, so the filter, the counts and the card never change.
    const views = document.createElement("div");
    views.className = "views";
    views.innerHTML = `<button type="button" data-v="list">List</button><button type="button" data-v="grid">Images</button>`;
    const side = document.createElement("div");
    side.className = "ix-side";
    count.replaceWith(side);
    side.append(count, views);
    let view = "list";
    try { view = localStorage.getItem("index-view") === "grid" ? "grid" : "list"; } catch {}
    const setView = (v, animate) => {
      view = v;
      wrap.classList.toggle("is-grid", v === "grid");
      views.querySelectorAll("button").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.v === v)));
      try { localStorage.setItem("index-view", v); } catch {}
      if (animate) {
        for (const sec of chapters) {
          if (sec.hidden) continue;
          sec.querySelector(v === "grid" ? ".ix-grid" : ".ix-list").animate(
            [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "none" }],
            { duration: 360, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" },
          );
        }
      }
    };
    views.addEventListener("click", (e) => {
      const b = e.target.closest("button");
      if (b && b.dataset.v !== view) setView(b.dataset.v, true);
    });
    const chapters = KINDS.map((k) => {
      const sec = document.createElement("section");
      sec.className = "chapter";
      sec.dataset.k = k;
      return sec;
    });
    const go = (animate = true) => {
      const ok = matches(state);
      let n = 0;
      for (const sec of chapters) {
        let m = 0;
        for (const el of sec.querySelectorAll(".ix")) {
          const on = ok(projects[el.dataset.i]);
          setVisible(el, on, animate && view === "list");
          m += on;
        }
        // In the image view the cards that leave simply go; the ones that stay close up.
        for (const el of sec.querySelectorAll(".ix-grid .c")) {
          const on = ok(projects[el.dataset.i]);
          if (on === !el.hidden) continue;
          el.hidden = !on;
          if (on && animate && view === "grid") el.animate([{ opacity: 0, transform: "scale(0.96)" }, { opacity: 1, transform: "none" }], { duration: 320, easing: "cubic-bezier(0.2, 0.8, 0.2, 1)" });
        }
        sec.querySelector(".n").textContent = String(m).padStart(2, "0");
        setVisible(sec, m > 0, animate);
        n += m;
      }
      count.textContent = n === projects.length ? `${n} projects` : `${n} of ${projects.length}`;
    };
    sentence(wrap, state, () => go(true), counter(state));
    for (const [i, k] of KINDS.entries()) {
      const sec = chapters[i];
      const ps = projects.filter((p) => p.kind === k);
      sec.innerHTML = `<div class="chapter-head"><h3>${CHAPTER[k].title} <em>${CHAPTER[k].em}</em></h3><span class="n">${String(ps.length).padStart(2, "0")}</span><p>${CHAPTER[k].note}</p></div>`;
      wrap.append(sec);
      list(sec, ps);
      grid(sec, ps);
    }
    setView(view, false);
    go(false);
    hover(wrap);
    openOnClick(wrap, { deep: true });
    return scrollDrum(stage, 8);
  },
};

// Start once everything above exists.
const startId = location.hash.slice(1).split("&")[0];
show(MODES.some((m) => m.id === startId) ? startId : "pick", { keepHash: location.hash.includes("p=") });
