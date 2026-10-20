// Takımada · Interaction Island plan taslakları (üstten).
// Bu veri 3B arazi motorunun da girdisi olacak: kıyı çizgisi (yumuşatılmış kapalı eğri), tepeler (gauss), bölgeler, yollar, mekânlar, dolgu.
// Birim: dünya birimi (karakter ~1 boy). +x doğu, +z güney (kameraya bakan ön).

window.KUTUPHANE = window.KUTUPHANE || {};
window.KUTUPHANE.adaPlanlari = [
  // ==========================================================================================
  { id: 'plan.a', name: 'A · Lighthouse Hill', idea: 'The lighthouse sits on the central hill; every path climbs to it. The village lies on the south slope and runs down to the pier.',
    why: [
      'The lighthouse is visible from everywhere: you can always find your way (the hub doubles as the progress meter).',
      'The village is on the south slope facing the camera: the first thing you see is full of life.',
      'The forest is on the north ridge at the back: the owls live on the dark, quiet side.',
      'The weather station is open to the wind on the west hill; the greenhouse sits in the sun in the east gardens.'
    ],
    coast: [[-14, -2], [-12.5, -7.5], [-7, -10.5], [0, -11.5], [6.5, -10.5], [11.5, -7.5], [14.5, -2.5], [14.2, 2.5], [12, 6.5], [9.5, 9.5], [6, 10.6], [3, 12.4], [-1, 11.2], [-5, 10.4], [-9.5, 9], [-13, 5.5]],
    hills: [{ at: [0, -1.5], r: 4.6, h: 2.6, name: 'Lighthouse Hill' }, { at: [-10, -3], r: 3.4, h: 1.7, name: 'Wind Hill' }, { at: [-2, -8], r: 5.2, h: 1.3 }, { at: [7, -6], r: 3, h: 0.8 }],
    zones: [
      { kind: 'forest', name: 'North Forest', poly: [[-11, -6.5], [-7, -9.8], [1, -10.4], [4.5, -8.5], [1, -5.5], [-5, -5], [-8.5, -5]], trees: 70 },
      { kind: 'village', name: 'Village', poly: [[-6.5, 2.5], [-1.5, 1.8], [5, 3.5], [5.5, 8.5], [1.5, 9.5], [-5, 8.8], [-7.5, 6]] },
      { kind: 'garden', name: 'Gardens', poly: [[4.5, -2.2], [10.5, -3.5], [12.2, 1.5], [9.8, 4.4], [5.4, 3.2]] },
      { kind: 'sand', name: 'Beach', poly: [[7.4, 6.2], [11.8, 5.6], [10.3, 9.4], [7, 10.3]] }
    ],
    paths: [
      { kind: 'road', pts: [[4, 10.4], [2.4, 8], [0, 5.6], [-0.8, 2.6], [0, -1]] },
      { kind: 'road', pts: [[0, 5.6], [3.6, 4.6]] },
      { kind: 'path', pts: [[0, 5.6], [-3.2, 4.2]] },
      { kind: 'path', pts: [[0, -1], [-4, -1.8], [-7.5, -2.6], [-10, -3]] },
      { kind: 'path', pts: [[0, -1], [-1, -4.4], [-3, -7.4]] },
      { kind: 'path', pts: [[0, -1], [3.8, 0.2], [7, 1.8]] },
      { kind: 'path', pts: [[7, 1.8], [8.8, 4.8], [9.4, 7]] },
      { kind: 'path', pts: [[9.4, 7], [6.4, 9.2], [4, 10.4]] }
    ],
    places: { hub: { at: [0, -1.5] }, '01': { at: [3.8, 4.6], rot: -2.4 }, '02': { at: [-3, -7.6], rot: 0.3 }, '03': { at: [-3.4, 4.2], rot: 2.2 },
              '04': { at: [3.4, 12.6], rot: 0.15, water: true }, '05': { at: [9.4, 7.4], rot: -0.6 }, '06': { at: [-10, -3], rot: 1.2 },
              '07': { at: [0, 6], rot: 0 }, '08': { at: [7.6, 1], rot: -1.4 } },
    houses: [[-5.6, 3.4, 0.3], [-6.2, 6.4, 1.6], [-4, 7.6, 0.1], [-2, 8.8, -0.2], [2.2, 2.6, -0.5], [-2.2, 2.4, 0.4], [3.4, 7.6, 0.6], [5.2, 6.4, -0.8], [-3.6, 9.6, 0.4], [1, 9.4, 0.2], [11.4, -4, 0.8], [10.2, 3.6, -1.2]],
    boats: [[6.2, 12.2, 0.4], [1.2, 13.2, -0.3]], rocks: [[-12.8, 4.4], [13.4, 4.2], [-13.6, -4.5], [8.6, -9.6], [-6, 10.4]] },

  // ==========================================================================================
  { id: 'plan.b', name: 'B · Cape Light', idea: 'A long island; the lighthouse stands on the rocks of the east cape. Village in the west, harbour in the southern cove, a brook valley in between.',
    why: [
      'Real coastal logic: the lighthouse watches ships from the cape, the harbour sits in a sheltered cove.',
      'A brook valley splits the island: forest and hills in the north, village and harbour in the south; the greenhouse by the wet bank of the brook.',
      'Walking is a journey: a long coastal road from the village in the west to the lighthouse in the east.',
      'Good for the archipelago: a long island can link to neighbours by bridge or boat from its tips.'
    ],
    coast: [[-16, 0], [-14, -5.6], [-8, -8.6], [0, -9.4], [6, -8.2], [10.5, -5.4], [14, -4.2], [17, -3.6], [18.2, -1.2], [16.2, 0.8], [12, 1.8], [9.6, 4.6], [6.4, 7.6], [2.4, 8.4], [-1, 6.8], [-4, 8.6], [-9.5, 8.2], [-14, 4.4]],
    hills: [{ at: [-4, -5.8], r: 5, h: 1.8 }, { at: [-11.4, -3.6], r: 3, h: 2.5, name: 'Northwest Peak' }, { at: [16, -1.5], r: 2.2, h: 1.6, name: 'Lighthouse Rocks' }, { at: [9, -4.5], r: 3.2, h: 1.1 }],
    zones: [
      { kind: 'forest', name: 'Ridge Forest', poly: [[-9, -6.8], [-3, -8.6], [3, -8], [4, -4.6], [-1, -3], [-7, -3.4]], trees: 64 },
      { kind: 'village', name: 'Village', poly: [[-10.4, -0.6], [-2.4, -0.4], [0.4, 3.6], [-1.6, 6.4], [-6, 7.2], [-10.6, 5.6]] },
      { kind: 'garden', name: 'Brook Gardens', poly: [[1.4, -2.6], [6.4, -3], [6.6, 1.6], [2.6, 2.4]] },
      { kind: 'sand', name: 'Harbour Beach', poly: [[5.2, 4.4], [9.2, 3.2], [8, 6.4], [5, 7.4]] }
    ],
    creek: [[7, -7.6], [5.2, -4], [4, -0.6], [4.2, 3], [5.2, 6.6]],
    paths: [
      { kind: 'road', pts: [[-12, 1.8], [-7, 1.4], [-4, 2.2], [0, 3.4], [3, 3.6], [6.4, 2.2], [10, 0.4], [13.4, -0.6], [16, -1.5]] },
      { kind: 'path', pts: [[-4, 2.2], [-1, 4.6]] },
      { kind: 'path', pts: [[-7, 1.4], [-9.6, -1.6], [-11.4, -3.6]] },
      { kind: 'path', pts: [[-4, 2.2], [-3.4, -1.6], [-3, -5.8]] },
      { kind: 'path', pts: [[3, 3.6], [3.2, 0]] },
      { kind: 'path', pts: [[3, 3.6], [3, 7.2], [3, 9.6]] },
      { kind: 'path', pts: [[6.4, 2.2], [7.2, 5.2]] }
    ],
    places: { hub: { at: [16, -1.5] }, '01': { at: [-1, 5], rot: -2.6 }, '02': { at: [-3, -6], rot: 0.2 }, '03': { at: [-7.6, 1], rot: 1.8 },
              '04': { at: [3, 10.4], rot: 0, water: true }, '05': { at: [7.2, 5.4], rot: -0.4 }, '06': { at: [-11.4, -3.6], rot: 1.0 },
              '07': { at: [-4, 3], rot: 0 }, '08': { at: [3.4, -0.6], rot: -1.6 } },
    houses: [[-9, 3.6, 0.2], [-7.4, 5.6, -0.3], [-5.4, 6, 0.1], [-2.6, 0.8, 0.4], [-6, -0.2, 0.6], [-9.6, 0.6, 1.5], [0.6, 2, -0.6], [-2.2, 6.8, 0.2], [12, -1.6, 0.9], [13.4, 0.8, -0.5], [9.6, 2.6, 0.3]],
    boats: [[5.2, 9.4, 0.3], [1, 9.6, -0.4], [7.8, 8.2, 0.8]], rocks: [[18, -2.6], [17.2, 0.6], [-15.4, -2], [-12.6, 6.4], [11, -6]] },

  // ==========================================================================================
  { id: 'plan.c', name: 'C · Cove Island', idea: 'A horseshoe island; the central cove opens to the south. The pier is inside the cove, the lighthouse at the tip of the east arm.',
    why: [
      'The cove is the heart of the scene: from any side, water, pier and beach sit in the middle.',
      'Two arms, two characters: the west arm is village and square (busy), the east arm calm gardens with the lighthouse at the tip.',
      'The haunted pier in the middle of the cove: the most sheltered, most cinematic spot for Ghost Chase.',
      'The north ridge (forest + weather station) wraps the cove from behind; the island feels inward-looking and warm.'
    ],
    coast: [[-14, 5], [-15.2, -1.6], [-12.4, -8], [-5, -11.2], [3, -11.4], [10, -8.4], [14.4, -3], [14.8, 3.4], [13, 9.6], [9.6, 11], [7.4, 8.2], [5.6, 4.2], [2.6, 2.2], [-1.4, 2.2], [-4.6, 3.4], [-6.4, 7.2], [-8.4, 11], [-12, 9.6]],
    hills: [{ at: [0, -7], r: 5.2, h: 1.7, name: 'North Ridge' }, { at: [11.4, 7.6], r: 2.6, h: 1.9, name: 'Lighthouse Point' }, { at: [-11, -2.4], r: 3.6, h: 1.3 }, { at: [8, -4], r: 3, h: 1 }],
    zones: [
      { kind: 'forest', name: 'Northeast Forest', poly: [[3, -10.4], [9.6, -8], [12.4, -3.4], [9, -1.6], [4.4, -4.6]], trees: 58 },
      { kind: 'village', name: 'West Arm Village', poly: [[-13.4, 0.6], [-9, -0.8], [-5.6, 2.6], [-6.6, 6.6], [-8.4, 9.6], [-12.4, 8]] },
      { kind: 'garden', name: 'East Gardens', poly: [[5, -2.4], [11, -0.6], [12.4, 3.6], [8.4, 5], [5.6, 2.4]] },
      { kind: 'sand', name: 'Cove Beach', poly: [[-5.2, 3], [-2, 2.6], [-1.8, 4.6], [-4.6, 5.8]] }
    ],
    paths: [
      { kind: 'road', pts: [[-10, 3], [-7, 1.6], [-3.6, 0.4], [0, -0.4], [4, 0.4], [7.4, 2.6], [10, 5.4], [11.4, 7.6]] },
      { kind: 'path', pts: [[-10, 3], [-8.4, 6.6]] },
      { kind: 'path', pts: [[-10, 3], [-11.6, -0.4]] },
      { kind: 'path', pts: [[0, -0.4], [0, 2.6]] },
      { kind: 'path', pts: [[-3.6, 0.4], [-3.6, 3.8]] },
      { kind: 'path', pts: [[0, -0.4], [0, -4], [0, -7]] },
      { kind: 'path', pts: [[4, 0.4], [6.4, -2.6], [7.4, -5.6]] },
      { kind: 'path', pts: [[7.4, 2.6], [8.2, 0.4]] }
    ],
    places: { hub: { at: [11.6, 7.8] }, '01': { at: [-8.2, 6.8], rot: -0.6 }, '02': { at: [7.6, -5.6], rot: 0.5 }, '03': { at: [-11.8, -0.6], rot: 1.2 },
              '04': { at: [0, 4.4], rot: 0, water: true }, '05': { at: [-3.6, 4.2], rot: 0.4 }, '06': { at: [0, -7.2], rot: 0 },
              '07': { at: [-10, 3], rot: 0.6 }, '08': { at: [8.4, 1], rot: -1.2 } },
    houses: [[-13, 2.6, 0.4], [-12, 5.6, 1.2], [-7.4, -0.6, 0.2], [-6.8, 4.2, -0.6], [-10.8, 7.6, 0.9], [-5.6, 0.8, 0.1], [-13.4, -2.4, 1.4], [3.4, -1.6, 0.3], [10.8, 3.6, -1.1], [-8.6, -3, 0.6]],
    boats: [[2.6, 6.4, 0.2], [-1.8, 7.4, -0.5], [4.6, 8.6, 0.7]], rocks: [[9.8, 10.8], [-8.2, 11], [-15, -4], [14.4, -4], [-2.6, -10.8]] }
];

