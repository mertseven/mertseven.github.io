// Takımada · Interaction Island kadrosu
// Kural (hoca): oyun / mekân karakterleri kendi mekânlarında (mekân tariflerinde zaten var); geri kalan bütün sakinler adada dolaşır.
// Her sakinin bir yaşam alanı var. Alan adları planın bölgelerine (zones.kind) ya da bir mekânın çevresine bağlanır:
//   village · forest · garden · sand  → planın o türdeki bölgesi
//   near:<mekân>                       → o mekânın çevresi (ör. near:hub = fener, near:06 = meteoroloji tepesi)
//   coast                              → kıyı şeridi (kum, su kenarı)
// night: true → yalnız gece görünür.

window.KUTUPHANE = window.KUTUPHANE || {};
window.KUTUPHANE.kadro = {
  id: 'cast.interaction-island', version: 1,
  player: 'char.traveler',
  residents: [
    // köy: meydan çevresi, sokaklar
    { id: 'char.baker', home: 'village', why: 'fırını köyde' },
    { id: 'char.librarian', home: 'village' },
    { id: 'char.postie', home: 'village', why: 'köy ile iskele arası mektup taşır' },
    { id: 'char.detective', home: 'village' },
    { id: 'char.partycone', home: 'village' },
    { id: 'char.clown', home: 'village', why: 'bando sahnesinin yakınında' },
    { id: 'char.crowned', home: 'village' },
    { id: 'char.redface', home: 'village' },
    { id: 'char.catcoat', home: 'village' },
    { id: 'char.yarncat', home: 'village' },
    { id: 'char.zebra', home: 'village' },
    { id: 'char.stripecolumn', home: 'village' },
    { id: 'char.feathertall', home: 'village' },
    // kıyı ve koy
    { id: 'char.frog', home: 'coast', why: 'kıyı taşlarında' },
    { id: 'char.sleepysun', home: 'sand', why: 'kumsalda güneşlenir' },
    { id: 'char.ember', home: 'coast' },
    // fener çevresi
    { id: 'char.harlequin', home: 'near:hub', why: 'fenerin dibinde dolaşır (tarifindeki not)' },
    // orman
    { id: 'char.owlkeeper', home: 'forest', why: 'ormanın kenarında oturur' },
    { id: 'char.bear', home: 'forest' },
    { id: 'char.fox', home: 'forest' },
    { id: 'char.mushroom', home: 'forest', why: 'yağmurdan sonra çıkar' },
    // bahçeler ve sera
    { id: 'char.cactus', home: 'near:08', why: 'sera kapısında bekler' },
    { id: 'char.bee', home: 'garden', why: 'seranın çiçeklerini sayar' },
    // tepe (meteoroloji)
    { id: 'char.robot', home: 'near:06', why: 'eski radyodan yapılmış; istasyonun antenini sever' },
    { id: 'char.spiral', home: 'near:06', why: 'tepede totem gibi' },
    { id: 'char.snowman', home: 'near:06', why: 'adanın en serin yeri' },
    // gök
    { id: 'char.moon', home: 'near:hub', night: true, why: 'yalnız gece görünür' }
  ]
};
