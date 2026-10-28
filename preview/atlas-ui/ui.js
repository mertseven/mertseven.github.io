// The interface layer for the atlas overhaul previews. Loaded after the atlas itself; it
// reads window.atlas and the atlas's own elements and rearranges them. The parts every
// variant shares: plainer words (in Turkish or English, from <html lang>), a result list
// under the search, a "how to read" sheet, the museum as a proper way in, the address bar
// following the selection, a sheet panel for the selected card (a drawer, a floating card
// or, on a phone, a bottom sheet) and the comparison: picked from the cards, the sheet or
// the search, kept in a three-slot dock, read on a screen of its own.
// Then each variant (data-variant a, b…, c) puts the pieces in its own place.
(() => {
  const me = document.currentScript, MODE = me.dataset.mode, VAR = me.dataset.variant, ALT = me.dataset.alt;
  const A = window.atlas, $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const slug = (s) => s.toLocaleLowerCase("tr").replace(/\.js$/, "").replace(/[^a-z0-9ğüşıöç]+/g, "-").replace(/^-|-$/g, "");
  const LIVE = Object.keys(A.DEMO_OF).length, N = A.LIBS.length, K = Object.keys(A.CATS).length;
  const app = $("#app"), stage = $("#stage");
  app.dataset.ui = VAR;
  document.documentElement.dataset.ui = MODE;

  // ——— Words ———
  const EN = document.documentElement.lang === "en";
  const LOC = EN ? "en" : "tr";
  const STR = {
    tr: {
      name: "Etkileşim Atlası", eyebrow: `${N} kütüphane · ${K} küme · ${LIVE} canlı demo`, counts: `${N} kütüphane · ${LIVE} canlı`,
      intro: "İnteraktif medyayı mümkün kılan JavaScript kütüphaneleri. Birbirine benzeyenler yan yana duruyor; renk kümeyi, ▶ işareti kartın içinde çalışan bir demoyu gösteriyor.",
      onlyLive: "▶ Canlı demosu olanlar", axes: "Kartlardaki çubuklar ne anlatıyor?", search: "Kütüphane, konu ya da teknik ara…",
      museum: "Müze", museumLine: "Bu kütüphanelerle yapılmış 118 gazetecilik işi, bir binanın içinde.", enter: "Gir →",
      how: "Nasıl okunur?", howTitle: "Bu atlas nasıl okunur?", close: "Kapat", recompute: "Haritayı yeniden hesapla",
      howBody: `<h4>Harita</h4>
        <p>Her kart bir JavaScript kütüphanesi. Birbirine benzeyen kütüphaneler yan yana düşüyor: yakınlık benzerlik demek, haritanın yönleri tek başına bir şey anlatmıyor. Renk kümeyi gösteriyor.</p>
        <h4>Kart</h4>
        <ul><li>Üstte kütüphanenin işini taklit eden küçük bir çizim, altında tek cümlelik tarifi.</li>
          <li><b>▶</b> işaretli ${LIVE} kartta kütüphanenin kendisi çalışıyor; yakınlaşınca yüklenir. Köşedeki <b>⤢</b> ile büyütüp deneyebilirsiniz.</li>
          <li>Karta tıklayınca künyesi açılır: boyut, lisans, yıl, ne yaptığı ve en çok benzediği kütüphaneler.</li>
          <li><b>⇄</b> ile en çok üç kütüphaneyi yan yana koyup karşılaştırabilirsiniz.</li></ul>
        <h4>Gezinme</h4>
        <p>Sürükleyerek kaydırın, tekerlekle ya da iki parmakla yakınlaşın. <kbd>/</kbd> ile arayın, <kbd>Esc</kbd> ile kapatın. Bir kartı sürükleyip elle yerleştirebilirsiniz; diğerleri ona yer açar. Adres çubuğu seçtiğiniz kütüphaneyi tutar, bağlantıyı paylaşabilirsiniz.</p>
        <h4>Nasıl hesaplandı?</h4>
        <p>Her kütüphane on üç soruya verdiği cevaplarla (neyin üstüne çiziyor, hangi âlemde çalışıyor, ne kadarı hesap…) ve boyutu, yaşı, ilgisiyle bir sayı dizisine dönüşüyor. Harita bu dizilerden t-SNE ile hesaplanıyor, sonra kartlar çakışmasın diye aralanıyor. Boyut, yıldız ve yıl değerleri yaklaşık.</p>`,
      more: (n) => `ve ${n} tane daha · haritada işaretli`, none: "Bir şey bulunamadı.",
      sheet: "Künye", live: "▶ canlı", liveLine: "Kütüphanenin kendisi kartın içinde çalışıyor.", tryIt: "Büyüt ve dene ⤢", noLive: "Bu kütüphanenin atlasta canlı demosu yok.",
      clusters: "Kümeler", tour: "Tur", hide: "Gizle ▴", other: "English",
      // comparison
      cmpAdd: "⇄ Karşılaştır", cmpIn: "✓ Karşılaştırmada", cmpNear: "En yakınlarıyla karşılaştır", cmpCard: "Karşılaştırmaya ekle / çıkar",
      cmpTitle: "Karşılaştırma", cmpGo: (n) => `Karşılaştır (${n}) →`, cmpEmpty: "+ Kütüphane ekle", cmpClear: "Temizle",
      cmpHint1: "Bir kütüphane daha seçin: kartın köşesindeki ⇄, künyedeki düğme ya da boş yuva.",
      cmpFull: (x) => `En fazla üç kütüphane; ${x} çıkarıldı.`, cmpPick: "Karşılaştırmaya eklenecek kütüphaneyi yazın…",
      cmpOnlyDiff: "Yalnız farkları göster", cmpOnMap: "Haritada göster", cmpRemove: "Çıkar", cmpBig: "büyük fark",
      cmpAlike: (a, b, p) => `<b>${a}</b> ile <b>${b}</b> %${p} benziyor`,
      cmpStory: (x, y) => `En çok <b>${x}</b> sorusunda ayrışıyorlar, en çok <b>${y}</b> sorusunda benziyorlar.`,
      year: "Yıl", license: "Lisans", size: "Boyut", stars: "GitHub", kb: (k) => (k >= 1000 ? `${(k / 1000).toFixed(1)} MB` : `${k} kB`),
    },
    en: {
      name: "Interaction Atlas", eyebrow: `${N} libraries · ${K} clusters · ${LIVE} live demos`, counts: `${N} libraries · ${LIVE} live`,
      intro: "The JavaScript libraries that make interactive media possible. Similar ones sit side by side; colour shows the cluster, and ▶ marks a card where a live demo runs.",
      onlyLive: "▶ With live demos", axes: "What do the bars on the cards mean?", search: "Search a library, topic or technique…",
      museum: "Museum", museumLine: "118 journalism works made with these libraries, inside a building.", enter: "Enter →",
      how: "How to read", howTitle: "How to read this atlas", close: "Close", recompute: "Recompute the map",
      howBody: `<h4>The map</h4>
        <p>Each card is a JavaScript library. Libraries that are alike land next to each other: nearness means similarity, while the directions of the map mean nothing on their own. Colour shows the cluster.</p>
        <h4>The card</h4>
        <ul><li>At the top, a small drawing that mimics what the library does; below it, a one-line description.</li>
          <li>On the ${LIVE} cards marked <b>▶</b> the library itself runs; it loads when you zoom in. Open it larger with <b>⤢</b> in the corner and try it.</li>
          <li>Click a card to open its details: size, licence, year, what it does and the libraries it is closest to.</li>
          <li>With <b>⇄</b> you can put up to three libraries side by side and compare them.</li></ul>
        <h4>Getting around</h4>
        <p>Drag to pan, zoom with the wheel or two fingers. <kbd>/</kbd> searches, <kbd>Esc</kbd> closes. You can drag a card to place it by hand; the others make room. The address bar keeps the library you picked, so you can share the link.</p>
        <h4>How was it made?</h4>
        <p>Each library becomes a row of numbers from its answers to thirteen questions (what it draws on, which realm it works in, how much of it is computation…) plus its size, age and popularity. The map is computed from those rows with t-SNE, then spaced out so that no two cards overlap. Size, star and year figures are approximate.</p>`,
      more: (n) => `and ${n} more · highlighted on the map`, none: "Nothing found.",
      sheet: "Details", live: "▶ live", liveLine: "The library itself runs inside the card.", tryIt: "Open larger and try ⤢", noLive: "This library has no live demo in the atlas.",
      clusters: "Clusters", tour: "Tour", hide: "Hide ▴", other: "Türkçe",
      cmpAdd: "⇄ Compare", cmpIn: "✓ In comparison", cmpNear: "Compare with its closest", cmpCard: "Add to / remove from comparison",
      cmpTitle: "Comparison", cmpGo: (n) => `Compare (${n}) →`, cmpEmpty: "+ Add a library", cmpClear: "Clear",
      cmpHint1: "Pick one more: ⇄ on a card, the button in its details, or an empty slot.",
      cmpFull: (x) => `Three at most; ${x} was taken out.`, cmpPick: "Type the library to add to the comparison…",
      cmpOnlyDiff: "Only show differences", cmpOnMap: "Show on map", cmpRemove: "Remove", cmpBig: "big difference",
      cmpAlike: (a, b, p) => `<b>${a}</b> and <b>${b}</b> are ${p}% alike`,
      cmpStory: (x, y) => `They differ most on <b>${x}</b> and are most alike on <b>${y}</b>.`,
      year: "Year", license: "Licence", size: "Size", stars: "GitHub", kb: (k) => (k >= 1000 ? `${(k / 1000).toFixed(1)} MB` : `${k} kB`),
    },
  };
  const t = (k, ...a) => { const v = STR[LOC][k]; return typeof v === "function" ? v(...a) : v; };

  $(".brand .eyebrow").textContent = t("eyebrow");
  $(".brand h1").textContent = t("name");
  $(".brand p").textContent = t("intro");
  $("#onlyLive").innerHTML = `${t("onlyLive")} <u id="liveCount">${LIVE}</u>`;
  $("#openAxes").textContent = t("axes");
  $("#q").placeholder = t("search");
  const museum = $("#enterMuseum");
  museum.classList.add("ui-museum");
  museum.innerHTML = `<b>${t("museum")}</b><span>${t("museumLine")}</span><u>${t("enter")}</u>`;

  // ——— How to read ———
  const how = document.createElement("section");
  how.className = "sheet--big ui-how"; how.id = "howto"; how.setAttribute("aria-label", t("howTitle"));
  how.innerHTML = `<header><b>${t("howTitle")}</b><button type="button" aria-label="${t("close")}" data-close>✕</button></header>
    <div class="body">${t("howBody")}<p class="ui-how-acts"></p></div>`;
  stage.appendChild(how);
  $(".ui-how-acts", how).append($("#openAxes"), $("#resolve"), $("#resetPin"));
  $("#resolve").textContent = t("recompute");
  const openHow = () => how.setAttribute("data-open", "");
  how.addEventListener("click", (e) => { if (e.target.closest("[data-close]") || e.target.closest("#openAxes")) how.removeAttribute("data-open"); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") how.removeAttribute("data-open"); });
  document.querySelectorAll(".rail .note").forEach((n) => n.remove());
  const howBtn = () => { const b = document.createElement("button"); b.type = "button"; b.className = "ui-howbtn"; b.textContent = t("how"); b.addEventListener("click", openHow); return b; };

  // ——— Search with a result list ———
  // In pick mode (an empty comparison slot was clicked) a result goes into the comparison.
  const q = $("#q"), search = q.closest(".search");
  const results = document.createElement("ul");
  results.className = "ui-results"; results.hidden = true;
  search.after(results);
  let picking = false;
  const matchesQ = (l, s) => `${l.name} ${l.tag} ${A.CATS[l.cat].label}`.toLocaleLowerCase(LOC).includes(s);
  function list() {
    const s = q.value.trim().toLocaleLowerCase(LOC);
    if (!s) { results.hidden = true; return; }
    const hits = A.LIBS.filter((l) => matchesQ(l, s)).sort((a, b) => (b.name.toLocaleLowerCase(LOC).startsWith(s) - a.name.toLocaleLowerCase(LOC).startsWith(s)) || b.stars - a.stars);
    results.innerHTML = hits.length
      ? hits.slice(0, 8).map((l) => `<li><button type="button" data-go="${l.i}"><i style="--c:var(--cat-${l.cat})"></i><b>${esc(l.name)}</b><span>${esc(A.CATS[l.cat].label)}</span></button></li>`).join("") + (hits.length > 8 ? `<li class="more">${t("more", hits.length - 8)}</li>` : "")
      : `<li class="more">${t("none")}</li>`;
    results.hidden = false;
  }
  q.addEventListener("input", list);
  q.addEventListener("blur", () => setTimeout(() => { if (picking && document.activeElement !== q && !results.contains(document.activeElement)) endPick(); }, 200));
  q.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { const b = $("button[data-go]", results); if (b) { e.preventDefault(); go(+b.dataset.go); } }
    else if (e.key === "ArrowDown") { const b = $("button[data-go]", results); if (b) { e.preventDefault(); b.focus(); } }
    else if (e.key === "Escape") { q.value = ""; q.dispatchEvent(new Event("input")); q.blur(); endPick(); }
  });
  results.addEventListener("keydown", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    const li = b.parentElement;
    if (e.key === "ArrowDown") { e.preventDefault(); li.nextElementSibling?.querySelector("button")?.focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); (li.previousElementSibling?.querySelector("button") || q).focus(); }
  });
  results.addEventListener("click", (e) => { const b = e.target.closest("[data-go]"); if (b) go(+b.dataset.go); });
  function go(i) {
    results.hidden = true;
    if (picking) { endPick(); q.value = ""; q.dispatchEvent(new Event("input")); toggleCmp(i, true); return; }
    A.goTo(i); if (app.hasAttribute("data-rail")) A.rail(false); closePops();
  }
  function startPick() { picking = true; app.setAttribute("data-picking", ""); q.placeholder = t("cmpPick"); if (VAR === "a" && innerWidth <= 900) A.rail(true); q.focus(); }
  function endPick() { if (!picking) return; picking = false; app.removeAttribute("data-picking"); q.placeholder = t("search"); }
  addEventListener("keydown", (e) => { if (e.key === "/" && !e.target.closest("input, textarea")) { e.preventDefault(); if (VAR === "a" && innerWidth <= 900) A.rail(true); q.focus(); } });

  // ——— The selected card's sheet, outside the card ———
  const kp = document.createElement("aside");
  kp.className = "ui-kp"; kp.id = "kp"; kp.hidden = true; kp.setAttribute("aria-label", t("sheet"));
  function fill(i) {
    const l = A.LIBS[i], c = A.cards[i], live = !!A.DEMO_OF[l.name], inC = A.compare.includes(i);
    kp.innerHTML = `<button type="button" class="ui-kp-x" aria-label="${t("close")}">✕</button>
      <p class="ui-kp-cat"><i style="--c:var(--cat-${l.cat})"></i>${esc(A.CATS[l.cat].label)} · ${l.year}</p>
      <h2>${esc(l.name)}</h2><p class="ui-kp-tag">${esc(l.tag)}</p>
      <p class="ui-kp-cmp"><button type="button" data-cmpt="${i}" aria-pressed="${inC}">${inC ? t("cmpIn") : t("cmpAdd")}</button><button type="button" data-cmpnear="${i}">${t("cmpNear")}</button></p>
      ${live ? `<p class="ui-kp-live"><b>${t("live")}</b> ${t("liveLine")} <button type="button" data-wing="${i}">${t("tryIt")}</button></p>` : `<p class="ui-kp-live is-no">${t("noLive")}</p>`}
      <div class="ui-kp-sheet">${$(".sheet", c.el).innerHTML}</div>`;
  }
  kp.addEventListener("click", (e) => {
    if (e.target.closest(".ui-kp-x")) return A.deselect();
    const g = e.target.closest("[data-go]"); if (g) return A.goTo(+g.dataset.go);
    const w = e.target.closest("[data-wing]"); if (w) return A.toggleWing(+w.dataset.wing);
    const ct = e.target.closest("[data-cmpt]"); if (ct) return toggleCmp(+ct.dataset.cmpt);
    const cn = e.target.closest("[data-cmpnear]"); if (cn) return compareNear(+cn.dataset.cmpnear);
    const m = e.target.closest(".cmpadd"); if (m) return toggleCmp(+m.dataset.cmp);
    if (e.target.closest("[data-ax]")) $("#openAxes").click();
  });
  addEventListener("atlas:select", (e) => {
    const i = e.detail; fill(i); kp.hidden = false; app.setAttribute("data-kp", "");
    history.replaceState(null, "", `#${slug(A.LIBS[i].name)}`);
  });
  addEventListener("atlas:deselect", () => { kp.hidden = true; app.removeAttribute("data-kp"); history.replaceState(null, "", location.pathname + location.search); });
  function fromHash() {
    const h = decodeURIComponent(location.hash.slice(1)); if (!h) return;
    const l = A.LIBS.find((x) => slug(x.name) === h); if (l && A.sel !== l.i) A.goTo(l.i);
  }
  addEventListener("hashchange", fromHash);
  setTimeout(fromHash, 350);

  // ——— Comparison ———
  // Three slots, each with its own colour, so a library keeps one colour from the card on
  // the map to the dock to the comparison screen.
  const SLOT = ["#E4572E", "#2E7DD7", "#169E86"];
  const slotOf = (i) => A.compare.indexOf(i);
  let note = "";
  function toggleCmp(i, add) {
    if (A.compare.includes(i)) { if (add) return; A.removeCompare(i); return; }
    if (A.compare.length >= 3) note = t("cmpFull", A.LIBS[A.compare[0]].name);
    A.addCompare(i);
  }
  function compareNear(i) {
    A.compare.splice(0);
    [i, ...A.LIBS[i].near.slice(0, 2)].forEach((j) => A.addCompare(j));
    openCmp();
  }
  // A ⇄ on every card, beside its number.
  A.cards.forEach((c, i) => {
    const b = document.createElement("button");
    b.type = "button"; b.className = "ui-cmpbtn"; b.title = t("cmpCard"); b.setAttribute("aria-label", t("cmpCard")); b.textContent = "⇄";
    b.addEventListener("pointerdown", (e) => e.stopPropagation());
    b.addEventListener("click", (e) => { e.stopPropagation(); toggleCmp(i); });
    $(".head span", c.el).prepend(b);
  });
  const dock = document.createElement("div");
  dock.className = "ui-dock"; dock.hidden = true;
  stage.appendChild(dock);
  function syncCmp() {
    const n = A.compare.length;
    A.cards.forEach((c, i) => {
      const s = slotOf(i);
      if (s >= 0) { c.el.dataset.cmpN = s + 1; c.el.style.setProperty("--slot", SLOT[s]); }
      else { delete c.el.dataset.cmpN; c.el.style.removeProperty("--slot"); }
    });
    dock.hidden = n === 0;
    dock.innerHTML = `<b class="ui-dock-t">${t("cmpTitle")}</b>
      <ol class="ui-dock-slots">${[0, 1, 2].map((s) => {
        const i = A.compare[s];
        return i === undefined
          ? `<li class="is-empty"><button type="button" data-pick>${t("cmpEmpty")}</button></li>`
          : `<li style="--slot:${SLOT[s]}"><i>${s + 1}</i><button type="button" data-show="${i}">${esc(A.LIBS[i].name)}</button><button type="button" class="x" data-rm="${i}" aria-label="${t("cmpRemove")}">✕</button></li>`;
      }).join("")}</ol>
      <button type="button" class="ui-dock-go" data-open ${n < 2 ? "disabled" : ""}>${t("cmpGo", n)}</button>
      <button type="button" class="ui-dock-x" data-clear aria-label="${t("cmpClear")}" title="${t("cmpClear")}">✕</button>
      ${note || n === 1 ? `<p class="ui-dock-note">${note || t("cmpHint1")}</p>` : ""}`;
    note = "";
    if (!kp.hidden && A.sel >= 0) fill(A.sel);
    if (!cmp.hidden) n >= 2 ? renderCmp() : closeCmp();
  }
  dock.addEventListener("click", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.rm) A.removeCompare(+b.dataset.rm);
    else if (b.dataset.show) A.goTo(+b.dataset.show);
    else if ("pick" in b.dataset) startPick();
    else if ("open" in b.dataset) openCmp();
    else if ("clear" in b.dataset) { A.compare.splice(0); A.removeCompare(-1); syncCmp(); }
  });
  addEventListener("atlas:compare", syncCmp);

  // The comparison screen
  const cmp = document.createElement("section");
  cmp.className = "ui-cmp"; cmp.hidden = true; cmp.setAttribute("role", "dialog"); cmp.setAttribute("aria-label", t("cmpTitle"));
  document.body.appendChild(cmp);
  let onlyDiff = false;
  const sim = (a, b) => Math.round((1 - Math.sqrt(a.v.reduce((s, x, k) => s + (x - b.v[k]) ** 2, 0) / a.v.length)) * 100);
  function renderCmp() {
    const L = A.compare.map((i) => A.LIBS[i]), n = L.length;
    const cols = `minmax(150px, 1.1fr) repeat(${n}, minmax(0, 1fr))`;
    const rows = A.AXES.map((a, ix) => { const v = L.map((l) => l.v[ix]); return { a, ix, v, span: Math.max(...v) - Math.min(...v) }; });
    const ranked = [...rows].sort((p, q2) => q2.span - p.span);
    // "Most alike" only counts what at least one of them actually has: two zeros say nothing.
    const shared = ranked.filter((r) => Math.max(...r.v) >= 0.3);
    const alike = (shared.length ? shared : ranked)[(shared.length ? shared : ranked).length - 1];
    const pairs = [];
    for (let x = 0; x < n; x++) for (let y = x + 1; y < n; y++) pairs.push(t("cmpAlike", esc(L[x].name), esc(L[y].name), sim(L[x], L[y])));
    const head = L.map((l, s) => `<div class="ui-cmp-lib" style="--slot:${SLOT[s]}">
        <p class="ui-cmp-k"><i>${s + 1}</i><span style="--c:var(--cat-${l.cat})">${esc(A.CATS[l.cat].label)}</span></p>
        <h3>${esc(l.name)}</h3><p class="ui-cmp-tag">${esc(l.tag)}</p>
        <dl><div><dt>${t("year")}</dt><dd>${l.year}</dd></div><div><dt>${t("license")}</dt><dd>${esc(l.lic)}</dd></div><div><dt>${t("size")}</dt><dd>${t("kb", l.kb)}</dd></div><div><dt>${t("stars")}</dt><dd>~${l.stars}k</dd></div></dl>
        ${A.DEMO_OF[l.name] ? `<p class="ui-cmp-live">${t("live")}</p>` : ""}
        <p class="ui-cmp-acts"><button type="button" data-show="${l.i}">${t("cmpOnMap")}</button><button type="button" data-rm="${l.i}">${t("cmpRemove")}</button></p>
      </div>`).join("");
    const fams = A.AXIS_FAM.map((f) => {
      const fr = rows.filter((r) => f.ax.includes(r.a)), shown = onlyDiff ? fr.filter((r) => r.span >= 0.2) : fr;
      if (!shown.length) return "";
      return `<div class="ui-cmp-fam"><h4>${esc(f.t)}</h4></div>` + shown.map((r) => `
        <div class="ui-cmp-ax${r.span >= 0.35 ? " is-big" : ""}"><b>${esc(r.a)}</b><span>${esc(A.AXIS_INFO[r.a].d)}</span>${r.span >= 0.35 ? `<em>${t("cmpBig")}</em>` : ""}</div>
        ${r.v.map((v, s) => `<div class="ui-cmp-cell" style="--slot:${SLOT[s]}"><i style="--w:${Math.round(v * 100)}%"></i><u>${Math.round(v * 100)}</u></div>`).join("")}`).join("");
    }).join("");
    cmp.innerHTML = `<div class="ui-cmp-in">
      <header><h2>${t("cmpTitle")}</h2>
        <label class="ui-cmp-diff"><input type="checkbox" ${onlyDiff ? "checked" : ""}> ${t("cmpOnlyDiff")}</label>
        <button type="button" class="ui-cmp-x" aria-label="${t("close")}">✕</button></header>
      <div class="ui-cmp-sum"><p>${t("cmpStory", esc(ranked[0].a), esc(alike.a))}</p><p>${pairs.join(" · ")}</p></div>
      <div class="ui-cmp-grid" style="grid-template-columns:${cols};--n:${n}"><div></div>${head}${fams}</div>
    </div>`;
  }
  function openCmp() { if (A.compare.length < 2) return; renderCmp(); cmp.hidden = false; app.setAttribute("data-cmp", ""); $(".ui-cmp-x", cmp).focus(); }
  function closeCmp() { cmp.hidden = true; app.removeAttribute("data-cmp"); }
  cmp.addEventListener("click", (e) => {
    if (e.target === cmp || e.target.closest(".ui-cmp-x")) return closeCmp();
    const b = e.target.closest("button"); if (!b) return;
    if (b.dataset.rm) A.removeCompare(+b.dataset.rm);
    else if (b.dataset.show) { closeCmp(); A.goTo(+b.dataset.show); }
  });
  cmp.addEventListener("change", (e) => { if (e.target.matches("input[type=checkbox]")) { onlyDiff = e.target.checked; renderCmp(); } });
  addEventListener("keydown", (e) => { if (e.key === "Escape" && !cmp.hidden) { e.stopImmediatePropagation(); closeCmp(); } }, true);

  // ——— Popovers (tour, clusters) for the variants without a rail ———
  const pops = [];
  function pop(label, content, cls = "") {
    const wrap = document.createElement("div"); wrap.className = `ui-pop ${cls}`;
    const b = document.createElement("button"); b.type = "button"; b.className = "ui-popbtn"; b.textContent = label; b.setAttribute("aria-expanded", "false");
    const panel = document.createElement("div"); panel.className = "ui-poppanel"; panel.hidden = true; panel.append(...content);
    b.addEventListener("click", () => { const open = panel.hidden; closePops(); panel.hidden = !open; b.setAttribute("aria-expanded", String(open)); });
    wrap.append(b, panel); pops.push([b, panel]);
    return wrap;
  }
  function closePops() { pops.forEach(([b, p]) => { p.hidden = true; b.setAttribute("aria-expanded", "false"); }); }
  addEventListener("pointerdown", (e) => { if (!e.target.closest(".ui-pop")) closePops(); });
  $("#tour").addEventListener("click", (e) => { if (e.target.closest("[data-stop]")) closePops(); });
  const block = (title, ...nodes) => { const d = document.createElement("div"); d.className = "block"; d.innerHTML = `<div class="block__head"><b>${title}</b></div>`; d.append(...nodes); return d; };
  const langLink = () => { if (!ALT) return null; const a = document.createElement("a"); a.className = "ui-lang"; a.href = ALT + location.hash; a.textContent = t("other"); a.lang = EN ? "tr" : "en"; return a; };

  // ——— A · the rail, in the order it is used ———
  if (VAR === "a") {
    const scroll = $("#railScroll"), brand = $(".brand", scroll);
    const s = block("Ara", search, results, $("#onlyLive")); s.classList.add("ui-sticky");
    $(".block__head", s).append($("#hitCount"));
    const cl = block("Kümeler", $("#legend"), $("#catNote"));
    const tourD = document.createElement("details"); tourD.className = "ui-tour block"; tourD.open = true;
    tourD.innerHTML = `<summary class="block__head"><b>Tur</b><span>altı durak</span></summary>`; tourD.append($("#tour"));
    const foot = document.createElement("div"); foot.className = "ui-foot"; foot.append(howBtn());
    scroll.replaceChildren(brand, s, cl, tourD, museum, foot);
    stage.appendChild(kp); // used only on a phone; on a desktop the sheet stays under the card
  }

  // ——— B · a top bar, and the sheet in a drawer on the right; b2–b6 are its derivatives ———
  if (VAR[0] === "b") {
    const el = (tag, cls, html = "") => { const e = document.createElement(tag); e.className = cls; e.innerHTML = html; return e; };
    const top = el("header", "ui-top");
    const brand = el("div", "ui-brand", `<b>${t("name")}</b><span>${t("counts")}</span>`);
    const sw = el("div", "ui-searchwrap"); sw.append(search, results);
    const tools = el("div", "ui-tools");
    const legend = $("#legend"), catNote = $("#catNote"), tour = $("#tour"), live = $("#onlyLive");
    // The tour stops and the clusters can carry their own sentence, for the variants with room for it.
    const withNotes = () => {
      [...legend.children].forEach((b) => b.insertAdjacentHTML("beforeend", `<em class="ui-catnote">${esc(A.CATS[b.dataset.cat].note)}</em>`));
      [...tour.children].forEach((b, n) => b.insertAdjacentHTML("beforeend", `<em class="ui-stopnote">${esc(A.TOUR[n].d.split(". ")[0])}.</em>`));
    };

    if (VAR === "b" || VAR === "b1") {
      tools.append(pop("Kümeler ▾", [legend, catNote], "is-cats"), live, pop("Tur ▾", [tour]), museum, howBtn());
      top.append(brand, sw, tools);
    }
    // b2 · two storeys: the clusters in view under the bar, a ribbon that can be folded away
    // (open by default; the choice is remembered). No live-demo filter here.
    if (VAR === "b2") {
      const KEY = "atlas-kumeler";
      const show = el("button", "ui-ribbon-show", `${t("clusters")} ▾`); show.type = "button";
      const hide = el("button", "ui-ribbon-hide", t("hide")); hide.type = "button";
      tools.append(show, pop(`${t("tour")} ▾`, [tour]), museum, howBtn());
      const ll = langLink(); if (ll) tools.append(ll);
      const row = el("div", "ui-catrow"); row.append(legend, catNote, hide);
      const set = (open) => {
        top.toggleAttribute("data-ribbon-off", !open);
        show.setAttribute("aria-expanded", String(open)); hide.setAttribute("aria-expanded", String(open));
        try { localStorage.setItem(KEY, open ? "1" : "0"); } catch {}
      };
      let open = true;
      try { open = localStorage.getItem(KEY) !== "0"; } catch {}
      set(open);
      show.addEventListener("click", () => set(true));
      hide.addEventListener("click", () => set(false));
      top.append(brand, sw, tools, row);
    }
    // b3 · the search in the middle, as the main way in
    if (VAR === "b3") {
      q.placeholder = "Ne yapmak istiyorsunuz? Harita, ses, fizik, D3…";
      tools.append(pop("Kümeler", [legend, catNote], "is-cats"), pop("Tur", [tour]), live, museum, howBtn());
      top.append(brand, sw, tools);
    }
    // b4 · tabs that open a wide panel under the bar
    if (VAR === "b4") {
      withNotes();
      const tabs = el("nav", "ui-tabs"), panel = el("div", "ui-mega"); panel.hidden = true;
      const P = {
        kumeler: ["Kümeler", () => [el("p", "ui-mega-lead", "Bir kümeyi tıklayınca yalnız o kalır; yeniden tıklayınca hepsi döner."), legend]],
        tur: ["Tur", () => [el("p", "ui-mega-lead", "Altı durakta atlasın söyledikleri. Her durak haritada bir yere götürür ve ilgili kartları açar."), tour]],
        muze: ["Müze", () => [el("p", "ui-mega-lead", "Bu kütüphanelerle yapılmış 118 gazetecilik işi, Bell Labs'in Holmdel binasını örnek alan bir müzede. Dört kat, sekiz kanat; kuzey kapısından çıkınca mezuniyet projelerinin pavyonu."), museum]],
        nasil: ["Nasıl okunur?", null],
      };
      const sec = {};
      Object.entries(P).forEach(([k, [label, make]]) => {
        const b = el("button", "ui-tab", label); b.type = "button"; b.dataset.tab = k; tabs.append(b);
        if (make) { sec[k] = el("div", "ui-mega-sec"); sec[k].append(...make()); panel.append(sec[k]); }
      });
      let open = null;
      const show = (k) => {
        open = open === k ? null : k;
        panel.hidden = !open;
        Object.entries(sec).forEach(([n, s]) => { s.hidden = n !== open; });
        tabs.querySelectorAll(".ui-tab").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.tab === open)));
      };
      tabs.addEventListener("click", (e) => { const b = e.target.closest(".ui-tab"); if (!b) return; if (b.dataset.tab === "nasil") { show(null); return openHow(); } show(b.dataset.tab); });
      tour.addEventListener("click", (e) => { if (e.target.closest("[data-stop]")) show(null); });
      museum.addEventListener("click", () => show(null));
      addEventListener("keydown", (e) => { if (e.key === "Escape" && open) show(null); });
      tools.append(live);
      top.append(brand, tabs, sw, tools, panel);
    }
    // b5 · compact: one thin line, clusters as colour dots, search that widens when used
    if (VAR === "b5") {
      brand.innerHTML = `<b>${t("name")}</b>`;
      [...legend.children].forEach((b) => { b.title = `${A.CATS[b.dataset.cat].label} · ${b.querySelector("u").textContent}`; });
      live.innerHTML = `▶ <u>${LIVE}</u>`; live.title = "Canlı demosu olanlar";
      tools.append(pop("Tur", [tour]), museum, howBtn());
      top.append(brand, legend, sw, live, tools);
    }
    // b6 · the bar in the cards' own language: paper, ink rules, the card buttons
    if (VAR === "b6") {
      tools.append(live, pop("Tur ▾", [tour]), museum, howBtn());
      const row = el("div", "ui-catrow"); row.append(legend);
      top.append(brand, sw, tools, row);
    }
    app.prepend(top); app.appendChild(kp);
  }

  // ——— C · floating panels over a full-screen map ———
  if (VAR === "c") {
    const p = document.createElement("div"); p.className = "ui-float";
    const brand = document.createElement("div"); brand.className = "ui-brand"; brand.innerHTML = `<b>${t("name")}</b><span>${N} kütüphane · 10 küme · ${LIVE} canlı</span>`;
    const row = document.createElement("div"); row.className = "ui-row";
    row.append(pop("Tur", [$("#tour")]), pop("Kümeler", [$("#legend"), $("#catNote")], "is-cats"), $("#onlyLive"), howBtn());
    p.append(brand, search, results, row);
    stage.append(p, museum, kp);
  }

  // Panels that sit inside the map must not let their clicks, drags and wheel reach it:
  // the map would read a click on a result as a click on empty ground and deselect.
  stage.querySelectorAll(".ui-float, .ui-kp, .ui-museum, .ui-how, .ui-dock").forEach((el) =>
    ["pointerdown", "click", "dblclick", "wheel", "touchstart"].forEach((ev) => el.addEventListener(ev, (e) => e.stopPropagation(), { passive: true })));
  syncCmp();
})();
