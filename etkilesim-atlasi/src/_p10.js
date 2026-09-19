
/* ==================================================================
   22. PAVYON — mezuniyet projeleri (NMED)
   Müze alanın kanonu: 118 iş, 200 m'lik düz bir omurga. Pavyon ona
   DAİREYLE cevap veriyor — ve küçük olduğu için öyle olmak zorunda.

   Dokuz iş var. Aynı planı küçültüp kanat açsaydık bina %96 boş kalırdı;
   müzedeki yuva matematiği (26 yuva, altıda bir pano, en kalabalık bölüm
   22 iş) tam da bu yüzden içerik sayısından türetilmişti. Burada da öyle:
   on kenarlı bir halka, biri giriş, dokuzu iş.

   ON KENAR TESADÜF DEĞİL: 9 iş + 1 giriş. Yeni bir dönem gelirse yeni bir
   halka eklenir, plan hiç değişmez. GRAD.length dokuzdan farklıysa
   aşağıdaki sınama konsola yazar.

   Renk de bilerek ters. Müzede CAT_MUSEUM'un susturulmuş toprakları var,
   çünkü aynı renkler 200 m'lik bir mekânı soğutuyordu. Pavyonda her nişin
   rengi o projenin KENDİ rengi — showcase'teki color alanı. Kanon sakin,
   bu yılın işi parlak.

   Ve kapaklar gerçek. Müzedeki 118 işin ekran görüntüsü yok, tasarlanmış
   afişleri var; sebebi Artifact'ın CSP'siydi (dış görsel yasaktı). Pages'e
   geçişle o kısıt kalktı, bu dokuz iş gerçek kapağıyla duruyor.
================================================================== */

const PAV_N    = 10;                               /* kenar: 1 giriş + 9 iş */
const PAV_Z    = 132;                              /* merkez: omurganın +Z ucundan 32 m */
const PAV_A    = 10.2;                             /* duvar yüzünün merkeze uzaklığı */
const PAV_H    = 7.0;                              /* saçak yüksekliği */
const PAV_CAN  = 3.4;                              /* sundurmanın içeri sarkması */
const PAV_DOOR = 4.0;                              /* müzenin cephesindeki kapı */
const PAV_STEP = Math.PI*2/PAV_N;
const PAV_R    = PAV_A/Math.cos(Math.PI/PAV_N);    /* köşe yarıçapı  → 10,72 */
const PAV_S    = 2*PAV_A*Math.tan(Math.PI/PAV_N);  /* kenar uzunluğu → 6,63 */

/* Duvar k'nın yüz ortasının açısı. −π/2 = müzeye bakan yön, yani giriş. */
function pavFace(k){ return -Math.PI/2 + k*PAV_STEP; }
/* Köşe j: iki duvarın buluştuğu yer, kolonlar burada. */
function pavVert(j){ return -Math.PI/2 + (j+0.5)*PAV_STEP; }

let pavItems=[];        /* {p, mesh, pos, url, tex, loading} */
let pavLoader=null;
let matGround=null, matPath=null, matPavF=null;

/* ---- eksene dik OLMAYAN engeller ----
   crossesWall() yalnız x=±SPINE_X'e dik bölmeleri sınıyor; koridor için bu
   yeterliydi ve ucuzdu. Pavyonun duvarları ise on ayrı açıda, binanın cephesi
   de z eksenine dik — ikisi de o sınamaya girmiyor. Bu liste genel: her öğe
   bir [x0,z0,x1,z1,y] parçası, sınama düz doğru-parça kesişimi. On dört
   parça; kare başına maliyeti ölçülemiyor. */
let segWalls=[];

function segHit(ax,az,bx,bz, cx,cz,dx,dz){
  const r1=(bx-ax)*(cz-az)-(bz-az)*(cx-ax);
  const r2=(bx-ax)*(dz-az)-(bz-az)*(dx-ax);
  if(r1*r2>0) return false;
  const r3=(dx-cx)*(az-cz)-(dz-cz)*(ax-cx);
  const r4=(dx-cx)*(bz-cz)-(dz-cz)*(bx-cx);
  return r3*r4<=0;
}
function crossesSeg(ax,az,bx,bz,y){
  for(const s of segWalls){
    if(Math.abs(s[4]-y)>1.6) continue;
    if(segHit(ax,az,bx,bz, s[0],s[1],s[2],s[3])) return true;
  }
  return false;
}

