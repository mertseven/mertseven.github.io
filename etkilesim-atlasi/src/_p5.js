
/* ==================================================================
   13. KÜME BÖLGELERİ — manzarada adlandırılmış alanlar
   Kart merkezlerinin dışbükey kabuğu, dışa doğru şişirilip
   Catmull-Rom ile yumuşatılır. Bölge adları ölçeklenmeyen bir
   katmanda durur, böylece uzaklaşınca da okunur kalır.
================================================================== */
const SVGNS = "http://www.w3.org/2000/svg";

function convexHull(pts){
  if(pts.length < 3) return pts.slice();
  const p = pts.slice().sort((a,b)=> a[0]-b[0] || a[1]-b[1]);
  const cross = (o,a,b) => (a[0]-o[0])*(b[1]-o[1]) - (a[1]-o[1])*(b[0]-o[0]);
  const lo=[], up=[];
  for(const q of p){ while(lo.length>=2 && cross(lo[lo.length-2],lo[lo.length-1],q)<=0) lo.pop(); lo.push(q); }
  for(let i=p.length-1;i>=0;i--){ const q=p[i]; while(up.length>=2 && cross(up[up.length-2],up[up.length-1],q)<=0) up.pop(); up.push(q); }
  lo.pop(); up.pop();
  return lo.concat(up);
}

function smoothClosed(p, tension){
  const n=p.length; if(n<3) return "";
  const k = (tension===undefined?0.5:tension)/3;
  let d = `M${p[0][0].toFixed(1)},${p[0][1].toFixed(1)}`;
  for(let i=0;i<n;i++){
    const p0=p[(i-1+n)%n], p1=p[i], p2=p[(i+1)%n], p3=p[(i+2)%n];
    const c1=[p1[0]+(p2[0]-p0[0])*k, p1[1]+(p2[1]-p0[1])*k];
    const c2=[p2[0]-(p3[0]-p1[0])*k, p2[1]-(p3[1]-p1[1])*k];
    d += ` C${c1[0].toFixed(1)},${c1[1].toFixed(1)} ${c2[0].toFixed(1)},${c2[1].toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d + "Z";
}

function buildRegions(){
  let svg = document.getElementById("regions");
  if(!svg){
    svg = document.createElementNS(SVGNS,"svg");
    svg.id = "regions";
    svg.setAttribute("aria-hidden","true");
    world.insertBefore(svg, world.firstChild);
  }
  if(!linkG){
    linkG = document.createElementNS(SVGNS,"g");
    linkG.id = "links";
    svg.appendChild(linkG);          /* bölge dolgularının üstünde, kartların altında */
  } else {
    svg.appendChild(linkG);          /* yeni bölge yolları eklendiyse en üste taşı */
  }
  const labelHost = document.getElementById("labels");

  CAT_KEYS.forEach(key=>{
    const members = LIBS.filter(l=>l.cat===key);
    const pts = members.map(l=>[LAY[l.i*2], LAY[l.i*2+1]]);
    const cx = pts.reduce((s,p)=>s+p[0],0)/pts.length;
    const cy = pts.reduce((s,p)=>s+p[1],0)/pts.length;

    let ring = convexHull(pts);
    const PAD = 205;
    if(ring.length < 3){
      ring = [];
      for(let a=0;a<10;a++) ring.push([cx+Math.cos(a/10*TAU)*PAD, cy+Math.sin(a/10*TAU)*PAD]);
    } else {
      ring = ring.map(p=>{
        const dx=p[0]-cx, dy=p[1]-cy, d=Math.hypot(dx,dy)||1;
        return [p[0]+dx/d*PAD, p[1]+dy/d*PAD];
      });
    }

    let path = regionEls[key];
    if(!path){
      path = document.createElementNS(SVGNS,"path");
      path.setAttribute("fill","currentColor");
      path.setAttribute("fill-opacity",".05");
      path.setAttribute("stroke","currentColor");
      path.setAttribute("stroke-opacity",".48");
      path.setAttribute("stroke-width","1.5");
      path.setAttribute("stroke-dasharray","11 9");
      path.setAttribute("vector-effect","non-scaling-stroke");
      path.style.color = `var(--cat-${key})`;
      svg.appendChild(path);
      regionEls[key] = path;
    }
    path.setAttribute("d", smoothClosed(ring, .55));

    let minY = 1e9;
    ring.forEach(p=>{ if(p[1]<minY) minY=p[1]; });

    let lab = labelEls[key];
    if(!lab){
      lab = document.createElement("div");
      lab.className = "rlabel";
      lab.style.setProperty("--c", `var(--cat-${key})`);
      lab.innerHTML = `<b>${CATS[key].label}</b><u>${members.length} kütüphane</u>`;
      labelHost.appendChild(lab);
      labelEls[key] = lab;
    }
    lab._wx = cx;
    lab._wy = minY + 130;
  });
  syncRegions();
  linkTarget=-2;
}

/* ==================================================================
   KOMŞULUK DÜRÜSTLÜĞÜ
   t-SNE'de düzlemdeki mesafe, gerçek mesafe değildir. Burada bunu
   saklamak yerine gösteriyoruz: bir kartın 16 boyutlu uzaydaki gerçek
   komşularına manzara üzerinde çizgi çekiyoruz. Düz çizgi haritanın o
   komşuluğu koruduğu, kesikli çizgi ise kopardığı anlamına gelir.
================================================================== */
function buildHiRanks(){
  hiOrder = LIBS.map((_,i)=>
    LIBS.map((_,j)=>({j,d:hiDist(X[i],X[j])}))
        .filter(o=>o.j!==i).sort((a,b)=>a.d-b.d).map(o=>o.j));
  hiRank = hiOrder.map(order=>{
    const r=new Int16Array(N);
    order.forEach((j,idx)=>{ r[j]=idx+1; });
    return r;
  });
}

/* Düzlemde i'ye en yakın k kart */
function mapNearest(i,k){
  const out=[];
  for(let j=0;j<N;j++){
    if(j===i) continue;
    const dx=LAY[j*2]-LAY[i*2], dy=LAY[j*2+1]-LAY[i*2+1];
    out.push({j,d:dx*dx+dy*dy});
  }
  out.sort((a,b)=>a.d-b.d);
  return out.slice(0,k).map(o=>o.j);
}

function drawLinks(i){
  if(!linkG) return;
  if(i>=0 && cards[i].el.hasAttribute("data-off")) i=-1;
  if(i===linkTarget) return;
  linkTarget=i;
  if(i<0){ linkG.innerHTML=""; return; }
  if(!hiOrder) buildHiRanks();
  const l=LIBS[i];
  linkG.style.color=`var(--cat-${l.cat})`;
  const x1=LAY[i*2], y1=LAY[i*2+1];
  linkG.innerHTML = l.near.map((j,rank)=>
    `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" `+
    `x2="${LAY[j*2].toFixed(1)}" y2="${LAY[j*2+1].toFixed(1)}" `+
    `stroke="currentColor" stroke-opacity="${(0.85-rank*0.1).toFixed(2)}" `+
    `stroke-width="${(2.6-rank*0.28).toFixed(2)}" vector-effect="non-scaling-stroke"/>`).join("");
}

function syncRegions(){
  CAT_KEYS.forEach(k=>{
    const on = active.has(k);
    if(regionEls[k]) regionEls[k].style.display = on ? "" : "none";
    if(labelEls[k]) labelEls[k].style.display  = on ? "" : "none";
  });
}

/* Bölge adları birbirinin üstüne binmesin: ekran uzayında birkaç
   ayrıştırma adımı, ardından görüş alanına kelepçeleme. */
