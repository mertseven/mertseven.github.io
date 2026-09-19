
/* ==================================================================
   15. TUR — manzaranın söylediklerini gezdiren duraklar
================================================================== */
const TOUR = [
  { t:"Nereden başlanır: p5.js", libs:["p5.js"], k:0.7,
    d:"Etkileşimli medyaya girişin en kısa yolu. setup/draw döngüsü, tek bir tuval, öğrenmesi bir derslik. Komşularına bakın: Paper.js, Two.js, Pts.js — hepsi aynı serbest çizim yüzeyini farklı soyutlamalarla sunuyor." },
  { t:"Aynı işi farklı katmanda yapmak", libs:["Leaflet","MapLibre GL JS"], k:0.55,
    d:"İkisi de harita çiziyor ama biri DOM'a karo diziyor, diğeri GPU'ya vektör gönderiyor. Karşılaştırmaya bakın: DOM ve WebGL eksenleri tam tersine dönüyor. Bu ayrım bütün atlasta tekrar eder — önce ne çizeceğinize, sonra neyin üstüne çizeceğinize karar verirsiniz." },
  { t:"Piksel çizmeyenler", libs:["Turf.js","Graphology"], k:0.5,
    d:"Turf.js coğrafya hesabı yapar, Graphology graf tutar; ikisi de tek bir şey çizmez. Bu yüzden kendi kümelerinin kenarında, Araç Kutusu'na yakın dururlar. Öğrenciye söylenecek şey şu: her projede görünen katmanın altında, görünmeyen bir hesap katmanı vardır." },
  { t:"Sıkı üçlü: GSAP, anime.js, Motion", libs:["GSAP","anime.js","Motion"], k:0.62,
    d:"Üçü de zamanı bir değer üzerinde yorumlar ve neredeyse üst üste düşer. Onları ayıran tek eksen paradigma: GSAP ve anime.js emir kipiyle çalışır, Motion bileşenin girip çıkışını kendi yönetir. Karşılaştırmadaki 'Bildirimsel' satırı bunu tek bakışta gösteriyor." },
  { t:"Kamerayı girdiye çevirmek", libs:["MediaPipe Tasks","face-api.js"], k:0.55,
    d:"Görü & Sensör kümesi, etkileşimin klavye ve fareden çıktığı yer. Kamera akışından el, yüz ve poz çıkarılınca beden bir denetleyici hâline gelir. Bu kümedekilerin hepsi çizim değil çıkarım yapar; çizmeyi başka bir kütüphaneye bırakırlar." },
  { t:"Oyun mu, sahne mi, fizik mi?", libs:["Phaser","Three.js","Matter.js"], k:0.5,
    d:"Sık karışan üç şey. Phaser bir oyun çatısıdır: döngü, girdi, sahne yönetimi verir. Three.js bir render katmanıdır: sahneyi çizer ama oyunun kurallarını bilmez. Matter.js ise yalnız fiziktir: cisimleri hareket ettirir, çizmeyi size bırakır. Üçünü karşılaştırın." }
];

let tourIdx = -1;
const tourEl = document.getElementById("tour");
const calloutEl = document.getElementById("callout");

tourEl.innerHTML = TOUR.map((st,i)=>
  `<button class="stop" data-stop="${i}"><u>${String(i+1).padStart(2,"0")}</u><b>${st.t}</b></button>`).join("");

function idxOf(name){ return LIBS.findIndex(l=>l.name===name); }

