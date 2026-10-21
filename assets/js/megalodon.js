// The megalodon: after a quiet spell, one enormous shark crosses the screen
// beneath the search bar, and the bar rocks in its wake.
//
// The ocean's own sharks steer themselves (and steer around the headline), so the
// megalodon is driven from here instead: it joins world.sharks, so fish flee it and
// the other sharks make room, but after every simulation step its path is set by us.

const SIZE = 2.4;        // body length relative to the largest regular shark
const CROSSING_S = 8;    // seconds from entering to the tail leaving the frame
const SWAY_PX = 26;      // vertical drift of its path around the bar's centre line
const REACH = 1.1;       // how far (in body lengths) the wake reaches the bar

export function startMegalodon(ocean, { target, idleMs = 15000, onPass } = {}) {
  const world = ocean.world;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!world) return;

  let mega = null;   // the live shark while it crosses
  let path = null;   // { dir, x0, x1, y, t }
  let timer = 0;
  let armed = true;  // one crossing per quiet spell; any activity re-arms it

  const step = world.step.bind(world);
  world.step = (dt) => {
    step(dt);
    if (mega) drive(dt);
  };

  function wake() {
    clearTimeout(timer);
    armed = true;
    timer = setTimeout(trigger, idleMs);
  }
  for (const type of ["pointermove", "pointerdown", "keydown", "wheel", "touchstart"]) {
    window.addEventListener(type, wake, { passive: true });
  }

  function trigger() {
    if (!armed || mega || reduce.matches) return;
    // A hidden tab or an ocean that has not seeded yet: try again shortly, still quiet.
    if (document.hidden || !world.sharks.length) {
      timer = setTimeout(trigger, 3000);
      return;
    }
    armed = false;
    spawn();
  }

  function spawn() {
    const template = world.sharks.reduce((a, b) => (b.length > a.length ? b : a));
    const L = template.length * SIZE;
    const nodeCount = template.nodes.length / 2;
    const dir = Math.random() < 0.5 ? 1 : -1;
    const W = world.width;
    const bar = target.getBoundingClientRect();
    const y = bar.top + bar.height / 2;

    // Start with the snout just outside the frame and the body trailing further out.
    const x0 = dir > 0 ? -L * 0.08 : W + L * 0.08;
    const x1 = dir > 0 ? W + L * 1.1 : -L * 1.1;
    const heading = dir > 0 ? 0 : Math.PI;
    const seg = L / (nodeCount - 1);
    const nodes = new Float32Array(nodeCount * 2);
    for (let n = 0; n < nodeCount; n++) {
      nodes[n * 2] = x0 - Math.cos(heading) * seg * n;
      nodes[n * 2 + 1] = y;
    }

    mega = {
      ...template,
      id: 9001,
      kind: "classic",
      length: L,
      nodes,
      heading,
      speed: Math.abs(x1 - x0) / CROSSING_S,
      turn: 0,
      hunger: 1,
      target: null,
      retargetAt: Infinity,
      depth: 1,
    };
    path = { dir, x0, x1, y, t: 0, spine: nodes.slice() };
    world.sharks.push(mega); // last in the list, so it draws over everything
    requestAnimationFrame(rock);
  }

  // Overrides whatever stepSharks decided: a slow, straight, slightly undulating pass.
  function drive(dt) {
    path.t += dt;
    const u = Math.min(1, path.t / CROSSING_S);
    const hx = path.x0 + (path.x1 - path.x0) * u;
    const hy = path.y + Math.sin(path.t * 0.9) * SWAY_PX;
    const nodes = mega.nodes;
    // stepSharks has just bent the spine toward its own steering; undo that first.
    nodes.set(path.spine);
    mega.heading = Math.atan2(hy - nodes[1], hx - nodes[0]) || mega.heading;
    mega.speed = Math.abs(path.x1 - path.x0) / CROSSING_S;
    mega.turn = 0;
    nodes[0] = hx;
    nodes[1] = hy;
    const seg = mega.length / (nodes.length / 2 - 1);
    for (let k = 1; k < nodes.length / 2; k++) {
      const px = nodes[(k - 1) * 2];
      const py = nodes[(k - 1) * 2 + 1];
      const a = Math.atan2(nodes[k * 2 + 1] - py, nodes[k * 2] - px);
      nodes[k * 2] = px + Math.cos(a) * seg;
      nodes[k * 2 + 1] = py + Math.sin(a) * seg;
    }
    path.spine.set(nodes);
    if (u >= 1) finish();
  }

  function finish() {
    const i = world.sharks.indexOf(mega);
    if (i !== -1) world.sharks.splice(i, 1);
    mega = null;
    path = null;
    target.style.transform = "";
    onPass?.();
  }

  // The bar rides the pressure wave: strongest while the body is right beneath it,
  // pushed along the direction of travel, bobbing and tilting as the tail beats past.
  function rock(now) {
    if (!mega) return;
    const bar = target.getBoundingClientRect();
    const cx = bar.left + bar.width / 2;
    const cy = bar.top + bar.height / 2;
    let nearest = Infinity;
    const nodes = mega.nodes;
    for (let k = 0; k < nodes.length; k += 2) {
      nearest = Math.min(nearest, Math.hypot(nodes[k] - cx, (nodes[k + 1] - cy) * 1.6));
    }
    const reach = Math.min(mega.length * 0.5, 520) * REACH;
    const f = Math.max(0, 1 - nearest / reach);
    const e = f * f * (3 - 2 * f); // smoothstep
    const t = now / 1000;
    const x = path.dir * e * 10 + Math.sin(t * 3.1) * e * 3;
    const y = Math.sin(t * 4.3) * e * 7 + e * 4;
    const r = Math.sin(t * 2.7) * e * 1.4;
    target.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${r.toFixed(3)}deg)`;
    requestAnimationFrame(rock);
  }

  wake();

  // For previews: start a crossing right away.
  return { trigger: () => { armed = true; trigger(); } };
}
