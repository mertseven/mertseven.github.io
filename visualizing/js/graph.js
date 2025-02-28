/**
 * Graph visualization module using D3.js
 * Creates an interactive network graph visualization
 */

/**
 * Create a network visualization
 * @param {Object} data - The article data with connections
 * @param {string} containerId - The ID of the container element
 * @returns {Object} - Object with methods to control the visualization
 */
function createVisualization(data, containerId) {
    const container = document.getElementById(containerId);
    
    if (!container) {
        console.error(`Container element not found: ${containerId}`);
        return null;
    }
    
    // Clear any existing content
    container.innerHTML = '';
    
    // Set dimensions
    const width = container.clientWidth;
    const height = container.clientHeight;
    
    // Calculate center position
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Create SVG element
    const svg = d3.select(container)
        .append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", [0, 0, width, height])
        .attr("class", "visualization");
    
    // Create group for all elements
    const g = svg.append("g")
        .attr("transform", `translate(${centerX}, ${centerY})`);
    
    // Create central node
    const centralNode = g.append("g")
        .attr("class", "central-node")
        .on("click", () => handleCentralNodeClick(data));
    
    centralNode.append("circle")
        .attr("r", 60)
        .attr("fill", "#1a1a2e")
        .attr("stroke", "#2d2d42")
        .attr("stroke-width", 2);
    
    // Add central node text (split into lines if needed)
    addWrappedText(centralNode, data.title, 0, 0, 110);
    
    // Calculate positions for child nodes in a circular layout
    const nodeCount = data.connections.length;
    const radius = Math.min(width, height) * 0.35; // Radius based on container size
    
    // Create child nodes
    data.connections.forEach((connection, i) => {
        // Calculate position based on angle
        const angle = (i * (2 * Math.PI / nodeCount));
        const x = radius * Math.cos(angle);
        const y = radius * Math.sin(angle);
        
        // Add connection line
        g.append("line")
            .attr("class", `connection connection-${connection.id}`)
            .attr("x1", 0)
            .attr("y1", 0)
            .attr("x2", x)
            .attr("y2", y)
            .attr("stroke", getCategoryColor(connection.category))
            .attr("stroke-width", 1.5)
            .attr("opacity", 0.7);
        
        // Create node group
        const node = g.append("g")
            .attr("class", `node node-${connection.id}`)
            .attr("transform", `translate(${x}, ${y})`)
            .attr("data-id", connection.id)
            .attr("data-category", connection.category)
            .on("click", () => handleNodeClick(connection))
            .on("mouseenter", () => showTooltip(connection))
            .on("mouseleave", hideTooltip);
        
        // Add node circle
        node.append("circle")
            .attr("r", 6)
            .attr("fill", getCategoryColor(connection.category));
        
        // Add node label
        node.append("text")
            .attr("text-anchor", x > 0 ? "start" : "end")
            .attr("dominant-baseline", "middle")
            .attr("dx", x > 0 ? 12 : -12)
            .attr("dy", 0)
            .attr("fill", getCategoryColor(connection.category))
            .text(connection.title);
    });
    
    // Add zoom behavior
    const zoom = d3.zoom()
        .scaleExtent([0.5, 2.5])
        .on("zoom", (event) => {
            g.attr("transform", event.transform);
        });
    
    svg.call(zoom);
    
    // Add double-click to reset zoom
    svg.on("dblclick.zoom", () => {
        svg.transition()
            .duration(750)
            .call(zoom.transform, d3.zoomIdentity.translate(centerX, centerY));
    });
    
    // Return an object with methods to control the visualization
    return {
        highlightNodes: (nodeIds) => {
            // Dim all nodes and connections
            svg.selectAll(".node, .connection")
                .transition()
                .duration(300)
                .attr("opacity", 0.2);
            
            // Highlight central node
            svg.select(".central-node")
                .transition()
                .duration(300)
                .attr("opacity", 1);
            
            // Highlight selected nodes and their connections
            nodeIds.forEach(id => {
                svg.selectAll(`.node-${id}, .connection-${id}`)
                    .transition()
                    .duration(300)
                    .attr("opacity", 1);
            });
        },
        resetHighlight: () => {
            svg.selectAll(".node, .connection, .central-node")
                .transition()
                .duration(300)
                .attr("opacity", 1);
        }
    };
}

