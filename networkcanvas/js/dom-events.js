// js/dom-events.js

import saveSvgAsPng from 'https://esm.sh/save-svg-as-png@1.4.17';
import { get as getState, set as setState, reset as resetState, initializeD3 } from './state.js';
import { runAnalysis, parseDemographicsCSV, mergeDemographicsIntoNodes } from './data-processing.js';
import { DEFAULT_SETTINGS } from './constants.js';
 
import { initializeGroupMetricsTab } from './group-metrics.js';
import { createEditableRow, populateCliqueSelector, updateMetricsTable, updateLegendAndExplanation, renderDemographicsTable, renderDataTable } from './ui-updates.js';
import { setupD3Graph, updateD3Graph, applyFiltersAndRedraw, highlightClique, clearHighlights, handleFullscreenChange, resetGraph } from './d3-graph.js';
import { renderFilterPanel } from './filters.js';
import { exportTableToCsv, exportGroupAnalysisToCsv, exportAnalysisToPng } from './export.js';
import { updateStatus, resetStatus, updateVersion } from './statusbar.js';
import { showNotification } from './notifications.js';
import { initializeDeletedNodesUI } from './deleted-nodes-ui.js';
import { initializeSearch } from './search.js';
import { reprocessDataAndRedrawAll } from './app.js';
import { updateDashboard } from './dashboard.js';

// DOM Elements
const viewToolbarButtons = document.querySelectorAll('#view-toolbar .toolbar-button[data-tab]');
const sections = document.querySelectorAll('section.tab');
const addRowBtn = document.getElementById('add-row-btn');
const clearTableBtn = document.getElementById('clear-table-btn');

const analyzeBtn = document.getElementById('analyze-btn');
const csvFileInput = document.getElementById('csv-file-input');
const demographicsCsvFileInput = document.getElementById('demographics-csv-file-input');
const dataTable = document.getElementById('data-table');
const dataTableBody = document.querySelector('#data-table tbody');
const metricsTableBody = document.querySelector('#metrics-table tbody');
const cliqueCountInfoP = document.getElementById('clique-count-info');
const nodeLabelSelect = document.getElementById('node-label-select');
const nodeColorModeSelect = document.getElementById('node-color-mode');
const nodeLabelSizeInput = document.getElementById('node-label-size');
const nodeLabelSizeValueDisplay = document.getElementById('node-label-size-value');
const linkDistanceInput = document.getElementById('link-distance');
const linkDistanceValueDisplay = document.getElementById('link-distance-value');
const chargeStrengthInput = document.getElementById('charge-strength');
const chargeStrengthValueDisplay = document.getElementById('charge-strength-value');
const collideRadiusFactorInput = document.getElementById('collide-radius-factor');
const collideRadiusFactorValueDisplay = document.getElementById('collide-radius-factor-value');
const showPositiveLinksCheckbox = document.getElementById('show-positive-links');
const showNegativeLinksCheckbox = document.getElementById('show-negative-links');
const minPrefsFilterInput = document.getElementById('min-prefs-filter');
const downloadGraphBtn = document.getElementById('download-graph-btn');
const fullscreenGraphBtn = document.getElementById('fullscreen-graph-btn');
const minCliqueSizeInput = document.getElementById('min-clique-size');
const cliqueSelector = document.getElementById('clique-selector');
const clearHighlightBtn = document.getElementById('clear-highlight-btn');
const addDemographicColumnBtn = document.getElementById('add-demographic-column-btn');
const demographicsTable = document.getElementById('demographics-table');
const exitEgoViewBtn = document.getElementById('exit-ego-view-btn');
const themeToggleBtn = document.getElementById('theme-toggle-btn');
const saveBtn = document.getElementById('save-btn');
const loadFileInput = document.getElementById('load-file-input');
const applyBtn = document.getElementById('apply-filters-btn');
const resetBtn = document.getElementById('reset-filters-btn');
const invertBtn = document.getElementById('invert-filters-btn');
const pillsContainer = document.getElementById('active-filters-pills-container');
const sidebarToggleBtn = document.getElementById('sidebar-toggle-btn');
const graphLegendContainer = document.querySelector('.graph-legend-container');