// ---- C planının alternatifleri (C ile ilerlemeden önce karşılaştırma için) ----
(function () {
  const L = window.KUTUPHANE.adaPlanlari, C = L.find((p) => p.id === 'plan.c');
  const clone = (o) => JSON.parse(JSON.stringify(o));
  C.name = 'C1 · Koy Adası'; C.short = 'C1';

  const c2 = clone(C);
  Object.assign(c2, { id: 'plan.c2', name: 'C2 · Open Cove', short: 'C2',
    idea: 'Same island as C; the pier moved to the east shore of the cove and the beach to the west shore. The village spreads wider along the west arm.',
    why: ['The pier and the beach no longer overlap: the two shores of the cove are two different play areas.', 'There is room to walk between the village places (square, clock tower, bandstand).', 'The lighthouse beam sweeps the pier across the cove on every turn: dramatic for a Ghost Chase night.'] });
  c2.places = { hub: { at: [11.6, 7.8] }, '01': { at: [-8.2, 7.6], rot: -0.8 }, '02': { at: [7.4, -6], rot: 0.5 }, '03': { at: [-12.6, -1.6], rot: 1.3 },
                '04': { at: [3, 4.8], rot: -0.25, water: true }, '05': { at: [-4.2, 4.6], rot: 0.5 }, '06': { at: [0, -7.4], rot: 0 },
                '07': { at: [-9.4, 2.4], rot: 0.7 }, '08': { at: [8.8, 0.6], rot: -1.2 } };
  c2.paths = [
    { kind: 'road', pts: [[-9.4, 2.4], [-6.6, 1.2], [-3.4, 0.4], [0, -0.2], [3.6, 0.6], [7, 2.8], [9.8, 5.4], [11.6, 7.8]] },
    { kind: 'path', pts: [[-9.4, 2.4], [-8.4, 5.6]] }, { kind: 'path', pts: [[-9.4, 2.4], [-11.6, 0.2]] },
    { kind: 'path', pts: [[-3.4, 0.4], [-4, 3]] }, { kind: 'path', pts: [[3.6, 0.6], [3.2, 2.6]] },
    { kind: 'path', pts: [[0, -0.2], [0, -4], [0, -7]] }, { kind: 'path', pts: [[3.6, 0.6], [6.4, -2.6], [7.4, -5.6]] }, { kind: 'path', pts: [[7, 2.8], [8.6, 1.2]] }
  ];
  c2.houses = [[-13.2, 3, 0.4], [-12.4, 6.2, 1.2], [-6.2, -0.8, 0.2], [-6.4, 4.6, -0.6], [-11, 8.6, 0.9], [-4.8, 1.2, 0.1], [-14, -4, 1.4], [3.8, -1.8, 0.3], [11, 3.4, -1.1], [-8.8, -3.4, 0.6], [-10.6, -1.8, 0.2]];

  const c3 = clone(C);
  Object.assign(c3, { id: 'plan.c3', name: 'C3 · Ridge Light', short: 'C3',
    idea: 'The lighthouse climbs to the top of the north ridge and looks down on the cove and the whole island. The weather station moves to the windy tip of the east arm.',
    why: ['The beam sweeps every building in turn: the island ticks like a single clock.', 'The lighthouse stands right behind the cove: in frame for every camera looking from the cove.', 'The tip of the east arm is open to the wind: a natural spot for the weather station.'] });
  c3.hills = [{ at: [0, -7.2], r: 5.4, h: 2.4, name: 'Lighthouse Ridge' }, { at: [11.4, 7.6], r: 2.6, h: 1.5, name: 'Wind Point' }, { at: [-11, -2.4], r: 3.6, h: 1.3 }, { at: [8, -4], r: 3, h: 1 }];
  c3.places = Object.assign(clone(C.places), { hub: { at: [0, -7.2] }, '06': { at: [11.6, 7.8], rot: -0.6 } });
  c3.paths = clone(C.paths).map((p) => p); // yollar aynı; sırta çıkan patika fenere gider
  L.splice(L.indexOf(C) + 1, 0, c2, c3);
})();