function goStop(n){
  if(n<0 || n>=TOUR.length) return;
  tourIdx=n;
  const st=TOUR[n];
  const ids=st.libs.map(idxOf).filter(i=>i>=0);
  if(!ids.length) return;
  /* tura giren kartlar süzgeç dışında kalmasın */
  ids.forEach(i=>{ if(!active.has(LIBS[i].cat)) active.add(LIBS[i].cat); });
  if(onlyLive){ onlyLive=false; onlyLiveBtn.setAttribute("aria-pressed","false"); }
  if(query){ query=""; document.getElementById("q").value=""; }
  syncLegend();

  let cx=0, cy=0;
  ids.forEach(i=>{ cx+=LAY[i*2]; cy+=LAY[i*2+1]; });
  cx/=ids.length; cy/=ids.length;
  view.k=st.k;
  view.tx=VW/2-cx*view.k;
  view.ty=VH/2-(cy-30)*view.k;
  apply();

  deselect(); select(ids[0]);
  if(ids.length>1){ compare.length=0; ids.forEach(addCompare); }

  calloutEl.innerHTML =
    `<div class="callout__head"><b>${st.t}</b><u>${String(n+1).padStart(2,"0")} / ${String(TOUR.length).padStart(2,"0")}</u></div>
     <p>${st.d}</p>
     <div class="callout__nav">
       <button id="tourPrev"${n===0?" disabled":""}>&#8592; önceki</button>
       <button id="tourNext"${n===TOUR.length-1?" disabled":""}>sonraki &#8594;</button>
       <button id="tourEnd">kapat</button>
       <span>tur</span>
     </div>`;
  calloutEl.setAttribute("data-open","");
  [...tourEl.children].forEach((b,i)=>b.setAttribute("aria-current", i===n?"true":"false"));
}
function endTour(){
  tourIdx=-1;
  calloutEl.removeAttribute("data-open");
  [...tourEl.children].forEach(b=>b.setAttribute("aria-current","false"));
}
tourEl.addEventListener("click",e=>{
  const b=e.target.closest("[data-stop]"); if(b) goStop(+b.dataset.stop);
});
calloutEl.addEventListener("click",e=>{
  if(e.target.id==="tourPrev") goStop(tourIdx-1);
  else if(e.target.id==="tourNext") goStop(tourIdx+1);
  else if(e.target.id==="tourEnd") endTour();
});

/* ==================================================================
   16. KARŞILAŞTIRMA — iki ya da üç kütüphaneyi yan yana koymak
================================================================== */
const compare = [];
const trayEl=document.getElementById("tray"), trayChips=document.getElementById("trayChips");
const cmpEl=document.getElementById("cmp"), cmpBody=document.getElementById("cmpBody");

function addCompare(i){
  if(compare.includes(i)) return;
  if(compare.length>=3) compare.shift();
  compare.push(i);
  syncTray();
}
function removeCompare(i){
  const k=compare.indexOf(i);
  if(k>=0){ compare.splice(k,1); syncTray(); if(compare.length<2) closeCmp(); else renderCmp(); }
}
function syncTray(){
  trayChips.innerHTML = compare.map(i=>
    `<button data-rm="${i}" style="--nc:var(--cat-${LIBS[i].cat})">${LIBS[i].name} &#10005;</button>`).join("");
  compare.length ? trayEl.setAttribute("data-on","") : trayEl.removeAttribute("data-on");
  if(cmpEl.hasAttribute("data-open")) renderCmp();
}
trayChips.addEventListener("click",e=>{
  const b=e.target.closest("[data-rm]"); if(b) removeCompare(+b.dataset.rm);
});
document.getElementById("trayClear").addEventListener("click",()=>{
  compare.length=0; syncTray(); closeCmp();
});
document.getElementById("trayOpen").addEventListener("click",()=>{
  renderCmp(); cmpEl.setAttribute("data-open","");
});
document.getElementById("cmpClose").addEventListener("click",()=>closeCmp());
function closeCmp(){ cmpEl.removeAttribute("data-open"); }

const fmtKb2 = k => k>=1000 ? (k/1000).toFixed(1)+" MB" : k+" kB";

