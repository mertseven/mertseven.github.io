// js/ui-updates.js

import { get as getState } from './state.js';
import { clearHighlights } from './d3-graph.js';

// DOM element references
const legendTitle = document.getElementById('legend-title');
const legendContent = document.getElementById('legend-content');
const explanationContent = document.getElementById('explanation-content');
const dataTableBody = document.querySelector('#data-table tbody');
const demographicsTableHead = document.querySelector('#demographics-table thead');
const demographicsTableBody = document.querySelector('#demographics-table tbody');
const metricsTableBody = document.querySelector('#metrics-table tbody');
const minCliqueSizeInput = document.getElementById('min-clique-size');
const cliqueSelector = document.getElementById('clique-selector');
const cliqueCountInfoP = document.getElementById('clique-count-info');
const groupAnalysisResultsContainer = document.getElementById('group-analysis-results-container'); // NEW

// NEW: Function to render the results of the group analysis
export function renderGroupAnalysisResults(results) {
    const resultsContainer = document.getElementById('group-analysis-results-container');
    resultsContainer.innerHTML = ''; // Clear previous results

    if (results.error) {
        resultsContainer.innerHTML = `<p class="hint" style="color: var(--neg);">${results.error}</p>`;
        return;
    }

    const { normalityResults, recommendation, testName, testStats, descriptiveStats, interpretation, notes, plotData } = results;

    // --- Create Dashboard Cards ---
    let dashboardHtml = `
        <div class="card card-conclusion">
            <h4>Conclusion</h4>
            <p><strong>Recommendation:</strong> ${recommendation}</p>
            <p><strong>Conclusion:</strong> ${interpretation}</p>
            <p class="hint">${notes}</p>
        </div>

        <div class="card card-descriptives">
            <h4>Descriptive Statistics</h4>
            ${generateDescriptiveStatsTable(descriptiveStats)}
        </div>

        <div class="card card-normality">
            <h4>Normality Test (Shapiro-Wilk)</h4>
            <div class="normality-plot-controls">
                <label for="normality-group-select">View Group:</label>
                <select id="normality-group-select">
                    ${normalityResults.map(res => `<option value="${res.groupName}">${res.groupName} (p=${res.p.toFixed(4)})</option>`).join('')}
                </select>
            </div>
            <div id="current-normality-plot-container" class="normality-plot-container"></div>
            <div id="normality-plot-text-summary">
                <!-- Normality text summary for selected group -->
            </div>
        </div>

        <div class="card card-details">
            <h4>Detailed Statistics: ${testName}</h4>
            ${generateTestStatsTable(testName, testStats)}
        </div>
    `;

    resultsContainer.innerHTML = dashboardHtml;

    // --- Render initial Q-Q plot and set up listener ---
    const normalityGroupSelect = document.getElementById('normality-group-select');
    const currentNormalityPlotContainer = document.getElementById('current-normality-plot-container');
    const normalityPlotTextSummary = document.getElementById('normality-plot-text-summary');

    function updateNormalityPlotAndText() {
        const selectedGroupName = normalityGroupSelect.value;
        const selectedSample = plotData.get(selectedGroupName);
        const selectedNormalityResult = normalityResults.find(res => res.groupName === selectedGroupName);

        currentNormalityPlotContainer.innerHTML = ''; // Clear previous plot
        if (selectedSample && currentNormalityPlotContainer) {
            renderQQPlot(selectedSample, currentNormalityPlotContainer);
        }

        if (selectedNormalityResult) {
            normalityPlotTextSummary.innerHTML = `
                <p><strong>Group: ${selectedNormalityResult.groupName}</strong></p>
                <p>p-value: ${typeof selectedNormalityResult.p === 'number' ? selectedNormalityResult.p.toFixed(4) : selectedNormalityResult.p}</p>
                <p><em>${selectedNormalityResult.isNormal ? 'Data appears normal.' : (selectedNormalityResult.error ? selectedNormalityResult.error : 'Data does NOT appear normal.')}</em></p>
            `;
        }
    }

    // Initial render
    updateNormalityPlotAndText();

    // Add event listener for dropdown change
    normalityGroupSelect.addEventListener('change', updateNormalityPlotAndText);
}

function generateDescriptiveStatsTable(descriptiveStats) {
    return `
        <table>
            <thead><tr><th>Group</th><th>Count (n)</th><th>Mean</th><th>Median</th><th>Std. Deviation</th></tr></thead>
            <tbody>
                ${descriptiveStats.map(stat => `
                    <tr>
                        <td>${stat.group}</td>
                        <td>${stat.n}</td>
                        <td>${stat.mean}</td>
                        <td>${stat.median}</td>
                        <td>${stat.stdDev}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}




