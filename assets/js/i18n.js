// The interface in English and Turkish. The language is the page's own <html lang>: the
// English pages live at /, the Turkish ones under /tr/, and both load the same scripts.
// Only the interface changes; project titles and summaries stay in the language they
// were written in.

export const lang = document.documentElement.lang === "tr" ? "tr" : "en";

// Pages that exist in both languages. Links to any other page keep the English address
// until that page has a Turkish one.
const BOTH = ["/", "/work/", "/search/"];

/** The address of `path` in this page's language, keeping its query and hash. */
export function href(path) {
  const [, p, rest] = path.match(/^([^?#]*)(.*)$/);
  return lang === "tr" && BOTH.includes(p) ? `/tr${p}${rest}` : path;
}

/** The same page in the other language, or null if it has no counterpart. */
export function counterpart(loc = location) {
  const p = lang === "tr" ? loc.pathname.replace(/^\/tr(?=\/)/, "") : loc.pathname;
  const page = p.replace(/index\.html$/, "");
  if (!BOTH.includes(page)) return null;
  return `${lang === "tr" ? page : `/tr${page}`}${loc.search}${loc.hash}`;
}

// Topic names in Turkish, for the interface and for search: "ağlar" finds the networks.
export const TOPIC_TR = {
  Philosophy: "felsefe", Networks: "ağlar", Data: "veri", Journalism: "gazetecilik", Storytelling: "hikâye anlatımı",
  Education: "eğitim", Mapping: "haritalama", Location: "konum", Mobile: "mobil", AR: "artırılmış gerçeklik",
  Interaction: "etkileşim", Interface: "arayüz", Design: "tasarım", Play: "oyun", Exhibition: "sergi", "3D": "3B",
  "Real-time": "gerçek zamanlı", Collaboration: "iş birliği", Tools: "araçlar", AI: "yapay zekâ", "Computer vision": "bilgisayarlı görü",
};
export const KIND_TR = { Featured: "Öne çıkan", Teaching: "Öğretim", Experiment: "Deney" };

export const topicName = (t) => (lang === "tr" ? TOPIC_TR[t] ?? t : t);
export const kindName = (k) => (lang === "tr" ? KIND_TR[k] ?? k : k);

const count = (n, one, many) => `${n} ${n === 1 ? one : many}`;

const STRINGS = {
  en: {
    projects: (n) => count(n, "project", "projects"),
    papers: (n) => count(n, "paper", "papers"),
    writings: (n) => count(n, "writing", "writings"),
    beneath: "beneath the surface",
    allResults: "all results →",
    nothing: (q) => `Nothing for “${q}” yet. Try a broader word.`,
    nothingBrowse: (q, link) => `Nothing for “${q}” yet. Try a broader word, or <a href="${link}">browse the index</a>.`,
    noLoad: (link) => `The index could not load. <a href="${link}">Open it directly</a>.`,
    noProject: (q) => `No project for “${q}” yet.`,
    try: "try",
    hints: ["networks", "Bergson", "journalism", "Three.js", "Frankfurt School", "misinformation", "teaching", "mapping", "interaction", "Nietzsche", "AR"],
    type: { Project: "Project", Research: "Research", Writing: "Writing" },
    openProject: "Open project",
    prevProject: "Previous project",
    nextProject: "Next project",
    close: "Close",
    topics: "Topics",
    stack: "Stack",
    index: "Index",
    view: "View",
    list: "List",
    images: "Images",
    chapter: {
      Featured: { title: "Featured", em: "work", note: "Systems, tools and visual essays at full scale." },
      Teaching: { title: "For the", em: "classroom", note: "Made for courses, juries and students." },
      Experiment: { title: "Small", em: "experiments", note: "Sketches, tests and things that might grow." },
    },
    kindWord: { "": "all", Featured: "featured", Teaching: "teaching", Experiment: "experimental" },
    anyTopic: "any topic",
    anyTool: "any tool",
    sentence: (kind, topic, stack) => `Show ${kind} projects about ${topic}, made with ${stack}.`,
    reset: "reset",
    shown: (n, total) => (n === total ? count(n, "project", "projects") : `${n} of ${total} projects`),
    toLight: "Switch to light mode",
    toDark: "Switch to dark mode",
  },
  tr: {
    projects: (n) => `${n} proje`,
    papers: (n) => `${n} makale`,
    writings: (n) => `${n} yazı`,
    beneath: "yüzeyin altında",
    allResults: "bütün sonuçlar →",
    nothing: (q) => `“${q}” için henüz bir şey yok. Daha genel bir kelime dene.`,
    nothingBrowse: (q, link) => `“${q}” için henüz bir şey yok. Daha genel bir kelime dene ya da <a href="${link}">indekse göz at</a>.`,
    noLoad: (link) => `İndeks yüklenemedi. <a href="${link}">Doğrudan aç</a>.`,
    noProject: (q) => `“${q}” için henüz proje yok.`,
    try: "dene",
    hints: ["ağlar", "Bergson", "gazetecilik", "Three.js", "felsefe", "eğitim", "haritalama", "etkileşim", "Nietzsche", "AR", "veri"],
    type: { Project: "Proje", Research: "Araştırma", Writing: "Yazı" },
    openProject: "Projeyi aç",
    prevProject: "Önceki proje",
    nextProject: "Sonraki proje",
    close: "Kapat",
    topics: "Konular",
    stack: "Araçlar",
    index: "İndeks",
    view: "Görünüm",
    list: "Liste",
    images: "Görseller",
    chapter: {
      Featured: { title: "Öne çıkan", em: "işler", note: "Tam ölçekte sistemler, araçlar ve görsel denemeler." },
      Teaching: { title: "Sınıf", em: "için", note: "Dersler, jüriler ve öğrenciler için yapıldı." },
      Experiment: { title: "Küçük", em: "deneyler", note: "Taslaklar, testler ve büyüyebilecek şeyler." },
    },
    kindWord: { "": "bütün", Featured: "öne çıkan", Teaching: "eğitim amaçlı", Experiment: "deneysel" },
    anyTopic: "herhangi bir şey",
    anyTool: "herhangi bir araç",
    sentence: (kind, topic, stack) => `Konusu ${topic} olan, ${stack} ile yapılmış ${kind} projeleri göster.`,
    reset: "sıfırla",
    shown: (n, total) => (n === total ? `${n} proje` : `${n} / ${total} proje`),
    toLight: "Açık temaya geç",
    toDark: "Koyu temaya geç",
  },
};

export const t = STRINGS[lang];