/**
 * Add wrapped text to an SVG element
 * @param {d3.Selection} parent - The parent element to add text to
 * @param {string} text - The text to add
 * @param {number} x - The x position
 * @param {number} y - The y position
 * @param {number} width - The maximum width for wrapping
 */
function addWrappedText(parent, text, x, y, width) {
    const words = text.split(/\s+/);
    const lineHeight = 1.1; // ems
    
    let line = [];
    let lineNumber = 0;
    const tspan = parent.append("text")
        .attr("text-anchor", "middle")
        .attr("fill", "#ffffff")
        .attr("x", x)
        .attr("y", y)
        .append("tspan")
        .attr("x", x)
        .attr("y", y)
        .attr("dy", 0);
    
    let currentLine = "";
    
    words.forEach(word => {
        line.push(word);
        tspan.text(line.join(" "));
        
        if (tspan.node().getComputedTextLength() > width) {
            line.pop();
            const lineText = line.join(" ");
            tspan.text(lineText);
            
            line = [word];
            tspan = parent.select("text")
                .append("tspan")
                .attr("x", x)
                .attr("y", y)
                .attr("dy", ++lineNumber * lineHeight + "em")
                .text(word);
        }
    });
    
    // Center the text vertically based on number of lines
    const totalLines = lineNumber + 1;
    const totalHeight = totalLines * lineHeight;
    const startY = y - (totalHeight / 2) * 0.8; // 0.8 is a factor to adjust the centering
    
    parent.selectAll("tspan")
        .attr("dy", (d, i) => (startY + i * lineHeight) + "em");
}

/**
 * Get color for a category
 * @param {string} category - The category name
 * @returns {string} - The color for the category
 */
function getCategoryColor(category) {
    const colorMap = {
        "dynamical": "#4ECDC4",  // Teal
        "substance": "#1A535C",  // Dark teal
        "method": "#3D348B",     // Purple
        "influence": "#F7FFF7",  // White-ish
        "theory": "#FF6B6B"      // Red
    };
    
    return colorMap[category] || "#cccccc"; // Default to gray
}

/**
 * Handle click on a node
 * @param {Object} connection - The connection data for the clicked node
 */
function handleNodeClick(connection) {
    // Update the article details in the sidebar
    updateNodeInfo(connection);
    
    // Highlight this node and related nodes
    if (window.visualization && connection.relatedNodes) {
        window.visualization.highlightNodes([connection.id, ...connection.relatedNodes]);
    }
    
    console.log(`Node clicked: ${connection.title}`);
}

/**
 * Handle click on the central node
 * @param {Object} data - The central node data
 */
function handleCentralNodeClick(data) {
    // Update the article details in the sidebar
    updateArticleDetails(data);
    
    // Reset any highlighting
    if (window.visualization) {
        window.visualization.resetHighlight();
    }
    
    console.log('Central node clicked');
}

/**
 * Update node information in the UI
 * @param {Object} connection - The connection data
 */
function updateNodeInfo(connection) {
    const titleElement = document.getElementById('article-title');
    const descriptionElement = document.getElementById('article-description');
    
    if (titleElement) {
        titleElement.textContent = connection.title;
    }
    
    if (descriptionElement && connection.description) {
        descriptionElement.textContent = connection.description;
    }
}

/**
 * Show tooltip for a connection
 * @param {Object} connection - The connection data
 */
function showTooltip(connection) {
    const tooltip = document.getElementById('node-tooltip');
    
    if (!tooltip) return;
    
    // Set tooltip content
    tooltip.innerHTML = `
        <div>
            <h4 style="margin-bottom: 5px; color: ${getCategoryColor(connection.category)}">${connection.title}</h4>
            <p style="font-size: 0.8rem; margin: 0;">${connection.description || ''}</p>
        </div>
    `;
    
    // Show tooltip
    tooltip.style.opacity = '1';
}

/**
 * Hide the tooltip
 */
function hideTooltip() {
    const tooltip = document.getElementById('node-tooltip');
    
    if (tooltip) {
        tooltip.style.opacity = '0';
    }
}
