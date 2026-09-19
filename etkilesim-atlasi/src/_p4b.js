
/* ------------------------------------------------------------------
   5. TEMA JETONLARI
------------------------------------------------------------------ */
const cssVar = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
let INK = "#161615";
const TOK = {};
function readTokens(){
  INK = cssVar("--ink") || "#161615";
  TOK.faint = cssVar("--ui-faint") || "#888880";
  TOK.ink   = cssVar("--ui-ink")   || "#EDEAE0";
  TOK.line  = cssVar("--rail-line")|| "#2C2C29";
  CAT_KEYS.forEach(k => TOK[k] = cssVar("--cat-"+k));
}
readTokens();
matchMedia("(prefers-color-scheme: dark)").addEventListener("change",()=>setTimeout(readTokens,30));
new MutationObserver(()=>setTimeout(readTokens,30))
  .observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]});

/* ------------------------------------------------------------------
   6. MANZARA GEOMETRİSİ
------------------------------------------------------------------ */
const CARD_W = 300, CARD_H = 431, GAP = 26;

const stage = document.getElementById("stage");
const world = document.getElementById("world");
const hudEl = document.getElementById("hud");
const N = LIBS.length;

/* Manzara, kartların kapladığı toplam alanın ~1,85 katı açılır ve 5:3 yatay
   orana oturtulur. Daha dar bir yayılımda çakışmasız yerleşim matematiksel
   olarak imkânsızdır: ayrıştırıcı çakışmalı bir dengede kalır. Dar başlayıp
   büyütmek ise boş kenarları da ölçeklediği için gereğinden fazla şişirir.
   Katalog büyüdükçe manzara kendiliğinden genişler. */
const AREA = N*(CARD_W+GAP)*(CARD_H+GAP)*1.85;
const RATIO = 2.4;   /* ayrıştırma dikeyde yükselti kattığı için baştan daha yatay açılır */
const SPREAD_X = Math.sqrt(AREA*RATIO)/2, SPREAD_Y = Math.sqrt(AREA/RATIO)/2;
document.getElementById("nCount").textContent = N;

let POS = new Float64Array(N*2);      /* gömülüm, [-1,1] */
let LAY = new Float64Array(N*2);      /* dünya px, kart merkezleri */
let view = { k:0.9, tx:0, ty:0 };
let VW=0, VH=0;
let sel=-1, hoverIdx=-1, query="", onlyLive=false, active=new Set(CAT_KEYS);
let regionsDirty=true; const regionEls={}, labelEls={};
/* Yüksek boyuttaki komşuluk sıralamaları ve haritanın onları ne kadar koruduğu */
let hiOrder=null, hiRank=null, trustScore=0, linkG=null, linkTarget=-2;
const liveMap = new Map();     /* kart indeksi -> {key, stop, token} */
let liveToken = 0;
const pinned = new Set();          /* elle yerleştirilmiş kartlar */
let dragCard = null;

/* Kütüphanenin kendisi cdnjs'ten yüklenip kartın içinde çalışabildiği kartlar.
   Dış görsel/yazı tipi/ağ isteği gerektirmeyenlerle sınırlı — CSP yalnız script'e izin veriyor. */
const DEMO_OF = {
  "Matter.js":"matter", "Chart.js":"chart", "D3.js":"d3", "Zdog":"zdog",
  "Rough.js":"rough", "Two.js":"two", "Konva":"konva", "anime.js":"anime", "Turf.js":"turf",
  "Three.js":"three", "PixiJS":"pixi", "p5.js":"p5", "Tone.js":"tone",
  "GSAP":"gsap", "Interact.js":"interact", "ECharts":"echarts",
  "Cytoscape.js":"cyto", "Observable Plot":"plot", "Fabric.js":"fabric",
  "Paper.js":"paper", "Arquero":"arquero", "H3-js":"h3",
  "TensorFlow.js":"tfjs", "d3-force":"d3force",
  "Lottie-web":"lottie", "Lenis":"lenis", "Swiper":"swiper", "MapLibre GL JS":"maplibre"
};

/* Kanatta ne yapabileceğinizi söyleyen tek satır. */
const HINTS = {
  matter:"Kutuları sürükleyip fırlatın; fizik gerçek.",
  cyto:"Düğümleri sürükleyin, tekerlekle yakınlaşın.",
  fabric:"Nesneleri seçin, taşıyın, döndürün.",
  konva:"Kareleri sürükleyin.",
  interact:"Kutuyu sürükleyin — kart yerinde kalır.",
  maplibre:"Haritayı sürükleyin, tekerlekle yakınlaşın. Karolar sayfa içinde üretildi.",
  swiper:"Kaydırın ya da sürükleyin.",
  lenis:"Tekerlekle kaydırın; yumuşatmayı Lenis yapıyor.",
  tone:"Sesi başlatın, dizi çalarken dalga formunu izleyin.",
  tfjs:"Ağ burada eğitiliyor; eğri veriye oturana kadar izleyin.",
  three:"Aynı sahne, daha büyük tuvalde.",
  echarts:"Veri her iki saniyede değişiyor; geçişi ECharts yönetiyor."
};
const DEFAULT_HINT = "Kütüphanenin kendisi burada, tam boyutta çalışıyor.";
let wingIdx = -1;
let solver=null, solving=false, perplexity=18, klNow=0;
const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

