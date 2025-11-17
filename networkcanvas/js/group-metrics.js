// js/group-metrics.js

import * as state from "./state.js";
import jStat from "https://esm.sh/jstat@1.9.6";
import { exportTableToCsv } from "./export.js";
import {
  calculateDensity,
  createAppGraphToJsNetworkX,
} from "./graph_algorithms.js";

const groupMetricsDashboard = document.getElementById(
  "group-metrics-dashboard",
);

/**
 * Main function to initialize and render the Group Metrics tab.
 */
export function initializeGroupMetricsTab() {
  const appState = state.get();

  // Prioritize active (filtered) data if it exists, otherwise use master data.
  const dataToRender =
    appState.activeSociogramData &&
    appState.activeSociogramData.nodes.length > 0
      ? appState.activeSociogramData
      : appState.masterSociogramData;

  if (!dataToRender || dataToRender.nodes.length === 0) {
    renderPlaceholder();
    return;
  }

  renderGroupMetrics(
    dataToRender.nodes,
    dataToRender.links,
    appState.demographicKeys,
  );

  // Add event listeners to the export buttons
  const exportButtons = document.querySelectorAll(".export-group-metrics-btn");
  exportButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      const tableId = event.target.dataset.tableId;
      const filename = event.target.dataset.filename;
      exportTableToCsv(tableId, filename);
    });
  });
}

/**
 * Renders a placeholder message if no data is available.
 */
function renderPlaceholder() {
  groupMetricsDashboard.innerHTML = `
        <h2>Group Metrics Dashboard</h2>
        <p class="hint">No network data available. Please go to the 'Enter Data' tab and click 'GET ANALYSIS' first.</p>
        <button id="go-to-data-tab-btn">Go to Data Tab</button>
    `;
  document
    .getElementById("go-to-data-tab-btn")
    .addEventListener("click", () => {
      document.querySelector('li[data-tab="data"]').click();
    });
}

/**
 * Renders the group metrics for all available demographic keys.
 * @param {Array} nodes - Array of node objects.
 * @param {Array} links - Array of link objects.
 * @param {Array} demographicKeys - Array of demographic keys.
 */
export function renderGroupMetrics(nodes, links, demographicKeys) {
  groupMetricsDashboard.innerHTML = "<h2>Group Metrics Dashboard</h2>";

  if (demographicKeys.length === 0) {
    groupMetricsDashboard.innerHTML +=
      '<p class="hint">No demographic data available to calculate group metrics.</p>';
    return;
  }

  demographicKeys.forEach((key) => {
    const sectionId = `group-metrics-section-${key.replace(/\s+/g, "-").toLowerCase()}`;
    const tableId = `group-metrics-table-${key.replace(/\s+/g, "-").toLowerCase()}`;
    groupMetricsDashboard.innerHTML += `
            <div id="${sectionId}" class="group-metrics-section">
                <div class="controls-header">
                    <h3>Metrics for: ${key}</h3>
                    <button class="export-group-metrics-btn" data-table-id="${tableId}" data-filename="${key}-metrics.csv">Download as CSV</button>
                </div>
                <div class="chart-container" id="chart-${sectionId}"></div>
                <div class="metrics-table-container" id="table-${sectionId}"></div>
            </div>
        `;
  });

  // Render charts and tables after all sections are added to DOM
  demographicKeys.forEach((key) => {
    const sectionId = `group-metrics-section-${key.replace(/\s+/g, "-").toLowerCase()}`;
    const tableId = `group-metrics-table-${key.replace(/\s+/g, "-").toLowerCase()}`;
    const chartContainer = document.getElementById(`chart-${sectionId}`);
    const tableContainer = document.getElementById(`table-${sectionId}`);

    const groupMetrics = calculateGroupMetricsForDemographic(nodes, links, key);

    if (Object.keys(groupMetrics).length === 0) {
      chartContainer.innerHTML =
        '<p class="hint">Not enough data to calculate metrics for this demographic.</p>';
      tableContainer.innerHTML = "";
      return;
    }

    renderEICentralityChart(chartContainer, groupMetrics);
    renderGroupMetricsTable(tableContainer, groupMetrics, tableId);
  });
}

