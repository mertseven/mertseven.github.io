// Assets & downloads: karakter, mekân, ada planı, stil, font ve motoru seçip tek ZIP olarak indirir.
// Girdi: tıklanan kartlar + biçim seçenekleri (PNG / JSON). Durum: seçili anahtarlar, çizilmiş PNG'ler.
// Çıktı: kartların canlı önizlemesi (motorla çizilir) ve ZIP. Bağımlılık yok; ZIP yazıcısı aşağıda.
import * as THREE from '../assets/vendor/three.module.js';

const LIB = window.KUTUPHANE;
const $ = (id) => document.getElementById(id);
const el = (tag, attrs = {}, html) => { const n = document.createElement(tag); Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); if (html != null) n.innerHTML = html; return n; };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const slug = (s) => String(s).toLowerCase().replace(/ı/g, 'i').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9.]+/g, '-').replace(/^-|-$/g, '');

const CHARS = LIB.karakterler, PLACES = LIB.mekanlar;
const ISLANDS = [['plan.c2', 'ferah-koy'], ['plan.pazarlik', 'pazarlik-adacigi']].filter(([id]) => LIB.adalar && LIB.adalar[id]);
const FONTS = [
  ['DM Sans', 'dm-sans', ['dm-sans-0.ttf', 'dm-sans-1.ttf'], 'dmsans-OFL.txt'],
  ['Fraunces', 'fraunces', ['fraunces-0.ttf', 'fraunces-1.ttf', 'fraunces-2.ttf'], 'fraunces-OFL.txt'],
  ['IBM Plex Mono', 'ibm-plex-mono', ['ibm-plex-mono-0.ttf'], 'ibmplexmono-OFL.txt'],
  ['IM Fell English', 'im-fell-english', ['im-fell-english-0.ttf', 'im-fell-english-1.ttf'], 'imfellenglish-OFL.txt'],
  ['Instrument Serif', 'instrument-serif', ['instrument-serif-0.ttf', 'instrument-serif-1.ttf'], 'instrumentserif-OFL.txt'],
  ['Pixelify Sans', 'pixelify-sans', ['pixelify-sans-0.ttf', 'pixelify-sans-1.ttf'], 'pixelifysans-OFL.txt'],
  ['Silkscreen', 'silkscreen', ['silkscreen-0.ttf', 'silkscreen-1.ttf'], 'silkscreen-OFL.txt'],
  ['Space Grotesk', 'space-grotesk', ['space-grotesk-0.ttf', 'space-grotesk-1.ttf'], 'spacegrotesk-OFL.txt'],
  ['VT323', 'vt323', ['vt323-0.ttf'], 'vt323-OFL.txt']
];
const ENGINE_FILES = [['island/kutuphane/parcalar.js', 'engine/parcalar.js'], ['island/kutuphane/gorunum.js', 'engine/gorunum.js'], ['island/kutuphane/yapilar.js', 'engine/yapilar.js'],
  ['island/kutuphane/arazi.js', 'engine/arazi.js'], ['island/kutuphane/ada-sahne.js', 'engine/ada-sahne.js'], ['assets/vendor/three.module.js', 'engine/vendor/three.module.js'], ['licenses/three-MIT.txt', 'engine/vendor/three-MIT.txt']];

const sel = new Set();
const png = new Map();       // karakter id → Blob (çizildikçe)
const groups = { chars: [], places: [], islands: [] };

// ---------- Kartlar ----------
function item(group, key, searchText, cardHtml) {
  const label = el('label', { class: 'item', 'data-key': key, 'data-search': searchText.toLowerCase() });
  const input = el('input', { type: 'checkbox' }); input.addEventListener('change', () => { input.checked ? sel.add(key) : sel.delete(key); update(); });
  label.append(input, el('span', { class: 'card' }, cardHtml));
  label._input = input; if (group) groups[group].push(label);
  return label;
}
const thumbOf = (label) => label.querySelector('.thumb');

