import { loadCatalog, escapeHtml } from "/assets/js/catalog.js";
import * as approaches from "./approaches.js";

// Scratch page: the home wall in eight directions, side by side, with real catalog content.
// Every scene draws into #stage; the chips above switch between them (and set #hash).

const KIND = { Featured: "Featured", Teaching: "Teaching", Experiment: "Experiment" };

const MODES = [
  {
    id: "now", label: "0 · Şimdiki", scene: "rows", cls: [],
    about: "<b>Şimdiki hali, düzleştirilmiş.</b> Aynı boyda 16:9 renkli kartlar, sabit hızla kayan sıralar. Netflix hissini veren tam olarak bu.",
  },
  {
    id: "print", label: "1 · Baskı", scene: "rows", cls: ["is-print"],
    about: "<b>Ekran değil, baskı.</b> Kartlar gri ve raster noktalı, kâğıda basılmış gibi; okyanusun ASCII baskısıyla aynı aile. Renk yalnızca fare üzerine gelince (ya da aramada eşleşince) geri geliyor.",
  },
  {
    id: "salon", label: "2 · Salon asma", scene: "salon", cls: [],
    about: "<b>Tek ölçü yerine sergi duvarı.</b> Featured projeler büyük, öğretim işleri orta, deneyler küçük; karışık boylar sıkı bir ızgaraya yerleşiyor ve duvar tek parça halinde çok yavaş kayıyor.",
  },
  {
    id: "labels", label: "3 · Müze etiketi", scene: "rows", cls: ["is-labels"],
    about: "<b>Her kartın altında sergi künyesi.</b> Numara, başlık, koleksiyon ve malzeme (stack), mono yazıyla. Kart bir küçük resim olmaktan çıkıp koleksiyonda bir parça oluyor.",
  },
  {
    id: "mixed", label: "4 · Karışık türler", scene: "rows", cls: [], mixed: true,
    about: "<b>Duvarda yalnızca proje yok.</b> Aralarda yayın başlıkları, katalogdan sayılar ve yazılardan satırlar. Bir izleme listesi değil, bir merak kabinesi (Wunderkammer).",
  },
  {
    id: "shoal", label: "5 · Akıntı", scene: "shoal", cls: [],
    about: "<b>Bant değil, sürü.</b> Kartlar ayrı ayrı, farklı hızlarda süzülüyor ve hafifçe dalgalanıyor; fareyle yaklaşınca balıklar gibi kenara kaçıyorlar.",
  },
  {
    id: "field", label: "6 · Ağ", scene: "field", cls: [],
    about: "<b>Sıra yok, ilişki var.</b> Aynı konuyu paylaşan projeler birbirine çekiliyor ve ince çizgilerle bağlanıyor. Bir projenin üzerine gelince komşuları öne çıkıyor. En cesur ve en zor okunanı.",
  },
  {
    id: "pick", label: "Önerim · Salon (1 + 2 + 3 + 4)", scene: "salon", cls: ["is-print", "is-labels"], mixed: true, pick: true,
    about: "<b>Önerdiğim birleşim.</b> Baskı dokusu, karışık boylu sergi asması, müze etiketleri ve araya karışan yazı ile sayılar. Fare bir kartın üzerine gelince renkleniyor. Kavisli perde ve tıklayınca açılan künye bunun üstüne olduğu gibi oturur.",
  },

  // Approaches: other ways to think about the wall, not just how it looks.
  {
    group: "approach", id: "answer", label: "A · Cevap duvarı", scene: "answer", cls: [], pick: true,
    about: "<b>Duvar sorunun cevabı.</b> Başta sakin ve seyrek: kartlar küçük ve soluk süzülüyor. Kutuya yazdıkça ilgili projeler öne gelip toplanıyor, gerisi kenarlara dağılıyor. Kutu boşken dönen ipucunun projeleri hafifçe yüzeye çıkıyor. <b>Yazmayı dene:</b> networks, philosophy, journalism.",
  },
  {
    group: "approach", id: "names", label: "B · İsim duvarı", scene: "names", cls: [],
    about: "<b>Görsel yok, isimler var.</b> Proje adları büyük harflerle sergi afişi gibi akıyor; ağırlık koleksiyona göre (Featured koyu, deneyler soluk). Bir adın üzerine gelince o projenin görseli imlecin yanında beliriyor. Dağınık ekran görüntüleri ancak istendiğinde, tek başına görünüyor.",
  },
  {
    group: "approach", id: "ascii", label: "C · ASCII baskı", scene: "ascii", cls: ["ascii", "is-labels"],
    about: "<b>Hepsi tek dilde.</b> Her ekran görüntüsü okyanustaki gibi karakterlerle yeniden çiziliyor; bütün projeler aynı malzemeden yapılmış gibi duruyor. Üzerine gelince gerçek hali beliriyor. (Burada basit bir dönüştürücü var; gerçekte okyanus motorunun renderer'ı kullanılır.)",
  },
  {
    group: "approach", id: "live", label: "D · Canlı duvar", scene: "live", cls: [],
    about: "<b>Ekran görüntüsü değil, çalışan iş.</b> Projeler hareket halinde. Gerçekte her biri 3–4 saniyelik sessiz bir döngü videosu olur; burada fikir görünsün diye projelerin kendisi küçültülmüş canlı pencerelerde açık (tıklanmıyor). Yüklenmesi birkaç saniye sürebilir.",
  },
  {
    group: "approach", id: "contact", label: "E · Kontakt baskı", scene: "contact", cls: [],
    about: "<b>Fotoğrafçının negatif şeridi.</b> Kare numaraları, film perforasyonu ve öne çıkan işlerin etrafında kırmızı kalemle çizilmiş daireler. Editoryal ve arşivsel; “seçilmiş işler” duygusu veriyor. (Daireler şimdilik Featured projelerde.)",
  },
  {
    group: "approach", id: "table", label: "F · Masa", scene: "table", cls: [],
    about: "<b>Masaya dağılmış baskılar.</b> Kartlar fotoğraf kâğıdına basılmış gibi, hafif açılarla üst üste. <b>Sürükle</b>, karıştır, birini öne çek. Oyunbaz ve meraklı; ama en az “sakin premium” olanı.",
  },
  {
    group: "approach", id: "one", label: "G · Tek iş", scene: "one", cls: [],
    about: "<b>Duvarın tersi: küratörlük.</b> Ekranı tek bir proje kaplıyor, birkaç saniyede bir yavaşça diğerine geçiyor. Genişliği daha geç gösteriyor ama ilk izlenim çok güçlü. Oklarla da geçilebilir.",
  },
  {
    group: "approach", id: "map", label: "H · Kavram haritası", scene: "map", cls: [],
    about: "<b>Projeler bir düzlemde.</b> Yatayda kuram ↔ pratik, dikeyde öğretim ↔ deney. <b>Sürükleyerek gez, tekerlekle yakınlaştır.</b> Konumlar şimdilik konu etiketlerinden kaba bir tahmin; gerçekte senin yerleştirmen olur.",
  },
];

