
/* ==================================================================
   21. MÜZE — Bell Labs Holmdel Complex
   200 m'lik bir omurga ve onu noktalayan üç tam yükseklikte ışık avlusu.
   Her katta avluya bakan galeriler; duvarlarda gazetecilik işlerinin
   afişleri, aralarında canlı panolar, avlu ayaklarında canlı demolar.
   Sahne bir hedefe çizilir ve tek bir boyama geçişinden geçer:
   yumuşak parlaklık, sıcak-soğuk ayrımı, vinyet, ince doku.
================================================================== */

const museumEl = document.getElementById("museum");
const mCanvas  = document.getElementById("mcanvas");
const mLoad    = document.getElementById("mLoad");
const mWingEl  = document.getElementById("mWing");
const mLevelEl = document.getElementById("mLevel");
const mHelp    = document.getElementById("mHelp");
const joyEl    = document.getElementById("joy");
const joyKnob  = document.getElementById("joyKnob");
const rotateEl = document.getElementById("mRotate");
const pmodal   = document.getElementById("pmodal");
const mpanel   = document.getElementById("mpanel");
const mpBody   = document.getElementById("mpBody");
const xhairEl  = document.getElementById("xhair");
const mclickEl = document.getElementById("mclick");
const mmeterEl = document.getElementById("mmeter");
const mguideEl = document.getElementById("mguide");
const pmodalCard = document.getElementById("pmodalCard");

let TH=null, mScene=null, mCam=null, mRend=null, mRaf=0, mBuilt=false, museumOn=false;
let mRT=null, mPostScene=null, mPostCam=null, mPostMat=null;
/* Render hedefinin ekrana oranı. 1,5 üstü örnekleme (temiz kenar), 1,0 tam
   çözünürlük, altı ise ekrandan DÜŞÜK çözünürlükte çizip büyütmek. Sonuncusu
   büyük pencerede tek gerçek kaldıraç: maliyet piksel ALANIYLA büyüdüğü için
   0,75 kat ölçek, yarıdan az piksel demek. Boyama geçişi zaten yumuşak
   olduğundan düşük ölçek keskinlik değil, hafif bir yumuşaklık olarak okunuyor. */
/* Render hedefinin ekrana oranı. 1,25 = hafif üst örnekleme (kenarlar temiz,
   maliyet 1,56 kat piksel). 1,0 = tam çözünürlük. Altı ise ekrandan DÜŞÜK
   çözünürlükte çizip büyütmek — bulanıklaştırır, o yüzden yalnız elle.

   KENDİLİĞİNDEN DEĞİŞMİYOR. Önceki sürümde uyarlanır bir denetleyici vardı
   ve yalnız aşağı inebiliyordu: sayfa açılırken kütüphaneler yüklenirken
   kareler zaten yavaş olduğu için hemen düşüyor, bir daha geri çıkmıyordu.
   Sonuç kalıcı bulanıklık, karşılığında hiçbir kazanç yok — üstelik CPU
   sınırlıysanız çözünürlük düşürmek zaten hiçbir şey kazandırmaz. Kaldırıldı.
   Elle: atlas.mQuality(1.0) hızlandırır, atlas.mQuality(1.5) keskinleştirir. */
const SS_MIN=0.6, SS_DEF=1.25;
let ssNow=SS_DEF;
let frAvg=16.7, wkAvg=4, frWarm=0, half=false;

/* ---- ölçüler: Holmdel — uzun bir omurga, onu noktalayan üç ışık avlusu ----
   Saarinen'in binasında belirleyici olan şey koridorun uzunluğu ve avluların
   bu uzunluğu ritimle bölmesi. Ölçüler oradan: 168 m omurga, 60 m en. */
const LEVELS=4, LEVEL_H=6.2, EYE=1.66;
const HALF_Z=100;       /* omurganın yarı uzunluğu → 200 m */
const SPINE_X=4;        /* koridorun yarı genişliği → 8 m */
const AT_X=17;          /* avlu kuyusunun dış kenarı — kuyular 13 m eninde */
const OUT_X=30;         /* binanın yarı eni: cam cephe burada */
const WALL_H=4.6;       /* koridor bölmesi; üstü açık, ışık clerestory'den düşer */
const PARA_H=1.05;      /* galeri korkuluğu */
const ATRIA=[-60,0,60]; /* ışık avlularının merkezleri */
const AT_Z=17;          /* avlunun yarı uzunluğu → 34 m; koridor 98 m, avlu 102 m */
const PIER_Z=4.5;       /* avlu kenarındaki dolu ayak: tabela + canlı eser */

let floors=[], ramps=[], posters=[], liveArt=[], glyphPanels=[];
let manta=null, consoleMesh=null;
let walls=[];      /* koridor bölmeleri: çarpışma için */
let promptDone=false;
let statics=[];   /* birleştirilecek hareketsiz yapı parçaları */
let player=null, mYaw=0, mPitch=0, curWing=null, lastSide=-1;
/* Bakışın HEDEFİ ayrı tutuluyor; kamera ona yumuşayarak yaklaşıyor. */
let mYawT=0, mPitchT=0;
let pickList=[], drawN=0, tickN=0, fpsAvg=60;
const PH={hareket:0, vatoz:0, afis:0, pano:0, sahne:0, gecis:0};
const slowLog=[];

/* ---- kanatlar: sayfanın sekiz bölümü, kat kat ---- */
const SEC_ORDER=["maps","visualizations","storytelling","investigations",
                 "immersive","interactives","drone","portfolios"];
const WINGS=SEC_ORDER.map((sec,i)=>({
  sec, level:Math.floor(i/2), side:(i%2===0?-1:1)
}));

/* ================= dokular ================= */
function wrapText(g,text,x,y,maxW,lh,max){
  const words=String(text).split(" "); let line="", n=0;
  for(const w of words){
    const t=line?line+" "+w:w;
    if(g.measureText(t).width>maxW && line){ g.fillText(line,x,y); y+=lh; line=w; n++; if(n>=max) return y; }
    else line=t;
  }
  if(line) { g.fillText(line,x,y); y+=lh; }
  return y;
}

/* Afiş: tipografi + bölümün tekniğini temsil eden durgun bir çizim */
const SEC_GLYPH={maps:"tiles", storytelling:"scroll", immersive:"cube",
  interactives:"gamepad", visualizations:"bars", investigations:"table",
  drone:"globe", portfolios:"panel"};

function posterTexture(p){
  const W=640,H=440;
  const cv=document.createElement("canvas"); cv.width=W; cv.height=H;
  const g=cv.getContext("2d");
  g.fillStyle="#F7F1E1"; g.fillRect(0,0,W,H);

  const sec=PSECT[p.sec];
  const col=catHex(sec.wing);

  /* üst şerit */
  g.fillStyle=col; g.fillRect(0,0,W,10);

  /* prosedürel çizim — statik, tek kare */
  g.save();
  g.translate(W-206, 44);
  drawGlyph(g, SEC_GLYPH[p.sec]||"panel", 81, 81, 162, 1.7 + p.i*0.37, "#343A30", (p.i%17)/17);
  g.restore();

  g.fillStyle="#6E6A5C";
  g.font='500 17px "IBM Plex Mono", monospace';
  g.fillText(sec.label.toUpperCase(), 34, 52);

  g.fillStyle="#343A30";
  g.font='800 40px "Bricolage Grotesque", system-ui, sans-serif';
  let y=wrapText(g,p.title,34,110,W-250,45,4);

  if(p.outlet){
    g.fillStyle="#4A4A40";
    g.font='400 22px "IBM Plex Sans", sans-serif';
    g.fillText(p.outlet, 34, Math.min(y+14, H-104));
  }

  /* alt künye */
  g.strokeStyle="#343A30"; g.lineWidth=2;
  g.beginPath(); g.moveTo(34,H-70); g.lineTo(W-34,H-70); g.stroke();
  g.fillStyle="#343A30";
  g.font='400 18px "IBM Plex Mono", monospace';
  const tech = p.tech.length ? p.tech.join(" · ") : "kütüphane imzası bulunamadı";
  g.fillText(tech.slice(0,52), 34, H-42);
  if(p.live==="ENGELLI"){
    g.fillStyle="#7A756A";
    g.font='400 15px "IBM Plex Mono", monospace';
    g.fillText("site otomatik erişimi engelliyor", 34, H-18);
  }
  const tex=new TH.CanvasTexture(cv);
  if(TH.SRGBColorSpace) tex.colorSpace=TH.SRGBColorSpace;
  tex.anisotropy=4;
  return tex;
}

function signTexture(sec){
  const W=900,H=260;
  const cv=document.createElement("canvas"); cv.width=W; cv.height=H;
  const g=cv.getContext("2d");
  g.fillStyle="#3C4239"; g.fillRect(0,0,W,H);
  const s=PSECT[sec];
  const col=catHex(s.wing);
  g.fillStyle=col; g.fillRect(0,0,W,8);
  g.fillStyle="#EFEBE2";
  g.font='800 76px "Bricolage Grotesque", system-ui, sans-serif';
  g.fillText(s.label, 36, 108);
  g.fillStyle="#B0B0A2";
  g.font='400 26px "IBM Plex Sans", sans-serif';
  wrapText(g,s.note,36,158,W-72,34,3);
  const tex=new TH.CanvasTexture(cv);
  if(TH.SRGBColorSpace) tex.colorSpace=TH.SRGBColorSpace;
  return tex;
}

/* ================= yapı =================
   Holmdel: bina boyunca tek bir omurga, onu noktalayan üç tam yükseklikte
   ışık avlusu, her katta avluya bakan galeriler. Omurga avludan bir köprüyle
   geçer; kuyular köprünün iki yanında açılır.

   Bina 200 m; avlular 34 m. Yürüyüşün yarısından çoğu dört katlı boşluğun
   altında geçsin diye böyle: koridor 98 m, avlu 102 m.

   Gündüz: cephe baştan sona cam, avluların tepesi camlı çatı. Cam saydam,
   arkasında boyanmış bir gökyüzü var; avlulardan içeri ışık huzmeleri düşüyor.

   Renk düzeni Ghibli'den: saf beyaz ve saf siyah yok. Aydınlık yüzeyler ılık
   krem, gölgeler soğuk mavi-yeşil, yapı koyu ama siyah değil. Ayrımı asıl
   yapan HemisphereLight: tepesi sıcak, yeri soğuk.                          */

let matSlab,matWall,matSoff,matDark,matGlass,matLamp,matLeaf,matPot;
let matCat={};

/* Müzenin bölüm renkleri atlasınkinden ayrı. Atlas kartlarında 10 kümenin
   t-SNE haritasında bir bakışta ayrılması gerekiyor — orada parlak ve doygun
   olmaları işlevsel. Müzede aynı renkler mekânı soğutuyor; burada aynı
   anahtarların susturulmuş, topraklı kardeşleri var. Bir anahtar burada yoksa
   atlasın rengine düşer. */
const CAT_MUSEUM={ geo:"#5E9B78", viz:"#6E93C0", "3d":"#9186B5", game:"#5A99A6",
  creative:"#C98BA4", motion:"#D1804A", audio:"#D4AE5C", sense:"#A3AC5A",
  story:"#C4705C", tools:"#9AA0A0" };
function catHex(wing){
  return CAT_MUSEUM[wing] ||
    getComputedStyle(document.documentElement).getPropertyValue("--cat-"+wing).trim() ||
    "#8A8A84";
}
function catMat(wing){
  if(!matCat[wing]){
    let col; try{ col=new TH.Color(catHex(wing)); }catch(e){ col=new TH.Color(0x8A8A84); }
    /* Lambert, Basic degil: renkli kapaklar da odanin isiginda yasasin. */
    matCat[wing]=new TH.MeshLambertMaterial({color:col});
  }
  return matCat[wing];
}