function renderCmp(){
  if(compare.length<2){
    cmpBody.innerHTML = `<p class="cmppair">Karşılaştırmak için en az iki kart seçin — bir kartı <b>Shift</b> ile tıklayın ya da künyesindeki “karşılaştırmaya ekle” düğmesini kullanın.</p>`;
    return;
  }
  if(!hiOrder) buildHiRanks();
  const L=compare.map(i=>LIBS[i]);
  const n=L.length;
  const cols=`96px repeat(${n},1fr)`;

  /* eksenleri en çok ayrışandan en aza sırala — asıl bilgi farkta */
  const rows=AXES.map((a,ix)=>{
    const vals=L.map(l=>l.v[ix]);
    return { a, ix, vals, span:Math.max(...vals)-Math.min(...vals) };
  }).sort((p,q)=>q.span-p.span);

  const head = `<div class="cmpgrid" style="grid-template-columns:${cols}">
    <div></div>${L.map(l=>`<div class="h" style="--nc:var(--cat-${l.cat})">
      <u>${CATS[l.cat].label}</u><b>${l.name}</b></div>`).join("")}
    ${rows.map(r=>{
      const mx=Math.max(...r.vals);
      return `<div class="ax${r.span>=.35?" big":""}" data-ax="${r.a}" title="${AXIS_INFO[r.a].d}">${r.a}</div>`+
        r.vals.map(v=>`<div class="cell"${(v===mx&&r.span>0)?" data-top":""}>`+
          `<i style="--w:${Math.round(v*100)}%"></i></div>`).join("");
    }).join("")}
  </div>`;

  const facts = `<dl class="cmpfacts" style="grid-template-columns:repeat(${n},1fr)">
    ${L.map(l=>`<div><dt>Yıl · Lisans</dt><dd>${l.year} · ${l.lic}</dd></div>`).join("")}
    ${L.map(l=>`<div><dt>Ağırlık · Yıldız</dt><dd>${fmtKb2(l.kb)} · ~${l.stars}k</dd></div>`).join("")}
  </dl>`;

  const top=rows[0], bottom=rows[rows.length-1];
  const story=`<p class="cmppair">En çok <b>${top.a}</b> ekseninde ayrışıyorlar
    (${L.map((l,ix)=>l.name+" "+top.vals[ix].toFixed(2)).join(" · ")}),
    en çok <b>${bottom.a}</b> ekseninde anlaşıyorlar.</p>`;
  cmpBody.innerHTML = head + facts + story;
}

/* ==================================================================
   17. EKSENLER — çubukların ne anlattığını, uçlarını katalogdan
   gerçek kütüphanelerle göstererek açıklar.
================================================================== */
const axesEl=document.getElementById("axes"), axBody=document.getElementById("axBody");

function axTop(ix, dir, n){
  return LIBS.slice().sort((a,b)=> dir>0 ? b.v[ix]-a.v[ix] : a.v[ix]-b.v[ix])
    .filter(l=> dir>0 ? l.v[ix]>0 : true).slice(0,n);
}
function axChips(list, label){
  if(!list.length) return "";
  return `<div class="axex"><span>${label}</span>` + list.map(l=>
    `<button data-go="${l.i}" style="--nc:var(--cat-${l.cat})">${l.name}</button>`).join("") + `</div>`;
}

function renderAxes(){
  axBody.innerHTML = AXIS_FAM.map(f=>
    `<section class="axfam">
       <h4>${f.t}</h4>
       <p>${f.n}</p>
       ${f.ax.map(a=>{
         const ix=AXES.indexOf(a), info=AXIS_INFO[a];
         const poles=`<div class="axpole"><u>yüksek</u><span>${info.h}</span></div>`+
                     `<div class="axpole"><u>düşük</u><span>${info.l}</span></div>`;
         const both = (a==="Bildirimsel"||a==="Soyutlama");
         const ex = axChips(axTop(ix,1,3), both?"en yüksek":"örnek") +
                    (both ? axChips(axTop(ix,-1,3), "en düşük") : "");
         return `<div class="axitem" id="ax-${ix}"><b>${a}</b><div><em>${info.d}</em>${poles}${ex}</div></div>`;
       }).join("")}
     </section>`).join("");
}

function openAxes(focus){
  renderAxes();
  axesEl.setAttribute("data-open","");
  if(focus!=null){
    const el=document.getElementById("ax-"+focus);
    if(el) requestAnimationFrame(()=>el.scrollIntoView({block:"center",behavior:"smooth"}));
  }
}
document.getElementById("openAxes").addEventListener("click",()=>openAxes());
document.getElementById("axClose").addEventListener("click",()=>axesEl.removeAttribute("data-open"));
axBody.addEventListener("click",e=>{
  const b=e.target.closest("[data-go]");
  if(b){ axesEl.removeAttribute("data-open"); goTo(+b.dataset.go); }
});