const stage = document.getElementById("stage");
const modesEl = document.getElementById("modes");
const about = document.getElementById("about");
const bar = document.getElementById("bar");

let projects = [];
let entries = [];
let texts = [];
let current = null;
let stop = () => {};

const catalog = await loadCatalog();
projects = catalog.projects;
entries = catalog.entries;
texts = buildTexts(catalog);

const groups = { look: "Görünüm", approach: "Yaklaşım" };
for (const [g, name] of Object.entries(groups)) {
  const row = document.createElement("div");
  row.className = "modes-row";
  row.innerHTML = `<span class="label">${name}</span>`;
  for (const m of MODES.filter((m) => (m.group || "look") === g)) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = `chip${m.pick ? " chip--pick" : ""}`;
    b.textContent = m.label;
    b.dataset.id = m.id;
    b.addEventListener("click", () => show(m.id));
    row.append(b);
  }
  modesEl.append(row);
}

show(MODES.some((m) => m.id === location.hash.slice(1)) ? location.hash.slice(1) : "pick");

let resizeTimer;
addEventListener("resize", () => {
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(() => show(current.id), 200);
});

function show(id) {
  current = MODES.find((m) => m.id === id);
  history.replaceState(null, "", `#${id}`);
  for (const b of modesEl.querySelectorAll(".chip")) b.setAttribute("aria-pressed", String(b.dataset.id === id));
  about.innerHTML = current.about;
  document.documentElement.style.setProperty("--bar-h", `${bar.offsetHeight}px`);

  stop();
  stop = () => {};
  stage.className = `stage ${current.cls.join(" ")}`;
  stage.replaceChildren();
  document.getElementById("peek").classList.remove("on");
  const local = { rows, salon, shoal, field }[current.scene];
  const ctx = { stage, projects, entries, card, rows, KIND, mode: current };
  stop = (local ? local(current) : approaches[current.scene](ctx)) || (() => {});
}