function slab(w,h,d,x,y,z,mat){
  const m=new TH.Mesh(new TH.BoxGeometry(w,h,d), mat||matSlab);
  m.position.set(x,y,z); mScene.add(m); statics.push(m); return m;
}

/* ---- statik yapıyı malzeme başına tek örgüde birleştir ----
   Yapının tamamı hareketsiz ve bir avuç malzeme paylaşıyor, ama her döşeme,
   duvar, korkuluk, kiriş ve çerçeve ayrı bir nesneydi: three her karede
   1000'den fazla nesneyi ayrı ayrı kırpıyor, sıralıyor ve çiziyordu. Bu
   maliyet pencere boyutundan BAĞIMSIZ — yani küçük ekranda da, büyükte de
   aynı. Dönüşümler köşe konumlarına pişiriliyor, o yüzden birleştirme ancak
   her şey yerine oturduktan SONRA yapılabilir.

   Dışarıda kalanlar: tıklanabilen konsol (ışın onu tek tek bulmalı) ve cam
   (saydam, kendi sıralamasını korusun). */
function mergeStatic(){
  const byMat=new Map();
  for(const m of statics){
    if(m.userData.console || m.material===matGlass) continue;
    let a=byMat.get(m.material); if(!a){ a=[]; byMat.set(m.material,a); }
    a.push(m);
  }
  const v=new TH.Vector3(), nm=new TH.Matrix3();
  for(const pair of byMat){
    const mat=pair[0], list=pair[1];
    if(list.length<4) continue;
    let n=0;
    const geos=list.map(m=>{
      const g=m.geometry.index ? m.geometry.toNonIndexed() : m.geometry;
      n+=g.attributes.position.count; return g;
    });
    const pos=new Float32Array(n*3), nor=new Float32Array(n*3), uvs=new Float32Array(n*2);
    let o=0;
    list.forEach((m,i)=>{
      const g=geos[i];
      m.updateMatrix();
      nm.getNormalMatrix(m.matrix);
      const p=g.attributes.position, na=g.attributes.normal, u=g.attributes.uv;
      for(let k=0;k<p.count;k++){
        v.fromBufferAttribute(p,k).applyMatrix4(m.matrix);
        pos[(o+k)*3]=v.x; pos[(o+k)*3+1]=v.y; pos[(o+k)*3+2]=v.z;
        if(na){ v.fromBufferAttribute(na,k).applyMatrix3(nm).normalize();
                nor[(o+k)*3]=v.x; nor[(o+k)*3+1]=v.y; nor[(o+k)*3+2]=v.z; }
        if(u){ uvs[(o+k)*2]=u.getX(k); uvs[(o+k)*2+1]=u.getY(k); }
      }
      o+=p.count;
      mScene.remove(m);
      if(g!==m.geometry) g.dispose();
      m.geometry.dispose();
    });
    const mg=new TH.BufferGeometry();
    mg.setAttribute("position",new TH.BufferAttribute(pos,3));
    mg.setAttribute("normal",new TH.BufferAttribute(nor,3));
    mg.setAttribute("uv",new TH.BufferAttribute(uvs,2));
    const mesh=new TH.Mesh(mg,mat);
    mesh.matrixAutoUpdate=false;
    mScene.add(mesh);
  }
  statics.length=0;
}

/* Tekrar eden yapı (cam kaydı, kolon, aydınlatma bandı, rampa dilimi, bank,
   bitki yaprağı) tek çizim çağrısına iner. Liste öğesi:
   [x, y, z, yaw, pitch, ölçek] — son üçü isteğe bağlı. */
function instanced(geo,mat,list){
  if(!list.length) return null;
  const im=new TH.InstancedMesh(geo,mat,list.length);
  const m=new TH.Matrix4(), q=new TH.Quaternion(), e=new TH.Euler(),
        sc=new TH.Vector3(), p=new TH.Vector3();
  list.forEach((a,i)=>{
    p.set(a[0],a[1],a[2]);
    e.set(a[4]||0, a[3]||0, 0, "YXZ"); q.setFromEuler(e);
    const s=(a[5]===undefined?1:a[5]); sc.set(s,s,s);
    m.compose(p,q,sc); im.setMatrixAt(i,m);
  });
  im.instanceMatrix.needsUpdate=true;
  mScene.add(im); return im;
}

function addFloor(x0,x1,z0,z1,y){
  floors.push({x0,x1,z0,z1,y});
  slab(x1-x0,.34,z1-z0,(x0+x1)/2,y-.17,(z0+z1)/2,matSlab);
  if(y>0) slab(x1-x0,.09,z1-z0,(x0+x1)/2,y-.40,(z0+z1)/2,matSoff);  /* alt katın tavanı */
}

/* Korkuluk: beyaz bir parapet ve üstünde bir kapak. O kapak, avludan
   bakıldığında katları birbirinden ayıran çizgidir — kompozisyonun beli.
   Kapak kanadın rengini taşır; bölümü bir bakışta belli eden şey odur. */
function parapet(w,d,x,y,z,capMat){
  slab(w,PARA_H,d,x,y+PARA_H/2,z,matWall);
  const cap=slab(w+.12,.11,d+.12,x,y+PARA_H+.055,z,capMat||matDark);
  return cap;
}

/* Korkuluk bir koşu hâlinde kurulur; rampa ve köprü ağızları boş bırakılır. */
function railRun(along, fixed, y, a0, a1, gaps, capMat){
  let cuts=[[a0,a1]];
  for(const g of gaps){
    const nx=[];
    for(const c of cuts){
      const a=c[0], b=c[1], g0=g[0], g1=g[1];
      if(g1<=a||g0>=b){ nx.push([a,b]); continue; }
      if(a<g0) nx.push([a,g0]);
      if(g1<b) nx.push([g1,b]);
    }
    cuts=nx;
  }
  for(const c of cuts){
    const a=c[0], b=c[1];
    if(b-a<=0.25) continue;
    if(along==="z") parapet(.36, b-a, fixed, y, (a+b)/2, capMat);
    else            parapet(b-a, .36, (a+b)/2, y, fixed, capMat);
  }
}

/* Omurganın dolu (avlusuz) Z bantları: afişlerin asıldığı duvar bunların üstünde. */
function solidBands(){
  const b=[]; let z=-HALF_Z;
  for(const cz of ATRIA){ b.push([z,cz-AT_Z]); z=cz+AT_Z; }
  b.push([z,HALF_Z]);
  return b;
}

/* Avluya sarkan dizin pankartı: o taraftaki dört kanadın adı, kendi renginde,
   kat yüksekliğine denk gelen bantlar hâlinde. Boşluğun yüksekliğini
   vurgular ve aynı anda nerede ne olduğunu söyler. */
function bannerTexture(sd){
  const W=232, H=1400;
  const cv=document.createElement("canvas"); cv.width=W; cv.height=H;
  const g=cv.getContext("2d");
  g.fillStyle="#F7F1E1"; g.fillRect(0,0,W,H);
  const list=WINGS.filter(w=>w.side===sd).sort((a,b)=>b.level-a.level);  /* üstten alta */
  const bh=H/list.length;
  list.forEach((w,i)=>{
    const y0=i*bh, s=PSECT[w.sec];
    g.fillStyle=catHex(s.wing);
    g.fillRect(0, y0+14, W, 14);
    if(i){ g.fillStyle="#CFC7B4"; g.fillRect(18, y0, W-36, 2); }
    g.save();
    g.translate(W/2, y0+bh/2);
    g.rotate(-Math.PI/2);
    g.textAlign="center";
    g.fillStyle="#343A30";
    g.font='800 46px "Bricolage Grotesque", system-ui, sans-serif';
    g.fillText(s.label, 0, 4);
    g.fillStyle="#7A756A";
    g.font='500 22px "IBM Plex Mono", monospace';
    g.fillText("KAT " + (w.level+1), 0, 40);
    g.restore();
  });
  const tex=new TH.CanvasTexture(cv);
  if(TH.SRGBColorSpace) tex.colorSpace=TH.SRGBColorSpace;
  tex.anisotropy=4;
  return tex;
}

/* Konsolun ön yüzündeki künye. */
function consoleTexture(){
  const W=640,H=306;
  const cv=document.createElement("canvas"); cv.width=W; cv.height=H;
  const g=cv.getContext("2d");
  g.fillStyle="#3C4239"; g.fillRect(0,0,W,H);
  g.fillStyle=catHex("3d"); g.fillRect(0,0,W,9);
  g.fillStyle="#EFEBE2";
  g.font='800 44px "Bricolage Grotesque", system-ui, sans-serif';
  g.fillText("Benekli kartal vatozu", 34, 84);
  g.fillStyle="#B0B0A2";
  g.font='400 21px "IBM Plex Sans", sans-serif';
  wrapText(g,"Kanat bir gezen dalga. Yay uzunluğu korunur: yüzey bükülür, gerilmez.",
           34,124,W-68,29,2);
  g.fillStyle="#EFEBE2";
  g.font='500 23px "IBM Plex Mono", monospace';
  g.fillText("\u25B6 KONTROL PANELİ — TIKLAYIN", 34, H-32);
  const tex=new TH.CanvasTexture(cv);
  if(TH.SRGBColorSpace) tex.colorSpace=TH.SRGBColorSpace;
  tex.anisotropy=4;
  return tex;
}

