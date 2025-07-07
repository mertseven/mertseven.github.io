// js/romanticism-main.js

document.addEventListener('DOMContentLoaded', function() {
    // Configuration specific to the Romanticism visualization
    const romanticismConfig = {
        // Example: If Romanticism nodes should be slightly larger by default
        // nodeBaseSize: 12, 

        // Custom node radius logic if needed for Romanticism
        // nodeRadiusFunction: function(d, baseSize) {
        //    if (d.category === 'poet') return baseSize * 1.4;
        //    if (d.category === 'shared_concept') return baseSize * 0.8;
        //    // Fallback to default logic in CoreViz if not specified here
        //    return CoreViz.getNodeRadius(d); // This would call the default if CoreViz exposes it
        // },
        
        // Any other specific configurations for Romanticism
    };

    // Initialize the visualization using the CoreViz system
    if (window.CoreViz && window.CoreViz.init) {
        window.CoreViz.init(romanticismData.nodes, romanticismData.links, romanticismConfig);
    } else {
        console.error("CoreViz not loaded. Ensure visualization-core.js is included before this script.");
    }

    // Any JavaScript logic that is TRULY UNIQUE to the Romanticism visualization
    // and cannot be generalized into visualization-core.js would go here.
    // For example, if Romanticism had a special interaction on "shared_concept" nodes:
    // d3.selectAll('.node.shared_concept').on('dblclick', function(event, d) {
    //     alert(`Shared Concept: ${d.name} - bridging Enlightenment and Romanticism!`);
    // });
});