// ——— Content ———

function card(p, extra = "") {
  const n = projects.indexOf(p) + 1;
  const img = p.image
    ? `<img src="${escapeHtml(p.image)}" alt="" loading="lazy" decoding="async">`
    : `<span class="c-type">${escapeHtml(p.title)}</span>`;
  return `
    <a class="c ${extra}" href="${escapeHtml(p.url)}" target="_blank" rel="noopener" data-id="${escapeHtml(p.id)}">
      <div class="c-img">${img}</div>
      <div class="c-cap">
        <span class="c-no">No.&nbsp;${String(n).padStart(2, "0")}</span>
        <span class="c-title">${escapeHtml(p.title)}</span>
        <span class="c-med">${KIND[p.kind]} · ${p.stack.map(escapeHtml).join(", ")}</span>
      </div>
    </a>`;
}

// Text cards come only from the catalog: paper titles, real counts, the writing.
function buildTexts({ projects: ps, entries }) {
  const pubs = entries.filter((e) => e.type === "Research");
  const writing = entries.filter((e) => e.type === "Writing");
  const out = [];
  out.push({ kind: "num", n: "162", text: "JavaScript libraries mapped for interactive journalism", src: "Interaction Atlas" });
  for (const p of pubs.slice(0, 6)) {
    const short = p.title.replace(/^\[PhD\]\s*/, "").split(":")[0];
    out.push({ kind: "quote", text: short, src: `Paper · ${p.raw.year}` });
  }
  out.push({ kind: "num", n: String(ps.length), text: "projects, from teaching tools to experiments", src: "This collection" });
  out.push({ kind: "num", n: "118", text: "journalism works built with them", src: "Interaction Atlas" });
  for (const w of writing) out.push({ kind: "quote", text: w.raw.excerpt.replace(/\.\.\.$|…$/, ""), src: `${w.raw.type} · ${w.raw.date.slice(0, 4)} · ${w.title}` });
  out.push({ kind: "num", n: String(pubs.length), text: "papers on media, networks and knowledge", src: "Research" });
  return out;
}

function textCard(t, extra = "") {
  const body = t.kind === "num"
    ? `<div class="t-num">${escapeHtml(t.n)}<small>${escapeHtml(t.text)}</small></div>`
    : `<div class="t-quote">“${escapeHtml(t.text)}”</div>`;
  return `<div class="t ${extra}"><span class="t-kind">${t.kind === "num" ? "Figure" : "From the archive"}</span>${body}<span class="t-src">${escapeHtml(t.src)}</span></div>`;
}

// Projects with a text card after every third, cycling through the texts.
function sequence(mixed, offset = 0) {
  const ps = projects.slice(offset).concat(projects.slice(0, offset));
  if (!mixed) return ps.map((p) => ({ p }));
  const out = [];
  let t = offset % texts.length;
  ps.forEach((p, i) => {
    out.push({ p });
    if (i % 3 === 2) out.push({ t: texts[t++ % texts.length] });
  });
  return out;
}

// ——— 0, 1, 3, 4 · Rows ———

function rows(mode) {
  const W = stage.clientWidth;
  const cw = Math.round(Math.min(340, Math.max(200, W * 0.22)));
  const wrap = document.createElement("div");
  wrap.className = "rows";
  wrap.style.setProperty("--cw", `${cw}px`);
  for (let r = 0; r < 3; r++) {
    const seq = sequence(mode.mixed, r * 9);
    const one = seq.map((it) => (it.p ? card(it.p) : textCard(it.t))).join("");
    const runW = seq.length * (cw + 16);
    const reps = Math.max(1, Math.ceil((W * 1.4) / runW));
    const run = one.repeat(reps);
    const track = document.createElement("div");
    track.className = `track${r % 2 ? " rev" : ""}`;
    track.style.setProperty("--dur", `${((runW * reps) / (r === 1 ? 24 : 32)).toFixed(0)}s`);
    track.innerHTML = run + run;
    for (const t of track.querySelectorAll(".t")) t.style.cssText = `width:${cw}px;height:${Math.round(cw * 0.5625)}px`;
    wrap.append(track);
  }
  stage.append(wrap);
}

// ——— 2, pick · Salon hang ———