function buildMuseum(){
  mScene=new TH.Scene();
  mScene.background=skyTexture();
  mScene.fog=new TH.Fog(0xD4E1E2, 95, 430);   /* hava perspektifi: uzak uç puslanır */

  mCam=new TH.PerspectiveCamera(66,1,.08,520);
  /* Sıcak tepe, soğuk yer: ışık-gölge ayrımı aslında bu tek satır. */
  mScene.add(new TH.HemisphereLight(0xFFF6E8,0xB6C2BC,.72));
  const d1=new TH.DirectionalLight(0xFFEBCC,.42); d1.position.set(38,90,26); mScene.add(d1);
  const d2=new TH.DirectionalLight(0xB8CFE0,.22); d2.position.set(-50,26,-64); mScene.add(d2);

  /* Saf beyaz ve saf siyah yok. */
  matSlab =new TH.MeshLambertMaterial({color:0xEBE4D6});   /* ılık krem döşeme */
  matWall =new TH.MeshLambertMaterial({color:0xF0EBDF});
  matSoff =new TH.MeshLambertMaterial({color:0xD2D6CE});   /* gölgede kalan tavan */
  matDark =new TH.MeshLambertMaterial({color:0x4A4F43});   /* koyu, ama siyah değil */
  matGlass=new TH.MeshBasicMaterial({color:0xDCEAF0, transparent:true,
                                     opacity:.17, depthWrite:false});
  matLamp =new TH.MeshBasicMaterial({color:0xFBE3B0});     /* tavandaki sıcak bant */
  matLeaf =new TH.MeshLambertMaterial({color:0x7D9155});
  matPot  =new TH.MeshLambertMaterial({color:0xA9765A});   /* pişmiş toprak */
  matCat  ={};

  floors=[]; ramps=[]; posters=[]; liveArt=[]; glyphPanels=[]; statics=[];
  pavItems=[]; segWalls=[];
  const BANDS=solidBands();
  const RY=LEVELS*LEVEL_H;
  const mull=[], cols=[], roofBars=[], rampSlices=[], rampPosts=[],
        lamps=[], benches=[], planters=[], leaves=[];

  /* bir bitki: koyu bir saksı ve etrafa açılan yapraklar */
  function plantAt(x,y,z,i){
    planters.push([x, y+.25, z]);
    const n=9;
    for(let j=0;j<n;j++){
      const a=(j/n)*Math.PI*2 + i*0.73;
      const tilt=-(0.16 + 0.44*(((j*7+i*3)%5)/4));
      const s=(0.72 + 0.55*(((j*5+i*2)%7)/6)) * 0.42;   /* boyu ~1,5 m kalsın */
      leaves.push([x, y+.48, z, a, tilt, s]);
    }
  }

  /* ---- rampalar önce tarif edilir: korkuluk ağızları bunlara göre açılıyor ----
     Uç avlularda, kuyunun içinde. Kat kat taraf değiştirir; çıkarken zikzak
     çizersiniz ve her dönüşte avluyu boydan boya görürsünüz.                  */
  const RAMP_SIDE=[-1,1,-1];       /* 0→1 sol, 1→2 sağ, 2→3 sol */
  const RW=5.6, RN=44;
  const SLICE_D=(AT_Z*2)/RN+.06;
  const rampSpecs=[];
  for(const cz of [ATRIA[0], ATRIA[ATRIA.length-1]]){
    for(let k=0;k<LEVELS-1;k++){
      const sd=RAMP_SIDE[k];
      const x0 = sd>0 ? SPINE_X+2.2 : -(SPINE_X+2.2+RW);
      rampSpecs.push({cz:cz, sd:sd, k:k, x0:x0, x1:x0+RW, z0:cz-AT_Z, z1:cz+AT_Z,
                      y0:k*LEVEL_H, y1:(k+1)*LEVEL_H});
    }
  }

  /* ---- döşemeler ---- */
  for(let k=0;k<LEVELS;k++){
    const y=k*LEVEL_H;
    for(const b of BANDS) addFloor(-OUT_X,OUT_X,b[0],b[1],y);   /* tam kat plakası */
    for(const cz of ATRIA){
      const a0=cz-AT_Z, a1=cz+AT_Z;
      addFloor(-OUT_X,-AT_X,a0,a1,y);       /* sol kanat şeridi */
      addFloor( AT_X, OUT_X,a0,a1,y);       /* sağ kanat şeridi */
      addFloor(-SPINE_X,SPINE_X,a0,a1,y);   /* omurga avluyu köprüyle geçer */
      if(k===0){                            /* kuyunun tabanı: giriş katında
                                               avlu dipsiz bir çukurdu; şimdi
                                               altına girip yukarı bakılıyor */
        addFloor(-AT_X,-SPINE_X,a0,a1,y);
        addFloor( SPINE_X, AT_X,a0,a1,y);
      }
    }
    /* orta avluda her katta bir çapraz köprü — kat kat şaşırtmalı, alttan
       bakınca dördü birden okunsun diye */
    /* Çapraz köprü yalnız sol kuyuda: sağ kuyu baştan aşağı boş kalmalı,
       vatoz orada yüzüyor ve dört katı da kat ederek süzülüyor. */
    const bz=(k%2===0)?-10:10;
    addFloor(-AT_X,-SPINE_X, bz-1.7, bz+1.7, y);
  }

  /* ---- rampalar ---- */
  for(const r of rampSpecs){
    ramps.push({x0:r.x0,x1:r.x1,z0:r.z0,z1:r.z1,y0:r.y0,y1:r.y1});
    const cx=(r.x0+r.x1)/2, dz=r.z1-r.z0, dy=r.y1-r.y0;
    for(let i=0;i<RN;i++){
      const t=(i+.5)/RN;
      rampSlices.push([cx, r.y0+dy*t-.15, r.z0+dz*t]);
    }
    for(const s of [-1,1])
      for(let i=0;i<=RN;i+=5){
        const t=i/RN;
        rampPosts.push([cx+s*RW/2, r.y0+dy*t+.51, r.z0+dz*t]);
      }
    /* eğik alın kirişi ve küpeşte: rampanın eğimini çizen iki çizgi */
    const ang=Math.atan2(dy,dz), L=Math.hypot(dz,dy);
    for(const s of [-1,1])
      for(const oy of [-.16, 1.02]){
        const bar=slab(.14, oy<0?.46:.14, L, cx+s*RW/2, r.y0+dy/2+oy, r.z0+dz/2, matDark);
        bar.rotation.x=-ang;
      }
  }

  /* ---- omurga bölmeleri: afişlerin ve canlı panoların duvarı ----
     Üstü açık bırakıldı; ışık clerestory'den koridora düşüyor. Duvarın üst
     kenarı kanadın rengini taşır — koridorda yürürken hangi bölümdesiniz,
     tabelaya bakmadan bilinsin diye.                                          */
  /* Bölme her bandın iki ucunda kapı boşluğu bırakıyor. Eskiden duvar bandın
     boyunca kesintisizdi: koridordan kanada geçmenin MEŞRU BİR YOLU YOKTU,
     rampaya ulaşmak için duvarın içinden geçiliyordu. Boşluklar bilerek
     uçlarda — yani tam avlu ağızlarında, rampaların başladığı yerde. */
  const DOOR=2.0;
  walls=[];
  const slotsBy={};
  for(const w of WINGS){
    slotsBy[w.sec]=[];
    const y=w.level*LEVEL_H, sd=w.side;
    const cm=catMat(PSECT[w.sec].wing);
    for(const b of BANDS){
      const a0=b[0]+DOOR, a1=b[1]-DOOR, len=a1-a0, mid=(a0+a1)/2;
      slab(.4,WALL_H,len, sd*SPINE_X, y+WALL_H/2, mid, matWall);
      slab(.54,.17,len, sd*SPINE_X, y+WALL_H+.085, mid, cm);
      /* söveler: boşluk kapı olarak okunsun, duvar kesilmiş gibi durmasın */
      for(const jz of [a0,a1])
        slab(.56,WALL_H,.30, sd*SPINE_X, y+WALL_H/2, jz, matDark);
      walls.push({x:sd*SPINE_X, z0:a0, z1:a1, y:y});
      for(let z=a0+1.6; z<=a1-1.6; z+=3.0)
        slotsBy[w.sec].push({x:sd*(SPINE_X-0.22), z:z, ry: sd>0 ? -Math.PI/2 : Math.PI/2});
    }
  }

  /* ---- avlular: korkuluk, ayak, köprü, sarkan pankart ---- */
  for(let k=0;k<LEVELS;k++){
    const y=k*LEVEL_H;
    const bz=(k%2===0)?-10:10;
    for(const cz of ATRIA){
      for(const sd of [-1,1]){
        const zGaps = (cz===0 && sd<0) ? [[bz-1.7,bz+1.7]] : [];
        const e0 = sd>0 ? SPINE_X : -AT_X;
        const e1 = sd>0 ? AT_X    : -SPINE_X;
        const w  = WINGS.find(v=>v.level===k && v.side===sd);
        const cm = w ? catMat(PSECT[w.sec].wing) : null;

        railRun("z", sd*SPINE_X, y, cz-AT_Z, cz+AT_Z, zGaps, cm);
        railRun("z", sd*AT_X,    y, cz-AT_Z, cz+AT_Z,
                zGaps.concat([[cz-PIER_Z, cz+PIER_Z]]), cm);

        /* kuyunun kısa uçları — rampanın çıktığı yer açık bırakılır */
        for(const ez of [cz-AT_Z, cz+AT_Z]){
          const xg=[];
          for(const r of rampSpecs){
            if(r.cz!==cz || r.sd!==sd) continue;
            if((ez===r.z0 && k===r.k) || (ez===r.z1 && k===r.k+1)) xg.push([r.x0,r.x1]);
          }
          railRun("x", ez, y, e0, e1, xg, cm);
        }

        /* çapraz köprünün kenarları */
        if(cz===0 && sd<0) for(const rz of [bz-1.7, bz+1.7])
          parapet(e1-e0, .28, (e0+e1)/2, y, rz, cm);

        /* dolu ayak: kanat tabelası ve canlı eser buraya asılır */
        slab(.5, LEVEL_H, PIER_Z*2, sd*(AT_X+.25), y+LEVEL_H/2, cz, matWall);

        /* köprünün kenarında, kuyuya bakan bitkiler */
        plantAt(sd*(SPINE_X-1.1), y, cz-11, k*3+ (sd>0?1:0));
        plantAt(sd*(SPINE_X-1.1), y, cz+11, k*3+ (sd>0?2:0)+1);
      }
    }
  }

  /* ---- avluya sarkan dizin pankartları ---- */
  for(const cz of ATRIA){
    for(const sd of [-1,1]){
      if(cz===0 && sd>0) continue;      /* sağ kuyu vatozun: pankart asılmıyor */
      /* Yer değişti: eskiden x=±10,5 ve z=cz±9'daydı — yani tam rampanın
         x aralığının (6,2–11,8) ve çapraz köprünün z aralığının içinde.
         Pankartlar ikisinin de içinden geçiyordu. Şimdi kuyunun dış kenarına,
         ayakların arasındaki boşluğa asılıyor: rampadan da köprüden de uzak.

         Ve tek yüzlü iki düzlem sırt sırta. DoubleSide'dı: arkadan bakınca
         yazı ters okunuyordu. */
      const tex=bannerTexture(sd);
      for(const bz2 of [cz-14, cz+14]){
        for(const face of [0, Math.PI]){
          const bn=new TH.Mesh(new TH.PlaneGeometry(2.9, 21.2),
            new TH.MeshBasicMaterial({map:tex}));
          bn.position.set(sd*15, 13.6, bz2 + (face ? -0.03 : 0.03));
          bn.rotation.y=face;
          mScene.add(bn);
        }
      }
    }
  }

  /* ---- koridor: döşeme kılavuzu, banklar, tavan aydınlatması ----
     Boş beyaz zemin ve düz gri tavan mekânı basık gösteriyordu. Zemine iki
     kılavuz çizgi perspektifi çiziyor; tavandaki bantlar koyu kiriş değil
     ışık — kapak hissini tersine çeviren şey bu.                             */
  for(let k=0;k<LEVELS;k++){
    const y=k*LEVEL_H;
    const cy=(k===LEVELS-1) ? RY : (k+1)*LEVEL_H-0.445;
    for(const b of BANDS){
      const z0=b[0], z1=b[1], len=z1-z0, mid=(z0+z1)/2;
      for(const sd of [-1,1]){
        slab(.22,.03,len, sd*2.7, y+.02, mid, matDark);          /* döşeme kılavuzu */
        for(let z=z0+6; z<z1-3; z+=12) benches.push([sd*3.45, y+.22, z]);
      }
      for(let z=z0+1.7; z<z1-1.0; z+=3.4) lamps.push([0, cy-.11, z]);
      plantAt(-2.9, y, mid, k+1);
      plantAt( 2.9, y, mid, k+5);
    }
    /* avlulardaki köprüde de bank olsun: kuyuya bakılacak bir yer */
    for(const cz of ATRIA) for(const sd of [-1,1])
      benches.push([sd*3.45, y+.22, cz]);
  }

  /* ---- cephe: baştan sona cam, üstünde koyu kayıt ızgarası ----
     Saarinen'in "yapılmış en büyük ayna"sı içeriden böyle okunur: parlak cam,
     amansız tekrar eden ince dikmeler.                                       */
  for(let k=0;k<LEVELS;k++){
    const y=k*LEVEL_H;
    for(const sd of [-1,1]){
      slab(.14, LEVEL_H, HALF_Z*2, sd*OUT_X, y+LEVEL_H/2, 0, matGlass);
      slab(.30, .30, HALF_Z*2, sd*OUT_X, y+LEVEL_H-.15, 0, matDark);
      slab(.30, .30, HALF_Z*2, sd*OUT_X, y+.15, 0, matDark);
      slab(.26, .22, HALF_Z*2, sd*OUT_X, y+LEVEL_H*.5, 0, matDark);
      for(let z=-HALF_Z; z<=HALF_Z+.01; z+=1.5) mull.push([sd*OUT_X, y+LEVEL_H/2, z]);
      for(let z=-HALF_Z+6; z<=HALF_Z-6; z+=12) cols.push([sd*(OUT_X-6), y+LEVEL_H/2, z]);
    }
    for(const sz of [-1,1]){
      /* Zemin katın +Z ucunda pavyona açılan kapı. Cephe baştan sona camdı
         ve dışarıda hiç zemin yoktu; ikisi birden değişti. Kapı bilerek
         omurganın TAM EKSENİNDE: 200 m'lik perspektifin ucunda pavyon
         duruyor, yani dışarı çıkmadan önce görülüyor. */
      if(sz===1 && k===0){
        const DW=PAV_DOOR/2, DH=3.1, w2=OUT_X-DW;
        for(const s2 of [-1,1])
          slab(w2, LEVEL_H, .14, s2*(DW+w2/2), y+LEVEL_H/2, HALF_Z, matGlass);
        slab(PAV_DOOR, LEVEL_H-DH, .14, 0, y+DH+(LEVEL_H-DH)/2, HALF_Z, matGlass);
        for(const s2 of [-1,1]) slab(.26, DH, .34, s2*(DW+.13), y+DH/2, HALF_Z, matDark);
        slab(PAV_DOOR+.52, .26, .34, 0, y+DH+.13, HALF_Z, matDark);
        for(let x=-OUT_X; x<=OUT_X+.01; x+=1.5)
          if(Math.abs(x)>DW+.2) mull.push([x, y+LEVEL_H/2, HALF_Z]);
        continue;
      }
      slab(OUT_X*2, LEVEL_H, .14, 0, y+LEVEL_H/2, sz*HALF_Z, matGlass);
      for(let x=-OUT_X; x<=OUT_X+.01; x+=1.5) mull.push([x, y+LEVEL_H/2, sz*HALF_Z]);
    }
  }

  /* ---- çatı: avlular camlı, gerisi kapalı ---- */
  for(const b of BANDS) slab(OUT_X*2,.34,b[1]-b[0], 0, RY+.17, (b[0]+b[1])/2, matSoff);
  for(const cz of ATRIA){
    slab(OUT_X-AT_X,.34,AT_Z*2, -(AT_X+OUT_X)/2, RY+.17, cz, matSoff);
    slab(OUT_X-AT_X,.34,AT_Z*2,  (AT_X+OUT_X)/2, RY+.17, cz, matSoff);
    const g=new TH.Mesh(new TH.PlaneGeometry(AT_X*2, AT_Z*2), matGlass);
    g.rotation.x=Math.PI/2;                         /* aşağı bakar */
    g.position.set(0, RY-.02, cz);
    mScene.add(g);
    for(let z=cz-AT_Z+1.1; z<cz+AT_Z; z+=2.2) roofBars.push([0, RY-.18, z]);
  }

  /* ---- ışık huzmeleri ve düştükleri lekeler ----
     Camlı çatıdan inen ışık: mekâna hava, yön ve günün saati duygusunu veren
     şey bu. Toplamalı karıştırma; derinlik yazmıyor ama derinlik sınıyor —
     yani döşemenin arkasına geçince kesiliyor, önüne geçince parlıyor.       */
  const matShaft=new TH.MeshBasicMaterial({map:shaftTexture(), transparent:true,
    opacity:.55, blending:TH.AdditiveBlending, depthWrite:false,
    side:TH.DoubleSide, fog:false});
  const matPool=new TH.MeshBasicMaterial({map:poolTexture(), transparent:true,
    opacity:.8, blending:TH.AdditiveBlending, depthWrite:false, fog:false});
  for(const cz of ATRIA){
    for(let i=0;i<3;i++){
      const sh=new TH.Mesh(new TH.PlaneGeometry(10, 32), matShaft);
      sh.position.set(-10.5+i*10.5, RY-15, cz-7+i*7);
      sh.rotation.z=0.30;
      mScene.add(sh);
    }
    for(let k=0;k<LEVELS;k++){
      const po=new TH.Mesh(new TH.PlaneGeometry(9,11), matPool);
      po.rotation.x=-Math.PI/2;
      po.position.set(0.6, k*LEVEL_H+0.05, cz-4+k*3);
      mScene.add(po);
    }
  }

  const leafGeo=new TH.CylinderGeometry(.03,.20,2.3,3,1);
  leafGeo.translate(0,1.15,0); leafGeo.scale(1,1,.3);

  instanced(new TH.BoxGeometry(SPINE_X*2,.12,.26), matLamp, lamps);
  instanced(new TH.BoxGeometry(.17,LEVEL_H,.17), matDark, mull);
  instanced(new TH.BoxGeometry(.85,LEVEL_H,.85), matDark, cols);
  instanced(new TH.BoxGeometry(AT_X*2,.18,.18), matDark, roofBars);
  instanced(new TH.BoxGeometry(RW,.3,SLICE_D), matSlab, rampSlices);
  instanced(new TH.BoxGeometry(.12,1.02,.12), matDark, rampPosts);
  instanced(new TH.BoxGeometry(.5,.44,1.9), matDark, benches);
  instanced(new TH.BoxGeometry(.72,.5,.72), matPot, planters);
  instanced(leafGeo, matLeaf, leaves);

  /* ---- afişler, canlı panolar, tabelalar, canlı eserler ---- */
  const bySec={};
  PROJECTS.forEach(p=>{ (bySec[p.sec]=bySec[p.sec]||[]).push(p); });

  WINGS.forEach(w=>{
    const y=w.level*LEVEL_H, sd=w.side;
    const all=slotsBy[w.sec]||[];
    const list=bySec[w.sec]||[];
    const PW=2.34, PH=1.61;
    const ry = sd>0 ? -Math.PI/2 : Math.PI/2;
    const wingKey=PSECT[w.sec].wing;

    /* Her altıncı yuva afişe değil, canlı bir panoya ayrılıyor: koridorda
       daima kıpırdayan bir şey olsun diye. Kapı boşlukları duvarı kısaltınca
       yuva sayısı 30'dan 26'ya indi; altıda bir pano bırakınca 22 afiş yuvası
       kalıyor, en kalabalık bölüm de tam 22 iş. */
    const gSlots=[], pSlots=[];
    all.forEach((s,i)=>{ (i%6===2 ? gSlots : pSlots).push(s); });

    /* Yuvalar baştan doldurulmuyor: 7 işlik bir bölüm koridorun ilk çeyreğinde
       bitip binanın geri kalanını boş bırakmasın diye işler bütün boya yayılıyor. */
    const stride = pSlots.length / Math.max(1, list.length);
    list.forEach((p,idx)=>{
      const s=pSlots[Math.min(pSlots.length-1, Math.round(idx*stride+(stride-1)/2))];
      if(!s) return;
      const hy=y+2.15;
      const frame=slab(PW+.26, PH+.26, .09, s.x, hy, s.z, matDark);
      frame.rotation.y=s.ry;
      const mesh=new TH.Mesh(new TH.PlaneGeometry(PW,PH),
        new TH.MeshBasicMaterial({color:0xF7F1E1}));
      mesh.position.set(s.x+Math.sin(s.ry)*0.07, hy, s.z+Math.cos(s.ry)*0.07);
      mesh.rotation.y=s.ry;
      mesh.userData.project=p;
      mScene.add(mesh);
      posters.push({p:p, mesh:mesh, tex:null, pos:mesh.position.clone()});
    });

    /* Canlı panolar: kütüphanenin işini taklit eden prosedürel çizim, ama
       donmuş bir kare değil — yaklaşınca her karede yeniden çiziliyor.
       Canvas 2D, CDN yok, bedava. */
    const gLibs=LIBS.filter(l=>l.cat===wingKey && l.glyph);
    const gcol=catHex(wingKey);
    gSlots.forEach((s,n)=>{
      if(!gLibs.length) return;
      const l=gLibs[(n*3+w.level) % gLibs.length];
      const SZ=1.74, hy=y+2.15;
      const fr=slab(SZ+.24, SZ+.24, .09, s.x, hy, s.z, matDark); fr.rotation.y=s.ry;
      const cv=document.createElement("canvas"); cv.width=cv.height=256;
      const tex=new TH.CanvasTexture(cv);
      if(TH.SRGBColorSpace) tex.colorSpace=TH.SRGBColorSpace;
      const mesh=new TH.Mesh(new TH.PlaneGeometry(SZ,SZ),
        new TH.MeshBasicMaterial({map:tex}));
      mesh.position.set(s.x+Math.sin(s.ry)*0.07, hy, s.z+Math.cos(s.ry)*0.07);
      mesh.rotation.y=s.ry;
      mScene.add(mesh);
      const rec={l:l, g:cv.getContext("2d"), tex:tex, col:gcol,
                 pos:mesh.position.clone(), drawn:false};
      glyphPanels.push(rec);
      paintGlyph(rec, 1.2 + n*0.6 + w.level*0.3);   /* uzaktakiler boş kalmasın */
    });

    /* Kanat tabelası orta avlunun ayağında. Avlunun ortasında durup yukarı
       bakınca sekiz bölümün adı dört kat boyunca okunur — yön bulma budur. */
    const sgn=new TH.Mesh(new TH.PlaneGeometry(6.4,1.85),
      new TH.MeshBasicMaterial({map:signTexture(w.sec)}));
    sgn.position.set(sd*(AT_X-0.06), y+4.45, 0);
    sgn.rotation.y=ry;
    mScene.add(sgn);

    /* Canlı eserler: üç avlunun ayaklarında, kuyuya bakar. Karşı galeriden
       bakınca dört kat boyunca çalışan demolar görünür. */
    const cands=LIBS.filter(l=>l.cat===wingKey && DEMO_OF[l.name]).slice(0,3);
    cands.forEach((l,n)=>{
      const cz=ATRIA[n%ATRIA.length], S=2.9, ay=y+2.05;
      const fr=slab(S+.3,S+.3,.1, sd*(AT_X-0.04), ay, cz, matDark); fr.rotation.y=ry;
      const back=new TH.Mesh(new TH.PlaneGeometry(S,S),
        new TH.MeshBasicMaterial({color:0xF7F1E1}));
      back.position.set(sd*(AT_X-0.10), ay, cz); back.rotation.y=ry;
      mScene.add(back);
      const art=new TH.Mesh(new TH.PlaneGeometry(S-.16,S-.16),
        new TH.MeshBasicMaterial({transparent:true,opacity:0}));
      art.position.set(sd*(AT_X-0.12), ay, cz); art.rotation.y=ry;
      mScene.add(art);
      liveArt.push({l:l, key:DEMO_OF[l.name], art:art, host:null, tex:null, stop:null,
                    pos:art.position.clone()});
    });
  });

  /* ---- orta avlunun sağ kuyusu: vatoz ----
     Kuyu 13 × 34 m taban, 24,8 m derin. Simülasyon kendi biriminde koşup
     tek çarpanla buraya oturuyor; 2,4 m kanat açıklığı gerçek bir benekli
     kartal vatozunun ölçüsü. */
  manta=createManta(TH,{ span:2.4, x0:SPINE_X, z0:-AT_Z,
                         w:AT_X-SPINE_X, d:AT_Z*2, yLo:4.0, yHi:13.0 });
  mScene.add(manta.group);

  /* ---- kontrol konsolu: kuyunun kenarında bir pupitr ---- */
  const kx=SPINE_X-0.75, kz=8;
  consoleMesh=slab(.92,1.06,1.42, kx, .53, kz, matDark);
  consoleMesh.userData.console=true;
  const kt=slab(1.02,.10,1.52, kx, 1.10, kz, matWall);
  kt.rotation.z=0.20;
  const plc=new TH.Mesh(new TH.PlaneGeometry(1.30,.62),
    new TH.MeshBasicMaterial({map:consoleTexture(), side:TH.DoubleSide}));
  plc.position.set(kx-0.50, 1.42, kz);
  plc.rotation.y=-Math.PI/2;
  mScene.add(plc);

  /* Avlunun ağzında, koridora bakarak: hem 200 m'lik perspektif ilk karede
     duruyor, hem birkaç adım sonra kuyu ve vatoz açılıyor. */
  /* Işının bakacağı nesneler bir kez toplanıyor: her tıklamada yeni bir
     dizi kurmak gereksizdi, üstelik nişangâh her birkaç karede bir sınıyor. */
  /* ---- kampüs: dış zemin ve öğrenci pavyonu ----
     Sırası önemli: ikisi de slab() ile statics'e yazıyor, yani
     mergeStatic()'ten ÖNCE kurulmaları gerekiyor. */
  buildGround();
  buildPavilion();

  pickList=posters.map(p=>p.mesh);
  for(const it of pavItems){ pickList.push(it.mesh); if(it.label) pickList.push(it.label); }
  if(consoleMesh) pickList.push(consoleMesh);

  mergeStatic();

  /* Kalanların matrisi de bir kez hesaplanıp donduruluyor: three aksi hâlde
     her karede hepsini yeniden kuruyor. Kıpırdayan tek şey vatoz. */
  mScene.traverse(o=>{
    if(o===manta.group || o.parent===manta.group) return;
    if(o.isMesh || o.isInstancedMesh){ o.updateMatrix(); o.matrixAutoUpdate=false; }
  });

  player=new TH.Vector3(0, EYE, AT_Z+5);
  mYaw=0; mPitch=-0.02;
  mBuilt=true;
}