function solveNow(perp, iters){
  const s = makeSolver(X, perp, 20260907);
  for(let i=0;i<iters;i++) s.step();
  POS = fitted(s.Y, N); klNow = s.kl;
}

function spread(into){
  for(let i=0;i<N;i++){ into[i*2]=POS[i*2]*SPREAD_X; into[i*2+1]=POS[i*2+1]*SPREAD_Y; }
}

/* Kaç kart çifti hâlâ çakışıyor? Yerleşimin bittiğini bundan anlıyoruz. */
function overlaps(p){
  const w=CARD_W+GAP-1, h=CARD_H+GAP-1;
  let n=0;
  for(let i=0;i<N;i++)for(let j=i+1;j<N;j++)
    if(Math.abs(p[j*2]-p[i*2])<w && Math.abs(p[j*2+1]-p[i*2+1])<h) n++;
  return n;
}

/* Kartlar dikdörtgen: en az örtüşen eksen boyunca ittirilirler.
   Yapıyı koruyan çekim iterasyonlar boyunca sönümlenip sıfırlanır — böylece
   son adımlarda ayrıştırma kayıtsız şartsız kazanır ve çakışma kalmaz.
   `fixed` kümesindeki kartlar (elle yerleştirilenler) yerinden oynamaz. */
function relax(p, iters, fixed){
  const w=CARD_W+GAP, h=CARD_H+GAP, anchor=Float64Array.from(p);
  const decay = iters*0.6;
  for(let it=0; it<iters; it++){
    let worst=0;
    for(let i=0;i<N;i++)for(let j=i+1;j<N;j++){
      const fi = fixed && fixed.has(i), fj = fixed && fixed.has(j);
      if(fi && fj) continue;
      const dx=p[j*2]-p[i*2], dy=p[j*2+1]-p[i*2+1];
      const ox=w-Math.abs(dx), oy=h-Math.abs(dy);
      if(ox<=0 || oy<=0) continue;
      const k = Math.min(ox,oy); if(k>worst) worst=k;
      if(ox*h < oy*w){
        const sg=(dx<0?-1:1), m=ox*0.55;
        if(fi)      p[j*2]   += sg*m;
        else if(fj) p[i*2]   -= sg*m;
        else { p[i*2]-=sg*m*0.5; p[j*2]+=sg*m*0.5; }
      } else {
        const sg=(dy<0?-1:1), m=oy*0.55;
        if(fi)      p[j*2+1] += sg*m;
        else if(fj) p[i*2+1] -= sg*m;
        else { p[i*2+1]-=sg*m*0.5; p[j*2+1]+=sg*m*0.5; }
      }
    }
    const pull = 0.02*Math.max(0, 1 - it/decay);
    if(pull>0){
      for(let i=0;i<N;i++){
        if(fixed && fixed.has(i)) continue;
        p[i*2]   += (anchor[i*2]  -p[i*2])  *pull;
        p[i*2+1] += (anchor[i*2+1]-p[i*2+1])*pull;
      }
    } else if(worst < 0.4) break;
  }
}

/* Açılış yerleşimi: ayrıştır, hâlâ çakışan varsa manzarayı büyütüp yeniden dene. */
function layout(){
  spread(LAY);
  relax(LAY, 600);
  for(let grow=0; grow<14 && overlaps(LAY)>0; grow++){
    for(let i=0;i<N*2;i++) LAY[i] *= 1.05;
    relax(LAY, 400);
  }
}

/* Bir kart elle taşındıktan sonra diğerleri ona yer açar. */
function resettle(){
  relax(LAY, 340, pinned);
  place(true);
}

solveNow(perplexity, 700);
layout();

