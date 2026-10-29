/* Giriş sayfası — LAB / MAP
   1. LAB / MAP sözcüklerinin değişken genişliği
   2. LAB: krom küre. Küre gerçek bir ayna: içinde prosedürel bir galeri
      yansıyor, galerinin duvarlarında lab'ın sekiz karakteri asılı.
   3. MAP: yırtık kâğıt kolaj. Dağlar ve atlas kartları canvas'ta çiziliyor;
      yırtık kenarlar her parçaya tohumla üretilen clip-path. */
import * as THREE from './lab/assets/vendor/three.module.js';

const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
const DPR = Math.min(2, window.devicePixelRatio || 1);
const TAU = Math.PI * 2;

function mulberry(a){ return function(){ a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a);
  t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }

/* ==================================================================
   1. DEĞİŞKEN GENİŞLİK — LAB ve MAP sözcükleri yarının genişliğine oturur
   Yazı boyu afişin YÜKSEKLİĞİNE bağlı (CSS, cqh); genişlik ise fontun wdth
   ekseniyle karşılanır. Yarı genişleyince harfler açılır, daralınca sıkışır.
   Sözcüğün eni wdth ile neredeyse doğrusal: eksenin iki ucunda bir kez
   ölçülür, aradaki değer doğrusal aradeğerle bulunur. Yazı boyu değişmedikçe
   yeniden ölçülmez, yani geçiş boyunca her karede iki satır stil yazımı.
================================================================== */
const vfits = [...document.querySelectorAll('.vfit')].map(el => {
  const [lo, hi] = el.dataset.axis.split(' ').map(Number);
  return { el, lo, hi, fit:+el.dataset.fit, poster:el.closest('.poster'), fs:'', w0:0, w1:0 };
});
const setW = (el, w) => { el.style.fontVariationSettings = `"wdth" ${w.toFixed(1)}`; };
function fitWords(){
  for(const v of vfits){
    const fs = getComputedStyle(v.el).fontSize;
    if(fs !== v.fs){
      v.fs = fs;
      setW(v.el, v.lo); v.w0 = v.el.getBoundingClientRect().width;
      setW(v.el, v.hi); v.w1 = v.el.getBoundingClientRect().width;
    }
    // Bir düzen hedef genişliği CSS'ten değiştirebilir (--fit), yoksa data-fit.
    const target = v.poster.clientWidth * (parseFloat(getComputedStyle(v.el).getPropertyValue('--fit')) || v.fit);
    const t = Math.max(0, Math.min(1, (target - v.w0) / ((v.w1 - v.w0) || 1)));
    setW(v.el, v.lo + t*(v.hi - v.lo));
    v.el.setAttribute('data-fit-ready', '');
  }
}
const fitRO = new ResizeObserver(fitWords);
document.fonts.ready.then(() => {
  vfits.forEach(v => fitRO.observe(v.poster));
  fitWords();
});
/* Font geç gelirse (ağ yavaşsa) ölçümler eski fonttan kalmasın. */
document.fonts.addEventListener('loadingdone', () => { vfits.forEach(v => v.fs = ''); fitWords(); });
window.giris = { fitWords, vfits };

/* ==================================================================
   2. LAB — KROM KÜRE
================================================================== */
function canvasTex(w, h, draw){
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace;
  t.redraw = () => { draw(g, w, h); t.needsUpdate = true; };
  return t;
}
const CAST = ['traveler','owl','clockmaker','ghost','sandkid','gardener','conductor','keeper'];
const castImgs = CAST.map(n => { const im = new Image(); im.src = `lab/assets/characters/${n}.png`; return im; });

