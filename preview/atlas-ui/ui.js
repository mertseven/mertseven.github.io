// The interface layer for the atlas overhaul previews. Loaded after the atlas itself; it
// reads window.atlas and the atlas's own elements and rearranges them. The parts every
// variant shares: plainer words, a result list under the search, a "how to read" sheet,
// the museum as a proper way in, the address bar following the selection, and a sheet
// panel (a drawer, a floating card or, on a phone, a bottom sheet) for the selected card.
// Then each variant (data-variant a, b, c) puts the pieces in its own place.
(() => {
  const me = document.currentScript, MODE = me.dataset.mode, VAR = me.dataset.variant;
  const A = window.atlas, $ = (s, r = document) => r.querySelector(s);
  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  const slug = (s) => s.toLocaleLowerCase("tr").replace(/\.js$/, "").replace(/[^a-z0-9ğüşıöç]+/g, "-").replace(/^-|-$/g, "");
  const LIVE = Object.keys(A.DEMO_OF).length;
  const app = $("#app"), stage = $("#stage");
  app.dataset.ui = VAR;
  document.documentElement.dataset.ui = MODE;

  // ——— Words ———
  $(".brand .eyebrow").textContent = `${A.LIBS.length} kütüphane · ${Object.keys(A.CATS).length} küme · ${LIVE} canlı demo`;
  $(".brand p").textContent = "İnteraktif medyayı mümkün kılan JavaScript kütüphaneleri. Birbirine benzeyenler yan yana duruyor; renk kümeyi, ▶ işareti kartın içinde çalışan bir demoyu gösteriyor.";
  $("#onlyLive").innerHTML = `▶ Canlı demosu olanlar <u id="liveCount">${LIVE}</u>`;
  $("#openAxes").textContent = "Kartlardaki çubuklar ne anlatıyor?";
  $("#q").placeholder = "Kütüphane, konu ya da teknik ara…";
  const museum = $("#enterMuseum");
  museum.classList.add("ui-museum");
  museum.innerHTML = `<b>Müze</b><span>Bu kütüphanelerle yapılmış 118 gazetecilik işi, bir binanın içinde.</span><u>Gir →</u>`;

  // ——— How to read ———
  const how = document.createElement("section");
  how.className = "sheet--big ui-how"; how.id = "howto"; how.setAttribute("aria-label", "Bu atlas nasıl okunur");
  how.innerHTML = `<header><b>Bu atlas nasıl okunur?</b><button type="button" aria-label="Kapat" data-close>✕</button></header>
    <div class="body">
      <h4>Harita</h4>
      <p>Her kart bir JavaScript kütüphanesi. Birbirine benzeyen kütüphaneler yan yana düşüyor: yakınlık benzerlik demek, haritanın yönleri tek başına bir şey anlatmıyor. Renk kümeyi gösteriyor.</p>
      <h4>Kart</h4>
      <ul><li>Üstte kütüphanenin işini taklit eden küçük bir çizim, altında tek cümlelik tarifi.</li>
        <li><b>▶</b> işaretli ${LIVE} kartta kütüphanenin kendisi çalışıyor; yakınlaşınca yüklenir. Köşedeki <b>⤢</b> ile büyütüp deneyebilirsiniz.</li>
        <li>Karta tıklayınca künyesi açılır: boyut, lisans, yıl, ne yaptığı ve en çok benzediği kütüphaneler.</li></ul>
      <h4>Gezinme</h4>
      <p>Sürükleyerek kaydırın, tekerlekle ya da iki parmakla yakınlaşın. <kbd>/</kbd> ile arayın, <kbd>Esc</kbd> ile kapatın. Bir kartı sürükleyip elle yerleştirebilirsiniz; diğerleri ona yer açar. Adres çubuğu seçtiğiniz kütüphaneyi tutar, bağlantıyı paylaşabilirsiniz.</p>
      <h4>Nasıl hesaplandı?</h4>
      <p>Her kütüphane on üç soruya verdiği cevaplarla (neyin üstüne çiziyor, hangi âlemde çalışıyor, ne kadarı hesap…) ve boyutu, yaşı, ilgisiyle bir sayı dizisine dönüşüyor. Harita bu dizilerden t-SNE ile hesaplanıyor, sonra kartlar çakışmasın diye aralanıyor. Boyut, yıldız ve yıl değerleri yaklaşık.</p>
      <p class="ui-how-acts"></p>
    </div>`;
  stage.appendChild(how);
  const howActs = $(".ui-how-acts", how);
  howActs.append($("#openAxes"), $("#resolve"), $("#resetPin"));
  $("#resolve").textContent = "Haritayı yeniden hesapla";
  const openHow = () => how.setAttribute("data-open", "");
  how.addEventListener("click", (e) => { if (e.target.closest("[data-close]")) how.removeAttribute("data-open"); if (e.target.closest("#openAxes")) how.removeAttribute("data-open"); });
  addEventListener("keydown", (e) => { if (e.key === "Escape") how.removeAttribute("data-open"); });
  document.querySelectorAll(".rail .note").forEach((n) => n.remove());
  const howBtn = () => { const b = document.createElement("button"); b.type = "button"; b.className = "ui-howbtn"; b.textContent = "Nasıl okunur?"; b.addEventListener("click", openHow); return b; };

  // ——— Search with a result list ———
  const q = $("#q"), search = q.closest(".search");
  const results = document.createElement("ul");
  results.className = "ui-results"; results.hidden = true;
  search.after(results);
  const matchesQ = (l, s) => `${l.name} ${l.tag} ${A.CATS[l.cat].label}`.toLocaleLowerCase("tr").includes(s);
  function list() {
    const s = q.value.trim().toLocaleLowerCase("tr");
    if (!s) { results.hidden = true; return; }
    const hits = A.LIBS.filter((l) => matchesQ(l, s)).sort((a, b) => (b.name.toLocaleLowerCase("tr").startsWith(s) - a.name.toLocaleLowerCase("tr").startsWith(s)) || b.stars - a.stars);
    results.innerHTML = hits.length
      ? hits.slice(0, 8).map((l) => `<li><button type="button" data-go="${l.i}"><i style="--c:var(--cat-${l.cat})"></i><b>${esc(l.name)}</b><span>${esc(A.CATS[l.cat].label)}</span></button></li>`).join("") + (hits.length > 8 ? `<li class="more">ve ${hits.length - 8} tane daha · haritada işaretli</li>` : "")
      : `<li class="more">Bir şey bulunamadı.</li>`;
    results.hidden = false;
  }
  q.addEventListener("input", list);
  q.addEventListener("keydown", (e) => {
    if (e.key === "Enter") { const b = $("button[data-go]", results); if (b) { e.preventDefault(); go(+b.dataset.go); } }
    else if (e.key === "ArrowDown") { const b = $("button[data-go]", results); if (b) { e.preventDefault(); b.focus(); } }
    else if (e.key === "Escape") { q.value = ""; q.dispatchEvent(new Event("input")); q.blur(); }
  });
  results.addEventListener("keydown", (e) => {
    const b = e.target.closest("button"); if (!b) return;
    const li = b.parentElement;
    if (e.key === "ArrowDown") { e.preventDefault(); li.nextElementSibling?.querySelector("button")?.focus(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); (li.previousElementSibling?.querySelector("button") || q).focus(); }
  });
  results.addEventListener("click", (e) => { const b = e.target.closest("[data-go]"); if (b) go(+b.dataset.go); });
  function go(i) { results.hidden = true; A.goTo(i); if (app.hasAttribute("data-rail")) A.rail(false); closePops(); }
  addEventListener("keydown", (e) => { if (e.key === "/" && !e.target.closest("input, textarea")) { e.preventDefault(); if (VAR === "a" && innerWidth <= 900) A.rail(true); q.focus(); } });

  // ——— The selected card's sheet, outside the card ———
  const kp = document.createElement("aside");
  kp.className = "ui-kp"; kp.id = "kp"; kp.hidden = true; kp.setAttribute("aria-label", "Künye");
  function fill(i) {
    const l = A.LIBS[i], c = A.cards[i], live = !!A.DEMO_OF[l.name];
    kp.innerHTML = `<button type="button" class="ui-kp-x" aria-label="Kapat">✕</button>
      <p class="ui-kp-cat"><i style="--c:var(--cat-${l.cat})"></i>${esc(A.CATS[l.cat].label)} · ${l.year}</p>
      <h2>${esc(l.name)}</h2><p class="ui-kp-tag">${esc(l.tag)}</p>
      ${live ? `<p class="ui-kp-live"><b>▶ canlı</b> Kütüphanenin kendisi kartın içinde çalışıyor. <button type="button" data-wing="${i}">Büyüt ve dene ⤢</button></p>` : `<p class="ui-kp-live is-no">Bu kütüphanenin atlasta canlı demosu yok.</p>`}
      <div class="ui-kp-sheet">${$(".sheet", c.el).innerHTML}</div>`;
  }
  kp.addEventListener("click", (e) => {
    if (e.target.closest(".ui-kp-x")) return A.deselect();
    const g = e.target.closest("[data-go]"); if (g) return A.goTo(+g.dataset.go);
    const w = e.target.closest("[data-wing]"); if (w) return A.toggleWing(+w.dataset.wing);
    const m = e.target.closest(".cmpadd"); if (m) { A.addCompare(+m.dataset.cmp); A.renderCmp(); $("#cmp").setAttribute("data-open", ""); return; }
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

  // ——— B · a top bar, and the sheet in a drawer on the right ———
  if (VAR === "b") {
    const top = document.createElement("header"); top.className = "ui-top";
    const brand = document.createElement("div"); brand.className = "ui-brand"; brand.innerHTML = `<b>Etkileşim Atlası</b><span>${A.LIBS.length} kütüphane · ${LIVE} canlı</span>`;
    const sw = document.createElement("div"); sw.className = "ui-searchwrap"; sw.append(search, results);
    const tools = document.createElement("div"); tools.className = "ui-tools";
    tools.append(pop("Kümeler ▾", [$("#legend"), $("#catNote")], "is-cats"), $("#onlyLive"), pop("Tur ▾", [$("#tour")]), museum, howBtn());
    top.append(brand, sw, tools);
    app.prepend(top); app.appendChild(kp);
  }

  // ——— C · floating panels over a full-screen map ———
  if (VAR === "c") {
    const p = document.createElement("div"); p.className = "ui-float";
    const brand = document.createElement("div"); brand.className = "ui-brand"; brand.innerHTML = `<b>Etkileşim Atlası</b><span>${A.LIBS.length} kütüphane · 10 küme · ${LIVE} canlı</span>`;
    const row = document.createElement("div"); row.className = "ui-row";
    row.append(pop("Tur", [$("#tour")]), pop("Kümeler", [$("#legend"), $("#catNote")], "is-cats"), $("#onlyLive"), howBtn());
    p.append(brand, search, results, row);
    stage.append(p, museum, kp);
  }

  // Panels that sit inside the map must not let their clicks, drags and wheel reach it:
  // the map would read a click on a result as a click on empty ground and deselect.
  stage.querySelectorAll(".ui-float, .ui-kp, .ui-museum, .ui-how").forEach((el) =>
    ["pointerdown", "click", "dblclick", "wheel", "touchstart"].forEach((t) => el.addEventListener(t, (e) => e.stopPropagation(), { passive: true })));
})();
