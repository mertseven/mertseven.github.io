// js/nietzsche-main.js

document.addEventListener('DOMContentLoaded', function() {
    // Configuration specific to the Nietzsche visualization
    const nietzscheConfig = {
        // Nietzsche visualization will use the default 'category' node sizing mode.
        // No specific nodeRadiusFunction or nodeRadiusMode needed unless
        // a different behavior from the CoreViz default is desired.

        // Example of how you might slightly adjust default parameters if needed:
        // chargeStrength: -600, // Make repulsion slightly stronger for this graph
        // linkDistance: 160,   // Increase default link distance

        // Central node for initial focus, if any
        centralNodeId: 'nietzsche',
    };

    // Initialize the visualization using the CoreViz system
    if (window.CoreViz && window.CoreViz.init) {
        window.CoreViz.init(nietzscheData.nodes, nietzscheData.links, nietzscheConfig);
    } else {
        console.error("CoreViz not loaded. Ensure visualization-core.js is included before this script.");
    }

    // Any JavaScript logic that is TRULY UNIQUE to the Nietzsche visualization
    // and cannot be generalized into visualization-core.js would go here.
});