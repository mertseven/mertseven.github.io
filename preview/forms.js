// The point cloud out of its box (forms.html): twenty shapes the same data can take. Every
// library still carries the same three things, its place on the t-SNE map (u, v), its year
// (a) and its cluster (c); each form decides what those become in space. Drawn in one
// plain style so only the shape differs.

import { K, ASPECT } from "./topo.js";
export { ASPECT };

const { LIBS, CATS, CAT_KEYS, RGB, AR, hData, css, mix, labels } = { ...K, AR: K.X1 - K.X0 - 0.28 };
const BG = "#f5f3ee", GUIDE = "rgba(40,99,117,.32)", GUIDE2 = "rgba(40,99,117,.14)", INK = "#14262d";
const L = LIBS.map((l) => ({ l, u: l.x, v: l.y, a: (l.year - 2006) / 17, c: l.c, h: hData(l.X, l.Y) }));
const TAU = Math.PI * 2;
const CENT = CAT_KEYS.map((_, c) => { const g = L.filter((p) => p.c === c); return { u: g.reduce((s, p) => s + p.u, 0) / g.length, v: g.reduce((s, p) => s + p.v, 0) / g.length, a: g.reduce((s, p) => s + p.a, 0) / g.length }; });

// ——— A camera around a y-up world ———
function cam(W, H, t, { yaw = 0.5, spin = 0.15, pitch = 0.38, zoom = 1, cy = 0 } = {}) {
  const y0 = yaw + t * spin, cs = Math.cos(y0), sn = Math.sin(y0), cp = Math.cos(pitch), sp = Math.sin(pitch), s = Math.min(W / 3.1, H / 2.3) * zoom;
  const f = (x, y, z) => {
    const xr = x * cs + z * sn, zr = -x * sn + z * cs, yy = y - cy, y2 = yy * cp - zr * sp, z2 = yy * sp + zr * cp, k = 3.4 / (3.4 - z2);
    return [W / 2 + xr * s * k, H / 2 - y2 * s * k, z2, k];
  };
  f.s = s; // units to pixels, so dots can size with the view
  return f;
}
function bg(ctx, W, H) { ctx.fillStyle = BG; ctx.fillRect(0, 0, W, H); }
function poly(ctx, P, pts, style, width = 0.8, close = false) {
  ctx.beginPath(); pts.forEach((p, k) => { const q = P(...p); k ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]); }); if (close) ctx.closePath();
  ctx.strokeStyle = style; ctx.lineWidth = width; ctx.stroke();
}
const ring = (r, y, n = 64, f = (x) => x) => Array.from({ length: n + 1 }, (_, k) => { const t = (k / n) * TAU; return f([Math.cos(t) * r, y, Math.sin(t) * r]); });
// Points, far first; optional stems to an anchor; returns the projected list for the pointer.
function dots(ctx, P, pos, { stem = null, size = 2.2 } = {}) {
  const ds = Math.max(0.55, Math.min(1.6, P.s / 180));
  const pr = L.map((p, i) => { const w = pos(p, i); return { p, w, q: P(...w), s: stem ? P(...stem(p, w)) : null }; });
  [...pr].sort((a, b) => a.q[2] - b.q[2]).forEach(({ p, q, s }) => {
    if (s) { ctx.strokeStyle = css(RGB[p.c], 0.4); ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(s[0], s[1]); ctx.lineTo(q[0], q[1]); ctx.stroke(); }
    ctx.beginPath(); ctx.arc(q[0], q[1], (size + p.l.r * 2.2) * q[3] * ds, 0, 7); ctx.fillStyle = css(RGB[p.c]); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.lineWidth = 0.8; ctx.stroke();
  });
  return pr.map((x) => x.q);
}
const flatX = (u) => (u - 0.5) * 2.4, flatZ = (v) => (v - 0.5) * 1.1;
function hull(pts) {
  const p = [...pts].sort((a, b) => a[0] - b[0] || a[1] - b[1]), cr = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lo = [], up = [];
  for (const q of p) { while (lo.length > 1 && cr(lo[lo.length - 2], lo[lo.length - 1], q) <= 0) lo.pop(); lo.push(q); }
  for (const q of p.reverse()) { while (up.length > 1 && cr(up[up.length - 2], up[up.length - 1], q) <= 0) up.pop(); up.push(q); }
  return lo.slice(0, -1).concat(up.slice(0, -1));
}

