// Takımada · parça motoru
// Tarif (veri) → three.js nesnesi. Görünümden bağımsız: tarif yalnız RENK ROLÜ söyler (paper, ink, hot, warm, cool, pink, green, wood, mid);
// rolün gerçek renge dönüşmesi ve ekranda nasıl basılacağı (düz boya, desen atlası, 1-bit…) görünüm katmanının işi.
//
// createParts(THREE, renderer) → { build(recipe, colors), SHAPES, PATTERNS, MOTIONS }
// Not: file:// üzerinde JSON dosyası okunamadığı için tarifler .js dosyalarında JSON uyumlu nesneler olarak durur.

function createParts(THREE, renderer) {
  let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  const ANISO = renderer ? renderer.capabilities.getMaxAnisotropy() : 1;
  const S = 1024, SEG = 64;
  const cache = new Map();

  // ================= Desenler (elle boyanmış) =================
  function wobbly(x, x0, y0, x1, y1, amp = S * 0.004, cont = false) { // cont: yolu kesmeden devam et (dolgu için)
    const n = 24, L = Math.hypot(x1 - x0, y1 - y0) || 1;
    for (let i = 0; i <= n; i++) {
      const t = i / n, px = x0 + (x1 - x0) * t, py = y0 + (y1 - y0) * t, j = Math.sin(t * 17 + x0 * 0.01 + y0 * 0.013) * amp + (rnd() - 0.5) * amp * 0.6;
      i || cont ? x.lineTo(px - (y1 - y0) / L * j, py + (x1 - x0) / L * j) : x.moveTo(px, py);
    }
  }
  const PATTERNS = {
    stripe: (x, [bg, fg]) => { for (let i = 0; i < 8; i += 2) { x.beginPath(); wobbly(x, 0, i * S / 8, S, i * S / 8); wobbly(x, S, (i + 1) * S / 8, 0, (i + 1) * S / 8, S * 0.004, true); x.fillStyle = fg; x.fill(); } },
    diag: (x, [bg, fg]) => { x.strokeStyle = fg; x.lineWidth = S / 9; x.lineCap = 'butt'; for (let i = -S; i < 2 * S; i += S / 4) { x.beginPath(); wobbly(x, i, -10, i + S * 0.6, S + 10, S * 0.006); x.stroke(); } },
    harl: (x, [bg, fg, f2 = fg, f3 = fg]) => {
      const w = S / 4, h = S / 4, cs = [fg, bg, f2, f3];
      for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) {
        x.fillStyle = cs[(r * 3 + c) % 4]; x.beginPath();
        const up = (c + r) % 2 === 0, x0 = c * w / 2 - w / 2, j = () => (rnd() - 0.5) * S * 0.006;
        if (up) { x.moveTo(x0 + j(), (r + 1) * h + j()); x.lineTo(x0 + w / 2 + j(), r * h + j()); x.lineTo(x0 + w + j(), (r + 1) * h + j()); }
        else { x.moveTo(x0 + j(), r * h + j()); x.lineTo(x0 + w + j(), r * h + j()); x.lineTo(x0 + w / 2 + j(), (r + 1) * h + j()); }
        x.fill();
      }
    },
    fur: (x, [bg, fg]) => { x.strokeStyle = fg; x.lineCap = 'round'; x.lineWidth = S * 0.007; for (let i = 0; i < 260; i++) { const px = rnd() * S, py = rnd() * S, L = S * (0.035 + rnd() * 0.03), b = (rnd() - 0.5) * S * 0.02; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + b, py + L * 0.5, px + b * 0.4, py + L); x.stroke(); } },
    feathers: (x, [bg, fg]) => { x.strokeStyle = fg; x.lineWidth = S * 0.008; x.lineCap = 'round'; for (let r = 0; r < 9; r++) for (let c = 0; c < 9; c++) { const cx = (c + (r % 2) * 0.5) * S / 8, cy = r * S / 8; x.beginPath(); x.arc(cx, cy, S / 16, 0.15 * Math.PI, 0.85 * Math.PI); x.stroke(); } },
    dots: (x, [bg, fg]) => { x.fillStyle = fg; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { x.beginPath(); x.ellipse((i + 0.5 + (j % 2) * 0.5) * S / 4, (j + 0.5) * S / 4, S / 22, S / 22, 0, 0, 7); x.fill(); } },
    checker: (x, [bg, fg]) => { x.fillStyle = fg; for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) if ((i + j) % 2) x.fillRect(i * S / 8 + (rnd() - 0.5) * 4, j * S / 8 + (rnd() - 0.5) * 4, S / 8, S / 8); },
    zig: (x, [bg, fg]) => { x.strokeStyle = fg; x.lineWidth = S / 14; x.lineJoin = 'miter'; for (let r = 0; r < 3; r++) { x.beginPath(); for (let i = 0; i <= 8; i++) x.lineTo(i * S / 8, S * (0.2 + r * 0.3) + (i % 2 ? -S / 14 : S / 14)); x.stroke(); } },
    waves: (x, [bg, fg]) => { x.strokeStyle = fg; x.lineWidth = S * 0.03; x.lineCap = 'round'; for (let r = 0; r < 5; r++) { x.beginPath(); for (let i = 0; i <= 64; i++) x.lineTo(i * S / 64, (r + 0.5) * S / 5 + Math.sin(i / 64 * Math.PI * 8) * S * 0.025); x.stroke(); } },
    band: (x, [bg, fg, f2 = fg, f3 = fg]) => { x.fillStyle = fg; x.fillRect(0, S * 0.8, S, S * 0.2); x.fillStyle = f2; x.fillRect(0, S * 0.72, S, S * 0.05); x.fillStyle = f3; for (let i = 0; i < 8; i++) { x.beginPath(); x.moveTo(i * S / 8, S * 0.8); x.lineTo((i + 0.5) * S / 8, S * 0.88); x.lineTo((i + 1) * S / 8, S * 0.8); x.fill(); } },
    blocks: (x, [bg, fg, f2 = fg, f3 = fg]) => { x.fillStyle = fg; x.fillRect(S * 0.36, 0, S * 0.28, S * 0.78); x.fillStyle = f2; x.fillRect(S * 0.36, S * 0.62, S * 0.28, S * 0.3); x.fillStyle = f3; x.fillRect(S * 0.66, S * 0.62, S * 0.2, S * 0.3); x.fillRect(S * 0.12, S * 0.62, S * 0.16, S * 0.3); x.fillStyle = fg; x.fillRect(0, S * 0.92, S, S * 0.08); },
    // önden okunan "kıyafet" desenleri: dokunun ortası (u = 0.5) karakterin önüne gelir
    apron: (x, [bg, fg, f2 = fg]) => { x.fillStyle = fg; x.beginPath(); x.moveTo(S * 0.38, S * 0.3); x.lineTo(S * 0.62, S * 0.3); x.lineTo(S * 0.66, S * 0.95); x.lineTo(S * 0.34, S * 0.95); x.fill(); x.fillStyle = f2; x.fillRect(S * 0.44, S * 0.55, S * 0.12, S * 0.1); x.fillRect(0, S * 0.28, S, S * 0.03); },
    buttons: (x, [bg, fg, f2 = fg]) => { x.fillStyle = fg; x.fillRect(S * 0.495, 0, S * 0.01, S); x.fillStyle = f2; for (let i = 0; i < 4; i++) { x.beginPath(); x.arc(S * 0.53, S * (0.2 + i * 0.18), S * 0.012, 0, 7); x.fill(); } x.fillRect(0, S * 0.94, S, S * 0.06); },
    sailor: (x, [bg, fg, f2 = fg]) => { x.fillStyle = fg; for (let i = 0; i < 6; i++) x.fillRect(0, S * (0.42 + i * 0.1), S, S * 0.04); x.fillStyle = f2; x.beginPath(); x.moveTo(S * 0.4, 0); x.lineTo(S * 0.5, S * 0.22); x.lineTo(S * 0.6, 0); x.fill(); },
    // dönel gövdede dokunun alt 1/6'sı taban diskine düşer → etek zikzakı onun hemen üstüne
    ghost: (x, [bg, fg]) => { x.fillStyle = fg; x.beginPath(); x.moveTo(0, S * 0.84); for (let i = 0; i <= 12; i++) x.lineTo(i * S / 12, S * (i % 2 ? 0.7 : 0.78)); x.lineTo(S, S * 0.84); x.fill(); },
    spiral: (x, [bg, fg, f2 = fg]) => { x.strokeStyle = fg; x.lineWidth = S * 0.014; x.lineCap = 'round'; x.beginPath(); for (let a = 0; a < 15; a += 0.05) x.lineTo(S / 2 + Math.cos(a) * a * S * 0.02, S * 0.42 + Math.sin(a) * a * S * 0.02); x.stroke(); x.fillStyle = f2; x.fillRect(S * 0.4, S * 0.7, S * 0.2, S * 0.16); },
    bars: (x, [bg, fg]) => { x.fillStyle = fg; for (let i = 0; i < 8; i += 2) { x.beginPath(); wobbly(x, i * S / 8, 0, i * S / 8, S); wobbly(x, (i + 1) * S / 8, S, (i + 1) * S / 8, 0, S * 0.004, true); x.fill(); } },
    stars: (x, [bg, fg]) => { x.fillStyle = fg; for (let i = 0; i < 18; i++) { const cx = rnd() * S, cy = rnd() * S * 0.85, r = S * (0.012 + rnd() * 0.012); x.beginPath(); for (let k = 0; k < 10; k++) { const a = -Math.PI / 2 + k * Math.PI / 5, rr = k % 2 ? r * 0.45 : r; x.lineTo(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr); } x.fill(); } },
    chevron: (x, [bg, fg, f2 = fg]) => { x.fillStyle = fg; for (let r = 0; r < 3; r++) for (let i = 0; i < 8; i++) { const y0 = S * (0.45 + r * 0.17), x0 = i * S / 8; x.beginPath(); x.moveTo(x0, y0); x.lineTo(x0 + S / 16, y0 + S * 0.1); x.lineTo(x0 + S / 8, y0); x.lineTo(x0 + S / 8, y0 + S * 0.05); x.lineTo(x0 + S / 16, y0 + S * 0.15); x.lineTo(x0, y0 + S * 0.05); x.fill(); } x.fillStyle = f2; x.fillRect(0, S * 0.36, S, S * 0.05); },
    catpatch: (x, [bg, fg, f2 = fg]) => { // gövdenin önüne çizilmiş kedi (Girard'ın resimli gövdeleri gibi)
      x.fillStyle = f2; x.fillRect(S * 0.4, S * 0.38, S * 0.2, S * 0.36);
      x.beginPath(); x.moveTo(S * 0.4, S * 0.38); x.lineTo(S * 0.43, S * 0.28); x.lineTo(S * 0.47, S * 0.38); x.moveTo(S * 0.53, S * 0.38); x.lineTo(S * 0.57, S * 0.28); x.lineTo(S * 0.6, S * 0.38); x.fill();
      x.strokeStyle = fg; x.lineWidth = S * 0.004; for (let k = -1; k <= 1; k += 2) for (let j = 0; j < 2; j++) { x.beginPath(); x.moveTo(S * 0.5, S * (0.47 + j * 0.02)); x.lineTo(S * (0.5 + k * 0.12), S * (0.45 + j * 0.04)); x.stroke(); }
      x.fillStyle = fg; [0.46, 0.54].forEach((u) => { x.beginPath(); x.arc(S * u, S * 0.44, S * 0.008, 0, 7); x.fill(); });
      for (let i = 0; i < 40; i++) x.fillRect(S * (0.41 + rnd() * 0.18), S * (0.52 + rnd() * 0.2), S * 0.004, S * 0.012);
      x.fillRect(0, S * 0.9, S, S * 0.1);
    },
    yarn: (x, [bg, fg, f2 = fg]) => { // koyu gövde, önde açık pano + yumak
      x.fillStyle = f2; x.fillRect(S * 0.36, S * 0.3, S * 0.28, S * 0.3);
      x.strokeStyle = fg; x.lineWidth = S * 0.006; x.beginPath(); x.arc(S * 0.5, S * 0.45, S * 0.07, 0, 7); x.stroke();
      for (let k = 0; k < 4; k++) { x.beginPath(); x.ellipse(S * 0.5, S * 0.45, S * 0.07, S * 0.025, k * 0.8, 0, 7); x.stroke(); }
      x.strokeStyle = f2; x.lineWidth = S * 0.008; x.beginPath(); x.moveTo(S * 0.5, S * 0.62); x.bezierCurveTo(S * 0.45, S * 0.75, S * 0.6, S * 0.82, S * 0.52, S * 0.95); x.stroke();
      x.fillStyle = f2; for (let i = 0; i < 60; i++) x.fillRect(rnd() * S, rnd() * S * 0.28, S * 0.004, S * 0.014);
    },
    ribs: (x, [bg, fg]) => { x.strokeStyle = fg; x.lineWidth = S * 0.012; for (let i = 0; i < 12; i++) { x.beginPath(); wobbly(x, i * S / 12, 0, i * S / 12, S, S * 0.003); x.stroke(); } }
  };
  function patternCanvas(kind, cols) {
    const key = 'p' + kind + cols.join();
    if (cache.has(key)) return cache.get(key);
    const cv = document.createElement('canvas'); cv.width = cv.height = S;
    const x = cv.getContext('2d'); x.fillStyle = cols[0]; x.fillRect(0, 0, S, S); x.lineJoin = 'round';
    (PATTERNS[kind] || (() => {}))(x, cols);
    cache.set(key, cv); return cv;
  }
  function texFrom(cv, rep = [1, 1]) {
    const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace;
    t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rep[0], rep[1]); t.anisotropy = ANISO; return t;
  }

  // ================= Biçimler =================
  const lathe = (pts) => new THREE.LatheGeometry(pts.map(([a, b]) => new THREE.Vector2(a, b)), SEG).rotateY(Math.PI); // desenin ortası öne
  function latheUV(pts) {
    return (y) => {
      for (let i = 0; i < pts.length - 1; i++) {
        const [r0, y0] = pts[i], [r1, y1] = pts[i + 1];
        if (y >= y0 && y <= y1 && y1 > y0) { const t = (y - y0) / (y1 - y0), r = r0 + (r1 - r0) * t; return { v: (i + t) / (pts.length - 1), dv: 1 / (pts.length - 1) / (y1 - y0), circ: 2 * Math.PI * r, r }; }
      }
      return { v: 0.5, dv: 2, circ: 1, r: 0.15 };
    };
  }
  const BODY_PTS = {
    bell:      [[0, 0], [0.3, 0], [0.31, 0.12], [0.29, 0.42], [0.21, 0.62], [0.09, 0.74], [0, 0.75]],
    column:    [[0, 0], [0.2, 0], [0.24, 0.95], [0.1, 1.0], [0, 1.0]],
    hourglass: [[0, 0], [0.28, 0], [0.27, 0.12], [0.19, 0.38], [0.28, 0.66], [0.15, 0.76], [0, 0.77]],
    bottle:    [[0, 0], [0.25, 0], [0.26, 0.55], [0.2, 0.7], [0.1, 0.86], [0.05, 0.95], [0, 0.96]],
    cone:      [[0, 0], [0.3, 0], [0.26, 0.2], [0.13, 0.78], [0, 0.8]],
    barrel:    [[0, 0], [0.22, 0], [0.28, 0.2], [0.29, 0.4], [0.26, 0.6], [0.16, 0.68], [0, 0.7]],
    pear:      [[0, 0], [0.3, 0], [0.33, 0.14], [0.28, 0.38], [0.17, 0.58], [0.09, 0.66], [0, 0.67]],
    ghost:     [[0, 0], [0.31, 0], [0.29, 0.1], [0.26, 0.45], [0.2, 0.64], [0.09, 0.74], [0, 0.75]]
  };
  const BODIES = Object.fromEntries(Object.entries(BODY_PTS).map(([k, p]) => [k, { geo: () => lathe(p), h: p[p.length - 2][1], r: Math.max(...p.map((q) => q[0])), shoulder: p[p.length - 3][0], base: p[1][0] }]));
  BODIES.block = { geo: () => new THREE.BoxGeometry(0.5, 0.78, 0.38).translate(0, 0.39, 0), h: 0.78, r: 0.25, shoulder: 0.25, base: 0.25, box: true };

  const HEAD_PTS = {
    drop: [[0, 0], [0.12, 0.03], [0.17, 0.14], [0.13, 0.3], [0.05, 0.46], [0, 0.5]],
    cat:  [[0, 0], [0.14, 0.02], [0.18, 0.1], [0.18, 0.18], [0.16, 0.23], [0, 0.25]],
    owl:  [[0, 0], [0.17, 0.02], [0.23, 0.1], [0.22, 0.18], [0.15, 0.24], [0, 0.25]],
    acorn: [[0, 0], [0.1, 0.02], [0.16, 0.1], [0.17, 0.18], [0.12, 0.27], [0, 0.29]]
  };
  const HEADS = {};
  Object.entries(HEAD_PTS).forEach(([k, p]) => { HEADS[k] = { geo: () => lathe(p), uv: latheUV(p), fy: { drop: 0.16, cat: 0.13, owl: 0.12, acorn: 0.13 }[k], top: p[p.length - 1][1], r: Math.max(...p.map((q) => q[0])) }; });
  HEADS.ball = { geo: () => new THREE.SphereGeometry(0.17, SEG, 40).rotateY(-Math.PI / 2).translate(0, 0.16, 0), fy: 0.15, top: 0.33, r: 0.17,
                 uv: (y) => { const dy = Math.max(-0.165, Math.min(0.165, y - 0.16)), r = Math.sqrt(0.17 * 0.17 - dy * dy); return { v: 1 - Math.acos(dy / 0.17) / Math.PI, dv: 1 / (Math.PI * r), circ: 2 * Math.PI * r, r }; } };
  HEADS.flat = { geo: () => new THREE.CylinderGeometry(0.24, 0.15, 0.26, 4).rotateY(Math.PI / 4 + Math.PI).translate(0, 0.13, 0), fy: 0.12, top: 0.26, r: 0.22,
                 uv: (y) => { const r = 0.15 + 0.09 * (y / 0.26); return { v: y / 0.26, dv: 1 / 0.26, circ: 4 * Math.SQRT2 * r, r }; } };
  HEADS.spike = { geo: () => new THREE.ConeGeometry(0.15, 0.52, SEG).rotateY(Math.PI).translate(0, 0.26, 0), fy: 0.1, top: 0.52, r: 0.15,
                  uv: (y) => { const r = 0.15 * (1 - y / 0.52); return { v: y / 0.52, dv: 1 / 0.52, circ: 2 * Math.PI * r, r }; } };
  // disk: yüzü öne bakan tekerlek (saat kadranı, güneş). Ön kapağa yüz boyanır.
  HEADS.disk = { geo: () => new THREE.CylinderGeometry(0.2, 0.2, 0.1, SEG).rotateX(Math.PI / 2).translate(0, 0.2, 0), fy: 0.2, top: 0.4, r: 0.2, cap: true,
                 uv: () => ({ v: 0.5, dv: 1 / 0.4, circ: 0.4, r: 0.2 }) };
  HEADS.box = { geo: () => new THREE.BoxGeometry(0.3, 0.3, 0.28).translate(0, 0.15, 0), fy: 0.15, top: 0.3, r: 0.15, box: true,
                uv: () => ({ v: 0.5, dv: 1 / 0.3, circ: 0.3, r: 0.15 }) };

  // ================= Yüz =================
  const FACE_DEFAULT = { eyes: 'ring', brows: true, mouth: 'smile', cheeks: false, nose: false, mask: false, mustache: false, clock: false };
  function headTexture(head, paint, face, C) {
    const col = (k) => C[k] || k, Hd = HEADS[head], f = Object.assign({}, FACE_DEFAULT, face);
    const W = Hd.cap || Hd.box ? 512 : 1024, H = 512, cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const x = cv.getContext('2d');
    if (paint.pattern) { const tile = patternCanvas(paint.pattern, paint.colors.map(col)), [rx, ry] = paint.repeat || [1, 1]; for (let i = 0; i < rx; i++) for (let j = 0; j < ry; j++) x.drawImage(tile, i * W / rx, j * H / ry, W / rx, H / ry); }
    else { x.fillStyle = col(paint.color || 'paper'); x.fillRect(0, 0, W, H); }
    const fy = Hd.fy + (f.y || 0), u = Hd.uv(fy), sx = W / u.circ, sy = H * u.dv;
    if (f.mask) { x.fillStyle = col(f.mask === true ? 'ink' : f.mask); const bh = 0.085 * sy; x.fillRect(0, (1 - u.v) * H - bh / 2, W, bh); }
    x.save(); x.translate(W / 2, (1 - u.v) * H); x.scale(sx, -sy);
    const ink = col('ink'), white = col('paper'), hot = col('hot');
    const dark = ['ink', 'hot', 'cool'].includes(paint.color) || !!f.mask, line = dark ? white : ink;
    const ell = (cx, cy, rx, ry, fill) => { x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, 7); x.fillStyle = fill; x.fill(); };
    const stroke = (w) => { x.lineWidth = w; x.strokeStyle = line; x.lineCap = 'round'; };
    if (f.clock) { // saat kadranı: 12 çentik + iki ibre
      stroke(0.008); for (let k = 0; k < 12; k++) { const a = k / 12 * Math.PI * 2; x.beginPath(); x.moveTo(Math.cos(a) * 0.15, Math.sin(a) * 0.15); x.lineTo(Math.cos(a) * (k % 3 ? 0.165 : 0.175), Math.sin(a) * (k % 3 ? 0.165 : 0.175)); x.stroke(); }
      x.strokeStyle = hot; x.lineWidth = 0.012; x.beginPath(); x.moveTo(0, -0.02); x.lineTo(0.06, 0.1); x.stroke(); x.strokeStyle = line; x.beginPath(); x.moveTo(0, -0.02); x.lineTo(-0.1, -0.02); x.stroke();
    }
    const gap = f.gap || 0.055, er = f.eyes === 'wide' ? 1.35 : 1;
    [-1, 1].forEach((s) => {
      const ex = s * gap, kind = f.eyes === 'wink' && s > 0 ? 'closed' : f.eyes;
      if (kind === 'ring' || kind === 'wide' || kind === 'wink') {
        ell(ex, 0, 0.038 * er, 0.034 * er, line); ell(ex, 0, 0.031 * er, 0.027 * er, white);
        ell(ex - s * 0.006, 0.004, 0.016 * er, 0.017 * er, ink); ell(ex - s * 0.012, 0.012, 0.005, 0.005, white);
      } else if (kind === 'dot') ell(ex, 0, 0.02, 0.016, line);
      else if (kind === 'sleepy' || kind === 'closed') {
        stroke(0.009); x.beginPath(); x.arc(ex, 0.012, 0.03, Math.PI * 1.15, Math.PI * 1.85); x.stroke();
        if (kind === 'sleepy') for (let k = -1; k <= 1; k++) { const a = Math.PI * (1.5 + k * 0.22); x.beginPath(); x.moveTo(ex + Math.cos(a) * 0.03, 0.012 + Math.sin(a) * 0.03); x.lineTo(ex + Math.cos(a) * 0.045, 0.012 + Math.sin(a) * 0.045); x.stroke(); }
      }
      if (f.brows && kind !== 'dot' && kind !== 'sleepy') { stroke(0.009); x.beginPath(); x.arc(ex, 0.012, 0.05 * er, Math.PI * (s > 0 ? 0.32 : 0.48), Math.PI * (s > 0 ? 0.52 : 0.68)); x.stroke(); }
      if (f.cheeks) ell(s * (gap + 0.03), -0.05, 0.022, 0.016, col(f.cheeks === true ? 'pink' : f.cheeks));
    });
    if (f.glasses) { stroke(0.008); [-1, 1].forEach((s) => { x.beginPath(); x.arc(s * gap, 0, 0.045 * er, 0, 7); x.stroke(); }); x.beginPath(); x.moveTo(-gap + 0.045, 0.005); x.lineTo(gap - 0.045, 0.005); x.stroke(); }
    if (f.nose) { x.beginPath(); x.moveTo(0, -0.012); x.lineTo(-0.012, -0.04); x.lineTo(0.012, -0.04); x.closePath(); x.fillStyle = line; x.fill(); }
    if (f.mouth === 'smile') { x.beginPath(); x.moveTo(-0.032, -0.06); x.quadraticCurveTo(0, -0.1, 0.032, -0.06); x.quadraticCurveTo(0, -0.072, -0.032, -0.06); x.fillStyle = hot; x.fill(); }
    else if (f.mouth === 'o') { ell(0, -0.07, 0.018, 0.022, ink); ell(0, -0.07, 0.009, 0.012, hot); }
    else if (f.mouth === 'line') { stroke(0.008); x.beginPath(); x.moveTo(-0.02, -0.065); x.lineTo(0.02, -0.065); x.stroke(); }
    else if (f.mouth === 'beak') { x.beginPath(); x.moveTo(-0.025, -0.03); x.lineTo(0.025, -0.03); x.lineTo(0, -0.08); x.closePath(); x.fillStyle = col('warm'); x.fill(); }
    if (f.mustache) { x.fillStyle = line; [-1, 1].forEach((s) => { x.beginPath(); x.ellipse(s * 0.025, -0.05, 0.03, 0.012, s * 0.25, 0, 7); x.fill(); }); }
    x.restore();
    return texFrom(cv);
  }

  // ================= Kurulum =================
  const LAMBERT = (() => { const n = 64, d = new Uint8Array(n * 4); for (let i = 0; i < n; i++) { const v = Math.max(0, 2 * (i + 0.5) / n - 1) * 255; d.set([v, v, v, 255], i * 4); } const t = new THREE.DataTexture(d, n, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.LinearFilter; t.needsUpdate = true; return t; })();
  const MOTIONS = {
    calm:    { wob: 0.03, f: 1.4, hop: 0, every: 0, lag: 0.15 },
    bouncy:  { wob: 0.045, f: 2.2, hop: 0.14, every: 2.4, lag: 0.25 },
    sleepy:  { wob: 0.02, f: 0.7, hop: 0, every: 0, lag: 0.1, tilt: 0.12 },
    jittery: { wob: 0.05, f: 4.5, hop: 0.06, every: 1.1, lag: 0.3 },
    proud:   { wob: 0.02, f: 1.0, hop: 0.08, every: 4.0, lag: 0.12, lean: -0.08 },
    floaty:  { wob: 0.03, f: 1.2, hop: 0, every: 0, lag: 0.2, float: 0.06 }
  };

  function build(recipe, C) {
    seed = [...recipe.id].reduce((a, c) => a + c.charCodeAt(0), 7);
    const col = (k) => C[k] || k;
    const mat = (o) => new THREE.MeshToonMaterial(Object.assign({ gradientMap: LAMBERT }, o));
    const matCache = {};
    const paintMat = (p = {}) => {
      if (!p.pattern) { const k = 'c' + (p.color || 'paper'); return matCache[k] || (matCache[k] = mat({ color: col(p.color || 'paper') })); }
      return mat({ map: texFrom(patternCanvas(p.pattern, p.colors.map(col)), p.repeat || [1, 1]) });
    };
    const m = (geo, material, x = 0, y = 0, z = 0) => { const o = new THREE.Mesh(geo, material); o.position.set(x, y, z); o.castShadow = o.receiveShadow = true; return o; };
    const P = recipe.parts;
    const B = BODIES[P.body.shape], Hd = HEADS[P.head.shape];
    const root = new THREE.Group(), wob = new THREE.Group(); root.add(wob);
    const inkM = mat({ color: col('ink') });

    // gövde + tornacı oyuğu
    wob.add(m(B.geo(), paintMat(P.body.paint)));
    if (!B.box) { const g = m(new THREE.TorusGeometry(B.base * 0.99 + 0.002, 0.006, 6, SEG), inkM, 0, 0.035, 0); g.rotation.x = Math.PI / 2; g.castShadow = false; wob.add(g); }
    const neckH = P.neck ? P.neck.height ?? 0.08 : 0;
    if (P.neck) wob.add(m(new THREE.CylinderGeometry(0.07, 0.09, neckH + 0.04, 32), paintMat(P.neck.paint || (P.head.paint.pattern ? { color: P.head.paint.colors[0] } : P.head.paint)), 0, B.h + neckH / 2, 0));
    // baş: yüz dokusu yalnız ön yüze (kutu / disk) ya da bütün kafaya (dönel)
    const head = new THREE.Group(); head.position.y = B.h + neckH - (P.neck ? 0 : 0.04); wob.add(head);
    const faceTex = headTexture(P.head.shape, P.head.paint, P.face || {}, C);
    const faceMat = mat({ map: faceTex }), baseMat = paintMat(P.head.paint.pattern ? { color: P.head.paint.colors[0] } : P.head.paint);
    let headMats = faceMat;
    if (Hd.box) headMats = [baseMat, baseMat, baseMat, baseMat, faceMat, baseMat];
    if (Hd.cap) headMats = [baseMat, faceMat, baseMat];
    head.add(m(Hd.geo(), headMats));
    if (Hd.cap) { const rim = m(new THREE.TorusGeometry(0.2, 0.012, 8, SEG), inkM, 0, 0.2, 0.05); head.add(rim); }

    // kulaklar
    const ears = P.ears && P.ears.shape;
    if (ears) {
      const ep = paintMat(P.ears.paint || (P.head.paint.pattern ? { color: P.head.paint.colors[0] } : P.head.paint));
      [-1, 1].forEach((s) => {
        let e;
        if (ears === 'cat') { e = m(new THREE.ConeGeometry(0.075, 0.26, 4), ep, s * 0.11, Hd.top + 0.08, 0); e.rotation.z = -s * 0.22; }
        else if (ears === 'tufts') { e = m(new THREE.ConeGeometry(0.05, 0.16, 4), ep, s * 0.15, Hd.top + 0.03, 0); e.rotation.z = -s * 0.55; }
        else if (ears === 'rabbit') { e = m(new THREE.SphereGeometry(0.05, 16, 12), ep, s * 0.07, Hd.top + 0.17, 0); e.scale.set(0.8, 3.2, 0.5); e.rotation.z = -s * 0.15; }
        else if (ears === 'round') { e = m(new THREE.SphereGeometry(0.06, 16, 12), ep, s * 0.15, Hd.top - 0.01, 0); e.scale.set(1, 1, 0.5); }
        head.add(e);
      });
    }

    // kollar (çubuk kollar, Girard bebeklerinin boyalı kollarının 3B karşılığı)
    const armY = B.h * 0.72, armX = (B.box ? 0.25 : B.shoulder + 0.04);
    const arms = [];
    if (P.arms && P.arms.type !== 'none') {
      const am = paintMat(P.arms.paint || (P.body.paint.pattern ? { color: P.body.paint.colors[0] } : P.body.paint));
      [-1, 1].forEach((s) => {
        const pivot = new THREE.Group(); pivot.position.set(s * armX, armY, 0); wob.add(pivot);
        if (P.arms.type === 'wings') { const w = m(new THREE.SphereGeometry(0.12, 16, 12), am, s * 0.02, -0.12, -0.02); w.scale.set(0.3, 1.1, 0.75); pivot.add(w); pivot.rotation.z = s * 0.15; }
        else { const a = m(new THREE.CylinderGeometry(0.028, 0.032, 0.26, 12), am, 0, -0.12, 0); pivot.add(a); pivot.add(m(new THREE.SphereGeometry(0.035, 12, 8), am, 0, -0.25, 0)); pivot.rotation.z = s * (P.arms.pose === 'up' && s > 0 ? -2.4 : 0.25); pivot.rotation.x = P.arms.pose === 'front' ? -0.6 : 0; }
        arms.push(pivot);
      });
    }

    // elde tutulan nesne: sağ kolun ucuna (kol yoksa gövdenin önüne)
    const held = new THREE.Group();
    if (arms[1]) { held.position.set(0, -0.28, 0.02); held.rotation.z = -arms[1].rotation.z; arms[1].add(held); } // nesne dik kalsın (kol kalksa da) else { held.position.set(armX * 0.6, armY - 0.2, 0.2); wob.add(held); }
    const H = P.held && P.held.type, hp = (k, d) => paintMat((P.held && P.held.paint) || { color: k || d });
    if (H === 'lantern') { held.add(m(new THREE.BoxGeometry(0.1, 0.13, 0.1), mat({ color: col('paper'), emissive: new THREE.Color(col('warm')), emissiveIntensity: 0.4 }), 0, -0.1, 0)); held.add(m(new THREE.ConeGeometry(0.08, 0.06, 4).rotateY(Math.PI / 4), inkM, 0, -0.01, 0)); held.add(m(new THREE.TorusGeometry(0.035, 0.006, 6, 16), inkM, 0, 0.02, 0)); }
    if (H === 'bell') { held.add(m(new THREE.ConeGeometry(0.07, 0.1, 24, 1, true), hp(null, 'warm'), 0, -0.08, 0)); held.add(m(new THREE.CylinderGeometry(0.01, 0.01, 0.08, 6), inkM, 0, 0, 0)); }
    if (H === 'tuba') { const g = new THREE.Group(); g.add(m(new THREE.TorusGeometry(0.09, 0.028, 10, 24), hp(null, 'warm'))); const horn = m(new THREE.ConeGeometry(0.09, 0.16, 24, 1, true), hp(null, 'warm'), 0.08, 0.14, 0); horn.rotation.z = Math.PI; g.add(horn); g.position.set(-0.12, 0.04, 0.12); held.add(g); }
    if (H === 'drum') { const d = new THREE.Group(); d.add(m(new THREE.CylinderGeometry(0.15, 0.15, 0.14, 32), paintMat({ pattern: 'zig', colors: ['paper', 'hot'] }))); d.add(m(new THREE.CylinderGeometry(0.152, 0.152, 0.012, 32), inkM, 0, 0.07, 0)); d.position.set(-0.2, 0.0, 0.2); held.add(d); }
    if (H === 'uke') { const u = new THREE.Group(); const b = m(new THREE.SphereGeometry(0.09, 20, 14), hp(null, 'wood')); b.scale.set(0.9, 1.15, 0.35); u.add(b); u.add(m(new THREE.BoxGeometry(0.03, 0.2, 0.02), inkM, 0, 0.17, 0)); u.rotation.z = -0.8; u.position.set(-0.08, 0.05, 0.1); held.add(u); }
    if (H === 'baton') { const b = m(new THREE.CylinderGeometry(0.006, 0.01, 0.3, 6), mat({ color: col('paper') }), 0, -0.05, 0.1); b.rotation.x = 1.2; held.add(b); }
    if (H === 'can') { held.add(m(new THREE.CylinderGeometry(0.07, 0.08, 0.12, 20), hp(null, 'green'), 0, -0.08, 0)); const sp = m(new THREE.CylinderGeometry(0.01, 0.016, 0.16, 8), hp(null, 'green'), 0.09, -0.05, 0); sp.rotation.z = -0.9; held.add(sp); held.add(m(new THREE.TorusGeometry(0.045, 0.008, 6, 16, Math.PI), inkM, 0, -0.02, 0)); }
    if (H === 'key') { const k = m(new THREE.TorusGeometry(0.035, 0.01, 8, 20), hp(null, 'warm'), 0, -0.05, 0); held.add(k); held.add(m(new THREE.BoxGeometry(0.015, 0.12, 0.015), hp(null, 'warm'), 0, -0.14, 0)); }
    if (H === 'umbrella') { const u = new THREE.Group(); u.add(m(new THREE.CylinderGeometry(0.008, 0.008, 0.62, 6), inkM, 0, 0.3, 0)); u.add(m(new THREE.ConeGeometry(0.32, 0.14, 8, 1, true), paintMat((P.held && P.held.paint) || { pattern: 'stripe', colors: ['paper', 'cool'] }), 0, 0.62, 0)); u.position.set(0, -0.05, 0); held.add(u); }
    if (H === 'bucket') { held.add(m(new THREE.CylinderGeometry(0.07, 0.055, 0.1, 20), hp(null, 'hot'), 0, -0.1, 0)); held.add(m(new THREE.TorusGeometry(0.06, 0.006, 6, 16, Math.PI), inkM, 0, -0.05, 0)); }
    if (H === 'net') { held.add(m(new THREE.CylinderGeometry(0.006, 0.006, 0.4, 6), inkM, 0, 0.05, 0)); const ring = m(new THREE.TorusGeometry(0.08, 0.008, 6, 20), inkM, 0, 0.27, 0); held.add(ring); }
    if (H === 'glass') { held.add(m(new THREE.TorusGeometry(0.06, 0.012, 8, 24), inkM, 0, -0.08, 0.04)); const lens = m(new THREE.CircleGeometry(0.055, 24), mat({ color: col('paper'), transparent: true, opacity: 0.6 }), 0, -0.08, 0.04); held.add(lens); held.add(m(new THREE.CylinderGeometry(0.012, 0.012, 0.1, 8), hp(null, 'wood'), 0, -0.02, 0.04)); }
    if (H === 'letter') { held.add(m(new THREE.BoxGeometry(0.16, 0.1, 0.01), mat({ color: col('paper') }), 0, -0.08, 0.06)); const flap = m(new THREE.ConeGeometry(0.08, 0.05, 3), hp(null, 'hot'), 0, -0.06, 0.068); flap.rotation.z = Math.PI; flap.scale.z = 0.1; held.add(flap); }
    if (H === 'bread') { const b = m(new THREE.CapsuleGeometry(0.05, 0.14, 6, 16), hp(null, 'wood'), 0, -0.08, 0.06); b.rotation.z = Math.PI / 2 - 0.3; held.add(b); }
    if (H === 'flower') { held.add(m(new THREE.CylinderGeometry(0.006, 0.006, 0.26, 6), hp(null, 'green'), 0, 0.05, 0.04)); for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; held.add(m(new THREE.SphereGeometry(0.028, 10, 8), hp(null, 'pink'), Math.cos(a) * 0.035, 0.19, 0.04 + Math.sin(a) * 0.035)); } held.add(m(new THREE.SphereGeometry(0.022, 10, 8), mat({ color: col('warm') }), 0, 0.19, 0.04)); }
    if (H === 'book') { held.add(m(new THREE.BoxGeometry(0.12, 0.16, 0.03), hp(null, 'cool'), 0, -0.08, 0.02)); }

    // şapka
    const hat = new THREE.Group(); hat.position.y = Hd.top; head.add(hat);
    const T = P.hat && P.hat.type, tp = paintMat((P.hat && P.hat.paint) || { color: 'ink' });
    if (T === 'cone') { hat.add(m(new THREE.ConeGeometry(0.11, 0.28, 32), tp, 0, 0.12, 0)); hat.add(m(new THREE.SphereGeometry(0.035, 12, 8), paintMat({ color: 'paper' }), 0, 0.27, 0)); }
    if (T === 'top') { hat.add(m(new THREE.CylinderGeometry(0.2, 0.2, 0.015, 32), tp, 0, 0.0, 0)); hat.add(m(new THREE.CylinderGeometry(0.11, 0.12, 0.2, 32), tp, 0, 0.1, 0)); hat.add(m(new THREE.CylinderGeometry(0.121, 0.121, 0.035, 32), paintMat({ color: 'hot' }), 0, 0.035, 0)); }
    if (T === 'beret') { const b = m(new THREE.SphereGeometry(0.17, 24, 10), tp, 0.02, 0.0, 0); b.scale.set(1, 0.32, 1); b.rotation.z = -0.25; hat.add(b); hat.add(m(new THREE.CylinderGeometry(0.008, 0.008, 0.05, 4), tp, 0.04, 0.06, 0)); }
    if (T === 'cap') { const c = m(new THREE.SphereGeometry(0.14, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), tp, 0, -0.02, 0); hat.add(c); hat.add(m(new THREE.BoxGeometry(0.16, 0.015, 0.1), tp, 0, -0.02, 0.15)); }
    if (T === 'sun') { hat.add(m(new THREE.CylinderGeometry(0.27, 0.27, 0.012, 40), tp, 0, -0.03, 0)); const d = m(new THREE.SphereGeometry(0.12, 24, 12, 0, Math.PI * 2, 0, Math.PI / 2), tp, 0, -0.03, 0); hat.add(d); hat.add(m(new THREE.CylinderGeometry(0.121, 0.121, 0.03, 32), paintMat({ color: 'hot' }), 0, -0.01, 0)); }
    if (T === 'crown') { for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2; hat.add(m(new THREE.ConeGeometry(0.03, 0.09, 4), tp, Math.cos(a) * 0.09, 0.04, Math.sin(a) * 0.09)); } hat.add(m(new THREE.CylinderGeometry(0.11, 0.11, 0.04, 24, 1, true), tp, 0, 0.0, 0)); }
    if (T === 'leaf') { const l = m(new THREE.SphereGeometry(0.1, 16, 10), paintMat((P.hat && P.hat.paint) || { color: 'green' }), 0.03, 0.08, 0); l.scale.set(0.5, 1.4, 0.18); l.rotation.z = -0.4; hat.add(l); hat.add(m(new THREE.CylinderGeometry(0.006, 0.006, 0.06, 4), inkM, 0, 0.01, 0)); }
    if (T === 'sailor') { hat.add(m(new THREE.CylinderGeometry(0.15, 0.13, 0.07, 32), paintMat({ color: 'paper' }), 0, 0.0, 0)); hat.add(m(new THREE.CylinderGeometry(0.151, 0.151, 0.02, 32), paintMat({ color: 'cool' }), 0, -0.02, 0)); }
    if (T === 'chef') { hat.add(m(new THREE.CylinderGeometry(0.11, 0.11, 0.1, 24), tp, 0, 0.04, 0)); for (let k = 0; k < 5; k++) { const a = k / 5 * Math.PI * 2; hat.add(m(new THREE.SphereGeometry(0.07, 14, 10), tp, Math.cos(a) * 0.06, 0.14, Math.sin(a) * 0.06)); } hat.add(m(new THREE.SphereGeometry(0.07, 14, 10), tp, 0, 0.17, 0)); }
    if (T === 'mushroom') { const d = m(new THREE.SphereGeometry(0.3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), paintMat((P.hat && P.hat.paint) || { pattern: 'dots', colors: ['hot', 'paper'], repeat: [3, 1] }), 0, -0.04, 0); d.scale.y = 0.65; hat.add(d); hat.add(m(new THREE.CylinderGeometry(0.3, 0.3, 0.01, 32), paintMat({ color: 'paper' }), 0, -0.04, 0)); }
    if (T === 'antenna') { [-1, 1].forEach((s) => { const a = m(new THREE.CylinderGeometry(0.006, 0.006, 0.16, 4), inkM, s * 0.06, 0.07, 0); a.rotation.z = -s * 0.35; hat.add(a); hat.add(m(new THREE.SphereGeometry(0.03, 10, 8), tp, s * 0.09, 0.15, 0)); }); }
    if (T === 'pompom') { hat.add(m(new THREE.CylinderGeometry(0.008, 0.008, 0.14, 4), tp, 0, 0.06, 0)); hat.add(m(new THREE.SphereGeometry(0.045, 12, 8), paintMat({ color: 'paper' }), 0, 0.14, 0)); }

    // ekler: atkı (vurgu rengi = "sen"), tüy, fiyonk, kuyruk, pelerin eteği
    const extra = new THREE.Group(); extra.position.y = Hd.top; head.add(extra);
    (P.extras || []).forEach((e) => {
      const t = e.type || e;
      if (t === 'scarf') { const s = m(new THREE.TorusGeometry(0.1, 0.035, 10, 32), paintMat(e.paint || { color: 'hot' }), 0, B.h + 0.02, 0); s.rotation.x = Math.PI / 2; wob.add(s); const tail = m(new THREE.BoxGeometry(0.06, 0.16, 0.025), paintMat(e.paint || { color: 'hot' }), 0.06, B.h - 0.08, 0.1); tail.rotation.z = 0.25; wob.add(tail); }
      if (t === 'feather') for (let k = 0; k < 9; k++) { const f = new THREE.Group(); const blade = m(new THREE.SphereGeometry(0.05, 12, 8), paintMat({ color: k % 2 ? 'warm' : 'wood' }), 0, 0.17, 0); blade.scale.set(0.45, 3.4, 0.15); f.add(blade); f.rotation.z = (k - 4) * 0.13; f.rotation.y = (k % 3) * 0.3; extra.add(f); }
      if (t === 'bow') { [-1, 1].forEach((s) => { const b = m(new THREE.TorusGeometry(0.07, 0.014, 10, 32), paintMat(e.paint || { color: 'warm' }), s * 0.08, B.h + 0.02, 0.1); b.scale.set(1.3, 0.7, 1); wob.add(b); }); }
      if (t === 'tail') { const tl = m(new THREE.TorusGeometry(0.22, 0.022, 10, 40, Math.PI * 1.2), paintMat(e.paint || { color: 'hot' }), 0, B.h * 0.35, -0.22); tl.rotation.y = Math.PI / 2; wob.add(tl); }
      if (t === 'beak') { const b = m(new THREE.ConeGeometry(0.035, 0.09, 4), paintMat({ color: 'warm' }), 0, Hd.fy - 0.03 - Hd.top, Hd.r + 0.03); b.rotation.x = Math.PI / 2 + 0.3; extra.add(b); }
      if (t === 'collar') { const c = m(new THREE.CylinderGeometry(0.16, 0.2, 0.06, 32, 1, true), paintMat(e.paint || { color: 'paper' }), 0, B.h - 0.01, 0); wob.add(c); }
    });

    root.scale.setScalar(recipe.scale || 1);
    const mo = MOTIONS[(recipe.motion && recipe.motion.personality) || 'calm'] || MOTIONS.calm;
    return { root, wob, head, hat, extra, arms, held, motion: mo, phase: rnd() * 6, height: (B.h + neckH + Hd.top + 0.15) * (recipe.scale || 1) };
  }

  // Hareket kişiliği: aynı ilkeler, farklı tempo (wobble · hop · geriden gelen ekler)
  function animate(o, t) {
    const M = o.motion, w = Math.sin(t * M.f + o.phase);
    o.wob.rotation.z = w * M.wob; o.wob.rotation.x = (M.lean || 0) + Math.cos(t * M.f * 0.8 + o.phase) * M.wob * 0.5;
    let y = M.float ? Math.sin(t * 1.4 + o.phase) * M.float + M.float : 0, sq = 1;
    if (M.every) { const u = ((t + o.phase) % M.every) / 0.45; if (u < 1) { y += Math.sin(u * Math.PI) * M.hop; sq = u < 0.12 ? 0.92 : u > 0.88 ? 0.94 : 1.05; } }
    o.wob.position.y = y; o.wob.scale.set(1 / Math.sqrt(sq), sq, 1 / Math.sqrt(sq));
    o.head.rotation.z = (M.tilt || 0) + Math.sin(t * M.f - 0.6 + o.phase) * M.wob * 0.8; // baş gövdenin gerisinden gelir
    o.hat.rotation.z = -w * M.lag; o.extra.rotation.z = -w * M.lag * 1.2;
    o.arms.forEach((a, i) => { a.rotation.x = (a.userData.rx ?? (a.userData.rx = a.rotation.x)) + Math.sin(t * M.f * 1.3 + i * 2 + o.phase) * M.wob * 2; });
  }

  return { build, animate, BODIES, HEADS, PATTERNS, MOTIONS, LAMBERT, patternCanvas, texFrom, rnd, setSeed: (v) => { seed = v; } };
}
