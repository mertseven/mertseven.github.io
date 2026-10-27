// Etkileşim Atlası, twenty ways to keep it a map (topo.html). Every one starts from the same
// thing: the 162 libraries where t-SNE put them, and a height field built from them (each
// library a soft hill, a popular one a little taller). Clusters become regions, crowds become
// mountains, the gaps between become sea. Only the way the land is drawn changes.

const D = await (await fetch("/preview/atlas-data.json", { cache: "no-cache" })).json();
const CATS = D.cats, CAT_KEYS = Object.keys(CATS);
const AR = D.aspect; // the live map is this many times wider than tall
const LIBS = D.libs.map((l, i) => ({ ...l, i, X: l.x * AR, Y: l.y, c: CAT_KEYS.indexOf(l.cat), r: Math.min(1, Math.log10(l.stars * 1000) / Math.log10(110000)), w: Math.min(1, (Math.log10(l.kb) - 0.6) / (Math.log10(8000) - 0.6)) }));
const RGB = CAT_KEYS.map((k) => hex(CATS[k].color));
function hex(h) { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const css = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const clamp = (v, a = 0, b = 1) => Math.max(a, Math.min(b, v));
function rng(seed) { return () => { seed |= 0; seed = (seed + 0x6d2b79f5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
const gauss = (r) => Math.sqrt(-2 * Math.log(r() + 1e-9)) * Math.cos(2 * Math.PI * r());

// ——— The height field ———
const X0 = -0.14, X1 = AR + 0.14, Y0 = -0.14, Y1 = 1.14;
export const ASPECT = (X1 - X0) / (Y1 - Y0);
const GW = 216, GH = Math.round(GW / ASPECT);
const H = new Float32Array(GW * GH), C = new Uint8Array(GW * GH), GXa = new Float32Array(GW * GH), GYa = new Float32Array(GW * GH);
{
  const S2 = 2 * 0.075 * 0.075, acc = new Float32Array(10);
  let max = 0;
  for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
    const X = X0 + (i / (GW - 1)) * (X1 - X0), Y = Y0 + (j / (GH - 1)) * (Y1 - Y0);
    acc.fill(0);
    let s = 0;
    for (const l of LIBS) { const d = (X - l.X) ** 2 + (Y - l.Y) ** 2; if (d > 0.1) continue; const v = Math.exp(-d / S2) * (0.55 + l.r * 0.9); s += v; acc[l.c] += v; }
    let best = 0; for (let k = 1; k < 10; k++) if (acc[k] > acc[best]) best = k;
    H[j * GW + i] = s; C[j * GW + i] = best; if (s > max) max = s;
  }
  for (let k = 0; k < H.length; k++) H[k] = Math.pow(H[k] / max, 0.85);
  for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
    const at = (a, b) => H[clamp(b, 0, GH - 1) * GW + clamp(a, 0, GW - 1)];
    GXa[j * GW + i] = (at(i + 1, j) - at(i - 1, j)) / 2;
    GYa[j * GW + i] = (at(i, j + 1) - at(i, j - 1)) / 2;
  }
}
// Bilinear height at grid coordinates; nearest cluster; height at data coordinates.
function hAt(gx, gy) {
  gx = clamp(gx, 0, GW - 1.001); gy = clamp(gy, 0, GH - 1.001);
  const i = gx | 0, j = gy | 0, fx = gx - i, fy = gy - j, k = j * GW + i;
  return (H[k] * (1 - fx) + H[k + 1] * fx) * (1 - fy) + (H[k + GW] * (1 - fx) + H[k + GW + 1] * fx) * fy;
}
const cAt = (gx, gy) => C[clamp(Math.round(gy), 0, GH - 1) * GW + clamp(Math.round(gx), 0, GW - 1)];
const gOf = (X, Y) => [((X - X0) / (X1 - X0)) * (GW - 1), ((Y - Y0) / (Y1 - Y0)) * (GH - 1)];
const hData = (X, Y) => { const [a, b] = gOf(X, Y); return hAt(a, b); };
const gradAt = (gx, gy) => { const k = clamp(Math.round(gy), 0, GH - 1) * GW + clamp(Math.round(gx), 0, GW - 1); return [GXa[k], GYa[k]]; };

// Contour lines by marching squares, in grid coordinates, cached per level.
const ISO = new Map();
function iso(L) {
  if (ISO.has(L)) return ISO.get(L);
  const out = [];
  for (let j = 0; j < GH - 1; j++) for (let i = 0; i < GW - 1; i++) {
    const a = H[j * GW + i], b = H[j * GW + i + 1], c = H[(j + 1) * GW + i + 1], d = H[(j + 1) * GW + i];
    const id = (a > L ? 8 : 0) | (b > L ? 4 : 0) | (c > L ? 2 : 0) | (d > L ? 1 : 0);
    if (id === 0 || id === 15) continue;
    const T = [i + (L - a) / (b - a), j], R = [i + 1, j + (L - b) / (c - b)], B = [i + (L - d) / (c - d), j + 1], Lf = [i, j + (L - a) / (d - a)];
    const add = (p, q) => out.push(p[0], p[1], q[0], q[1]);
    switch (id) {
      case 1: case 14: add(Lf, B); break;
      case 2: case 13: add(B, R); break;
      case 3: case 12: add(Lf, R); break;
      case 4: case 11: add(T, R); break;
      case 6: case 9: add(T, B); break;
      case 7: case 8: add(Lf, T); break;
      case 5: add(T, R); add(Lf, B); break;
      case 10: add(Lf, T); add(B, R); break;
    }
  }
  ISO.set(L, out);
  return out;
}

// ——— Drawing helpers ———
const sx = (X, W) => ((X - X0) / (X1 - X0)) * W, sy = (Y, Hh) => ((Y - Y0) / (Y1 - Y0)) * Hh;
const flat = (W, Hh) => LIBS.map((l) => [sx(l.X, W), sy(l.Y, Hh)]);
function strokeIso(ctx, L, W, Hh, style, width) {
  const s = iso(L), kx = W / (GW - 1), ky = Hh / (GH - 1);
  ctx.beginPath();
  for (let k = 0; k < s.length; k += 4) { ctx.moveTo(s[k] * kx, s[k + 1] * ky); ctx.lineTo(s[k + 2] * kx, s[k + 3] * ky); }
  ctx.strokeStyle = style; ctx.lineWidth = width; ctx.stroke();
}
// A raster at half resolution (or `scale`), cached: fn(h, cluster, gx, gy) -> [r, g, b].
const RASTERS = new Map();
function raster(ctx, key, W, Hh, fn, scale = 2) {
  const id = `${key}:${W | 0}x${Hh | 0}`;
  let off = RASTERS.get(id);
  if (!off) {
    const w = Math.ceil(W / scale), h = Math.ceil(Hh / scale);
    off = document.createElement("canvas"); off.width = w; off.height = h;
    const g = off.getContext("2d"), img = g.createImageData(w, h), d = img.data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const gx = ((x + 0.5) / w) * (GW - 1), gy = ((y + 0.5) / h) * (GH - 1);
      const c = fn(hAt(gx, gy), cAt(gx, gy), gx, gy, x, y), k = (y * w + x) * 4;
      d[k] = c[0]; d[k + 1] = c[1]; d[k + 2] = c[2]; d[k + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    RASTERS.set(id, off);
  }
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(off, 0, 0, W, Hh);
}
function bg(ctx, W, Hh, color) { ctx.fillStyle = color; ctx.fillRect(0, 0, W, Hh); }
function dots(ctx, P, { r = 1.6, fill = "#1f2a2e", live = null, ring = null } = {}) {
  P.forEach((p, i) => {
    if (!p) return;
    ctx.beginPath(); ctx.arc(p[0], p[1], LIBS[i].live && live ? r * 1.6 : r, 0, 7);
    ctx.fillStyle = LIBS[i].live && live ? live : fill; ctx.fill();
    if (ring) { ctx.strokeStyle = ring; ctx.lineWidth = 1; ctx.stroke(); }
  });
}
// A 3D view of the land: yaw turns it, pitch tips it from straight down (0) toward the horizon.
function camera(W, Hh, yaw, pitch, zoom = 1) {
  const cx = AR / 2, cy = 0.5, s = (W / 2.75) * zoom, cs = Math.cos(yaw), sn = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch);
  return (X, Y, Z) => {
    const x = X - cx, y = Y - cy, xr = x * cs - y * sn, yr = x * sn + y * cs;
    const depth = yr * sp + Z * cp, k = 3.4 / (3.4 - depth);
    return [W / 2 + xr * s * k, Hh * 0.56 + (yr * cp - Z * sp) * s * k, depth, k];
  };
}
function labels(ctx, P, { color = "#1f2a2e", font = "500 11px 'DM Sans', sans-serif", spacing = "0.22em", upper = true, halo = null } = {}) {
  ctx.save();
  ctx.font = font; ctx.textAlign = "center"; ctx.textBaseline = "middle";
  try { ctx.letterSpacing = spacing; } catch {}
  CAT_KEYS.forEach((k, c) => {
    const ps = P.filter((p, i) => p && LIBS[i].c === c);
    if (!ps.length) return;
    const x = ps.reduce((s, p) => s + p[0], 0) / ps.length, y = ps.reduce((s, p) => s + p[1], 0) / ps.length;
    const t = upper ? CATS[k].label.toLocaleUpperCase("tr") : CATS[k].label;
    if (halo) { ctx.strokeStyle = halo; ctx.lineWidth = 4; ctx.lineJoin = "round"; ctx.strokeText(t, x, y - 14); }
    ctx.fillStyle = color; ctx.fillText(t, x, y - 14);
  });
  ctx.restore();
}

// ——— Precomputed samples for the cloud, splat, stipple and flow views ———
const CLOUD = (() => {
  const r = rng(7), out = [];
  for (const l of LIBS) for (let k = 0; k < 44; k++) { const X = l.X + gauss(r) * 0.03, Y = l.Y + gauss(r) * 0.03; out.push([X, Y, hData(X, Y) * 0.32 + Math.abs(gauss(r)) * 0.025, l.c, 1]); }
  for (let k = 0; k < 4200; k++) { const X = X0 + r() * (X1 - X0), Y = Y0 + r() * (Y1 - Y0), h = hData(X, Y); if (h > 0.02 || r() < 0.25) out.push([X, Y, h * 0.32, cAt(...gOf(X, Y)), 0]); }
  return out;
})();
const STIPPLE = (() => {
  const r = rng(11), out = [];
  while (out.length < 9000) { const X = X0 + r() * (X1 - X0), Y = Y0 + r() * (Y1 - Y0), h = hData(X, Y); if (r() < Math.pow(h, 1.1)) out.push([X, Y, cAt(...gOf(X, Y))]); }
  return out;
})();
const SPLATS = (() => {
  const r = rng(5), out = [];
  for (const l of LIBS) {
    const ang = Math.atan2(l.v[3] + l.v[4] - l.v[0], l.v[1] + l.v[2] - l.v[9] + 0.01);
    for (let k = 0; k < 3; k++) out.push({ X: l.X + gauss(r) * 0.018, Y: l.Y + gauss(r) * 0.018, Z: hData(l.X, l.Y) * 0.3 + r() * 0.03, rx: 0.03 + l.w * 0.05, ry: 0.012 + (1 - l.w) * 0.02, a: ang + gauss(r) * 0.3, c: l.c, o: 0.22 + l.r * 0.25 });
  }
  for (let k = 0; k < 520; k++) { const X = X0 + r() * (X1 - X0), Y = Y0 + r() * (Y1 - Y0), h = hData(X, Y); if (h < 0.05) continue; out.push({ X, Y, Z: h * 0.3, rx: 0.06, ry: 0.04, a: r() * 3, c: cAt(...gOf(X, Y)), o: 0.06 }); }
  return out;
})();
// Each library's three nearest neighbours in the 13 axes, not on the map.
const EDGES = (() => {
  const seen = new Set(), out = [];
  LIBS.forEach((a) => {
    LIBS.map((b) => [b.i, b === a ? 1e9 : a.v.reduce((s, x, k) => s + (x - b.v[k]) ** 2, 0)]).sort((p, q) => p[1] - q[1]).slice(0, 3).forEach(([j]) => {
      const key = a.i < j ? `${a.i}-${j}` : `${j}-${a.i}`;
      if (!seen.has(key)) { seen.add(key); out.push([a.i, j]); }
    });
  });
  return out;
})();

// ——— The twenty ———
const PAPER = "#f3eee2", INK = "#2a2620";
const yearZ = (l) => ((l.year - 2006) / 17) * 0.42;

export const VARIANTS = [
  {
    id: "esyukselti", name: "Eş yükselti eğrileri", note: "Klasik topografik pafta: her 0,065 yükseltide bir eğri, her beşincisi kalın. Kalabalık kümeler sık eğrili tepeler.",
    draw(ctx, W, Hh) {
      bg(ctx, W, Hh, PAPER);
      for (let k = 1; k < 15; k++) strokeIso(ctx, k * 0.065, W, Hh, k % 5 === 0 ? "rgba(122,80,48,.85)" : "rgba(122,80,48,.45)", k % 5 === 0 ? 1.3 : 0.7);
      const P = flat(W, Hh); dots(ctx, P, { r: 1.4, fill: INK, live: INK }); return P;
    },
    ink: INK, halo: PAPER,
  },
  {
    id: "hipsometrik", name: "Hipsometrik renk", note: "Okul atlası: yükseklik basamaklarıyla yeşilden kahveye, zirvede beyaz; kümelerin arası deniz.",
    draw(ctx, W, Hh) {
      const stops = [[0, [196, 220, 226]], [0.05, [176, 205, 160]], [0.2, [214, 219, 160]], [0.35, [232, 212, 154]], [0.5, [217, 178, 135]], [0.68, [192, 143, 108]], [0.85, [233, 226, 220]], [1, [255, 255, 255]]];
      raster(ctx, "hipso", W, Hh, (h) => {
        if (h < 0.05) return mix([206, 226, 231], [178, 208, 218], h / 0.05);
        const q = Math.floor(h / 0.075) * 0.075;
        let k = 1; while (k < stops.length - 1 && stops[k + 1][0] < q) k++;
        const a = stops[k], b = stops[k + 1];
        return mix(a[1], b[1], clamp((q - a[0]) / (b[0] - a[0])));
      });
      for (let k = 1; k < 14; k++) strokeIso(ctx, 0.05 + k * 0.075, W, Hh, "rgba(80,60,40,.22)", 0.6);
      strokeIso(ctx, 0.05, W, Hh, "rgba(60,100,120,.6)", 0.9);
      const P = flat(W, Hh); dots(ctx, P, { r: 1.3, fill: "#3a2e24" }); return P;
    },
    ink: "#2d2a22", halo: "rgba(255,255,255,.7)",
  },
  {
    id: "kabartma", name: "Gölgeli kabartma", note: "Hillshade: kuzeybatıdan ışık. Arazinin biçimi gölgeyle okunuyor, kümenin rengi yalnız hafif bir tül.",
    draw(ctx, W, Hh) {
      const L = [-0.6, -0.6, 0.53];
      raster(ctx, "hill", W, Hh, (h, c, gx, gy) => {
        const [a, b] = gradAt(gx, gy), k = 22, n = [-a * k, -b * k, 1], m = Math.hypot(...n);
        const s = clamp((n[0] * L[0] + n[1] * L[1] + n[2] * L[2]) / m * 1.25);
        const base = h < 0.03 ? [236, 232, 222] : mix([236, 232, 222], RGB[c], 0.28);
        return base.map((v) => v * (0.55 + 0.45 * s));
      }, 1.5);
      const P = flat(W, Hh); dots(ctx, P, { r: 1.2, fill: "rgba(30,30,30,.7)" }); return P;
    },
    ink: "#1e1c19", halo: "rgba(240,236,226,.8)",
  },
  {
    id: "sirtlar", name: "Sırt çizgileri", note: "Unknown Pleasures gibi: kırk sekiz yatay çizgi arazinin üstünden geçerken kabarıyor. Önceki sırt arkadakini örtüyor.",
    draw(ctx, W, Hh) {
      bg(ctx, W, Hh, "#0c0c0c");
      const rows = 46, P = flat(W, Hh);
      for (let r = 0; r < rows; r++) {
        const gy = ((r + 1) / (rows + 1)) * (GH - 1), base = ((r + 1) / (rows + 1)) * Hh;
        ctx.beginPath(); ctx.moveTo(0, base);
        for (let x = 0; x <= W; x += 2) { const gx = (x / W) * (GW - 1); const h = hAt(gx, gy); ctx.lineTo(x, base - h * Hh * 0.2 - Math.sin(x * 0.21 + r) * h * 2.2); }
        ctx.lineTo(W, Hh); ctx.lineTo(0, Hh); ctx.closePath();
        ctx.fillStyle = "#0c0c0c"; ctx.fill(); ctx.strokeStyle = "rgba(240,240,235,.92)"; ctx.lineWidth = 1.1; ctx.stroke();
      }
      return P;
    },
    ink: "#f0f0eb", halo: "#0c0c0c",
  },
  {
    id: "telkafes", name: "Tel kafes arazi", note: "Arazi üç boyutlu bir ağ; tepeler kümenin renginde. Yavaşça dönüyor, sürükleyince sen döndürüyorsun.", anim: true, dark: true,
    draw(ctx, W, Hh, t) {
      bg(ctx, W, Hh, "#0b1220");
      const cam = camera(W, Hh, -0.55 + t * 0.12, 1.02), st = 3, paths = CAT_KEYS.map(() => new Path2D()), dim = new Path2D();
      const pt = (i, j) => { const X = X0 + (i / (GW - 1)) * (X1 - X0), Y = Y0 + (j / (GH - 1)) * (Y1 - Y0); return cam(X, Y, H[j * GW + i] * 0.34); };
      for (let j = 0; j < GH; j += st) for (let i = 0; i + st < GW; i += st) {
        const a = pt(i, j), b = pt(i + st, j), h = H[j * GW + i], p = h > 0.06 ? paths[C[j * GW + i]] : dim;
        p.moveTo(a[0], a[1]); p.lineTo(b[0], b[1]);
        if (j + st < GH) { const c = pt(i, j + st); p.moveTo(a[0], a[1]); p.lineTo(c[0], c[1]); }
      }
      ctx.lineWidth = 0.7; ctx.strokeStyle = "rgba(120,150,190,.18)"; ctx.stroke(dim);
      paths.forEach((p, k) => { ctx.strokeStyle = css(RGB[k], 0.7); ctx.stroke(p); });
      return LIBS.map((l) => { const p = cam(l.X, l.Y, hData(l.X, l.Y) * 0.34 + 0.01); ctx.fillStyle = "#fff"; ctx.fillRect(p[0] - 1, p[1] - 1, 2, 2); return p; });
    },
    ink: "#e9eef7", halo: "#0b1220",
  },
  {
    id: "bulut", name: "Nokta bulutu", note: "Lidar taraması gibi: her kütüphane 44 noktalık bir yığın, yerde seyrek bir zemin. Tepeler kalabalıktan doğuyor.", anim: true, dark: true,
    draw(ctx, W, Hh, t) {
      bg(ctx, W, Hh, "#050607");
      const cam = camera(W, Hh, -0.4 + t * 0.14, 1.05);
      ctx.globalCompositeOperation = "lighter";
      for (const p of CLOUD) {
        const q = cam(p[0], p[1], p[2]), s = (p[4] ? 1.5 : 1) * q[3];
        ctx.fillStyle = p[4] ? css(RGB[p[3]], 0.55) : css(mix(RGB[p[3]], [90, 100, 110], 0.6), 0.35);
        ctx.fillRect(q[0], q[1], s, s);
      }
      ctx.globalCompositeOperation = "source-over";
      return LIBS.map((l) => cam(l.X, l.Y, hData(l.X, l.Y) * 0.32 + 0.02));
    },
    ink: "#eef2f4", halo: "#050607",
  },
  {
    id: "splat", name: "Gauss lekeleri", note: "Gaussian splatting'in mantığı: her kütüphane yönü ve boyu verisinden gelen yumuşak, saydam elipsler. Üst üste binip ışık gibi toplanıyor.", anim: true, dark: true,
    draw(ctx, W, Hh, t) {
      bg(ctx, W, Hh, "#040506");
      const cam = camera(W, Hh, -0.3 + Math.sin(t * 0.25) * 0.5, 0.85 + Math.sin(t * 0.18) * 0.12), s = W / 2.75;
      ctx.globalCompositeOperation = "lighter";
      for (const sp of SPLATS) {
        const q = cam(sp.X, sp.Y, sp.Z), rx = sp.rx * s * q[3], ry = sp.ry * s * q[3];
        ctx.save(); ctx.translate(q[0], q[1]); ctx.rotate(sp.a); ctx.scale(1, ry / rx);
        const g = ctx.createRadialGradient(0, 0, 0, 0, 0, rx);
        g.addColorStop(0, css(RGB[sp.c], sp.o)); g.addColorStop(1, css(RGB[sp.c], 0));
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(0, 0, rx, 0, 7); ctx.fill(); ctx.restore();
      }
      ctx.globalCompositeOperation = "source-over";
      return LIBS.map((l) => cam(l.X, l.Y, hData(l.X, l.Y) * 0.3 + 0.015));
    },
    ink: "#f3f1ec", halo: "#040506",
  },
  {
    id: "tensor", name: "Tensör uzayı", note: "Üç eksenli bir kutu: zeminde t-SNE haritası ve eş yükselti eğrileri, dikeyde yıl. Her kütüphane zemine bir iple bağlı; eski kütüphaneler aşağıda.", anim: true,
    draw(ctx, W, Hh, t) {
      bg(ctx, W, Hh, "#f5f3ee");
      const cam = camera(W, Hh, -0.7 + t * 0.12, 1.08, 0.74);
      ctx.lineWidth = 0.7;
      for (const L of [0.12, 0.3, 0.5, 0.7]) {
        const s = iso(L); ctx.beginPath();
        for (let k = 0; k < s.length; k += 4) {
          const a = cam(X0 + (s[k] / (GW - 1)) * (X1 - X0), Y0 + (s[k + 1] / (GH - 1)) * (Y1 - Y0), 0), b = cam(X0 + (s[k + 2] / (GW - 1)) * (X1 - X0), Y0 + (s[k + 3] / (GH - 1)) * (Y1 - Y0), 0);
          ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
        }
        ctx.strokeStyle = "rgba(40,99,117,.35)"; ctx.stroke();
      }
      const box = [[X0, Y0], [X1, Y0], [X1, Y1], [X0, Y1]].map(([x, y]) => [cam(x, y, 0), cam(x, y, 0.42)]);
      ctx.strokeStyle = "rgba(20,38,45,.35)"; ctx.beginPath();
      box.forEach(([a, b], k) => { const n = box[(k + 1) % 4]; ctx.moveTo(a[0], a[1]); ctx.lineTo(n[0][0], n[0][1]); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.moveTo(b[0], b[1]); ctx.lineTo(n[1][0], n[1][1]); });
      ctx.stroke();
      ctx.font = "10px 'Geist Mono', monospace"; ctx.fillStyle = "rgba(20,38,45,.6)";
      [2006, 2012, 2018, 2023].forEach((y) => { const p = cam(X0, Y0, ((y - 2006) / 17) * 0.42); ctx.fillText(String(y), p[0] - 34, p[1] + 3); });
      const P = LIBS.map((l) => cam(l.X, l.Y, yearZ(l)));
      LIBS.map((l, i) => [i, P[i][2]]).sort((a, b) => a[1] - b[1]).forEach(([i]) => {
        const l = LIBS[i], p = P[i], f = cam(l.X, l.Y, 0);
        ctx.strokeStyle = css(RGB[l.c], 0.45); ctx.beginPath(); ctx.moveTo(f[0], f[1]); ctx.lineTo(p[0], p[1]); ctx.stroke();
        ctx.beginPath(); ctx.arc(p[0], p[1], (2 + l.r * 2.6) * p[3], 0, 7); ctx.fillStyle = css(RGB[l.c]); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.stroke();
      });
      return P;
    },
    ink: "#14262d", halo: "#f5f3ee",
  },
  {
    id: "ulkeler", name: "Siyasi harita", note: "Voronoi: her kütüphanenin bir toprağı, her kümenin bir ülkesi var. Ülke sınırları kalın, il sınırları ince, kıyıdan ötesi deniz.",
    draw(ctx, W, Hh) {
      const B = new Map(), bk = (X, Y) => `${Math.floor(X / 0.15)},${Math.floor(Y / 0.15)}`;
      LIBS.forEach((l) => { const k = bk(l.X, l.Y); if (!B.has(k)) B.set(k, []); B.get(k).push(l); });
      const w = Math.ceil(W / 1.5), h = Math.ceil(Hh / 1.5), near = new Int16Array(w * h).fill(-1);
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const X = X0 + ((x + 0.5) / w) * (X1 - X0), Y = Y0 + ((y + 0.5) / h) * (Y1 - Y0), bx = Math.floor(X / 0.15), by = Math.floor(Y / 0.15);
        let best = -1, bd = 0.0121;
        for (let a = -1; a <= 1; a++) for (let b = -1; b <= 1; b++) for (const l of B.get(`${bx + a},${by + b}`) || []) { const d = (X - l.X) ** 2 + (Y - l.Y) ** 2; if (d < bd) { bd = d; best = l.i; } }
        near[y * w + x] = best;
      }
      raster(ctx, "voronoi", W, Hh, (_h, _c, _gx, _gy, x, y) => {
        const n = near[y * w + x];
        if (n < 0) return [214, 226, 228];
        const r = near[y * w + Math.min(w - 1, x + 1)], d = near[Math.min(h - 1, y + 1) * w + x];
        const nc = LIBS[n].c;
        if ([r, d].some((m) => m < 0 || LIBS[m].c !== nc)) return [60, 56, 50];
        if (r !== n || d !== n) return mix(RGB[nc], [250, 248, 242], 0.35);
        return mix(RGB[nc], [250, 248, 242], 0.62);
      }, 1.5);
      const P = flat(W, Hh); dots(ctx, P, { r: 1.1, fill: "rgba(40,36,30,.75)" }); return P;
    },
    ink: "#26231e", halo: "rgba(250,248,242,.85)",
  },
  {
    id: "altigen", name: "Altıgen karolar", note: "Bir masa oyunu tahtası: arazi altıgenlere bölünmüş, her altıgen kümenin renginde, yükseldikçe koyulaşıyor.",
    draw(ctx, W, Hh) {
      bg(ctx, W, Hh, "#efeae0");
      const r = W / 120, dx = Math.sqrt(3) * r, dy = 1.5 * r;
      for (let row = 0, y = 0; y < Hh + r; row++, y += dy) for (let x = row % 2 ? dx / 2 : 0; x < W + dx; x += dx) {
        const gx = (x / W) * (GW - 1), gy = (y / Hh) * (GH - 1), h = hAt(gx, gy);
        ctx.beginPath();
        for (let k = 0; k < 6; k++) { const a = Math.PI / 6 + (k * Math.PI) / 3; ctx.lineTo(x + Math.cos(a) * r * 0.94, y + Math.sin(a) * r * 0.94); }
        ctx.closePath();
        if (h < 0.05) { ctx.strokeStyle = "rgba(60,90,100,.14)"; ctx.lineWidth = 0.7; ctx.stroke(); continue; }
        ctx.fillStyle = css(mix([248, 245, 238], RGB[cAt(gx, gy)], 0.25 + h * 0.75)); ctx.fill();
      }
      const P = flat(W, Hh); dots(ctx, P, { r: 1.2, fill: "rgba(20,20,20,.65)" }); return P;
    },
    ink: "#1d1b17", halo: "rgba(239,234,224,.85)",
  },
  {
    id: "voksel", name: "Voksel ada", note: "Minecraft adası: arazi bloklara basamaklanıyor, önden bakınca her sütunun yüksekliği okunuyor.",
    draw(ctx, W, Hh) {
      bg(ctx, W, Hh, "#dfe9ee");
      const NX = 86, NY = Math.round(NX / ASPECT), cw = W / NX, ch = (Hh * 0.8) / NY, step = Hh * 0.018, top = Hh * 0.14;
      for (let j = 0; j < NY; j++) for (let i = 0; i < NX; i++) {
        const gx = ((i + 0.5) / NX) * (GW - 1), gy = ((j + 0.5) / NY) * (GH - 1), h = hAt(gx, gy);
        if (h < 0.06) continue;
        const lv = 1 + Math.floor(h * 9), x = i * cw, y = top + j * ch - lv * step, c = RGB[cAt(gx, gy)];
        ctx.fillStyle = css(mix(c, [30, 30, 30], 0.35)); ctx.fillRect(x, y + ch, cw + 0.5, lv * step);
        ctx.fillStyle = css(mix(c, [255, 255, 255], 0.15 + (lv / 10) * 0.3)); ctx.fillRect(x, y, cw + 0.5, ch + 0.5);
        ctx.strokeStyle = "rgba(0,0,0,.12)"; ctx.lineWidth = 0.5; ctx.strokeRect(x, y, cw, ch);
      }
      return LIBS.map((l) => { const [gx, gy] = gOf(l.X, l.Y), lv = 1 + Math.floor(hAt(gx, gy) * 9); return [sx(l.X, W), top + (gy / (GH - 1)) * NY * ch - lv * step]; });
    },
    ink: "#1a2328", halo: "rgba(255,255,255,.75)",
  },
  {
    id: "akis", name: "Akış çizgileri", note: "Rüzgâr haritası: parçacıklar tepelerin etrafında eş yükselti boyunca dönüyor. Kümeler girdap gibi okunuyor.", anim: true, dark: true, trails: true,
    draw(ctx, W, Hh, t, S) {
      if (!S.parts || S.W !== W) {
        const r = rng(3); S.W = W; S.parts = [];
        while (S.parts.length < 1600) { const gx = r() * (GW - 1), gy = r() * (GH - 1); if (hAt(gx, gy) > 0.04) S.parts.push([gx, gy, r() * 80]); }
        bg(ctx, W, Hh, "#06090c"); S.warm = 90;
      }
      const kx = W / (GW - 1), ky = Hh / (GH - 1), rr = rng(9);
      const steps = S.warm ? S.warm : 1; S.warm = 0;
      for (let n = 0; n < steps; n++) {
        ctx.fillStyle = "rgba(6,9,12,.06)"; ctx.fillRect(0, 0, W, Hh);
        ctx.lineWidth = 1;
        for (const p of S.parts) {
          const [a, b] = gradAt(p[0], p[1]), m = Math.hypot(a, b) + 1e-6, vx = (-b / m) * 0.55 + (a / m) * 0.08, vy = (a / m) * 0.55 + (b / m) * 0.08;
          const x0 = p[0], y0 = p[1]; p[0] += vx; p[1] += vy; p[2]--;
          if (p[2] < 0 || hAt(p[0], p[1]) < 0.03) { do { p[0] = rr() * (GW - 1); p[1] = rr() * (GH - 1); } while (hAt(p[0], p[1]) < 0.04); p[2] = 40 + rr() * 60; continue; }
          ctx.strokeStyle = css(RGB[cAt(p[0], p[1])], 0.7); ctx.beginPath(); ctx.moveTo(x0 * kx, y0 * ky); ctx.lineTo(p[0] * kx, p[1] * ky); ctx.stroke();
        }
      }
      return flat(W, Hh);
    },
    ink: "#eef3f6", halo: "#06090c",
  },
  {
    id: "batimetri", name: "Batimetri", note: "Ters harita: kalabalık yerler derin çukur. Mavinin tonları derinlik, küçük sayılar iskandil; kıyının ötesi kara.",
    draw(ctx, W, Hh) {
      raster(ctx, "bati", W, Hh, (h) => {
        if (h < 0.035) return [236, 228, 208];
        const q = Math.floor(h / 0.09) * 0.09;
        return mix([206, 228, 234], [10, 42, 78], clamp(q / 0.9));
      });
      for (let k = 1; k < 11; k++) strokeIso(ctx, k * 0.09, W, Hh, "rgba(255,255,255,.35)", 0.6);
      strokeIso(ctx, 0.035, W, Hh, "rgba(70,60,40,.75)", 1);
      const r = rng(21), sp = W / 20;
      ctx.font = "8.5px 'Geist Mono', monospace"; ctx.textAlign = "center";
      for (let y = sp / 2; y < Hh; y += sp * 0.85) for (let x = sp / 2; x < W; x += sp) {
        const px = x + (r() - 0.5) * sp * 0.5, py = y + (r() - 0.5) * sp * 0.4, h = hAt((px / W) * (GW - 1), (py / Hh) * (GH - 1));
        if (h < 0.06) continue;
        ctx.fillStyle = h > 0.45 ? "rgba(255,255,255,.7)" : "rgba(10,42,78,.6)"; ctx.fillText(String(Math.round(h * 4200)), px, py);
      }
      const P = flat(W, Hh); return P;
    },
    ink: "#0b2a4a", halo: "rgba(230,240,244,.8)",
  },
  {
    id: "termal", name: "Termal kamera", note: "Isıl görüntü: yoğunluk sıcaklık. Kümelerin çekirdeği beyaza yakın, kenarları mor; arası soğuk karanlık.",
    draw(ctx, W, Hh) {
      const stops = [[0, [0, 0, 4]], [0.22, [66, 10, 104]], [0.45, [147, 38, 103]], [0.65, [221, 81, 58]], [0.82, [252, 165, 10]], [1, [252, 255, 164]]];
      raster(ctx, "termal", W, Hh, (h) => { let k = 0; while (k < stops.length - 2 && stops[k + 1][0] < h) k++; const a = stops[k], b = stops[k + 1]; return mix(a[1], b[1], clamp((h - a[0]) / (b[0] - a[0]))); });
      const g = ctx.createLinearGradient(0, Hh - 20, 0, 20);
      stops.forEach(([s, c]) => g.addColorStop(s, css(c)));
      ctx.fillStyle = g; ctx.fillRect(W - 18, 20, 6, Hh - 40);
      ctx.font = "9px 'Geist Mono', monospace"; ctx.fillStyle = "#ddd"; ctx.textAlign = "right"; ctx.fillText("162", W - 24, 28); ctx.fillText("0", W - 24, Hh - 20);
      return flat(W, Hh);
    },
    ink: "#fff8e0", halo: "rgba(0,0,0,.6)",
  },
  {
    id: "tarama", name: "Gravür taraması", note: "On dokuzuncu yüzyıl haritası: yamaçlar eğim yönünde kısa çizgilerle taranmış, dik yer koyu. Kıyı çift çizgi.",
    draw(ctx, W, Hh) {
      bg(ctx, W, Hh, "#f1e9d6");
      const r = rng(17), sp = Math.max(3.2, W / 260);
      ctx.strokeStyle = "rgba(70,52,34,.85)"; ctx.lineCap = "round";
      for (let y = 0; y < Hh; y += sp) for (let x = 0; x < W; x += sp) {
        const px = x + (r() - 0.5) * sp, py = y + (r() - 0.5) * sp, gx = (px / W) * (GW - 1), gy = (py / Hh) * (GH - 1);
        if (hAt(gx, gy) < 0.035) continue;
        const [a, b] = gradAt(gx, gy), m = Math.hypot(a, b) * GW;
        if (m < 0.6 && r() > 0.25) continue;
        const len = clamp(m * 0.9, 1.2, sp * 2.1), ux = a / (Math.hypot(a, b) + 1e-9), uy = b / (Math.hypot(a, b) + 1e-9);
        ctx.lineWidth = clamp(0.25 + m * 0.06, 0.25, 1.2);
        ctx.beginPath(); ctx.moveTo(px - ux * len / 2, py - uy * len / 2); ctx.lineTo(px + ux * len / 2, py + uy * len / 2); ctx.stroke();
      }
      strokeIso(ctx, 0.035, W, Hh, "rgba(50,38,26,.9)", 1.1);
      strokeIso(ctx, 0.022, W, Hh, "rgba(50,38,26,.4)", 0.6);
      const P = flat(W, Hh); return P;
    },
    ink: "#3b2c1e", halo: "#f1e9d6", font: "italic 400 12px 'DM Sans', sans-serif", upper: false,
  },
  {
    id: "noktalama", name: "Nokta yoğunluğu", note: "Nüfus haritası: dokuz bin nokta, yoğunluğa göre serpiştirilmiş, her biri en yakın kümenin renginde.",
    draw(ctx, W, Hh) {
      bg(ctx, W, Hh, "#fcfbf8");
      const s = Math.max(0.7, W / 1300);
      for (const p of STIPPLE) { ctx.fillStyle = css(RGB[p[2]], 0.85); ctx.beginPath(); ctx.arc(sx(p[0], W), sy(p[1], Hh), s, 0, 7); ctx.fill(); }
      return flat(W, Hh);
    },
    ink: "#1b1b1b", halo: "rgba(252,251,248,.85)",
  },
  {
    id: "komsuluk", name: "Komşuluk ağı", note: "Haritanın altındaki iskelet: her kütüphane 13 eksende en çok benzediği üçüne bağlı. Kısa çizgiler t-SNE'nin tuttuğu, uzun çizgiler kaçırdığı yakınlıklar.",
    draw(ctx, W, Hh) {
      bg(ctx, W, Hh, "#f6f4ef");
      for (const L of [0.08, 0.25, 0.45]) strokeIso(ctx, L, W, Hh, "rgba(40,99,117,.16)", 0.8);
      const P = flat(W, Hh);
      for (const [a, b] of EDGES) {
        const A = P[a], B = P[b], same = LIBS[a].c === LIBS[b].c, mx = (A[0] + B[0]) / 2, my = (A[1] + B[1]) / 2 - Math.hypot(B[0] - A[0], B[1] - A[1]) * 0.18;
        ctx.strokeStyle = same ? css(RGB[LIBS[a].c], 0.75) : "rgba(30,30,30,.22)"; ctx.lineWidth = same ? 1.1 : 0.7;
        ctx.beginPath(); ctx.moveTo(A[0], A[1]); ctx.quadraticCurveTo(mx, my, B[0], B[1]); ctx.stroke();
      }
      P.forEach((p, i) => { ctx.beginPath(); ctx.arc(p[0], p[1], 1.8 + LIBS[i].r * 2.4, 0, 7); ctx.fillStyle = css(RGB[LIBS[i].c]); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 1; ctx.stroke(); });
      return P;
    },
    ink: "#1a1a1a", halo: "rgba(246,244,239,.85)",
  },
  {
    id: "kabartmakagit", name: "Kabartma kâğıt", note: "Kör baskı: renksiz, mürekkepsiz. Arazi kâğıttan kabartılmış gibi, yalnız ışık ve gölge; kümelerin adı kâğıda gömülü.",
    draw(ctx, W, Hh) {
      const L = [-0.5, -0.7, 0.5];
      raster(ctx, "emboss", W, Hh, (h, c, gx, gy) => {
        const [a, b] = gradAt(gx, gy), k = 9, n = [-a * k, -b * k, 1], m = Math.hypot(...n);
        const s = (n[0] * L[0] + n[1] * L[1] + n[2] * L[2]) / m, v = clamp(238 + (s - 0.5) * 120 + h * 6, 196, 255);
        return [v, v - 2, v - 7];
      }, 1.25);
      return flat(W, Hh);
    },
    ink: "rgba(120,114,104,.75)", halo: "rgba(255,255,255,.9)",
  },
  {
    id: "takimada", name: "Takımada", note: "Eski deniz haritası: kümeler adalar, kıyının çevresinde açılan dalga çizgileri, iç kısımda ince yükselti eğrileri.",
    draw(ctx, W, Hh) {
      raster(ctx, "ada", W, Hh, (h, c) => (h < 0.12 ? [222, 232, 228] : mix([244, 236, 216], RGB[c], 0.16)));
      [[0.1, 0.55], [0.08, 0.45], [0.06, 0.35], [0.045, 0.26], [0.032, 0.18], [0.022, 0.12]].forEach(([L, a]) => strokeIso(ctx, L, W, Hh, `rgba(60,110,124,${a})`, 0.8));
      for (const L of [0.3, 0.5, 0.7]) strokeIso(ctx, L, W, Hh, "rgba(110,80,50,.35)", 0.6);
      strokeIso(ctx, 0.12, W, Hh, "rgba(50,44,36,.9)", 1.2);
      const P = flat(W, Hh); dots(ctx, P, { r: 1.2, fill: "rgba(50,44,36,.8)" }); return P;
    },
    ink: "#2e2820", halo: "rgba(244,236,216,.85)", font: "italic 500 12px 'DM Sans', sans-serif", upper: false,
  },
  {
    id: "dikenler", name: "Yükselti çubukları", note: "Spike map: düz bir zeminden her kütüphane için bir diken yükseliyor, boyu GitHub ilgisi. Arazi zeminde gölge gibi kalıyor.", anim: true,
    draw(ctx, W, Hh, t) {
      bg(ctx, W, Hh, "#efebe3");
      const cam = camera(W, Hh, -0.45 + Math.sin(t * 0.2) * 0.35, 1.12, 0.8);
      ctx.lineWidth = 0.7;
      for (const L of [0.08, 0.25, 0.45, 0.65]) {
        const s = iso(L); ctx.beginPath();
        for (let k = 0; k < s.length; k += 4) {
          const a = cam(X0 + (s[k] / (GW - 1)) * (X1 - X0), Y0 + (s[k + 1] / (GH - 1)) * (Y1 - Y0), 0), b = cam(X0 + (s[k + 2] / (GW - 1)) * (X1 - X0), Y0 + (s[k + 3] / (GH - 1)) * (Y1 - Y0), 0);
          ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]);
        }
        ctx.strokeStyle = "rgba(60,50,40,.22)"; ctx.stroke();
      }
      const P = LIBS.map((l) => cam(l.X, l.Y, 0.02 + l.r * l.r * 0.34));
      LIBS.map((l, i) => [i, P[i][2]]).sort((a, b) => a[1] - b[1]).forEach(([i]) => {
        const l = LIBS[i], tip = P[i], b = cam(l.X, l.Y, 0), w = 3.2 * b[3];
        ctx.beginPath(); ctx.moveTo(b[0] - w, b[1]); ctx.lineTo(tip[0], tip[1]); ctx.lineTo(b[0] + w, b[1]); ctx.closePath();
        ctx.fillStyle = css(RGB[l.c], 0.85); ctx.fill(); ctx.strokeStyle = css(mix(RGB[l.c], [0, 0, 0], 0.35), 0.8); ctx.lineWidth = 0.6; ctx.stroke();
      });
      return P;
    },
    ink: "#221d17", halo: "#efebe3",
  },
];
export const ALL = { LIBS, CATS, labels };