function paintWall(g, w, h, frames){
  g.fillStyle = '#b9b9b4'; g.fillRect(0,0,w,h);
  const lg = g.createLinearGradient(0,0,0,h);
  lg.addColorStop(0,'rgba(0,0,0,.12)'); lg.addColorStop(.25,'rgba(0,0,0,0)'); lg.addColorStop(1,'rgba(0,0,0,.08)');
  g.fillStyle = lg; g.fillRect(0,0,w,h);
  g.fillStyle = '#5c5c58'; g.fillRect(0, h*.84, w, h*.16);          // lambri
  g.fillStyle = '#5e5e59'; g.fillRect(0, h*.855, w, h*.012);
  g.fillStyle = '#a9a9a4'; g.fillRect(0, h*.05, w, h*.02);           // korniş
  frames.forEach(([cx, img]) => {
    const fw = w*.12, fh = h*.42, x = cx*w - fw/2, y = h*.3;
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x+6, y+8, fw, fh);
    g.fillStyle = '#2f2f2c'; g.fillRect(x, y, fw, fh);
    g.fillStyle = '#efede7'; g.fillRect(x+fw*.08, y+fw*.08, fw*.84, fh-fw*.16);
    if(img && img.complete && img.naturalWidth){
      const bw = fw*.7, bh = fh-fw*.3, s = Math.min(bw/img.naturalWidth, bh/img.naturalHeight);
      const iw = img.naturalWidth*s, ih = img.naturalHeight*s;
      g.globalCompositeOperation = 'multiply'; g.filter = 'grayscale(1) contrast(1.15)';
      g.drawImage(img, x+(fw-iw)/2, y+(fh-ih)/2, iw, ih);
      g.globalCompositeOperation = 'source-over'; g.filter = 'none';
    }
  });
}
function paintWindowWall(g, w, h){
  g.fillStyle = '#bdbdb8'; g.fillRect(0,0,w,h);
  g.fillStyle = '#5c5c58'; g.fillRect(0, h*.84, w, h*.16);
  const win = (x, ww, top, bot, arch) => {
    g.fillStyle = '#3c3c38'; g.fillRect(x-6, top-6, ww+12, bot-top+12);
    g.clearRect(x, top, ww, bot-top);                          // cam: saydam, arkasında dış düzlem
    g.strokeStyle = '#4a4a46'; g.lineWidth = 5;
    for(let i=1;i<3;i++){ g.beginPath(); g.moveTo(x+ww*i/3, top); g.lineTo(x+ww*i/3, bot); g.stroke(); }
    for(let j=1;j<5;j++){ g.beginPath(); g.moveTo(x, top+(bot-top)*j/5); g.lineTo(x+ww, top+(bot-top)*j/5); g.stroke(); }
    if(arch){ g.fillStyle = '#d3d3ce'; g.fillRect(x-8, top-8, ww+16, 0); }
  };
  win(w*.1, w*.16, h*.14, h*.8);
  win(w*.74, w*.16, h*.14, h*.8);
  // orta kapı: koyu kasa, camlı kanatlar
  const dx = w*.4, dw = w*.2;
  g.fillStyle = '#2b2b28'; g.fillRect(dx-10, h*.24, dw+20, h*.62+10);
  g.clearRect(dx, h*.26, dw, h*.6);
  g.strokeStyle = '#3a3a36'; g.lineWidth = 7;
  g.beginPath(); g.moveTo(dx+dw/2, h*.26); g.lineTo(dx+dw/2, h*.86); g.stroke();
  for(let j=1;j<4;j++){ g.beginPath(); g.moveTo(dx, h*.26+h*.6*j/4); g.lineTo(dx+dw, h*.26+h*.6*j/4); g.stroke(); }
  g.clearRect(dx, h*.07, dw, h*.13);                                 // kapı üstü pencere
  g.strokeRect(dx, h*.07, dw, h*.13);
}
function paintFloor(g, w, h){
  const n = 8, s = w/n;
  for(let i=0;i<n;i++) for(let j=0;j<n;j++){
    g.fillStyle = (i+j)%2 ? '#8a8a85' : '#3e3e3b'; g.fillRect(i*s, j*s, s, s);
  }
  g.strokeStyle = 'rgba(0,0,0,.25)'; g.lineWidth = 2;
  for(let i=0;i<=n;i++){ g.beginPath(); g.moveTo(i*s,0); g.lineTo(i*s,h); g.stroke(); g.beginPath(); g.moveTo(0,i*s); g.lineTo(w,i*s); g.stroke(); }
}
function paintCeiling(g, w, h){
  g.fillStyle = '#b8b8b3'; g.fillRect(0,0,w,h);
  const x0 = w*.22, y0 = h*.18, ww = w*.56, hh = h*.64;
  g.fillStyle = '#ffffff'; g.fillRect(x0, y0, ww, hh);
  g.strokeStyle = '#55554f'; g.lineWidth = 6;
  for(let i=0;i<=4;i++){ g.beginPath(); g.moveTo(x0+ww*i/4, y0); g.lineTo(x0+ww*i/4, y0+hh); g.stroke(); }
  for(let j=0;j<=6;j++){ g.beginPath(); g.moveTo(x0, y0+hh*j/6); g.lineTo(x0+ww, y0+hh*j/6); g.stroke(); }
  g.strokeStyle = '#8e8e89'; g.lineWidth = 14; g.strokeRect(x0-16, y0-16, ww+32, hh+32);
}
function radialTex(stops){
  return canvasTex(256, 256, (g, w) => {
    const gr = g.createRadialGradient(w/2, w/2, 0, w/2, w/2, w/2);
    stops.forEach(([o, c]) => gr.addColorStop(o, c));
    g.fillStyle = gr; g.fillRect(0, 0, w, w);
  });
}