function salon(mode) {
  const H = stage.clientHeight;
  const g = 14;
  const rh = Math.floor((H - 80 - g * 3) / 4);
  const cw = Math.round(rh * 0.95);
  const sizeFor = (p, i) => {
    if (p.kind === "Featured") return i % 2 ? "s-l" : "s-xl";
    if (p.kind === "Teaching") return i % 3 === 1 ? "s-t" : "s-w";
    return i % 2 ? "s-w" : "s-s";
  };
  const seq = sequence(mode.mixed);
  let k = 0;
  const html = seq.map((it, i) => {
    if (it.p) return card(it.p, sizeFor(it.p, k++));
    return textCard(it.t, it.t.kind === "num" ? "s-w" : "s-l");
  }).join("");

  const wrap = document.createElement("div");
  wrap.className = "salon";
  wrap.style.cssText = `--rh:${rh}px;--cw:${cw}px;--g:${g}px`;
  const run = document.createElement("div");
  run.className = "run";
  run.innerHTML = `<div class="grid">${html}</div><div class="grid" aria-hidden="true">${html}</div>`;
  wrap.append(run);
  stage.append(wrap);
  const gridW = run.firstElementChild.getBoundingClientRect().width;
  run.style.setProperty("--dur", `${(gridW / 18).toFixed(0)}s`);
}

// ——— 5 · Shoal ———