function updateLabels(){
  const clamp=(v,lo,hi)=> v<lo?lo : v>hi?hi : v;
  const items=[];
  for(const k in labelEls){
    const el=labelEls[k];
    if(el.style.display==="none") continue;
    if(!el._w || tick%45===0){ el._w=el.offsetWidth||150; el._h=el.offsetHeight||36; }
    items.push({el, w:el._w, h:el._h,
      x: el._wx*view.k+view.tx, y: el._wy*view.k+view.ty});
  }
  for(let pass=0; pass<9; pass++){
    let moved=false;
    for(let i=0;i<items.length;i++)for(let j=i+1;j<items.length;j++){
      const a=items[i], b=items[j];
      const ox=(a.w+b.w)/2+16-Math.abs(a.x-b.x);
      const oy=(a.h+b.h)/2+9 -Math.abs(a.y-b.y);
      if(ox>0 && oy>0){
        const push=(a.y<=b.y?-1:1)*oy*0.5;
        a.y+=push; b.y-=push; moved=true;
      }
    }
    if(!moved) break;
  }
  for(const o of items){
    o.el.style.left = clamp(o.x, o.w/2+14, VW-o.w/2-14).toFixed(1)+"px";
    o.el.style.top  = clamp(o.y, o.h/2+10, VH-o.h/2-10).toFixed(1)+"px";
  }
}

/* ==================================================================
   14. CANLI DEMOLAR — kütüphanenin kendisi kartın içinde çalışır
   Yalnızca dış görsel, yazı tipi ya da ağ isteği gerektirmeyenler;
   Artifact'ın CSP'si cdnjs'ten script yüklemeye izin veriyor.
   Aynı anda tek bir demo bağlanır, kart terk edilince sökülür.
================================================================== */
const CDN = {
  matter:"https://cdnjs.cloudflare.com/ajax/libs/matter-js/0.19.0/matter.min.js",
  chart: "https://cdnjs.cloudflare.com/ajax/libs/Chart.js/4.4.1/chart.umd.min.js",
  d3:    "https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js",
  zdog:  "https://cdn.jsdelivr.net/npm/zdog@1.1.3/dist/zdog.dist.min.js",
  rough: "https://cdn.jsdelivr.net/npm/roughjs@4.6.6/bundled/rough.js",
  two:   "https://cdnjs.cloudflare.com/ajax/libs/two.js/0.8.13/two.min.js",
  konva: "https://cdn.jsdelivr.net/npm/konva@9.3.6/konva.min.js",
  anime: "https://cdnjs.cloudflare.com/ajax/libs/animejs/3.2.1/anime.min.js",
  turf:  "https://cdnjs.cloudflare.com/ajax/libs/Turf.js/5.1.6/turf.min.js",
  three: "https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js",
  pixi:  "https://cdnjs.cloudflare.com/ajax/libs/pixi.js/7.4.2/pixi.min.js",
  p5:    "https://cdnjs.cloudflare.com/ajax/libs/p5.js/1.9.0/p5.min.js",
  tone:  "https://cdnjs.cloudflare.com/ajax/libs/tone/14.7.77/Tone.js",
  gsap:    "https://cdnjs.cloudflare.com/ajax/libs/gsap/3.12.5/gsap.min.js",
  interact:"https://cdnjs.cloudflare.com/ajax/libs/interact.js/1.10.26/interact.min.js",
  echarts: "https://cdnjs.cloudflare.com/ajax/libs/echarts/5.4.3/echarts.min.js",
  cyto:    "https://cdnjs.cloudflare.com/ajax/libs/cytoscape/3.28.1/cytoscape.min.js",
  fabric:  "https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js",
  paper:   "https://cdnjs.cloudflare.com/ajax/libs/paper.js/0.12.17/paper-full.min.js",
  tfjs:    "https://cdnjs.cloudflare.com/ajax/libs/tensorflow/4.17.0/tf.min.js",
  d3force: "https://cdnjs.cloudflare.com/ajax/libs/d3/7.8.5/d3.min.js",
  plot:    "https://cdn.jsdelivr.net/npm/@observablehq/plot@0.6.14/dist/plot.umd.min.js",
  arquero: "https://cdn.jsdelivr.net/npm/arquero@5.4.0/dist/arquero.min.js",
  h3:      "https://cdn.jsdelivr.net/npm/h3-js@4.1.0/dist/h3-js.umd.js",
  lottie:  "https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js",
  swiper:  "https://cdnjs.cloudflare.com/ajax/libs/Swiper/11.0.5/swiper-bundle.min.js",
  maplibre:"https://cdnjs.cloudflare.com/ajax/libs/maplibre-gl/4.7.1/maplibre-gl.min.js",
  lenis:   "https://cdn.jsdelivr.net/npm/@studio-freight/lenis@1.0.42/dist/lenis.min.js"
};
const GLOBAL = { matter:"Matter", chart:"Chart", d3:"d3", zdog:"Zdog",
                 rough:"rough", two:"Two", konva:"Konva", anime:"anime", turf:"turf",
                 three:"THREE", pixi:"PIXI", p5:"p5", tone:"Tone",
                 gsap:"gsap", interact:"interact", echarts:"echarts", cyto:"cytoscape",
                 plot:"Plot", fabric:"fabric", paper:"paper", arquero:"aq",
                 h3:"h3", tfjs:"tf", d3force:"d3",
                 lottie:"lottie", swiper:"Swiper", maplibre:"maplibregl", lenis:"Lenis" };

/* Ses, tarayıcı kuralı gereği kullanıcı jesti olmadan başlayamaz — ve zaten
   kimsenin izinsiz ses duymaması gerekir. Bu demolar bir düğmeyle açılır. */
const GESTURE = { tone:"Sesi başlat" };
/* Bağımlılıklar. Observable Plot'un UMD paketi d3'ü içine almaz, global
   olarak bekler; yalnız Plot yüklenirse "Cannot read properties of undefined
   (reading 'timeSecond')" diye ölür. Sırayı burası garantiliyor. */
const NEEDS = { plot:["d3"] };
const pending = {};
function loadLib(key){
  if(window[GLOBAL[key]]) return Promise.resolve();
  if(pending[key]) return pending[key];
  pending[key] = Promise.all((NEEDS[key]||[]).map(k=>loadLib(k))).then(()=>
    new Promise((res,rej)=>{
      const el=document.createElement("script");
      el.src=CDN[key]; el.async=true;
      el.onload=()=>res(); el.onerror=()=>rej(new Error("yüklenemedi: "+key));
      document.head.appendChild(el);
    })
  );
  return pending[key];
}

function mkCanvas(host,S){
  const cv=document.createElement("canvas");
  cv.width=cv.height=S*2;
  cv.style.width=cv.style.height="100%";
  host.appendChild(cv);
  return cv;
}