/* ------------------------------------------------------------------
   7. KARTLAR
------------------------------------------------------------------ */
const cards = LIBS.map(l=>{
  const el = document.createElement("article");
  el.className = "card";
  el.tabIndex = 0;
  el.dataset.i = l.i;
  el.setAttribute("role","button");
  el.setAttribute("aria-label", l.name + " — künyeyi aç");
  el.style.setProperty("--c", `var(--cat-${l.cat})`);
  const hasDemo = !!DEMO_OF[l.name];
  el.innerHTML =
    `<div class="box box--main">
       <div class="head"><h3>${l.name}</h3>
         <span><u class="pin" title="Bu kart elle yerleştirildi">elle</u>${hasDemo?'<em title="Yakınlaşınca kütüphanenin kendisi bu kartta çalışır">&#9654;</em>':''}${String(l.i+1).padStart(3,"0")}</span></div>
       <div class="plate"><i class="k1"></i><i class="k2"></i><i class="k3"></i><i class="k4"></i>
         <canvas class="glyph"></canvas><div class="live"></div><b class="livetag">canlı</b>
         ${hasDemo?'<button class="expand" type="button" aria-label="Etkileşimli kanadı aç">&#10530;</button>':''}</div>
     </div>
     <div class="box box--cap"><p>${l.tag}</p><div class="dots3"><b></b><b></b><b></b></div></div>
     <div class="sheet"></div>
     ${hasDemo?`<div class="wing"><div class="box box--main">
       <div class="head"><h3>${l.name}</h3>
         <span><u class="wing__tag">etkileşimli</u><button class="wing__close" type="button" aria-label="Kanadı kapat">&#10005;</button></span></div>
       <div class="plate"><i class="k1"></i><i class="k2"></i><i class="k3"></i><i class="k4"></i>
         <div class="live"></div><b class="livetag">canlı</b></div>
       <p class="wing__hint"></p>
     </div></div>`:''}`;
  if(hasDemo) el.setAttribute("data-demo","");
  world.appendChild(el);
  const cv = el.querySelector("canvas.glyph");
  return { l, el, cv, ctx:cv.getContext("2d"), res:0, sheetBuilt:false, hasDemo,
           plate: el.querySelector(".box--main .plate"),
           live:  el.querySelector(".box--main .live"),
           wingPlate: el.querySelector(".wing .plate"),
           wingLive:  el.querySelector(".wing .live"),
           wingHint:  el.querySelector(".wing__hint"),
           tl: l.seed*41, speed:1 };
});

function place(anim){
  cards.forEach((c,i)=>{
    if(anim) c.el.classList.add("moving"); else c.el.classList.remove("moving");
    c.el.style.left = (LAY[i*2]-CARD_W/2)+"px";
    c.el.style.top  = (LAY[i*2+1]-CARD_H/2)+"px";
  });
  if(anim) setTimeout(()=>cards.forEach(c=>c.el.classList.remove("moving")), 800);
}
place(false);

/* ------------------------------------------------------------------
   8. GÖRÜNÜM
------------------------------------------------------------------ */
let framed=false;
function measure(){ const r=stage.getBoundingClientRect(); VW=r.width; VH=r.height; }
/* Açılış karesi ancak sahne gerçekten ölçüldükten sonra kurulur —
   ilk boyanmadan önce getBoundingClientRect 0 dönebiliyor. */
/* Kütüphanenin kendisini çalıştıran kartların en sık olduğu nokta.
   Açılış karesi oraya iner, böylece ilk bakışta canlı demolar görünür. */
function bestOpening(){
  let best=0, bestScore=-1;
  for(const c of cards){
    if(!c.hasDemo) continue;
    const i=c.l.i;
    let score=0;
    for(const d of cards){
      if(d===c || !d.hasDemo) continue;
      const j=d.l.i;
      if(Math.abs(LAY[j*2]-LAY[i*2])   < CARD_W*3.2 &&
         Math.abs(LAY[j*2+1]-LAY[i*2+1]) < CARD_H*2.4) score++;
    }
    if(score>bestScore){ bestScore=score; best=i; }
  }
  return best;
}

function openView(){
  if(framed || VW<80 || VH<80) return;
  framed = true;
  /* Açılış ölçeği artık sahnenin GENİŞLİĞİNE bağlı. Sabit 0,82 masaüstünde
     doğru ama 375 px'lik bir telefonda tek kart bütün ekranı kaplıyordu —
     bunun bir kart MANZARASI olduğu hiç anlaşılmıyordu. Kart 300 px geniş;
     VW/980 telefonda üç kartı yan yana getiriyor. 980 px'in üstünde değer
     zaten 0,82'ye sıkışıyor, yani masaüstünde hiçbir şey değişmiyor. */
  centerOn(bestOpening(), Math.max(0.30, Math.min(0.82, VW/980)));
}
new ResizeObserver(()=>{ measure(); framed ? apply() : openView(); }).observe(stage);
measure(); openView();

function bbox(){
  let x0=1e9,y0=1e9,x1=-1e9,y1=-1e9;
  for(let i=0;i<N;i++){
    x0=Math.min(x0,LAY[i*2]-CARD_W/2); x1=Math.max(x1,LAY[i*2]+CARD_W/2);
    y0=Math.min(y0,LAY[i*2+1]-CARD_H/2); y1=Math.max(y1,LAY[i*2+1]+CARD_H/2);
  }
  return {x0,y0,x1,y1,w:x1-x0,h:y1-y0};
}