function setupEventListeners() {
    viewToolbarButtons.forEach(button => {
        button.addEventListener('click', () => {
            viewToolbarButtons.forEach(t => t.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            button.classList.add('active');
            const activeSection = document.getElementById(button.dataset.tab);
            activeSection.classList.add('active');

            if (button.dataset.tab === 'dashboard') {
                updateDashboard();
            } else if (button.dataset.tab === 'group-analysis') {
                
            } else if (button.dataset.tab === 'group-metrics') {
                initializeGroupMetricsTab();
            }

            if (button.dataset.tab === 'graph') {
                requestAnimationFrame(() => {
                    const appState = getState();
                    if (!appState.graphInitialized) {
                        if (!setupD3Graph()) {
                            console.error("Failed to initialize graph on tab click.");
                            return;
                        }
                    } else {
                        const containerRect = appState.d3Container.getBoundingClientRect();
                        if (containerRect.width > 0 && containerRect.height > 0) {
                            const newWidth = Math.floor(containerRect.width);
                            const newHeight = Math.floor(containerRect.height);

                            if (appState.width !== newWidth || appState.height !== newHeight) {
                                setState({ width: newWidth, height: newHeight });
                                appState.svg.attr("width", newWidth).attr("height", newHeight);
                                if (appState.simulation) {
                                    appState.simulation.force("center", d3.forceCenter(newWidth / 2, newHeight / 2));
                                    if (appState.currentDisplayNodes.length > 0) appState.simulation.alpha(0.3).restart();
                                }
                            }
                        }
                    }
                    if (appState.masterSociogramData.nodes.length > 0 && appState.currentDisplayNodes.length === 0 && appState.currentDisplayLinks.length === 0) {
                        applyFiltersAndRedraw();
                    } else if (appState.currentDisplayNodes.length > 0) {
                        updateD3Graph();
                    } else {
                        updateLegendAndExplanation(nodeColorModeSelect.value);
                    }
                });
            }
        });
    });

    addRowBtn.addEventListener('click', () => createEditableRow());

    

    clearTableBtn.addEventListener('click', () => {
        const appState = getState();
        const previousState = JSON.parse(JSON.stringify(appState));

        dataTableBody.innerHTML = '';
        metricsTableBody.innerHTML = '';
        resetState();
        resetStatus(); // Add this call

        if (appState.graphInitialized) {
            if (appState.linkGroup) appState.linkGroup.selectAll("*").remove();
            if (appState.nodeGroup) appState.nodeGroup.selectAll("*").remove();
            if (appState.simulation) appState.simulation.nodes([]).force("link", null).alpha(1).stop();
        }
        populateCliqueSelector();
        cliqueCountInfoP.textContent = "";
        clearHighlights();
        updateLegendAndExplanation(nodeColorModeSelect.value);
        if (appState.zoomBehavior && appState.svg.node() && appState.graphInitialized) {
            appState.svg.call(appState.zoomBehavior.transform, d3.zoomIdentity);
        }
        renderDemographicsTable(); 
        renderFilterPanel();

        showNotification('Table cleared.', 'info', 6000, {
            text: 'Undo',
            onClick: () => {
                setState(previousState);
                const dataForTable = previousState.masterSociogramData.nodes.map(node => {
                    const links = previousState.masterSociogramData.links.filter(l => (l.source.id || l.source) === node.id);
                    const mp = links.filter(l => l.type === 'positive').map(l => l.target.id || l.target);
                    const lp = links.filter(l => l.type === 'negative').map(l => l.target.id || l.target);
                    return {
                        code: node.id,
                        name: node.label,
                        mp1: mp[0] || '',
                        mp2: mp[1] || '',
                        mp3: mp[2] || '',
                        lp1: lp[0] || '',
                        lp2: lp[1] || '',
                        lp3: lp[2] || '',
                    };
                });
                renderDataTable(dataForTable);
                reprocessDataAndRedrawAll();
                showNotification('Table restored.', 'success');
            }
        });
    });

    csvFileInput.addEventListener('change', (event) => {
        const file = event.target.files[0];
        if (file) {
            clearTableBtn.click();

            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target.result;
                const rows = text.split(/\r\n|\n/).filter(row => row.trim() !== '');
                if (rows.length < 2) {
                    showNotification("CSV must have a header and at least one data row.", 'error');
                    return;
                }

                const header = rows[0].split(',').map(h => h.trim());
                const data = rows.slice(1).map(rowStr => {
                    const values = rowStr.split(',').map(v => v.trim());
                    const rowData = {};
                    header.forEach((key, index) => {
                        rowData[key] = values[index];
                    });
                    return rowData;
                });

                const dataForTable = data.map(d => ({
                    code: d.Code,
                    name: d.Name,
                    mp1: d.ML1 || d.MP1,
                    mp2: d.ML2 || d.MP2,
                    mp3: d.ML3 || d.MP3,
                    lp1: d.LL1 || d.LP1,
                    lp2: d.LL2 || d.LP2,
                    lp3: d.LL3 || d.LP3,
                }));

                renderDataTable(dataForTable);
            };
            reader.readAsText(file);
            csvFileInput.value = '';
        }
    });

    analyzeBtn.addEventListener('click', () => {
        updateStatus('Running analysis...');
        // Read the current state of the data table from the DOM
        const tableRows = [...dataTableBody.rows];
        const tableData = tableRows.map(r => 
            [...r.cells].map(c => c.innerText.trim()).slice(0, 8)
        );

        const currentDemographics = {
            keys: [...getState().demographicKeys],
            data: new Map()
        };
        getState().masterSociogramData.nodes.forEach(node => {
            currentDemographics.data.set(node.id, {...node.demographics});
        });

        const analysisResult = runAnalysis(tableData);

        setTimeout(() => {
            if (analysisResult) {
                
                analysisResult.nodes.forEach(node => {
                    if(currentDemographics.data.has(node.id)) {
                        node.demographics = currentDemographics.data.get(node.id);
                    }
                });

                setState({
                    masterSociogramData: {
                        nodes: analysisResult.nodes,
                        links: analysisResult.links,
                    },
                    activeSociogramData: {
                        nodes: analysisResult.nodes,
                        links: analysisResult.links,
                    },
                    demographicKeys: currentDemographics.keys,
                    allFoundCliques: analysisResult.cliques,
                });

                updateDashboard();
                updateMetricsTable(analysisResult.nodes);
                populateCliqueSelector();
                clearHighlights();
                cliqueSelector.value = "";
                renderDemographicsTable(); 
                renderFilterPanel();
                
                initializeGroupMetricsTab(); // <-- ADDED THIS LINE

                const graphTabButton = document.querySelector('.toolbar-button[data-tab="graph"]');
                if (graphTabButton) {
                    if (!document.getElementById('graph').classList.contains('active')) {
                        graphTabButton.click();
                    } else {
                        requestAnimationFrame(() => {
                            const appState = getState();
                            if (!appState.graphInitialized) {
                                if (!setupD3Graph()) {
                                    console.error("Graph setup failed during analysis while tab was active.");
                                    return;
                                }
                            }
                            const containerRect = appState.d3Container.getBoundingClientRect();
                            if (containerRect.width > 0 && containerRect.height > 0) {
                                setState({ width: Math.floor(containerRect.width), height: Math.floor(containerRect.height) });
                                appState.svg.attr("width", appState.width).attr("height", appState.height);
                                if (appState.simulation) {
                                    appState.simulation.force("center", d3.forceCenter(appState.width / 2, appState.height / 2));
                                }
                            }
                            applyFiltersAndRedraw();
                            if (appState.zoomBehavior && appState.svg.node() && appState.graphInitialized) {
                                appState.svg.call(appState.zoomBehavior.transform, d3.zoomIdentity);
                            }
                        });
                    }
                }
                updateStatus('Analysis complete.');
            } else {
                updateStatus('Analysis failed. Please check data.');
            }
        }, 500); // Artificial delay for UX
    });

    // --- Data Table Sorting ---
    let currentSort = { column: 'code', direction: 'asc' };
    const dataTableThead = dataTable.querySelector('thead');
    if(dataTableThead) {
        dataTableThead.addEventListener('click', (event) => {
        const header = event.target.closest('th.sortable');
        if (!header) return;

        const column = header.dataset.column;

        if (currentSort.column === column) {
            currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            currentSort.column = column;
            currentSort.direction = 'asc';
        }

        const rows = Array.from(dataTable.querySelectorAll('tbody tr'));
        const data = rows.map(row => {
            const cells = Array.from(row.querySelectorAll('td'));
            return {
                code: cells[0].textContent,
                name: cells[1].textContent,
                mp1: cells[2].textContent,
                mp2: cells[3].textContent,
                mp3: cells[4].textContent,
                lp1: cells[5].textContent,
                lp2: cells[6].textContent,
                lp3: cells[7].textContent,
            };
        });

        data.sort((a, b) => {
            const valA = a[column] || '';
            const valB = b[column] || '';
            const comparison = valA.localeCompare(valB, undefined, {numeric: true});
            return currentSort.direction === 'asc' ? comparison : -comparison;
        });

        renderDataTable(data);

        dataTable.querySelectorAll('thead th.sortable').forEach(th => {
            th.classList.remove('sorted-asc', 'sorted-desc');
        });
        header.classList.add(currentSort.direction === 'asc' ? 'sorted-asc' : 'sorted-desc');
    });
    }

    

    // --- DEMOGRAPHICS EVENT LISTENERS ---

    demographicsCsvFileInput.addEventListener('change', handleDemographicsUpload);

    addDemographicColumnBtn.addEventListener('click', () => {
        const newKey = prompt("Enter a name for the new demographic (e.g., Age, Department):");
        if (newKey && newKey.trim() !== "") {
            const appState = getState();
            const trimmedKey = newKey.trim();
            if (appState.demographicKeys.includes(trimmedKey)) {
                showNotification(`The demographic "${trimmedKey}" already exists.`, 'error');
                return;
            }
            if(appState.masterSociogramData.nodes.length === 0) {
                showNotification("Please click 'GET ANALYSIS' at least once before adding demographics.", 'info');
                return;
            }
            appState.demographicKeys.push(trimmedKey);
            renderDemographicsTable();
            renderFilterPanel();
        }
    });

    demographicsTable.addEventListener('click', event => {
        if (event.target.classList.contains('delete-column-btn')) {
            const keyToDelete = event.target.dataset.key;
            if (confirm(`Are you sure you want to delete the entire "${keyToDelete}" demographic column?`)) {
                const appState = getState();
                appState.demographicKeys = appState.demographicKeys.filter(k => k !== keyToDelete);
                appState.masterSociogramData.nodes.forEach(node => {
                    if (node.demographics) {
                        delete node.demographics[keyToDelete];
                    }
                });
                renderDemographicsTable();
                renderFilterPanel();
            }
        }
    });

    demographicsTable.addEventListener('blur', event => {
        const target = event.target;
        const appState = getState();
        if (target.tagName === 'TD' && target.contentEditable === 'true') {
            const code = target.dataset.code;
            const key = target.dataset.key;
            const value = target.textContent.trim();
            const nodeToUpdate = appState.masterSociogramData.nodes.find(n => n.id === code);
            if (nodeToUpdate) {
                nodeToUpdate.demographics[key] = value;
            }
        }
        if (target.tagName === 'SPAN' && target.contentEditable === 'true') {
            const oldKey = target.dataset.key;
            const newKey = target.textContent.trim();
            if (oldKey === newKey) return;
            if (!newKey || appState.demographicKeys.includes(newKey)) {
                showNotification(`Invalid name. "${newKey}" is either empty or already exists.`, 'error');
                target.textContent = oldKey;
                return;
            }
            const keyIndex = appState.demographicKeys.findIndex(k => k === oldKey);
            if(keyIndex > -1) {
                appState.demographicKeys[keyIndex] = newKey;
            }
            appState.masterSociogramData.nodes.forEach(node => {
                if(node.demographics && node.demographics.hasOwnProperty(oldKey)) {
                    node.demographics[newKey] = node.demographics[oldKey];
                    delete node.demographics[oldKey];
                }
            });
            renderDemographicsTable();
            renderFilterPanel();
        }
    }, true);

    let demogCurrentSort = { column: 'id', direction: 'asc' };
    const demographicsTableThead = demographicsTable.querySelector('thead');
    if(demographicsTableThead) {
        demographicsTableThead.addEventListener('click', (event) => {
        const header = event.target.closest('th.sortable');
        if (!header) return;

        const column = header.dataset.column;

        if (demogCurrentSort.column === column) {
            demogCurrentSort.direction = demogCurrentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            demogCurrentSort.column = column;
            demogCurrentSort.direction = 'asc';
        }

        const appState = getState();
        const nodesToSort = [...appState.masterSociogramData.nodes];

        nodesToSort.sort((a, b) => {
            let valA, valB;

            if (column === 'id' || column === 'label') {
                valA = a[column] || '';
                valB = b[column] || '';
            } else {
                valA = (a.demographics && a.demographics[column]) || '';
                valB = (b.demographics && b.demographics[column]) || '';
            }
            
            const comparison = String(valA).localeCompare(String(valB), undefined, {numeric: true});
            return demogCurrentSort.direction === 'asc' ? comparison : -comparison;
        });

        renderDemographicsTable(nodesToSort);

        demographicsTable.querySelectorAll('thead th.sortable').forEach(th => {
            th.classList.remove('sorted-asc', 'sorted-desc');
        });
        header.classList.add(demogCurrentSort.direction === 'asc' ? 'sorted-asc' : 'sorted-desc');
    }); 
    }

    // --- Metrics Table Sorting ---
    const metricsTable = document.getElementById('metrics-table');
    let metricsCurrentSort = { column: 'id', direction: 'asc' };
    const metricsTableThead = metricsTable.querySelector('thead');
    if(metricsTableThead) {
        metricsTableThead.addEventListener('click', (event) => {
        const header = event.target.closest('th.sortable');
        if (!header) return;

        const column = header.dataset.column;

        if (metricsCurrentSort.column === column) {
            metricsCurrentSort.direction = metricsCurrentSort.direction === 'asc' ? 'desc' : 'asc';
        } else {
            metricsCurrentSort.column = column;
            metricsCurrentSort.direction = 'asc';
        }

        const appState = getState();
        const nodesToSort = [...appState.masterSociogramData.nodes];

        nodesToSort.sort((a, b) => {
            let valA = a[column];
            let valB = b[column];

            // Handle special case for social preference score, which is calculated on the fly
            if (column === 'socialPreferenceScore') {
                valA = a.preferencesReceived - a.nonPreferencesReceived;
                valB = b.preferencesReceived - b.nonPreferencesReceived;
            }

            if (typeof valA === 'string') {
                const comparison = valA.localeCompare(valB, undefined, {numeric: true});
                return metricsCurrentSort.direction === 'asc' ? comparison : -comparison;
            } else {
                const comparison = (valA || 0) - (valB || 0);
                return metricsCurrentSort.direction === 'asc' ? comparison : -comparison;
            }
        });

        updateMetricsTable(nodesToSort);

        metricsTable.querySelectorAll('thead th.sortable').forEach(th => {
            th.classList.remove('sorted-asc', 'sorted-desc');
        });
        header.classList.add(metricsCurrentSort.direction === 'asc' ? 'sorted-asc' : 'sorted-desc');
    });
    }

    // --- END DEMOGRAPHICS ---

    nodeLabelSelect.addEventListener('change', updateD3Graph);
    nodeColorModeSelect.addEventListener('change', updateD3Graph);
    nodeLabelSizeInput.addEventListener('input', () => {
        nodeLabelSizeValueDisplay.textContent = nodeLabelSizeInput.value;
        const appState = getState();
        if (appState.graphInitialized && appState.currentDisplayNodes.length > 0) {
            updateD3Graph();
        }
    });

    

    

    [linkDistanceInput, chargeStrengthInput, collideRadiusFactorInput].forEach(input => {
        input.addEventListener('input', () => {
            if (input.id === 'link-distance') linkDistanceValueDisplay.textContent = input.value;
            if (input.id === 'charge-strength') chargeStrengthValueDisplay.textContent = input.value;
            if (input.id === 'collide-radius-factor') collideRadiusFactorValueDisplay.textContent = input.value;
            const appState = getState();
            if (appState.simulation && appState.currentDisplayNodes.length > 0) {
                if (input.id === 'link-distance') appState.simulation.force("link").distance(+input.value);
                if (input.id === 'charge-strength') appState.simulation.force("charge").strength(+input.value);
                if (input.id === 'collide-radius-factor') appState.simulation.force("collide").radius(d => d.radius * (+input.value) + 3);
                appState.simulation.alpha(0.3).restart();
            } else if (appState.masterSociogramData.nodes.length > 0) {
                applyFiltersAndRedraw();
            }
        });
    });

    [showPositiveLinksCheckbox, showNegativeLinksCheckbox, minPrefsFilterInput].forEach(input => {
        input.addEventListener('input', applyFiltersAndRedraw);
    });

    downloadGraphBtn.addEventListener('click', async () => {
        const appState = getState();
        const svgElement = document.getElementById('sociogram-svg');
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');

        // Use the helper to get an SVG with inlined styles
        const styledSvgElement = await getSvgWithInlinedStyles(svgElement);

        const options = {
            backgroundColor: getComputedStyle(appState.d3Container).backgroundColor || 'var(--bg-primary)',
            scale: 2
        };

        // Pass the new, styled SVG to the exporter
        saveSvgAsPng.saveSvgAsPng(styledSvgElement, `sociogram-${timestamp}.png`, options);
    });

    fullscreenGraphBtn.addEventListener('click', () => {
        const elem = document.getElementById('graph');

        if (!document.fullscreenElement &&
            !document.mozFullScreenElement &&
            !document.webkitFullscreenElement &&
            !document.msFullscreenElement) {
            if (elem.requestFullscreen) {
                elem.requestFullscreen();
            } else if (elem.mozRequestFullScreen) {
                elem.mozRequestFullScreen();
            } else if (elem.webkitRequestFullscreen) {
                elem.webkitRequestFullscreen();
            } else if (elem.msRequestFullscreen) {
                elem.msRequestFullscreen();
            }
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
            } else if (document.mozCancelFullScreen) {
                document.mozCancelFullScreen();
            } else if (document.webkitExitFullscreen) {
                document.webkitExitFullscreen();
            } else if (document.msExitFullscreen) {
                document.msExitFullscreen();
            }
        }
    });

    minCliqueSizeInput.addEventListener('input', () => {
        const appState = getState();
        if (appState.allFoundCliques.length > 0 || appState.masterSociogramData.nodes.length > 0) {
            populateCliqueSelector();
            clearHighlights();
            cliqueSelector.value = "";
        }
    });

    cliqueSelector.addEventListener('change', (event) => {
        const selectedOption = event.target.selectedOptions[0];
        if (selectedOption && selectedOption.value !== "") {
            try {
                const cliqueMembers = JSON.parse(selectedOption.dataset.cliqueMembers);
                const appState = getState();
                const visibleCliqueMembers = cliqueMembers.filter(id =>
                    appState.currentDisplayNodes.find(n => n.id === id)
                );
                if (visibleCliqueMembers.length >= 2) {
                    highlightClique(visibleCliqueMembers);
                } else {
                    clearHighlights();
                    showNotification("Selected clique members are not sufficiently visible with current graph filters.", 'info');
                }
            } catch (e) {
                console.error("Error parsing clique members from selector:", e);
                clearHighlights();
            }
        }
    });

    clearHighlightBtn.addEventListener('click', () => {
        clearHighlights();
        cliqueSelector.value = "";
    });

    exitEgoViewBtn.addEventListener('click', () => {
        setState({ isEgoView: false, egoNodeId: null });
        applyFiltersAndRedraw();
        exitEgoViewBtn.style.display = 'none';
    });

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('mozfullscreenchange', handleFullscreenChange);
    document.addEventListener('MSFullscreenChange', handleFullscreenChange);

    // Export Listeners
    document.getElementById('export-metrics-csv-btn').addEventListener('click', () => {
        exportTableToCsv('metrics-table', 'network-metrics.csv');
    });

    // document.getElementById('export-analysis-csv-btn').addEventListener('click', () => {
    //     exportGroupAnalysisToCsv('group-analysis-data.csv');
    // });

    // document.getElementById('export-analysis-png-btn').addEventListener('click', () => {
    //     exportAnalysisToPng('group-analysis-report.png');
    // });

    document.getElementById('reset-graph-btn').addEventListener('click', resetGraph);

    themeToggleBtn.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
    });

    saveBtn.addEventListener('click', saveState);
    loadFileInput.addEventListener('change', loadState);

    // --- Global listener to close context menu ---
    window.addEventListener('click', (event) => {
        const contextMenu = document.getElementById('context-menu');
        if (contextMenu && contextMenu.style.display === 'block') {
            // We check if the event target is not a node circle itself, as the contextmenu event on the node handles that.
            if (!event.target.closest('.node')) {
                contextMenu.style.display = 'none';
            }
        }
    });

    if (sidebarToggleBtn) {
        sidebarToggleBtn.addEventListener('click', () => {
            if (graphLegendContainer) {
                graphLegendContainer.classList.toggle('collapsed');
                
                // Trigger a resize event after the transition to make D3 redraw
                setTimeout(() => {
                    window.dispatchEvent(new Event('resize'));
                }, 350); // A little longer than the CSS transition
            }
        });
    }
}

function handleDemographicsUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        const text = e.target.result;
        const demographicsMap = parseDemographicsCSV(text);
        const appState = getState();
        mergeDemographicsIntoNodes(appState.masterSociogramData.nodes, demographicsMap);
        
        // Update demographic keys
        const firstRecord = demographicsMap.values().next().value;
        if (firstRecord) {
            const newKeys = Object.keys(firstRecord);
            newKeys.forEach(key => {
                if (!appState.demographicKeys.includes(key)) {
                    appState.demographicKeys.push(key);
                }
            });
        }

        renderDemographicsTable();
        
        renderFilterPanel();
        showNotification('Demographics imported successfully!', 'success');
    };

    reader.readAsText(file);
    demographicsCsvFileInput.value = '';
}

function saveState() {
    const appState = getState();
    const stateToSave = { ...appState };
    delete stateToSave.d3Container;
    delete stateToSave.svg;
    delete stateToSave.simulation;
    delete stateToSave.zoomBehavior;
    delete stateToSave.linkGroup;
    delete stateToSave.nodeGroup;
    delete stateToSave.zoomableGroup;

    const stateString = JSON.stringify(stateToSave, (key, value) => {
        if (value instanceof Set) {
            return { _type: 'set', value: [...value] };
        }
        return value;
    });
    const blob = new Blob([stateString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'network-canvas-session.json';
    a.click();
    URL.revokeObjectURL(url);
    showNotification('Session saved successfully!', 'success');
}

function loadState(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const stateString = e.target.result;
            const loadedState = JSON.parse(stateString, (key, value) => {
                if (value && value._type === 'set') {
                    return new Set(value.value);
                }
                return value;
            });

            // Basic validation
            if (!loadedState.masterSociogramData || !loadedState.demographicKeys) {
                throw new Error('Invalid session file.');
            }

            const currentState = getState();
            const d3Container = currentState.d3Container;
            const svg = currentState.svg;
            const simulation = currentState.simulation;
            const zoomBehavior = currentState.zoomBehavior;
            const linkGroup = currentState.linkGroup;
            const nodeGroup = currentState.nodeGroup;
            const zoomableGroup = currentState.zoomableGroup;


            setState(loadedState);
            setState({ 
                d3Container, 
                svg,
                simulation,
                zoomBehavior,
                linkGroup,
                nodeGroup,
                zoomableGroup
            });


            // Re-render UI from the loaded state
            const dataForTable = loadedState.masterSociogramData.nodes.map(node => {
                const links = loadedState.masterSociogramData.links.filter(l => (l.source.id || l.source) === node.id);
                const mp = links.filter(l => l.type === 'positive').map(l => l.target.id || l.target);
                const lp = links.filter(l => l.type === 'negative').map(l => l.target.id || l.target);
                return {
                    code: node.id,
                    name: node.label,
                    mp1: mp[0] || '',
                    mp2: mp[1] || '',
                    mp3: mp[2] || '',
                    lp1: lp[0] || '',
                    lp2: lp[1] || '',
                    lp3: lp[2] || '',
                };
            });
            renderDataTable(dataForTable);
            reprocessDataAndRedrawAll();
            showNotification('Session loaded successfully!', 'success');
        } catch (error) {
            console.error("Failed to load session:", error);
            showNotification(`Error loading session: ${error.message}`, 'error');
        }
    };

    reader.readAsText(file);
    loadFileInput.value = ''; // Reset file input
}


