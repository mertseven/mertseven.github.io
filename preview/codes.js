import { wordsOf } from "/preview/bar-alphabet.js";

// Short codes for projects, shared by the preview pages. Two letters: the initials of the
// first and last words. Three letters: the initials of the first three words (two-word
// names take two letters from the second word, one-word names their first three). Mixed:
// names of three words or more take three letters, shorter names two. "ms" is the owner's.

export const OWNER = "ms";

const cands2 = (w) => (w.length > 1
  ? [w[0][0] + w.at(-1)[0], ...[...w.at(-1).slice(1)].map((c) => w[0][0] + c), ...[...w[0].slice(1)].map((c) => w[0][0] + c)]
  : [...w[0].slice(1)].map((c) => w[0][0] + c));
const cands3 = (w) => {
  if (w.length >= 3) return [w[0][0] + w[1][0] + w[2][0], ...[...w[2].slice(1)].map((c) => w[0][0] + w[1][0] + c), w[0][0] + w[1][0] + w.at(-1)[0]];
  if (w.length === 2) return [...w[1].slice(1)].map((c) => w[0][0] + w[1][0] + c);
  return [...w[0].slice(2)].map((c) => w[0].slice(0, 2) + c);
};

function assign(projects, pick) {
  const used = new Set([OWNER]), out = new Map();
  for (const p of projects) {
    const list = pick(wordsOf(p.title)).filter((c) => /^[a-z]+$/.test(c));
    const code = list.find((c) => !used.has(c)) ?? list[0];
    used.add(code);
    out.set(p.id, code);
  }
  return out;
}

export const makeCodes = (projects) => ({
  two: assign(projects, cands2),
  three: assign(projects, cands3),
  mixed: assign(projects, (w) => (w.length >= 3 ? [...cands3(w), ...cands2(w)] : [...cands2(w), ...cands3(w)])),
});
