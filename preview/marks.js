// The project marks with a meaning, shared by the logo previews. A mark is a vessel (the
// family of the project's first topic), a cut (how it is built, read from its tools) and
// a texture (its collection). Same geometry as names-wall.js on a 24-unit square.

export const VESSELS = [
  { id: "circle", topics: ["Philosophy"], svg: `<circle cx="12" cy="12" r="10"/>` },
  { id: "diamond", topics: ["Networks", "Data"], svg: `<path d="M12 1.5 22.5 12 12 22.5 1.5 12Z"/>` },
  { id: "triangle", topics: ["Journalism", "Storytelling"], svg: `<path d="M12 2 22 21H2Z"/>` },
  { id: "arch", topics: ["Location", "Mobile", "Mapping", "AR"], svg: `<path d="M2 12a10 10 0 0 1 20 0v10H2Z"/>` },
  { id: "hexagon", topics: ["Interaction", "Interface", "Design", "Play", "Exhibition", "3D", "Real-time", "Collaboration", "Tools", "AI", "Computer vision"], svg: `<path d="M12 1.5 21.1 6.75v10.5L12 22.5 2.9 17.25V6.75Z"/>` },
  { id: "square", topics: ["Education"], svg: `<rect x="2.5" y="2.5" width="19" height="19"/>` },
];
export const CUTS = [
  { id: "plus", tools: ["PeerJS", "QRCode.js"], svg: `<path d="M12 5v14M5 12h14"/>` },
  { id: "dot", tools: ["Leaflet", "Geolocation", "DeviceOrientation"], svg: `<circle cx="12" cy="12" r="3"/>` },
  { id: "slash", tools: ["p5.js", "Canvas", "Three.js", "MediaPipe"], svg: `<path d="M6 17 18 7"/>` },
  { id: "ring", tools: ["D3", "Graphology", "jsnetworkx", "jStat"], svg: `<circle cx="12" cy="12" r="6"/>` },
  { id: "line", tools: ["HTML", "CSS", "Tailwind", "JavaScript", "Python"], svg: `<path d="M5 12h14"/>` },
];

export const vesselOf = (p) => VESSELS.find((v) => v.topics.includes(p.topics[0])) ?? VESSELS.find((v) => p.topics.some((t) => v.topics.includes(t))) ?? VESSELS[4];
export const cutOf = (p) => CUTS.find((c) => p.stack.some((s) => c.tools.includes(s))) ?? null;

export function draw(vessel, cut, kind = "Featured", cls = "") {
  const filled = kind === "Featured";
  const dash = kind === "Experiment" ? ` stroke-dasharray="3 2.4"` : "";
  return `<svg class="im ${cls}" viewBox="0 0 24 24" aria-hidden="true">
    ${vessel ? `<g fill="${filled ? "currentColor" : "none"}" stroke="currentColor" stroke-width="1.6"${dash}>${vessel.svg}</g>` : ""}
    ${cut ? `<g class="${filled && vessel ? "cut" : ""}" fill="none" stroke="currentColor" stroke-width="1.8">${cut.svg}</g>` : ""}
  </svg>`;
}
export const markOf = (p) => draw(vesselOf(p), cutOf(p), p.kind);
