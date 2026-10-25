// The bar alphabet, shared by the preview pages. Each letter is a list of bars
// [x1, y1, x2, y2] between the points x ∈ {0, 3, 6}, y ∈ {0, 1, 2}: seven tracks wide,
// three tall. The narrow cut maps the same points to x ∈ {0, 1, 2}, y ∈ {0, 3, 6}.

export const A = {
  a: [[0, 0, 6, 0], [6, 0, 6, 2], [0, 1, 6, 1], [0, 1, 0, 2], [0, 2, 6, 2]],
  b: [[0, 0, 0, 2], [0, 1, 6, 1], [6, 1, 6, 2], [0, 2, 6, 2]],
  c: [[0, 0, 6, 0], [0, 0, 0, 2], [0, 2, 6, 2]],
  d: [[6, 0, 6, 2], [0, 1, 6, 1], [0, 1, 0, 2], [0, 2, 6, 2]],
  e: [[0, 0, 6, 0], [0, 0, 0, 2], [6, 0, 6, 1], [0, 1, 6, 1], [0, 2, 6, 2]],
  f: [[0, 0, 6, 0], [0, 0, 0, 2], [0, 1, 3, 1]],
  g: [[0, 0, 6, 0], [0, 0, 0, 2], [0, 2, 6, 2], [6, 1, 6, 2], [3, 1, 6, 1]],
  h: [[0, 0, 0, 2], [0, 1, 6, 1], [6, 1, 6, 2]],
  i: [[0, 0, 6, 0], [3, 0, 3, 2], [0, 2, 6, 2]],
  j: [[6, 0, 6, 2], [0, 2, 6, 2], [0, 1, 0, 2]],
  // A stem, an arm that rises from the middle to the top right, and a leg down the right.
  k: [[0, 0, 0, 2], [0, 1, 6, 1], [3, 0, 3, 1], [3, 0, 6, 0], [6, 1, 6, 2]],
  l: [[0, 0, 0, 2], [0, 2, 6, 2]],
  m: [[0, 0, 6, 0], [0, 0, 0, 2], [3, 0, 3, 2], [6, 0, 6, 2]],
  n: [[0, 0, 6, 0], [0, 0, 0, 2], [6, 0, 6, 2]],
  o: [[0, 0, 6, 0], [0, 0, 0, 2], [6, 0, 6, 2], [0, 2, 6, 2]],
  p: [[0, 0, 6, 0], [0, 0, 0, 2], [6, 0, 6, 1], [0, 1, 6, 1]],
  q: [[0, 0, 6, 0], [0, 0, 0, 1], [6, 0, 6, 2], [0, 1, 6, 1]],
  r: [[0, 0, 6, 0], [0, 0, 0, 2]],
  s: [[0, 0, 6, 0], [0, 0, 0, 1], [0, 1, 6, 1], [6, 1, 6, 2], [0, 2, 6, 2]],
  t: [[0, 0, 6, 0], [3, 0, 3, 2]],
  u: [[0, 0, 0, 2], [6, 0, 6, 2], [0, 2, 6, 2]],
  v: [[0, 0, 0, 2], [0, 2, 3, 2], [3, 1, 3, 2], [3, 1, 6, 1], [6, 0, 6, 1]],
  w: [[0, 0, 0, 2], [3, 0, 3, 2], [6, 0, 6, 2], [0, 2, 6, 2]],
  // Two stems and a point between them; the bars cannot cross diagonally, and a pinwheel
  // would read as something else entirely.
  x: [[0, 0, 0, 2], [6, 0, 6, 2], [3, 1, 3, 1]],
  y: [[0, 0, 0, 1], [0, 1, 6, 1], [6, 0, 6, 2], [0, 2, 6, 2]],
  z: [[0, 0, 6, 0], [6, 0, 6, 1], [0, 1, 6, 1], [0, 1, 0, 2], [0, 2, 6, 2]],
};

// Letters that also read as digits in this alphabet; worth knowing, not worth hiding.
export const LOOKALIKE = { s: "5", z: "2", g: "6", o: "0", i: "1", b: "6" };

// Letter in a cut: "wide" is the drawing as above, "narrow" the same bars condensed.
export const cut = (ch, width) => (width === "narrow" ? A[ch].map(([x1, y1, x2, y2]) => [x1 / 3, y1 * 3, x2 / 3, y2 * 3]) : A[ch]);
export const SIZE = { wide: [7, 3], narrow: [3, 7] };

const STOP = new Set(["of", "the", "for", "and", "s", "a"]);
const fold = (s) => s.toLocaleLowerCase("tr").replace(/ı/g, "i").normalize("NFD").replace(/[̀-ͯ]/g, "");
export const wordsOf = (t) => fold(t).split(/[^a-z]+/).filter((w) => w && !STOP.has(w));
