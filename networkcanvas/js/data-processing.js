// js/data-processing.js

import jsnx from "https://esm.sh/jsnetworkx@0.3.4";
import * as state from "./state.js";
import {
  findMaximalCliques,
  calculateBetweennessCentrality,
  calculateEigenvectorCentrality,
  createAppGraphToJsNetworkX,
  findTriangles,
} from "./graph_algorithms.js";
import { showNotification } from "./notifications.js";
import { reprocessDataAndRedrawAll } from "./app.js";
import Graph from "https://jspm.dev/graphology";
import louvain from "https://jspm.dev/graphology-communities-louvain";

// --- Helper Math Functions ---
function calculateMean(arr) {
  if (!arr.length) return 0;
  return arr.reduce((acc, val) => acc + val, 0) / arr.length;
}

function calculateStdDev(arr, mean) {
  if (arr.length < 2) return 0;
  const squaredDiffs = arr.map((val) => Math.pow(val - mean, 2));
  const variance = calculateMean(squaredDiffs);
  return Math.sqrt(variance);
}

// --- Sociometric Status Calculation ---
export function calculateSociometricStatus(nodes) {
  if (nodes.length === 0) return;

  const prefsReceivedArr = nodes.map((n) => n.preferencesReceived);
  const nonPrefsReceivedArr = nodes.map((n) => n.nonPreferencesReceived);

  const meanPR = calculateMean(prefsReceivedArr);
  const stdDevPR = calculateStdDev(prefsReceivedArr, meanPR);
  const meanNPR = calculateMean(nonPrefsReceivedArr);
  const stdDevNPR = calculateStdDev(nonPrefsReceivedArr, meanNPR);

  nodes.forEach((node) => {
    const zPR =
      stdDevPR === 0 ? 0 : (node.preferencesReceived - meanPR) / stdDevPR;
    const zNPR =
      stdDevNPR === 0 ? 0 : (node.nonPreferencesReceived - meanNPR) / stdDevNPR;

    const SP = zPR - zNPR;
    const SI = zPR + zNPR;

    if (zPR > 0.5 && SP > 0.8 && zNPR < 0) node.status = "Popular";
    else if (zNPR > 0.5 && SP < -0.8 && zPR < 0) node.status = "Rejected";
    else if (zPR > 0.5 && zNPR > 0.5 && SI > 0.8) node.status = "Controversial";
    else if (SI < -0.8 && zPR < 0 && zNPR < 0) node.status = "Neglected";
    else node.status = "Average";
  });
}