CHARS.forEach((c) => {
  const it = item('chars', 'char:' + c.id, [c.name, c.role, c.id, (c.tags || []).join(' ')].join(' '),
    '<span class="thumb empty" aria-hidden="true">' + esc((c.name || '?')[0]) + '</span><b>' + esc(c.name) + '</b><span class="meta">' + esc((c.role || '').split('·').pop().trim()) + '</span><span class="id">' + esc(c.id) + '</span>');
  it._rec = c; it._kind = 'char'; $('g-chars').append(it);
});
PLACES.forEach((p) => {
  const it = item('places', 'place:' + p.place, [p.name, p.premise, p.game || '', p.place].join(' '),
    '<span class="thumb sq empty" aria-hidden="true">' + esc(p.name[0]) + '</span><b>' + esc(p.name) + '</b><span class="meta">' + (p.place === 'hub' ? 'HUB' : p.place === 'pz' ? 'STUDENT ISLET' : 'PREMISE ' + p.place) + ' · ' + esc(p.premise) + '</span>' + (p.game ? '<span class="id">game: ' + esc(p.game) + (p.credit ? ' · by ' + esc(p.credit) : '') + '</span>' : ''));
  it._rec = p; it._kind = 'place'; $('g-places').append(it);
});
ISLANDS.forEach(([id, file]) => {
  const pl = LIB.adalar[id], pts = pl.coast.concat(pl.coasts ? pl.coasts.flat() : []), xs = pts.map((p) => p[0]), zs = pts.map((p) => p[1]);
  const x0 = Math.min(...xs) - 1, x1 = Math.max(...xs) + 1, z0 = Math.min(...zs) - 1, z1 = Math.max(...zs) + 1;
  const svg = '<svg class="coast" viewBox="' + x0 + ' ' + z0 + ' ' + (x1 - x0) + ' ' + (z1 - z0) + '" role="img" aria-label="Coast outline of ' + esc(pl.name) + '"><polygon points="' + pl.coast.map((p) => p.join(',')).join(' ') + '" fill="#e8ddb0" stroke="#6b5e3a" stroke-width=".25" stroke-linejoin="round"/></svg>';
  const it = item('islands', 'island:' + id, [pl.name, pl.idea || '', file].join(' '), svg + '<b>' + esc(pl.name) + '</b><span class="meta">' + (pl.items || []).length + ' items · ' + pl.zones.length + ' zones</span><p>' + esc((pl.idea || '').slice(0, 130)) + '</p>');
  it._kind = 'island'; $('g-islands').append(it);
});
// stil, fontlar, motor
const more = $('g-more');
const ST = LIB.stil;
more.append(item(null, 'style', 'style montour palette light engraving', '<b>Montour style</b><span class="meta">PALETTE · LIGHT · ENGRAVING</span><p>' + esc((ST && ST.note || 'The look of the island: palette, thresholds and lights.').slice(0, 150)) + '</p>'));
FONTS.forEach(([name, , files]) => more.append(item(null, 'font:' + name, name + ' font', '<span class="sample" style="font-family:\'' + name + '\',serif">Aa Quick fox</span><b>' + esc(name) + '</b><span class="meta">FONT · ' + files.length + ' file' + (files.length > 1 ? 's' : '') + ' · open licence</span>')));
more.append(item(null, 'engine', 'engine three.js island code javascript', '<b>Island engine</b><span class="meta">JS · THREE.JS</span><p>The code that draws characters, places and islands (parts, look, structures, terrain, scene) plus three.js. Needed to render the recipes.</p>'));

