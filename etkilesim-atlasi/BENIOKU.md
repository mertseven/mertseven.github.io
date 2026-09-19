# Etkileşim Atlası

İnteraktif medyayı mümkün kılan JavaScript kütüphanelerinin haritası, onlarla
yapılmış gazetecilik işlerinin müzesi ve müzenin karşısındaki çimende duran
öğrenci pavyonu. Öğrencilere gösterilmek üzere.

**Yayınlanan sürüm:** https://mertseven.com/etkilesim-atlas
> GitHub Pages (`mertseven.github.io` deposu). Artifact hedefi **bırakıldı**;
> eski artifact bağlantısı en baştaki dither'lı müzeyi gösteriyordu, artık
> geçerli değil.

---

## Nerede kaldık

**Durum: hâlâ inşa hâlinde.** İki yarı da çalışıyor ve sınandı:

| | |
|---|---|
| Atlas | 162 kart, **sıfır çakışma**, arama ("ses" → 16/162), 6 tur durağı, eksen sözlüğü, 10 küme, 28 canlı demo. Konsol temiz |
| Müze | Omurga baştan sona yürünüyor, rampa sıçraması 0,091 m, 8 kanat/4 kat erişilebilir, duvarlar geçilmiyor, afiş ve konsol tıklaması çalışıyor |
| Pavyon | 9 niş, gerçek kapaklar (322 kB), kapıdan çıkılıp yürünüyor, cam cephe artık geçilmiyor, künye tıklaması modalı açıyor |
| Telefon | Ray çekmeceye döndü, müze tam ekran, açılış ölçeği görünüme bağlı. 375×812 ve 812×375'te sınandı |
| Başarım | 998×720 tuvalde toplam **3,33 ms** iş; dönerken en kötü kare 19 ms |
| Dosya | 312 kB tek parça + 322 kB kapak görseli; derleme bağımlılığı yok |

**Denge.** Dokuz tur müzeye, onuncu tur pavyona gitmişti. On birinci tur
**mobili** kapattı — atlasa ait üç maddeden biri. Kalan ikisi hâlâ el
sürülmeden duruyor: **klavye gezinmesi** ve 134 kütüphaneye **"neden demo yok"**
etiketi. Kampüsü büyütmeden önce o ikisini bitirin.

**Önerilen sıra:** (1) "neden demo yok" etiketi — işin dürüstlük
çerçevesindeki tek boşluk; (2) klavye gezinmesi; (3) **gerçek bir telefonda**
deneme (aşağıdaki mobil işi tarayıcı emülasyonunda sınandı); (4) statik gölge
haritası + pişmiş köşe karartması; (5) pavyonun avlusunu doldurmak.

---

## Sınarken düşülen tuzaklar

Bunlar saatler yedi, yazıyorum:

- **Önizleme paneli gizliyken `requestAnimationFrame` donuyor.** Kare çalışmıyor,
  dolayısıyla `mFrame` çalışmıyor, dolayısıyla kamera `player`/`mYaw`'dan
  **güncellenmiyor**. `mTeleport` + `mLook` sonrası ışın hâlâ eski kameradan
  gidiyor ve tıklama testleri sahte biçimde başarısız oluyor. Çare: araya gerçek
  bir kare sokmak (ekran görüntüsü almak bir kare pompalıyor).
- **`atlas.mProfile(1)` sahneyi çizer ama `mFrame`'i çalıştırmaz** — yani kamerayı
  güncellemez. Kare zorlamak için yeterli değil.
- **Sayaçtaki ve `mQuality()`'deki değerler üstel ortalama.** Herhangi bir
  takılmadan sonra ~20 kare boyunca kirli kalıyorlar. Yerleşmeden inanmayın:
  bir ölçümde "sahne 11,65 ms" gördüm, yerleşince 1,58 çıktı.
- **Gömülü/sanal ortamlarda fare kilidi reddediliyor** (`WrongDocumentError`).
  O ortamlarda sürükle-bak devreye giriyor; kilit varsayarak test yazmayın.
- **Birbirine kilitli sayılar:** kapı genişliği (2 m) → kanat başına yuva (26) →
  pano oranı (altıda bir) → afiş yuvası (22) → en kalabalık bölüm (22 iş).
  Birini değiştirirseniz zinciri baştan sayın.

---

## Bu klasörde ne var

Proje `mertseven.github.io` deposunun içinde, `etkilesim-atlasi/` altında:

```
etkilesim-atlasi/
  derle.py              parçaları birleştirir
  src/                  asıl kaynak — düzenlemeler BURADA yapılır
  veri/                 ham araştırma verisi
  BENIOKU.md            bu dosya
  arac/                 elle çalıştırılan yardımcılar (derleme adımı DEĞİL)
  etkilesim-atlasi.html IIFE parçası; söz dizimi kontrolü için, .gitignore'da
../etkilesim-atlas.html YAYINLANAN dosya (depo kökü)
../atlas-varlik/kapak/  pavyonun kapak dokuları (.webp) — depoya işlenir
../grad-projects/       mezuniyet showcase'i; pavyonun VERİ KAYNAĞI
```

**Derleme:** `python derle.py` — başka hiçbir şey gerekmez, bağımlılık yok.
Çıktı doğrudan `../etkilesim-atlas.html`'e, yani canlı yola yazılır.

> Kökteki `etkilesim-atlas.html` bir **çıktıdır**. Doğrudan düzenlemeyin; `src/`
> içindeki parçayı düzenleyip yeniden derleyin, yoksa değişiklik bir sonraki
> derlemede silinir. Adını da değiştirmeyin — canlı bağlantı ona bağlı.

---

## Kaynak parçaları

Sıra önemli: hepsi **tek bir IIFE** içinde birleşir. `_p2.js` açar, `_p7.js` kapatır.