// --- Main Analysis Function ---
export function runAnalysis(tableData) {
  if (tableData.length === 0) {
    showNotification(
      "Data table is empty. Please add data or import a CSV.",
      "error",
    );
    return null;
  }

  const nodesMap = new Map();
  const edges = [];
  const nominationsBySource = new Map();

  // First pass: gather all unique codes from the data
  const allCodesInTable = new Set();
  tableData.forEach((row) => {
    if (row[0]) allCodesInTable.add(row[0]); // Add code from the first column
    for (let k = 2; k < 8; k++) {
      // Add codes from nomination columns
      if (row[k]) allCodesInTable.add(row[k]);
    }
  });

  // Second pass: initialize all nodes in a map
  allCodesInTable.forEach((code) => {
    if (!nodesMap.has(code)) {
      let foundName = code;
      // Find the name associated with the code
      for (const row of tableData) {
        if (row[0] === code && row[1]) {
          foundName = row[1];
          break;
        }
      }
      nodesMap.set(code, {
        id: code,
        label: foundName,
        preferencesReceived: 0,
        nonPreferencesReceived: 0,
        preferencesGiven: 0,
        nonPreferencesGiven: 0,
        totalDegree: 0,
        positiveReciprocal: 0,
        status: "Average",
        betweenness: 0,
        eigenvector: 0,
        communityId: undefined,
        amsScore: undefined,
        coreScore: undefined,
        demographics: {},
      });
    }
  });

  // Third pass: process nominations and calculate degrees
  tableData.forEach((row) => {
    const sourceCode = row[0];
    if (!sourceCode || !nodesMap.has(sourceCode)) return;

    const sourceNode = nodesMap.get(sourceCode);
    const nominations = row.slice(2, 8);

    if (!nominationsBySource.has(sourceCode)) {
      nominationsBySource.set(sourceCode, {
        positive: new Set(),
        negative: new Set(),
      });
    }
    const sourceNoms = nominationsBySource.get(sourceCode);

    nominations.forEach((targetCode, i) => {
      if (!targetCode) return;
      const type = i < 3 ? "positive" : "negative";

      if (!nodesMap.has(targetCode)) return; // Should not happen due to the pre-scan

      edges.push({
        id: `e-${sourceCode}-${targetCode}-${i}-${type}`,
        source: sourceCode,
        target: targetCode,
        type,
      });

      const targetNode = nodesMap.get(targetCode);
      sourceNode.totalDegree++;
      targetNode.totalDegree++;

      if (type === "positive") {
        targetNode.preferencesReceived++;
        sourceNode.preferencesGiven++;
        sourceNoms.positive.add(targetCode);
      } else {
        targetNode.nonPreferencesReceived++;
        sourceNode.nonPreferencesGiven++;
        sourceNoms.negative.add(targetCode);
      }
    });
  });

  nodesMap.forEach((node, sourceCode) => {
    const myPositiveNoms =
      nominationsBySource.get(sourceCode)?.positive || new Set();
    myPositiveNoms.forEach((targetCode) => {
      const targetNomsToMe =
        nominationsBySource.get(targetCode)?.positive || new Set();
      if (targetNomsToMe.has(sourceCode)) {
        node.positiveReciprocal++;
      }
    });
  });

  let nodes = Array.from(nodesMap.values());
  let links = edges;
  let cliques = [];

  if (nodes.length > 0) {
    // --- Start of Optimized Graph Analysis ---
    console.time("Total Graph Analysis Time");

    // Create graph structures once
    console.time("Create jsnx Graphs");
    const fullGraph = createAppGraphToJsNetworkX(nodes, links, false); // For betweenness
    const positiveOnlyGraph = createAppGraphToJsNetworkX(nodes, links, true); // For eigenvector, cliques
    console.timeEnd("Create jsnx Graphs");

    // Store graphs in state for later use by layout algorithms
    state.set({ jsnxGraph: fullGraph, jsnxPositiveGraph: positiveOnlyGraph });

    try {
      // Run calculations using the pre-computed graphs
      console.time("Calculate Centrality");
      const betweennessMap = calculateBetweennessCentrality(fullGraph);
      const eigenvectorMap = calculateEigenvectorCentrality(positiveOnlyGraph);
      console.timeEnd("Calculate Centrality");

      nodes.forEach((node) => {
        node.betweenness = betweennessMap.get(node.id) || 0;
        node.eigenvector = eigenvectorMap.get(node.id) || 0;
      });

      console.time("Find Cliques");
      cliques = findMaximalCliques(positiveOnlyGraph);
      console.timeEnd("Find Cliques");

      // Community Detection
      console.time("Detect Communities");
      try {
        const graph = new Graph();
        nodes.forEach((node) => {
          graph.addNode(node.id);
        });
        positiveOnlyGraph.edges().forEach(([u, v]) => {
          if (u !== v && !graph.hasEdge(u, v)) {
            graph.addEdge(u, v);
          }
        });

        if (graph.order > 0 && graph.size > 0) {
          louvain.assign(graph);
          graph.forEachNode((nodeId, attributes) => {
            const node = nodesMap.get(nodeId);
            if (node) {
              node.communityId = attributes.community;
            }
          });
        }
      } catch (e) {
        console.error("Error detecting communities:", e);
      }
      console.timeEnd("Detect Communities");
    } catch (e) {
      console.error("Error calculating jsnx metrics:", e);
    }
    // --- End of Optimized Graph Analysis ---

    calculateSociometricStatus(nodes);

    nodes = nodes.map((n) => ({
      ...n,
      radius: 5 + Math.sqrt(n.preferencesReceived + n.preferencesGiven) * 2.5,
    }));
    console.timeEnd("Total Graph Analysis Time");
  }

  return {
    nodes,
    links,
    cliques,
  };
}