/* ---- kapak dokusunun yolu ----
   Eşleme tablosu YOK: showcase'teki cover alanının dosya adı korunuyor,
   yalnız klasör ve uzantı değişiyor (arac/kapak-donustur.py aynı kuralı
   uyguluyor). Tablo olsaydı bir gün kayardı. */
function pavCoverURL(p){
  if(!p.cover) return null;
  return String(p.cover).replace(/^.*\//, "atlas-varlik/kapak/")
                        .replace(/\.(png|jpe?g|webp)$/i, ".webp");
}

/* Künye levhası: başlık, ekip, tema. Afişlerdeki tipografinin aynısı. */
function pavLabel(p){
  const W=512, H=132;
  const cv=document.createElement("canvas"); cv.width=W; cv.height=H;
  const g=cv.getContext("2d");
  g.fillStyle="#3C4239"; g.fillRect(0,0,W,H);
  g.fillStyle=p.color||"#9AA0A0"; g.fillRect(0,0,W,7);
  g.fillStyle="#EFEBE2";
  g.font='800 40px "Bricolage Grotesque", system-ui, sans-serif';
  g.fillText(String(p.title).slice(0,30), 22, 62);
  g.fillStyle="#B0B0A2";
  g.font='400 21px "IBM Plex Sans", sans-serif';
  g.fillText(String(p.team).slice(0,44), 22, 95);
  g.fillStyle=p.color||"#9AA0A0";
  g.font='500 17px "IBM Plex Mono", monospace';
  g.fillText(String(p.label||"").toLocaleUpperCase("tr"), 22, 120);
  const tex=new TH.CanvasTexture(cv);
  if(TH.SRGBColorSpace) tex.colorSpace=TH.SRGBColorSpace;
  return tex;
}

/* ---- dış zemin ----
   Bina şimdiye kadar boşlukta duruyordu: gökyüzü vardı, yer yoktu. Zemin
   binanın AYAK İZİNİ dışarıda bırakan dört büyük parça olarak kuruluyor —
   tek bir büyük düzlem olsaydı avlu kuyularının üstüne kapak gibi oturur,
   vatozun yüzdüğü akvaryumu kapatırdı. */
function buildGround(){
  /* Zemin BEKLENENDEN ÇOK KOYU seçildi ve öyle kalmalı. Yukarı bakan geniş
     düz bir yüzey, HemisphereLight'ın sıcak tepesini (0,72) ve iki yönlü
     ışığı birden alıyor; ilk denenen 0xB9C0A4 ekranda neredeyse beyaza
     patlıyordu — BENİOKU'nun "döşemeyi beyaza patlatıp her şeyi sepyaya
     çeviriyor" uyarısının dışarıdaki karşılığı. Değerler ışığa göre değil
     EKRANDAKİ sonuca göre seçildi. */
  matGround=new TH.MeshLambertMaterial({color:0x76825A});   /* kuru ot */
  matPath  =new TH.MeshLambertMaterial({color:0xA8A491});   /* taş döşeli yol */
  const G=200, F=280;
  const rects=[
    [ -G,      G,       HALF_Z,  F      ],
    [ -G,      G,      -F,      -HALF_Z ],
    [  OUT_X,  G,      -HALF_Z,  HALF_Z ],
    [ -G,     -OUT_X,  -HALF_Z,  HALF_Z ]
  ];
  for(const r of rects){
    floors.push({x0:r[0], x1:r[1], z0:r[2], z1:r[3], y:0});
    slab(r[1]-r[0], .30, r[3]-r[2], (r[0]+r[1])/2, -.15, (r[2]+r[3])/2, matGround);
  }

  /* Kapıdan pavyona taş yol. Yönü gösteren tek şey bu. */
  const p0=HALF_Z, p1=PAV_Z-PAV_A;
  slab(6.4, .30, p1-p0, 0, -.13, (p0+p1)/2, matPath);

  /* ---- cephe artık geçilmiyor ----
     Zemin dışarıda da var olduğu için camın içinden çıkılabilirdi: cam
     matGlass, çarpışmaya hiç girmiyor. Cephe hattı engel olarak veriliyor,
     yalnız kapının boşluğu açık. */
  const DW=PAV_DOOR/2;
  segWalls.push([-OUT_X, HALF_Z, -DW,    HALF_Z, 0]);
  segWalls.push([  DW,   HALF_Z,  OUT_X, HALF_Z, 0]);
  segWalls.push([-OUT_X,-HALF_Z,  OUT_X,-HALF_Z, 0]);
  segWalls.push([ OUT_X,-HALF_Z,  OUT_X, HALF_Z, 0]);
  segWalls.push([-OUT_X,-HALF_Z, -OUT_X, HALF_Z, 0]);
}

function buildPavilion(){
  if(typeof GRAD==="undefined" || !GRAD.length) return;
  if(GRAD.length !== PAV_N-1){
    console.warn("pavyon: "+GRAD.length+" iş var, plan "+(PAV_N-1)+
                 " nişe göre kurulu. PAV_N'i "+(GRAD.length+1)+" yapın.");
  }
  pavLoader=new TH.TextureLoader();
  matPavF=new TH.MeshLambertMaterial({color:0xE4DDC9, side:TH.DoubleSide});

  /* ---- taban: on kenarlı bir tabla ----
     CircleGeometry değil elle kurulmuş bir yelpaze, çünkü köşelerin duvar
     köşeleriyle TAM oturması gerekiyor; 48 parçalı bir daire köşelerden
     yarım metre taşıyordu. Zemin kotunda durduğu için yürüyüş bakımından
     bir şey değiştirmiyor — dışarıdaki zeminin devamı, yalnız rengi başka. */
  const fp=[0,0,0], fi=[];
  for(let j=0;j<PAV_N;j++){
    const a=pavVert(j);
    fp.push(PAV_R*Math.cos(a), 0, PAV_R*Math.sin(a));
  }
  for(let j=0;j<PAV_N;j++) fi.push(0, 1+j, 1+((j+1)%PAV_N));
  const fg=new TH.BufferGeometry();
  fg.setAttribute("position", new TH.Float32BufferAttribute(fp,3));
  fg.setIndex(fi); fg.computeVertexNormals();
  const fm=new TH.Mesh(fg, matPavF);
  fm.position.set(0, .03, PAV_Z);
  mScene.add(fm);

  /* ---- köşe kolonları ---- */
  for(let j=0;j<PAV_N;j++){
    const a=pavVert(j);
    slab(.46, PAV_H, .46, PAV_R*Math.cos(a), PAV_H/2, PAV_Z+PAV_R*Math.sin(a), matDark);
  }

  /* ---- kenarlar: biri giriş, dokuzu iş ---- */
  for(let k=0;k<PAV_N;k++){
    const a=pavFace(k);
    const cx=PAV_A*Math.cos(a), cz=PAV_Z+PAV_A*Math.sin(a);
    /* Kutunun yerel +Z'si merkeze baksın: iç normal (−cos a, −sin a). */
    const ry=Math.atan2(-Math.cos(a), -Math.sin(a));
    const inx=-Math.cos(a), inz=-Math.sin(a);

    /* Sundurma: nişlerin üstü kapalı, ORTA AVLU AÇIK. Işık tepeden giriyor,
       işler gölgede kalıyor — küçük bir mekânda tek hamlede hem barınak
       hem aydınlık. */
    const can=slab(PAV_S+.5, .34, PAV_CAN, cx+inx*PAV_CAN/2, PAV_H+.17,
                   cz+inz*PAV_CAN/2, matSoff);
    can.rotation.y=ry;

    if(k===0){
      /* Giriş: duvar yok, yalnız üstte bir kiriş. */
      const lin=slab(PAV_S+.5, .40, .42, cx, PAV_H-.20, cz, matDark);
      lin.rotation.y=ry;
      continue;
    }

    const p=GRAD[k-1];
    if(!p) continue;
    const col=p.color||"#9AA0A0";

    /* Arka duvar */
    const wl=slab(PAV_S, PAV_H, .34, cx, PAV_H/2, cz, matWall);
    wl.rotation.y=ry;
    /* Duvarın üst kenarında projenin kendi rengi. Müzede korkuluk
       kapaklarının yaptığı işin aynısı: kimin işi olduğunu bir bakışta
       belli etmek. */
    let cm; try{ cm=new TH.MeshLambertMaterial({color:new TH.Color(col)}); }
    catch(e){ cm=new TH.MeshLambertMaterial({color:0x9AA0A0}); }
    const cap=slab(PAV_S+.10, .22, .42, cx, PAV_H-.55, cz, cm);
    cap.rotation.y=ry;

    /* Sıcak bant: sundurmanın altı yoksa niş kör karanlık okunuyor. */
    const lp=slab(PAV_S-1.2, .10, .26, cx+inx*1.1, PAV_H-.55, cz+inz*1.1, matLamp);
    lp.rotation.y=ry;

    /* ---- kapak: GERÇEK ekran görüntüsü ----
       Doku yaklaşınca yükleniyor (aşağıda pavSync). O ana kadar kâğıt
       rengi bir düzlem duruyor: boş kare değil, asılmayı bekleyen yüzey. */
    const CW=3.36, CH=CW*9/16;
    const fr=slab(CW+.22, CH+.22, .08, cx+inx*.18, 2.62, cz+inz*.18, matDark);
    fr.rotation.y=ry;
    const mesh=new TH.Mesh(new TH.PlaneGeometry(CW,CH),
      new TH.MeshBasicMaterial({color:0xF7F1E1}));
    mesh.position.set(cx+inx*.24, 2.62, cz+inz*.24);
    mesh.rotation.y=ry;
    mesh.userData.grad=p;
    mScene.add(mesh);
    pavItems.push({p:p, mesh:mesh, label:null, pos:mesh.position.clone(),
                   url:pavCoverURL(p), tex:null, loading:false, fail:false});

    /* Künye. Bu da tıklanabilir, ve sebebi ölçüldü: kapağın alt kenarı
       1,675 m'de, göz 1,66 m'de. Yani avlunun ortasında DÜZ bakarken ışın
       kapağın tam altından geçip ıskalıyor; seçmek için hafifçe yukarı
       bakmak gerekiyordu. Künye göz hizasında — hedef iki katına çıkıyor. */
    const lb=new TH.Mesh(new TH.PlaneGeometry(3.36,.87),
      new TH.MeshBasicMaterial({map:pavLabel(p)}));
    lb.position.set(cx+inx*.24, 1.28, cz+inz*.24);
    lb.rotation.y=ry;
    lb.userData.grad=p;
    mScene.add(lb);
    pavItems[pavItems.length-1].label=lb;

    /* Duvar engeli: köşeden köşeye. */
    const v0=pavVert(k-1), v1=pavVert(k);
    segWalls.push([PAV_R*Math.cos(v0), PAV_Z+PAV_R*Math.sin(v0),
                   PAV_R*Math.cos(v1), PAV_Z+PAV_R*Math.sin(v1), 0]);
  }
}

/* Kapak dokuları yaklaşınca yükleniyor ve bir daha bırakılmıyor: dokuzu
   birden 322 kB, afişlerdeki gibi bir bütçeye gerek yok. */
function pavSync(){
  if(!pavItems.length || !pavLoader) return;
  for(const it of pavItems){
    if(it.tex || it.loading || it.fail || !it.url) continue;
    if(it.pos.distanceTo(player) > 48) continue;
    it.loading=true;
    pavLoader.load(it.url, tex=>{
      if(TH.SRGBColorSpace) tex.colorSpace=TH.SRGBColorSpace;
      if(mRend) tex.anisotropy=Math.min(4, mRend.capabilities.getMaxAnisotropy());
      it.tex=tex;
      it.mesh.material.map=tex;
      it.mesh.material.color.setHex(0xFFFFFF);
      it.mesh.material.needsUpdate=true;
    }, undefined, ()=>{ it.fail=true; it.loading=false; });
  }
}

/* Projenin kartı. Müzedeki modalın aynısını kullanıyor; fark, buradaki işin
   kendi rengi ve üç kanalı (site, Instagram, YouTube) olması. */
function openGrad(p){
  const col=p.color||"#9AA0A0";
  const kanal=[["Web sitesi",p.website],["Instagram",p.instagram],["YouTube",p.youtube]]
    .filter(k=>k[1])
    .map(k=>`<a class="pm__go" href="${k[1]}" target="_blank" rel="noopener noreferrer">${k[0]} &#8599;</a>`)
    .join("");
  pmodalCard.style.setProperty("--c", col);
  pmodalCard.innerHTML=`
    <div class="pm__top">
      <span class="pm__sec">Mezuniyet projesi${p.label?" · "+p.label:""}</span>
      <button class="pm__x" id="pmX" aria-label="Kapat">&#10005;</button>
    </div>
    <h3>${p.title}</h3>
    <p class="pm__outlet">${p.team}</p>
    <p class="pm__note">${p.description||""}</p>
    ${p.tags&&p.tags.length?`<p class="pm__lbl">Öne çıkanlar</p>
      <div class="pm__chips">${p.tags.map(t=>`<span>${t}</span>`).join("")}</div>`:""}
    ${kanal||`<p class="pm__warn">Bu projenin bağlantıları henüz paylaşılmadı.</p>`}
  `;
  if(document.pointerLockElement) document.exitPointerLock();
  pmodal.hidden=false;
  document.getElementById("pmX").addEventListener("click",closeModal);
}
