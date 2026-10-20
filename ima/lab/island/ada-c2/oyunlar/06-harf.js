// 06 · Letter Rain — Meteoroloji İstasyonu. Avluya bir cümlenin harfleri yağar; kamera açıksa bedeninin üstüne, değilse şemsiyene konar.
// Girdi: kamera (getUserMedia) ya da pointermove · Kural: isSolid(x, y) · Durum: harflerin yüksekliği, son kamera karesi · Çıktı: düşen / duran harfler, silüet
window.OYUNLAR = window.OYUNLAR || {};
window.OYUNLAR['06'] = {
  key: '06', title: 'Letter Rain', premise: 'Context', premiseText: 'Interaction does not stop at the edge of the screen.', promise: 'Treat the world beyond the screen as design space.',
  source: 'Text Rain — Camille Utterback & Romy Achituv (1999)',
  caption: 'The screen ends. The rain doesn’t.', hint: 'move the umbrella · or stand in front of the camera · C code · B island',
  anat: ['webcam · pointer', 'isSolid(x, y)', 'letters[ ].y', 'letters land'], hot: 1,
  hud: [['INPUT', 'inMode'], ['RESTING', 'resting', 'ghosts'], ['FALLING', 'falling']],
  design: { text: 'interaction does not stop at the edge of the screen', fallSpeed: 0.35, threshold: 90, darkIsSolid: true, umbrella: 0.7, showSilhouette: true },
  knobs: [
    { key: 'fallSpeed', step: 0.05, min: 0.05, max: 2, note: 'units / s' }, { key: 'threshold', step: 10, min: 10, max: 245, note: '0–255 · camera' },
    { key: 'darkIsSolid', type: 'bool', note: 'dark things hold letters' }, { key: 'umbrella', step: 0.1, min: 0.2, max: 2, note: 'mouse mode width' },
    { key: 'showSilhouette', type: 'bool', note: 'draw what counts as solid' }],
  code: ['<span class="c">// 4) RULE: the whole game is this one function</span>', '<span class="k">function</span> isSolid(x, y) {', '  <span class="k">if</span> (mode === \'mouse\') <span class="k">return</span> underUmbrella(x, y);',
    '  <span class="k">const</span> b = brightness(camera, x, y);', '  <span class="k">return</span> DESIGN.darkIsSolid ? b &lt; DESIGN.threshold : b &gt; DESIGN.threshold;', '}'],
  tasks: ['Tune <b>threshold</b> and <b>darkIsSolid</b> to the light in the room. Whose body holds letters, whose does not? Is the sensing fair to everyone?', 'Change the rule: letters that touch a body change colour, or jump up, instead of resting.', 'Add another input from the world: the clock (night = slow letters) or the window size.'],
  question: 'What in this room could be an input?',
  overlay: { title: 'This sketch can use your camera.', text: 'Letters fall in the station yard and rest on your body. The image stays in this browser: nothing is recorded or sent.', choices: [] },
  view: { at: [0, 1.25, 0.35], zoom: 3.3, pitch: 0.3 },

  make(ctx) {
    const { THREE, D, C, group } = ctx;
    const W = 3.0, H = 2.5, X0 = -W / 2, Y0 = 0.08, Z = 0.35, SIZE = 0.2;
    let mode = null, letters = [], pixels = null, sW = 160, sH = 120, stream = null, video = null;
    const sampler = document.createElement('canvas'), sctx = sampler.getContext('2d', { willReadFrequently: true });
    const pointer = { x: 0, y: 1.4, seen: false };
    // harf dokuları (renk × harf), bir kez
    const texCache = {};
    function letterTex(ch, col) {
      const k = ch + col; if (texCache[k]) return texCache[k];
      const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d');
      x.font = 'bold 50px monospace'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.lineJoin = 'round';
      x.strokeStyle = C.paper; x.lineWidth = 10; x.strokeText(ch, 32, 36); x.fillStyle = C[col]; x.fillText(ch, 32, 36); // kâğıt kenarlık: her zeminde okunur
      const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return (texCache[k] = t);
    }
    const geo = new THREE.PlaneGeometry(SIZE, SIZE), COLS = ['hot', 'warm', 'cool', 'green', 'ink'];
    function makeLetters() {
      letters.forEach((l) => group.remove(l.m));
      const chars = [...D.text].filter((ch) => ch !== ' ');
      letters = chars.map((ch, i) => { const col = COLS[i % COLS.length], m = ctx.mesh(geo, ctx.flat('#ffffff', { map: letterTex(ch, col), transparent: true, alphaTest: 0.4 }), 0, 0, Z + 0.02, false);
        m.userData.noOutline = true; group.add(m); return { ch, m, x: X0 + (i + 0.5) / chars.length * W, y: H * (0.5 + Math.random() * 0.6), resting: false, wob: Math.random() * 6 }; });
    }
    makeLetters();
    // silüet: yalnız "katı" sayılan bölgeler (gerçek görüntü değil — mahremiyet kararı)
    const sil = document.createElement('canvas'); sil.width = 160; sil.height = 120; const silx = sil.getContext('2d');
    const silTex = new THREE.CanvasTexture(sil); silTex.magFilter = THREE.NearestFilter;
    const silMesh = ctx.mesh(new THREE.PlaneGeometry(W, H), ctx.flat('#ffffff', { map: silTex, transparent: true }), 0, Y0 + H / 2, Z - 0.01, false); silMesh.visible = false; silMesh.userData.noOutline = true; group.add(silMesh);
    // şemsiye (fare modu)
    const umb = new THREE.Group(); group.add(umb);
    const canopy = ctx.mesh(new THREE.SphereGeometry(0.5, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), ctx.toon('hot'), 0, 0, 0); canopy.scale.set(1, 0.38, 0.3); umb.add(canopy);
    umb.add(ctx.mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.5, 6), ctx.toon('ink'), 0, -0.25, 0));
    const crook = ctx.mesh(new THREE.TorusGeometry(0.04, 0.012, 6, 12, Math.PI), ctx.toon('ink'), -0.04, -0.5, 0); crook.rotation.z = Math.PI; umb.add(crook);
    umb.visible = false;
    const fore = ctx.place.s.chars[0], foreBox = fore && fore.root.parent, foreWas = foreBox && foreBox.position.clone();

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { width: 640, height: 480 }, audio: false });
        video = video || Object.assign(document.createElement('video'), { playsInline: true, muted: true });
        video.srcObject = stream; await video.play();
        sH = Math.round(sW * video.videoHeight / video.videoWidth) || 120; sampler.width = sW; sampler.height = sH; sil.width = sW; sil.height = sH;
        mode = 'camera'; ctx.playing(true);
      } catch (err) {
        ctx.overlay(Object.assign({}, choices(), { error: 'Camera not available (' + err.name + '). Use the mouse, or open the island from a local server (http://localhost).' }));
      }
    }
    function useMouse() { mode = 'mouse'; ctx.playing(true); }
    const choices = () => ({ title: 'This sketch can use your camera.', text: 'Letters fall in the station yard and rest on your body. The image stays in this browser: nothing is recorded or sent.', choices: [['USE CAMERA', startCamera], ['USE MOUSE INSTEAD', useMouse]] });
    function stopCamera() { if (stream) stream.getTracks().forEach((t) => t.stop()); stream = null; pixels = null; }

    function sample() { if (mode !== 'camera' || !video || video.readyState < 2) return; sctx.drawImage(video, 0, 0, sW, sH); pixels = sctx.getImageData(0, 0, sW, sH).data; }
    // düzlem koordinatı: x (sol → sağ), y (yerden yukarı)
    function isSolid(x, y) {
      if (y <= 0) return false;
      if (mode === 'mouse') return Math.abs(x - pointer.x) < D.umbrella / 2 && y <= pointer.y && y > pointer.y - 0.05;
      if (mode === 'camera' && pixels) {
        const sx = Math.floor((1 - (x - X0) / W) * sW), sy = Math.floor((1 - y / H) * sH); // aynalı
        if (sx < 0 || sx >= sW || sy < 0 || sy >= sH) return false;
        const i = (sy * sW + sx) * 4, b = (pixels[i] + pixels[i + 1] + pixels[i + 2]) / 3;
        return D.darkIsSolid ? b < D.threshold : b > D.threshold;
      }
      return false;
    }
    function drawSil() {
      silMesh.visible = mode === 'camera' && !!pixels && D.showSilhouette; if (!silMesh.visible) return;
      silx.clearRect(0, 0, sW, sH); silx.fillStyle = ctx.night() ? C.paper : C.ink; silx.globalAlpha = 0.55;
      for (let sy = 0; sy < sH; sy += 2) for (let sx = 0; sx < sW; sx += 2) { const x = X0 + (1 - (sx + 1) / sW) * W, y = (1 - (sy + 1) / sH) * H; if (isSolid(x, y)) silx.fillRect(sW - 2 - sx, sy, 2, 2); }
      silTex.needsUpdate = true;
    }
    let resting = 0, demoOn = false;
    return {
      start() {
        ctx.hide(5); // hava kafesi: harflerin önünü kapatıyordu
        if (foreBox) foreBox.position.set(1.75, 0.08, 1.0);
        letters.forEach((l) => { l.y = H * (0.4 + Math.random() * 0.7); });
        if (!mode || mode === 'camera' && !stream) ctx.overlay(choices()); else ctx.playing(true);
      },
      stop() { stopCamera(); if (mode === 'camera') mode = null; umb.visible = false; silMesh.visible = false; if (foreBox) foreBox.position.copy(foreWas); },
      pointer(type, e) {
        if (type === 'leave') { pointer.seen = false; return; }
        if (type !== 'move' && type !== 'down') return;
        const p = ctx.toLocal(e, 0, 'z', Z); if (!p) return; pointer.x = p.x; pointer.y = p.y - Y0; pointer.seen = true;
      },
      frame(t, dt) {
        if (demoOn) { mode = 'mouse'; pointer.x = Math.sin(t * 0.5) * 0.9; pointer.y = 1.3 + Math.sin(t * 0.8) * 0.2; pointer.seen = true; }
        sample();
        resting = 0;
        letters.forEach((l) => {
          if (isSolid(l.x, l.y - 0.01)) { let lift = 0; while (isSolid(l.x, l.y) && lift < 8) { l.y += 0.01; lift++; } l.resting = true; resting++; }
          else { l.resting = false; l.y -= D.fallSpeed * dt; }
          if (l.y < 0.02) l.y = H + Math.random() * 0.3; // yere değen harf erir, yukarıdan yeniden düşer
          const sway = l.resting ? 0 : Math.sin(t * 2 + l.wob) * 0.012;
          l.m.position.set(l.x + sway, Y0 + l.y + SIZE * 0.45, Z + 0.02); l.m.rotation.z = l.resting ? 0 : Math.sin(t * 3 + l.wob) * 0.15;
          const sq = l.resting ? 1 : 1 + Math.min(0.25, D.fallSpeed * 0.15); l.m.scale.set(1 / Math.sqrt(sq), sq, 1); // düşerken hafif uzar
        });
        umb.visible = mode === 'mouse' && pointer.seen && ctx.isPlaying();
        if (umb.visible) { umb.position.set(pointer.x, Y0 + pointer.y + 0.02, Z + 0.03); umb.scale.setScalar(D.umbrella / 1.0); umb.rotation.z = Math.sin(t * 2) * 0.04; }
        drawSil();
        if (fore) ctx.animChar(fore, t);
      },
      hud: () => ({ inMode: mode || '—', resting, falling: letters.length - resting }),
      rule: () => mode === 'camera' ? (D.darkIsSolid ? 'brightness < ' : 'brightness > ') + D.threshold : 'under the umbrella',
      caption: () => mode === 'camera' ? 'Letters land on you. The screen ends. The rain doesn’t.' : mode === 'mouse' ? 'Catch the sentence with your umbrella.' : 'The screen ends. The rain doesn’t.',
      status: () => 'input: ' + (mode || '—') + ' · resting: ' + resting + ' / ' + letters.length,
      knob(k) { if (k === 'text') makeLetters(); },
      demo() { demoOn = true; mode = 'mouse'; ctx.playing(true); }
    };
  }
};