export function applyFiltersToMasterData(masterData, activeFilters) {
  const { nodes: masterNodes, links: masterLinks } = masterData;
  const { deletedNodeIds } = state.get(); // Get deleted nodes from state

  // Determine if any filters are active
  const hasActiveDemographicFilters =
    activeFilters && Object.values(activeFilters).some((val) => val.size > 0);
  const hasDeletedNodes = deletedNodeIds && deletedNodeIds.size > 0;

  if (!hasActiveDemographicFilters && !hasDeletedNodes) {
    return { nodes: masterNodes, links: masterLinks };
  }

  const filteredNodes = masterNodes.filter((node) => {
    // 1. Filter out soft-deleted nodes
    if (deletedNodeIds.has(node.id)) {
      return false;
    }

    // 2. Filter by active demographic filters
    if (!hasActiveDemographicFilters) {
      return true; // If no demographic filters, don't exclude based on them
    }
    return Object.entries(activeFilters).every(([key, selectedValues]) => {
      if (!selectedValues || selectedValues.size === 0) {
        return true;
      }
      const nodeValue = node.demographics[key];
      return selectedValues.has(nodeValue);
    });
  });

  const filteredNodeIds = new Set(filteredNodes.map((n) => n.id));

  const filteredLinks = masterLinks.filter((link) => {
    const sourceId =
      typeof link.source === "object" ? link.source.id : link.source;
    const targetId =
      typeof link.target === "object" ? link.target.id : link.target;
    return filteredNodeIds.has(sourceId) && filteredNodeIds.has(targetId);
  });

  return {
    nodes: filteredNodes,
    links: filteredLinks,
  };
}

export function deleteNode(nodeId) {
  const appState = state.get();

  // Store current state for undo
  appState.previousMasterSociogramData = JSON.parse(
    JSON.stringify(appState.masterSociogramData),
  );
  appState.canUndo = true;

  // Remove node from master data
  const nodeToDelete = appState.masterSociogramData.nodes.find(
    (node) => node.id === nodeId,
  );
  appState.masterSociogramData.nodes = appState.masterSocigramData.nodes.filter(
    (node) => node.id !== nodeId,
  );

  // Remove links connected to the deleted node from master data
  appState.masterSociogramData.links =
    appState.masterSociogramData.links.filter((link) => {
      const sourceId =
        typeof link.source === "object" ? link.source.id : link.source;
      const targetId =
        typeof link.target === "object" ? link.target.id : link.target;
      return sourceId !== nodeId && targetId !== nodeId;
    });

  // Re-run analysis and redraw UI
  reprocessDataAndRedrawAll();

  // Show notification with undo button
  showNotification(
    `Node "${nodeToDelete?.label || nodeId}" deleted.`,
    "info",
    6000,
    {
      text: "Undo",
      onClick: () => undoLastDelete(),
    },
  );
}

export function undoLastDelete() {
  const appState = state.get();
  if (appState.canUndo && appState.previousMasterSociogramData) {
    state.set({
      masterSociogramData: JSON.parse(
        JSON.stringify(appState.previousMasterSociogramData),
      ),
      previousMasterSociogramData: null, // Clear previous state after undo
      canUndo: false,
    });
    reprocessDataAndRedrawAll();
    showNotification(
      "The last deletion has been successfully undone.",
      "success",
    );
  } else {
    showNotification("There is nothing to undo.", "info");
  }
}

export function parseDemographicsCSV(csvString) {
  const lines = csvString.trim().split("\n");
  const headers = lines[0].split(",").map((h) => h.trim());
  const data = new Map();

  for (let i = 1; i < lines.length; i++) {
    const values = lines[i].split(",").map((v) => v.trim());
    const id = values[0];
    if (id) {
      const record = {};
      for (let j = 1; j < headers.length; j++) {
        record[headers[j]] = values[j];
      }
      data.set(id, record);
    }
  }
  return data;
}

export function mergeDemographicsIntoNodes(nodes, demographicsMap) {
  if (!demographicsMap) return;
  nodes.forEach((node) => {
    if (demographicsMap.has(node.id)) {
      node.demographics = {
        ...node.demographics,
        ...demographicsMap.get(node.id),
      };
    }
  });
}

export function calculateAMS(
  nodes,
  links,
  groupAttribute,
  statusAttribute,
  statusMap,
  normFactor,
  homophilyWeights,
  w_status_factor,
) {
  calculateAMSContribution(
    nodes,
    links,
    groupAttribute,
    statusAttribute,
    statusMap,
    normFactor,
    homophilyWeights,
    w_status_factor,
  );
}

