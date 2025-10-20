// js/app.js
import { get as getState, set as setState } from './state.js';
import { initializeApp, initializeFilterPanel } from './dom-events.js';
import { getActiveFilters } from './filters.js';

import { renderGroupMetrics } from './group-metrics.js';
import { applyFiltersToMasterData, recalculateNodeMetricsForSubset, calculateSociometricStatus } from './data-processing.js';
import { applyFiltersAndRedraw } from './d3-graph.js';
import { updateAllUI } from './ui-updates.js';
import { createAppGraphToJsNetworkX, findMaximalCliques } from './graph_algorithms.js'; // Import clique functions
import { updateNodeCount, updateLinkCount } from './statusbar.js';

document.addEventListener('DOMContentLoaded', () => {
    initializeApp(d3);
    initializeFilterPanel();

    // Welcome modal logic
    const welcomeModal = document.getElementById('welcome-modal');
    const closeWelcomeModalBtn = document.getElementById('close-welcome-modal-btn');

    welcomeModal.style.display = 'flex';

    closeWelcomeModalBtn.addEventListener('click', () => {
        welcomeModal.style.display = 'none';
    });
});

export function reprocessDataAndRedrawAll() {
    const { masterSociogramData, demographicKeys } = getState();
    const activeFilters = getActiveFilters();

    // 1. Create a new, filtered subset of the data
    const activeSociogramData = applyFiltersToMasterData(masterSociogramData, activeFilters);

    // NEW: Recalculate metrics and status for the filtered subset
    if (activeSociogramData.nodes.length > 0) {
        recalculateNodeMetricsForSubset(activeSociogramData.nodes, activeSociogramData.links);
        calculateSociometricStatus(activeSociogramData.nodes);
    }

    // 2. Re-calculate cliques based on the filtered data
    const positiveOnlyGraph = createAppGraphToJsNetworkX(activeSociogramData.nodes, activeSociogramData.links, true);
    const newCliques = findMaximalCliques(positiveOnlyGraph);

    // 3. Update the state with the new active data and the new cliques
    setState({ 
        activeSociogramData,
        allFoundCliques: newCliques
    });

    // 4. Re-render all UI components
    updateNodeCount(activeSociogramData.nodes.length);
    updateLinkCount(activeSociogramData.links.length);
    renderGroupMetrics(activeSociogramData.nodes, activeSociogramData.links, demographicKeys);
    
    updateAllUI(activeSociogramData); // This will call populateCliqueSelector, which will use the new cliques
    applyFiltersAndRedraw();

    // 5. Dispatch event to notify other modules of the update
    window.dispatchEvent(new CustomEvent('app-data-reprocessed'));
}

// Listen for requests to redraw from other modules
window.addEventListener('request-redraw', reprocessDataAndRedrawAll);