/* Duvar çarpışması. Eskiden yalnız ZEMİN sınanıyordu; duvarlar hiç
   sınanmıyordu, o yüzden koridor bölmesinin içinden geçilip gidiliyordu.
   Bölmeler eksene dik olduğu için sınama ucuz: hareket x=±SPINE_X'i kesiyor
   mu, kestiği nokta kapı boşluğuna mı denk geliyor. 32 duvar parçası var. */
function crossesWall(ax,az,bx,bz,y){
  for(const w of walls){
    if(Math.abs(w.y-y)>1.2) continue;
    if((ax-w.x)*(bx-w.x) >= 0) continue;
    const t=(w.x-ax)/(bx-ax);
    const zc=az+(bz-az)*t;
    if(zc>=w.z0 && zc<=w.z1) return true;
  }
  return false;
}

/* ================= zemin ================= */
function floorAt(x,z,curY){
  let best=null;
  for(const f of floors){
    if(x>=f.x0&&x<=f.x1&&z>=f.z0&&z<=f.z1){
      if(Math.abs(f.y-curY)<=1.8 && (best===null||f.y>best)) best=f.y;
    }
  }
  for(const r of ramps){
    if(x>=r.x0&&x<=r.x1&&z>=r.z0&&z<=r.z1){
      const t=(z-r.z0)/(r.z1-r.z0);
      const y=r.y0+(r.y1-r.y0)*t;
      if(Math.abs(y-curY)<=1.8 && (best===null||y>best)) best=y;
    }
  }
  return best;
}