const DEMOS = {
  /* gerçek katı cisim fiziği: kutular düşer, yığılır, devrilir */
  matter(host,S,ink,opts){
    const M=window.Matter;
    const engine=M.Engine.create();
    const render=M.Render.create({element:host,engine,
      options:{width:S,height:S,wireframes:false,background:"transparent",
               pixelRatio:Math.min(2,window.devicePixelRatio||1)}});
    M.Composite.add(engine.world,[
      M.Bodies.rectangle(S/2,S-5,S*1.4,10,{isStatic:true,render:{fillStyle:ink}}),
      M.Bodies.rectangle(-8,S/2,16,S*3,{isStatic:true,render:{visible:false}}),
      M.Bodies.rectangle(S+8,S/2,16,S*3,{isStatic:true,render:{visible:false}})
    ]);
    const drop=()=>{
      const w=S*0.09+Math.random()*S*0.11;
      const x=S*0.18+Math.random()*S*0.64;
      const b=Math.random()<.28
        ? M.Bodies.circle(x,-40,w/2,{restitution:.45,friction:.4,render:{fillStyle:ink}})
        : M.Bodies.rectangle(x,-40,w,w,{angle:Math.random()*3,restitution:.15,friction:.6,render:{fillStyle:ink}});
      M.Composite.add(engine.world,b);
      const all=M.Composite.allBodies(engine.world);
      if(all.length>24) M.Composite.remove(engine.world,all[3]);
    };
    for(let i=0;i<6;i++) setTimeout(drop,i*200);
    const iv=setInterval(drop,850);
    if(opts && opts.interactive){
      const mouse=M.Mouse.create(render.canvas);
      const mc=M.MouseConstraint.create(engine,{mouse,constraint:{stiffness:.18,render:{visible:false}}});
      M.Composite.add(engine.world,mc);
      render.mouse=mouse;
    }
    M.Render.run(render);
    const runner=M.Runner.create(); M.Runner.run(runner,engine);
    return ()=>{ clearInterval(iv); M.Render.stop(render); M.Runner.stop(runner);
                 M.Engine.clear(engine); if(render.canvas) render.canvas.remove(); };
  },

  /* gerçek Chart.js: veri her birkaç saniyede değişir, geçişi kendi yapar */
  chart(host,S,ink){
    /* Chart'ın kendi responsive ölçeklemesi kart dönüşümüyle çakışıyor;
       tuvali sabit veriyoruz, CSS 1:1 gerdiriyor. */
    const cv=document.createElement("canvas");
    cv.width=cv.height=S*2;
    host.appendChild(cv);
    const rnd=()=>Array.from({length:7},()=>18+Math.random()*84);
    const ch=new window.Chart(cv,{
      type:"bar",
      data:{labels:["","","","","","",""],
            datasets:[{data:rnd(),backgroundColor:ink,borderRadius:4,barPercentage:.68}]},
      options:{responsive:false,maintainAspectRatio:false,devicePixelRatio:1,
        layout:{padding:S*.09},
        animation:{duration:850},
        plugins:{legend:{display:false},tooltip:{enabled:false}},
        scales:{x:{grid:{display:false},border:{color:ink,width:3},ticks:{display:false}},
                y:{min:0,max:112,grid:{color:ink+"22",lineWidth:2},border:{display:false},ticks:{display:false}}}}
    });
    const iv=setInterval(()=>{ ch.data.datasets[0].data=rnd(); ch.update(); },1900);
    return ()=>{ clearInterval(iv); ch.destroy(); cv.remove(); };
  },

  /* gerçek d3-force: sürekli ısıtılan bir kuvvet simülasyonu */
  d3(host,S,ink){
    const d3=window.d3;
    const svg=d3.select(host).append("svg").attr("viewBox",`0 0 ${S} ${S}`);
    const nodes=d3.range(15).map(i=>({id:i,r:3.5+Math.random()*4.5}));
    const links=d3.range(18).map(()=>({source:(Math.random()*15)|0,target:(Math.random()*15)|0}));
    const link=svg.append("g").attr("stroke",ink).attr("stroke-opacity",.3).attr("stroke-width",1.2)
      .selectAll("line").data(links).join("line");
    const node=svg.append("g").attr("fill",ink)
      .selectAll("circle").data(nodes).join("circle").attr("r",d=>d.r);
    const sim=d3.forceSimulation(nodes)
      .force("link",d3.forceLink(links).distance(S*.16).strength(.45))
      .force("charge",d3.forceManyBody().strength(-S*.32))
      .force("center",d3.forceCenter(S/2,S/2))
      .force("collide",d3.forceCollide(S*.055))
      .alphaTarget(.055).restart()
      .on("tick",()=>{
        link.attr("x1",d=>d.source.x).attr("y1",d=>d.source.y)
            .attr("x2",d=>d.target.x).attr("y2",d=>d.target.y);
        node.attr("cx",d=>d.x).attr("cy",d=>d.y);
      });
    const iv=setInterval(()=>sim.alpha(.7).restart(),5000);
    return ()=>{ clearInterval(iv); sim.stop(); svg.remove(); };
  },

  /* gerçek Zdog: düz gölgeli sözde-3B, kendi render grafiğiyle */
  zdog(host,S,ink){
    const Z=window.Zdog, cv=mkCanvas(host,S);
    const illo=new Z.Illustration({element:cv,zoom:(S*2)/150,resize:false});
    new Z.Box({addTo:illo,width:48,height:48,depth:48,stroke:7,color:ink,
      leftFace:ink,rightFace:ink,topFace:ink,bottomFace:ink,frontFace:ink,rearFace:ink});
    let raf,a=0;
    (function tick(){ a+=.014; illo.rotate.y=a; illo.rotate.x=Math.sin(a*.65)*.5;
                      illo.updateRenderGraph(); raf=requestAnimationFrame(tick); })();
    return ()=>{ cancelAnimationFrame(raf); cv.remove(); };
  },

  /* gerçek Rough.js: her çizimde yeni bir tohum, yani her seferinde başka bir el */
  rough(host,S,ink){
    const cv=mkCanvas(host,S), g=cv.getContext("2d");
    g.scale(2,2);
    const rc=window.rough.canvas(cv);
    const draw=()=>{
      g.clearRect(0,0,S,S);
      const o={stroke:ink,strokeWidth:1.7,roughness:2.3,bowing:1.8,seed:(Math.random()*1e5)|0};
      rc.rectangle(S*.12,S*.14,S*.46,S*.36,o);
      rc.circle(S*.66,S*.62,S*.4,Object.assign({},o,{fill:ink,fillStyle:"hachure",hachureGap:7,fillWeight:1.1}));
      rc.line(S*.12,S*.84,S*.88,S*.84,o);
    };
    draw();
    const iv=setInterval(draw,1500);
    return ()=>{ clearInterval(iv); cv.remove(); };
  },

  /* gerçek Two.js: tek çizim tanımı, kendi güncelleme döngüsü */
  two(host,S,ink){
    const T=window.Two;
    const two=new T({width:S,height:S,type:T.Types.canvas}).appendTo(host);
    const shapes=[];
    for(let i=0;i<5;i++){
      const s=two.makePolygon(S/2,S/2,S*.07+i*S*.058,3+i);
      s.noFill(); s.stroke=ink; s.linewidth=1.7; shapes.push(s);
    }
    const upd=()=>shapes.forEach((s,i)=>{ s.rotation += .005*(i%2?1:-1)*(1+i*.35); });
    two.bind("update",upd); two.play();
    return ()=>{ try{two.pause(); two.unbind("update",upd);}catch(e){} host.innerHTML=""; };
  },

  /* gerçek Konva: sahne, katman ve kendi animasyon döngüsü */
  konva(host,S,ink,opts){
    const K=window.Konva;
    const inter=!!(opts&&opts.interactive);
    const st=new K.Stage({container:host,width:S,height:S});
    const layer=new K.Layer(); st.add(layer);
    const items=[];
    for(let i=0;i<9;i++){
      const r=new K.Rect({x:S*(.22+(i%3)*.28), y:S*(.22+((i/3)|0)*.28),
        width:S*.17, height:S*.17, offsetX:S*.085, offsetY:S*.085,
        fill:ink, cornerRadius:3, draggable:inter});
      layer.add(r); items.push(r);
    }
    const anim=new K.Animation(f=>{
      if(inter) return;
      const t=f.time/1000;
      items.forEach((r,i)=>{ r.rotation(Math.sin(t*1.1+i*.6)*45);
        const sc=.7+.4*Math.sin(t*1.4+i*.8); r.scaleX(sc); r.scaleY(sc); });
    },layer);
    if(inter) layer.draw(); else anim.start();
    return ()=>{ anim.stop(); st.destroy(); };
  },

  /* gerçek anime.js: ızgara üzerinde kademeli gecikme (stagger) */
  anime(host,S,ink){
    const A=window.anime;
    const grid=document.createElement("div");
    grid.style.cssText=`position:absolute;inset:${S*.13}px;display:grid;`+
      `grid-template-columns:repeat(6,1fr);grid-template-rows:repeat(6,1fr);gap:${S*.028}px`;
    for(let i=0;i<36;i++){
      const b=document.createElement("b");
      b.style.cssText=`background:${ink};border-radius:2px;display:block`;
      grid.appendChild(b);
    }
    host.appendChild(grid);
    const anim=A({targets:grid.children,
      scale:[{value:.2,duration:0},{value:1,duration:720}],
      opacity:[{value:.2,duration:0},{value:1,duration:720}],
      delay:A.stagger(85,{grid:[6,6],from:"center"}),
      direction:"alternate", loop:true, easing:"easeInOutQuad"});
    return ()=>{ try{anim.pause(); A.remove(grid.children);}catch(e){} grid.remove(); };
  },

  /* gerçek Turf.js: her karede tampon (buffer) ve merkez yeniden hesaplanır */
  turf(host,S,ink){
    const tf=window.turf, cv=mkCanvas(host,S), g=cv.getContext("2d");
    g.scale(2,2);
    const toXY=c=>[S/2+c[0]*S*.30, S/2-c[1]*S*.30];
    const stroke=(coords,dash)=>{
      g.beginPath();
      coords.forEach((c,i)=>{ const p=toXY(c); i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]); });
      g.closePath(); g.setLineDash(dash||[]); g.strokeStyle=ink; g.lineWidth=1.7; g.stroke(); g.setLineDash([]);
    };
    let a=0;
    const step=()=>{
      a+=.045;
      const pts=[];
      for(let i=0;i<7;i++){
        const an=i/7*TAU+a*.35, r=.55+.3*Math.sin(i*2.1+a);
        pts.push([Math.cos(an)*r, Math.sin(an)*r]);
      }
      pts.push(pts[0]);
      const poly=tf.polygon([pts]);
      g.clearRect(0,0,S,S);
      try{
        const buf=tf.buffer(poly,.22,{units:"degrees"});
        if(buf && buf.geometry) stroke(buf.geometry.coordinates[0],[6,6]);
      }catch(e){}
      stroke(poly.geometry.coordinates[0]);
      const c=toXY(tf.centroid(poly).geometry.coordinates);
      g.fillStyle=ink; g.beginPath(); g.arc(c[0],c[1],4,0,TAU); g.fill();
    };
    step();
    const iv=setInterval(step,55);
    return ()=>{ clearInterval(iv); cv.remove(); };
  },

  /* gerçek Three.js: WebGL bağlamı, sahne, kamera, tel kafes + nokta bulutu */
  three(host,S,ink){
    const T=window.THREE;
    const scene=new T.Scene();
    const cam=new T.PerspectiveCamera(48,1,.1,100); cam.position.z=3.35;
    const r=new T.WebGLRenderer({alpha:true,antialias:true});
    r.setPixelRatio(Math.min(2,window.devicePixelRatio||1));
    r.setSize(S,S,false); r.setClearColor(0x000000,0);
    host.appendChild(r.domElement);
    const geo=new T.IcosahedronGeometry(1.2,1);
    const mesh=new T.Mesh(geo,new T.MeshBasicMaterial({color:ink,wireframe:true,transparent:true,opacity:.8}));
    const pts=new T.Points(geo,new T.PointsMaterial({color:ink,size:.08}));
    scene.add(mesh); scene.add(pts);
    let raf;
    (function tick(){
      mesh.rotation.x+=.0045; mesh.rotation.y+=.0078;
      pts.rotation.x=mesh.rotation.x; pts.rotation.y=mesh.rotation.y;
      r.render(scene,cam); raf=requestAnimationFrame(tick);
    })();
    return ()=>{ cancelAnimationFrame(raf);
      geo.dispose(); mesh.material.dispose(); pts.material.dispose();
      r.dispose(); if(r.forceContextLoss) r.forceContextLoss(); r.domElement.remove(); };
  },

  /* gerçek PixiJS: 220 sprite, tek toplu çizim yığınında */
  pixi(host,S,ink){
    const P=window.PIXI, col=parseInt(ink.slice(1),16);
    const app=new P.Application({width:S,height:S,backgroundAlpha:0,antialias:true,
      resolution:Math.min(2,window.devicePixelRatio||1),autoDensity:false});
    host.appendChild(app.view);
    const items=[];
    for(let i=0;i<220;i++){
      const g=new P.Graphics();
      g.beginFill(col); g.drawRect(-3.5,-3.5,7,7); g.endFill();
      g.x=Math.random()*S; g.y=Math.random()*S;
      g.vx=(Math.random()-.5)*2; g.vy=(Math.random()-.5)*2;
      g.spin=(Math.random()-.5)*.07;
      app.stage.addChild(g); items.push(g);
    }
    const upd=()=>{ for(const g of items){
      g.x+=g.vx; g.y+=g.vy; g.rotation+=g.spin;
      if(g.x<5||g.x>S-5) g.vx*=-1;
      if(g.y<5||g.y>S-5) g.vy*=-1; } };
    app.ticker.add(upd);
    return ()=>{ try{ app.ticker.remove(upd); app.destroy(true,{children:true}); }catch(e){} };
  },

  /* gerçek p5.js: örnek kipinde setup/draw döngüsü ve p5.noise alanı */
  p5(host,S,ink){
    const P5=window.p5;
    let t=0;
    const inst=new P5((p)=>{
      p.setup=()=>{ p.createCanvas(S,S); p.noFill(); p.strokeWeight(1.4); };
      p.draw=()=>{
        p.clear(); p.stroke(ink); t+=.008;
        for(let ring=0;ring<9;ring++){
          p.beginShape();
          for(let a=0;a<=44;a++){
            const an=a/44*p.TWO_PI;
            const n=p.noise(p.cos(an)*.75+2, p.sin(an)*.75+2, t+ring*.07);
            const rad=S*(.085+ring*.037)*(.7+n*.62);
            p.vertex(S/2+p.cos(an)*rad, S/2+p.sin(an)*rad);
          }
          p.endShape(p.CLOSE);
        }
      };
    }, host);
    return ()=>{ try{ inst.remove(); }catch(e){} host.innerHTML=""; };
  },

  /* gerçek Tone.js: sentezleyici, transport, sekans ve dalga formu çözümleyicisi.
     Kullanıcı jestiyle başlar (bkz. GESTURE), karttan ayrılınca susar. */
  async tone(host,S,ink){
    const T=window.Tone;
    await T.start();
    const cv=mkCanvas(host,S), g=cv.getContext("2d");
    g.scale(2,2);
    const analyser=new T.Analyser("waveform",256);
    const synth=new T.PolySynth(T.Synth,{
      oscillator:{type:"triangle"},
      envelope:{attack:.008,decay:.24,sustain:.14,release:.55}});
    synth.volume.value=-17;
    /* geri beslemeli gecikme: notalar arasında kuyruk bırakır,
       dalga formu iki vuruş arasında düz çizgiye düşmez */
    const fx=new T.FeedbackDelay("8n",.32);
    fx.wet.value=.3;
    synth.connect(fx); fx.connect(analyser); fx.toDestination();
    const notes=["C4","E4","G4","B4","A4","G4","E4","D4"];
    let step=0;
    const seq=new T.Sequence((time,i)=>{
      synth.triggerAttackRelease(notes[i],"16n",time);
      T.Draw.schedule(()=>{ step=i; }, time);
    }, notes.map((_,i)=>i), "8n");
    T.Transport.bpm.value=104;
    seq.start(0); T.Transport.start();
    let raf;
    (function tick(){
      g.clearRect(0,0,S,S);
      const w=analyser.getValue();
      g.strokeStyle=ink; g.lineWidth=1.8; g.beginPath();
      for(let i=0;i<w.length;i++){
        const x=i/(w.length-1)*S, y=S*.36-w[i]*S*.55;
        i?g.lineTo(x,y):g.moveTo(x,y);
      }
      g.stroke();
      g.fillStyle=ink;
      for(let i=0;i<8;i++){
        g.globalAlpha = i===step ? 1 : .2;
        g.fillRect(S*.075+i*S*.107, S*.68, S*.076, S*.17);
      }
      g.globalAlpha=1;
      raf=requestAnimationFrame(tick);
    })();
    return ()=>{ cancelAnimationFrame(raf);
      try{ T.Transport.stop(); T.Transport.cancel(); seq.dispose();
           synth.dispose(); fx.dispose(); analyser.dispose(); }catch(e){}
      cv.remove(); };
  },

  /* gerçek GSAP: bir zaman çizelgesi, kademeli gecikme ve yay yumuşatması */
  gsap(host,S,ink){
    const G=window.gsap;
    const wrap=document.createElement("div");
    wrap.style.cssText="position:absolute;inset:0";
    const boxes=[];
    for(let i=0;i<6;i++){
      const b=document.createElement("b");
      b.style.cssText=`position:absolute;left:${S*(.13+i*.132)}px;top:${S*.455}px;`+
        `width:${S*.085}px;height:${S*.085}px;background:${ink};border-radius:2px;display:block`;
      wrap.appendChild(b); boxes.push(b);
    }
    host.appendChild(wrap);
    const tl=G.timeline({repeat:-1,yoyo:true,defaults:{ease:"power2.inOut",duration:.55}});
    tl.to(boxes,{y:-S*.27,stagger:.075})
      .to(boxes,{rotation:180,stagger:.075},"<0.12")
      .to(boxes,{y:S*.27,stagger:.075})
      .to(boxes,{rotation:360,stagger:.075},"<0.12");
    return ()=>{ try{ tl.kill(); G.killTweensOf(boxes); }catch(e){} wrap.remove(); };
  },

  /* gerçek Interact.js: kutuyu siz sürükleyin — kart yerinde kalır */
  interact(host,S,ink){
    const I=window.interact;
    const wrap=document.createElement("div");
    wrap.style.cssText="position:absolute;inset:0;overflow:hidden";
    const box=document.createElement("div");
    box.style.cssText=`position:absolute;left:${S*.3}px;top:${S*.33}px;width:${S*.4}px;`+
      `height:${S*.34}px;border:2px solid ${ink};border-radius:5px;touch-action:none;cursor:move;`+
      `display:grid;place-items:center`;
    const hint=document.createElement("span");
    hint.textContent="sürükle";
    hint.style.cssText=`font-family:monospace;font-size:${S*.052}px;letter-spacing:.14em;`+
      `text-transform:uppercase;color:${ink};pointer-events:none;opacity:.7`;
    box.appendChild(hint); wrap.appendChild(box); host.appendChild(wrap);
    let x=S*.3, y=S*.33;
    I(box).draggable({ listeners:{ move(e){
      x=Math.max(0,Math.min(S-e.target.offsetWidth,  x+e.dx));
      y=Math.max(0,Math.min(S-e.target.offsetHeight, y+e.dy));
      e.target.style.left=x+"px"; e.target.style.top=y+"px";
    }}});
    return ()=>{ try{ I(box).unset(); }catch(e){} wrap.remove(); };
  },

  /* gerçek ECharts: veri değişince geçişi kendi yönetir */
  echarts(host,S,ink){
    const E=window.echarts;
    const div=document.createElement("div");
    div.style.cssText="position:absolute;inset:0";
    host.appendChild(div);
    const ch=E.init(div,null,{renderer:"canvas",width:S,height:S});
    const gen=()=>Array.from({length:8},()=>Math.round(18+Math.random()*84));
    ch.setOption({
      animationDuration:900, animationDurationUpdate:900,
      grid:{left:S*.1,right:S*.09,top:S*.13,bottom:S*.13},
      xAxis:{type:"category",data:["","","","","","","",""],
             axisLine:{lineStyle:{color:ink,width:2}},axisTick:{show:false},axisLabel:{show:false}},
      yAxis:{max:112,axisLine:{show:false},axisLabel:{show:false},
             splitLine:{lineStyle:{color:ink,opacity:.13}}},
      series:[{type:"line",data:gen(),smooth:true,symbolSize:S*.038,
        lineStyle:{color:ink,width:2.6},itemStyle:{color:ink},
        areaStyle:{color:ink,opacity:.13}}]
    });
    const iv=setInterval(()=>ch.setOption({series:[{data:gen()}]}),2100);
    return ()=>{ clearInterval(iv); try{ch.dispose();}catch(e){} div.remove(); };
  },

  /* gerçek Cytoscape.js: cose yerleşim algoritması, her seferinde yeniden */
  cyto(host,S,ink,opts){
    const cyto=window.cytoscape;
    const inter=!!(opts&&opts.interactive);
    const nodes=Array.from({length:13},(_,i)=>({data:{id:"n"+i}}));
    const edges=Array.from({length:16},(_,i)=>{
      let a=(Math.random()*13)|0, b=(Math.random()*13)|0;
      if(a===b) b=(b+1)%13;
      return {data:{id:"e"+i,source:"n"+a,target:"n"+b}};
    });
    const cy=cyto({
      container:host, elements:{nodes,edges},
      style:[{selector:"node",style:{"background-color":ink,width:S*.075,height:S*.075}},
             {selector:"edge",style:{"line-color":ink,opacity:.34,width:1.7,"curve-style":"bezier"}}],
      userZoomingEnabled:inter,userPanningEnabled:inter,boxSelectionEnabled:false,
      autoungrabify:!inter
    });
    /* Yerleşim, tuval ölçüsü kesinleştikten sonra çalışmalı; yoksa
       düğümler tek bir çizgiye dizilip çöküyor. */
    const run=()=>{
      try{
        cy.resize();
        const lo=cy.layout({name:"cose",animate:true,animationDuration:1500,
                            padding:S*.14,randomize:true,nodeRepulsion:9000});
        lo.on("layoutstop",()=>{ try{ cy.zoom(1); cy.center(); }catch(e){} });
        lo.run();
      }catch(e){}
    };
    setTimeout(run,80);
    const iv=setInterval(run,5400);
    return ()=>{ clearInterval(iv); try{cy.destroy();}catch(e){} host.innerHTML=""; };
  },

  /* gerçek Observable Plot: tek işaret tanımı, ölçekler kendiliğinden */
  plot(host,S,ink){
    const P=window.Plot;
    let node=null;
    const draw=()=>{
      const data=Array.from({length:44},(_,i)=>({
        x:i, y:Math.sin(i/6+Math.random()*.2)*22+46+Math.random()*14}));
      const el=P.plot({width:S,height:S,margin:S*.09,
        style:{background:"transparent",color:ink},
        x:{axis:null}, y:{axis:null, domain:[0,90]},
        marks:[P.areaY(data,{x:"x",y:"y",fill:ink,fillOpacity:.14}),
               P.lineY(data,{x:"x",y:"y",stroke:ink,strokeWidth:2.2,curve:"catmull-rom"}),
               P.dot(data.filter((_,i)=>i%8===0),{x:"x",y:"y",fill:ink,r:S*.017})]});
      el.style.position="absolute"; el.style.inset="0";
      if(node) node.remove();
      node=el; host.appendChild(el);
    };
    draw();
    const iv=setInterval(draw,2400);
    return ()=>{ clearInterval(iv); if(node) node.remove(); };
  },

  /* gerçek Fabric.js: canvas üstünde nesne modeli */
  fabric(host,S,ink,opts){
    const F=window.fabric;
    const inter=!!(opts&&opts.interactive);
    const cv=document.createElement("canvas");
    cv.width=cv.height=S;
    host.appendChild(cv);
    const c=new F.Canvas(cv,{selection:inter,renderOnAddRemove:false});
    const r =new F.Rect({left:S*.16,top:S*.17,width:S*.3,height:S*.24,fill:ink,rx:4,ry:4});
    const t =new F.Triangle({left:S*.56,top:S*.15,width:S*.28,height:S*.28,
                             fill:"",stroke:ink,strokeWidth:3});
    const ci=new F.Circle({left:S*.3,top:S*.55,radius:S*.14,
                           fill:"",stroke:ink,strokeWidth:3});
    [r,t,ci].forEach(o=>o.set({selectable:inter,hasControls:inter}));
    c.add(r,t,ci);
    if(inter){ c.requestRenderAll(); return ()=>{ try{c.dispose();}catch(e){} host.innerHTML=""; }; }
    let raf,a=0;
    (function tick(){ a+=.011;
      r.set({angle:Math.sin(a)*24});
      t.set({angle:-a*22});
      const sc=1+Math.sin(a*1.4)*.13; ci.set({scaleX:sc,scaleY:sc});
      c.requestRenderAll(); raf=requestAnimationFrame(tick);
    })();
    return ()=>{ cancelAnimationFrame(raf); try{c.dispose();}catch(e){} host.innerHTML=""; };
  },

  /* gerçek Paper.js: vektör yol, düğüm düzenleme ve kendi kare döngüsü */
  paper(host,S,ink){
    const P=window.paper;
    const cv=document.createElement("canvas");
    cv.width=cv.height=S*2; cv.style.width=cv.style.height="100%";
    host.appendChild(cv);
    const sc=new P.PaperScope();
    sc.setup(cv);
    const n=26, R=S*.62, C=S;
    const path=new sc.Path({strokeColor:ink,strokeWidth:3.2,closed:true});
    for(let i=0;i<n;i++){ const a=i/n*Math.PI*2;
      path.add(new sc.Point(C+Math.cos(a)*R, C+Math.sin(a)*R)); }
    path.smooth();
    let t=0;
    sc.view.onFrame=()=>{ t+=.022;
      path.segments.forEach((seg,i)=>{ const a=i/n*Math.PI*2;
        const rr=R*(.68+.28*Math.sin(a*3+t));
        seg.point.x=C+Math.cos(a)*rr; seg.point.y=C+Math.sin(a)*rr; });
      path.smooth();
    };
    return ()=>{ try{ sc.view.onFrame=null; sc.project.clear(); sc.view.remove(); }catch(e){}
                 cv.remove(); };
  },

  /* gerçek Arquero: her turda yeni satırlar gruplanıp özetlenir */
  arquero(host,S,ink){
    const aq=window.aq;
    const el=document.createElement("div");
    el.style.cssText=`position:absolute;inset:${S*.1}px;font-family:monospace;`+
      `font-size:${S*.052}px;color:${ink};display:flex;flex-direction:column;`+
      `gap:${S*.02}px;overflow:hidden`;
    host.appendChild(el);
    const cats=["ege","marmara","akdeniz","iç anadolu"];
    const render=()=>{
      const rows=Array.from({length:40},()=>({
        k:cats[(Math.random()*4)|0], v:Math.round(Math.random()*100)}));
      const t=aq.from(rows).groupby("k")
                .rollup({n:aq.op.count(), ort:aq.op.mean("v")})
                .orderby(aq.desc("ort"));
      el.innerHTML=`<div style="opacity:.45;letter-spacing:.12em">GROUPBY · ROLLUP</div>`+
        t.objects().map(o=>
          `<div style="display:flex;justify-content:space-between;gap:${S*.03}px;`+
          `border-bottom:1px solid ${ink}2E;padding:${S*.014}px 0">`+
          `<span>${o.k}</span><span style="opacity:.6">n=${o.n}</span>`+
          `<span>${o.ort.toFixed(1)}</span></div>`).join("");
    };
    render();
    const iv=setInterval(render,1900);
    return ()=>{ clearInterval(iv); el.remove(); };
  },

  /* gerçek H3: gezen noktalar altıgen hücre dizinine çevrilir */
  h3(host,S,ink){
    const H=window.h3, cv=mkCanvas(host,S), g=cv.getContext("2d");
    g.scale(2,2);
    let a=0;
    const step=()=>{
      a+=.014;
      const lat0=41+Math.sin(a)*.32, lng0=29+Math.cos(a*.8)*.32;
      const cells=new Set();
      for(let i=0;i<80;i++){
        const r=Math.sqrt(Math.random())*.5, th=Math.random()*TAU;
        cells.add(H.latLngToCell(lat0+Math.sin(th)*r*.5, lng0+Math.cos(th)*r, 5));
      }
      const polys=[...cells].map(c=>H.cellToBoundary(c));
      let mnA=1e9,mxA=-1e9,mnO=1e9,mxO=-1e9;
      polys.forEach(b=>b.forEach(pt=>{
        if(pt[0]<mnA)mnA=pt[0]; if(pt[0]>mxA)mxA=pt[0];
        if(pt[1]<mnO)mnO=pt[1]; if(pt[1]>mxO)mxO=pt[1]; }));
      const k=Math.min(S*.84/((mxO-mnO)||1), S*.84/((mxA-mnA)||1));
      const px=pt=>[S/2+(pt[1]-(mnO+mxO)/2)*k, S/2-(pt[0]-(mnA+mxA)/2)*k];
      g.clearRect(0,0,S,S);
      g.strokeStyle=ink; g.fillStyle=ink; g.lineWidth=1.1;
      polys.forEach((b,i)=>{
        g.beginPath();
        b.forEach((pt,j)=>{ const q=px(pt); j?g.lineTo(q[0],q[1]):g.moveTo(q[0],q[1]); });
        g.closePath();
        g.globalAlpha=.08+(i%6)*.11; g.fill();
        g.globalAlpha=.5; g.stroke();
      });
      g.globalAlpha=1;
    };
    step();
    const iv=setInterval(step,90);
    return ()=>{ clearInterval(iv); cv.remove(); };
  },

  /* gerçek TensorFlow.js: iki gizli katmanlı bir ağ, kartın içinde eğitiliyor */
  tfjs(host,S,ink){
    const tf=window.tf, cv=mkCanvas(host,S), g=cv.getContext("2d");
    g.scale(2,2);
    const xs=[], ys=[];
    for(let i=0;i<48;i++){ const x=i/47*2-1;
      xs.push(x); ys.push(Math.sin(x*3)*.62+(Math.random()-.5)*.12); }
    const X=tf.tensor2d(xs,[48,1]), Y=tf.tensor2d(ys,[48,1]);
    const model=tf.sequential();
    model.add(tf.layers.dense({units:16,activation:"tanh",inputShape:[1]}));
    model.add(tf.layers.dense({units:16,activation:"tanh"}));
    model.add(tf.layers.dense({units:1}));
    model.compile({optimizer:tf.train.adam(.06),loss:"meanSquaredError"});
    const px=(x,y)=>[S*.12+(x+1)/2*S*.76, S*.5-y*S*.33];
    let alive=true, epoch=0;
    const draw=(pred)=>{
      g.clearRect(0,0,S,S);
      g.fillStyle=ink; g.globalAlpha=.38;
      for(let i=0;i<48;i++){ const p=px(xs[i],ys[i]);
        g.beginPath(); g.arc(p[0],p[1],S*.015,0,TAU); g.fill(); }
      g.globalAlpha=1;
      if(pred){ g.strokeStyle=ink; g.lineWidth=2.6; g.beginPath();
        for(let i=0;i<48;i++){ const p=px(xs[i],pred[i]);
          i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1]); }
        g.stroke(); }
      g.font=`500 ${S*.05}px monospace`; g.globalAlpha=.55;
      g.fillText("epoch "+epoch, S*.12, S*.92); g.globalAlpha=1;
    };
    draw(null);
    (async function loop(){
      while(alive && epoch<600){
        try{ await model.fit(X,Y,{epochs:5,verbose:0}); }catch(e){ return; }
        if(!alive) return;
        epoch+=5;
        const p=model.predict(X);
        const arr=Array.from(await p.data()); p.dispose();
        if(!alive) return;
        draw(arr);
        await new Promise(r=>setTimeout(r,30));
      }
    })();
    return ()=>{ alive=false;
      setTimeout(()=>{ try{X.dispose();Y.dispose();model.dispose();}catch(e){} },400);
      cv.remove(); };
  },

  /* gerçek d3-force: itme kuvveti değiştikçe parçacıklar yeniden yerleşir */
  d3force(host,S,ink){
    const d3=window.d3, cv=mkCanvas(host,S), g=cv.getContext("2d");
    g.scale(2,2);
    const nodes=d3.range(85).map(()=>({}));
    const sim=d3.forceSimulation(nodes)
      .force("charge",d3.forceManyBody().strength(-5))
      .force("center",d3.forceCenter(S/2,S/2))
      .force("collide",d3.forceCollide(S*.03))
      .force("x",d3.forceX(S/2).strength(.025))
      .force("y",d3.forceY(S/2).strength(.025))
      .alphaTarget(.14).restart()
      .on("tick",()=>{
        g.clearRect(0,0,S,S); g.fillStyle=ink;
        for(const n of nodes){ g.beginPath(); g.arc(n.x,n.y,S*.023,0,TAU); g.fill(); }
      });
    const iv=setInterval(()=>{
      sim.force("charge").strength(Math.random()<.5 ? -5 : -22);
      sim.alpha(.6).restart();
    },3200);
    return ()=>{ clearInterval(iv); sim.stop(); cv.remove(); };
  },

  /* gerçek Lottie: elle yazılmış bir After Effects kompozisyonu (JSON),
     lottie-web tarafından SVG olarak yeniden oynatılıyor. */
  lottie(host,S,ink){
    const L=window.lottie;
    const rgb=[parseInt(ink.slice(1,3),16)/255,
               parseInt(ink.slice(3,5),16)/255,
               parseInt(ink.slice(5,7),16)/255, 1];
    const sq=(ind,cx,delay,dir)=>({
      ddd:0, ind, ty:4, nm:"s"+ind, sr:1, ao:0, ip:0, op:90, st:0,
      ks:{ o:{a:0,k:100},
           p:{a:1,k:[
             {t:delay, s:[cx,128,0], e:[cx,74,0],
              i:{x:[.35,.35,.35],y:[1,1,1]}, o:{x:[.65,.65,.65],y:[0,0,0]}},
             {t:delay+30, s:[cx,74,0], e:[cx,128,0],
              i:{x:[.35,.35,.35],y:[1,1,1]}, o:{x:[.65,.65,.65],y:[0,0,0]}},
             {t:delay+60, s:[cx,128,0]}]},
           a:{a:0,k:[0,0,0]},
           s:{a:0,k:[100,100,100]},
           r:{a:1,k:[
             {t:delay, s:[0], e:[180*dir],
              i:{x:[.35],y:[1]}, o:{x:[.65],y:[0]}},
             {t:delay+60, s:[180*dir]}]} },
      shapes:[{ty:"gr",nm:"g",it:[
        {ty:"rc",d:1,s:{a:0,k:[46,46]},p:{a:0,k:[0,0]},r:{a:0,k:6}},
        {ty:"fl",c:{a:0,k:rgb},o:{a:0,k:100},r:1},
        {ty:"tr",p:{a:0,k:[0,0]},a:{a:0,k:[0,0]},s:{a:0,k:[100,100]},
         r:{a:0,k:0},o:{a:0,k:100}}
      ]}]
    });
    const data={v:"5.7.4",fr:30,ip:0,op:90,w:200,h:200,nm:"atlas",ddd:0,assets:[],
      layers:[sq(1,56,0,1), sq(2,100,10,-1), sq(3,144,20,1)]};
    const anim=L.loadAnimation({container:host,renderer:"svg",loop:true,
      autoplay:true,animationData:data});
    return ()=>{ try{ anim.destroy(); }catch(e){} host.innerHTML=""; };
  },

  /* gerçek Lenis: kendi kaydırma kabında yumuşatılmış kaydırma */
  lenis(host,S,ink,opts){
    const L=window.Lenis;
    const wrap=document.createElement("div");
    wrap.style.cssText="position:absolute;inset:0;overflow:hidden";
    const inner=document.createElement("div");
    inner.style.cssText=`padding:${S*.09}px ${S*.1}px;display:flex;flex-direction:column;gap:${S*.05}px`;
    for(let i=0;i<16;i++){
      const b=document.createElement("div");
      b.style.cssText=`flex:none;height:${S*.072}px;border-radius:2px;background:${ink};`+
        `opacity:${i%3?".2":".85"};width:${42+((i*37)%52)}%`;
      inner.appendChild(b);
    }
    wrap.appendChild(inner); host.appendChild(wrap);
    const lenis=new L({wrapper:wrap, content:inner, lerp:.075, wheelMultiplier:.7});
    const inter=!!(opts&&opts.interactive);
    let raf, target=0;
    (function tick(time){
      lenis.raf(time);
      if(!inter){
        const max=Math.max(1, inner.scrollHeight-wrap.clientHeight);
        if(Math.abs((lenis.scroll||0)-target)<6){
          target = target>max/2 ? 0 : max;
          lenis.scrollTo(target,{duration:3.4});
        }
      }
      raf=requestAnimationFrame(tick);
    })(0);
    return ()=>{ cancelAnimationFrame(raf); try{ lenis.destroy(); }catch(e){} wrap.remove(); };
  },

  /* gerçek Swiper: döngülü, otomatik oynayan, sürüklenebilir kaydırıcı */
  swiper(host,S,ink){
    const wrap=document.createElement("div");
    wrap.className="swiper";
    const w=document.createElement("div"); w.className="swiper-wrapper";
    for(let i=0;i<6;i++){
      const sl=document.createElement("div"); sl.className="swiper-slide";
      sl.style.cssText=`display:grid;place-items:center;padding:${S*.06}px 0`;
      const card=document.createElement("div");
      const filled=i%2===0;
      card.style.cssText=`width:100%;height:${S*.6}px;border:2px solid ${ink};border-radius:5px;`+
        `display:grid;place-items:center;font-family:monospace;font-size:${S*.14}px;`+
        `letter-spacing:.06em;background:${filled?ink:"transparent"};`+
        `color:${filled?"rgba(255,255,255,.9)":ink}`;
      card.textContent=String(i+1).padStart(2,"0");
      sl.appendChild(card); w.appendChild(sl);
    }
    wrap.appendChild(w); host.appendChild(wrap);
    const sw=new window.Swiper(wrap,{
      slidesPerView:1.5, spaceBetween:S*.06, centeredSlides:true, loop:true,
      speed:640, grabCursor:true, autoplay:{delay:1700,disableOnInteraction:false}});
    return ()=>{ try{ sw.destroy(true,true); }catch(e){} wrap.remove(); };
  },

  /* gerçek MapLibre GL JS: vektör karolar sayfa içinde üretilip GPU'da boyanıyor.
     Dış istek yok — CSP zaten karo sunucusuna izin vermezdi. */
  maplibre(host,S,ink,opts){
    const ML=window.maplibregl;
    const inter=!!(opts&&opts.interactive);
    const c0=[29.02,41.03], R=0.055, n=9, feats=[];
    feats.push({type:"Feature",properties:{k:"water"},geometry:{type:"Polygon",coordinates:[[
      [c0[0]-R*2.4,c0[1]-R*1.02],[c0[0]+R*2.4,c0[1]-R*1.34],
      [c0[0]+R*2.4,c0[1]-R*2.4],[c0[0]-R*2.4,c0[1]-R*2.4],[c0[0]-R*2.4,c0[1]-R*1.02]]]}});
    for(let i=0;i<=n;i++){
      const t=(i/n-.5)*2*R;
      feats.push({type:"Feature",properties:{k:"road",major:i%3===0?1:0},
        geometry:{type:"LineString",coordinates:[[c0[0]-R,c0[1]+t],[c0[0]+R,c0[1]+t]]}});
      feats.push({type:"Feature",properties:{k:"road",major:i%4===0?1:0},
        geometry:{type:"LineString",coordinates:[[c0[0]+t,c0[1]-R],[c0[0]+t,c0[1]+R]]}});
    }
    for(let i=0;i<n;i++)for(let j=0;j<n;j++){
      if(((i*7+j*13)%11)<3) continue;
      const x0=c0[0]+(i/n-.5)*2*R+R*.035, y0=c0[1]+(j/n-.5)*2*R+R*.035;
      const w=2*R/n-R*.07, h=2*R/n-R*.07;
      feats.push({type:"Feature",properties:{k:"block"},geometry:{type:"Polygon",
        coordinates:[[[x0,y0],[x0+w,y0],[x0+w,y0+h],[x0,y0+h],[x0,y0]]]}});
    }
    const map=new ML.Map({
      container:host, attributionControl:false, interactive:inter,
      center:c0, zoom:12.3, bearing:-14, pitch:0, fadeDuration:0,
      style:{ version:8, sources:{city:{type:"geojson",data:{type:"FeatureCollection",features:feats}}},
        layers:[
          {id:"bg",type:"background",paint:{"background-color":"rgba(0,0,0,0)"}},
          {id:"water",type:"fill",source:"city",filter:["==",["get","k"],"water"],
            paint:{"fill-color":ink,"fill-opacity":.17}},
          {id:"block",type:"fill",source:"city",filter:["==",["get","k"],"block"],
            paint:{"fill-color":ink,"fill-opacity":.1}},
          {id:"blockline",type:"line",source:"city",filter:["==",["get","k"],"block"],
            paint:{"line-color":ink,"line-width":.7,"line-opacity":.45}},
          {id:"road",type:"line",source:"city",filter:["==",["get","k"],"road"],
            paint:{"line-color":ink,"line-opacity":.8,
              "line-width":["interpolate",["linear"],["zoom"],
                11,["case",["==",["get","major"],1],1.4,.5],
                16,["case",["==",["get","major"],1],7,2.4]]}}
        ]}
    });
    let raf, b=-14, ok=false;
    map.on("load",()=>{
      ok=true;
      if(inter) return;
      (function spin(){ b+=.055; try{ map.setBearing(b); }catch(e){ return; }
        raf=requestAnimationFrame(spin); })();
    });
    /* MapLibre çizim işçisini blob URL'inden kuruyor. Ortamın güvenlik
       ilkesi buna izin vermezse harita hiç yüklenmez; o durumda yuvayı
       boşaltıp kartın prosedürel çizimine geri dönüyoruz. */
    const guard=setTimeout(()=>{
      if(ok) return;
      try{ map.remove(); }catch(e){}
      host.innerHTML="";
      if(host.parentElement) host.parentElement.removeAttribute("data-live");
    },5000);
    return ()=>{ clearTimeout(guard); cancelAnimationFrame(raf);
                 try{ map.remove(); }catch(e){} host.innerHTML=""; };
  }
};