function loadExampleData() {
    const exampleData = [
        { code: "A", name: "Alice", mp1: "B", mp2: "", mp3: "", lp1: "C", lp2: "", lp3: "" },
        { code: "B", name: "Bob", mp1: "A", mp2: "", mp3: "", lp1: "", lp2: "", lp3: "" },
        { code: "C", name: "Charlie", mp1: "B", mp2: "", mp3: "", lp1: "A", lp2: "", lp3: "" },
        { code: "D", name: "Diana", mp1: "A", mp2: "B", mp3: "", lp1: "C", lp2: "", lp3: "" },
        { code: "E", name: "Eve", mp1: "D", mp2: "", mp3: "", lp1: "A", lp2: "", lp3: "" },
    ];
    renderDataTable(exampleData);
    analyzeBtn.click(); // Automatically run analysis after loading example data
}

// --- Helper function for SVG download ---
async function getSvgWithInlinedStyles(svgElement) {
    const originalSvgClone = svgElement.cloneNode(true);
    const nodes = originalSvgClone.querySelectorAll('.node');
    const links = originalSvgClone.querySelectorAll('.link');
    const texts = originalSvgClone.querySelectorAll('text');

    // Helper to get computed style
    const getStyle = (element, prop) => window.getComputedStyle(element, null).getPropertyValue(prop);

    // Inline styles for nodes (circles)
    nodes.forEach((node, i) => {
        const originalNode = svgElement.querySelectorAll('.node')[i];
        if (originalNode) {
            const circle = node.querySelector('circle');
            const originalCircle = originalNode.querySelector('circle');
            if (circle && originalCircle) {
                circle.style.fill = getStyle(originalCircle, 'fill');
                circle.style.stroke = getStyle(originalCircle, 'stroke');
                circle.style.strokeWidth = getStyle(originalCircle, 'stroke-width');
            }
        }
    });

    // Inline styles for links (lines)
    links.forEach((link, i) => {
        const originalLink = svgElement.querySelectorAll('.link')[i];
        if (originalLink) {
            link.style.stroke = getStyle(originalLink, 'stroke');
            link.style.strokeWidth = getStyle(originalLink, 'stroke-width');
            link.style.markerEnd = getStyle(originalLink, 'marker-end');
        }
    });

    // Inline styles for text labels
    texts.forEach((text, i) => {
        const originalText = svgElement.querySelectorAll('text')[i];
        if (originalText) {
            text.style.fontSize = getStyle(originalText, 'font-size');
            text.style.fontFamily = getStyle(originalText, 'font-family');
            text.style.fill = getStyle(originalText, 'fill');
            text.style.textAnchor = getStyle(originalText, 'text-anchor');
            text.style.dominantBaseline = getStyle(originalText, 'dominant-baseline');
        }
    });
    
    // Also copy the arrow marker definitions
    const defs = window.document.querySelector('#sociogram-svg defs');
    if(defs) {
        originalSvgClone.prepend(defs.cloneNode(true));
    }

    return originalSvgClone;
}