/* ================= afiş dokularını yakında üret ================= */
function syncPosters(){
  const NEAR=26, FAR=34;
  for(const it of posters){
    const d=it.pos.distanceTo(player);
    if(d<NEAR && !it.tex){
      it.tex=posterTexture(it.p);
      it.mesh.material.map=it.tex; it.mesh.material.needsUpdate=true;
    } else if(d>FAR && it.tex){
      it.mesh.material.map=null; it.mesh.material.needsUpdate=true;
      it.tex.dispose(); it.tex=null;
    }
  }
  /* Canlı eser bütçesi. Eskiden 22 m içindeki HER eser bağlanıyordu ve orta
     avluda altısı birden çalışıyordu — her biri kendi kütüphanesini kendi
     döngüsünde çalıştırıp her karede bir doku yüklüyor. Artık en yakın üçü,
     ve ağırlardan (WebGL / model eğiten) yalnız biri. Zaten bağlı olanlar
     30 m'ye kadar bağlı kalıyor: sınırda gidip gelmesin. */
  const near=[];
  for(const it of liveArt){
    it.d=it.pos.distanceTo(player);
    if(it.d < (it.host?30:22)) near.push(it);
  }
  near.sort((a,b)=>a.d-b.d);
  const want=new Set(); let heavy=0;
  for(const it of near){
    if(want.size>=3) break;
    if(HEAVY.has(it.key)){ if(heavy>=1) continue; heavy++; }
    want.add(it);
  }
  for(const it of liveArt){
    if(want.has(it)){ if(!it.host) mountArt(it); }
    else if(it.host) unmountArt(it);
  }
}
/* Canlı pano: kütüphanenin işini taklit eden prosedürel çizim. Afişteki
   donmuş kare değil — yaklaşınca her karede yeniden çiziliyor. */
function paintGlyph(p, t){
  const g=p.g;
  g.fillStyle="#F7F1E1"; g.fillRect(0,0,256,256);
  g.fillStyle=p.col;     g.fillRect(0,0,256,7);
  drawGlyph(g, p.l.glyph, 128, 124, 168, t, "#343A30", p.l.seed);
  g.fillStyle="#6E6A5C";
  g.font='500 15px "IBM Plex Mono", monospace';
  g.fillText(String(p.l.name).slice(0,24), 16, 234);
  p.tex.needsUpdate=true;
}
/* Aynı anda en fazla beşi canlı — canvas 2D ucuz ama bedava değil. */
function syncGlyphs(now){
  if(!glyphPanels.length) return;
  const t=now*0.001, near=[];
  for(const p of glyphPanels){
    const d=p.pos.distanceTo(player);
    if(d<28) near.push([d,p]);
  }
  near.sort((a,b)=>a[0]-b[0]);
  for(const p of glyphPanels) p.drawn=false;
  for(let i=0;i<near.length && i<5;i++){
    paintGlyph(near[i][1], t);
    near[i][1].drawn=true;
  }
}

function mountArt(rec){
  const host=document.createElement("div");
  /* 256 -> tuval 512x512. Eskiden 512 veriliyordu, yani 1024x1024'lük bir
     doku (4 MB) her karede GPU'ya yükleniyordu; beş eserde 20 MB/kare. Eser
     düzlemi 2,7 m ve ona en yakın 10 m'den bakılıyor — 512 fazlasıyla yeter. */
  host.style.cssText="position:fixed;left:-4000px;top:0;width:256px;height:256px;pointer-events:none";
  document.body.appendChild(host); rec.host=host;
  loadLib(rec.key).then(()=>{
    if(!rec.host) return;
    try{ rec.stop=DEMOS[rec.key](host,256,"#343A30",{interactive:false}); }
    catch(e){ return; }
    const cv=host.querySelector("canvas"); if(!cv) return;
    rec.tex=new TH.CanvasTexture(cv);
    if(TH.SRGBColorSpace) rec.tex.colorSpace=TH.SRGBColorSpace;
    rec.art.material.map=rec.tex; rec.art.material.opacity=1;
    rec.art.material.needsUpdate=true;
  }).catch(()=>{});
}
function unmountArt(rec){
  if(rec.stop){ try{rec.stop();}catch(e){} rec.stop=null; }
  if(rec.tex){ rec.tex.dispose(); rec.tex=null; }
  rec.art.material.map=null; rec.art.material.opacity=0; rec.art.material.needsUpdate=true;
  if(rec.host){ rec.host.remove(); rec.host=null; }
}

/* ================= ışık ve hava =================
   Dither kaldırıldı. Eskiden sahne üç kez çiziliyordu (renk + iki maske
   geçişi) ve sonuç iki renge indiriliyordu; artık bir kez çiziliyor ve
   tek bir "boyama" geçişinden geçiyor. CRISP katmanı da gitti — artık
   her şeyin rengi olduğu gibi kalıyor.

   Geçiş üç şey yapıyor:
     1. yumuşak parlaklık (bloom) — ışığın etrafında boya gibi dağılması
     2. sıcak-soğuk ayrımı — aydınlık yüzeyler altına, gölgeler mavi-yeşile
     3. köşelerde hafif kararma ve çok ince bir kâğıt dokusu

   Kenar yumuşatma render hedefini ekrandan SS kat büyük çizip küçülterek
   geliyor; WebGL1'de render hedefinde MSAA yok.                            */

const GFS=[
"precision highp float;","varying vec2 vUv;",
"uniform sampler2D tDiffuse;","uniform vec2 uRes;","uniform float uBloom;",
"float hash(vec2 p){ p=fract(p*vec2(443.897,441.423)); p+=dot(p,p+19.19); return fract(p.x*p.y); }",
"vec3 hi(vec2 uv){ return max(texture2D(tDiffuse,uv).rgb-0.84,0.0); }",
"void main(){",
"  vec3 base=texture2D(tDiffuse,vUv).rgb;",
"  vec2 r1=3.0/uRes, r2=8.0/uRes;",
"  vec3 b=vec3(0.0);",
"  b+=hi(vUv+vec2( r1.x,0.0)); b+=hi(vUv+vec2(-r1.x,0.0));",
"  b+=hi(vUv+vec2(0.0, r1.y)); b+=hi(vUv+vec2(0.0,-r1.y));",
"  b+=hi(vUv+vec2( r1.x, r1.y)); b+=hi(vUv+vec2(-r1.x,-r1.y));",
"  b+=hi(vUv+vec2( r2.x,0.0)); b+=hi(vUv+vec2(-r2.x,0.0));",
"  b+=hi(vUv+vec2(0.0, r2.y)); b+=hi(vUv+vec2(0.0,-r2.y));",
"  b+=hi(vUv+vec2( r2.x,-r2.y)); b+=hi(vUv+vec2(-r2.x, r2.y));",
"  vec3 c=base + (b/12.0)*uBloom;",
"  float l=dot(c,vec3(0.299,0.587,0.114));",
"  c=mix(c*vec3(0.96,0.99,1.04), c*vec3(1.03,1.005,0.96), smoothstep(0.22,0.86,l));",
"  float v=1.0-0.24*pow(clamp(length(vUv-0.5)*1.42,0.0,1.0),2.0);",
"  c*=v;",
"  c+=(hash(floor(vUv*uRes))-0.5)*0.014;",
"  gl_FragColor=vec4(clamp(c,0.0,1.0),1.0);",
"}"].join("\n");
const GVS=["varying vec2 vUv;",
"void main(){ vUv=uv; gl_Position=vec4(position.xy,0.0,1.0); }"].join("\n");

function buildPost(){
  mPostScene=new TH.Scene();
  mPostCam=new TH.OrthographicCamera(-1,1,1,-1,0,1);
  mPostMat=new TH.ShaderMaterial({
    uniforms:{tDiffuse:{value:null}, uRes:{value:new TH.Vector2(1,1)},
              uBloom:{value:0.6}},
    vertexShader:GVS, fragmentShader:GFS, depthTest:false, depthWrite:false});
  mPostScene.add(new TH.Mesh(new TH.PlaneGeometry(2,2),mPostMat));
}

/* Gökyüzü: elle boyanmış bir gradyan ve üstüne yumuşak bulut öbekleri.
   Sahne arka planı olarak (equirect) veriliyor — kamerayla birlikte
   gitmesi, kırpılmaması ve sise girmemesi için. */
function skyTexture(){
  const W=2048, H=1024;
  const cv=document.createElement("canvas"); cv.width=W; cv.height=H;
  const g=cv.getContext("2d");
  const grd=g.createLinearGradient(0,0,0,H);
  grd.addColorStop(0.00,"#4E88BE");
  grd.addColorStop(0.34,"#7FB3D6");
  grd.addColorStop(0.55,"#A9CCDF");
  grd.addColorStop(0.70,"#D3DFDC");
  grd.addColorStop(0.84,"#E9E2CC");
  grd.addColorStop(1.00,"#CFC0A4");
  g.fillStyle=grd; g.fillRect(0,0,W,H);

  let s=7;
  const rnd=()=>{ s=(s*1103515245+12345)&0x7fffffff; return s/0x7fffffff; };
  for(let i=0;i<30;i++){
    const cx=rnd()*W, cy=H*(0.16+rnd()*0.36), sc=70+rnd()*150;
    for(let j=0;j<10;j++){
      const ox=cx+(rnd()-0.5)*sc*2.7, oy=cy+(rnd()-0.5)*sc*0.66;
      const r=sc*(0.34+rnd()*0.52);
      const rg=g.createRadialGradient(ox,oy,0,ox,oy,r);
      rg.addColorStop(0.00,"rgba(255,253,246,0.90)");
      rg.addColorStop(0.52,"rgba(250,246,236,0.46)");
      rg.addColorStop(1.00,"rgba(248,243,232,0.00)");
      g.fillStyle=rg; g.beginPath(); g.arc(ox,oy,r,0,6.2832); g.fill();
    }
  }
  const tex=new TH.CanvasTexture(cv);
  tex.mapping=TH.EquirectangularReflectionMapping;
  return tex;
}