/**
 * Calculates E-I Index, Density, and Centralization for each group within a demographic.
 * @param {Array} nodes - All nodes in the network.
 * @param {Array} links - All links in the network.
 * @param {string} demographicKey - The demographic variable to group by.
 * @returns {object} An object where keys are group names and values are their calculated metrics.
 */
function calculateGroupMetricsForDemographic(nodes, links, demographicKey) {
  const groupedNodes = new Map();
  nodes.forEach((node) => {
    const groupName = node.demographics[demographicKey] || "Uncategorized";
    if (!groupedNodes.has(groupName)) groupedNodes.set(groupName, []);
    groupedNodes.get(groupName).push(node.id);
  });

  const results = {};

  groupedNodes.forEach((memberIds, groupName) => {
    if (memberIds.length < 2) return; // Need at least 2 members for internal links/density

    let internalLinks = 0;
    let externalLinks = 0;
    let totalLinks = 0;
    const internalDegrees = [];

    const subGraphNodes = nodes.filter((n) => memberIds.includes(n.id));
    const subGraphLinks = links.filter(
      (l) =>
        memberIds.includes(l.source.id || l.source) &&
        memberIds.includes(l.target.id || l.target),
    );
    const subGraph = createAppGraphToJsNetworkX(
      subGraphNodes,
      subGraphLinks,
      false,
    );

    memberIds.forEach((memberId) => {
      const memberNode = nodes.find((n) => n.id === memberId);
      if (!memberNode) return;

      let memberInternalDegree = 0;

      links.forEach((link) => {
        const sourceId =
          typeof link.source === "object" ? link.source.id : link.source;
        const targetId =
          typeof link.target === "object" ? link.target.id : link.target;

        // Only consider positive links for E-I Index and Density
        if (link.type !== "positive") return;

        // Link originates from this member
        if (sourceId === memberId) {
          totalLinks++;
          if (memberIds.includes(targetId)) {
            internalLinks++;
            memberInternalDegree++;
          } else {
            externalLinks++;
          }
        }
        // Link targets this member (for undirected graphs, or if we count both ways)
        // For E-I index, we typically count each link once. If graph is directed, this is fine.
        // For density, we need to be careful not to double count.
      });
      internalDegrees.push(memberInternalDegree);
    });

    // E-I Index
    const eiIndex =
      totalLinks === 0 ? 0 : (externalLinks - internalLinks) / totalLinks;

    // Density
    const density = calculateDensity(subGraph);

    // Centralization (Degree)
    const maxDegree = Math.max(...internalDegrees);
    const sumOfDifferences = internalDegrees.reduce(
      (sum, degree) => sum + (maxDegree - degree),
      0,
    );
    const maxPossibleSumOfDifferences =
      (memberIds.length - 1) * (memberIds.length - 2); // For a star graph
    const centralization =
      maxPossibleSumOfDifferences === 0
        ? 0
        : sumOfDifferences / maxPossibleSumOfDifferences;

    results[groupName] = {
      eiIndex: eiIndex,
      internalLinks: internalLinks,
      externalLinks: externalLinks,
      totalLinks: totalLinks,
      density: density,
      centralization: centralization,
      n: memberIds.length,
    };
  });

  return results;
}

/**
 * Renders the E-I Index diverging bar chart.
 * @param {HTMLElement} container - The DOM element to render the chart into.
 * @param {object} groupMetrics - Object of group metrics, including eiIndex.
 */
