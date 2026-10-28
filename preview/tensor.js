// The tensor space (topo.html no. 08) in twenty art styles (tensor.html). The scene is the
// same in all of them: a box whose floor is the t-SNE map with its contour lines, whose
// height is the year, and each library a point tied to the floor by a stem. Only the hand
// that draws it changes.

import { K, ASPECT } from "./topo.js";
export { ASPECT };

const { LIBS, CATS, CAT_KEYS, RGB, X0, X1, Y0, Y1, GW, GH, iso, camera, mix, css, clamp, rng, labels } = K;
const ZMAX = 0.42;
const yearZ = (l) => ((l.year - 2006) / 17) * ZMAX;

// Each library's two nearest neighbours in the box itself, for the low-poly facets.
const TRIS = (() => {
  const seen = new Set(), out = [];
  LIBS.forEach((a) => {
    const n = LIBS.filter((b) => b !== a).map((b) => [b.i, (a.X - b.X) ** 2 + (a.Y - b.Y) ** 2 + (yearZ(a) - yearZ(b)) ** 2]).sort((p, q) => p[1] - q[1]);
    const t = [a.i, n[0][0], n[1][0]].sort((p, q) => p - q), key = t.join("-");
    if (!seen.has(key)) { seen.add(key); out.push(t); }
  });
  return out;
})();

// ——— The scene, projected once per frame ———
// A page can narrow the scene to some libraries (focus) and aim the camera (aim); layout.js
// sets both around a single draw. The box also fits itself to the canvas: a short wide strip
// zooms out, a tall phone canvas turns the box lengthwise and looks more from above.
let only = null, aimed = null;
export function focus(set) { only = set; }
export function aim(opts) { aimed = opts; }
function scene(W, H, t, opts = {}) {
  const tall = H > W * 1.05;
  const fit = tall ? { zoom: Math.min(0.6 * (H / W), 1.6), pitch: 0.78, yaw: -0.7 + Math.PI / 2 } : { zoom: 0.66 * Math.min(1, (H * 2.14) / W) };
  const { zoom = 0.66, pitch = 1.08, yaw = -0.7, spin = 0.12, zoomBy = 1 } = { ...opts, ...fit, ...(aimed || {}) };
  const cam = camera(W, H, yaw + t * spin, pitch, zoom * zoomBy);
  const pts = LIBS.map((l) => ({ l, p: cam(l.X, l.Y, yearZ(l)), f: cam(l.X, l.Y, 0) }));
  const order = [...pts].filter((q) => !only || only.has(q.l.i)).sort((a, b) => a.p[2] - b.p[2]);
  const corners = [[X0, Y0], [X1, Y0], [X1, Y1], [X0, Y1]];
  const floor = corners.map(([x, y]) => cam(x, y, 0)), roof = corners.map(([x, y]) => cam(x, y, ZMAX));
  const gx = (g) => X0 + (g / (GW - 1)) * (X1 - X0), gy = (g) => Y0 + (g / (GH - 1)) * (Y1 - Y0);
  const contour = (L, z = 0) => {
    const s = iso(L), out = [];
    for (let k = 0; k < s.length; k += 4) { const a = cam(gx(s[k]), gy(s[k + 1]), z), b = cam(gx(s[k + 2]), gy(s[k + 3]), z); out.push([a[0], a[1], b[0], b[1]]); }
    return out;
  };
  const years = [2006, 2012, 2018, 2023].map((y) => [y, cam(X0, Y0, ((y - 2006) / 17) * ZMAX)]);
  return { cam, pts, order, floor, roof, contour, years, P: pts.map((q) => (!only || only.has(q.l.i) ? q.p : null)), W, H };
}
const LEVELS = [0.12, 0.3, 0.5, 0.7];
function segs(ctx, list, style, width, dash = null) {
  ctx.beginPath(); for (const s of list) { ctx.moveTo(s[0], s[1]); ctx.lineTo(s[2], s[3]); }
  ctx.setLineDash(dash || []); ctx.strokeStyle = style; ctx.lineWidth = width; ctx.stroke(); ctx.setLineDash([]);
}
function contours(ctx, S, style, width, levels = LEVELS, dash) { for (const L of levels) segs(ctx, S.contour(L), style, width, dash); }
function boxEdges(S) {
  const e = [];
  for (let k = 0; k < 4; k++) { const n = (k + 1) % 4; e.push([...S.floor[k].slice(0, 2), ...S.floor[n].slice(0, 2)], [...S.roof[k].slice(0, 2), ...S.roof[n].slice(0, 2)], [...S.floor[k].slice(0, 2), ...S.roof[k].slice(0, 2)]); }
  return e;
}
function box(ctx, S, style, width, dash) { segs(ctx, boxEdges(S), style, width, dash); }
function quad(ctx, q) { ctx.beginPath(); q.forEach((p, k) => (k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]))); ctx.closePath(); }
function years(ctx, S, color, font = "10px 'Geist Mono', monospace", dx = -34) {
  ctx.font = font; ctx.fillStyle = color; ctx.textAlign = "left";
  for (const [y, p] of S.years) ctx.fillText(String(y), p[0] + dx, p[1] + 3);
}
const R = (q, base = 2, k = 2.6) => (base + q.l.r * k) * q.p[3];
function bg(ctx, W, H, c) { ctx.fillStyle = c; ctx.fillRect(0, 0, W, H); }
// A seeded wobble that stays put from frame to frame, so hand-drawn lines don't boil.
function hand(seed) { const r = rng(seed); return (a = 1) => (r() - 0.5) * 2 * a; }
function wobbly(ctx, x0, y0, x1, y1, j, n = 2) {
  for (let k = 0; k < n; k++) { ctx.moveTo(x0 + j(1.2), y0 + j(1.2)); ctx.quadraticCurveTo((x0 + x1) / 2 + j(2), (y0 + y1) / 2 + j(2), x1 + j(1.2), y1 + j(1.2)); }
}
function shape(ctx, kind, x, y, r) {
  ctx.beginPath();
  if (kind === 0) ctx.arc(x, y, r, 0, 7);
  else if (kind === 1) ctx.rect(x - r, y - r, r * 2, r * 2);
  else { ctx.moveTo(x, y - r * 1.2); ctx.lineTo(x + r * 1.1, y + r * 0.8); ctx.lineTo(x - r * 1.1, y + r * 0.8); ctx.closePath(); }
}