function mountSphere(host){
  let renderer;
  try{ renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true, powerPreference:'low-power' }); }
  catch(e){ return; }                                   // WebGL yoksa CSS küre kalır
  renderer.setPixelRatio(DPR);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);

  /* --- yansıyan galeri (yalnız küp kameranın gördüğü sahne) --- */
  const room = new THREE.Scene();
  room.background = new THREE.Color(0xa8a8a3);
  const hall = new THREE.Group(); room.add(hall);
  const FY = -1.5, CY = 5.2, HX = 7, HZ = 10, WH = CY - FY;
  const basic = map => new THREE.MeshBasicMaterial({ map, side:THREE.DoubleSide });

  const floorTex = canvasTex(1024, 1024, paintFloor);
  floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(3.5, 5);
  floorTex.anisotropy = 8;
  const floor = new THREE.Mesh(new THREE.PlaneGeometry(HX*2, HZ*2), basic(floorTex));
  floor.rotation.x = -Math.PI/2; floor.position.y = FY; hall.add(floor);

  const ceil = new THREE.Mesh(new THREE.PlaneGeometry(HX*2, HZ*2), basic(canvasTex(1024, 1024, paintCeiling)));
  ceil.rotation.x = Math.PI/2; ceil.position.y = CY; hall.add(ceil);

  const sideA = canvasTex(2048, 700, (g,w,h) => paintWall(g,w,h,[[.2,castImgs[0]],[.4,castImgs[1]],[.6,castImgs[2]],[.8,castImgs[3]]]));
  const sideB = canvasTex(2048, 700, (g,w,h) => paintWall(g,w,h,[[.2,castImgs[4]],[.4,castImgs[5]],[.6,castImgs[6]],[.8,castImgs[7]]]));
  const backT = canvasTex(1400, 700, (g,w,h) => paintWall(g,w,h,[[.5,null]]));
  const frontT = canvasTex(1400, 700, paintWindowWall);
  const wall = (tex, w, x, z, ry) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(w, WH), basic(tex));
    m.position.set(x, (FY+CY)/2, z); m.rotation.y = ry; hall.add(m); return m;
  };
  wall(sideA, HZ*2, -HX, 0,  Math.PI/2);
  wall(sideB, HZ*2,  HX, 0, -Math.PI/2);
  wall(backT, HX*2, 0, -HZ, 0);
  wall(frontT, HX*2, 0,  HZ, Math.PI).material.alphaTest = .5;   // izleyicinin arkası → kürenin ortasında görünür
  /* Pencerelerin ardında ada: deniz fenerinin fener odasından gece görüntüsü (arac/ada-pencere.mjs).
     Kürenin ortasında, yansıyan camlarda renkli görünür; geçişte de aynı pencereden bakılır.
     Görüntü gelene dek düz beyaz. Salonla birlikte döner. */
  const outside = new THREE.Mesh(new THREE.PlaneGeometry(56, 28), new THREE.MeshBasicMaterial({ color:0xffffff }));
  new THREE.TextureLoader().load(new URL('ada-gece.webp', import.meta.url).href, (tex) => {
    tex.colorSpace = THREE.SRGBColorSpace; outside.material.map = tex; outside.material.needsUpdate = true;
    if(reduced) draw();
  });
  outside.position.set(0, 1.5, HZ + 14); outside.rotation.y = Math.PI; hall.add(outside);
  castImgs.forEach(im => im.addEventListener('load', () => { sideA.redraw(); sideB.redraw(); }));

  const cubeRT = new THREE.WebGLCubeRenderTarget(512, { generateMipmaps:true, minFilter:THREE.LinearMipmapLinearFilter });
  cubeRT.texture.colorSpace = THREE.SRGBColorSpace;
  const cubeCam = new THREE.CubeCamera(.05, 100, cubeRT);
  room.add(cubeCam);                       // gruba DEĞİL: grup dönünce yansıma dönsün

  /* --- görünen sahne: küre + gölge --- */
  const scene = new THREE.Scene();
  const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 128, 96),
                                new THREE.MeshBasicMaterial({ envMap:cubeRT.texture }));
  scene.add(sphere);
  const shadow = (size, stops, y) => {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(size, size),
      new THREE.MeshBasicMaterial({ map:radialTex(stops), transparent:true, depthWrite:false }));
    m.rotation.x = -Math.PI/2; m.position.y = y; scene.add(m);
  };
  shadow(3.6, [[0,'rgba(0,0,0,.42)'],[.35,'rgba(0,0,0,.16)'],[1,'rgba(0,0,0,0)']], -1.0);
  shadow(1.5, [[0,'rgba(0,0,0,.7)'],[.4,'rgba(0,0,0,.25)'],[1,'rgba(0,0,0,0)']], -0.995);

  const cam = new THREE.PerspectiveCamera(31, 1, .1, 50);
  cam.position.set(0, .5, 4.7); cam.lookAt(0, -.16, 0);

  let W = 0, H = 0;
  new ResizeObserver(() => {
    const r = host.getBoundingClientRect();
    W = Math.max(1, Math.round(r.width)); H = Math.max(1, Math.round(r.height));
    renderer.setSize(W, H, false); cam.aspect = W/H; cam.updateProjectionMatrix();
    if(reduced) draw();
  }).observe(host);

  /* fareyle hafif dönüş; kendi kendine çok yavaş döner */
  const poster = host.closest('.poster');
  let tx = 0, ty = 0, yaw = .35, pitch = 0, spin = 0, hot = 0;
  poster.addEventListener('pointermove', e => {
    const r = poster.getBoundingClientRect();
    tx = ((e.clientX - r.left)/r.width - .5); ty = ((e.clientY - r.top)/r.height - .5);
  });
  poster.addEventListener('pointerenter', () => hot = 1);
  poster.addEventListener('pointerleave', () => { hot = 0; tx = ty = 0; if(reduced) draw(); });

  function draw(){
    hall.rotation.y = yaw + spin;
    hall.rotation.x = pitch;
    cubeCam.update(renderer, room);
    renderer.render(scene, cam);
  }
  let visible = true, last = 0, raf = 0;
  /* Geçiş (gecis.js) küreyi devralabilir: sürücü varken her kareyi o çizer. */
  let driver = null;
  new IntersectionObserver(es => { visible = es[0].isIntersecting; if(visible && !raf) loop(performance.now()); })
    .observe(host);
  function loop(now){
    raf = 0;
    if((!visible && !driver) || document.hidden) return;
    const dt = last ? Math.min(.05, (now - last)/1000) : .016; last = now;
    if(driver){ driver(dt, now); raf = requestAnimationFrame(loop); return; }
    if(!reduced) spin += dt*(.05 + hot*.07);
    yaw   += ((.35 + tx*1.1) - yaw) * Math.min(1, dt*4);
    pitch += ((ty*.22) - pitch) * Math.min(1, dt*4);
    draw();
    if(!reduced) raf = requestAnimationFrame(loop);
  }
  document.addEventListener('visibilitychange', () => { if(!document.hidden && !raf){ last = 0; loop(performance.now()); } });
  draw();
  host.setAttribute('data-ready', '');
  host.sphereApi = { renderer, scene, room, hall, cam, cubeCam, sphere, cubeRT, outside, HZ,
    drive(fn){ driver = fn; last = 0; if(!raf) raf = requestAnimationFrame(loop); },
    release(){
      driver = null; renderer.domElement.style.filter = '';
      cam.fov = 31; cam.up.set(0, 1, 0); cam.position.set(0, .5, 4.7); cam.lookAt(0, -.16, 0);
      cam.aspect = W/H; cam.updateProjectionMatrix(); draw();
    } };
  if(!reduced) raf = requestAnimationFrame(loop);
  poster.addEventListener('pointermove', () => { if(reduced) draw(); });
}

