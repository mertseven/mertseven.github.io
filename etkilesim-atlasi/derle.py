# -*- coding: utf-8 -*-
"""
Etkileşim Atlası — derleyici

src/ altındaki parçaları sırayla birleştirir ve iki çıktı üretir:

  ../etkilesim-atlas.html   YAYINLANAN dosya. Deponun kökünde durur; GitHub Pages
                            onu mertseven.com/etkilesim-atlas adresinden sunuyor.
  etkilesim-atlasi.html     Yalnız IIFE parçası (doctype/head yok). Söz dizimi
                            kontrolü için tutuluyor; .gitignore ile git'in dışında.

Kullanım:   python derle.py
Gereksinim: yok (yalnız standart kütüphane)
"""
import io, os, datetime, re

HERE = os.path.dirname(os.path.abspath(__file__))
SRC  = os.path.join(HERE, "src")

# Sıra önemli: parçalar tek bir IIFE içinde birleşiyor.
#   _p2.js  IIFE'yi açar,  _p7.js  kapatır.
PARTS = [
    "_p1.html",   # iskelet, stiller, ray, sahne, müze arayüzü
    "_p2.js",     # gruplar, eksenler, 162 kütüphane, t-SNE  ← IIFE açılır
    "_p3.js",     # 44 prosedürel glyph
    "_p4b.js",    # kart manzarası: yerleşim, sürükleme, mini harita
    "_p5.js",     # küme bölgeleri, CDN yükleyici, canlı demolar
    "_p6.js",     # tur, karşılaştırma, eksen sözlüğü
    "_p8.js",     # 118 gazetecilik işi (digijournalism kataloğu)
    "_p9.js",     # vatoz: kanat kinematiği, kuyruk filamenti, geometri
    "@grad",      # 9 mezuniyet projesi — grad-projects/script.js'ten ÜRETİLİR
    "_p10.js",    # pavyon: on kenarlı halka, dış zemin, açılı duvar çarpışması
    "_p7.js",     # müze: Holmdel planı, ışık/hava geçişi, gezinme  ← IIFE kapanır
]

# Pavyonun verisi showcase ile AYNI yerden gelsin diye, grad-projects/script.js
# içindeki projects[] dizisi derleme anında olduğu gibi alınır. Kopyalasaydık
# iki liste bir gün ayrışırdı; ayrıştırmaya kalksaydık derle.py bağımlılık
# isterdi. Dizi zaten geçerli JS — düz bir dilim yetiyor.
GRAD_SRC = os.path.join(os.path.dirname(HERE), "grad-projects", "script.js")

GRAD_HEAD = """
/* ==== mezuniyet projeleri ====
   BU BLOK ELLE YAZILMADI. derle.py, grad-projects/script.js icindeki
   projects[] dizisini oldugu gibi buraya koyuyor: showcase ile pavyon
   tek kaynaktan besleniyor, dolayisiyla ayrisamazlar.
   Duzenleme oraya yapilir, buraya degil.                              */
"""

def build_grad():
    if not os.path.exists(GRAD_SRC):
        raise SystemExit(
            "bulunamadi: " + GRAD_SRC + os.linesep +
            "Pavyonun verisi oradan geliyor; yol degistiyse "
            "derle.py icindeki GRAD_SRC'yi guncelleyin.")
    with io.open(GRAD_SRC, encoding="utf-8") as f:
        src = f.read()
    try:
        a = src.index("const projects=[")
        b = src.index(chr(10) + "];", a) + 3
    except ValueError:
        raise SystemExit("grad-projects/script.js icinde 'const projects=[ ... ];' "
                         "bulunamadi. Bicim degistiyse build_grad'i guncelleyin.")
    body = src[a + len("const projects="):b]
    return GRAD_HEAD + "const GRAD=" + body + chr(10)

def build_fragment():
    out = []
    for name in PARTS:
        if name == "@grad":
            out.append(build_grad()); continue
        path = os.path.join(SRC, name)
        with io.open(path, encoding="utf-8") as f:
            out.append(f.read())
    return "".join(out)


FAVICON = ("data:image/svg+xml,"
  "%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E"
  "%3Crect width='32' height='32' rx='6' fill='%23161615'/%3E"
  "%3Cg fill='%23E9E5DA'%3E"
  "%3Crect x='6' y='6' width='7' height='7' rx='1.5'/%3E"
  "%3Crect x='19' y='6' width='7' height='7' rx='1.5'/%3E"
  "%3Crect x='6' y='19' width='7' height='7' rx='1.5'/%3E"
  "%3Crect x='19' y='19' width='7' height='7' rx='1.5'/%3E"
  "%3C/g%3E%3C/svg%3E")

