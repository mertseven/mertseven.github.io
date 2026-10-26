import { loadCatalog, escapeHtml } from "/assets/js/catalog.js";

// About, five layouts with the same content: a colophon, a stage, a timeline, a set of
// questions and a calling card. Content comes from the old About page and the catalogue.

const { projects } = await loadCatalog();
const PAPERS = (await (await fetch("/assets/data/catalog.json")).json()).publications;

const ME = {
  name: "Mert Seven",
  role: "Assistant Professor, Department of New Media and Communication, Yaşar University, İzmir",
  lead: "A new media scholar and <em>digital crafter</em>, building interactive systems as a form of <em>critical inquiry</em>.",
  body: [
    "I design and build interactive systems that turn abstract theories of digital culture into tangible, explorable experiences. My work, this website included, is a living artifact: a place to look at how technology shapes what we perceive and what we know.",
    "Grounded in sociology and a PhD in Communication Research, I approach new media not as a set of tools but as a system of logic, to be used and questioned at once.",
  ],
  open: "Always open to new projects, research collaborations and invitations to speak.",
  email: "mert.seven@yasar.edu.tr",
  phone: "+90 232 570 84 68",
  place: "Yaşar University, İzmir, Türkiye",
  cv: "/MertSeven_CV.pdf",
  links: [
    ["Google Scholar", "https://scholar.google.com/citations?user=qBnYCMsAAAAJ&hl=en"],
    ["ORCID", "https://orcid.org/0000-0002-7958-2407"],
    ["GitHub", "https://github.com/mertseven"],
    ["LinkedIn", "https://www.linkedin.com/in/mert-seven-b31621248"],
    ["SoundCloud", "https://on.soundcloud.com/HUA158qkwuKAbopF4K"],
  ],
  education: [
    ["2016–2024", "PhD, Communication Research", "Ege University, Graduate School of Social Sciences"],
    ["2011–2015", "BA, Sociology (full scholarship)", "İzmir University of Economics"],
  ],
  work: [
    ["2026–", "Assistant Professor", "Yaşar University, New Media and Communication"],
    ["2018–2025", "Research Assistant", "Yaşar University, New Media and Communication"],
    ["2017–2018", "Research Assistant", "Yaşar University, New Media and Journalism"],
  ],
  teaching: ["Interactive Media Applications", "Journalism Studio", "New Media Graduation Project", "Technology and Epistemology", "Mobile Applications in New Media", "Web Applications for New Media", "Digital Culture Investigations", "Computational Thinking", "New Media and Communication Technologies"],
};
const papers = [...PAPERS].sort((a, b) => b.year - a.year).slice(0, 5);
const nProjects = projects.length;

const linkList = (cls = "") => `<ul class="ab-links ${cls}">${ME.links.map(([n, u]) => `<li><a href="${u}" target="_blank" rel="noopener">${n} <span aria-hidden="true">↗</span></a></li>`).join("")}</ul>`;
const paperList = () => `<ol class="ab-papers">${papers.map((p) => `<li><a href="${escapeHtml(p.url)}">${escapeHtml(p.title)}</a> <span class="mono">${p.year}</span></li>`).join("")}</ol>`;
const rows = (list) => list.map(([y, a, b]) => `<li><span class="mono">${y}</span><span><b>${a}</b> ${b}</span></li>`).join("");

