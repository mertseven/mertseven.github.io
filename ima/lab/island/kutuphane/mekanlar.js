// Takımada · mekân tarifleri (Interaction Island: deniz feneri + 8 premise mekânı)
// Yerel koordinat: zemin y = 0, mekânın ortası (0, 0); +z kameraya bakan ön. Renkler rol adıdır.
// Şema: TAKIMADA.md §5 · parça türleri: kutuphane/yapilar.js başlığı.

window.KUTUPHANE = window.KUTUPHANE || {};
(function () {
  // ---- küçük yardımcılar (tarif yazımını kısaltır; çıktı yine düz JSON) ----
  const lamp = (x, z, h = 1.3) => ({ type: 'group', at: [x, 0, z], parts: [
    { type: 'cyl', r: 0.035, h, at: [0, h / 2, 0], paint: { color: 'ink' } },
    { type: 'box', size: [0.18, 0.22, 0.18], at: [0, h + 0.1, 0], paint: { color: 'paper' }, emit: 0.5 },
    { type: 'cone', r: 0.16, h: 0.12, seg: 4, at: [0, h + 0.27, 0], rot: [0, Math.PI / 4, 0], paint: { color: 'ink' } } ] });
  const tree = (x, z, h = 1.6, pat = 'diag', cols = ['green', 'ink'], kind = 'cone') => ({ type: 'group', at: [x, 0, z], parts: [
    { type: 'cyl', r: 0.07, rTop: 0.05, h: 0.5, at: [0, 0.25, 0], paint: { color: 'wood' } },
    kind === 'cone' ? { type: 'cone', r: h * 0.28, h, at: [0, 0.45 + h / 2, 0], paint: { pattern: pat, colors: cols, repeat: [3, 2] } }
                    : { type: 'lathe', profile: [[0, 0], [h * 0.22, h * 0.08], [h * 0.27, h * 0.28], [h * 0.17, h * 0.62], [0, h]], at: [0, 0.4, 0], paint: { pattern: pat, colors: cols, repeat: [3, 2] } } ] });
  const house = (x, z, w, d, h, wall, roof, ry = 0) => ({ type: 'group', at: [x, 0, z], rot: [0, ry, 0], parts: [
    { type: 'box', size: [w, h, d], at: [0, h / 2, 0], paint: { pattern: 'window', colors: wall } },
    { type: 'gable', w: w + 0.16, d: d + 0.16, at: [0, h, 0], paint: { pattern: 'stripe', colors: roof, repeat: [1, 3] } },
    { type: 'box', size: [0.14, 0.42, 0.14], at: [w * 0.25, h + 0.32, -d * 0.15], paint: { color: roof[0] } } ] });
  const disk = (r, h, paint, seg) => ({ type: 'cyl', r, h, seg, at: [0, h / 2, 0], paint, shadow: false });

  window.KUTUPHANE.mekanlar = [
    // ======================================================================
    { id: 'place.lighthouse', version: 1, kind: 'place', place: 'hub', name: 'Lighthouse', premise: 'Hub', promise: 'The tiny lighthouse that keeps the whole island running; every place you light adds a light to it.',
      footprint: 2.2, height: 4.8,
      parts: [
        { type: 'lathe', profile: [[0, 0], [1.6, 0], [1.55, 0.18], [1.25, 0.38], [0, 0.42]], paint: { pattern: 'rock', colors: ['mid', 'ink'], repeat: [4, 1] } },
        { type: 'lathe', at: [0, 0.4, 0], profile: [[0, 0], [0.75, 0], [0.66, 0.3], [0.48, 2.8], [0.55, 2.9], [0, 2.9]], paint: { pattern: 'harl', colors: ['paper', 'ink', 'hot', 'mid'], repeat: [3, 3] } },
        { type: 'cyl', r: 0.72, h: 0.06, at: [0, 3.33, 0], paint: { color: 'ink' } },
        { type: 'ring', count: 16, radius: 0.67, part: { type: 'cyl', r: 0.014, h: 0.26, at: [0, 3.48, 0], paint: { color: 'ink' } } },
        { type: 'torus', r: 0.67, tube: 0.014, at: [0, 3.6, 0], rot: [Math.PI / 2, 0, 0], paint: { color: 'ink' } },
        { type: 'cyl', r: 0.4, h: 0.5, at: [0, 3.61, 0], paint: { pattern: 'glass', colors: ['paper', 'ink'], repeat: [4, 1] }, emit: 0.35 },
        { type: 'box', size: [0.7, 0.08, 0.14], at: [0, 3.62, 0], paint: { color: 'warm' }, emit: 0.6, anim: { spin: 1.2 } },
        { type: 'cone', r: 0.58, h: 0.7, at: [0, 4.21, 0], paint: { color: 'hot' } },
        { type: 'sphere', r: 0.07, at: [0, 4.6, 0], paint: { color: 'ink' } },
        house(1.35, 0.55, 1.0, 0.8, 0.7, ['paper', 'ink', 'cool', 'hot'], ['hot', 'paper'], -0.5),
        { type: 'char', id: 'char.keeper', at: [-0.95, 0.42, 1.05], rot: [0, 0.4, 0] }
      ] },
    // ======================================================================
    { id: 'place.orchestra', version: 1, kind: 'place', place: '01', name: 'Bandstand', premise: 'Agency', promise: 'Participation can be designed.', game: 'Key Orchestra',
      footprint: 2.3, height: 3.6,
      parts: [
        { type: 'cyl', r: 2.0, h: 0.3, seg: 8, at: [0, 0.15, 0], rot: [0, Math.PI / 8, 0], paint: { pattern: 'planks', colors: ['wood', 'ink'], repeat: [2, 2] } },
        { type: 'box', size: [2.6, 0.02, 1.0], at: [0, 0.31, 0.25], paint: { pattern: 'keys', colors: ['paper', 'ink'] } },
        { type: 'box', size: [1.0, 0.15, 0.35], at: [0, 0.075, 2.05], paint: { color: 'wood' } },
        { type: 'ring', count: 8, radius: 1.82, start: Math.PI / 8, part: { type: 'cyl', r: 0.07, h: 1.8, at: [0, 1.2, 0], paint: { pattern: 'stripe', colors: ['paper', 'hot'], repeat: [1, 4] } } },
        { type: 'torus', r: 2.05, tube: 0.05, at: [0, 2.1, 0], rot: [Math.PI / 2, 0, 0], paint: { color: 'ink' } },
        { type: 'cone', r: 2.3, h: 1.1, seg: 8, at: [0, 2.65, 0], rot: [0, Math.PI / 8, 0], paint: { pattern: 'bars', colors: ['paper', 'hot'], repeat: [4, 1] } },
        { type: 'cyl', r: 0.02, h: 0.5, at: [0, 3.4, 0], paint: { color: 'ink' } },
        { type: 'box', size: [0.32, 0.18, 0.02], at: [0.17, 3.55, 0], paint: { color: 'warm' }, anim: { swing: 0.25, speed: 3 } },
        { type: 'char', id: 'char.conductor', at: [0, 0.3, 0.95], rot: [0, Math.PI, 0] },
        { type: 'char', id: 'char.band.bells', at: [-1.05, 0.3, -0.45], rot: [0, 0.3, 0], scale: 0.9 },
        { type: 'char', id: 'char.band.brass', at: [-0.38, 0.3, -0.8], scale: 0.9 },
        { type: 'char', id: 'char.band.strings', at: [0.38, 0.3, -0.8], scale: 0.9 },
        { type: 'char', id: 'char.band.drums', at: [1.05, 0.3, -0.45], rot: [0, -0.3, 0], scale: 0.9 }
      ] },
    // ======================================================================
    { id: 'place.owlforest', version: 1, kind: 'place', place: '02', name: 'Owl Forest', premise: 'Reciprocity', promise: 'Design the dialogue, not the message.', game: 'Eye Field',
      footprint: 2.6, height: 2.6,
      parts: [
        disk(2.6, 0.08, { pattern: 'grass', colors: ['green', 'ink'], repeat: [3, 3] }),
        { type: 'ring', count: 9, radius: 2.25, part: tree(0, 0, 1.7, 'diag', ['green', 'ink']) },
        { type: 'ring', count: 7, radius: 2.55, start: 0.35, part: tree(0, 0, 1.3, 'fur', ['ink', 'paper'], 'drop') },
        { type: 'grid', nx: 3, nz: 2, step: [0.85, 0.9], at: [0, 0.08, -0.1], part: { type: 'group', parts: [
          { type: 'cyl', r: 0.22, rTop: 0.2, h: 0.28, at: [0, 0.14, 0], paint: { pattern: 'ribs', colors: ['wood', 'ink'] } },
          { type: 'char', id: 'char.owl', at: [0, 0.28, 0], scale: 0.75 } ] } },
        lamp(1.3, 1.3),
        { type: 'char', id: 'char.owlkeeper', at: [-1.2, 0.08, 1.3], rot: [0, 0.5, 0], scale: 0.9 }
      ] },
    // ======================================================================
    { id: 'place.clocktower', version: 1, kind: 'place', place: '03', name: 'Clock Tower', premise: 'Feedback', promise: 'Design the feedback loop, not the outcome.', game: 'Mini Sequencer',
      footprint: 1.8, height: 4.6,
      parts: [
        { type: 'box', size: [1.9, 0.3, 1.9], at: [0, 0.15, 0], paint: { pattern: 'cobbles', colors: ['mid', 'ink'], repeat: [2, 2] } },
        { type: 'box', size: [1.2, 2.6, 1.2], at: [0, 1.6, 0], paint: { pattern: 'bricks', colors: ['paper', 'ink'], repeat: [1, 2] } },
        { type: 'cyl', r: 0.46, h: 0.06, at: [0, 2.35, 0.62], rot: [Math.PI / 2, 0, 0], paint: { pattern: 'clockface', colors: ['paper', 'ink', 'hot'] } },
        { type: 'group', at: [0, 2.35, 0.66], anim: { spin: -0.25, axis: 'z' }, parts: [{ type: 'box', size: [0.045, 0.24, 0.02], at: [0, 0.1, 0], paint: { color: 'ink' } }] },
        { type: 'group', at: [0, 2.35, 0.67], anim: { spin: -1.5, axis: 'z' }, parts: [{ type: 'box', size: [0.03, 0.36, 0.02], at: [0, 0.16, 0], paint: { color: 'hot' } }] },
        { type: 'box', size: [1.32, 0.08, 1.32], at: [0, 2.94, 0], paint: { color: 'ink' } },
        { type: 'ring', count: 4, radius: 0.7, start: Math.PI / 4, part: { type: 'box', size: [0.12, 0.6, 0.12], at: [0, 3.28, 0], paint: { color: 'paper' } } },
        { type: 'group', at: [0, 3.5, 0], anim: { swing: 0.35, axis: 'z', speed: 2.2 }, parts: [
          { type: 'cyl', r: 0.01, h: 0.12, at: [0, -0.06, 0], paint: { color: 'ink' } },
          { type: 'cone', r: 0.2, h: 0.28, open: true, at: [0, -0.24, 0], paint: { color: 'warm' } } ] },
        { type: 'cone', r: 1.0, h: 1.0, seg: 4, at: [0, 4.08, 0], rot: [0, Math.PI / 4, 0], paint: { pattern: 'shingles', colors: ['cool', 'ink'], repeat: [2, 2] } },
        { type: 'sphere', r: 0.08, at: [0, 4.62, 0], paint: { color: 'hot' } },
        { type: 'char', id: 'char.clockmaker', at: [0.95, 0.3, 1.05], rot: [0, -0.5, 0] }
      ] },
    // ======================================================================
    { id: 'place.pier', version: 1, kind: 'place', place: '04', name: 'Haunted Pier', premise: 'Temporality', promise: 'Design time as much as space.', game: 'Ghost Chase',
      footprint: 2.6, height: 1.9, arena: { at: [0, 0.43, -1.6], w: 4.0, d: 2.6 },
      parts: [
        { type: 'box', size: [1.1, 0.1, 2.8], at: [0, 0.38, 0.9], paint: { pattern: 'planks', colors: ['wood', 'ink'], repeat: [1, 3] } },
        { type: 'box', size: [4.4, 0.1, 3.0], at: [0, 0.38, -1.6], paint: { pattern: 'planks', colors: ['wood', 'ink'], repeat: [3, 2] } }, // Ghost Chase sahası (arena)
        { type: 'row', count: 5, step: [0, 0, 0.7], at: [-0.55, 0, -0.1], part: { type: 'cyl', r: 0.06, h: 0.8, at: [0, 0.3, 0], paint: { color: 'ink' } } },
        { type: 'row', count: 5, step: [0, 0, 0.7], at: [0.55, 0, -0.1], part: { type: 'cyl', r: 0.06, h: 0.8, at: [0, 0.3, 0], paint: { color: 'ink' } } },
        { type: 'row', count: 6, step: [0.8, 0, 0], at: [-2.0, 0, -3.0], part: { type: 'cyl', r: 0.06, h: 0.8, at: [0, 0.3, 0], paint: { color: 'ink' } } },
        { type: 'group', at: [0, 0.43, 0], parts: [lamp(-2.05, -2.95, 1.0), lamp(2.05, -2.95, 1.0), lamp(-2.05, -0.25, 1.0), lamp(2.05, -0.25, 1.0)] },
        { type: 'group', at: [1.6, 0.06, 0.9], rot: [0, 0.5, 0], anim: { bob: 0.03, speed: 1.2 }, parts: [
          { type: 'box', size: [0.55, 0.22, 1.1], at: [0, 0.11, 0], paint: { pattern: 'stripe', colors: ['paper', 'hot'], repeat: [1, 2] } },
          { type: 'cone', r: 0.28, h: 0.4, seg: 4, at: [0, 0.11, 0.72], rot: [Math.PI / 2, Math.PI / 4, 0], scale: [1, 1, 0.55], paint: { color: 'hot' } },
          { type: 'box', size: [0.5, 0.05, 0.16], at: [0, 0.24, 0], paint: { color: 'wood' } } ] },
        { type: 'char', id: 'char.ghost', at: [-0.4, 0.43, -1.35], rot: [0, 0.3, 0], anim: { bob: 0.05 } },
        { type: 'char', id: 'char.captain', at: [0.35, 0.43, 1.6], rot: [0, -0.3, 0] }
      ] },
    // ======================================================================
    // Pazarlık Adacığı: öğrenci işi (Nihat Türkan, NMED 3203). Oyun ayrı sayfada açılır: experiments/02b-pazarlik-tezgahi
    { id: 'place.pazarlik', version: 1, kind: 'place', place: 'pz', name: 'Pazarlık Tezgâhı', premise: 'Reciprocity', promise: 'Every action expects a response.', game: 'Pazarlık Tezgâhı', credit: 'Nihat Türkan',
      footprint: 1.8, height: 1.9,
      parts: [
        disk(1.6, 0.05, { pattern: 'dots', colors: ['paper', 'warm'], repeat: [5, 5] }),
        { type: 'box', size: [1.7, 0.5, 0.6], at: [0, 0.25, 0], paint: { pattern: 'planks', colors: ['wood', 'ink'], repeat: [3, 1] } },
        { type: 'box', size: [1.76, 0.06, 0.66], at: [0, 0.53, 0], paint: { color: 'paper' } },
        { type: 'cyl', r: 0.04, h: 1.5, at: [-0.88, 0.75, -0.28], paint: { color: 'ink' } },
        { type: 'cyl', r: 0.04, h: 1.5, at: [0.88, 0.75, -0.28], paint: { color: 'ink' } },
        { type: 'box', size: [2.0, 0.06, 1.0], at: [0, 1.55, 0.02], rot: [0.22, 0, 0], paint: { pattern: 'stripe', colors: ['hot', 'paper'], repeat: [6, 1] } },
        { type: 'box', size: [0.34, 0.1, 0.18], at: [-0.5, 0.61, 0.08], paint: { color: 'cool' } },
        { type: 'box', size: [0.28, 0.08, 0.16], at: [-0.1, 0.6, 0.1], paint: { color: 'cool' } },
        { type: 'box', size: [0.3, 0.3, 0.3], at: [-1.15, 0.15, 0.55], paint: { pattern: 'planks', colors: ['wood', 'ink'], repeat: [2, 2] } },
        { type: 'box', size: [0.26, 0.26, 0.26], at: [-1.0, 0.13, 0.9], rot: [0, 0.5, 0], paint: { pattern: 'planks', colors: ['wood', 'ink'], repeat: [2, 2] } },
        { type: 'group', at: [1.25, 0, 0.7], parts: [lamp(0, 0, 1.0)] },
        { type: 'char', id: 'char.captain', at: [0, 0.05, -0.65], rot: [0, 0, 0] }
      ] },
    // ======================================================================
    { id: 'place.beach', version: 1, kind: 'place', place: '05', name: 'Beach', premise: 'Possibility', promise: 'Design the space of possibilities, not the object.', game: 'Sand Box',
      footprint: 2.6, height: 2.0,
      parts: [
        { type: 'cyl', r: 2.7, h: 0.03, at: [0.5, 0.015, 0.6], paint: { pattern: 'waves', colors: ['cool', 'paper'], repeat: [3, 3] }, shadow: false },
        disk(2.5, 0.1, { pattern: 'dots', colors: ['paper', 'warm'], repeat: [6, 6] }),
        { type: 'group', at: [-0.9, 0.1, -0.5], parts: [
          { type: 'cyl', r: 0.025, h: 1.6, at: [0, 0.8, 0], rot: [0, 0, 0.08], paint: { color: 'ink' } },
          { type: 'cone', r: 0.95, h: 0.38, seg: 8, at: [0.06, 1.62, 0], paint: { pattern: 'bars', colors: ['paper', 'hot'], repeat: [4, 1] } } ] },
        { type: 'group', at: [-0.4, 0.1, 0.2], rot: [0, 0.4, 0], parts: [
          { type: 'box', size: [0.45, 0.04, 0.7], at: [0, 0.2, 0], rot: [-0.25, 0, 0], paint: { pattern: 'stripe', colors: ['paper', 'cool'], repeat: [1, 2] } },
          { type: 'box', size: [0.45, 0.6, 0.04], at: [0, 0.45, -0.38], rot: [-0.35, 0, 0], paint: { pattern: 'stripe', colors: ['paper', 'cool'], repeat: [1, 2] } } ] },
        { type: 'group', at: [0.9, 0.1, -0.6], parts: [
          { type: 'box', size: [0.8, 0.3, 0.8], at: [0, 0.15, 0], paint: { pattern: 'dots', colors: ['warm', 'wood'], repeat: [2, 1] } },
          { type: 'ring', count: 4, radius: 0.5, start: Math.PI / 4, part: { type: 'group', parts: [
            { type: 'cyl', r: 0.12, h: 0.55, at: [0, 0.28, 0], paint: { color: 'warm' } },
            { type: 'cone', r: 0.14, h: 0.22, at: [0, 0.66, 0], paint: { color: 'hot' } } ] } },
          { type: 'lathe', at: [0, 0.3, 0], profile: [[0, 0], [0.2, 0], [0.16, 0.4], [0.2, 0.45], [0, 0.45]], paint: { color: 'warm' } },
          { type: 'box', size: [0.14, 0.09, 0.01], at: [0.06, 0.95, 0], paint: { color: 'cool' }, anim: { swing: 0.3, speed: 4 } },
          { type: 'cyl', r: 0.008, h: 0.25, at: [0, 0.85, 0], paint: { color: 'ink' } } ] },
        { type: 'group', at: [1.3, 0.1, 0.9], rot: [0, 0, 0], parts: [ { type: 'ring', count: 5, radius: 0.07, face: true, part: { type: 'cone', r: 0.05, h: 0.16, seg: 4, at: [0, 0.03, 0], rot: [0, 0, Math.PI / 2], paint: { color: 'hot' } } } ] },
        { type: 'char', id: 'char.sandkid', at: [0.25, 0.1, 0.9], rot: [0, -0.4, 0] }
      ] },
    // ======================================================================
    { id: 'place.weather', version: 1, kind: 'place', place: '06', name: 'Weather Station', premise: 'Context', promise: 'Treat the world beyond the screen as design space.', game: 'Letter Rain',
      footprint: 2.3, height: 3.4,
      parts: [
        disk(2.3, 0.08, { pattern: 'grass', colors: ['green', 'ink'], repeat: [3, 3] }),
        house(-0.65, -0.45, 1.3, 1.0, 0.95, ['paper', 'ink', 'cool', 'hot'], ['cool', 'paper'], 0.2),
        { type: 'group', at: [-0.65, 1.75, -0.45], anim: { spin: 0.4 }, parts: [
          { type: 'box', size: [0.5, 0.03, 0.03], paint: { color: 'ink' } }, { type: 'cone', r: 0.06, h: 0.14, seg: 4, at: [0.3, 0, 0], rot: [0, 0, -Math.PI / 2], paint: { color: 'hot' } } ] },
        { type: 'cyl', r: 0.045, h: 2.7, at: [1.05, 1.35, -0.3], paint: { color: 'ink' } },
        { type: 'group', at: [1.05, 2.72, -0.3], anim: { spin: 3 }, parts: [
          { type: 'ring', count: 3, radius: 0.18, face: true, part: { type: 'box', size: [0.03, 0.03, 0.36], paint: { color: 'ink' } } },
          { type: 'ring', count: 3, radius: 0.36, face: true, part: { type: 'sphere', r: 0.08, half: true, rot: [0, 0, Math.PI / 2], paint: { color: 'warm' } } } ] },
        { type: 'group', at: [1.15, 0.08, 0.9], parts: [
          { type: 'row', count: 2, step: [0.36, 0, 0], at: [-0.18, 0, 0], part: { type: 'cyl', r: 0.025, h: 0.7, at: [0, 0.35, 0], paint: { color: 'ink' } } },
          { type: 'box', size: [0.55, 0.4, 0.4], at: [0, 0.85, 0], paint: { pattern: 'stripe', colors: ['paper', 'ink'], repeat: [1, 3] } },
          { type: 'gable', w: 0.62, d: 0.5, at: [0, 1.05, 0], paint: { color: 'paper' } } ] },
        { type: 'group', at: [0.2, 2.9, 0.1], anim: { bob: 0.08, speed: 0.9 }, parts: [
          { type: 'sphere', r: 0.32, at: [0, 0, 0], paint: { color: 'paper' } }, { type: 'sphere', r: 0.24, at: [0.35, -0.06, 0], paint: { color: 'paper' } }, { type: 'sphere', r: 0.22, at: [-0.33, -0.08, 0.05], paint: { color: 'paper' } },
          { type: 'row', count: 5, step: [0.15, 0, 0], at: [-0.3, -0.5, 0], part: { type: 'cyl', r: 0.008, h: 0.3, paint: { color: 'cool' } } } ] },
        { type: 'char', id: 'char.forecaster', at: [0.25, 0.08, 0.95], rot: [0, -0.3, 0] }
      ] },
    // ======================================================================
    { id: 'place.square', version: 1, kind: 'place', place: '07', name: 'Town Square', premise: 'Emergence', promise: 'Design conditions, not outcomes.', game: 'Boundary Lines',
      footprint: 2.6, height: 2.0,
      parts: [
        disk(2.6, 0.08, { pattern: 'cobbles', colors: ['paper', 'mid'], repeat: [4, 4] }, 8),
        { type: 'lathe', at: [0, 0.08, 0], profile: [[0, 0], [0.95, 0], [1.0, 0.32], [0.88, 0.34], [0, 0.3]], paint: { pattern: 'stripe', colors: ['paper', 'cool'], repeat: [1, 1] } },
        { type: 'cyl', r: 0.86, h: 0.02, at: [0, 0.4, 0], paint: { pattern: 'waves', colors: ['cool', 'paper'], repeat: [2, 2] } },
        { type: 'lathe', at: [0, 0.38, 0], profile: [[0, 0], [0.16, 0], [0.1, 0.5], [0.4, 0.62], [0.42, 0.7], [0, 0.66]], paint: { color: 'paper' } },
        { type: 'sphere', r: 0.1, at: [0, 1.15, 0], paint: { color: 'cool' }, anim: { bob: 0.06, speed: 4 } },
        { type: 'group', at: [-1.6, 0.08, 0.7], rot: [0, 1.2, 0], parts: [
          { type: 'box', size: [0.9, 0.06, 0.28], at: [0, 0.3, 0], paint: { pattern: 'planks', colors: ['wood', 'ink'] } }, { type: 'box', size: [0.9, 0.25, 0.04], at: [0, 0.45, -0.14], paint: { color: 'wood' } },
          { type: 'row', count: 2, step: [0.7, 0, 0], at: [-0.35, 0, 0], part: { type: 'box', size: [0.06, 0.3, 0.24], at: [0, 0.15, 0], paint: { color: 'ink' } } } ] },
        { type: 'group', at: [1.6, 0.08, 0.7], rot: [0, -1.2, 0], parts: [
          { type: 'box', size: [0.9, 0.06, 0.28], at: [0, 0.3, 0], paint: { pattern: 'planks', colors: ['wood', 'ink'] } }, { type: 'box', size: [0.9, 0.25, 0.04], at: [0, 0.45, -0.14], paint: { color: 'wood' } },
          { type: 'row', count: 2, step: [0.7, 0, 0], at: [-0.35, 0, 0], part: { type: 'box', size: [0.06, 0.3, 0.24], at: [0, 0.15, 0], paint: { color: 'ink' } } } ] },
        lamp(-1.5, -1.3, 1.5), lamp(1.5, -1.3, 1.5),
        { type: 'cyl', r: 0.006, h: 3.0, at: [0, 1.6, -1.3], rot: [0, 0, Math.PI / 2], paint: { color: 'ink' } },
        { type: 'row', count: 9, step: [0.33, 0, 0], at: [-1.32, 1.52, -1.3], part: { type: 'cone', r: 0.08, h: 0.16, seg: 3, rot: [Math.PI, 0, 0], scale: [1, 1, 0.2], paint: { color: 'hot' }, anim: { swing: 0.15, axis: 'x', speed: 3 } } },
        { type: 'char', id: 'char.towner.a', at: [-0.9, 0.08, 1.4], rot: [0, 0.5, 0] },
        { type: 'char', id: 'char.towner.b', at: [1.0, 0.08, 1.5], rot: [0, -0.4, 0] },
        { type: 'char', id: 'char.towner.c', at: [0.1, 0.08, -1.6], rot: [0, 0.2, 0] }
      ] },
    // ======================================================================
    { id: 'place.greenhouse', version: 1, kind: 'place', place: '08', name: 'Greenhouse', premise: 'Intervention', promise: 'Prototype possible futures.', game: 'Shhh Plant',
      footprint: 2.4, height: 2.5,
      parts: [
        disk(2.4, 0.08, { pattern: 'grass', colors: ['green', 'ink'], repeat: [3, 3] }),
        { type: 'box', size: [2.4, 0.1, 1.8], at: [0, 0.13, -0.2], paint: { pattern: 'checker', colors: ['paper', 'mid'], repeat: [4, 3] } },
        { type: 'box', size: [2.4, 1.2, 0.04], at: [0, 0.78, -1.08], paint: { pattern: 'glass', colors: ['paper', 'ink'], repeat: [3, 1] } },
        { type: 'box', size: [0.04, 1.2, 1.8], at: [-1.2, 0.78, -0.2], paint: { pattern: 'glass', colors: ['paper', 'ink'], repeat: [2, 1] } },
        { type: 'box', size: [0.04, 1.2, 1.8], at: [1.2, 0.78, -0.2], paint: { pattern: 'glass', colors: ['paper', 'ink'], repeat: [2, 1] } },
        { type: 'row', count: 2, step: [1.54, 0, 0], at: [-0.97, 0, 0.68], part: { type: 'box', size: [0.5, 1.2, 0.04], at: [0, 0.78, 0], paint: { pattern: 'glass', colors: ['paper', 'ink'] } } },
        { type: 'box', size: [0.8, 0.08, 0.06], at: [0, 1.38, 0.68], paint: { color: 'ink' } },
        { type: 'gable', w: 2.5, d: 1.95, h: 0.75, at: [0, 1.38, -0.2], paint: { pattern: 'glass', colors: ['paper', 'ink'], repeat: [3, 2] } },
        { type: 'lathe', at: [0, 0.18, -0.3], profile: [[0, 0], [0.22, 0], [0.3, 0.32], [0.33, 0.34], [0, 0.32]], paint: { color: 'hot' } },
        { type: 'group', at: [0, 0.5, -0.3], anim: { swing: 0.05, axis: 'z', speed: 1.2 }, parts: [
          { type: 'cyl', r: 0.03, h: 0.7, at: [0, 0.35, 0], paint: { color: 'green' } },
          { type: 'sphere', r: 0.22, at: [0, 0.85, 0], scale: [1, 0.8, 1], paint: { pattern: 'feathers', colors: ['green', 'ink'], repeat: [2, 1] } },
          { type: 'sphere', r: 0.16, at: [-0.2, 0.62, 0.05], scale: [1, 0.8, 1], paint: { pattern: 'feathers', colors: ['green', 'ink'], repeat: [2, 1] } },
          { type: 'sphere', r: 0.15, at: [0.2, 0.68, -0.03], scale: [1, 0.8, 1], paint: { pattern: 'feathers', colors: ['green', 'ink'], repeat: [2, 1] } },
          { type: 'sphere', r: 0.06, at: [0.08, 1.05, 0.1], paint: { color: 'pink' } }, { type: 'sphere', r: 0.05, at: [-0.15, 0.95, 0.12], paint: { color: 'pink' } } ] },
        { type: 'row', count: 2, step: [1.8, 0, 0], at: [-0.9, 0.08, 1.35], part: { type: 'group', parts: [
          { type: 'box', size: [0.7, 0.18, 0.35], at: [0, 0.09, 0], paint: { pattern: 'planks', colors: ['wood', 'ink'] } },
          { type: 'row', count: 4, step: [0.16, 0, 0], at: [-0.24, 0.24, 0], part: { type: 'sphere', r: 0.06, paint: { color: 'pink' } } } ] } },
        { type: 'char', id: 'char.gardener', at: [0.35, 0.18, 0.2], rot: [0, -0.4, 0] }
      ] }
  ];
})();