function apply(){
  world.style.transform = `translate(${view.tx.toFixed(2)}px,${view.ty.toFixed(2)}px) scale(${view.k.toFixed(4)})`;
  const g = 64*view.k;
  stage.style.backgroundSize = `${g}px ${g}px`;
  stage.style.backgroundPosition = `${view.tx%g}px ${view.ty%g}px`;
  const lod = view.k < 0.34 ? "far" : view.k < 0.62 ? "mid" : "near";
  if(world.dataset.lod !== lod) world.dataset.lod = lod;
}

function zoomBy(f, ax, ay){
  const cx = ax===undefined?VW/2:ax, cy = ay===undefined?VH/2:ay;
  const nk = Math.max(.085, Math.min(2.2, view.k*f)), r = nk/view.k;
  view.tx = cx - (cx-view.tx)*r; view.ty = cy - (cy-view.ty)*r; view.k = nk;
  apply();
}
function fitAll(){
  const b=bbox();
  view.k = Math.max(.085, Math.min(2.2, Math.min(VW/b.w, VH/b.h)*0.94));
  view.tx = VW/2 - (b.x0+b.w/2)*view.k;
  view.ty = VH/2 - (b.y0+b.h/2)*view.k;
  apply();
}
function centerOn(i, k){
  if(k) view.k = k;
  view.tx = VW/2 - LAY[i*2]*view.k;
  view.ty = VH/2 - (LAY[i*2+1]-40)*view.k;
  apply();
}

/* ------------------------------------------------------------------
   9. GLYPH DÖNGÜSÜ — yalnızca görünür kartlar çizilir
------------------------------------------------------------------ */
const DPR = Math.min(2, window.devicePixelRatio||1);
function bucketFor(px){ return px<100?96 : px<150?144 : px<220?208 : px<320?304 : px<440?416 : 512; }

let visCount=0, tick=0, lastNow=0;
let hudPrev="";
function frame(now){
  const dt = lastNow ? Math.min(.06,(now-lastNow)/1000) : .016;
  lastNow = now;
  tick++;

  /* Müze açıkken atlas manzarası görünmüyor ama bütün döngüsü dönmeye devam
     ediyordu: 160 kartın glyph çizimi, bağlantılar, mini harita, her karede
     bir HUD innerHTML yazımı ve canlı demo bütçesi. Hepsi boşa. */
  if(museumOn){ requestAnimationFrame(frame); return; }
  if(!framed){ measure(); openView(); }
  if(regionsDirty){ buildRegions(); regionsDirty=false; }

  if(solving && solver){
    for(let i=0;i<10 && solver.iter<700;i++) solver.step();
    POS = fitted(solver.Y, N); klNow = solver.kl;
    spread(LAY); place(false);
    if(solver.iter>=700){
      solving=false; solveBtn.disabled=false; solveBtn.textContent="Manzarayı yeniden ser";
      relax(LAY, 420); place(true); regionsDirty=true; linkTarget=-2;
      cards.forEach(c=>c.sheetBuilt=false);
      if(pendingSel>=0){ const k=pendingSel; pendingSel=-1; select(k); }
    }
  }

  const plate = (CARD_W-33);
  const RES = bucketFor(plate*view.k*DPR);
  const skip = visCount>44 && tick%2===1;
  let vis=0;

  if(!skip){
    for(const c of cards){
      if(c.el.hasAttribute("data-off")) continue;
      const i=c.l.i;
      const x=(LAY[i*2]-CARD_W/2)*view.k+view.tx, y=(LAY[i*2+1]-CARD_H/2)*view.k+view.ty;
      const w=CARD_W*view.k, h=CARD_H*view.k;
      if(x+w<-90||x>VW+90||y+h<-90||y>VH+90) continue;
      vis++;
      /* imleç kartın üzerindeyken ya da kart seçiliyken çizim hızlanır */
      const want = (c.l.i===hoverIdx || c.l.i===sel) ? 2.7 : 1;
      c.speed += (want - c.speed) * Math.min(1, dt*7);
      if(!reduced) c.tl += dt * c.speed;
      if(c.plate.hasAttribute("data-live")) continue;   /* canlı demo varken glyph çizilmez */
      if(c.res!==RES){ c.cv.width=c.cv.height=RES; c.res=RES; }
      const g=c.ctx;
      g.clearRect(0,0,RES,RES);
      drawGlyph(g, c.l.glyph, RES/2, RES/2, RES*0.86, c.tl, INK, c.l.seed);
    }
    visCount=vis;
  }
  updateLive();
  updateLabels();
  drawLinks(hoverIdx>=0 ? hoverIdx : sel);
  drawMini();

  /* innerHTML her karede yazılıyordu; yalnız değişince yaz. */
  const hudTxt =
    `<span><b>${N}</b> kütüphane</span><span><b>${CAT_KEYS.length}</b> küme</span>` +
    `<span>ölçek <b>${view.k.toFixed(2)}×</b></span>` +
    (solving?`<span>seriliyor…</span>`:"");
  if(hudTxt!==hudPrev){ hudEl.innerHTML=hudTxt; hudPrev=hudTxt; }

  requestAnimationFrame(frame);
}
apply();
requestAnimationFrame(frame);

