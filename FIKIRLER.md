# Fikirler — mertseven.com yeni site

Ana sayfa ve site için biriken fikirler. Yapılan bir fikir "Yapıldı" bölümüne taşınır, vazgeçilen "Rafta" bölümüne.

Zahmet: **çok az** (bir saatten az) · **az** · **orta** · **yüksek**

---

## Sıradakiler

### 1. Yazarken dalga
Arama kutusuna her harf yazılınca kutunun altında hafif bir su halkası oluşur, balıklar dağılır. Motorda hazır bir `splash` fonksiyonu var.
Zahmet: az

---

## Havuz

### "Şu an" satırı
Footer'da tek satır, örneğin "Currently: teaching Interactive Media Applications at Yaşar University". Ziyaretçi kimin sitesinde olduğunu aramadan anlar.
Zahmet: çok az

### Ses düğmesi
Referans görselindeki gibi sağ altta, varsayılan olarak kapalı. Açılınca hafif su altı ambiyansı çalar.
Zahmet: az (ses dosyası bulmak ya da üretmek hariç)

### "Surprise me"
Arama kutusunun yanında küçük bir düğme ya da `?` tuşu; rastgele bir proje açar. Kimsenin aramayı bilmediği projeleri keşfettirir.
Zahmet: az

### Sonuçlarda önizleme
Arama sonucunun üzerine gelince sağda küçük bir görsel belirir. Duvar için çekilen ekran görüntüleri (`assets/img/projects/`) hazır.
Zahmet: az

### Gizli kelimeler
Aramaya belirli bir kelime yazınca okyanusta bir şey olur. Örneğin "megalodon" ya da "deep" yazınca megalodon dipten geçer; sürekli değil, onu bulan kişiye özel.
Zahmet: az. Megalodon kodu commit geçmişinde (bkz. Rafta).

### Günün saatine göre okyanus
Ziyaretçinin yerel saatine göre renk değişir: sabah açık, gece koyu.
Zahmet: az. Koyu tema tercihiyle çakışabilir; ikisinden biri seçilmeli.

### Sonuç seçilince köpekbalığı döner
Bir sonucun üzerine gelince en yakın köpekbalığı ona doğru döner.
Zahmet: yüksek. Motorun yönlendirmesine müdahale gerektirir.

---

## Rafta

### Çizgi roman (Marvel) açılışı
Proje panelleri çizgi roman kesmeleri gibi hızlanarak geçip duvara dönüşüyordu. Beğenilmedi, kaldırıldı; yerine doğrudan Burst geldi. Kodu: `b7bbdde` (`assets/js/intro.js`).

### Dalış
Ana sayfada aşağı kaydırınca okyanus gece mavisine kararıyor, indeks yüzeyin altından çıkıyordu; sağ kenarda derinlik göstergesi (0 → 200 m). Siteyi fazla tematik yaptığı için kaldırıldı.
Geri getirmek için: `5e941cf`. Ortak indeks modülü (`assets/js/index-grid.js`) bu işten kaldı ve kullanılıyor.

### Megalodon
15 saniye hareketsizlikten sonra dev, yarı saydam bir köpekbalığı dipten, arama kutusunun altından geçer; kutu dalgasıyla hafifçe kalkar. Yapıldı, sonra kaldırıldı.
Geri getirmek için: `c3b202c` (son hali, dipten yüzen sürüm) ve `2d045f6`. Kaldıran commit: `ff7a424`. Megalodon, derleme betiğindeki derinlik saydamlığı yamasına ihtiyaç duyuyor.

---

## Yapıldı

- Arama ekranı ve buzlu cam altında ASCII okyanus
- Filtrelenebilir proje indeksi (`/work/`)
- Daha sık okyanus dokusu (5–8 px hücre)
- Vatoz
- Başlık arama kutusu genişliğinde, "curious" serif italik
- Sayı satırı: "28 projects · 9 papers · 2 writings beneath the surface", öneri çiplerinin yerinde; her sayı bir link
- Paylaşılabilir arama: `/?q=…` kutuyu doldurup sonuçları açar, yazdıkça adres güncellenir
- Dönen ipuçları: boş kutuda sabit "try" ve alttan yükselen kelime ("try *networks*…"); yalnızca sonuç veren kelimeler; boş kutuda Enter görünen ipucunu arar
- Açık/koyu tema düğmesi: header'ın sağında; önce sistemi izler, seçim hatırlanır; okyanus da birlikte değişir
- Proje duvarı: ana sayfa tam ekran duvarla açılır; kartlar merkezden patlayarak yerine oturur (Burst). Sıralar zıt yönlere kayar, kavisli bir perde gibi: ortadakiler düz, kenardakiler izleyiciye döner
- Tıklanabilir duvar (Burst gibi): imleci izleyen hap etiket proje adını gösterir; tıklanan kart yerinden kalkıp büyük bir çerçeveye uçar, yanında künye (koleksiyon, başlık, açıklama, konular, stack, "Open project", sayaç). ← → gezinir, Esc/dışarı tıklama kartı yerine döndürür, Ctrl/⌘ tıklama doğrudan açar
- Kaydırınca arama: duvarın önüne kâğıt bir cam iner, soru ve arama kutusu gelir; arama yazıldıkça cam incelir, eşleşen kartlar arkada parlar, dönen ipucu kendi projelerini öne çıkarır
- Okyanuslu arama `/search/` sayfasına taşındı; header'daki arama simgesi ve her sayfada `/` oraya götürür
- Proje ekran görüntüleri: `tools/shoot-projects.py` (28 projeden 27'si; `conflict` çekilemedi, tipografik kart)
