# Fikirler — mertseven.com yeni site

Ana sayfa ve site için biriken fikirler. Yapılan bir fikir "Yapıldı" bölümüne taşınır, vazgeçilen "Rafta" bölümüne.

Zahmet: **çok az** (bir saatten az) · **az** · **orta** · **yüksek**

---

## Sıradakiler

Önerilen sıra: önce 1 ve 2 (küçük ve sayfaya hemen bilgi katıyor), sonra 3 (sitenin karakterini belirliyor).

### 1. Yüzeyin altında ne olduğunu söyleyen tek satır
Arama kutusunun altında, çiplerin yerinde soluk bir satır: "28 projects · 9 papers · 2 writings beneath the surface". Ne aranabileceğini söyler. Sayılar `catalog.json`'dan otomatik gelir.
Zahmet: çok az

### 2. Paylaşılabilir arama
`mertseven.com/?q=networks` açılınca sonuçlar hazır gelir. Derste, sunumda ya da e-postada "şuna bak" diye link vermeyi kolaylaştırır.
Zahmet: çok az

### 3. Dalış: kaydırınca derine inmek
Ana sayfada aşağı kaydırınca okyanus yavaşça kararır, kâğıt beyazından gece mavisine geçer, alttan proje indeksi çıkar. "Index" ayrı bir sayfa değil, yüzeyin altındaki katman olur.
Zahmet: orta. Motorun açık ve koyu teması hazır; aradaki geçiş yazılacak.

---

## Havuz

### Yazarken dalga
Arama kutusuna her harf yazılınca kutunun altında hafif bir su halkası oluşur, balıklar dağılır. Motorda hazır bir `splash` fonksiyonu var.
Zahmet: az

### Dönen ipuçları
Arama kutusunun içindeki yazı birkaç saniyede bir değişir: "try *networks*…", "try *Bergson*…". Çipler kaldırılabilir, ekran sadeleşir.
Zahmet: az

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
Arama sonucunun üzerine gelince sağda küçük bir görsel belirir. `visuals/` klasöründe bazı projelerin görselleri var; tamamı için her projeye görsel gerekiyor.
Zahmet: az (görseller hariç)

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