/* Aynı anda kaç kart canlı olsun? WebGL bağlamı ve model eğitimi pahalı
   olduğundan o türden yalnızca bir tane bağlanır. Kartlar okunur ölçeğe
   geldiğinde (yakın kademe) ekranın merkezine en yakın demolar açılır. */
const MAX_LIVE = 5;
const HEAVY = new Set(["three","pixi","tfjs","maplibre"]);

function liveWanted(){
  if(view.k < 0.62) return wingIdx>=0 ? [wingIdx] : [];
  const cand=[];
  for(const c of cards){
    if(!c.hasDemo || c.el.hasAttribute("data-off")) continue;
    const i=c.l.i;
    const x=LAY[i*2]*view.k+view.tx, y=LAY[i*2+1]*view.k+view.ty;
    if(x<-80||x>VW+80||y<-80||y>VH+80) continue;
    cand.push({i, key:DEMO_OF[c.l.name], sel:(i===sel?0:1),
               d:(x-VW/2)*(x-VW/2)+(y-VH/2)*(y-VH/2)});
  }
  cand.sort((a,b)=> a.sel-b.sel || a.d-b.d);
  const out=[]; let heavy=0;
  if(wingIdx>=0){ out.push(wingIdx); if(HEAVY.has(DEMO_OF[cards[wingIdx].l.name])) heavy++; }
  for(const o of cand){
    if(out.includes(o.i)) continue;
    if(out.length>=MAX_LIVE) break;
    if(HEAVY.has(o.key)){ if(heavy>=1) continue; heavy++; }
    out.push(o.i);
  }
  return out;
}