export function calculateAMSContribution(
  nodes,
  links,
  groupAttribute,
  statusAttribute,
  statusMap,
  normFactor,
  homophilyWeights,
  w_status_factor,
) {
  // 1. Initialize amsScore on all nodes
  nodes.forEach((node) => {
    node.amsScore = 0;
  });

  // 2. Create a quick link lookup map
  const linkMap = new Map();
  links.forEach((link) => {
    const sourceId =
      typeof link.source === "object" ? link.source.id : link.source;
    const targetId =
      typeof link.target === "object" ? link.target.id : link.target;
    const key = `${sourceId}-${targetId}`;
    linkMap.set(key, link.type === "positive" ? 1 : -1);
  });

  // 3. Find all triangles
  const triangles = findTriangles(nodes, links);

  // 4. Iterate through each triad and calculate AMS
  triangles.forEach((triad) => {
    const [id1, id2, id3] = triad;

    // 5. Calculate Raw Imbalance (I_raw)
    const v12 =
      linkMap.get(`${id1}-${id2}`) || linkMap.get(`${id2}-${id1}`) || 0;
    const v23 =
      linkMap.get(`${id2}-${id3}`) || linkMap.get(`${id3}-${id2}`) || 0;
    const v31 =
      linkMap.get(`${id3}-${id1}`) || linkMap.get(`${id1}-${id3}`) || 0;

    let i_raw = 0;
    if (v12 * v23 * v31 === -1) i_raw++;

    // 6. If imbalanced, calculate Weighting Factor (W)
    if (i_raw > 0) {
      const node1 = nodes.find((n) => n.id === id1);
      const node2 = nodes.find((n) => n.id === id2);
      const node3 = nodes.find((n) => n.id === id3);

      if (!node1 || !node2 || !node3) return;

      // W_homophily
      const groups = new Set([
        node1.demographics[groupAttribute],
        node2.demographics[groupAttribute],
        node3.demographics[groupAttribute],
      ]);
      let w_homophily = homophilyWeights.two;
      if (groups.size === 1) w_homophily = homophilyWeights.one;
      else if (groups.size === 3) w_homophily = homophilyWeights.three;

      // W_status
      const status1 = statusMap[node1.demographics[statusAttribute]];
      const status2 = statusMap[node2.demographics[statusAttribute]];
      const status3 = statusMap[node3.demographics[statusAttribute]];
      const statusSpan =
        Math.max(status1, status2, status3) -
        Math.min(status1, status2, status3);
      const w_status = 1 + (statusSpan / normFactor) * w_status_factor;

      const W = w_homophily * w_status;

      // 7. Calculate modulated strain
      const i_modulated = i_raw * W;

      // 8. Add to the amsScore of all three nodes
      node1.amsScore += i_modulated;
      node2.amsScore += i_modulated;
      node3.amsScore += i_modulated;
    }
  });
}

export function recalculateNodeMetricsForSubset(nodes, links) {
  const nodeMap = new Map(nodes.map((n) => [n.id, n]));

  // 1. Reset metrics for all nodes in the subset
  for (const node of nodes) {
    node.preferencesReceived = 0;
    node.nonPreferencesReceived = 0;
    node.preferencesGiven = 0;
    node.nonPreferencesGiven = 0;
    node.totalDegree = 0;
    node.positiveReciprocal = 0;
  }

  // 2. Recalculate degrees based on the filtered links
  for (const link of links) {
    const sourceId =
      typeof link.source === "object" ? link.source.id : link.source;
    const targetId =
      typeof link.target === "object" ? link.target.id : link.target;

    const sourceNode = nodeMap.get(sourceId);
    const targetNode = nodeMap.get(targetId);

    if (sourceNode && targetNode) {
      sourceNode.totalDegree++;
      targetNode.totalDegree++;

      if (link.type === "positive") {
        targetNode.preferencesReceived++;
        sourceNode.preferencesGiven++;
      } else {
        // negative
        targetNode.nonPreferencesReceived++;
        sourceNode.nonPreferencesGiven++;
      }
    }
  }

  // 3. Recalculate reciprocity based on filtered links
  const nominationsBySource = new Map();
  for (const link of links) {
    const sourceId =
      typeof link.source === "object" ? link.source.id : link.source;
    const targetId =
      typeof link.target === "object" ? link.target.id : link.target;

    if (!nominationsBySource.has(sourceId)) {
      nominationsBySource.set(sourceId, {
        positive: new Set(),
        negative: new Set(),
      });
    }
    if (link.type === "positive") {
      nominationsBySource.get(sourceId).positive.add(targetId);
    }
  }

  for (const node of nodes) {
    const myPositiveNoms =
      nominationsBySource.get(node.id)?.positive || new Set();
    myPositiveNoms.forEach((targetCode) => {
      const targetNomsToMe =
        nominationsBySource.get(targetCode)?.positive || new Set();
      if (targetNomsToMe.has(node.id)) {
        node.positiveReciprocal++;
      }
    });
  }
}