// ---------- Önizleme çizimi (motorla, gerektikçe) ----------
let draw = null;
try {
  const cv = document.createElement('canvas'); cv.style.cssText = 'position:fixed;left:-10000px;top:0';
  document.body.append(cv);
  const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1); renderer.outputColorSpace = THREE.SRGBColorSpace;
  const look = createLook(THREE, renderer), parts = createParts(THREE, renderer), yapi = createStructures(THREE, parts), colors = look.rolesOf(look.PALS.c);
  const scene = new THREE.Scene(), group = new THREE.Group(); scene.add(group);
  scene.add(new THREE.AmbientLight(0xffffff, 0.45)); const sun = new THREE.DirectionalLight(0xffffff, 2.6); sun.position.set(-3, 6, 7); scene.add(sun);
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100), recipes = Object.fromEntries(CHARS.map((c) => [c.id, c]));
  const settings = Object.assign({}, look.DEFAULTS, { pal: 'c', sys: 'engrave', lit: 'color', decor: 0, on: 1, paint: 0, scale: 1, time: 'day', dark: 'quiet', unify: 1 });
  const blob = () => new Promise((res) => cv.toBlob(res, 'image/png'));
  draw = {
    async char(rec) {
      const W = 300, H = 450; renderer.setSize(W, H, false); cv.style.width = W + 'px'; cv.style.height = H + 'px';
      group.clear(); const ch = parts.build(rec, colors); group.add(ch.root); look.patchObject(ch.root); group.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(group), center = box.getCenter(new THREE.Vector3()), size = box.getSize(new THREE.Vector3()), ratio = W / H, half = Math.max(size.y * 0.57, size.x / ratio * 0.56) + 0.04;
      Object.assign(camera, { left: -half * ratio, right: half * ratio, top: half, bottom: -half }); camera.position.set(center.x, center.y + 0.15, 8); camera.lookAt(center); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
      look.render(cv, scene, camera, new THREE.Color(0xffffff), settings, 1, 1); return blob();
    },
    async place(rec) {
      const W = 420, H = 420; renderer.setSize(W, H, false); cv.style.width = W + 'px'; cv.style.height = H + 'px';
      group.clear(); const s = yapi.build(rec, colors, (id) => parts.build(recipes[id], colors)); group.add(s.root); look.patchObject(s.root); group.updateMatrixWorld(true);
      const sph = new THREE.Box3().setFromObject(group).getBoundingSphere(new THREE.Sphere()), half = sph.radius * 1.02 + 0.05;
      Object.assign(camera, { left: -half, right: half, top: half, bottom: -half }); camera.position.set(sph.center.x + 6, sph.center.y + 6.5, sph.center.z + 8); camera.lookAt(sph.center); camera.updateProjectionMatrix(); camera.updateMatrixWorld();
      look.render(cv, scene, camera, new THREE.Color(0xffffff), settings, 1, 1); return blob();
    }
  };
} catch (e) { console.warn('Preview renderer unavailable:', e); }

const queue = []; let busy = false;
async function pump() {
  if (busy) return; busy = true;
  while (queue.length) {
    const lb = queue.shift();
    try {
      const b = await draw[lb._kind](lb._rec); if (!b) continue;
      if (lb._kind === 'char') png.set(lb._rec.id, b);
      const t = thumbOf(lb), img = el('img', { class: 'thumb' + (lb._kind === 'place' ? ' sq' : ''), alt: lb._rec.name + ' preview', loading: 'lazy', width: lb._kind === 'place' ? 420 : 300, height: lb._kind === 'place' ? 420 : 450 });
      img.src = URL.createObjectURL(b); t.replaceWith(img);
    } catch (e) { console.warn('Preview failed for', lb._rec.id || lb._rec.place, e); }
    await new Promise((r) => requestAnimationFrame(r));
  }
  busy = false;
}
if (draw) {
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { io.unobserve(e.target); queue.push(e.target); pump(); } }), { rootMargin: '300px' });
  [...groups.chars, ...groups.places].forEach((lb) => io.observe(lb));
}

// ---------- Seçim, süzme, çubuk ----------
const names = { chars: 'character', places: 'place', islands: 'island plan' };
function counts() {
  const c = { chars: 0, places: 0, islands: 0, more: 0 };
  sel.forEach((k) => { const g = k.startsWith('char:') ? 'chars' : k.startsWith('place:') ? 'places' : k.startsWith('island:') ? 'islands' : 'more'; c[g]++; });
  return c;
}
function update() {
  const c = counts(), parts2 = [];
  ['chars', 'places', 'islands'].forEach((g) => { if (c[g]) parts2.push(c[g] + ' ' + names[g] + (c[g] > 1 ? 's' : '')); });
  if (c.more) parts2.push(c.more + ' other');
  $('count').textContent = parts2.length ? 'Selected: ' + parts2.join(', ') : 'Nothing selected';
  $('dl').disabled = !sel.size;
  const needsEngine = (c.places || c.islands || (c.chars && $('fmtJson').checked)) && !sel.has('engine');
  const hint = $('hint'); hint.hidden = !needsEngine;
  if (needsEngine) hint.innerHTML = 'Recipes need the island engine to be drawn. <button type="button" id="addEngine">Add the engine</button>';
}
$('hint').addEventListener('click', (e) => { if (e.target.id === 'addEngine') { const lb = more.querySelector('[data-key="engine"]'); lb._input.checked = true; sel.add('engine'); update(); } });
$('clear').addEventListener('click', () => { sel.clear(); document.querySelectorAll('.item input').forEach((i) => { i.checked = false; }); update(); });
document.querySelectorAll('[data-all]').forEach((b) => b.addEventListener('click', () => { groups[b.dataset.all].filter((lb) => !lb.hidden).forEach((lb) => { lb._input.checked = true; sel.add(lb.dataset.key); }); update(); }));
document.querySelectorAll('[data-none]').forEach((b) => b.addEventListener('click', () => { groups[b.dataset.none].forEach((lb) => { lb._input.checked = false; sel.delete(lb.dataset.key); }); update(); }));
['fmtPng', 'fmtJson'].forEach((id) => $(id).addEventListener('change', update));
function headCounts(shown) { ['chars', 'places', 'islands'].forEach((g) => { $('n-' + g).textContent = shown ? shown[g] + ' / ' + groups[g].length : String(groups[g].length); }); }
headCounts();
$('q').addEventListener('input', () => {
  const q = $('q').value.trim().toLowerCase(), shown = { chars: 0, places: 0, islands: 0 };
  document.querySelectorAll('.item').forEach((lb) => { const hit = !q || lb.dataset.search.includes(q); lb.hidden = !hit; });
  Object.keys(groups).forEach((g) => { shown[g] = groups[g].filter((lb) => !lb.hidden).length; }); headCounts(q ? shown : null);
});

