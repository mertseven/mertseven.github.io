# -*- coding: utf-8 -*-
"""
Etkileşim Atlası — derleyici

src/ altındaki parçaları sırayla birleştirir ve üç çıktı üretir:

  ../ima/map.html             YAYINLANAN dosya, İngilizce (varsayılan). IMA'nın MAP'i:
                              mertseven.com/ima/map (LAB'ın yanında, /ima/ girişinden).
  ../tr/ima/map.html          Aynı atlasın Türkçesi; sitenin geri kalanı gibi /tr/ altında.
                              Eski adresler (/etkilesim-atlas.html, /tr/etkilesim-atlas.html)
                              buraya yönlendiren küçük sayfalar olarak duruyor.
  etkilesim-atlasi.html       Yalnız IIFE parçası (doctype/head yok). Söz dizimi
                              kontrolü için tutuluyor; .gitignore ile git'in dışında.

İngilizce: kaynak Türkçe yazılı. İngilizce sayfada src/en.js veriyi (tarifler, kümeler,
eksenler, tur) çalışma anında değiştirir; src/en_metin.json'daki arayüz sözleri ise
derlemede değiştirilir. Bir söz kaynakta bulunamazsa derleme durur — sessizce Türkçe
kalmasın diye. Müze ve pavyon şimdilik Türkçe.

Yerleşim: veri/yerlesim.json (arac/yerlesim.mjs üretir) kütüphane listesiyle hâlâ
eşleşiyorsa sayfaya gömülür; atlas açılışta t-SNE çözmez.

Kullanım:   python derle.py
Gereksinim: yok (yalnız standart kütüphane). Yerleşimi yeniden hesaplamak için node.
"""
import io, os, datetime, re, json, hashlib

HERE = os.path.dirname(os.path.abspath(__file__))
SRC  = os.path.join(HERE, "src")

# Sıra önemli: parçalar tek bir IIFE içinde birleşiyor.
#   _p2.js  IIFE'yi açar,  _p7.js  kapatır.
PARTS = [
    "_p1.html",   # iskelet, stiller, ray, sahne, müze arayüzü
    "_p2.js",     # gruplar, eksenler, 162 kütüphane, t-SNE  ← IIFE açılır
    "_p3.js",     # 44 prosedürel glyph
    "@yerlesim",  # hazır t-SNE yerleşimi — veri/yerlesim.json'dan ÜRETİLİR
    "_p4b.js",    # kart manzarası: yerleşim, sürükleme, mini harita
    "_p5.js",     # küme bölgeleri, CDN yükleyici, canlı demolar
    "_p6.js",     # tur, karşılaştırma, eksen sözlüğü
    "_p8.js",     # 118 gazetecilik işi (digijournalism kataloğu)
    "_p9.js",     # vatoz: kanat kinematiği, kuyruk filamenti, geometri
    "@grad",      # 9 mezuniyet projesi — grad-projects/script.js'ten ÜRETİLİR
    "_p10.js",    # pavyon: on kenarlı halka, dış zemin, açılı duvar çarpışması
    "_p7.js",     # müze: Holmdel planı, ışık/hava geçişi, gezinme  ← IIFE kapanır
    "_p11.html",  # arayüz katmanı: üst çubuk, künye çekmecesi, arama, karşılaştırma
]

YERLESIM = os.path.join(HERE, "veri", "yerlesim.json")

def p2_hash():
    """arac/yerlesim.mjs ile aynı parmak izi: _p2.js'in RAW'dan sonrası, satır sonları \\n."""
    with io.open(os.path.join(SRC, "_p2.js"), encoding="utf-8") as f:
        s = f.read().replace("\r\n", "\n")
    return hashlib.sha1(s[s.index("const RAW = ["):].encode("utf-8")).hexdigest()