/* ------------------------------------------------------------------
   10. GEZİNME
------------------------------------------------------------------ */
let down=null, dragged=0, suppress=false;
const ptrs=new Map(); let pinch=0;

function onMove(e){
  if(ptrs.has(e.pointerId)) ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(ptrs.size===2){
    const p=[...ptrs.values()], d=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y);
    const r=stage.getBoundingClientRect();
    if(pinch>0) zoomBy(d/pinch,(p[0].x+p[1].x)/2-r.left,(p[0].y+p[1].y)/2-r.top);
    pinch=d; dragged+=20; return;
  }
  if(dragCard){
    const ddx=e.clientX-dragCard.sx, ddy=e.clientY-dragCard.sy;
    dragged=Math.max(dragged, Math.abs(ddx)+Math.abs(ddy));
    if(dragged>4){
      const i=dragCard.i, c=cards[i];
      LAY[i*2]   = dragCard.lx + ddx/view.k;
      LAY[i*2+1] = dragCard.ly + ddy/view.k;
      c.el.classList.remove("moving");
      c.el.style.left = (LAY[i*2]-CARD_W/2)+"px";
      c.el.style.top  = (LAY[i*2+1]-CARD_H/2)+"px";
      c.el.setAttribute("data-drag","");
    }
    return;
  }
  if(!down) return;
  const dx=e.clientX-down.x, dy=e.clientY-down.y;
  dragged = Math.max(dragged, Math.abs(dx)+Math.abs(dy));
  view.tx = down.tx+dx; view.ty = down.ty+dy;
  apply();
}
function onUp(e){
  ptrs.delete(e.pointerId);
  if(ptrs.size<2) pinch=0;
  if(ptrs.size===0){
    window.removeEventListener("pointermove",onMove);
    window.removeEventListener("pointerup",onUp);
    window.removeEventListener("pointercancel",onUp);
    stage.classList.remove("dragging");
    if(dragCard){
      const i=dragCard.i, c=cards[i];
      c.el.removeAttribute("data-drag");
      if(dragged>4){
        pinned.add(i);
        c.el.setAttribute("data-pin","");
        resettle();
        regionsDirty=true; linkTarget=-2;
        cards.forEach(c=>c.sheetBuilt=false);
        syncPinUI();
      }
      dragCard=null;
    }
    down=null;
    if(dragged>5){ suppress=true; setTimeout(()=>suppress=false,0); }
  }
}
stage.addEventListener("pointerdown",e=>{
  if(e.button!==0) return;
  ptrs.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(ptrs.size===1){
    dragged=0;
    const el=e.target.closest(".card");
    const guard=e.target.closest('.sheet,.gate,a,.mini,.wing,.expand,.plate[data-live] .live');
    if(el && !guard){
      const i=+el.dataset.i;
      dragCard={i, sx:e.clientX, sy:e.clientY, lx:LAY[i*2], ly:LAY[i*2+1]};
      down=null;
    } else {
      dragCard=null;
      down={x:e.clientX,y:e.clientY,tx:view.tx,ty:view.ty};
      stage.classList.add("dragging");
    }
  }
  else if(ptrs.size===2){ const p=[...ptrs.values()]; pinch=Math.hypot(p[0].x-p[1].x,p[0].y-p[1].y); down=null; dragCard=null; }
  window.addEventListener("pointermove",onMove);
  window.addEventListener("pointerup",onUp);
  window.addEventListener("pointercancel",onUp);
});
stage.addEventListener("pointermove",e=>{
  if(down) return;
  const el=e.target.closest(".card");
  hoverIdx = el ? +el.dataset.i : -1;
});
stage.addEventListener("pointerleave",()=>{ hoverIdx=-1; });
stage.addEventListener("wheel",e=>{
  e.preventDefault();
  const r=stage.getBoundingClientRect();
  zoomBy(Math.exp(-e.deltaY*0.0016), e.clientX-r.left, e.clientY-r.top);
},{passive:false});