export function renderDemographicsTable(nodesToSort) {
    const { masterSociogramData, demographicKeys } = getState();
    const nodes = nodesToSort || masterSociogramData.nodes;

    // Clear existing table content
    demographicsTableHead.innerHTML = '';
    demographicsTableBody.innerHTML = '';

    // If no nodes (i.e., analysis hasn't been run), do nothing.
    if (!nodes || nodes.length === 0) {
        return;
    }

    // --- Build Table Header ---
    const headerRow = document.createElement('tr');
    
    const thCode = document.createElement('th');
    thCode.textContent = 'Code';
    thCode.classList.add('sortable');
    thCode.dataset.column = 'id';
    thCode.innerHTML += ' <span class="sort-indicator"></span>';
    
    const thName = document.createElement('th');
    thName.textContent = 'Name';
    thName.classList.add('sortable');
    thName.dataset.column = 'label';
    thName.innerHTML += ' <span class="sort-indicator"></span>';

    headerRow.appendChild(thCode);
    headerRow.appendChild(thName);

    demographicKeys.forEach(key => {
        const th = document.createElement('th');
        th.classList.add('sortable');
        th.dataset.column = key;
        th.dataset.key = key;

        const keySpan = document.createElement('span');
        keySpan.textContent = key;
        keySpan.contentEditable = true; // Allow renaming columns
        keySpan.dataset.key = key;

        const sortIndicator = document.createElement('span');
        sortIndicator.classList.add('sort-indicator');

        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = '×';
        deleteBtn.classList.add('delete-column-btn');
        deleteBtn.title = `Delete "${key}" column`;
        deleteBtn.dataset.key = key;

        th.appendChild(keySpan);
        th.appendChild(sortIndicator);
        th.appendChild(deleteBtn);
        headerRow.appendChild(th);
    });
    demographicsTableHead.appendChild(headerRow);


    // --- Build Table Body ---
    nodes.forEach(node => {
        const tr = document.createElement('tr');
        tr.dataset.code = node.id;

        const tdCode = document.createElement('td');
        tdCode.textContent = node.id;
        const tdName = document.createElement('td');
        tdName.textContent = node.label || node.id;
        tr.appendChild(tdCode);
        tr.appendChild(tdName);

        demographicKeys.forEach(key => {
            const td = document.createElement('td');
            td.contentEditable = true;
            td.dataset.code = node.id;
            td.dataset.key = key;
            td.textContent = (node.demographics && node.demographics[key]) || '';
            tr.appendChild(td);
        });
        demographicsTableBody.appendChild(tr);
    });
}