| Dosya | İçerik |
|---|---|
| `_p1.html` | İskelet, bütün CSS, ray (sol panel), sahne, müze arayüzü, modal, joystick |
| `_p2.js`   | 10 grup, 13 eksen + açıklamaları, **162 kütüphane**, t-SNE çözücü |
| `_p3.js`   | 44 prosedürel glyph (her kütüphanenin işini taklit eden çizimler) |
| `_p4b.js`  | Kart manzarası: yerleşim, çakışma ayrıştırma, sürükleme, mini harita, künye |
| `_p5.js`   | Küme bölgeleri, CDN yükleyici, **28 canlı kütüphane demosu** |
| `_p6.js`   | Tur (6 durak), karşılaştırma paneli, eksen sözlüğü |
| `_p8.js`   | **118 gazetecilik işi** (digijournalism kataloğu) |
| `_p9.js`   | **Vatoz**: kanat kinematiği, kuyruk filamenti, deri dokusu, geometri |
| *(üretilen)* | **9 mezuniyet projesi** — `derle.py`, `grad-projects/script.js`'teki diziyi buraya kopyalar. Kaynak dosyası YOK, düzenleme oraya yapılır |
| `_p10.js`  | **Pavyon**: on kenarlı halka, dış zemin, açılı duvar çarpışması, mezuniyet modalı |
| `_p7.js`   | Müze: Holmdel planı (omurga + üç ışık avlusu), ışık/hava geçişi, gezinme, modal |

---

## Ürünün üç parçası

**1. Atlas (kart manzarası).** 162 kütüphane, 16 boyutlu özellik vektöründen
t-SNE ile bir düzleme serilir; kartlar çakışmayacak şekilde ayrıştırılır.
Her kart iki kutu: üstte kütüphanenin işini yapan canlı çizim, altta açıklama.
28 kartta kütüphanenin **kendisi** cdnjs/jsDelivr'den yüklenip kartın içinde çalışır.
Yanındaki "kanat" düğmesi aynı demoyu etkileşimli olarak açar.

**2. Müze — Bell Labs Holmdel Complex.** Saarinen'in 1962 binası örnek alındı:
bina boyunca tek bir **omurga** (200 m koridor) ve onu noktalayan **üç tam
yükseklikte ışık avlusu** (her biri 34 m). Omurga her avludan bir köprüyle geçer,
kuyular köprünün iki yanında açılır; her katta avluya bakan galeriler vardır.
Cephe baştan sona cam, avluların tepesi camlı çatı — sahne gündüz.

Avlular bilerek uzun: koridor 98 m, avlu 102 m. Yürüyüşün yarısından çoğu dört
katlı boşluğun altında geçsin diye.

Dört kat × omurganın iki yanı = sekiz kanat, sayfanın sekiz bölümüne denk gelir.
Kanat başına 30 yuva; **her beşinci yuva afişe değil canlı bir panoya** ayrılır
(aşağı bakın), kalan 24'e 118 işin o bölüme düşeni sığar — en kalabalığı 22.
İşler yuvalara baştan değil **bütün boya yayılarak** dağıtılır, yoksa 7 işlik bir
bölüm koridorun ilk çeyreğinde bitip gerisini boş bırakıyor.

Kanat tabelası ve o kanadın üç canlı demosu avlu kenarlarındaki **dolu ayaklara**
asılıdır. Avluya ayrıca **dizin pankartları** sarkar: o taraftaki dört kanadın
adı, kendi renginde, kat yüksekliğine denk gelen bantlar hâlinde.

> Pankartlar kuyunun **dış** kenarında (x=±15, z=cz±14). Önce x=±10,5 ve
> z=cz±9'daydılar — yani tam rampanın x aralığının (6,2–11,8) ve çapraz köprünün
> z aralığının içinde; ikisinin de içinden geçiyorlardı. Ayrıca `DoubleSide`
> değil, **sırt sırta iki tek yüzlü düzlem**: çift yüzlüyken arkadan bakınca
> yazı ters okunuyordu.

**Rehber ekranı.** `Tab` dört katı ve sekiz kanadı, renkleriyle ve iş sayılarıyla
listeler; bulunduğunuz kat ve kanat işaretlidir. 200 m'lik bir binada "nerede ne
var" sorusunun cevabı daha önce yalnız avlunun ortasında duruyordu.

Katlar arası bağlantı uç avlulardaki rampalardır; kat kat taraf değiştirir (zikzak).
Sahne tek bir "boyama" geçişinden geçer: yumuşak parlaklık, sıcak-soğuk ayrımı,
köşelerde hafif kararma ve çok ince bir kâğıt dokusu.

**Orta avluda bir vatoz.** Sağ kuyu bir akvaryuma çevrildi: 13 × 34 m taban,
24,8 m derinlik, içinde 2,4 m kanat açıklığında bir **benekli kartal vatozu**
süzülüyor (4–13 m yükseklikte). Kuyunun kenarında bir **konsol** var; tıklayınca
hayvanın parametrelerini değiştiren bir panel açılıyor. Ayrıntı aşağıda.

**Mekânı canlı tutan altı şey.** İlk hâli doğru ama soğuk ve basıktı; sebebi
teşhis edildi ve tek tek karşılandı:

