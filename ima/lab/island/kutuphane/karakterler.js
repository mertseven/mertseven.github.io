// Takımada · karakter tarifleri (görünümden bağımsız: renkler ROL adıdır)
// Şema: TAKIMADA.md §5. Her tarif JSON uyumludur; editör ileride bu dosyayı okuyup yazacak.
// paint: { color: 'rol' } ya da { pattern: 'ad', colors: ['zemin', 'desen', …], repeat: [x, y] }

window.KUTUPHANE = window.KUTUPHANE || {};
window.KUTUPHANE.karakterler = [
  // ---------------- Oyuncu ----------------
  { id: 'char.traveler', version: 1, kind: 'character', name: 'Traveler', role: 'player · the "you" walking the island', place: 'hub',
    parts: { body: { shape: 'column', paint: { pattern: 'stripe', colors: ['paper', 'ink'], repeat: [1, 2] } }, neck: { height: 0.06 },
             head: { shape: 'ball', paint: { color: 'paper' } }, face: { eyes: 'ring', cheeks: true },
             arms: { type: 'pegs' }, hat: { type: 'pompom', paint: { color: 'ink' } }, extras: [{ type: 'scarf', paint: { color: 'hot' } }] },
    motion: { personality: 'bouncy' }, notes: 'Mercan atkı = "şimdi / sen". Adadaki tek sürekli mercan nesne.' },

  { id: 'char.keeper', version: 1, kind: 'character', name: 'Keeper', role: 'keeper of the lighthouse · host of the island', place: 'hub',
    parts: { body: { shape: 'barrel', paint: { pattern: 'sailor', colors: ['paper', 'cool', 'hot'] } }, neck: { height: 0.05 },
             head: { shape: 'ball', paint: { color: 'paper' } }, face: { eyes: 'dot', mustache: true, mouth: false, cheeks: true },
             arms: { type: 'pegs' }, held: { type: 'lantern' }, hat: { type: 'sailor' } },
    motion: { personality: 'calm' } },

  // ---------------- 01 Orchestra · bando ----------------
  { id: 'char.conductor', version: 1, kind: 'character', name: 'Conductor', role: '01 · band conductor', place: '01',
    parts: { body: { shape: 'hourglass', paint: { pattern: 'buttons', colors: ['ink', 'paper', 'hot'] } }, neck: { height: 0.07 },
             head: { shape: 'drop', paint: { color: 'paper' } }, face: { eyes: 'ring', mustache: true, mouth: false },
             arms: { type: 'pegs', pose: 'up' }, held: { type: 'baton' }, hat: { type: 'top', paint: { color: 'ink' } } },
    motion: { personality: 'proud' } },
  { id: 'char.band.bells', version: 1, kind: 'character', name: 'Bell Ringer', role: '01 · band · bell family (keys 1–0)', place: '01',
    parts: { body: { shape: 'bell', paint: { pattern: 'harl', colors: ['paper', 'ink', 'hot', 'mid'], repeat: [2, 2] } }, neck: { height: 0.06 },
             head: { shape: 'ball', paint: { color: 'paper' } }, face: { eyes: 'ring', cheeks: true },
             arms: { type: 'pegs' }, held: { type: 'bell' }, hat: { type: 'cone', paint: { color: 'ink' } } },
    motion: { personality: 'bouncy' } },
  { id: 'char.band.brass', version: 1, kind: 'character', name: 'Tuba Player', role: '01 · band · brass family (Q–P)', place: '01',
    parts: { body: { shape: 'barrel', paint: { color: 'ink' } }, neck: { height: 0.05 },
             head: { shape: 'ball', paint: { color: 'paper' } }, face: { eyes: 'ring', mouth: 'o' },
             arms: { type: 'pegs', pose: 'front' }, held: { type: 'tuba' }, hat: { type: 'cap', paint: { color: 'cool' } } },
    motion: { personality: 'calm' } },
  { id: 'char.band.strings', version: 1, kind: 'character', name: 'String Player', role: '01 · band · string family (A–L)', place: '01',
    parts: { body: { shape: 'pear', paint: { pattern: 'ribs', colors: ['wood', 'ink'] } }, neck: { height: 0.07 },
             head: { shape: 'acorn', paint: { color: 'paper' } }, face: { eyes: 'sleepy', mouth: 'smile' },
             arms: { type: 'pegs', pose: 'front' }, held: { type: 'uke' }, hat: { type: 'beret', paint: { color: 'hot' } } },
    motion: { personality: 'sleepy' } },
  { id: 'char.band.drums', version: 1, kind: 'character', name: 'Drummer', role: '01 · band · drum family (Z–M)', place: '01',
    parts: { body: { shape: 'block', paint: { pattern: 'checker', colors: ['paper', 'ink'] } }, neck: { height: 0.05 },
             head: { shape: 'box', paint: { color: 'warm' } }, face: { eyes: 'wide', mouth: 'smile' },
             arms: { type: 'pegs', pose: 'front' }, held: { type: 'drum' }, hat: { type: 'pompom', paint: { color: 'ink' } } },
    motion: { personality: 'jittery' } },

  // ---------------- 02 Owl Forest ----------------
  { id: 'char.owl', version: 1, kind: 'character', name: 'Owl', role: '02 · the forest folk (45 of them, varied by pattern and size)', place: '02',
    parts: { body: { shape: 'pear', paint: { pattern: 'feathers', colors: ['wood', 'paper'] } },
             head: { shape: 'owl', paint: { color: 'wood' } }, face: { eyes: 'wide', brows: false, mouth: 'beak', gap: 0.07 },
             ears: { shape: 'tufts', paint: { color: 'wood' } }, arms: { type: 'wings', paint: { color: 'wood' } } },
    motion: { personality: 'calm' }, notes: 'Baş gövdeden önce döner (overlapping action) — 02 oyununda.' },
  { id: 'char.owl.snow', version: 1, kind: 'character', name: 'Snowy Owl', role: '02 · variation', place: '02',
    parts: { body: { shape: 'pear', paint: { pattern: 'feathers', colors: ['paper', 'ink'] } },
             head: { shape: 'owl', paint: { color: 'paper' } }, face: { eyes: 'ring', brows: false, mouth: 'beak', gap: 0.07 },
             ears: { shape: 'tufts', paint: { color: 'paper' } }, arms: { type: 'wings', paint: { color: 'paper' } } },
    motion: { personality: 'sleepy' }, scale: 0.85 },

  // ---------------- 03 Clock Tower ----------------
  { id: 'char.clockmaker', version: 1, kind: 'character', name: 'Clockmaker', role: '03 · winds the dial, turns the hand', place: '03',
    parts: { body: { shape: 'cone', paint: { pattern: 'band', colors: ['cool', 'paper', 'warm', 'paper'] } }, neck: { height: 0.06 },
             head: { shape: 'disk', paint: { color: 'paper' } }, face: { clock: true, eyes: 'dot', mouth: 'line', gap: 0.06, y: 0.03 },
             arms: { type: 'pegs' }, held: { type: 'key' } },
    motion: { personality: 'jittery' }, notes: 'Yüzü saat kadranı: iki göz + iki ibre.' },

  // ---------------- 04 Haunted Pier ----------------
  { id: 'char.ghost', version: 1, kind: 'character', name: 'Ghost', role: '04 · you, three seconds ago', place: '04',
    parts: { body: { shape: 'ghost', paint: { pattern: 'ghost', colors: ['paper', 'ink'] } },
             head: { shape: 'ball', paint: { color: 'paper' } }, face: { eyes: 'dot', brows: false, mouth: 'o' }, arms: { type: 'none' } },
    motion: { personality: 'floaty' } },
  { id: 'char.captain', version: 1, kind: 'character', name: 'Captain', role: '04 · keeper of the pier', place: '04',
    parts: { body: { shape: 'block', paint: { pattern: 'stripe', colors: ['paper', 'cool'], repeat: [1, 2] } }, neck: { height: 0.06 },
             head: { shape: 'flat', paint: { color: 'paper' } }, face: { eyes: 'wink', mustache: true, mouth: false },
             arms: { type: 'pegs' }, held: { type: 'net' }, hat: { type: 'cap', paint: { color: 'ink' } } },
    motion: { personality: 'proud' } },

  // ---------------- 05 The Beach ----------------
  { id: 'char.sandkid', version: 1, kind: 'character', name: 'Sand Kid', role: '05 · bucket, spade, tide', place: '05',
    parts: { body: { shape: 'bell', paint: { pattern: 'waves', colors: ['paper', 'cool'] } }, neck: { height: 0.05 },
             head: { shape: 'ball', paint: { color: 'paper' } }, face: { eyes: 'ring', cheeks: true, mouth: 'smile' },
             arms: { type: 'pegs' }, held: { type: 'bucket' }, hat: { type: 'sun', paint: { color: 'warm' } } },
    motion: { personality: 'bouncy' }, scale: 0.85 },

  // ---------------- 06 Weather Station ----------------
  { id: 'char.forecaster', version: 1, kind: 'character', name: 'Forecaster', role: '06 · measures the rain, never forgets the umbrella', place: '06',
    parts: { body: { shape: 'cone', paint: { pattern: 'dots', colors: ['warm', 'ink'] } }, neck: { height: 0.06 },
             head: { shape: 'drop', paint: { pattern: 'diag', colors: ['paper', 'ink'], repeat: [3, 1] } }, face: { eyes: 'ring', mask: true, brows: false, mouth: false },
             arms: { type: 'pegs', pose: 'up' }, held: { type: 'umbrella', paint: { pattern: 'stripe', colors: ['paper', 'cool'] } } },
    motion: { personality: 'calm' } },

  // ---------------- 07 Town Square ----------------
  { id: 'char.towner.a', version: 1, kind: 'character', name: 'Towner · Pink', role: '07 · the crowd of the square', place: '07',
    parts: { body: { shape: 'hourglass', paint: { color: 'pink' } }, neck: { height: 0.05 },
             head: { shape: 'cat', paint: { color: 'paper' } }, ears: { shape: 'cat', paint: { color: 'pink' } }, face: { eyes: 'ring', mask: true, brows: false, mouth: false },
             arms: { type: 'pegs' }, extras: [{ type: 'bow', paint: { color: 'warm' } }] },
    motion: { personality: 'bouncy' } },
  { id: 'char.towner.b', version: 1, kind: 'character', name: 'Towner · Night Cat', role: '07 · the crowd of the square', place: '07',
    parts: { body: { shape: 'block', paint: { pattern: 'fur', colors: ['ink', 'paper'] } }, neck: { height: 0.04 },
             head: { shape: 'cat', paint: { color: 'ink' } }, ears: { shape: 'cat' }, face: { eyes: 'ring', nose: true, mouth: false } },
    motion: { personality: 'calm' } },
  { id: 'char.towner.c', version: 1, kind: 'character', name: 'Towner · Rabbit', role: '07 · the crowd of the square', place: '07',
    parts: { body: { shape: 'bell', paint: { pattern: 'checker', colors: ['paper', 'green'] } }, neck: { height: 0.05 },
             head: { shape: 'ball', paint: { color: 'paper' } }, ears: { shape: 'rabbit', paint: { color: 'paper' } }, face: { eyes: 'dot', cheeks: true, mouth: 'smile' },
             arms: { type: 'pegs' }, held: { type: 'book' } },
    motion: { personality: 'jittery' }, scale: 0.9 },

  // ---------------- 08 Greenhouse ----------------
  { id: 'char.gardener', version: 1, kind: 'character', name: 'Gardener', role: '08 · guardian of the plant that grows in silence', place: '08',
    parts: { body: { shape: 'bell', paint: { pattern: 'apron', colors: ['paper', 'green', 'warm'] } }, neck: { height: 0.06 },
             head: { shape: 'acorn', paint: { color: 'paper' } }, face: { eyes: 'sleepy', cheeks: true, mouth: 'line' },
             arms: { type: 'pegs' }, held: { type: 'can' }, hat: { type: 'leaf' } },
    motion: { personality: 'sleepy' } }
];