/* ==================================================================
   3. MAP — YIRTIK KOLAJ
================================================================== */
function fbm1(n, seed, oct, rough){
  const r = mulberry(seed), out = new Float32Array(n);
  let amp = 1, total = 0;
  for(let o=0;o<oct;o++){
    const cells = 2 << o, p = Array.from({length:cells+2}, r);
    for(let i=0;i<n;i++){
      const f = i/(n-1)*cells, k = Math.floor(f), t = f-k, s = t*t*(3-2*t);
      out[i] += amp*(p[k]*(1-s) + p[k+1]*s);
    }
    total += amp; amp *= rough;
  }
  let mn = 1e9, mx = -1e9;
  for(let i=0;i<n;i++){ out[i] /= total; mn = Math.min(mn,out[i]); mx = Math.max(mx,out[i]); }
  for(let i=0;i<n;i++) out[i] = (out[i]-mn)/(mx-mn||1);
  return out;
}
function grain(g, W, H, amt){
  const id = g.getImageData(0,0,W,H), d = id.data;
  for(let i=0;i<d.length;i+=4){ const n = (Math.random()-.5)*amt; d[i]+=n; d[i+1]+=n; d[i+2]+=n; }
  g.putImageData(id, 0, 0);
}
const gray = v => `rgb(${v},${v},${v})`;

