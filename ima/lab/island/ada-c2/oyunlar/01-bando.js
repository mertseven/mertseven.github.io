// 01 · Key Orchestra — Bando Sahnesi. Klavyenin her tuşu sahnede bir müzisyen; basınca zıplar, notası uçar, sesi çıkar.
// Girdi: keydown / tıklama · Kural: ruleFor(key) → kim çalacak (agency) · Durum: çalanlar · Çıktı: zıplama + şekil + nota
window.OYUNLAR = window.OYUNLAR || {};
window.OYUNLAR['01'] = {
  key: '01', title: 'Key Orchestra', premise: 'Agency', premiseText: 'The user is not a spectator; their actions change the system.', promise: 'Participation can be designed.',
  source: 'Patatap — Jono Brandel & Lullatone (2014)',
  caption: 'Every key is a musician waiting for you.', hint: 'press any key · click a musician · space = agency · Esc island',
  anat: ['keydown', 'key → musician', 'playing{ }', 'jump + note'], hot: 2,
  hud: [['AGENCY · SPACE', 'agency'], ['PLAYING', 'nPlay'], ['NOTES', 'nNotes', 'ghosts']],
  design: { agency: 'full', life: 1, stagger: 0.035, sound: true, shapes: true },
  knobs: [
    { key: 'agency', type: 'choice', options: ['single', 'group', 'full'], note: 'how much control?' },
    { key: 'life', step: 0.25, min: 0.25, max: 4, note: 's · how long a note rings' },
    { key: 'stagger', step: 0.01, min: 0, max: 0.2, note: 's · neighbours join late' },
    { key: 'sound', type: 'bool', note: 'live' }, { key: 'shapes', type: 'bool', note: 'live' }],
  code: ['<span class="c">// 3) RULE: who plays? agency is designed here</span>', '<span class="k">function</span> ruleFor(key) {',
    '  <span class="k">if</span> (DESIGN.agency === \'single\') <span class="k">return</span> band;          <span class="c">// everyone</span>',
    '  <span class="k">if</span> (DESIGN.agency === \'group\') <span class="k">return</span> rowOf(key);    <span class="c">// the row</span>',
    '  <span class="k">return</span> [musicianOn(key)];                          <span class="c">// only that one</span>', '}'],
  tasks: ['Set <b>agency</b> to single, group and full. Which one makes you feel “I did that”?', 'Rewrite ruleFor(): vowels make the bells ring, consonants the drums.', 'Listen to <b>keyup</b>: hold a key and the musician keeps playing until you let go. What new control is that?'],
  question: 'In Rain Room, what exactly can you change — and what can you not?',
  overlay: { title: 'Key Orchestra', text: 'Every key on your keyboard has a musician standing on it. Press a key, or click one. Space switches agency: single · group · full.', cta: 'PRESS ANY KEY' },
  view: { at: [0, 0.55, 0.05], zoom: 2.9, pitch: 0.92 },
  ownsKeys: true,
  touch: [{ label: 'AGENCY', code: 'Space' }], // dokunmatik: müzisyenlere dokunulur; boşluk = bu düğme

  make(ctx) {
    const { THREE, D, C, group } = ctx;
    const ROWS = ['1234567890', 'QWERTYUIOP', 'ASDFGHJKL', 'ZXCVBNM'];
    const FAM = [{ id: 'char.band.bells', col: 'warm', shape: 'ball' }, { id: 'char.band.brass', col: 'hot', shape: 'ring' }, { id: 'char.band.strings', col: 'cool', shape: 'cone' }, { id: 'char.band.drums', col: 'green', shape: 'cube' }];
    const NOTE_NAMES = ['do', 're', 'mi', 'sol', 'la'], PENTA = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21];
    const AGENCIES = ['single', 'group', 'full'];
    const TOP = 0.35, PITCH = 0.335, ROWZ = [-0.8, -0.27, 0.26, 0.79];
    const SHAPE_GEO = { ball: new THREE.SphereGeometry(0.09, 12, 8), ring: new THREE.TorusGeometry(0.08, 0.032, 8, 18), cone: new THREE.ConeGeometry(0.09, 0.17, 4), cube: new THREE.BoxGeometry(0.14, 0.14, 0.14) };

    function letterTex(ch) {
      const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
      x.fillStyle = C.paper; x.fillRect(0, 0, 64, 64); x.fillStyle = C.ink; x.font = 'bold 38px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(ch, 32, 35);
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.magFilter = THREE.NearestFilter; return t;
    }
    // aile başına bir Montour bebeği; tuşlardakiler onun kopyası (geometri / doku paylaşılır)
    const proto = FAM.map((f) => { const o = ctx.char(f.id); o.root.scale.setScalar(0.36); return o; });
    const capGeo = new THREE.BoxGeometry(0.27, 0.07, 0.27), topGeo = new THREE.PlaneGeometry(0.16, 0.16);
    const live = [];
    ROWS.forEach((row, r) => [...row].forEach((ch, c) => {
      const x = (c - (row.length - 1) / 2) * PITCH + r * 0.06, z = ROWZ[r];
      const cap = new THREE.Group(); cap.position.set(x, TOP - 0.03, z);
      cap.add(ctx.mesh(capGeo, ctx.toon(r % 2 ? 'paper' : 'mid'), 0, 0, 0));
      const top = ctx.mesh(topGeo, ctx.flat('#ffffff', { map: letterTex(ch) }), 0, 0.03, 0.15, false); top.rotation.x = -0.5; top.userData.noOutline = true; cap.add(top); // harf tuşun ön yüzünde: müzisyen arkasında durur
      group.add(cap);
      const m = proto[r].root.clone(); m.position.set(x, TOP, z - 0.06); m.rotation.y = (Math.sin(c * 7 + r) * 0.25);
      const size = 0.33 + ((c * 7 + r * 3) % 4) * 0.012; m.scale.setScalar(size); group.add(m);
      const note = ctx.mesh(SHAPE_GEO[FAM[r].shape], ctx.flat(FAM[r].col), 0, 0, 0, false); note.visible = false; group.add(note);
      live.push({ ch, r, c, x, z: z - 0.06, cap, m, size, note, start: -9, phase: (c * 1.7 + r) % 6, ry: m.rotation.y });
    }));
    // şef: sahnenin önünde, bandoya dönük
    const cond = ctx.place.s.chars[0], condBox = cond && cond.root.parent, condWas = condBox && condBox.position.clone();
    let audio = null, notes = 0, nowT = 0;

    // ses: satır = aile (tını, oktav) · sütun = nota · soldaki tuş soldan duyulur
    function sound(l) {
      if (!D.sound || !(audio = ctx.audio())) return;
      const t = audio.currentTime + 0.08, f = [523, 262, 196, 110][l.r] * Math.pow(2, PENTA[l.c % PENTA.length] / 12);
      const g = audio.createGain(); g.connect(audio.destination);
      const pan = audio.createStereoPanner(); pan.pan.value = Math.max(-1, Math.min(1, (l.c - 4.5) / 6)); pan.connect(g);
      const o = audio.createOscillator(); let tail = 0.6;
      if (l.r === 0) { o.type = 'sine'; o.frequency.value = f; o.connect(pan); tail = 1.2; const o2 = audio.createOscillator(); o2.frequency.value = f * 2.76; o2.connect(pan); o2.start(t); o2.stop(t + 0.4); }
      else if (l.r === 1) { o.type = 'sawtooth'; o.frequency.value = f; const lp = audio.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.setValueAtTime(400, t); lp.frequency.linearRampToValueAtTime(1400, t + 0.08); o.connect(lp); lp.connect(pan); tail = 0.5; }
      else if (l.r === 2) { o.type = 'triangle'; o.frequency.value = f; o.connect(pan); tail = 0.8; }
      else { o.type = 'sine'; o.frequency.setValueAtTime(f * 2, t); o.frequency.exponentialRampToValueAtTime(f * 0.6, t + 0.15); o.connect(pan); tail = 0.3; }
      const peak = D.agency === 'single' ? 0.04 : D.agency === 'group' ? 0.08 : 0.18; // çok kişi çalınca kısılsın
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(peak, t + 0.01); g.gain.exponentialRampToValueAtTime(0.001, t + tail * D.life);
      o.start(t); o.stop(t + tail * D.life + 0.05);
    }
    function ruleFor(hit) { return D.agency === 'full' ? [hit] : D.agency === 'group' ? live.filter((l) => l.r === hit.r) : live; }
    function act(hit) {
      ruleFor(hit).forEach((l) => { const d = (Math.abs(l.c - hit.c) + Math.abs(l.r - hit.r)) * D.stagger; l.start = nowT + d; notes++; ctx.schedule(() => sound(l), d * 1000); });
      ctx.flash(2);
    }
    function setAgency(a) { D.agency = a; ctx.renderTexts(); }

    // Lasseter: hazırlık (çömel) → eylem (fırla, uza) → yay + takip (nota uçar, kapak yaylanır) → oturma (sönümlü yay)
    const springy = (u, amp, k = 9, w = 18) => 1 - amp * Math.exp(-u * k) * Math.cos(u * w);
    function bodyAt(u) {
      if (u < 0) return { sy: 1, jump: 0, lean: 0 };
      if (u < 0.08) { const k = u / 0.08, e = 1 - (1 - k) ** 2; return { sy: 1 - 0.28 * e, jump: 0, lean: -0.22 * e }; }
      if (u < 0.2) { const k = (u - 0.08) / 0.12; return { sy: 0.72 + 0.58 * k, jump: 0.16 * Math.sin(k * Math.PI / 2), lean: -0.22 + 0.36 * k }; }
      if (u < 0.45) { const k = (u - 0.2) / 0.25; return { sy: 1.3 - 0.18 * k, jump: 0.16 * (1 - k * k), lean: 0.14 * (1 - k) }; }
      return { sy: springy(u - 0.45, 0.24), jump: 0, lean: 0 };
    }
    function pose(l, t) {
      let u = t - l.start; if (u < 0 || u > 1.6) u = -1;
      const b = bodyAt(u), breathe = u < 0 ? Math.sin(t * 2.2 + l.phase) * 0.025 : 0, sy = b.sy + breathe, sx = 1 / Math.sqrt(sy);
      l.m.scale.set(l.size * sx, l.size * sy, l.size * sx); l.m.position.y = TOP + b.jump; l.m.rotation.x = b.lean;
      l.m.rotation.y = l.ry + (u >= 0 && u < 0.5 ? Math.sin(u * 30) * 0.08 : 0);
      // tuş kapağı: basılır, yaylanıp geri gelir
      l.cap.position.y = TOP - 0.03 - (u >= 0 && u < 0.6 ? 0.03 * Math.exp(-u * 6) * Math.cos(u * 22) : 0);
      // nota şekli: 0.12 s'de çıkar, yay çizerek yükselir, büyüyüp söner
      const nu = u - 0.12; l.note.visible = D.shapes && u >= 0 && nu > 0 && nu < 0.9 * D.life + 0.1;
      if (l.note.visible) {
        const span = 0.9 * D.life + 0.1, e = 1 - (1 - Math.min(1, nu / span)) ** 3;
        l.note.position.set(l.x + Math.sin(nu * 5 + l.phase) * 0.08, TOP + 0.55 + e * 0.7, l.z);
        l.note.scale.setScalar(springy(nu, 1, 7, 14) * Math.max(0, 1 - Math.max(0, nu - span * 0.66) / (span * 0.34)) * 1.2);
        l.note.rotation.set(nu * 4, nu * 6, 0);
      }
      return u >= 0 && u < 0.6;
    }
    let lastPlaying = 0, demoOn = false, nextDemo = 0;
    return {
      start() {
        ctx.hide(1, 3, 4, 5, 6, 7, 9, 10, 11, 12); // klavye halısı, direkler, çatı, bayrak, dört bando bebeği: oyunda tuşlar ve müzisyenler var
        if (condBox) { condBox.position.set(0, 0.3, 1.62); condBox.scale.setScalar(0.62); }
        live.forEach((l) => { l.start = -9; });
      },
      stop() { if (condBox) { condBox.position.copy(condWas); condBox.scale.setScalar(1); } live.forEach((l) => { l.note.visible = false; }); },
      begin() {},
      key(e, down) {
        if (!down || e.repeat || e.ctrlKey || e.metaKey || e.altKey) return false;
        if (e.code === 'Space') { e.preventDefault(); setAgency(AGENCIES[(AGENCIES.indexOf(D.agency) + 1) % 3]); return true; }
        const ch = e.code.replace('Key', '').replace('Digit', ''); // e.code klavye düzeninden bağımsız: Türkçe Q'da da G = KeyG
        const hit = live.find((l) => l.ch === ch); if (!hit) return false;
        e.preventDefault(); act(hit); return true;
      },
      pointer(type, e) {
        if (type !== 'down') return;
        const p = ctx.toLocal(e, TOP); if (!p) return;
        let best = null, bd = 0.24; live.forEach((l) => { const d = Math.hypot(l.x - p.x, l.z - p.z); if (d < bd) { bd = d; best = l; } });
        if (best) act(best);
      },
      frame(t) {
        nowT = t; let k = 0, playing = 0;
        if (demoOn && t > nextDemo) { act(live[Math.floor(Math.random() * live.length)]); nextDemo = t + 0.18 + Math.random() * 0.3; } // tanıtım: kendi kendine çalar
        live.forEach((l) => { if (pose(l, t)) { playing++; if (D.agency === 'full' && k < 12) ctx.tag(k++, l.ch + ' · ' + NOTE_NAMES[l.c % 5], new THREE.Vector3(l.x, TOP + 0.62, l.z), true, 0); } });
        ctx.tagsFrom(k); lastPlaying = playing;
        if (cond) ctx.animChar(cond, t * (playing ? 2.5 : 1));
      },
      hud: () => ({ agency: D.agency, nPlay: lastPlaying, nNotes: notes }),
      rule: () => ({ single: 'any key → whole band', group: 'key → its row', full: 'key → its musician' }[D.agency]),
      caption: () => ({ single: 'One key, everyone answers. A nudge, not a choice.', group: 'Each row is a family. You pick who plays.', full: 'Every key is a musician waiting for you.' }[D.agency]),
      status: () => 'agency: ' + D.agency + ' · playing: ' + lastPlaying + ' · notes: ' + notes,
      knob() {},
      demo() { demoOn = true; ctx.playing(true); }
    };
  }
};