// Grain, once, for the printed styles.
const GRAIN = (() => {
  const c = document.createElement("canvas"); c.width = c.height = 160;
  const g = c.getContext("2d"), img = g.createImageData(160, 160), r = rng(4);
  for (let k = 0; k < img.data.length; k += 4) { const v = r() * 255; img.data[k] = img.data[k + 1] = img.data[k + 2] = v; img.data[k + 3] = r() < 0.5 ? 18 : 0; }
  g.putImageData(img, 0, 0); return c;
})();
function grain(ctx, W, H, op = "multiply") { ctx.save(); ctx.globalCompositeOperation = op; ctx.fillStyle = ctx.createPattern(GRAIN, "repeat"); ctx.fillRect(0, 0, W, H); ctx.restore(); }

const PICO = [[0, 228, 54], [41, 173, 255], [131, 118, 156], [0, 135, 81], [255, 119, 168], [255, 163, 0], [255, 236, 39], [171, 82, 54], [255, 0, 77], [194, 195, 199]];
const BAU = ["#d4372c", "#1f4e9c", "#f2c230", "#111111"];
const MEMPHIS = ["#ff8fab", "#5ec2b7", "#ffd166", "#9b8cff", "#4cb5ff", "#ff6b4a"];

export const VARIANTS = [
  {
    id: "lab", name: "Laboratuvar", note: "Çıkış noktası: açık zemin, petrol kutu, kümenin renginde noktalar ve ipler. Temiz, okunur, bilimsel.", anim: true,
    draw(ctx, W, H, t) {
      const S = scene(W, H, t); bg(ctx, W, H, "#f5f3ee");
      contours(ctx, S, "rgba(40,99,117,.35)", 0.7); box(ctx, S, "rgba(20,38,45,.35)", 0.7); years(ctx, S, "rgba(20,38,45,.6)");
      for (const q of S.order) {
        ctx.strokeStyle = css(RGB[q.l.c], 0.45); ctx.lineWidth = 0.7; ctx.beginPath(); ctx.moveTo(q.f[0], q.f[1]); ctx.lineTo(q.p[0], q.p[1]); ctx.stroke();
        ctx.beginPath(); ctx.arc(q.p[0], q.p[1], R(q), 0, 7); ctx.fillStyle = css(RGB[q.l.c]); ctx.fill(); ctx.strokeStyle = "#fff"; ctx.stroke();
      }
      return S.P;
    }, ink: "#14262d", halo: "#f5f3ee",
  },
  {
    id: "blueprint", name: "Mavi kopya", note: "Mühendis çizimi: lacivert kâğıtta beyaz çizgiler, milimetrik ızgara, kesikli ipler, yalnız çevresi çizilmiş noktalar ve ölçü okları.", anim: true, dark: true,
    draw(ctx, W, H, t) {
      const S = scene(W, H, t); bg(ctx, W, H, "#174a83");
      ctx.strokeStyle = "rgba(255,255,255,.07)"; ctx.lineWidth = 1; ctx.beginPath();
      for (let x = 0; x < W; x += 16) { ctx.moveTo(x, 0); ctx.lineTo(x, H); } for (let y = 0; y < H; y += 16) { ctx.moveTo(0, y); ctx.lineTo(W, y); } ctx.stroke();
      contours(ctx, S, "rgba(255,255,255,.35)", 0.7); box(ctx, S, "rgba(255,255,255,.85)", 1);
      segs(ctx, S.order.map((q) => [q.f[0], q.f[1], q.p[0], q.p[1]]), "rgba(255,255,255,.45)", 0.6, [2, 3]);
      for (const q of S.order) { ctx.beginPath(); ctx.arc(q.p[0], q.p[1], R(q), 0, 7); ctx.strokeStyle = "#fff"; ctx.lineWidth = 1; ctx.stroke(); if (q.l.live) { ctx.beginPath(); ctx.arc(q.p[0], q.p[1], 1.2, 0, 7); ctx.fillStyle = "#fff"; ctx.fill(); } }
      const a = S.floor[0], b = S.roof[0];
      ctx.strokeStyle = "#fff"; ctx.lineWidth = 0.8; ctx.beginPath(); ctx.moveTo(a[0] - 18, a[1]); ctx.lineTo(b[0] - 18, b[1]); ctx.stroke();
      ctx.font = "10px 'Geist Mono', monospace"; ctx.fillStyle = "#fff"; ctx.fillText("Δ 17 YIL", b[0] - 70, (a[1] + b[1]) / 2);
      years(ctx, S, "rgba(255,255,255,.8)");
      return S.P;
    }, ink: "#ffffff", halo: "#174a83", font: "11px 'Geist Mono', monospace",
  },
  {
    id: "bauhaus", name: "Bauhaus", note: "Üç temel biçim, üç temel renk: kümeler daire, kare ya da üçgen; kalın siyah kutu, dolu zemin. Geometri süs değil, işaret.", anim: true,
    draw(ctx, W, H, t) {
      const S = scene(W, H, t); bg(ctx, W, H, "#f0e8d6");
      quad(ctx, S.floor); ctx.fillStyle = "#e3d7bd"; ctx.fill();
      contours(ctx, S, "rgba(17,17,17,.25)", 1, [0.2, 0.5]);
      box(ctx, S, "#111", 2.4);
      for (const q of S.order) {
        ctx.strokeStyle = "#111"; ctx.lineWidth = 1.2; ctx.beginPath(); ctx.moveTo(q.f[0], q.f[1]); ctx.lineTo(q.p[0], q.p[1]); ctx.stroke();
        shape(ctx, q.l.c % 3, q.p[0], q.p[1], R(q, 2.6, 3)); ctx.fillStyle = BAU[q.l.c % 4]; ctx.fill();
      }
      years(ctx, S, "#111", "700 11px 'DM Sans', sans-serif", -40);
      return S.P;
    }, ink: "#111", halo: "#f0e8d6", font: "700 12px 'DM Sans', sans-serif",
  },
  {
    id: "isvicre", name: "İsviçre stili", note: "Uluslararası tipografik üslup: siyah beyaz, ince ızgara, kare noktalar, tek vurgu kırmızısı canlı demolara. Yıllar iri ve kalın.", anim: true,
    draw(ctx, W, H, t) {
      const S = scene(W, H, t); bg(ctx, W, H, "#ffffff");
      const g = [];
      for (let k = 0; k <= 12; k++) { const x = X0 + (k / 12) * (X1 - X0), a = S.cam(x, Y0, 0), b = S.cam(x, Y1, 0); g.push([a[0], a[1], b[0], b[1]]); }
      for (let k = 0; k <= 5; k++) { const y = Y0 + (k / 5) * (Y1 - Y0), a = S.cam(X0, y, 0), b = S.cam(X1, y, 0); g.push([a[0], a[1], b[0], b[1]]); }
      segs(ctx, g, "rgba(0,0,0,.12)", 0.8); box(ctx, S, "#000", 1);
      for (const q of S.order) {
        ctx.strokeStyle = "rgba(0,0,0,.3)"; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(q.f[0], q.f[1]); ctx.lineTo(q.p[0], q.p[1]); ctx.stroke();
        const r = R(q, 1.6, 2.4); ctx.fillStyle = q.l.live ? "#e30613" : "#000"; ctx.fillRect(q.p[0] - r, q.p[1] - r, r * 2, r * 2);
      }
      years(ctx, S, "#000", "700 16px 'DM Sans', sans-serif", -52);
      return S.P;
    }, ink: "#000", halo: "#fff", font: "700 11px 'DM Sans', sans-serif",
  },
  {
    id: "synthwave", name: "Synthwave", note: "Seksenler retro-fütürizmi: mor gökte çizgili bir güneş, parlayan pembe zemin ızgarası, neon camgöbeği ipler.", anim: true, dark: true,
    draw(ctx, W, H, t) {
      const S = scene(W, H, t, { pitch: 1.18 });
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, "#12022b"); g.addColorStop(0.6, "#3c0b56"); g.addColorStop(1, "#12022b"); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      const sx = W / 2, sy = H * 0.3, sr = H * 0.22, sg = ctx.createLinearGradient(0, sy - sr, 0, sy + sr);
      sg.addColorStop(0, "#ffe259"); sg.addColorStop(1, "#ff3d8b");
      ctx.save(); ctx.beginPath(); ctx.arc(sx, sy, sr, 0, 7); ctx.clip(); ctx.fillStyle = sg; ctx.fillRect(sx - sr, sy - sr, sr * 2, sr * 2);
      ctx.fillStyle = "#3c0b56"; for (let k = 0; k < 7; k++) { const y = sy + k * sr * 0.16; ctx.fillRect(sx - sr, y, sr * 2, 1 + k * 1.3); } ctx.restore();
      const grid = [];
      for (let k = 0; k <= 24; k++) { const x = X0 + (k / 24) * (X1 - X0), a = S.cam(x, Y0, 0), b = S.cam(x, Y1, 0); grid.push([a[0], a[1], b[0], b[1]]); }
      for (let k = 0; k <= 10; k++) { const y = Y0 + (k / 10) * (Y1 - Y0), a = S.cam(X0, y, 0), b = S.cam(X1, y, 0); grid.push([a[0], a[1], b[0], b[1]]); }
      ctx.shadowColor = "#ff2fd0"; ctx.shadowBlur = 8; segs(ctx, grid, "rgba(255,60,210,.75)", 1);
      ctx.shadowColor = "#3ff"; segs(ctx, S.order.map((q) => [q.f[0], q.f[1], q.p[0], q.p[1]]), "rgba(80,255,255,.55)", 0.8);
      for (const q of S.order) { ctx.beginPath(); ctx.arc(q.p[0], q.p[1], R(q, 1.6, 2), 0, 7); ctx.fillStyle = q.l.live ? "#fff36b" : "#7ffcff"; ctx.fill(); }
      ctx.shadowBlur = 0;
      return S.P;
    }, ink: "#ffe0fb", halo: "#2a0640",
  },
  {
    id: "sumie", name: "Sumi-e mürekkep", note: "Fırça ve mürekkep: pirinç kâğıdı, sivrilen fırça darbeleri, damla gibi yayılan noktalar; kutu neredeyse yok, köşede kırmızı bir mühür.", anim: true,
    draw(ctx, W, H, t) {
      const S = scene(W, H, t); bg(ctx, W, H, "#f3ede0");
      for (const q of S.pts) { const g = ctx.createRadialGradient(q.f[0], q.f[1], 0, q.f[0], q.f[1], 26 * q.f[3]); g.addColorStop(0, "rgba(40,40,40,.06)"); g.addColorStop(1, "rgba(40,40,40,0)"); ctx.fillStyle = g; ctx.fillRect(q.f[0] - 30, q.f[1] - 30, 60, 60); }
      contours(ctx, S, "rgba(30,30,30,.18)", 0.6, [0.3, 0.6]);
      box(ctx, S, "rgba(20,20,20,.12)", 0.8);
      for (const q of S.order) {
        const w = 1.6 * q.p[3];
        ctx.beginPath(); ctx.moveTo(q.f[0] - w * 0.2, q.f[1]); ctx.lineTo(q.p[0] - w, q.p[1]); ctx.lineTo(q.p[0] + w, q.p[1]); ctx.lineTo(q.f[0] + w * 0.2, q.f[1]); ctx.closePath();
        ctx.fillStyle = "rgba(15,15,15,.55)"; ctx.fill();
        const j = hand(q.l.i * 7 + 1), r = R(q, 2.4, 3);
        for (let k = 0; k < 4; k++) { ctx.beginPath(); ctx.arc(q.p[0] + j(r * 0.4), q.p[1] + j(r * 0.4), r * (0.6 + Math.abs(j(0.4))), 0, 7); ctx.fillStyle = q.l.live ? "rgba(178,34,34,.42)" : "rgba(15,15,15,.32)"; ctx.fill(); }
      }
      ctx.fillStyle = "#b8282a"; ctx.fillRect(W - 46, H - 52, 26, 30);
      ctx.fillStyle = "#f3ede0"; ctx.font = "700 9px 'DM Sans', sans-serif"; ctx.textAlign = "center"; ctx.fillText("IMA", W - 33, H - 40); ctx.fillText("map", W - 33, H - 29);
      return S.P;
    }, ink: "#151515", halo: "#f3ede0", font: "italic 400 12px 'DM Sans', sans-serif", upper: false,
  },
  {
    id: "kalem", name: "Kurşun kalem eskiz", note: "Defter kenarına çizilmiş: her çizgi iki kez, titrek; noktalar taranmış yuvarlaklar. Kutu da elle, cetvelsiz.", anim: true,
    draw(ctx, W, H, t) {
      const S = scene(W, H, t); bg(ctx, W, H, "#f8f6f1");
      const j = hand(5);
      ctx.strokeStyle = "rgba(60,60,60,.5)"; ctx.lineWidth = 0.6; ctx.beginPath();
      for (const e of boxEdges(S)) wobbly(ctx, ...e, j);
      for (const s of S.contour(0.3)) { ctx.moveTo(s[0] + j(0.6), s[1] + j(0.6)); ctx.lineTo(s[2] + j(0.6), s[3] + j(0.6)); }
      ctx.stroke();
      for (const q of S.order) {
        const jj = hand(q.l.i + 11), r = R(q, 2.4, 2.8);
        ctx.beginPath(); wobbly(ctx, q.f[0], q.f[1], q.p[0], q.p[1], jj, 1); ctx.strokeStyle = "rgba(70,70,70,.45)"; ctx.lineWidth = 0.5; ctx.stroke();
        ctx.beginPath(); for (let k = 0; k < 2; k++) ctx.arc(q.p[0] + jj(0.8), q.p[1] + jj(0.8), r, 0, 7);
        ctx.strokeStyle = "rgba(40,40,40,.7)"; ctx.lineWidth = 0.6; ctx.stroke();
        ctx.save(); ctx.beginPath(); ctx.arc(q.p[0], q.p[1], r, 0, 7); ctx.clip(); ctx.beginPath();
        for (let k = -r; k < r; k += q.l.live ? 1.4 : 2.6) { ctx.moveTo(q.p[0] + k - r, q.p[1] + r); ctx.lineTo(q.p[0] + k + r, q.p[1] - r); }
        ctx.strokeStyle = "rgba(40,40,40,.55)"; ctx.lineWidth = 0.5; ctx.stroke(); ctx.restore();
      }
      years(ctx, S, "rgba(60,60,60,.8)", "italic 11px 'DM Sans', sans-serif");
      return S.P;
    }, ink: "#3c3c3c", halo: "#f8f6f1", font: "italic 400 12px 'DM Sans', sans-serif", upper: false,
  },
  {
    id: "riso", name: "Risograf", note: "İki kalıplı riso baskı: floresan pembe ve mavi, üst üste bindikleri yerde mor; kalıplar biraz kaymış, kâğıt grenli.", anim: true,
    draw(ctx, W, H, t) {
      const S = scene(W, H, t); bg(ctx, W, H, "#f6f1e7");
      ctx.save(); ctx.globalCompositeOperation = "multiply";
      ctx.translate(1.6, 1); contours(ctx, S, "rgba(0,120,191,.85)", 1.1); box(ctx, S, "rgba(0,120,191,.9)", 1.1);
      for (const q of S.order) if (q.l.c % 2) { ctx.beginPath(); ctx.arc(q.p[0], q.p[1], R(q, 2.4, 3), 0, 7); ctx.fillStyle = "rgba(0,120,191,.85)"; ctx.fill(); }
      ctx.translate(-1.6, -1);
      segs(ctx, S.order.map((q) => [q.f[0], q.f[1], q.p[0], q.p[1]]), "rgba(255,72,176,.8)", 0.9);
      for (const q of S.order) if (!(q.l.c % 2) || q.l.live) { ctx.beginPath(); ctx.arc(q.p[0], q.p[1], R(q, 2.4, 3), 0, 7); ctx.fillStyle = "rgba(255,72,176,.85)"; ctx.fill(); }
      ctx.restore(); grain(ctx, W, H);
      years(ctx, S, "rgba(0,120,191,.95)", "700 11px 'DM Sans', sans-serif");
      return S.P;
    }, ink: "#0078bf", halo: "#f6f1e7", font: "700 12px 'DM Sans', sans-serif",
  },
  {
    id: "fosfor", name: "Fosfor ekran", note: "Eski bir vektör monitörü: yeşil fosfor, parlayan çizgiler, artı imleçli noktalar, tarama çizgileri.", anim: true, dark: true,
    draw(ctx, W, H, t) {
      const S = scene(W, H, t); bg(ctx, W, H, "#021407");
      ctx.shadowColor = "#3f6"; ctx.shadowBlur = 6;
      contours(ctx, S, "rgba(60,255,110,.35)", 0.8); box(ctx, S, "rgba(60,255,110,.8)", 1);
      segs(ctx, S.order.map((q) => [q.f[0], q.f[1], q.p[0], q.p[1]]), "rgba(60,255,110,.35)", 0.7);
      const cross = [];
      for (const q of S.order) { const r = R(q, 2, 2.4); cross.push([q.p[0] - r, q.p[1], q.p[0] + r, q.p[1]], [q.p[0], q.p[1] - r, q.p[0], q.p[1] + r]); }
      segs(ctx, cross, "#8dffa8", 1.1);
      ctx.shadowBlur = 0; years(ctx, S, "#5dff87");
      ctx.fillStyle = "rgba(0,0,0,.28)"; for (let y = 0; y < H; y += 3) ctx.fillRect(0, y, W, 1);
      return S.P;
    }, ink: "#8dffa8", halo: "#021407", font: "11px 'Geist Mono', monospace",
  },
  {
    id: "ascii", name: "ASCII", note: "Yalnız harflerle: zemin noktalar, kutu tire ve çizgi, ipler dikey çizgi, kütüphaneler büyüklüğüne göre o, O ya da @.", anim: true,
    draw(ctx, W, H, t) {
      const S = scene(W, H, t); bg(ctx, W, H, "#fbfaf6");
      const cw = Math.max(5, W / 180), ch = cw * 1.7, cols = Math.ceil(W / cw), rows = Math.ceil(H / ch), buf = new Array(cols * rows).fill("");
      const put = (x, y, c, force) => { const i = Math.floor(x / cw), j = Math.floor(y / ch); if (i < 0 || j < 0 || i >= cols || j >= rows) return; const k = j * cols + i; if (force || !buf[k]) buf[k] = c; };
      const line = (s, c) => { const n = Math.ceil(Math.hypot(s[2] - s[0], s[3] - s[1]) / (cw * 0.7)); for (let k = 0; k <= n; k++) put(s[0] + ((s[2] - s[0]) * k) / n, s[1] + ((s[3] - s[1]) * k) / n, c); };
      for (const q of S.order) { const r = q.l.r; put(q.p[0], q.p[1], r > 0.75 ? "@" : r > 0.5 ? "O" : "o", true); }
      for (const q of S.order) line([q.f[0], q.f[1], q.p[0], q.p[1]], "|");
      for (const e of boxEdges(S)) line(e, Math.abs(e[3] - e[1]) > Math.abs(e[2] - e[0]) ? "|" : "-");
      for (const L of [0.12, 0.4]) for (const s of S.contour(L)) line(s, L > 0.2 ? ":" : ".");
      ctx.font = `${(ch * 0.85).toFixed(1)}px 'Geist Mono', monospace`; ctx.textBaseline = "top";
      for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) { const c = buf[j * cols + i]; if (!c) continue; ctx.fillStyle = /[oO@]/.test(c) ? "#14262d" : "rgba(20,38,45,.45)"; ctx.fillText(c, i * cw, j * ch); }
      return S.P;
    }, ink: "#14262d", halo: "#fbfaf6", font: "11px 'Geist Mono', monospace",
  },
  {
    id: "pointilizm", name: "Noktacılık", note: "Seurat'nın yöntemi: hiçbir şey çizgi değil. Her kütüphane yakın tonlarda küçük boya noktalarından bir küme, ipler ve eğriler nokta dizisi.", anim: true,
    draw(ctx, W, H, t) {
      const S = scene(W, H, t); bg(ctx, W, H, "#fbf7ee");
      const dotted = (list, color, gap) => { ctx.fillStyle = color; for (const s of list) { const n = Math.ceil(Math.hypot(s[2] - s[0], s[3] - s[1]) / gap); for (let k = 0; k <= n; k++) ctx.fillRect(s[0] + ((s[2] - s[0]) * k) / n, s[1] + ((s[3] - s[1]) * k) / n, 1.2, 1.2); } };
      for (const L of LEVELS) dotted(S.contour(L), "rgba(70,110,150,.5)", 4);
      dotted(boxEdges(S), "rgba(60,60,60,.5)", 4);
      for (const q of S.order) {
        dotted([[q.f[0], q.f[1], q.p[0], q.p[1]]], css(RGB[q.l.c], 0.6), 3.5);
        const j = hand(q.l.i * 3 + 2), r = R(q, 3, 3.5);
        for (let k = 0; k < 34; k++) {
          const a = j(Math.PI), d = Math.abs(j(r)), c = mix(RGB[q.l.c], k % 3 ? [255, 255, 255] : RGB[(q.l.c + 3) % 10], Math.abs(j(0.45)));
          ctx.beginPath(); ctx.arc(q.p[0] + Math.cos(a) * d, q.p[1] + Math.sin(a) * d, 0.9 + Math.abs(j(0.5)), 0, 7); ctx.fillStyle = css(c, 0.9); ctx.fill();
        }
      }
      return S.P;
    }, ink: "#2a2722", halo: "#fbf7ee", font: "italic 400 12px 'DM Sans', sans-serif", upper: false,
  },
  {
    id: "memphis", name: "Memphis", note: "Seksenlerin Memphis grubu: pastel biçimler, kalın siyah kontur, kayık gölgeler, zikzak ipler ve arkada konfeti.", anim: true,
    draw(ctx, W, H, t) {
      const S = scene(W, H, t); bg(ctx, W, H, "#fff3e2");
      const r = rng(8);
      for (let k = 0; k < 40; k++) {
        const x = r() * W, y = r() * H, c = MEMPHIS[k % 6]; ctx.strokeStyle = c; ctx.fillStyle = c; ctx.lineWidth = 2.2;
        if (k % 3 === 0) { ctx.beginPath(); for (let s = 0; s < 4; s++) ctx.lineTo(x + s * 7, y + (s % 2 ? 6 : 0)); ctx.stroke(); }
        else if (k % 3 === 1) { ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + 8, y + 12); ctx.lineTo(x - 8, y + 12); ctx.closePath(); ctx.fill(); }
        else { ctx.beginPath(); ctx.arc(x, y, 3, 0, 7); ctx.fill(); }
      }
      quad(ctx, S.floor); ctx.fillStyle = "rgba(255,255,255,.75)"; ctx.fill();
      box(ctx, S, "#111", 1.8);
      for (const q of S.order) {
        ctx.beginPath(); const n = 6; for (let k = 0; k <= n; k++) { const x = q.f[0] + ((q.p[0] - q.f[0]) * k) / n + (k % 2 ? 3 : -3) * q.p[3], y = q.f[1] + ((q.p[1] - q.f[1]) * k) / n; k ? ctx.lineTo(x, y) : ctx.moveTo(q.f[0], q.f[1]); }
        ctx.strokeStyle = "#111"; ctx.lineWidth = 0.9; ctx.stroke();
        const rr = R(q, 3, 3);
        shape(ctx, q.l.c % 3, q.p[0] + 2, q.p[1] + 2, rr); ctx.fillStyle = "#111"; ctx.fill();
        shape(ctx, q.l.c % 3, q.p[0], q.p[1], rr); ctx.fillStyle = MEMPHIS[q.l.c % 6]; ctx.fill(); ctx.strokeStyle = "#111"; ctx.lineWidth = 1.3; ctx.stroke();
      }
      return S.P;
    }, ink: "#111", halo: "#fff3e2", font: "700 12px 'DM Sans', sans-serif",
  },
  {
    id: "konstruktivizm", name: "Konstrüktivizm", note: "Rodçenko afişi gibi: krem zeminde çapraz kırmızı bir kuşak, kalın siyah çubuklar, kırmızı canlılar. Her şey bir ilan.", anim: true,
    draw(ctx, W, H, t) {
      const S = scene(W, H, t); bg(ctx, W, H, "#eee1cb");
      ctx.fillStyle = "#c8201e"; ctx.beginPath(); ctx.moveTo(0, H * 0.82); ctx.lineTo(W * 0.62, 0); ctx.lineTo(W * 0.8, 0); ctx.lineTo(W * 0.18, H); ctx.lineTo(0, H); ctx.closePath(); ctx.globalAlpha = 0.9; ctx.fill(); ctx.globalAlpha = 1;
      ctx.fillStyle = "#111"; ctx.beginPath(); ctx.arc(W * 0.86, H * 0.2, H * 0.12, 0, 7); ctx.fill();
      box(ctx, S, "#111", 2.6);
      for (const q of S.order) {
        ctx.strokeStyle = "#111"; ctx.lineWidth = 2 * q.p[3]; ctx.beginPath(); ctx.moveTo(q.f[0], q.f[1]); ctx.lineTo(q.p[0], q.p[1]); ctx.stroke();
        ctx.beginPath(); ctx.arc(q.p[0], q.p[1], R(q, 2.4, 3), 0, 7); ctx.fillStyle = q.l.live ? "#c8201e" : "#111"; ctx.fill(); ctx.strokeStyle = "#eee1cb"; ctx.lineWidth = 1; ctx.stroke();
      }
      years(ctx, S, "#111", "800 15px 'DM Sans', sans-serif", -54);
      grain(ctx, W, H);
      return S.P;
    }, ink: "#111", halo: "#eee1cb", font: "800 13px 'DM Sans', sans-serif",
  },
  {
    id: "lowpoly", name: "Alçak poligon", note: "Kristal bir heykel: her kütüphane en yakın iki komşusuyla bir yüzey kuruyor, yüzeyler kümenin renginde ve sabit bir ışıkla gölgeli.", anim: true, dark: true,
    draw(ctx, W, H, t) {
      const S = scene(W, H, t); bg(ctx, W, H, "#0f1218");
      contours(ctx, S, "rgba(255,255,255,.08)", 0.7);
      const L = [0.4, -0.6, 0.7];
      TRIS.filter((tr) => tr.every((i) => S.P[i])).map((tr) => [tr, (S.P[tr[0]][2] + S.P[tr[1]][2] + S.P[tr[2]][2]) / 3]).sort((a, b) => a[1] - b[1]).forEach(([tr]) => {
        const [a, b, c] = tr.map((i) => LIBS[i]);
        const u = [b.X - a.X, b.Y - a.Y, yearZ(b) - yearZ(a)], v = [c.X - a.X, c.Y - a.Y, yearZ(c) - yearZ(a)];
        const n = [u[1] * v[2] - u[2] * v[1], u[2] * v[0] - u[0] * v[2], u[0] * v[1] - u[1] * v[0]], m = Math.hypot(...n) + 1e-9;
        const s = 0.35 + 0.65 * Math.abs((n[0] * L[0] + n[1] * L[1] + n[2] * L[2]) / m);
        ctx.beginPath(); tr.forEach((i, k) => (k ? ctx.lineTo(S.P[i][0], S.P[i][1]) : ctx.moveTo(S.P[i][0], S.P[i][1]))); ctx.closePath();
        ctx.fillStyle = css(RGB[a.c].map((x) => x * s), 0.82); ctx.fill(); ctx.strokeStyle = "rgba(255,255,255,.18)"; ctx.lineWidth = 0.6; ctx.stroke();
      });
      return S.P;
    }, ink: "#eef0f4", halo: "#0f1218",
  },
  {
    id: "gravur", name: "Gravür", note: "Çelik gravür: sepya kâğıt, noktalar tarama çizgileriyle gölgelenmiş küreler, çift çizgili kutu. On dokuzuncu yüzyıl bilim kitabı.", anim: true,
    draw(ctx, W, H, t) {
      const S = scene(W, H, t); bg(ctx, W, H, "#efe5cc");
      contours(ctx, S, "rgba(58,42,26,.45)", 0.6); box(ctx, S, "rgba(58,42,26,.85)", 0.8);
      ctx.save(); ctx.translate(2.5, -2.5); box(ctx, S, "rgba(58,42,26,.3)", 0.5); ctx.restore();
      for (const q of S.order) {
        ctx.strokeStyle = "rgba(58,42,26,.6)"; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(q.f[0], q.f[1]); ctx.lineTo(q.p[0], q.p[1]); ctx.stroke();
        const r = R(q, 3, 3.4), x = q.p[0], y = q.p[1];
        ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fillStyle = "#f6eed8"; ctx.fill();
        ctx.save(); ctx.clip(); ctx.beginPath();
        for (let k = -r; k <= r; k += 1.4) { ctx.moveTo(x - r, y + k); ctx.lineTo(x + r, y + k); }
        const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.4, 0, x, y, r * 1.2); g.addColorStop(0, "rgba(58,42,26,0)"); g.addColorStop(1, "rgba(58,42,26,.9)");
        ctx.strokeStyle = g; ctx.lineWidth = 0.7; ctx.stroke(); ctx.restore();
        ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.strokeStyle = "rgba(58,42,26,.9)"; ctx.lineWidth = 0.6; ctx.stroke();
      }
      years(ctx, S, "rgba(58,42,26,.9)", "italic 11px 'DM Sans', sans-serif");
      return S.P;
    }, ink: "#3a2a1a", halo: "#efe5cc", font: "italic 500 12px 'DM Sans', sans-serif", upper: false,
  },
  {
    id: "siyanotip", name: "Siyanotip", note: "Güneş baskısı: Prusya mavisi kâğıt, nesneler ışığı kesmiş gibi beyaz ve hafif bulanık; Anna Atkins'in yosun fotogramları.", anim: true, dark: true,
    draw(ctx, W, H, t) {
      const S = scene(W, H, t); bg(ctx, W, H, "#0f3768");
      grain(ctx, W, H, "screen");
      ctx.save(); ctx.filter = "blur(0.7px)";
      contours(ctx, S, "rgba(225,238,255,.3)", 0.9); box(ctx, S, "rgba(225,238,255,.5)", 1);
      segs(ctx, S.order.map((q) => [q.f[0], q.f[1], q.p[0], q.p[1]]), "rgba(225,238,255,.5)", 0.9);
      for (const q of S.order) {
        const r = R(q, 3, 3.6), g = ctx.createRadialGradient(q.p[0], q.p[1], 0, q.p[0], q.p[1], r * 1.4);
        g.addColorStop(0, "rgba(240,247,255,.95)"); g.addColorStop(0.6, "rgba(240,247,255,.75)"); g.addColorStop(1, "rgba(240,247,255,0)");
        ctx.fillStyle = g; ctx.beginPath(); ctx.arc(q.p[0], q.p[1], r * 1.4, 0, 7); ctx.fill();
      }
      ctx.restore();
      return S.P;
    }, ink: "#eef5ff", halo: "#0f3768", font: "italic 400 12px 'DM Sans', sans-serif", upper: false,
  },
  {
    id: "rontgen", name: "Röntgen", note: "İçinden bakılan kutu: siyaha yakın mavi, ışık toplanarak parlayan kemik gibi ipler ve halka noktalar. Yoğun yerler daha parlak.", anim: true, dark: true,
    draw(ctx, W, H, t) {
      const S = scene(W, H, t); bg(ctx, W, H, "#02060c");
      ctx.globalCompositeOperation = "lighter";
      contours(ctx, S, "rgba(120,170,230,.12)", 1.4); box(ctx, S, "rgba(140,190,240,.25)", 1);
      ctx.shadowColor = "#9cf"; ctx.shadowBlur = 10;
      segs(ctx, S.order.map((q) => [q.f[0], q.f[1], q.p[0], q.p[1]]), "rgba(170,210,255,.28)", 1.6);
      for (const q of S.order) { ctx.beginPath(); ctx.arc(q.p[0], q.p[1], R(q, 2.6, 3), 0, 7); ctx.strokeStyle = "rgba(210,235,255,.7)"; ctx.lineWidth = 1.4; ctx.stroke(); ctx.fillStyle = "rgba(160,200,255,.12)"; ctx.fill(); }
      ctx.shadowBlur = 0; ctx.globalCompositeOperation = "source-over";
      return S.P;
    }, ink: "#d6ecff", halo: "#02060c",
  },
  {
    id: "calder", name: "Calder mobili", note: "Ters çevrilmiş tensör: kütüphaneler zeminden yükselmiyor, kutunun tavanından tellerle sarkıyor. Düz boyalı diskler, ince siyah teller, yavaşça salınıyor.", anim: true,
    draw(ctx, W, H, t) {
      const S = scene(W, H, t, { spin: 0.08 }); bg(ctx, W, H, "#ebe6da");
      contours(ctx, S, "rgba(0,0,0,.08)", 1);
      segs(ctx, [0, 1, 2, 3].map((k) => [...S.roof[k].slice(0, 2), ...S.roof[(k + 1) % 4].slice(0, 2)]), "#111", 1.6);
      const COL = ["#c8201e", "#111", "#f2c230", "#1f4e9c", "#111", "#c8201e", "#f6f3ea", "#111", "#1f4e9c", "#f2c230"];
      for (const q of S.order) {
        const top = S.cam(q.l.X, q.l.Y, ZMAX), sw = Math.sin(t * 0.9 + q.l.i) * 2;
        ctx.strokeStyle = "rgba(17,17,17,.75)"; ctx.lineWidth = 0.6; ctx.beginPath(); ctx.moveTo(top[0], top[1]); ctx.lineTo(q.p[0] + sw, q.p[1]); ctx.stroke();
        const r = R(q, 3, 4);
        ctx.save(); ctx.translate(q.p[0] + sw, q.p[1]); ctx.rotate(Math.sin(t * 0.6 + q.l.i) * 0.6); ctx.scale(1, 0.42);
        ctx.beginPath(); ctx.arc(0, 0, r, 0, 7); ctx.fillStyle = COL[q.l.c]; ctx.fill(); ctx.strokeStyle = "#111"; ctx.lineWidth = 0.8; ctx.stroke(); ctx.restore();
      }
      return S.pts.map((q, i) => S.P[i] && [q.p[0] + Math.sin(t * 0.9 + i) * 2, q.p[1], q.p[2], q.p[3]]);
    }, ink: "#111", halo: "#ebe6da",
  },
  {
    id: "kagit", name: "Kâğıt katmanlar", note: "Kesilmiş kâğıttan dört dönem: 2006–09, 2010–13, 2014–17, 2018–23 ayrı kartonlar, aralarında gölge; kütüphaneler kendi dönemlerinin kartonuna yapışık.", anim: true,
    draw(ctx, W, H, t) {
      const S = scene(W, H, t); bg(ctx, W, H, "#d8d0c0");
      const bins = [[2006, 2009], [2010, 2013], [2014, 2017], [2018, 2023]], tones = ["#f3ece0", "#efe4d2", "#f5efe6", "#fbf7f0"];
      contours(ctx, S, "rgba(80,60,40,.25)", 0.8);
      bins.forEach(([a, b], k) => {
        const z = (((a + b) / 2 - 2006) / 17) * ZMAX, q4 = [[X0, Y0], [X1, Y0], [X1, Y1], [X0, Y1]].map(([x, y]) => S.cam(x, y, z));
        ctx.save(); ctx.shadowColor = "rgba(0,0,0,.25)"; ctx.shadowBlur = 14; ctx.shadowOffsetY = 6;
        quad(ctx, q4); ctx.fillStyle = tones[k]; ctx.globalAlpha = 0.5; ctx.fill(); ctx.restore();
        ctx.font = "500 10px 'Geist Mono', monospace"; ctx.fillStyle = "rgba(60,50,40,.7)"; ctx.fillText(`${a}–${String(b).slice(2)}`, q4[0][0] - 52, q4[0][1] + 3);
        for (const q of S.order) {
          if (q.l.year < a || q.l.year > b) continue;
          const p = S.cam(q.l.X, q.l.Y, z), r = R(q, 2.6, 3);
          ctx.save(); ctx.shadowColor = "rgba(0,0,0,.3)"; ctx.shadowBlur = 3; ctx.shadowOffsetY = 1.5;
          ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, 7); ctx.fillStyle = css(mix(RGB[q.l.c], [255, 255, 255], 0.15)); ctx.fill(); ctx.restore();
          q.paper = p;
        }
      });
      return S.pts.map((q, i) => S.P[i] && (q.paper || q.p));
    }, ink: "#3a3028", halo: "rgba(250,246,238,.9)",
  },
  {
    id: "piksel", name: "8-bit piksel", note: "Eski bir oyun konsolu: çözünürlük dörtte bire düşmüş, on altı renklik palet, kutu ve ipler tek piksellik basamaklı çizgiler.", anim: true, dark: true,
    draw(ctx, W, H, t, St) {
      const f = 4, w = Math.ceil(W / f), h = Math.ceil(H / f);
      if (!St.off || St.off.width !== w) { St.off = document.createElement("canvas"); St.off.width = w; St.off.height = h; }
      const g = St.off.getContext("2d"), S = scene(w, h, t);
      g.imageSmoothingEnabled = false; g.fillStyle = "#1d2b53"; g.fillRect(0, 0, w, h);
      const px = (s, c) => { g.fillStyle = c; const n = Math.ceil(Math.max(Math.abs(s[2] - s[0]), Math.abs(s[3] - s[1]))); for (let k = 0; k <= n; k++) g.fillRect(Math.round(s[0] + ((s[2] - s[0]) * k) / (n || 1)), Math.round(s[1] + ((s[3] - s[1]) * k) / (n || 1)), 1, 1); };
      for (const s of S.contour(0.3)) px(s, "#5f574f");
      for (const e of boxEdges(S)) px(e, "#c2c3c7");
      for (const q of S.order) {
        px([q.f[0], q.f[1], q.p[0], q.p[1]], "#7e2553");
        const c = PICO[q.l.c], r = q.l.r > 0.7 ? 1 : 0;
        g.fillStyle = css(c); g.fillRect(Math.round(q.p[0]) - r, Math.round(q.p[1]) - r, 1 + r * 2, 1 + r * 2);
      }
      ctx.imageSmoothingEnabled = false; ctx.drawImage(St.off, 0, 0, w * f, h * f);
      return S.pts.map((q, i) => S.P[i] && [q.p[0] * f, q.p[1] * f]);
    }, ink: "#fff1e8", halo: "#1d2b53", font: "11px 'Geist Mono', monospace",
  },
];

export const ALL = { LIBS, CATS, labels };
