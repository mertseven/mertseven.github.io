// 07 · Boundary Lines — Kasaba Meydanı. Her tıklama meydana bir kasabalı bırakır; aralarında, kimsenin çizmediği sınırlar belirir.
// Girdi: çoklu pointerdown / sürükle / çift tıklama, Space · Kural: dolaş + uzak dur, en yakın kişi alanın sahibi · Durum: people[ ] · Çıktı: sınırlar, yüzdeler
window.OYUNLAR = window.OYUNLAR || {};
window.OYUNLAR['07'] = {
  key: '07', title: 'Boundary Lines', premise: 'Emergence', premiseText: 'Experience cannot be fully predetermined.', promise: 'Design conditions, not outcomes.',
  source: 'Boundary Functions — Scott Snibbe (1998)',
  caption: 'Nobody drew these lines.', hint: 'click = add a person · drag = move · double-click = remove · space = scatter · X clear · C code · B island',
  anat: ['pointerdown · drag', 'nearest(person)', 'people[ ]', 'lines · %'], hot: 1,
  hud: [['PEOPLE', 'nPeople'], ['LARGEST', 'largest', 'ghosts'], ['REPEL', 'repel']],
  design: { minPeople: 2, wander: 0.3, repel: 0.4, personalSpace: 0.9, showShare: true, maxPeople: 24 },
  knobs: [
    { key: 'minPeople', step: 1, min: 1, max: 6, note: 'lines need this many' }, { key: 'wander', step: 0.1, min: 0, max: 2, note: 'walk on your own' },
    { key: 'repel', step: 0.1, min: -1, max: 2, note: 'keep away · negative = come closer' }, { key: 'personalSpace', step: 0.1, min: 0.2, max: 2.5, note: 'units' },
    { key: 'showShare', type: 'bool', note: '% of the square' }, { key: 'maxPeople', step: 1, min: 2, max: 40, note: 'crowd limit' }],
  code: ['<span class="c">// 4) RULES: each person follows only two rules</span>', 'p.v += random() * DESIGN.wander;                <span class="c">// 1) wander a little</span>',
    '<span class="k">for</span> (other <span class="k">of</span> near(p, DESIGN.personalSpace))', '  p.v += away(other) * DESIGN.repel;            <span class="c">// 2) step away from anyone too close</span>', 'owner(cell) = nearest(people, cell);           <span class="c">// border: where the owner changes</span>'],
  tasks: ['Try <b>repel 0</b> with <b>wander 0</b>, then <b>repel 2</b>. Which patterns appear with the same people?', 'Make people attract (<b>repel</b> below zero). Then imagine a threshold: attract from far, push when too close. What forms?', 'Press <b>space</b>: everyone is pushed out from the fountain. How does the pattern rebuild itself?'],
  question: 'What happens when all thirty of you use it at the same time?',
  overlay: { title: 'Boundary Lines', text: 'Click the square to add people. Drag them, double-click to send them home. Nobody draws the borders: each stone belongs to whoever stands nearest.', cta: 'CLICK TO START' },
  view: { at: [0, 0.3, 0.1], zoom: 2.75, pitch: 1.12 },

  make(ctx) {
    const { THREE, D, C, group } = ctx;
    const R = 2.45, FOUNT = 1.08, Y = 0.08, N = 128, CELL = (2 * R) / N;
    const IDS = ['char.towner.a', 'char.towner.b', 'char.towner.c', 'char.baker', 'char.postie', 'char.clown', 'char.zebra', 'char.partycone', 'char.catcoat', 'char.redface', 'char.librarian', 'char.yarncat'];
    const protos = {}; const protoOf = (id) => protos[id] || (protos[id] = (() => { const o = ctx.char(id); return o; })());
    // sınır tuvali: meydanın taşlarının üstüne serilen saydam katman
    const cv = document.createElement('canvas'); cv.width = cv.height = N * 2; const cx = cv.getContext('2d');
    const tex = new THREE.CanvasTexture(cv); tex.colorSpace = THREE.SRGBColorSpace;
    const floor = ctx.mesh(new THREE.CircleGeometry(R + 0.05, 64), ctx.flat('#ffffff', { map: tex, transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -2 }), 0, Y + 0.012, 0, false);
    floor.rotation.x = -Math.PI / 2; floor.userData.noOutline = true; floor.renderOrder = 2; group.add(floor);
    const PS = 0.55, ringGeo = new THREE.RingGeometry(0.15, 0.2, 24); // PS: kasabalıların boyu
    let people = [], dragging = null, lastShares = [], seq = 0, lastDown = 0;
    const owner = new Int16Array(N * N);

    function addPerson(x, z) {
      if (people.length >= D.maxPeople) return null;
      const id = IDS[seq++ % IDS.length], o = protoOf(id), root = o.root.clone(); root.scale.setScalar(PS); root.position.set(x, Y, z); group.add(root);
      const ring = ctx.mesh(ringGeo, ctx.flat('hot'), x, Y + 0.02, z, false); ring.rotation.x = -Math.PI / 2; ring.visible = false; ring.userData.noOutline = true; group.add(ring);
      const p = { x, z, vx: 0, vz: 0, root, ring, held: false, born: ctx.now(), face: Math.random() * 6, step: Math.random() * 6 };
      people.push(p); ctx.patch(root); ctx.flash(2); return p;
    }
    function removePerson(p) { group.remove(p.root); group.remove(p.ring); people = people.filter((q) => q !== p); ctx.flash(2); }
    const personAt = (x, z) => people.find((p) => Math.hypot(p.x - x, p.z - z) < 0.22);
    const clampIn = (p) => { const d = Math.hypot(p.x, p.z) || 1e-6; if (d > R - 0.12) { p.x *= (R - 0.12) / d; p.z *= (R - 0.12) / d; } if (d < FOUNT + 0.1) { p.x *= (FOUNT + 0.1) / d; p.z *= (FOUNT + 0.1) / d; } };

    function move(dt) {
      const k = dt * 60;
      people.forEach((p) => {
        if (p.held) return;
        p.vx += (Math.random() - 0.5) * D.wander * 0.02 * k; p.vz += (Math.random() - 0.5) * D.wander * 0.02 * k;
        people.forEach((o) => { if (o === p) return; const dx = p.x - o.x, dz = p.z - o.z, d = Math.hypot(dx, dz) || 1e-3;
          if (d < D.personalSpace) { const f = D.repel * (1 - d / D.personalSpace) * 0.02 * k; p.vx += dx / d * f; p.vz += dz / d * f; } });
        const dc = Math.hypot(p.x, p.z) || 1e-3; if (dc < FOUNT + 0.3) { p.vx += p.x / dc * 0.01 * k; p.vz += p.z / dc * 0.01 * k; } // çeşmenin çevresinden dolaş
        p.vx *= Math.pow(0.9, k); p.vz *= Math.pow(0.9, k);
        p.x += p.vx * k * 0.35; p.z += p.vz * k * 0.35; clampIn(p);
      });
    }
    // her taş en yakın kişiye aittir; sahibi değişen yerde çizgi (Voronoi)
    function boundaries() {
      const active = people.length >= D.minPeople && people.length > 0;
      cx.clearRect(0, 0, cv.width, cv.height);
      if (!active) return [];
      const area = new Array(people.length).fill(0); let total = 0;
      for (let gy = 0; gy < N; gy++) for (let gx = 0; gx < N; gx++) {
        const x = -R + (gx + 0.5) * CELL, z = -R + (gy + 0.5) * CELL, i = gy * N + gx;
        if (x * x + z * z > R * R) { owner[i] = -1; continue; }
        let best = 0, bd = Infinity; for (let k = 0; k < people.length; k++) { const p = people[k], d = (p.x - x) ** 2 + (p.z - z) ** 2; if (d < bd) { bd = d; best = k; } }
        owner[i] = best; area[best]++; total++;
      }
      cx.fillStyle = ctx.night() ? C.paper : C.ink;
      for (let gy = 0; gy < N; gy++) for (let gx = 0; gx < N; gx++) {
        const i = gy * N + gx; if (owner[i] < 0) continue;
        if ((gx + 1 < N && owner[i + 1] >= 0 && owner[i + 1] !== owner[i]) || (gy + 1 < N && owner[i + N] >= 0 && owner[i + N] !== owner[i])) cx.fillRect(gx * 2, gy * 2, 3, 3);
      }
      tex.needsUpdate = true;
      return area.map((a) => a / total);
    }
    let demoOn = false, nextDemo = 0;
    return {
      start() {
        ctx.hide(11, 12, 13); // meydanın üç kasabalısı: oyunda kalabalığı sen kuruyorsun
        if (!people.length) [[-1.6, 0.4], [1.5, -0.6]].forEach(([x, z]) => addPerson(x, z));
      },
      stop() { dragging = null; },
      begin(e) { if (e) this.pointer('down', e); },
      pointer(type, e) {
        const p = ctx.toLocal(e, Y);
        if (type === 'down') {
          if (!p || Math.hypot(p.x, p.z) > R) return;
          const now = ctx.now() * 1000; if (now - lastDown < 320) { const q = personAt(p.x, p.z); if (q) { removePerson(q); lastDown = 0; return; } } lastDown = now;
          let q = personAt(p.x, p.z); if (!q && Math.hypot(p.x, p.z) > FOUNT) q = addPerson(p.x, p.z);
          if (q) { q.held = true; dragging = q; }
        } else if (type === 'move' && dragging && p) { dragging.x = p.x; dragging.z = p.z; clampIn(dragging); }
        else if (type === 'up' || type === 'leave') { if (dragging) dragging.held = false; dragging = null; }
      },
      key(e, down) {
        if (!down) return false; const k = e.key.toLowerCase();
        if (e.code === 'Space') { e.preventDefault(); people.forEach((p) => { const d = Math.hypot(p.x, p.z) || 1; p.vx += p.x / d * 0.25; p.vz += p.z / d * 0.25; }); ctx.flash(1); return true; } // dağılın!
        if (k === 'x') { people.slice().forEach(removePerson); return true; }
        return false;
      },
      frame(t, dt) {
        if (demoOn && t > nextDemo && people.length < 9) { const a = Math.random() * 6, r = FOUNT + 0.3 + Math.random() * (R - FOUNT - 0.5); addPerson(Math.cos(a) * r, Math.sin(a) * r); nextDemo = t + 1.2; }
        move(dt);
        lastShares = boundaries();
        let n = 0;
        people.forEach((p, i) => {
          const sp = Math.hypot(p.vx, p.vz), u = t - p.born;
          if (sp > 0.002) { const d = Math.atan2(p.vx, p.vz) - p.face; p.face += Math.atan2(Math.sin(d), Math.cos(d)) * Math.min(1, dt * 8); } // yürüdüğü yöne döner
          p.step += sp * 120 * dt;
          // beliriş: yukarıdan düşer, yere değince ezilir (squash) · yürürken küçük zıplama · tutulunca havada sallanır
          const drop = u < 0.25 ? (1 - u / 0.25) ** 2 * 0.6 : 0, land = u >= 0.25 && u < 0.7 ? 1 - 0.25 * Math.exp(-(u - 0.25) * 9) * Math.cos((u - 0.25) * 22) : 1;
          const hop = p.held ? 0.12 + Math.sin(t * 9) * 0.02 : Math.abs(Math.sin(p.step)) * Math.min(0.04, sp * 6);
          p.root.position.set(p.x, Y + drop + hop, p.z); p.root.rotation.y = p.face;
          p.root.scale.set(PS / Math.sqrt(land), PS * land, PS / Math.sqrt(land));
          p.ring.visible = p.held; p.ring.position.set(p.x, Y + 0.02, p.z);
          if (D.showShare && lastShares.length) ctx.tag(n++, Math.round(lastShares[i] * 100) + '%', new THREE.Vector3(p.x, Y + 0.8, p.z), p.held, 0);
        });
        ctx.tagsFrom(n);
      },
      hud: () => ({ nPeople: people.length, largest: lastShares.length ? Math.round(Math.max(...lastShares) * 100) + '%' : '—', repel: D.repel }),
      rule: () => 'nearest(person) owns the stone',
      caption: () => !people.length ? 'Click to add a person.' : people.length < D.minPeople ? 'One person alone: nothing happens.' : 'Nobody drew these lines. They appear between you.',
      status: () => 'people: ' + people.length + ' · lines: ' + (people.length >= D.minPeople ? 'on' : 'off'),
      knob() {},
      demo() { demoOn = true; ctx.playing(true); }
    };
  }
};
