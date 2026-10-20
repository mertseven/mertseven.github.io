// Takımada · ana stil: Montour (Mert + Contour). Kaynak: stiller/montour.json (file:// için .js kopyası).
window.KUTUPHANE = window.KUTUPHANE || {};
window.KUTUPHANE.stil = {
  "id": "style.montour",
  "name": "Montour",
  "version": 1,
  "note": "Takımadanın ana stili. Adı Mert + Contour. Palet C (eski adı Girard), Gravür desen sistemi, dolu aydınlık, süs deseni karışır, seyrek gravürlü ay ışığı gecesi, geometri konturu (gece yarı gri).",
  "palette": "c",
  "system": "engrave",
  "print": "atlas",
  "lit": "color",
  "decor": 0,
  "dark": "moonline",
  "outline": 1,
  "outlineNight": "dim",
  "unifyDark": 1,
  "scale": 1,
  "thresholds": [
    0.93,
    0.8,
    0.66,
    0.52,
    0.38
  ],
  "nightThresholdFactor": 0.92,
  "light": {
    "azimuth": 35,
    "elevation": 48,
    "sun": 1.3,
    "ambient": 2.1,
    "moon": 0.6,
    "streetLamps": 2.6,
    "lampRange": 3.4
  },
  "perspective": {
    "note": "3. şahıs (perspektif) kamera: gökyüzü, uzaklık sisi, yakında seyrelen desen, gece ayarı",
    "fogNear": 14,
    "fogFar": 42,
    "nearStart": 2.5,
    "nearEnd": 8,
    "nearShift": 2,
    "dayZenith": 0.32,
    "nightHorizon": 0.3,
    "nightDark": "tint",
    "nightMoon": 0.8,
    "nightThresholdFactor": 0.85,
    "nightLamps": 4
  },
  "paint": {
    "note": "BOYA ışığı (Ghibli yönü, deneme · ?paint=1): düz renk kademeleri, serin gölge, sıcak ışık, renkli seyrek kontur; desen yalnız kumaşta",
    "steps": [1.0, 0.8, 0.5],
    "nightSteps": [0.95, 0.5, 0.22],
    "light": "#fff3d6",
    "shadeInk": 0.3,
    "shadePink": 0.18,
    "grain": 0.06,
    "zenith": 0.5
  },
  "print2": {
    "note": "MONTOUR 2 · BASKI (deneme · ?paint=2 &hatch=0|1|2): ışık düz renk, gölge kendi tonunda tek yönlü gravür (derinde çapraz), mürekkep kontur yalnız bebek ve yapılarda, doğada yalnız kıyı çizgisi, kâğıt tanesi, kayık baskı",
    "hatch": 1,
    "hand": 1,
    "boilFps": 0,
    "misregister": 0.8,
    "grain": 0.07
  },
  "nature": {
    "note": "CANLI DOĞA (boya / baskıda): rüzgâr yönü, rüzgâr şeridinin sıcaklığı, ot işaretinin koyuluğu, sığlığın yeşili ve açıklığı",
    "wind": [0.94, 0.33],
    "gustWarm": 0.35,
    "markInk": 0.5,
    "shallowGreen": 0.4,
    "shallowPaper": 0.25
  },
  "view": {
    "note": "Adanın varsayılan görünümü: baskı ışığı (0 Montour gravür · 1 Boya · 2 Baskı) ve yürürken kamera (tp 3. şahıs · iso kuş bakışı). URL ile değişir: ?paint=0 &cam=iso",
    "paint": 2,
    "walkCamera": "tp"
  },
  "beacon": {
    "on": true,
    "cone": true,
    "shadow": true,
    "width": 0.16,
    "power": 60,
    "tilt": 0.16,
    "range": 30
  }
};
