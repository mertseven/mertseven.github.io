// The opening: project panels cut past like the pages of a comic, faster and faster,
// then the wall bursts into place from the centre and the search settles in beneath it.
//
// Any click, key, wheel or touch ends it at once. With reduced motion it never runs.
// <html class="is-intro"> is set in <head> so the page stays hidden until the reveal.

const CUTS = 14;           // frames in the comic sequence
const FIRST_MS = 190;      // the first cut lingers…
const DECAY = 0.82;        // …each next one is this much shorter…
const LAST_MS = 45;        // …down to this
const BURST_MS = 760;
const BURST_SPREAD = 420;  // stagger across the burst, centre tiles first
const PRELOAD_MS = 1500;   // wait at most this long for images before starting anyway

// Comic layouts: each is a CSS grid template and how many panels it takes.
const LAYOUTS = [
  { cls: "full", n: 1 },
  { cls: "split2", n: 2 },
  { cls: "split3", n: 3 },
  { cls: "full", n: 1 },
  { cls: "row3", n: 3 },
  { cls: "split2v", n: 2 },
];

const rand = (a, b) => a + Math.random() * (b - a);

export async function playIntro({ images, wall }) {
  const html = document.documentElement;
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || !images.length) {
    html.classList.remove("is-intro");
    return;
  }

  const overlay = document.createElement("div");
  overlay.className = "intro";
  overlay.setAttribute("aria-hidden", "true");
  overlay.innerHTML = `<div class="intro-frame"></div>`;
  document.body.append(overlay);
  const frame = overlay.firstElementChild;

  let done = false;
  const timers = [];
  const later = (fn, ms) => timers.push(setTimeout(fn, ms));
  const skip = () => finish();
  for (const type of ["pointerdown", "keydown", "wheel", "touchstart"]) {
    addEventListener(type, skip, { once: true, passive: true });
  }

  const loaded = await preload(images.slice(0, 18));
  if (done) return;
  if (loaded.length < 4) return finish();

  // The comic: cycle the layouts, fill each panel with the next image.
  const frames = [];
  let k = 0;
  for (let i = 0; i < CUTS; i++) {
    const layout = LAYOUTS[i % LAYOUTS.length];
    const panels = Array.from({ length: layout.n }, () => loaded[k++ % loaded.length]);
    frames.push({ layout, panels, ms: Math.max(LAST_MS, FIRST_MS * DECAY ** i) });
  }

  let t = 0;
  for (const f of frames) {
    later(() => showFrame(f), t);
    t += f.ms;
  }
  later(burst, t);

  function showFrame({ layout, panels, ms }) {
    frame.className = `intro-frame intro-frame--${layout.cls}`;
    frame.style.setProperty("--cut", `${Math.round(ms * 1.6)}ms`);
    frame.innerHTML = panels.map((src) => {
      const x = rand(-3, 3).toFixed(1);
      const y = rand(-3, 3).toFixed(1);
      return `<div class="intro-panel" style="--px:${x}%;--py:${y}%"><img src="${src}" alt=""></div>`;
    }).join("");
  }

  function burst() {
    if (done) return;
    overlay.classList.add("is-leaving");
    html.classList.remove("is-intro");
    html.classList.add("is-revealing");

    const cx = innerWidth / 2;
    const cy = innerHeight / 2;
    const tiles = wall.visibleTiles();
    const far = Math.hypot(cx, cy);
    for (const el of tiles) {
      const r = el.getBoundingClientRect();
      const dx = cx - (r.left + r.width / 2);
      const dy = cy - (r.top + r.height / 2);
      const d = Math.hypot(dx, dy) / far;
      el.animate(
        [
          { transform: `translate(${dx}px, ${dy}px) scale(0.25) rotate(${rand(-14, 14)}deg)`, filter: "blur(14px)", opacity: 0 },
          { opacity: 1, offset: 0.35 },
          { transform: "none", filter: "blur(0)", opacity: 1 },
        ],
        { duration: BURST_MS, delay: d * BURST_SPREAD, easing: "cubic-bezier(0.16, 0.84, 0.24, 1)", fill: "backwards" },
      );
    }
    later(() => finish(), BURST_MS + BURST_SPREAD + 80);
  }

  function finish() {
    if (done) return;
    done = true;
    timers.forEach(clearTimeout);
    for (const type of ["pointerdown", "keydown", "wheel", "touchstart"]) removeEventListener(type, skip);
    for (const el of wall.el.querySelectorAll(".tile")) el.getAnimations().forEach((a) => a.finish());
    html.classList.remove("is-intro");
    html.classList.add("is-revealing");
    overlay.classList.add("is-leaving");
    setTimeout(() => {
      overlay.remove();
      html.classList.remove("is-revealing");
    }, 900);
  }
}

// Resolves with the sources that loaded within PRELOAD_MS, in their original order.
function preload(srcs) {
  const results = srcs.map((src) => new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(src);
    img.onerror = () => resolve(null);
    img.src = src;
  }));
  const timeout = new Promise((resolve) => setTimeout(resolve, PRELOAD_MS));
  const got = [];
  results.forEach((p, i) => p.then((src) => { if (src) got[i] = src; }));
  return Promise.race([Promise.all(results), timeout]).then(() => got.filter(Boolean));
}