world.addEventListener("click",e=>{
  if(suppress) return;
  const near=e.target.closest("[data-go]");
  if(near){ e.stopPropagation(); goTo(+near.dataset.go); return; }
  if(e.target.closest("a")) return;
  if(e.target.closest(".gate")) return;   /* ses jesti kartı seçmesin */
  const exp=e.target.closest(".expand");
  if(exp){ e.stopPropagation(); toggleWing(+exp.closest(".card").dataset.i); return; }
  if(e.target.closest(".wing__close")){ e.stopPropagation(); closeWing(); return; }
  if(e.target.closest(".wing")) return;   /* kanat içi etkileşim kartı seçmesin */
  if(e.target.closest(".sheet")) return;  /* künye içi tıklama seçimi bozmasın */
  const el=e.target.closest(".card");
  if(el) select(+el.dataset.i);
});
stage.addEventListener("click",e=>{
  if(suppress) return;
  if(!e.target.closest(".card")) deselect();
});
world.addEventListener("keydown",e=>{
  const el=e.target.closest(".card"); if(!el) return;
  if(e.key==="Enter"||e.key===" "){ e.preventDefault(); select(+el.dataset.i); }
});
document.addEventListener("keydown",e=>{ if(e.key==="Escape"){ wingIdx>=0 ? closeWing() : deselect(); } });

/* ------------------------------------------------------------------
   KANAT — kartın yanında açılan, aynı boyda, etkileşimli ikizi.
   Demo kartın plakasından sökülüp kanadın plakasına taşınır:
   tek örnek çalışır, kanatta üstelik etkileşim açık olarak.
------------------------------------------------------------------ */
function closeWing(){
  if(wingIdx<0) return;
  const i=wingIdx;
  wingIdx=-1;
  unmountOne(i);                       /* kanattaki örneği sök */
  cards[i].el.removeAttribute("data-wing");
}
function toggleWing(i){
  if(wingIdx===i){ closeWing(); return; }
  closeWing();
  const c=cards[i];
  if(!c.hasDemo) return;
  unmountOne(i);                       /* karttaki küçük örneği sök */
  wingIdx=i;
  c.el.setAttribute("data-wing","");
  c.wingHint.textContent = HINTS[DEMO_OF[c.l.name]] || DEFAULT_HINT;
  if(view.k < 0.62) centerOn(i, 0.72);
  requestAnimationFrame(()=>ensureWingVisible(i));
}
function ensureWingVisible(i){
  const pad=22;
  const x=(LAY[i*2]-CARD_W/2)*view.k+view.tx, y=(LAY[i*2+1]-CARD_H/2)*view.k+view.ty;
  const w=(CARD_W*2+16)*view.k, h=CARD_H*view.k;
  let dx=0, dy=0;
  if(w<VW-2*pad){ if(x<pad) dx=pad-x; else if(x+w>VW-pad) dx=VW-pad-(x+w); }
  else dx=pad-x;
  if(h<VH-2*pad){ if(y<pad) dy=pad-y; else if(y+h>VH-pad) dy=VH-pad-(y+h); }
  else dy=pad-y;
  view.tx+=dx; view.ty+=dy; apply();
}

/* ------------------------------------------------------------------
   11. SEÇİM + KART İÇİ KÜNYE
------------------------------------------------------------------ */
const fmtKb = k => k>=1000 ? (k/1000).toFixed(1)+" MB" : k+" kB";
const fmtStars = s => s>=1 ? "~"+s+"k" : "<1k";

function buildSheet(c){
  if(c.sheetBuilt) return;
  const l=c.l;
  /* Beş aile hâlinde: gruplamanın kendisi açıklamanın yarısı. */
  const rows = AXIS_FAM.map(f=>
    `<div class="famhead">${f.t}</div>` +
    f.ax.map(a=>{
      const ix=AXES.indexOf(a);
      return `<div class="bar"${l.v[ix]<0.05?" data-zero":""}>`+
             `<span data-ax="${a}" title="${AXIS_INFO[a].d}">${a}</span>`+
             `<i style="--w:${Math.round(l.v[ix]*100)}%"></i></div>`;
    }).join("")
  ).join("");
  c.el.querySelector(".sheet").innerHTML = `
    <p class="sec">Künye — ${CATS[l.cat].label}</p>
    <dl class="facts">
      <div><dt>Yaklaşık ağırlık</dt><dd>${fmtKb(l.kb)}</dd></div>
      <div><dt>GitHub yıldızı</dt><dd>${fmtStars(l.stars)}</dd></div>
      <div><dt>İlk sürüm</dt><dd>${l.year}</dd></div>
      <div><dt>Lisans</dt><dd>${l.lic}</dd></div>
    </dl>
    <p class="sec">Ne yapar — eksen adına tıklayın</p>
    <div class="bars">${rows}</div>
    <p class="sec">Benzer kütüphaneler</p>
    <div class="near">${l.near.map(j=>
      `<button data-go="${j}" style="--nc:var(--cat-${LIBS[j].cat})">${LIBS[j].name}</button>`).join("")}</div>
    <button class="cmpadd" data-cmp="${l.i}">&#8646; karşılaştırmaya ekle</button>
    <a class="out" href="https://${l.url}" target="_blank" rel="noopener noreferrer">${l.url} ↗</a>`;
  c.sheetBuilt = true;
}