/* Işık huzmesi: kenarları eriyen dikey bir bant. Katı geometri kullanıp
   toplamalı karıştırmakla çizgi gibi duruyordu; dokunun alfası eritiyor. */
function shaftTexture(){
  const W=128, H=512;
  const cv=document.createElement("canvas"); cv.width=W; cv.height=H;
  const g=cv.getContext("2d");
  const lin=g.createLinearGradient(0,0,0,H);
  lin.addColorStop(0.00,"rgba(255,241,206,0.00)");
  lin.addColorStop(0.16,"rgba(255,241,206,0.95)");
  lin.addColorStop(0.62,"rgba(255,238,198,0.45)");
  lin.addColorStop(1.00,"rgba(255,236,194,0.00)");
  g.fillStyle=lin; g.fillRect(0,0,W,H);
  const side=g.createLinearGradient(0,0,W,0);
  side.addColorStop(0.00,"rgba(0,0,0,1)");
  side.addColorStop(0.26,"rgba(0,0,0,0)");
  side.addColorStop(0.74,"rgba(0,0,0,0)");
  side.addColorStop(1.00,"rgba(0,0,0,1)");
  g.globalCompositeOperation="destination-out";
  g.fillStyle=side; g.fillRect(0,0,W,H);
  return new TH.CanvasTexture(cv);
}

/* Huzmenin döşemeye düştüğü yer: yumuşak kenarlı sıcak bir leke. */
function poolTexture(){
  const S=256;
  const cv=document.createElement("canvas"); cv.width=cv.height=S;
  const g=cv.getContext("2d");
  const rg=g.createRadialGradient(S/2,S/2,0,S/2,S/2,S/2);
  rg.addColorStop(0.00,"rgba(255,240,202,0.85)");
  rg.addColorStop(0.48,"rgba(255,236,194,0.38)");
  rg.addColorStop(1.00,"rgba(255,234,190,0.00)");
  g.fillStyle=rg; g.fillRect(0,0,S,S);
  return new TH.CanvasTexture(cv);
}

/* ================= girdi ================= */
/* Kamera baştan yazıldı. Eskisinde dört ayrı hata vardı ve hiçbiri kare
   hızıyla ilgili değildi — "buggy" hissinin gerçek kaynağı bunlardı:
     1. Fare kilidi ÇİFT tıklamayla açılıyordu; kimse tahmin edemez. Kilit
        yoksa düğmeyi basılı tutup sürüklemek gerekiyordu.
     2. Escape fareyi bırakırken sizi müzeden de atıyordu (tarayıcı kilidi
        bırakıyor, bizim tuş işleyicimiz de exitMuseum çağırıyordu).
     3. Nişangâh yoktu: neye tıkladığınızı göremiyordunuz.
     4. 7 pikselden küçük sürüklemeler "tıklama" sayılıyordu; küçük bir
        kayma yanlışlıkla modal açıyor, biraz büyüğü hiçbir şey yapmıyordu.
   Şimdi: tek tıkla kilit, nişangâh, Escape yalnız fareyi bırakır, kilitliyken
   bakış ve seçme hiç karışmaz. */
const KEY={};
let look=null, joy={x:0,y:0,id:null,cx:0,cy:0}, locked=false, unlockAt=-1e9;
const SENS=0.0026;            /* tek duyarlılık: sürükleme de kilit de aynı */

function onKey(e,down){
  if(!museumOn) return;
  KEY[e.code]=down;
  if(down && e.code==="Backquote"){ mmeterEl.hidden=!mmeterEl.hidden; }
  if(down && e.code==="Tab"){
    e.preventDefault();
    if(mguideEl.hidden) openGuide(); else closeGuide();
  }
  if(down && e.code==="Escape"){
    if(!pmodal.hidden) closeModal();
    else if(!mguideEl.hidden) closeGuide();
    else if(!mpanel.hidden) closePanel();
    else if(locked || performance.now()-unlockAt<400){
      /* Escape fareyi bıraktı — müzeden ÇIKARMAZ. Çıkmak için bir daha bas. */
      if(document.pointerLockElement) document.exitPointerLock();
    }
    else exitMuseum();
  }
  if(["KeyW","KeyA","KeyS","KeyD","ArrowUp","ArrowDown","ArrowLeft","ArrowRight","Space"].includes(e.code)) e.preventDefault();
}
addEventListener("keydown",e=>onKey(e,true));
addEventListener("keyup",e=>onKey(e,false));

function isTouch(e){ return e.pointerType==="touch"; }

function ndcOf(e){
  const r=mCanvas.getBoundingClientRect();
  return { x:((e.clientX-r.left)/r.width)*2-1, y:-(((e.clientY-r.top)/r.height)*2-1) };
}
mCanvas.addEventListener("pointerdown",e=>{
  if(!pmodal.hidden || !mpanel.hidden || !mguideEl.hidden) return;
  if(isTouch(e)){
    const r=mCanvas.getBoundingClientRect(), lx=e.clientX-r.left;
    if(lx < r.width*0.44 && joy.id===null){
      joy.id=e.pointerId; joy.cx=e.clientX; joy.cy=e.clientY;
      joyEl.classList.add("on");
      mCanvas.setPointerCapture(e.pointerId);
      return;
    }
    look={id:e.pointerId,x:e.clientX,y:e.clientY,moved:0,t:performance.now()};
    mCanvas.setPointerCapture(e.pointerId);
    return;
  }
  /* Masaüstü: ilk tıklama fareyi alır, sonrakiler nişangâhın altındakini
     seçer. Bakış ve seçme böylece hiç karışmıyor.

     Ama tıklama aynı anda sürükle-bak için de hazırlanıyor: tarayıcı kilidi
     reddederse (izin, gömülü çerçeve, bazı ayarlar) kullanıcı hiçbir şey
     yapamaz hâlde kalmasın. Kilit açılırsa bakış movementX'ten gider ve
     aşağıdaki sürükleme dalı zaten atlanır. */
  if(!locked){
    look={id:e.pointerId,x:e.clientX,y:e.clientY,moved:0,t:performance.now()};
    /* Kilit her ortamda mümkün değil: gömülü çerçevede tarayıcı
       WrongDocumentError ile reddediyor. Reddi yutuyoruz; sürükle-bak
       zaten devrede kalıyor, kullanıcı hiçbir şey kaybetmiyor. */
    try{ const pl=mCanvas.requestPointerLock && mCanvas.requestPointerLock();
         if(pl && pl.catch) pl.catch(()=>{}); }catch(err){}
    return;
  }
  act(castAt(0,0));
});
mCanvas.addEventListener("pointermove",e=>{
  if(joy.id===e.pointerId){
    const dx=e.clientX-joy.cx, dy=e.clientY-joy.cy;
    const max=52, d=Math.hypot(dx,dy), k=d>max?max/d:1;
    joy.x=(dx*k)/max; joy.y=-(dy*k)/max;
    joyKnob.style.transform=`translate(${dx*k}px,${dy*k}px)`;
    return;
  }
  if(locked){
    promptSeen();
    mYawT   -= e.movementX*SENS;
    mPitchT  = Math.max(-1.05,Math.min(1.0, mPitchT - e.movementY*SENS));
  } else if(look && look.id===e.pointerId){
    if(look.moved>26) promptSeen();
    const dx=e.clientX-look.x, dy=e.clientY-look.y;
    look.moved+=Math.abs(dx)+Math.abs(dy);
    mYawT   -= dx*SENS;
    mPitchT  = Math.max(-1.05,Math.min(1.0, mPitchT - dy*SENS));
    look.x=e.clientX; look.y=e.clientY;
  }
});
function endPtr(e){
  if(joy.id===e.pointerId){
    joy.id=null; joy.x=joy.y=0; joyKnob.style.transform="";
    joyEl.classList.remove("on"); return;
  }
  if(look && look.id===e.pointerId){
    /* Kilit açıldıysa bu tıklama yalnız fareyi almaktı, bir şey seçmez.
       Açılmadıysa (dokunmatik ya da kilidi reddeden tarayıcı) kısa ve
       yerinde bir dokunuş nişan alınanı seçer. */
    if(!locked && look.moved<9 && performance.now()-look.t<500){
      const n=ndcOf(e); act(castAt(n.x,n.y));
    }
    look=null;
  }
}
mCanvas.addEventListener("pointerup",endPtr);
mCanvas.addEventListener("pointercancel",endPtr);
mCanvas.addEventListener("wheel",e=>e.preventDefault(),{passive:false});

document.addEventListener("pointerlockchange",()=>{
  const was=locked;
  locked = document.pointerLockElement===mCanvas;
  if(was && !locked) unlockAt=performance.now();
  museumEl.classList.toggle("look",locked);
  xhairEl.classList.toggle("on",locked);
  syncPrompt();
});
function syncPrompt(){
  const touch=matchMedia("(pointer:coarse)").matches;
  mclickEl.hidden = promptDone || !museumOn || locked || touch;
}
/* Davet bir kez işini görür ve gider. Eskiden kilit açılmadığı sürece (ve
   bu ortamda kilit hiç açılmıyor) bütün deneyim boyunca ekranda kalıyordu. */
function promptSeen(){
  if(promptDone) return;
  promptDone=true;
  mclickEl.style.opacity="0";            /* sönerek gitsin, zıplayarak değil */
  setTimeout(()=>{ syncPrompt(); mclickEl.style.opacity=""; }, 520);
}

/* ================= tıklama: esere bak ================= */

let raycaster=null;
/* Normalize edilmiş ekran koordinatından ışın at. (0,0) = nişangâh. */
function castAt(nx,ny){
  if(!raycaster) raycaster=new TH.Raycaster();
  raycaster.layers.enableAll();
  raycaster.setFromCamera({x:nx,y:ny}, mCam);
  const h=raycaster.intersectObjects(pickList,false);
  return (h.length && h[0].distance<26) ? h[0].object : null;
}
function act(o){
  if(!o) return;
  if(o.userData.console) openPanel();
  else if(o.userData.project) openModal(o.userData.project);
  else if(o.userData.grad) openGrad(o.userData.grad);
}

