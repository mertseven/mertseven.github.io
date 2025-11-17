// js/state.js

// This module centralizes the application's state.
// All major data structures are stored here and mutated through exported functions.

const state = {
  masterSociogramData: { nodes: [], links: [] },
  activeSociogramData: { nodes: [], links: [] }, // The filtered data subset for calculations and rendering
  deletedNodeIds: new Set(), // NEW: for soft-deleting nodes
  isEgoView: false, // NEW: for ego network view
  egoNodeId: null, // NEW: for ego network view
  previousMasterSociogramData: null, // Stores state before last deletion for undo
  canUndo: false, // Flag to indicate if an undo is possible
  demographicKeys: [], // NEW: To store user-defined demographic column headers (e.g., ['Age', 'Department'])
  allFoundCliques: [],
  jsnxGraph: null, // For all ties
  jsnxPositiveGraph: null, // For positive-only calculations
  currentDisplayNodes: [],
  currentDisplayLinks: [],
  simulation: null,
  svg: null,
  d3Container: null,
  width: 0,
  height: 0,
  zoomableGroup: null,
  linkGroup: null,
  nodeGroup: null,
  zoomBehavior: null,
  graphInitialized: false,
  nodeColorScales: {},
  activeFilters: {},
};

export function get() {
  return state;
}

export function set(newState) {
  Object.assign(state, newState);
}

export function reset() {
  const currentState = get();
  const d3Container = currentState.d3Container;
  const svg = currentState.svg;
  set({
    masterSociogramData: { nodes: [], links: [] },
    activeSociogramData: { nodes: [], links: [] },
    deletedNodeIds: new Set(),
    isEgoView: false,
    egoNodeId: null,
    previousMasterSociogramData: null,
    canUndo: false,
    demographicKeys: [],
    allFoundCliques: [],
    jsnxGraph: null,
    jsnxPositiveGraph: null,
    currentDisplayNodes: [],
    currentDisplayLinks: [],
    simulation: null,
    svg: svg, // Keep existing svg
    d3Container: d3Container, // Keep existing container
    width: 0,
    height: 0,
    zoomableGroup: null,
    linkGroup: null,
    nodeGroup: null,
    zoomBehavior: null,
    graphInitialized: false,
    nodeColorScales: {},
    activeFilters: {},
  });
}

export function initializeD3(d3, container) {
  state.d3Container = container;
  state.svg = d3.select("#sociogram-svg");
}