function deselect(){
  if(sel<0) return;
  cards[sel].el.removeAttribute("data-sel");
  sel=-1;
}
function select(i){
  if(sel===i){ deselect(); return; }
  deselect();
  sel=i;
  const c=cards[i];
  buildSheet(c);
  c.el.setAttribute("data-sel","");
  if(view.k < 0.62) { centerOn(i, 0.8); return; }
  requestAnimationFrame(()=>ensureVisible(i));
}
function ensureVisible(i){
  const c=cards[i], pad=26;
  const sh=c.el.querySelector(".sheet").offsetHeight;
  const x=(LAY[i*2]-CARD_W/2)*view.k+view.tx, y=(LAY[i*2+1]-CARD_H/2)*view.k+view.ty;
  const w=CARD_W*view.k, h=(CARD_H+9+sh)*view.k;
  let dx=0, dy=0;
  if(w<VW-2*pad){ if(x<pad) dx=pad-x; else if(x+w>VW-pad) dx=VW-pad-(x+w); }
  else dx = pad-x;
  if(h<VH-2*pad){ if(y<pad) dy=pad-y; else if(y+h>VH-pad) dy=VH-pad-(y+h); }
  else dy = pad-y;
  view.tx+=dx; view.ty+=dy; apply();
}
function goTo(j){
  const l=LIBS[j];
  if(!active.has(l.cat)){ active.add(l.cat); syncLegend(); }
  if(query){ query=""; document.getElementById("q").value=""; syncFilter(); }
  deselect();
  centerOn(j, Math.max(view.k, 0.8));
  sel=j; buildSheet(cards[j]); cards[j].el.setAttribute("data-sel","");
  requestAnimationFrame(()=>ensureVisible(j));
}

/* ------------------------------------------------------------------
   12. RAY: kümeler, arama, çözücü
------------------------------------------------------------------ */
const legendEl=document.getElementById("legend"), catNote=document.getElementById("catNote"),
      hitEl=document.getElementById("hitCount");
const counts={}; CAT_KEYS.forEach(k=>counts[k]=LIBS.filter(l=>l.cat===k).length);

legendEl.innerHTML = CAT_KEYS.map(k=>
  `<button class="cat" data-cat="${k}" style="--c:var(--cat-${k})" aria-pressed="true">
     <i></i><b>${CATS[k].label}</b><u>${counts[k]}</u></button>`).join("");

const DEFAULT_NOTE = "Bir kümenin üzerine gelin. Aynı işi farklı katmanlarda yapan kütüphaneler manzarada yan yana düşer.";
catNote.textContent = DEFAULT_NOTE;

function matches(l){
  if(onlyLive && !DEMO_OF[l.name]) return false;
  if(!active.has(l.cat)) return false;
  if(query && !(l.name.toLowerCase().includes(query) || l.tag.toLowerCase().includes(query)
      || CATS[l.cat].label.toLowerCase().includes(query))) return false;
  return true;
}
function syncFilter(){
  let n=0;
  cards.forEach(c=>{
    const ok=matches(c.l);
    ok ? (c.el.removeAttribute("data-off"), n++) : c.el.setAttribute("data-off","");
  });
  if(sel>=0 && cards[sel].el.hasAttribute("data-off")) deselect();
  if(wingIdx>=0 && cards[wingIdx].el.hasAttribute("data-off")) closeWing();
  hitEl.textContent = n===N ? "" : `${n} / ${N}`;
  syncRegions();
}
function syncLegend(){
  [...legendEl.children].forEach(b=>{
    const on=active.has(b.dataset.cat);
    b.setAttribute("aria-pressed", on?"true":"false");
    on ? b.removeAttribute("data-off") : b.setAttribute("data-off","");
  });
  syncFilter();
}
legendEl.addEventListener("click",e=>{
  const b=e.target.closest(".cat"); if(!b) return;
  const k=b.dataset.cat;
  if(active.size===CAT_KEYS.length){ active.clear(); active.add(k); }
  else if(active.has(k)){ active.delete(k); if(!active.size) CAT_KEYS.forEach(c=>active.add(c)); }
  else active.add(k);
  syncLegend();
});
legendEl.addEventListener("pointerover",e=>{
  const b=e.target.closest(".cat"); if(b) catNote.textContent = CATS[b.dataset.cat].note;
});
legendEl.addEventListener("pointerleave",()=>{ catNote.textContent = DEFAULT_NOTE; });