function openModal(p){
  const sec=PSECT[p.sec];
  const col=`var(--cat-${sec.wing})`;
  const libs=p.tech.map(t=>{
    const j=LIBS.findIndex(l=>l.name===t || l.name.split(" ")[0]===t.split(" ")[0]);
    return j>=0 ? `<button data-lib="${j}" style="--nc:var(--cat-${LIBS[j].cat})">${t}</button>`
                : `<span>${t}</span>`;
  }).join("");
  const famLibs=LIBS.filter(l=>l.cat===sec.wing).slice(0,6)
    .map(l=>`<button data-lib="${l.i}" style="--nc:var(--cat-${l.cat})">${l.name}</button>`).join("");

  pmodalCard.style.setProperty("--c",col);
  pmodalCard.innerHTML=`
    <div class="pm__top">
      <span class="pm__sec">${sec.label}</span>
      <button class="pm__x" id="pmX" aria-label="Kapat">&#10005;</button>
    </div>
    <h3>${p.title}</h3>
    ${p.outlet?`<p class="pm__outlet">${p.outlet}</p>`:""}
    <p class="pm__note">${sec.note}</p>
    ${p.tech.length?`<p class="pm__lbl">Sayfa kaynağında tespit edilen kütüphaneler</p>
      <div class="pm__chips">${libs}</div>
      <p class="pm__warn">Bu adlar tahmin değil, sayfanın kaynak kodunda imza aranarak bulundu. Bir kısmı üçüncü taraf betiklerden geliyor olabilir.</p>`
     :`<p class="pm__lbl">Bu bölümün teknik ailesi</p><div class="pm__chips">${famLibs}</div>
       <p class="pm__warn">Bu işin kaynağında tanıdık bir kütüphane imzası bulunamadı; bölümün genel ailesi gösteriliyor.</p>`}
    <a class="pm__go" href="${p.url}" target="_blank" rel="noopener noreferrer">Orijinali aç &#8599;</a>
    ${p.live==="ENGELLI"?`<p class="pm__warn">Not: bu site otomatik erişimi engelliyor (NYT, Bloomberg, Washington Post). Bağlantı tarayıcıda açılır.</p>`:""}
  `;
  if(document.pointerLockElement) document.exitPointerLock();
  pmodal.hidden=false;
  document.getElementById("pmX").addEventListener("click",closeModal);
}
function closeModal(){ pmodal.hidden=true; }

/* ===================== vatoz kontrol paneli =====================
   Konsola tıklayınca açılır. Kaydıraklar doğrudan simülasyonun
   parametrelerine bağlı — hayvan anında değişir.                 */
const MP_SPEC=[
  ["FR",   "kanat çırpma",     10,150, 55, x=>x.toFixed(2)+" Hz"],
  ["AMP",  "çırpma genliği",    0,200,100, x=>x.toFixed(2)],
  ["WAVE", "açıklık dalgası",   0,250,100, x=>x.toFixed(2)],
  ["PITCH","veter hatvesi",     0,220,100, x=>x.toFixed(2)],
  ["TL",   "kuyruk boyu",      20,200,100, x=>x.toFixed(2)],
  ["DRAG", "suyun direnci",    30,250,100, x=>x.toFixed(2)],
  ["SPOT", "benekler",          0,200,100, x=>x.toFixed(2)]
];
let mpBuilt=false;
function buildPanel(){
  if(mpBuilt||!manta) return; mpBuilt=true;
  mpBody.innerHTML =
    MP_SPEC.map(r=>`<div class="mp__row"><label>${r[1]}<u id="mpv${r[0]}"></u></label>`+
      `<input id="mp${r[0]}" type="range" min="${r[2]}" max="${r[3]}" value="${r[4]}" step="1"></div>`).join("")
    + `<div class="mp__btns"><button id="mpBurst">hamle</button>`
    + `<button id="mpReset">sıfırla</button></div>`
    + `<p class="mp__note">Her açıklık istasyonu bir öncekinden geç çırpar — kanat boyunca bir dalga yürür. İtki iki vuruşta da pozitif olduğu için hayvan hamle atıp süzülür, çırpma frekansının iki katında.</p>`;
  MP_SPEC.forEach(r=>{
    const el=document.getElementById("mp"+r[0]), out=document.getElementById("mpv"+r[0]);
    const upd=()=>{ const v=(+el.value)/100; manta.par[r[0]]=v; out.textContent=r[5](v);
                    if(r[0]==="SPOT") manta.spotsChanged(); };
    el.addEventListener("input",upd); upd();
  });
  document.getElementById("mpBurst").addEventListener("click",()=>manta.burst());
  document.getElementById("mpReset").addEventListener("click",()=>{
    MP_SPEC.forEach(r=>{
      const el=document.getElementById("mp"+r[0]);
      el.value=r[4]; el.dispatchEvent(new Event("input"));
    });
  });
}
/* ===================== müze rehberi =====================
   200 m'lik dört katlı bir binada "nerede ne var" sorusunun cevabı
   yalnız avlunun ortasında duruyordu (sarkan pankartlar). Tab bunu
   her yerden veriyor; bulunduğunuz kat ve kanat işaretli. */
function buildGuide(){
  const say={}; PROJECTS.forEach(p=>{ say[p.sec]=(say[p.sec]||0)+1; });
  let h='<header><b>Kampüs rehberi</b>'+
        '<button class="pm__x" id="mgX" aria-label="Kapat">&#10005;</button></header>'+
        '<div class="mg__body">';
  for(let k=LEVELS-1;k>=0;k--){
    h+=`<div class="mg__row" data-lvl="${k}"><span class="mg__lvl">kat ${k+1}</span>`;
    for(const sd of [-1,1]){
      const w=WINGS.find(v=>v.level===k&&v.side===sd);
      if(!w){ h+='<span class="mg__w"></span>'; continue; }
      const sec=PSECT[w.sec];
      h+=`<span class="mg__w" data-side="${sd}" style="--c:${catHex(sec.wing)}">`+
         `<i></i>${sec.label}<u>${say[w.sec]||0}</u></span>`;
    }
    h+='</div>';
  }
  h+='</div>';
  /* Pavyon rehberde ayrı bir satır: binanın katlarından biri değil, dışarıda
     duran ikinci bir yapı. Kat listesiyle aynı hizada gösterilirse kampüs
     tek bir bina gibi okunur. */
  if(typeof GRAD!=="undefined" && GRAD.length){
    h+='<div class="mg__row mg__row--pav"><span class="mg__lvl">dışarısı</span>'+
       `<span class="mg__w" style="--c:#C98BA4"><i></i>Öğrenci pavyonu<u>${GRAD.length}</u></span>`+
       '<span class="mg__w"></span></div>';
  }
  h+='<p class="mg__note">Katlar arası bağlantı uç avlulardaki rampalardır. '+
     'Koridordan kanatlara geçiş, bölmelerin iki ucundaki kapılardan — '+
     'yani avlu ağızlarında. Pavyona omurganın kuzey ucundaki kapıdan '+
     'çıkılır; taş yol oraya gider.</p>';
  mguideEl.innerHTML=h;
  document.getElementById("mgX").addEventListener("click",closeGuide);
}
function markHere(){
  const lvl=Math.max(0,Math.min(LEVELS-1,Math.round((player.y-EYE)/LEVEL_H)));
  mguideEl.querySelectorAll(".mg__row").forEach(r=>{
    const on=(+r.dataset.lvl===lvl);
    if(on) r.setAttribute("data-here",""); else r.removeAttribute("data-here");
    r.querySelectorAll(".mg__w").forEach(wEl=>{
      if(on && +wEl.dataset.side===lastSide) wEl.setAttribute("data-here","");
      else wEl.removeAttribute("data-here");
    });
  });
}
let guideBuilt=false;
function openGuide(){
  if(!guideBuilt){ buildGuide(); guideBuilt=true; }
  if(document.pointerLockElement) document.exitPointerLock();
  markHere(); mguideEl.hidden=false; promptSeen();
}
function closeGuide(){ mguideEl.hidden=true; }

function openPanel(){
  /* Fare kilitliyken kaydıraklara dokunulamaz — paneli açarken bırak. */
  if(document.pointerLockElement) document.exitPointerLock();
  buildPanel(); mpanel.hidden=false;
}
function closePanel(){ mpanel.hidden=true; }
document.getElementById("mpX").addEventListener("click",closePanel);
pmodal.addEventListener("click",e=>{
  if(e.target===pmodal) return closeModal();
  const b=e.target.closest("[data-lib]");
  if(b){ closeModal(); exitMuseum(); goTo(+b.dataset.lib); }
});

/* ================= döngü ================= */
let lastT=0;
function mFrame(now){
  mRaf=requestAnimationFrame(mFrame);
  const raw = lastT ? (now-lastT) : 16.7;
  const dt=Math.min(.05, raw/1000); lastT=now;

  if(frWarm<30) frWarm++;
  frAvg  += (raw-frAvg)*0.10;
  fpsAvg += (1000/Math.max(1,raw)-fpsAvg)*0.08;
  let t0=performance.now();

  /* hareket */
  let fwd=0, str=0;
  if(KEY.KeyW||KEY.ArrowUp) fwd+=1;
  if(KEY.KeyS||KEY.ArrowDown) fwd-=1;
  if(KEY.KeyA||KEY.ArrowLeft) str-=1;
  if(KEY.KeyD||KEY.ArrowRight) str+=1;
  fwd+=joy.y; str+=joy.x;
  const mag=Math.hypot(fwd,str);
  if(mag>1){ fwd/=mag; str/=mag; }
  if(mag>0.02){
    if(!mHelp.hasAttribute("data-fade")) mHelp.setAttribute("data-fade","");
    promptSeen();                        /* yürüyorsa daveti anlamıştır */
  }

  const sp=(KEY.ShiftLeft?12.5:6.4)*dt;
  const sn=Math.sin(mYaw), cs=Math.cos(mYaw);
  const dx=(-sn*fwd + cs*str)*sp;
  const dz=(-cs*fwd - sn*str)*sp;

  if(dx||dz){
    const cy=player.y-EYE, px=player.x, pz=player.z;
    const ok=(nx,nz)=> floorAt(nx,nz,cy)!==null && !crossesWall(px,pz,nx,nz,cy)
                       && !crossesSeg(px,pz,nx,nz,cy);
    if(ok(px+dx,pz+dz)){ player.x=px+dx; player.z=pz+dz; }
    else if(ok(px+dx,pz)){ player.x=px+dx; }      /* duvar boyunca kay */
    else if(ok(px,pz+dz)){ player.z=pz+dz; }
  }
  const fy=floorAt(player.x,player.z,player.y-EYE);
  if(fy!==null) player.y += ((fy+EYE)-player.y)*Math.min(1,dt*11);

  /* Bakışta hafif yumuşatma: ~40 ms zaman sabiti. 60 fps'te fark edilmez;
     kare hızı düştüğünde sertliği alır. Daha fazlası gecikme hissi verir. */
  const kL=1-Math.exp(-dt/0.040);
  mYaw   += (mYawT-mYaw)*kL;
  mPitch += (mPitchT-mPitch)*kL;

  mCam.position.copy(player);
  mCam.rotation.set(mPitch,mYaw,0,"YXZ");
  PH.hareket += ((performance.now()-t0)-PH.hareket)*0.1; t0=performance.now();

  /* kanat göstergesi */
  const lvl=Math.max(0,Math.min(LEVELS-1,Math.round((player.y-EYE)/LEVEL_H)));
  const inAtrium = Math.abs(player.x)<=AT_X &&
                   ATRIA.some(cz=>Math.abs(player.z-cz)<=AT_Z);
  /* Koridorda iki kanadın ortasındasınız — hangi duvara baktığınız belirler. */
  if(Math.abs(player.x)>SPINE_X+0.4) lastSide = player.x<0?-1:1;
  else { const fx=-Math.sin(mYaw); if(Math.abs(fx)>0.25) lastSide = fx<0?-1:1; }
  const w=WINGS.find(v=>v.level===lvl&&v.side===lastSide);
  const label=inAtrium?"Işık avlusu":(w?PSECT[w.sec].label:"—");
  const wkey=label+"|"+lvl;
  if(wkey!==curWing){ curWing=wkey; mWingEl.textContent=label;
    mLevelEl.textContent=`kat ${lvl+1} / ${LEVELS}`; }

  if(manta) manta.update(dt);
  PH.vatoz += ((performance.now()-t0)-PH.vatoz)*0.1; t0=performance.now();
  syncPosters();
  pavSync();
  PH.afis += ((performance.now()-t0)-PH.afis)*0.1; t0=performance.now();
  /* Doku yüklemeleri kare başına değil, iki karede bir: canlı eserler ve
     canlı panolar yavaş çizimler, 30 Hz'de fark edilmiyor, yük yarılanıyor. */
  half=!half;
  if(half){
    syncGlyphs(now);
    for(const it of liveArt) if(it.tex) it.tex.needsUpdate=true;
  }
  PH.pano += ((performance.now()-t0)-PH.pano)*0.1; t0=performance.now();

  /* sahne bir kez hedefe, sonra boyama geçişi ekrana */
  mRend.setRenderTarget(mRT); mRend.render(mScene,mCam);
  drawN=mRend.info.render.calls;
  PH.sahne += ((performance.now()-t0)-PH.sahne)*0.1; t0=performance.now();
  mRend.setRenderTarget(null);
  mPostMat.uniforms.tDiffuse.value=mRT.texture;
  mRend.render(mPostScene,mPostCam);
  PH.gecis += ((performance.now()-t0)-PH.gecis)*0.1;

  wkAvg += ((performance.now()-now)-wkAvg)*0.10;   /* kendi iş süremiz */

  /* nişangâh: her altı karede bir neye baktığımıza bak */
  if(locked && (tickN%6)===0) xhairEl.classList.toggle("hit", !!castAt(0,0));
  if(raw>33 && frWarm>=30) logSlow(raw);
  if((tickN++%6)===0 && !mmeterEl.hidden) drawMeter();
}

