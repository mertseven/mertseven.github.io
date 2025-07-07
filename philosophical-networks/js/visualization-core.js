// js/visualization-core.js
// This file contains the shared D3.js and UI logic for all visualizations.

(function(d3) {
    'use strict';

    const Core = {
        svg: null,
        g: null,
        simulation: null,
        nodesData: [],
        linksData: [],
        nodeElements: null,
        linkElements: null,
        colorScale: null,
        config: {
            // Default core configurations
            width: 0,
            height: 0,
            controlsPanelWidth: 290,
            headerHeight: 71, 
            linkStrength: 0.3,
            chargeStrength: -500,
            nodeBaseSize: 10,
            linkDistance: 150,
            categories: [], // Auto-derived if not provided
            nodeRadiusMode: 'category', // 'category' or 'connections'
            nodeRadiusFunction: null, // Custom function can override mode
            connectionRadiusMultiplier: 2,
            maxConnectionRadiusIncrease: 15,
            linkDescriptionFormatter: null, // Custom function for popup link text
            centralNodeId: null,
            initialZoomScale: 1.0, // For centralNodeId or general initial view
            fixedCentralNodeDuration: 0, // Duration in ms to keep centralNode fixed (0 = not fixed)
        },
        ui: {
            searchInput: null, searchButton: null, categoryButtons: null, resetButton: null,
            infoButton: null, infoModal: null, closeModal: null, 
            nodePopup: null, popupTitle: null, popupCategory: null, popupYears: null, popupDescription: null, connectionsList: null, 
            closePopup: null, 
            linkStrength: null, chargeStrength: null, nodeSize: null, linkDistance: null, 
            collapsibleHeaders: null,
        },
        activeCategories: [],
        currentZoomTransform: d3.zoomIdentity,
        isSimulationStable: false, // Flag to manage initial centering
        centralNodeFixTimeout: null, // Timeout ID for releasing fixed central node
    };

    function initializeVisualization(nodes, links, userConfig = {}) {
        // Deep clone data to prevent modification of original data objects by D3
        Core.nodesData = nodes.map(n => ({...n})); 
        Core.linksData = links.map(l => ({...l})); 

        // Reset core config to defaults before merging userConfig
        // This is important if CoreViz.init is called multiple times on a single page (though not typical for this setup)
        // or for ensuring a clean state.
        _resetCoreConfigToDefaults();
        Object.assign(Core.config, userConfig); 

        _setupDimensions();
        _cacheDOMElements(); 
        _setInitialSliderValuesFromConfig(); 
        _setupSVG();
        _setupZoom();
        _setupColorScale(); 
        _deriveCategoriesAndSetupFilters(); // Combined category derivation and filter button setup
        _setupSimulation(); 
        _createGraphElements(); 
        _setupEventListeners(); 
        _startSimulation();

        if (Core.config.centralNodeId) {
            _centerOnNodeWhenReady(Core.config.centralNodeId, true);
        }
        
        // Initialize collapsible panels to be open
        if (Core.ui.collapsibleHeaders) {
            Core.ui.collapsibleHeaders.forEach(header => {
                const content = header.nextElementSibling;
                const toggleButton = header.querySelector('.toggle-button');
                if (content && content.classList.contains('control-content')) {
                    content.classList.add('visible'); // Make visible by default
                    if(toggleButton) toggleButton.textContent = '▲';
                }
            });
        }
        console.log("Visualization Core Initialized for:", document.title, "with Config:", JSON.parse(JSON.stringify(Core.config)));
    }

    function _resetCoreConfigToDefaults() {
        Core.config = {
            width: 0, height: 0, controlsPanelWidth: 290, headerHeight: 71,
            linkStrength: 0.3, chargeStrength: -500, nodeBaseSize: 10, linkDistance: 150,
            categories: [], nodeRadiusMode: 'category', nodeRadiusFunction: null,
            connectionRadiusMultiplier: 2, maxConnectionRadiusIncrease: 15,
            linkDescriptionFormatter: null, centralNodeId: null, initialZoomScale: 1.0,
            fixedCentralNodeDuration: 0,
        };
    }

    function _setupDimensions() {
        const visArea = document.querySelector('.visualization-area');
        const controlsPanel = document.querySelector('.controls-panel');
        Core.config.width = visArea.clientWidth - (controlsPanel ? controlsPanel.offsetWidth : 0);
        Core.config.height = window.innerHeight - Core.config.headerHeight; 
    }

    function _cacheDOMElements() {
        Core.ui.searchInput = document.getElementById('search-input');
        Core.ui.searchButton = document.getElementById('search-button');
        Core.ui.categoryButtons = document.querySelectorAll('.category-button');
        Core.ui.resetButton = document.getElementById('reset-view');
        Core.ui.infoButton = document.getElementById('info-button');
        Core.ui.infoModal = document.getElementById('info-modal');
        Core.ui.closeModal = document.getElementById('close-modal'); 
        Core.ui.nodePopup = document.getElementById('node-popup');
        Core.ui.popupTitle = document.getElementById('popup-title');
        Core.ui.popupCategory = document.getElementById('popup-category');
        Core.ui.popupYears = document.getElementById('popup-years'); 
        Core.ui.popupDescription = document.getElementById('popup-description');
        Core.ui.connectionsList = document.getElementById('connections-list'); 
        Core.ui.closePopup = document.getElementById('close-popup'); 
        Core.ui.linkStrength = document.getElementById('link-strength'); 
        Core.ui.chargeStrength = document.getElementById('charge-strength'); 
        Core.ui.nodeSize = document.getElementById('node-size'); 
        Core.ui.linkDistance = document.getElementById('link-distance'); 
        Core.ui.collapsibleHeaders = document.querySelectorAll('.control-parameters.collapsible .control-header');
    }

    function _setInitialSliderValuesFromConfig() {
        if (Core.ui.linkStrength) Core.ui.linkStrength.value = Core.config.linkStrength;
        if (Core.ui.chargeStrength) Core.ui.chargeStrength.value = Core.config.chargeStrength;
        if (Core.ui.nodeSize) Core.ui.nodeSize.value = Core.config.nodeBaseSize;
        if (Core.ui.linkDistance) Core.ui.linkDistance.value = Core.config.linkDistance;
    }

    function _setupSVG() {
        Core.svg = d3.select("#visualization")
            .attr("width", Core.config.width)
            .attr("height", Core.config.height);
        Core.svg.selectAll("*").remove(); 
        Core.g = Core.svg.append("g");
    }

    function _setupZoom() {
        const zoomBehavior = d3.zoom()
            .scaleExtent([0.1, 4])
            .on("zoom", (event) => {
                if (Core.g) Core.g.attr("transform", event.transform);
                Core.currentZoomTransform = event.transform;
            });

        if (Core.svg) {
            Core.svg.call(zoomBehavior)
                    .on("dblclick.zoom", null); // Disable double click zoom

            // Explicitly set the initial transform state for the zoom behavior
            // This helps prevent the jump on the first interaction.
            // We do this here and potentially again after centering a node.
            // d3.zoom().transform(Core.svg, Core.currentZoomTransform || d3.zoomIdentity); // Redundant if done in init
        }
    }

    function _setupColorScale() {
        Core.colorScale = d => {
            const category = d.category.replace('_', '-'); // Ensure kebab-case for CSS var name
            const colorVar = `--${category}-color`;
            let color = getComputedStyle(document.documentElement).getPropertyValue(colorVar).trim();
            if (!color || color === "null") { 
                console.warn(`CSS color variable ${colorVar} not found or invalid for category: ${d.category}. Using default #ccc.`);
                color = '#cccccc'; 
            }
            return color;
        };
    }

    function _deriveCategoriesAndSetupFilters() {
        // Derive categories from node data if not explicitly provided in config
        if (Core.config.categories.length === 0 && Core.nodesData.length > 0) {
            const uniqueCategories = new Set(Core.nodesData.map(n => n.category));
            Core.config.categories = Array.from(uniqueCategories);
        }
        Core.activeCategories = [...Core.config.categories]; // Initialize active categories

        // Setup category filter buttons based on derived/configured categories
        if (Core.ui.categoryButtons) {
            Core.ui.categoryButtons.forEach(button => {
                const btnCategory = button.dataset.category;
                if (Core.config.categories.includes(btnCategory)) {
                    button.style.display = ''; // Ensure button is visible
                    button.classList.add('active'); // All categories active by default
                } else {
                    button.style.display = 'none'; // Hide button if its category is not in the current dataset
                    button.classList.remove('active');
                }
            });
        }
    }

    function _setupSimulation() {
        Core.simulation = d3.forceSimulation(Core.nodesData)
            .force("link", d3.forceLink(Core.linksData).id(d => d.id)
                .distance(() => +Core.config.linkDistance) 
                .strength(() => +Core.config.linkStrength)) 
            .force("charge", d3.forceManyBody().strength(() => +Core.config.chargeStrength))
            .force("center", d3.forceCenter(Core.config.width / 2, Core.config.height / 2))
            .force("x", d3.forceX(Core.config.width / 2).strength(0.05)) 
            .force("y", d3.forceY(Core.config.height / 2).strength(0.05)) 
            .force("collide", d3.forceCollide().radius(d => _getNodeRadius(d) + 5)); 
        
        // Listener for simulation end to set stability flag (for initial centering)
        Core.simulation.on("end", () => {
            Core.isSimulationStable = true;
            console.log("Simulation ended and stabilized.");
        });
    }

    function _createGraphElements() {
        Core.linkElements = Core.g.append("g")
            .attr("class", "links")
            .selectAll("line")
            .data(Core.linksData, d => `${d.source.id || d.source}-${d.target.id || d.target}`) 
            .join("line") 
            .attr("class", "link")
            .attr('stroke-width', d => d.value ? Math.max(1, Math.sqrt(d.value)) : 1.5)
            .attr('stroke', '#999');

        Core.nodeElements = Core.g.append("g")
            .attr("class", "nodes")
            .selectAll(".node")
            .data(Core.nodesData, d => d.id) 
            .join("g") 
            .attr("class", d => `node ${d.category}`) 
            .attr("data-id", d => d.id)
            .call(d3.drag()
                .on("start", _dragstarted)
                .on("drag", _dragged)
                .on("end", _dragended)) 
            .on("click", _handleNodeClick)
            .on('mouseover', _handleNodeMouseover)
            .on('mouseout', _handleNodeMouseout);

        Core.nodeElements.append("circle")
            .attr("r", d => _getNodeRadius(d))
            .attr("fill", d => Core.colorScale(d))
            .attr("stroke", "#000")
            .attr("stroke-width", 2);

        Core.nodeElements.append("text")
            .attr("dy", d => _getNodeRadius(d) + 12)
            .attr("text-anchor", "middle")
            .text(d => d.name.length > 15 ? d.name.substring(0, 12) + "..." : d.name) 
            .attr("class", "node-label")
            .style("display", "block"); 
    }

    function _startSimulation() {
        if (Core.simulation) {
            Core.isSimulationStable = false; // Reset stability flag
            Core.simulation.nodes(Core.nodesData).on("tick", _ticked);
            Core.simulation.force("link").links(Core.linksData); 
            Core.simulation.alpha(1).restart(); 
        }
    }

    function _ticked() {
        if (Core.linkElements) {
            Core.linkElements
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);
        }
        if (Core.nodeElements) {
            Core.nodeElements
                .attr("transform", d => `translate(${d.x || 0},${d.y || 0})`);
        }
    }

    function _dragstarted(event, d) {
        if (!event.active && Core.simulation) Core.simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    }

    function _dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
    }

    function _dragended(event, d) {
        if (!event.active && Core.simulation) Core.simulation.alphaTarget(0);
        // If fixedCentralNodeDuration is not set for this node, release it.
        // This check assumes the central node being fixed is the only one that might need to stay fixed.
        // More complex logic would be needed if multiple nodes could be temporarily fixed.
        if (d.id !== Core.config.centralNodeId || Core.config.fixedCentralNodeDuration === 0) {
             d.fx = null; 
             d.fy = null;
        }
    }

    function _updateSimulationParameters() {
        if (!Core.simulation) return;
        Core.simulation.force("link")
            .distance(() => +Core.config.linkDistance) 
            .strength(() => +Core.config.linkStrength);
        Core.simulation.force("charge")
            .strength(() => +Core.config.chargeStrength);
        Core.simulation.force("collide") 
            .radius(d => _getNodeRadius(d) + 5);
        Core.simulation.alpha(0.3).restart(); 
    }
    
    function _redrawNodes() {
        if (Core.nodeElements) {
            Core.nodeElements.selectAll("circle")
                .transition().duration(100) 
                .attr("r", d => _getNodeRadius(d));
            Core.nodeElements.selectAll("text")
                .transition().duration(100)
                .attr("dy", d => _getNodeRadius(d) + 12);
        }
    }

    function _setupEventListeners() {
        window.addEventListener('resize', _handleResize);

        if (Core.ui.linkStrength) Core.ui.linkStrength.addEventListener('input', (e) => { Core.config.linkStrength = +e.target.value; _updateSimulationParameters(); });
        if (Core.ui.chargeStrength) Core.ui.chargeStrength.addEventListener('input', (e) => { Core.config.chargeStrength = +e.target.value; _updateSimulationParameters(); });
        if (Core.ui.nodeSize) Core.ui.nodeSize.addEventListener('input', (e) => { Core.config.nodeBaseSize = +e.target.value; _redrawNodes(); _updateSimulationParameters(); });
        if (Core.ui.linkDistance) Core.ui.linkDistance.addEventListener('input', (e) => { Core.config.linkDistance = +e.target.value; _updateSimulationParameters(); });

        if (Core.ui.searchButton) Core.ui.searchButton.addEventListener('click', _handleSearch); 
        if (Core.ui.searchInput) Core.ui.searchInput.addEventListener('input', _handleSearch); 
        if (Core.ui.searchInput) Core.ui.searchInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') { e.preventDefault(); _handleSearch(); }});


        if (Core.ui.categoryButtons) Core.ui.categoryButtons.forEach(button => button.addEventListener('click', _handleCategoryFilterClick));
        
        if (Core.ui.resetButton) Core.ui.resetButton.addEventListener('click', _handleResetView);

        if (Core.ui.infoButton) Core.ui.infoButton.addEventListener('click', () => { if (Core.ui.infoModal) Core.ui.infoModal.classList.add('visible'); });
        if (Core.ui.closeModal) Core.ui.closeModal.addEventListener('click', () => { if (Core.ui.infoModal) Core.ui.infoModal.classList.remove('visible'); });
        if (Core.ui.infoModal) Core.ui.infoModal.addEventListener('click', (e) => { if (e.target === Core.ui.infoModal) Core.ui.infoModal.classList.remove('visible');});

        if (Core.ui.closePopup) Core.ui.closePopup.addEventListener('click', _hideNodePopup);
        
        if (Core.ui.collapsibleHeaders) {
            Core.ui.collapsibleHeaders.forEach(header => {
                const content = header.nextElementSibling;
                const toggleButton = header.querySelector('.toggle-button');
                header.addEventListener('click', () => {
                    if (content && content.classList.contains('control-content')) {
                        content.classList.toggle('visible');
                        if (toggleButton) toggleButton.textContent = content.classList.contains('visible') ? '▲' : '▼';
                    }
                });
            });
        }
    }

    function _handleResize() {
        _setupDimensions();
        if (Core.svg) Core.svg.attr("width", Core.config.width).attr("height", Core.config.height);
        if (Core.simulation) {
            Core.simulation.force("center", d3.forceCenter(Core.config.width / 2, Core.config.height / 2));
            Core.simulation.force("x", d3.forceX(Core.config.width / 2).strength(0.05));
            Core.simulation.force("y", d3.forceY(Core.config.height / 2).strength(0.05));
            Core.simulation.alpha(0.3).restart();
        }
    }

    function _handleSearch() {
        if (!Core.ui.searchInput) return;
        const searchTerm = Core.ui.searchInput.value.toLowerCase().trim();
        _hideNodePopup(); 

        if (searchTerm === "") {
            _clearSearchHighlights();
            _applyCategoryFilters(); 
            return;
        }

        const matchingNodes = Core.nodesData.filter(node =>
            node.name.toLowerCase().includes(searchTerm) ||
            (node.description && node.description.toLowerCase().includes(searchTerm))
        );
        const matchingNodeIds = new Set(matchingNodes.map(n => n.id));

        if (Core.nodeElements) {
            Core.nodeElements.classed('search-dimmed', d => !matchingNodeIds.has(d.id));
            Core.nodeElements.filter(d => matchingNodeIds.has(d.id))
                .classed('search-match', true)
                .classed('search-dimmed', false); 
        }
        
        if (Core.linkElements) {
            Core.linkElements.classed('search-dimmed', d => {
                const sourceId = typeof d.source === 'object' ? d.source.id : d.source;
                const targetId = typeof d.target === 'object' ? d.target.id : d.target;
                return !matchingNodeIds.has(sourceId) || !matchingNodeIds.has(targetId);
            });
        }
    }
    
    function _clearSearchHighlights() {
        if(Core.nodeElements) Core.nodeElements.classed('search-match', false).classed('search-dimmed', false);
        if(Core.linkElements) Core.linkElements.classed('search-dimmed', false);
    }

    function _handleCategoryFilterClick(event) {
        const button = event.currentTarget;
        const category = button.dataset.category;
        button.classList.toggle('active');
        _hideNodePopup();

        if (button.classList.contains('active')) {
            if (!Core.activeCategories.includes(category)) Core.activeCategories.push(category);
        } else {
            Core.activeCategories = Core.activeCategories.filter(cat => cat !== category);
        }
        _applyCategoryFilters();
    }
    
    function _applyCategoryFilters() {
        _clearSearchHighlights(); 
        if(Core.ui.searchInput) Core.ui.searchInput.value = '';

        if(Core.nodeElements) {
            Core.nodeElements.style("display", d => Core.activeCategories.includes(d.category) ? "block" : "none");
        }
        if(Core.linkElements) {
            Core.linkElements.style("display", d => {
                const sourceNode = Core.nodesData.find(n => n.id === (typeof d.source === 'object' ? d.source.id : d.source));
                const targetNode = Core.nodesData.find(n => n.id === (typeof d.target === 'object' ? d.target.id : d.target));
                return sourceNode && targetNode && Core.activeCategories.includes(sourceNode.category) && Core.activeCategories.includes(targetNode.category) ? "inline" : "none";
            });
        }
        if (Core.simulation) {
            Core.simulation.alpha(0.1).restart();
        }
    }

    function _handleResetView() {
        _hideNodePopup();
        if (Core.svg) Core.svg.transition().duration(750).call(d3.zoom().transform, d3.zoomIdentity);
        Core.currentZoomTransform = d3.zoomIdentity;

        // Reset config to true initial defaults
        _resetCoreConfigToDefaults(); // This resets Core.config
        // If userConfig was passed to init, it needs to be re-applied if those are the "true" defaults for the page
        // For simplicity now, _resetCoreConfigToDefaults() sets hardcoded library defaults.
        // Topic-specific main.js would need to re-call CoreViz.init or have a CoreViz.reconfigure()
        // if its userConfig defaults are different from library defaults.
        // For now, let's assume reset brings back to library defaults:
        const topicUserConfig = window.currentVizConfig || {}; // Topic main.js should set this global if it wants to preserve its own defaults on reset
        Object.assign(Core.config, topicUserConfig);


        _setInitialSliderValuesFromConfig(); 

        Core.activeCategories = [...Core.config.categories]; // Re-derive or use initial
         _deriveCategoriesAndSetupFilters(); // This will re-evaluate which buttons are active/visible
        _applyCategoryFilters(); 

        _redrawNodes();
        _updateSimulationParameters();
        if (Core.simulation) Core.simulation.alpha(0.3).restart();
    }

    function _handleNodeClick(event, d) {
        event.stopPropagation(); 
        _showNodePopup(d, this); 
    }
    
    function _handleNodeMouseover(event, d) {
        if (!Core.nodeElements || !Core.linkElements) return;
        const currentSelection = d3.select(event.currentTarget);

        currentSelection.select('circle').attr('stroke-width', 3.5).attr('stroke', '#000');

        Core.linkElements
            .style('stroke', l => {
                const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
                const targetId = typeof l.target === 'object' ? l.target.id : l.target;
                return (sourceId === d.id || targetId === d.id) ? '#333' : '#999';
            })
            .style('stroke-width', l => {
                const baseWidth = l.value ? Math.max(1,Math.sqrt(l.value)) : 1.5;
                const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
                const targetId = typeof l.target === 'object' ? l.target.id : l.target;
                return (sourceId === d.id || targetId === d.id) ? baseWidth + 1 : baseWidth;
            });

        const connectedNodeIds = new Set();
        Core.linksData.forEach(link => {
            const sourceId = typeof l.source === 'object' ? l.source.id : l.source;
            const targetId = typeof l.target === 'object' ? l.target.id : l.target;
            if (sourceId === d.id) connectedNodeIds.add(targetId);
            if (targetId === d.id) connectedNodeIds.add(sourceId);
        });

        Core.nodeElements.filter(n => connectedNodeIds.has(n.id))
            .select('circle').attr('stroke-width', 3).attr('stroke', '#555');
    }

    function _handleNodeMouseout() { // Removed unused 'd' parameter
         if (!Core.nodeElements || !Core.linkElements) return;
        
        Core.nodeElements.selectAll('circle').attr('stroke-width', 2).attr('stroke', '#000'); 
        if (Core.ui.nodePopup && Core.ui.nodePopup.classList.contains('visible')) {
            const selectedNodeId = Core.ui.popupTitle.dataset.nodeid; 
            if (selectedNodeId) {
                 Core.nodeElements.filter(n => n.id === selectedNodeId)
                    .select('circle').attr('stroke-width', 4).attr('stroke', '#ff3e3e');
            }
        }

        Core.linkElements
            .style('stroke', '#999')
            .style('stroke-width', l => l.value ? Math.max(1,Math.sqrt(l.value)) : 1.5);
    }

    function _showNodePopup(nodeData, domElement) {
        if (!Core.ui.nodePopup || !Core.ui.popupTitle || !Core.ui.popupCategory || !Core.ui.popupYears || !Core.ui.popupDescription || !Core.ui.connectionsList) {
            console.error("Popup UI elements not cached correctly.");
            return;
        }

        d3.selectAll(".node circle").attr("stroke-width", 2).attr("stroke", "#000"); 
        if (domElement) {
            d3.select(domElement).select("circle").attr("stroke-width", 4).attr("stroke", "#ff3e3e"); 
        }

        Core.ui.popupTitle.textContent = nodeData.name;
        Core.ui.popupTitle.dataset.nodeid = nodeData.id; 
        Core.ui.popupCategory.textContent = `Category: ${nodeData.category.charAt(0).toUpperCase() + nodeData.category.slice(1).replace(/_/g, ' ')}`; // Replace underscores too
        
        let yearsOrDateText = nodeData.years || nodeData.date || '';
        if ( (nodeData.category === 'philosopher' || nodeData.category === 'influence' || nodeData.category === 'character' ) && nodeData.years) yearsOrDateText = `(${yearsOrDateText})`;
        else if ( (nodeData.category === 'text' || nodeData.category === 'event') && nodeData.date) yearsOrDateText = `(${yearsOrDateText})`;
        else yearsOrDateText = ''; 

        Core.ui.popupYears.textContent = yearsOrDateText;
        Core.ui.popupYears.style.display = yearsOrDateText ? 'block' : 'none';
        Core.ui.popupDescription.textContent = nodeData.description || "No description available.";

        // Link Description Formatting
        const formatLink = Core.config.linkDescriptionFormatter || function(linkData, sourceNodeName, targetNodeName, isOutgoing) {
            let desc = linkData.description || (isOutgoing ? '→' : '←');
            return isOutgoing ? `${sourceNodeName} ${desc} ${targetNodeName}` : `${targetNodeName} ${desc} ${sourceNodeName}`;
        };

        const connections = [];
        Core.linksData.forEach(linkData => {
            const sourceId = typeof linkData.source === 'object' ? linkData.source.id : linkData.source;
            const targetId = typeof linkData.target === 'object' ? linkData.target.id : linkData.target;

            if (sourceId === nodeData.id) {
                const targetNode = Core.nodesData.find(n => n.id === targetId);
                if (targetNode) connections.push(formatLink(linkData, nodeData.name, targetNode.name, true));
            } else if (targetId === nodeData.id) {
                const sourceNode = Core.nodesData.find(n => n.id === sourceId);
                if (sourceNode) connections.push(formatLink(linkData, nodeData.name, sourceNode.name, false));
            }
        });
        
        Core.ui.connectionsList.innerHTML = ""; 
        if (connections.length > 0) {
            connections.forEach(connText => {
                const li = document.createElement('li');
                li.textContent = connText;
                Core.ui.connectionsList.appendChild(li);
            });
        } else {
            Core.ui.connectionsList.innerHTML = '<li>No direct connections in this view.</li>';
        }
        
        Core.ui.nodePopup.classList.add('visible');
    }

    function _hideNodePopup() {
        if (Core.ui.nodePopup) Core.ui.nodePopup.classList.remove('visible');
        if (Core.ui.popupTitle) Core.ui.popupTitle.dataset.nodeid = ''; 
        d3.selectAll(".node circle").attr("stroke-width", 2).attr("stroke", "#000");
    }

    function _getNodeRadius(d) {
        const baseSize = +Core.config.nodeBaseSize; 
        if (typeof Core.config.nodeRadiusFunction === 'function') {
            return Core.config.nodeRadiusFunction(d, baseSize, Core.nodesData, Core.linksData);
        }

        if (Core.config.nodeRadiusMode === 'connections') {
            let radius = baseSize;
            const connections = Core.linksData.filter(link => {
                const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
                const targetId = typeof link.target === 'object' ? link.target.id : link.target;
                return sourceId === d.id || targetId === d.id;
            });
            if (connections.length > 0) {
                radius = baseSize + Math.min(
                    Math.sqrt(connections.length) * Core.config.connectionRadiusMultiplier,
                    Core.config.maxConnectionRadiusIncrease
                );
            }
            return Math.max(baseSize * 0.75, radius); // Ensure a minimum sensible size
        }
        
        // Default to category-based sizing
        const defaultCategorySizes = {
            'concept': 1.2, 'shared_concept': 1.1, 'philosopher': 1.3,
            'influence': 1.1, 'text': 0.9, 'movement': 1.0,
            'field': 0.9, 'scientist': 1.1, 'event': 0.9,
            'poet': 1.0, 'writer': 1.0, 'character': 1.0,
            'critique': 1.0,
        };
        const multiplier = defaultCategorySizes[d.category] || 1.0;
        return baseSize * multiplier;
    }

    function _centerOnNodeWhenReady(nodeId, isInitialAttempt = false) {
        const targetNode = Core.nodesData.find(n => n.id === nodeId);
        if (!targetNode || !Core.svg || !Core.currentZoomTransform) return;

        const attemptCentering = () => {
            if (typeof targetNode.x !== 'undefined' && typeof targetNode.y !== 'undefined') {
                const scale = Core.config.initialZoomScale; // Use configured initial scale
                const x = Core.config.width / 2 - targetNode.x * scale;
                const y = Core.config.height / 2 - targetNode.y * scale;
                const transform = d3.zoomIdentity.translate(x, y).scale(scale);
                
                Core.svg.transition().duration(isInitialAttempt ? 0 : 750).call(d3.zoom().transform, transform);
                Core.currentZoomTransform = transform;

                // Temporarily fix the node if duration is set
                if (isInitialAttempt && Core.config.fixedCentralNodeDuration > 0) {
                    targetNode.fx = targetNode.x;
                    targetNode.fy = targetNode.y;
                    if (Core.centralNodeFixTimeout) clearTimeout(Core.centralNodeFixTimeout); // Clear previous timeout
                    Core.centralNodeFixTimeout = setTimeout(() => {
                        if (targetNode.id === Core.config.centralNodeId) { // Check if still the central node
                            targetNode.fx = null;
                            targetNode.fy = null;
                            if(Core.simulation) Core.simulation.alphaTarget(0).alpha(0.1).restart(); // Nudge simulation
                        }
                    }, Core.config.fixedCentralNodeDuration);
                }

            } else {
                console.warn(`Coordinates for node ${nodeId} not ready for centering.`);
            }
        };

        if (typeof targetNode.x !== 'undefined' && typeof targetNode.y !== 'undefined') {
            attemptCentering();
        } else if (isInitialAttempt && Core.simulation) { 
            let retries = 0;
            const maxRetries = 20; // Increased max retries (e.g. 20 * 100ms = 2s)
            const intervalId = setInterval(() => {
                retries++;
                if (typeof targetNode.x !== 'undefined' && typeof targetNode.y !== 'undefined') {
                    clearInterval(intervalId);
                    attemptCentering(); 
                } else if (retries >= maxRetries) {
                    clearInterval(intervalId);
                    console.warn(`Could not center on node ${nodeId}: coordinates not available after ${maxRetries} retries.`);
                }
            }, 100); // Check more frequently
        }
    }

    window.CoreViz = {
        init: initializeVisualization,
    };

})(d3);