| Sorun | Çare |
|---|---|
| Tavan koyu kirişlerle bir "kapak" gibiydi | Kirişler **aydınlatma bandına** çevrildi (sıcak beyaz) |
| Hiç renk yoktu | Bölüm renkleri (`--cat-*`) **korkuluk kapaklarına ve koridor duvarının üst kenarına** taşındı |
| Boşluğun yüksekliği okunmuyordu | Avluya **sarkan dizin pankartları** (3 m → 24 m) |
| Zemin bomboş beyazdı | İki **döşeme kılavuz çizgisi** + duvar dibinde banklar |
| Bina bomboştu | Prosedürel **bitkiler** (saksı + dokuz yaprak, instance'lı) |
| Hiçbir şey kıpırdamıyordu | **Canlı panolar**: `_p3.js`'in glyph'leri, donmuş kare değil, yaklaşınca her karede yeniden çiziliyor |

**3. Pavyon — mezuniyet projeleri.** Müzenin kuzey ucundaki kapıdan çıkılıp
çimenden geçilerek varılan, **on kenarlı** küçük bir yapı. Biri giriş, dokuzu iş:
`grad-projects/` showcase'indeki dokuz NMED mezuniyet projesi.

Biçim içerik sayısından türedi, tersi değil. Müzenin kanat matematiği (26 yuva,
altıda bir pano, en kalabalık bölüm 22 iş) 118 işten türetilmişti; dokuz iş için
aynı planın küçültülmüşü **%96 boş** bir bina demekti. On kenar tam oturuyor ve
ölçüler birbirine kilitli:

| | |
|---|---|
| 9 iş + 1 giriş | 10 kenar, kenar başına 36° |
| duvar yüzü merkeze | 10,2 m (apotem) → kenar **6,63 m** |
| köşe yarıçapı | 10,72 m → avlu 20,4 m |
| kapak | 3,36 × 1,89 m (16:9), y = 2,62 m |
| künye | 3,36 × 0,87 m, y = 1,28 m |
| saçak | 7 m; sundurma nişlere 3,4 m sarkıyor, **avlunun üstü açık** |

> `GRAD.length` dokuzdan farklı olursa `buildPavilion` konsola yazar ve
> `derle.py` çıktısında `mezuniyet : N` satırı uyarır. Yeni dönem gelirse
> `PAV_N`'i `iş + 1` yapın; başka hiçbir sayıyı elle değiştirmeyin.

**Renk bilerek ters.** Müzede `CAT_MUSEUM`'un susturulmuş toprakları var, çünkü
aynı renkler 200 m'lik bir mekânı soğutuyordu. Pavyonda her nişin duvar kapağı o
projenin **kendi rengi** — showcase'teki `color` alanı, hiç dokunulmadan. Kanon
sakin, bu yılın işi parlak; iki yapının farkı tek cümleyle anlatılabiliyor.

**Kapaklar gerçek.** Müzedeki 118 işin ekran görüntüsü yok, tasarlanmış afişleri
var; sebebi Artifact'ın CSP'siydi. Pages'e geçişle o kısıt kalktı, dokuz iş
gerçek kapağıyla duruyor. Görseller 4,5 MB PNG'den **322 kB WebP**'ye indi
(`arac/kapak-donustur.py`, elle çalıştırılır).

**Veri tek kaynaktan.** Pavyonun listesi kopyalanmadı: `derle.py`,
`grad-projects/script.js` içindeki `projects[]` dizisini derleme anında olduğu
gibi alıp `GRAD` olarak gömüyor. Showcase güncellenince pavyon da güncelleniyor.
Düzenleme oraya yapılır, `_p10.js`'e değil.

**Doku yolunda eşleme tablosu yok.** `cover` alanının dosya ADI korunuyor, yalnız
klasör ve uzantı değişiyor; `kapak-donustur.py` de aynı kuralı uyguluyor. Tablo
olsaydı bir gün kayardı.

---

## Kampüs: dışarısı

**Bina artık boşlukta durmuyor.** Gökyüzü vardı, yer yoktu. Zemin, binanın ayak
izini **dışarıda bırakan dört büyük parça** olarak kuruluyor. Tek bir büyük
düzlem olsaydı avlu kuyularının üstüne kapak gibi oturur, vatozun yüzdüğü
akvaryumu kapatırdı — bu yüzden dört parça.

> **Zemin beklenenden çok koyu (`0x76825A`) ve öyle kalmalı.** Yukarı bakan geniş
> düz bir yüzey HemisphereLight'ın sıcak tepesini (0,72) ve iki yönlü ışığı
> birden alıyor. İlk denenen `0xB9C0A4` ekranda neredeyse beyaza patlıyordu:
> BENİOKU'nun "döşemeyi beyaza patlatıp her şeyi sepyaya çeviriyor" uyarısının
> dışarıdaki karşılığı. Değer ışığa göre değil **ekrandaki sonuca** göre seçildi.

**Kapı omurganın tam ekseninde.** Zemin katın +Z ucundaki cam cephede 4 m'lik bir
boşluk, koyu söveler ve lento. Böylece 200 m'lik perspektifin ucunda pavyon
duruyor: dışarı çıkmadan önce görülüyor.

**Açılı duvarlar için ikinci bir çarpışma sınaması.** `crossesWall()` yalnız
`x=±SPINE_X`'e dik bölmeleri sınıyor — koridor için yeterliydi ve ucuzdu. Ama
pavyonun duvarları on ayrı açıda, binanın cephesi de z eksenine dik; ikisi de o
sınamaya girmiyor. `crossesSeg()` genel: `segWalls` içindeki her öğe bir
`[x0,z0,x1,z1,y]` parçası, sınama düz doğru-parça kesişimi. **On dört parça**,
ölçülebilir maliyeti yok.

> Bu olmadan cam cepheden **yürüyerek çıkılıyordu**: `matGlass` çarpışmaya hiç
> girmiyor, ve dışarıda artık zemin var. Zemini eklemek camı delik hâline
> getirdi; `crossesSeg` onu kapattı.

**Künye de tıklanabilir, ve sebebi ölçüldü.** Kapağın alt kenarı 1,675 m'de, göz
1,66 m'de. Avlunun ortasında **düz bakarken** ışın kapağın tam altından geçip
ıskalıyordu; seçmek için farkında olmadan yukarı bakmak gerekiyordu. Künye göz
hizasında, ikisi de ışın listesinde — hedef iki katına çıktı.

---

## Telefon

Üç ayrı sorun vardı; biri düpedüz yerleşim hatasıydı.

**1. Ray ekranın yarısını yiyordu.** Eski kural ray'i dar ekranda `44dvh`'ye
kısıyor ama **olduğu yerde** bırakıyordu. Harita 812 px'lik bir telefonda
455 px'e sıkışıyordu. Artık ray üstten inen bir **çekmece**: `position:fixed`,
`translateY(-101%)`, `.app[data-rail]` ile açılıyor. Izgara tek satıra indiği
için sahne bütün ekranı alıyor.

> Çekmecenin kapanma kuralı **kasıtlı olarak seçici**: tur durağı ya da
> "müzeye gir" gibi görünümü değiştiren bir şeye dokununca kapanıyor (yoksa
> gidilen yer çekmecenin arkasında kalıyor), ama **küme filtrelerinde
> kapanmıyor** — insan arka arkaya birkaç küme kapatıp açıyor.

**2. Müze `.stage`'in içine çiziliyordu, ekranın değil.** `.museum` kuralı
`position:absolute; inset:0` ve öğe `<main class="stage">` içinde. Masaüstünde
doğru — müze ray'in yanında duruyor, kasıtlı. Telefonda ise müze ray'in
altındaki kutuya sıkışıyordu: **yatayda 812×375'lik bir telefonda müzeye kalan
yükseklik 210 px'ti.** Birinci şahıs bir mekân için kullanılamaz.

Dar ekranda `.museum{position:fixed;z-index:60}`. Çalışmasının sebebi `.stage`'de
`transform`/`filter`/`will-change` olmaması — olsaydı fixed ona göre konumlanır,
hiçbir şey değişmezdi. **`.stage`'e dönüşüm eklerseniz bu kırılır.**

**3. Açılış ölçeği sabitti.** `openView()` her zaman `0.82` veriyordu; 375 px'lik
bir ekranda tek kart (300 px geniş) bütün görüntüyü kaplıyor, bunun bir kart
*manzarası* olduğu hiç anlaşılmıyordu. Artık `clamp(0.30, VW/980, 0.82)` —
telefonda üç kart yan yana, 980 px üstünde değer zaten 0,82'ye sıkışıyor, yani
**masaüstünde hiçbir şey değişmiyor.**

Bunlarla birlikte:

- **Dokunmatikte davet tamamen gizliydi.** Joystick yürümeyi anlatıyor ama
  bakmanın *sürüklemek*, seçmenin *dokunmak* olduğunu söyleyen hiçbir şey yoktu
  (`.mhelp` telefonda zaten gizli). Metin artık cihaza göre değişiyor.
- **Çentik ve alt çubuk.** Yüzen arayüz (üst bilgi, çıkış düğmeleri, joystick,
  sayaç) `env(safe-area-inset-*)` kullanıyor.
- **Yatayda joystick 126 → 104 px.** 375 px yükseklikte 126 px ekranın üçte
  birini yiyordu.
- **Çıkış düğmesine kenarlık ve gölge.** Düğme krem, müzenin tavanı da krem;
  parlak bir kadrajda çerçevesiz hâli tamamen kayboluyordu.

> **Emülasyonda sınandı, gerçek telefonda değil.** Tarayıcının cihaz emülasyonu
> `pointer:coarse`'u yalnız dar genişlikte veriyor, yani **yatay** telefonu
> dokunmatik olarak taklit edemiyor. Joystick ve dokunmatik davet mantığı
> orada doğrulanamadı; ölçüler ve CSS kuralları doğrulandı.

---

## Kritik teknik kararlar (bunları bozmayın)

**IIFE zorunlu.** Kod tepe seviyede `const N`, `const X` gibi adlar kullanıyor.
cdnjs'ten yüklenen UMD kütüphaneleri de aynı kapsamda kendi adlarını tanımlıyor ve
`Identifier 'N' has already been declared` hatasıyla o kütüphaneyi öldürüyor.
Her şey kapalı bir kapsamda. Konsoldan kurcalamak için `window.atlas` var.

**CSP — artık geçerli değil, ama izleri kodda.** Artifact ortamında yalnız
cdnjs, jsDelivr/npm ve code.jquery.com'dan **script** yüklenebiliyordu; dış
görsel, stil dosyası, iframe ve fetch yasaktı. Bugünkü kodun şu özellikleri
o kısıttan kalma: Swiper ve MapLibre'ın CSS'i elle yazılı, projelerin ekran
görüntüsü yok (tasarlanmış afişler var).

> GitHub Pages'e geçişle bu kısıt **kalktı**. Artık dış görsel, doku, HDRI ve
> GLTF yüklenebilir. Yeni iş (pavyon, gölge haritası, gerçek kapak görselleri)
> bunu kullanabilir; eski kodu geriye dönük sadeleştirmek gerekmez.

**Renk düzeni: saf beyaz ve saf siyah yok.** Ghibli arka planlarında en koyu
değer bile ılık bir zeytindir. Burada da öyle: `matDark` `#4A4F43`, kâğıt
`#F7F1E1`, mürekkep `#343A30`. Ayrımı asıl yapan tek satır `HemisphereLight`:
**tepesi sıcak (`#FFF6E8`), yeri soğuk (`#B6C2BC`)** — yukarı bakan yüzler ılık
krem, aşağı bakanlar (tavanlar) mavi-yeşil gölgede kalıyor. Yönlü ışıklar bunun
üstüne az miktarda biniyor (`.42` ve `.22`); daha fazlası döşemeyi beyaza patlatıp
her şeyi sepyaya çeviriyor, denendi.

**Katları avludan okutan şey korkulukların üstündeki kapak çizgisidir** — o
kapaklar bölüm rengini taşır. Kaldırırsanız kompozisyon dağılır.

**Müzenin bölüm renkleri atlasınkinden ayrı** (`CAT_MUSEUM`). Atlas kartlarında
10 kümenin t-SNE haritasında bir bakışta ayrılması gerekiyor — orada parlak ve
doygun olmaları işlevsel. Müzede aynı renkler mekânı soğutuyordu; burada aynı
anahtarların susturulmuş, topraklı kardeşleri var. Bir anahtar tabloda yoksa
atlasın `--cat-*` rengine düşer.

**Tekrar eden yapı instance'lı.** 200 m × 4 kat bir cam kaydı ızgarası, kolonlar,
çatı kirişleri, rampa dilimleri, aydınlatma bantları, banklar, saksılar, yapraklar
— mesh başına bir çizim çağrısıyla kalkmıyordu. `instanced()` hepsini dokuza
indiriyor; sahnede ~1050 nesne var. Liste öğesi `[x, y, z, yaw, pitch, ölçek]`.

**Canlı panolar bedava hareket.** 48 pano var; aynı anda en yakın **beşi** her
karede yeniden çiziliyor (`syncGlyphs`). Canvas 2D, CDN yok, kütüphane yüklenmiyor
— `LIBS[i].glyph` ve `LIBS[i].seed` zaten atlas tarafında var, `drawGlyph` zaten
zamana bağlı. Uzaktakiler boş kalmasın diye kurulurken birer kare çizilir.

**Işık ve hava geçişi.** Sahne bir render hedefine **bir kez** çizilir, sonra
tam ekran bir shader'dan geçer (`GFS`). Üç iş yapar: yumuşak parlaklık (12 örnekli
ucuz bloom), sıcak-soğuk ayrımı (aydınlıklar altına, gölgeler maviye), köşelerde
hafif kararma ve çok ince bir doku. Kenar yumuşatma render hedefini ekrandan
`SS`=1,5 kat büyük çizip küçülterek geliyor — WebGL1'de render hedefinde MSAA yok.
Ağır gelirse ilk kısılacak yer `SS`.

