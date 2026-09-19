# -*- coding: utf-8 -*-
"""
Mezuniyet projelerinin kapak görsellerini pavyon dokusuna dönüştürür.

  grad-projects/assets/covers/*.png   →   atlas-varlik/kapak/*.webp

Dosya ADI KORUNUR, yalnız uzantı .webp olur. Pavyon kodu doku yolunu
script.js'teki `cover` alanından bu kuralla türetiyor — arada eşleme
tablosu yok, dolayısıyla kayma da olamaz.

BU BİR DERLEME ADIMI DEĞİL. Elle, kapaklar değiştiğinde çalıştırılır;
çıktı depoya işlenir. derle.py bağımsız kalsın diye ayrı tutuldu
(bu betik Pillow istiyor, derle.py hiçbir şey istemiyor).

Kullanım:  python etkilesim-atlasi/arac/kapak-donustur.py     (depo kökünden)
"""
from PIL import Image
import os, sys

SRC = "grad-projects/assets/covers"
OUT = "atlas-varlik/kapak"
EN  = 1024          # üst sınır; küçük kaynak BÜYÜTÜLMEZ
KALITE = 84
KAGIT = (247, 241, 225)   # saydam alanların altı: kâğıt rengi, saf beyaz değil

def main():
    if not os.path.isdir(SRC):
        sys.exit("bulunamadi: %s  (depo kokunden calistirin)" % SRC)
    os.makedirs(OUT, exist_ok=True)
    gir = cik = 0
    for ad in sorted(os.listdir(SRC)):
        kok, uz = os.path.splitext(ad)
        if uz.lower() not in (".png", ".jpg", ".jpeg"):
            continue
        yol = os.path.join(SRC, ad)
        im = Image.open(yol)
        if im.width < 400:                      # 256 px'lik yer tutucu artıklar
            print("atlandi (kucuk): %s" % ad)
            continue
        if im.mode != "RGB":
            bg = Image.new("RGB", im.size, KAGIT)
            bg.paste(im, mask=im.split()[-1] if im.mode == "RGBA" else None)
            im = bg
        w = min(EN, im.width)
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
        hedef = os.path.join(OUT, kok + ".webp")
        im.save(hedef, "WEBP", quality=KALITE, method=6)
        a, b = os.path.getsize(yol), os.path.getsize(hedef)
        gir += a; cik += b
        print("%-34s %4dx%-4d %7.0f kB -> %5.0f kB" % (kok, im.width, im.height, a/1024, b/1024))
    print("-" * 68)
    print("%-34s %20.1f MB -> %5.0f kB" % ("TOPLAM", gir/1048576, cik/1024))

if __name__ == "__main__":
    main()