def build_yerlesim(state):
    if not os.path.exists(YERLESIM):
        state["yerlesim"] = "YOK — node arac/yerlesim.mjs; harita tarayicida cozulecek"
        return ""
    with io.open(YERLESIM, encoding="utf-8") as f:
        d = json.load(f)
    if d.get("hash") != p2_hash():
        state["yerlesim"] = "ESKI (kutuphane listesi degismis) — node arac/yerlesim.mjs; simdilik tarayicida cozulecek"
        return ""
    state["yerlesim"] = "gomulu OK (%d kutuphane)" % d["n"]
    return ("\n/* ==== hazır yerleşim ====\n   BU BLOK ELLE YAZILMADI. arac/yerlesim.mjs hesapladı, derle.py veri/yerlesim.json'dan\n"
            "   koydu. Kütüphane listesi değişince orayı yeniden üretin.                    */\n"
            "const BAKED={kl:%s,pos:%s};\n" % (json.dumps(d["kl"]), json.dumps(d["pos"], separators=(",", ":"))))

# Dile göre değişen her şey burada.
LANGS = {
    "en": dict(out=os.path.join(os.path.dirname(HERE), "ima", "map.html"),
               lang="en", base="../", alt="../tr/ima/map.html", path="ima/map.html", locale="en_US",
               title="Interaction Atlas",
               desc="The {n_lib} JavaScript libraries that make interactive media possible, and {n_proj} journalism works made with them.",
               nos_p="This atlas runs entirely in the browser and needs JavaScript."),
    "tr": dict(out=os.path.join(os.path.dirname(HERE), "tr", "ima", "map.html"),
               lang="tr", base="../../", alt="../../ima/map.html", path="tr/ima/map.html", locale="tr_TR",
               title="Etkileşim Atlası",
               desc="İnteraktif medyayı mümkün kılan {n_lib} JavaScript kütüphanesi ve onlarla yapılmış {n_proj} gazetecilik işi.",
               nos_p="Bu atlas tamamen tarayıcıda çalışır ve JavaScript gerektirir."),
}
SITE = "https://mertseven.com/"

def english(frag):
    """İngilizce sayfa: en_metin.json'daki sözler değişir, en.js verinin önüne konur."""
    with io.open(os.path.join(SRC, "en_metin.json"), encoding="utf-8") as f:
        pairs = json.load(f)
    for p in pairs:
        a, b, all_ = p[0], p[1], (len(p) > 2 and p[2])
        if a not in frag:
            raise SystemExit("en_metin.json: kaynakta bulunamadi -> " + a[:70])
        frag = frag.replace(a, b) if all_ else frag.replace(a, b, 1)
    with io.open(os.path.join(SRC, "en.js"), encoding="utf-8") as f:
        en = f.read()
    frag = frag.replace("<title>Etkileşim Atlası</title>", "<title>Interaction Atlas</title>\n<script>\n" + en + "</script>", 1)
    return frag, len(pairs)

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

def build_fragment(state):
    out = []
    for name in PARTS:
        if name == "@grad":
            out.append(build_grad()); continue
        if name == "@yerlesim":
            out.append(build_yerlesim(state)); continue
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
    <h1 style="font-size:22px;margin:0 0 10px">{title}</h1>
    <p>{nos_p}</p>
  </div>
</noscript>"""


def build_standalone(fragment, n_lib, n_proj, L):
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
    base = f' data-base="{L["base"]}"' if L["base"] else ""
    desc = L["desc"].format(n_lib=n_lib, n_proj=n_proj)
    nos = NOSCRIPT.format(title=L["title"], nos_p=L["nos_p"])
    # Sayfa diğer dilini data-alt'ta tutar (dil düğmesi oraya gider); data-base, /tr/
    # sayfanın (ima/ ya da tr/ima/ altında) atlas-varlik/ gibi kök klasörlere ulaşması için.
    return f"""<!doctype html>