**Gökyüzü elle boyanmış bir canvas** (`skyTexture`), sahneye equirect arka plan
olarak veriliyor — böylece kamerayla gider, kırpılmaz, sise girmez. Cam paneller
saydam (`opacity .17`), yani gökyüzü gerçekten camdan görünür.

**Işık huzmeleri** (`shaftTexture`) toplamalı karıştırmayla çizilen düzlemler.
Derinlik **yazmıyor** ama derinlik **sınıyor**: döşemenin arkasına geçince
kesiliyor, önüne geçince parlıyor. Katı geometri kullanıp toplamalı karıştırınca
kenarları çizgi gibi duruyordu; kenarları eriten şey dokunun alfası.

**Vatoz: matematiği hazırdı, çizicisi değildi.** Kaynak bağımsız bir canvas
eskizi. O eskizin **çizicisi** 2B'ydi (ham piksel tamponuna toplamalı nokta
serpme) ama **matematiği zaten 3B**: `buildSpan()` her açıklık istasyonu için
gerçek bir z sapması ve yay uzunluğu korunmuş bir y üretiyor. Taşınan şey o
matematik; yerine `BufferGeometry` bağlandı. Yeniden yazılan bir şey yok.

- **Simülasyon kendi biriminde koşuyor.** Gövde 110 "piksel" ve bütün sürükleme,
  itki, dönüş katsayıları ona göre ayarlı. Metreye çevirmek ayarın tamamını
  bozardı; çıktı tek bir çarpanla (`S`) dünyaya haritalanıyor.
