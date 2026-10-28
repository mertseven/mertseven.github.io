// 03 · Mini Sequencer — Saat Kulesi. Kulenin kadranı bir müzik kutusu: halkalara çivi çak, akrep döndükçe geçtiği çivileri çalar.
// Girdi: kadrana tıklama, Space · Kural: toggle(step, note), tick() · Durum: grid[nota][adım], playing, step · Çıktı: çivi, akrep, çan, ses
window.OYUNLAR = window.OYUNLAR || {};
window.OYUNLAR['03'] = {
  key: '03', title: 'Mini Sequencer', premise: 'Feedback', premiseText: 'The system’s state must be understandable.', promise: 'Design the feedback loop, not the outcome.',
  source: 'Song Maker — Chrome Music Lab (2018)',
  caption: 'The hand tells you where the music is now.', hint: 'click the clock face · space = play / stop · X clear · C code · B island',
  touch: [{ label: 'PLAY / STOP', code: 'Space' }, { label: 'CLEAR', code: 'KeyX', key: 'x' }],
  anat: ['click · space', 'toggle() · tick()', 'grid[7][8]', 'pegs · hand · bell'], hot: 2,
  hud: [['BPM', 'bpm'], ['STEP', 'step'], ['PEGS', 'pegs', 'ghosts']],
  design: { bpm: 110, showPlayhead: true, previewOnClick: true, showStatus: true, pingPong: false },
  knobs: [
    { key: 'bpm', step: 10, min: 40, max: 240, note: 'live' },
    { key: 'showPlayhead', type: 'bool', note: 'SHOW STATE · where are we?' }, { key: 'previewOnClick', type: 'bool', note: 'SHOW CHANGE · hear it now' },
    { key: 'showStatus', type: 'bool', note: 'the HUD numbers' }, { key: 'pingPong', type: 'bool', note: 'task 2 · hand swings back' }],
  code: ['<span class="c">// 4) RULE: one step of time</span>', '<span class="k">function</span> tick() {', '  step = (step + 1) % DESIGN.steps;', '  grid.forEach((row, r) =&gt; { <span class="k">if</span> (row[step]) ring(r, step); });', '}'],
  tasks: ['Turn off <b>showPlayhead</b>, <b>previewOnClick</b> and <b>showStatus</b> one by one. Which one makes the system hardest to read?', 'Turn on <b>pingPong</b>: the hand swings back. How does a listener notice?', 'Change <b>bpm</b> while it plays. Where do you see the tempo change?'],
  question: 'Fill three pegs, press play. How do you know what the system “thinks” right now?',
  overlay: { title: 'Mini Sequencer', text: 'The clock face is a music box. Click a ring to plant a peg; the hand sweeps round and rings every peg it passes. Space plays and stops.', cta: 'CLICK TO START' },
  view: { at: [0, 1.95, 0.62], zoom: 5.4, pitch: 0.22 },

  make(ctx) {
    const { THREE, D, C, group } = ctx;
    const STEPS = 8, NOTES = [14, 12, 9, 7, 4, 2, 0], COLS = ['hot', 'warm', 'green', 'cool', 'pink', 'wood', 'ink'];
    const CY = 1.95, CZ = 0.615, R0 = 0.17, R1 = 0.55, DR = (R1 - R0) / (NOTES.length - 1);
    const grid = NOTES.map(() => Array(STEPS).fill(false));
    let playing = false, step = -1, dir = 1, nextTick = 0, rang = [], audio = null;
    // adım açısı: saat yönünde, tepeden başlar
    const ang = (s) => Math.PI / 2 - s / STEPS * Math.PI * 2;
    const rad = (n) => R1 - n * DR; // üst nota dış halkada

    // kadran: kâğıt disk, halkalar ve adım çizgileri (desen dışı, okunaklı)
    const face = (() => {
      const S = 512, c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'), k = S / 2 / (R1 + 0.05);
      x.fillStyle = C.paper; x.fillRect(0, 0, S, S);
      x.strokeStyle = C.ink; x.lineWidth = 3; x.beginPath(); x.arc(S / 2, S / 2, S / 2 - 3, 0, 7); x.stroke();
      NOTES.forEach((_, n) => { x.globalAlpha = 0.35; x.lineWidth = 2; x.strokeStyle = C[COLS[n]]; x.beginPath(); x.arc(S / 2, S / 2, rad(n) * k, 0, 7); x.stroke(); });
      x.globalAlpha = 1; x.strokeStyle = C.ink;
      for (let s = 0; s < STEPS; s++) { const a = ang(s + 0.5); x.lineWidth = 2; x.beginPath(); x.moveTo(S / 2 + Math.cos(a) * R0 * 0.8 * k, S / 2 - Math.sin(a) * R0 * 0.8 * k); x.lineTo(S / 2 + Math.cos(a) * (R1 + 0.04) * k, S / 2 - Math.sin(a) * (R1 + 0.04) * k); x.stroke(); }
      x.fillStyle = C.ink; x.font = 'bold 30px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle';
      for (let s = 0; s < STEPS; s++) { const a = ang(s); x.fillText(String(s + 1), S / 2 + Math.cos(a) * R0 * 0.55 * k, S / 2 - Math.sin(a) * R0 * 0.55 * k); }
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
    })();
    const plate = ctx.mesh(new THREE.CircleGeometry(R1 + 0.05, 64), ctx.flat('#ffffff', { map: face }), 0, CY, CZ, false); group.add(plate);
    const rim = ctx.mesh(new THREE.TorusGeometry(R1 + 0.055, 0.02, 8, 64), ctx.toon('ink'), 0, CY, CZ + 0.005); group.add(rim);
    // çiviler: her hücrede bir tane; boşken küçük nokta, doluyken renkli topuz
    const pegGeo = new THREE.SphereGeometry(0.03, 12, 8), dotGeo = new THREE.CircleGeometry(0.008, 8);
    const pegs = NOTES.map((_, n) => Array.from({ length: STEPS }, (_, s) => {
      const a = ang(s), x = Math.cos(a) * rad(n), y = CY + Math.sin(a) * rad(n);
      const dot = ctx.mesh(dotGeo, ctx.flat('ink'), x, y, CZ + 0.002, false); group.add(dot);
      const peg = ctx.mesh(pegGeo, ctx.flat(COLS[n]), x, y, CZ + 0.02); peg.visible = false; group.add(peg);
      return { peg, dot, x, y, hitT: -9, setT: -9 };
    }));
    // akrep = oynatma çizgisi (şu an)
    const hand = new THREE.Group(); hand.position.set(0, CY, CZ + 0.04); group.add(hand);
    hand.add(ctx.mesh(new THREE.BoxGeometry(0.03, R1 + 0.02, 0.012), ctx.flat('hot'), 0, (R1 + 0.02) / 2, 0));
    hand.add(ctx.mesh(new THREE.ConeGeometry(0.04, 0.07, 3), ctx.flat('hot'), 0, R1 + 0.05, 0));
    const hub = ctx.mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.03, 16), ctx.toon('ink'), 0, CY, CZ + 0.05); hub.rotation.x = Math.PI / 2; group.add(hub);
    // nota halkaları: çivi çalınca kadrandan büyüyerek çıkar (sebep → sonuç)
    const waveGeo = new THREE.RingGeometry(0.045, 0.06, 20);
    const waves = Array.from({ length: 14 }, () => { const m = ctx.mesh(waveGeo, ctx.flat('hot', { transparent: true }), 0, 0, CZ + 0.03, false); m.visible = false; m.userData.noOutline = true; group.add(m); return { m, t: -9 }; });
    let wi = 0;
    const maker = ctx.place.s.chars[0];

    function playNote(r, when = 0) {
      if (!(audio = ctx.audio())) return;
      const now = audio.currentTime + when, o = audio.createOscillator(), g = audio.createGain();
      o.type = 'triangle'; o.frequency.value = 261.63 * 2 ** (NOTES[r] / 12);
      g.gain.setValueAtTime(0.22, now); g.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      o.connect(g).connect(audio.destination); o.start(now); o.stop(now + 0.36);
    }
    function wave(p, col) { const w = waves[wi = (wi + 1) % waves.length]; w.m.material.color.set(C[col]); w.m.position.set(p.x, p.y, CZ + 0.03); w.t = ctx.now(); }
    function toggle(n, s) {
      grid[n][s] = !grid[n][s]; const p = pegs[n][s]; p.setT = ctx.now();
      if (grid[n][s] && D.previewOnClick) { playNote(n); wave(p, COLS[n]); }
      ctx.flash(2);
    }
    function tick(t) {
      if (D.pingPong) { if (step + dir >= STEPS || step + dir < 0) dir = -dir; step += dir; } else step = (step + 1) % STEPS;
      grid.forEach((row, n) => { if (row[step]) { playNote(n); pegs[n][step].hitT = t; wave(pegs[n][step], COLS[n]); } });
    }
    function togglePlay(t) { playing = !playing; if (playing) { step = -1; dir = 1; tick(t); nextTick = t + 60 / D.bpm / 2; } ctx.flash(2); }

    // Lasseter: akrep adımına yaylanarak oturur (slow in + overshoot); çalan çivi ezilip uzar; çivi çakılınca zıplar
    const springy = (u, amp, k = 9, w = 20) => 1 - amp * Math.exp(-u * k) * Math.cos(u * w);
    const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
    let handA = ang(0), handV = 0;
    return {
      start() { ctx.hide(2, 3, 4); playing = false; step = -1; },
      stop() { playing = false; },
      begin() {},
      pointer(type, e) {
        if (type !== 'down') return;
        const p = ctx.toLocal(e, 0, 'z', CZ); if (!p) return;
        const dx = p.x, dy = p.y - CY, r = Math.hypot(dx, dy); if (r < R0 - DR / 2 || r > R1 + DR / 2) return;
        const n = Math.round((R1 - r) / DR), a = Math.atan2(dy, dx), s = ((Math.round((Math.PI / 2 - a) / (Math.PI * 2) * STEPS) % STEPS) + STEPS) % STEPS;
        if (n >= 0 && n < NOTES.length) toggle(n, s);
      },
      key(e, down) {
        if (!down) return false; const k = e.key.toLowerCase();
        if (e.code === 'Space') { e.preventDefault(); if (!e.repeat) togglePlay(ctx.now()); return true; }
        if (k === 'x') { grid.forEach((row) => row.fill(false)); return true; }
        return false;
      },
      frame(t0, dt) {
        const t = ctx.now();
        if (playing && t >= nextTick) { tick(t); nextTick += 60 / D.bpm / 2; if (nextTick < t) nextTick = t + 60 / D.bpm / 2; }
        // akrep
        // akrep: hedef adıma az sönümlü yayla gider → hızlanır, biraz geçer, geri oturur
        handV += (wrap(ang(Math.max(0, step)) - handA) * 420 - handV * 24) * dt; handA += handV * dt;
        hand.rotation.z = handA - Math.PI / 2; hand.visible = D.showPlayhead && (playing || step >= 0);
        pegs.forEach((row, n) => row.forEach((p, s) => {
          p.peg.visible = grid[n][s]; p.dot.visible = !grid[n][s];
          const u = t - p.hitT, v = t - p.setT;
          let sc = 1; if (u >= 0 && u < 0.5) sc = 1 + 0.8 * Math.exp(-u * 7) * Math.abs(Math.cos(u * 18)); if (v >= 0 && v < 0.5) sc *= springy(v, 0.6, 8, 22);
          const now = D.showPlayhead && playing && s === step && grid[n][s]; p.peg.scale.setScalar(sc * (now ? 1.25 : 1));
        }));
        waves.forEach((w) => { const u = t - w.t; w.m.visible = u >= 0 && u < 0.6; if (w.m.visible) { w.m.scale.setScalar(1 + u * 5); w.m.material.opacity = 1 - u / 0.6; } });
        if (maker) ctx.animChar(maker, t * (playing ? 2 : 1));
      },
      hud() {
        if (!D.showStatus) return { bpm: '?', step: '?', pegs: '?' };
        return { bpm: D.bpm, step: playing ? (step + 1) + ' / ' + STEPS : '– / ' + STEPS, pegs: grid.flat().filter(Boolean).length };
      },
      rule: () => D.pingPong ? 'step += dir (ping-pong)' : 'step = (step + 1) % 8',
      caption: () => !D.showPlayhead ? 'No hand. Where is the music now?' : playing ? 'The hand tells you where the music is now.' : 'Plant a peg. Space to play.',
      status: () => 'state: ' + (playing ? 'playing' : 'stopped') + ' · step ' + (playing ? step + 1 : '–') + '/' + STEPS + ' · pegs: ' + grid.flat().filter(Boolean).length,
      knob() {},
      demo() { [[0, 0], [2, 2], [4, 4], [1, 6], [3, 3], [5, 7], [6, 1], [2, 5]].forEach(([n, s]) => { grid[n][s] = true; }); ctx.playing(true); togglePlay(ctx.now()); }
    };
  }
};
