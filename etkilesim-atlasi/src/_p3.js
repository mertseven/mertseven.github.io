
/* ------------------------------------------------------------------
   4. GLYPH'LER — her biri kendi kütüphanesinin işini taklit eder.
   İmza: (g, s, t, c, k)  g=ctx, s=kutu, t=saniye, c=renk, k=tohum 0..1
   Çizim (0,0)-(s,s) kutusunda kalır.
------------------------------------------------------------------ */
const TAU = Math.PI*2;
function dot(g,x,y,r){ g.beginPath(); g.arc(x,y,r,0,TAU); g.fill(); }
function ln(g,x1,y1,x2,y2){ g.beginPath(); g.moveTo(x1,y1); g.lineTo(x2,y2); g.stroke(); }
function noise(x){ return Math.sin(x*12.9898)*43758.5453 % 1; }

const G = {
  tiles(g,s,t,c,k){
    const n=3, u=s/n, off=(t*6+k*40)%u;
    g.globalAlpha=.9;
    for(let i=-1;i<n+1;i++)for(let j=0;j<n;j++){
      const x=i*u+off, y=j*u;
      if(x<-u||x>s) continue;
      g.globalAlpha = ((i+j+Math.floor(off/u))%3===0)?.85:.22;
      g.fillRect(Math.max(0,x)+.5, y+.5, Math.min(u,s-Math.max(0,x))-1, u-1);
    }
    g.globalAlpha=1;
  },
  vectiles(g,s,t,c,k){
    g.globalAlpha=.3;
    for(let i=1;i<4;i++){ ln(g,0,s*i/4,s,s*i/4-s*.12); }
    g.globalAlpha=1; g.lineWidth=s*.09;
    g.beginPath();
    for(let i=0;i<=10;i++){ const x=s*i/10, y=s*.72-Math.sin(i/10*3+t*.7+k*6)*s*.22-x*.12;
      i?g.lineTo(x,y):g.moveTo(x,y); }
    g.stroke();
  },
  hexbin(g,s,t,c,k){
    const r=s*.155, dx=r*1.73, dy=r*1.5;
    for(let row=0;row<3;row++)for(let col=0;col<3;col++){
      const cx=s*.2+col*dx+(row%2?dx/2:0), cy=s*.24+row*dy;
      if(cx>s-r*.4) continue;
      const h=(Math.sin(row*1.7+col*2.3+k*9)+1)/2;
      g.globalAlpha=.2+h*.8*(0.6+0.4*Math.sin(t*1.6+row+col));
      g.beginPath();
      for(let a=0;a<6;a++){const an=a*TAU/6+Math.PI/6; g[a?"lineTo":"moveTo"](cx+Math.cos(an)*r*.9,cy+Math.sin(an)*r*.9);}
      g.closePath(); g.fill();
    }
    g.globalAlpha=1;
  },
  globe(g,s,t,c){
    const cx=s/2, cy=s/2, r=s*.38;
    g.globalAlpha=.85; g.beginPath(); g.arc(cx,cy,r,0,TAU); g.stroke();
    g.globalAlpha=.4;
    for(let i=1;i<3;i++){ const yy=cy+(i-1.5)*r*.9;
      g.beginPath(); g.ellipse(cx,yy,Math.sqrt(Math.max(0,r*r-(yy-cy)*(yy-cy))),r*.16,0,0,TAU); g.stroke(); }
    for(let m=0;m<3;m++){
      const ph=(t*.35+m/3)%1, w=Math.cos(ph*TAU)*r;
      g.beginPath(); g.ellipse(cx,cy,Math.abs(w),r,0,0,TAU); g.stroke();
    }
    g.globalAlpha=1;
  },
  topology(g,s,t,c,k){
    const cx=s/2,cy=s/2, pts=[];
    for(let i=0;i<6;i++){ const a=i/6*TAU+k*3, rr=s*(.2+.09*Math.sin(i*2.1+k*7));
      pts.push([cx+Math.cos(a)*rr, cy+Math.sin(a)*rr]); }
    g.globalAlpha=.85; g.beginPath();
    pts.forEach((p,i)=>i?g.lineTo(p[0],p[1]):g.moveTo(p[0],p[1])); g.closePath(); g.stroke();
    const grow=(Math.sin(t*1.3)+1)/2*s*.1+s*.05;
    g.globalAlpha=.3; g.setLineDash([s*.06,s*.06]); g.beginPath();
    pts.forEach((p,i)=>{ const a=Math.atan2(p[1]-cy,p[0]-cx), x=p[0]+Math.cos(a)*grow, y=p[1]+Math.sin(a)*grow;
      i?g.lineTo(x,y):g.moveTo(x,y); });
    g.closePath(); g.stroke(); g.setLineDash([]);
    g.globalAlpha=1; pts.forEach(p=>dot(g,p[0],p[1],s*.035));
  },
  projection(g,s,t,c){
    const cx=s/2,cy=s/2,r=s*.38, m=(Math.sin(t*.6)+1)/2;
    g.globalAlpha=.75;
    for(let i=-2;i<=2;i++){
      g.beginPath();
      for(let j=0;j<=12;j++){ const v=(j/12-.5)*Math.PI;
        const x=cx+ (i/2.4)*r*(1-m*.35*Math.cos(v)*0), y=cy+Math.sin(v)*r;
        const xx = cx + (i/2.4)*r*(m + (1-m)*Math.cos(v));
        j?g.lineTo(xx,y):g.moveTo(xx,y); }
      g.stroke();
    }
    for(let i=-1;i<=1;i++){ const y=cy+i*r*.55, w=r*Math.sqrt(Math.max(0,1-(i*.55)**2));
      ln(g,cx-w,y,cx+w,y); }
    g.globalAlpha=1;
  },
  nodes(g,s,t,c,k){
    const N=6, P=[];
    for(let i=0;i<N;i++){ const a=i/N*TAU+k*5, r=s*(.19+.13*Math.sin(t*.9+i*1.3+k*8));
      P.push([s/2+Math.cos(a)*r, s/2+Math.sin(a)*r]); }
    g.globalAlpha=.35;
    for(let i=0;i<N;i++) ln(g,P[i][0],P[i][1],P[(i+2)%N][0],P[(i+2)%N][1]);
    g.globalAlpha=1;
    P.forEach((p,i)=>dot(g,p[0],p[1],s*(i%3?.045:.065)));
  },
  scatter(g,s,t,c,k){
    g.globalAlpha=.3; ln(g,s*.16,s*.84,s*.88,s*.84); ln(g,s*.16,s*.12,s*.16,s*.84);
    g.globalAlpha=.9;
    for(let i=0;i<11;i++){
      const x=s*.22+ i/10*s*.6;
      const y=s*.78 - (i/10*.5 + .22*Math.abs(Math.sin(i*2.3+k*9)))*s*.72;
      dot(g,x, y+Math.sin(t*1.2+i)*s*.012, s*.042);
    }
    g.globalAlpha=1;
  },
  grammar(g,s,t,c){
    g.globalAlpha=.45;
    for(let i=0;i<3;i++){ g.fillRect(s*.14,s*(.2+i*.12),s*(.2-i*.04),s*.045); }
    g.globalAlpha=.35; ln(g,s*.4,s*.5,s*.56,s*.5);
    g.beginPath(); g.moveTo(s*.52,s*.46); g.lineTo(s*.57,s*.5); g.lineTo(s*.52,s*.54); g.stroke();
    g.globalAlpha=1;
    const p=(Math.sin(t*1.1)+1)/2;
    for(let i=0;i<3;i++) g.fillRect(s*(.64+i*.1), s*.72-p*s*(.14+i*.11), s*.06, p*s*(.14+i*.11)+s*.02);
  },
  bars(g,s,t,c,k){
    for(let i=0;i<4;i++){
      const h=(.28+.62*Math.abs(Math.sin(t*.9+i*.8+k*7)))*s*.62;
      g.globalAlpha=i%2?.55:.95;
      g.fillRect(s*.17+i*s*.18, s*.82-h, s*.11, h);
    }
    g.globalAlpha=.3; ln(g,s*.12,s*.83,s*.88,s*.83); g.globalAlpha=1;
  },
  line(g,s,t,c,k){
    g.globalAlpha=.25; for(let i=1;i<3;i++) ln(g,s*.1,s*(.25+i*.22),s*.9,s*(.25+i*.22));
    g.globalAlpha=1; g.lineWidth=s*.055; g.beginPath();
    for(let i=0;i<=24;i++){ const x=s*.1+i/24*s*.8;
      const y=s*.5 - (Math.sin(i*.55-t*2.2+k*9)*.5+Math.sin(i*.21-t*1.1)*.5)*s*.2;
      i?g.lineTo(x,y):g.moveTo(x,y); }
    g.stroke();
  },
  table(g,s,t,c){
    const cols=4, rows=4, w=s*.78/cols, h=s*.66/rows, x0=s*.11, y0=s*.17;
    const hot=Math.floor(t*1.6)%rows;
    for(let r=0;r<rows;r++)for(let cix=0;cix<cols;cix++){
      g.globalAlpha = r===hot?.9:(r===0?.55:.2);
      g.fillRect(x0+cix*w+.5, y0+r*h+.5, w-1.5, h-1.5);
    }
    g.globalAlpha=1;
  },
  cube(g,s,t,c){
    const V=[[-1,-1,-1],[1,-1,-1],[1,1,-1],[-1,1,-1],[-1,-1,1],[1,-1,1],[1,1,1],[-1,1,1]];
    const E=[[0,1],[1,2],[2,3],[3,0],[4,5],[5,6],[6,7],[7,4],[0,4],[1,5],[2,6],[3,7]];
    const a=t*.6, b=.5, ca=Math.cos(a),sa=Math.sin(a),cb=Math.cos(b),sb=Math.sin(b);
    const p=V.map(v=>{ let x=v[0]*ca-v[2]*sa, z=v[0]*sa+v[2]*ca, y=v[1]*cb-z*sb; z=v[1]*sb+z*cb;
      const f=s*.30/(z*.32+2.1); return [s/2+x*f*2.1, s/2+y*f*2.1]; });
    g.globalAlpha=.85; g.lineWidth=Math.max(.7,s*.035);
    E.forEach(e=>ln(g,p[e[0]][0],p[e[0]][1],p[e[1]][0],p[e[1]][1]));
    g.globalAlpha=1; p.forEach(q=>dot(g,q[0],q[1],s*.026));
  },
  shader(g,s,t,c,k){
    const n=7, u=s*.76/n;
    for(let i=0;i<n;i++)for(let j=0;j<n;j++){
      const v=Math.sin(i*.9+t*1.4+k*6)*Math.cos(j*.9-t*1.1);
      g.globalAlpha=.12+.8*Math.abs(v);
      const r=u*.34*(.4+.6*Math.abs(v));
      dot(g,s*.12+u*(i+.5), s*.12+u*(j+.5), r);
    }
    g.globalAlpha=1;
  },
  vr(g,s,t,c){
    g.globalAlpha=.85; g.lineWidth=Math.max(.8,s*.04);
    g.beginPath(); g.roundRect ? g.roundRect(s*.1,s*.3,s*.8,s*.36,s*.1) : g.rect(s*.1,s*.3,s*.8,s*.36); g.stroke();
    const o=Math.sin(t*.9)*s*.03;
    g.globalAlpha=.55; dot(g,s*.32+o,s*.48,s*.075); dot(g,s*.68+o,s*.48,s*.075);
    g.globalAlpha=.3; ln(g,s*.5,s*.3,s*.5,s*.66);
    g.globalAlpha=1;
  },
  iso(g,s,t,c,k){
    const a=t*.7+k*6, cx=s/2, cy=s/2, r=s*.24;
    const layers=3;
    for(let i=layers-1;i>=0;i--){
      const ph=a+i*.5, off=(i-1)*s*.09;
      g.globalAlpha=.28+.24*i;
      g.beginPath(); g.ellipse(cx+Math.cos(ph)*s*.07, cy+off, r*(1-i*.13), r*(1-i*.13)*.55, 0,0,TAU); g.fill();
    }
    g.globalAlpha=1; g.lineWidth=s*.06;
    g.beginPath(); g.ellipse(cx+Math.cos(a)*s*.07, cy-s*.09, r*.74, r*.41,0,0,TAU); g.stroke();
  },
  matrix(g,s,t,c,k){
    g.globalAlpha=.28; g.strokeRect(s*.13,s*.13,s*.74,s*.74);
    for(let i=0;i<3;i++)for(let j=0;j<3;j++){
      const v=Math.abs(Math.sin(i*2.1+j*1.4+Math.floor(t*2)*.7+k*8));
      g.globalAlpha=.2+v*.8;
      g.fillRect(s*(.18+j*.24), s*(.2+i*.24)+ (1-v)*s*.08, s*.14, s*.045+v*s*.07);
    }
    g.globalAlpha=1;
  },
  pointcloud(g,s,t,c,k){
    const N=44, a=t*.35;
    for(let i=0;i<N;i++){
      const u=i/N*TAU*3.7+k*9, h=(i/N-.5)*2;
      const rr=Math.sqrt(Math.max(0,1-h*h))*(.75+.25*Math.sin(i*3.1));
      let x=Math.cos(u)*rr, z=Math.sin(u)*rr;
      const xx=x*Math.cos(a)-z*Math.sin(a); z=x*Math.sin(a)+z*Math.cos(a);
      const f=s*.33/(z*.3+1.6);
      g.globalAlpha=.25+.7*(1-(z+1)/2);
      dot(g, s/2+xx*f*1.7, s/2+h*f*1.5, s*.022+ (1-(z+1)/2)*s*.016);
    }
    g.globalAlpha=1;
  },
  sketch(g,s,t,c,k){
    g.lineWidth=Math.max(.8,s*.045); g.globalAlpha=.9; g.beginPath();
    for(let i=0;i<=40;i++){
      const p=i/40, a=p*TAU*1.6+t*.5+k*9;
      const r=s*(.12+.22*Math.abs(Math.sin(p*4.1+k*7+t*.3)));
      const x=s/2+Math.cos(a)*r, y=s/2+Math.sin(a)*r*.9;
      i?g.lineTo(x,y):g.moveTo(x,y);
    }
    g.stroke(); g.globalAlpha=1;
  },
  bezier(g,s,t,c){
    const m=Math.sin(t*.8)*s*.13;
    const p0=[s*.16,s*.72], c1=[s*.32,s*.22+m], c2=[s*.66,s*.82-m], p1=[s*.84,s*.3];
    g.globalAlpha=.28; ln(g,p0[0],p0[1],c1[0],c1[1]); ln(g,p1[0],p1[1],c2[0],c2[1]);
    g.globalAlpha=1; g.lineWidth=Math.max(.9,s*.055);
    g.beginPath(); g.moveTo(p0[0],p0[1]); g.bezierCurveTo(c1[0],c1[1],c2[0],c2[1],p1[0],p1[1]); g.stroke();
    dot(g,p0[0],p0[1],s*.04); dot(g,p1[0],p1[1],s*.04);
    g.globalAlpha=.5; dot(g,c1[0],c1[1],s*.03); dot(g,c2[0],c2[1],s*.03); g.globalAlpha=1;
  },
  rough(g,s,t,c,k){
    g.lineWidth=Math.max(.8,s*.045); g.globalAlpha=.9;
    const R=[[.2,.24],[.8,.2],[.82,.78],[.18,.76]];
    for(let pass=0;pass<2;pass++){
      g.beginPath();
      for(let i=0;i<=4;i++){
        const a=R[i%4], b=R[(i+1)%4];
        for(let j=0;j<=3;j++){
          const p=j/3, jx=(noise(i*3+j+pass*7+k*11))*s*.035, jy=(noise(i*5+j*2+pass*3+k*13))*s*.035;
          const x=s*(a[0]+(b[0]-a[0])*p)+jx, y=s*(a[1]+(b[1]-a[1])*p)+jy;
          (i===0&&j===0)?g.moveTo(x,y):g.lineTo(x,y);
        }
      }
      g.globalAlpha=pass?.45:.9; g.stroke();
    }
    g.globalAlpha=1;
  },
  feedback(g,s,t,c,k){
    for(let i=6;i>=0;i--){
      const p=i/6, a=t*.8*(1+p*.6)+k*6;
      g.globalAlpha=.15+.75*(1-p);
      g.save(); g.translate(s/2,s/2); g.rotate(a);
      const w=s*.62*(1-p*.82)+s*.06;
      g.strokeRect(-w/2,-w/2,w,w); g.restore();
    }
    g.globalAlpha=1;
  },
  sprites(g,s,t,c,k){
    for(let i=0;i<7;i++){
      const ph=t*.9+i*.9+k*8;
      const x=s*.18+((Math.sin(ph)*.5+.5))*s*.62;
      const y=s*.2+((Math.cos(ph*.83+i)*.5+.5))*s*.58;
      g.globalAlpha=i%2?.9:.4;
      g.fillRect(x,y,s*.11,s*.11);
    }
    g.globalAlpha=1;
  },
  board(g,s,t,c,k){
    g.globalAlpha=.75; g.lineWidth=Math.max(.8,s*.04);
    g.strokeRect(s*.14,s*.2,s*.3,s*.24);
    g.beginPath(); g.arc(s*.68,s*.34,s*.13,0,TAU); g.stroke();
    g.globalAlpha=.35; ln(g,s*.2,s*.66,s*.8,s*.66);
    const cx=s*(.3+.4*(Math.sin(t*.9+k*7)*.5+.5)), cy=s*(.55+.2*(Math.cos(t*1.2)*.5+.5));
    g.globalAlpha=1; g.beginPath();
    g.moveTo(cx,cy); g.lineTo(cx,cy+s*.16); g.lineTo(cx+s*.045,cy+s*.115); g.lineTo(cx+s*.11,cy+s*.15);
    g.closePath(); g.fill();
  },
  ease(g,s,t,c){
    g.globalAlpha=.3; g.strokeRect(s*.14,s*.16,s*.72,s*.68);
    g.globalAlpha=.85; g.lineWidth=Math.max(.9,s*.05); g.beginPath();
    for(let i=0;i<=24;i++){ const p=i/24, e=p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
      const x=s*.14+p*s*.72, y=s*.84-e*s*.68; i?g.lineTo(x,y):g.moveTo(x,y); }
    g.stroke();
    const p=(t*.5)%1, e=p<.5?4*p*p*p:1-Math.pow(-2*p+2,3)/2;
    g.globalAlpha=1; dot(g,s*.14+p*s*.72, s*.84-e*s*.68, s*.07);
  },
  keyframes(g,s,t,c){
    g.globalAlpha=.28;
    for(let r=0;r<3;r++) ln(g,s*.12,s*(.3+r*.2),s*.88,s*(.3+r*.2));
    g.globalAlpha=.95;
    const KF=[[0,.14],[0,.55],[0,.88],[1,.3],[1,.72],[2,.2],[2,.6],[2,.92]];
    KF.forEach(kf=>{ const x=s*(.12+kf[1]*.76), y=s*(.3+kf[0]*.2);
      g.save(); g.translate(x,y); g.rotate(Math.PI/4); g.fillRect(-s*.032,-s*.032,s*.064,s*.064); g.restore(); });
    const px=s*.12+((t*.28)%1)*s*.76;
    g.globalAlpha=.6; ln(g,px,s*.16,px,s*.84); g.globalAlpha=1;
  },
  scroll(g,s,t,c,k){
    g.globalAlpha=.32; g.strokeRect(s*.2,s*.14,s*.52,s*.72);
    g.globalAlpha=.9;
    const off=(t*14+k*40)%(s*.22);
    for(let i=-1;i<5;i++){ const y=s*.2+i*s*.22-off;
      if(y<s*.16||y>s*.8) continue;
      g.fillRect(s*.26,y,s*(i%2?.28:.4),s*.055); }
    g.globalAlpha=.5;
    const bh=s*.2, by=s*.16+((t*.22)%1)*(s*.68-bh);
    g.fillRect(s*.76,by,s*.045,bh);
    g.globalAlpha=1;
  },
  wave(g,s,t,c,k){
    const n=15;
    for(let i=0;i<n;i++){
      const x=s*.12+i*(s*.76/n);
      const a=Math.abs(Math.sin(i*1.7+k*9))*.7+Math.abs(Math.sin(i*.6-t*1.6))*.3;
      const h=a*s*.62;
      g.globalAlpha=.35+a*.6;
      g.fillRect(x, s/2-h/2, s*.76/n*.62, h);
    }
    g.globalAlpha=.3; ln(g,s*.1,s/2,s*.9,s/2); g.globalAlpha=1;
  },
  synth(g,s,t,c,k){
    g.globalAlpha=.9; g.lineWidth=Math.max(.9,s*.05); g.beginPath();
    for(let i=0;i<=28;i++){ const p=i/28, x=s*.1+p*s*.8;
      const y=s*.34 - Math.sin(p*TAU*2-t*3+k*6)*s*.16*(1-p*.3);
      i?g.lineTo(x,y):g.moveTo(x,y); }
    g.stroke();
    const step=Math.floor(t*4)%8;
    for(let i=0;i<8;i++){
      g.globalAlpha=i===step?1:(Math.sin(i*2.3+k*7)>0?.45:.16);
      g.fillRect(s*.1+i*s*.1, s*.68, s*.07, s*.14);
    }
    g.globalAlpha=1;
  },
  speaker(g,s,t,c){
    g.fillRect(s*.16,s*.4,s*.14,s*.2);
    g.beginPath(); g.moveTo(s*.3,s*.5); g.lineTo(s*.46,s*.28); g.lineTo(s*.46,s*.72); g.closePath(); g.fill();
    g.lineWidth=Math.max(.9,s*.05);
    for(let i=0;i<3;i++){
      const ph=(t*1.1+i/3)%1;
      g.globalAlpha=(1-ph)*.85;
      g.beginPath(); g.arc(s*.46,s*.5,s*(.1+ph*.34),-.9,.9); g.stroke();
    }
    g.globalAlpha=1;
  },
  spectrum(g,s,t,c,k){
    const n=9;
    for(let i=0;i<n;i++){
      const f=Math.exp(-i*.28);
      const h=(f*.75+.25*Math.abs(Math.sin(t*3+i*1.1+k*8)))*s*.7;
      g.globalAlpha=.35+.6*f;
      g.fillRect(s*.11+i*(s*.78/n), s*.84-h, s*.78/n*.6, h);
    }
    g.globalAlpha=1;
  },
  bodies(g,s,t,c,k){
    g.globalAlpha=.35; ln(g,s*.1,s*.85,s*.9,s*.85); g.globalAlpha=.9;
    const w=s*.19;
    for(let i=0;i<4;i++){
      const ph=(t*.55+i*.28+k*3)%1.6;
      const rest = s*.85-w-(i%2)*w;
      let y = ph<1 ? s*.06 + ph*ph*(rest-s*.06)/1 : rest;
      const rot=(1-Math.min(1,ph))*(i%2?.5:-.5);
      g.save(); g.translate(s*(.22+i*.19), y+w/2); g.rotate(rot);
      g.fillRect(-w/2,-w/2,w*.92,w*.92); g.restore();
    }
    g.globalAlpha=1;
  },
  net(g,s,t,c,k){
    const L=[3,4,2], xs=[.18,.5,.82];
    const P=L.map((n,li)=>Array.from({length:n},(_,i)=>[s*xs[li], s*(.5+(i-(n-1)/2)*.19)]));
    g.globalAlpha=.22;
    for(let li=0;li<2;li++) P[li].forEach(a=>P[li+1].forEach(b=>ln(g,a[0],a[1],b[0],b[1])));
    const pulse=(t*.7)%1;
    g.globalAlpha=1;
    P.forEach((layer,li)=>layer.forEach((p,i)=>{
      const on=Math.abs(pulse-(li/2.4)) < .12;
      g.globalAlpha=on?1:.42; dot(g,p[0],p[1], s*(on?.055:.04));
    }));
    g.globalAlpha=1;
  },
  landmarks(g,s,t,c,k){
    const base=[[.5,.86],[.34,.62],[.44,.58],[.56,.57],[.68,.62]];
    g.lineWidth=Math.max(.7,s*.035);
    for(let f=1;f<5;f++){
      const sp=Math.sin(t*1.3+f*.7+k*6)*.5+.5;
      const tipx=base[f][0]+(base[f][0]-.5)*sp*.5, tipy=base[f][1]-(.24+sp*.16);
      g.globalAlpha=.4; ln(g,s*base[0][0],s*base[0][1],s*base[f][0],s*base[f][1]);
      ln(g,s*base[f][0],s*base[f][1],s*tipx,s*tipy);
      g.globalAlpha=1; dot(g,s*base[f][0],s*base[f][1],s*.03); dot(g,s*tipx,s*tipy,s*.038);
    }
    dot(g,s*base[0][0],s*base[0][1],s*.05);
  },
  slides(g,s,t,c){
    const i=Math.floor(t*.7)%3;
    g.globalAlpha=.25;
    g.strokeRect(s*.12,s*.24,s*.5,s*.4); g.strokeRect(s*.2,s*.3,s*.5,s*.4);
    g.globalAlpha=1; g.strokeRect(s*.28,s*.36,s*.5,s*.4);
    g.globalAlpha=.85;
    g.fillRect(s*.34,s*.44,s*(.2+i*.09),s*.05);
    g.globalAlpha=.4; g.fillRect(s*.34,s*.54,s*.32,s*.035); g.fillRect(s*.34,s*.6,s*.24,s*.035);
    g.globalAlpha=1;
  },
  carousel(g,s,t,c){
    const off=((t*.5)%1);
    for(let i=-1;i<3;i++){
      const x=s*.14+(i-off)*s*.34;
      if(x<-s*.3||x>s*.95) continue;
      const cen=1-Math.min(1,Math.abs((x+s*.14)-s*.5)/(s*.45));
      g.globalAlpha=.22+cen*.72;
      g.fillRect(x,s*.28,s*.28,s*.44);
    }
    g.globalAlpha=.55;
    for(let d=0;d<3;d++) dot(g,s*(.38+d*.12),s*.83,s*.026);
    g.globalAlpha=1;
  },
  timeline(g,s,t,c,k){
    g.globalAlpha=.35; ln(g,s*.1,s*.5,s*.9,s*.5); g.globalAlpha=1;
    const E=[.16,.3,.44,.62,.84];
    E.forEach((e,i)=>{
      const up=i%2===0, y=s*.5+(up?-1:1)*s*(.12+.06*(i%3));
      g.globalAlpha=.35; ln(g,s*e,s*.5,s*e,y);
      const hot=Math.floor(t*.9)%E.length===i;
      g.globalAlpha=hot?1:.55; dot(g,s*e,s*.5,s*(hot?.05:.032));
      g.globalAlpha=hot?.9:.3; g.fillRect(s*e-s*.06,y-(up?s*.05:0),s*.12,s*.045);
    });
    g.globalAlpha=1;
  },
  markdown(g,s,t,c){
    g.globalAlpha=.85; g.fillRect(s*.14,s*.2,s*.4,s*.055);
    g.globalAlpha=.3;
    g.fillRect(s*.14,s*.32,s*.72,s*.035); g.fillRect(s*.14,s*.39,s*.6,s*.035);
    g.globalAlpha=.9; g.strokeRect(s*.14,s*.5,s*.72,s*.3);
    const p=(Math.sin(t*.9)*.5+.5);
    g.globalAlpha=.35; ln(g,s*.22,s*.72,s*.78,s*.72);
    g.globalAlpha=1; dot(g,s*.22+p*s*.56,s*.72,s*.05);
    g.globalAlpha=.6; g.fillRect(s*.22,s*.56,s*(.1+p*.4),s*.05); g.globalAlpha=1;
  },
  player(g,s,t,c){
    g.globalAlpha=.28; g.strokeRect(s*.12,s*.2,s*.76,s*.44); g.globalAlpha=1;
    g.beginPath(); g.moveTo(s*.42,s*.31); g.lineTo(s*.62,s*.42); g.lineTo(s*.42,s*.53); g.closePath(); g.fill();
    g.globalAlpha=.25; g.fillRect(s*.12,s*.74,s*.76,s*.045);
    g.globalAlpha=1; g.fillRect(s*.12,s*.74,s*.76*((t*.3)%1),s*.045);
  },
  /* Oyun & Fizik */
  gamepad(g,s,t,c,k){
    g.lineWidth=Math.max(.9,s*.045);
    g.globalAlpha=.85;
    g.beginPath();
    if(g.roundRect) g.roundRect(s*.1,s*.32,s*.8,s*.36,s*.12); else g.rect(s*.1,s*.32,s*.8,s*.36);
    g.stroke();
    /* yön tuşu */
    g.globalAlpha=.9;
    g.fillRect(s*.24,s*.46,s*.14,s*.055);
    g.fillRect(s*.295,s*.405,s*.055,s*.14);
    /* düğmeler, sırayla yanar */
    const step=Math.floor(t*4)%4;
    [[.66,.44],[.78,.5],[.66,.56],[.54,.5]].forEach((p,i)=>{
      g.globalAlpha = i===step ? 1 : .3;
      dot(g,s*p[0],s*p[1],s*.045);
    });
    g.globalAlpha=1;
  },

  /* Araç Kutusu — denetim paneli */
  panel(g,s,t,c,k){
    g.globalAlpha=.3; g.lineWidth=1.2;
    g.strokeRect(s*.12,s*.16,s*.76,s*.68);
    for(let i=0;i<4;i++){
      const y=s*(.27+i*.16);
      g.globalAlpha=.25; g.lineWidth=Math.max(1,s*.02);
      ln(g,s*.2,y,s*.8,y);
      const ph=(Math.sin(t*1.1+i*1.4+k*7)*.5+.5);
      g.globalAlpha=1;
      dot(g,s*(.2+ph*.6),y,s*.042);
    }
    g.globalAlpha=1;
  },

  /* Araç Kutusu — üçgenleme */
  triangles(g,s,t,c,k){
    const P=[];
    for(let i=0;i<7;i++){
      const a=i/7*TAU+k*6;
      const r=s*(.16+.16*Math.sin(i*2.3+t*.7+k*9));
      P.push([s/2+Math.cos(a)*r*1.5, s/2+Math.sin(a)*r*1.5]);
    }
    P.push([s/2,s/2]);
    g.lineWidth=Math.max(.7,s*.028); g.globalAlpha=.55;
    for(let i=0;i<P.length;i++)for(let j=i+1;j<P.length;j++){
      const d=Math.hypot(P[i][0]-P[j][0],P[i][1]-P[j][1]);
      if(d < s*.46) ln(g,P[i][0],P[i][1],P[j][0],P[j][1]);
    }
    g.globalAlpha=1;
    P.forEach(p=>dot(g,p[0],p[1],s*.028));
  },

  /* Araç Kutusu — renk */
  swatches(g,s,t,c,k){
    for(let i=0;i<5;i++)for(let j=0;j<2;j++){
      const idx=i+j*5;
      const a=.14+.17*((idx+Math.floor(t*1.4))%6);
      g.globalAlpha=a;
      g.fillRect(s*(.12+i*.155), s*(.3+j*.22), s*.13, s*.18);
    }
    g.globalAlpha=.5; g.lineWidth=1.2;
    g.strokeRect(s*.12,s*.3,s*.765,s*.4);
    g.globalAlpha=1;
  },

  drag(g,s,t,c,k){
    const x=s*(.28+.24*Math.sin(t*.85+k*6)), y=s*(.3+.16*Math.cos(t*.7+k*4));
    g.globalAlpha=.25; g.setLineDash([s*.05,s*.05]); g.strokeRect(s*.2,s*.24,s*.42,s*.42); g.setLineDash([]);
    g.globalAlpha=.9; g.fillRect(x,y,s*.34,s*.34);
    g.globalAlpha=1;
    [[x,y],[x+s*.34,y],[x,y+s*.34],[x+s*.34,y+s*.34]].forEach(p=>dot(g,p[0],p[1],s*.038));
  }
};

function drawGlyph(g, id, x, y, s, t, color, seed){
  const fn = G[id]; if(!fn) return;
  g.save();
  g.translate(x - s/2, y - s/2);
  g.fillStyle = color; g.strokeStyle = color;
  g.lineWidth = Math.max(.6, s*.05);
  g.lineJoin = "round"; g.lineCap = "round";
  try { fn(g, s, t, color, seed); } catch(e){}
  g.restore();
}
