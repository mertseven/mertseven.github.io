import { escapeHtml } from "./catalog.js";

const KIND_LABEL = { Featured: "Featured", Teaching: "Teaching", Experiment: "Experiment" };

// The project card, opened from the wall as in Burst: the clicked tile lifts out of the
// wall and flies to a large frame on the left while the wall dims behind it, and the
// project's label sets in on the right — collection, title, summary, topics, stack and a
// way in. ← → walk through the projects, Enter opens the one on show, Esc or a click
// outside sends the frame back to its slot on the wall.

const FLY_MS = 620;
const EASE = "cubic-bezier(0.2, 0.8, 0.2, 1)";

export function mountFocus(projects, wall) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const root = document.createElement("div");
  root.className = "focus";
  root.hidden = true;
  root.setAttribute("role", "dialog");
  root.setAttribute("aria-modal", "true");
  root.setAttribute("aria-labelledby", "focus-title");
  root.innerHTML = `
    <div class="focus-backdrop" data-close></div>
    <figure class="focus-media"></figure>
    <div class="focus-info">
      <span class="focus-rule" aria-hidden="true"></span>
      <p class="focus-kind label"></p>
      <h2 class="focus-title" id="focus-title"></h2>
      <p class="focus-summary"></p>
      <dl class="focus-meta"></dl>
      <a class="focus-open" href="#">Open project <span aria-hidden="true">↗</span></a>
      <div class="focus-nav">
        <button type="button" class="focus-step" data-step="-1" aria-label="Previous project">←</button>
        <span class="focus-count mono"></span>
        <button type="button" class="focus-step" data-step="1" aria-label="Next project">→</button>
      </div>
    </div>
    <button type="button" class="focus-close icon-btn" data-close aria-label="Close">
      <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 2l10 10M12 2L2 12" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"/></svg>
    </button>`;
  document.body.append(root);

  const media = root.querySelector(".focus-media");
  const info = root.querySelector(".focus-info");
  const $ = (sel) => root.querySelector(sel);
  let at = -1;
  let returnFocus = null;
  let busy = false;

  function fill(i) {
    const p = projects[i];
    media.innerHTML = p.image
      ? `<img src="${escapeHtml(p.image)}" alt="${escapeHtml(p.title)}">`
      : `<span class="focus-type">${escapeHtml(p.title)}</span>`;
    $(".focus-kind").textContent = KIND_LABEL[p.kind];
    $(".focus-title").textContent = p.title;
    $(".focus-summary").textContent = p.summary;
    $(".focus-meta").innerHTML = `
      <dt>Topics</dt><dd>${p.topics.map(escapeHtml).join(", ")}</dd>
      <dt>Stack</dt><dd>${p.stack.map(escapeHtml).join(", ")}</dd>`;
    $(".focus-open").href = p.url;
    $(".focus-count").textContent = `${String(i + 1).padStart(2, "0")} / ${String(projects.length).padStart(2, "0")}`;
  }

  // FLIP: the frame starts exactly over the tile's on-screen box and eases into place.
  function flyFrom(rect) {
    const to = media.getBoundingClientRect();
    if (!rect || reduce.matches) return null;
    const sx = rect.width / to.width;
    const sy = rect.height / to.height;
    const dx = rect.left - to.left;
    const dy = rect.top - to.top;
    return media.animate(
      [
        { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})` },
        { transform: "none" },
      ],
      { duration: FLY_MS, easing: EASE },
    );
  }

  function open(i, tile) {
    if (busy) return;
    at = i;
    returnFocus = document.activeElement;
    fill(i);
    const from = tile?.getBoundingClientRect();
    tile?.classList.add("is-lifted");
    wall.hold(true);
    root.hidden = false;
    document.documentElement.classList.add("has-focus");
    root.getBoundingClientRect(); // lay out before measuring the target frame
    root.classList.add("is-open");
    flyFrom(from);
    $(".focus-open").focus({ preventScroll: true });
  }

  function close() {
    if (root.hidden || busy) return;
    busy = true;
    const tile = wall.tileFor(at);
    const to = tile?.getBoundingClientRect();
    root.classList.remove("is-open");
    const done = () => {
      root.hidden = true;
      busy = false;
      media.getAnimations().forEach((a) => a.cancel());
      document.querySelectorAll(".tile.is-lifted").forEach((t) => t.classList.remove("is-lifted"));
      document.documentElement.classList.remove("has-focus");
      wall.hold(false);
      returnFocus?.focus?.({ preventScroll: true });
    };
    if (!to || reduce.matches) {
      setTimeout(done, 200);
      return;
    }
    // The way back: the frame shrinks onto the tile it came from.
    const from = media.getBoundingClientRect();
    const sx = to.width / from.width;
    const sy = to.height / from.height;
    media.animate(
      [
        { transform: "none" },
        { transform: `translate(${to.left - from.left}px, ${to.top - from.top}px) scale(${sx}, ${sy})` },
      ],
      { duration: FLY_MS * 0.8, easing: EASE, fill: "forwards" },
    ).finished.then(done, done);
  }

  // Next / previous: the label slides, the frame crossfades.
  function step(d) {
    if (root.hidden || busy) return;
    const next = (at + d + projects.length) % projects.length;
    document.querySelectorAll(".tile.is-lifted").forEach((t) => t.classList.remove("is-lifted"));
    at = next;
    const swap = () => fill(next);
    if (reduce.matches) return swap();
    info.animate([{ opacity: 1, transform: "none" }, { opacity: 0, transform: `translateX(${-12 * d}px)` }], { duration: 160, easing: "ease-in" })
      .finished.then(() => {
        swap();
        info.animate([{ opacity: 0, transform: `translateX(${12 * d}px)` }, { opacity: 1, transform: "none" }], { duration: 260, easing: EASE });
      });
    media.animate([{ opacity: 1 }, { opacity: 0.2 }, { opacity: 1 }], { duration: 420, easing: "ease-in-out" });
  }

  root.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]")) close();
    const s = e.target.closest("[data-step]");
    if (s) step(Number(s.dataset.step));
  });

  document.addEventListener("keydown", (e) => {
    if (root.hidden) return;
    if (e.key === "Escape") { e.preventDefault(); close(); }
    else if (e.key === "ArrowRight") { e.preventDefault(); step(1); }
    else if (e.key === "ArrowLeft") { e.preventDefault(); step(-1); }
    else if (e.key === "Enter" && !e.target.closest("a, button")) location.href = projects[at].url;
    else if (e.key === "Tab") {
      // Keep the keyboard inside the card while it is open.
      const stops = [...root.querySelectorAll("a, button")];
      const i = stops.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); stops.at(-1).focus(); }
      else if (!e.shiftKey && i === stops.length - 1) { e.preventDefault(); stops[0].focus(); }
    }
  });

  return { open, close };
}
