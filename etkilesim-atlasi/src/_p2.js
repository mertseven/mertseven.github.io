<script>
"use strict";
/* Bütün atlas tek bir kapalı kapsamda çalışır. cdnjs'ten yüklenen UMD
   kütüphaneleri tepe seviyede kendi adlarını tanımlıyor; kapsamı açık
   bırakmak "Identifier 'N' has already been declared" gibi çakışmalara
   yol açıyordu. */
(function(){

/* ------------------------------------------------------------------
   1. GRUPLAR — "ne yapmak istiyorsun?" sorusuna göre bölünmüş
------------------------------------------------------------------ */
const CATS = {
  geo:      { label:"Kartografya & Mekân",  note:"Koordinatı piksele çevirenler: karo, projeksiyon, vektör karo, küre, mekânsal hesap." },
  viz:      { label:"Veri & Grafik",        note:"Sayıyı işarete bağlayanlar: ölçek, eksen, grafik, ağ, diyagram." },
  "3d":     { label:"3B & Sahne",           note:"Sahne, kamera, ışık, malzeme. GPU'ya üçgen gönderen katman." },
  game:     { label:"Oyun & Fizik",         note:"Oynanış döngüsü, çarpışma, katı cisim. Kural koyup dünyayı çalıştıranlar." },
  creative: { label:"Yaratıcı Kodlama",     note:"Serbest çizim yüzeyleri: eskiz, vektör, sprite, parçacık, geri besleme." },
  motion:   { label:"Hareket & Zaman",      note:"Zamanı bir değer üzerinde yorumlayanlar: easing, zaman çizelgesi, kaydırma." },
  audio:    { label:"Ses & Müzik",          note:"Web Audio üstünde sentez, çalma, dalga formu, çözümleme, MIDI." },
  sense:    { label:"Görü & Sensör",        note:"Kamerayı, mikrofonu ve jesti girdiye çevirenler; tarayıcıda çalışan modeller." },
  story:    { label:"Anlatı & Arayüz",      note:"Okuma sırasını, jesti, video ve sunumu yöneten anlatım katmanı." },
  tools:    { label:"Araç Kutusu",          note:"Tek başına bir şey çizmez ama hepsinin altında bunlar var: renk, geometri, veri, denetim." }
};
const CAT_KEYS = Object.keys(CATS);

/* ------------------------------------------------------------------
   2. KÜTÜPHANELER
   v = [dom, svg, canvas, webgl, 3b, zaman, ses, coğrafya,
        hesap, veri, bildirimsel, soyutlama, etkileşim]
------------------------------------------------------------------ */
const AXES = ["DOM","SVG","Canvas","WebGL","3B","Zaman","Ses","Coğrafya","Hesap","Veri","Bildirimsel","Soyutlama","Etkileşim"];

/* Eksenler düz bir liste değil, beş soru. Gruplamanın kendisi açıklamanın yarısı. */
const AXIS_FAM = [
  { t:"Neyin üstüne çiziyor?", n:"Bir kütüphanenin ilk kararı: sonucu HTML elemanı olarak mı, vektör olarak mı, piksel olarak mı, yoksa doğrudan ekran kartında mı üretecek. Bu dördü çoğunlukla birbirinin alternatifidir.", ax:["DOM","SVG","Canvas","WebGL"] },
  { t:"Hangi âlemde çalışıyor?", n:"İşin hangi boyutta geçtiği: derinlik var mı, zaman var mı, ses var mı, yeryüzü var mı.", ax:["3B","Zaman","Ses","Coğrafya"] },
  { t:"Ne kadarı hesap?", n:"Bazı kütüphaneler çizer, bazıları hesaplar. İkincilerin çıktısı görüntü değil sayıdır — çizmeyi başkasına bırakırlar.", ax:["Hesap","Veri"] },
  { t:"Nasıl yazılıyor?", n:"Aynı işi yapan iki kütüphaneyi çoğu zaman bu ikisi ayırır: ne istediğinizi mi söylüyorsunuz, nasıl yapılacağını mı; ve ham katmandan ne kadar uzaktasınız.", ax:["Bildirimsel","Soyutlama"] },
  { t:"Kullanıcıyı duyuyor mu?", n:"Girdiyi kütüphane mi yönetiyor, siz mi yazıyorsunuz.", ax:["Etkileşim"] }
];

const AXIS_INFO = {
  "DOM":{d:"Sonucu gerçek HTML elemanlarıyla kurar.", h:"Denetçide her parçayı görürsünüz, CSS ile biçimlendirirsiniz, ekran okuyucu okuyabilir.", l:"Çıktı belgede yaşamaz; tarayıcı araçlarıyla inceleyemezsiniz."},
  "SVG":{d:"Vektör şekiller belgede birer nesne olarak durur.", h:"Her şekil ayrı seçilebilir, ölçeklenince bozulmaz, yazdırmaya uygundur.", l:"Şekiller tek tek erişilebilir değildir."},
  "Canvas":{d:"Piksel boyar.", h:"Hızlıdır; ama sonuç tek bir resimdir — içindeki şekilleri kendiniz takip etmeniz gerekir.", l:"Piksel düzeyinde çalışmaz."},
  "WebGL":{d:"İşi ekran kartına yaptırır.", h:"Milyonlarca nokta akıcı çizilir; karşılığında shader'la düşünmek gerekir.", l:"GPU kullanmaz; büyük sahnelerde tıkanır."},
  "3B":{d:"Kamera, derinlik ve perspektif var mı.", h:"Sahne üç boyutlu; kamera konumu bir tasarım kararıdır.", l:"Düzlemde çalışır."},
  "Zaman":{d:"Zaman birinci sınıf bir kavram mı.", h:"Döngüsü, zaman çizelgesi ya da transport'u vardır; animasyon kütüphanenin işidir.", l:"Bir kez çizer, bırakır."},
  "Ses":{d:"İşin içinde ses var mı.", h:"Sentez, çalma, MIDI ya da çözümleme yapar.", l:"Sessizdir."},
  "Coğrafya":{d:"Yeryüzü koordinatlarını biliyor mu.", h:"Enlem-boylam, projeksiyon ve karo kavramları yerleşiktir.", l:"Koordinat sistemi sizindir."},
  "Hesap":{d:"Çizmek yerine hesaplamaya ne kadar ayrılmış.", h:"Çoğu zaman tek piksel çizmez; size sayı, geometri ya da yapı verir.", l:"Asıl işi görüntü üretmektir."},
  "Veri":{d:"Bir veri kümesini çıktıya bağlamak üzerine mi kurulu.", h:"Satırları verirsiniz, işaretleri o üretir.", l:"Veri kavramı yoktur; ne çizeceğinizi siz söylersiniz."},
  "Bildirimsel":{d:"Ne istediğinizi mi söylüyorsunuz, nasıl yapılacağını mı yazıyorsunuz.", h:"“Şu veriden çubuk grafik” dersiniz, adımları o bulur.", l:"“Buraya git, çizgi çek, boya” dersiniz — her adım sizin."},
  "Soyutlama":{d:"Ham katmandan ne kadar uzakta.", h:"Az kodla çok iş; ama kütüphanenin verdiğinin dışına çıkmak zor.", l:"Çok kod, tam denetim. Öğrenmesi zor, sınırı yok."},
  "Etkileşim":{d:"Kullanıcı girdisini kütüphane mi yönetiyor.", h:"Tıklama, sürükleme, jest ve hit-test kutudan çıkar.", l:"Girdiyi siz yazarsınız."}
};

const RAW = [
// ---- Kartografya & Mekân ---------------------------------------------------
["Leaflet","geo",2011,"BSD-2",42,42,"tiles","leafletjs.com","Kaydırılabilir haritanın asgari tarifi: karolar, katmanlar, işaretçiler. Otuz satırda çalışan harita.",[.9,.5,.3,0,0,.1,0,1,0,.3,.3,.8,.9]],
["MapLibre GL JS","geo",2021,"BSD-3",230,7,"vectiles","maplibre.org","Vektör karoları GPU'da anlık boyar; yazı tipi, eğim ve döndürme istemcide çözülür.",[.3,0,.2,1,.3,.3,0,1,0,.4,.6,.7,.9]],
["Mapbox GL JS","geo",2014,"Ticari",250,11,"vectiles","mapbox.com","Vektör karo yaklaşımını popülerleştiren motor; v2'den sonra kapalı lisans.",[.3,0,.2,1,.3,.3,0,1,0,.4,.6,.7,.9]],
["OpenLayers","geo",2006,"BSD-2",160,11,"tiles","openlayers.org","Projeksiyon, WMS, WFS, GeoTIFF — kurumsal CBS'nin tam takım tarayıcı karşılığı.",[.6,.3,.8,.4,0,.1,0,1,.1,.5,.2,.6,.9]],
["deck.gl","geo",2016,"MIT",250,12,"hexbin","deck.gl","Milyonlarca kaydı katman katman GPU'da toplar; harita ile veri görselleştirmenin tam ortasında durur.",[.1,0,.1,1,.5,.4,0,.9,.1,.9,.9,.6,.8]],
["CesiumJS","geo",2011,"Apache-2",800,13,"globe","cesium.com","Zaman eksenli, elipsoid doğrulukta 3B dünya; uydu ve uçuş verisi için tasarlandı.",[.2,0,.1,1,1,.5,0,1,.2,.5,.3,.6,.9]],
["Globe.gl","geo",2018,"MIT",90,2,"globe","globe.gl","Three.js üstünde bildirimsel bir küre — yaylar, halkalar, altıgenler tek çağrıyla.",[.1,0,.1,1,1,.4,0,.9,0,.7,.8,.9,.7]],
["Kepler.gl","geo",2018,"MIT",900,10,"hexbin","kepler.gl","deck.gl üstüne kurulu; kod yazmadan büyük konum verisi keşfi.",[.4,0,.1,1,.4,.5,0,.9,.2,1,.9,1,.9]],
["MapTalks","geo",2016,"BSD-3",300,1,"tiles","maptalks.org","2B ve 3B katmanları tek harita üzerinde birleştirir; eğim ve döndürme yerleşik.",[.5,.2,.6,.7,.5,.2,0,1,0,.4,.3,.7,.9]],
["PMTiles","geo",2021,"BSD-3",30,2,"tiles","protomaps.com","Bütün karo setini tek dosyada tutar; sunucu yerine HTTP menzil isteğiyle okunur.",[.2,0,.2,.5,0,0,0,1,.2,.6,.4,.6,.3]],
["Turf.js","geo",2013,"MIT",90,10,"topology","turfjs.org","Tek bir piksel çizmez: tampon, kesişim, merkez, kümeleme. Haritanın matematiği.",[0,0,0,0,0,0,0,1,.8,.9,.2,.5,0]],
["d3-geo","geo",2011,"ISC",30,1,"projection","d3js.org","Küreyi düzleme açan otuz kadar projeksiyon; sonuç saf SVG yolu olarak çıkar.",[0,.8,.3,0,.1,0,0,1,.3,.8,.2,.3,.1]],
["H3-js","geo",2018,"Apache-2",70,1,"hexbin","h3geo.org","Dünyayı hiyerarşik altıgenlere böler; konumu bir dizine çevirip toplamayı ucuzlatır.",[0,0,0,0,0,0,0,1,.7,.9,.2,.4,0]],
["proj4js","geo",2008,"MIT",45,1,"projection","proj4js.github.io","Koordinat sistemleri arasında dönüşüm; EPSG kodlarını tarayıcıya taşır.",[0,0,0,0,0,0,0,1,.8,.5,.1,.3,0]],
["geotiff.js","geo",2016,"MIT",180,1,"tiles","geotiffjs.github.io","Uydu ve yükselti rasterlarını tarayıcıda açar, dilimler, okur.",[0,0,.3,0,0,0,0,1,.7,.9,.2,.4,0]],
["Terra Draw","geo",2023,"MIT",70,1,"topology","terradraw.io","Harita üstünde çizim: nokta, çizgi, poligon, seçim — motordan bağımsız.",[.5,0,.3,.2,0,.2,0,1,.2,.4,.4,.7,1]],

// ---- Veri & Grafik ---------------------------------------------------------
["D3.js","viz",2011,"ISC",270,110,"nodes","d3js.org","Grafik değil, gramer: veriyi DOM'a bağlar, ölçekleri ve geçişleri verir, kalanı size bırakır.",[.8,1,.3,0,0,.5,0,.3,.2,1,.2,.2,.7]],
["Observable Plot","viz",2022,"ISC",150,5,"scatter","observablehq.com/plot","D3 ekibinin kısa yolu: bir satır işaret tanımı, eksenler ve ölçekler kendiliğinden.",[0,1,.1,0,0,.1,0,.2,0,1,1,.8,.3]],
["Vega-Lite","viz",2016,"BSD-3",330,5,"grammar","vega.github.io","Grafiği JSON olarak tarif edersiniz; derleyici işaretleri ve etkileşimi üretir.",[0,1,.2,0,0,.2,0,.2,0,1,1,.9,.4]],
["Vega","viz",2013,"BSD-3",600,11,"grammar","vega.github.io/vega","Vega-Lite'ın altındaki çalışma zamanı: veri akışı, sinyaller, gramerin tamamı.",[0,1,.3,0,0,.4,0,.3,.2,1,1,.6,.6]],
["ECharts","viz",2013,"Apache-2",1000,62,"bars","echarts.apache.org","Canvas üstünde çok geniş bir grafik kataloğu; büyük veri setlerinde akıcı kalır.",[0,.3,1,.3,.2,.5,0,.3,0,.9,.9,.8,.7]],
["Chart.js","viz",2013,"MIT",70,66,"bars","chartjs.org","Sekiz grafik türü, tek bir canvas, kısa bir yapılandırma nesnesi. En kısa yol.",[0,0,1,0,0,.3,0,0,0,.8,.8,.9,.5]],
["Plotly.js","viz",2015,"MIT",1100,17,"scatter","plotly.com/javascript","Bilimsel grafik takımı: kutu, ısı haritası, 3B yüzey, contour — hepsi kutudan çıkar.",[0,.7,.3,.4,.4,.3,0,.3,0,.9,.9,.8,.7]],
["Highcharts","viz",2009,"Ticari",200,12,"bars","highcharts.com","SVG tabanlı, erişilebilirlik ve dışa aktarma tarafı olgun ticari standart.",[0,1,.1,0,0,.3,0,.2,0,.8,.8,.9,.6]],
["Nivo","viz",2017,"MIT",300,13,"bars","nivo.rocks","D3 üstüne React bileşenleri; sunucuda da render edilebilen hazır grafikler.",[.2,.9,.2,0,0,.4,0,.1,0,.9,1,.9,.5]],
["visx","viz",2017,"MIT",60,20,"scatter","airbnb.io/visx","D3'ün matematiğini React bileşenlerine böler; grafik değil, grafik parçaları verir.",[.2,1,.1,0,0,.2,0,.1,0,.9,.6,.3,.4]],
["uPlot","viz",2020,"MIT",50,9,"line","github.com/leeoniya/uPlot","50 kB'de milyonlarca noktalı zaman serisi. Tek işe odaklanmanın performans karşılığı.",[0,0,1,0,0,.4,0,0,0,.9,.4,.6,.5]],
["Cytoscape.js","viz",2013,"MIT",400,10,"nodes","js.cytoscape.org","Biyoinformatikten gelen ağ görselleştirme: yerleşim algoritmaları, seçiciler, grafik kuramı.",[.2,0,.9,0,0,.4,0,0,.4,.8,.4,.7,.9]],
["Sigma.js","viz",2012,"MIT",120,11,"nodes","sigmajs.org","On binlerce düğümü WebGL'e taşır; graphology ile birlikte çalışır.",[.1,0,.2,.9,0,.4,0,0,.3,.8,.4,.7,.8]],
["force-graph","viz",2018,"MIT",120,2,"nodes","github.com/vasturiano/force-graph","Kuvvet yerleşimini 2B, 3B ve VR'da aynı API ile sunar.",[.1,0,.5,.6,.3,.7,0,0,.6,.8,.6,.8,.8]],
["d3-force","viz",2016,"ISC",20,1,"nodes","d3js.org","Parçacık simülasyonunu yerleşim aracına çevirir: itme, çekme, çarpışma, merkez.",[0,0,0,0,0,.9,0,0,.8,.8,.2,.4,.4]],
["Mermaid","viz",2014,"MIT",900,72,"grammar","mermaid.js.org","Metinle diyagram: akış şeması, sıra diyagramı, Gantt. Yazdığınız gibi çizilir.",[.3,1,0,0,0,.1,0,0,.3,.7,1,1,.2]],
["JointJS","viz",2013,"MPL-2",500,4,"nodes","jointjs.com","Bağlantılı diyagramlar ve şema editörleri için sahne grafiği.",[.4,.9,.1,0,0,.3,0,0,.3,.7,.4,.7,1]],
["Perspective","viz",2018,"Apache-2",900,9,"table","perspective.finos.org","WASM çekirdekli akış analitiği: milyon satırı tarayıcıda pivotlar.",[.4,0,.3,.4,0,.2,0,0,.2,1,.8,.8,.6]],

// ---- 3B & Sahne ------------------------------------------------------------
["Three.js","3d",2010,"MIT",600,106,"cube","threejs.org","Web'in fiili 3B katmanı: sahne grafiği, malzeme, gölge, yükleyiciler, geniş ekosistem.",[.1,0,.1,1,1,.6,.1,0,.2,.2,.2,.4,.6]],
["Babylon.js","3d",2013,"Apache-2",1500,24,"cube","babylonjs.com","Oyun motoru ölçeğinde: fizik, ses, düğüm editörü ve WebGPU aynı pakette.",[.1,0,.1,1,1,.7,.4,0,.6,.2,.3,.6,.8]],
["PlayCanvas","3d",2011,"MIT",900,10,"cube","playcanvas.com","Bileşen-varlık mimarisi ve bulut editörüyle tarayıcı içi 3B üretim.",[.1,0,.1,1,1,.7,.4,0,.6,.2,.4,.7,.8]],
["React Three Fiber","3d",2019,"MIT",60,29,"cube","r3f.docs.pmnd.rs","Three.js sahnesini JSX olarak yazdırır; sahne grafiği bileşen ağacına dönüşür.",[.2,0,0,1,1,.6,.1,0,.2,.3,1,.6,.6]],
["TresJS","3d",2022,"MIT",60,3,"cube","tresjs.org","Three.js sahnesini Vue bileşenleri olarak yazdırır.",[.2,0,0,1,1,.6,.1,0,.2,.3,1,.6,.6]],
["Threlte","3d",2021,"MIT",70,2,"cube","threlte.xyz","Three.js'in Svelte karşılığı; sahneyi bileşen olarak kurar.",[.2,0,0,1,1,.6,.1,0,.2,.3,1,.6,.6]],
["regl","3d",2016,"MIT",50,5,"shader","regl.party","WebGL'i durumsuz komutlara indirger — shader yazmak isteyip kazan kodu istemeyenler için.",[0,0,.1,1,.5,.4,0,0,.1,.3,.5,0,.1]],
["OGL","3d",2019,"MIT",30,3,"shader","github.com/oframe/ogl","Three.js'in küçük kardeşi: soyutlama ince, WebGL yüzeye çok yakın.",[0,0,.1,1,.9,.5,0,0,.1,.2,.2,.2,.4]],
["glslCanvas","3d",2015,"BSD-3",25,1,"shader","github.com/patriciogonzalezvivo/glslCanvas","Tek bir fragment shader'ı tuvale bağlar. Shader öğretmenin en kısa yolu.",[0,0,.1,1,.3,.9,0,0,.2,0,.6,.9,.2]],
["A-Frame","3d",2015,"MIT",800,17,"vr","aframe.io","3B sahneyi HTML etiketiyle yazarsınız; WebXR desteği varsayılan gelir.",[1,0,0,.9,1,.5,.2,0,.2,.2,1,.9,.9]],
["model-viewer","3d",2019,"Apache-2",300,7,"vr","modelviewer.dev","Tek bir web bileşeni: glTF modelini yükler, döndürür, AR'a taşır.",[1,0,0,.9,1,.4,0,0,0,.1,1,1,.8]],
["AR.js","3d",2017,"MIT",250,16,"vr","ar-js-org.github.io","İşaretçi ve konum tabanlı artırılmış gerçeklik; kamera akışını sahneye bağlar.",[.6,0,.2,.8,1,.5,0,.2,.5,.1,.8,.8,.9]],
["Zdog","3d",2019,"MIT",28,10,"iso","zzz.dog","Yuvarlak, düz gölgeli sözde-3B. Gerçek derinlik yok, ama karakter var.",[0,.3,.9,0,.8,.6,0,0,0,.1,.4,.7,.3]],
["Potree","3d",2015,"BSD-2",400,4,"pointcloud","potree.org","Milyarlarca LiDAR noktasını akışla getirip tarayıcıda gezdirir.",[0,0,.1,1,1,.2,0,.6,.1,.8,.3,.6,.8]],
["gsplat.js","3d",2023,"MIT",120,3,"pointcloud","github.com/huggingface/gsplat.js","Gauss saçılımı sahnelerini tarayıcıda oynatır — fotoğraftan hacme.",[0,0,.1,1,1,.3,0,.3,.3,.7,.4,.7,.8]],
["Troika Text","3d",2019,"MIT",80,2,"matrix","protectwise.github.io/troika","GPU'da işaretli uzaklık alanıyla keskin 3B yazı; sahnede binlerce karakter.",[0,0,.1,1,1,.3,0,0,.4,.2,.4,.5,.2]],

// ---- Oyun & Fizik ----------------------------------------------------------
["Phaser","game",2013,"MIT",1200,37,"gamepad","phaser.io","2B oyun çatısının standardı: sahne, sprite, girdi, çarpışma, ses, kamera — hepsi bir arada.",[.2,0,1,.8,.1,1,.6,0,.8,.1,.3,.8,1]],
["Kaplay","game",2021,"MIT",300,4,"gamepad","kaplayjs.com","Birkaç satırda oynanabilir bir şey çıkarmak için tasarlanmış; öğretimde çok rahat.",[.1,0,1,.5,0,1,.5,0,.7,.1,.5,1,1]],
["Excalibur.js","game",2014,"BSD-2",400,1,"gamepad","excaliburjs.com","TypeScript öncelikli oyun motoru; aktör, sahne ve çarpışma modeli açık.",[.1,0,1,.4,0,1,.4,0,.8,.1,.3,.7,1]],
["melonJS","game",2011,"MIT",300,6,"sprites","melonjs.org","Karo haritalı 2B oyunlar için hafif motor; Tiled editörüyle çalışır.",[.1,0,1,.3,0,1,.4,0,.7,.2,.3,.7,1]],
["Matter.js","game",2014,"MIT",90,17,"bodies","brm.io/matter-js","2B katı cisim fiziği: çarpışma, kısıtlar, sürtünme. Öğrenmesi en kolay motor.",[0,0,.4,0,0,1,0,0,1,0,.2,.6,.5]],
["Planck.js","game",2016,"MIT",180,4,"bodies","piqnt.com/planck.js","Box2D'nin bire bir JavaScript portu; oyun fiziğinin bilinen davranışı.",[0,0,.2,0,0,1,0,0,1,0,.2,.5,.3]],
["p2.js","game",2013,"MIT",150,2,"bodies","github.com/schteppe/p2.js","Saf JavaScript 2B fizik; yay, motor ve kısıt çeşitliliği geniş.",[0,0,.2,0,0,1,0,0,1,0,.2,.4,.3]],
["Box2D-wasm","game",2021,"MIT",500,1,"bodies","github.com/Birch-san/box2d-wasm","Box2D'nin WebAssembly derlemesi; masaüstü hızında 2B fizik.",[0,0,0,0,0,1,0,0,1,0,.1,.3,.2]],
["Rapier","game",2021,"Apache-2",700,4,"bodies","rapier.rs","Rust'tan WASM'a derlenmiş, deterministik ve hızlı 2B/3B fizik çözücüsü.",[0,0,0,0,.6,1,0,0,1,0,.2,.3,.2]],
["cannon-es","game",2020,"MIT",130,3,"bodies","pmndrs.github.io/cannon-es","Three.js sahnelerinin geleneksel fizik eşlikçisi; saf JavaScript 3B çözücü.",[0,0,0,0,1,1,0,0,1,0,.2,.4,.2]],
["Ammo.js","game",2013,"Zlib",1600,4,"bodies","github.com/kripken/ammo.js","Bullet fizik motorunun WebAssembly'ye derlenmiş hâli.",[0,0,0,0,1,1,0,0,1,0,.1,.2,.2]],
["Yuka","game",2018,"MIT",120,1,"net","mugen87.github.io/yuka","Oyun yapay zekâsı: yol bulma, sürü davranışı, durum makineleri.",[0,0,0,0,.6,1,0,0,1,.2,.2,.5,.2]],
["Colyseus","game",2017,"MIT",90,5,"drag","colyseus.io","Çok oyunculu durum eşitleme; oda, oyuncu ve senkron bir arada.",[0,0,0,0,.3,1,0,0,.7,.6,.4,.7,.9]],

// ---- Yaratıcı Kodlama ------------------------------------------------------
["p5.js","creative",2014,"LGPL-2.1",950,22,"sketch","p5js.org","Processing'in web'e taşınmışı: setup/draw döngüsü, öğretim ve sanat için tasarlandı.",[.3,.1,1,.3,.2,.7,.3,0,.2,.2,.2,.9,.9]],
["Paper.js","creative",2011,"MIT",300,14,"bezier","paperjs.org","Canvas üstünde gerçek bir vektör sahne grafiği: yol boole işlemleri, düğüm düzenleme.",[0,.3,1,0,0,.4,0,0,.1,.2,.3,.6,.7]],
["Two.js","creative",2012,"MIT",120,8,"bezier","two.js.org","Aynı çizimi SVG, Canvas veya WebGL'e verir; render hedefini soyutlar.",[0,.7,.7,.2,0,.5,0,0,0,.2,.4,.7,.4]],
["Rough.js","creative",2019,"MIT",9,20,"rough","roughjs.com","Her şeyi elle çizilmiş gibi gösterir. 9 kB'lik tek bir estetik karar.",[0,.8,.7,0,0,0,0,0,0,.2,.3,.8,0]],
["PixiJS","creative",2013,"MIT",400,45,"sprites","pixijs.com","2B WebGL render'ının hız rekortmeni; binlerce sprite'ı tek çizim çağrısına toplar.",[.1,0,.3,1,.1,.8,0,0,.1,.1,.3,.6,.8]],
["Konva","creative",2015,"MIT",150,12,"sprites","konvajs.org","Katmanlı canvas sahne grafiği; olay yakalama ve hit-test tarafı güçlü.",[.2,0,1,0,0,.4,0,0,0,.2,.4,.8,1]],
["Fabric.js","creative",2010,"MIT",300,30,"sprites","fabricjs.com","Canvas'a nesne modeli ve seçim kolları ekler; tasarım editörlerinin klasik temeli.",[.2,.3,1,0,0,.3,0,0,0,.2,.3,.8,1]],
["Hydra","creative",2018,"AGPL-3",300,3,"feedback","hydra.ojack.xyz","Canlı kodlanan video sentezi; analog geri besleme zincirlerinin shader karşılığı.",[0,0,.2,1,0,.9,.4,0,.1,0,.8,.8,.3]],
["Pts.js","creative",2017,"Apache-2",100,5,"sketch","ptsjs.org","Nokta, form ve uzayı birinci sınıf kavram yapan kompozisyon odaklı bir takım.",[0,.3,.9,.2,.2,.6,.1,0,.4,.3,.3,.5,.6]],
["canvas-sketch","creative",2018,"MIT",60,5,"sketch","github.com/mattdesl/canvas-sketch","Üretken çizim iskelesi: tohum, baskı çözünürlüğü, kare kare dışa aktarma.",[0,0,.9,.4,.2,.7,0,0,.2,.1,.3,.6,.2]],
["tsParticles","creative",2020,"MIT",180,7,"shader","particles.js.org","Parçacık alanları, bağlantılar, konfeti; yapılandırmayla sürülen hazır efektler.",[.2,0,1,.3,0,.9,0,0,.4,.1,.9,1,.7]],
["Blotter.js","creative",2016,"MIT",200,8,"feedback","blotter.vcni.co","Web yazısına GPU shader efektleri uygular; harfler akar, titrer, bozulur.",[.6,0,.2,1,0,.8,0,0,.1,0,.6,.8,.3]],
["glfx.js","creative",2011,"MIT",40,4,"feedback","evanw.github.io/glfx.js","Görüntüye WebGL efektleri: bulanıklık, doku, lens, renk eğrisi.",[0,0,.2,1,0,.4,0,0,.4,0,.6,.9,.4]],
["Snap.svg","creative",2013,"Apache-2",90,14,"bezier","snapsvg.io","SVG'yi jQuery rahatlığıyla kurcalar: yol, maske, animasyon.",[.5,1,0,0,0,.5,0,0,0,.2,.3,.7,.6]],
["SVG.js","creative",2012,"MIT",60,11,"bezier","svgjs.dev","Hafif SVG üretimi ve animasyonu; bağımlılıksız ve okunaklı.",[.5,1,0,0,0,.5,0,0,0,.2,.3,.7,.6]],
["Vivus","creative",2015,"MIT",12,15,"keyframes","maxwellito.github.io/vivus","SVG çizgilerini kendi kendini çiziyormuş gibi canlandırır.",[.3,1,0,0,0,.9,0,0,0,0,.6,1,.1]],
["tldraw","creative",2021,"Özel",700,40,"board","tldraw.com","Sonsuz tuval SDK'sı: çok imleçli, geri alınabilir, kendi şekillerinizi tanımlarsınız.",[1,.6,.2,0,0,.3,0,0,0,.3,.8,1,1]],
["Excalidraw","creative",2020,"MIT",800,90,"rough","excalidraw.com","Elle çizilmiş görünümlü beyaz tahta; kütüphane olarak da gömülebiliyor.",[1,.5,.3,0,0,.3,0,0,0,.3,.8,1,1]],
["React Flow","creative",2019,"MIT",120,25,"nodes","reactflow.dev","Düğüm-bağlantı editörleri için hazır zemin: sürükle, bağla, yakınlaş.",[1,.4,0,0,0,.3,0,0,.2,.6,.9,.9,1]],
["Rete.js","creative",2018,"MIT",90,10,"nodes","retejs.org","Görsel programlama editörü kurmak için düğüm motoru ve veri akışı.",[1,.3,0,0,0,.4,0,0,.5,.6,.6,.8,1]],
["LiteGraph.js","creative",2013,"MIT",200,7,"nodes","github.com/jagenjo/litegraph.js","Canvas üstünde düğüm grafiği; ComfyUI'ın da altındaki motor.",[.2,0,1,0,0,.5,0,0,.5,.5,.4,.7,1]],

// ---- Hareket & Zaman -------------------------------------------------------
["GSAP","motion",2008,"MIT",70,21,"ease","gsap.com","Ne olursa olsun animasyon eder: DOM, SVG, canvas nesnesi, düz JS değişkeni.",[.9,.5,.2,0,.1,1,0,0,0,.1,.3,.7,.5]],
["anime.js","motion",2016,"MIT",17,50,"ease","animejs.com","Küçük, okunaklı, kademeli gecikmelerde (stagger) çok rahat bir zamanlama motoru.",[.9,.5,.1,0,0,1,0,0,0,.1,.4,.8,.3]],
["Motion","motion",2018,"MIT",35,25,"ease","motion.dev","Bileşen girip çıkarken animasyonu kendi yönetir; yay fiziği varsayılan.",[1,.3,0,0,.1,1,0,0,.2,.1,1,.8,.7]],
["react-spring","motion",2018,"MIT",60,28,"ease","react-spring.dev","Animasyonu süreyle değil fizikle tarif eder: gerilim, sönüm, kütle.",[1,.3,0,.2,.2,1,0,0,.4,.1,1,.8,.6]],
["Velocity.js","motion",2014,"MIT",25,17,"ease","velocityjs.org","jQuery çağının hızlı animasyon motoru; hâlâ eski projelerde karşınıza çıkar.",[1,.3,0,0,0,1,0,0,0,0,.3,.7,.2]],
["Lottie-web","motion",2017,"MIT",250,30,"keyframes","airbnb.io/lottie","After Effects kompozisyonunu JSON olarak alıp web'de yeniden oynatır.",[.3,.9,.5,0,0,1,0,0,0,.1,.9,1,.2]],
["Rive","motion",2021,"MIT",180,2,"keyframes","rive.app","Durum makineli etkileşimli animasyon: tasarımcı davranışı da çizer.",[.2,.3,.5,.4,0,1,0,0,.3,.1,.9,1,.7]],
["Theatre.js","motion",2021,"Apache-2",250,11,"keyframes","theatrejs.com","Tarayıcıya gömülü animasyon editörü; sahneyi kodla değil zaman çizelgesiyle kurarsınız.",[.7,.3,.1,.4,.4,1,0,0,0,.2,.4,.7,.6]],
["Lenis","motion",2022,"MIT",7,9,"scroll","lenis.darkroom.engineering","Kaydırmayı yumuşatır ve tek bir zamana bağlar; scroll tabanlı sahnelerin metronomu.",[1,0,0,0,0,.9,0,0,0,0,.5,.9,1]],
["Locomotive Scroll","motion",2019,"MIT",25,6,"scroll","locomotivemtl.github.io","Yumuşak kaydırma ve paralaks; ajans işi sitelerin imzası.",[1,0,0,0,0,.8,0,0,0,0,.5,.9,1]],
["AutoAnimate","motion",2022,"MIT",6,13,"ease","auto-animate.formkit.com","Tek satır: listedeki her ekleme, silme ve sıralama kendiliğinden animasyonlanır.",[1,0,0,0,0,1,0,0,0,.2,.9,1,.4]],
["Splitting.js","motion",2018,"MIT",10,4,"keyframes","splitting.js.org","Metni harfe, kelimeye, satıra böler ve her parçaya kendi CSS değişkenini verir.",[1,0,0,0,0,.7,0,0,0,.1,.5,.8,.2]],
["Typed.js","motion",2013,"MIT",12,14,"markdown","mattboldt.com/typed.js","Daktilo etkisi: yazar, siler, yeniden yazar.",[1,0,0,0,0,.9,0,0,0,0,.6,1,.2]],
["Barba.js","motion",2014,"MIT",20,12,"slides","barba.js.org","Sayfalar arası geçişi animasyona çevirir; site tek bir akış gibi davranır.",[1,0,0,0,0,.9,0,0,0,.1,.5,.9,.8]],

// ---- Ses & Müzik -----------------------------------------------------------
["Tone.js","audio",2014,"MIT",250,14,"synth","tonejs.github.io","Web Audio üstüne müzikal zaman: transport, sekans, sentezleyici, efekt zinciri.",[0,0,0,0,0,1,1,0,.3,.1,.3,.6,.2]],
["Howler.js","audio",2013,"MIT",9,24,"speaker","howlerjs.com","Ses çalmanın sıkıcı kısmını halleder: sprite, havuz, mobil kilit açma.",[0,0,0,0,.2,.5,1,0,0,0,.4,.9,.2]],
["WaveSurfer.js","audio",2012,"BSD-3",80,9,"wave","wavesurfer.xyz","Dalga formunu çizer, bölge işaretler, spektrogram çıkarır — ses editörünün arayüzü.",[.3,.2,.9,.2,0,.6,1,0,.1,.4,.5,.8,.8]],
["Peaks.js","audio",2015,"LGPL-3",90,3,"wave","github.com/bbc/peaks.js","BBC'nin uzun kayıtlar için ürettiği dalga formu gezgini.",[.3,.2,.9,0,0,.5,1,0,.1,.4,.4,.8,.8]],
["Strudel","audio",2022,"AGPL-3",400,1,"synth","strudel.cc","TidalCycles'ın web hali: müziği desen cebriyle canlı kodlarsınız.",[0,0,.2,0,0,1,1,0,.2,.1,.9,.7,.3]],
["Elementary Audio","audio",2021,"MIT",200,1,"synth","elementary.audio","Sesi bildirimsel bir grafik olarak tarif eder; render motoru gerisini yapar.",[0,0,0,0,0,1,1,0,.5,.2,1,.6,.1]],
["Meyda","audio",2014,"MIT",40,1,"spectrum","meyda.js.org","Ses akışından RMS, MFCC, spektral merkez gibi öznitelikler çıkarır.",[0,0,0,0,0,.6,1,0,.7,.7,.2,.4,0]],
["Essentia.js","audio",2020,"AGPL-3",800,1,"spectrum","mtg.github.io/essentia.js","Müzik bilgi getirimi: tempo, ton, ritim çözümlemesi — WASM ile.",[0,0,0,0,0,.6,1,0,.9,.8,.2,.4,0]],
["Pitchy","audio",2018,"MIT",15,1,"spectrum","github.com/ianprime0509/pitchy","Mikrofondan gelen sesin perdesini bulur; akort ve ses girdisi için.",[0,0,0,0,0,.7,1,0,.8,.4,.3,.7,.4]],
["WebMidi.js","audio",2015,"Apache-2",90,1,"synth","webmidijs.org","MIDI aygıtlarını tarayıcıya bağlar: nota, kontrol değişimi, saat.",[0,0,0,0,0,.8,1,0,.2,.3,.3,.8,.9]],
["Pizzicato","audio",2015,"MIT",30,1,"speaker","alemangui.github.io/pizzicato","Web Audio üstünde sade bir ses ve efekt katmanı.",[0,0,0,0,0,.5,1,0,.1,0,.4,.8,.2]],
["SoundJS","audio",2011,"MIT",60,1,"speaker","createjs.com/soundjs","CreateJS ailesinden ses yönetimi; eski ama hâlâ karşılaşılan bir standart.",[0,0,0,0,0,.5,1,0,0,0,.4,.8,.2]],

// ---- Görü & Sensör ---------------------------------------------------------
["MediaPipe Tasks","sense",2019,"Apache-2",600,29,"landmarks","ai.google.dev/edge/mediapipe","El, yüz ve poz işaret noktalarını gerçek zamanlı çıkarır — kamerayı girdi aygıtına çevirir.",[0,0,.2,.5,.4,.6,.2,0,1,.4,.6,.9,.6]],
["TensorFlow.js","sense",2018,"Apache-2",900,19,"net","tensorflow.org/js","Model eğitimi ve çıkarımı tarayıcıda; WebGL ve WebGPU arka uçlarıyla.",[0,0,0,.5,.2,.4,.2,0,1,.8,.4,.4,.1]],
["ml5.js","sense",2018,"MIT",300,7,"net","ml5js.org","Makine öğrenmesini p5.js diliyle konuşturur; sanatçılar için tasarlanmış arayüz.",[0,0,.2,.3,.1,.5,.3,0,1,.5,.7,1,.4]],
["face-api.js","sense",2018,"MIT",600,17,"landmarks","github.com/justadudewhohacks/face-api.js","Yüz bulma, işaret noktası, ifade ve kimlik — tek pakette, tarayıcıda.",[0,0,.3,.4,0,.5,0,0,1,.3,.6,.9,.5]],
["handtrack.js","sense",2019,"MIT",200,3,"landmarks","victordibia.com/handtrack.js","Kamera görüntüsünde eli bulur; jestle etkileşim için en kısa yol.",[0,0,.3,.3,0,.5,0,0,1,.2,.7,1,.6]],
["OpenCV.js","sense",2017,"Apache-2",8000,1,"spectrum","docs.opencv.org","OpenCV'nin WebAssembly derlemesi: eşikleme, kenar, izleme, kalibrasyon.",[0,0,.4,0,.3,.4,0,0,1,.4,.1,.2,.3]],
["Transformers.js","sense",2023,"Apache-2",900,13,"net","huggingface.co/docs/transformers.js","Hugging Face modellerini tarayıcıda çalıştırır — metin, ses, görüntü, hepsi yerelde.",[0,0,0,.4,0,.3,.4,0,1,.7,.7,.9,.2]],
["ONNX Runtime Web","sense",2021,"MIT",1500,1,"net","onnxruntime.ai","Eğitilmiş modelleri standart bir biçimden tarayıcıda çalıştırır.",[0,0,0,.5,0,.3,.3,0,1,.6,.3,.4,.1]],
["Brain.js","sense",2016,"MIT",300,14,"net","brain.js.org","Küçük sinir ağlarını birkaç satırda eğitir; öğretim için tasarlanmış.",[0,0,.1,.3,0,.3,0,0,1,.7,.5,.9,.1]],
["annyang","sense",2014,"MIT",6,6,"speaker","talater.github.io/annyang","Sesle komut: birkaç satırda konuşmayı eyleme bağlar.",[.6,0,0,0,0,.4,.9,0,.5,.1,.8,1,.9]],
["Tracking.js","sense",2014,"BSD-3",60,9,"landmarks","trackingjs.com","Renk, yüz ve nesne izleme; bağımlılıksız ve öğretmesi kolay.",[0,0,.4,0,0,.5,0,0,.9,.2,.4,.8,.5]],
["gyronorm.js","sense",2015,"MIT",15,1,"drag","github.com/dorukeker/gyronorm.js","Cihaz yönelimi ve ivme verisini tarayıcılar arasında eşitler.",[.4,0,0,0,.6,.6,0,.3,.5,.3,.3,.8,1]],

// ---- Anlatı & Arayüz -------------------------------------------------------
["Scrollama","story",2017,"MIT",8,4,"scroll","github.com/russellsamora/scrollama","IntersectionObserver'ı kaydırmalı anlatıya çevirir; gazetecilikte fiili standart.",[1,0,0,0,0,.6,0,0,0,.2,.5,.9,1]],
["Swiper","story",2014,"MIT",140,40,"carousel","swiperjs.com","Dokunmatik kaydırıcı: sanal slaytlar, serbest mod, çok sayıda geçiş efekti.",[1,0,0,0,.1,.7,0,0,0,.1,.6,.9,1]],
["Embla Carousel","story",2019,"MIT",20,6,"carousel","embla-carousel.com","Bağımlılıksız, erişilebilir kaydırıcı motoru; görünüşü tamamen size bırakır.",[1,0,0,0,0,.7,0,0,0,.1,.4,.7,1]],
["Splide","story",2019,"MIT",30,5,"carousel","splidejs.com","Hafif kaydırıcı; klavye ve ekran okuyucu desteği yerleşik gelir.",[1,0,0,0,.1,.7,0,0,0,.1,.6,.9,1]],
["Reveal.js","story",2011,"MIT",200,69,"slides","revealjs.com","HTML sunum çerçevesi; iç içe slaytlar, konuşmacı notu, PDF çıktısı.",[1,0,0,0,.1,.6,0,0,0,.1,.8,.9,.9]],
["Impress.js","story",2011,"MIT",40,38,"slides","impress.js.org","Sunumu sonsuz bir düzlemde gezinme olarak kurar; Prezi'nin açık kaynak akrabası.",[1,0,0,0,.5,.7,0,0,0,.1,.8,.9,.9]],
["TimelineJS","story",2013,"MPL-2",300,4,"timeline","timeline.knightlab.com","Bir tablodan gezilebilir zaman çizelgesi üretir; haber odalarının klasiği.",[1,0,0,0,0,.4,0,.3,0,.6,.9,1,.8]],
["Idyll","story",2017,"MIT",250,2,"markdown","idyll-lang.org","Markdown içine etkileşimli bileşen gömer; açıklayıcı yazının işaretleme dili.",[1,.3,.2,0,0,.3,0,0,0,.7,1,.9,.7]],
["Observable Runtime","story",2018,"ISC",40,1,"markdown","github.com/observablehq/runtime","Tepkisel hücre modeli: bir değer değişince ona bağlı her şey kendini yeniler.",[.6,0,0,0,0,.5,0,0,.5,.9,1,.7,.6]],
["Interact.js","story",2012,"MIT",60,12,"drag","interactjs.io","Sürükle, yeniden boyutlandır, çok parmaklı jest — hepsi tek olay katmanında.",[1,0,0,0,0,.5,0,0,.2,0,.2,.6,1]],
["Hammer.js","story",2013,"MIT",25,23,"drag","hammerjs.github.io","Dokunma jestlerini adlandırır: tap, swipe, pinch, rotate.",[1,0,0,0,0,.5,0,0,.2,0,.3,.8,1]],
["Sortable.js","story",2013,"MIT",45,29,"drag","sortablejs.github.io/Sortable","Listeleri sürükleyerek sıralatır; gruplar arası taşımayı da kutudan çıkarır.",[1,0,0,0,0,.4,0,0,.1,.3,.5,.9,1]],
["dnd-kit","story",2021,"MIT",90,13,"drag","dndkit.com","React için erişilebilir sürükle-bırak; klavyeyle de çalışır.",[1,0,0,0,0,.5,0,0,.2,.3,.9,.8,1]],
["Driver.js","story",2020,"MIT",12,22,"slides","driverjs.com","Sayfa üstünde adım adım tur: odaklar, karartır, anlatır.",[1,0,0,0,0,.5,0,0,0,.1,.7,.9,.9]],
["Shepherd.js","story",2014,"MIT",60,13,"slides","shepherdjs.dev","Karşılama turları için adım motoru; konumlandırmayı kendi çözer.",[1,0,0,0,0,.5,0,0,0,.1,.7,.9,.9]],
["Video.js","story",2010,"Apache-2",180,38,"player","videojs.com","Oynatıcı arayüzünü tarayıcılar arasında eşitler; eklenti ekosistemi geniş.",[1,0,0,0,0,.7,.6,0,0,0,.5,.9,.9]],
["hls.js","story",2015,"Apache-2",250,15,"player","github.com/video-dev/hls.js","HLS akışını Media Source üzerinden oynatır; canlı yayının tarayıcı ayağı.",[.4,0,0,0,0,.9,.5,0,.4,.3,.2,.5,.3]],
["Vidstack","story",2022,"MIT",150,2,"player","vidstack.io","Modern oynatıcı bileşenleri; erişilebilirlik ve tema tarafı güçlü.",[1,0,0,0,0,.7,.6,0,0,.1,.9,.9,.9]],
["Remotion","story",2021,"Özel",400,22,"player","remotion.dev","Videoyu React bileşeni olarak yazıp kare kare render eder. Zaman bir prop olur.",[1,.4,.3,.2,.1,1,.5,0,0,.3,1,.7,.2]],

// ---- Araç Kutusu -----------------------------------------------------------
["Tweakpane","tools",2019,"MIT",70,4,"panel","tweakpane.github.io","Sahnenin parametrelerini canlı kurcalamak için zarif bir denetim paneli.",[1,0,0,0,.2,.5,.2,0,.2,.5,.5,.9,1]],
["dat.GUI","tools",2011,"Apache-2",40,9,"panel","github.com/dataarts/dat.gui","Üç satırda kaydırıcı ve renk seçici; sayısız WebGL örneğinin altında bu var.",[1,0,0,0,.2,.4,.1,0,.2,.5,.4,.9,1]],
["lil-gui","tools",2021,"MIT",25,1,"panel","lil-gui.georgealways.com","dat.GUI'nin bakımlı, küçük ve modern yerine geçeni.",[1,0,0,0,.2,.4,.1,0,.2,.5,.4,.9,1]],
["Stats.js","tools",2011,"MIT",6,9,"line","github.com/mrdoob/stats.js","Kare hızını ve bellek kullanımını köşede gösterir; optimizasyonun ilk adımı.",[1,0,.3,0,.2,.9,0,0,.3,.4,.3,.9,.2]],
["chroma.js","tools",2011,"BSD-3",40,10,"swatches","gka.github.io/chroma.js","Renk uzayları arası dönüşüm, ölçek üretimi, karıştırma, kontrast hesabı.",[0,0,0,0,0,0,0,0,.7,.6,.3,.7,0]],
["culori","tools",2020,"MIT",50,1,"swatches","culorijs.org","Modern renk uzayları (oklch, lab) için hızlı ve tam kapsamlı hesap.",[0,0,0,0,0,0,0,0,.8,.5,.3,.6,0]],
["delaunator","tools",2017,"ISC",8,2,"triangles","github.com/mapbox/delaunator","Noktalardan Delaunay üçgenlemesi; Voronoi ve arazi işlerinin temeli.",[0,0,0,0,.2,0,0,.4,1,.7,.1,.2,0]],
["earcut","tools",2016,"ISC",5,2,"triangles","github.com/mapbox/earcut","Poligonu üçgenlere böler; GPU'ya dolgu göndermenin ön koşulu.",[0,0,0,.3,.3,0,0,.5,1,.4,.1,.2,0]],
["gl-matrix","tools",2012,"MIT",30,5,"matrix","glmatrix.net","Vektör ve matris matematiği; neredeyse her WebGL kütüphanesinin altında bu var.",[0,0,0,.3,1,0,0,0,.9,.2,0,0,0]],
["RBush","tools",2014,"MIT",7,2,"triangles","github.com/mourner/rbush","Uzamsal dizin: hangi nokta hangi dikdörtgende, milisaniyede.",[0,0,0,0,0,0,0,.6,1,.6,.1,.3,0]],
["simplex-noise","tools",2013,"MIT",4,1,"shader","github.com/jwagner/simplex-noise.js","4 kB'lik gürültü. Üretken işlerin yarısı bu tek fonksiyonun üstünde durur.",[0,0,0,0,.3,.6,.1,.1,.6,.1,.1,.2,0]],
["opentype.js","tools",2013,"MIT",180,4,"matrix","opentype.js.org","Yazı tipini açar, glifleri yol olarak verir; harfi çizilebilir malzemeye çevirir.",[0,.7,.3,0,.2,.2,0,0,.8,.4,.2,.4,.1]],
["PapaParse","tools",2013,"MIT",45,12,"table","papaparse.com","Büyük CSV'leri akışla, worker'da, hatalarıyla birlikte ayrıştırır.",[0,0,0,0,0,0,0,0,.6,1,.3,.8,0]],
["Arquero","tools",2020,"BSD-3",120,1,"table","idl.uw.edu/arquero","dplyr'ın JavaScript karşılığı; sütun tabanlı dönüşümler, tek piksel çizmeden.",[0,0,0,0,0,0,0,0,.7,1,.6,.5,0]],
["Danfo.js","tools",2020,"MIT",400,5,"table","danfo.jsdata.org","Pandas'ın JavaScript karşılığı: DataFrame, gruplama, birleştirme, özet.",[0,0,0,0,0,0,0,0,.6,1,.6,.7,0]],
["Graphology","tools",2018,"MIT",90,1,"nodes","graphology.github.io","Çizim yapmaz: graf veri yapısı, ölçütler ve yerleşim algoritmaları sağlar.",[0,0,0,0,0,.3,0,0,.9,.9,.3,.4,0]],
["TopoJSON","tools",2013,"BSD-3",25,4,"topology","github.com/topojson/topojson","Sınırları paylaşarak coğrafi veriyi küçültür; komşuluk bilgisini korur.",[0,0,0,0,0,0,0,.9,.8,.9,.2,.4,0]],
["Yjs","tools",2015,"MIT",90,17,"board","yjs.dev","Çakışmasız ortak düzenleme (CRDT); aynı tuvali birden çok kişi kurcalar.",[.3,0,0,0,0,.6,0,0,.9,.8,.4,.6,.9]],
["PeerJS","tools",2013,"MIT",30,12,"drag","peerjs.com","WebRTC'yi basitleştirir: tarayıcıdan tarayıcıya doğrudan bağlantı.",[.2,0,0,0,0,.7,.5,0,.5,.5,.3,.8,.8]],
["Socket.IO","tools",2010,"MIT",70,62,"drag","socket.io","Gerçek zamanlı olay kanalı; çok kişili etkileşimin klasik omurgası.",[.2,0,0,0,0,.8,.2,0,.4,.7,.3,.8,.8]],
["Comlink","tools",2017,"Apache-2",5,11,"matrix","github.com/GoogleChromeLabs/comlink","Worker'la konuşmayı sıradan fonksiyon çağrısına indirger; ana ipliği açar.",[.2,0,0,0,0,.4,0,0,.8,.4,.3,.8,0]]
];

const LIBS = RAW.map((r,i)=>({
  i, name:r[0], cat:r[1], year:r[2], lic:r[3], kb:r[4], stars:r[5],
  glyph:r[6], url:r[7], tag:r[8], v:r[9], seed:(i*2654435761)%100000/100000
}));

/* Türetilmiş eksenler: ağırlık (log kB), yaş, erişim (log yıldız) */
const yMin=2006, yMax=2023;
LIBS.forEach(l=>{
  l.wNorm = Math.min(1,(Math.log10(l.kb)-0.6)/(Math.log10(8000)-0.6));
  l.aNorm = (l.year-yMin)/(yMax-yMin);
  l.rNorm = Math.min(1,Math.log10(l.stars*1000)/Math.log10(110000));
});

/* Ağırlıklı 16 boyutlu vektör */
const DIM_W = [1,1,1,1, 1.35,1.2,1.35,1.45, 1.3,1.25, .85,.85, .9,  .55,.5,.6];
const X = LIBS.map(l=>{
  const a=[...l.v, l.wNorm, l.aNorm, l.rNorm];
  return a.map((x,k)=>x*DIM_W[k]);
});

function hiDist(a,b){let s=0;for(let k=0;k<a.length;k++){const d=a[k]-b[k];s+=d*d;}return Math.sqrt(s);}
LIBS.forEach((l,i)=>{
  l.near = LIBS.map((m,j)=>({j,d:hiDist(X[i],X[j])}))
    .filter(o=>o.j!==i).sort((p,q)=>p.d-q.d).slice(0,5).map(o=>o.j);
});

/* ------------------------------------------------------------------
   3. t-SNE
------------------------------------------------------------------ */
function mulberry32(a){return function(){a|=0;a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};}

function pairwise(X){
  const n=X.length, D=new Float64Array(n*n);
  for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){
    let s=0; for(let k=0;k<X[i].length;k++){const d=X[i][k]-X[j][k];s+=d*d;}
    D[i*n+j]=s; D[j*n+i]=s;
  }
  return D;
}

function buildP(D,n,perp){
  const P=new Float64Array(n*n), logU=Math.log(perp), row=new Float64Array(n);
  for(let i=0;i<n;i++){
    let beta=1, lo=-Infinity, hi=Infinity;
    for(let t=0;t<64;t++){
      let sum=0;
      for(let j=0;j<n;j++){ row[j]= j===i?0:Math.exp(-D[i*n+j]*beta); sum+=row[j]; }
      if(sum<1e-12) sum=1e-12;
      let H=0; for(let j=0;j<n;j++) if(j!==i) H+=beta*D[i*n+j]*row[j];
      H=H/sum+Math.log(sum);
      const diff=H-logU;
      if(Math.abs(diff)<1e-5) break;
      if(diff>0){ lo=beta; beta = hi===Infinity ? beta*2 : (beta+hi)/2; }
      else { hi=beta; beta = lo===-Infinity ? beta/2 : (beta+lo)/2; }
    }
    let sum=0; for(let j=0;j<n;j++) sum+=row[j]; if(sum<1e-12) sum=1e-12;
    for(let j=0;j<n;j++) P[i*n+j]=row[j]/sum;
  }
  const S=new Float64Array(n*n);
  for(let i=0;i<n;i++)for(let j=0;j<n;j++) S[i*n+j]=Math.max((P[i*n+j]+P[j*n+i])/(2*n),1e-12);
  return S;
}

function makeSolver(X,perp,seed){
  const n=X.length, P=buildP(pairwise(X),n,perp), rnd=mulberry32(seed);
  const Y=new Float64Array(n*2), dY=new Float64Array(n*2),
        gains=new Float64Array(n*2).fill(1), grad=new Float64Array(n*2),
        Q=new Float64Array(n*n);
  for(let i=0;i<n*2;i++){ let u=0; for(let k=0;k<3;k++) u+=rnd(); Y[i]=(u/3-.5)*1e-3; }
  let iter=0, kl=0;
  function step(){
    const exag = iter<120 ? 8 : 1;
    const mom  = iter<200 ? .5 : .85;
    const eta  = 180;
    let qsum=0;
    for(let i=0;i<n;i++)for(let j=i+1;j<n;j++){
      const dx=Y[i*2]-Y[j*2], dy=Y[i*2+1]-Y[j*2+1];
      const num=1/(1+dx*dx+dy*dy);
      Q[i*n+j]=num; Q[j*n+i]=num; qsum+=2*num;
    }
    if(qsum<1e-12) qsum=1e-12;
    kl=0; grad.fill(0);
    for(let i=0;i<n;i++)for(let j=0;j<n;j++){
      if(i===j) continue;
      const num=Q[i*n+j], q=Math.max(num/qsum,1e-12), p=P[i*n+j];
      if(i<j) kl+=2*p*Math.log(p/q);
      const m=4*(p*exag-q)*num;
      grad[i*2]   += m*(Y[i*2]-Y[j*2]);
      grad[i*2+1] += m*(Y[i*2+1]-Y[j*2+1]);
    }
    for(let i=0;i<n*2;i++){
      gains[i] = Math.sign(grad[i])===Math.sign(dY[i]) ? gains[i]*.8 : gains[i]+.2;
      if(gains[i]<.01) gains[i]=.01;
      dY[i] = mom*dY[i] - eta*gains[i]*grad[i];
      Y[i] += dY[i];
    }
    let mx=0,my=0; for(let i=0;i<n;i++){mx+=Y[i*2];my+=Y[i*2+1];}
    mx/=n; my/=n; for(let i=0;i<n;i++){Y[i*2]-=mx;Y[i*2+1]-=my;}
    iter++;
    return kl;
  }
  return { step, Y, n, get iter(){return iter;}, get kl(){return kl;} };
}

function fitted(Y,n){
  let m=0; for(let i=0;i<n*2;i++) m=Math.max(m,Math.abs(Y[i]));
  const s = m>0 ? 1/m : 1;
  const out=new Float64Array(n*2);
  for(let i=0;i<n*2;i++) out[i]=Y[i]*s;
  return out;
}
