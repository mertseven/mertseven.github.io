# Proje İndeksi — mertseven.github.io

Tarama tarihi: 2026-10-21 · Alan adı: mertseven.com · Dal: `main`

Kökte 14 HTML sayfası ve 37 klasör var; aşağıda 48 kayıt listeleniyor. Tech stack bilgisi sayfalardaki `<script>`/`<link>` etiketlerinden, amaç bilgisi başlık, H1 ve kısa kod incelemesinden çıkarıldı. Kodu tam okumadığım yerlerde amaç sütununa **(çıkarım)** yazdım.

**Genel stack:** Tüm site statik HTML + CSS + vanilla JavaScript. Derleme adımı, framework, backend veya veritabanı yok. GitHub Pages üzerinde (`.nojekyll`, `CNAME`).

| Kategori | Kayıt |
|---|---|
| A. Site çekirdeği | 8 |
| B. Portföy projeleri (`projects.html`'de linkli) | 12 |
| C. Ders / eğitim / değerlendirme | 11 |
| D. Deney ve prototipler | 9 |
| E. Eski sürüm / kopya | 5 |
| F. Boş / yer tutucu | 3 |

---

## A. Site çekirdeği

| Proje | Konum | Amaç | Tech stack | Keyword |
|---|---|---|---|---|
| Ana sayfa | `index.html` | Portföyün giriş sayfası (Digital Crafter & New Media Scholar) | HTML, CSS (`homepage.css`, `style.css`), JS (`homepage.js`, `script.js`), Google Fonts | portföy, ana sayfa, kişisel site |
| Projects | `projects.html` | Projelerin listelendiği vitrin | HTML, CSS, JS (`css/projects.css`, `js/projects.js`), Google Fonts | portföy, proje listesi |
| Research Output | `publications.html` | Yayın ve araştırma çıktıları | HTML, CSS, JS (`publications.css/js`), pdf.js 3.4.120 | akademik yayın, PDF, araştırma |
| About & Contact | `contact.html` | Hakkında ve iletişim | HTML, CSS, JS (`contact.css/js`), Google Fonts | iletişim, biyografi |
| Doktora tezi | `dissertation.html` | Doktora tezinin tarayıcıda gösterimi | HTML, pdf.js, `Seven_Tez.pdf` | tez, PDF görüntüleyici |
| The Design Cookbook | `design-system.html` | Sitenin tasarım sistemi dokümanı | HTML, CSS, Google Fonts | tasarım sistemi, bileşen, tipografi |
| 404 "Space Oddity" | `404.html` | Özel hata sayfası | HTML, CSS, JS | 404, uzay teması |
| Destek dosyaları | `css/`, `js/`, `images/`, `lib/`, `visuals/`, PDF'ler | Ortak stil, betik, görsel, font; `lib/` içinde rss.xml ve metadata.json; CV ve tez PDF'leri | CSS, JS, SVG/JPG/PNG, RSS | varlık, RSS, CV |

## B. Portföy projeleri

| Proje | Konum | Amaç | Tech stack | Keyword |
|---|---|---|---|---|
| Journalism Studio News | `jstudio/` | Yaşar Üniversitesi öğrenci gazetecilik projeleri platformu: arşiv, makale, ekip, kaynaklar, makale oluşturma, haber dosyaları (`kentorman`, `kulturpark`) | HTML, Tailwind (CDN), Leaflet 1.9.4, Material Icons, vanilla JS, arka plan videoları | gazetecilik, öğrenci projeleri, haber sitesi, harita, arşiv |
| Network Canvas | `networkcanvas/` | Ağ verisini görselleştirme ve analiz aracı (topluluk tespiti, dışa aktarma) | D3 v7, jsnetworkx, graphology + Louvain, jstat, html2canvas, save-svg-as-png, vanilla JS (19 modül, 24 CSS) | ağ analizi, graf, topluluk tespiti, Louvain, veri görselleştirme |
| Philosophical Networks | `philosophical-networks/` | Felsefe akımlarını fikir ağı olarak gösteren 7 sayfalık seri: Bergson, Aydınlanma, Hegel, Leninizm, Marksizm, Nietzsche, Romantizm | D3 v7, vanilla JS (15 dosya), Google Fonts | felsefe, fikir ağı, force-directed graph, D3 |
| Critical Theory | `critical_theory/` | Frankfurt Okulu'nu hiyerarşik edge bundling ile görselleştirme | D3 7.8.5, Google Fonts | eleştirel kuram, Frankfurt Okulu, edge bundling |
| Curriculum Whiteboard | `curr-wb/` | Yeni Medya ve İletişim müfredatı: öğretim üyeleri ve iş yükü planlama | D3 v7, vanilla JS, Google Fonts | müfredat, iş yükü, planlama, whiteboard |
| Digital Journalism | `digijournalism/` | Dijital gazetecilik iş akışı, araçlar, örnekler; `journalism-lifecycle.html` haber yaşam döngüsü | HTML, CSS, vanilla JS (2 sayfa) | dijital gazetecilik, iş akışı, araçlar |
| Project KAFKA | `kafka/` | **(çıkarım)** Kamera ile el takibine dayalı etkileşimli görsel/sanat denemesi | p5.js 1.9.0, MediaPipe Hands, MediaPipe drawing_utils | el takibi, bilgisayarlı görü, p5.js, kamera, etkileşim |
| Knowledge & Research | `know_res/` | Bilgi ve araştırma kavramlarını ağ canvas'ında gösteren sayfa | Canvas API, Font Awesome 6.4, vanilla JS | bilgi, araştırma, ağ, canvas |
| Socrates | `socrates/` | "Socrates' Quest for Knowledge": Sokrates'in bilgi arayışının etkileşimli anlatımı | D3 v7, vanilla JS, görsel (`ancient-athens.png`) | Sokrates, felsefe, hikâye anlatımı, D3 |
| Fortune Wheel | `wheel-html.html` | "Moonbase I" şans çarkı | Canvas API, `css/fortune-wheel.css`, `js/fortune-wheel.js` | çark, oyun, canvas |
| Jury Form Builder | `form-builder.html` | Bitirme projesi jüri formlarını oluşturan araç | HTML, vanilla JS (`js/form-builder.js`), Google Fonts | form, jüri, değerlendirme, rubrik |
| Design Cookbook | `design-system.html` | A kategorisiyle ortak kayıt | — | tasarım sistemi |

## C. Ders / eğitim / değerlendirme

| Proje | Konum | Amaç | Tech stack | Keyword |
|---|---|---|---|---|
| Interactive Media Applications lab | `ima/lab/` | Etkileşim kavramlarını öğreten ders laboratuvarı. 8 deney: Agency (Key Orchestra), Reciprocity (Eye Field), Feedback (Mini Sequencer), Temporality (Ghost Chase), Possibility (Sand Box), Context (Letter Rain), Emergence (Boundary Lines), Intervention (Shhh Plant); ayrıca `island/`, `tools/`, kaynakça ve araştırma notları | Three.js (her deneyde yerel `vendor/`), vanilla JS modülleri, HTML/CSS, Python `http.server`, `BASLAT.cmd`; 416 dosya, 34 MB | interaktif medya, etkileşim tasarımı, ders, deney, üç boyut, WebGL |
| Etkileşim Atlası | `etkilesim-atlasi/` + `etkilesim-atlas.html` | Gazetecilikte kullanılan 162 JS kütüphanesi ve onlarla yapılmış 118 işi haritalayan atlas | Python (`derle.py`) ile kaynaklardan tek HTML üretimi, vanilla JS (9 modül), JSON veri, Google Fonts | kütüphane kataloğu, veri gazeteciliği, atlas, derleme betiği |
| NMED Showcase | `grad-projects/` | Yaşar Üniversitesi Yeni Medya ve İletişim 2025–2026 bitirme projeleri vitrini ("Sahadan Yeni Medyaya") | HTML, CSS (4 dosya), JS, QR stilleri, Google Fonts | bitirme projesi, vitrin, QR, öğrenci işleri |
| Jüri formu | `juryform.html`, `files/` | Yeni Medya bitirme projesi I jüri değerlendirme formu; Word ve PDF sürümleri de var | HTML, CSS, vanilla JS, `.docx`, `.pdf` | jüri, değerlendirme, form |
| Icebreaker oturumu | `meet/` | Derste tanışma oyunu: öğretmen paneli ve öğrenci cevap ekranı | PeerJS 1.5.2 (eşler arası bağlantı), qrcodejs, HTML/CSS | gerçek zamanlı, QR, PeerJS, sınıf içi etkileşim |
| Collaborative Conflict Observatory | `conflict.html` | Çatışmanın ortak gözlemlendiği çok kullanıcılı sayfa | PeerJS 1.5.2, HTML/JS | işbirliği, çatışma, P2P, gözlem |
| Weather Recommendation App | `nmed1110/web-app.html` | NMED 1110 ders ödevi: hava durumuna göre öneri uygulaması | HTML, tek dosya | hava durumu, ders ödevi, öneri |
| Üretken yapay zeka destekli haber yazımı | `yapayzeka.html` | Üretken YZ ile haber yazımı araştırmasının sunumu | HTML/CSS tek dosya **(çıkarım)** | yapay zeka, haber yazımı, araştırma |
| Moonbase I – Literary Works | `writing.html` | Edebi yazılar sayfası | HTML, CSS (`css/writings.css`), `js/writings.js`, Google Fonts | edebiyat, yazı, Moonbase |
| İnciraltı Kent Dosyası | `kentdosyasi/` | İnciraltı imar planı değişikliği üzerine haber dosyası | Tailwind (CDN), Leaflet 1.9.4, Material Icons, PNG karşılaştırma görselleri | imar planı, İzmir, harita, haber dosyası |
| IMA yardımcı sayfaları | `ima/lab/tools/portraits.html`, `ima/lab/bibliography.html` | Atlas portre üreticisi ve ders kaynakçası | HTML, JS | portre, kaynakça |

## D. Deney ve prototipler

| Proje | Konum | Amaç | Tech stack | Keyword |
|---|---|---|---|---|
| Find the University! (v1) | `compass/` | Konum ve pusula yönüne göre Ege Üniversitesi'ni gösteren ok | Geolocation + cihaz yönü (DeviceOrientation), haversine hesabı, vanilla JS | pusula, GPS, mobil, yön |
| Find the University! AR | `compass2/` | v1'in AR odaklı sürümü | aynı, HTML/CSS/JS | AR, pusula, mobil |
| AR Indoor GPS Test | `compass3/` | İç mekan AR/GPS denemesi **(çıkarım)** | HTML/CSS/JS | AR, iç mekan, test |
| Secure Login System | `login-page/` | "Not So Secure Access Portal": giriş ekranı denemesi | HTML, CSS, JS | giriş, güvenlik, şaka/demo |
| Donate – Animal Friends | `testingtesting/` | Bağış sayfası arayüz denemesi | HTML, CSS, JS, Google Fonts | bağış, arayüz denemesi |
| Visualizing SEP | `visualizing/` | Stanford Felsefe Ansiklopedisi'ni ağ olarak görselleştirme | D3 v7, JSON veri (3 dosya), JS (5 dosya) | SEP, felsefe, graf, veri |
| Mind/Shift | `Yeni klasör/` | "Düşünceyi yeniden kur" temalı tek sayfa; tema tercihi tarayıcıda saklanır | HTML, CSS, JS, `localStorage`, Google Fonts | düşünme, tema, tek sayfa |
| Atlas kapak varlıkları | `atlas-varlik/kapak/` | Etkileşim Atlası kapak görselleri (9 dosya) | PNG/görsel | kapak, görsel varlık |
| Kişisel sayfa denemesi | `C010/` | Markdown ve HTML alıştırması ("Mert Seven'in web sayfası") | HTML, Markdown | alıştırma, markdown |

## E. Eski sürüm / kopya

| Proje | Konum | Amaç | Tech stack | Keyword |
|---|---|---|---|---|
| Eski site v1 | `v1-web/` | Sitenin önceki sürümü (tez sayfası dahil) | HTML (4), CSS (4), JS (3), pdf.js | eski sürüm, arşiv |
| Eski site v0 | `vo-web/` | Daha eski, yalnız 6 HTML sayfası | HTML, pdf.js | eski sürüm, arşiv |
| Curriculum Master | `curriculummaster/` | `curr-wb/`'nin kopyası (içerik farklı, büyük olasılıkla eski) | D3 v7 | kopya, müfredat |
| Curriculum Program | `curr-prog/` | Aynı projenin ara sürümü | HTML/CSS/JS | kopya, müfredat |
| Jüri dosyaları kopyası | `files/` | `form-builder` ve `juryform`'un kopyaları (kökteki dosyalarla hash'leri farklı) | HTML, JS, docx, pdf | kopya, jüri |

## F. Boş / yer tutucu

| Konum | İçerik |
|---|---|
| `preview/` | Boş klasör |
| `NMED3232/` | Yalnızca `123.txt` |
| `NMED3250/` | Yalnızca `1` adlı dosya |

---

## Açık sorular
1. `ima/lab` bu repoda ve `Desktop\ima` altında duruyor. Hangisi güncel kaynak?
2. `etkilesim-atlasi/` kaynağı ile kökteki derlenmiş `etkilesim-atlas.html` birlikte mi tutulacak?
3. E ve F kategorisi silinsin mi, `arsiv/` altına mı taşınsın?
4. KAFKA, compass3, yapayzeka ve nmed1110 için amaç sütunu çıkarım; doğru mu?