const RANGES = {
  peaks:{ sky:['#e6e6e2','#cfcfca'], haze:'rgba(232,232,228,.22)', shade:'20,20,18', layers:[
    {base:.80, amp:.66, tone:186, peak:1.75, snow:1},
    {base:.92, amp:.46, tone:136, peak:1.45, snow:.7},
    {base:1.04,amp:.32, tone:84,  peak:1.2,  snow:0}]},
  range:{ sky:['#cdcdc8','#b2b2ac'], haze:'rgba(214,214,209,.2)', shade:'10,10,9', layers:[
    {base:.58, amp:.46, tone:158, peak:1.6, snow:1},
    {base:.80, amp:.50, tone:96,  peak:1.35, snow:.45},
    {base:1.02,amp:.40, tone:44,  peak:1.15, snow:0}]}
};

function drawPeaks(g, W, H, seed, cfg){
  const r = mulberry(seed*97+1);
  const sky = g.createLinearGradient(0,0,0,H);
  sky.addColorStop(0, cfg.sky[0]); sky.addColorStop(1, cfg.sky[1]);
  g.fillStyle = sky; g.fillRect(0,0,W,H);
  for(let i=0;i<7;i++){                                   // bulut lekeleri
    const x = r()*W, y = r()*H*.45, rx = W*(.06+r()*.14);
    g.save(); g.translate(x,y); g.scale(1,.2);
    const gr = g.createRadialGradient(0,0,0,0,0,rx);
    gr.addColorStop(0,'rgba(255,255,255,.5)'); gr.addColorStop(1,'rgba(255,255,255,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(0,0,rx,0,TAU); g.fill(); g.restore();
  }
  const step = Math.max(1, Math.round(1.1*DPR));
  cfg.layers.forEach((ly, li) => {
    const n = Math.ceil(W)+3, v = fbm1(n, seed*31+li*7, 8, .56), y = new Float32Array(n);
    for(let i=0;i<n;i++) y[i] = H*(ly.base - ly.amp*Math.pow(v[i], ly.peak));
    if(li){ g.fillStyle = cfg.haze; g.fillRect(0,0,W,H); }
    g.fillStyle = gray(ly.tone);
    g.beginPath(); g.moveTo(0,H); for(let i=0;i<n;i++) g.lineTo(i,y[i]); g.lineTo(W,H); g.closePath(); g.fill();
    for(let x=2;x<n-2;x+=step){
      const s = (y[x+2]-y[x-2])/4, depth = (H-y[x])*(.25+r()*.65);
      if(s > .04){                                           // gölgedeki yamaç
        g.strokeStyle = `rgba(${cfg.shade},${Math.min(.72,.12+s*.55)})`;
        g.lineWidth = step*(.6+r()*.9);
        g.beginPath(); g.moveTo(x,y[x]); g.lineTo(x + depth*.18*(r()-.25), y[x]+depth); g.stroke();
      } else if(s < -.04 && ly.snow){                        // aydınlık yamaçta kar
        const len = depth*(.12+r()*.4)*ly.snow;
        g.strokeStyle = `rgba(255,255,255,${.3+r()*.55})`;
        g.lineWidth = step*(.5+r()*.8);
        g.beginPath(); g.moveTo(x,y[x]+1); g.lineTo(x - s*len*.35, y[x]+len); g.stroke();
      }
      if(r() < .035){                                        // yarık
        g.strokeStyle = `rgba(${cfg.shade},.45)`; g.lineWidth = step*.7;
        const y0 = y[x] + depth*.15*r();
        g.beginPath(); g.moveTo(x,y0); g.lineTo(x+(r()-.5)*depth*.35, y0+depth*(.3+r()*.4)); g.stroke();
      }
    }
    g.strokeStyle = 'rgba(0,0,0,.42)'; g.lineWidth = DPR;
    g.beginPath(); for(let i=0;i<n;i++) i ? g.lineTo(i,y[i]) : g.moveTo(i,y[i]); g.stroke();
  });
  grain(g, W, H, 26);
}

/* Atlasın kendi kartları — gri tonda, bir şerit hâlinde. */
const CARDS = [['Leaflet','tiles',1],['D3.js','bars',23],['Three.js','orbit',61],['p5.js','wave',88],
  ['Tone.js','sound',112],['Matter.js','net',74],['Turf.js','tiles',11],['GSAP','wave',97],
  ['Cytoscape.js','net',40],['Chart.js','bars',19]];
function rr(g,x,y,w,h,r){ g.beginPath(); g.moveTo(x+r,y); g.arcTo(x+w,y,x+w,y+h,r); g.arcTo(x+w,y+h,x,y+h,r);
  g.arcTo(x,y+h,x,y,r); g.arcTo(x,y,x+w,y,r); g.closePath(); }
function glyph(g, kind, x, y, s, r){
  g.save(); g.translate(x,y); g.strokeStyle = g.fillStyle = '#161615';
  g.lineWidth = Math.max(1.5, s*.016); g.lineCap = 'round';
  if(kind==='tiles'){
    const n=4, c=s/n; g.globalAlpha=.25;
    for(let i=0;i<n;i++)for(let j=0;j<n;j++) if((i*3+j+(r()*3|0))%3===0) g.fillRect(i*c+2,j*c+2,c-4,c-4);
    g.globalAlpha=1; g.beginPath(); g.moveTo(s*.1,s*.8);
    g.bezierCurveTo(s*.3,s*.3,s*.6,s*.9,s*.88,s*.22); g.stroke();
    g.beginPath(); g.arc(s*.88,s*.22,s*.045,0,TAU); g.fill();
  } else if(kind==='bars'){
    const n=6; for(let i=0;i<n;i++){ const h=s*(.2+r()*.65); g.fillRect(s*.1+i*s*.14, s*.9-h, s*.09, h); }
    g.beginPath(); g.moveTo(s*.06,s*.9); g.lineTo(s*.94,s*.9); g.stroke();
  } else if(kind==='orbit'){
    g.beginPath(); g.arc(s/2,s/2,s*.12,0,TAU); g.fill();
    for(let k=0;k<3;k++){ g.beginPath(); g.ellipse(s/2,s/2,s*(.22+k*.11),s*(.1+k*.06),k*.6,0,TAU); g.stroke(); }
  } else if(kind==='wave'){
    for(let k=0;k<3;k++){ g.globalAlpha=1-k*.3; g.beginPath();
      for(let i=0;i<=40;i++){ const t=i/40; const yy=s*.5+Math.sin(t*TAU*1.5+k*.8)*s*(.28-k*.06); i?g.lineTo(s*.05+t*s*.9,yy):g.moveTo(s*.05,yy); }
      g.stroke(); }
    g.globalAlpha=1;
  } else if(kind==='sound'){
    for(let i=0;i<22;i++){ const h=s*(.08+Math.abs(Math.sin(i*.7+r()))*.38); g.fillRect(s*.07+i*s*.04, s*.5-h/2, s*.022, h); }
  } else {
    const P=Array.from({length:7},()=>[s*(.12+r()*.76),s*(.12+r()*.76)]);
    g.globalAlpha=.6; P.forEach((p,i)=>P.slice(i+1).forEach(q=>{ if(r()<.4){ g.beginPath(); g.moveTo(p[0],p[1]); g.lineTo(q[0],q[1]); g.stroke(); } }));
    g.globalAlpha=1; P.forEach(p=>{ g.beginPath(); g.arc(p[0],p[1],s*.04,0,TAU); g.fill(); });
  }
  g.restore();
}
function drawCards(g, W, H, seed){
  const r = mulberry(seed*13+3);
  g.fillStyle = '#d6d4ce'; g.fillRect(0,0,W,H);
  g.fillStyle = 'rgba(0,0,0,.16)';
  const gs = 10*DPR; for(let x=gs/2;x<W;x+=gs) for(let y=gs/2;y<H;y+=gs) g.fillRect(x,y,1.2*DPR,1.2*DPR);
  const ch = H*.8, cw = ch*.66, rad = ch*.035;
  let x = -cw*.35 + r()*cw*.3, i = (seed % CARDS.length);
  while(x < W){
    const [name, kind, num] = CARDS[i++ % CARDS.length];
    const cy = H*.1 + (r()-.5)*H*.1, rot = (r()-.5)*.07;
    g.save(); g.translate(x+cw/2, cy+ch/2); g.rotate(rot); g.translate(-cw/2, -ch/2);
    g.fillStyle = 'rgba(0,0,0,.2)'; rr(g, 5*DPR, 7*DPR, cw, ch, rad); g.fill();
    g.fillStyle = '#efede8'; rr(g, 0, 0, cw, ch, rad); g.fill();
    g.lineWidth = Math.max(1.5, ch*.008); g.strokeStyle = '#161615'; g.stroke();
    g.fillStyle = '#161615'; g.textBaseline = 'alphabetic';
    g.font = `700 ${ch*.075}px "DM Sans", Arial, sans-serif`; g.fillText(name, cw*.08, ch*.13);
    g.font = `400 ${ch*.042}px "IBM Plex Mono", monospace`; g.textAlign = 'right';
    g.fillText(String(num).padStart(3,'0'), cw*.92, ch*.125); g.textAlign = 'left';
    const px = cw*.08, py = ch*.19, ps = cw*.84;
    g.fillStyle = 'rgba(0,0,0,.2)';
    for(let a=px+6;a<px+ps;a+=ps/14) for(let b=py+6;b<py+ps;b+=ps/14) g.fillRect(a,b,1.3*DPR,1.3*DPR);
    glyph(g, kind, px+ps*.08, py+ps*.08, ps*.84, r);
    g.fillStyle = 'rgba(22,22,21,.5)';
    g.fillRect(px, py+ps+ch*.06, cw*.78, ch*.022); g.fillRect(px, py+ps+ch*.105, cw*.6, ch*.022);
    g.restore();
    x += cw*1.14;
  }
  grain(g, W, H, 22);
}

/* Yırtık şerit: üst ve alt kenarı tırtıklı, uçları afişin dışında kalır. */
function tornStrip(r, inset, amp){
  const top = [], bot = [], p1 = r()*TAU, p2 = r()*TAU;
  for(let x=0; x<100; x += .35 + r()*1.4){
    top.push([x, inset + amp*(.55+.45*Math.sin(x*.09+p1))*(.45+r()*.55)]);
    bot.push([x, 100 - inset - amp*(.55+.45*Math.sin(x*.08+p2))*(.45+r()*.55)]);
  }
  top.push([100, inset + r()*amp]); bot.push([100, 100 - inset - r()*amp]);
  return 'polygon(' + [...top, ...bot.reverse()].map(([x,y]) => `${x.toFixed(2)}% ${y.toFixed(2)}%`).join(',') + ')';
}

function mountCollage(){
  const scraps = [...document.querySelectorAll('.scrap')];
  scraps.forEach(sc => {
    const seed = +sc.dataset.seed, r = mulberry(seed);
    sc.querySelector('.scrap__rim').style.clipPath = tornStrip(r, 1, 5);
    sc.querySelector('canvas').style.clipPath   = tornStrip(r, 4.2, 4.5);
  });
  const paint = sc => {
    const cv = sc.querySelector('canvas'), rect = cv.getBoundingClientRect();
    const W = Math.round(rect.width*DPR), H = Math.round(rect.height*DPR);
    if(W < 4 || H < 4 || (cv.width === W && cv.height === H)) return;
    cv.width = W; cv.height = H;
    const g = cv.getContext('2d', { willReadFrequently:true }), seed = +sc.dataset.seed, kind = cv.dataset.draw;
    if(kind === 'cards') drawCards(g, W, H, seed);
    else drawPeaks(g, W, H, seed, RANGES[kind]);
  };
  /* Düzenler arası geçişte boyut sürekli değişiyor; her karede yeniden
     çizmek yerine canvas esnetilir, durunca bir kez çizilir. */
  const timers = new Map();
  const ro = new ResizeObserver(es => es.forEach(e => {
    const sc = e.target;
    clearTimeout(timers.get(sc));
    timers.set(sc, setTimeout(() => paint(sc), sc.querySelector('canvas').width ? 220 : 0));
  }));
  document.fonts.ready.then(() => scraps.forEach(sc => ro.observe(sc)));
}

mountSphere(document.querySelector('[data-sphere]'));
mountCollage();
import('./gecis.js');