// ---------- ZIP (yalnız depolama, bağımlılıksız) ----------
const CRC = (() => { const t = new Uint32Array(256); for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = (u8) => { let c = 0xffffffff; for (let i = 0; i < u8.length; i++) c = CRC[(c ^ u8[i]) & 255] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; };
function makeZip(files) {
  const enc = new TextEncoder(), d = new Date(), time = (d.getHours() << 11) | (d.getMinutes() << 5) | (d.getSeconds() >> 1), date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  const chunks = [], central = []; let offset = 0;
  files.forEach((f) => {
    const name = enc.encode(f.name), data = f.data, crc = crc32(data), lh = new DataView(new ArrayBuffer(30));
    [[0, 0x04034b50, 4], [4, 20, 2], [6, 0x0800, 2], [8, 0, 2], [10, time, 2], [12, date, 2], [14, crc, 4], [18, data.length, 4], [22, data.length, 4], [26, name.length, 2], [28, 0, 2]].forEach(([o, v, n]) => (n === 4 ? lh.setUint32(o, v, true) : lh.setUint16(o, v, true)));
    chunks.push(new Uint8Array(lh.buffer), name, data);
    const ch = new DataView(new ArrayBuffer(46));
    [[0, 0x02014b50, 4], [4, 20, 2], [6, 20, 2], [8, 0x0800, 2], [10, 0, 2], [12, time, 2], [14, date, 2], [16, crc, 4], [20, data.length, 4], [24, data.length, 4], [28, name.length, 2], [30, 0, 2], [32, 0, 2], [34, 0, 2], [36, 0, 2], [38, 0, 4], [42, offset, 4]].forEach(([o, v, n]) => (n === 4 ? ch.setUint32(o, v, true) : ch.setUint16(o, v, true)));
    central.push(new Uint8Array(ch.buffer), name);
    offset += 30 + name.length + data.length;
  });
  const cSize = central.reduce((a, c) => a + c.length, 0), end = new DataView(new ArrayBuffer(22));
  [[0, 0x06054b50, 4], [4, 0, 2], [6, 0, 2], [8, files.length, 2], [10, files.length, 2], [12, cSize, 4], [16, offset, 4], [20, 0, 2]].forEach(([o, v, n]) => (n === 4 ? end.setUint32(o, v, true) : end.setUint16(o, v, true)));
  return new Blob([...chunks, ...central, new Uint8Array(end.buffer)], { type: 'application/zip' });
}

// ---------- Paketi kur ----------
const ROOT = 'ima-lab-assets/', enc = new TextEncoder();
const text = (name, s) => ({ name: ROOT + name, data: enc.encode(s) });
const json = (name, o) => text(name, JSON.stringify(o, null, 2) + '\n');
async function fetchBytes(url) { const r = await fetch(url); if (!r.ok) throw new Error(url + ' ' + r.status); return new Uint8Array(await r.arrayBuffer()); }

async function build() {
  const files = [], notes = [], wantPng = $('fmtPng').checked, wantJson = $('fmtJson').checked;
  const keys = [...sel];
  for (const key of keys) {
    const [kind, id] = [key.split(':')[0], key.slice(key.indexOf(':') + 1)];
    if (kind === 'char') {
      const rec = CHARS.find((c) => c.id === id), s = slug(id.replace(/^char\./, ''));
      if (wantJson) files.push(json('characters/' + s + '.json', rec));
      if (wantPng) { let b = png.get(id); if (!b && draw) b = await draw.char(rec); if (b) files.push({ name: ROOT + 'characters/png/' + s + '.png', data: new Uint8Array(await b.arrayBuffer()) }); }
    } else if (kind === 'place') {
      const rec = PLACES.find((p) => p.place === id); files.push(json('places/' + rec.place + '-' + slug(rec.name) + '.json', rec));
    } else if (kind === 'island') {
      const f = ISLANDS.find(([i]) => i === id)[1]; files.push(json('islands/' + f + '.json', LIB.adalar[id]));
    } else if (key === 'style') files.push(json('style/montour.json', ST));
  }
  const fontKeys = keys.filter((k) => k.startsWith('font:')).map((k) => k.slice(5));
  if (fontKeys.length) {
    const css = await (await fetch('assets/fonts/fonts.css')).text(), want = [];
    for (const name of fontKeys) {
      const [, , ffiles, lic] = FONTS.find((f) => f[0] === name); want.push(...ffiles);
      for (const f of ffiles) files.push({ name: ROOT + 'fonts/' + f, data: await fetchBytes('assets/fonts/' + f) });
      files.push({ name: ROOT + 'fonts/licenses/' + lic, data: await fetchBytes('licenses/' + lic) });
    }
    const blocks = css.split('@font-face').slice(1).map((b) => '@font-face' + b).filter((b) => want.some((f) => b.includes('url(' + f + ')')));
    files.push(text('fonts/fonts.css', blocks.join('\n') + '\n'));
  }
  if (sel.has('engine')) for (const [from, to] of ENGINE_FILES) files.push({ name: ROOT + to, data: await fetchBytes(from) });
  files.unshift(text('README.md', readme(keys, wantPng, wantJson, files)));
  return makeZip(files);
}

function readme(keys, wantPng, wantJson, files) {
  const has = (p) => files.some((f) => f.name.startsWith(ROOT + p));
  const L = ['# Interactive Media Applications lab. — assets', '', 'Downloaded from https://mertseven.com/ima/lab/assets.html on ' + new Date().toISOString().slice(0, 10) + '.', '',
    'Designed by Mert Seven, PhD, in collaboration with Claude and ChatGPT. Use these in your course work and credit "Interactive Media Applications lab., Mert Seven, PhD". Fonts keep their own open licences (in fonts/licenses); three.js is MIT.', '', '## What is in this folder', ''];
  if (has('characters/png')) L.push('- `characters/png/` — character pictures (300 × 450, white background).');
  if (has('characters/') && wantJson) L.push('- `characters/*.json` — character recipes: parts, colours as role names, motion. Edit a recipe, then build it with `createParts(THREE, renderer).build(recipe, colors)`.');
  if (has('places')) L.push('- `places/*.json` — place recipes (shapes, patterns, characters placed inside). Build with `createStructures(THREE, parts).build(recipe, colors, makeChar)`.');
  if (has('islands')) L.push('- `islands/*.json` — island plans: coast, hills, zones, paths, places and items (houses, trees, lamps, boats, rocks, residents). Build with `createIslandKit(...).build(plan, palette)`.');
  if (has('style')) L.push('- `style/montour.json` — the island look: palette, thresholds, lights.');
  if (has('fonts')) L.push('- `fonts/` — the fonts you picked, a trimmed `fonts.css`, and their licences.');
  if (has('engine')) L.push('- `engine/` — the code that draws all of the above (plain JavaScript) and three.js. Load the scripts in this order: parcalar, gorunum, yapilar, arazi, ada-sahne. See island/ada-c2 on the live site for a complete example.');
  L.push('', '## Colours', '', 'Recipes never contain colour values. They use role names (`paper`, `ink`, `hot`, `cool`, `warm`, `green`, `pink`, `wood`, …) that the palette turns into colours. Change the palette and every recipe changes with it.', '',
    '## Selected', '', ...keys.map((k) => '- ' + k), '');
  return L.join('\n');
}

$('dl').addEventListener('click', async () => {
  const b = $('dl'), label = b.textContent; b.disabled = true; b.textContent = 'Building…'; $('fileNotice').hidden = true;
  try {
    const zip = await build(), a = el('a', { href: URL.createObjectURL(zip), download: 'ima-lab-assets.zip' });
    document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  } catch (e) { console.error(e); $('fileNotice').hidden = false; $('fileNotice').scrollIntoView({ block: 'center' }); }
  b.textContent = label; update();
});
update();
window.__assets = { sel, png, build, makeZip };