/* eksen adına nereden tıklanırsa tıklansın tanımı açılsın */
document.addEventListener("click",e=>{
  const t=e.target.closest("[data-ax]");
  if(!t) return;
  const ix=AXES.indexOf(t.dataset.ax);
  if(ix<0) return;
  e.stopPropagation();
  openAxes(ix);
});

/* ==================================================================
   18. BAĞLANTILAR — Shift+tık karşılaştırmaya ekler, Esc katmanları kapatır
================================================================== */
world.addEventListener("click",e=>{
  if(!e.shiftKey) return;
  const el=e.target.closest(".card");
  if(!el) return;
  e.stopPropagation();
  addCompare(+el.dataset.i);
},true);

cmpBody.addEventListener("click",e=>{
  const b=e.target.closest("[data-rm]"); if(b) removeCompare(+b.dataset.rm);
});
world.addEventListener("click",e=>{
  const b=e.target.closest(".cmpadd");
  if(!b) return;
  e.stopPropagation();
  addCompare(+b.dataset.cmp);
  renderCmp(); cmpEl.setAttribute("data-open","");
});
document.addEventListener("keydown",e=>{
  if(e.key!=="Escape") return;
  if(axesEl.hasAttribute("data-open")){ axesEl.removeAttribute("data-open"); return; }
  if(cmpEl.hasAttribute("data-open")){ closeCmp(); return; }
  if(tourIdx>=0){ endTour(); return; }
});

/* Konsoldan kurcalamak isteyenler için küçük bir tutamak. */
window.atlas = { view, LAY, cards, LIBS, CATS, centerOn, fitAll, bbox, overlaps,
                 updateLive, toggleWing, closeWing, select, layout, place,
                 goStop, addCompare, renderCmp };

/* ===================== telefonda ray bir çekmece =====================
   Masaüstünde ray hep açık duruyor ve doğru olan o: harita ile birlikte
   okunuyor. Telefonda ise sabit 44dvh yer kaplıyordu — haritaya ekranın
   yarısı kalıyordu. Artık üstten inen bir çekmece (CSS tarafı .railtog /
   .app[data-rail] altında), harita bütün ekranı alıyor.

   Kapanma kuralı kasıtlı olarak SEÇİCİ: tur durağı gibi GÖRÜNÜMÜ DEĞİŞTİREN
   bir şeye dokununca kapanıyor (yoksa gidilen yer çekmecenin arkasında
   kalıyor), ama küme filtrelerinde kapanmıyor — insan arka arkaya birkaç
   küme kapatıp açıyor.                                                    */
const appEl   = document.getElementById("app");
const railTog  = document.getElementById("railTog");
const railVeil = document.getElementById("railVeil");
const railEl   = document.getElementById("rail");

function railOpen(on){
  if(on===undefined) on = !appEl.hasAttribute("data-rail");
  if(on) appEl.setAttribute("data-rail",""); else appEl.removeAttribute("data-rail");
  railTog.setAttribute("aria-expanded", on ? "true" : "false");
  railVeil.hidden = !on;
}
railTog.addEventListener("click", ()=>railOpen());
railVeil.addEventListener("click", ()=>railOpen(false));
/* Yakalama aşamasında dinleniyor ki asıl işleyici yine de çalışsın. */
railEl.addEventListener("click", e=>{
  if(e.target.closest("[data-stop], #enterMuseum, a[href]")) railOpen(false);
}, true);
addEventListener("keydown", e=>{
  if(e.key==="Escape" && appEl.hasAttribute("data-rail")) railOpen(false);
});
/* Masaüstü genişliğine dönülürse çekmece kapalı sayılsın: ray zaten
   yerinde duruyor, açık bırakılırsa perde ekranı karartıyordu. */
matchMedia("(max-width:900px)").addEventListener("change", e=>{
  if(!e.matches) railOpen(false);
});
window.atlas.rail = railOpen;
