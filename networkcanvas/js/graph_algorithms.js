// graph_algorithms.js

import jsnx from 'https://esm.sh/jsnetworkx@0.3.4';

/**
 * Converts an array of nodes and links (from our app) to a jsnetworkx Graph object.
 * This function is now exported to be used in the main data processing pipeline.
 * @param {Array} appNodes - Array of node objects {id: string, ...}
 * @param {Array} appLinks - Array of link objects {source: string, target: string, type: string}
 * @param {boolean} onlyPositive - If true, only consider 'positive' links for the graph.
 * @returns {object | null} A jsnetworkx Graph object, or null on error.
 */
export function createAppGraphToJsNetworkX(appNodes, appLinks, onlyPositive = true) {
    if (!jsnx) {
        console.error("jsnetworkx module failed to load.");
        return null;
    }
    if (!appNodes || appNodes.length === 0) {
        return null;
    }

    const G = new jsnx.Graph();

    appNodes.forEach(node => {
        G.addNode(node.id, { ...node });
    });

    appLinks.forEach(link => {
        if (onlyPositive && link.type !== 'positive') {
            return;
        }
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;

        if (G.hasNode(sourceId) && G.hasNode(targetId)) {
            G.addEdge(sourceId, targetId);
        }
    });

    return G;
}

/**
 * Finds all maximal cliques in the graph.
 * @param {object} G - A pre-computed jsnetworkx Graph object (positive ties only).
 * @returns {Array<Array<string>>} An array of cliques, where each clique is an array of node IDs.
 */
export function findMaximalCliques(G) {
    if (!jsnx) {
        console.error("jsnetworkx module not available for findMaximalCliques.");
        return [];
    }
    if (!G) return [];

    try {
        const cliquesGenerator = jsnx.findCliques(G);
        
        const cliques = [];
        if (cliquesGenerator && typeof cliquesGenerator[Symbol.iterator] === 'function') {
            for (const clique of cliquesGenerator) {
                cliques.push(Array.from(clique));
            }
        }
        return cliques;
    } catch (error) {
        console.error("Error finding cliques:", error);
        return [];
    }
}

/**
 * Calculates Betweenness Centrality for all nodes.
 * @param {object} G - A pre-computed jsnetworkx Graph object.
 * @returns {Map<string, number>} A Map of node ID to its betweenness centrality score.
 */
export function calculateBetweennessCentrality(G) {
    if (!jsnx) {
        console.error("jsnetworkx module not available for calculateBetweennessCentrality.");
        return new Map();
    }
    if (!G) return new Map();

    try {
        const betweenness = jsnx.betweennessCentrality(G, { normalized: true, weight: null });
        return betweenness; 
    } catch (error) {
        console.error("Error calculating betweenness centrality:", error);
        return new Map();
    }
}

/**
 * Calculates Closeness Centrality for all nodes.
 * @param {object} G - A pre-computed jsnetworkx Graph object (positive ties only).
 * @returns {Map<string, number>} A Map of node ID to its closeness centrality score.
 */
export function calculateClosenessCentrality(G) {
    if (!jsnx) {
        console.error("jsnetworkx module not available for calculateClosenessCentrality.");
        return new Map();
    }
    if (!G) return new Map();

    try {
        // We need to calculate closeness on each connected component separately.
        const closeness = new Map();
        const components = jsnx.connected_components(G);
        
        for (const component of components) {
            if (component.size > 1) {
                const subGraph = G.subgraph(component.nodes());
                const componentCloseness = jsnx.closenessCentrality(subGraph, { wf_improved: true });
                for(const [node, score] of componentCloseness) {
                    closeness.set(node, score);
                }
            }
        }
        return closeness;
    } catch (error) {
        console.error("Error calculating closeness centrality:", error);
        return new Map();
    }
}

/**
 * Calculates Eigenvector Centrality for all nodes.
 * @param {object} G - A pre-computed jsnetworkx Graph object (positive ties only).
 * @returns {Map<string, number>} A Map of node ID to its eigenvector centrality score.
 */
export function calculateEigenvectorCentrality(G) {
    if (!jsnx) {
        console.error("jsnetworkx module not available for calculateEigenvectorCentrality.");
        return new Map();
    }
    if (!G) return new Map();

    try {
        const eigenvector = jsnx.eigenvectorCentrality(G, { maxIter: 1000, tol: 1e-06 });
        return eigenvector;
    } catch (error) {
        console.error("Error calculating eigenvector centrality:", error);
        // This can fail if the graph is not connected, handle gracefully.
        return new Map();
    }
}

/**
 * Finds all unique 3-node groups (triangles) in the graph.
 * @param {Array} nodes - Array of node objects {id: string, ...}
 * @param {Array} links - Array of link objects {source: string, target: string, ...}
 * @returns {Array<Array<string>>} An array of triangles, e.g., [['id1', 'id2', 'id3'], ...]
 */
export function findTriangles(nodes, links) {
    const adj = new Map();
    nodes.forEach(node => adj.set(node.id, new Set()));

    links.forEach(link => {
        const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        if (adj.has(sourceId) && adj.has(targetId)) {
            adj.get(sourceId).add(targetId);
            adj.get(targetId).add(sourceId);
        }
    });

    const triangles = [];
    const visitedTriangles = new Set();

    for (const u of adj.keys()) {
        const neighbors = Array.from(adj.get(u));
        for (let i = 0; i < neighbors.length; i++) {
            for (let j = i + 1; j < neighbors.length; j++) {
                const v = neighbors[i];
                const w = neighbors[j];
                if (adj.get(v).has(w)) {
                    const triangle = [u, v, w].sort();
                    const triangleKey = triangle.join('-');
                    if (!visitedTriangles.has(triangleKey)) {
                        triangles.push(triangle);
                        visitedTriangles.add(triangleKey);
                    }
                }
            }
        }
    }

    return triangles;
}

/**
 * Calculates the density of the graph.
 * @param {object} G - A jsnetworkx Graph object.
 * @returns {number} The density of the graph.
 */
export function calculateDensity(G) {
    if (!G) return 0;
    const n = G.nodes().length;
    if (n < 2) return 0;
    const m = G.edges().length;
    return (2 * m) / (n * (n - 1));
}

/**
 * Counts the number of connected components in the graph.
 * @param {object} G - A jsnetworkx Graph object.
 * @returns {number} The number of connected components.
 */
export function countConnectedComponents(G) {
    if (!G || G.nodes().length === 0) return 0;
    try {
        return jsnx.numberOfConnectedComponents(G);
    } catch (error) {
        console.error("Error counting connected components:", error);
        return 0;
    }
}

/**
 * Calculates the average shortest path length for the graph.
 * @param {object} G - A jsnetworkx Graph object.
 * @returns {number} The average shortest path length.
 */
export function getAverageShortestPathLength(G) {
    if (!G || G.nodes().length < 2) return 0;
    try {
        // This can be computationally expensive
        return jsnx.averageShortestPathLength(G);
    } catch (error) {
        console.error("Error calculating average shortest path length:", error);
        return 0; // Return 0 or Infinity as an error indicator
    }
}




