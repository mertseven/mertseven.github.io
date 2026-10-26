import { loadCatalog } from "/assets/js/catalog.js";
import { VESSELS, markOf } from "/preview/marks.js";

// Fifteen main logos in the language of the project marks: the same six vessels, the same
// cuts, the same three textures, the same weights on the same 24-unit square.

const { projects } = await loadCatalog();
const FAMILY = ["jstudio", "networkcanvas", "socrates", "ima-lab", "kafka"].map((id) => projects.find((p) => p.id === id));

const S = (d) => `<g fill="none" stroke="currentColor" stroke-width="1.6">${d}</g>`;        // outline
const F = (d) => `<g fill="currentColor" stroke="currentColor" stroke-width="1.6">${d}</g>`; // filled
const D = (d) => `<g fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="3 2.4">${d}</g>`;
const C = (d) => `<g class="cut" fill="none" stroke-width="1.8">${d}</g>`;                   // a cut in paper, on a filled shape
const K = (d) => `<g fill="none" stroke="currentColor" stroke-width="1.8">${d}</g>`;        // a cut in ink
const V = Object.fromEntries(VESSELS.map((v) => [v.id, v.svg]));
let clip = 0;

const LOGOS = [
  { name: "Altı <em>kap</em>", why: "Altı kabın hepsi üst üste, ince çizgiyle: bütün işlerin toplamı tek işarette. Uzaktan bir çiçek ya da bir kristal.",
    svg: () => `<g fill="none" stroke="currentColor" stroke-width="1">${VESSELS.map((v) => v.svg).join("")}</g>` },
  { name: "Bütün <em>kesikler</em>", why: "Kap yok, beş kesik üst üste: artı, nokta, çapraz, halka, çizgi. Projelerin yapılış biçimlerinin hepsi.",
    svg: () => K(`<circle cx="12" cy="12" r="6"/><circle cx="12" cy="12" r="3"/><path d="M12 5v14M5 12h14M6 17 18 7"/>`) },
  { name: "<em>Nişangâh</em>", why: "Halka ve artı: bakmak, odaklanmak, merak. Kap yok; projeler bu bakışa kap giyiyor.",
    svg: () => K(`<circle cx="12" cy="12" r="7"/><path d="M12 2v6M12 16v6M2 12h6M16 12h6"/>`) },
  { name: "Açık <em>halka</em>", why: "Bir yeri açık halka ve ortada bir nokta: bitmemiş, açık uçlu bir merak. Bir C, bir kulak, bir soru.",
    svg: () => K(`<path d="M18.4 5.6A9 9 0 1 0 21 12"/>`) + F(`<circle cx="12" cy="12" r="2.2"/>`) },
  { name: "İç <em>içe</em>", why: "Kare kontur içinde dolu bir daire: sınıf (kare) içinde felsefe (daire). Öğreten bir düşünür.",
    svg: () => S(V.square) + F(`<circle cx="12" cy="12" r="6"/>`) },
  { name: "<em>Kesişim</em>", why: "Bir daire ile bir kare kesişiyor, ortak alan dolu: düşünmek ile yapmak arasındaki yer. Akademisyen ve zanaatkâr.",
    svg: () => { const id = `k${++clip}`; return `<defs><clipPath id="${id}"><circle cx="9" cy="12" r="7"/></clipPath></defs>` + S(`<circle cx="9" cy="12" r="7"/><rect x="10" y="5" width="12" height="14"/>`) + `<rect x="10" y="5" width="12" height="14" clip-path="url(#${id})" fill="currentColor"/>`; } },
  { name: "Üç <em>doku</em>", why: "Üç küçük kap yan yana, üç dokuda: dolu üçgen (yapmak), kontur daire (öğretmek), kesik kare (denemek). Bütün sistemin anahtarı.",
    svg: () => F(`<path d="M4 9 7.5 15H.5Z"/>`) + S(`<circle cx="12" cy="12" r="3"/>`) + D(`<rect x="17" y="9" width="6" height="6"/>`) },
  { name: "Çift <em>kemer</em>", why: "İki kemer yan yana: bir m. Harf, ama önce iki kapı gibi görünüyor; mekân kabından doğuyor.",
    svg: () => F(`<path d="M2 21V12a5 5 0 0 1 10 0v9Z"/><path d="M12 21V12a5 5 0 0 1 10 0v9Z"/>`) + C(`<path d="M12 12v9"/>`) },
  { name: "<em>Kapı</em>", why: "Dolu bir kemer ve içinde nokta: bir kapı aralığı. Ana sayfadaki 'işe açılan dört kapı' ile aynı imge.",
    svg: () => F(V.arch) + C(`<circle cx="12" cy="13" r="3"/>`) },
  { name: "Ağ <em>çekirdeği</em>", why: "Elmas kontur, içinde halka ve dolu nokta: ağlar ve veri kabının içinde senin çekirdeğin.",
    svg: () => S(V.diamond) + K(`<circle cx="12" cy="12" r="4"/>`) + F(`<circle cx="12" cy="12" r="1.6"/>`) },
  { name: "Eş <em>merkez</em>", why: "Dolu bir çekirdek ve kesik bir dış halka: bilinen ile henüz denenen. İki dokunun tek işarette buluşması.",
    svg: () => D(`<circle cx="12" cy="12" r="10"/>`) + F(`<circle cx="12" cy="12" r="5"/>`) },
  { name: "<em>Piksel</em>", why: "Dolu bir daire ve içinde kâğıt renginde küçük bir kare: dünyaya açılmış tek bir piksel. Yeni medya.",
    svg: () => F(`<circle cx="12" cy="12" r="10"/>`) + `<rect x="9" y="9" width="6" height="6" class="cut-fill"/>` },
  { name: "<em>Mühür</em>", why: "Altı kap küçük bir 3 × 2 ızgarada: bir mühür ya da bir harf kasası. Sistemin envanteri.",
    // Scaled to a quarter, so the line is drawn four times as heavy to keep the system's weight.
    svg: () => VESSELS.map((v, i) => `<g transform="translate(${2 + (i % 3) * 7.2} ${5 + Math.floor(i / 3) * 7.6}) scale(0.26)"><g fill="${i % 2 ? "none" : "currentColor"}" stroke="currentColor" stroke-width="5.4">${v.svg}</g></g>`).join("") },
  { name: "Baskı <em>kayması</em>", why: "Arkada kontur bir kare, önde kaydırılmış dolu bir daire: iki kalıp tam üst üste gelmemiş. Baskı dokusuna selam.",
    svg: () => S(`<rect x="7" y="7" width="15" height="15"/>`) + F(`<circle cx="10" cy="10" r="7.5"/>`) },
  { name: "<em>Kapsül</em> ve yarık", why: "Projelerin kullanmadığı yedinci kap, içinde çapraz: yalnızca senin olan bir kap ve hareket.",
    svg: () => S(`<rect x="5" y="1.5" width="14" height="21" rx="7"/>`) + K(`<path d="M8 16 16 8"/>`) },
];

const logo = (l, cls = "") => `<svg class="im ${cls}" viewBox="0 0 24 24" aria-hidden="true">${l.svg()}</svg>`;

document.getElementById("logos").innerHTML = LOGOS.map((l, i) => `
  <article class="lg">
    <div class="lg-hero">${logo(l, "big")}</div>
    <div class="lg-text"><span class="label">${String(i + 1).padStart(2, "0")}</span><h2>${l.name}</h2><p>${l.why}</p></div>
    <div class="lg-uses">
      <span class="lockup lockup--sm">${logo(l)}<span>Mert <em>Seven</em></span></span>
      <span class="lg-favs">${[32, 16].map((s) => `<span class="fav-tile" style="width:${s}px;height:${s}px">${logo(l)}</span>`).join("")}</span>
    </div>
    <div class="lg-family"><span class="lg-own">${logo(l)}</span>${FAMILY.map(markOf).join("")}</div>
  </article>`).join("");

for (const b of document.querySelectorAll("[data-theme-set]")) {
  b.addEventListener("click", () => {
    document.documentElement.dataset.theme = b.dataset.themeSet;
    document.querySelectorAll("[data-theme-set]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  });
}