export const VARIANTS = [
  {
    id: "serbest", name: "Kapsız bulut", note: "Hiç kap yok: bulut havada asılı, altında yalnız gölgesi. Kutunun çizgileri gidince veri öne çıkıyor; ölçek yerdeki gölgeden okunuyor.", anim: true,
    draw(ctx, W, H, t) {
      bg(ctx, W, H); const P = cam(W, H, t);
      for (const p of L) { const q = P(flatX(p.u), -0.55, flatZ(p.v)); ctx.fillStyle = "rgba(20,38,45,.12)"; ctx.beginPath(); ctx.ellipse(q[0], q[1], 3.2 * q[3], 1.3 * q[3], 0, 0, 7); ctx.fill(); }
      return dots(ctx, P, (p) => [flatX(p.u), p.a * 0.9 - 0.4, flatZ(p.v)]);
    },
  },
  {
    id: "kure", name: "Küre", note: "Harita bir yerküreye sarılıyor: t-SNE'nin yatayı boylam, dikeyi enlem. Yıl yarıçap: eski kütüphaneler çekirdeğe yakın, yeniler kabukta.", anim: true,
    draw(ctx, W, H, t) {
      bg(ctx, W, H); const P = cam(W, H, t, { zoom: 1.0, pitch: 0.3 });
      for (let k = -3; k <= 3; k++) { const la = (k / 4) * (Math.PI / 2); poly(ctx, P, ring(Math.cos(la), Math.sin(la)), GUIDE2); }
      for (let k = 0; k < 12; k++) { const lo = (k / 12) * TAU; poly(ctx, P, Array.from({ length: 33 }, (_, j) => { const la = -Math.PI / 2 + (j / 32) * Math.PI; return [Math.cos(la) * Math.cos(lo), Math.sin(la), Math.cos(la) * Math.sin(lo)]; }), GUIDE2); }
      poly(ctx, P, ring(0.42, 0), GUIDE, 1);
      return dots(ctx, P, (p) => { const lo = p.u * TAU, la = (p.v - 0.5) * Math.PI * 0.85, r = 0.42 + p.a * 0.58; return [Math.cos(la) * Math.cos(lo) * r, -Math.sin(la) * r, Math.cos(la) * Math.sin(lo) * r]; });
    },
  },
  {
    id: "silindir", name: "Silindir", note: "Harita bir silindirin çevresine sarılmış: yatay eksen silindirin etrafını dönüyor, dikey eksen merkezden uzaklık. Yükseklik yıl; zaman bir kule gibi yükseliyor.", anim: true,
    draw(ctx, W, H, t) {
      bg(ctx, W, H); const P = cam(W, H, t, { zoom: 0.92, pitch: 0.45 });
      poly(ctx, P, ring(1, -0.8), GUIDE, 1); poly(ctx, P, ring(1, 0.8), GUIDE, 1); poly(ctx, P, ring(0.35, -0.8), GUIDE2);
      for (let k = 0; k < 8; k++) { const a = (k / 8) * TAU; poly(ctx, P, [[Math.cos(a), -0.8, Math.sin(a)], [Math.cos(a), 0.8, Math.sin(a)]], GUIDE2); }
      return dots(ctx, P, (p) => { const th = p.u * TAU, r = 0.35 + p.v * 0.65; return [Math.cos(th) * r, p.a * 1.6 - 0.8, Math.sin(th) * r]; }, { stem: (p, w) => [w[0], -0.8, w[2]] });
    },
  },
  {
    id: "simit", name: "Simit (tor)", note: "Harita iki yönde de sarılıyor ve bir simit oluyor: yatay eksen halkanın çevresi, dikey eksen borunun çevresi. Yıl borunun kalınlığı: yeniler dış yüzeyde.", anim: true,
    draw(ctx, W, H, t) {
      bg(ctx, W, H); const P = cam(W, H, t, { zoom: 1.05, pitch: 0.65 });
      for (let k = 0; k < 16; k++) { const th = (k / 16) * TAU; poly(ctx, P, Array.from({ length: 25 }, (_, j) => { const ph = (j / 24) * TAU, r = 1 + Math.cos(ph) * 0.42; return [Math.cos(th) * r, Math.sin(ph) * 0.42, Math.sin(th) * r]; }), GUIDE2); }
      poly(ctx, P, ring(1.42, 0, 96), GUIDE2); poly(ctx, P, ring(0.58, 0, 96), GUIDE2);
      return dots(ctx, P, (p) => { const th = p.u * TAU, ph = p.v * TAU, tr = 0.12 + p.a * 0.3, r = 1 + Math.cos(ph) * tr; return [Math.cos(th) * r, Math.sin(ph) * tr, Math.sin(th) * r]; });
    },
  },
  {
    id: "sarmal", name: "Zaman sarmalı", note: "Yıllar bir yay gibi kıvrılıyor: 2006 altta, 2023 tepede, her tur dört yıl. Kütüphane sarmalın üstünde, t-SNE'deki yeri onu yayın içine ya da dışına itiyor.", anim: true,
    draw(ctx, W, H, t) {
      bg(ctx, W, H); const P = cam(W, H, t, { zoom: 1.15, pitch: 0.3 });
      const at = (a, dr = 0, dy = 0) => { const th = a * 4.25 * TAU; return [Math.cos(th) * (0.75 + dr), a * 1.7 - 0.85 + dy, Math.sin(th) * (0.75 + dr)]; };
      poly(ctx, P, Array.from({ length: 300 }, (_, k) => at(k / 299)), GUIDE, 1.2);
      ctx.font = "10px 'Geist Mono', monospace"; ctx.fillStyle = "rgba(20,38,45,.55)";
      [2006, 2010, 2014, 2018, 2022].forEach((y) => { const q = P(...at((y - 2006) / 17, 0.32)); ctx.fillText(String(y), q[0], q[1]); });
      return dots(ctx, P, (p) => at(p.a + (p.v - 0.5) * 0.02, (p.u - 0.5) * 0.6, (p.v - 0.5) * 0.12), { stem: (p) => at(p.a) });
    },
  },
  {
    id: "ada", name: "Yüzen ada", note: "Kutu yerine arazinin kendisi: kümelerin yoğunluğundan bir ada kabarıyor ve havada asılı duruyor, kıyısından toprak sarkıyor. Kütüphaneler tepelerin üstünde, yeniler biraz daha yüksekte.", anim: true,
    draw(ctx, W, H, t) {
      bg(ctx, W, H); const P = cam(W, H, t, { pitch: 0.55, zoom: 1.05 });
      const hx = (x, z) => hData(((x / 2.4 + 0.5) * (K.X1 - K.X0 - 0.28)) + 0, (z / 1.1 + 0.5));
      const N = 46, M = 22;
      for (let j = 0; j <= M; j++) { const z = -0.55 + (j / M) * 1.1; let run = []; for (let i = 0; i <= N; i++) { const x = -1.2 + (i / N) * 2.4, h = hx(x, z); if (h > 0.06) run.push([x, h * 0.45 - 0.2, z]); else { if (run.length > 1) poly(ctx, P, run, GUIDE2); run = []; } } if (run.length > 1) poly(ctx, P, run, GUIDE2); }
      for (let i = 0; i <= N; i++) { const x = -1.2 + (i / N) * 2.4; let run = []; for (let j = 0; j <= M; j++) { const z = -0.55 + (j / M) * 1.1, h = hx(x, z); if (h > 0.06) run.push([x, h * 0.45 - 0.2, z]); else { if (run.length > 1) poly(ctx, P, run, GUIDE2); run = []; } } if (run.length > 1) poly(ctx, P, run, GUIDE2); }
      for (let i = 0; i <= N * 2; i++) for (let j = 0; j <= M * 2; j++) {
        const x = -1.2 + (i / (N * 2)) * 2.4, z = -0.55 + (j / (M * 2)) * 1.1;
        if (hx(x, z) > 0.06 && (hx(x + 0.06, z) <= 0.06 || hx(x - 0.06, z) <= 0.06 || hx(x, z + 0.06) <= 0.06 || hx(x, z - 0.06) <= 0.06) && (i + j) % 3 === 0) poly(ctx, P, [[x, -0.17, z], [x, -0.42 - ((i * 7 + j * 3) % 5) * 0.03, z]], "rgba(120,90,60,.35)", 0.8);
      }
      return dots(ctx, P, (p) => [flatX(p.u), p.h * 0.45 - 0.2 + 0.03 + p.a * 0.18, flatZ(p.v)], { stem: (p) => [flatX(p.u), p.h * 0.45 - 0.2, flatZ(p.v)] });
    },
  },
  {
    id: "plakalar", name: "Cam plakalar", note: "Zaman dört cam katmana dilimleniyor: 2006–09, 2010–13, 2014–17, 2018–23. Her plaka o dönemin haritası; üst üste bakınca hangi kümenin ne zaman büyüdüğü görünüyor.", anim: true,
    draw(ctx, W, H, t) {
      bg(ctx, W, H); const P = cam(W, H, t, { pitch: 0.5 });
      const bins = [[2006, 2009], [2010, 2013], [2014, 2017], [2018, 2023]], yOf = (k) => -0.6 + k * 0.4;
      bins.forEach(([a, b], k) => {
        const y = yOf(k), c = [[-1.3, y, -0.62], [1.3, y, -0.62], [1.3, y, 0.62], [-1.3, y, 0.62]].map((p) => P(...p));
        ctx.beginPath(); c.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath(); ctx.fillStyle = "rgba(160,200,212,.13)"; ctx.fill(); ctx.strokeStyle = GUIDE; ctx.lineWidth = 1; ctx.stroke();
        ctx.font = "10px 'Geist Mono', monospace"; ctx.fillStyle = "rgba(20,38,45,.6)"; ctx.fillText(`${a}–${String(b).slice(2)}`, c[0][0] - 58, c[0][1] + 3);
      });
      return dots(ctx, P, (p) => { const k = Math.min(3, Math.floor((p.l.year - 2006) / 4)); return [flatX(p.u), yOf(k) + 0.015, flatZ(p.v)]; });
    },
  },
  {
    id: "huni", name: "Zaman hunisi", note: "Geçmiş dar bir uçta, bugün geniş ağızda: harita yıllar ilerledikçe açılan bir huninin içinde. Alan çoğaldıkça kütüphaneler yayılıyor.", anim: true,
    draw(ctx, W, H, t) {
      bg(ctx, W, H); const P = cam(W, H, t, { pitch: 0.42, zoom: 1.1 });
      const rad = (a) => 0.18 + a * 0.95;
      [0, 0.25, 0.5, 0.75, 1].forEach((a) => poly(ctx, P, ring(rad(a), a * 1.6 - 0.8, 64, ([x, y, z]) => [x * 1.3, y, z * 0.75]), a === 1 ? GUIDE : GUIDE2, a === 1 ? 1 : 0.8));
      for (let k = 0; k < 10; k++) { const th = (k / 10) * TAU; poly(ctx, P, [[Math.cos(th) * rad(0) * 1.3, -0.8, Math.sin(th) * rad(0) * 0.75], [Math.cos(th) * rad(1) * 1.3, 0.8, Math.sin(th) * rad(1) * 0.75]], GUIDE2); }
      return dots(ctx, P, (p) => { const r = rad(p.a); return [(p.u - 0.5) * 2 * r * 1.3, p.a * 1.6 - 0.8, (p.v - 0.5) * 2 * r * 0.75]; });
    },
  },
  {
    id: "agac", name: "Ağaç", note: "Bir gövde, on dal: her küme gövdeden kendi yönüne uzanan bir dal, kütüphaneler yaprak. Yaprağın yüksekliği yıl; genç kütüphaneler tepede.", anim: true,
    draw(ctx, W, H, t) {
      bg(ctx, W, H); const P = cam(W, H, t, { pitch: 0.2, zoom: 1.05, cy: 0.05 });
      poly(ctx, P, [[0, -0.95, 0], [0, -0.35, 0]], "rgba(110,80,50,.7)", 4);
      const tip = CENT.map((m, c) => { const th = (c / 10) * TAU; return [Math.cos(th) * 0.75, -0.05 + m.a * 0.3, Math.sin(th) * 0.75]; });
      tip.forEach((q, c) => { poly(ctx, P, [[0, -0.35, 0], [q[0] * 0.5, q[1] - 0.1, q[2] * 0.5], q], css(mix(RGB[c], [110, 80, 50], 0.6), 0.7), 2); });
      return dots(ctx, P, (p) => { const q = tip[p.c], m = CENT[p.c]; return [q[0] + (p.u - m.u) * 1.6, -0.2 + p.a * 1.05, q[2] + (p.v - m.v) * 1.2]; }, { stem: (p) => tip[p.c], size: 2 });
    },
  },
  {
    id: "prizma", name: "Küme prizmaları", note: "Her küme kendi cam prizması: tabanı kümenin haritadaki sınırı, yüksekliği ilk ve son kütüphanesinin yılı. Kısa prizma genç bir alan, uzun prizma köklü.", anim: true,
    draw(ctx, W, H, t) {
      bg(ctx, W, H); const P = cam(W, H, t, { pitch: 0.48 });
      const yA = (a) => a * 1.4 - 0.7;
      const pr = CAT_KEYS.map((_, c) => { const g = L.filter((p) => p.c === c); return { c, h: hull(g.map((p) => [flatX(p.u), flatZ(p.v)])), y0: yA(Math.min(...g.map((p) => p.a))), y1: yA(Math.max(...g.map((p) => p.a))) }; });
      pr.forEach(({ c, h, y0, y1 }) => {
        const top = h.map(([x, z]) => P(x, y1, z));
        ctx.beginPath(); top.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath(); ctx.fillStyle = css(RGB[c], 0.12); ctx.fill();
        poly(ctx, P, h.map(([x, z]) => [x, y1, z]), css(RGB[c], 0.6), 1, true); poly(ctx, P, h.map(([x, z]) => [x, y0, z]), css(RGB[c], 0.35), 0.8, true);
        h.forEach(([x, z]) => poly(ctx, P, [[x, y0, z], [x, y1, z]], css(RGB[c], 0.25), 0.7));
      });
      return dots(ctx, P, (p) => [flatX(p.u), yA(p.a), flatZ(p.v)], { size: 1.6 });
    },
  },
  {
    id: "kabarcik", name: "Kabarcıklar", note: "Her küme saydam bir kabarcık: merkezi kümenin haritadaki ve zamandaki ortası, büyüklüğü dağınıklığı. Kütüphaneler kabarcığın içinde yüzüyor.", anim: true,
    draw(ctx, W, H, t) {
      bg(ctx, W, H); const P = cam(W, H, t, { pitch: 0.35 });
      const pos = (p) => [flatX(p.u), p.a * 1.2 - 0.6, flatZ(p.v)];
      const bub = CAT_KEYS.map((_, c) => { const g = L.filter((p) => p.c === c).map(pos), m = [0, 1, 2].map((k) => g.reduce((s, w) => s + w[k], 0) / g.length); return { c, m, r: Math.sqrt(g.reduce((s, w) => s + (w[0] - m[0]) ** 2 + (w[1] - m[1]) ** 2 + (w[2] - m[2]) ** 2, 0) / g.length) * 1.35 + 0.04 }; });
      bub.map((b) => ({ ...b, q: P(...b.m) })).sort((a, b) => a.q[2] - b.q[2]).forEach(({ c, q, r }) => {
        const R = r * P.s * q[3], g = ctx.createRadialGradient(q[0] - R * 0.35, q[1] - R * 0.35, R * 0.05, q[0], q[1], R);
        g.addColorStop(0, "rgba(255,255,255,.5)"); g.addColorStop(0.7, css(RGB[c], 0.08)); g.addColorStop(1, css(RGB[c], 0.22));
        ctx.beginPath(); ctx.arc(q[0], q[1], R, 0, 7); ctx.fillStyle = g; ctx.fill(); ctx.strokeStyle = css(RGB[c], 0.45); ctx.lineWidth = 1; ctx.stroke();
      });
      return dots(ctx, P, pos, { size: 1.6 });
    },
  },
  {
    id: "yorunge", name: "Yörüngeler", note: "Her küme kendi eğik yörüngesinde; kütüphane yörüngede yılı kadar ilerlemiş. Yörüngenin büyüklüğü kümenin büyüklüğü, açısı haritadaki yönü.", anim: true,
    draw(ctx, W, H, t) {
      bg(ctx, W, H); const P = cam(W, H, t, { pitch: 0.5, zoom: 1.1 });
      const orb = CAT_KEYS.map((_, c) => { const n = L.filter((p) => p.c === c).length, tilt = ((CENT[c].v - 0.5) * 1.6), rot = Math.atan2(CENT[c].v - 0.5, CENT[c].u - 0.5); return { r: 0.35 + n * 0.035, tilt, rot }; });
      const on = (o, th, dr = 0) => { const x = Math.cos(th) * (o.r + dr), z = Math.sin(th) * (o.r + dr), y = z * Math.sin(o.tilt), zz = z * Math.cos(o.tilt); return [x * Math.cos(o.rot) - zz * Math.sin(o.rot), y, x * Math.sin(o.rot) + zz * Math.cos(o.rot)]; };
      orb.forEach((o, c) => poly(ctx, P, Array.from({ length: 81 }, (_, k) => on(o, (k / 80) * TAU)), css(RGB[c], 0.35), 0.9));
      const q0 = P(0, 0, 0); ctx.beginPath(); ctx.arc(q0[0], q0[1], 5, 0, 7); ctx.fillStyle = INK; ctx.fill();
      return dots(ctx, P, (p) => on(orb[p.c], p.a * TAU * 0.9 + p.u * 0.6, (p.v - 0.5) * 0.08));
    },
  },
  {
    id: "rulo", name: "Kıvrılmış harita", note: "Harita bir kâğıt gibi kıvrılıp yarım rulo olmuş: yatay eksen rulonun boyu, dikey eksen kıvrımın çevresi. Yıl rulonun içine doğru: yeniler içte.", anim: true,
    draw(ctx, W, H, t) {
      bg(ctx, W, H); const P = cam(W, H, t, { pitch: 0.25, yaw: 0.3 });
      const at = (x, v, r = 0.55) => { const ph = -0.2 * Math.PI + v * 1.4 * Math.PI; return [x, Math.cos(ph) * r, Math.sin(ph) * r]; };
      for (let k = 0; k <= 10; k++) poly(ctx, P, Array.from({ length: 41 }, (_, j) => at(-1.2 + (k / 10) * 2.4, j / 40)), GUIDE2);
      for (let k = 0; k <= 8; k++) poly(ctx, P, [at(-1.2, k / 8), at(1.2, k / 8)], GUIDE2);
      poly(ctx, P, [at(-1.2, 0), at(1.2, 0)], GUIDE, 1); poly(ctx, P, [at(-1.2, 1), at(1.2, 1)], GUIDE, 1);
      return dots(ctx, P, (p) => at(flatX(p.u), p.v, 0.55 - p.a * 0.3), { stem: (p) => at(flatX(p.u), p.v) });
    },
  },
  {
    id: "dalga", name: "Dalgalı örtü", note: "Kutunun zemini katı değil, nefes alan bir kumaş: harita dalgalanan bir örtü, kütüphaneler örtünün üstünde yılları kadar yüksekte, dalgayla birlikte iniyor kalkıyor.", anim: true,
    draw(ctx, W, H, t) {
      bg(ctx, W, H); const P = cam(W, H, t, { pitch: 0.55, spin: 0.08 });
      const y = (x, z) => -0.45 + Math.sin(x * 2.6 + t * 1.3) * 0.08 + Math.cos(z * 4 + t * 0.9) * 0.05;
      for (let k = 0; k <= 12; k++) { const z = -0.55 + (k / 12) * 1.1; poly(ctx, P, Array.from({ length: 49 }, (_, j) => { const x = -1.2 + (j / 48) * 2.4; return [x, y(x, z), z]; }), GUIDE2); }
      for (let k = 0; k <= 24; k++) { const x = -1.2 + (k / 24) * 2.4; poly(ctx, P, Array.from({ length: 25 }, (_, j) => { const z = -0.55 + (j / 24) * 1.1; return [x, y(x, z), z]; }), GUIDE2); }
      return dots(ctx, P, (p) => { const x = flatX(p.u), z = flatZ(p.v); return [x, y(x, z) + 0.05 + p.a * 0.75, z]; }, { stem: (p) => { const x = flatX(p.u), z = flatZ(p.v); return [x, y(x, z), z]; } });
    },
  },
  {
    id: "kase", name: "Kase", note: "Harita düz değil, bir kasenin içine oturmuş: merkezdeki kümeler dipte, kenardakiler duvara tırmanıyor. Yıl kasenin içinden yukarı; bir amfi gibi.", anim: true,
    draw(ctx, W, H, t) {
      bg(ctx, W, H); const P = cam(W, H, t, { pitch: 0.6, zoom: 1.05 });
      const by = (x, z) => (x * x * 0.32 + z * z * 1.2) - 0.55;
      [0.2, 0.45, 0.7, 0.95, 1.25].forEach((r) => poly(ctx, P, ring(1, 0, 72, ([x, , z]) => [x * r, by(x * r, z * r * 0.46), z * r * 0.46]), r === 1.25 ? GUIDE : GUIDE2));
      for (let k = 0; k < 16; k++) { const th = (k / 16) * TAU; poly(ctx, P, Array.from({ length: 21 }, (_, j) => { const r = (j / 20) * 1.25, x = Math.cos(th) * r, z = Math.sin(th) * r * 0.46; return [x, by(x, z), z]; }), GUIDE2); }
      return dots(ctx, P, (p) => { const x = flatX(p.u), z = flatZ(p.v); return [x, by(x, z) + 0.04 + p.a * 0.35, z]; }, { stem: (p) => { const x = flatX(p.u), z = flatZ(p.v); return [x, by(x, z), z]; } });
    },
  },
  {
    id: "sehir", name: "Şehir maketi", note: "Her kütüphane bir bina: haritadaki yerine dikilmiş, boyu yılı, rengi kümesi. Kümeler mahalle; genç mahallelerin gökdelenleri yüksek.", anim: true,
    draw(ctx, W, H, t) {
      bg(ctx, W, H); const P = cam(W, H, t, { pitch: 0.5 });
      poly(ctx, P, [[-1.3, -0.5, -0.62], [1.3, -0.5, -0.62], [1.3, -0.5, 0.62], [-1.3, -0.5, 0.62]], GUIDE, 0.8, true);
      const s = 0.028, out = [];
      const bl = L.map((p) => { const x = flatX(p.u), z = flatZ(p.v), h = 0.06 + p.a * 0.7; return { p, x, z, h, d: P(x, -0.5 + h / 2, z)[2] }; }).sort((a, b) => a.d - b.d);
      for (const b of bl) {
        const c = RGB[b.p.c], v = (dx, dy, dz) => P(b.x + dx, -0.5 + dy, b.z + dz);
        const faces = [[[-s, 0, s], [s, 0, s], [s, b.h, s], [-s, b.h, s]], [[s, 0, -s], [s, 0, s], [s, b.h, s], [s, b.h, -s]], [[-s, 0, -s], [-s, 0, s], [-s, b.h, s], [-s, b.h, -s]], [[-s, 0, -s], [s, 0, -s], [s, b.h, -s], [-s, b.h, -s]], [[-s, b.h, -s], [s, b.h, -s], [s, b.h, s], [-s, b.h, s]]];
        faces.map((f, k) => ({ f: f.map((q) => v(...q)), k })).sort((a, b2) => a.f.reduce((s2, q) => s2 + q[2], 0) - b2.f.reduce((s2, q) => s2 + q[2], 0)).forEach(({ f, k }) => {
          ctx.beginPath(); f.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath();
          ctx.fillStyle = css(mix(c, k === 4 ? [255, 255, 255] : [20, 20, 20], k === 4 ? 0.25 : 0.12 + (k % 2) * 0.12)); ctx.fill(); ctx.strokeStyle = "rgba(0,0,0,.12)"; ctx.lineWidth = 0.4; ctx.stroke();
        });
        out[b.p.l.i] = v(0, b.h, 0);
      }
      return out;
    },
  },
  {
    id: "pano", name: "Dikey pano", note: "Harita masadan kalkıp duvara asılıyor: bir mantar pano gibi dik duruyor, kütüphaneler iğneleriyle panodan öne doğru çıkıyor. Yeni olan sana daha yakın.", anim: true,
    draw(ctx, W, H, t) {
      bg(ctx, W, H); const P = cam(W, H, t, { pitch: 0.05, yaw: -0.35, spin: 0.06, zoom: 1.05 });
      const c = [[-1.3, -0.62, -0.3], [1.3, -0.62, -0.3], [1.3, 0.62, -0.3], [-1.3, 0.62, -0.3]].map((p) => P(...p));
      ctx.beginPath(); c.forEach((q, i) => (i ? ctx.lineTo(q[0], q[1]) : ctx.moveTo(q[0], q[1]))); ctx.closePath(); ctx.fillStyle = "rgba(196,170,128,.18)"; ctx.fill(); ctx.strokeStyle = GUIDE; ctx.lineWidth = 1.2; ctx.stroke();
      return dots(ctx, P, (p) => [flatX(p.u), (0.5 - p.v) * 1.1, -0.3 + 0.04 + p.a * 0.7], { stem: (p) => [flatX(p.u), (0.5 - p.v) * 1.1, -0.3] });
    },
  },
  {
    id: "halkalar", name: "Ağaç halkaları", note: "Bir kütüğün kesiti gibi: her yıl bir halka, 2006 merkezde. Kütüphane kendi yılının halkasında, haritadaki yönü halkanın neresinde durduğunu belirliyor.", anim: true,
    draw(ctx, W, H, t) {
      bg(ctx, W, H); const P = cam(W, H, t, { pitch: 0.95, zoom: 1.1, spin: 0.1 });
      const R = (a) => 0.12 + a * 1.0;
      for (let y = 2006; y <= 2023; y++) { const a = (y - 2006) / 17; poly(ctx, P, ring(R(a), 0, 96, ([x, yy, z]) => [x, yy, z * 0.9]), y % 5 === 0 ? GUIDE : GUIDE2, y % 5 === 0 ? 1 : 0.7); }
      ctx.font = "10px 'Geist Mono', monospace"; ctx.fillStyle = "rgba(20,38,45,.6)";
      [2010, 2015, 2020].forEach((y) => { const q = P(R((y - 2006) / 17), 0, 0); ctx.fillText(String(y), q[0] + 4, q[1] - 3); });
      return dots(ctx, P, (p) => { const th = Math.atan2((p.v - 0.5) * 1.1, (p.u - 0.5) * 2.4), r = R(p.a); return [Math.cos(th) * r, 0.02, Math.sin(th) * r * 0.9]; });
    },
  },
  {
    id: "kose", name: "Köşe ve üç gölge", note: "Kutunun yalnız üç yüzü kalıyor: zemin ve iki duvar. Bulut havada, her noktanın üç gölgesi var: zeminde harita, arka duvarda yıl × yatay, yan duvarda yıl × dikey.", anim: true,
    draw(ctx, W, H, t) {
      bg(ctx, W, H); const P = cam(W, H, t, { yaw: 0.55, spin: 0.05, pitch: 0.42 });
      const fl = -0.55, bk = -0.62, sd = -1.3;
      const plane = (pts, fill) => { const q = pts.map((p) => P(...p)); ctx.beginPath(); q.forEach((r, i) => (i ? ctx.lineTo(r[0], r[1]) : ctx.moveTo(r[0], r[1]))); ctx.closePath(); ctx.fillStyle = fill; ctx.fill(); ctx.strokeStyle = GUIDE; ctx.lineWidth = 0.8; ctx.stroke(); };
      plane([[sd, fl, bk], [1.3, fl, bk], [1.3, fl, 0.62], [sd, fl, 0.62]], "rgba(40,99,117,.04)");
      plane([[sd, fl, bk], [1.3, fl, bk], [1.3, 0.5, bk], [sd, 0.5, bk]], "rgba(40,99,117,.06)");
      plane([[sd, fl, bk], [sd, fl, 0.62], [sd, 0.5, 0.62], [sd, 0.5, bk]], "rgba(40,99,117,.08)");
      const pos = (p) => [flatX(p.u), p.a * 0.95 - 0.45, flatZ(p.v)];
      for (const p of L) { const w = pos(p); for (const s of [[w[0], fl, w[2]], [w[0], w[1], bk], [sd, w[1], w[2]]]) { const q = P(...s); ctx.fillStyle = css(RGB[p.c], 0.35); ctx.fillRect(q[0] - 1.2, q[1] - 1.2, 2.4, 2.4); } }
      return dots(ctx, P, pos, { size: 1.8 });
    },
  },
  {
    id: "orgu", name: "Örgü", note: "On küme on iplik: zaman boyunca birbirinin etrafında dönerek yükselen bir örgü. Kütüphane kendi ipliğinde yılı kadar yukarıda; iplikler yaklaştığı yerde kümeler birbirine benziyor.", anim: true,
    draw(ctx, W, H, t) {
      bg(ctx, W, H); const P = cam(W, H, t, { pitch: 0.22, zoom: 1.1 });
      const st = (c, a) => { const th = a * 2.2 * TAU + (c / 10) * TAU, r = 0.35 + 0.3 * Math.sin(a * Math.PI + c); return [Math.cos(th) * r, a * 1.7 - 0.85, Math.sin(th) * r]; };
      CAT_KEYS.forEach((_, c) => poly(ctx, P, Array.from({ length: 120 }, (_, k) => st(c, k / 119)), css(RGB[c], 0.55), 2.2));
      return dots(ctx, P, (p) => { const b = st(p.c, p.a); return [b[0] + (p.u - CENT[p.c].u) * 0.5, b[1], b[2] + (p.v - CENT[p.c].v) * 0.5]; }, { stem: (p) => st(p.c, p.a), size: 1.6 });
    },
  },
].map((v) => ({ ...v, ink: INK, halo: BG }));

export const ALL = { LIBS, CATS, labels };
