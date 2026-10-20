// Takımada · ada sahnesi kurucusu
// Plan (ada-planlari.js) + kütüphane → three.js sahnesi: arazi, mekânlar, köy evleri, orman, tekneler, kayalar, yolda sakinler,
// gündüz / gece ışıkları ve dönen deniz feneri huzmesi.
// createIslandKit(THREE, { parts, look, yapi }) → { build(plan, pal, {fresh}), bakeItems, applyLights(isl, s, beamDeg), viewFor(isl, key) }
// Ada = arazi (kıyı, tepeler, bölgeler, yollar) + mekânlar + öğeler (ev, ağaç, lamba, tekne, kaya, sakin). Atölye öğeleri tek tek ekler, taşır, siler.

function createIslandKit(THREE, { parts, look, yapi }) {
  const LIB = window.KUTUPHANE;
  const CHARS = Object.fromEntries(LIB.karakterler.map((r) => [r.id, r]));
  const PLACE_REC = Object.fromEntries(LIB.mekanlar.map((m) => [m.place, m]));
  const FP = Object.fromEntries(LIB.mekanlar.map((m) => [m.place, m.footprint]));
  const cache = {};

  function waveTex(C, sea) {
    const cv = document.createElement('canvas'); cv.width = cv.height = 256; const x = cv.getContext('2d');
    x.fillStyle = sea; x.fillRect(0, 0, 256, 256); x.strokeStyle = C.paper; x.lineWidth = 6; x.lineCap = 'round';
    for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { x.beginPath(); x.arc(c * 64 + (r % 2) * 32 + 32, r * 64 + 40, 18, Math.PI * 1.15, Math.PI * 1.85); x.stroke(); }
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(40, 40); return t;
  }
  function mkTree(C, h, cone, pat) {
    const g = new THREE.Group(), M = (o) => new THREE.MeshToonMaterial(o);
    const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.08, 0.5, 8), M({ color: C.wood })); trunk.position.y = 0.25; g.add(trunk);
    const tex = parts.texFrom(parts.patternCanvas(pat[0], pat[1].map((k) => C[k] || k)), [3, 2]);
    const crown = cone ? new THREE.Mesh(new THREE.ConeGeometry(h * 0.28, h, 24), M({ map: tex }))
                       : new THREE.Mesh(new THREE.LatheGeometry([[0, 0], [h * 0.22, h * 0.08], [h * 0.27, h * 0.3], [h * 0.17, h * 0.64], [0, h]].map(([a, b]) => new THREE.Vector2(a, b)), 24), M({ map: tex }));
    crown.position.y = cone ? 0.45 + h / 2 : 0.4; g.add(crown);
    g.traverse((o) => { if (o.isMesh) o.castShadow = o.receiveShadow = true; }); return g;
  }
  function houseRecipe(i, w, d, h) {
    const walls = [['paper', 'ink', 'cool', 'hot'], ['pink', 'ink', 'paper', 'green'], ['warm', 'ink', 'paper', 'ink'], ['paper', 'cool', 'paper', 'ink'], ['cool', 'paper', 'paper', 'warm']][i % 5];
    const roofs = [['ink', 'paper'], ['hot', 'paper'], ['ink', 'warm'], ['cool', 'paper'], ['paper', 'ink']][i % 5];
    return { id: 'filler.house.' + i, parts: [
      { type: 'box', size: [w, h, d], at: [0, h / 2, 0], paint: { pattern: 'window', colors: walls } },
      { type: 'gable', w: w + 0.16, d: d + 0.16, at: [0, h, 0], paint: { pattern: 'stripe', colors: roofs, repeat: [1, 3] } },
      { type: 'box', size: [0.14, 0.42, 0.14], at: [w * 0.25, h + 0.32, -d * 0.15], paint: { color: roofs[0] } } ] };
  }

  const LAMP_REC = { id: 'filler.lamp', parts: [
    { type: 'cyl', r: 0.035, h: 1.3, at: [0, 0.65, 0], paint: { color: 'ink' } },
    { type: 'box', size: [0.18, 0.22, 0.18], at: [0, 1.4, 0], paint: { color: 'paper' }, emit: 0.6 },
    { type: 'cone', r: 0.16, h: 0.12, seg: 4, at: [0, 1.57, 0], rot: [0, Math.PI / 4, 0], paint: { color: 'ink' } } ] };
  const BOAT_REC = { id: 'filler.boat', parts: [
    { type: 'box', size: [0.55, 0.22, 1.1], at: [0, 0.11, 0], paint: { pattern: 'stripe', colors: ['paper', 'hot'], repeat: [1, 2] } },
    { type: 'cone', r: 0.28, h: 0.4, seg: 4, at: [0, 0.11, 0.72], rot: [Math.PI / 2, Math.PI / 4, 0], scale: [1, 1, 0.55], paint: { color: 'hot' } },
    { type: 'cyl', r: 0.02, h: 0.9, at: [0, 0.6, 0], paint: { color: 'ink' } }, { type: 'cone', r: 0.3, h: 0.7, seg: 3, at: [0.12, 0.65, 0], rot: [0, 0, -Math.PI / 2], scale: [1, 1, 0.1], paint: { color: 'paper' } } ] };
  const inPoly = (poly, x, q) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, zi] = poly[i], [xj, zj] = poly[j]; if ((zi > q) !== (zj > q) && x < (xj - xi) * (q - zi) / (zj - zi) + xi) c = !c; } return c; };
  const r3 = (v) => Math.round(v * 1000) / 1000;

  // ---- Öğeler (atölyenin düzenlediği birimler) ----
  // { kind: 'house', at: [x, z], rot, v, c?, w?, d?, h? }   v: eski çeşit numarası; c renk takımı (0–4), w/d/h boyut
  // { kind: 'tree', at, rot, h, cone, pat: [desen, [rol, rol]] }
  // { kind: 'lamp', at } · { kind: 'boat', at, rot } · { kind: 'rock', at, s }
  // { kind: 'resident', id, at, rot, home, night? }
  // Planda `items` yoksa eski alanlardan (houses, boats, rocks, orman bölgeleri, yollar, kadro) aynı tohumla üretilir:
  // böylece atölyenin ilk açılışı oyundaki adanın birebir aynısıdır.
  function bakeItems(plan, terrain) {
    const items = [], places = Object.entries(plan.places).filter(([k]) => PLACE_REC[k]).map(([k, p]) => ({ key: k, x: p.at[0], z: p.at[1], fp: FP[k] || 2.3 }));
    plan.houses.forEach(([x, z, r], i) => items.push({ kind: 'house', at: [x, z], rot: r, v: i }));
    let seed = 17; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const nearPlace = (x, q, pad) => places.some((p) => Math.hypot(p.x - x, p.z - q) < p.fp + pad);
    const nearHouse = (x, q, r) => plan.houses.some(([hx, hz]) => Math.hypot(hx - x, hz - q) < r);
    terrain.zones.filter((z) => z.kind === 'forest').forEach((z) => {
      const xs = z.poly.map((p) => p[0]), zs = z.poly.map((p) => p[1]); let n = 0, guard = 0;
      while (n < (z.src.trees || 40) && guard++ < 3000) {
        const x = Math.min(...xs) + rnd() * (Math.max(...xs) - Math.min(...xs)), q = Math.min(...zs) + rnd() * (Math.max(...zs) - Math.min(...zs));
        if (!inPoly(z.poly, x, q) || nearPlace(x, q, 0.3)) continue;
        const h = 1.2 + rnd() * 0.9, cone = rnd() > 0.4, pat = rnd() > 0.5 ? ['diag', ['green', 'ink']] : ['fur', ['ink', 'paper']];
        items.push({ kind: 'tree', at: [r3(x), r3(q)], rot: r3(rnd() * 6), h: r3(h), cone, pat }); n++;
      }
    });
    for (let k = 0, guard = 0; k < 26 && guard < 2000; guard++) {
      const x = terrain.bounds.x0 + rnd() * (terrain.bounds.x1 - terrain.bounds.x0), q = terrain.bounds.z0 + rnd() * (terrain.bounds.z1 - terrain.bounds.z0);
      if (!terrain.inside(x, q) || terrain.heightAt(x, q) < 0.4 || nearPlace(x, q, 0.4) || nearHouse(x, q, 1.0)) continue;
      const h = 0.9 + rnd() * 0.7, cone = rnd() > 0.5, pat = rnd() > 0.5 ? ['stripe', ['green', 'ink']] : ['dots', ['green', 'paper']];
      items.push({ kind: 'tree', at: [r3(x), r3(q)], rot: 0, h: r3(h), cone, pat }); k++;
    }
    (plan.boats || []).forEach(([x, z, r]) => items.push({ kind: 'boat', at: [x, z], rot: r }));
    (plan.rocks || []).forEach(([x, z], i) => items.push({ kind: 'rock', at: [x, z], s: 0.5 + (i % 3) * 0.15 }));
    // sokak lambaları: yolların kenarında düzenli aralıkla
    const lamps = [];
    plan.paths.forEach((p) => {
      const pts = terrain.smoothOpen(p.pts, 16), stepL = p.kind === 'road' ? 3.0 : 3.8; let acc = stepL * 0.5, side = 1;
      for (let i = 1; i < pts.length; i++) {
        const [x0, z0] = pts[i - 1], [x1, z1] = pts[i], L = Math.hypot(x1 - x0, z1 - z0); acc += L;
        if (acc < stepL) continue; acc = 0; side = -side;
        const nx = -(z1 - z0) / L, nz = (x1 - x0) / L, off = p.kind === 'road' ? 0.7 : 0.45, x = x1 + nx * off * side, z = z1 + nz * off * side;
        if (!terrain.inside(x, z) || terrain.heightAt(x, z) < 0.25 || nearPlace(x, z, 0.1) || nearHouse(x, z, 0.8) || lamps.some(([a, b]) => Math.hypot(a - x, b - z) < 2.2)) continue;
        lamps.push([x, z]); items.push({ kind: 'lamp', at: [r3(x), r3(z)] });
      }
    });
    // kadro: ada sakinleri yaşam alanlarına (kutuphane/kadro.js)
    const taken = [];
    const free = (x, q) => terrain.inside(x, q) && !nearPlace(x, q, 0.25) && !nearHouse(x, q, 0.9) && !taken.some(([a, b]) => Math.hypot(a - x, b - q) < 0.8);
    function spot(home) {
      for (let g = 0; g < 600; g++) {
        let x, q;
        if (home.startsWith('near:')) { const p = places.find((pp) => pp.key === home.slice(5)); if (!p) break; const a = rnd() * Math.PI * 2, r = p.fp + 0.5 + rnd() * 1.3; x = p.x + Math.cos(a) * r; q = p.z + Math.sin(a) * r; }
        else if (home === 'coast') { const c = terrain.coast[Math.floor(rnd() * terrain.coast.length)]; x = c[0] * 0.9; q = c[1] * 0.9; if (terrain.heightAt(x, q) > 0.5) continue; }
        else { const zn = terrain.zones.find((z) => z.kind === home); if (!zn) break; const xs = zn.poly.map((p) => p[0]), zs = zn.poly.map((p) => p[1]); x = Math.min(...xs) + rnd() * (Math.max(...xs) - Math.min(...xs)); q = Math.min(...zs) + rnd() * (Math.max(...zs) - Math.min(...zs)); if (!inPoly(zn.poly, x, q)) continue; }
        if (free(x, q)) { taken.push([x, q]); return [x, q]; }
      }
      return null;
    }
    (LIB.kadro ? LIB.kadro.residents : []).forEach((k) => {
      if (!CHARS[k.id]) return; const at = spot(k.home); if (!at) return;
      const it = { kind: 'resident', id: k.id, at: [r3(at[0]), r3(at[1])], rot: r3(rnd() * 6), home: k.home }; if (k.night) it.night = true; items.push(it);
    });
    return items;
  }

  // Tek öğenin 3B nesnesi → { root, o (karakterse), anims }
  function makeItem(it, C, makeChar) {
    if (it.kind === 'house') {
      const v = it.v || 0, w = it.w || 0.9 + (v % 3) * 0.2, d = it.d || 0.8, h = it.h || 0.7 + (v % 2) * 0.2, s = yapi.build(houseRecipe(it.c ?? v, w, d, h), C, makeChar);
      // baca dumanı: her iki evden birinde; kâğıt renkli öbekler yükselir, rüzgârla sürüklenir, büyüyüp söner
      if ((v + (it.c || 0)) % 2 === 0) {
        const pm = smokeMat || (smokeMat = new THREE.MeshToonMaterial({ color: C.paper, gradientMap: parts.LAMBERT })), sg = new THREE.SphereGeometry(0.085, 10, 8);
        const top = new THREE.Vector3(w * 0.25, h + 0.56, -d * 0.15), rot = it.rot || 0, wx = Math.cos(rot) * 0.94 + Math.sin(rot) * 0.33, wz = -Math.sin(rot) * 0.94 + Math.cos(rot) * 0.33, ph = (it.at[0] * 0.37) % 1;
        const puffs = Array.from({ length: 4 }, () => { const m = new THREE.Mesh(sg, pm); m.castShadow = false; s.root.add(m); return m; });
        s.anims.push((t) => puffs.forEach((m, i) => { const u = (t * 0.28 + i / 4 + ph) % 1; m.position.set(top.x + wx * u * 0.55, top.y + u * 0.9, top.z + wz * u * 0.55); m.scale.setScalar(Math.sin(u * Math.PI) * (0.6 + u * 1.2) + 0.05); }));
      }
      return { root: s.root, anims: s.anims };
    }
    if (it.kind === 'tree') { const tr = mkTree(C, it.h || 1.4, !!it.cone, it.pat || ['diag', ['green', 'ink']]), crown = tr.children[1], ph = (it.at[0] * 1.3 + it.at[1] * 0.7) % 6;
      return { root: tr, anims: [(t) => { const g = 0.5 + 0.5 * Math.sin(t * 0.9 + it.at[0] * 0.25); crown.rotation.z = Math.sin(t * 1.7 + ph) * 0.025 * (0.4 + g); crown.rotation.x = Math.cos(t * 1.3 + ph) * 0.018 * (0.4 + g); }] }; }
    if (it.kind === 'lamp') return { root: yapi.build(LAMP_REC, C, makeChar).root, anims: [] };
    if (it.kind === 'boat') { const b = yapi.build(BOAT_REC, C, makeChar).root, hull = new THREE.Group(); hull.add(b); const ph = it.at[0] * 0.7;
      return { root: hull, anims: [(t) => { b.position.y = Math.sin(t * 1.4 + ph) * 0.035; b.rotation.z = Math.sin(t * 1.1 + ph) * 0.05; b.rotation.x = Math.cos(t * 0.9 + ph) * 0.03; }] }; }
    if (it.kind === 'rock') { const g = new THREE.Group(), m = new THREE.Mesh(new THREE.DodecahedronGeometry(it.s || 0.6, 0), new THREE.MeshToonMaterial({ color: C.mid })); m.scale.y = 0.6; m.castShadow = m.receiveShadow = true; g.add(m); return { root: g, anims: [] }; }
    if (it.kind === 'resident') { const o = makeChar(it.id); o.root.scale.multiplyScalar(0.85); return { root: o.root, o, anims: [] }; }
    return { root: new THREE.Group(), anims: [] };
  }
  function itemY(it, terrain) {
    const [x, z] = it.at, h = terrain.heightAt(x, z);
    if (it.kind === 'boat') return terrain.sea;
    if (it.kind === 'rock') return Math.max(terrain.sea + 0.1, h + 0.05);
    if (it.kind === 'tree') return h - 0.05;
    if (it.kind === 'resident') return h;
    return h - 0.02;
  }

  // opts.fresh: önbelleği atla (atölye arazi değişince yeniden kurar)
  let smokeMat = null;
  function build(plan, pal, opts = {}) {
    const key = plan.id + pal; if (!opts.fresh && cache[key]) return cache[key];
    const C = look.rolesOf(look.PALS[pal]);
    const seaC = C[look.PALS[pal].sea] || C.cool; // 1-bit'te deniz gri (noktalı), renkli paletlerde mavi
    const terrain = createTerrain(THREE, plan, { C, footprints: FP, seaColor: seaC, waveTex: waveTex(C, seaC) });
    const scene = new THREE.Scene(), root = new THREE.Group(); scene.add(root); root.add(terrain.group);
    terrain.group.userData.terrain = true;
    const anims = [], chars = [], places = [];
    const makeChar = (id) => parts.build(CHARS[id], C);
    Object.entries(plan.places).forEach(([k, p]) => {
      const rec = PLACE_REC[k]; if (!rec) return;
      const s = yapi.build(rec, C, makeChar);
      const y = p.water ? terrain.sea - 0.02 : terrain.heightAt(p.at[0], p.at[1]) - 0.02;
      s.root.position.set(p.at[0], y, p.at[1]); s.root.rotation.y = -(p.rot || 0); s.root.userData.place = k;
      root.add(s.root); anims.push(...s.anims); chars.push(...s.chars);
      places.push({ key: k, rec, pos: new THREE.Vector3(p.at[0], y, p.at[1]), s });
    });

    const day = new THREE.Group(), night = new THREE.Group(); scene.add(day, night);
    const residents = [], nightOnly = [], entries = [], lampLights = [], lampGlass = new Set();
    const isl = { scene, root, terrain, anims, chars, places, residents, nightOnly, entries, lampLights, lampGlass, day, night, C, plan };
    // ağaç ve sakin dönüşü doğrudan, yapılarınki planlardaki gibi ters işaretli
    function seat(e) { e.root.position.set(e.it.at[0], itemY(e.it, terrain), e.it.at[1]); e.root.rotation.y = (e.it.kind === 'resident' || e.it.kind === 'tree' ? 1 : -1) * (e.it.rot || 0); }
    function addItem(it) {
      const m = makeItem(it, C, makeChar), e = { it, root: m.root, o: m.o, anims: m.anims };
      e.root.userData.entry = e; seat(e); root.add(e.root); entries.push(e); anims.push(...m.anims);
      if (m.o) { chars.push(m.o); residents.push({ id: it.id, home: it.home, o: m.o, entry: e }); if (it.night) nightOnly.push(e.root); }
      if (isl.ready) look.patchObject(e.root);
      return e;
    }
    function removeItem(e) {
      root.remove(e.root); entries.splice(entries.indexOf(e), 1);
      e.anims.forEach((f) => anims.splice(anims.indexOf(f), 1));
      if (e.o) { chars.splice(chars.indexOf(e.o), 1); residents.splice(residents.findIndex((r) => r.entry === e), 1); const n = nightOnly.indexOf(e.root); if (n >= 0) nightOnly.splice(n, 1); }
    }
    // ışık yalnız lamba camlarına (0.18'lik ışıklı kutu: sokak lambaları + mekânlardaki fenerler); XZ'de birbirine yakın olanlar tek ışık
    function relight() {
      lampLights.splice(0).forEach((l) => night.remove(l)); root.updateMatrixWorld(true);
      lampGlass.clear();
      root.traverse((m) => { const g = m.geometry && m.geometry.parameters; if (!m.isMesh || !g || g.width !== 0.18 || !(m.userData.lampGlass || m.material.emissiveIntensity >= 0.5)) return;
        m.userData.lampGlass = true; lampGlass.add(m.material);
        const p = new THREE.Vector3(); m.getWorldPosition(p); if (lampLights.some((l) => Math.hypot(l.position.x - p.x, l.position.z - p.z) < 0.5) || lampLights.length >= 40) return; // her lamba kendi ışığını alır
        const l = new THREE.PointLight(0xffe6b0, 2.4, 3.2, 1.2); l.position.copy(p); night.add(l); lampLights.push(l); });
    }
    Object.assign(isl, { seat, addItem, removeItem, relight, itemY: (it) => itemY(it, terrain), items: () => entries.map((e) => e.it) });
    (plan.items || bakeItems(plan, terrain)).forEach((it) => addItem(JSON.parse(JSON.stringify(it))));

    const hemi = new THREE.HemisphereLight(0xffffff, 0xe0e0e0, 2.1); day.add(hemi);
    const sun = new THREE.DirectionalLight(0xffffff, 1.3); sun.castShadow = true; Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 120 }); sun.shadow.mapSize.set(2048, 2048); sun.shadow.bias = -0.0004; day.add(sun, sun.target);
    night.add(new THREE.HemisphereLight(0xffffff, 0x888888, 0.35));
    const moon = new THREE.DirectionalLight(0xffffff, 0.9); moon.castShadow = true; Object.assign(moon.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 120 }); moon.shadow.mapSize.set(2048, 2048); night.add(moon, moon.target);
    relight();
    const hub = places.find((p) => p.key === 'hub'), lampPos = hub.pos.clone().add(new THREE.Vector3(0, 3.62, 0));
    const beam = new THREE.SpotLight(0xffffff, 60, 30, 0.16, 0.45, 1.0); beam.position.copy(lampPos); beam.castShadow = true; beam.shadow.mapSize.set(1024, 1024); beam.shadow.bias = -0.0006; beam.shadow.camera.near = 0.5; night.add(beam, beam.target);
    const coneGeo = new THREE.ConeGeometry(1, 1, 32, 1, true); coneGeo.translate(0, -0.5, 0); coneGeo.rotateX(-Math.PI / 2);
    const coneMat = new THREE.MeshBasicMaterial({ color: C.warm, transparent: true, opacity: 0.18, depthWrite: false, side: THREE.DoubleSide, blending: THREE.AdditiveBlending }); coneMat.userData.noAtlas = true;
    const cone = new THREE.Mesh(coneGeo, coneMat); cone.userData.noOutline = true; cone.position.copy(lampPos); night.add(cone);
    // bulutlar: konturlu, içi kâğıt, altı (gölge tarafı) baskıda taranır; rüzgârla kayar, gölgeleri adanın üstünden geçer.
    // Yalnız 3. şahıs kamerada görünür (oyun.js açar): kuş bakışında adayı örtmesin.
    const clouds = new THREE.Group(); clouds.visible = false; scene.add(clouds);
    const cm = new THREE.MeshToonMaterial({ color: C.paper, gradientMap: parts.LAMBERT });
    let cs = 5; const crnd = () => (cs = (cs * 16807) % 2147483647) / 2147483647;
    for (let k = 0; k < 8; k++) {
      const c = new THREE.Group(), n = 3 + Math.floor(crnd() * 4), w = 1.6 + crnd() * 1.8;
      for (let i = 0; i < n; i++) { const r = 0.55 + crnd() * 0.6, m = new THREE.Mesh(new THREE.SphereGeometry(r, 18, 12), cm);
        m.position.set((i / Math.max(1, n - 1) - 0.5) * w * 1.6, (crnd() - 0.3) * 0.35 + (i % 2) * 0.25, (crnd() - 0.5) * 0.9); m.scale.y = 0.62; m.castShadow = true; c.add(m); }
      const sx = (crnd() - 0.5) * 50, sz = (crnd() - 0.5) * 40, y = 6.5 + crnd() * 2.5, sp = 0.25 + crnd() * 0.2;
      c.position.set(sx, y, sz); clouds.add(c);
      anims.push((t) => { const u = ((sx + 25 + t * sp * 0.94) % 50 + 50) % 50 - 25, v = sz + t * sp * 0.33; c.position.set(u, y, ((v + 20) % 40 + 40) % 40 - 20); });
    }
    // bayraklar: mekânlarda direk + rüzgâr yönünde dalgalanan bez (kumaş deseni Montour renkleri)
    const WIND = new THREE.Vector2(0.94, 0.33).normalize(), windYaw = Math.atan2(WIND.x, WIND.y) - Math.PI / 2;
    const FLAGS = [['hub', 1.1, -0.9, 2.2, 'hot'], ['04', -2.05, -3.0, 1.6, 'warm'], ['04', 2.05, -3.0, 1.6, 'cool'], ['07', 1.9, 1.6, 1.9, 'pink'], ['08', -1.4, 0.95, 1.6, 'green'], ['06', -1.4, 0.9, 1.7, 'hot'], ['03', -0.85, 0.85, 1.4, 'cool']];
    const flagMats = {}, flagPoles = [];
    FLAGS.forEach(([k, lx, lz, h, col], fi) => {
      const pl = places.find((q) => q.key === k); if (!pl) return;
      const w = pl.s.root.localToWorld(new THREE.Vector3(lx, 0, lz)), gy = pl.pos.y + (k === '04' ? 0.43 : 0);
      const pole = new THREE.Group(); pole.position.set(w.x, gy, w.z); root.add(pole); flagPoles.push([w.x, w.z]);
      const mp = new THREE.MeshToonMaterial({ color: C.ink, gradientMap: parts.LAMBERT });
      const stick = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, h, 6), mp); stick.position.y = h / 2; stick.castShadow = true; pole.add(stick);
      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), mp); knob.position.y = h + 0.02; pole.add(knob);
      const fm = flagMats[col] || (flagMats[col] = new THREE.MeshToonMaterial({ map: parts.texFrom(parts.patternCanvas('stripe', [C[col], C.paper]), [1, 1]), side: THREE.DoubleSide, gradientMap: parts.LAMBERT }));
      const geo = new THREE.PlaneGeometry(0.62, 0.36, 10, 2); geo.translate(0.31, 0, 0);
      const cloth = new THREE.Mesh(geo, fm); cloth.position.y = h - 0.2; cloth.rotation.y = windYaw; cloth.castShadow = true; pole.add(cloth);
      const pos = geo.attributes.position, base = Float32Array.from(pos.array);
      anims.push((t) => { // bez: direkten uzaklaştıkça artan dalga (dalga rüzgârla akar), uç biraz sarkar
        for (let i = 0; i < pos.count; i++) { const x = base[i * 3], y = base[i * 3 + 1], k2 = x / 0.62;
          pos.array[i * 3 + 2] = Math.sin(x * 9 - t * 6.5 + fi) * 0.055 * k2 + Math.sin(x * 5 - t * 3.1 + fi * 2) * 0.03 * k2;
          pos.array[i * 3 + 1] = y - k2 * k2 * 0.05 * (0.6 + 0.4 * Math.sin(t * 1.3 + fi)); }
        pos.needsUpdate = true; geo.computeVertexNormals(); });
    });
    // martılar: adanın üstünde geniş halkalar çizer; kanat çırpar, arada süzülür (iki kanat + gövde, mürekkep)
    const birds = new THREE.Group(); scene.add(birds);
    const bm = new THREE.MeshToonMaterial({ color: C.paper, gradientMap: parts.LAMBERT }), bInk = new THREE.MeshToonMaterial({ color: C.ink, gradientMap: parts.LAMBERT });
    const wingGeo = new THREE.BoxGeometry(0.32, 0.015, 0.09); wingGeo.translate(0.16, 0, 0);
    for (let k = 0; k < 9; k++) {
      const b = new THREE.Group(), body = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), bm); body.scale.set(0.8, 0.7, 1.8); b.add(body);
      const tip = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.016, 0.06), bInk); tip.position.set(0, 0, -0.03);
      const wl = new THREE.Group(), wr = new THREE.Group(); [wl, wr].forEach((wg, s) => { const m = new THREE.Mesh(wingGeo, bm); wg.add(m); /* gölge yok: kanat gölgesi çimende uzun şerit gibi duruyordu */ const tp = tip.clone(); tp.position.x = 0.3; wg.add(tp); if (s) wg.rotation.y = Math.PI; b.add(wg); });
      b.scale.setScalar(2.2); birds.add(b); // uzaktan da okunsun
      const grp = k < 5 ? 0 : 1, cx = grp ? 3.5 : -4.5, cz = grp ? 4.5 : -1, R = 3.2 + (k % 3) * 1.1, hgt = 4.0 + (k % 4) * 0.45, sp = 0.35 + (k % 3) * 0.06, ph = k * 1.3;
      anims.push((t) => {
        const a = t * sp + ph, x = cx + Math.cos(a) * R * (1 + 0.25 * Math.sin(a * 0.5)), z = cz + Math.sin(a) * R;
        b.position.set(x, hgt + Math.sin(t * 0.7 + ph) * 0.3, z); b.rotation.set(0, -a, Math.sin(a * 0.5) * 0.25 + 0.2);
        const glide = Math.sin(t * 0.4 + ph) > 0.3, f = glide ? 0.12 : Math.sin(t * 9 + ph) * 0.6; wl.rotation.z = f; wr.rotation.z = -f;
      });
    }
    scene.userData.nature = { tex: terrain.depthTex, b: terrain.bounds }; scene.userData.natureGroup = terrain.group; // görünüm motoru: doğa ayrı normal geçişi
    look.patchObject(scene); isl.ready = true;
    Object.assign(isl, { hemi, sun, moon, beam, cone, lampPos, clouds, birds, flagPoles });
    return (cache[key] = isl);
  }

  // s: { time, az, el, sunI, amb, moonI, lampI, beamOn, beamCone, beamShadow, bWidth, bPow, bTilt, bRange }
  function applyLights(isl, s, beamDeg) {
    const a = s.az * Math.PI / 180, e = s.el * Math.PI / 180, dir = new THREE.Vector3(Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)).multiplyScalar(60);
    isl.day.visible = s.time === 'day'; isl.night.visible = s.time === 'night';
    (isl.nightOnly || []).forEach((r) => { r.visible = s.time === 'night'; });
    isl.sun.position.copy(dir); isl.moon.position.copy(dir); isl.hemi.intensity = s.amb; isl.sun.intensity = s.sunI; isl.moon.intensity = s.moonI;
    isl.lampLights.forEach((l) => { l.intensity = s.lampI; if (s.lampR) l.distance = s.lampR; });
    const nightOn = s.time === 'night';
    if (isl.nightOn !== nightOn) { // gece / gündüz geçişinde bir kez: pencereler ve lamba camları
      isl.nightOn = nightOn;
      if (!isl.windowMats) { isl.windowMats = new Set(); isl.scene.traverse((o) => { if (o.material && o.material.userData && o.material.userData.window) isl.windowMats.add(o.material); }); }
      isl.windowMats.forEach((m) => { m.emissiveIntensity = nightOn ? (s.windowGlow ?? 1.1) : 0; });
      isl.lampGlass.forEach((m) => { if (!m.userData.dayEmit) { m.userData.dayEmit = '#' + m.emissive.getHexString(); m.userData.dayI = m.emissiveIntensity; } m.emissive.set(nightOn ? '#ffc86a' : m.userData.dayEmit); m.emissiveIntensity = nightOn ? 1.4 : m.userData.dayI; });
    }
    const th = beamDeg * Math.PI / 180, dirB = new THREE.Vector3(Math.cos(th), -s.bTilt, Math.sin(th)).normalize();
    const b = isl.beam; b.visible = !!s.beamOn; b.intensity = s.bPow; b.angle = s.bWidth; b.distance = s.bRange; b.castShadow = !!s.beamShadow;
    b.target.position.copy(isl.lampPos).addScaledVector(dirB, 10); b.target.updateMatrixWorld();
    const cn = isl.cone; cn.visible = !!(s.beamOn && s.beamCone); const len = s.bRange * 0.6, rad = Math.tan(s.bWidth) * len;
    cn.scale.set(rad, rad, len); cn.lookAt(isl.lampPos.clone().add(dirB));
  }
  function viewFor(isl, v) {
    const P = (k) => { const p = isl.places.find((q) => q.key === k); return p ? p.pos : new THREE.Vector3(); };
    if (v === 'top') return { c: new THREE.Vector3(0, 0, 0), yaw: 0, pitch: Math.PI / 2 - 0.001, half: 13.5 };
    if (v === 'bay') { const p = P('04'); return { c: new THREE.Vector3(p.x, 0.6, p.z - 0.5), yaw: 0.35, pitch: 0.42, half: 5.2 }; }
    if (v === 'village') { const p = P('07'); return { c: new THREE.Vector3(p.x + 0.8, p.y + 0.8, p.z + 0.6), yaw: 0.9, pitch: 0.5, half: 5.6 }; }
    if (v === 'light') { const p = P('hub'); return { c: new THREE.Vector3(p.x, p.y + 1.6, p.z), yaw: -0.5, pitch: 0.38, half: 4.6 }; }
    return { c: new THREE.Vector3(-0.5, 0.6, 0.8), yaw: 0.55, pitch: 0.72, half: 11.2 };
  }
  return { build, bakeItems, makeItem, applyLights, viewFor, CHARS, PLACE_REC, FP, HOUSE_COLORS: 5 };
}
