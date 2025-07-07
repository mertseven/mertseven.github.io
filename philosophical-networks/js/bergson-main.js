// js/bergson-main.js

document.addEventListener('DOMContentLoaded', function() {
    // Configuration specific to the Bergson visualization
    const bergsonConfig = {
        // Bergson visualization will use the default 'category' node sizing mode.
        // No specific nodeRadiusFunction or nodeRadiusMode needed unless
        // a different behavior from the CoreViz default is desired.
        
        // Example: If Bergson's 'concept' nodes should be slightly smaller
        // nodeRadiusFunction: function(d, baseSize) {
        //    if (d.category === 'concept') return baseSize * 1.1;
        //    // Fallback to default CoreViz logic for other categories
        //    return window.CoreViz._getNodeRadiusDefault(d, baseSize); // Assuming CoreViz exposes a default helper
        // },

        // Central node for initial focus, if any
        centralNodeId: 'bergson',
    };

    // Initialize the visualization using the CoreViz system
    if (window.CoreViz && window.CoreViz.init) {
        window.CoreViz.init(bergsonData.nodes, bergsonData.links, bergsonConfig);
    } else {
        console.error("CoreViz not loaded. Ensure visualization-core.js is included before this script.");
    }

    // Any JavaScript logic that is TRULY UNIQUE to the Bergson visualization
    // and cannot be generalized into visualization-core.js would go here.
});