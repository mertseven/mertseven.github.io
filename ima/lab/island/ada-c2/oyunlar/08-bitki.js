// 08 · Shhh Plant — Sera. Saksıdaki tohum, oda sessiz kaldıkça filizlenir, dallanır, çiçek açar; biri bağırırsa sarsılır, yaprak döker.
// Girdi: mikrofon (AnalyserNode) ya da Space · Kural: eşik, ceza, affetme süresi · Durum: growth, level, streak · Çıktı: büyüyen ağaç, sarsıntı, dökülen yapraklar
window.OYUNLAR = window.OYUNLAR || {};
window.OYUNLAR['08'] = {
  key: '08', title: 'Shhh Plant', premise: 'Intervention', premiseText: 'Interactive systems act on the world, not just represent it.', promise: 'Prototype possible futures.',
  source: 'The Fun Theory — Volkswagen & DDB (2009) · Hello Lamp Post — PAN Studio (2013)',
  caption: 'Shhh. Something is listening to the room.', hint: 'hold space = noise · R restart · C code · B island',
  anat: ['microphone · space', 'level > threshold', 'growth · streak', 'branches · bloom'], hot: 2,
  hud: [['GROWN', 'grown'], ['ROOM NOISE', 'noise', 'ghosts'], ['STREAK', 'streak']],
  design: { mode: 'quiet', goalSeconds: 60, threshold: 0.25, sensitivity: 4, penalty: 0.15, forgiveness: 2, spread: 0.5 },
  knobs: [
    { key: 'mode', type: 'choice', options: ['quiet', 'loud'], note: 'loud = Cheer Plant' }, { key: 'goalSeconds', step: 10, min: 10, max: 300, note: 's to bloom' },
    { key: 'threshold', step: 0.05, min: 0.05, max: 0.95, note: '0–1 · what counts as noise' }, { key: 'sensitivity', step: 1, min: 1, max: 20, note: 'microphone gain' },
    { key: 'penalty', step: 0.05, min: 0, max: 0.5, note: 'growth lost per shout' }, { key: 'forgiveness', step: 0.5, min: 0, max: 8, note: 's · no new penalty' },
    { key: 'spread', step: 0.05, min: 0.1, max: 1, note: 'branch angle (rad)' }],
  code: ['<span class="c">// 4) RULE: the intervention</span>', '<span class="k">if</span> (level &gt; DESIGN.threshold) {', '  <span class="k">if</span> (t &gt; stunnedUntil) growth -= DESIGN.penalty;   <span class="c">// penalty</span>',
    '  stunnedUntil = t + DESIGN.forgiveness;                <span class="c">// forgiveness</span>', '} <span class="k">else if</span> (t &gt; stunnedUntil) growth += dt / DESIGN.goalSeconds;'],
  tasks: ['Play with <b>threshold</b> and <b>forgiveness</b>. Where is the line between a setting that annoys the class and one that is just hard?', 'Reward instead of punish: every 10 quiet seconds, a flower opens. Which works better?', 'Pick a real place on campus. What behaviour would a screen there try to change, and with which input?'],
  question: 'Who agreed to be measured? Who decides what the room should feel like?',
  overlay: { title: 'This plant listens to the room.', text: '', choices: [] },
  view: { at: [0, 1.05, -0.25], zoom: 3.3, pitch: 0.42 },

  make(ctx) {
    const { THREE, D, C, group } = ctx;
    const VOICE = {
      quiet: { title: 'Shhh Plant', consent: 'It grows only while the room stays quiet. Keep it quiet together until it blooms. The sound is measured in this browser; nothing is recorded or sent.', growing: 'Shhh… it is growing.', hit: 'Too loud! The plant is shaking.', done: 'It bloomed. You did it together.' },
      loud: { title: 'Cheer Plant', consent: 'It grows only while the room cheers. Make noise together until it blooms. The sound is measured in this browser; nothing is recorded or sent.', growing: 'Louder! It needs your voices.', hit: 'Keep going!', done: 'It bloomed. You did it together.' }
    };
    const V = () => VOICE[D.mode];
    const MAX = 7, BASE = new THREE.Vector3(0, 0.5, -0.3);
    let state = 'consent', growth = 0, level = 0, streak = 0, stunnedUntil = 0, sway = 0, spaceHeld = false, analyser = null, samples = null, msg = '', simT = 0, demoOn = false;
    // ---- özyinelemeli ağaç: bir kez kurulur, büyüme her karede neyin görüneceğine karar verir ----
    const rand = Array.from({ length: 2 ** (MAX + 1) }, () => Math.random());
    const segGeo = new THREE.CylinderGeometry(0.6, 1, 1, 6).translate(0, 0.5, 0), leafGeo = new THREE.SphereGeometry(0.05, 8, 6), flowerGeo = new THREE.SphereGeometry(0.045, 10, 8);
    const stem = ctx.toon('green'), leafM = ctx.toon('green'), flowerM = ctx.flat('pink'), nodes = [];
    function branch(len, depth, id) {
      const g = new THREE.Group(), seg = ctx.mesh(segGeo, stem); seg.userData.r = Math.max(0.006, (MAX - depth) * 0.0065); g.add(seg);
      const tip = new THREE.Group(); g.add(tip);
      const leaf = depth >= 2 ? ctx.mesh(leafGeo, leafM) : null; if (leaf) { leaf.scale.set(1, 0.55, 1.4); tip.add(leaf); }
      const flower = depth === MAX - 1 ? ctx.mesh(flowerGeo, flowerM) : null; if (flower) { flower.position.y = 0.03; tip.add(flower); }
      const n = { g, seg, tip, leaf, flower, len, depth, id, kids: [], rx: 0, rz: 0 }; nodes.push(n);
      if (depth < MAX - 1) [0, 1].forEach((s) => {
        const k = branch(len * (s ? 0.74 : 0.78), depth + 1, id * 2 + s);
        // dallar iki düzlemde açılır: çift derinlikte x, tek derinlikte z ekseni (3B taç)
        k.side = s ? 1 : -1; k.axis = depth % 2 ? 'x' : 'z'; tip.add(k.g); n.kids.push(k);
      });
      return n;
    }
    const tree = branch(0.32, 0, 1); tree.g.position.copy(BASE); group.add(tree.g);
    const seed = ctx.mesh(new THREE.SphereGeometry(0.04, 8, 6), ctx.toon('wood'), BASE.x, BASE.y + 0.02, BASE.z); seed.scale.set(1.3, 0.8, 1); group.add(seed);
    // dökülen yapraklar
    const fall = Array.from({ length: 40 }, () => { const m = ctx.mesh(leafGeo, ctx.toon('wood')); m.visible = false; m.scale.set(0.8, 0.4, 1.1); group.add(m); return { m, vy: 0, seed: 0 }; });
    let fi = 0;
    const gardener = ctx.place.s.chars[0], gBox = gardener && gardener.root.parent, gWas = gBox && gBox.position.clone();
    const tmp = new THREE.Vector3();
    function dropLeaves(count) {
      const lit = nodes.filter((n) => n.leaf && n.leaf.visible); if (!lit.length) return;
      for (let i = 0; i < count; i++) { const n = lit[Math.floor(Math.random() * lit.length)], f = fall[fi = (fi + 1) % fall.length];
        n.leaf.getWorldPosition(tmp); group.worldToLocal(tmp); f.m.position.copy(tmp); f.vy = Math.random() * 0.3; f.seed = Math.random() * 10; f.m.visible = true; }
    }

    async function startMic() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true }), audio = ctx.audio();
        analyser = audio.createAnalyser(); analyser.fftSize = 1024; samples = new Uint8Array(analyser.fftSize);
        audio.createMediaStreamSource(stream).connect(analyser); // hoparlöre bağlanmaz: yalnız dinler
        begin();
      } catch (err) { ctx.overlay(Object.assign(consent(), { error: 'Microphone not available (' + err.name + '). Use the keyboard, or open the island from a local server (http://localhost).' })); }
    }
    function begin() { ctx.playing(true); restart(); }
    function restart() { state = 'growing'; growth = 0; streak = 0; stunnedUntil = 0; msg = V().growing; fall.forEach((f) => { f.m.visible = false; }); }
    const consent = () => ({ title: 'This plant listens to the room.', text: V().consent, choices: [['USE MICROPHONE', startMic], ['USE KEYBOARD INSTEAD', begin]] });

    function readLevel() {
      let raw = 0;
      if (analyser) { analyser.getByteTimeDomainData(samples); let sum = 0; for (const v of samples) { const s = (v - 128) / 128; sum += s * s; } raw = Math.sqrt(sum / samples.length) * D.sensitivity; }
      if (spaceHeld) raw = Math.max(raw, 0.8);
      if (demoOn) raw = (simT % 14) > 11.5 ? 0.7 : 0.02;
      raw = Math.min(1, raw); level = raw > level ? raw : level * 0.92 + raw * 0.08; // hızlı yüksel, yavaş in
    }
    function update(dt, t) {
      readLevel(); const loud = level > D.threshold;
      if (state === 'growing') {
        if (D.mode === 'quiet') {
          if (loud) { if (t > stunnedUntil) { growth = Math.max(0, growth - D.penalty); sway = 1; dropLeaves(14); msg = V().hit; ctx.flash(2); } stunnedUntil = t + D.forgiveness; streak = 0; }
          else if (t > stunnedUntil) { growth += dt / D.goalSeconds; streak += dt; msg = V().growing; }
        } else {
          if (loud) { growth += dt / D.goalSeconds; streak += dt; sway = Math.max(sway, level * 0.5); msg = V().hit; }
          else { growth = Math.max(0, growth - dt / (D.goalSeconds * 4)); streak = 0; msg = V().growing; }
        }
        if (growth >= 1) { growth = 1; state = 'bloomed'; msg = V().done; ctx.flash(2); }
      }
      sway *= Math.pow(0.97, dt * 60);
    }
    // Lasseter: dal ucu büyürken yaylanır (squash/stretch), sarsıntıda gövde önce, dallar geriden gelir (overlapping), çiçek açarken taşar (overshoot)
    function grow(t) {
      nodes.forEach((n) => {
        const part = Math.max(0, Math.min(1, growth * MAX - n.depth));
        n.g.visible = part > 0 || n.depth === 0;
        n.seg.scale.set(n.seg.userData.r * (0.4 + 0.6 * part), n.len * part + 1e-4, n.seg.userData.r * (0.4 + 0.6 * part));
        n.tip.position.y = n.len * part;
        n.kids.forEach((k) => { k.g.visible = part >= 1; });
        const wob = Math.sin(t * (1.5 + sway * 18) + n.depth * 0.9) * (0.02 + sway * 0.12) * (1 + n.depth * 0.15);
        if (n.depth > 0) { const a = n.side * D.spread * (0.6 + rand[n.id] * 0.8) + wob; n.g.rotation.set(n.axis === 'x' ? a : 0, n.id * 2.4, n.axis === 'z' ? a : 0); }
        else n.g.rotation.z = wob * 0.5;
        if (n.leaf) { const lp = Math.max(0, Math.min(1, growth * MAX - n.depth - 0.6) / 0.4); n.leaf.visible = lp > 0 && part >= 1; n.leaf.scale.set(lp, 0.55 * lp, 1.4 * lp); }
        if (n.flower) { n.flower.visible = state === 'bloomed'; if (n.flower.visible) n.flower.scale.setScalar(1 + 0.25 * Math.sin(t * 3 + n.id)); }
      });
      seed.visible = growth === 0;
    }
    return {
      start() {
        ctx.hide(5, 6, 7, 9); // ön camlar, kiriş, çatı ve süs bitkisi: büyüyen ağacı görmek için
        if (gBox) gBox.position.set(1.1, 0.18, 0.55);
        if (state === 'consent') ctx.overlay(consent()); else ctx.playing(true);
      },
      stop() { spaceHeld = false; if (gBox) gBox.position.copy(gWas); },
      key(e, down) {
        if (e.code === 'Space') { e.preventDefault(); spaceHeld = down; return true; }
        if (down && e.key.toLowerCase() === 'r' && state !== 'consent') { restart(); return true; }
        return false;
      },
      frame(t, dt) {
        simT += dt;
        if (state !== 'consent') update(dt, simT);
        grow(simT);
        fall.forEach((f) => { if (!f.m.visible) return; f.vy += 0.6 * dt; f.m.position.y -= f.vy * dt; f.m.position.x += Math.sin(simT * 3 + f.seed) * 0.15 * dt; f.m.rotation.z += dt * 3; if (f.m.position.y < 0.2) f.m.visible = false; });
        if (gardener) ctx.animChar(gardener, simT * (level > D.threshold ? 3 : 1));
        let n = 0; if (state !== 'consent' && level > D.threshold && D.mode === 'quiet') ctx.tag(n++, 'shhh!', new THREE.Vector3(0.95, 1.2, 0.45), true, 0);
        ctx.tagsFrom(n);
      },
      hud() { const bars = Math.round(level * 8); return { grown: Math.floor(growth * 100) + '%', noise: '▮'.repeat(bars) + '▯'.repeat(8 - bars), streak: streak.toFixed(1) + ' s' }; },
      rule: () => 'level > ' + D.threshold + (D.mode === 'quiet' ? ' → shake' : ' → grow'),
      caption: () => state === 'consent' ? 'Shhh. Something is listening to the room.' : msg,
      status: () => 'mode: ' + D.mode + ' · level ' + level.toFixed(2) + ' · growth ' + Math.floor(growth * 100) + '% · ' + state,
      knob(k) { if (k === 'mode' && state !== 'consent') restart(); },
      demo() { demoOn = true; begin(); growth = 0.55; }
    };
  }
};