document.getElementById("q").addEventListener("input",e=>{
  query=e.target.value.trim().toLowerCase(); syncFilter();
});

const onlyLiveBtn=document.getElementById("onlyLive");
document.getElementById("liveCount").textContent = Object.keys(DEMO_OF).length;
onlyLiveBtn.addEventListener("click",()=>{
  onlyLive=!onlyLive;
  onlyLiveBtn.setAttribute("aria-pressed", onlyLive?"true":"false");
  syncFilter();
  if(onlyLive && view.k>=0.62) centerOn(bestOpening(), Math.max(view.k,0.75));
});
syncFilter();

const solveBtn=document.getElementById("resolve");
const resetBtn = document.getElementById("resetPin");
function syncPinUI(){
  resetBtn.hidden = pinned.size===0;
  resetBtn.textContent = `↺ Elle taşınan ${pinned.size} kartı geri al`;
}
function unpinAll(){
  pinned.clear();
  cards.forEach(c=>c.el.removeAttribute("data-pin"));
  syncPinUI();
}
resetBtn.addEventListener("click",()=>{ unpinAll(); layout(); place(true); regionsDirty=true; });
syncPinUI();

/* seed verilirse aynı tohumla çözülür: bir ekseni değiştirdiğinizde manzara
   baştan karılmaz, yalnız değişikliğin etkisi görünür. */
function startSolve(seed){
  const keep = seed!==undefined ? sel : -1;
  closeWing(); deselect(); unpinAll();
  solver = makeSolver(X, perplexity, seed!==undefined ? seed : ((Math.random()*1e9)|0));
  solving = true; solveBtn.disabled = true; solveBtn.textContent = "Seriliyor…";
  pendingSel = keep;
}
let pendingSel = -1;
solveBtn.addEventListener("click",()=>startSolve());

/* ------------------------------------------------------------------
   MİNİ HARİTA — manzaranın tamamı, kümelere göre renkli, görüş
   dikdörtgeniyle. Tıklayınca ya da sürükleyince oraya gidilir.
------------------------------------------------------------------ */
const miniCv = document.getElementById("mini"), miniCtx = miniCv.getContext("2d");
let miniFit = {sc:1, ox:0, oy:0};

function drawMini(){
  const W=miniCv.width, H=miniCv.height, g=miniCtx;
  const b=bbox(), pad=CARD_W;
  const sc=Math.min(W/(b.w+pad*2), H/(b.h+pad*2));
  const ox=W/2-(b.x0+b.w/2)*sc, oy=H/2-(b.y0+b.h/2)*sc;
  miniFit={sc,ox,oy};
  g.clearRect(0,0,W,H);
  const r=Math.max(2.4, CARD_W*sc*0.42);
  for(const c of cards){
    const i=c.l.i, off=c.el.hasAttribute("data-off");
    g.globalAlpha = off ? .16 : .92;
    g.fillStyle   = off ? TOK.faint : (TOK[c.l.cat]||TOK.ink);
    g.fillRect(LAY[i*2]*sc+ox-r, LAY[i*2+1]*sc+oy-r*1.4, r*2, r*2.8);
  }
  g.globalAlpha=1;
  const vx=(-view.tx/view.k)*sc+ox, vy=(-view.ty/view.k)*sc+oy;
  g.strokeStyle=TOK.ink; g.lineWidth=2;
  g.strokeRect(vx, vy, (VW/view.k)*sc, (VH/view.k)*sc);
}

let miniDrag=false;
function miniGo(e){
  const r=miniCv.getBoundingClientRect();
  const px=(e.clientX-r.left)/r.width*miniCv.width;
  const py=(e.clientY-r.top)/r.height*miniCv.height;
  view.tx = VW/2 - (px-miniFit.ox)/miniFit.sc*view.k;
  view.ty = VH/2 - (py-miniFit.oy)/miniFit.sc*view.k;
  apply();
}
miniCv.addEventListener("pointerdown",e=>{
  e.stopPropagation(); miniDrag=true;
  miniCv.setPointerCapture(e.pointerId); miniGo(e);
});
miniCv.addEventListener("pointermove",e=>{ if(miniDrag){ e.stopPropagation(); miniGo(e); } });
miniCv.addEventListener("pointerup",e=>{ miniDrag=false; });
miniCv.addEventListener("wheel",e=>e.stopPropagation());

document.getElementById("zin").addEventListener("click",()=>zoomBy(1.4));
document.getElementById("zout").addEventListener("click",()=>zoomBy(1/1.4));
document.getElementById("zfit").addEventListener("click",fitAll);