- **`createManta(TH, cfg)` kendi kapsamında.** Eskiz tepe seviyede `TAU`, `rnd`,
  `mx`, `sq`, `ex`, `clamp`, `T`, `P`, `rgb` gibi adlar tanımlıyor ve bunların
  **dokuzu** atlasın adlarıyla çakışıyordu. IIFE kuralı (yukarıda) tam da bunun
  içindi; modül bir fonksiyon kapsamına alınınca hepsi çözüldü.
- **Kanat gezen bir dalga.** Her açıklık istasyonu bir öncekinden geç çırpar.
  Yüzey **uzamaz**: `yc` dizisi her karede yay uzunluğunu koruyarak kuruluyor —
  kanat bükülür, gerilmez. İtki eğik yüzeydeki normal kuvvetin integrali ve iki
  vuruşta da pozitif; hayvan hamle atıp süzülüyor, çırpma frekansının iki katında.
- **Kuyruk bir tractrix.** Düğüm başına hız integrasyonu, kısıt izdüşümünün enerji
  enjekte etmesi yüzünden serbest ucu kare hızında çınlatıyordu. Bunun yerine
  kuyruk, kökün kendi geçmiş yörüngesini yay uzunluğuna göre yeniden örnekliyor:
  gövdenin geçtiği yerde duruyor, dolayısıyla titreyemez.
- **Desen deriye sabit.** Eskizde benekler anlık deforme y'den okunuyordu; nokta
  bulutunda kimse fark etmez, ama bir örgüde desen derinin üstünde kayar. Burada
  deforme olmamış açıklık koordinatı kullanılıyor.
- **Gövde ortada dolgun.** Yassı bir levha yandan bakınca çizgiye dönüyordu;
  kalınlık üsteli bir düşüşle (2.4) merkezde toplanıyor.

**Vatoz için avluda yapılan yer açma.** Orta avlunun **sağ** kuyusunda çapraz
köprü ve sarkan pankart yok — olsaydı hayvan içlerinden geçerdi. İkisi de sol
kuyuda duruyor. Ayrıca **giriş katında kuyuların tabanı** eklendi (eskiden avlu
dipsiz bir çukurdu): artık altına girip yukarı, camlı çatıya karşı silüetine
bakabiliyorsunuz. Galerilerden boşluğa düşme hâlâ engelli.

**Başarım: nerede yanıyordu.** Site takılmaya başlamıştı. Ölçüldü, sebepleri
bulundu ve tek tek kapatıldı. Bunları geri almayın:

| Neydi | Neden pahalıydı | Ne yapıldı |
|---|---|---|
| Müze açıkken **atlas döngüsü dönmeye devam ediyordu** | 160 kartın glyph çizimi, bağlantılar, mini harita, her karede bir `innerHTML` yazımı ve canlı demo bütçesi — hepsi görünmeyen bir ekran için | `frame()` başında `if(museumOn) return` |
| Müzede **22 m içindeki her canlı eser** bağlanıyordu | Orta avluda altısı birden; her biri kendi kütüphanesini kendi döngüsünde çalıştırıyor | En yakın **üçü**, ağırlardan (`HEAVY`: WebGL/model) yalnız biri. 30 m'ye kadar bağlı kalma payı var ki sınırda gidip gelmesin |
| Canlı eser dokuları **1024×1024** ve **her karede** yükleniyordu | 4 MB × 5 eser = **20 MB/kare** | Doku 512×512, yükleme iki karede bir. Eser düzlemi 2,7 m ve 10 m'den bakılıyor; fark görünmüyor |
| Kenar yumuşatma sabit `SS`=1,5 | Maliyet pencere alanıyla **kare** büyüyor: 1,5 kat = 2,25 kat piksel | Sabit **1,25**. Uyarlanır denetleyici **kaldırıldı** — aşağıdaki nota bakın |
| 1038 nesnenin **matrisi her karede** yeniden hesaplanıyordu | Yapının tamamı hareketsiz | Bir kez hesaplanıp `matrixAutoUpdate=false`. Vatoz hariç |
| Her döşeme, duvar, korkuluk, kiriş, çerçeve **ayrı bir nesneydi** | three her karede 1000'den fazla nesneyi tek tek kırpıp sıralıyordu — ve bu maliyet **pencere boyutundan bağımsız** | `mergeStatic()`: malzeme başına tek örgü. **Nesne 1038 → 285, çizim çağrısı 250 → 65** |

