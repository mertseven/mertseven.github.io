// 05 · Sand Box — Kumsal. Kumsalda camlı bir kum masası: kum, su ve duvarla oynanan küçük bir dünya. Tasarımcı resim çizmez, kural yazar.
// Girdi: pointerdown / pointermove, 1–5 · Kural: RULES[SAND], RULES[WATER], step() · Durum: grid (hücre başına element) · Çıktı: pikseller
window.OYUNLAR = window.OYUNLAR || {};
window.OYUNLAR['05'] = {
  key: '05', title: 'Sand Box', premise: 'Possibility', premiseText: 'A system makes some actions possible and others impossible.', promise: 'Design the space of possibilities, not the object.',
  source: 'Sandspiel — Max Bittker (2018)',
  caption: 'You are not making a castle. You are making what can happen.', hint: 'drag to pour · 1 sand · 2 water · 3 wall · 4 erase · 5 clear · C code · B island',
  anat: ['pointerdown · 1–5', 'RULES[cell]', 'grid[x][y]', 'grains'], hot: 1,
  hud: [['VERB · 1–5', 'verb'], ['GRAINS', 'grains'], ['IMPOSSIBLE', 'impossible', 'ghosts']],
  design: { sand: true, water: true, wall: true, erase: true, clear: true, brush: 3, flow: 0.4, stepsPerFrame: 2, sandSinks: true },
  knobs: [
    { key: 'sand', type: 'bool', note: 'verb' }, { key: 'water', type: 'bool', note: 'verb' }, { key: 'wall', type: 'bool', note: 'verb' }, { key: 'erase', type: 'bool', note: 'verb · undo' }, { key: 'clear', type: 'bool', note: 'verb · start over' },
    { key: 'brush', step: 1, min: 1, max: 8, note: 'cells' }, { key: 'flow', step: 0.1, min: 0.1, max: 1, note: 'pour density' }, { key: 'stepsPerFrame', step: 1, min: 0, max: 6, note: 'speed · 0 = frozen' },
    { key: 'sandSinks', type: 'bool', note: 'task 2 · sand sinks in water' }],
  code: ['<span class="c">// 3) RULE: every element has one rule</span>', 'RULES[SAND] = (x, y) =&gt; fall(x, y, [EMPTY, <span class="k">DESIGN.sandSinks</span> ? WATER : <span class="c">—</span>]);', 'RULES[WATER] = (x, y) =&gt; fall(x, y, [EMPTY]) || flowSideways(x, y);', '<span class="c">// WALL: no rule, it stays where it is</span>'],
  tasks: ['Turn off <b>erase</b> and <b>clear</b>. How do you play in a world you cannot undo?', 'Turn off <b>sandSinks</b>: sand floats on water. One line of rules changed. What changed in what you make?', 'Add a <b>PLANT</b> element: next to water, it turns the water into more plant.'],
  question: 'You have two minutes to make something the designer never drew.',
  overlay: { title: 'Sand Box', text: 'A sand table on the beach. Drag to pour. 1 sand · 2 water · 3 wall · 4 erase · 5 clear. Every verb is a rule; remove one and it becomes impossible.', cta: 'CLICK TO START' },
  view: { at: [0, 1.05, -0.2], zoom: 3.4, pitch: 0.3, yaw: 0.5 }, // koydan bakar: bando sahnesi kadrajı kapatmasın

  make(ctx) {
    const { THREE, D, C, group } = ctx;
    // kumsal mekânı kıyı çizgisinde; masa denizin üstünde kalsın diye gerekirse ayakları uzar
    const COLS = 120, ROWS = 80, W = 2.4, H = 1.6, X0 = -W / 2, Y0 = Math.max(0.32, 0.22 - ctx.root.position.y), Z = -0.2;
    const EMPTY = 0, SAND = 1, WATER = 2, WALL = 3;
    const ALL = ['sand', 'water', 'wall', 'erase', 'clear'], MAT = { sand: SAND, water: WATER, wall: WALL, erase: EMPTY };
    const hex = (h) => { const c = new THREE.Color(h); return [c.r * 255, c.g * 255, c.b * 255].map(Math.round); };
    const COL = { [EMPTY]: hex(C.paper), [SAND]: hex(C.warm), [WATER]: hex(C.cool), [WALL]: hex(C.ink) };
    const grid = new Uint8Array(COLS * ROWS), moved = new Uint8Array(COLS * ROWS);
    const shade = Float32Array.from({ length: COLS * ROWS }, () => 0.84 + Math.random() * 0.16);
    const cv = document.createElement('canvas'); cv.width = COLS; cv.height = ROWS; const cx = cv.getContext('2d'), img = cx.createImageData(COLS, ROWS);
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace; tex.magFilter = THREE.NearestFilter; tex.minFilter = THREE.NearestFilter;
    // masa: ahşap çerçeve, iki ayak, camın arkasında dünya
    group.add(ctx.mesh(new THREE.PlaneGeometry(W, H), ctx.flat('#ffffff', { map: tex }), 0, Y0 + H / 2, Z, false));
    const frame = ctx.toon('wood');
    [[0, Y0 - 0.04, W + 0.16, 0.08], [0, Y0 + H + 0.04, W + 0.16, 0.08]].forEach(([x, y, w, h]) => group.add(ctx.mesh(new THREE.BoxGeometry(w, h, 0.16), frame, x, y, Z)));
    [-1, 1].forEach((s) => { group.add(ctx.mesh(new THREE.BoxGeometry(0.08, H + 0.16, 0.16), frame, s * (W / 2 + 0.04), Y0 + H / 2, Z)); group.add(ctx.mesh(new THREE.BoxGeometry(0.08, Y0, 0.3), frame, s * (W / 2 - 0.2), Y0 / 2, Z)); });
    group.add(ctx.mesh(new THREE.BoxGeometry(W, 0.012, 0.012), ctx.toon('ink'), 0, Y0 + H, Z + 0.09)); // camın üst çıtası
    // fırça imleci: dökülen yerin üstünde küçük bir kova
    const pail = new THREE.Group(); pail.add(ctx.mesh(new THREE.CylinderGeometry(0.07, 0.05, 0.1, 12, 1, true), ctx.toon('hot'), 0, 0, 0)); pail.rotation.z = 2.3; pail.visible = false; group.add(pail);
    const kid = ctx.place.s.chars[0], kidBox = kid && kid.root.parent, kidWas = kidBox && kidBox.position.clone(), kidRot = kidBox && kidBox.rotation.y;
    const KY = Math.max(0.1, 0.14 - ctx.root.position.y); // kumcu bir sandığın üstünde durur (sığ suda)
    if (KY > 0.15) group.add(ctx.mesh(new THREE.BoxGeometry(0.5, KY, 0.5), ctx.toon('wood'), -1.55, KY / 2, 0.4));
    let tool = 'sand', grains = 0;
    const pointer = { down: false, x: 0, y: 0, on: false };

    const verbs = () => ALL.filter((v) => D[v]);
    function choose(v) { if (!D[v]) return; if (v === 'clear') { grid.fill(EMPTY); ctx.flash(2); return; } tool = v; }
    const get = (x, y) => (x < 0 || x >= COLS || y < 0 || y >= ROWS) ? WALL : grid[y * COLS + x];
    function tryMove(x, y, nx, ny, ok) { const t = get(nx, ny); if (!ok(t)) return false; const a = y * COLS + x, b = ny * COLS + nx; grid[b] = grid[a]; grid[a] = t; moved[b] = 1; return true; }
    const RULES = {
      [SAND](x, y) { const d = Math.random() < 0.5 ? 1 : -1, ok = (c) => c === EMPTY || (D.sandSinks && c === WATER);
        return tryMove(x, y, x, y + 1, ok) || tryMove(x, y, x + d, y + 1, ok) || tryMove(x, y, x - d, y + 1, ok); },
      [WATER](x, y) { const d = Math.random() < 0.5 ? 1 : -1, ok = (c) => c === EMPTY;
        return tryMove(x, y, x, y + 1, ok) || tryMove(x, y, x + d, y + 1, ok) || tryMove(x, y, x - d, y + 1, ok) || tryMove(x, y, x + d, y, ok) || tryMove(x, y, x - d, y, ok); }
    };
    function step() {
      moved.fill(0);
      for (let y = ROWS - 1; y >= 0; y--) { const ltr = Math.random() < 0.5;
        for (let i = 0; i < COLS; i++) { const x = ltr ? i : COLS - 1 - i, k = y * COLS + x, r = RULES[grid[k]]; if (r && !moved[k]) r(x, y); } }
    }
    function paint() {
      if (!D[tool]) return; const m = MAT[tool]; if (m === undefined) return;
      const r = D.brush, poured = m === SAND || m === WATER;
      for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
        if (dx * dx + dy * dy > r * r) continue; const x = pointer.x + dx, y = pointer.y + dy;
        if (x < 0 || x >= COLS || y < 0 || y >= ROWS) continue;
        if (poured && (Math.random() > D.flow || grid[y * COLS + x] !== EMPTY)) continue;
        grid[y * COLS + x] = m;
      }
    }
    function draw() {
      grains = 0;
      for (let i = 0; i < grid.length; i++) { const c = grid[i], rgb = COL[c], s = c === EMPTY ? 1 : shade[i];
        img.data[i * 4] = rgb[0] * s; img.data[i * 4 + 1] = rgb[1] * s; img.data[i * 4 + 2] = rgb[2] * s; img.data[i * 4 + 3] = 255; if (c === SAND || c === WATER) grains++; }
      cx.putImageData(img, 0, 0); tex.needsUpdate = true;
    }
    function setPointer(e) {
      const p = ctx.toLocal(e, 0, 'z', Z); if (!p) { pointer.on = false; return; }
      pointer.x = Math.floor((p.x - X0) / W * COLS); pointer.y = Math.floor((Y0 + H - p.y) / H * ROWS);
      pointer.on = pointer.x >= -4 && pointer.x < COLS + 4 && pointer.y >= -4 && pointer.y < ROWS + 4;
      pail.position.set(p.x + 0.06, p.y + 0.08, Z + 0.12);
    }
    // başlangıç: küçük bir kumul ve bir duvar parçası, boş bir masa korkutmasın
    for (let x = 20; x < 60; x++) for (let y = ROWS - 1 - Math.floor(8 * Math.sin((x - 20) / 40 * Math.PI)); y < ROWS; y++) grid[y * COLS + x] = SAND;
    for (let x = 78; x < 104; x++) grid[(ROWS - 22) * COLS + x] = WALL;
    let demoOn = false;
    return {
      start() {
        ctx.hide(2, 3, 4, 5); // şemsiye, şezlong, kale, deniz yıldızı: masanın önünü açar
        if (kidBox) { kidBox.position.set(-1.55, KY, 0.4); kidBox.rotation.y = 0.6; }
      },
      stop() { pointer.down = false; pail.visible = false; if (kidBox) { kidBox.position.copy(kidWas); kidBox.rotation.y = kidRot; } },
      begin(e) { if (e) { setPointer(e); pointer.down = pointer.on; } },
      pointer(type, e) {
        if (type === 'down') { setPointer(e); pointer.down = pointer.on; }
        else if (type === 'move') setPointer(e);
        else if (type === 'up' || type === 'leave') pointer.down = false;
      },
      key(e, down) {
        if (!down) return false; const v = verbs()[Number(e.key) - 1];
        if (v) { choose(v); return true; } return false;
      },
      frame(t) {
        if (demoOn) { pointer.x = 60 + Math.round(Math.sin(t * 0.9) * 40); pointer.y = 6; pointer.down = true; tool = Math.sin(t * 0.37) > 0 ? 'sand' : 'water'; pointer.on = true; }
        if (pointer.down && pointer.on) paint();
        for (let i = 0; i < D.stepsPerFrame; i++) step();
        draw();
        pail.visible = pointer.on && ctx.isPlaying() && (tool === 'sand' || tool === 'water');
        if (pail.visible) pail.children[0].material = ctx.toon(tool === 'sand' ? 'hot' : 'cool');
        if (kid) ctx.animChar(kid, t * (pointer.down ? 2.4 : 1));
        const vs = verbs(); let n = 0;
        vs.forEach((v, i) => ctx.tag(n++, (i + 1) + ' ' + v, new THREE.Vector3(X0 + (i + 0.5) * W / vs.length, Y0 + H + 0.2, Z), v === tool, 0));
        ctx.tagsFrom(n);
      },
      hud() { const imp = ALL.filter((v) => !D[v]); return { verb: D[tool] ? tool : '—', grains, impossible: imp.length ? imp.join(', ') : 'nothing' }; },
      rule: () => D.sandSinks ? 'sand falls · sinks in water' : 'sand falls · floats on water',
      status: () => 'verbs: ' + verbs().join(', ') + ' · grains: ' + grains,
      knob(k) { if (ALL.includes(k) && !D[tool]) tool = verbs().find((v) => v !== 'clear') || 'sand'; },
      view: () => ({ at: [0, Y0 + H / 2 - 0.05, Z] }),
      demo() { demoOn = true; ctx.playing(true); }
    };
  }
};
