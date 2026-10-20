// 04 · Ghost Chase — Perili İskele. İskelenin ucundaki platformda oynanır (ada3b/ghost.js'in kabuğa uyarlanmış hali).
// Girdi: fare / parmak · Kural: sample(t − gecikme) · Durum: iz (trail) · Çıktı: hayaletler, yıldızlar, ayak izleri
window.OYUNLAR = window.OYUNLAR || {};
window.OYUNLAR['04'] = {
  key: '04', title: 'Ghost Chase', premise: 'Temporality', premiseText: 'Interaction happens in time.', promise: 'Design time as much as space.',
  source: 'Pac-Man (1980) and every replay ghost since',
  caption: 'Your past walks in your footprints.', hint: 'mouse / finger move · C code · Shift+N notes · N night/day · B island',
  anat: ['pointermove', 'sample(t − 3s)', 'trail[ ]', 'ghosts'], hot: 2,
  hud: [['TIME', 'time'], ['STARS', 'stars', 'gold'], ['GHOSTS', 'ghosts', 'ghosts'], ['BEST', 'best']],
  design: { ghostDelay: 3, ghostEvery: 10, maxGhosts: 5, grace: 1, inputLag: 0, showPath: true },
  knobs: [
    { key: 'ghostDelay', step: 1, min: 1, max: 10, note: 's · next run' }, { key: 'ghostEvery', step: 1, min: 2, max: 30, note: 's · next run' },
    { key: 'maxGhosts', step: 1, min: 1, max: 9, note: 'next run' }, { key: 'grace', step: 0.5, min: 0, max: 3, note: 's · live' },
    { key: 'inputLag', step: 50, min: 0, max: 1000, note: 'ms · live' }, { key: 'showPath', type: 'bool', note: 'live' }],
  code: ['<span class="c">// 4) RULE: look back in time</span>', '<span class="k">function</span> sample(t) {', '  <span class="k">for</span> (let i = trail.length - 1; i >= 0; i--)', '    <span class="k">if</span> (trail[i].t &lt;= t) <span class="k">return</span> trail[i];', '}'],
  tasks: ['Open CODE. Set inputLag to 100, then 250. When does the game stop feeling like yours?', 'Make a ghost that shows the <em>future</em>: where will you be in 1 second?', 'Space = slow time for 2 seconds. How many times may the player use it?'],
  question: 'What should happen in the three seconds after a click?',
  overlay: { title: 'Ghost Chase', text: '', cta: 'CLICK TO START' },
  view: { at: [0, 0.43, -1.6], zoom: 2.6, pitch: 1.25 },

  make(ctx) {
    const { THREE, D, group } = ctx;
    const AR = { x: 0, y: 0.43, z: -1.6, w: 4.0, d: 2.6 };          // iskele sahası (yerel)
    const now = () => ctx.now();
    let state = 'ready', startTime = 0, score = 0, nextGhostAt = 0, best = ctx.store.get('ada-ghost-best', 0), demoOn = false;
    const inputs = [], trail = []; let ghosts = [];
    const pointer = { x: 0, z: 0, seen: false }, player = { x: 0, z: 0 };
    let lastPrint = null, printSide = 1;
    const mesh = (geo, m, x, y, z) => ctx.mesh(geo, m, x, y, z);

    // Oyuncu: kırmızı atkı = şimdi
    const playerMesh = new THREE.Group();
    playerMesh.add(mesh(new THREE.CylinderGeometry(0.12, 0.15, 0.36, 8), ctx.toon('paper'), 0, 0.18, 0));
    playerMesh.add(mesh(new THREE.CylinderGeometry(0.16, 0.16, 0.07, 8), ctx.flat('hot'), 0, 0.38, 0));
    playerMesh.add(mesh(new THREE.SphereGeometry(0.13, 10, 8), ctx.toon('paper'), 0, 0.52, 0));
    group.add(playerMesh);
    const cursor = mesh(new THREE.TorusGeometry(0.16, 0.03, 6, 20), ctx.flat('hot')); cursor.rotation.x = Math.PI / 2; cursor.visible = false; group.add(cursor);

    // Yıldız: düz sıcak sarı (desen dışı) → hem zeminden hem karakterlerden ayrışır
    const shape = new THREE.Shape();
    for (let i = 0; i <= 10; i++) { const r = i % 2 ? 0.45 : 1, a = -Math.PI / 2 + i * Math.PI / 5; i ? shape.lineTo(Math.cos(a) * r, Math.sin(a) * r) : shape.moveTo(Math.cos(a) * r, Math.sin(a) * r); }
    const starGeo = new THREE.ExtrudeGeometry(shape, { depth: 0.3, bevelEnabled: false }); starGeo.center();
    const GOLD = [ctx.flat('warm'), ctx.flat('wood')];
    const STAR_SIZE = 0.24;
    const makeStar = () => { const m = new THREE.Mesh(starGeo, GOLD); m.visible = false; group.add(m); return m; };
    const star = makeStar(), starOut = makeStar();
    const starShadow = new THREE.Mesh(new THREE.CircleGeometry(0.2, 16), ctx.flat('ink', { transparent: true, opacity: 0.5 })); starShadow.rotation.x = -Math.PI / 2; starShadow.visible = false; starShadow.userData.noOutline = true; group.add(starShadow);
    const glintGeo = new THREE.OctahedronGeometry(0.05, 0);
    const glints = Array.from({ length: 3 }, () => { const m = new THREE.Mesh(glintGeo, GOLD[0]); m.visible = false; group.add(m); return m; });
    const sparks = Array.from({ length: 10 }, () => { const m = new THREE.Mesh(glintGeo, GOLD[0]); m.visible = false; group.add(m); return { m, vx: 0, vy: 0, vz: 0 }; });
    const anim = { star: 'hidden', starT: 0, outT: -9, out: new THREE.Vector3(), base: new THREE.Vector3(), caughtAt: -9, caughtBy: null };
    const vel = { x: 0, z: 0 }, last = { x: 0, z: 0 }; let walk = 0;

    // Ayak izleri
    const PRINTS = 160, printGeo = new THREE.CircleGeometry(0.085, 10), printMat = ctx.flat('ink');
    const prints = Array.from({ length: PRINTS }, () => { const m = new THREE.Mesh(printGeo, printMat); m.rotation.x = -Math.PI / 2; m.scale.set(0.75, 1.3, 1); m.visible = false; m.userData.noOutline = true; group.add(m); return { m, t: 0 }; });
    let printIdx = 0;

    // Hayalet: gündüz kâğıt (desenli), gece düz parlak
    function makeGhost(night) {
      const g = new THREE.Group(), body = night ? ctx.flat('paper') : ctx.toon('paper');
      g.add(mesh(new THREE.SphereGeometry(0.3, 14, 10, 0, Math.PI * 2, 0, Math.PI / 2), body, 0, 0.32, 0));
      g.add(mesh(new THREE.CylinderGeometry(0.3, 0.33, 0.32, 14, 1, true), body, 0, 0.16, 0));
      for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; g.add(mesh(new THREE.ConeGeometry(0.08, 0.14, 5), body, Math.cos(a) * 0.27, -0.06, Math.sin(a) * 0.27)); }
      [-0.1, 0.1].forEach((x) => g.add(mesh(new THREE.BoxGeometry(0.07, 0.12, 0.03), ctx.flat('ink'), x, 0.38, 0.29)));
      g.scale.setScalar(1.1); group.add(g); ctx.patch(g); return g;
    }
    [makeGhost(false), makeGhost(true)].forEach((w) => { w.position.set(0, -60, 0); w.scale.setScalar(0.01); }); // gölgelendiriciler önceden derlensin

    const clamp = (x, z) => [Math.max(AR.x - AR.w / 2 + 0.3, Math.min(AR.x + AR.w / 2 - 0.3, x)), Math.max(AR.z - AR.d / 2 + 0.3, Math.min(AR.z + AR.d / 2 - 0.3, z))];
    const rootQ = new THREE.Quaternion(), camQ = new THREE.Quaternion();

    function play() {
      state = 'playing'; ctx.playing(true);
      startTime = now(); score = 0; trail.length = 0; inputs.length = 0; lastPrint = null;
      prints.forEach((p) => { p.m.visible = false; });
      ghosts.forEach((g) => group.remove(g.mesh));
      ghosts = [{ delay: D.ghostDelay, appearedAt: null, visible: false, mesh: makeGhost(ctx.night()) }];
      anim.outT = -9; anim.caughtAt = -9; anim.caughtBy = null; star.visible = false;
      nextGhostAt = startTime + D.ghostEvery; placeStar();
    }
    function gameOver(g) {
      state = 'over'; anim.caughtAt = now(); anim.caughtBy = g;
      best = Math.max(best, score); ctx.store.set('ada-ghost-best', best);
      ctx.overlay({ title: 'Caught by your past', text: 'You were caught by where you were ' + g.delay + ' seconds ago. Stars ' + score + ' · ' + (now() - startTime).toFixed(1) + ' s · best ' + best + '.', cta: 'CLICK TO PLAY AGAIN' });
    }
    function placeStar() { anim.base.set(AR.x + (Math.random() - 0.5) * (AR.w - 1), AR.y + 0.5, AR.z + (Math.random() - 0.5) * (AR.d - 1)); anim.star = 'wait'; anim.starT = now() + (anim.outT > 0 ? 0.35 : 0); }
    function collectStar(t) {
      score++; anim.out.copy(star.position); anim.outT = t;
      sparks.forEach((s, i) => { const a = i / sparks.length * Math.PI * 2 + Math.random() * 0.3, sp = 1.4 + Math.random() * 0.8; s.vx = Math.cos(a) * sp; s.vz = Math.sin(a) * sp; s.vy = 2.2 + Math.random() * 1.2; s.m.position.copy(star.position); s.m.visible = true; });
      ctx.bump('stars'); placeStar();
    }
    const sample = (t) => { for (let i = trail.length - 1; i >= 0; i--) if (trail[i].t <= t) return trail[i]; return null; };

    function update(t) {
      const due = t - D.inputLag / 1000;
      while (inputs.length && inputs[0].t <= due) { const i = inputs.shift(); [player.x, player.z] = clamp(i.x, i.z); }
      if (state !== 'playing') return;
      trail.push({ t, x: player.x, z: player.z });
      const oldest = t - D.ghostDelay * D.maxGhosts - 1; while (trail.length && trail[0].t < oldest) trail.shift();
      if (!lastPrint || Math.hypot(player.x - lastPrint.x, player.z - lastPrint.z) > 0.24) {
        const dir = lastPrint ? Math.atan2(player.x - lastPrint.x, player.z - lastPrint.z) : 0; printSide *= -1;
        const p = prints[printIdx]; printIdx = (printIdx + 1) % PRINTS;
        p.m.position.set(player.x + Math.cos(dir) * 0.09 * printSide, AR.y + 0.01, player.z - Math.sin(dir) * 0.09 * printSide); p.m.rotation.z = dir; p.t = t; p.m.visible = D.showPath;
        lastPrint = { x: player.x, z: player.z };
      }
      if (t >= nextGhostAt && ghosts.length < D.maxGhosts) { ghosts.push({ delay: D.ghostDelay * (ghosts.length + 1), appearedAt: null, visible: false, mesh: makeGhost(ctx.night()) }); nextGhostAt += D.ghostEvery; ctx.flash(2); }
      for (const g of ghosts) {
        const past = sample(t - g.delay); g.visible = !!past; if (!past) continue;
        if (g.appearedAt === null) g.appearedAt = t;
        g.mesh.position.set(past.x, AR.y + 0.25 + Math.sin(t * 3 + g.delay) * 0.04, past.z);
        if (t - g.appearedAt >= D.grace && Math.hypot(player.x - past.x, player.z - past.z) < 0.45) { gameOver(g); return; }
      }
      if (anim.star === 'idle' && Math.hypot(player.x - anim.base.x, player.z - anim.base.z) < 0.42) collectStar(t);
    }

    // Lasseter: squash & stretch (hacim korunur), slow in/out, arcs, anticipation, follow-through
    const springy = (u, amp, k = 8, w = 20) => 1 - amp * Math.exp(-u * k) * Math.cos(u * w);
    const squash = (m, sy, s = 1) => { const sx = 1 / Math.sqrt(Math.max(sy, 0.05)); m.scale.set(s * sx, s * sy, s * sx); };
    const spinQ = new THREE.Quaternion(), eul = new THREE.Euler(), axis = new THREE.Vector3();
    function animateStar(t, dt) {
      const playing = state === 'playing';
      if (anim.star === 'wait' && t >= anim.starT) { anim.star = 'pop'; anim.starT = t; }
      star.visible = playing && (anim.star === 'pop' || anim.star === 'idle'); starShadow.visible = star.visible;
      if (star.visible) {
        const u = t - anim.starT; let lift = 0, sy = 1, s = STAR_SIZE;
        if (anim.star === 'pop') { if (u < 0.22) { const k = u / 0.22; lift = 0.9 * (1 - k * k); sy = 1.35; s *= 0.4 + 0.6 * k; } else sy = springy(u - 0.22, 0.4); if (u > 0.9) anim.star = 'idle'; }
        else { lift = 0.08 * Math.sin(t * 2.4); sy = 1 + 0.05 * Math.cos(t * 2.4); }
        const dx = player.x - anim.base.x, dz = player.z - anim.base.z, dist = Math.hypot(dx, dz) || 1, near = Math.max(0, 1 - dist / 1.3);
        star.position.set(anim.base.x + dx / dist * near * 0.08, anim.base.y + lift + near * 0.12, anim.base.z + dz / dist * near * 0.08);
        spinQ.setFromEuler(eul.set(Math.sin(t * 1.6) * 0.45, Math.sin(t * 2.2) * 0.35 + near * Math.sin(t * 14) * 0.5, Math.sin(t * 1.1) * 0.25 + t * near * 4));
        star.quaternion.copy(camQ).multiply(spinQ); squash(star, sy, s * (1 + near * 0.15));
        starShadow.position.set(anim.base.x, AR.y + 0.012, anim.base.z); starShadow.scale.setScalar(Math.max(0.3, 1 - (lift + 0.1) * 0.45));
        glints.forEach((g, i) => { const a = t * 1.7 + i * 2.1, tw = Math.max(0, Math.sin(t * 3.1 + i * 2.3)); g.visible = tw > 0.05;
          g.position.set(star.position.x + Math.cos(a) * 0.38, star.position.y + 0.1 + Math.sin(a * 1.3) * 0.12, star.position.z + Math.sin(a) * 0.38); g.scale.set(tw * 0.7, tw * 1.6, tw * 0.7); g.rotation.y = a; });
      } else glints.forEach((g) => { g.visible = false; });
      const v = t - anim.outT; starOut.visible = v >= 0 && v < 0.55;
      if (starOut.visible) {
        if (v < 0.07) { starOut.position.copy(anim.out); squash(starOut, 0.55, STAR_SIZE * 1.1); }
        else { const k = (v - 0.07) / 0.48, e = 1 - (1 - k) ** 3; starOut.position.set(anim.out.x, anim.out.y + e * 1.6, anim.out.z); squash(starOut, 1.6 - k * 0.6, STAR_SIZE * (1.2 - k)); }
        starOut.quaternion.copy(camQ).multiply(spinQ.setFromEuler(eul.set(0, t * 14, 0)));
      }
      sparks.forEach((s) => { if (!s.m.visible) return; s.vy -= 9 * dt; s.m.position.x += s.vx * dt; s.m.position.y += s.vy * dt; s.m.position.z += s.vz * dt;
        const k = Math.max(0, 1 - v / 0.7); s.m.scale.setScalar(k * 1.2); s.m.rotation.y += dt * 8; if (k <= 0 || s.m.position.y < AR.y) s.m.visible = false; });
    }
    function animatePlayer(t, dt) {
      const rx = (player.x - last.x) / Math.max(dt, 1e-3), rz = (player.z - last.z) / Math.max(dt, 1e-3); last.x = player.x; last.z = player.z;
      vel.x += (rx - vel.x) * Math.min(1, dt * 10); vel.z += (rz - vel.z) * Math.min(1, dt * 10);
      const sp = Math.min(Math.hypot(vel.x, vel.z), 6); walk += sp * dt * 9;
      let sy = 1 + Math.min(sp, 3) * 0.035 * Math.abs(Math.sin(walk)); const u = t - anim.caughtAt;
      if (state === 'over' && u < 1.2) sy = u < 0.12 ? 1 - u / 0.12 * 0.55 : springy(u - 0.12, 0.45, 5, 16);
      playerMesh.position.set(player.x, AR.y + (sp > 0.2 ? Math.abs(Math.sin(walk)) * 0.04 : 0), player.z);
      if (sp > 0.01) playerMesh.quaternion.setFromAxisAngle(axis.set(vel.z, 0, -vel.x).normalize(), Math.min(sp * 0.09, 0.32));
      squash(playerMesh, sy, 1.6); playerMesh.children[2].position.set(-vel.x * 0.012, 0.52, -vel.z * 0.012);
    }

    return {
      start() {
        state = 'ready'; demoOn = false;
        const c = ctx.place.s.chars[0]; if (c) ctx.hideObj(c.root.parent); // iskeledeki hayalet bebek oyun boyunca saklanır
        player.x = AR.x - 1.6; player.z = AR.z; playerMesh.visible = true;
        printMat.color.set(ctx.night() ? ctx.C.paper : ctx.C.ink);
        ctx.overlay({ title: 'Ghost Chase', text: 'Move with your mouse or finger. Collect stars. Your past self follows your footprints, ' + D.ghostDelay + ' seconds behind. Do not touch it.', cta: 'CLICK TO START' });
      },
      stop() {
        state = 'ready'; [star, starOut, starShadow, cursor].forEach((o) => { o.visible = false; }); glints.forEach((g) => { g.visible = false; }); sparks.forEach((p) => { p.m.visible = false; });
        prints.forEach((p) => { p.m.visible = false; }); ghosts.forEach((g) => group.remove(g.mesh)); ghosts = [];
      },
      begin(e) { const p = e && ctx.toLocal(e, AR.y); if (p) [player.x, player.z] = clamp(p.x, p.z); play(); },
      pointer(type, e) {
        if (type !== 'move' && type !== 'down') return;
        const p = ctx.toLocal(e, AR.y); if (!p) return;
        pointer.x = p.x; pointer.z = p.z; pointer.seen = true; inputs.push({ t: now(), x: p.x, z: p.z });
      },
      frame(t0, dt) {
        const t = now();
        ctx.root.getWorldQuaternion(rootQ); camQ.copy(rootQ).invert().multiply(ctx.cam.quaternion);
        if (demoOn && state === 'playing') { pointer.x = AR.x + Math.sin(t * 0.8) * (AR.w / 2 - 0.6); pointer.z = AR.z + Math.sin(t * 1.6) * (AR.d / 2 - 0.6); pointer.seen = true; inputs.push({ t, x: pointer.x, z: pointer.z }); }
        if (demoOn && state === 'over') play();
        update(t); animatePlayer(t, dt);
        const lagging = D.inputLag > 0 && pointer.seen && Math.hypot(pointer.x - player.x, pointer.z - player.z) > 0.1;
        cursor.visible = lagging; cursor.position.set(pointer.x, AR.y + 0.03, pointer.z);
        animateStar(t, dt);
        ghosts.forEach((g) => {
          g.mesh.visible = g.visible && !(t - g.appearedAt < D.grace && Math.sin(t * 20) < 0);
          g.mesh.quaternion.copy(camQ);
          const u = g.appearedAt === null ? 0 : t - g.appearedAt, k = Math.min(1, u / 0.18), sy = u < 0.18 ? 0.6 + k * 0.8 : springy(u - 0.18, -0.4, 7, 20);
          const c = g === anim.caughtBy ? 1 + 0.5 * Math.exp(-(t - anim.caughtAt) * 4) * Math.abs(Math.sin((t - anim.caughtAt) * 10)) : 1;
          squash(g.mesh, sy, 1.1 * c * k);
        });
        prints.forEach((p) => { if (p.m.visible && state === 'playing' && t - p.t > D.ghostDelay * D.maxGhosts + 1) p.m.visible = false; });
        let n = 0;
        if (state === 'playing') ghosts.forEach((g) => { if (g.visible) ctx.tag(n++, '−' + g.delay + 's', g.mesh.position, false, 96); });
        if (lagging) ctx.tag(n++, 'you · ' + D.inputLag + ' ms late', playerMesh.position, true, 70);
        ctx.tagsFrom(n);
      },
      hud() { return { time: state === 'playing' ? (now() - startTime).toFixed(1) : '0.0', stars: score, ghosts: state === 'playing' ? ghosts.filter((g) => g.visible).length : 0, best }; },
      rule: () => 'sample(t − ' + D.ghostDelay + 's)',
      caption: () => 'Your past walks in your footprints, ' + D.ghostDelay + (D.ghostDelay === 1 ? ' second' : ' seconds') + ' behind.',
      status: () => 'trail: ' + trail.length + ' samples · ghosts: ' + ghosts.filter((g) => g.visible).length + ' · ' + state,
      knob() {},
      demo() { demoOn = true; play(); }
    };
  }
};