/* ---------------- başarım sayacı ve yavaş kare kaydı ----------------
   Üç turdur körlemesine optimize ettim çünkü ölçüm sizin makinenizde değil
   benimkindeydi. Bu sayaç onu bitiriyor: ` tuşu açıp kapatır, atlas.mLog()
   yavaş karelerin özetini verir — hangi aşamada, nerede, ne yaparken. */
function logSlow(ms){
  slowLog.push({
    ms:+ms.toFixed(0), sn:+(performance.now()/1000).toFixed(1),
    yer:[Math.round(player.x),Math.round(player.y),Math.round(player.z)],
    donerken:Math.abs(mYawT-mYaw)>0.004,
    demo:liveArt.filter(r=>r.host).length, ss:ssNow, cizim:drawN,
    faz:{ hareket:+PH.hareket.toFixed(2), vatoz:+PH.vatoz.toFixed(2),
          afis:+PH.afis.toFixed(2), pano:+PH.pano.toFixed(2),
          sahne:+PH.sahne.toFixed(2), gecis:+PH.gecis.toFixed(2) }
  });
  if(slowLog.length>300) slowLog.shift();
}
function drawMeter(){
  const d=liveArt.filter(r=>r.host).length;
  mmeterEl.innerHTML =
    `<b>${fpsAvg.toFixed(0)}</b> fps   kare ${frAvg.toFixed(1)}  iş ${wkAvg.toFixed(1)} ms\n`+
    `ölçek ${ssNow.toFixed(2)}   ${drawN} çizim   ${d} demo\n`+
    `sahne ${PH.sahne.toFixed(2)}   geçiş ${PH.gecis.toFixed(2)}\n`+
    `vatoz ${PH.vatoz.toFixed(2)}   pano ${PH.pano.toFixed(2)}\n`+
    `afiş ${PH.afis.toFixed(2)}   hareket ${PH.hareket.toFixed(2)}\n`+
    `yavaş kare: ${slowLog.length}`;
}

function mResize(){
  const r=museumEl.getBoundingClientRect();
  const w=Math.max(2,Math.round(r.width)), h=Math.max(2,Math.round(r.height));
  mRend.setSize(w,h,false);
  const sw=Math.round(w*ssNow), sh=Math.round(h*ssNow);
  if(mRT) mRT.setSize(sw,sh);
  mPostMat.uniforms.uRes.value.set(sw,sh);
  mCam.aspect=w/h; mCam.updateProjectionMatrix();
  const touch=matchMedia("(pointer:coarse)").matches;
  joyEl.hidden=!touch;
  rotateEl.hidden=!(touch && h>w);
  syncPrompt();
}

/* ================= giriş / çıkış ================= */
function enterMuseum(){
  if(museumOn) return;
  museumOn=true; museumEl.hidden=false; mLoad.hidden=false;
  loadLib("three").then(()=>{
    TH=window.THREE;
    if(!mBuilt){
      mRend=new TH.WebGLRenderer({canvas:mCanvas,antialias:false});
      mRend.setPixelRatio(1);
      const r=museumEl.getBoundingClientRect();
      const rw=Math.max(2,Math.round(r.width)), rh=Math.max(2,Math.round(r.height));
      mRT=new TH.WebGLRenderTarget(Math.round(rw*ssNow),Math.round(rh*ssNow));
      buildPost(); buildMuseum();
    }
    mResize(); mLoad.hidden=true; syncPrompt();
    /* Kilit hiç açılmasa bile davet sonsuza kadar durmasın. */
    setTimeout(promptSeen, 14000);
    lastT=0; cancelAnimationFrame(mRaf); mFrame(performance.now());
  }).catch(e=>{ mLoad.textContent="Müze yüklenemedi: "+e.message; });
}
function exitMuseum(){
  if(!museumOn) return;
  museumOn=false;
  cancelAnimationFrame(mRaf); mRaf=0;
  mclickEl.hidden=true;
  liveArt.forEach(unmountArt);
  if(document.pointerLockElement) document.exitPointerLock();
  closeModal(); closePanel(); closeGuide();
  museumEl.hidden=true;
}
document.getElementById("enterMuseum").addEventListener("click",enterMuseum);
document.getElementById("mExit").addEventListener("click",exitMuseum);
addEventListener("resize",()=>{ if(museumOn && mRend) mResize(); });

window.atlas.enterMuseum=enterMuseum;
window.atlas.mOpen=(i)=>openModal(PROJECTS[i]);
window.atlas.mTeleport=(lvl,side,cz)=>{
  if(player) player.set(side*(AT_X+OUT_X)/2, lvl*LEVEL_H+EYE, cz===undefined?0:cz);
};
/* bakış açısını konsoldan kurmak: kadraj ayarlarken gerekiyor */
window.atlas.mLook=(yaw,pitch)=>{
  mYaw=mYawT=yaw; if(pitch!==undefined) mPitch=mPitchT=pitch;
};
/* Nişangâhın altında ne var — hem hata ayıklama hem "tıklamam işe yarar mı". */
window.atlas.mAim=()=>{
  const o=castAt(0,0);
  return { hedef: o ? (o.userData.console ? "konsol"
                     : (o.userData.project ? o.userData.project.title
                     : (o.userData.grad ? o.userData.grad.title : "?"))) : null,
           liste:pickList.length, kilit:locked, surukleme:!!look };
};
window.atlas.mGuide=(on)=>{ if(on===false) closeGuide(); else openGuide();
                            return !mguideEl.hidden; };
window.atlas.mMeter=(on)=>{ mmeterEl.hidden = (on===false); return !mmeterEl.hidden; };
window.atlas.mLog=()=>{
  if(!slowLog.length) return "yavaş kare yok";
  const ms=slowLog.map(e=>e.ms).sort((a,b)=>a-b);
  const faz={};
  for(const k of Object.keys(slowLog[0].faz))
    faz[k]=+(slowLog.reduce((a,e)=>a+e.faz[k],0)/slowLog.length).toFixed(2);
  return { adet:slowLog.length, ortancaMs:ms[ms.length>>1], enKotuMs:ms[ms.length-1],
           donerken:slowLog.filter(e=>e.donerken).length,
           fazOrtalamasi:faz, son:slowLog.slice(-10) };
};
window.atlas.mLogTemizle=()=>{ slowLog.length=0; return "temizlendi"; };
/* ayağın altındaki döşeme: bir güzergâhın yürünebilir olduğunu sınamak için */
window.atlas.mFloorAt=(x,z,cy)=>floorAt(x,z,cy===undefined?0:cy);
/* Bir adım gerçekten atılabilir mi: hem zemin hem duvar sınanır. Güzergâh
   sınamalarının artık bunu kullanması gerekiyor — yalnız floorAt bakmak
   duvarların içinden geçen yalancı yollar buluyordu. */
window.atlas.mCanStep=(ax,az,bx,bz,y)=>
  floorAt(bx,bz,y)!==null && !crossesWall(ax,az,bx,bz,y) && !crossesSeg(ax,az,bx,bz,y);
/* Pavyonun avlusuna ışınla — 200 m'lik yürüyüşü her seferinde yapmamak için. */
window.atlas.mPavyon=()=>{
  if(!player) return "müze kurulmadı";
  player.set(0, EYE, PAV_Z-PAV_A+3.2); mYaw=mYawT=Math.PI; mPitch=mPitchT=0;
  return { at:[0,+player.y.toFixed(2),PAV_Z-PAV_A+3.2], nis:pavItems.length };
};
window.atlas.mPanel=(on)=>{ if(on===false) closePanel(); else openPanel(); };
window.atlas.manta=()=>manta&&manta.info();
/* Her asamanin gercek maliyeti. GPU asenkron oldugu icin render olcumlerinde
   gl.finish() ile senkronlaniyor - kotumser ama karsilastirilabilir. */
/* Kaliteyi elle sabitle (1.0 = en hizli, 1.5 = en temiz kenar). */
window.atlas.mQuality=(v)=>{
  if(v){ ssNow=Math.max(SS_MIN,Math.min(2,v)); frWarm=0; mResize(); }
  return { ss:ssNow, kareMs:+frAvg.toFixed(1), isMs:+wkAvg.toFixed(1),
           fps:Math.round(1000/Math.max(1,frAvg)),
           hedef:mRT?[mRT.width,mRT.height]:null,
           ekran:[mRend.domElement.width,mRend.domElement.height] };
};
window.atlas.mProfile=(n)=>{
  n=n||40;
  const gl=mRend.getContext();
  const t=f=>{ const a=performance.now(); for(let i=0;i<n;i++) f();
               return +((performance.now()-a)/n).toFixed(3); };
  const o={};
  o.floorAt   = t(()=>floorAt(player.x,player.z,player.y-EYE));
  o.afisler   = t(()=>syncPosters());
  o.panolar   = t(()=>syncGlyphs(performance.now()));
  if(manta) o.vatoz = t(()=>manta.update(1/60));
  o.canliDoku = t(()=>{ for(const it of liveArt) if(it.tex) it.tex.needsUpdate=true;
                        mRend.setRenderTarget(mRT); mRend.render(mScene,mCam); gl.finish(); });
  o.sahne     = t(()=>{ mRend.setRenderTarget(mRT); mRend.render(mScene,mCam); gl.finish(); });
  o.gecis     = t(()=>{ mRend.setRenderTarget(null);
                        mPostMat.uniforms.tDiffuse.value=mRT.texture;
                        mRend.render(mPostScene,mPostCam); gl.finish(); });
  /* cizim cagrisi SAHNE gecisinden okunmali; post quad'i son render oldugu
     icin dogrudan okuyunca hep 1 cikiyordu */
  mRend.setRenderTarget(mRT); mRend.render(mScene,mCam);
  o.nesne=mScene.children.length;
  o.cizimCagrisi=mRend.info.render.calls;
  o.ucgen=mRend.info.render.triangles;
  o.doku=mRend.info.memory.textures;
  o.canliDemo=liveArt.filter(r=>r.host).length;
  o.rtBoyut=[mRT.width,mRT.height];
  o.ekran=[mRend.domElement.width,mRend.domElement.height];
  return o;
};
window.atlas.mStats=()=>({floors:floors.length, ramps:ramps.length,
  nesne:mScene?mScene.children.length:0, canli:liveArt.filter(r=>r.host).length,
  panolar:glyphPanels.length, cizilen:glyphPanels.filter(p=>p.drawn).length,
  posters:posters.length, liveArt:liveArt.length, nis:pavItems.length,
  draws:mRend?mRend.info.render.calls:0, tris:mRend?mRend.info.render.triangles:0,
  at:player?[+player.x.toFixed(1),+player.y.toFixed(1),+player.z.toFixed(1)]:null});
})();
</script>
