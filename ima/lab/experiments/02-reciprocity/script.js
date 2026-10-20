// 02 · Eye Field — Baykuş Ormanı. Elindeki fenerle açıklıkta gezersin; baykuşlar seni izler, durursan sıkılır, tıklarsan ürker.
// Girdi: pointermove / pointerdown / hiçbir şey yapmamak · Kural: setMood() + sabır · Durum: her baykuşun ruh hali · Çıktı: baş, beden, ses
window.OYUNLAR = window.OYUNLAR || {};
window.OYUNLAR['02'] = {
  key: '02', title: 'Eye Field', premise: 'Reciprocity', premiseText: 'Every action expects a response.', promise: 'Design the dialogue, not the message.',
  source: 'Audience — Random International & Chris O’Shea (2008)',
  caption: 'They see you. Do they like what they see?', hint: 'move the lantern · click = surprise · stand still · C code · B island',
  anat: ['pointermove', 'setMood()', 'mood[ ]', 'heads · hoots'], hot: 2,
  hud: [['WATCHING', 'nWatch'], ['BORED', 'nBored'], ['SURPRISED', 'nSurp', 'ghosts']],
  design: { followSpeed: 0.15, patience: 3000, surpriseRadius: 1.2, voice: true, maxVoices: 3 },
  knobs: [
    { key: 'followSpeed', step: 0.05, min: 0.02, max: 0.6, note: 'live · 0.02 slow – 0.5 quick' }, { key: 'patience', step: 500, min: 500, max: 10000, note: 'ms · live' },
    { key: 'surpriseRadius', step: 0.2, min: 0.2, max: 3, note: 'live' }, { key: 'voice', type: 'bool', note: 'live' }, { key: 'maxVoices', step: 1, min: 0, max: 20, note: 'live' }],
  code: ['<span class="c">// 3) RULE: every owl waits for its turn</span>', '<span class="k">if</span> (clicked) setMood(owl, \'surprised\');',
    '<span class="k">else if</span> (stillFor &gt; DESIGN.patience) setMood(owl, \'bored\');', '<span class="k">else</span> setMood(owl, \'watching\');'],
  tasks: ['Set <b>patience</b> to 800, then 10000. Is the forest impatient or polite?', 'Make surprised owls look <em>away</em> from you. How does the dialogue change?', 'Add an <b>angry</b> mood for double-click: a new sound, a new pose.'],
  question: 'When did a website last ignore you? What did that feel like?',
  overlay: { title: 'Eye Field', text: 'You carry a lantern into the clearing. The owls follow it. Stand still and they get bored; click and they jump.', cta: 'CLICK TO ENTER' },
  view: { at: [0, 0.35, 0.1], zoom: 2.8, pitch: 1.08 },

  make(ctx) {
    const { THREE, D, C, group } = ctx;
    const COLS = 5, ROWS = 4, Y = 0.08;
    // yol bulucu: kopyalanan bebekte başı bulmak için (aynı çocuk sırası)
    const pathTo = (root, obj) => { const p = []; for (let o = obj; o && o !== root; o = o.parent) p.unshift(o.parent.children.indexOf(o)); return p; };
    const follow = (root, p) => p.reduce((o, i) => o.children[i], root);
    const proto = ctx.char('char.owl'); const headPath = pathTo(proto.root, proto.head), wobPath = pathTo(proto.root, proto.wob);
    const stumpGeo = new THREE.CylinderGeometry(0.15, 0.18, 0.2, 7), ringGeo = new THREE.TorusGeometry(0.1, 0.02, 6, 20);
    const owls = [];
    let seed = 9; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    for (let i = 0; i < COLS; i++) for (let j = 0; j < ROWS; j++) {
      const x = (i - (COLS - 1) / 2) * 0.62 + (j % 2) * 0.12, z = (j - (ROWS - 1) / 2) * 0.55 - 0.05;
      group.add(ctx.mesh(stumpGeo, ctx.toon('wood'), x, Y + 0.1, z));
      const root = proto.root.clone(), size = 0.5 + rnd() * 0.08; root.scale.setScalar(size); root.position.set(x, Y + 0.2, z);
      group.add(root);
      const head = follow(root, headPath), wob = follow(root, wobPath);
      const ring = ctx.mesh(ringGeo, ctx.flat('hot'), 0, 0, 0, false); ring.visible = false; group.add(ring);
      owls.push({ i, j, x, z, root, head, wob, ring, size, mood: 'away', moodT: 0, yaw: rnd() * 6 - 3, yawV: 0, bodyYaw: 0, pending: null, lastVoice: -9, ringT: -9, phase: rnd() * 6 });
    }
    // Gezgin feneri elinde taşır; yalnız başına hareket eden bir lamba değildir.
    const traveler = ctx.char('char.traveler'), visitor = traveler.root;
    visitor.name = 'owl-forest-traveler'; visitor.scale.setScalar(0.7);
    visitor.position.set(0, Y, 1.6); group.add(visitor);
    // fener: oyuncunun elindeki tek sıcak ışık; baykuşlar ona bakar
    const lantern = new THREE.Group();
    lantern.add(ctx.mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 5), ctx.toon('ink'), 0, 0.25, 0));
    lantern.add(ctx.mesh(new THREE.BoxGeometry(0.14, 0.17, 0.14), ctx.flat('warm'), 0, 0.55, 0));
    const cap = ctx.mesh(new THREE.ConeGeometry(0.12, 0.08, 4), ctx.toon('ink'), 0, 0.67, 0); cap.rotation.y = Math.PI / 4; lantern.add(cap);
    lantern.scale.setScalar(0.75); lantern.position.set(0, -0.32, 0);
    traveler.held.add(lantern);
    const light = new THREE.PointLight(0xffd890, 0, 3.2, 1.3); light.position.y = 0.6; lantern.add(light);
    const pointer = { x: 0, z: 1.6, seen: false, lastMove: 0 };
    let simT = 0, audio = null, voices = 0, demoOn = false, nextClick = 4;

    // ---- ses: yalnız ruh hali DEĞİŞİNCE ----
    const PENTA = [196, 220, 262, 294, 330, 392, 440];
    const pitchOf = (o) => PENTA[(ROWS - 1 - o.j + o.i) % PENTA.length]; // arka sıra tiz
    function slot(dur) { if (!D.voice || voices >= D.maxVoices || !(audio = ctx.audio())) return false; voices++; ctx.schedule(() => { voices--; }, dur * 1000); return true; }
    function chain(o, type, filter) {
      const osc = audio.createOscillator(), gain = audio.createGain(), pan = audio.createStereoPanner(); osc.type = type; gain.gain.value = 0;
      pan.pan.value = (o.i - (COLS - 1) / 2) / ((COLS - 1) / 2) * 0.8; let node = osc;
      if (filter) { const f = audio.createBiquadFilter(); f.type = filter[0]; f.frequency.value = filter[1]; osc.connect(f); node = f; }
      node.connect(gain).connect(pan).connect(audio.destination); return { osc, gain };
    }
    function hoot(o) { if (!slot(0.6)) return false; const t = audio.currentTime, f = pitchOf(o), { osc, gain } = chain(o, 'sine');
      osc.frequency.setValueAtTime(f, t); osc.frequency.exponentialRampToValueAtTime(f * 0.86, t + 0.18); osc.frequency.setValueAtTime(f * 1.02, t + 0.26); osc.frequency.exponentialRampToValueAtTime(f * 0.8, t + 0.5);
      [[0, 0.18], [0.26, 0.52]].forEach(([a, b]) => { gain.gain.setValueAtTime(0, t + a); gain.gain.linearRampToValueAtTime(0.22, t + a + 0.04); gain.gain.exponentialRampToValueAtTime(0.001, t + b); });
      osc.start(t); osc.stop(t + 0.6); return true; }
    function yawn(o) { if (!slot(1.1)) return false; const t = audio.currentTime, f = pitchOf(o), { osc, gain } = chain(o, 'triangle', ['lowpass', 700]);
      osc.frequency.setValueAtTime(f * 0.75, t); osc.frequency.exponentialRampToValueAtTime(f * 0.42, t + 1.0);
      gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(0.14, t + 0.3); gain.gain.exponentialRampToValueAtTime(0.001, t + 1.05); osc.start(t); osc.stop(t + 1.1); return true; }
    function squawk(o) { if (!slot(0.25)) return false; const t = audio.currentTime, f = pitchOf(o) * 2.2, { osc, gain } = chain(o, 'square', ['bandpass', 1400]);
      osc.frequency.setValueAtTime(f, t); osc.frequency.exponentialRampToValueAtTime(f * 1.6, t + 0.08); osc.frequency.exponentialRampToValueAtTime(f * 0.9, t + 0.2);
      gain.gain.setValueAtTime(0, t); gain.gain.linearRampToValueAtTime(0.16, t + 0.01); gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22); osc.start(t); osc.stop(t + 0.25); return true; }

    // ---- kural ----
    function setMood(o, mood, t) {
      if (o.mood === mood) return;
      const prev = o.mood; o.mood = mood; o.moodT = t; ctx.flash(2);
      if (t - o.lastVoice < 1.2) return;
      let spoke = false;
      if (mood === 'surprised') spoke = squawk(o); else if (mood === 'watching' && (prev === 'bored' || prev === 'away')) spoke = hoot(o); else if (mood === 'bored') spoke = yawn(o);
      if (spoke) { o.lastVoice = t; o.ringT = t; }
    }
    function rules(t) {
      const still = (t - pointer.lastMove) * 1000;
      owls.forEach((o) => {
        o.dist = Math.hypot(visitor.position.x - o.x, visitor.position.z - o.z);
        if (o.pending !== null && t >= o.pending) { o.pending = null; setMood(o, 'surprised', t); return; }
        if (o.mood === 'surprised' && t - o.moodT < 0.9) return;
        if (!pointer.seen || !ctx.isPlaying()) { setMood(o, 'away', t); return; }
        const patience = D.patience + Math.max(0, 3 - o.dist) * 350; // uzaktakiler önce sıkılır
        setMood(o, still > patience ? 'bored' : 'watching', t);
      });
    }

    // ---- animasyon: baş önce, gövde sonra (overlapping) · ürkme öncesi çömelme (anticipation) · squash & stretch ----
    const springy = (u, amp, k = 8, w = 20) => 1 - amp * Math.exp(-u * k) * Math.cos(u * w);
    const wrap = (a) => Math.atan2(Math.sin(a), Math.cos(a));
    function animate(o, t, dt) {
      const u = t - o.moodT;
      let target = o.yaw;
      if (o.mood === 'watching' || o.mood === 'surprised') target = Math.atan2(visitor.position.x - o.x, visitor.position.z - o.z);
      else if (o.mood === 'bored') target = o.yaw + Math.sin(t * 0.4 + o.i) * 0.02;
      else target = Math.sin(t * 0.3 + o.i * 1.7 + o.j) * 1.2;
      const k = 300 * D.followSpeed, c = 2 * Math.sqrt(k) * 0.55;
      o.yawV += (k * wrap(target - o.yaw) - c * o.yawV) * dt; o.yaw = wrap(o.yaw + o.yawV * dt);
      o.bodyYaw += wrap(o.yaw * 0.5 - o.bodyYaw) * Math.min(1, dt * 2.2);
      o.root.rotation.y = o.bodyYaw; o.head.rotation.y = wrap(o.yaw - o.bodyYaw);
      let sy = 1, jump = 0, droop = 0, headS = 1;
      const breathe = Math.sin(t * 2 + o.phase) * 0.02;
      if (o.mood === 'surprised') {
        if (u < 0.06) sy = 1 - 0.25 * (u / 0.06);
        else if (u < 0.22) { const q = (u - 0.06) / 0.16; sy = 0.75 + 0.6 * q; jump = 0.18 * Math.sin(q * Math.PI / 2); headS = 1.25; }
        else { const v = u - 0.22; jump = Math.max(0, 0.18 * (1 - (v / 0.2) ** 2)); sy = v < 0.2 ? 1.2 : springy(v - 0.2, 0.25, 8, 18); headS = 1 + 0.25 * Math.exp(-v * 2.5); }
      } else if (o.mood === 'bored') { const s = 1 - Math.exp(-u * 0.9); droop = 0.5 * s; sy = 1 - 0.1 * s + breathe * 0.5; }
      else if (o.mood === 'watching') { sy = u < 0.5 ? springy(u, -0.12, 10, 22) : 1 + breathe; droop = -0.15; }
      else sy = 1 + breathe;
      const r = t - o.ringT;
      if (r >= 0 && r < 0.7) { sy *= 1 + 0.12 * Math.sin(Math.min(1, r / 0.5) * Math.PI); o.ring.visible = true;
        o.ring.position.set(o.x + Math.sin(o.yaw) * (0.12 + r * 0.2), Y + 0.2 + o.size * 1.05 + r * 0.35, o.z + Math.cos(o.yaw) * (0.12 + r * 0.2)); o.ring.scale.setScalar(0.6 + r * 2.4); o.ring.lookAt(ctx.cam.position); }
      else o.ring.visible = false;
      const sx = 1 / Math.sqrt(sy);
      o.root.scale.set(o.size * sx, o.size * sy, o.size * sx); o.root.position.y = Y + 0.2 + jump;
      o.head.rotation.x = droop; o.head.scale.setScalar(headS);
    }

    return {
      start() {
        ctx.hide(3); pointer.seen = false; pointer.x = 0; pointer.z = 1.6; simT = 0;
        visitor.position.set(0, Y, 1.6); visitor.rotation.y = 0; visitor.visible = false;
        [1, 2].forEach((i) => ctx.root.children[i].children.forEach((tr) => { if (tr.position.z > 0.4) ctx.hideObj(tr); })); // öndeki ağaçlar açıklığı kapatmasın
      },
      stop() { light.intensity = 0; voices = 0; },
      begin(e) { pointer.lastMove = simT; pointer.seen = true; if (e) this.pointer('move', e); },
      pointer(type, e) {
        if (type === 'leave') { pointer.seen = false; return; }
        const p = ctx.toLocal(e, Y); if (!p) return;
        const d = Math.hypot(p.x, p.z), m = 2.1; if (d > 2.6) { pointer.seen = false; return; } // açıklığın dışı: gittin
        pointer.x = d > m ? p.x / d * m : p.x; pointer.z = d > m ? p.z / d * m : p.z; pointer.seen = true;
        if (type === 'move') pointer.lastMove = simT;
        if (type === 'down') { pointer.lastMove = simT; owls.forEach((o) => { const dd = Math.hypot(o.x - pointer.x, o.z - pointer.z); if (dd < D.surpriseRadius) o.pending = simT + dd * 0.09; }); } // dalga gibi yayılır
      },
      frame(t, dt) {
        simT += dt;
        if (demoOn) { // tanıtım: fener sekiz çizer, ara sıra durur ve tıklar
          const go = (simT % 9) < 6; if (go) { pointer.x = Math.sin(simT * 0.7) * 1.6; pointer.z = Math.sin(simT * 1.4) * 0.9 + 0.3; pointer.lastMove = simT; } pointer.seen = true;
          if (simT > nextClick) { nextClick = simT + 5; owls.forEach((o) => { const dd = Math.hypot(o.x - pointer.x, o.z - pointer.z); if (dd < D.surpriseRadius) o.pending = simT + dd * 0.09; }); } }
        const dx = pointer.x - visitor.position.x, dz = pointer.z - visitor.position.z;
        const moving = Math.hypot(dx, dz) > 0.02;
        visitor.position.x += dx * Math.min(1, dt * 10);
        visitor.position.z += dz * Math.min(1, dt * 10);
        visitor.position.y = Y;
        if (moving) {
          const target = Math.atan2(dx, dz), delta = target - visitor.rotation.y;
          visitor.rotation.y += Math.atan2(Math.sin(delta), Math.cos(delta)) * Math.min(1, dt * 12);
        }
        ctx.animChar(traveler, moving ? simT : 0);
        visitor.visible = ctx.isPlaying();
        light.intensity = visitor.visible && ctx.night() ? 3.5 : 0;
        rules(simT); owls.forEach((o) => animate(o, simT, dt));
        let n = 0; owls.forEach((o) => { if (o.mood === 'surprised' && simT - o.moodT < 0.8 && n < 6) ctx.tag(n++, 'oh!', new THREE.Vector3(o.x, Y + 0.85, o.z), true, 10); });
        if (ctx.isPlaying() && owls.filter((o) => o.mood === 'bored').length > owls.length / 2) ctx.tag(n++, 'do something…', new THREE.Vector3(0, 1.2, -1.2), false, 0);
        ctx.tagsFrom(n);
      },
      hud() { const c = (m) => owls.filter((o) => o.mood === m).length; return { nWatch: c('watching'), nBored: c('bored'), nSurp: c('surprised') }; },
      rule: () => 'still > ' + D.patience + 'ms → bored',
      caption() { const b = owls.filter((o) => o.mood === 'bored').length, w = owls.filter((o) => o.mood === 'watching').length;
        return !pointer.seen ? 'They are waiting for you…' : b > w ? 'Do something. They are getting bored.' : 'They see you.'; },
      status: () => 'moods: ' + ['watching', 'bored', 'surprised', 'away'].map((m) => m + ' ' + owls.filter((o) => o.mood === m).length).join(' · '),
      knob() {},
      demo() { demoOn = true; ctx.playing(true); }
    };
  }
};
