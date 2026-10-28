# Interaction Island — web sitesi kaynak paketi

Bu paket **HTML, CSS ve JavaScript ile çalışan statik bir web sitesidir**. npm kurulumu, derleme, uygulama sunucusu, hesap sistemi veya veritabanı gerektirmez.

## Açma

1. ZIP'i tamamen bir klasöre çıkarın.
2. Windows'ta `BASLAT.cmd` dosyasına çift tıklayın. Python 3 varsa yerel dosya sunucusu başlar ve tarayıcı açılır.
3. Kapatmak için sunucu penceresinde Ctrl+C kullanın.

Alternatif: bu klasörde `python -m http.server 8000` çalıştırıp `http://localhost:8000` adresini açın. VS Code Live Server veya herhangi bir statik hosting de kullanılabilir.

Python yalnız geliştirme sırasında dosyaları tarayıcıya sunar; sitenin bir backend'i değildir. ES modülleri ve kamera/mikrofon izinleri nedeniyle `index.html` dosyasını `file://` ile çift tıklayarak açmak yerine yerel sunucu kullanın. İnternete koyarken HTTPS kullanın.

## İçerik

- Ana sayfa, sekiz premise/promise bölümü ve her bölümde Lesson, Experiment, Examples & reading, Remix sekmeleri.
- Mevcut `ada-c2` adasının oynanabilir kopyası ve sekiz oyunu.
- Adadan bağımsız açılan sekiz deney. Her biri yalnız kendi mekânını, karakterlerini ve oyununu yükler.
- Derslerde indirilebilen sekiz bağımsız kaynak ZIP'i.
- Yerel Three.js 0.160.0, yerel fontlar ve lisansları.
- Orijinal karakter tarifleri, desen atlası ve kontur motoruyla yeniden üretilmiş temiz beyaz zeminli ana sayfa karakter görselleri. Katalog kesitleri kullanılmaz.
- Sekiz derste akademik açıklamalar, seçili okumalar, karşı görüşler ve deney/remix bağlantıları. Öğrenme hedefleri geniş bir alanda gösterilir; dar sağ sütun ve Reflection sekmesi bulunmaz.
- 35 eserlik tam kaynakça ve öğretim yaklaşımı sayfası. Akademik yayınlar ile sanatçı/proje dokümantasyonu ayrı etiketlenir.
- Tam genişlikte, kırpılmadan gösterilen ada footer’ı; korunan logo, Mert Seven, PhD tasarım kredisi, Claude/ChatGPT işbirliği metni, website ve e-posta bağlantıları.

## Dosyalar

```text
index.html                 Ana sayfa ve derslerin ortak yapısı
style.css                  Web sitesinin görünümü ve mobil düzeni
research.css               Onaylanan geniş ders düzeni ve akademik kaynak kartları
footer.css                 Onaylanan tam genişlikte footer ve iletişim alanı
bibliography.html          Öğretim yaklaşımı ve 35 eserlik kaynakça
assets.html               Karakter, mekân, ada planı, stil, font ve motoru seçip tek ZIP indirme sayfası (assets.css, js/assets.js)
js/modules.js              Sekiz bölümün metinleri, görevleri ve kaynakları
js/research.js             Akademik künyeler, bölüm açıklamaları ve okuma soruları
js/library.js              Ders sekmeleri, karakter görünümü ve indirmeler
js/home.js                 Ana sayfa ve koleksiyon gezintisi
js/footer.js               Footer’ın mevcut derslere ve kaynaklara geçişleri
js/site-state.js           Tarayıcıda yerel durum ve URL gezintisi
js/character-engine.js     Orijinal karakter ve desen atlası motoru
assets/characters/         Temiz üretilmiş karakter görselleri
assets/footer/             Footer sahnesi, korunan logo ve yerel iletişim ikonları
assets/fonts/              Yerel font dosyaları
assets/vendor/             Three.js
island/ada-c2/index.html    Tam oynanabilir ada
experiments/               Sekiz bağımsız, düzenlenebilir oyun
downloads/                Aynı oyunların indirilebilir ZIP'leri
licenses/                  Üçüncü taraf lisansları ve font kaynakları
tools/                     Karakter görsellerini yeniden üretmek için sayfa ve tarif listesi
research-notes/             Açıklamalı araştırma dosyası, JSON ve BibTeX kaynakça
```

## Düzenleme ve paylaşma

Temel ders metinlerini `js/modules.js`, akademik katmanı `js/research.js`, tasarımı `style.css` ve `research.css` üzerinden düzenleyin. Her bağımsız oyunun kendi `script.js`, `style.css`, `index.html` ve `README.md` dosyaları vardır. `script.js` içindeki `design`, `knobs`, `tasks` ve `make(ctx)` bölümleri oyunun kurallarını değiştirmek için başlangıç noktalarıdır. Ortak 3D motoru ve arayüz kabuğu ayrıca `engine.js`, `runner.js`, `shell.js` olarak bulunur.

Bağımsız oyun dosyalarını değiştirdiğinizde sitedeki indirme bağlantısının da güncel olması için ilgili `downloads/*.zip` arşivini yeniden oluşturun. Dosyaları bir web sunucusuna yüklerken klasör yapısını koruyun. Alan adı kökünde veya bir alt klasörde çalışabilir; bağlantılar görelidir.

## Çevrimdışı kullanım

Ana sayfa, dersler, ada, oyunlar ve kaynak indirmeleri harici CDN gerektirmez. Örnek eserler ve further reading bağlantıları dış sitelere gider, dolayısıyla onların açılması internet gerektirir. Kamera/mikrofon ancak ilgili deneyde izin düğmesiyle açılır; her ikisinin de alternatif giriş seçeneği bulunur. Ses üretimi tarayıcı etkileşiminden sonra başlar. 3D sahneler WebGL gerektirir.

## Lisans ve atıflar

Three.js ve font lisansları `licenses/` içinde yer alır. Ada, karakterler, ders içeriği ve oyun kaynakları mevcut projenizden türetilmiştir; bu paket bunlar için yeni bir açık kaynak lisansı tanımlamaz. Örnek eserlerin sahipleri ders kaynaklarında ve oyunların `source` alanlarında belirtilmiştir. Ders sunumunun PowerPoint dosyası bu pakete dahil değildir.

Akademik metinlerin tam kopyaları pakete dahil edilmez; yayın kaydına, yazar/kurum kopyasına veya örnek bölüme bağlantı verilir. Bazı kitap ve makaleler için kütüphane erişimi gerekebilir. Her eserin bu araştırmada hangi düzeyde incelendiği `research-notes/ACIKLAMALI-KAYNAKCA.md` dosyasında açıklanır. Sekiz premise/promise çifti dersin pedagojik sentezidir; kaynakça, platformun öğrenme etkisinin ölçüldüğü anlamına gelmez.