const SCENES = [
  {
    id: "kunye", label: "A · Künye",
    about: "<b>Bir kitabın künyesi gibi.</b> Üstte tek, büyük bir cümle; altında mono etiketli satırlar: şimdi, eğitim, dersler, deneyim, seçili yayınlar, başka yerler, iletişim. Portre küçük ve /work/'teki görseller gibi baskı dokulu. En sade, en editoryal yol; sitenin geri kalanıyla aynı dil.",
    html: () => `
      <section class="ab-a">
        <p class="label">About</p>
        <h1 class="ab-lead">${ME.lead}</h1>
        <div class="ab-a-grid">
          <figure class="ab-print"><img src="/images/portrait.jpg" alt="Mert Seven"></figure>
          <dl class="ab-dl">
            <dt>Now</dt><dd>${ME.role}.</dd>
            <dt>Practice</dt><dd>${ME.body.map((p) => `<p>${p}</p>`).join("")}</dd>
            <dt>Teaching</dt><dd class="ab-inline">${ME.teaching.join(" · ")}</dd>
            <dt>Education</dt><dd><ul class="ab-rows">${rows(ME.education)}</ul></dd>
            <dt>Experience</dt><dd><ul class="ab-rows">${rows(ME.work)}</ul></dd>
            <dt>Selected papers</dt><dd>${paperList()}</dd>
            <dt>Elsewhere</dt><dd>${linkList("ab-links--inline")}</dd>
            <dt>Contact</dt><dd><a class="ab-mail" href="mailto:${ME.email}">${ME.email}</a><br><span class="mono">${ME.phone}</span><br><a class="ab-cv" href="${ME.cv}">Full CV (PDF) ↓</a></dd>
          </dl>
        </div>
      </section>`,
  },
  {
    id: "sahne", label: "B · Sahne",
    about: "<b>Stüdyo ışığı altında.</b> Fotoğraf tam ekran ve karanlık; imleç bir spot ışığı gibi onu aydınlatıyor. Ad ve cümle sahnenin solunda. Aşağı inince sahne kâğıda dönüyor: dersler, yol, başka yerler üç sütunda. Ana sayfanın sinema perdesi hissini sürdürüyor; en etkileyici, ama fotoğrafa çok yaslanıyor.",
    html: () => `
      <section class="ab-b">
        <div class="ab-b-stage" data-spot>
          <img src="/images/mert-profile.jpg" alt="Mert Seven in the studio">
          <div class="ab-b-dark" aria-hidden="true"></div>
          <div class="ab-b-text">
            <p class="label">About</p>
            <h1>Mert <em>Seven</em></h1>
            <p class="ab-b-lead">${ME.lead}</p>
            <p class="ab-b-role">${ME.role}</p>
          </div>
        </div>
        <div class="ab-b-paper">
          <div class="ab-b-body">${ME.body.map((p) => `<p>${p}</p>`).join("")}</div>
          <div class="ab-b-cols">
            <div><h2 class="label">Teaching</h2><ul class="ab-plain">${ME.teaching.map((c) => `<li>${c}</li>`).join("")}</ul></div>
            <div><h2 class="label">Path</h2><ul class="ab-rows">${rows([...ME.work, ...ME.education])}</ul></div>
            <div><h2 class="label">Elsewhere</h2>${linkList()}<p><a class="ab-mail" href="mailto:${ME.email}">${ME.email}</a></p><p><a class="ab-cv" href="${ME.cv}">Full CV (PDF) ↓</a></p></div>
          </div>
        </div>
      </section>`,
  },
  {
    id: "zaman", label: "C · Zaman çizgisi",
    about: "<b>Bir yol olarak.</b> Kısa bir giriş, sonra yıllar: lisans, doktora, asistanlık, yayınlar, öğretim üyeliği. Yıllar mono ve büyük; her olay türüne göre işaretli (eğitim, iş, yayın). Okuması kolay ve dürüst; ama bir özgeçmişe fazla benzeyebilir ve projeler (yılları henüz katalogda yok) dışarıda kalıyor.",
    html: () => {
      const ev = [
        ...ME.education.map(([y, a, b]) => ({ y: Number(y.slice(-4)), kind: "Education", a, b: `${b} · ${y}` })),
        ...ME.work.map(([y, a, b]) => ({ y: Number(y.slice(0, 4)), kind: "Work", a, b: `${b} · ${y}` })),
        ...PAPERS.map((p) => ({ y: p.year, kind: "Paper", a: p.title, b: p.note || "", url: p.url })),
      ].sort((x, y) => y.y - x.y);
      const years = [...new Set(ev.map((e) => e.y))];
      return `
      <section class="ab-c">
        <p class="label">About</p>
        <h1 class="ab-lead">${ME.lead}</h1>
        <p class="ab-c-intro">${ME.body[1]}</p>
        <ol class="ab-c-line">
          ${years.map((y) => `
            <li><span class="ab-c-y mono">${y}</span>
              <ul>${ev.filter((e) => e.y === y).map((e) => `<li class="k-${e.kind}"><span class="label">${e.kind}</span>${e.url ? `<a href="${escapeHtml(e.url)}">${escapeHtml(e.a)}</a>` : `<b>${e.a}</b>`}<span class="ab-c-b">${escapeHtml(e.b)}</span></li>`).join("")}</ul>
            </li>`).join("")}
        </ol>
        <p class="ab-c-end"><span class="label">Contact</span> <a class="ab-mail" href="mailto:${ME.email}">${ME.email}</a> · <a class="ab-cv" href="${ME.cv}">Full CV (PDF) ↓</a></p>
      </section>`;
    },
  },
  {
    id: "sorular", label: "D · Sorular",
    about: "<b>Ana sayfadaki soru burada da.</b> Sayfa, ziyaretçinin aklındaki sorularla ilerliyor: kim, ne yapıyor, nerede öğretiyor, ne yazıyor, nerede okudu, nasıl ulaşırım. Sorular serif italik, cevaplar sade. Merak temasını sürdüren en özgün yol; ama biraz oyunbaz, akademik ziyaretçiye uzun gelebilir.",
    html: () => {
      const qa = [
        ["Who is this?", `<p>${ME.lead.replace(/<\/?em>/g, "")}</p>${ME.body.map((p) => `<p>${p}</p>`).join("")}`],
        ["What does he make?", `<p>Interactive systems, teaching tools and small experiments: ${nProjects} of them, all in <a href="/work/">the index</a>.</p>`],
        ["Where does he teach?", `<p>${ME.role}.</p><p class="ab-chips">${ME.teaching.map((c) => `<span>${c}</span>`).join("")}</p>`],
        ["What does he write?", paperList()],
        ["Where did he study?", `<ul class="ab-rows">${rows(ME.education)}</ul>`],
        ["How do I reach him?", `<p><a class="ab-mail" href="mailto:${ME.email}">${ME.email}</a></p>${linkList("ab-links--inline")}<p><a class="ab-cv" href="${ME.cv}">Full CV (PDF) ↓</a></p>`],
      ];
      return `
      <section class="ab-d">
        <h1 class="ab-d-h">curious about the <em>maker</em>?</h1>
        <ol class="ab-d-list">${qa.map(([q, a], i) => `
          <li><span class="mono">${String(i + 1).padStart(2, "0")}</span><h2>${q}</h2><div class="ab-d-a">${a}</div></li>`).join("")}
        </ol>
      </section>`;
    },
  },
  {
    id: "kart", label: "E · Kartvizit",
    about: "<b>Tek ekran, az ama öz.</b> Ad, bir cümle, ulaşma yolları ve özgeçmiş. Geri kalan her şey CV'de ve indekste. En hızlısı, mobilde en iyisi; ama bir akademisyenin dersleri ve yayınları burada görünmüyor.",
    html: () => `
      <section class="ab-e">
        <figure class="ab-e-face"><img src="/images/portrait.jpg" alt="Mert Seven"></figure>
        <h1>Mert <em>Seven</em>, PhD</h1>
        <p class="ab-e-lead">${ME.lead}</p>
        <p class="ab-e-role">${ME.role}.</p>
        <a class="ab-e-mail" href="mailto:${ME.email}">${ME.email}</a>
        ${linkList("ab-links--inline ab-e-links")}
        <a class="ab-e-cv" href="${ME.cv}">Download the CV <span aria-hidden="true">↓</span></a>
      </section>`,
  },
];

