// Interaction Island · C2 Ferah Koy · Montour
// Girdi: WASD/oklar yürü · Q/E döndür · 1–8 mekâna uç · ↵ gir (oyun mekânın içinde açılır) · N gece/gündüz · Esc genel bakış
// Durum: mod, kamera, gezgin, yakın mekân, yanan mekânlar, sakinlerin yürüyüşü
// Çıktı: kütüphane → ada sahnesi → Montour görünüm motoru (desen atlası + kontur) → tuval; DOM işaretleri ve kart
// URL: ?mode=day|night &walk=1|x,z &select=07 &game=01…08 &demo=1 (04) &q=0.5..1 (çizim kalitesi) &plan=plan.c2 &draft=1 (atölye taslağı)

function startC2(THREE) {
  const params = new URLSearchParams(location.search);
  const store = {
    get(k, f) { try { return JSON.parse(localStorage.getItem(k)) ?? f; } catch { return f; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };
  const LIB = window.KUTUPHANE, ST = LIB.stil;
  const DPR = Math.min(2, devicePixelRatio || 1), Q0 = Number(params.get('q') || (DPR > 1 ? 0.6 : 0.85)); // çizim kalitesi (performans)
  let Q = Q0; const autoQ = !params.has('q'); let frameMs = 16; // uyarlanır çözünürlük: kare yavaşlarsa çizim ölçeği düşer, hızlanınca geri çıkar

  const ui = {
    mode: params.get('mode') || store.get('ada-mode', 'day'),
    lit: params.has('lit') ? params.get('lit').split(',').filter(Boolean) : store.get('ada-lit', []),
    yaw: 0.55, targetYaw: 0.55, zk: 1, tzk: 1, // zk: fare tekerleği yakınlaştırması (çarpan)
    avatar: null, walking: false, near: null, selected: null, inGame: false
  };
  const HREF = { '01': '../vaatler/01-agency/index.html', '02': '../vaatler/02-reciprocity/index.html', '03': '../vaatler/03-feedback/index.html', '05': '../vaatler/05-possibility/index.html',
                 '06': '../vaatler/06-context/index.html', '07': '../vaatler/07-emergence/index.html', '08': '../vaatler/08-intervention/index.html' };
  const KEYS = ['01', '02', '03', '04', '05', '06', '07', '08'];
  const placesToggle = document.getElementById('placesToggle'), placesPanel = document.getElementById('placesPanel');
  function setPlaces(open) {
    placesPanel.hidden = !open;
    placesToggle.setAttribute('aria-expanded', String(open));
    document.getElementById('placesChevron').textContent = open ? '−' : '+';
    store.set('ada-places-open', open);
  }
  setPlaces(store.get('ada-places-open', !matchMedia('(max-width: 900px)').matches));
  placesToggle.addEventListener('click', () => setPlaces(placesPanel.hidden));
  // Alt ve üst araçların gerçek boyutu: metin büyütme ve ekran döndürme dahil.
  const dock = document.querySelector('.bottom-dock'), toolbar = document.getElementById('gameToolbar');
  const layout = () => {
    document.documentElement.style.setProperty('--dock-height', dock.getBoundingClientRect().height + 'px');
    document.documentElement.style.setProperty('--toolbar-bottom', toolbar.getBoundingClientRect().bottom + 'px');
    document.documentElement.style.setProperty('--places-top', Math.max(document.querySelector('.brand').getBoundingClientRect().bottom, document.querySelector('.mode').getBoundingClientRect().bottom) + 12 + 'px');
  };
  new ResizeObserver(layout).observe(dock);
  new ResizeObserver(layout).observe(toolbar);
  new ResizeObserver(layout).observe(document.querySelector('.brand'));
  new ResizeObserver(layout).observe(document.querySelector('.mode'));
  addEventListener('resize', layout); layout();

  // ---- Motorlar ----
  // ana tuval = WebGL tuvali (ara kopya yok); kimliği ve erişilebilirlik adı korunur
  const renderer = new THREE.WebGLRenderer({ antialias: false });
  const out = renderer.domElement, fx0 = document.getElementById('fx');
  out.id = 'fx'; out.setAttribute('aria-label', fx0.getAttribute('aria-label') || 'Interaction Island'); fx0.replaceWith(out);
  out.tabIndex = 0;
  out.addEventListener('webglcontextlost', (e) => { e.preventDefault(); window.islandLoadError(); });
  renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const parts = createParts(THREE, renderer), look = createLook(THREE, renderer), yapi = createStructures(THREE, parts);
  const kit = createIslandKit(THREE, { parts, look, yapi });
  // Ada verisi: ?draft=1 → atölyenin tarayıcı taslağı; yoksa atölyenin kaydettiği ada (adalar/*.js); yoksa plan kütüphanesi
  const planId = params.get('plan') || 'plan.c2';
  const draft = params.get('draft') ? store.get('atolye-taslak:' + planId, null) : null;
  const PLAN = draft || (LIB.adalar && LIB.adalar[planId]) || LIB.adaPlanlari.find((p) => p.id === planId);
  const isl = kit.build(PLAN, ST.palette);
  const scene = isl.scene, C = isl.C, T = isl.terrain;
  const S = Object.assign({}, look.DEFAULTS, { t: ST.thresholds.slice(), time: ui.mode,
    az: ST.light.azimuth, el: ST.light.elevation, sunI: ST.light.sun, amb: ST.light.ambient, moonI: ST.light.moon, lampI: ST.light.streetLamps, lampR: ST.light.lampRange || 3.2, nT: ST.nightThresholdFactor,
    beamOn: ST.beacon.on ? 1 : 0, beamCone: ST.beacon.cone ? 1 : 0, beamShadow: ST.beacon.shadow ? 1 : 0, bWidth: ST.beacon.width, bPow: ST.beacon.power, bTilt: ST.beacon.tilt, bRange: ST.beacon.range });
  S.paint = params.has('paint') ? Number(params.get('paint')) : ((ST.view && ST.view.paint) ?? 0); // 0 Montour gravür · 1 Boya · 2 Baskı (varsayılan: stil)
  if (params.has('hatch')) S.hatch = Number(params.get('hatch')); if (params.has('hand')) S.hand = Number(params.get('hand')); // el çizimi miktarı (0 = mekanik)
  if (params.get('pt')) S.pt = params.get('pt').split(',').map(Number);
  ['dark', 'oc', 'nT', 'moonI', 'lampI', 'lampR', 'unify'].forEach((k) => { if (params.has(k)) S[k] = (k === 'dark' || k === 'oc') ? params.get(k) : Number(params.get(k)); }); // URL ile deneme

  // ---- Mekânlar: konum, kart bilgisi, iskele ----
  const P = Object.fromEntries(isl.places.map((p) => [p.key, p]));
  const pier = P['04'];
  pier.s.root.updateMatrixWorld(true);
  // iskele yürünebilir alanları (yerel dikdörtgenler → dünya testi)
  const pierInv = new THREE.Matrix4().copy(pier.s.root.matrixWorld).invert();
  const PIER_RECTS = [[0, 0.9, 1.1, 2.8], [0, -1.6, 4.4, 3.0]]; // [x, z, w, d] yerel
  const deckY = pier.pos.y + 0.43;
  const pv = new THREE.Vector3();
  function onPier(x, z) { pv.set(x, deckY, z).applyMatrix4(pierInv); return PIER_RECTS.some(([cx, cz, w, d]) => Math.abs(pv.x - cx) < w / 2 && Math.abs(pv.z - cz) < d / 2); }
  // engeller: evler, fener, saat kulesi, sera, istasyon kulübesi
  const colliders = isl.entries.filter((e) => e.it.kind === 'house').map((e) => ({ x: e.it.at[0], z: e.it.at[1], r: 0.62 }));
  isl.entries.filter((e) => e.it.kind === 'lamp' || e.it.kind === 'tree').forEach((e) => colliders.push({ x: e.it.at[0], z: e.it.at[1], r: e.it.kind === 'lamp' ? 0.18 : 0.22 })); // lamba ve ağaç gövdesinin içinden geçilmesin
  (isl.flagPoles || []).forEach(([x, z]) => colliders.push({ x, z, r: 0.15 }));
  [['hub', 0.95], ['03', 0.85], ['08', 1.3]].forEach(([k, r]) => { if (P[k]) colliders.push({ x: P[k].pos.x, z: P[k].pos.z, r }); });
  if (P['06']) { const w = P['06'].s.root.localToWorld(new THREE.Vector3(-0.65, 0, -0.45)); colliders.push({ x: w.x, z: w.z, r: 0.75 }); }
  function groundAt(x, z) { return onPier(x, z) ? deckY : Math.max(T.heightAt(x, z), T.sea); }
  function walkable(x, z) {
    if (colliders.some((c) => Math.hypot(c.x - x, c.z - z) < c.r)) return false;
    if (onPier(x, z)) return true;
    return T.inside(x, z) && T.heightAt(x, z) > 0.2;
  }

  // ---- Gezgin (oyuncu) ----
  const traveler = parts.build(kit.CHARS[LIB.kadro.player], C);
  look.patchObject(traveler.root);
  const avatar = traveler.root;

  // ---- Sakinlerin yürüyüşü: evlerinin çevresinde kısa gezintiler ----
  let seed = 31; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const walkers = isl.residents.map((r) => ({ r, o: r.o, home: r.o.root.position.clone(), target: null, wait: rnd() * 4, speed: 0.35 + rnd() * 0.3 }));
  function wander(dt) {
    walkers.forEach((w) => {
      const p = w.o.root.position;
      if (!w.target) { w.wait -= dt; if (w.wait > 0) return;
        for (let g = 0; g < 8; g++) { const a = rnd() * Math.PI * 2, d = 0.6 + rnd() * 1.6, x = w.home.x + Math.cos(a) * d, z = w.home.z + Math.sin(a) * d; if (walkable(x, z)) { w.target = new THREE.Vector3(x, 0, z); break; } }
        if (!w.target) w.wait = 1; return; }
      const dx = w.target.x - p.x, dz = w.target.z - p.z, d = Math.hypot(dx, dz);
      if (d < 0.05) { w.target = null; w.wait = 2 + rnd() * 5; return; }
      const s = Math.min(d, w.speed * dt); p.x += dx / d * s; p.z += dz / d * s; p.y = groundAt(p.x, p.z);
      const face = Math.atan2(dx, dz); w.o.root.rotation.y += ((face - w.o.root.rotation.y + Math.PI * 3) % (Math.PI * 2) - Math.PI) * Math.min(1, dt * 6);
    });
  }

  // ---- Kamera ----
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 300);
  const PITCH = 0.72, GAME_PITCH = 1.25, HALF = 7.4, OVER = 0.62;
  const look3 = { x: -0.5, y: 0.6, z: 0.8, tx: -0.5, ty: 0.6, tz: 0.8, zoom: OVER, tzoom: OVER, pitch: PITCH, tpitch: PITCH, shift: 0, tshift: 0 };
  // 3. şahıs kamera (varsayılan: stil view.walkCamera · ?cam=tp|iso &fov=45 &tpd=5 &tph=2.4 &yaw=derece &clean=1). Yürürken gezginin arkasından, perspektifle bakar.
  const TP = params.has('cam') ? params.get('cam') === 'tp' : (ST.view && ST.view.walkCamera) === 'tp'; // yürürken 3. şahıs; genel bakış (Esc) kuş bakışı
  const tpCam = new THREE.PerspectiveCamera(Number(params.get('fov') || 45), 1, 0.1, 300);
  const TPD = Number(params.get('tpd') || 5), TPH = Number(params.get('tph') || 2.4);
  if (params.has('yaw')) ui.yaw = ui.targetYaw = Number(params.get('yaw')) * Math.PI / 180;
  const tpOn = () => TP && ui.walking && ui.avatar && !ui.inGame;
  if (params.get('clean')) document.body.classList.add('clean');
  const activeCam = () => tpOn() ? tpCam : cam;
  // engelden kaçan kamera: gezginden kameraya ışın; arada büyük bir nesne (ev, ağaç, çatı) varsa kamera onun önüne gelir
  let camColl = null, camD = TPD, camBest = null, camTick = 0;
  const camRay = new THREE.Raycaster(), tgt = new THREE.Vector3(), want = new THREE.Vector3(), cdir = new THREE.Vector3(), bb = new THREE.Box3(), bsz = new THREE.Vector3();
  function getColliders() {
    if (camColl) return camColl; camColl = []; isl.root.updateMatrixWorld(true);
    const skip = new Set(isl.residents.map((r) => r.o.root));
    isl.root.traverse((o) => {
      if (!o.isMesh || o.userData.noOutline || (o.material && o.material.userData && o.material.userData.noAtlas)) return;
      for (let p = o; p; p = p.parent) { if (skip.has(p) || p.userData.terrain) return; }
      if (!o.geometry.boundingBox) o.geometry.computeBoundingBox();
      bb.copy(o.geometry.boundingBox).applyMatrix4(o.matrixWorld); bb.getSize(bsz);
      if (Math.min(Math.max(bsz.x, bsz.z), bsz.y) > 0.3 && Math.min(bsz.x, bsz.z) > 0.22) camColl.push(o); // direk, lamba, bayrak gibi ince ya da küçük şeyler kamerayı itmesin
    });
    return camColl;
  }
  function camUpdate() {
    if (tpOn()) {
      const a = ui.avatar, d = TPD / ui.zk;
      tpCam.aspect = out.clientWidth / Math.max(1, out.clientHeight);
      // önce istenen açı; arada engel varsa kamera yükselerek engelin üstünden bakmayı dener (yay kolu), olmazsa engelin önüne gelir
      tgt.set(a.x, a.y + 0.7, a.z);
      const base = Math.atan2(TPH - 0.7, TPD);
      let best = camTick++ % 3 && camBest && Math.abs(camBest.yaw - ui.yaw) < 0.05 ? camBest : null; // engel ışınları 3 karede bir
      if (!best) for (let k = 0; k < 5 && !(best && best.free >= best.len - 0.01); k++) {
        const el = Math.min(1.35, base + k * 0.22), dir = new THREE.Vector3(Math.sin(ui.yaw) * Math.cos(el), Math.sin(el), Math.cos(ui.yaw) * Math.cos(el));
        camRay.set(tgt, dir); camRay.far = d;
        const hit = camRay.intersectObjects(getColliders(), false).find((h) => h.object.visible);
        const free = hit ? Math.max(1.8, hit.distance - 0.3) : d;
        if (!best || free > best.free + 0.4) best = { dir, free, len: d, yaw: ui.yaw };
      }
      camBest = best;
      cdir.lerp(best.dir, cdir.lengthSq() ? 0.15 : 1).normalize();
      camD = best.free < camD ? best.free : camD + (best.free - camD) * 0.06; // engele hızlı yaklaş, açılınca yavaşça geri çekil
      tpCam.position.copy(tgt).addScaledVector(cdir, camD);
      tpCam.position.y = Math.max(tpCam.position.y, Math.max(T.heightAt(tpCam.position.x, tpCam.position.z), T.sea) + 0.45); // tepenin içine girmesin
      tpCam.lookAt(tgt); tpCam.updateProjectionMatrix(); tpCam.updateMatrixWorld();
    }
    const a = out.clientWidth / Math.max(1, out.clientHeight);
    Object.assign(cam, { left: -HALF * a, right: HALF * a, top: HALF, bottom: -HALF });
    const sx = Math.sin(ui.yaw) * look3.shift, sz = -Math.cos(ui.yaw) * look3.shift, lx = look3.x + sx, lz = look3.z + sz, D = 80;
    cam.position.set(lx + Math.sin(ui.yaw) * Math.cos(look3.pitch) * D, look3.y + Math.sin(look3.pitch) * D, lz + Math.cos(ui.yaw) * Math.cos(look3.pitch) * D);
    cam.zoom = look3.zoom * ui.zk; cam.up.set(0, 1, 0); cam.lookAt(lx, look3.y, lz); cam.updateProjectionMatrix(); cam.updateMatrixWorld();
  }

  // ---- Arayüz ----
  const pinsEl = document.getElementById('pins'), listEl = document.getElementById('list'), placeEl = document.getElementById('place'), enterEl = document.getElementById('enter');
  const pins = {}, rows = {};
  KEYS.concat(['hub']).forEach((key) => {
    const p = P[key]; if (!p) return;
    const pin = document.createElement('button'); pin.type = 'button'; pin.className = 'pin';
    pin.innerHTML = (key === 'hub' ? '★' : key) + '<span class="name">' + p.rec.name.toUpperCase() + '</span>';
    pin.setAttribute('aria-label', (key === 'hub' ? '' : key + ' · ') + p.rec.name);
    pin.addEventListener('click', () => select(key)); pinsEl.append(pin); pins[key] = pin;
    if (key === 'hub') return;
    const li = document.createElement('li'), b = document.createElement('button');
    b.type = 'button'; b.innerHTML = '<span>' + key + ' ' + p.rec.name + '</span><i class="dot"></i>';
    b.addEventListener('click', () => { select(key); if (matchMedia('(max-width: 900px)').matches) setPlaces(false); }); li.append(b); listEl.append(li); rows[key] = b;
  });
  function renderList() {
    KEYS.forEach((key) => { const on = ui.lit.includes(key); rows[key].classList.toggle('off', !on); rows[key].classList.toggle('active', ui.selected === key); rows[key].querySelector('.dot').classList.toggle('on', on); pins[key].classList.toggle('lit', on); });
    document.getElementById('meter').innerHTML = KEYS.map((k) => '<i class="' + (ui.lit.includes(k) ? 'on' : '') + '"></i>').join('');
    document.getElementById('litCount').textContent = ui.lit.length + ' / 8 VISITED';
    document.getElementById('visitedCompact').textContent = ui.lit.length + '/8';
    document.getElementById('meter').setAttribute('aria-valuenow', ui.lit.length);
    KEYS.forEach((key) => { rows[key].setAttribute('aria-label', P[key].rec.name + (ui.lit.includes(key) ? ', visited' : ', not visited')); if (ui.selected === key) rows[key].setAttribute('aria-current', 'location'); else rows[key].removeAttribute('aria-current'); });
  }
  function showCard(key) {
    const r = P[key].rec; ui.selected = key;
    document.getElementById('placeKicker').textContent = key === 'hub' ? 'THE HUB' : 'PREMISE ' + key + ' · ' + r.premise.toUpperCase();
    document.getElementById('placeTitle').textContent = r.name;
    document.getElementById('placePromise').textContent = '“' + r.promise + '”';
    document.getElementById('placeGame').innerHTML = r.game ? 'game: <b>' + r.game + '</b>' + (shell.has(key) ? ' · plays here' : '') : ui.lit.length + ' of 8 places visited';
    enterEl.style.display = key === 'hub' ? 'none' : '';
    enterEl.href = '?game=' + key;
    placeEl.hidden = false; renderList();
  }
  function hideCard() { ui.selected = null; placeEl.hidden = true; renderList(); }

  // ---- Kurallar ----
  function select(key) { if (ui.avatar) overview(); const p = P[key]; Object.assign(look3, { tx: p.pos.x, ty: p.pos.y + 0.8, tz: p.pos.z, tzoom: 1.7 }); showCard(key); }
  function overview() { clearMovement(); ui.walking = false; ui.near = null; ui.tzk = 1; Object.assign(look3, { tx: -0.5, ty: 0.6, tz: 0.8, tzoom: OVER }); hideCard(); }
  function startWalking(at) {
    if (ui.walking && ui.avatar && !at) return;
    if (!ui.avatar || at) {
      // Başlangıç noktası engelde ya da denizdeyse planın yürünebilir yollarını dene.
      const candidates = [at, [pier.pos.x - 1.6, pier.pos.z - 3.6], ...(PLAN.paths || []).flatMap((p) => p.pts || [])];
      const point = candidates.find((p) => p && p.length === 2 && p.every(Number.isFinite) && walkable(p[0], p[1]));
      if (!point) throw new Error('No walkable starting point in island plan');
      const [x, z] = point;
      ui.avatar = { x, z, y: groundAt(x, z), face: Math.PI, step: 0 };
    }
    ui.walking = true; ui.near = null; ui.tzk = 1;
    avatar.position.set(ui.avatar.x, ui.avatar.y, ui.avatar.z);
    avatar.rotation.y = ui.avatar.face;
    scene.add(avatar); hideCard();
    Object.assign(look3, { tx: ui.avatar.x, ty: ui.avatar.y + 0.5, tz: ui.avatar.z, tzoom: 1.9 });
  }
  function enter() {
    if (!ui.selected || ui.selected === 'hub') return;
    if (!ui.lit.includes(ui.selected)) ui.lit.push(ui.selected);
    store.set('ada-lit', ui.lit);
    if (shell.has(ui.selected)) { startGame(ui.selected); return; }
    location.href = HREF[ui.selected];
  }
  function setMode(mode) {
    ui.mode = mode; S.time = mode; store.set('ada-mode', mode);
    document.body.classList.remove('night', 'day'); document.body.classList.add(mode);
    document.querySelectorAll('.mode button').forEach((b) => b.setAttribute('aria-pressed', b.dataset.mode === mode));
  }

  // ---- Oyunlar: her biri kendi mekânının içinde, ortak kabukla (oyunlar/kabuk.js) ----
  const shell = createGameShell(THREE, { scene, cam, out, store, parts, look, C, CHARS: kit.CHARS, places: P,
    isNight: () => ui.mode === 'night', onExit: () => exitGame(), shift: (dx) => { look3.tshift = dx; } });
  const wrapA = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  function startGame(key) {
    clearMovement();
    shell.start(key);
    const p = P[key], spec = shell.spec(key), cg = shell.current().game, vw = Object.assign({}, spec.view, cg.view ? cg.view() : {}); // oyun kadrajı kendisi düzeltebilir
    ui.inGame = key; hideCard();
    if (ui.avatar) scene.remove(avatar);
    p.s.root.updateMatrixWorld(true);
    const c = p.s.root.localToWorld(new THREE.Vector3(...vw.at));
    // kamera mekânın önüne geçer (yerel +z = ön), en kısa yoldan döner
    const front = p.s.root.rotation.y + (vw.yaw || 0);
    ui.targetYaw = ui.yaw + wrapA(front - ui.yaw); ui.tzk = 1;
    Object.assign(look3, { tx: c.x, ty: c.y, tz: c.z, tzoom: vw.zoom, tpitch: vw.pitch });
    renderList();
  }
  function exitGame() {
    const key = ui.inGame; if (!key) return;
    shell.stop(); ui.inGame = false; look3.tpitch = PITCH;
    const p = P[key], fp = p.rec.footprint + 0.7;
    let at = null;
    for (let k = 0; k < 8 && !at; k++) { const a = k * Math.PI / 4, w = p.s.root.localToWorld(new THREE.Vector3(Math.sin(a) * fp, 0, Math.cos(a) * fp)); if (walkable(w.x, w.z)) at = [w.x, w.z]; }
    at = at || [pier.pos.x - 1.6, pier.pos.z - 3.6];
    startWalking(at);
    out.focus({ preventScroll: true });
  }

  // ---- Girdi ----
  const held = new Set();
  const MOVE = { w: [0, 1], arrowup: [0, 1], s: [0, -1], arrowdown: [0, -1], a: [-1, 0], arrowleft: [-1, 0], d: [1, 0], arrowright: [1, 0] };
  addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.target.closest && k !== 'escape' && (e.target.closest('input, select, textarea') || ((k === 'enter' || k === ' ') && e.target.closest('button, a, summary')))) return;
    if (ui.inGame) { // oyun klavyeyi kendisi kullanıyorsa (01 bando) yalnız Esc adaya döner
      if (k === 'escape' || (k === 'b' && !shell.ownsKeys())) exitGame(); else if (k === 'n' && !e.shiftKey && !shell.ownsKeys()) setMode(ui.mode === 'night' ? 'day' : 'night');
      return; }
    if (MOVE[k]) { e.preventDefault(); startWalking(); held.add(k); return; }
    if (/^[1-8]$/.test(k)) { if (ui.avatar) overview(); select('0' + k); }
    else if (k === 'q') ui.targetYaw -= Math.PI / 2;
    else if (k === 'e') ui.targetYaw += Math.PI / 2;
    else if (k === 'n') setMode(ui.mode === 'night' ? 'day' : 'night');
    else if ((k === 'enter' || k === ' ') && ui.selected) { e.preventDefault(); enter(); }
    else if (k === 'escape' && ui.selected) { hideCard(); placesToggle.focus(); }
    else if (k === 'escape' || k === 'b') overview();
  });
  addEventListener('keyup', (e) => held.delete(e.key.toLowerCase()));
  // Fare tekerleği: yakınlaş / uzaklaş (yumuşak, sınırlı). Kod penceresi gibi kaydırılan yerlerde çalışmaz.
  out.addEventListener('wheel', (e) => { e.preventDefault(); ui.tzk = Math.max(0.6, Math.min(3.2, ui.tzk * Math.exp(-e.deltaY * 0.0012))); }, { passive: false });
  enterEl.addEventListener('click', (e) => { e.preventDefault(); enter(); });
  document.getElementById('back').addEventListener('click', () => { hideCard(); placesToggle.focus(); });
  document.getElementById('overview').addEventListener('click', overview);
  document.getElementById('findMe').addEventListener('click', () => { startWalking(); document.getElementById('controlsHelp').open = false; out.focus({ preventScroll: true }); });
  document.getElementById('rotateLeft').addEventListener('click', () => { ui.targetYaw -= Math.PI / 2; });
  document.getElementById('rotateRight').addEventListener('click', () => { ui.targetYaw += Math.PI / 2; });
  document.getElementById('zoomIn').addEventListener('click', () => { ui.tzk = Math.min(3.2, ui.tzk * 1.2); });
  document.getElementById('zoomOut').addEventListener('click', () => { ui.tzk = Math.max(0.6, ui.tzk / 1.2); });
  function clearMovement() {
    held.clear();
    document.querySelectorAll('[data-walk]').forEach((b) => b.setAttribute('aria-pressed', 'false'));
  }
  document.querySelectorAll('[data-walk]').forEach((b) => {
    b.setAttribute('aria-pressed', 'false');
    b.addEventListener('pointerdown', (e) => {
      if (ui.inGame) return; e.preventDefault(); startWalking();
      b.setPointerCapture(e.pointerId); held.add(b.dataset.walk); b.setAttribute('aria-pressed', 'true');
    });
    const release = () => { held.delete(b.dataset.walk); b.setAttribute('aria-pressed', 'false'); };
    b.addEventListener('pointerup', release); b.addEventListener('pointercancel', release); b.addEventListener('lostpointercapture', release);
    b.addEventListener('keydown', (e) => { if (e.code === 'Space' || e.key === 'Enter') { e.preventDefault(); startWalking(); held.add(b.dataset.walk); } });
    b.addEventListener('keyup', release); b.addEventListener('blur', release);
  });
  addEventListener('blur', clearMovement);
  document.addEventListener('visibilitychange', () => { if (document.hidden) clearMovement(); });
  document.querySelectorAll('.mode button').forEach((b) => b.addEventListener('click', () => setMode(b.dataset.mode)));

  // Yürüme: tuşlar ekrana göre
  const right = new THREE.Vector3(), up = new THREE.Vector3();
  function walk(dt) {
    const a = ui.avatar; let sx = 0, sy = 0;
    held.forEach((k) => { sx += MOVE[k][0]; sy += MOVE[k][1]; });
    if (sx || sy) {
      const vc = activeCam(); right.setFromMatrixColumn(vc.matrixWorld, 0).setY(0).normalize(); up.setFromMatrixColumn(vc.matrixWorld, 1).setY(0).normalize();
      let vx = right.x * sx + up.x * sy, vz = right.z * sx + up.z * sy; const len = Math.hypot(vx, vz); vx /= len; vz /= len;
      const sp = 2.8 * dt;
      if (walkable(a.x + vx * sp, a.z)) a.x += vx * sp;
      if (walkable(a.x, a.z + vz * sp)) a.z += vz * sp;
      a.face = Math.atan2(vx, vz); a.step += dt;
    }
    a.y += (groundAt(a.x, a.z) - a.y) * Math.min(1, dt * 12);
    avatar.position.set(a.x, a.y, a.z);
    avatar.rotation.y += ((a.face - avatar.rotation.y + Math.PI * 3) % (Math.PI * 2) - Math.PI) * Math.min(1, dt * 12);
    traveler.motion = Object.assign({}, traveler.motion, { every: sx || sy ? 0.42 : 2.4, hop: sx || sy ? 0.07 : 0.14 }); // yürürken kısa adım zıplaması
    let best = null, bd = 1e9;
    isl.places.forEach((p) => { const d = Math.hypot(p.pos.x - a.x, p.pos.z - a.z); if (d < p.rec.footprint + 0.6 && d < bd) { bd = d; best = p.key; } });
    if (best !== ui.near) { ui.near = best; best ? showCard(best) : hideCard(); }
    Object.assign(look3, { tx: a.x, ty: a.y + 0.5, tz: a.z, tzoom: 1.9 });
  }

  // ---- Döngü ----
  const v = new THREE.Vector3();
  let last = performance.now(), beamDeg = 195, n = 0;
  function frame(now) {
    const dt = Math.min(0.1, (now - last) / 1000); last = now; const t = now / 1000;
    if (ui.walking && ui.avatar && !ui.inGame) walk(dt);
    wander(dt);
    const k = 1 - Math.exp(-dt * 5);
    ['x', 'y', 'z', 'zoom', 'pitch', 'shift'].forEach((q) => { const tq = 't' + q; look3[q] += (look3[tq] - look3[q]) * k; });
    ui.yaw += (ui.targetYaw - ui.yaw) * (1 - Math.exp(-dt * 7));
    ui.zk += (ui.tzk - ui.zk) * (1 - Math.exp(-dt * 10));
    camUpdate();
    isl.anims.forEach((f) => f(t)); isl.chars.forEach((c) => parts.animate(c, t)); if (ui.avatar) parts.animate(traveler, t);
    beamDeg = (beamDeg + dt * 360 * 0.12) % 360;
    // perspektif gecesi: ay ve lambalar biraz güçlü, eşikler yumuşak → yakın plan düz koyu kalmasın (stil: perspective)
    const PSn = ST.perspective || {}, tpNight = tpOn() && ui.mode === 'night';
    S.moonI = tpNight ? PSn.nightMoon ?? ST.light.moon : ST.light.moon; S.nT = tpNight ? PSn.nightThresholdFactor ?? ST.nightThresholdFactor : ST.nightThresholdFactor;
    S.lampI = tpNight ? PSn.nightLamps ?? ST.light.streetLamps : ST.light.streetLamps;
    S.dark = tpNight ? PSn.nightDark ?? ST.dark : ST.dark; // perspektif gecesi rengin koyu tonuyla: çimen yeşil, evler kendi renginde kalır
    ['moonI', 'lampI', 'nT'].forEach((k) => { if (params.has(k)) S[k] = Number(params.get(k)); }); if (params.has('dark')) S.dark = params.get('dark');
    kit.applyLights(isl, S, beamDeg);
    if (isl.clouds) isl.clouds.visible = !!(tpOn() && S.paint); // bulutlar yalnız 3. şahısta ve boya / baskıda
    if (ui.inGame) shell.frame(t);
    if (autoQ) { frameMs += (dt * 1000 - frameMs) * 0.05; if (frameMs > 24 && Q > 0.5) Q = Math.max(0.5, Q - 0.05); else if (frameMs < 15 && Q < Q0) Q = Math.min(Q0, Q + 0.05); }
    look.render(out, scene, activeCam(), new THREE.Color(ui.mode === 'night' ? C.ink : C.paper), S, DPR, Q);
    if (!document.getElementById('retryLoad').hidden) return;
    document.getElementById('loadStatus').hidden = true;
    const pinOrder = KEYS.concat(['hub']).sort((a, b) => Number(b === ui.selected) - Number(a === ui.selected));
    // Önce tüm ölçümleri oku, sonra konumları yaz: her etikette yeniden yerleşim hesaplatma.
    pinOrder.forEach((key) => { if (pins[key]) { pins[key].hidden = !!ui.inGame; pins[key].classList.toggle('hot', ui.selected === key); } });
    const sizes = Object.fromEntries(pinOrder.map((key) => [key, pins[key] ? [pins[key].offsetWidth, pins[key].offsetHeight] : [0, 0]]));
    const occupied = ['.brand', '#placesToggle', '#placesPanel', '#place'].map((sel) => document.querySelector(sel)).filter((el) => !el.hidden && el.getClientRects().length).map((el) => el.getBoundingClientRect());
    const dockHeight = dock.offsetHeight;
    pinOrder.forEach((key) => {
      const p = P[key], pin = pins[key]; if (!p || !pin) return;
      v.copy(p.pos).add(new THREE.Vector3(0, (p.rec.height || 2) + 0.25, 0)).project(activeCam());
      pin.hidden = ui.inGame || v.z > 1 || Math.abs(v.x) > 1.05 || Math.abs(v.y) > 1.05;
      if (!pin.hidden) {
        const [w, h] = sizes[key];
        const x = Math.max(w / 2 + 8, Math.min(out.clientWidth - w / 2 - 8, (v.x * 0.5 + 0.5) * out.clientWidth));
        const y = Math.max(h + 8, Math.min(out.clientHeight - dockHeight - 24, (-v.y * 0.5 + 0.5) * out.clientHeight));
        pin.style.left = x + 'px'; pin.style.top = y + 'px';
        const r = { left: x - w / 2, right: x + w / 2, top: y - h, bottom: y };
        pin.hidden = occupied.some((b) => r.left < b.right + 4 && r.right > b.left - 4 && r.top < b.bottom + 4 && r.bottom > b.top - 4);
        if (!pin.hidden) occupied.push(r);
      }
    });
    requestAnimationFrame(frame);
  }

  setMode(ui.mode); renderList();
  const snap = () => ['x', 'y', 'z', 'zoom', 'pitch'].forEach((q) => { look3[q] = look3['t' + q]; });
  // Oyuncu ilk kareden itibaren adada; URL seçimi aşağıda kamerayı değiştirebilir.
  startWalking(); snap();
  if (params.get('walk')) { const w = params.get('walk'); startWalking(w.includes(',') ? w.split(',').map(Number) : null); walk(0); snap(); }
  if (params.get('select')) { select(params.get('select')); snap(); }
  if (params.get('game') && shell.has(params.get('game'))) { const g = params.get('game'); ui.selected = g; startGame(g); ui.yaw = ui.targetYaw; snap(); const cg = shell.current().game; if (params.get('demo') && cg.demo) cg.demo(); if (params.get('tab')) shell.setTab(params.get('tab')); }
  window.__c2 = { isl, ui, look3, P, walkable, groundAt, shell, cam, tpCam, activeCam, avatar, THREE, getColliders, step: (ms) => frame(ms ?? performance.now()) }; // step: test için elle bir kare
  requestAnimationFrame(frame);
}