function renderEICentralityChart(container, groupMetrics) {
  container.innerHTML = ""; // Clear previous chart

  const chartData = Object.entries(groupMetrics)
    .map(([group, metrics]) => ({
      group: group,
      eiIndex: metrics.eiIndex,
    }))
    .sort((a, b) => a.eiIndex - b.eiIndex); // Sort for better visualization

  const margin = { top: 20, right: 50, bottom: 50, left: 120 }; // Increased right margin for labels
  const containerWidth = container.getBoundingClientRect().width;
  const width =
    containerWidth > margin.left + margin.right
      ? containerWidth - margin.left - margin.right
      : 0;
  const barHeight = 25; // Fixed height per bar
  const chartHeight = chartData.length * barHeight;
  const height = chartHeight + margin.top + margin.bottom; // Dynamic height based on number of groups

  // Adjust container height if necessary
  container.style.height = `${height}px`;

  const svg = d3
    .select(container)
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const x = d3.scaleLinear().domain([-1, 1]).range([0, width]);

  const y = d3
    .scaleBand()
    .range([0, chartHeight])
    .domain(chartData.map((d) => d.group))
    .padding(0.1);

  // X-axis
  svg
    .append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x).ticks(5).tickFormat(d3.format("+.1f")))
    .append("text")
    .attr("x", width / 2)
    .attr("y", margin.bottom - 10)
    .attr("fill", "currentColor")
    .attr("text-anchor", "middle")
    .text("E-I Index");

  // Y-axis
  svg
    .append("g")
    .call(d3.axisLeft(y))
    .append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", -margin.left + 20)
    .attr("x", -chartHeight / 2)
    .attr("fill", "currentColor")
    .attr("text-anchor", "middle")
    .text("Group");

  // Zero line
  svg
    .append("line")
    .attr("x1", x(0))
    .attr("x2", x(0))
    .attr("y1", 0)
    .attr("y2", chartHeight)
    .attr("stroke", "var(--text-color-dark)")
    .attr("stroke-dasharray", "2,2");

  // Bars
  svg
    .selectAll(".bar")
    .data(chartData)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => x(Math.min(0, d.eiIndex)))
    .attr("y", (d) => y(d.group))
    .attr("width", (d) => Math.abs(x(d.eiIndex) - x(0)))
    .attr("height", y.bandwidth())
    .attr("fill", (d) => (d.eiIndex < 0 ? "var(--neg)" : "var(--pos)"));

  // Labels
  svg
    .selectAll(".label")
    .data(chartData)
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("x", (d) => x(d.eiIndex) + (d.eiIndex < 0 ? -5 : 5)) // Offset label
    .attr("y", (d) => y(d.group) + y.bandwidth() / 2)
    .attr("dy", "0.35em")
    .attr("text-anchor", (d) => (d.eiIndex < 0 ? "end" : "start"))
    .attr("fill", "var(--text-color-dark)")
    .text((d) => d.eiIndex.toFixed(2));
}

/**
 * Renders a table of group metrics.
 * @param {HTMLElement} container - The DOM element to render the table into.
 * @param {object} groupMetrics - Object of group metrics.
 */
function renderGroupMetricsTable(container, groupMetrics, tableId) {
  const tableHtml = `
        <table class="spss-table" id="${tableId}">
            <thead>
                <tr>
                    <th>Group</th>
                    <th>N</th>
                    <th>E-I Index</th>
                    <th>Density</th>
                    <th>Centralization</th>
                    <th>Internal Links</th>
                    <th>External Links</th>
                    <th>Total Links</th>
                </tr>
            </thead>
            <tbody>
                ${Object.entries(groupMetrics)
                  .map(
                    ([groupName, metrics]) => `
                    <tr>
                        <td>${groupName}</td>
                        <td>${metrics.n}</td>
                        <td>${metrics.eiIndex.toFixed(3)}</td>
                        <td>${metrics.density.toFixed(3)}</td>
                        <td>${metrics.centralization.toFixed(3)}</td>
                        <td>${metrics.internalLinks}</td>
                        <td>${metrics.externalLinks}</td>
                        <td>${metrics.totalLinks}</td>
                    </tr>
                `,
                  )
                  .join("")}
            </tbody>
        </table>
    `;
  container.innerHTML = tableHtml;
}