function initializeApp(d3) {
    createEditableRow();
    setupEventListeners();
    
    initializeDeletedNodesUI();
    initializeSearch();
    resetStatus(); // Add this call
    updateLegendAndExplanation(nodeColorModeSelect.value);
    updateVersion('1.0.0'); // Hardcoded version for now

    // Set default values from constants
    nodeLabelSizeInput.value = DEFAULT_SETTINGS.NODE_LABEL_SIZE;
    linkDistanceInput.value = DEFAULT_SETTINGS.LINK_DISTANCE;
    chargeStrengthInput.value = DEFAULT_SETTINGS.CHARGE_STRENGTH;
    collideRadiusFactorInput.value = DEFAULT_SETTINGS.COLLIDE_RADIUS_FACTOR;
    minCliqueSizeInput.value = DEFAULT_SETTINGS.MIN_CLIQUE_SIZE;

    const d3Container = document.getElementById('d3-sociogram-container');
    initializeD3(d3, d3Container);

    const resizeObserver = new ResizeObserver(entries => {
        for (let entry of entries) {
            const appState = getState();
            if (entry.target === appState.d3Container && appState.graphInitialized) {
                if (document.fullscreenElement) {
                    return;
                }
                requestAnimationFrame(() => {
                    const newWidth = Math.floor(entry.contentRect.width);
                    const newHeight = Math.floor(entry.contentRect.height);
                    if (newWidth > 0 && newHeight > 0) {
                        if (appState.width !== newWidth || appState.height !== newHeight) {
                            setState({ width: newWidth, height: newHeight });
                            appState.svg.attr("width", newWidth).attr("height", newHeight);
                            if (appState.simulation) {
                                appState.simulation.force("center", d3.forceCenter(newWidth / 2, newHeight / 2));
                                if (document.getElementById('graph').classList.contains('active') && appState.currentDisplayNodes.length > 0) {
                                    appState.simulation.alpha(0.1).restart();
                                }
                            }
                        }
                    }
                });
            }
        }
    });
    if (d3Container) resizeObserver.observe(d3Container);
    else console.error("D3 container not found for ResizeObserver.");

    // Default to data tab
    document.querySelector('.toolbar-button[data-tab="data"]').click();
}