export function updateLegendAndExplanation(mode) {
    const state = getState();
    legendContent.innerHTML = '';
    explanationContent.innerHTML = '';
    let legendTitleText = "Legend";
    let explanationHTML = '';

    switch (mode) {
        case "status":
            legendTitleText = "Sociometric Status";
            const statuses = [
                { name: "Popular", color: "var(--status-popular)" },
                { name: "Rejected", color: "var(--status-rejected)" },
                { name: "Controversial", color: "var(--status-controversial)" },
                { name: "Neglected", color: "var(--status-neglected)" },
                { name: "Average", color: "var(--status-average)" },
            ];
            statuses.forEach(s => {
                legendContent.innerHTML += `
                    <div class="legend-item">
                        <div class="legend-color-box" style="background-color: ${s.color};"></div>
                        <span>${s.name}</span>
                    </div>`;
            });
            explanationHTML = `<p>This mode categorizes individuals based on how their received 'preferred' and 'non-preferred' nominations compare to the group average (using standardized scores). Status types help identify social standing within the group.</p>\n                               <p><strong>Popular:</strong> Often preferred, rarely non-preferred. <strong>Rejected:</strong> Often non-preferred, rarely preferred. <strong>Controversial:</strong> Receives many preferred and non-preferred nominations. <strong>Neglected:</strong> Receives few nominations. <strong>Average:</strong> Typical social standing.</p>`;
            break;
        case "community":
            legendTitleText = "Community";
            const { nodeColorScales, masterSociogramData } = getState();
            const communityScale = nodeColorScales.community;
            if (communityScale) {
                const allCommunityIds = [...new Set(masterSociogramData.nodes.map(n => n.communityId).filter(id => typeof id !== 'undefined'))];
                allCommunityIds.sort((a, b) => a - b); // Sort communities numerically

                allCommunityIds.forEach(id => {
                    legendContent.innerHTML += `
                        <div class="legend-item">
                            <div class="legend-color-box" style="background-color: ${communityScale(id)};"></div>
                            <span>Community ${id + 1}</span>
                        </div>`;
                });
            }
            explanationHTML = `<p>Nodes are colored based on their detected community, using the Louvain method. This algorithm groups nodes that are more densely connected to each other than to the rest of the network, revealing social clusters.</p>`;
            break;
        case "preferencesReceived":
            legendTitleText = "Preferences Received";
            if (state.masterSociogramData.nodes.length > 0) {
                legendContent.innerHTML = `
                    <div class="legend-gradient" style="background: linear-gradient(to right, ${d3.interpolateGreens(0.1)}, ${d3.interpolateGreens(0.9)});"></div>
                    <div class="legend-gradient-labels"><span>Low Count</span><span>High Count</span></div>`;
            }
            explanationHTML = `<p>Nodes are colored based on the number of 'Most Preferred' nominations they received. Greener nodes received more 'preferred' nominations, indicating higher positive peer regard.</p>`;
            break;
        case "nonPreferencesReceived":
            legendTitleText = "Non-Preferences Received";
            if (state.masterSociogramData.nodes.length > 0) {
                legendContent.innerHTML = `
                    <div class="legend-gradient" style="background: linear-gradient(to right, ${d3.interpolateReds(0.1)}, ${d3.interpolateReds(0.9)});"></div>
                    <div class="legend-gradient-labels"><span>Low Count</span><span>High Count</span></div>`;
            }
            explanationHTML = `<p>Nodes are colored based on the number of 'Least Preferred' nominations they received. Redder nodes received more 'non-preferred' nominations, indicating higher negative peer regard.</p>`;
            break;
        case "degree":
            legendTitleText = "Total Degree";
            if (state.masterSociogramData.nodes.length > 0) {
                legendContent.innerHTML = `
                    <div class="legend-gradient" style="background: linear-gradient(to right, ${d3.interpolateBlues(0.1)}, ${d3.interpolateBlues(0.9)});"></div>
                    <div class="legend-gradient-labels"><span>Low Degree</span><span>High Degree</span></div>`;
            }
            explanationHTML = `<p>Nodes are colored based on their 'Total Degree' (total number of incoming and outgoing connections, both positive and negative). Darker blue nodes have more connections, indicating higher overall activity or involvement in the network.</p>`;
            break;
        case "betweenness":
            legendTitleText = "Betweenness Centrality";
            if (state.masterSociogramData.nodes.length > 0) {
                legendContent.innerHTML = `
                    <div class="legend-gradient" style="background: linear-gradient(to right, #440154, #fde725);"></div>
                    <div class="legend-gradient-labels"><span>Low</span><span>High</span></div>`;
            }
            explanationHTML = `<p>Colors nodes by Betweenness Centrality. Nodes with higher scores (brighter/more towards the 'high' end of the gradient) act as bridges between different parts of the network. They lie on many shortest paths between other pairs of nodes.</p>`;
            break;
        case "amsScore":
            legendTitleText = "AMS Score";
            if (state.masterSociogramData.nodes.length > 0) {
                legendContent.innerHTML = `
                    <div class="legend-gradient" style="background: linear-gradient(to right, #440154, #fde725);"></div>
                    <div class="legend-gradient-labels"><span>Low Strain</span><span>High Strain</span></div>`;
            }
            explanationHTML = `<p>Nodes are colored by their Attribute-Modulated Strain (AMS) score. This metric quantifies the social tension a person is involved in, based on imbalanced triads, weighted by homophily and status differences. Brighter colors indicate higher social strain.</p>`;
            break;
        case "coreScore":
            legendTitleText = "CORE Score";
            if (state.masterSociogramData.nodes.length > 0) {
                legendContent.innerHTML = `
                    <div class="legend-gradient" style="background: linear-gradient(to right, #5e4fa2, #f79459);"></div>
                    <div class="legend-gradient-labels"><span>Low Cohesion</span><span>High Cohesion</span></div>`;
            }
            explanationHTML = `<p>Nodes are colored by their Contextual Resonance (CORE) score. This metric measures an individual's contribution to group cohesion by analyzing their bridging and bonding ties. Higher scores (brighter colors) indicate a greater role in holding the group together.</p>`;
            break;
        case "default":
            legendTitleText = "Node Color";
            legendContent.innerHTML += `
                    <div class="legend-item">
                        <div class="legend-color-box" style="background-color: var(--accent-primary);"></div>
                        <span>Default</span>
                    </div>`;
            explanationHTML = `<p>All nodes are shown with a default color. This mode is useful for focusing on network structure without emphasis on individual attributes.</p>`;
            break;
    }
    legendTitle.textContent = legendTitleText;
    explanationContent.innerHTML = explanationHTML;
}

