// js/marxism-main.js

document.addEventListener('DOMContentLoaded', function() {
    // Configuration specific to the Marxism visualization
    const marxismConfig = {
        // Marxism visualization will use the default 'category' node sizing mode.
        // No specific nodeRadiusFunction or nodeRadiusMode needed unless
        // a different behavior from the CoreViz default is desired.

        // Example: If we wanted Marxism's 'philosopher' nodes to be extra large:
        // nodeRadiusFunction: function(d, baseSize) {
        //     if (d.category === 'philosopher') return baseSize * 1.5;
        //     // For other categories, you might call a default provided by CoreViz or define them all
        //     // This is just an example of overriding
        //     const sizes = { /* ... other category sizes ... */ };
        //     return sizes[d.category] || baseSize;
        // },

        // Central node for initial focus, if any
        // centralNodeId: 'marx',
    };

    // Initialize the visualization using the CoreViz system
    if (window.CoreViz && window.CoreViz.init) {
        window.CoreViz.init(marxismData.nodes, marxismData.links, marxismConfig);
    } else {
        console.error("CoreViz not loaded. Ensure visualization-core.js is included before this script.");
    }

    // Any JavaScript logic that is TRULY UNIQUE to the Marxism visualization
    // and cannot be generalized into visualization-core.js would go here.
});