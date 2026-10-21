// The megalodon: after a quiet spell, an enormous shark glides far beneath the
// surface, passes under the search bar, and the bar lifts on its swell.
//
// It joins world.sharks so the renderer draws it with the same skin and body wave as
// the others, and fish scatter from it. The ocean's own steering would keep it away
// from the headline, so after every simulation step its swimming is set here instead,
// with the same kind of rules the regular sharks follow: a turn-rate limit, a slow
// wander, and a spine that bends into a C at most.

const SIZE = 2.2;         // body length relative to the largest regular shark
const DEPTH = 0.32;       // below 0.6 the renderer draws it translucent: a shadow under the paper
const CROSSING_S = 20;    // roughly how long a full pass takes
const MAX_TURN = 0.22;    // rad/s; huge bodies turn slowly
const MAX_BEND = 0.12;    // per joint; a little stiffer than the regular sharks (0.16)
const LIFT_PX = 7;        // how far the swell lifts the search bar at its peak

const TAU = Math.PI * 2;
const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const angleDiff = (from, to) => ((((to - from) % TAU) + TAU * 1.5) % TAU) - Math.PI;

export function startMegalodon(ocean, { target, idleMs = 15000 } = {}) {
  const world = ocean.world;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!world) return;

  let mega = null;   // the live shark while it crosses
  let swim = null;   // its route and our copy of its spine
  let timer = 0;
  let armed = true;  // one pass per quiet spell; any activity re-arms it

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
    const W = world.width;
    const H = world.height;
    const bar = target.getBoundingClientRect();
    const barY = bar.top + bar.height / 2;
    const dir = Math.random() < 0.5 ? 1 : -1;

    // Route: in from one side a little above or below the bar, under the bar, and out
    // the other side at a different depth, so the path is a long, lazy S.
    const entry = { x: dir > 0 ? -L * 0.15 : W + L * 0.15, y: barY + rand(-0.16, 0.16) * H };
    const under = { x: W / 2 + rand(-0.08, 0.08) * W, y: barY + rand(0.01, 0.05) * H };
    const exit = { x: dir > 0 ? W + L * 1.3 : -L * 1.3, y: barY + rand(-0.22, 0.22) * H };

    const heading = Math.atan2(under.y - entry.y, under.x - entry.x);
    const seg = L / (nodeCount - 1);
    const nodes = new Float32Array(nodeCount * 2);
    for (let n = 0; n < nodeCount; n++) {
      nodes[n * 2] = entry.x - Math.cos(heading) * seg * n;
      nodes[n * 2 + 1] = entry.y - Math.sin(heading) * seg * n;
    }

    mega = {
      ...template,
      id: 9001,
      kind: "classic",
      length: L,
      nodes,
      heading,
      speed: (W + L * 2.4) / CROSSING_S,
      phase: rand(0, TAU),
      turn: 0,
      hunger: 0, // it does not feed on the surface schools
      wander: 0,
      target: null,
      retargetAt: Infinity,
      depth: DEPTH,
    };
    swim = { dir, waypoints: [under, exit], spine: nodes.slice(), t: 0, lift: 0 };
    world.sharks.unshift(mega); // first in the list: everything else draws over it
    requestAnimationFrame(swell);
  }

  function drive(dt) {
    const sh = mega;
    const nodes = sh.nodes;
    // stepSharks has just steered and moved it by its own rules; undo that.
    nodes.set(swim.spine);
    swim.t += dt;

    let wp = swim.waypoints[0];
    // Once the snout is past the bar, head for the exit.
    if (swim.waypoints.length > 1 && (nodes[0] - wp.x) * swim.dir > 0) {
      swim.waypoints.shift();
      wp = swim.waypoints[0];
    }

    sh.wander = clamp(sh.wander + (Math.random() - 0.5) * dt * 1.2, -0.35, 0.35);
    const desired = Math.atan2(wp.y - nodes[1], wp.x - nodes[0]) + sh.wander * 0.4;
    const turned = clamp(angleDiff(sh.heading, desired), -MAX_TURN * dt, MAX_TURN * dt);
    sh.heading += turned;
    // Smoothed angular velocity: the renderer banks the fins into the turn.
    sh.turn += (turned / dt - sh.turn) * Math.min(1, dt * 3);
    sh.phase += dt * (1.2 + sh.speed / 40);

    nodes[0] += Math.cos(sh.heading) * sh.speed * dt;
    nodes[1] += Math.sin(sh.heading) * sh.speed * dt;

    // Follow-the-leader spine with a bend limit, as the ocean does for its own sharks.
    const seg = sh.length / (nodes.length / 2 - 1);
    let prev = sh.heading + Math.PI;
    for (let k = 1; k < nodes.length / 2; k++) {
      const px = nodes[(k - 1) * 2];
      const py = nodes[(k - 1) * 2 + 1];
      let a = Math.atan2(nodes[k * 2 + 1] - py, nodes[k * 2] - px);
      a = prev + clamp(angleDiff(prev, a), -MAX_BEND, MAX_BEND);
      nodes[k * 2] = px + Math.cos(a) * seg;
      nodes[k * 2 + 1] = py + Math.sin(a) * seg;
      prev = a;
    }
    swim.spine.set(nodes);

    if (offscreen(nodes) || swim.t > CROSSING_S * 3) finish();
  }

  // Done once the whole body has left the frame on the exit side.
  function offscreen(nodes) {
    if (swim.waypoints.length > 1) return false;
    const W = world.width;
    for (let k = 0; k < nodes.length; k += 2) {
      const x = nodes[k];
      if (swim.dir > 0 ? x < W + 20 : x > -20) return false;
    }
    return true;
  }

  function finish() {
    const i = world.sharks.indexOf(mega);
    if (i !== -1) world.sharks.splice(i, 1);
    mega = null;
    swim = null;
    target.style.transform = "";
  }

  // Not a shove but a swell: the bar rises slowly as the body passes beneath it,
  // drifts a touch with the current and settles again once it has gone.
  function swell(now) {
    if (!mega) return;
    const bar = target.getBoundingClientRect();
    const cx = bar.left + bar.width / 2;
    const cy = bar.top + bar.height / 2;
    const nodes = mega.nodes;
    let nearest = Infinity;
    for (let k = 0; k < nodes.length; k += 2) {
      nearest = Math.min(nearest, Math.hypot(nodes[k] - cx, (nodes[k + 1] - cy) * 1.4));
    }
    const reach = Math.max(bar.width * 0.9, mega.length * 0.45);
    const f = Math.max(0, 1 - nearest / reach);
    const goal = f * f * (3 - 2 * f);
    swim.lift += (goal - swim.lift) * 0.04; // eased, so it rises and falls slowly
    const e = swim.lift;
    const t = now / 1000;
    const y = -e * LIFT_PX + Math.sin(t * 1.3) * e * 2.5;
    const x = swim.dir * e * 4 + Math.sin(t * 0.9) * e * 2;
    const r = Math.sin(t * 1.1) * e * 0.6;
    target.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px) rotate(${r.toFixed(3)}deg)`;
    requestAnimationFrame(swell);
  }

  wake();

  // For previews: start a pass right away.
  return { trigger: () => { armed = true; trigger(); } };
}