function shoal() {
  const W = stage.clientWidth;
  const H = stage.clientHeight;
  const size = { Featured: 230, Teaching: 176, Experiment: 132 };
  const fish = projects.map((p, i) => {
    const w = Math.round(size[p.kind] * (W < 700 ? 0.7 : 1));
    const h = Math.round(w * 0.5625);
    return {
      w, h,
      x: Math.random() * (W + w) - w,
      y: 30 + Math.random() * (H - h - 60),
      vx: 10 + Math.random() * 16 + (230 - size[p.kind]) * 0.06,
      phase: Math.random() * Math.PI * 2,
      amp: 8 + Math.random() * 14,
      ox: 0, oy: 0,
      html: card(p),
      z: size[p.kind],
    };
  });
  const wrap = document.createElement("div");
  wrap.className = "shoal";
  wrap.innerHTML = fish.map((f) => f.html).join("");
  stage.append(wrap);
  const els = [...wrap.children];
  els.forEach((el, i) => {
    el.style.width = `${fish[i].w}px`;
    el.querySelector(".c-img").style.height = `${fish[i].h}px`;
    el.style.zIndex = fish[i].z;
  });

  const ptr = { x: -9999, y: -9999 };
  const onMove = (e) => {
    const r = stage.getBoundingClientRect();
    ptr.x = e.clientX - r.left;
    ptr.y = e.clientY - r.top;
  };
  const onLeave = () => { ptr.x = ptr.y = -9999; };
  stage.addEventListener("pointermove", onMove);
  stage.addEventListener("pointerleave", onLeave);

  let raf;
  let last = performance.now();
  const tick = (now) => {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    const t = now / 1000;
    fish.forEach((f, i) => {
      f.x += f.vx * dt;
      if (f.x > W + 20) f.x = -f.w - 20;
      const by = f.y + Math.sin(t * 0.5 + f.phase) * f.amp;
      // Shy away from the cursor: a push that eases in and out.
      const cx = f.x + f.w / 2 + f.ox;
      const cy = by + f.h / 2 + f.oy;
      const dx = cx - ptr.x;
      const dy = cy - ptr.y;
      const d = Math.hypot(dx, dy) || 1;
      const reach = 170 + f.w * 0.4;
      const push = d < reach ? (1 - d / reach) * 90 : 0;
      f.ox += ((dx / d) * push - f.ox) * Math.min(1, dt * 5);
      f.oy += ((dy / d) * push - f.oy) * Math.min(1, dt * 5);
      const tilt = Math.cos(t * 0.5 + f.phase) * f.amp * 0.08;
      els[i].style.transform = `translate(${(f.x + f.ox).toFixed(1)}px, ${(by + f.oy).toFixed(1)}px) rotate(${tilt.toFixed(2)}deg)`;
    });
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
  return () => {
    cancelAnimationFrame(raf);
    stage.removeEventListener("pointermove", onMove);
    stage.removeEventListener("pointerleave", onLeave);
  };
}

// ——— 6 · Field ———

function field() {
  const W = stage.clientWidth;
  const H = stage.clientHeight;
  const small = W < 700;
  const size = { Featured: small ? 104 : 150, Teaching: small ? 84 : 116, Experiment: small ? 70 : 96 };
  const nodes = projects.map((p, i) => {
    const a = (i / projects.length) * Math.PI * 2;
    return { p, w: size[p.kind], h: Math.round(size[p.kind] * 0.5625), x: W / 2 + Math.cos(a) * W * 0.3, y: H / 2 + Math.sin(a) * H * 0.3, vx: 0, vy: 0 };
  });
  const edges = [];
  for (let i = 0; i < nodes.length; i++) {
    for (let j = i + 1; j < nodes.length; j++) {
      const shared = nodes[i].p.topics.filter((t) => nodes[j].p.topics.includes(t)).length;
      if (shared) edges.push({ a: i, b: j, s: shared });
    }
  }

  // A plain force layout, run to rest before anything is drawn.
  const ideal = Math.min(W, H) * 0.32;
  for (let step = 0; step < 600; step++) {
    const cool = 1 - step / 600;
    for (const n of nodes) { n.fx = (W / 2 - n.x) * 0.012; n.fy = (H / 2 - n.y) * 0.02; }
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const A = nodes[i], B = nodes[j];
        let dx = A.x - B.x, dy = A.y - B.y;
        const d2 = Math.max(400, dx * dx + dy * dy);
        const f = 42000 / d2;
        const d = Math.sqrt(d2);
        dx /= d; dy /= d;
        A.fx += dx * f; A.fy += dy * f; B.fx -= dx * f; B.fy -= dy * f;
      }
    }
    for (const e of edges) {
      const A = nodes[e.a], B = nodes[e.b];
      const dx = B.x - A.x, dy = B.y - A.y;
      const d = Math.hypot(dx, dy) || 1;
      const f = (d - ideal / e.s) * 0.006 * e.s;
      A.fx += (dx / d) * f; A.fy += (dy / d) * f; B.fx -= (dx / d) * f; B.fy -= (dy / d) * f;
    }
    for (const n of nodes) {
      n.x += Math.max(-20, Math.min(20, n.fx)) * cool;
      n.y += Math.max(-20, Math.min(20, n.fy)) * cool;
      n.x = Math.max(n.w / 2 + 12, Math.min(W - n.w / 2 - 12, n.x));
      n.y = Math.max(n.h / 2 + 12, Math.min(H - n.h / 2 - 24, n.y));
    }
  }

  const wrap = document.createElement("div");
  wrap.className = "field";
  const lines = edges.map((e) => {
    const A = nodes[e.a], B = nodes[e.b];
    return `<line x1="${A.x.toFixed(1)}" y1="${A.y.toFixed(1)}" x2="${B.x.toFixed(1)}" y2="${B.y.toFixed(1)}" data-a="${e.a}" data-b="${e.b}" stroke-opacity="${(0.25 + e.s * 0.25).toFixed(2)}"/>`;
  }).join("");

  // Topic names float at the middle of the projects that share them.
  const topics = new Map();
  for (const n of nodes) for (const t of n.p.topics) (topics.get(t) || topics.set(t, []).get(t)).push(n);
  const labels = [...topics].filter(([, ns]) => ns.length >= 4).map(([t, ns]) => {
    const x = ns.reduce((s, n) => s + n.x, 0) / ns.length;
    const y = ns.reduce((s, n) => s + n.y, 0) / ns.length;
    return `<span class="topic" style="left:${x.toFixed(0)}px;top:${y.toFixed(0)}px">${escapeHtml(t)}</span>`;
  }).join("");

  wrap.innerHTML = `<svg aria-hidden="true">${lines}</svg>${labels}${nodes.map((n) => card(n.p)).join("")}`;
  stage.append(wrap);
  const cards = [...wrap.querySelectorAll(".c")];
  cards.forEach((el, i) => {
    const n = nodes[i];
    el.style.width = `${n.w}px`;
    el.querySelector(".c-img").style.height = `${n.h}px`;
    el.style.transform = `translate(${(n.x - n.w / 2).toFixed(1)}px, ${(n.y - n.h / 2).toFixed(1)}px)`;
    el.addEventListener("pointerenter", () => {
      wrap.classList.add("is-hover");
      el.classList.add("on");
      for (const l of wrap.querySelectorAll("line")) {
        const hit = Number(l.dataset.a) === i || Number(l.dataset.b) === i;
        l.classList.toggle("on", hit);
        if (hit) cards[Number(l.dataset.a) === i ? Number(l.dataset.b) : Number(l.dataset.a)].classList.add("on");
      }
    });
    el.addEventListener("pointerleave", () => {
      wrap.classList.remove("is-hover");
      for (const c of cards) c.classList.remove("on");
      for (const l of wrap.querySelectorAll("line.on")) l.classList.remove("on");
    });
  });
}