export function renderDataTable(data) {
    dataTableBody.innerHTML = '';
    data.forEach(rowDataObj => {
        const rowDataArray = [
            rowDataObj.code,
            rowDataObj.name,
            rowDataObj.mp1,
            rowDataObj.mp2,
            rowDataObj.mp3,
            rowDataObj.lp1,
            rowDataObj.lp2,
            rowDataObj.lp3,
        ];
        createEditableRow(rowDataArray);
    });
}

export function createEditableRow(rowData = []) {
    const tr = document.createElement('tr');
    for (let i = 0; i < 8; i++) {
        const td = document.createElement('td');
        td.contentEditable = true;
        td.textContent = rowData[i] || '';
        tr.appendChild(td);
    }
    const actionTd = document.createElement('td');
    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = 'Delete';
    deleteBtn.classList.add('danger');
    deleteBtn.onclick = () => tr.remove();
    actionTd.appendChild(deleteBtn);
    tr.appendChild(actionTd);
    dataTableBody.appendChild(tr);
    if (dataTableBody.children.length === 1 && !rowData.length) {
        tr.cells[0].focus();
    }
}

export function populateCliqueSelector() {
    const state = getState();
    const minSize = parseInt(minCliqueSizeInput.value, 10) || 2;
    cliqueSelector.innerHTML = '';

    const filteredCliques = state.allFoundCliques.filter(clique => clique.length >= minSize);
    filteredCliques.sort((a, b) => b.length - a.length || JSON.stringify(a).localeCompare(JSON.stringify(b)));

    if (filteredCliques.length === 0) {
        const option = document.createElement('option');
        option.value = "";
        option.textContent = `-- No cliques of size ${minSize}+ --`;
        cliqueSelector.appendChild(option);
        cliqueSelector.disabled = true;
        cliqueCountInfoP.textContent = `Found 0 cliques with at least ${minSize} members.`;
        clearHighlights();
        return;
    }

    cliqueSelector.disabled = false;
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = "Select a Clique";
    cliqueSelector.appendChild(defaultOption);

    filteredCliques.forEach((clique, index) => {
        const option = document.createElement('option');
        option.value = index;
        const memberNames = clique.map(id => {
            const node = state.masterSociogramData.nodes.find(n => n.id === id);
            return node ? (node.label || node.id) : id;
        }).slice(0, 3);
        option.textContent = `Clique ${index + 1} (Size: ${clique.length}): ${memberNames.join(', ')}${clique.length > 3 ? '...' : ''}`;
        option.dataset.cliqueMembers = JSON.stringify(clique);
        cliqueSelector.appendChild(option);
    });
    cliqueCountInfoP.textContent = `Found ${filteredCliques.length} clique(s) with at least ${minSize} members.`;
}

export function updateMetricsTable(nodes) {
    metricsTableBody.innerHTML = '';

    nodes.forEach(node => {
        const tr = document.createElement('tr');
        const socialPreferenceScore = node.preferencesReceived - node.nonPreferencesReceived;
        tr.innerHTML = `
      <td>${node.id}</td>
      <td>${node.label || node.id}</td>
      <td>${node.preferencesReceived}</td>
      <td>${node.nonPreferencesReceived}</td>
      <td>${node.preferencesGiven}</td>
      <td>${node.nonPreferencesGiven}</td>
      <td>${node.totalDegree}</td>
      <td>${node.positiveReciprocal}</td>
      <td>${socialPreferenceScore}</td>
      <td>${node.status || 'N/A'}</td>
      <td>${node.betweenness !== undefined ? node.betweenness.toFixed(3) : 'N/A'}</td>
      <td>${node.eigenvector !== undefined ? node.eigenvector.toFixed(3) : 'N/A'}</td>
    `;
        metricsTableBody.appendChild(tr);
    });
}

// NEW: Convenience function to redraw both data-related tables
export function renderAllTables() {
    // Note: renderDataTable() would need to be created if we were refactoring to a fully state-driven main table.
    // For now, we only need to render the new demographics table, as the main one is manipulated directly.
    renderDemographicsTable();
}

// NEW: Central function to update all data-driven UI components
export function updateAllUI(activeData) {
    if (!activeData) {
        const state = getState();
        activeData = state.activeSociogramData;
    }
    renderDemographicsTable(activeData.nodes);
    updateMetricsTable(activeData.nodes);
    populateCliqueSelector(); // This function uses the global state, which should be updated.
}