**Asıl sınav kamerayı döndürmektir.** Yürümek bir kare kaybını affeder, dönüş
affetmez: göz dönüşü birebir takip eder, 45 fps'nin altı "kare kare" okunur.
360° dönerken ölçülen en kötü kare:

| | en kötü kare |
|---|---|
| başta | **45,5 ms** |
| birleştirme + bütçe sonrası | **19,0 ms** |

Aynı anda: sahne çizimi 3,5 → 0,38 ms, doku yükü 1,19 → 0,31 ms, kendi iş
süremiz 4,1 ms (yani 16,7 ms'lik bütçede bol pay).

> **Uyarı:** ölçümler 647×397'lik bir tuvalde alındı. Bu boyutta sahne
> **piksel değil çizim çağrısı sınırlı** — birleştirme bu yüzden bu kadar
> işe yaradı. Büyük ekranda denge tersine döner ve asıl kaldıraç `ssNow`.

**Uyarlanır çözünürlük kaldırıldı — iyi bir fikir değildi.** Hikâyesi kayda
değer, çünkü aynı hataya düşmek kolay:

Denetleyici kare aralığına bakıp ölçeği düşürüyordu. Ama kare aralığı **vsync'e
kilitli**: 60 Hz'de 16,7 ms'nin altına inemez, dolayısıyla "boşta kapasite var"
diye bir sinyal hiç üretmez. Yazdığım geri-çıkma eşiği 13 ms'ydi — asla
sağlanamayacak bir koşul. Sonra tek yönlü yaptım; bu sefer şu oldu: sayfa
açılırken kütüphaneler indirilip ayrıştırılırken kareler zaten yavaş, denetleyici
bunu "makine yetmiyor" sanıp hemen düşürüyor ve **bir daha geri çıkmıyor**.
Kullanıcı kalıcı bulanıklık yiyor.

Üstüne: çözünürlük düşürmek **yalnız GPU sınırlıysa** işe yarar. CPU sınırlıysanız
hiçbir şey kazandırmaz, sadece bulanıklaştırır. Ölçmeden otomatikleştirilecek bir
şey değildi. Şimdi sabit 1,25; elle `atlas.mQuality(1.0)` hızlandırır,
`atlas.mQuality(1.5)` keskinleştirir.

**Kamera baştan yazıldı.** Dört ayrı hata vardı ve **hiçbiri kare hızıyla ilgili
değildi** — "buggy" hissinin gerçek kaynağı bunlardı:

| Neydi | Şimdi |
|---|---|
| Fare kilidi **çift tıklamayla** açılıyordu; kimse tahmin edemez. Kilit yoksa düğmeyi basılı tutup sürüklemek gerekiyordu | **Tek tıkla** kilit, ekranda "Bakmak için tıklayın" daveti |
| **Escape sizi müzeden atıyordu**: tarayıcı kilidi bırakıyor, tuş işleyicimiz de `exitMuseum()` çağırıyordu | Escape yalnız fareyi bırakır; çıkmak için bir daha basılır |
| **Nişangâh yoktu** — neye tıkladığınız görünmüyordu | Nişangâh var, tıklanabilir bir şeyin üstünde büyüyüp renk değiştirir |
| "Bakmak için tıklayın" daveti **hiç gitmiyordu** (kilit açılmayan ortamlarda bütün deneyim boyunca ekranda kalıyordu) | İlk bakıştan, ilk adımdan ya da 14 saniyeden sonra sönerek gider |
| 7 pikselden küçük sürüklemeler "tıklama" sayılıyordu; küçüğü yanlışlıkla modal açıyor, büyüğü hiçbir şey yapmıyordu | Kilitliyken bakış ve seçme **hiç karışmaz**: fare bakar, tıklama nişangâhın altındakini seçer |

Ayrıca iki duyarlılık tek değere indi (`SENS`) ve bakışa ~40 ms zaman sabitli
hafif bir yumuşatma kondu: 60 fps'te fark edilmez, kare hızı düştüğünde sertliği
alır.

**Kilit her ortamda mümkün değil.** Gömülü çerçevede tarayıcı `WrongDocumentError`
ile reddediyor. O yüzden tıklama aynı anda **sürükle-bak** için de hazırlanıyor:
kilit açılırsa bakış `movementX`'ten gider, açılmazsa sürükleyerek bakmak çalışır
ve kısa dokunuş seçer. Hiçbir durumda kilitlenip kalınmaz.

**Başarım sayacı ve yavaş kare kaydı.** Üç tur boyunca körlemesine optimize
ettim, çünkü ölçüm sizin makinenizde değil benimkindeydi. Bu onu bitiriyor:

- Müzede **`` ` `` tuşu** sayacı açıp kapatır (`atlas.mMeter()` de olur).
- Sayaç: fps, kare ve iş süresi, ölçek, çizim çağrısı, canlı demo sayısı ve
  **aşama aşama** dağılım — sahne, geçiş, vatoz, pano, afiş, hareket.
- 33 ms'yi aşan her kare bağlamıyla kaydediliyor: nerede duruyordunuz, dönüyor
  muydunuz, kaç demo çalışıyordu, hangi aşama ne kadar sürdü.
- `atlas.mLog()` özeti verir (adet, ortanca, en kötü, dönerken kaçı, aşama
  ortalamaları, son 10 kayıt). `atlas.mLogTemizle()` sıfırlar.

Ölçülen (998×720 tuval, koridor, iki canlı demo, yerleşmiş): sahne 1,58 ·
vatoz 1,56 · pano 0,12 · geçiş 0,06 · afiş 0,004 — **toplam 3,33 ms**, yani
16,7 ms'lik bütçede beş kat pay. Sıradaki kaldıraç vatozun kanat normalleri
(`computeVertexNormals`, iki karede bire indirilebilir).

**Koridor bölmelerinde kapılar var, ve duvarlar artık çarpıştırılıyor.**
Uzun süre iki ayrı hata birlikte durdu: bölme duvarı bandın boyunca
**kesintisizdi** (koridordan kanada geçmenin meşru bir yolu yoktu) ve hareket
kodu **yalnız zemini sınıyordu** (duvarlar hiç sınanmıyordu). Sonuç: rampaya
ulaşmak için duvarın içinden geçiliyordu.

Şimdi her bandın iki ucunda 2 m'lik kapı boşluğu var — bilerek uçlarda, yani
tam avlu ağızlarında, rampaların başladığı yerde. Boşluğun kenarında koyu
söveler var ki duvar "kesilmiş" değil "kapılı" okunsun. `crossesWall()` hareketi
sınıyor: bölmeler eksene dik olduğu için sınama ucuz (32 parça, hareket
x=±SPINE_X'i kesiyor mu, kestiği z kapıda mı).

> Kapılar duvarı kısaltınca kanat başına yuva 30'dan **26'ya** indi. Pano oranı
> beşte birden **altıda bire** çekildi: 22 afiş yuvası kalıyor, en kalabalık
> bölüm de tam 22 iş. Bu sayılar birbirine kilitli — kapı genişliğini
> değiştirirseniz yuva sayımını da yapın.

**Yürüyüş.** Fizik motoru yok. Her karede ayağın altındaki döşeme aranır
(`floorAt`), yükseklik yumuşatılır. Rampalar bu sayede kendiliğinden çalışır ve
boşluğa adım atılamaz.

**Standalone farkı.** Artifact sarmalayıcısı doctype, `<meta charset>` ve
`body{margin:0}` sağlıyor. Dışarıda bunlar `derle.py` tarafından ekleniyor.
`body{margin:0}` olmadan `100dvh` ızgarası taşar; charset olmadan Türkçe bozulur.

---

## Veri nereden geldi

**Kütüphaneler (162).** Editoryal yargı. Ağırlık, yıldız, yıl **yaklaşık**.
13 eksenlik vektörler elle yazıldı; arayüzde de böyle söyleniyor.

**Projeler (118).** `mertseven.com/digijournalism` kataloğundan, ham HTML
ayrıştırılarak. 124 bağlantının hepsi tarandı (`veri/link-taramasi.tsv`):

- **80 canlı**
- **38 engelli** — NYT, Bloomberg, Washington Post otomatik erişimi kesiyor.
  WaPo'nunki Akamai "Access Denied"; gerçek tarayıcıyla doğrulandı. **Ölü değil.**
- **6 ölü** — kataloğa alınmadı: Al Jazeera *Syria's Refugees*, NatGeo *Megaregions*,
  Adam Westbrook *The Divorce*, SRF *Gotthard 360*, The Intercept *Best of luck with
  the wall*, LA Times Data Desk.

**Kütüphane ataması tahmin değil.** 61 canlı sayfanın kaynak kodu indirilip
26 imza arandı (`d3.min.js`, `THREE.WebGLRenderer`, `L.map(`, `scrollama`…).
**19 projede** kanıt çıktı. Arayüzde "bununla yapıldı" değil **"sayfa kaynağında
tespit edildi"** diye yazıyor, üçüncü taraf betiği uyarısıyla. Bu çerçeveyi koruyun.

---

## Neyin doğrulandığı

Holmdel planı tarayıcıda sınandı (`atlas.mFloorAt` ile, yürüyüş kurallarının
aynısıyla):

- Omurga baştan sona (z=93 → −100, 193 m) **kesintisiz**; üç avludan da geçiliyor,
  hiç yükseklik sıçraması yok. (Sondaki engellenen adımlar bina duvarı.)
- Rampalar pürüzsüz: kat 0 → kat 1 tırmanışında en büyük adım **0,091 m**.
- Kuyuya yanlışlıkla **düşülemiyor**: koridordan avluya doğru yürüyüş kenarda duruyor.
- Giriş noktasından **sekiz kanadın ve dört katın hepsine** yürüyerek ulaşılıyor
  (ızgara taraması: 40 818 erişilebilir hücre).
- Müzedeki **canlı demolar yaklaşınca bağlanıyor** (avlunun ortasında 5 demo aynı
  anda çalışıyordu) — bu daha önce test edilmemişti.
- **Canlı panolar** çalışıyor: 48 pano, aynı anda 5'i çiziliyor.

Pavyon ve kampüs de aynı yöntemle sınandı (`atlas.mCanStep`, 0,25 m'lik adımlar):

- Doğuş noktasından kapıya **304 adım**, kapıdan pavyonun avlusuna **108 adım** —
  kesintisiz.
- Cam cepheden **çıkılamıyor**: yandan x=30'da, arkadan z=−100'de duruluyor.
  Yalnız kapı açık.
- Pavyonun duvarından **geçilemiyor** (z=142,3'te duruluyor); girişten geçiliyor.
- Nişangâh göz hizasında künyeye değiyor, tıklama modalı açıyor: başlık, ekip,
  açıklama, etiketler ve üç kanal bağlantısı doğru geliyor, kart projenin kendi
  rengini alıyor.
- Dokuz kapağın dokusu yaklaşınca yükleniyor; konsolda hata yok.
- Ölçülen: 998×720 tuvalde **kendi iş süremiz 2,5–3,9 ms**, 60 fps. Pavyonun
  eklediği nesne sayısı 279 → 312, döşeme 62 → 66.

> Not: `floorAt` artık yalnız yukarı değil, **iki yönde de** 1,8 m'lik bir bantla
> çalışıyor. Eskiden "altındaki en yüksek döşeme" aranıyordu; bu, altında rampa
> olan bir galeri kenarından boşluğa adım atılmasına izin veriyordu.

---

## Bilinen eksikler / sıradakiler

1. **İnce ayar.** Katların okunması, renk, ışık ve hareket çözüldü. Kalan iş
   zevk meselesi: bitki yoğunluğu, pankart sayısı, renk doygunluğu, tavan tonu.
   Hepsi birer sabit — fazla gelirse çıkarmak kolay.
2. **Joystick gerçek telefonda hâlâ denenmedi.** Kod yolu hazır ve dikey
   telefonda (375×812) emülasyonda göründüğü doğrulandı, ama **yatay** telefon
   emüle edilemiyor — tarayıcı o boyutta `pointer:coarse` vermiyor. Elinizdeki
   telefonla bir kez açın, bu madde ancak öyle kapanır.
3. **Büyük ekranda ölçüm yok.** Başarım işi yapıldı (yukarıdaki tablo) ama
   ölçümler 647×397'lik bir tuvalde alındı. Hâlâ takılıyorsa sırayla:
   `atlas.mQuality(1.0)` (en büyük kaldıraç), `syncGlyphs`'teki 5 sınırı,
   canlı eser bütçesindeki 3, bitki sayısı, `uBloom`. Sayı bildirmek için
   `atlas.mProfile()`.
4. ~~Mobilde atlas tarafı dar kalıyor.~~ **Bitti** — yukarıdaki "Telefon"
   bölümüne bakın. Kalan tek şey gerçek cihazda denemek.
5. **Klavyeyle gezinme** atlas tarafında yok.
6. Kalan 134 kütüphanenin canlı demosu yok; bir kısmı yapısal olarak imkânsız
   (kamera, medya dosyası, derleme adımı isteyenler) — bunlara "neden olmadığını"
   söyleyen bir etiket iyi olur.
7. **Vatoz kontrol paneli DOM üstü.** Konsola tıklayınca açılıyor ama panel bir
   ekran arayüzü; mekânın içinde okunan fiziksel bir gösterge değil. İstenirse
   kaydırakların değerleri konsolun eğik yüzüne de yazdırılabilir.
8. **Vatoz tek.** `createManta` birden çok çağrılabilir ama sürü davranışı
   (birbirinden kaçınma) taşınmadı — eskizdeki `rays` döngüsü tek hayvana indi.
9. ~~Yayınlanan Artifact eski.~~ **Bitti** — GitHub Pages'te yayında,
   mertseven.com/etkilesim-atlas. Konsolda gerçek hata yok; Edge'in
   "Tracking Prevention blocked access to storage" satırları hata değil,
   tarayıcının üçüncü taraf kaynaklara *depolama* erişimini kesmesi
   (betikler yükleniyor, demolar çalışıyor).
10. **Dither'lı sürümün yedeği** `src/yedek/_p7-dither.js.yedek` dosyasında duruyor.
   Sürüm denetimi olmadığı için alınmıştı; artık git var, geri dönmeyecekseniz silin.
11. **Pavyonun avlusu boş.** Nişler doğru ama ortada hiçbir şey yok — müzedeki
   bitki/bank/pankart karşılığı burada henüz yapılmadı. Bir de gölge: kampüsün
   asıl görsel sıçraması statik gölge haritası ve pişmiş köşe karartmasında
   (yapı hareketsiz olduğu için ikisi de kare başına bedava). Pavyon bunun için
   doğru laboratuvar: küçük sahne, hızlı doğrulama, sonra müzeye taşınır.
12. **Kampüs tek pavyonla başlıyor.** Plan her mezuniyet dönemine bir halka
   ekleyecek şekilde kuruldu ama ikinci halkanın nereye oturacağına, ve
   birden çok halka varken `PAV_Z`/`PAV_N`'in nasıl dizileceğine karar
   verilmedi. Şu an ikisi de tek bir pavyon varsayıyor.
13. **Dış zeminde yalnız iki malzeme var** (ot ve taş yol). Ağaç, çit, oturma
   yeri, aydınlatma direği yok; bina dışarıdan hâlâ bir maket gibi duruyor.

---

## Faydalı kancalar

Tarayıcı konsolunda:

```js
atlas.enterMuseum()            // müzeye gir
atlas.mTeleport(kat, yan, z)   // kat 0-3; yan -1/+1 (kanat) ya da 0 (omurga); z isteğe bağlı
atlas.mLook(yaw, pitch)        // bakış açısını kur — kadraj ayarlarken
atlas.mStats()                 // döşeme/rampa/afiş/nesne sayısı, çalışan demo, konum
atlas.mFloorAt(x, z, curY)     // ayağın altındaki döşeme; güzergâh sınamak için
atlas.manta()                  // vatozun hızı, itkisi, dünya konumu, yönü
atlas.mPanel(true|false)       // vatoz kontrol panelini aç/kapa
atlas.mProfile(n)              // her aşamanın gerçek maliyeti (ms), çizim çağrısı, üçgen
atlas.mQuality(1.0 … 1.5)      // çözünürlük ölçeği; argümansız okur (fps, kare/iş ms, boyutlar)
atlas.mMeter(true|false)       // ekrandaki başarım sayacı (` tuşu da açıp kapatır)
atlas.mLog() / mLogTemizle()   // yavaş karelerin bağlamlı dökümü
atlas.mAim()                   // nişangâhın altında ne var
atlas.mGuide(true|false)       // rehber ekranı (Tab da açar)
atlas.mPavyon()                // pavyonun avlusuna ışınla (200 m yürümemek için)
atlas.mCanStep(ax,az,bx,bz,y)  // bu adım atılabilir mi — zemin VE duvar
atlas.mOpen(i)                 // i numaralı projenin modalını aç
```

Atlas tarafı:

```js
atlas.goStop(n)                // tur durağı  (BENİOKU uzun süre "goStation"
                               //  yazıyordu; öyle bir kanca hiç olmadı)
atlas.overlaps(0)              // kartlar çakışıyor mu (0 olmalı)
atlas.fitAll() / atlas.centerOn(i)
atlas.select(i) / atlas.toggleWing(i)
atlas.LIBS / atlas.cards / atlas.view
```