function applyActiveFilters() {
    const activeFilters = {};
    document.querySelectorAll('#filter-controls-container input[type="checkbox"]').forEach(checkbox => {
        const key = checkbox.dataset.key;
        if (checkbox.checked) {
            if (!activeFilters[key]) {
                activeFilters[key] = new Set();
            }
            activeFilters[key].add(checkbox.dataset.value);
        }
    });
    setState({ activeFilters });

    renderActiveFilterPills();
    reprocessDataAndRedrawAll();
}

function resetAllFilters() {
    setState({ activeFilters: {} });
    renderFilterPanel();
    renderActiveFilterPills();
    reprocessDataAndRedrawAll();
}

function invertFilters() {
    document.querySelectorAll('#filter-controls-container input[type="checkbox"]').forEach(checkbox => {
        checkbox.checked = !checkbox.checked;
    });
    applyActiveFilters();
}

function renderActiveFilterPills() {
    const { activeFilters } = getState();
    pillsContainer.innerHTML = '';
    for (const key in activeFilters) {
        activeFilters[key].forEach(value => {
            const pill = document.createElement('div');
            pill.classList.add('filter-pill');
            pill.innerHTML = `
                <span>${key}: ${value}</span>
                <button class="remove-pill-btn" data-key="${key}" data-value="${value}">&times;</button>
            `;
            pillsContainer.appendChild(pill);
        });
    }

    const removeButtons = document.querySelectorAll('.remove-pill-btn');
    removeButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            const key = e.target.dataset.key;
            const value = e.target.dataset.value;
            const { activeFilters } = getState();

            if (activeFilters[key] && activeFilters[key].has(value)) {
                activeFilters[key].delete(value);
                if (activeFilters[key].size === 0) {
                    delete activeFilters[key];
                }
            }
            setState({ activeFilters });
            
            renderFilterPanel();
            renderActiveFilterPills();
            reprocessDataAndRedrawAll();
        });
    });
}

function initializeFilterPanel() {
    renderFilterPanel();
    applyBtn.addEventListener('click', applyActiveFilters);
    resetBtn.addEventListener('click', resetAllFilters);
    invertBtn.addEventListener('click', invertFilters);
}

export { initializeApp, initializeFilterPanel };