/* Kanat açıksa demo kartın küçük plakasına değil, kanadın plakasına bağlanır. */
function liveHost(c){  return (c.l.i===wingIdx) ? c.wingLive  : c.live;  }
function livePlate(c){ return (c.l.i===wingIdx) ? c.wingPlate : c.plate; }

function unmountOne(i){
  const rec=liveMap.get(i); if(!rec) return;
  liveMap.delete(i);
  if(rec.stop){ try{ rec.stop(); }catch(e){} }
  const c=cards[i];
  c.plate.removeAttribute("data-live");
  c.live.innerHTML="";
  if(c.wingPlate){ c.wingPlate.removeAttribute("data-live"); c.wingLive.innerHTML=""; }
  c.res=0;                       /* glyph tuvali yeniden boyutlansın */
}

/* Ses gerektiren demolar önce bir düğme gösterir; glyph arkada dönmeye devam eder. */
function mountGate(c,key,S,i,token,host,plate){
  const gate=document.createElement("button");
  gate.className="gate"; gate.type="button";
  gate.textContent="\u25B6 "+GESTURE[key];
  host.appendChild(gate);
  gate.addEventListener("click", async ev=>{
    ev.stopPropagation();
    gate.disabled=true; gate.textContent="başlıyor…";
    let stop=null;
    try{ stop=await DEMOS[key](host,S,INK,{interactive: i===wingIdx}); }
    catch(err){
      console.warn("ses başlatılamadı:",err);
      gate.disabled=false; gate.textContent="\u25B6 tekrar dene"; return;
    }
    const rec=liveMap.get(i);
    if(!rec || rec.token!==token){ try{ stop(); }catch(e){} return; }
    rec.stop=stop; gate.remove(); plate.setAttribute("data-live","");
  });
}

function mountOne(i){
  const c=cards[i], key=DEMO_OF[c.l.name], token=++liveToken;
  liveMap.set(i,{key, stop:null, token});
  loadLib(key).then(()=>{
    const rec=liveMap.get(i);
    if(!rec || rec.token!==token) return;
    const host=liveHost(c), plate=livePlate(c);
    const S=host.offsetWidth || 267;
    if(GESTURE[key]){ mountGate(c,key,S,i,token,host,plate); return; }
    try{
      rec.stop=DEMOS[key](host,S,INK,{interactive: i===wingIdx});
      plate.setAttribute("data-live","");
    }catch(err){
      console.warn("demo başlatılamadı:",key,err);
      host.innerHTML="";
    }
  }).catch(err=>console.warn(err.message));
}

function updateLive(){
  const want=new Set(liveWanted());
  for(const i of [...liveMap.keys()]) if(!want.has(i)) unmountOne(i);
  for(const i of want) if(!liveMap.has(i)) mountOne(i);
}