# Artifact sarmalayıcısının verdiği asgari sıfırlama. body{margin:0} olmadan
# 100dvh ızgarası taşar — dışarıda bunu elle vermek şart.
RESET = """<style>
*,*::before,*::after{box-sizing:border-box}
html{color-scheme:light dark;-webkit-text-size-adjust:100%}
body{margin:0}
img,svg,canvas{max-width:100%}
[hidden]{display:none!important}
</style>"""

NOSCRIPT = """<noscript>
  <div style="padding:32px;font:16px/1.6 system-ui,sans-serif;max-width:60ch">
    <h1 style="font-size:22px;margin:0 0 10px">Etkileşim Atlası</h1>
    <p>Bu atlas tamamen tarayıcıda çalışır ve JavaScript gerektirir.</p>
  </div>
</noscript>"""


def build_standalone(fragment, n_lib, n_proj):
    # Gövde burada başlıyor. Nitelik eklenebildiği için (id, data-*) yalnız
    # etiketin başı aranıyor — tam eşleşme bir kez kırılmıştı.
    cut = fragment.index('<div class="app"')
    head_part, body_part = fragment[:cut].rstrip(), fragment[cut:]
    today = datetime.date.today().isoformat()
    banner = f"""<!--
  Etkileşim Atlası
  {n_lib} JavaScript kütüphanesi (10 grup) + {n_proj} gazetecilik işi (8 bölüm)
  Kart manzarası (t-SNE) ve dört katlı, gezilebilir, dithered bir müze.

  Tek dosya, derleme adımı yok — tarayıcıda açmanız yeterli.
  Yazı tipleri (Google Fonts) ve canlı demoların kütüphaneleri (cdnjs, jsDelivr)
  internetten yüklenir; çevrimdışı çalışmaz.
  file:// ile de açılır, ama yerel sunucu daha güvenlidir:
      python -m http.server 8000

  Ağırlık/yıldız/yıl değerleri yaklaşıktır. Özellik vektörleri editoryal yargıdır.
  Projelerin kütüphane bilgisi tahmin değil, sayfa kaynağında imza aranarak bulundu.

  Derlenme: {today}
-->"""
    return f"""<!doctype html>
<html lang="tr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<meta name="description" content="İnteraktif medyayı mümkün kılan {n_lib} JavaScript kütüphanesi ve onlarla yapılmış {n_proj} gazetecilik işi.">
<link rel="icon" href="{FAVICON}">
{banner}
{head_part}
{RESET}
</head>
<body>
{NOSCRIPT}
{body_part}
</body>
</html>
"""


def main():
    frag = build_fragment()

    n_lib  = len(re.findall(r'^\["', open(os.path.join(SRC, "_p2.js"), encoding="utf-8").read(), re.M))
    n_proj = len(re.findall(r'^\["', open(os.path.join(SRC, "_p8.js"), encoding="utf-8").read(), re.M))

    # Yayın dosyasının adı ve yeri sabittir — değiştirirseniz canlı bağlantı kırılır.
    a = os.path.join(HERE, "etkilesim-atlasi.html")
    b = os.path.join(os.path.dirname(HERE), "etkilesim-atlas.html")
    io.open(a, "w", encoding="utf-8", newline="\n").write(frag)
    io.open(b, "w", encoding="utf-8", newline="\n").write(build_standalone(frag, n_lib, n_proj))

    # Sağlık kontrolü: yalnız satır başındaki dış IIFE işaretleri sayılır.
    # (Demoların içindeki "(function tick(){...})();" gibi iç IIFE'ler sayılmamalı.)
    opens  = len(re.findall(r"^\(function\(\)\{", frag, re.M))
    closes = len(re.findall(r"^\}\)\(\);", frag, re.M))
    n_grad = frag.count("{title:")
    print("kutuphane : %d" % n_lib)
    print("proje     : %d" % n_proj)
    print("mezuniyet : %d %s" % (n_grad, "OK" if n_grad == 9 else
          "!! pavyon 9 nise gore kurulu - _p10.js icindeki PAV_N'i gozden gecirin"))
    print("IIFE      : %d acilis / %d kapanis %s" % (opens, closes, "OK" if opens == closes else "!! DENGESIZ"))
    print("parca     : %-34s %6.1f kB" % (os.path.basename(a), os.path.getsize(a)/1024))
    print("YAYIN     : %-34s %6.1f kB" % ("../" + os.path.basename(b), os.path.getsize(b)/1024))
    print()
    print("Sozdizimi kontrolu icin (node varsa):")
    print("  python derle.py && node --check <(sed -n '/^<script>$/,/^<\\/script>$/p' etkilesim-atlasi.html | sed '1d;$d')")


if __name__ == "__main__":
    main()
