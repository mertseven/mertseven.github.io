// js/hegel-main.js

document.addEventListener('DOMContentLoaded', function() {
    // Configuration specific to the Hegel visualization
    const hegelConfig = {
        // Hegel visualization uses node size based on connections
        // and also link width based on 'value' property.
        // The core can handle link 'value' by default.
        // For node radius, we'll tell the core to use a specific mode or pass a function.

        nodeRadiusMode: 'connections', // A new config option for CoreViz
        // Alternatively, we could define the function directly here:
        // nodeRadiusFunction: function(d, baseSize, allNodes, allLinks) {
        //     let radius = baseSize;
        //     const connections = allLinks.filter(link => {
        //         const sourceId = typeof link.source === 'object' ? link.source.id : link.source;
        //         const targetId = typeof link.target === 'object' ? link.target.id : link.target;
        //         return sourceId === d.id || targetId === d.id;
        //     });
        //     if (connections.length > 0) {
        //         radius = baseSize + Math.min(Math.sqrt(connections.length) * 2, 15); // Max increase of 15
        //     }
        //     return radius;
        // },

        // Specific node to center on load, if desired
        centralNodeId: 'hegel',
    };

    // Initialize the visualization using the CoreViz system
    if (window.CoreViz && window.CoreViz.init) {
        window.CoreViz.init(hegelData.nodes, hegelData.links, hegelConfig);
    } else {
        console.error("CoreViz not loaded. Ensure visualization-core.js is included before this script.");
    }

    // Any JavaScript logic that is TRULY UNIQUE to the Hegel visualization
    // and cannot be generalized into visualization-core.js would go here.
    // For instance, the original hegel-main.js had a slightly different
    // search result highlighting (using CSS classes directly on nodes/links).
    // If that specific highlighting is preferred ONLY for Hegel, parts of it might live here,
    // or we'd make the core's search highlighting more configurable.
    // For now, we'll rely on the core's default search highlighting.
});