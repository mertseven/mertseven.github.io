// Takımada · arazi motoru
// Ada planı (kutuphane/ada-planlari.js) → 3B arazi. 2B plan çizimindeki yükseklik fonksiyonunun aynısı:
// kıyıdan içeri yumuşak yükselen zemin + gauss tepeler; mekânların altına düzlük (pad) açılır.
//
// createTerrain(THREE, plan, { footprints, C }) → { group, heightAt(x, z), inside(x, z), bounds, coast }

function createTerrain(THREE, plan, opts = {}) {
  const C = opts.C || {}, FP = opts.footprints || {};
  const VS = opts.vScale || 1.0;              // dikey ölçek
  const SEA = 0.05;                           // deniz seviyesi (y)

  // ---- kıyı: kapalı Catmull-Rom ----
  function smoothClosed(pts, n = 14) {
    const out = [], N = pts.length;
    for (let i = 0; i < N; i++) { const p0 = pts[(i - 1 + N) % N], p1 = pts[i], p2 = pts[(i + 1) % N], p3 = pts[(i + 2) % N];
      for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t; out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); } }
    return out;
  }
  function smoothOpen(pts, n = 12) {
    if (pts.length < 3) { const out = []; for (let i = 0; i <= n; i++) { const t = i / n; out.push([pts[0][0] + (pts[1][0] - pts[0][0]) * t, pts[0][1] + (pts[1][1] - pts[0][1]) * t]); } return out; }
    const out = [], P = [pts[0], ...pts, pts[pts.length - 1]];
    for (let i = 1; i < P.length - 2; i++) { const p0 = P[i - 1], p1 = P[i], p2 = P[i + 1], p3 = P[i + 2];
      for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t; out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * t + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * t2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * t3))); } }
    out.push(pts[pts.length - 1]); return out;
  }
  const inPoly = (poly, x, z) => { let c = false; for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) { const [xi, zi] = poly[i], [xj, zj] = poly[j]; if ((zi > z) !== (zj > z) && x < (xj - xi) * (z - zi) / (zj - zi) + xi) c = !c; } return c; };
  const segDist = (px, pz, [ax, az], [bx, bz]) => { const dx = bx - ax, dz = bz - az, t = Math.max(0, Math.min(1, ((px - ax) * dx + (pz - az) * dz) / (dx * dx + dz * dz))); return Math.hypot(px - ax - t * dx, pz - az - t * dz); };
  const ss = (a, b, v) => { const t = Math.max(0, Math.min(1, (v - a) / (b - a))); return t * t * (3 - 2 * t); };

  const coast = smoothClosed(plan.coast);
  const zones = plan.zones.map((z) => ({ kind: z.kind, poly: smoothClosed(z.poly, 8), src: z }));
  function base(x, z) {
    let d = 1e9; for (let i = 0; i < coast.length; i++) d = Math.min(d, segDist(x, z, coast[i], coast[(i + 1) % coast.length]));
    if (!inPoly(coast, x, z)) return { h: -Math.min(1, d / 2.4), d: -d };
    let h = 0.12 + ss(0, 2.4, d) * 0.45;
    plan.hills.forEach((hl) => { const r2 = (x - hl.at[0]) ** 2 + (z - hl.at[1]) ** 2, s = hl.r / 2; h += hl.h * Math.exp(-r2 / (2 * s * s)) * ss(0, 1.6, d); });
    return { h, d };
  }
  // mekân düzlükleri: mekânın ayak izi kadar düz zemin, kenarda yumuşak geçiş
  const pads = Object.entries(plan.places).filter(([, p]) => !p.water).map(([k, p]) => ({ x: p.at[0], z: p.at[1], r: (FP[k] || 2.3), h: base(p.at[0], p.at[1]).h }));
  function heightRaw(x, z) {
    const b = base(x, z); let h = b.h;
    if (b.d > 0) pads.forEach((p) => { const dd = Math.hypot(x - p.x, z - p.z), w = 1 - ss(p.r * 0.85, p.r + 1.4, dd); h = h * (1 - w) + p.h * w; });
    return { h, d: b.d };
  }
  const heightAt = (x, z) => heightRaw(x, z).h * VS;

  // ---- arazi ağı ----
  const xs = coast.map((p) => p[0]), zs = coast.map((p) => p[1]);
  const B = { x0: Math.min(...xs) - 3, x1: Math.max(...xs) + 3, z0: Math.min(...zs) - 3, z1: Math.max(...zs) + 3 };
  const G = opts.grid || 0.25, nx = Math.ceil((B.x1 - B.x0) / G) + 1, nz = Math.ceil((B.z1 - B.z0) / G) + 1;
  const pos = new Float32Array(nx * nz * 3), colr = new Float32Array(nx * nz * 3), idx = [];
  const cc = (k) => new THREE.Color(C[k] || k);
  const CS = { sand: cc(C.sand ? 'sand' : 'ground'), grass: cc('green'), forest: cc('green'), village: cc('ground'), garden: cc('green'), rock: cc('mid'), seabed: new THREE.Color(opts.seaColor || C.cool || '#3f78b5') };
  for (let j = 0; j < nz; j++) for (let i = 0; i < nx; i++) {
    const x = B.x0 + i * G, z = B.z0 + j * G, { h, d } = heightRaw(x, z), o = (j * nx + i) * 3;
    pos[o] = x; pos[o + 1] = h * VS; pos[o + 2] = z;
    let c = d < 0 ? CS.seabed : (h < 0.33 || d < 1.1) ? CS.sand : CS.grass;
    if (d > 0) zones.forEach((zn) => { if (inPoly(zn.poly, x, z)) c = CS[zn.kind] || c; });
    if (d > 0 && h > 1.9) c = CS.rock;  // yüksek kayalık tepeler
    colr[o] = c.r; colr[o + 1] = c.g; colr[o + 2] = c.b;
  }
  for (let j = 0; j < nz - 1; j++) for (let i = 0; i < nx - 1; i++) { const a = j * nx + i, b = a + 1, c = a + nx, d = c + 1; idx.push(a, c, b, b, c, d); }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('color', new THREE.BufferAttribute(colr, 3)); geo.setIndex(idx); geo.computeVertexNormals();
  const group = new THREE.Group();
  const land = new THREE.Mesh(geo, new THREE.MeshToonMaterial({ vertexColors: true })); land.receiveShadow = true; land.castShadow = true; group.add(land);
  land.layers.set(1); land.material.userData.nature = 'land'; // canlı doğa: rüzgâr, ot işaretleri (görünüm motoru) // doğa katmanı: baskı modunda konturu yalnız kıyıda çizilir (görünüm motoru bütün katmanları çizer)

  // ---- deniz: geniş düzlem + dalga deseni ----
  const seaMat = new THREE.MeshToonMaterial({ color: opts.seaColor || C.cool || '#3f78b5' });
  if (opts.waveTex) { seaMat.map = opts.waveTex; seaMat.color.set('#ffffff'); }
  const sea = new THREE.Mesh(new THREE.PlaneGeometry(200, 200), seaMat); sea.rotation.x = -Math.PI / 2; sea.position.y = SEA; sea.receiveShadow = true; group.add(sea);
  sea.layers.set(2); seaMat.userData.nature = 'sea'; // deniz katmanı · canlı deniz
  // kıyıya uzaklık dokusu (0 kıyı · 1 açık deniz): sığlık, köpük ve dalga sıklığı buna bakar
  const DN = 128, dd = new Uint8Array(DN * DN * 4);
  for (let j = 0; j < DN; j++) for (let i = 0; i < DN; i++) {
    const x = B.x0 + (i + 0.5) / DN * (B.x1 - B.x0), z = B.z0 + (j + 0.5) / DN * (B.z1 - B.z0), b = base(x, z);
    const v = b.d > 0 ? 0 : Math.min(255, Math.round(-b.d / 3.2 * 255)); dd.set([v, v, v, 255], (j * DN + i) * 4);
  }
  const depthTex = new THREE.DataTexture(dd, DN, DN, THREE.RGBAFormat); depthTex.magFilter = depthTex.minFilter = THREE.LinearFilter; depthTex.needsUpdate = true;

  // ---- yollar: araziye yapışan şeritler ----
  plan.paths.filter((p) => p.pts.length >= 2).forEach((p) => { // atölyede çizilmekte olan tek noktalı yol atlanır
    const pts = smoothOpen(p.pts, 14), w = p.kind === 'road' ? 0.9 : 0.45, v = [], ix = [];
    pts.forEach(([x, z], i) => {
      const [nx2, nz2] = pts[Math.min(i + 1, pts.length - 1)], [px, pz] = pts[Math.max(i - 1, 0)];
      let tx = nx2 - px, tz = nz2 - pz; const L = Math.hypot(tx, tz) || 1; tx /= L; tz /= L;
      [-1, 1].forEach((s) => { const qx = x - tz * w / 2 * s, qz = z + tx * w / 2 * s; v.push(qx, Math.max(heightAt(qx, qz), SEA) + 0.035, qz); });
      if (i) { const a = (i - 1) * 2; ix.push(a, a + 1, a + 2, a + 1, a + 3, a + 2); }
    });
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(v, 3)); g.setIndex(ix); g.computeVertexNormals();
    const m = new THREE.Mesh(g, new THREE.MeshToonMaterial({ color: p.kind === 'road' ? (C.paper || '#f1e9d8') : (C.ground || '#e6d9bd'), side: THREE.DoubleSide })); m.receiveShadow = true; m.position.y = 0; m.layers.set(1);
    group.add(m);
  });

  return { group, heightAt, inside: (x, z) => inPoly(coast, x, z), bounds: B, coast, zones, sea: SEA, smoothOpen, depthTex };
}
