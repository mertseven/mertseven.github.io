// Takımada · görünüm motoru
// Desen atlası gölgelemesi + geometri konturu. Assetler rol renkleriyle kurulur; bu modül onların ekranda nasıl basılacağını belirler.
// createLook(THREE, renderer) → { PALS, SYSTEMS, rolesOf, atlasCanvas, patchObject, apply(s), render(cv, scene, cam, bg, s, up), LAMBERT }
// Ayar nesnesi s: { pal, sys, lit, decor, outline, time, scale, on, dark, unify, oc, t: [5 eşik], nT }

function createLook(THREE, renderer) {
  // ================= Paletler =================
  const PALS = {
    a: { name: 'A · 1-BIT', sea: 'gray',
         list: [['paper', '#f2efe6', 'paper'], ['ink', '#151515', 'ink'], ['hot', '#ff6648', 'color'], ['gray', '#9a9a9a', 'gray']],
         roles: { warm: 'gray', cool: 'ink', pink: 'paper', green: 'gray', wood: 'gray', mid: 'gray', ground: 'paper' } },
    b: { name: 'B · PAPER + WOOD', sea: 'ink',
         list: [['paper', '#f3ecdc', 'paper'], ['ink', '#1c1a17', 'ink'], ['hot', '#ff6648', 'color'], ['wood', '#c4955c', 'color'], ['sand', '#dcc196', 'color']],
         roles: { warm: 'wood', cool: 'ink', pink: 'sand', green: 'wood', mid: 'wood', ground: 'paper' } },
    c: { name: 'C · MONTOUR', sea: 'cool',
         list: [['paper', '#f1e9d8', 'paper'], ['ink', '#1d1c1a', 'ink'], ['hot', '#e8462b', 'color'], ['warm', '#e2a23a', 'color'], ['cool', '#3f78b5', 'color'], ['pink', '#ea8ca6', 'color'], ['green', '#7fae68', 'color'], ['wood', '#c4955c', 'color'], ['gray', '#9b958a', 'gray']],
         roles: { mid: 'gray', ground: 'paper' } }
  };
  function rolesOf(P) {
    const C = {}; P.list.forEach(([k, hex]) => { C[k] = hex; });
    Object.entries(P.roles).forEach(([r, k]) => { C[r] = C[k]; });
    ['warm', 'cool', 'pink', 'green', 'wood', 'mid', 'ground'].forEach((r) => { if (!C[r]) C[r] = C.paper; });
    return C;
  }

  // ================= Desen sistemleri (3 yüzey türü × 4 yoğunluk) =================
  const m = (a, n) => ((a % n) + n) % n;
  const chev = (x, y, p, w) => m(x + Math.abs(m(y, p) - p / 2), p) < w;
  const dotR = (x, y, p, r, off) => { const ox = off && m(Math.floor(y / p), 2) ? p / 2 : 0; const dx = m(x + ox, p) - p / 2 + 0.5, dy = m(y, p) - p / 2 + 0.5; return dx * dx + dy * dy <= r * r; };
  const plus = (x, y, p, s) => { const cx = m(x, p), cy = m(y, p); return (cx === 0 && (cy <= s || cy >= p - s)) || (cy === 0 && (cx <= s || cx >= p - s)); };
  const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const SYSTEMS = {
    walaber: { name: 'WALABER',
      Z: [(x, y) => m(y, 8) === 0 && m(x, 2) === 0, (x, y) => m(y, 8) === 0, (x, y) => m(y, 4) === 0, (x, y) => m(y, 2) === 0],
      Y: [(x, y) => m(x, 8) === 0 && m(y, 8) === 0, (x, y) => m(x, 4) === 0 && m(y + (m(x, 8) ? 2 : 0), 4) === 0, (x, y) => m(x, 2) === 0 && m(y, 4) === 0, (x, y) => m(x + y, 2) === 0],
      B: [(x, y) => m(x, 16) === 0 || m(y, 16) === 0, (x, y) => m(x, 8) === 0 || m(y, 8) === 0, (x, y) => m(x, 4) === 0 || m(y, 4) === 0, (x, y) => m(x, 2) === 0 || m(y, 4) === 0] },
    engrave: { name: 'ENGRAVING',
      Z: [(x, y) => m(y, 8) === 0, (x, y) => m(y, 4) === 0, (x, y) => m(y, 4) === 0 || (m(y, 4) === 2 && m(x, 2) === 0), (x, y) => m(y, 2) === 0],
      Y: [(x, y) => m(x, 8) === 0, (x, y) => m(x, 4) === 0, (x, y) => m(x, 4) === 0 || (m(x, 4) === 2 && m(y, 2) === 0), (x, y) => m(x, 2) === 0],
      B: [(x, y) => m(x + y, 8) === 0, (x, y) => m(x + y, 4) === 0, (x, y) => m(x + y, 4) === 0 || m(x - y, 8) === 0, (x, y) => m(x + y, 4) === 0 || m(x - y, 4) === 0] },
    girard: { name: 'TEXTILE',
      Z: [(x, y) => chev(x, y, 16, 1), (x, y) => chev(x, y, 8, 1), (x, y) => chev(x, y, 8, 2), (x, y) => chev(x, y, 4, 2)],
      Y: [(x, y) => m(x, 8) === 0 && m(y + (m(x, 16) ? 4 : 0), 8) < 3, (x, y) => m(x, 4) === 0 && m(y + (m(x, 8) ? 4 : 0), 8) < 3, (x, y) => m(x, 4) === 0 && m(y, 4) < 3, (x, y) => m(x, 2) === 0 && m(y, 4) < 3],
      B: [(x, y) => m(x + y, 16) === 0 || m(x - y, 16) === 0, (x, y) => m(x + y, 8) === 0 || m(x - y, 8) === 0, (x, y) => (m(x + y, 8) === 0 || m(x - y, 8) === 0) || (m(x, 8) < 4 && m(y, 8) < 4 && m(x + y, 2) === 0), (x, y) => m(x + y, 4) < 2 || m(x - y, 8) === 0] },
    halftone: { name: 'RASTER / RISO',
      Z: [1, 1.8, 2.6, 3.4].map((r) => (x, y) => dotR(x, y, 8, r, false)),
      Y: [1, 1.8, 2.6, 3.4].map((r) => (x, y) => dotR(x, y, 8, r, true)),
      B: [1, 2, 3, 5].map((w) => (x, y) => m(x + y, 8) < w) },
    stitch: { name: 'CROSS-STITCH',
      Z: [(x, y) => m(x, 16) < 2 && m(y, 16) < 2, (x, y) => m(x, 8) < 2 && m(y, 8) < 2, (x, y) => m(Math.floor(x / 4) + Math.floor(y / 4), 2) === 0, (x, y) => !(m(x, 8) < 2 && m(y, 8) < 2)],
      Y: [(x, y) => plus(x, y, 16, 2), (x, y) => plus(x, y, 8, 2), (x, y) => plus(x, y, 8, 3) || plus(x + 4, y + 4, 8, 1), (x, y) => plus(x, y, 4, 2)],
      B: [(x, y) => m(x - y, 16) === 0 && m(x, 16) < 5, (x, y) => (m(x - y, 8) === 0 || m(x + y, 8) === 0) && m(x, 8) < 5 && m(y, 8) < 5, (x, y) => m(x - y, 8) === 0 || m(x + y, 8) === 0, (x, y) => m(x - y, 4) === 0 || m(x + y, 4) === 0] },
    bayer: { name: 'BAYER (CONTROL)',
      Z: [2, 5, 8, 11].map((t) => (x, y) => BAYER4[m(y, 4) * 4 + m(x, 4)] < t),
      Y: [2, 5, 8, 11].map((t) => (x, y) => BAYER4[m(y, 4) * 4 + m(x, 4)] < t),
      B: [2, 5, 8, 11].map((t) => (x, y) => BAYER4[m(y, 4) * 4 + m(x, 4)] < t) }
  };

  // ================= Atlas =================
  const CELL = 32, TONES = 6, VARS = ['Z', 'Y', 'B'];
  function mixHex(a, b, t) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const ch = (s) => Math.round(((pa >> s) & 255) * (1 - t) + ((pb >> s) & 255) * t);
    return '#' + [16, 8, 0].map((s) => ch(s).toString(16).padStart(2, '0')).join('');
  }
  const SPARSE = (x, y) => m(x, 8) === 0 && m(y + (m(x, 16) ? 4 : 0), 8) === 0;
  function recipe(kind, lit, c, paper, ink, dark, moonC) {
    let R;
    if (kind === 'ink') R = Array(TONES).fill([ink, paper, 0]);
    else if (kind === 'paper') R = [[paper, ink, 0], [paper, ink, 1], [paper, ink, 2], [paper, ink, 3], [paper, ink, 4], [ink, paper, 1]];
    else if (kind === 'gray') R = [[paper, ink, 2], [paper, ink, 3], [paper, ink, 4], [ink, paper, 3], [ink, paper, 2], [ink, paper, 1]];
    else if (lit === 'tint') R = [[paper, c, 1], [paper, c, 2], [paper, c, 3], [paper, c, 4], [c, ink, 2], [ink, c, 1]];
    else R = [[c, ink, 0], [c, ink, 1], [c, ink, 2], [c, ink, 3], [c, ink, 4], [ink, c, 1]];
    R = R.map((r) => r.slice());
    const lite = kind === 'ink' ? ink : kind === 'color' ? c : paper;
    if (dark === 'quiet') { R[4] = [ink, lite, -1]; R[5] = [ink, paper, 0]; }
    else if (dark === 'solid') { R[4] = [ink, paper, 0]; R[5] = [ink, paper, 0]; }
    else if (dark === 'tint') { R[4] = [mixHex(lite, ink, 0.62), ink, 0]; R[5] = [mixHex(lite, ink, 0.8), ink, 0]; }
    else if (dark === 'moonline') { const mb = mixHex(ink, moonC, 0.45), t4 = mixHex(lite, mb, 0.55), t5 = mixHex(lite, mb, 0.74); // ay ışığı + çok seyrek, zemine yakın gravür çizgisi
      R[4] = [t4, mixHex(t4, paper, 0.2), 1]; R[5] = [t5, mixHex(t5, paper, 0.13), 1]; }
    else if (dark === 'moon') { const mb = mixHex(ink, moonC, 0.45); R[4] = [mixHex(lite, mb, 0.55), mb, 0]; R[5] = [mixHex(lite, mb, 0.74), mb, 0]; } // ay ışığı: koyu tonlar ay mavisine çekilir
    return R;
  }
  function atlasCanvas(P, sys, lit, dark = 'pattern', unify = 0) {
    const SY = SYSTEMS[sys], cols = P.list.length * 3;
    const cv = document.createElement('canvas'); cv.width = CELL * cols; cv.height = CELL * TONES;
    const x = cv.getContext('2d');
    const hex = (k) => P.list.find((e) => e[0] === k)[1], paper = hex('paper'), ink = hex('ink');
    const moonC = (P.list.find((e) => e[0] === 'cool') || P.list.find((e) => e[0] === 'gray'))[1];
    P.list.forEach(([, c, kind], ci) => {
      const R = recipe(kind, lit, c, paper, ink, dark, moonC);
      VARS.forEach((v, vi) => {
        const col = ci * 3 + vi;
        R.forEach(([bg, fg, level], t) => {
          x.fillStyle = bg; x.fillRect(col * CELL, t * CELL, CELL, CELL);
          if (!level) return;
          x.fillStyle = fg;
          const f = level === -1 ? SPARSE : SY[unify && t >= 2 ? 'Y' : v][level - 1];
          for (let yy = 0; yy < CELL; yy++) for (let xx = 0; xx < CELL; xx++) if (f(xx, yy)) x.fillRect(col * CELL + xx, t * CELL + yy, 1, 1);
        });
      });
    });
    return cv;
  }
  const atlasCache = new Map();
  function atlasTexture(pal, sys, lit, dark, unify) {
    const key = [pal, sys, lit, dark, unify].join();
    if (atlasCache.has(key)) return atlasCache.get(key);
    const t = new THREE.CanvasTexture(atlasCanvas(PALS[pal], sys, lit, dark, unify));
    t.colorSpace = THREE.SRGBColorSpace; t.magFilter = t.minFilter = THREE.NearestFilter; t.generateMipmaps = false; t.flipY = false;
    atlasCache.set(key, t); return t;
  }

  // ================= Materyal enjeksiyonu =================
  const U = {
    uAtlas: { value: null }, uAtlasSize: { value: new THREE.Vector2(1, 1) }, uPal: { value: Array.from({ length: 12 }, () => new THREE.Vector3()) },
    uN: { value: 1 }, uT: { value: [0.93, 0.8, 0.66, 0.52, 0.38] }, uScale: { value: 1 }, uOn: { value: 1 }, uDecor: { value: 0 }, uInk: { value: new THREE.Vector3() },
    uNearOn: { value: 0 }, uNear: { value: new THREE.Vector2(3, 9) }, uNearShift: { value: 2 },
    uPaint: { value: 0 }, uPrint: { value: 0 }, uHatch: { value: 1 }, uBoil: { value: 0 }, uHand: { value: 1 }, uNight: { value: 0 },
    uNature: { value: 0 }, uTime: { value: 0 }, uWind: { value: new THREE.Vector2(0.94, 0.33) }, uGreen: { value: new THREE.Vector3() }, uLightGreen: { value: new THREE.Vector3() }, uMarkGreen: { value: new THREE.Vector3() },
    uSea: { value: new THREE.Vector3() }, uSeaShallow: { value: new THREE.Vector3() }, uPaperC: { value: new THREE.Vector3() }, uDepth: { value: null }, uDepthB: { value: new THREE.Vector4(-20, -20, 20, 20) }, uBloom: { value: [new THREE.Vector3(), new THREE.Vector3(), new THREE.Vector3()] }, uShade: { value: new THREE.Vector3() }, uHi: { value: new THREE.Vector3() }, uPT: { value: new THREE.Vector3(0.85, 0.55, 0.3) }, uGrain: { value: 0.06 }
  };
  const FRAG_HEAD = 'uniform sampler2D uAtlas; uniform vec2 uAtlasSize; uniform vec3 uPal[12]; uniform int uN; uniform float uT[5]; uniform float uScale; uniform float uOn; uniform int uDecor; uniform vec3 uInk; uniform float uNearOn; uniform vec2 uNear; uniform float uNearShift; uniform float uPaint; uniform float uPrint; uniform float uHatch; uniform float uBoil; uniform float uHand; uniform float uNight; uniform float uNature; uniform float uTime; uniform vec2 uWind; uniform vec3 uGreen; uniform vec3 uLightGreen; uniform vec3 uMarkGreen; uniform vec3 uSea; uniform vec3 uSeaShallow; uniform vec3 uPaperC; uniform sampler2D uDepth; uniform vec4 uDepthB; uniform vec3 uBloom[3]; uniform vec3 uShade; uniform vec3 uHi; uniform vec3 uPT; uniform float uGrain;\n' +
  'float paintHash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }\n' +
  'float hdHash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }\n' +
  'float hdNoise(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); return mix(mix(hdHash(i), hdHash(i + vec2(1, 0)), f.x), mix(hdHash(i + vec2(0, 1)), hdHash(i + vec2(1, 1)), f.x), f.y); }\n';
  // BOYA (Ghibli yönü): ışık düz renk kademeleriyle (sıcak ışık · ana renk · serin gölge · derin gölge), kenarlar yumuşak;
  // gölge siyaha değil serin bir tona gider; ışığın rengi (lamba sıcak, ay serin) korunur; ince boya tanesi. Desen yalnız kumaşta (doku) kalır.
  const PAINT_TAIL = `
  if (uPaint > 0.5) {
    const vec3 LUMP = vec3(0.2126, 0.7152, 0.0722);
    vec3 base = diffuseColor.rgb;
    float L = dot(outgoingLight, LUMP) / max(dot(base, LUMP), 0.004);
    vec3 lc = outgoingLight / max(max(outgoingLight.r, max(outgoingLight.g, outgoingLight.b)), 1e-3);
    float w = 0.05;
    float k1 = smoothstep(uPT.x - w, uPT.x + w, L), k2 = smoothstep(uPT.y - w, uPT.y + w, L), k3 = smoothstep(uPT.z - w, uPT.z + w, L);
    float nn = uNight;
    vec3 deep = mix(base, uShade, 0.7 + 0.25 * nn) * (0.85 - 0.35 * nn), sh = mix(base, uShade, 0.5 + 0.4 * nn), mid = mix(base, uShade, 0.2 + 0.66 * nn), hi = mix(base, uHi, 0.14 + 0.4 * nn);
    vec3 col = mix(deep, sh, k3); col = mix(col, mid, k2); col = mix(col, hi, k1);
    if (uPrint > 0.5) {
      // BASKI: ışık düz (ana renk), gölge kendi tonunda gravür. Tarama tek yönlü (bakır baskı); derin gölgede çapraz.
      vec3 ink2 = mix(base, uShade, 0.78 + 0.1 * nn) * (0.72 - 0.25 * nn), shf = mix(base, uShade, 0.22 + 0.68 * nn);
      vec2 fc = floor(gl_FragCoord.xy / max(uScale, 1.0));
      float pS = 9.0 - uHatch * 2.5 + 3.0 * nn, pD = 6.0 - uHatch * 1.5 + 2.0 * nn;     // seyrek · orta · sık (gece daha seyrek)
      float shadeK = 1.0 - k2, deepK = 1.0 - k3;
      // el çizimi: çizgi hafif dalgalanır (titrek el), kalınlığı değişir, ara ara kopar; birkaç karede bir kıpırdar (line boil)
      vec2 bo = vec2(uBoil * 17.0, uBoil * 31.0);
      float wob = uHand * (hdNoise(fc * 0.045 + bo) - 0.5) * 4.5, wid = 1.0 + uHand * (hdNoise(fc * 0.09 + bo.yx) - 0.45) * 1.1;
      float gapA = uHand * step(hdNoise(vec2(fc.x + fc.y, fc.x - fc.y) * vec2(0.05, 0.6) + bo), 0.3);
      float gapB = uHand * step(hdNoise(vec2(fc.x - fc.y, fc.x + fc.y) * vec2(0.05, 0.6) + bo + 7.0), 0.3);
      float u1 = fc.x - fc.y + wob, u2 = fc.x + fc.y + wob * 0.8;
      bool h1 = mod(u1, pS) < wid && gapA < 0.5, h2 = mod(u1, pD) < wid && gapA < 0.5, hx = mod(u2, pD + 0.7) < wid * 0.9 && gapB < 0.5;
      col = mix(mix(base, mid, nn), hi, k1 * (0.6 + 0.4 * nn)); // gece: ışık almayan yüz bile gece tonunda; lamba altı sıcak
      if (shadeK > 0.5) { col = shf; if (h1 && nn < 0.5) col = ink2; } // gece: ay ışığındaki yüz düz koyu ton, tarama yalnız derin gölgede
      if (deepK > 0.5) { col = mix(shf, uShade, 0.15); if (h2 || (uHatch > 0.5 && hx && nn < 0.5)) col = ink2; }
    }
    col *= mix(vec3(1.0), lc, 0.4);
    #ifndef ATLAS_BASIC
      float emL = dot(totalEmissiveRadiance, LUMP); col = mix(col, totalEmissiveRadiance / max(max(totalEmissiveRadiance.r, max(totalEmissiveRadiance.g, totalEmissiveRadiance.b)), 1e-3), clamp((emL - 0.25) * 1.6, 0.0, 1.0));
    #endif
    if (uPrint < 0.5) col *= 1.0 - uGrain * 0.5 + uGrain * paintHash(floor(gl_FragCoord.xy / max(uScale, 1.0)));
    gl_FragColor = linearToOutputTexel(vec4(col, 1.0));
  }
  `;

  // CANLI DOĞA (boya / baskı): dünya koordinatında, zamanla. Çimende rüzgâr şeritleri + rüzgârla eğilen ot işaretleri + çiçek noktaları;
  // denizde kıyıda turkuaz sığlık, nefes alan köpük, akıntıyla kayıp doğup sönen dalga kavisleri, ara ara parıltı.
  const NATURE_FRAG = `
  #if defined(NATURE_LAND) || defined(NATURE_SEA)
  if (uNature > 0.5) {
    vec2 wp = vNatPos.xz; float vdist = length(vViewPosition), far = 1.0 - smoothstep(9.0, 24.0, vdist);
    vec2 hw = uHand * (vec2(hdNoise(wp * 2.3 + uBoil * 1.7), hdNoise(wp * 2.3 + 4.0 + uBoil * 1.7)) - 0.5) * 0.05; // el titremesi
  #ifdef NATURE_LAND
    vec3 gc = diffuseColor.rgb;
    float isGrass = 1.0 - smoothstep(0.004, 0.03, dot(gc - uGreen, gc - uGreen));
    float gust = sin(dot(wp, uWind) * 0.55 - uTime * 1.4 + hdNoise(wp * 0.12) * 4.0) * 0.5 + 0.5;
    gust = smoothstep(0.62, 1.0, gust) * isGrass;
    gc = mix(gc, uLightGreen, gust * 0.6);
    vec2 g = (wp + hw) / 0.42, cell = floor(g), f = (g - cell) * 0.42;
    float r = hdHash(cell), m = 0.0;
    if (isGrass > 0.5 && r > 0.4) {
      vec2 b = (vec2(hdHash(cell + 3.1), hdHash(cell + 7.7)) * 0.5 + 0.12) * 0.42;
      float lean = 0.35 + gust * 0.9 + 0.25 * sin(uTime * 2.0 + r * 6.0);
      vec2 up = normalize(vec2(0.0, -1.0) + uWind * lean), side = vec2(-up.y, up.x);
      float sc = 0.7 + 0.6 * hdHash(cell + 11.0), sk = (hdHash(cell + 13.0) - 0.5) * 0.06; bool one = hdHash(cell + 17.0) < 0.45;
      vec2 a1 = b + (up * 0.11 - side * (0.035 + sk)) * sc, a2 = one ? a1 : b + (up * (0.08 + 0.04 * hdHash(cell + 19.0)) + side * (0.04 - sk)) * sc;
      vec2 pa = f - b, d1 = a1 - b, d2 = a2 - b;
      float s1 = length(pa - d1 * clamp(dot(pa, d1) / dot(d1, d1), 0.0, 1.0)), s2 = length(pa - d2 * clamp(dot(pa, d2) / dot(d2, d2), 0.0, 1.0));
      float sd = min(s1, s2), aa = max(length(fwidth(wp)), 1e-4); // hücre sınırında türev sıçramasın (ızgara izi kalmasın)
      m = (1.0 - smoothstep(0.009, 0.009 + aa * 1.2, sd)) * far;
    }
    if (isGrass > 0.5 && r > 0.975) { // çiçek noktası
      vec2 b = (vec2(hdHash(cell + 5.3), hdHash(cell + 1.9)) * 0.6 + 0.2) * 0.42; float dd = length(f - b), aa = max(length(fwidth(wp)), 1e-4);
      float fm = (1.0 - smoothstep(0.03, 0.03 + aa, dd)) * far; int bi = int(mod(r * 997.0, 3.0));
      gc = mix(gc, bi == 0 ? uBloom[0] : bi == 1 ? uBloom[1] : uBloom[2], fm);
    }
    diffuseColor.rgb = mix(gc, uMarkGreen, m);
  #endif
  #ifdef NATURE_SEA
    vec2 duv = (wp - uDepthB.xy) / (uDepthB.zw - uDepthB.xy);
    float dep = (duv.x < 0.0 || duv.y < 0.0 || duv.x > 1.0 || duv.y > 1.0) ? 1.0 : texture2D(uDepth, duv).r;
    vec3 col = mix(uSeaShallow, uSea, smoothstep(0.02, 0.5, dep));
    float foam = (1.0 - smoothstep(0.0, 0.045 + 0.025 * sin(uTime * 1.2), dep + (hdNoise(wp * 1.5 + uTime * 0.3) - 0.5) * 0.03));
    float ring = step(0.82, sin((dep + hw.x * 0.3) * 70.0 - uTime * 1.8) * 0.5 + 0.5) * (1.0 - smoothstep(0.05, 0.16, dep)) * step(0.045, dep);
    col = mix(col, uPaperC, max(foam, ring * 0.85));
    float cs = mix(1.0, 2.4, smoothstep(0.0, 0.7, dep));
    vec2 q = (wp + hw) + uWind * uTime * 0.22; q.x += step(1.0, mod(floor(q.y / cs), 2.0)) * cs * 0.5;
    vec2 cell = floor(q / cs), fq = q / cs - cell; float rr = hdHash(cell);
    if (rr > 0.3 + 0.35 * smoothstep(0.2, 0.9, dep)) {
      float life = fract(uTime * 0.1 + rr * 7.0), vis = sin(life * 3.14159);
      vec2 cc = vec2(0.5) + (vec2(hdHash(cell + 1.3), hdHash(cell + 2.7)) - 0.5) * 0.35, d = (fq - cc) * cs;
      float rad = 0.2 * cs * (0.7 + 0.3 * vis), dd = abs(length(d) - rad), aa = max(length(fwidth(wp)), 1e-4);
      float arc = (1.0 - smoothstep(0.022, 0.022 + aa * 1.2, dd)) * step(d.y, -rad * 0.3) * vis;
      col = mix(col, uPaperC, arc * mix(1.0, 0.5, far * 0.0));
    }
    vec2 gq = floor(wp / 0.6); float gr = hdHash(gq + 9.1);
    if (gr > 0.992 && uNight < 0.5) { float tw = max(0.0, sin(uTime * 3.0 + gr * 50.0)); vec2 gp = (fract(wp / 0.6) - 0.5); col = mix(col, vec3(1.0), tw * (1.0 - smoothstep(0.02, 0.08, length(gp))) * far); }
    diffuseColor.rgb = col;
  #endif
  }
  #endif
  `;
  // el çizimi kumaş: doku koordinatı yumuşak gürültüyle kayar → çizgili çatı, kareli elbise elle boyanmış gibi titrer
  const MAP_HAND = `
  #ifdef USE_MAP
    vec2 hdUv = vMapUv + uHand * 0.006 * (vec2(hdNoise(vMapUv * 26.0 + uBoil * 3.0), hdNoise(vMapUv * 26.0 + 5.0 + uBoil * 3.0)) - 0.5);
    diffuseColor *= texture2D(map, hdUv);
  #endif
  `;
  const FRAG_TAIL = `
  if (uOn > 0.5 && uPaint < 0.5) {
    const vec3 LUM = vec3(0.2126, 0.7152, 0.0722);
    vec3 base = diffuseColor.rgb;
    float lit = dot(outgoingLight, LUM) / max(dot(base, LUM), 0.004);
    int idx = 0; float best = 1e9;
    for (int i = 0; i < 12; i++) { if (i >= uN) break; vec3 d = base - uPal[i]; float e = dot(d, d); if (e < best) { best = e; idx = i; } }
    float band = 5.0;
    for (int i = 0; i < 5; i++) { if (lit > uT[i]) { band = float(i); break; } }
    bool decor = false;
    #ifdef USE_MAP
      decor = true;
    #endif
    float variant = decor ? 2.0 : 1.0;
    #ifndef ATLAS_BASIC
      // perspektif: kameraya yakın büyük yüzeylerde desen seyrelir (açık tona kayar); koyu dolgular (4–5) olduğu gibi kalır
      if (uNearOn > 0.5 && band < 3.5) { float nk = 1.0 - smoothstep(uNear.x, uNear.y, length(vViewPosition)); band = max(0.0, band - floor(nk * uNearShift + 0.5)); }
      vec3 wn = normalize((vec4(normal, 0.0) * viewMatrix).xyz);
      if (abs(wn.y) > 0.6) variant = 0.0;
    #endif
    vec3 outc;
    if (decor && uDecor == 2) outc = mix(uPal[idx], uInk, band / 6.0);
    else {
      if (decor && uDecor == 1 && band < 3.5) band = 0.0;
      vec2 p = mod(floor(gl_FragCoord.xy / uScale), 32.0);
      vec2 auv = (vec2(float(idx) * 3.0 + variant, band) * 32.0 + p + 0.5) / uAtlasSize;
      outc = texture2D(uAtlas, auv).rgb;
    }
    gl_FragColor = linearToOutputTexel(vec4(outc, 1.0));
  }
  `;
  // Gerçek açı düşüşü (toon'un varsayılanı arka yüze de %70 ışık verir)
  const LAMBERT = (() => { const n = 64, d = new Uint8Array(n * 4); for (let i = 0; i < n; i++) { const v = Math.max(0, 2 * (i + 0.5) / n - 1) * 255; d.set([v, v, v, 255], i * 4); } const t = new THREE.DataTexture(d, n, 1, THREE.RGBAFormat); t.minFilter = t.magFilter = THREE.LinearFilter; t.needsUpdate = true; return t; })();
  function patchMat(mat) {
    if (mat.userData.noAtlas) return; // ör. fener huzmesi: ham renk, atlasa girmez
    if (mat.isMeshToonMaterial) mat.gradientMap = LAMBERT;
    if (mat.userData.patched) return; mat.userData.patched = true;
    const basic = mat.isMeshBasicMaterial, nat = mat.userData.nature; // 'land' | 'sea' (kutuphane/arazi.js)
    if (nat) mat.defines = Object.assign({}, mat.defines, { [nat === 'sea' ? 'NATURE_SEA' : 'NATURE_LAND']: '' });
    mat.onBeforeCompile = (sh) => {
      Object.assign(sh.uniforms, U);
      if (nat) {
        sh.vertexShader = 'varying vec3 vNatPos;\n' + sh.vertexShader.replace('#include <project_vertex>', '#include <project_vertex>\n  vNatPos = (modelMatrix * vec4(transformed, 1.0)).xyz;');
        sh.fragmentShader = 'varying vec3 vNatPos;\n' + sh.fragmentShader;
      }
      sh.fragmentShader = (basic ? '#define ATLAS_BASIC\n' : '') + FRAG_HEAD + sh.fragmentShader.replace('#include <map_fragment>', MAP_HAND).replace('#include <color_fragment>', '#include <color_fragment>\n' + (nat ? NATURE_FRAG : '')).replace('#include <dithering_fragment>', '#include <dithering_fragment>\n' + FRAG_TAIL + PAINT_TAIL);
    };
    mat.customProgramCacheKey = () => 'atlas' + (basic ? 'b' : 't') + (nat || '');
  }
  function patchObject(obj) { obj.traverse((o) => { if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach(patchMat); }); return obj; }

  // ================= Kontur =================
  const ndMat = new THREE.ShaderMaterial({
    vertexShader: 'varying vec3 vN; varying float vD; void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vD = -mv.z; gl_Position = projectionMatrix * mv; }',
    uniforms: { nat: { value: 0 } },
    fragmentShader: 'uniform float nat; varying vec3 vN; varying float vD; void main(){ vec3 n = normalize(vN); gl_FragColor = vec4(n.xy * 0.5 + 0.5, nat, vD); }', side: THREE.DoubleSide
  });
  const ndLand = ndMat.clone(); ndLand.uniforms.nat.value = 1; const ndSea = ndMat.clone(); ndSea.uniforms.nat.value = 0.5;
  const compMat = new THREE.ShaderMaterial({
    uniforms: { tC: { value: null }, tN: { value: null }, res: { value: new THREE.Vector2() }, thick: { value: 1 }, mode: { value: 1 }, ink: { value: new THREE.Vector3() }, depthK: { value: 0.08 },
      paint: { value: 0 }, print: { value: 0 }, reg: { value: 0 }, grain: { value: 0 }, boil: { value: 0 }, hand: { value: 0 }, fogOn: { value: 0 }, fogNear: { value: 14 }, fogFar: { value: 42 }, skyTop: { value: new THREE.Vector3() }, skyBot: { value: new THREE.Vector3() }, stars: { value: 0 }, dpx: { value: 1 } },
    vertexShader: 'varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }',
    fragmentShader: `uniform sampler2D tC, tN; uniform vec2 res; uniform float thick; uniform int mode; uniform vec3 ink; uniform float depthK; varying vec2 vUv;
      uniform float fogOn, fogNear, fogFar, stars, dpx, paint, print, reg, grain, boil, hand;
      float luma(vec2 uv) { return dot(texture2D(tC, uv).rgb, vec3(0.2126, 0.7152, 0.0722)); }
      float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
      float hn(vec2 p) { vec2 i = floor(p), f = fract(p); f = f * f * (3.0 - 2.0 * f); float a = hash(i), b = hash(i + vec2(1, 0)), c = hash(i + vec2(0, 1)), d = hash(i + vec2(1, 1)); return mix(mix(a, b, f.x), mix(c, d, f.x), f.y); } uniform vec3 skyTop, skyBot;
      // baskı gibi gökyüzü: 4 kademe, kademeler arası sıralı tarama (Bayer) · gece seyrek yıldız
      vec3 skyAt(vec2 uv) {
        vec2 f = floor(gl_FragCoord.xy / dpx); float q = smoothstep(0.42, 1.0, uv.y) * 4.0, fl = floor(q);
        if (paint > 0.5) { vec3 g = mix(skyBot, skyTop, smoothstep(0.4, 1.0, uv.y)); return stars > 0.5 && uv.y > 0.55 && hash(floor(gl_FragCoord.xy / (2.0 * dpx))) > 0.9965 ? mix(g, vec3(1.0), 0.7) : g; }
        float b = mod(f.x + 2.0 * mod(f.y, 2.0) + 4.0 * mod(floor(f.y / 2.0), 2.0) + 2.0 * mod(floor(f.x / 2.0), 2.0), 8.0) / 8.0;
        vec3 s = mix(skyBot, skyTop, min(4.0, fl + step(b, fract(q))) / 4.0);
        if (stars > 0.5 && uv.y > 0.55 && hash(floor(gl_FragCoord.xy / (2.0 * dpx))) > 0.9965) s = mix(s, vec3(1.0), 0.75);
        return s;
      }
      vec3 nrm(vec4 t) { vec2 xy = t.xy * 2.0 - 1.0; return vec3(xy, sqrt(max(0.0, 1.0 - dot(xy, xy)))); }
      float edgeAt(vec2 uv, vec2 px) {
        float e = 0.0; vec4 n0 = texture2D(tN, uv);
        vec2 D[4]; D[0] = vec2(1, 0); D[1] = vec2(-1, 0); D[2] = vec2(0, 1); D[3] = vec2(0, -1);
        vec4 nn[4];
        for (int i = 0; i < 4; i++) { vec4 n1 = texture2D(tN, uv + D[i] * px); nn[i] = n1; bool b0 = n0.a <= 0.0, b1 = n1.a <= 0.0;
          if (b0 && b1) continue; if (b0 != b1) { if (b1) e = 1.0; continue; }
          if (print > 0.5 && n0.b > 0.25 && n1.b > 0.25) { if (abs(n0.b - n1.b) > 0.25 && n0.b > n1.b) e = 1.0; continue; } // baskı: doğada çizgi yok, yalnız kıyı
          if (dot(nrm(n1), nrm(n0)) < (paint > 0.5 ? 0.2 : 0.6)) e = 1.0; }
        if (n0.a > 0.0 && !(print > 0.5 && n0.b > 0.25)) for (int k = 0; k < 2; k++) { vec4 a = nn[k * 2], c = nn[k * 2 + 1];
          if (a.a <= 0.0 || c.a <= 0.0) continue;
          float lap = a.a + c.a - 2.0 * n0.a; if (lap > depthK * 2.0) e = 1.0; }
        return e;
      }
      void main() {
        vec3 c = texture2D(tC, vUv).rgb; vec2 px = thick / res; float e = 0.0;
        if (mode == 1) {
          // el çizimi kontur: örnekleme noktası yumuşak gürültüyle kayar (titrek çizgi), kalınlık değişir, ara ara incelip kopar
          vec2 g = gl_FragCoord.xy / dpx, bo = vec2(boil * 13.0, boil * 29.0);
          vec2 wob = hand * (vec2(hn(g * 0.035 + bo), hn(g * 0.035 + bo + 9.0)) - 0.5) * 4.0;
          float th = 1.0 + hand * (hn(g * 0.05 + bo.yx) - 0.4) * 1.2;
          e = edgeAt(vUv + (vec2(reg, -reg) + wob) * px, px * max(0.5, th));
          if (hand > 0.0 && hn(g * 0.08 + bo + 3.0) < 0.16) e = 0.0;
        }
        else if (mode == 2) {
          float gx = luma(vUv + vec2(px.x, 0)) - luma(vUv - vec2(px.x, 0)), gy = luma(vUv + vec2(0, px.y)) - luma(vUv - vec2(0, px.y));
          e = step(0.12, length(vec2(gx, gy)));
        }
        vec3 lineC = paint > 0.5 && print < 0.5 ? mix(c * 0.45, ink, 0.2) : ink; // boyada çizgi dolgunun koyu tonu; baskıda mürekkep (imza)
        if (fogOn > 0.5) { // perspektif: arka plan gökyüzü, uzak yüzeyler ve çizgileri gökyüzüne karışır (derinlik)
          float d0 = texture2D(tN, vUv).a; vec3 sk = skyAt(vUv);
          if (d0 <= 0.0) c = sk;
          else { float fg = smoothstep(fogNear, fogFar, d0); c = mix(c, sk, fg); lineC = mix(lineC, sk, fg * 0.85); }
        }
        vec3 outc = e > 0.5 ? lineC : c;
        if (grain > 0.0) outc *= 1.0 - grain * 0.5 + grain * hash(floor(gl_FragCoord.xy / dpx)); // kâğıt tanesi (renk ve çizgi birlikte)
        gl_FragColor = vec4(outc, 1.0);
        #include <colorspace_fragment>
      }`, depthTest: false, depthWrite: false
  });
  const fsScene = new THREE.Scene(), fsCam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  fsScene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), compMat));
  const rtOpts = { type: THREE.HalfFloatType, minFilter: THREE.NearestFilter, magFilter: THREE.NearestFilter };
  const rtC = new THREE.WebGLRenderTarget(4, 4, rtOpts), rtN = new THREE.WebGLRenderTarget(4, 4, rtOpts);

  // ================= Uygula + çiz =================
  // Varsayılan = Montour (ana stil). stiller/montour.js yüklüyse oradan okunur.
  const ST = (window.KUTUPHANE && window.KUTUPHANE.stil) || null;
  const DEFAULTS = ST ? { pal: ST.palette, sys: ST.system, lit: ST.lit, decor: ST.decor, outline: ST.outline, time: 'day', scale: ST.scale, on: ST.print === 'atlas' ? 1 : 0, dark: ST.dark, unify: ST.unifyDark, oc: ST.outlineNight, t: ST.thresholds.slice(), nT: ST.nightThresholdFactor }
                      : { pal: 'c', sys: 'engrave', lit: 'color', decor: 0, outline: 1, time: 'day', scale: 1, on: 1, dark: 'quiet', unify: 1, oc: 'auto', t: [0.93, 0.8, 0.66, 0.52, 0.38], nT: 0.7 };
  function apply(s, dpr = 1) {
    const P = PALS[s.pal];
    U.uAtlas.value = atlasTexture(s.pal, s.sys, s.lit, s.dark, s.unify); U.uAtlasSize.value.set(CELL * P.list.length * 3, CELL * TONES);
    P.list.forEach(([, hex], i) => { const c = new THREE.Color(hex); U.uPal.value[i].set(c.r, c.g, c.b); });
    U.uN.value = P.list.length;
    const k = s.time === 'night' ? s.nT : 1; U.uT.value = s.t.map((v) => v * k);
    const ink = new THREE.Color(P.list[1][1]); U.uInk.value.set(ink.r, ink.g, ink.b);
    // gece kontur rengi: auto = kâğıt (tam beyaz) · dim = kâğıt ile mürekkep arası · faint = mürekkebe yakın, soluk · ink = mürekkep
    const OCMIX = { auto: 0, dim: 0.45, faint: 0.68, ink: 1 };
    const line = new THREE.Color(s.time === 'night' ? mixHex(P.list[0][1], P.list[1][1], OCMIX[s.oc] ?? 0) : P.list[1][1]);
    compMat.uniforms.ink.value.set(line.r, line.g, line.b);
    U.uScale.value = s.scale * dpr; U.uOn.value = s.on; U.uDecor.value = s.decor;
    compMat.uniforms.mode.value = s.outline;
    // perspektif ayarları (stil: perspective) — yalnız perspektif kamerada etkin, render() açar
    const PS = (ST && ST.perspective) || {}, rgb = (h) => { const c = new THREE.Color(h); return [c.r, c.g, c.b]; };
    const cool = (P.list.find((e) => e[0] === 'cool') || P.list.find((e) => e[0] === 'gray') || P.list[1])[1], paper = P.list[0][1], inkH = P.list[1][1];
    const night = s.time === 'night';
    compMat.uniforms.skyBot.value.set(...rgb(night ? mixHex(inkH, cool, PS.nightHorizon ?? 0.3) : paper));
    compMat.uniforms.skyTop.value.set(...rgb(night ? inkH : mixHex(paper, cool, PS.dayZenith ?? 0.32)));
    compMat.uniforms.stars.value = night ? 1 : 0; compMat.uniforms.dpx.value = dpr;
    compMat.uniforms.fogNear.value = s.fogNear ?? PS.fogNear ?? 14; compMat.uniforms.fogFar.value = s.fogFar ?? PS.fogFar ?? 42;
    U.uNear.value.set(s.nearStart ?? PS.nearStart ?? 3, s.nearEnd ?? PS.nearEnd ?? 9); U.uNearShift.value = s.nearShift ?? PS.nearShift ?? 2;
    // boya: serin gölge (gündüz morumsu mavi, gece derin lacivert), sıcak ışık
    const PT = (ST && ST.paint) || {}, pink = (P.list.find((e) => e[0] === 'pink') || P.list[0])[1];
    U.uPaint.value = s.paint ? 1 : 0; compMat.uniforms.paint.value = s.paint ? 1 : 0;
    const PR = (ST && ST.print2) || {}, prn = s.paint === 2;
    U.uPrint.value = prn ? 1 : 0; U.uHatch.value = s.hatch ?? PR.hatch ?? 1; compMat.uniforms.print.value = prn ? 1 : 0;
    compMat.uniforms.reg.value = prn ? (PR.misregister ?? 0.8) : 0; compMat.uniforms.grain.value = prn ? (PR.grain ?? 0.07) : 0;
    const NA = (ST && ST.nature) || {}, colOf = (k, f) => (P.list.find((e) => e[0] === k) || [0, f])[1];
    const green = colOf('green', '#7fae68'), warmH = colOf('warm', paper), seaH = colOf(P.sea, cool);
    const classicNight = (PT.nightMode || 'classic') === 'classic';
    U.uNature.value = s.paint && s.nature !== 0 ? 1 : 0; U.uTime.value = (performance.now() / 1000) % 3600; U.uNight.value = night && s.paint && !classicNight ? 1 : 0;
    U.uGreen.value.set(...rgb(green)); U.uLightGreen.value.set(...rgb(mixHex(green, warmH, NA.gustWarm ?? 0.35)));
    U.uMarkGreen.value.set(...rgb(mixHex(green, mixHex(inkH, cool, 0.3), NA.markInk ?? 0.5)));
    U.uSea.value.set(...rgb(seaH)); U.uSeaShallow.value.set(...rgb(mixHex(mixHex(seaH, green, NA.shallowGreen ?? 0.4), paper, NA.shallowPaper ?? 0.25)));
    U.uPaperC.value.set(...rgb(paper)); [colOf('pink', paper), colOf('warm', paper), paper].forEach((h, i) => U.uBloom.value[i].set(...rgb(h)));
    const w = NA.wind || [0.94, 0.33]; U.uWind.value.set(w[0], w[1]).normalize();
    if (night && s.paint && !classicNight) { const nc = (h) => mixHex(h, mixHex(inkH, cool, 0.5), 0.55); U.uSea.value.set(...rgb(nc(seaH))); U.uSeaShallow.value.set(...rgb(nc(mixHex(seaH, green, 0.4)))); U.uPaperC.value.set(...rgb(mixHex(paper, cool, 0.35))); }
    const hand = prn ? (s.hand ?? PR.hand ?? 1) : 0, boil = Math.floor(performance.now() / 1000 * (PR.boilFps ?? 6)) % 64;
    U.uHand.value = hand; compMat.uniforms.hand.value = hand; U.uBoil.value = (PR.boilFps ?? 6) > 0 ? boil : 0; compMat.uniforms.boil.value = U.uBoil.value;
    const shade = night ? mixHex(inkH, cool, 0.42) : mixHex(mixHex(cool, inkH, PT.shadeInk ?? 0.3), pink, PT.shadePink ?? 0.18);
    U.uShade.value.set(...rgb(shade)); U.uHi.value.set(...rgb(PT.light || '#fff3d6'));
    const th0 = s.pt || (night && !classicNight ? PT.nightSteps || [0.95, 0.5, 0.22] : PT.steps || [0.85, 0.55, 0.3]), pk = night && classicNight && !s.pt ? s.nT : 1;
    U.uPT.value.set(th0[0] * pk, th0[1] * pk, th0[2] * pk);
    if (night && s.paint === 2 && classicNight) { const ik = new THREE.Color(inkH); compMat.uniforms.ink.value.set(ik.r, ik.g, ik.b); } // baskı gecesi: kontur mürekkep (beyaz değil) U.uGrain.value = PT.grain ?? 0.06;
    if (s.paint && !night) compMat.uniforms.skyTop.value.set(...rgb(mixHex(paper, cool, PT.zenith ?? 0.5)));
  }
  // 1) normal + derinlik  2) renk (atlas materyalde)  3) birleştir + kontur → cv (2B tuval)
  let frameN = 0;
  function render(cv, scene, cam, bg, s, dpr = 1, up = 1) {
    const w = Math.max(2, Math.round(cv.clientWidth * dpr * up)), h = Math.max(2, Math.round(cv.clientHeight * dpr * up));
    if (cv.width !== w || cv.height !== h) { cv.width = w; cv.height = h; }
    renderer.setSize(w, h, false);
    if (rtC.width !== w || rtC.height !== h) { rtC.setSize(w, h); rtN.setSize(w, h); }
    apply(s, dpr * up);
    compMat.uniforms.thick.value = dpr * up;
    const nd = scene.userData.nature; if (nd) { U.uDepth.value = nd.tex; U.uDepthB.value.set(nd.b.x0, nd.b.z0, nd.b.x1, nd.b.z1); }
    const persp = !!cam.isPerspectiveCamera && s.persp !== 0; compMat.uniforms.fogOn.value = persp ? 1 : 0; U.uNearOn.value = persp ? 1 : 0;
    // kontur geçişinde görünmeyecekler (userData.noOutline): saydam huzme, efektler
    const nc = scene.userData.noOutlineCache;
    if (!nc || ++nc.age > 45) { const list = []; scene.traverse((o) => { if (o.userData.noOutline) list.push(o); }); scene.userData.noOutlineCache = { list, age: 0 }; }
    const hidden = []; scene.userData.noOutlineCache.list.forEach((o) => { if (o.visible) { o.visible = false; hidden.push(o); } });
    // normal geçişi katman katman: nesneler (0) · kara ve yollar (1) · deniz (2); doğa bayrağı normal tamponunun mavi kanalında
    scene.background = null; const mask = cam.layers.mask;
    renderer.setClearColor(0x000000, 0); renderer.setRenderTarget(rtN); renderer.clear(); renderer.autoClear = false;
    const sAuto = renderer.shadowMap.autoUpdate; renderer.shadowMap.autoUpdate = false; // normal geçişi gölge haritasına gerek duymaz
    const natG = scene.userData.natureGroup;
    if (natG) {
      cam.layers.set(0); scene.overrideMaterial = ndMat; renderer.render(scene, cam); scene.overrideMaterial = null;
      cam.layers.set(1); cam.layers.enable(2);
      const sw = []; natG.children.forEach((m) => { if (m.isMesh && (m.layers.mask & 6)) { sw.push([m, m.material]); m.material = m.layers.mask & 4 ? ndSea : ndLand; } });
      renderer.render(natG, cam); sw.forEach(([m, mt]) => { m.material = mt; });
    } else [[0, ndMat], [1, ndLand], [2, ndSea]].forEach(([l, m]) => { cam.layers.set(l); scene.overrideMaterial = m; renderer.render(scene, cam); });
    renderer.autoClear = true; renderer.shadowMap.autoUpdate = sAuto;
    // gölge haritası her karede değil (varsayılan iki karede bir): sahnenin çoğu durağan
    const se = s.shadowEvery ?? 2; frameN++; if (se > 1) { renderer.shadowMap.autoUpdate = false; renderer.shadowMap.needsUpdate = frameN % se === 0; } cam.layers.mask = mask; cam.layers.enable(1); cam.layers.enable(2);
    scene.overrideMaterial = null; scene.background = bg;
    hidden.forEach((o) => { o.visible = true; });
    renderer.setRenderTarget(rtC); renderer.render(scene, cam);
    compMat.uniforms.tC.value = rtC.texture; compMat.uniforms.tN.value = rtN.texture; compMat.uniforms.res.value.set(w, h);
    renderer.setRenderTarget(null); renderer.render(fsScene, fsCam);
    if (cv !== renderer.domElement) cv.getContext('2d').drawImage(renderer.domElement, 0, 0); // ana tuval doğrudan çizilir; kopya yalnız küçük resimlerde
    return { w, h };
  }

  return { PALS, SYSTEMS, DEFAULTS, rolesOf, atlasCanvas, patchObject, apply, render, LAMBERT, CELL, TONES };
}
