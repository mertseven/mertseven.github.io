
/* ==================================================================
   22. VATOZ — orta avluda yüzen benekli kartal vatozu

   Kaynak: bağımsız bir canvas eskizi ("Starlit Manta"). O eskizin
   ÇİZİCİSİ 2B'ydi (ham piksel tamponuna toplamalı nokta serpme), ama
   MATEMATİĞİ zaten 3B: buildSpan() her açıklık istasyonu için gerçek
   bir z sapması ve yay uzunluğu korunmuş bir y üretiyor. Buraya
   taşınan şey o matematik; yerine three.js geometrisi bağlandı.

   Bütün modül kendi kapsamında. Eskiz tepe seviyede TAU, rnd, mx, sq,
   ex, clamp, T, P, rgb gibi adlar tanımlıyor ve bunların dokuzu atlasın
   adlarıyla çakışıyordu — IIFE kuralı tam da bunun içindi.

   Simülasyon kendi biriminde ("piksel") koşuyor: gövde 110 birim, bütün
   sürükleme/itki/dönüş katsayıları ona göre ayarlı. Dünya birimine tek
   bir çarpanla (S) çevriliyor, yoksa ayarın tamamı bozulurdu.
================================================================== */

function createManta(TH, cfg){
  "use strict";

  const PI=Math.PI, TAU=PI*2, rnd=Math.random;
  const cos=Math.cos, sin=Math.sin, atan2=Math.atan2, pow=Math.pow, hyp=Math.hypot,
        abs=Math.abs, mn=Math.min, mx=Math.max, flr=Math.floor, sq=Math.sqrt,
        ex=Math.exp, acs=Math.acos;
  const fract=x=>x-flr(x);
  const wrapA=a=>{while(a>PI)a-=TAU;while(a<-PI)a+=TAU;return a;};
  const clamp=(v,a,b)=>v<a?a:v>b?b:v;

  const h2=(i,j)=>fract(sin(i*127.1+j*311.7)*43758.5453);
  function noise2(x,y){
    const xi=flr(x), yi=flr(y), xf=x-xi, yf=y-yi;
    const u=xf*xf*(3-2*xf), v=yf*yf*(3-2*yf);
    const a=h2(xi,yi), b=h2(xi+1,yi), c=h2(xi,yi+1), d=h2(xi+1,yi+1);
    return a+(b-a)*u+(c-a)*v+(a-b-c+d)*u*v;
  }

  /* ---- ayarlanabilir parametreler (konsoldaki kaydıraklar) ---- */
  const PR={ FR:.55, AMP:1, WAVE:1, PITCH:1, TL:1, FLEX:.7, DRAG:1, SPOT:1 };

  /* ---- ölçek ve kafes ----
     Gövde 110 simülasyon birimi; 2,4 m kanat açıklığı istiyoruz.
     B = 1.62*L = 178 birim  ->  S = 2.4/178 m/birim.                  */
  const L0=110, S=cfg.span/(1.62*L0);
  const SIMW=cfg.w/S, SIMH=cfg.d/S;        /* kuyunun eni ve boyu, birim cinsinden */
  const X0=cfg.x0, Z0=cfg.z0;              /* kuyunun dünya köşesi */
  const YLO=cfg.yLo, YHI=cfg.yHi;          /* süzülme yüksekliği aralığı */

  /* ------------------------- kanat planformu ------------------------- */
  const xLE=s=>1.00-1.18*pow(s,1.30)+0.19*ex(-pow((s-0.21)/0.085,2));
  const xTE=s=>-0.58-0.16*ex(-pow(s/0.20,2.4))+0.40*pow(s,1.75);
  const chordF=s=>xLE(s)-xTE(s);

  function spotAt(u,v){
    const cs=0.115, gu=flr(u/cs), gv=flr(v/cs);
    const a=fract(sin(gu*12.9898+gv*78.233)*43758.5453);
    const b=fract(sin(gu*39.3468+gv*11.135)*24634.6345);
    const c=fract(sin(gu*93.9898+gv*47.233)*13758.5453);
    if(c>0.42*PR.SPOT)return 0;
    const cx=(gu+0.18+0.64*a)*cs, cy=(gv+0.18+0.64*b)*cs;
    const rad=cs*(0.10+0.26*c/mx(0.001,0.42*PR.SPOT));
    return hyp(u-cx,v-cy)<rad?1:0;
  }

  /* ==================== kuyruk: tractrix filamenti ====================
     Eskizin yorumları bu çözümü uzun uzun anlatıyor ve haklı: düğüm
     başına hız integrasyonu, kısıt izdüşümünün enerji enjekte etmesi
     yüzünden serbest ucu kare hızında çınlatıyor. Burada kuyruk, kökün
     KENDİ geçmiş yörüngesini yay uzunluğuna göre yeniden örnekliyor —
     yani gövdenin geçtiği yerde duruyor. Titreyemez, çınlayamaz.      */
  function Tail(n){
    this.n=n;
    this.x=new Float64Array(n); this.y=new Float64Array(n);
    this.ox=new Float64Array(n); this.oy=new Float64Array(n);
    this.HN=1200;
    this.hx=new Float64Array(this.HN); this.hy=new Float64Array(this.HN);
    this.hi=0; this.ready=false;
  }
  Tail.prototype.reset=function(rx,ry,hx,hy,seg){
    for(let i=0;i<this.n;i++){
      this.x[i]=rx-hx*seg*i; this.y[i]=ry-hy*seg*i;
      this.ox[i]=this.x[i];  this.oy[i]=this.y[i];
    }
    const ds=seg*0.4;
    for(let k=0;k<this.HN;k++){
      const j=this.HN-1-k;
      this.hx[j]=rx-hx*ds*k; this.hy[j]=ry-hy*ds*k;
    }
    this.hi=0; this.ready=true;
  };
  Tail.prototype.update=function(dt,rx,ry,hx,hy,seg,flex,tt,sd){
    const n=this.n, HN=this.HN;
    if(!this.ready){this.reset(rx,ry,hx,hy,seg);return;}
    for(let i=0;i<n;i++){this.ox[i]=this.x[i];this.oy[i]=this.y[i];}

    this.hx[this.hi]=rx; this.hy[this.hi]=ry; this.hi=(this.hi+1)%HN;

    this.x[0]=rx; this.y[0]=ry;
    let node=1, need=seg, cx=rx, cy=ry;
    for(let step=1;step<HN&&node<n;step++){
      const j=(this.hi-1-step+2*HN)%HN;
      const px=this.hx[j], py=this.hy[j];
      let dx=px-cx, dy=py-cy, d=hyp(dx,dy);
      while(d>=need&&node<n){
        cx+=dx/d*need; cy+=dy/d*need;
        this.x[node]=cx; this.y[node]=cy; node++;
        dx=px-cx; dy=py-cy; d=hyp(dx,dy); need=seg;
      }
      need-=d; cx=px; cy=py;
    }
    if(node<n){
      let fx=-hx, fy=-hy;
      if(node>=2){ fx=this.x[node-1]-this.x[node-2]; fy=this.y[node-1]-this.y[node-2];
                   const l=hyp(fx,fy)||1; fx/=l; fy/=l; }
      for(;node<n;node++){
        this.x[node]=this.x[node-1]+fx*seg; this.y[node]=this.y[node-1]+fy*seg;
      }
    }

    /* Saf tractrix her geçmiş dönüşü kuyruğa kalıcı bir kanca olarak
       yazıyor; gerçek kuyruk gövde eksenine geri gevşer. */
    for(let i=2;i<n;i++){
      const u=i/(n-1);
      const sx=rx-hx*seg*i, sy=ry-hy*seg*i;
      const w=0.80*pow(u,0.45);
      this.x[i]+=(sx-this.x[i])*w; this.y[i]+=(sy-this.y[i])*w;
    }

    const amp=seg*0.17*(0.30+flex);
    for(let i=2;i<n;i++){
      const u=i/(n-1);
      let tx=this.x[i]-this.x[i-1], ty=this.y[i]-this.y[i-1];
      const l=hyp(tx,ty)||1; tx/=l; ty/=l;
      const s=(noise2(sd*7.3+u*0.85, tt*0.075)-0.5)*2;
      const g=pow(u,2.0)*amp*s;
      this.x[i]+=-ty*g; this.y[i]+=tx*g;
    }

    for(let it=0;it<4;it++)for(let i=2;i<n-1;i++){
      this.x[i]+=0.30*(0.5*(this.x[i-1]+this.x[i+1])-this.x[i]);
      this.y[i]+=0.30*(0.5*(this.y[i-1]+this.y[i+1])-this.y[i]);
    }
    const kt=1-ex(-9*dt);
    for(let i=2;i<n;i++){
      const k=kt*(1-0.40*i/(n-1));
      this.x[i]=this.ox[i]+(this.x[i]-this.ox[i])*k;
      this.y[i]=this.oy[i]+(this.y[i]-this.oy[i])*k;
    }

    this.x[0]=rx; this.y[0]=ry;
    this.x[1]=rx-hx*seg; this.y[1]=ry-hy*seg;
    const maxTurn=0.20+0.34*flex, perSeg=maxTurn/(n-2);
    const axx=-hx, axy=-hy;
    for(let i=2;i<n;i++){
      let dx=this.x[i]-this.x[i-1], dy=this.y[i]-this.y[i-1];
      let dl=hyp(dx,dy)||1e-6; dx/=dl; dy/=dl;
      let px=this.x[i-1]-this.x[i-2], py=this.y[i-1]-this.y[i-2];
      const pl=hyp(px,py)||1e-6; px/=pl; py/=pl;
      const t=i/(n-1);
      const k=clamp((0.70-0.52*t)/(0.50+0.95*flex),0,0.96);
      let bx=dx+(px-dx)*k, by=dy+(py-dy)*k;
      const bl=hyp(bx,by)||1e-6; bx/=bl; by/=bl;
      const c1=clamp(bx*px+by*py,-1,1);
      if(c1<cos(perSeg)){
        const crs=px*by-py*bx, rot=(acs(c1)-perSeg)*(crs>0?-1:1);
        const cs=cos(rot), sn=sin(rot); const b2=bx*cs-by*sn; by=bx*sn+by*cs; bx=b2;
      }
      const c2=clamp(bx*axx+by*axy,-1,1);
      if(c2<cos(maxTurn)){
        const crs=axx*by-axy*bx, rot=(acs(c2)-maxTurn)*(crs>0?-1:1);
        const cs=cos(rot), sn=sin(rot); const b2=bx*cs-by*sn; by=bx*sn+by*cs; bx=b2;
      }
      this.x[i]=this.x[i-1]+bx*seg; this.y[i]=this.y[i-1]+by*seg;
    }
  };

  /* ============================== hayvan ============================== */
  const NS=64;
  const ray={
    L:L0, B:1.62*L0,
    x:SIMW*0.5, y:SIMH*0.5, wy:(YLO+YHI)*0.5,
    ang:-PI/2, av:0, vx:0, vy:0, sp:0,
    ph:0, burst:0, bank:0, rollA:0, pitch:0, heave:0, thrust:0,
    gx:0, gy:0, gt:0, seed:3.7,
    env:[new Float64Array(NS+1),new Float64Array(NS+1)],
    zm :[new Float64Array(NS+1),new Float64Array(NS+1)],
    yc :[new Float64Array(NS+1),new Float64Array(NS+1)],
    tail:new Tail(34)
  };
  let TT=0;

  function buildSpan(){
    const A=PR.AMP*0.42*ray.L, ks=PR.WAVE*2.0, kc=PR.PITCH*1.5, dy=ray.B/NS;
    for(let sd=0;sd<2;sd++){
      const sgn=sd?1:-1, amp=A*(1+sgn*ray.bank*0.28);
      for(let i=0;i<=NS;i++){
        const s=i/NS, e=amp*pow(s,2.0)*(1-0.15*s);
        ray.env[sd][i]=e;
        ray.zm[sd][i]=e*sin(ray.ph-ks*s-kc*0.5);
      }
      let acc=0; ray.yc[sd][0]=0;
      for(let i=0;i<NS;i++){
        const dz=ray.zm[sd][i+1]-ray.zm[sd][i];
        acc+=sq(mx(0.04*dy*dy, dy*dy-dz*dz));   /* uzamaz: bükülür, gerilmez */
        ray.yc[sd][i+1]=acc;
      }
    }
  }

  function step(dt){
    TT+=dt;
    const om=TAU*PR.FR*(1+ray.burst*0.9);
    ray.ph+=om*dt; if(ray.ph>1e6)ray.ph=0;
    ray.burst=mx(0,ray.burst-dt*0.5);
    buildSpan();

    /* itki: eğik yüzeydeki normal kuvvetin integrali. Gezen dalga olduğu
       için ż ile ∂z/∂x faz kilitli — itki iki vuruşta da pozitif ve flap
       frekansının iki katında atıyor. Hamle-süzül ritmi buradan geliyor. */
    const ks=PR.WAVE*2.0, kc=PR.PITCH*1.5, dy=ray.B/NS;
    let Ts=0,mz=0,ma=0;
    for(let sd=0;sd<2;sd++)for(let i=0;i<=NS;i++){
      const s=i/NS, e=ray.env[sd][i], ph=ray.ph-ks*s-kc*0.5;
      const zd=e*om*cos(ph), ch=chordF(s)*ray.L+1;
      const th=kc*e*cos(ph)/ch, dA=ch*dy;
      Ts+=zd*abs(zd)*th*dA; mz+=ray.zm[sd][i]*dA; ma+=dA;
    }
    const acc=4.0*Ts/(ray.L*ray.L*ray.L);
    ray.thrust=acc;
    ray.heave=-0.35*mz/ma;

    /* hedef seçimi ileri koniden: keskin dönüş hiç istenmiyor, böylece
       dönüp durmuyor. Dönüş hızı da o hızda kanadın üretebileceğiyle
       sınırlı — hızı yoksa dönemiyor. */
    ray.gt-=dt;
    let gd=hyp(ray.gx-ray.x,ray.gy-ray.y);
    if(ray.gt<=0||gd<0.9*ray.L){
      let best=-1,bx=ray.gx,by=ray.gy;
      for(let a=0;a<14;a++){
        const off=(rnd()*2-1)*1.15;
        const dist=3.2*ray.L+rnd()*3.0*ray.L;
        const nx=clamp(ray.x+cos(ray.ang+off)*dist,0.18*SIMW,0.82*SIMW);
        const ny=clamp(ray.y+sin(ray.ang+off)*dist,0.15*SIMH,0.85*SIMH);
        const room=mn(mn(nx,SIMW-nx)*2.2,mn(ny,SIMH-ny))+hyp(nx-ray.x,ny-ray.y)*0.35;
        if(room>best){best=room;bx=nx;by=ny;}
      }
      ray.gx=bx; ray.gy=by; ray.gt=5.0+rnd()*5.0;
      gd=hyp(ray.gx-ray.x,ray.gy-ray.y);
    }
    let dx=(ray.gx-ray.x)/mx(1,gd), dy2=(ray.gy-ray.y)/mx(1,gd);

    /* kenar itmesi: dar eksende daha erken devreye girer, yoksa kuyunun
       duvarına yapışıyor */
    const MW=0.20*SIMW, MH=0.17*SIMH, K=2.4;   /* kuyruk kuyunun ucundan tasmasin */
    if(ray.x<MW)dx+=K*(MW-ray.x)/MW; if(ray.x>SIMW-MW)dx-=K*(ray.x-(SIMW-MW))/MW;
    if(ray.y<MH)dy2+=K*(MH-ray.y)/MH; if(ray.y>SIMH-MH)dy2-=K*(ray.y-(SIMH-MH))/MH;

    const da=wrapA(atan2(dy2,dx)-ray.ang);
    const rateMax=mn(0.52,0.80*ray.sp/ray.L);
    const want=clamp(da*0.9,-rateMax,rateMax);
    ray.av+=(want-ray.av)*mn(1,dt*2.6);          /* 1. mertebe: çınlamaz */
    ray.ang+=ray.av*dt;
    ray.bank+=(clamp(-ray.av*1.9,-1,1)-ray.bank)*mn(1,dt*4);
    ray.rollA=ray.bank*0.55;

    ray.vx+=cos(ray.ang)*acc*dt; ray.vy+=sin(ray.ang)*acc*dt;
    const sp=hyp(ray.vx,ray.vy);
    const dcc=0.55*PR.DRAG+0.010*PR.DRAG*sp*(150/ray.L);
    const f=mx(0,1-dcc*dt);
    ray.vx*=f; ray.vy*=f;
    ray.x+=ray.vx*dt; ray.y+=ray.vy*dt; ray.sp=sp;

    /* yükseklik: eskizde yok — avlu 25 m derin, süzülmesi gerekiyor.
       Yavaş bir gürültüyle hedef yükseklik, ona yumuşak yaklaşım, ve
       tırmanırken burnu kalksın diye eğimi türevden alıyoruz. */
    const tY=YLO+(YHI-YLO)*noise2(ray.seed*3.1, TT*0.045);
    const prev=ray.wy;
    ray.wy+=(tY-ray.wy)*mn(1,dt*0.42);
    ray.pitch=clamp((ray.wy-prev)/mx(1e-5,dt)*0.30,-0.42,0.42);

    const seg=2.6*ray.L*PR.TL/(ray.tail.n-1);
    const rx=ray.x-0.62*ray.L*cos(ray.ang), ry=ray.y-0.62*ray.L*sin(ray.ang);
    ray.tail.update(dt,rx,ry,cos(ray.ang),sin(ray.ang),seg,PR.FLEX,TT,ray.seed);
  }

  /* ============================= geometri ============================= */
  const NC=16;                                  /* çapraz (veter) istasyon */
  const SEG=(NS+1)*NC, VERT=SEG*4;              /* 2 kanat x 2 kabuk */
  const pos=new Float32Array(VERT*3);
  const uv =new Float32Array(VERT*2);
  const idx=[];
  const topIdx=[], botIdx=[];
  for(let sh=0;sh<2;sh++)for(let sd=0;sd<2;sd++){
    const base=(sh*2+sd)*SEG, bin=sh?topIdx:botIdx;
    for(let i=0;i<NS;i++)for(let j=0;j<NC-1;j++){
      const a=base+i*NC+j, b=a+1, c=a+NC, d=c+1;
      bin.push(a,c,b, b,c,d);
    }
  }
  for(const v of topIdx) idx.push(v);
  for(const v of botIdx) idx.push(v);
  for(let sh=0;sh<2;sh++)for(let sd=0;sd<2;sd++){
    const sgn=sd?1:-1, base=(sh*2+sd)*SEG;
    for(let i=0;i<=NS;i++){
      const s=i/NS;
      for(let j=0;j<NC;j++){
        const k=(base+i*NC+j)*2;
        uv[k]=j/(NC-1); uv[k+1]=0.5+sgn*s*0.5;
      }
    }
  }
  const geo=new TH.BufferGeometry();
  geo.setAttribute("position",new TH.BufferAttribute(pos,3));
  geo.setAttribute("uv",new TH.BufferAttribute(uv,2));
  geo.setIndex(idx);
  geo.addGroup(0,topIdx.length,0);
  geo.addGroup(topIdx.length,botIdx.length,1);

  /* Deri dokusu: benekler (spotAt) ve kenarlara doğru koyulaşan sırt.
     Eskizde benekler anlık deforme y'den okunuyordu — nokta bulutunda
     kimse fark etmez ama bir örgüde desen derinin üstünde kayar. Burada
     deforme olmamış açıklık koordinatı kullanılıyor, desen deriye sabit. */
  const BACK_A=[62,74,82], BACK_B=[92,108,114], SPOTC=[220,230,228];
  function skinTexture(){
    const W=512,H=256;
    const cv=document.createElement("canvas"); cv.width=W; cv.height=H;
    const g=cv.getContext("2d"), img=g.createImageData(W,H), d=img.data;
    for(let ty=0;ty<H;ty++){
      const q=(ty/(H-1))*2-1, s=mn(1,abs(q)), sgn=q<0?-1:1;
      for(let tx=0;tx<W;tx++){
        const c=tx/(W-1);
        const u=xTE(s)+(xLE(s)-xTE(s))*c, v=sgn*s*0.81;
        const eIn=mn(1,mn(c,1-c)*3.0)*mn(1,(1-s)*2.6), k=pow(eIn,0.85);
        let r,gg,b;
        if(spotAt(u,v)){ r=SPOTC[0]; gg=SPOTC[1]; b=SPOTC[2]; }
        else{
          r=BACK_A[0]+(BACK_B[0]-BACK_A[0])*k;
          gg=BACK_A[1]+(BACK_B[1]-BACK_A[1])*k;
          b=BACK_A[2]+(BACK_B[2]-BACK_A[2])*k;
        }
        const o=(ty*W+tx)*4; d[o]=r; d[o+1]=gg; d[o+2]=b; d[o+3]=255;
      }
    }
    g.putImageData(img,0,0);
    return new TH.CanvasTexture(cv);
  }
  let skin=skinTexture(), skinDirty=false, skinAt=0;
  const matBack =new TH.MeshLambertMaterial({map:skin, side:TH.DoubleSide});
  const matBelly=new TH.MeshLambertMaterial({color:0xD9D3C3, side:TH.DoubleSide});
  const body=new TH.Mesh(geo,[matBack,matBelly]);

  function writeWing(){
    const ks=PR.WAVE*2.0, kc=PR.PITCH*1.5;
    for(let sh=0;sh<2;sh++){
      const shs=sh?1:-1;
      for(let sd=0;sd<2;sd++){
        const sgn=sd?1:-1, base=(sh*2+sd)*SEG;
        for(let i=0;i<=NS;i++){
          const s=i/NS, env=ray.env[sd][i], yl=ray.yc[sd][i]*sgn;
          const lo=xTE(s)*ray.L, hi2=xLE(s)*ray.L;
          for(let j=0;j<NC;j++){
            const c=j/(NC-1);
            const xl=lo+(hi2-lo)*c;
            /* Gövde merkezde dolgun, kanat uçlarında bıçak gibi. Üsteli
               bir düşüş (2.4) hacmi ortada topluyor; 0.13*L yarı kalınlık
               2,4 m açıklıkta ~0,39 m'lik bir gövde demek — kartal vatozu
               ortadan tıknazdır, yassı bir levha değil. */
            const thick=pow(mx(0,1-s*s),2.4)*pow(sin(PI*c),0.80);
            const z=env*sin(ray.ph-ks*s-kc*(1-c))+shs*thick*0.13*ray.L+ray.heave;
            const k=(base+i*NC+j)*3;
            pos[k]=xl*S; pos[k+1]=z*S; pos[k+2]=yl*S;
          }
        }
      }
    }
    geo.attributes.position.needsUpdate=true;
    geo.computeVertexNormals();
  }

  /* ---- kuyruk: sabit topolojili altıgen tüp, dünya koordinatında ---- */
  const TN=ray.tail.n, RN=6;
  const tpos=new Float32Array(TN*RN*3);
  const tidx=[];
  for(let i=0;i<TN-1;i++)for(let r=0;r<RN;r++){
    const a=i*RN+r, b=i*RN+(r+1)%RN, c=a+RN, d=b+RN;
    tidx.push(a,c,b, b,c,d);
  }
  const tgeo=new TH.BufferGeometry();
  tgeo.setAttribute("position",new TH.BufferAttribute(tpos,3));
  tgeo.setIndex(tidx);
  const tail=new TH.Mesh(tgeo,new TH.MeshLambertMaterial({color:0x46545C}));

  function writeTail(){
    const t=ray.tail, rBase=0.115*ray.L*S;
    for(let i=0;i<TN;i++){
      const l=i/(TN-1);
      const wx=X0+t.x[i]*S, wz=Z0+t.y[i]*S;
      const wy=ray.wy+ray.heave*S*ex(-3.2*l)-0.22*pow(l,1.6)*ray.L*S*PR.TL;
      const i2=mn(TN-1,i+1), i1=mx(0,i-1);
      let dx=t.x[i2]-t.x[i1], dz=t.y[i2]-t.y[i1];
      const dl=hyp(dx,dz)||1; dx/=dl; dz/=dl;
      const nx=-dz, nz=dx;                       /* yatayda dik */
      const rad=rBase*(0.20+0.80*ex(-3.0*l))*pow(1-l*0.995,0.42);
      for(let r=0;r<RN;r++){
        const a=r/RN*TAU, ca=cos(a), sa=sin(a);
        const k=(i*RN+r)*3;
        tpos[k]  =wx+nx*ca*rad;
        tpos[k+1]=wy+sa*rad;
        tpos[k+2]=wz+nz*ca*rad;
      }
    }
    tgeo.attributes.position.needsUpdate=true;
    tgeo.computeVertexNormals();
  }

  const group=new TH.Object3D();
  group.add(body); group.add(tail);

  buildSpan(); writeWing(); writeTail();

  return {
    group:group,
    par:PR,
    info:()=>({sp:ray.sp, thrust:ray.thrust,
               x:X0+ray.x*S, y:ray.wy, z:Z0+ray.y*S, ang:ray.ang}),
    burst:()=>{ray.burst=1;},
    spotsChanged:()=>{skinDirty=true;},
    update(dt){
      step(dt);
      writeWing();
      writeTail();
      body.position.set(X0+ray.x*S, ray.wy, Z0+ray.y*S);
      body.rotation.set(ray.rollA, -ray.ang, ray.pitch, "YXZ");
      /* benek yoğunluğu değişince deriyi yeniden boya — ama kaydırak
         sürüklenirken her karede değil */
      if(skinDirty && TT-skinAt>0.15){
        skinDirty=false; skinAt=TT;
        const old=skin; skin=skinTexture();
        matBack.map=skin; matBack.needsUpdate=true; old.dispose();
      }
    }
  };
}
