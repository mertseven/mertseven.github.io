/* Giriş sayfasından LAB'a ve MAP'e geçiş.
   LAB — kürenin içine: tıklanınca küre olduğu yerden dönerek bize doğru büyür; içine girince
         yansımadaki galeri gerçek oda olur: biz deniz fenerindeyiz. Kamera duvarları
         (portreleriyle) bir buçuk tur dolaşıp pencerede durur; camın ardında gece adası ve
         fenerin huzmesi. Kamera cama doğru ilerler, sayfa aydınlanır ve LAB açılır.
   MAP — dağların üstünde: arazi atlasın kendisi; kütüphanelerin sık olduğu yerler dağ.
         Her kütüphane, atlastaki yerinde tepeye dikilmiş bir bayrak: direkte adı dalgalanır.
         Alçaktan en kalabalık kümenin içinden uçulur, sonra kamera yükselir ve arazi atlasın
         eş yükselti haritasına dönüşür.
   Bir dokunuş ya da tuş geçişi atlar (Esc iptal eder). Hareket azaltılmışsa geçiş yok.
   Geri tuşuyla dönülürse (bfcache) sayfa ilk hâline kurulur. */
import * as THREE from './lab/assets/vendor/three.module.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = matchMedia('(max-width: 760px), (pointer: coarse)').matches;
const clamp01 = (t) => Math.max(0, Math.min(1, t));
const span = (t, a, b) => clamp01((t - a) / (b - a));
const inOut = (t) => (t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const outC = (t) => 1 - Math.pow(1 - t, 3);

const veil = document.createElement('div');
veil.className = 'gecis'; veil.hidden = true;
veil.innerHTML = '<span class="gecis__skip">tap to skip</span>';
document.body.append(veil);

let run = null; // süren geçiş: { stop() }

function prefetch(href){
  if(document.querySelector(`link[rel="prefetch"][href="${href}"]`)) return;
  const l = document.createElement('link'); l.rel = 'prefetch'; l.href = href; document.head.append(l);
}
function go(href){ location.href = href; }

/* Geçişin ortak kabuğu: perde, atlama, iptal, bitiş. */
// keepPage: perde hemen koyulaşmaz, sayfa görünür kalır (LAB: küre sayfanın üstünde büyür)
function begin(href, kind, stop, keepPage = false){
  veil.hidden = false; veil.className = 'gecis gecis--' + kind;
  if(!keepPage) requestAnimationFrame(() => veil.classList.add('on'));
  document.body.classList.add('in-gecis', 'gecis-' + kind);
  let done = false;
  const finish = () => { if(done) return; done = true; off(); go(href); };
  const cancel = () => { if(done) return; done = true; off(); reset(); };
  const onKey = (e) => { if(e.key === 'Escape') cancel(); else finish(); };
  const on = () => { addEventListener('pointerdown', finish); addEventListener('keydown', onKey); };
  const off = () => { removeEventListener('pointerdown', finish); removeEventListener('keydown', onKey); };
  const t = setTimeout(on, 250); // tıklamanın kendi olayları atlama sayılmasın
  const reset = () => {
    clearTimeout(t); stop();
    veil.hidden = true; veil.className = 'gecis'; veil.querySelector('canvas')?.remove();
    document.body.classList.remove('in-gecis', 'gecis-lab', 'gecis-map');
    run = null;
  };
  run = { reset: () => { done = true; off(); reset(); } };
  return { finish, isDone: () => done };
}

/* ==================================================================
   LAB — kürenin içine
================================================================== */
/* Fenerin huzmesi: biz fenerin içindeyiz, ışık bizden çıkıp adanın üstünde gezinir.
   Alttan açılan yumuşak bir yelpaze; dönme noktası yelpazenin ucu. */
function beamTexture(){
  const c = document.createElement('canvas'); c.width = 256; c.height = 512;
  const g = c.getContext('2d');
  const grd = g.createLinearGradient(0, 512, 0, 0);
  grd.addColorStop(0, 'rgba(255,244,200,.9)'); grd.addColorStop(1, 'rgba(255,244,200,0)');
  g.fillStyle = grd; g.beginPath(); g.moveTo(128, 512); g.lineTo(0, 0); g.lineTo(256, 0); g.closePath(); g.fill();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

function intoSphere(href){
  const host = document.querySelector('[data-sphere]'), api = host && host.sphereApi;
  if(!api) return go(href);
  const { renderer, scene, room, hall, cam, cubeCam, HZ } = api;
  const canvas = renderer.domElement;

  // Tuval ilk karede tam ekran olur; kamera görüşü kaydırılarak küre önce sayfadaki yerinde
  // ve boyunda görünür, sonra büyüyüp ekranın ortasına gelir: arada boş ya da siyah kare yok.
  const r = host.getBoundingClientRect();
  const home = { parent: host.parentNode, next: host.nextSibling, style: host.getAttribute('style') || '' };
  document.body.append(host);
  host.classList.add('sphere--loose');
  Object.assign(host.style, { left: '0px', top: '0px', width: '100%', height: '100%' });

  // pencerenin ardında ada zaten var (giris.js); önüne fenerin huzmesi gelir
  const beamGeo = new THREE.PlaneGeometry(9, 26); beamGeo.translate(0, 13, 0);
  const beam = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({ map: beamTexture(), transparent: true, opacity: .32,
    blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }));
  beam.position.set(0, -12, HZ + 13.8); beam.rotation.y = Math.PI; hall.add(beam);

  const A = .95, B = 3.8, P = 1.3, C = .5; // yaklaşma · bir buçuk tur · cama doğru · ışık (saniye)
  let t = 0, phase = 'approach', tB = 0, tP = 0, total = 0;
  const from = new THREE.Vector3(0, .5, 4.7), p = new THREE.Vector3(), O = new THREE.Vector3();
  const near = cam.near, tan = (deg) => Math.tan(deg * Math.PI / 360);
  const eye0 = new THREE.Vector3(0, .3, 0), door = new THREE.Vector3(), far = new THREE.Vector3(), look = new THREE.Vector3();

  const shell = begin(href, 'lab', () => {
    hall.remove(beam); beamGeo.dispose(); beam.material.map.dispose(); beam.material.dispose();
    host.classList.remove('sphere--loose'); host.setAttribute('style', home.style);
    home.parent.insertBefore(host, home.next);
    canvas.style.opacity = ''; api.release();
  }, true);

  api.drive((dt) => {
    t += dt;
    const W = host.clientWidth, H = Math.max(1, host.clientHeight);
    const pr = renderer.getPixelRatio();
    if(canvas.width !== Math.round(W * pr) || canvas.height !== Math.round(H * pr)) renderer.setSize(W, H, false);
    beam.rotation.z = Math.sin(t * .9) * .62; // huzme adanın üstünde bir sağa bir sola

    if(phase === 'approach'){
      // küre hızlanarak döner ve bize gelir; görüş, sayfadaki yerinden ekranın ortasına kayar
      const u = span(t, 0, A), m = inOut(Math.min(1, u / .7));
      hall.rotation.y += dt * (.35 + 5 * u * u);
      p.copy(from).lerp(O, Math.pow(u, 1.7));
      cam.position.copy(p); cam.up.set(0, 1, 0); cam.lookAt(0, -.16 * (1 - u), 0);
      const h0 = near * tan(31), w0 = h0 * r.width / r.height, px = 2 * h0 / r.height;
      const h1 = near * tan(31 + 30 * u * u), w1 = h1 * W / H;
      const L = -w0 - r.left * px, R = w0 + (W - r.right) * px, T = h0 + r.top * px, Bt = -h0 - (H - r.bottom) * px;
      cam.projectionMatrix.makePerspective(L + (-w1 - L) * m, R + (w1 - R) * m, T + (h1 - T) * m, Bt + (-h1 - Bt) * m, near, cam.far);
      cam.projectionMatrixInverse.copy(cam.projectionMatrix).invert();
      cubeCam.update(renderer, room); renderer.render(scene, cam);
      if(t >= A || p.length() < 1.02){
        phase = 'turn'; tB = t; veil.classList.add('on');
        // Pencere salonun +z duvarında; salon dönmüş olabilir. Tur, kameranın pencereye bakan
        // açısında biter: bir turdan fazla, iki turdan az (giriş arka duvara bakar).
        const win = Math.PI - hall.rotation.y, d = ((0 - win) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2);
        total = d + Math.PI * 2;
      }
      return;
    }

    cam.up.set(0, 1, 0); cam.aspect = W / H;
    if(phase === 'turn'){
      // salon durur, kamera odanın ortasında döner; duvarlardaki portreler geçer, pencerede durur.
      // Kürenin son dönüş hızıyla başlar, yavaşlayarak durur.
      const v = span(t - tB, 0, B), yaw = -total * (1 - Math.pow(1 - v, 2));
      cam.position.copy(eye0); cam.fov = 72; cam.updateProjectionMatrix();
      cam.lookAt(Math.sin(yaw) * 5, .75, -Math.cos(yaw) * 5);
      renderer.render(room, cam);
      if(v >= 1){
        phase = 'push'; tP = t;
        door.set(0, 1.3, HZ - 1.1); far.set(0, 1.4, HZ + 14); hall.localToWorld(door); hall.localToWorld(far);
        look.set(Math.sin(yaw) * 5, .75, -Math.cos(yaw) * 5);
      }
      return;
    }

    // cama doğru: kamera kapının camına yürür, bakış adaya iner; sonda sayfa aydınlanır ve LAB açılır
    const w = span(t - tP, 0, P), e = inOut(w);
    cam.position.copy(eye0).lerp(door, e);
    cam.fov = 72 - 14 * e; cam.updateProjectionMatrix();
    cam.lookAt(look.clone().lerp(far, e));
    renderer.render(room, cam);
    const f = span(t - tP, P - C, P);
    if(f > 0 && !veil.classList.contains('flash')) veil.classList.add('flash');
    canvas.style.opacity = String(1 - f);
    if(f >= 1) shell.finish();
  });
}

/* ==================================================================
   MAP — dağların üstünde
================================================================== */
/* Atlasın kütüphaneleri, atlastaki yerleriyle (arac/atlas-bayrak.mjs). Sayfa açılınca alınır;
   arazi ve bayraklar MAP yarısının üzerine gelinince ya da tıklanınca kurulur. */
let flagData = null;
const dataReady = fetch(new URL('atlas-bayrak.json', import.meta.url)).then((r) => r.json()).then((d) => (flagData = d)).catch(() => null);

const hash = (i, j) => {
  let h = Math.imul(i, 374761393) ^ Math.imul(j, 668265263) ^ 0x5bd1e995;
  h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296;
};
const sm = (t) => t * t * (3 - 2 * t);
function vnoise(x, z){
  const i = Math.floor(x), j = Math.floor(z), fx = sm(x - i), fz = sm(z - j);
  const a = hash(i, j), b = hash(i + 1, j), c = hash(i, j + 1), d = hash(i + 1, j + 1);
  return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz;
}
/* sırtlı gürültü: yamaçlara kolajdaki sıradağların dokusunu verir */
function ridged(x, z){
  let h = 0, amp = 1, f = .05, tot = 0;
  for(let o = 0; o < 4; o++){
    const n = 1 - Math.abs(vnoise(x * f + o * 17.3, z * f - o * 9.1) * 2 - 1);
    h += n * n * amp; tot += amp; amp *= .5; f *= 2.03;
  }
  return h / tot;
}

/* Arazi = kütüphanelerin yoğunluğu: kümeler dağ, aradaki boşluklar vadi. Kaba bir ızgarada
   bir kez hesaplanır, arası çift doğrusal okunur. */
const SPAN = 80, FIELD = 130, EXT = 120; // atlas -1…1 → ±80 birim; ızgara ±120'yi örter
let field = null;
function buildField(){
  if(field || !flagData) return field;
  const n = FIELD, g = new Float32Array(n * n), step = EXT * 2 / (n - 1), s2 = 2 * 7.5 * 7.5;
  const pts = flagData.libs.map((l) => [l[3] * SPAN, l[4] * SPAN, 1 + Math.sqrt(l[2] / 110) * .6]);
  let max = 0;
  for(let j = 0; j < n; j++) for(let i = 0; i < n; i++){
    const x = -EXT + i * step, z = -EXT + j * step; let h = 0;
    for(const [px, pz, w] of pts){ const dx = x - px, dz = z - pz, d = dx * dx + dz * dz; if(d < 900) h += w * Math.exp(-d / s2); }
    g[j * n + i] = h; if(h > max) max = h;
  }
  let peak = 0;
  for(let k = 0; k < g.length; k++){ if(g[k] > g[peak]) peak = k; }
  for(let j = 0; j < n; j++) for(let i = 0; i < n; i++){
    const x = -EXT + i * step, z = -EXT + j * step, k = j * n + i;
    const d = g[k] / max; // pürüz tepelerde: düzlükler sakin kalsın, eş yükselti çizgileri orada karışmasın
    g[k] = 24 * Math.pow(d, .75) + 3.5 * ridged(x, z) * (.15 + .85 * Math.min(1, d * 2.5)) - 3;
  }
  field = { g, step, peak: [-EXT + (peak % n) * step, -EXT + Math.floor(peak / n) * step] };
  field.path = valley(pts);
  return field;
}

/* Uçuş yolu: tek bir uzun vadi. Haritayı doğu–batı yönünde (±35°) kesen düz çizgiler denenir;
   alçak giden, bayrağın dibinden geçmeyen ve iki yanında da bayrak olan seçilir. Sonra çizgi
   kendi koridorunda (±8 birim) vadinin tabanına oturtulur ve yumuşatılır. Uç: kamera orada
   kuzeye döner ve yükselir. { X, Z, cum }: batıdan doğuya noktalar ve yol boyu uzunluk. */
function valley(pts){
  const cell = (x, z, nx, nz) => {
    let L = 1e9, R = 1e9, pen = 0;
    for(const [a, b] of pts){
      const ex = a - x, ez = b - z, d = Math.hypot(ex, ez); if(d < 13) pen += 250 * (1 - d / 13) ** 2;
      if(ex * nx + ez * nz > 0) L = Math.min(L, d); else R = Math.min(R, d);
    }
    return height(x, z) + pen + (Math.max(0, L - 16) + Math.max(0, R - 16)) * 1.2;
  };
  const HALF = 66, n = 33; let best = null;
  for(let a = -35; a <= 35; a += 5){
    const th = a * Math.PI / 180, dx = Math.cos(th), dz = Math.sin(th), nx = -dz, nz = dx;
    for(let o = -50; o <= 50; o += 2.5){
      let c = 0;
      for(let i = 0; i <= n; i++){ const u = (i / n * 2 - 1) * HALF; c += cell(nx * o + dx * u, nz * o + dz * u, nx, nz); }
      if(!best || c < best.c) best = { c, dx, dz, nx, nz, o };
    }
  }
  const { dx, dz, nx, nz, o } = best, step = 2.5, rows = Math.round(HALF * 2 / step) + 1, W = 8, cols = W * 2 + 1;
  const cost = new Float32Array(rows * cols), from = new Int8Array(rows * cols);
  for(let r = 0; r < rows; r++) for(let c = 0; c < cols; c++){
    const u = -HALF + r * step, w = c - W, v = cell(nx * (o + w) + dx * u, nz * (o + w) + dz * u, nx, nz);
    let b = 0;
    if(r){
      b = Infinity;
      for(let k = -1; k <= 1; k++){ const cc = c + k; if(cc < 0 || cc >= cols) continue; const q = cost[(r - 1) * cols + cc] + k * k * 2; if(q < b){ b = q; from[r * cols + c] = cc; } }
    }
    cost[r * cols + c] = v + b;
  }
  let c = 0;
  for(let k = 1; k < cols; k++) if(cost[(rows - 1) * cols + k] < cost[(rows - 1) * cols + c]) c = k;
  const ws = new Float32Array(rows);
  for(let r = rows - 1; r >= 0; r--){ ws[r] = c - W; c = from[r * cols + c]; }
  for(let pass = 0; pass < 8; pass++){
    const ys = ws.slice();
    for(let r = 0; r < rows; r++){ let s = 0, m = 0; for(let k = -3; k <= 3; k++){ const q = r + k; if(q >= 0 && q < rows){ s += ys[q]; m++; } } ws[r] = s / m; }
  }
  const X = new Float32Array(rows), Z = new Float32Array(rows), cum = new Float32Array(rows);
  for(let r = 0; r < rows; r++){
    const u = -HALF + r * step; X[r] = nx * (o + ws[r]) + dx * u; Z[r] = nz * (o + ws[r]) + dz * u;
    if(r) cum[r] = cum[r - 1] + Math.hypot(X[r] - X[r - 1], Z[r] - Z[r - 1]);
  }
  return { X, Z, cum };
}
function height(x, z){
  const { g, step } = field, n = FIELD;
  const fx = Math.max(0, Math.min(n - 1.001, (x + EXT) / step)), fz = Math.max(0, Math.min(n - 1.001, (z + EXT) / step));
  const i = Math.floor(fx), j = Math.floor(fz), u = fx - i, v = fz - j;
  const a = g[j * n + i], b = g[j * n + i + 1], c = g[(j + 1) * n + i], d = g[(j + 1) * n + i + 1];
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}

/* Bayrak adları tek bir dokuda: her ad kendi uzunluğunda bir şerit. */
const FLAG_FONT = '800 44px "Roboto Flex", "DM Sans", Arial, sans-serif', CELL = 64, PAD = 18;
function flagAtlas(libs){
  const W = 2048, c = document.createElement('canvas'); c.width = W; c.height = 2048;
  const g = c.getContext('2d'); g.font = FLAG_FONT; g.textBaseline = 'middle'; g.fillStyle = '#141412';
  let x = 0, y = 0; const rects = [];
  for(const l of libs){
    const w = Math.ceil(g.measureText(l[0]).width) + PAD * 2;
    if(x + w > W){ x = 0; y += CELL; }
    g.fillText(l[0], x + PAD, y + CELL / 2 + 2);
    rects.push([x, y, w]); x += w;
  }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return { tex: t, rects, W, H: 2048 };
}

function overMountains(href){
  if(!flagData || !buildField()) return go(href); // veri gelmediyse doğrudan atlas
  let renderer;
  try{ renderer = new THREE.WebGLRenderer({ antialias: !small, powerPreference: 'high-performance' }); }
  catch(e){ return go(href); }
  renderer.setPixelRatio(Math.min(small ? 1.5 : 2, devicePixelRatio || 1));
  const canvas = renderer.domElement; veil.prepend(canvas);
  const fit = () => { renderer.setSize(veil.clientWidth, veil.clientHeight, false); cam.aspect = veil.clientWidth / Math.max(1, veil.clientHeight); cam.updateProjectionMatrix(); };

  const css = getComputedStyle(document.body);
  const night = new THREE.Color(css.getPropertyValue('--paper').trim() || '#151513');
  const ink = new THREE.Color(css.getPropertyValue('--ink').trim() || '#f1efe8');
  // atlasın ilk karesi: kendi zemin ve mürekkep renkleri (koyu temada koyu zemin)
  const dark = matchMedia('(prefers-color-scheme: dark)').matches;
  const ground = new THREE.Color(dark ? '#1D1D1C' : '#D5D1C4'), groundInk = new THREE.Color(dark ? '#E9E5DA' : '#1A1A19');

  const scene = new THREE.Scene();
  const SEG = small ? 160 : 250, SIZE = 340;
  const geo = new THREE.PlaneGeometry(SIZE, SIZE, SEG, SEG); geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position;
  for(let i = 0; i < pos.count; i++) pos.setY(i, height(pos.getX(i), pos.getZ(i)));
  geo.computeVertexNormals();
  const uni = { uBg: { value: night }, uInk: { value: ink }, uBg2: { value: ground }, uInk2: { value: groundInk },
    uMix: { value: 0 }, uFog: { value: .014 }, uStep: { value: 1.3 } };
  const mat = new THREE.ShaderMaterial({ uniforms: uni,
    vertexShader: `varying float vH; varying vec3 vN; varying float vD;
      void main(){ vH = position.y; vN = normal; vec4 mv = modelViewMatrix * vec4(position, 1.); vD = -mv.z; gl_Position = projectionMatrix * mv; }`,
    fragmentShader: `uniform vec3 uBg, uInk, uBg2, uInk2; uniform float uMix, uFog, uStep;
      varying float vH; varying vec3 vN; varying float vD;
      void main(){
        vec3 bg = mix(uBg, uBg2, uMix), ink = mix(uInk, uInk2, uMix);
        float k = vH / uStep, w = fwidth(k);
        float line = 1. - smoothstep(0., w * 1.3, abs(fract(k - .5) - .5));
        float k5 = k / 5., w5 = fwidth(k5);
        float major = 1. - smoothstep(0., w5 * 1.6, abs(fract(k5 - .5) - .5));
        float lam = clamp(dot(normalize(vN), normalize(vec3(-.5, .8, .3))), 0., 1.);
        // yamaçlar ışığa göre aydınlanır: dağ olduğu okunsun; sonda düz harita
        vec3 col = mix(bg, ink, .2 * lam * (1. - uMix));
        col = mix(col, ink, max(line * .55, major * .9));
        col = mix(col, bg, (1. - exp(-vD * uFog)) * (1. - uMix));
        gl_FragColor = vec4(col, 1.);
        #include <colorspace_fragment>
      }` });
  scene.add(new THREE.Mesh(geo, mat));

  // Bayraklar: tepelere dikilmiş direkler, kumaşta kütüphanenin adı, rüzgârda dalgalanır.
  // Hepsi aynı yöne eser; dalga direkte sıfırdan başlar, serbest uca doğru büyür.
  const { X, Z, cum } = field.path;
  const libs = flagData.libs, N = libs.length, atlas = flagAtlas(libs);
  const fgeo = new THREE.PlaneGeometry(1, 1, 14, 1); fgeo.translate(.5, -.5, 0);
  const aUv = new Float32Array(N * 4), aCol = new Float32Array(N * 3), aPh = new Float32Array(N);
  const fmat = new THREE.ShaderMaterial({ side: THREE.DoubleSide,
    uniforms: { uAtlas: { value: atlas.tex }, uTime: { value: 0 }, uInk: { value: new THREE.Color('#141412') } },
    vertexShader: `attribute vec4 aUv; attribute vec3 aCol; attribute float aPh; uniform float uTime;
      varying vec2 vUv, vSpan; varying vec3 vCol; varying float vShade;
      void main(){
        vec3 p = position; float k = p.x, a = p.x * 5.5 - uTime * 6. + aPh;
        p.z += sin(a) * .16 * k; p.y -= .05 * k * k;
        vShade = .86 + .14 * cos(a);
        vUv = vec2(mix(aUv.x, aUv.z, uv.x), mix(aUv.y, aUv.w, uv.y)); vCol = aCol; vSpan = aUv.xz;
        gl_Position = projectionMatrix * modelViewMatrix * instanceMatrix * vec4(p, 1.);
      }`,
    fragmentShader: `uniform sampler2D uAtlas; uniform vec3 uInk; varying vec2 vUv, vSpan; varying vec3 vCol; varying float vShade;
      void main(){
        // arkadan bakılınca ad ters okunmasın: kumaşın iki yüzüne de doğru yazılmış gibi
        vec2 uv = gl_FrontFacing ? vUv : vec2(vSpan.x + vSpan.y - vUv.x, vUv.y);
        float t = texture2D(uAtlas, uv).a; gl_FragColor = vec4(mix(vCol, uInk, t) * vShade, 1.);
        #include <colorspace_fragment>
      }` });
  const flags = new THREE.InstancedMesh(fgeo, fmat, N);
  const poles = new THREE.InstancedMesh(new THREE.BoxGeometry(.09, 1, .09), new THREE.MeshBasicMaterial({ color: ink }), N);
  const M = new THREE.Matrix4(), Q = new THREE.Quaternion(), Y = new THREE.Vector3(0, 1, 0), S = new THREE.Vector3(), Pv = new THREE.Vector3(), col = new THREE.Color();
  const Q0 = new THREE.Quaternion();
  libs.forEach(([name, cat, stars, nx, ny], i) => {
    const x = nx * SPAN, z = ny * SPAN, gy = height(x, z), pop = Math.sqrt(Math.min(1, stars / 110));
    const fh = .9 + 1.5 * pop, ph = 2.2 + 2.6 * pop + fh, [rx, ry, rw] = atlas.rects[i];
    // kumaş, yolun ona yaklaşılan yerine döner (en yakın noktanın ~20 birim gerisi):
    // kamera gelirken adı yandan değil önden okur
    let bz = 0, bd = Infinity;
    for(let k = 0; k < X.length; k++){ const d = (X[k] - x) ** 2 + (Z[k] - z) ** 2; if(d < bd){ bd = d; bz = k; } }
    bz = Math.max(0, bz - 8);
    Q.setFromAxisAngle(Y, Math.atan2(X[bz] - x, Z[bz] - z) - .35);
    poles.setMatrixAt(i, M.compose(Pv.set(x, gy + ph / 2, z), Q0, S.set(1, ph, 1)));
    flags.setMatrixAt(i, M.compose(Pv.set(x, gy + ph, z), Q, S.set(fh * rw / CELL, fh, fh)));
    aUv.set([rx / atlas.W, 1 - (ry + CELL) / atlas.H, (rx + rw) / atlas.W, 1 - ry / atlas.H], i * 4);
    col.set(flagData.cats[cat] || '#9AA3B8'); aCol.set([col.r, col.g, col.b], i * 3);
    aPh[i] = hash(i, 7) * 6.28;
  });
  fgeo.setAttribute('aUv', new THREE.InstancedBufferAttribute(aUv, 4));
  fgeo.setAttribute('aCol', new THREE.InstancedBufferAttribute(aCol, 3));
  fgeo.setAttribute('aPh', new THREE.InstancedBufferAttribute(aPh, 1));
  scene.add(poles, flags);

  const cam = new THREE.PerspectiveCamera(62, 1, .1, 500);
  veil.hidden = false; fit(); // perde görünmeden ölçülemez
  const onResize = fit;
  addEventListener('resize', onResize);

  let raf = 0, t0 = 0, camY = null;
  const shell = begin(href, 'map', () => {
    cancelAnimationFrame(raf); removeEventListener('resize', onResize);
    geo.dispose(); mat.dispose(); fgeo.dispose(); fmat.dispose(); atlas.tex.dispose(); poles.geometry.dispose(); poles.material.dispose();
    renderer.dispose(); renderer.forceContextLoss();
  });

  // Yavaş, alçak bir yürüyüş vadilerden: bayraklar iki yandaki tepelerde, kamera onlara aşağıdan
  // bakar. Sonra yükselip bütün haritaya yukarıdan, dik bir açıyla bakar (tam tepeden değil).
  const LEN = cum[cum.length - 1];
  // yolda s birim ilerideki nokta → [x, z]
  const at = (s) => {
    s = Math.max(0, Math.min(LEN - .001, s)); let i = 0;
    while(cum[i + 1] < s) i++;
    const f = (s - cum[i]) / (cum[i + 1] - cum[i]);
    return [X[i] + (X[i + 1] - X[i]) * f, Z[i] + (Z[i + 1] - Z[i]) * f];
  };
  // Hızlı bir geçiş (~3 sn): vadinin ortasından uçulur, sonra kamera olduğu yerden yükselir ve
  // haritanın ortasına dik bakar (tam tepeden değil: bayraklar okunur kalsın).
  const FLY = 1.7, RISE = 1.15, S0 = 18, S1 = Math.min(LEN - 10, S0 + 92);
  const look = new THREE.Vector3(), eye = new THREE.Vector3(), top = new THREE.Vector3(), down = new THREE.Vector3();
  const sAt = (t) => S0 + (S1 - S0) * Math.min(1, t / FLY) + 6 * Math.max(0, t - FLY);
  let last = 0;
  function frame(now){
    t0 ||= now; const t = (now - t0) / 1000;
    const dt = Math.min(.1, t - last); last = t;
    fmat.uniforms.uTime.value = t;
    const s = sAt(Math.min(t, FLY + RISE)), [x, z] = at(s);
    // vadi tabanının biraz üstünde; önündeki yokuşa göre yumuşakça yükselir
    let ahead = -1e9; for(let k = 0; k <= 8; k += 2){ const [ax, az] = at(s + k); ahead = Math.max(ahead, height(ax, az) - k * .15); }
    const want = Math.max(ahead, height(x, z)) + 3.4;
    camY = camY === null ? want : camY + (want - camY) * (1 - Math.exp(-dt * 7));
    eye.set(x, camY, z);
    // bakış yolun gidişine (tepeyi delip öteki yana değil): yakın bir noktanın yönü, uzağa uzatılmış
    const [lx, lz] = at(s + 14), k = 30 / Math.max(.01, Math.hypot(lx - x, lz - z));
    look.set(x + (lx - x) * k, camY + 3, z + (lz - z) * k); // hafif yukarı: tepelerdeki bayraklara
    // yükseliş: olduğu yerden haritanın ortasına doğru kalkar, aşağı döner ve uzaklaşır. Gidiş yönü
    // korunur: bayraklar yola dönük olduğundan yukarıdan da önden okunur.
    const r = inOut(span(t, FLY, FLY + RISE)), cx = 4 + x * .15, cz = z * .15, dl = Math.hypot(lx - x, lz - z) || 1;
    down.set(cx, 0, cz); top.set(cx - (lx - x) / dl * 100, 130, cz - (lz - z) / dl * 100);
    cam.position.copy(eye).lerp(top, r);
    cam.up.set(0, 1, 0); cam.lookAt(look.lerp(down, r));
    cam.fov = 60 - 22 * r; cam.updateProjectionMatrix();
    uni.uMix.value = inOut(span(t, FLY + .3, FLY + RISE));
    renderer.setClearColor(new THREE.Color().copy(night).lerp(ground, uni.uMix.value));
    renderer.render(scene, cam);
    if(t >= FLY + RISE + .15) return shell.finish();
    raf = requestAnimationFrame(frame);
  }
  raf = requestAnimationFrame(frame);
}

/* ==================================================================
   bağlama
================================================================== */
document.querySelectorAll('.poster').forEach((a) => {
  a.addEventListener('pointerenter', () => { prefetch(a.href); if(a.classList.contains('poster--map')) dataReady.then(buildField); }, { once: true });
  a.addEventListener('click', (e) => {
    if(reduced || run || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault(); prefetch(a.href);
    (a.classList.contains('poster--lab') ? intoSphere : overMountains)(a.href);
  });
});
/* MAP'in köşesindeki "Museum" aynı dağların üstünden geçer, ama müzeye iner. */
document.querySelectorAll('.map-list a').forEach((a) => {
  a.addEventListener('pointerenter', () => { prefetch(a.href); dataReady.then(buildField); }, { once: true });
  a.addEventListener('click', (e) => {
    if(reduced || run || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    e.preventDefault(); prefetch(a.href); overMountains(a.href);
  });
});
/* Geri tuşuyla gelindiyse (sayfa önbellekten döndü) yarım kalan geçişi kaldır. */
addEventListener('pageshow', (e) => { if(e.persisted && run) run.reset(); });
window.gecis = { intoSphere, overMountains };
