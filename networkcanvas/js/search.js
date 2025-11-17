import * as state from "./state.js";

// DOM Elements
let searchInput;
let resultsContainer;
let clearSearchBtn;

// Function to highlight and zoom to a specific node
function zoomToNode(nodeId) {
  const appState = state.get();
  if (!appState.graphInitialized) return;

  // Find the node in the simulation's nodes array to get its coordinates
  const targetNode = appState.simulation.nodes().find((n) => n.id === nodeId);

  if (!targetNode) {
    console.warn(`Node ${nodeId} not found in current display.`);
    // If the node isn't in the current display, we can't zoom to it.
    // A more advanced implementation might temporarily add it, but for now this is safer.
    return;
  }

  // Highlight the node
  appState.nodeGroup
    .selectAll(".node")
    .classed("highlighted", (d) => d.id === nodeId)
    .classed("faded", (d) => d.id !== nodeId);

  appState.linkGroup.selectAll(".link").classed("faded", true);

  // Calculate the new transform
  const newTransform = d3.zoomIdentity
    .translate(appState.width / 2, appState.height / 2)
    .scale(1.5) // Zoom in a bit
    .translate(-targetNode.x, -targetNode.y);

  // Apply the transform with a smooth transition
  appState.svg
    .transition()
    .duration(750)
    .call(appState.zoomBehavior.transform, newTransform);

  document.getElementById("clear-highlight-btn").style.display = "inline-block";
}

// Function to render the search results dropdown
function renderSearchResults(results) {
  resultsContainer.innerHTML = "";
  if (results.length === 0) {
    resultsContainer.style.display = "none";
    return;
  }

  results.forEach((node) => {
    const item = document.createElement("div");
    item.classList.add("search-result-item");
    item.dataset.nodeId = node.id;
    item.innerHTML = `
            <span>${node.label || node.id}</span>
            <span class="result-id">(${node.id})</span>
        `;
    resultsContainer.appendChild(item);
  });

  resultsContainer.style.display = "block";
}

// Main initialization function
export function initializeSearch() {
  searchInput = document.getElementById("node-search-input");
  resultsContainer = document.getElementById("search-results-container");
  clearSearchBtn = document.getElementById("clear-search-btn");

  // Listener for typing in the search box
  searchInput.addEventListener("input", () => {
    const searchTerm = searchInput.value.toLowerCase();
    if (searchTerm.length < 2) {
      renderSearchResults([]);
      return;
    }

    const { masterSociogramData } = state.get();
    const matches = masterSociogramData.nodes.filter(
      (node) =>
        node.id.toLowerCase().includes(searchTerm) ||
        (node.label && node.label.toLowerCase().includes(searchTerm)),
    );

    renderSearchResults(matches.slice(0, 10)); // Show max 10 results
  });

  // Listener for clicking a result
  resultsContainer.addEventListener("click", (event) => {
    const targetItem = event.target.closest(".search-result-item");
    if (targetItem) {
      const nodeId = targetItem.dataset.nodeId;
      zoomToNode(nodeId);
      searchInput.value = "";
      renderSearchResults([]);
    }
  });

  // Listener to hide results when clicking outside
  document.addEventListener("click", (event) => {
    if (
      searchInput &&
      resultsContainer &&
      !searchInput.contains(event.target) &&
      !resultsContainer.contains(event.target)
    ) {
      resultsContainer.style.display = "none";
    }
  });

  // Listener for clearing the search
  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    renderSearchResults([]);
  });
}