// ——— Page ———

const host = document.getElementById("about-page");
const modes = document.getElementById("modes");
const note = document.getElementById("about");
const row = document.createElement("div");
row.className = "modes-row";
for (const s of SCENES) {
  const b = document.createElement("button");
  b.type = "button";
  b.className = "chip";
  b.textContent = s.label;
  b.dataset.id = s.id;
  b.addEventListener("click", () => show(s.id));
  row.append(b);
}
modes.append(row);

function show(id) {
  const s = SCENES.find((x) => x.id === id) ?? SCENES[0];
  history.replaceState(null, "", `#${s.id}`);
  row.querySelectorAll(".chip").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.id === s.id)));
  note.innerHTML = s.about;
  host.innerHTML = s.html();
  host.dataset.scene = s.id;
  scrollTo(0, 0);
}

// The stage's spotlight follows the pointer.
addEventListener("pointermove", (e) => {
  const st = host.querySelector("[data-spot]");
  if (!st) return;
  const r = st.getBoundingClientRect();
  st.style.setProperty("--x", `${e.clientX - r.left}px`);
  st.style.setProperty("--y", `${e.clientY - r.top}px`);
}, { passive: true });

for (const b of document.querySelectorAll("[data-theme-set]")) {
  b.addEventListener("click", () => {
    document.documentElement.dataset.theme = b.dataset.themeSet;
    document.querySelectorAll("[data-theme-set]").forEach((x) => x.setAttribute("aria-pressed", String(x === b)));
  });
}

show(location.hash.slice(1));
