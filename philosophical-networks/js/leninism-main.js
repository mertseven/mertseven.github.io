// js/leninism-main.js

document.addEventListener('DOMContentLoaded', function() {
    // Configuration specific to the Leninism visualization
    const leninismConfig = {
        // Leninism visualization will use the default 'category' node sizing mode.
        // The original leninism-main.js had special sizing for the 'lenin' node.
        // We can achieve this with a custom nodeRadiusFunction if desired,
        // or by adjusting the base size for 'philosopher' if Lenin is the primary one.
        // For now, let's make 'philosopher' nodes (which includes Lenin) a bit larger.
        // This will be handled by the default category sizing in CoreViz if 'philosopher' is defined there.
        
        // Example of making 'philosopher' nodes specifically larger here if needed:
        // nodeRadiusFunction: function(d, baseSize) {
        //     if (d.id === 'lenin' || d.category === 'philosopher') return baseSize * 1.5; 
        //     // Fallback to default logic in CoreViz
        //     // This needs CoreViz to expose its default sizing or for us to replicate it here
        //     const defaultSizes = { /* from CoreViz _getNodeRadius */ };
        //     return defaultSizes[d.category] || baseSize;
        // },


        // Central node for initial focus
        centralNodeId: 'lenin',

        // If we wanted to temporarily fix Lenin's node as in the original leninism-main.js,
        // we would need to add a new config option to CoreViz like 'fixedCentralNodeDuration: 2000' (ms)
        // and implement that logic in CoreViz's _centerOnNodeWhenReady or a related function.
        // For now, centralNodeId will just center it without fixing.
    };

    // Initialize the visualization using the CoreViz system
    if (window.CoreViz && window.CoreViz.init) {
        window.CoreViz.init(leninismData.nodes, leninismData.links, leninismConfig);
    } else {
        console.error("CoreViz not loaded. Ensure visualization-core.js is included before this script.");
    }

    // Any JavaScript logic that is TRULY UNIQUE to the Leninism visualization
    // and cannot be generalized into visualization-core.js would go here.
});