<html lang="{L["lang"]}" data-alt="{L["alt"]}"{base}>
<head>
<meta charset="utf-8">
<!-- Google tag (gtag.js): sitenin geri kalanıyla aynı ölçüm -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-CS83EW7TN6"></script>
<script>window.dataLayer=window.dataLayer||[];function gtag(){{dataLayer.push(arguments);}}gtag('js',new Date());gtag('config','G-CS83EW7TN6');</script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<meta name="color-scheme" content="light dark">
<!-- iPhone Safari'de Fullscreen API yok. Orada adres cubugundan kurtulmanin
     tek yolu sayfayi ana ekrana eklemek; bu iki satir onu gercek tam ekran
     baslatiyor. Android'de zaten Fullscreen API calisiyor. -->
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="{L["title"]}">
<meta name="description" content="{desc}">
<link rel="canonical" href="{SITE}{L["path"]}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Mert Seven">
<meta property="og:locale" content="{L["locale"]}">
<meta property="og:url" content="{SITE}{L["path"]}">
<meta property="og:title" content="{L["title"]} · Mert Seven">
<meta property="og:description" content="{desc}">
<meta property="og:image" content="{SITE}images/webcard.png">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:image" content="{SITE}images/webcard.png">
<link rel="alternate" hreflang="en" href="{SITE}ima/map.html">
<link rel="alternate" hreflang="tr" href="{SITE}tr/ima/map.html">
<link rel="icon" href="{FAVICON}">
{banner}
{head_part}
{RESET}
</head>
<body>
{nos}
{body_part}
</body>
</html>
"""


def main():
    state = {}
    frag = build_fragment(state)

    n_lib  = len(re.findall(r'^\["', open(os.path.join(SRC, "_p2.js"), encoding="utf-8").read(), re.M))
    n_proj = len(re.findall(r'^\["', open(os.path.join(SRC, "_p8.js"), encoding="utf-8").read(), re.M))

    # Yayın dosyalarının adı ve yeri sabittir — değiştirirseniz canlı bağlantı kırılır.
    a = os.path.join(HERE, "etkilesim-atlasi.html")
    io.open(a, "w", encoding="utf-8", newline="\n").write(frag)
    en_frag, n_en = english(frag)
    for key, f in (("en", en_frag), ("tr", frag)):
        L = LANGS[key]
        os.makedirs(os.path.dirname(L["out"]), exist_ok=True)
        io.open(L["out"], "w", encoding="utf-8", newline="\n").write(build_standalone(f, n_lib, n_proj, L))

    # Sağlık kontrolü: yalnız satır başındaki dış IIFE işaretleri sayılır, arayüz katmanından
    # (kendi kapsamı var) önce. Demoların içindeki "(function tick(){...})();" gibi iç IIFE'ler sayılmaz.
    core = frag[:frag.index("19. ARAYÜZ KATMANI")]
    opens  = len(re.findall(r"^\(function\(\)\{", core, re.M))
    closes = len(re.findall(r"^\}\)\(\);", core, re.M))
    n_grad = frag.count("{title:")
    print("kutuphane : %d" % n_lib)
    print("proje     : %d" % n_proj)
    print("mezuniyet : %d %s" % (n_grad, "OK" if n_grad == 9 else
          "!! pavyon 9 nise gore kurulu - _p10.js icindeki PAV_N'i gozden gecirin"))
    print("IIFE      : %d acilis / %d kapanis %s" % (opens, closes, "OK" if opens == closes else "!! DENGESIZ"))
    print("yerlesim  : %s" % state.get("yerlesim", "?"))
    print("ingilizce : %d arayuz sozu degisti OK" % n_en)
    print("parca     : %-34s %6.1f kB" % (os.path.basename(a), os.path.getsize(a)/1024))
    for key in ("en", "tr"):
        out = LANGS[key]["out"]
        rel = os.path.relpath(out, HERE).replace(os.sep, "/")
        print("YAYIN %s  : %-34s %6.1f kB" % (key, rel, os.path.getsize(out)/1024))
    print()
    print("Sozdizimi kontrolu icin (node varsa):")
    print("  python derle.py && node --check <(sed -n '/^<script>$/,/^<\\/script>$/p' etkilesim-atlasi.html | sed '1d;$d')")


if __name__ == "__main__":
    main()
