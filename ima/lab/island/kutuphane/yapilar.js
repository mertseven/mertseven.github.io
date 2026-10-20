// Takımada · yapı motoru
// Tarif (veri) → three.js nesnesi. Karakterlerle aynı ilke: parçalar + renk ROLLERİ; görünüm katmanı sonra uygulanır.
//
// createStructures(THREE, parts) → { build(recipe, C, makeChar), PATTERNS }
//   parts: createParts(...) çıktısı (desenler, doku yardımcıları, karakter kurucu)
//
// Parça türleri (her biri: at [x,y,z], rot [x,y,z] radyan, scale, paint, emit, anim):
//   box {size:[w,h,d]} · cyl {r, rTop, h, seg} · cone {r, h, seg} · sphere {r, half} · lathe {profile:[[r,y]…]}
//   gable {w, d} (beşik çatı, tabanı y=0) · torus {r, tube, arc} · plane {w, d}
//   ring {count, radius, part} · row {count, step:[dx,dy,dz], part} · grid {nx, nz, step:[dx,dz], part}
//   group {parts} · char {id} (kütüphaneden karakter)
// anim: { spin: hız (rad/s, eksen 'y' varsayılan), axis, swing: genlik, bob: genlik, speed }

function createStructures(THREE, parts) {
  const { PATTERNS, patternCanvas, texFrom, LAMBERT } = parts;
  const S = 1024, SEG = 48;
  let seed = 3; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;

  // ================= Yapılara özgü desenler =================
  Object.assign(PATTERNS, {
    window: (x, [bg, fg, f2 = fg, f3 = fg]) => { // cephe: kemerli kapı + 4 kayıtlı pencere + saçak dişleri
      x.fillStyle = fg; x.fillRect(S * 0.42, S * 0.5, S * 0.16, S * 0.5); x.beginPath(); x.arc(S * 0.5, S * 0.5, S * 0.08, Math.PI, 0); x.fill();
      [[0.12, 0.2], [0.68, 0.2], [0.12, 0.55], [0.68, 0.55]].forEach(([a, b]) => { x.fillStyle = f2; x.fillRect(a * S, b * S, S * 0.2, S * 0.22); x.fillStyle = fg; x.fillRect((a + 0.095) * S, b * S, S * 0.012, S * 0.22); x.fillRect(a * S, (b + 0.105) * S, S * 0.2, S * 0.012); });
      x.fillStyle = f3; for (let i = 0; i < 10; i++) { x.beginPath(); x.moveTo(i * S / 10, 0); x.lineTo((i + 0.5) * S / 10, S * 0.07); x.lineTo((i + 1) * S / 10, 0); x.fill(); }
    },
    shingles: (x, [bg, fg]) => { x.strokeStyle = fg; x.lineWidth = S * 0.01; for (let r = 0; r < 8; r++) for (let c = -1; c < 9; c++) { const cx = (c + (r % 2) * 0.5) * S / 8, cy = r * S / 8; x.beginPath(); x.arc(cx + S / 16, cy, S / 16, 0, Math.PI); x.stroke(); } },
    planks: (x, [bg, fg]) => { x.fillStyle = fg; for (let r = 0; r < 8; r++) { x.fillRect(0, r * S / 8, S, S * 0.008); const off = (r % 2) * S / 4; for (let c = 0; c < 3; c++) { x.fillRect(off + c * S / 2, r * S / 8, S * 0.008, S / 8); x.beginPath(); x.arc(off + c * S / 2 + S * 0.03, r * S / 8 + S * 0.03, S * 0.006, 0, 7); x.fill(); } } },
    bricks: (x, [bg, fg]) => { x.fillStyle = fg; for (let r = 0; r < 12; r++) { x.fillRect(0, r * S / 12, S, S * 0.008); const off = (r % 2) * S / 8; for (let c = 0; c < 5; c++) x.fillRect(off + c * S / 4, r * S / 12, S * 0.008, S / 12); } },
    clockface: (x, [bg, fg, f2 = fg]) => { // disk kapağına: 12 çentik + rakam noktaları (ibreler ayrı, döner)
      x.strokeStyle = fg; x.lineCap = 'round';
      for (let k = 0; k < 60; k++) { const a = k / 60 * Math.PI * 2, r0 = k % 5 ? 0.43 : 0.38; x.lineWidth = S * (k % 5 ? 0.006 : 0.016); x.beginPath(); x.moveTo(S / 2 + Math.cos(a) * S * r0, S / 2 + Math.sin(a) * S * r0); x.lineTo(S / 2 + Math.cos(a) * S * 0.46, S / 2 + Math.sin(a) * S * 0.46); x.stroke(); }
      x.lineWidth = S * 0.012; x.beginPath(); x.arc(S / 2, S / 2, S * 0.485, 0, 7); x.stroke(); x.fillStyle = f2; x.beginPath(); x.arc(S / 2, S / 2, S * 0.03, 0, 7); x.fill();
    },
    glass: (x, [bg, fg]) => { x.fillStyle = fg; for (let i = 0; i <= 4; i++) { x.fillRect(i * S / 4 - S * 0.012, 0, S * 0.024, S); x.fillRect(0, i * S / 4 - S * 0.012, S, S * 0.024); } x.globalAlpha = 0.18; x.strokeStyle = fg; x.lineWidth = S * 0.01; for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) { x.beginPath(); x.moveTo(i * S / 4 + S * 0.05, j * S / 4 + S * 0.15); x.lineTo(i * S / 4 + S * 0.12, j * S / 4 + S * 0.06); x.stroke(); } x.globalAlpha = 1; },
    keys: (x, [bg, fg]) => { x.fillStyle = fg; for (let i = 0; i <= 14; i++) x.fillRect(i * S / 14, 0, S * 0.006, S); [0, 1, 3, 4, 5, 7, 8, 10, 11, 12].forEach((k) => x.fillRect((k + 0.65) * S / 14, 0, S / 14 * 0.6, S * 0.6)); },
    cobbles: (x, [bg, fg]) => { x.strokeStyle = fg; x.lineWidth = S * 0.008; for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { x.beginPath(); x.ellipse((c + (r % 2) * 0.5) * S / 8, (r + 0.5) * S / 8, S / 18, S / 22, rnd() * 0.4, 0, 7); x.stroke(); } },
    grass: (x, [bg, fg]) => { x.strokeStyle = fg; x.lineWidth = S * 0.006; x.lineCap = 'round'; for (let i = 0; i < 160; i++) { const px = rnd() * S, py = rnd() * S; x.beginPath(); x.moveTo(px, py); x.lineTo(px - S * 0.01, py - S * 0.025); x.moveTo(px, py); x.lineTo(px + S * 0.012, py - S * 0.022); x.stroke(); } },
    rock: (x, [bg, fg]) => { x.strokeStyle = fg; x.lineWidth = S * 0.008; for (let i = 0; i < 26; i++) { const px = rnd() * S, py = rnd() * S; x.beginPath(); x.moveTo(px, py); x.lineTo(px + (rnd() - 0.5) * S * 0.12, py + (rnd() - 0.5) * S * 0.06); x.lineTo(px + (rnd() - 0.5) * S * 0.12, py + (rnd() - 0.5) * S * 0.08); x.stroke(); } }
  });

  // ================= Kurucu =================
  function build(recipe, C, makeChar) {
    seed = [...recipe.id].reduce((a, c) => a + c.charCodeAt(0), 3);
    const col = (k) => C[k] || k;
    const cache = new Map();
    function mat(p = {}, emit = 0) {
      const key = JSON.stringify(p) + emit;
      if (cache.has(key)) return cache.get(key);
      const o = { gradientMap: LAMBERT };
      if (p.pattern) o.map = texFrom(patternCanvas(p.pattern, p.colors.map(col)), p.repeat || [1, 1]); else o.color = col(p.color || 'paper');
      if (emit) { o.emissive = new THREE.Color(col(p.color || 'paper')); o.emissiveIntensity = emit; if (p.pattern) o.emissiveMap = o.map; }
      // pencere deseni: yalnız camlar sıcak ışır (gece). Gündüz yoğunluk 0; ada-sahne applyLights gece açar
      if (p.pattern === 'window' && !emit) { o.emissive = new THREE.Color('#ffffff'); o.emissiveIntensity = 0; o.emissiveMap = texFrom(patternCanvas('window', ['#000000', '#000000', '#ffbf5e', '#000000']), p.repeat || [1, 1]); }
      const m = new THREE.MeshToonMaterial(o); if (p.pattern === 'window' && !emit) m.userData.window = true; cache.set(key, m); return m;
    }
    const anims = [], chars = [];
    const mesh = (geo, spec) => { const o = new THREE.Mesh(geo, mat(spec.paint, spec.emit)); o.castShadow = spec.shadow !== false; o.receiveShadow = true; return o; };
    function place(obj, spec) {
      const [x = 0, y = 0, z = 0] = spec.at || []; obj.position.set(x, y, z);
      if (spec.rot) obj.rotation.set(...spec.rot);
      if (spec.scale !== undefined) Array.isArray(spec.scale) ? obj.scale.set(...spec.scale) : obj.scale.setScalar(spec.scale);
      if (spec.anim) { const a = spec.anim, ax = a.axis || 'y', base = obj.rotation[ax], by = obj.position.y, ph = rnd() * 6;
        anims.push((t) => { if (a.spin) obj.rotation[ax] = base + t * a.spin; if (a.swing) obj.rotation[ax] = base + Math.sin(t * (a.speed || 2) + ph) * a.swing; if (a.bob) obj.position.y = by + Math.sin(t * (a.speed || 1.5) + ph) * a.bob; }); }
      return obj;
    }
    function node(spec) {
      const T = spec.type;
      let o;
      if (T === 'box') { const [w, h, d] = spec.size; o = mesh(new THREE.BoxGeometry(w, h, d), spec); }
      else if (T === 'cyl') o = mesh(new THREE.CylinderGeometry(spec.rTop ?? spec.r, spec.r, spec.h, spec.seg || SEG, 1, !!spec.open), spec);
      else if (T === 'cone') o = mesh(new THREE.ConeGeometry(spec.r, spec.h, spec.seg || SEG, 1, !!spec.open), spec);
      else if (T === 'sphere') o = mesh(new THREE.SphereGeometry(spec.r, spec.seg || 32, 20, 0, Math.PI * 2, 0, spec.half ? Math.PI / 2 : Math.PI), spec);
      else if (T === 'lathe') o = mesh(new THREE.LatheGeometry(spec.profile.map(([a, b]) => new THREE.Vector2(a, b)), spec.seg || SEG).rotateY(Math.PI), spec);
      else if (T === 'torus') o = mesh(new THREE.TorusGeometry(spec.r, spec.tube, 8, spec.seg || SEG, spec.arc || Math.PI * 2), spec);
      else if (T === 'plane') { o = mesh(new THREE.PlaneGeometry(spec.w, spec.d), spec); o.rotation.x = -Math.PI / 2; }
      else if (T === 'gable') { // beşik çatı: üçgen prizma, tabanı y = 0'da, sırt x boyunca
        const rr = spec.d / Math.sqrt(3), g = new THREE.CylinderGeometry(rr, rr, spec.w, 3, 1).rotateZ(Math.PI / 2).rotateX(-Math.PI / 2).translate(0, rr * 0.5, 0);
        g.scale(1, (spec.h || rr * 1.5) / (rr * 1.5), 1); o = mesh(g, spec);
      }
      else if (T === 'ring') { o = new THREE.Group(); for (let i = 0; i < spec.count; i++) { const a = (i / spec.count) * Math.PI * 2 + (spec.start || 0); const c = node(spec.part); c.position.x += Math.cos(a) * spec.radius; c.position.z += Math.sin(a) * spec.radius; if (spec.face) c.rotation.y = -a + Math.PI / 2; o.add(c); } }
      else if (T === 'row') { o = new THREE.Group(); const [dx, dy, dz] = spec.step; for (let i = 0; i < spec.count; i++) { const c = node(spec.part); c.position.x += dx * i; c.position.y += dy * i; c.position.z += dz * i; o.add(c); } }
      else if (T === 'grid') { o = new THREE.Group(); const [dx, dz] = spec.step; for (let i = 0; i < spec.nx; i++) for (let j = 0; j < spec.nz; j++) { const c = node(spec.part); c.position.x += (i - (spec.nx - 1) / 2) * dx; c.position.z += (j - (spec.nz - 1) / 2) * dz; o.add(c); } }
      else if (T === 'group') { o = new THREE.Group(); spec.parts.forEach((p) => o.add(node(p))); }
      else if (T === 'char') { const ch = makeChar(spec.id); chars.push(ch); o = new THREE.Group(); o.add(ch.root); }
      else { o = new THREE.Group(); }
      return place(o, spec);
    }
    const root = new THREE.Group();
    recipe.parts.forEach((p) => root.add(node(p)));
    return { root, anims, chars, footprint: recipe.footprint || 2.5, height: recipe.height || 3 };
  }

  return { build, PATTERNS };
}
